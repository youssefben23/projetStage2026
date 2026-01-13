# 🔧 Solution: Erreur de Connexion

## 🎯 Le Problème:

Vous voyez **"Erreur de connexion"** dans l'interface.

Dans les DevTools (Network), vous voyez que les requêtes "login" échouent avec **(failed)**.

## ✅ Cause:

Le **Backend Flask n'est pas démarré**!

Le frontend essaie de se connecter à `http://localhost:5000/api/auth/login` mais le serveur Flask n'est pas actif.

## 🚀 SOLUTION EN 1 CLIC:

### Double-cliquez sur:
```
DEMARRER_PROJET_COMPLET.bat
```

Ce script démarre automatiquement:
- ✅ **Backend Flask** sur http://localhost:5000
- ✅ **Frontend Angular** sur http://localhost:4200

**DEUX fenêtres vont s'ouvrir - NE FERMEZ AUCUNE DES DEUX!**

## 🔄 Ou Manuellement:

### Fenêtre 1 - Backend:
```bash
cd C:\Projet-Stage-2026\back-end\flaskapp
venv\Scripts\activate
python run.py
```

Vous devriez voir: `Running on http://127.0.0.1:5000`

### Fenêtre 2 - Frontend:
```bash
cd C:\Projet-Stage-2026\front-end
npm start
```

Vous devriez voir: `Angular Live Development Server is listening on localhost:4200`

## ✅ Vérification:

1. **Backend démarré?** → Vérifiez la fenêtre 1, vous devriez voir "Running on..."
2. **Frontend démarré?** → Vérifiez la fenêtre 2, vous devriez voir "listening on localhost:4200"
3. **Testez la connexion** → Retournez sur http://localhost:4200 et connectez-vous

## 🎉 Après ça:

- ✅ La connexion fonctionnera
- ✅ Vous pourrez créer des templates
- ✅ Tout fonctionnera parfaitement!

## 💡 Important:

**GARDEZ LES DEUX FENÊTRES OUVERTES!**
- Si vous fermez le backend → L'application ne pourra plus se connecter
- Si vous fermez le frontend → L'application ne s'affichera plus

**Double-cliquez sur `DEMARRER_PROJET_COMPLET.bat` maintenant!**
