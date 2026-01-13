
-- ============================================
-- BASE DE DONNÉES PROFESSIONNELLE COMPLÈTE
-- Plateforme de Gestion de Modèles d'E-mails
-- ============================================

DROP DATABASE IF EXISTS email_template_platform;
CREATE DATABASE email_template_platform 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE email_template_platform;

-- ============================================
-- TABLE 1 : users
-- Gestion complète des utilisateurs
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    role ENUM('user', 'admin') DEFAULT 'user',
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 2 : email_templates
-- Stockage complet des modèles d'e-mails
-- ============================================
CREATE TABLE email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    sujet VARCHAR(500) NOT NULL,
    html_content LONGTEXT NOT NULL,
    css_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_nom (nom),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    INDEX idx_user_active (user_id, is_active),
    FULLTEXT idx_search (nom, sujet)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 3 : template_versions
-- Historique complet des versions avec audit trail
-- ============================================
CREATE TABLE template_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    version_number INT NOT NULL,
    html_content LONGTEXT NOT NULL,
    css_content TEXT,
    change_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_template_version (template_id, version_number),
    INDEX idx_template_id (template_id),
    INDEX idx_version_number (version_number),
    INDEX idx_created_at (created_at),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 4 : template_metadata
-- Métadonnées et statistiques avancées
-- ============================================
CREATE TABLE template_metadata (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL UNIQUE,
    category VARCHAR(100),
    tags JSON,
    usage_count INT DEFAULT 0,
    last_used TIMESTAMP NULL,
    favorite BOOLEAN DEFAULT FALSE,
    shared BOOLEAN DEFAULT FALSE,
    shared_with JSON,
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_last_used (last_used),
    INDEX idx_favorite (favorite),
    INDEX idx_shared (shared)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 5 : validation_results
-- Résultats de validation HTML/CSS
-- ============================================
CREATE TABLE validation_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    is_valid BOOLEAN NOT NULL,
    html_valid BOOLEAN NOT NULL,
    css_valid BOOLEAN NOT NULL,
    errors JSON,
    warnings JSON,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE CASCADE,
    INDEX idx_template_id (template_id),
    INDEX idx_validated_at (validated_at),
    INDEX idx_is_valid (is_valid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 6 : sessions
-- Gestion avancée des sessions JWT
-- ============================================
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_revoked (is_revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE 7 : activity_logs
-- Logs d'activité pour audit et sécurité
-- ============================================
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 
SHOW DATABASES;
USE email_template_platform;
SHOW TABLES;
DESCRIBE users;
DESCRIBE email_templates;
-- Sauvegarder la structure complète
SHOW CREATE DATABASE email_template_platform;

-- Pour chaque table :
SHOW CREATE TABLE users;
SHOW CREATE TABLE email_templates;
SHOW CREATE TABLE template_versions;
SHOW CREATE TABLE template_metadata;
SHOW CREATE TABLE validation_results;
SHOW CREATE TABLE sessions;
SHOW CREATE TABLE activity_logs;
