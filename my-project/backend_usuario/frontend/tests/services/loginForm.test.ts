import { describe, expect, it } from 'vitest'
import { puedeEnviarLogin, esMailValido } from '../../src/services/loginForm'

/**
 * Test unitario: formulario de login bloquea envío con campos vacíos o
 * mail inválido.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T049) y
 * specs/001-user-interactions/spec.md (FR-026: "El formulario de login
 * DEBE validar en cliente que ambos campos (mail y contraseña) estén
 * completos y que el mail tenga formato válido antes de enviar la
 * solicitud").
 *
 * Se escribe antes de implementar `loginForm` (T054, que integra esta
 * validación en `LoginPage`); debe fallar hasta que ese módulo exista.
 */

describe('loginForm — esMailValido', () => {
  it('retorna false para un mail sin formato válido', () => {
    expect(esMailValido('no-es-un-mail')).toBe(false)
  })

  it('retorna false para un mail vacío', () => {
    expect(esMailValido('')).toBe(false)
  })

  it('retorna true para un mail con formato válido', () => {
    expect(esMailValido('usuario@example.com')).toBe(true)
  })
})

describe('loginForm — puedeEnviarLogin', () => {
  it('retorna false si el mail está vacío', () => {
    expect(puedeEnviarLogin('', 'contrasena123')).toBe(false)
  })

  it('retorna false si la contraseña está vacía', () => {
    expect(puedeEnviarLogin('usuario@example.com', '')).toBe(false)
  })

  it('retorna false si el mail tiene formato inválido', () => {
    expect(puedeEnviarLogin('no-es-un-mail', 'contrasena123')).toBe(false)
  })

  it('retorna true si ambos campos están completos y el mail es válido', () => {
    expect(puedeEnviarLogin('usuario@example.com', 'contrasena123')).toBe(true)
  })
})
