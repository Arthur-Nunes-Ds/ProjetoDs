import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importando as telas dos outros arquivos!
import Inicio from './src/pages/inicio';
import Detalhes from './src/pages/Detalhes';
import Login from './src/pages/Login';
import Cadastro from './src/pages/Cadastro';
import Cadastro_Consumo from './src/pages/Cadastro_Consumo';
import VerificarEmail from './src/pages/Verificar_Email';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    
    <NavigationContainer >
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
        
        <Stack.Screen 
          name="Home" 
          component={Inicio} // Usando o componente importado
          options={{ title: 'Inicio' }} 
        />

        <Stack.Screen 
          name="Detalhes" 
          component={Detalhes} // Usando o componente importado
          options={{ title: 'Detalhes' }} 
        />
        
        <Stack.Screen 
          name="Login" 
          component={Login} // Usando o componente importado
          options={{ title: 'Login' }} 
        />

        <Stack.Screen 
          name="Cadastro" 
          component={Cadastro} // Usando o componente importado
          options={{ title: 'Cadastro' }} 
        />

        <Stack.Screen 
          name="VerificarEmail" 
          component={VerificarEmail} // Usando o componente importado
          options={{ title: 'Verificar Email' }} 
        />

        <Stack.Screen 
          name="Cadastro_Consumo" 
          component={Cadastro_Consumo} // Usando o componente importado
          options={{ title: 'Cadastro_Consumo' }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}