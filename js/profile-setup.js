// DeadlineDASH - Profile Setup JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupProfileForm();
    loadTempUserData();
});

function setupProfileForm() {
    const profileSetupForm = document.getElementById('profileSetupForm');
    if (profileSetupForm) {
        profileSetupForm.addEventListener('submit', handleProfileSetup);
    }
}

function loadTempUserData() {
    // Check if user is coming from registration/OTP verification
    if (!currentUser) {
        const userData = localStorage.getItem('deadlineDashUser');
        if (userData) {
            currentUser = JSON.parse(userData);
        } else {
            // No user data found, redirect to registration
            showError('Please register first');
            setTimeout(() => {
                window.location.href = 'register.html';
            }, 2000);
            return;
        }
    }
    
    // Pre-fill form if user data exists
    if (currentUser) {
        const fullNameInput = document.getElementById('fullName');
        const studentIdInput = document.getElementById('studentId');
        const yearSelect = document.getElementById('yearOfStudy');
        const departmentSelect = document.getElementById('department');
        
        if (currentUser.fullName && fullNameInput) {
            fullNameInput.value = currentUser.fullName;
        }
        if (currentUser.studentId && studentIdInput) {
            studentIdInput.value = currentUser.studentId;
        }
        if (currentUser.yearOfStudy && yearSelect) {
            yearSelect.value = currentUser.yearOfStudy;
        }
        if (currentUser.department && departmentSelect) {
            departmentSelect.value = currentUser.department;
        }
    }
}

function handleProfileSetup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const studentId = document.getElementById('studentId').value.trim();
    const yearOfStudy = document.getElementById('yearOfStudy').value;
    const department = document.getElementById('department').value;
    
    // Validate inputs
    if (!fullName || !studentId || !yearOfStudy || !department) {
        showError('Please fill in all fields');
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
    
    // Update current user data
    if (currentUser) {
        currentUser.fullName = fullName;
        currentUser.studentId = studentId;
        currentUser.yearOfStudy = yearOfStudy;
        currentUser.department = department;
        currentUser.profileComplete = true;
        currentUser.profileCompletedDate = new Date().toISOString();
        
        // Save updated user data
        saveDataToStorage();
        
        showSuccess('Profile setup completed successfully!');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showError('User data not found. Please register again.');
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 2000);
    }
}

// Form validation helpers
function validateStudentId(studentId) {
    // Basic validation - can be enhanced based on institution requirements
    const pattern = /^[A-Za-z0-9]+$/;
    return pattern.test(studentId) && studentId.length >= 3;
}

function validateFullName(name) {
    // Basic name validation
    const pattern = /^[A-Za-z\s]+$/;
    return pattern.test(name) && name.trim().length >= 2;
}

// Real-time validation
document.addEventListener('input', function(e) {
    if (e.target.id === 'fullName') {
        const input = e.target;
        const isValid = validateFullName(input.value);
        
        if (input.value.length > 0) {
            if (isValid) {
                input.style.borderColor = 'var(--success-color)';
            } else {
                input.style.borderColor = 'var(--alert-color)';
            }
        } else {
            input.style.borderColor = '';
        }
    }
    
    if (e.target.id === 'studentId') {
        const input = e.target;
        const isValid = validateStudentId(input.value);
        
        if (input.value.length > 0) {
            if (isValid) {
                input.style.borderColor = 'var(--success-color)';
            } else {
                input.style.borderColor = 'var(--alert-color)';
            }
        } else {
            input.style.borderColor = '';
        }
    }
});
