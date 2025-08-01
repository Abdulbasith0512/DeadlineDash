// DeadlineDASH - Statistics JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeStatistics();
});

function initializeStatistics() {
    updateAssignmentChart();
    updateCourseChart();
    updateDetailedStats();
    
    // Refresh statistics every 60 seconds
    setInterval(() => {
        updateAssignmentChart();
        updateCourseChart();
        updateDetailedStats();
    }, 60000);
}

function updateAssignmentChart() {
    const canvas = document.getElementById('assignmentChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const stats = getAssignmentStats();
    const total = stats.total;
    
    if (total === 0) {
        drawEmptyChart(ctx, canvas, 'No assignments data available');
        return;
    }
    
    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    let currentAngle = -Math.PI / 2;
    
    // Define colors and data
    const chartData = [
        { label: 'Completed', value: stats.completed, color: '#2ED573' },
        { label: 'In Progress', value: stats.inProgress, color: '#00D2D3' },
        { label: 'Pending', value: stats.pending, color: '#F39C12' },
        { label: 'Overdue', value: stats.overdue, color: '#FF4757' }
    ];
    
    // Draw slices
    chartData.forEach(item => {
        if (item.value > 0) {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = item.color;
            ctx.fill();
            
            // Add slice border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            currentAngle += sliceAngle;
        }
    });
    
    // Draw center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Add total count in center
    ctx.fillStyle = '#2F3542';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(total.toString(), centerX, centerY - 5);
    ctx.font = '12px Arial';
    ctx.fillText('Total', centerX, centerY + 15);
    
    // Draw legend
    drawChartLegend(ctx, canvas, chartData, 'bottom');
}

function updateCourseChart() {
    const canvas = document.getElementById('courseChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (courses.length === 0) {
        drawEmptyChart(ctx, canvas, 'No courses available');
        return;
    }
    
    // Prepare data for bar chart
    const courseData = courses.map(course => {
        const courseAssignments = getAssignmentsByCourse(course.id);
        return {
            name: course.code,
            fullName: course.name,
            count: courseAssignments.length,
            color: course.color,
            completed: courseAssignments.filter(a => a.status === 'completed').length
        };
    });
    
    // Draw bar chart
    const maxCount = Math.max(...courseData.map(c => c.count), 1);
    const barWidth = (canvas.width - 80) / courseData.length;
    const maxBarHeight = canvas.height - 100;
    
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    courseData.forEach((course, index) => {
        const x = 40 + index * barWidth;
        const barHeight = (course.count / maxCount) * maxBarHeight;
        const y = canvas.height - 60 - barHeight;
        
        // Draw total assignments bar
        ctx.fillStyle = course.color + '40'; // Semi-transparent
        ctx.fillRect(x, y, barWidth - 10, barHeight);
        
        // Draw completed assignments bar
        const completedHeight = (course.completed / maxCount) * maxBarHeight;
        const completedY = canvas.height - 60 - completedHeight;
        ctx.fillStyle = course.color;
        ctx.fillRect(x, completedY, barWidth - 10, completedHeight);
        
        // Draw course code
        ctx.fillStyle = '#2F3542';
        ctx.fillText(course.name, x + (barWidth - 10) / 2, canvas.height - 40);
        
        // Draw count
        ctx.fillText(course.count.toString(), x + (barWidth - 10) / 2, y - 5);
        
        // Draw completed count
        if (course.completed > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(course.completed.toString(), x + (barWidth - 10) / 2, completedY + 15);
        }
    });
    
    // Draw title
    ctx.fillStyle = '#2F3542';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Assignments per Course', canvas.width / 2, 20);
}

function updateDetailedStats() {
    updateAssignmentBreakdown();
    updateCoursePerformance();
    updateProductivityStats();
}

function updateAssignmentBreakdown() {
    const container = document.getElementById('assignmentBreakdown');
    if (!container) return;
    
    const stats = getAssignmentStats();
    const statusData = [
        { label: 'Completed', count: stats.completed, color: '#2ED573' },
        { label: 'In Progress', count: stats.inProgress, color: '#00D2D3' },
        { label: 'Pending', count: stats.pending, color: '#F39C12' },
        { label: 'Overdue', count: stats.overdue, color: '#FF4757' }
    ];
    
    container.innerHTML = statusData.map(item => `
        <div class="stat-item">
            <div class="stat-label">
                <div class="stat-color" style="background: ${item.color}"></div>
                <span>${item.label}</span>
            </div>
            <div class="stat-value">
                <span class="count">${item.count}</span>
                <span class="percentage">${stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0}%</span>
            </div>
        </div>
    `).join('');
}

function updateCoursePerformance() {
    const container = document.getElementById('coursePerformance');
    if (!container) return;
    
    const courseStats = getCourseStats();
    
    if (courseStats.length === 0) {
        container.innerHTML = '<p class="empty-state">No course data available</p>';
        return;
    }
    
    // Sort by completion rate
    courseStats.sort((a, b) => b.completionRate - a.completionRate);
    
    container.innerHTML = courseStats.map(stat => `
        <div class="stat-item course-stat">
            <div class="course-info">
                <div class="course-color" style="background: ${stat.course.color}"></div>
                <div class="course-details">
                    <span class="course-name">${stat.course.name}</span>
                    <span class="course-code">${stat.course.code}</span>
                </div>
            </div>
            <div class="course-progress">
                <div class="progress-text">
                    <span>${stat.completionRate}%</span>
                    <small>${stat.completedAssignments}/${stat.totalAssignments}</small>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${stat.completionRate}%; background: ${stat.course.color}"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateProductivityStats() {
    // Add productivity statistics section
    const statsContainer = document.querySelector('.detailed-stats');
    if (!statsContainer) return;
    
    // Check if productivity section already exists
    let productivitySection = document.getElementById('productivityStats');
    if (!productivitySection) {
        productivitySection = document.createElement('div');
        productivitySection.id = 'productivityStats';
        productivitySection.className = 'stat-section';
        productivitySection.innerHTML = '<h3>Productivity Insights</h3><div class="stat-list" id="productivityList"></div>';
        statsContainer.appendChild(productivitySection);
    }
    
    const productivityList = document.getElementById('productivityList');
    if (!productivityList) return;
    
    // Calculate productivity metrics
    const completedThisWeek = getCompletedAssignmentsThisWeek();
    const averageCompletionTime = getAverageCompletionTime();
    const mostProductiveDay = getMostProductiveDay();
    const upcomingDeadlines = getUpcomingAssignments(7);
    
    productivityList.innerHTML = `
        <div class="stat-item">
            <span>Completed This Week</span>
            <span class="highlight">${completedThisWeek}</span>
        </div>
        <div class="stat-item">
            <span>Upcoming Deadlines (7 days)</span>
            <span class="highlight">${upcomingDeadlines.length}</span>
        </div>
        <div class="stat-item">
            <span>Most Productive Day</span>
            <span class="highlight">${mostProductiveDay}</span>
        </div>
        <div class="stat-item">
            <span>Completion Rate</span>
            <span class="highlight">${getOverallCompletionRate()}%</span>
        </div>
    `;
}

function drawEmptyChart(ctx, canvas, message) {
    ctx.fillStyle = '#747D8C';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function drawChartLegend(ctx, canvas, data, position = 'bottom') {
    const legendY = position === 'bottom' ? canvas.height - 60 : 20;
    const itemWidth = 120;
    const startX = (canvas.width - (data.length * itemWidth)) / 2;
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    data.forEach((item, index) => {
        if (item.value > 0) {
            const x = startX + index * itemWidth;
            
            // Draw color box
            ctx.fillStyle = item.color;
            ctx.fillRect(x, legendY, 12, 12);
            
            // Draw label and value
            ctx.fillStyle = '#2F3542';
            ctx.fillText(`${item.label}: ${item.value}`, x + 16, legendY + 10);
        }
    });
}

// Helper functions for productivity stats
function getCompletedAssignmentsThisWeek() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    
    return assignments.filter(assignment => {
        if (assignment.status !== 'completed' || !assignment.completedAt) return false;
        const completedDate = new Date(assignment.completedAt);
        return completedDate >= weekStart;
    }).length;
}

function getAverageCompletionTime() {
    const completedAssignments = assignments.filter(a => a.status === 'completed' && a.completedAt && a.createdAt);
    
    if (completedAssignments.length === 0) return 'N/A';
    
    const totalTime = completedAssignments.reduce((sum, assignment) => {
        const created = new Date(assignment.createdAt);
        const completed = new Date(assignment.completedAt);
        return sum + (completed - created);
    }, 0);
    
    const averageMs = totalTime / completedAssignments.length;
    const averageDays = Math.round(averageMs / (1000 * 60 * 60 * 24));
    
    return `${averageDays} days`;
}

function getMostProductiveDay() {
    const dayCount = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    assignments.filter(a => a.status === 'completed' && a.completedAt).forEach(assignment => {
        const day = new Date(assignment.completedAt).getDay();
        dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    const mostProductiveDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 0);
    return days[mostProductiveDay] || 'N/A';
}

function getOverallCompletionRate() {
    const stats = getAssignmentStats();
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
}

// Export statistics data
function exportStatistics() {
    const stats = {
        assignmentStats: getAssignmentStats(),
        courseStats: getCourseStats(),
        productivityStats: {
            completedThisWeek: getCompletedAssignmentsThisWeek(),
            averageCompletionTime: getAverageCompletionTime(),
            mostProductiveDay: getMostProductiveDay(),
            overallCompletionRate: getOverallCompletionRate()
        },
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deadline-dash-statistics.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Add statistics-specific styles
const statisticsStyles = `
    .stat-color,
    .course-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    
    .stat-label {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .stat-value {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
    }
    
    .count {
        font-weight: 600;
        color: var(--text-dark);
    }
    
    .percentage {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .course-stat {
        align-items: center;
    }
    
    .course-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
    }
    
    .course-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    
    .course-name {
        font-weight: 500;
        color: var(--text-dark);
        font-size: 0.875rem;
    }
    
    .course-code {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .course-progress {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs);
        min-width: 80px;
    }
    
    .progress-text {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 2px;
    }
    
    .progress-text span {
        font-weight: 600;
        color: var(--text-dark);
    }
    
    .progress-text small {
        font-size: 0.75rem;
        color: var(--text-muted);
    }
    
    .progress-bar {
        width: 60px;
        height: 4px;
        background: var(--card-background);
        border-radius: 2px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 2px;
    }
    
    .highlight {
        font-weight: 600;
        color: var(--accent-color);
    }
    
    .export-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent-color);
        color: var(--white);
        border: none;
        border-radius: 50%;
        width: 56px;
        height: 56px;
        font-size: 1.25rem;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 210, 211, 0.3);
        transition: all var(--transition-fast);
    }
    
    .export-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 210, 211, 0.4);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = statisticsStyles;
document.head.appendChild(styleSheet);

// Add export button
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.createElement('button');
    exportBtn.className = 'export-btn';
    exportBtn.innerHTML = '<i class="fas fa-download"></i>';
    exportBtn.title = 'Export Statistics';
    exportBtn.onclick = exportStatistics;
    document.body.appendChild(exportBtn);
});
