# ============================================
# FICHIER: backend/app/config.py
# Configuration de l'Application
# ============================================
"""
Configuration - Environnements Dev/Prod
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()


class Config:
    """Configuration de base"""

    # Clé secrète pour JWT et sessions
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # Base de données - CORRIGÉ pour MySQL sans mot de passe
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mysql+pymysql://root:Waywa1234**@localhost/email_template_platform'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # CORS - Autoriser toutes les origines en développement
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:4200,http://127.0.0.1:4200').split(',')

    # Upload
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 MB

    # Pagination
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100

    # Logs
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'logs/app.log'


class DevelopmentConfig(Config):
    """Configuration pour le développement"""

    DEBUG = True
    TESTING = False
    SQLALCHEMY_ECHO = True  # Afficher les requêtes SQL
    LOG_LEVEL = 'DEBUG'


class ProductionConfig(Config):
    """Configuration pour la production"""

    DEBUG = False
    TESTING = False

    # En production, ces variables DOIVENT être définies
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')

    # Sécurité
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    # CORS strict en production
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'https://yourdomain.com').split(',')


class TestingConfig(Config):
    """Configuration pour les tests"""

    TESTING = True
    DEBUG = True

    # Base de données de test en mémoire
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    # Désactiver CSRF pour les tests
    WTF_CSRF_ENABLED = False


# Dictionnaire de configuration
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
