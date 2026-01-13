# 📋 Instructions Manuelles - Démarrage du Backend

## 🎯 Étapes à Suivre:

### Étape 1: Ouvrir un Terminal

Ouvrez **PowerShell** ou **Invite de commandes** (cmd)

### Étape 2: Aller dans le Dossier du Backend

```bash
cd C:\Projet-Stage-2026\back-end\flaskapp
```

### Étape 3: Arrêter les Anciens Processus (si nécessaire)

Si le port 5000 est déjà utilisé, arrêtez les processus:

```bash
# Voir ce qui utilise le port 5000
netstat -ano | findstr :5000

# Arrêter le processus (remplacez PID par le numéro que vous voyez)
taskkill /F /PID <PID>
```

**OU** arrêtez tous les processus Python sur le port 5000:

```bash
for /f "tokens=5" %a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %a
```

### Étape 4: Activer l'Environnement Virtuel

```bash
venv\Scripts\activate
```

Vous devriez voir `(venv)` au début de votre ligne de commande.

### Étape 5: Vérifier les Dépendances (optionnel)

```bash
# Vérifier que Flask est installé
python -c "import flask; print('Flask OK')"

# Si erreur, installer les dépendances
pip install -r requirements.txt
```

### Étape 6: Démarrer le Serveur

```bash
python run.py
```

### Étape 7: Vérifier que ça Fonctionne

Vous devriez voir:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

**Si vous voyez ça, c'est bon! ✅**

## 🚨 Si vous Voyez des Erreurs:

### Erreur: "ModuleNotFoundError: No module named 'flask'"
**Solution:**
```bash
pip install -r requirements.txt
```

### Erreur: "Address already in use"
**Solution:** Le port 5000 est déjà utilisé. Arrêtez le processus (Étape 3)

### Erreur: "Python n'est pas reconnu"
**Solution:** Python n'est pas dans le PATH. Réinstallez Python et cochez "Add Python to PATH"

## ✅ Checklist:

- [ ] Terminal ouvert
- [ ] Dans le bon dossier (`C:\Projet-Stage-2026\back-end\flaskapp`)
- [ ] Anciens processus arrêtés (si nécessaire)
- [ ] Environnement virtuel activé (vous voyez `(venv)`)
- [ ] Dépendances installées
- [ ] Serveur démarré (vous voyez "Running on...")

## 🎉 C'est Tout!

Une fois que vous voyez "Running on http://127.0.0.1:5000", votre backend est prêt!

**NE FERMEZ PAS LA FENÊTRE DU TERMINAL!**
