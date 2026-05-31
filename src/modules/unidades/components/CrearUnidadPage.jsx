// src/modules/unidades/pages/CrearUnidadPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle, CheckCircle, Users, TrendingUp, Grid3x3 } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { unidadesService } from '../services/unidadesService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const CrearUnidadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState('individual');
  const [formData, setFormData] = useState({
    numero: '',
    piso: '',
    capacidadMaxima: 2
  });
  const [rangoData, setRangoData] = useState({
    desde: '',
    hasta: '',
    piso: '',
    capacidadMaxima: 2
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const validateIndividual = () => {
    const newErrors = {};
    if (!formData.numero.trim()) newErrors.numero = 'El número de unidad es requerido';
    if (!formData.piso) newErrors.piso = 'El piso es requerido';
    else if (formData.piso < 0) newErrors.piso = 'El piso debe ser un número positivo';
    if (formData.capacidadMaxima < 1) newErrors.capacidadMaxima = 'La capacidad debe ser al menos 1';
    return newErrors;
  };

  const validateRango = () => {
    const newErrors = {};
    if (!rangoData.desde) newErrors.desde = 'El número inicial es requerido';
    if (!rangoData.hasta) newErrors.hasta = 'El número final es requerido';
    if (rangoData.desde && rangoData.hasta && parseInt(rangoData.desde) > parseInt(rangoData.hasta)) {
      newErrors.desde = 'El número inicial debe ser menor o igual al final';
    }
    if (!rangoData.piso) newErrors.piso = 'El piso es requerido';
    else if (rangoData.piso < 0) newErrors.piso = 'El piso debe ser un número positivo';
    if (rangoData.capacidadMaxima < 1) newErrors.capacidadMaxima = 'La capacidad debe ser al menos 1';
    return newErrors;
  };

  const handleIndividualChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleRangoChange = (field, value) => {
    setRangoData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmitIndividual = async () => {
    setTouched({ numero: true, piso: true });
    const newErrors = validateIndividual();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setLoading(true);
    try {
      await unidadesService.crearUnidad({
        numero: formData.numero,
        piso: parseInt(formData.piso),
        capacidadMaxima: parseInt(formData.capacidadMaxima)
      });
      toast.success('✓ Unidad creada exitosamente');
      navigate('/unidades');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear la unidad';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRango = async () => {
    const newErrors = validateRango();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setLoading(true);
    try {
      await unidadesService.crearUnidadesPorRango(
        parseInt(rangoData.desde),
        parseInt(rangoData.hasta),
        parseInt(rangoData.piso),
        parseInt(rangoData.capacidadMaxima)
      );
      const cantidad = parseInt(rangoData.hasta) - parseInt(rangoData.desde) + 1;
      toast.success(`✓ ${cantidad} unidades creadas exitosamente`);
      navigate('/unidades');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear las unidades';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const cantidadUnidades = () => {
    if (rangoData.desde && rangoData.hasta) {
      return parseInt(rangoData.hasta) - parseInt(rangoData.desde) + 1;
    }
    return 0;
  };

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
          <span className="text-gray-800 font-medium">Crear Unidad</span>
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
              <h1 className="text-3xl font-bold text-gray-800">Crear Unidad</h1>
              <p className="text-gray-500 mt-1">Registra una nueva unidad en el edificio</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveMode('individual')}
              className={`pb-3 px-2 font-medium transition-all duration-200 flex items-center gap-2 ${
                activeMode === 'individual'
                  ? `border-b-2 text-[${roleColors.dark}] border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Home size={16} />
              Creación Individual
            </button>
            <button
              onClick={() => setActiveMode('rango')}
              className={`pb-3 px-2 font-medium transition-all duration-200 flex items-center gap-2 ${
                activeMode === 'rango'
                  ? `border-b-2 text-[${roleColors.dark}] border-[${roleColors.dark}]`
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3x3 size={16} />
              Creación por Rango
            </button>
          </div>
        </div>

        {/* Modo Individual */}
        {activeMode === 'individual' && (
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
                onChange={(e) => handleIndividualChange('numero', e.target.value)}
                error={errors.numero}
                required

              />
              
              <Input
                label="Piso"
                type="number"
                value={formData.piso}
                onChange={(e) => handleIndividualChange('piso', e.target.value)}
                error={errors.piso}
                required

              />
              
              <Input
                label="Capacidad Máxima"
                type="number"
                value={formData.capacidadMaxima}
                onChange={(e) => handleIndividualChange('capacidadMaxima', e.target.value)}
                error={errors.capacidadMaxima}
                icon={Users}
                helperText="Número máximo de personas que pueden habitar la unidad"
              />

              {formData.numero && formData.piso && (
                <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-teal-800">Resumen de la unidad</p>
                      <div className="mt-2 space-y-1 text-sm text-teal-700">
                        <p>• <strong>Número:</strong> {formData.numero}</p>
                        <p>• <strong>Piso:</strong> {formData.piso}</p>
                        <p>• <strong>Capacidad:</strong> {formData.capacidadMaxima} personas</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="secondary" onClick={() => navigate('/unidades')} size="lg" className="flex-1">
                  Cancelar
                </Button>
                <Button variant="primary" role={userRole} onClick={handleSubmitIndividual} loading={loading} icon={Home} size="lg" className="flex-1">
                  {loading ? 'Creando unidad...' : 'Crear Unidad'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modo Rango */}
        {activeMode === 'rango' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Grid3x3 size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Creación por Rango</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5" />
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                <TrendingUp size={16} className="text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Crearás <strong>{cantidadUnidades() || 'varias'}</strong> unidades de una sola vez.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Número Inicial" type="number" value={rangoData.desde} onChange={(e) => handleRangoChange('desde', e.target.value)} error={errors.desde}  />
                <Input label="Número Final" type="number" value={rangoData.hasta} onChange={(e) => handleRangoChange('hasta', e.target.value)} error={errors.hasta} />
              </div>
              
              <Input label="Piso" type="number" value={rangoData.piso} onChange={(e) => handleRangoChange('piso', e.target.value)} error={errors.piso}  />
              
              <Input label="Capacidad Máxima (por unidad)" type="number" value={rangoData.capacidadMaxima} onChange={(e) => handleRangoChange('capacidadMaxima', e.target.value)} error={errors.capacidadMaxima} icon={Users} helperText="Aplicará para todas las unidades creadas" />

              {rangoData.desde && rangoData.hasta && rangoData.piso && (
                <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-teal-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-teal-800">Resumen de creación</p>
                      <div className="mt-2 space-y-1 text-sm text-teal-700">
                        <p>• <strong>Rango:</strong> {rangoData.desde} - {rangoData.hasta}</p>
                        <p>• <strong>Cantidad:</strong> {cantidadUnidades()} unidades</p>
                        <p>• <strong>Piso:</strong> {rangoData.piso}</p>
                        <p>• <strong>Capacidad:</strong> {rangoData.capacidadMaxima} personas por unidad</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="secondary" onClick={() => navigate('/unidades')} size="lg" className="flex-1">
                  Cancelar
                </Button>
                <Button variant="primary" role={userRole} onClick={handleSubmitRango} loading={loading} icon={Grid3x3} size="lg" className="flex-1">
                  {loading ? 'Creando unidades...' : `Crear ${cantidadUnidades()} unidades`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CrearUnidadPage;