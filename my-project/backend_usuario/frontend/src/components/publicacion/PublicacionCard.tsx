import { useState } from 'react'
import { Publicacion } from '../../domain/Publicacion'
import { LazyMedia } from '../comunes/LazyMedia'
import { LikeButton } from './LikeButton'
import { ReportButton } from './ReportButton'
import { ReportarModal } from './ReportarModal'
import { GuardarEnCarpetaModal } from '../carpetas/GuardarEnCarpetaModal'
import { useAuth } from '../../services/AuthContext'

/**
 * Componente presentacional `PublicacionCard`: tarjeta que muestra una
 * publicación en listados (feed, búsqueda), integrando `LazyMedia` (T025)
 * para el contenido multimedia, `LikeButton` (T028) para la interacción de
 * like, `ReportButton` + `ReportarModal` (T067, T068) para la interacción
 * de reporte, y el botón "Guardar en carpeta" + `GuardarEnCarpetaModal`
 * (T079) para guardar el post en una carpeta (FR-044).
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T030, T070,
 * T081).
 *
 * Componente puro de presentación (Principio III): no invoca `fetch` ni
 * conoce ningún caso de uso; recibe la `Publicacion` por props y delega la
 * lógica de interacción a los componentes hijos. El único estado propio es
 * la apertura/cierre de los modales, que es puramente de UI.
 *
 * El botón "Guardar en carpeta" solo se muestra a usuarios autenticados
 * (guardar posts en carpetas propias no tiene sentido para un visitante
 * anónimo, que no tiene carpetas).
 */
export interface PublicacionCardProps {
  publicacion: Publicacion
  /** Callback invocado cuando cambia el estado de like de la publicación. */
  onCambioLike?: (publicacion: Publicacion) => void
}

export function PublicacionCard({ publicacion, onCambioLike }: PublicacionCardProps) {
  const { estaAutenticado } = useAuth()
  const [modalReporteAbierto, setModalReporteAbierto] = useState(false)
  const [modalCarpetaAbierto, setModalCarpetaAbierto] = useState(false)

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
      <ReportButton
        publicacion={publicacion}
        onAbrirModal={() => setModalReporteAbierto(true)}
      />
      {estaAutenticado && (
        <button type="button" onClick={() => setModalCarpetaAbierto(true)}>
          Guardar en carpeta
        </button>
      )}
      <GuardarEnCarpetaModal
        abierto={modalCarpetaAbierto}
        publicacionId={publicacion.id}
        onCerrar={() => setModalCarpetaAbierto(false)}
      />
      <ReportarModal
        abierto={modalReporteAbierto}
        publicacionId={publicacion.id}
        onCerrar={() => setModalReporteAbierto(false)}
      />
    </article>
  )
}
