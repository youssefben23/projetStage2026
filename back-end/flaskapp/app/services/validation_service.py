# ============================================
# FICHIER: backend/app/services/validation_service.py
# Service de Validation HTML/CSS
# ============================================
"""
Service de validation - Valide le HTML et CSS
"""

import re
from html.parser import HTMLParser


class HTMLValidator(HTMLParser):
    """Parser HTML personnalisé pour validation"""

    def __init__(self):
        super().__init__()
        self.errors = []
        self.warnings = []
        self.tags_stack = []
        self.forbidden_tags = ['script', 'iframe', 'object', 'embed', 'applet']
        self.forbidden_attributes = ['onclick', 'onerror', 'onload', 'onmouseover']

    def handle_starttag(self, tag, attrs):
        """Gérer les balises ouvrantes"""
        # Vérifier les balises interdites
        if tag.lower() in self.forbidden_tags:
            self.errors.append(f"Balise interdite: <{tag}>")
            return

        # Vérifier les attributs interdits
        for attr_name, attr_value in attrs:
            if attr_name.lower() in self.forbidden_attributes:
                self.errors.append(f"Attribut interdit: {attr_name} dans <{tag}>")

        # Empiler les balises non auto-fermantes
        if tag.lower() not in ['br', 'hr', 'img', 'input', 'meta', 'link']:
            self.tags_stack.append(tag)

    def handle_endtag(self, tag):
        """Gérer les balises fermantes"""
        if self.tags_stack and self.tags_stack[-1] == tag:
            self.tags_stack.pop()
        elif tag not in ['br', 'hr', 'img', 'input', 'meta', 'link']:
            self.warnings.append(f"Balise fermante sans ouverture: </{tag}>")

    def handle_data(self, data):
        """Gérer le contenu texte"""
        # Vérifier les scripts inline
        if '<script' in data.lower():
            self.errors.append("Script inline détecté dans le contenu")

    def get_unclosed_tags(self):
        """Récupérer les balises non fermées"""
        return self.tags_stack.copy()


class ValidationService:
    """Service de validation HTML/CSS"""

    # Taille maximale du contenu (5 MB)
    MAX_CONTENT_SIZE = 5 * 1024 * 1024

    # Patterns CSS dangereux
    DANGEROUS_CSS_PATTERNS = [
        r'javascript:',
        r'expression\s*\(',
        r'import\s+',
        r'@import',
        r'behavior\s*:',
    ]

    @staticmethod
    def validate_html(html_content):
        """
        Valider le contenu HTML

        Args:
            html_content: Contenu HTML à valider

        Returns:
            tuple: (is_valid, errors, warnings)
        """
        errors = []
        warnings = []

        # Vérifier la taille
        if len(html_content) > ValidationService.MAX_CONTENT_SIZE:
            errors.append(f"Contenu trop volumineux (max {ValidationService.MAX_CONTENT_SIZE / 1024 / 1024} MB)")
            return False, errors, warnings

        # Vérifier le contenu vide
        if not html_content or not html_content.strip():
            errors.append("Le contenu HTML est vide")
            return False, errors, warnings

        # Parser le HTML
        validator = HTMLValidator()
        try:
            validator.feed(html_content)
        except Exception as e:
            errors.append(f"Erreur de parsing HTML: {str(e)}")
            return False, errors, warnings

        # Récupérer les erreurs et warnings du parser
        errors.extend(validator.errors)
        warnings.extend(validator.warnings)

        # Vérifier les balises non fermées
        unclosed = validator.get_unclosed_tags()
        if unclosed:
            warnings.append(f"Balises potentiellement non fermées: {', '.join(unclosed)}")

        # Vérifier la structure de base
        if not re.search(r'<body', html_content, re.IGNORECASE):
            warnings.append("Balise <body> manquante - recommandée pour un HTML complet")

        is_valid = len(errors) == 0

        return is_valid, errors, warnings

    @staticmethod
    def validate_css(css_content):
        """
        Valider le contenu CSS

        Args:
            css_content: Contenu CSS à valider

        Returns:
            tuple: (is_valid, errors, warnings)
        """
        errors = []
        warnings = []

        # Vérifier la taille
        if len(css_content) > ValidationService.MAX_CONTENT_SIZE:
            errors.append(f"Contenu CSS trop volumineux (max {ValidationService.MAX_CONTENT_SIZE / 1024 / 1024} MB)")
            return False, errors, warnings

        # Si CSS vide, c'est valide
        if not css_content or not css_content.strip():
            return True, errors, warnings

        # Vérifier les patterns dangereux
        for pattern in ValidationService.DANGEROUS_CSS_PATTERNS:
            if re.search(pattern, css_content, re.IGNORECASE):
                errors.append(f"Pattern CSS dangereux détecté: {pattern}")

        # Vérifier les accolades équilibrées
        open_braces = css_content.count('{')
        close_braces = css_content.count('}')

        if open_braces != close_braces:
            errors.append(f"Accolades non équilibrées: {open_braces} ouvrantes, {close_braces} fermantes")

        # Vérifier les URLs externes
        external_urls = re.findall(r'url\s*\(\s*["\']?(https?://[^"\')\s]+)', css_content, re.IGNORECASE)
        if external_urls:
            warnings.append(
                f"URLs externes détectées: {len(external_urls)} - peuvent ne pas fonctionner dans les emails")

        is_valid = len(errors) == 0

        return is_valid, errors, warnings

    @staticmethod
    def validate_template(html_content, css_content=''):
        """
        Valider un template complet (HTML + CSS)

        Args:
            html_content: Contenu HTML
            css_content: Contenu CSS

        Returns:
            dict: Résultat de validation complet
        """
        html_valid, html_errors, html_warnings = ValidationService.validate_html(html_content)
        css_valid, css_errors, css_warnings = ValidationService.validate_css(css_content)

        is_valid = html_valid and css_valid

        all_errors = []
        if html_errors:
            all_errors.extend([{'type': 'html', 'message': err} for err in html_errors])
        if css_errors:
            all_errors.extend([{'type': 'css', 'message': err} for err in css_errors])

        all_warnings = []
        if html_warnings:
            all_warnings.extend([{'type': 'html', 'message': warn} for warn in html_warnings])
        if css_warnings:
            all_warnings.extend([{'type': 'css', 'message': warn} for warn in css_warnings])

        return {
            'is_valid': is_valid,
            'html_valid': html_valid,
            'css_valid': css_valid,
            'errors': all_errors,
            'warnings': all_warnings,
            'error_count': len(all_errors),
            'warning_count': len(all_warnings)
        }

    @staticmethod
    def sanitize_html(html_content):
        """
        Nettoyer le HTML (supprimer les éléments dangereux)

        Args:
            html_content: Contenu HTML à nettoyer

        Returns:
            str: HTML nettoyé
        """
        # Supprimer les balises script
        html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.IGNORECASE | re.DOTALL)

        # Supprimer les attributs d'événements
        html_content = re.sub(r'\s+on\w+\s*=\s*["\'][^"\']*["\']', '', html_content, flags=re.IGNORECASE)

        # Supprimer les iframes
        html_content = re.sub(r'<iframe[^>]*>.*?</iframe>', '', html_content, flags=re.IGNORECASE | re.DOTALL)

        return html_content

    @staticmethod
    def get_validation_summary(html_content, css_content=''):
        """
        Obtenir un résumé de validation lisible

        Args:
            html_content: Contenu HTML
            css_content: Contenu CSS

        Returns:
            str: Résumé textuel
        """
        result = ValidationService.validate_template(html_content, css_content)

        if result['is_valid']:
            return "✅ Template valide"
        else:
            summary = f"❌ Template invalide - {result['error_count']} erreur(s)"
            if result['warning_count'] > 0:
                summary += f", {result['warning_count']} avertissement(s)"
            return summary
