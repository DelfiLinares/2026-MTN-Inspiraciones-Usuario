import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ReportButton } from '../../src/components/publicacion/ReportButton'
import { Publicacion } from '../../src/domain/Publicacion'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'
import * as AuthContextModule from '../../src/services/AuthContext'

/**
 * Test de componente: `ReportButton` deshabilitado en publicación propia y
 * en ya reportada.
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T069) y
 * specs/001-user-interactions/spec.md (FR-021, FR-023).
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

function mockearAuth(usuario: Usuario | null) {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    usuario,
    cargando: false,
    estaAutenticado: usuario !== null,
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
  })
}

function renderizarReportButton(publicacion: Publicacion, onAbrirModal = vi.fn()) {
  return render(
    <MemoryRouter>
      <ReportButton publicacion={publicacion} onAbrirModal={onAbrirModal} />
    </MemoryRouter>,
  )
}

describe('ReportButton', () => {
  it('no se renderiza (se oculta) en la publicación propia del usuario autenticado', () => {
    const autor = crearUsuario({ id: 'autor-1' })
    mockearAuth(autor)
    const publicacion = crearPublicacion({ autorId: 'autor-1' })

    renderizarReportButton(publicacion)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('está deshabilitado cuando la publicación ya fue reportada por el usuario actual', () => {
    const visitante = crearUsuario({ id: 'usuario-2' })
    mockearAuth(visitante)
    const publicacion = crearPublicacion({ autorId: 'autor-1', reportadaPorMi: true })

    renderizarReportButton(publicacion)

    const boton = screen.getByRole('button')
    expect(boton).toBeDisabled()
    expect(boton).toHaveTextContent('Ya reportaste esto')
  })

  it('no está deshabilitado cuando la publicación es ajena y no fue reportada', () => {
    const visitante = crearUsuario({ id: 'usuario-2' })
    mockearAuth(visitante)
    const publicacion = crearPublicacion({ autorId: 'autor-1', reportadaPorMi: false })

    renderizarReportButton(publicacion)

    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})
