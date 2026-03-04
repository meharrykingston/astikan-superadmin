import { ModuleStub } from "../../components/ModuleStub"
import "./ai-governance.css"

export function AIGovernancePage() {
  return (
    <div className="ai-governance-page">
      <ModuleStub
        title="AI Governance"
        subtitle="Configure prompts, model routing, and safety policies."
        primaryAction="Update Prompt Rules"
      />
    </div>
  )
}
