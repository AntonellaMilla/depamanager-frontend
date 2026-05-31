// src/modules/dashboard/index.js

// ============================================================
// PÁGINAS
// ============================================================
export { default as DashboardPage } from './pages/DashboardPage';

// ============================================================
// SERVICIOS
// ============================================================
export { dashboardService } from './services/dashboardService';
export { default as dashboardService } from './services/dashboardService';

// ============================================================
// COMPONENTES
// ============================================================
export { default as StatsCards } from './components/StatsCards';
export { default as RecentAccesses } from './components/RecentAccesses';
export { default as ActiveAlerts } from './components/ActiveAlerts';
export { default as BuildingsSummary } from './components/BuildingsSummary';
export { default as ChartCard } from './components/ChartCard';

// ============================================================
// RE-EXPORTACIONES PARA FACILIDAD
// ============================================================
export * from './services/dashboardService';