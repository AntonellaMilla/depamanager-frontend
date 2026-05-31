import { useState, useRef, useEffect } from 'react';
import { MoreVertical, X } from 'lucide-react';

/**
 * Dropdown - Menú desplegable para acciones
 * 
 * @param {Array} items - Array de opciones: { label, icon, onClick, variant }
 * @param {string} variant - 'default' | 'danger' | 'success'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Dropdown = ({ 
  items = [],
  variant = 'default',
  size = 'md',
  trigger = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const itemVariantClasses = {
    default: 'text-gray-700 hover:bg-gray-100',
    danger: 'text-red-600 hover:bg-red-50',
    success: 'text-green-600 hover:bg-green-50'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${sizeClasses[size]} rounded-lg hover:bg-gray-100 transition-colors p-2`}
          aria-label="Más opciones"
        >
          <MoreVertical size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />
        </button>
      )}

      {/* Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-max overflow-hidden">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`
                w-full text-left px-4 py-3 flex items-center gap-2
                transition-colors duration-150
                ${itemVariantClasses[item.variant || 'default']}
                ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}
                hover:bg-opacity-75
              `}
            >
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
