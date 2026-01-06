# Himalayan Autocare Solutions

Monorepo with a Node.js backend and a Vite + React (TypeScript) frontend.

## Repository layout
- [backend/](backend/)
  - [backend/index.js](backend/index.js)
  - [backend/.env](backend/.env)
  - [backend/Config/db.js](backend/Config/db.js)
  - [backend/Controllers/userController.js](backend/Controllers/userController.js) — contains [`Controllers.loginController`](backend/Controllers/userController.js) and [`Controllers.signupController`](backend/Controllers/userController.js)
  - [backend/Models/userModel.js](backend/Models/userModel.js) — exports [`Models.User`](backend/Models/userModel.js)
  - [backend/Routers/user.js](backend/Routers/user.js)
- [frontend/](frontend/)
  - [frontend/index.html](frontend/index.html)
  - [frontend/.env](frontend/.env)
  - [frontend/src/main.tsx](frontend/src/main.tsx)
  - [frontend/vite.config.ts](frontend/vite.config.ts)

## Prerequisites
- Node.js (LTS)
- npm (or pnpm/yarn)

## Backend — setup & run
1. Configure env: copy or edit [backend/.env](backend/.env). Ensure at least the secret used by the backend (see [`Controllers.loginController`](backend/Controllers/userController.js) for `JWT_SECRET`) and the DB connection vars referenced in [backend/Config/db.js](backend/Config/db.js).
2. Install and run:
```sh
cd backend
npm install
# start with the script in package.json or:
node index.js
```
API routes for auth are implemented via [backend/Routers/user.js](backend/Routers/user.js) and use the controllers in [backend/Controllers/userController.js](backend/Controllers/userController.js).

## Frontend — setup & run
1. Configure env if needed: [frontend/.env](frontend/.env).
2. Install and run:
```sh
cd frontend
npm install
npm run dev
```
App entry: [frontend/src/main.tsx](frontend/src/main.tsx). HTML entry: [frontend/index.html](frontend/index.html).

## Useful references
- Login / signup logic: [`Controllers.loginController`](backend/Controllers/userController.js), [`Controllers.signupController`](backend/Controllers/userController.js)
- User model: [`Models.User`](backend/Models/userModel.js)
- DB config: [backend/Config/db.js](backend/Config/db.js)
- Backend entry: [backend/index.js](backend/index.js)
- Frontend entry: [frontend/src/main.tsx](frontend/src/main.tsx)

## Contributing
- Create feature branches and open PRs to main.
- Keep backend and frontend dependency installs scoped to their folders.

## License
Add your license here.