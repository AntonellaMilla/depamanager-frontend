// src/modules/vehiculos/pages/EditarVehiculoPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Car, ArrowLeft, Save, X, AlertCircle, CheckCircle, 
  Paintbrush, Hash, Users, User
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { vehiculosService } from '../services/vehiculosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const EditarVehiculoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    placa: '',
    tipo: 'AUTO',
    modelo: '',
    color: '',
    activo: true
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

  const tipoOptions = [
    { value: 'AUTO', label: 'Auto' },
    { value: 'MOTO', label: 'Moto' }
  ];

  const fetchVehiculo = async () => {
    try {
      setLoading(true);
      const data = await vehiculosService.obtenerVehiculo(id);
      setVehiculo(data);
      setFormData({
        placa: data.placa || '',
        tipo: data.tipo || 'AUTO',
        modelo: data.modelo || '',
        color: data.color || '',
        activo: data.activo ?? true
      });
    } catch (error) {
      toast.error('Error al cargar el vehículo');
      navigate('/vehiculos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculo();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.placa.trim()) newErrors.placa = 'La placa es requerida';
    else if (formData.placa.length < 5) newErrors.placa = 'Placa inválida';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
    if (!formData.color.trim()) newErrors.color = 'El color es requerido';
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
    setTouched({
      placa: true,
      modelo: true,
      color: true
    });
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setSaving(true);
    try {
      await vehiculosService.actualizarVehiculo(id, {
        placa: formData.placa.toUpperCase(),
        tipo: formData.tipo,
        modelo: formData.modelo,
        color: formData.color,
        activo: formData.activo
      });
      
      toast.success('✓ Vehículo actualizado exitosamente');
      navigate(`/vehiculos/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar el vehículo';
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

  if (!vehiculo) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/vehiculos')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Vehículos
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/vehiculos/${id}`)} className="hover:text-gray-700 transition-colors">
            {vehiculo.placa}
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
              <Car size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Editar Vehículo</h1>
              <p className="text-gray-500 mt-1">Modifica los datos del vehículo {vehiculo.placa}</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-6">
            {/* Datos del Vehículo */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Car size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Datos del Vehículo</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Placa"
                    value={formData.placa}
                    onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('placa')}
                    error={touched.placa && errors.placa}
                    required
                    placeholder="Ej: ABC-123"
                    icon={Hash}
                  />
                  <Select
                    label="Tipo de Vehículo"
                    value={formData.tipo}
                    onChange={(e) => handleChange('tipo', e.target.value)}
                    options={tipoOptions}
                    icon={Car}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Modelo"
                    value={formData.modelo}
                    onChange={(e) => handleChange('modelo', e.target.value)}
                    onBlur={() => handleBlur('modelo')}
                    error={touched.modelo && errors.modelo}
                    required
                    placeholder="Ej: Toyota Corolla"
                  />
                  <Input
                    label="Color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    onBlur={() => handleBlur('color')}
                    error={touched.color && errors.color}
                    required
                    placeholder="Ej: Rojo, Azul, Blanco"
                    icon={Paintbrush}
                  />
                </div>

                {/* Estado del vehículo */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">Vehículo Activo</p>
                    <p className="text-sm text-gray-500">El vehículo puede ser identificado en accesos</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange('activo', !formData.activo)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.activo ? 'bg-teal-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Información del Propietario (solo lectura) */}
            {vehiculo.inquilino && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-teal-600" />
                    <h2 className="font-semibold text-gray-800">Propietario</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <User size={20} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {vehiculo.inquilino.usuario?.nombres} {vehiculo.inquilino.usuario?.apellidos}
                      </p>
                      <p className="text-sm text-gray-500">
                        Unidad {vehiculo.inquilino.unidad?.numero} • {vehiculo.inquilino.usuario?.dni}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              <Button variant="secondary" onClick={() => navigate(`/vehiculos/${id}`)} size="lg" className="flex-1" icon={X}>
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

export default EditarVehiculoPage;