from app import db
from datetime import datetime
import enum

class UserType(enum.Enum):
    COMPANY = 'company'
    CARRIER = 'carrier'

class DocumentType(enum.Enum):
    CC = 'cc'
    NIT = 'nit'
    RUC = 'ruc'
    CE = 'ce'

class AccountStatus(enum.Enum):
    ACTIVE = 'active'
    PENDING_VERIFICATION = 'pending_verification'
    SUSPENDED = 'suspended'
    INACTIVE = 'inactive'

class VerificationLevel(enum.Enum):
    BASIC = 'basic'
    VERIFIED = 'verified'
    PREMIUM = 'premium'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum(UserType), nullable=False)
    
    # Contact information
    phone = db.Column(db.String(20), nullable=False)
    alternative_phone = db.Column(db.String(20))
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100))
    country = db.Column(db.String(100), default='Colombia')
    
    # Validation and verification
    identity_document = db.Column(db.String(50), unique=True)
    document_type = db.Column(db.Enum(DocumentType))
    document_verified = db.Column(db.Boolean, default=False)
    verification_date = db.Column(db.DateTime)
    
    # Account status
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    account_status = db.Column(db.Enum(AccountStatus), default=AccountStatus.PENDING_VERIFICATION)
    verification_level = db.Column(db.Enum(VerificationLevel), default=VerificationLevel.BASIC)
    
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
    
    def __repr__(self):
        return f'<User {self.email} - {self.user_type.value}>'