// src/modules/vehiculos/pages/VerVehiculoPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Car, ArrowLeft, Edit2, Trash2, User, 
  CheckCircle, XCircle, Hash, Paintbrush, Calendar
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';
import { vehiculosService } from '../services/vehiculosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const VerVehiculoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, placa: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchVehiculo = async () => {
    try {
      setLoading(true);
      const data = await vehiculosService.obtenerVehiculo(id);
      setVehiculo(data);
    } catch (error) {
      toast.error('Error al cargar el vehículo');
      navigate('/vehiculos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculo();
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await vehiculosService.eliminarVehiculo(deleteModal.id);
      toast.success('Vehículo eliminado correctamente');
      setDeleteModal({ isOpen: false, id: null, placa: '' });
      navigate('/vehiculos');
    } catch (error) {
      toast.error('Error al eliminar el vehículo');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: `${roleColors.dark} transparent ${roleColors.dark} transparent` }}
            ></div>
            <p className="text-gray-500 font-medium">Cargando información...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!vehiculo) return null;

  const inquilino = vehiculo.inquilino;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/vehiculos')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Vehículos
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{vehiculo.placa}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
                >
                  <Car size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{vehiculo.placa}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {vehiculo.tipo === 'AUTO' ? 'Auto' : 'Moto'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      vehiculo.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {vehiculo.activo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {vehiculo.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={Edit2} onClick={() => navigate(`/vehiculos/${vehiculo.id}/editar`)}>
                  Editar
                </Button>
                <Button 
                  variant="danger-outline" 
                  icon={Trash2} 
                  onClick={() => setDeleteModal({ isOpen: true, id: vehiculo.id, placa: vehiculo.placa })}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Vehículo */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Información del Vehículo</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Placa</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Hash size={14} className="text-gray-400" />
                    <p className="text-lg font-mono font-bold text-gray-800">{vehiculo.placa}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tipo</p>
                  <p className="text-gray-800 mt-1">{vehiculo.tipo === 'AUTO' ? 'Auto' : 'Moto'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Modelo</p>
                <p className="text-gray-800 mt-1">{vehiculo.modelo || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Color</p>
                <div className="flex items-center gap-2 mt-1">
                  <Paintbrush size={14} className="text-gray-400" />
                  <p className="text-gray-800">{vehiculo.color || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Propietario */}
          {inquilino && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Propietario</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-teal-700">
                      {inquilino.usuario?.nombres?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {inquilino.usuario?.nombres} {inquilino.usuario?.apellidos}
                    </h3>
                    <p className="text-sm text-gray-500">Unidad {inquilino.unidad?.numero}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">DNI</p>
                    <p className="text-gray-700">{inquilino.usuario?.dni || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-gray-700">{inquilino.usuario?.telefono || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-700">{inquilino.usuario?.email || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, placa: '' })}
          onConfirm={handleDelete}
          title="Eliminar Vehículo"
          message="¿Estás seguro de que deseas eliminar este vehículo?"
          itemName={deleteModal.placa}
          confirmText="Eliminar"
          loading={deleteLoading}
        />
      </div>
    </Layout>
  );
};

export default VerVehiculoPage;