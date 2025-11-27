class FindDrivers {
    constructor() {
        this.drivers = [];
        this.filters = {
            location: '',
            vehicleType: '',
            specialty: '',
            minRating: '',
            verified: true,
            insurance: false,
            availableNow: false,
            available24h: false
        };
        this.sortBy = 'rating';
        this.currentPage = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDrivers();
        this.applyFilters();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }

        // Filter functionality
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.filters[e.target.id.replace('Filter', '')] = e.target.value;
                this.applyFilters();
            });
        });

        // Checkbox filters
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.filters[e.target.id.replace('Filter', '')] = e.target.checked;
                this.applyFilters();
            });
        });

        // Apply filters button
        const applyFiltersBtn = document.querySelector('.apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }

        // Clear filters
        const clearFiltersBtn = document.querySelector('.clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Driver actions
        this.setupDriverActions();
    }

    loadDrivers() {
        // Simulated driver data - in a real app, this would come from an API
        this.drivers = [
            {
                id: 1,
                name: "Carlos Rodríguez",
                rating: 4.8,
                reviewCount: 142,
                location: "Bogotá D.C.",
                vehicles: ["Camiones 5T y 10T"],
                experience: "8 años",
                completedTrips: 347,
                successRate: 98,
                specialties: ["Carga General", "Refrigerada", "Dimensional"],
                available: true,
                responseTime: "15 min",
                verified: true,
                featured: true,
                avatar: "driver-1.jpg"
            },
            {
                id: 2,
                name: "María González",
                rating: 5.0,
                reviewCount: 89,
                location: "Medellín",
                vehicles: ["Vans y Camiones 3.5T"],
                experience: "5 años",
                completedTrips: 213,
                successRate: 100,
                specialties: ["Carga General", "Frágil", "Mercancía Peligrosa"],
                available: true,
                responseTime: "10 min",
                verified: true,
                featured: false,
                avatar: "driver-2.jpg"
            },
            {
                id: 3,
                name: "Javier López",
                rating: 4.9,
                reviewCount: 76,
                location: "Cali",
                vehicles: ["Tractocamión Refrigerado"],
                experience: "12 años",
                completedTrips: 521,
                successRate: 99,
                specialties: ["Refrigerada", "Carga Viva", "Larga Distancia"],
                available: false,
                responseTime: "2 horas",
                verified: true,
                featured: false,
                avatar: "driver-3.jpg"
            },
            {
                id: 4,
                name: "Ana Martínez",
                rating: 4.7,
                reviewCount: 134,
                location: "Barranquilla",
                vehicles: ["Camionetas Pickup"],
                experience: "3 años",
                completedTrips: 187,
                successRate: 96,
                specialties: ["Paquetería", "Mudanzas", "Entregas Rápidas"],
                available: true,
                responseTime: "5 min",
                verified: true,
                featured: false,
                avatar: "driver-4.jpg"
            }
        ];
    }

    handleSearch(searchTerm) {
        if (searchTerm.trim()) {
            this.filters.search = searchTerm.toLowerCase();
        } else {
            delete this.filters.search;
        }
        this.applyFilters();
    }

    applyFilters() {
        let filteredDrivers = [...this.drivers];

        // Apply search filter
        if (this.filters.search) {
            filteredDrivers = filteredDrivers.filter(driver => 
                driver.name.toLowerCase().includes(this.filters.search) ||
                driver.vehicles.some(vehicle => vehicle.toLowerCase().includes(this.filters.search)) ||
                driver.specialties.some(specialty => specialty.toLowerCase().includes(this.filters.search))
            );
        }

        // Apply location filter
        if (this.filters.location) {
            filteredDrivers = filteredDrivers.filter(driver => 
                driver.location.toLowerCase().includes(this.filters.location)
            );
        }

        // Apply vehicle type filter
        if (this.filters.vehicleType) {
            filteredDrivers = filteredDrivers.filter(driver => 
                driver.vehicles.some(vehicle => 
                    vehicle.toLowerCase().includes(this.filters.vehicleType)
                )
            );
        }

        // Apply specialty filter
        if (this.filters.specialty) {
            filteredDrivers = filteredDrivers.filter(driver => 
                driver.specialties.some(specialty => 
                    specialty.toLowerCase().includes(this.filters.specialty)
                )
            );
        }

        // Apply rating filter
        if (this.filters.minRating) {
            filteredDrivers = filteredDrivers.filter(driver => 
                driver.rating >= parseFloat(this.filters.minRating)
            );
        }

        // Apply verification filter
        if (this.filters.verified) {
            filteredDrivers = filteredDrivers.filter(driver => driver.verified);
        }

        // Apply availability filter
        if (this.filters.availableNow) {
            filteredDrivers = filteredDrivers.filter(driver => driver.available);
        }

        // Sort drivers
        filteredDrivers = this.sortDrivers(filteredDrivers);

        // Update UI
        this.updateResultsCount(filteredDrivers.length);
        this.renderDrivers(filteredDrivers);
    }

    sortDrivers(drivers) {
        switch (this.sortBy) {
            case 'rating':
                return drivers.sort((a, b) => b.rating - a.rating);
            case 'experience':
                return drivers.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
            case 'price':
                // This would require price data
                return drivers;
            case 'completed':
                return drivers.sort((a, b) => b.completedTrips - a.completedTrips);
            case 'recent':
                // This would require join date data
                return drivers;
            default:
                return drivers;
        }
    }

    clearFilters() {
        // Reset filter values
        this.filters = {
            location: '',
            vehicleType: '',
            specialty: '',
            minRating: '',
            verified: true,
            insurance: false,
            availableNow: false,
            available24h: false
        };

        // Reset UI elements
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.value = '';
        });

        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.id === 'verifiedFilter') {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        });

        // Clear search
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // Reapply filters
        this.applyFilters();
    }

    updateResultsCount(count) {
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${count} de ${this.drivers.length} conductores`;
        }
    }

    renderDrivers(drivers) {
        const driversGrid = document.querySelector('.drivers-grid');
        if (!driversGrid) return;

        driversGrid.innerHTML = '';

        if (drivers.length === 0) {
            driversGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron conductores</h3>
                    <p>Intenta ajustar tus filtros o términos de búsqueda</p>
                    <button class="clear-filters-btn" onclick="findDrivers.clearFilters()">
                        Limpiar Filtros
                    </button>
                </div>
            `;
            return;
        }

        drivers.forEach(driver => {
            const driverCard = this.createDriverCard(driver);
            driversGrid.appendChild(driverCard);
        });
    }

    createDriverCard(driver) {
        const card = document.createElement('div');
        card.className = `driver-card ${driver.featured ? 'featured' : ''}`;
        
        card.innerHTML = `
            <div class="driver-card-header">
                <div class="driver-verified-badge">
                    <i class="fas fa-shield-alt"></i>
                    Verificado
                </div>
                ${driver.featured ? `
                <div class="driver-featured-badge">
                    <i class="fas fa-crown"></i>
                    Premium
                </div>
                ` : ''}
            </div>

            <div class="driver-card-content">
                <div class="driver-profile">
                    <div class="driver-avatar">
                        <img src="{{ url_for('static', filename='images/${driver.avatar}') }}" alt="${driver.name}">
                        <div class="driver-status ${driver.available ? 'online' : 'away'}"></div>
                    </div>
                    <div class="driver-info">
                        <h3 class="driver-name">${driver.name}</h3>
                        <div class="driver-rating">
                            <div class="stars">
                                ${this.generateStars(driver.rating)}
                            </div>
                            <span class="rating-value">${driver.rating}</span>
                            <span class="rating-count">(${driver.reviewCount})</span>
                        </div>
                        <div class="driver-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${driver.location}
                        </div>
                    </div>
                </div>

                <div class="driver-specs">
                    <div class="spec-item">
                        <i class="fas fa-truck"></i>
                        <span>${driver.vehicles[0]}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-briefcase"></i>
                        <span>${driver.experience} de experiencia</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-road"></i>
                        <span>${driver.completedTrips} viajes completados</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-percentage"></i>
                        <span>${driver.successRate}% de entregas exitosas</span>
                    </div>
                </div>

                <div class="driver-specialties">
                    <h4>Especialidades:</h4>
                    <div class="specialty-tags">
                        ${driver.specialties.map(specialty => 
                            `<span class="specialty-tag">${specialty}</span>`
                        ).join('')}
                    </div>
                </div>

                <div class="driver-availability">
                    <div class="availability-status ${driver.available ? 'available' : 'away'}">
                        <i class="fas fa-circle"></i>
                        ${driver.available ? 'Disponible ahora' : 'En viaje'}
                    </div>
                    <div class="response-time">
                        <i class="fas fa-clock"></i>
                        ${driver.available ? `Respuesta: ${driver.responseTime}` : `Disponible en ${driver.responseTime}`}
                    </div>
                </div>
            </div>

            <div class="driver-card-actions">
                <button class="driver-action-btn outline" onclick="findDrivers.viewProfile(${driver.id})">
                    <i class="fas fa-eye"></i>
                    Ver Perfil
                </button>
                <button class="driver-action-btn primary" onclick="findDrivers.contactDriver(${driver.id})">
                    <i class="fas fa-paper-plane"></i>
                    Contactar
                </button>
            </div>
        `;

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    setupDriverActions() {
        // This would be handled by the individual buttons in the cards
    }

    viewProfile(driverId) {
        this.showNotification('Redirigiendo al perfil del conductor...', 'info');
        // In a real app, this would navigate to the driver's profile page
        setTimeout(() => {
            // window.location.href = `/driver/profile/${driverId}`;
            console.log('Viewing profile for driver:', driverId);
        }, 1000);
    }

    contactDriver(driverId) {
        this.showNotification('Iniciando conversación con el conductor...', 'info');
        // In a real app, this would open a chat/message interface
        setTimeout(() => {
            // Open chat modal or redirect to messages
            console.log('Contacting driver:', driverId);
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.drivers-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `drivers-notification drivers-notification-${type}`;
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
            animation: driversSlideInRight 0.3s ease;
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
            notification.style.animation = 'driversSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.findDrivers = new FindDrivers();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes driversSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes driversSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
        
        .no-results {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem 2rem;
            background: var(--bg-main);
            border: 2px dashed var(--border-light);
            border-radius: var(--border-radius);
        }
        
        .no-results i {
            font-size: 3rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
        }
        
        .no-results h3 {
            font-size: 1.5rem;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .no-results p {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
    `;
    document.head.appendChild(style);
});