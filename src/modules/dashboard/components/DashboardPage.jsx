// src/modules/dashboard/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import Layout from '../../../shared/components/layout/Layout';
import { dashboardService } from '../services/dashboardService';

import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";

import StatsCards from '../components/StatsCards';
import RecentAccesses from '../components/RecentAccesses';
import ActiveAlerts from '../components/ActiveAlerts';
import BuildingsSummary from '../components/BuildingsSummary';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEdificioId, setSelectedEdificioId] = useState(null);

  // Obtener rol del usuario
  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // ============================================================
  // ROL: PROPIETARIO
  // ============================================================
  const fetchPropietarioDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getPropietarioDashboard();
      const data = response.data?.data || response.data || {};
      setDashboardData(data);
    } catch (error) {
      toast.error('Error al cargar el dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ROL: ADMINISTRADOR
  // ============================================================
  const fetchAdministradorDashboard = async (edificioId) => {
    try {
      setLoading(true);
      const response = await dashboardService.getAdministradorDashboard(edificioId);
      const data = response.data?.data || response.data || {};
      setDashboardData(data);
    } catch (error) {
      toast.error('Error al cargar el dashboard del edificio');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener el edificioId del administrador desde el usuario
  useEffect(() => {
    if (userRole === 'ADMINISTRADOR') {
      console.log('Usuario en DashboardPage:', user);
      // Intentar obtener edificioId de diferentes propiedades posibles
      const edificioId = user?.edificioId || user?.edificiosIds?.[0];
      if (edificioId) {
        setSelectedEdificioId(edificioId);
      } else {
        console.warn('No se encontró edificioId en el usuario:', user);
      }
    }
  }, [userRole, user]);

  // ============================================================
  // ROL: INQUILINO
  // ============================================================
  const fetchInquilinoDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getInquilinoDashboard();
      const data = response.data?.data || response.data || {};
      setDashboardData(data);
    } catch (error) {
      toast.error('Error al cargar el dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos según el rol
  useEffect(() => {
    if (!userRole) return;

    switch (userRole) {
      case 'PROPIETARIO':
        fetchPropietarioDashboard();
        break;
      case 'ADMINISTRADOR':
        // Si hay edificioId, cargar dashboard completo, sino mostrar dashboard vacío
        if (selectedEdificioId) {
          fetchAdministradorDashboard(selectedEdificioId);
        } else {
          // No hay edificioId asignado, mostrar dashboard vacío
          setDashboardData(null);
          setLoading(false);
        }
        break;
      case 'INQUILINO':
        fetchInquilinoDashboard();
        break;
      default:
        setLoading(false);
    }
  }, [userRole, selectedEdificioId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: `${roleColors.dark} transparent ${roleColors.dark} transparent` }}
            ></div>
            <p className="text-gray-500 font-medium">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDERIZADO PROPIETARIO
  // ============================================================
  if (userRole === 'PROPIETARIO' && dashboardData) {
    const { estadisticasGenerales, accesosRecientes, alertasActivas, resumenEdificios } = dashboardData;
    
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative">
            <div 
              className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
              style={{ backgroundColor: `${roleColors.dark}20` }}
            ></div>
            <div className="relative">
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1">Bienvenido de vuelta, {user?.nombres}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards data={estadisticasGenerales} role={userRole} />

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Edificios - 2 columnas en desktop */}
            <div className="lg:col-span-2">
              <BuildingsSummary buildings={resumenEdificios} />
            </div>
            
            {/* Alertas - 1 columna */}
            <div>
              <ActiveAlerts alerts={alertasActivas} />
            </div>
          </div>

          {/* Accesos recientes - ancho completo */}
          <RecentAccesses accesses={accesosRecientes} title="Accesos Recientes (24h)" maxItems={8} />
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDERIZADO ADMINISTRADOR
  // ============================================================
  if (userRole === 'ADMINISTRADOR' && dashboardData) {
    const { estadisticas, accesosHoy, alertasPendientes, inquilinosActivos, eventosRecientes, ultimoInquilino } = dashboardData;
    
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative">
            <div 
              className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
              style={{ backgroundColor: `${roleColors.dark}20` }}
            ></div>
            <div className="relative">
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-500 mt-1">Bienvenido de vuelta, {user?.nombres}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards data={{ ...estadisticas, accesosHoy, alertasPendientes, inquilinosActivos }} role={userRole} />

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accesos recientes */}
            <RecentAccesses accesses={eventosRecientes} title="Eventos Recientes" maxItems={5} />
            
            {/* Alertas pendientes */}
            {alertasPendientes > 0 && (
              <ActiveAlerts alerts={eventosRecientes?.filter(e => e.tipo === 'alerta') || []} title="Alertas Pendientes" maxItems={5} />
            )}
          </div>

          {/* Último inquilino creado */}
          {ultimoInquilino && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Último Inquilino Creado</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                  Nuevo
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColors.light}40` }}>
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {ultimoInquilino.usuario?.nombres} {ultimoInquilino.usuario?.apellidos}
                  </p>
                  <p className="text-sm text-gray-500">{ultimoInquilino.usuario?.email}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>Unidad {ultimoInquilino.unidad?.numero}</span>
                    {ultimoInquilino.unidad?.piso && <span>Piso {ultimoInquilino.unidad.piso}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información del edificio */}
          {user?.edificios && user.edificios.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Edificio Asignado</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${roleColors.light}40` }}>
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.edificios[0].nombre}</p>
                  <p className="text-sm text-gray-500">{user.edificios[0].direccion || 'Sin dirección'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDERIZADO INQUILINO
  // ============================================================
  if (userRole === 'INQUILINO' && dashboardData) {
    const { estadisticas, ultimosAccesos, alertasRecientes } = dashboardData;
    
    return (
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="relative">
            <div 
              className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
              style={{ backgroundColor: `${roleColors.dark}20` }}
            ></div>
            <div className="relative">
              <h1 className="text-3xl font-bold text-gray-800">Mi Dashboard</h1>
              <p className="text-gray-500 mt-1">Bienvenido a tu espacio personal, {user?.nombres}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards data={estadisticas} role={userRole} />

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mis accesos recientes */}
            <RecentAccesses accesses={ultimosAccesos} title="Mis Accesos Recientes" maxItems={5} />
            
            {/* Mis alertas */}
            <ActiveAlerts alerts={alertasRecientes} title="Mis Alertas" maxItems={5} />
          </div>
        </div>
      </Layout>
    );
  }

  // Estado por defecto (loading o sin datos)
  return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    </Layout>
  );
};

export default DashboardPage;