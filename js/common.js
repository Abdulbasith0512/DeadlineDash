// DeadlineDASH - Common JavaScript Functions

// Global state management
let currentUser = null;
let assignments = [];
let courses = [];

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    setupCommonEventListeners();
    checkUserAuthentication();
    initializeDarkMode();
    initializeActiveSidebar();
});

// Load data from localStorage
function loadDataFromStorage() {
    const userData = localStorage.getItem('deadlineDashUser');
    const assignmentsData = localStorage.getItem('deadlineDashAssignments');
    const coursesData = localStorage.getItem('deadlineDashCourses');
    
    if (userData) {
        currentUser = JSON.parse(userData);
        console.log('👤 User loaded:', currentUser);
    }
    
    if (assignmentsData) {
        assignments = JSON.parse(assignmentsData);
    }
    
    if (coursesData) {
        courses = JSON.parse(coursesData);
    }
    
    // Debug authentication status
    const authToken = localStorage.getItem('authToken');
    console.log('🔐 Auth token:', authToken ? 'Present' : 'Missing');
    console.log('👤 Current user:', currentUser ? 'Present' : 'Missing');
}

// Save data to localStorage
function saveDataToStorage() {
    if (currentUser) {
        localStorage.setItem('deadlineDashUser', JSON.stringify(currentUser));
    }
    localStorage.setItem('deadlineDashAssignments', JSON.stringify(assignments));
    localStorage.setItem('deadlineDashCourses', JSON.stringify(courses));
}

// Check user authentication and redirect if needed
function checkUserAuthentication() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const authPages = ['index.html', 'login.html', 'register.html', 'verify-otp.html', 'profile-setup.html'];
    const appPages = ['dashboard.html', 'assignments.html', 'courses.html', 'calendar.html', 'statistics.html', 'profile.html', 'settings.html'];

    // Check if user is logged in (has user data and token)
    const authToken = localStorage.getItem('authToken');
    const isLoggedIn = currentUser && authToken;

    if (isLoggedIn && authPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
    } else if (!isLoggedIn && appPages.includes(currentPage)) {
        window.location.href = 'login.html';
    }

    if (isLoggedIn && appPages.includes(currentPage)) {
        loadUserData();
    }
}

// Load user data into UI elements
function loadUserData() {
    if (currentUser) {
        const headerUserName = document.getElementById('headerUserName');
        if (headerUserName) {
            headerUserName.textContent = `Welcome, ${currentUser.fullName || 'User'}!`;
        }
    }
}

// Setup common event listeners
function setupCommonEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }

        const userMenu = document.querySelector('.user-menu');
        const dropdown = document.getElementById('userDropdown');

        if (userMenu && dropdown && !userMenu.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    window.addEventListener('resize', handleResize);
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            const idField = form.querySelector('input[type="hidden"]');
            if (idField) {
                idField.value = '';
            }
        }
    }
}

// Sidebar functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function handleResize() {
    if (window.innerWidth > 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }
}

// Highlight current sidebar item
function initializeActiveSidebar() {
    const path = window.location.pathname.split("/").pop();
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(link => {
        if (link.getAttribute("href") === path) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// Authentication functions
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('deadlineDashUser');
        window.location.href = 'index.html';
    }
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
}

function formatDateTime(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    const darkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkMode);
}

function showAlert(message, type = 'info') {
    alert(message);
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'error');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function exportData() {
    const data = {
        user: currentUser,
        assignments: assignments,
        courses: courses,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deadline-dash-export.json';
    a.click();
    URL.revokeObjectURL(url);
}

function clearAllData() {
    if (confirm('This will delete all your data permanently. Are you sure?')) {
        if (confirm('This action cannot be undone. Continue?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

function setColor(color) {
    const colorInput = document.getElementById('courseColor');
    if (colorInput) {
        colorInput.value = color;
    }
}

function resendOTP() {
    showAlert('OTP resent! Use 123456 for demo.');
}

function loadSettings() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    }

    const emailReminders = document.getElementById('emailReminders');
    if (emailReminders) {
        emailReminders.checked = localStorage.getItem('emailReminders') !== 'false';
    }

    const reminderFrequency = document.getElementById('reminderFrequency');
    if (reminderFrequency) {
        reminderFrequency.value = localStorage.getItem('reminderFrequency') || 'daily';
    }
}

document.addEventListener('change', function(e) {
    if (e.target.id === 'emailReminders') {
        localStorage.setItem('emailReminders', e.target.checked);
    } else if (e.target.id === 'reminderFrequency') {
        localStorage.setItem('reminderFrequency', e.target.value);
    }
});

function getCourseById(id) {
    return courses.find(course => course.id === id);
}

function getAssignmentById(id) {
    return assignments.find(assignment => assignment.id === id);
}

function getAssignmentsByCourse(courseId) {
    return assignments.filter(assignment => assignment.courseId === courseId);
}

function getOverdueAssignments() {
    const now = new Date();
    return assignments.filter(assignment => new Date(assignment.dueDate) < now && assignment.status !== 'completed');
}

function getUpcomingAssignments(days = 7) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return assignments.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        return dueDate >= now && dueDate <= futureDate && assignment.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function getAssignmentStats() {
    return {
        total: assignments.length,
        completed: assignments.filter(a => a.status === 'completed').length,
        pending: assignments.filter(a => a.status === 'pending').length,
        inProgress: assignments.filter(a => a.status === 'in-progress').length,
        overdue: getOverdueAssignments().length
    };
}

function getCourseStats() {
    return courses.map(course => {
        const courseAssignments = getAssignmentsByCourse(course.id);
        const completed = courseAssignments.filter(a => a.status === 'completed').length;

        return {
            course: course,
            totalAssignments: courseAssignments.length,
            completedAssignments: completed,
            completionRate: courseAssignments.length > 0 ? Math.round((completed / courseAssignments.length) * 100) : 0
        };
    });
}

function initializeUIEnhancements() {
    // Add UI enhancements like animations, tooltips, etc. here
}

document.addEventListener('DOMContentLoaded', initializeUIEnhancements);
