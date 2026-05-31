// src/modules/inquilinos/pages/InquilinosPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Plus, Eye, Edit2, Trash2, Mail, Phone, 
  Calendar, Home, Search, XCircle, UserCheck, Building2,
  UserPlus, UserCog
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';
import { inquilinosService } from '../services/inquilinosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const InquilinosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inquilinos, setInquilinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [finalizarModal, setFinalizarModal] = useState({ 
    isOpen: false, 
    id: null, 
    nombre: '' 
  });
  const [finalizando, setFinalizando] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const stats = {
    total: inquilinos.length,
    activos: inquilinos.filter(i => i.estadoContrato === 'ACTIVO').length,
    finalizados: inquilinos.filter(i => i.estadoContrato === 'FINALIZADO').length
  };

  const fetchInquilinos = async () => {
    try {
      setLoading(true);
      const data = await inquilinosService.listarInquilinos();
      setInquilinos(data);
    } catch (error) {
      toast.error('Error al cargar los inquilinos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquilinos();
  }, []);

  const inquilinosFiltrados = inquilinos.filter(inquilino => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      inquilino.usuario?.nombres?.toLowerCase().includes(term) ||
      inquilino.usuario?.apellidos?.toLowerCase().includes(term) ||
      inquilino.usuario?.email?.toLowerCase().includes(term) ||
      inquilino.usuario?.dni?.includes(term) ||
      inquilino.unidad?.numero?.toLowerCase().includes(term)
    );
  });

  const handleFinalizarContrato = async () => {
    setFinalizando(true);
    try {
      await inquilinosService.finalizarContrato(finalizarModal.id);
      toast.success('Contrato finalizado correctamente');
      setFinalizarModal({ isOpen: false, id: null, nombre: '' });
      fetchInquilinos();
    } catch (error) {
      toast.error('Error al finalizar el contrato');
    } finally {
      setFinalizando(false);
    }
  };

  const columns = [
    {
      header: 'Inquilino',
      key: 'nombre',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: roleColors.dark }}
          >
            {row.usuario?.nombres?.charAt(0).toUpperCase()}{row.usuario?.apellidos?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {row.usuario?.nombres} {row.usuario?.apellidos}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Mail size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{row.usuario?.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Documento',
      key: 'dni',
      render: (_, row) => row.usuario?.dni || '-'
    },
    {
      header: 'Teléfono',
      key: 'telefono',
      render: (_, row) => row.usuario?.telefono || '-'
    },
    {
      header: 'Unidad',
      key: 'unidad',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Home size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-800">Unidad {row.unidad?.numero}</span>
        </div>
      )
    },
    {
      header: 'Contrato',
      key: 'estadoContrato',
      render: (value, row) => (
        <div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            value === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {value === 'ACTIVO' ? 'Activo' : 'Finalizado'}
          </span>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(row.fechaInicioContrato).toLocaleDateString('es-PE')}
          </p>
        </div>
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
            onClick={() => navigate(`/inquilinos/${row.id}`)}
            title="Ver detalles"
          />
          {row.estadoContrato === 'ACTIVO' && (
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setFinalizarModal({ 
                isOpen: true, 
                id: row.id, 
                nombre: `${row.usuario?.nombres} ${row.usuario?.apellidos}` 
              })}
              title="Finalizar contrato"
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
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Inquilinos</h1>
                <p className="text-gray-500 mt-1">Gestión de inquilinos del edificio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {inquilinos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Users size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 uppercase tracking-wider">Contratos Activos</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.activos}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <UserCheck size={18} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 uppercase tracking-wider">Finalizados</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{stats.finalizados}</p>
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
                placeholder="Buscar por nombre, email, DNI o unidad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                icon={UserCog}
                onClick={() => navigate('/inquilinos/asignar')}
              >
                Asignar Existente
              </Button>
              <Button
                variant="primary"
                role={userRole}
                icon={UserPlus}
                onClick={() => navigate('/inquilinos/crear')}
              >
                Nuevo Inquilino
              </Button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={inquilinosFiltrados}
            isLoading={loading}
            title="Lista de Inquilinos"
            searchable={false}
            emptyMessage={inquilinos.length === 0 ? "No hay inquilinos registrados" : "No se encontraron inquilinos con los filtros seleccionados"}
            onRowClick={(row) => navigate(`/inquilinos/${row.id}`)}
          />
        </div>

        <ConfirmDeleteModal
          isOpen={finalizarModal.isOpen}
          onClose={() => setFinalizarModal({ isOpen: false, id: null, nombre: '' })}
          onConfirm={handleFinalizarContrato}
          title="Finalizar Contrato"
          message="¿Estás seguro de que deseas finalizar el contrato de este inquilino?"
          itemName={finalizarModal.nombre}
          confirmText="Finalizar Contrato"
          loading={finalizando}
          variant="warning"
        />
      </div>
    </Layout>
  );
};

export default InquilinosPage;