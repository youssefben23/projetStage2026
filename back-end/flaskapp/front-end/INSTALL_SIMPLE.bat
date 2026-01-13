@echo off
echo ============================================
echo INSTALLATION SIMPLE - NE VOUS INQUIETEZ PAS!
echo ============================================
echo.
echo Cette installation va prendre 2-5 minutes.
echo C'est normal si vous voyez beaucoup de texte defiler!
echo.
pause

echo.
echo [ETAPE 1/2] Installation des dependances...
echo (Cela peut prendre quelques minutes, soyez patient!)
echo.

call npm install --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo ============================================
    echo ERREUR DETECTEE
    echo ============================================
    echo.
    echo Ne paniquez pas! Voici ce que vous pouvez faire:
    echo.
    echo 1. Verifiez que Node.js est installe:
    echo    node --version
    echo.
    echo 2. Si Node.js n'est pas installe, telechargez-le depuis:
    echo    https://nodejs.org/
    echo.
    echo 3. Reessayez ensuite cette installation.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo INSTALLATION TERMINEE AVEC SUCCES!
echo ============================================
echo.
echo [ETAPE 2/2] Demarrage de l'application...
echo.
echo L'application va s'ouvrir dans votre navigateur.
echo Appuyez sur Ctrl+C pour arreter le serveur.
echo.
pause

call npm start
