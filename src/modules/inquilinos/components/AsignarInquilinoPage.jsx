// src/modules/inquilinos/pages/AsignarInquilinoPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, ArrowLeft, AlertCircle, CheckCircle, Calendar, 
  Phone, Users, Building2, UserCheck
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Select from '../../../shared/components/ui/Select';
import { inquilinosService } from '../services/inquilinosService';
import { unidadesService } from '../../unidades/services/unidadesService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const AsignarInquilinoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [unidadesDisponibles, setUnidadesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    usuarioId: '',
    unidadId: '',
    fechaInicioContrato: '',
    fechaFinContrato: '',
    nacionalidad: '',
    contactoEmergencia: '',
    telefonoEmergencia: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usuariosData, unidadesData, inquilinosAsignados] = await Promise.all([
          inquilinosService.listarUsuariosInquilinos(),
          unidadesService.listarUnidades(),
          inquilinosService.listarInquilinos().catch(() => [])
        ]);
        
        // Filtrar usuarios que ya tienen unidad asignada
        const usuarioIdsAsignados = new Set(inquilinosAsignados.map(i => i.usuarioId));
        const usuariosDisponibles = usuariosData.filter(u => !usuarioIdsAsignados.has(u.id));
        
        setUsuarios(usuariosDisponibles);
        
        // Filtrar unidades disponibles (activas y sin inquilino)
        const disponibles = unidadesData.filter(u => u.activa && !u.inquilino);
        setUnidadesDisponibles(disponibles);
      } catch (error) {
        toast.error('Error al cargar datos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usuarioId) newErrors.usuarioId = 'Debes seleccionar un usuario';
    if (!formData.unidadId) newErrors.unidadId = 'Debes seleccionar una unidad';
    if (!formData.fechaInicioContrato) newErrors.fechaInicioContrato = 'Fecha de inicio requerida';
    if (!formData.fechaFinContrato) newErrors.fechaFinContrato = 'Fecha de fin requerida';
    
    if (formData.fechaInicioContrato && formData.fechaFinContrato) {
      if (new Date(formData.fechaInicioContrato) >= new Date(formData.fechaFinContrato)) {
        newErrors.fechaFinContrato = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
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
    setTouched({
      usuarioId: true,
      unidadId: true,
      fechaInicioContrato: true,
      fechaFinContrato: true
    });
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor, corrige los errores del formulario');
      return;
    }

    setSubmitting(true);
    try {
      await inquilinosService.asignarInquilino({
        usuarioId: formData.usuarioId,
        unidadId: formData.unidadId,
        fechaInicioContrato: formData.fechaInicioContrato,
        fechaFinContrato: formData.fechaFinContrato,
        nacionalidad: formData.nacionalidad || null,
        contactoEmergencia: formData.contactoEmergencia || null,
        telefonoEmergencia: formData.telefonoEmergencia || null
      });
      
      toast.success('✓ Inquilino asignado exitosamente');
      navigate('/inquilinos');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al asignar el inquilino';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setSubmitting(false);
    }
  };

  const usuarioOptions = [
    { value: '', label: '-- Selecciona un usuario --' },
    ...usuarios.map(u => ({
      value: u.id,
      label: `${u.nombres} ${u.apellidos} - ${u.email}${u.dni ? ` (${u.dni})` : ''}`
    }))
  ];

  const unidadOptions = [
    { value: '', label: '-- Selecciona una unidad --' },
    ...unidadesDisponibles.map(u => ({
      value: u.id,
      label: `Unidad ${u.numero} - Piso ${u.piso} (Cap. ${u.capacidadMaxima} personas)`
    }))
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: `${roleColors.dark} transparent ${roleColors.dark} transparent` }}
            ></div>
            <p className="text-gray-500 font-medium">Cargando datos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/inquilinos')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Inquilinos
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Asignar Inquilino</span>
        </div>

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
              <UserCheck size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Asignar Inquilino</h1>
              <p className="text-gray-500 mt-1">Asigna un usuario inquilino a una unidad</p>
            </div>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="space-y-6">
            {/* Selección de Usuario y Unidad */}
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible">              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Selección</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <Select
                  label="Usuario Inquilino"
                  value={formData.usuarioId}
                  onChange={(e) => handleChange('usuarioId', e.target.value)}
                  onBlur={() => handleBlur('usuarioId')}
                  error={touched.usuarioId && errors.usuarioId}
                  options={usuarioOptions}
                  required
                  icon={Users}
                />

                <Select
                  label="Unidad"
                  value={formData.unidadId}
                  onChange={(e) => handleChange('unidadId', e.target.value)}
                  onBlur={() => handleBlur('unidadId')}
                  error={touched.unidadId && errors.unidadId}
                  options={unidadOptions}
                  required
                  icon={Home}
                />
                {unidadesDisponibles.length === 0 && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    No hay unidades disponibles. Crea una unidad primero.
                  </p>
                )}
              </div>
            </div>

            {/* Datos del Contrato */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Datos del Contrato</h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Fecha de Inicio"
                    type="date"
                    value={formData.fechaInicioContrato}
                    onChange={(e) => handleChange('fechaInicioContrato', e.target.value)}
                    onBlur={() => handleBlur('fechaInicioContrato')}
                    error={touched.fechaInicioContrato && errors.fechaInicioContrato}
                    required
                    icon={Calendar}
                  />
                  <Input
                    label="Fecha de Fin"
                    type="date"
                    value={formData.fechaFinContrato}
                    onChange={(e) => handleChange('fechaFinContrato', e.target.value)}
                    onBlur={() => handleBlur('fechaFinContrato')}
                    error={touched.fechaFinContrato && errors.fechaFinContrato}
                    required
                    icon={Calendar}
                  />
                </div>

                <Input
                  label="Nacionalidad"
                  value={formData.nacionalidad}
                  onChange={(e) => handleChange('nacionalidad', e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contacto de Emergencia"
                    value={formData.contactoEmergencia}
                    onChange={(e) => handleChange('contactoEmergencia', e.target.value)}
                    placeholder="Nombre completo"
                  />
                  <Input
                    label="Teléfono de Emergencia"
                    value={formData.telefonoEmergencia}
                    onChange={(e) => handleChange('telefonoEmergencia', e.target.value)}
                    icon={Phone}
                  />
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error al asignar</p>
                  <p className="text-sm text-red-600 mt-0.5">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="secondary" onClick={() => navigate('/inquilinos')} size="lg" className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" variant="primary" role={userRole} loading={submitting} icon={UserCheck} size="lg" className="flex-1">
                Asignar Inquilino
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AsignarInquilinoPage;