@echo off
echo Starting Frontend...
cd frontend

if not exist "node_modules\" (
    call npm install
)

call ng serve --open
