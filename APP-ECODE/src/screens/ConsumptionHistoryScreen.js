import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trash2, Calendar, Zap, Droplet, Flame, ArrowLeft, Filter, Edit3, CheckCircle, Activity, FileText } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { generateConsumptionReport } from '../services/reportService';

export default function ConsumptionHistoryScreen({ navigation }) {
  const [consumos, setConsumos] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('Todos');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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

      // Carregar Usuário para o PDF
      const resUser = await api.get('/user/Dados_User', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuario(resUser.data.mensagem);
    } catch (error) {
      console.log('Erro ao carregar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico de consumo.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsLoading(true);
      await generateConsumptionReport(consumosFiltrados, usuario);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    } finally {
      setIsLoading(false);
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

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      const newSelection = selectedIds.filter(sid => sid !== id);
      setSelectedIds(newSelection);
      if (newSelection.length === 0) setIsSelectionMode(false);
    } else {
      setSelectedIds([...selectedIds, id]);
      setIsSelectionMode(true);
    }
  };

  const handleLongPress = (id) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([id]);
    }
  };

  const handleBatchDelete = () => {
    Alert.alert(
      'Excluir Selecionados',
      `Deseja excluir ${selectedIds.length} registros selecionados?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir Todos', style: 'destructive', onPress: performBatchDelete }
      ]
    );
  };

  const performBatchDelete = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('@jwt_token');
      await Promise.all(selectedIds.map(id => 
        api.delete(`/consumo/Del_Consumo/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      
      Alert.alert('Sucesso', 'Registros removidos com sucesso.');
      setSelectedIds([]);
      setIsSelectionMode(false);
      carregarConsumos();
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao excluir alguns registros.');
      carregarConsumos();
    }
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

  const consumosFiltrados = filtro === 'Todos' 
    ? consumos 
    : consumos.filter(c => c.tipoConsumo?.toLowerCase().includes(filtro.toLowerCase()));

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        onLongPress={() => handleLongPress(item.id)}
        onPress={() => isSelectionMode ? toggleSelect(item.id) : null}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconWrapper, isSelected && { backgroundColor: '#26D0CE' }]}>
            {isSelected ? <CheckCircle size={24} color="#1A2980" /> : getIcon(item.tipoConsumo)}
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
        {!isSelectionMode && (
          <View style={styles.actionsWrapper}>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('Cadastro_Consumo', { editItem: item })}
            >
              <Edit3 size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleConfirmDelete(item.id)}
            >
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AntDesign name="left" color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isSelectionMode ? `${selectedIds.length} Selecionados` : 'Histórico'}
          </Text>
          {isSelectionMode ? (
            <TouchableOpacity onPress={handleBatchDelete}>
              <Trash2 color="#ef4444" size={24} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleExportPDF} disabled={consumos.length === 0}>
              <FileText color={consumos.length === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} size={24} />
            </TouchableOpacity>
          )}
        </View>

        {!isSelectionMode && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {['Todos', 'Energia', 'Água', 'Gás'].map((f) => (
                <TouchableOpacity 
                  key={f} 
                  style={[styles.filterChip, filtro === f && styles.filterChipActive]}
                  onPress={() => setFiltro(f)}
                >
                  <Text style={[styles.filterText, filtro === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : consumosFiltrados.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
          </View>
        ) : (
          <FlatList
            data={consumosFiltrados}
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
  
  filterContainer: { marginBottom: 15 },
  filterBar: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  filterText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#1A2980' },

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
  cardSelected: {
    backgroundColor: 'rgba(38, 208, 206, 0.3)',
    borderColor: '#26D0CE',
    borderWidth: 2
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
  actionsWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  editBtn: {
    padding: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    marginRight: 8
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
