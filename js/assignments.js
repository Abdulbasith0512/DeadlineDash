// DeadlineDASH - Assignments JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAssignmentsPage();
    setupAssignmentForm();
    loadAssignments();
    updateCourseOptions();
});

function initializeAssignmentsPage() {
    updateCourseFilter();
    loadAssignments();
}

function setupAssignmentForm() {
    const assignmentForm = document.getElementById('assignmentForm');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', handleAssignmentSubmit);
    }
}

function handleAssignmentSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('assignmentId').value;
    const title = document.getElementById('assignmentTitle').value.trim();
    const type = document.getElementById('assignmentType').value;
    const courseId = document.getElementById('assignmentCourse').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const priority = document.getElementById('assignmentPriority').value;
    const status = document.getElementById('assignmentStatus').value;
    const description = document.getElementById('assignmentDescription').value.trim();
    
    // Validate inputs
    if (!title || !type || !courseId || !dueDate || !priority || !status) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (title.length < 3) {
        showError('Assignment title must be at least 3 characters long');
        return;
    }
    
    // Check if due date is in the past (only for new assignments)
    const dueDateObj = new Date(dueDate);
    const now = new Date();
    if (!id && dueDateObj < now) {
        if (!confirm('The due date is in the past. Do you want to continue?')) {
            return;
        }
    }
    
    const assignment = {
        id: id || generateId(),
        title: title,
        type: type,
        courseId: courseId,
        dueDate: dueDate,
        priority: priority,
        status: status,
        description: description,
        createdAt: id ? assignments.find(a => a.id === id)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        // Update existing assignment
        const index = assignments.findIndex(a => a.id === id);
        if (index !== -1) {
            assignments[index] = assignment;
            showSuccess('Assignment updated successfully!');
        }
    } else {
        // Add new assignment
        assignments.push(assignment);
        showSuccess('Assignment added successfully!');
    }
    
    saveDataToStorage();
    closeModal('assignmentModal');
    loadAssignments();
    document.getElementById('assignmentForm').reset();
    document.getElementById('assignmentId').value = '';
    document.getElementById('assignmentModalTitle').textContent = 'Add Assignment';
}

function loadAssignments() {
    const grid = document.getElementById('assignmentsGrid');
    if (!grid) return;
    
    if (assignments.length === 0) {
        grid.innerHTML = '<p class="empty-state">No assignments found. Add your first assignment!</p>';
        return;
    }
    
    const filteredAssignments = filterAssignmentsByFilters();
    
    if (filteredAssignments.length === 0) {
        grid.innerHTML = '<p class="empty-state">No assignments match your current filters.</p>';
        return;
    }
    
    // Sort assignments by due date
    filteredAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    grid.innerHTML = filteredAssignments.map(assignment => {
        const course = getCourseById(assignment.courseId);
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = dueDate < new Date() && assignment.status !== 'completed';
        const timeUntilDue = getTimeUntilDue(dueDate);
        
        return `
            <div class="assignment-card" style="border-left-color: ${course?.color || '#00D2D3'}">
                <div class="assignment-header">
                    <div>
                        <h3 class="assignment-title">${assignment.title}</h3>
                        <span class="assignment-type">${assignment.type}</span>
                    </div>
                    <div class="card-actions">
                        <button class="edit-btn" onclick="editAssignment('${assignment.id}')" title="Edit Assignment">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteAssignment('${assignment.id}')" title="Delete Assignment">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="assignment-meta">
                    <div class="meta-item">
                        <i class="fas fa-book"></i>
                        <span>${course?.name || 'Unknown Course'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(dueDate)} ${isOverdue ? '(Overdue)' : ''}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${timeUntilDue}</span>
                    </div>
                    <div class="meta-item">
                        <span class="priority-badge priority-${assignment.priority}">${assignment.priority}</span>
                        <span class="status-badge status-${assignment.status}">${assignment.status.replace('-', ' ')}</span>
                    </div>
                </div>
                ${assignment.description ? `<p class="assignment-description">${assignment.description}</p>` : ''}
                <div class="assignment-actions">
                    ${assignment.status !== 'completed' ? `
                        <button class="btn-success btn-sm" onclick="markAsCompleted('${assignment.id}')">
                            <i class="fas fa-check"></i> Mark Complete
                        </button>
                    ` : ''}
                    ${assignment.status === 'pending' ? `
                        <button class="btn-primary btn-sm" onclick="markAsInProgress('${assignment.id}')">
                            <i class="fas fa-play"></i> Start Working
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function filterAssignmentsByFilters() {
    const courseFilter = document.getElementById('courseFilter')?.value || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const priorityFilter = document.getElementById('priorityFilter')?.value || '';
    
    return assignments.filter(assignment => {
        return (!courseFilter || assignment.courseId === courseFilter) &&
               (!statusFilter || assignment.status === statusFilter) &&
               (!priorityFilter || assignment.priority === priorityFilter);
    });
}

function filterAssignments() {
    loadAssignments();
}

function updateCourseOptions() {
    const select = document.getElementById('assignmentCourse');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Course</option>';
    
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.name} (${course.code})`;
        select.appendChild(option);
    });
}

function updateCourseFilter() {
    const select = document.getElementById('courseFilter');
    if (!select) return;
    
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">All Courses</option>';
    
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        select.appendChild(option);
    });
    
    select.value = currentValue;
}

function editAssignment(id) {
    const assignment = getAssignmentById(id);
    if (!assignment) return;
    
    document.getElementById('assignmentId').value = assignment.id;
    document.getElementById('assignmentTitle').value = assignment.title;
    document.getElementById('assignmentType').value = assignment.type;
    document.getElementById('assignmentCourse').value = assignment.courseId;
    document.getElementById('assignmentDueDate').value = assignment.dueDate;
    document.getElementById('assignmentPriority').value = assignment.priority;
    document.getElementById('assignmentStatus').value = assignment.status;
    document.getElementById('assignmentDescription').value = assignment.description || '';
    
    document.getElementById('assignmentModalTitle').textContent = 'Edit Assignment';
    showModal('assignmentModal');
}

function deleteAssignment(id) {
    const assignment = getAssignmentById(id);
    if (!assignment) return;
    
    if (confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
        assignments = assignments.filter(a => a.id !== id);
        saveDataToStorage();
        loadAssignments();
        showSuccess('Assignment deleted successfully!');
    }
}

function markAsCompleted(id) {
    const assignment = getAssignmentById(id);
    if (!assignment) return;
    
    assignment.status = 'completed';
    assignment.completedAt = new Date().toISOString();
    assignment.updatedAt = new Date().toISOString();
    
    saveDataToStorage();
    loadAssignments();
    showSuccess(`"${assignment.title}" marked as completed!`);
}

function markAsInProgress(id) {
    const assignment = getAssignmentById(id);
    if (!assignment) return;
    
    assignment.status = 'in-progress';
    assignment.startedAt = new Date().toISOString();
    assignment.updatedAt = new Date().toISOString();
    
    saveDataToStorage();
    loadAssignments();
    showSuccess(`Started working on "${assignment.title}"!`);
}

function getTimeUntilDue(dueDate) {
    const now = new Date();
    const timeDiff = dueDate - now;
    
    if (timeDiff < 0) {
        const overdueDiff = Math.abs(timeDiff);
        const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24));
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} overdue`;
        } else {
            const hours = Math.floor(overdueDiff / (1000 * 60 * 60));
            return `${hours} hour${hours > 1 ? 's' : ''} overdue`;
        }
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

// Bulk actions
function selectAllAssignments() {
    const checkboxes = document.querySelectorAll('.assignment-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function deselectAllAssignments() {
    const checkboxes = document.querySelectorAll('.assignment-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function bulkDeleteAssignments() {
    const checkboxes = document.querySelectorAll('.assignment-checkbox:checked');
    if (checkboxes.length === 0) {
        showError('Please select assignments to delete');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${checkboxes.length} assignment${checkboxes.length > 1 ? 's' : ''}?`)) {
        const idsToDelete = Array.from(checkboxes).map(cb => cb.value);
        assignments = assignments.filter(a => !idsToDelete.includes(a.id));
        saveDataToStorage();
        loadAssignments();
        showSuccess(`${checkboxes.length} assignment${checkboxes.length > 1 ? 's' : ''} deleted successfully!`);
    }
}

// Add styles for assignment actions
const assignmentStyles = `
    .assignment-actions {
        margin-top: var(--spacing-md);
        display: flex;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
    }
    
    .btn-sm {
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: 0.75rem;
    }
    
    .assignment-checkbox {
        margin-right: var(--spacing-sm);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = assignmentStyles;
document.head.appendChild(styleSheet);
