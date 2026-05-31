// src/shared/components/ui/SelectNative.jsx (versión nativa simplificada)
import { AlertCircle } from 'lucide-react';

const SelectNative = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  isLoading = false,
  placeholder = 'Selecciona una opción',
  required = false,
  icon: Icon,
  size = 'md',
  fullWidth = true,
  helperText = null,
  success = false
}) => {
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const getBorderStyles = () => {
    if (error) return 'border-red-300 focus:ring-red-500/20 bg-red-50/50';
    if (success) return 'border-green-300 focus:ring-green-500/20 bg-green-50/50';
    if (disabled || isLoading) return 'border-gray-200 bg-gray-50';
    return 'border-gray-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20';
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500 text-xs">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || isLoading}
          className={`
            w-full
            appearance-none
            ${Icon ? 'pl-10' : 'px-4'}
            pr-10
            ${sizes[size]}
            bg-white
            border
            rounded-xl
            transition-all duration-200
            ${getBorderStyles()}
            ${disabled || isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-900'}
            focus:outline-none
          `}
        >
          <option value="" disabled className="text-gray-400">
            {isLoading ? 'Cargando...' : placeholder}
          </option>
          
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Flecha personalizada */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {(error || helperText) && (
        <div className="flex items-start gap-2 mt-1">
          {error && (
            <>
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </>
          )}
          {helperText && !error && (
            <p className="text-xs text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectNative;