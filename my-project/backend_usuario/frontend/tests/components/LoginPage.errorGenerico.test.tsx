import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '../../src/pages/login/LoginPage'
import { authService } from '../../src/services/authService'
import { ApiError } from '../../src/infrastructure/httpClient'
import * as AuthContextModule from '../../src/services/AuthContext'

/**
 * Test de componente: `LoginPage` muestra un mensaje de error genérico
 * ante credenciales incorrectas, sin revelar el campo específico.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-027) y
 * specs/001-user-interactions/contracts/api-contracts.md (sección "1.
 * Autenticación", `POST /api/auth/login` → `401 { codigo:
 * "CREDENCIALES_INVALIDAS" }`).
 */

function mockearAuth() {
  vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
    usuario: null,
    cargando: false,
    estaAutenticado: false,
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
  })
}

function renderizarLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage — mensaje de error genérico (FR-027)', () => {
  beforeEach(() => {
    mockearAuth()
  })

  it('muestra un único mensaje de error genérico ante credenciales incorrectas (401)', async () => {
    vi.spyOn(authService, 'iniciarSesionConMail').mockRejectedValue(
      new ApiError('Credenciales inválidas', 401, { codigo: 'CREDENCIALES_INVALIDAS' }),
    )

    renderizarLoginPage()

    fireEvent.change(screen.getByLabelText('Mail'), {
      target: { value: 'usuario@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'contraseña-incorrecta' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    const mensajeError = await waitFor(() => screen.getByRole('alert'))
    expect(mensajeError).toHaveTextContent('Mail o contraseña incorrectos.')

    // No debe revelar cuál de los dos campos es el incorrecto.
    expect(mensajeError.textContent?.toLowerCase()).not.toContain('mail incorrecto')
    expect(mensajeError.textContent?.toLowerCase()).not.toContain('contraseña incorrecta')
  })

  it('no muestra ningún mensaje de error antes de intentar iniciar sesión', () => {
    renderizarLoginPage()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
