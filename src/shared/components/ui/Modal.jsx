import { X } from 'lucide-react';
import { MODAL_SIZES, getModalVariant } from './config/uiConfig';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer = null,
  size = 'md',
  variant = 'default',
  closeOnBackdropClick = true
}) => {
  if (!isOpen) return null;

  const sizeClass = MODAL_SIZES[size] || MODAL_SIZES.md;
  const variantStyles = getModalVariant(variant);

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleBackdropClick}
    >
      <div className={`${variantStyles.bg} rounded-2xl shadow-2xl w-full ${sizeClass} mx-4 overflow-hidden max-h-screen flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 ${variantStyles.header}`}>
          <h2 className={`text-xl font-semibold ${variantStyles.title}`}>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
            aria-label="Cerrar modal"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-transparent flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;