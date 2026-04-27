import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Shield, Trash2, LogOut, Settings } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState({ nome: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      if (token === 'DEBUG_TOKEN') {
        setUser({ nome: 'Dev Teste', email: 'debug@echo.de' });
        setIsLoading(false);
        return;
      }

      const response = await api.get('/user/Dados_User', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.mensagem || { nome: 'Usuário', email: '' });
    } catch (error) {
      console.log('Erro ao carregar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar as informações da conta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@jwt_token');
    navigation.replace('Login');
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é permanente e todos os seus dados serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: handleDeleteAccount }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      await api.delete('/user/Deletar_Conta', {
        headers: { Authorization: `Bearer ${token}` }
      });

      await AsyncStorage.removeItem('@jwt_token');
      Alert.alert('Conta Excluída', 'Sua conta foi removida com sucesso.');
      navigation.replace('Login');
    } catch (error) {
      console.log('Erro detalhado ao excluir conta:', error);
      let errorMsg = 'Não foi possível excluir a conta. Tente novamente mais tarde.';
      
      if (error.response) {
        errorMsg = `Erro ${error.response.status}: ${error.response.data.mensagem || 'Erro no servidor'}`;
      }
      
      Alert.alert('Erro', errorMsg);
    } finally {
      setIsDeleting(false);
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
          <Text style={styles.headerTitle}>Minha Conta</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User color="#fff" size={50} />
            </View>
            <Text style={styles.userName}>{user.nome}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurações</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#3b82f6' }]}>
                <Shield color="#fff" size={20} />
              </View>
              <Text style={styles.menuItemText}>Segurança e Privacidade</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('Preferences')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#10b981' }]}>
                <Settings color="#fff" size={20} />
              </View>
              <Text style={styles.menuItemText}>Preferências</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={[styles.iconContainer, { backgroundColor: '#f59e0b' }]}>
                <LogOut color="#fff" size={20} />
              </View>
              <Text style={styles.menuItemText}>Sair da Conta</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomWidth: 0 }]} 
              onPress={confirmDeleteAccount}
              disabled={isDeleting}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#ef4444' }]}>
                {isDeleting ? <ActivityIndicator size="small" color="#fff" /> : <Trash2 color="#fff" size={20} />}
              </View>
              <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Excluir Conta</Text>
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
  profileCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    borderRadius: 24, 
    padding: 30, 
    alignItems: 'center', 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  avatarContainer: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#fff'
  },
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userEmail: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 16, marginTop: 5 },
  section: { 
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    borderRadius: 20, 
    padding: 10, 
    marginBottom: 20 
  },
  sectionTitle: { 
    color: 'rgba(255, 255, 255, 0.5)', 
    fontSize: 12, 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    marginLeft: 15, 
    marginTop: 10, 
    marginBottom: 5 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.05)' 
  },
  iconContainer: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  menuItemText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
