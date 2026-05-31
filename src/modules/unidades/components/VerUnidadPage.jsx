// src/modules/unidades/pages/VerUnidadPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Users,
  MapPin,
  Building2,
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Trash2,
  DoorOpen
} from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import { unidadesService } from '../services/unidadesService';
import { useAuth } from '../../../shared/hooks/useAuth';
import { getRoleColors } from "../../../shared/components/layout/config/menuConfig";
import toast from 'react-hot-toast';

const VerUnidadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unidad, setUnidad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unidadesList, setUnidadesList] = useState([]);

  const getUserRole = () => {
    if (!user?.rol) return null;
    const rolValue = typeof user.rol === 'object' ? user.rol?.nombre : user.rol;
    return rolValue?.toUpperCase() || null;
  };
  const userRole = getUserRole();
  const roleColors = getRoleColors(userRole);

  const fetchUnidad = async () => {
    try {
      setLoading(true);
      const list = await unidadesService.listarUnidades();
      setUnidadesList(list);
      const unidadData = list.find(u => String(u.id) === String(id));
      
      if (!unidadData) {
        toast.error('Unidad no encontrada');
        navigate('/unidades');
        return;
      }
      setUnidad(unidadData);
    } catch (error) {
      toast.error('Error al cargar la unidad');
      navigate('/unidades');
    } finally {
      setLoading(false);
    }
    
  };

  useEffect(() => {
    fetchUnidad();
  }, [id]);

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

  if (!unidad) return null;

  const inquilino = unidad.inquilino;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/unidades')} className="hover:text-gray-700 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            Unidades
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">Unidad {unidad.numero}</span>
        </div>

        {/* Header */}
        <div className="relative mb-8">
          <div 
            className="absolute -top-4 -left-4 w-24 h-24 rounded-full blur-2xl"
            style={{ backgroundColor: `${roleColors.dark}20` }}
          ></div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${roleColors.dark}, ${roleColors.light})` }}
              >
                <Home size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Unidad {unidad.numero}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <MapPin size={12} />
                    Piso {unidad.piso}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    !unidad.activa ? 'bg-red-100 text-red-700' :
                    inquilino ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {!unidad.activa ? 'Inactiva' : inquilino ? 'Ocupada' : 'Disponible'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" icon={Edit2} onClick={() => navigate(`/unidades/${unidad.id}/editar`)}>
                Editar
              </Button>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de la Unidad */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2">
                <Home size={18} className="text-teal-600" />
                <h2 className="font-semibold text-gray-800">Información de la Unidad</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Número</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{unidad.numero}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Piso</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{unidad.piso}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Capacidad Máxima</p>
                  <p className="flex items-center gap-2 mt-1">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-gray-800 font-medium">{unidad.capacidadMaxima} personas</span>
                  </p>
                </div>
           
              </div>
              {unidad.edificio && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Edificio</p>
                  <p className="flex items-center gap-2 mt-1">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="text-gray-800 font-medium">{unidad.edificio.nombre}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Inquilino (si existe) */}
          {inquilino ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Inquilino Actual</h2>
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        inquilino.estadoContrato === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {inquilino.estadoContrato === 'ACTIVO' ? 'Contrato Activo' : 'Contrato Finalizado'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-700">{inquilino.usuario?.email}</span>
                  </div>
                  {inquilino.usuario?.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-700">{inquilino.usuario?.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-700">
                      Contrato: {new Date(inquilino.fechaInicioContrato).toLocaleDateString('es-PE')} - {new Date(inquilino.fechaFinContrato).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-teal-600" />
                  <h2 className="font-semibold text-gray-800">Inquilino</h2>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DoorOpen size={24} className="text-blue-600" />
                </div>
                <p className="text-gray-500 font-medium">Unidad Disponible</p>
                <p className="text-sm text-gray-400 mt-1">No hay inquilino asignado actualmente</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VerUnidadPage;