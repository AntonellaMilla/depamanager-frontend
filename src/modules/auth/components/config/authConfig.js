// src/pages/auth/config/authConfig.js
/**
 * Configuración de colores y estilos para páginas de autenticación
 * Mantiene consistencia con el sistema de roles
 */

export const AUTH_COLORS = {
  propietario: {
    primary: '#008B8B',
    light: '#E0F2F1',
    border: '#80DEEA',
    text: '#00695C',
    name: 'Propietario',
    icon: 'Crown'
  },
  administrador: {
    primary: '#1D4ED8',
    light: '#EFF6FF',
    border: '#93C5FD',
    text: '#1E3A8A',
    name: 'Administrador',
    icon: 'UserCog'
  },
  inquilino: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    border: '#FDE68A',
    text: '#92400E',
    name: 'Inquilino',
    icon: 'Users'
  }
};

export const AUTH_ROLES = [
  {
    role: 'propietario',
    icon: 'Crown',
    title: 'Propietario',
    description: 'Gestión de edificios y suscripciones',
    color: AUTH_COLORS.propietario
  },
  {
    role: 'administrador',
    icon: 'UserCog',
    title: 'Administrador',
    description: 'Gestión de inquilinos y unidades',
    color: AUTH_COLORS.administrador
  },
  {
    role: 'inquilino',
    icon: 'Users',
    title: 'Inquilino',
    description: 'Acceso a vehículos y alertas',
    color: AUTH_COLORS.inquilino
  }
];
