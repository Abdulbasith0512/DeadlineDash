// DeadlineDASH - Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    updateDashboardStats();
    loadUpcomingDeadlines();
    loadRecentCourses();
    
    // Refresh data every 30 seconds
    setInterval(() => {
        updateDashboardStats();
        loadUpcomingDeadlines();
    }, 30000);
}

function updateDashboardStats() {
    const stats = getAssignmentStats();
    
    // Update stat cards
    const totalAssignmentsEl = document.getElementById('totalAssignments');
    const completedAssignmentsEl = document.getElementById('completedAssignments');
    const overdueAssignmentsEl = document.getElementById('overdueAssignments');
    const totalCoursesEl = document.getElementById('totalCourses');
    
    if (totalAssignmentsEl) totalAssignmentsEl.textContent = stats.total;
    if (completedAssignmentsEl) completedAssignmentsEl.textContent = stats.completed;
    if (overdueAssignmentsEl) overdueAssignmentsEl.textContent = stats.overdue;
    if (totalCoursesEl) totalCoursesEl.textContent = courses.length;
    
    // Add animation to stat cards
    animateStatCards();
}

function loadUpcomingDeadlines() {
    const upcomingAssignments = getUpcomingAssignments(7); // Next 7 days
    const container = document.getElementById('upcomingDeadlines');
    
    if (!container) return;
    
    if (upcomingAssignments.length === 0) {
        container.innerHTML = '<p class="empty-state">No upcoming deadlines in the next 7 days</p>';
        return;
    }
    
    container.innerHTML = upcomingAssignments.map(assignment => {
        const course = getCourseById(assignment.courseId);
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = dueDate < new Date();
        const timeUntilDue = getTimeUntilDue(dueDate);
        
        return `
            <div class="deadline-item" style="border-left: 3px solid ${course?.color || '#00D2D3'}">
                <div class="deadline-info">
                    <h4>${assignment.title}</h4>
                    <p>${course?.name || 'Unknown Course'} - ${assignment.type}</p>
                    <span class="deadline-date ${isOverdue ? 'overdue' : ''}">${formatDate(dueDate)}</span>
                    <small class="time-until-due">${timeUntilDue}</small>
                </div>
                <div class="deadline-actions">
                    <span class="priority-badge priority-${assignment.priority}">${assignment.priority}</span>
                    <span class="status-badge status-${assignment.status}">${assignment.status.replace('-', ' ')}</span>
                </div>
            </div>
        `;
    }).join('');
}

function loadRecentCourses() {
    const recentCourses = courses.slice(-3); // Last 3 courses
    const container = document.getElementById('recentCourses');
    
    if (!container) return;
    
    if (recentCourses.length === 0) {
        container.innerHTML = '<p class="empty-state">No courses added yet</p>';
        return;
    }
    
    container.innerHTML = recentCourses.map(course => {
        const courseAssignments = getAssignmentsByCourse(course.id);
        const completedCount = courseAssignments.filter(a => a.status === 'completed').length;
        const completionRate = courseAssignments.length > 0 ? 
            Math.round((completedCount / courseAssignments.length) * 100) : 0;
        
        return `
            <div class="course-item" style="border-left: 3px solid ${course.color}">
                <div class="course-info">
                    <h4>${course.name}</h4>
                    <p>${course.code} - ${course.semester}</p>
                    <div class="course-progress">
                        <small>${courseAssignments.length} assignments (${completionRate}% complete)</small>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completionRate}%; background: ${course.color}"></div>
                        </div>
                    </div>
                </div>
                <div class="course-badge" style="background: ${course.color}"></div>
            </div>
        `;
    }).join('');
}

function getTimeUntilDue(dueDate) {
    const now = new Date();
    const timeDiff = dueDate - now;
    
    if (timeDiff < 0) {
        return 'Overdue';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
    }
}

function animateStatCards() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'fadeIn 0.5s ease forwards';
        }, index * 100);
    });
}

// Quick actions from dashboard
function quickAddAssignment() {
    window.location.href = 'assignments.html';
}

function quickAddCourse() {
    window.location.href = 'courses.html';
}

function viewAllAssignments() {
    window.location.href = 'assignments.html';
}

function viewAllCourses() {
    window.location.href = 'courses.html';
}

// Dashboard notifications
function checkForImportantNotifications() {
    const overdueAssignments = getOverdueAssignments();
    const urgentAssignments = getUpcomingAssignments(1); // Due within 24 hours
    
    if (overdueAssignments.length > 0) {
        showNotification(`You have ${overdueAssignments.length} overdue assignment${overdueAssignments.length > 1 ? 's' : ''}`, 'warning');
    }
    
    if (urgentAssignments.length > 0) {
        showNotification(`${urgentAssignments.length} assignment${urgentAssignments.length > 1 ? 's' : ''} due within 24 hours`, 'info');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize notifications check
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkForImportantNotifications, 2000);
});

// Add progress bar styles dynamically
const progressBarStyles = `
    .course-progress {
        margin-top: 8px;
    }
    
    .progress-bar {
        width: 100%;
        height: 4px;
        background: var(--card-background);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 4px;
    }
    
    .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
    }
    
    .notification {
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--white);
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px var(--shadow);
        padding: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    }
    
    .notification-warning {
        border-left: 4px solid var(--alert-color);
    }
    
    .notification-info {
        border-left: 4px solid var(--accent-color);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--spacing-xs);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = progressBarStyles;
document.head.appendChild(styleSheet);
