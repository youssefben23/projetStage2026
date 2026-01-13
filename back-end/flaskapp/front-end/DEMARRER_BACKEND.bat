@echo off
echo ============================================
echo DEMARRAGE DU BACKEND FLASK
echo ============================================
echo.
echo Le backend va demarrer sur http://localhost:5000
echo.
echo NE FERMEZ PAS CETTE FENETRE!
echo.
pause

cd /d "%~dp0\..\..\back-end\flaskapp"

REM Activer l'environnement virtuel si existe
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

echo Demarrage du serveur Flask...
python run.py
