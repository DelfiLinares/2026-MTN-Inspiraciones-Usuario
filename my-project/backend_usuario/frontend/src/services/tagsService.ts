/**
 * Servicio de aplicación para tags (vocabulario controlado de la
 * publicación).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-006: "hasta un
 * máximo de 10 tags por publicación") y
 * specs/001-user-interactions/contracts/api-contracts.md
 * (`GET /api/tags?query={texto}`).
 *
 * Confirmado (B3) vía `/speckit.clarify`: el catálogo de tags se presenta
 * como una página propia con todos los tags posibles organizados en
 * secciones (por categoría); no es un autocompletado incremental paginado.
 * Este servicio obtiene el vocabulario completo una única vez
 * (`obtenerCatalogoTags`) y expone un filtro en cliente
 * (`filtrarTagsPorTexto`) sobre ese conjunto ya cargado, en vez de paginar
 * resultados parciales por cada tecleo.
 */

import { httpClient } from '../infrastructure/httpClient'

export const LIMITE_MAXIMO_TAGS = 10

/** Tag del vocabulario controlado, tal como lo devuelve `GET /api/tags`. */
export interface Tag {
  id: string
  nombre: string
}

/**
 * `true` si aún se puede agregar un tag adicional a la selección actual
 * (menos de `LIMITE_MAXIMO_TAGS`). FR-006
 */
export function puedeAgregarTag(tagsSeleccionados: string[]): boolean {
  return tagsSeleccionados.length < LIMITE_MAXIMO_TAGS
}

/**
 * Obtiene el catálogo completo de tags (`GET /api/tags`), sin paginación
 * incremental (B3 confirmado). El resultado se carga una única vez y se
 * filtra en cliente vía `filtrarTagsPorTexto`.
 */
export function obtenerCatalogoTags(): Promise<Tag[]> {
  return httpClient.get<Tag[]>('/api/tags')
}

/**
 * Filtra en cliente el catálogo de tags ya cargado por texto (búsqueda de
 * subcadena, sin distinguir mayúsculas/minúsculas). B3 confirmado: el
 * filtrado ocurre sobre el vocabulario completo ya obtenido, no vía nuevas
 * llamadas paginadas al backend.
 */
export function filtrarTagsPorTexto(catalogo: Tag[], texto: string): Tag[] {
  const textoNormalizado = texto.trim().toLowerCase()
  if (textoNormalizado === '') {
    return catalogo
  }
  return catalogo.filter((tag) => tag.nombre.toLowerCase().includes(textoNormalizado))
}

export const tagsService = {
  LIMITE_MAXIMO_TAGS,
  puedeAgregarTag,
  obtenerCatalogoTags,
  filtrarTagsPorTexto,
}
