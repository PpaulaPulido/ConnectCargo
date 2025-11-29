// routes.js - Funcionalidades para gestión de rutas

class RoutesManager {
    constructor() {
        this.routes = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFilterTabs();
        this.setupSearch();
        this.loadRoutes();
        this.setupModal();
    }

    setupEventListeners() {
        // Botón para agregar nueva ruta
        document.getElementById('addRouteBtn')?.addEventListener('click', () => {
            this.openRouteModal();
        });

        document.getElementById('addFirstRouteBtn')?.addEventListener('click', () => {
            this.openRouteModal();
        });

        // Botones de favorito en rutas existentes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) {
                const btn = e.target.closest('.favorite-btn');
                this.toggleFavorite(btn);
            }

            if (e.target.closest('.route-action-btn') && !e.target.closest('.favorite-btn')) {
                const btn = e.target.closest('.route-action-btn');
                this.handleRouteAction(btn);
            }
        });
    }

    setupFilterTabs() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Update active state
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('routesSearch');
        if (!searchInput) return;

        const debouncedSearch = this.debounce((query) => {
            this.searchTerm = query.toLowerCase();
            this.applyFilters();
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    setupModal() {
        const modal = document.getElementById('routeModal');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelRoute');
        const form = document.getElementById('newRouteForm');

        // Cerrar modal
        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => {
                this.closeRouteModal();
            });
        });

        // Cerrar modal al hacer clic fuera
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeRouteModal();
            }
        });

        // Enviar formulario
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewRoute();
        });
    }

    loadRoutes() {
        // En una implementación real, esto cargaría desde una API
        // Por ahora, usamos las rutas estáticas del HTML
        
        const routeCards = document.querySelectorAll('.route-card');
        this.routes = Array.from(routeCards).map(card => ({
            element: card,
            category: card.getAttribute('data-category'),
            isFavorite: card.getAttribute('data-favorite') === 'true',
            title: card.querySelector('h3').textContent
        }));

        this.updateEmptyState();
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        this.applyFilters();
    }

    applyFilters() {
        this.routes.forEach(route => {
            const matchesFilter = 
                this.currentFilter === 'all' ||
                (this.currentFilter === 'favorite' && route.isFavorite) ||
                route.category === this.currentFilter;
            
            const matchesSearch = 
                !this.searchTerm ||
                route.title.toLowerCase().includes(this.searchTerm);
            
            if (matchesFilter && matchesSearch) {
                route.element.classList.remove('hidden');
            } else {
                route.element.classList.add('hidden');
            }
        });

        this.updateEmptyState();
    }

    toggleFavorite(button) {
        const routeCard = button.closest('.route-card');
        const isCurrentlyFavorite = button.classList.contains('active');
        
        if (isCurrentlyFavorite) {
            button.classList.remove('active');
            button.title = 'Marcar como favorita';
            routeCard.setAttribute('data-favorite', 'false');
        } else {
            button.classList.add('active');
            button.title = 'Quitar de favoritos';
            routeCard.setAttribute('data-favorite', 'true');
        }

        // Actualizar el estado en nuestro array
        const route = this.routes.find(r => r.element === routeCard);
        if (route) {
            route.isFavorite = !isCurrentlyFavorite;
        }

        // Si estamos en el filtro de favoritos, re-aplicar filtros
        if (this.currentFilter === 'favorite') {
            this.applyFilters();
        }

        this.showToast(`Ruta ${isCurrentlyFavorite ? 'quitada de' : 'agregada a'} favoritos`);
    }

    handleRouteAction(button) {
        const routeCard = button.closest('.route-card');
        const action = button.querySelector('i').className;
        
        switch (action) {
            case 'fas fa-edit':
                this.editRoute(routeCard);
                break;
            case 'fas fa-archive':
                this.archiveRoute(routeCard);
                break;
            case 'fas fa-play':
                this.activateRoute(routeCard);
                break;
            case 'fas fa-trash':
                this.deleteRoute(routeCard);
                break;
        }
    }

    editRoute(routeCard) {
        const title = routeCard.querySelector('h3').textContent;
        this.showToast(`Editando ruta: ${title}`);
        // Aquí abrirías el modal con los datos de la ruta para editar
    }

    archiveRoute(routeCard) {
        if (confirm('¿Estás seguro de que quieres archivar esta ruta?')) {
            routeCard.classList.add('archived');
            routeCard.setAttribute('data-category', 'archived');
            
            // Actualizar el estado en nuestro array
            const route = this.routes.find(r => r.element === routeCard);
            if (route) {
                route.category = 'archived';
            }

            this.applyFilters();
            this.showToast('Ruta archivada correctamente');
        }
    }

    activateRoute(routeCard) {
        routeCard.classList.remove('archived');
        routeCard.setAttribute('data-category', 'active');
        
        // Actualizar el estado en nuestro array
        const route = this.routes.find(r => r.element === routeCard);
        if (route) {
            route.category = 'active';
        }

        this.applyFilters();
        this.showToast('Ruta reactivada correctamente');
    }

    deleteRoute(routeCard) {
        if (confirm('¿Estás seguro de que quieres eliminar esta ruta? Esta acción no se puede deshacer.')) {
            routeCard.style.opacity = '0.5';
            routeCard.style.pointerEvents = 'none';
            
            setTimeout(() => {
                routeCard.remove();
                
                // Actualizar nuestro array
                this.routes = this.routes.filter(r => r.element !== routeCard);
                
                this.applyFilters();
                this.showToast('Ruta eliminada correctamente');
            }, 500);
        }
    }

    openRouteModal() {
        const modal = document.getElementById('routeModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Enfocar el primer campo
        const firstInput = document.getElementById('routeOrigin');
        setTimeout(() => firstInput?.focus(), 300);
    }

    closeRouteModal() {
        const modal = document.getElementById('routeModal');
        const form = document.getElementById('newRouteForm');
        
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        form?.reset();
    }

    async saveNewRoute() {
        const form = document.getElementById('newRouteForm');
        const formData = new FormData(form);
        const submitBtn = form.querySelector('.routes-action-btn.primary');

        try {
            this.setButtonLoading(submitBtn, true);

            // Simular guardado en API
            const routeData = {
                origin: formData.get('origin'),
                destination: formData.get('destination'),
                frequency: formData.get('frequency'),
                vehicle_type: formData.get('vehicle_type'),
                capacity: formData.get('capacity'),
                description: formData.get('description'),
                notifications: formData.get('notifications') === 'on',
                favorite: formData.get('favorite') === 'on'
            };

            await this.simulateAPICall('routes', routeData);

            this.closeRouteModal();
            this.showToast('Nueva ruta creada exitosamente', 'success');
            
            // En una implementación real, aquí agregarías la nueva ruta a la lista
            this.addRouteToDOM(routeData);

        } catch (error) {
            this.showToast('Error al crear la ruta', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    addRouteToDOM(routeData) {
        // Esta función agregaría la nueva ruta al DOM
        // Por ahora, solo mostramos un mensaje
        console.log('Nueva ruta a agregar:', routeData);
    }

    updateEmptyState() {
        const emptyState = document.getElementById('emptyRoutes');
        const visibleRoutes = this.routes.filter(route => 
            !route.element.classList.contains('hidden')
        ).length;

        if (visibleRoutes === 0 && this.routes.length > 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        // Mostrar estado vacío solo si no hay rutas en absoluto
        if (this.routes.length === 0) {
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
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Guardar Ruta';
        }
    }

    async simulateAPICall(endpoint, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.1) {
                    reject(new Error('Error de conexión'));
                } else {
                    resolve({ success: true, data });
                }
            }, 1500);
        });
    }

    showToast(message, type = 'info') {
        // Reutilizar la función de toast si está disponible
        if (window.NotificationsManager) {
            window.NotificationsManager.showToast(message, type);
        } else {
            // Toast básico como fallback
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
    new RoutesManager();
});

// Exportar para uso global
window.RoutesManager = RoutesManager;