from app import create_app, db
from app.models.user import User
from app.models.company import Company
from app.models.carrier import Carrier

app = create_app()

# Crear tablas automáticamente al iniciar
with app.app_context():
    try:
        db.create_all()
        print("✅ Tablas verificadas/creadas exitosamente")
    except Exception as e:
        print(f"⚠️  Error creando tablas: {e}")

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)