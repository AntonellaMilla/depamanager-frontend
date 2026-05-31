import { Eye, MapPin, User, Phone, Calendar, Home } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import Modal from '../../../shared/components/ui/Modal';

const VerDetallesInquilinoModal = ({ isOpen, onClose, inquilino }) => {
  if (!inquilino) return null;

  const renderizarEstado = (estado) => {
    const estilos = {
      ACTIVO: 'bg-green-100 text-green-700',
      FINALIZADO: 'bg-red-100 text-red-700'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${estilos[estado] || 'bg-gray-100 text-gray-700'}`}>
        {estado}
      </span>
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const footer = (
    <Button variant="outline" onClick={onClose} size="md">
      Cerrar
    </Button>
  );

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Inquilino"
      footer={footer}
      size="lg"
    >
      <div className="space-y-6">
        {/* Información Personal */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            INFORMACIÓN PERSONAL
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Nombre</p>
              <p className="text-sm text-gray-900 font-medium">
                {inquilino.usuario?.nombres} {inquilino.usuario?.apellidos}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Email</p>
              <p className="text-sm text-gray-900 font-medium">{inquilino.usuario?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">DNI</p>
              <p className="text-sm text-gray-900 font-medium">{inquilino.usuario?.dni || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Teléfono</p>
              <p className="text-sm text-gray-900 font-medium">{inquilino.usuario?.telefono || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Nacionalidad</p>
              <p className="text-sm text-gray-900 font-medium">{inquilino.nacionalidad || '-'}</p>
            </div>
          </div>
        </div>

        {/* Información de la Unidad */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Home size={18} className="text-green-600" />
            UNIDAD ASIGNADA
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Número de Unidad</p>
              <p className="text-sm text-gray-900 font-medium">{inquilino.unidad?.numero}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Piso</p>
              <p className="text-sm text-gray-900 font-medium">{inquilino.unidad?.piso}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Capacidad Máxima</p>
              <p className="text-sm text-gray-900 font-medium">{inquilino.unidad?.capacidadMaxima} personas</p>
            </div>
          </div>
        </div>

        {/* Información del Contrato */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-purple-600" />
            INFORMACIÓN DEL CONTRATO
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Fecha Inicio</p>
              <p className="text-sm text-gray-900 font-medium">
                {formatearFecha(inquilino.fechaInicioContrato)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Fecha Fin</p>
              <p className="text-sm text-gray-900 font-medium">
                {formatearFecha(inquilino.fechaFinContrato)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Estado</p>
              <p className="text-sm font-medium">
                {renderizarEstado(inquilino.estadoContrato)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold mb-1">Fecha de Registro</p>
              <p className="text-sm text-gray-900 font-medium">
                {formatearFecha(inquilino.fechaRegistro)}
              </p>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        {(inquilino.contactoEmergencia || inquilino.telefonoEmergencia) && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone size={18} className="text-orange-600" />
              CONTACTO DE EMERGENCIA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Nombre</p>
                <p className="text-sm text-gray-900 font-medium">{inquilino.contactoEmergencia || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Teléfono</p>
                <p className="text-sm text-gray-900 font-medium">{inquilino.telefonoEmergencia || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VerDetallesInquilinoModal;
