// src/modules/vehiculos/services/vehiculosService.js
import api from '../../../shared/services/api';

const BASE_URL = '/vehiculos';

export const vehiculosService = {

  /**
   * Listar todos los vehículos del edificio
   * GET /api/vehiculos
   */
  listarVehiculos: async () => {
    try {
      const response = await api.get(BASE_URL);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error en listarVehiculos:', error);
      throw error;
    }
  },

  /**
   * Obtener un vehículo por ID
   * GET /api/vehiculos/:id
   */
  obtenerVehiculo: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en obtenerVehiculo:', error);
      throw error;
    }
  },

  /**
   * Listar vehículos de un inquilino específico
   * GET /api/vehiculos/inquilino/:inquilinoId
   */
  listarPorInquilino: async (inquilinoId) => {
    try {
      const response = await api.get(`${BASE_URL}/inquilino/${inquilinoId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error en listarPorInquilino:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo vehículo
   * POST /api/vehiculos
   */
  crearVehiculo: async (data) => {
    try {
      const response = await api.post(BASE_URL, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en crearVehiculo:', error);
      throw error;
    }
  },

  /**
   * Actualizar vehículo
   * PUT /api/vehiculos/:id
   */
  actualizarVehiculo: async (id, data) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en actualizarVehiculo:', error);
      throw error;
    }
  },

  /**
   * Activar/Desactivar vehículo
   * PUT /api/vehiculos/:id/toggle
   */
  toggleActivo: async (id) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}/toggle`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en toggleActivo:', error);
      throw error;
    }
  },

  /**
   * Eliminar vehículo permanentemente
   * DELETE /api/vehiculos/:id
   */
  eliminarVehiculo: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en eliminarVehiculo:', error);
      throw error;
    }
  },

  // Alias para compatibilidad
  getAll: async () => vehiculosService.listarVehiculos(),
  getById: async (id) => vehiculosService.obtenerVehiculo(id),
  create: async (data) => vehiculosService.crearVehiculo(data),
  update: async (id, data) => vehiculosService.actualizarVehiculo(id, data),
  delete: async (id) => vehiculosService.eliminarVehiculo(id)
};

export default vehiculosService;