// src/components/common/Layout.jsx
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { getMenuItems, getRoleColors } from './config/menuConfig';

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  // Estado del sidebar (persiste en localStorage)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Persistir estado del sidebar
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Obtener rol de forma segura (soporta string o {nombre: "..."})
  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' 
      ? user.rol?.nombre 
      : user.rol;
    return rolValue?.toUpperCase() || null;
  };

  const userRole = getUserRole();
  const menuItems = getMenuItems(userRole);
  const roleColors = getRoleColors(userRole);

  const lastSegment = window.location.pathname.split('/').pop();
  const isUUID = (value) =>
  /^[0-9a-fA-F-]{36}$/.test(value);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 overflow-hidden">
      {/* Sidebar con sombra y efecto vidrio */}
      <div className="relative z-20">
        <Sidebar 
          menuItems={menuItems} 
          isOpen={sidebarOpen} 
          role={userRole}
          roleColors={roleColors}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl"></div>
        </div>
        
        {/* Navbar con efecto sutil */}
        <div className="relative z-[50] backdrop-blur-sm bg-white/95 border-b border-gray-100/50">
          <Navbar 
            user={user} 
            isSidebarOpen={sidebarOpen}
            role={userRole}
            roleColors={roleColors}
            toggleSidebar={toggleSidebar}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto relative z-10">
          <div className="p-6 md:p-8 lg:p-10">
            {/* Contenedor con efecto glassmorphism sutil */}
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb opcional (puedes agregarlo después) */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="hover:text-gray-700 transition-colors cursor-pointer">
                    Dashboard
                  </span>
                  {window.location.pathname !== '/dashboard' && (
                    <>
                      <span>/</span>
<span className="text-gray-800 font-medium">
  {isUUID(lastSegment)
    ? 'Detalle'
    : lastSegment?.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
  }
</span>
                    </>
                  )}
                </div>
              </div>

              {/* Children con animación suave */}
              <div className="animate-fadeIn">
                {children}
              </div>
            </div>
          </div>
        </main>

      
      </div>
    </div>
  );
};

export default Layout;