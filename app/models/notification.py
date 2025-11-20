from app import db
from datetime import datetime
import enum

class NotificationType(enum.Enum):
    NEW_QUOTE = 'new_quote'
    QUOTE_ACCEPTED = 'quote_accepted'
    QUOTE_REJECTED = 'quote_rejected'
    SHIPMENT_UPDATE = 'shipment_update'
    PAYMENT_RECEIVED = 'payment_received'
    NEW_MESSAGE = 'new_message'
    SYSTEM = 'system'

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Contenido
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.Enum(NotificationType))
    
    # Estado y enlaces
    is_read = db.Column(db.Boolean, default=False)
    related_entity_type = db.Column(db.String(50))  # 'shipment', 'quote', 'payment'
    related_entity_id = db.Column(db.Integer)
    
    # Tiempos
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    read_date = db.Column(db.DateTime)
    
    # Relación
    user = db.relationship('User', backref='notifications')
    
    @property
    def is_recent(self):
        return (datetime.utcnow() - self.created_date).total_seconds() < 3600  # 1 hora
    
    def __repr__(self):
        return f'<Notification {self.title} - {self.notification_type.value}>'