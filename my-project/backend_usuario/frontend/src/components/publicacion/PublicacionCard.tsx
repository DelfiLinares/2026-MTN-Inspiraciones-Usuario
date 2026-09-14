import { Publicacion } from '../../domain/Publicacion'
import { LazyMedia } from '../comunes/LazyMedia'
import { LikeButton } from './LikeButton'

/**
 * Componente presentacional `PublicacionCard`: tarjeta que muestra una
 * publicación en listados (feed, búsqueda), integrando `LazyMedia` (T025)
 * para el contenido multimedia y `LikeButton` (T028) para la interacción
 * de like.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T030).
 *
 * Componente puro de presentación (Principio III): no invoca `fetch` ni
 * conoce ningún caso de uso; recibe la `Publicacion` por props y delega la
 * lógica de interacción a los componentes hijos.
 */
export interface PublicacionCardProps {
  publicacion: Publicacion
  /** Callback invocado cuando cambia el estado de like de la publicación. */
  onCambioLike?: (publicacion: Publicacion) => void
}

export function PublicacionCard({ publicacion, onCambioLike }: PublicacionCardProps) {
  return (
    <article className="publicacion-card">
      <LazyMedia
        src={publicacion.urlContenido}
        tipoContenido={publicacion.tipoContenido}
        alt={publicacion.tags.join(', ')}
      />
      {publicacion.tags.length > 0 && (
        <ul className="publicacion-card__tags">
          {publicacion.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <LikeButton publicacion={publicacion} onCambio={onCambioLike} />
    </article>
  )
}
