// src/modules/notificaciones/pages/NotificacionesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle, XCircle, AlertTriangle, Calendar, 
  CreditCard, Users, Building2, Car, Eye, Trash2, 
  Filter, ChevronDown, Clock, ArrowLeft, CheckCheck,
  Mail, Phone, Home, Activity, Shield, BellRing
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import { notificacionesService } from '../services/notificacionesService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from '../../../shared/components/layout/config/menuConfig';
import toast from 'react-hot-toast';

const NotificacionesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'noLeidas', 'leidas'
  const [selectedNotificaciones, setSelectedNotificaciones] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await notificacionesService.obtenerNotificaciones();
      const data = response.data?.data || response.data || [];
      setNotificaciones(data);
    } catch (error) {
      toast.error('Error al cargar las notificaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  const handleMarcarLeida = async (id) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      setNotificaciones(prev => prev.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ));
      toast.success('Notificación marcada como leída');
    } catch (error) {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    const noLeidas = notificaciones.filter(n => !n.leida);
    if (noLeidas.length === 0) {
      toast.info('No hay notificaciones pendientes');
      return;
    }

    try {
      for (const notif of noLeidas) {
        await notificacionesService.marcarComoLeida(notif.id);
      }
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      toast.success(`${noLeidas.length} notificaciones marcadas como leídas`);
    } catch (error) {
      toast.error('Error al marcar las notificaciones');
    }
  };

  const handleEliminar = async (id) => {
    try {
      // Nota: El backend no tiene endpoint de eliminación, se podría implementar
      // Por ahora solo filtramos localmente
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      toast.success('Notificación eliminada');
    } catch (error) {
      toast.error('Error al eliminar la notificación');
    }
  };

  const getIcono = (tipo) => {
    const iconos = {
      'RECORDATORIO_SUSCRIPCION': { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Suscripción' },
      'RECORDATORIO_SUSCRIPCION_MORA': { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Vencimiento' },
      'SUSCRIPCION_PAGADA': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Pago' },
      'SUSCRIPCION_DEGRADADA': { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Degradación' },
      'RECORDATORIO_CONTRATO': { icon: Calendar, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Contrato' },
      'RECORDATORIO_PAGO': { icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Alquiler' },
      'SOLICITUDES_PENDIENTES': { icon: Users, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Solicitudes' },
      'PLAN_EDIFICIO_ACTUALIZADO': { icon: Building2, color: 'text-teal-600', bg: 'bg-teal-100', label: 'Plan' },
      'PLAN_EDIFICIO_DEGRADADO': { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Plan' },
      'AVISO_VENCIMIENTO_ADMIN': { icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Aviso' },
      'RECORDATORIO_SOLICITUD': { icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Solicitud' }
    };
    return iconos[tipo] || { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100', label: 'General' };
  };

  const notificacionesFiltradas = notificaciones.filter(n => {
    if (filtro === 'noLeidas') return !n.leida;
    if (filtro === 'leidas') return n.leida;
    return true;
  });

  const stats = {
    total: notificaciones.length,
    noLeidas: notificaciones.filter(n => !n.leida).length,
    leidas: notificaciones.filter(n => n.leida).length
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFechaCompleta = (fecha) => {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: `${roleColors.dark} transparent ${roleColors.dark} transparent` }}
            ></div>
            <p className="text-gray-500 font-medium">Cargando notificaciones...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4">
        {/* Header */}
        <div className="relative mb-8">
          <div 
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${roleColors.dark}20` }}
          ></div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
              >
                <Bell size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
                <p className="text-gray-500 mt-1">Mantente al día con los eventos importantes</p>
              </div>
            </div>
            {stats.noLeidas > 0 && (
              <Button
                variant="outline"
                icon={CheckCheck}
                onClick={handleMarcarTodasLeidas}
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Bell size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-teal-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-600 uppercase tracking-wider">No leídas</p>
                <p className="text-2xl font-bold text-teal-600 mt-1">{stats.noLeidas}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <BellRing size={18} className="text-teal-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Leídas</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.leidas}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <CheckCircle size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} style={{ color: roleColors.dark }} />
                <h2 className="font-semibold text-gray-800">Filtrar notificaciones</h2>
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
            <div className="p-5">
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setFiltro('todas')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filtro === 'todas'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltro('noLeidas')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filtro === 'noLeidas'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  No leídas
                </button>
                <button
                  onClick={() => setFiltro('leidas')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filtro === 'leidas'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Leídas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="space-y-3">
          {notificacionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No hay notificaciones</p>
              <p className="text-sm text-gray-400 mt-1">
                {filtro === 'todas' 
                  ? 'No has recibido ninguna notificación aún'
                  : filtro === 'noLeidas' 
                    ? 'No tienes notificaciones pendientes'
                    : 'No hay notificaciones leídas'}
              </p>
            </div>
          ) : (
            notificacionesFiltradas.map((notif) => {
              const { icon: IconComponent, color, bg, label } = getIcono(notif.tipo);
              return (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    !notif.leida ? 'border-l-4' : 'border-gray-100'
                  }`}
                  style={!notif.leida ? { borderLeftColor: roleColors.dark } : {}}
                >
                  <div className="p-5">
                    <div className="flex gap-4">
                      {/* Icono */}
                      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                        <IconComponent size={20} className={color} />
                      </div>
                      
                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-semibold ${!notif.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notif.titulo}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${bg} ${color}`}>
                              {label}
                            </span>
                            {!notif.leida && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                                Nueva
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!notif.leida && (
                              <button
                                onClick={() => handleMarcarLeida(notif.id)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-teal-600"
                                title="Marcar como leída"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEliminar(notif.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mt-2 leading-relaxed">
                          {notif.mensaje}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatFecha(notif.fechaCreacion)}
                          </span>
                          <span className="flex items-center gap-1" title={formatFechaCompleta(notif.fechaCreacion)}>
                            <Calendar size={12} />
                            {formatFechaCompleta(notif.fechaCreacion)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer con información */}
        {notificaciones.length > 0 && (
          <div className="mt-6 p-4 rounded-xl text-center" style={{ backgroundColor: `${roleColors.dark}08` }}>
            <p className="text-xs text-gray-500">
              Las notificaciones se mantienen por 30 días. 
              Las notificaciones antiguas se eliminarán automáticamente.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificacionesPage;