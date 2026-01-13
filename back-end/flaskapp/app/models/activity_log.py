# ============================================
# FICHIER: backend/app/models/activity_log.py
# Modèle Log d'Activité
# ============================================
"""
Modèle ActivityLog - Logs d'audit et sécurité
"""

from datetime import datetime, timedelta
from app import db


class ActivityLog(db.Model):
    """Modèle représentant un log d'activité"""

    __tablename__ = 'activity_logs'

    # Colonnes
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'),
                        nullable=True, index=True)
    action = db.Column(db.String(100), nullable=False, index=True)
    entity_type = db.Column(db.String(50), nullable=True)
    entity_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.JSON, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Index composites
    __table_args__ = (
        db.Index('idx_entity', 'entity_type', 'entity_id'),
    )

    def __init__(self, user_id, action, entity_type=None, entity_id=None,
                 details=None, ip_address=None, user_agent=None):
        """
        Initialiser un log d'activité

        Args:
            user_id: ID de l'utilisateur
            action: Action effectuée
            entity_type: Type d'entité (template, user, etc.)
            entity_id: ID de l'entité
            details: Détails supplémentaires (dict)
            ip_address: Adresse IP
            user_agent: User agent
        """
        self.user_id = user_id
        self.action = action
        self.entity_type = entity_type
        self.entity_id = entity_id
        self.details = details or {}
        self.ip_address = ip_address
        self.user_agent = user_agent

    def to_dict(self):
        """
        Convertir en dictionnaire

        Returns:
            dict: Représentation JSON
        """
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details or {},
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        # Ajouter les infos de l'utilisateur si disponible
        if self.user:
            data['user'] = {
                'id': self.user.id,
                'email': self.user.email,
                'name': self.user.get_full_name()
            }

        return data

    def __repr__(self):
        """Représentation string"""
        return f'<ActivityLog {self.action} by user_id={self.user_id}>'

    @staticmethod
    def log_activity(user_id, action, entity_type=None, entity_id=None,
                     details=None, ip_address=None, user_agent=None):
        """
        Créer un log d'activité

        Args:
            user_id: ID de l'utilisateur
            action: Action effectuée
            entity_type: Type d'entité
            entity_id: ID de l'entité
            details: Détails
            ip_address: IP
            user_agent: User agent

        Returns:
            ActivityLog: Log créé
        """
        log = ActivityLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )

        db.session.add(log)
        db.session.commit()

        return log

    @staticmethod
    def get_user_activities(user_id, limit=50):
        """
        Récupérer les activités d'un utilisateur

        Args:
            user_id: ID de l'utilisateur
            limit: Nombre maximum de logs

        Returns:
            list: Liste des logs
        """
        return ActivityLog.query.filter_by(
            user_id=user_id
        ).order_by(db.desc('created_at')).limit(limit).all()

    @staticmethod
    def get_recent_activities(hours=24, limit=100):
        """
        Récupérer les activités récentes

        Args:
            hours: Nombre d'heures
            limit: Nombre maximum de logs

        Returns:
            list: Liste des logs
        """
        since = datetime.utcnow() - timedelta(hours=hours)

        return ActivityLog.query.filter(
            ActivityLog.created_at >= since
        ).order_by(db.desc('created_at')).limit(limit).all()

    @staticmethod
    def get_entity_activities(entity_type, entity_id, limit=50):
        """
        Récupérer les activités pour une entité

        Args:
            entity_type: Type d'entité
            entity_id: ID de l'entité
            limit: Nombre maximum de logs

        Returns:
            list: Liste des logs
        """
        return ActivityLog.query.filter_by(
            entity_type=entity_type,
            entity_id=entity_id
        ).order_by(db.desc('created_at')).limit(limit).all()

    @staticmethod
    def search_activities(action=None, user_id=None, entity_type=None,
                          start_date=None, end_date=None, page=1, per_page=50):
        """
        Rechercher des activités

        Args:
            action: Filtrer par action
            user_id: Filtrer par utilisateur
            entity_type: Filtrer par type d'entité
            start_date: Date de début
            end_date: Date de fin
            page: Numéro de page
            per_page: Éléments par page

        Returns:
            dict: Résultats paginés
        """
        query = ActivityLog.query

        if action:
            query = query.filter_by(action=action)

        if user_id:
            query = query.filter_by(user_id=user_id)

        if entity_type:
            query = query.filter_by(entity_type=entity_type)

        if start_date:
            query = query.filter(ActivityLog.created_at >= start_date)

        if end_date:
            query = query.filter(ActivityLog.created_at <= end_date)

        query = query.order_by(db.desc('created_at'))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'logs': [log.to_dict() for log in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page
        }

    @staticmethod
    def cleanup_old_logs(days=90):
        """
        Nettoyer les vieux logs

        Args:
            days: Nombre de jours à conserver

        Returns:
            int: Nombre de logs supprimés
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        old_logs = ActivityLog.query.filter(
            ActivityLog.created_at < cutoff_date
        ).all()

        count = len(old_logs)

        for log in old_logs:
            db.session.delete(log)

        db.session.commit()

        return count
