---
name: biz-setup-sepay-payment
description: "End-to-end Sepay VietQR payment infrastructure cho landing page Next.js — guide user setup Sepay account + bank linking + scaffold đầy đủ payment flow trong project. Skill này xử lý 7 phase: (0) detect Next.js stack + check existing infra, (1) GUIDE user đăng ký Sepay account tại my.sepay.vn + link bank account VN (Vietcombank/Techcombank/MB/ACB/VPBank/BIDV/...) + lấy API key + setup webhook URL trên Sepay dashboard, (2) install + setup Vercel KV (Upstash Redis) làm lead store — install `@vercel/kv`, generate KV namespace, add env vars `KV_REST_API_URL` + `KV_REST_API_TOKEN`, (3) scaffold `lib/leads-kv.ts` helper với 4 function CRUD: `createLead()`, `getLeadByOrderId()`, `getLeadByPhone()`, `markLeadPaid()` — TTL 7 ngày để KV không bloat, (4) scaffold `app/api/checkout/route.ts` (App Router) hoặc `pages/api/checkout.ts` (Pages Router) — handler nhận form submission từ landing page, generate order_id format `DH{6-digit-zero-padded}`, lưu lead vào KV, return `{orderId, amount, bankInfo, qrUrl}`, (5) scaffold `app/api/sepay-webhook/route.ts` với Apikey auth (`Authorization: Apikey ${SEPAY_API_KEY}`) + dedup theo `payload.id` + lookup lead qua KV bằng order_id parsed từ `content` + side effects placeholder (sẵn sàng cho `biz-email-setup` và `biz-telegram-payment-notify` wire vào), (6) embed VietQR vào landing page — 3 pattern UI để user chọn: (a) modal popup khi user submit form, (b) dedicated `/checkout/[orderId]` page với QR + bank details + status polling, (c) inline embed pricing card. QR generated via `https://qr.sepay.vn/img?acc=X&bank=Y&amount=Z&des=DH{id}&template=compact` — KHÔNG cần backend API, chỉ image URL. (7) test plan 4 cấp: curl test KV connection → simulated form submit → simulated Sepay webhook payload → production verify với 1 đơn 1.000đ thật. Output: code patch hoàn chỉnh + Sepay account setup guide tiếng Việt + env vars list + 4-step test instructions + redirect sang `/biz-email-setup` và `/biz-telegram-payment-notify` để wire side effects. Tiếng Việt thuần (xưng anh/chị), VND charm pricing, mobile-first checkout UX. USE WHEN user says: 'setup sepay', 'tích hợp sepay vào landing page', 'sepay payment Next.js', 'add VietQR thanh toán', 'biz-setup-sepay-payment', 'cài payment gateway VN', 'setup payment cho landing page', 'tạo checkout flow Sepay', 'wire Sepay webhook', 'setup Vercel KV cho lead store', 'lead store Vercel', 'tạo flow thanh toán cho khoá học online', 'embed QR Sepay vào sales page', 'tạo trang checkout', 'order management cho landing page', 'setup payment infra'. Trigger NGAY CẢ KHI: (a) user vừa deploy landing page xong và muốn add payment, (b) user đang chuẩn bị launch sản phẩm số (course/coaching/digital product) và cần payment flow, (c) user nói 'làm sao nhận tiền online' trong context Next.js project. Skill này LÀ tiền đề cho `biz-email-setup` và `biz-telegram-payment-notify` (cả 2 skill đó dùng `lib/leads-kv.ts` và `/api/sepay-webhook` do skill này tạo). KHÔNG dùng skill này khi: (a) user dùng Stripe/PayPal (skill khác cho international), (b) user muốn manual bank transfer không cần auto-confirm (UX kém, không recommend), (c) user đã có payment infra rồi và chỉ muốn add notification (đi thẳng `/biz-telegram-payment-notify` hoặc `/biz-email-setup`)."
---

# Biz Setup Sepay Payment — End-to-end VietQR payment infra cho Next.js

Skill này build **toàn bộ infrastructure thanh toán** cho landing page Next.js dùng Sepay (cổng thanh toán VietQR Việt Nam). Sau khi xong: khách điền form → tạo order → quét QR → chuyển khoản → Sepay webhook về → mình verify + lookup lead + trigger email/telegram. Tự động hết, không cần admin manual confirm.

> **Triết lý**: Sepay là path of least resistance cho VN — VietQR + bank API native, không cần khách đăng ký gì, scan QR bằng app ngân hàng có sẵn. Phí 1.5-2% rẻ hơn Stripe (4-5%), settlement T+1, free tier hợp lý cho landing page <100 đơn/tháng.
>
> **Tại sao có lead store (Vercel KV)**: Sepay webhook chỉ gửi `content` (text khách dán khi CK) + amount. Sepay KHÔNG biết khách là ai. Phải có lead store local để map `content` → lead {name, phone, email, product, amount}. Skill dùng Vercel KV (Upstash Redis) — free 30K req/tháng, native Vercel, TTL auto-cleanup 7 ngày.

Skill **KHÔNG tự đăng ký Sepay account** cho user (cần KYC business + bank account của user). Skill guide user step-by-step để user tự làm, sau đó wire toàn bộ code.

---

## Khi nào dùng skill này

- User đang launch sản phẩm số / khoá học / coaching và cần nhận thanh toán online.
- User đã có landing page (Next.js qua `ui-ux-pro-max` hoặc tương đương) và muốn add payment flow.
- User chuẩn bị wire `biz-email-setup` hoặc `biz-telegram-payment-notify` mà chưa có payment infra → skill này LÀM TIỀN ĐỀ.

**KHÔNG dùng skill này khi**:
- User dùng Stripe/PayPal (international card payment) → use case khác.
- User chấp nhận manual bank transfer + tự verify (low scale, không khuyến khích).
- User đã có payment infra và chỉ thiếu notification → đi thẳng `/biz-email-setup` hoặc `/biz-telegram-payment-notify`.

---

## Workflow tổng quan (7 phase)

```
Phase 0: DETECT Next.js stack + existing infra
       ↓
Phase 1: GUIDE user setup Sepay account (manual gate — đợi user xong)
       ↓
Phase 2: SETUP Vercel KV (install package + env vars + KV namespace)
       ↓
Phase 3: SCAFFOLD lib/leads-kv.ts (CRUD helper)
       ↓
Phase 4: SCAFFOLD /api/checkout route (form → order → KV)
       ↓
Phase 5: SCAFFOLD /api/sepay-webhook route (verify + lookup + side effects placeholder)
       ↓
Phase 6: EMBED VietQR vào landing page (chọn 1 trong 3 pattern UX)
       ↓
Phase 7: TEST plan 4 cấp (KV → checkout → webhook → production)
```

Phase 1 có **gate đợi user** vì cần KYC manual + bank info. Phase 0/2/3/4/5/6 skill chủ động.

---

## Phase 0 — Detect Next.js stack

Đọc root project để xác định stack. Quyết định: route file syntax + import alias + package manager.

```bash
test -f next.config.js -o -f next.config.mjs -o -f next.config.ts && echo "Next.js: ✓"
test -d app && echo "Router: App"
test -d pages && echo "Router: Pages"
test -f tsconfig.json && echo "TS: ✓"
test -f pnpm-lock.yaml && echo "pkg: pnpm" || test -f yarn.lock && echo "pkg: yarn" || echo "pkg: npm"
```

**Nếu không phải Next.js** (vd Vite/static HTML): DỪNG. Báo user: *"Skill này hiện chỉ support Next.js (App Router hoặc Pages Router). Stack hiện tại của anh/chị là [X]. Anh/chị có muốn em port logic sang Vite/static với Vercel function không?"* — wait user.

**Nếu cả `app/` và `pages/`**: hỏi user dùng cái nào (hybrid Next.js project).

**Đọc thêm để check existing infra**:

```bash
# Check existing routes
ls app/api/ 2>/dev/null
ls pages/api/ 2>/dev/null

# Check existing libs
ls lib/ 2>/dev/null

# Check Vercel KV already installed
grep -E '"@vercel/kv"|"@upstash/redis"' package.json

# Check Sepay-related env
grep -E "SEPAY|VERCEL_KV" .env.local 2>/dev/null
```

**Tóm tắt cho user**:
> Em phát hiện anh/chị đang dùng **Next.js [App/Pages] Router**, **TypeScript**, package manager **[pnpm/yarn/npm]**. Em sẽ:
> 1. Hướng dẫn anh/chị setup Sepay account (5-10 phút thao tác manual)
> 2. Sau đó wire code: lib/leads-kv.ts + /api/checkout + /api/sepay-webhook + embed VietQR vào landing page
> 3. Cuối cùng test 4 cấp
>
> Sẵn sàng đi Phase 1 chưa anh/chị?

Đợi user OK rồi đi tiếp.

---

## Phase 1 — Guide user setup Sepay account

Đọc `references/sepay-account-setup.md` cho hướng dẫn chi tiết. Tóm tắt 5 bước cho user:

### Bước 1 — Đăng ký account

1. Truy cập https://my.sepay.vn → Đăng ký
2. Điền: số điện thoại, email, mật khẩu → verify OTP
3. Hoàn tất profile: Họ tên, CCCD/CMND (nếu cá nhân) hoặc Tax code (nếu công ty)

### Bước 2 — Link bank account

Trong dashboard Sepay → **Tài khoản ngân hàng** → **Thêm tài khoản**:
- Chọn ngân hàng (Vietcombank, Techcombank, MB, ACB, VPBank, BIDV, VietinBank, TPBank, Sacombank, OCB, HDBank, MSB, SCB, VIB, SHB, ...)
- Nhập số tài khoản + tên chủ TK (phải khớp với tên trên app banking)
- Verify qua 1 trong 2 cách:
  - **Auto**: Sepay tự verify qua bank API (nếu bank support)
  - **Manual**: chuyển 1.000-10.000đ với nội dung mã xác minh Sepay đưa → verify trong 1-5 phút

### Bước 3 — Lấy API key

Dashboard → **Cài đặt** → **API & Webhook** → **Tạo API Key mới**:
- Đặt tên: "landing-page-prod"
- Permissions: chọn `webhook:read` (đủ cho use case này)
- Copy API key (chỉ hiện 1 lần — save vào nơi an toàn)

### Bước 4 — Setup webhook URL trên Sepay

Cùng trang → **Webhook** → **Thêm webhook**:
- URL: `https://yourdomain.vn/api/sepay-webhook` (sẽ scaffold ở Phase 5 — tạm dùng URL production sau khi deploy)
- Authentication: **API Key** → paste API key vừa tạo
- Events: chọn `transaction:incoming` (chỉ trigger khi có tiền VÀO)
- Save

> ⚠️ Trước khi deploy production, có thể tạm dùng [ngrok](https://ngrok.com) hoặc [smee.io](https://smee.io) để expose localhost cho Sepay test.

### Bước 5 — Paste cho skill

Đợi user paste 3 thứ:
```
SEPAY_WEBHOOK_API_KEY=sk_xxxxxxxxxxxxxxxxxxxx
SEPAY_BANK_ACCOUNT_NUMBER=1023456789
SEPAY_BANK_NAME=Vietcombank      # exact name từ list, xem references/sepay-account-setup.md
```

**GATE QUAN TRỌNG**: KHÔNG đi Phase 2 cho đến khi user paste đủ 3 giá trị. Nếu user chưa có domain production → vẫn OK cho dev local, nhắc user update webhook URL trên Sepay sau khi deploy.

---

## Phase 2 — Setup Vercel KV (Upstash Redis)

Vercel KV là KV-store managed của Vercel, backed by Upstash Redis. Free tier 30K commands/tháng — dư cho landing page <500 đơn/tháng.

### 2.1 Tạo KV namespace

User vào Vercel dashboard → Project → **Storage** tab → **Create Database** → **KV (Redis)** → đặt tên (vd `sepay-leads`) → Create.

Sau khi tạo, Vercel auto generate 4 env vars:
```
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

User bấm **Connect to Project** → Vercel tự inject vào project env (Production + Preview + Development).

### 2.2 Pull env xuống local

```bash
# Cài Vercel CLI nếu chưa có
npm i -g vercel
vercel link  # link project local với Vercel
vercel env pull .env.local  # pull env xuống local
```

Hoặc user copy thủ công 4 biến từ Vercel dashboard → paste vào `.env.local`.

### 2.3 Install package

```bash
# Theo package manager đã detect Phase 0
pnpm add @vercel/kv     # hoặc
yarn add @vercel/kv     # hoặc
npm install @vercel/kv
```

### 2.4 Verify connection

Skill chạy quick test:
```bash
node -e "
const { kv } = require('@vercel/kv');
kv.set('test', 'hello').then(() => kv.get('test')).then(v => {
  console.log('KV connection OK:', v);
  return kv.del('test');
});
"
```

Nếu thấy `KV connection OK: hello` → đi Phase 3. Nếu fail → check env vars + restart shell.

---

## Phase 3 — Scaffold lib/leads-kv.ts

Đọc `templates/lib-leads-kv.ts` (TS) hoặc `templates/lib-leads-kv.js` (JS). Copy vào `lib/leads-kv.ts`.

API export:
- `createLead(data: LeadInput): Promise<{ orderId, lead }>` — tạo lead mới + auto-generate order ID `DH000001`
- `getLeadByOrderId(orderId: string): Promise<Lead | null>` — lookup theo order ID
- `getLeadByPhone(phone: string): Promise<Lead | null>` — fallback lookup
- `markLeadPaid(orderId: string, payment: PaymentRecord): Promise<void>` — update status sau khi webhook về
- `getNextOrderNumber(): Promise<number>` — atomic counter cho order ID

**Schema lead trong KV**:
```
Key: lead:DH000123                  Value: { orderId, name, phone, email, productName, amount, status, createdAt }
Key: phone:0901234567 → DH000123    (secondary index để lookup theo phone)
Key: counter:order                  (atomic INCR cho order ID)
```

**TTL**: 7 ngày (lead chưa pay sau 7 ngày auto-cleanup → KV không bloat). Lead đã pay update TTL = 90 ngày để có audit log.

Đọc `references/leads-kv-schema.md` cho rationale chi tiết key naming + TTL strategy.

---

## Phase 4 — Scaffold /api/checkout route

Đọc `templates/api-checkout-app-router.ts` (App Router) hoặc `templates/api-checkout-pages-router.ts` (Pages Router). Copy vào path tương ứng.

**Flow**:
```
Client (form submit)
  ↓ POST /api/checkout { name, phone, email, productName, amount }
Server:
  1. Validate fields (required, phone VN format, email regex)
  2. Call createLead() → ra { orderId: "DH000123" }
  3. Generate Sepay QR URL: https://qr.sepay.vn/img?acc=X&bank=Y&amount=Z&des=DH000123&template=compact
  4. Return { orderId, amount, bankInfo: {bank, accountNumber}, qrUrl }
  ↓
Client:
  5. Show QR modal HOẶC redirect /checkout/DH000123
```

**Side effect**: gọi optional `sendCheckoutEmail()` (P3 reminder pattern từ `biz-email-setup`) ngay sau createLead. Skill chỉ gắn placeholder; `biz-email-setup` sẽ wire vào sau.

---

## Phase 5 — Scaffold /api/sepay-webhook route

Đọc `templates/api-sepay-webhook-app-router.ts`. Copy vào `app/api/sepay-webhook/route.ts`.

**Flow**:
```
Sepay POST /api/sepay-webhook
  Authorization: Apikey {SEPAY_API_KEY}
  Body: { id, gateway, content, transferType, transferAmount, referenceCode, ... }
  ↓
Server:
  1. Verify auth header → reject 401 nếu sai
  2. Early dedup: check transactions:{id} trong KV → nếu có, return 200 ngay (đã xử lý)
  3. Filter transferType === 'in' → bỏ qua 'out'
  4. Lookup lead theo content (parse "DH\d+" hoặc fallback "0\d{9}")
  5. Mark paid: markLeadPaid(orderId, payment) → update KV
  6. Save dedup: kv.set('transactions:' + payload.id, true, { ex: 7*86400 })
  7. Fan-out side effects qua Promise.allSettled (placeholder cho biz-email-setup + biz-telegram-payment-notify)
  8. Return { success: true }
  ↓
Sepay marks webhook delivered (no retry)
```

**Side effects** placeholder trong webhook handler:
```typescript
await Promise.allSettled([
  // sendCustomerEmail(lead),       // /biz-email-setup wire vào đây
  // sendOwnerEmail(lead),          // /biz-email-setup wire vào đây
  // sendTelegramNotification(...), // /biz-telegram-payment-notify wire vào đây
]);
```

Đọc `references/sepay-webhook-flow.md` cho dedup rationale + retry behavior + auth methods.

---

## Phase 6 — Embed VietQR vào landing page

3 pattern UX, hỏi user chọn 1:

| Pattern | Khi nào dùng | UX |
|---|---|---|
| **A. Modal popup** | Single product / impulse buy / simple landing page | User submit form → modal popup hiển thị QR ngay tại trang gốc, không redirect |
| **B. Dedicated /checkout/[orderId] page** | Multi-product / cần audit URL share / clean | Submit form → redirect `/checkout/DH000123` — page riêng có QR + bank details + status polling |
| **C. Inline pricing card** | Multiple tier (Basic/Pro/Premium) hiển thị QR luôn | QR hardcoded amount per tier, không cần form trước — khách scan thẳng (kém personalized) |

**Recommend cho landing page bán khoá học/coaching**: **Pattern B** — clean, có URL để share, dễ implement status polling.

Đọc `templates/checkout-page-app-router.tsx` (Pattern B) hoặc `templates/checkout-modal-react.tsx` (Pattern A) hoặc `templates/pricing-card-with-qr.tsx` (Pattern C).

**Status polling**: Pattern B + A nên có client-side polling mỗi 3-5s gọi `GET /api/checkout/[orderId]/status` → return `{ status: 'pending' | 'paid' | 'expired' }`. Khi `paid` → show success state, redirect to thank-you page.

Đọc `references/vietqr-embed-patterns.md` cho code chi tiết + responsive design + a11y considerations.

---

## Phase 7 — Test plan (4 cấp)

Đi từ nhẹ đến nặng. Skill chạy được Test 1 + 2; Test 3 cần production deploy + Test 4 cần CK thật.

### Test 1 — KV connection sanity

```bash
node -e "
const { kv } = require('@vercel/kv');
const lead = { name: 'Test', phone: '0901234567', email: 't@e.com', productName: 'Test Product', amount: 499000 };
kv.set('lead:DH999999', lead, { ex: 60 })
  .then(() => kv.get('lead:DH999999'))
  .then(v => console.log('KV OK:', v))
  .then(() => kv.del('lead:DH999999'));
"
```

Expect: `KV OK: { name: 'Test', ... }`. Nếu fail → check env vars (Phase 2.4).

### Test 2 — Simulated checkout flow (localhost)

```bash
# Start dev server
pnpm dev

# Submit form
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van A","phone":"0901234567","email":"a@e.com","productName":"Khoá AI Agent","amount":499000}'

# Expect response:
# {"orderId":"DH000001","amount":499000,"bankInfo":{"bank":"Vietcombank","accountNumber":"1023456789"},
#  "qrUrl":"https://qr.sepay.vn/img?acc=1023456789&bank=Vietcombank&amount=499000&des=DH000001&template=compact"}

# Mở qrUrl trong browser → thấy QR Sepay valid
```

### Test 3 — Simulated Sepay webhook payload

```bash
curl -X POST http://localhost:3000/api/sepay-webhook \
  -H "Authorization: Apikey $SEPAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-001",
    "gateway": "Vietcombank",
    "transactionDate": "2026-05-14 14:32:01",
    "accountNumber": "1023456789",
    "code": null,
    "content": "DH000001",
    "transferType": "in",
    "transferAmount": 499000,
    "accumulated": 1000000,
    "subAccount": null,
    "referenceCode": "FT26134567890",
    "description": "Test payment"
  }'

# Expect: {"success":true}
# Check KV: kv.get('lead:DH000001') → status: 'paid', paidAt: <timestamp>
```

### Test 4 — Production verify (sau deploy)

1. Deploy: `vercel --prod` (hoặc qua `/biz-deploy-vercel`)
2. Update webhook URL trên Sepay dashboard: `https://yourdomain.vn/api/sepay-webhook`
3. Mở landing page production → submit form 1 đơn test
4. Chuyển khoản thật 1.000đ với content = order_id ra
5. Trong < 30s, Sepay webhook về → check Vercel logs → status `200 OK`
6. Check Sepay dashboard → Webhooks → Logs → status delivered

---

## Output cuối cùng skill trả về user

```
✓ Đã setup hoàn chỉnh Sepay payment infra cho landing page Next.js

📁 File đã tạo / chỉnh:
- lib/leads-kv.ts (NEW — Vercel KV CRUD)
- app/api/checkout/route.ts (NEW — form submission handler)
- app/api/sepay-webhook/route.ts (NEW — webhook receiver)
- app/checkout/[orderId]/page.tsx (NEW — Pattern B checkout page với QR + polling)
- app/page.tsx (MODIFIED — wire form submit → /api/checkout → redirect)
- .env.local (MODIFIED — add SEPAY_* + KV_* env vars)
- package.json (MODIFIED — add @vercel/kv)

🏦 Sepay setup:
- Account: my.sepay.vn ✓
- Bank linked: Vietcombank 1023456789 ✓
- API key created ✓
- Webhook URL configured: https://yourdomain.vn/api/sepay-webhook (sẽ live sau deploy)

🗄 Vercel KV (Upstash Redis):
- Namespace: sepay-leads
- Schema: lead:{orderId}, phone:{phone} → orderId, counter:order
- TTL: 7 ngày (pending), 90 ngày (paid)

🧪 Test (Phase 7):
1. ✓ KV connection (Test 1 — passed)
2. ✓ Simulated checkout flow (Test 2 — passed)
3. ✓ Simulated webhook payload (Test 3 — passed)
4. ⏳ Production verify (Test 4 — TODO sau deploy)

🔧 TODO của anh/chị (manual gate):
1. Deploy production: chạy /biz-deploy-vercel (hoặc vercel --prod)
2. Update webhook URL trên Sepay dashboard sang domain production
3. Test 1 đơn 1.000đ thật → confirm Sepay webhook về Vercel
4. Wire side effects bằng cách chạy:
   - /biz-email-setup → wire Resend email customer + owner notification
   - /biz-telegram-payment-notify → wire Telegram alert vào group/chat
```

---

## Reference files

- `references/sepay-account-setup.md` — chi tiết bước Sepay registration + bank linking + API key + webhook config + 15 bank tiếng Việt phổ biến
- `references/vercel-kv-setup.md` — Vercel KV namespace creation + env vars + pull local + verify
- `references/leads-kv-schema.md` — schema design rationale + key naming + TTL strategy + secondary index
- `references/sepay-webhook-flow.md` — Sepay payload schema + auth methods + dedup pattern + retry behavior
- `references/vietqr-embed-patterns.md` — 3 UX pattern chi tiết (modal/page/inline) + status polling + responsive

## Templates

- `templates/lib-sepay.ts` — Pure helpers: `generateVietQRUrl`, `parseOrderIdFromContent`, `verifySepayAuth` (timing-safe), `formatVND`, `SepayWebhookPayload` type
- `templates/lib-leads-kv.ts` — Vercel KV CRUD: `createLead`, `getLeadByOrderId`, `getLeadByPhone`, `findPendingLeadByAmountAndTime` (Strategy 3), `markLeadPaid`, dedup helpers
- `templates/api-checkout-app-router.ts` — App Router POST /api/checkout (uses lib-sepay)
- `templates/api-checkout-pages-router.ts` — Pages Router POST /api/checkout (uses lib-sepay)
- `templates/api-sepay-webhook-app-router.ts` — App Router POST /api/sepay-webhook với multi-strategy matching + timing-safe auth + always-200
- `templates/api-checkout-status.ts` — GET /api/checkout/[orderId]/status cho client polling
- `templates/checkout-page-app-router.tsx` — Pattern B: dedicated /checkout/[orderId] page
- `templates/checkout-status-poll.tsx` — Client polling component (Pattern A + B)
- `templates/checkout-modal-react.tsx` — Pattern A: modal QR popup
- `templates/pricing-card-with-qr.tsx` — Pattern C: inline pricing card

**Webhook handler best practices** (đã apply trong `api-sepay-webhook-app-router.ts`):
1. **Timing-safe auth comparison** qua `crypto.timingSafeEqual` (chống timing attack)
2. **Multi-strategy order matching** — content-orderid → content-phone → amount+timestamp window
3. **ALWAYS return 200** kể cả internal error (Sepay retry 7 lần Fibonacci nếu non-200, gây duplicate)
4. **Reject underpayment, ACCEPT overpayment** (khách trả thừa OK, không bao giờ chặn)
5. **Side effects non-blocking** — wrap mỗi cái try/catch riêng, không dùng `Promise.all`
6. **Sepay payload `id` là NUMBER** (integer), không phải string — convert sang string khi save dedup key

---

## Anti-pattern (đừng làm)

- ❌ Skip dedup theo `payload.id` → Sepay retry → mỗi đơn record 5 lần trong KV → lead nhận 5 email confirm.
- ❌ Hardcode SEPAY_API_KEY hoặc bank account trong source → leak khi push Git. Luôn qua env var.
- ❌ Lookup lead bằng `transferAmount` → trùng giá → nhầm khách. **Luôn lookup theo content.**
- ❌ Quên TTL trên KV key → KV bloat sau vài tháng, cost tăng.
- ❌ Dùng `Promise.all` thay vì `Promise.allSettled` cho side effects → 1 fail block tất cả → Sepay retry → duplicate.
- ❌ Throw error trong webhook handler → Sepay nhận 500 → retry → duplicate. Luôn wrap try/catch return 200.
- ❌ Tạo order_id dạng UUID hoặc timestamp → khách dán nội dung CK quá dài, dễ typo. **Dùng `DH{6-digit}`** — ngắn, dễ đọc, dễ dán.
- ❌ Show QR mà không show bank info text → khách không scan được thì không có fallback chuyển khoản tay. **Luôn show cả 2** (QR + bank/account/amount/content text).
- ❌ Quên status polling trên checkout page → khách chuyển xong không biết success → confused, contact support manual. **Pattern B + A phải có polling.**
