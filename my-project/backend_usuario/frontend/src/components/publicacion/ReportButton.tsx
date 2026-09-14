import { useNavigate, useLocation } from 'react-router-dom'
import { Publicacion } from '../../domain/Publicacion'
import { useAuth } from '../../services/AuthContext'

/**
 * Componente presentacional `ReportButton`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-021, FR-023,
 * FR-004).
 *
 * Usa `Publicacion.puedeReportar()` para deshabilitarse cuando la
 * publicación es propia o ya fue reportada por el usuario actual
 * (FR-021, FR-023), mostrando "Ya reportaste esto" en ese último caso. Si
 * un usuario no autenticado hace clic, redirige a `/login` conservando la
 * ubicación actual (FR-004), en vez de abrir el modal de reporte.
 *
 * Este componente NO abre `ReportarModal` (T068) directamente ni llama a
 * `reporteService` (T066); solo decide si el reporte es posible y expone
 * `onAbrirModal`, para que la pantalla contenedora (`PublicacionCard`,
 * T070) orqueste la apertura del modal (Principio III: la lógica de
 * negocio no vive en el componente de presentación).
 */
export interface ReportButtonProps {
  publicacion: Publicacion
  /** Invocado al hacer clic estando habilitado, para abrir `ReportarModal`. */
  onAbrirModal: () => void
}

export function ReportButton({ publicacion, onAbrirModal }: ReportButtonProps) {
  const { usuario, estaAutenticado } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const esPropia = publicacion.esPropia(usuario?.id ?? '')
  const puedeReportar = publicacion.puedeReportar(usuario?.id ?? '')

  if (esPropia) {
    // FR-021: el botón "Reportar" DEBE ocultarse en las publicaciones
    // propias del usuario autenticado.
    return null
  }

  const manejarClick = () => {
    if (!estaAutenticado) {
      // FR-004: derivar al login conservando el destino original.
      navigate('/login', { state: { desde: location } })
      return
    }

    onAbrirModal()
  }

  return (
    <button type="button" onClick={manejarClick} disabled={estaAutenticado && !puedeReportar}>
      {estaAutenticado && publicacion.reportadaPorMi ? 'Ya reportaste esto' : 'Reportar'}
    </button>
  )
}
