import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, AlertCircle, User } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import Modal from '../../../shared/components/ui/Modal';
import { edificiosService } from '../services/edificiosService';
import { administradoresService } from '../../administradores/services/administradoresService';
import toast from 'react-hot-toast';

const AsignarAdminModal = ({ isOpen, onClose, edificio, onSuccess }) => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [edificios, setEdificios] = useState([]);

  // Cargar administradores al abrir modal
useEffect(() => {
  if (!isOpen) return;

  const loadData = async () => {
    try {
      const [adminsRes, edificiosRes] = await Promise.all([
        administradoresService.listarAdministradores(),
        edificiosService.getAll()
      ]);

      const adminsData = adminsRes?.data?.data || adminsRes?.data || adminsRes || [];
      const edificiosData = edificiosRes?.data?.data || edificiosRes?.data || [];

      setAdmins(adminsData);
      setEdificios(edificiosData);

    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  loadData();
}, [isOpen]);

  const fetchAdmins = async () => {
    try {
      const response = await administradoresService.listarAdministradores();
      const data = response?.data?.data || response?.data || response || [];
      setAdmins(data);
    } catch (error) {
      toast.error('Error al cargar administradores');
      console.error(error);
    }
  };

  const currentAdmin = edificio?.administradores?.[0];

const adminsOcupados = new Set(
  edificios
    .flatMap(e => e.administradores || [])
    .map(a => a.usuarioId)
);

const availableAdmins = admins.filter(admin => {
  const id = admin.id || admin.usuario?.id;
  return !adminsOcupados.has(id);
});




  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAdmin) {
      setErrors({ submit: 'Debes seleccionar un administrador' });
      return;
    }

    setLoading(true);

    try {
      await edificiosService.asignarAdmin(edificio.id, {
        adminId: selectedAdmin
      });

      toast.success('✓ Administrador asignado exitosamente');
      setSelectedAdmin('');
      setErrors({});
      onClose();
      onSuccess?.();
    } catch (error) {
      const message = error.response?.data?.message || 'Error al asignar administrador';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const handleDesasignar = async () => {
    if (!window.confirm('¿Desasignar administrador de este edificio?')) return;

    setLoading(true);
    try {
      // Implementar en backend si es necesario
      toast.success('✓ Administrador desasignado');
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Error al desasignar');
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
        variant="administrador"
        onClick={handleSubmit}
        disabled={loading || !selectedAdmin}
        icon={UserPlus}
        size="md"
      >
        {loading ? 'Asignando...' : 'Asignar Admin'}
      </Button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen}
      onClose={onClose}
      title={currentAdmin ? "Cambiar Administrador" : "Asignar Administrador"}
      footer={footer}
      size="md"
    >
      <div className="space-y-4">
        
        {/* Info edificio */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">🏢 Edificio:</span> {edificio?.nombre}
          </p>
        </div>

        {/* Admin actual */}
        {currentAdmin && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">👤 Administrador Actual</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-700">
                    {currentAdmin.usuario?.nombres?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {currentAdmin.usuario?.nombres} {currentAdmin.usuario?.apellidos}
                  </p>
                  <p className="text-xs text-gray-600">{currentAdmin.usuario?.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* SELECT */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {currentAdmin ? 'Nuevo Administrador' : 'Seleccionar Administrador'}
          </label>

          <select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="">-- Selecciona un administrador --</option>

            {availableAdmins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.nombres} {admin.apellidos} • {admin.email}
              </option>
            ))}
          </select>

          {availableAdmins.length === 0 && admins.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              ℹ️ No hay administradores disponibles. Todos están asignados.
            </p>
          )}
        </div>

      </div>
    </Modal>
  );
};

export default AsignarAdminModal;