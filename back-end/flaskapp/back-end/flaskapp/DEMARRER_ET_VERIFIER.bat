@echo off
cls
echo ============================================
echo DEMARRAGE ET VERIFICATION DU BACKEND
echo ============================================
echo.
echo Ce script va:
echo 1. Demarrer le backend Flask
echo 2. Verifier que tout fonctionne
echo.
echo NE FERMEZ PAS CETTE FENETRE!
echo.
pause

cd /d "%~dp0"

REM Activer l'environnement virtuel si existe
if exist "venv\Scripts\activate.bat" (
    echo Activation de l'environnement virtuel...
    call venv\Scripts\activate.bat
)

echo.
echo ============================================
echo DEMARRAGE DU SERVEUR FLASK
echo ============================================
echo.
echo Le serveur sera accessible sur: http://localhost:5000
echo.
echo Si vous voyez "Running on http://127.0.0.1:5000" c'est bon!
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

python run.py
