@echo off
echo ============================================
echo CORRECTION COMPLETE - TOUT VA ETRE CORRIGE!
echo ============================================
echo.

echo [ETAPE 1/4] Suppression de l'ancienne installation...
if exist "node_modules" (
    echo Suppression de node_modules...
    rmdir /s /q node_modules
    echo OK!
)
if exist "package-lock.json" (
    echo Suppression de package-lock.json...
    del package-lock.json
    echo OK!
)
echo.

echo [ETAPE 2/4] Mise a jour de package.json...
echo - TypeScript: 5.3.3 -^> 5.9.0
echo - zone.js: 0.14.3 -^> 0.15.0
echo (Deja fait dans le fichier package.json)
echo.

echo [ETAPE 3/4] Installation propre avec les bonnes versions...
echo Cela peut prendre 3-5 minutes, soyez patient!
echo.
call npm install --legacy-peer-deps
echo.

if errorlevel 1 (
    echo.
    echo ERREUR lors de l'installation!
    echo Essayons avec --force...
    echo.
    call npm install --force --legacy-peer-deps
)

echo.
echo [ETAPE 4/4] Verification des versions installees...
echo.
call npm list typescript
call npm list zone.js
echo.

echo ============================================
echo VERIFICATION TERMINEE!
echo ============================================
echo.
echo Maintenant, essayez:
echo npm start
echo.
pause
