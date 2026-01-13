@echo off
cls
echo ============================================
echo TEST DE CONNEXION AU BACKEND
echo ============================================
echo.

echo Test de connexion a http://localhost:5000/api/health...
echo.

curl http://localhost:5000/api/health 2>nul
if %errorlevel% == 0 (
    echo.
    echo ============================================
    echo SUCCES! Le backend est accessible!
    echo ============================================
) else (
    echo.
    echo ============================================
    echo ERREUR! Le backend n'est pas accessible!
    echo ============================================
    echo.
    echo Verifiez que:
    echo 1. Le backend est demarre
    echo 2. Le port 5000 n'est pas bloque
    echo 3. Aucun firewall ne bloque la connexion
    echo.
)

echo.
pause
