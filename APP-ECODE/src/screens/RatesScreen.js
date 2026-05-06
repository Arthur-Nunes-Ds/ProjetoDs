import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Droplet, Flame, Save, ArrowLeft, Info } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RatesScreen({ navigation }) {
  const [rates, setRates] = useState({
    energy: '0.95',
    water: '0.01',
    gas: '7.50'
  });
  const [consumos, setConsumos] = useState({ energy: 0, water: 0, gas: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar Tarifas
      const savedRates = await AsyncStorage.getItem('@consumption_rates');
      if (savedRates) {
        setRates(JSON.parse(savedRates));
      }

      // Carregar Consumos para Simulação
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/consumo/Listar_Consumos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lista = response.data.mensagem || [];
      
      const sums = { energy: 0, water: 0, gas: 0 };
      lista.forEach(item => {
        const nome = item.tipoConsumo.toLowerCase();
        if (nome.includes('energia')) sums.energy += item.valor;
        else if (nome.includes('agua') || nome.includes('água')) sums.water += item.valor;
        else if (nome.includes('gas') || nome.includes('gás')) sums.gas += item.valor;
      });
      setConsumos(sums);

    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cleanedRates = {
        energy: rates.energy.toString().replace(',', '.'),
        water: rates.water.toString().replace(',', '.'),
        gas: rates.gas.toString().replace(',', '.')
      };

      if (isNaN(cleanedRates.energy) || isNaN(cleanedRates.water) || isNaN(cleanedRates.gas)) {
        Alert.alert('Erro', 'Por favor, insira valores numéricos válidos.');
        setIsSaving(false);
        return;
      }

      await AsyncStorage.setItem('@consumption_rates', JSON.stringify(cleanedRates));
      Alert.alert('Sucesso', 'Tarifas atualizadas com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.log('Erro ao salvar tarifas:', error);
      Alert.alert('Erro', 'Não foi possível salvar as tarifas.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <AntDesign name="left" color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Configurar Tarifas</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.infoCard}>
              <Info color="#26D0CE" size={30} style={{ marginBottom: 10 }} />
              <Text style={styles.infoTitle}>Personalize seu Dashboard</Text>
              <Text style={styles.infoText}>
                Insira os valores cobrados na sua região para que possamos calcular o custo estimado em Reais (R$).
              </Text>
            </View>

            {/* Energia */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Zap size={20} color="#facc15" />
                <Text style={styles.label}>Preço do kWh (Energia)</Text>
                {consumos.energy > 0 && (
                  <View style={styles.simBadge}>
                    <Text style={styles.simBadgeText}>Simulação: R$ {(consumos.energy * parseFloat(rates.energy || 0)).toFixed(2)}/mês</Text>
                  </View>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rates.energy.toString()}
                  onChangeText={(val) => setRates({...rates, energy: val})}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
            </View>

            {/* Água */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Droplet size={20} color="#60a5fa" />
                <Text style={styles.label}>Preço do Litro (Água)</Text>
                {consumos.water > 0 && (
                  <View style={[styles.simBadge, { backgroundColor: 'rgba(96, 165, 250, 0.2)' }]}>
                    <Text style={[styles.simBadgeText, { color: '#60a5fa' }]}>Simulação: R$ {(consumos.water * parseFloat(rates.water || 0)).toFixed(2)}/mês</Text>
                  </View>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rates.water.toString()}
                  onChangeText={(val) => setRates({...rates, water: val})}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
              <Text style={styles.helperText}>Dica: Geralmente R$ 10,00 por m³ equivale a R$ 0,01 por litro.</Text>
            </View>

            {/* Gás */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Flame size={20} color="#4ade80" />
                <Text style={styles.label}>Preço do Quilo (Gás)</Text>
                {consumos.gas > 0 && (
                  <View style={[styles.simBadge, { backgroundColor: 'rgba(74, 222, 128, 0.2)' }]}>
                    <Text style={[styles.simBadgeText, { color: '#4ade80' }]}>Simulação: R$ {(consumos.gas * parseFloat(rates.gas || 0)).toFixed(2)}/mês</Text>
                  </View>
                )}
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={rates.gas.toString()}
                  onChangeText={(val) => setRates({...rates, gas: val})}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#1A2980" />
              ) : (
                <>
                  <Save size={20} color="#1A2980" style={{ marginRight: 10 }} />
                  <Text style={styles.saveBtnText}>Salvar Tarifas</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.referenceSection}>
              <Text style={styles.referenceTitle}>💡 Médias de Referência</Text>
              <Text style={styles.referenceText}>• Energia (SP): ~ R$ 0,92 /kWh</Text>
              <Text style={styles.referenceText}>• Água (SP): ~ R$ 0,01 /L</Text>
              <Text style={styles.referenceText}>• Gás (GLP): ~ R$ 8,50 /kg</Text>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingBottom: 10 
  },
  backBtn: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 25 },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center'
  },
  infoTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  infoText: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, fontSize: 14 },
  inputGroup: { marginBottom: 25 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginLeft: 5 },
  label: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 10 },
  inputWrapper: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15
  },
  currencyPrefix: { color: '#26D0CE', fontWeight: 'bold', fontSize: 18, marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 18, paddingVertical: 15 },
  helperText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 5, marginLeft: 5 },
  saveBtn: { 
    backgroundColor: '#fff', 
    paddingVertical: 18, 
    borderRadius: 50, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  saveBtnText: { color: '#1A2980', fontSize: 18, fontWeight: 'bold' },
  simBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
    flexShrink: 1
  },
  simBadgeText: { color: '#facc15', fontSize: 10, fontWeight: 'bold' },
  referenceSection: { marginTop: 20, padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15 },
  referenceTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  referenceText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 5 }
});
