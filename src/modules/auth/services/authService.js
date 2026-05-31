import api from '../../../shared/services/api';

export const authService = {
  // Login para cualquier rol (Propietario, Admin, Inquilino)
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // El backend envuelve los datos: { success, message, data: { usuario, token } }
    // Devolvemos directamente { usuario, token }
    return response.data.data;
  },

  // Registro solo para Propietario (según tu backend)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    // Similar para registro
    return response.data.data;
  }
};