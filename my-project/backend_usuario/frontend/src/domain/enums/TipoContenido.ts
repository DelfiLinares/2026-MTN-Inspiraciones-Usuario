/**
 * Representa el tipo de contenido de una publicación. Determinado por el archivo
 * adjunto o seleccionado por el usuario (FR-005).
 *
 * Fuente de verdad: specs/001-user-interactions/data-model.md
 */
export enum TipoContenido {
  IMAGEN = 'IMAGEN',
  VIDEO = 'VIDEO',
  MUSICA = 'MUSICA',
  TUTORIAL = 'TUTORIAL',
}
