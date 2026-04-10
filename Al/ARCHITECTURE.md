# System Architecture

## Tong quan
He thong gom 2 khoi chinh:
- `api/`: Node.js + Express + MySQL (Knex la query builder chinh)
- `frontend/`: React (react-router-dom + axios)

Frontend goi backend qua `/api/v1/*`.

## Backend architecture (api)
Luong xu ly chinh:

`HTTP Request -> routes -> handler -> use-case -> repository/DB -> handler -> HTTP Response`

Thanh phan:
- `app.js`: khoi tao middleware (cors, helmet, json, morgan), static `/uploads`, mount `/api/v1`.
- `routes/*.js`: map endpoint theo module (auth, users, orders, packages, ...).
- `handlers/*.js`: lop HTTP handler duoc route su dung.
- `use-cases/*.js`: lop nghiep vu duoc handler su dung.
- `repositories/*.repo.js`: thao tac du lieu bang Knex.
- `middleware/`: auth, role, validation middleware.
- `validations/`: schema validate input.
- `config/`: config env, db, knex, vnpay.

## Frontend architecture (frontend)
- Router trung tam o `src/App.jsx`.
- Context cho auth/cart/toast.
- `src/services/api.js`: axios instance, gan access token, xu ly 401 + refresh token.
- Pages tach theo domain: `pages/admin`, `pages/member`, `pages/public`, `pages/shop`.

## Auth flow tom tat
1. Login -> `POST /api/v1/auth/login`.
2. Backend tra ve user + access token (+ refresh token tuy endpoint).
3. Frontend luu token trong localStorage.
4. Moi request: axios interceptor gan `Authorization: Bearer <token>`.
5. Neu 401: thu refresh token, cap nhat token moi, retry request.

## Luu y ky thuat
- Co su khong dong nhat nho giua `auth` trong `api.js` va `AuthContext` (keys localStorage khac nhau); can can nhac chuan hoa khi refactor auth.
- Kien truc hien tai la practical layered architecture, phu hop API da module hoa.
