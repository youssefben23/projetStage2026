-- ============================================
-- FICHIER 2 : DONNÉES DE TEST
-- 02_donnees_test.sql
-- À exécuter APRÈS 00_correction_base_existante.sql
-- ============================================

USE email_template_platform;

-- ============================================
-- NETTOYAGE (si vous voulez recommencer)
-- ============================================
-- Décommentez ces lignes si vous voulez effacer les données existantes
/*
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE sessions;
TRUNCATE TABLE validation_results;
TRUNCATE TABLE template_metadata;
TRUNCATE TABLE template_versions;
TRUNCATE TABLE email_templates;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
*/

-- ============================================
-- UTILISATEURS DE TEST
-- ============================================

INSERT INTO users (email, password, nom, prenom, role) VALUES
('admin@platform.com', 'admin123', 'Admin', 'Super', 'admin'),
('test@test.com', 'test123', 'Dupont', 'Jean', 'user'),
('demo@demo.com', 'demo123', 'Martin', 'Marie', 'user'),
('dev@dev.com', 'dev123', 'Durand', 'Paul', 'user');

-- ============================================
-- TEMPLATES D'EXEMPLE
-- ============================================

-- Template 1 : Email de Bienvenue
INSERT INTO email_templates (user_id, nom, sujet, html_content, css_content) VALUES
(2, 'Email de Bienvenue', 'Bienvenue sur notre plateforme!', 
'<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenue!</h1>
        </div>
        <div class="content">
            <p>Merci de vous être inscrit sur notre plateforme.</p>
            <p>Nous sommes ravis de vous compter parmi nous.</p>
            <a href="#" class="button">Commencer</a>
        </div>
        <div class="footer">
            <p>Cordialement,<br>L\'équipe</p>
        </div>
    </div>
</body>
</html>',
'body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
}

.container {
    max-width: 600px;
    margin: 20px auto;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
}

.header h1 {
    margin: 0;
    font-size: 32px;
}

.content {
    padding: 30px;
}

.content p {
    line-height: 1.6;
    color: #333;
    margin-bottom: 15px;
}

.button {
    display: inline-block;
    padding: 12px 30px;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 20px;
    font-weight: bold;
}

.button:hover {
    background: #5568d3;
}

.footer {
    background: #f8f9fa;
    padding: 20px 30px;
    text-align: center;
    color: #666;
    font-size: 14px;
}');

-- Template 2 : Newsletter Mensuelle
INSERT INTO email_templates (user_id, nom, sujet, html_content, css_content) VALUES
(2, 'Newsletter Mensuelle', 'Les actualités du mois', 
'<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Newsletter</title>
</head>
<body>
    <div class="newsletter">
        <h2>Newsletter - Actualités du Mois</h2>
        <div class="article">
            <h3>Nouveauté 1</h3>
            <p>Description de la nouveauté...</p>
        </div>
        <div class="article">
            <h3>Nouveauté 2</h3>
            <p>Description de la nouveauté...</p>
        </div>
    </div>
</body>
</html>',
'body {
    background: #f0f0f0;
    padding: 20px;
}

.newsletter {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 8px;
}

.article {
    margin-bottom: 25px;
    padding-bottom: 25px;
    border-bottom: 1px solid #eee;
}

h2 {
    color: #667eea;
    margin-bottom: 30px;
}

h3 {
    color: #333;
    margin-bottom: 10px;
}');

-- Template 3 : Confirmation de commande
INSERT INTO email_templates (user_id, nom, sujet, html_content, css_content) VALUES
(3, 'Confirmation Commande', 'Votre commande #12345', 
'<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Confirmation</title>
</head>
<body>
    <div class="container">
        <h1>Commande confirmée!</h1>
        <p>Votre commande a été reçue et est en cours de traitement.</p>
        <div class="order-details">
            <h3>Détails de la commande</h3>
            <p>Numéro: #12345</p>
            <p>Date: 08/01/2026</p>
        </div>
    </div>
</body>
</html>',
'body {
    font-family: sans-serif;
    background: #fafafa;
}

.container {
    max-width: 600px;
    margin: 30px auto;
    padding: 30px;
    background: white;
    border: 1px solid #ddd;
}

h1 {
    color: #28a745;
}

.order-details {
    background: #f8f9fa;
    padding: 20px;
    margin-top: 20px;
    border-radius: 5px;
}');

-- Template 4 : Réinitialisation mot de passe
INSERT INTO email_templates (user_id, nom, sujet, html_content, css_content) VALUES
(4, 'Reset Password', 'Réinitialisation de votre mot de passe', 
'<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reset Password</title>
</head>
<body>
    <div class="container">
        <h2>Réinitialisation du mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <a href="#" class="reset-button">Réinitialiser mon mot de passe</a>
        <p class="warning">Ce lien expire dans 24 heures.</p>
    </div>
</body>
</html>',
'body {
    background: #e9ecef;
    font-family: Arial, sans-serif;
}

.container {
    max-width: 500px;
    margin: 50px auto;
    padding: 40px;
    background: white;
    text-align: center;
}

.reset-button {
    display: inline-block;
    padding: 15px 40px;
    background: #dc3545;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin: 20px 0;
}

.warning {
    color: #6c757d;
    font-size: 12px;
    margin-top: 20px;
}');

-- ============================================
-- VERSIONS INITIALES
-- ============================================

INSERT INTO template_versions (template_id, version_number, html_content, css_content, change_description, created_by) 
SELECT id, 1, html_content, css_content, 'Version initiale', user_id 
FROM email_templates;

-- ============================================
-- MÉTADONNÉES
-- ============================================

INSERT INTO template_metadata (template_id, category, tags, usage_count) VALUES
(1, 'Onboarding', '["bienvenue", "inscription", "nouveaux-utilisateurs"]', 15),
(2, 'Marketing', '["newsletter", "actualités", "mensuel"]', 8),
(3, 'E-commerce', '["commande", "confirmation", "achat"]', 42),
(4, 'Sécurité', '["password", "reset", "compte"]', 5);

-- ============================================
-- RÉSULTATS DE VALIDATION
-- ============================================

INSERT INTO validation_results (template_id, is_valid, html_valid, css_valid, errors, warnings) VALUES
(1, TRUE, TRUE, TRUE, '[]', '[]'),
(2, TRUE, TRUE, TRUE, '[]', '["Considérer l\'ajout d\'un viewport meta tag"]'),
(3, TRUE, TRUE, TRUE, '[]', '[]'),
(4, TRUE, TRUE, TRUE, '[]', '[]');

-- ============================================
-- LOGS D'ACTIVITÉ
-- ============================================

INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES
(2, 'CREATE_TEMPLATE', 'template', 1, '{"nom": "Email de Bienvenue"}'),
(2, 'CREATE_TEMPLATE', 'template', 2, '{"nom": "Newsletter Mensuelle"}'),
(3, 'CREATE_TEMPLATE', 'template', 3, '{"nom": "Confirmation Commande"}'),
(4, 'CREATE_TEMPLATE', 'template', 4, '{"nom": "Reset Password"}'),
(1, 'LOGIN', 'user', 1, '{"ip": "192.168.1.1"}');

-- ============================================
-- SESSIONS DE TEST
-- ============================================

INSERT INTO sessions (user_id, token_hash, expires_at, ip_address, user_agent) VALUES
(1, SHA2('admin_session_token_123', 256), DATE_ADD(NOW(), INTERVAL 7 DAY), '192.168.1.100', 'Mozilla/5.0'),
(2, SHA2('test_session_token_456', 256), DATE_ADD(NOW(), INTERVAL 1 DAY), '192.168.1.101', 'Chrome/120.0');

-- ============================================
-- VÉRIFICATION ET RÉSUMÉ
-- ============================================

SELECT '✅ DONNÉES DE TEST INSÉRÉES AVEC SUCCÈS!' as Status;
SELECT '' as '';

SELECT '📊 RÉSUMÉ DES DONNÉES' as Info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
    'Utilisateurs' as Type, 
    COUNT(*) as Nombre 
FROM users
UNION ALL
SELECT 
    'Templates', 
    COUNT(*) 
FROM email_templates
UNION ALL
SELECT 
    'Versions', 
    COUNT(*) 
FROM template_versions
UNION ALL
SELECT 
    'Métadonnées', 
    COUNT(*) 
FROM template_metadata
UNION ALL
SELECT 
    'Validations', 
    COUNT(*) 
FROM validation_results
UNION ALL
SELECT 
    'Sessions actives', 
    COUNT(*) 
FROM sessions WHERE expires_at > NOW()
UNION ALL
SELECT 
    'Logs d\'activité', 
    COUNT(*) 
FROM activity_logs;

SELECT '' as '';
SELECT '👤 COMPTES DE TEST DISPONIBLES' as Info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
    email as 'Email',
    password as 'Mot de passe',
    CONCAT(prenom, ' ', nom) as 'Nom complet',
    role as 'Rôle'
FROM users
ORDER BY role DESC, id;

SELECT '' as '';
SELECT '📧 TEMPLATES DISPONIBLES' as Info;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

SELECT 
    et.id as 'ID',
    et.nom as 'Nom du template',
    tm.category as 'Catégorie',
    tm.usage_count as 'Utilisations',
    CONCAT(u.prenom, ' ', u.nom) as 'Propriétaire'
FROM email_templates et
LEFT JOIN template_metadata tm ON et.id = tm.template_id
LEFT JOIN users u ON et.user_id = u.id
ORDER BY et.id;

SELECT '' as '';
SELECT '🎉 BASE DE DONNÉES COMPLÈTE ET PRÊTE!' as Message;
SELECT '' as '';
SELECT '💡 TESTEZ VOS PROCÉDURES:' as Astuce;
SELECT 'CALL sp_get_user_statistics(2);' as 'Exemple 1';
SELECT 'SELECT * FROM v_user_statistics;' as 'Exemple 2';
SELECT 'SELECT * FROM v_templates_with_latest_version;' as 'Exemple 3';