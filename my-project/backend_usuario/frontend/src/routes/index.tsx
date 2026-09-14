import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

/**
 * Esqueleto de rutas + guard de rutas protegidas.
 *
 * Fuente de verdad: specs/001-user-interactions/plan.md (Technical Context:
 * "React Router (navegación y guard de rutas protegidas)").
 *
 * `RutaProtegida` redirige al login cuando no hay sesión activa,
 * conservando la ubicación original en el estado de navegación para poder
 * retomarla tras autenticarse (CB-06). La integración completa de esa
 * redirección con `authService` se realiza en T056.
 *
 * Las rutas concretas (pages/) se agregan progresivamente a medida que se
 * implementan sus historias de usuario correspondientes.
 */
export function RutaProtegida() {
  const { estaAutenticado, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return null
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ desde: location }} replace />
  }

  return <Outlet />
}
