// src/modules/edificios/components/VerDetallesEdificio.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Save, X, Building2, MapPin, 
  Calendar, Shield, User, CreditCard, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { edificiosService } from '../services/edificiosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuconfig";

import UpgradePlanPage from './UpgradePlanPage';
import toast from 'react-hot-toast';

const VerDetallesEdificio = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [edificio, setEdificio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState('general');

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

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
        activo: edificioData.activo ?? true
      });
    } catch (error) {
      toast.error('Error al cargar el edificio');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdificio();
  }, [id]);

  const handleEditClick = () => setIsEditing(true);
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      nombre: edificio.nombre,
      direccion: edificio.direccion || '',
      ciudad: edificio.ciudad || '',
      provincia: edificio.provincia || '',
      distrito: edificio.distrito || '',
      activo: edificio.activo ?? true
    });
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await edificiosService.update(id, {
        nombre: editData.nombre,
        direccion: editData.direccion,
        ciudad: editData.ciudad,
        provincia: editData.provincia,
        distrito: editData.distrito,
        activo: editData.activo
      });
      
      toast.success('✓ Cambios guardados correctamente');
      setIsEditing(false);
      fetchEdificio();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar cambios';
      toast.error(message);
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
            <p className="text-gray-500 font-medium">Cargando información...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!edificio) return null;

  const planActual = edificio.suscripcion?.plan?.nombre || 'GRATUITO';
  const admin = edificio.administradores?.[0];
  const isActive = edificio.activo;

  const getPlanColor = () => {
    switch (planActual) {
      case 'GRATUITO': return 'bg-gray-100 text-gray-600';
      case 'ESTANDAR': return 'bg-blue-100 text-blue-700';
      case 'PREMIUM': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/edificios')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Edificios
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{edificio.nombre}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
                >
                  <Building2 size={28} className="text-white" />
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      label="Nombre del Edificio"
                      value={editData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-800">{edificio.nombre}</h1>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor()}`}>
                      <CreditCard size={12} />
                      {planActual}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isEditing ? (
                <Button variant="outline" role={userRole} icon={Edit2} onClick={handleEditClick}>
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="secondary" icon={X} onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button variant="primary" role={userRole} icon={Save} onClick={handleSave} loading={saving}>
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Cards de información rápida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <MapPin size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm font-medium text-gray-800">{edificio.direccion || 'No especificada'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <MapPin size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="text-sm font-medium text-gray-800">
                  {[edificio.ciudad, edificio.provincia, edificio.distrito].filter(Boolean).join(', ') || 'No especificada'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Calendar size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Registrado</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(edificio.fechaCreacion).toLocaleDateString('es-PE')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - SOLO GENERAL y PLAN Y PAGOS */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 px-2 font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'general'
                  ? `border-b-2 text-[${roleColors.dark}] border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 size={16} />
              General
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`pb-3 px-2 font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'plan'
                  ? `border-b-2 text-[${roleColors.dark}] border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard size={16} />
              Plan y Pagos
            </button>
          </div>
        </div>

        {/* TAB: GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Información del Edificio */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Información del Edificio</h2>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-5">
                    <Input
                      label="Dirección"
                      value={editData.direccion}
                      onChange={(e) => handleInputChange('direccion', e.target.value)}
                      icon={MapPin}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Ciudad"
                        value={editData.ciudad}
                        onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      />
                      <Input
                        label="Provincia"
                        value={editData.provincia}
                        onChange={(e) => handleInputChange('provincia', e.target.value)}
                      />
                      <Input
                        label="Distrito"
                        value={editData.distrito}
                        onChange={(e) => handleInputChange('distrito', e.target.value)}
                      />
                    </div>
                    
                    {/* Estado */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="font-medium text-gray-800">Edificio Activo</p>
                        <p className="text-sm text-gray-500">El edificio está operativo</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('activo', !editData.activo)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editData.activo ? 'bg-teal-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Dirección</p>
                      <p className="text-gray-800 mt-1">{edificio.direccion || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Ciudad</p>
                      <p className="text-gray-800 mt-1">{edificio.ciudad || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Provincia</p>
                      <p className="text-gray-800 mt-1">{edificio.provincia || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Distrito</p>
                      <p className="text-gray-800 mt-1">{edificio.distrito || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Administrador Asignado */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Administrador Asignado</h2>
                </div>
              </div>
              <div className="p-6">
                {admin ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <User size={20} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {admin.usuario?.nombres} {admin.usuario?.apellidos}
                      </p>
                      <p className="text-sm text-gray-500">{admin.usuario?.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Shield size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Sin administrador asignado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLAN Y PAGOS */}
        {activeTab === 'plan' && (
          <UpgradePlanPage edificio={edificio} />
        )}
      </div>
    </Layout>
  );
};

export default VerDetallesEdificio;