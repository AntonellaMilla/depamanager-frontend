// Constantes de roles del sistema
export const ROLES = {
  PROPIETARIO: 'PROPIETARIO',
  ADMINISTRADOR: 'ADMINISTRADOR',
  INQUILINO: 'INQUILINO',
};

// Roles válidos del sistema
export const VALID_ROLES = Object.values(ROLES);

// Rol por defecto cuando no se puede determinar el rol
export const DEFAULT_ROLE = ROLES.PROPIETARIO;
