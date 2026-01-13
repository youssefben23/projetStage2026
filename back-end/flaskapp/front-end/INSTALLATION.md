# 📦 Installation Angular 21 - Guide Complet

## Prérequis

1. **Node.js** (version 18 ou supérieure)
   - Télécharger depuis: https://nodejs.org/
   - Vérifier l'installation: `node --version`
   - Vérifier npm: `npm --version`

2. **Angular CLI** (version 21)
   - Installation globale: `npm install -g @angular/cli@21`
   - Vérifier: `ng version`

## Installation du Projet

### Option 1: Installation Automatique (Recommandé)

```bash
cd front-end
npm install
```

### Option 2: Installation Manuelle

Si vous préférez installer Angular CLI localement:

```bash
cd front-end
npm install @angular/cli@21 --save-dev
npm install
```

## Structure des Dépendances

Le fichier `package.json` contient toutes les dépendances nécessaires:
- Angular 21 (core, common, router, forms, etc.)
- RxJS pour la programmation réactive
- TypeScript 5.3

## Vérification

Après l'installation, vérifiez que tout est correct:

```bash
# Vérifier les versions
ng version

# Vérifier les dépendances installées
npm list --depth=0
```

## Démarrer le Projet

```bash
npm start
# ou
ng serve
```

L'application sera accessible sur: **http://localhost:4200**

## Commandes Utiles

```bash
# Démarrer en mode développement
npm start

# Construire pour la production
npm run build

# Exécuter les tests
npm test

# Vérifier le code
ng lint
```

## Dépannage

### Erreur: "ng: command not found"
- Solution: Installer Angular CLI globalement: `npm install -g @angular/cli@21`

### Erreur: "Cannot find module"
- Solution: Supprimer `node_modules` et `package-lock.json`, puis réinstaller:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Erreur de port déjà utilisé
- Solution: Utiliser un autre port: `ng serve --port 4201`

## Notes Importantes

- **Pas besoin d'environnement virtuel** comme Python
- Les dépendances sont dans `node_modules/` (créé automatiquement)
- Le fichier `package-lock.json` verrouille les versions exactes
- Angular utilise TypeScript, pas JavaScript pur
