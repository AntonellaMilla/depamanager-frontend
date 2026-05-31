// src/modules/unidades/services/unidadesService.js
import api from '../../../shared/services/api';

const BASE_URL = '/unidades';

export const unidadesService = {

  /**
   * Listar todas las unidades del edificio del administrador
   * GET /api/unidades
   */
  listarUnidades: async () => {
    try {
      const response = await api.get(BASE_URL);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error en listarUnidades:', error);
      throw error;
    }
  },

  /**
   * Obtener una unidad por ID
   * Nota: El backend no tiene endpoint específico, se filtra del listado
   */
  obtenerUnidad: async (id, unidadesList) => {
    return unidadesList?.find(u => u.id === id) || null;
  },

  /**
   * Crear una nueva unidad (individual)
   * POST /api/unidades
   */
  crearUnidad: async (unidadData) => {
    try {
      const response = await api.post(BASE_URL, unidadData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en crearUnidad:', error);
      throw error;
    }
  },

  /**
   * Crear múltiples unidades (por rango)
   * POST /api/unidades (con desde, hasta, piso)
   */
  crearUnidadesPorRango: async (desde, hasta, piso, capacidadMaxima = 2) => {
    try {
      const response = await api.post(BASE_URL, {
        desde,
        hasta,
        piso,
        capacidadMaxima
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en crearUnidadesPorRango:', error);
      throw error;
    }
  },

  /**
   * Actualizar una unidad
   * PUT /api/unidades/:id
   */
  actualizarUnidad: async (id, unidadData) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, unidadData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en actualizarUnidad:', error);
      throw error;
    }
  },

  /**
   * Eliminar (desactivar) una unidad
   * DELETE /api/unidades/:id
   */
  eliminarUnidad: async (id) => {
    try {
      const response = await api.delete(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en eliminarUnidad:', error);
      throw error;
    }
  },

  // Alias para compatibilidad
  getAll: async () => unidadesService.listarUnidades(),
  create: async (data) => unidadesService.crearUnidad(data),
  update: async (id, data) => unidadesService.actualizarUnidad(id, data),
  delete: async (id) => unidadesService.eliminarUnidad(id)
};

export default unidadesService;