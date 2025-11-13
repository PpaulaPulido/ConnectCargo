from flask import Blueprint, render_template

bp = Blueprint('carriers', __name__)

@bp.route('/')
def carrier_dashboard():
    return "Carrier Dashboard - Coming Soon"

@bp.route('/profile')
def carrier_profile():
    return "Carrier Profile - Coming Soon"

# ------------------------
# CARGAS / BÚSQUEDA
# ------------------------

@bp.route('/available-loads')
def available_loads():
    return "Cargas disponibles - Coming Soon"

@bp.route('/filter-loads')
def filter_loads():
    return "Filtrar cargas - Coming Soon"

@bp.route('/manage-loads')
def manage_loads():
    return "Gestionar cargas - Coming Soon"

# ------------------------
# VIAJES (MIS VIAJES)
# ------------------------

@bp.route('/pending-trips')
def pending_trips():
    return "Viajes pendientes - Coming Soon"

@bp.route('/accepted-trips')
def accepted_trips():
    return "Viajes aceptados - Coming Soon"

@bp.route('/completed-trips')
def completed_trips():
    return "Viajes finalizados - Coming Soon"

# ------------------------
# DOCUMENTACIÓN
# ------------------------

@bp.route('/license-insurance')
def license_insurance():
    return "Licencia y seguros - Coming Soon"

@bp.route('/verification-status')
def verification_status():
    return "Estado de verificación - Coming Soon"

@bp.route('/upload-documents')
def upload_documents():
    return "Cargar documentos - Coming Soon"

# ------------------------
# VEHÍCULO / RUTAS / REPUTACIÓN
# ------------------------

@bp.route('/vehicle-info')
def vehicle_info():
    return "Información del vehículo - Coming Soon"

@bp.route('/routes')
def routes():
    return "Rutas - Coming Soon"

@bp.route('/reputation')
def reputation():
    return "Reputación del conductor - Coming Soon"

# ------------------------
# CONFIGURACIÓN / NOTIFICACIONES
# ------------------------

@bp.route('/settings')
def settings():
    return "Configuración - Coming Soon"

@bp.route('/notifications')
def notifications():
    return "Notificaciones - Coming Soon"
