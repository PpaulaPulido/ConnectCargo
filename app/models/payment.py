from app import db
from datetime import datetime
import enum

class PaymentStatus(enum.Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'
    REFUNDED = 'refunded'
    CANCELLED = 'cancelled'

class PaymentMethod(enum.Enum):
    CREDIT_CARD = 'credit_card'
    DEBIT_CARD = 'debit_card'
    BANK_TRANSFER = 'bank_transfer'
    PLATFORM_BALANCE = 'platform_balance'

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    shipment_id = db.Column(db.Integer, db.ForeignKey('shipments.id'), nullable=False, unique=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    carrier_id = db.Column(db.Integer, db.ForeignKey('carriers.id'), nullable=False)
    
    # Información del pago
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    commission_amount = db.Column(db.Numeric(10, 2), nullable=False)
    carrier_payment = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Información de transacción
    payment_method = db.Column(db.Enum(PaymentMethod))
    transaction_id = db.Column(db.String(100), unique=True)
    payment_date = db.Column(db.DateTime)
    
    # Estado
    status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.PENDING)
    failed_reason = db.Column(db.Text)
    
    # Metadata
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    processed_date = db.Column(db.DateTime)
    
    # Relaciones
    shipment = db.relationship('Shipment', backref='payment')
    company = db.relationship('Company', backref='payments')
    carrier = db.relationship('Carrier', backref='payments_received')
    
    @property
    def is_refundable(self):
        return self.status == PaymentStatus.COMPLETED
    
    def __repr__(self):
        return f'<Payment {self.amount} - {self.status.value}>'