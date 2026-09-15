import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

/**
 * Esqueleto de rutas + guard de rutas protegidas.
 *
 * Fuente de verdad: specs/001-user-interactions/plan.md (Technical Context:
 * "React Router (navegación y guard de rutas protegidas)") y
 * specs/001-user-interactions/spec.md (CB-06: "El token de sesión expira
 * mientras el usuario navega. Al intentar cualquier acción protegida, el
 * frontend debe redirigir al login y conservar el destino original para
 * volver tras autenticarse").
 *
 * `RutaProtegida` redirige al login cuando no hay sesión activa,
 * conservando la ubicación original (`location`) en el estado de
 * navegación (`state.desde`) para poder retomarla tras autenticarse
 * (CB-06). `obtenerRutaDestinoTrasLogin` (T056) es el helper que
 * `LoginPage` (T053/T054) usa tras un login exitoso para navegar de vuelta
 * a ese destino en lugar de ir siempre al home.
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

/**
 * Extrae la ruta original (`pathname` + `search`) a la que se debe
 * redirigir tras un login exitoso, a partir del `state.desde` guardado por
 * `RutaProtegida` al interceptar una ruta protegida (CB-06). Si no hay
 * destino conservado (por ejemplo, el usuario llegó directamente a
 * `/login`), retorna el home (`/`) por defecto.
 */
export function obtenerRutaDestinoTrasLogin(state: unknown): string {
  const desde = (state as { desde?: Location } | null | undefined)?.desde
  if (!desde) {
    return '/'
  }
  return `${desde.pathname}${desde.search}`
}

