// Upload Documents functionality
class UploadDocuments {
    constructor() {
        this.uploadModal = document.getElementById('uploadModal');
        this.bulkUploadBtn = document.getElementById('bulkUploadBtn');
        this.modalClose = document.getElementById('modalClose');
        this.cancelUpload = document.getElementById('cancelUpload');
        this.uploadForm = document.getElementById('uploadForm');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.documentFile = document.getElementById('documentFile');
        this.filePreview = document.getElementById('filePreview');
        this.uploadAreas = document.querySelectorAll('.upload-area');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUploadAreas();
        this.setupDocumentActions();
    }

    setupEventListeners() {
        // Bulk upload button
        this.bulkUploadBtn?.addEventListener('click', () => this.openBulkUpload());

        // Modal controls
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

        // File upload area
        this.setupFileUploadArea();
    }

    setupUploadAreas() {
        this.uploadAreas.forEach(area => {
            const fileInput = area.querySelector('input[type="file"]');
            
            // Click on upload area
            area.addEventListener('click', () => {
                fileInput.click();
            });

            // Drag and drop
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.style.borderColor = 'var(--accent-primary)';
                area.style.background = 'var(--accent-light)';
            });

            area.addEventListener('dragleave', () => {
                area.style.borderColor = 'var(--border-light)';
                area.style.background = 'var(--bg-gray)';
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.style.borderColor = 'var(--border-light)';
                area.style.background = 'var(--bg-gray)';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleDocumentUpload(area, files[0]);
                }
            });

            // File input change
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleDocumentUpload(area, e.target.files[0]);
                }
            });
        });
    }

    setupDocumentActions() {
        // View document buttons
        document.querySelectorAll('.btn-icon[title="Ver documento"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.document-card');
                this.viewDocument(card);
            });
        });

        // Delete document buttons
        document.querySelectorAll('.btn-icon[title="Eliminar"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.document-card');
                this.deleteDocument(card);
            });
        });

        // Update document buttons
        document.querySelectorAll('.btn-outline:not(.btn-icon)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.document-card');
                this.updateDocument(card);
            });
        });
    }

    setupFileUploadArea() {
        if (!this.fileUploadArea || !this.documentFile) return;

        this.fileUploadArea.addEventListener('click', () => {
            this.documentFile.click();
        });

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

        this.documentFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
    }

    handleDocumentUpload(area, file) {
        const documentType = area.dataset.documentType;
        const card = area.closest('.document-card');
        
        // Validate file
        if (!this.validateFile(file, documentType)) {
            return;
        }

        // Show loading state
        this.showUploadingState(area);

        // Simulate upload process
        setTimeout(() => {
            this.showUploadSuccess(card, file, documentType);
            this.updateProgress();
        }, 2000);
    }

    validateFile(file, documentType) {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        let maxSize = 10 * 1024 * 1024; // 10MB default

        // Adjust max size based on document type
        if (documentType === 'soat' || documentType === 'tecnomecanica') {
            maxSize = 5 * 1024 * 1024; // 5MB
        }

        if (!validTypes.includes(file.type)) {
            CarrierUtils.showNotification('Formato de archivo no válido. Use PDF, JPG o PNG.', 'error');
            return false;
        }

        if (file.size > maxSize) {
            CarrierUtils.showNotification(`El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB.`, 'error');
            return false;
        }

        return true;
    }

    showUploadingState(area) {
        const originalHTML = area.innerHTML;
        area.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <p>Subiendo documento...</p>
            <span>Por favor espere</span>
        `;
        area.style.pointerEvents = 'none';
        
        // Store original HTML for later restoration
        area.dataset.originalHTML = originalHTML;
    }

    showUploadSuccess(card, file, documentType) {
        const area = card.querySelector('.upload-area');
        const statusBadge = card.querySelector('.status-badge');
        const documentActions = card.querySelector('.document-actions');
        
        // Create preview
        const fileSize = this.formatFileSize(file.size);
        const previewHTML = `
            <div class="preview-item">
                <i class="fas fa-file-${file.type === 'application/pdf' ? 'pdf' : 'image'}"></i>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSize}</span>
                </div>
                <div class="file-actions">
                    <button class="btn-icon" title="Ver documento">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        // Replace upload area with preview
        area.style.display = 'none';
        
        const previewContainer = document.createElement('div');
        previewContainer.className = 'document-preview';
        previewContainer.innerHTML = previewHTML;
        card.insertBefore(previewContainer, documentActions);

        // Update status
        statusBadge.textContent = 'En Revisión';
        statusBadge.className = 'status-badge under-review';

        // Add event listeners to new buttons
        this.setupPreviewActions(previewContainer);

        CarrierUtils.showNotification('Documento subido exitosamente. En revisión.', 'success');
    }

    setupPreviewActions(previewContainer) {
        const viewBtn = previewContainer.querySelector('.btn-icon[title="Ver documento"]');
        const deleteBtn = previewContainer.querySelector('.btn-icon[title="Eliminar"]');

        viewBtn.addEventListener('click', () => this.viewDocument(previewContainer.closest('.document-card')));
        deleteBtn.addEventListener('click', () => this.deleteDocument(previewContainer.closest('.document-card')));
    }

    handleFileSelect(file) {
        if (!this.validateFile(file, 'general')) {
            return;
        }

        this.showFilePreview(file);
    }

    showFilePreview(file) {
        const fileSize = this.formatFileSize(file.size);
        const fileType = this.getFileType(file.type);

        this.filePreview.innerHTML = `
            <div class="preview-item">
                <i class="fas fa-file-${fileType === 'pdf' ? 'pdf' : 'image'}"></i>
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${fileSize} • ${fileType.toUpperCase()}</span>
                </div>
                <button type="button" class="btn-icon" onclick="uploadDocuments.removeFilePreview()">
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

    viewDocument(card) {
        const docName = card.querySelector('h3').textContent;
        CarrierUtils.showNotification(`Viendo documento: ${docName}`, 'info');
    }

    deleteDocument(card) {
        const docName = card.querySelector('h3').textContent;
        
        if (confirm(`¿Estás seguro de que quieres eliminar el documento "${docName}"?`)) {
            const preview = card.querySelector('.document-preview');
            const area = card.querySelector('.upload-area');
            const statusBadge = card.querySelector('.status-badge');
            
            if (preview) preview.remove();
            if (area) {
                area.style.display = 'block';
                area.innerHTML = area.dataset.originalHTML || area.innerHTML;
                area.style.pointerEvents = 'auto';
            }
            
            statusBadge.textContent = 'Falta';
            statusBadge.className = 'status-badge missing';
            
            CarrierUtils.showNotification('Documento eliminado', 'success');
            this.updateProgress();
        }
    }

    updateDocument(card) {
        const docName = card.querySelector('h3').textContent;
        CarrierUtils.showNotification(`Actualizando documento: ${docName}`, 'info');
        this.openModal();
    }

    updateProgress() {
        const totalDocuments = document.querySelectorAll('.document-card.required').length;
        const uploadedDocuments = document.querySelectorAll('.document-card.required .document-preview').length;
        const newProgress = Math.round((uploadedDocuments / totalDocuments) * 100);
        
        this.animateProgressTo(newProgress);
    }

    animateProgressTo(newProgress) {
        const percentageElement = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        
        if (!percentageElement || !progressFill) return;

        let current = parseInt(percentageElement.textContent);
        const duration = 1000;
        const increment = (newProgress - current) / (duration / 16);

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= newProgress) || (increment < 0 && current <= newProgress)) {
                current = newProgress;
            }

            percentageElement.textContent = `${Math.round(current)}%`;
            progressFill.style.width = `${current}%`;

            if (current !== newProgress) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    openBulkUpload() {
        CarrierUtils.showNotification('Funcionalidad de subida masiva - Próximamente', 'info');
        // In a real app, this would open a multi-file upload interface
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
                Math.random() > 0.2 ? resolve() : reject(new Error('Upload failed'));
            }, 2000);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uploadDocuments = new UploadDocuments();
});