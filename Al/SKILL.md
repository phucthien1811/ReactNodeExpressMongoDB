# Reusable Workflows (Skill)

Tai lieu nay mo ta cac workflow co the dung lai khi chinh sua du an.

## 1) Them API endpoint moi
1. Tao validation schema trong `api/validations` (neu can).
2. Them ham repository (neu can truy cap DB).
3. Them business logic trong `api/use-cases` (hoac `api/services` implementation).
4. Them handler trong `api/handlers` (hoac `api/controllers` implementation).
5. Dang ky route trong file `api/routes/<domain>.js`.
6. Neu la domain moi, mount vao `api/routes/index.js`.
7. Cap nhat frontend service goi API neu co man hinh su dung.

## 2) Sua logic nghiep vu co san
1. Tim route -> handler -> use-case tu endpoint.
2. Sua logic chinh o use-case; tranh dat business logic phuc tap trong handler.
3. Neu query lap lai, day xuong repository.
4. Dam bao response shape giu on dinh cho frontend.

## 3) Mo rong schema du lieu
1. Tao migration trong `api/migrations`.
2. Cap nhat repository query lien quan.
3. Cap nhat validation input.
4. Cap nhat service/controller va frontend field mapping.

## 4) Xu ly auth/permission
1. Kiem tra middleware `auth.js`, `role.js`.
2. Kiem tra interceptor trong `frontend/src/services/api.js`.
3. Dong bo key localStorage va token format giua frontend-backend.

## 5) Debug nhanh theo tang
- Loi 4xx: uu tien check validation/request payload/role.
- Loi 5xx: check service va repository query.
- Loi UI khong hien: check router, context state, API response shape.
