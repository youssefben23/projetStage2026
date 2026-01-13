@echo off
echo ============================================
echo SETUP COMPLET DU PROJET
echo Plateforme de Gestion de Modeles d'E-mails
echo ============================================
echo.

REM Verifier Python
echo [ETAPE 1] Verification de Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe!
    pause
    exit /b 1
)
echo Python OK
echo.

REM Verifier Node.js
echo [ETAPE 2] Verification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe!
    echo Telechargez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js OK
echo.

REM Setup Backend
echo [ETAPE 3] Configuration du Backend Flask...
cd back-end\flaskapp

if not exist "venv" (
    echo Creation de l'environnement virtuel Python...
    python -m venv venv
)

echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo Installation des dependances Python...
pip install -r requirements.txt

echo Backend configure!
cd ..\..
echo.

REM Setup Frontend
echo [ETAPE 4] Configuration du Frontend Angular...
cd front-end

if not exist "node_modules" (
    echo Installation d'Angular CLI...
    call npm install -g @angular/cli@21
    
    echo Installation des dependances...
    call npm install
) else (
    echo Dependances deja installees
)

echo Frontend configure!
cd ..
echo.

echo ============================================
echo SETUP TERMINE AVEC SUCCES!
echo ============================================
echo.
echo Prochaines etapes:
echo 1. Configurer la base de donnees MySQL
echo 2. Demarrer le backend: cd back-end\flaskapp ^&^& python run.py
echo 3. Demarrer le frontend: cd front-end ^&^& npm start
echo.
pause
