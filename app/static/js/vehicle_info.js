// vehicle_info.js - Funcionalidades para gestión de vehículos

class VehicleManager {
    constructor() {
        this.currentTab = 'fleet';
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupEventListeners();
        this.setupModal();
        this.setupUploadArea();
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.vehicle-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Actualizar navegación
        document.querySelectorAll('.vehicle-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.vehicle-tab[data-tab="${tabName}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.vehicle-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    setupEventListeners() {
        // Botones para agregar vehículo
        document.getElementById('addVehicleBtn')?.addEventListener('click', () => {
            this.openVehicleModal();
        });

        document.getElementById('addAnotherVehicleBtn')?.addEventListener('click', () => {
            this.openVehicleModal();
        });

        // Botones de acción en vehículos existentes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.vehicle-action-btn')) {
                const btn = e.target.closest('.vehicle-action-btn');
                this.handleVehicleAction(btn);
            }
        });

        // Botones de documentos
        document.addEventListener('click', (e) => {
            if (e.target.closest('.document-action-btn')) {
                const btn = e.target.closest('.document-action-btn');
                this.handleDocumentAction(btn);
            }
        });
    }

    setupModal() {
        const modal = document.getElementById('vehicleModal');
        const closeBtn = document.getElementById('closeVehicleModal');
        const cancelBtn = document.getElementById('cancelVehicle');
        const form = document.getElementById('newVehicleForm');

        // Cerrar modal
        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => {
                this.closeVehicleModal();
            });
        });

        // Cerrar modal al hacer clic fuera
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeVehicleModal();
            }
        });

        // Enviar formulario
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNewVehicle();
        });
    }

    setupUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('documentUpload');

        if (!uploadArea || !fileInput) return;

        // Click en el área de upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // Cambio en input file
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });
    }

    handleVehicleAction(button) {
        const vehicleCard = button.closest('.vehicle-card');
        const actionText = button.textContent.trim();
        
        switch (actionText) {
            case 'Editar':
                this.editVehicle(vehicleCard);
                break;
            case 'Ver Detalles':
                this.viewVehicleDetails(vehicleCard);
                break;
        }
    }

    handleDocumentAction(button) {
        const documentCard = button.closest('.document-card');
        const action = button.querySelector('i').className;
        
        switch (action) {
            case 'fas fa-download':
                this.downloadDocument(documentCard);
                break;
            case 'fas fa-sync':
                this.renewDocument(documentCard);
                break;
        }
    }

    editVehicle(vehicleCard) {
        const vehicleName = vehicleCard.querySelector('h3').textContent;
        this.showToast(`Editando: ${vehicleName}`);
        // Aquí abrirías el modal con los datos del vehículo para editar
    }

    viewVehicleDetails(vehicleCard) {
        const vehicleName = vehicleCard.querySelector('h3').textContent;
        this.showToast(`Viendo detalles de: ${vehicleName}`);
        // Aquí mostrarías un modal o redirigirías a una página de detalles
    }

    downloadDocument(documentCard) {
        const docName = documentCard.querySelector('h4').textContent;
        this.showToast(`Descargando: ${docName}`);
        // Simular descarga
    }

    renewDocument(documentCard) {
        const docName = documentCard.querySelector('h4').textContent;
        this.showToast(`Renovando: ${docName}`);
        // Lógica de renovación
    }

    openVehicleModal() {
        const modal = document.getElementById('vehicleModal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Enfocar el primer campo
        const firstInput = document.getElementById('vehicleBrand');
        setTimeout(() => firstInput?.focus(), 300);
    }

    closeVehicleModal() {
        const modal = document.getElementById('vehicleModal');
        const form = document.getElementById('newVehicleForm');
        
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        form?.reset();
    }

    async saveNewVehicle() {
        const form = document.getElementById('newVehicleForm');
        const formData = new FormData(form);
        const submitBtn = form.querySelector('.vehicle-action-btn.primary');

        try {
            this.setButtonLoading(submitBtn, true);

            // Validaciones
            const vehicleData = {
                brand: formData.get('brand'),
                model: formData.get('model'),
                year: formData.get('year'),
                plate: formData.get('plate'),
                capacity: formData.get('capacity'),
                length: formData.get('length'),
                axles: formData.get('axles'),
                fuel: formData.get('fuel'),
                color: formData.get('color'),
                description: formData.get('description')
            };

            if (!this.validateVehicleData(vehicleData)) {
                throw new Error('Por favor completa todos los campos requeridos');
            }

            // Simular guardado en API
            await this.simulateAPICall('vehicles', vehicleData);

            this.closeVehicleModal();
            this.showToast('Vehículo agregado exitosamente', 'success');
            
            // En una implementación real, aquí agregarías el nuevo vehículo a la lista
            this.addVehicleToDOM(vehicleData);

        } catch (error) {
            this.showToast(error.message, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }

    validateVehicleData(data) {
        return data.brand && data.model && data.year && data.plate && 
               data.capacity && data.length && data.axles && data.fuel;
    }

    addVehicleToDOM(vehicleData) {
        // Esta función agregaría el nuevo vehículo al DOM
        console.log('Nuevo vehículo a agregar:', vehicleData);
        // En una implementación real, crearías una nueva tarjeta de vehículo
    }

    async handleFileUpload(file) {
        // Validar tipo de archivo
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Tipo de archivo no permitido. Use PDF, JPG o PNG.', 'error');
            return;
        }

        // Validar tamaño (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showToast('El archivo debe ser menor a 10MB', 'error');
            return;
        }

        try {
            this.showToast('Subiendo documento...', 'info');
            
            // Simular upload
            await this.simulateAPICall('documents', { file });
            
            this.showToast('Documento subido exitosamente', 'success');
            
            // Aquí actualizarías la lista de documentos
            this.addDocumentToDOM(file.name);

        } catch (error) {
            this.showToast('Error al subir el documento', 'error');
        }
    }

    addDocumentToDOM(filename) {
        // Esta función agregaría el nuevo documento a la lista
        console.log('Nuevo documento subido:', filename);
    }

    // Utilidades
    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-save"></i> Guardar Vehículo';
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
            }, 2000);
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
    new VehicleManager();
});

// Exportar para uso global
window.VehicleManager = VehicleManager;