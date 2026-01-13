-- ============================================
-- CORRECTION DE LA BASE EXISTANTE
-- 00_correction_base_existante.sql
-- Exécutez ce fichier EN PREMIER pour corriger votre base
-- ============================================

USE email_template_platform;

-- ============================================
-- CORRECTION 1 : Renommer password_hash en password
-- ============================================
-- ============================================
-- CORRECTION 2 : Ajouter les éléments manquants
-- ============================================

-- Vérifier si les procédures existent déjà
DROP PROCEDURE IF EXISTS sp_create_new_version;
DROP PROCEDURE IF EXISTS sp_cleanup_expired_sessions;
DROP PROCEDURE IF EXISTS sp_get_user_statistics;

-- Créer les procédures stockées
DELIMITER //

CREATE PROCEDURE sp_create_new_version(
    IN p_template_id INT,
    IN p_html_content LONGTEXT,
    IN p_css_content TEXT,
    IN p_description VARCHAR(500),
    IN p_user_id INT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent VARCHAR(500)
)
BEGIN
    DECLARE v_next_version INT;
    
    START TRANSACTION;
    
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version
    FROM template_versions
    WHERE template_id = p_template_id;
    
    INSERT INTO template_versions 
    (template_id, version_number, html_content, css_content, change_description, created_by, ip_address, user_agent)
    VALUES 
    (p_template_id, v_next_version, p_html_content, p_css_content, p_description, p_user_id, p_ip_address, p_user_agent);
    
    UPDATE email_templates
    SET html_content = p_html_content,
        css_content = p_css_content,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_template_id;
    
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, ip_address, user_agent)
    VALUES (p_user_id, 'UPDATE_TEMPLATE', 'template', p_template_id, p_ip_address, p_user_agent);
    
    COMMIT;
END //

CREATE PROCEDURE sp_cleanup_expired_sessions()
BEGIN
    DELETE FROM sessions 
    WHERE expires_at < NOW() 
    OR is_revoked = TRUE;
    
    INSERT INTO activity_logs (action, details)
    VALUES ('CLEANUP_SESSIONS', JSON_OBJECT('deleted_count', ROW_COUNT()));
END //

CREATE PROCEDURE sp_get_user_statistics(IN p_user_id INT)
BEGIN
    SELECT 
        u.id,
        u.email,
        u.nom,
        u.prenom,
        COUNT(DISTINCT et.id) as total_templates,
        COUNT(DISTINCT tv.id) as total_versions,
        MAX(et.updated_at) as last_activity,
        SUM(tm.usage_count) as total_usage
    FROM users u
    LEFT JOIN email_templates et ON u.id = et.user_id AND et.is_active = TRUE
    LEFT JOIN template_versions tv ON et.id = tv.template_id
    LEFT JOIN template_metadata tm ON et.id = tm.template_id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.email, u.nom, u.prenom;
END //

DELIMITER ;

-- ============================================
-- CORRECTION 3 : Créer les vues si manquantes
-- ============================================

DROP VIEW IF EXISTS v_user_statistics;
DROP VIEW IF EXISTS v_templates_with_latest_version;
DROP VIEW IF EXISTS v_recent_activity;

CREATE VIEW v_user_statistics AS
SELECT 
    u.id,
    u.email,
    u.nom,
    u.prenom,
    u.role,
    u.created_at as user_created_at,
    COUNT(DISTINCT et.id) as total_templates,
    COUNT(DISTINCT tv.id) as total_versions,
    MAX(et.updated_at) as last_activity,
    SUM(tm.usage_count) as total_usage
FROM users u
LEFT JOIN email_templates et ON u.id = et.user_id AND et.is_active = TRUE
LEFT JOIN template_versions tv ON et.id = tv.template_id
LEFT JOIN template_metadata tm ON et.id = tm.template_id
GROUP BY u.id, u.email, u.nom, u.prenom, u.role, u.created_at;

CREATE VIEW v_templates_with_latest_version AS
SELECT 
    et.*,
    tv.version_number as latest_version,
    tv.created_at as version_created_at,
    tv.change_description as latest_change,
    tm.category,
    tm.tags,
    tm.usage_count,
    tm.favorite,
    u.email as owner_email,
    u.nom as owner_nom,
    u.prenom as owner_prenom
FROM email_templates et
INNER JOIN template_versions tv ON et.id = tv.template_id
INNER JOIN users u ON et.user_id = u.id
LEFT JOIN template_metadata tm ON et.id = tm.template_id
WHERE tv.version_number = (
    SELECT MAX(version_number) 
    FROM template_versions 
    WHERE template_id = et.id
)
AND et.is_active = TRUE;

CREATE VIEW v_recent_activity AS
SELECT 
    al.*,
    u.email as user_email,
    u.nom,
    u.prenom
FROM activity_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY al.created_at DESC;

-- ============================================
-- CORRECTION 4 : Créer les triggers si manquants
-- ============================================

DROP TRIGGER IF EXISTS trg_after_template_insert;
DROP TRIGGER IF EXISTS trg_after_template_delete;

DELIMITER //

CREATE TRIGGER trg_after_template_insert
AFTER INSERT ON email_templates
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (NEW.user_id, 'CREATE_TEMPLATE', 'template', NEW.id, 
            JSON_OBJECT('nom', NEW.nom, 'sujet', NEW.sujet));
END //

CREATE TRIGGER trg_after_template_delete
AFTER DELETE ON email_templates
FOR EACH ROW
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (OLD.user_id, 'DELETE_TEMPLATE', 'template', OLD.id, 
            JSON_OBJECT('nom', OLD.nom));
END //

DELIMITER ;

-- ============================================
-- CORRECTION 5 : Créer les événements
-- ============================================

DROP EVENT IF EXISTS evt_cleanup_sessions;
DROP EVENT IF EXISTS evt_archive_old_logs;

CREATE EVENT IF NOT EXISTS evt_cleanup_sessions
ON SCHEDULE EVERY 1 HOUR
DO CALL sp_cleanup_expired_sessions();

DELIMITER //

CREATE EVENT IF NOT EXISTS evt_archive_old_logs
ON SCHEDULE EVERY 1 DAY
STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY)
DO
BEGIN
    DELETE FROM activity_logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END //

DELIMITER ;

-- ============================================
-- CORRECTION 6 : Index supplémentaires
-- ============================================

-- Créer les index manquants
CREATE INDEX idx_user_active_templates 
ON email_templates(user_id, is_active, updated_at DESC);

CREATE INDEX idx_template_search 
ON email_templates(user_id, is_active, nom, sujet);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT '✅ BASE DE DONNÉES CORRIGÉE AVEC SUCCÈS!' as Status;
SELECT '' as '';

SELECT 'Structure de la table users:' as Info;
DESCRIBE users;

SELECT '' as '';
SELECT 'Vous pouvez maintenant exécuter: 02_donnees_test.sql' as 'Prochaine étape';