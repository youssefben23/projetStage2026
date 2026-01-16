# ============================================
# FICHIER: backend/app/services/validation_service.py
# Service de Validation HTML/CSS - VERSION ULTRA CORRIGÉE
# ============================================
"""
Service de validation - PERMISSIF et ne bloque JAMAIS la création
"""

import re
from html.parser import HTMLParser


class HTMLValidator(HTMLParser):
    """Parser HTML personnalisé pour validation PERMISSIVE"""

    def __init__(self):
        super().__init__()
        self.errors = []
        self.warnings = []
        self.tags_stack = []
        # CORRECTION: Seulement les balises VRAIMENT dangereuses
        self.forbidden_tags = ['script', 'iframe', 'object', 'embed', 'applet', 'form']
        # CORRECTION: Attributs JS deviennent des warnings, pas des erreurs
        self.suspicious_attributes = ['onclick', 'onerror', 'onload', 'onmouseover']

    def handle_starttag(self, tag, attrs):
        """Gérer les balises ouvrantes"""
        # Vérifier les balises interdites (erreurs bloquantes)
        if tag.lower() in self.forbidden_tags:
            self.errors.append(f"Balise interdite: <{tag}>")
            return

        # CORRECTION: Attributs suspects = warnings seulement
        for attr_name, attr_value in attrs:
            if attr_name.lower() in self.suspicious_attributes:
                self.warnings.append(
                    f"Attribut JavaScript inline: {attr_name} dans <{tag}> "
                    f"(peut ne pas fonctionner dans les emails)"
                )

        # Empiler les balises non auto-fermantes
        if tag.lower() not in ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'source', 'track', 'wbr']:
            self.tags_stack.append(tag)

    def handle_endtag(self, tag):
        """Gérer les balises fermantes"""
        if self.tags_stack and self.tags_stack[-1] == tag:
            self.tags_stack.pop()
        elif tag not in ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'source', 'track', 'wbr']:
            # CORRECTION: Warning seulement, pas erreur
            self.warnings.append(f"Balise fermante sans ouverture: </{tag}>")

    def handle_data(self, data):
        """Gérer le contenu texte"""
        # Vérifier les scripts inline cachés
        if '<script' in data.lower() or 'javascript:' in data.lower():
            self.errors.append("Script inline détecté dans le contenu")

    def get_unclosed_tags(self):
        """Récupérer les balises non fermées"""
        return self.tags_stack.copy()


class ValidationService:
    """Service de validation HTML/CSS - VERSION PERMISSIVE"""

    # CORRECTION: Augmenter la taille max (10 MB au lieu de 5)
    MAX_CONTENT_SIZE = 10 * 1024 * 1024

    # CORRECTION: Seulement les patterns VRAIMENT dangereux
    DANGEROUS_CSS_PATTERNS = [
        r'javascript:',
        r'expression\s*\(',
        r'behavior\s*:',
        r'<script',
        r'</script>',
    ]

    @staticmethod
    def validate_html(html_content):
        """
        Valider le contenu HTML - PERMISSIF

        Returns:
            tuple: (is_valid, errors, warnings)
        """
        errors = []
        warnings = []

        # Vérifier la taille
        if len(html_content) > ValidationService.MAX_CONTENT_SIZE:
            errors.append(
                f"Contenu trop volumineux: {len(html_content) / 1024 / 1024:.2f} MB "
                f"(max {ValidationService.MAX_CONTENT_SIZE / 1024 / 1024} MB)"
            )
            return False, errors, warnings

        # Vérifier le contenu vide
        if not html_content or not html_content.strip():
            errors.append("Le contenu HTML est vide")
            return False, errors, warnings

        # Parser le HTML (ne pas bloquer sur erreurs de parsing)
        validator = HTMLValidator()
        try:
            validator.feed(html_content)
        except Exception as e:
            # CORRECTION: Erreur de parsing = warning seulement
            warnings.append(f"HTML mal formé (non bloquant): {str(e)[:100]}")

        # Récupérer les erreurs et warnings
        errors.extend(validator.errors)
        warnings.extend(validator.warnings)

        # CORRECTION: Balises non fermées = warning seulement
        unclosed = validator.get_unclosed_tags()
        if unclosed:
            warnings.append(
                f"Balises potentiellement non fermées: {', '.join(set(unclosed))} "
                f"(peut causer des problèmes d'affichage)"
            )

        # CORRECTION: Suggestions informatives uniquement
        if not re.search(r'<body', html_content, re.IGNORECASE):
            warnings.append(
                "Balise <body> manquante (sera ajoutée automatiquement)"
            )

        # CORRECTION: On ne bloque QUE sur les erreurs GRAVES
        is_valid = len(errors) == 0

        return is_valid, errors, warnings

    @staticmethod
    def validate_css(css_content):
        """
        Valider le contenu CSS - PERMISSIF

        Returns:
            tuple: (is_valid, errors, warnings)
        """
        errors = []
        warnings = []

        # Vérifier la taille
        if len(css_content) > ValidationService.MAX_CONTENT_SIZE:
            errors.append(
                f"Contenu CSS trop volumineux: {len(css_content) / 1024 / 1024:.2f} MB"
            )
            return False, errors, warnings

        # CORRECTION: CSS vide est PARFAITEMENT valide
        if not css_content or not css_content.strip():
            return True, errors, warnings

        # Vérifier les patterns VRAIMENT dangereux
        for pattern in ValidationService.DANGEROUS_CSS_PATTERNS:
            matches = re.findall(pattern, css_content, re.IGNORECASE)
            if matches:
                errors.append(f"Pattern CSS dangereux: '{pattern}'")

        # CORRECTION: Accolades = warning seulement
        open_braces = css_content.count('{')
        close_braces = css_content.count('}')
        if open_braces != close_braces:
            warnings.append(
                f"Accolades non équilibrées: {open_braces} vs {close_braces} "
                f"(peut causer des problèmes)"
            )

        # CORRECTION: @import = warning informatif
        if re.search(r'@import', css_content, re.IGNORECASE):
            warnings.append(
                "@import détecté - peut ne pas fonctionner dans les emails"
            )

        # CORRECTION: URLs externes = info seulement
        external_urls = re.findall(r'url\s*\(\s*["\']?(https?://[^"\')\s]+)', css_content, re.IGNORECASE)
        if external_urls:
            unique_domains = set([url.split('/')[2] for url in external_urls])
            warnings.append(
                f"URLs externes: {len(external_urls)} ({len(unique_domains)} domaines) - "
                f"assurez-vous qu'elles sont accessibles"
            )

        # CORRECTION: On ne bloque QUE sur erreurs graves
        is_valid = len(errors) == 0

        return is_valid, errors, warnings

    @staticmethod
    def validate_template(html_content, css_content=''):
        """
        Valider un template complet - PERMISSIF

        Returns:
            dict: Résultat de validation complet
        """
        html_valid, html_errors, html_warnings = ValidationService.validate_html(html_content)
        css_valid, css_errors, css_warnings = ValidationService.validate_css(css_content or '')

        # CORRECTION: Template valide si HTML et CSS valides
        is_valid = html_valid and css_valid

        all_errors = []
        if html_errors:
            all_errors.extend([{'type': 'html', 'message': err, 'severity': 'error'} for err in html_errors])
        if css_errors:
            all_errors.extend([{'type': 'css', 'message': err, 'severity': 'error'} for err in css_errors])

        all_warnings = []
        if html_warnings:
            all_warnings.extend([{'type': 'html', 'message': warn, 'severity': 'warning'} for warn in html_warnings])
        if css_warnings:
            all_warnings.extend([{'type': 'css', 'message': warn, 'severity': 'warning'} for warn in css_warnings])

        return {
            'is_valid': is_valid,
            'html_valid': html_valid,
            'css_valid': css_valid,
            'errors': all_errors,
            'warnings': all_warnings,
            'error_count': len(all_errors),
            'warning_count': len(all_warnings),
            'total_size': len(html_content) + len(css_content or ''),
            'html_size': len(html_content),
            'css_size': len(css_content or '')
        }

    @staticmethod
    def sanitize_html(html_content):
        """Nettoyer le HTML (supprimer éléments dangereux)"""
        # Supprimer scripts
        html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.IGNORECASE | re.DOTALL)
        # Supprimer attributs événements
        html_content = re.sub(r'\s+on\w+\s*=\s*["\'][^"\']*["\']', '', html_content, flags=re.IGNORECASE)
        # Supprimer iframes
        html_content = re.sub(r'<iframe[^>]*>.*?</iframe>', '', html_content, flags=re.IGNORECASE | re.DOTALL)
        # Supprimer javascript: dans href/src
        html_content = re.sub(r'(href|src)\s*=\s*["\']javascript:[^"\']*["\']', '', html_content, flags=re.IGNORECASE)

        return html_content

    @staticmethod
    def sanitize_css(css_content):
        """Nettoyer le CSS"""
        if not css_content:
            return ''

        # Supprimer javascript:
        css_content = re.sub(r'javascript\s*:', '', css_content, flags=re.IGNORECASE)
        # Supprimer expression()
        css_content = re.sub(r'expression\s*\([^)]*\)', '', css_content, flags=re.IGNORECASE)
        # Supprimer behavior
        css_content = re.sub(r'behavior\s*:[^;]*;', '', css_content, flags=re.IGNORECASE)

        return css_content

    @staticmethod
    def get_validation_summary(html_content, css_content=''):
        """Obtenir un résumé de validation lisible"""
        result = ValidationService.validate_template(html_content, css_content)

        if result['is_valid']:
            summary = "✅ Template valide"
            if result['warning_count'] > 0:
                summary += f" avec {result['warning_count']} avertissement(s)"
            return summary
        else:
            summary = f"❌ Template invalide - {result['error_count']} erreur(s)"
            if result['warning_count'] > 0:
                summary += f", {result['warning_count']} avertissement(s)"
            return summary

    @staticmethod
    def auto_fix_template(html_content, css_content=''):
        """Corriger automatiquement les problèmes courants"""
        changes = []

        # Nettoyer HTML
        html_fixed = ValidationService.sanitize_html(html_content)
        if html_fixed != html_content:
            changes.append("HTML nettoyé")

        # Nettoyer CSS
        css_fixed = ValidationService.sanitize_css(css_content or '')
        if css_fixed != (css_content or ''):
            changes.append("CSS nettoyé")

        # Ajouter DOCTYPE si manquant
        if not re.search(r'<!DOCTYPE', html_fixed, re.IGNORECASE):
            if not re.search(r'<html', html_fixed, re.IGNORECASE):
                html_fixed = f'<!DOCTYPE html>\n<html>\n{html_fixed}\n</html>'
                changes.append("DOCTYPE et <html> ajoutés")
            else:
                html_fixed = f'<!DOCTYPE html>\n{html_fixed}'
                changes.append("DOCTYPE ajouté")

        return html_fixed, css_fixed, changes
