import { describe, expect, it } from 'vitest'
import { cumpleCriteriosPassword, contrasenasCoinciden, puedeEnviarRegistro } from '../../src/services/registroForm'

/**
 * Test unitario: formulario de registro bloquea envío con campos
 * incompletos o contraseñas que no coinciden (FR-031).
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T057) y
 * specs/001-user-interactions/spec.md (FR-031: "El formulario de registro
 * DEBE solicitar nombre, apellido, mail, contraseña y confirmación de
 * contraseña, e indicar en tiempo real si la contraseña cumple los
 * criterios mínimos de seguridad").
 *
 * Criterios de contraseña confirmados (B1) vía `/speckit.clarify`: mínimo
 * 8 caracteres, al menos una letra mayúscula y al menos un símbolo.
 *
 * Se escribe antes de implementar `registroForm` (T058); debe fallar hasta
 * que ese módulo exista.
 */

describe('registroForm — cumpleCriteriosPassword (B1: mínimo 8 caracteres, una mayúscula, un símbolo)', () => {
  it('retorna false para una contraseña con menos de 8 caracteres', () => {
    expect(cumpleCriteriosPassword('Abc1!')).toBe(false)
  })

  it('retorna false para una contraseña sin mayúsculas', () => {
    expect(cumpleCriteriosPassword('abcdefg1!')).toBe(false)
  })

  it('retorna false para una contraseña sin símbolos', () => {
    expect(cumpleCriteriosPassword('Abcdefgh1')).toBe(false)
  })

  it('retorna true para una contraseña que cumple los tres criterios', () => {
    expect(cumpleCriteriosPassword('Abcdefg1!')).toBe(true)
  })
})

describe('registroForm — contrasenasCoinciden', () => {
  it('retorna false si las contraseñas no coinciden', () => {
    expect(contrasenasCoinciden('Abcdefg1!', 'Abcdefg1?')).toBe(false)
  })

  it('retorna true si las contraseñas coinciden', () => {
    expect(contrasenasCoinciden('Abcdefg1!', 'Abcdefg1!')).toBe(true)
  })
})

describe('registroForm — puedeEnviarRegistro', () => {
  const datosValidos = {
    nombre: 'Ana',
    apellido: 'Gómez',
    mail: 'ana@example.com',
    password: 'Abcdefg1!',
    confirmacionPassword: 'Abcdefg1!',
  }

  it('retorna false si el nombre está vacío', () => {
    expect(puedeEnviarRegistro({ ...datosValidos, nombre: '' })).toBe(false)
  })

  it('retorna false si el apellido está vacío', () => {
    expect(puedeEnviarRegistro({ ...datosValidos, apellido: '' })).toBe(false)
  })

  it('retorna false si el mail está vacío', () => {
    expect(puedeEnviarRegistro({ ...datosValidos, mail: '' })).toBe(false)
  })

  it('retorna false si el mail tiene formato inválido', () => {
    expect(puedeEnviarRegistro({ ...datosValidos, mail: 'no-es-un-mail' })).toBe(false)
  })

  it('retorna false si la contraseña no cumple los criterios mínimos', () => {
    expect(
      puedeEnviarRegistro({ ...datosValidos, password: 'abc', confirmacionPassword: 'abc' }),
    ).toBe(false)
  })

  it('retorna false si las contraseñas no coinciden', () => {
    expect(puedeEnviarRegistro({ ...datosValidos, confirmacionPassword: 'Otra1!abcdef' })).toBe(
      false,
    )
  })

  it('retorna true si todos los campos son válidos y las contraseñas coinciden', () => {
    expect(puedeEnviarRegistro(datosValidos)).toBe(true)
  })
})
