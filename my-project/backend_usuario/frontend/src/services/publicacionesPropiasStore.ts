import { useEffect, useState } from 'react'
import type { Publicacion } from '../domain/Publicacion'

/**
 * Store en memoria (module-scoped) de publicaciones propias creadas
 * durante la sesión actual, compartido entre `HomePage` y `PerfilPage`.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-011: "El
 * sistema DEBE mostrar la publicación recién creada en el perfil del
 * usuario sin [recargar la página]") y
 * specs/001-user-interactions/tasks.md (T041: antepone la publicación
 * recién creada al feed de `HomePage`; T087: "Mostrar publicaciones
 * propias en `PerfilPage` sin recargar la página tras crear una
 * publicación (cierra FR-011)").
 *
 * No existe en `contracts/api-contracts.md` un endpoint para listar las
 * publicaciones de un usuario (`GET /api/usuarios/{id}` solo devuelve los
 * datos de perfil, no sus publicaciones); por lo tanto, esta tarea no
 * inventa un endpoint no documentado. En su lugar, FR-011 se satisface
 * propagando en memoria, dentro del cliente, la publicación recién creada
 * (ya disponible como valor de retorno de `crearPublicacion`, T037) hacia
 * cualquier página que la necesite mostrar sin recarga —en este caso,
 * `PerfilPage` cuando se visualiza el perfil propio— evitando duplicar la
 * lógica de creación y sin realizar ninguna llamada adicional a la API.
 */

type Escucha = (publicaciones: Publicacion[]) => void

let publicacionesCreadas: Publicacion[] = []
const escuchas = new Set<Escucha>()

/** Antepone una publicación recién creada y notifica a los suscriptores. */
function registrarPublicacionCreada(publicacion: Publicacion): void {
  publicacionesCreadas = [publicacion, ...publicacionesCreadas]
  escuchas.forEach((escucha) => escucha(publicacionesCreadas))
}

/**
 * Hook de suscripción: retorna las publicaciones creadas en esta sesión
 * cuyo `autorId` coincide con `autorId` (filtra para que cada perfil solo
 * vea las propias).
 */
function usePublicacionesCreadasPor(autorId: string): Publicacion[] {
  const [estado, setEstado] = useState(publicacionesCreadas)

  useEffect(() => {
    escuchas.add(setEstado)
    return () => {
      escuchas.delete(setEstado)
    }
  }, [])

  return estado.filter((publicacion) => publicacion.autorId === autorId)
}

export const publicacionesPropiasStore = {
  registrarPublicacionCreada,
  usePublicacionesCreadasPor,
}
