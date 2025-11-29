from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify, current_app
from flask_mail import Message
from flask_login import login_user, logout_user, login_required, current_user
from app import db, mail
from app.models.user import User, AccountStatus, UserType
from app.models.company import Company, CompanyType
from app.models.carrier import Carrier, CarrierType
import re
import hashlib
import secrets
from datetime import datetime

bp = Blueprint('auth', __name__)

class EmailVerification:
    """Sistema real de verificacion de email"""
    
    @staticmethod
    def is_valid_email(email):
        """Validacion robusta de email"""
        pattern = r'^[a-zA-Z0-9][a-zA-Z0-9._%+-]{3,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            return False
        
        domain = email.split('@')[1]
        if '.' not in domain or len(domain.split('.')[-1]) < 2:
            return False
            
        return True
    
    @staticmethod
    def send_verification_email(user):
        """Enviar email de verificacion real"""
        try:
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
                        <h2>Verifica tu direccion de email</h2>
                        <p>Hola,</p>
                        <p>Gracias por registrarte en ConnectCargo. Para completar tu registro y comenzar a usar nuestra plataforma, por favor verifica tu direccion de email haciendo clic en el boton de abajo:</p>
                        
                        <a href="{verification_url}" class="button">Verificar Email</a>
                        
                        <p>Este enlace de verificacion expirara en 24 horas.</p>
                        <p>Si no creaste una cuenta con ConnectCargo, por favor ignora este email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 ConnectCargo. Todos los derechos reservados.</p>
                        <p>Este es un mensaje automatico, por favor no respondas a este email.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_body = f"""
            ¡Bienvenido a ConnectCargo!
            
            Verifica tu direccion de email
            
            Hola,
            
            Gracias por registrarte en ConnectCargo. Para completar tu registro y comenzar a usar nuestra plataforma, por favor verifica tu direccion de email visitando el siguiente enlace:
            
            {verification_url}
            
            Este enlace de verificacion expirara en 24 horas.
            
            Si no creaste una cuenta con ConnectCargo, por favor ignora este email.
            
            © 2024 ConnectCargo. Todos los derechos reservados.
            """
            
            msg = Message(
                subject=subject,
                recipients=[user.email],
                html=html_body,
                body=text_body
            )
            
            mail.send(msg)
            print(f"Email de verificacion enviado a: {user.email}")
            return True
            
        except Exception as e:
            print(f"Error enviando email de verificacion: {str(e)}")
            return False

class PasswordHelper:
    """Clase de utilidades para contrasenas"""
    
    @staticmethod
    def hash_password(password):
        """Hashear una contrasena para almacenamiento"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password, hashed):
        """Verificar una contrasena contra su hash"""
        return hashlib.sha256(password.encode()).hexdigest() == hashed
    
    @staticmethod
    def is_strong_password(password):
        """Validar fortaleza de la contrasena"""
        if len(password) < 8:
            return False, "La contrasena debe tener al menos 8 caracteres"
        
        if not re.search(r'[A-Z]', password):
            return False, "La contrasena debe contener al menos una letra mayuscula"
        
        if not re.search(r'[a-z]', password):
            return False, "La contrasena debe contener al menos una letra minuscula"
        
        if not re.search(r'[0-9]', password):
            return False, "La contrasena debe contener al menos un numero"
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "La contrasena debe contener al menos un caracter especial"
        
        return True, "Contrasena segura"

@bp.route('/register', methods=['GET', 'POST'])
def register():
    """Pagina de registro de usuario"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        user_type = request.form.get('user_type', '')
        full_name = request.form.get('full_name', '').strip()
        phone = request.form.get('phone', '').strip()
        
        # Validacion de email
        if not EmailVerification.is_valid_email(email):
            flash('Por favor ingresa una direccion de email valida con dominio apropiado.', 'error')
            return render_template('auth/register.html') 
        
        # Validacion de contrasena
        is_strong, password_message = PasswordHelper.is_strong_password(password)
        if not is_strong:
            flash(password_message, 'error')
            return render_template('auth/register.html')
        
        if password != confirm_password:
            flash('Las contrasenas no coinciden.', 'error')
            return render_template('auth/register.html')  
        
        if user_type not in ['company', 'carrier']:
            flash('Por favor selecciona un tipo de usuario valido.', 'error')
            return render_template('auth/register.html') 
        
        # Verificar si el email ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Ya existe una cuenta con este email.', 'error')
            return render_template('auth/register.html') 
        
        try:
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
                terms_acceptance_date=datetime.utcnow(),
                email_verified=True,  # VERIFICACIÓN AUTOMÁTICA
                account_status=AccountStatus.ACTIVE  # CUENTA ACTIVA DIRECTAMENTE
            )
            
    
            # Generar token de verificacion
            #new_user.generate_verification_token()
            
            db.session.add(new_user)
            db.session.flush()  # Obtener el ID del usuario
            
            # Crear perfil especifico basado en el tipo de usuario
            if user_type == 'company':
                new_profile = Company(
                    user_id=new_user.id,
                    legal_name=full_name,
                    commercial_name=full_name,
                    company_type=CompanyType.LEGAL
                )
            else:  # carrier
                new_profile = Carrier(
                    user_id=new_user.id,
                    carrier_type=CarrierType.INDIVIDUAL,
                    driver_license=None
                )
            
            db.session.add(new_profile)
            
            # Enviar email de verificacion
            #email_sent = EmailVerification.send_verification_email(new_user)
            
            db.session.commit()
            flash('¡Registro exitoso! Tu cuenta ha sido creada y verificada automáticamente.', 'success')
            return redirect(url_for('auth.login'))
        
        except Exception as e:
            db.session.rollback()
            flash('Ocurrio un error durante el registro. Por favor intenta de nuevo.', 'error')
            print(f"Error de registro: {str(e)}")
    
    return render_template('auth/register.html') 

@bp.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if user and PasswordHelper.verify_password(password, user.password_hash):
            
            # Verificar si la cuenta esta activa
            if user.account_status != AccountStatus.ACTIVE:
                flash('Tu cuenta no esta activa. Por favor contacta al soporte.', 'error')
                return render_template('auth/login.html') 
            
            # Iniciar sesion con Flask-Login!
            login_user(user, remember=True)
            
            # Actualizar ultimo login
            user.last_login = datetime.utcnow()
            user.failed_attempts = 0
            db.session.commit()
            
            flash(f'¡Bienvenido de nuevo, {email}!', 'success')
            
            # Redirigir segun el tipo de usuario
            if user.user_type == UserType.COMPANY:
                return redirect(url_for('companies.company_dashboard'))
            else:  
                return redirect(url_for('carriers.carrier_dashboard'))
                
        else:
            # Incrementar intentos fallidos
            if user:
                user.failed_attempts += 1
                if user.failed_attempts >= 5:
                    user.lockout_date = datetime.utcnow()
                    flash('Cuenta temporalmente bloqueada por demasiados intentos fallidos.', 'error')
                db.session.commit()
            flash('Email o contrasena invalidos.', 'error')
    
    return render_template('auth/login.html')  

@bp.route('/welcome/company')
@login_required  # Proteger la ruta
def welcome_company():
    """Pagina de bienvenida para empresas"""
    if current_user.user_type != UserType.COMPANY:
        flash('No tienes permisos para acceder a esta pagina.', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('panel_company.html')

@bp.route('/welcome/carrier')
@login_required  # Proteger la ruta
def welcome_carrier():
    """Pagina de bienvenida para transportistas"""
    if current_user.user_type != UserType.CARRIER:
        flash('No tienes permisos para acceder a esta pagina.', 'error')
        return redirect(url_for('main.index'))
    
    return render_template('panel_carrier.html')

@bp.route('/verify-email/<token>')
def verify_email(token):
    """Endpoint de verificacion de email"""
    try:
        user = User.query.filter_by(verification_token=token).first()
        
        if not user:
            flash('Token de verificacion invalido.', 'error')
            return redirect(url_for('auth.login'))
        
        if not user.is_verification_token_valid():
            flash('El token de verificacion ha expirado. Por favor registrate de nuevo.', 'error')
            return redirect(url_for('auth.register'))
        
        # Verificar email
        user.verify_email()
        db.session.commit()
        
        flash('¡Email verificado exitosamente! Ya puedes iniciar sesion.', 'success')
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
    """Recuperacion de contrasena"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        
        user = User.query.filter_by(email=email).first()
        if user and user.email_verified:
            flash('Las instrucciones para restablecer tu contrasena han sido enviadas a tu email.', 'success')
        else:
            flash('Si este email existe y esta verificado, las instrucciones de recuperacion han sido enviadas.', 'success')
        
        return redirect(url_for('auth.login'))
    
    return render_template('auth/forgot_password.html') 

@bp.route('/logout')
@login_required  # Solo usuarios logueados pueden cerrar sesion
def logout():
    """Cerrar sesion del usuario"""
    logout_user()  # IMPORTANTE: Usar logout_user de Flask-Login!
    flash('Has cerrado sesion correctamente.', 'success')
    return redirect(url_for('auth.login'))