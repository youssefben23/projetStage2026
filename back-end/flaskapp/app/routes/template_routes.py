# ============================================
# FICHIER: backend/app/routes/template_routes.py
# Routes des Templates
# ============================================
"""
Routes des templates - CRUD complet
"""

from flask import Blueprint, request, jsonify, current_app
from app.services.template_service import TemplateService
from app.services.version_service import VersionService
from app.services.validation_service import ValidationService
from app.utils.decorators import token_required, get_request_info

template_bp = Blueprint('templates', __name__, url_prefix='/api/templates')


@template_bp.route('/', methods=['POST'])
@token_required
def create_template(current_user):
    """
    Créer un nouveau template

    Headers:
        Authorization: Bearer <token>

    Body:
        {
            "nom": "Email de Bienvenue",
            "sujet": "Bienvenue sur notre plateforme",
            "html_content": "<html>...</html>",
            "css_content": "body { ... }",
            "category": "Onboarding",
            "tags": ["bienvenue", "inscription"]
        }

    Returns:
        201: Template créé
        400: Erreur de validation
    """
    try:
        data = request.get_json()

        # Valider les champs requis
        required_fields = ['nom', 'sujet', 'html_content']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Le champ {field} est requis'
                }), 400

        # Obtenir les infos de la requête
        ip_address, user_agent = get_request_info(request)

        # Créer le template
        template = TemplateService.create_template(
            user_id=current_user.id,
            nom=data['nom'],
            sujet=data['sujet'],
            html_content=data['html_content'],
            css_content=data.get('css_content', ''),
            category=data.get('category'),
            tags=data.get('tags', []),
            ip_address=ip_address,
            user_agent=user_agent
        )

        return jsonify({
            'success': True,
            'message': 'Template créé avec succès',
            'template': template.to_dict(include_metadata=True)
        }), 201

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        import traceback
        current_app.logger.error(f'Error creating template: {str(e)}')
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'message': f'Erreur lors de la création du template: {str(e)}'
        }), 500


@template_bp.route('/', methods=['GET'])
@token_required
def get_templates(current_user):
    """
    Récupérer tous les templates de l'utilisateur

    Headers:
        Authorization: Bearer <token>

    Query Params:
        page: Numéro de page (défaut: 1)
        per_page: Éléments par page (défaut: 20)
        include_inactive: Inclure les templates inactifs (défaut: false)

    Returns:
        200: Liste des templates
    """
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des templates'
        }), 500


@template_bp.route('/<int:template_id>', methods=['GET'])
@token_required
def get_template(current_user, template_id):
    """
    Récupérer un template par son ID

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Template trouvé
        404: Template non trouvé
    """
    try:
        template = TemplateService.get_template_by_id(template_id, current_user.id)

        return jsonify({
            'success': True,
            'template': template.to_dict(
                include_content=True,
                include_metadata=True,
                include_versions=True
            )
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération du template'
        }), 500


@template_bp.route('/<int:template_id>', methods=['PUT'])
@token_required
def update_template(current_user, template_id):
    """
    Mettre à jour un template

    Headers:
        Authorization: Bearer <token>

    Body:
        {
            "nom": "Nouveau nom",
            "sujet": "Nouveau sujet",
            "html_content": "<html>...</html>",
            "css_content": "body { ... }",
            "change_description": "Description des changements"
        }

    Returns:
        200: Template mis à jour
        400: Erreur de validation
        404: Template non trouvé
    """
    try:
        data = request.get_json()

        # Obtenir les infos de la requête
        ip_address, user_agent = get_request_info(request)

        # Ajouter les infos de requête aux kwargs
        data['ip_address'] = ip_address
        data['user_agent'] = user_agent

        # Mettre à jour
        template = TemplateService.update_template(
            template_id=template_id,
            user_id=current_user.id,
            **data
        )

        return jsonify({
            'success': True,
            'message': 'Template mis à jour avec succès',
            'template': template.to_dict(include_metadata=True)
        }), 200

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la mise à jour du template'
        }), 500


@template_bp.route('/<int:template_id>', methods=['DELETE'])
@token_required
def delete_template(current_user, template_id):
    """
    Supprimer un template

    Headers:
        Authorization: Bearer <token>

    Query Params:
        soft: Suppression logique (défaut: true)

    Returns:
        200: Template supprimé
        404: Template non trouvé
    """
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la suppression du template'
        }), 500


@template_bp.route('/search', methods=['GET'])
@token_required
def search_templates(current_user):
    """
    Rechercher des templates

    Headers:
        Authorization: Bearer <token>

    Query Params:
        q: Terme de recherche
        page: Numéro de page (défaut: 1)
        per_page: Éléments par page (défaut: 20)

    Returns:
        200: Résultats de recherche
    """
    try:
        query = request.args.get('q', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        if not query:
            return jsonify({
                'success': False,
                'message': 'Le paramètre de recherche "q" est requis'
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la recherche'
        }), 500


@template_bp.route('/<int:template_id>/duplicate', methods=['POST'])
@token_required
def duplicate_template(current_user, template_id):
    """
    Dupliquer un template

    Headers:
        Authorization: Bearer <token>

    Body (optionnel):
        {
            "new_name": "Nom du nouveau template"
        }

    Returns:
        201: Template dupliqué
        404: Template non trouvé
    """
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
            'template': new_template.to_dict()
        }), 201

    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la duplication'
        }), 500


@template_bp.route('/<int:template_id>/validate', methods=['POST'])
@token_required
def validate_template(current_user, template_id):
    """
    Valider un template

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Résultat de validation
        404: Template non trouvé
    """
    try:
        template = TemplateService.get_template_by_id(template_id, current_user.id)

        result = ValidationService.validate_template(
            template.html_content,
            template.css_content
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la validation'
        }), 500


@template_bp.route('/<int:template_id>/preview', methods=['GET'])
@token_required
def preview_template(current_user, template_id):
    """
    Obtenir le HTML complet pour aperçu

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: HTML complet
        404: Template non trouvé
    """
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la génération de l\'aperçu'
        }), 500


@template_bp.route('/<int:template_id>/versions', methods=['GET'])
@token_required
def get_template_versions(current_user, template_id):
    """
    Récupérer les versions d'un template

    Headers:
        Authorization: Bearer <token>

    Query Params:
        page: Numéro de page (défaut: 1)
        per_page: Éléments par page (défaut: 20)

    Returns:
        200: Liste des versions
        404: Template non trouvé
    """
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des versions'
        }), 500


@template_bp.route('/<int:template_id>/versions/<int:version_number>', methods=['GET'])
@token_required
def get_template_version(current_user, template_id, version_number):
    """
    Récupérer une version spécifique

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Version trouvée
        404: Version non trouvée
    """
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération de la version'
        }), 500


@template_bp.route('/<int:template_id>/versions/<int:version_number>/restore', methods=['POST'])
@token_required
def restore_version(current_user, template_id, version_number):
    """
    Restaurer une version antérieure

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Version restaurée
        404: Version non trouvée
    """
    try:
        # Obtenir les infos de la requête
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la restauration'
        }), 500


@template_bp.route('/<int:template_id>/versions/compare', methods=['GET'])
@token_required
def compare_versions(current_user, template_id):
    """
    Comparer deux versions

    Headers:
        Authorization: Bearer <token>

    Query Params:
        v1: Numéro de la première version
        v2: Numéro de la deuxième version

    Returns:
        200: Comparaison des versions
        400: Paramètres manquants
        404: Versions non trouvées
    """
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
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la comparaison'
        }), 500


@template_bp.route('/statistics', methods=['GET'])
@token_required
def get_statistics(current_user):
    """
    Obtenir les statistiques des templates de l'utilisateur

    Headers:
        Authorization: Bearer <token>

    Returns:
        200: Statistiques
    """
    try:
        stats = TemplateService.get_template_statistics(current_user.id)

        return jsonify({
            'success': True,
            'statistics': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur lors de la récupération des statistiques'
        }), 500
