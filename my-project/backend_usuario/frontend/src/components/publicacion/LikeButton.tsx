import { useNavigate, useLocation } from 'react-router-dom'
import { Publicacion } from '../../domain/Publicacion'
import { useLikePublicacion } from '../../services/publicacionService'
import { useAuth } from '../../services/AuthContext'

/**
 * Componente presentacional `LikeButton`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-003, FR-004).
 *
 * Usa `Publicacion.puedeDarLike()` para deshabilitarse cuando la
 * publicación es propia, no está `ACTIVA`, o el usuario no está
 * autenticado (FR-003). Si un usuario no autenticado hace clic, redirige a
 * `/login` conservando la ubicación actual para volver tras autenticarse
 * (FR-004), en vez de intentar la llamada a la API.
 *
 * La actualización optimista y la llamada a la API viven en
 * `useLikePublicacion` (T027); este componente solo orquesta la interacción
 * de UI (Principio III: la lógica de negocio no vive en el componente de
 * presentación).
 */
export interface LikeButtonProps {
  publicacion: Publicacion
  /** Callback invocado cuando cambia el estado de like (ej. para sincronizar una lista). */
  onCambio?: (publicacion: Publicacion) => void
}

export function LikeButton({ publicacion: publicacionInicial, onCambio }: LikeButtonProps) {
  const { usuario, estaAutenticado } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { publicacion, enviando, alternarLike } = useLikePublicacion(publicacionInicial)

  const puedeDarLike = publicacion.puedeDarLike(usuario?.id ?? '')

  const manejarClick = async () => {
    if (!estaAutenticado) {
      // FR-004: derivar al login conservando el destino original.
      navigate('/login', { state: { desde: location } })
      return
    }

    try {
      await alternarLike()
      onCambio?.(publicacion)
    } catch {
      // El error ya fue manejado (reversión optimista) en useLikePublicacion;
      // la notificación no bloqueante al usuario queda a cargo de la
      // pantalla contenedora.
    }
  }

  return (
    <button
      type="button"
      onClick={manejarClick}
      disabled={estaAutenticado && (!puedeDarLike || enviando)}
      aria-pressed={publicacion.likeadaPorMi}
    >
      {publicacion.likeadaPorMi ? 'Te gusta' : 'Me gusta'} ({publicacion.cantidadLikes})
    </button>
  )
}
