/**
 * Servicio de aplicación `registroForm`: validación en cliente del
 * formulario de registro (FR-031).
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-031: "El
 * formulario de registro DEBE solicitar nombre, apellido, mail,
 * contraseña y confirmación de contraseña, e indicar en tiempo real si la
 * contraseña cumple los criterios mínimos de seguridad").
 *
 * Confirmado (B1) vía `/speckit.clarify`: criterios de fortaleza de
 * contraseña — mínimo 8 caracteres, al menos una letra mayúscula y al
 * menos un símbolo.
 *
 * Consumido por `RegistroPage` (T059) para el indicador de fortaleza en
 * tiempo real y para deshabilitar el envío del formulario mientras la
 * validación no se cumpla.
 */

const REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REGEX_MAYUSCULA = /[A-Z]/
const REGEX_SIMBOLO = /[^A-Za-z0-9]/
const LONGITUD_MINIMA_PASSWORD = 8

/**
 * `true` si `mail` tiene formato de email válido.
 */
export function esMailValido(mail: string): boolean {
  return REGEX_MAIL.test(mail)
}

/**
 * `true` si `password` cumple los criterios mínimos de seguridad
 * confirmados (B1): al menos 8 caracteres, una mayúscula y un símbolo.
 */
export function cumpleCriteriosPassword(password: string): boolean {
  return (
    password.length >= LONGITUD_MINIMA_PASSWORD &&
    REGEX_MAYUSCULA.test(password) &&
    REGEX_SIMBOLO.test(password)
  )
}

/**
 * `true` si `password` y `confirmacionPassword` son idénticas.
 */
export function contrasenasCoinciden(password: string, confirmacionPassword: string): boolean {
  return password === confirmacionPassword
}

export interface DatosRegistro {
  nombre: string
  apellido: string
  mail: string
  password: string
  confirmacionPassword: string
}

/**
 * `true` si el formulario de registro puede enviarse: todos los campos
 * completos, mail con formato válido, contraseña que cumple los
 * criterios mínimos (B1) y ambas contraseñas coincidentes. FR-031.
 */
export function puedeEnviarRegistro(datos: DatosRegistro): boolean {
  return (
    datos.nombre.trim() !== '' &&
    datos.apellido.trim() !== '' &&
    datos.mail.trim() !== '' &&
    esMailValido(datos.mail) &&
    cumpleCriteriosPassword(datos.password) &&
    contrasenasCoinciden(datos.password, datos.confirmacionPassword)
  )
}

export const registroForm = {
  esMailValido,
  cumpleCriteriosPassword,
  contrasenasCoinciden,
  puedeEnviarRegistro,
}
