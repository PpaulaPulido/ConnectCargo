// Carrier Profile Management - Namespaced to avoid conflicts
class CarrierProfile {
    constructor() {
        this.currentSection = 'personal';
        this.formData = {};
        this.uploadedDocuments = [];
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupFormHandlers();
        this.setupUploadHandlers();
        this.setupInteractiveElements();
        this.calculateProfileCompletion();
        
        console.log('Carrier Profile initialized');
    }

    setupNavigation() {
        // Section navigation
        document.querySelectorAll('.carrier-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-carrier-section');
                this.showSection(section);
            });
        });

        // Save profile button
        document.getElementById('carrierSaveProfile').addEventListener('click', () => {
            this.saveProfile();
        });

        // Preview profile button
        document.getElementById('carrierPreviewProfile').addEventListener('click', () => {
            this.showPreview();
        });

        // Close preview modal
        document.getElementById('carrierClosePreview').addEventListener('click', () => {
            this.hidePreview();
        });
    }

    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.carrier-nav-item').forEach(item => {
            item.classList.remove('carrier-nav-active');
        });
        document.querySelector(`[data-carrier-section="${sectionId}"]`).classList.add('carrier-nav-active');

        // Update form sections
        document.querySelectorAll('.carrier-form-section').forEach(section => {
            section.classList.remove('carrier-form-active');
        });
        document.getElementById(`carrier-${sectionId}`).classList.add('carrier-form-active');

        this.currentSection = sectionId;
        
        // Update URL hash
        window.location.hash = `carrier-${sectionId}`;
    }

    setupFormHandlers() {
        // Real-time form validation
        document.querySelectorAll('.carrier-profile-form input, .carrier-profile-form select, .carrier-profile-form textarea').forEach(field => {
            field.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
            
            field.addEventListener('input', (e) => {
                this.updateFormData(e.target);
                this.calculateProfileCompletion();
            });
        });

        // Special handlers for tags input
        this.setupTagsInput();
        
        // Range input value display
        const radiusInput = document.getElementById('carrierPreferredRadius');
        if (radiusInput) {
            radiusInput.addEventListener('input', (e) => {
                document.getElementById('carrierRadiusValue').textContent = `${e.target.value} km`;
            });
        }

        // Save preferences
        document.getElementById('carrierSavePreferences').addEventListener('click', () => {
            this.savePreferences();
        });

        // Reset preferences
        document.getElementById('carrierResetPreferences').addEventListener('click', () => {
            this.resetPreferences();
        });
    }

    setupTagsInput() {
        const tagsContainer = document.getElementById('carrierCargoSpecializations');
        if (!tagsContainer) return;

        const input = tagsContainer.querySelector('.carrier-tags-input-field');
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                this.addTag(input.value.trim());
                input.value = '';
            }
        });

        // Remove tag when clicking X
        tagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-times')) {
                const tag = e.target.closest('.carrier-tag');
                tag.remove();
                this.calculateProfileCompletion();
            }
        });
    }

    addTag(text) {
        if (!text) return;
        
        const tagsContainer = document.getElementById('carrierCargoSpecializations');
        const tag = document.createElement('span');
        tag.className = 'carrier-tag';
        tag.innerHTML = `${text} <i class="fas fa-times"></i>`;
        
        const input = tagsContainer.querySelector('.carrier-tags-input-field');
        tagsContainer.insertBefore(tag, input);
        
        this.calculateProfileCompletion();
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Remove existing validation styles
        field.classList.remove('carrier-valid', 'carrier-invalid');

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'Este campo es obligatorio';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Por favor ingresa un email válido';
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                message = 'Por favor ingresa un número de teléfono válido';
            }
        }

        // Apply validation styles
        if (value) {
            field.classList.add(isValid ? 'carrier-valid' : 'carrier-invalid');
        }

        // Show/hide validation message
        this.showValidationMessage(field, message);
        
        return isValid;
    }

    showValidationMessage(field, message) {
        // Remove existing message
        const existingMessage = field.parentNode.querySelector('.carrier-validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Add new message if needed
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'carrier-validation-message carrier-invalid';
            messageElement.textContent = message;
            messageElement.style.cssText = `
                color: #EF4444;
                font-size: 0.8rem;
                margin-top: 0.25rem;
            `;
            field.parentNode.appendChild(messageElement);
        }
    }

    updateFormData(field) {
        const form = field.closest('.carrier-profile-form');
        if (!form) return;

        const formId = form.id;
        if (!this.formData[formId]) {
            this.formData[formId] = {};
        }

        if (field.type === 'checkbox') {
            this.formData[formId][field.name] = field.checked;
        } else {
            this.formData[formId][field.name] = field.value;
        }
    }

    calculateProfileCompletion() {
        let completedFields = 0;
        let totalFields = 0;

        // Count fields in all forms
        document.querySelectorAll('.carrier-profile-form').forEach(form => {
            form.querySelectorAll('input, select, textarea').forEach(field => {
                if (field.type === 'hidden') return;
                
                totalFields++;
                
                if (field.type === 'checkbox') {
                    if (field.checked) completedFields++;
                } else if (field.type === 'file') {
                    // Skip file inputs for completion calculation
                    totalFields--;
                } else {
                    if (field.value.trim() !== '') completedFields++;
                }
            });
        });

        // Count tags
        const tags = document.querySelectorAll('#carrierCargoSpecializations .carrier-tag');
        if (tags.length > 0) {
            totalFields++;
            completedFields++;
        }

        const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
        
        // Update progress bar
        const progressBar = document.getElementById('carrierCompletionProgress');
        const percentageText = document.getElementById('carrierCompletionPercentage');
        
        if (progressBar && percentageText) {
            progressBar.style.width = `${percentage}%`;
            percentageText.textContent = `${percentage}%`;
        }

        return percentage;
    }

    setupUploadHandlers() {
        // Profile photo upload
        document.getElementById('carrierChangePhotoBtn').addEventListener('click', () => {
            document.getElementById('carrierPhotoUpload').click();
        });

        document.getElementById('carrierPhotoUpload').addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files[0]);
        });

        // Document upload area
        const uploadArea = document.getElementById('carrierUploadArea');
        const documentUpload = document.getElementById('carrierDocumentUpload');

        uploadArea.addEventListener('click', () => {
            documentUpload.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('carrier-dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('carrier-dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('carrier-dragover');
            this.handleDocumentUpload(e.dataTransfer.files);
        });

        documentUpload.addEventListener('change', (e) => {
            this.handleDocumentUpload(e.target.files);
        });
    }

    handlePhotoUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showNotification('Por favor selecciona una imagen válida', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.showNotification('La imagen debe ser menor a 5MB', 'error');
            return;
        }

        // Simulate upload process
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('carrierProfileImage').src = e.target.result;
            this.showNotification('Foto de perfil actualizada correctamente', 'success');
        };
        reader.readAsDataURL(file);
    }

    handleDocumentUpload(files) {
        if (!files.length) return;

        Array.from(files).forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                this.showNotification(`El archivo ${file.name} es demasiado grande (máx. 10MB)`, 'error');
                return;
            }

            // Simulate document upload
            this.uploadedDocuments.push({
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date()
            });

            this.showNotification(`Documento ${file.name} subido correctamente`, 'success');
        });

        // Clear file input
        document.getElementById('carrierDocumentUpload').value = '';
    }

    setupInteractiveElements() {
        // Add smooth scrolling for anchor links
        document.querySelectorAll('.carrier-nav-item[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Initialize tooltips for help text
        this.initializeTooltips();
    }

    initializeTooltips() {
        // Add tooltip functionality to elements with title attribute
        document.querySelectorAll('.carrier-profile-container [title]').forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip);
            element.addEventListener('mouseleave', this.hideTooltip);
        });
    }

    showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'carrier-tooltip';
        tooltip.textContent = this.getAttribute('title');
        tooltip.style.cssText = `
            position: absolute;
            background: #1F2937;
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-size: 0.75rem;
            z-index: 1000;
            white-space: nowrap;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
        
        this.carrierTooltip = tooltip;
    }

    hideTooltip() {
        if (this.carrierTooltip) {
            this.carrierTooltip.remove();
            this.carrierTooltip = null;
        }
    }

    async saveProfile() {
        // Validate all forms before saving
        let allValid = true;
        
        document.querySelectorAll('.carrier-profile-form').forEach(form => {
            form.querySelectorAll('input, select, textarea').forEach(field => {
                if (!this.validateField(field)) {
                    allValid = false;
                }
            });
        });

        if (!allValid) {
            this.showNotification('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Show loading state
        const saveButton = document.getElementById('carrierSaveProfile');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveButton.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real application, you would send the data to your backend
            console.log('Saving profile data:', this.formData);
            
            this.showNotification('Perfil actualizado correctamente', 'success');
            this.calculateProfileCompletion();
            
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Error al guardar el perfil. Intenta nuevamente.', 'error');
        } finally {
            // Restore button state
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    }

    async savePreferences() {
        const saveButton = document.getElementById('carrierSavePreferences');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveButton.disabled = true;

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showNotification('Preferencias guardadas correctamente', 'success');
        } catch (error) {
            this.showNotification('Error al guardar las preferencias', 'error');
        } finally {
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }
    }

    resetPreferences() {
        if (confirm('¿Estás seguro de que quieres restablecer todas las preferencias a sus valores predeterminados?')) {
            document.getElementById('carrierPreferencesForm').reset();
            this.showNotification('Preferencias restablecidas', 'info');
        }
    }

    showPreview() {
        document.getElementById('carrierPreviewModal').classList.add('carrier-active');
    }

    hidePreview() {
        document.getElementById('carrierPreviewModal').classList.remove('carrier-active');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.carrier-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `carrier-notification carrier-notification-${type}`;
        notification.innerHTML = `
            <div class="carrier-notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="carrier-notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-large);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            animation: carrier-slideInRight 0.3s ease;
        `;

        // Close button
        notification.querySelector('.carrier-notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || '#3B82F6';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarrierProfile();
    
    // Add CSS for notifications and validation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes carrier-slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .carrier-notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        }
        
        .carrier-notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .carrier-valid {
            border-color: #10B981 !important;
        }
        
        .carrier-invalid {
            border-color: #EF4444 !important;
        }
    `;
    document.head.appendChild(style);
});

// Utility functions
const CarrierProfileUtils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }
};