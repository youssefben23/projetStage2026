@echo off
echo ============================================
echo Installation et Demarrage Angular 21
echo ============================================
echo.

REM Verifier Node.js
echo [1/4] Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe!
    echo Telechargez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js OK
echo.

REM Verifier npm
echo [2/4] Verification de npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: npm n'est pas installe!
    pause
    exit /b 1
)
echo npm OK
echo.

REM Installer Angular CLI globalement si necessaire
echo [3/4] Installation d'Angular CLI...
ng version >nul 2>&1
if errorlevel 1 (
    echo Angular CLI non trouve. Installation en cours...
    npm install -g @angular/cli@21
    if errorlevel 1 (
        echo ERREUR: Impossible d'installer Angular CLI
        pause
        exit /b 1
    )
    echo Angular CLI installe avec succes!
) else (
    echo Angular CLI deja installe
)
echo.

REM Installer les dependances du projet
echo [4/4] Installation des dependances du projet...
if not exist "node_modules" (
    echo Installation de node_modules en cours...
    call npm install
    if errorlevel 1 (
        echo ERREUR: Impossible d'installer les dependances
        pause
        exit /b 1
    )
    echo Dependances installees avec succes!
) else (
    echo Dependances deja installees
)
echo.

REM Demarrer le serveur
echo ============================================
echo Demarrage du serveur Angular...
echo ============================================
echo.
echo L'application sera accessible sur: http://localhost:4200
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm start

pause
