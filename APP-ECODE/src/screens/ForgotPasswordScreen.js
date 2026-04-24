import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { authService } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      Alert.alert(
        'E-mail Enviado', 
        'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.log('Erro ao solicitar reset de senha:', error);
      Alert.alert('Erro', 'Não foi possível processar sua solicitação. Verifique o e-mail ou tente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#141E30', '#243B55']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#fff" size={28} />
        </TouchableOpacity>

        <View style={styles.content}>
          <BlurView intensity={30} style={styles.card}>
            <Text style={styles.title}>Esqueci minha senha</Text>
            <Text style={styles.subtitle}>
              Informe seu e-mail abaixo e enviaremos as instruções para você recuperar o acesso.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-MAIL</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#26D0CE" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu e-mail cadastrado..."
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.primaryBtn} 
              onPress={handleResetRequest}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1A2980" />
              ) : (
                <Text style={styles.primaryBtnText}>Enviar Instruções</Text>
              )}
            </TouchableOpacity>
          </BlurView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  backBtn: { padding: 20, marginTop: 10 },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    padding: 30,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  inputGroup: { marginBottom: 30 },
  label: { color: '#26D0CE', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 15 },
  primaryBtn: {
    backgroundColor: '#26D0CE',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#26D0CE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: { color: '#1A2980', fontSize: 16, fontWeight: 'bold' }
});
