import { Carpeta } from '../../domain/Carpeta'

/**
 * Componente presentacional `CarpetaCard`.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T078),
 * specs/001-user-interactions/data-model.md (Entidad `Carpeta`) y
 * specs/001-user-interactions/spec.md (FR-043: crear/renombrar/eliminar
 * carpetas).
 *
 * Representa una carpeta de posts guardados en el listado del perfil
 * (público, visible para cualquier visitante). Muestra su nombre y
 * cantidad de posts, y expone acciones opcionales de renombrar/eliminar
 * únicamente cuando el usuario actual es el propietario (`Carpeta.
 * puedeRenombrar()` / `Carpeta.puedeEliminar()`, T076).
 *
 * Componente puro de presentación (Principio III): no invoca `fetch` ni
 * conoce ningún caso de uso; delega la orquestación de las acciones a
 * quien lo instancie (`PerfilPage`, T080/T094) mediante callbacks.
 */
export interface CarpetaCardProps {
  carpeta: Carpeta
  usuarioActualId: string
  onRenombrar?: () => void
  onEliminar?: () => void
}

export function CarpetaCard({
  carpeta,
  usuarioActualId,
  onRenombrar,
  onEliminar,
}: CarpetaCardProps) {
  const puedeRenombrar = carpeta.puedeRenombrar(usuarioActualId)
  const puedeEliminar = carpeta.puedeEliminar(usuarioActualId)

  return (
    <article className="carpeta-card">
      <h3>{carpeta.nombre}</h3>
      <p>{carpeta.cantidadPosts} posts</p>
      {puedeRenombrar && (
        <button type="button" onClick={onRenombrar}>
          Renombrar
        </button>
      )}
      {puedeEliminar && (
        <button type="button" onClick={onEliminar}>
          Eliminar
        </button>
      )}
    </article>
  )
}
