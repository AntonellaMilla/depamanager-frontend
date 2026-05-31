// src/modules/alertas/components/AlertasPage.jsx
import { useState, useEffect } from 'react';
import { 
  Eye, Search, AlertTriangle, CheckCircle2, Clock, AlertCircle,
  Filter, ChevronDown, X, Building2, Calendar, Activity, Bell,
  TrendingUp, Shield, HelpCircle
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Table from '../../../shared/components/ui/Table';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { alertasService } from '../services/alertasService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const AlertasPage = () => {
  const { user } = useAuth();
  
  // Estado de datos
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros y búsqueda
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busquedaTitulo, setBusquedaTitulo] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  // Modal de detalles
  const [detalles, setDetalles] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [marcandoAtendida, setMarcandoAtendida] = useState(false);

  // Obtener rol para colores
  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // Cargar alertas
  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      const response = await alertasService.getAll();
      // ✅ Extraer datos correctamente
      const data = response.data?.data || response.data || [];
      setAlertas(data);
    } catch (error) {
      console.error('❌ Error fetching alertas:', error);
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  // INQUILINO no tiene acceso a alertas según las reglas
  useEffect(() => {
    if (userRole === 'INQUILINO') {
      toast.error('No tienes permiso para ver alertas');
      // Opcional: redirigir a accesos
      // window.location.href = '/accesos';
    }
  }, [userRole]);

  // Filtrar alertas con visibilidad por rol
  const alertasFiltradas = alertas.filter(alerta => {
    // El backend ya filtra por rol, así que aquí solo aplicamos filtros de búsqueda del usuario
    // No filtramos por edificio porque el backend ya lo hace según el rol del usuario
    
    if (userRole === 'INQUILINO') {
      // Inquilinos no ven alertas en este diseño
      return false;
    }

    // Filtros de búsqueda
    if (filtroNivel !== 'todos' && alerta.nivel !== filtroNivel) return false;
    if (filtroEstado === 'atendida' && !alerta.atendida) return false;
    if (filtroEstado === 'pendiente' && alerta.atendida) return false;
    if (busquedaTitulo && !alerta.titulo?.toUpperCase().includes(busquedaTitulo.toUpperCase())) return false;
    return true;
  });

  // Estadísticas (visibles según rol y filtros aplicados)
  const stats = {
    total: alertasFiltradas.length,
    media: alertasFiltradas.filter(a => a.nivel === 'MEDIA').length,
    alta: alertasFiltradas.filter(a => a.nivel === 'ALTA').length,
    critica: alertasFiltradas.filter(a => a.nivel === 'CRITICA').length,
    pendientes: alertasFiltradas.filter(a => !a.atendida).length,
    atendidas: alertasFiltradas.filter(a => a.atendida).length
  };

  // Obtener configuración del nivel
  const getNivelConfig = (nivel) => {
    switch (nivel) {
      case 'MEDIA':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-700', 
          border: 'border-yellow-200',
          icon: AlertCircle,
          gradient: 'from-yellow-500 to-yellow-400',
          bgLight: 'bg-yellow-50',
          label: 'Media'
        };
      case 'ALTA':
        return { 
          bg: 'bg-orange-100', 
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: AlertTriangle,
          gradient: 'from-orange-500 to-orange-400',
          bgLight: 'bg-orange-50',
          label: 'Alta'
        };
      case 'CRITICA':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-700',
          border: 'border-red-200',
          icon: AlertTriangle,
          gradient: 'from-red-600 to-red-500',
          bgLight: 'bg-red-50',
          label: 'Crítica'
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: AlertCircle,
          gradient: 'from-gray-500 to-gray-400',
          bgLight: 'bg-gray-50',
          label: 'Desconocido'
        };
    }
  };

  const handleVerDetalles = (alerta) => {
    setDetalles(alerta);
    setMostrarModal(true);
  };

  const handleMarcarAtendida = async (alerta) => {
    setMarcandoAtendida(true);
    try {
      await alertasService.marcarAtendida(alerta.id);
      toast.success('✓ Alerta marcada como atendida');
      
      // Actualizar localmente
      setAlertas(alertas.map(a => 
        a.id === alerta.id 
          ? { ...a, atendida: true, fechaAtencion: new Date().toISOString() }
          : a
      ));
      
      if (detalles?.id === alerta.id) {
        setDetalles({ ...detalles, atendida: true, fechaAtencion: new Date().toISOString() });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al marcar alerta como atendida';
      toast.error(message);
      console.error('❌ Error:', error);
    } finally {
      setMarcandoAtendida(false);
    }
  };

  const resetFilters = () => {
    setBusquedaTitulo('');
    setFiltroNivel('todos');
    setFiltroEstado('todos');
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
              {new Date(row.fechaCreacion).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(row.fechaCreacion).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Nivel',
      key: 'nivel',
      render: (value) => {
        const config = getNivelConfig(value);
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
      header: 'Título',
      key: 'titulo',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-800">{value}</p>
          {row.descripcion && (
            <p className="text-xs text-gray-400 truncate max-w-md">{row.descripcion}</p>
          )}
        </div>
      )
    },
    {
      header: 'Edificio',
      key: 'edificio',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{row.edificio?.nombre || '-'}</span>
        </div>
      )
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (_, row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          row.atendida 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {row.atendida ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {row.atendida ? 'Atendida' : 'Pendiente'}
        </span>
      )
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
                <Bell size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Alertas de Seguridad</h1>
                <p className="text-gray-500 mt-1">Monitoreo de alertas generadas por accesos vehiculares</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de estadísticas */}
        {alertas.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Activity size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-yellow-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 uppercase tracking-wider">Media</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.media}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertCircle size={18} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-orange-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 uppercase tracking-wider">Alta</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">{stats.alta}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-wider">Crítica</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.critica}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-yellow-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 uppercase tracking-wider">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendientes}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Clock size={18} className="text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wider">Atendidas</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.atendidas}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} style={{ color: roleColors.dark }} />
                <h2 className="font-semibold text-gray-800">Filtros de búsqueda</h2>
                {stats.pendientes > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                    {stats.pendientes} pendientes
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showFilters ? 'Ocultar' : 'Mostrar'} filtros
                <ChevronDown size={14} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Buscar por título"
                  icon={Search}
                  value={busquedaTitulo}
                  onChange={(e) => setBusquedaTitulo(e.target.value)}
                  size="sm"
                />
                <Select
                  label="Nivel de alerta"
                  name="nivel"
                  value={filtroNivel}
                  onChange={(e) => setFiltroNivel(e.target.value)}
                  options={[
                    { value: 'todos', label: 'Todos los niveles' },
                    { value: 'MEDIA', label: 'Media' },
                    { value: 'ALTA', label: 'Alta' },
                    { value: 'CRITICA', label: 'Crítica' }
                  ]}
                  size="sm"
                />
                <Select
                  label="Estado"
                  name="estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  options={[
                    { value: 'todos', label: 'Todas' },
                    { value: 'pendiente', label: 'Pendientes' },
                    { value: 'atendida', label: 'Atendidas' }
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
            data={alertasFiltradas}
            isLoading={loading}
            title="Lista de Alertas"
            searchable={false}
            emptyMessage={alertasFiltradas.length === 0 ? "No hay alertas registradas" : "No se encontraron alertas con los filtros seleccionados"}
          />
        </div>
      </div>

      {/* Modal de detalles */}
      {mostrarModal && detalles && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
            {/* Encabezado según nivel */}
            <div 
              className="relative px-6 py-5 flex items-center justify-between"
              style={{ 
                background: `linear-gradient(135deg, ${getNivelConfig(detalles.nivel).bgLight}, transparent)`,
                borderBottom: `2px solid ${getNivelConfig(detalles.nivel).border}`
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${getNivelConfig(detalles.nivel).bg} flex items-center justify-center shadow-sm`}>
                  {(() => {
                    const IconComponent = getNivelConfig(detalles.nivel).icon;
                    return <IconComponent size={20} className={getNivelConfig(detalles.nivel).text} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{detalles.titulo}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getNivelConfig(detalles.nivel).bg} ${getNivelConfig(detalles.nivel).text}`}>
                      {getNivelConfig(detalles.nivel).label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMostrarModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
              {/* Estado y fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
                      detalles.atendida ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {detalles.atendida ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      {detalles.atendida ? 'Atendida' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de creación</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-800">
                      {new Date(detalles.fechaCreacion).toLocaleString('es-PE')}
                    </span>
                  </div>
                </div>
              </div>

              {detalles.fechaAtencion && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-xs text-green-600 uppercase tracking-wider">Fecha de atención</p>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {new Date(detalles.fechaAtencion).toLocaleString('es-PE')}
                    </span>
                  </div>
                </div>
              )}

              {/* Descripción */}
              {detalles.descripcion && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Activity size={16} style={{ color: roleColors.dark }} />
                    Descripción
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{detalles.descripcion}</p>
                </div>
              )}

              {/* Edificio */}
              {detalles.edificio && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Building2 size={16} style={{ color: roleColors.dark }} />
                    Edificio
                  </h3>
                  <p className="text-gray-700">{detalles.edificio.nombre}</p>
                </div>
              )}

              {/* Acceso asociado */}
              {detalles.historial && (
                <div className={`rounded-xl p-4 border-l-4 ${getNivelConfig(detalles.nivel).border} ${getNivelConfig(detalles.nivel).bgLight}`}>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Shield size={16} style={{ color: roleColors.dark }} />
                    Acceso Asociado
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Resultado</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {detalles.historial.resultado === 'AUTORIZADO' ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 size={14} /> Autorizado
                          </span>
                        ) : detalles.historial.resultado === 'NO_AUTORIZADO' ? (
                          <span className="inline-flex items-center gap-1 text-red-600">
                            <XCircle size={14} /> No autorizado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <HelpCircle size={14} /> No identificado
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Placa</p>
                      <p className="mt-1 font-mono font-bold text-gray-800">{detalles.historial.placa || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-5 bg-gray-50/50 flex gap-3 justify-end">
              {!detalles.atendida && (
                <Button
                  variant="primary"
                  role={userRole}
                  onClick={() => handleMarcarAtendida(detalles)}
                  loading={marcandoAtendida}
                  icon={CheckCircle2}
                >
                  Marcar como atendida
                </Button>
              )}
              <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AlertasPage;