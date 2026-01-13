# ============================================
# FICHIER: backend/app/models/template_metadata.py
# Modèle Métadonnées de Template
# ============================================
"""
Modèle TemplateMetadata - Métadonnées et statistiques des templates
"""

from datetime import datetime
from app import db
import json


class TemplateMetadata(db.Model):
    """Modèle représentant les métadonnées d'un template"""

    __tablename__ = 'template_metadata'

    # Colonnes
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('email_templates.id', ondelete='CASCADE'),
                           nullable=False, unique=True, index=True)
    category = db.Column(db.String(100), nullable=True, index=True)
    tags = db.Column(db.JSON, nullable=True)
    usage_count = db.Column(db.Integer, default=0, nullable=False)
    last_used = db.Column(db.DateTime, nullable=True, index=True)
    favorite = db.Column(db.Boolean, default=False, nullable=False, index=True)
    shared = db.Column(db.Boolean, default=False, nullable=False, index=True)
    shared_with = db.Column(db.JSON, nullable=True)

    def __init__(self, template_id, category=None, tags=None, usage_count=0,
                 favorite=False, shared=False, shared_with=None):
        """
        Initialiser les métadonnées

        Args:
            template_id: ID du template
            category: Catégorie
            tags: Liste de tags
            usage_count: Nombre d'utilisations
            favorite: Favori
            shared: Partagé
            shared_with: Liste des utilisateurs avec qui c'est partagé
        """
        self.template_id = template_id
        self.category = category
        self.tags = tags if isinstance(tags, list) else (json.loads(tags) if isinstance(tags, str) else [])
        self.usage_count = usage_count
        self.favorite = favorite
        self.shared = shared
        self.shared_with = shared_with if isinstance(shared_with, list) else (json.loads(shared_with) if isinstance(shared_with, str) else [])

    def increment_usage(self):
        """Incrémenter le compteur d'utilisation"""
        self.usage_count += 1
        self.last_used = datetime.utcnow()
        db.session.commit()

    def toggle_favorite(self):
        """Basculer le statut favori"""
        self.favorite = not self.favorite
        db.session.commit()

    def add_tag(self, tag):
        """
        Ajouter un tag

        Args:
            tag: Tag à ajouter
        """
        if not self.tags:
            self.tags = []
        
        if tag not in self.tags:
            self.tags.append(tag)
            db.session.commit()

    def remove_tag(self, tag):
        """
        Retirer un tag

        Args:
            tag: Tag à retirer
        """
        if self.tags and tag in self.tags:
            self.tags.remove(tag)
            db.session.commit()

    def share_with(self, user_id):
        """
        Partager avec un utilisateur

        Args:
            user_id: ID de l'utilisateur
        """
        if not self.shared_with:
            self.shared_with = []
        
        if user_id not in self.shared_with:
            self.shared_with.append(user_id)
            self.shared = True
            db.session.commit()

    def unshare_with(self, user_id):
        """
        Ne plus partager avec un utilisateur

        Args:
            user_id: ID de l'utilisateur
        """
        if self.shared_with and user_id in self.shared_with:
            self.shared_with.remove(user_id)
            if not self.shared_with:
                self.shared = False
            db.session.commit()

    def to_dict(self):
        """
        Convertir en dictionnaire

        Returns:
            dict: Représentation JSON
        """
        return {
            'id': self.id,
            'template_id': self.template_id,
            'category': self.category,
            'tags': self.tags or [],
            'usage_count': self.usage_count,
            'last_used': self.last_used.isoformat() if self.last_used else None,
            'favorite': self.favorite,
            'shared': self.shared,
            'shared_with': self.shared_with or []
        }

    def __repr__(self):
        """Représentation string"""
        return f'<TemplateMetadata template_id={self.template_id}>'

    @staticmethod
    def find_by_template(template_id):
        """
        Trouver les métadonnées d'un template

        Args:
            template_id: ID du template

        Returns:
            TemplateMetadata: Métadonnées ou None
        """
        return TemplateMetadata.query.filter_by(template_id=template_id).first()

    @staticmethod
    def get_by_category(category):
        """
        Récupérer les templates d'une catégorie

        Args:
            category: Catégorie

        Returns:
            list: Liste des métadonnées
        """
        return TemplateMetadata.query.filter_by(category=category).all()

    @staticmethod
    def get_favorites(user_id):
        """
        Récupérer les templates favoris d'un utilisateur

        Args:
            user_id: ID de l'utilisateur

        Returns:
            list: Liste des templates favoris
        """
        from app.models.email_template import EmailTemplate
        
        return db.session.query(TemplateMetadata).join(
            EmailTemplate
        ).filter(
            EmailTemplate.user_id == user_id,
            TemplateMetadata.favorite == True
        ).all()
