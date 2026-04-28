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
import { Target, Zap, Droplet, Box, CheckCircle, Trash2, Calendar } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateGoalScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [tiposDisponiveis, setTiposDisponiveis] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [goalValue, setGoalValue] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [existingGoals, setExistingGoals] = useState([]);
  const [loadingMetas, setLoadingMetas] = useState(true);

  useEffect(() => {
    carregarTipos();
    carregarMetas();
  }, []);

  const carregarTipos = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/tipo_consumo/Mostrar_Tipos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTiposDisponiveis(response.data.mensagem || []);
    } catch (error) {
      setTiposDisponiveis([
        { id: 1, nome: 'Água', unidade_medida: 'L' },
        { id: 2, nome: 'Energia', unidade_medida: 'kWh' },
        { id: 3, nome: 'Gás', unidade_medida: 'kg' }
      ]);
    } finally {
      setLoadingTipos(false);
    }
  };
  const carregarMetas = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/meta/Listar_Metas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExistingGoals(response.data.mensagem || []);
    } catch (error) {
      console.log('Erro ao carregar metas:', error);
    } finally {
      setLoadingMetas(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    Alert.alert(
      'Excluir Meta',
      'Tem certeza que deseja remover esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('@jwt_token');
              await api.delete(`/meta/Del_Meta/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              carregarMetas();
              Alert.alert('Sucesso', 'Meta removida com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a meta.');
            }
          }
        }
      ]
    );
  };

  const handleCreateGoal = async () => {
    if (!selectedType || !goalValue) {
      Alert.alert('Atenção', 'Por favor, selecione uma categoria e defina um valor para a meta.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      
      // Montar o payload com os nomes de campos corrigidos conforme erro de validação
      const payload = {
        valor_meta: parseFloat(goalValue.replace(',', '.')),
        TIPO_CONSUMO_id: parseInt(selectedType.id),
        periodo: new Date().toISOString()
      };

      console.log('Enviando meta:', JSON.stringify(payload));

      await api.post('/meta/Criar_Meta', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsSuccess(true);
    } catch (error) {
      console.log('Erro detalhado ao criar meta:', error);
      
      if (error.response && error.response.status === 422) {
        const detalhes = error.response.data.detail;
        let msg = 'Dados inválidos.';
        if (Array.isArray(detalhes)) {
          msg = detalhes.map(d => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join('\n');
        }
        Alert.alert('Erro de Validação', msg);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a meta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
        <SafeAreaView style={styles.centered}>
          <CheckCircle size={80} color="#fff" />
          <Text style={styles.successTitle}>Meta Definida!</Text>
          <Text style={styles.successSubtitle}>Sua nova meta foi salva com sucesso.</Text>
          <TouchableOpacity 
            style={styles.finishBtn} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.finishBtnText}>Voltar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AntDesign name="left" color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Meta</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <Target color="#26D0CE" size={40} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Defina seus objetivos</Text>
            <Text style={styles.infoText}>
              Estabeleça metas mensais de consumo para ajudar na sua economia e na preservação do planeta.
            </Text>
          </View>

          <Text style={styles.label}>Selecione a Categoria</Text>
          <View style={styles.typesContainer}>
            {loadingTipos ? (
              <ActivityIndicator color="#fff" />
            ) : (
              tiposDisponiveis.map((tipo) => {
                const isSelected = selectedType?.id === tipo.id;
                let Icone = Box;
                if (tipo.nome.toLowerCase().includes('energia')) Icone = Zap;
                else if (tipo.nome.toLowerCase().includes('agua') || tipo.nome.toLowerCase().includes('água')) Icone = Droplet;

                return (
                  <TouchableOpacity 
                    key={tipo.id} 
                    style={[styles.typeCard, isSelected && styles.typeCardActive]}
                    onPress={() => setSelectedType(tipo)}
                  >
                    <Icone size={24} color={isSelected ? '#1A2980' : '#fff'} />
                    <Text style={[styles.typeText, isSelected && styles.typeTextActive]}>{tipo.nome}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          {selectedType && (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Valor da Meta ({selectedType.unidade_medida}/mês)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 150"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                keyboardType="numeric"
                value={goalValue}
                onChangeText={setGoalValue}
              />

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleCreateGoal}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#1A2980" />
                ) : (
                  <Text style={styles.submitBtnText}>Salvar Meta</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.existingGoalsSection}>
            <Text style={styles.sectionTitle}>Suas Metas Atuais</Text>
            {loadingMetas ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
            ) : existingGoals.length > 0 ? (
              existingGoals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalInfo}>
                    <View style={styles.goalIconWrapper}>
                      {goal.tipoConsumo.toLowerCase().includes('energia') ? (
                        <Zap size={20} color="#facc15" />
                      ) : goal.tipoConsumo.toLowerCase().includes('agua') || goal.tipoConsumo.toLowerCase().includes('água') ? (
                        <Droplet size={20} color="#60a5fa" />
                      ) : (
                        <Box size={20} color="#4ade80" />
                      )}
                    </View>
                    <View>
                      <Text style={styles.goalCardTitle}>{goal.tipoConsumo}</Text>
                      <Text style={styles.goalCardValue}>Limite: {goal.valorMeta} {goal.tipoConsumo.toLowerCase().includes('energia') ? 'kWh' : goal.tipoConsumo.toLowerCase().includes('agua') || goal.tipoConsumo.toLowerCase().includes('água') ? 'L' : 'kg'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteGoal(goal.id)}
                  >
                    <Trash2 size={20} color="#f87171" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noGoalsText}>Nenhuma meta definida ainda.</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 10 
  },
  backBtn: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  infoCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 20, 
    padding: 25, 
    alignItems: 'center', 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  infoIcon: { marginBottom: 15 },
  infoTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  infoText: { color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', lineHeight: 22 },
  label: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  typesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  typeCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  typeCardActive: { backgroundColor: '#fff', borderColor: '#fff' },
  typeText: { color: '#fff', marginLeft: 10, fontWeight: '600' },
  typeTextActive: { color: '#1A2980' },
  formContainer: { marginTop: 10 },
  input: { 
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    borderRadius: 15, 
    padding: 15, 
    color: '#fff', 
    fontSize: 18, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20
  },
  submitBtn: { 
    backgroundColor: '#fff', 
    paddingVertical: 18, 
    borderRadius: 50, 
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  submitBtnText: { color: '#1A2980', fontSize: 18, fontWeight: 'bold' },
  successTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 20 },
  successSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, marginTop: 10, textAlign: 'center' },
  finishBtn: { backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginTop: 40 },
  finishBtnText: { color: '#1A2980', fontWeight: 'bold', fontSize: 16 },
  existingGoalsSection: { marginTop: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 30 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  goalCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.2)', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  goalInfo: { flexDirection: 'row', alignItems: 'center' },
  goalIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  goalCardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  goalCardValue: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  deleteBtn: { padding: 10 },
  noGoalsText: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 20, fontStyle: 'italic' }
});
