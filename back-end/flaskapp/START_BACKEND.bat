@echo off
REM ============================================
REM Script de démarrage du Backend Flask
REM ============================================

echo ========================================
echo   DEMARRAGE BACKEND FLASK
echo ========================================
echo.

REM Se placer dans le dossier backend
cd /d "%~dp0"

REM Vérifier si l'environnement virtuel existe
if not exist "venv" (
    echo [ERREUR] Environnement virtuel non trouvé!
    echo Créez-le avec: python -m venv venv
    pause
    exit /b 1
)

REM Activer l'environnement virtuel
echo [1/4] Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Installer/Mettre à jour les dépendances
echo.
echo [2/4] Installation des dépendances...
pip install -r requirements.txt --quiet

REM Vérifier la connexion MySQL
echo.
echo [3/4] Vérification de la base de données...
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.engine.connect(); print('✅ Connexion MySQL OK')" 2>nul
if errorlevel 1 (
    echo [AVERTISSEMENT] Impossible de se connecter à MySQL
    echo Vérifiez que MySQL est démarré et que la base 'email_template_platform' existe
)

REM Démarrer Flask
echo.
echo [4/4] Démarrage du serveur Flask...
echo.
echo ========================================
echo   Backend disponible sur:
echo   http://localhost:5000
echo   http://localhost:5000/api/health
echo ========================================
echo.
echo Appuyez sur CTRL+C pour arrêter
echo.

python run.py

pause
