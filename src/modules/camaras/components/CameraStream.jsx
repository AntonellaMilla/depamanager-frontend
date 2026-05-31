// src/modules/camaras/components/CameraStream.jsx
import { useState, useEffect, useRef } from 'react';
import { Camera, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

const STREAMING_URL = import.meta.env.VITE_STREAMING_URL || 'http://localhost:5001';

const CameraStream = ({ camaraId, camaraNombre, className = '' }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const imgRef = useRef(null);
  const streamUrl = `${STREAMING_URL}/stream/${camaraId}`;

  const handleImageLoad = () => {
    setIsLoading(false);
    setIsConnected(true);
    setErrorCount(0);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setIsConnected(false);
    setErrorCount(prev => prev + 1);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setIsConnected(true);
    setErrorCount(0);
    // Recargar la imagen
    if (imgRef.current) {
      imgRef.current.src = `${streamUrl}?t=${Date.now()}`;
    }
  };

  // Reconectar automáticamente después de errores
  useEffect(() => {
    if (errorCount > 0 && errorCount < 3) {
      const timer = setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = `${streamUrl}?t=${Date.now()}`;
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorCount, streamUrl]);

  return (
    <div className={`relative bg-gray-900 rounded-2xl overflow-hidden ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm mt-3">Conectando con la cámara...</p>
        </div>
      )}

      {/* Error overlay */}
      {!isConnected && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
            <WifiOff size={32} className="text-red-500" />
          </div>
          <p className="text-gray-300 font-medium">Cámara no disponible</p>
          <p className="text-gray-500 text-sm mt-1">No se pudo establecer conexión</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-xl text-sm font-medium text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Reintentar
          </button>
        </div>
      )}

      {/* Imagen del stream */}
      <img
        ref={imgRef}
        src={streamUrl}
        alt={`Stream de ${camaraNombre || 'cámara'}`}
        className="w-full h-auto min-h-[360px] object-contain"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ opacity: isLoading || !isConnected ? 0 : 1 }}
      />

      {/* Indicador de conexión */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-20">
        {isConnected ? (
          <>
            <Wifi size={14} className="text-green-500" />
            <span className="text-xs text-white">En vivo</span>
          </>
        ) : (
          <>
            <WifiOff size={14} className="text-red-500" />
            <span className="text-xs text-white">Desconectado</span>
          </>
        )}
      </div>

      {/* Indicador de calidad */}
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-20">
        <div className="flex items-center gap-1">
          <Camera size={12} className="text-gray-400" />
          <span className="text-xs text-gray-300">MJPEG</span>
        </div>
      </div>
    </div>
  );
};

export default CameraStream;