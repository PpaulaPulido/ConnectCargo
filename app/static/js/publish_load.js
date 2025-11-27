class PublishLoad {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDateRestrictions();
        this.updateStepDisplay();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('publishLoadForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        // Real-time validation
        const requiredFields = document.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
        });

        // Budget formatting
        const budgetInput = document.getElementById('budget');
        if (budgetInput) {
            budgetInput.addEventListener('input', (e) => {
                this.formatBudget(e.target);
            });
        }
    }

    setupDateRestrictions() {
        const today = new Date().toISOString().split('T')[0];
        const pickupDate = document.getElementById('pickupDate');
        const deliveryDate = document.getElementById('deliveryDate');

        if (pickupDate) {
            pickupDate.min = today;
            pickupDate.addEventListener('change', () => {
                if (deliveryDate) {
                    deliveryDate.min = pickupDate.value;
                    if (deliveryDate.value && deliveryDate.value < pickupDate.value) {
                        deliveryDate.value = pickupDate.value;
                    }
                }
            });
        }
    }

    nextStep(step) {
        if (!this.validateStep(this.currentStep)) {
            this.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        this.currentStep = step;
        this.updateStepDisplay();
        this.updateConfirmationSummary();
        
        if (step === 4) {
            this.calculateCommission();
        }
    }

    previousStep(step) {
        this.currentStep = step;
        this.updateStepDisplay();
    }

    validateStep(step) {
        const currentStepElement = document.querySelector(`[data-step="${step}"]`);
        const requiredFields = currentStepElement.querySelectorAll('[required]');
        
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        
        // Remove existing validation styles
        field.classList.remove('publish-valid', 'publish-invalid');
        
        if (field.hasAttribute('required') && !value) {
            field.classList.add('publish-invalid');
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.classList.add('publish-invalid');
                this.showFieldError(field, 'Ingresa un email válido');
                return false;
            }
        }
        
        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                field.classList.add('publish-invalid');
                this.showFieldError(field, 'Ingresa una URL válida');
                return false;
            }
        }
        
        // Number validation
        if (field.type === 'number' && value) {
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');
            
            if (min && parseFloat(value) < parseFloat(min)) {
                field.classList.add('publish-invalid');
                this.showFieldError(field, `El valor mínimo es ${min}`);
                return false;
            }
            
            if (max && parseFloat(value) > parseFloat(max)) {
                field.classList.add('publish-invalid');
                this.showFieldError(field, `El valor máximo es ${max}`);
                return false;
            }
        }
        
        field.classList.add('publish-valid');
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'publish-field-error';
        errorElement.style.cssText = `
            color: #EF4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.publish-field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    updateStepDisplay() {
        // Update steps visual
        document.querySelectorAll('.publish-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Show current step content
        document.querySelectorAll('.publish-form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateConfirmationSummary() {
        // Origin and destination
        const originCity = document.getElementById('originCity');
        const destinationCity = document.getElementById('destinationCity');
        const originAddress = document.getElementById('originAddress');
        const destinationAddress = document.getElementById('destinationAddress');
        const pickupDate = document.getElementById('pickupDate');
        const deliveryDate = document.getElementById('deliveryDate');

        if (originCity && destinationCity) {
            document.getElementById('confirmOrigin').textContent = 
                `${this.getSelectedText(originCity)} - ${originAddress?.value || ''}`;
            document.getElementById('confirmDestination').textContent = 
                `${this.getSelectedText(destinationCity)} - ${destinationAddress?.value || ''}`;
        }

        if (pickupDate && deliveryDate) {
            document.getElementById('confirmDates').textContent = 
                `${this.formatDate(pickupDate.value)} al ${this.formatDate(deliveryDate.value)}`;
        }

        // Cargo details
        const cargoType = document.getElementById('cargoType');
        const totalWeight = document.getElementById('totalWeight');
        const length = document.getElementById('length');
        const width = document.getElementById('width');
        const height = document.getElementById('height');

        if (cargoType) {
            document.getElementById('confirmCargoType').textContent = this.getSelectedText(cargoType);
        }

        if (totalWeight) {
            document.getElementById('confirmWeight').textContent = `${totalWeight.value} kg`;
        }

        if (length && width && height) {
            const dimensions = [length.value, width.value, height.value].filter(Boolean);
            document.getElementById('confirmDimensions').textContent = 
                dimensions.length > 0 ? `${dimensions.join(' x ')} m` : 'No especificado';
        }

        // Requirements
        const vehicleType = document.getElementById('vehicleType');
        const budget = document.getElementById('budget');
        const equipment = document.querySelectorAll('input[name="equipment"]:checked');

        if (vehicleType) {
            document.getElementById('confirmVehicle').textContent = this.getSelectedText(vehicleType);
        }

        if (budget && budget.value) {
            document.getElementById('confirmBudget').textContent = 
                `$${parseInt(budget.value).toLocaleString('es-CO')} COP`;
        }

        if (equipment.length > 0) {
            const equipmentLabels = Array.from(equipment).map(cb => {
                return cb.parentNode.textContent.trim();
            });
            document.getElementById('confirmEquipment').textContent = equipmentLabels.join(', ');
        }
    }

    getSelectedText(selectElement) {
        return selectElement.options[selectElement.selectedIndex]?.text || '-';
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    formatBudget(input) {
        let value = input.value.replace(/\D/g, '');
        if (value) {
            value = parseInt(value).toLocaleString('es-CO');
            input.value = value;
        }
    }

    calculateCommission() {
        const budget = document.getElementById('budget');
        if (budget && budget.value) {
            const budgetValue = parseInt(budget.value.replace(/\D/g, ''));
            const commission = budgetValue * 0.05;
            // You could display this commission somewhere if needed
            console.log('Commission calculated:', commission);
        }
    }

    handleFormSubmission() {
        const termsCheckbox = document.getElementById('termsAcceptance');
        
        if (!termsCheckbox.checked) {
            this.showNotification('Debes aceptar los términos y condiciones', 'error');
            return;
        }

        // Collect all form data
        this.collectFormData();

        // Simulate form submission
        const submitButton = document.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        submitButton.disabled = true;

        // Simulate API call
        setTimeout(() => {
            this.showNotification('¡Carga publicada exitosamente!', 'success');
            
            // Redirect to loads page after success
            setTimeout(() => {
                window.location.href = '/company/published-loads';
            }, 2000);
            
        }, 2000);
    }

    collectFormData() {
        // This would collect all form data for submission
        const form = document.getElementById('publishLoadForm');
        const formData = new FormData(form);
        
        // Convert to regular object
        this.formData = Object.fromEntries(formData.entries());
        
        // Add additional data
        this.formData.timestamp = new Date().toISOString();
        this.formData.status = 'published';
        
        console.log('Form data collected:', this.formData);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.publish-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `publish-notification publish-notification-${type}`;
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
            animation: publishSlideInRight 0.3s ease;
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
            notification.style.animation = 'publishSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Global functions for button clicks
function nextStep(step) {
    window.publishLoad.nextStep(step);
}

function previousStep(step) {
    window.publishLoad.previousStep(step);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.publishLoad = new PublishLoad();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes publishSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes publishSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .publish-form-input.publish-valid {
            border-color: #10B981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        
        .publish-form-input.publish-invalid {
            border-color: #EF4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
    `;
    document.head.appendChild(style);
});