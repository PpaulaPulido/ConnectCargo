from flask import Blueprint, render_template, flash, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from app.models.user import UserType  

bp = Blueprint('carriers', __name__)

@bp.route('/')
@login_required
def carrier_dashboard():
    """Dashboard del transportista"""

    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta seccion', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/panel_carrier.html')


@bp.route('/profile')
@login_required
def carrier_profile():
    """Perfil del transportista"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta seccion', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/profile.html')

# ------------------------
# CARGAS / BÚSQUEDA
# ------------------------

@bp.route('/available-loads')
@login_required
def available_loads():
    """Cargas disponibles"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/available_loads.html')

@bp.route('/filter-loads')
@login_required
def filter_loads():
    """Filtrar cargas"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/filter_loads.html')

@bp.route('/manage-loads')
@login_required
def manage_loads():
    """Gestionar cargas"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/manage_loads.html')

# ------------------------
# VIAJES (MIS VIAJES)
# ------------------------

@bp.route('/pending-trips')
@login_required
def pending_trips():
    """Viajes pendientes"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/pending_trips.html')

@bp.route('/accepted-trips')
@login_required
def accepted_trips():
    """Viajes aceptados"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/accepted_trips.html')

@bp.route('/completed-trips')
@login_required
def completed_trips():
    """Viajes finalizados"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/completed_trips.html')

# ------------------------
# DOCUMENTACIÓN
# ------------------------

@bp.route('/license-insurance')
@login_required
def license_insurance():
    """Licencia y seguros"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/license_insurance.html')

@bp.route('/verification-status')
@login_required
def verification_status():
    """Estado de verificación"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/verification_status.html')

@bp.route('/upload-documents')
@login_required
def upload_documents():
    """Cargar documentos"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/upload_documents.html')

# ------------------------
# VEHÍCULO / RUTAS / REPUTACIÓN
# ------------------------

@bp.route('/vehicle-info')
@login_required
def vehicle_info():
    """Información del vehículo"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/vehicle_info.html')

@bp.route('/routes')
@login_required
def routes():
    """Rutas"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/routes.html')

# ------------------------
# CONFIGURACIÓN / NOTIFICACIONES
# ------------------------

@bp.route('/settings')
@login_required
def settings():
    """Configuración"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/settings.html')

@bp.route('/notifications')
@login_required
def notifications():
    """Notificaciones"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('carriers/notifications.html')

# ------------------------
# APIs y funcionalidades adicionales
# ------------------------

@bp.route('/api/available-loads')
@login_required
def api_available_loads():
    """API para cargas disponibles"""
    if current_user.user_type != UserType.CARRIER:
        return jsonify({'error': 'No autorizado'}), 403
    
    loads = []
    return jsonify(loads)

@bp.route('/api/accept-load/<int:load_id>', methods=['POST'])
@login_required
def api_accept_load(load_id):
    """API para aceptar una carga"""
    if current_user.user_type != UserType.CARRIER:
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para aceptar carga
    flash('Carga aceptada exitosamente', 'success')
    return jsonify({'success': True, 'message': 'Carga aceptada'})

@bp.route('/api/update-location', methods=['POST'])
@login_required
def api_update_location():
    """API para actualizar ubicación"""
    if current_user.user_type != UserType.CARRIER:
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para actualizar ubicación
    return jsonify({'success': True, 'message': 'Ubicación actualizada'})