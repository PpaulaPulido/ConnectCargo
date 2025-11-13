from flask import Blueprint, request, flash, redirect, url_for, current_app
from werkzeug.utils import secure_filename
import os
from app import db
from app.models.user import User

bp = Blueprint('profile', __name__)

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@bp.route('/profile/picture', methods=['POST'])
def update_profile_picture():
    """Actualizar foto de perfil del usuario"""
    # Aquí necesitarías tener el usuario logueado
    # user_id = current_user.id  # Si usas Flask-Login
    user_id = 1  # Temporal - reemplazar con el usuario actual
    
    if 'profile_picture' not in request.files:
        flash('No se seleccionó ningún archivo.', 'error')
        return redirect(url_for('auth.welcome_company'))  # O la página correspondiente
    
    file = request.files['profile_picture']
    
    if file.filename == '':
        flash('No se seleccionó ningún archivo.', 'error')
        return redirect(url_for('auth.welcome_company'))
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Renombrar el archivo para evitar conflictos
        unique_filename = f"user_{user_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{filename}"
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Actualizar en la base de datos
        user = User.query.get(user_id)
        user.profile_picture = unique_filename
        db.session.commit()
        
        flash('Foto de perfil actualizada correctamente.', 'success')
    else:
        flash('Tipo de archivo no permitido. Use PNG, JPG, JPEG o GIF.', 'error')
    
    return redirect(url_for('auth.welcome_company'))