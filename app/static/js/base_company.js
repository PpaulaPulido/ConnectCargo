class CompanyBase {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.mobileOverlay = document.getElementById('mobileOverlay');
        this.submenuToggles = document.querySelectorAll('.submenu-toggle');
        this.profileDropdown = document.querySelector('.profile-dropdown');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSubmenus();
        this.setupProfileDropdown();
        this.handleResize();
    }

    setupEventListeners() {
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        if (this.mobileOverlay) {
            this.mobileOverlay.addEventListener('click', () => this.closeSidebar());
        }

        window.addEventListener('resize', () => this.handleResize());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });

        this.setupSearch();
    }

    setupSubmenus() {
        this.submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const parent = toggle.closest('.has-submenu');
                parent.classList.toggle('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.has-submenu')) {
                document.querySelectorAll('.has-submenu').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }

    setupProfileDropdown() {
        if (!this.profileDropdown) return;

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                this.profileDropdown.classList.remove('active');
            }
        });

        const trigger = this.profileDropdown.querySelector('.profile-trigger');
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.profileDropdown.classList.toggle('active');
            });
        }
    }

    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        const debouncedSearch = CarrierUtils.debounce((query) => {
            this.performSearch(query);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                this.clearSearch();
            }
        });
    }

    performSearch(query) {
        if (query.length < 2) {
            this.clearSearch();
            return;
        }

        console.log('Searching for:', query);
        
        const searchBar = document.querySelector('.search-bar');
        searchBar.classList.add('searching');
        
        setTimeout(() => {
            searchBar.classList.remove('searching');
        }, 500);
    }

    clearSearch() {
        console.log('Clearing search');
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('active');
        this.mobileOverlay.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.mobileOverlay.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }

    handleResize() {
        if (window.innerWidth > 1024) {
            this.closeSidebar();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CompanyBase();
    
    document.addEventListener('click', (e) => {
        if (e.target.matches('button[type="submit"], .btn-loading')) {
            const button = e.target.closest('button');
            if (button && !button.disabled) {
                CarrierUtils.showLoading(button);
                
                setTimeout(() => {
                    CarrierUtils.hideLoading(button);
                }, 2000);
            }
        }
    });

    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('.nav-link, .stat-card, .load-item, .driver-card, .action-btn')) {
            e.target.style.transition = 'all 0.3s ease';
        }
    }, true);
});