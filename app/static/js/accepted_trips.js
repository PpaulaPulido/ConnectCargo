// Accepted Trips functionality
class AcceptedTrips {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-btn');
        this.panes = document.querySelectorAll('.tab-pane');
        this.activeTripBanner = document.getElementById('activeTripBanner');
        this.actionsModal = document.getElementById('actionsModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalContent = document.getElementById('modalContent');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkActiveTrips();
        this.setupTabs();
    }

    setupEventListeners() {
        // Tab switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Close modal on outside click
        this.actionsModal?.addEventListener('click', (e) => {
            if (e.target === this.actionsModal) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.actionsModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    setupTabs() {
        // Set initial active tab based on URL or default
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        const initialTab = tabParam || 'today';
        this.switchTab(initialTab);
    }

    switchTab(tabName) {
        // Update tabs
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panes
        this.panes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        // Update URL
        const newUrl = window.location.pathname + `?tab=${tabName}`;
        window.history.replaceState({}, '', newUrl);

        // Special actions for specific tabs
        if (tabName === 'today') {
            this.checkActiveTrips();
        }
    }

    checkActiveTrips() {
        const activeTrips = document.querySelectorAll('.trip-card.status-active');
        if (activeTrips.length > 0) {
            this.activeTripBanner.classList.add('show');
        } else {
            this.activeTripBanner.classList.remove('show');
        }
    }

    // Quick Actions
    showUpcomingTrips() {
        this.switchTab('upcoming');
        CarrierUtils.showNotification('Mostrando viajes programados', 'info');
    }

    startNavigation() {
        CarrierUtils.showNotification('Abriendo aplicación de navegación...', 'info');
        
        // Simulate navigation app opening
        setTimeout(() => {
            CarrierUtils.showNotification('Ruta cargada en Google Maps', 'success');
        }, 1000);
    }

    viewDocuments() {
        this.openModal('Documentos del Viaje', `
            <div class="documents-list">
                <div class="document-item">
                    <i class="fas fa-file-contract"></i>
                    <div class="document-info">
                        <h4>Contrato de Transporte</h4>
                        <p>Documento firmado con términos y condiciones</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="acceptedTrips.downloadDocument('contrato')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                <div class="document-item">
                    <i class="fas fa-receipt"></i>
                    <div class="document-info">
                        <h4>Factura Proforma</h4>
                        <p>Documento de pago anticipado</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="acceptedTrips.downloadDocument('factura')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
                <div class="document-item">
                    <i class="fas fa-clipboard-list"></i>
                    <div class="document-info">
                        <h4>Checklist de Seguridad</h4>
                        <p>Lista de verificación pre-viaje</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="acceptedTrips.downloadDocument('checklist')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `);
    }

    contactSupport() {
        CarrierUtils.showNotification('Conectando con soporte técnico...', 'info');
        
        // Simulate support contact
        setTimeout(() => {
            CarrierUtils.showNotification('Soporte técnico disponible. ¿En qué podemos ayudarte?', 'success');
        }, 1500);
    }

    // Trip Actions
    startTrip(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        if (confirm(`¿Estás listo para iniciar el viaje ${tripId}?`)) {
            CarrierUtils.showNotification(`Iniciando viaje ${tripId}...`, 'info');
            
            // Show loading state
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
            button.disabled = true;

            setTimeout(() => {
                // Update trip status
                tripCard.classList.remove('status-ready');
                tripCard.classList.add('status-active');
                
                const badge = tripCard.querySelector('.trip-badge');
                badge.className = 'trip-badge active';
                badge.innerHTML = '<i class="fas fa-truck-moving"></i> En Curso';
                
                // Update actions
                const actionsContainer = tripCard.querySelector('.trip-actions');
                actionsContainer.innerHTML = `
                    <button class="btn btn-warning" onclick="acceptedTrips.pauseTrip(this)">
                        <i class="fas fa-pause-circle"></i>
                        Pausar Viaje
                    </button>
                    <button class="btn btn-outline" onclick="acceptedTrips.reportIssue(this)">
                        <i class="fas fa-exclamation-triangle"></i>
                        Reportar Problema
                    </button>
                    <button class="btn btn-outline" onclick="acceptedTrips.contactSupport(this)">
                        <i class="fas fa-headset"></i>
                        Soporte
                    </button>
                    <button class="btn btn-success" onclick="acceptedTrips.completeTrip(this)">
                        <i class="fas fa-flag-checkered"></i>
                        Finalizar Viaje
                    </button>
                `;
                
                CarrierUtils.showNotification(`¡Viaje ${tripId} iniciado!`, 'success');
                this.checkActiveTrips();
            }, 2000);
        }
    }

    viewRoute(button) {
        const tripCard = button.closest('.trip-card');
        const origin = tripCard.querySelector('.route-point.origin p').textContent;
        const destination = tripCard.querySelector('.route-point.destination p').textContent;
        
        this.openModal('Ruta del Viaje', `
            <div class="route-preview">
                <div class="route-points">
                    <div class="point">
                        <i class="fas fa-play-circle"></i>
                        <div class="point-details">
                            <strong>Origen:</strong>
                            <p>${origin}</p>
                        </div>
                    </div>
                    <div class="point">
                        <i class="fas fa-map-marker-alt"></i>
                        <div class="point-details">
                            <strong>Destino:</strong>
                            <p>${destination}</p>
                        </div>
                    </div>
                </div>
                <div class="route-actions">
                    <button class="btn btn-primary" onclick="acceptedTrips.openInMaps('${origin}', '${destination}')">
                        <i class="fas fa-external-link-alt"></i>
                        Abrir en Maps
                    </button>
                    <button class="btn btn-outline" onclick="acceptedTrips.shareRoute('${origin}', '${destination}')">
                        <i class="fas fa-share"></i>
                        Compartir Ruta
                    </button>
                </div>
            </div>
        `);
    }

    contactClient(button) {
        const tripCard = button.closest('.trip-card');
        const clientName = tripCard.querySelector('.client-details h5').textContent;
        const phone = tripCard.querySelector('.contact-item:first-child')?.textContent || '+57 321 456 7890';
        
        this.openModal(`Contactar a ${clientName}`, `
            <div class="contact-options">
                <div class="contact-method">
                    <i class="fas fa-phone"></i>
                    <div class="method-info">
                        <h4>Llamar por Teléfono</h4>
                        <p>${phone}</p>
                    </div>
                    <button class="btn btn-success btn-sm" onclick="acceptedTrips.makeCall('${phone}')">
                        <i class="fas fa-phone"></i>
                        Llamar
                    </button>
                </div>
                <div class="contact-method">
                    <i class="fas fa-comment"></i>
                    <div class="method-info">
                        <h4>Enviar Mensaje</h4>
                        <p>Chat interno de ConnectCargo</p>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="acceptedTrips.openChat('${clientName}')">
                        <i class="fas fa-comment"></i>
                        Chatear
                    </button>
                </div>
                <div class="contact-method">
                    <i class="fas fa-envelope"></i>
                    <div class="method-info">
                        <h4>Enviar Correo</h4>
                        <p>Notificación por email</p>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="acceptedTrips.sendEmail('${clientName}')">
                        <i class="fas fa-envelope"></i>
                        Email
                    </button>
                </div>
            </div>
        `);
    }

    pauseTrip(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        if (confirm(`¿Pausar el viaje ${tripId}? Esto notificará al cliente.`)) {
            CarrierUtils.showNotification(`Viaje ${tripId} pausado temporalmente`, 'warning');
            
            // Show loading state
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Pausando...';
            button.disabled = true;

            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-play-circle"></i> Reanudar';
                button.classList.remove('btn-warning');
                button.classList.add('btn-success');
                button.onclick = () => acceptedTrips.resumeTrip(button);
                
                CarrierUtils.showNotification('Viaje pausado. El cliente ha sido notificado.', 'info');
            }, 1500);
        }
    }

    resumeTrip(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        CarrierUtils.showNotification(`Reanudando viaje ${tripId}...`, 'info');
        
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reanudando...';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-pause-circle"></i> Pausar Viaje';
            button.classList.remove('btn-success');
            button.classList.add('btn-warning');
            button.onclick = () => acceptedTrips.pauseTrip(button);
            
            CarrierUtils.showNotification('¡Viaje reanudado!', 'success');
        }, 1500);
    }

    reportIssue(button) {
        this.openModal('Reportar Problema', `
            <div class="issue-form">
                <div class="form-group">
                    <label for="issueType">Tipo de Problema</label>
                    <select id="issueType" class="form-select">
                        <option value="">Seleccionar tipo...</option>
                        <option value="mechanical">Problema mecánico</option>
                        <option value="traffic">Tráfico o accidente</option>
                        <option value="weather">Condiciones climáticas</option>
                        <option value="client">Problema con el cliente</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="issueDescription">Descripción del Problema</label>
                    <textarea id="issueDescription" class="form-textarea" placeholder="Describe el problema en detalle..." rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="estimatedDelay">Tiempo estimado de demora</label>
                    <select id="estimatedDelay" class="form-select">
                        <option value="30min">30 minutos</option>
                        <option value="1h">1 hora</option>
                        <option value="2h">2 horas</option>
                        <option value="3h">3+ horas</option>
                        <option value="unknown">No determinado</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button class="btn btn-outline" onclick="acceptedTrips.closeModal()">
                        Cancelar
                    </button>
                    <button class="btn btn-primary" onclick="acceptedTrips.submitIssue()">
                        <i class="fas fa-paper-plane"></i>
                        Reportar Problema
                    </button>
                </div>
            </div>
        `);
    }

    completeTrip(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        if (confirm(`¿Confirmar que has completado el viaje ${tripId}?`)) {
            CarrierUtils.showNotification(`Finalizando viaje ${tripId}...`, 'info');
            
            // Show loading state
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizando...';
            button.disabled = true;

            setTimeout(() => {
                tripCard.style.opacity = '0.5';
                tripCard.style.pointerEvents = 'none';
                
                CarrierUtils.showNotification(`¡Viaje ${tripId} completado exitosamente!`, 'success');
                this.checkActiveTrips();
                
                // In a real app, this would redirect to completion steps
                setTimeout(() => {
                    this.openCompletionModal(tripId);
                }, 1000);
            }, 2000);
        }
    }

    // Modal Methods
    openModal(title, content) {
        this.modalTitle.textContent = title;
        this.modalContent.innerHTML = content;
        this.actionsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.actionsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Utility Methods
    updateChecklist(checkbox) {
        const checkedItems = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
        const totalItems = document.querySelectorAll('.checklist-item input[type="checkbox"]').length;
        
        if (checkedItems === totalItems) {
            CarrierUtils.showNotification('¡Checklist completado! Estás listo para el viaje.', 'success');
        }
    }

    updateLocation() {
        CarrierUtils.showNotification('Actualizando ubicación...', 'info');
        
        // Simulate location update
        setTimeout(() => {
            CarrierUtils.showNotification('Ubicación actualizada correctamente', 'success');
        }, 1500);
    }

    shareLocation() {
        CarrierUtils.showNotification('Compartiendo ubicación con el cliente...', 'info');
        
        // Simulate location sharing
        setTimeout(() => {
            CarrierUtils.showNotification('Ubicación compartida exitosamente', 'success');
        }, 1000);
    }

    viewActiveTrip() {
        const activeTrip = document.querySelector('.trip-card.status-active');
        if (activeTrip) {
            activeTrip.scrollIntoView({ behavior: 'smooth', block: 'center' });
            activeTrip.style.animation = 'pulse 2s infinite';
            setTimeout(() => {
                activeTrip.style.animation = '';
            }, 2000);
        }
    }

    // Additional action methods
    openInMaps(origin, destination) {
        CarrierUtils.showNotification('Abriendo ruta en Google Maps...', 'info');
        this.closeModal();
    }

    shareRoute(origin, destination) {
        CarrierUtils.showNotification('Compartiendo ruta...', 'info');
        this.closeModal();
    }

    makeCall(phone) {
        CarrierUtils.showNotification(`Llamando a ${phone}...`, 'info');
        this.closeModal();
    }

    openChat(clientName) {
        CarrierUtils.showNotification(`Abriendo chat con ${clientName}...`, 'info');
        this.closeModal();
    }

    sendEmail(clientName) {
        CarrierUtils.showNotification(`Enviando email a ${clientName}...`, 'info');
        this.closeModal();
    }

    downloadDocument(type) {
        CarrierUtils.showNotification(`Descargando ${type}...`, 'info');
        // Simulate download
        setTimeout(() => {
            CarrierUtils.showNotification('Documento descargado exitosamente', 'success');
        }, 1000);
    }

    submitIssue() {
        const issueType = document.getElementById('issueType').value;
        const description = document.getElementById('issueDescription').value;
        
        if (!issueType || !description) {
            CarrierUtils.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        CarrierUtils.showNotification('Reportando problema...', 'info');
        
        setTimeout(() => {
            this.closeModal();
            CarrierUtils.showNotification('Problema reportado. El soporte se contactará contigo pronto.', 'success');
        }, 2000);
    }

    openCompletionModal(tripId) {
        this.openModal('¡Viaje Completado!', `
            <div class="completion-content">
                <div class="completion-icon">
                    <i class="fas fa-flag-checkered"></i>
                </div>
                <h4>Viaje ${tripId} Completado</h4>
                <p>¡Felicitaciones! Has completado el viaje exitosamente.</p>
                
                <div class="completion-steps">
                    <div class="step">
                        <i class="fas fa-check-circle"></i>
                        <span>Subir comprobante de entrega</span>
                    </div>
                    <div class="step">
                        <i class="fas fa-check-circle"></i>
                        <span>Confirmar con el cliente</span>
                    </div>
                    <div class="step">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>Recibir pago final</span>
                    </div>
                </div>
                
                <div class="completion-actions">
                    <button class="btn btn-primary" onclick="acceptedTrips.uploadProof()">
                        <i class="fas fa-camera"></i>
                        Subir Comprobante
                    </button>
                    <button class="btn btn-outline" onclick="acceptedTrips.closeModal()">
                        Más Tarde
                    </button>
                </div>
            </div>
        `);
    }

    uploadProof() {
        CarrierUtils.showNotification('Abriendo cámara para comprobante...', 'info');
        this.closeModal();
    }

    viewDetails(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        CarrierUtils.showNotification(`Mostrando detalles completos de ${tripId}`, 'info');
    }

    addToCalendar(button) {
        CarrierUtils.showNotification('Añadiendo viaje al calendario...', 'info');
        
        // Simulate calendar integration
        setTimeout(() => {
            CarrierUtils.showNotification('Viaje agregado a tu calendario', 'success');
        }, 1000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.acceptedTrips = new AcceptedTrips();
});

// Add CSS for animations
const acceptedTripsStyles = `
@keyframes pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    50% {
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
    }
}

.trip-card.status-active {
    animation: pulse 2s infinite;
}

.documents-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.document-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-gray);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-light);
}

.document-item i {
    font-size: 1.5rem;
    color: var(--accent-primary);
    width: 40px;
    text-align: center;
}

.document-info {
    flex: 1;
}

.document-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.document-info p {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin: 0;
}

.route-preview {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.route-points {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.point {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.point i {
    font-size: 1.25rem;
    color: var(--accent-primary);
    margin-top: 0.125rem;
    width: 20px;
    text-align: center;
}

.point-details strong {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.point-details p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
}

.route-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.contact-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.contact-method {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-gray);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-light);
}

.contact-method i {
    font-size: 1.5rem;
    color: var(--accent-primary);
    width: 40px;
    text-align: center;
}

.method-info {
    flex: 1;
}

.method-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.method-info p {
    color: var(--text-secondary);
    font-size: 0.85rem;
    margin: 0;
}

.issue-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
}

.completion-content {
    text-align: center;
}

.completion-icon {
    font-size: 4rem;
    color: #10B981;
    margin-bottom: 1rem;
}

.completion-content h4 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
}

.completion-content p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.completion-steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.step {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-gray);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-light);
}

.step i {
    color: #10B981;
    font-size: 1.25rem;
}

.step span {
    font-weight: 500;
    color: var(--text-primary);
}

.completion-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = acceptedTripsStyles;
document.head.appendChild(styleSheet);