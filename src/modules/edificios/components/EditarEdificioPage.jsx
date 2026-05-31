import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, AlertCircle, Loader } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { edificiosService } from '../services/edificiosService';
import toast from 'react-hot-toast';

const EditarEdificioPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    distrito: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Cargar datos del edificio
  useEffect(() => {
    if (id) {
      fetchEdificio();
    }
  }, [id]);

  const fetchEdificio = async () => {
    try {
      setFetching(true);
      const response = await edificiosService.getById(id);
      const edificio = response.data || response;
      
      setFormData({
        nombre: edificio.nombre || '',
        direccion: edificio.direccion || '',
        ciudad: edificio.ciudad || '',
        provincia: edificio.provincia || '',
        distrito: edificio.distrito || '',
        descripcion: edificio.descripcion || ''
      });
    } catch (error) {
      toast.error('Error al cargar el edificio');
      navigate('/edificios');
    } finally {
      setFetching(false);
    }
  };

  // Validar campos
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
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
      await edificiosService.update(id, formData);
      toast.success('✓ Edificio actualizado exitosamente');
      navigate('/edificios');
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar el edificio';
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Loader size={32} className="text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando edificio...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <Building2 size={32} className="text-teal-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Editar Edificio</h1>
            <p className="text-gray-600 mt-1">Actualiza los datos del edificio</p>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* Error global */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertCircle size={20} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SECCIÓN 1: Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Información Básica
              </h2>
              <div className="space-y-4">
                <Input
                  label="Nombre del Edificio"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={errors.nombre}
                  required
                />

                <Input
                  label="Dirección Completa"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  error={errors.direccion}
                  required
                />
              </div>
            </div>

            {/* SECCIÓN 2: Ubicación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Ubicación
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  error={errors.ciudad}
                />

                <Input
                  label="Provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  error={errors.provincia}
                />

                <Input
                  label="Distrito"
                  name="distrito"
                  value={formData.distrito}
                  onChange={handleChange}
                  error={errors.distrito}
                />
              </div>
            </div>

 

            {/* BOTONES */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/edificios')}
                size="lg"
                className="flex-1"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="propietario"
                disabled={loading}
                icon={Building2}
                size="lg"
                className="flex-1"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditarEdificioPage;
