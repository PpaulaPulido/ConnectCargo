from app import db
from datetime import datetime
import enum

class ShipmentStatus(enum.Enum):
    PUBLISHED = 'published'
    PENDING_QUOTES = 'pending_quotes'
    ASSIGNED = 'assigned'
    IN_TRANSIT = 'in_transit'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'
    DISPUTED = 'disputed'

class CargoType(enum.Enum):
    GENERAL_MERCHANDISE = 'general_merchandise'
    FOOD = 'food'
    CONSTRUCTION_MATERIALS = 'construction_materials'
    ELECTRONICS = 'electronics'
    FURNITURE = 'furniture'
    CHEMICALS = 'chemicals'
    REFRIGERATED = 'refrigerated'
    DANGEROUS_GOODS = 'dangerous_goods'

class Shipment(db.Model):
    __tablename__ = 'shipments'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    carrier_id = db.Column(db.Integer, db.ForeignKey('carriers.id'))  # Asignado después
    
    # Información básica
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    cargo_type = db.Column(db.Enum(CargoType), nullable=False)
    
    # Origen y destino
    origin_address = db.Column(db.String(300), nullable=False)
    origin_city = db.Column(db.String(100), nullable=False)
    origin_lat = db.Column(db.Float)  # Latitud
    origin_lng = db.Column(db.Float)  # Longitud
    
    destination_address = db.Column(db.String(300), nullable=False)
    destination_city = db.Column(db.String(100), nullable=False)
    destination_lat = db.Column(db.Float)
    destination_lng = db.Column(db.Float)
    
    # Especificaciones de carga
    weight_kg = db.Column(db.Float, nullable=False)
    volume_m3 = db.Column(db.Float)
    dimensions = db.Column(db.String(100))  # "Largo x Ancho x Alto"
    special_requirements = db.Column(db.Text)  # Requerimientos especiales
    
    # Fechas y tiempos
    pickup_date = db.Column(db.DateTime, nullable=False)
    delivery_deadline = db.Column(db.DateTime, nullable=False)
    published_date = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_date = db.Column(db.DateTime)
    delivered_date = db.Column(db.DateTime)
    
    # Información financiera
    offered_price = db.Column(db.Numeric(10, 2), nullable=False)
    final_price = db.Column(db.Numeric(10, 2))
    commission_percentage = db.Column(db.Numeric(5, 2), default=10.0)
    commission_amount = db.Column(db.Numeric(10, 2))
    
    # Estado y seguimiento
    status = db.Column(db.Enum(ShipmentStatus), default=ShipmentStatus.PUBLISHED)
    current_location = db.Column(db.String(200))
    last_update = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    company = db.relationship('Company', backref='shipments')
    carrier = db.relationship('Carrier', backref='shipments')
    quotes = db.relationship('Quote', backref='shipment', cascade='all, delete-orphan')
    tracking_events_rel = db.relationship(
        'TrackingEvent', 
        back_populates='shipment_rel',
        foreign_keys='TrackingEvent.shipment_id',
        lazy='dynamic'
    )
    
    @property
    def is_active(self):
        return self.status in [ShipmentStatus.PUBLISHED, ShipmentStatus.PENDING_QUOTES, ShipmentStatus.ASSIGNED, ShipmentStatus.IN_TRANSIT]
    
    @property
    def distance_km(self):
        # Calcular distancia aproximada (implementar lógica real después)
        if self.origin_lat and self.destination_lat:
            # Placeholder para cálculo de distancia
            return 150  # km aproximados
        return None
    
    def __repr__(self):
        return f'<Shipment {self.title} - {self.status.value}>'