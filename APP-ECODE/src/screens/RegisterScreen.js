import React, { useState } from 'react'; 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'; 
import { useFonts, Ubuntu_300Light, Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';
import { AntDesign } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; 

// Importações do projeto reestruturado
import { authService } from '../services/authService';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const [fontsLoaded] = useFonts({
    Ubuntu_300Light,
    Ubuntu_400Regular,
  });

  if (!fontsLoaded) return null;

  const fazerCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.register(nome, email, senha);

      Alert.alert('Sucesso!', 'Sua conta foi criada. Faça o login para continuar.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
      
      setNome('');
      setEmail('');
      setSenha('');
    } catch (error) {
      console.log('Erro no cadastro:', error);

      if (error.response) {
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
        Alert.alert('Erro de Conexão', 'Verifique sua conexão com a internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.fundo}>
      <BlurView intensity={30} tint="light" style={styles.caixa}>
        
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>

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
    paddingTop: 20,
    paddingBottom: 40, 
    paddingHorizontal: 20, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden', 
  },
  botaoVoltar: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  cabecalho: {
    marginBottom: 30, 
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
    height: 55, 
  },
  texto_botao:{
    color:'#1A2980', 
    fontSize: 18,
    fontFamily: 'Ubuntu_400Regular',
    textAlign:'center',
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