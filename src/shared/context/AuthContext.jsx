import { createContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getUser());
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    console.log('⚙️ === AUTHCONTEXT INICIALIZANDO ===');
    const storedUser = getUser();
    const storedToken = getToken();
    
    if (storedUser && storedToken) {
      console.log('✅ Sesión válida encontrada en localStorage');
      
      // Si el usuario guardado tiene estructura errónea (contiene 'usuario' o rol como objeto)
      // extraer/normalizar
      let userData = storedUser.usuario || storedUser;
      
      // Normalizar el rol a string si viene como objeto
      if (userData.rol && typeof userData.rol === 'object') {
        userData.rol = userData.rol.nombre || userData.rol.name || 'PROPIETARIO';
      }
      
      setUserState(userData);
      setTokenState(storedToken);

      console.log('👤 Usuario restaurado:', userData);
      console.log('🔑 Rol restaurado:', userData?.rol);
      console.log('🏢 Administradores:', userData?.administradores);
    } else {
      console.log('❌ No hay sesión válida en localStorage');
    }
    setLoading(false);
  }, []);

    const login = (userData, tokenData) => {
      console.log('🔐 === LOGIN INICIADO ===');
      console.log('📥 Datos recibidos en login:', userData);
      console.log('📥 Token recibido:', tokenData?.substring(0, 20) + '...');
      
      if (!userData) {
        console.error('❌ ERROR: userData es null/undefined');
        return;
      }
      
      if (!tokenData) {
        console.error('❌ ERROR: tokenData es null/undefined');
        return;
      }
      
      // Normalizar el rol si viene como objeto
      let normalizedUser = { ...userData };
      if (normalizedUser.rol && typeof normalizedUser.rol === 'object') {
        normalizedUser.rol = normalizedUser.rol.nombre || normalizedUser.rol.name || 'PROPIETARIO';
        console.log('🔄 Rol normalizado de objeto a string:', normalizedUser.rol);
      }

      setToken(tokenData);
      setUser(normalizedUser);
      setUserState(normalizedUser);
      setTokenState(tokenData);
      
      console.log('✅ === LOGIN COMPLETADO ===');
      console.log('💾 Usuario guardado:', normalizedUser);
      console.log('🔑 Rol final:', normalizedUser.rol);
    };

  const logout = () => {
    console.log('🚪 === LOGOUT ===');
    removeToken();
    removeUser();
    setUserState(null);
    setTokenState(null);
    console.log('✅ Sesión cerrada');
    window.location.href = '/login'; // Redirección directa
  };

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    if (!loading) {
      console.log(`🔓 Estado de autenticación: ${isAuthenticated ? '✅ AUTENTICADO' : '❌ NO AUTENTICADO'}`);
      if (isAuthenticated) {
        console.log('👤 Usuario:', user);
        console.log('🔑 Rol:', user?.rol);
      }
    }
  }, [isAuthenticated, loading, user]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};