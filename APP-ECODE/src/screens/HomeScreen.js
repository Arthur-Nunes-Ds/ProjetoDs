import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useFonts, Ubuntu_300Light, Ubuntu_400Regular } from '@expo-google-fonts/ubuntu';
import { AntDesign } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
      Ubuntu_300Light,
      Ubuntu_400Regular,
    });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.fundo}>
      <ImageBackground 
        source={require('../../assets/Fundo.png')} 
        style={styles.containerFundo} 
        resizeMode="cover"
      >
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={28} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.texto_1}>
          <Text style={styles.titulo_1}>Consumo inteligente.{'\n'}
            <Text style={{color:'#b3b3b3'}}>
              Sustentabilidade no dia a dia.
            </Text>
            <Text style={styles.sub_titulo_1}>{'\n\n'}Acompanhe e reduza o consumo de água, energia e materiais
              com dados claros e decisões conscientes.{'\n'}
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.botao_redondo}>
            <Text style={styles.texto_botao}>Começar agora</Text>
        </TouchableOpacity> 

        <TouchableOpacity
          style={[styles.botao_redondo, {backgroundColor:'#ffffff00'}]}>
            <Text style={[styles.texto_botao,{color:'#fff'}]}>Ver recursos</Text>
        </TouchableOpacity>

        <View style={styles.caixas_view}>

          <TouchableOpacity style={styles.caixa}>
            <Text style={styles.texto_caixa1}>REDUZA ATÉ 30%</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 30, paddingVertical: 0}]}>Água</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 15, paddingVertical: 20}]}>Monitore o consumo diário de água.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.caixa}>
            <Text style={styles.texto_caixa1}>ECONOMIA INTELIGENTE</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 30, paddingVertical: 0}]}>Energia</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 15, paddingVertical: 20}]}>Visualize picos de consumo elétrico.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.caixa}>
            <Text style={styles.texto_caixa1}>SUSTENTABILIDADE</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 30, paddingVertical: 0}]}>Materiais</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 15, paddingVertical: 20}]}>Controle o uso e descarte de materiais.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.caixa}>
            <Text style={styles.texto_caixa1}>CUSTOMIZAÇÃO</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 30, paddingVertical: 0}]}>Personalizados</Text>
            <Text style={[styles.texto_caixa1,{fontSize: 15, paddingVertical: 20}]}>Personalização de acordo com o usuário.</Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.frase}>
          Sustentabilidade começa com consciência.
        </Text>

      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fundo:{
    flex:1, 
    backgroundColor: '#306BAC' 
  },
  containerFundo: {
    flex: 1, 
    width: '100%',
  },
  botaoVoltar: {
    padding: 20,
    marginTop: 40,
  },
  texto_1:{
    padding:30,
    marginTop: 20,
  },
  titulo_1:{
    fontFamily:'Ubuntu_400Regular',
    color:'#fff',
    fontSize:30,
  },
  sub_titulo_1:{
    fontFamily:'Ubuntu_400Regular',
    color:'#d5d5d5',
    fontSize:18,
  },
  botao_redondo:{
    borderRadius:50,
    backgroundColor:'#ffffff',
    borderWidth:1,
    borderColor:'#fff',
    padding:10,
    width:200,
    height:60,
    margin:10,
    left:10,
  },
  texto_botao:{
    color:'#000000',
    fontSize:20,
    textAlign:'center',
    paddingTop:3,
  },
  caixas_view:{
    marginVertical:100,
  },
  caixa:{
    width:350,
    height:150,
    borderWidth:1,
    borderRadius:20,
    margin:20,
    backgroundColor:'#4d4d4d5e', 
    borderColor:'#d0d0d0e9',
  },
  texto_caixa1:{
    color:'#d9d9d9',
    textAlign:'left',
    paddingHorizontal:30, 
    paddingVertical:20,  
    fontFamily:'Ubuntu_400Regular'
  },
  frase:{
    textAlign:'center',
    fontSize:30,
    fontFamily:'Ubuntu_400Regular',
    color:'#fff',
    marginBottom:100, 
  }
});