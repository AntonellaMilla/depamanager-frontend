// src/modules/dashboard/services/dashboardService.js
import api from '../../../shared/services/api';

/**
 * Servicio de Dashboard - Métricas e indicadores según rol
 * Endpoints:
 *  - GET /api/dashboard/propietario (Dashboard del propietario)
 *  - GET /api/dashboard/administrador/:edificioId (Dashboard del administrador)
 */
export const dashboardService = {

  /**
   * Obtener dashboard del PROPIETARIO
   * GET /api/dashboard/propietario
   * @returns {Promise} Dashboard con estadísticas generales, accesos recientes, alertas activas, resumen de edificios
   */
  getPropietarioDashboard: async () => {
    try {
      const response = await api.get('/dashboard/propietario');
      return response.data;
    } catch (error) {
      console.error('❌ Error en getPropietarioDashboard:', error);
      throw error;
    }
  },

  /**
   * Obtener dashboard del ADMINISTRADOR para un edificio específico
   * GET /api/dashboard/administrador/:edificioId
   * @param {string} edificioId - ID del edificio
   * @returns {Promise} Dashboard con estadísticas del edificio, accesos hoy, alertas pendientes
   */
  getAdministradorDashboard: async (edificioId) => {
    try {
      const response = await api.get(`/dashboard/administrador/${edificioId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAdministradorDashboard:', error);
      throw error;
    }
  },

  /**
   * Obtener dashboard del INQUILINO
   * GET /api/dashboard/inquilino
   * @returns {Promise} Dashboard con estadísticas personales, accesos recientes, alertas
   */
  getInquilinoDashboard: async () => {
    try {
      const response = await api.get('/dashboard/inquilino');
      return response.data;
    } catch (error) {
      console.error('❌ Error en getInquilinoDashboard:', error);
      throw error;
    }
  }
};

export default dashboardService;