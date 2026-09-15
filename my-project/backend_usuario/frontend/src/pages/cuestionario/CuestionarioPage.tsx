import { useNavigate } from 'react-router-dom'

/**
 * `CuestionarioPage`: flujo de cuestionario de onboarding post-registro.
 *
 * Fuente de verdad: specs/001-user-interactions/spec.md (FR-033: "El
 * sistema DEBE iniciar el flujo de cuestionario de onboarding
 * inmediatamente después de un registro exitoso"; US-5 Acceptance
 * Scenario 4: "Given un registro exitoso, When se completa el alta, Then
 * se inicia el flujo de cuestionario de onboarding").
 *
 * `RegistroPage` (T059) navega a esta ruta (`/cuestionario`) tras un
 * registro exitoso (mail/contraseña o social).
 *
 * Nota de alcance: `specs/001-user-interactions/contracts/api-contracts.md`
 * no define un contrato de backend para el contenido/envío de este
 * cuestionario (no hay ninguna sección ni ambigüedad B1–B7 al respecto).
 * Por lo tanto, esta tarea implementa únicamente la pantalla de onboarding
 * como un paso de flujo post-registro (FR-033), con una acción para
 * finalizarlo y continuar al home, sin invocar ningún endpoint no
 * especificado (Principio VIII: nunca asumir contratos no documentados).
 */
export function CuestionarioPage() {
  const navigate = useNavigate()

  const manejarFinalizar = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="cuestionario-page">
      <h1>Contanos sobre vos</h1>
      <p>
        Este breve cuestionario nos ayuda a personalizar tu experiencia en la comunidad de
        inspiración artística.
      </p>
      <button type="button" onClick={manejarFinalizar}>
        Continuar
      </button>
    </div>
  )
}
