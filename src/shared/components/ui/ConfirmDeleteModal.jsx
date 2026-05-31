// src/shared/components/ui/ConfirmDeleteModalSimple.jsx (versión simple pero elegante)
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from './Button';

const ConfirmDeleteModalSimple = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Eliminar elemento',
  message = '¿Estás seguro de que deseas eliminar este elemento?',
  itemName = null,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-red-50 to-red-100/50 px-6 py-4 border-b border-red-100">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X size={18} className="text-gray-500" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed">{message}</p>
                {itemName && (
                  <p className="mt-2 text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded-lg">
                    "{itemName}"
                  </p>
                )}
                <p className="mt-3 text-xs text-red-600">
                  ⚠️ Esta acción no se puede deshacer
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex gap-3 p-6 pt-0">
            <Button
              variant="outline"
              onClick={onClose}
              fullWidth
              size="md"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
              loading={loading}
              fullWidth
              size="md"
              icon={Trash2}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDeleteModalSimple;