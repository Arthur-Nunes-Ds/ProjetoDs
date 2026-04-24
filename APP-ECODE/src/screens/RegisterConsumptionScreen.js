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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Droplet, Box, CheckCircle, Edit3, Calendar, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native'; 

// Importações do projeto reestruturado
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterConsumptionScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  
  const [formData, setFormData] = useState({
    tipo_id: null,               
    valor: '',              
    dt_perioto: new Date().toISOString()
  });

  useEffect(() => {
    carregarTipos();
  }, []);

  const carregarTipos = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/tipo_consumo/Mostrar_Tipos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiposDisponiveis(response.data.mensagem || []);
    } catch (error) {      // Fallback para teste/debug se a API falhar ou retornar vazia
      setTiposDisponiveis([
        { id: 1, nome: 'Água', unidade_medida: 'm³' },
        { id: 2, nome: 'Energia', unidade_medida: 'kWh' },
        { id: 3, nome: 'Gás', unidade_medida: 'kg' }
      ]);
    } finally {
      setLoadingTipos(false);
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

      // 3. Fazer a requisição POST
      await api.post('/consumo/Criar_Consumo', payload, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      });

      // 4. Sucesso!
      setStep(4); 

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
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Detalhes do Consumo</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>VALOR / LEITURA</Text>
        <View style={styles.inputWrapper}>
          <DollarSign size={20} color="#26D0CE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholderTextColor="#A0AEC0"
            placeholder="0.00"
            keyboardType="numeric"
            value={formData.valor}
            onChangeText={(text) => setFormData({...formData, valor: text})}
          />
        </View>
      </View>

    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>DATA DO REGISTRO (AAAA-MM-DD)</Text>
        <View style={styles.inputWrapper}>
          <Calendar size={20} color="#26D0CE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholderTextColor="#A0AEC0"
            value={formData.dt_perioto.split('T')[0]}
            onChangeText={(text) => setFormData({...formData, dt_perioto: text})}
          />
        </View>
      </View>
    </View>
  );

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
            <Text style={styles.reviewValue}>{formData.dt_perioto.split('T')[0]}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={[styles.stepContainer, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
      <CheckCircle size={80} color="#26D0CE" />
      <Text style={[styles.stepTitle, { marginTop: 20 }]}>Registrado!</Text>
      <Text style={styles.stepSubtitle}>Os dados foram salvos com sucesso.</Text>
    </View>
  );

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Novo Registro</Text>
            <Text style={styles.subtitle}>GERENCIAMENTO DE RECURSOS</Text>
          </View>

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
                <Text style={styles.btnTextNext}>Voltar ao Início</Text>
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
  btnTextNext: { color: '#1A2980', fontWeight: 'bold', marginRight: 8 }
});