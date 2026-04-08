import { useEffect, useMemo, useState } from "react"
import { Eye, EyeOff, FileCheck, Pencil, Plus, ReceiptIndianRupee, Trash2, X } from "lucide-react"
import "../operations.css"
import {
  approveCompanyAdmin,
  deleteCompanyAdmin,
  fetchCompaniesAdmin,
  submitCorporateRegistration,
  type CompanyAdminRecord,
  type CompanyAdminMeta,
  type CorporateRegistrationPayload,
} from "../../services/companiesAdminApi"

type CorporateAccountsPageProps = {
  initialFilter?: "pending" | "active" | "all"
}

export function CorporateAccountsPage({ initialFilter }: CorporateAccountsPageProps) {
  const [companies, setCompanies] = useState<CompanyAdminRecord[]>([])
  const [meta, setMeta] = useState<CompanyAdminMeta>({
    total: 0,
    active: 0,
    pending: 0,
    inactive: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 50
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter ?? "")

  const [showRegister, setShowRegister] = useState(false)
  const [saving, setSaving] = useState(false)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({})
  const [editingCompany, setEditingCompany] = useState<CompanyAdminRecord | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<string[] | null>(null)
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [reviewCompany, setReviewCompany] = useState<CompanyAdminRecord | null>(null)
  const [approving, setApproving] = useState(false)
  const [paymentData, setPaymentData] = useState({
    transactionId: "",
    paymentNotes: "",
    chequeUpload: null as null | { name?: string; type?: string; size?: number; dataUrl?: string },
  })
  const [formData, setFormData] = useState({
    companyName: "",
    pan: "",
    gstNo: "",
    address: "",
    entityType: "Private Limited",
    incorporationDate: "",
    employeeCount: "",
    referralCode: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  })
  const [registerStep, setRegisterStep] = useState<"info" | "docs" | "agreement">("info")
  const [registerUploads, setRegisterUploads] = useState<Record<string, { name: string; type: string; size: number; dataUrl: string } | null>>({})
  const [registerAgreementAccepted, setRegisterAgreementAccepted] = useState(false)
  const [registerAgreementGenerated, setRegisterAgreementGenerated] = useState(false)

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter)
      setPage(1)
    }
  }, [initialFilter])

  const loadPage = (targetPage: number) => {
    let active = true
    setLoading(true)
    const offset = (targetPage - 1) * pageSize
    void fetchCompaniesAdmin(pageSize, offset)
      .then((payload) => {
        if (!active) return
        setCompanies(payload.rows)
        setMeta(payload.meta)
        setError("")
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load corporates")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }

  useEffect(() => loadPage(page), [page])

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / pageSize))
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, meta.total || companies.length)

  const filteredCompanies = useMemo(() => {
    const normalizedStatus = statusFilter?.toLowerCase()
    const statusFiltered =
      !normalizedStatus || normalizedStatus === "all"
        ? companies
        : companies.filter((company) => String(company.status ?? "").toLowerCase() === normalizedStatus)

    const query = searchTerm.trim().toLowerCase()
    if (!query) return statusFiltered

    return statusFiltered.filter((company) => {
      const meta = company.metadata as Record<string, unknown> | undefined
      const haystack = [
        company.companyCode,
        company.name,
        company.hrName,
        company.username,
        company.email,
        company.phone,
        company.applicationId,
        String(meta?.pan ?? ""),
        String(meta?.gst_no ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [companies, searchTerm, statusFilter])

  const selectedCount = selectedIds.length
  const pageIds = filteredCompanies.map((company) => company.id)
  const isAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => pageIds.includes(id)))
  }, [pageIds.join("|")])

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (isAllSelected) return prev.filter((id) => !pageIds.includes(id))
      const merged = new Set([...prev, ...pageIds])
      return Array.from(merged)
    })
  }

  const handleFileUpload = async (file?: File | null) => {
    if (!file) {
      setPaymentData((prev) => ({ ...prev, chequeUpload: null }))
      return
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ""))
      reader.onerror = () => reject(new Error("Unable to read file"))
      reader.readAsDataURL(file)
    })
    setPaymentData((prev) => ({
      ...prev,
      chequeUpload: { name: file.name, type: file.type, size: file.size, dataUrl },
    }))
  }

  const handleApprove = async () => {
    if (!reviewCompany) return
    try {
      setApproving(true)
      const response = await approveCompanyAdmin(reviewCompany.id, paymentData)
      setReviewCompany(null)
      setPaymentData({ transactionId: "", paymentNotes: "", chequeUpload: null })
      setCompanies((prev) =>
        prev.map((company) =>
          company.id === response.id
            ? {
                ...company,
                status: response.status,
                companyCode: response.companyCode,
                username: response.username,
                password: response.password,
              }
            : company
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to approve corporate")
    } finally {
      setApproving(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirmBulkDelete || confirmBulkDelete.length === 0) return
    try {
      setDeletingBulk(true)
      await Promise.all(confirmBulkDelete.map((id) => deleteCompanyAdmin(id)))
      setConfirmBulkDelete(null)
      setSelectedIds([])
      loadPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete corporates")
    } finally {
      setDeletingBulk(false)
    }
  }

  const buildAgreementText = () => {
    const lines = [
      "ASTIKAN CORPORATE WELLNESS AGREEMENT",
      "",
      `Company Name: ${formData.companyName}`,
      `PAN: ${formData.pan}`,
      `GST No: ${formData.gstNo}`,
      `Entity Type: ${formData.entityType}`,
      `Date of Incorporation: ${formData.incorporationDate}`,
      `Address: ${formData.address}`,
      formData.referralCode ? `Referral Code: ${formData.referralCode}` : "",
      "",
      "Authorized Contact",
      `Name: ${formData.contactName}`,
      `Email: ${formData.contactEmail}`,
      `Phone: ${formData.contactPhone}`,
      "",
      "By signing this agreement, the company agrees to comply with Astikan program policies, onboarding requirements, and billing terms as provided in the corporate portal.",
    ].filter(Boolean)
    return lines.join("\n")
  }

  const handleRegisterFile = async (key: string, file?: File | null) => {
    if (!file) {
      setRegisterUploads((prev) => ({ ...prev, [key]: null }))
      return
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ""))
      reader.onerror = () => reject(new Error("Unable to read file"))
      reader.readAsDataURL(file)
    })
    setRegisterUploads((prev) => ({ ...prev, [key]: { name: file.name, type: file.type, size: file.size, dataUrl } }))
  }

  const handleRegister = async () => {
    if (!formData.companyName.trim() || !formData.pan.trim() || !formData.gstNo.trim()) {
      setError("Please fill the mandatory company details.")
      return
    }
    if (!registerUploads.gst || !registerUploads.pan || !registerUploads.incorporation) {
      setError("Please upload GST, PAN, and Incorporation documents.")
      return
    }
    if (!registerUploads.signature || !registerUploads.agreement) {
      setError("Please upload authorized signature and signed agreement.")
      return
    }
    if (!registerAgreementAccepted) {
      setError("Please accept the agreement terms.")
      return
    }
    try {
      setSaving(true)
      const payload: CorporateRegistrationPayload = {
        companyName: formData.companyName.trim(),
        pan: formData.pan.trim(),
        gstNo: formData.gstNo.trim(),
        address: formData.address.trim(),
        entityType: formData.entityType,
        incorporationDate: formData.incorporationDate,
        employeeCount: formData.employeeCount ? Number(formData.employeeCount) : undefined,
        referralCode: formData.referralCode.trim() || undefined,
        contactName: formData.contactName.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        documents: {
          gst: registerUploads.gst!,
          pan: registerUploads.pan!,
          incorporation: registerUploads.incorporation!,
          insurer: registerUploads.insurer ?? null,
          msme: registerUploads.msme ?? null,
          labourCompliance: registerUploads.labourCompliance ?? null,
        },
        authorizedSignature: registerUploads.signature!,
        signedAgreement: registerUploads.agreement!,
        agreementText: buildAgreementText(),
      }
      await submitCorporateRegistration(payload)
      setShowRegister(false)
      setRegisterStep("info")
      setRegisterUploads({})
      setRegisterAgreementAccepted(false)
      setRegisterAgreementGenerated(false)
      setFormData({
        companyName: "",
        pan: "",
        gstNo: "",
        address: "",
        entityType: "Private Limited",
        incorporationDate: "",
        employeeCount: "",
        referralCode: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      })
      loadPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register corporate")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="ops-page">
      <header className="ops-head ops-head-row">
        <div>
          <h1>Corporates</h1>
          <p className="ops-kpi-sub">Manage corporate accounts, HR contacts, and onboarding status.</p>
        </div>
        <button
          type="button"
          className="ops-icon-btn"
          onClick={() => setShowRegister(true)}
          aria-label="Register corporate"
        >
          <Plus size={18} />
        </button>
      </header>

      <section className="ops-grid ops-grid--4">
        <article className="ops-card">
          <h2>All Corporates</h2>
          <div className="ops-kpi">{meta.total}</div>
          <div className="ops-kpi-sub">Total onboarded</div>
        </article>
        <article className="ops-card">
          <h2>Active Corporates</h2>
          <div className="ops-kpi">{meta.active}</div>
          <div className="ops-kpi-sub">Currently live</div>
        </article>
        <article className="ops-card">
          <h2>Pending Verification</h2>
          <div className="ops-kpi">{meta.pending}</div>
          <div className="ops-kpi-sub">Awaiting review</div>
        </article>
        <article className="ops-card">
          <h2>Inactive</h2>
          <div className="ops-kpi">{meta.inactive}</div>
          <div className="ops-kpi-sub">Temporarily disabled</div>
        </article>
      </section>

      {loading ? (
        <div className="ops-loader-fullscreen">
          <div className="ops-spinner" />
          <span>Loading corporates...</span>
        </div>
      ) : null}

      <section className="ops-table-wrap">
        {!loading && error && <div className="ops-kpi-sub">{error}</div>}
        <div className="ops-table-filters">
          <div className="ops-search">
            <input
              type="search"
              placeholder="Search corporate, ID, PAN, GST, email or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="ops-filter-select">
            <select value={statusFilter || "all"} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {(searchTerm || statusFilter) && (
            <button
              type="button"
              className="ops-clear-btn"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("")
              }}
            >
              Clear
            </button>
          )}
        </div>
        {initialFilter ? (
          <div className="ops-filter-pill">Showing: {statusFilter}</div>
        ) : null}
        {selectedCount > 0 && (
          <div className="ops-table-actions">
            <div className="ops-kpi-sub">{selectedCount} selected</div>
            <button
              type="button"
              className="ops-icon-btn danger"
              onClick={() => setConfirmBulkDelete(selectedIds)}
              aria-label="Delete selected corporates"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
        {!loading && (
          <table className="ops-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all corporates on page"
                  />
                </th>
                <th>Corporate ID</th>
                <th>Corporate Name</th>
                <th>Application ID</th>
                <th>PAN</th>
                <th>GST No</th>
                <th>HR Name</th>
                <th>Username</th>
                <th>Password</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(company.id)}
                      onChange={() => toggleSelected(company.id)}
                      aria-label={`Select ${company.name}`}
                    />
                  </td>
                  <td>{company.companyCode || "--"}</td>
                  <td>{company.name}</td>
                  <td>{company.applicationId || "--"}</td>
                  <td>{(company.metadata as any)?.pan || "--"}</td>
                  <td>{(company.metadata as any)?.gst_no || "--"}</td>
                  <td>{company.hrName || "--"}</td>
                  <td>{company.username || "--"}</td>
                  <td>
                    <div className="ops-pass-cell">
                      <span>{revealedPasswords[company.id] ? company.password || "--" : company.password ? "••••••••" : "--"}</span>
                      {company.password ? (
                        <button
                          type="button"
                          className="icon"
                          onClick={() =>
                            setRevealedPasswords((prev) => ({
                              ...prev,
                              [company.id]: !prev[company.id],
                            }))
                          }
                          aria-label={revealedPasswords[company.id] ? "Hide password" : "Show password"}
                        >
                          {revealedPasswords[company.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      ) : null}
                    </div>
                  </td>
                  <td>{company.email || "--"}</td>
                  <td>{company.phone || "--"}</td>
                  <td>
                    <span
                      className={`ops-chip ${
                        company.status?.toLowerCase() === "active"
                          ? "success"
                          : company.status?.toLowerCase() === "inactive"
                            ? "danger"
                            : "warning"
                      }`}
                    >
                      {String(company.status ?? "pending").replace(/^\w/, (char) => char.toUpperCase())}
                    </span>
                  </td>
                  <td>
                    <div className="ops-actions">
                      {String(company.status ?? "").toLowerCase() === "pending" ? (
                        <button
                          type="button"
                          className="icon"
                          onClick={() => setReviewCompany(company)}
                          aria-label="Review application"
                        >
                          <FileCheck size={16} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="icon"
                        onClick={() => setEditingCompany(company)}
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon danger"
                        onClick={() => setConfirmBulkDelete([company.id])}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredCompanies.length && (
                <tr>
                  <td colSpan={13} className="ops-kpi-sub">
                    No corporates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {!loading && (
          <div className="ops-pagination">
            <div className="ops-kpi-sub">
              Showing {meta.total ? `${startIndex}-${endIndex} of ${meta.total}` : `${companies.length} records`}
            </div>
            <div className="ops-pagination-controls">
              <button
                type="button"
                className="secondary"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span className="ops-kpi-sub">Page {page} of {totalPages}</span>
              <button
                type="button"
                className="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {showRegister && (
        <div className="ops-modal">
          <div className="ops-modal-card ops-modal-wide">
            <div className="ops-modal-head">
              <h2>Register New Corporate</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setShowRegister(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="ops-modal-body">
              <div className="ops-stepper">
                <button type="button" className={registerStep === "info" ? "active" : ""} onClick={() => setRegisterStep("info")}>1. Info</button>
                <button type="button" className={registerStep === "docs" ? "active" : ""} onClick={() => setRegisterStep("docs")}>2. Documents</button>
                <button type="button" className={registerStep === "agreement" ? "active" : ""} onClick={() => setRegisterStep("agreement")}>3. Agreement</button>
              </div>
              {registerStep === "info" && (
                <div className="ops-grid ops-grid--2">
                  <label className="ops-span">
                    Corporate Name *
                    <input value={formData.companyName} onChange={(event) => setFormData((prev) => ({ ...prev, companyName: event.target.value }))} />
                  </label>
                  <label>
                    PAN *
                    <input value={formData.pan} onChange={(event) => setFormData((prev) => ({ ...prev, pan: event.target.value.toUpperCase() }))} />
                  </label>
                  <label>
                    GST No *
                    <input value={formData.gstNo} onChange={(event) => setFormData((prev) => ({ ...prev, gstNo: event.target.value.toUpperCase() }))} />
                  </label>
                  <label>
                    Services / Entity *
                    <select value={formData.entityType} onChange={(event) => setFormData((prev) => ({ ...prev, entityType: event.target.value }))}>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="LLP">LLP</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Proprietorship">Proprietorship</option>
                      <option value="Trust / NGO">Trust / NGO</option>
                    </select>
                  </label>
                  <label>
                    Date of Incorporation *
                    <input type="date" value={formData.incorporationDate} onChange={(event) => setFormData((prev) => ({ ...prev, incorporationDate: event.target.value }))} />
                  </label>
                  <label>
                    Employee Count *
                    <input
                      type="number"
                      min={1}
                      value={formData.employeeCount}
                      onChange={(event) => setFormData((prev) => ({ ...prev, employeeCount: event.target.value }))}
                    />
                  </label>
                  <label>
                    Referral Code
                    <input value={formData.referralCode} onChange={(event) => setFormData((prev) => ({ ...prev, referralCode: event.target.value }))} />
                  </label>
                  <label className="ops-span">
                    Address *
                    <textarea rows={3} value={formData.address} onChange={(event) => setFormData((prev) => ({ ...prev, address: event.target.value }))} />
                  </label>
                  <label>
                    Authorized Contact Name *
                    <input value={formData.contactName} onChange={(event) => setFormData((prev) => ({ ...prev, contactName: event.target.value }))} />
                  </label>
                  <label>
                    Authorized Contact Email *
                    <input value={formData.contactEmail} onChange={(event) => setFormData((prev) => ({ ...prev, contactEmail: event.target.value }))} />
                  </label>
                  <label>
                    Authorized Contact Phone *
                    <input value={formData.contactPhone} onChange={(event) => setFormData((prev) => ({ ...prev, contactPhone: event.target.value }))} />
                  </label>
                </div>
              )}
              {registerStep === "docs" && (
                <div className="ops-grid ops-grid--2">
                  <label>
                    GST Certificate *
                    <input type="file" onChange={(event) => void handleRegisterFile("gst", event.target.files?.[0])} />
                  </label>
                  <label>
                    PAN Document *
                    <input type="file" onChange={(event) => void handleRegisterFile("pan", event.target.files?.[0])} />
                  </label>
                  <label>
                    Incorporation Certificate *
                    <input type="file" onChange={(event) => void handleRegisterFile("incorporation", event.target.files?.[0])} />
                  </label>
                  <label>
                    Insurer Certificate
                    <input type="file" onChange={(event) => void handleRegisterFile("insurer", event.target.files?.[0])} />
                  </label>
                  <label>
                    MSME Certificate
                    <input type="file" onChange={(event) => void handleRegisterFile("msme", event.target.files?.[0])} />
                  </label>
                  <label>
                    Labour Compliance Certificate
                    <input type="file" onChange={(event) => void handleRegisterFile("labourCompliance", event.target.files?.[0])} />
                  </label>
                </div>
              )}
              {registerStep === "agreement" && (
                <div className="ops-grid ops-grid--2">
                  <label className="ops-span">
                    Agreement Text (auto-generated)
                    <textarea rows={6} value={buildAgreementText()} readOnly />
                  </label>
                  <label>
                    Authorized Signature *
                    <input type="file" onChange={(event) => void handleRegisterFile("signature", event.target.files?.[0])} />
                  </label>
                  <label>
                    Signed Agreement *
                    <input type="file" onChange={(event) => void handleRegisterFile("agreement", event.target.files?.[0])} />
                  </label>
                  <label className="ops-span ops-check">
                    <input type="checkbox" checked={registerAgreementAccepted} onChange={(event) => setRegisterAgreementAccepted(event.target.checked)} />
                    <span>I confirm the agreement is signed by the authorized signatory.</span>
                  </label>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      const blob = new Blob([buildAgreementText()], { type: "text/plain" })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = `${formData.companyName || "Astikan"}-Agreement.txt`
                      link.click()
                      URL.revokeObjectURL(url)
                      setRegisterAgreementGenerated(true)
                    }}
                  >
                    Download agreement
                  </button>
                </div>
              )}
            </div>
            <div className="ops-actions ops-actions-right">
              <button type="button" className="secondary" onClick={() => setShowRegister(false)}>
                Cancel
              </button>
              {registerStep !== "agreement" ? (
                <button type="button" className="primary" onClick={() => setRegisterStep(registerStep === "info" ? "docs" : "agreement")}>
                  Next
                </button>
              ) : (
                <button type="button" className="primary" onClick={handleRegister} disabled={saving || !registerAgreementGenerated}>
                  {saving ? "Registering..." : "Submit Registration"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmBulkDelete && (
        <div className="ops-modal">
          <div className="ops-modal-card">
            <div className="ops-modal-head">
              <h2>Delete Corporates</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setConfirmBulkDelete(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <p className="ops-kpi-sub">
              Delete {confirmBulkDelete.length} corporates? This cannot be undone.
            </p>
            <div className="ops-actions ops-actions-right">
              <button type="button" className="secondary" onClick={() => setConfirmBulkDelete(null)}>Cancel</button>
              <button type="button" className="primary" onClick={handleBulkDelete} disabled={deletingBulk}>
                {deletingBulk ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCompany && (
        <div className="ops-modal">
          <div className="ops-modal-card">
            <div className="ops-modal-head">
              <h2>Edit Corporate</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setEditingCompany(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="ops-modal-body">
              <div className="ops-grid ops-grid--2">
                <label className="ops-span">
                  Corporate Name
                  <input value={editingCompany.name} onChange={(event) => setEditingCompany({ ...editingCompany, name: event.target.value })} />
                </label>
                <label>
                  HR Name
                  <input value={editingCompany.hrName ?? ""} onChange={(event) => setEditingCompany({ ...editingCompany, hrName: event.target.value })} />
                </label>
                <label>
                  Username
                  <input value={editingCompany.username ?? ""} onChange={(event) => setEditingCompany({ ...editingCompany, username: event.target.value })} />
                </label>
                <label>
                  Password
                  <input value={editingCompany.password ?? ""} onChange={(event) => setEditingCompany({ ...editingCompany, password: event.target.value })} />
                </label>
                <label>
                  Email
                  <input value={editingCompany.email ?? ""} onChange={(event) => setEditingCompany({ ...editingCompany, email: event.target.value })} />
                </label>
                <label>
                  Contact Number
                  <input value={editingCompany.phone ?? ""} onChange={(event) => setEditingCompany({ ...editingCompany, phone: event.target.value })} />
                </label>
              </div>
            </div>
            <div className="ops-actions ops-actions-right">
              <button type="button" className="secondary" onClick={() => setEditingCompany(null)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={() => setEditingCompany(null)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewCompany && (
        <div className="ops-modal">
          <div className="ops-modal-card ops-modal-wide">
            <div className="ops-modal-head">
              <h2>Review Corporate Application</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setReviewCompany(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="ops-modal-body">
              <div className="ops-grid ops-grid--2">
                <div className="ops-summary-card">
                  <h3>Company details</h3>
                  <p><strong>Name:</strong> {reviewCompany.name}</p>
                  <p><strong>Application ID:</strong> {reviewCompany.applicationId || "--"}</p>
                  <p><strong>HR:</strong> {reviewCompany.hrName || "--"}</p>
                  <p><strong>Email:</strong> {reviewCompany.email || "--"}</p>
                  <p><strong>Phone:</strong> {reviewCompany.phone || "--"}</p>
                </div>
                <div className="ops-summary-card">
                  <h3>Uploaded documents</h3>
                  {(reviewCompany.metadata as any)?.documents ? (
                    <ul className="ops-doc-list">
                      {Object.entries((reviewCompany.metadata as any).documents).map(([key, doc]) => (
                        <li key={key}>
                          <span>{key}</span>
                          {doc && (doc as any).dataUrl ? (
                            <a href={(doc as any).dataUrl} target="_blank" rel="noreferrer">View</a>
                          ) : (
                            <span>--</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ops-kpi-sub">No documents found.</p>
                  )}
                  {(reviewCompany.metadata as any)?.signed_agreement ? (
                    <div className="ops-doc-row">
                      <span>Signed agreement</span>
                      <a href={(reviewCompany.metadata as any).signed_agreement?.dataUrl} target="_blank" rel="noreferrer">View</a>
                    </div>
                  ) : null}
                  {(reviewCompany.metadata as any)?.authorized_signature ? (
                    <div className="ops-doc-row">
                      <span>Authorized signature</span>
                      <a href={(reviewCompany.metadata as any).authorized_signature?.dataUrl} target="_blank" rel="noreferrer">View</a>
                    </div>
                  ) : null}
                  {(reviewCompany.metadata as any)?.agreement_text ? (
                    <div className="ops-doc-row">
                      <span>Agreement text</span>
                      <button
                        type="button"
                        className="ops-link-button"
                        onClick={() => {
                          const blob = new Blob([String((reviewCompany.metadata as any).agreement_text)], { type: "text/plain" })
                          const url = URL.createObjectURL(blob)
                          window.open(url, "_blank", "noopener,noreferrer")
                          setTimeout(() => URL.revokeObjectURL(url), 2000)
                        }}
                      >
                        View
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="ops-grid ops-grid--2">
                <label>
                  Transaction ID
                  <input
                    value={paymentData.transactionId}
                    onChange={(event) => setPaymentData((prev) => ({ ...prev, transactionId: event.target.value }))}
                    placeholder="Enter transaction ID"
                  />
                </label>
                <label>
                  Cheque upload
                  <input type="file" onChange={(event) => void handleFileUpload(event.target.files?.[0])} />
                </label>
                <label className="ops-span">
                  Payment notes
                  <textarea
                    rows={3}
                    value={paymentData.paymentNotes}
                    onChange={(event) => setPaymentData((prev) => ({ ...prev, paymentNotes: event.target.value }))}
                    placeholder="Optional notes for this approval"
                  />
                </label>
              </div>
            </div>
            <div className="ops-actions ops-actions-right">
              <button type="button" className="secondary" onClick={() => setReviewCompany(null)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={handleApprove} disabled={approving}>
                {approving ? "Approving..." : (
                  <>
                    <ReceiptIndianRupee size={16} />
                    Approve & Generate Login
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
