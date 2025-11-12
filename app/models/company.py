from app import db
from datetime import datetime
import enum
import json

class CompanyType(enum.Enum):
    NATURAL = 'NATURAL'
    LEGAL = 'LEGAL'

class CompanySize(enum.Enum):
    MICRO = 'MICRO'
    SMALL = 'SMALL'
    MEDIUM = 'MEDIUM'
    LARGE = 'LARGE'

class AnnualRevenue(enum.Enum):
    LESS_100K = 'LESS_100K'
    K100_500K = 'K100_500K'
    K500_1M = 'K500_1M'
    K1M_5M = 'K1M_5M'
    MORE_5M = 'MORE_5M'

class ShippingFrequency(enum.Enum):
    OCCASIONAL = 'OCCASIONAL'
    WEEKLY = 'WEEKLY'
    BIWEEKLY = 'BIWEEKLY'
    MONTHLY = 'MONTHLY'
    DAILY = 'DAILY'

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Información legal
    legal_name = db.Column(db.String(200), nullable=False)
    commercial_name = db.Column(db.String(200))
    incorporation_date = db.Column(db.Date)
    company_type = db.Column(db.Enum(CompanyType), nullable=False)
    
    # Datos financieros y comerciales
    company_size = db.Column(db.Enum(CompanySize))
    annual_revenue = db.Column(db.Enum(AnnualRevenue))
    direct_employees = db.Column(db.Integer)
    
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
    
    # Verificación empresarial
    legal_documentation_complete = db.Column(db.Boolean, default=False)
    financial_verification = db.Column(db.Boolean, default=False)
    trust_seal = db.Column(db.Boolean, default=False)
    
    # Logística
    usual_cargo_types = db.Column(db.Text)  # JSON
    shipping_frequency = db.Column(db.Enum(ShippingFrequency))
    coverage_zones = db.Column(db.Text)  # JSON con ciudades/departamentos
    
    def get_certifications(self):
        if self.certifications:
            return json.loads(self.certifications)
        return []
    
    def set_certifications(self, certifications_list):
        self.certifications = json.dumps(certifications_list)
    
    def __repr__(self):
        return f'<Company {self.commercial_name or self.legal_name}>'