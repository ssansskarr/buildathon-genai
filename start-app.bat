@echo off
echo Starting AIlign...

echo Starting Flask backend...
start cmd /k "cd flask_backend && python app.py"

echo Starting Next.js frontend...
start cmd /k "npm run dev"

echo Application started!
echo Flask backend: http://localhost:5000
echo Next.js frontend: http://localhost:3000
echo.
echo Note: Make sure you have set up the required environment variables in .env files 