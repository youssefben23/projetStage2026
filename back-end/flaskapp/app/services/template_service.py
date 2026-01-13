# ============================================
# FICHIER: backend/app/services/template_service.py
# Service de Gestion des Templates
# ============================================
"""
Service de gestion des templates - Logique métier
"""

from flask import current_app
from app import db
from app.models.email_template import EmailTemplate
from app.models.template_version import TemplateVersion
from app.models.template_metadata import TemplateMetadata
from app.models.validation_result import ValidationResult
from app.models.activity_log import ActivityLog
from app.services.validation_service import ValidationService


class TemplateService:
    """Service gérant les templates d'emails"""

    @staticmethod
    def create_template(user_id, nom, sujet, html_content, css_content='',
                        category=None, tags=None, ip_address=None, user_agent=None):
        """
        Créer un nouveau template

        Args:
            user_id: ID de l'utilisateur
            nom: Nom du template
            sujet: Sujet de l'email
            html_content: Contenu HTML
            css_content: Contenu CSS
            category: Catégorie
            tags: Liste de tags
            ip_address: IP de l'utilisateur
            user_agent: User agent

        Returns:
            EmailTemplate: Template créé

        Raises:
            ValueError: Si données invalides
        """
        # Validation des champs requis
        if not nom or not nom.strip():
            raise ValueError('Le nom du template est requis')

        if not sujet or not sujet.strip():
            raise ValueError('Le sujet est requis')

        if not html_content or not html_content.strip():
            raise ValueError('Le contenu HTML est requis')

        # Valider le HTML et CSS (mais ne pas bloquer la création si invalide)
        validation_result = ValidationService.validate_template(html_content, css_content)

        # On permet la création même si invalide, mais on enregistre le résultat
        # if not validation_result['is_valid']:
        #     error_messages = [err['message'] for err in validation_result['errors']]
        #     raise ValueError(f"Template invalide: {'; '.join(error_messages)}")

        # Créer le template
        template = EmailTemplate(
            user_id=user_id,
            nom=nom.strip(),
            sujet=sujet.strip(),
            html_content=html_content,
            css_content=css_content
        )

        db.session.add(template)
        db.session.flush()  # Pour obtenir l'ID

        # Créer la version initiale
        version = TemplateVersion(
            template_id=template.id,
            version_number=1,
            html_content=html_content,
            css_content=css_content,
            change_description='Version initiale',
            created_by=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Créer les métadonnées
        metadata = TemplateMetadata(
            template_id=template.id,
            category=category,
            tags=tags or []
        )

        # Sauvegarder le résultat de validation
        validation = ValidationResult(
            template_id=template.id,
            is_valid=validation_result['is_valid'],
            html_valid=validation_result['html_valid'],
            css_valid=validation_result['css_valid'],
            errors=validation_result['errors'],
            warnings=validation_result['warnings']
        )

        db.session.add(version)
        db.session.add(metadata)
        db.session.add(validation)
        db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_CREATED',
            entity_type='template',
            entity_id=template.id,
            details={'nom': nom, 'sujet': sujet},
            ip_address=ip_address,
            user_agent=user_agent
        )

        current_app.logger.info(f'Template created: {template.id} by user {user_id}')

        return template

    @staticmethod
    def get_user_templates(user_id, include_inactive=False, page=1, per_page=20):
        """
        Récupérer les templates d'un utilisateur

        Args:
            user_id: ID de l'utilisateur
            include_inactive: Inclure les templates inactifs
            page: Numéro de page
            per_page: Nombre d'éléments par page

        Returns:
            dict: {'templates': [], 'total': int, 'pages': int}
        """
        query = EmailTemplate.query.filter_by(user_id=user_id)

        if not include_inactive:
            query = query.filter_by(is_active=True)

        query = query.order_by(db.desc('updated_at'))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'templates': [t.to_summary_dict() for t in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'per_page': per_page
        }

    @staticmethod
    def get_template_by_id(template_id, user_id=None):
        """
        Récupérer un template par son ID

        Args:
            template_id: ID du template
            user_id: ID de l'utilisateur (pour vérifier la propriété)

        Returns:
            EmailTemplate: Template ou None

        Raises:
            ValueError: Si template non trouvé ou non autorisé
        """
        if user_id:
            template = EmailTemplate.query.filter_by(
                id=template_id,
                user_id=user_id
            ).first()
        else:
            template = EmailTemplate.query.get(template_id)

        if not template:
            raise ValueError('Template non trouvé ou accès non autorisé')

        return template

    @staticmethod
    def update_template(template_id, user_id, **kwargs):
        """
        Mettre à jour un template

        Args:
            template_id: ID du template
            user_id: ID de l'utilisateur
            **kwargs: Champs à mettre à jour

        Returns:
            EmailTemplate: Template mis à jour
        """
        template = TemplateService.get_template_by_id(template_id, user_id)

        # Vérifier si le contenu a changé
        content_changed = (
            'html_content' in kwargs and kwargs['html_content'] != template.html_content
        ) or (
            'css_content' in kwargs and kwargs.get('css_content', '') != template.css_content
        )

        # Valider si le contenu a changé
        if content_changed:
            html = kwargs.get('html_content', template.html_content)
            css = kwargs.get('css_content', template.css_content)

            validation_result = ValidationService.validate_template(html, css)

            if not validation_result['is_valid']:
                error_messages = [err['message'] for err in validation_result['errors']]
                raise ValueError(f"Template invalide: {'; '.join(error_messages)}")

            # Créer une nouvelle version
            new_version_number = TemplateVersion.get_next_version_number(template_id)

            version = TemplateVersion(
                template_id=template_id,
                version_number=new_version_number,
                html_content=html,
                css_content=css,
                change_description=kwargs.get('change_description', 'Mise à jour'),
                created_by=user_id,
                ip_address=kwargs.get('ip_address'),
                user_agent=kwargs.get('user_agent')
            )

            # Sauvegarder nouveau résultat de validation
            validation = ValidationResult(
                template_id=template_id,
                is_valid=validation_result['is_valid'],
                html_valid=validation_result['html_valid'],
                css_valid=validation_result['css_valid'],
                errors=validation_result['errors'],
                warnings=validation_result['warnings']
            )

            db.session.add(version)
            db.session.add(validation)

        # Mettre à jour les champs autorisés
        allowed_fields = ['nom', 'sujet', 'html_content', 'css_content']

        for field in allowed_fields:
            if field in kwargs:
                setattr(template, field, kwargs[field])

        db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_UPDATED',
            entity_type='template',
            entity_id=template_id,
            details={'fields': list(kwargs.keys())},
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent')
        )

        return template

    @staticmethod
    def delete_template(template_id, user_id, soft=True):
        """
        Supprimer un template

        Args:
            template_id: ID du template
            user_id: ID de l'utilisateur
            soft: Suppression logique (True) ou physique (False)

        Returns:
            bool: True si succès
        """
        template = TemplateService.get_template_by_id(template_id, user_id)

        if soft:
            template.soft_delete()
        else:
            db.session.delete(template)
            db.session.commit()

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_DELETED',
            entity_type='template',
            entity_id=template_id,
            details={'soft_delete': soft, 'nom': template.nom}
        )

        current_app.logger.info(f'Template deleted: {template_id} by user {user_id}')

        return True

    @staticmethod
    def search_templates(user_id, query, page=1, per_page=20):
        """
        Rechercher des templates

        Args:
            user_id: ID de l'utilisateur
            query: Terme de recherche
            page: Numéro de page
            per_page: Éléments par page

        Returns:
            dict: Résultats paginés
        """
        search = f"%{query}%"

        templates_query = EmailTemplate.query.filter(
            EmailTemplate.user_id == user_id,
            EmailTemplate.is_active,
        ).filter(
            (EmailTemplate.nom.like(search)) | (EmailTemplate.sujet.like(search))
        ).order_by(db.desc('updated_at'))

        pagination = templates_query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'templates': [t.to_summary_dict() for t in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'page': page,
            'query': query
        }

    @staticmethod
    def duplicate_template(template_id, user_id, new_name=None):
        """
        Dupliquer un template

        Args:
            template_id: ID du template à dupliquer
            user_id: ID de l'utilisateur
            new_name: Nouveau nom (optionnel)

        Returns:
            EmailTemplate: Nouveau template
        """
        original = TemplateService.get_template_by_id(template_id, user_id)

        new_template = TemplateService.create_template(
            user_id=user_id,
            nom=new_name or f"{original.nom} (copie)",
            sujet=original.sujet,
            html_content=original.html_content,
            css_content=original.css_content,
            category=original.template_metadata.category if original.template_metadata else None,
            tags=original.template_metadata.tags if original.template_metadata else None
        )

        # Logger l'activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_DUPLICATED',
            entity_type='template',
            entity_id=new_template.id,
            details={'original_id': template_id, 'original_nom': original.nom}
        )

        return new_template

    @staticmethod
    def get_template_statistics(user_id):
        """
        Obtenir les statistiques des templates d'un utilisateur

        Args:
            user_id: ID de l'utilisateur

        Returns:
            dict: Statistiques
        """
        return EmailTemplate.get_user_statistics(user_id)
