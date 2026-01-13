# ============================================
# FICHIER: backend/app/utils/decorators.py
# Décorateurs Utilitaires
# ============================================
"""
Décorateurs pour les routes - Authentication, Authorization, etc.
"""

from functools import wraps
from flask import request, jsonify
from app.services.auth_service import AuthService


def token_required(f):
    """
    Décorateur pour vérifier le token JWT

    Usage:
        @token_required
        def protected_route(current_user):
            # current_user est automatiquement injecté
            pass
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Récupérer le token du header Authorization
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                # Format attendu: "Bearer <token>"
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({
                    'success': False,
                    'message': 'Format de token invalide. Utilisez: Bearer <token>'
                }), 401

        if not token:
            return jsonify({
                'success': False,
                'message': 'Token manquant. Authentification requise'
            }), 401

        try:
            # Vérifier le token
            payload = AuthService.verify_token(token)

            # Récupérer l'utilisateur courant
            current_user = AuthService.get_current_user(token)

            # Injecter current_user dans les arguments de la fonction
            return f(current_user, *args, **kwargs)

        except ValueError as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 401
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Erreur lors de la vérification du token'
            }), 401

    return decorated


def admin_required(f):
    """
    Décorateur pour vérifier que l'utilisateur est admin

    Usage:
        @token_required
        @admin_required
        def admin_only_route(current_user):
            pass

    Note: Doit être utilisé APRÈS @token_required
    """
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if not current_user.is_admin():
            return jsonify({
                'success': False,
                'message': 'Accès refusé. Droits administrateur requis'
            }), 403

        return f(current_user, *args, **kwargs)

    return decorated


def get_request_info(request_obj):
    """
    Extraire les informations de la requête

    Args:
        request_obj: Objet Flask request

    Returns:
        tuple: (ip_address, user_agent)
    """
    # Récupérer l'IP (en tenant compte des proxies)
    if request_obj.headers.get('X-Forwarded-For'):
        ip_address = request_obj.headers.get('X-Forwarded-For').split(',')[0].strip()
    else:
        ip_address = request_obj.remote_addr

    # Récupérer le user agent
    user_agent = request_obj.headers.get('User-Agent', '')[:500]  # Limiter à 500 caractères

    return ip_address, user_agent


def validate_json(*required_fields):
    """
    Décorateur pour valider les champs JSON requis

    Usage:
        @validate_json('email', 'password')
        def login():
            data = request.get_json()
            # email et password sont garantis d'exister
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = request.get_json()

            if not data:
                return jsonify({
                    'success': False,
                    'message': 'Corps JSON requis'
                }), 400

            # Vérifier les champs requis
            missing_fields = [field for field in required_fields if field not in data]

            if missing_fields:
                return jsonify({
                    'success': False,
                    'message': f'Champs manquants: {", ".join(missing_fields)}'
                }), 400

            return f(*args, **kwargs)

        return decorated
    return decorator


def rate_limit(max_requests=100, window=60):
    """
    Décorateur pour limiter le taux de requêtes

    Usage:
        @rate_limit(max_requests=10, window=60)  # 10 requêtes par minute
        def limited_route():
            pass

    Note: Implémentation simple basée sur IP
    En production, utiliser Redis ou une solution dédiée
    """
    from collections import defaultdict
    from datetime import datetime, timedelta

    # Stockage en mémoire (remplacer par Redis en production)
    request_counts = defaultdict(list)

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            # Récupérer l'IP
            ip_address = request.remote_addr

            # Nettoyer les anciennes requêtes
            cutoff_time = datetime.utcnow() - timedelta(seconds=window)
            request_counts[ip_address] = [
                req_time for req_time in request_counts[ip_address]
                if req_time > cutoff_time
            ]

            # Vérifier la limite
            if len(request_counts[ip_address]) >= max_requests:
                return jsonify({
                    'success': False,
                    'message': 'Trop de requêtes. Veuillez réessayer plus tard'
                }), 429

            # Enregistrer la requête
            request_counts[ip_address].append(datetime.utcnow())

            return f(*args, **kwargs)

        return decorated
    return decorator
