import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native'; 
import { useFonts, Ubuntu_300Light, Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';
import { AntDesign } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 

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
    // 1. Substituí a View principal pelo LinearGradient
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.fundo}>
      
      {/* 2. Transformei a 'caixa' em um BlurView para o efeito de vidro */}
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

      </BlurView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    // Removida a cor sólida para o gradiente aparecer
    justifyContent: 'center', 
    alignItems: 'center',
  },
  caixa: {
    // Efeito Glassmorphism
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    width: 350,
    paddingVertical: 40, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden', // Importante para o BlurView respeitar as bordas arredondadas
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
  
  // ESTILO ADICIONADO: Faltava o estilo da label
  label: {
    color: '#fff',
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 14,
    marginBottom: 5,
    marginLeft: 5,
  },

  // ESTILO DAS CAIXAS DE ENTRADA
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Ajustado para combinar com o vidro
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
    padding:15, // Ajustado padding para ficar mais proporcional
    width: '100%', // Agora ele ocupa toda a largura da caixa, fica mais elegante
    marginVertical:10, 
    alignSelf:'center',
    justifyContent: 'center', 
  },
  texto_botao:{
    color:'#1A2980', // Cor do texto do botão combinando com o fundo
    fontSize: 18,
    fontFamily: 'Ubuntu_400Regular',
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Linha levemente transparente
  },
  textoDivisor: {
    color: '#fff',
    marginHorizontal: 10,
    fontFamily: 'Ubuntu_300Light',
  },

  // ESTILOS DO BOTÃO DO GOOGLE
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

  // ESTILOS DA ÁREA DE CADASTRO
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
    fontFamily: 'Ubuntu_400Regular', // Usando a fonte bold
  },
});