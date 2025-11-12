from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, current_app
from flask_mail import Message
from app import db, mail
from app.models.user import User, AccountStatus, UserType
from app.models.company import Company, CompanyType  # Añadir CompanyType al import
from app.models.carrier import Carrier, CarrierType  # Añadir CarrierType al import
import re
import hashlib
import secrets
from datetime import datetime

bp = Blueprint('auth', __name__)

class EmailVerification:
    """Sistema real de verificación de email"""
    
    @staticmethod
    def is_valid_email(email):
        """Validación robusta de email"""
        # Patrón más estricto para validación de email
        pattern = r'^[a-zA-Z0-9][a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            return False
        
        # Verificar que el dominio tenga al menos 2 partes
        domain = email.split('@')[1]
        if '.' not in domain or len(domain.split('.')[-1]) < 2:
            return False
            
        return True
    
    @staticmethod
    def send_verification_email(user):
        """Enviar email de verificación real"""
        try:
            # Crear el mensaje
            subject = "Verifica tu cuenta de ConnectCargo"
            verification_url = f"http://localhost:5000/auth/verify-email/{user.verification_token}"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background: #f9f9f9; }}
                    .button {{ display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>¡Bienvenido a ConnectCargo!</h1>
                    </div>
                    <div class="content">
                        <h2>Verifica tu dirección de email</h2>
                        <p>Hola,</p>
                        <p>Gracias por registrarte en ConnectCargo. Para completar tu registro y comenzar a usar nuestra plataforma, por favor verifica tu dirección de email haciendo clic en el botón de abajo:</p>
                        
                        <a href="{verification_url}" class="button">Verificar Email</a>
                        
                        <p>Este enlace de verificación expirará en 24 horas.</p>
                        <p>Si no creaste una cuenta con ConnectCargo, por favor ignora este email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 ConnectCargo. Todos los derechos reservados.</p>
                        <p>Este es un mensaje automático, por favor no respondas a este email.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_body = f"""
            ¡Bienvenido a ConnectCargo!
            
            Verifica tu dirección de email
            
            Hola,
            
            Gracias por registrarte en ConnectCargo. Para completar tu registro y comenzar a usar nuestra plataforma, por favor verifica tu dirección de email visitando el siguiente enlace:
            
            {verification_url}
            
            Este enlace de verificación expirará en 24 horas.
            
            Si no creaste una cuenta con ConnectCargo, por favor ignora este email.
            
            © 2024 ConnectCargo. Todos los derechos reservados.
            """
            
            msg = Message(
                subject=subject,
                recipients=[user.email],
                html=html_body,
                body=text_body
            )
            
            # Enviar el email
            mail.send(msg)
            print(f"✅ Email de verificación enviado a: {user.email}")
            return True
            
        except Exception as e:
            print(f"❌ Error enviando email de verificación: {str(e)}")
            return False

class PasswordHelper:
    """Clase de utilidades para contraseñas"""
    
    @staticmethod
    def hash_password(password):
        """Hashear una contraseña para almacenamiento"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password, hashed):
        """Verificar una contraseña contra su hash"""
        return hashlib.sha256(password.encode()).hexdigest() == hashed
    
    @staticmethod
    def is_strong_password(password):
        """Validar fortaleza de la contraseña"""
        if len(password) < 8:
            return False, "La contraseña debe tener al menos 8 caracteres"
        
        if not re.search(r'[A-Z]', password):
            return False, "La contraseña debe contener al menos una letra mayúscula"
        
        if not re.search(r'[a-z]', password):
            return False, "La contraseña debe contener al menos una letra minúscula"
        
        if not re.search(r'[0-9]', password):
            return False, "La contraseña debe contener al menos un número"
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "La contraseña debe contener al menos un carácter especial"
        
        return True, "Contraseña segura"

@bp.route('/register', methods=['GET', 'POST'])
def register():
    """Página de registro de usuario"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        user_type = request.form.get('user_type', '')
        full_name = request.form.get('full_name', '').strip()
        phone = request.form.get('phone', '').strip()
        
        # Validación de email
        if not EmailVerification.is_valid_email(email):
            flash('Por favor ingresa una dirección de email válida con dominio apropiado.', 'error')
            return render_template('register.html')
        
        # Validación de contraseña
        is_strong, password_message = PasswordHelper.is_strong_password(password)
        if not is_strong:
            flash(password_message, 'error')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Las contraseñas no coinciden.', 'error')
            return render_template('register.html')
        
        if user_type not in ['company', 'carrier']:
            flash('Por favor selecciona un tipo de usuario válido.', 'error')
            return render_template('register.html')
        
        # Verificar si el email ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Ya existe una cuenta con este email.', 'error')
            return render_template('register.html')
        
        try:
            # Determinar el tipo de usuario usando el enum
            user_type_enum = UserType.CARRIER if user_type == 'carrier' else UserType.COMPANY
            
            # Crear usuario
            new_user = User(
                email=email,
                password_hash=PasswordHelper.hash_password(password),
                user_type=user_type_enum, 
                phone=phone,
                address='',
                city='',
                identity_document=None, 
                document_type=None,
                accepted_terms=True,
                terms_acceptance_date=datetime.utcnow()
            )
            
            # Generar token de verificación
            new_user.generate_verification_token()
            
            db.session.add(new_user)
            db.session.flush()  # Obtener el ID del usuario
            
            # Crear perfil específico basado en el tipo de usuario
            if user_type == 'company':
                new_profile = Company(
                    user_id=new_user.id,
                    legal_name=full_name,
                    commercial_name=full_name,
                    company_type=CompanyType.LEGAL  # Usar el enum CompanyType
                )
            else:  # carrier
                new_profile = Carrier(
                    user_id=new_user.id,
                    carrier_type=CarrierType.INDIVIDUAL,  # Usar el enum CarrierType
                    driver_license=None  # Se actualizará en el perfil
                )
            
            db.session.add(new_profile)
            
            # Enviar email de verificación
            email_sent = EmailVerification.send_verification_email(new_user)
            
            if email_sent:
                db.session.commit()
                flash('¡Registro exitoso! Por favor revisa tu email para las instrucciones de verificación.', 'success')
                return redirect(url_for('auth.login'))
            else:
                db.session.rollback()
                flash('Error enviando email de verificación. Por favor intenta de nuevo.', 'error')
            
        except Exception as e:
            db.session.rollback()
            flash('Ocurrió un error durante el registro. Por favor intenta de nuevo.', 'error')
            print(f"Error de registro: {str(e)}")
    
    return render_template('register.html')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    """Página de login de usuario"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if user and PasswordHelper.verify_password(password, user.password_hash):
            # Verificar si el email está verificado
            if not user.email_verified:
                flash('Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación.', 'warning')
                return render_template('login.html')
            
            # Verificar si la cuenta está activa
            if user.account_status != AccountStatus.ACTIVE:
                flash('Tu cuenta no está activa. Por favor contacta al soporte.', 'error')
                return render_template('login.html')
            
            # Actualizar último login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            flash(f'¡Bienvenido de nuevo, {email}!', 'success')
            
            # Redirigir según el tipo de usuario
            if user.user_type == UserType.COMPANY:
                return redirect(url_for('auth.welcome_company'))
            else:  # CARRIER
                return redirect(url_for('auth.welcome_carrier'))
                
        else:
            # Incrementar intentos fallidos
            if user:
                user.failed_attempts += 1
                if user.failed_attempts >= 5:
                    user.lockout_date = datetime.utcnow()
                    flash('Cuenta temporalmente bloqueada por demasiados intentos fallidos.', 'error')
                db.session.commit()
            else:
                flash('Email o contraseña inválidos.', 'error')
    
    return render_template('login.html')

@bp.route('/welcome/company')
def welcome_company():
    """Página de bienvenida para empresas"""
    return render_template('panel_company.html')

@bp.route('/welcome/carrier')
def welcome_carrier():
    """Página de bienvenida para transportistas"""
    return render_template('panel_carrier.html')

@bp.route('/verify-email/<token>')
def verify_email(token):
    """Endpoint de verificación de email"""
    try:
        user = User.query.filter_by(verification_token=token).first()
        
        if not user:
            flash('Token de verificación inválido.', 'error')
            return redirect(url_for('auth.login'))
        
        if not user.is_verification_token_valid():
            flash('El token de verificación ha expirado. Por favor regístrate de nuevo.', 'error')
            return redirect(url_for('auth.register'))
        
        # Verificar email
        user.verify_email()
        db.session.commit()
        
        flash('¡Email verificado exitosamente! Ya puedes iniciar sesión.', 'success')
        return redirect(url_for('auth.login'))
        
    except Exception as e:
        db.session.rollback()
        flash('Error verificando el email. Por favor intenta de nuevo.', 'error')
        return redirect(url_for('auth.login'))

@bp.route('/check-email')
def check_email():
    """API endpoint para verificar si email existe"""
    email = request.args.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'exists': False, 'valid': False})
    
    valid = EmailVerification.is_valid_email(email)
    exists = User.query.filter_by(email=email).first() is not None
    
    return jsonify({
        'exists': exists,
        'valid': valid,
        'message': 'Email ya registrado' if exists else 'Email disponible'
    })

@bp.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    """Recuperación de contraseña"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        
        user = User.query.filter_by(email=email).first()
        if user and user.email_verified:
            # En una aplicación real, enviar email de recuperación
            flash('Las instrucciones para restablecer tu contraseña han sido enviadas a tu email.', 'success')
        else:
            flash('Si este email existe y está verificado, las instrucciones de recuperación han sido enviadas.', 'success')
        
        return redirect(url_for('auth.login'))
    
    return render_template('forgot_password.html')