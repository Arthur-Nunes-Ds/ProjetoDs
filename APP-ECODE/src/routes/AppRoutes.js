import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Componentes das telas
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RegisterConsumptionScreen from '../screens/RegisterConsumptionScreen';
import VerifyEmailScreen from '../screens/VerifyEmailScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import AccountScreen from '../screens/AccountScreen';
import CreateGoalScreen from '../screens/CreateGoalScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import RatesScreen from '../screens/RatesScreen';
import ConsumptionHistoryScreen from '../screens/ConsumptionHistoryScreen';
import IoTControlScreen from '../screens/IoTControlScreen';

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <Stack.Navigator 
      initialRouteName="Login" 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Início' }} 
      />
      <Stack.Screen 
        name="Detalhes" 
        component={DetailsScreen} 
        options={{ title: 'Detalhes' }} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Login' }} 
      />
      <Stack.Screen 
        name="Cadastro" 
        component={RegisterScreen} 
        options={{ title: 'Cadastro' }} 
      />
      <Stack.Screen 
        name="VerificarEmail" 
        component={VerifyEmailScreen} 
        options={{ title: 'Verificar Email' }} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ title: 'Esqueci Senha' }} 
      />
      <Stack.Screen 
        name="Cadastro_Consumo" 
        component={RegisterConsumptionScreen} 
        options={{ title: 'Cadastro Consumo' }} 
      />
      <Stack.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{ title: 'Minha Conta' }} 
      />
      <Stack.Screen 
        name="CreateGoal" 
        component={CreateGoalScreen} 
        options={{ title: 'Criar Meta' }} 
      />
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen} 
        options={{ title: 'Preferências' }} 
      />
      <Stack.Screen 
        name="Rates" 
        component={RatesScreen} 
        options={{ title: 'Tarifas' }} 
      />
      <Stack.Screen 
        name="ConsumptionHistory" 
        component={ConsumptionHistoryScreen} 
        options={{ title: 'Histórico' }} 
      />
      <Stack.Screen 
        name="IoTControl" 
        component={IoTControlScreen} 
        options={{ title: 'Casa Inteligente' }} 
      />
    </Stack.Navigator>
  );
}
