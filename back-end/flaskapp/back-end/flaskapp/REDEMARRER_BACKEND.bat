@echo off
cls
echo ============================================
echo REDEMARRAGE COMPLET DU BACKEND
echo ============================================
echo.

cd /d "%~dp0"

REM Arrêter tous les processus Python sur le port 5000
echo [1/3] Arret des processus existants...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Arret du processus PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

REM Activer l'environnement virtuel
echo.
echo [2/3] Activation de l'environnement virtuel...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo OK!
) else (
    echo ERREUR: Environnement virtuel non trouve!
    pause
    exit /b 1
)

REM Démarrer le serveur
echo.
echo [3/3] Demarrage du serveur Flask...
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
