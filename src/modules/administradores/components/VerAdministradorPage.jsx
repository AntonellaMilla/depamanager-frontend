// src/modules/administradores/components/VerAdministradorPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Save, X, User, Mail, Phone, MapPin, 
  CreditCard, Shield, Building2, CheckCircle, AlertCircle 
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import HistorialTimeline from './HistorialTimeline';
import { administradoresService } from '../services/administradoresService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from '../../../shared/components/layout/config/menuConfig';
import toast from 'react-hot-toast';

const VerAdministradorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [administrador, setAdministrador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState('general');
  const [edificiosAsignados, setEdificiosAsignados] = useState([]);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchAdministrador = async () => {
    try {
      setLoading(true);
      // El backend no expone GET /usuarios/admin/:id, por compatibilidad
      // listamos todos y buscamos el administrador localmente
      const list = await administradoresService.listarAdministradores();
      const data = Array.isArray(list) ? list.find(a => String(a.id) === String(id)) : (list?.data || []).find(a => String(a.id) === String(id));
      if (!data) {
        throw new Error('Administrador no encontrado');
      }
      setAdministrador(data);
      setEditData({
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        dni: data.dni || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
        tipoDocumento: data.tipoDocumento || 'DNI',
        activo: data.activo ?? true
      });

      // Cargar edificios asignados
      const edificios = await administradoresService.getEdificiosAsignados(id);
      setEdificiosAsignados(edificios);
    } catch (error) {
      toast.error('Error al cargar el administrador');
      navigate('/administradores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministrador();
  }, [id]);

  const handleEditClick = () => setIsEditing(true);
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      nombres: administrador.nombres,
      apellidos: administrador.apellidos,
      email: administrador.email,
      dni: administrador.dni || '',
      telefono: administrador.telefono || '',
      direccion: administrador.direccion || '',
      tipoDocumento: administrador.tipoDocumento || 'DNI',
      activo: administrador.activo ?? true
    });
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await administradoresService.actualizarAdministrador(id, {
        nombres: editData.nombres,
        apellidos: editData.apellidos,
        email: editData.email,
        dni: editData.dni || null,
        telefono: editData.telefono || null,
        direccion: editData.direccion || null,
        tipoDocumento: editData.tipoDocumento,
        activo: editData.activo
      });
      
      toast.success('✓ Cambios guardados correctamente');
      setIsEditing(false);
      fetchAdministrador();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar cambios';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const tipoDocumentoOptions = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carnet de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

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

  if (!administrador) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/administradores')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Administradores
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{administrador.nombres} {administrador.apellidos}</span>
        </div>

        {/* Header con información del administrador */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                  style={{ backgroundColor: roleColors.dark }}
                >
                  {administrador.nombres?.charAt(0).toUpperCase()}{administrador.apellidos?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {administrador.nombres} {administrador.apellidos}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      administrador.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${administrador.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {administrador.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    {edificiosAsignados.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Building2 size={12} />
                        {edificiosAsignados.length} {edificiosAsignados.length === 1 ? 'edificio asignado' : 'edificios asignados'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {!isEditing && (
                <Button variant="outline" role={userRole} icon={Edit2} onClick={handleEditClick}>
                  Editar
                </Button>
              )}
            </div>
          </div>
          
          {/* Cards de información rápida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Mail size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Correo electrónico</p>
                <p className="text-sm font-medium text-gray-800">{administrador.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <CreditCard size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Documento</p>
                <p className="text-sm font-medium text-gray-800">
                  {administrador.dni || 'No registrado'} 
                  <span className="text-gray-400 text-xs ml-1">({administrador.tipoDocumento || 'DNI'})</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Phone size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-800">{administrador.telefono || 'No registrado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`pb-3 px-2 font-medium transition-all duration-200 ${
                activeTab === 'general'
                  ? `border-b-2 text-[${roleColors.dark}] border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`pb-3 px-2 font-medium transition-all duration-200 ${
                activeTab === 'historial'
                  ? `border-b-2 text-[${roleColors.dark}] border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Historial
            </button>
          </div>
        </div>

        {/* TAB: General */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Información Personal</h2>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nombres"
                        value={editData.nombres}
                        onChange={(e) => handleInputChange('nombres', e.target.value)}
                        required
                        icon={User}
                      />
                      <Input
                        label="Apellidos"
                        value={editData.apellidos}
                        onChange={(e) => handleInputChange('apellidos', e.target.value)}
                        required
                        icon={User}
                      />
                    </div>
                    <Input
                      label="Correo Electrónico"
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      icon={Mail}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Tipo de Documento"
                        name="tipoDocumento"
                        value={editData.tipoDocumento}
                        onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                        options={tipoDocumentoOptions}
                        icon={CreditCard}
                      />
                      <Input
                        label="Número de Documento"
                        value={editData.dni}
                        onChange={(e) => handleInputChange('dni', e.target.value)}
                        icon={CreditCard}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Teléfono"
                        value={editData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        icon={Phone}
                      />
                      <Input
                        label="Dirección"
                        value={editData.direccion}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        icon={MapPin}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</label>
                      <p className="text-gray-900 mt-1">{administrador.nombres}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</label>
                      <p className="text-gray-900 mt-1">{administrador.apellidos}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                      <p className="text-gray-900 mt-1">{administrador.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
                      <p className="text-gray-900 mt-1">{administrador.telefono || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</label>
                      <p className="text-gray-900 mt-1">
                        {administrador.dni || '-'} 
                        <span className="text-gray-400 text-xs ml-1">({administrador.tipoDocumento || 'DNI'})</span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</label>
                      <p className="text-gray-900 mt-1">{administrador.direccion || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Estado del Administrador */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Estado del Administrador</h2>
                </div>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">Administrador Activo</p>
                      <p className="text-sm text-gray-500">Este administrador puede acceder al sistema</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('activo', !editData.activo)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editData.activo ? 'bg-teal-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      administrador.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${administrador.activo ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {administrador.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Edificios Asignados */}
            {edificiosAsignados.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-teal-600" />
                    <h2 className="font-semibold text-gray-800">Edificios Asignados</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3">
                    {edificiosAsignados.map(edificio => (
                      <div key={edificio.id} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100">
                        <Building2 size={14} className="text-teal-600" />
                        <span className="text-sm font-medium text-gray-700">{edificio.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Acciones de edición */}
            {isEditing && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40">
                <div className="max-w-5xl mx-auto flex justify-end gap-3">
                  <Button variant="secondary" icon={X} onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button variant="primary" role={userRole} icon={Save} onClick={handleSave} loading={saving}>
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: Historial */}
        {activeTab === 'historial' && (
          <HistorialTimeline administradorId={id} edificiosAsignados={edificiosAsignados} />
        )}
      </div>
    </Layout>
  );
};

export default VerAdministradorPage;