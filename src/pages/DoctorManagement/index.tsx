import { useEffect, useMemo, useState } from "react"
import { Eye, EyeOff, Plus, Pencil, Trash2, X, UserPlus, UploadCloud } from "lucide-react"
import "../operations.css"
import {
  fetchDoctorsAdmin,
  fetchDoctorAdminDetail,
  updateDoctorAdminFull,
  createDoctorAdmin,
  deleteDoctorAdmin,
  type DoctorAdminDetail,
  type DoctorAdminMeta,
  type DoctorAdminRecord,
} from "../../services/doctorsAdminApi"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const TIME_OPTIONS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
]
const TELE_SLOTS = [
  "09:00 AM - 09:30 AM",
  "09:30 AM - 10:00 AM",
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM",
  "05:00 PM - 05:30 PM",
  "05:30 PM - 06:00 PM",
  "06:00 PM - 06:30 PM",
  "06:30 PM - 07:00 PM",
  "07:00 PM - 07:30 PM",
  "07:30 PM - 08:00 PM",
]

type DoctorFormState = {
  id?: string
  name: string
  email: string
  phone: string
  username: string
  password: string
  image: string
  status: string
  verificationStatus: string
  specializations: string[]
  highestQualification: string
  experienceYears: string
  shortBio: string
  consultationFeeInr: string
  medicalCouncilNumber: string
  governmentIdNumber: string
  languages: string[]
  practiceAddress: string
  availability: {
    virtualAvailable: boolean
    physicalAvailable: boolean
    opdDays: string[]
    opdFrom: string
    opdTo: string
    teleSlots: string[]
  }
}

const emptyForm: DoctorFormState = {
  name: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  image: "",
  status: "Pending",
  verificationStatus: "draft",
  specializations: [],
  highestQualification: "",
  experienceYears: "",
  shortBio: "",
  consultationFeeInr: "",
  medicalCouncilNumber: "",
  governmentIdNumber: "",
  languages: [],
  practiceAddress: "",
  availability: {
    virtualAvailable: true,
    physicalAvailable: true,
    opdDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    opdFrom: "10:00 AM",
    opdTo: "06:00 PM",
    teleSlots: ["09:00 AM - 09:30 AM", "07:00 PM - 07:30 PM"],
  },
}

type DoctorManagementProps = {
  initialFilter?: "Pending" | "Active" | "Inactive" | "Pending KYC"
}

export function DoctorManagementPage({ initialFilter }: DoctorManagementProps) {
  const [showActions, setShowActions] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<string[] | null>(null)
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null)
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState<DoctorFormState>(emptyForm)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({})
  const [confirmDelete, setConfirmDelete] = useState<DoctorAdminRecord | null>(null)
  const [viewDoctor, setViewDoctor] = useState<DoctorAdminDetail | null>(null)
  const [viewStep, setViewStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ medicalCouncilNumber?: string; governmentIdNumber?: string }>({})
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSummary, setUploadSummary] = useState<{ created: number; failed: number } | null>(null)
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("")
  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [doctors, setDoctors] = useState<DoctorAdminRecord[]>([])
  const [meta, setMeta] = useState<DoctorAdminMeta>({
    total: 0,
    active: 0,
    pending: 0,
    kyc: 0,
    inactive: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 50
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter ?? "")

  useEffect(() => {
    if (initialFilter) {
      setStatusFilter(initialFilter)
      setPage(1)
    }
  }, [initialFilter])

  useEffect(() => {
    if (!profilePhotoFile) {
      setProfilePhotoPreview("")
      return
    }
    const nextUrl = URL.createObjectURL(profilePhotoFile)
    setProfilePhotoPreview(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [profilePhotoFile])

  const buildAvatar = (name: string) => {
    const initials =
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "DR"
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#e7ecf7"/>
            <stop offset="100%" stop-color="#cfd7ea"/>
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="32" fill="url(#g)"/>
        <text x="50%" y="54%" text-anchor="middle" font-family="Satoshi, Arial" font-size="22" fill="#374151" font-weight="700">${initials}</text>
      </svg>
    `.trim()
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }

  const loadPage = (targetPage: number) => {
    let active = true
    setLoading(true)
    const offset = (targetPage - 1) * pageSize
    void fetchDoctorsAdmin(pageSize, offset)
      .then((payload) => {
        if (!active) return
        setDoctors(payload.rows)
        setMeta(payload.meta)
        setError("")
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load doctors")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }

  useEffect(() => loadPage(page), [page])

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadPage(page)
    }, 30000)
    return () => window.clearInterval(interval)
  }, [page])

  const statusCounts = useMemo(() => meta, [meta])

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / pageSize))
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, meta.total || doctors.length)

  const openAddModal = () => {
    setFormMode("add")
    setFormStep(1)
    setFormData({ ...emptyForm })
    setProfilePhotoFile(null)
    setGovernmentIdFile(null)
    setLicenseFile(null)
  }

  const openEditModal = (doctorId: string) => {
    setFormMode("edit")
    setFormStep(1)
    setLoading(true)
    setProfilePhotoFile(null)
    setGovernmentIdFile(null)
    setLicenseFile(null)
    void fetchDoctorAdminDetail(doctorId)
      .then((detail) => {
        setFormData(mapDetailToForm(detail))
        setError("")
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load doctor"))
      .finally(() => setLoading(false))
  }

  const mapDetailToForm = (detail: DoctorAdminDetail): DoctorFormState => ({
    id: detail.id,
    name: detail.name ?? "",
    email: detail.email ?? "",
    phone: detail.phone ?? "",
    username: detail.username ?? "",
    password: "",
    image: detail.image ?? "",
    status: detail.status ?? "Pending",
    verificationStatus: detail.verificationStatus ?? "draft",
    specializations: detail.specializations ?? [],
    highestQualification: detail.highestQualification ?? "",
    experienceYears: detail.experienceYears ? String(detail.experienceYears) : "",
    shortBio: detail.shortBio ?? "",
    consultationFeeInr: detail.consultationFeeInr ? String(detail.consultationFeeInr) : "",
    medicalCouncilNumber: detail.medicalCouncilNumber ?? "",
    governmentIdNumber: detail.governmentIdNumber ?? "",
    languages: detail.languages ?? [],
    practiceAddress: detail.practiceAddress ?? "",
    availability: {
      virtualAvailable: detail.availability?.virtualAvailable ?? true,
      physicalAvailable: detail.availability?.physicalAvailable ?? true,
      opdDays: detail.availability?.opdDays?.length ? detail.availability.opdDays : ["Mon", "Tue", "Wed", "Thu", "Fri"],
      opdFrom: detail.availability?.opdFrom ?? "10:00 AM",
      opdTo: detail.availability?.opdTo ?? "06:00 PM",
      teleSlots: detail.availability?.teleSlots?.length ? detail.availability.teleSlots : ["09:00 AM - 09:30 AM"],
    },
  })

  const updateForm = (patch: Partial<DoctorFormState>) =>
    setFormData((prev) => ({ ...prev, ...patch }))

  const updateAvailability = (patch: Partial<DoctorFormState["availability"]>) =>
    setFormData((prev) => ({ ...prev, availability: { ...prev.availability, ...patch } }))

  const toggleArrayValue = (values: string[], value: string) =>
    values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

  const parseCsvLine = (line: string) => {
    const result: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      if (char === "\"") {
        if (inQuotes && line[i + 1] === "\"") {
          current += "\""
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result.map((value) => value.replace(/^"(.*)"$/, "$1"))
  }

  const parseCsv = (content: string) => {
    const rows = content.split(/\r?\n/).filter((line) => line.trim().length)
    if (!rows.length) return []
    const headers = parseCsvLine(rows[0]).map((header) => header.toLowerCase())
    return rows.slice(1).map((line) => {
      const values = parseCsvLine(line)
      return headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = values[index] ?? ""
        return acc
      }, {})
    })
  }

  const handleUploadDoctors = async () => {
    if (!uploadFile) return
    setUploading(true)
    setUploadSummary(null)
    try {
      const text = await uploadFile.text()
      const rows = parseCsv(text)
      let created = 0
      let failed = 0
      for (const row of rows) {
        try {
          const payload: Partial<DoctorAdminDetail> = {
            name: row.name || row.full_name || row["doctor_name"] || "",
            email: row.email || "",
            phone: row.phone || row.mobile || "",
            username: row.username || row.phone || row.mobile || "",
            password: row.password || "",
            image: row.image || row.profile_image || row.profile_photo || "",
            status: row.status || "Pending",
            verificationStatus: row.verification_status || "draft",
            specializations: row.specializations ? row.specializations.split("|").map((s) => s.trim()).filter(Boolean) : [],
            highestQualification: row.qualification || "",
            experienceYears: row.experience || "",
            shortBio: row.bio || "",
            consultationFeeInr: row.consultation_fee || "",
            medicalCouncilNumber: row.medical_council_number || "",
            governmentIdNumber: row.government_id_number || "",
            languages: row.languages ? row.languages.split("|").map((s) => s.trim()).filter(Boolean) : [],
            practiceAddress: row.practice_address || row.address || "",
          }
          await createDoctorAdmin(payload)
          created += 1
        } catch {
          failed += 1
        }
      }
      setUploadSummary({ created, failed })
      loadPage(page)
    } finally {
      setUploading(false)
    }
  }

  const downloadSampleCsv = () => {
    const sample = [
      "name,email,phone,username,password,image,specializations,qualification,experience,languages,practice_address,status",
      "Dr. Sample One,sample.one@clinic.com,9876543210,9876543210,TempPass@123,profile.jpg,Internal Medicine|Cardiology,MBBS,8,English|Hindi,Connaught Place New Delhi,Pending",
      "Dr. Sample Two,sample.two@clinic.com,9812345678,9812345678,TempPass@123,profile2.jpg,Dermatology,MD,5,English,Noida Sector 62,Active",
    ].join("\n")
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "doctors-sample.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "")
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const uploadDoctorDocument = async (doctorId: string, file: File, documentType: "profile_photo" | "government_id" | "license_certificate") => {
    const base64 = await fileToBase64(file)
    const payload = {
      documentType,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      fileBase64: base64,
      fileSizeBytes: file.size,
    }
    const response = await fetch(`/api/doctors/${doctorId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const raw = await response.text()
    const parsed = raw ? JSON.parse(raw) : null
    if (!response.ok || parsed?.status !== "ok") {
      throw new Error(parsed?.message || "Unable to upload document")
    }
    return parsed.data as { documentId: string; storageKey: string }
  }

  const handleSave = async () => {
    const trimValue = (value: string) => value.trim()
    const medicalCouncilNumber = trimValue(formData.medicalCouncilNumber)
    const governmentIdNumber = trimValue(formData.governmentIdNumber)
    const nextErrors: { medicalCouncilNumber?: string; governmentIdNumber?: string } = {}

    if (medicalCouncilNumber && !/^[A-Z0-9\-\/]{6,20}$/i.test(medicalCouncilNumber)) {
      nextErrors.medicalCouncilNumber = "Enter 6-20 chars (letters, numbers, / or -)."
    }
    if (governmentIdNumber && !/^[A-Z0-9\-]{6,20}$/i.test(governmentIdNumber)) {
      nextErrors.governmentIdNumber = "Enter 6-20 chars (letters, numbers, or -)."
    }

    if (Object.keys(nextErrors).length > 0) {
      setValidationErrors(nextErrors)
      return
    }

    setValidationErrors({})
    const payload: Partial<DoctorAdminDetail> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      username: formData.username,
      password: formData.password || undefined,
      image: formData.image || undefined,
      status: formData.status || "Pending",
      verificationStatus:
        formData.status === "Active"
          ? "verified"
          : formData.status === "Pending KYC"
            ? "submitted"
            : formData.status === "Inactive"
              ? "rejected"
              : formData.verificationStatus || "draft",
      specializations: formData.specializations,
      highestQualification: formData.highestQualification,
      experienceYears: formData.experienceYears ? Number(formData.experienceYears) : undefined,
      shortBio: formData.shortBio,
      consultationFeeInr: formData.consultationFeeInr ? Number(formData.consultationFeeInr) : undefined,
      medicalCouncilNumber,
      governmentIdNumber,
      languages: formData.languages,
      practiceAddress: formData.practiceAddress,
      availability: formData.availability,
    }

    try {
      setSaving(true)
      if (formMode === "add") {
        const created = await createDoctorAdmin(payload)
        const doctorId = created.id
        if (profilePhotoFile) {
          const uploaded = await uploadDoctorDocument(doctorId, profilePhotoFile, "profile_photo")
          await updateDoctorAdminFull(doctorId, { image: `/api/superadmin/doctors/${doctorId}/documents/${uploaded.documentId}/download` })
        }
        if (governmentIdFile) {
          await uploadDoctorDocument(doctorId, governmentIdFile, "government_id")
        }
        if (licenseFile) {
          await uploadDoctorDocument(doctorId, licenseFile, "license_certificate")
        }
        setFormMode(null)
        loadPage(page)
        return
      }
      if (formMode === "edit" && formData.id) {
        await updateDoctorAdminFull(formData.id, payload)
        if (profilePhotoFile) {
          const uploaded = await uploadDoctorDocument(formData.id, profilePhotoFile, "profile_photo")
          await updateDoctorAdminFull(formData.id, { image: `/api/superadmin/doctors/${formData.id}/documents/${uploaded.documentId}/download` })
        }
        if (governmentIdFile) {
          await uploadDoctorDocument(formData.id, governmentIdFile, "government_id")
        }
        if (licenseFile) {
          await uploadDoctorDocument(formData.id, licenseFile, "license_certificate")
        }
        setFormMode(null)
        loadPage(page)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save doctor")
    } finally {
      setSaving(false)
    }
  }

  const filteredDoctors = statusFilter
    ? doctors.filter((doc) => doc.status === statusFilter)
    : doctors

  const selectedCount = selectedIds.length
  const pageIds = filteredDoctors.map((doctor) => doctor.id)
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

  const handleBulkDelete = async () => {
    if (!confirmBulkDelete || confirmBulkDelete.length === 0) return
    try {
      setDeletingBulk(true)
      await Promise.all(confirmBulkDelete.map((id) => deleteDoctorAdmin(id)))
      setConfirmBulkDelete(null)
      setSelectedIds([])
      await loadPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete doctors")
    } finally {
      setDeletingBulk(false)
    }
  }

  return (
    <main className="ops-page">
      <header className="ops-head ops-head-row">
        <div>
          <h1>Doctors</h1>
        </div>
        <div className="ops-actions-pop">
          <button
            type="button"
            className="ops-icon-btn"
            onClick={() => setShowActions((prev) => !prev)}
            aria-label="Add doctor actions"
          >
            <Plus size={18} />
          </button>
          {showActions && (
            <div className="ops-popover">
              <button
                type="button"
                onClick={() => {
                  setShowActions(false)
                  openAddModal()
                }}
              >
                <UserPlus size={16} />
                <span>Add Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowActions(false)
                  setShowUploadModal(true)
                  setUploadSummary(null)
                  setUploadFile(null)
                }}
              >
                <UploadCloud size={16} />
                <span>Upload Doctors</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="ops-grid ops-grid--5">
        <article className="ops-card">
          <h2>All Doctors</h2>
          <div className="ops-kpi">{statusCounts.total}</div>
          <div className="ops-kpi-sub">Total onboarded</div>
        </article>
        <article className="ops-card">
          <h2>Active Doctors</h2>
          <div className="ops-kpi">{statusCounts.active}</div>
          <div className="ops-kpi-sub">Available for consults</div>
        </article>
        <article className="ops-card">
          <h2>Pending Approvals</h2>
          <div className="ops-kpi">{statusCounts.pending}</div>
          <div className="ops-kpi-sub">Awaiting verification</div>
        </article>
        <article className="ops-card">
          <h2>Pending KYC</h2>
          <div className="ops-kpi">{statusCounts.kyc}</div>
          <div className="ops-kpi-sub">Documents required</div>
        </article>
        <article className="ops-card">
          <h2>Inactive</h2>
          <div className="ops-kpi">{statusCounts.inactive}</div>
          <div className="ops-kpi-sub">Temporarily disabled</div>
        </article>
      </section>

      {loading ? (
        <div className="ops-loader-fullscreen">
          <div className="ops-spinner" />
          <span>Loading doctors...</span>
        </div>
      ) : null}

      <section className="ops-table-wrap">
        {!loading && error && <div className="ops-kpi-sub">{error}</div>}
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
              aria-label="Delete selected doctors"
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
                  aria-label="Select all doctors on page"
                />
              </th>
              <th>Profile</th>
              <th>Name</th>
              <th>Username</th>
              <th>Password</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Specialty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => (
              <tr
                key={doctor.id}
                className="ops-row-click"
                onClick={() => {
                  setLoading(true)
                  void fetchDoctorAdminDetail(doctor.id)
                    .then((detail) => setViewDoctor(detail))
                    .catch((err) => setError(err instanceof Error ? err.message : "Unable to load doctor"))
                    .finally(() => setLoading(false))
                }}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(doctor.id)}
                    onChange={() => toggleSelected(doctor.id)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Select ${doctor.name}`}
                  />
                </td>
                <td>
                  <img
                    className="ops-table-avatar"
                    src={doctor.image ?? buildAvatar(doctor.name)}
                    alt={doctor.name}
                    onError={(event) => {
                      event.currentTarget.src = buildAvatar(doctor.name)
                    }}
                  />
                </td>
                <td>{doctor.name}</td>
                <td>{doctor.username}</td>
                <td>
                  <div className="ops-pass-cell">
                    <span>
                      {revealedPasswords[doctor.id]
                        ? doctor.password || "--"
                        : doctor.password
                          ? "••••••••"
                          : "--"}
                    </span>
                    {doctor.password ? (
                      <button
                        type="button"
                        className="icon"
                        onClick={(event) => {
                          event.stopPropagation()
                          setRevealedPasswords((prev) => ({
                            ...prev,
                            [doctor.id]: !prev[doctor.id],
                          }))
                        }}
                        aria-label={revealedPasswords[doctor.id] ? "Hide password" : "Show password"}
                      >
                        {revealedPasswords[doctor.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    ) : null}
                  </div>
                </td>
                <td>{doctor.email}</td>
                <td>{doctor.phone}</td>
                <td>{doctor.specialty}</td>
                <td>
                  <span className={`ops-chip ${doctor.status === "Active" ? "success" : doctor.status === "Inactive" ? "danger" : "warning"}`}>
                    {doctor.status}
                  </span>
                </td>
                <td>
                  <div className="ops-actions">
                    <button
                      type="button"
                      className="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        openEditModal(doctor.id)
                      }}
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon danger"
                      onClick={(event) => {
                        event.stopPropagation()
                        setConfirmDelete(doctor)
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {!loading && (
        <div className="ops-pagination">
          <div className="ops-kpi-sub">
            Showing {meta.total ? `${startIndex}-${endIndex} of ${meta.total}` : `${doctors.length} records`}
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

      {formMode && (
        <div className="ops-modal">
          <div className="ops-modal-card ops-modal-wide ops-modal-fixed">
            <div className="ops-modal-head">
              <div>
                <h2>{formMode === "add" ? "Add Doctor" : "Edit Doctor"}</h2>
              </div>
              <button type="button" className="ops-modal-close icon" onClick={() => setFormMode(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <div className="ops-stepper">
              <button type="button" className={formStep === 1 ? "active" : ""} onClick={() => setFormStep(1)}>Registration</button>
              <button type="button" className={formStep === 2 ? "active" : ""} onClick={() => setFormStep(2)}>Verification</button>
              <button type="button" className={formStep === 3 ? "active" : ""} onClick={() => setFormStep(3)}>Professional</button>
              <button type="button" className={formStep === 4 ? "active" : ""} onClick={() => setFormStep(4)}>Practice</button>
            </div>

            <div className="ops-modal-body">
            {formStep === 1 && (
              <div className="ops-grid ops-grid--2">
                <label>
                  Full Name
                  <input value={formData.name} onChange={(event) => updateForm({ name: event.target.value })} />
                </label>
                <label>
                  Email
                  <input value={formData.email} onChange={(event) => updateForm({ email: event.target.value })} />
                </label>
                <label>
                  Phone
                  <input value={formData.phone} onChange={(event) => updateForm({ phone: event.target.value })} />
                </label>
                <label>
                  Username
                  <input value={formData.username} onChange={(event) => updateForm({ username: event.target.value })} />
                </label>
                <label>
                  Password
                  <input type="text" value={formData.password} onChange={(event) => updateForm({ password: event.target.value })} />
                </label>
                <label>
                  Profile Image URL
                  <input value={formData.image} onChange={(event) => updateForm({ image: event.target.value })} />
                </label>
                <label className="ops-span">
                  Upload Profile Photo
                  <input type="file" accept="image/*" onChange={(event) => setProfilePhotoFile(event.target.files?.[0] ?? null)} />
                  {profilePhotoPreview ? (
                    <div className="ops-upload-preview">
                      <img src={profilePhotoPreview} alt="Profile preview" />
                      <span>Preview</span>
                    </div>
                  ) : null}
                </label>
                <label>
                  Specializations (comma separated)
                  <input
                    value={formData.specializations.join(", ")}
                    onChange={(event) => updateForm({ specializations: event.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  />
                </label>
                <label>
                  Status
                  <select value={formData.status || ""} onChange={(event) => updateForm({ status: event.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Pending KYC">Pending KYC</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>
            )}

            {formStep === 2 && (
              <div className="ops-grid ops-grid--2">
                <label>
                  Medical Council Number
                  <input value={formData.medicalCouncilNumber} onChange={(event) => updateForm({ medicalCouncilNumber: event.target.value })} />
                  {validationErrors.medicalCouncilNumber ? <span className="ops-field-error">{validationErrors.medicalCouncilNumber}</span> : null}
                </label>
                <label>
                  Government ID Number
                  <input value={formData.governmentIdNumber} onChange={(event) => updateForm({ governmentIdNumber: event.target.value })} />
                  {validationErrors.governmentIdNumber ? <span className="ops-field-error">{validationErrors.governmentIdNumber}</span> : null}
                </label>
                <label className="ops-span">
                  Upload Government ID (PDF / Image)
                  <input type="file" accept=".pdf,image/*" onChange={(event) => setGovernmentIdFile(event.target.files?.[0] ?? null)} />
                </label>
                <label className="ops-span">
                  Upload License Certificate (PDF / Image)
                  <input type="file" accept=".pdf,image/*" onChange={(event) => setLicenseFile(event.target.files?.[0] ?? null)} />
                </label>
                <label>
                  Verification Status
                  <select value={formData.verificationStatus || ""} onChange={(event) => updateForm({ verificationStatus: event.target.value })}>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="in_review">In Review</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
              </div>
            )}

            {formStep === 3 && (
              <div className="ops-grid ops-grid--2">
                <label>
                  Highest Qualification
                  <input value={formData.highestQualification} onChange={(event) => updateForm({ highestQualification: event.target.value })} />
                </label>
                <label>
                  Experience (years)
                  <input value={formData.experienceYears} onChange={(event) => updateForm({ experienceYears: event.target.value })} />
                </label>
                <label>
                  Languages (comma separated)
                  <input
                    value={formData.languages.join(", ")}
                    onChange={(event) => updateForm({ languages: event.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                  />
                </label>
                <label>
                  Consultation Fee (INR)
                  <input value={formData.consultationFeeInr} onChange={(event) => updateForm({ consultationFeeInr: event.target.value })} />
                </label>
                <label className="ops-span">
                  Short Bio
                  <textarea value={formData.shortBio} onChange={(event) => updateForm({ shortBio: event.target.value })} />
                </label>
              </div>
            )}

            {formStep === 4 && (
              <div className="ops-grid ops-grid--2">
                <label className="ops-span">
                  Primary Practice Address
                  <textarea value={formData.practiceAddress} onChange={(event) => updateForm({ practiceAddress: event.target.value })} />
                </label>
                <label>
                  Availability Mode
                  <div className="ops-chip-row">
                    <button
                      type="button"
                      className={formData.availability.virtualAvailable ? "active" : ""}
                      onClick={() => updateAvailability({ virtualAvailable: !formData.availability.virtualAvailable })}
                    >
                      Virtual
                    </button>
                    <button
                      type="button"
                      className={formData.availability.physicalAvailable ? "active" : ""}
                      onClick={() => updateAvailability({ physicalAvailable: !formData.availability.physicalAvailable })}
                    >
                      Physical
                    </button>
                  </div>
                </label>
                <label>
                  OPD Days
                  <div className="ops-chip-row">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        className={formData.availability.opdDays.includes(day) ? "active" : ""}
                        onClick={() => updateAvailability({ opdDays: toggleArrayValue(formData.availability.opdDays, day) })}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </label>
                <label>
                  OPD Timings
                  <div className="ops-inline-grid">
                    <select value={formData.availability.opdFrom} onChange={(event) => updateAvailability({ opdFrom: event.target.value })}>
                      {TIME_OPTIONS.map((time) => (
                        <option key={`from-${time}`} value={time}>{time}</option>
                      ))}
                    </select>
                    <select value={formData.availability.opdTo} onChange={(event) => updateAvailability({ opdTo: event.target.value })}>
                      {TIME_OPTIONS.map((time) => (
                        <option key={`to-${time}`} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <label className="ops-span">
                  Teleconsultation Slots (30 mins)
                  <div className="ops-slot-grid">
                    {TELE_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={formData.availability.teleSlots.includes(slot) ? "active" : ""}
                        onClick={() => updateAvailability({ teleSlots: toggleArrayValue(formData.availability.teleSlots, slot) })}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </label>
              </div>
            )}
            </div>

            <div className="ops-actions ops-actions-right">
              <button type="button" className="primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : formMode === "add" ? "Create Doctor" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="ops-modal">
          <div className="ops-modal-card ops-modal-fixed">
            <div className="ops-modal-head">
              <h2>Upload Doctors</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setShowUploadModal(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="ops-modal-body">
              <label className="ops-span">
                Upload CSV file
                <input
                  type="file"
                  accept=".csv"
                  onChange={(event) => {
                    setUploadFile(event.target.files?.[0] ?? null)
                  }}
                />
              </label>
              <div className="ops-kpi-sub">
                Supported columns: `name`, `email`, `phone`, `username`, `password`, `image`,
                `specializations`, `qualification`, `experience`, `languages`, `practice_address`, `status`.
                Separate multiple values with `|`.
              </div>
              {uploadSummary && (
                <div className="ops-kpi-sub">Created {uploadSummary.created} doctors, failed {uploadSummary.failed}.</div>
              )}
            </div>
            <div className="ops-actions ops-actions-right">
              <button type="button" className="secondary" onClick={downloadSampleCsv}>
                Download sample CSV
              </button>
              <button type="button" className="secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={handleUploadDoctors} disabled={!uploadFile || uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="ops-modal">
          <div className="ops-modal-card">
            <div className="ops-modal-head">
              <h2>Delete Doctor</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setConfirmDelete(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <p className="ops-kpi-sub">Delete {confirmDelete.name}? This cannot be undone.</p>
            <div className="ops-actions ops-actions-right">
              <button type="button" className="secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                type="button"
                className="primary"
                onClick={() => {
                  void deleteDoctorAdmin(confirmDelete.id)
                    .then(() => {
                      setConfirmDelete(null)
                      loadPage(page)
                    })
                    .catch((err) => setError(err instanceof Error ? err.message : "Unable to delete doctor"))
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmBulkDelete && (
        <div className="ops-modal">
          <div className="ops-modal-card">
            <div className="ops-modal-head">
              <h2>Delete Doctors</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setConfirmBulkDelete(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <p className="ops-kpi-sub">
              Delete {confirmBulkDelete.length} doctors? This cannot be undone.
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
      {viewDoctor && (
        <div className="ops-modal" onClick={() => setViewDoctor(null)}>
          <div className="ops-modal-card ops-modal-detail" onClick={(event) => event.stopPropagation()}>
            <div className="ops-modal-head">
              <h2>Doctor Profile</h2>
              <button type="button" className="ops-modal-close icon" onClick={() => setViewDoctor(null)} aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="ops-stepper">
              <button type="button" className={viewStep === 1 ? "active" : ""} onClick={() => setViewStep(1)}>Registration</button>
              <button type="button" className={viewStep === 2 ? "active" : ""} onClick={() => setViewStep(2)}>Verification</button>
              <button type="button" className={viewStep === 3 ? "active" : ""} onClick={() => setViewStep(3)}>Professional</button>
              <button type="button" className={viewStep === 4 ? "active" : ""} onClick={() => setViewStep(4)}>Practice</button>
            </div>

            <div className="ops-modal-body">
              {viewStep === 1 && (
                <div className="ops-grid ops-grid--2">
                  <div className="ops-detail-hero ops-span">
                    <img
                      className="ops-detail-avatar"
                      src={viewDoctor.image ?? buildAvatar(viewDoctor.name)}
                      alt={viewDoctor.name}
                      onError={(event) => {
                        event.currentTarget.src = buildAvatar(viewDoctor.name)
                      }}
                    />
                    <div className="ops-detail-meta">
                      <h3>{viewDoctor.name}</h3>
                      <p>{viewDoctor.specialty}</p>
                      <div className="ops-chip-row">
                        <span className={`ops-chip ${viewDoctor.status === "Active" ? "success" : "warning"}`}>
                          {viewDoctor.status}
                        </span>
                        <span className="ops-chip">{viewDoctor.verificationStatus ?? "draft"}</span>
                      </div>
                    </div>
                  </div>
                  <label>
                    Email
                    <input value={viewDoctor.email || ""} readOnly />
                  </label>
                  <label>
                    Phone
                    <input value={viewDoctor.phone || ""} readOnly />
                  </label>
                  <label className="ops-span">
                    Specializations
                    <input value={viewDoctor.specializations?.join(", ") || ""} readOnly />
                  </label>
                </div>
              )}

              {viewStep === 2 && (
                <div className="ops-grid ops-grid--2">
                  <label>
                    Medical Council Number
                    <input value={viewDoctor.medicalCouncilNumber || ""} readOnly />
                  </label>
                  <label>
                    Government ID Number
                    <input value={viewDoctor.governmentIdNumber || ""} readOnly />
                  </label>
                  <label className="ops-span">
                    Documents
                    <div className="ops-doc-grid">
                      {(viewDoctor.documentList ?? []).length ? (
                        viewDoctor.documentList?.map((doc) => (
                          <div key={doc.id ?? doc.type} className="ops-doc-card">
                            <div className="ops-doc-title">{doc.type.replace(/_/g, " ")}</div>
                            <div className="ops-doc-meta">{doc.fileName || doc.storageKey || "Document uploaded"}</div>
                            <a className="ops-doc-link" href={doc.downloadUrl} target="_blank" rel="noreferrer">
                              Download
                            </a>
                            <span className={`ops-chip ${doc.status === "accepted" ? "success" : "warning"}`}>{doc.status}</span>
                          </div>
                        ))
                      ) : (
                        <div className="ops-kpi-sub">No documents uploaded.</div>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {viewStep === 3 && (
                <div className="ops-grid ops-grid--2">
                  <label>
                    Highest Qualification
                    <input value={viewDoctor.highestQualification || ""} readOnly />
                  </label>
                  <label>
                    Experience (years)
                    <input value={String(viewDoctor.experienceYears ?? "")} readOnly />
                  </label>
                  <label>
                    Languages
                    <input value={viewDoctor.languages?.join(", ") || ""} readOnly />
                  </label>
                  <label>
                    Consultation Fee
                    <input value={viewDoctor.consultationFeeInr ? `₹ ${viewDoctor.consultationFeeInr}` : ""} readOnly />
                  </label>
                  <label className="ops-span">
                    Short Bio
                    <textarea value={viewDoctor.shortBio || ""} readOnly />
                  </label>
                </div>
              )}

              {viewStep === 4 && (
                <div className="ops-grid ops-grid--2">
                  <label className="ops-span">
                    Practice Address
                    <textarea value={viewDoctor.practiceAddress || ""} readOnly />
                  </label>
                  <label>
                    OPD Days
                    <input value={viewDoctor.availability?.opdDays?.join(", ") || ""} readOnly />
                  </label>
                  <label>
                    OPD Timings
                    <input value={`${viewDoctor.availability?.opdFrom || ""} - ${viewDoctor.availability?.opdTo || ""}`} readOnly />
                  </label>
                  <label className="ops-span">
                    Teleconsult Slots
                    <textarea value={viewDoctor.availability?.teleSlots?.join(", ") || ""} readOnly />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
