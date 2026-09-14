import { describe, expect, it } from 'vitest'
import { puedeEnviarPublicacion } from '../../src/services/usePublicacionForm'

/**
 * Test unitario: formulario de publicación bloquea envío sin archivo
 * adjunto.
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T034) y
 * specs/001-user-interactions/spec.md (FR-007).
 */

describe('usePublicacionForm — bloqueo de envío sin archivo adjunto', () => {
  it('no permite enviar el formulario cuando no hay archivo adjunto', () => {
    expect(puedeEnviarPublicacion(null)).toBe(false)
  })

  it('permite enviar el formulario cuando hay un archivo adjunto', () => {
    const archivo = new File(['contenido'], 'imagen.png', { type: 'image/png' })

    expect(puedeEnviarPublicacion(archivo)).toBe(true)
  })
})
