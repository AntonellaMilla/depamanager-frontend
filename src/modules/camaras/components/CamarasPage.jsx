// src/modules/camaras/pages/CamarasPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Plus, Eye, Edit2, Trash2, Search, 
  Activity, Wifi, WifiOff, MapPin, Grid3x3, List
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';
import CamaraCard from '../components/CamaraCard';
import { camarasService } from '../services/camarasService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const CamarasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [camaras, setCamaras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  // ============================================================
  // PROPIETARIO solo puede VER, no puede CREAR ni ELIMINAR
  // ============================================================
  const esPropietario = userRole === 'PROPIETARIO';
  const esAdministrador = userRole === 'ADMINISTRADOR';

  const stats = {
    total: camaras.length,
    activas: camaras.filter(c => c.activa).length,
    inactivas: camaras.filter(c => !c.activa).length
  };

  const fetchCamaras = async () => {
    try {
      setLoading(true);
      const data = await camarasService.listarCamaras();
      setCamaras(data);
    } catch (error) {
      toast.error('Error al cargar las cámaras');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamaras();
  }, []);

  const camarasFiltradas = camaras.filter(camara => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      camara.nombre?.toLowerCase().includes(term) ||
      camara.ubicacion?.toLowerCase().includes(term)
    );
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await camarasService.eliminarCamara(deleteModal.id);
      toast.success('Cámara eliminada correctamente');
      setDeleteModal({ isOpen: false, id: null, nombre: '' });
      fetchCamaras();
    } catch (error) {
      toast.error('Error al eliminar la cámara');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewStream = (camara) => {
    navigate(`/camaras/${camara.id}`);
  };

  const handleViewDetails = (camara) => {
    navigate(`/camaras/${camara.id}/detalles`);
  };

  const handleEdit = (camara) => {
    navigate(`/camaras/${camara.id}/editar`);
  };

  const columns = [
    {
      header: 'Cámara',
      key: 'nombre',
      render: (_, row) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleViewStream(row)}>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: roleColors.dark }}
          >
            <Camera size={18} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{row.nombre}</p>
            {row.ubicacion && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-gray-400" />
                <span className="text-xs text-gray-500">{row.ubicacion}</span>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Estado',
      key: 'activa',
      render: (value) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? <Wifi size={12} /> : <WifiOff size={12} />}
          {value ? 'Activa' : 'Inactiva'}
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
            onClick={() => handleViewStream(row)}
            title="Ver stream en vivo"
          />
          {/* PROPIETARIO: NO muestra botón de eliminar */}
          {!esPropietario && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setDeleteModal({ isOpen: true, id: row.id, nombre: row.nombre })}
              title="Eliminar"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            />
          )}
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
                <Camera size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Cámaras</h1>
                <p className="text-gray-500 mt-1">Gestión de cámaras de seguridad del edificio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {camaras.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Camera size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wider">Activas</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.activas}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Wifi size={18} className="text-green-600" />
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
                  <WifiOff size={18} className="text-red-600" />
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
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <List size={18} />
                </button>
              </div>
              {/* PROPIETARIO: NO muestra botón de nueva cámara */}
              {!esPropietario && (
                <Button
                  variant="primary"
                  role={userRole}
                  icon={Plus}
                  onClick={() => navigate('/camaras/crear')}
                >
                  Nueva Cámara
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Vista Grid */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {camarasFiltradas.map((camara) => (
              <CamaraCard
                key={camara.id}
                camara={camara}
                onView={handleViewStream}
                onDelete={!esPropietario ? (c) => setDeleteModal({ isOpen: true, id: c.id, nombre: c.nombre }) : undefined}
                onViewStream={handleViewStream}
                roleColors={roleColors}
                // PROPIETARIO: ocultar acciones adicionales en la tarjeta
                hideActions={esPropietario}
              />
            ))}
          </div>
        )}

        {/* Vista Lista */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Table
              columns={columns}
              data={camarasFiltradas}
              isLoading={loading}
              title="Lista de Cámaras"
              searchable={false}
              emptyMessage={camaras.length === 0 ? "No hay cámaras registradas" : "No se encontraron cámaras con los filtros seleccionados"}
            />
          </div>
        )}

        {/* Modal de confirmación - solo para ADMINISTRADOR */}
        {!esPropietario && (
          <ConfirmDeleteModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, id: null, nombre: '' })}
            onConfirm={handleDelete}
            title="Eliminar Cámara"
            message="¿Estás seguro de que deseas eliminar esta cámara?"
            itemName={deleteModal.nombre}
            confirmText="Eliminar"
            loading={deleteLoading}
          />
        )}
      </div>
    </Layout>
  );
};

export default CamarasPage;