# Next.js + Supabase Starter

Starter có sẵn đăng nhập, API route, local/Supabase store, phân trang, lịch sử thao tác, xuất Excel và xóa an toàn.

## Chạy nhanh ở chế độ local

1. Sao chép `.env.example` thành `.env.local`.
2. Đổi `SESSION_SECRET` và mật khẩu mẫu.
3. Chạy `npm install` rồi `npm run dev`.
4. Mở `http://localhost:3000/login` và đăng nhập bằng tài khoản trong `.env.local`.

Dữ liệu local chỉ dùng để làm mẫu và sẽ trở về ban đầu khi server khởi động lại.

## Chuyển sang Supabase

1. Tạo dự án Supabase và điền ba biến Supabase trong `.env.local`.
2. Chạy `supabase/migrations/001_starter_schema.sql` trong Supabase SQL Editor.
3. Tạo người dùng trong Supabase Authentication.
4. Thêm email người dùng vào bảng `profiles` với role `admin` hoặc `staff`.
5. Đổi `APP_BACKEND_MODE=supabase` và khởi động lại ứng dụng.

Chỉ `admin` được tạo, xuất, xem lịch sử và xóa dữ liệu. `staff` chỉ được xem danh sách.

## API có sẵn

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/records?page=1&pageSize=10`, `POST /api/records`
- `POST /api/records/delete-safe`
- `GET /api/records/export`
- `GET /api/audits?page=1&pageSize=20`

## Quy tắc xóa an toàn

- Phải đăng nhập bằng quyền admin.
- Phải chọn rõ ID cần xóa và nhập lý do.
- Không xóa bản ghi được đánh dấu bảo vệ.
- Không xóa toàn bộ dữ liệu đang còn.
- Supabase lưu snapshot vào `deleted_records` và audit trong cùng một transaction trước khi xóa.

## Kiểm tra trước khi dùng

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd audit --omit=dev --audit-level=high
```

Không commit `.env.local` hoặc `SUPABASE_SERVICE_ROLE_KEY`.
