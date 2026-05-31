// src/modules/dashboard/components/ActiveAlerts.jsx
import { useState } from 'react';
import { 
  AlertTriangle, Bell, Clock, CheckCircle, X, 
  Eye, ChevronRight, Building2
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import Button from '../../../shared/components/ui/Button';

const ActiveAlerts = ({ alerts, title = "Alertas Activas", maxItems = 5, onViewAll }) => {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  
  const userRole = (() => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  })();
  const roleColors = getRoleColors(userRole);

  const displayedAlerts = showAll ? alerts : alerts?.slice(0, maxItems);
  const activeCount = alerts?.filter(a => !a.atendida).length || 0;

  const getNivelConfig = (nivel) => {
    switch (nivel) {
      case 'MEDIA':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertTriangle, label: 'Media' };
      case 'ALTA':
        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle, label: 'Alta' };
      case 'CRITICA':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertTriangle, label: 'Crítica' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', icon: Bell, label: 'Info' };
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    return `Hace ${days} d`;
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Bell size={18} style={{ color: roleColors.dark }} />
            <h2 className="font-semibold text-gray-800">{title}</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-green-600" />
          </div>
          <p className="text-gray-500">No hay alertas activas</p>
          <p className="text-sm text-gray-400 mt-1">Todas las alertas han sido atendidas</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Bell size={18} style={{ color: roleColors.dark }} />
              <h2 className="font-semibold text-gray-800">{title}</h2>
              {activeCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 animate-pulse">
                  {activeCount} pendientes
                </span>
              )}
            </div>
            {alerts.length > maxItems && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                icon={ChevronRight}
                className="text-sm"
              >
                {showAll ? 'Ver menos' : 'Ver todos'}
              </Button>
            )}
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="divide-y divide-gray-100">
          {displayedAlerts.map((alert, index) => {
            const nivelConfig = getNivelConfig(alert.nivel);
            const IconComponent = nivelConfig.icon;
            
            return (
              <div 
                key={index} 
                className={`p-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${!alert.atendida ? 'border-l-4' : ''}`}
                style={!alert.atendida ? { borderLeftColor: roleColors.dark } : {}}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-xl ${nivelConfig.bg} flex items-center justify-center shrink-0`}>
                      <IconComponent size={18} className={nivelConfig.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800">{alert.titulo}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${nivelConfig.bg} ${nivelConfig.text}`}>
                          {nivelConfig.label}
                        </span>
                        {!alert.atendida && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                            Pendiente
                          </span>
                        )}
                      </div>
                      {alert.descripcion && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{alert.descripcion}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatRelativeTime(alert.fechaCreacion)}
                        </span>
                        {alert.edificio && userRole === 'PROPIETARIO' && (
                          <span className="flex items-center gap-1">
                            <Building2 size={12} />
                            {alert.edificio.nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlert(alert);
                    }}
                    className="shrink-0"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-400 text-center">
              {activeCount} alerta(s) pendiente(s) de atención
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalles de alerta */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setSelectedAlert(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className={`p-5 border-b ${getNivelConfig(selectedAlert.nivel).border} ${getNivelConfig(selectedAlert.nivel).bg} rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getNivelConfig(selectedAlert.nivel).bg} flex items-center justify-center`}>
                    {(() => {
                      const Icon = getNivelConfig(selectedAlert.nivel).icon;
                      return <Icon size={20} className={getNivelConfig(selectedAlert.nivel).text} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{selectedAlert.titulo}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedAlert.fechaCreacion).toLocaleString('es-PE')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {selectedAlert.descripcion && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</p>
                  <p className="text-gray-700 mt-1">{selectedAlert.descripcion}</p>
                </div>
              )}
              {selectedAlert.historial && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acceso asociado</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Car size={14} className="text-gray-400" />
                    <span className="font-mono font-medium">{selectedAlert.historial.placa || 'No identificada'}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(selectedAlert.historial.fechaEvento).toLocaleString('es-PE')}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" onClick={() => setSelectedAlert(null)} fullWidth>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveAlerts;