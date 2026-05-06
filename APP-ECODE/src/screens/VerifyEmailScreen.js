import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MailCheck, XCircle, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react-native';
import api from '../services/api';


export default function VerifyEmailScreen({ route, navigation }) {
  // Pega o token se ele vier da navegação (ex: Deep Link do email)
  const tokenParam = route?.params?.token || '';

  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [status, setStatus] = useState(tokenParam ? 'loading' : 'idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Se a tela já abrir recebendo o token via rota, tenta verificar automaticamente
  useEffect(() => {
    if (tokenParam) {
      verificarToken(tokenParam);
    }
  }, [tokenParam]);

  const verificarToken = async (jwt) => {
    if (!jwt) return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      await api.get(`/public/Verificar_Email/${jwt}`);

      setStatus('success');
    } catch (error) {
      console.log('Erro na verificação de email:', error);
      setStatus('error');
      
      if (error.response && error.response.status === 401) {
        setErrorMessage('Token inválido ou expirado. Solicite um novo e-mail de verificação.');
      } else {
        setErrorMessage('Ocorreu um erro ao verificar o e-mail. Tente novamente mais tarde.');
      }
    }
  };

  const handleVerificacaoManual = () => {
    if (!tokenInput.trim()) {
      setStatus('error');
      setErrorMessage('Por favor, insira o código de verificação ou token JWT.');
      return;
    }
    verificarToken(tokenInput.trim());
  };

  // --- RENDERIZADORES DE ESTADO ---

  const renderIdle = () => (
    <>
      <View style={styles.iconContainer}>
        <MailCheck size={64} color="#26D0CE" />
      </View>
      <Text style={styles.title}>Verifique seu E-mail</Text>
      <Text style={styles.subtitle}>
        Insira o código de verificação ou o token JWT enviado para o seu e-mail para ativar sua conta.
      </Text>

      <View style={styles.inputWrapper}>
        <KeyRound size={20} color="#26D0CE" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#A0AEC0"
          placeholder="Cole seu token aqui..."
          value={tokenInput}
          onChangeText={setTokenInput}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.btnPrimary} onPress={handleVerificacaoManual}>
        <Text style={styles.btnPrimaryText}>Verificar Conta</Text>
      </TouchableOpacity>
    </>
  );

  const renderLoading = () => (
    <View style={styles.centerContent}>
      <ActivityIndicator size={80} color="#26D0CE" />
      <Text style={[styles.title, { marginTop: 24 }]}>Verificando...</Text>
      <Text style={styles.subtitle}>Aguarde enquanto validamos seu e-mail de forma segura.</Text>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.centerContent}>
      <View style={styles.iconContainerSuccess}>
        <CheckCircle2 size={80} color="#4ade80" />
      </View>
      <Text style={styles.title}>E-mail Verificado!</Text>
      <Text style={styles.subtitle}>
        Sua conta foi ativada com sucesso. Você já pode acessar todos os recursos do aplicativo.
      </Text>
      <TouchableOpacity 
        style={[styles.btnPrimary, { marginTop: 20 }]} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.btnPrimaryText}>Ir para o Login</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerContent}>
      <View style={styles.iconContainerError}>
        <XCircle size={80} color="#f87171" />
      </View>
      <Text style={styles.title}>Falha na Verificação</Text>
      <Text style={[styles.subtitle, { color: '#fca5a5' }]}>
        {errorMessage}
      </Text>
      <TouchableOpacity 
        style={[styles.btnSecondary, { marginTop: 20 }]} 
        onPress={() => setStatus('idle')}
      >
        <Text style={styles.btnSecondaryText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.card}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            {status === 'idle' && renderIdle()}
            {status === 'loading' && renderLoading()}
            {status === 'success' && renderSuccess()}
            {status === 'error' && renderError()}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(25, 30, 50, 0.75)', 
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(38, 208, 206, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(38, 208, 206, 0.3)',
  },
  iconContainerSuccess: {
    marginBottom: 20,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  iconContainerError: {
    marginBottom: 20,
    shadowColor: '#f87171',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 15,
  },
  btnPrimary: {
    backgroundColor: '#26D0CE',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  btnPrimaryText: {
    color: '#1A2980',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});