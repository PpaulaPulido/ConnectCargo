from flask import Blueprint, render_template, flash, redirect, url_for, request, jsonify
from flask_login import login_required, current_user

bp = Blueprint('companies', __name__)

@bp.route('/')
@login_required
def company_dashboard():
    """Dashboard principal de la empresa"""
    # Verificar que el usuario es una empresa
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/panel_company.html')

@bp.route('/profile')
@login_required
def company_profile():
    """Perfil de la empresa"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/profile.html')

@bp.route('/publish-load')
@login_required
def publish_load():
    """Publicar nueva carga"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/publish_load.html')

@bp.route('/find-drivers')
@login_required
def find_drivers():
    """Buscar conductores disponibles"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/find_drivers.html')

@bp.route('/published-loads')
@login_required
def published_loads():
    """Cargas publicadas por la empresa"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/published_loads.html')

@bp.route('/in-progress-loads')
@login_required
def in_progress_loads():
    """Cargas en curso"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/in_progress_loads.html')

@bp.route('/completed-loads')
@login_required
def completed_loads():
    """Cargas completadas"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/completed_loads.html')

@bp.route('/statistics')
@login_required
def statistics():
    """Estadísticas de la empresa"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/statistics.html')

@bp.route('/settings')
@login_required
def settings():
    """Configuración de la empresa"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/settings.html')

@bp.route('/notifications')
@login_required
def notifications():
    """Notificaciones de la empresa"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/notifications.html')

@bp.route('/help')
@login_required
def help():
    """Centro de ayuda"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/help.html')

# Rutas adicionales para funcionalidades específicas

@bp.route('/load/<int:load_id>')
@login_required
def load_details(load_id):
    """Detalles de una carga específica"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/load_details.html', load_id=load_id)

@bp.route('/driver/<int:driver_id>')
@login_required
def driver_profile(driver_id):
    """Perfil de un conductor"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/driver_profile.html', driver_id=driver_id)

@bp.route('/create-load', methods=['POST'])
@login_required
def create_load():
    """API para crear una nueva carga"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para crear carga
    flash('Carga publicada exitosamente', 'success')
    return jsonify({'success': True, 'message': 'Carga creada exitosamente'})

@bp.route('/load/<int:load_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_load(load_id):
    """Editar una carga existente"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    if request.method == 'POST':
        # Lógica para editar carga
        flash('Carga actualizada exitosamente', 'success')
        return redirect(url_for('companies.published_loads'))
    
    return render_template('companies/edit_load.html', load_id=load_id)

@bp.route('/load/<int:load_id>/delete', methods=['POST'])
@login_required
def delete_load(load_id):
    """Eliminar una carga"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para eliminar carga
    flash('Carga eliminada exitosamente', 'success')
    return jsonify({'success': True, 'message': 'Carga eliminada exitosamente'})

@bp.route('/load/<int:load_id>/accept-driver/<int:driver_id>', methods=['POST'])
@login_required
def accept_driver(load_id, driver_id):
    """Aceptar un conductor para una carga"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para aceptar conductor
    flash('Conductor aceptado para la carga', 'success')
    return jsonify({'success': True, 'message': 'Conductor aceptado'})

@bp.route('/load/<int:load_id>/complete', methods=['POST'])
@login_required
def complete_load(load_id):
    """Marcar carga como completada"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para completar carga
    flash('Carga marcada como completada', 'success')
    return jsonify({'success': True, 'message': 'Carga completada'})

@bp.route('/rate-driver/<int:driver_id>', methods=['POST'])
@login_required
def rate_driver(driver_id):
    """Calificar a un conductor"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para calificar conductor
    flash('Conductor calificado exitosamente', 'success')
    return jsonify({'success': True, 'message': 'Conductor calificado'})

@bp.route('/api/statistics')
@login_required
def api_statistics():
    """API para obtener estadísticas en formato JSON"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    stats = {
        'total_loads': 0,
        'in_progress': 0,
        'completed': 0,
        'total_spent': 0,
        'average_rating': 0
    }
    return jsonify(stats)

@bp.route('/api/search-drivers')
@login_required
def api_search_drivers():
    """API para buscar conductores"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    search_query = request.args.get('q', '')
    # Lógica de búsqueda
    drivers = []
    return jsonify(drivers)

@bp.route('/api/notifications')
@login_required
def api_notifications():
    """API para obtener notificaciones"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    notifications = []
    return jsonify(notifications)

@bp.route('/update-profile', methods=['POST'])
@login_required
def update_profile():
    """Actualizar perfil de la empresa"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para actualizar perfil
    flash('Perfil actualizado exitosamente', 'success')
    return jsonify({'success': True, 'message': 'Perfil actualizado'})

@bp.route('/update-settings', methods=['POST'])
@login_required
def update_settings():
    """Actualizar configuración"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para actualizar configuración
    flash('Configuración actualizada exitosamente', 'success')
    return jsonify({'success': True, 'message': 'Configuración actualizada'})

# Rutas para manejo de documentos

@bp.route('/upload-document', methods=['POST'])
@login_required
def upload_document():
    """Subir documento de la empresa"""
    if current_user.user_type.value != 'company':
        return jsonify({'error': 'No autorizado'}), 403
    
    # Lógica para subir documentos
    flash('Documento subido exitosamente', 'success')
    return jsonify({'success': True, 'message': 'Documento subido'})

@bp.route('/documents')
@login_required
def documents():
    """Gestión de documentos"""
    if current_user.user_type.value != 'company':
        flash('No tienes permisos para acceder a esta sección', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('companies/documents.html')