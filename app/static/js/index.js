// Mobile Menu Functionality
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
        
        // Ocultar logo principal
        if (this.navbarContainer) {
            this.navbarContainer.style.opacity = '0';
        }
    }
    
    closeMenu() {
        this.menuBtn.classList.remove('active');
        this.menu.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
        
        // Mostrar logo principal
        if (this.navbarContainer) {
            this.navbarContainer.style.opacity = '1';
        }
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.counterObserverOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupCounterObserver();
        this.setupNavbarScroll();
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, this.observerOptions);
        
        // Observe elements
        const animatedElements = document.querySelectorAll(
            '.card, .section-visual, .stat-item, .feature-item, .image-container'
        );
        
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    setupCounterObserver() {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, this.counterObserverOptions);
        
        // Observar los números de estadísticas
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        statNumbers.forEach(stat => {
            // Inicializar con 0
            stat.textContent = '0';
            counterObserver.observe(stat);
        });
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
    
    startCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const startTime = Date.now();
        const startValue = 0;
        
        const updateCounter = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function para animación suave
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
}

// Parallax Effect
class ParallaxEffect {
    constructor() {
        this.heroBg = document.querySelector('.hero-bg');
        this.init();
    }
    
    init() {
        if (this.heroBg) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                this.heroBg.style.transform = `translateY(${rate}px)`;
            });
        }
    }
}

// Interactive Elements
class InteractiveElements {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupCardHoverEffects();
        this.setupImageHoverEffects();
        this.setupButtonRipple();
    }
    
    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });
    }
    
    setupImageHoverEffects() {
        const heroImage = document.querySelector('.hero-image-container');
        if (heroImage && window.innerWidth > 768) {
            heroImage.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = heroImage.getBoundingClientRect();
                const x = (e.clientX - left) / width - 0.5;
                const y = (e.clientY - top) / height - 0.5;
                
                heroImage.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${y * -5}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            
            heroImage.addEventListener('mouseleave', () => {
                heroImage.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale3d(1, 1, 1)';
            });
        }
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
}

// Smooth Scrolling 
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
    new ScrollAnimations();
    new ParallaxEffect();
    new InteractiveElements();
    new SmoothScroll();
    
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
            
            const navbarContainer = document.querySelector('.navbar-container');
            if (navbarContainer) {
                navbarContainer.style.opacity = '1';
            }
        }
    }
});