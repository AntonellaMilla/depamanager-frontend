// src/modules/perfil/pages/EditProfilePage.jsx
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, CreditCard, ArrowLeft, 
  Save, X, AlertCircle, CheckCircle, Shield
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Input from '../../../shared/components/ui/Input';
import Button from '../../../shared/components/ui/Button';
import Select from '../../../shared/components/ui/Select';
import { AuthContext } from '../../../shared/context/AuthContext';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuconfig";
import { perfilService } from '../services/perfilService';
import toast from 'react-hot-toast';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    nombres: user?.nombres || '',
    apellidos: user?.apellidos || '',
    email: user?.email || '',
    dni: user?.dni || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
    tipoDocumento: user?.tipoDocumento || 'DNI',
  });

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const tipoDocumentoOptions = [
    { value: 'DNI', label: 'DNI' },
    { value: 'CE', label: 'Carnet de Extranjería' },
    { value: 'PASAPORTE', label: 'Pasaporte' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos';
    } else if (formData.nombres.length < 2) {
      newErrors.nombres = 'Mínimo 2 caracteres';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    } else if (formData.apellidos.length < 2) {
      newErrors.apellidos = 'Mínimo 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.dni && !/^\d+$/.test(formData.dni)) {
      newErrors.dni = 'DNI debe contener solo números';
    }

    if (formData.telefono && !/^\d+$/.test(formData.telefono.replace(/[\s\-]/g, ''))) {
      newErrors.telefono = 'Teléfono inválido';
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
  };

  const handleSubmit = async () => {
    setTouched({
      nombres: true,
      apellidos: true,
      email: true
    });

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setLoading(true);
    try {
      const response = await perfilService.actualizarPerfil(formData);
      
      // Actualizar contexto
      if (updateUser) {
        updateUser({
          ...user,
          ...response
        });
      }

      toast.success('✓ Perfil actualizado correctamente');
      navigate('/perfil');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error al actualizar perfil';
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
          <button onClick={() => navigate('/perfil')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Perfil
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Editar Perfil</span>
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
              <User size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Editar Perfil</h1>
              <p className="text-gray-500 mt-1">Actualiza tu información personal</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-6">
            {/* Información Personal */}
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
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    onBlur={() => handleBlur('nombres')}
                    error={touched.nombres && errors.nombres}
                    required
                    icon={User}
                    placeholder="Ej: Juan Carlos"
                  />
                  <Input
                    label="Apellidos"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    onBlur={() => handleBlur('apellidos')}
                    error={touched.apellidos && errors.apellidos}
                    required
                    icon={User}
                    placeholder="Ej: Pérez González"
                  />
                </div>

                <Input
                  label="Correo Electrónico"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  error={touched.email && errors.email}
                  required
                  icon={Mail}
                  placeholder="ejemplo@correo.com"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Tipo de Documento"
                    value={formData.tipoDocumento}
                    onChange={(e) => handleChange('tipoDocumento', e.target.value)}
                    options={tipoDocumentoOptions}
                    icon={CreditCard}
                  />
                  <Input
                    label="Número de Documento"
                    value={formData.dni}
                    onChange={(e) => handleChange('dni', e.target.value)}
                    error={touched.dni && errors.dni}
                    icon={CreditCard}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    error={touched.telefono && errors.telefono}
                    icon={Phone}
                    placeholder="Ej: 987654321"
                  />
                  <Input
                    label="Dirección"
                    value={formData.direccion}
                    onChange={(e) => handleChange('direccion', e.target.value)}
                    icon={MapPin}
                    placeholder="Ej: Av. Principal 123, Lima"
                  />
                </div>
              </div>
            </div>

            {/* Error global */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error al actualizar</p>
                  <p className="text-sm text-red-600 mt-0.5">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Resumen */}
            {(formData.nombres || formData.apellidos || formData.email) && (
              <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-800">Resumen de cambios</p>
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

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="secondary" onClick={() => navigate('/perfil')} size="lg" className="flex-1" icon={X}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" role={userRole} loading={loading} icon={Save} size="lg" className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </form>

        {/* Tip informativo */}
        <div className="mt-8 p-5 rounded-2xl border" style={{ backgroundColor: `${roleColors.dark}08`, borderColor: `${roleColors.dark}20` }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${roleColors.dark}15` }}>
              <Shield size={16} style={{ color: roleColors.dark }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: roleColors.dark }}>Información importante</p>
              <p className="text-sm text-gray-600 mt-1">
                Los cambios se aplicarán inmediatamente. Tu información personal es privada y segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfilePage;