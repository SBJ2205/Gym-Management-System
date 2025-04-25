from app import db, app  # Ensure `app` is imported

print("🚀 Starting database creation...")

# Ensure we run inside the Flask application context
with app.app_context():
    db.create_all()
    print("✅ Database tables created successfully!")
