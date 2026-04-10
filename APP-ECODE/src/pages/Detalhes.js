import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Menu, X, Plus, Settings, HelpCircle, Activity, User } from 'lucide-react-native';

const screenWidth = Dimensions.get("window").width;

export default function Dashboard({ navigation }) {
  // Estado para controlar a visibilidade do Menu Sanduíche
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- MOCK DATA (Simulação para Desenvolvimento) ---
  const [dados] = useState({
    energia: 145, // kWh
    agua: 12,     // m³
    residuos: 5,  // kg
    metaEnergia: 80, // %
    dica: "Desligue o monitor quando não estiver usando. Isso economiza até 20% de energia."
  });

  // Configuração padrão dos gráficos
  const chartConfig = {
    backgroundGradientFrom: "#18181b",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#18181b",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2, 
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    propsForLabels: {
      fontFamily: 'UBUNTU-400Regular',
    }
  };

  return (
    <LinearGradient colors={['#1b3194', '#5a82af', '#3082cf']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* === MODAL DO MENU SANDUÍCHE === */}
        <Modal
          visible={isMenuOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalCloseArea} onPress={() => setIsMenuOpen(false)} />
            
            <View style={styles.sideMenu}>
              <View style={styles.sideMenuHeader}>
                <Text style={styles.sideMenuTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <X color="#fff" size={28} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.menuItem}>
                <User color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Minha Conta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Activity color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Ações e Metas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <HelpCircle color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Settings color="#a1a1aa" size={22} />
                <Text style={styles.menuItemText}>Configurações</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. CABEÇALHO COM MENU SANDUÍCHE */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.hamburgerBtn}>
              <Menu color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EcoMonitor</Text>
            {/* View vazia para equilibrar o flexbox do cabeçalho */}
            <View style={{ width: 28 }} />
          </View>

          {/* 2. BOTÃO DE CADASTRAR CONSUMO */}
          <TouchableOpacity 
            style={styles.btnCadastrarContainer} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Cadastro_Consumo')}
          >
            <LinearGradient 
              colors={['#89a5e0ec', '#6596e0']} 
              start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
              style={styles.btnCadastrar}
            >
              <Plus color="#fff" size={24} style={styles.btnCadastrarIcon} />
              <Text style={styles.btnCadastrarText}>Cadastrar Novo Consumo</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 3. AREA DE INFO RÁPIDA (CARDS DE RESUMO) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
            {/* Card Energia */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Energia (Mês)</Text>
              <Text style={[styles.cardValue, { color: '#facc15' }]}>{dados.energia} kWh</Text>
              <Text style={[styles.cardSubText, { color: '#4ade80' }]}>▼ 5% vs mês passado</Text>
            </View>
            
            {/* Card Água */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Água (Mês)</Text>
              <Text style={[styles.cardValue, { color: '#60a5fa' }]}>{dados.agua} m³</Text>
              <Text style={[styles.cardSubText, { color: '#f87171' }]}>▲ 2% vs mês passado</Text>
            </View>

            {/* Card Resíduos */}
            <View style={styles.cardInfo}>
              <Text style={styles.cardLabel}>Resíduos</Text>
              <Text style={[styles.cardValue, { color: '#4ade80' }]}>{dados.residuos} kg</Text>
              <Text style={[styles.cardSubText, { color: '#a1a1aa' }]}>Coleta: Terça-feira</Text>
            </View>
          </ScrollView>

          {/* 4. DASHBOARD GRÁFICO */}
          <View style={styles.dashboardContainer}>
            <View style={styles.dashboardHeader}>
              <View>
                <Text style={styles.dashboardTitle}>Monitoramento</Text>
                <Text style={styles.dashboardSubtitle}>Visão geral dos recursos naturais</Text>
              </View>
              <View style={styles.badgeRealTime}>
                <Text style={styles.badgeText}>Tempo Real</Text>
              </View>
            </View>

            {/* GRÁFICO 1: Barras */}
            <Text style={styles.chartTitle}>Consumo por Categoria</Text>
            <BarChart
              data={{
                labels: ["Energia", "Água", "Mat."],
                datasets: [{ data: [dados.energia, dados.agua * 10, dados.residuos * 10] }]
              }}
              width={screenWidth - 80}
              height={220}
              yAxisLabel=""
              chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`}}
              style={styles.chartStyle}
              showValuesOnTopOfBars
            />

            {/* GRÁFICO 2: Linha */}
            <Text style={styles.chartTitle}>Histórico (Semestral)</Text>
            <LineChart
              data={{
                labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
                datasets: [{ data: [120, 132, 101, 134, 90, 230] }]
              }}
              width={screenWidth - 80}
              height={220}
              chartConfig={{...chartConfig, color: (opacity = 1) => `rgba(34, 211, 238, ${opacity})`}}
              bezier
              style={styles.chartStyle}
            />
          </View>

          {/* 5. RODAPÉ DE DICAS E METAS */}
          {/* Card de Metas */}
          <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>Metas do Mês</Text>
            <View style={styles.goalHeaderRow}>
              <Text style={styles.goalLabel}>Economia de Energia</Text>
              <Text style={styles.goalLabel}>{dados.metaEnergia}% Atingido</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <LinearGradient 
                colors={['#a855f7', '#ec4899']} 
                start={{x: 0, y: 0}} end={{x: 1, y: 0}} 
                style={[styles.progressBarFill, { width: `${dados.metaEnergia}%` }]} 
              />
            </View>
          </View>

          {/* Card de Dicas */}
          <LinearGradient colors={['rgba(49, 46, 129, 0.4)', 'rgba(30, 58, 138, 0.4)']} style={styles.tipCard}>
            <Text style={styles.tipTitle}>Dica Sustentável</Text>
            <Text style={styles.tipText}>"{dados.dica}"</Text>
          </LinearGradient>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  hamburgerBtn: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'UBUNTU-400Regular',
  },

  // --- Modal / Menu Sanduíche ---
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCloseArea: {
    flex: 1,
  },
  sideMenu: {
    width: '75%',
    backgroundColor: '#18181b', // Fundo escuro para combinar com o app
    height: '100%',
    padding: 25,
    paddingTop: 60, // Espaço para a status bar
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  sideMenuTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'UBUNTU-400Regular',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  menuItemText: {
    color: '#e4e4e7',
    fontSize: 18,
    marginLeft: 15,
    fontWeight: '500',
    fontFamily: 'UBUNTU-400Regular',
  },

  // --- Botão Cadastrar Consumo ---
  btnCadastrarContainer: {
    marginBottom: 25,
  },
  btnCadastrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnCadastrarIcon: {
    marginRight: 10,
  },
  btnCadastrarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: 'UBUNTU-400Regular',
  },

  // --- Cards Info ---
  cardsScroll: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  cardInfo: {
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    borderColor: '#27272a',
    borderWidth: 1,
    padding: 20,
    borderRadius: 16,
    marginRight: 15,
    width: 160,
    alignItems: 'center',
  },
  cardLabel: { color: '#a1a1aa', fontSize: 14, fontFamily: 'UBUNTU-400Regular' },
  cardValue: { fontSize: 28, fontWeight: 'bold', marginVertical: 5, fontFamily: 'UBUNTU-400Regular' },
  cardSubText: { fontSize: 12, fontFamily: 'UBUNTU-400Regular' },

  // --- Dashboard Central ---
  dashboardContainer: {
    backgroundColor: 'rgba(24, 24, 27, 0.67)',
    borderColor: '#54545857',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(165, 160, 160, 0.18)',
    paddingBottom: 15,
    marginBottom: 20,
  },
  dashboardTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', fontFamily: 'UBUNTU-400Regular' },
  dashboardSubtitle: { color: '#a1a1aa', fontSize: 12, marginTop: 4, fontFamily: 'UBUNTU-400Regular' },
  badgeRealTime: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: '#d8b4fe', fontSize: 10, fontFamily: 'UBUNTU-400Regular' },
  chartTitle: { color: '#d4d4d8', fontWeight: '600', marginBottom: 10, marginTop: 20, fontFamily: 'UBUNTU-400Regular' },
  chartStyle: { borderRadius: 16, alignSelf: 'center' },

  // --- Rodapé (Metas e Dicas) ---
  goalCard: {
    backgroundColor: 'rgba(24, 24, 27, 0.64)',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  goalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, fontFamily: 'UBUNTU-400Regular' },
  goalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalLabel: { color: '#a1a1aa', fontSize: 14, fontFamily: 'UBUNTU-400Regular' },
  progressBarBackground: { height: 8, backgroundColor: '#3f3f46', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  tipCard: {
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  tipTitle: { color: '#a5b4fc', fontSize: 18, fontWeight: 'bold', marginBottom: 10, fontFamily: 'UBUNTU-400Regular' },
  tipText: { color: '#d4d4d8', fontSize: 14, lineHeight: 22, fontFamily: 'UBUNTU-400Regular' },
});