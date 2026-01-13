# 🎯 Guide Simple - Étape par Étape (Ne vous inquiétez pas!)

## ✅ Tout va bien! Les erreurs sont normales

Les messages "fichier introuvable" sont **NORMALS** si vous n'avez jamais installé les dépendances avant. C'est parfait!

## 📝 Instructions SIMPLES (copiez-collez une par une)

### Étape 1: Ouvrir le Terminal
- Appuyez sur `Windows + R`
- Tapez `cmd` et appuyez sur Entrée

### Étape 2: Aller dans le bon dossier
```bash
cd C:\Projet-Stage-2026\front-end
```

### Étape 3: Installer (UNE SEULE COMMANDE)
```bash
npm install --legacy-peer-deps
```

**C'est tout!** Attendez que ça finisse (ça peut prendre 2-5 minutes)

### Étape 4: Démarrer l'application
```bash
npm start
```

## 🚨 Si vous voyez des erreurs

### Erreur: "npm n'est pas reconnu"
→ Installez Node.js depuis https://nodejs.org/

### Erreur: "Cannot find module"
→ C'est normal au début, continuez l'installation

### Erreur: "Port 4200 already in use"
→ Fermez les autres fenêtres de terminal ou utilisez:
```bash
npm start -- --port 4201
```

## 💡 Astuce Importante

**NE COPIEZ PAS PLUSIEURS LIGNES EN MÊME TEMPS!**
- Copiez UNE commande à la fois
- Appuyez sur Entrée
- Attendez que ça finisse
- Puis copiez la commande suivante

## ✅ Checklist de Vérification

Après `npm install --legacy-peer-deps`, vous devriez voir:
- ✅ Un dossier `node_modules` créé
- ✅ Un fichier `package-lock.json` créé
- ✅ Le message "added X packages"

Ensuite `npm start` devrait:
- ✅ Compiler l'application
- ✅ Afficher "Application is running on: http://localhost:4200"

## 🆘 Besoin d'aide?

Si quelque chose ne va pas, dites-moi exactement quel message d'erreur vous voyez et je vous aiderai!
