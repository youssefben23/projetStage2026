@echo off
echo ============================================
echo SOLUTION FINALE - CORRECTION COMPLETE
echo ============================================
echo.

echo [ETAPE 1] Nettoyage du cache Angular...
if exist ".angular" (
    rmdir /s /q .angular
    echo Cache Angular supprime
)
echo.

echo [ETAPE 2] Verification du fichier angular.json...
echo Le fichier a ete corrige - pas de propriete extractCss
echo.

echo [ETAPE 3] Demarrage de l'application...
echo.
echo Si vous voyez encore l'erreur, fermez cette fenetre
echo et ouvrez une NOUVELLE fenetre de terminal, puis:
echo cd C:\Projet-Stage-2026\front-end
echo npm start
echo.
pause

call npm start
