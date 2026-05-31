// src/modules/inquilinos/services/inquilinosService.js
import api from '../../../shared/services/api';

const BASE_URL = '/inquilinos';
const USUARIOS_URL = '/usuarios';

export const inquilinosService = {

  // ==================== USUARIOS INQUILINOS ====================
  
  /**
   * Listar usuarios con rol INQUILINO (creados previamente)
   * GET /api/usuarios/inquilinos-usuarios
   */
  listarUsuariosInquilinos: async () => {
    try {
      const response = await api.get(`${USUARIOS_URL}/inquilinos-usuarios`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error en listarUsuariosInquilinos:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo usuario con rol INQUILINO
   * POST /api/usuarios/inquilino-usuario
   */
  CrearInquilinoPage: async (datos) => {
    try {
      const response = await api.post(`${USUARIOS_URL}/inquilino-usuario`, datos);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en CrearInquilinoPage:', error);
      throw error;
    }
  },

  // ==================== INQUILINOS (ASIGNACIÓN) ====================

  /**
   * Asignar un usuario inquilino a una unidad (crear registro Inquilino)
   * POST /api/inquilinos
   */
  asignarInquilino: async (datos) => {
    try {
      const response = await api.post(BASE_URL, datos);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en asignarInquilino:', error);
      throw error;
    }
  },


  /**
   * Listar todos los inquilinos del edificio (con relaciones)
   * GET /api/inquilinos
   */
  listarInquilinos: async () => {
    try {
      const response = await api.get(BASE_URL);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Error en listarInquilinos:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de un inquilino específico
   * GET /api/inquilinos/:id
   */
  obtenerInquilino: async (id) => {
    try {
      const response = await api.get(`${BASE_URL}/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en obtenerInquilino:', error);
      throw error;
    }
  },

  /**
   * Actualizar datos del inquilino (contrato, contacto emergencia)
   * PUT /api/inquilinos/:id
   */
  actualizarInquilino: async (id, data) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en actualizarInquilino:', error);
      throw error;
    }
  },

  /**
   * Finalizar contrato
   * PUT /api/inquilinos/:id/finalizar
   */
  finalizarContrato: async (id) => {
    try {
      const response = await api.put(`${BASE_URL}/${id}/finalizar`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ Error en finalizarContrato:', error);
      throw error;
    }
  },

  // Alias para compatibilidad
  getAll: async () => inquilinosService.listarInquilinos(),
  getById: async (id) => inquilinosService.obtenerInquilino(id),
  update: async (id, data) => inquilinosService.actualizarInquilino(id, data),
  delete: async (id) => inquilinosService.finalizarContrato(id)
};

export default inquilinosService;