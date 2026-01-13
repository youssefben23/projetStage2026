# ============================================
# FICHIER: backend/app/models/session.py
# Modèle Session
# ============================================
"""
Modèle Session - Gestion des sessions JWT
"""

from datetime import datetime, timedelta
from app import db
import hashlib


class Session(db.Model):
    """Modèle représentant une session utilisateur"""

    __tablename__ = 'sessions'

    # Colonnes
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'),
                       nullable=False, index=True)
    token_hash = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    is_revoked = db.Column(db.Boolean, default=False, nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, user_id, token_hash, expires_at, ip_address=None, user_agent=None):
        """
        Initialiser une session

        Args:
            user_id: ID de l'utilisateur
            token_hash: Hash du token JWT
            expires_at: Date d'expiration
            ip_address: Adresse IP
            user_agent: User agent
        """
        self.user_id = user_id
        self.token_hash = token_hash
        self.expires_at = expires_at
        self.ip_address = ip_address
        self.user_agent = user_agent

    def is_expired(self):
        """
        Vérifier si la session est expirée

        Returns:
            bool: True si expirée
        """
        return datetime.utcnow() > self.expires_at

    def is_active(self):
        """
        Vérifier si la session est active

        Returns:
            bool: True si active
        """
        return not self.is_revoked and not self.is_expired()

    def revoke(self):
        """Révoquer la session"""
        self.is_revoked = True
        self.revoked_at = datetime.utcnow()
        db.session.commit()

    def to_dict(self):
        """
        Convertir en dictionnaire

        Returns:
            dict: Représentation JSON
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'is_revoked': self.is_revoked,
            'is_active': self.is_active(),
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None
        }

    def __repr__(self):
        """Représentation string"""
        return f'<Session user_id={self.user_id} active={self.is_active()}>'

    @staticmethod
    def hash_token(token):
        """
        Hasher un token

        Args:
            token: Token JWT

        Returns:
            str: Hash du token
        """
        return hashlib.sha256(token.encode()).hexdigest()

    @staticmethod
    def find_by_token_hash(token_hash):
        """
        Trouver une session par hash de token

        Args:
            token_hash: Hash du token

        Returns:
            Session: Session ou None
        """
        return Session.query.filter_by(token_hash=token_hash).first()

    @staticmethod
    def get_active_sessions(user_id):
        """
        Récupérer les sessions actives d'un utilisateur

        Args:
            user_id: ID de l'utilisateur

        Returns:
            list: Liste des sessions actives
        """
        now = datetime.utcnow()
        return Session.query.filter(
            Session.user_id == user_id,
            Session.is_revoked == False,
            Session.expires_at > now
        ).order_by(db.desc('created_at')).all()

    @staticmethod
    def revoke_all_user_sessions(user_id, exclude_token_hash=None):
        """
        Révoquer toutes les sessions d'un utilisateur

        Args:
            user_id: ID de l'utilisateur
            exclude_token_hash: Hash de token à exclure (session courante)

        Returns:
            int: Nombre de sessions révoquées
        """
        query = Session.query.filter_by(user_id=user_id, is_revoked=False)
        
        if exclude_token_hash:
            query = query.filter(Session.token_hash != exclude_token_hash)
        
        sessions = query.all()
        count = 0
        
        for session in sessions:
            session.revoke()
            count += 1
        
        return count

    @staticmethod
    def cleanup_expired():
        """
        Nettoyer les sessions expirées

        Returns:
            int: Nombre de sessions supprimées
        """
        now = datetime.utcnow()
        expired_sessions = Session.query.filter(
            (Session.expires_at < now) | (Session.is_revoked == True)
        ).all()
        
        count = len(expired_sessions)
        
        for session in expired_sessions:
            db.session.delete(session)
        
        db.session.commit()
        
        return count
