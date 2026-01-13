@echo off
cls
echo ============================================
echo VERIFICATION ET DEMARRAGE DU BACKEND
echo ============================================
echo.

cd /d "%~dp0"

REM Vérifier si le port 5000 est déjà utilisé
echo [1/4] Verification du port 5000...
netstat -an | findstr :5000 >nul
if %errorlevel% == 0 (
    echo ATTENTION: Le port 5000 est deja utilise!
    echo.
    echo Voulez-vous arreter le processus existant? (O/N)
    set /p choice=
    if /i "%choice%"=="O" (
        echo Arret des processus sur le port 5000...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
    )
)

REM Activer l'environnement virtuel
echo.
echo [2/4] Activation de l'environnement virtuel...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo OK!
) else (
    echo ERREUR: Environnement virtuel non trouve!
    echo Creer un environnement virtuel avec: python -m venv venv
    pause
    exit /b 1
)

REM Vérifier Python
echo.
echo [3/4] Verification de Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Python n'est pas installe ou pas dans le PATH!
    pause
    exit /b 1
)
python --version

REM Vérifier les dépendances
echo.
echo [4/4] Verification des dependances...
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Flask n'est pas installe!
    echo Installation des dependances...
    pip install -r requirements.txt
)

echo.
echo ============================================
echo DEMARRAGE DU SERVEUR FLASK
echo ============================================
echo.
echo Le serveur va demarrer sur: http://localhost:5000
echo.
echo IMPORTANT: NE FERMEZ PAS CETTE FENETRE!
echo.
echo Si vous voyez "Running on http://127.0.0.1:5000" c'est bon!
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
timeout /t 3 /nobreak >nul

python run.py
