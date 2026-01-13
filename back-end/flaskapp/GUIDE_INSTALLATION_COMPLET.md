# 🚀 Guide d'Installation Complet - Angular 21

## ⚠️ Important: Angular n'utilise PAS d'environnement virtuel

Contrairement à Python, Angular utilise **npm** et **node_modules** pour gérer les dépendances. Pas besoin d'environnement virtuel séparé!

## 📋 Prérequis

### 1. Installer Node.js (Obligatoire)

1. Télécharger Node.js depuis: https://nodejs.org/
2. Choisir la version **LTS** (Long Term Support)
3. Installer avec les options par défaut
4. Vérifier l'installation:
   ```bash
   node --version
   npm --version
   ```

### 2. Installer Angular CLI (Obligatoire)

```bash
npm install -g @angular/cli@21
```

Vérifier l'installation:
```bash
ng version
```

## 🎯 Installation du Projet

### Méthode 1: Script Automatique (Windows)

```bash
# Double-cliquer sur le fichier:
front-end/INSTALL_AND_START.bat
```

### Méthode 2: Script Automatique (Linux/Mac)

```bash
cd front-end
chmod +x INSTALL_AND_START.sh
./INSTALL_AND_START.sh
```

### Méthode 3: Installation Manuelle

```bash
# 1. Aller dans le dossier front-end
cd front-end

# 2. Installer toutes les dépendances
npm install

# 3. Démarrer l'application
npm start
```

## 📁 Structure après Installation

Après `npm install`, vous aurez:

```
front-end/
├── node_modules/          ← Toutes les dépendances (équivalent à venv/)
├── package.json           ← Liste des dépendances
├── package-lock.json      ← Versions exactes verrouillées
├── angular.json           ← Configuration Angular
├── tsconfig.json          ← Configuration TypeScript
└── src/                   ← Code source de l'application
```

## ✅ Vérification

### Vérifier que tout est installé:

```bash
cd front-end

# Vérifier Angular CLI
ng version

# Vérifier les dépendances
npm list --depth=0

# Vérifier que node_modules existe
dir node_modules  # Windows
ls node_modules   # Linux/Mac
```

## 🚀 Démarrer le Projet

### Option 1: Commande npm (Recommandé)

```bash
cd front-end
npm start
```

### Option 2: Commande Angular CLI

```bash
cd front-end
ng serve
```

### Option 3: Avec un port personnalisé

```bash
ng serve --port 4201
```

L'application sera accessible sur: **http://localhost:4200**

## 🔧 Commandes Utiles

```bash
# Démarrer en mode développement
npm start

# Construire pour la production
npm run build

# Exécuter les tests
npm test

# Vérifier le code (linting)
ng lint

# Créer un nouveau composant
ng generate component nom-du-composant
```

## 📦 Gestion des Dépendances

### Ajouter une nouvelle dépendance:

```bash
npm install nom-du-package
```

### Ajouter une dépendance de développement:

```bash
npm install --save-dev nom-du-package
```

### Mettre à jour les dépendances:

```bash
npm update
```

### Réinstaller tout depuis zéro:

```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json  # Linux/Mac
rmdir /s node_modules && del package-lock.json  # Windows

# Réinstaller
npm install
```

## 🐛 Dépannage

### Erreur: "ng: command not found"

**Solution:**
```bash
npm install -g @angular/cli@21
```

### Erreur: "Cannot find module '@angular/core'"

**Solution:**
```bash
cd front-end
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Port 4200 is already in use"

**Solution:**
```bash
# Utiliser un autre port
ng serve --port 4201
```

### Erreur: "npm ERR! code EACCES"

**Solution (Linux/Mac):**
```bash
# Utiliser sudo (non recommandé) ou corriger les permissions
sudo npm install -g @angular/cli@21
```

### Erreur: "Module not found"

**Solution:**
```bash
# Vérifier que node_modules existe
ls node_modules  # ou dir node_modules sur Windows

# Si absent, réinstaller
npm install
```

## 📝 Notes Importantes

1. **Pas d'environnement virtuel**: Angular utilise `node_modules/` directement
2. **package-lock.json**: Ne pas supprimer, il verrouille les versions
3. **node_modules/**: Peut être régénéré avec `npm install`
4. **Global vs Local**: 
   - Angular CLI peut être global (`-g`) ou local (dans `node_modules`)
   - Pour ce projet, global est recommandé

## 🎓 Différences avec Python

| Python | Angular/Node.js |
|--------|----------------|
| `venv/` | `node_modules/` |
| `pip install` | `npm install` |
| `requirements.txt` | `package.json` |
| `python -m venv venv` | Pas nécessaire |
| `source venv/bin/activate` | Pas nécessaire |

## ✅ Checklist d'Installation

- [ ] Node.js installé et vérifié
- [ ] npm installé et vérifié
- [ ] Angular CLI installé globalement
- [ ] `npm install` exécuté dans `front-end/`
- [ ] `node_modules/` créé et rempli
- [ ] `npm start` fonctionne
- [ ] Application accessible sur http://localhost:4200

## 🎉 C'est Prêt!

Une fois tout installé, vous pouvez:
1. Démarrer le backend Flask: `cd back-end/flaskapp && python run.py`
2. Démarrer le frontend Angular: `cd front-end && npm start`
3. Ouvrir http://localhost:4200 dans votre navigateur

**Tout est sauvegardé dans votre projet!** Les fichiers `package.json` et `package-lock.json` contiennent toutes les informations nécessaires pour réinstaller le projet n'importe où.
