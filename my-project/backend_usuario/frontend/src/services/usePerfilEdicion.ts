/**
 * Servicio de aplicación (hook) para el formulario de edición de perfil.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-036: validación
 * de campos requeridos en cliente; FR-038: advertencia ante abandono con
 * cambios sin guardar; FR-039: previsualización de una nueva foto de perfil
 * antes de confirmar su subida) y
 * specs/001-user-interactions/contracts/api-contracts.md (`PATCH
 * /api/usuarios/me`, B7).
 *
 * `puedeEnviarPerfilEdicion` (T061) cubre exclusivamente la regla de
 * bloqueo de envío con campos obligatorios (`nombre`, `apellido`) vacíos.
 * `usePerfilEdicion` (esta tarea) integra dicha validación junto con:
 * - el estado completo del formulario (campos editables confirmados en
 *   B7: `usuario`, `bio`, `mail`, fecha de nacimiento día/mes/año,
 *   `redesSociales` dinámicas, `foto`/`banner`),
 * - la previsualización de la nueva foto de perfil vía `URL.createObjectURL`
 *   antes de confirmar la subida (FR-039),
 * - el flag `hayCambiosSinGuardar` para que la capa de presentación
 *   (`EditarPerfilPage`, T064) muestre la advertencia de abandono con
 *   cambios sin guardar (FR-038; el diálogo de confirmación en sí es
 *   responsabilidad de la UI, p. ej. mediante el evento `beforeunload` o un
 *   bloqueo de navegación),
 * - el envío mediante `perfilService.actualizarPerfil` (T062).
 */

import { useCallback, useMemo, useState } from 'react'
import { Usuario } from '../domain/Usuario'
import { perfilService, type DatosEdicionPerfil } from './perfilService'

/**
 * `true` si el formulario puede enviarse: requiere `nombre` y `apellido`
 * no vacíos (ni compuestos únicamente por espacios en blanco). FR-036
 *
 * Nota: los campos editables reales del perfil (B7) son `usuario`, `bio`,
 * `mail`, fecha de nacimiento y redes sociales; `nombre`/`apellido` son los
 * campos obligatorios de la entidad `Usuario` (`data-model.md`) usados como
 * base de esta validación, consistente con T061.
 */
export function puedeEnviarPerfilEdicion(datos: { nombre: string; apellido: string }): boolean {
  return datos.nombre.trim() !== '' && datos.apellido.trim() !== ''
}

export interface EstadoPerfilEdicion {
  nombre: string
  apellido: string
  usuario: string
  bio: string
  mail: string
  diaNacimiento: number | null
  mesNacimiento: number | null
  anioNacimiento: number | null
  redesSociales: string[]
  foto: File | null
  banner: File | null
  /** URL de previsualización de `foto` (FR-039), o `null` si no hay foto nueva. */
  fotoPreviewUrl: string | null
  /** URL de previsualización de `banner`, o `null` si no hay banner nuevo. */
  bannerPreviewUrl: string | null
  enviando: boolean
  error: string | null
}

function construirEstadoInicial(usuarioActual: Usuario): EstadoPerfilEdicion {
  return {
    nombre: usuarioActual.nombre,
    apellido: usuarioActual.apellido,
    usuario: usuarioActual.nombre,
    bio: usuarioActual.bio ?? '',
    mail: '',
    diaNacimiento: null,
    mesNacimiento: null,
    anioNacimiento: null,
    redesSociales: [],
    foto: null,
    banner: null,
    fotoPreviewUrl: null,
    bannerPreviewUrl: null,
    enviando: false,
    error: null,
  }
}

export interface UsePerfilEdicionResult {
  estado: EstadoPerfilEdicion
  /** `true` si el formulario puede enviarse (FR-036). */
  puedeEnviar: boolean
  /** `true` si existen cambios sin guardar respecto al estado original (FR-038). */
  hayCambiosSinGuardar: boolean
  establecerNombre: (nombre: string) => void
  establecerApellido: (apellido: string) => void
  establecerUsuario: (usuario: string) => void
  establecerBio: (bio: string) => void
  establecerMail: (mail: string) => void
  establecerFechaNacimiento: (dia: number, mes: number, anio: number) => void
  establecerRedesSociales: (redesSociales: string[]) => void
  /** Reemplaza la foto de perfil y genera su previsualización (FR-039). */
  establecerFoto: (foto: File | null) => void
  /** Reemplaza el banner y genera su previsualización. */
  establecerBanner: (banner: File | null) => void
  /** Envía el formulario. Retorna el `Usuario` actualizado, o `null` ante error/bloqueo. */
  enviar: () => Promise<Usuario | null>
}

/**
 * Estado y envío del formulario de edición de perfil (US-6). Ante un envío
 * exitoso (FR-037), el llamador recibe el `Usuario` actualizado para
 * reflejarlo de inmediato sin recargar la página.
 */
export function usePerfilEdicion(usuarioActual: Usuario): UsePerfilEdicionResult {
  const estadoInicial = useMemo(() => construirEstadoInicial(usuarioActual), [usuarioActual])
  const [estado, setEstado] = useState<EstadoPerfilEdicion>(estadoInicial)

  const establecerNombre = useCallback((nombre: string) => {
    setEstado((actual) => ({ ...actual, nombre, error: null }))
  }, [])

  const establecerApellido = useCallback((apellido: string) => {
    setEstado((actual) => ({ ...actual, apellido, error: null }))
  }, [])

  const establecerUsuario = useCallback((usuario: string) => {
    setEstado((actual) => ({ ...actual, usuario, error: null }))
  }, [])

  const establecerBio = useCallback((bio: string) => {
    setEstado((actual) => ({ ...actual, bio, error: null }))
  }, [])

  const establecerMail = useCallback((mail: string) => {
    setEstado((actual) => ({ ...actual, mail, error: null }))
  }, [])

  const establecerFechaNacimiento = useCallback((dia: number, mes: number, anio: number) => {
    setEstado((actual) => ({
      ...actual,
      diaNacimiento: dia,
      mesNacimiento: mes,
      anioNacimiento: anio,
      error: null,
    }))
  }, [])

  const establecerRedesSociales = useCallback((redesSociales: string[]) => {
    setEstado((actual) => ({ ...actual, redesSociales, error: null }))
  }, [])

  /**
   * Genera la URL de previsualización con `URL.createObjectURL` (FR-039):
   * el usuario ve la nueva foto antes de confirmar el envío del formulario.
   */
  const establecerFoto = useCallback((foto: File | null) => {
    setEstado((actual) => ({
      ...actual,
      foto,
      fotoPreviewUrl: foto ? URL.createObjectURL(foto) : null,
      error: null,
    }))
  }, [])

  const establecerBanner = useCallback((banner: File | null) => {
    setEstado((actual) => ({
      ...actual,
      banner,
      bannerPreviewUrl: banner ? URL.createObjectURL(banner) : null,
      error: null,
    }))
  }, [])

  const enviar = useCallback(async (): Promise<Usuario | null> => {
    const { nombre, apellido } = estado

    if (!puedeEnviarPerfilEdicion({ nombre, apellido })) {
      setEstado((actual) => ({
        ...actual,
        error: 'Completá tu nombre y apellido para guardar los cambios.',
      }))
      return null
    }

    setEstado((actual) => ({ ...actual, enviando: true, error: null }))

    const datos: DatosEdicionPerfil = {
      usuario: estado.usuario,
      bio: estado.bio,
      mail: estado.mail,
      diaNacimiento: estado.diaNacimiento ?? 0,
      mesNacimiento: estado.mesNacimiento ?? 0,
      anioNacimiento: estado.anioNacimiento ?? 0,
      redesSociales: estado.redesSociales,
      foto: estado.foto ?? undefined,
      banner: estado.banner ?? undefined,
    }

    try {
      const usuarioActualizado = await perfilService.actualizarPerfil(datos)
      // FR-037: el perfil se refleja de inmediato con el resultado del
      // servicio, sin requerir recarga de página.
      setEstado(construirEstadoInicial(usuarioActualizado))
      return usuarioActualizado
    } catch {
      setEstado((actual) => ({
        ...actual,
        enviando: false,
        error: 'No se pudieron guardar los cambios. Volvé a intentarlo.',
      }))
      return null
    }
  }, [estado])

  const hayCambiosSinGuardar = useMemo(() => {
    return (
      estado.nombre !== estadoInicial.nombre ||
      estado.apellido !== estadoInicial.apellido ||
      estado.usuario !== estadoInicial.usuario ||
      estado.bio !== estadoInicial.bio ||
      estado.mail !== estadoInicial.mail ||
      estado.diaNacimiento !== estadoInicial.diaNacimiento ||
      estado.mesNacimiento !== estadoInicial.mesNacimiento ||
      estado.anioNacimiento !== estadoInicial.anioNacimiento ||
      estado.redesSociales.join(',') !== estadoInicial.redesSociales.join(',') ||
      estado.foto !== null ||
      estado.banner !== null
    )
  }, [estado, estadoInicial])

  return {
    estado,
    puedeEnviar: puedeEnviarPerfilEdicion({ nombre: estado.nombre, apellido: estado.apellido }),
    hayCambiosSinGuardar,
    establecerNombre,
    establecerApellido,
    establecerUsuario,
    establecerBio,
    establecerMail,
    establecerFechaNacimiento,
    establecerRedesSociales,
    establecerFoto,
    establecerBanner,
    enviar,
  }
}
