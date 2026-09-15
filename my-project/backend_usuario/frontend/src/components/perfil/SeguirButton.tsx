import { useAuth } from '../../services/AuthContext'
import { Usuario } from '../../domain/Usuario'
import { perfilService } from '../../services/perfilService'

/**
 * Componente presentacional `SeguirButton`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-040: el botón
 * "Seguir"/"Siguiendo" NO DEBE aparecer en el perfil propio del usuario
 * autenticado; FR-041: el sistema DEBE solicitar confirmación antes de
 * ejecutar la acción de dejar de seguir a otro usuario) y
 * specs/001-user-interactions/contracts/api-contracts.md (sección "7.
 * Seguir usuarios (HU-08)").
 *
 * Usa `Usuario.puedeVerBotonSeguir()` (T011) para ocultarse por completo
 * (retorna `null`) cuando se trata del perfil propio o el visitante no
 * está autenticado (FR-040), en línea con cómo `LikeButton`/`ReportButton`
 * ya condicionan su renderizado según reglas de dominio.
 *
 * Antes de ejecutar la acción de dejar de seguir, solicita confirmación
 * (FR-041) mediante `window.confirm`, siguiendo el mismo enfoque simple ya
 * usado en otras confirmaciones no bloqueantes de este proyecto (no existe
 * un componente de diálogo de confirmación reutilizable en el alcance
 * actual de `tasks.md`). Al seguir (acción que no requiere confirmación),
 * ejecuta la acción directamente.
 *
 * La actualización optimista y la llamada a la API viven en
 * `perfilService.useSeguirUsuario` (T071); este componente solo orquesta
 * la interacción de UI (Principio III).
 */
export interface SeguirButtonProps {
  usuario: Usuario
  /** Callback invocado cuando cambia el estado de seguimiento. */
  onCambio?: (usuario: Usuario) => void
}

export function SeguirButton({ usuario: usuarioInicial, onCambio }: SeguirButtonProps) {
  const { usuario: usuarioActual, estaAutenticado } = useAuth()
  const { usuario, enviando, error, alternarSeguir } = perfilService.useSeguirUsuario(usuarioInicial)

  const puedeVerBoton = usuario.puedeVerBotonSeguir(usuarioActual?.id ?? '', estaAutenticado)

  if (!puedeVerBoton) {
    // FR-040: oculto por completo en el perfil propio (o sin autenticar).
    return null
  }

  const manejarClick = async () => {
    if (usuario.sigoAEsteUsuario) {
      // FR-041: confirmación previa a dejar de seguir.
      const confirmado = window.confirm(`¿Dejar de seguir a ${usuario.nombre}?`)
      if (!confirmado) {
        return
      }
    }

    await alternarSeguir()
    onCambio?.(usuario)
  }

  return (
    <div className="seguir-button">
      <button type="button" onClick={manejarClick} disabled={enviando} aria-pressed={usuario.sigoAEsteUsuario}>
        {usuario.sigoAEsteUsuario ? 'Siguiendo' : 'Seguir'}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  )
}
