// src/shared/components/ui/Table.jsx
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const Table = ({ 
  columns, 
  data, 
  isLoading = false,
  onRowClick = null,
  title = null,
  actions = null,
  searchable = true,
  onSearch = null,
  striped = true,
  hoverable = true,
  sortable = true,
  emptyMessage = "No hay datos para mostrar",
  emptyIcon = null
}) => {
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Manejar ordenamiento
  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;
    
    if (sortField === column.key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(column.key);
      setSortDirection('asc');
    }
    // Aquí podrías llamar a una función externa para ordenar datos
  };

  // Filtrar datos localmente
  const filteredData = searchTerm && onSearch === null
    ? data.filter(row => {
        return columns.some(column => {
          const value = column.accessor ? column.accessor(row) : row[column.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      })
    : data;

  // Ordenar datos localmente
  const sortedData = sortField
    ? [...filteredData].sort((a, b) => {
        const aVal = columns.find(c => c.key === sortField)?.accessor?.(a) || a[sortField];
        const bVal = columns.find(c => c.key === sortField)?.accessor?.(b) || b[sortField];
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredData;

  // Estado de carga
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header con título y búsqueda */}
      {(title || searchable) && (
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {title && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {sortedData.length} {sortedData.length === 1 ? 'registro' : 'registros'} encontrados
              </p>
            </div>
          )}
          
          {searchable && (
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearch?.(e.target.value);
                }}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
              />
            </div>
          )}
        </div>
      )}

      {/* Acciones adicionales */}
      {actions && (
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-2">
          {actions}
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className={`
                    px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider
                    ${sortable && column.sortable ? 'cursor-pointer select-none' : ''}
                    ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}
                  `}
                  onClick={() => handleSort(column)}
                >
                  <div className={`flex items-center gap-2 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                    <span className="text-gray-600">{column.header}</span>
                    {sortable && column.sortable && sortField === column.key && (
                      sortDirection === 'asc' 
                        ? <ChevronUp size={14} className="text-teal-600" />
                        : <ChevronDown size={14} className="text-teal-600" />
                    )}
                    {sortable && column.sortable && sortField !== column.key && (
                      <ChevronDown size={14} className="text-gray-300" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon || (
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search size={24} className="text-gray-400" />
                      </div>
                    )}
                    <p className="text-gray-500 font-medium">{emptyMessage}</p>
                    <p className="text-sm text-gray-400">Intenta con otros filtros o crea uno nuevo</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex} 
                  className={`
                    ${striped && rowIndex % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}
                    ${hoverable ? 'hover:bg-teal-50/50 transition-colors duration-150' : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    border-b border-gray-100 last:border-0
                  `}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      className={`
                        px-6 py-4 text-sm
                        ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}
                        ${column.className || ''}
                      `}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : column.accessor 
                          ? column.accessor(row)
                          : row[column.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con paginación (opcional) */}
      {sortedData.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando {sortedData.length} de {filteredData.length} registros</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1 rounded-lg hover:bg-gray-200 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;