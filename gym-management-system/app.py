from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from extensions import db, migrate  # ✅ Import db & migrate from extensions

def create_app():
    app = Flask(__name__)

    # ✅ Load configurations from config.py (including SECRET_KEY)
    app.config.from_object(Config)

    # ✅ Initialize database and migrations
    db.init_app(app)
    migrate.init_app(app, db)

    # ✅ Enable CORS
    CORS(app)

    # ✅ Register Blueprints
    from routes.admin_routes import admin_bp
    from routes.trainer_routes import trainer_bp
    from routes.member_routes import member_bp

    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(trainer_bp, url_prefix='/trainer')
    app.register_blueprint(member_bp, url_prefix='/member')

    @app.route('/')
    def index():
        return render_template('index.html')
    
    

    # ✅ Ensure tables are created
    with app.app_context():
        db.create_all()

    return app

# ✅ Run the application
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
