// src/components/common/Footer.jsx
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-600 shadow-sm">
      <div className="flex items-center justify-center gap-1">
        <span>© {currentYear} DepaManager - Sistema de Gestión Inteligente</span>
        <Heart size={16} className="text-red-500 fill-current" />
      </div>
      <p className="text-xs text-gray-500 mt-1">v1.0.0 | Todos los derechos reservados</p>
    </footer>
  );
};

export default Footer;
