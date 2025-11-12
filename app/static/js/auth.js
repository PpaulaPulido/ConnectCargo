class Auth {
    constructor() {
        this.isLoginPage = document.getElementById('loginForm') !== null;
        this.isRegisterPage = document.getElementById('registerForm') !== null;
        this.isForgotPasswordPage = document.getElementById('forgotPasswordForm') !== null;
        
        this.form = this.isLoginPage ? document.getElementById('loginForm') : 
                     this.isRegisterPage ? document.getElementById('registerForm') :
                     this.isForgotPasswordPage ? document.getElementById('forgotPasswordForm') : null;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.setupFlashMessages();
        
        if (this.isRegisterPage) {
            this.setupRealTimeValidation();
            this.setupPasswordStrength();
        }
        
        if (this.isForgotPasswordPage) {
            this.setupForgotPasswordValidation();
        }
        
        this.setupInputAnimations();
        this.setupFloatingLabels();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePassword(e));
        });

        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input, true));
            input.addEventListener('focus', () => this.animateInput(input));
        });

        if (this.isRegisterPage) {
            document.querySelectorAll('.form-select').forEach(select => {
                select.addEventListener('change', () => this.validateField(select));
                select.addEventListener('focus', () => this.animateInput(select));
            });
        }
    }

    setupFloatingLabels() {
        document.querySelectorAll('.form-input').forEach(input => {
            const label = input.closest('.form-group').querySelector('.form-label');
            
            input.addEventListener('focus', () => {
                label.style.color = 'var(--accent-primary)';
                label.style.transform = 'translateY(-2px)';
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    label.style.color = 'var(--text-light)';
                    label.style.transform = 'translateX(0)';
                }
            });

            // Inicializar estado si hay valor
            if (input.value) {
                label.style.color = 'var(--accent-primary)';
            }
        });
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('.form-input, .form-select');
        inputs.forEach((input, index) => {
            input.style.animationDelay = `${index * 0.1}s`;
            input.style.opacity = '0';
            input.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                input.style.opacity = '1';
                input.style.transform = 'translateY(0)';
                input.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }, index * 100);
        });

        // Animación para elementos de información
        const infoElements = document.querySelectorAll('.form-info');
        infoElements.forEach((element, index) => {
            element.style.animationDelay = `${(index + inputs.length) * 0.1}s`;
            element.style.opacity = '0';
            element.style.transform = 'translateX(-30px)';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
                element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }, (index + inputs.length) * 100);
        });
    }

    setupRealTimeValidation() {
        if (!this.isRegisterPage) return;

        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', () => {
            this.validateEmail(emailInput.value);
        });

        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                this.validatePhone(phoneInput.value);
            });
        }

        const confirmPassword = document.getElementById('confirm_password');
        if (confirmPassword) {
            confirmPassword.addEventListener('blur', () => {
                this.validatePasswordMatch();
            });
        }
    }

    setupForgotPasswordValidation() {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput.value);
            });
        }
    }

    setupPasswordStrength() {
        if (!this.isRegisterPage) return;

        const passwordInput = document.getElementById('password');
        const strengthBar = document.querySelector('.password-strength');
        const strengthProgress = document.querySelector('.strength-progress');
        const strengthText = document.querySelector('.strength-text');

        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', (e) => {
                const password = e.target.value;
                if (password) {
                    strengthBar.style.display = 'block';
                    strengthBar.classList.add('visible');
                    const strength = this.calculatePasswordStrength(password);
                    strengthProgress.className = 'strength-progress ' + strength.class;
                    strengthText.textContent = strength.text;
                    strengthText.style.color = strength.color;
                } else {
                    strengthBar.style.display = 'none';
                    strengthBar.classList.remove('visible');
                }
            });
        }
    }

    setupFlashMessages() {
        document.querySelectorAll('.flash-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const flashMessage = this.closest('.flash-message');
                flashMessage.style.opacity = '0';
                flashMessage.style.transform = 'translateX(-30px)';
                setTimeout(() => flashMessage.remove(), 300);
            });
        });

        setTimeout(() => {
            document.querySelectorAll('.flash-message').forEach(msg => {
                msg.style.opacity = '0';
                msg.style.transform = 'translateX(-30px)';
                setTimeout(() => msg.remove(), 300);
            });
        }, 5000);
    }

    calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (password.length >= 12) score++;

        if (score <= 2) return { class: 'weak', text: 'Contraseña débil', color: '#FCA5A5' };
        if (score <= 3) return { class: 'medium', text: 'Contraseña media', color: '#FCD34D' };
        return { class: 'strong', text: 'Contraseña fuerte', color: '#86EFAC' };
    }

    animateInput(input) {
        input.style.transform = 'translateY(-2px) scale(1.02)';
        const icon = input.previousElementSibling;
        if (icon && icon.classList.contains('input-icon')) {
            icon.style.color = 'var(--accent-primary)';
            icon.style.transform = 'translateY(-50%) scale(1.1)';
        }
        
        setTimeout(() => {
            input.style.transform = 'translateY(-2px) scale(1)';
            if (icon && icon.classList.contains('input-icon')) {
                icon.style.color = '';
                icon.style.transform = 'translateY(-50%)';
            }
        }, 300);
    }

    validateField(input, showError = false) {
        const value = input.value.trim();
        const feedback = input.closest('.form-group').querySelector('.form-feedback');
        
        input.classList.remove('error', 'success');
        feedback.textContent = '';

        if (!value && showError) {
            input.classList.add('error');
            feedback.textContent = 'Este campo es requerido';
            this.animateError(input);
            return false;
        }

        if (value) {
            input.classList.add('success');
        }

        return true;
    }

    validateEmail(email) {
        const emailInput = document.getElementById('email');
        const feedback = emailInput.closest('.form-group').querySelector('.form-feedback');
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailInput.classList.add('error');
            feedback.textContent = 'Por favor ingresa un email válido';
            this.animateError(emailInput);
            return false;
        }

        emailInput.classList.add('success');
        feedback.textContent = '';
        return true;
    }

    validatePhone(phone) {
        const phoneInput = document.getElementById('phone');
        const feedback = phoneInput.closest('.form-group').querySelector('.form-feedback');
        
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
            phoneInput.classList.add('error');
            feedback.textContent = 'Por favor ingresa un número válido';
            this.animateError(phoneInput);
            return false;
        }

        phoneInput.classList.add('success');
        feedback.textContent = '';
        return true;
    }

    validatePasswordMatch() {
        if (!this.isRegisterPage) return true;

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password');
        const feedback = confirmPassword.closest('.form-group').querySelector('.form-feedback');
        
        if (password !== confirmPassword.value && confirmPassword.value) {
            confirmPassword.classList.add('error');
            feedback.textContent = 'Las contraseñas no coinciden';
            this.animateError(confirmPassword);
            return false;
        }

        if (confirmPassword.value) {
            confirmPassword.classList.add('success');
            feedback.textContent = '';
        }
        
        return true;
    }

    togglePassword(event) {
        const button = event.currentTarget;
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
            button.style.color = 'var(--accent-primary)';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
            button.style.color = '';
        }
        
        // Animación del botón
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = this.form.querySelector('.submit-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simular envío al servidor con diferentes tiempos
        let delay = 1500;
        if (this.isRegisterPage) delay = 2000;
        if (this.isForgotPasswordPage) delay = 1800;

        await new Promise(resolve => setTimeout(resolve, delay));

        this.form.submit();
    }

    validateForm() {
        let isValid = true;

        const requiredFields = this.form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            }
        });

        const email = document.getElementById('email').value;
        if (email && !this.validateEmail(email)) {
            isValid = false;
        }

        if (this.isRegisterPage) {
            const phone = document.getElementById('phone').value;
            if (phone && !this.validatePhone(phone)) {
                isValid = false;
            }

            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            if (password && confirmPassword && password !== confirmPassword) {
                this.showFieldError(document.getElementById('confirm_password'), 'Las contraseñas no coinciden');
                isValid = false;
            }

            if (!document.getElementById('terms').checked) {
                this.showFieldError(document.getElementById('terms'), 'Debes aceptar los términos y condiciones');
                isValid = false;
            }
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        const feedback = field.closest('.form-group').querySelector('.form-feedback');
        feedback.textContent = message;
        this.animateError(field);
    }

    animateError(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});