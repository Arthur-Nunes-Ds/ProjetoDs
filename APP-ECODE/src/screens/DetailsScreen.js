import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { Menu, X, Plus, Settings, HelpCircle, Activity, User, LogOut, DollarSign, Zap, Droplet, Box, Flame, History, Cpu, Sparkles, Users } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Importações do projeto reestruturado
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calcularMediaHistorica, detectarAnomalia, calcularCO2, calcularImpactoVerde, calcularEcoScore } from '../utils/ecoUtils';
import { checkAchievements } from '../services/achievementService';

const screenWidth = Dimensions.get("window").width;

export default function DetailsScreen({ navigation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [anomalies, setAnomalies] = useState([]);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Estado que receberá os dados reais da API
  const [dados, setDados] = useState({
    energia: 0,
    agua: 0,
    residuos: 0,
    metaEnergia: 0,
    metaAgua: 0,
    metaGas: 0,
    metaEnergiaVal: 0,
    metaAguaVal: 0,
    metaGasVal: 0,
    ecoScore: 100,
    dica: "Carregando dica sustentável...",
    historicoEnergia: [0, 0, 0, 0, 0, 0],
    historicoAgua: [0, 0, 0, 0, 0, 0],
    historicoGas: [0, 0, 0, 0, 0, 0]
  });

  const [rates, setRates] = useState({
    energy: 0.95,
    water: 0.01,
    gas: 7.50
  });

  const [viewMode, setViewMode] = useState('units'); // 'units' ou 'cost'

  const [usuario, setUsuario] = useState({ nome: 'Usuário', email: '' });

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Bem-vindo ao ECODE! 🌱",
      desc: "Vamos transformar seus hábitos em um impacto positivo para o planeta.",
      icon: <Sparkles size={60} color="#facc15" />
    },
    {
      title: "Eco-Score",
      desc: "Sua pontuação geral de sustentabilidade. Mantenha-a no verde cumprindo suas metas!",
      icon: <Activity size={60} color="#4ade80" />
    }
  ];

  const checkTutorial = async () => {
    const seen = await AsyncStorage.getItem('@tutorial_seen');
    if (!seen) {
      setShowTutorial(true);
    }
  };

  // Função para buscar os dados do Dashboard na API
  const buscarDadosDashboard = async () => {
    checkTutorial();
    setIsLoading(true);
    try {
      // 0. Carregar Tarifas
      const savedRates = await AsyncStorage.getItem('@consumption_rates');
      let currentRates = { energy: 0.95, water: 0.01, gas: 7.50 };
      if (savedRates) {
        const parsed = JSON.parse(savedRates);
        currentRates = {
          energy: parseFloat(parsed.energy),
          water: parseFloat(parsed.water),
          gas: parseFloat(parsed.gas)
        };
        setRates(currentRates);
      }

      const token = await AsyncStorage.getItem('@jwt_token');
      
      if (!token) {
        Alert.alert('Sessão Inválida', 'Por favor, faça login novamente.');
        navigation.replace('Login');
        return;
      }

      // --- MODO DEBUG ---
      if (token === 'DEBUG_TOKEN') {
        setUsuario({ nome: 'Dev Teste', email: 'debug@echo.de' });
        setDados({
          energia: 120.5,
          agua: 15.2,
          residuos: 8.4,
          metaEnergia: 75,
          metaAgua: 60,
          metaGas: 45,
          metaEnergiaVal: 200,
          metaAguaVal: 25,
          metaGasVal: 20,
          dica: "MODO DEBUG ATIVO: Você está vendo dados simulados para teste de interface.",
          historicoEnergia: [100, 120, 115, 130, 110, 120],
          historicoAgua: [12, 15, 14, 18, 15, 16],
          historicoGas: [7, 9, 8, 10, 8, 9]
        });
        setIsLoading(false);
        return;
      }

      // 1. Buscar dados de forma resiliente
      let consumos = [];
      let metas = [];
      let user = {};

      try {
        const res = await api.get('/consumo/Listar_Consumos', { headers: { Authorization: `Bearer ${token}` } });
        consumos = res.data.mensagem || [];
      } catch (e) { console.log('Erro ao buscar consumos:', e.message); }

      try {
        const res = await api.get('/meta/Listar_Metas', { headers: { Authorization: `Bearer ${token}` } });
        metas = res.data.mensagem || [];
      } catch (e) { console.log('Erro ao buscar metas:', e.message); }

      try {
        const res = await api.get('/user/Dados_User', { headers: { Authorization: `Bearer ${token}` } });
        user = res.data.mensagem || {};
      } catch (e) { console.log('Erro ao buscar dados do usuário:', e.message); }

      setUsuario({ nome: user.nome || 'Usuário', email: user.email || '' });

      // 2. Processar consumos (agrupar por tipo)
      let energiaSum = 0;
      let aguaSum = 0;
      let gasSum = 0;
      
      const getHistoricoPorTipo = (termos) => {
        const filtrado = consumos
          .filter(c => {
            if (!c.tipoConsumo) return false;
            const nome = c.tipoConsumo.toLowerCase();
            return termos.some(t => nome.includes(t));
          })
          .slice(0, 6)
          .map(c => c.valor)
          .reverse();
        while(filtrado.length < 6) filtrado.unshift(0);
        return filtrado;
      };

      const hEnergia = getHistoricoPorTipo(['energia']);
      const hAgua = getHistoricoPorTipo(['agua', 'água']);
      const hGas = getHistoricoPorTipo(['gas', 'gás']);

      consumos.forEach(item => {
        if (!item.tipoConsumo) return;
        const nome = item.tipoConsumo.toLowerCase();
        if (nome.includes('energia')) energiaSum += item.valor;
        else if (nome.includes('agua') || nome.includes('água')) aguaSum += item.valor;
        else if (nome.includes('gas') || nome.includes('gás')) gasSum += item.valor;
      });

      // 3. Processar Anomalias
      const detectedAnomalies = [];
      const categorias = [
        { nome: 'Energia', history: hEnergia },
        { nome: 'Água', history: hAgua },
        { nome: 'Gás', history: hGas }
      ];

      categorias.forEach(cat => {
        const media = calcularMediaHistorica(consumos, cat.nome);
        const ultimoValor = cat.history[cat.history.length - 1];
        if (ultimoValor > 0 && detectarAnomalia(ultimoValor, media)) {
          const diff = (((ultimoValor / media) - 1) * 100).toFixed(0);
          detectedAnomalies.push({ categoria: cat.nome, diff });
        }
      });
      setAnomalies(detectedAnomalies);

      // 4. Verificar Conquistas
      const unlocked = await checkAchievements(consumos);
      if (unlocked.length > 0) {
        setNewAchievement(unlocked[0]); // Mostra a primeira nova conquista
      }

      // 3. Processar metas (agora para todas as categorias)
      const metaEnergiaVal = metas.find(m => m.tipoConsumo && m.tipoConsumo.toLowerCase().includes('energia'))?.valor_meta || 0;
      const metaAguaVal = metas.find(m => m.tipoConsumo && (m.tipoConsumo.toLowerCase().includes('agua') || m.tipoConsumo.toLowerCase().includes('água')))?.valor_meta || 0;
      const metaGasVal = metas.find(m => m.tipoConsumo && (m.tipoConsumo.toLowerCase().includes('gas') || m.tipoConsumo.toLowerCase().includes('gás')))?.valor_meta || 0;

      // Calcular porcentagens (evitando divisão por zero)
      const percEnergia = metaEnergiaVal > 0 ? Math.min(Math.round((energiaSum / metaEnergiaVal) * 100), 100) : 0;
      const percAgua = metaAguaVal > 0 ? Math.min(Math.round((aguaSum / metaAguaVal) * 100), 100) : 0;
      const percGas = metaGasVal > 0 ? Math.min(Math.round((gasSum / metaGasVal) * 100), 100) : 0;

      // 4. Buscar Dicas (usando POST /dicas/Mostra_Dica para recomendação inteligente)
      let dicaSustentavel = "Economize energia desligando aparelhos em stand-by.";
      try {
        const token = await AsyncStorage.getItem('@jwt_token');
        
        // Tentativa com o endpoint de recomendação (ID 1 = Energia como padrão)
        const resDica = await api.post('/dicas/Mostra_Dica', 
          { tipo_consumo_id: 1 }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (resDica.data && resDica.data.mensagem) {
          // A API pode retornar uma string direta ou objeto
          dicaSustentavel = resDica.data.mensagem.descrição || resDica.data.mensagem || dicaSustentavel;
        }
      } catch (e) { 
        console.log('Erro ao buscar dicas (Mostra_Dica):', e.message);
        // Se der 403 ou qualquer erro, tentamos o Lista_Dica como última instância
        try {
          const resDicaAlt = await api.get('/dicas/Lista_Dica?id=1', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (resDicaAlt.data && resDicaAlt.data.mensagem) {
            const list = resDicaAlt.data.mensagem;
            dicaSustentavel = (Array.isArray(list) ? list[0]?.descrição : list.descrição) || dicaSustentavel;
          }
        } catch (e2) {
          console.log('Erro persistente nas dicas:', e2.message);
        }
      }

      const currentStats = {
        energia: energiaSum,
        agua: aguaSum,
        residuos: gasSum,
        metaEnergiaVal,
        metaAguaVal,
        metaGasVal
      };

      setDados({
        ...currentStats,
        metaEnergia: percEnergia,
        metaAgua: percAgua,
        metaGas: percGas,
        ecoScore: calcularEcoScore(currentStats),
        dica: dicaSustentavel,
        historicoEnergia: hEnergia,
        historicoAgua: hAgua,
        historicoGas: hGas
      });

    } catch (error) {
      console.log('Erro ao carregar dashboard:', error);
      if (error.response && error.response.status === 401) {
        Alert.alert('Sessão Expirada', 'Faça login novamente.');
        navigation.replace('Login');
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados. Verifique sua conexão.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@jwt_token');
    await AsyncStorage.removeItem('@saved_login'); // Impede auto-login
    navigation.replace('Login');
  };

  // useFocusEffect garante que a API seja chamada toda vez que a tela ganha foco
  // (ex: quando o usuário volta da tela de cadastrar consumo)
  useFocusEffect(
    useCallback(() => {
      buscarDadosDashboard();
    }, [])
  );

  const nextTutorialStep = async () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      await AsyncStorage.setItem('@tutorial_seen', 'true');
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#18181b",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#18181b",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2, 
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontFamily: 'UBUNTU-400Regular',
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* TUTORIAL MODAL */}
        <Modal visible={showTutorial} transparent animationType="fade">
          <View style={styles.tutorialOverlay}>
            <View style={styles.tutorialCard}>
              <View style={styles.tutorialIconWrapper}>
                {tutorialSteps[tutorialStep].icon}
              </View>
              <Text style={styles.tutorialTitle}>{tutorialSteps[tutorialStep].title}</Text>
              <Text style={styles.tutorialDesc}>{tutorialSteps[tutorialStep].desc}</Text>
              
              <View style={styles.tutorialDots}>
                {tutorialSteps.map((_, i) => (
                  <View key={i} style={[styles.tutorialDot, i === tutorialStep && styles.tutorialDotActive]} />
                ))}
              </View>

              <TouchableOpacity style={styles.tutorialBtn} onPress={nextTutorialStep}>
                <Text style={styles.tutorialBtnText}>
                  {tutorialStep === tutorialSteps.length - 1 ? "Começar Agora" : "Próximo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL DO MENU SANDUÍCHE */}
        <Modal
          visible={isMenuOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalCloseArea} onPress={() => setIsMenuOpen(false)} />
            
            <View style={styles.sideMenu}>
              <View style={styles.sideMenuHeader}>
                <View>
                  <Text style={styles.sideMenuTitle}>{usuario.nome}</Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 12 }}>{usuario.email}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <X color="#fff" size={28} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); navigation.navigate('IoTControl'); }}>
                <Cpu color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Casa Inteligente (IoT)</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); navigation.navigate('Account'); }}>
                <User color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Minha Conta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); navigation.navigate('CreateGoal'); }}>
                <Activity color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Ações e Metas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); Alert.alert('Suporte', 'Central de ajuda em desenvolvimento. Contato: suporte@ecode.com'); }}>
                <HelpCircle color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <LogOut color="#f87171" size={22} />
                <Text style={[styles.menuItemText, { color: '#f87171' }]}>Sair</Text>
              </TouchableOpacity>

              <View style={styles.sideMenuFooter}>
                <Text style={styles.versionText}>EcoMonitor v1.0.4</Text>
                <Text style={styles.companyText}>ECODE Project © 2026</Text>
              </View>
            </View>
          </View>
        </Modal>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.hamburgerBtn}>
              <AntDesign name="left" color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.hamburgerBtn}>
              <Menu color="#fff" size={28} />
            </TouchableOpacity>
          </View>

          {/* ECO-SCORE SECTION */}
          <View style={styles.ecoScoreSection}>
            <View style={styles.ecoScoreHeader}>
              <Sparkles size={20} color="#facc15" />
              <Text style={styles.ecoScoreTitle}>SEU ECO-SCORE</Text>
            </View>
            <View style={styles.ecoScoreMain}>
              <Text style={[
                styles.ecoScoreValue, 
                { color: dados.ecoScore > 80 ? '#4ade80' : dados.ecoScore > 50 ? '#facc15' : '#f87171' }
              ]}>
                {dados.ecoScore}
              </Text>
              <View style={styles.ecoScoreInfo}>
                <Text style={styles.ecoScoreStatus}>
                  {dados.ecoScore > 80 ? 'Herói do Planeta 🏆' : dados.ecoScore > 50 ? 'Em Evolução 📈' : 'Alerta Ecológico ⚠️'}
                </Text>
                <Text style={styles.ecoScoreSub}>
                  {dados.ecoScore > 80 ? 'Excelente! Você está no topo da sustentabilidade.' : 
                   dados.ecoScore > 50 ? 'Bom trabalho, mas ainda há espaço para economizar.' : 
                   'Atenção: seu consumo está acima das metas ideais.'}
                </Text>
              </View>
            </View>
            <View style={styles.ecoScoreBarBg}>
              <LinearGradient
                colors={dados.ecoScore > 80 ? ['#4ade80', '#22c55e'] : dados.ecoScore > 50 ? ['#facc15', '#eab308'] : ['#f87171', '#ef4444']}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={[styles.ecoScoreBarFill, { width: `${dados.ecoScore}%` }]}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.btnCadastrarContainer} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Cadastro_Consumo')}
          >
            <LinearGradient 
              colors={['#89a5e0ec', '#6596e0']} 
              start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
              style={styles.btnCadastrar}
            >
              <Plus color="#fff" size={24} style={styles.btnCadastrarIcon} />
              <Text style={styles.btnCadastrarText}>Cadastrar Novo Consumo</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Exibe o ActivityIndicator enquanto a API carrega os dados */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Carregando seus dados...</Text>
            </View>
          ) : (
            <>
              {/* SELETOR DE MODO DE VISUALIZAÇÃO */}
              <View style={styles.viewModeContainer}>
                <TouchableOpacity 
                  style={[styles.viewModeBtn, viewMode === 'units' && styles.viewModeBtnActive]} 
                  onPress={() => setViewMode('units')}
                >
                  <Activity size={16} color={viewMode === 'units' ? '#fff' : '#a1a1aa'} />
                  <Text style={[styles.viewModeBtnText, viewMode === 'units' && styles.viewModeBtnTextActive]}>Consumo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.viewModeBtn, viewMode === 'cost' && styles.viewModeBtnActive]} 
                  onPress={() => setViewMode('cost')}
                >
                  <DollarSign size={16} color={viewMode === 'cost' ? '#fff' : '#a1a1aa'} />
                  <Text style={[styles.viewModeBtnText, viewMode === 'cost' && styles.viewModeBtnTextActive]}>Financeiro</Text>
                </TouchableOpacity>
              </View>

              {/* AREA DE INFO RÁPIDA */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
                <TouchableOpacity 
                  style={[styles.cardInfo, styles.iotShortcutCard]} 
                  onPress={() => navigation.navigate('IoTControl')}
                >
                  <Cpu size={28} color="#4ade80" />
                  <Text style={styles.iotShortcutLabel}>IoT Ativo</Text>
                  <Text style={styles.iotShortcutStatus}>4 Dispositivos</Text>
                </TouchableOpacity>

                <View style={[styles.cardInfo, { borderColor: 'rgba(74, 222, 128, 0.3)' }]}>
                  <Text style={styles.cardLabel}>Impacto Ecológico</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <Zap size={14} color="#facc15" style={{ marginRight: 5 }} />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>{calcularCO2(dados.energia)}kg CO2</Text>
                  </View>
                  <Text style={[styles.cardSubText, { color: '#4ade80' }]}>~{calcularImpactoVerde(dados.agua)} árvores salvas</Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Energia (Mês)</Text>
                  <Text style={[styles.cardValue, { color: '#facc15' }]}>
                    {viewMode === 'units' ? `${dados.energia.toFixed(2)} kWh` : `R$ ${(dados.energia * rates.energy).toFixed(2)}`}
                  </Text>
                  <Text style={[styles.cardSubText, { color: '#4ade80' }]}>
                    {viewMode === 'units' ? `R$ ${(dados.energia * rates.energy).toFixed(2)}` : `${dados.energia.toFixed(2)} kWh`}
                  </Text>
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Água (Mês)</Text>
                  <Text style={[styles.cardValue, { color: '#60a5fa' }]}>
                    {viewMode === 'units' ? `${dados.agua.toFixed(0)} L` : `R$ ${(dados.agua * rates.water).toFixed(2)}`}
                  </Text>
                  <Text style={[styles.cardSubText, { color: '#f87171' }]}>
                    {viewMode === 'units' ? `R$ ${(dados.agua * rates.water).toFixed(2)}` : `${dados.agua.toFixed(0)} L`}
                  </Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardLabel}>Gás (Mês)</Text>
                  <Text style={[styles.cardValue, { color: '#4ade80' }]}>
                    {viewMode === 'units' ? `${dados.residuos.toFixed(2)} kg` : `R$ ${(dados.residuos * rates.gas).toFixed(2)}`}
                  </Text>
                  <Text style={[styles.cardSubText, { color: '#a1a1aa' }]}>
                    {viewMode === 'units' ? `R$ ${(dados.residuos * rates.gas).toFixed(2)}` : `${dados.residuos.toFixed(2)} kg`}
                  </Text>
                </View>
              </ScrollView>

              {/* ALERTAS DE ANOMALIA */}
              {anomalies.length > 0 && (
                <View style={styles.anomalyContainer}>
                  {anomalies.map((anom, idx) => (
                    <View key={idx} style={styles.anomalyCard}>
                      <Activity size={20} color="#f87171" />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.anomalyTitle}>Pico detectado em {anom.categoria}</Text>
                        <Text style={styles.anomalySub}>{anom.diff}% acima da sua média habitual.</Text>
                      </View>
                      <TouchableOpacity style={styles.anomalyAction} onPress={() => navigation.navigate('ConsumptionHistory')}>
                        <Text style={styles.anomalyActionText}>Ver</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* DASHBOARD GRÁFICO */}
              <View style={styles.dashboardContainer}>
                <View style={styles.dashboardHeader}>
                  <View>
                    <Text style={styles.dashboardTitle}>Monitoramento</Text>
                    <Text style={styles.dashboardSubtitle}>Visão geral dos recursos naturais</Text>
                  </View>
                  <View style={styles.badgeRealTime}>
                    <Text style={styles.badgeText}>Atualizado</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.historyBtn}
                  onPress={() => navigation.navigate('ConsumptionHistory')}
                >
                  <History size={18} color="#26D0CE" />
                  <Text style={styles.historyBtnText}>Gerenciar Histórico Detalhado</Text>
                  <AntDesign name="right" size={14} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>

                <Text style={styles.chartTitle}>{viewMode === 'units' ? 'Consumo por Categoria' : 'Custo por Categoria (R$)'}</Text>
                <BarChart
                  data={{
                    labels: ["Energia", "Água", "Gás"],
                    datasets: [{ 
                      data: viewMode === 'units' 
                        ? [
                            Number(dados.energia.toFixed(2)), 
                            Number(dados.agua.toFixed(0)), 
                            Number(dados.residuos.toFixed(2))
                          ] 
                        : [
                            Number((dados.energia * rates.energy).toFixed(2)), 
                            Number((dados.agua * rates.water).toFixed(2)), 
                            Number((dados.residuos * rates.gas).toFixed(2))
                          ]
                    }]
                  }}
                  width={screenWidth - 80}
                  height={220}
                  yAxisLabel={viewMode === 'cost' ? 'R$' : ''}
                  chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`}}
                  style={styles.chartStyle}
                  fromZero
                  showValuesOnTopOfBars
                />

                <Text style={styles.chartTitle}>{viewMode === 'units' ? 'Distribuição do Consumo' : 'Distribuição dos Custos'}</Text>
                <PieChart
                  data={[
                    {
                      name: "Energia",
                      population: Number((viewMode === 'units' ? dados.energia : dados.energia * rates.energy).toFixed(2)),
                      color: "#facc15",
                      legendFontColor: "#fff",
                      legendFontSize: 12
                    },
                    {
                      name: "Água",
                      population: Number((viewMode === 'units' ? dados.agua : dados.agua * rates.water).toFixed(2)),
                      color: "#60a5fa",
                      legendFontColor: "#fff",
                      legendFontSize: 12
                    },
                    {
                      name: "Gás",
                      population: Number((viewMode === 'units' ? dados.residuos : dados.residuos * rates.gas).toFixed(2)),
                      color: "#4ade80",
                      legendFontColor: "#fff",
                      legendFontSize: 12
                    }
                  ]}
                  width={screenWidth - 80}
                  height={220}
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]}
                  absolute
                />

                <Text style={styles.chartTitle}>Histórico de Energia (kWh)</Text>
                <LineChart
                  data={{
                    labels: ["1", "2", "3", "4", "5", "6"],
                    datasets: [{ data: dados.historicoEnergia }]
                  }}
                  width={screenWidth - 80}
                  height={180}
                  chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(250, 204, 21, ${opacity})`}}
                  bezier
                  fromZero
                  style={styles.chartStyle}
                />

                <Text style={styles.chartTitle}>Histórico de Água (Litros)</Text>
                <LineChart
                  data={{
                    labels: ["1", "2", "3", "4", "5", "6"],
                    datasets: [{ data: dados.historicoAgua }]
                  }}
                  width={screenWidth - 80}
                  height={180}
                  chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`}}
                  bezier
                  fromZero
                  style={styles.chartStyle}
                />

                <Text style={styles.chartTitle}>Histórico de Gás (kg)</Text>
                <LineChart
                  data={{
                    labels: ["1", "2", "3", "4", "5", "6"],
                    datasets: [{ data: dados.historicoGas }]
                  }}
                  width={screenWidth - 80}
                  height={180}
                  chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`}}
                  bezier
                  fromZero
                  style={styles.chartStyle}
                />
              </View>

              {/* RODAPÉ DE DICAS E METAS */}
              {(dados.metaEnergiaVal > 0 || dados.metaAguaVal > 0 || dados.metaGasVal > 0) && (
                <View style={styles.goalCard}>
                  <Text style={styles.goalTitle}>Suas Metas do Mês</Text>
                  
                  {/* Meta Energia */}
                  {dados.metaEnergiaVal > 0 && (
                    <View style={styles.goalItem}>
                      <View style={styles.goalHeaderRow}>
                        <Text style={styles.goalLabel}>Energia (Meta: {dados.metaEnergiaVal} kWh)</Text>
                        <Text style={styles.goalLabel}>{dados.energia.toFixed(1)} / {dados.metaEnergiaVal} ({dados.metaEnergia}%)</Text>
                      </View>
                      <View style={styles.progressBarBackground}>
                        <LinearGradient 
                          colors={['#facc15', '#eab308']} 
                          start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                          style={[styles.progressBarFill, { width: `${dados.metaEnergia}%` }]} 
                        />
                      </View>
                    </View>
                  )}

                  {/* Meta Água */}
                  {dados.metaAguaVal > 0 && (
                    <View style={styles.goalItem}>
                      <View style={styles.goalHeaderRow}>
                        <Text style={styles.goalLabel}>Água (Meta: {dados.metaAguaVal} L)</Text>
                        <Text style={styles.goalLabel}>{dados.agua.toFixed(0)} / {dados.metaAguaVal} ({dados.metaAgua}%)</Text>
                      </View>
                      <View style={styles.progressBarBackground}>
                        <LinearGradient 
                          colors={['#60a5fa', '#3b82f6']} 
                          start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                          style={[styles.progressBarFill, { width: `${dados.metaAgua}%` }]} 
                        />
                      </View>
                    </View>
                  )}

                  {/* Meta Gás */}
                  {dados.metaGasVal > 0 && (
                    <View style={styles.goalItem}>
                      <View style={styles.goalHeaderRow}>
                        <Text style={styles.goalLabel}>Gás (Meta: {dados.metaGasVal} kg)</Text>
                        <Text style={styles.goalLabel}>{dados.residuos.toFixed(1)} / {dados.metaGasVal} ({dados.metaGas}%)</Text>
                      </View>
                      <View style={styles.progressBarBackground}>
                        <LinearGradient 
                          colors={['#4ade80', '#22c55e']} 
                          start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                          style={[styles.progressBarFill, { width: `${dados.metaGas}%` }]} 
                        />
                      </View>
                    </View>
                  )}
                </View>
              )}

              <LinearGradient colors={['rgba(49, 46, 129, 0.4)', 'rgba(30, 58, 138, 0.4)']} style={styles.tipCard}>
                <Text style={styles.tipTitle}>Dica Sustentável</Text>
                <Text style={styles.tipText}>"{dados.dica}"</Text>
              </LinearGradient>
            </>
          )}

        </ScrollView>

        {/* MODAL DE CONQUISTA */}
        <Modal
          visible={!!newAchievement}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.achievementOverlay}>
            <LinearGradient 
              colors={['#1e293b', '#0f172a']} 
              style={styles.achievementModal}
            >
              <AntDesign name="Trophy" size={60} color="#facc15" />
              <Text style={styles.achievementTitle}>Nova Conquista!</Text>
              <View style={[styles.badgeIconLarge, { backgroundColor: newAchievement?.color + '22' }]}>
                <AntDesign name={newAchievement?.icon} size={40} color={newAchievement?.color} />
              </View>
              <Text style={styles.achievementName}>{newAchievement?.title}</Text>
              <Text style={styles.achievementDesc}>{newAchievement?.description}</Text>
              
              <TouchableOpacity 
                style={styles.achievementBtn} 
                onPress={() => setNewAchievement(null)}
              >
                <Text style={styles.achievementBtnText}>Incrível!</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  hamburgerBtn: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', fontFamily: 'UBUNTU-400Regular' },
  modalOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalCloseArea: { flex: 1 },
  sideMenu: { width: '75%', backgroundColor: '#18181b', height: '100%', padding: 25, paddingTop: 60, elevation: 5, shadowColor: '#000', shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  sideMenuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#27272a' },
  sideMenuTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', fontFamily: 'UBUNTU-400Regular' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginBottom: 10 },
  menuItemText: { color: '#e4e4e7', fontSize: 18, marginLeft: 15, fontWeight: '500', fontFamily: 'UBUNTU-400Regular' },
  sideMenuFooter: { marginTop: 'auto', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#27272a', alignItems: 'center' },
  versionText: { color: '#71717a', fontSize: 12, fontFamily: 'UBUNTU-400Regular' },
  companyText: { color: '#52525b', fontSize: 10, marginTop: 5, fontFamily: 'UBUNTU-400Regular' },
  btnCadastrarContainer: { marginBottom: 25 },
  btnCadastrar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, elevation: 3, shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  btnCadastrarIcon: { marginRight: 10 },
  btnCadastrarText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5, fontFamily: 'UBUNTU-400Regular' },
  
  viewModeContainer: { flexDirection: 'row', backgroundColor: 'rgba(24, 24, 27, 0.4)', borderRadius: 12, padding: 4, marginBottom: 20, alignSelf: 'flex-start' },
  viewModeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  viewModeBtnActive: { backgroundColor: '#3b82f6' },
  viewModeBtnText: { color: '#a1a1aa', fontSize: 13, marginLeft: 6, fontWeight: 'bold' },
  viewModeBtnTextActive: { color: '#fff' },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  historyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
    fontFamily: 'UBUNTU-400Regular'
  },
  iotShortcutCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100
  },
  iotShortcutLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8
  },
  iotShortcutStatus: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2
  },
  // Adicionado estilo para o carregamento
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  loadingText: { color: '#fff', marginTop: 10, fontFamily: 'UBUNTU-400Regular', fontSize: 16 },
  
  cardsScroll: { flexDirection: 'row', marginBottom: 30 },
  cardInfo: { backgroundColor: 'rgba(24, 24, 27, 0.6)', borderColor: '#27272a', borderWidth: 1, padding: 20, borderRadius: 16, marginRight: 15, width: 160, alignItems: 'center' },
  cardLabel: { color: '#a1a1aa', fontSize: 14, fontFamily: 'UBUNTU-400Regular' },
  cardValue: { fontSize: 28, fontWeight: 'bold', marginVertical: 5, fontFamily: 'UBUNTU-400Regular' },
  cardSubText: { fontSize: 12, fontFamily: 'UBUNTU-400Regular' },
  dashboardContainer: { backgroundColor: 'rgba(24, 24, 27, 0.67)', borderColor: '#54545857', borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 30 },
  dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: 'rgba(165, 160, 160, 0.18)', paddingBottom: 15, marginBottom: 20 },
  dashboardTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', fontFamily: 'UBUNTU-400Regular' },
  dashboardSubtitle: { color: '#a1a1aa', fontSize: 12, marginTop: 4, fontFamily: 'UBUNTU-400Regular' },
  badgeRealTime: { backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: 'rgba(168, 85, 247, 0.3)', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#d8b4fe', fontSize: 10, fontFamily: 'UBUNTU-400Regular' },
  chartTitle: { color: '#d4d4d8', fontWeight: '600', marginBottom: 10, marginTop: 20, fontFamily: 'UBUNTU-400Regular' },
  chartStyle: { borderRadius: 16, alignSelf: 'center' },
  goalCard: { backgroundColor: 'rgba(24, 24, 27, 0.64)', borderColor: '#27272a', borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 15 },
  goalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20, fontFamily: 'UBUNTU-400Regular' },
  goalItem: { marginBottom: 15 },
  goalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { color: '#a1a1aa', fontSize: 14, fontFamily: 'UBUNTU-400Regular' },
  progressBarBackground: { height: 8, backgroundColor: '#3f3f46', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  tipCard: { borderColor: 'rgba(99, 102, 241, 0.3)', borderWidth: 1, borderRadius: 16, padding: 20 },
  tipTitle: { color: '#a5b4fc', fontSize: 18, fontWeight: 'bold', marginBottom: 10, fontFamily: 'UBUNTU-400Regular' },
  tipText: { color: '#d4d4d8', fontSize: 14, lineHeight: 22, fontFamily: 'UBUNTU-400Regular' },
  
  anomalyContainer: { paddingHorizontal: 0, marginBottom: 20 },
  anomalyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(248, 113, 113, 0.3)', marginBottom: 10 },
  anomalyTitle: { color: '#f87171', fontWeight: 'bold', fontSize: 14 },
  anomalySub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  anomalyAction: { backgroundColor: 'rgba(248, 113, 113, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  anomalyActionText: { color: '#f87171', fontSize: 12, fontWeight: 'bold' },
  
  achievementOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  achievementModal: { width: '85%', padding: 30, borderRadius: 32, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  achievementTitle: { color: '#facc15', fontSize: 18, fontWeight: 'bold', marginTop: 15, textTransform: 'uppercase' },
  badgeIconLarge: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginVertical: 25 },
  achievementName: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  achievementDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  achievementBtn: { backgroundColor: '#facc15', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginTop: 30 },
  achievementBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  ecoScoreSection: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ecoScoreHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  ecoScoreTitle: { color: '#facc15', fontSize: 12, fontWeight: 'bold', marginLeft: 8, letterSpacing: 1 },
  ecoScoreMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  ecoScoreValue: { fontSize: 48, fontWeight: 'bold', fontFamily: 'UBUNTU-400Regular' },
  ecoScoreInfo: { marginLeft: 20, flex: 1 },
  ecoScoreStatus: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'UBUNTU-400Regular' },
  ecoScoreSub: { color: '#a1a1aa', fontSize: 11, marginTop: 2, fontFamily: 'UBUNTU-400Regular' },
  ecoScoreBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  ecoScoreBarFill: { height: '100%', borderRadius: 3 },

  tutorialOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  tutorialCard: { backgroundColor: '#1E293B', borderRadius: 30, padding: 30, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tutorialIconWrapper: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(38, 208, 206, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  tutorialTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  tutorialDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  tutorialDots: { flexDirection: 'row', gap: 8, marginBottom: 30 },
  tutorialDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  tutorialDotActive: { backgroundColor: '#26D0CE', width: 24 },
  tutorialBtn: { backgroundColor: '#26D0CE', paddingVertical: 18, borderRadius: 15, width: '100%', alignItems: 'center' },
  tutorialBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 16 },

  benchmarkSection: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  benchmarkHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  benchmarkTitle: { color: '#26D0CE', fontSize: 11, fontWeight: 'bold', marginLeft: 8, letterSpacing: 1 },
  benchmarkGrid: { flexDirection: 'row', gap: 15 },
  benchmarkItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 15 },
  benchmarkLabel: { color: '#a1a1aa', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  benchmarkValue: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  benchmarkDiff: { fontSize: 10, fontWeight: 'bold', marginTop: 4 }
});