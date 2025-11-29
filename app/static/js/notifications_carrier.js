// notifications.js - Funcionalidades para el sistema de notificaciones

class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNotifications();
        this.setupFilterTabs();
        this.setupActionHandlers();
    }

    setupEventListeners() {
        // Marcar todas como leídas
        document.getElementById('markAllRead')?.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Limpiar todas las notificaciones
        document.getElementById('clearAll')?.addEventListener('click', () => {
            this.clearAllNotifications();
        });

        // Actualizar notificaciones
        document.getElementById('refreshNotifications')?.addEventListener('click', () => {
            this.refreshNotifications();
        });

        // Cerrar notificaciones individuales
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification-close')) {
                const closeBtn = e.target.closest('.notification-close');
                const notificationId = closeBtn.getAttribute('data-id');
                this.removeNotification(notificationId);
            }
        });

        // Manejar acciones de notificación
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action]')) {
                const actionBtn = e.target.closest('[data-action]');
                const action = actionBtn.getAttribute('data-action');
                const notificationItem = actionBtn.closest('.notification-item');
                const notificationId = notificationItem.getAttribute('data-id');
                
                this.handleNotificationAction(action, notificationId, notificationItem);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    setupFilterTabs() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Update active state
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    setupActionHandlers() {
        // Aquí puedes agregar manejadores específicos para diferentes acciones
        console.log('Action handlers setup complete');
    }

    loadNotifications() {
        // En una implementación real, esto cargaría desde una API
        // Por ahora, usamos las notificaciones estáticas del HTML
        
        const notificationItems = document.querySelectorAll('.notification-item');
        this.notifications = Array.from(notificationItems).map(item => ({
            id: item.getAttribute('data-id'),
            type: item.getAttribute('data-type'),
            isUnread: item.classList.contains('unread'),
            element: item
        }));

        this.updateUnreadCount();
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        
        this.notifications.forEach(notification => {
            const shouldShow = 
                filter === 'all' ||
                (filter === 'unread' && notification.isUnread) ||
                (filter === notification.type);
            
            if (shouldShow) {
                notification.element.classList.remove('hidden');
            } else {
                notification.element.classList.add('hidden');
            }
        });

        this.checkEmptyState();
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && notification.isUnread) {
            notification.isUnread = false;
            notification.element.classList.remove('unread');
            this.updateUnreadCount();
            
            // Mostrar feedback visual
            this.showToast('Notificación marcada como leída', 'success');
        }
    }

    markAllAsRead() {
        let markedCount = 0;
        
        this.notifications.forEach(notification => {
            if (notification.isUnread) {
                notification.isUnread = false;
                notification.element.classList.remove('unread');
                markedCount++;
            }
        });

        this.updateUnreadCount();
        
        if (markedCount > 0) {
            this.showToast(`${markedCount} notificaciones marcadas como leídas`, 'success');
        } else {
            this.showToast('No hay notificaciones sin leer', 'info');
        }
    }

    removeNotification(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            // Animación de salida
            notification.element.classList.add('removing');
            
            setTimeout(() => {
                notification.element.remove();
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
                this.updateUnreadCount();
                this.checkEmptyState();
                
                this.showToast('Notificación eliminada', 'info');
            }, 300);
        }
    }

    clearAllNotifications() {
        if (this.notifications.length === 0) {
            this.showToast('No hay notificaciones para limpiar', 'info');
            return;
        }

        if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
            const notificationsToRemove = [...this.notifications];
            
            notificationsToRemove.forEach(notification => {
                notification.element.classList.add('removing');
            });

            setTimeout(() => {
                notificationsToRemove.forEach(notification => {
                    notification.element.remove();
                });
                
                this.notifications = [];
                this.updateUnreadCount();
                this.checkEmptyState();
                
                this.showToast('Todas las notificaciones han sido eliminadas', 'success');
            }, 300);
        }
    }

    refreshNotifications() {
        // Simular carga de nuevas notificaciones
        const refreshBtn = document.getElementById('refreshNotifications');
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        refreshBtn.disabled = true;

        // Simular llamada a API
        setTimeout(() => {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            this.showToast('Notificaciones actualizadas', 'success');
        }, 1500);
    }

    handleNotificationAction(action, notificationId, notificationElement) {
        console.log(`Action: ${action}, Notification: ${notificationId}`);
        
        // Marcar como leída al interactuar
        this.markAsRead(notificationId);

        // Manejar diferentes acciones
        switch (action) {
            case 'view-load':
                this.showToast('Redirigiendo a carga disponible...', 'info');
                // window.location.href = `/carrier/loads/${notificationId}`;
                break;
                
            case 'dismiss':
                this.removeNotification(notificationId);
                break;
                
            case 'view-receipt':
                this.showToast('Abriendo comprobante de pago...', 'info');
                // window.location.href = `/carrier/payments/${notificationId}`;
                break;
                
            case 'view-rating':
                this.showToast('Mostrando calificación...', 'info');
                // window.location.href = `/carrier/ratings/${notificationId}`;
                break;
                
            case 'upload-docs':
                this.showToast('Redirigiendo a documentos...', 'info');
                // window.location.href = '/carrier/documents';
                break;
                
            default:
                console.log('Acción no reconocida:', action);
        }
    }

    updateUnreadCount() {
        const unreadCount = this.notifications.filter(n => n.isUnread).length;
        
        // Actualizar badge en el sidebar (si existe)
        const sidebarBadge = document.querySelector('.sidebar .badge');
        if (sidebarBadge) {
            sidebarBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            sidebarBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }

        // Actualizar counts en los filtros
        this.updateFilterCounts();
    }

    updateFilterCounts() {
        const filters = ['all', 'unread', 'system', 'trips', 'payments'];
        
        filters.forEach(filter => {
            const count = this.getNotificationCount(filter);
            const badge = document.querySelector(`.filter-tab[data-filter="${filter}"] .count-badge`);
            if (badge) {
                badge.textContent = count > 99 ? '99+' : count;
            }
        });
    }

    getNotificationCount(filter) {
        switch (filter) {
            case 'all':
                return this.notifications.length;
            case 'unread':
                return this.notifications.filter(n => n.isUnread).length;
            default:
                return this.notifications.filter(n => n.type === filter).length;
        }
    }

    checkEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const visibleNotifications = this.notifications.filter(n => 
            !n.element.classList.contains('hidden')
        ).length;

        if (visibleNotifications === 0 && this.notifications.length > 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        // Crear toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Estilos para el toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-main);
            border: 1px solid var(--border-light);
            border-radius: var(--border-radius);
            padding: 1rem 1.5rem;
            box-shadow: var(--shadow-large);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Cerrar toast
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => this.removeToast(toast);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    removeToast(toast) {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    closeAllDropdowns() {
        // Cerrar cualquier dropdown abierto
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new NotificationsManager();
});

// Exportar para uso global si es necesario
window.NotificationsManager = NotificationsManager;