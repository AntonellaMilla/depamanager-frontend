// src/modules/unidades/pages/UnidadesPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Plus, Edit2, Trash2, Users, DoorOpen, 
  Building2, Search, XCircle, Layers, Grid3x3,
  MapPin, Eye, TrendingUp
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';
import { unidadesService } from '../services/unidadesService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const UnidadesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [edificioInfo, setEdificioInfo] = useState(null);

  // Modal de eliminación
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, numero: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Obtener rol y colores
  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // Estadísticas
  const stats = {
    total: unidades.length,
    ocupadas: unidades.filter(u => u.inquilino).length,
    disponibles: unidades.filter(u => !u.inquilino && u.activa).length,
    inactivas: unidades.filter(u => !u.activa).length
  };

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const data = await unidadesService.listarUnidades();
      setUnidades(data);
      
      // Extraer información del edificio (si hay unidades)
      if (data.length > 0 && data[0].edificio) {
        setEdificioInfo(data[0].edificio);
      }
    } catch (error) {
      toast.error('Error al cargar las unidades');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, []);

  // Filtrar unidades por búsqueda
  const unidadesFiltradas = unidades.filter(unidad => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      unidad.numero?.toLowerCase().includes(term) ||
      unidad.piso?.toString().includes(term) ||
      unidad.inquilino?.usuario?.nombres?.toLowerCase().includes(term) ||
      unidad.inquilino?.usuario?.apellidos?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await unidadesService.eliminarUnidad(deleteModal.id);
      toast.success('Unidad desactivada correctamente');
      setDeleteModal({ isOpen: false, id: null, numero: '' });
      fetchUnidades();
    } catch (error) {
      toast.error('Error al desactivar la unidad');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      header: 'Unidad',
      key: 'numero',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{ backgroundColor: roleColors.dark }}
          >
            {value}
          </div>
          <div>
            <p className="font-semibold text-gray-800">Unidad {value}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">Piso {row.piso}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Inquilino',
      key: 'inquilino',
      render: (_, row) => {
        if (!row.inquilino) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <DoorOpen size={12} />
              Disponible
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">
                {row.inquilino.usuario?.nombres?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {row.inquilino.usuario?.nombres} {row.inquilino.usuario?.apellidos}
              </p>
              <p className="text-xs text-gray-400">{row.inquilino.usuario?.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Capacidad',
      key: 'capacidadMaxima',
      render: (value, row) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-400" />
          <span className="text-sm text-gray-700">{value} personas</span>
          <span className="text-xs text-gray-400">

          </span>
        </div>
      )
    },
    {
      header: 'Estado',
      key: 'activa',
      render: (value, row) => {
        if (!value) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <XCircle size={12} />
              Inactiva
            </span>
          );
        }
        if (row.inquilino) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <Home size={12} />
              Ocupada
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <DoorOpen size={12} />
            Disponible
          </span>
        );
      }
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
            onClick={() => navigate(`/unidades/${row.id}`)}
            title="Ver detalles"
          />

          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteModal({ isOpen: true, id: row.id, numero: row.numero })}
            title="Desactivar unidad"
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
                <Home size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Unidades</h1>
                <p className="text-gray-500 mt-1">
                  {edificioInfo ? `Edificio: ${edificioInfo.nombre}` : 'Gestión de unidades del edificio'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {unidades.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Layers size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wider">Ocupadas</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.ocupadas}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Home size={18} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 uppercase tracking-wider">Disponibles</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{stats.disponibles}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <DoorOpen size={18} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-wider">Inactivas</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactivas}</p>
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
                placeholder="Buscar por número, piso o inquilino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            <div className="flex gap-3">

              <Button
                variant="primary"
                role={userRole}
                icon={Plus}
                onClick={() => navigate('/unidades/crear')}
              >
                Nueva Unidad
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={unidadesFiltradas}
            isLoading={loading}
            title="Lista de Unidades"
            searchable={false}
            emptyMessage={unidades.length === 0 ? "No hay unidades registradas" : "No se encontraron unidades con los filtros seleccionados"}
          />
        </div>

        {/* Modal de confirmación de eliminación */}
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null, numero: '' })}
          onConfirm={handleDelete}
          title="Desactivar Unidad"
          message="¿Estás seguro de que deseas desactivar esta unidad?"
          itemName={`Unidad ${deleteModal.numero}`}
          confirmText="Desactivar"
          loading={deleteLoading}
        />
      </div>
    </Layout>
  );
};

export default UnidadesPage;