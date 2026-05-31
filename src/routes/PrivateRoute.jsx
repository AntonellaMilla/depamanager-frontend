// src/routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const PrivateRoute = ({ children, requiredRole, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Obtener el rol del usuario
  const rolValue = typeof user?.rol === 'object' ? user?.rol?.nombre : user?.rol;
  const userRole = rolValue?.toUpperCase();

  // Verificar roles permitidos (array)
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());
    if (!normalizedAllowedRoles.includes(userRole)) {
      console.warn(`❌ Acceso denegado: Usuario tiene rol ${userRole} pero se requiere uno de: ${normalizedAllowedRoles.join(', ')}`);
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // Verificar rol requerido (string único)
  if (requiredRole) {
    if (userRole !== requiredRole.toUpperCase()) {
      console.warn(`❌ Acceso denegado: Usuario tiene rol ${userRole} pero se requiere ${requiredRole}`);
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  // Si no hay restricción de rol, cualquier usuario autenticado puede acceder
  return children;
};

export default PrivateRoute;