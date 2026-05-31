import { useState, useEffect } from 'react';
import { Users, AlertCircle, Calendar } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Modal from '../../../shared/components/ui/Modal';
import { inquilinosService } from '../services/inquilinosService';
import toast from 'react-hot-toast';

const EditarInquilinoModal = ({ isOpen, onClose, inquilino, onSuccess }) => {
  const [formData, setFormData] = useState({
    nacionalidad: '',
    contactoEmergencia: '',
    telefonoEmergencia: '',
    fechaInicioContrato: '',
    fechaFinContrato: '',
    estadoContrato: 'ACTIVO'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Sincronizar formData cuando el inquilino cambia
  useEffect(() => {
    if (inquilino && isOpen) {
      setFormData({
        nacionalidad: inquilino.nacionalidad || '',
        contactoEmergencia: inquilino.contactoEmergencia || '',
        telefonoEmergencia: inquilino.telefonoEmergencia || '',
        fechaInicioContrato: inquilino.fechaInicioContrato?.split('T')[0] || '',
        fechaFinContrato: inquilino.fechaFinContrato?.split('T')[0] || '',
        estadoContrato: inquilino.estadoContrato || 'ACTIVO'
      });
      setErrors({});
    }
  }, [inquilino, isOpen]);

  // Validar campos
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fechaInicioContrato) {
      newErrors.fechaInicioContrato = 'La fecha de inicio es requerida';
    }
    if (!formData.fechaFinContrato) {
      newErrors.fechaFinContrato = 'La fecha de fin es requerida';
    }
    if (formData.fechaInicioContrato && formData.fechaFinContrato && 
        new Date(formData.fechaInicioContrato) >= new Date(formData.fechaFinContrato)) {
      newErrors.fechaFinContrato = 'La fecha de fin debe ser posterior a la de inicio';
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await inquilinosService.update(inquilino.id, formData);
      toast.success('✓ Inquilino actualizado exitosamente');
      onClose();
      onSuccess?.();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar el inquilino';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      <Button
        variant="outline"
        onClick={onClose}
        disabled={loading}
        size="md"
      >
        Cancelar
      </Button>
      <Button
        variant="secondary"
        onClick={handleSubmit}
        disabled={loading}
        icon={Users}
        size="md"
      >
        {loading ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Inquilino"
      footer={footer}
      size="md"
    >
      <div className="space-y-4">
        {/* Error global */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del Inquilino (solo lectura) */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold mb-2">INFORMACIÓN DEL INQUILINO</p>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Nombre:</span> {inquilino?.usuario?.nombres} {inquilino?.usuario?.apellidos}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Email:</span> {inquilino?.usuario?.email}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Unidad:</span> {inquilino?.unidad?.numero}
              </p>
            </div>
          </div>

          <Input
            label="Nacionalidad"
            name="nacionalidad"
            value={formData.nacionalidad}
            onChange={handleChange}
            error={errors.nacionalidad}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contacto de Emergencia"
              name="contactoEmergencia"
              value={formData.contactoEmergencia}
              onChange={handleChange}
              error={errors.contactoEmergencia}
              placeholder="Nombre del contacto"
            />
            <Input
              label="Teléfono de Emergencia"
              name="telefonoEmergencia"
              value={formData.telefonoEmergencia}
              onChange={handleChange}
              error={errors.telefonoEmergencia}
              placeholder="+51 999 999 999"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Fecha Inicio Contrato"
              name="fechaInicioContrato"
              type="date"
              value={formData.fechaInicioContrato}
              onChange={handleChange}
              error={errors.fechaInicioContrato}
              icon={Calendar}
              required
            />
            <Input
              label="Fecha Fin Contrato"
              name="fechaFinContrato"
              type="date"
              value={formData.fechaFinContrato}
              onChange={handleChange}
              error={errors.fechaFinContrato}
              icon={Calendar}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado del Contrato *
            </label>
            <select
              name="estadoContrato"
              value={formData.estadoContrato}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              <option value="ACTIVO">Activo</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditarInquilinoModal;
