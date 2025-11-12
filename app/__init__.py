from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Register blueprints (routes)
    from app.routes.main import bp as main_bp
    app.register_blueprint(main_bp)
    
    # Import models for Flask-Migrate to detect
    from app.models import user, company, carrier
    
    return app