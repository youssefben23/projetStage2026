# ============================================
# FICHIER: backend/app/models/email_template.py
# Modèle Template Email
# ============================================
"""
Modèle EmailTemplate - Gestion des modèles d'emails
"""

from datetime import datetime
from app import db


class EmailTemplate(db.Model):
    """Modèle représentant un template d'email"""

    __tablename__ = 'email_templates'

    # Colonnes
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    nom = db.Column(db.String(255), nullable=False, index=True)
    sujet = db.Column(db.String(500), nullable=False)
    html_content = db.Column(db.Text, nullable=False)
    css_content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)

    # Relations
    versions = db.relationship('TemplateVersion', backref='template', lazy='dynamic', cascade='all, delete-orphan')
    template_metadata = db.relationship('TemplateMetadata', backref='template', uselist=False, cascade='all, delete-orphan')
    validation_results = db.relationship('ValidationResult', backref='template',
                                         lazy='dynamic', cascade='all, delete-orphan')

    # Index composites
    __table_args__ = (
        db.Index('idx_user_active_templates', 'user_id', 'is_active', 'updated_at'),
        db.Index('idx_template_search', 'user_id', 'is_active', 'nom', 'sujet'),
    )

    def __init__(self, user_id, nom, sujet, html_content, css_content=''):
        """
        Initialiser un template

        Args:
            user_id: ID du propriétaire
            nom: Nom du template
            sujet: Sujet de l'email
            html_content: Contenu HTML
            css_content: Contenu CSS (optionnel)
        """
        self.user_id = user_id
        self.nom = nom.strip()
        self.sujet = sujet.strip()
        self.html_content = html_content
        self.css_content = css_content or ''

    def update_content(self, html_content=None, css_content=None):
        """
        Mettre à jour le contenu

        Args:
            html_content: Nouveau contenu HTML
            css_content: Nouveau contenu CSS
        """
        if html_content is not None:
            self.html_content = html_content
        if css_content is not None:
            self.css_content = css_content
        self.updated_at = datetime.utcnow()

    def soft_delete(self):
        """Suppression logique (marquer comme inactif)"""
        self.is_active = False
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def restore(self):
        """Restaurer un template supprimé"""
        self.is_active = True
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def get_latest_version(self):
        """
        Obtenir la dernière version

        Returns:
            TemplateVersion: Dernière version ou None
        """
        return self.versions.order_by(db.desc('version_number')).first()

    def get_version_count(self):
        """
        Compter le nombre de versions

        Returns:
            int: Nombre de versions
        """
        return self.versions.count()

    def get_full_html(self):
        """
        Obtenir le HTML complet avec CSS inline

        Returns:
            str: HTML avec CSS
        """
        if self.css_content:
            return f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.sujet}</title>
    <style>
        {self.css_content}
    </style>
</head>
<body>
    {self.html_content}
</body>
</html>
            """.strip()
        else:
            return self.html_content

    def duplicate(self, new_name=None):
        """
        Dupliquer le template

        Args:
            new_name: Nouveau nom (optionnel)

        Returns:
            EmailTemplate: Nouveau template
        """
        new_template = EmailTemplate(
            user_id=self.user_id,
            nom=new_name or f"{self.nom} (copie)",
            sujet=self.sujet,
            html_content=self.html_content,
            css_content=self.css_content
        )
        return new_template

    def to_dict(self, include_content=True, include_metadata=False, include_versions=False):
        """
        Convertir en dictionnaire

        Args:
            include_content: Inclure le contenu HTML/CSS
            include_metadata: Inclure les métadonnées
            include_versions: Inclure les versions

        Returns:
            dict: Représentation JSON
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'nom': self.nom,
            'sujet': self.sujet,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version_count': self.get_version_count()
        }

        if include_content:
            data['html_content'] = self.html_content
            data['css_content'] = self.css_content
            data['full_html'] = self.get_full_html()

        if include_metadata and self.template_metadata:
            data['metadata'] = self.template_metadata.to_dict()

        if include_versions:
            data['versions'] = [v.to_dict() for v in self.versions.order_by(db.desc('version_number')).limit(10)]

        # Ajouter les infos du propriétaire
        if self.owner:
            data['owner'] = self.owner.to_public_dict()

        return data

    def to_summary_dict(self):
        """
        Représentation résumée (pour les listes)

        Returns:
            dict: Données résumées
        """
        data = {
            'id': self.id,
            'nom': self.nom,
            'sujet': self.sujet,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version_count': self.get_version_count()
        }

        if self.template_metadata:
            data['category'] = self.template_metadata.category
            data['tags'] = self.template_metadata.tags
            data['favorite'] = self.template_metadata.favorite
            data['usage_count'] = self.template_metadata.usage_count

        return data

    def __repr__(self):
        """Représentation string"""
        return f'<EmailTemplate {self.nom}>'

    @staticmethod
    def find_by_id(template_id):
        """
        Trouver un template par ID

        Args:
            template_id: ID du template

        Returns:
            EmailTemplate: Template ou None
        """
        return EmailTemplate.query.get(template_id)

    @staticmethod
    def find_by_user(user_id, include_inactive=False):
        """
        Trouver tous les templates d'un utilisateur

        Args:
            user_id: ID de l'utilisateur
            include_inactive: Inclure les templates inactifs

        Returns:
            list: Liste des templates
        """
        query = EmailTemplate.query.filter_by(user_id=user_id)

        if not include_inactive:
            query = query.filter_by(is_active=True)

        return query.order_by(db.desc('updated_at')).all()

    @staticmethod
    def search_by_user(user_id, search_term, page=1, per_page=20):
        """
        Rechercher les templates d'un utilisateur

        Args:
            user_id: ID de l'utilisateur
            search_term: Terme de recherche
            page: Numéro de page
            per_page: Éléments par page

        Returns:
            dict: Résultats paginés
        """
        search = f"%{search_term}%"

        query = EmailTemplate.query.filter(
            EmailTemplate.user_id == user_id,
            EmailTemplate.is_active,
        ).filter(
            (EmailTemplate.nom.like(search)) | (EmailTemplate.sujet.like(search))
        ).order_by(db.desc('updated_at'))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'templates': [t.to_summary_dict() for t in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page
        }

    @staticmethod
    def get_user_statistics(user_id):
        """
        Obtenir les statistiques des templates d'un utilisateur

        Args:
            user_id: ID de l'utilisateur

        Returns:
            dict: Statistiques
        """
        total = EmailTemplate.query.filter_by(user_id=user_id).count()
        active = EmailTemplate.query.filter_by(user_id=user_id, is_active=True).count()

        # Récupérer le dernier template modifié
        last_template = EmailTemplate.query.filter_by(
            user_id=user_id,
            is_active=True
        ).order_by(db.desc('updated_at')).first()

        return {
            'total_templates': total,
            'active_templates': active,
            'inactive_templates': total - active,
            'last_updated': last_template.updated_at.isoformat() if last_template else None
        }
