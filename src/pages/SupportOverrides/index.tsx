import { ModuleStub } from "../../components/ModuleStub"
import "./support-overrides.css"

export function SupportOverridesPage() {
  return (
    <div className="support-overrides-page">
      <ModuleStub
        title="Support and Overrides"
        subtitle="Handle escalations, booking overrides, and admin interventions."
        primaryAction="Open Support Case"
      />
    </div>
  )
}
