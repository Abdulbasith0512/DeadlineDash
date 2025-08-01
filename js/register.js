// DeadlineDASH - Registration and OTP JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupRegistrationForm();
    setupOTPForm();
    setupOTPInputs();
});

function setupRegistrationForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

function setupOTPForm() {
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
        otpForm.addEventListener('submit', handleOTPVerification);
    }
}

async function handleRegistration(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('registerFullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phoneNumber = document.getElementById('registerPhone').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate inputs
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
        showError('Please enter a valid phone number with country code (e.g., +919876543210)');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending OTP...';
    submitBtn.disabled = true;
    
    try {
        // Send OTP via SMS
        const response = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                fullName: fullName
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store temporary user data
            const tempUser = {
                fullName: fullName,
                email: email,
                phoneNumber: phoneNumber,
                password: password,
                verified: false
            };
            
            localStorage.setItem('tempUser', JSON.stringify(tempUser));
            
            // Show OTP on screen for development
            const otpMessage = 'OTP sent! Check server console for the code.';
            showSuccess(otpMessage);
            
            // Redirect to OTP verification page
            setTimeout(() => {
                window.location.href = 'verify-otp.html';
            }, 1500);
        } else {
            showError(data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Network error. Please try again.');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleOTPVerification(e) {
    e.preventDefault();
    
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    
    if (otp.length !== 6) {
        showError('Please enter all 6 digits');
        return;
    }
    
    const tempUser = JSON.parse(localStorage.getItem('tempUser'));
    if (!tempUser) {
        showError('Registration data not found. Please register again.');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled = true;
    
    try {
        // Verify OTP and register user
        const response = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: tempUser.phoneNumber,
                otp: otp,
                password: tempUser.password,
                fullName: tempUser.fullName,
                email: tempUser.email
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Save user data and token
            localStorage.setItem('deadlineDashUser', JSON.stringify(data.data.user));
            localStorage.setItem('authToken', data.data.token);
            localStorage.removeItem('tempUser');
            
            // Update global user state
            currentUser = data.data.user;
            
            console.log('✅ Registration successful!');
            console.log('👤 User data saved:', data.data.user);
            console.log('🔐 Token saved:', data.data.token ? 'Present' : 'Missing');
            
            showSuccess('Registration successful! Welcome to DeadlineDASH!');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showError(data.message || 'Invalid OTP. Please try again.');
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        showError('Network error. Please try again.');
    } finally {
        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Move to next input if current is filled
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Move to previous input on backspace if current is empty
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
        
        // Only allow numbers
        input.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });
}

// Load phone number in OTP page if coming from registration
document.addEventListener('DOMContentLoaded', function() {
    const otpPhoneSpan = document.getElementById('otpPhone');
    if (otpPhoneSpan) {
        const tempUser = localStorage.getItem('tempUser');
        if (tempUser) {
            const user = JSON.parse(tempUser);
            otpPhoneSpan.textContent = user.phoneNumber;
        }
    }
});

async function resendOTP() {
    const tempUser = JSON.parse(localStorage.getItem('tempUser'));
    if (!tempUser) {
        showError('Registration data not found. Please register again.');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/resend-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: tempUser.phoneNumber,
                fullName: tempUser.fullName
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('OTP resent! Check your SMS.');
            
            // Clear current OTP inputs
            const otpInputs = document.querySelectorAll('.otp-input');
            otpInputs.forEach(input => {
                input.value = '';
            });
            
            // Focus first input
            if (otpInputs.length > 0) {
                otpInputs[0].focus();
            }
        } else {
            showError(data.message || 'Failed to resend OTP');
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        showError('Network error. Please try again.');
    }
}

function validatePhoneNumber(phoneNumber) {
    // Basic phone number validation with country code
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
}
