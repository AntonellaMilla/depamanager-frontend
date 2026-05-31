// src/modules/dashboard/components/RecentAccesses.jsx
import { useState } from 'react';
import { 
  Car, Calendar, Clock, CheckCircle, XCircle, HelpCircle, 
  Building2, Eye, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import Button from '../../../shared/components/ui/Button';

const RecentAccesses = ({ accesses, title = "Accesos Recientes", maxItems = 5 }) => {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  
  const userRole = (() => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  })();
  const roleColors = getRoleColors(userRole);

  const displayedAccesses = showAll ? accesses : accesses?.slice(0, maxItems);

  const getResultadoConfig = (resultado) => {
    switch (resultado) {
      case 'AUTORIZADO':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Autorizado' };
      case 'NO_AUTORIZADO':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'No autorizado' };
      default:
        return { icon: HelpCircle, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'No identificado' };
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

  if (!accesses || accesses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Car size={18} style={{ color: roleColors.dark }} />
            <h2 className="font-semibold text-gray-800">{title}</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Car size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No hay accesos recientes</p>
          <p className="text-sm text-gray-400 mt-1">Los accesos aparecerán aquí cuando se registren</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Car size={18} style={{ color: roleColors.dark }} />
            <h2 className="font-semibold text-gray-800">{title}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {accesses.length} registros
            </span>
          </div>
          {accesses.length > maxItems && (
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

      {/* Lista de accesos */}
      <div className="divide-y divide-gray-100">
        {displayedAccesses.map((access, index) => {
          const ResultIcon = getResultadoConfig(access.resultado).icon;
          const resultadoConfig = getResultadoConfig(access.resultado);
          
          return (
            <div key={index} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Placa y resultado */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${resultadoConfig.bg} flex items-center justify-center`}>
                    <ResultIcon size={18} className={resultadoConfig.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-800 text-lg">
                        {access.placa || 'No identificada'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${resultadoConfig.bg} ${resultadoConfig.color}`}>
                        {resultadoConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {access.vehiculo?.inquilino?.usuario && (
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {access.vehiculo.inquilino.usuario.nombres} {access.vehiculo.inquilino.usuario.apellidos}
                        </span>
                      )}
                      {access.edificio && userRole === 'PROPIETARIO' && (
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {access.edificio.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fecha */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    {formatRelativeTime(access.fechaEvento)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Calendar size={12} />
                    {new Date(access.fechaEvento).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {accesses.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
          <p className="text-xs text-gray-400 text-center">
            Últimos {displayedAccesses.length} de {accesses.length} registros
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentAccesses;