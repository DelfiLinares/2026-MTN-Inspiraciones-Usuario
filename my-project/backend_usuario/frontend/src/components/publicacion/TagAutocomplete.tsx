import { useState } from 'react'
import { TagChip } from './TagChip'
import { tagsService } from '../../services/tagsService'

/**
 * Componente presentacional `TagAutocomplete`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-006: agregar
 * tags exclusivamente desde un vocabulario controlado mediante
 * autocompletado, hasta un máximo de 10) y
 * specs/001-user-interactions/contracts/api-contracts.md (sección "3.
 * Publicaciones — Creación con tags", `GET /api/tags?query={texto}`).
 *
 * Nota (T036, B3): el contrato exacto del endpoint de autocompletado
 * (paginación, límite de resultados por búsqueda) requiere confirmación de
 * backend y aún no está implementado en `tagsService`. Por eso este
 * componente es puramente presentacional/controlado: recibe `sugerencias`
 * ya resueltas y notifica cambios de búsqueda vía `onCambiarBusqueda`, sin
 * invocar la API directamente (Principio III). Quien lo instancie (T040)
 * deberá conectar `onCambiarBusqueda` a la función de búsqueda de
 * `tagsService` una vez que T036 quede desbloqueado.
 *
 * El límite de 10 tags (FR-006) se aplica localmente mediante
 * `tagsService.puedeAgregarTag` (T032), independiente del endpoint de
 * autocompletado.
 */
export interface TagSugerido {
  id: string
  nombre: string
}

export interface TagAutocompleteProps {
  /** Tags ya seleccionados en el formulario. */
  tagsSeleccionados: TagSugerido[]
  /** Sugerencias a mostrar para la búsqueda actual (resueltas externamente). */
  sugerencias: TagSugerido[]
  /** `true` mientras se resuelven las sugerencias para la búsqueda actual. */
  cargandoSugerencias?: boolean
  /** Notifica el texto de búsqueda ingresado por el usuario. */
  onCambiarBusqueda: (valorBusqueda: string) => void
  /** Agrega un tag sugerido a la selección. */
  onSeleccionarTag: (tag: TagSugerido) => void
  /** Quita un tag de la selección. */
  onQuitarTag: (tagId: string) => void
}

export function TagAutocomplete({
  tagsSeleccionados,
  sugerencias,
  cargandoSugerencias = false,
  onCambiarBusqueda,
  onSeleccionarTag,
  onQuitarTag,
}: TagAutocompleteProps) {
  const [valorBusqueda, setValorBusqueda] = useState('')
  const puedeAgregarTag = tagsService.puedeAgregarTag(tagsSeleccionados.map((tag) => tag.id))

  const manejarCambioBusqueda = (valor: string) => {
    setValorBusqueda(valor)
    onCambiarBusqueda(valor)
  }

  const manejarSeleccion = (tag: TagSugerido) => {
    onSeleccionarTag(tag)
    setValorBusqueda('')
    onCambiarBusqueda('')
  }

  const sugerenciasDisponibles = sugerencias.filter(
    (sugerencia) => !tagsSeleccionados.some((seleccionado) => seleccionado.id === sugerencia.id),
  )

  return (
    <div className="tag-autocomplete">
      <div className="tag-autocomplete__seleccionados">
        {tagsSeleccionados.map((tag) => (
          <TagChip key={tag.id} nombre={tag.nombre} onQuitar={() => onQuitarTag(tag.id)} />
        ))}
      </div>
      <input
        type="text"
        value={valorBusqueda}
        onChange={(evento) => manejarCambioBusqueda(evento.target.value)}
        disabled={!puedeAgregarTag}
        placeholder={
          puedeAgregarTag
            ? 'Buscar tag...'
            : `Máximo ${tagsService.LIMITE_MAXIMO_TAGS} tags por publicación`
        }
        aria-label="Buscar tag"
      />
      {cargandoSugerencias && <span role="status">Buscando tags...</span>}
      {puedeAgregarTag && sugerenciasDisponibles.length > 0 && (
        <ul className="tag-autocomplete__sugerencias">
          {sugerenciasDisponibles.map((sugerencia) => (
            <li key={sugerencia.id}>
              <button type="button" onClick={() => manejarSeleccion(sugerencia)}>
                {sugerencia.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
