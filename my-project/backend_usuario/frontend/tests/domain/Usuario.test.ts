import { describe, expect, it } from 'vitest'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

/**
 * Tests unitarios de reglas de negocio de `Usuario`.
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 * Cubre FR-040 (botón "Seguir" oculto en perfil propio o sin autenticar) y
 * FR-042 (seguir/dejar de seguir/revertir en forma optimista).
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

  describe('aplicarSeguirOptimista', () => {
    it('marca sigoAEsteUsuario en true e incrementa cantidadSeguidores', () => {
      const usuario = crearUsuario({ sigoAEsteUsuario: false, cantidadSeguidores: 10 })

      const resultado = usuario.aplicarSeguirOptimista()

      expect(resultado.sigoAEsteUsuario).toBe(true)
      expect(resultado.cantidadSeguidores).toBe(11)
    })

    it('no muta la instancia original', () => {
      const usuario = crearUsuario({ sigoAEsteUsuario: false, cantidadSeguidores: 10 })

      usuario.aplicarSeguirOptimista()

      expect(usuario.sigoAEsteUsuario).toBe(false)
      expect(usuario.cantidadSeguidores).toBe(10)
    })
  })

  describe('aplicarDejarDeSeguirOptimista', () => {
    it('marca sigoAEsteUsuario en false y decrementa cantidadSeguidores', () => {
      const usuario = crearUsuario({ sigoAEsteUsuario: true, cantidadSeguidores: 10 })

      const resultado = usuario.aplicarDejarDeSeguirOptimista()

      expect(resultado.sigoAEsteUsuario).toBe(false)
      expect(resultado.cantidadSeguidores).toBe(9)
    })

    it('no decrementa cantidadSeguidores por debajo de 0', () => {
      const usuario = crearUsuario({ sigoAEsteUsuario: true, cantidadSeguidores: 0 })

      const resultado = usuario.aplicarDejarDeSeguirOptimista()

      expect(resultado.cantidadSeguidores).toBe(0)
    })
  })

  describe('revertirCambioSeguimiento', () => {
    it('restaura el estado anterior a la actualización optimista', () => {
      const previo = crearUsuario({ sigoAEsteUsuario: false, cantidadSeguidores: 10 })
      const actualizado = previo.aplicarSeguirOptimista()

      const revertido = actualizado.revertirCambioSeguimiento(previo)

      expect(revertido.sigoAEsteUsuario).toBe(previo.sigoAEsteUsuario)
      expect(revertido.cantidadSeguidores).toBe(previo.cantidadSeguidores)
    })
  })
})
