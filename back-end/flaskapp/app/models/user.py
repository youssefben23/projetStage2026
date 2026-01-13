# ============================================
# FICHIER: backend/app/models/user.py
# Modèle Utilisateur
# ============================================
"""
Modèle User - Gestion des utilisateurs de la plateforme
"""

from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


class User(db.Model):
    """Modèle représentant un utilisateur de la plateforme"""

    __tablename__ = 'users'

    # Colonnes
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password = db.Column(db.String(255), nullable=False)  # Correspond à 'password' dans la DB (pas password_hash)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    role = db.Column(db.Enum('user', 'admin', name='user_roles'), default='user', nullable=False)

    # Relations
    email_templates = db.relationship('EmailTemplate', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    sessions = db.relationship('Session', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    activity_logs = db.relationship('ActivityLog', backref='user', lazy='dynamic')
    created_versions = db.relationship('TemplateVersion', backref='creator', lazy='dynamic')

    def __init__(self, email, password, nom, prenom, role='user'):
        """
        Initialiser un utilisateur

        Args:
            email: Email unique de l'utilisateur
            password: Mot de passe en clair (sera hashé en production)
            nom: Nom de famille
            prenom: Prénom
            role: Rôle (user ou admin)
        """
        self.email = email.lower().strip()
        self.password = password  # En dev/test, stocker en clair
        # En production, utiliser: self.set_password(password)
        self.nom = nom.strip()
        self.prenom = prenom.strip()
        self.role = role

    def set_password(self, password):
        """
        Hasher le mot de passe (pour production)

        Args:
            password: Mot de passe en clair
        """
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """
        Vérifier le mot de passe

        Args:
            password: Mot de passe à vérifier

        Returns:
            bool: True si le mot de passe est correct
        """
        # En dev/test avec mots de passe en clair
        return self.password == password

        # En production avec hash
        # return check_password_hash(self.password, password)

    def update_last_login(self):
        """Mettre à jour la date de dernière connexion"""
        self.last_login = datetime.utcnow()
        db.session.commit()

    def deactivate(self):
        """Désactiver le compte utilisateur"""
        self.is_active = False
        db.session.commit()

    def activate(self):
        """Activer le compte utilisateur"""
        self.is_active = True
        db.session.commit()

    def is_admin(self):
        """
        Vérifier si l'utilisateur est administrateur

        Returns:
            bool: True si admin
        """
        return self.role == 'admin'

    def get_full_name(self):
        """
        Obtenir le nom complet

        Returns:
            str: Prénom + Nom
        """
        return f"{self.prenom} {self.nom}"

    def get_active_templates_count(self):
        """
        Compter les templates actifs de l'utilisateur

        Returns:
            int: Nombre de templates actifs
        """
        return self.email_templates.filter_by(is_active=True).count()

    def to_dict(self, include_stats=False):
        """
        Convertir en dictionnaire

        Args:
            include_stats: Inclure les statistiques

        Returns:
            dict: Représentation JSON
        """
        data = {
            'id': self.id,
            'email': self.email,
            'nom': self.nom,
            'prenom': self.prenom,
            'full_name': self.get_full_name(),
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

        if include_stats:
            data['stats'] = {
                'total_templates': self.email_templates.count(),
                'active_templates': self.get_active_templates_count(),
                'total_sessions': self.sessions.count(),
                'active_sessions': self.sessions.filter_by(is_revoked=False).count()
            }

        return data

    def to_public_dict(self):
        """
        Représentation publique (sans données sensibles)

        Returns:
            dict: Données publiques
        """
        return {
            'id': self.id,
            'full_name': self.get_full_name(),
            'email': self.email
        }

    def __repr__(self):
        """Représentation string"""
        return f'<User {self.email}>'

    @staticmethod
    def find_by_email(email):
        """
        Trouver un utilisateur par email

        Args:
            email: Email à rechercher

        Returns:
            User: Utilisateur ou None
        """
        return User.query.filter_by(email=email.lower().strip()).first()

    @staticmethod
    def find_by_id(user_id):
        """
        Trouver un utilisateur par ID

        Args:
            user_id: ID de l'utilisateur

        Returns:
            User: Utilisateur ou None
        """
        return User.query.get(user_id)

    @staticmethod
    def get_all_active():
        """
        Récupérer tous les utilisateurs actifs

        Returns:
            list: Liste des utilisateurs actifs
        """
        return User.query.filter_by(is_active=True).all()

    @staticmethod
    def search(query, page=1, per_page=20):
        """
        Rechercher des utilisateurs

        Args:
            query: Terme de recherche
            page: Numéro de page
            per_page: Éléments par page

        Returns:
            dict: Résultats paginés
        """
        search_term = f"%{query}%"

        users_query = User.query.filter(
            db.or_(
                User.email.like(search_term),
                User.nom.like(search_term),
                User.prenom.like(search_term)
            )
        ).order_by(User.created_at.desc())

        pagination = users_query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'users': [u.to_dict() for u in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page
        }
