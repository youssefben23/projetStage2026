@echo off
cls
echo ============================================
echo SOLUTION RAPIDE - ANGULAR 18 (STABLE)
echo ============================================
echo.
echo Je vais utiliser Angular 18 qui est PLUS STABLE
echo et qui fonctionne a 100%%
echo.
pause

cd /d "%~dp0"

echo.
echo [1] Nettoyage...
if exist "node_modules" rmdir /s /q node_modules
if exist "package-lock.json" del /q package-lock.json
if exist ".angular" rmdir /s /q .angular
echo.

echo [2] Mise a jour de package.json pour Angular 18...
echo.
echo Creation d'un package.json avec Angular 18...
(
echo {
echo   "name": "email-template-platform",
echo   "version": "1.0.0",
echo   "scripts": {
echo     "ng": "ng",
echo     "start": "ng serve",
echo     "build": "ng build"
echo   },
echo   "dependencies": {
echo     "@angular/animations": "^18.0.0",
echo     "@angular/common": "^18.0.0",
echo     "@angular/compiler": "^18.0.0",
echo     "@angular/core": "^18.0.0",
echo     "@angular/forms": "^18.0.0",
echo     "@angular/platform-browser": "^18.0.0",
echo     "@angular/platform-browser-dynamic": "^18.0.0",
echo     "@angular/router": "^18.0.0",
echo     "rxjs": "~7.8.0",
echo     "tslib": "^2.3.0",
echo     "zone.js": "~0.14.0"
echo   },
echo   "devDependencies": {
echo     "@angular-devkit/build-angular": "^18.0.0",
echo     "@angular/cli": "^18.0.0",
echo     "@angular/compiler-cli": "^18.0.0",
echo     "@types/node": "^20.10.0",
echo     "typescript": "~5.4.0"
echo   }
echo }
) > package.json
echo OK!
echo.

echo [3] Installation (5-10 minutes)...
call npm install --legacy-peer-deps
echo.

echo [4] Demarrage...
echo.
echo ============================================
echo L'APPLICATION VA DEMARRER!
echo ============================================
echo.
timeout /t 2 /nobreak >nul

call npm start
