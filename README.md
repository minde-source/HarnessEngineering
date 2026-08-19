# Harness Engineering

Bo huong dan va cong cu ky thuat co the tai su dung cho cac du an web, dac biet la Next.js + Vercel + Supabase.

Muc tieu la giup Codex lam viec nhat quan: doc ma truoc khi sua, giao dien de dung, bao ve du lieu nhay cam, co migration/audit khi can, va kiem tra CI truoc khi ban giao.

## Cai dat vao mot du an

Sao chep thu muc nay vao du an dich theo cau truc sau:

```text
tools/harness-engineering/
```

Sau do bao Codex:

```text
Doc tools/harness-engineering/SKILL.md va lam theo Harness Engineering.
```

## Cai dat dung chung tren may

Sao chep toan bo noi dung repo vao thu muc sau:

```text
C:\\Users\\<ten-ban>\\.codex\\skills\\harness-engineering
```

Khoi dong lai Codex neu can, roi yeu cau: `Dung skill Harness Engineering cho du an nay.`

## Noi dung

- `SKILL.md`: quy trinh lam viec chinh.
- `references/`: quy tac, kinh nghiem, va checklist.
- `scripts/harness-check.ps1`: kiem tra lint, test, build va runtime audit cho du an Node.js.

## Cach dung script kiem tra

Chay tai thu muc goc cua du an can kiem tra:

```powershell
powershell.exe -ExecutionPolicy Bypass -File tools/harness-engineering/scripts/harness-check.ps1
```

Neu chi muon bo qua kiem tra bao mat `npm audit`:

```powershell
powershell.exe -ExecutionPolicy Bypass -File tools/harness-engineering/scripts/harness-check.ps1 -SkipAudit
```

## Luu y

- Script tu dong bo qua lint, test hoac build neu du an khong khai bao script tuong ung trong `package.json`.
- Vercel chi deploy ma nguon; migration Supabase va Edge Function neu co van can duoc trien khai rieng.
- Khong dua secret, file `.env`, CCCD, hay du lieu suc khoe that vao repo.
