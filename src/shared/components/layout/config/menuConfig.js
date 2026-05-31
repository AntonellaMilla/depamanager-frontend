// src/components/common/config/menuConfig.js
import {
  Home, Building2, Users, Car, History, AlertTriangle,
  DoorOpen, Shield, TrendingUp, Camera
} from 'lucide-react';

// Definición de roles
export const ROLES = {
  PROPIETARIO: 'PROPIETARIO',
  ADMINISTRADOR: 'ADMINISTRADOR',
  INQUILINO: 'INQUILINO',
};

// Configuración de colores por rol - ¡Ahora con colores sólidos y elegantes!
export const ROLE_COLORS = {
  [ROLES.PROPIETARIO]: {
    dark: '#0F766E',     // Teal 600 - más oscuro y elegante
    light: '#14B8A6',    // Teal 500 para hover
    bg: 'bg-teal-600',
    text: 'text-teal-700',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-800',
    hover: 'hover:bg-teal-700',
    active: 'bg-teal-700 text-white',
  },
  [ROLES.ADMINISTRADOR]: {
    dark: '#1E3A8A',     // Blue 900 suave (más profundo, menos chillón)
    light: '#3B82F6',    // Blue 500 (puedes mantenerlo o bajarlo)
    bg: 'bg-blue-500',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    hover: 'hover:bg-blue-600',
    active: 'bg-blue-600 text-white',
  },
  [ROLES.INQUILINO]: {
    dark: '#CA8A04',     // yellow-600
    light: '#EAB308',    // yellow-500
    bg: 'bg-yellow-500',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    hover: 'hover:bg-yellow-600',
    active: 'bg-yellow-600 text-white',
  },
};

// El resto del archivo se mantiene igual...
export const MENU_BY_ROLE = {
  [ROLES.PROPIETARIO]: [
    { name: 'Dashboard', path: '/dashboard', icon: Home, description: 'Resumen general' },
    { name: 'Edificios', path: '/edificios', icon: Building2, description: 'Gestionar edificios' },
    { name: 'Administradores', path: '/administradores', icon: Shield, description: 'Gestionar admins' },
    { name: 'Accesos', path: '/accesos', icon: History, description: 'Historial de accesos' },
    { name: 'Alertas', path: '/alertas', icon: AlertTriangle, description: 'Notificaciones' },
    { name: 'Cámaras', path: '/camaras', icon: Camera, description: 'Ver cámaras de seguridad' },
  ],
  [ROLES.ADMINISTRADOR]: [
    { name: 'Dashboard', path: '/dashboard', icon: Home, description: 'Resumen general' },
    { name: 'Unidades', path: '/unidades', icon: DoorOpen, description: 'Gestionar unidades' },
    { name: 'Inquilinos', path: '/inquilinos', icon: Users, description: 'Gestionar inquilinos' },
    { name: 'Vehículos', path: '/vehiculos', icon: Car, description: 'Registrar vehículos' },
    { name: 'Accesos', path: '/accesos', icon: History, description: 'Ver accesos' },
    { name: 'Alertas', path: '/alertas', icon: AlertTriangle, description: 'Ver alertas' },
    { name: 'Cámaras', path: '/camaras', icon: Camera, description: 'Ver cámaras' },
  ],
  [ROLES.INQUILINO]: [
    { name: 'Dashboard', path: '/dashboard', icon: Home, description: 'Mi resumen' },
    { name: 'Mis Vehículos', path: '/vehiculos', icon: Car, description: 'Mis vehículos registrados' },
    { name: 'Accesos', path: '/accesos', icon: History, description: 'Mi historial' },
  ],
};

export const getMenuItems = (role) => {
  return MENU_BY_ROLE[role] || MENU_BY_ROLE[ROLES.PROPIETARIO];
};

export const getRoleColors = (role) => {
  return ROLE_COLORS[role] || ROLE_COLORS[ROLES.PROPIETARIO];
};

export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.PROPIETARIO]: 'Propietario',
    [ROLES.ADMINISTRADOR]: 'Administrador',
    [ROLES.INQUILINO]: 'Inquilino',
  };
  return labels[role] || 'Usuario';
};