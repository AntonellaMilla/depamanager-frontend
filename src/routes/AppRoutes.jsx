import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { LoginPage, RegisterPage } from '../modules/auth';
import { DashboardPage } from '../modules/dashboard';
import { EdificiosPage, CrearEdificioPage,VerDetallesEdificio,UpgradePlanPage } from '../modules/edificios';
import { AdministradoresPage, CrearAdministradorPage, VerAdministradorPage } from '../modules/administradores';
import { HistorialAccesosPage } from '../modules/accesos';
import { AlertasPage } from '../modules/alertas';
import { UnidadesPage, CrearUnidadPage,  VerUnidadPage, EditarUnidadPage } from '../modules/unidades';
import { InquilinosPage, CrearInquilinoPage, AsignarInquilinoPage, VerInquilinoPage } from '../modules/inquilinos';
import { VehiculosPage, CrearVehiculoPage, VerVehiculoPage , EditarVehiculoPage} from '../modules/vehiculos';
import { CamarasPage, CrearCamaraPage, VerCamaraPage,  } from '../modules/camaras';
import { ProfilePage, EditProfilePage } from '../modules/perfil';

import { NotificacionesPage } from '../modules/notificaciones';






import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />



      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/edificios"
        element={
          <PrivateRoute requiredRole="PROPIETARIO">
            <EdificiosPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/edificios/crear"
        element={
          <PrivateRoute requiredRole="PROPIETARIO">
            <CrearEdificioPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/edificios/:id"
        element={
          <PrivateRoute requiredRole="PROPIETARIO">
            <VerDetallesEdificio />
          </PrivateRoute>
        }
      />
      <Route
        path="/edificios/:id/upgrade"
        element={
          <PrivateRoute requiredRole="PROPIETARIO">
            <UpgradePlanPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/administradores"
        element={
          <PrivateRoute requiredRole="PROPIETARIO">
            <AdministradoresPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/administradores/crear"
        element={
          <PrivateRoute requiredRole="PROPIETARIO">
            <CrearAdministradorPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/administradores/:id"
        element={
          <PrivateRoute requiredRole="PROPIETARIO">
            <VerAdministradorPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/accesos"
        element={
          <PrivateRoute>
            <HistorialAccesosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/alertas"
        element={
          <PrivateRoute>
            <AlertasPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/unidades"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <UnidadesPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/unidades/crear"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <CrearUnidadPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/unidades/:id"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <VerUnidadPage />
          </PrivateRoute>
        }
      />
        <Route
        path="/unidades/:id/editar"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <EditarUnidadPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/inquilinos"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <InquilinosPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/vehiculos"
        element={
          <PrivateRoute>
            <VehiculosPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/vehiculos/crear"
        element={
          <PrivateRoute>
            <CrearVehiculoPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/vehiculos/:id"
        element={
          <PrivateRoute>
            <VerVehiculoPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/vehiculos/:id/editar"
        element={
          <PrivateRoute>
            <EditarVehiculoPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/camaras"
        element={
          <PrivateRoute allowedRoles={["ADMINISTRADOR", "PROPIETARIO"]}>
            <CamarasPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/camaras/crear"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <CrearCamaraPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/camaras/:id"
        element={
          <PrivateRoute allowedRoles={["ADMINISTRADOR", "PROPIETARIO"]} >
            <VerCamaraPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil/editar"
        element={
          <PrivateRoute>
            <EditProfilePage />
          </PrivateRoute>
        }
      />



      <Route
        path="/inquilinos/crear"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <CrearInquilinoPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/inquilinos/asignar"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <AsignarInquilinoPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/inquilinos/:id"
        element={
          <PrivateRoute requiredRole="ADMINISTRADOR">
            <VerInquilinoPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/notificaciones"
        element={
          <PrivateRoute>
            <NotificacionesPage />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
