// DeadlineDASH - Settings JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    setupSettingsHandlers();
});

function initializeSettings() {
    loadSettings();
    setupNotificationSettings();
    setupDataManagement();
}

function setupSettingsHandlers() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
    }
    
    // Email reminders toggle
    const emailReminders = document.getElementById('emailReminders');
    if (emailReminders) {
        emailReminders.addEventListener('change', function() {
            localStorage.setItem('emailReminders', this.checked);
            showSuccess('Email reminder settings updated!');
        });
    }
    
    // Reminder frequency
    const reminderFrequency = document.getElementById('reminderFrequency');
    if (reminderFrequency) {
        reminderFrequency.addEventListener('change', function() {
            localStorage.setItem('reminderFrequency', this.value);
            showSuccess('Reminder frequency updated!');
        });
    }
}

function loadSettings() {
    // Load dark mode setting
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
    }
    
    // Load email reminders setting
    const emailReminders = document.getElementById('emailReminders');
    if (emailReminders) {
        emailReminders.checked = localStorage.getItem('emailReminders') !== 'false';
    }
    
    // Load reminder frequency
    const reminderFrequency = document.getElementById('reminderFrequency');
    if (reminderFrequency) {
        reminderFrequency.value = localStorage.getItem('reminderFrequency') || 'daily';
    }
    
    // Load other settings
    loadAdvancedSettings();
}

function setupNotificationSettings() {
    // Add notification settings section
    const settingsContainer = document.querySelector('.settings-container');
    if (!settingsContainer) return;
    
    // Check if notification settings already exist
    let notificationCard = document.getElementById('notificationSettings');
    if (notificationCard) return;
    
    notificationCard = document.createElement('div');
    notificationCard.id = 'notificationSettings';
    notificationCard.className = 'settings-card';
    notificationCard.innerHTML = `
        <h3>Advanced Notifications</h3>
        <div class="setting-item">
            <label class="setting-label">
                <span>Desktop Notifications</span>
                <div class="toggle-switch">
                    <input type="checkbox" id="desktopNotifications" onchange="toggleDesktopNotifications()">
                    <span class="slider"></span>
                </div>
            </label>
        </div>
        <div class="setting-item">
            <label class="setting-label">
                <span>Sound Notifications</span>
                <div class="toggle-switch">
                    <input type="checkbox" id="soundNotifications" onchange="toggleSoundNotifications()">
                    <span class="slider"></span>
                </div>
            </label>
        </div>
        <div class="setting-item">
            <label for="notificationTime">Daily Reminder Time</label>
            <input type="time" id="notificationTime" value="09:00" onchange="updateNotificationTime()">
        </div>
        <div class="setting-item">
            <label for="reminderDays">Remind me before deadline</label>
            <select id="reminderDays" onchange="updateReminderDays()">
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="7">1 week</option>
            </select>
        </div>
    `;
    
    // Insert after the existing notifications card
    const existingNotificationCard = settingsContainer.children[1];
    if (existingNotificationCard) {
        settingsContainer.insertBefore(notificationCard, existingNotificationCard.nextSibling);
    } else {
        settingsContainer.appendChild(notificationCard);
    }
    
    // Load notification settings
    loadNotificationSettings();
}

function setupDataManagement() {
    // Add advanced data management options
    const dataCard = document.querySelector('.settings-card:last-child');
    if (!dataCard) return;
    
    // Add import data button
    const importBtn = document.createElement('button');
    importBtn.className = 'btn-secondary';
    importBtn.innerHTML = '<i class="fas fa-upload"></i> Import Data';
    importBtn.onclick = importData;
    
    // Add backup settings
    const backupSection = document.createElement('div');
    backupSection.className = 'backup-section';
    backupSection.innerHTML = `
        <h4>Automatic Backup</h4>
        <div class="setting-item">
            <label class="setting-label">
                <span>Auto Backup</span>
                <div class="toggle-switch">
                    <input type="checkbox" id="autoBackup" onchange="toggleAutoBackup()">
                    <span class="slider"></span>
                </div>
            </label>
        </div>
        <div class="setting-item">
            <label for="backupFrequency">Backup Frequency</label>
            <select id="backupFrequency" onchange="updateBackupFrequency()">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>
        </div>
        <div class="backup-info">
            <small>Last backup: <span id="lastBackup">Never</span></small>
        </div>
    `;
    
    dataCard.insertBefore(importBtn, dataCard.lastElementChild);
    dataCard.insertBefore(backupSection, dataCard.lastElementChild);
    
    loadBackupSettings();
}

function loadAdvancedSettings() {
    // Load theme preference
    const theme = localStorage.getItem('theme') || 'system';
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = theme;
    }
    
    // Load language preference
    const language = localStorage.getItem('language') || 'en';
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = language;
    }
    
    // Load timezone
    const timezone = localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneSelect = document.getElementById('timezoneSelect');
    if (timezoneSelect) {
        timezoneSelect.value = timezone;
    }
}

function loadNotificationSettings() {
    const desktopNotifications = document.getElementById('desktopNotifications');
    const soundNotifications = document.getElementById('soundNotifications');
    const notificationTime = document.getElementById('notificationTime');
    const reminderDays = document.getElementById('reminderDays');
    
    if (desktopNotifications) {
        desktopNotifications.checked = localStorage.getItem('desktopNotifications') === 'true';
    }
    
    if (soundNotifications) {
        soundNotifications.checked = localStorage.getItem('soundNotifications') === 'true';
    }
    
    if (notificationTime) {
        notificationTime.value = localStorage.getItem('notificationTime') || '09:00';
    }
    
    if (reminderDays) {
        reminderDays.value = localStorage.getItem('reminderDays') || '1';
    }
}

function loadBackupSettings() {
    const autoBackup = document.getElementById('autoBackup');
    const backupFrequency = document.getElementById('backupFrequency');
    const lastBackup = document.getElementById('lastBackup');
    
    if (autoBackup) {
        autoBackup.checked = localStorage.getItem('autoBackup') === 'true';
    }
    
    if (backupFrequency) {
        backupFrequency.value = localStorage.getItem('backupFrequency') || 'weekly';
    }
    
    if (lastBackup) {
        const lastBackupDate = localStorage.getItem('lastBackupDate');
        if (lastBackupDate) {
            lastBackup.textContent = formatDate(new Date(lastBackupDate));
        }
    }
}

function toggleDarkMode() {
    const darkMode = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
    showSuccess(`${darkMode ? 'Dark' : 'Light'} mode enabled!`);
}

function toggleDesktopNotifications() {
    const enabled = document.getElementById('desktopNotifications').checked;
    
    if (enabled && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                localStorage.setItem('desktopNotifications', 'true');
                showSuccess('Desktop notifications enabled!');
                
                // Show test notification
                new Notification('DeadlineDASH', {
                    body: 'Desktop notifications are now enabled!',
                    icon: '/favicon.ico'
                });
            } else {
                document.getElementById('desktopNotifications').checked = false;
                showError('Desktop notification permission denied');
            }
        });
    } else {
        localStorage.setItem('desktopNotifications', 'false');
        showSuccess('Desktop notifications disabled!');
    }
}

function toggleSoundNotifications() {
    const enabled = document.getElementById('soundNotifications').checked;
    localStorage.setItem('soundNotifications', enabled);
    
    if (enabled) {
        // Play test sound
        playNotificationSound();
        showSuccess('Sound notifications enabled!');
    } else {
        showSuccess('Sound notifications disabled!');
    }
}

function updateNotificationTime() {
    const time = document.getElementById('notificationTime').value;
    localStorage.setItem('notificationTime', time);
    showSuccess(`Daily reminders will be sent at ${time}`);
}

function updateReminderDays() {
    const days = document.getElementById('reminderDays').value;
    localStorage.setItem('reminderDays', days);
    showSuccess(`You'll be reminded ${days} day${days > 1 ? 's' : ''} before deadlines`);
}

function toggleAutoBackup() {
    const enabled = document.getElementById('autoBackup').checked;
    localStorage.setItem('autoBackup', enabled);
    
    if (enabled) {
        scheduleAutoBackup();
        showSuccess('Automatic backup enabled!');
    } else {
        showSuccess('Automatic backup disabled!');
    }
}

function updateBackupFrequency() {
    const frequency = document.getElementById('backupFrequency').value;
    localStorage.setItem('backupFrequency', frequency);
    showSuccess(`Backup frequency set to ${frequency}`);
    
    if (localStorage.getItem('autoBackup') === 'true') {
        scheduleAutoBackup();
    }
}

function scheduleAutoBackup() {
    // In a real app, this would schedule server-side backups
    // For demo, we'll just show a message
    const frequency = localStorage.getItem('backupFrequency') || 'weekly';
    console.log(`Auto backup scheduled: ${frequency}`);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (data.user && data.assignments && data.courses) {
                        if (confirm('This will replace all your current data. Continue?')) {
                            // Import data
                            currentUser = data.user;
                            assignments = data.assignments || [];
                            courses = data.courses || [];
                            
                            saveDataToStorage();
                            showSuccess('Data imported successfully!');
                            
                            // Refresh page to show imported data
                            setTimeout(() => {
                                location.reload();
                            }, 2000);
                        }
                    } else {
                        showError('Invalid data format');
                    }
                } catch (error) {
                    showError('Error reading file: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function resetSettings() {
    if (confirm('Reset all settings to default values?')) {
        // Remove settings from localStorage
        const settingsKeys = [
            'darkMode', 'emailReminders', 'reminderFrequency',
            'desktopNotifications', 'soundNotifications', 'notificationTime',
            'reminderDays', 'autoBackup', 'backupFrequency', 'theme', 'language'
        ];
        
        settingsKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        showSuccess('Settings reset to defaults!');
        
        // Reload page to apply defaults
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
}

function playNotificationSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Notification system
function checkAndSendNotifications() {
    if (localStorage.getItem('desktopNotifications') !== 'true') return;
    
    const reminderDays = parseInt(localStorage.getItem('reminderDays') || '1');
    const upcomingAssignments = getUpcomingAssignments(reminderDays);
    
    upcomingAssignments.forEach(assignment => {
        const course = getCourseById(assignment.courseId);
        const dueDate = new Date(assignment.dueDate);
        const timeUntilDue = getTimeUntilDue(dueDate);
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Assignment Due Soon: ${assignment.title}`, {
                body: `${course?.name || 'Unknown Course'} - ${timeUntilDue}`,
                icon: '/favicon.ico',
                tag: assignment.id // Prevent duplicate notifications
            });
        }
        
        if (localStorage.getItem('soundNotifications') === 'true') {
            playNotificationSound();
        }
    });
}

// Check for notifications every 30 minutes
setInterval(checkAndSendNotifications, 30 * 60 * 1000);

// Add settings-specific styles
const settingsStyles = `
    .backup-section {
        margin-top: var(--spacing-lg);
        padding-top: var(--spacing-lg);
        border-top: 1px solid var(--border-light);
    }
    
    .backup-section h4 {
        margin-bottom: var(--spacing-md);
        color: var(--primary-color);
        font-size: 1rem;
    }
    
    .backup-info {
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: var(--card-background);
        border-radius: var(--radius-sm);
    }
    
    .backup-info small {
        color: var(--text-muted);
    }
    
    .settings-card .btn-secondary {
        margin-bottom: var(--spacing-md);
    }
    
    .notification-test {
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: rgba(0, 210, 211, 0.1);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        color: var(--accent-color);
    }
    
    .reset-section {
        margin-top: var(--spacing-xl);
        padding-top: var(--spacing-lg);
        border-top: 2px solid var(--border-light);
        text-align: center;
    }
    
    .reset-section h3 {
        color: var(--alert-color);
        margin-bottom: var(--spacing-md);
    }
    
    .reset-section p {
        color: var(--text-muted);
        margin-bottom: var(--spacing-lg);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = settingsStyles;
document.head.appendChild(styleSheet);

// Add reset section
document.addEventListener('DOMContentLoaded', function() {
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer) {
        const resetSection = document.createElement('div');
        resetSection.className = 'settings-card reset-section';
        resetSection.innerHTML = `
            <h3>Reset Settings</h3>
            <p>Reset all settings to their default values. This will not affect your assignments or courses.</p>
            <button class="btn-alert" onclick="resetSettings()">
                <i class="fas fa-undo"></i> Reset All Settings
            </button>
        `;
        
        settingsContainer.appendChild(resetSection);
    }
});

// Initialize notification checking on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check notifications after a short delay
    setTimeout(checkAndSendNotifications, 5000);
});
