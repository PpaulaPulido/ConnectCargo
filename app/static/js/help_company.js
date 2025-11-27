class CompanyHelp {
    constructor() {
        this.currentSection = 'getting-started';
        this.articles = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadArticles();
        this.setupFAQ();
        this.setupModals();
    }

    setupEventListeners() {
        // Navegación del sidebar
        const navLinks = document.querySelectorAll('.help-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                this.switchSection(sectionId);
                
                // Actualizar navegación activa
                navLinks.forEach(l => l.classList.remove('help-nav-active'));
                link.classList.add('help-nav-active');
            });
        });

        // Acciones rápidas
        const actionLinks = document.querySelectorAll('.help-action-link');
        actionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.scrollToCategory(category);
            });
        });

        // Enlaces de artículos
        const articleLinks = document.querySelectorAll('.help-article-link');
        articleLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const articleId = e.target.getAttribute('data-article');
                this.showArticle(articleId);
            });
        });

        // Búsqueda
        const searchInput = document.querySelector('.help-search-input');
        const searchBtn = document.querySelector('.help-search-btn');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
        }

        // Sugerencias de búsqueda
        const suggestionTags = document.querySelectorAll('.help-suggestion-tag');
        suggestionTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                searchInput.value = e.target.textContent;
                this.performSearch(e.target.textContent);
            });
        });

        // Contactar soporte
        const contactBtn = document.getElementById('contactSupport');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                this.showContactModal();
            });
        }

        // Botones de contacto
        const contactMethods = document.querySelectorAll('.help-contact-btn, .help-support-option');
        contactMethods.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showContactModal();
            });
        });
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.help-faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.help-faq-question');
            question.addEventListener('click', () => {
                this.toggleFAQ(item);
            });
        });
    }

    setupModals() {
        // Modal de contacto
        const contactModal = document.getElementById('contactModal');
        const contactClose = document.getElementById('contactModalClose');
        const contactCancel = document.getElementById('contactCancel');
        const contactSubmit = document.getElementById('contactSubmit');

        const closeContactModal = () => {
            contactModal.classList.remove('help-show');
        };

        contactClose.addEventListener('click', closeContactModal);
        contactCancel.addEventListener('click', closeContactModal);

        contactSubmit.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitContactForm();
        });

        // Modal de artículo
        const articleModal = document.getElementById('articleModal');
        const articleClose = document.getElementById('articleModalClose');

        articleClose.addEventListener('click', () => {
            articleModal.classList.remove('help-show');
        });

        // Cerrar modales al hacer click fuera
        [contactModal, articleModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('help-show');
                }
            });
        });

        // Feedback de artículos
        const feedbackYes = document.querySelector('.help-feedback-yes');
        const feedbackNo = document.querySelector('.help-feedback-no');

        if (feedbackYes) {
            feedbackYes.addEventListener('click', () => {
                this.submitFeedback(true);
            });
        }

        if (feedbackNo) {
            feedbackNo.addEventListener('click', () => {
                this.submitFeedback(false);
            });
        }
    }

    loadArticles() {
        // Simular carga de artículos
        this.articles = {
            'account-creation': {
                title: 'Crear y Verificar tu Cuenta de Empresa',
                content: `
                    <h2>Crear y Verificar tu Cuenta de Empresa</h2>
                    
                    <p>Configurar tu cuenta de empresa en ConnectCargo es un proceso simple que te dará acceso a todas las funciones de la plataforma.</p>
                    
                    <h3>Paso 1: Registro Inicial</h3>
                    <ol>
                        <li>Haz clic en "Registrar Empresa" en la página principal</li>
                        <li>Completa el formulario con tu información básica:
                            <ul>
                                <li>Nombre legal de la empresa</li>
                                <li>NIT o documento de identificación</li>
                                <li>Email corporativo</li>
                                <li>Teléfono de contacto</li>
                            </ul>
                        </li>
                        <li>Crea una contraseña segura</li>
                        <li>Acepta los términos y condiciones</li>
                    </ol>
                    
                    <h3>Paso 2: Verificación de Email</h3>
                    <p>Después del registro, recibirás un email de verificación. Haz clic en el enlace para confirmar tu dirección de email.</p>
                    
                    <h3>Paso 3: Completar Perfil de Empresa</h3>
                    <p>Accede a tu panel y completa la información de tu empresa:</p>
                    <ul>
                        <li><strong>Información legal:</strong> Cámara de comercio, dirección fiscal</li>
                        <li><strong>Información comercial:</strong> Tipo de empresa, tamaño, industria</li>
                        <li><strong>Preferencias logísticas:</strong> Tipos de carga usuales, rutas preferidas</li>
                    </ul>
                    
                    <h3>Paso 4: Verificación de Documentos</h3>
                    <p>Sube los documentos requeridos para la verificación:</p>
                    <ul>
                        <li>Cámara de comercio (máximo 3 meses)</li>
                        <li>RUT actualizado</li>
                        <li>Documento de identificación del representante legal</li>
                    </ul>
                    
                    <p><strong>Tiempo de verificación:</strong> 1-2 días hábiles</p>
                    
                    <div class="help-tip">
                        <strong>💡 Tip:</strong> Mantén tus documentos digitalizados y listos para agilizar el proceso.
                    </div>
                `
            },
            'first-shipment': {
                title: 'Publicar tu Primera Carga',
                content: `
                    <h2>Publicar tu Primera Carga</h2>
                    
                    <p>Aprende a publicar tu primera carga en ConnectCargo y conectar con transportistas confiables.</p>
                    
                    <h3>Antes de Comenzar</h3>
                    <p>Asegúrate de tener esta información a mano:</p>
                    <ul>
                        <li>Origen y destino exactos</li>
                        <li>Tipo y peso de la mercancía</li>
                        <li>Fechas de recogida y entrega</li>
                        <li>Requisitos especiales (si aplica)</li>
                    </ul>
                    
                    <h3>Paso a Paso para Publicar</h3>
                    
                    <h4>1. Acceder a Publicar Carga</h4>
                    <p>Desde tu dashboard, haz clic en "Publicar Carga" en el menú principal o en el botón destacado.</p>
                    
                    <h4>2. Información Básica</h4>
                    <p>Completa la información esencial:</p>
                    <ul>
                        <li><strong>Origen:</strong> Dirección completa de recogida</li>
                        <li><strong>Destino:</strong> Dirección completa de entrega</li>
                        <li><strong>Tipo de Carga:</strong> Selecciona la categoría adecuada</li>
                        <li><strong>Descripción:</strong> Detalles específicos de la mercancía</li>
                    </ul>
                    
                    <h4>3. Especificaciones Técnicas</h4>
                    <p>Define las características de tu carga:</p>
                    <ul>
                        <li><strong>Peso total:</strong> En kilogramos</li>
                        <li><strong>Dimensiones:</strong> Alto, ancho, largo (opcional)</li>
                        <li><strong>Volumen:</strong> Metros cúbicos (si aplica)</li>
                        <li><strong>Unidades:</strong> Cantidad de paquetes o items</li>
                    </ul>
                    
                    <h4>4. Fechas y Tiempos</h4>
                    <p>Establece el cronograma:</p>
                    <ul>
                        <li><strong>Fecha de recogida:</strong> Cuándo debe ser recogida la carga</li>
                        <li><strong>Fecha de entrega:</strong> Fecha límite para la entrega</li>
                        <li><strong>Horarios:</strong> Ventanas de tiempo específicas</li>
                    </ul>
                    
                    <h4>5. Requisitos y Condiciones</h4>
                    <p>Especifica necesidades especiales:</p>
                    <ul>
                        <li><strong>Tipo de vehículo:</strong> Camión, furgón, etc.</li>
                        <li><strong>Equipamiento:</strong> Refrigeración, plataforma, etc.</li>
                        <li><strong>Documentación:</strong> Requisitos documentales</li>
                        <li><strong>Seguros:</strong> Coberturas requeridas</li>
                    </ul>
                    
                    <h4>6. Presupuesto y Publicación</h4>
                    <p>Finaliza la publicación:</p>
                    <ul>
                        <li><strong>Presupuesto máximo:</strong> Establece tu tope de gasto</li>
                        <li><strong>Revisión final:</strong> Verifica toda la información</li>
                        <li><strong>Publicar:</strong> Haz clic en publicar para activar la carga</li>
                    </ul>
                    
                    <h3>¿Qué Sucede Después?</h3>
                    <p>Una vez publicada tu carga:</p>
                    <ol>
                        <li>Los transportistas verán tu carga en sus búsquedas</li>
                        <li>Recibirás cotizaciones en tu panel</li>
                        <li>Podrás evaluar y seleccionar la mejor opción</li>
                        <li>Confirmarás el transportista y coordinarás los detalles</li>
                    </ol>
                    
                    <div class="help-warning">
                        <strong>⚠️ Importante:</strong> Proporciona información precisa para evitar inconvenientes durante el transporte.
                    </div>
                `
            },
            'find-carriers': {
                title: 'Encontrar Transportistas Confiables',
                content: `
                    <h2>Encontrar Transportistas Confiables</h2>
                    <p>Guía completa para buscar, evaluar y seleccionar los mejores transportistas en ConnectCargo.</p>
                    <!-- Contenido adicional del artículo -->
                `
            },
            'advanced-shipment': {
                title: 'Publicar Cargas Avanzado',
                content: `
                    <h2>Publicar Cargas Avanzado</h2>
                    <p>Configuraciones avanzadas para tipos especiales de carga.</p>
                    <!-- Contenido adicional del artículo -->
                `
            },
            'tracking-guide': {
                title: 'Seguimiento en Tiempo Real',
                content: `
                    <h2>Seguimiento en Tiempo Real</h2>
                    <p>Aprende a usar las herramientas de seguimiento de envíos.</p>
                    <!-- Contenido adicional del artículo -->
                `
            },
            'documentation': {
                title: 'Documentación de Envíos',
                content: `
                    <h2>Documentación de Envíos</h2>
                    <p>Gestión completa de documentos para tus envíos.</p>
                    <!-- Contenido adicional del artículo -->
                `
            }
        };
    }

    switchSection(sectionId) {
        // Ocultar todas las secciones
        const sections = document.querySelectorAll('.help-section');
        sections.forEach(section => {
            section.classList.remove('help-section-active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('help-section-active');
            this.currentSection = sectionId;
            
            // Scroll suave a la sección
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    scrollToCategory(category) {
        const sectionMap = {
            'shipments': 'shipment-guides',
            'billing': 'billing-help',
            'carriers': 'shipment-guides',
            'settings': 'account-management'
        };

        const targetSection = sectionMap[category];
        if (targetSection) {
            this.switchSection(targetSection);
            
            // Actualizar navegación
            const navLinks = document.querySelectorAll('.help-nav-link');
            navLinks.forEach(link => {
                link.classList.remove('help-nav-active');
                if (link.getAttribute('href') === `#${targetSection}`) {
                    link.classList.add('help-nav-active');
                }
            });
        }
    }

    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Cerrar todos los items primero
        const allItems = document.querySelectorAll('.help-faq-item');
        allItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });

        // Abrir el item clickeado si no estaba activo
        if (!isActive) {
            item.classList.add('active');
        }
    }

    performSearch(query) {
        if (!query.trim()) {
            this.showNotification('Por favor ingresa un término de búsqueda', 'warning');
            return;
        }

        this.showNotification(`Buscando: "${query}"`, 'info');
        
        // Simular búsqueda
        setTimeout(() => {
            const results = this.searchArticles(query);
            this.displaySearchResults(results, query);
        }, 1000);
    }

    searchArticles(query) {
        // En una implementación real, esto buscaría en una base de datos
        // Por ahora, simulamos resultados
        const searchTerms = query.toLowerCase().split(' ');
        
        return Object.entries(this.articles).filter(([id, article]) => {
            const content = (article.title + ' ' + article.content).toLowerCase();
            return searchTerms.some(term => content.includes(term));
        }).map(([id, article]) => ({ id, ...article }));
    }

    displaySearchResults(results, query) {
        if (results.length === 0) {
            this.showNotification(`No se encontraron resultados para "${query}"`, 'warning');
            return;
        }

        // Crear sección de resultados
        let resultsHTML = `
            <div class="help-search-results">
                <div class="help-results-header">
                    <h3>Resultados de búsqueda para "${query}"</h3>
                    <span class="help-results-count">${results.length} resultado(s) encontrado(s)</span>
                </div>
                <div class="help-results-list">
        `;

        results.forEach(result => {
            resultsHTML += `
                <div class="help-result-item">
                    <h4>${result.title}</h4>
                    <p>${this.extractSnippet(result.content, query)}</p>
                    <button class="help-result-link" data-article="${result.id}">
                        Ver artículo completo
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            `;
        });

        resultsHTML += `</div></div>`;

        // Mostrar en la sección activa
        const activeSection = document.querySelector('.help-section-active');
        if (activeSection) {
            activeSection.innerHTML = resultsHTML;
            
            // Agregar event listeners a los resultados
            const resultLinks = activeSection.querySelectorAll('.help-result-link');
            resultLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const articleId = e.target.getAttribute('data-article');
                    this.showArticle(articleId);
                });
            });
        }
    }

    extractSnippet(content, query) {
        // Extraer un snippet relevante alrededor del término de búsqueda
        const plainText = content.replace(/<[^>]*>/g, '');
        const index = plainText.toLowerCase().indexOf(query.toLowerCase());
        
        if (index === -1) {
            return plainText.substring(0, 150) + '...';
        }
        
        const start = Math.max(0, index - 50);
        const end = Math.min(plainText.length, index + 100);
        let snippet = plainText.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < plainText.length) snippet = snippet + '...';
        
        return snippet;
    }

    showArticle(articleId) {
        const article = this.articles[articleId];
        if (!article) {
            this.showNotification('Artículo no encontrado', 'error');
            return;
        }

        const modal = document.getElementById('articleModal');
        const title = document.getElementById('articleModalTitle');
        const content = document.getElementById('articleModalContent');

        title.textContent = article.title;
        content.innerHTML = article.content;

        modal.classList.add('help-show');
    }

    showContactModal() {
        const modal = document.getElementById('contactModal');
        modal.classList.add('help-show');
    }

    submitContactForm() {
        const subject = document.getElementById('contactSubject').value;
        const description = document.getElementById('contactDescription').value;
        const priority = document.querySelector('input[name="priority"]:checked').value;

        if (!subject || !description) {
            this.showNotification('Por favor completa todos los campos requeridos', 'warning');
            return;
        }

        // Simular envío
        this.showNotification('Enviando tu solicitud de soporte...', 'info');
        
        setTimeout(() => {
            this.showNotification('Solicitud enviada correctamente. Te contactaremos pronto.', 'success');
            document.getElementById('contactModal').classList.remove('help-show');
            
            // Limpiar formulario
            document.getElementById('contactSubject').value = '';
            document.getElementById('contactDescription').value = '';
            document.querySelector('input[name="priority"][value="medium"]').checked = true;
            
        }, 2000);
    }

    submitFeedback(wasHelpful) {
        const articleTitle = document.getElementById('articleModalTitle').textContent;
        
        if (wasHelpful) {
            this.showNotification('¡Gracias por tu feedback positivo!', 'success');
        } else {
            this.showNotification('Lamentamos que no te haya sido útil. Mejoraremos este artículo.', 'info');
        }
        
        // Cerrar modal después de enviar feedback
        setTimeout(() => {
            document.getElementById('articleModal').classList.remove('help-show');
        }, 1500);
        
        // Aquí normalmente enviarías el feedback al servidor
        console.log(`Feedback para "${articleTitle}": ${wasHelpful ? 'Útil' : 'No útil'}`);
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `help-notification help-notification-${type}`;
        notification.innerHTML = `
            <div class="help-notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-large);
            z-index: 10001;
            max-width: 400px;
            animation: helpSlideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            notification.style.animation = 'helpSlideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#10B981',
            'error': '#EF4444',
            'warning': '#F59E0B',
            'info': '#3B82F6'
        };
        return colors[type] || '#3B82F6';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    new CompanyHelp();
});

// Agregar estilos CSS para las animaciones de notificación
const notificationStyles = `
@keyframes helpSlideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes helpSlideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.help-notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.help-notification-content i {
    font-size: 1.2rem;
}

.help-tip {
    background: #F0FDF4;
    border: 1px solid #10B981;
    border-radius: var(--border-radius);
    padding: 1rem;
    margin: 1rem 0;
}

.help-warning {
    background: #FEF3E6;
    border: 1px solid #F59E0B;
    border-radius: var(--border-radius);
    padding: 1rem;
    margin: 1rem 0;
}
`;

// Injectar los estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);