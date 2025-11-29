// Carrier Filter Loads Management - Namespaced to avoid conflicts
class CarrierFilterLoads {
    constructor() {
        this.filters = {
            route: {},
            dates: {},
            cargo: {},
            price: {},
            company: {}
        };
        this.activeFilters = new Set();
        this.presets = [];
        
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
            console.warn('Some required elements for CarrierFilterLoads are missing');
            return;
        }

        this.setupEventListeners();
        this.setupFilterInputs(); // Cambié setupFilters por setupFilterInputs
        this.setupModals();
        this.loadSamplePresets();
        
        console.log('Carrier Filter Loads initialized');
    }

    requiredElementsExist() {
        const requiredElements = [
            'carrierResetAllFilters',
            'carrierSaveFilterPreset',
            'carrierApplyFilters',
            'carrierPreviewResults'
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
        // Section toggles
        document.querySelectorAll('.carrier-section-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                this.toggleSection(e.target.closest('.carrier-filter-section'));
            });
        });

        // Range inputs
        const radiusInput = document.getElementById('carrierSearchRadius');
        if (radiusInput) {
            radiusInput.addEventListener('input', (e) => {
                document.getElementById('carrierRadiusValue').textContent = `${e.target.value} km`;
                this.updateFilter('route', 'radius', e.target.value);
            });
        }

        // Rating stars
        this.setupRatingFilter();

        // Filter inputs - Ya no llamamos setupFilterInputs aquí porque se llama en init

        // Buttons - Safe element access
        const resetBtn = document.getElementById('carrierResetAllFilters');
        const savePresetBtn = document.getElementById('carrierSaveFilterPreset');
        const applyBtn = document.getElementById('carrierApplyFilters');
        const previewBtn = document.getElementById('carrierPreviewResults');

        if (resetBtn) resetBtn.addEventListener('click', () => this.resetAllFilters());
        if (savePresetBtn) savePresetBtn.addEventListener('click', () => this.showSavePresetModal());
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyFilters());
        if (previewBtn) previewBtn.addEventListener('click', () => this.previewResults());

        // Modal events
        this.setupModalEvents();
    }

    setupRatingFilter() {
        const stars = document.querySelectorAll('.carrier-stars i');
        let currentRating = 0;

        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.getAttribute('data-rating'));
                currentRating = rating;
                this.updateRatingDisplay(rating);
                this.updateFilter('company', 'minRating', rating);
            });

            star.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.target.getAttribute('data-rating'));
                this.highlightStars(rating);
            });

            star.addEventListener('mouseleave', () => {
                this.highlightStars(currentRating);
            });
        });
    }

    highlightStars(rating) {
        const stars = document.querySelectorAll('.carrier-stars i');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('carrier-active');
            } else {
                star.classList.remove('carrier-active');
            }
        });
    }

    updateRatingDisplay(rating) {
        const ratingText = document.getElementById('carrierRatingText');
        if (!ratingText) return;
        
        const texts = {
            0: 'Cualquier calificación',
            1: '1 estrella o más',
            2: '2 estrellas o más',
            3: '3 estrellas o más',
            4: '4 estrellas o más',
            5: '5 estrellas'
        };
        ratingText.textContent = texts[rating] || 'Cualquier calificación';
        this.highlightStars(rating);
    }

    setupFilterInputs() {
        // Route filters
        this.setupInputListener('carrierOriginRegion', 'route', 'originRegion');
        this.setupInputListener('carrierOriginCity', 'route', 'originCity');
        this.setupInputListener('carrierDestinationRegion', 'route', 'destinationRegion');
        this.setupInputListener('carrierDestinationCity', 'route', 'destinationCity');
        this.setupCheckboxListener('carrierMatchMyRoute', 'route', 'matchMyRoute');

        // Date filters
        this.setupInputListener('carrierPickupDateFrom', 'dates', 'pickupFrom');
        this.setupInputListener('carrierPickupDateTo', 'dates', 'pickupTo');
        this.setupInputListener('carrierDeliveryTime', 'dates', 'maxDeliveryTime');
        this.setupRadioListener('urgency', 'dates', 'urgency');

        // Cargo filters
        this.setupInputListener('carrierWeightMin', 'cargo', 'weightMin');
        this.setupInputListener('carrierWeightMax', 'cargo', 'weightMax');
        this.setupInputListener('carrierVolumeMin', 'cargo', 'volumeMin');
        this.setupInputListener('carrierVolumeMax', 'cargo', 'volumeMax');
        this.setupCheckboxGroupListener('cargoType', 'cargo', 'types');
        this.setupCheckboxGroupListener('requirements', 'cargo', 'requirements');

        // Price filters
        this.setupInputListener('carrierPriceMin', 'price', 'priceMin');
        this.setupInputListener('carrierPriceMax', 'price', 'priceMax');
        this.setupCheckboxGroupListener('priceType', 'price', 'types');
        this.setupCheckboxGroupListener('paymentMethod', 'price', 'methods');

        // Company filters
        this.setupInputListener('carrierCompanyType', 'company', 'type');
        this.setupCheckboxListener('carrierVerifiedOnly', 'company', 'verifiedOnly');
        this.setupCheckboxListener('carrierRepeatClients', 'company', 'repeatClients');
    }

    setupInputListener(elementId, category, key) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('input', CarrierFilterLoadsUtils.debounce((e) => {
                this.updateFilter(category, key, e.target.value);
            }, 300));
        }
    }

    setupCheckboxListener(elementId, category, key) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', (e) => {
                this.updateFilter(category, key, e.target.checked);
            });
        }
    }

    setupCheckboxGroupListener(name, category, key) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const values = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                    .map(cb => cb.value);
                this.updateFilter(category, key, values);
            });
        });
    }

    setupRadioListener(name, category, key) {
        const radios = document.querySelectorAll(`input[name="${name}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.updateFilter(category, key, e.target.value);
                }
            });
        });
    }

    setupModals() {
        // Modal elements - safe access
        this.savePresetModal = document.getElementById('carrierSavePresetModal');
        this.loadPresetModal = document.getElementById('carrierLoadPresetModal');
    }

    setupModalEvents() {
        // Save preset modal - Safe element access
        const closeSavePresetBtn = document.getElementById('carrierCloseSavePreset');
        const cancelSavePresetBtn = document.getElementById('carrierCancelSavePreset');
        const confirmSavePresetBtn = document.getElementById('carrierConfirmSavePreset');

        if (closeSavePresetBtn) closeSavePresetBtn.addEventListener('click', () => this.hideSavePresetModal());
        if (cancelSavePresetBtn) cancelSavePresetBtn.addEventListener('click', () => this.hideSavePresetModal());
        if (confirmSavePresetBtn) confirmSavePresetBtn.addEventListener('click', () => this.savePreset());

        // Load preset modal - Safe element access
        const closeLoadPresetBtn = document.getElementById('carrierCloseLoadPreset');
        const closePresetsBtn = document.getElementById('carrierClosePresets');

        if (closeLoadPresetBtn) closeLoadPresetBtn.addEventListener('click', () => this.hideLoadPresetModal());
        if (closePresetsBtn) closePresetsBtn.addEventListener('click', () => this.hideLoadPresetModal());

        // Close modals on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('carrier-modal')) {
                this.hideAllModals();
            }
        });

        // Preset actions - Event delegation for dynamically created elements
        document.addEventListener('click', (e) => {
            if (e.target.closest('.carrier-load-preset')) {
                const presetItem = e.target.closest('.carrier-preset-item');
                if (presetItem) {
                    this.loadPreset(presetItem);
                }
            }
            
            if (e.target.closest('.carrier-delete-preset')) {
                const presetItem = e.target.closest('.carrier-preset-item');
                if (presetItem) {
                    this.deletePreset(presetItem);
                }
            }
        });

        // Also close modals on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    toggleSection(section) {
        if (!section) return;
        
        section.classList.toggle('carrier-collapsed');
        const toggle = section.querySelector('.carrier-section-toggle i');
        if (toggle) {
            toggle.style.transform = section.classList.contains('carrier-collapsed') ? 'rotate(-90deg)' : 'rotate(0deg)';
        }
    }

    updateFilter(category, key, value) {
        if (!this.filters[category]) {
            this.filters[category] = {};
        }

        if (value === '' || value === false || (Array.isArray(value) && value.length === 0)) {
            delete this.filters[category][key];
            this.activeFilters.delete(`${category}.${key}`);
        } else {
            this.filters[category][key] = value;
            this.activeFilters.add(`${category}.${key}`);
        }

        this.updateActiveFilters();
        this.updateResultsCount();
    }

    updateActiveFilters() {
        const activeTagsContainer = document.getElementById('carrierActiveTags');
        const activeCount = document.getElementById('carrierActiveCount');
        const activeFiltersSection = document.getElementById('carrierActiveFilters');
        
        if (!activeTagsContainer || !activeCount || !activeFiltersSection) return;
        
        activeTagsContainer.innerHTML = '';
        
        this.activeFilters.forEach(filterKey => {
            const [category, key] = filterKey.split('.');
            const value = this.filters[category][key];
            const tag = this.createActiveFilterTag(category, key, value);
            activeTagsContainer.appendChild(tag);
        });
        
        activeCount.textContent = this.activeFilters.size;
        
        // Show/hide active filters section
        if (this.activeFilters.size > 0) {
            activeFiltersSection.style.display = 'block';
        } else {
            activeFiltersSection.style.display = 'none';
        }
    }

    createActiveFilterTag(category, key, value) {
        const tag = document.createElement('div');
        tag.className = 'carrier-active-tag';
        
        let displayText = '';
        
        // Create human-readable display text based on filter type
        switch (key) {
            case 'originCity':
                displayText = `Origen: ${value}`;
                break;
            case 'destinationCity':
                displayText = `Destino: ${value}`;
                break;
            case 'weightMin':
                displayText = `Peso mínimo: ${value}kg`;
                break;
            case 'weightMax':
                displayText = `Peso máximo: ${value}kg`;
                break;
            case 'priceMin':
                displayText = `Precio mínimo: $${CarrierFilterLoadsUtils.formatNumber(value)}`;
                break;
            case 'priceMax':
                displayText = `Precio máximo: $${CarrierFilterLoadsUtils.formatNumber(value)}`;
                break;
            case 'radius':
                displayText = `Radio: ${value}km`;
                break;
            case 'matchMyRoute':
                displayText = 'Coincide con mi ruta';
                break;
            case 'verifiedOnly':
                displayText = 'Solo verificados';
                break;
            case 'minRating':
                displayText = `Mínimo ${value} estrellas`;
                break;
            default:
                displayText = `${key}: ${value}`;
        }
        
        tag.innerHTML = `
            <span>${displayText}</span>
            <button class="carrier-active-tag-remove" data-category="${category}" data-key="${key}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add remove event
        tag.querySelector('.carrier-active-tag-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFilter(category, key);
        });
        
        return tag;
    }

    removeFilter(category, key) {
        delete this.filters[category][key];
        this.activeFilters.delete(`${category}.${key}`);
        
        // Reset the corresponding input
        this.resetInput(category, key);
        
        this.updateActiveFilters();
        this.updateResultsCount();
    }

    resetInput(category, key) {
        const inputMap = {
            'route.originRegion': 'carrierOriginRegion',
            'route.originCity': 'carrierOriginCity',
            'route.destinationRegion': 'carrierDestinationRegion',
            'route.destinationCity': 'carrierDestinationCity',
            'route.matchMyRoute': 'carrierMatchMyRoute',
            'route.radius': 'carrierSearchRadius',
            'dates.pickupFrom': 'carrierPickupDateFrom',
            'dates.pickupTo': 'carrierPickupDateTo',
            'dates.maxDeliveryTime': 'carrierDeliveryTime',
            'cargo.weightMin': 'carrierWeightMin',
            'cargo.weightMax': 'carrierWeightMax',
            'cargo.volumeMin': 'carrierVolumeMin',
            'cargo.volumeMax': 'carrierVolumeMax',
            'price.priceMin': 'carrierPriceMin',
            'price.priceMax': 'carrierPriceMax',
            'company.type': 'carrierCompanyType',
            'company.verifiedOnly': 'carrierVerifiedOnly',
            'company.repeatClients': 'carrierRepeatClients'
        };
        
        const elementId = inputMap[`${category}.${key}`];
        if (elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = false;
                } else if (element.type === 'range') {
                    element.value = element.getAttribute('min') || '0';
                    const radiusValue = document.getElementById('carrierRadiusValue');
                    if (radiusValue) {
                        radiusValue.textContent = `${element.value} km`;
                    }
                } else {
                    element.value = '';
                }
            }
        }
        
        // Handle radio buttons
        if (key === 'urgency') {
            const defaultRadio = document.querySelector('input[name="urgency"][value=""]');
            if (defaultRadio) {
                defaultRadio.checked = true;
            }
        }
        
        // Handle checkbox groups
        if (key === 'types' || key === 'requirements' || key === 'methods') {
            const groupName = this.getCheckboxGroupName(category, key);
            document.querySelectorAll(`input[name="${groupName}"]`).forEach(cb => {
                cb.checked = false;
            });
        }
        
        // Handle rating
        if (key === 'minRating') {
            this.updateRatingDisplay(0);
        }
    }

    getCheckboxGroupName(category, key) {
        const groupMap = {
            'cargo.types': 'cargoType',
            'cargo.requirements': 'requirements',
            'price.types': 'priceType',
            'price.methods': 'paymentMethod'
        };
        return groupMap[`${category}.${key}`] || '';
    }

    resetAllFilters() {
        // Reset all filter values
        this.filters = {
            route: {},
            dates: {},
            cargo: {},
            price: {},
            company: {}
        };
        this.activeFilters.clear();
        
        // Reset all form elements
        document.querySelectorAll('input, select').forEach(element => {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = element.value === '' || element.value === 'false';
            } else if (element.type === 'range') {
                element.value = element.getAttribute('min') || '0';
                if (element.id === 'carrierSearchRadius') {
                    const radiusValue = document.getElementById('carrierRadiusValue');
                    if (radiusValue) {
                        radiusValue.textContent = `${element.value} km`;
                    }
                }
            } else {
                element.value = '';
            }
        });
        
        // Reset rating
        this.updateRatingDisplay(0);
        
        this.updateActiveFilters();
        this.updateResultsCount();
        
        this.showNotification('Todos los filtros han sido restablecidos', 'info');
    }

    updateResultsCount() {
        const resultsCountElement = document.getElementById('carrierResultsCount');
        const previewButton = document.getElementById('carrierPreviewResults');
        
        if (!resultsCountElement || !previewButton) return;
        
        // Simulate results count based on active filters
        const baseCount = 24;
        let modifier = 1;
        
        // Apply some simple logic for demo purposes
        if (this.activeFilters.size > 0) {
            modifier = 0.7 + (Math.random() * 0.3); // 70-100% of base
        }
        
        const resultsCount = Math.floor(baseCount * modifier);
        resultsCountElement.textContent = resultsCount;
        
        // Update preview button text
        previewButton.innerHTML = `<i class="fas fa-eye"></i> Vista Previa (${resultsCount} cargas)`;
    }

    applyFilters() {
        const filterSummary = this.getFilterSummary();
        console.log('Applying filters:', this.filters);
        
        // In a real application, this would make an API call
        this.showNotification(`Filtros aplicados. ${filterSummary}`, 'success');
        
        // Navigate to available loads with filters
        setTimeout(() => {
            // window.location.href = '/carrier/available-loads?filters=' + encodeURIComponent(JSON.stringify(this.filters));
            this.showNotification('Redirigiendo a cargas disponibles...', 'info');
        }, 1000);
    }

    previewResults() {
        const filterSummary = this.getFilterSummary();
        console.log('Preview with filters:', this.filters);
        
        this.showNotification(`Generando vista previa con los filtros aplicados. ${filterSummary}`, 'info');
        
        // Simulate loading preview
        setTimeout(() => {
            this.showNotification('Vista previa generada. Revisa el panel lateral.', 'success');
        }, 1500);
    }

    getFilterSummary() {
        const activeCount = this.activeFilters.size;
        if (activeCount === 0) {
            return 'Mostrando todas las cargas disponibles';
        }
        
        const mainFilters = [];
        
        if (this.filters.route.originCity) mainFilters.push(`origen: ${this.filters.route.originCity}`);
        if (this.filters.route.destinationCity) mainFilters.push(`destino: ${this.filters.route.destinationCity}`);
        if (this.filters.cargo.types && this.filters.cargo.types.length > 0) {
            mainFilters.push(`tipos: ${this.filters.cargo.types.join(', ')}`);
        }
        if (this.filters.price.priceMin || this.filters.price.priceMax) {
            const priceRange = [];
            if (this.filters.price.priceMin) priceRange.push(`desde $${CarrierFilterLoadsUtils.formatNumber(this.filters.price.priceMin)}`);
            if (this.filters.price.priceMax) priceRange.push(`hasta $${CarrierFilterLoadsUtils.formatNumber(this.filters.price.priceMax)}`);
            mainFilters.push(`precio: ${priceRange.join(' - ')}`);
        }
        
        return mainFilters.length > 0 ? 
            `Filtros: ${mainFilters.join('; ')}` : 
            `${activeCount} filtro${activeCount > 1 ? 's' : ''} activo${activeCount > 1 ? 's' : ''}`;
    }

    showSavePresetModal() {
        if (this.activeFilters.size === 0) {
            this.showNotification('No hay filtros activos para guardar como preset', 'warning');
            return;
        }
        
        if (this.savePresetModal) {
            this.savePresetModal.classList.add('carrier-active');
        }
    }

    hideSavePresetModal() {
        if (this.savePresetModal) {
            this.savePresetModal.classList.remove('carrier-active');
        }
        const presetNameInput = document.getElementById('carrierPresetName');
        const setAsDefaultCheckbox = document.getElementById('carrierSetAsDefault');
        
        if (presetNameInput) presetNameInput.value = '';
        if (setAsDefaultCheckbox) setAsDefaultCheckbox.checked = false;
    }

    savePreset() {
        const presetNameInput = document.getElementById('carrierPresetName');
        const setAsDefaultCheckbox = document.getElementById('carrierSetAsDefault');
        
        if (!presetNameInput) return;
        
        const presetName = presetNameInput.value.trim();
        if (!presetName) {
            this.showNotification('Por favor ingresa un nombre para el preset', 'error');
            return;
        }
        
        const isDefault = setAsDefaultCheckbox ? setAsDefaultCheckbox.checked : false;
        
        const preset = {
            id: Date.now(),
            name: presetName,
            filters: JSON.parse(JSON.stringify(this.filters)),
            isDefault: isDefault,
            createdAt: new Date().toISOString()
        };
        
        this.presets.push(preset);
        this.hideSavePresetModal();
        
        this.showNotification(`Preset "${presetName}" guardado correctamente`, 'success');
        
        if (isDefault) {
            this.showNotification('Este preset se usará como filtro predeterminado', 'info');
        }
    }

    loadSamplePresets() {
        // Sample presets for demo
        this.presets = [
            {
                id: 1,
                name: 'Rutas Frecuentes',
                filters: {
                    route: {
                        originCity: 'Bogotá',
                        destinationCity: 'Medellín'
                    }
                },
                isDefault: false,
                createdAt: '2024-11-15T00:00:00Z'
            },
            {
                id: 2,
                name: 'Cargas Urgentes',
                filters: {
                    dates: {
                        urgency: 'urgent'
                    },
                    price: {
                        types: ['fixed']
                    }
                },
                isDefault: false,
                createdAt: '2024-11-10T00:00:00Z'
            }
        ];
    }

    loadPreset(presetItem) {
        if (!presetItem) return;
        
        // In a real app, this would load the actual preset data
        const presetNameElement = presetItem.querySelector('h4');
        const presetName = presetNameElement ? presetNameElement.textContent : 'Preset';
        
        this.showNotification(`Cargando preset "${presetName}"...`, 'info');
        
        // Simulate loading
        setTimeout(() => {
            this.showNotification(`Preset "${presetName}" cargado correctamente`, 'success');
            this.hideLoadPresetModal();
        }, 1000);
    }

    deletePreset(presetItem) {
        if (!presetItem) return;
        
        const presetNameElement = presetItem.querySelector('h4');
        const presetName = presetNameElement ? presetNameElement.textContent : 'Preset';
        
        if (confirm(`¿Estás seguro de que quieres eliminar el preset "${presetName}"?`)) {
            presetItem.style.opacity = '0.5';
            setTimeout(() => {
                presetItem.remove();
                this.showNotification(`Preset "${presetName}" eliminado`, 'info');
            }, 300);
        }
    }

    hideLoadPresetModal() {
        if (this.loadPresetModal) {
            this.loadPresetModal.classList.remove('carrier-active');
        }
    }

    hideAllModals() {
        this.hideSavePresetModal();
        this.hideLoadPresetModal();
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
        const closeBtn = notification.querySelector('.carrier-notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }

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
const CarrierFilterLoadsUtils = {
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

    formatNumber(number) {
        return new Intl.NumberFormat('es-CO').format(number);
    },

    serializeFilters(filters) {
        return Object.keys(filters).reduce((acc, category) => {
            if (Object.keys(filters[category]).length > 0) {
                acc[category] = filters[category];
            }
            return acc;
        }, {});
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarrierFilterLoads();
    
    // Add CSS for notifications
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
    `;
    document.head.appendChild(style);
});