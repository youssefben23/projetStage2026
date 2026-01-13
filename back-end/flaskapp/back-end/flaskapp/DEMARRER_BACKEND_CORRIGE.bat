@echo off
cls
echo ============================================
echo DEMARRAGE DU BACKEND FLASK (CORRIGE)
echo ============================================
echo.
echo Le backend va demarrer sur http://localhost:5000
echo.
echo NE FERMEZ PAS CETTE FENETRE!
echo.
pause

REM Aller dans le bon dossier
cd /d "%~dp0"

REM Activer l'environnement virtuel si existe
if exist "venv\Scripts\activate.bat" (
    echo Activation de l'environnement virtuel...
    call venv\Scripts\activate.bat
)

echo.
echo Demarrage du serveur Flask...
echo.
echo Le serveur sera accessible sur: http://localhost:5000
echo.
echo Si vous voyez "Running on http://127.0.0.1:5000" c'est bon!
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

python run.py
