# ============================================
# FICHIER: backend/app/models/validation_result.py
# Modèle Résultat de Validation
# ============================================
"""
Modèle ValidationResult - Résultats de validation HTML/CSS
"""

from datetime import datetime
from app import db
import json


class ValidationResult(db.Model):
    """Modèle représentant un résultat de validation"""

    __tablename__ = 'validation_results'

    # Colonnes
    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey('email_templates.id', ondelete='CASCADE'),
                           nullable=False, index=True)
    is_valid = db.Column(db.Boolean, nullable=False, index=True)
    html_valid = db.Column(db.Boolean, nullable=False)
    css_valid = db.Column(db.Boolean, nullable=False)
    errors = db.Column(db.JSON, nullable=True)
    warnings = db.Column(db.JSON, nullable=True)
    validated_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    def __init__(self, template_id, is_valid, html_valid, css_valid,
                 errors=None, warnings=None):
        """
        Initialiser un résultat de validation

        Args:
            template_id: ID du template
            is_valid: Est valide
            html_valid: HTML valide
            css_valid: CSS valide
            errors: Liste d'erreurs
            warnings: Liste d'avertissements
        """
        self.template_id = template_id
        self.is_valid = is_valid
        self.html_valid = html_valid
        self.css_valid = css_valid
        self.errors = errors if isinstance(errors, list) else (json.loads(errors) if isinstance(errors, str) else [])
        self.warnings = warnings if isinstance(warnings, list) else (json.loads(warnings) if isinstance(warnings, str) else [])

    def to_dict(self):
        """
        Convertir en dictionnaire

        Returns:
            dict: Représentation JSON
        """
        return {
            'id': self.id,
            'template_id': self.template_id,
            'is_valid': self.is_valid,
            'html_valid': self.html_valid,
            'css_valid': self.css_valid,
            'errors': self.errors or [],
            'warnings': self.warnings or [],
            'error_count': len(self.errors) if self.errors else 0,
            'warning_count': len(self.warnings) if self.warnings else 0,
            'validated_at': self.validated_at.isoformat() if self.validated_at else None
        }

    def __repr__(self):
        """Représentation string"""
        return f'<ValidationResult template_id={self.template_id} valid={self.is_valid}>'

    @staticmethod
    def get_latest_for_template(template_id):
        """
        Obtenir le dernier résultat de validation d'un template

        Args:
            template_id: ID du template

        Returns:
            ValidationResult: Dernier résultat ou None
        """
        return ValidationResult.query.filter_by(
            template_id=template_id
        ).order_by(db.desc('validated_at')).first()

    @staticmethod
    def get_invalid_templates():
        """
        Récupérer tous les templates invalides

        Returns:
            list: Liste des résultats de validation invalides
        """
        return ValidationResult.query.filter_by(is_valid=False).all()
