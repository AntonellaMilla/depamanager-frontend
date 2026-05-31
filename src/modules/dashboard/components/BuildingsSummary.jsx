// src/modules/dashboard/components/BuildingsSummary.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ChevronRight, AlertTriangle, Home, Camera, 
  CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import Button from '../../../shared/components/ui/Button';

const BuildingsSummary = ({ buildings }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  
  const userRole = (() => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  })();
  const roleColors = getRoleColors(userRole);

  const displayedBuildings = showAll ? buildings : buildings?.slice(0, 3);

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'GRATUITO':
        return 'bg-gray-100 text-gray-600';
      case 'BASICO':
        return 'bg-blue-100 text-blue-700';
      case 'PROFESIONAL':
        return 'bg-purple-100 text-purple-700';
      case 'EMPRESARIAL':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!buildings || buildings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Building2 size={18} style={{ color: roleColors.dark }} />
            <h2 className="font-semibold text-gray-800">Mis Edificios</h2>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No tienes edificios registrados</p>
          <Button 
            variant="primary" 
            className="mt-4"
            onClick={() => navigate('/edificios/crear')}
          >
            + Crear primer edificio
          </Button>
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
            <Building2 size={18} style={{ color: roleColors.dark }} />
            <h2 className="font-semibold text-gray-800">Mis Edificios</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {buildings.length} edificios
            </span>
          </div>
          {buildings.length > 3 && (
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

      {/* Lista de edificios */}
      <div className="divide-y divide-gray-100">
        {displayedBuildings.map((building, index) => (
          <div 
            key={index} 
            className="p-5 hover:bg-gray-50/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/edificios/${building.id}`)}
          >
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: roleColors.dark }}
                >
                  {building.nombre?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800">{building.nombre}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPlanColor(building.plan)}`}>
                      {building.plan}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      building.estado === 'ACTIVO' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {building.estado === 'ACTIVO' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {building.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Home size={12} />
                      {building.unidades} unidades
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera size={12} />
                      {building.camaras} cámaras
                    </span>
                    {building.alertasActivas > 0 && (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertTriangle size={12} />
                        {building.alertasActivas} alertas
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/edificios')}
          fullWidth
          icon={TrendingUp}
          className="text-sm"
        >
          Ver todos los edificios
        </Button>
      </div>
    </div>
  );
};

export default BuildingsSummary;