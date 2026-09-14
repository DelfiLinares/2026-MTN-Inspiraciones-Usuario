import { describe, expect, it } from 'vitest'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

/**
 * Tests unitarios de reglas de negocio de `Usuario`.
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T012) y
 * specs/001-user-interactions/data-model.md.
 * Cubre FR-040 (botón "Seguir" oculto en perfil propio o sin autenticar).
 *
 * Los tests de `aplicarSeguirOptimista()`/`aplicarDejarDeSeguirOptimista()`/
 * `revertirCambioSeguimiento()` (FR-042) viven en un archivo dedicado,
 * `tests/domain/Usuario.seguir.test.ts` (T090), según la división
 * explícita en tasks.md.
 */

function crearUsuario(overrides: Partial<ConstructorParameters<typeof Usuario>[0]> = {}): Usuario {
  return new Usuario({
    id: 'usuario-1',
    nombre: 'Ana',
    apellido: 'Pérez',
    bio: null,
    fotoUrl: null,
    rol: RolUsuario.USER,
    cantidadSeguidores: 10,
    sigoAEsteUsuario: false,
    ...overrides,
  })
}

describe('Usuario', () => {
  describe('esPropio', () => {
    it('retorna true cuando el id coincide con el usuario actual', () => {
      const usuario = crearUsuario({ id: 'usuario-1' })

      expect(usuario.esPropio('usuario-1')).toBe(true)
    })

    it('retorna false cuando el id no coincide con el usuario actual', () => {
      const usuario = crearUsuario({ id: 'usuario-1' })

      expect(usuario.esPropio('usuario-2')).toBe(false)
    })
  })

  describe('puedeVerBotonSeguir', () => {
    it('retorna false si el usuario visitante no está autenticado', () => {
      const usuario = crearUsuario({ id: 'usuario-1' })

      expect(usuario.puedeVerBotonSeguir('usuario-2', false)).toBe(false)
    })

    it('retorna false si el perfil es el propio, aun autenticado', () => {
      const usuario = crearUsuario({ id: 'usuario-1' })

      expect(usuario.puedeVerBotonSeguir('usuario-1', true)).toBe(false)
    })

    it('retorna true si está autenticado y el perfil no es el propio', () => {
      const usuario = crearUsuario({ id: 'usuario-1' })

      expect(usuario.puedeVerBotonSeguir('usuario-2', true)).toBe(true)
    })
  })
})
