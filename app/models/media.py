from app import db
from datetime import datetime
import enum

class MediaType(enum.Enum):
    PROFILE = 'profile'
    VEHICLE = 'vehicle'
    SHIPMENT = 'shipment'
    DOCUMENT = 'document'
    COMPANY = 'company'
    GENERAL = 'general'

class Media(db.Model):
    __tablename__ = 'media'
    
    id = db.Column(db.Integer, primary_key=True)
    media_type = db.Column(db.Enum(MediaType), nullable=False)
    entity_type = db.Column(db.String(20), nullable=False)  # 'user', 'vehicle', 'shipment', etc.
    entity_id = db.Column(db.Integer, nullable=False)
    
    # Archivo
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    
    # Descripción
    caption = db.Column(db.String(300))
    is_primary = db.Column(db.Boolean, default=False)
    
    # Metadata
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relaciones
    uploader = db.relationship('User', foreign_keys=[uploaded_by])
    
    def __repr__(self):
        return f'<Media {self.file_name} - {self.media_type.value}>'