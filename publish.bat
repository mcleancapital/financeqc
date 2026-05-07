@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo ========================================
echo   FinanceQc - Publish to GitHub
echo ========================================
echo.

REM --- Verifier que git est installe ---
where git >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] git n'est pas installe ou pas dans le PATH.
    echo Telecharger : https://git-scm.com/download/win
    pause & exit /b 1
)

REM --- Verifier que gh CLI est installe ---
where gh >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] GitHub CLI ^(gh^) n'est pas installe ou pas dans le PATH.
    echo Telecharger : https://cli.github.com/
    pause & exit /b 1
)

REM --- Verifier l'authentification GitHub ---
gh auth status >nul 2>&1
if errorlevel 1 (
    echo Vous n'etes pas connecte a GitHub CLI.
    echo Lancement de "gh auth login" - choisissez :
    echo   - GitHub.com
    echo   - HTTPS
    echo   - Authenticate Git with your GitHub credentials = Yes
    echo   - Login with a web browser
    echo.
    pause
    gh auth login --hostname github.com --git-protocol https --web
    if errorlevel 1 (
        echo [ERREUR] Authentification echouee.
        pause & exit /b 1
    )
)

REM --- Premier push : init + creer le repo + push ---
if not exist ".git" (
    echo Initialisation du depot git local...
    git init -b main
    if errorlevel 1 ( echo [ERREUR] git init echoue. & pause & exit /b 1 )

    git add .
    git commit -m "Initial commit - FinanceQc website"
    if errorlevel 1 ( echo [ERREUR] commit echoue. & pause & exit /b 1 )

    echo.
    echo Creation du depot GitHub mcleancapital/financeqc...
    gh repo create mcleancapital/financeqc --public --source=. --remote=origin --description "FinanceQc - Calculateurs financiers et fiscaux pour le Quebec" --push
    if errorlevel 1 (
        echo [ERREUR] Creation du repo echouee. Si le repo existe deja, ajouter manuellement :
        echo   git remote add origin https://github.com/mcleancapital/financeqc.git
        echo   git push -u origin main
        pause & exit /b 1
    )

    echo.
    echo ========================================
    echo   Repo cree et pousse avec succes !
    echo ========================================
    echo.
    echo Prochaines etapes :
    echo.
    echo 1. Ouvrir : https://github.com/mcleancapital/financeqc/settings/pages
    echo 2. Source : "Deploy from a branch" -^> Branch: main, Folder: / (root)
    echo 3. Custom domain : www.financeqc.ca  ^(deja dans le fichier CNAME^)
    echo 4. Activer "Enforce HTTPS" apres propagation du certificat
    echo.
    echo 5. Chez votre registraire DNS, creer :
    echo    CNAME : www -^> mcleancapital.github.io
    echo    ^(ou A records vers les IPs GitHub Pages pour le domaine apex^)
    echo.
    pause
    exit /b 0
)

REM --- Pushs suivants : commit + push ---
echo Etat du depot :
git status --short
echo.

set "MSG=%~1"
if "%MSG%"=="" set "MSG=Mise a jour du site"

git add .
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "%MSG%"
    if errorlevel 1 ( echo [ERREUR] commit echoue. & pause & exit /b 1 )
    git push origin main
    if errorlevel 1 ( echo [ERREUR] push echoue. & pause & exit /b 1 )
    echo.
    echo === Modifications poussees a GitHub ===
) else (
    echo Aucun changement a commiter.
)

echo.
pause
