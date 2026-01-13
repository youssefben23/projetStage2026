@echo off
cls
echo ============================================
echo SOLUTION SIMPLE - PROJET FONCTIONNEL
echo ============================================
echo.
echo Je vais tout installer proprement!
echo Cela prendra 5-10 minutes. NE FERMEZ PAS!
echo.
pause

REM Aller dans le bon dossier
cd /d "%~dp0"

echo.
echo [ETAPE 1] Nettoyage...
if exist "node_modules" (
    echo Suppression de node_modules...
    rmdir /s /q node_modules
)
if exist "package-lock.json" del /q package-lock.json
if exist ".angular" rmdir /s /q .angular
echo OK!
echo.

echo [ETAPE 2] Installation (5-10 minutes, soyez patient!)...
call npm install --legacy-peer-deps
echo.

echo [ETAPE 3] Demarrage de l'application...
echo.
echo ============================================
echo L'APPLICATION VA DEMARRER!
echo ============================================
echo.
echo Ouvrez http://localhost:4200 dans votre navigateur
echo.
timeout /t 2 /nobreak >nul

call npm start
