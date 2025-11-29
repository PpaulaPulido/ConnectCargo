// License & Insurance functionality
class LicenseInsurance {
    constructor() {
        this.uploadModal = document.getElementById('uploadModal');
        this.addDocumentBtn = document.getElementById('addDocumentBtn');
        this.modalClose = document.getElementById('modalClose');
        this.cancelUpload = document.getElementById('cancelUpload');
        this.uploadForm = document.getElementById('uploadForm');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.documentFile = document.getElementById('documentFile');
        this.filePreview = document.getElementById('filePreview');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUpload();
    }

    setupEventListeners() {
        // Modal controls
        this.addDocumentBtn?.addEventListener('click', () => this.openModal());
        this.modalClose?.addEventListener('click', () => this.closeModal());
        this.cancelUpload?.addEventListener('click', () => this.closeModal());

        // Close modal on outside click
        this.uploadModal?.addEventListener('click', (e) => {
            if (e.target === this.uploadModal) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.uploadModal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Form submission
        this.uploadForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Renew insurance button
        document.querySelector('.btn-renew')?.addEventListener('click', () => {
            this.renewInsurance();
        });

        // Upload buttons
        document.querySelectorAll('.btn-upload').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        });
    }

    setupFileUpload() {
        if (!this.fileUploadArea || !this.documentFile) return;

        // Click on upload area
        this.fileUploadArea.addEventListener('click', () => {
            this.documentFile.click();
        });

        // Drag and drop
        this.fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileUploadArea.style.borderColor = 'var(--accent-primary)';
            this.fileUploadArea.style.background = 'var(--accent-light)';
        });

        this.fileUploadArea.addEventListener('dragleave', () => {
            this.fileUploadArea.style.borderColor = 'var(--border-light)';
            this.fileUploadArea.style.background = 'var(--bg-gray)';
        });

        this.fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileUploadArea.style.borderColor = 'var(--border-light)';
            this.fileUploadArea.style.background = 'var(--bg-gray)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // File input change
        this.documentFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
    }

    handleFileSelect(file) {
        // Validate file type and size
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            CarrierUtils.showNotification('Formato de archivo no válido. Use PDF, JPG o PNG.', 'error');
            return;
        }

        if (file.size > maxSize) {
            CarrierUtils.showNotification('El archivo es demasiado grande. Máximo 10MB.', 'error');
            return;
        }

        // Show file preview
        this.showFilePreview(file);
    }

    showFilePreview(file) {
        const fileSize = this.formatFileSize(file.size);
        const fileType = this.getFileType(file.type);

        this.filePreview.innerHTML = `
            <div class="file-preview-item">
                <i class="fas fa-file-${fileType === 'pdf' ? 'pdf' : 'image'}"></i>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-details">${fileSize} • ${fileType.toUpperCase()}</div>
                </div>
                <button type="button" class="btn-remove-file" onclick="licenseInsurance.removeFilePreview()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        this.filePreview.classList.add('active');
    }

    removeFilePreview() {
        this.filePreview.classList.remove('active');
        this.filePreview.innerHTML = '';
        this.documentFile.value = '';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileType(mimeType) {
        if (mimeType === 'application/pdf') return 'pdf';
        if (mimeType.startsWith('image/')) return 'image';
        return 'file';
    }

    openModal() {
        this.uploadModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.uploadModal.classList.remove('active');
        document.body.style.overflow = '';
        this.uploadForm.reset();
        this.removeFilePreview();
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData();
        const documentType = document.getElementById('documentType').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const file = this.documentFile.files[0];

        if (!documentType || !expiryDate || !file) {
            CarrierUtils.showNotification('Por favor complete todos los campos requeridos.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = this.uploadForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateUpload(formData);
            
            CarrierUtils.showNotification('Documento subido exitosamente.', 'success');
            this.closeModal();
            
            // In a real app, you would update the UI with the new document
            setTimeout(() => {
                location.reload(); // Simulate page refresh
            }, 1500);

        } catch (error) {
            CarrierUtils.showNotification('Error al subir el documento. Intente nuevamente.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    simulateUpload(formData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure
                Math.random() > 0.2 ? resolve() : reject(new Error('Upload failed'));
            }, 2000);
        });
    }

    renewInsurance() {
        CarrierUtils.showNotification('Redirigiendo al portal de seguros...', 'info');
        
        // Simulate navigation to insurance portal
        setTimeout(() => {
            CarrierUtils.showNotification('Portal de seguros abierto en nueva pestaña.', 'success');
            // window.open('https://seguros-connectcargo.com', '_blank');
        }, 1000);
    }

    // Utility method to check document expiry
    checkExpiryStatus(expiryDate) {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 30) return 'warning';
        return 'valid';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.licenseInsurance = new LicenseInsurance();
    
    // Add loading states to all buttons
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn-renew, .btn[type="submit"]')) {
            const button = e.target.closest('button');
            if (button && !button.disabled) {
                CarrierUtils.showLoading(button);
                
                // Auto remove loading after action
                setTimeout(() => {
                    CarrierUtils.hideLoading(button);
                }, 2000);
            }
        }
    });
});

// CSS for file preview (add to existing CSS)
const filePreviewStyles = `
.file-preview-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-main);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius);
}

.file-preview-item i {
    font-size: 1.5rem;
    color: var(--accent-primary);
}

.file-info {
    flex: 1;
}

.file-name {
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.file-details {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.btn-remove-file {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: var(--border-radius);
    transition: var(--transition);
}

.btn-remove-file:hover {
    background: var(--bg-gray);
    color: var(--text-primary);
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = filePreviewStyles;
document.head.appendChild(styleSheet);