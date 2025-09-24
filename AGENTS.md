# Repository Guidelines

## Project Structure & Module Organization
The backend starts from `server.js`, which registers feature-specific routers in `screens/*.js` such as `store-server.js` and `checkout-server.js`. Shared persistence helpers live in `persist_module.js`. Application state is stored as JSON under `data/`, with per-user artifacts in `data/user_data/`. Static client assets are in `public/`, organized by HTML pages with supporting scripts in `public/scripts/` and styling in `public/styles/`. Keep server-side utilities outside `public/` so they stay private.

## Build, Test, and Development Commands
Run `npm install` once per environment. Run `npm start` to launch the Express server on http://127.0.0.1:5000. Lint with `npm run lint`, and auto-format quick fixes with `npm run lint:fix`. Execute the end-to-end smoke suite via `npm test` (runs `node test.js` against a running server). Use `npm run test:unit`, `npm run test:watch`, or `npm run test:coverage` for Jest-based work; these read `jest.config.js`.

## Coding Style & Naming Conventions
ESLint enforces 4-space indentation, single quotes, and mandatory semicolons. Prefer `const`/`let`, avoid `var`, and export modules with CommonJS (`module.exports`). Server routes follow the `<feature>-server.js` naming pattern; keep new route modules in `screens/` and mount them from `server.js`. Client scripts in `public/scripts/` should expose functions rather than globals; keep filenames kebab-case to match existing pages.

## Testing Guidelines
`test.js` provisions integration coverage for login, cart, checkout, and admin flows; start the server first, then run `npm test`. Jest targets files in `__tests__/` or `*.test.js`, ignoring `public/`. Maintain or improve the global coverage thresholds defined in `jest.config.js` (60% lines/functions, 50% branches). Reset any JSON fixtures you change in `data/` to avoid polluting shared datasets.

## Commit & Pull Request Guidelines
Commit history mixes raw descriptions with Conventional Commit prefixes; default to the latter (`feat:`, `fix:`, `refactor:`) followed by a concise summary. Group related file changes per commit and include context for data migrations or schema tweaks. Pull requests should describe the user-facing impact, note affected routes or datasets, list verification steps (tests run, manual flows), and attach screenshots for UI updates. Link coursework issues or TODOs when relevant.

