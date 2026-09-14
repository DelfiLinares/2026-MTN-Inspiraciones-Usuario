import { useState } from 'react'
import { usePublicacionForm } from '../../services/usePublicacionForm'
import { archivoValidacion } from '../../services/archivoValidacion'
import { TipoContenido } from '../../domain/enums/TipoContenido'
import { TagAutocomplete, type TagSugerido } from './TagAutocomplete'
import { Spinner } from '../comunes/Spinner'
import type { Publicacion } from '../../domain/Publicacion'

/**
 * Modal `PublicacionForm`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-005, FR-006,
 * FR-007, FR-008, FR-009, FR-010, FR-012) y
 * specs/001-user-interactions/tasks.md (T040: "adjuntar archivo, tags,
 * barra de progreso/spinner de subida, estado de carga ≤5s").
 *
 * Orquesta la interacción de UI del formulario de nueva publicación,
 * delegando toda la lógica de negocio y de red a `usePublicacionForm`
 * (T038), que a su vez usa `crearPublicacion` (T037) y
 * `puedeEnviarPublicacion` (T034). La validación de tipo de archivo
 * (FR-008) usa `archivoValidacion` (T033). El límite de 10 tags y el
 * autocompletado se delegan a `TagAutocomplete` (T039).
 *
 * Principio III: este componente de presentación no invoca `fetch`
 * directamente; toda comunicación con el backend vive en las capas de
 * `services/`/`infrastructure/`.
 *
 * Nota (T036, B3): el autocompletado real de tags vía `GET /api/tags`
 * está bloqueado por confirmación de backend. Mientras tanto, este modal
 * pasa un arreglo de `sugerencias` vacío a `TagAutocomplete`, que ya
 * documenta esta limitación temporal.
 */
export interface PublicacionFormProps {
  /** `true` si el modal debe mostrarse. */
  abierto: boolean
  /** Cierra el modal sin crear la publicación. */
  onCerrar: () => void
  /** Notifica que la publicación se creó exitosamente (FR-011). */
  onPublicacionCreada?: (publicacion: Publicacion) => void
}

const TIPOS_CONTENIDO_DISPONIBLES = [
  TipoContenido.IMAGEN,
  TipoContenido.VIDEO,
  TipoContenido.MUSICA,
  TipoContenido.TUTORIAL,
]

export function PublicacionForm({ abierto, onCerrar, onPublicacionCreada }: PublicacionFormProps) {
  const {
    estado,
    puedeEnviar,
    establecerArchivo,
    establecerTipoContenido,
    establecerTags,
    enviar,
  } = usePublicacionForm()
  const [tagsSeleccionados, setTagsSeleccionados] = useState<TagSugerido[]>([])
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null)

  if (!abierto) {
    return null
  }

  const manejarCambioArchivo = (archivo: File | null) => {
    setErrorArchivo(null)
    if (archivo && estado.tipoContenido && !archivoValidacion.esTipoArchivoValido(archivo.type, estado.tipoContenido)) {
      // FR-008: mostrar un error claro cuando el tipo de archivo no cumpla
      // con el tipo de contenido seleccionado, sin bloquear la selección
      // de otro archivo.
      setErrorArchivo('El archivo seleccionado no coincide con el tipo de contenido elegido.')
      establecerArchivo(null)
      return
    }
    establecerArchivo(archivo)
  }

  const manejarSeleccionarTag = (tag: TagSugerido) => {
    const nuevaSeleccion = [...tagsSeleccionados, tag]
    setTagsSeleccionados(nuevaSeleccion)
    establecerTags(nuevaSeleccion.map((seleccionado) => seleccionado.id))
  }

  const manejarQuitarTag = (tagId: string) => {
    const nuevaSeleccion = tagsSeleccionados.filter((tag) => tag.id !== tagId)
    setTagsSeleccionados(nuevaSeleccion)
    establecerTags(nuevaSeleccion.map((seleccionado) => seleccionado.id))
  }

  const manejarEnvio = async () => {
    const publicacion = await enviar()
    if (publicacion) {
      setTagsSeleccionados([])
      setErrorArchivo(null)
      onPublicacionCreada?.(publicacion)
      onCerrar()
    }
  }

  return (
    <div className="publicacion-form-modal" role="dialog" aria-modal="true" aria-label="Nueva publicación">
      <div className="publicacion-form-modal__contenido">
        <button type="button" onClick={onCerrar} aria-label="Cerrar" disabled={estado.enviando}>
          ×
        </button>

        <label>
          Tipo de contenido
          <select
            value={estado.tipoContenido ?? ''}
            onChange={(evento) => establecerTipoContenido((evento.target.value || null) as TipoContenido | null)}
            disabled={estado.enviando}
          >
            <option value="">Seleccioná un tipo</option>
            {TIPOS_CONTENIDO_DISPONIBLES.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Archivo
          <input
            type="file"
            onChange={(evento) => manejarCambioArchivo(evento.target.files?.[0] ?? null)}
            disabled={estado.enviando || !estado.tipoContenido}
          />
        </label>
        {errorArchivo && <p role="alert">{errorArchivo}</p>}

        <TagAutocomplete
          tagsSeleccionados={tagsSeleccionados}
          sugerencias={[]}
          onCambiarBusqueda={() => {
            /* Autocompletado real bloqueado por B3 (T036); ver nota de cabecera. */
          }}
          onSeleccionarTag={manejarSeleccionarTag}
          onQuitarTag={manejarQuitarTag}
        />

        {estado.enviando && (
          <div role="status" aria-live="polite">
            <Spinner size={20} />
            <span>Subiendo... {estado.porcentajeProgreso}%</span>
          </div>
        )}

        {estado.error && <p role="alert">{estado.error}</p>}

        <button type="button" onClick={manejarEnvio} disabled={!puedeEnviar || estado.enviando}>
          Publicar
        </button>
      </div>
    </div>
  )
}
