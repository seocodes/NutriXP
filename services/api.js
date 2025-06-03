import axios from 'axios';

// Base URL da API - será substituída pela URL real posteriormente
const api = axios.create({
  baseURL: 'YOUR_API_BASE_URL',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Função para gerar dieta com IA
export const generateDiet = async (userData) => {
  try {
    const response = await api.post('/generate-diet', userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar dieta:', error);
    throw error;
  }
};

// Função para gerar treino com IA
export const generateWorkout = async (userData) => {
  try {
    const response = await api.post('/generate-workout', userData);
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar treino:', error);
    throw error;
  }
};

export default api; 