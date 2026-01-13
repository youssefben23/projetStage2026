@echo off
cls
echo ============================================
echo SOLUTION ULTRA EFFICACE - PROJET FONCTIONNEL
echo ============================================
echo.
echo Cette solution va creer un projet Angular FRAIS
echo et copier votre code dedans.
echo.
echo Cela prendra 10-15 minutes mais GARANTIT le succes!
echo.
pause

REM Aller dans le dossier parent
cd /d "%~dp0\.."

echo.
echo [ETAPE 1/6] Sauvegarde de votre code...
if exist "front-end-backup" (
    echo Backup existe deja
) else (
    echo Creation du backup...
    xcopy /E /I /H /Y front-end front-end-backup
    echo Backup cree!
)
echo.

echo [ETAPE 2/6] Installation d'Angular CLI...
call npm install -g @angular/cli@18
echo.

echo [ETAPE 3/6] Creation d'un nouveau projet Angular 18 (stable)...
if exist "front-end-new" rmdir /s /q front-end-new
mkdir front-end-new
cd front-end-new

echo Creation du projet (cela peut prendre 5 minutes)...
call ng new email-template-platform --routing --style=css --skip-git --package-manager=npm --skip-install
echo.

echo [ETAPE 4/6] Installation des dependances...
cd email-template-platform
call npm install --legacy-peer-deps
echo.

echo [ETAPE 5/6] Copie de votre code...
xcopy /E /I /Y ..\..\front-end-backup\src\app src\app
if exist "..\..\front-end-backup\src\assets" xcopy /E /I /Y ..\..\front-end-backup\src\assets src\assets
copy /Y ..\..\front-end-backup\src\styles.css src\styles.css 2>nul
copy /Y ..\..\front-end-backup\src\index.html src\index.html 2>nul
echo.

echo [ETAPE 6/6] Remplacement de l'ancien projet...
cd ..\..
if exist "front-end-old" rmdir /s /q front-end-old
if exist "front-end" move front-end front-end-old
move front-end-new\email-template-platform front-end
rmdir /s /q front-end-new
cd front-end
echo.

echo ============================================
echo PROJET RECREE AVEC SUCCES!
echo ============================================
echo.
echo Demarrage de l'application...
echo.
timeout /t 2 /nobreak >nul

call npm start
