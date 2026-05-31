// src/modules/camaras/pages/VerCamaraPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, ArrowLeft, Edit2, Save, X, MapPin, Video, 
  Wifi, WifiOff, Calendar, Activity, Shield, AlertCircle, CheckCircle, Trash2
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';
import CameraStream from '../components/CameraStream';
import { camarasService } from '../services/camarasService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuconfig";
import toast from 'react-hot-toast';

const VerCamaraPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [camara, setCamara] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // ============================================================
  // PROPIETARIO solo puede VER, no editar ni eliminar
  // ============================================================
  const esPropietario = userRole === 'PROPIETARIO';
  const esAdministrador = userRole === 'ADMINISTRADOR';

  const fetchCamara = async () => {
    try {
      setLoading(true);
      const data = await camarasService.obtenerCamara(id);
      setCamara(data);
      setEditData({
        nombre: data.nombre || '',
        ubicacion: data.ubicacion || '',
        urlStream: data.urlStream || '',
        activa: data.activa ?? true
      });
    } catch (error) {
      toast.error('Error al cargar la cámara');
      navigate('/camaras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamara();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!editData.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!editData.urlStream?.trim()) newErrors.urlStream = 'La URL del stream es requerida';
    else if (!editData.urlStream.startsWith('rtsp://') && !editData.urlStream.startsWith('http://')) {
      newErrors.urlStream = 'URL debe comenzar con rtsp:// o http://';
    }
    return newErrors;
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditData({
      nombre: camara.nombre || '',
      ubicacion: camara.ubicacion || '',
      urlStream: camara.urlStream || '',
      activa: camara.activa ?? true
    });
    setErrors({});
    setTouched({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      nombre: camara.nombre || '',
      ubicacion: camara.ubicacion || '',
      urlStream: camara.urlStream || '',
      activa: camara.activa ?? true
    });
    setErrors({});
    setTouched({});
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    setTouched({ nombre: true, urlStream: true });
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setSaving(true);
    try {
      await camarasService.actualizarCamara(id, editData);
      toast.success('✓ Cámara actualizada exitosamente');
      setIsEditing(false);
      fetchCamara();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar la cámara';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await camarasService.eliminarCamara(deleteModal.id);
      toast.success('Cámara eliminada correctamente');
      setDeleteModal({ isOpen: false, id: null, nombre: '' });
      navigate('/camaras');
    } catch (error) {
      toast.error('Error al eliminar la cámara');
    } finally {
      setDeleteLoading(false);
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

  if (!camara) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/camaras')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Cámaras
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{camara.nombre}</span>
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
                  <Camera size={28} className="text-white" />
                </div>
                <div>
                  {/* PROPIETARIO: siempre modo lectura */}
                  {esPropietario ? (
                    <h1 className="text-2xl font-bold text-gray-800">{camara.nombre}</h1>
                  ) : isEditing ? (
                    <Input
                      label="Nombre de la Cámara"
                      value={editData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      onBlur={() => handleBlur('nombre')}
                      error={touched.nombre && errors.nombre}
                      required
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-800">{camara.nombre}</h1>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      camara.activa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {camara.activa ? <Wifi size={12} /> : <WifiOff size={12} />}
                      {camara.activa ? 'Activa' : 'Inactiva'}
                    </span>
                    {camara.ubicacion && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <MapPin size={12} />
                        {camara.ubicacion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* ============================================================
                  PROPIETARIO: NO muestra botones de editar/eliminar
                  ADMINISTRADOR: muestra botones normalmente
              ============================================================ */}
              {!esPropietario && (
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button variant="outline" icon={Edit2} onClick={handleEditClick}>
                        Editar
                      </Button>
                      <Button 
                        variant="danger-outline" 
                        icon={Trash2} 
                        onClick={() => setDeleteModal({ isOpen: true, id: camara.id, nombre: camara.nombre })}
                      >
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="secondary" icon={X} onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                      <Button variant="primary" role={userRole} icon={Save} onClick={handleSave} loading={saving}>
                        Guardar Cambios
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stream en vivo */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-teal-600" />
            <h2 className="font-semibold text-gray-800">Stream en Vivo</h2>
          </div>
          <CameraStream 
            camaraId={camara.id} 
            camaraNombre={camara.nombre}
            className="rounded-2xl shadow-lg"
          />
        </div>

        {/* Información de la cámara */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detalles de la Cámara */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Detalles de la Cámara</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* PROPIETARIO: modo solo lectura */}
              {esPropietario ? (
                <>
                  {camara.ubicacion && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Ubicación</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        <p className="text-gray-800">{camara.ubicacion}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">URL del Stream</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Video size={14} className="text-gray-400" />
                      <p className="text-gray-800 font-mono text-sm break-all">{camara.urlStream}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
                    <div className="flex items-center gap-2 mt-1">
                      {camara.activa ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
                      <span className="text-gray-800">{camara.activa ? 'Activa' : 'Inactiva'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de Registro</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-gray-800">
                        {new Date(camara.fechaRegistro).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                </>
              ) : isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Ubicación"
                    value={editData.ubicacion}
                    onChange={(e) => handleChange('ubicacion', e.target.value)}
                    icon={MapPin}
                  />
                  <Input
                    label="URL del Stream"
                    value={editData.urlStream}
                    onChange={(e) => handleChange('urlStream', e.target.value)}
                    onBlur={() => handleBlur('urlStream')}
                    error={touched.urlStream && errors.urlStream}
                    required
                    icon={Video}
                    helperText="Soporta RTSP (rtsp://) o HTTP (http://)"
                  />
                  
                  {/* Estado de la cámara */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800">Cámara Activa</p>
                      <p className="text-sm text-gray-500">La IA comenzará a procesar esta cámara</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('activa', !editData.activa)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editData.activa ? 'bg-teal-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.activa ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {camara.ubicacion && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Ubicación</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        <p className="text-gray-800">{camara.ubicacion}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">URL del Stream</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Video size={14} className="text-gray-400" />
                      <p className="text-gray-800 font-mono text-sm break-all">{camara.urlStream}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
                    <div className="flex items-center gap-2 mt-1">
                      {camara.activa ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
                      <span className="text-gray-800">{camara.activa ? 'Activa' : 'Inactiva'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha de Registro</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-gray-800">
                        {new Date(camara.fechaRegistro).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información del Edificio */}
          {camara.edificio && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Edificio</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-teal-700">
                      {camara.edificio.nombre?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{camara.edificio.nombre}</p>
                    {camara.edificio.direccion && (
                      <p className="text-sm text-gray-500">{camara.edificio.direccion}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error global - solo para ADMINISTRADOR */}
        {!esPropietario && errors.submit && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-700">Error al actualizar</p>
              <p className="text-sm text-red-600 mt-0.5">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Modal de confirmación - solo para ADMINISTRADOR */}
        {!esPropietario && (
          <ConfirmDeleteModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, id: null, nombre: '' })}
            onConfirm={handleDelete}
            title="Eliminar Cámara"
            message="¿Estás seguro de que deseas eliminar esta cámara?"
            itemName={deleteModal.nombre}
            confirmText="Eliminar"
            loading={deleteLoading}
          />
        )}
      </div>
    </Layout>
  );
};

export default VerCamaraPage;