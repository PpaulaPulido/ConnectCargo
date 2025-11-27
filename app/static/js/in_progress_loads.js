class InProgressLoads {
    constructor() {
        this.activeLoads = [];
        this.liveUpdates = true;
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.startLiveUpdates();
        this.setupRealTimeTracking();
    }

    setupEventListeners() {
        // Live tracking buttons
        const liveTrackingBtns = document.querySelectorAll('.live-tracking');
        liveTrackingBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const loadCard = e.target.closest('.progress-load-card');
                this.openLiveTracking(loadCard);
            });
        });

        // Contact driver buttons
        const contactBtns = document.querySelectorAll('.action-btn-text.primary');
        contactBtns.forEach(btn => {
            if (btn.querySelector('.fa-phone-alt') || btn.querySelector('.fa-comment-dots')) {
                btn.addEventListener('click', (e) => {
                    const loadCard = e.target.closest('.progress-load-card');
                    this.contactDriver(loadCard);
                });
            }
        });

        // Quick action buttons
        const quickActions = document.querySelectorAll('.quick-action-btn');
        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.querySelector('span').textContent;
                this.handleQuickAction(action);
            });
        });

        // Expand details buttons
        const expandBtns = document.querySelectorAll('.action-btn .fa-expand');
        expandBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const loadCard = e.target.closest('.progress-load-card');
                this.expandLoadDetails(loadCard);
            });
        });
    }

    loadSampleData() {
        // Simulated active loads data
        this.activeLoads = [
            {
                id: 1,
                reference: 'CC-2024-004',
                status: 'in-transit',
                progress: 45,
                driver: {
                    name: 'Carlos Rodríguez',
                    phone: '+57 300 123 4567',
                    rating: 4.8,
                    reviews: 142,
                    status: 'online',
                    speed: 68,
                    nextStop: '45 min'
                },
                route: {
                    completed: ['Bogotá D.C.', 'Fusagasugá'],
                    current: 'Fusagasugá',
                    upcoming: ['Girardot', 'Ibagué'],
                    totalDistance: 285,
                    completedDistance: 128,
                    nextUpdate: '11:00 AM'
                },
                alerts: [
                    { type: 'info', message: 'El conductor reportó tráfico moderado en la vía' },
                    { type: 'success', message: 'Documentación en orden - Aduana aprobada' }
                ]
            },
            {
                id: 2,
                reference: 'CC-2024-005',
                status: 'pickup',
                progress: 0,
                driver: {
                    name: 'María González',
                    phone: '+57 300 234 5678',
                    rating: 5.0,
                    reviews: 89,
                    status: 'online',
                    eta: '10:45 AM'
                },
                instructions: [
                    'Entrar por puerta principal - Bodega 5',
                    'Contactar a: Jorge Martínez - Cel: 300 111 2233',
                    'Documentación lista en recepción'
                ]
            },
            {
                id: 3,
                reference: 'CC-2024-006',
                status: 'checkpoint',
                progress: 35,
                driver: {
                    name: 'Javier López',
                    phone: '+57 300 345 6789',
                    rating: 4.9,
                    reviews: 76,
                    status: 'away',
                    resumeTime: '10:00 AM'
                },
                checkpoint: {
                    location: 'Buga',
                    type: 'descanso programado',
                    station: 'Estación de Servicio Terpel',
                    duration: '30 min'
                }
            }
        ];
    }

    startLiveUpdates() {
        if (this.liveUpdates) {
            this.updateInterval = setInterval(() => {
                this.simulateLiveUpdates();
            }, 30000); // Update every 30 seconds
        }
    }

    stopLiveUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    simulateLiveUpdates() {
        // Simulate real-time updates for demo purposes
        this.activeLoads.forEach(load => {
            if (load.status === 'in-transit' && load.progress < 100) {
                // Simulate progress increase
                load.progress += Math.random() * 5;
                load.progress = Math.min(load.progress, 100);
                
                // Simulate driver speed variation
                if (load.driver) {
                    load.driver.speed = 60 + Math.random() * 20;
                }
                
                // Update UI
                this.updateLoadProgress(load);
            }
        });

        this.showNotification('Datos actualizados', 'info');
    }

    updateLoadProgress(load) {
        const loadCard = document.querySelector(`[data-load="${load.id}"]`);
        if (!loadCard) return;

        // Update progress bar
        const progressFill = loadCard.querySelector('.progress-fill');
        const progressPercent = loadCard.querySelector('.progress-percent');
        const progressDistance = loadCard.querySelector('.progress-distance');

        if (progressFill) {
            progressFill.style.width = `${load.progress}%`;
        }

        if (progressPercent) {
            progressPercent.textContent = `${Math.round(load.progress)}% Completado`;
        }

        if (progressDistance && load.route) {
            const currentDistance = Math.round((load.progress / 100) * load.route.totalDistance);
            progressDistance.textContent = `${currentDistance} km de ${load.route.totalDistance} km`;
        }

        // Update driver speed if available
        if (load.driver && load.driver.speed) {
            const speedElement = loadCard.querySelector('.fa-speedometer')?.closest('.tracking-item');
            if (speedElement) {
                speedElement.querySelector('span').textContent = `Velocidad: ${Math.round(load.driver.speed)} km/h`;
            }
        }
    }

    setupRealTimeTracking() {
        // Simulate real-time location updates
        setInterval(() => {
            this.activeLoads.forEach(load => {
                if (load.status === 'in-transit') {
                    // This would be replaced with actual WebSocket or API calls
                    // For demo, we'll just trigger a visual update
                    this.animateProgress(load);
                }
            });
        }, 5000);
    }

    animateProgress(load) {
        const loadCard = document.querySelector(`[data-load="${load.id}"]`);
        if (!loadCard) return;

        const pointMarker = loadCard.querySelector('.route-point.current .point-marker');
        if (pointMarker) {
            pointMarker.style.animation = 'none';
            setTimeout(() => {
                pointMarker.style.animation = 'pulse 2s infinite';
            }, 10);
        }
    }

    openLiveTracking(loadCard) {
        const loadRef = loadCard.querySelector('.ref-number').textContent;
        this.showNotification(`Abriendo seguimiento en vivo para ${loadRef}`, 'info');
        
        // In a real app, this would open a modal or new page with live tracking
        // For demo, we'll simulate opening a tracking interface
        setTimeout(() => {
            this.showModal('Seguimiento en Vivo', `
                <div class="live-tracking-modal">
                    <div class="tracking-map" style="height: 400px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                        <div style="text-align: center; color: #666;">
                            <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <p>Mapa de seguimiento en tiempo real</p>
                            <p>Ubicación actual del conductor</p>
                        </div>
                    </div>
                    <div class="tracking-stats">
                        <div class="stat">Velocidad: 68 km/h</div>
                        <div class="stat">ETA: 1 hora 15 min</div>
                        <div class="stat">Distancia restante: 157 km</div>
                    </div>
                </div>
            `);
        }, 500);
    }

    contactDriver(loadCard) {
        const driverName = loadCard.querySelector('.driver-name')?.textContent;
        const driverPhone = loadCard.querySelector('.driver-phone')?.textContent.replace('+57 ', '');
        
        if (driverName && driverPhone) {
            const action = confirm(`¿Quieres contactar a ${driverName}?`);
            if (action) {
                // In a real app, this would initiate a call or open chat
                this.showNotification(`Iniciando comunicación con ${driverName}`, 'success');
            }
        } else {
            this.showNotification('Información del conductor no disponible', 'error');
        }
    }

    expandLoadDetails(loadCard) {
        const loadRef = loadCard.querySelector('.ref-number').textContent;
        
        // In a real app, this would show a detailed modal with all load information
        this.showModal(`Detalles de ${loadRef}`, `
            <div class="load-details-modal">
                <div class="detail-section">
                    <h4>Información de la Carga</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Referencia:</span>
                            <span class="value">${loadRef}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Estado:</span>
                            <span class="value">En Curso</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Tipo de Carga:</span>
                            <span class="value">Carga General</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Peso:</span>
                            <span class="value">2,800 kg</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Información del Conductor</h4>
                    <div class="driver-info-expanded">
                        <img src="{{ url_for('static', filename='images/driver-1.jpg') }}" alt="Conductor" style="width: 80px; height: 80px; border-radius: 50%;">
                        <div class="driver-details">
                            <h5>Carlos Rodríguez</h5>
                            <p><i class="fas fa-star"></i> 4.8 (142 reseñas)</p>
                            <p><i class="fas fa-phone"></i> +57 300 123 4567</p>
                            <p><i class="fas fa-shield-alt"></i> Verificado</p>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Historial de Actualizaciones</h4>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <span class="time">10:30 AM</span>
                                <span class="event">En ruta - Fusagasugá</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <span class="time">9:15 AM</span>
                                <span class="event">Pasó por Soacha</span>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <span class="time">8:30 AM</span>
                                <span class="event">Carga recogida en Bogotá</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    handleQuickAction(action) {
        switch (action) {
            case 'Descargar Reportes':
                this.downloadReports();
                break;
            case 'Configurar Alertas':
                this.configureAlerts();
                break;
            case 'Compartir Seguimiento':
                this.shareTracking();
                break;
            case 'Historial Completo':
                this.showFullHistory();
                break;
        }
    }

    downloadReports() {
        this.showNotification('Generando y descargando reportes...', 'info');
        // In a real app, this would generate and download PDF reports
    }

    configureAlerts() {
        this.showModal('Configurar Alertas', `
            <div class="alerts-config">
                <h4>Preferencias de Notificación</h4>
                <div class="alert-options">
                    <label class="checkbox-label">
                        <input type="checkbox" checked>
                        <span class="checkmark"></span>
                        Notificaciones por email
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" checked>
                        <span class="checkmark"></span>
                        Notificaciones push
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox">
                        <span class="checkmark"></span>
                        Notificaciones SMS
                    </label>
                </div>
                <div class="alert-triggers">
                    <h5>Activar alertas para:</h5>
                    <label class="checkbox-label">
                        <input type="checkbox" checked>
                        <span class="checkmark"></span>
                        Retrasos en la ruta
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" checked>
                        <span class="checkmark"></span>
                        Llegada a destino
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox">
                        <span class="checkmark"></span>
                        Cambios de ruta
                    </label>
                </div>
                <button class="btn-primary" style="margin-top: 1rem; width: 100%;">Guardar Configuración</button>
            </div>
        `);
    }

    shareTracking() {
        this.showNotification('Generando enlace de seguimiento...', 'info');
        // In a real app, this would generate a shareable tracking link
    }

    showFullHistory() {
        this.showNotification('Cargando historial completo...', 'info');
        // In a real app, this would show a modal with complete trip history
    }

    showModal(title, content) {
        // Remove existing modal
        const existingModal = document.querySelector('.custom-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 1rem;
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 2rem;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e5e5e5;
                ">
                    <h3 style="margin: 0; color: #111;">${title}</h3>
                    <button class="modal-close" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #666;
                    ">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        // Add close functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.progress-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `progress-notification progress-notification-${type}`;
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
            animation: progressSlideInRight 0.3s ease;
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
            notification.style.animation = 'progressSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inProgressLoads = new InProgressLoads();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes progressSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes progressSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
            cursor: pointer;
        }
        
        .checkbox-label input[type="checkbox"] {
            display: none;
        }
        
        .checkmark {
            width: 18px;
            height: 18px;
            border: 2px solid #ddd;
            border-radius: 4px;
            position: relative;
        }
        
        .checkbox-label input[type="checkbox"]:checked + .checkmark {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
        }
        
        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
            content: '✓';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 0.7rem;
            font-weight: bold;
        }
        
        .btn-primary {
            background: var(--accent-primary);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: var(--border-radius);
            font-weight: 600;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
});