# 🎯 Installation Ultra-Simple

## ⚠️ IMPORTANT: Ne vous inquiétez pas des erreurs!

Si vous voyez "fichier introuvable" pour `node_modules` ou `package-lock.json`, 
**C'EST NORMAL!** Ces fichiers n'existent que APRÈS l'installation.

## 🚀 Méthode la PLUS SIMPLE

### Option 1: Double-cliquer sur le fichier (RECOMMANDÉ)

1. Allez dans le dossier `front-end`
2. **Double-cliquez** sur `INSTALL_SIMPLE.bat`
3. Attendez 2-5 minutes
4. C'est tout!

### Option 2: Commandes manuelles (UNE PAR UNE)

Ouvrez le terminal (cmd) et tapez **UNE commande à la fois**:

```bash
# 1. Aller dans le dossier
cd C:\Projet-Stage-2026\front-end

# 2. Installer (ATTENDEZ que ça finisse!)
npm install --legacy-peer-deps

# 3. Démarrer (après que l'installation soit terminée)
npm start
```

## ⏱️ Temps d'attente normal

- `npm install` → **2-5 minutes** (c'est normal!)
- `npm start` → **30-60 secondes** la première fois

## ✅ Comment savoir que ça marche?

### Pendant `npm install`:
- Vous verrez beaucoup de texte défiler
- À la fin: "added X packages" ou "up to date"
- Un dossier `node_modules` sera créé

### Pendant `npm start`:
- Vous verrez "Compiling..."
- Puis "Application is running on: http://localhost:4200"
- Votre navigateur s'ouvrira automatiquement

## 🆘 Problèmes courants

### "npm n'est pas reconnu"
→ Installez Node.js: https://nodejs.org/ (choisissez la version LTS)

### "Port 4200 already in use"
→ Fermez les autres fenêtres de terminal, ou utilisez:
```bash
npm start -- --port 4201
```

### L'installation prend très longtemps
→ **C'est normal!** La première installation peut prendre 5-10 minutes.
→ Ne fermez pas la fenêtre, laissez-la finir.

## 💡 Conseil Important

**NE COPIEZ PAS PLUSIEURS COMMANDES EN MÊME TEMPS!**

❌ **MAUVAIS:**
```bash
cd front-end && npm install && npm start
```

✅ **BON:**
```bash
cd front-end
```
(Attendre)
```bash
npm install --legacy-peer-deps
```
(Attendre 2-5 minutes)
```bash
npm start
```

## 🎉 Une fois que ça marche

Vous verrez votre application sur: **http://localhost:4200**

Tout est sauvegardé! Vous n'aurez plus besoin de réinstaller sauf si vous supprimez le dossier `node_modules`.
