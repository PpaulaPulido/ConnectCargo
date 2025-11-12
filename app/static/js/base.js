class MobileMenu {
    constructor() {
        this.menuBtn = document.querySelector('.mobile-menu-btn');
        this.menu = document.querySelector('.mobile-menu');
        this.overlay = document.querySelector('.mobile-menu-overlay');
        this.closeBtn = document.querySelector('.mobile-menu-close');
        this.navbarContainer = document.querySelector('.navbar-container');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Solo inicializar en móvil
        if (window.innerWidth >= 1024) {
            return;
        }
        
        this.menuBtn.addEventListener('click', () => this.toggleMenu());
        this.closeBtn.addEventListener('click', () => this.closeMenu());
        this.overlay.addEventListener('click', () => this.closeMenu());
        
        // Close menu when clicking on links
        const menuLinks = document.querySelectorAll('.mobile-nav-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.menuBtn.classList.add('active');
        this.menu.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
    }
    
    closeMenu() {
        this.menuBtn.classList.remove('active');
        this.menu.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupNavbarScroll();
        this.setupSmoothScrolling();
    }
    
    setupNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    setupSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                
                // Verificar que no sea solo "#" (enlace vacío)
                if (targetId === '#' || targetId === '#!') {
                    e.preventDefault();
                    return;
                }
                
                // Verificar que sea un selector válido
                if (targetId.length > 1) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        const offsetTop = targetElement.offsetTop - 80;
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// Flash Messages Auto-remove
class FlashMessages {
    constructor() {
        this.init();
    }
    
    init() {
        // Auto-remove flash messages after 5 seconds
        const flashMessages = document.querySelectorAll('.flash-message');
        flashMessages.forEach(message => {
            setTimeout(() => {
                if (message.parentElement) {
                    message.remove();
                }
            }, 5000);
        });
    }
}

// Interactive Elements
class InteractiveElements {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupButtonRipple();
        this.setupSocialLinks();
    }
    
    setupButtonRipple() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
    
    setupSocialLinks() {
        // Add loading states for social links
        const socialLinks = document.querySelectorAll('.social-link, .app-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Aquí puedes agregar tracking o otras funcionalidades
                console.log('Social link clicked:', link.href);
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
    new ScrollAnimations();
    new FlashMessages();
    new InteractiveElements();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Add ripple effect styles dynamically
const rippleStyles = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = rippleStyles;
document.head.appendChild(styleSheet);

// Manejar redimensionamiento de ventana
window.addEventListener('resize', () => {
    // Cerrar menú móvil si cambiamos a desktop
    if (window.innerWidth >= 1024) {
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const overlay = document.querySelector('.mobile-menu-overlay');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});