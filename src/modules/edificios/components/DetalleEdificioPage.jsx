// src/modules/edificios/pages/DetalleEdificioPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Building2, MapPin, User, Power } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { edificiosService } from '../services/edificiosService';
import { administradoresService } from '../../administradores/services/administradoresService';
import { PlanTab } from '../components/PlanTab';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuconfig";

import toast from 'react-hot-toast';

const DetalleEdificioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Estados del edificio
  const [edificio, setEdificio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  
  // Tab activo
  const [activeTab, setActiveTab] = useState('general');
  
  // Administradores disponibles
  const [administradores, setAdministradores] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Obtener rol del usuario
  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // Cargar datos del edificio
  useEffect(() => {
    fetchEdificio();
  }, [id]);

  // Cargar administradores cuando se activa edición
  useEffect(() => {
    if (isEditing && activeTab === 'general') {
      fetchAdministradores();
    }
  }, [isEditing, activeTab]);

  const fetchEdificio = async () => {
    try {
      setLoading(true);
      const response = await edificiosService.getAll();
      const edificiosList = response.data?.data || response.data || [];
      const edificioData = edificiosList.find(e => e.id === id);
      
      if (!edificioData) {
        toast.error('Edificio no encontrado');
        navigate('/edificios');
        return;
      }
      
      setEdificio(edificioData);
      setEditData({
        nombre: edificioData.nombre,
        direccion: edificioData.direccion || '',
        ciudad: edificioData.ciudad || '',
        provincia: edificioData.provincia || '',
        distrito: edificioData.distrito || '',
        activo: edificioData.activo ?? true,
        adminId: edificioData.administradores?.[0]?.usuarioId || null,
      });
    } catch (error) {
      toast.error('Error al cargar el edificio');
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdministradores = async () => {
    try {
      setAdminLoading(true);
      const response = await administradoresService.getAll();
      const admins = Array.isArray(response) ? response : response?.data || [];
      
      // Obtener todos los edificios para saber qué admins ya están asignados
      const allEdificios = await edificiosService.getAll();
      const edificiosList = Array.isArray(allEdificios) ? allEdificios : allEdificios?.data || [];
      
      // Recolectar IDs de usuarios que ya son admin en otros edificios
      const usuariosAsignados = new Set();
      edificiosList.forEach(edf => {
        if (edf.administradores && edf.administradores.length > 0) {
          edf.administradores.forEach(admin => {
            if (edf.id !== id) {
              usuariosAsignados.add(admin.usuarioId);
            }
          });
        }
      });
      
      // Filtrar: solo mostrar admins disponibles o el admin actual
      const adminActualId = edificio?.administradores?.[0]?.usuarioId;
      const filtered = admins.filter(admin => 
        !usuariosAsignados.has(admin.usuarioId) || admin.usuarioId === adminActualId
      );
      
      setAdministradores(filtered);
    } catch (error) {
      console.error('Error al cargar administradores:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      nombre: edificio.nombre,
      direccion: edificio.direccion || '',
      ciudad: edificio.ciudad || '',
      provincia: edificio.provincia || '',
      distrito: edificio.distrito || '',
      activo: edificio.activo ?? true,
      adminId: edificio.administradores?.[0]?.usuarioId || null,
    });
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        nombre: editData.nombre,
        direccion: editData.direccion,
        ciudad: editData.ciudad,
        provincia: editData.provincia,
        distrito: editData.distrito,
        activo: editData.activo,
      };

      await edificiosService.update(id, payload);
      
      // Si cambió el admin, actualizar
      const adminActual = edificio?.administradores?.[0]?.usuarioId;
      if (editData.adminId !== adminActual) {
        if (editData.adminId) {
          await edificiosService.asignarAdmin(id, editData.adminId);
        }
      }

      toast.success('✓ Cambios guardados correctamente');
      setIsEditing(false);
      fetchEdificio();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar cambios';
      toast.error(message);
      console.error('❌ Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: `${roleColors.dark} transparent ${roleColors.dark} transparent` }}
            ></div>
            <p className="text-gray-500 font-medium">Cargando detalles...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!edificio) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Edificio no encontrado</p>
          <Button 
            variant="primary"
            role={userRole}
            onClick={() => navigate('/edificios')} 
            className="mt-4"
          >
            Volver a Edificios
          </Button>
        </div>
      </Layout>
    );
  }

  const admin = edificio.administradores?.[0];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header con breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <button onClick={() => navigate('/edificios')} className="hover:text-gray-700 transition-colors">
              Edificios
            </button>
            <span>/</span>
            <span className="text-gray-800 font-medium">{edificio.nombre}</span>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/edificios')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Volver"
              >
                <ArrowLeft size={20} className="text-gray-500" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{edificio.nombre}</h1>
                {edificio.direccion && (
                  <p className="text-gray-500 mt-1">{edificio.direccion}</p>
                )}
              </div>
            </div>
            
            {!isEditing && (
              <Button
                variant="outline"
                role={userRole}
                icon={Edit2}
                onClick={handleEditClick}
              >
                Editar
              </Button>
            )}
          </div>
        </div>

        {/* Tabs elegantes */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`
                pb-3 px-2 font-medium transition-all duration-200
                ${activeTab === 'general'
                  ? `border-b-2 text-${roleColors.text} border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`
                pb-3 px-2 font-medium transition-all duration-200
                ${activeTab === 'plan'
                  ? `border-b-2 text-${roleColors.text} border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              Plan y Suscripción
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            {/* Tarjeta de información básica */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Información Básica</h2>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      label="Nombre del edificio"
                      value={editData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      required
                    />
                    <Input
                      label="Dirección"
                      value={editData.direccion}
                      onChange={(e) => handleInputChange('direccion', e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
                      <p className="text-gray-900 font-medium mt-1">{edificio.nombre}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</label>
                      <p className="text-gray-900 mt-1">{edificio.direccion || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta de ubicación */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Ubicación</h2>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Ciudad"
                      value={editData.ciudad}
                      onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      placeholder="Ciudad"
                    />
                    <Input
                      label="Provincia"
                      value={editData.provincia}
                      onChange={(e) => handleInputChange('provincia', e.target.value)}
                      placeholder="Provincia"
                    />
                    <Input
                      label="Distrito"
                      value={editData.distrito}
                      onChange={(e) => handleInputChange('distrito', e.target.value)}
                      placeholder="Distrito"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</label>
                      <p className="text-gray-900 mt-1">{edificio.ciudad || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Provincia</label>
                      <p className="text-gray-900 mt-1">{edificio.provincia || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Distrito</label>
                      <p className="text-gray-900 mt-1">{edificio.distrito || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta de estado */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Power size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Estado</h2>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <Select
                    label="Estado del edificio"
                    name="activo"
                    value={editData.activo}
                    onChange={(e) => handleInputChange('activo', e.target.value === 'true')}
                    options={[
                      { value: true, label: 'Activo' },
                      { value: false, label: 'Inactivo' }
                    ]}
                  />
                ) : (
                  <div>
                    <span className={`
                      inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                      ${edificio.activo 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }
                    `}>
                      <span className={`w-2 h-2 rounded-full ${edificio.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {edificio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta de administrador */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-gray-500" />
                  <h2 className="font-semibold text-gray-800">Administrador</h2>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <Select
                    label="Seleccionar administrador"
                    name="adminId"
                    value={editData.adminId || ''}
                    onChange={(e) => handleInputChange('adminId', e.target.value || null)}
                    options={[
                      { value: '', label: '-- Sin asignar --' },
                      ...administradores.map(admin => ({
                        value: admin.usuarioId,
                        label: `${admin.nombres} ${admin.apellidos} (${admin.email})`
                      }))
                    ]}
                    isLoading={adminLoading}
                    icon={User}
                  />
                ) : (
                  <div>
                    {admin ? (
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                          style={{ backgroundColor: roleColors.dark }}
                        >
                          {admin.usuario?.nombres?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {admin.usuario?.nombres} {admin.usuario?.apellidos}
                          </p>
                          <p className="text-sm text-gray-500">{admin.usuario?.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <User size={32} className="mx-auto text-gray-300 mb-2" />
                        <p>No hay administrador asignado</p>
                        <p className="text-sm">Edita para asignar uno</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB PLAN */}
        {activeTab === 'plan' && (
          <PlanTab edificio={edificio} />
        )}

        {/* Footer con acciones de edición */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
            <div className="max-w-5xl mx-auto flex justify-end gap-3">
              <Button
                variant="secondary"
                icon={X}
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                role={userRole}
                icon={Save}
                onClick={handleSave}
                loading={saving}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DetalleEdificioPage;