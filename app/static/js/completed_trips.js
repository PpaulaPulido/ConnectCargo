// completed_trips.js - Funcionalidades para viajes completados

class CompletedTripsManager {
    constructor() {
        this.trips = [];
        this.currentFilters = {
            search: '',
            time: 'month',
            rating: 'all'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.loadTrips();
    }

    setupEventListeners() {
        // Exportar reporte
        document.getElementById('exportTripsBtn')?.addEventListener('click', () => {
            this.exportTripsReport();
        });

        // Botones de acción en viajes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.trip-action-btn')) {
                const btn = e.target.closest('.trip-action-btn');
                this.handleTripAction(btn);
            }
        });

        // Cerrar modal
        document.getElementById('closeTripModal')?.addEventListener('click', () => {
            this.closeTripModal();
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('tripDetailsModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('tripDetailsModal')) {
                this.closeTripModal();
            }
        });
    }

    setupFilters() {
        const searchInput = document.getElementById('tripsSearch');
        const timeFilter = document.getElementById('timeFilter');
        const ratingFilter = document.getElementById('ratingFilter');

        // Búsqueda
        if (searchInput) {
            const debouncedSearch = this.debounce((query) => {
                this.currentFilters.search = query.toLowerCase();
                this.applyFilters();
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Filtro de tiempo
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.currentFilters.time = e.target.value;
                this.applyFilters();
            });
        }

        // Filtro de calificación
        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.currentFilters.rating = e.target.value;
                this.applyFilters();
            });
        }
    }

    loadTrips() {
        // En una implementación real, esto cargaría desde una API
        const tripCards = document.querySelectorAll('.trip-card');
        this.trips = Array.from(tripCards).map(card => ({
            element: card,
            rating: parseInt(card.getAttribute('data-rating')),
            date: card.getAttribute('data-date'),
            title: card.querySelector('h3').textContent,
            origin: card.querySelector('.location.origin strong').textContent,
            destination: card.querySelector('.location.destination strong').textContent,
            client: card.querySelector('.detail-item i.fa-user-tie')?.closest('.detail-item')?.querySelector('span')?.textContent || ''
        }));

        this.updateEmptyState();
    }

    applyFilters() {
        this.trips.forEach(trip => {
            const matchesSearch = 
                !this.currentFilters.search ||
                trip.title.toLowerCase().includes(this.currentFilters.search) ||
                trip.origin.toLowerCase().includes(this.currentFilters.search) ||
                trip.destination.toLowerCase().includes(this.currentFilters.search) ||
                trip.client.toLowerCase().includes(this.currentFilters.search);
            
            const matchesTime = this.matchesTimeFilter(trip.date);
            const matchesRating = this.matchesRatingFilter(trip.rating);
            
            if (matchesSearch && matchesTime && matchesRating) {
                trip.element.classList.remove('hidden');
            } else {
                trip.element.classList.add('hidden');
            }
        });

        this.updateEmptyState();
    }

    matchesTimeFilter(tripDate) {
        const tripDateTime = new Date(tripDate);
        const now = new Date();
        
        switch (this.currentFilters.time) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return tripDateTime >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return tripDateTime >= monthAgo;
            case 'quarter':
                const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                return tripDateTime >= quarterAgo;
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return tripDateTime >= yearAgo;
            default:
                return true;
        }
    }

    matchesRatingFilter(rating) {
        if (this.currentFilters.rating === 'all') return true;
        
        const minRating = parseInt(this.currentFilters.rating);
        return rating >= minRating;
    }

    handleTripAction(button) {
        const tripCard = button.closest('.trip-card');
        const actionText = button.textContent.trim();
        
        switch (actionText) {
            case 'Ver Comprobante':
                this.viewReceipt(tripCard);
                break;
            case 'Repetir Ruta':
                this.repeatRoute(tripCard);
                break;
            case 'Contactar Cliente':
                this.contactClient(tripCard);
                break;
            case 'Buscar Cargas Disponibles':
                this.searchAvailableLoads();
                break;
        }
    }

    viewReceipt(tripCard) {
        const tripId = tripCard.querySelector('h3').textContent.split(' - ')[0];
        this.showToast(`Generando comprobante para ${tripId}`, 'info');
        
        // Simular generación de comprobante
        setTimeout(() => {
            this.showToast('Comprobante descargado exitosamente', 'success');
        }, 1500);
    }

    repeatRoute(tripCard) {
        const origin = tripCard.querySelector('.location.origin strong').textContent;
        const destination = tripCard.querySelector('.location.destination strong').textContent;
        
        this.showToast(`Buscando cargas similares en ruta ${origin} - ${destination}`, 'info');
        
        // Redirigir a cargas disponibles con filtros preaplicados
        setTimeout(() => {
            // window.location.href = `/carrier/loads?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
            this.showToast('Redirigiendo a cargas disponibles...', 'success');
        }, 1000);
    }

    contactClient(tripCard) {
        const clientName = tripCard.querySelector('.detail-item i.fa-user-tie')?.closest('.detail-item')?.querySelector('span')?.textContent;
        this.showToast(`Abriendo chat con ${clientName}`, 'info');
        
        // Aquí abrirías el modal de chat o redirigirías a la sección de mensajes
    }

    searchAvailableLoads() {
        this.showToast('Buscando cargas disponibles...', 'info');
        // Redirigir a la página de cargas disponibles
        // window.location.href = '/carrier/loads';
    }

    async exportTripsReport() {
        const exportBtn = document.getElementById('exportTripsBtn');
        
        try {
            this.setButtonLoading(exportBtn, true);
            
            // Simular generación de reporte
            await this.simulateAPICall('export-trips');
            
            this.showToast('Reporte exportado exitosamente', 'success');
            
        } catch (error) {
            this.showToast('Error al exportar el reporte', 'error');
        } finally {
            this.setButtonLoading(exportBtn, false);
        }
    }

    viewTripDetails(tripCard) {
        const tripId = tripCard.querySelector('h3').textContent;
        this.openTripModal(tripId);
    }

    openTripModal(tripId) {
        const modal = document.getElementById('tripDetailsModal');
        const modalBody = modal.querySelector('.modal-body');
        
        // Aquí cargarías los detalles completos del viaje
        modalBody.innerHTML = `
            <div class="trip-details-content">
                <h4>Detalles completos del viaje</h4>
                <p>Cargando información de ${tripId}...</p>
            </div>
        `;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeTripModal() {
        const modal = document.getElementById('tripDetailsModal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    updateEmptyState() {
        const emptyState = document.getElementById('emptyTrips');
        const visibleTrips = this.trips.filter(trip => 
            !trip.element.classList.contains('hidden')
        ).length;

        if (visibleTrips === 0 && this.trips.length > 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        // Mostrar estado vacío solo si no hay viajes en absoluto
        if (this.trips.length === 0) {
            emptyState.classList.remove('hidden');
        }
    }

    // Utilidades
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
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-file-export"></i> Exportar Reporte';
        }
    }

    async simulateAPICall(endpoint) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.1) {
                    reject(new Error('Error de conexión'));
                } else {
                    resolve({ success: true });
                }
            }, 2000);
        });
    }

    showToast(message, type = 'info') {
        if (window.NotificationsManager) {
            window.NotificationsManager.showToast(message, type);
        } else {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--bg-main);
                border: 1px solid var(--border-light);
                border-radius: var(--border-radius);
                padding: 1rem 1.5rem;
                box-shadow: var(--shadow-large);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => toast.style.transform = 'translateX(0)', 100);
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CompletedTripsManager();
});

// Exportar para uso global
window.CompletedTripsManager = CompletedTripsManager;