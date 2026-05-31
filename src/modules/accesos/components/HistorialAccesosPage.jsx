// src/modules/accesos/components/HistorialAccesosPage.jsx
import { useState, useEffect } from 'react';
import { 
  Eye, Search, AlertCircle, CheckCircle, HelpCircle, 
  Calendar, Building2, Camera, Shield, Activity, 
  X, Download, Filter, ChevronDown, TrendingUp, Clock, Car
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Table from '../../../shared/components/ui/Table';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { accesosService } from '../services/accesosService';
import { vehiculosService } from '../../vehiculos/services/vehiculosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const HistorialAccesosPage = () => {
  const { user } = useAuth();
  
  // Estado de datos
  const [accesos, setAccesos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros y búsqueda
  const [filtroResultado, setFiltroResultado] = useState('todos');
  const [busquedaPlaca, setBusquedaPlaca] = useState('');
  const [filtroAlerta, setFiltroAlerta] = useState('todos');
  const [showFilters, setShowFilters] = useState(true);

  // Modal de detalles
  const [detalles, setDetalles] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Obtener rol para colores
  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // Cargar datos
  useEffect(() => {
    fetchData();
  }, []);

  // Si el usuario es inquilino, obtener las placas de sus vehículos para filtrar accesos
  const [userPlacas, setUserPlacas] = useState([]);
  useEffect(() => {
    const fetchUserPlacas = async () => {
      if (userRole !== 'INQUILINO') return;
      try {
        const resp = await vehiculosService.listarVehiculos();
        const list = resp.data?.data || resp.data || resp || [];
        const placas = list
          .filter(v => v.inquilino && (v.inquilino.usuario?.id === user?.id || v.inquilinoId === user?.id || v.usuarioId === user?.id))
          .map(v => v.placa?.toUpperCase())
          .filter(Boolean);
        setUserPlacas(placas);
      } catch (err) {
        console.warn('No se pudieron obtener vehículos del usuario:', err);
      }
    };
    fetchUserPlacas();
  }, [user, userRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Usar endpoint según rol: INQUILINO usa /api/accesos (filtrado por sus vehículos)
      // PROPIETARIO y ADMINISTRADOR usan /api/edificios/accesos
      const accesosMethod = userRole === 'INQUILINO' ? accesosService.getByRole : accesosService.getAll;
      
      console.log('Rol del usuario:', userRole);
      console.log('Usuario:', user);
      
      // Obtener accesos
      const accesosResponse = await accesosMethod();
      console.log('Respuesta accesos:', accesosResponse);
      
      // Extraer datos de la respuesta
      const accesosData = accesosResponse?.data || accesosResponse || [];
      setAccesos(accesosData);
      
      // Solo obtener alertas para PROPIETARIO y ADMINISTRADOR (INQUILINO no tiene acceso)
      if (userRole !== 'INQUILINO') {
        try {
          const alertasResponse = await accesosService.getAlertas();
          console.log('Respuesta alertas:', alertasResponse);
          const alertasData = alertasResponse?.data || alertasResponse || [];
          setAlertas(alertasData);
        } catch (error) {
          console.warn('No se pudieron cargar las alertas:', error);
          setAlertas([]);
        }
      } else {
        setAlertas([]);
      }
      
    } catch (error) {
      toast.error('Error al cargar el historial de accesos');
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mapa de alertas por historialId para acceso rápido
  const alertasPorHistorial = new Map();
  alertas.forEach(alerta => {
    if (alerta.historialId) {
      alertasPorHistorial.set(alerta.historialId, alerta);
    }
  });

  // Enriquecer accesos con sus alertas
  const accesosConAlertas = accesos.map(acceso => ({
    ...acceso,
    alerta: alertasPorHistorial.get(acceso.id) || null
  }));

  // Filtrar accesos
  const accesosFiltrados = accesosConAlertas.filter(acceso => {
    // El backend ya filtra por rol, así que aquí solo aplicamos filtros de búsqueda del usuario
    // No filtramos por edificio porque el backend ya lo hace según el rol del usuario
    
    if (userRole === 'INQUILINO') {
      // Mostrar solo accesos que correspondan a las placas del usuario
      if (!userPlacas || userPlacas.length === 0) return false;
      const placa = acceso.placa?.toUpperCase() || '';
      if (!userPlacas.includes(placa)) return false;
    }
    if (filtroResultado !== 'todos' && acceso.resultado !== filtroResultado) return false;
    if (filtroAlerta === 'con-alerta' && !acceso.alerta) return false;
    if (filtroAlerta === 'sin-alerta' && acceso.alerta) return false;
    if (busquedaPlaca && !acceso.placa?.toUpperCase().includes(busquedaPlaca.toUpperCase())) return false;
    return true;
  });

  // Estadísticas (visibles según rol y filtros aplicados)
  const stats = {
    total: accesosFiltrados.length,
    autorizados: accesosFiltrados.filter(a => a.resultado === 'AUTORIZADO').length,
    noAutorizados: accesosFiltrados.filter(a => a.resultado === 'NO_AUTORIZADO').length,
    noIdentificados: accesosFiltrados.filter(a => a.resultado === 'NO_IDENTIFICADO').length,
    conAlertas: accesosFiltrados.filter(a => a.alerta).length
  };

  // Obtener color del resultado
  const getResultadoConfig = (resultado) => {
    switch (resultado) {
      case 'AUTORIZADO':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Autorizado' };
      case 'NO_AUTORIZADO':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'No autorizado' };
      case 'NO_IDENTIFICADO':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: HelpCircle, label: 'No identificado' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: HelpCircle, label: 'Desconocido' };
    }
  };

  // Obtener color del nivel de alerta
  const getNivelAlertaConfig = (nivel) => {
    switch (nivel) {
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-700';
      case 'ALTA':
        return 'bg-orange-100 text-orange-700';
      case 'CRITICA':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleVerDetalles = (acceso) => {
    setDetalles(acceso);
    setMostrarModal(true);
  };

  const resetFilters = () => {
    setBusquedaPlaca('');
    setFiltroResultado('todos');
    setFiltroAlerta('todos');
  };

  const columns = [
    {
      header: 'Fecha y Hora',
      key: 'fecha',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Calendar size={14} className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {new Date(row.fechaEvento).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(row.fechaEvento).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Ubicación',
      key: 'ubicacion',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-800">{row.camara?.edificio?.nombre || '-'}</p>
            <p className="text-xs text-gray-400">{row.camara?.nombre || 'Cámara no especificada'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Placa',
      key: 'placa',
      render: (value) => (
        <div className="font-mono font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg inline-block text-sm">
          {value || 'No identificada'}
        </div>
      )
    },
    {
      header: 'Resultado',
      key: 'resultado',
      render: (value) => {
        const config = getResultadoConfig(value);
        const IconComponent = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <IconComponent size={12} />
            {config.label}
          </span>
        );
      }
    },
    {
      header: 'Confianza',
      key: 'confianza',
      render: (_, row) => {
        // Si el valor es mayor a 1, asumir que ya está en rango 1-100
        // Si es menor o igual a 1, asumir que es decimal (0-1) y multiplicar por 100
        const nivel = row.nivelConfianza ? 
          (row.nivelConfianza > 1 ? Math.round(row.nivelConfianza) : Math.round(row.nivelConfianza * 100)) : null;
        const getColor = () => {
          if (!nivel) return 'text-gray-400';
          if (nivel >= 90) return 'text-green-600';
          if (nivel >= 70) return 'text-emerald-600';
          if (nivel >= 50) return 'text-yellow-600';
          if (nivel >= 25) return 'text-orange-600';
          return 'text-red-600';
        };
        const getBarColor = () => {
          if (!nivel) return 'bg-gray-300';
          if (nivel >= 90) return 'bg-green-500';
          if (nivel >= 70) return 'bg-emerald-500';
          if (nivel >= 50) return 'bg-yellow-500';
          if (nivel >= 25) return 'bg-orange-500';
          return 'bg-red-500';
        };
        return nivel ? (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getBarColor()}`}
                style={{ width: `${Math.min(nivel, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${getColor()}`}>{Math.min(nivel, 100)}%</span>
          </div>
        ) : <span className="text-gray-400 text-xs">-</span>;
      }
    },
    {
      header: 'Alerta',
      key: 'alerta',
      render: (_, row) => {
        if (!row.alerta) {
          return <span className="text-gray-400 text-xs">—</span>;
        }
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getNivelAlertaConfig(row.alerta.nivel)}`}>
            <AlertCircle size={10} />
            {row.alerta.nivel}
            {row.alerta.atendida && <CheckCircle size={10} className="ml-1 text-green-600" />}
          </span>
        );
      }
    },
    {
      header: 'Acciones',
      key: 'acciones',
      align: 'center',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => handleVerDetalles(row)}
          title="Ver detalles"
          className="hover:bg-teal-50 hover:text-teal-600"
        />
      )
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-4">
        {/* Header */}
        <div className="relative mb-8">
          <div 
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${roleColors.dark}20` }}
          ></div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
              >
                <Activity size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Historial de Accesos</h1>
                <p className="text-gray-500 mt-1">Monitoreo de accesos vehiculares y alertas generadas</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              icon={Download}
              onClick={() => toast.success('Exportando datos...')}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Cards de estadísticas */}
        {accesos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total accesos</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Activity size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Autorizados</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.autorizados}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">No autorizados</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.noAutorizados}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle size={18} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">No identificados</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.noIdentificados}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <HelpCircle size={18} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Alertas</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.conAlertas}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertCircle size={18} className="text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} style={{ color: roleColors.dark }} />
                <h2 className="font-semibold text-gray-800">Filtros de búsqueda</h2>
              </div>
            <Button
              variant="ghost"
              size="sm"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Buscar por placa"
                  icon={Search}
                  value={busquedaPlaca}
                  onChange={(e) => setBusquedaPlaca(e.target.value)}
                  size="sm"
                />
                <Select
                  label="Resultado"
                  name="resultado"
                  value={filtroResultado}
                  onChange={(e) => setFiltroResultado(e.target.value)}
                  options={[
                    { value: 'todos', label: 'Todos los resultados' },
                    { value: 'AUTORIZADO', label: 'Autorizado' },
                    { value: 'NO_AUTORIZADO', label: 'No autorizado' },
                    { value: 'NO_IDENTIFICADO', label: 'No identificado' }
                  ]}
                  size="sm"
                />
                <Select
                  label="Alertas"
                  name="alerta"
                  value={filtroAlerta}
                  onChange={(e) => setFiltroAlerta(e.target.value)}
                  options={[
                    { value: 'todos', label: 'Todas' },
                    { value: 'con-alerta', label: 'Con alerta' },
                    { value: 'sin-alerta', label: 'Sin alerta' }
                  ]}
                  size="sm"
                />
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    size="sm"
                    fullWidth
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={accesosFiltrados}
            isLoading={loading}
            title="Registros de Acceso"
            searchable={false}
            emptyMessage={accesos.length === 0 ? "No hay accesos registrados" : "No se encontraron accesos con los filtros seleccionados"}
          />
        </div>
      </div>

      {/* Modal de detalles */}
      {mostrarModal && detalles && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
            {/* Encabezado con gradiente */}
            <div 
              className="relative px-6 py-5 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${roleColors.dark}15, transparent)` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                  <Activity size={20} style={{ color: roleColors.dark }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Detalles del Acceso</h2>
                  <p className="text-xs text-gray-500">Información completa del registro</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              {/* Resultado y Confianza */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Resultado</p>
                  <div className="mt-2">
                    {(() => {
                      const config = getResultadoConfig(detalles.resultado);
                      const IconComponent = config.icon;
                      return (
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
                          <IconComponent size={16} />
                          {config.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Nivel de Confianza</p>
                  {detalles.nivelConfianza ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              detalles.nivelConfianza >= 90 ? 'bg-green-500' :
                              detalles.nivelConfianza >= 70 ? 'bg-emerald-500' :
                              detalles.nivelConfianza >= 50 ? 'bg-yellow-500' :
                              detalles.nivelConfianza >= 25 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(Math.round(detalles.nivelConfianza > 1 ? detalles.nivelConfianza : detalles.nivelConfianza * 100), 100)}%` }}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-800">
                          {Math.min(Math.round(detalles.nivelConfianza > 1 ? detalles.nivelConfianza : detalles.nivelConfianza * 100), 100)}%
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {Math.round(detalles.nivelConfianza > 1 ? detalles.nivelConfianza : detalles.nivelConfianza * 100) >= 90 ? 'Excelente' :
                         Math.round(detalles.nivelConfianza > 1 ? detalles.nivelConfianza : detalles.nivelConfianza * 100) >= 70 ? 'Bueno' :
                         Math.round(detalles.nivelConfianza > 1 ? detalles.nivelConfianza : detalles.nivelConfianza * 100) >= 50 ? 'Regular' :
                         Math.round(detalles.nivelConfianza > 1 ? detalles.nivelConfianza : detalles.nivelConfianza * 100) >= 25 ? 'Bajo' : 'Muy bajo'}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-500">-</p>
                  )}
                </div>
              </div>

              {/* Información del Acceso */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock size={16} style={{ color: roleColors.dark }} />
                  Información del Acceso
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Fecha y Hora</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {new Date(detalles.fechaEvento).toLocaleString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Placa</p>
                    <p className="text-lg font-mono font-bold text-gray-800 mt-1">
                      {detalles.placa || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Vehículo */}
              {detalles.vehiculo && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Car size={16} style={{ color: roleColors.dark }} />
                    Información del Vehículo
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Tipo</p>
                      <p className="text-sm font-medium text-gray-800 mt-1">{detalles.vehiculo.tipo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Modelo</p>
                      <p className="text-sm text-gray-800 mt-1">{detalles.vehiculo.modelo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Color</p>
                      <p className="text-sm text-gray-800 mt-1">{detalles.vehiculo.color || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Estado</p>
                      <p className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          detalles.vehiculo.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {detalles.vehiculo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de la Cámara y Edificio */}
              {detalles.camara && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Camera size={16} style={{ color: roleColors.dark }} />
                    Ubicación
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Edificio</p>
                      <p className="text-sm font-medium text-gray-800 mt-1">{detalles.camara?.edificio?.nombre || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cámara</p>
                      <p className="text-sm text-gray-800 mt-1">{detalles.camara.nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ubicación</p>
                      <p className="text-sm text-gray-800 mt-1">{detalles.camara.ubicacion || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerta */}
              {detalles.alerta && (
                <div className="bg-red-50/30 border border-red-100 rounded-xl p-4">
                  <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600" />
                    Alerta Asociada
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-red-600/70">Título</p>
                      <p className="text-sm font-medium text-red-900 mt-1">{detalles.alerta.titulo}</p>
                    </div>
                    {detalles.alerta.descripcion && (
                      <div>
                        <p className="text-xs text-red-600/70">Descripción</p>
                        <p className="text-sm text-red-800 mt-1">{detalles.alerta.descripcion}</p>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-red-600/70">Nivel</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getNivelAlertaConfig(detalles.alerta.nivel)}`}>
                          {detalles.alerta.nivel}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-red-600/70">Estado</p>
                        <p className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            detalles.alerta.atendida ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {detalles.alerta.atendida ? 'Atendida' : 'Pendiente'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Imagen */}
              {detalles.imagenUrl && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Camera size={16} style={{ color: roleColors.dark }} />
                    Captura de Cámara
                  </h3>
                  <img
                    src={detalles.imagenUrl}
                    alt="Captura del acceso"
                    className="w-full rounded-xl border border-gray-200 max-h-80 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-5 bg-gray-50/50">
              <Button
                variant="secondary"
                onClick={() => setMostrarModal(false)}
                fullWidth
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HistorialAccesosPage;