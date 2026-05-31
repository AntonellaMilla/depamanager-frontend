// src/modules/camaras/components/CamaraCard.jsx
import { Camera, MapPin, Wifi, WifiOff, Eye, Edit2, Trash2, Play } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';

const CamaraCard = ({ camara, onView, onDelete, onViewStream, roleColors }) => {
  const isActive = camara.activa;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Preview / Placeholder */}
      <div 
        className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer"
        onClick={() => onViewStream(camara)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Play size={24} className="text-white/70 group-hover:text-white" />
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
          }`}>
            {isActive ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${roleColors.dark}15` }}
            >
              <Camera size={16} style={{ color: roleColors.dark }} />
            </div>
            <h3 className="font-semibold text-gray-800 truncate max-w-[150px]">{camara.nombre}</h3>
          </div>
        </div>

        {camara.ubicacion && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <MapPin size={12} />
            <span className="truncate">{camara.ubicacion}</span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => onView(camara)}
            className="flex-1"
            title="Ver detalles"
          >
            Detalles
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => onDelete(camara)}
            className="text-red-500 hover:text-red-700"
            title="Eliminar"
          />
        </div>
      </div>
    </div>
  );
};

export default CamaraCard;