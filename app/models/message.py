from app import db
from datetime import datetime

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Contenido
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # 'text', 'file', 'system'
    
    # Estado
    is_read = db.Column(db.Boolean, default=False)
    read_date = db.Column(db.DateTime)
    
    # Metadata
    sent_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    sender = db.relationship('User', backref='messages')
    
    def __repr__(self):
        return f'<Message {self.sender_id} - {self.sent_date}>'