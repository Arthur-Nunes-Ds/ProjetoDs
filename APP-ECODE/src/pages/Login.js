import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import { useFonts, Ubuntu_300Light, Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';
import { AntDesign } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 

// Importações adicionadas para a integração
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GoogleSignin = {}; 
const auth = () => ({});

const MODO_EXPO_GO = true; 
const API_URL = 'https://api.2dsmoca.tech'; // Removida a barra final para evitar duplicidade de barras na URL

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Novo estado de carregamento

  useEffect(() => {
    if (!MODO_EXPO_GO) {
      GoogleSignin.configure({
        webClientId: '331879954859-8njdnh9tuuraooo0cit8l9dovrg2ar5e.apps.googleusercontent.com', 
      });
    }
  }, []);

  let [fontsLoaded] = useFonts({
    Ubuntu_300Light,
    Ubuntu_400Regular,
  });

  if (!fontsLoaded) return null;

  // Função de Login Integrada com o Backend
  const fazerLogin = async () => {
    // Validação básica de campos vazios
    if (!email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha seu e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      // Formatando os dados para application/x-www-form-urlencoded
      const formBody = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(senha)}`;

      const response = await axios.post(`${API_URL}/public/Logar_Conta`, formBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Extraindo o token e salvando no dispositivo
      const token = response.data.access_token;
      await AsyncStorage.setItem('@jwt_token', token);

      console.log('Login efetuado com sucesso!');
      
      // Limpa os campos após o login (opcional)
      setEmail('');
      setSenha('');

      // Redireciona para a próxima tela autenticada
      navigation.navigate('Teste'); 

    } catch (error) {
      console.log('Erro no login:', error);

      if (error.response) {
        // Tratamento de erros previstos no Swagger
        if (error.response.status === 404) {
          Alert.alert('Falha no Login', 'Usuário não verificado, email ou senha inválidos.');
        } else if (error.response.status === 422) {
          Alert.alert('Erro de Validação', 'Formato de dados enviado é inválido.');
        } else {
          Alert.alert('Erro no Servidor', 'Ocorreu um erro interno (500). Tente novamente mais tarde.');
        }
      } else {
        Alert.alert('Erro de Conexão', 'Não foi possível se conectar ao servidor. Verifique sua internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fazerLoginGoogle = async () => {
    if (MODO_EXPO_GO) {
      navigation.navigate('Detalhes'); 
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const usuarioLogado = await auth().signInWithCredential(googleCredential);
      
      console.log("Login Real Sucesso!", usuarioLogado.user);
      navigation.navigate('Teste');
    } catch (error) {
      console.log("Erro Real:", error);
      Alert.alert("Erro", "Falha no login real. Verifique se está usando build nativa.");
    }
  }

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
          keyboardType="email-address" // Facilita o preenchimento no teclado móvel
        />
        
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#d7d7d7"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity 
          style={styles.botao_redondo} 
          onPress={fazerLogin}
          disabled={isLoading} // Impede múltiplos cliques acidentais
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

        <TouchableOpacity style={styles.botaoGoogle} onPress={navigation.navigate('VerificarEmail')}>
          <AntDesign name="verificar" size={24} color="#DB4437" />
          <Text style={styles.textoBotaoGoogle}>Verificar Email</Text>
        </TouchableOpacity>

        <View style={styles.containerCadastro}>
            <Text style={styles.texto_cadastro}>Novo por aqui? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.texto_cadastro_link}>Criar conta</Text>
            </TouchableOpacity>
        </View>

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
  botao_redondo:{
    borderRadius:50,
    backgroundColor:'#ffffff',
    padding:15, 
    width: '100%', 
    marginVertical:10, 
    alignSelf:'center',
    justifyContent: 'center', 
    height: 55, // Fixado para evitar "pulos" de layout quando vira ActivityIndicator
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
  botaoGoogle: {
    backgroundColor: '#fff',
    borderRadius: 50, 
    padding: 15,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
  },
  textoBotaoGoogle: {
    color: '#000000',
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 16,
    marginLeft: 10, 
  },
  containerCadastro: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 10,
  },
  texto_cadastro:{
    color:'#ececec',
    fontSize:15,
    fontFamily: 'Ubuntu_300Light',
    textAlign:'center',
  },
  texto_cadastro_link:{
    color:'#fff',
    fontSize:15,
    fontFamily: 'Ubuntu_400Regular', 
  },
});