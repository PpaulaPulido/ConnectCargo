from app import db
from datetime import datetime
import enum
import json

class CarrierType(enum.Enum):
    INDIVIDUAL = 'individual' 
    COMPANY = 'company'

class DocumentStatus(enum.Enum):
    PENDING = 'pending'
    UNDER_REVIEW = 'under_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'

class Carrier(db.Model):
    __tablename__ = 'carriers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)  
    
    # Información profesional
    carrier_type = db.Column(db.Enum(CarrierType), nullable=False)
    driver_license = db.Column(db.String(50), unique=True)
    license_category = db.Column(db.String(10))
    license_expiry_date = db.Column(db.Date)
    license_issuing_authority = db.Column(db.String(100))  
    
    # Seguros y documentación
    active_insurance = db.Column(db.Boolean, default=False)
    insurance_policy = db.Column(db.String(100))
    insurance_expiry_date = db.Column(db.Date)
    insurance_company = db.Column(db.String(100))  
    
    # Experiencia y capacidad
    years_experience = db.Column(db.Integer, default=0)
    max_capacity_kg = db.Column(db.Float)
    available_vehicle_types = db.Column(db.Text)  # JSON
    vehicle_count = db.Column(db.Integer, default=1) 
    
    # Historial y reputación
    carrier_registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    completed_trips = db.Column(db.Integer, default=0)
    average_rating = db.Column(db.Float, default=0.0)
    successful_delivery_rate = db.Column(db.Float, default=0.0)
    total_earnings = db.Column(db.Numeric(12, 2), default=0.0) 
    
    # Verificación de documentos
    document_status = db.Column(db.Enum(DocumentStatus), default=DocumentStatus.PENDING)
    documents_complete = db.Column(db.Boolean, default=False)
    background_check_verified = db.Column(db.Boolean, default=False)
    reliability_seal = db.Column(db.Boolean, default=False)
    verification_date = db.Column(db.DateTime)  
    
    # Especializaciones
    cargo_specializations = db.Column(db.Text)  # JSON
    usual_routes = db.Column(db.Text)  # JSON
    availability_24_7 = db.Column(db.Boolean, default=False)
    has_refrigerated_equipment = db.Column(db.Boolean, default=False)  
    has_dangerous_goods_cert = db.Column(db.Boolean, default=False)  
    
    # Información adicional
    client_reference_1 = db.Column(db.String(200))
    client_reference_2 = db.Column(db.String(200))
    additional_notes = db.Column(db.Text)
    
    # Métodos auxiliares
    def get_vehicle_types(self):
        if self.available_vehicle_types:
            return json.loads(self.available_vehicle_types)
        return []
    
    def set_vehicle_types(self, types_list):
        self.available_vehicle_types = json.dumps(types_list)
    
    def get_cargo_specializations(self):
        if self.cargo_specializations:
            return json.loads(self.cargo_specializations)
        return []
    
    def set_cargo_specializations(self, specializations_list):
        self.cargo_specializations = json.dumps(specializations_list)
    
    def get_usual_routes(self):
        if self.usual_routes:
            return json.loads(self.usual_routes)
        return []
    
    def set_usual_routes(self, routes_list):
        self.usual_routes = json.dumps(routes_list)
    
    @property
    def is_license_valid(self):
        """Verificar si la licencia está vigente"""
        if not self.license_expiry_date:
            return False
        return self.license_expiry_date >= datetime.utcnow().date()
    
    @property
    def is_insurance_valid(self):
        """Verificar si el seguro está vigente"""
        if not self.insurance_expiry_date:
            return False
        return self.insurance_expiry_date >= datetime.utcnow().date()
    
    def __repr__(self):
        return f'<Carrier {self.user.email}>'