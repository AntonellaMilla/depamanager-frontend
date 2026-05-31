// src/modules/administradores/index.js
export { default as AdministradoresPage } from './components/AdministradoresPage';
export { default as CrearAdministradorPage } from './components/CrearAdministradorPage';
export { default as VerAdministradorPage } from './components/VerAdministradorPage';
export { default as HistorialTimeline } from './components/HistorialTimeline';
export { administradoresService } from './services/administradoresService';

// Re-exportaciones para compatibilidad
export * from './services/administradoresService';