@echo off
echo ============================================
echo INSTALLATION DEFINITIVE - PROJET FONCTIONNEL
echo ============================================
echo.
echo Cette installation va corriger TOUS les problemes!
echo Cela prendra 5-10 minutes. NE FERMEZ PAS CETTE FENETRE!
echo.
pause

echo.
echo [ETAPE 1/5] Nettoyage complet...
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

echo [ETAPE 2/5] Installation de Node.js packages de base...
call npm cache clean --force
echo Cache npm nettoye
echo.

echo [ETAPE 3/5] Installation de TOUTES les dependances Angular...
echo (Cela va prendre 5-10 minutes, soyez TRES patient!)
echo.
call npm install --legacy-peer-deps --verbose
echo.

if errorlevel 1 (
    echo.
    echo Tentative avec --force...
    call npm install --force --legacy-peer-deps
)

echo.
echo [ETAPE 4/5] Verification de l'installation...
echo.
echo Verification de @angular/common...
call npm list @angular/common
echo.
echo Verification de @angular/core...
call npm list @angular/core
echo.
echo Verification de typescript...
call npm list typescript
echo.

echo [ETAPE 5/5] Installation explicite de @angular/common si necessaire...
call npm install @angular/common@^21.0.0 --save --legacy-peer-deps
echo.

echo ============================================
echo INSTALLATION TERMINEE!
echo ============================================
echo.
echo Maintenant, testez avec:
echo npm start
echo.
echo Si vous voyez encore des erreurs, executez:
echo npm install @angular/common@^21.0.0 --save --legacy-peer-deps
echo.
pause
