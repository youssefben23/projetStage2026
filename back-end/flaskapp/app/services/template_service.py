# ============================================
# FICHIER: backend/app/services/template_service.py
# Service Template - VERSION ULTRA CORRIGÉE
# ============================================
"""
Service de gestion des templates - CORRIGÉ pour CSS et validation
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
    """Service gérant les templates - VERSION CORRIGÉE"""

    @staticmethod
    def create_template(user_id, nom, sujet, html_content, css_content='',
                        category=None, tags=None, ip_address=None, user_agent=None):
        """
        Créer un nouveau template - NE BLOQUE JAMAIS

        Args:
            css_content: Peut être None, '', ou une valeur
        """
        # Validation des champs requis
        if not nom or not nom.strip():
            raise ValueError('Le nom du template est requis')
        if not sujet or not sujet.strip():
            raise ValueError('Le sujet est requis')
        if not html_content or not html_content.strip():
            raise ValueError('Le contenu HTML est requis')

        # CORRECTION CRITIQUE: Normaliser le CSS
        # None → '', chaîne vide → '', whitespace only → ''
        if css_content is None:
            css_content = ''
        elif isinstance(css_content, str) and not css_content.strip():
            css_content = ''

        current_app.logger.info(
            f'Creating template: nom="{nom}", '
            f'html_length={len(html_content)}, '
            f'css_length={len(css_content)}, '
            f'css_is_empty={not css_content}'
        )

        # Valider (ne bloque JAMAIS, juste enregistre)
        validation_result = ValidationService.validate_template(html_content, css_content)

        if not validation_result['is_valid']:
            current_app.logger.warning(
                f"Template créé avec {validation_result['error_count']} erreur(s) de validation - "
                f"AUTORISÉ car validation permissive"
            )

        # Créer le template
        template = EmailTemplate(
            user_id=user_id,
            nom=nom.strip(),
            sujet=sujet.strip(),
            html_content=html_content,
            css_content=css_content  # Toujours une chaîne, jamais None
        )

        db.session.add(template)
        db.session.flush()

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

        # Sauvegarder résultat de validation (pour info)
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

        try:
            db.session.commit()
            current_app.logger.info(
                f'✅ Template {template.id} créé avec succès (CSS: {len(css_content)} chars)'
            )
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'❌ Erreur création template: {str(e)}')
            raise ValueError(f'Erreur sauvegarde: {str(e)}')

        # Logger activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_CREATED',
            entity_type='template',
            entity_id=template.id,
            details={
                'nom': nom,
                'has_css': bool(css_content),
                'css_length': len(css_content),
                'validation_status': 'valid' if validation_result['is_valid'] else 'invalid_but_allowed'
            },
            ip_address=ip_address,
            user_agent=user_agent
        )

        return template

    @staticmethod
    def update_template(template_id, user_id, **kwargs):
        """Mettre à jour un template - CORRIGÉ pour CSS"""
        template = TemplateService.get_template_by_id(template_id, user_id)

        # CORRECTION CRITIQUE: Normaliser CSS
        if 'css_content' in kwargs:
            css = kwargs['css_content']
            if css is None or (isinstance(css, str) and not css.strip()):
                kwargs['css_content'] = ''
            current_app.logger.info(
                f'Updating template {template_id}: css_provided={css is not None}, '
                f'css_length={len(kwargs["css_content"])}'
            )

        # Vérifier si contenu changé
        content_changed = (
            'html_content' in kwargs and kwargs['html_content'] != template.html_content
        ) or (
            'css_content' in kwargs and kwargs.get('css_content', '') != (template.css_content or '')
        )

        if content_changed:
            html = kwargs.get('html_content', template.html_content)
            css = kwargs.get('css_content', template.css_content or '')

            # Valider (ne bloque JAMAIS)
            validation_result = ValidationService.validate_template(html, css)

            if not validation_result['is_valid']:
                current_app.logger.warning(
                    f"Template {template_id} mis à jour avec {validation_result['error_count']} erreur(s) - "
                    f"AUTORISÉ"
                )

            # Créer nouvelle version
            new_version_number = TemplateVersion.get_next_version_number(template_id)

            version = TemplateVersion(
                template_id=template_id,
                version_number=new_version_number,
                html_content=html,
                css_content=css,
                change_description=kwargs.get('change_description', f'Mise à jour - Version {new_version_number}'),
                created_by=user_id,
                ip_address=kwargs.get('ip_address'),
                user_agent=kwargs.get('user_agent')
            )

            # Sauvegarder validation
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

        # Mettre à jour champs autorisés
        allowed_fields = ['nom', 'sujet', 'html_content', 'css_content']
        updated_fields = []

        for field in allowed_fields:
            if field in kwargs:
                old_value = getattr(template, field)
                new_value = kwargs[field]

                # CORRECTION: Gérer None pour CSS
                if field == 'css_content':
                    old_value = old_value or ''
                    new_value = new_value or ''

                if old_value != new_value:
                    setattr(template, field, new_value)
                    updated_fields.append(field)

        try:
            db.session.commit()
            current_app.logger.info(
                f'✅ Template {template_id} mis à jour: {updated_fields}, '
                f'CSS={len(template.css_content or "")} chars'
            )
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f'❌ Erreur mise à jour: {str(e)}')
            raise ValueError(f'Erreur sauvegarde: {str(e)}')

        # Logger activité
        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_UPDATED',
            entity_type='template',
            entity_id=template_id,
            details={
                'fields': updated_fields,
                'has_css': bool(template.css_content)
            },
            ip_address=kwargs.get('ip_address'),
            user_agent=kwargs.get('user_agent')
        )

        return template

    @staticmethod
    def get_template_by_id(template_id, user_id=None):
        """Récupérer un template par ID"""
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
    def get_user_templates(user_id, include_inactive=False, page=1, per_page=20):
        """Récupérer les templates d'un utilisateur"""
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
    def delete_template(template_id, user_id, soft=True):
        """Supprimer un template"""
        template = TemplateService.get_template_by_id(template_id, user_id)

        if soft:
            template.soft_delete()
        else:
            db.session.delete(template)
            db.session.commit()

        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_DELETED',
            entity_type='template',
            entity_id=template_id,
            details={'soft_delete': soft, 'nom': template.nom}
        )

        current_app.logger.info(f'Template {template_id} deleted (soft={soft})')
        return True

    @staticmethod
    def search_templates(user_id, query, page=1, per_page=20):
        """Rechercher des templates"""
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
        """Dupliquer un template"""
        original = TemplateService.get_template_by_id(template_id, user_id)

        new_template = TemplateService.create_template(
            user_id=user_id,
            nom=new_name or f"{original.nom} (copie)",
            sujet=original.sujet,
            html_content=original.html_content,
            css_content=original.css_content or '',
            category=original.template_metadata.category if original.template_metadata else None,
            tags=original.template_metadata.tags if original.template_metadata else None
        )

        ActivityLog.log_activity(
            user_id=user_id,
            action='TEMPLATE_DUPLICATED',
            entity_type='template',
            entity_id=new_template.id,
            details={'original_id': template_id}
        )

        return new_template

    @staticmethod
    def get_template_statistics(user_id):
        """Obtenir statistiques"""
        return EmailTemplate.get_user_statistics(user_id)
