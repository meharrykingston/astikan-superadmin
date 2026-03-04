import { ModuleStub } from "../../components/ModuleStub"
import "./tenant-management.css"

export function TenantManagementPage() {
  return (
    <div className="tenant-management-page">
      <ModuleStub
        title="Tenant Management"
        subtitle="Create, activate, suspend, and configure corporate tenants."
        primaryAction="Add Tenant"
      />
    </div>
  )
}
