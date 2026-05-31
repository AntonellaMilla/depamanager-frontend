// src/modules/edificios/pages/CrearEdificioPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AlertCircle, MapPin, Info, ArrowLeft, CheckCircle } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { edificiosService } from '../services/edificiosService';
import toast from 'react-hot-toast';

const CrearEdificioPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    distrito: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // Validar campos
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del edificio es requerido';
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    } else if (formData.direccion.length < 5) {
      newErrors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo específico
    if (field === 'nombre' && !formData.nombre.trim()) {
      setErrors(prev => ({ ...prev, nombre: 'El nombre del edificio es requerido' }));
    } else if (field === 'direccion' && !formData.direccion.trim()) {
      setErrors(prev => ({ ...prev, direccion: 'La dirección es requerida' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({
      nombre: true,
      direccion: true,
      ciudad: true,
      provincia: true,
      distrito: true
    });
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, completa los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      await edificiosService.create(formData);
      toast.success('✓ Edificio creado exitosamente');
      navigate('/edificios');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear el edificio';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button 
            onClick={() => navigate('/edificios')} 
            className="hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Edificios
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Crear Edificio</span>
        </div>

        {/* Header con efecto decorativo */}
        <div className="relative mb-8">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-teal-100/30 rounded-full blur-2xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Crear Nuevo Edificio</h1>
              <p className="text-gray-500 mt-1">Registra un nuevo edificio en el sistema</p>
            </div>
          </div>
        </div>

        {/* Formulario principal */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Tarjeta 1: Información Básica */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Información Básica</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <Input
                  label="Nombre del Edificio"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  onBlur={() => handleBlur('nombre')}
                  error={touched.nombre && errors.nombre}
                  required
                  icon={Building2}
                />

                <Input
                  label="Dirección Completa"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  onBlur={() => handleBlur('direccion')}
                  error={touched.direccion && errors.direccion}
                  required
                />
              </div>
            </div>

            {/* Tarjeta 2: Ubicación */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Ubicación Geográfica</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Input
                    label="Ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    error={errors.ciudad}
                  />
                  <Input
                    label="Provincia"
                    name="provincia"
                    value={formData.provincia}
                    onChange={handleChange}
                    error={errors.provincia}
                  />
                  <Input
                    label="Distrito"
                    name="distrito"
                    value={formData.distrito}
                    onChange={handleChange}
                    error={errors.distrito}
                  />
                </div>
              </div>
            </div>

            {/* Error global */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error al crear el edificio</p>
                  <p className="text-sm text-red-600 mt-0.5">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Resumen del formulario */}
            {(formData.nombre || formData.direccion) && (
              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Resumen del edificio</p>
                    <div className="mt-2 space-y-1 text-sm text-teal-700">
                      {formData.nombre && <p>• <strong>Nombre:</strong> {formData.nombre}</p>}
                      {formData.direccion && <p>• <strong>Dirección:</strong> {formData.direccion}</p>}
                      {(formData.ciudad || formData.provincia || formData.distrito) && (
                        <p>• <strong>Ubicación:</strong> {[formData.ciudad, formData.provincia, formData.distrito].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/edificios')}
                size="lg"
                className="flex-1 order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                icon={Building2}
                loading={loading}
                size="lg"
                className="flex-1 order-1 sm:order-2"
              >
                {loading ? 'Creando edificio...' : 'Crear Edificio'}
              </Button>
            </div>
          </div>
        </form>

 
      </div>
    </Layout>
  );
};

export default CrearEdificioPage;