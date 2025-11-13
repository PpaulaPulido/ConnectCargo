// Utility functions for carrier dashboard

class CarrierUtils {
    // Format currency
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Format date
    static formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('es-MX', { ...defaultOptions, ...options });
    }

    // Format time
    static formatTime(date) {
        return new Date(date).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Calculate distance between coordinates (Haversine formula)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c;
    }

    static deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Estimate travel time
    static estimateTravelTime(distanceKm, averageSpeed = 60) {
        const hours = distanceKm / averageSpeed;
        const totalMinutes = Math.round(hours * 60);
        
        if (totalMinutes < 60) {
            return `${totalMinutes} min`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
        }
    }

    // Generate random ID
    static generateId(prefix = '') {
        return prefix + Math.random().toString(36).substr(2, 9);
    }

    // Debounce function
    static debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Local storage utilities
    static setStorage(key, value) {
        try {
            localStorage.setItem(`carrier_${key}`, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`carrier_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    static removeStorage(key) {
        try {
            localStorage.removeItem(`carrier_${key}`);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Notification utilities
    static showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-large);
                    padding: 1rem 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid;
                }
                .notification-success { border-left-color: #10B981; }
                .notification-error { border-left-color: #EF4444; }
                .notification-warning { border-left-color: #F59E0B; }
                .notification-info { border-left-color: #3B82F6; }
                .notification-content { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
                .notification-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.7; }
                .notification-close:hover { opacity: 1; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after duration
        const autoRemove = setTimeout(() => {
            notification.remove();
        }, duration);

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoRemove);
            notification.remove();
        });

        return notification;
    }

    static getNotificationIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Form validation
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        return re.test(cleanPhone);
    }

    // API request helper
    static async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };

        try {
            const response = await fetch(endpoint, { ...defaultOptions, ...options });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Load animation
    static showLoading(element) {
        element.classList.add('loading');
        element.disabled = true;
    }

    static hideLoading(element) {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CarrierUtils;
}