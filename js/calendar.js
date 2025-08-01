// DeadlineDASH - Calendar JavaScript

let currentDate = new Date()
let calendarView = "month"

document.addEventListener("DOMContentLoaded", () => {
  initializeCalendar()
  setupCalendarControls()
})

function initializeCalendar() {
  updateCalendar()
}

function setupCalendarControls() {
  // Calendar view buttons
  const monthViewBtn = document.getElementById("monthViewBtn")
  const listViewBtn = document.getElementById("listViewBtn")
  const todayBtn = document.getElementById("todayBtn")

  if (monthViewBtn) {
    monthViewBtn.addEventListener("click", () => switchCalendarView("month"))
  }

  if (listViewBtn) {
    listViewBtn.addEventListener("click", () => switchCalendarView("list"))
  }

  if (todayBtn) {
    todayBtn.addEventListener("click", goToToday)
  }
}

function updateCalendar() {
  if (calendarView === "month") {
    renderMonthView()
  } else {
    renderListView()
  }
}

function renderMonthView() {
  const monthYear = document.getElementById("currentMonth")
  const grid = document.getElementById("calendarGrid")

  if (!monthYear || !grid) return

  // Update month/year display
  monthYear.textContent = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  // Calculate calendar dates
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  let html = ""

  // Add header days
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  days.forEach((day) => {
    html += `<div class="calendar-day-header">${day}</div>`
  })

  // Add calendar days (6 weeks = 42 days)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
    const isToday = date.toDateString() === new Date().toDateString()
    const dayAssignments = getAssignmentsForDate(date)

    html += `
            <div class="calendar-day-cell ${!isCurrentMonth ? "other-month" : ""} ${isToday ? "today" : ""}" 
                 onclick="selectCalendarDay('${date.toISOString()}')">
                <div class="day-number">${date.getDate()}</div>
                <div class="day-events">
                    ${renderDayEvents(dayAssignments)}
                </div>
            </div>
        `
  }

  grid.innerHTML = html
}

function renderListView() {
  const list = document.getElementById("calendarList")
  if (!list) return

  // Get assignments for the next 30 days
  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(now.getDate() + 30)

  const upcomingAssignments = assignments
    .filter((a) => {
      const dueDate = new Date(a.dueDate)
      return dueDate >= now && dueDate <= futureDate && a.status !== "completed"
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

  if (upcomingAssignments.length === 0) {
    list.innerHTML = '<p class="empty-state">No upcoming assignments in the next 30 days</p>'
    return
  }

  // Group by date
  const groupedAssignments = groupAssignmentsByDate(upcomingAssignments)

  let html = ""
  Object.keys(groupedAssignments).forEach((dateKey) => {
    const date = new Date(dateKey)
    const dayAssignments = groupedAssignments[dateKey]
    const isToday = date.toDateString() === new Date().toDateString()
    const isTomorrow = date.toDateString() === new Date(Date.now() + 86400000).toDateString()

    let dateLabel = formatDate(date)
    if (isToday) dateLabel = "Today"
    else if (isTomorrow) dateLabel = "Tomorrow"

    html += `
            <div class="list-day">
                <div class="list-day-header">
                    <span class="date-label">${dateLabel}</span>
                    <span class="assignment-count">${dayAssignments.length} assignment${dayAssignments.length > 1 ? "s" : ""}</span>
                </div>
                <div class="list-events">
                    ${dayAssignments.map((assignment) => renderListEvent(assignment)).join("")}
                </div>
            </div>
        `
  })

  list.innerHTML = html
}

function renderDayEvents(assignments) {
  if (assignments.length === 0) return ""

  const maxVisible = 3
  let html = ""

  assignments.slice(0, maxVisible).forEach((assignment) => {
    const course = getCourseById(assignment.courseId)
    const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== "completed"

    html += `
            <div class="calendar-event ${isOverdue ? "overdue" : ""}" 
                 style="background: ${course?.color || "#1e7e34"}"
                 title="${assignment.title} - ${course?.name || "Unknown Course"}">
                ${assignment.title}
            </div>
        `
  })

  if (assignments.length > maxVisible) {
    html += `<div class="calendar-event more">+${assignments.length - maxVisible} more</div>`
  }

  return html
}

function renderListEvent(assignment) {
  const course = getCourseById(assignment.courseId)
  const dueDate = new Date(assignment.dueDate)
  const isOverdue = dueDate < new Date() && assignment.status !== "completed"
  const timeUntilDue = getTimeUntilDue(dueDate)

  return `
        <div class="list-event ${isOverdue ? "overdue" : ""}" onclick="viewAssignmentDetails('${assignment.id}')">
            <div class="event-color" style="background: ${course?.color || "#1e7e34"}"></div>
            <div class="event-info">
                <h4>${assignment.title}</h4>
                <p>${course?.name || "Unknown Course"} - ${assignment.type}</p>
                <div class="event-meta">
                    <span class="due-time">${dueDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    <span class="time-until">${timeUntilDue}</span>
                </div>
            </div>
            <div class="event-badges">
                <span class="priority-badge priority-${assignment.priority}">${assignment.priority}</span>
                <span class="status-badge status-${assignment.status}">${assignment.status.replace("-", " ")}</span>
            </div>
        </div>
    `
}

function getAssignmentsForDate(date) {
  const dateString = date.toDateString()
  return assignments
    .filter((assignment) => {
      const dueDate = new Date(assignment.dueDate)
      return dueDate.toDateString() === dateString
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
}

function groupAssignmentsByDate(assignments) {
  const grouped = {}

  assignments.forEach((assignment) => {
    const dateKey = new Date(assignment.dueDate).toDateString()
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(assignment)
  })

  return grouped
}

function switchCalendarView(view) {
  calendarView = view

  // Update button states
  const monthViewBtn = document.getElementById("monthViewBtn")
  const listViewBtn = document.getElementById("listViewBtn")

  if (monthViewBtn && listViewBtn) {
    monthViewBtn.classList.toggle("active", view === "month")
    listViewBtn.classList.toggle("active", view === "list")
  }

  // Show/hide views
  const monthView = document.getElementById("monthView")
  const listView = document.getElementById("listView")

  if (monthView && listView) {
    monthView.classList.toggle("active", view === "month")
    listView.classList.toggle("active", view === "list")
  }

  updateCalendar()
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1)
  updateCalendar()
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1)
  updateCalendar()
}

function goToToday() {
  currentDate = new Date()
  updateCalendar()
}

function selectCalendarDay(dateString) {
  const date = new Date(dateString)
  const dayAssignments = getAssignmentsForDate(date)

  if (dayAssignments.length > 0) {
    showDayAssignments(date, dayAssignments)
  } else {
    // Option to add assignment for this day
    if (confirm(`No assignments due on ${formatDate(date)}. Would you like to add one?`)) {
      addAssignmentForDate(date)
    }
  }
}

function showDayAssignments(date, assignments) {
  const modal = createDayAssignmentsModal(date, assignments)
  document.body.appendChild(modal)
  modal.classList.add("active")
}

function createDayAssignmentsModal(date, assignments) {
  const modal = document.createElement("div")
  modal.className = "modal day-assignments-modal"
  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Assignments for ${formatDate(date)}</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="day-assignments-list">
                    ${assignments
                      .map((assignment) => {
                        const course = getCourseById(assignment.courseId)
                        const isOverdue = new Date(assignment.dueDate) < new Date() && assignment.status !== "completed"

                        return `
                            <div class="day-assignment-item ${isOverdue ? "overdue" : ""}">
                                <div class="assignment-color" style="background: ${course?.color || "#1e7e34"}"></div>
                                <div class="assignment-details">
                                    <h4>${assignment.title}</h4>
                                    <p>${course?.name || "Unknown Course"} - ${assignment.type}</p>
                                    <div class="assignment-time">
                                        Due: ${new Date(assignment.dueDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                                <div class="assignment-status">
                                    <span class="priority-badge priority-${assignment.priority}">${assignment.priority}</span>
                                    <span class="status-badge status-${assignment.status}">${assignment.status.replace("-", " ")}</span>
                                </div>
                            </div>
                        `
                      })
                      .join("")}
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="addAssignmentForDate(new Date('${date.toISOString()}'))">
                    <i class="fas fa-plus"></i> Add Assignment
                </button>
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
            </div>
        </div>
    `

  return modal
}

function addAssignmentForDate(date) {
  // Pre-fill the assignment form with the selected date
  const dueDateInput = document.getElementById("assignmentDueDate")
  if (dueDateInput) {
    // Format date for datetime-local input
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    dueDateInput.value = `${year}-${month}-${day}T23:59`
  }

  // Close day modal if open
  const dayModal = document.querySelector(".day-assignments-modal")
  if (dayModal) {
    dayModal.remove()
  }

  // Redirect to assignments page or show assignment modal
  if (window.location.pathname.includes("assignments.html")) {
    showModal("assignmentModal")
  } else {
    window.location.href = "assignments.html"
  }
}

function viewAssignmentDetails(assignmentId) {
  // Redirect to assignments page with the specific assignment
  window.location.href = `assignments.html?edit=${assignmentId}`
}

function getTimeUntilDue(dueDate) {
  const now = new Date()
  const timeDiff = dueDate - now

  if (timeDiff < 0) {
    const overdueDiff = Math.abs(timeDiff)
    const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24))
    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} overdue`
    } else {
      const hours = Math.floor(overdueDiff / (1000 * 60 * 60))
      return `${hours} hour${hours > 1 ? "s" : ""} overdue`
    }
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} left`
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} left`
  } else {
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    return `${minutes} minute${minutes > 1 ? "s" : ""} left`
  }
}
