# ✅ Solution: Erreur CORS

## 🎯 Le Problème:

Vous voyez des erreurs **"CORS er..."** dans les DevTools.

Cela signifie que le backend Flask bloque les requêtes depuis le frontend Angular.

## ✅ Solution Appliquée:

J'ai corrigé la configuration CORS dans le backend pour autoriser les requêtes depuis:
- ✅ `http://localhost:4200`
- ✅ `http://127.0.0.1:4200`

## 🚀 Redémarrer le Backend:

### IMPORTANT: Vous devez redémarrer le backend!

1. **Fermez** la fenêtre du backend (Ctrl+C)
2. **Redémarrez** le backend:

```bash
cd C:\Projet-Stage-2026\back-end\flaskapp
venv\Scripts\activate
python run.py
```

**OU double-cliquez sur:**
```
back-end/flaskapp/DEMARRER_BACKEND_CORRIGE.bat
```

## ✅ Après Redémarrage:

1. ✅ Le backend autorisera les requêtes CORS
2. ✅ Les requêtes `/api/templates` fonctionneront
3. ✅ Vous pourrez créer des templates
4. ✅ Tout fonctionnera!

## 🎉 Test:

1. Redémarrez le backend
2. Retournez sur http://localhost:4200
3. Essayez de créer un template
4. ✅ Ça devrait fonctionner maintenant!

**Redémarrez le backend et tout fonctionnera!**
