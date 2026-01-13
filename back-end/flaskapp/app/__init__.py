# ============================================
# FICHIER: backend/app/__init__.py
# Initialisation de l'Application Flask
# ============================================
"""
Factory pattern pour créer l'application Flask
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Initialiser les extensions
db = SQLAlchemy()


def create_app(env='development'):
    """
    Créer et configurer l'application Flask

    Args:
        env: Environnement (development/production/testing)

    Returns:
        Flask: Application configurée
    """
    app = Flask(__name__)

    # Charger la configuration
    from app.config import config
    app.config.from_object(config[env])

    # Initialiser les extensions
    db.init_app(app)

    # Configurer CORS - Configuration complète pour développement
    if env == 'development':
        # En développement, autoriser toutes les origines
        CORS(app, 
            resources={r"/api/*": {
                "origins": "*",
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
                "supports_credentials": False,
                "expose_headers": ["Content-Range", "X-Content-Range"]
            }},
            supports_credentials=False,
            automatic_options=True
        )
    else:
        # En production, utiliser les origines spécifiées
        CORS(app, 
            resources={r"/api/*": {
                "origins": app.config['CORS_ORIGINS'],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                "supports_credentials": True
            }},
            supports_credentials=True,
            automatic_options=True
        )
    
    # Gérer les requêtes OPTIONS manuellement pour éviter les redirections 308
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify({'status': 'ok'})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,X-Requested-With,Accept")
            response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS,PATCH")
            return response

    # Enregistrer les blueprints
    with app.app_context():
        # Routes d'authentification
        from app.routes.auth_routes import auth_bp
        app.register_blueprint(auth_bp)

        # Routes des templates
        from app.routes.template_routes import template_bp
        app.register_blueprint(template_bp)

        # Routes utilisateur
        from app.routes.user_routes import user_bp
        app.register_blueprint(user_bp)

        # Routes admin
        from app.routes.admin_routes import admin_bp
        app.register_blueprint(admin_bp)

        # Route de test
        @app.route('/api/health', methods=['GET'])
        def health_check():
            """Vérifier que l'API fonctionne"""
            return {
                'status': 'ok',
                'message': 'API Email Template Platform is running',
                'environment': env
            }, 200

        # Gestionnaires d'erreurs
        @app.errorhandler(404)
        def not_found(error):
            return {'success': False, 'message': 'Route non trouvée'}, 404

        @app.errorhandler(500)
        def internal_error(error):
            db.session.rollback()
            return {'success': False, 'message': 'Erreur serveur interne'}, 500

        @app.errorhandler(400)
        def bad_request(error):
            return {'success': False, 'message': 'Requête invalide'}, 400

    return app
