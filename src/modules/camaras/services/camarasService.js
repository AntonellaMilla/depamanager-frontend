// src/modules/camaras/services/camarasService.js
import api from '../../../shared/services/api';

const BASE_URL = '/camaras';

export const camarasService = {

  /**
   * Listar todas las cámaras del edificio
   * GET /api/camaras
   */
  listarCamaras: async () => {
    try {
      const response = await api.get(BASE_URL);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error en listarCamaras:', error);
      throw error;
    }
  },

  /**
   * Obtener una cámara por ID
   * GET /api/camaras/:id
   */
  obtenerCamara: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en obtenerCamara:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva cámara
   * POST /api/camaras
   */
  crearCamara: async (data) => {
    try {
      const response = await api.post(BASE_URL, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en crearCamara:', error);
      throw error;
    }
  },

  /**
   * Actualizar una cámara
   * PUT /api/camaras/:id
   */
  actualizarCamara: async (id, data) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en actualizarCamara:', error);
      throw error;
    }
  },

  /**
   * Eliminar (soft delete) una cámara
   * DELETE /api/camaras/:id
   */
  eliminarCamara: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en eliminarCamara:', error);
      throw error;
    }
  },

  // Alias para compatibilidad
  getAll: async () => camarasService.listarCamaras(),
  getById: async (id) => camarasService.obtenerCamara(id),
  create: async (data) => camarasService.crearCamara(data),
  update: async (id, data) => camarasService.actualizarCamara(id, data),
  delete: async (id) => camarasService.eliminarCamara(id)
};

export default camarasService;