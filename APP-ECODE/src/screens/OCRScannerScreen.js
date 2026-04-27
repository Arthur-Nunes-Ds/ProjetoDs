import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, Scan, CheckCircle, X, ArrowRight, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function OCRScannerScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [debugText, setDebugText] = useState('');

  const pickImage = async (useCamera = false) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permissão Negada', `É necessário acesso à ${useCamera ? 'câmera' : 'galeria'} para funcionar.`);
        return;
      }

      const result = useCamera 
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7, base64: true })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7, base64: true });

      if (!result.canceled) {
        const selectedImage = result.assets[0].uri;
        const base64 = result.assets[0].base64;
        setImage(selectedImage);
        processOCR(base64);
      }
    } catch (error) {
      console.log('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível carregar a imagem.');
    }
  };

  const processOCR = async (base64) => {
    setIsAnalyzing(true);
    setScanResult(null);
    
    try {
      // Usando a API gratuita do OCR.space (muito mais estável para mobile)
      const formData = new FormData();
      formData.append('base64Image', `data:image/jpeg;base64,${base64}`);
      formData.append('language', 'por');
      formData.append('apikey', 'K81116668888957'); // Key pública de teste/exemplo

      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.ParsedResults && response.data.ParsedResults.length > 0) {
        const text = response.data.ParsedResults[0].ParsedText;
        console.log('Texto Extraído:', text);
        setDebugText(text);

        // Lógica de extração baseada no texto real
        const lowerText = text.toLowerCase();
        let categoria = 'Energia'; 
        if (lowerText.includes('agua') || lowerText.includes('água') || lowerText.includes('sabesp') || lowerText.includes('saneamento')) {
          categoria = 'Água';
        } else if (lowerText.includes('gas') || lowerText.includes('gás') || lowerText.includes('comgas')) {
          categoria = 'Gás';
        }

        const valueMatch = text.match(/(?:R\$|r\$)\s?(\d+[,.]\d{2})/i) || text.match(/(\d+[,.]\d{2})/);
        const valor = valueMatch ? valueMatch[1].replace(',', '.') : '0.00';

        const dateMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/) || text.match(/(\d{4}-\d{2}-\d{2})/);
        const data = dateMatch ? (dateMatch[1].includes('/') ? dateMatch[1].split('/').reverse().join('-') : dateMatch[1]) : new Date().toISOString().split('T')[0];

        setScanResult({
          categoria,
          valor,
          data,
          confianca: 'IA Cloud'
        });
      } else {
        throw new Error('Nenhum texto encontrado');
      }

    } catch (error) {
      console.log('Erro no OCR:', error);
      Alert.alert('Erro na Análise', 'Não conseguimos processar a imagem via Nuvem. Tente uma foto mais próxima e com boa iluminação.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!scanResult) return;

    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const tiposRes = await api.get('/tipo_consumo/Mostrar_Tipos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tipos = tiposRes.data.mensagem || [];
      const tipoId = tipos.find(t => t.nome.toLowerCase().includes(scanResult.categoria.toLowerCase()))?.id || 1;

      const payload = {
        valor: parseFloat(scanResult.valor),
        dt_perioto: `${scanResult.data}T12:00:00Z`,
        TIPO_CONSUMO_id: tipoId
      };

      await api.post('/consumo/Criar_Consumo', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Sucesso', 'Consumo registrado com sucesso via OCR!');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.log('Erro ao salvar registro OCR:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AntDesign name="left" color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scanner ECODE</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {!image ? (
            <View style={styles.uploadSection}>
              <View style={styles.scanIconWrapper}>
                <Scan size={60} color="#26D0CE" />
              </View>
              <Text style={styles.uploadTitle}>Registro Inteligente</Text>
              <Text style={styles.uploadSubtitle}>
                Tire uma foto da sua conta ou fatura e o ECODE fará o cadastro automático para você.
              </Text>

              <TouchableOpacity style={styles.mainActionBtn} onPress={() => pickImage(true)}>
                <Camera size={24} color="#1A2980" />
                <Text style={styles.mainActionBtnText}>Tirar Foto da Conta</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryActionBtn} onPress={() => pickImage(false)}>
                <ImageIcon size={20} color="#fff" />
                <Text style={styles.secondaryActionBtnText}>Selecionar da Galeria</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewSection}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                {isAnalyzing && (
                  <View style={styles.scanningOverlay}>
                    <ActivityIndicator size="large" color="#26D0CE" />
                    <Text style={styles.scanningText}>Analisando Documento...</Text>
                    <View style={styles.scanLine} />
                  </View>
                )}
              </View>

              {scanResult && !isAnalyzing && (
                <View style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <CheckCircle size={20} color="#4ade80" />
                    <Text style={styles.resultTitle}>Dados Extraídos</Text>
                    <Text style={styles.confidenceText}>{scanResult.confianca} de precisão</Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>CATEGORIA</Text>
                    <Text style={styles.resultValue}>{scanResult.categoria}</Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>VALOR</Text>
                    <Text style={styles.resultValue}>R$ {scanResult.valor}</Text>
                  </View>

                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>DATA</Text>
                    <Text style={styles.resultValue}>{new Date(scanResult.data).toLocaleDateString('pt-BR')}</Text>
                  </View>

                  <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                    <Text style={styles.confirmBtnText}>Confirmar Registro</Text>
                    <ArrowRight size={20} color="#1A2980" />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.retryBtn} onPress={() => { setImage(null); setScanResult(null); }}>
                    <Text style={styles.retryBtnText}>Tentar Novamente</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.tipsBox}>
            <FileText size={20} color="#60a5fa" />
            <Text style={styles.tipsText}>
              Dica: Certifique-se de que a foto esteja nítida e que o valor total e a data estejam visíveis.
            </Text>
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
    paddingBottom: 15
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20, flexGrow: 1 },
  uploadSection: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 40 
  },
  scanIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(38, 208, 206, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(38, 208, 206, 0.3)',
    borderStyle: 'dashed'
  },
  uploadTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  uploadSubtitle: { 
    color: '#a1a1aa', 
    fontSize: 16, 
    textAlign: 'center', 
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20
  },
  mainActionBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#26D0CE',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  mainActionBtnText: { color: '#1A2980', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  secondaryActionBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  secondaryActionBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 12 },
  previewSection: { width: '100%' },
  imageWrapper: {
    width: '100%',
    height: 350,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 25,
    position: 'relative'
  },
  previewImage: { width: '100%', height: '100%', opacity: 0.7 },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanningText: { color: '#26D0CE', marginTop: 15, fontWeight: 'bold', fontSize: 16 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#26D0CE',
    top: '50%',
    shadowColor: '#26D0CE',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10
  },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  resultTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10, flex: 1 },
  confidenceText: { color: '#4ade80', fontSize: 12, fontWeight: 'bold' },
  resultRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  resultLabel: { color: '#a1a1aa', fontSize: 12, fontWeight: 'bold' },
  resultValue: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  confirmBtn: {
    backgroundColor: '#26D0CE',
    height: 55,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25
  },
  confirmBtnText: { color: '#1A2980', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  retryBtn: {
    marginTop: 15,
    alignItems: 'center',
    paddingVertical: 10
  },
  retryBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  tipsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)'
  },
  tipsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18
  }
});
