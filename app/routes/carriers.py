from flask import Blueprint

bp = Blueprint('carriers', __name__)

@bp.route('/')
def carrier_dashboard():
    return "Carrier Dashboard - Coming Soon"

@bp.route('/profile')
def carrier_profile():
    return "Carrier Profile - Coming Soon"