// DeadlineDASH - Forgot Password JavaScript

document.addEventListener('DOMContentLoaded', function() {
    setupForgotPasswordForms();
    setupOTPInputs();
});

function setupForgotPasswordForms() {
    const phoneForm = document.getElementById('phoneForm');
    const otpForm = document.getElementById('otpForm');
    const passwordForm = document.getElementById('passwordForm');

    if (phoneForm) {
        phoneForm.addEventListener('submit', handlePhoneSubmit);
    }

    if (otpForm) {
        otpForm.addEventListener('submit', handleOTPVerification);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordReset);
    }
}

async function handlePhoneSubmit(e) {
    e.preventDefault();
    
    const phoneNumber = document.getElementById('resetPhone').value.trim();
    
    if (!phoneNumber) {
        showError('Please enter your phone number');
        return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
        showError('Please enter a valid phone number with country code');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store phone number for next step
            localStorage.setItem('resetPhoneNumber', phoneNumber);
            
            showSuccess('Reset code sent! Check your SMS.');
            
            // Show OTP form
            document.getElementById('phoneForm').style.display = 'none';
            document.getElementById('otpForm').style.display = 'block';
            
            // Focus first OTP input
            const firstOtpInput = document.querySelector('.otp-input');
            if (firstOtpInput) {
                firstOtpInput.focus();
            }
        } else {
            showError(data.message || 'Failed to send reset code');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
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
    
    const phoneNumber = localStorage.getItem('resetPhoneNumber');
    if (!phoneNumber) {
        showError('Phone number not found. Please start over.');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Verifying...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/verify-reset-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                otp: otp
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('Code verified! Enter your new password.');
            
            // Show password form
            document.getElementById('otpForm').style.display = 'none';
            document.getElementById('passwordForm').style.display = 'block';
            
            // Focus password input
            const passwordInput = document.getElementById('newPassword');
            if (passwordInput) {
                passwordInput.focus();
            }
        } else {
            showError(data.message || 'Invalid code. Please try again.');
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

async function handlePasswordReset(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!validatePassword(newPassword)) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    const phoneNumber = localStorage.getItem('resetPhoneNumber');
    if (!phoneNumber) {
        showError('Phone number not found. Please start over.');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Resetting...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                newPassword: newPassword
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear stored phone number
            localStorage.removeItem('resetPhoneNumber');
            
            showSuccess('Password reset successfully! You can now login.');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showError(data.message || 'Failed to reset password');
        }
    } catch (error) {
        console.error('Password reset error:', error);
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

function validatePhoneNumber(phoneNumber) {
    // Basic phone number validation with country code
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
}

function validatePassword(password) {
    return password.length >= 6;
} 