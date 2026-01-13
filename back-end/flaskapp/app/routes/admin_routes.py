# ============================================
# FICHIER: backend/app/routes/admin_routes.py
# Routes Admin
# ============================================
"""
Routes admin - Gestion des utilisateurs et supervision
"""

from flask import Blueprint, request, jsonify
from app.services.user_service import UserService
from app.models.activity_log import ActivityLog
from app.models.session import Session
from app.utils.decorators import token_required, admin_required, get_request_info

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    """
    Récupérer tous les utilisateurs (Admin uniquement)

    Headers:
        Authorization: Bearer <token>

    Query Params:
        page: Numéro de page (défaut: 1)
        per_page: Éléments par page (défaut: 20)
        include_inactive: Inclure les inactifs (défaut: false)

    Returns:
        200: Liste des utilisateurs
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'

        result = UserService.get_all_users(
            page=page,
            per_page=per_page,
            include_inactive=include_inactive
        )

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des utilisateurs'
        }), 500


@admin_bp.route('/users/search', methods=['GET'])
@token_required
@admin_required
def search_users(current_user):
    """
    Rechercher des utilisateurs

    Headers:
        Authorization: Bearer <token>

    Query Params:
        q: Terme de recherche
        page: Numéro de page (défaut: 1)
        per_page: Éléments par page (défaut: 20)

    Returns:
        200: Résultats de recherche
    """
    try:
        query = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        if not query:
            return jsonify({
                'success': False,
                'message': 'Le paramètre "q" est requis'
            }), 400

        result = UserService.search_users(query, page, per_page)

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la recherche'
        }), 500


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(current_user, user_id):
    """
    Récupérer un utilisateur par ID

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Utilisateur trouvé
        404: Utilisateur non trouvé
    """
    try:
        user = UserService.get_user_by_id(user_id)

        return jsonify({
            'success': True,
            'user': user.to_dict(include_stats=True)
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération de l\'utilisateur'
        }), 500


@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@token_required
@admin_required
def activate_user(current_user, user_id):
    """
    Activer un utilisateur

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Utilisateur activé
        404: Utilisateur non trouvé
    """
    try:
        ip_address, _ = get_request_info(request)

        user = UserService.activate_user(user_id, ip_address=ip_address)

        return jsonify({
            'success': True,
            'message': 'Utilisateur activé avec succès',
            'user': user.to_dict()
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de l\'activation'
        }), 500


@admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
@token_required
@admin_required
def deactivate_user(current_user, user_id):
    """
    Désactiver un utilisateur

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Utilisateur désactivé
        404: Utilisateur non trouvé
    """
    try:
        ip_address, _ = get_request_info(request)

        UserService.delete_user(user_id, ip_address=ip_address)

        return jsonify({
            'success': True,
            'message': 'Utilisateur désactivé avec succès'
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la désactivation'
        }), 500


@admin_bp.route('/users/<int:user_id>/change-role', methods=['POST'])
@token_required
@admin_required
def change_user_role(current_user, user_id):
    """
    Changer le rôle d'un utilisateur

    Headers:
        Authorization: Bearer <token>

    Body:
        {
            "role": "admin" | "user"
        }

    Returns:
        200: Rôle changé
        400: Erreur de validation
        404: Utilisateur non trouvé
    """
    try:
        data = request.get_json()

        if not data.get('role'):
            return jsonify({
                'success': False,
                'message': 'Le rôle est requis'
            }), 400

        ip_address, _ = get_request_info(request)

        user = UserService.change_user_role(
            user_id=user_id,
            new_role=data['role'],
            admin_id=current_user.id,
            ip_address=ip_address
        )

        return jsonify({
            'success': True,
            'message': 'Rôle changé avec succès',
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
            'message': 'Erreur lors du changement de rôle'
        }), 500


@admin_bp.route('/activity', methods=['GET'])
@token_required
@admin_required
def get_activity_logs(current_user):
    """
    Récupérer les logs d'activité

    Headers:
        Authorization: Bearer <token>

    Query Params:
        action: Filtrer par action
        user_id: Filtrer par utilisateur
        page: Numéro de page (défaut: 1)
        per_page: Éléments par page (défaut: 50)

    Returns:
        200: Logs d'activité
    """
    try:
        action = request.args.get('action')
        user_id = request.args.get('user_id', type=int)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)

        result = ActivityLog.search_activities(
            action=action,
            user_id=user_id,
            page=page,
            per_page=per_page
        )

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des logs'
        }), 500


@admin_bp.route('/activity/recent', methods=['GET'])
@token_required
@admin_required
def get_recent_activity(current_user):
    """
    Récupérer l'activité récente

    Headers:
        Authorization: Bearer <token>

    Query Params:
        hours: Nombre d'heures (défaut: 24)
        limit: Nombre maximum de logs (défaut: 100)

    Returns:
        200: Activité récente
    """
    try:
        hours = request.args.get('hours', 24, type=int)
        limit = request.args.get('limit', 100, type=int)

        logs = ActivityLog.get_recent_activities(hours=hours, limit=limit)

        return jsonify({
            'success': True,
            'activity': [log.to_dict() for log in logs]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération de l\'activité'
        }), 500


@admin_bp.route('/sessions', methods=['GET'])
@token_required
@admin_required
def get_all_sessions(current_user):
    """
    Récupérer toutes les sessions actives

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Sessions actives
    """
    try:
        # Récupérer toutes les sessions actives
        from app.models.session import Session
        from datetime import datetime

        sessions = Session.query.filter(
            Session.expires_at > datetime.utcnow(),
            Session.is_revoked == False
        ).all()

        return jsonify({
            'success': True,
            'sessions': [s.to_dict() for s in sessions],
            'total': len(sessions)
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des sessions'
        }), 500


@admin_bp.route('/sessions/cleanup', methods=['POST'])
@token_required
@admin_required
def cleanup_sessions(current_user):
    """
    Nettoyer les sessions expirées

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Sessions nettoyées
    """
    try:
        count = Session.cleanup_expired()

        return jsonify({
            'success': True,
            'message': f'{count} session(s) nettoyée(s)'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors du nettoyage'
        }), 500


@admin_bp.route('/statistics', methods=['GET'])
@token_required
@admin_required
def get_platform_statistics(current_user):
    """
    Obtenir les statistiques globales de la plateforme

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Statistiques globales
    """
    try:
        from app.models.user import User
        from app.models.email_template import EmailTemplate
        from datetime import datetime, timedelta

        # Statistiques utilisateurs
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        admin_users = User.query.filter_by(role='admin').count()

        # Statistiques templates
        total_templates = EmailTemplate.query.count()
        active_templates = EmailTemplate.query.filter_by(is_active=True).count()

        # Nouveaux utilisateurs (7 derniers jours)
        week_ago = datetime.utcnow() - timedelta(days=7)
        new_users_week = User.query.filter(User.created_at >= week_ago).count()

        # Sessions actives
        active_sessions = Session.query.filter(
            Session.expires_at > datetime.utcnow(),
            Session.is_revoked == False
        ).count()

        return jsonify({
            'success': True,
            'statistics': {
                'users': {
                    'total': total_users,
                    'active': active_users,
                    'inactive': total_users - active_users,
                    'admins': admin_users,
                    'new_this_week': new_users_week
                },
                'templates': {
                    'total': total_templates,
                    'active': active_templates,
                    'inactive': total_templates - active_templates
                },
                'sessions': {
                    'active': active_sessions
                }
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des statistiques'
        }), 500
