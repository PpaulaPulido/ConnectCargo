// Dashboard functionality for carrier
class CarrierDashboard {
    constructor() {
        this.currentTipIndex = 0;
        this.tipsTrack = document.querySelector('.tips-track');
        this.tipCards = document.querySelectorAll('.tip-card');
        this.carouselButtons = {
            prev: document.querySelector('.carousel-btn.prev'),
            next: document.querySelector('.carousel-btn.next')
        };
        
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupCarousel();
        this.setupInteractiveElements();
        this.setupCTAButtons();
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Stagger animation for grid items
                    if (entry.target.classList.contains('steps-grid')) {
                        this.animateGridItems(entry.target.children);
                    }
                    if (entry.target.classList.contains('benefits-grid')) {
                        this.animateGridItems(entry.target.children);
                    }
                }
            });
        }, observerOptions);

        // Observe all animated sections
        document.querySelectorAll('.animated-section').forEach(section => {
            observer.observe(section);
        });
    }

    animateGridItems(items) {
        Array.from(items).forEach((item, index) => {
            item.style.animationDelay = `${index * 0.2}s`;
            item.classList.add('fade-in-up');
        });
    }

    setupCarousel() {
        if (!this.tipsTrack || !this.carouselButtons.prev) return;

        const tipWidth = this.tipCards[0].offsetWidth + 24; // width + gap
        const visibleTips = Math.floor(this.tipsTrack.parentElement.offsetWidth / tipWidth);
        this.maxIndex = this.tipCards.length - visibleTips;

        this.carouselButtons.prev.addEventListener('click', () => this.previousTip());
        this.carouselButtons.next.addEventListener('click', () => this.nextTip());

        // Auto-advance carousel
        this.startAutoCarousel();
        
        // Pause auto-advance on hover
        this.tipsTrack.addEventListener('mouseenter', () => this.stopAutoCarousel());
        this.tipsTrack.addEventListener('mouseleave', () => this.startAutoCarousel());
    }

    previousTip() {
        if (this.currentTipIndex > 0) {
            this.currentTipIndex--;
            this.updateCarousel();
        }
        this.stopAutoCarousel();
        this.startAutoCarousel();
    }

    nextTip() {
        if (this.currentTipIndex < this.maxIndex) {
            this.currentTipIndex++;
            this.updateCarousel();
        } else {
            this.currentTipIndex = 0;
            this.updateCarousel();
        }
        this.stopAutoCarousel();
        this.startAutoCarousel();
    }

    updateCarousel() {
        const tipWidth = this.tipCards[0].offsetWidth + 24;
        this.tipsTrack.style.transform = `translateX(-${this.currentTipIndex * tipWidth}px)`;
        
        // Update button states
        this.carouselButtons.prev.disabled = this.currentTipIndex === 0;
        this.carouselButtons.next.disabled = this.currentTipIndex === this.maxIndex;
    }

    startAutoCarousel() {
        this.stopAutoCarousel();
        this.autoCarouselInterval = setInterval(() => {
            this.nextTip();
        }, 5000);
    }

    stopAutoCarousel() {
        if (this.autoCarouselInterval) {
            clearInterval(this.autoCarouselInterval);
        }
    }

    setupInteractiveElements() {
        // Add hover effects to all interactive cards
        document.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.step-card, .benefit-card, .tip-card');
            if (card) {
                card.style.transition = 'all 0.3s ease';
            }
        }, true);

        // Add click effects to feature tags
        document.querySelectorAll('.feature-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 150);
            });
        });
    }

    setupCTAButtons() {
        // Guided tour button
        document.querySelector('.cta-button.primary')?.addEventListener('click', () => {
            CarrierUtils.showNotification('¡Iniciando recorrido guiado! Te mostraremos todas las funcionalidades.', 'info');
            // Here you would start the actual guided tour
            setTimeout(() => {
                this.startGuidedTour();
            }, 1000);
        });

        // Explore loads button
        document.querySelector('.cta-button.secondary')?.addEventListener('click', () => {
            CarrierUtils.showNotification('Redirigiendo a cargas disponibles...', 'success');
            // Navigation would happen here
            setTimeout(() => {
                window.location.href = '/carrier/loads';
            }, 1500);
        });

        // Complete profile button
        document.querySelector('.cta-button.outline')?.addEventListener('click', () => {
            CarrierUtils.showNotification('Abriendo configuración de perfil...', 'info');
            // Navigation would happen here
            setTimeout(() => {
                window.location.href = '/carrier/profile';
            }, 1500);
        });
    }

    startGuidedTour() {
        // Simulate guided tour steps
        const steps = [
            'Te mostraremos cómo completar tu perfil',
            'Exploraremos la búsqueda de cargas',
            'Veremos el sistema de calificaciones',
            'Revisaremos las herramientas de ruta'
        ];

        let currentStep = 0;
        
        const showTourStep = () => {
            if (currentStep < steps.length) {
                CarrierUtils.showNotification(`Paso ${currentStep + 1}: ${steps[currentStep]}`, 'info', 3000);
                currentStep++;
                setTimeout(showTourStep, 3500);
            } else {
                CarrierUtils.showNotification('¡Recorrido completado! Ya estás listo para usar ConnectCargo.', 'success');
            }
        };

        showTourStep();
    }

    // Utility method to handle section navigation
    navigateToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarrierDashboard();
    
    // Add CSS for fade-in-up animation
    const style = document.createElement('style');
    style.textContent = `
        .fade-in-up {
            animation: fadeInUp 0.6s ease forwards;
            opacity: 0;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});