import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importando as telas dos outros arquivos!
import Inicio from './src/pages/inicio';
import Detalhes from './src/pages/Detalhes';
import Login from './src/pages/Login';

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

        
        
        
 
      </Stack.Navigator>
    </NavigationContainer>
  );
}