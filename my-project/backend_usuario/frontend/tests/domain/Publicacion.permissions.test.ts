import { describe, expect, it } from 'vitest'
import { Publicacion } from '../../src/domain/Publicacion'
import { Usuario } from '../../src/domain/Usuario'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'

/**
 * Tests unitarios de reglas de permisos de `Publicacion`.
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T015)
 * y specs/001-user-interactions/data-model.md
 *
 * Cubre:
 * - Solo el autor puede editar/eliminar.
 * - No se puede reportar publicación propia.
 * - No se puede reportar publicación ya reportada por mí.
 */

function crearPublicacion(
  overrides: Partial<ConstructorParameters<typeof Publicacion>[0]> = {},
): Publicacion {
  return new Publicacion({
    id: 'publicacion-1',
    autorId: 'autor-1',
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
    tags: ['arte'],
    urlContenido: 'https://example.com/imagen.png',
    cantidadLikes: 5,
    likeadaPorMi: false,
    reportadaPorMi: false,
    creadaEn: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  })
}

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
    cantidadSeguidores: 0,
    sigoAEsteUsuario: false,
    ...overrides,
  })
}

describe('Publicacion — reglas de permisos', () => {
  describe('puedeReportar', () => {
    it('retorna false si el usuario no está autenticado', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1', reportadaPorMi: false })

      expect(publicacion.puedeReportar('')).toBe(false)
    })

    it('retorna false si el usuario actual es autor de la publicación', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1', reportadaPorMi: false })

      expect(publicacion.puedeReportar('autor-1')).toBe(false)
    })

    it('retorna false si la publicación ya fue reportada por mí', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1', reportadaPorMi: true })

      expect(publicacion.puedeReportar('usuario-2')).toBe(false)
    })

    it('retorna true si no es propia, no fue reportada por mí y estoy autenticado', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1', reportadaPorMi: false })

      expect(publicacion.puedeReportar('usuario-2')).toBe(true)
    })
  })

  describe('puedeEditar', () => {
    it('retorna true solo para el autor', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })
      const autor = crearUsuario({ id: 'autor-1' })

      expect(publicacion.puedeEditar(autor)).toBe(true)
    })

    it('retorna false para un usuario que no es autor', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })
      const visitante = crearUsuario({ id: 'usuario-2' })

      expect(publicacion.puedeEditar(visitante)).toBe(false)
    })
  })

  describe('puedeEliminar', () => {
    it('retorna true solo para el autor', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })
      const autor = crearUsuario({ id: 'autor-1' })

      expect(publicacion.puedeEliminar(autor)).toBe(true)
    })

    it('retorna false para un usuario que no es autor', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })
      const visitante = crearUsuario({ id: 'usuario-2' })

      expect(publicacion.puedeEliminar(visitante)).toBe(false)
    })
  })
})
