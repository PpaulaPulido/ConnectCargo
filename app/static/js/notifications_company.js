class CompanyNotifications {
    constructor() {
        this.currentFilter = 'all';
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNotifications();
        this.setupFilters();
        this.setupSettingsModal();
    }

    setupEventListeners() {
        // Marcar todas como leídas
        const markAllRead = document.getElementById('markAllRead');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Configuración de notificaciones
        const settingsBtn = document.getElementById('notificationSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }

        // Buscar notificaciones
        const checkNotifications = document.getElementById('checkForNotifications');
        if (checkNotifications) {
            checkNotifications.addEventListener('click', () => {
                this.checkForNewNotifications();
            });
        }

        // Ordenar notificaciones
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortNotifications(e.target.value);
            });
        }

        // Delegación de eventos para acciones de notificaciones
        document.addEventListener('click', (e) => {
            // Acciones de botones principales
            if (e.target.closest('[data-action]')) {
                const button = e.target.closest('[data-action]');
                const action = button.getAttribute('data-action');
                const notificationItem = button.closest('.notifications-item');
                this.handleNotificationAction(action, notificationItem);
            }

            // Acciones de iconos mini
            if (e.target.closest('.notifications-action-icon')) {
                const icon = e.target.closest('.notifications-action-icon');
                const action = icon.getAttribute('data-action');
                const notificationItem = icon.closest('.notifications-item');
                this.handleNotificationAction(action, notificationItem);
            }
        });
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.notifications-filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Actualizar botones activos
                filterButtons.forEach(btn => btn.classList.remove('notifications-filter-active'));
                e.target.classList.add('notifications-filter-active');
            });
        });
    }

    setupSettingsModal() {
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('settingsModalClose');
        const cancelBtn = document.getElementById('settingsCancel');
        const saveBtn = document.getElementById('settingsSave');

        const closeModal = () => {
            modal.classList.remove('notifications-show');
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        saveBtn.addEventListener('click', () => {
            this.saveNotificationSettings();
            closeModal();
        });

        // Cerrar modal al hacer click fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    loadNotifications() {
        // Simular carga de notificaciones
        this.notifications = [
            {
                id: 1,
                type: 'quote',
                title: 'Nueva cotización recibida',
                message: 'Carlos Rodríguez ha enviado una cotización por $1,450,000 COP para tu envío #CC-2024-015 (Bogotá - Medellín).',
                time: 'Hace 5 minutos',
                read: false,
                important: true,
                category: 'shipments',
                meta: {
                    driver: 'Carlos Rodríguez',
                    rating: '4.8/5.0',
                    route: 'Bogotá - Medellín'
                }
            },
            {
                id: 2,
                type: 'completion',
                title: 'Envío completado exitosamente',
                message: 'Tu envío #CC-2024-014 ha sido entregado en Medellín por María González.',
                time: 'Hace 2 horas',
                read: false,
                important: false,
                category: 'shipments',
                meta: {
                    status: 'Entregado a tiempo',
                    duration: '7h 15min',
                    destination: 'Medellín, Antioquia'
                }
            },
            {
                id: 3,
                type: 'payment',
                title: 'Recordatorio de pago pendiente',
                message: 'Tienes un pago pendiente por $2,150,000 COP para el envío #CC-2024-013.',
                time: 'Hace 6 horas',
                read: false,
                important: false,
                category: 'quotes',
                meta: {
                    amount: '$2,150,000 COP',
                    dueDate: '20 Dic, 2024',
                    shipment: '#CC-2024-013'
                }
            }
        ];

        this.renderNotifications();
    }

    renderNotifications() {
        const container = document.querySelector('.notifications-list');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;

        // Filtrar notificaciones según el filtro actual
        let filteredNotifications = this.notifications;
        
        if (this.currentFilter === 'unread') {
            filteredNotifications = this.notifications.filter(n => !n.read);
        } else if (this.currentFilter === 'important') {
            filteredNotifications = this.notifications.filter(n => n.important);
        } else if (this.currentFilter !== 'all') {
            filteredNotifications = this.notifications.filter(n => n.category === this.currentFilter);
        }

        if (filteredNotifications.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'flex';
        emptyState.style.display = 'none';

        // Ordenar notificaciones
        this.sortNotifications('newest', filteredNotifications);

        // Renderizar notificaciones
        container.innerHTML = filteredNotifications.map(notification => 
            this.createNotificationHTML(notification)
        ).join('');
    }

    createNotificationHTML(notification) {
        const readClass = notification.read ? 'notifications-read' : 'notifications-unread';
        const importantClass = notification.important ? 'notifications-important' : '';
        const typeClass = `notifications-${notification.type}`;

        return `
            <div class="notifications-item ${readClass} ${importantClass} ${typeClass}" data-id="${notification.id}">
                <div class="notifications-item-icon">
                    <i class="fas ${this.getNotificationIcon(notification.type)}"></i>
                    ${notification.important && !notification.read ? '<div class="notifications-priority-dot"></div>' : ''}
                </div>
                <div class="notifications-item-content">
                    <div class="notifications-item-header">
                        <h3 class="notifications-item-title">
                            ${notification.title}
                            ${this.getNotificationBadge(notification)}
                        </h3>
                        <span class="notifications-item-time">${notification.time}</span>
                    </div>
                    <p class="notifications-item-message">${notification.message}</p>
                    <div class="notifications-item-meta">
                        ${this.createMetaHTML(notification.meta)}
                    </div>
                    <div class="notifications-item-actions">
                        ${this.createActionButtons(notification)}
                    </div>
                </div>
                <div class="notifications-item-actions-mini">
                    <button class="notifications-action-icon" title="Marcar como leída" data-action="mark-read">
                        <i class="fas fa-envelope-open"></i>
                    </button>
                    <button class="notifications-action-icon" title="Archivar" data-action="archive">
                        <i class="fas fa-archive"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            'quote': 'fa-file-invoice-dollar',
            'completion': 'fa-check-circle',
            'payment': 'fa-exclamation-triangle',
            'system': 'fa-info-circle',
            'recommendation': 'fa-heart',
            'delay': 'fa-clock'
        };
        return icons[type] || 'fa-bell';
    }

    getNotificationBadge(notification) {
        if (notification.important) {
            return '<span class="notifications-badge notifications-badge-important">Importante</span>';
        }
        
        const badges = {
            'completion': 'notifications-badge-success',
            'payment': 'notifications-badge-warning',
            'system': 'notifications-badge-info',
            'recommendation': 'notifications-badge-success'
        };
        
        const badgeClass = badges[notification.type];
        if (badgeClass) {
            const badgeText = this.getBadgeText(notification.type);
            return `<span class="notifications-badge ${badgeClass}">${badgeText}</span>`;
        }
        
        return '';
    }

    getBadgeText(type) {
        const texts = {
            'completion': 'Completado',
            'payment': 'Pendiente',
            'system': 'Sistema',
            'recommendation': 'Recomendación',
            'delay': 'En Curso'
        };
        return texts[type] || '';
    }

    createMetaHTML(meta) {
        if (!meta) return '';
        
        return Object.entries(meta).map(([key, value]) => {
            const icon = this.getMetaIcon(key);
            return `
                <span class="notifications-meta-item">
                    <i class="fas ${icon}"></i>
                    ${this.formatMetaKey(key)}: ${value}
                </span>
            `;
        }).join('');
    }

    getMetaIcon(key) {
        const icons = {
            'driver': 'fa-truck',
            'rating': 'fa-star',
            'route': 'fa-road',
            'status': 'fa-check-circle',
            'duration': 'fa-clock',
            'destination': 'fa-map-marker-alt',
            'amount': 'fa-money-bill-wave',
            'dueDate': 'fa-calendar-day',
            'shipment': 'fa-shipping-fast',
            'reason': 'fa-cloud-rain'
        };
        return icons[key] || 'fa-info-circle';
    }

    formatMetaKey(key) {
        const formats = {
            'driver': 'Transportista',
            'rating': 'Calificación',
            'route': 'Ruta',
            'status': 'Estado',
            'duration': 'Duración',
            'destination': 'Destino',
            'amount': 'Monto',
            'dueDate': 'Vence',
            'shipment': 'Envío',
            'reason': 'Motivo'
        };
        return formats[key] || key;
    }

    createActionButtons(notification) {
        const actions = {
            'quote': [
                { action: 'view-quote', text: 'Ver Cotización', icon: 'fa-eye', primary: true },
                { action: 'view-shipment', text: 'Ver Envío', icon: 'fa-shipping-fast', primary: false },
                { action: 'dismiss', text: 'Descartar', icon: 'fa-times', primary: false }
            ],
            'completion': [
                { action: 'rate-driver', text: 'Calificar Servicio', icon: 'fa-star', primary: true },
                { action: 'view-documents', text: 'Descargar Documentos', icon: 'fa-file-download', primary: false }
            ],
            'payment': [
                { action: 'pay-now', text: 'Pagar Ahora', icon: 'fa-credit-card', primary: true },
                { action: 'view-invoice', text: 'Ver Factura', icon: 'fa-receipt', primary: false }
            ],
            'system': [
                { action: 'view-changelog', text: 'Ver Cambios', icon: 'fa-list', primary: false }
            ],
            'recommendation': [
                { action: 'contact-driver', text: 'Contactar', icon: 'fa-comment', primary: true },
                { action: 'view-profile', text: 'Ver Perfil', icon: 'fa-user', primary: false }
            ],
            'delay': [
                { action: 'track-shipment', text: 'Seguir Envío', icon: 'fa-map-marker-alt', primary: false },
                { action: 'contact-support', text: 'Soporte', icon: 'fa-headset', primary: false }
            ]
        };

        const notificationActions = actions[notification.type] || [];
        
        return notificationActions.map(action => `
            <button class="notifications-action-btn ${action.primary ? 'notifications-action-primary' : 'notifications-action-outline'}" 
                    data-action="${action.action}">
                <i class="fas ${action.icon}"></i>
                ${action.text}
            </button>
        `).join('');
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        this.renderNotifications();
    }

    sortNotifications(sortBy, notifications = this.notifications) {
        // En una implementación real, esto ordenaría las notificaciones
        // Por simplicidad, solo mostramos un mensaje
        this.showNotification(`Notificaciones ordenadas por: ${this.getSortText(sortBy)}`, 'info');
    }

    getSortText(sortBy) {
        const sorts = {
            'newest': 'Más recientes primero',
            'oldest': 'Más antiguas primero',
            'important': 'Más importantes primero'
        };
        return sorts[sortBy] || sortBy;
    }

    handleNotificationAction(action, notificationItem) {
        const notificationId = notificationItem.getAttribute('data-id');
        
        switch (action) {
            case 'mark-read':
                this.markAsRead(notificationId, notificationItem);
                break;
            case 'archive':
                this.archiveNotification(notificationId, notificationItem);
                break;
            case 'delete':
                this.deleteNotification(notificationId, notificationItem);
                break;
            case 'view-quote':
                this.viewQuote(notificationId);
                break;
            case 'rate-driver':
                this.rateDriver(notificationId);
                break;
            case 'pay-now':
                this.payNow(notificationId);
                break;
            case 'contact-driver':
                this.contactDriver(notificationId);
                break;
            case 'dismiss':
                this.dismissNotification(notificationId, notificationItem);
                break;
            case 'remind-later':
                this.remindLater(notificationId);
                break;
            default:
                this.showNotification(`Acción: ${action}`, 'info');
        }
    }

    markAsRead(notificationId, notificationItem) {
        notificationItem.classList.remove('notifications-unread');
        notificationItem.classList.add('notifications-read');
        this.showNotification('Notificación marcada como leída', 'success');
        
        // Actualizar contadores
        this.updateCounters();
    }

    markAllAsRead() {
        const unreadItems = document.querySelectorAll('.notifications-unread');
        unreadItems.forEach(item => {
            item.classList.remove('notifications-unread');
            item.classList.add('notifications-read');
        });
        
        this.showNotification('Todas las notificaciones marcadas como leídas', 'success');
        this.updateCounters();
    }

    archiveNotification(notificationId, notificationItem) {
        notificationItem.style.opacity = '0';
        setTimeout(() => {
            notificationItem.remove();
            this.checkEmptyState();
        }, 300);
        
        this.showNotification('Notificación archivada', 'success');
        this.updateCounters();
    }

    deleteNotification(notificationId, notificationItem) {
        if (confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
            notificationItem.style.opacity = '0';
            setTimeout(() => {
                notificationItem.remove();
                this.checkEmptyState();
            }, 300);
            
            this.showNotification('Notificación eliminada', 'success');
            this.updateCounters();
        }
    }

    dismissNotification(notificationId, notificationItem) {
        notificationItem.style.opacity = '0';
        setTimeout(() => {
            notificationItem.remove();
            this.checkEmptyState();
        }, 300);
        
        this.showNotification('Notificación descartada', 'info');
    }

    viewQuote(notificationId) {
        this.showNotification('Redirigiendo a cotización...', 'info');
        // window.location.href = `/company/quotes/${notificationId}`;
    }

    rateDriver(notificationId) {
        this.showNotification('Abriendo formulario de calificación...', 'info');
        // window.location.href = `/company/rate/${notificationId}`;
    }

    payNow(notificationId) {
        this.showNotification('Redirigiendo a página de pago...', 'info');
        // window.location.href = `/company/payment/${notificationId}`;
    }

    contactDriver(notificationId) {
        this.showNotification('Iniciando chat con transportista...', 'info');
        // window.location.href = `/company/chat/${notificationId}`;
    }

    remindLater(notificationId) {
        this.showNotification('Te recordaremos esta notificación más tarde', 'info');
    }

    updateCounters() {
        // Actualizar contadores en la interfaz
        const unreadCount = document.querySelectorAll('.notifications-unread').length;
        const importantCount = document.querySelectorAll('.notifications-important').length;
        
        // Actualizar badges
        const unreadBadge = document.querySelector('[data-filter="unread"] .notifications-filter-count');
        const importantBadge = document.querySelector('[data-filter="important"] .notifications-filter-count');
        
        if (unreadBadge) unreadBadge.textContent = unreadCount;
        if (importantBadge) importantBadge.textContent = importantCount;
        
        // Actualizar estadísticas
        const pendingStat = document.querySelector('.notifications-stat-item:nth-child(1) .notifications-stat-value');
        const readStat = document.querySelector('.notifications-stat-item:nth-child(2) .notifications-stat-value');
        const importantStat = document.querySelector('.notifications-stat-item:nth-child(3) .notifications-stat-value');
        
        if (pendingStat) pendingStat.textContent = unreadCount;
        if (readStat) readStat.textContent = this.notifications.length - unreadCount;
        if (importantStat) importantStat.textContent = importantCount;
    }

    checkEmptyState() {
        const remainingItems = document.querySelectorAll('.notifications-item').length;
        const emptyState = document.getElementById('emptyState');
        const list = document.querySelector('.notifications-list');
        
        if (remainingItems === 0) {
            list.style.display = 'none';
            emptyState.style.display = 'block';
        }
    }

    checkForNewNotifications() {
        const checkBtn = document.getElementById('checkForNotifications');
        const originalHtml = checkBtn.innerHTML;
        
        checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
        checkBtn.disabled = true;
        
        // Simular búsqueda de nuevas notificaciones
        setTimeout(() => {
            this.showNotification('No hay nuevas notificaciones', 'info');
            checkBtn.innerHTML = originalHtml;
            checkBtn.disabled = false;
        }, 1500);
    }

    showSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('notifications-show');
    }

    saveNotificationSettings() {
        // Simular guardado de configuración
        this.showNotification('Configuración de notificaciones guardada', 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notifications-toast');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notifications-toast notifications-toast-${type}`;
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
            animation: notificationsSlideInRight 0.3s ease;
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
            notification.style.animation = 'notificationsSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes notificationsSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes notificationsSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }

        .fa-spinner {
            animation: notificationsSpin 1s linear infinite;
        }

        @keyframes notificationsSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Initialize the notifications functionality
    window.companyNotifications = new CompanyNotifications();
});