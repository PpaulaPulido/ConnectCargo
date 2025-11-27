class PublishedLoads {
    constructor() {
        this.loads = [];
        this.filters = {
            search: '',
            status: '',
            date: ''
        };
        this.currentPage = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.applyFilters();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Filter functionality
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.date = e.target.value;
                this.applyFilters();
            });
        }

        // Filter button
        const filterBtn = document.querySelector('.filter-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                this.showAdvancedFilters();
            });
        }

        // Setup action buttons
        this.setupActionButtons();
    }

    loadSampleData() {
        // Simulated data - in a real app, this would come from an API
        this.loads = [
            {
                id: 1,
                reference: 'CC-2024-001',
                status: 'pending',
                priority: 'high',
                origin: {
                    city: 'Bogotá D.C.',
                    address: 'Cra 45 #26-85, Bodega 12',
                    date: '15 Dic, 8:00 AM'
                },
                destination: {
                    city: 'Medellín',
                    address: 'Cl 33 #45-23, Zona Industrial',
                    date: '16 Dic, 2:00 PM'
                },
                cargo: {
                    type: 'Carga General',
                    weight: '1,500 kg',
                    vehicle: 'Camiones 5T-10T'
                },
                budget: '$1,200,000 COP',
                published: 'Hace 2 horas',
                quotes: 0,
                expires: 'En 2 días',
                driver: null
            },
            {
                id: 2,
                reference: 'CC-2024-002',
                status: 'quotes',
                priority: 'normal',
                origin: {
                    city: 'Cali',
                    address: 'Av 4N #15-45, Centro',
                    date: '18 Dic, 9:00 AM'
                },
                destination: {
                    city: 'Barranquilla',
                    address: 'Cra 54 #68-90, Puerto',
                    date: '19 Dic, 3:00 PM'
                },
                cargo: {
                    type: 'Carga Refrigerada',
                    weight: '800 kg',
                    vehicle: 'Camiones Refrigerados 3.5T'
                },
                budget: '$850,000 COP',
                published: 'Hace 1 día',
                quotes: 5,
                bestQuote: '$780,000 COP',
                expires: 'En 3 días',
                driver: null
            },
            {
                id: 3,
                reference: 'CC-2024-003',
                status: 'assigned',
                priority: 'normal',
                origin: {
                    city: 'Medellín',
                    address: 'Cl 10 #35-24, Bodeguita',
                    date: '20 Dic, 10:00 AM'
                },
                destination: {
                    city: 'Bucaramanga',
                    address: 'Cra 22 #45-67, Norte',
                    date: '20 Dic, 6:00 PM'
                },
                cargo: {
                    type: 'Paquetería',
                    weight: '250 kg',
                    vehicle: 'Van/Camión 3.5T'
                },
                budget: '$450,000 COP',
                published: 'Hace 1 día',
                driver: {
                    name: 'María González',
                    avatar: 'driver-2.jpg',
                    rating: 5.0,
                    reviews: 89,
                    assigned: 'Hace 4 horas'
                }
            },
            {
                id: 4,
                reference: 'CC-2024-004',
                status: 'in_progress',
                priority: 'normal',
                origin: {
                    city: 'Bogotá D.C.',
                    address: 'Cra 68 #45-23, Fontibón',
                    date: 'Hoy, 8:30 AM ✓',
                    completed: true
                },
                destination: {
                    city: 'Ibagué',
                    address: 'Cl 19 #42-15, Centro',
                    date: 'Hoy, 2:00 PM'
                },
                cargo: {
                    type: 'Carga General',
                    weight: '2,800 kg',
                    vehicle: 'Camiones 10T'
                },
                budget: '$1,500,000 COP',
                progress: 45,
                driver: {
                    name: 'Carlos Rodríguez',
                    avatar: 'driver-1.jpg',
                    rating: 4.8,
                    reviews: 142,
                    location: 'En ruta - 45% completado',
                    eta: '1.5 horas'
                }
            }
        ];
    }

    applyFilters() {
        let filteredLoads = [...this.loads];

        // Apply search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredLoads = filteredLoads.filter(load =>
                load.reference.toLowerCase().includes(searchTerm) ||
                load.origin.city.toLowerCase().includes(searchTerm) ||
                load.destination.city.toLowerCase().includes(searchTerm) ||
                load.cargo.type.toLowerCase().includes(searchTerm)
            );
        }

        // Apply status filter
        if (this.filters.status) {
            filteredLoads = filteredLoads.filter(load => load.status === this.filters.status);
        }

        // Apply date filter (simplified)
        if (this.filters.date) {
            // In a real app, this would filter by actual dates
            filteredLoads = filteredLoads.filter(load => {
                // Simplified date filtering for demo
                return true;
            });
        }

        // Update UI
        this.updateResultsCount(filteredLoads.length);
        this.renderLoads(filteredLoads);
    }

    updateResultsCount(count) {
        const loadsCount = document.querySelector('.loads-count');
        if (loadsCount) {
            loadsCount.textContent = `Mostrando ${count} cargas`;
        }
    }

    renderLoads(loads) {
        const loadsList = document.querySelector('.loads-list');
        if (!loadsList) return;

        loadsList.innerHTML = '';

        if (loads.length === 0) {
            loadsList.innerHTML = this.createEmptyState();
            return;
        }

        loads.forEach(load => {
            const loadCard = this.createLoadCard(load);
            loadsList.appendChild(loadCard);
        });
    }

    createLoadCard(load) {
        const card = document.createElement('div');
        card.className = `load-card status-${load.status}`;
        
        card.innerHTML = this.generateLoadCardHTML(load);
        
        // Add event listeners to action buttons
        this.setupCardActions(card, load);
        
        return card;
    }

    generateLoadCardHTML(load) {
        return `
            <div class="load-card-header">
                <div class="load-ref">
                    <span class="ref-badge">REF</span>
                    <span class="ref-number">#${load.reference}</span>
                    ${load.priority === 'high' ? `
                    <span class="load-priority high">
                        <i class="fas fa-exclamation-circle"></i>
                        Urgente
                    </span>
                    ` : ''}
                </div>
                <div class="load-actions">
                    ${this.generateActionButtons(load)}
                </div>
            </div>

            <div class="load-card-content">
                <div class="load-route">
                    <div class="route-point origin">
                        <div class="point-marker ${load.origin.completed ? 'completed' : ''}"></div>
                        <div class="point-info">
                            <span class="point-city">${load.origin.city}</span>
                            <span class="point-address">${load.origin.address}</span>
                            <span class="point-date ${load.origin.completed ? 'completed' : ''}">${load.origin.date}</span>
                        </div>
                    </div>
                    <div class="route-line ${load.status === 'in_progress' ? 'in-progress' : ''}"></div>
                    <div class="route-point destination">
                        <div class="point-marker"></div>
                        <div class="point-info">
                            <span class="point-city">${load.destination.city}</span>
                            <span class="point-address">${load.destination.address}</span>
                            <span class="point-date">${load.destination.date}</span>
                        </div>
                    </div>
                </div>

                <div class="load-details">
                    <div class="detail-item">
                        <i class="fas fa-box"></i>
                        <span>${load.cargo.type} - ${load.cargo.weight}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-truck"></i>
                        <span>${load.cargo.vehicle}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span>${load.status === 'assigned' || load.status === 'in_progress' ? 'Precio acordado' : 'Presupuesto'}: ${load.budget}</span>
                    </div>
                </div>

                ${load.status === 'quotes' ? this.generateQuotesSection(load) : ''}
                ${load.driver ? this.generateDriverSection(load) : ''}
                ${load.progress ? this.generateProgressSection(load) : ''}

                <div class="load-meta">
                    ${this.generateMetaInfo(load)}
                </div>
            </div>

            <div class="load-card-footer">
                <div class="load-status">
                    <span class="status-badge ${load.status}">
                        <i class="fas ${this.getStatusIcon(load.status)}"></i>
                        ${this.getStatusText(load.status)}
                    </span>
                </div>
                <div class="load-actions-footer">
                    ${this.generateFooterActions(load)}
                </div>
            </div>
        `;
    }

    generateActionButtons(load) {
        const buttons = {
            pending: [
                { icon: 'fa-edit', title: 'Editar', action: 'edit' },
                { icon: 'fa-copy', title: 'Duplicar', action: 'duplicate' },
                { icon: 'fa-times', title: 'Cancelar', action: 'cancel', danger: true }
            ],
            quotes: [
                { icon: 'fa-edit', title: 'Editar', action: 'edit' },
                { icon: 'fa-copy', title: 'Duplicar', action: 'duplicate' }
            ],
            assigned: [
                { icon: 'fa-map-marker-alt', title: 'Seguimiento', action: 'track' },
                { icon: 'fa-comment', title: 'Contactar', action: 'contact' }
            ],
            in_progress: [
                { icon: 'fa-satellite-dish', title: 'Seguimiento en vivo', action: 'liveTrack' },
                { icon: 'fa-comment', title: 'Contactar', action: 'contact' }
            ]
        };

        const statusButtons = buttons[load.status] || [];
        
        return statusButtons.map(btn => `
            <button class="action-btn ${btn.danger ? 'danger' : ''}" 
                    title="${btn.title}" 
                    data-action="${btn.action}" 
                    data-load="${load.id}">
                <i class="fas ${btn.icon}"></i>
            </button>
        `).join('');
    }

    generateQuotesSection(load) {
        return `
            <div class="quotes-info">
                <div class="quotes-count">
                    <i class="fas fa-comments"></i>
                    <span>${load.quotes} cotizaciones recibidas</span>
                </div>
                <div class="best-quote">
                    <span class="quote-label">Mejor oferta:</span>
                    <span class="quote-amount">${load.bestQuote}</span>
                </div>
            </div>
        `;
    }

    generateDriverSection(load) {
        return `
            <div class="driver-assigned">
                <div class="driver-info">
                    <div class="driver-avatar">
                        <img src="{{ url_for('static', filename='images/${load.driver.avatar}') }}" alt="${load.driver.name}">
                    </div>
                    <div class="driver-details">
                        <span class="driver-name">${load.driver.name}</span>
                        <span class="driver-rating">
                            <i class="fas fa-star"></i> ${load.driver.rating} (${load.driver.reviews})
                        </span>
                    </div>
                </div>
                ${load.status === 'assigned' ? `
                <div class="assignment-time">
                    <i class="fas fa-check-circle"></i>
                    <span>Asignada ${load.driver.assigned}</span>
                </div>
                ` : ''}
                ${load.status === 'in_progress' ? `
                <div class="tracking-info">
                    <div class="location-status">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${load.driver.location}</span>
                    </div>
                    <div class="eta">
                        <i class="fas fa-clock"></i>
                        <span>ETA: ${load.driver.eta}</span>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    generateProgressSection(load) {
        return `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${load.progress}%"></div>
            </div>
        `;
    }

    generateMetaInfo(load) {
        const meta = [];
        
        if (load.published) {
            meta.push(`<div class="meta-item">
                <span class="meta-label">Publicado:</span>
                <span class="meta-value">${load.published}</span>
            </div>`);
        }
        
        if (load.quotes !== undefined) {
            meta.push(`<div class="meta-item">
                <span class="meta-label">Cotizaciones:</span>
                <span class="meta-value">${load.quotes} recibidas</span>
            </div>`);
        }
        
        if (load.expires) {
            meta.push(`<div class="meta-item">
                <span class="meta-label">Vence:</span>
                <span class="meta-value">${load.expires}</span>
            </div>`);
        }
        
        if (load.status === 'assigned' || load.status === 'in_progress') {
            meta.push(`<div class="meta-item">
                <span class="meta-label">Recogida:</span>
                <span class="meta-value">${load.origin.date.split(',')[0]}, ${load.origin.date.split(',')[1]}</span>
            </div>`);
            
            meta.push(`<div class="meta-item">
                <span class="meta-label">Entrega estimada:</span>
                <span class="meta-value">${load.destination.date.split(',')[0]}, ${load.destination.date.split(',')[1]}</span>
            </div>`);
        }

        return meta.join('');
    }

    generateFooterActions(load) {
        const actions = [
            { icon: 'fa-eye', text: 'Ver Detalles', action: 'viewDetails' }
        ];

        if (load.status === 'quotes') {
            actions.push({ icon: 'fa-handshake', text: 'Ver Cotizaciones', action: 'viewQuotes', primary: true });
        } else if (load.status === 'assigned' || load.status === 'in_progress') {
            actions.push({ 
                icon: load.status === 'in_progress' ? 'fa-satellite-dish' : 'fa-map-marker-alt', 
                text: load.status === 'in_progress' ? 'Seguimiento Live' : 'Seguimiento', 
                action: 'track', 
                primary: true 
            });
        } else {
            actions.push({ icon: 'fa-share-alt', text: 'Compartir', action: 'share', primary: true });
        }

        return actions.map(action => `
            <button class="action-btn-text ${action.primary ? 'primary' : ''}" 
                    data-action="${action.action}" 
                    data-load="${load.id}">
                <i class="fas ${action.icon}"></i>
                ${action.text}
            </button>
        `).join('');
    }

    getStatusIcon(status) {
        const icons = {
            pending: 'fa-clock',
            quotes: 'fa-comments',
            assigned: 'fa-truck-loading',
            in_progress: 'fa-shipping-fast',
            completed: 'fa-check-circle'
        };
        return icons[status] || 'fa-box';
    }

    getStatusText(status) {
        const texts = {
            pending: 'Pendiente',
            quotes: 'En Cotización',
            assigned: 'Asignada',
            in_progress: 'En Curso',
            completed: 'Completada'
        };
        return texts[status] || status;
    }

    setupCardActions(card, load) {
        const actionButtons = card.querySelectorAll('[data-action]');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleAction(action, load);
            });
        });
    }

    setupActionButtons() {
        // Setup global action buttons if any
    }

    handleAction(action, load) {
        switch (action) {
            case 'edit':
                this.editLoad(load);
                break;
            case 'duplicate':
                this.duplicateLoad(load);
                break;
            case 'cancel':
                this.cancelLoad(load);
                break;
            case 'track':
            case 'liveTrack':
                this.trackLoad(load);
                break;
            case 'contact':
                this.contactDriver(load);
                break;
            case 'viewDetails':
                this.viewDetails(load);
                break;
            case 'viewQuotes':
                this.viewQuotes(load);
                break;
            case 'share':
                this.shareLoad(load);
                break;
        }
    }

    editLoad(load) {
        this.showNotification(`Editando carga ${load.reference}`, 'info');
        // In a real app, this would navigate to edit page
    }

    duplicateLoad(load) {
        this.showNotification(`Duplicando carga ${load.reference}`, 'info');
        // In a real app, this would create a copy of the load
    }

    cancelLoad(load) {
        if (confirm(`¿Estás seguro de que quieres cancelar la carga ${load.reference}?`)) {
            this.showNotification(`Carga ${load.reference} cancelada`, 'success');
            // In a real app, this would update the load status
        }
    }

    trackLoad(load) {
        this.showNotification(`Abriendo seguimiento para ${load.reference}`, 'info');
        // In a real app, this would open tracking interface
    }

    contactDriver(load) {
        this.showNotification(`Iniciando chat con ${load.driver.name}`, 'info');
        // In a real app, this would open chat interface
    }

    viewDetails(load) {
        this.showNotification(`Mostrando detalles de ${load.reference}`, 'info');
        // In a real app, this would show load details modal
    }

    viewQuotes(load) {
        this.showNotification(`Mostrando cotizaciones para ${load.reference}`, 'info');
        // In a real app, this would show quotes modal
    }

    shareLoad(load) {
        this.showNotification(`Compartiendo carga ${load.reference}`, 'info');
        // In a real app, this would open share dialog
    }

    showAdvancedFilters() {
        this.showNotification('Mostrando filtros avanzados', 'info');
        // In a real app, this would show a modal with more filter options
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.loads-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `loads-notification loads-notification-${type}`;
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
            animation: loadsSlideInRight 0.3s ease;
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
            notification.style.animation = 'loadsSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    createEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-box-open"></i>
                </div>
                <h3>No tienes cargas publicadas</h3>
                <p>Comienza publicando tu primera carga para encontrar transportistas</p>
                <a href="{{ url_for('companies.publish_load') }}" class="publish-new-btn large">
                    <i class="fas fa-plus-circle"></i>
                    Publicar Mi Primera Carga
                </a>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.publishedLoads = new PublishedLoads();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes loadsSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes loadsSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(style);
});