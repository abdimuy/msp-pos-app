import axios from 'axios';

const api = axios.create({
  baseURL: 'https://msp2025.loclx.io',
  timeout: 5000,
});

export default api;
