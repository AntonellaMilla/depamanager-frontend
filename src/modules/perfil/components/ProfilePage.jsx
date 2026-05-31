// src/modules/perfil/pages/ProfilePage.jsx
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, CreditCard, Calendar, Shield, 
  Building2, Home, Car, Key, LogOut, Edit2, CheckCircle, 
  XCircle, Wifi, Camera, Activity, Users
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import { AuthContext } from '../../../shared/context/AuthContext';
import { useAuth } from '../../../shared/hooks/useAuth';

import { getRoleColors ,getRoleLabel} from "../../../shared/components/layout/config/menuConfig";
import { edificiosService } from '../../edificios/services/edificiosService';
import { inquilinosService } from '../../inquilinos/services/inquilinosService';
import { vehiculosService } from '../../vehiculos/services/vehiculosService';
import { authService } from '../../auth/services/authService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  // Role-specific state
  const [propEdificios, setPropEdificios] = useState([]);
  const [adminEdificio, setAdminEdificio] = useState(null);
  const [tenantInfo, setTenantInfo] = useState(null);
  const [vehiculos, setVehiculos] = useState([]);

  // Obtener rol y colores
  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleLabel = getRoleLabel(userRole);
  const roleColors = getRoleColors(userRole);

  // Formatear fecha
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

useEffect(() => {
  if (!user) return;
  fetchRoleData();
}, [user?.id]);

  const fetchRoleData = async () => {
    setLoading(true);
    try {
      const role = userRole;

      // ============================================================
      // ROL: PROPIETARIO
      // ============================================================
      if (role === 'PROPIETARIO') {
        try {
          const edificiosData = await edificiosService.getAll();
          const edificiosList = edificiosData.data?.data || edificiosData.data || edificiosData || [];
          setPropEdificios(edificiosList);
        } catch (err) {
          console.warn('No se pudieron obtener edificios:', err);
          setPropEdificios([]);
        }
      }

      // ============================================================
      // ROL: ADMINISTRADOR
      // ============================================================
      if (role === 'ADMINISTRADOR') {
        try {
          // Usar el edificioId del usuario object (disponible después del login)
          const edificioId = user?.edificiosIds?.[0] || user?.edificioId;
          if (edificioId) {
            // Intentar obtener información del edificio desde el usuario object
            // El backend debería incluir los edificios en la respuesta del login
            if (user?.edificios && user.edificios.length > 0) {
              const edificio = user.edificios.find(e => e.id === edificioId);
              if (edificio) {
                setAdminEdificio(edificio);
              } else {
                setAdminEdificio({ id: edificioId, nombre: 'Edificio Asignado' });
              }
            } else {
              setAdminEdificio({ id: edificioId, nombre: 'Edificio Asignado' });
            }
          } else {
            console.warn('No se encontró edificioId en el usuario');
            setAdminEdificio(null);
          }
        } catch (err) {
          console.warn('No se pudo obtener edificio del administrador:', err);
          setAdminEdificio(null);
        }
      }

      // ============================================================
      // ROL: INQUILINO
      // ============================================================
      if (role === 'INQUILINO') {
        try {
          // INQUILINO no puede listar todos los inquilinos, solo puede obtener su propia información
          // Los vehículos ya vienen filtrados por el backend según el rol
          const vehiculosData = await vehiculosService.listarVehiculos();
          const vehiculosList = vehiculosData.data?.data || vehiculosData.data || vehiculosData || [];
          setVehiculos(vehiculosList);
          
          // La información del inquilino debería estar en el usuario object desde el login
          // Si el usuario object tiene inquilino info, usarla
          if (user?.inquilino) {
            setTenantInfo(user.inquilino);
          } else {
            // Si no está en el usuario object, intentar obtenerlo por usuarioId
            // Necesitamos encontrar el inquilino por usuarioId, pero no hay endpoint público para esto
            // Mostrar información básica del usuario
            setTenantInfo({
              usuario: user,
              unidad: { numero: 'No especificado' }
            });
          }
        } catch (err) {
          console.warn('No se pudo obtener información del inquilino:', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Contraseña actual requerida';
    if (!passwordForm.newPassword) errors.newPassword = 'Nueva contraseña requerida';
    if (passwordForm.newPassword.length < 6) errors.newPassword = 'Mínimo 6 caracteres';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }
    
    setPwLoading(true);
    setPwErrors({});
    
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Contraseña cambiada correctamente');
      setShowChangeModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error al cambiar contraseña';
      toast.error(message);
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No hay usuario autenticado.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-4">
        {/* Header con gradiente */}
        <div className="relative mb-8">
          <div 
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${roleColors.dark}20` }}
          ></div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
              >
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${roleColors.dark}15`, color: roleColors.dark }}
                  >
                    <Shield size={12} />
                    {roleLabel}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" icon={Edit2} onClick={() => navigate('/perfil/editar')}>
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Tarjeta de Información Personal */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <User size={18} className="text-teal-600" />
              <h2 className="font-semibold text-gray-800">Información Personal</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</p>
                <div className="mt-1 flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <p className="text-gray-800 font-medium">{user.nombres || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</p>
                <div className="mt-1 flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <p className="text-gray-800 font-medium">{user.apellidos || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</p>
                <div className="mt-1 flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <p className="text-gray-800">{user.email || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</p>
                <div className="mt-1 flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400" />
                  <p className="text-gray-800">
                    {user.dni || '-'} 
                    <span className="text-gray-400 text-xs ml-1">({user.tipoDocumento || 'DNI'})</span>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</p>
                <div className="mt-1 flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <p className="text-gray-800">{user.telefono || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</p>
                <div className="mt-1 flex items-center gap-2">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-gray-800">{user.direccion || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Miembro desde</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <p className="text-gray-800">{formatDate(user.fechaCreacion || user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            ROL: PROPIETARIO - Edificios
        ============================================================ */}
        {userRole === 'PROPIETARIO' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Mis Edificios</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {propEdificios.length} edificios
                </span>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
                </div>
              ) : propEdificios.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay edificios asociados</p>
                  <Button variant="primary" className="mt-3" onClick={() => navigate('/edificios/crear')}>
                    + Crear primer edificio
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propEdificios.map(edificio => (
                    <div 
                      key={edificio.id} 
                      className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                      style={{ backgroundColor: `${roleColors.dark}05` }}
                      onClick={() => navigate(`/edificios/${edificio.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: roleColors.dark }}
                          >
                            {edificio.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{edificio.nombre}</p>
                            <p className="text-xs text-gray-500">{edificio.direccion || 'Sin dirección'}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          edificio.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {edificio.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            ROL: ADMINISTRADOR - Edificio Asignado
        ============================================================ */}
        {userRole === 'ADMINISTRADOR' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Edificio Asignado</h2>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
                </div>
              ) : adminEdificio ? (
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: `${roleColors.dark}08` }}>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: roleColors.dark }}
                  >
                    {adminEdificio.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{adminEdificio.nombre}</p>
                    <p className="text-sm text-gray-500">{adminEdificio.direccion || 'Sin dirección'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay edificio asignado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            ROL: INQUILINO - Unidad y Vehículos
        ============================================================ */}
        {userRole === 'INQUILINO' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Información de Unidad */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Home size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Mi Unidad</h2>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
                  </div>
                ) : tenantInfo ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl" style={{ backgroundColor: `${roleColors.dark}08` }}>
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: roleColors.dark }}
                      >
                        {tenantInfo.unidad?.numero?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Unidad {tenantInfo.unidad?.numero}</p>
                        <p className="text-sm text-gray-500">Piso {tenantInfo.unidad?.piso}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Inicio de Contrato</p>
                        <p className="text-gray-800 font-medium">{formatDate(tenantInfo.fechaInicioContrato)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Fin de Contrato</p>
                        <p className="text-gray-800 font-medium">{formatDate(tenantInfo.fechaFinContrato)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Estado del Contrato</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        tenantInfo.estadoContrato === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tenantInfo.estadoContrato === 'ACTIVO' ? 'Activo' : 'Finalizado'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Home size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay unidad asignada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mis Vehículos */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Car size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Mis Vehículos</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {vehiculos.length} vehículos
                  </span>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
                  </div>
                ) : vehiculos.length === 0 ? (
                  <div className="text-center py-8">
                    <Car size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay vehículos registrados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehiculos.map(vehiculo => (
                      <div key={vehiculo.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Car size={18} className="text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{vehiculo.placa}</p>
                          <p className="text-xs text-gray-500">{vehiculo.modelo} - {vehiculo.color}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          vehiculo.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {vehiculo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seguridad */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-teal-600" />
              <h2 className="font-semibold text-gray-800">Seguridad</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                style={{ backgroundColor: `${roleColors.dark}08` }}
                onClick={() => {
                  setShowChangeModal(true);
                  setPwErrors({});
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Key size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Cambiar contraseña</p>
                    <p className="text-xs text-gray-500">Actualiza tu contraseña de forma segura</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Cambiar</Button>
              </div>

              <div 
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer hover:shadow-md transition-all"
                style={{ backgroundColor: `${roleColors.dark}08` }}
                onClick={logout}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <LogOut size={18} className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Cerrar sesión</p>
                    <p className="text-xs text-gray-500">Cierra esta sesión de forma segura</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600">Salir</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cambiar Contraseña */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <Key size={18} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Cambiar Contraseña</h3>
                  <p className="text-xs text-gray-500">Ingresa tu nueva contraseña</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Ingresa tu contraseña actual"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    pwErrors.currentPassword 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' 
                      : 'border-gray-200 focus:border-teal-400 focus:ring-teal-500/20'
                  }`}
                />
                {pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    pwErrors.newPassword 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' 
                      : 'border-gray-200 focus:border-teal-400 focus:ring-teal-500/20'
                  }`}
                />
                {pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirma tu nueva contraseña"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    pwErrors.confirmPassword 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400' 
                      : 'border-gray-200 focus:border-teal-400 focus:ring-teal-500/20'
                  }`}
                />
                {pwErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 pt-0">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowChangeModal(false);
                  setPwErrors({});
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary"
                role={userRole}
                loading={pwLoading} 
                onClick={handleChangePassword}
              >
                Cambiar Contraseña
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ProfilePage;