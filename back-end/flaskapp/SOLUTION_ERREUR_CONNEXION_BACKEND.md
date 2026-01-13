# 🔧 Solution: Erreur "Http failure response: 0 Unknown Error"

## 🎯 Le Problème:

L'erreur **"Http failure response for http://localhost:5000/api/templates: 0 Unknown Error"** signifie que:

**Le backend Flask n'est PAS démarré ou n'est pas accessible!**

## ✅ SOLUTION IMMÉDIATE:

### Étape 1: Démarrer le Backend

**Double-cliquez sur:**
```
back-end/flaskapp/VERIFIER_ET_DEMARRER.bat
```

Ce script va:
1. ✅ Vérifier si le port 5000 est libre
2. ✅ Activer l'environnement virtuel
3. ✅ Vérifier Python et les dépendances
4. ✅ Démarrer le serveur Flask

### Étape 2: Vérifier que le Backend est Démarré

Vous devriez voir dans la fenêtre du terminal:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

**Si vous voyez ça, c'est bon! ✅**

### Étape 3: Tester à Nouveau

Retournez sur http://localhost:4200 et essayez de créer un template.

## 🔍 Si ça ne Marche Toujours Pas:

### Vérification Manuelle:

1. **Ouvrez un nouveau terminal**
2. **Tapez ces commandes:**

```bash
cd C:\Projet-Stage-2026\back-end\flaskapp

# Activer l'environnement virtuel
venv\Scripts\activate

# Vérifier que Flask est installé
python -c "import flask; print('Flask OK')"

# Démarrer le serveur
python run.py
```

### Vérifier le Port:

Si le port 5000 est déjà utilisé:

```bash
# Voir ce qui utilise le port 5000
netstat -ano | findstr :5000

# Arrêter le processus (remplacez PID par le numéro)
taskkill /F /PID <PID>
```

## 🚨 Erreurs Communes:

### 1. "ModuleNotFoundError: No module named 'flask'"
**Solution:**
```bash
pip install -r requirements.txt
```

### 2. "Address already in use"
**Solution:** Le port 5000 est déjà utilisé. Arrêtez l'autre processus ou changez le port.

### 3. "Python n'est pas reconnu"
**Solution:** Python n'est pas dans le PATH. Réinstallez Python et cochez "Add Python to PATH".

## ✅ Checklist:

- [ ] Backend démarré (vous voyez "Running on...")
- [ ] Frontend démarré (vous voyez "listening on localhost:4200")
- [ ] Pas d'erreurs dans la console du backend
- [ ] Le port 5000 est accessible

## 🎉 Après ça:

Une fois le backend démarré, tout devrait fonctionner!

**Double-cliquez sur `VERIFIER_ET_DEMARRER.bat` maintenant!**
