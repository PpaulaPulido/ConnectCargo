from flask import Blueprint

bp = Blueprint('companies', __name__)

@bp.route('/')
def company_dashboard():
    return "Company Dashboard - Coming Soon"

@bp.route('/profile')
def company_profile():
    return "Company Profile - Coming Soon"