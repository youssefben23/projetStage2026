@echo off
echo ============================================
echo DEMARRAGE COMPLET DU PROJET
echo ============================================
echo.
echo Ce script va demarrer:
echo 1. Le backend Flask (port 5000)
echo 2. Le frontend Angular (port 4200)
echo.
echo NE FERMEZ PAS LES FENETRES!
echo.
pause

REM Demarrer le backend dans une nouvelle fenetre
start "Backend Flask" cmd /k "cd /d %~dp0back-end\flaskapp && if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) && python run.py"

REM Attendre un peu pour que le backend demarre
timeout /t 5 /nobreak >nul

REM Demarrer le frontend dans une nouvelle fenetre
start "Frontend Angular" cmd /k "cd /d %~dp0front-end && npm start"

echo.
echo ============================================
echo LES DEUX SERVEURS SONT EN TRAIN DE DEMARRER!
echo ============================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:4200
echo.
echo Ouvrez http://localhost:4200 dans votre navigateur
echo.
pause
