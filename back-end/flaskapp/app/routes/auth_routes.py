# ============================================
# FICHIER: backend/app/routes/auth_routes.py
# Routes d'Authentification
# ============================================
"""
Routes d'authentification - Login, Register, Logout
"""

from flask import Blueprint, request, jsonify
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.utils.decorators import token_required, get_request_info

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Inscription d'un nouvel utilisateur

    Body:
        {
            "email": "user@example.com",
            "password": "password123",
            "nom": "Dupont",
            "prenom": "Jean"
        }

    Returns:
        201: Utilisateur créé
        400: Erreur de validation
    """
    try:
        data = request.get_json()

        # Valider les champs requis
        required_fields = ['email', 'password', 'nom', 'prenom']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Le champ {field} est requis'
                }), 400

        # Valider la force du mot de passe
        is_valid, message = AuthService.validate_password_strength(data['password'])
        if not is_valid:
            return jsonify({
                'success': False,
                'message': message
            }), 400

        # Obtenir les infos de la requête
        ip_address, _ = get_request_info(request)

        # Créer l'utilisateur
        user = UserService.create_user(
            email=data['email'],
            password=data['password'],
            nom=data['nom'],
            prenom=data['prenom'],
            ip_address=ip_address
        )

        return jsonify({
            'success': True,
            'message': 'Inscription réussie',
            'user': user.to_dict()
        }), 201

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de l\'inscription'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Connexion d'un utilisateur

    Body:
        {
            "email": "user@example.com",
            "password": "password123"
        }

    Returns:
        200: Token JWT et informations utilisateur
        401: Identifiants invalides
    """
    try:
        data = request.get_json()

        # Valider les champs requis
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Email et mot de passe requis'
            }), 400

        # Obtenir les infos de la requête
        ip_address, user_agent = get_request_info(request)

        # Authentifier
        result = AuthService.login(
            email=data['email'],
            password=data['password'],
            ip_address=ip_address,
            user_agent=user_agent
        )

        return jsonify({
            'success': True,
            'message': 'Connexion réussie',
            'data': result
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la connexion'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """
    Déconnexion d'un utilisateur

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Déconnexion réussie
    """
    try:
        # Récupérer le token
        token = request.headers.get('Authorization', '').replace('Bearer ', '')

        # Obtenir les infos de la requête
        ip_address, _ = get_request_info(request)

        # Déconnecter
        AuthService.logout(token, ip_address=ip_address)

        return jsonify({
            'success': True,
            'message': 'Déconnexion réussie'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la déconnexion'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@token_required
def refresh_token(current_user):
    """
    Rafraîchir le token JWT

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Nouveau token
    """
    try:
        # Récupérer l'ancien token
        old_token = request.headers.get('Authorization', '').replace('Bearer ', '')

        # Rafraîchir
        result = AuthService.refresh_token(old_token)

        return jsonify({
            'success': True,
            'message': 'Token rafraîchi',
            'data': result
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors du rafraîchissement'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Obtenir les informations de l'utilisateur courant

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Informations utilisateur
    """
    try:
        return jsonify({
            'success': True,
            'user': current_user.to_dict(include_stats=True)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération du profil'
        }), 500


@auth_bp.route('/sessions', methods=['GET'])
@token_required
def get_active_sessions(current_user):
    """
    Obtenir les sessions actives de l'utilisateur courant

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Liste des sessions actives
    """
    try:
        sessions = AuthService.get_active_sessions(current_user.id)

        return jsonify({
            'success': True,
            'sessions': [s.to_dict() for s in sessions]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des sessions'
        }), 500


@auth_bp.route('/sessions/revoke-all', methods=['POST'])
@token_required
def revoke_all_sessions(current_user):
    """
    Révoquer toutes les sessions de l'utilisateur courant

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Sessions révoquées
    """
    try:
        # Obtenir les infos de la requête
        ip_address, _ = get_request_info(request)

        count = AuthService.revoke_all_sessions(
            current_user.id,
            ip_address=ip_address
        )

        return jsonify({
            'success': True,
            'message': f'{count} session(s) révoquée(s)'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la révocation des sessions'
        }), 500


@auth_bp.route('/validate-password', methods=['POST'])
def validate_password():
    """
    Valider la force d'un mot de passe

    Body:
        {
            "password": "password123"
        }

    Returns:
        200: Résultat de validation
    """
    try:
        data = request.get_json()

        if not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Le mot de passe est requis'
            }), 400

        is_valid, message = AuthService.validate_password_strength(data['password'])

        return jsonify({
            'success': True,
            'is_valid': is_valid,
            'message': message
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la validation'
        }), 500
