import { describe, expect, it } from 'vitest'
import { LIMITE_MAXIMO_TAGS, puedeAgregarTag } from '../../src/services/tagsService'

/**
 * Test unitario: límite máximo de 10 tags por publicación (FR-006).
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T032) y
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
