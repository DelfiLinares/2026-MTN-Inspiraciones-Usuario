import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { perfilService } from '../../services/perfilService'
import { carpetaService } from '../../services/carpetaService'
import { Usuario } from '../../domain/Usuario'
import { Carpeta } from '../../domain/Carpeta'
import { SeguirButton } from '../../components/perfil/SeguirButton'
import { CarpetaCard } from '../../components/carpetas/CarpetaCard'

/**
 * `PerfilPage`: visualización de los datos de un perfil de usuario, propio
 * o ajeno.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T065: "visualización
 * de datos propios/ajenos usando `Usuario.esPropio()`"; T074: "Integrar
 * `SeguirButton` en `PerfilPage`"; T080: "Integrar listado de carpetas
 * (hasta 100, con scroll/paginación si es necesario — FR-047)") y
 * specs/001-user-interactions/data-model.md (entidad `Usuario`:
 * `esPropio(usuarioActualId)`).
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
 * Integra el listado de carpetas públicas del perfil (`carpetaService.
 * obtenerCarpetas`, T077, `GET /api/usuarios/{id}/carpetas`) mediante
 * `CarpetaCard` (T078). El contrato de dicho endpoint entrega el listado
 * completo (hasta 100 carpetas, FR-047) en una sola respuesta, sin
 * paginación por cursor; por lo tanto, el "scroll... si es necesario" de
 * FR-047 se resuelve con un contenedor con scroll propio (`overflow-y:
 * auto`, ver estilos de `perfil-page__carpetas`), que evita degradar la
 * interfaz al mostrar hasta 100 tarjetas sin requerir carga incremental
 * adicional.
 *
 * Fuera de alcance de esta tarea (tareas posteriores según `tasks.md`):
 * - Publicaciones propias del usuario (T087, depende de T041).
 * - Creación/eliminación de carpetas con advertencia de pérdida de
 *   contenido (T094, depende de esta tarea y de T077).
 * - Botón "Guardar en carpeta" en `PublicacionCard` (T081).
 */
export function PerfilPage() {
  const { id } = useParams<{ id: string }>()
  const { usuario: usuarioActual } = useAuth()
  const [usuarioPerfil, setUsuarioPerfil] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [errorCarpetas, setErrorCarpetas] = useState<string | null>(null)

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

  useEffect(() => {
    if (!id) {
      return
    }
    let cancelado = false
    setErrorCarpetas(null)

    carpetaService
      .obtenerCarpetas(id)
      .then((carpetasObtenidas) => {
        if (!cancelado) {
          setCarpetas(carpetasObtenidas)
        }
      })
      .catch(() => {
        if (!cancelado) {
          setErrorCarpetas('No se pudieron cargar las carpetas.')
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

      <section>
        <h2>Carpetas</h2>
        {errorCarpetas && <p role="alert">{errorCarpetas}</p>}
        <div className="perfil-page__carpetas" style={{ overflowY: 'auto', maxHeight: '24rem' }}>
          {carpetas.map((carpeta) => (
            <CarpetaCard key={carpeta.id} carpeta={carpeta} usuarioActualId={usuarioActual?.id ?? ''} />
          ))}
        </div>
      </section>
    </div>
  )
}
