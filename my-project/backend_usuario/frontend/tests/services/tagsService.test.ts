import { describe, expect, it } from 'vitest'
import { LIMITE_MAXIMO_TAGS, puedeAgregarTag, filtrarTagsPorTexto, Tag } from '../../src/services/tagsService'

/**
 * Test unitario: límite máximo de 10 tags por publicación (FR-006) y
 * filtrado en cliente del catálogo completo de tags (B3 confirmado).
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T032, T036) y
 * specs/001-user-interactions/spec.md (FR-006).
 */

describe('tagsService — límite máximo de tags', () => {
  it('LIMITE_MAXIMO_TAGS es 10', () => {
    expect(LIMITE_MAXIMO_TAGS).toBe(10)
  })

  it('permite agregar un tag cuando hay menos de 10 seleccionados', () => {
    const tags = Array.from({ length: 9 }, (_, i) => `tag-${i}`)

    expect(puedeAgregarTag(tags)).toBe(true)
  })

  it('no permite agregar un tag cuando ya hay 10 seleccionados', () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag-${i}`)

    expect(puedeAgregarTag(tags)).toBe(false)
  })

  it('permite agregar el primer tag cuando la selección está vacía', () => {
    expect(puedeAgregarTag([])).toBe(true)
  })
})

describe('tagsService — filtrarTagsPorTexto (B3: filtrado en cliente sobre catálogo completo)', () => {
  const catalogo: Tag[] = [
    { id: '1', nombre: 'Acuarela' },
    { id: '2', nombre: 'Óleo' },
    { id: '3', nombre: 'Digital' },
    { id: '4', nombre: 'Acrílico' },
  ]

  it('devuelve el catálogo completo si el texto está vacío', () => {
    expect(filtrarTagsPorTexto(catalogo, '')).toEqual(catalogo)
  })

  it('devuelve el catálogo completo si el texto es solo espacios', () => {
    expect(filtrarTagsPorTexto(catalogo, '   ')).toEqual(catalogo)
  })

  it('filtra por subcadena sin distinguir mayúsculas/minúsculas', () => {
    expect(filtrarTagsPorTexto(catalogo, 'acr')).toEqual([{ id: '4', nombre: 'Acrílico' }])
  })

  it('filtra múltiples coincidencias', () => {
    expect(filtrarTagsPorTexto(catalogo, 'ac')).toEqual([
      { id: '1', nombre: 'Acuarela' },
      { id: '4', nombre: 'Acrílico' },
    ])
  })

  it('devuelve un array vacío si no hay coincidencias', () => {
    expect(filtrarTagsPorTexto(catalogo, 'inexistente')).toEqual([])
  })
})
