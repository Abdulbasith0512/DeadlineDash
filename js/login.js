// DeadlineDASH - Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Check if user exists in localStorage
    const userData = localStorage.getItem('deadlineDashUser');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.email === email && user.password === password) {
            currentUser = user;
            
            // Check if profile is complete
            if (user.profileComplete) {
                showSuccess('Login successful!');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Redirect to profile setup
                setTimeout(() => {
                    window.location.href = 'profile-setup.html';
                }, 1000);
            }
        } else {
            showError('Invalid email or password');
        }
    } else {
        showError('User not found. Please register first.');
    }
}

// Handle remember me functionality
document.addEventListener('change', function(e) {
    if (e.target.id === 'rememberMe') {
        const email = document.getElementById('loginEmail').value;
        if (e.target.checked && email) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    }
});

// Load remembered email on page load
document.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');
        
        if (emailInput && rememberCheckbox) {
            emailInput.value = rememberedEmail;
            rememberCheckbox.checked = true;
        }
    }
});
