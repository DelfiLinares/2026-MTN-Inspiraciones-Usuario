import { describe, expect, it } from 'vitest'
import { Filtro } from '../../src/domain/Filtro'
import { TipoFiltro } from '../../src/domain/enums/TipoFiltro'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'

/**
 * Tests unitarios de las reglas de negocio de `Filtro`.
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md (Entidad
 * `Filtro`) y specs/001-user-interactions/spec.md (FR-013, FR-015,
 * FR-018).
 *
 * Cubre: `distanciaHabilitada()`, `aQueryParams()`, `listaDeChips()` y
 * `quitarFiltro()`. Se escriben antes de implementar `Filtro` (T043); deben
 * fallar hasta que ese modelo exista.
 */

function crearFiltro(overrides: Partial<ConstructorParameters<typeof Filtro>[0]> = {}): Filtro {
  return new Filtro({
    texto: null,
    estilo: null,
    tecnica: null,
    tipoContenido: null,
    distanciaKm: null,
    geolocalizacionActiva: false,
    ...overrides,
  })
}

describe('Filtro — distanciaHabilitada', () => {
  it('retorna false si la geolocalización no está activa', () => {
    const filtro = crearFiltro({ geolocalizacionActiva: false })

    expect(filtro.distanciaHabilitada()).toBe(false)
  })

  it('retorna true si la geolocalización está activa', () => {
    const filtro = crearFiltro({ geolocalizacionActiva: true })

    expect(filtro.distanciaHabilitada()).toBe(true)
  })
})

describe('Filtro — tieneAlgunFiltroActivo', () => {
  it('retorna false cuando todos los campos de filtro (excepto texto) son null', () => {
    const filtro = crearFiltro({ texto: 'paisaje' })

    expect(filtro.tieneAlgunFiltroActivo()).toBe(false)
  })

  it('retorna true cuando al menos un campo de filtro no es null', () => {
    const filtro = crearFiltro({ estilo: 'realismo' })

    expect(filtro.tieneAlgunFiltroActivo()).toBe(true)
  })
})

describe('Filtro — listaDeChips', () => {
  it('devuelve un chip por cada filtro activo, sin incluir el texto libre', () => {
    const filtro = crearFiltro({
      texto: 'paisaje',
      estilo: 'realismo',
      tecnica: 'oleo',
      tipoContenido: TipoContenido.IMAGEN,
      distanciaKm: 10,
      geolocalizacionActiva: true,
    })

    const chips = filtro.listaDeChips()

    expect(chips).toHaveLength(4)
    expect(chips.map((chip) => chip.tipo)).toEqual(
      expect.arrayContaining([
        TipoFiltro.ESTILO,
        TipoFiltro.TECNICA,
        TipoFiltro.TIPO_CONTENIDO,
        TipoFiltro.DISTANCIA,
      ]),
    )
  })

  it('devuelve una lista vacía cuando no hay filtros activos', () => {
    const filtro = crearFiltro()

    expect(filtro.listaDeChips()).toEqual([])
  })
})

describe('Filtro — quitarFiltro', () => {
  it('retorna una copia con el campo correspondiente en null', () => {
    const filtro = crearFiltro({ estilo: 'realismo', tecnica: 'oleo' })

    const resultado = filtro.quitarFiltro(TipoFiltro.ESTILO)

    expect(resultado.estilo).toBeNull()
    expect(resultado.tecnica).toBe('oleo')
  })

  it('no muta la instancia original', () => {
    const filtro = crearFiltro({ estilo: 'realismo' })

    filtro.quitarFiltro(TipoFiltro.ESTILO)

    expect(filtro.estilo).toBe('realismo')
  })

  it('quita el filtro de distancia', () => {
    const filtro = crearFiltro({ distanciaKm: 10, geolocalizacionActiva: true })

    const resultado = filtro.quitarFiltro(TipoFiltro.DISTANCIA)

    expect(resultado.distanciaKm).toBeNull()
  })
})

describe('Filtro — aQueryParams', () => {
  it('serializa únicamente los campos no nulos como strings', () => {
    const filtro = crearFiltro({
      texto: 'paisaje',
      estilo: 'realismo',
      tipoContenido: TipoContenido.IMAGEN,
      distanciaKm: 10,
      geolocalizacionActiva: true,
    })

    expect(filtro.aQueryParams()).toEqual({
      texto: 'paisaje',
      estilo: 'realismo',
      tipoContenido: TipoContenido.IMAGEN,
      distanciaKm: '10',
    })
  })

  it('devuelve un objeto vacío cuando no hay ningún criterio activo', () => {
    const filtro = crearFiltro()

    expect(filtro.aQueryParams()).toEqual({})
  })

  it('no incluye distanciaKm si la geolocalización no está activa, aun con distanciaHabilitada en false', () => {
    const filtro = crearFiltro({ distanciaKm: 10, geolocalizacionActiva: false })

    expect(filtro.aQueryParams()).not.toHaveProperty('distanciaKm')
  })
})
