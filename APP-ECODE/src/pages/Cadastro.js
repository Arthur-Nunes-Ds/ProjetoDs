import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import { useFonts, Ubuntu_300Light, Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';
import { AntDesign } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 

// Importação do Axios
import axios from 'axios';

// Mocks do Google/Firebase mantidos
const GoogleSignin = {}; 
const auth = () => ({});

const MODO_EXPO_GO = true; 
const API_URL = 'https://api.2dsmoca.tech';

export default function Cadastro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

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

  // Função de Cadastro Integrada com o Backend
  const fazerCadastro = async () => {
    // Validação de campos vazios
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      // Montando o payload esperado pelo backend (BaseCriarUsuario)
      const payload = {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha
      };

      // Requisição POST em formato JSON
      await axios.post(`${API_URL}/public/Criar_Conta`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Sucesso
      Alert.alert('Sucesso!', 'Sua conta foi criada. Faça o login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
      
      // Limpa os campos
      setNome('');
      setEmail('');
      setSenha('');

    } catch (error) {
      console.log('Erro no cadastro:', error);

      if (error.response) {
        // Tratamento de erros detalhado com base no Swagger
        switch (error.response.status) {
          case 409:
            Alert.alert('Conflito', 'Já existe uma conta cadastrada com este e-mail.');
            break;
          case 422:
            Alert.alert('Dados Inválidos', 'Verifique se o formato do e-mail ou senha estão corretos.');
            break;
          case 501:
          case 503:
            Alert.alert('Aviso', 'Conta criada, mas o serviço de e-mail está indisponível no momento.');
            break;
          case 500:
            Alert.alert('Erro no Servidor', 'Ocorreu um erro interno. Tente novamente mais tarde.');
            break;
          default:
            Alert.alert('Erro', 'Não foi possível realizar o cadastro.');
        }
      } else {
        Alert.alert('Erro de Conexão', 'Verifique sua conexão com a internet e tente novamente.');
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
          <Text style={styles.titulo}>Criar Conta</Text>
          <Text style={styles.sub_titulo}>Ecode Project</Text>
        </View>
        
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome Completo"
          placeholderTextColor="#d7d7d7"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

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
          onPress={fazerCadastro}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#1A2980" />
          ) : (
            <Text style={styles.texto_botao}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divisorContainer}>
          <View style={styles.linha} />
          <Text style={styles.textoDivisor}>ou</Text>
          <View style={styles.linha} />
        </View>

        <TouchableOpacity style={styles.botaoGoogle} onPress={fazerLoginGoogle}>
          <AntDesign name="google" size={24} color="#DB4437" />
          <Text style={styles.textoBotaoGoogle}>Continuar com o Google</Text>
        </TouchableOpacity>

        <View style={styles.containerCadastro}>
            <Text style={styles.texto_cadastro}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.texto_cadastro_link}>Login</Text>
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
    height: 55, // Previne pulos de UI quando o loading é ativado
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