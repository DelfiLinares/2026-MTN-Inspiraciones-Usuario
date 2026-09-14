import { describe, expect, it } from 'vitest'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

/**
 * Tests unitarios de `Usuario.aplicarSeguirOptimista()` /
 * `aplicarDejarDeSeguirOptimista()` / `revertirCambioSeguimiento()`.
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T090) y
 * specs/001-user-interactions/spec.md (FR-042: "El sistema DEBE actualizar
 * de forma optimista el conteo de seguidores al seguir/dejar de seguir,
 * revirtiendo el estado y mostrando un error no bloqueante si la
 * operación falla en la API").
 *
 * Cubre la actualización optimista del contador de seguidores y su
 * reversión ante error de API, sin mutar la instancia original (Usuario
 * es inmutable, ver nota de diseño en `src/domain/Usuario.ts`).
 */

function crearUsuario(
  overrides: Partial<ConstructorParameters<typeof Usuario>[0]> = {},
): Usuario {
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

describe('Usuario — actualización optimista de seguimiento', () => {
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

    it('no muta la instancia original', () => {
      const usuario = crearUsuario({ sigoAEsteUsuario: true, cantidadSeguidores: 10 })

      usuario.aplicarDejarDeSeguirOptimista()

      expect(usuario.sigoAEsteUsuario).toBe(true)
      expect(usuario.cantidadSeguidores).toBe(10)
    })
  })

  describe('revertirCambioSeguimiento', () => {
    it('restaura el estado anterior a un seguir optimista ante error de API', () => {
      const previo = crearUsuario({ sigoAEsteUsuario: false, cantidadSeguidores: 10 })
      const actualizadoOptimista = previo.aplicarSeguirOptimista()

      // Simula que la llamada a la API falló tras aplicar la actualización
      // optimista (FR-042): se revierte al estado previo.
      const revertido = actualizadoOptimista.revertirCambioSeguimiento(previo)

      expect(revertido.sigoAEsteUsuario).toBe(false)
      expect(revertido.cantidadSeguidores).toBe(10)
    })

    it('restaura el estado anterior a un dejar de seguir optimista ante error de API', () => {
      const previo = crearUsuario({ sigoAEsteUsuario: true, cantidadSeguidores: 10 })
      const actualizadoOptimista = previo.aplicarDejarDeSeguirOptimista()

      const revertido = actualizadoOptimista.revertirCambioSeguimiento(previo)

      expect(revertido.sigoAEsteUsuario).toBe(true)
      expect(revertido.cantidadSeguidores).toBe(10)
    })
  })
})
