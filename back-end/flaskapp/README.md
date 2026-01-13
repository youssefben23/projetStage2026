# Plateforme de Gestion de Modèles d'E-mails Professionnels

## 📋 Description

Plateforme web complète permettant de créer, modifier, supprimer et gérer des modèles d'e-mails professionnels avec éditeur HTML/CSS et aperçu en temps réel.

## 🏗️ Architecture

### Backend (Flask)
- **Framework**: Flask 3.0.0
- **Base de données**: MySQL
- **ORM**: SQLAlchemy
- **Authentification**: JWT
- **API**: REST

### Frontend (Angular)
- **Framework**: Angular 21
- **Langage**: TypeScript
- **Architecture**: Standalone Components

## 🚀 Installation et Démarrage

### Backend

1. Installer les dépendances:
```bash
cd back-end/flaskapp
pip install -r requirements.txt
```

2. Configurer la base de données:
- Exécuter les scripts SQL dans l'ordre:
  - `email_template_platform.sql`
  - `00_correction_base_existante.sql`
  - `02_donnees_test.sql`

3. Configurer les variables d'environnement:
```bash
# Créer un fichier .env
SECRET_KEY=votre-cle-secrete
DATABASE_URL=mysql+pymysql://root:Waywa1234**@localhost/email_template_platform
CORS_ORIGINS=http://localhost:4200
```

4. Démarrer le serveur:
```bash
python run.py
# ou
START_BACKEND.bat
```

Le serveur sera accessible sur `http://localhost:5000`

### Frontend

1. Installer les dépendances:
```bash
cd front-end
npm install
```

2. Démarrer l'application:
```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

## 📁 Structure du Projet

```
Projet-Stage-2026/
├── back-end/
│   └── flaskapp/
│       ├── app/
│       │   ├── models/          # Modèles SQLAlchemy
│       │   ├── routes/          # Routes API
│       │   ├── services/        # Services métier
│       │   └── utils/           # Utilitaires
│       ├── requirements.txt
│       └── run.py
├── front-end/
│   └── src/
│       └── app/
│           ├── components/      # Composants Angular
│           ├── services/        # Services Angular
│           ├── models/          # Modèles TypeScript
│           ├── guards/          # Guards de routage
│           └── interceptors/    # Intercepteurs HTTP
└── DataBase-emailPlatfurm/
    ├── email_template_platform.sql
    ├── 00_correction_base_existante.sql
    └── 02_donnees_test.sql
```

## 🔑 Comptes de Test

Après avoir exécuté `02_donnees_test.sql`:

- **Admin**: admin@platform.com / admin123
- **User 1**: test@test.com / test123
- **User 2**: demo@demo.com / demo123

## 📚 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur courant

### Templates
- `GET /api/templates` - Liste des templates
- `GET /api/templates/:id` - Détails d'un template
- `POST /api/templates` - Créer un template
- `PUT /api/templates/:id` - Modifier un template
- `DELETE /api/templates/:id` - Supprimer un template
- `GET /api/templates/search?q=...` - Rechercher
- `POST /api/templates/:id/validate` - Valider
- `GET /api/templates/:id/preview` - Aperçu
- `GET /api/templates/:id/versions` - Historique des versions
- `POST /api/templates/:id/versions/:version/restore` - Restaurer une version

## ✨ Fonctionnalités

- ✅ Authentification JWT
- ✅ CRUD complet des templates
- ✅ Éditeur HTML/CSS avec aperçu en temps réel
- ✅ Validation HTML/CSS
- ✅ Historique des versions
- ✅ Recherche de templates
- ✅ Gestion des métadonnées
- ✅ Audit et logs d'activité
- ✅ Sessions utilisateur
- ✅ Sécurité (CORS, XSS protection)

## 🛠️ Technologies

### Backend
- Python 3.13
- Flask 3.0.0
- SQLAlchemy
- PyJWT
- PyMySQL

### Frontend
- Angular 21
- TypeScript 5.3
- RxJS

### Base de données
- MySQL 8.0+

## 📝 Notes

- Les mots de passe sont stockés en clair en développement (pour faciliter les tests)
- En production, utiliser le hashing avec `generate_password_hash`
- Le CORS est configuré pour `http://localhost:4200` par défaut
- Les sessions JWT expirent après 24 heures

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifier que MySQL est démarré
- Vérifier les identifiants dans `config.py`
- Vérifier que la base de données existe

### Erreur CORS
- Vérifier que `CORS_ORIGINS` dans la config correspond à l'URL du frontend

### Erreur d'authentification
- Vérifier que le token JWT est bien envoyé dans les headers
- Vérifier que le token n'est pas expiré
