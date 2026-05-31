// src/modules/edificios/services/edificiosService.js
import api from '../../../shared/services/api';

const BASE_URL = '/edificios';

export const edificiosService = {
  /**
   * Obtener todos los edificios del propietario
   * GET /api/edificios
   */
  getAll: async () => {
    try {
      const response = await api.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAll:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo edificio
   * POST /api/edificios
   */
  create: async (edificioData) => {
    try {
      const response = await api.post(BASE_URL, edificioData);
      return response.data;
    } catch (error) {
      console.error('❌ Error en create:', error);
      throw error;
    }
  },

  /**
   * Actualizar un edificio existente
   * PUT /api/edificios/:id
   */
  update: async (edificioId, edificioData) => {
    try {
      const response = await api.put(`${BASE_URL}/${edificioId}`, edificioData);
      return response.data;
    } catch (error) {
      console.error('❌ Error en update:', error);
      throw error;
    }
  },

  /**
   * Eliminar edificio (soft delete)
   * DELETE /api/edificios/:id
   */
  delete: async (edificioId) => {
    try {
      const response = await api.delete(`${BASE_URL}/${edificioId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en delete:', error);
      throw error;
    }
  },

  /**
   * Asignar administrador a un edificio
   * POST /api/edificios/asignar-admin
   */
  asignarAdmin: async (edificioId, adminId) => {
    try {
      const response = await api.post(`${BASE_URL}/asignar-admin`, {
        edificioId,
        adminId
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error en asignarAdmin:', error);
      throw error;
    }
  },

  /**
   * Mejorar plan de suscripción (upgrade)
   * POST /api/edificios/upgrade-plan
   * @param {Object} data - { edificioId, nuevoPlan, tokenPago?, operacion? }
   */
  upgradePlan: async (data) => {
    try {
      const response = await api.post(`${BASE_URL}/upgrade-plan`, data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en upgradePlan:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de actividades de un edificio específico
   * GET /api/edificios/:id/historial
   */
  getHistorial: async (edificioId) => {
    try {
      const response = await api.get(`${BASE_URL}/${edificioId}/historial`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getHistorial:', error);
      throw error;
    }
  },

  /**
   * Obtener accesos de un edificio específico
   * GET /api/edificios/:id/accesos
   */
  getAccesosPorEdificio: async (edificioId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.desde) queryParams.append('desde', params.desde);
      if (params.hasta) queryParams.append('hasta', params.hasta);
      if (params.resultado) queryParams.append('resultado', params.resultado);
      
      const url = `${BASE_URL}/${edificioId}/accesos${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAccesosPorEdificio:', error);
      throw error;
    }
  },

  /**
   * Obtener alertas de un edificio específico
   * GET /api/edificios/:id/alertas
   */
  getAlertasPorEdificio: async (edificioId) => {
    try {
      const response = await api.get(`${BASE_URL}/${edificioId}/alertas`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAlertasPorEdificio:', error);
      throw error;
    }
  },

  /**
   * Obtener accesos globales (todos los edificios)
   * GET /api/edificios/accesos
   */
  getAccesosGlobales: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.desde) queryParams.append('desde', params.desde);
      if (params.hasta) queryParams.append('hasta', params.hasta);
      
      const url = `${BASE_URL}/accesos${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAccesosGlobales:', error);
      throw error;
    }
  },

  /**
   * Obtener alertas globales (todos los edificios)
   * GET /api/edificios/alertas
   */
  getAlertasGlobales: async () => {
    try {
      const response = await api.get(`${BASE_URL}/alertas`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAlertasGlobales:', error);
      throw error;
    }
  }
};

export default edificiosService;