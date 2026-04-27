import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, CheckCircle, ArrowLeft, Save } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PreferencesScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/user/Dados_User', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNome(response.data.mensagem?.nome || '');
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome não pode estar vazio.');
      return;
    }

    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      
      // Atualizando o nome do usuário usando o endpoint correto
      await api.put('/user/Editar_User', 
        { nome: nome.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Sucesso', 'Suas alterações foram salvas!');
      navigation.goBack();
    } catch (error) {
      console.log('Erro ao salvar alterações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
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
          <Text style={styles.headerTitle}>Preferências</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <User color="#26D0CE" size={40} style={styles.infoIcon} />
            <Text style={styles.infoTitle}>Perfil do Usuário</Text>
            <Text style={styles.infoText}>
              Mantenha seus dados atualizados para uma melhor experiência no ECODE.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Nome de Exibição</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#1A2980" />
              ) : (
                <>
                  <Save size={20} color="#1A2980" style={{ marginRight: 10 }} />
                  <Text style={styles.submitBtnText}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
  formContainer: { marginTop: 10 },
  inputWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 30
  },
  input: { 
    padding: 15, 
    color: '#fff', 
    fontSize: 18, 
  },
  submitBtn: { 
    backgroundColor: '#fff', 
    paddingVertical: 18, 
    borderRadius: 50, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  submitBtnText: { color: '#1A2980', fontSize: 18, fontWeight: 'bold' },
});
