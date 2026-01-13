@echo off
cls
echo ============================================
echo CORRECTION FINALE - TOUS LES PROBLEMES
echo ============================================
echo.
echo Cette correction va:
echo 1. Arreter les processus existants
echo 2. Verifier les dependances
echo 3. Demarrer le serveur
echo.
echo NE FERMEZ PAS CETTE FENETRE!
echo.
pause

cd /d "%~dp0"

REM Arreter les processus Python sur le port 5000
echo [1/4] Arret des processus existants...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Arret du processus PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Activer l'environnement virtuel
echo.
echo [2/4] Activation de l'environnement virtuel...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo OK!
) else (
    echo ERREUR: Environnement virtuel non trouve!
    pause
    exit /b 1
)

REM Verifier les dependances
echo.
echo [3/4] Verification des dependances...
python -c "import flask; import flask_cors; import flask_sqlalchemy; print('OK')" 2>nul
if %errorlevel% neq 0 (
    echo Installation des dependances...
    pip install -r requirements.txt
)

REM Demarrer le serveur
echo.
echo [4/4] Demarrage du serveur Flask...
echo.
echo ============================================
echo LE SERVEUR VA DEMARRER
echo ============================================
echo.
echo Si vous voyez "Running on http://127.0.0.1:5000" c'est bon!
echo.
echo NE FERMEZ PAS CETTE FENETRE!
echo.
timeout /t 2 /nobreak >nul

python run.py
