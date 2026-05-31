import { DEFAULT_ROLE } from '../constants/roles';

/**
 * Normaliza el rol de un usuario a string
 * @param {Object|string} rol - El rol del usuario (puede ser objeto o string)
 * @returns {string} El rol normalizado como string
 */
export const normalizeRole = (rol) => {
  if (!rol) return DEFAULT_ROLE;

  // Si el rol ya es string, retornar tal cual
  if (typeof rol === 'string') {
    return rol;
  }

  // Si el rol es objeto, extraer la propiedad nombre o name
  if (typeof rol === 'object') {
    return rol.nombre || rol.name || DEFAULT_ROLE;
  }

  return DEFAULT_ROLE;
};

/**
 * Normaliza los datos del usuario
 * Extrae el usuario de estructuras anidadas y normaliza el rol
 * @param {Object} userData - Datos del usuario (puede contener estructura anidada)
 * @returns {Object} Usuario normalizado
 */
export const normalizeUser = (userData) => {
  if (!userData) return null;

  // Si viene envuelto en propiedad 'usuario', extraer
  const user = userData.usuario || userData;

  // Normalizar el rol a string si viene como objeto
  if (user.rol) {
    user.rol = normalizeRole(user.rol);
  }

  return user;
};

/**
 * Obtiene el valor del rol como string en mayúsculas
 * @param {Object|string} rol - El rol del usuario
 * @returns {string} El rol en mayúsculas
 */
export const getRoleValue = (rol) => {
  const normalizedRole = normalizeRole(rol);
  return normalizedRole?.toUpperCase();
};
