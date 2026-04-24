import axios from 'axios';

// Use o seu IP local para garantir conexo entre o App e a API no Docker
// Seu IP atual: 192.168.0.36
const API_URL = 'https://api.2dsmoca.tech';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
