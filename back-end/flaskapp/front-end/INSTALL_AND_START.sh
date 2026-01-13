#!/bin/bash

echo "============================================"
echo "Installation et Démarrage Angular 21"
echo "============================================"
echo ""

# Vérifier Node.js
echo "[1/4] Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERREUR: Node.js n'est pas installé!"
    echo "Téléchargez Node.js depuis https://nodejs.org/"
    exit 1
fi
echo "Node.js OK ($(node --version))"
echo ""

# Vérifier npm
echo "[2/4] Vérification de npm..."
if ! command -v npm &> /dev/null; then
    echo "ERREUR: npm n'est pas installé!"
    exit 1
fi
echo "npm OK ($(npm --version))"
echo ""

# Installer Angular CLI globalement si nécessaire
echo "[3/4] Installation d'Angular CLI..."
if ! command -v ng &> /dev/null; then
    echo "Angular CLI non trouvé. Installation en cours..."
    npm install -g @angular/cli@21
    if [ $? -ne 0 ]; then
        echo "ERREUR: Impossible d'installer Angular CLI"
        exit 1
    fi
    echo "Angular CLI installé avec succès!"
else
    echo "Angular CLI déjà installé ($(ng version | head -n 1))"
fi
echo ""

# Installer les dépendances du projet
echo "[4/4] Installation des dépendances du projet..."
if [ ! -d "node_modules" ]; then
    echo "Installation de node_modules en cours..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERREUR: Impossible d'installer les dépendances"
        exit 1
    fi
    echo "Dépendances installées avec succès!"
else
    echo "Dépendances déjà installées"
fi
echo ""

# Démarrer le serveur
echo "============================================"
echo "Démarrage du serveur Angular..."
echo "============================================"
echo ""
echo "L'application sera accessible sur: http://localhost:4200"
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

npm start
