// Utility Functions - Reutilizables en toda la aplicación

class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    static validatePassword(password) {
        const rules = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        
        return {
            isValid: Object.values(rules).every(Boolean),
            rules: rules
        };
    }

    static showValidation(element, isValid, message = '') {
        const formGroup = element.closest('.form-group');
        const feedback = formGroup.querySelector('.form-feedback');
        
        element.classList.remove('error', 'success');
        feedback.classList.remove('error', 'success');
        feedback.textContent = '';
        
        if (message) {
            element.classList.add(isValid ? 'success' : 'error');
            feedback.classList.add(isValid ? 'success' : 'error');
            feedback.textContent = message;
        }
        
        return isValid;
    }
}

class AnimationHelper {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    static fadeOut(element, duration = 300) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    }

    static slideDown(element, duration = 300) {
        element.style.display = 'block';
        const height = element.offsetHeight;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        
        const start = performance.now();
        
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = AnimationHelper.easeOutQuart(progress);
            
            element.style.height = `${height * ease}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    }

    static slideUp(element, duration = 300) {
        const height = element.offsetHeight;
        element.style.height = `${height}px`;
        element.style.overflow = 'hidden';
        
        const start = performance.now();
        
        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = AnimationHelper.easeOutQuart(progress);
            
            element.style.height = `${height * (1 - ease)}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
            }
        }
        
        requestAnimationFrame(animate);
    }

    static easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
    }
}

class DOMHelper {
    static createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
        
        setTimeout(() => circle.remove(), 600);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

class StorageHelper {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
}

class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        // Reutilizar el sistema de flash messages o crear notificaciones toast
        const flashMessages = document.querySelector('.flash-messages');
        if (flashMessages) {
            const notification = document.createElement('div');
            notification.className = `flash-message flash-${type}`;
            notification.innerHTML = `
                <span class="flash-icon">
                    <i class="fas fa-${this.getIcon(type)}"></i>
                </span>
                <span class="flash-text">${message}</span>
                <button class="flash-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            flashMessages.appendChild(notification);
            
            if (duration > 0) {
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, duration);
            }
        }
    }

    static getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

window.FormValidator = FormValidator;
window.AnimationHelper = AnimationHelper;
window.DOMHelper = DOMHelper;
window.StorageHelper = StorageHelper;
window.NotificationManager = NotificationManager;