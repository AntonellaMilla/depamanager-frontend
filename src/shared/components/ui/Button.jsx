// src/shared/components/ui/Button.jsx
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

import { getRoleColors, ROLES } from "../layout/config/menuConfig";

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  type = 'button',
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  role = null, // Para que herede el color del rol
  ...props 
}, ref) => {
  
  // Obtener colores del rol si se proporciona
  const roleColors = role ? getRoleColors(role) : null;

  // Variantes de estilo - Simples y elegantes
  const getVariantStyles = () => {
    // Color base según rol o por defecto teal
    const primaryColor = roleColors ? roleColors.dark : '#0F766E';
    const primaryHover = roleColors ? roleColors.hover : 'hover:bg-teal-700';
    const primaryLight = roleColors ? roleColors.bg : 'bg-teal-600';

    switch(variant) {
      case 'primary':
        return {
          base: roleColors 
            ? `${primaryLight} text-white ${primaryHover} active:bg-teal-800`
            : 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800',
          focus: 'focus:ring-teal-500/30'
        };
      
      case 'secondary':
        return {
          base: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
          focus: 'focus:ring-gray-400/30'
        };
      
      case 'outline':
        return {
          base: roleColors
            ? `border-2 border-[${primaryColor}] text-[${primaryColor}] hover:bg-[${primaryColor}]/10 active:bg-[${primaryColor}]/20`
            : 'border-2 border-teal-600 text-teal-600 hover:bg-teal-50 active:bg-teal-100',
          focus: 'focus:ring-teal-500/30'
        };
      
      case 'danger':
        return {
          base: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
          focus: 'focus:ring-red-500/30'
        };
      
      case 'danger-outline':
        return {
          base: 'border-2 border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100',
          focus: 'focus:ring-red-500/30'
        };
      
      case 'success':
        return {
          base: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
          focus: 'focus:ring-green-500/30'
        };
      
      case 'warning':
        return {
          base: 'bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700',
          focus: 'focus:ring-yellow-500/30'
        };
      
      case 'ghost':
        return {
          base: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
          focus: 'focus:ring-gray-400/30'
        };
      
      default:
        return {
          base: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800',
          focus: 'focus:ring-teal-500/30'
        };
    }
  };

  // Tamaños elegantes
  const sizes = {
    xs: 'px-3 py-1.5 text-xs gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2',
    xl: 'px-8 py-4 text-xl gap-3'
  };

  const iconSizes = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = sizes[size] || sizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`
        relative
        inline-flex
        items-center
        justify-center
        font-medium
        rounded-xl
        transition-all
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        active:scale-[0.97]
        ${variantStyles.base}
        ${variantStyles.focus}
        ${sizeStyles}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 size={iconSizes[size]} className="animate-spin" />
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} strokeWidth={1.75} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} strokeWidth={1.75} />}
        </div>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;