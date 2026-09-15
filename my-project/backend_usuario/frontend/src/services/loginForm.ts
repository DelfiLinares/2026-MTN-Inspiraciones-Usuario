/**
 * Servicio de aplicación `loginForm`: validación en cliente del
 * formulario de login (FR-026).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-026: "El
 * formulario de login DEBE validar en cliente que ambos campos (mail y
 * contraseña) estén completos y que el mail tenga formato válido antes de
 * enviar la solicitud").
 *
 * Consumido por `LoginPage` (T054) para deshabilitar el envío del
 * formulario mientras la validación no se cumpla.
 */

const REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * `true` si `mail` tiene formato de email válido (no vacío, con `@` y
 * dominio). FR-026.
 */
export function esMailValido(mail: string): boolean {
  return REGEX_MAIL.test(mail)
}

/**
 * `true` si el formulario de login puede enviarse: ambos campos completos
 * y `mail` con formato válido. FR-026.
 */
export function puedeEnviarLogin(mail: string, password: string): boolean {
  return mail.trim() !== '' && password.trim() !== '' && esMailValido(mail)
}

export const loginForm = {
  esMailValido,
  puedeEnviarLogin,
}
