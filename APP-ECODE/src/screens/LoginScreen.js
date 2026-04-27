import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import { useFonts, Ubuntu_300Light, Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 

// Importações do projeto reestruturado
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    Ubuntu_300Light,
    Ubuntu_400Regular,
  });

  if (!fontsLoaded) return null;

  const fazerLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha seu e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, senha);

      console.log('Login efetuado com sucesso!');
      setEmail('');
      setSenha('');

      navigation.navigate('Detalhes'); 
    } catch (error) {
      console.log('Erro no login:', error);

      if (error.response) {
        if (error.response.status === 404) {
          Alert.alert('Falha no Login', 'Usuário não verificado, email ou senha inválidos.');
        } else if (error.response.status === 422) {
          Alert.alert('Erro de Validação', 'Formato de dados enviado é inválido.');
        } else {
          Alert.alert('Erro no Servidor', 'Ocorreu um erro interno (500). Tente novamente mais tarde.');
        }
      } else {
        Alert.alert('Erro de Conexão', 'Não foi possível se conectar ao servidor.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.fundo}>
      <BlurView intensity={30} tint="light" style={styles.caixa}>
        
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Bem-vindo</Text>
          <Text style={styles.sub_titulo}>Ecode Project</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@email.com"
          placeholderTextColor="#d7d7d7"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none" 
          keyboardType="email-address" 
        />
        
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="••••••••"
            placeholderTextColor="#d7d7d7"
            secureTextEntry={!showPassword}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff color="#fff" size={20} />
            ) : (
              <Eye color="#fff" size={20} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.botao_redondo} 
          onPress={fazerLogin}
          disabled={isLoading} 
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#1A2980" />
          ) : (
            <Text style={styles.texto_botao}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divisorContainer}>
          <View style={styles.linha} />
          <Text style={styles.textoDivisor}>ou</Text>
          <View style={styles.linha} />
        </View>

        <View style={styles.containerCadastro}>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.texto_cadastro_link}>Criar conta</Text>
          </TouchableOpacity>
          <Text style={styles.texto_divisor_footer}> | </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.texto_cadastro_link}>Esqueci Senha</Text>
          </TouchableOpacity>
          <Text style={styles.texto_divisor_footer}> | </Text>
          <TouchableOpacity onPress={() => navigation.navigate('VerificarEmail')}>
            <Text style={styles.texto_cadastro_link}>Verificar Email</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={{ marginTop: 20, alignItems: 'center' }} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.texto_cadastro_link, { fontSize: 14, opacity: 0.8 }]}>Sobre o aplicativo</Text>
        </TouchableOpacity>


      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  caixa: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    width: 350,
    paddingVertical: 40, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden', 
  },
  cabecalho: {
    marginBottom: 40, 
    alignItems: 'center',
  },
  titulo: {
    fontFamily: 'Ubuntu_400Regular',
    color: '#fff',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 5,
  },
  sub_titulo: {
    fontFamily: 'Ubuntu_400Regular',
    color: '#d7d7d7',
    fontSize: 15,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    color: '#fff', 
    padding: 15,
    fontSize: 16,
    fontFamily: 'Ubuntu_400Regular',
    marginBottom: 15, 
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 15, 
  },
  inputPassword: {
    flex: 1,
    color: '#fff', 
    padding: 15,
    fontSize: 16,
    fontFamily: 'Ubuntu_400Regular',
  },
  eyeIcon: {
    padding: 10,
  },
  botao_redondo:{
    borderRadius:50,
    backgroundColor:'#ffffff',
    padding:15, 
    width: '100%', 
    marginVertical:10, 
    alignSelf:'center',
    justifyContent: 'center', 
    height: 55, 
  },
  texto_botao:{
    color:'#1A2980', 
    fontSize: 18,
    fontFamily: 'Ubuntu_400Regular',
    textAlign:'center',
  },
  divisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15, 
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
  },
  textoDivisor: {
    color: '#fff',
    marginHorizontal: 10,
    fontFamily: 'Ubuntu_300Light',
  },
  containerCadastro: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10,
  },
  texto_cadastro_link:{
    color:'#fff',
    fontSize:15,
    fontFamily: 'Ubuntu_400Regular', 
  },
  texto_divisor_footer: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 5,
    fontSize: 15,
  },
});