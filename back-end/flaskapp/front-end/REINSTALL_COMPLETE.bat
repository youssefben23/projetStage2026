@echo off
echo ============================================
echo REINSTALLATION COMPLETE - CORRECTION TOTALE
echo ============================================
echo.

echo Cette operation va:
echo 1. Supprimer node_modules et package-lock.json
echo 2. Reinstaller TOUTES les dependances Angular
echo 3. Corriger les problemes de modules manquants
echo.
echo Cela peut prendre 5-10 minutes. NE FERMEZ PAS CETTE FENETRE!
echo.
pause

echo.
echo [ETAPE 1/3] Nettoyage complet...
if exist "node_modules" (
    echo Suppression de node_modules (cela peut prendre 1-2 minutes)...
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

echo [ETAPE 2/3] Installation propre de TOUTES les dependances...
echo (Cela va prendre 5-10 minutes, soyez patient!)
echo.
call npm install --legacy-peer-deps
echo.

if errorlevel 1 (
    echo.
    echo ERREUR! Tentative avec --force...
    call npm install --force --legacy-peer-deps
)

echo.
echo [ETAPE 3/3] Verification de l'installation...
echo.
echo Verification de @angular/common...
call npm list @angular/common
echo.
echo Verification de typescript...
call npm list typescript
echo.

echo ============================================
echo INSTALLATION TERMINEE!
echo ============================================
echo.
echo Maintenant essayez:
echo npm start
echo.
pause
