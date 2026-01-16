# ============================================
# FICHIER: backend/app/__init__.py
# Initialisation Flask - CORS ULTRA CORRIGÉ
# ============================================
"""
Factory pattern pour créer l'application Flask - CORS CORRIGÉ
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

    # ============================================
    # CORRECTION MAJEURE: Configuration CORS COMPLÈTE
    # ============================================

    if env == 'development':
        # CORS ultra-permissif pour développement
        CORS(app,
             resources={
                 r"/*": {  # Autoriser TOUTES les routes
                     "origins": "*",
                     "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                     "allow_headers": "*",
                     "expose_headers": ["Content-Type", "Authorization", "Content-Length", "X-Requested-With"],
                     "supports_credentials": False,
                     "max_age": 3600
                 }
             },
             supports_credentials=False,
             send_wildcard=True,
             automatic_options=True
             )

        app.logger.info('✅ CORS configuré en mode DÉVELOPPEMENT (permissif)')
    else:
        # Production: configuration stricte
        CORS(app,
             resources={
                 r"/api/*": {
                     "origins": app.config['CORS_ORIGINS'],
                     "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                     "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
                     "supports_credentials": True,
                     "max_age": 3600
                 }
             },
             supports_credentials=True
             )

        app.logger.info('✅ CORS configuré en mode PRODUCTION (strict)')

    # ============================================
    # Gestionnaire OPTIONS global (Preflight)
    # ============================================
    @app.before_request
    def handle_preflight():
        """Gérer les requêtes OPTIONS (preflight CORS)"""
        if request.method == "OPTIONS":
            response = jsonify({'status': 'ok'})
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "*")
            response.headers.add("Access-Control-Allow-Methods", "*")
            response.headers.add("Access-Control-Max-Age", "3600")
            return response, 200

    # ============================================
    # Middleware pour ajouter headers CORS si manquants
    # ============================================
    @app.after_request
    def after_request(response):
        """Ajouter headers CORS automatiquement"""
        # Ajouter CORS si pas déjà présent
        if 'Access-Control-Allow-Origin' not in response.headers:
            if env == 'development':
                response.headers['Access-Control-Allow-Origin'] = '*'
            else:
                origin = request.headers.get('Origin')
                if origin in app.config['CORS_ORIGINS']:
                    response.headers['Access-Control-Allow-Origin'] = origin

        # Logger pour déboguer (développement seulement)
        if env == 'development' and app.debug:
            app.logger.debug(
                f'{request.method} {request.path} → {response.status_code} '
                f'(Origin: {request.headers.get("Origin", "N/A")})'
            )

        return response

    # ============================================
    # Enregistrer les blueprints
    # ============================================
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

        # ============================================
        # Routes de test et santé
        # ============================================
        @app.route('/api/health', methods=['GET'])
        def health_check():
            """Vérifier que l'API fonctionne"""
            return jsonify({
                'status': 'ok',
                'message': 'API Email Template Platform is running',
                'environment': env,
                'cors_enabled': True,
                'debug': app.debug
            }), 200

        @app.route('/api/test-cors', methods=['GET', 'POST', 'OPTIONS'])
        def test_cors():
            """Route de test CORS"""
            return jsonify({
                'status': 'success',
                'message': 'CORS fonctionne correctement ! ✅',
                'method': request.method,
                'origin': request.headers.get('Origin', 'N/A'),
                'headers': dict(request.headers)
            }), 200

        # ============================================
        # Gestionnaires d'erreurs AMÉLIORÉS
        # ============================================
        @app.errorhandler(404)
        def not_found(error):
            """Erreur 404"""
            return jsonify({
                'success': False,
                'error': 'not_found',
                'message': 'Route non trouvée',
                'path': request.path
            }), 404

        @app.errorhandler(500)
        def internal_error(error):
            """Erreur 500"""
            db.session.rollback()
            app.logger.error(f'Erreur interne: {str(error)}')
            return jsonify({
                'success': False,
                'error': 'internal_error',
                'message': 'Erreur serveur interne'
            }), 500

        @app.errorhandler(400)
        def bad_request(error):
            """Erreur 400"""
            return jsonify({
                'success': False,
                'error': 'bad_request',
                'message': 'Requête invalide'
            }), 400

        @app.errorhandler(401)
        def unauthorized(error):
            """Erreur 401"""
            return jsonify({
                'success': False,
                'error': 'unauthorized',
                'message': 'Authentification requise'
            }), 401

        @app.errorhandler(403)
        def forbidden(error):
            """Erreur 403"""
            return jsonify({
                'success': False,
                'error': 'forbidden',
                'message': 'Accès interdit'
            }), 403

        @app.errorhandler(413)
        def request_entity_too_large(error):
            """Erreur 413"""
            return jsonify({
                'success': False,
                'error': 'payload_too_large',
                'message': 'Le contenu est trop volumineux'
            }), 413

        @app.errorhandler(429)
        def rate_limit_exceeded(error):
            """Erreur 429"""
            return jsonify({
                'success': False,
                'error': 'rate_limit_exceeded',
                'message': 'Trop de requêtes. Veuillez réessayer plus tard'
            }), 429

    app.logger.info(f'✅ Application Flask créée avec succès (env={env})')

    return app
