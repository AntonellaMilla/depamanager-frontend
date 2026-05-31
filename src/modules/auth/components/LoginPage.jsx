/**
 * LoginPage.jsx — rediseño visual con AuthLayout
 *
 * Panel de ilustración → DERECHA
 * AuthLayout maneja la animación de viaje entre Login ↔ Register.
 *
 * ⚠️  Lógica, validaciones, handleSubmit, authService → sin tocar.
 */

import { useState } from 'react';
import { useAuth } from '../../../shared/hooks/useAuth';
import { authService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Crown, UserCog, Users } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { AUTH_COLORS } from './config/authConfig';
import toast from 'react-hot-toast';
import AuthLayout from '../../../assets/images/AuthLayout';
import Login1 from '../../../assets/images/Login1.png';
import Ellipse4 from '../../../assets/images/Ellipse 4.png';

/* ─────────────────────────────────────────
   Panel de ilustración (lado derecho)
───────────────────────────────────────── */
const IllustrationPanel = () => (
  <div
    className="relative h-full min-h-105 md:min-h-0 flex flex-col justify-center items-center overflow-hidden"
    style={{ background: AUTH_COLORS.propietario.primary }}
  >
    {/* Franja de roles */}
    <div className="absolute top-0 left-0 w-full flex h-1.5">
      <div className="flex-1" style={{ background: AUTH_COLORS.propietario.primary }} />
      <div className="flex-1" style={{ background: AUTH_COLORS.administrador.primary }} />
      <div className="flex-1" style={{ background: AUTH_COLORS.inquilino.primary }} />
    </div>



    {/* Personaje */}
    <div className="relative z-10 px-8 character-bounce">
      <img
        src={Login1}
        alt="Welcome illustration"
        className="w-150 h-100 object-contain drop-shadow-2xl"
      />
    </div>

    {/* Texto */}
    <div className="relative z-10 text-center px-8 pb-8 text-white">
      <h2 className="text-2xl font-bold mb-1 tracking-tight">¡Bienvenido de nuevo!</h2>
      <p className="text-white/70 text-sm">Nos alegra verte otra vez</p>
    </div>

    {/* Puntos de roles */}
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      <div className="w-2 h-2 rounded-full" style={{ background: AUTH_COLORS.propietario.primary }} />
      <div className="w-2 h-2 rounded-full bg-white opacity-80" />
      <div className="w-2 h-2 rounded-full" style={{ background: AUTH_COLORS.administrador.primary }} />
    </div>

    <style jsx>{`
      @keyframes characterBounce {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-14px); }
      }
      @keyframes circleFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50%       { transform: translateY(-10px) scale(1.03); }
      }
      @keyframes circleFloatSlow {
        0%, 100% { transform: translateY(0); }
        50%       { transform: translateY(-8px); }
      }
      .character-bounce  { animation: characterBounce 5s ease-in-out infinite; }
      .circle-float      { animation: circleFloat 7s ease-in-out infinite; }
      .circle-float-slow { animation: circleFloatSlow 9s ease-in-out infinite; }
    `}</style>
  </div>
);

/* ─────────────────────────────────────────
   Página principal
───────────────────────────────────────── */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'El email es requerido';
    if (!password)     newErrors.password = 'La contraseña es requerida';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    setErrors({});
    try {
      const response = await authService.login(email, password);
      const { usuario, token } = response;
      login(usuario, token);
      toast.success('✓ ¡Inicio de sesión exitoso!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout side="right" illustration={<IllustrationPanel />}>
      <div className="p-10 lg:p-14 flex flex-col justify-center min-h-full">
        <div className="max-w-md mx-auto w-full">

          <div className="mb-2 header-enter">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Bienvenid@ de nuevo!
            </h1>
            <p className="text-gray-400 mt-2 text-base">
              Hola, por favor ingresa tus datos.
            </p>
          </div>

          <div className="flex gap-2 mt-6 mb-8 role-badges-enter">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{ color: AUTH_COLORS.propietario.text, borderColor: AUTH_COLORS.propietario.border, background: AUTH_COLORS.propietario.light }}>
              <Crown size={12} />
              Propietario
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{ color: AUTH_COLORS.administrador.text, borderColor: AUTH_COLORS.administrador.border, background: AUTH_COLORS.administrador.light }}>
              <UserCog size={12} />
              Administrador
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
              style={{ color: AUTH_COLORS.inquilino.text, borderColor: AUTH_COLORS.inquilino.border, background: AUTH_COLORS.inquilino.light }}>
              <Users size={12} />
              Inquilino
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="field-enter field-enter-1">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Correo<span className="text-red-400 ml-0.5">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                error={errors.email}
                placeholder="Ingresa tu correo"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300"
              />
            </div>

            <div className="field-enter field-enter-2">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Contraseña<span className="text-red-400 ml-0.5">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                  error={errors.password}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all duration-200 text-gray-800 placeholder-gray-300 pr-12"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors duration-150">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm field-enter field-enter-3">
              <label className="flex items-center gap-2 cursor-pointer text-gray-500">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-amber-500" />
                Recuerdame
              </label>
              <Link to="/forgot-password" className="font-medium transition-colors duration-150"
                style={{ color: AUTH_COLORS.propietario.primary }}>
                Olvidaste tu contraseña?
              </Link>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 animate-shake">
                {errors.submit}
              </div>
            )}

            <div className="field-enter field-enter-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: AUTH_COLORS.propietario.primary }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    Ingresar
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400 field-enter field-enter-5">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold transition-colors duration-150"
              style={{ color: AUTH_COLORS.propietario.primary }}>
              Regístrate
            </Link>
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
        .field-enter-1 { animation-delay: 0.30s; }
        .field-enter-2 { animation-delay: 0.38s; }
        .field-enter-3 { animation-delay: 0.44s; }
        .field-enter-4 { animation-delay: 0.50s; }
        .field-enter-5 { animation-delay: 0.56s; }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </AuthLayout>
  );
};

export default LoginPage;