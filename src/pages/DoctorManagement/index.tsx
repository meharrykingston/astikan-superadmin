import { useState, type ChangeEvent } from "react"
import "../operations.css"

type DoctorRecord = {
  name: string
  specialty: string
  status: "Pending KYC" | "Pending Approval" | "Approved"
  licenses: string
  requestedBy: string
}

const seedDoctors: DoctorRecord[] = [
  { name: "Dr. Riza Yuhi", specialty: "Internal Medicine", status: "Pending KYC", licenses: "2/3", requestedBy: "Corporate A" },
  { name: "Dr. Sarah Chen", specialty: "Cardiology", status: "Approved", licenses: "3/3", requestedBy: "Corporate B" },
  { name: "Dr. Aarav Patel", specialty: "Pulmonology", status: "Pending Approval", licenses: "3/3", requestedBy: "Corporate C" },
]

function isImageOrPdf(file: File) {
  const lower = file.name.toLowerCase()
  const byExt = lower.endsWith(".pdf") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg")
  const byType =
    file.type === "application/pdf" ||
    file.type === "image/png" ||
    file.type === "image/jpeg"
  return byExt || byType
}

function isExcel(file: File) {
  const lower = file.name.toLowerCase()
  const byExt = lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")
  const byType =
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    file.type === "text/csv"
  return byExt || byType
}

export function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<DoctorRecord[]>(seedDoctors)
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "Internal Medicine",
    requestedBy: "",
    governmentId: null as File | null,
    licenseCertificate: null as File | null,
  })
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkCertificates, setBulkCertificates] = useState<File[]>([])
  const [message, setMessage] = useState("")

  function handleSingleDoctorFileChange(
    field: "governmentId" | "licenseCertificate",
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null
    if (!file) return
    if (!isImageOrPdf(file)) {
      setMessage("Certificates can only be image or PDF files.")
      return
    }
    setMessage("")
    setNewDoctor((prev) => ({ ...prev, [field]: file }))
  }

  function handleAddDoctor() {
    if (!newDoctor.name.trim() || !newDoctor.requestedBy.trim()) {
      setMessage("Enter doctor name and corporate requester.")
      return
    }
    if (!newDoctor.governmentId || !newDoctor.licenseCertificate) {
      setMessage("Upload one government ID and one license certificate.")
      return
    }

    setDoctors((prev) => [
      {
        name: newDoctor.name.trim(),
        specialty: newDoctor.specialty,
        status: "Pending KYC",
        licenses: "1/3",
        requestedBy: newDoctor.requestedBy.trim(),
      },
      ...prev,
    ])
    setMessage(`Doctor ${newDoctor.name.trim()} added with verification pending.`)
    setNewDoctor({
      name: "",
      specialty: "Internal Medicine",
      requestedBy: "",
      governmentId: null,
      licenseCertificate: null,
    })
  }

  function handleBulkExcelUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    if (!file) return
    if (!isExcel(file)) {
      setMessage("Bulk file must be Excel (.xlsx, .xls) or CSV.")
      return
    }
    setMessage("")
    setBulkFile(file)
  }

  function handleBulkCertificateUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    if (files.some((file) => !isImageOrPdf(file))) {
      setMessage("Bulk certificates can only be image or PDF files.")
      return
    }
    setMessage("")
    setBulkCertificates(files)
  }

  function processBulkUpload() {
    if (!bulkFile) {
      setMessage("Upload Excel/CSV doctor file first.")
      return
    }
    if (!bulkCertificates.length) {
      setMessage("Upload certificate files (image/pdf) for bulk onboarding.")
      return
    }
    setMessage(
      `Bulk upload queued with ${bulkFile.name} and ${bulkCertificates.length} certificate files.`
    )
  }

  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Doctor Access and Approvals</h1>
        <p>Super admin can add doctors, review verification, and approve teleconsult/OPD access.</p>
      </header>

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Doctors Onboarded</h2>
          <div className="ops-kpi">{doctors.length}</div>
          <div className="ops-kpi-sub">Live + pending doctor records</div>
        </article>
        <article className="ops-card">
          <h2>Approval Queue</h2>
          <div className="ops-kpi">{doctors.filter((item) => item.status !== "Approved").length}</div>
          <div className="ops-kpi-sub">Doctors pending KYC/approval</div>
        </article>
      </section>

      <section className="ops-card">
        <h2>Add Doctor</h2>
        <div className="ops-grid">
          <label>
            Doctor Name
            <input
              value={newDoctor.name}
              onChange={(event) => setNewDoctor((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Dr. Full Name"
            />
          </label>
          <label>
            Specialty
            <select
              value={newDoctor.specialty}
              onChange={(event) => setNewDoctor((prev) => ({ ...prev, specialty: event.target.value }))}
            >
              <option>Internal Medicine</option>
              <option>Cardiology</option>
              <option>Pulmonology</option>
              <option>Dermatology</option>
            </select>
          </label>
          <label>
            Requested By Corporate
            <input
              value={newDoctor.requestedBy}
              onChange={(event) => setNewDoctor((prev) => ({ ...prev, requestedBy: event.target.value }))}
              placeholder="Corporate name"
            />
          </label>
          <label>
            Government ID (Image/PDF)
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(event) => handleSingleDoctorFileChange("governmentId", event)} />
          </label>
          <label>
            License Certificate (Image/PDF)
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(event) => handleSingleDoctorFileChange("licenseCertificate", event)} />
          </label>
        </div>
        <div className="ops-actions">
          <button type="button" className="primary" onClick={handleAddDoctor}>Add Doctor</button>
        </div>
      </section>

      <section className="ops-card">
        <h2>Bulk Doctor Upload</h2>
        <div className="ops-grid">
          <label>
            Excel / CSV File
            <input type="file" accept=".xlsx,.xls,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleBulkExcelUpload} />
          </label>
          <label>
            Certificate Files (Image/PDF)
            <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={handleBulkCertificateUpload} />
          </label>
        </div>
        <div className="ops-actions">
          <button type="button" className="primary" onClick={processBulkUpload}>Process Bulk Upload</button>
        </div>
      </section>

      {message ? <p className="ops-kpi-sub">{message}</p> : null}

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Verification</th>
              <th>Status</th>
              <th>Requested By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={`${doctor.name}-${doctor.requestedBy}`}>
                <td>{doctor.name}</td>
                <td>{doctor.specialty}</td>
                <td>{doctor.licenses}</td>
                <td>
                  <span className={`ops-chip ${doctor.status === "Approved" ? "success" : "warning"}`}>{doctor.status}</span>
                </td>
                <td>{doctor.requestedBy}</td>
                <td className="ops-actions">
                  <button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setDoctors((prev) =>
                        prev.map((item) =>
                          item === doctor ? { ...item, status: "Approved", licenses: "3/3" } : item
                        )
                      )
                      setMessage(`${doctor.name} approved.`)
                    }}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
