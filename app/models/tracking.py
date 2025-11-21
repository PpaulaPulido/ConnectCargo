from app import db
from datetime import datetime
import enum

class TrackingEventType(enum.Enum):
    PICKUP = 'pickup'
    DEPARTURE = 'departure'
    IN_TRANSIT = 'in_transit'
    DELAYED = 'delayed'
    ARRIVED = 'arrived'
    DELIVERED = 'delivered'
    CUSTOM = 'custom'

class TrackingEvent(db.Model):
    __tablename__ = 'tracking_events'
    
    id = db.Column(db.Integer, primary_key=True)
    shipment_id = db.Column(db.Integer, db.ForeignKey('shipments.id'), nullable=False)
    
    # Información del evento
    event_type = db.Column(db.Enum(TrackingEventType), nullable=False)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Coordenadas GPS
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    
    # Metadata adicional
    estimated_remaining_time = db.Column(db.Integer)  
    notes = db.Column(db.Text)
    
    shipment_rel = db.relationship('Shipment', back_populates='tracking_events_rel')
    
    def __repr__(self):
        return f'<TrackingEvent {self.event_type.value} - {self.timestamp}>'