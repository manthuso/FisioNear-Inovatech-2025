// Sample appointment data
const appointments = [
  {
    id: 1,
    date: "2025-10-15",
    time: "09:00",
    patient: "Maria Silva",
    reason: "Consulta de rotina",
    type: "Presencial",
  },
  {
    id: 2,
    date: "2025-10-15",
    time: "14:30",
    patient: "João Santos",
    reason: "Retorno - Exames",
    type: "Presencial",
  },
  {
    id: 3,
    date: "2025-10-22",
    time: "10:00",
    patient: "Ana Costa",
    reason: "Primeira consulta",
    type: "Telemedicina",
  },
  {
    id: 4,
    date: "2025-10-22",
    time: "15:00",
    patient: "Pedro Oliveira",
    reason: "Acompanhamento",
    type: "Presencial",
  },
  {
    id: 5,
    date: "2025-10-29",
    time: "11:00",
    patient: "Carla Mendes",
    reason: "Consulta de emergência",
    type: "Presencial",
  },
]

// Sample exercises data
const exercises = [
  {
    id: 1,
    name: "Agachamento leve",
    series: "3×15",
    seriesCount: 3,
    reps: 15,
    duration: "5 minutos",
    status: "pending",
    description: "Agachamento leve visa fortalecer coxas e glúteos, melhorando o equilíbrio e a postura.",
    instructions: [
      "Fique com os pés afastados na largura dos ombros.",
      "Desça devagar até o ângulo de 90°.",
      "Mantenha o abdômen contraído.",
      "Suba lentamente até a posição inicial.",
    ],
  },
  {
    id: 2,
    name: "Elevação de braço",
    series: "3×10",
    seriesCount: 3,
    reps: 10,
    duration: "4 minutos",
    status: "completed",
    description: "Exercício para mobilidade dos ombros e fortalecimento dos deltoides.",
    instructions: [
      "Fique em pé com os pés na largura dos ombros.",
      "Eleve os braços lateralmente até a altura dos ombros.",
      "Mantenha os cotovelos levemente flexionados.",
      "Desça lentamente e repita o movimento.",
    ],
  },
  {
    id: 3,
    name: "Alongamento posterior",
    series: "2×30s",
    seriesCount: 2,
    reps: "30s",
    duration: "3 minutos",
    status: "pending",
    description: "Alongamento da cadeia posterior para melhorar a flexibilidade.",
    instructions: [
      "Sente-se no chão com as pernas estendidas.",
      "Incline o tronco para frente tentando tocar os pés.",
      "Mantenha a posição por 30 segundos sem forçar.",
      "Respire profundamente durante o alongamento.",
    ],
  },
  {
    id: 4,
    name: "Respiração diafragmática",
    series: "3x",
    seriesCount: 3,
    reps: "10 respirações",
    duration: "5 minutos",
    status: "pending",
    description: "Exercício de respiração profunda para relaxamento e controle respiratório.",
    instructions: [
      "Deite-se em uma posição confortável.",
      "Coloque uma mão no peito e outra no abdômen.",
      "Inspire pelo nariz expandindo o abdômen.",
      "Expire lentamente pela boca.",
    ],
  },
]

const patients = [
  {
    id: 1,
    name: "Maria Silva",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "maria@email.com",
    dateRegistration: "15/09/2025",
    diagnosis: "Tendinite",
    therapist: "Dr. Silva",
  },
  {
    id: 2,
    name: "João Santos",
    cpf: "987.654.321-00",
    phone: "(11) 99876-5432",
    email: "joao@email.com",
    dateRegistration: "20/09/2025",
    diagnosis: "Lombalgia",
    therapist: "Dr. Santos",
  },
  {
    id: 3,
    name: "Ana Costa",
    cpf: "456.789.123-00",
    phone: "(11) 99999-8888",
    email: "ana@email.com",
    dateRegistration: "25/09/2025",
    diagnosis: "Cervicalgia",
    therapist: "Dra. Costa",
  },
]

const therapists = [
  {
    id: 1,
    name: "Dr. Carlos Silva",
    crefito: "123456/RJ",
    phone: "(21) 98765-4321",
    email: "carlos@clinic.com",
    specialty: "Ortopedia",
    patients: 15,
  },
  {
    id: 2,
    name: "Dra. Juliana Santos",
    crefito: "654321/SP",
    phone: "(11) 99876-5432",
    email: "juliana@clinic.com",
    specialty: "Neurologia",
    patients: 12,
  },
  {
    id: 3,
    name: "Dr. Roberto Costa",
    crefito: "789123/MG",
    phone: "(31) 99999-8888",
    email: "roberto@clinic.com",
    specialty: "Desportiva",
    patients: 18,
  },
]

// Consultation history data for the new Results Monitoring page
const consultationHistory = [
  {
    id: 1,
    date: "10/09/2025",
    description: "1ª avaliação inicial",
  },
  {
    id: 2,
    date: "17/09/2025",
    description: "2ª avaliação de acompanhamento",
  },
  {
    id: 3,
    date: "24/09/2025",
    description: "3ª avaliação de progresso",
  },
  {
    id: 4,
    date: "01/10/2025",
    description: "4ª avaliação mensal",
  },
]

// Current date state
const currentDate = new Date()
let currentMonth = currentDate.getMonth()
let currentYear = currentDate.getFullYear()

// Month names in Portuguese
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

// Import Bootstrap
const bootstrap = window.bootstrap

// Initialize the calendar
function initCalendar() {
  renderCalendar()
  renderAppointments()
  setupEventListeners()
}

// Render calendar days
function renderCalendar() {
  const calendarDays = document.getElementById("calendarDays")
  const currentMonthElement = document.getElementById("currentMonth")

  currentMonthElement.textContent = monthNames[currentMonth]

  // Clear previous days
  calendarDays.innerHTML = ""

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Add previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const dayElement = createDayElement(day, true)
    calendarDays.appendChild(dayElement)
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = createDayElement(day, false)
    calendarDays.appendChild(dayElement)
  }

  // Add next month's days to fill the grid
  const totalCells = calendarDays.children.length
  const remainingCells = 35 - totalCells // 5 weeks * 7 days

  for (let day = 1; day <= remainingCells; day++) {
    const dayElement = createDayElement(day, true)
    calendarDays.appendChild(dayElement)
  }
}

// Create a day element
function createDayElement(day, isOtherMonth) {
  const dayElement = document.createElement("div")
  dayElement.className = "calendar-day"

  if (isOtherMonth) {
    dayElement.classList.add("other-month")
  }

  // Check if it's today
  const today = new Date()
  if (
    !isOtherMonth &&
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear()
  ) {
    dayElement.classList.add("today")
  }

  // Check for appointments
  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  const dayAppointments = appointments.filter((apt) => apt.date === dateStr)

  if (dayAppointments.length > 0 && !isOtherMonth) {
    dayElement.classList.add("has-appointment")

    dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="appointment-indicator">${dayAppointments.length} consulta${dayAppointments.length > 1 ? "s" : ""}</div>
            <div class="appointment-time">${dayAppointments[0].time}</div>
        `

    dayElement.addEventListener("click", () => showDayAppointments(dateStr, dayAppointments))
  } else {
    dayElement.innerHTML = `<div class="day-number">${day}</div>`
  }

  return dayElement
}

// Render appointments list
function renderAppointments() {
  const appointmentsList = document.getElementById("appointmentsList")
  appointmentsList.innerHTML = ""

  // Sort appointments by date
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time),
  )

  // Show only upcoming appointments
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingAppointments = sortedAppointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    return aptDate >= today
  })

  if (upcomingAppointments.length === 0) {
    appointmentsList.innerHTML = '<p class="text-muted text-center">Nenhuma consulta marcada</p>'
    return
  }

  upcomingAppointments.forEach((appointment) => {
    const appointmentElement = createAppointmentElement(appointment)
    appointmentsList.appendChild(appointmentElement)
  })
}

// Create appointment element
function createAppointmentElement(appointment) {
  const element = document.createElement("div")
  element.className = "appointment-item"

  const date = new Date(appointment.date)
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`

  element.innerHTML = `
        <div class="appointment-date">
            <i class="bi bi-calendar-check"></i>
            ${formattedDate}
        </div>
        <div class="appointment-time-slot">
            <i class="bi bi-clock"></i>
            ${appointment.time}
        </div>
        <div class="appointment-reason">${appointment.reason}</div>
    `

  element.addEventListener("click", () => showAppointmentDetails(appointment))

  return element
}

// Show appointment details in modal
function showAppointmentDetails(appointment) {
  const modal = new bootstrap.Modal(document.getElementById("appointmentModal"))
  const modalBody = document.getElementById("modalBody")

  const date = new Date(appointment.date)
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`

  modalBody.innerHTML = `
        <div class="detail-row">
            <i class="bi bi-person-fill"></i>
            <span class="detail-label">Paciente:</span>
            <span class="detail-value">${appointment.patient}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-calendar-event"></i>
            <span class="detail-label">Data:</span>
            <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-clock"></i>
            <span class="detail-label">Horário:</span>
            <span class="detail-value">${appointment.time}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-file-text"></i>
            <span class="detail-label">Motivo:</span>
            <span class="detail-value">${appointment.reason}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-geo-alt"></i>
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${appointment.type}</span>
        </div>
    `

  modal.show()
}

// Show appointments for a specific day
function showDayAppointments(dateStr, dayAppointments) {
  const modal = new bootstrap.Modal(document.getElementById("appointmentModal"))
  const modalBody = document.getElementById("modalBody")

  const date = new Date(dateStr)
  const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`

  let appointmentsHTML = `<h6 class="mb-3">Consultas para ${formattedDate}</h6>`

  dayAppointments.forEach((apt) => {
    appointmentsHTML += `
            <div class="detail-row">
                <i class="bi bi-clock"></i>
                <span class="detail-label">${apt.time}</span>
                <span class="detail-value">${apt.patient} - ${apt.reason}</span>
            </div>
        `
  })

  modalBody.innerHTML = appointmentsHTML
  modal.show()
}

// Render exercises list
function renderExercises() {
  const exercisesList = document.getElementById("exercisesList")
  exercisesList.innerHTML = ""

  exercises.forEach((exercise) => {
    const exerciseCard = createExerciseCard(exercise)
    exercisesList.appendChild(exerciseCard)
  })

  updateExerciseProgress()
}

// Create exercise card element
function createExerciseCard(exercise) {
  const card = document.createElement("div")
  card.className = `exercise-card ${exercise.status}`

  const statusText = exercise.status === "completed" ? "Concluído" : "Pendente"
  const statusClass = exercise.status === "completed" ? "completed" : "pending"

  card.innerHTML = `
        <div class="exercise-header">
            <div>
                <h4 class="exercise-title">${exercise.name}</h4>
            </div>
            <span class="exercise-badge">ícone referente ao exercício</span>
        </div>
        <div class="exercise-details">
            <div class="exercise-detail-item">
                <i class="bi bi-list-ol"></i>
                <span><strong>Séries:</strong> ${exercise.series}</span>
            </div>
            <div class="exercise-detail-item">
                <i class="bi bi-clock"></i>
                <span><strong>Duração:</strong> ${exercise.duration}</span>
            </div>
        </div>
        <div class="exercise-status ${statusClass}">${statusText}</div>
        <div class="exercise-actions">
            <button class="btn-details" onclick="showExerciseDetailsPage(${exercise.id})">
                Ver detalhes
            </button>
            ${
              exercise.status === "pending"
                ? `<button class="btn-complete" onclick="markExerciseComplete(${exercise.id})">
                    Marcar concluído
                </button>`
                : `<button class="btn-complete" disabled>
                    Concluído
                </button>`
            }
        </div>
    `

  return card
}

// Show full-page exercise details
function showExerciseDetailsPage(exerciseId) {
  const exercise = exercises.find((ex) => ex.id === exerciseId)
  if (!exercise) return

  // Hide all sections
  document.querySelectorAll(".section-content").forEach((sec) => {
    sec.classList.remove("active")
  })

  // Show exercise details section
  document.getElementById("exerciseDetailsSection").classList.add("active")

  // Update buttons state
  const btnMarkCompleted = document.getElementById("btnMarkCompleted")
  const btnRedo = document.getElementById("btnRedo")

  if (exercise.status === "completed") {
    btnMarkCompleted.disabled = true
    btnMarkCompleted.innerHTML = '<i class="bi bi-check-lg"></i> Concluído'
  } else {
    btnMarkCompleted.disabled = false
    btnMarkCompleted.innerHTML = '<i class="bi bi-check-lg"></i> Concluído'
  }

  // Set up button click handlers
  btnMarkCompleted.onclick = () => {
    markExerciseComplete(exerciseId)
    showExerciseDetailsPage(exerciseId) // Refresh the page
  }

  btnRedo.onclick = () => {
    if (exercise.status === "completed") {
      exercise.status = "pending"
      renderExercises()
      showExerciseDetailsPage(exerciseId)
      alert(`Exercício "${exercise.name}" marcado para refazer!`)
    } else {
      alert("Este exercício ainda não foi concluído.")
    }
  }
}

// Show exercise details in modal
function showExerciseDetails(exerciseId) {
  const exercise = exercises.find((ex) => ex.id === exerciseId)
  if (!exercise) return

  const modal = new bootstrap.Modal(document.getElementById("exerciseModal"))
  const modalBody = document.getElementById("exerciseModalBody")

  const statusText = exercise.status === "completed" ? "Concluído" : "Pendente"
  const statusClass = exercise.status === "completed" ? "success" : "warning"

  modalBody.innerHTML = `
        <div class="detail-row">
            <i class="bi bi-clipboard-check"></i>
            <span class="detail-label">Exercício:</span>
            <span class="detail-value">${exercise.name}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-list-ol"></i>
            <span class="detail-label">Séries:</span>
            <span class="detail-value">${exercise.series}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-clock"></i>
            <span class="detail-label">Duração:</span>
            <span class="detail-value">${exercise.duration}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-info-circle"></i>
            <span class="detail-label">Status:</span>
            <span class="detail-value">
                <span class="badge bg-${statusClass}">${statusText}</span>
            </span>
        </div>
        <div class="detail-row">
            <i class="bi bi-file-text"></i>
            <span class="detail-label">Descrição:</span>
            <span class="detail-value">${exercise.description}</span>
        </div>
        <div class="detail-row">
            <i class="bi bi-lightbulb"></i>
            <span class="detail-label">Instruções:</span>
            <span class="detail-value">${exercise.instructions.join("<br>")}</span>
        </div>
    `

  // Update mark complete button
  const markCompleteBtn = document.getElementById("markCompleteBtn")
  if (exercise.status === "completed") {
    markCompleteBtn.disabled = true
    markCompleteBtn.textContent = "Já Concluído"
  } else {
    markCompleteBtn.disabled = false
    markCompleteBtn.textContent = "Marcar como Concluído"
    markCompleteBtn.onclick = () => {
      markExerciseComplete(exerciseId)
      modal.hide()
    }
  }

  modal.show()
}

// Mark exercise as complete
function markExerciseComplete(exerciseId) {
  const exercise = exercises.find((ex) => ex.id === exerciseId)
  if (exercise && exercise.status === "pending") {
    exercise.status = "completed"
    renderExercises()

    // Show success message
    alert(`Exercício "${exercise.name}" marcado como concluído!`)
  }
}

// Update exercise progress
function updateExerciseProgress() {
  const completedCount = exercises.filter((ex) => ex.status === "completed").length
  const totalCount = exercises.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  // Update progress display
  const progressCount = document.querySelector(".progress-count")
  const progressFill = document.querySelector(".progress-bar-fill")
  const progressPercentage = document.querySelector(".progress-percentage")

  if (progressCount) {
    progressCount.textContent = `${completedCount} / ${totalCount}`
  }

  if (progressFill) {
    progressFill.style.width = `${percentage}%`
  }

  if (progressPercentage) {
    progressPercentage.textContent = `${percentage}%`
  }
}

// Render consultation history
function renderConsultationHistory() {
  const historyList = document.getElementById("consultationHistoryList")
  historyList.innerHTML = ""

  consultationHistory.forEach((item) => {
    const historyElement = document.createElement("div")
    historyElement.className = "history-item"

    historyElement.innerHTML = `
      <div>
        <span class="history-item-date">${item.date}</span>
        <span> — </span>
        <span class="history-item-description">${item.description}</span>
      </div>
    `

    historyList.appendChild(historyElement)
  })
}

function setupResultsMonitoringListeners() {
  const btnDownloadPDF = document.getElementById("btnDownloadPDF")
  const btnCompare = document.getElementById("btnCompare")

  if (btnDownloadPDF) {
    btnDownloadPDF.addEventListener("click", () => {
      alert("Iniciando download do relatório em PDF...")
      // Here you would implement actual PDF download functionality
    })
  }

  if (btnCompare) {
    btnCompare.addEventListener("click", () => {
      alert("Comparando últimos 30 dias...")
      // Here you would implement comparison functionality
    })
  }
}

function initDashboard() {
  updateDashboardStats()
}

function updateDashboardStats() {
  document.getElementById("totalPatients").textContent = patients.length
  document.getElementById("totalTherapists").textContent = therapists.length

  const todayAppointmentsCount = appointments.filter((apt) => {
    const aptDate = new Date(apt.date)
    const today = new Date()
    return aptDate.toDateString() === today.toDateString()
  }).length

  document.getElementById("todayAppointments").textContent = todayAppointmentsCount

  const completedCount = exercises.filter((ex) => ex.status === "completed").length
  document.getElementById("dashboardCompleted").textContent = completedCount
}

function renderPatientsTable() {
  const tbody = document.getElementById("patientsTableBody")
  tbody.innerHTML = ""

  patients.forEach((patient) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td><strong>${patient.name}</strong></td>
      <td>${patient.cpf}</td>
      <td>${patient.phone}</td>
      <td>${patient.email}</td>
      <td>${patient.dateRegistration}</td>
      <td>
        <div class="table-actions">
          <button class="btn-view" onclick="showPatientDetails(${patient.id})">
            <i class="bi bi-eye"></i>
            Ver
          </button>
          <button class="btn-edit">
            <i class="bi bi-pencil"></i>
            Editar
          </button>
          <button class="btn-delete">
            <i class="bi bi-trash"></i>
            Deletar
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function showPatientDetails(patientId) {
  const patient = patients.find((p) => p.id === patientId)
  if (!patient) return

  document.querySelectorAll(".section-content").forEach((sec) => {
    sec.classList.remove("active")
  })

  document.getElementById("patientDetailsSection").classList.add("active")

  const detailsContent = document.getElementById("patientDetailsContent")
  detailsContent.innerHTML = `
    <h2 class="section-title">${patient.name}</h2>
    
    <div class="details-section">
      <h3>Informações Pessoais</h3>
      <div class="details-grid">
        <div class="detail-field">
          <div class="detail-label">Nome Completo</div>
          <div class="detail-value">${patient.name}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">CPF</div>
          <div class="detail-value">${patient.cpf}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Telefone</div>
          <div class="detail-value">${patient.phone}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Email</div>
          <div class="detail-value">${patient.email}</div>
        </div>
      </div>
    </div>

    <div class="details-section">
      <h3>Informações Clínicas</h3>
      <div class="details-grid">
        <div class="detail-field">
          <div class="detail-label">Diagnóstico</div>
          <div class="detail-value">${patient.diagnosis}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Fisioterapeuta Responsável</div>
          <div class="detail-value">${patient.therapist}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Data de Cadastro</div>
          <div class="detail-value">${patient.dateRegistration}</div>
        </div>
      </div>
    </div>

    <div class="details-actions">
      <button class="btn-edit-details">
        <i class="bi bi-pencil"></i>
        Editar Informações
      </button>
      <button class="btn-delete-details">
        <i class="bi bi-trash"></i>
        Deletar Paciente
      </button>
    </div>
  `

  document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"))
  document.querySelector('[data-section="pacientes"]').classList.add("active")
}

function renderTherapistsTable() {
  const tbody = document.getElementById("therapistsTableBody")
  tbody.innerHTML = ""

  therapists.forEach((therapist) => {
    const row = document.createElement("tr")
    row.innerHTML = `
      <td><strong>${therapist.name}</strong></td>
      <td>${therapist.crefito}</td>
      <td>${therapist.phone}</td>
      <td>${therapist.email}</td>
      <td>${therapist.specialty}</td>
      <td>
        <div class="table-actions">
          <button class="btn-view" onclick="showTherapistDetails(${therapist.id})">
            <i class="bi bi-eye"></i>
            Ver
          </button>
          <button class="btn-edit">
            <i class="bi bi-pencil"></i>
            Editar
          </button>
          <button class="btn-delete">
            <i class="bi bi-trash"></i>
            Deletar
          </button>
        </div>
      </td>
    `
    tbody.appendChild(row)
  })
}

function showTherapistDetails(therapistId) {
  const therapist = therapists.find((t) => t.id === therapistId)
  if (!therapist) return

  document.querySelectorAll(".section-content").forEach((sec) => {
    sec.classList.remove("active")
  })

  document.getElementById("therapistDetailsSection").classList.add("active")

  const detailsContent = document.getElementById("therapistDetailsContent")
  detailsContent.innerHTML = `
    <h2 class="section-title">${therapist.name}</h2>
    
    <div class="details-section">
      <h3>Informações Profissionais</h3>
      <div class="details-grid">
        <div class="detail-field">
          <div class="detail-label">Nome</div>
          <div class="detail-value">${therapist.name}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">CREFITO</div>
          <div class="detail-value">${therapist.crefito}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Especialidade</div>
          <div class="detail-value">${therapist.specialty}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Telefone</div>
          <div class="detail-value">${therapist.phone}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Email</div>
          <div class="detail-value">${therapist.email}</div>
        </div>
        <div class="detail-field">
          <div class="detail-label">Pacientes Ativos</div>
          <div class="detail-value">${therapist.patients}</div>
        </div>
      </div>
    </div>

    <div class="details-actions">
      <button class="btn-edit-details">
        <i class="bi bi-pencil"></i>
        Editar Informações
      </button>
      <button class="btn-delete-details">
        <i class="bi bi-trash"></i>
        Remover Fisioterapeuta
      </button>
    </div>
  `

  document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"))
  document.querySelector('[data-section="fisioterapeutas"]').classList.add("active")
}

// Setup event listeners
function setupEventListeners() {
  // Month navigation
  document.getElementById("prevMonth").addEventListener("click", () => {
    currentMonth--
    if (currentMonth < 0) {
      currentMonth = 11
      currentYear--
    }
    renderCalendar()
  })

  document.getElementById("nextMonth").addEventListener("click", () => {
    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
    renderCalendar()
  })

  // Year selection
  document.getElementById("yearSelect").addEventListener("change", (e) => {
    currentYear = Number.parseInt(e.target.value)
    renderCalendar()
  })

  // Back to exercises button
  document.getElementById("backToExercises").addEventListener("click", () => {
    document.getElementById("exerciseDetailsSection").classList.remove("active")
    document.getElementById("exerciciosSection").classList.add("active")
    document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"))
    document.querySelector('[data-section="exercicios"]').classList.add("active")
  })

  const backToPatientsBtn = document.getElementById("backToPatients")
  if (backToPatientsBtn) {
    backToPatientsBtn.addEventListener("click", () => {
      document.getElementById("patientDetailsSection").classList.remove("active")
      document.getElementById("pacientesSection").classList.add("active")
    })
  }

  const backToTherapistsBtn = document.getElementById("backToTherapists")
  if (backToTherapistsBtn) {
    backToTherapistsBtn.addEventListener("click", () => {
      document.getElementById("therapistDetailsSection").classList.remove("active")
      document.getElementById("fisioterapeutasSection").classList.add("active")
    })
  }

  const btnAddPatient = document.getElementById("btnAddPatient")
  if (btnAddPatient) {
    btnAddPatient.addEventListener("click", () => {
      alert("Formulário para adicionar novo paciente em desenvolvimento")
    })
  }

  const btnAddTherapist = document.getElementById("btnAddTherapist")
  if (btnAddTherapist) {
    btnAddTherapist.addEventListener("click", () => {
      alert("Formulário para adicionar novo fisioterapeuta em desenvolvimento")
    })
  }

  // Sidebar navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"))
      item.classList.add("active")

      const section = item.dataset.section

      document.querySelectorAll(".section-content").forEach((sec) => {
        sec.classList.remove("active")
      })

      if (section === "dashboard") {
        document.getElementById("dashboardSection").classList.add("active")
        initDashboard()
      } else if (section === "consultas") {
        document.getElementById("consultasSection").classList.add("active")
      } else if (section === "exercicios") {
        document.getElementById("exerciciosSection").classList.add("active")
        renderExercises()
      } else if (section === "pacientes") {
        document.getElementById("pacientesSection").classList.add("active")
        renderPatientsTable()
      } else if (section === "fisioterapeutas") {
        document.getElementById("fisioterapeutasSection").classList.add("active")
        renderTherapistsTable()
      } else if (section === "monitoria") {
        document.getElementById("monitoriaResultadosSection").classList.add("active")
        renderConsultationHistory()
        setupResultsMonitoringListeners()
      } else if (section === "configuracoes") {
        alert("Seção de Configurações em desenvolvimento")
      }
    })
  })

  // Header buttons
  document.getElementById("notificationBtn").addEventListener("click", () => {
    alert("Você tem 3 notificações pendentes!")
  })

  document.getElementById("documentsBtn").addEventListener("click", () => {
    alert("Abrindo documentos...")
  })

  const monitoringCard = document.querySelector(".monitoring-card")
  if (monitoringCard) {
    monitoringCard.addEventListener("click", () => {
      // Update navigation
      document.querySelectorAll(".nav-item").forEach((nav) => nav.classList.remove("active"))
      document.querySelector('[data-section="monitoria"]').classList.add("active")

      // Hide all sections
      document.querySelectorAll(".section-content").forEach((sec) => {
        sec.classList.remove("active")
      })

      // Show monitoria section
      document.getElementById("monitoriaResultadosSection").classList.add("active")
      updateMonitoriaStats()
    })
  }
}

function updateMonitoriaStats() {
  // Calculate completed exercises
  const completedCount = exercises.filter((ex) => ex.status === "completed").length
  const totalCount = exercises.length
  const completionRate = Math.round((completedCount / totalCount) * 100)

  // Update stats
  document.getElementById("totalCompleted").textContent = completedCount
  document.getElementById("totalAppointments").textContent = appointments.length
  document.getElementById("completionRate").textContent = `${completionRate}%`
  document.getElementById("currentStreak").textContent = "5"
}

window.showExerciseDetails = showExerciseDetails
window.markExerciseComplete = markExerciseComplete
window.showExerciseDetailsPage = showExerciseDetailsPage
window.showPatientDetails = showPatientDetails
window.showTherapistDetails = showTherapistDetails

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initCalendar)

// Initialize consultation history when DOM is loaded
window.addEventListener("DOMContentLoaded", () => {
  renderConsultationHistory()
  setupResultsMonitoringListeners()
})

// Initialize dashboard when DOM is loaded
window.addEventListener("DOMContentLoaded", initDashboard)
