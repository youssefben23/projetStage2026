# ============================================
# FICHIER: backend/app/routes/template_routes.py
# Routes Templates - ULTRA CORRIGÉES
# ============================================
"""
Routes des templates - CRUD complet avec gestion CSS PARFAITE
"""

from flask import Blueprint, request, jsonify, current_app
from app.services.template_service import TemplateService
from app.services.version_service import VersionService
from app.services.validation_service import ValidationService
from app.utils.decorators import token_required, get_request_info
import traceback

template_bp = Blueprint('templates', __name__, url_prefix='/api/templates')


@template_bp.route('/', methods=['POST'])
@token_required
def create_template(current_user):
    """
    Créer un nouveau template - GARANTIT le CSS

    Body:
        {
            "nom": "Email de Bienvenue",
            "sujet": "Bienvenue",
            "html_content": "<html>...</html>",
            "css_content": "body { ... }",  // Peut être vide, null, ou absent
            "category": "Onboarding",
            "tags": ["bienvenue"]
        }
    """
    try:
        data = request.get_json()

        # Valider champs requis
        required_fields = ['nom', 'sujet', 'html_content']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'message': f'Le champ {field} est requis'
                }), 400

        # CORRECTION CRITIQUE: Normaliser CSS
        css_content = data.get('css_content', '')
        if css_content is None or not css_content:
            css_content = ''

        # Obtenir infos requête
        ip_address, user_agent = get_request_info(request)

        # Logger pour déboguer
        current_app.logger.info(
            f'🔵 CREATE Template: nom="{data["nom"]}", '
            f'html={len(data["html_content"])} chars, '
            f'css={len(css_content)} chars, '
            f'css_provided={data.get("css_content") is not None}'
        )

        # Créer le template
        template = TemplateService.create_template(
            user_id=current_user.id,
            nom=data['nom'],
            sujet=data['sujet'],
            html_content=data['html_content'],
            css_content=css_content,
            category=data.get('category'),
            tags=data.get('tags', []),
            ip_address=ip_address,
            user_agent=user_agent
        )

        # CORRECTION: Garantir CSS dans réponse
        response_data = template.to_dict(include_metadata=True, include_content=True)
        if 'css_content' not in response_data or response_data['css_content'] is None:
            response_data['css_content'] = ''

        current_app.logger.info(
            f'✅ Template {template.id} créé (CSS dans réponse: {len(response_data["css_content"])} chars)'
        )

        return jsonify({
            'success': True,
            'message': 'Template créé avec succès',
            'template': response_data
        }), 201

    except ValueError as e:
        current_app.logger.error(f'❌ Validation error: {str(e)}')
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        current_app.logger.error(f'❌ Error creating template: {str(e)}')
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Erreur lors de la création: {str(e)}'
        }), 500


@template_bp.route('/', methods=['GET'])
@token_required
def get_templates(current_user):
    """Récupérer tous les templates de l'utilisateur"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'

        result = TemplateService.get_user_templates(
            user_id=current_user.id,
            include_inactive=include_inactive,
            page=page,
            per_page=per_page
        )

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        current_app.logger.error(f'❌ Error fetching templates: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des templates'
        }), 500


@template_bp.route('/<int:template_id>', methods=['GET'])
@token_required
def get_template(current_user, template_id):
    """
    Récupérer un template par ID - GARANTIT CSS
    """
    try:
        template = TemplateService.get_template_by_id(template_id, current_user.id)

        # CORRECTION CRITIQUE: Garantir CSS dans réponse
        template_dict = template.to_dict(
            include_content=True,
            include_metadata=True,
            include_versions=False
        )

        # S'assurer que css_content est toujours présent
        if 'css_content' not in template_dict or template_dict['css_content'] is None:
            template_dict['css_content'] = ''

        current_app.logger.info(
            f'🔵 GET Template {template_id}: '
            f'css_length={len(template_dict["css_content"])} chars'
        )

        return jsonify({
            'success': True,
            'template': template_dict
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error fetching template {template_id}: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération du template'
        }), 500


@template_bp.route('/<int:template_id>', methods=['PUT'])
@token_required
def update_template(current_user, template_id):
    """
    Mettre à jour un template - GÈRE CSS PARFAITEMENT

    Body:
        {
            "nom": "Nouveau nom",
            "sujet": "Nouveau sujet",
            "html_content": "<html>...</html>",
            "css_content": "body { ... }",  // Peut être "", null, ou absent
            "change_description": "Description"
        }
    """
    try:
        data = request.get_json()

        # CORRECTION MAJEURE: Normaliser CSS
        if 'css_content' in data:
            css = data['css_content']
            if css is None or (isinstance(css, str) and not css.strip()):
                data['css_content'] = ''

            current_app.logger.info(
                f'🔵 UPDATE Template {template_id}: '
                f'css_provided={css is not None}, '
                f'css_is_empty={not data["css_content"]}, '
                f'css_length={len(data["css_content"])}'
            )

        # Obtenir infos requête
        ip_address, user_agent = get_request_info(request)
        data['ip_address'] = ip_address
        data['user_agent'] = user_agent

        # Mettre à jour
        template = TemplateService.update_template(
            template_id=template_id,
            user_id=current_user.id,
            **data
        )

        # CORRECTION: Garantir CSS dans réponse
        template_dict = template.to_dict(include_metadata=True, include_content=True)
        if 'css_content' not in template_dict or template_dict['css_content'] is None:
            template_dict['css_content'] = ''

        current_app.logger.info(
            f'✅ Template {template_id} mis à jour (CSS: {len(template_dict["css_content"])} chars)'
        )

        return jsonify({
            'success': True,
            'message': 'Template mis à jour avec succès',
            'template': template_dict
        }), 200

    except ValueError as e:
        current_app.logger.error(f'❌ Validation error: {str(e)}')
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        current_app.logger.error(f'❌ Error updating template {template_id}: {str(e)}')
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Erreur lors de la mise à jour: {str(e)}'
        }), 500


@template_bp.route('/<int:template_id>', methods=['DELETE'])
@token_required
def delete_template(current_user, template_id):
    """Supprimer un template"""
    try:
        soft = request.args.get('soft', 'true').lower() == 'true'

        TemplateService.delete_template(
            template_id=template_id,
            user_id=current_user.id,
            soft=soft
        )

        return jsonify({
            'success': True,
            'message': 'Template supprimé avec succès'
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error deleting template {template_id}: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la suppression'
        }), 500


@template_bp.route('/search', methods=['GET'])
@token_required
def search_templates(current_user):
    """Rechercher des templates"""
    try:
        query = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        if not query:
            return jsonify({
                'success': False,
                'message': 'Le paramètre "q" est requis'
            }), 400

        result = TemplateService.search_templates(
            user_id=current_user.id,
            query=query,
            page=page,
            per_page=per_page
        )

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        current_app.logger.error(f'❌ Error searching: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la recherche'
        }), 500


@template_bp.route('/<int:template_id>/duplicate', methods=['POST'])
@token_required
def duplicate_template(current_user, template_id):
    """Dupliquer un template"""
    try:
        data = request.get_json() or {}
        new_name = data.get('new_name')

        new_template = TemplateService.duplicate_template(
            template_id=template_id,
            user_id=current_user.id,
            new_name=new_name
        )

        return jsonify({
            'success': True,
            'message': 'Template dupliqué avec succès',
            'template': new_template.to_dict(include_content=True)
        }), 201

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error duplicating: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la duplication'
        }), 500


@template_bp.route('/<int:template_id>/validate', methods=['POST'])
@token_required
def validate_template(current_user, template_id):
    """Valider un template"""
    try:
        template = TemplateService.get_template_by_id(template_id, current_user.id)

        # CORRECTION: S'assurer que CSS est fourni
        css_content = template.css_content or ''

        result = ValidationService.validate_template(
            template.html_content,
            css_content
        )

        return jsonify({
            'success': True,
            'validation': result
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error validating: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la validation'
        }), 500


@template_bp.route('/<int:template_id>/preview', methods=['GET'])
@token_required
def preview_template(current_user, template_id):
    """Obtenir le HTML complet pour aperçu"""
    try:
        template = TemplateService.get_template_by_id(template_id, current_user.id)

        return jsonify({
            'success': True,
            'html': template.get_full_html()
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error generating preview: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la génération de l\'aperçu'
        }), 500


@template_bp.route('/<int:template_id>/versions', methods=['GET'])
@token_required
def get_template_versions(current_user, template_id):
    """Récupérer les versions d'un template"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        result = VersionService.get_template_versions(
            template_id=template_id,
            user_id=current_user.id,
            page=page,
            per_page=per_page
        )

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error fetching versions: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des versions'
        }), 500


@template_bp.route('/<int:template_id>/versions/<int:version_number>', methods=['GET'])
@token_required
def get_template_version(current_user, template_id, version_number):
    """Récupérer une version spécifique"""
    try:
        version = VersionService.get_version_by_number(
            template_id=template_id,
            version_number=version_number,
            user_id=current_user.id
        )

        return jsonify({
            'success': True,
            'version': version.to_dict(include_content=True)
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error fetching version: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération de la version'
        }), 500


@template_bp.route('/<int:template_id>/versions/<int:version_number>/restore', methods=['POST'])
@token_required
def restore_version(current_user, template_id, version_number):
    """Restaurer une version antérieure"""
    try:
        ip_address, user_agent = get_request_info(request)

        template = VersionService.restore_version(
            template_id=template_id,
            version_number=version_number,
            user_id=current_user.id,
            ip_address=ip_address,
            user_agent=user_agent
        )

        return jsonify({
            'success': True,
            'message': f'Version {version_number} restaurée avec succès',
            'template': template.to_dict()
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error restoring version: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la restauration'
        }), 500


@template_bp.route('/<int:template_id>/versions/compare', methods=['GET'])
@token_required
def compare_versions(current_user, template_id):
    """Comparer deux versions"""
    try:
        v1 = request.args.get('v1', type=int)
        v2 = request.args.get('v2', type=int)

        if not v1 or not v2:
            return jsonify({
                'success': False,
                'message': 'Les paramètres v1 et v2 sont requis'
            }), 400

        result = VersionService.compare_versions(
            template_id=template_id,
            version1_number=v1,
            version2_number=v2,
            user_id=current_user.id
        )

        return jsonify({
            'success': True,
            'comparison': result
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        current_app.logger.error(f'❌ Error comparing versions: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la comparaison'
        }), 500


@template_bp.route('/statistics', methods=['GET'])
@token_required
def get_statistics(current_user):
    """Obtenir les statistiques des templates"""
    try:
        stats = TemplateService.get_template_statistics(current_user.id)

        return jsonify({
            'success': True,
            'statistics': stats
        }), 200

    except Exception as e:
        current_app.logger.error(f'❌ Error fetching statistics: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des statistiques'
        }), 500
