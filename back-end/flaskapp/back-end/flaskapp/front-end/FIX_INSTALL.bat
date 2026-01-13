@echo off
echo ============================================
echo CORRECTION DU PROBLEME D'INSTALLATION
echo ============================================
echo.

echo [1/3] Suppression de node_modules et package-lock.json...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo node_modules supprime
)
if exist "package-lock.json" (
    del package-lock.json
    echo package-lock.json supprime
)
echo.

echo [2/3] Mise a jour de package.json avec TypeScript 5.9...
echo (Deja fait - typescript: ~5.9.0)
echo.

echo [3/3] Installation avec legacy-peer-deps...
call npm install --legacy-peer-deps
echo.

if errorlevel 1 (
    echo ERREUR lors de l'installation
    echo.
    echo Essayez cette commande manuellement:
    echo npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo ============================================
echo INSTALLATION REUSSIE!
echo ============================================
echo.
echo Vous pouvez maintenant demarrer avec:
echo npm start
echo.
pause
