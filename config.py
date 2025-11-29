import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-connectcargo-mas-segura'
    
    # CONEXIÓN PARA RENDER - IMPORTANTE
    # Render usa DATABASE_URL con formato postgresql://
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        # Render usa postgresql:// pero necesitamos postgresql+psycopg2:// para SQLAlchemy
        if database_url.startswith('postgresql://'):
            SQLALCHEMY_DATABASE_URI = database_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
        else:
            SQLALCHEMY_DATABASE_URI = database_url
    else:
        # Base de datos local para desarrollo
        SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://postgres:12345@localhost:5432/ConnectCargo'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False  # Cambiar a False en producción
    
    # Configuración de sesión
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    SESSION_COOKIE_SECURE = True  # True en producción con HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Email configuration (opcional si no usas verificación)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_USERNAME')
    
    # File upload configuration
    UPLOAD_FOLDER = 'app/static/uploads/profiles'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}