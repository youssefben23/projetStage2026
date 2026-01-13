@echo off
echo ============================================
echo CREATION D'UN PROJET ANGULAR FRAIS
echo ============================================
echo.
echo ATTENTION: Cette solution va creer un nouveau projet Angular
echo et copier votre code dedans.
echo.
echo Cela va prendre 10-15 minutes.
echo.
pause

echo.
echo [ETAPE 1] Creation d'un nouveau projet Angular...
cd ..
if exist "front-end-backup" (
    echo Le backup existe deja
) else (
    echo Creation d'un backup...
    xcopy /E /I /H /Y front-end front-end-backup
    echo Backup cree!
)

echo.
echo [ETAPE 2] Suppression de l'ancien projet...
cd front-end
if exist "node_modules" (
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    del package-lock.json
)
echo.

echo [ETAPE 3] Creation d'un nouveau projet Angular...
cd ..
rmdir /s /q front-end-temp
mkdir front-end-temp
cd front-end-temp

echo Installation d'Angular CLI globalement...
call npm install -g @angular/cli@21

echo Creation du nouveau projet...
call ng new email-template-platform --routing --style=css --skip-git --package-manager=npm
echo.

echo [ETAPE 4] Copie de votre code...
xcopy /E /I /Y ..\front-end\src\app email-template-platform\src\app
xcopy /E /I /Y ..\front-end\src\assets email-template-platform\src\assets 2>nul
copy ..\front-end\src\styles.css email-template-platform\src\styles.css
copy ..\front-end\src\index.html email-template-platform\src\index.html
echo.

echo [ETAPE 5] Installation des dependances...
cd email-template-platform
call npm install --legacy-peer-deps
echo.

echo [ETAPE 6] Remplacement de l'ancien projet...
cd ..
rmdir /s /q ..\front-end
move email-template-platform ..\front-end
cd ..\front-end
echo.

echo ============================================
echo PROJET RECREE AVEC SUCCES!
echo ============================================
echo.
echo Maintenant testez:
echo npm start
echo.
pause
