import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../services/AuthContext'
import { perfilService } from '../../services/perfilService'
import { carpetaService } from '../../services/carpetaService'
import { publicacionesPropiasStore } from '../../services/publicacionesPropiasStore'
import { Usuario } from '../../domain/Usuario'
import { Carpeta } from '../../domain/Carpeta'
import { SeguirButton } from '../../components/perfil/SeguirButton'
import { CarpetaCard } from '../../components/carpetas/CarpetaCard'
import { PublicacionCard } from '../../components/publicacion/PublicacionCard'

/**
 * `PerfilPage`: visualización de los datos de un perfil de usuario, propio
 * o ajeno.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T065: "visualización
 * de datos propios/ajenos usando `Usuario.esPropio()`"; T074: "Integrar
 * `SeguirButton` en `PerfilPage`"; T080: "Integrar listado de carpetas
 * (hasta 100, con scroll/paginación si es necesario — FR-047)"; T087:
 * "Mostrar publicaciones propias en `PerfilPage` sin recargar la página
 * tras crear una publicación (cierra FR-011)") y
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
 * Muestra las publicaciones propias creadas durante la sesión actual
 * (T087) suscribiéndose a `publicacionesPropiasStore` (poblado por
 * `HomePage`/T041 al crear una publicación), filtradas por el `id` del
 * perfil que se está visualizando. No existe en `contracts/api-contracts.md`
 * un endpoint para listar históricamente las publicaciones de un usuario;
 * por eso esta tarea se limita a cerrar FR-011 ("mostrar la publicación
 * recién creada... sin [recargar]"), sin inventar un endpoint no
 * documentado para el historial completo de publicaciones del perfil.
 *
 * Integra la creación y eliminación de carpetas (T094, `carpetaService`,
 * T077): un formulario simple con nombre (FR-043, "indicando al menos un
 * nombre al crearlas") bloquea la creación si ya se alcanzó el límite de
 * 100 carpetas (`Carpeta.puedeCrearNuevaCarpeta()`, FR-047); ambas
 * acciones solo se ofrecen en el perfil propio, ya que `carpetaService.
 * crearCarpeta`/`eliminarCarpeta` operan sobre el usuario autenticado
 * (`POST /api/usuarios/me/carpetas`, `DELETE /api/carpetas/{id}`). Antes
 * de eliminar una carpeta, se solicita confirmación (`window.confirm`,
 * mismo enfoque ya usado en `SeguirButton`, T072) con un mensaje que
 * advierte que el contenido guardado en ella se perderá, aclarando que los
 * posts originales no se eliminan de la plataforma (FR-045).
 *
 * Fuera de alcance de esta tarea (tareas posteriores según `tasks.md`):
 * - Botón "Guardar en carpeta" en `PublicacionCard` (T081).
 * - Renombrar carpeta (no forma parte del enunciado de T094; el botón
 *   "Renombrar" de `CarpetaCard`, T078, queda sin `onRenombrar` por ahora).
 */
export function PerfilPage() {
  const { id } = useParams<{ id: string }>()
  const { usuario: usuarioActual } = useAuth()
  const [usuarioPerfil, setUsuarioPerfil] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [errorCarpetas, setErrorCarpetas] = useState<string | null>(null)
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState('')
  const [creandoCarpeta, setCreandoCarpeta] = useState(false)
  // Se llama incondicionalmente (regla de hooks de React), incluso antes de
  // que `usuarioPerfil`/`id` estén resueltos; filtra por cadena vacía hasta
  // entonces, lo que no coincide con ningún `autorId` real.
  const publicacionesPropias = publicacionesPropiasStore.usePublicacionesCreadasPor(id ?? '')

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

  const manejarCrearCarpeta = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (nombreNuevaCarpeta.trim() === '' || !Carpeta.puedeCrearNuevaCarpeta(carpetas)) {
      // FR-043: requiere al menos un nombre. FR-047: bloquea al llegar a
      // 100 carpetas (el backend también lo valida, ver `carpetaService`).
      return
    }
    if (!usuarioActual) {
      return
    }
    setCreandoCarpeta(true)
    setErrorCarpetas(null)
    try {
      const carpetaCreada = await carpetaService.crearCarpeta(nombreNuevaCarpeta.trim(), usuarioActual.id)
      setCarpetas((actual) => [carpetaCreada, ...actual])
      setNombreNuevaCarpeta('')
    } catch {
      setErrorCarpetas('No se pudo crear la carpeta. Volvé a intentarlo.')
    } finally {
      setCreandoCarpeta(false)
    }
  }

  const manejarEliminarCarpeta = async (carpeta: Carpeta) => {
    // FR-045: advertir que el contenido guardado se perderá, aclarando que
    // los posts originales no se eliminan de la plataforma.
    const confirmado = window.confirm(
      `¿Eliminar la carpeta "${carpeta.nombre}"? Se perderá el contenido guardado en ella (los posts no se eliminarán de la plataforma).`,
    )
    if (!confirmado) {
      return
    }
    setErrorCarpetas(null)
    try {
      await carpetaService.eliminarCarpeta(carpeta.id)
      setCarpetas((actual) => actual.filter((c) => c.id !== carpeta.id))
    } catch {
      setErrorCarpetas('No se pudo eliminar la carpeta. Volvé a intentarlo.')
    }
  }

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
        {esPropio && (
          <form onSubmit={manejarCrearCarpeta}>
            <label>
              Nueva carpeta
              <input
                type="text"
                value={nombreNuevaCarpeta}
                onChange={(evento) => setNombreNuevaCarpeta(evento.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={
                creandoCarpeta ||
                nombreNuevaCarpeta.trim() === '' ||
                !Carpeta.puedeCrearNuevaCarpeta(carpetas)
              }
            >
              Crear carpeta
            </button>
          </form>
        )}
        <div className="perfil-page__carpetas" style={{ overflowY: 'auto', maxHeight: '24rem' }}>
          {carpetas.map((carpeta) => (
            <CarpetaCard
              key={carpeta.id}
              carpeta={carpeta}
              usuarioActualId={usuarioActual?.id ?? ''}
              onEliminar={() => manejarEliminarCarpeta(carpeta)}
            />
          ))}
        </div>
      </section>

      {esPropio && publicacionesPropias.length > 0 && (
        <section>
          <h2>Publicaciones</h2>
          {publicacionesPropias.map((publicacion) => (
            <PublicacionCard key={publicacion.id} publicacion={publicacion} />
          ))}
        </section>
      )}
    </div>
  )
}
