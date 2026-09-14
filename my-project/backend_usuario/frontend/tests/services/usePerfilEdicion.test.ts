import { describe, expect, it } from 'vitest'
import { puedeEnviarPerfilEdicion } from '../../src/services/usePerfilEdicion'

/**
 * Test unitario: formulario de edición de perfil bloquea envío con campos
 * obligatorios vacíos.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T061) y
 * specs/001-user-interactions/spec.md (FR-036: "El formulario de edición
 * de perfil DEBE validar en cliente los campos requeridos antes de
 * permitir el envío").
 *
 * Campos requeridos según specs/001-user-interactions/data-model.md
 * (Entidad `Usuario`): `nombre` y `apellido` (`bio` y `fotoUrl` son
 * `string | null`, es decir, opcionales).
 *
 * Se escribe antes de implementar `usePerfilEdicion` (T063, que integra
 * esta validación junto con la previsualización de foto y la advertencia
 * de cambios no guardados); debe fallar hasta que ese módulo exista.
 */

describe('usePerfilEdicion — bloqueo de envío con campos obligatorios vacíos', () => {
  it('no permite enviar si el nombre está vacío', () => {
    expect(puedeEnviarPerfilEdicion({ nombre: '', apellido: 'Pérez' })).toBe(false)
  })

  it('no permite enviar si el apellido está vacío', () => {
    expect(puedeEnviarPerfilEdicion({ nombre: 'Ana', apellido: '' })).toBe(false)
  })

  it('no permite enviar si ambos campos están vacíos', () => {
    expect(puedeEnviarPerfilEdicion({ nombre: '', apellido: '' })).toBe(false)
  })

  it('no permite enviar si el nombre contiene solo espacios en blanco', () => {
    expect(puedeEnviarPerfilEdicion({ nombre: '   ', apellido: 'Pérez' })).toBe(false)
  })

  it('permite enviar cuando nombre y apellido están completos', () => {
    expect(puedeEnviarPerfilEdicion({ nombre: 'Ana', apellido: 'Pérez' })).toBe(true)
  })
})
