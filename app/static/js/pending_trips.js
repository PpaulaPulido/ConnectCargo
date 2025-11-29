// Pending Trips functionality
class PendingTrips {
    constructor() {
        this.tripsList = document.getElementById('tripsList');
        this.emptyState = document.getElementById('emptyState');
        this.negotiationModal = document.getElementById('negotiationModal');
        this.filters = {
            status: document.getElementById('statusFilter'),
            date: document.getElementById('dateFilter'),
            type: document.getElementById('typeFilter'),
            price: document.getElementById('priceFilter')
        };
        this.sortSelect = document.getElementById('sortTrips');
        this.clearFiltersBtn = document.getElementById('clearFilters');
        
        this.currentNegotiationTrip = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.checkEmptyState();
    }

    setupEventListeners() {
        // Filter changes
        Object.values(this.filters).forEach(filter => {
            filter?.addEventListener('change', () => this.applyFilters());
        });

        // Sort changes
        this.sortSelect?.addEventListener('change', () => this.sortTrips());

        // Clear filters
        this.clearFiltersBtn?.addEventListener('click', () => this.clearFilters());

        // Close modal on outside click
        this.negotiationModal?.addEventListener('click', (e) => {
            if (e.target === this.negotiationModal) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.negotiationModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    setupFilters() {
        // Initialize filter values from URL or default
        const urlParams = new URLSearchParams(window.location.search);
        Object.keys(this.filters).forEach(key => {
            const value = urlParams.get(key);
            if (value && this.filters[key]) {
                this.filters[key].value = value;
            }
        });
        
        this.applyFilters();
    }

    applyFilters() {
        const trips = this.tripsList.querySelectorAll('.trip-card');
        let visibleCount = 0;

        trips.forEach(trip => {
            const status = trip.dataset.status;
            const date = trip.dataset.date;
            const type = trip.dataset.type;
            const price = trip.dataset.price;

            const statusMatch = this.filters.status.value === 'all' || status === this.filters.status.value;
            const dateMatch = this.filters.date.value === 'all' || date === this.filters.date.value;
            const typeMatch = this.filters.type.value === 'all' || type === this.filters.type.value;
            const priceMatch = this.filters.price.value === 'all' || price === this.filters.price.value;

            if (statusMatch && dateMatch && typeMatch && priceMatch) {
                trip.style.display = 'block';
                visibleCount++;
            } else {
                trip.style.display = 'none';
            }
        });

        this.checkEmptyState(visibleCount);
        this.updateURLParams();
    }

    sortTrips() {
        const trips = Array.from(this.tripsList.querySelectorAll('.trip-card'));
        const sortBy = this.sortSelect.value;

        trips.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return this.compareByDate(a, b, false);
                case 'oldest':
                    return this.compareByDate(a, b, true);
                case 'price-high':
                    return this.compareByPrice(a, b, false);
                case 'price-low':
                    return this.compareByPrice(a, b, true);
                case 'pickup-date':
                    return this.compareByPickupDate(a, b);
                default:
                    return 0;
            }
        });

        // Clear and re-append sorted trips
        trips.forEach(trip => this.tripsList.appendChild(trip));
    }

    compareByDate(a, b, ascending = false) {
        const aDate = new Date(a.querySelector('.trip-date').textContent.replace('Solicitado: ', ''));
        const bDate = new Date(b.querySelector('.trip-date').textContent.replace('Solicitado: ', ''));
        return ascending ? aDate - bDate : bDate - aDate;
    }

    compareByPrice(a, b, ascending = false) {
        const aPrice = this.extractPrice(a);
        const bPrice = this.extractPrice(b);
        return ascending ? aPrice - bPrice : bPrice - aPrice;
    }

    compareByPickupDate(a, b) {
        const aDate = this.extractPickupDate(a);
        const bDate = this.extractPickupDate(b);
        return aDate - bDate;
    }

    extractPrice(trip) {
        const priceText = trip.querySelector('.detail-value.price')?.textContent || '$0';
        return parseInt(priceText.replace(/[^\d]/g, '')) || 0;
    }

    extractPickupDate(trip) {
        const timeText = trip.querySelector('.point-time')?.textContent || '';
        const dateMatch = timeText.match(/(\d{1,2} \w+ \d{4})/);
        return dateMatch ? new Date(dateMatch[1]) : new Date();
    }

    checkEmptyState(visibleCount = null) {
        if (visibleCount === null) {
            visibleCount = this.tripsList.querySelectorAll('.trip-card[style="display: block"]').length;
        }

        if (visibleCount === 0) {
            this.tripsList.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.tripsList.style.display = 'block';
            this.emptyState.style.display = 'none';
        }
    }

    updateURLParams() {
        const params = new URLSearchParams();
        Object.keys(this.filters).forEach(key => {
            if (this.filters[key].value !== 'all') {
                params.set(key, this.filters[key].value);
            }
        });

        const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
    }

    clearFilters() {
        Object.values(this.filters).forEach(filter => {
            if (filter) filter.value = 'all';
        });
        this.applyFilters();
    }

    // Trip Actions
    acceptTrip(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        CarrierUtils.showNotification(`Aceptando viaje ${tripId}...`, 'info');
        
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.disabled = false;
            
            // Update trip status
            tripCard.dataset.status = 'confirmed';
            const badge = tripCard.querySelector('.trip-badge');
            badge.className = 'trip-badge confirmed';
            badge.innerHTML = '<i class="fas fa-check-circle"></i> Confirmado';
            
            tripCard.querySelector('.trip-date').textContent = 'Confirmado: Hoy ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
            
            CarrierUtils.showNotification(`¡Viaje ${tripId} aceptado exitosamente!`, 'success');
            this.applyFilters();
        }, 2000);
    }

    negotiateTrip(button) {
        this.currentNegotiationTrip = button.closest('.trip-card');
        this.openNegotiationModal();
    }

    rejectTrip(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        if (confirm(`¿Estás seguro de que quieres rechazar el viaje ${tripId}?`)) {
            CarrierUtils.showNotification(`Rechazando viaje ${tripId}...`, 'info');
            
            // Show loading state
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            button.disabled = true;

            setTimeout(() => {
                tripCard.style.opacity = '0.5';
                tripCard.style.pointerEvents = 'none';
                
                CarrierUtils.showNotification(`Viaje ${tripId} rechazado`, 'success');
                this.applyFilters();
            }, 1500);
        }
    }

    modifyOffer(button) {
        this.currentNegotiationTrip = button.closest('.trip-card');
        this.openNegotiationModal();
    }

    acceptCounterOffer(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        CarrierUtils.showNotification(`Aceptando contraoferta para ${tripId}...`, 'info');
        
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        button.disabled = true;

        setTimeout(() => {
            tripCard.dataset.status = 'confirmed';
            const badge = tripCard.querySelector('.trip-badge');
            badge.className = 'trip-badge confirmed';
            badge.innerHTML = '<i class="fas fa-check-circle"></i> Confirmado';
            
            CarrierUtils.showNotification(`¡Contrato confirmado para ${tripId}!`, 'success');
            this.applyFilters();
        }, 2000);
    }

    cancelNegotiation(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        if (confirm(`¿Estás seguro de que quieres cancelar la negociación del viaje ${tripId}?`)) {
            tripCard.style.opacity = '0.5';
            tripCard.style.pointerEvents = 'none';
            CarrierUtils.showNotification(`Negociación cancelada para ${tripId}`, 'info');
            this.applyFilters();
        }
    }

    viewContract(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        CarrierUtils.showNotification(`Abriendo contrato del viaje ${tripId}...`, 'info');
        
        // Simulate contract opening
        setTimeout(() => {
            CarrierUtils.showNotification('Contrato abierto en nueva ventana', 'success');
        }, 1000);
    }

    startTrip(button) {
        const tripCard = button.closest('.trip-card');
        const tripId = tripCard.querySelector('.trip-id').textContent;
        
        CarrierUtils.showNotification(`Iniciando viaje ${tripId}...`, 'info');
        
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando...';
        button.disabled = true;

        setTimeout(() => {
            CarrierUtils.showNotification(`¡Viaje ${tripId} iniciado! Redirigiendo al seguimiento...`, 'success');
            
            // In a real app, this would redirect to the active trip tracking page
            setTimeout(() => {
                // window.location.href = '/carrier/active-trip/' + tripId;
            }, 1500);
        }, 2000);
    }

    contactClient(button) {
        const tripCard = button.closest('.trip-card');
        const clientName = tripCard.querySelector('.client-details h5').textContent;
        CarrierUtils.showNotification(`Abriendo chat con ${clientName}...`, 'info');
        
        // Simulate chat opening
        setTimeout(() => {
            CarrierUtils.showNotification('Chat abierto', 'success');
        }, 1000);
    }

    // Modal Methods
    openNegotiationModal() {
        if (!this.currentNegotiationTrip) return;
        
        const currentOffer = this.currentNegotiationTrip.querySelector('.offer.original .price')?.textContent || '$750,000';
        document.querySelector('.offer-amount').textContent = currentOffer;
        
        this.negotiationModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.negotiationModal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentNegotiationTrip = null;
    }

    submitCounterOffer() {
        const counterOffer = document.getElementById('counterOffer').value;
        const message = document.getElementById('offerMessage').value;
        
        if (!counterOffer) {
            CarrierUtils.showNotification('Por favor ingresa un monto para tu contraoferta', 'error');
            return;
        }

        CarrierUtils.showNotification('Enviando contraoferta...', 'info');
        
        // Show loading state in modal
        const submitBtn = this.negotiationModal.querySelector('.btn-primary');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        setTimeout(() => {
            this.closeModal();
            
            if (this.currentNegotiationTrip) {
                // Update trip with negotiation status
                this.currentNegotiationTrip.dataset.status = 'negotiation';
                const badge = this.currentNegotiationTrip.querySelector('.trip-badge');
                badge.className = 'trip-badge negotiation';
                badge.innerHTML = '<i class="fas fa-comments"></i> En Negociación';
                
                CarrierUtils.showNotification('¡Contraoferta enviada exitosamente!', 'success');
                this.applyFilters();
            }
            
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }, 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pendingTrips = new PendingTrips();
});