from app import db
from datetime import datetime
import enum

class QuoteStatus(enum.Enum):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    REJECTED = 'rejected'
    WITHDRAWN = 'withdrawn'
    EXPIRED = 'expired'

class Quote(db.Model):
    __tablename__ = 'quotes'
    
    id = db.Column(db.Integer, primary_key=True)
    shipment_id = db.Column(db.Integer, db.ForeignKey('shipments.id'), nullable=False)
    carrier_id = db.Column(db.Integer, db.ForeignKey('carriers.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'))  # Vehículo específico
    
    # Oferta económica
    bid_amount = db.Column(db.Numeric(10, 2), nullable=False)
    counter_offer = db.Column(db.Numeric(10, 2))  # Contraoferta de la empresa
    
    # Información de la oferta
    proposed_pickup_date = db.Column(db.DateTime)
    estimated_delivery_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    terms_conditions = db.Column(db.Text)
    
    # Estado y tiempos
    status = db.Column(db.Enum(QuoteStatus), default=QuoteStatus.PENDING)
    bid_date = db.Column(db.DateTime, default=datetime.utcnow)
    response_date = db.Column(db.DateTime)
    expiry_date = db.Column(db.DateTime)  # Fecha de expiración de la oferta
    
    # Relaciones
    carrier = db.relationship('Carrier', backref='quotes')
    vehicle = db.relationship('Vehicle', backref='quotes')
    
    @property
    def is_expired(self):
        if self.expiry_date:
            return datetime.utcnow() > self.expiry_date
        return False
    
    @property
    def is_negotiable(self):
        return self.status == QuoteStatus.PENDING and not self.is_expired
    
    def __repr__(self):
        return f'<Quote {self.bid_amount} - {self.status.value}>'