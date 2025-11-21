from app import db
from datetime import datetime, timedelta
import enum
from flask_login import UserMixin 
import secrets
from werkzeug.security import generate_password_hash, check_password_hash

class UserType(enum.Enum):
    COMPANY = 'company'
    CARRIER = 'carrier'

class DocumentType(enum.Enum):
    CC = 'cc'
    NIT = 'nit'
    RUC = 'ruc'
    CE = 'ce'
    PASSPORT = 'passport'  

class AccountStatus(enum.Enum):
    PENDING_VERIFICATION = 'pending_verification'
    ACTIVE = 'active'
    SUSPENDED = 'suspended'
    INACTIVE = 'inactive'

class VerificationLevel(enum.Enum):
    BASIC = 'basic'
    VERIFIED = 'verified'
    PREMIUM = 'premium'

class User(db.Model, UserMixin): 
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)  
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False, index=True)  
    
    # Información de contacto
    phone = db.Column(db.String(20), nullable=False)
    alternative_phone = db.Column(db.String(20))
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    country = db.Column(db.String(100))
    
    # Foto de perfil
    profile_picture = db.Column(db.String(255))
    
    # Validación y verificación
    identity_document = db.Column(db.String(50))
    document_type = db.Column(db.Enum(DocumentType))
    document_verified = db.Column(db.Boolean, default=False)
    verification_date = db.Column(db.DateTime)
    
    # Email verification
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100))
    verification_token_expires = db.Column(db.DateTime)
    
    # Account status
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    account_status = db.Column(db.Enum(AccountStatus))
    verification_level = db.Column(db.Enum(VerificationLevel))
    
    # Security
    last_login = db.Column(db.DateTime)
    failed_attempts = db.Column(db.Integer, default=0)
    lockout_date = db.Column(db.DateTime)
    
    # Terms and conditions
    accepted_terms = db.Column(db.Boolean, default=False)
    terms_acceptance_date = db.Column(db.DateTime)
    notifications_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    company = db.relationship('Company', backref='user', uselist=False, cascade='all, delete-orphan')
    carrier = db.relationship('Carrier', backref='user', uselist=False, cascade='all, delete-orphan')
    
    # Métodos para manejo de contraseñas
    def set_password(self, password):
        """Establece la contraseña hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica la contraseña"""
        return check_password_hash(self.password_hash, password)
    
    @property
    def is_active(self):
        return self.account_status == AccountStatus.ACTIVE
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False
    
    def get_id(self):
        return str(self.id)
    
    def generate_verification_token(self):
        """Generate unique verification token"""
        self.verification_token = secrets.token_urlsafe(32)
        self.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
        return self.verification_token
    
    def is_verification_token_valid(self):
        """Check if verification token is valid"""
        if not self.verification_token or not self.verification_token_expires:
            return False
        return datetime.utcnow() < self.verification_token_expires
    
    def verify_email(self):
        """Mark email as verified"""
        self.email_verified = True
        if not self.account_status:
            self.account_status = AccountStatus.ACTIVE
        self.verification_date = datetime.utcnow()
        self.verification_token = None
        self.verification_token_expires = None
    
    def get_profile_picture_url(self):
        """Obtener URL de la foto de perfil"""
        if self.profile_picture:
            return self.profile_picture
        if self.user_type == UserType.COMPANY:
            return "/static/images/default-company.png"
        else:
            return "/static/images/default-carrier.png"
    
    def __repr__(self):
        return f'<User {self.email} - {self.user_type.value}>'