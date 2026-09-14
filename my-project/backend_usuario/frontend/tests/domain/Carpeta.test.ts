import { describe, expect, it } from 'vitest'
import { Carpeta } from '../../src/domain/Carpeta'

/**
 * Tests unitarios de reglas de `Carpeta`.
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T075),
 * specs/001-user-interactions/data-model.md (Entidad `Carpeta`) y
 * specs/001-user-interactions/spec.md (FR-043, FR-047, US-9 AC-06).
 *
 * Cubre:
 * - `puedeEliminar()`: solo el propietario puede eliminar la carpeta.
 * - `puedeRenombrar()`: misma regla que `puedeEliminar()`.
 * - `puedeCrearNuevaCarpeta()`: regla a nivel de colección, `false` si ya
 *   existen 100 carpetas (límite duro, FR-047).
 *
 * NOTA (TDD, Principio I): este test se escribe antes de crear
 * `src/domain/Carpeta.ts` (T076, que depende de T075), por lo que fallará
 * hasta que dicha tarea se implemente.
 */

function crearCarpeta(
  overrides: Partial<ConstructorParameters<typeof Carpeta>[0]> = {},
): Carpeta {
  return new Carpeta({
    id: 'carpeta-1',
    nombre: 'Favoritos',
    propietarioId: 'usuario-1',
    cantidadPosts: 0,
    ...overrides,
  })
}

describe('Carpeta — reglas de dominio', () => {
  describe('puedeEliminar', () => {
    it('retorna true si el usuario actual es el propietario', () => {
      const carpeta = crearCarpeta({ propietarioId: 'usuario-1' })

      expect(carpeta.puedeEliminar('usuario-1')).toBe(true)
    })

    it('retorna false si el usuario actual no es el propietario', () => {
      const carpeta = crearCarpeta({ propietarioId: 'usuario-1' })

      expect(carpeta.puedeEliminar('usuario-2')).toBe(false)
    })

    it('retorna false si no hay usuario autenticado', () => {
      const carpeta = crearCarpeta({ propietarioId: 'usuario-1' })

      expect(carpeta.puedeEliminar('')).toBe(false)
    })
  })

  describe('puedeRenombrar', () => {
    it('retorna true si el usuario actual es el propietario', () => {
      const carpeta = crearCarpeta({ propietarioId: 'usuario-1' })

      expect(carpeta.puedeRenombrar('usuario-1')).toBe(true)
    })

    it('retorna false si el usuario actual no es el propietario', () => {
      const carpeta = crearCarpeta({ propietarioId: 'usuario-1' })

      expect(carpeta.puedeRenombrar('usuario-2')).toBe(false)
    })

    it('retorna false si no hay usuario autenticado', () => {
      const carpeta = crearCarpeta({ propietarioId: 'usuario-1' })

      expect(carpeta.puedeRenombrar('')).toBe(false)
    })
  })

  describe('puedeCrearNuevaCarpeta', () => {
    it('retorna true si hay menos de 100 carpetas actuales', () => {
      const carpetasActuales = Array.from({ length: 99 }, (_, indice) =>
        crearCarpeta({ id: `carpeta-${indice}` }),
      )

      expect(Carpeta.puedeCrearNuevaCarpeta(carpetasActuales)).toBe(true)
    })

    it('retorna false si ya existen exactamente 100 carpetas', () => {
      const carpetasActuales = Array.from({ length: 100 }, (_, indice) =>
        crearCarpeta({ id: `carpeta-${indice}` }),
      )

      expect(Carpeta.puedeCrearNuevaCarpeta(carpetasActuales)).toBe(false)
    })

    it('retorna false si hay más de 100 carpetas', () => {
      const carpetasActuales = Array.from({ length: 101 }, (_, indice) =>
        crearCarpeta({ id: `carpeta-${indice}` }),
      )

      expect(Carpeta.puedeCrearNuevaCarpeta(carpetasActuales)).toBe(false)
    })

    it('retorna true si la lista de carpetas actuales está vacía', () => {
      expect(Carpeta.puedeCrearNuevaCarpeta([])).toBe(true)
    })
  })
})
 