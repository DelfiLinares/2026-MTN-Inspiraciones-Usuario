import { Desafio } from '../../domain/Desafio'

/**
 * `DesafiosPage`: stub de visualización básica de la pantalla "Desafíos".
 *
 * Fuente de verdad: specs/001-user-interactions/tasks.md (T082) y
 * specs/001-user-interactions/data-model.md (nota de la entidad `Desafio`:
 * "el detalle completo de reglas de Desafio... queda fuera del alcance de
 * spec.md (que solo cubre HU-01 a HU-09) y deberá especificarse en un
 * documento de spec separado antes de planificar su implementación
 * completa").
 *
 * Este stub se limita a mostrar una lista básica de desafíos (título,
 * descripción y vigencia mediante `Desafio.estaVigente()`, T016), sin
 * implementar participación, propuesta de nuevos desafíos, ni ningún caso
 * de uso que dependa de un servicio de backend aún no especificado. No
 * invoca `fetch` (Principio III); recibe los desafíos por props para no
 * anticipar un contrato de API que todavía no existe en `api-contracts.md`.
 */
export interface DesafiosPageProps {
  desafios?: Desafio[]
}

export function DesafiosPage({ desafios = [] }: DesafiosPageProps) {
  const ahora = new Date()

  return (
    <div className="desafios-page">
      <h1>Desafíos</h1>

      {desafios.length === 0 ? (
        <p>No hay desafíos para mostrar.</p>
      ) : (
        <ul className="desafios-page__lista">
          {desafios.map((desafio) => (
            <li key={desafio.id}>
              <h2>{desafio.titulo}</h2>
              <p>{desafio.descripcion}</p>
              <span>{desafio.estaVigente(ahora) ? 'Vigente' : 'Finalizado'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
