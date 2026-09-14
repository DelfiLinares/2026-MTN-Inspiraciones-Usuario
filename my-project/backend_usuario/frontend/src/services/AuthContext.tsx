import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Usuario } from '../domain/Usuario'
import { tokenStorage } from '../infrastructure/tokenStorage'

/**
 * Contexto de sesión de la aplicación.
 *
 * Fuente de verdad: specs/001-user-interactions/research.md (secciones
 * "Estado: Context API vs. Redux/Zustand" y "Almacenamiento del token de
 * sesión").
 *
 * Al montar, verifica si existe una sesión activa contra el backend
 * (`GET /api/auth/me`, vía `tokenStorage`) sin leer el token directamente
 * (se almacena en una cookie `httpOnly`). Expone el usuario actual y los
 * helpers `iniciarSesion`/`cerrarSesion` para que `authService` (T053) los
 * invoque tras un login/registro/logout exitoso.
 */
export interface AuthContextValue {
  /** Usuario autenticado, o `null` si no hay sesión activa. */
  usuario: Usuario | null
  /** `true` mientras se verifica la sesión inicial contra el backend. */
  cargando: boolean
  /** `true` si `usuario` no es `null`. */
  estaAutenticado: boolean
  /** Establece el usuario autenticado tras un login/registro exitoso. */
  iniciarSesion: (usuario: Usuario) => void
  /** Limpia el usuario autenticado tras un logout. */
  cerrarSesion: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false

    tokenStorage
      .verificarSesion()
      .then((usuarioActual) => {
        if (!cancelado) {
          setUsuario(usuarioActual)
        }
      })
      .catch(() => {
        if (!cancelado) {
          setUsuario(null)
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  const iniciarSesion = useCallback((nuevoUsuario: Usuario) => {
    setUsuario(nuevoUsuario)
  }, [])

  const cerrarSesion = useCallback(() => {
    setUsuario(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      estaAutenticado: usuario !== null,
      iniciarSesion,
      cerrarSesion,
    }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook de acceso al `AuthContext`. Lanza un error si se usa fuera de
 * `AuthProvider`, para detectar tempranamente errores de composición.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
