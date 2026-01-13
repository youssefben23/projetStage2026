# 🔧 Problème: Erreur de Connexion

## 🎯 Le Problème:

Vous voyez "Erreur de connexion" parce que le **Backend Flask n'est pas démarré**.

Le frontend essaie de se connecter à `http://localhost:5000` mais le serveur n'est pas actif.

## ✅ SOLUTION SIMPLE:

### Étape 1: Démarrer le Backend

Ouvrez un **NOUVEAU terminal** et tapez:

```bash
cd C:\Projet-Stage-2026\back-end\flaskapp

# Activer l'environnement virtuel (si nécessaire)
venv\Scripts\activate

# Démarrer le serveur
python run.py
```

Vous devriez voir:
```
 * Running on http://127.0.0.1:5000
```

### Étape 2: Garder les Deux Fenêtres Ouvertes

- **Fenêtre 1:** Backend Flask (port 5000) - NE FERMEZ PAS
- **Fenêtre 2:** Frontend Angular (port 4200) - NE FERMEZ PAS

### Étape 3: Réessayer la Connexion

Retournez sur http://localhost:4200 et essayez de vous connecter à nouveau.

## 🚀 SOLUTION AUTOMATIQUE:

### Double-cliquez sur:
```
DEMARRER_TOUT.bat
```

Ce script démarre automatiquement:
- ✅ Backend Flask sur le port 5000
- ✅ Frontend Angular sur le port 4200

## ✅ Vérification:

1. Backend démarré → Vous voyez "Running on http://127.0.0.1:5000"
2. Frontend démarré → Vous voyez "Angular Live Development Server is listening on localhost:4200"
3. Testez la connexion → Ça devrait fonctionner!

## 🎉 Après ça, tout fonctionnera!
