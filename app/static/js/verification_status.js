// Verification Status functionality
class VerificationStatus {
    constructor() {
        this.steps = document.querySelectorAll('.step-item');
        this.documentCards = document.querySelectorAll('.document-status-card');
        this.supportButtons = document.querySelectorAll('.support-actions .btn');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.checkStepProgress();
    }

    setupEventListeners() {
        // Document action buttons
        this.documentCards.forEach(card => {
            const viewBtn = card.querySelector('.btn-icon[title="Ver documento"]');
            const downloadBtn = card.querySelector('.btn-icon[title="Descargar"]');
            const infoBtn = card.querySelector('.btn-icon[title="Ver detalles"]');
            const correctBtn = card.querySelector('.btn:not(.btn-icon)');

            viewBtn?.addEventListener('click', () => this.viewDocument(card));
            downloadBtn?.addEventListener('click', () => this.downloadDocument(card));
            infoBtn?.addEventListener('click', () => this.showDocumentDetails(card));
            correctBtn?.addEventListener('click', () => this.correctDocument(card));
        });

        // Step action buttons
        this.steps.forEach(step => {
            const uploadBtn = step.querySelector('.btn-primary');
            const viewBtn = step.querySelector('.btn-outline');
            const selfieBtn = step.querySelector('.btn[class*="btn-outline"]:not(.btn-primary)');

            uploadBtn?.addEventListener('click', () => this.uploadStepDocuments(step));
            viewBtn?.addEventListener('click', () => this.viewStepDetails(step));
            selfieBtn?.addEventListener('click', () => this.uploadSelfie(step));
        });

        // Support buttons
        this.supportButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const isContact = e.target.closest('.btn-primary');
                if (isContact) {
                    this.contactSupport();
                } else {
                    this.showFAQ();
                }
            });
        });

        // Progress animation on scroll
        this.setupProgressAnimation();
    }

    setupAnimations() {
        // Animate progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            setTimeout(() => {
                progressFill.style.width = '65%';
            }, 500);
        }

        // Add entrance animations to steps
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        this.steps.forEach(step => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(20px)';
            step.style.transition = 'all 0.6s ease';
            observer.observe(step);
        });

        this.documentCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });
    }

    setupProgressAnimation() {
        const progressSection = document.querySelector('.progress-overview');
        if (!progressSection) return;

        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateProgress();
                    progressObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        progressObserver.observe(progressSection);
    }

    animateProgress() {
        const percentageElement = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        
        if (!percentageElement || !progressFill) return;

        let current = 0;
        const target = 65;
        const duration = 2000;
        const increment = target / (duration / 16);

        const animate = () => {
            current += increment;
            if (current >= target) {
                current = target;
            }

            percentageElement.textContent = `${Math.round(current)}%`;
            progressFill.style.width = `${current}%`;

            if (current < target) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    checkStepProgress() {
        // Simulate checking step completion status
        this.steps.forEach(step => {
            const status = step.classList[1]; // completed, in-progress, etc.
            this.updateStepActions(step, status);
        });
    }

    updateStepActions(step, status) {
        const actions = step.querySelector('.step-actions');
        if (!actions) return;

        // Enable/disable actions based on status
        const buttons = actions.querySelectorAll('.btn');
        buttons.forEach(btn => {
            if (status === 'locked') {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }

    viewDocument(card) {
        const docName = card.querySelector('h4').textContent;
        CarrierUtils.showNotification(`Viendo documento: ${docName}`, 'info');
        
        // Simulate document viewing
        setTimeout(() => {
            CarrierUtils.showNotification('Documento abierto en visor', 'success');
        }, 1000);
    }

    downloadDocument(card) {
        const docName = card.querySelector('h4').textContent;
        CarrierUtils.showNotification(`Descargando: ${docName}`, 'info');
        
        // Simulate download
        setTimeout(() => {
            CarrierUtils.showNotification('Descarga completada', 'success');
        }, 1500);
    }

    showDocumentDetails(card) {
        const docName = card.querySelector('h4').textContent;
        const status = card.querySelector('.status-badge').textContent;
        
        CarrierUtils.showNotification(
            `${docName} - Estado: ${status}. Revisión en proceso.`, 
            'info',
            3000
        );
    }

    correctDocument(card) {
        const docName = card.querySelector('h4').textContent;
        CarrierUtils.showNotification(`Redirigiendo para corregir: ${docName}`, 'info');
        
        // Simulate navigation to upload page
        setTimeout(() => {
            // window.location.href = '/carrier/upload-documents';
            CarrierUtils.showNotification('Página de carga de documentos abierta', 'success');
        }, 1000);
    }

    uploadStepDocuments(step) {
        const stepName = step.querySelector('h3').textContent;
        CarrierUtils.showNotification(`Subiendo documentos para: ${stepName}`, 'info');
        
        // Show loading state
        const button = step.querySelector('.btn-primary');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        button.disabled = true;

        // Simulate upload process
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Simulate step completion
            step.classList.remove('in-progress');
            step.classList.add('completed');
            step.querySelector('.step-status').textContent = 'Completado';
            step.querySelector('.step-status').className = 'step-status completed';
            step.querySelector('.step-marker').innerHTML = '<i class="fas fa-check"></i>';
            
            CarrierUtils.showNotification('Documentos subidos exitosamente', 'success');
            this.updateOverallProgress();
        }, 3000);
    }

    viewStepDetails(step) {
        const stepName = step.querySelector('h3').textContent;
        CarrierUtils.showNotification(`Mostrando detalles de: ${stepName}`, 'info');
    }

    uploadSelfie(step) {
        CarrierUtils.showNotification('Abriendo cámara para selfie de verificación', 'info');
        
        // Simulate camera access
        setTimeout(() => {
            CarrierUtils.showNotification('Selfie capturada. Procesando verificación...', 'success');
            
            // Mark as completed
            const selfieDetail = step.querySelector('.detail-item.pending');
            if (selfieDetail) {
                selfieDetail.classList.remove('pending');
                selfieDetail.classList.add('verified');
                selfieDetail.innerHTML = '<i class="fas fa-check-circle"></i><span>Selfie de verificación</span>';
            }
        }, 2000);
    }

    updateOverallProgress() {
        const completedSteps = document.querySelectorAll('.step-item.completed').length;
        const totalSteps = document.querySelectorAll('.step-item:not(.locked)').length;
        const newProgress = Math.round((completedSteps / totalSteps) * 100);
        
        this.animateProgressTo(newProgress);
    }

    animateProgressTo(newProgress) {
        const percentageElement = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        
        if (!percentageElement || !progressFill) return;

        let current = parseInt(percentageElement.textContent);
        const duration = 1000;
        const increment = (newProgress - current) / (duration / 16);

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= newProgress) || (increment < 0 && current <= newProgress)) {
                current = newProgress;
            }

            percentageElement.textContent = `${Math.round(current)}%`;
            progressFill.style.width = `${current}%`;

            if (current !== newProgress) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    contactSupport() {
        CarrierUtils.showNotification('Conectando con nuestro equipo de soporte...', 'info');
        
        // Simulate support contact
        setTimeout(() => {
            // In a real app, this would open a chat or contact form
            CarrierUtils.showNotification('Soporte técnico disponible. ¿En qué podemos ayudarte?', 'success');
        }, 1500);
    }

    showFAQ() {
        CarrierUtils.showNotification('Abriendo preguntas frecuentes...', 'info');
        
        // Simulate FAQ navigation
        setTimeout(() => {
            // window.location.href = '/help/verification-faq';
            CarrierUtils.showNotification('Preguntas frecuentes sobre verificación', 'success');
        }, 1000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VerificationStatus();
});

// Add styles for loading states
const verificationStyles = `
.step-item.animated {
    animation: slideInUp 0.6s ease forwards;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.document-status-card.animated {
    animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = verificationStyles;
document.head.appendChild(styleSheet);