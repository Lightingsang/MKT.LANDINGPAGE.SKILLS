---
name: biz-admin-leads-dashboard
description: "Scaffold trang `/admin` cực đơn giản vào Next.js project để xem danh sách lead + trạng thái thanh toán. Mở trang `/admin` → hiện popup nhập mã → đúng mã thì thấy bảng leads (paid/pending) + filter tìm kiếm + lọc theo ngày tháng. Chỉ 2 file code (1 page + 1 API route) + 1 env var `ADMIN_PASSWORD`. KHÔNG có login page riêng, KHÔNG có session cookie phức tạp, KHÔNG có HMAC/JWT — gõ pass → check ngay với env → trả leads. Đọc lead từ Vercel KV (Upstash Redis) — schema do `biz-setup-sepay-payment` tạo (`lead:DH000123` JSON). Workflow 4 phase ngắn: (0) detect Next.js stack (App vs Pages Router) + check `lib/leads-kv.ts` đã tồn tại, (1) HỎI user password (mặc định gợi ý `123456`, khuyến nghị đổi cho production) — wait user paste, (2) append `ADMIN_PASSWORD` vào `.env.local` (tạo file + thêm vào `.gitignore` nếu chưa), (3) scaffold 2 file code: `app/admin/page.tsx` (client component có popup nhập mã + bảng leads + filter inline + CSV export) + `app/api/admin/leads/route.ts` (verify header `x-admin-pass` vs `ADMIN_PASSWORD` env → SCAN KV → return JSON). Pages Router fallback dùng `pages/admin.tsx` + `pages/api/admin/leads.ts`. Output: 2 file + 1 dòng .env + hướng dẫn test (mở /admin → popup → gõ pass → thấy bảng). Tiếng Việt thuần (xưng anh/chị), columns tiếng Việt (Mã đơn, Họ tên, SĐT, Email, Sản phẩm, Số tiền, Trạng thái, Ngày đăng ký, Ngày thanh toán). USE WHEN user says: 'tạo trang admin', 'admin xem leads', 'trang admin có pass', 'admin popup nhập mã', 'xem danh sách form đăng ký', 'admin xem ai đã thanh toán', 'admin dashboard cho landing page', 'tạo /admin route', 'admin panel Next.js đơn giản', 'biz-admin-leads-dashboard'. Trigger NGAY CẢ KHI user vừa wire xong Sepay payment + muốn 1 chỗ tổng quan xem đơn. KHÔNG dùng khi: (a) project chưa có `lib/leads-kv.ts` — bảo user chạy `/biz-setup-sepay-payment` trước, (b) user dùng DB khác (Postgres/MongoDB) — skill chỉ support Vercel KV, (c) user cần multi-user / role-based access — skill này 1 password chung."
---

# Biz Admin Leads Dashboard — Trang `/admin` đơn giản nhất

Scaffold trang `/admin` vào Next.js + Vercel KV project. Mở trang → popup nhập mã → đúng pass thấy bảng leads.

**Triết lý**: Đơn giản nhất khả thi. 2 file code, 1 env var, không session phức tạp. Đủ cho 1-2 admin chia chung 1 pass.

```
/admin → popup "Nhập mã quản trị" → POST /api/admin/leads với header x-admin-pass
                                  → đúng pass: trả về JSON leads
                                  → sai pass: 401, popup báo "Sai mã"
```

Password gửi qua HTTPS header mỗi request — không lưu cookie, refresh page = popup hiện lại (acceptable cho admin internal).

---

## Khi nào dùng skill này

- User đã có Sepay payment + lead store Vercel KV (từ `biz-setup-sepay-payment`) → cần view layer.
- User muốn page tổng quan check ai đăng ký, ai đã pay, doanh thu.

**KHÔNG dùng khi**:
- Project chưa có `lib/leads-kv.ts` → bảo user chạy `/biz-setup-sepay-payment` trước.
- Cần multi-admin với role → cần NextAuth, skill này chỉ single password.
- DB khác Vercel KV → skill chỉ support `@vercel/kv`.

---

## Workflow (4 phase ngắn)

```
Phase 0: DETECT Next.js stack + check lib/leads-kv.ts
Phase 1: HỎI user password (default 123456) — GATE
Phase 2: WRITE ADMIN_PASSWORD vào .env.local
Phase 3: SCAFFOLD 2 files (page + API route)
Phase 4: TEST (start dev, mở /admin, popup, nhập pass, thấy bảng)
```

---

## Phase 0 — Detect

```bash
# Check Next.js
test -f next.config.js -o -f next.config.mjs -o -f next.config.ts && echo "Next.js: ✓"
test -d app && echo "Router: App"
test -d pages && echo "Router: Pages"

# Check lib leads
test -f lib/leads-kv.ts -o -f lib/leads-kv.js && echo "lib/leads-kv: ✓"
grep -E '"@vercel/kv"' package.json 2>/dev/null && echo "@vercel/kv: installed"

# Check env
grep -E "KV_REST_API_URL" .env.local 2>/dev/null && echo "KV env: ✓"
```

**Nếu không có `lib/leads-kv.ts` HOẶC `@vercel/kv` chưa install**:
> ⚠ Em thấy project chưa có lead store Vercel KV. Anh/chị nên chạy `/biz-setup-sepay-payment` trước để wire payment + lead store, rồi mới quay lại tạo /admin. Hoặc nếu anh/chị đã có lead store ở DB khác → cần edit thủ công file `app/api/admin/leads/route.ts` em sẽ tạo. Anh/chị muốn em tiếp tục scaffold không?

Đợi user.

**Tóm tắt cho user**:
> Em phát hiện: Next.js [App/Pages] Router, lib/leads-kv.ts [✓/✗]. Em sẽ:
> 1. Hỏi anh/chị pass cho /admin
> 2. Ghi vào .env.local
> 3. Scaffold 2 file: page + API route
> 4. Hướng dẫn test
>
> Sẵn sàng đi Phase 1 chưa anh/chị?

---

## Phase 1 — Hỏi password (GATE)

Hỏi y nguyên:

> Anh/chị muốn dùng pass gì cho trang /admin?
> - Mặc định em đề xuất: `123456`
> - Hoặc anh/chị paste pass mạnh hơn cho production
>
> Anh/chị paste pass (hoặc gõ "123456" để dùng default):

**Đợi user trả lời**. Lấy pass user paste. Bỏ trống → dùng `123456`.

KHÔNG đi Phase 2 cho tới khi user paste pass.

---

## Phase 2 — Write .env.local

Append vào `.env.local` (tạo file nếu chưa có):

```
# Admin /admin page password
ADMIN_PASSWORD=<user-paste-from-phase-1>
```

Nếu `ADMIN_PASSWORD` đã có → hỏi user có overwrite không (default KHÔNG, giữ value cũ).

Đảm bảo `.env.local` trong `.gitignore`:

```bash
grep -qxF ".env.local" .gitignore 2>/dev/null || echo ".env.local" >> .gitignore
```

---

## Phase 3 — Scaffold 2 files

### App Router (có `app/`)

| File | Template |
|---|---|
| `app/admin/page.tsx` | `templates/app-admin-page.tsx` |
| `app/api/admin/leads/route.ts` | `templates/app-api-admin-leads-route.ts` |

### Pages Router (có `pages/`)

| File | Template |
|---|---|
| `pages/admin.tsx` | `templates/pages-admin.tsx` |
| `pages/api/admin/leads.ts` | `templates/pages-api-admin-leads.ts` |

### Page UI flow (cả 2 router giống nhau)

```
Mount → state.unlocked = false → render popup overlay với input "Mã quản trị"
       ↓
User submit pass → fetch GET /api/admin/leads với header x-admin-pass=<pass>
       ↓
200 → setUnlocked(true) + lưu password trong state + render bảng + filter UI
401 → popup hiện "Sai mã, thử lại"
       ↓
Mỗi lần filter/refresh → re-fetch /api/admin/leads với cùng header
       ↓
User refresh page → state mất → popup hiện lại (đây là intended behavior cho simple admin)
```

### API route flow

```
GET /api/admin/leads?status=&search=&fromDate=&toDate=
Headers: x-admin-pass: <password>
       ↓
1. Check header password === process.env.ADMIN_PASSWORD (timing-safe compare)
   - Nếu sai → return 401 { error: 'invalid_password' }
2. SCAN KV pattern 'lead:DH*' → MGET batched 100 keys/call
3. Apply filter trong-process (status / search / fromDate / toDate)
4. Sort createdAt desc
5. Compute stats {totalAll, totalPaid, totalPending, revenue}
6. Return JSON { leads, stats }
```

---

## Phase 4 — Test

```bash
# Start dev
pnpm dev  # hoặc yarn dev / npm run dev

# Test 1: API sai pass → 401
curl -i http://localhost:3000/api/admin/leads -H "x-admin-pass: wrong"
# Expect: 401, {"error":"invalid_password"}

# Test 2: API đúng pass → 200 + JSON
curl -i http://localhost:3000/api/admin/leads -H "x-admin-pass: <pass-từ-phase-1>"
# Expect: 200, {"leads":[...], "stats":{...}}

# Test 3: UI smoke
# Mở browser → http://localhost:3000/admin
# Thấy popup "Nhập mã quản trị"
# Gõ pass sai → "Sai mã, thử lại"
# Gõ pass đúng → bảng leads hiện ra với filter
```

---

## Output cuối cùng

```
✓ Đã scaffold trang /admin

📁 File mới (2):
- app/admin/page.tsx (popup + table + filter inline)
- app/api/admin/leads/route.ts (verify pass + KV query)

🔐 Env:
- ADMIN_PASSWORD đã ghi vào .env.local
- .gitignore đã include .env.local

🧪 Test:
1. ✓ API curl test (Phase 4)
2. ✓ UI smoke test trên browser

🔧 TODO của anh/chị:
1. (Nếu deploy production) Add ADMIN_PASSWORD vào Vercel env vars:
   vercel env add ADMIN_PASSWORD production
   → paste pass → save
2. Redeploy: vercel --prod
3. Mở https://yourdomain.vn/admin → gõ pass → confirm hoạt động
```

---

## Templates

- `templates/app-admin-page.tsx` — App Router single-file page (popup + table + filter + CSV export)
- `templates/app-api-admin-leads-route.ts` — App Router API route (header check + KV query)
- `templates/pages-admin.tsx` — Pages Router fallback page
- `templates/pages-api-admin-leads.ts` — Pages Router API route

---

## Anti-pattern (đừng làm)

- ❌ **So sánh password bằng `===`** thay vì `timingSafeEqual` → timing attack. Skill template dùng `crypto.timingSafeEqual`.
- ❌ **Hardcode "123456" trong source** → quên thay → production deploy với pass test. Luôn qua `process.env.ADMIN_PASSWORD`.
- ❌ **Gửi password qua URL query string** (`?pass=123456`) → leak vào browser history + server access logs. Dùng header `x-admin-pass` thay vì query.
- ❌ **Tạo login page riêng + session cookie** khi user chỉ cần simple admin. Popup inline đủ — refresh page = popup hiện lại = OK cho internal use.
- ❌ **Lưu password trong localStorage** → JS đọc được, XSS leak. Skill template lưu trong React state (mất khi refresh, intended).
- ❌ **Không check pass trong API route** (chỉ check ở client) → ai cũng curl được endpoint. Luôn server-side check.
