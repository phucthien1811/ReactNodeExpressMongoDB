# MVC Assessment

## Ket luan nhanh
Backend **khong phai MVC thuan**. No la kien truc theo layer:

- `routes` -> dinh nghia endpoint
- `handlers` -> nhan request/tra response HTTP
- `use-cases` -> xu ly business logic
- `repositories` -> truy cap CSDL

Model theo nghia MVC truyen thong (ORM model class tap trung) khong ro rang; du lieu duoc thao tac qua repository (Knex) va mot so service truy van DB truc tiep.

## Bang doi chieu
| MVC truyen thong | Du an hien tai |
|---|---|
| Controller | `api/handlers/*` (bridge toi implementation hien tai) |
| Model | `api/repositories/*` + mot phan query trong `api/use-cases/*` |
| View | Frontend React (`frontend/src/pages`, `frontend/src/components`) |

## Vi sao khong goi la MVC chuan
- Co them use-case layer ro rang giua handler va data layer.
- Data layer tach thanh repository rieng, khong gom trong model class trung tam.
- Mot so service (vd auth) truy cap DB truc tiep, cho thay kien truc lai (layered) linh hoat hon MVC co dien.
