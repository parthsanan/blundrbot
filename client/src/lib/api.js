import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

export const makeBlunderMove = async (fen) => {
  try {
    const response = await api.post('/worst-move', { fen });
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
