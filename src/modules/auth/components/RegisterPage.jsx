/**
 * RegisterPage.jsx  — rediseño visual
 *
 * Panel de ilustración → IZQUIERDA (espejo del LoginPage que lo tiene a la derecha)
 * Usa AuthLayout para la animación de "viaje" del panel entre rutas.
 *
 * ⚠️  Lógica, validaciones, handleSubmit, authService → sin tocar.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, ArrowRight, Eye, EyeOff, UserCog, Users } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { AUTH_COLORS } from './config/authConfig';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import AuthLayout from '../../../assets/images/AuthLayout';
import Login1 from '../../../assets/images/Login2.png';
import Ellipse4 from '../../../assets/images/Ellipse 4.png';

/* ─────────────────────────────────────────
   Panel de ilustración (lado izquierdo)
───────────────────────────────────────── */
const IllustrationPanel = () => (
  <div
    className="relative h-full min-h-105 md:min-h-0 flex flex-col justify-center items-center overflow-hidden"
    style={{ background: AUTH_COLORS.propietario.primary }}
  >
    {/* Franja de roles — ahora en el lado izquierdo */}
    <div className="absolute top-0 left-0 w-full flex h-1.5">
      <div className="flex-1" style={{ background: AUTH_COLORS.propietario.primary }} />
      <div className="flex-1" style={{ background: AUTH_COLORS.administrador.primary }} />
      <div className="flex-1" style={{ background: AUTH_COLORS.inquilino.primary }} />
    </div>



    {/* Personaje */}
    <div className="relative z-10 px-8 character-bounce">
      <img
        src={Login1}
        alt="Register illustration"
        className="w-150 h-120 object-contain drop-shadow-2xl"
        style={{ transform: 'scaleX(-1)' }}   /* espejo horizontal del personaje */
      />
    </div>

    {/* Texto */}
    <div className="relative z-10 text-center px-8 pb-8 text-white">
      <h2 className="text-2xl font-bold mb-1 tracking-tight">¡Únete ahora!</h2>
      <p className="text-white/70 text-sm">Crea tu cuenta en segundos</p>
    </div>

    {/* Puntos de roles */}
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      <div className="w-2 h-2 rounded-full" style={{ background: AUTH_COLORS.propietario.primary }} />
      <div className="w-2 h-2 rounded-full bg-white opacity-80" />
      <div className="w-2 h-2 rounded-full" style={{ background: AUTH_COLORS.administrador.primary }} />
    </div>

    <style jsx>{`
      @keyframes characterBounce {
        0%, 100% { transform: scaleX(-1) translateY(0); }
        50%       { transform: scaleX(-1) translateY(-14px); }
      }
      @keyframes circleFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50%       { transform: translateY(-10px) scale(1.03); }
      }
      @keyframes circleFloatSlow {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-8px); }
      }
      .character-bounce { animation: characterBounce 5s ease-in-out infinite; }
      .circle-float     { animation: circleFloat 7s ease-in-out infinite; }
      .circle-float-slow { animation: circleFloatSlow 9s ease-in-out infinite; }
    `}</style>
  </div>
);

/* ─────────────────────────────────────────
   Página principal
───────────────────────────────────────── */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    dni: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /* ── Validación (sin tocar) ── */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombres.trim())    newErrors.nombres = 'El nombre es requerido';
    if (!formData.apellidos.trim())  newErrors.apellidos = 'El apellido es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim())            newErrors.email = 'El email es requerido';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password)                newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (formData.dni && formData.dni.length < 3) newErrors.dni = 'DNI inválido';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  /* ── Submit (sin tocar) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    setErrors({});
    try {
      await authService.register({
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || null,
        dni: formData.dni || null
      });
      toast.success('✓ Cuenta creada exitosamente. Iniciando sesión...');
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear la cuenta';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side="left" illustration={<IllustrationPanel />}>
      {/* ── Formulario ── */}
      <div className="p-10 lg:p-12 flex flex-col justify-center min-h-full">
        <div className="max-w-md mx-auto w-full">

          {/* Header */}
          <div className="mb-2 header-enter">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Nuevo Propietario
            </h1>
            <p className="text-gray-400 mt-2 text-base">
              Crea tu cuenta para gestionar edificios
            </p>
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-2 gap-3 field-enter field-enter-1">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Nombres<span className="text-red-400 ml-0.5">*</span>
                </label>
                <Input
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  error={errors.nombres}
                  placeholder="Ingresa tus nombres"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Apellidos<span className="text-red-400 ml-0.5">*</span>
                </label>
                <Input
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  error={errors.apellidos}
                  placeholder="Ingresa tus apellidos"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="field-enter field-enter-2">
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                Correo Electrónico<span className="text-red-400 ml-0.5">*</span>
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Ingresa tu correo"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 text-sm"
              />
            </div>

            {/* Teléfono y DNI */}
            <div className="grid grid-cols-2 gap-3 field-enter field-enter-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Teléfono <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </label>
                <Input
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={errors.telefono}
                  placeholder="Número de teléfono"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  DNI <span className="text-gray-400 font-normal text-xs"></span>
                </label>
                <Input
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  error={errors.dni}
                  placeholder="Número de documento"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 text-sm"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="grid grid-cols-2 gap-3 field-enter field-enter-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Contraseña<span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1 pl-1">Mínimo 6 caracteres</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  Confirmar<span className="text-red-400 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 text-sm pr-10"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 animate-shake">
                {errors.submit}
              </div>
            )}

            {/* Botón submit — color propietario */}
            <div className="field-enter field-enter-5">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: AUTH_COLORS.propietario.primary }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <Crown size={18} />
                    Crear Cuenta
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center field-enter field-enter-6">
            <p className="text-sm text-gray-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-semibold transition-colors duration-150 inline-flex items-center gap-1"
                style={{ color: AUTH_COLORS.propietario.primary }}
              >
                Iniciar sesión
                <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes headerEnter {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgesEnter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fieldEnter {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }

        .header-enter      { animation: headerEnter 0.4s ease-out 0.2s both; }
        .role-badges-enter { animation: badgesEnter 0.4s ease-out 0.3s both; }

        .field-enter   { animation: fieldEnter 0.35s ease-out both; }
        .field-enter-1 { animation-delay: 0.35s; }
        .field-enter-2 { animation-delay: 0.42s; }
        .field-enter-3 { animation-delay: 0.48s; }
        .field-enter-4 { animation-delay: 0.54s; }
        .field-enter-5 { animation-delay: 0.60s; }
        .field-enter-6 { animation-delay: 0.66s; }

        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </AuthLayout>
  );
};

export default RegisterPage;