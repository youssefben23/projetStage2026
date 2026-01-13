# ============================================
# FICHIER: backend/app/routes/user_routes.py
# Routes Utilisateurs
# ============================================
"""
Routes utilisateurs - Profil et gestion du compte
"""

from flask import Blueprint, request, jsonify
from app.services.user_service import UserService
from app.models.activity_log import ActivityLog
from app.utils.decorators import token_required, get_request_info

user_bp = Blueprint('users', __name__, url_prefix='/api/users')


@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """
    Obtenir le profil de l'utilisateur courant

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Profil utilisateur
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


@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    Mettre à jour le profil

    Headers:
        Authorization: Bearer <token>

    Body:
        {
            "nom": "Nouveau nom",
            "prenom": "Nouveau prénom",
            "email": "nouveau@email.com"
        }

    Returns:
        200: Profil mis à jour
        400: Erreur de validation
    """
    try:
        data = request.get_json()

        # Obtenir les infos de la requête
        ip_address, _ = get_request_info(request)
        data['ip_address'] = ip_address

        # Mettre à jour
        user = UserService.update_user(current_user.id, **data)

        return jsonify({
            'success': True,
            'message': 'Profil mis à jour avec succès',
            'user': user.to_dict()
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la mise à jour du profil'
        }), 500


@user_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """
    Changer le mot de passe

    Headers:
        Authorization: Bearer <token>

    Body:
        {
            "current_password": "ancien",
            "new_password": "nouveau"
        }

    Returns:
        200: Mot de passe changé
        400: Erreur de validation
        401: Mot de passe actuel incorrect
    """
    try:
        data = request.get_json()

        # Vérifier les champs requis
        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({
                'success': False,
                'message': 'Mot de passe actuel et nouveau requis'
            }), 400

        # Vérifier le mot de passe actuel
        if not current_user.check_password(data['current_password']):
            return jsonify({
                'success': False,
                'message': 'Mot de passe actuel incorrect'
            }), 401

        # Mettre à jour
        ip_address, _ = get_request_info(request)

        UserService.update_user(
            current_user.id,
            password=data['new_password'],
            ip_address=ip_address
        )

        return jsonify({
            'success': True,
            'message': 'Mot de passe changé avec succès'
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors du changement de mot de passe'
        }), 500


@user_bp.route('/statistics', methods=['GET'])
@token_required
def get_user_statistics(current_user):
    """
    Obtenir les statistiques de l'utilisateur

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Statistiques
    """
    try:
        stats = UserService.get_user_statistics(current_user.id)

        return jsonify({
            'success': True,
            'statistics': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des statistiques'
        }), 500


@user_bp.route('/activity', methods=['GET'])
@token_required
def get_user_activity(current_user):
    """
    Obtenir l'historique d'activité de l'utilisateur

    Headers:
        Authorization: Bearer <token>

    Query Params:
        limit: Nombre maximum de logs (défaut: 50)

    Returns:
        200: Historique d'activité
    """
    try:
        limit = request.args.get('limit', 50, type=int)

        logs = ActivityLog.get_user_activities(current_user.id, limit=limit)

        return jsonify({
            'success': True,
            'activity': [log.to_dict() for log in logs]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération de l\'activité'
        }), 500


@user_bp.route('/deactivate', methods=['POST'])
@token_required
def deactivate_account(current_user):
    """
    Désactiver le compte de l'utilisateur

    Headers:
        Authorization: Bearer <token>

    Body:
        {
            "password": "password_confirmation"
        }

    Returns:
        200: Compte désactivé
        401: Mot de passe incorrect
    """
    try:
        data = request.get_json()

        # Vérifier le mot de passe pour confirmation
        if not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'Mot de passe requis pour confirmation'
            }), 400

        if not current_user.check_password(data['password']):
            return jsonify({
                'success': False,
                'message': 'Mot de passe incorrect'
            }), 401

        # Désactiver
        ip_address, _ = get_request_info(request)

        UserService.delete_user(current_user.id, ip_address=ip_address)

        return jsonify({
            'success': True,
            'message': 'Compte désactivé avec succès'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la désactivation du compte'
        }), 500
