@echo off
echo Installing ESLint and Jest dependencies...

npm install --save-dev eslint@latest @eslint/js@latest globals
npm install --save-dev eslint-plugin-node eslint-plugin-security
npm install --save-dev eslint-config-prettier prettier
npm install --save-dev jest@latest supertest@latest
npm install --save-dev @jest/globals

echo.
echo Dependencies installed! You can now delete this file.
echo Run: npm run lint
echo Run: npm test
pause
