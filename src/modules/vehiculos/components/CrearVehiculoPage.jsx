// src/modules/vehiculos/pages/CrearVehiculoPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, ArrowLeft, AlertCircle, CheckCircle, User, 
  CreditCard, Paintbrush, Hash, Users, Search
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { vehiculosService } from '../services/vehiculosService';
import { inquilinosService } from '../../inquilinos/services/inquilinosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const CrearVehiculoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquilinos, setInquilinos] = useState([]);
  const [loadingInquilinos, setLoadingInquilinos] = useState(true);
  const [formData, setFormData] = useState({
    placa: '',
    tipo: 'AUTO',
    modelo: '',
    color: '',
    inquilinoId: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [searchInquilino, setSearchInquilino] = useState('');

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

  // Cargar todos los inquilinos (sin filtro de estado de contrato)
  useEffect(() => {
    const fetchInquilinos = async () => {
      try {
        setLoadingInquilinos(true);
        console.log('Intentando cargar inquilinos...');
        const inquilinosData = await inquilinosService.listarInquilinos();
        console.log('Inquilinos recibidos:', inquilinosData);
        console.log('Cantidad de inquilinos:', Array.isArray(inquilinosData) ? inquilinosData.length : 'No es array');
        setInquilinos(inquilinosData);
      } catch (error) {
        toast.error('Error al cargar inquilinos');
        console.error('Error al cargar inquilinos:', error);
        console.error('Error response:', error.response);
      } finally {
        setLoadingInquilinos(false);
      }
    };
    fetchInquilinos();
  }, []);

  // Filtrar inquilinos por búsqueda
  const inquilinosFiltrados = inquilinos.filter(inquilino => {
    if (!searchInquilino) return true;
    const term = searchInquilino.toLowerCase();
    return (
      inquilino.usuario?.nombres?.toLowerCase().includes(term) ||
      inquilino.usuario?.apellidos?.toLowerCase().includes(term) ||
      inquilino.usuario?.dni?.includes(term) ||
      inquilino.usuario?.email?.toLowerCase().includes(term) ||
      inquilino.unidad?.numero?.toLowerCase().includes(term)
    );
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.placa.trim()) newErrors.placa = 'La placa es requerida';
    else if (formData.placa.length < 5) newErrors.placa = 'Placa inválida';
    if (!formData.modelo.trim()) newErrors.modelo = 'El modelo es requerido';
    if (!formData.color.trim()) newErrors.color = 'El color es requerido';
    if (!formData.inquilinoId) newErrors.inquilinoId = 'Debes seleccionar un inquilino';
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
      color: true,
      inquilinoId: true
    });
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setLoading(true);
    try {
      await vehiculosService.crearVehiculo({
        placa: formData.placa.toUpperCase(),
        tipo: formData.tipo,
        modelo: formData.modelo,
        color: formData.color,
        inquilinoId: formData.inquilinoId
      });
      
      toast.success('✓ Vehículo registrado exitosamente');
      navigate('/vehiculos');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar el vehículo';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const inquilinoSeleccionado = inquilinos.find(i => i.id === formData.inquilinoId);

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
          <span className="text-gray-800 font-medium">Registrar Vehículo</span>
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
              <h1 className="text-3xl font-bold text-gray-800">Registrar Vehículo</h1>
              <p className="text-gray-500 mt-1">Registra un nuevo vehículo para un inquilino</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-6">
            {/* Datos del Vehículo */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
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
              </div>
            </div>

            {/* Selección de Inquilino */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Propietario del Vehículo</h2>
                </div>
              </div>
              <div className="p-6">
                {/* Buscador de inquilinos */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar inquilino por nombre, DNI o unidad..."
                    value={searchInquilino}
                    onChange={(e) => setSearchInquilino(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-teal-400"
                  />
                </div>

                <Select
                  label="Seleccionar Inquilino"
                  value={formData.inquilinoId}
                  onChange={(e) => handleChange('inquilinoId', e.target.value)}
                  onBlur={() => handleBlur('inquilinoId')}
                  error={touched.inquilinoId && errors.inquilinoId}
                  options={[
                    { value: '', label: '-- Selecciona un inquilino --' },
                    ...inquilinosFiltrados.map(i => ({
                      value: i.id,
                      label: `${i.usuario?.nombres} ${i.usuario?.apellidos} - Unidad ${i.unidad?.numero} (${i.usuario?.dni})`
                    }))
                  ]}
                  isLoading={loadingInquilinos}
                  required
                  icon={User}
                />

                {inquilinosFiltrados.length === 0 && !loadingInquilinos && searchInquilino && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    No se encontraron inquilinos con esos criterios
                  </p>
                )}

                {/* Información del inquilino seleccionado */}
                {inquilinoSeleccionado && (
                  <div className="mt-4 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                        <User size={18} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {inquilinoSeleccionado.usuario?.nombres} {inquilinoSeleccionado.usuario?.apellidos}
                        </p>
                        <p className="text-sm text-gray-500">
                          Unidad {inquilinoSeleccionado.unidad?.numero} • {inquilinoSeleccionado.usuario?.dni}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error al registrar</p>
                  <p className="text-sm text-red-600 mt-0.5">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Resumen */}
            {(formData.placa || formData.modelo) && (
              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Resumen del vehículo</p>
                    <div className="mt-2 space-y-1 text-sm text-teal-700">
                      {formData.placa && <p>• <strong>Placa:</strong> {formData.placa.toUpperCase()}</p>}
                      {formData.modelo && <p>• <strong>Modelo:</strong> {formData.modelo}</p>}
                      {formData.color && <p>• <strong>Color:</strong> {formData.color}</p>}
                      {inquilinoSeleccionado && (
                        <p>• <strong>Propietario:</strong> {inquilinoSeleccionado.usuario?.nombres} {inquilinoSeleccionado.usuario?.apellidos}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="secondary" onClick={() => navigate('/vehiculos')} size="lg" className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" role={userRole} loading={loading} icon={Car} size="lg" className="flex-1">
                Registrar Vehículo
              </Button>
            </div>
          </div>
        </form>

        {/* Tip informativo */}
        <div className="mt-8 p-5 rounded-2xl border" style={{ backgroundColor: `${roleColors.dark}08`, borderColor: `${roleColors.dark}20` }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${roleColors.dark}15` }}>
              <Car size={16} style={{ color: roleColors.dark }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: roleColors.dark }}>Información importante</p>
              <p className="text-sm text-gray-600 mt-1">
                La placa se guardará automáticamente en mayúsculas. 
                Asegúrate de seleccionar un inquilino con contrato activo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CrearVehiculoPage;