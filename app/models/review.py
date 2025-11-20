from app import db
from datetime import datetime
import enum

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    shipment_id = db.Column(db.Integer, db.ForeignKey('shipments.id'), nullable=False, unique=True)
    
    # Quién califica a quién
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Quien califica
    reviewed_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Quien recibe la calificación
    
    # Calificación
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    
    # Categorías de calificación
    punctuality_rating = db.Column(db.Integer)  # 1-5
    communication_rating = db.Column(db.Integer)  # 1-5
    condition_rating = db.Column(db.Integer)  # 1-5 (estado de la carga)
    
    # Metadatos
    review_date = db.Column(db.DateTime, default=datetime.utcnow)
    would_recommend = db.Column(db.Boolean, default=True)
    is_public = db.Column(db.Boolean, default=True)
    
    # Relaciones
    reviewer = db.relationship('User', foreign_keys=[reviewer_id], backref='given_reviews')
    reviewed = db.relationship('User', foreign_keys=[reviewed_id], backref='received_reviews')
    shipment = db.relationship('Shipment', backref='review')
    
    @property
    def average_rating(self):
        ratings = [r for r in [self.punctuality_rating, self.communication_rating, self.condition_rating] if r is not None]
        if ratings:
            return sum(ratings) / len(ratings)
        return self.rating
    
    def __repr__(self):
        return f'<Review {self.rating}/5 - {self.review_date}>'