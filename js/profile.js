// DeadlineDASH - Profile JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    setupProfileForm();
});

function initializeProfile() {
    loadProfile();
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Setup real-time validation
    setupProfileValidation();
}

function loadProfile() {
    if (!currentUser) {
        showError('User data not found');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Populate form fields
    const fields = {
        'profileFullName': currentUser.fullName || '',
        'profileStudentId': currentUser.studentId || '',
        'profileEmail': currentUser.email || '',
        'profileYear': currentUser.yearOfStudy || '',
        'profileDepartment': currentUser.department || ''
    };
    
    Object.keys(fields).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = fields[fieldId];
        }
    });
    
    // Update profile stats
    updateProfileStats();
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('profileFullName').value.trim();
    const studentId = document.getElementById('profileStudentId').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const yearOfStudy = document.getElementById('profileYear').value;
    const department = document.getElementById('profileDepartment').value;
    
    // Validate inputs
    if (!fullName || !studentId || !email || !yearOfStudy || !department) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (fullName.length < 2) {
        showError('Full name must be at least 2 characters long');
        return;
    }
    
    if (studentId.length < 3) {
        showError('Student ID must be at least 3 characters long');
        return;
    }
    
    // Check if email is already used by another user (if changed)
    if (email !== currentUser.email) {
        // In a real app, this would check against a database
        // For demo purposes, we'll just warn about email changes
        if (!confirm('Changing your email address may require re-verification. Continue?')) {
            return;
        }
    }
    
    // Update user data
    const oldEmail = currentUser.email;
    currentUser.fullName = fullName;
    currentUser.studentId = studentId;
    currentUser.email = email;
    currentUser.yearOfStudy = yearOfStudy;
    currentUser.department = department;
    currentUser.profileUpdatedAt = new Date().toISOString();
    
    // If email changed, mark as unverified
    if (email !== oldEmail) {
        currentUser.verified = false;
        currentUser.emailChangeDate = new Date().toISOString();
    }
    
    saveDataToStorage();
    loadUserData(); // Update header
    showSuccess('Profile updated successfully!');
    
    // Show email verification notice if email was changed
    if (email !== oldEmail) {
        setTimeout(() => {
            showAlert('Email verification required. Please check your new email for verification instructions.', 'warning');
        }, 2000);
    }
}

function updateProfileStats() {
    // Add profile statistics section
    const profileContainer = document.querySelector('.profile-container');
    if (!profileContainer) return;
    
    // Check if stats section already exists
    let statsSection = document.getElementById('profileStats');
    if (!statsSection) {
        statsSection = document.createElement('div');
        statsSection.id = 'profileStats';
        statsSection.className = 'profile-stats';
        profileContainer.appendChild(statsSection);
    }
    
    const stats = getAssignmentStats();
    const joinDate = currentUser.registrationDate ? new Date(currentUser.registrationDate) : new Date();
    const daysSinceJoin = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
    
    statsSection.innerHTML = `
        <h3>Your Statistics</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-calendar-plus"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-value">${daysSinceJoin}</span>
                    <span class="stat-label">Days Active</span>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-tasks"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-value">${stats.total}</span>
                    <span class="stat-label">Total Assignments</span>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-value">${stats.completed}</span>
                    <span class="stat-label">Completed</span>
                </div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-value">${courses.length}</span>
                    <span class="stat-label">Courses</span>
                </div>
            </div>
        </div>
        <div class="achievement-section">
            <h4>Achievements</h4>
            <div class="achievements">
                ${generateAchievements().map(achievement => `
                    <div class="achievement ${achievement.earned ? 'earned' : 'locked'}">
                        <i class="fas fa-${achievement.icon}"></i>
                        <div class="achievement-info">
                            <span class="achievement-name">${achievement.name}</span>
                            <span class="achievement-desc">${achievement.description}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateAchievements() {
    const stats = getAssignmentStats();
    
    return [
        {
            name: 'First Steps',
            description: 'Complete your first assignment',
            icon: 'baby',
            earned: stats.completed >= 1
        },
        {
            name: 'Getting Started',
            description: 'Complete 5 assignments',
            icon: 'walking',
            earned: stats.completed >= 5
        },
        {
            name: 'Productive',
            description: 'Complete 10 assignments',
            icon: 'running',
            earned: stats.completed >= 10
        },
        {
            name: 'Course Master',
            description: 'Add 5 courses',
            icon: 'graduation-cap',
            earned: courses.length >= 5
        },
        {
            name: 'Organized',
            description: 'Have no overdue assignments',
            icon: 'check-double',
            earned: stats.overdue === 0 && stats.total > 0
        },
        {
            name: 'Perfectionist',
            description: '100% completion rate with 10+ assignments',
            icon: 'trophy',
            earned: stats.total >= 10 && stats.completed === stats.total
        }
    ];
}

function setupProfileValidation() {
    // Real-time validation for form fields
    const fields = [
        { id: 'profileFullName', validator: validateFullName },
        { id: 'profileStudentId', validator: validateStudentId },
        { id: 'profileEmail', validator: validateEmail }
    ];
    
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            input.addEventListener('input', function(e) {
                validateField(e.target, field.validator);
            });
            
            input.addEventListener('blur', function(e) {
                validateField(e.target, field.validator);
            });
        }
    });
}

function validateField(input, validator) {
    const isValid = validator(input.value);
    
    if (input.value.length > 0) {
        if (isValid) {
            input.style.borderColor = 'var(--success-color)';
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.style.borderColor = 'var(--alert-color)';
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
    } else {
        input.style.borderColor = '';
        input.classList.remove('valid', 'invalid');
    }
}

function validateFullName(name) {
    const pattern = /^[A-Za-z\s]+$/;
    return pattern.test(name) && name.trim().length >= 2;
}

function validateStudentId(studentId) {
    const pattern = /^[A-Za-z0-9]+$/;
    return pattern.test(studentId) && studentId.length >= 3;
}

// Profile picture upload (placeholder functionality)
function uploadProfilePicture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // In a real app, this would upload to a server
            showSuccess('Profile picture uploaded! (Demo mode - not actually saved)');
            
            // Preview the image
            const reader = new FileReader();
            reader.onload = function(e) {
                const avatar = document.querySelector('.profile-avatar');
                if (avatar) {
                    avatar.innerHTML = `<img src="${e.target.result}" alt="Profile Picture" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// Change password functionality
function changePassword() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;
    
    if (currentPassword !== currentUser.password) {
        showError('Current password is incorrect');
        return;
    }
    
    const newPassword = prompt('Enter your new password (minimum 6 characters):');
    if (!newPassword) return;
    
    if (!validatePassword(newPassword)) {
        showError('New password must be at least 6 characters long');
        return;
    }
    
    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    currentUser.password = newPassword;
    currentUser.passwordChangedAt = new Date().toISOString();
    saveDataToStorage();
    
    showSuccess('Password changed successfully!');
}

// Delete account functionality
function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }
    
    if (!confirm('This will permanently delete all your data including assignments, courses, and settings. Continue?')) {
        return;
    }
    
    const password = prompt('Enter your password to confirm account deletion:');
    if (password !== currentUser.password) {
        showError('Password incorrect. Account deletion cancelled.');
        return;
    }
    
    // Clear all data
    localStorage.clear();
    showSuccess('Account deleted successfully. You will be redirected to the home page.');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Add profile-specific styles
const profileStyles = `
    .profile-stats {
        margin-top: var(--spacing-xl);
        background: var(--white);
        padding: var(--spacing-lg);
        border-radius: var(--radius-lg);
        box-shadow: 0 2px 4px var(--shadow);
    }
    
    .profile-stats h3 {
        margin-bottom: var(--spacing-md);
        color: var(--primary-color);
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-xl);
    }
    
    .profile-stats .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--card-background);
        border-radius: var(--radius-md);
    }
    
    .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--accent-color);
        color: var(--white);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
    }
    
    .stat-info {
        display: flex;
        flex-direction: column;
    }
    
    .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-dark);
    }
    
    .stat-label {
        font-size: 0.875rem;
        color: var(--text-muted);
    }
    
    .achievement-section {
        border-top: 1px solid var(--border-light);
        padding-top: var(--spacing-lg);
    }
    
    .achievement-section h4 {
        margin-bottom: var(--spacing-md);
        color: var(--primary-color);
    }
    
    .achievements {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-sm);
    }
    
    .achievement {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--radius-md);
        transition: all var(--transition-fast);
    }
    
    .achievement.earned {
        background: rgba(46, 213, 115, 0.1);
        border: 1px solid var(--success-color);
    }
    
    .achievement.locked {
        background: var(--card-background);
        opacity: 0.6;
    }
    
    .achievement i {
        font-size: 1.5rem;
        color: var(--success-color);
    }
    
    .achievement.locked i {
        color: var(--text-muted);
    }
    
    .achievement-info {
        display: flex;
        flex-direction: column;
    }
    
    .achievement-name {
        font-weight: 600;
        color: var(--text-dark);
        font-size: 0.875rem;
    }
    
    .achievement-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .profile-avatar {
        cursor: pointer;
        transition: transform var(--transition-fast);
    }
    
    .profile-avatar:hover {
        transform: scale(1.05);
    }
    
    .form-group input.valid {
        border-color: var(--success-color);
    }
    
    .form-group input.invalid {
        border-color: var(--alert-color);
    }
    
    .profile-actions {
        margin-top: var(--spacing-lg);
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
    }
    
    .btn-outline {
        background: transparent;
        border: 1px solid var(--border-light);
        color: var(--text-dark);
    }
    
    .btn-outline:hover {
        background: var(--card-background);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = profileStyles;
document.head.appendChild(styleSheet);

// Add profile actions
document.addEventListener('DOMContentLoaded', function() {
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        // Make profile avatar clickable
        const avatar = document.querySelector('.profile-avatar');
        if (avatar) {
            avatar.onclick = uploadProfilePicture;
            avatar.title = 'Click to upload profile picture';
        }
        
        // Add action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'profile-actions';
        actionsDiv.innerHTML = `
            <button class="btn-secondary btn-outline" onclick="changePassword()">
                <i class="fas fa-key"></i> Change Password
            </button>
            <button class="btn-alert btn-outline" onclick="deleteAccount()">
                <i class="fas fa-trash"></i> Delete Account
            </button>
        `;
        
        profileCard.appendChild(actionsDiv);
    }
});
