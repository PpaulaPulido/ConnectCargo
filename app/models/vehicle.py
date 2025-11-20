from app import db
from datetime import datetime
import enum
import json

class VehicleType(enum.Enum):
    TRUCK = 'truck'
    VAN = 'van'
    PICKUP = 'pickup'
    TRAILER = 'trailer'
    REFRIGERATED = 'refrigerated'
    TANKER = 'tanker'

class VehicleStatus(enum.Enum):
    AVAILABLE = 'available'
    IN_MAINTENANCE = 'in_maintenance'
    IN_TRANSIT = 'in_transit'
    UNAVAILABLE = 'unavailable'

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    carrier_id = db.Column(db.Integer, db.ForeignKey('carriers.id'), nullable=False)
    
    # Información básica
    license_plate = db.Column(db.String(20), unique=True, nullable=False)
    vehicle_type = db.Column(db.Enum(VehicleType), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    color = db.Column(db.String(30))
    
    # Capacidades
    max_weight_kg = db.Column(db.Float, nullable=False)
    capacity_m3 = db.Column(db.Float, nullable=False)
    dimensions = db.Column(db.String(100))  # "Largo x Ancho x Alto"
    
    # Especificaciones
    has_refrigeration = db.Column(db.Boolean, default=False)
    has_hydraulic_tailgate = db.Column(db.Boolean, default=False)
    special_features = db.Column(db.Text)  # JSON
    
    # Documentación
    soat_expiry = db.Column(db.Date)
    technomechanical_expiry = db.Column(db.Date)
    insurance_expiry = db.Column(db.Date)
    
    # Estado
    status = db.Column(db.Enum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    current_location = db.Column(db.String(200))
    is_active = db.Column(db.Boolean, default=True)
    
    # Metadata
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_maintenance_date = db.Column(db.Date)
    
    # Relaciones
    carrier = db.relationship('Carrier', backref='vehicles')
    
    # Métodos
    def get_special_features(self):
        if self.special_features:
            return json.loads(self.special_features)
        return []
    
    def set_special_features(self, features_list):
        self.special_features = json.dumps(features_list)
    
    @property
    def is_soat_valid(self):
        return self.soat_expiry and self.soat_expiry >= datetime.utcnow().date()
    
    @property
    def is_technomechanical_valid(self):
        return self.technomechanical_expiry and self.technomechanical_expiry >= datetime.utcnow().date()
    
    def __repr__(self):
        return f'<Vehicle {self.license_plate} - {self.brand} {self.model}>'