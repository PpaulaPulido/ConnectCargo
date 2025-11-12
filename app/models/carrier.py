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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # Professional information
    carrier_type = db.Column(db.Enum(CarrierType), nullable=False)
    driver_license = db.Column(db.String(50), unique=True)
    license_category = db.Column(db.String(10))
    license_expiry_date = db.Column(db.Date)
    
    # Insurance and documentation
    active_insurance = db.Column(db.Boolean, default=False)
    insurance_policy = db.Column(db.String(100))
    insurance_expiry_date = db.Column(db.Date)
    
    # Experience and capacity
    years_experience = db.Column(db.Integer, default=0)
    max_capacity_kg = db.Column(db.Float)
    available_vehicle_types = db.Column(db.Text)  
    
    # History and reputation
    carrier_registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    completed_trips = db.Column(db.Integer, default=0)
    average_rating = db.Column(db.Float, default=0.0)
    successful_delivery_rate = db.Column(db.Float, default=0.0)
    
    # Document verification
    document_status = db.Column(db.Enum(DocumentStatus), default=DocumentStatus.PENDING)
    complete_documents = db.Column(db.Boolean, default=False)
    background_check_verified = db.Column(db.Boolean, default=False)
    reliability_seal = db.Column(db.Boolean, default=False)
    
    # Specializations
    cargo_specializations = db.Column(db.Text)  
    usual_routes = db.Column(db.Text) 
    availability_24_7 = db.Column(db.Boolean, default=False)
    
    # Additional information
    client_reference_1 = db.Column(db.String(200))
    client_reference_2 = db.Column(db.String(200))
    additional_notes = db.Column(db.Text)
    
    def get_vehicle_types(self):
        if self.available_vehicle_types:
            return json.loads(self.available_vehicle_types)
        return []
    
    def set_vehicle_types(self, types_list):
        self.available_vehicle_types = json.dumps(types_list)
    
    def __repr__(self):
        return f'<Carrier {self.user.email}>'