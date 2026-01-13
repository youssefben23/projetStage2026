@echo off
cls
echo ============================================
echo INSTALLATION ET DEMARRAGE - SOLUTION FINALE
echo ============================================
echo.

REM Changer vers le bon dossier
cd /d "%~dp0"

echo [1/5] Nettoyage complet...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del /q package-lock.json
if exist ".angular" rmdir /s /q .angular
echo OK!
echo.

echo [2/5] Installation de base (5-10 minutes)...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo Erreur, tentative avec --force...
    call npm install --force --legacy-peer-deps
)
echo.

echo [3/5] Installation FORCEE de @angular/common...
call npm install @angular/common@21.0.8 --save --force --legacy-peer-deps
echo.

echo [4/5] Installation FORCEE de @angular/core...
call npm install @angular/core@21.0.8 --save --force --legacy-peer-deps
echo.

echo [5/5] Demarrage de l'application...
echo.
echo ============================================
echo L'APPLICATION VA DEMARRER!
echo ============================================
echo.
echo Ouvrez http://localhost:4200 dans votre navigateur
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.
timeout /t 3 /nobreak >nul

call npm start
