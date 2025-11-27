class CompanySettings {
    constructor() {
        this.currentTab = 'profile';
        this.unsavedChanges = false;
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupLogoUpload();
        this.setupPasswordForm();
    }

    setupTabNavigation() {
        const navItems = document.querySelectorAll('.settings-nav-item[data-tab]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = item.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Actualizar navegación
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.classList.remove('settings-nav-active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('settings-nav-active');

        // Mostrar pestaña correspondiente
        document.querySelectorAll('.settings-company-tab').forEach(tab => {
            tab.classList.remove('settings-tab-active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('settings-tab-active');

        this.currentTab = tabName;
    }

    setupEventListeners() {
        // Guardar configuración
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Restablecer configuración
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.showConfirmationModal(
                'Restablecer configuración',
                '¿Estás seguro de que quieres restablecer todos los cambios? Se perderán las modificaciones no guardadas.',
                () => this.resetSettings()
            );
        });

        // Cerrar todas las sesiones
        document.getElementById('logoutAll').addEventListener('click', () => {
            this.showConfirmationModal(
                'Cerrar todas las sesiones',
                'Se cerrarán todas las sesiones activas excepto la actual. Tendrás que iniciar sesión nuevamente en otros dispositivos.',
                () => this.logoutAllSessions()
            );
        });

        // Detectar cambios en formularios
        const formElements = document.querySelectorAll('.settings-form-input, .settings-form-select');
        formElements.forEach(element => {
            element.addEventListener('change', () => {
                this.unsavedChanges = true;
                this.updateSaveButton();
            });
        });
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('.settings-company-tab');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const errorElement = field.parentElement.querySelector('.settings-error-message') || 
                           this.createErrorElement(field.parentElement);

        // Limpiar error previo
        errorElement.textContent = '';
        field.classList.remove('settings-error');

        // Validaciones específicas
        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            errorElement.textContent = 'Por favor ingresa un email válido';
            field.classList.add('settings-error');
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            errorElement.textContent = 'Por favor ingresa un número de teléfono válido';
            field.classList.add('settings-error');
        } else if (field.hasAttribute('required') && !value) {
            errorElement.textContent = 'Este campo es obligatorio';
            field.classList.add('settings-error');
        }
    }

    createErrorElement(parent) {
        const errorElement = document.createElement('div');
        errorElement.className = 'settings-error-message';
        errorElement.style.cssText = `
            color: #EF4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        parent.appendChild(errorElement);
        return errorElement;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    setupLogoUpload() {
        const uploadBtn = document.getElementById('uploadLogo');
        const removeBtn = document.getElementById('removeLogo');
        const logoInput = document.getElementById('settingsLogoInput');
        const logoPreview = document.getElementById('settingsLogoPreview');

        uploadBtn.addEventListener('click', () => {
            logoInput.click();
        });

        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (this.validateLogoFile(file)) {
                    this.previewLogo(file, logoPreview);
                    removeBtn.disabled = false;
                    this.unsavedChanges = true;
                    this.updateSaveButton();
                }
            }
        });

        removeBtn.addEventListener('click', () => {
            logoPreview.style.display = 'none';
            logoPreview.src = '';
            logoInput.value = '';
            removeBtn.disabled = true;
            this.unsavedChanges = true;
            this.updateSaveButton();
        });
    }

    validateLogoFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!validTypes.includes(file.type)) {
            this.showNotification('Por favor selecciona una imagen válida (JPEG, PNG, GIF)', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification('La imagen debe ser menor a 2MB', 'error');
            return false;
        }

        return true;
    }

    previewLogo(file, previewElement) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewElement.src = e.target.result;
            previewElement.style.display = 'block';
            previewElement.parentElement.querySelector('.settings-logo-placeholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    setupPasswordForm() {
        const changeBtn = document.getElementById('changePassword');
        const cancelBtn = document.getElementById('cancelPassword');
        const saveBtn = document.getElementById('savePassword');
        const passwordForm = document.getElementById('settingsPasswordForm');

        changeBtn.addEventListener('click', () => {
            passwordForm.style.display = 'block';
            changeBtn.style.display = 'none';
        });

        cancelBtn.addEventListener('click', () => {
            passwordForm.style.display = 'none';
            changeBtn.style.display = 'block';
            this.clearPasswordForm();
        });

        saveBtn.addEventListener('click', () => {
            if (this.validatePasswordForm()) {
                this.savePassword();
            }
        });

        // Validación de fortaleza de contraseña
        const newPassword = document.getElementById('newPassword');
        newPassword.addEventListener('input', () => {
            this.updatePasswordStrength(newPassword.value);
        });
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.settings-strength-bar');
        const strengthText = document.querySelector('.settings-strength-text');

        let strength = 0;
        let color = '#EF4444';
        let text = 'Débil';

        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;

        if (strength >= 75) {
            color = '#10B981';
            text = 'Fuerte';
        } else if (strength >= 50) {
            color = '#F59E0B';
            text = 'Moderada';
        }

        strengthBar.style.background = color;
        strengthBar.style.width = strength + '%';
        strengthText.textContent = `Seguridad: ${text}`;
        strengthText.style.color = color;
    }

    validatePasswordForm() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword) {
            this.showNotification('Por favor ingresa tu contraseña actual', 'error');
            return false;
        }

        if (newPassword.length < 8) {
            this.showNotification('La nueva contraseña debe tener al menos 8 caracteres', 'error');
            return false;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return false;
        }

        return true;
    }

    savePassword() {
        this.showNotification('Contraseña actualizada correctamente', 'success');
        document.getElementById('settingsPasswordForm').style.display = 'none';
        document.getElementById('changePassword').style.display = 'block';
        this.clearPasswordForm();
    }

    clearPasswordForm() {
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        this.updatePasswordStrength('');
    }

    saveSettings() {
        // Simular guardado de configuración
        this.showNotification('Configuración guardada correctamente', 'success');
        this.unsavedChanges = false;
        this.updateSaveButton();
    }

    resetSettings() {
        // Simular restablecimiento
        this.showNotification('Configuración restablecida a los valores por defecto', 'info');
        this.unsavedChanges = false;
        this.updateSaveButton();
    }

    logoutAllSessions() {
        this.showNotification('Todas las sesiones han sido cerradas', 'success');
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('saveSettings');
        if (this.unsavedChanges) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        } else {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Todo Guardado';
        }
    }

    showConfirmationModal(title, message, confirmCallback) {
        const modal = document.getElementById('settingsConfirmationModal');
        const modalMessage = document.getElementById('settingsModalMessage');
        const confirmBtn = document.getElementById('settingsModalConfirm');
        const cancelBtn = document.getElementById('settingsModalCancel');
        const closeBtn = document.getElementById('settingsModalClose');

        modalMessage.textContent = message;
        modal.classList.add('settings-show');

        const closeModal = () => {
            modal.classList.remove('settings-show');
        };

        confirmBtn.onclick = () => {
            confirmCallback();
            closeModal();
        };

        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;

        // Cerrar modal al hacer click fuera
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.settings-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `settings-notification settings-notification-${type}`;
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
            animation: settingsSlideInRight 0.3s ease;
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
            notification.style.animation = 'settingsSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes settingsSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes settingsSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }

        .settings-error {
            border-color: #EF4444 !important;
        }

        .settings-error-message {
            color: #EF4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        }
    `;
    document.head.appendChild(style);

    // Initialize the settings functionality
    window.companySettings = new CompanySettings();
});