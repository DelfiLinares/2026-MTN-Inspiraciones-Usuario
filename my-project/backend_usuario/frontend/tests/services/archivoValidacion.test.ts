import { describe, expect, it } from 'vitest'
import { esTipoArchivoValido } from '../../src/services/archivoValidacion'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'

/**
 * Test unitario: validación de tipo de archivo (extensión/MIME) por
 * `TipoContenido`, sin validar tamaño en cliente.
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T033) y
 * specs/001-user-interactions/spec.md (FR-008).
 */

describe('archivoValidacion — validación de tipo por TipoContenido', () => {
  it('acepta un MIME image/* para TipoContenido.IMAGEN', () => {
    expect(esTipoArchivoValido('image/png', TipoContenido.IMAGEN)).toBe(true)
  })

  it('rechaza un MIME video/* para TipoContenido.IMAGEN', () => {
    expect(esTipoArchivoValido('video/mp4', TipoContenido.IMAGEN)).toBe(false)
  })

  it('acepta un MIME video/* para TipoContenido.VIDEO', () => {
    expect(esTipoArchivoValido('video/mp4', TipoContenido.VIDEO)).toBe(true)
  })

  it('rechaza un MIME image/* para TipoContenido.VIDEO', () => {
    expect(esTipoArchivoValido('image/jpeg', TipoContenido.VIDEO)).toBe(false)
  })

  it('acepta un MIME audio/* para TipoContenido.MUSICA', () => {
    expect(esTipoArchivoValido('audio/mpeg', TipoContenido.MUSICA)).toBe(true)
  })

  it('rechaza un MIME image/* para TipoContenido.MUSICA', () => {
    expect(esTipoArchivoValido('image/png', TipoContenido.MUSICA)).toBe(false)
  })

  it('acepta un MIME text/* para TipoContenido.TUTORIAL', () => {
    expect(esTipoArchivoValido('text/plain', TipoContenido.TUTORIAL)).toBe(true)
  })

  it('acepta application/pdf para TipoContenido.TUTORIAL', () => {
    expect(esTipoArchivoValido('application/pdf', TipoContenido.TUTORIAL)).toBe(true)
  })

  it('rechaza un MIME video/* para TipoContenido.TUTORIAL', () => {
    expect(esTipoArchivoValido('video/mp4', TipoContenido.TUTORIAL)).toBe(false)
  })
})
