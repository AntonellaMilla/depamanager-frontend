// src/modules/administradores/components/AdministradoresPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Edit2, Trash2, Plus, Mail, Calendar } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';
// CrearAdministradorPage se muestra via ruta /administradores/crear
import { administradoresService } from '../services/administradoresService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from '../../../shared/components/layout/config/menuConfig';
import toast from 'react-hot-toast';

const AdministradoresPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, nombre: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchAdministradores = async () => {
    try {
      setLoading(true);
      const data = await administradoresService.listarAdministradores();
      setAdministradores(data);
    } catch (error) {
      toast.error('Error al cargar los administradores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministradores();
  }, []);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await administradoresService.eliminarAdministrador(deleteModal.id);
      toast.success('Administrador eliminado correctamente');
      setDeleteModal({ isOpen: false, id: null, nombre: '' });
      fetchAdministradores();
    } catch (error) {
      toast.error('Error al eliminar el administrador');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Administrador',
      key: 'nombre',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: roleColors.dark }}
          >
            {row.nombres?.charAt(0).toUpperCase()}{row.apellidos?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{row.nombres} {row.apellidos}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Mail size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{row.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Teléfono',
      key: 'telefono',
      render: (value) => value || '-'
    },
    {
      header: 'Estado',
      key: 'activo',
      render: (value) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Fecha Registro',
      key: 'fechaCreacion',
      render: (value) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {value ? new Date(value).toLocaleDateString('es-PE') : '-'}
          </span>
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
            onClick={() => navigate(`/administradores/${row.id}`)}
            title="Ver detalles"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({
                isOpen: true,
                id: row.id,
                nombre: `${row.nombres} ${row.apellidos}`
              });
            }}
            title="Eliminar"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          />
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Administradores</h1>
          <p className="text-gray-500 mt-1">Gestiona los administradores de tus edificios</p>
        </div>
        <Button variant="primary" role={userRole} icon={Plus} onClick={() => navigate('/administradores/crear')}>
          Nuevo Administrador
        </Button>
      </div>

      <Table
        columns={columns}
        data={administradores}
        isLoading={loading}
        title="Lista de Administradores"
        searchable
        onRowClick={(row) => navigate(`/administradores/${row.id}`)}
      />

      {/* La página de creación se muestra en la ruta /administradores/crear */}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, nombre: '' })}
        onConfirm={handleDelete}
        title="Eliminar Administrador"
        message="¿Estás seguro de que deseas eliminar este administrador?"
        itemName={deleteModal.nombre}
        confirmText="Eliminar"
        loading={deleteLoading}
      />
    </Layout>
  );
};

export default AdministradoresPage;