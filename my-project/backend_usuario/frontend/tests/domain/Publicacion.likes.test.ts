import { describe, expect, it } from 'vitest'
import { Publicacion } from '../../src/domain/Publicacion'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'

/**
 * Tests unitarios de las reglas de negocio de "like" de `Publicacion`.
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 * Cubre FR-001..FR-003: no se puede likear la propia publicación, y la
 * reversión ante error de la actualización optimista de like.
 */

function crearPublicacion(
  overrides: Partial<ConstructorParameters<typeof Publicacion>[0]> = {},
): Publicacion {
  return new Publicacion({
    id: 'publicacion-1',
    autorId: 'autor-1',
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
    tags: [],
    urlContenido: 'https://example.com/imagen.png',
    cantidadLikes: 5,
    likeadaPorMi: false,
    reportadaPorMi: false,
    creadaEn: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  })
}

describe('Publicacion — reglas de like', () => {
  describe('puedeDarLike', () => {
    it('retorna false si el usuario no está autenticado', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })

      expect(publicacion.puedeDarLike('')).toBe(false)
    })

    it('retorna false si el usuario actual es el autor de la publicación', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })

      expect(publicacion.puedeDarLike('autor-1')).toBe(false)
    })

    it('retorna false si la publicación no está ACTIVA', () => {
      const publicacion = crearPublicacion({
        autorId: 'autor-1',
        estado: EstadoPublicacion.REPORTADA,
      })

      expect(publicacion.puedeDarLike('usuario-2')).toBe(false)
    })

    it('retorna true si el usuario no es el autor, está autenticado y la publicación está ACTIVA', () => {
      const publicacion = crearPublicacion({
        autorId: 'autor-1',
        estado: EstadoPublicacion.ACTIVA,
      })

      expect(publicacion.puedeDarLike('usuario-2')).toBe(true)
    })
  })

  describe('aplicarLikeOptimista', () => {
    it('marca likeadaPorMi en true e incrementa cantidadLikes', () => {
      const publicacion = crearPublicacion({ likeadaPorMi: false, cantidadLikes: 5 })

      const resultado = publicacion.aplicarLikeOptimista()

      expect(resultado.likeadaPorMi).toBe(true)
      expect(resultado.cantidadLikes).toBe(6)
    })

    it('no muta la instancia original', () => {
      const publicacion = crearPublicacion({ likeadaPorMi: false, cantidadLikes: 5 })

      publicacion.aplicarLikeOptimista()

      expect(publicacion.likeadaPorMi).toBe(false)
      expect(publicacion.cantidadLikes).toBe(5)
    })
  })

  describe('revertirLikeOptimista', () => {
    it('revierte el estado de like aplicado optimistamente ante un error de API', () => {
      const original = crearPublicacion({ likeadaPorMi: false, cantidadLikes: 5 })
      const actualizada = original.aplicarLikeOptimista()

      const revertida = actualizada.revertirLikeOptimista()

      expect(revertida.likeadaPorMi).toBe(false)
      expect(revertida.cantidadLikes).toBe(5)
    })

    it('no decrementa cantidadLikes por debajo de 0', () => {
      const publicacion = crearPublicacion({ likeadaPorMi: true, cantidadLikes: 0 })

      const resultado = publicacion.revertirLikeOptimista()

      expect(resultado.cantidadLikes).toBe(0)
    })
  })
})
