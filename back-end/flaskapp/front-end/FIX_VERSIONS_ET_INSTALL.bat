@echo off
echo ============================================
echo CORRECTION DES VERSIONS ET INSTALLATION
echo ============================================
echo.
echo Cette operation va:
echo 1. Corriger les versions Angular (toutes en 21.0.8)
echo 2. Supprimer l'ancienne installation
echo 3. Reinstaller avec les bonnes versions
echo.
echo Cela prendra 5-10 minutes. NE FERMEZ PAS!
echo.
pause

echo.
echo [ETAPE 1/4] Suppression de l'ancienne installation...
if exist "node_modules" (
    echo Suppression de node_modules...
    rmdir /s /q node_modules
    echo OK!
)
if exist "package-lock.json" (
    del package-lock.json
    echo package-lock.json supprime
)
if exist ".angular" (
    rmdir /s /q .angular
    echo Cache Angular supprime
)
echo.

echo [ETAPE 2/4] Nettoyage du cache npm...
call npm cache clean --force
echo Cache nettoye
echo.

echo [ETAPE 3/4] Installation avec les versions corrigees...
echo (Cela va prendre 5-10 minutes, soyez patient!)
echo.
call npm install --legacy-peer-deps
echo.

if errorlevel 1 (
    echo.
    echo Tentative avec --force...
    call npm install --force --legacy-peer-deps
)

echo.
echo [ETAPE 4/4] Verification des versions...
echo.
echo Verification de @angular/common...
call npm list @angular/common
echo.
echo Verification de @angular/core...
call npm list @angular/core
echo.

echo ============================================
echo INSTALLATION TERMINEE!
echo ============================================
echo.
echo Maintenant, demarrez avec:
echo npm start
echo.
echo Votre application sera sur: http://localhost:4200
echo.
pause
