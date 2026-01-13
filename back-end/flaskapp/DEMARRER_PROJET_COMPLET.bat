@echo off
cls
echo ============================================
echo DEMARRAGE COMPLET DU PROJET
echo ============================================
echo.
echo Ce script va demarrer:
echo 1. Backend Flask (port 5000)
echo 2. Frontend Angular (port 4200)
echo.
echo DEUX FENETRES VONT S'OUVRIR
echo NE FERMEZ AUCUNE DES DEUX!
echo.
pause

REM Demarrer le backend dans une nouvelle fenetre
echo Demarrage du Backend...
start "Backend Flask - Port 5000" cmd /k "cd /d %~dp0back-end\flaskapp && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && echo Backend Flask demarre... && python run.py"

REM Attendre 5 secondes pour que le backend demarre
echo.
echo Attente du demarrage du backend (5 secondes)...
timeout /t 5 /nobreak >nul

REM Demarrer le frontend dans une nouvelle fenetre
echo Demarrage du Frontend...
start "Frontend Angular - Port 4200" cmd /k "cd /d %~dp0front-end && echo Frontend Angular demarre... && npm start"

echo.
echo ============================================
echo LES DEUX SERVEURS SONT EN TRAIN DE DEMARRER!
echo ============================================
echo.
echo Backend Flask: http://localhost:5000
echo Frontend Angular: http://localhost:4200
echo.
echo Ouvrez http://localhost:4200 dans votre navigateur
echo.
echo DEUX FENETRES SONT OUVERTES - NE LES FERMEZ PAS!
echo.
pause
