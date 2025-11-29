// Carrier Loads Management - Namespaced to avoid conflicts
class CarrierLoads {
    constructor() {
        this.currentView = 'grid';
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.loads = [];
        this.filteredLoads = [];
        this.currentLoadId = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Check if required elements exist
        if (!this.requiredElementsExist()) {
            console.warn('Some required elements for CarrierLoads are missing');
            return;
        }

        this.setupEventListeners();
        this.setupFilters();
        this.setupModals();
        this.loadSampleData();
        
        console.log('Carrier Loads initialized');
    }

    requiredElementsExist() {
        const requiredElements = [
            'carrierOpenFilters',
            'carrierCloseFilters',
            'carrierApplyFilters',
            'carrierResetFilters',
            'carrierLoadMore',
            'carrierCloseLoadDetails',
            'carrierCloseAcceptModal',
            'carrierCancelAccept',
            'carrierConfirmAccept'
        ];

        return requiredElements.every(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Required element with id '${id}' not found`);
                return false;
            }
            return true;
        });
    }

    setupEventListeners() {
        // View controls
        document.querySelectorAll('.carrier-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.closest('.carrier-view-btn').getAttribute('data-view'));
            });
        });

        // Filter tags
        document.querySelectorAll('.carrier-filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                this.applyQuickFilter(e.target.closest('.carrier-filter-tag').getAttribute('data-filter'));
            });
        });

        // Search
        const searchInput = document.getElementById('carrierLoadsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', CarrierLoadsUtils.debounce((e) => {
                this.searchLoads(e.target.value);
            }, 300));
        }

        // Sort
        const sortSelect = document.getElementById('carrierSortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortLoads(e.target.value);
            });
        }

        // Filter sidebar - Safe element access
        const openFiltersBtn = document.getElementById('carrierOpenFilters');
        const closeFiltersBtn = document.getElementById('carrierCloseFilters');
        const applyFiltersBtn = document.getElementById('carrierApplyFilters');
        const resetFiltersBtn = document.getElementById('carrierResetFilters');
        const loadMoreBtn = document.getElementById('carrierLoadMore');

        if (openFiltersBtn) openFiltersBtn.addEventListener('click', () => this.openFilters());
        if (closeFiltersBtn) closeFiltersBtn.addEventListener('click', () => this.closeFilters());
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => this.applyAdvancedFilters());
        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => this.loadMoreLoads());

        // Accept load buttons - Event delegation for dynamically created elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('.carrier-btn-accept')) {
                const loadCard = e.target.closest('.carrier-load-card');
                if (loadCard) {
                    this.showAcceptModal(loadCard.getAttribute('data-load-id'));
                }
            }
            
            if (e.target.closest('.carrier-btn-outline') && !e.target.closest('.carrier-btn-accept')) {
                const loadCard = e.target.closest('.carrier-load-card');
                if (loadCard) {
                    this.showLoadDetails(loadCard.getAttribute('data-load-id'));
                }
            }
        });

        // Modal close buttons - Safe element access
        const closeLoadDetailsBtn = document.getElementById('carrierCloseLoadDetails');
        const closeAcceptModalBtn = document.getElementById('carrierCloseAcceptModal');
        const cancelAcceptBtn = document.getElementById('carrierCancelAccept');
        const confirmAcceptBtn = document.getElementById('carrierConfirmAccept');

        if (closeLoadDetailsBtn) closeLoadDetailsBtn.addEventListener('click', () => this.hideLoadDetails());
        if (closeAcceptModalBtn) closeAcceptModalBtn.addEventListener('click', () => this.hideAcceptModal());
        if (cancelAcceptBtn) cancelAcceptBtn.addEventListener('click', () => this.hideAcceptModal());
        if (confirmAcceptBtn) confirmAcceptBtn.addEventListener('click', () => this.confirmAcceptLoad());

        // Close modals on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('carrier-modal')) {
                this.hideAllModals();
            }
        });

        // Also close modals on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
                this.closeFilters();
            }
        });
    }

    setupFilters() {
        // Initialize filter values
        this.filters = {
            origin: '',
            destination: '',
            pickupFrom: '',
            pickupTo: '',
            weightMin: '',
            weightMax: '',
            cargoTypes: [],
            priceMin: '',
            priceMax: ''
        };
    }

    setupModals() {
        // Modal elements - safe access
        this.loadDetailsModal = document.getElementById('carrierLoadDetailsModal');
        this.acceptLoadModal = document.getElementById('carrierAcceptLoadModal');
        this.filtersSidebar = document.getElementById('carrierFiltersSidebar');
    }

    loadSampleData() {
        // Sample loads data - in real app, this would come from an API
        this.loads = [
            {
                id: 1,
                origin: { city: 'Bogotá, DC', address: 'Centro Industrial' },
                destination: { city: 'Medellín, ANT', address: 'Zona Industrial' },
                weight: 1200,
                volume: 12,
                type: 'general',
                pickupTime: 'Hoy 14:00',
                deliveryTime: 'Mañana 10:00',
                price: 850000,
                priceType: 'fixed',
                distance: 15,
                urgency: 'high',
                matchesRoute: false,
                isNew: false,
                isExpress: false
            },
            {
                id: 2,
                origin: { city: 'Cali, VAL', address: 'Centro Logístico' },
                destination: { city: 'Pereira, RIS', address: 'Zona Franca' },
                weight: 800,
                volume: 8,
                type: 'refrigerated',
                pickupTime: '15 Dic 09:00',
                deliveryTime: '15 Dic 18:00',
                price: 620000,
                priceType: 'negotiable',
                distance: 8,
                urgency: 'medium',
                matchesRoute: true,
                isNew: false,
                isExpress: false
            },
            {
                id: 3,
                origin: { city: 'Barranquilla, ATL', address: 'Puerto Industrial' },
                destination: { city: 'Cartagena, BOL', address: 'Zona Portuaria' },
                weight: 2500,
                volume: 18,
                type: 'dangerous',
                pickupTime: '16 Dic 08:00',
                deliveryTime: '17 Dic 12:00',
                price: 1200000,
                priceType: 'certification',
                distance: 25,
                urgency: 'low',
                matchesRoute: false,
                isNew: true,
                isExpress: false
            },
            {
                id: 4,
                origin: { city: 'Bucaramanga, SAN', address: 'Centro Comercial' },
                destination: { city: 'Cúcuta, NDS', address: 'Zona Fronteriza' },
                weight: 500,
                volume: 6,
                type: 'fragile',
                pickupTime: 'Hoy 16:00',
                deliveryTime: 'Mañana 08:00',
                price: 450000,
                priceType: 'special',
                distance: 12,
                urgency: 'high',
                matchesRoute: false,
                isNew: false,
                isExpress: true
            }
        ];

        this.filteredLoads = [...this.loads];
        this.renderLoads();
        this.updateStats();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active view button
        document.querySelectorAll('.carrier-view-btn').forEach(btn => {
            btn.classList.remove('carrier-view-active');
        });
        
        const activeBtn = document.querySelector(`[data-view="${view}"]`);
        if (activeBtn) {
            activeBtn.classList.add('carrier-view-active');
        }
        
        // Update view container
        const loadsView = document.getElementById('carrierLoadsView');
        if (loadsView) {
            loadsView.className = `carrier-loads-view carrier-${view}-view`;
        }
        
        this.renderLoads();
    }

    applyQuickFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter tag
        document.querySelectorAll('.carrier-filter-tag').forEach(tag => {
            tag.classList.remove('carrier-filter-active');
        });
        
        const activeTag = document.querySelector(`[data-filter="${filter}"]`);
        if (activeTag) {
            activeTag.classList.add('carrier-filter-active');
        }
        
        this.applyFilters();
    }

    applyAdvancedFilters() {
        // Get filter values with safe element access
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value : '';
        };

        this.filters.origin = getValue('carrierFilterOrigin');
        this.filters.destination = getValue('carrierFilterDestination');
        this.filters.pickupFrom = getValue('carrierFilterPickupFrom');
        this.filters.pickupTo = getValue('carrierFilterPickupTo');
        this.filters.weightMin = getValue('carrierFilterWeightMin');
        this.filters.weightMax = getValue('carrierFilterWeightMax');
        this.filters.priceMin = getValue('carrierFilterPriceMin');
        this.filters.priceMax = getValue('carrierFilterPriceMax');
        
        // Get cargo types
        this.filters.cargoTypes = [];
        document.querySelectorAll('input[name="cargo_type"]:checked').forEach(checkbox => {
            this.filters.cargoTypes.push(checkbox.value);
        });
        
        this.applyFilters();
        this.closeFilters();
    }

    applyFilters() {
        this.filteredLoads = this.loads.filter(load => {
            // Quick filters
            if (this.currentFilter === 'nearby' && load.distance > 20) return false;
            if (this.currentFilter === 'urgent' && load.urgency !== 'high') return false;
            if (this.currentFilter === 'matching' && !load.matchesRoute) return false;
            
            // Advanced filters
            if (this.filters.origin && !load.origin.city.toLowerCase().includes(this.filters.origin.toLowerCase())) return false;
            if (this.filters.destination && !load.destination.city.toLowerCase().includes(this.filters.destination.toLowerCase())) return false;
            if (this.filters.weightMin && load.weight < parseInt(this.filters.weightMin)) return false;
            if (this.filters.weightMax && load.weight > parseInt(this.filters.weightMax)) return false;
            if (this.filters.cargoTypes.length > 0 && !this.filters.cargoTypes.includes(load.type)) return false;
            if (this.filters.priceMin && load.price < parseInt(this.filters.priceMin)) return false;
            if (this.filters.priceMax && load.price > parseInt(this.filters.priceMax)) return false;
            
            return true;
        });
        
        this.sortLoads(this.currentSort);
        this.renderLoads();
        this.updateStats();
    }

    resetFilters() {
        // Reset form fields with safe element access
        const resetValue = (id) => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        };

        resetValue('carrierFilterOrigin');
        resetValue('carrierFilterDestination');
        resetValue('carrierFilterPickupFrom');
        resetValue('carrierFilterPickupTo');
        resetValue('carrierFilterWeightMin');
        resetValue('carrierFilterWeightMax');
        resetValue('carrierFilterPriceMin');
        resetValue('carrierFilterPriceMax');
        
        // Uncheck all cargo type checkboxes
        document.querySelectorAll('input[name="cargo_type"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.setupFilters();
        this.applyQuickFilter('all');
    }

    searchLoads(query) {
        if (!query) {
            this.applyFilters();
            return;
        }
        
        const searchTerm = query.toLowerCase();
        this.filteredLoads = this.filteredLoads.filter(load => 
            load.origin.city.toLowerCase().includes(searchTerm) ||
            load.destination.city.toLowerCase().includes(searchTerm) ||
            load.type.toLowerCase().includes(searchTerm)
        );
        
        this.renderLoads();
    }

    sortLoads(sortBy) {
        this.currentSort = sortBy;
        
        this.filteredLoads.sort((a, b) => {
            switch (sortBy) {
                case 'price_high':
                    return b.price - a.price;
                case 'price_low':
                    return a.price - b.price;
                case 'distance':
                    return a.distance - b.distance;
                case 'urgency':
                    const urgencyOrder = { high: 3, medium: 2, low: 1 };
                    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
                case 'newest':
                default:
                    return b.id - a.id; // Simulate date sorting
            }
        });
        
        this.renderLoads();
    }

    renderLoads() {
        const loadsView = document.getElementById('carrierLoadsView');
        if (!loadsView) return;
        
        loadsView.innerHTML = '';
        
        if (this.filteredLoads.length === 0) {
            loadsView.innerHTML = `
                <div class="carrier-no-results">
                    <i class="fas fa-box-open"></i>
                    <h3>No se encontraron cargas</h3>
                    <p>Intenta ajustar tus filtros de búsqueda</p>
                </div>
            `;
            return;
        }
        
        this.filteredLoads.forEach(load => {
            const loadCard = this.createLoadCard(load);
            loadsView.appendChild(loadCard);
        });
    }

    createLoadCard(load) {
        const card = document.createElement('div');
        card.className = 'carrier-load-card';
        card.setAttribute('data-load-id', load.id);
        
        // Determine badge
        let badge = '';
        if (load.urgency === 'high') badge = '<span class="carrier-load-badge carrier-load-urgent">Urgente</span>';
        else if (load.matchesRoute) badge = '<span class="carrier-load-badge carrier-load-matching">Coincide con tu Ruta</span>';
        else if (load.isNew) badge = '<span class="carrier-load-badge carrier-load-new">Nueva</span>';
        else if (load.isExpress) badge = '<span class="carrier-load-badge carrier-load-express">Express</span>';
        
        // Type icon and label
        let typeIcon = 'fas fa-box';
        let typeLabel = 'Carga General';
        switch (load.type) {
            case 'refrigerated':
                typeIcon = 'fas fa-snowflake';
                typeLabel = 'Refrigerada';
                break;
            case 'dangerous':
                typeIcon = 'fas fa-exclamation-triangle';
                typeLabel = 'Materiales Peligrosos';
                break;
            case 'fragile':
                typeIcon = 'fas fa-gift';
                typeLabel = 'Frágil';
                break;
        }
        
        // Price note
        let priceNote = 'Precio fijo';
        switch (load.priceType) {
            case 'negotiable':
                priceNote = 'Negociable';
                break;
            case 'certification':
                priceNote = 'Certificación requerida';
                break;
            case 'special':
                priceNote = 'Manejo especial';
                break;
        }
        
        card.innerHTML = `
            <div class="carrier-load-header">
                ${badge}
                <span class="carrier-load-distance">${load.distance} km</span>
            </div>
            
            <div class="carrier-load-route">
                <div class="carrier-route-point">
                    <div class="carrier-point-icon">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="carrier-point-info">
                        <span class="carrier-point-city">${load.origin.city}</span>
                        <span class="carrier-point-address">${load.origin.address}</span>
                    </div>
                </div>
                <div class="carrier-route-line"></div>
                <div class="carrier-route-point">
                    <div class="carrier-point-icon">
                        <i class="fas fa-flag-checkered"></i>
                    </div>
                    <div class="carrier-point-info">
                        <span class="carrier-point-city">${load.destination.city}</span>
                        <span class="carrier-point-address">${load.destination.address}</span>
                    </div>
                </div>
            </div>

            <div class="carrier-load-details">
                <div class="carrier-detail-item">
                    <i class="fas fa-weight-hanging"></i>
                    <span>${load.weight.toLocaleString()} kg</span>
                </div>
                <div class="carrier-detail-item">
                    <i class="fas fa-ruler-combined"></i>
                    <span>${load.volume}m³</span>
                </div>
                <div class="carrier-detail-item">
                    <i class="${typeIcon}"></i>
                    <span>${typeLabel}</span>
                </div>
            </div>

            <div class="carrier-load-timeline">
                <div class="carrier-timeline-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Recoger: ${load.pickupTime}</span>
                </div>
                <div class="carrier-timeline-item">
                    <i class="fas fa-clock"></i>
                    <span>Entregar: ${load.deliveryTime}</span>
                </div>
            </div>

            <div class="carrier-load-price">
                <span class="carrier-price-amount">$${load.price.toLocaleString()}</span>
                <span class="carrier-price-note">${priceNote}</span>
            </div>

            <div class="carrier-load-actions">
                <button class="carrier-btn carrier-btn-outline carrier-btn-sm">
                    <i class="fas fa-info-circle"></i>
                    Detalles
                </button>
                <button class="carrier-btn carrier-btn-primary carrier-btn-sm carrier-btn-accept">
                    <i class="fas fa-check"></i>
                    Aceptar Carga
                </button>
            </div>
        `;
        
        return card;
    }

    updateStats() {
        const totalLoads = document.getElementById('carrierTotalLoads');
        const nearbyLoads = document.getElementById('carrierNearbyLoads');
        
        if (totalLoads) {
            totalLoads.textContent = this.filteredLoads.length;
        }
        
        if (nearbyLoads) {
            const nearbyCount = this.filteredLoads.filter(load => load.distance <= 20).length;
            nearbyLoads.textContent = nearbyCount;
        }
    }

    openFilters() {
        if (this.filtersSidebar) {
            this.filtersSidebar.classList.add('carrier-active');
        }
        // Create overlay if it doesn't exist
        if (!document.getElementById('carrierFiltersOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'carrierFiltersOverlay';
            overlay.className = 'carrier-filters-overlay';
            overlay.addEventListener('click', () => this.closeFilters());
            document.body.appendChild(overlay);
        }
        document.getElementById('carrierFiltersOverlay').classList.add('carrier-active');
    }

    closeFilters() {
        if (this.filtersSidebar) {
            this.filtersSidebar.classList.remove('carrier-active');
        }
        const overlay = document.getElementById('carrierFiltersOverlay');
        if (overlay) {
            overlay.classList.remove('carrier-active');
        }
    }

    showLoadDetails(loadId) {
        const load = this.loads.find(l => l.id == loadId);
        if (!load || !this.loadDetailsModal) return;
        
        const modalContent = this.loadDetailsModal.querySelector('.carrier-load-details-content');
        if (modalContent) {
            modalContent.innerHTML = this.createLoadDetailsContent(load);
        }
        
        this.loadDetailsModal.classList.add('carrier-active');
    }

    hideLoadDetails() {
        if (this.loadDetailsModal) {
            this.loadDetailsModal.classList.remove('carrier-active');
        }
    }

    showAcceptModal(loadId) {
        this.currentLoadId = loadId;
        const load = this.loads.find(l => l.id == loadId);
        if (!load || !this.acceptLoadModal) return;
        
        const summary = document.getElementById('carrierAcceptLoadSummary');
        if (summary) {
            summary.innerHTML = `
                <div class="carrier-accept-summary">
                    <div class="carrier-summary-route">
                        <strong>${load.origin.city}</strong> → <strong>${load.destination.city}</strong>
                    </div>
                    <div class="carrier-summary-details">
                        ${load.weight} kg • ${load.volume}m³ • ${this.getTypeLabel(load.type)}
                    </div>
                    <div class="carrier-summary-price">
                        $${load.price.toLocaleString()}
                    </div>
                </div>
            `;
        }
        
        this.acceptLoadModal.classList.add('carrier-active');
    }

    hideAcceptModal() {
        if (this.acceptLoadModal) {
            this.acceptLoadModal.classList.remove('carrier-active');
        }
    }

    confirmAcceptLoad() {
        const load = this.loads.find(l => l.id == this.currentLoadId);
        if (!load) return;
        
        // Simulate API call
        this.showNotification(`¡Carga aceptada! Te has asignado a la carga ${load.origin.city} → ${load.destination.city}`, 'success');
        
        // Remove the accepted load from the list
        this.loads = this.loads.filter(l => l.id !== this.currentLoadId);
        this.applyFilters();
        
        this.hideAcceptModal();
    }

    hideAllModals() {
        this.hideLoadDetails();
        this.hideAcceptModal();
    }

    loadMoreLoads() {
        // Simulate loading more loads
        this.showNotification('Cargando más cargas disponibles...', 'info');
        
        setTimeout(() => {
            // In a real app, this would be an API call
            this.showNotification('No hay más cargas disponibles en este momento', 'info');
        }, 1500);
    }

    createLoadDetailsContent(load) {
        return `
            <div class="carrier-load-full-details">
                <div class="carrier-detail-section">
                    <h4>Información de la Ruta</h4>
                    <div class="carrier-detail-grid">
                        <div class="carrier-detail-item-full">
                            <label>Origen:</label>
                            <span>${load.origin.city} - ${load.origin.address}</span>
                        </div>
                        <div class="carrier-detail-item-full">
                            <label>Destino:</label>
                            <span>${load.destination.city} - ${load.destination.address}</span>
                        </div>
                        <div class="carrier-detail-item-full">
                            <label>Distancia:</label>
                            <span>${load.distance} km</span>
                        </div>
                    </div>
                </div>
                
                <div class="carrier-detail-section">
                    <h4>Detalles de la Carga</h4>
                    <div class="carrier-detail-grid">
                        <div class="carrier-detail-item-full">
                            <label>Peso:</label>
                            <span>${load.weight.toLocaleString()} kg</span>
                        </div>
                        <div class="carrier-detail-item-full">
                            <label>Volumen:</label>
                            <span>${load.volume} m³</span>
                        </div>
                        <div class="carrier-detail-item-full">
                            <label>Tipo:</label>
                            <span>${this.getTypeLabel(load.type)}</span>
                        </div>
                        <div class="carrier-detail-item-full">
                            <label>Requisitos Especiales:</label>
                            <span>${this.getRequirements(load)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="carrier-detail-section">
                    <h4>Horarios</h4>
                    <div class="carrier-detail-grid">
                        <div class="carrier-detail-item-full">
                            <label>Recogida:</label>
                            <span>${load.pickupTime}</span>
                        </div>
                        <div class="carrier-detail-item-full">
                            <label>Entrega:</label>
                            <span>${load.deliveryTime}</span>
                        </div>
                    </div>
                </div>
                
                <div class="carrier-detail-section">
                    <h4>Información de Pago</h4>
                    <div class="carrier-detail-grid">
                        <div class="carrier-detail-item-full">
                            <label>Precio Ofrecido:</label>
                            <span class="carrier-price-large">$${load.price.toLocaleString()}</span>
                        </div>
                        <div class="carrier-detail-item-full">
                            <label>Tipo de Precio:</label>
                            <span>${this.getPriceTypeLabel(load.priceType)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="carrier-detail-actions">
                    <button class="carrier-btn carrier-btn-primary carrier-btn-accept-full">
                        <i class="fas fa-check"></i>
                        Aceptar esta Carga
                    </button>
                </div>
            </div>
        `;
    }

    getTypeLabel(type) {
        const types = {
            general: 'Carga General',
            refrigerated: 'Carga Refrigerada',
            dangerous: 'Materiales Peligrosos',
            fragile: 'Carga Frágil'
        };
        return types[type] || 'Carga General';
    }

    getPriceTypeLabel(priceType) {
        const types = {
            fixed: 'Precio Fijo',
            negotiable: 'Negociable',
            certification: 'Requiere Certificación',
            special: 'Manejo Especial'
        };
        return types[priceType] || 'Precio Fijo';
    }

    getRequirements(load) {
        const requirements = [];
        if (load.type === 'refrigerated') requirements.push('Vehículo refrigerado');
        if (load.type === 'dangerous') requirements.push('Certificación de materiales peligrosos');
        if (load.type === 'fragile') requirements.push('Manejo especial para carga frágil');
        if (load.urgency === 'high') requirements.push('Entrega urgente');
        
        return requirements.length > 0 ? requirements.join(', ') : 'Ninguno';
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.carrier-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `carrier-notification carrier-notification-${type}`;
        notification.innerHTML = `
            <div class="carrier-notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="carrier-notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-large);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            animation: carrier-slideInRight 0.3s ease;
        `;

        // Close button
        notification.querySelector('.carrier-notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || '#3B82F6';
    }
}

// Utility functions
const CarrierLoadsUtils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
        }).format(amount);
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarrierLoads();
    
    // Add CSS for additional styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes carrier-slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .carrier-notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        }
        
        .carrier-notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .carrier-no-results {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-muted);
        }
        
        .carrier-no-results i {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        .carrier-no-results h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        
        .carrier-load-full-details {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
        
        .carrier-detail-section h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-light);
        }
        
        .carrier-detail-grid {
            display: grid;
            gap: 1rem;
        }
        
        .carrier-detail-item-full {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-light);
        }
        
        .carrier-detail-item-full label {
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .carrier-detail-item-full span {
            color: var(--text-secondary);
            text-align: right;
        }
        
        .carrier-price-large {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--accent-primary);
        }
        
        .carrier-detail-actions {
            text-align: center;
            padding-top: 1rem;
            border-top: 1px solid var(--border-light);
        }
        
        .carrier-accept-summary {
            text-align: center;
            padding: 1.5rem;
            background: var(--bg-gray);
            border-radius: var(--border-radius);
            margin: 1rem 0;
        }
        
        .carrier-summary-route {
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .carrier-summary-details {
            color: var(--text-secondary);
            margin-bottom: 1rem;
        }
        
        .carrier-summary-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-primary);
        }
    `;
    document.head.appendChild(style);
});