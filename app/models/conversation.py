from app import db
from datetime import datetime

class Conversation(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    # Participantes
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Contexto
    shipment_id = db.Column(db.Integer, db.ForeignKey('shipments.id'))
    
    # Metadata
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_message_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relaciones
    user1 = db.relationship('User', foreign_keys=[user1_id], backref='conversations_as_user1')
    user2 = db.relationship('User', foreign_keys=[user2_id], backref='conversations_as_user2')
    shipment = db.relationship('Shipment', backref='conversation')
    messages = db.relationship('Message', backref='conversation', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Conversation {self.user1_id}-{self.user2_id}>'

