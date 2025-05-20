import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api'
  : (process.env.REACT_APP_API_URL || 'https://blundrbot-backend.onrender.com');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
  timeout: 10000
});

api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('API Request Error:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const makeBlunderMove = async (fen) => {
  try {
    console.log('Making request to /worst-move with FEN:', fen);
    const response = await api.post('/worst-move', { fen });
    console.log('API Response:', response.data);
    return response;
  } catch (error) {
    console.error('API Error in makeBlunderMove:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
