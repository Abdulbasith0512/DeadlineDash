// DeadlineDASH - Courses JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeCoursesPage();
    setupCourseForm();
    setupFileUpload();
    loadCourses();
});

function initializeCoursesPage() {
    loadCourses();
}

function setupCourseForm() {
    const courseForm = document.getElementById('courseForm');
    if (courseForm) {
        courseForm.addEventListener('submit', handleCourseSubmit);
    }
}

function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

function handleCourseSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('courseId').value;
    const name = document.getElementById('courseName').value.trim();
    const code = document.getElementById('courseCode').value.trim();
    const semester = document.getElementById('courseSemester').value;
    const color = document.getElementById('courseColor').value;
    
    // Validate inputs
    if (!name || !code || !semester || !color) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (name.length < 3) {
        showError('Course name must be at least 3 characters long');
        return;
    }
    
    if (code.length < 2) {
        showError('Course code must be at least 2 characters long');
        return;
    }
    
    // Check for duplicate course codes (only for new courses)
    if (!id && courses.some(course => course.code.toLowerCase() === code.toLowerCase())) {
        showError('A course with this code already exists');
        return;
    }
    
    const course = {
        id: id || generateId(),
        name: name,
        code: code.toUpperCase(),
        semester: semester,
        color: color,
        materials: id ? courses.find(c => c.id === id)?.materials || [] : [],
        createdAt: id ? courses.find(c => c.id === id)?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (id) {
        // Update existing course
        const index = courses.findIndex(c => c.id === id);
        if (index !== -1) {
            courses[index] = course;
            showSuccess('Course updated successfully!');
        }
    } else {
        // Add new course
        courses.push(course);
        showSuccess('Course added successfully!');
    }
    
    saveDataToStorage();
    closeModal('courseModal');
    loadCourses();
    updateCourseOptions(); // Update assignment form options
    document.getElementById('courseForm').reset();
    document.getElementById('courseId').value = '';
    document.getElementById('courseModalTitle').textContent = 'Add Course';
}

function loadCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;
    
    if (courses.length === 0) {
        grid.innerHTML = '<p class="empty-state">No courses found. Add your first course!</p>';
        return;
    }
    
    // Sort courses by creation date (newest first)
    const sortedCourses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    grid.innerHTML = sortedCourses.map(course => {
        const assignmentCount = getAssignmentsByCourse(course.id).length;
        const completedAssignments = getAssignmentsByCourse(course.id).filter(a => a.status === 'completed').length;
        const materialCount = course.materials ? course.materials.length : 0;
        const completionRate = assignmentCount > 0 ? Math.round((completedAssignments / assignmentCount) * 100) : 0;
        
        return `
            <div class="course-card" style="border-left-color: ${course.color}">
                <div class="course-header">
                    <div>
                        <h3 class="course-title">${course.name}</h3>
                        <span class="course-code">${course.code}</span>
                    </div>
                    <div class="card-actions">
                        <button class="upload-btn" onclick="uploadMaterials('${course.id}')" title="Upload Materials">
                            <i class="fas fa-upload"></i>
                        </button>
                        <button class="edit-btn" onclick="editCourse('${course.id}')" title="Edit Course">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="deleteCourse('${course.id}')" title="Delete Course">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="course-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${course.semester} Semester</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-tasks"></i>
                        <span>${assignmentCount} assignment${assignmentCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-file"></i>
                        <span>${materialCount} material${materialCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                ${assignmentCount > 0 ? `
                    <div class="course-progress">
                        <div class="progress-info">
                            <span>Progress: ${completionRate}%</span>
                            <span>${completedAssignments}/${assignmentCount} completed</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${completionRate}%; background: ${course.color}"></div>
                        </div>
                    </div>
                ` : ''}
                ${course.materials && course.materials.length > 0 ? `
                    <div class="course-materials">
                        <h4>Recent Materials:</h4>
                        <div class="materials-list">
                            ${course.materials.slice(-3).map(material => `
                                <div class="material-item">
                                    <div class="material-info">
                                        <i class="fas fa-${getFileIcon(material.name)}"></i>
                                        <span>${material.name}</span>
                                        <small>${formatFileSize(material.size)}</small>
                                    </div>
                                    <div class="material-actions">
                                        <button onclick="downloadMaterial('${course.id}', '${material.id}')" class="btn-icon" title="Download">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button onclick="deleteMaterial('${course.id}', '${material.id}')" class="btn-icon" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                            ${course.materials.length > 3 ? `
                                <div class="material-item more-materials">
                                    <span>+${course.materials.length - 3} more materials</span>
                                    <button onclick="viewAllMaterials('${course.id}')" class="btn-secondary btn-sm">View All</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function editCourse(id) {
    const course = getCourseById(id);
    if (!course) return;
    
    document.getElementById('courseId').value = course.id;
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseCode').value = course.code;
    document.getElementById('courseSemester').value = course.semester;
    document.getElementById('courseColor').value = course.color;
    
    document.getElementById('courseModalTitle').textContent = 'Edit Course';
    showModal('courseModal');
}

function deleteCourse(id) {
    const course = getCourseById(id);
    if (!course) return;
    
    const relatedAssignments = getAssignmentsByCourse(id);
    let confirmMessage = `Are you sure you want to delete "${course.name}"?`;
    
    if (relatedAssignments.length > 0) {
        confirmMessage += `\n\nThis will also delete ${relatedAssignments.length} related assignment${relatedAssignments.length > 1 ? 's' : ''}.`;
    }
    
    if (confirm(confirmMessage)) {
        // Remove course
        courses = courses.filter(c => c.id !== id);
        // Remove related assignments
        assignments = assignments.filter(a => a.courseId !== id);
        
        saveDataToStorage();
        loadCourses();
        showSuccess('Course and related assignments deleted successfully!');
    }
}

function uploadMaterials(courseId) {
    document.getElementById('uploadCourseId').value = courseId;
    displayUploadedFiles(courseId);
    showModal('fileModal');
}

function handleFileUpload(event) {
    const files = event.target.files;
    const courseId = document.getElementById('uploadCourseId').value;
    const course = getCourseById(courseId);
    
    if (!course) {
        showError('Course not found');
        return;
    }
    
    if (!course.materials) {
        course.materials = [];
    }
    
    // Validate files
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
    
    Array.from(files).forEach(file => {
        // Check file size
        if (file.size > maxFileSize) {
            showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
            return;
        }
        
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            showError(`File type "${fileExtension}" is not allowed.`);
            return;
        }
        
        // Check for duplicate names
        if (course.materials.some(m => m.name === file.name)) {
            if (!confirm(`A file named "${file.name}" already exists. Replace it?`)) {
                return;
            }
            // Remove existing file
            course.materials = course.materials.filter(m => m.name !== file.name);
        }
        
        const material = {
            id: generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            uploadDate: new Date().toISOString()
        };
        
        course.materials.push(material);
    });
    
    saveDataToStorage();
    displayUploadedFiles(courseId);
    loadCourses();
    showSuccess(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully!`);
    
    // Clear file input
    event.target.value = '';
}

function displayUploadedFiles(courseId) {
    const course = getCourseById(courseId);
    const container = document.getElementById('uploadedFiles');
    
    if (!container) return;
    
    if (!course || !course.materials || course.materials.length === 0) {
        container.innerHTML = '<p class="empty-state">No materials uploaded yet</p>';
        return;
    }
    
    // Sort materials by upload date (newest first)
    const sortedMaterials = [...course.materials].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    
    container.innerHTML = sortedMaterials.map(material => `
        <div class="file-item">
            <div class="file-info">
                <i class="fas fa-${getFileIcon(material.name)}"></i>
                <div class="file-details">
                    <span class="file-name">${material.name}</span>
                    <small class="file-meta">${formatFileSize(material.size)} • ${formatDate(new Date(material.uploadDate))}</small>
                </div>
            </div>
            <div class="file-actions">
                <button onclick="downloadMaterial('${courseId}', '${material.id}')" class="btn-icon" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button onclick="deleteMaterial('${courseId}', '${material.id}')" class="btn-icon" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function downloadMaterial(courseId, materialId) {
    const course = getCourseById(courseId);
    const material = course?.materials?.find(m => m.id === materialId);
    
    if (!material) {
        showError('Material not found');
        return;
    }
    
    // Simulate download (in a real app, this would download the actual file)
    showSuccess(`Downloading "${material.name}"... (Demo mode - no actual file will be downloaded)`);
}

function deleteMaterial(courseId, materialId) {
    const course = getCourseById(courseId);
    const material = course?.materials?.find(m => m.id === materialId);
    
    if (!material) {
        showError('Material not found');
        return;
    }
    
    if (confirm(`Delete "${material.name}"?`)) {
        course.materials = course.materials.filter(m => m.id !== materialId);
        saveDataToStorage();
        displayUploadedFiles(courseId);
        loadCourses();
        showSuccess('Material deleted successfully!');
    }
}

function viewAllMaterials(courseId) {
    const course = getCourseById(courseId);
    if (!course) return;
    
    // This could open a dedicated materials view
    // For now, just show the upload modal with all materials
    uploadMaterials(courseId);
}

function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'pdf':
            return 'file-pdf';
        case 'doc':
        case 'docx':
            return 'file-word';
        case 'ppt':
        case 'pptx':
            return 'file-powerpoint';
        case 'txt':
            return 'file-alt';
        default:
            return 'file';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function setColor(color) {
    const colorInput = document.getElementById('courseColor');
    if (colorInput) {
        colorInput.value = color;
    }
}

// Add styles for course-specific elements
const courseStyles = `
    .course-progress {
        margin-top: var(--spacing-md);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-light);
    }
    
    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xs);
        font-size: 0.875rem;
        color: var(--text-muted);
    }
    
    .progress-bar {
        width: 100%;
        height: 6px;
        background: var(--card-background);
        border-radius: 3px;
        overflow: hidden;
    }
    
    .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 3px;
    }
    
    .course-materials {
        margin-top: var(--spacing-md);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-light);
    }
    
    .course-materials h4 {
        font-size: 0.875rem;
        margin-bottom: var(--spacing-sm);
        color: var(--text-dark);
    }
    
    .materials-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }
    
    .material-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-xs) var(--spacing-sm);
        background: var(--card-background);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
    }
    
    .material-info {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        flex: 1;
    }
    
    .file-details {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    
    .file-name {
        font-weight: 500;
        color: var(--text-dark);
    }
    
    .file-meta {
        color: var(--text-muted);
        font-size: 0.7rem;
    }
    
    .material-actions {
        display: flex;
        gap: var(--spacing-xs);
    }
    
    .more-materials {
        justify-content: space-between;
        font-style: italic;
        color: var(--text-muted);
    }
    
    .btn-sm {
        padding: var(--spacing-xs) var(--spacing-sm);
        font-size: 0.75rem;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = courseStyles;
document.head.appendChild(styleSheet);
