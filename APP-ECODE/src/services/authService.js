import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email, senha) => {
    const formBody = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(senha)}`;
    
    const response = await api.post('/public/Logar_Conta', formBody, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data.access_token) {
      await AsyncStorage.setItem('@jwt_token', response.data.access_token);
    }
    
    return response.data;
  },

  register: async (nome, email, senha) => {
    const payload = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha: senha
    };
    
    return await api.post('/public/Criar_Conta', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  saveToken: async (token) => {
    await AsyncStorage.setItem('@jwt_token', token);
  },

  logout: async () => {
    await AsyncStorage.removeItem('@jwt_token');
  },

  forgotPassword: async (email) => {
    return await api.get(`/public/Email_Esqueceu_Senha/${encodeURIComponent(email)}`);
  },

  resetPassword: async (jwt, novaSenha) => {
    return await api.put(`/public/Email_Alterar_Senha/${jwt}`, { senha: novaSenha });
  },
};
