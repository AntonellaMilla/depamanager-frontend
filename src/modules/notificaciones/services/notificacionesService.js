// src/modules/notificaciones/services/notificacionesService.js
import api from '../../../shared/services/api';

const BASE_URL = '/notificaciones';

export const notificacionesService = {

  /**
   * Obtener notificaciones del usuario autenticado
   * GET /api/notificaciones
   * @param {boolean} soloNoLeidas - Si es true, solo trae no leídas
   */
  obtenerNotificaciones: async (soloNoLeidas = false) => {
    try {
      const url = soloNoLeidas ? `${BASE_URL}?leidas=false` : BASE_URL;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerNotificaciones:', error);
      throw error;
    }
  },

  /**
   * Marcar una notificación como leída
   * PUT /api/notificaciones/:id/leida
   * @param {string} notificacionId - ID de la notificación
   */
  marcarComoLeida: async (notificacionId) => {
    try {
      const response = await api.put(`${BASE_URL}/${notificacionId}/leida`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en marcarComoLeida:', error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   * @param {Array} notificacionesIds - IDs de notificaciones a marcar
   */
  marcarTodasComoLeidas: async (notificacionesIds) => {
    try {
      const promises = notificacionesIds.map(id => 
        api.put(`${BASE_URL}/${id}/leida`)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('❌ Error en marcarTodasComoLeidas:', error);
      throw error;
    }
  },

  /**
   * Ejecutar mantenimiento de notificaciones (solo admin/propietario)
   * POST /api/notificaciones/mantenimiento
   */
  ejecutarMantenimiento: async () => {
    try {
      const response = await api.post(`${BASE_URL}/mantenimiento`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en ejecutarMantenimiento:', error);
      throw error;
    }
  }
};

export default notificacionesService;