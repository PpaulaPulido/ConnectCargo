class CompanyStatistics {
    constructor() {
        this.currentPeriod = 'month';
        this.chartData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChartData();
        this.setupChartInteractions();
        this.setupExportModal();
    }

    setupEventListeners() {
        // Selector de período
        const periodSelect = document.getElementById('periodSelect');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.updateCharts();
            });
        }

        // Botón de actualizar
        const refreshBtn = document.getElementById('refreshStats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Botón de exportar
        const exportBtn = document.getElementById('exportStats');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportModal();
            });
        }

        // Toggle de métricas
        const toggleMetrics = document.getElementById('toggleMetrics');
        if (toggleMetrics) {
            toggleMetrics.addEventListener('click', () => {
                this.toggleDetailedMetrics();
            });
        }

        // Acciones de gráficos
        const chartActions = document.querySelectorAll('.statistics-chart-action');
        chartActions.forEach(action => {
            action.addEventListener('click', (e) => {
                this.switchChartView(e.target);
            });
        });
    }

    setupChartInteractions() {
        // Interacción con barras del gráfico
        const chartBars = document.querySelectorAll('.statistics-chart-bar');
        chartBars.forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                this.showBarTooltip(e.target);
            });
            
            bar.addEventListener('mouseleave', () => {
                this.hideBarTooltip();
            });
        });

        // Interacción con segmentos del donut
        const donutSegments = document.querySelectorAll('.statistics-donut-segment');
        donutSegments.forEach(segment => {
            segment.addEventListener('mouseenter', (e) => {
                this.highlightDonutSegment(e.target);
            });
            
            segment.addEventListener('mouseleave', () => {
                this.resetDonutSegments();
            });
        });
    }

    setupExportModal() {
        const exportModal = document.getElementById('exportModal');
        const exportClose = document.getElementById('exportModalClose');
        const exportCancel = document.getElementById('exportCancel');
        const exportConfirm = document.getElementById('exportConfirm');

        const closeModal = () => {
            exportModal.classList.remove('statistics-show');
        };

        exportClose.addEventListener('click', closeModal);
        exportCancel.addEventListener('click', closeModal);

        exportConfirm.addEventListener('click', () => {
            this.exportReport();
            closeModal();
        });

        // Cerrar modal al hacer click fuera
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) {
                closeModal();
            }
        });
    }

    loadChartData() {
        // Simular carga de datos
        this.chartData = {
            volume: [85, 102, 72, 108, 114, 120, 106, 110, 102, 94, 98, 90],
            revenue: [4200000, 5100000, 3600000, 5400000, 5700000, 6000000, 5300000, 5500000, 5100000, 4700000, 4900000, 4500000],
            routes: [
                { name: 'Bogotá - Medellín', success: 96.5, time: 18, trips: 48 },
                { name: 'Cali - Barranquilla', success: 94.2, time: 32, trips: 24 },
                { name: 'Medellín - Cartagena', success: 97.8, time: 22, trips: 36 },
                { name: 'Bucaramanga - Bogotá', success: 99.1, time: 8, trips: 62 }
            ],
            cargoTypes: [
                { type: 'Mercancía General', percentage: 35 },
                { type: 'Alimentos', percentage: 25 },
                { type: 'Electrónicos', percentage: 20 },
                { type: 'Textiles', percentage: 15 },
                { type: 'Otros', percentage: 5 }
            ]
        };
    }

    updateCharts() {
        // Simular actualización de gráficos según el período
        this.showNotification(`Actualizando datos para: ${this.getPeriodText(this.currentPeriod)}`, 'info');
        
        // Aquí iría la lógica real para actualizar los gráficos
        setTimeout(() => {
            this.animateChartUpdates();
        }, 500);
    }

    getPeriodText(period) {
        const periods = {
            'today': 'Hoy',
            'week': 'Esta Semana',
            'month': 'Este Mes',
            'quarter': 'Este Trimestre',
            'year': 'Este Año',
            'custom': 'Periodo Personalizado'
        };
        return periods[period] || period;
    }

    animateChartUpdates() {
        // Animación simple para simular actualización
        const chartBars = document.querySelectorAll('.statistics-chart-bar');
        chartBars.forEach((bar, index) => {
            bar.style.transform = 'scaleY(1.1)';
            setTimeout(() => {
                bar.style.transform = 'scaleY(1)';
            }, 300 + (index * 50));
        });
    }

    refreshData() {
        const refreshBtn = document.getElementById('refreshStats');
        const originalHtml = refreshBtn.innerHTML;
        
        // Mostrar estado de carga
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
        refreshBtn.disabled = true;
        
        // Simular carga de datos
        setTimeout(() => {
            this.loadChartData();
            this.updateCharts();
            
            // Restaurar botón
            refreshBtn.innerHTML = originalHtml;
            refreshBtn.disabled = false;
            
            this.showNotification('Datos actualizados correctamente', 'success');
        }, 1500);
    }

    switchChartView(button) {
        const chartActions = button.parentElement.querySelectorAll('.statistics-chart-action');
        chartActions.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const chartType = button.getAttribute('data-chart');
        this.toggleChartData(chartType);
    }

    toggleChartData(chartType) {
        const chartBars = document.querySelectorAll('.statistics-chart-bar');
        const chartValues = chartType === 'volume' ? this.chartData.volume : this.chartData.revenue;
        
        chartBars.forEach((bar, index) => {
            const value = chartValues[index];
            const maxValue = Math.max(...chartValues);
            const percentage = (value / maxValue) * 100;
            
            bar.style.height = `${percentage}%`;
            bar.setAttribute('data-value', chartType === 'volume' ? value : `$${(value/1000000).toFixed(1)}M`);
        });
        
        // Actualizar leyenda
        const legend = document.querySelector('.statistics-chart-legend .statistics-legend-item span:last-child');
        if (legend) {
            legend.textContent = chartType === 'volume' ? 'Envíos Completados' : 'Ingresos (Millones)';
        }
    }

    showBarTooltip(bar) {
        const month = bar.getAttribute('data-month');
        const value = bar.getAttribute('data-value');
        
        // Crear tooltip
        let tooltip = document.querySelector('.statistics-chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'statistics-chart-tooltip';
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = `
            <div class="statistics-tooltip-content">
                <strong>${month}</strong>
                <span>${value} envíos</span>
            </div>
        `;
        
        const rect = bar.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 50}px`;
        tooltip.style.display = 'block';
    }

    hideBarTooltip() {
        const tooltip = document.querySelector('.statistics-chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    highlightDonutSegment(segment) {
        // Resetear todos los segmentos primero
        this.resetDonutSegments();
        
        // Resaltar segmento hover
        segment.style.transform = 'scale(1.05)';
        segment.style.opacity = '0.9';
        
        // Resaltar leyenda correspondiente
        const segments = document.querySelectorAll('.statistics-donut-segment');
        const index = Array.from(segments).indexOf(segment);
        const legendItems = document.querySelectorAll('.statistics-donut-legend .statistics-legend-item');
        
        if (legendItems[index]) {
            legendItems[index].style.transform = 'translateX(5px)';
            legendItems[index].style.fontWeight = '600';
        }
    }

    resetDonutSegments() {
        const segments = document.querySelectorAll('.statistics-donut-segment');
        segments.forEach(segment => {
            segment.style.transform = 'scale(1)';
            segment.style.opacity = '1';
        });
        
        const legendItems = document.querySelectorAll('.statistics-donut-legend .statistics-legend-item');
        legendItems.forEach(item => {
            item.style.transform = 'translateX(0)';
            item.style.fontWeight = '400';
        });
    }

    toggleDetailedMetrics() {
        const metricsGrid = document.querySelector('.statistics-metrics-grid');
        const toggleBtn = document.getElementById('toggleMetrics');
        
        if (metricsGrid.style.display === 'none') {
            metricsGrid.style.display = 'grid';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Métricas';
        } else {
            metricsGrid.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Ver Todas las Métricas';
        }
    }

    showExportModal() {
        const exportModal = document.getElementById('exportModal');
        exportModal.classList.add('statistics-show');
    }

    exportReport() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const period = document.getElementById('exportPeriod').value;
        
        this.showNotification(`Generando reporte en formato ${format.toUpperCase()}...`, 'info');
        
        // Simular generación de reporte
        setTimeout(() => {
            this.showNotification(`Reporte exportado correctamente en formato ${format.toUpperCase()}`, 'success');
            
            // Simular descarga
            const link = document.createElement('a');
            link.href = '#';
            link.download = `reporte_estadisticas_${period}_${new Date().toISOString().split('T')[0]}.${format}`;
            link.click();
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.statistics-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `statistics-notification statistics-notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-large);
            z-index: 10000;
            animation: statisticsSlideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'statisticsSlideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes statisticsSlideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes statisticsSlideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }

        .statistics-chart-tooltip {
            position: fixed;
            background: var(--bg-dark);
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: var(--border-radius);
            font-size: 0.8rem;
            z-index: 10000;
            pointer-events: none;
            transform: translateX(-50%);
            display: none;
        }

        .statistics-tooltip-content {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .statistics-tooltip-content strong {
            font-weight: 600;
        }

        .fa-spinner {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Initialize the statistics functionality
    window.companyStatistics = new CompanyStatistics();
});