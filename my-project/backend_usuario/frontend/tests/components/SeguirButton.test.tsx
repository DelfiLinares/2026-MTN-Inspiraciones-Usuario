import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SeguirButton } from '../../src/components/perfil/SeguirButton'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'
import * as AuthContextModule from '../../src/services/AuthContext'
import { perfilService } from '../../src/services/perfilService'

/**
 * Test de componente: `SeguirButton` oculto en perfil propio y confirma
 * antes de dejar de seguir.
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T073) y
 * specs/001-user-interactions/spec.md (FR-040, FR-041).
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

function mockearUseSeguirUsuario(usuario: Usuario, alternarSeguir = vi.fn()) {
  vi.spyOn(perfilService, 'useSeguirUsuario').mockReturnValue({
    usuario,
    enviando: false,
    error: null,
    alternarSeguir,
  })
  return alternarSeguir
}

function renderizarSeguirButton(usuario: Usuario) {
  return render(<SeguirButton usuario={usuario} />)
}

describe('SeguirButton', () => {
  it('no se renderiza (se oculta) en el perfil propio del usuario autenticado', () => {
    const usuarioActual = crearUsuario({ id: 'usuario-1' })
    mockearAuth(usuarioActual)
    const usuarioPerfil = crearUsuario({ id: 'usuario-1' })
    mockearUseSeguirUsuario(usuarioPerfil)

    renderizarSeguirButton(usuarioPerfil)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('no se renderiza (se oculta) cuando el visitante no está autenticado', () => {
    mockearAuth(null)
    const usuarioPerfil = crearUsuario({ id: 'usuario-2' })
    mockearUseSeguirUsuario(usuarioPerfil)

    renderizarSeguirButton(usuarioPerfil)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('se renderiza en un perfil ajeno de un usuario autenticado', () => {
    const usuarioActual = crearUsuario({ id: 'usuario-1' })
    mockearAuth(usuarioActual)
    const usuarioPerfil = crearUsuario({ id: 'usuario-2', sigoAEsteUsuario: false })
    mockearUseSeguirUsuario(usuarioPerfil)

    renderizarSeguirButton(usuarioPerfil)

    expect(screen.getByRole('button')).toHaveTextContent('Seguir')
  })

  it('pide confirmación antes de dejar de seguir y no ejecuta la acción si se cancela', () => {
    const usuarioActual = crearUsuario({ id: 'usuario-1' })
    mockearAuth(usuarioActual)
    const usuarioPerfil = crearUsuario({ id: 'usuario-2', sigoAEsteUsuario: true })
    const alternarSeguir = mockearUseSeguirUsuario(usuarioPerfil)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderizarSeguirButton(usuarioPerfil)
    fireEvent.click(screen.getByRole('button'))

    expect(confirmSpy).toHaveBeenCalled()
    expect(alternarSeguir).not.toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('ejecuta la acción de dejar de seguir si se confirma', () => {
    const usuarioActual = crearUsuario({ id: 'usuario-1' })
    mockearAuth(usuarioActual)
    const usuarioPerfil = crearUsuario({ id: 'usuario-2', sigoAEsteUsuario: true })
    const alternarSeguir = mockearUseSeguirUsuario(usuarioPerfil)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderizarSeguirButton(usuarioPerfil)
    fireEvent.click(screen.getByRole('button'))

    expect(confirmSpy).toHaveBeenCalled()
    expect(alternarSeguir).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })

  it('no pide confirmación al seguir (acción sin confirmación)', () => {
    const usuarioActual = crearUsuario({ id: 'usuario-1' })
    mockearAuth(usuarioActual)
    const usuarioPerfil = crearUsuario({ id: 'usuario-2', sigoAEsteUsuario: false })
    const alternarSeguir = mockearUseSeguirUsuario(usuarioPerfil)
    const confirmSpy = vi.spyOn(window, 'confirm')

    renderizarSeguirButton(usuarioPerfil)
    fireEvent.click(screen.getByRole('button'))

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(alternarSeguir).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
