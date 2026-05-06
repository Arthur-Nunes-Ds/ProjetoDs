import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Droplet, Box, CheckCircle, Edit3, Calendar, ArrowLeft, ArrowRight, History, Scan } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 

// Importações do projeto reestruturado
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterConsumptionScreen({ route }) {
  const navigation = useNavigation();
  const editItem = route?.params?.editItem;
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(!!editItem);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [recentHistory, setRecentHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    tipo_id: editItem ? null : null, // Será definido no useEffect
    valor: editItem ? editItem.valor.toString() : '',              
    dt_perioto: editItem ? editItem.dataRegistrada : new Date().toISOString()
  });

  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    carregarTipos();
    carregarHistoricoCompleto();

    if (editItem) {
      setStep(2); // Vai direto para o valor/data
    }
  }, [editItem]);

  useEffect(() => {
    // Calcular sugestão baseada no histórico quando o tipo mudar
    if (formData.tipo_id && recentHistory.length > 0) {
      const consumosDoTipo = recentHistory.filter(c => {
        const tipo = tiposDisponiveis.find(t => t.id === formData.tipo_id);
        return c.tipoConsumo === tipo?.nome;
      });

      if (consumosDoTipo.length > 0) {
        const soma = consumosDoTipo.reduce((acc, curr) => acc + curr.valor, 0);
        const media = soma / consumosDoTipo.length;
        setSuggestion(media.toFixed(2));
      } else {
        setSuggestion(null);
      }
    }
  }, [formData.tipo_id, recentHistory, tiposDisponiveis]);

  useEffect(() => {
    // Vincular o tipo_id se estiver editando assim que os tipos carregarem
    if (editItem && tiposDisponiveis.length > 0) {
      const tipo = tiposDisponiveis.find(t => t.nome === editItem.tipoConsumo);
      if (tipo) {
        setFormData(prev => ({ ...prev, tipo_id: tipo.id }));
      }
    }
  }, [editItem, tiposDisponiveis]);

  const carregarTipos = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/tipo_consumo/Mostrar_Tipos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiposDisponiveis(response.data.mensagem || []);
    } catch (error) {      // Fallback para teste/debug se a API falhar ou retornar vazia
      setTiposDisponiveis([
        { id: 1, nome: 'Água', unidade_medida: 'L' },
        { id: 2, nome: 'Energia', unidade_medida: 'kWh' },
        { id: 3, nome: 'Gás', unidade_medida: 'kg' }
      ]);
    } finally {
      setLoadingTipos(false);
    }
  };

  const carregarHistoricoCompleto = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/consumo/Listar_Consumos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lista = response.data.mensagem || [];
      setRecentHistory(lista); 
    } catch (error) {
      console.log('Erro ao carregar histórico recente:', error);
    }
  };

  const selecionarTipo = (id) => {
    setFormData(prev => ({ ...prev, tipo_id: id }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.tipo_id) {
      Alert.alert('Atenção', 'Selecione uma categoria antes de prosseguir.');
      return;
    }
    // Validação extra para o Passo 2
    if (step === 2) {
      if (!formData.valor.trim() || isNaN(formData.valor.replace(',', '.'))) {
        Alert.alert('Atenção', 'Informe um valor numérico válido.');
        return;
      }
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Função de Envio Integrada com a API
  const handleFinalizar = async () => {
    setIsSubmitting(true);

    try {
      // 1. Resgatar o token do armazenamento local
      const token = await AsyncStorage.getItem('@jwt_token');
      
      if (!token) {
        Alert.alert('Sessão Inválida', 'Faça login novamente para registrar o consumo.');
        navigation.navigate('Login');
        return;
      }

      // 2. Montar o payload
      const payload = {
        valor: parseFloat(formData.valor.replace(',', '.')), 
        dt_perioto: formData.dt_perioto.includes('T') ? formData.dt_perioto : `${formData.dt_perioto}T12:00:00Z`,
        TIPO_CONSUMO_id: parseInt(formData.tipo_id)
      };

      console.log('Enviando payload:', JSON.stringify(payload));

      // 3. Fazer a requisição POST ou PUT
      if (isEditing) {
        await api.put(`/consumo/Editar_Consumo/${editItem.id}`, payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await api.post('/consumo/Criar_Consumo', payload, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      // 4. Sucesso!
      setStep(4); 
      carregarHistoricoRecente();
    } catch (error) {
      console.log('Erro ao registrar consumo:', error);
      
      if (error.response) {
        console.log('DETALHES DO ERRO 422:', JSON.stringify(error.response.data, null, 2));
        if (error.response.status === 401) {
          Alert.alert('Sessão Expirada', 'Seu token venceu. Faça login novamente.');
          navigation.navigate('Login');
        } else if (error.response.status === 422) {
          // Extrai detalhes do erro do FastAPI
          const detalhes = error.response.data.detail;
          let msg = 'Dados inválidos.';
          if (Array.isArray(detalhes)) {
            msg = detalhes.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join('\n');
          } else if (typeof detalhes === 'string') {
            msg = detalhes;
          }
          Alert.alert('Erro de Validação', msg);
        } else {
          Alert.alert('Erro', 'Ocorreu um problema no servidor. Tente novamente.');
        }
      } else {
        Alert.alert('Erro de Conexão', 'Não foi possível se conectar ao servidor.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const concluir = () => {
    navigation.goBack(); // ou navigation.navigate('Dashboard')
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const today = new Date();
      if (selectedDate > today) {
        Alert.alert('Data Inválida', 'Você não pode registrar um consumo em uma data futura.');
        return;
      }
      setFormData(prev => ({ ...prev, dt_perioto: selectedDate.toISOString() }));
    }
  };

  // --- RENDERIZAÇÃO DOS PASSOS ---
  
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>O que você deseja registrar?</Text>
      <Text style={styles.stepSubtitle}>Selecione uma categoria abaixo</Text>
      
      <View style={styles.cardsContainer}>
        {loadingTipos ? (
          <ActivityIndicator color="#26D0CE" />
        ) : (
          tiposDisponiveis.map((tipo) => {
            const isActive = formData.tipo_id === tipo.id;
            let Icone = Box;
            if (tipo.nome.toLowerCase().includes('energia')) Icone = Zap;
            else if (tipo.nome.toLowerCase().includes('agua') || tipo.nome.toLowerCase().includes('água')) Icone = Droplet;
            else if (tipo.nome.toLowerCase().includes('gas') || tipo.nome.toLowerCase().includes('gás')) Icone = Box; // Lucide doesn't have a specific Gas icon easily, Flame?
            
            // Usando icones específicos
            const isGas = tipo.nome.toLowerCase().includes('gas') || tipo.nome.toLowerCase().includes('gás');
            const isAgua = tipo.nome.toLowerCase().includes('agua') || tipo.nome.toLowerCase().includes('água');
            const isEnergia = tipo.nome.toLowerCase().includes('energia');
         
            return (
              <TouchableOpacity 
                key={tipo.id} 
                style={[styles.typeCard, isActive && styles.typeCardActive]}
                onPress={() => selecionarTipo(tipo.id)}
                activeOpacity={0.7}
              >
                <Icone size={32} color={isActive ? '#26D0CE' : '#A0AEC0'} />
                <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>
                  {tipo.nome}
                </Text>
                {isActive && (
                  <View style={styles.checkBadge}>
                    <CheckCircle size={16} color="#1A2980" fill="#26D0CE" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {recentHistory.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <History size={16} color="#26D0CE" />
            <Text style={styles.recentTitle}>Últimos Registros</Text>
          </View>
          {recentHistory.map((item) => (
            <View key={item.id} style={styles.recentItem}>
              <View style={styles.recentInfo}>
                <Text style={styles.recentCategory}>{item.tipoConsumo}</Text>
                <Text style={styles.recentDate}>
                  {new Date(item.dataRegistrada).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Text style={styles.recentValue}>
                {item.tipoConsumo.toLowerCase().includes('agua') || item.tipoConsumo.toLowerCase().includes('água') 
                  ? `${parseFloat(item.valor).toFixed(0)} L` 
                  : `${parseFloat(item.valor).toFixed(2)} ${item.tipoConsumo.toLowerCase().includes('energia') ? 'kWh' : 'kg'}`}
              </Text>
            </View>
          ))}
          <TouchableOpacity 
            style={styles.viewFullHistory} 
            onPress={() => navigation.navigate('ConsumptionHistory')}
          >
            <Text style={styles.viewFullHistoryText}>Ver histórico completo</Text>
            <ArrowRight size={14} color="#26D0CE" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => {
    const tipoRelativo = tiposDisponiveis.find(t => t.id === formData.tipo_id);
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Detalhes do Consumo</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>VALOR / LEITURA ({tipoRelativo?.unidade_medida || 'UN'})</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.unitPrefix}>{tipoRelativo?.unidade_medida || '?'}</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#A0AEC0"
              placeholder="0.00"
              keyboardType="numeric"
              value={formData.valor}
              onChangeText={(text) => setFormData({...formData, valor: text})}
            />
          </View>
          
          {suggestion && (
            <TouchableOpacity 
              style={styles.suggestionChip} 
              onPress={() => setFormData({...formData, valor: suggestion})}
            >
              <Activity size={14} color="#26D0CE" />
              <Text style={styles.suggestionText}>Sugestão baseada na média: {suggestion}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>DATA DO REGISTRO</Text>
          <TouchableOpacity 
            style={styles.inputWrapper} 
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#26D0CE" style={styles.inputIcon} />
            <Text style={styles.inputTextValue}>
              {new Date(formData.dt_perioto).toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={new Date(formData.dt_perioto)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>
      </View>
    );
  };

  const renderStep3 = () => {
    const tipoRelativo = tiposDisponiveis.find(t => t.id === formData.tipo_id);
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Revisão</Text>
        
        <View style={styles.reviewCard}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Categoria</Text>
            <Text style={styles.reviewValueHighlight}>
              {tipoRelativo ? tipoRelativo.nome : 'Não selecionado'}
            </Text>
          </View>
          <View style={styles.separator} />
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Valor Registrado</Text>
            <Text style={styles.reviewValueNumber}>{formData.valor || '0'} {tipoRelativo?.unidade_medida}</Text>
          </View>
          <View style={styles.separator} />
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Data</Text>
            <Text style={styles.reviewValue}>{new Date(formData.dt_perioto).toLocaleDateString('pt-BR')}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={[styles.stepContainer, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
      <CheckCircle size={80} color="#26D0CE" />
      <Text style={[styles.stepTitle, { marginTop: 20 }]}>
        {isEditing ? 'Atualizado!' : 'Registrado!'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {isEditing ? 'As alterações foram salvas com sucesso.' : 'Os dados foram salvos com sucesso.'}
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
            <View style={styles.header}>
              <Text style={styles.title}>{isEditing ? 'Editar Registro' : 'Novo Registro'}</Text>
              <Text style={styles.subtitle}>{isEditing ? 'ATUALIZAR DADOS' : 'GERENCIAMENTO DE RECURSOS'}</Text>
            </View>

            {!isEditing && (
              <TouchableOpacity 
                style={styles.ocrShortcut} 
                onPress={() => navigation.navigate('OCRScanner')}
              >
                <LinearGradient 
                  colors={['rgba(38, 208, 206, 0.2)', 'rgba(26, 41, 128, 0.2)']} 
                  style={styles.ocrShortcutGradient}
                >
                  <Scan size={24} color="#26D0CE" />
                  <View style={styles.ocrShortcutTextWrapper}>
                    <Text style={styles.ocrShortcutTitle}>Registrar por Foto (IA)</Text>
                    <Text style={styles.ocrShortcutSub}>Economize tempo usando nosso scanner</Text>
                  </View>
                  <AntDesign name="right" size={16} color="#26D0CE" />
                </LinearGradient>
              </TouchableOpacity>
            )}

          <View style={styles.card}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {step < 4 && (
              <View style={styles.stepperControls}>
                <TouchableOpacity 
                  style={[styles.btnBack, step === 1 && { opacity: 0 }]} 
                  onPress={handleBack}
                  disabled={step === 1 || isSubmitting}
                >
                  <ArrowLeft size={20} color="#fff" />
                  <Text style={styles.btnTextBack}>Voltar</Text>
                </TouchableOpacity>

                {step < 3 ? (
                  <TouchableOpacity 
                    style={[styles.btnNext, !formData.tipo_id && { opacity: 0.5 }]} 
                    onPress={handleNext}
                    disabled={!formData.tipo_id}
                  >
                    <Text style={styles.btnTextNext}>Continuar</Text>
                    <ArrowRight size={20} color="#1A2980" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.btnNext} onPress={handleFinalizar} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <ActivityIndicator color="#1A2980" />
                    ) : (
                      <Text style={styles.btnTextNext}>Finalizar</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {step === 4 && (
              <TouchableOpacity style={[styles.btnNext, { width: '100%', justifyContent: 'center' }]} onPress={concluir}>
                <Text style={styles.btnTextNext}>
                  {isEditing ? 'Voltar ao Histórico' : 'Voltar ao Início'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, fontWeight: '600' },
  card: { backgroundColor: 'rgba(25, 30, 50, 0.6)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  stepContainer: { marginBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  stepSubtitle: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 24 },
  cardsContainer: { gap: 15 },
  typeCard: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', position: 'relative' },
  typeCardActive: { borderColor: '#26D0CE', backgroundColor: 'rgba(38, 208, 206, 0.1)' },
  typeLabel: { color: '#A0AEC0', fontSize: 18, fontWeight: '600', marginLeft: 15 },
  typeLabelActive: { color: '#fff' },
  checkBadge: { position: 'absolute', right: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: '#26D0CE', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  unitPrefix: { color: '#26D0CE', fontWeight: 'bold', fontSize: 16, marginRight: 10 },
  inputTextValue: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 15 },
  input: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 15 },
  reviewCard: { backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 20 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  reviewLabel: { color: '#A0AEC0', fontSize: 14 },
  reviewValueHighlight: { color: '#26D0CE', fontWeight: 'bold', fontSize: 16 },
  reviewValueNumber: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  reviewValue: { color: '#fff', fontSize: 14 },
  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 5 },
  stepperControls: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
  btnBack: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  btnTextBack: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  btnNext: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#26D0CE', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30 },
  btnTextNext: { color: '#1A2980', fontWeight: 'bold', marginRight: 8 },
  
  recentSection: { marginTop: 30, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 15 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  recentTitle: { color: '#26D0CE', fontSize: 14, fontWeight: 'bold', marginLeft: 8, textTransform: 'uppercase' },
  recentItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  recentInfo: { flex: 1 },
  recentCategory: { color: '#fff', fontSize: 14, fontWeight: '600' },
  recentDate: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  recentValue: { color: '#26D0CE', fontSize: 14, fontWeight: 'bold' },
  viewFullHistory: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingTop: 8 },
  viewFullHistoryText: { color: '#26D0CE', fontSize: 12, fontWeight: 'bold', marginRight: 5 },

  ocrShortcut: { marginBottom: 20, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(38, 208, 206, 0.3)' },
  ocrShortcutGradient: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  ocrShortcutTextWrapper: { flex: 1, marginLeft: 15 },
  ocrShortcutTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ocrShortcutSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  
  suggestionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(38, 208, 206, 0.1)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: 'rgba(38, 208, 206, 0.2)' },
  suggestionText: { color: '#26D0CE', fontSize: 13, fontWeight: '600', marginLeft: 8 }
});