# 🚀 Guide de Démarrage Rapide

## Étape 1: Base de Données

1. Ouvrir MySQL Workbench ou votre client MySQL
2. Exécuter dans l'ordre:
   ```sql
   -- 1. Créer la base de données
   source DataBase-emailPlatfurm/email_template_platform.sql
   
   -- 2. Corriger la base existante
   source DataBase-emailPlatfurm/00_correction_base_existante.sql
   
   -- 3. Insérer les données de test
   source DataBase-emailPlatfurm/02_donnees_test.sql
   ```

## Étape 2: Backend Flask

```bash
cd back-end/flaskapp

# Activer l'environnement virtuel (si nécessaire)
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Démarrer le serveur
python run.py
```

Le backend sera accessible sur: **http://localhost:5000**

## Étape 3: Frontend Angular

```bash
cd front-end

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

Le frontend sera accessible sur: **http://localhost:4200**

## Étape 4: Tester l'Application

1. Ouvrir http://localhost:4200
2. Se connecter avec:
   - Email: `test@test.com`
   - Mot de passe: `test123`
3. Créer votre premier template!

## ✅ Vérification

- ✅ Backend Flask fonctionne sur le port 5000
- ✅ Frontend Angular fonctionne sur le port 4200
- ✅ Base de données MySQL connectée
- ✅ Authentification JWT opérationnelle
- ✅ Éditeur HTML/CSS avec aperçu en temps réel

## 🎯 Fonctionnalités Disponibles

- ✅ Inscription / Connexion
- ✅ Création de templates
- ✅ Édition avec aperçu en temps réel
- ✅ Validation HTML/CSS
- ✅ Historique des versions
- ✅ Recherche de templates
- ✅ Suppression de templates

## 📞 Support

En cas de problème:
1. Vérifier que MySQL est démarré
2. Vérifier les ports 5000 et 4200 sont libres
3. Vérifier les logs dans la console
4. Vérifier la connexion à la base de données dans `app/config.py`
