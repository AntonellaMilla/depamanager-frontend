// src/shared/components/ui/Select.jsx
import { AlertCircle, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Select = ({
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
  onBlur = null,
  success = false,
  successMessage = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // Tamaños del select
  const sizes = {
    sm: 'py-2 text-sm',
    md: 'py-3 text-base',
    lg: 'py-4 text-lg'
  };

  // Encontrar la opción seleccionada
  const selectedOption = options.find(opt => opt.value === value);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar selección
  const handleSelect = (optionValue) => {
    if (disabled || isLoading) return;
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
    setFocused(false);
  };

  // Manejar foco
  const handleFocus = () => {
    if (disabled || isLoading) return;
    setFocused(true);
    setIsOpen(true);
  };

  // Determinar estilos de borde según estado
  const getBorderStyles = () => {
    if (error) return 'border-red-300 focus:ring-red-500/20 bg-red-50/50';
    if (success) return 'border-green-300 focus:ring-green-500/20 bg-green-50/50';
    if (disabled || isLoading) return 'border-gray-200 bg-gray-50 cursor-not-allowed';
    if (focused || isOpen) return 'border-teal-400 ring-2 ring-teal-500/20';
    return 'border-gray-200 hover:border-gray-300';
  };

  // Determinar estilos de texto
  const getTextStyles = () => {
    if (disabled || isLoading) return 'text-gray-500';
    if (!selectedOption) return 'text-gray-400';
    return 'text-gray-900';
  };

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {/* Label */}
      {label && (
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span>{label}</span>
          {required && <span className="text-red-500 text-xs">*</span>}
          {isLoading && (
            <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </label>
      )}

      {/* Select personalizado */}
      <div className="relative" ref={selectRef} style={{ zIndex: isOpen ? 9998 : 'auto' }}>
        {/* Botón selector */}
        <button
          type="button"
          onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
          onFocus={handleFocus}
          onBlur={onBlur}
          disabled={disabled || isLoading}
          className={`
            w-full
            flex items-center justify-between
            px-4 ${Icon ? 'pl-10' : ''}
            ${sizes[size]}
            bg-white
            border
            rounded-xl
            transition-all duration-200
            cursor-pointer
            ${getBorderStyles()}
            ${disabled || isLoading ? 'cursor-not-allowed' : 'hover:shadow-sm'}
          `}
        >
          <div className="flex items-center gap-3 flex-1">
            {Icon && (
              <Icon 
                size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18} 
                className={`transition-colors ${
                  error ? 'text-red-400' : 
                  success ? 'text-green-500' : 
                  focused || isOpen ? 'text-teal-500' : 'text-gray-400'
                }`}
              />
            )}
            <span className={`flex-1 text-left ${getTextStyles()}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          
          <ChevronDown 
            size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
            className={`transition-all duration-200 text-gray-400 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown flotante */}
        {isOpen && !disabled && !isLoading && (
          <div 
            ref={dropdownRef}
            className="absolute z-[9999] w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden animate-scaleIn"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {/* Opción placeholder */}
              {!selectedOption && (
                <div
                  className="px-4 py-3 text-sm text-gray-400 border-b border-gray-50"
                >
                  {placeholder}
                </div>
              )}
              
              {/* Lista de opciones */}
              {options.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No hay opciones disponibles
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-3 flex items-center justify-between
                      text-sm transition-all duration-150
                      hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent
                      ${option.value === value ? 'bg-teal-50 text-teal-700' : 'text-gray-700'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <option.icon size={16} className="text-gray-400" />
                      )}
                      <span className={option.value === value ? 'font-medium' : ''}>
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-xs text-gray-400">{option.description}</span>
                      )}
                    </div>
                    {option.value === value && (
                      <Check size={16} className="text-teal-500" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mensajes de ayuda */}
      {(helperText || error || (success && successMessage)) && (
        <div className="flex items-start gap-2 mt-1">
          {error && (
            <>
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </>
          )}
          {success && successMessage && !error && (
            <>
              <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
              <p className="text-xs text-green-600">{successMessage}</p>
            </>
          )}
          {helperText && !error && !success && (
            <p className="text-xs text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;