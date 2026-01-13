# ============================================
# FICHIER: backend/app/models/__init__.py
# Export de tous les modèles
# ============================================
"""
Package models - Tous les modèles SQLAlchemy
"""

from app.models.user import User
from app.models.email_template import EmailTemplate
from app.models.template_version import TemplateVersion
from app.models.template_metadata import TemplateMetadata
from app.models.validation_result import ValidationResult
from app.models.session import Session
from app.models.activity_log import ActivityLog

__all__ = [
    'User',
    'EmailTemplate',
    'TemplateVersion',
    'TemplateMetadata',
    'ValidationResult',
    'Session',
    'ActivityLog'
]
