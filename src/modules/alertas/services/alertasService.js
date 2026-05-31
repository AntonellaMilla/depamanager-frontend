// src/modules/alertas/services/alertasService.js
import api from '../../../shared/services/api';

/**
 * Servicio de Alertas - Gestión de alertas de seguridad
 * Endpoints:
 *  - GET /api/edificios/alertas (Listar todas las alertas del propietario)
 *  - PUT /api/edificios/alertas/:id (Marcar como atendida)
 */
export const alertasService = {
  /**
   * Obtener todas las alertas de los edificios del propietario
   * GET /api/edificios/alertas
   * Retorna: Array de Alerta con relación a HistorialAcceso y Edificio
   */
  getAll: async () => {
    try {
      // ✅ CORREGIDO: Usar la ruta correcta /edificios/alertas
      const response = await api.get('/edificios/alertas');
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAll alertas:', error);
      throw error;
    }
  },

  /**
   * Marcar una alerta como atendida
   * PUT /api/edificios/alertas/:id
   */
  marcarAtendida: async (alertaId) => {
    try {
      // ✅ CORREGIDO: Usar la ruta correcta /edificios/alertas/:id
      const response = await api.put(`/edificios/alertas/${alertaId}`, {
        atendida: true,
        fechaAtencion: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error en marcarAtendida:', error);
      throw error;
    }
  }
};

export default alertasService;