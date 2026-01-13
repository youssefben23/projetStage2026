# 🧪 Guide de Test Complet - Plateforme Email Templates

## ✅ Votre Application Fonctionne!

Vous voyez la page de connexion sur **http://localhost:4200** - C'est parfait!

## 🔑 Comptes de Test Disponibles

Après avoir exécuté les scripts SQL de la base de données, vous avez ces comptes:

### Compte Admin:
- **Email:** `admin@platform.com`
- **Mot de passe:** `admin123`

### Comptes Utilisateurs:
- **Email:** `test@test.com`
- **Mot de passe:** `test123`

- **Email:** `demo@demo.com`
- **Mot de passe:** `demo123`

## 📋 Scénarios de Test

### 1. Test d'Authentification

#### Test de Connexion:
1. Entrez: `test@test.com` / `test123`
2. Cliquez sur "Se connecter"
3. ✅ Vous devriez être redirigé vers la liste des templates

#### Test d'Inscription:
1. Cliquez sur "S'inscrire"
2. Remplissez le formulaire:
   - Email: `nouveau@test.com`
   - Prénom: `Nouveau`
   - Nom: `Utilisateur`
   - Mot de passe: `test1234`
3. Cliquez sur "S'inscrire"
4. ✅ Vous devriez être redirigé vers la page de connexion

### 2. Test de la Liste des Templates

#### Après connexion:
1. ✅ Vous devriez voir la page "Mes Templates d'E-mails"
2. ✅ Vous devriez voir les templates de test (si la base de données est remplie)
3. ✅ Cliquez sur "Nouveau Template" pour créer un template

### 3. Test de Création de Template

1. Cliquez sur "+ Nouveau Template"
2. Remplissez:
   - **Nom:** `Mon Premier Template`
   - **Sujet:** `Test Email`
3. Dans l'éditeur HTML, tapez:
   ```html
   <div>
     <h1>Bonjour!</h1>
     <p>Ceci est un test</p>
   </div>
   ```
4. Dans l'éditeur CSS, tapez:
   ```css
   h1 { color: blue; }
   p { color: green; }
   ```
5. ✅ Regardez l'aperçu en temps réel à droite
6. Cliquez sur "Sauvegarder"
7. ✅ Vous devriez être redirigé vers la page de détail du template

### 4. Test de l'Éditeur avec Aperçu en Temps Réel

1. Ouvrez un template existant
2. Modifiez le HTML dans l'éditeur de gauche
3. ✅ Regardez l'aperçu se mettre à jour automatiquement à droite
4. Modifiez le CSS dans l'éditeur du milieu
5. ✅ Regardez les styles s'appliquer en temps réel

### 5. Test de Modification de Template

1. Cliquez sur un template dans la liste
2. Cliquez sur "Modifier"
3. Changez le nom, le sujet, ou le contenu
4. Cliquez sur "Sauvegarder"
5. ✅ Les modifications doivent être sauvegardées

### 6. Test de Suppression

1. Dans la liste des templates, cliquez sur l'icône 🗑️
2. Confirmez la suppression
3. ✅ Le template doit disparaître de la liste

### 7. Test de Recherche

1. Dans la barre de recherche, tapez un mot-clé
2. ✅ Les templates correspondants doivent s'afficher

### 8. Test de l'Historique des Versions

1. Ouvrez un template
2. Modifiez-le plusieurs fois
3. Allez dans la section "Historique des Versions"
4. ✅ Vous devriez voir toutes les versions
5. Cliquez sur "Restaurer" sur une ancienne version
6. ✅ Le template doit revenir à cette version

### 9. Test de Validation

1. Dans l'éditeur, cliquez sur "Valider"
2. ✅ Vous devriez voir les résultats de validation
3. Essayez d'ajouter `<script>alert('test')</script>` dans le HTML
4. ✅ La validation doit détecter l'erreur

### 10. Test de Duplication

1. Ouvrez un template
2. Cliquez sur "Dupliquer"
3. ✅ Un nouveau template identique doit être créé

## 🎯 Checklist de Test Complète

- [ ] Connexion fonctionne
- [ ] Inscription fonctionne
- [ ] Liste des templates s'affiche
- [ ] Création de template fonctionne
- [ ] Aperçu en temps réel fonctionne
- [ ] Modification de template fonctionne
- [ ] Suppression fonctionne
- [ ] Recherche fonctionne
- [ ] Historique des versions fonctionne
- [ ] Validation HTML/CSS fonctionne
- [ ] Duplication fonctionne
- [ ] Déconnexion fonctionne

## 🐛 Si Quelque Chose Ne Fonctionne Pas

### Vérifiez que le Backend est démarré:

1. Ouvrez un nouveau terminal
2. Allez dans: `C:\Projet-Stage-2026\back-end\flaskapp`
3. Exécutez: `python run.py`
4. Vous devriez voir: `Running on http://127.0.0.1:5000`

### Vérifiez la Base de Données:

1. Vérifiez que MySQL est démarré
2. Vérifiez que la base `email_template_platform` existe
3. Vérifiez que les données de test sont insérées

## 🎉 Félicitations!

Votre projet fonctionne! Vous pouvez maintenant:
- ✅ Tester toutes les fonctionnalités
- ✅ Créer vos propres templates
- ✅ Présenter votre projet

**Votre travail est réussi! 🎊**
