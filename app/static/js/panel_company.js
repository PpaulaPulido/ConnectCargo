class CompanyDashboard {
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
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    if (entry.target.classList.contains('steps-grid') || 
                        entry.target.classList.contains('benefits-grid')) {
                        this.animateGridItems(entry.target.children);
                    }
                }
            });
        }, observerOptions);

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

        const tipWidth = this.tipCards[0].offsetWidth + 16;
        const visibleTips = Math.floor(this.tipsTrack.parentElement.offsetWidth / tipWidth);
        this.maxIndex = this.tipCards.length - visibleTips;

        this.carouselButtons.prev.addEventListener('click', () => this.previousTip());
        this.carouselButtons.next.addEventListener('click', () => this.nextTip());

        this.startAutoCarousel();
        
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
        const tipWidth = this.tipCards[0].offsetWidth + 16;
        this.tipsTrack.style.transform = `translateX(-${this.currentTipIndex * tipWidth}px)`;
        
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
        document.addEventListener('mouseover', (e) => {
            const card = e.target.closest('.step-card, .benefit-card, .tip-card');
            if (card) {
                card.style.transition = 'all 0.3s ease';
            }
        }, true);

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
        document.querySelector('.welcome-actions .cta-button.primary')?.addEventListener('click', () => {
            CarrierUtils.showNotification('Redirigiendo a publicación de carga...', 'info');
            setTimeout(() => {
                window.location.href = '/company/publish-load';
            }, 1500);
        });

        document.querySelector('.welcome-actions .cta-button.secondary')?.addEventListener('click', () => {
            CarrierUtils.showNotification('Buscando transportistas disponibles...', 'info');
            setTimeout(() => {
                window.location.href = '/company/find-drivers';
            }, 1500);
        });

        document.querySelector('.section-cta .cta-button')?.addEventListener('click', () => {
            CarrierUtils.showNotification('Iniciando proceso de publicación...', 'success');
            setTimeout(() => {
                window.location.href = '/company/publish-load';
            }, 1500);
        });

        document.querySelector('.cta-section .cta-button.primary')?.addEventListener('click', () => {
            CarrierUtils.showNotification('¡Excelente! Creando tu primera carga...', 'success');
            setTimeout(() => {
                window.location.href = '/company/publish-load';
            }, 1500);
        });

        document.querySelector('.cta-section .cta-button.outline')?.addEventListener('click', () => {
            CarrierUtils.showNotification('Explorando transportistas disponibles...', 'info');
            setTimeout(() => {
                window.location.href = '/company/find-drivers';
            }, 1500);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CompanyDashboard();
    
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