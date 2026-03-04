import { ModuleStub } from "../../components/ModuleStub"
import "./access-control.css"

export function AccessControlPage() {
  return (
    <div className="access-control-page">
      <ModuleStub
        title="Identity and Access"
        subtitle="Manage super-admin roles, tenant roles, and permission templates."
        primaryAction="Create Role"
      />
    </div>
  )
}
