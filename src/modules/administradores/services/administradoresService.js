// src/modules/administradores/services/administradoresService.js
import api from '../../../shared/services/api';

const BASE_URL = '/usuarios/admin';
const AUDITORIA_URL = '/auditoria';
const ADMINISTRADORES_URL = '/administradores';

export const administradoresService = {
  /**
   * Listar todos los administradores
   * GET /api/usuarios/admin
   */
  listarAdministradores: async () => {
    try {
      const response = await api.get(BASE_URL);
      return response.data?.data || response.data || [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear nuevo administrador
   * POST /api/usuarios/admin
   */
  crearAdministrador: async (adminData) => {
    try {
      const response = await api.post(BASE_URL, adminData);
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar administrador
   * PUT /api/usuarios/admin/:id
   */
  actualizarAdministrador: async (adminId, adminData) => {
    try {
      const response = await api.put(`${BASE_URL}/${adminId}`, adminData);
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar administrador
   * DELETE /api/usuarios/admin/:id
   */
  eliminarAdministrador: async (adminId) => {
    try {
      const response = await api.delete(`${BASE_URL}/${adminId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener detalles de un administrador específico
   * GET /api/usuarios/admin/:id
   */
  obtenerAdministrador: async (adminId) => {
    try {
      const response = await api.get(`${BASE_URL}/${adminId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Activar/Desactivar administrador
   * PUT /api/usuarios/admin/:id
   */
  toggleStatus: async (adminId, activo) => {
    try {
      const response = await api.put(`${BASE_URL}/${adminId}`, { activo });
      return response.data?.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener edificios asignados a un administrador
   * GET /api/administradores/usuario/:usuarioId/edificios
   */
  getEdificiosAsignados: async (usuarioId) => {
    try {
      const response = await api.get(`${ADMINISTRADORES_URL}/usuario/${usuarioId}/edificios`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error al cargar edificios asignados:', error);
      return [];
    }
  },

  /**
   * Obtener historial de auditoría de un administrador
   * GET /api/auditoria/usuario/:usuarioId
   */
  getAuditoria: async (usuarioId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.edificioId) queryParams.append('edificioId', params.edificioId);
      if (params.desde) queryParams.append('desde', params.desde);
      if (params.hasta) queryParams.append('hasta', params.hasta);
      
      const url = `${AUDITORIA_URL}/usuario/${usuarioId}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error al cargar auditoría:', error);
      return [];
    }
  },

  /**
   * Obtener estadísticas de auditoría
   * GET /api/auditoria/usuario/:usuarioId/stats
   */
  getAuditoriaStats: async (usuarioId) => {
    try {
      const response = await api.get(`${AUDITORIA_URL}/usuario/${usuarioId}/stats`);
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      return null;
    }
  },

  // Alias para compatibilidad
  getAll: async () => {
    return administradoresService.listarAdministradores();
  },
  update: async (id, data) => {
    return administradoresService.actualizarAdministrador(id, data);
  },
  delete: async (id) => {
    return administradoresService.eliminarAdministrador(id);
  }
};

export default administradoresService;