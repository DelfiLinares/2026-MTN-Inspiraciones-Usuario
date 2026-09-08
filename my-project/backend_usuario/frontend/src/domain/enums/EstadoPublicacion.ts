/**
 * Representa el estado de moderación/vida de una publicación, tal como lo informa
 * el backend.
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 */
export enum EstadoPublicacion {
  ACTIVA = 'ACTIVA',
  REPORTADA = 'REPORTADA',
  ELIMINADA = 'ELIMINADA',
}
