import api from '../../../shared/services/api';

/**
 * Servicio de Accesos - Historial de accesos vehiculares
 * Endpoints:
 *  - GET /api/accesos (Listar accesos filtrados por rol del usuario autenticado)
 *  - GET /api/edificios/accesos (Listar todos los accesos del propietario/administrador)
 *  - GET /api/edificios/alertas (Listar alertas asociadas)
 */
export const accesosService = {
  /**
   * Obtener historial de accesos filtrado por rol del usuario autenticado
   * GET /api/accesos
   * Retorna: Array de HistorialAcceso con relaciones (vehiculo, camara, alerta)
   * - PROPIETARIO: todos los accesos de sus edificios
   * - ADMINISTRADOR: accesos de su edificio asignado
   * - INQUILINO: accesos de sus vehículos
   */
  getByRole: async () => {
    try {
      const response = await api.get('/accesos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener historial de accesos de todos los edificios (PROPIETARIO/ADMINISTRADOR)
   * GET /api/edificios/accesos
   * Retorna: Array de HistorialAcceso con relaciones (vehiculo, camara, alerta)
   */
  getAll: async () => {
    try {
      const response = await api.get('/edificios/accesos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener alertas globales de todos los edificios (PROPIETARIO/ADMINISTRADOR)
   * GET /api/edificios/alertas
   * Retorna: Array de Alerta con relación al HistorialAcceso
   */
  getAlertas: async () => {
    try {
      const response = await api.get('/edificios/alertas');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default accesosService;
