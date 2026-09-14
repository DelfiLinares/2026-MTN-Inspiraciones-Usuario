import { useState } from 'react'
import { Skeleton } from './Skeleton'
import { TipoContenido } from '../../domain/enums/TipoContenido'

/**
 * Componente de presentación `LazyMedia`: renderiza imágenes o videos con
 * carga diferida, mostrando un `Skeleton` mientras el recurso no ha
 * terminado de cargar.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-020: "Las
 * imágenes y medios DEBEN cargarse con lazy loading para no bloquear el
 * render") y specs/001-user-interactions/research.md (sección "Lazy loading
 * de imágenes y medios").
 *
 * Usa el atributo nativo `loading="lazy"` como mecanismo principal, y
 * gestiona el estado de carga (`onLoad`/`onError`) para alternar entre el
 * `Skeleton` y el medio real. Componente puro de presentación
 * (Principio III): no invoca `fetch`, solo recibe la URL y el tipo de
 * contenido por props.
 */
export interface LazyMediaProps {
  /** URL del recurso a mostrar. */
  src: string
  /** Tipo de contenido, determina si se renderiza `<img>` o `<video>`. */
  tipoContenido: TipoContenido
  /** Texto alternativo para accesibilidad (solo aplica a imágenes). */
  alt?: string
  /** Clase CSS adicional para estilos específicos del contexto de uso. */
  className?: string
}

export function LazyMedia({ src, tipoContenido, alt = '', className }: LazyMediaProps) {
  const [cargado, setCargado] = useState(false)
  const [error, setError] = useState(false)

  const esVideo = tipoContenido === TipoContenido.VIDEO

  return (
    <div className={['lazy-media', className].filter(Boolean).join(' ')}>
      {!cargado && !error && <Skeleton width="100%" height="100%" />}
      {!error &&
        (esVideo ? (
          <video
            src={src}
            controls
            preload="metadata"
            style={{ display: cargado ? 'block' : 'none' }}
            onLoadedData={() => setCargado(true)}
            onError={() => setError(true)}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            style={{ display: cargado ? 'block' : 'none' }}
            onLoad={() => setCargado(true)}
            onError={() => setError(true)}
          />
        ))}
    </div>
  )
}
