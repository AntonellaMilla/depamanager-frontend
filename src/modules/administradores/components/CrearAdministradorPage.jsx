// src/modules/administradores/components/CrearAdministradorPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, CreditCard, Phone, MapPin, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { administradoresService } from '../services/administradoresService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from '../../../shared/components/layout/config/menuConfig';
import toast from 'react-hot-toast';

const CrearAdministradorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    dni: '',
    telefono: '',
    direccion: '',
    tipoDocumento: 'DNI'
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.length < 2) {
      newErrors.nombres = 'Los nombres deben tener al menos 2 caracteres';
    }
    
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const validations = {
      nombres: () => !formData.nombres.trim() && setErrors(prev => ({ ...prev, nombres: 'Los nombres son requeridos' })),
      apellidos: () => !formData.apellidos.trim() && setErrors(prev => ({ ...prev, apellidos: 'Los apellidos son requeridos' })),
      email: () => {
        if (!formData.email.trim()) {
          setErrors(prev => ({ ...prev, email: 'El email es requerido' }));
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setErrors(prev => ({ ...prev, email: 'Email inválido' }));
        }
      }
    };
    
    if (validations[field]) validations[field]();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      nombres: true,
      apellidos: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setLoading(true);
    try {
      await administradoresService.crearAdministrador({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
        dni: formData.dni || null,
        telefono: formData.telefono || null,
        direccion: formData.direccion || null,
        tipoDocumento: formData.tipoDocumento
      });
      
      toast.success('✓ Administrador creado exitosamente');
      navigate('/administradores');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear el administrador';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const tipoDocumentoOptions = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carnet de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

  const isFormValid = formData.nombres && formData.apellidos && formData.email && formData.password && formData.password === formData.confirmPassword;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button 
            onClick={() => navigate('/administradores')} 
            className="hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Administradores
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Crear Administrador</span>
        </div>

        {/* Header con efecto decorativo */}
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
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Crear Administrador</h1>
              <p className="text-gray-500 mt-1">Registra un nuevo administrador en el sistema</p>
            </div>
          </div>
        </div>

        {/* Formulario principal */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Tarjeta 1: Información Personal */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Información Personal</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    onBlur={() => handleBlur('nombres')}
                    error={touched.nombres && errors.nombres}
                    required
                    icon={User}
                  />
                  <Input
                    label="Apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    onBlur={() => handleBlur('apellidos')}
                    error={touched.apellidos && errors.apellidos}
                    required
                    icon={User}
                  />
                </div>

                <Input
                  label="Correo Electrónico"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email && errors.email}
                  required
                  icon={Mail}
                  placeholder="ejemplo@correo.com"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    error={touched.password && errors.password}
                    required
                    icon={Lock}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                    error={touched.confirmPassword && errors.confirmPassword}
                    required
                    icon={Lock}
                  />
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Documentación y Contacto */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Documentación y Contacto</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Tipo de Documento"
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={(e) => handleChange('tipoDocumento', e.target.value)}
                    options={tipoDocumentoOptions}
                    icon={CreditCard}
                  />
                  <Input
                    label="Número de Documento"
                    name="dni"
                    value={formData.dni}
                    onChange={(e) => handleChange('dni', e.target.value)}
                    icon={CreditCard}
                  />
                </div>

                <Input
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  icon={Phone}
                />

                <Input
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  icon={MapPin}
                />
              </div>
            </div>

            {/* Error global */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fadeIn">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error al crear el administrador</p>
                  <p className="text-sm text-red-600 mt-0.5">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Resumen del formulario */}
            {(formData.nombres || formData.apellidos || formData.email) && (
              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Resumen del administrador</p>
                    <div className="mt-2 space-y-1 text-sm text-teal-700">
                      {formData.nombres && formData.apellidos && (
                        <p>• <strong>Nombre completo:</strong> {formData.nombres} {formData.apellidos}</p>
                      )}
                      {formData.email && <p>• <strong>Email:</strong> {formData.email}</p>}
                      {formData.dni && <p>• <strong>Documento:</strong> {formData.dni}</p>}
                      {formData.telefono && <p>• <strong>Teléfono:</strong> {formData.telefono}</p>}
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
                onClick={() => navigate('/administradores')}
                size="lg"
                className="flex-1 order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                role={userRole}
                disabled={loading || !isFormValid}
                icon={Shield}
                loading={loading}
                size="lg"
                className="flex-1 order-1 sm:order-2"
              >
                {loading ? 'Creando administrador...' : 'Crear Administrador'}
              </Button>
            </div>
          </div>
        </form>

        {/* Tip informativo */}
        <div className="mt-8 p-5 rounded-2xl border"
          style={{ backgroundColor: `${roleColors.dark}08`, borderColor: `${roleColors.dark}20` }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${roleColors.dark}15` }}
            >
              <Shield size={16} style={{ color: roleColors.dark }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: roleColors.dark }}>Información importante</p>
              <p className="text-sm text-gray-600 mt-1">
                Los administradores podrán gestionar unidades, inquilinos y vehículos 
                dentro de los edificios que se les asignen posteriormente.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                  style={{ backgroundColor: `${roleColors.dark}10`, color: roleColors.dark }}
                >
                  🏢 Gestionar unidades
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                  style={{ backgroundColor: `${roleColors.dark}10`, color: roleColors.dark }}
                >
                  👥 Administrar inquilinos
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                  style={{ backgroundColor: `${roleColors.dark}10`, color: roleColors.dark }}
                >
                  🚗 Control vehicular
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CrearAdministradorPage;