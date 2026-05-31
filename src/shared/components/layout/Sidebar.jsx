// src/components/common/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { LogOut, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getRoleColors } from './config/menuConfig';
import Logo1 from '../../../assets/images/Logo1.png';


const Sidebar = ({ menuItems, isOpen, role, roleColors, toggleSidebar }) => {
  const { logout } = useAuth();
  const colors = roleColors || getRoleColors(role);

  return (
    <div
      className={`${isOpen ? 'w-60' : 'w-20'
        } h-screen transition-all duration-300 ease-in-out flex flex-col shadow-2xl relative group`}
      style={{ backgroundColor: colors.dark }}
    >
      {/* Botón toggle flotante */}
      <button
        onClick={toggleSidebar}
        className="
        absolute
        -right-3
        top-6
        w-8
        h-8
        flex
        items-center
        justify-center
        rounded-full
        bg-white
        border
        border-gray-200
        shadow-md
        hover:shadow-lg
        hover:scale-105
        transition-all
        duration-200
        z-30
      "aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <ChevronLeft size={16} className="text-gray-700" />
        ) : (
          <ChevronRight size={16} className="text-gray-700" />
        )}
      </button>

      {/* Header - Logo con contraste */}
{/* Header - Logo vertical */}
<div className="p-6 border-b border-white/10 flex flex-col items-center gap-2">
  
  {/* Logo */}
<img
  src={Logo1}
  alt="DepaManager Logo"
  style={{
    maxWidth: isOpen ? '60px' : '40px',
    transition: 'all 0.3s ease'
  }}
/>

  {/* Texto */}
  {isOpen && (
    <div className="text-center">
      <span className="font-semibold text-lg tracking-tight text-white">
        Depa<span className="font-light">Manager</span>
      </span>
    </div>
  )}
</div>

      {/* Navegación principal */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
              title={!isOpen ? item.name : undefined}
            >
              <IconComponent size={20} strokeWidth={1.75} className="shrink-0" />
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-white/50 truncate mt-0.5">{item.description}</p>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer con cerrar sesión */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-white/10 text-white/80 hover:text-white group"
        >
          <LogOut size={20} strokeWidth={1.75} className="shrink-0" />
          {isOpen && (
            <span className="font-medium text-sm">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;