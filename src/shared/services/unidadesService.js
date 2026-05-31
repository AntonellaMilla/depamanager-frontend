import api from './api';

/**
 * Servicio para gestionar unidades
 * Compartido entre módulos
 */
export const unidadesService = {
  /**
   * Obtener unidades disponibles del edificio actual
   * (Solo unidades sin inquilino asignado)
   */
  getDisponibles: async () => {
    try {
      const response = await api.get('/unidades/disponibles');
      return response.data;
    } catch (error) {
      console.warn('No se pudo obtener unidades disponibles:', error.message);
      // Retornar estructura vacía para que el frontend continúe funcionando
      return { data: { data: [] } };
    }
  },

  /**
   * Obtener todas las unidades del edificio
   */
  getAll: async () => {
    const response = await api.get('/unidades');
    return response.data;
  },

  /**
   * Obtener unidad por ID
   */
  getById: async (id) => {
    const response = await api.get(`/unidades/${id}`);
    return response.data;
  }
};

export default unidadesService;
