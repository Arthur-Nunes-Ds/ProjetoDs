import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'; 
import { useFonts, Ubuntu_300Light, Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';
import { AntDesign } from '@expo/vector-icons'; 

//import { GoogleSignin } from '@react-native-google-signin/google-signin';
//import auth from '@react-native-firebase/auth';

const GoogleSignin = {}; 
const auth = () => ({});

const MODO_EXPO_GO = true; 


export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

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
    <View style={styles.fundo}>
      <View style={styles.caixa}>
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

        <TouchableOpacity style={styles.botao_redondo}>
            <Text style={styles.texto_botao}>Entrar</Text>
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
            <Text style={styles.texto_cadastro}>Novo por aqui? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
                <Text style={styles.texto_cadastro_link}>Criar conta</Text>
            </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: '#306BAC',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  caixa: {
    backgroundColor: '#bababaa6',
    width: 350,
    paddingVertical: 40, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#c2c2c2',
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
  
  // ESTILO DAS CAIXAS DE ENTRADA
  input: {
    backgroundColor: '#ffffff33', 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    color: '#fff', 
    padding: 15,
    fontSize: 16,
    fontFamily: 'Ubuntu_400Regular',
    marginBottom: 15, 
  },
  botao_redondo:{
    borderRadius:50,
    backgroundColor:'#ffffff',
    borderWidth:1,
    borderColor:'#fff',
    padding:10,
    width:250,
    height:60,
    marginVertical:10, // Troquei 'margin' por 'marginVertical' para não afetar as laterais
    alignSelf:'center',
    justifyContent: 'center', // Adicionado para garantir que o texto fique no meio
  },
  texto_botao:{
    color:'#000000',
    fontSize:20,
    textAlign:'center',
  },

  // ESTILOS DO DIVISOR
  divisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15, 
  },
  linha: {
    flex: 1,
    height: 1,
    backgroundColor: '#d7d7d7',
  },
  textoDivisor: {
    color: '#d7d7d7',
    marginHorizontal: 10,
    fontFamily: 'Ubuntu_300Light',
  },

  // ESTILOS DO BOTÃO DO GOOGLE
  botaoGoogle: {
    backgroundColor: '#fff',
    borderRadius: 50, // Deixei bem redondo combinando com o seu botão de Login
    padding: 15,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Dá um espaço antes da área de "Cadastrar"
  },
  textoBotaoGoogle: {
    color: '#000000',
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 16,
    marginLeft: 10, 
  },

  // ESTILOS DA ÁREA DE CADASTRO
  containerCadastro: {
    flexDirection: 'row', // Coloca lado a lado
    justifyContent: 'center', // Centraliza
    alignItems: 'center',
    marginTop: 10,
  },
  texto_cadastro:{
    color:'#ececec',
    fontSize:15,
    textAlign:'center',
  },
  texto_cadastro_link:{
    color:'#fff',
    fontSize:15,
    fontWeight:'bold', // Deixa a palavra "Cadastrar" mais gordinha pra chamar atenção
  },
});