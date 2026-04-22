import React, { useState } from 'react';
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

// Importações para a integração com a API
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://api.2dsmoca.tech';

export default function CadastrarConsumo() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: '',               
    nome_personalizado: '', 
    valor: '',              
    data: new Date().toISOString().split('T')[0]
  });

  const selecionarTipo = (tipo) => {
    setFormData(prev => ({ ...prev, tipo: tipo, nome_personalizado: '' }));
  };

  const handleNext = () => {
    // Validação extra para o Passo 2
    if (step === 2) {
      if (formData.tipo === 'personalizado' && !formData.nome_personalizado.trim()) {
        Alert.alert('Atenção', 'Informe o nome do recurso personalizado.');
        return;
      }
      if (!formData.valor.trim() || isNaN(formData.valor)) {
        Alert.alert('Atenção', 'Informe um valor numérico válido.');
        return;
      }
      if (!formData.data.trim()) {
        Alert.alert('Atenção', 'A data do registro é obrigatória.');
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
        categoria: formData.tipo === 'personalizado' ? formData.nome_personalizado.trim() : formData.tipo,
        valor: parseFloat(formData.valor.replace(',', '.')), // Garante formato numérico válido
        data: formData.data
      };

      // 3. Fazer a requisição POST
      // ATENÇÃO: Substitua '/privado/Criar_Consumo' pela rota exata do seu Swagger
      await axios.post(`${API_URL}/privado/Criar_Consumo`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Envia o token JWT
        }
      });

      // 4. Sucesso! Vai para a tela final.
      setStep(4); 

    } catch (error) {
      console.log('Erro ao registrar consumo:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Sessão Expirada', 'Seu token venceu. Faça login novamente.');
          navigation.navigate('Login');
        } else if (error.response.status === 422) {
          Alert.alert('Erro de Validação', 'Verifique os dados informados.');
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
        {[
          { id: 'energia', label: 'Energia', icon: Zap, activeColor: '#26D0CE' },
          { id: 'agua', label: 'Água', icon: Droplet, activeColor: '#26D0CE' },
          { id: 'personalizado', label: 'Outro', icon: Box, activeColor: '#26D0CE' }
        ].map((item) => {
          const isActive = formData.tipo === item.id;
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.typeCard, isActive && styles.typeCardActive]}
              onPress={() => selecionarTipo(item.id)}
              activeOpacity={0.7}
            >
              <item.icon size={32} color={isActive ? item.activeColor : '#A0AEC0'} />
              <Text style={[styles.typeLabel, isActive && styles.typeLabelActive]}>
                {item.label}
              </Text>
              {isActive && (
                <View style={styles.checkBadge}>
                  <CheckCircle size={16} color="#1A2980" fill="#26D0CE" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Detalhes do Consumo</Text>
      
      {formData.tipo === 'personalizado' && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>NOME DO RECURSO</Text>
          <View style={styles.inputWrapper}>
            <Edit3 size={20} color="#26D0CE" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholderTextColor="#A0AEC0"
              placeholder="Ex: Internet..."
              value={formData.nome_personalizado}
              onChangeText={(text) => setFormData({...formData, nome_personalizado: text})}
            />
          </View>
        </View>
      )}

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
        <Text style={styles.inputLabel}>DATA DO REGISTRO</Text>
        <View style={styles.inputWrapper}>
          <Calendar size={20} color="#26D0CE" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholderTextColor="#A0AEC0"
            value={formData.data}
            onChangeText={(text) => setFormData({...formData, data: text})}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Revisão</Text>
      
      <View style={styles.reviewCard}>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Categoria</Text>
          <Text style={styles.reviewValueHighlight}>
            {formData.tipo === 'personalizado' ? formData.nome_personalizado || 'Outro' : formData.tipo.toUpperCase()}
          </Text>
        </View>
        <View style={styles.separator} />
        
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Valor Registrado</Text>
          <Text style={styles.reviewValueNumber}>{formData.valor || '0'}</Text>
        </View>
        <View style={styles.separator} />
        
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Data</Text>
          <Text style={styles.reviewValue}>{formData.data}</Text>
        </View>
      </View>
    </View>
  );

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
                    style={[styles.btnNext, !formData.tipo && { opacity: 0.5 }]} 
                    onPress={handleNext}
                    disabled={!formData.tipo}
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