class CompanyProfile {
    constructor() {
        this.currentTab = 'legal';
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupFormInteractions();
        this.setupFileUploads();
        this.setupProgressTracking();
    }

    setupTabNavigation() {
        const navItems = document.querySelectorAll('.profile-nav-item');
        const tabContents = document.querySelectorAll('.profile-tab-content');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetTab = item.getAttribute('data-tab');
                this.switchTab(targetTab, item);
            });
        });
    }

    switchTab(tabName, clickedItem) {
        // Update navigation
        document.querySelectorAll('.profile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        clickedItem.classList.add('active');

        // Update content
        document.querySelectorAll('.profile-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.updateProgress();
    }

    setupFormInteractions() {
        // Form validation
        const forms = document.querySelectorAll('.profile-company-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(form);
            });
        });

        // Real-time validation
        const inputs = document.querySelectorAll('.profile-form-input, .profile-form-select, .profile-form-textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.updateProgress();
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('id');
        
        // Remove existing validation styles
        field.classList.remove('valid', 'invalid');
        
        if (field.hasAttribute('required') && !value) {
            field.classList.add('invalid');
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.classList.add('invalid');
                this.showFieldError(field, 'Ingresa un email válido');
                return false;
            }
        }
        
        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                field.classList.add('invalid');
                this.showFieldError(field, 'Ingresa una URL válida');
                return false;
            }
        }
        
        field.classList.add('valid');
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'profile-field-error';
        errorElement.style.cssText = `
            color: #EF4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.profile-field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    setupFileUploads() {
        const uploadButtons = document.querySelectorAll('.profile-upload-btn, .profile-doc-action');
        
        uploadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFileUpload(button);
            });
        });
    }

    handleFileUpload(button) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.jpg,.jpeg,.png';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processFileUpload(file, button);
            }
        });
        
        input.click();
    }

    processFileUpload(file, button) {
        // Simulate file upload
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        
        if (file.size > maxSize) {
            this.showNotification('El archivo es demasiado grande. Máximo 5MB.', 'error');
            return;
        }
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Tipo de archivo no permitido. Use PDF, JPG o PNG.', 'error');
            return;
        }
        
        // Simulate upload progress
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Subido';
            button.classList.remove('profile-btn-primary');
            button.classList.add('profile-btn-secondary');
            button.disabled = true;
            
            this.showNotification('Documento subido exitosamente', 'success');
            this.updateProgress();
        }, 2000);
    }

    setupProgressTracking() {
        this.updateProgress();
    }

    updateProgress() {
        // Calculate progress based on form completion
        const totalFields = document.querySelectorAll('.profile-form-input[required], .profile-form-select[required], .profile-form-textarea[required]').length;
        const completedFields = Array.from(document.querySelectorAll('.profile-form-input[required], .profile-form-select[required], .profile-form-textarea[required]'))
            .filter(field => field.value.trim() !== '').length;
        
        const progress = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
        
        const progressFill = document.querySelector('.profile-progress-fill');
        const progressPercent = document.querySelector('.profile-progress-percent');
        const statNumber = document.querySelector('.profile-stat-number');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${progress}%`;
        if (statNumber) statNumber.textContent = `${completedFields}/${totalFields}`;
    }

    handleFormSubmit(form) {
        const formData = new FormData(form);
        const formName = form.closest('.profile-tab-content').id.replace('-tab', '');
        
        // Simulate form submission
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitButton.disabled = true;
        
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            this.showNotification(`${this.getFormName(formName)} guardados exitosamente`, 'success');
            this.updateProgress();
        }, 1500);
    }

    getFormName(formId) {
        const formNames = {
            'legal': 'Datos legales',
            'commercial': 'Datos comerciales',
            'logistics': 'Preferencias logísticas',
            'security': 'Configuración de seguridad'
        };
        
        return formNames[formId] || 'Datos';
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.profile-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `profile-notification profile-notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-large);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CompanyProfile();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .profile-form-input.valid {
            border-color: #10B981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .profile-form-input.invalid {
            border-color: #EF4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
    `;
    document.head.appendChild(style);
});