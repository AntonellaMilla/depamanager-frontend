// src/modules/dashboard/components/StatsCards.jsx
import { 
  Building2, Users, Car, AlertTriangle, Activity, 
  TrendingUp, Shield, Camera, Home, Bell, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";

const StatsCards = ({ data, role }) => {
  const { user } = useAuth();
  const userRole = role || (() => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  })();
  const roleColors = getRoleColors(userRole);

  // Configuración de tarjetas según rol
  const getCardsConfig = () => {
    switch (userRole) {
      case 'PROPIETARIO':
        return [
          {
            label: 'Edificios',
            value: data?.totalEdificios || 0,
            icon: Building2,
            color: 'from-teal-500 to-teal-600',
            bgLight: 'bg-teal-50',
            textColor: 'text-teal-600'
          },
          {
            label: 'Inquilinos',
            value: data?.totalInquilinos || 0,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          {
            label: 'Vehículos',
            value: data?.totalVehiculos || 0,
            icon: Car,
            color: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600'
          },
          {
            label: 'Alertas Activas',
            value: data?.totalAlertasActivas || 0,
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            bgLight: 'bg-red-50',
            textColor: 'text-red-600'
          }
        ];

      case 'ADMINISTRADOR':
        return [
          {
            label: 'Unidades',
            value: data?.unidades || 0,
            icon: Home,
            color: 'from-teal-500 to-teal-600',
            bgLight: 'bg-teal-50',
            textColor: 'text-teal-600'
          },
          {
            label: 'Inquilinos',
            value: data?.inquilinosActivos || 0,
            icon: Users,
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          {
            label: 'Vehículos',
            value: data?.vehiculos || 0,
            icon: Car,
            color: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600'
          },
          {
            label: 'Cámaras',
            value: data?.camaras || 0,
            icon: Camera,
            color: 'from-purple-500 to-purple-600',
            bgLight: 'bg-purple-50',
            textColor: 'text-purple-600'
          },

          {
            label: 'Accesos Hoy',
            value: data?.accesosHoy || 0,
            icon: Activity,
            color: 'from-cyan-500 to-cyan-600',
            bgLight: 'bg-cyan-50',
            textColor: 'text-cyan-600'
          }
        ];

      case 'INQUILINO':
        return [
          {
            label: 'Mi Vehículo',
            value: data?.vehiculos || 0,
            icon: Car,
            color: 'from-green-500 to-green-600',
            bgLight: 'bg-green-50',
            textColor: 'text-green-600'
          },
          {
            label: 'Accesos Este Mes',
            value: data?.accesosMes || 0,
            icon: TrendingUp,
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600'
          },
          {
            label: 'Alertas',
            value: data?.alertas || 0,
            icon: AlertTriangle,
            color: 'from-red-500 to-red-600',
            bgLight: 'bg-red-50',
            textColor: 'text-red-600'
          },
          {
            label: 'Contrato Activo',
            value: data?.contratoActivo ? 'Sí' : 'No',
            icon: CheckCircle,
            color: 'from-teal-500 to-teal-600',
            bgLight: 'bg-teal-50',
            textColor: 'text-teal-600'
          }
        ];

      default:
        return [];
    }
  };

  const cards = getCardsConfig();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent size={22} className={card.textColor} />
              </div>
            </div>
            {/* Barra de progreso decorativa */}
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${card.color} transition-all duration-500`}
                style={{ width: `${Math.min(100, typeof card.value === 'number' ? card.value * 10 : 50)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;