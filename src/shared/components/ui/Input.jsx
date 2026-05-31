// src/shared/components/ui/Input.jsx
import { AlertCircle, CheckCircle, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';

const Input = ({ 
  label, 
  error, 
  success = false,
  disabled = false,
  hint = '',
  required = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  clearable = false,
  type = 'text',
  size = 'md',
  fullWidth = true,
  value = '',
  onChange,
  onClear,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  // Tamaños del input
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  // Padding según iconos
  const getPadding = () => {
    let padding = '';
    if (Icon && iconPosition === 'left') padding += ' pl-10';
    if (Icon && iconPosition === 'right') padding += ' pr-10';
    if (clearable && value) padding += ' pr-10';
    if (isPassword) padding += ' pr-10';
    return padding;
  };
  
  // Estilos de borde según estado
  const getBorderStyles = () => {
    if (disabled) return 'border-gray-200 bg-gray-50 cursor-not-allowed';
    if (error) return 'border-red-300 focus:ring-red-500/20 bg-red-50/50';
    if (success) return 'border-green-300 focus:ring-green-500/20 bg-green-50/50';
    if (focused) return 'border-teal-400 ring-2 ring-teal-500/20';
    return 'border-gray-200 hover:border-gray-300';
  };
  
  // Estilos de texto
  const getTextStyles = () => {
    if (disabled) return 'text-gray-500';
    if (error) return 'text-red-900';
    return 'text-gray-900';
  };
  
  // Manejar limpieza
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {/* Label con diseño mejorado */}
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {hint && !error && !success && (
            <span className="text-xs text-gray-400">{hint}</span>
          )}
        </div>
      )}
      
      {/* Contenedor del input */}
      <div className="relative group">
        {/* Icono izquierdo */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon 
              size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} 
              className={`transition-colors ${
                error ? 'text-red-400' : 
                success ? 'text-green-500' : 
                focused ? 'text-teal-500' : 'text-gray-400'
              }`}
            />
          </div>
        )}
        
        {/* Input principal */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={`
            w-full
            ${sizes[size]}
            ${getPadding()}
            bg-white
            border
            rounded-xl
            transition-all duration-200
            placeholder:text-gray-400
            ${getBorderStyles()}
            ${getTextStyles()}
            focus:outline-none
            disabled:bg-gray-50
            disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        
        {/* Controles del lado derecho */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
          {/* Botón de limpiar */}
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Limpiar"
            >
              <X size={size === 'sm' ? 14 : 16} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
          
          {/* Botón de mostrar/ocultar contraseña */}
          {isPassword && !disabled && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOff size={size === 'sm' ? 16 : 18} className="text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye size={size === 'sm' ? 16 : 18} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
          
          {/* Icono de validación */}
          {!disabled && !isPassword && (
            <div className="pointer-events-none">
              {error ? (
                <AlertCircle size={size === 'sm' ? 16 : 18} className="text-red-500" />
              ) : success ? (
                <CheckCircle size={size === 'sm' ? 16 : 18} className="text-green-500" />
              ) : null}
            </div>
          )}
          
          {/* Icono derecho personalizado */}
          {Icon && iconPosition === 'right' && !isPassword && (
            <div className="pointer-events-none">
              <Icon 
                size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} 
                className={`transition-colors ${
                  error ? 'text-red-400' : 
                  success ? 'text-green-500' : 
                  focused ? 'text-teal-500' : 'text-gray-400'
                }`}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Mensajes de feedback */}
      {error && (
        <div className="flex items-center gap-2 mt-2 animate-fadeIn">
          <div className="w-1 h-1 rounded-full bg-red-500"></div>
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}
      
      {success && !error && (
        <div className="flex items-center gap-2 mt-2 animate-fadeIn">
          <div className="w-1 h-1 rounded-full bg-green-500"></div>
          <p className="text-xs text-green-600 font-medium">Campo válido</p>
        </div>
      )}
      
      {hint && !error && !success && (
        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;