// src/modules/vehiculos/pages/VehiculosPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, Plus, Eye, Edit2, Trash2, Search, 
  Activity, XCircle, CheckCircle, Users, Calendar
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';
import { vehiculosService } from '../services/vehiculosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const VehiculosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    id: null, 
    placa: '' 
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // stats will calcularse sobre los vehículos visibles (según rol)

  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      const data = await vehiculosService.listarVehiculos();
      setVehiculos(data);
    } catch (error) {
      toast.error('Error al cargar los vehículos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const vehiculosFiltrados = vehiculos.filter(vehiculo => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      vehiculo.placa?.toLowerCase().includes(term) ||
      vehiculo.modelo?.toLowerCase().includes(term) ||
      vehiculo.color?.toLowerCase().includes(term) ||
      vehiculo.inquilino?.usuario?.nombres?.toLowerCase().includes(term) ||
      vehiculo.inquilino?.usuario?.apellidos?.toLowerCase().includes(term)
    );
  });

  // Aplicar visibilidad por rol (Propietario: todo, Administrador: todo, Inquilino: solo sus vehículos)
  // El backend ya filtra por rol, así que aquí mostramos todo lo que devuelve el backend
  const visibleVehiculos = vehiculos;

  const stats = {
    total: visibleVehiculos.length,
    activos: visibleVehiculos.filter(v => v.activo).length,
    inactivos: visibleVehiculos.filter(v => !v.activo).length
  };

  // Aplicar búsqueda sobre vehículos visibles
  const vehiculosVisiblesFiltrados = visibleVehiculos.filter(vehiculo => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      vehiculo.placa?.toLowerCase().includes(term) ||
      vehiculo.modelo?.toLowerCase().includes(term) ||
      vehiculo.color?.toLowerCase().includes(term) ||
      vehiculo.inquilino?.usuario?.nombres?.toLowerCase().includes(term) ||
      vehiculo.inquilino?.usuario?.apellidos?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await vehiculosService.eliminarVehiculo(deleteModal.id);
      toast.success('Vehículo eliminado correctamente');
      setDeleteModal({ isOpen: false, id: null, placa: '' });
      fetchVehiculos();
    } catch (error) {
      toast.error('Error al eliminar el vehículo');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'AUTO':
        return <Car size={14} className="text-blue-600" />;
      case 'MOTO':
        return <Activity size={14} className="text-green-600" />;
      default:
        return <Car size={14} className="text-gray-600" />;
    }
  };

  const columns = userRole === 'INQUILINO' ? [
    {
      header: 'Vehículo',
      key: 'vehiculo',
      render: (_, row) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/vehiculos/${row.id}`)}>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: roleColors.dark }}
          >
            {row.placa?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{row.placa}</p>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                {getTipoIcon(row.tipo)}
                {row.tipo === 'AUTO' ? 'Auto' : row.tipo === 'MOTO' ? 'Moto' : row.tipo}
              </span>
            </div>
            <p className="text-xs text-gray-500">{row.modelo} - {row.color}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Propietario',
      key: 'propietario',
      render: (_, row) => {
        const inquilino = row.inquilino;
        if (!inquilino) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">
                {inquilino.usuario?.nombres?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {inquilino.usuario?.nombres} {inquilino.usuario?.apellidos}
              </p>
              <p className="text-xs text-gray-400">Unidad {inquilino.unidad?.numero}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Estado',
      key: 'activo',
      render: (value) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ] : [
    {
      header: 'Vehículo',
      key: 'vehiculo',
      render: (_, row) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/vehiculos/${row.id}`)}>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: roleColors.dark }}
          >
            {row.placa?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{row.placa}</p>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                {getTipoIcon(row.tipo)}
                {row.tipo === 'AUTO' ? 'Auto' : row.tipo === 'MOTO' ? 'Moto' : row.tipo}
              </span>
            </div>
            <p className="text-xs text-gray-500">{row.modelo} - {row.color}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Propietario',
      key: 'propietario',
      render: (_, row) => {
        const inquilino = row.inquilino;
        if (!inquilino) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">
                {inquilino.usuario?.nombres?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {inquilino.usuario?.nombres} {inquilino.usuario?.apellidos}
              </p>
              <p className="text-xs text-gray-400">Unidad {inquilino.unidad?.numero}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Estado',
      key: 'activo',
      render: (value) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? <CheckCircle size={12} /> : <XCircle size={12} />}
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      key: 'acciones',
      align: 'center',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/vehiculos/${row.id}`)}
            title="Ver detalles"
          />

          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteModal({ isOpen: true, id: row.id, placa: row.placa })}
            title="Eliminar"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-4">
        {/* Header */}
        <div className="relative mb-8">
          <div 
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${roleColors.dark}20` }}
          ></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
              >
                <Car size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Vehículos</h1>
                <p className="text-gray-500 mt-1">Gestión de vehículos de los inquilinos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {vehiculos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Car size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wider">Activos</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.activos}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-wider">Inactivos</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactivos}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle size={18} className="text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Barra de búsqueda y acciones */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por placa, modelo, color o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            {userRole !== 'INQUILINO' && (
              <Button
                variant="primary"
                role={userRole}
                icon={Plus}
                onClick={() => navigate('/vehiculos/crear')}
              >
                Nuevo Vehículo
              </Button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={vehiculosVisiblesFiltrados}
            isLoading={loading}
            title="Lista de Vehículos"
            searchable={false}
            emptyMessage={visibleVehiculos.length === 0 ? "No hay vehículos registrados" : "No se encontraron vehículos con los filtros seleccionados"}
          />
        </div>

        {/* Modal de confirmación */}
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

export default VehiculosPage;