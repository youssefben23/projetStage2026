# ============================================
# FICHIER: backend/app/routes/__init__.py
# Export de toutes les routes
# ============================================
"""
Package routes - Tous les blueprints
"""

from app.routes.auth_routes import auth_bp
from app.routes.template_routes import template_bp
from app.routes.user_routes import user_bp
from app.routes.admin_routes import admin_bp

__all__ = [
    'auth_bp',
    'template_bp',
    'user_bp',
    'admin_bp'
]