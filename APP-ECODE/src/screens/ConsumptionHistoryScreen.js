import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Calendar, Zap, Droplet, Flame, ArrowLeft, Filter } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ConsumptionHistoryScreen({ navigation }) {
  const [consumos, setConsumos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarConsumos = async () => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      const response = await api.get('/consumo/Listar_Consumos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ordenar por data (mais recente primeiro)
      const lista = response.data.mensagem || [];
      lista.sort((a, b) => new Date(b.dataRegistrada) - new Date(a.dataRegistrada));
      
      setConsumos(lista);
    } catch (error) {
      console.log('Erro ao carregar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de consumo.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarConsumos();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarConsumos();
  };

  const handleConfirmDelete = (id) => {
    Alert.alert(
      'Excluir Registro',
      'Tem certeza que deseja remover este registro de consumo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => handleDelete(id) }
      ]
    );
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      await api.delete(`/consumo/Del_Consumo/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Sucesso', 'Registro removido com sucesso.');
      carregarConsumos(); // Recarregar lista
    } catch (error) {
      console.log('Erro ao excluir consumo:', error);
      Alert.alert('Erro', 'Não foi possível excluir o registro.');
    }
  };

  const getIcon = (tipo) => {
    const t = tipo.toLowerCase();
    if (t.includes('energia')) return <Zap size={20} color="#facc15" />;
    if (t.includes('agua') || t.includes('água')) return <Droplet size={20} color="#60a5fa" />;
    if (t.includes('gas') || t.includes('gás')) return <Flame size={20} color="#4ade80" />;
    return <Activity size={20} color="#fff" />;
  };

  const formatData = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconWrapper}>
          {getIcon(item.tipoConsumo)}
        </View>
        <View style={styles.infoWrapper}>
          <Text style={styles.tipoText}>{item.tipoConsumo}</Text>
          <View style={styles.dateRow}>
            <Calendar size={14} color="#a1a1aa" style={{ marginRight: 5 }} />
            <Text style={styles.dateText}>{formatData(item.dataRegistrada)}</Text>
          </View>
        </View>
        <View style={styles.valueWrapper}>
          <Text style={styles.valueText}>
            {item.tipoConsumo.toLowerCase().includes('agua') || item.tipoConsumo.toLowerCase().includes('água') 
              ? `${parseFloat(item.valor).toFixed(0)} L` 
              : `${parseFloat(item.valor).toFixed(2)} ${item.tipoConsumo.toLowerCase().includes('energia') ? 'kWh' : 'kg'}`}
          </Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleConfirmDelete(item.id)}
      >
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AntDesign name="left" color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Consumo</Text>
          <View style={{ width: 28 }} />
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : consumos.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
          </View>
        ) : (
          <FlatList
            data={consumos}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
            }
          />
        )}
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
  backBtn: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrapper: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  infoWrapper: {
    flex: 1
  },
  tipoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateText: {
    color: '#a1a1aa',
    fontSize: 13
  },
  valueWrapper: {
    marginRight: 15,
    alignItems: 'flex-end'
  },
  valueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16
  }
});
