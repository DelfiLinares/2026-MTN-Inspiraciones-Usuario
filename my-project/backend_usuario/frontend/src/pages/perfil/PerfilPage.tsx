import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { perfilService } from '../../services/perfilService'
import { Usuario } from '../../domain/Usuario'
import { SeguirButton } from '../../components/perfil/SeguirButton'

/**
 * `PerfilPage`: visualización de los datos de un perfil de usuario, propio
 * o ajeno.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T065: "visualización
 * de datos propios/ajenos usando `Usuario.esPropio()`"; T074: "Integrar
 * `SeguirButton` en `PerfilPage`") y specs/001-user-interactions/data-model.md
 * (entidad `Usuario`: `esPropio(usuarioActualId)`).
 *
 * Obtiene el usuario a mostrar vía `perfilService.obtenerUsuario` (T062,
 * `GET /api/usuarios/{id}`) según el `:id` de la ruta. Usa
 * `Usuario.esPropio()` para decidir si se trata del perfil propio (en cuyo
 * caso se ofrece un enlace a `EditarPerfilPage`, T064) o de un perfil ajeno.
 *
 * Integra `SeguirButton` (T072), que ya decide internamente si debe
 * mostrarse (oculto en el perfil propio o sin autenticar, FR-040). Ante un
 * cambio de estado de seguimiento, sincroniza `usuarioPerfil` con el
 * resultado más reciente para mantener el conteo de seguidores mostrado en
 * esta página consistente con el botón.
 *
 * Fuera de alcance de esta tarea (tareas posteriores según `tasks.md`):
 * - Publicaciones propias del usuario (T087, depende de T041).
 */
export function PerfilPage() {
  const { id } = useParams<{ id: string }>()
  const { usuario: usuarioActual } = useAuth()
  const [usuarioPerfil, setUsuarioPerfil] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      return
    }
    let cancelado = false
    setCargando(true)
    setError(null)

    perfilService
      .obtenerUsuario(id)
      .then((usuarioObtenido) => {
        if (!cancelado) {
          setUsuarioPerfil(usuarioObtenido)
        }
      })
      .catch(() => {
        if (!cancelado) {
          setError('No se pudo cargar el perfil.')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [id])

  if (cargando) {
    return <p>Cargando perfil…</p>
  }

  if (error || !usuarioPerfil) {
    return <p role="alert">{error ?? 'Perfil no encontrado.'}</p>
  }

  const esPropio = usuarioActual !== null && usuarioPerfil.esPropio(usuarioActual.id)

  return (
    <div className="perfil-page">
      {usuarioPerfil.fotoUrl && (
        <img src={usuarioPerfil.fotoUrl} alt={`Foto de perfil de ${usuarioPerfil.nombre}`} />
      )}
      <h1>
        {usuarioPerfil.nombre} {usuarioPerfil.apellido}
      </h1>
      {usuarioPerfil.bio && <p>{usuarioPerfil.bio}</p>}
      <p>{usuarioPerfil.cantidadSeguidores} seguidores</p>

      {esPropio && <a href="/editar-perfil">Editar perfil</a>}
      {!esPropio && (
        <SeguirButton
          usuario={usuarioPerfil}
          onCambio={(usuarioActualizado) => setUsuarioPerfil(usuarioActualizado)}
        />
      )}
    </div>
  )
}
