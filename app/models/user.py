from app import db
from datetime import datetime, timedelta
import enum
from flask_login import UserMixin 
import secrets

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
    country = db.Column(db.String(100), default='Colombia')
    
    # Foto de perfil - 
    profile_picture_id = db.Column(db.Integer, db.ForeignKey('media.id'), nullable=True)
    
    # Validación y verificación
    identity_document = db.Column(db.String(50), unique=True, nullable=True) 
    document_type = db.Column(db.Enum(DocumentType))
    document_verified = db.Column(db.Boolean, default=False)
    verification_date = db.Column(db.DateTime)
    
    # Email verification
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True)
    verification_token_expires = db.Column(db.DateTime)
    
    # Account status
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    account_status = db.Column(db.Enum(AccountStatus), default=AccountStatus.PENDING_VERIFICATION)
    verification_level = db.Column(db.Enum(VerificationLevel), default=VerificationLevel.BASIC)
    
    # Security
    last_login = db.Column(db.DateTime)
    failed_attempts = db.Column(db.Integer, default=0)
    lockout_date = db.Column(db.DateTime)
    reset_token = db.Column(db.String(100), unique=True)  
    reset_token_expires = db.Column(db.DateTime)
    
    # Terms and conditions
    accepted_terms = db.Column(db.Boolean, default=False)
    terms_acceptance_date = db.Column(db.DateTime)
    notifications_active = db.Column(db.Boolean, default=True)
    marketing_emails = db.Column(db.Boolean, default=False)  
    
    # Relationships
    company = db.relationship('Company', backref='user', uselist=False, cascade='all, delete-orphan')
    carrier = db.relationship('Carrier', backref='user', uselist=False, cascade='all, delete-orphan')
    profile_picture = db.relationship('Media', foreign_keys=[profile_picture_id]) 
    
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
    
    def generate_password_reset_token(self):
        """Generate password reset token"""
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        return self.reset_token
    
    def is_verification_token_valid(self):
        """Check if verification token is valid"""
        if not self.verification_token or not self.verification_token_expires:
            return False
        return datetime.utcnow() < self.verification_token_expires
    
    def is_reset_token_valid(self):
        """Check if reset token is valid"""
        if not self.reset_token or not self.reset_token_expires:
            return False
        return datetime.utcnow() < self.reset_token_expires
    
    def verify_email(self):
        """Mark email as verified"""
        self.email_verified = True
        self.account_status = AccountStatus.ACTIVE
        self.verification_date = datetime.utcnow()
        self.verification_token = None
        self.verification_token_expires = None
    
    def get_profile_picture_url(self):
        """Obtener URL de la foto de perfil"""
        if self.profile_picture:
            return self.profile_picture.file_path
        if self.user_type == UserType.COMPANY:
            return "/static/images/default-company.png"
        else:
            return "/static/images/default-carrier.png"
    
    def __repr__(self):
        return f'<User {self.email} - {self.user_type.value}>'