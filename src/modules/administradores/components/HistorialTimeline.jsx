// src/modules/administradores/components/HistorialTimeline.jsx
import { useState, useEffect } from 'react';
import { 
  Clock, MapPin, Shield, UserPlus, UserMinus, Edit, Trash2, 
  Home, Building2, Users, Car, Camera, AlertTriangle, CheckCircle,
  XCircle, Calendar, Activity, Filter, Search, Download
} from 'lucide-react';
import { administradoresService } from '../services/administradoresService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from '../../../shared/components/layout/config/menuConfig';
import Button from '../../../shared/components/ui/Button';
import toast from 'react-hot-toast';

const HistorialTimeline = ({ administradorId, edificiosAsignados }) => {
  const { user } = useAuth();
  const [auditoria, setAuditoria] = useState([]);
  const [filteredAuditoria, setFilteredAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEdificio, setFiltroEdificio] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');
  const [stats, setStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // Mapeo de acciones a iconos, colores y estilos
  const getActionConfig = (accion) => {
    const lowerAccion = accion?.toLowerCase() || '';
    
    const configs = {
      // Edificios
      'crear edificio': { icon: Building2, color: 'bg-blue-100 text-blue-600', borderColor: 'border-blue-200', bgHover: 'hover:bg-blue-50', label: 'Creó edificio' },
      'editar edificio': { icon: Edit, color: 'bg-yellow-100 text-yellow-600', borderColor: 'border-yellow-200', bgHover: 'hover:bg-yellow-50', label: 'Editó edificio' },
      'activar edificio': { icon: CheckCircle, color: 'bg-green-100 text-green-600', borderColor: 'border-green-200', bgHover: 'hover:bg-green-50', label: 'Activó edificio' },
      'desactivar edificio': { icon: XCircle, color: 'bg-red-100 text-red-600', borderColor: 'border-red-200', bgHover: 'hover:bg-red-50', label: 'Desactivó edificio' },
      // Administradores
      'asignar administrador': { icon: UserPlus, color: 'bg-teal-100 text-teal-600',dot: 'bg-teal-500', borderColor: 'border-teal-200', bgHover: 'hover:bg-teal-50', label: 'Asignó administrador' },
      'remover administrador': { icon: UserMinus, color: 'bg-orange-100 text-orange-600', borderColor: 'border-orange-200', bgHover: 'hover:bg-orange-50', label: 'Removió administrador' },
      // Inquilinos
      'registrar inquilino': { icon: Users, color: 'bg-green-100 text-green-600', borderColor: 'border-green-200', bgHover: 'hover:bg-green-50', label: 'Registró inquilino' },
      'editar contrato': { icon: Edit, color: 'bg-yellow-100 text-yellow-600', borderColor: 'border-yellow-200', bgHover: 'hover:bg-yellow-50', label: 'Editó contrato' },
      'finalizar contrato': { icon: XCircle, color: 'bg-red-100 text-red-600', borderColor: 'border-red-200', bgHover: 'hover:bg-red-50', label: 'Finalizó contrato' },
      // Vehículos
      'registrar vehículo': { icon: Car, color: 'bg-blue-100 text-blue-600', borderColor: 'border-blue-200', bgHover: 'hover:bg-blue-50', label: 'Registró vehículo' },
      'eliminar vehículo': { icon: Trash2, color: 'bg-red-100 text-red-600', borderColor: 'border-red-200', bgHover: 'hover:bg-red-50', label: 'Eliminó vehículo' },
      'cambiar placa': { icon: Edit, color: 'bg-yellow-100 text-yellow-600', borderColor: 'border-yellow-200', bgHover: 'hover:bg-yellow-50', label: 'Cambió placa' },
      // Accesos
      'acceso autorizado': { icon: CheckCircle, color: 'bg-green-100 text-green-600', borderColor: 'border-green-200', bgHover: 'hover:bg-green-50', label: 'Acceso autorizado' },
      'acceso denegado': { icon: XCircle, color: 'bg-red-100 text-red-600', borderColor: 'border-red-200', bgHover: 'hover:bg-red-50', label: 'Acceso denegado' },
      'placa no identificada': { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-600', borderColor: 'border-yellow-200', bgHover: 'hover:bg-yellow-50', label: 'Placa no identificada' },
      // Cámaras
      'registrar cámara': { icon: Camera, color: 'bg-purple-100 text-purple-600', borderColor: 'border-purple-200', bgHover: 'hover:bg-purple-50', label: 'Registró cámara' },
      'actualizar cámara': { icon: Edit, color: 'bg-yellow-100 text-yellow-600', borderColor: 'border-yellow-200', bgHover: 'hover:bg-yellow-50', label: 'Actualizó cámara' },
      'desactivar cámara': { icon: XCircle, color: 'bg-red-100 text-red-600', borderColor: 'border-red-200', bgHover: 'hover:bg-red-50', label: 'Desactivó cámara' },
      // Solicitudes
      'aprobar solicitud': { icon: CheckCircle, color: 'bg-green-100 text-green-600', borderColor: 'border-green-200', bgHover: 'hover:bg-green-50', label: 'Aprobó solicitud' },
      'rechazar solicitud': { icon: XCircle, color: 'bg-red-100 text-red-600', borderColor: 'border-red-200', bgHover: 'hover:bg-red-50', label: 'Rechazó solicitud' },
      // Alertas
      'crear alerta': { icon: AlertTriangle, color: 'bg-red-100 text-red-600', borderColor: 'border-red-200', bgHover: 'hover:bg-red-50', label: 'Creó alerta' },
      'marcar alerta atendida': { icon: CheckCircle, color: 'bg-green-100 text-green-600', borderColor: 'border-green-200', bgHover: 'hover:bg-green-50', label: 'Atendió alerta' },
    };
    
    const found = Object.entries(configs).find(([key]) => lowerAccion.includes(key));
    return found ? found[1] : { icon: Activity, color: 'bg-gray-100 text-gray-600', borderColor: 'border-gray-200', bgHover: 'hover:bg-gray-50', label: accion || 'Acción realizada' };
  };

  // Obtener acciones únicas para el filtro
  const uniqueAcciones = [...new Set(auditoria.map(item => item.accion))];

  const fetchAuditoria = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroEdificio) params.edificioId = filtroEdificio;
      if (filtroFecha) {
        const fecha = new Date(filtroFecha);
        params.desde = new Date(fecha.setHours(0, 0, 0, 0)).toISOString();
        params.hasta = new Date(fecha.setHours(23, 59, 59, 999)).toISOString();
      }
      
      const data = await administradoresService.getAuditoria(administradorId, params);
      setAuditoria(data);
      
      // Aplicar filtro de acción
      let filtered = data;
      if (filtroAccion) {
        filtered = data.filter(item => item.accion?.toLowerCase().includes(filtroAccion.toLowerCase()));
      }
      setFilteredAuditoria(filtered);
      
      // Cargar estadísticas
      const statsData = await administradoresService.getAuditoriaStats(administradorId);
      setStats(statsData);
    } catch (error) {
      toast.error('Error al cargar el historial');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (administradorId) {
      fetchAuditoria();
    }
  }, [administradorId, filtroEdificio, filtroFecha]);

  useEffect(() => {
    if (filtroAccion) {
      const filtered = auditoria.filter(item => item.accion?.toLowerCase().includes(filtroAccion.toLowerCase()));
      setFilteredAuditoria(filtered);
    } else {
      setFilteredAuditoria(auditoria);
    }
  }, [filtroAccion, auditoria]);

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    if (date.toDateString() === hoy.toDateString()) {
      return `Hoy — ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === ayer.toDateString()) {
      return `Ayer — ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + 
           ` — ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const resetFilters = () => {
    setFiltroEdificio('');
    setFiltroFecha('');
    setFiltroAccion('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div 
            className="w-10 h-10 border-3 rounded-full animate-spin"
            style={{ borderColor: `${roleColors.dark} transparent ${roleColors.dark} transparent` }}
          ></div>
          <p className="text-gray-500 font-medium">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Activity size={18} style={{ color: roleColors.dark }} />
              <h2 className="font-semibold text-gray-800">Historial de Actividades</h2>
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
        
        {/* Filtros */}
        {showFilters && (
          <div className="p-6 bg-gray-50/50 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {edificiosAsignados.length > 0 && (
                <select
                  value={filtroEdificio}
                  onChange={(e) => setFiltroEdificio(e.target.value)}
                  className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 bg-white"
                >
                  <option value="">Todos los edificios</option>
                  {edificiosAsignados.map(ed => (
                    <option key={ed.id} value={ed.id}>{ed.nombre}</option>
                  ))}
                </select>
              )}
              
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 bg-white"
              />
              
              <select
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400 bg-white"
              >
                <option value="">Todas las acciones</option>
                {uniqueAcciones.map(accion => (
                  <option key={accion} value={accion}>{accion}</option>
                ))}
              </select>
            </div>
            
            {(filtroEdificio || filtroFecha || filtroAccion) && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Stats rápidos */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50/30 border-b border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total || 0}</p>
              <p className="text-xs text-gray-500">Total actividades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.ultimoMes || 0}</p>
              <p className="text-xs text-gray-500">Último mes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.porEdificio?.[filtroEdificio] || filteredAuditoria.length}</p>
              <p className="text-xs text-gray-500">En filtro actual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{uniqueAcciones.length}</p>
              <p className="text-xs text-gray-500">Tipos de acción</p>
            </div>
          </div>
        )}
      </div>

      {/* Timeline - Vista cronológica vertical */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredAuditoria.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No hay actividades registradas</p>
            <p className="text-sm text-gray-400 mt-1">Las acciones del administrador aparecerán aquí</p>
          </div>
        ) : (
          <div className="relative">
            {/* Línea de tiempo vertical */}
<div className="absolute top-0 bottom-0 w-px bg-gray-200 left-8"></div>


            <div className="divide-y divide-gray-100">
              {filteredAuditoria.map((item, index) => {
                const config = getActionConfig(item.accion);
                const IconComponent = config.icon;
                const isFirst = index === 0;
                
                return (
                  <div key={index} className={`relative p-6 transition-colors ${config.bgHover}`}>
                    {/* Círculo indicador en la línea de tiempo */}
<div className="absolute left-8 top-1/2 -translate-y-1/2 flex justify-center">


              <div
  className={`w-3 h-3 rounded-full ring-4 ring-white ${
    config.color.split(' ')[0]
  }`}
/>
                    </div>
                    
                    <div className="ml-12">
                      {/* Header del evento */}
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center shadow-sm`}>
                            <IconComponent size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{config.label}</p>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatFecha(item.fecha)}
                              </div>
                              {item.edificio && (
                                <div className="flex items-center gap-1">
                                  <Building2 size={12} />
                                  {item.edificio.nombre}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Descripción */}
                      {item.descripcion && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-sm text-gray-600">{item.descripcion}</p>
                        </div>
                      )}
                      
                      {/* Footer con metadatos */}
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        {item.usuario && (
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Shield size={12} />
                            <span>{item.usuario.nombres} {item.usuario.apellidos}</span>
                          </div>
                        )}
                        {item.ipAddress && (
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <MapPin size={12} />
                            <span>IP: {item.ipAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialTimeline;