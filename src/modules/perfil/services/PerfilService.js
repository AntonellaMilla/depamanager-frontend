// src/modules/perfil/services/PerfilService.js
import api from '../../../shared/services/api';

const BASE_URL = '/usuarios';

export const perfilService = {

  /**
   * Obtener perfil del usuario actual
   * GET /api/usuarios/perfil
   */
  obtenerPerfil: async () => {
    try {
      const response = await api.get(`${BASE_URL}/perfil`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en obtenerPerfil:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil del usuario
   * PUT /api/usuarios/perfil
   */
  actualizarPerfil: async (data) => {
    try {
      const response = await api.put(`${BASE_URL}/perfil`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en actualizarPerfil:', error);
      throw error;
    }
  },

  /**
   * Cambiar contraseña
   * POST /api/usuarios/cambiar-password
   */
  cambiarPassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post(`${BASE_URL}/cambiar-password`, {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error en cambiarPassword:', error);
      throw error;
    }
  }
};

export default perfilService;