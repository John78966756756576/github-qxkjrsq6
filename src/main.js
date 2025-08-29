import './style.css';

// DOM elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const chooseFileBtn = document.getElementById('choose-file-btn');
const submitBtn = document.getElementById('submit-btn');
const loading = document.getElementById('loading');
const statusMessage = document.getElementById('status-message');

// Status elements
const workflowStatus = document.getElementById('workflow-status');
const uploadStatus = document.getElementById('upload-status');
const submitStatus = document.getElementById('submit-status');
const completeStatus = document.getElementById('complete-status');

let selectedFile = null;
let resumeUrl = null;
let currentWorkflowId = null;

// N8N Webhook Configuration
const N8N_WEBHOOK_URL = 'https://john57845738478.app.n8n.cloud/webhook-test/87476124-4418-43c2-933d-24347b484016';

// Add webhook status logging
console.log('🔗 N8N Webhook URL configured:', N8N_WEBHOOK_URL);

// File upload handling
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

chooseFileBtn.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    selectedFile = file;
    document.querySelector('.upload-text').textContent = file.name;
    document.querySelector('.upload-subtext').textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    submitBtn.disabled = false;
    
    // Update upload status
    updateStatus('upload', 'active');
}

// Submit button handling
submitBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        showStatus('Please select a file first', 'error');
        return;
    }

    showLoading(true);
    updateStatus('workflow', 'in-progress');
    
    try {
        // Import workflow function
        const { startWorkflow } = await import('./workflow.js');
        
        // Send file and all data directly to n8n webhook
        const fileInfo = {
            file: selectedFile, // Include the actual file object
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type
        };
        
        const additionalData = {
            userPreferences: {
                notifications: true,
                autoProcess: true
            },
            deviceInfo: {
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            }
        };
        
        const result = await startWorkflow(fileInfo, additionalData);
        
        // Update status to complete
        updateStatus('workflow', 'complete');
        updateStatus('submit', 'complete');
        updateStatus('complete', 'complete');
        
        showLoading(false);
        showStatus('File and data sent to n8n successfully!', 'success');
        
    } catch (error) {
        console.error('Error:', error);
        showStatus('Failed to process request. Please try again.', 'error');
        updateStatus('workflow', 'error');
        showLoading(false);
    }
});

function updateStatus(stage, status) {
    const statusMap = {
        'workflow': workflowStatus,
        'upload': uploadStatus,
        'submit': submitStatus,
        'complete': completeStatus
    };
    
    const element = statusMap[stage];
    if (element) {
        // Remove all status classes
        element.classList.remove('pending', 'active', 'in-progress', 'complete', 'error');
        // Add new status class
        element.classList.add(status);
    }
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    submitBtn.disabled = show || !selectedFile;
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

// Initialize - set upload as active since user needs to upload first
updateStatus('upload', 'active');