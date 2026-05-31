// src/components/ui/config/uiConfig.js
/**
 * Configuración centralizada de componentes UI
 * Sigue el patrón de menuConfig.js para mantener consistencia
 */

export const BUTTON_VARIANTS = {
  // Primarias
  primary: {
    base: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    focus: 'focus:ring-blue-500',
  },
  secondary: {
    base: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    focus: 'focus:ring-gray-500',
  },

  // Variantes por rol
  propietario: {
    base: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800',
    focus: 'focus:ring-teal-500',
  },
  administrador: {
    base: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    focus: 'focus:ring-blue-500',
  },
  inquilino: {
    base: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    focus: 'focus:ring-green-500',
  },

  // Semánticas
  success: {
    base: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
    focus: 'focus:ring-green-500',
  },
  danger: {
    base: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    focus: 'focus:ring-red-500',
  },
  warning: {
    base: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
    focus: 'focus:ring-yellow-500',
  },

  // Outline
  outline: {
    base: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    focus: 'focus:ring-blue-500',
  },
  'outline-danger': {
    base: 'border border-red-300 bg-white text-red-600 hover:bg-red-50 active:bg-red-100',
    focus: 'focus:ring-red-500',
  },

  // Ghost (sin fondo)
  ghost: {
    base: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
    focus: 'focus:ring-gray-500',
  },
};

export const BUTTON_SIZES = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
  xl: 'px-8 py-4 text-xl',
};

export const INPUT_STYLES = {
  base: 'w-full px-4 py-3 border rounded-xl transition-all font-medium',
  focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
  default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
  disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200',
};

export const MODAL_SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  fullscreen: 'max-w-6xl',
};

export const MODAL_VARIANTS = {
  default: {
    bg: 'bg-white',
    header: 'border-b border-gray-200',
    title: 'text-xl font-semibold text-gray-800',
  },
  danger: {
    bg: 'bg-white',
    header: 'border-b-2 border-red-300 bg-red-50',
    title: 'text-xl font-semibold text-red-600',
  },
  success: {
    bg: 'bg-white',
    header: 'border-b-2 border-green-300 bg-green-50',
    title: 'text-xl font-semibold text-green-600',
  },
  info: {
    bg: 'bg-white',
    header: 'border-b-2 border-blue-300 bg-blue-50',
    title: 'text-xl font-semibold text-blue-600',
  },
};

export const TABLE_STYLES = {
  container: 'bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100',
  header: 'bg-gradient-to-r from-gray-50 to-gray-100',
  headerCell: 'px-6 py-4 text-left text-sm font-semibold text-gray-700',
  row: 'hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100',
  cell: 'px-6 py-4 text-sm text-gray-700',
  emptyState: 'bg-white rounded-2xl p-12 text-center',
  loading: 'bg-white rounded-2xl p-12 text-center',
};

export const BADGE_STYLES = {
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

export const LOADING_SPINNER = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
};

// Función auxiliar para obtener variante de botón
export const getButtonVariant = (variant = 'primary') => {
  return BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
};

// Función auxiliar para obtener tamaño de botón
export const getButtonSize = (size = 'md') => {
  return BUTTON_SIZES[size] || BUTTON_SIZES.md;
};

// Función auxiliar para obtener estilos de modal
export const getModalVariant = (type = 'default') => {
  return MODAL_VARIANTS[type] || MODAL_VARIANTS.default;
};
