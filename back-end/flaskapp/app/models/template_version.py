# ============================================
# FICHIER: backend/app/models/template_version.py
# Modèle Version de Template
# ============================================
"""
Modèle TemplateVersion - Historique des versions
"""

from datetime import datetime
from app import db


class TemplateVersion(db.Model):
    """Modèle représentant une version d'un template"""

    __tablename__ = 'template_versions'

    # Colonnes
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('email_templates.id',
                            ondelete='CASCADE'), nullable=False, index=True)
    version_number = db.Column(db.Integer, nullable=False)
    html_content = db.Column(db.Text, nullable=False)
    css_content = db.Column(db.Text, nullable=True)
    change_description = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)

    # Contraintes
    __table_args__ = (
        db.UniqueConstraint('template_id', 'version_number', name='unique_template_version'),
        db.Index('idx_template_id', 'template_id'),
        db.Index('idx_version_number', 'version_number'),
        db.Index('idx_created_at', 'created_at'),
        db.Index('idx_created_by', 'created_by'),
    )

    def __init__(self, template_id, version_number, html_content, css_content='',
                 change_description='', created_by=None, ip_address=None, user_agent=None):
        """
        Initialiser une version

        Args:
            template_id: ID du template
            version_number: Numéro de version
            html_content: Contenu HTML
            css_content: Contenu CSS
            change_description: Description des changements
            created_by: ID de l'utilisateur créateur
            ip_address: Adresse IP
            user_agent: User agent
        """
        self.template_id = template_id
        self.version_number = version_number
        self.html_content = html_content
        self.css_content = css_content or ''
        self.change_description = change_description or f'Version {version_number}'
        self.created_by = created_by
        self.ip_address = ip_address
        self.user_agent = user_agent

    def to_dict(self, include_content=True):
        """
        Convertir en dictionnaire

        Args:
            include_content: Inclure le contenu HTML/CSS

        Returns:
            dict: Représentation JSON
        """
        data = {
            'id': self.id,
            'template_id': self.template_id,
            'version_number': self.version_number,
            'change_description': self.change_description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by
        }

        if include_content:
            data['html_content'] = self.html_content
            data['css_content'] = self.css_content

        # Ajouter les infos du créateur
        if self.creator:
            data['creator'] = {
                'id': self.creator.id,
                'name': self.creator.get_full_name()
            }

        return data

    def __repr__(self):
        """Représentation string"""
        return f'<TemplateVersion {self.template_id} v{self.version_number}>'

    @staticmethod
    def get_next_version_number(template_id):
        """
        Obtenir le prochain numéro de version

        Args:
            template_id: ID du template

        Returns:
            int: Prochain numéro de version
        """
        last_version = TemplateVersion.query.filter_by(
            template_id=template_id
        ).order_by(db.desc('version_number')).first()

        return (last_version.version_number + 1) if last_version else 1

    @staticmethod
    def get_template_versions(template_id, limit=None):
        """
        Récupérer toutes les versions d'un template

        Args:
            template_id: ID du template
            limit: Nombre maximum de versions

        Returns:
            list: Liste des versions
        """
        query = TemplateVersion.query.filter_by(
            template_id=template_id
        ).order_by(db.desc('version_number'))

        if limit:
            query = query.limit(limit)

        return query.all()

    @staticmethod
    def get_version_by_number(template_id, version_number):
        """
        Récupérer une version spécifique

        Args:
            template_id: ID du template
            version_number: Numéro de version

        Returns:
            TemplateVersion: Version ou None
        """
        return TemplateVersion.query.filter_by(
            template_id=template_id,
            version_number=version_number
        ).first()
