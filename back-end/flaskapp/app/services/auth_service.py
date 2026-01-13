# ============================================
# FICHIER: backend/app/services/auth_service.py
# Service d'Authentification
# ============================================
"""
Service d'authentification - JWT, Sessions, Login/Logout
"""

import jwt
from datetime import datetime, timedelta
from flask import current_app
from app import db
from app.models.user import User
from app.models.session import Session
from app.models.activity_log import ActivityLog


class AuthService:
    """Service gérant l'authentification et les tokens JWT"""

    @staticmethod
    def generate_token(user_id, email, role):
        """
        Générer un token JWT

        Args:
            user_id: ID de l'utilisateur
            email: Email de l'utilisateur
            role: Rôle de l'utilisateur

        Returns:
            str: Token JWT
        """
        payload = {
            'user_id': user_id,
            'email': email,
            'role': role,
            'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
            'iat': datetime.utcnow()
        }

        token = jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )

        return token

    @staticmethod
    def verify_token(token):
        """
        Vérifier un token JWT

        Args:
            token: Token JWT

        Returns:
            dict: Payload décodé

        Raises:
            ValueError: Si token invalide ou expiré
        """
        try:
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError('Token expiré')
        except jwt.InvalidTokenError:
            raise ValueError('Token invalide')

    @staticmethod
    def get_current_user(token):
        """
        Récupérer l'utilisateur courant à partir du token

        Args:
            token: Token JWT

        Returns:
            User: Utilisateur courant

        Raises:
            ValueError: Si utilisateur non trouvé ou token invalide
        """
        # Vérifier le token
        payload = AuthService.verify_token(token)

        # Vérifier que la session existe et est active
        token_hash = Session.hash_token(token)
        session = Session.find_by_token_hash(token_hash)

        if not session or not session.is_active():
            raise ValueError('Session invalide ou expirée')

        # Récupérer l'utilisateur
        user = User.find_by_id(payload['user_id'])

        if not user or not user.is_active:
            raise ValueError('Utilisateur non trouvé ou inactif')

        return user

    @staticmethod
    def login(email, password, ip_address=None, user_agent=None):
        """
        Authentifier un utilisateur

        Args:
            email: Email de l'utilisateur
            password: Mot de passe
            ip_address: Adresse IP
            user_agent: User agent

        Returns:
            dict: Token et informations utilisateur

        Raises:
            ValueError: Si identifiants invalides
        """
        # Trouver l'utilisateur
        user = User.find_by_email(email)

        if not user:
            raise ValueError('Email ou mot de passe incorrect')

        if not user.is_active:
            raise ValueError('Compte désactivé')

        # Vérifier le mot de passe
        if not user.check_password(password):
            raise ValueError('Email ou mot de passe incorrect')

        # Générer le token
        token = AuthService.generate_token(user.id, user.email, user.role)

        # Créer la session
        token_hash = Session.hash_token(token)
        expires_at = datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']

        session = Session(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent
        )

        db.session.add(session)
        db.session.commit()

        # Mettre à jour la dernière connexion
        user.update_last_login()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user.id,
            action='LOGIN',
            entity_type='user',
            entity_id=user.id,
            details={'ip': ip_address},
            ip_address=ip_address,
            user_agent=user_agent
        )

        return {
            'token': token,
            'user': user.to_dict(),
            'expires_at': expires_at.isoformat()
        }

    @staticmethod
    def logout(token, ip_address=None):
        """
        Déconnecter un utilisateur

        Args:
            token: Token JWT
            ip_address: Adresse IP

        Returns:
            bool: True si succès
        """
        try:
            # Vérifier le token
            payload = AuthService.verify_token(token)

            # Trouver et révoquer la session
            token_hash = Session.hash_token(token)
            session = Session.find_by_token_hash(token_hash)

            if session:
                session.revoke()

                # Logger l'activité
                ActivityLog.log_activity(
                    user_id=payload['user_id'],
                    action='LOGOUT',
                    entity_type='user',
                    entity_id=payload['user_id'],
                    details={'ip': ip_address},
                    ip_address=ip_address
                )

            return True
        except Exception:
            # Même en cas d'erreur, considérer comme déconnecté
            return True

    @staticmethod
    def refresh_token(old_token):
        """
        Rafraîchir un token

        Args:
            old_token: Ancien token

        Returns:
            dict: Nouveau token et informations

        Raises:
            ValueError: Si token invalide
        """
        # Vérifier l'ancien token
        payload = AuthService.verify_token(old_token)

        # Récupérer l'utilisateur
        user = User.find_by_id(payload['user_id'])

        if not user or not user.is_active:
            raise ValueError('Utilisateur non trouvé ou inactif')

        # Générer un nouveau token
        new_token = AuthService.generate_token(user.id, user.email, user.role)

        # Révoquer l'ancienne session
        old_token_hash = Session.hash_token(old_token)
        old_session = Session.find_by_token_hash(old_token_hash)
        if old_session:
            old_session.revoke()

        # Créer une nouvelle session
        new_token_hash = Session.hash_token(new_token)
        expires_at = datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']

        new_session = Session(
            user_id=user.id,
            token_hash=new_token_hash,
            expires_at=expires_at
        )

        db.session.add(new_session)
        db.session.commit()

        return {
            'token': new_token,
            'expires_at': expires_at.isoformat()
        }

    @staticmethod
    def get_active_sessions(user_id):
        """
        Récupérer les sessions actives d'un utilisateur

        Args:
            user_id: ID de l'utilisateur

        Returns:
            list: Liste des sessions actives
        """
        return Session.get_active_sessions(user_id)

    @staticmethod
    def revoke_all_sessions(user_id, ip_address=None):
        """
        Révoquer toutes les sessions d'un utilisateur

        Args:
            user_id: ID de l'utilisateur
            ip_address: Adresse IP

        Returns:
            int: Nombre de sessions révoquées
        """
        count = Session.revoke_all_user_sessions(user_id)

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='REVOKE_ALL_SESSIONS',
            entity_type='user',
            entity_id=user_id,
            details={'count': count, 'ip': ip_address},
            ip_address=ip_address
        )

        return count

    @staticmethod
    def validate_password_strength(password):
        """
        Valider la force d'un mot de passe

        Args:
            password: Mot de passe à valider

        Returns:
            tuple: (is_valid, message)
        """
        if len(password) < 8:
            return False, "Le mot de passe doit contenir au moins 8 caractères"

        if not any(c.isupper() for c in password):
            return False, "Le mot de passe doit contenir au moins une majuscule"

        if not any(c.islower() for c in password):
            return False, "Le mot de passe doit contenir au moins une minuscule"

        if not any(c.isdigit() for c in password):
            return False, "Le mot de passe doit contenir au moins un chiffre"

        return True, "Mot de passe valide"
