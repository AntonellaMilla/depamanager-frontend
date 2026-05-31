// src/modules/unidades/pages/EditarUnidadPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Save, X, Users, AlertCircle, CheckCircle } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { unidadesService } from '../services/unidadesService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const EditarUnidadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unidad, setUnidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    piso: '',
    capacidadMaxima: 2,
    activa: true
  });
  const [errors, setErrors] = useState({});

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchUnidad = async () => {
    try {
      setLoading(true);
      const list = await unidadesService.listarUnidades();
      const unidadData = list.find(u => String(u.id) === String(id));
      
      if (!unidadData) {
        toast.error('Unidad no encontrada');
        navigate('/unidades');
        return;
      }
      
      setUnidad(unidadData);
      setFormData({
        numero: unidadData.numero || '',
        piso: unidadData.piso || '',
        capacidadMaxima: unidadData.capacidadMaxima || 2,
        activa: unidadData.activa ?? true
      });
    } catch (error) {
      toast.error('Error al cargar la unidad');
      navigate('/unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidad();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.numero.trim()) newErrors.numero = 'El número de unidad es requerido';
    if (!formData.piso) newErrors.piso = 'El piso es requerido';
    else if (formData.piso < 0) newErrors.piso = 'El piso debe ser un número positivo';
    if (formData.capacidadMaxima < 1) newErrors.capacidadMaxima = 'La capacidad debe ser al menos 1';
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setSaving(true);
    try {
      await unidadesService.actualizarUnidad(id, {
        numero: formData.numero,
        piso: parseInt(formData.piso),
        capacidadMaxima: parseInt(formData.capacidadMaxima),
        activa: formData.activa
      });
      toast.success('✓ Unidad actualizada exitosamente');
      navigate(`/unidades/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar la unidad';
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/unidades')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Unidades
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/unidades/${id}`)} className="hover:text-gray-700 transition-colors">
            Unidad {unidad?.numero}
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
              <Home size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Editar Unidad</h1>
              <p className="text-gray-500 mt-1">Modifica los datos de la unidad {unidad?.numero}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Home size={18} className="text-teal-600" />
              <h2 className="font-semibold text-gray-800">Datos de la Unidad</h2>
            </div>
          </div>
          <div className="p-6 space-y-5">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
            
            <Input
              label="Número de Unidad"
              value={formData.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              error={errors.numero}
              required

            />
            
            <Input
              label="Piso"
              type="number"
              value={formData.piso}
              onChange={(e) => handleChange('piso', e.target.value)}
              error={errors.piso}
              required

            />
            
            <Input
              label="Capacidad Máxima"
              type="number"
              value={formData.capacidadMaxima}
              onChange={(e) => handleChange('capacidadMaxima', e.target.value)}
              error={errors.capacidadMaxima}
              icon={Users}
              helperText="Número máximo de personas que pueden habitar la unidad"
            />

            {/* Estado de la unidad */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-medium text-gray-800">Unidad Activa</p>
                <p className="text-sm text-gray-500">La unidad estará disponible para asignar inquilinos</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('activa', !formData.activa)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.activa ? 'bg-teal-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.activa ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Resumen */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-teal-800">Resumen de cambios</p>
                  <div className="mt-2 space-y-1 text-sm text-teal-700">
                    <p>• <strong>Número:</strong> {formData.numero}</p>
                    <p>• <strong>Piso:</strong> {formData.piso}</p>
                    <p>• <strong>Capacidad:</strong> {formData.capacidadMaxima} personas</p>
                    <p>• <strong>Estado:</strong> {formData.activa ? 'Activa' : 'Inactiva'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="secondary" onClick={() => navigate(`/unidades/${id}`)} size="lg" className="flex-1" icon={X}>
                Cancelar
              </Button>
              <Button variant="primary" role={userRole} onClick={handleSubmit} loading={saving} icon={Save} size="lg" className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditarUnidadPage;