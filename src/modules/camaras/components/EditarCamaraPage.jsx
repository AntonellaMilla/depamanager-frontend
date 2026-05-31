// src/modules/camaras/pages/EditarCamaraPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Camera, ArrowLeft, Save, X, AlertCircle, CheckCircle, 
  MapPin, Video, Wifi, WifiOff
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { camarasService } from '../services/camarasService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const EditarCamaraPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [camara, setCamara] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    urlStream: '',
    activa: true
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchCamara = async () => {
    try {
      setLoading(true);
      const data = await camarasService.obtenerCamara(id);
      setCamara(data);
      setFormData({
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
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.urlStream.trim()) newErrors.urlStream = 'La URL del stream es requerida';
    else if (!formData.urlStream.startsWith('rtsp://') && !formData.urlStream.startsWith('http://')) {
      newErrors.urlStream = 'URL debe comenzar con rtsp:// o http://';
    }
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    setTouched({ nombre: true, urlStream: true });
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setSaving(true);
    try {
      await camarasService.actualizarCamara(id, formData);
      toast.success('✓ Cámara actualizada exitosamente');
      navigate(`/camaras/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar la cámara';
      toast.error(message);
      setErrors({ submit: message });
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

  if (!camara) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/camaras')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Cámaras
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/camaras/${id}`)} className="hover:text-gray-700 transition-colors">
            {camara.nombre}
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Editar</span>
        </div>

        {/* Header */}
        <div className="relative mb-8">
          <div 
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${roleColors.dark}20` }}
          ></div>
          <div className="relative flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
            >
              <Camera size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Editar Cámara</h1>
              <p className="text-gray-500 mt-1">Modifica los datos de la cámara</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Camera size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Datos de la Cámara</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <Input
                  label="Nombre de la Cámara"
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  onBlur={() => handleBlur('nombre')}
                  error={touched.nombre && errors.nombre}
                  required
                  icon={Camera}
                />

                <Input
                  label="Ubicación"
                  value={formData.ubicacion}
                  onChange={(e) => handleChange('ubicacion', e.target.value)}
                  icon={MapPin}
                />

                <Input
                  label="URL del Stream"
                  value={formData.urlStream}
                  onChange={(e) => handleChange('urlStream', e.target.value)}
                  onBlur={() => handleBlur('urlStream')}
                  error={touched.urlStream && errors.urlStream}
                  required
                  icon={Video}
                  helperText="Soporta RTSP (rtsp://) o HTTP (http://)"
                />

                {/* Estado de la cámara */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-medium text-gray-800">Cámara Activa</p>
                    <p className="text-sm text-gray-500">La IA comenzará a procesar esta cámara</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('activa', !formData.activa)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.activa ? 'bg-teal-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.activa ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error al actualizar</p>
                  <p className="text-sm text-red-600 mt-0.5">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="secondary" onClick={() => navigate(`/camaras/${id}`)} size="lg" className="flex-1" icon={X}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" role={userRole} loading={saving} icon={Save} size="lg" className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditarCamaraPage;