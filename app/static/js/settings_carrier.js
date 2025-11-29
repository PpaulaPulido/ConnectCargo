// settings.js - Funcionalidades para la configuración (Versión Corregida)

class SettingsManager {
    constructor() {
        this.currentTab = 'account';
        this.originalData = {};
        this.hasChanges = false;
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupFormHandlers();
        this.setupEventListeners();
        this.setupPasswordStrength();
        this.loadOriginalData();
    }

    setupTabNavigation() {
        const navButtons = document.querySelectorAll('.settings-nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Actualizar navegación
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.settings-nav-btn[data-tab="${tabName}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.settings-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        
        // Scroll to top del contenido
        document.querySelector('.settings-content').scrollTo(0, 0);
    }

    setupFormHandlers() {
        // Formulario de cuenta
        const accountForm = document.getElementById('accountForm');
        if (accountForm) {
            accountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAccountSettings();
            });
        }

        // Formulario de contraseña
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Reset de formulario
        document.getElementById('resetAccountBtn')?.addEventListener('click', () => {
            this.resetAccountForm();
        });

        // Cambio de foto de perfil
        document.getElementById('changePhotoBtn')?.addEventListener('click', () => {
            this.changeProfilePhoto();
        });

        document.getElementById('removePhotoBtn')?.addEventListener('click', () => {
            this.removeProfilePhoto();
        });

        // Detectar cambios en formularios
        this.setupChangeDetection();
    }

    setupEventListeners() {
        // Cerrar sesiones
        document.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn.text-btn.danger')) {
                const sessionItem = e.target.closest('.session-item');
                this.closeSession(sessionItem);
            }
        });

        // Toggle switches
        document.querySelectorAll('.custom-toggle input').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                this.saveToggleSetting(e.target);
            });
        });

        // Radio buttons
        document.querySelectorAll('.radio-option input').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.saveRadioSetting(e.target);
            });
        });

        // Prevenir navegación si hay cambios sin guardar
        window.addEventListener('beforeunload', (e) => {
            if (this.hasChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    setupChangeDetection() {
        const formInputs = document.querySelectorAll('#accountForm input, #accountForm select');
        
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.checkForChanges();
            });
            
            input.addEventListener('change', () => {
                this.checkForChanges();
            });
        });
    }

    loadOriginalData() {
        const formInputs = document.querySelectorAll('#accountForm input, #accountForm select');
        
        this.originalData = {};
        formInputs.forEach(input => {
            this.originalData[input.name] = input.value;
        });
    }

    checkForChanges() {
        const formInputs = document.querySelectorAll('#accountForm input, #accountForm select');
        let hasChanges = false;

        formInputs.forEach(input => {
            if (this.originalData[input.name] !== input.value) {
                hasChanges = true;
            }
        });

        this.hasChanges = hasChanges;
        
        // Actualizar UI para mostrar que hay cambios
        const saveBtn = document.getElementById('saveAccountBtn');
        if (saveBtn) {
            if (hasChanges) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios •';
                saveBtn.style.background = 'linear-gradient(135deg, #EF4444, #F59E0B)';
            } else {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
                saveBtn.style.background = '';
            }
        }
    }

    async saveAccountSettings() {
        const form = document.getElementById('accountForm');
        const formData = new FormData(form);
        const saveBtn = document.getElementById('saveAccountBtn');

        try {
            // Mostrar estado de carga
            this.setButtonLoading(saveBtn, true);

            // Simular guardado en API
            await this.simulateAPICall('account', Object.fromEntries(formData));

            // Actualizar datos originales
            this.loadOriginalData();
            this.hasChanges = false;

            // Mostrar éxito
            this.showToast('Configuración guardada exitosamente', 'success');
            
            // Restaurar botón
            this.setButtonLoading(saveBtn, false);

        } catch (error) {
            this.showToast('Error al guardar la configuración', 'error');
            this.setButtonLoading(saveBtn, false);
        }
    }

    async changePassword() {
        const form = document.getElementById('passwordForm');
        const formData = new FormData(form);
        const saveBtn = form.querySelector('.action-btn.primary');

        // Validaciones básicas
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showToast('Por favor completa todos los campos', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        try {
            this.setButtonLoading(saveBtn, true);

            // Simular cambio de contraseña
            await this.simulateAPICall('password', {
                currentPassword,
                newPassword
            });

            // Limpiar formulario
            form.reset();
            this.updatePasswordStrength('');

            this.showToast('Contraseña actualizada exitosamente', 'success');
            this.setButtonLoading(saveBtn, false);

        } catch (error) {
            this.showToast('Error al cambiar la contraseña', 'error');
            this.setButtonLoading(saveBtn, false);
        }
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('newPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    updatePasswordStrength(password) {
        const strengthFill = document.querySelector('.strength-fill');
        const strengthLabel = document.querySelector('.strength-label');
        
        if (!strengthFill || !strengthLabel) return;

        let strength = 0;
        let text = 'Débil';

        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        switch (strength) {
            case 1:
                text = 'Débil';
                break;
            case 2:
                text = 'Media';
                break;
            case 3:
                text = 'Fuerte';
                break;
            case 4:
                text = 'Muy Fuerte';
                break;
            default:
                text = 'Débil';
        }

        strengthFill.setAttribute('data-strength', strength);
        strengthLabel.textContent = `Seguridad: ${text}`;
    }

    resetAccountForm() {
        if (!this.hasChanges) {
            this.showToast('No hay cambios para descartar', 'info');
            return;
        }

        if (confirm('¿Estás seguro de que quieres descartar los cambios?')) {
            const formInputs = document.querySelectorAll('#accountForm input, #accountForm select');
            
            formInputs.forEach(input => {
                input.value = this.originalData[input.name] || '';
            });

            this.hasChanges = false;
            this.showToast('Cambios descartados', 'info');
            
            // Restaurar botón
            const saveBtn = document.getElementById('saveAccountBtn');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
                saveBtn.style.background = '';
            }
        }
    }

    changeProfilePhoto() {
        // Crear input file temporal
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadProfilePhoto(file);
            }
        };
        
        input.click();
    }

    async uploadProfilePhoto(file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            this.showToast('Por favor selecciona una imagen válida', 'error');
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('La imagen debe ser menor a 5MB', 'error');
            return;
        }

        try {
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('profileImage').src = e.target.result;
            };
            reader.readAsDataURL(file);

            // Simular upload
            await this.simulateAPICall('profile-photo', { file });
            this.showToast('Foto de perfil actualizada', 'success');

        } catch (error) {
            this.showToast('Error al subir la foto', 'error');
        }
    }

    removeProfilePhoto() {
        if (confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
            document.getElementById('profileImage').src = '/static/images/default-avatar.jpg';
            this.showToast('Foto de perfil eliminada', 'info');
            
            // En una implementación real, llamarías a la API para eliminar la foto
            this.simulateAPICall('remove-profile-photo');
        }
    }

    closeSession(sessionItem) {
        if (confirm('¿Estás seguro de que quieres cerrar esta sesión?')) {
            sessionItem.style.opacity = '0.5';
            sessionItem.style.pointerEvents = 'none';
            
            setTimeout(() => {
                sessionItem.remove();
                this.showToast('Sesión cerrada exitosamente', 'success');
            }, 500);
        }
    }

    saveToggleSetting(toggle) {
        const settingName = toggle.closest('.toggle-setting-item').querySelector('h4').textContent;
        const isEnabled = toggle.checked;
        
        console.log(`Setting "${settingName}" ${isEnabled ? 'activado' : 'desactivado'}`);
        this.showToast(`Configuración ${isEnabled ? 'activada' : 'desactivada'}`, 'success');
    }

    saveRadioSetting(radio) {
        const settingName = radio.closest('.radio-settings-list').previousElementSibling.textContent;
        const value = radio.value;
        
        console.log(`Setting "${settingName}" cambiado a: ${value}`);
        this.showToast('Preferencia guardada', 'success');
    }

    // Utilidades
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        }
    }

    async simulateAPICall(endpoint, data) {
        // Simular llamada a API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular error aleatorio (10% de probabilidad)
                if (Math.random() < 0.1) {
                    reject(new Error('Error de conexión'));
                } else {
                    resolve({ success: true, data });
                }
            }, 1500);
        });
    }

    showToast(message, type = 'info') {
        // Reutilizar la función de toast de notifications.js si está disponible
        if (window.NotificationsManager) {
            window.NotificationsManager.showToast(message, type);
        } else {
            // Toast básico como fallback
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-main);
                border: 1px solid var(--border-light);
                border-radius: var(--border-radius);
                padding: 1rem 1.5rem;
                box-shadow: var(--shadow-large);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => toast.style.transform = 'translateX(0)', 100);
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});

// Exportar para uso global
window.SettingsManager = SettingsManager;