# ============================================
# FICHIER: backend/app/services/version_service.py
# Service de Gestion des Versions
# ============================================
"""
Service de gestion des versions - Historique et restauration
"""

from flask import current_app
from app import db
from app.models.template_version import TemplateVersion
from app.models.email_template import EmailTemplate
from app.models.activity_log import ActivityLog


class VersionService:
    """Service gérant les versions de templates"""

    @staticmethod
    def get_template_versions(template_id, user_id, page=1, per_page=20):
        """
        Récupérer les versions d'un template

        Args:
            template_id: ID du template
            user_id: ID de l'utilisateur (pour vérifier la propriété)
            page: Numéro de page
            per_page: Éléments par page

        Returns:
            dict: Versions paginées

        Raises:
            ValueError: Si template non trouvé ou accès non autorisé
        """
        # Vérifier que l'utilisateur est propriétaire du template
        template = EmailTemplate.query.filter_by(
            id=template_id,
            user_id=user_id
        ).first()

        if not template:
            raise ValueError('Template non trouvé ou accès non autorisé')

        # Récupérer les versions
        query = TemplateVersion.query.filter_by(
            template_id=template_id
        ).order_by(db.desc('version_number'))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'versions': [v.to_dict(include_content=False) for v in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'template_id': template_id,
            'template_name': template.nom
        }

    @staticmethod
    def get_version_by_number(template_id, version_number, user_id):
        """
        Récupérer une version spécifique

        Args:
            template_id: ID du template
            version_number: Numéro de version
            user_id: ID de l'utilisateur

        Returns:
            TemplateVersion: Version

        Raises:
            ValueError: Si version non trouvée ou accès non autorisé
        """
        # Vérifier que l'utilisateur est propriétaire
        template = EmailTemplate.query.filter_by(
            id=template_id,
            user_id=user_id
        ).first()

        if not template:
            raise ValueError('Template non trouvé ou accès non autorisé')

        # Récupérer la version
        version = TemplateVersion.get_version_by_number(template_id, version_number)

        if not version:
            raise ValueError(f'Version {version_number} non trouvée')

        return version

    @staticmethod
    def restore_version(template_id, version_number, user_id,
                        ip_address=None, user_agent=None):
        """
        Restaurer une version antérieure

        Args:
            template_id: ID du template
            version_number: Numéro de version à restaurer
            user_id: ID de l'utilisateur
            ip_address: Adresse IP
            user_agent: User agent

        Returns:
            EmailTemplate: Template restauré

        Raises:
            ValueError: Si version non trouvée ou erreur
        """
        # Récupérer la version à restaurer
        version_to_restore = VersionService.get_version_by_number(
            template_id, version_number, user_id
        )

        # Récupérer le template
        template = EmailTemplate.query.get(template_id)

        # Créer une nouvelle version avec le contenu restauré
        new_version_number = TemplateVersion.get_next_version_number(template_id)

        new_version = TemplateVersion(
            template_id=template_id,
            version_number=new_version_number,
            html_content=version_to_restore.html_content,
            css_content=version_to_restore.css_content,
            change_description=f'Restauration de la version {version_number}',
            created_by=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Mettre à jour le template avec le contenu restauré
        template.html_content = version_to_restore.html_content
        template.css_content = version_to_restore.css_content

        db.session.add(new_version)
        db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='VERSION_RESTORED',
            entity_type='template',
            entity_id=template_id,
            details={
                'restored_version': version_number,
                'new_version': new_version_number
            },
            ip_address=ip_address,
            user_agent=user_agent
        )

        current_app.logger.info(
            f'Version {version_number} restored to version {new_version_number} '
            f'for template {template_id}'
        )

        return template

    @staticmethod
    def compare_versions(template_id, version1_number, version2_number, user_id):
        """
        Comparer deux versions

        Args:
            template_id: ID du template
            version1_number: Numéro de la première version
            version2_number: Numéro de la deuxième version
            user_id: ID de l'utilisateur

        Returns:
            dict: Comparaison des versions

        Raises:
            ValueError: Si versions non trouvées
        """
        # Récupérer les deux versions
        version1 = VersionService.get_version_by_number(
            template_id, version1_number, user_id
        )
        version2 = VersionService.get_version_by_number(
            template_id, version2_number, user_id
        )

        # Comparer les contenus
        html_changed = version1.html_content != version2.html_content
        css_changed = version1.css_content != version2.css_content

        return {
            'template_id': template_id,
            'version1': {
                'number': version1_number,
                'html_content': version1.html_content,
                'css_content': version1.css_content,
                'created_at': version1.created_at.isoformat(),
                'change_description': version1.change_description
            },
            'version2': {
                'number': version2_number,
                'html_content': version2.html_content,
                'css_content': version2.css_content,
                'created_at': version2.created_at.isoformat(),
                'change_description': version2.change_description
            },
            'differences': {
                'html_changed': html_changed,
                'css_changed': css_changed,
                'any_changes': html_changed or css_changed
            }
        }

    @staticmethod
    def get_latest_version(template_id, user_id):
        """
        Obtenir la dernière version d'un template

        Args:
            template_id: ID du template
            user_id: ID de l'utilisateur

        Returns:
            TemplateVersion: Dernière version

        Raises:
            ValueError: Si template non trouvé
        """
        # Vérifier l'accès
        template = EmailTemplate.query.filter_by(
            id=template_id,
            user_id=user_id
        ).first()

        if not template:
            raise ValueError('Template non trouvé ou accès non autorisé')

        return template.get_latest_version()

    @staticmethod
    def delete_version(template_id, version_number, user_id, ip_address=None):
        """
        Supprimer une version (sauf la version actuelle)

        Args:
            template_id: ID du template
            version_number: Numéro de version à supprimer
            user_id: ID de l'utilisateur
            ip_address: Adresse IP

        Returns:
            bool: True si succès

        Raises:
            ValueError: Si erreur
        """
        # Récupérer la version
        version = VersionService.get_version_by_number(
            template_id, version_number, user_id
        )

        # Récupérer le template pour vérifier
        template = EmailTemplate.query.get(template_id)
        latest_version = template.get_latest_version()

        # Ne pas permettre la suppression de la version actuelle
        if latest_version and latest_version.version_number == version_number:
            raise ValueError('Impossible de supprimer la version actuelle')

        # Supprimer la version
        db.session.delete(version)
        db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='VERSION_DELETED',
            entity_type='template',
            entity_id=template_id,
            details={'version_number': version_number},
            ip_address=ip_address
        )

        return True

    @staticmethod
    def get_version_statistics(template_id, user_id):
        """
        Obtenir les statistiques des versions

        Args:
            template_id: ID du template
            user_id: ID de l'utilisateur

        Returns:
            dict: Statistiques

        Raises:
            ValueError: Si template non trouvé
        """
        # Vérifier l'accès
        template = EmailTemplate.query.filter_by(
            id=template_id,
            user_id=user_id
        ).first()

        if not template:
            raise ValueError('Template non trouvé ou accès non autorisé')

        versions = TemplateVersion.get_template_versions(template_id)

        if not versions:
            return {
                'template_id': template_id,
                'total_versions': 0,
                'first_version': None,
                'latest_version': None
            }

        return {
            'template_id': template_id,
            'total_versions': len(versions),
            'first_version': {
                'number': versions[-1].version_number,
                'created_at': versions[-1].created_at.isoformat()
            },
            'latest_version': {
                'number': versions[0].version_number,
                'created_at': versions[0].created_at.isoformat(),
                'description': versions[0].change_description
            }
        }
