// src/components/common/NotificationsDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, XCircle, AlertTriangle, Calendar, CreditCard, Users, Building2, Car, Eye } from 'lucide-react';
import { notificacionesService } from "../services/notificacionesService";
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from '../../../shared/components/layout/config/menuConfig';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NotificationsDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotificaciones = async () => {
    try {
      setLoading(true);
      const response = await notificacionesService.obtenerNotificaciones();
      const data = response.data?.data || response.data || [];
      setNotificaciones(data);
      setNoLeidas(data.filter(n => !n.leida).length);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
    // Recargar cada 30 segundos
    const interval = setInterval(fetchNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarcarLeida = async (id) => {
    try {
      await notificacionesService.marcarComoLeida(id);
      setNotificaciones(prev => prev.map(n => 
        n.id === id ? { ...n, leida: true } : n
      ));
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    const noLeidasList = notificaciones.filter(n => !n.leida);
    for (const notif of noLeidasList) {
      await handleMarcarLeida(notif.id);
    }
    toast.success('Todas las notificaciones marcadas como leídas');
  };

  const getIcono = (tipo) => {
    const iconos = {
      'RECORDATORIO_SUSCRIPCION': { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-100' },
      'RECORDATORIO_SUSCRIPCION_MORA': { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100' },
      'SUSCRIPCION_PAGADA': { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
      'SUSCRIPCION_DEGRADADA': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
      'RECORDATORIO_CONTRATO': { icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-100' },
      'RECORDATORIO_PAGO': { icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-100' },
      'SOLICITUDES_PENDIENTES': { icon: Users, color: 'text-orange-500', bg: 'bg-orange-100' },
      'PLAN_EDIFICIO_ACTUALIZADO': { icon: Building2, color: 'text-teal-500', bg: 'bg-teal-100' },
      'PLAN_EDIFICIO_DEGRADADO': { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
      'AVISO_VENCIMIENTO_ADMIN': { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100' }
    };
    return iconos[tipo] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' };
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
    return date.toLocaleDateString('es-PE');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          noLeidas > 0
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
      >
        <Bell
          size={20}
          strokeWidth={1.75}
          className={noLeidas > 0 ? 'animate-pulse' : ''}
        />

        {noLeidas > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {noLeidas > 99 ? '99+' : noLeidas}
            </span>
          </>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={18} style={{ color: roleColors.dark }} />
                  <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                  {noLeidas > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                      {noLeidas} nuevas
                    </span>
                  )}
                </div>
                {noLeidas > 0 && (
                  <button
                    onClick={handleMarcarTodasLeidas}
                    className="text-xs text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent mx-auto"></div>
                  <p className="text-xs text-gray-400 mt-2">Cargando...</p>
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No hay notificaciones</p>
                  <p className="text-xs text-gray-400 mt-1">Las notificaciones aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificaciones.map((notif) => {
                    const { icon: IconComponent, color, bg } = getIcono(notif.tipo);
                    return (
                      <div
                        key={notif.id}
                        className={`p-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${!notif.leida ? 'bg-teal-50/30' : ''}`}
                        onClick={() => {
                          if (!notif.leida) handleMarcarLeida(notif.id);
                          if (notif.url) {
                            window.location.href = notif.url;
                          }
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex gap-3">
                          <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                            <IconComponent size={16} className={color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                {notif.titulo}
                              </p>
                              {!notif.leida && (
                                <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {notif.mensaje}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                              <span>{formatFecha(notif.fechaCreacion)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notificaciones.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/notificaciones');
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 text-center w-full"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsDropdown;