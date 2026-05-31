import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Layout from '../../../shared/components/layout/Layout';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { camarasService } from '../services/camarasService';
import toast from 'react-hot-toast';

const DetalleCamaraPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [testingStream, setTestingStream] = useState(false);
  const [streamStatus, setStreamStatus] = useState(null);

  const [editData, setEditData] = useState({
    nombre: '',
    ubicacion: '',
    urlStream: '',
    activa: true
  });

  useEffect(() => {
    fetchCamera();
  }, [id]);

  const fetchCamera = async () => {
    try {
      setLoading(true);
      const response = await camarasService.getById(id);
      console.log('📹 Cámara obtenida:', response);
      setCamera(response);
      setEditData({
        nombre: response.nombre,
        ubicacion: response.ubicacion || '',
        urlStream: response.urlStream,
        activa: response.activa
      });
    } catch (error) {
      toast.error('Cámara no encontrada');
      navigate('/camaras');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!editData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!editData.urlStream.trim()) {
      toast.error('La URL del stream es obligatoria');
      return;
    }

    try {
      setSaving(true);
      await camarasService.update(id, editData);
      toast.success('✓ Cámara actualizada correctamente');
      setIsEditing(false);
      fetchCamera();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar cámara "${camera.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await camarasService.delete(id);
      toast.success('✓ Cámara eliminada');
      navigate('/camaras');
    } catch (error) {
      toast.error('Error al eliminar cámara');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!camera) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Cámara no encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/camaras')}
            className="h-10 w-10 p-0"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{camera.nombre}</h1>
            <p className="text-gray-600 text-sm">
              Ubicación: {camera.ubicacion || 'No especificada'}
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      nombre: camera.nombre,
                      ubicacion: camera.ubicacion || '',
                      urlStream: camera.urlStream,
                      activa: camera.activa
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  loading={saving}
                  onClick={handleSave}
                >
                  Guardar Cambios
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                >
                  Eliminar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo - Vista en vivo + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview de stream */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">📹 Vista en Vivo</h2>
              
              <div className="bg-black rounded-lg p-4 mb-4 aspect-video flex items-center justify-center relative overflow-hidden">
                {camera.activa ? (
                  <>
                    {/* 
                      Nota sobre RTSP en navegadores:
                      - RTSP (Real Time Streaming Protocol) NO funciona nativamente en navegadores modernos
                      - Alternativas:
                        1. HLS (HTTP Live Streaming) - compatible con navegadores
                        2. MJPEG (Motion JPEG) - compatible con img src
                        3. WebRTC - compatible pero requiere servidor Janus/Kurento
                        4. VLC plugin - legacy, no recomendado
                      
                      Para ver el stream en vivo, pueden usar:
                      - VLC Media Player (File → Open Network Stream)
                      - FFmpeg en terminal
                      - Cliente RTSP dedicado
                    */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
                      <div className="text-center z-10">
                        <div className="bg-green-500 rounded-full w-4 h-4 mx-auto mb-3 animate-pulse"></div>
                        <p className="text-green-400 text-sm font-semibold">Stream Activo</p>
                        <p className="text-gray-400 text-xs mt-3 px-4">
                          {camera.urlStream.startsWith('rtsp') 
                            ? 'Stream RTSP - Usa VLC Media Player para ver en vivo'
                            : 'Stream HTTP - Click en la URL para intentar reproducir'}
                        </p>
                        
                        {/* Info box para copiar URL */}
                        <div className="mt-4 bg-gray-800 rounded p-2 text-left">
                          <p className="text-xs text-gray-300 mb-2">URL del Stream:</p>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={camera.urlStream}
                              readOnly
                              className="text-xs bg-gray-900 text-green-400 px-2 py-1 rounded flex-1 font-mono"
                            />
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(camera.urlStream);
                                toast.success('URL copiada al portapapeles');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                              title="Copiar URL"
                            >
                              📋
                            </button>
                          </div>
                        </div>

                        {/* Instrucciones */}
                        <div className="mt-4 text-left text-xs text-gray-400 space-y-1">
                          <p>💡 <strong>Para ver el stream:</strong></p>
                          <p>1. Abre VLC Media Player</p>
                          <p>2. Menú: File → Open Network Stream</p>
                          <p>3. Pega la URL anterior</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <AlertCircle size={48} className="text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Cámara desactivada</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={camera.activa ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                    {camera.activa ? '✓ Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de Stream:</span>
                  <span className="text-gray-800 font-semibold">
                    {camera.urlStream.startsWith('rtsp') ? 'RTSP' : 'HTTP'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registrada:</span>
                  <span className="text-gray-800">
                    {new Date(camera.fechaRegistro).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel de edición */}
            {isEditing && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Editar Cámara</h2>

                <Input
                  label="Nombre"
                  name="nombre"
                  value={editData.nombre}
                  onChange={handleChange}
                />

                <Input
                  label="Ubicación"
                  name="ubicacion"
                  value={editData.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej: Portón, Cochera, Recepción"
                />

                <Input
                  label="URL del Stream"
                  name="urlStream"
                  value={editData.urlStream}
                  onChange={handleChange}
                  type="url"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="activa"
                      checked={editData.activa}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {editData.activa ? '✓ Cámara Activa' : 'Cámara Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel derecho - Info rápida */}
          <div className="space-y-6">
            {/* Estado General */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado General</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Monitoreo</span>
                  <span className={`font-semibold text-sm ${camera.activa ? 'text-green-600' : 'text-gray-500'}`}>
                    {camera.activa ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Tipo</span>
                  <span className="font-semibold text-sm text-blue-600">
                    {camera.urlStream.startsWith('rtsp') ? 'RTSP' : 'HTTP'}
                  </span>
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <p className="font-semibold text-gray-800 mt-1">{camera.nombre}</p>
                </div>
                <div>
                  <span className="text-gray-600">Ubicación:</span>
                  <p className="font-semibold text-gray-800 mt-1">{camera.ubicacion || '—'}</p>
                </div>
                <div>
                  <span className="text-gray-600">URL Stream:</span>
                  <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 text-gray-700 break-all">
                    {camera.urlStream}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de IA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">🤖 Integración IA</p>
              <p>Esta cámara es monitoreada automáticamente para detección de placas vehiculares si está activa.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DetalleCamaraPage;
