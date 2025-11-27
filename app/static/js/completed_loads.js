class CompletedLoads {
    constructor() {
        this.completedLoads = [];
        this.filters = {
            search: '',
            time: '',
            rating: '',
            driver: ''
        };
        this.currentPage = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.applyFilters();
        this.setupRatingSystem();
        this.setupPagination();
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
        const timeFilter = document.getElementById('timeFilter');
        const ratingFilter = document.getElementById('ratingFilter');
        const driverFilter = document.getElementById('driverFilter');
        
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.filters.time = e.target.value;
                this.applyFilters();
            });
        }

        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.filters.rating = e.target.value;
                this.applyFilters();
            });
        }

        if (driverFilter) {
            driverFilter.addEventListener('change', (e) => {
                this.filters.driver = e.target.value;
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

        // Export button
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }

        // Document downloads
        this.setupDocumentDownloads();

        // Summary toggle
        const summaryToggle = document.querySelector('.summary-toggle');
        if (summaryToggle) {
            summaryToggle.addEventListener('click', () => {
                this.toggleSummary();
            });
        }

        // Repeat shipment buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="repeat"]')) {
                const card = e.target.closest('.completed-load-card');
                const loadId = card.getAttribute('data-load');
                const load = this.completedLoads.find(l => l.id == loadId);
                this.repeatShipment(load);
            }

            if (e.target.closest('[data-action="save-driver"]')) {
                const card = e.target.closest('.completed-load-card');
                const loadId = card.getAttribute('data-load');
                const load = this.completedLoads.find(l => l.id == loadId);
                this.saveDriver(load.driver);
            }

            if (e.target.closest('[data-action="download-all"]')) {
                const card = e.target.closest('.completed-load-card');
                const loadId = card.getAttribute('data-load');
                const load = this.completedLoads.find(l => l.id == loadId);
                this.downloadAllDocuments(load);
            }
        });
    }

    setupRatingSystem() {
        // Rating stars interaction
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-star') && e.target.closest('.stars-container')) {
                this.handleStarClick(e.target);
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('fa-star') && e.target.closest('.stars-container')) {
                this.handleStarHover(e.target);
            }
        });

        document.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.rating-stars-input')) {
                const container = e.target.closest('.rating-stars-input');
                this.resetStarHover(container);
            }
        });

        // Rating submission
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="submit-rating"]')) {
                e.preventDefault();
                const card = e.target.closest('.completed-load-card');
                const loadId = card.getAttribute('data-load');
                const load = this.completedLoads.find(l => l.id == loadId);
                this.submitRating(card, load);
            }

            if (e.target.closest('[data-action="remind-later"]')) {
                e.preventDefault();
                const card = e.target.closest('.completed-load-card');
                const loadId = card.getAttribute('data-load');
                const load = this.completedLoads.find(l => l.id == loadId);
                this.remindLater(load);
            }
        });
    }

    setupPagination() {
        const paginationBtns = document.querySelectorAll('.pagination-btn');
        paginationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (btn.querySelector('.fa-chevron-left')) {
                    this.previousPage();
                } else if (btn.querySelector('.fa-chevron-right')) {
                    this.nextPage();
                } else {
                    const pageNum = parseInt(btn.textContent);
                    if (!isNaN(pageNum)) {
                        this.goToPage(pageNum);
                    }
                }
            });
        });
    }

    handleStarClick(clickedStar) {
        const container = clickedStar.closest('.stars-container');
        const rating = parseInt(clickedStar.getAttribute('data-rating'));
        const ratingText = container.nextElementSibling;
        const submitBtn = container.closest('.rating-prompt')?.querySelector('.prompt-btn.primary');

        // Update stars visually
        const stars = container.querySelectorAll('i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas');
                star.classList.add('active');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
                star.classList.remove('active');
            }
        });

        // Update rating text
        const ratingTexts = [
            'Muy malo',
            'Malo',
            'Regular',
            'Bueno',
            'Excelente'
        ];
        if (ratingText) {
            ratingText.textContent = ratingTexts[rating - 1];
        }

        // Enable submit button
        if (submitBtn) {
            submitBtn.disabled = false;
        }

        // Store the rating for submission
        container.setAttribute('data-current-rating', rating);
    }

    handleStarHover(hoveredStar) {
        const container = hoveredStar.closest('.stars-container');
        const hoverRating = parseInt(hoveredStar.getAttribute('data-rating'));
        const ratingText = container.nextElementSibling;

        const stars = container.querySelectorAll('i');
        stars.forEach((star, index) => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= hoverRating) {
                star.style.color = '#F59E0B';
            } else {
                star.style.color = '#E5E7EB';
            }
        });

        if (ratingText) {
            const ratingTexts = [
                'Muy malo',
                'Malo',
                'Regular',
                'Bueno',
                'Excelente'
            ];
            ratingText.textContent = ratingTexts[hoverRating - 1];
        }
    }

    resetStarHover(container) {
        const starsContainer = container.querySelector('.stars-container');
        const currentRating = parseInt(starsContainer.getAttribute('data-current-rating')) || 0;
        const ratingText = container.querySelector('.rating-text');
        const stars = starsContainer.querySelectorAll('i');

        stars.forEach((star, index) => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= currentRating) {
                star.style.color = '#F59E0B';
            } else {
                star.style.color = '#E5E7EB';
            }
        });

        if (ratingText && currentRating === 0) {
            ratingText.textContent = 'Selecciona una calificación';
        }
    }

    loadSampleData() {
        // Simulated completed loads data
        this.completedLoads = [
            {
                id: 1,
                reference: 'CC-2024-007',
                status: 'completed',
                completionDate: 'Hoy, 2:15 PM',
                duration: '5h 45min',
                driver: {
                    name: 'Carlos Rodríguez',
                    avatar: 'driver-1.jpg',
                    rating: 4.8,
                    trips: 348
                },
                route: {
                    origin: 'Bogotá D.C.',
                    destination: 'Ibagué',
                    distance: '285 km',
                    actualTime: '5h 45min',
                    price: '$1,450,000 COP'
                },
                userRating: {
                    value: 4.5,
                    date: '15 Dic, 2024',
                    review: 'Excelente servicio. Carlos fue muy puntual y cuidadoso con la carga. La comunicación fue constante durante todo el viaje.',
                    tags: ['Puntual', 'Comunicativo', 'Cuidadoso']
                },
                documents: ['Factura electrónica', 'Recibo de pago', 'Confirmación de entrega']
            },
            {
                id: 2,
                reference: 'CC-2024-008',
                status: 'completed',
                completionDate: 'Ayer, 6:30 PM',
                duration: '7h 15min',
                driver: {
                    name: 'María González',
                    avatar: 'driver-2.jpg',
                    rating: 5.0,
                    trips: 214
                },
                route: {
                    origin: 'Medellín',
                    destination: 'Bucaramanga',
                    distance: '410 km',
                    actualTime: '7h 15min',
                    price: '$780,000 COP'
                },
                userRating: null, // Not rated yet
                documents: ['Factura electrónica', 'Recibo de pago', 'Confirmación de entrega']
            },
            {
                id: 3,
                reference: 'CC-2024-009',
                status: 'completed',
                completionDate: '14 Dic, 4:45 PM',
                duration: '9h 30min',
                driver: {
                    name: 'Javier López',
                    avatar: 'driver-3.jpg',
                    rating: 4.9,
                    trips: 522
                },
                route: {
                    origin: 'Cali',
                    destination: 'Barranquilla',
                    distance: '600 km',
                    actualTime: '9h 30min',
                    price: '$1,850,000 COP'
                },
                userRating: {
                    value: 4.0,
                    date: '14 Dic, 2024',
                    review: 'Buen servicio en general. Hubo un retraso por condiciones climáticas, pero el conductor mantuvo buena comunicación.',
                    tags: ['Comunicativo', 'Experto']
                },
                delay: {
                    duration: '45 min',
                    reason: 'Retraso de 45 minutos debido a lluvias fuertes en la vía Bogotá - Girardot. El conductor reportó las condiciones y mantuvo comunicación constante.'
                },
                documents: ['Factura electrónica', 'Recibo de pago', 'Confirmación de entrega']
            }
        ];
    }

    applyFilters() {
        let filteredLoads = [...this.completedLoads];

        // Apply search filter
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredLoads = filteredLoads.filter(load =>
                load.reference.toLowerCase().includes(searchTerm) ||
                load.driver.name.toLowerCase().includes(searchTerm) ||
                load.route.origin.toLowerCase().includes(searchTerm) ||
                load.route.destination.toLowerCase().includes(searchTerm)
            );
        }

        // Apply time filter (simplified for demo)
        if (this.filters.time) {
            filteredLoads = filteredLoads.filter(load => {
                if (this.filters.time === 'today') {
                    return load.completionDate.includes('Hoy');
                } else if (this.filters.time === 'week') {
                    return load.completionDate.includes('Hoy') || load.completionDate.includes('Ayer');
                }
                return true;
            });
        }

        // Apply rating filter
        if (this.filters.rating) {
            const minRating = parseFloat(this.filters.rating);
            filteredLoads = filteredLoads.filter(load => 
                load.userRating && load.userRating.value >= minRating
            );
        }

        // Apply driver filter
        if (this.filters.driver) {
            filteredLoads = filteredLoads.filter(load => 
                load.driver.name.toLowerCase().includes(this.filters.driver.toLowerCase())
            );
        }

        // Update UI
        this.updateResultsCount(filteredLoads.length);
        this.renderCompletedLoads(filteredLoads);
    }

    updateResultsCount(count) {
        const resultsCount = document.querySelector('.results-count');
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${count} de ${this.completedLoads.length} cargas completadas`;
        }
    }

    renderCompletedLoads(loads) {
        const completedList = document.querySelector('.completed-list');
        if (!completedList) return;

        completedList.innerHTML = '';

        if (loads.length === 0) {
            completedList.innerHTML = this.createEmptyState();
            return;
        }

        loads.forEach(load => {
            const loadCard = this.createCompletedLoadCard(load);
            completedList.appendChild(loadCard);
        });
    }

    createCompletedLoadCard(load) {
        const card = document.createElement('div');
        card.className = `completed-load-card ${load.userRating ? 'rated' : 'not-rated'}`;
        card.setAttribute('data-load', load.id);
        
        card.innerHTML = this.generateCompletedLoadCardHTML(load);
        
        return card;
    }

    generateCompletedLoadCardHTML(load) {
        const completionBadge = load.delay ? 
            `<span class="completion-badge warning">
                <i class="fas fa-clock"></i>
                Retraso menor (${load.delay.duration})
            </span>` :
            `<span class="completion-badge success">
                <i class="fas fa-check"></i>
                Entregado a tiempo
            </span>`;

        const ratingSection = load.userRating ? 
            this.generateRatingSection(load.userRating) : 
            this.generateRatingPrompt(load.id);

        const delayNote = load.delay ? 
            `<div class="delay-note">
                <div class="delay-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h5>Nota sobre el retraso</h5>
                </div>
                <p>${load.delay.reason}</p>
            </div>` : '';

        return `
            <div class="completed-load-header">
                <div class="load-ref">
                    <span class="ref-badge">REF</span>
                    <span class="ref-number">#${load.reference}</span>
                    ${completionBadge}
                </div>
                <div class="load-meta-completed">
                    <span class="completion-date">Completado: ${load.completionDate}</span>
                    <span class="completion-duration">Duración: ${load.duration}</span>
                </div>
            </div>

            <div class="completed-load-content">
                <div class="completed-route">
                    <div class="route-point completed">
                        <div class="point-marker"></div>
                        <div class="point-info">
                            <span class="point-city">${load.route.origin}</span>
                            <span class="point-time">Recogido: ${load.completionDate.includes('Hoy') ? 'Hoy' : 'Ayer'}, ${load.completionDate.split(' ')[1]}</span>
                        </div>
                    </div>
                    <div class="route-point completed">
                        <div class="point-marker"></div>
                        <div class="point-info">
                            <span class="point-city">${load.route.destination}</span>
                            <span class="point-time">Entregado: ${load.completionDate}</span>
                        </div>
                    </div>
                </div>

                <div class="completed-driver-info">
                    <div class="driver-profile-completed">
                        <div class="driver-avatar">
                            <img src="{{ url_for('static', filename='images/${load.driver.avatar}') }}" alt="${load.driver.name}">
                        </div>
                        <div class="driver-details">
                            <h4 class="driver-name">${load.driver.name}</h4>
                            <div class="driver-stats">
                                <span class="driver-rating">
                                    <i class="fas fa-star"></i> ${load.driver.rating} (${load.driver.trips})
                                </span>
                                <span class="driver-trips">
                                    <i class="fas fa-road"></i> ${load.driver.trips} viajes
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="trip-details">
                        <div class="trip-item">
                            <i class="fas fa-road"></i>
                            <span>Distancia: ${load.route.distance}</span>
                        </div>
                        <div class="trip-item">
                            <i class="fas fa-clock"></i>
                            <span>Tiempo real: ${load.route.actualTime}</span>
                        </div>
                        <div class="trip-item">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>Precio final: ${load.route.price}</span>
                        </div>
                    </div>
                </div>

                ${ratingSection}
                ${delayNote}

                <div class="documents-section">
                    <h4>Documentos del Viaje</h4>
                    <div class="documents-list">
                        ${load.documents.map(doc => `
                            <div class="document-item">
                                <i class="fas fa-file-invoice"></i>
                                <span>${doc}</span>
                                <button class="document-download" data-document="${doc}" data-load="${load.id}">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="completed-load-footer">
                <div class="load-actions-completed">
                    <button class="action-btn-text" data-action="repeat">
                        <i class="fas fa-redo"></i>
                        Repetir Envío
                    </button>
                    <button class="action-btn-text" data-action="save-driver">
                        <i class="fas fa-heart"></i>
                        Guardar Conductor
                    </button>
                    <button class="action-btn-text primary" data-action="download-all">
                        <i class="fas fa-download"></i>
                        Descargar Todo
                    </button>
                </div>
            </div>
        `;
    }

    generateRatingSection(userRating) {
        const stars = this.generateStarsHTML(userRating.value);
        
        return `
            <div class="rating-section">
                <div class="rating-header">
                    <h4>Tu Calificación</h4>
                    <span class="rating-date">Calificado el ${userRating.date}</span>
                </div>
                <div class="rating-content">
                    <div class="star-rating">
                        ${stars}
                        <span class="rating-value">${userRating.value}</span>
                    </div>
                    <div class="review-text">
                        <p>"${userRating.review}"</p>
                    </div>
                    <div class="rating-tags">
                        ${userRating.tags.map(tag => `
                            <span class="rating-tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    generateRatingPrompt(loadId) {
        return `
            <div class="rating-prompt">
                <div class="prompt-header">
                    <i class="fas fa-star"></i>
                    <h4>Califica este servicio</h4>
                </div>
                <p>Tu opinión ayuda a mejorar nuestra comunidad de transportistas</p>
                <div class="rating-stars-input">
                    <div class="stars-container" data-load="${loadId}">
                        <i class="far fa-star" data-rating="1"></i>
                        <i class="far fa-star" data-rating="2"></i>
                        <i class="far fa-star" data-rating="3"></i>
                        <i class="far fa-star" data-rating="4"></i>
                        <i class="far fa-star" data-rating="5"></i>
                    </div>
                    <span class="rating-text">Selecciona una calificación</span>
                </div>
                <div class="prompt-actions">
                    <button class="prompt-btn secondary" data-action="remind-later">
                        Recordarme después
                    </button>
                    <button class="prompt-btn primary" data-action="submit-rating" disabled>
                        Enviar Calificación
                    </button>
                </div>
            </div>
        `;
    }

    generateStarsHTML(rating) {
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

    setupDocumentDownloads() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.document-download')) {
                e.preventDefault();
                const button = e.target.closest('.document-download');
                const documentName = button.getAttribute('data-document');
                const loadId = button.getAttribute('data-load');
                const load = this.completedLoads.find(l => l.id == loadId);
                this.downloadDocument(documentName, load);
            }
        });
    }

    // Action Methods
    repeatShipment(load) {
        this.showNotification(`Creando nuevo envío basado en ${load.reference}`, 'info');
        // Simulate navigation to publish page
        setTimeout(() => {
            // window.location.href = `/company/publish-load?template=${load.reference}`;
            console.log('Navegando a página de publicación con plantilla:', load.reference);
        }, 1000);
    }

    saveDriver(driver) {
        this.showNotification(`Conductor ${driver.name} guardado en favoritos`, 'success');
        // In a real app, this would save to localStorage or send to backend
        const favorites = JSON.parse(localStorage.getItem('favoriteDrivers') || '[]');
        if (!favorites.find(fav => fav.name === driver.name)) {
            favorites.push(driver);
            localStorage.setItem('favoriteDrivers', JSON.stringify(favorites));
        }
    }

    downloadDocument(documentName, load) {
        this.showNotification(`Descargando ${documentName} para ${load.reference}`, 'info');
        // Simulate download
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#'; // In real app, this would be the actual file URL
            link.download = `${load.reference}_${documentName.replace(/\s+/g, '_')}.pdf`;
            link.click();
        }, 500);
    }

    downloadAllDocuments(load) {
        this.showNotification(`Descargando todos los documentos de ${load.reference}`, 'info');
        // Simulate batch download
        load.documents.forEach((doc, index) => {
            setTimeout(() => {
                this.downloadDocument(doc, load);
            }, index * 300);
        });
    }

    submitRating(card, load) {
        const starsContainer = card.querySelector('.stars-container');
        const rating = parseInt(starsContainer.getAttribute('data-current-rating'));
        
        if (rating) {
            this.showNotification(`Calificación de ${rating} estrellas enviada para ${load.reference}`, 'success');
            
            // Update the UI to show the rating
            const ratingPrompt = card.querySelector('.rating-prompt');
            if (ratingPrompt) {
                ratingPrompt.style.opacity = '0';
                
                setTimeout(() => {
                    ratingPrompt.outerHTML = `
                        <div class="rating-section">
                            <div class="rating-header">
                                <h4>Tu Calificación</h4>
                                <span class="rating-date">Calificado ahora</span>
                            </div>
                            <div class="rating-content">
                                <div class="star-rating">
                                    ${this.generateStarsHTML(rating)}
                                    <span class="rating-value">${rating}.0</span>
                                </div>
                                <div class="review-text">
                                    <p>¡Gracias por tu calificación! Tu opinión ayuda a mejorar nuestros servicios.</p>
                                </div>
                            </div>
                        </div>
                    `;
                }, 300);
            }
        }
    }

    remindLater(load) {
        this.showNotification(`Te recordaremos calificar ${load.reference} más tarde`, 'info');
        // In a real app, this would schedule a reminder
        const reminders = JSON.parse(localStorage.getItem('ratingReminders') || '[]');
        reminders.push({
            loadId: load.id,
            reminderTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        });
        localStorage.setItem('ratingReminders', JSON.stringify(reminders));
    }

    // Pagination Methods
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePagination();
        }
    }

    nextPage() {
        this.currentPage++;
        this.updatePagination();
    }

    goToPage(page) {
        this.currentPage = page;
        this.updatePagination();
    }

    updatePagination() {
        // Update active page button
        const paginationBtns = document.querySelectorAll('.pagination-btn');
        paginationBtns.forEach(btn => {
            btn.classList.remove('active');
            if (!btn.querySelector('i') && btn.textContent == this.currentPage) {
                btn.classList.add('active');
            }
        });

        this.showNotification(`Página ${this.currentPage}`, 'info');
    }

    showAdvancedFilters() {
        this.showNotification('Mostrando filtros avanzados', 'info');
        // In a real app, this would show a modal with more filter options
    }

    exportReport() {
        this.showNotification('Generando y descargando reporte de cargas completadas...', 'info');
        // Simulate report generation
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = '#'; // In real app, this would be the report URL
            link.download = `reporte_cargas_completadas_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
        }, 2000);
    }

    toggleSummary() {
        const summaryContent = document.querySelector('.summary-content');
        const toggleIcon = document.querySelector('.summary-toggle i');
        
        if (summaryContent.style.display === 'none') {
            summaryContent.style.display = 'block';
            toggleIcon.className = 'fas fa-chevron-up';
        } else {
            summaryContent.style.display = 'none';
            toggleIcon.className = 'fas fa-chevron-down';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.completed-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `completed-notification completed-notification-${type}`;
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
            animation: completedSlideInRight 0.3s ease;
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
            notification.style.animation = 'completedSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    createEmptyState() {
        return `
            <div class="empty-state" style="text-align: center; padding: 3rem 2rem; color: var(--text-secondary);">
                <div class="empty-icon" style="font-size: 4rem; color: var(--border-light); margin-bottom: 1rem;">
                    <i class="fas fa-clipboard-check"></i>
                </div>
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">No hay cargas completadas</h3>
                <p style="margin-bottom: 2rem;">Cuando completes tus primeros envíos, aparecerán aquí con todo el historial</p>
                <a href="{{ url_for('companies.publish_load') }}" class="cta-button primary large" style="text-decoration: none;">
                    <i class="fas fa-plus-circle"></i>
                    Publicar Mi Primera Carga
                </a>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes completedSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes completedSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }

        .completed-load-card {
            transition: all 0.3s ease;
        }

        .completed-load-card:hover {
            transform: translateY(-2px);
        }

        .fade-in {
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Initialize the completed loads functionality
    window.completedLoads = new CompletedLoads();
});