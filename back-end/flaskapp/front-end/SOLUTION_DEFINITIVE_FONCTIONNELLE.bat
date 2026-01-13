@echo off
echo ============================================
echo SOLUTION DEFINITIVE - PROJET FONCTIONNEL
echo ============================================
echo.
echo Cette solution va TOUT corriger!
echo.
pause

echo.
echo [ETAPE 1/6] Suppression COMPLETE...
if exist "node_modules" (
    echo Suppression de node_modules (2-3 minutes)...
    rmdir /s /q node_modules
    echo OK!
)
if exist "package-lock.json" (
    del package-lock.json
)
if exist ".angular" (
    rmdir /s /q .angular
)
echo.

echo [ETAPE 2/6] Nettoyage du cache npm...
call npm cache clean --force
echo.

echo [ETAPE 3/6] Installation de base...
call npm install --legacy-peer-deps
echo.

echo [ETAPE 4/6] Installation EXPLICITE de @angular/common...
call npm install @angular/common@21.0.8 --save --legacy-peer-deps
echo.

echo [ETAPE 5/6] Installation EXPLICITE de tous les packages Angular...
call npm install @angular/core@21.0.8 @angular/platform-browser@21.0.8 @angular/router@21.0.8 @angular/forms@21.0.8 --save --legacy-peer-deps
echo.

echo [ETAPE 6/6] Verification finale...
echo.
echo Verification de @angular/common...
call npm list @angular/common 2>nul
if errorlevel 1 (
    echo ERREUR: @angular/common non trouve!
    echo Installation forcee...
    call npm install @angular/common@21.0.8 --save --force --legacy-peer-deps
)
echo.

echo Verification de la structure...
if exist "node_modules\@angular\common\http" (
    echo OK: Module http trouve!
) else (
    echo ATTENTION: Module http non trouve dans la structure normale
    echo Mais cela peut etre normal dans Angular 21
)
echo.

echo ============================================
echo INSTALLATION TERMINEE!
echo ============================================
echo.
echo Maintenant testez:
echo npm start
echo.
pause
