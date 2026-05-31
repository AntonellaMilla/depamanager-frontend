// src/modules/edificios/components/EdificiosPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, UserCheck, Building2, CreditCard } from 'lucide-react';

import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
import ConfirmDeleteModal from '../../../shared/components/ui/ConfirmDeleteModal';

import AsignarAdminModal from './AsignarAdminModal';

import { edificiosService } from '../services/edificiosService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuconfig";

import toast from 'react-hot-toast';

const EdificiosPage = () => {
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const [adminModal, setAdminModal] = useState({ isOpen: false, edificio: null });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    edificioId: null,
    nombre: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEdificios = async () => {
    try {
      setLoading(true);
      const response = await edificiosService.getAll();
      const edificiosData = response.data?.data || response.data || [];
      setEdificios(edificiosData);
    } catch (error) {
      toast.error('Error al cargar los edificios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdificios();
  }, []);

  const handleEliminar = async () => {
    setDeleteLoading(true);
    try {
      await edificiosService.delete(deleteModal.edificioId);
      toast.success('Edificio eliminado');
      setDeleteModal({ isOpen: false, edificioId: null, nombre: '' });
      fetchEdificios();
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case 'GRATUITO': return 'bg-gray-100 text-gray-600';
      case 'ESTANDAR': return 'bg-blue-100 text-blue-700';
      case 'PREMIUM': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const columns = [
    {
      header: 'Edificio',
      key: 'nombre',
      render: (_, row) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/edificios/${row.id}`)}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: roleColors.dark }}
          >
            {row.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{row.nombre}</p>
            <p className="text-xs text-gray-500">{row.direccion || 'Sin dirección'}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Ubicación',
      key: 'ubicacion',
      render: (_, row) => {
        const ubicacion = [row.ciudad, row.provincia, row.distrito].filter(Boolean).join(', ');
        return <span className="text-sm text-gray-600">{ubicacion || '-'}</span>;
      }
    },
    {
      header: 'Plan',
      key: 'plan',
      render: (_, row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getPlanColor(row.suscripcion?.plan?.nombre || 'GRATUITO')}`}>
          <CreditCard size={12} />
          {row.suscripcion?.plan?.nombre || 'GRATUITO'}
        </span>
      )
    },
    {
      header: 'Administrador',
      key: 'administrador',
      render: (_, row) => {
        const admin = row.administradores?.[0];
        return admin ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-xs font-bold text-teal-700">
                {admin.usuario?.nombres?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {admin.usuario?.nombres} {admin.usuario?.apellidos}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              Sin asignar
            </span>
            <Button
              size="sm"
              variant="outline"
              icon={UserCheck}
              onClick={(e) => {
                e.stopPropagation();
                setAdminModal({ isOpen: true, edificio: row });
              }}
            />
          </div>
        );
      }
    },
    {
      header: 'Estado',
      key: 'activo',
      render: (value) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
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
          {/* SOLO BOTÓN VER - lleva a VerDetallesEdificio */}
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/edificios/${row.id}`)}
            title="Ver detalles"
          />
          {/* BOTÓN ELIMINAR */}
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({
                isOpen: true,
                edificioId: row.id,
                nombre: row.nombre
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
          <h1 className="text-3xl font-bold text-gray-800">Mis Edificios</h1>
          <p className="text-gray-500 mt-1">Gestiona todos tus edificios y propiedades</p>
        </div>
        <Button variant="primary" role={userRole} icon={Building2} onClick={() => navigate('/edificios/crear')}>
          Nuevo Edificio
        </Button>
      </div>

      <Table
        columns={columns}
        data={edificios}
        isLoading={loading}
        title="Lista de Edificios"
        searchable
        onRowClick={(row) => navigate(`/edificios/${row.id}`)}
      />

      <AsignarAdminModal
        isOpen={adminModal.isOpen}
        onClose={() => setAdminModal({ isOpen: false, edificio: null })}
        edificio={adminModal.edificio}
        onSuccess={fetchEdificios}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, edificioId: null, nombre: '' })}
        onConfirm={handleEliminar}
        title="Eliminar Edificio"
        message={`¿Eliminar "${deleteModal.nombre}"?`}
        confirmText="Eliminar"
        loading={deleteLoading}
      />
    </Layout>
  );
};

export default EdificiosPage;