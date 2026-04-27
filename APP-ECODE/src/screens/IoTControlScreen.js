import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Switch,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Cpu, 
  Wind, 
  Zap, 
  Thermometer, 
  Power, 
  Settings, 
  Plus, 
  Monitor,
  Activity
} from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';

export default function IoTControlScreen({ navigation }) {
  const [devices, setDevices] = useState([
    { 
      id: 1, 
      name: 'ECODE Hub (Próprio)', 
      type: 'hub', 
      status: true, 
      info: 'Monitorando carga total',
      icon: Cpu,
      color: '#4ade80' 
    },
    { 
      id: 2, 
      name: 'Ar Condicionado', 
      type: 'ac', 
      status: false, 
      info: '22°C - Modo Eco',
      icon: Wind,
      color: '#60a5fa' 
    },
    { 
      id: 3, 
      name: 'Smart Plug Cozinha', 
      type: 'plug', 
      status: true, 
      info: 'Consumo: 12W',
      icon: Zap,
      color: '#facc15' 
    },
    { 
      id: 4, 
      name: 'Monitor de Água IoT', 
      type: 'water', 
      status: true, 
      info: 'Fluxo estável',
      icon: Activity,
      color: '#26D0CE' 
    }
  ]);

  const toggleDevice = (id) => {
    setDevices(prev => prev.map(dev => 
      dev.id === id ? { ...dev, status: !dev.status } : dev
    ));
  };

  const renderDeviceCard = (device) => {
    const Icon = device.icon;
    return (
      <View key={device.id} style={[styles.deviceCard, !device.status && styles.deviceCardOff]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: device.status ? device.color + '33' : 'rgba(255,255,255,0.05)' }]}>
            <Icon size={24} color={device.status ? device.color : '#a1a1aa'} />
          </View>
          <Switch
            value={device.status}
            onValueChange={() => toggleDevice(device.id)}
            trackColor={{ false: '#3f3f46', true: device.color + 'aa' }}
            thumbColor={device.status ? '#fff' : '#71717a'}
          />
        </View>
        
        <View style={styles.cardInfo}>
          <Text style={[styles.deviceName, !device.status && styles.textMuted]}>{device.name}</Text>
          <Text style={styles.deviceStatus}>
            {device.status ? 'LIGADO' : 'DESLIGADO'}
          </Text>
          <Text style={styles.deviceDetail}>{device.info}</Text>
        </View>

        {device.status && (
          <View style={styles.activityIndicator}>
            <LinearGradient 
              colors={[device.color, 'transparent']} 
              start={{x: 0, y: 0}} 
              end={{x: 1, y: 0}}
              style={styles.activityBar}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <AntDesign name="left" color="#fff" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Casa Inteligente</Text>
          <TouchableOpacity style={styles.plusBtn}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroSection}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Consumo IoT</Text>
                <Text style={styles.statValue}>1.2 kWh</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Dispositivos</Text>
                <Text style={styles.statValue}>{devices.filter(d => d.status).length}/{devices.length}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Dispositivos Conectados</Text>
          <View style={styles.deviceGrid}>
            {devices.map(renderDeviceCard)}
          </View>

          <TouchableOpacity style={styles.addDeviceCard}>
            <Plus size={32} color="rgba(255,255,255,0.2)" />
            <Text style={styles.addDeviceText}>Adicionar Novo Dispositivo</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Settings size={20} color="#26D0CE" />
            <Text style={styles.infoBoxText}>
              A integração ECODE permite o desligamento automático de aparelhos para manter você dentro da sua meta mensal.
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
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  backBtn: { padding: 5 },
  plusBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollContent: { padding: 20 },
  heroSection: { marginBottom: 30 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#a1a1aa', fontSize: 12, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 10 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  deviceGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  deviceCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden'
  },
  deviceCardOff: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'transparent'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deviceName: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  deviceStatus: { color: '#26D0CE', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  deviceDetail: { color: '#a1a1aa', fontSize: 12 },
  textMuted: { color: '#71717a' },
  activityIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3
  },
  activityBar: { flex: 1 },
  addDeviceCard: {
    height: 120,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30
  },
  addDeviceText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 10 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(38, 208, 206, 0.05)',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(38, 208, 206, 0.2)'
  },
  infoBoxText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18
  }
});
