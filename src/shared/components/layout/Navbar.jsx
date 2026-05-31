// src/components/common/Navbar.jsx
import { Settings, User, ChevronDown, Search } from 'lucide-react';
import { getRoleLabel, getRoleColors } from './config/menuConfig';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import NotificationsDropdown from "../../../modules/notificaciones/components/NotificationsDropdown";

const Navbar = ({ user, role, roleColors }) => {
  const roleLabel = getRoleLabel(role);
  const colors = roleColors || getRoleColors(role);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Obtener iniciales del usuario
  const getInitials = () => {
    const firstInitial = user?.nombres?.charAt(0) || '';
    const lastInitial = user?.apellidos?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Nombre completo del usuario
  const firstName = user?.nombres?.split(' ')[0] || 'Usuario';
  
  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Lado izquierdo - Búsqueda */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex items-center max-w-md flex-1">
          <div className="relative w-full">
            <Search 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Lado derecho - Acciones y usuario */}
      <div className="flex items-center gap-4">
        {/* Componente de Notificaciones */}
        <NotificationsDropdown />

        {/* Divisor */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* Menú de usuario */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            {/* Avatar con color del rol */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-white shadow-md"
              style={{ backgroundColor: colors.dark }}
            >
              {getInitials()}
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="font-medium text-sm text-gray-800">
                {firstName}
              </p>
              <p className={`text-xs font-medium ${colors.text}`}>
                {roleLabel}
              </p>
            </div>

            <ChevronDown 
              size={16} 
              className={`hidden lg:block text-gray-400 transition-transform duration-200 ${
                showUserMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown del usuario */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50" style={{ minWidth: 220 }}>
                <button 
                  onClick={() => { setShowUserMenu(false); navigate('/perfil'); }} 
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <User size={16} strokeWidth={1.75} />
                  Mi Perfil
                </button>
                <button 
                  onClick={() => { setShowUserMenu(false); navigate('/perfil/editar'); }} 
                  className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Settings size={16} strokeWidth={1.75} />
                  Configuración
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button 
                    onClick={() => { logout(); }} 
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;