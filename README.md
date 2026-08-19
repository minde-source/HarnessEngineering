# Harness Engineering

Hướng dẫn và công cụ kỹ thuật có thể tái sử dụng cho các dự án web, đặc biệt là Next.js + Vercel + Supabase.

Mục tiêu là giúp Codex làm việc nhất quán: đọc mã trước khi sửa, giao diện dễ dùng, bảo vệ dữ liệu nhạy cảm, có migration/audit khi cần, và kiểm tra CI trước khi bàn giao.

## Cài đặt vào một dự án

Sao chép thư mục này vào dự án đích theo cấu trúc sau:

```text
tools/harness-engineering/
```

Sau đó bảo Codex:

```text
Đọc tools/harness-engineering/SKILL.md và làm theo Harness Engineering.
```

## Cài đặt dùng chung trên máy

Sao chép toàn bộ nội dung repo vào thư mục sau:

```text
C:\\Users\\<ten-ban>\\.codex\\skills\\harness-engineering
```

Khởi động lại Codex nếu cần, rồi yêu cầu: `Dùng skill Harness Engineering cho dự án này.`

## Nội dung

- `SKILL.md`: quy trình làm việc chính.
- `references/`: quy tắc, kinh nghiệm, và checklist.
- `scripts/harness-check.ps1`: kiểm tra lint, test, build và runtime audit cho dự án Node.js.
- `assets/starter-next-supabase/`: bộ code mẫu Next.js có auth, API, Supabase/local store, audit, Excel, xóa an toàn và phân trang.

## Dùng starter source

Sao chép toàn bộ nội dung trong `assets/starter-next-supabase/` sang repo mới, sau đó làm theo README nằm trong starter. Có thể chạy ngay ở chế độ local để làm giao diện; khi dùng thật thì chuyển sang Supabase và chạy migration đi kèm.

Hoặc tạo nhanh một thư mục dự án mới bằng lệnh:

```powershell
powershell.exe -ExecutionPolicy Bypass -File scripts/new-harness-project.ps1 -Destination "D:\du-an-moi"
```

## Cách dùng script kiểm tra

Chạy tại thư mục gốc của dự án cần kiểm tra:

```powershell
powershell.exe -ExecutionPolicy Bypass -File tools/harness-engineering/scripts/harness-check.ps1
```

Nếu chỉ muốn bỏ qua kiểm tra bảo mật `npm audit`:

```powershell
powershell.exe -ExecutionPolicy Bypass -File tools/harness-engineering/scripts/harness-check.ps1 -SkipAudit
```

## Lưu ý

- Script tự động bỏ qua lint, test hoặc build nếu dự án không khai báo script tương ứng trong `package.json`.
- Vercel chỉ deploy mã nguồn; migration Supabase và Edge Function nếu có vẫn cần được triển khai riêng.
- Không đưa secret, file `.env`, CCCD, hay dữ liệu sức khỏe thật vào repo.
