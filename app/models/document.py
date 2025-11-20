from app import db
from datetime import datetime
import enum

class DocumentType(enum.Enum):
    USER_ID = 'user_id'
    DRIVER_LICENSE = 'driver_license'
    COMPANY_LEGAL = 'company_legal'
    VEHICLE_REGISTRATION = 'vehicle_registration'
    INSURANCE = 'insurance'
    TAX_DOCUMENT = 'tax_document'

class DocumentStatus(enum.Enum):
    PENDING = 'pending'
    UNDER_REVIEW = 'under_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'

class Document(db.Model):
    __tablename__ = 'documents'
    
    id = db.Column(db.Integer, primary_key=True)
    document_type = db.Column(db.Enum(DocumentType), nullable=False)
    entity_type = db.Column(db.String(20), nullable=False)  # 'user', 'company', 'carrier', 'vehicle'
    entity_id = db.Column(db.Integer, nullable=False)  # ID del dueño
    
    # Archivo
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    
    # Validación
    status = db.Column(db.Enum(DocumentStatus), default=DocumentStatus.PENDING)
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    verified_at = db.Column(db.DateTime)
    rejection_reason = db.Column(db.Text)
    
    # Metadata
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    expiry_date = db.Column(db.Date)  # Para licencias, seguros, etc.
    
    # Relaciones
    verifier = db.relationship('User', foreign_keys=[verified_by])
    
    def __repr__(self):
        return f'<Document {self.document_type.value} - {self.entity_type}>'