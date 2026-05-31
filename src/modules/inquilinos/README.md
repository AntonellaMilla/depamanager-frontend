# 📋 Módulo de Inquilinos - CRUD Completo

## Descripción General
Sistema completo de gestión de inquilinos con operaciones CRUD, integración con unidades, usuarios y validación completa en frontend y backend.

---

## 🗂️ Estructura de Archivos

### Frontend (`depamanager-frontend/src/modules/inquilinos`)

#### Componentes
- **InquilinosPage.jsx** - Página principal con tabla de inquilinos, modales de edición, eliminación y visualización de detalles
- **CrearInquilinoPage.jsx** - Formulario para crear nuevos inquilinos con validación completa
- **EditarInquilinoModal.jsx** - Modal para editar información del inquilino
- **VerDetallesInquilinoModal.jsx** - Modal para visualizar detalles completos del inquilino

#### Servicios
- **inquilinosService.js** - Servicio API con métodos para CRUD

#### Index
- **index.js** - Exporta todos los componentes y servicios del módulo

### Backend (`depamanager-backend/src/modules/inquilinos`)

#### Archivos
- **inquilinos.controller.js** - Controlador con validación y manejo de requests
- **inquilinos.service.js** - Lógica de negocio y auditoría
- **inquilinos.repository.js** - Operaciones con base de datos
- **inquilinos.routes.js** - Definición de rutas protegidas

---

## 📊 Funcionalidades Implementadas

### CRUD Completo
| Operación | Frontend | Backend | Descripción |
|-----------|----------|---------|-------------|
| **CREATE** | ✅ Formulario | ✅ POST | Crear nuevo inquilino |
| **READ** | ✅ Tabla + Modal | ✅ GET | Listar y ver detalles |
| **UPDATE** | ✅ Modal de edición | ✅ PUT | Actualizar información |
| **DELETE** | ✅ Botón con confirmación | ✅ DELETE | Eliminar inquilino |

### Acciones Adicionales
- **Finalizar Contrato** - Cambiar estado de contrato a FINALIZADO
- **Ver Detalles** - Modal con información completa incluyendo vehículos y solicitudes
- **Auditoría** - Registra todas las acciones en la tabla de auditoría

---

## 🎯 Campos Soportados (Schema Prisma)

### Información del Inquilino
- `id` - UUID (generado automáticamente)
- `usuarioId` - UUID del usuario asociado
- `unidadId` - UUID de la unidad asignada
- `nacionalidad` - String (opcional)
- `contactoEmergencia` - String (opcional)
- `telefonoEmergencia` - String (opcional)
- `fechaInicioContrato` - DateTime
- `fechaFinContrato` - DateTime
- `estadoContrato` - Enum (ACTIVO, FINALIZADO)
- `fechaRegistro` - DateTime (generada automáticamente)

### Relaciones
- **usuario** - Información del usuario (nombres, apellidos, email, DNI, teléfono)
- **unidad** - Información de la unidad (número, piso, capacidad)
- **vehiculos** - Lista de vehículos registrados
- **solicitudes** - Solicitudes pendientes/aprobadas/rechazadas

---

## 🔌 API Endpoints

### Rutas Protegidas (Requiere Autenticación + Rol ADMINISTRADOR)

```
POST   /inquilinos                    - Crear nuevo inquilino
GET    /inquilinos                    - Listar inquilinos del edificio
GET    /inquilinos/:id                - Obtener detalles de un inquilino
PUT    /inquilinos/:id                - Actualizar inquilino
PUT    /inquilinos/:id/finalizar      - Finalizar contrato
DELETE /inquilinos/:id                - Eliminar inquilino
```

### Request/Response Ejemplo

#### Crear Inquilino
```json
POST /inquilinos
{
  "usuarioId": "uuid-usuario",
  "unidadId": "uuid-unidad",
  "nacionalidad": "Peruana",
  "contactoEmergencia": "Juan Pérez",
  "telefonoEmergencia": "+51 999 999 999",
  "fechaInicioContrato": "2024-01-15",
  "fechaFinContrato": "2025-01-15"
}
```

#### Response Exitoso
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "usuarioId": "uuid-usuario",
    "unidadId": "uuid-unidad",
    "usuario": {
      "nombres": "Juan",
      "apellidos": "Pérez",
      "email": "juan@example.com"
    },
    "unidad": {
      "numero": "101",
      "piso": 1
    },
    "estadoContrato": "ACTIVO",
    "fechaRegistro": "2024-01-15T10:30:00Z"
  },
  "message": "Inquilino creado y asignado a la unidad correctamente"
}
```

---

## ✅ Validaciones

### Frontend
- `usuarioId` - Requerido
- `unidadId` - Requerido
- `fechaInicioContrato` - Requerido, formato ISO8601
- `fechaFinContrato` - Requerido, debe ser posterior a fecha inicio
- Mensajes de error claros y contextuales

### Backend
- Validación con express-validator en controller
- Verificación de existencia de recursos
- Manejo de errores con mensajes descriptivos
- Registro de auditoría para todas las acciones

---

## 🎨 Interfaz de Usuario

### InquilinosPage
- Tabla responsive con información del inquilino
- Botones de acción con iconos (Ver, Editar, Más opciones)
- Menú desplegable con acciones adicionales
- Estados visuales con colores (Verde: Activo, Rojo: Finalizado)
- Modal de confirmación para eliminación
- Carga dinámica con indicador de loading

### CrearInquilinoPage
- Formulario estructurado en secciones
- Validación en tiempo real
- Mensajes de error contextuales
- Botones de Cancelar y Crear
- Redirección automática después de crear

### EditarInquilinoModal
- Información del inquilino en modo lectura
- Campos editables para datos del contrato
- Validación de fechas
- Botones de Cancelar y Guardar

### VerDetallesInquilinoModal
- Información personal del usuario
- Detalles de la unidad asignada
- Información del contrato
- Contacto de emergencia (si existe)
- Diseño con secciones y colores diferenciados

---

## 🔐 Seguridad

- ✅ Autenticación requerida en todas las rutas
- ✅ Validación de rol (ADMINISTRADOR)
- ✅ Solo acceso a edificios asignados
- ✅ Auditoría de todas las acciones
- ✅ Validación de entrada sanitizada

---

## 📝 Notas de Desarrollo

### Dependencias Externas
- `react` - Framework UI
- `react-router-dom` - Enrutamiento
- `react-hot-toast` - Notificaciones
- `lucide-react` - Iconos
- `express-validator` - Validación backend

### Mejoras Futuras
- [ ] Dropdowns para seleccionar usuario y unidad
- [ ] Búsqueda y filtrado de inquilinos
- [ ] Paginación de la tabla
- [ ] Exportar datos a PDF
- [ ] Historial de cambios
- [ ] Búsqueda por estado del contrato
- [ ] Integración con notificaciones de vencimiento

### Consideraciones
- Los UUIDs deben validarse que existan antes de crear
- Las fechas deben estar en formato ISO8601
- El usuario logueado debe ser administrador del edificio
- No se puede eliminar un inquilino con vehículos activos (considerar validación)

---

## 📞 Soporte

Para consultas sobre la implementación, revisar:
- Schema Prisma: `/prisma/schema.prisma`
- Otros módulos similares: `/modules/edificios`, `/modules/unidades`
- Documentación de API: Backend routes

---

*Última actualización: 30 de Abril, 2026*
