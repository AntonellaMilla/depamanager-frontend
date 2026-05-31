export const setToken = (token) => {
  console.log('💾 Guardando token en localStorage...');
  localStorage.setItem('token', token);
  console.log('✅ Token guardado');
};

export const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('📥 Token recuperado del localStorage:', token ? '✅ Existe' : '❌ No existe');
  return token;
};

export const removeToken = () => {
  localStorage.removeItem('token');
  console.log('🗑️ Token eliminado del localStorage');
};

export const setUser = (user) => {
  console.log('💾 === GUARDANDO USUARIO ===');
  console.log('📥 Datos a guardar:', user);
  
  // Asegurar que solo guardamos el usuario, no la estructura completa
  const userData = user.usuario || user; // Si viene envuelto, extraer
  
  console.log('📝 Usuario después de extracción:', userData);
  
  // Normalizar el rol a string si viene como objeto
  if (userData.rol && typeof userData.rol === 'object') {
    userData.rol = userData.rol.nombre || userData.rol.name || 'PROPIETARIO';
    console.log('🔄 Rol normalizado a:', userData.rol);
  }
  
  localStorage.setItem('user', JSON.stringify(userData));
  console.log('✅ Usuario guardado en localStorage');
};

export const getUser = () => {
  console.log('📥 === RECUPERANDO USUARIO ===');
  const user = localStorage.getItem('user');
  
  if (!user) {
    console.log('❌ No hay usuario en localStorage');
    return null;
  }
  
  try {
    const userData = JSON.parse(user);
    console.log('📝 Usuario recuperado:', userData);
    
    // Si está mal formateado (contiene 'usuario'), corregir
    const cleanUser = userData.usuario || userData;
    
    // Normalizar el rol a string si viene como objeto
    if (cleanUser.rol && typeof cleanUser.rol === 'object') {
      cleanUser.rol = cleanUser.rol.nombre || cleanUser.rol.name || 'PROPIETARIO';
      console.log('🔄 Rol normalizado al recuperar:', cleanUser.rol);
    }
    
    console.log('✅ Usuario parseado correctamente:', cleanUser);
    return cleanUser;
  } catch (error) {
    console.error('❌ Error al parsear usuario:', error);
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem('user');
  console.log('🗑️ Usuario eliminado del localStorage');
};