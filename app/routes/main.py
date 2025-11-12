from flask import Blueprint, jsonify, render_template, request, flash, redirect, url_for
from app import db
from app.models.user import User
from app.models.company import Company
from app.models.carrier import Carrier

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/test-db')
def test_db():
    """Test database connection"""
    try:
        user_count = User.query.count()
        return jsonify({
            'status': 'success',
            'message': 'Database connection successful',
            'registered_users': user_count,
            'database': 'ConnectCargo - PostgreSQL'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Connection error: {str(e)}'
        }), 500