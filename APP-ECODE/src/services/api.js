import axios from 'axios';

const API_URL = 'https://api.2dsmoca.tech';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
