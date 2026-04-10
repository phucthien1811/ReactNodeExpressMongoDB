# System Map

## Thu muc goc
- `api/` backend
- `frontend/` frontend
- `README.md` huong dan khoi chay tong quat

## API map
- Entry:
  - `api/index.js`
  - `api/app.js`
- Route root:
  - `api/routes/index.js`
- Layer aliases moi:
  - `api/handlers/*` (thay ten cho controller layer)
  - `api/use-cases/*` (thay ten cho service layer)
- Domain slices (mau):
  - Auth: `routes/auth.js` -> `handlers/auth.handler.js` -> `use-cases/auth.use-case.js`
  - User: `routes/user.js` -> `handlers/user.handler.js` -> `use-cases/user.use-case.js` -> `repositories/user.repo.js`
  - Order/Package/Product/Schedule/... theo pattern tuong tu.

## Frontend map
- Entry/router: `frontend/src/App.jsx`
- API client: `frontend/src/services/api.js`
- Auth state: `frontend/src/context/AuthContext.jsx`
- Page groups:
  - `frontend/src/pages/public`
  - `frontend/src/pages/member`
  - `frontend/src/pages/admin`
  - `frontend/src/pages/shop`

## Luong request vi du (login)
1. UI login page goi `auth` service frontend.
2. Axios gui `POST /api/v1/auth/login`.
3. Route auth map sang handler.
4. Handler goi `auth.use-case`.
5. Use-case kiem tra DB + tao token.
6. Handler tra JSON cho frontend.
7. Frontend luu user/token vao localStorage va dieu huong theo role.
