import { useEffect, useMemo, useState } from "react"
import "../operations.css"

type ProgramType = "Fitness Challenge" | "Mental Health Program" | "Wellness Camp"
type DeliveryMode = "Onsite Camp" | "Virtual" | "Hybrid"
type ProgramStatus = "Draft" | "Open Enrollment" | "Live" | "Completed"

type HealthProgram = {
  id: string
  title: string
  type: ProgramType
  mode: DeliveryMode
  description: string
  startDate: string
  endDate: string
  location: string
  capacity: number
  status: ProgramStatus
  createdBy: string
}

type CampaignStatus = "Draft" | "Open Enrollment" | "Live" | "Completed"

type AssessmentQuestion = {
  id: string
  prompt: string
  options: string[]
  correctOption: number
  points: number
}

type AssessmentTask = {
  id: string
  title: string
  points: number
  questions: AssessmentQuestion[]
}

type HealthAssessmentCampaign = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  targetCorporates: string
  status: CampaignStatus
  tasks: AssessmentTask[]
  createdBy: string
}

const PROGRAM_STORAGE_KEY = "astikan_health_programs_v1"
const CAMPAIGN_STORAGE_KEY = "astikan_health_assessment_campaigns_v1"

const defaultPrograms: HealthProgram[] = [
  {
    id: "prog-1001",
    title: "FitSprint 30",
    type: "Fitness Challenge",
    mode: "Hybrid",
    description: "30-day step and activity challenge across corporate teams.",
    startDate: "2026-03-10",
    endDate: "2026-04-09",
    location: "Pan India",
    capacity: 2500,
    status: "Open Enrollment",
    createdBy: "Super Admin",
  },
  {
    id: "prog-1002",
    title: "MindEase Circle",
    type: "Mental Health Program",
    mode: "Virtual",
    description: "Guided therapy and resilience sessions for stress management.",
    startDate: "2026-03-15",
    endDate: "2026-05-15",
    location: "Virtual Cohort",
    capacity: 1200,
    status: "Open Enrollment",
    createdBy: "Super Admin",
  },
]

const defaultCampaigns: HealthAssessmentCampaign[] = [
  {
    id: "camp-1001",
    title: "Heart Smart Week",
    description: "Corporate wellness knowledge sprint around cardiac health and emergency response.",
    startDate: "2026-03-08",
    endDate: "2026-03-14",
    targetCorporates: "All enrolled corporates",
    status: "Open Enrollment",
    createdBy: "Super Admin",
    tasks: [
      {
        id: "task-1001",
        title: "Know your BP zones",
        points: 120,
        questions: [
          {
            id: "q-1001",
            prompt: "Which blood pressure range is generally considered stage 1 hypertension?",
            options: ["90/60", "120/80", "130-139 / 80-89", "160/110"],
            correctOption: 2,
            points: 60,
          },
          {
            id: "q-1002",
            prompt: "How often should employees with elevated BP track readings at home?",
            options: ["Monthly", "Weekly", "Only during symptoms", "Never"],
            correctOption: 1,
            points: 60,
          },
        ],
      },
    ],
  },
]

function loadPrograms() {
  try {
    const raw = window.localStorage.getItem(PROGRAM_STORAGE_KEY)
    if (!raw) return defaultPrograms
    const parsed = JSON.parse(raw) as HealthProgram[]
    return Array.isArray(parsed) && parsed.length ? parsed : defaultPrograms
  } catch {
    return defaultPrograms
  }
}

function loadCampaigns() {
  try {
    const raw = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY)
    if (!raw) return defaultCampaigns
    const parsed = JSON.parse(raw) as HealthAssessmentCampaign[]
    return Array.isArray(parsed) && parsed.length ? parsed : defaultCampaigns
  } catch {
    return defaultCampaigns
  }
}

export function ProgramsManagementPage() {
  const [programs, setPrograms] = useState<HealthProgram[]>([])
  const [campaigns, setCampaigns] = useState<HealthAssessmentCampaign[]>([])
  const [notice, setNotice] = useState("")
  const [campaignNotice, setCampaignNotice] = useState("")
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    title: "",
    type: "Fitness Challenge" as ProgramType,
    mode: "Hybrid" as DeliveryMode,
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    capacity: "500",
    status: "Open Enrollment" as ProgramStatus,
  })

  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    targetCorporates: "All enrolled corporates",
    status: "Open Enrollment" as CampaignStatus,
  })

  const [taskDraft, setTaskDraft] = useState({
    title: "",
    points: "100",
    questionPrompt: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "0",
    questionPoints: "25",
  })

  useEffect(() => {
    setLoading(true)
    setPrograms(loadPrograms())
    setCampaigns(loadCampaigns())
    const timer = window.setTimeout(() => setLoading(false), 300)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!programs.length) return
    window.localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(programs))
  }, [programs])

  useEffect(() => {
    if (!campaigns.length) return
    window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaigns))
  }, [campaigns])

  const openEnrollmentCount = useMemo(
    () => programs.filter((program) => program.status === "Open Enrollment").length,
    [programs]
  )

  const liveCampaignCount = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "Open Enrollment" || campaign.status === "Live").length,
    [campaigns]
  )

  function createProgram() {
    if (!form.title.trim() || !form.startDate || !form.endDate || !form.location.trim()) {
      setNotice("Fill title, dates, and location before creating a program.")
      return
    }
    const next: HealthProgram = {
      id: `prog-${Date.now()}`,
      title: form.title.trim(),
      type: form.type,
      mode: form.mode,
      description: form.description.trim() || "Program details will be updated by super admin.",
      startDate: form.startDate,
      endDate: form.endDate,
      location: form.location.trim(),
      capacity: Number(form.capacity) || 0,
      status: form.status,
      createdBy: "Super Admin",
    }
    setPrograms((prev) => [next, ...prev])
    setNotice(`Program "${next.title}" created and published.`)
    setForm({
      title: "",
      type: "Fitness Challenge",
      mode: "Hybrid",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      capacity: "500",
      status: "Open Enrollment",
    })
  }

  function createCampaign() {
    if (!campaignForm.title.trim() || !campaignForm.startDate || !campaignForm.endDate) {
      setCampaignNotice("Fill campaign title and dates.")
      return
    }
    if (!taskDraft.title.trim() || !taskDraft.questionPrompt.trim()) {
      setCampaignNotice("Add at least one task title and one question.")
      return
    }

    const options = [taskDraft.optionA, taskDraft.optionB, taskDraft.optionC, taskDraft.optionD].map((item) => item.trim())
    if (options.some((item) => !item)) {
      setCampaignNotice("All 4 options are mandatory for assessment question.")
      return
    }

    const nextQuestion: AssessmentQuestion = {
      id: `q-${Date.now()}`,
      prompt: taskDraft.questionPrompt.trim(),
      options,
      correctOption: Number(taskDraft.correctOption),
      points: Number(taskDraft.questionPoints) || 0,
    }

    const nextTask: AssessmentTask = {
      id: `task-${Date.now()}`,
      title: taskDraft.title.trim(),
      points: Number(taskDraft.points) || nextQuestion.points,
      questions: [nextQuestion],
    }

    const nextCampaign: HealthAssessmentCampaign = {
      id: `camp-${Date.now()}`,
      title: campaignForm.title.trim(),
      description: campaignForm.description.trim() || "Corporate health assessment challenge.",
      startDate: campaignForm.startDate,
      endDate: campaignForm.endDate,
      targetCorporates: campaignForm.targetCorporates,
      status: campaignForm.status,
      tasks: [nextTask],
      createdBy: "Super Admin",
    }

    setCampaigns((prev) => [nextCampaign, ...prev])
    setCampaignNotice(`Assessment campaign "${nextCampaign.title}" published for employee app.`)
    setCampaignForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      targetCorporates: "All enrolled corporates",
      status: "Open Enrollment",
    })
    setTaskDraft({
      title: "",
      points: "100",
      questionPrompt: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "0",
      questionPoints: "25",
    })
  }

  return (
    <main className="ops-page">
      <header className="ops-head">
        <h1>Health Programs Management</h1>
        <p>Create fitness, mental health, and camp-based programs for corporate enrollment.</p>
      </header>

      {loading ? (
        <div className="ops-loader-fullscreen">
          <div className="ops-spinner" />
          <span>Loading programs...</span>
        </div>
      ) : null}

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Total Programs</h2>
          <div className="ops-kpi">{programs.length}</div>
          <div className="ops-kpi-sub">Created by super admin</div>
        </article>
        <article className="ops-card">
          <h2>Open for Enrollment</h2>
          <div className="ops-kpi">{openEnrollmentCount}</div>
          <div className="ops-kpi-sub">Visible in corporate portal</div>
        </article>
      </section>

      <section className="ops-card">
        <h2>Create Program</h2>
        <div className="ops-grid">
          <label>
            Program Title
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. Stress Reset Camp Q2" />
          </label>
          <label>
            Program Type
            <select value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as ProgramType }))}>
              <option>Fitness Challenge</option>
              <option>Mental Health Program</option>
              <option>Wellness Camp</option>
            </select>
          </label>
          <label>
            Delivery Mode
            <select value={form.mode} onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value as DeliveryMode }))}>
              <option>Onsite Camp</option>
              <option>Virtual</option>
              <option>Hybrid</option>
            </select>
          </label>
          <label>
            Start Date
            <input type="date" value={form.startDate} onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))} />
          </label>
          <label>
            End Date
            <input type="date" value={form.endDate} onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))} />
          </label>
          <label>
            Camp Location / Region
            <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="City / Region / Virtual cohort" />
          </label>
          <label>
            Capacity
            <input type="number" value={form.capacity} onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ProgramStatus }))}>
              <option>Draft</option>
              <option>Open Enrollment</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
          </label>
        </div>
        <label>
          Program Description
          <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Program goals, target audience, participation rules." />
        </label>
        <div className="ops-actions">
          <button type="button" className="primary" onClick={createProgram}>Create Program</button>
        </div>
        {notice ? <p className="ops-kpi-sub">{notice}</p> : null}
      </section>

      <section className="ops-card">
        <h2>Create Health Assessment Campaign</h2>
        <p className="ops-kpi-sub">These campaigns appear in employee app for points-based task completion.</p>
        <div className="ops-grid">
          <label>
            Campaign Title
            <input value={campaignForm.title} onChange={(event) => setCampaignForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. Diabetes Awareness Sprint" />
          </label>
          <label>
            Target Corporates
            <input value={campaignForm.targetCorporates} onChange={(event) => setCampaignForm((prev) => ({ ...prev, targetCorporates: event.target.value }))} placeholder="All enrolled corporates" />
          </label>
          <label>
            Start Date
            <input type="date" value={campaignForm.startDate} onChange={(event) => setCampaignForm((prev) => ({ ...prev, startDate: event.target.value }))} />
          </label>
          <label>
            End Date
            <input type="date" value={campaignForm.endDate} onChange={(event) => setCampaignForm((prev) => ({ ...prev, endDate: event.target.value }))} />
          </label>
          <label>
            Campaign Status
            <select value={campaignForm.status} onChange={(event) => setCampaignForm((prev) => ({ ...prev, status: event.target.value as CampaignStatus }))}>
              <option>Draft</option>
              <option>Open Enrollment</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
          </label>
          <label>
            Campaign Description
            <input value={campaignForm.description} onChange={(event) => setCampaignForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Brief campaign purpose" />
          </label>
        </div>

        <div className="ops-subsection">
          <h3>Task + Question Builder</h3>
          <div className="ops-grid">
            <label>
              Task Title
              <input value={taskDraft.title} onChange={(event) => setTaskDraft((prev) => ({ ...prev, title: event.target.value }))} placeholder="e.g. BP Basics Quiz" />
            </label>
            <label>
              Task Points
              <input type="number" value={taskDraft.points} onChange={(event) => setTaskDraft((prev) => ({ ...prev, points: event.target.value }))} />
            </label>
            <label>
              Question Prompt
              <input value={taskDraft.questionPrompt} onChange={(event) => setTaskDraft((prev) => ({ ...prev, questionPrompt: event.target.value }))} placeholder="Question asked to employees" />
            </label>
            <label>
              Correct Option Index
              <select value={taskDraft.correctOption} onChange={(event) => setTaskDraft((prev) => ({ ...prev, correctOption: event.target.value }))}>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>
            </label>
            <label>
              Option A
              <input value={taskDraft.optionA} onChange={(event) => setTaskDraft((prev) => ({ ...prev, optionA: event.target.value }))} />
            </label>
            <label>
              Option B
              <input value={taskDraft.optionB} onChange={(event) => setTaskDraft((prev) => ({ ...prev, optionB: event.target.value }))} />
            </label>
            <label>
              Option C
              <input value={taskDraft.optionC} onChange={(event) => setTaskDraft((prev) => ({ ...prev, optionC: event.target.value }))} />
            </label>
            <label>
              Option D
              <input value={taskDraft.optionD} onChange={(event) => setTaskDraft((prev) => ({ ...prev, optionD: event.target.value }))} />
            </label>
          </div>
        </div>

        <div className="ops-actions">
          <button type="button" className="primary" onClick={createCampaign}>Publish Assessment Campaign</button>
        </div>
        {campaignNotice ? <p className="ops-kpi-sub">{campaignNotice}</p> : null}
      </section>

      <section className="ops-grid">
        <article className="ops-card">
          <h2>Assessment Campaigns</h2>
          <div className="ops-kpi">{campaigns.length}</div>
          <div className="ops-kpi-sub">Total campaigns created</div>
        </article>
        <article className="ops-card">
          <h2>Live/Enrollment Campaigns</h2>
          <div className="ops-kpi">{liveCampaignCount}</div>
          <div className="ops-kpi-sub">Visible to employee app</div>
        </article>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Dates</th>
              <th>Corporate Scope</th>
              <th>Tasks</th>
              <th>Total Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const totalPoints = campaign.tasks.reduce((sum, task) => sum + task.points, 0)
              return (
                <tr key={campaign.id}>
                  <td>
                    {campaign.title}
                    <br />
                    <small>{campaign.createdBy}</small>
                  </td>
                  <td>{campaign.startDate} to {campaign.endDate}</td>
                  <td>{campaign.targetCorporates}</td>
                  <td>{campaign.tasks.length}</td>
                  <td>{totalPoints}</td>
                  <td><span className={`ops-chip ${campaign.status === "Live" || campaign.status === "Open Enrollment" ? "success" : "warning"}`}>{campaign.status}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section className="ops-table-wrap">
        <table className="ops-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Type</th>
              <th>Mode</th>
              <th>Dates</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.id}>
                <td>
                  {program.title}
                  <br />
                  <small>{program.createdBy}</small>
                </td>
                <td>{program.type}</td>
                <td>{program.mode}</td>
                <td>{program.startDate} to {program.endDate}</td>
                <td>{program.location}</td>
                <td>{program.capacity}</td>
                <td><span className={`ops-chip ${program.status === "Open Enrollment" || program.status === "Live" ? "success" : "warning"}`}>{program.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
