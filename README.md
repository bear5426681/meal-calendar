# 伙食責任表

Quasar SPA + Supabase（Google 登入、RLS、無後端）。

## 開發

```bash
cp .env.example .env
# 填入 VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## 權限設定

1. 四位成員各用 Google 登入一次（建立 `auth.users`）。
2. 在 Supabase SQL Editor 手動維護 `allowed_users`：

```sql
INSERT INTO allowed_users (show_name) VALUES
  ('成員A'), ('成員B'), ('成員C'), ('成員D');

-- 登入後將 auth.users.id 填入對應列
UPDATE allowed_users SET auth_user_id = '<uuid>' WHERE show_name = '成員A';

-- 每人負責人標籤顏色（選填）
UPDATE allowed_users SET chip_color = '#26a69a' WHERE show_name = '成員A';
UPDATE allowed_users SET chip_color = '#5c6bc0' WHERE show_name = '成員B';
UPDATE allowed_users SET chip_color = '#ef6c00' WHERE show_name = '成員C';
UPDATE allowed_users SET chip_color = '#8e24aa' WHERE show_name = '成員D';
```

## GitHub Pages

- Repository Settings → Pages → Source: **GitHub Actions**
- Secrets：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- Supabase Auth → Redirect URLs：`http://localhost:5174/#/`、`https://<user>.github.io/<repo>/#/`

## 假日 JSON

`src/assets/holidays/YYYY.json` 格式：

```json
[{ "date": "20260103", "week": "六", "isHoliday": true, "description": "" }]
```
