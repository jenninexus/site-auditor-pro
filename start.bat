@echo off
echo.
echo   site auditor v2.0.0
echo   Starting server...
echo.

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

:: Resolve port (env var takes precedence, default 3847)
if not defined SITE_AUDITOR_PORT set SITE_AUDITOR_PORT=3847
echo   Listening on http://localhost:%SITE_AUDITOR_PORT%
echo.

:: Start the server
npx tsx src/server.ts
