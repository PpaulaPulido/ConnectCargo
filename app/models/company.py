from app import db
from datetime import datetime
import enum
import json

class CompanyType(enum.Enum):
    NATURAL = 'natural' 
    LEGAL = 'legal'

class CompanySize(enum.Enum):
    MICRO = 'micro'
    SMALL = 'small'
    MEDIUM = 'medium'
    LARGE = 'large'

class AnnualRevenue(enum.Enum):
    LESS_100K = 'less_100k'
    K100_500K = 'k100_500k'
    K500_1M = 'k500_1m'
    K1M_5M = 'k1m_5m'
    MORE_5M = 'more_5m'

class ShippingFrequency(enum.Enum):
    OCCASIONAL = 'occasional'
    WEEKLY = 'weekly'
    BIWEEKLY = 'biweekly'
    MONTHLY = 'monthly'
    DAILY = 'daily'

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True, index=True)  
    
    # Información legal
    legal_name = db.Column(db.String(200), nullable=False)
    commercial_name = db.Column(db.String(200))
    trade_name = db.Column(db.String(200))  
    incorporation_date = db.Column(db.Date)
    company_type = db.Column(db.Enum(CompanyType), nullable=False)
    
    # Datos financieros y comerciales
    company_size = db.Column(db.Enum(CompanySize))
    annual_revenue = db.Column(db.Enum(AnnualRevenue))
    direct_employees = db.Column(db.Integer)
    website = db.Column(db.String(200)) 
    
    # Referencias comerciales
    bank_reference = db.Column(db.String(100))
    commercial_reference_1 = db.Column(db.String(200))
    commercial_reference_2 = db.Column(db.String(200))
    commercial_reference_3 = db.Column(db.String(200))
    
    # Certificaciones
    has_environmental_license = db.Column(db.Boolean, default=False)
    certifications = db.Column(db.Text)  # Almacenar como JSON
    special_permits = db.Column(db.Text)  # Almacenar como JSON
    
    # Historial en plataforma
    company_registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    completed_shipments = db.Column(db.Integer, default=0)
    average_rating = db.Column(db.Float, default=0.0)
    completion_rate = db.Column(db.Float, default=0.0)
    total_spent = db.Column(db.Numeric(12, 2), default=0.0)  
    
    # Verificación empresarial
    legal_documentation_complete = db.Column(db.Boolean, default=False)
    financial_verification = db.Column(db.Boolean, default=False)
    trust_seal = db.Column(db.Boolean, default=False)
    verification_date = db.Column(db.DateTime)
    
    # Logística
    usual_cargo_types = db.Column(db.Text)  # JSON
    shipping_frequency = db.Column(db.Enum(ShippingFrequency))
    coverage_zones = db.Column(db.Text)  # JSON con ciudades/departamentos
    preferred_vehicle_types = db.Column(db.Text) 
    
    # Métodos auxiliares
    def get_certifications(self):
        if self.certifications:
            return json.loads(self.certifications)
        return []
    
    def set_certifications(self, certifications_list):
        self.certifications = json.dumps(certifications_list)
    
    def get_coverage_zones(self):
        if self.coverage_zones:
            return json.loads(self.coverage_zones)
        return []
    
    def set_coverage_zones(self, zones_list):
        self.coverage_zones = json.dumps(zones_list)
    
    def get_preferred_vehicle_types(self):
        if self.preferred_vehicle_types:
            return json.loads(self.preferred_vehicle_types)
        return []
    
    def set_preferred_vehicle_types(self, types_list):
        self.preferred_vehicle_types = json.dumps(types_list)
    
    @property
    def display_name(self):
        """Nombre para mostrar"""
        return self.commercial_name or self.legal_name
    
    def __repr__(self):
        return f'<Company {self.display_name}>'