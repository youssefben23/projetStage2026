@echo off
echo ============================================
echo VERIFICATION ET CORRECTION AUTOMATIQUE
echo ============================================
echo.

echo [1] Verification de @angular/common...
call npm list @angular/common 2>nul
if errorlevel 1 (
    echo @angular/common MANQUANT! Installation...
    call npm install @angular/common@^21.0.0 --save --legacy-peer-deps
)

echo.
echo [2] Verification de @angular/core...
call npm list @angular/core 2>nul
if errorlevel 1 (
    echo @angular/core MANQUANT! Installation...
    call npm install @angular/core@^21.0.0 --save --legacy-peer-deps
)

echo.
echo [3] Verification de typescript...
call npm list typescript 2>nul | findstr "5.9"
if errorlevel 1 (
    echo TypeScript version incorrecte! Mise a jour...
    call npm install typescript@~5.9.0 --save-dev --legacy-peer-deps
)

echo.
echo [4] Verification de zone.js...
call npm list zone.js 2>nul | findstr "0.15"
if errorlevel 1 (
    echo zone.js version incorrecte! Mise a jour...
    call npm install zone.js@~0.15.0 --save --legacy-peer-deps
)

echo.
echo ============================================
echo VERIFICATION TERMINEE!
echo ============================================
echo.
echo Tous les packages sont maintenant corrects.
echo Essayez: npm start
echo.
pause
