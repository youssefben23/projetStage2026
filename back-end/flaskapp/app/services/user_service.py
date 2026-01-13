# ============================================
# FICHIER: backend/app/services/user_service.py
# Service de Gestion des Utilisateurs
# ============================================
"""
Service de gestion des utilisateurs - Logique métier
"""

from flask import current_app
from app import db
from app.models.user import User
from app.models.activity_log import ActivityLog
# from datetime import datetime


class UserService:
    """Service gérant les utilisateurs"""

    @staticmethod
    def create_user(email, password, nom, prenom, role='user', ip_address=None):
        """
        Créer un nouvel utilisateur

        Args:
            email: Email unique
            password: Mot de passe
            nom: Nom de famille
            prenom: Prénom
            role: Rôle (user ou admin)
            ip_address: Adresse IP

        Returns:
            User: Utilisateur créé

        Raises:
            ValueError: Si données invalides ou email existant
        """
        # Validation des champs requis
        if not email or not email.strip():
            raise ValueError('L\'email est requis')

        if not password or len(password) < 6:
            raise ValueError('Le mot de passe doit contenir au moins 6 caractères')

        if not nom or not nom.strip():
            raise ValueError('Le nom est requis')

        if not prenom or not prenom.strip():
            raise ValueError('Le prénom est requis')

        # Vérifier si l'email existe déjà
        existing_user = User.find_by_email(email)
        if existing_user:
            raise ValueError('Cet email est déjà utilisé')

        # Créer l'utilisateur
        user = User(
            email=email,
            password=password,
            nom=nom,
            prenom=prenom,
            role=role
        )

        db.session.add(user)
        db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user.id,
            action='USER_REGISTERED',
            entity_type='user',
            entity_id=user.id,
            details={'email': email, 'role': role},
            ip_address=ip_address
        )

        current_app.logger.info(f'User registered: {user.email}')

        return user

    @staticmethod
    def get_user_by_id(user_id):
        """
        Récupérer un utilisateur par ID

        Args:
            user_id: ID de l'utilisateur

        Returns:
            User: Utilisateur ou None

        Raises:
            ValueError: Si utilisateur non trouvé
        """
        user = User.find_by_id(user_id)

        if not user:
            raise ValueError('Utilisateur non trouvé')

        return user

    @staticmethod
    def get_user_by_email(email):
        """
        Récupérer un utilisateur par email

        Args:
            email: Email de l'utilisateur

        Returns:
            User: Utilisateur ou None
        """
        return User.find_by_email(email)

    @staticmethod
    def update_user(user_id, **kwargs):
        """
        Mettre à jour un utilisateur

        Args:
            user_id: ID de l'utilisateur
            **kwargs: Champs à mettre à jour

        Returns:
            User: Utilisateur mis à jour

        Raises:
            ValueError: Si données invalides
        """
        user = UserService.get_user_by_id(user_id)

        # Champs autorisés à la modification
        allowed_fields = ['nom', 'prenom', 'email']

        # Vérifier l'email si modifié
        if 'email' in kwargs and kwargs['email'] != user.email:
            existing = User.find_by_email(kwargs['email'])
            if existing and existing.id != user_id:
                raise ValueError('Cet email est déjà utilisé')

        # Mettre à jour les champs
        for field in allowed_fields:
            if field in kwargs and kwargs[field]:
                setattr(user, field, kwargs[field])

        # Mettre à jour le mot de passe si fourni
        if 'password' in kwargs and kwargs['password']:
            if len(kwargs['password']) < 6:
                raise ValueError('Le mot de passe doit contenir au moins 6 caractères')
            user.password = kwargs['password']
            # En production: user.set_password(kwargs['password'])

        db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='USER_UPDATED',
            entity_type='user',
            entity_id=user_id,
            details={'fields': list(kwargs.keys())},
            ip_address=kwargs.get('ip_address')
        )

        return user

    @staticmethod
    def delete_user(user_id, ip_address=None):
        """
        Supprimer un utilisateur (désactivation)

        Args:
            user_id: ID de l'utilisateur
            ip_address: Adresse IP

        Returns:
            bool: True si succès
        """
        user = UserService.get_user_by_id(user_id)

        # Désactiver au lieu de supprimer
        user.deactivate()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='USER_DEACTIVATED',
            entity_type='user',
            entity_id=user_id,
            details={'email': user.email},
            ip_address=ip_address
        )

        current_app.logger.info(f'User deactivated: {user.email}')

        return True

    @staticmethod
    def activate_user(user_id, ip_address=None):
        """
        Activer un utilisateur

        Args:
            user_id: ID de l'utilisateur
            ip_address: Adresse IP

        Returns:
            User: Utilisateur activé
        """
        user = UserService.get_user_by_id(user_id)
        user.activate()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='USER_ACTIVATED',
            entity_type='user',
            entity_id=user_id,
            details={'email': user.email},
            ip_address=ip_address
        )

        return user

    @staticmethod
    def get_all_users(page=1, per_page=20, include_inactive=False):
        """
        Récupérer tous les utilisateurs (paginés)

        Args:
            page: Numéro de page
            per_page: Éléments par page
            include_inactive: Inclure les utilisateurs inactifs

        Returns:
            dict: Résultats paginés
        """
        query = User.query

        if not include_inactive:
            query = query.filter_by(is_active=True)

        query = query.order_by(db.desc('created_at'))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'users': [u.to_dict() for u in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page
        }

    @staticmethod
    def search_users(query, page=1, per_page=20):
        """
        Rechercher des utilisateurs

        Args:
            query: Terme de recherche
            page: Numéro de page
            per_page: Éléments par page

        Returns:
            dict: Résultats paginés
        """
        return User.search(query, page, per_page)

    @staticmethod
    def get_user_statistics(user_id):
        """
        Obtenir les statistiques d'un utilisateur

        Args:
            user_id: ID de l'utilisateur

        Returns:
            dict: Statistiques complètes
        """
        user = UserService.get_user_by_id(user_id)

        return user.to_dict(include_stats=True)

    @staticmethod
    def change_user_role(user_id, new_role, admin_id, ip_address=None):
        """
        Changer le rôle d'un utilisateur (admin uniquement)

        Args:
            user_id: ID de l'utilisateur
            new_role: Nouveau rôle (user ou admin)
            admin_id: ID de l'admin effectuant le changement
            ip_address: Adresse IP

        Returns:
            User: Utilisateur mis à jour

        Raises:
            ValueError: Si rôle invalide
        """
        if new_role not in ['user', 'admin']:
            raise ValueError('Rôle invalide. Doit être "user" ou "admin"')

        user = UserService.get_user_by_id(user_id)
        old_role = user.role

        user.role = new_role
        db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=admin_id,
            action='USER_ROLE_CHANGED',
            entity_type='user',
            entity_id=user_id,
            details={
                'target_user': user.email,
                'old_role': old_role,
                'new_role': new_role
            },
            ip_address=ip_address
        )

        current_app.logger.info(f'User role changed: {user.email} from {old_role} to {new_role}')

        return user

    @staticmethod
    def update_last_login(user_id, ip_address=None):
        """
        Mettre à jour la dernière connexion

        Args:
            user_id: ID de l'utilisateur
            ip_address: Adresse IP
        """
        user = UserService.get_user_by_id(user_id)
        user.update_last_login()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='USER_LOGIN',
            entity_type='user',
            entity_id=user_id,
            ip_address=ip_address
        )
