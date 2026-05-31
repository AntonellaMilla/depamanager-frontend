// src/modules/inquilinos/pages/VerInquilinoPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Save, X, User, Mail, Phone, 
  Calendar, Home, CreditCard, MapPin, Shield, AlertCircle,
  CheckCircle, Building2, Users, PhoneCall
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { inquilinosService } from '../services/inquilinosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const VerInquilinoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [inquilino, setInquilino] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchInquilino = async () => {
    try {
      setLoading(true);
      const data = await inquilinosService.obtenerInquilino(id);
      setInquilino(data);
      setEditData({
        nacionalidad: data.nacionalidad || '',
        contactoEmergencia: data.contactoEmergencia || '',
        telefonoEmergencia: data.telefonoEmergencia || '',
        fechaInicioContrato: data.fechaInicioContrato?.split('T')[0] || '',
        fechaFinContrato: data.fechaFinContrato?.split('T')[0] || ''
      });
    } catch (error) {
      toast.error('Error al cargar el inquilino');
      navigate('/inquilinos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquilino();
  }, [id]);

  const handleEditClick = () => setIsEditing(true);
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      nacionalidad: inquilino.nacionalidad || '',
      contactoEmergencia: inquilino.contactoEmergencia || '',
      telefonoEmergencia: inquilino.telefonoEmergencia || '',
      fechaInicioContrato: inquilino.fechaInicioContrato?.split('T')[0] || '',
      fechaFinContrato: inquilino.fechaFinContrato?.split('T')[0] || ''
    });
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await inquilinosService.actualizarInquilino(id, {
        nacionalidad: editData.nacionalidad || null,
        contactoEmergencia: editData.contactoEmergencia || null,
        telefonoEmergencia: editData.telefonoEmergencia || null,
        fechaInicioContrato: editData.fechaInicioContrato,
        fechaFinContrato: editData.fechaFinContrato
      });
      
      toast.success('✓ Cambios guardados correctamente');
      setIsEditing(false);
      fetchInquilino();
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

  if (!inquilino) return null;

  const usuario = inquilino.usuario;
  const unidad = inquilino.unidad;
  const esActivo = inquilino.estadoContrato === 'ACTIVO';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/inquilinos')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Inquilinos
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{usuario?.nombres} {usuario?.apellidos}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                  style={{ backgroundColor: roleColors.dark }}
                >
                  {usuario?.nombres?.charAt(0).toUpperCase()}{usuario?.apellidos?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {usuario?.nombres} {usuario?.apellidos}
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      esActivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {esActivo ? 'Contrato Activo' : 'Contrato Finalizado'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Home size={12} />
                      Unidad {unidad?.numero}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isEditing && esActivo && (
                <Button variant="outline" role={userRole} icon={Edit2} onClick={handleEditClick}>
                  Editar
                </Button>
              )}
            </div>
          </div>
          
          {/* Cards de información rápida */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Mail size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Correo electrónico</p>
                <p className="text-sm font-medium text-gray-800">{usuario?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <CreditCard size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Documento</p>
                <p className="text-sm font-medium text-gray-800">{usuario?.dni || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Phone size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-800">{usuario?.telefono || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Home size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Unidad</p>
                <p className="text-sm font-medium text-gray-800">Unidad {unidad?.numero} - Piso {unidad?.piso}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-6">
          {/* Información Personal (solo lectura) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <User size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Información Personal</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombres</label>
                  <p className="text-gray-900 mt-1">{usuario?.nombres}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Apellidos</label>
                  <p className="text-gray-900 mt-1">{usuario?.apellidos}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                  <p className="text-gray-900 mt-1">{usuario?.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
                  <p className="text-gray-900 mt-1">{usuario?.telefono || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</label>
                  <p className="text-gray-900 mt-1">{usuario?.dni || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nacionalidad</label>
                  <p className="text-gray-900 mt-1">{inquilino.nacionalidad || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contacto Emergencia */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <PhoneCall size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Contacto de Emergencia</h2>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Nombre del contacto"
                    value={editData.contactoEmergencia}
                    onChange={(e) => handleInputChange('contactoEmergencia', e.target.value)}
                    placeholder="Nombre completo"
                  />
                  <Input
                    label="Teléfono de Emergencia"
                    value={editData.telefonoEmergencia}
                    onChange={(e) => handleInputChange('telefonoEmergencia', e.target.value)}
                    placeholder="Ej: 987654321"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</label>
                    <p className="text-gray-900 mt-1">{inquilino.contactoEmergencia || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</label>
                    <p className="text-gray-900 mt-1">{inquilino.telefonoEmergencia || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Contrato */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Información del Contrato</h2>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Fecha de Inicio"
                    type="date"
                    value={editData.fechaInicioContrato}
                    onChange={(e) => handleInputChange('fechaInicioContrato', e.target.value)}
                  />
                  <Input
                    label="Fecha de Fin"
                    type="date"
                    value={editData.fechaFinContrato}
                    onChange={(e) => handleInputChange('fechaFinContrato', e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Inicio</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(inquilino.fechaInicioContrato).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Fin</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(inquilino.fechaFinContrato).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        esActivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {esActivo ? 'Activo' : 'Finalizado'}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

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
      </div>
    </Layout>
  );
};

export default VerInquilinoPage;