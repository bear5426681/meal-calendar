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

### 第一次設定

1. GitHub 倉庫 → **Settings** → **Pages** → **Build and deployment**
2. **Source** 選 **GitHub Actions**（不要選 Deploy from a branch）
3. **Settings** → **Secrets and variables** → **Actions** → 新增：
   - `VITE_SUPABASE_URL`（例：`https://xxxx.supabase.co`）
   - `VITE_SUPABASE_ANON_KEY`（Supabase 的 anon / publishable key）
4. 推送至 `main` 後，到 **Actions** 分頁確認 workflow「Deploy to GitHub Pages」成功（綠色勾）
5. 開啟網址（將 `<user>`、`<repo>` 換成你的）：

   `https://<user>.github.io/<repo>/#/`

   例：帳號 `bear5426681`、倉庫 `meal` → `https://bear5426681.github.io/meal/#/`

6. Supabase → **Authentication** → **URL Configuration** → **Redirect URLs** 加入：

   `https://<user>.github.io/<repo>/#/`

### CI 若 npm 依賴衝突

專案已含 `.npmrc`（`legacy-peer-deps=true`），與本機 `npm install` 行為一致。

## 假日 JSON

`src/assets/holidays/YYYY.json` 格式：

```json
[{ "date": "20260103", "week": "六", "isHoliday": true, "description": "" }]
```
