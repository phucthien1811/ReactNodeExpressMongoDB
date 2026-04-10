# AI Memory

## Ban chat du an
- Day la he thong quan ly gym + ban hang (shop) gom admin/member/public flows.
- Backend da duoc module hoa theo domain va phan tang theo handler/use-case/repository.
- Frontend dung React Router de tach khu vuc admin/member/public.

## Quy uoc quan trong
- API prefix: `/api/v1`.
- Auth dua tren JWT Bearer token.
- DB thao tac chu yeu qua Knex.
- Khong nen dua business logic nang vao handler.

## Diem de gay loi khi sua
- Auth state dang ton tai nhieu cach luu localStorage (de xung dot neu refactor auth).
- Co endpoint tra response shape khong hoan toan dong nhat giua cac module (success/message/data).
- Co domain co the query DB truc tiep trong service thay vi repository.

## Checklist truoc khi merge thay doi lon
1. Co anh huong den response contract cho frontend khong?
2. Middleware auth/role co can cap nhat theo endpoint moi khong?
3. Validation da bao phu field moi chua?
4. Cac route da duoc mount day du o `routes/index.js` chua?

## Dinh huong tiep theo (neu refactor)
- Chuan hoa mot response envelope chung.
- Chuan hoa auth storage strategy ben frontend.
- Day query truc tiep tu service xuong repository de dong nhat data layer.
