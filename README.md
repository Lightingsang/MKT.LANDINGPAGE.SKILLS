# BIZ.MKT.OS — Pipeline đóng gói sản phẩm số từ ý tưởng → khách hàng nhận email

> **Một "agent" gồm 10 skill chuyên dụng**, chạy tuần tự để biến **1 ý tưởng sản phẩm** thành **1 sales funnel hoàn chỉnh** đang nhận lead thật: research thị trường → đóng gói offer → nâng cấp copy → build landing page Next.js → cài đặt thanh toán tự động VietQR → tích hợp AI chatbot hỗ trợ 24/7 → gửi email tự động chăm sóc → gửi thông báo đơn hàng qua Telegram → tạo admin dashboard quản lý đơn → deploy live lên Vercel.

Hệ thống được thiết kế cho **thị trường Việt Nam**: tiếng Việt thuần (xưng anh/chị), giá VND charm pricing, mobile-first traffic, voice Hoàng nếu có video.

---

## Mục lục

- [Triết lý vận hành](#triết-lý-vận-hành)
- [Sơ đồ pipeline](#sơ-đồ-pipeline)
- [Naming convention output](#naming-convention-output)
- [10 bước chi tiết](#10-bước-chi-tiết)
  - [Bước 1 — Market Research](#bước-1--market-research-marketresearch)
  - [Bước 2 — Đóng gói Offer](#bước-2--đóng-gói-offer-bizofferalexhormozi)
  - [Bước 3 — Nâng cấp Copy](#bước-3--nâng-cấp-copy-bizsalespagecopy)
  - [Bước 4 — Build Landing Page](#bước-4--build-landing-page-uiuxpromax)
  - [Bước 5 — Tích hợp Thanh toán VietQR](#bước-5--tích-hợp-thanh-toán-vietqr-bizsetupsepaypayment)
  - [Bước 6 — Cài Chatbot](#bước-6--cài-chatbot-biznextjschatbotopenrouter)
  - [Bước 7 — Setup Email Auto-Responder](#bước-7--setup-email-auto-responder-bizemailsetup)
  - [Bước 8 — Setup Thông báo Telegram](#bước-8--setup-thông-báo-telegram-biztelegrampaymentnotify)
  - [Bước 9 — Tạo Admin Dashboard](#bước-9--tạo-admin-dashboard-bizadminleadsdashboard)
  - [Bước 10 — Deploy Production](#bước-10--deploy-production-bizdeployvercel)
- [Hướng dẫn Cơ sở Dữ liệu & Triển khai (Supabase & Vercel CLI)](#hướng-dẫn-cơ-sở-dữ-liệu--triển-khai-supabase--vercel-cli)
  - [1. Hướng dẫn Triển khai với Vercel CLI](#1-hướng-dẫn-triển-khai-với-vercel-cli)
  - [2. Kết nối CSDL Supabase (Postgres) cho Landing Page & Admin Dashboard](#2-kết-nối-csdl-supabase-postgres-cho-landing-page--admin-dashboard)
  - [3. Hướng dẫn cài đặt Supabase MCP Server](#3-hướng-dẫn-cài-đặt-supabase-mcp-server)
- [Checklist Go-Live](#checklist-go-live)
- [Skills đã bị deprecated](#skills-đã-bị-deprecated)
- [FAQ vận hành](#faq-vận-hành)
- [Tham chiếu file thực tế (case study)](#tham-chiếu-file-thực-tế-case-study)

---

## Triết lý vận hành

1. **Một skill một việc** — mỗi bước là 1 slash command đơn nhiệm, output của bước trước là input của bước sau. Không monolith.
2. **Artifact-first** — mỗi bước ghi ra file có cấu trúc (`.md` để người đọc, `.json` để pipeline downstream parse). Không có file = bước chưa hoàn thành.
3. **Checkpoint con người** — sau mỗi bước critical (offer, copy, landing page) **user duyệt trước** rồi mới chạy bước kế. Skill không auto-chain.
4. **Resume an toàn** — pipeline có thể bắt đầu/dừng/tiếp ở bất kỳ bước nào miễn artifact đầu vào có đủ. Đã có `02-offer.json` → nhảy thẳng vào bước 3.
5. **Mobile-first VN** — mọi landing page bắt buộc form đăng ký (tên/SĐT/email) + responsive web+tablet+mobile.

---

## Sơ đồ pipeline

```mermaid
flowchart TD
    Start([Ý tưởng sản phẩm]) --> S1

    S1["🔍 1. /market-research<br/>Niche validation<br/>≥3 source triangulate"]
    S1 --> A1[("01-niche-research-report.md<br/>Niche Score /100")]
    A1 -->|"Go ≥ 65"| S2
    A1 -.->|"No-Go < 50"| Stop([Đổi niche])

    S2["📦 2. /biz-offer-alex-hormozi<br/>Grand Slam Offer<br/>Value Equation + 3-4 Bonus"]
    S2 --> A2[("02-offer.md<br/>02-offer.json<br/>02-conversion-copy.md")]
    A2 --> S3

    S3["✍️ 3. /biz-sales-page-copy<br/>Polish / Conversion-opt / Sales-letter<br/>+ A/B variants"]
    S3 --> A3[("04-copy-upgraded.md<br/>04-copy-variants.md<br/>04-copy.json")]
    A3 --> S4

    S4["🎨 4. /ui-ux-pro-max<br/>Next.js App Router<br/>style + palette + font pairing"]
    S4 --> A4[("landing-page/app/page.tsx<br/>components/LeadForm.tsx")]
    A4 --> S5

    S5["💳 5. /biz-setup-sepay-payment<br/>VietQR payment infra<br/>Vercel KV / Supabase"]
    S5 --> A5[("lib/leads-kv.ts<br/>app/api/checkout/route.ts<br/>app/api/sepay-webhook/route.ts")]
    A5 --> S6 & S7 & S8 & S9

    S6["💬 6. /biz-nextjs-chatbot-openrouter<br/>Floating support widget<br/>Gemini 3 Flash / Claude 3.5"]
    S6 --> A6[("components/ChatWidget.tsx<br/>app/api/chat/route.ts")]

    S7["📧 7. /biz-email-setup<br/>Resend 2-stage flow<br/>welcome & payment webhook"]
    S7 --> A7[("Email A: warm welcome<br/>Email B: owner alert")]

    S8["🤖 8. /biz-telegram-payment-notify<br/>Telegram bot notification<br/>Realtime payment alert"]
    S8 --> A8[("lib/telegram.ts<br/>Telegram messages")]

    S9["📊 9. /biz-admin-leads-dashboard<br/>Trang /admin xem đơn<br/>Timing-safe password protect"]
    S9 --> A9[("app/admin/page.tsx<br/>app/api/admin/leads/route.ts")]

    A6 & A7 & A8 & A9 --> Local{{"🧪 Local test<br/>localhost:3000<br/>chatbot + payment + alerts"}}
    Local --> S10

    S10["🚀 10. /biz-deploy-vercel<br/>Triển khai qua Vercel CLI<br/>Cấu hình Env Vars & SSL"]
    S10 --> A10[("Live URL<br/>https://*.vercel.app")]

    A10 --> Live([🎯 Funnel LIVE<br/>đang nhận lead & tiền])

    style Start fill:#fef3c7,stroke:#f59e0b
    style Live fill:#d1fae5,stroke:#10b981
    style Stop fill:#fee2e2,stroke:#ef4444
    style S1 fill:#dbeafe
    style S2 fill:#dbeafe
    style S3 fill:#dbeafe
    style S4 fill:#dbeafe
    style S5 fill:#dbeafe
    style S6 fill:#dbeafe
    style S7 fill:#dbeafe
    style S8 fill:#dbeafe
    style S9 fill:#dbeafe
    style S10 fill:#dbeafe
```

---

## Naming convention output

Mỗi project nằm trong `output/<slug>/` với prefix số thứ tự bước:

```
output/<slug>/
├── 01-niche-research-report.md      # Bước 1
├── 02-offer.md                      # Bước 2 (human-readable)
├── 02-offer.json                    # Bước 2 (machine-readable, downstream input)
├── 02-conversion-copy.md            # Bước 2 (hero/CTA paste-ready)
├── 04-copy-upgraded.md              # Bước 3 (copy mới)
├── 04-copy-variants.md              # Bước 3 (A/B test bank)
├── 04-copy-changes.md               # Bước 3 (diff Trước/Sau)
├── 04-copy.json                     # Bước 3 (structured)
└── landing-page/                    # Bước 4 → 10 (Next.js project)
    ├── app/
    │   ├── page.tsx                 # Trang Landing Page chính
    │   ├── admin/
    │   │   └── page.tsx             # Bước 9: Dashboard quản lý
    │   ├── checkout/
    │   │   └── [orderId]/
    │   │       └── page.tsx         # Bước 5: Trang hiển thị VietQR
    │   └── api/
    │       ├── chat/route.ts        # Bước 6: API chatbot OpenRouter
    │       ├── lead/route.ts        # Bước 7: API gửi email Resend
    │       ├── checkout/route.ts    # Bước 5: API khởi tạo đơn hàng
    │       ├── sepay-webhook/route.ts # Bước 5: API nhận webhook Sepay
    │       └── admin/
    │           └── leads/route.ts   # Bước 9: API danh sách leads bảo mật
    ├── components/
    │   ├── LeadForm.tsx             # Bước 4: Form đăng ký leads (tên/SĐT/email)
    │   └── ChatWidget.tsx           # Bước 6: UI Chatbot bong bóng
    └── lib/
        ├── leads-kv.ts              # Bước 5: Helper kết nối Vercel KV
        ├── supabase.ts              # Bước 5: Helper kết nối Supabase (Lựa chọn thay thế)
        └── telegram.ts              # Bước 8: Helper gửi tin nhắn Telegram
```

> **Lưu ý**: `03-*` bị bỏ trống cố ý — bước 3 cũ là `biz-sales-page-layout` (wireframe markdown) đã **deprecated 2026-05-14**. Pipeline mới đi thẳng từ `02-offer.json` → `ui-ux-pro-max` → `biz-sales-page-copy` (copy polish dùng prefix `04-*`).

---

## 10 bước chi tiết

### Bước 1 — Market Research (`/market-research`)

**Mục đích**: Đo cầu thật của niche trước khi đổ effort. Không phải PESTEL, không phải Porter — đo bằng **keyword volume + marketplace sales + community signal + competitor pricing**.

**Input cần chuẩn bị**:
- 1 mô tả niche/ý tưởng sản phẩm (1-2 câu)
- Optional: customer persona sơ bộ

**Cách chạy**:
```
/market-research

Niche: Khóa học dạy chủ SME VN cách dùng AI Agent để tự động hoá marketing social trong 30 ngày
Tier giá dự kiến: 3-7M VND
```

**Output**:
- `01-niche-research-report.md` — Niche Score /100 + evidence ≥3 source mỗi claim quan trọng
- Quyết định **Go / Go-with-MVP / No-Go**

---

### Bước 2 — Đóng gói Offer (`/biz-offer-alex-hormozi`)

**Mục đích**: Biến niche đã validate thành **"grand slam offer"** không thể chối từ — theo Alex Hormozi $100M Offers + Value Proposition Design (Osterwalder).

**2 input mode**:
- **Mode B**: User paste sẵn pains + gains + product → skill đóng gói ngay
- **Mode C**: User chỉ có sản phẩm → skill phỏng vấn theo VPD để surface pain/gain trước

**Cách chạy**:
```
/biz-offer-alex-hormozi

Sản phẩm: Khóa học 30 ngày "AI Marketing Agent cho chủ SME"
Đọc context từ: output/<slug>/01-niche-research-report.md
```

**Output**:
- `02-offer.md` — full markdown report tiếng Việt
- `02-offer.json` — structured cho downstream (`ui-ux-pro-max` parse được)
- `02-conversion-copy.md` — headline + subheadline + CTA paste-ready

---

### Bước 3 — Nâng cấp Copy (`/biz-sales-page-copy`)

**Mục đích**: Biến copy thô từ `02-offer.json` thành **copy chốt đơn cao** với các Level: Polish, Conversion-optimized, và Sales-letter.

**Cách chạy**:
```
/biz-sales-page-copy

Đọc: output/<slug>/02-offer.json + 02-conversion-copy.md
Intensity: Conversion-optimized
Focus: hero, pain section, CTA cuối
```

**Output**:
- `04-copy-upgraded.md` — copy mới
- `04-copy-variants.md` — A/B test bank (3 hero + 3 CTA + 3 final-CTA)
- `04-copy-changes.md` — diff Trước/Sau + lý do
- `04-copy.json` — structured cho `ui-ux-pro-max`

---

### Bước 4 — Build Landing Page (`/ui-ux-pro-max`)

**Mục đích**: Build Next.js App Router landing page **production-ready** từ `02-offer.json` + `04-copy.json`. Thiết lập UI/UX premium phù hợp với chủ đề.

**Hard requirement**:
- Form đăng ký bắt buộc có 3 trường: **Họ tên / Số điện thoại / Email**
- Hỗ trợ đầy đủ Responsive (Mobile-first, Tablet, Desktop)
- Component `LeadForm.tsx` chuẩn bị sẵn để wire sang endpoint thanh toán ở các bước sau.

**Cách chạy**:
```
/ui-ux-pro-max

Đọc: output/<slug>/02-offer.json + 04-copy.json
Style preference: editorial minimalism + claude-orange accent
Output dir: output/<slug>/landing-page/
Stack: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
```

---

### Bước 5 — Tích hợp Thanh toán VietQR (`/biz-setup-sepay-payment`)

**Mục đích**: Tích hợp hạ tầng thanh toán tự động VietQR thông qua cổng **Sepay.vn**. Khi khách hàng đăng ký đơn hàng → hệ thống sinh QR Code kèm nội dung chuyển khoản định danh (Ví dụ: `DH000123`) → Khách scan & chuyển khoản → Ngân hàng báo có → Sepay gửi Webhook về → Next.js tự động cập nhật trạng thái đơn hàng thành `paid`.

**Lưu trữ Lead (Lead Store)**: Sử dụng **Vercel KV** (Redis) hoặc **Supabase** (Postgres) để lưu đơn tạm thời với TTL 7 ngày (tránh phình database).

**Cách chạy**:
```
/biz-setup-sepay-payment

Project dir: output/<slug>/landing-page
SEPAY_BANK_NAME: Vietcombank
SEPAY_BANK_ACCOUNT_NUMBER: 1023456789
SEPAY_WEBHOOK_API_KEY: sk_sepay_xxxxxxx
```

**Output**:
- `lib/leads-kv.ts` (hoặc `lib/supabase.ts` nếu dùng Supabase)
- `app/api/checkout/route.ts` — API tạo đơn hàng & sinh link VietQR
- `app/api/sepay-webhook/route.ts` — API nhận webhook, kiểm tra chữ ký & cập nhật trạng thái đơn hàng.
- Trang `/checkout/[orderId]` để khách hàng quét QR tiện lợi.

---

### Bước 6 — Cài Chatbot (`/biz-nextjs-chatbot-openrouter`)

**Mục đích**: Thêm **floating AI chatbot widget góc dưới phải** vào landing page, trả lời khách hàng 24/7 dùng knowledge base từ offer + FAQ.

**Cách chạy**:
```
/biz-nextjs-chatbot-openrouter

Project dir: output/<slug>/landing-page
Knowledge base: 02-offer.json + 02-conversion-copy.md
Model: google/gemini-3-flash-preview
Tone: tư vấn tự nhiên, xưng anh/chị, không pushy
```

**Output**:
- `app/api/chat/route.ts` — streaming endpoint
- `components/ChatWidget.tsx` — widget UI

---

### Bước 7 — Setup Email Auto-Responder (`/biz-email-setup`)

**Mục đích**: Wire form đăng ký lên **Resend API** để tự động gửi email khi có lead mới.
- **Email A (Pre-payment)**: Gửi ngay khi điền form, cung cấp thông tin tài khoản ngân hàng để khách thanh toán.
- **Email A (Post-payment)**: Gửi khi nhận được webhook giao dịch thành công (chứa thông tin bàn giao sản phẩm số/khóa học).
- **Email B (Owner alert)**: Gửi thông báo đến email của bạn khi có lead mới đăng ký.

**Cách chạy**:
```
/biz-email-setup

Project dir: output/<slug>/landing-page
Owner email: hoang.tran@prediction3d.com
Sender domain: verification.prediction3d.com
```

**Output**:
- `app/api/lead/route.ts` — endpoint gửi mail
- `.env.local` cập nhật thêm `RESEND_API_KEY`

---

### Bước 8 — Setup Thông báo Telegram (`/biz-telegram-payment-notify`)

**Mục đích**: Gửi thông báo tin nhắn Realtime qua **Telegram Bot** đến chat cá nhân của bạn hoặc Group chat của đội ngũ Sales ngay lập tức khi khách hàng chuyển khoản thành công.

**Cách chạy**:
```
/biz-telegram-payment-notify

Project dir: output/<slug>/landing-page
TELEGRAM_BOT_TOKEN: 1234567890:AAxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID: 123456789 (hoặc chat ID nhóm -100xxxxxxxxxx)
```

**Output**:
- `lib/telegram.ts` — helper gửi tin nhắn HTTP đến API Telegram
- Tích hợp hàm `sendTelegramNotification` vào endpoint nhận webhook `sepay-webhook` thông qua `Promise.allSettled`.

---

### Bước 9 — Tạo Admin Dashboard (`/biz-admin-leads-dashboard`)

**Mục đích**: Trang `/admin` siêu tinh gọn giúp bạn xem danh sách leads, doanh thu, trạng thái thanh toán. Bảo mật bằng một mật khẩu quản trị duy nhất trong biến môi trường (`ADMIN_PASSWORD`), nhập đúng sẽ unlock giao diện xem trực quan mà không cần cơ chế session/cookie phức tạp.

**Cách chạy**:
```
/biz-admin-leads-dashboard

Project dir: output/<slug>/landing-page
ADMIN_PASSWORD: your_strong_password
```

**Output**:
- `app/admin/page.tsx` — trang dashboard (popup mật khẩu + bảng dữ liệu + export CSV)
- `app/api/admin/leads/route.ts` — API trả về danh sách leads đã được xác thực bảo mật.

---

### Bước 10 — Deploy Production (`/biz-deploy-vercel`)

**Mục đích**: Đưa landing page đã hoàn thiện và kiểm thử local lên live URL production trên Vercel. Tự động kiểm tra cài đặt CLI, link project và đẩy biến môi trường.

**Cách chạy**:
```
/biz-deploy-vercel

Project dir: output/<slug>/landing-page
Project name: ai-marketing-agent-30-days
```

**Output**:
- Live URL dạng `https://<project>.vercel.app`
- Link Inspect/Logs để theo dõi trạng thái.

---

## Hướng dẫn Cơ sở Dữ liệu & Triển khai (Supabase & Vercel CLI)

### 1. Hướng dẫn Triển khai với Vercel CLI

Vercel CLI cho phép bạn đẩy và quản lý dự án trực tiếp từ dòng lệnh máy tính.

#### Các bước thực hiện:
1.  **Cài đặt Vercel CLI toàn cục** (nếu chưa có):
    ```bash
    npm install -g vercel
    ```
2.  **Đăng nhập vào Vercel**:
    ```bash
    vercel login
    ```
    *Lệnh này sẽ mở trình duyệt để bạn xác thực tài khoản qua Google, GitHub, hoặc Email.*
3.  **Khởi tạo và Link dự án** (chạy tại thư mục dự án):
    ```bash
    vercel link
    ```
    *Chọn tài khoản của bạn, nhấn Enter để đồng ý liên kết và để Vercel tự động nhận diện framework.*
4.  **Cấu hình Biến Môi trường (Env Vars) trên Vercel**:
    Các key nhạy cảm trong file `.env.local` cần được đẩy lên Vercel để chạy trên production. Chạy lệnh:
    ```bash
    vercel env add OPENROUTER_API_KEY production
    # Nhập API Key khi CLI yêu cầu
    vercel env add RESEND_API_KEY production
    # Nhập API Key khi CLI yêu cầu
    vercel env add DATABASE_URL production
    # Nhập chuỗi kết nối Database khi CLI yêu cầu
    ```
5.  **Triển khai Production**:
    Chạy lệnh sau để build sản phẩm và publish trực tiếp:
    ```bash
    vercel --prod
    ```
    *Sau khi hoàn tất, bạn sẽ nhận được **Live URL** chính thức.*

---

### 2. Kết nối CSDL Supabase (Postgres) cho Landing Page & Admin Dashboard

Nếu bạn muốn một cơ sở dữ liệu quan hệ PostgreSQL ổn định để lưu trữ Lead và Giao dịch lâu dài thay thế cho Vercel KV (Redis), **Supabase** là lựa chọn tốt nhất.

#### Hướng dẫn lấy thông tin kết nối Supabase (Credentials)
Để Next.js kết nối được với Supabase, bạn cần lấy các thông số sau trong Supabase Dashboard:

1.  **Truy cập vào dự án của bạn** tại [Supabase Dashboard](https://supabase.com/dashboard).
2.  Bấm chọn **Project Settings** (biểu tượng bánh răng răng ở thanh menu góc dưới bên trái).
3.  Chọn mục **API**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: Sao chép URL trong phần **Project URL** (Ví dụ: `https://xyz.supabase.co`).
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Sao chép API key trong mục **Project API Keys** hàng `anon` / `public`. Key này an toàn khi hiển thị ở phía Client-side.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Sao chép API key trong mục **Project API Keys** hàng `service_role` / `secret`. **CẢNH BÁO:** Không bao giờ để lộ key này ở client-side; chỉ dùng ở các API Route bảo mật ở Server-side.
4.  Chọn mục **Database** (dưới mục Settings):
    *   Cuộn xuống phần **Connection string**:
        *   Chọn tab **URI**.
        *   Sao chép chuỗi kết nối.
        *   **Ví dụ:** `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true` (chế độ Transaction pooler hữu ích cho Serverless).
        *   *Lưu ý:* Hãy thay thế `[YOUR-PASSWORD]` bằng mật khẩu database bạn đã thiết lập khi tạo dự án Supabase.

#### Cấu hình File `.env.local`
Thêm các biến môi trường sau vào file `.env.local` ở thư mục root của dự án Next.js:
```env
# Supabase Public Keys (Client & Server)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Secret Keys (Server-side Only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Postgres Connection String (dành cho Prisma / Drizzle / pg)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### Thiết lập cấu trúc bảng `leads` trên Supabase (Database Schema)
Bạn truy cập vào **SQL Editor** trong thanh công cụ bên trái của Supabase Dashboard, tạo một query mới và chạy script SQL sau:

```sql
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_id text unique not null, -- Định dạng: DH000123
  name text not null,
  phone text not null,
  email text not null,
  product_name text not null,
  amount numeric not null,
  status text default 'pending'::text not null, -- pending, paid, expired
  payment_details jsonb, -- Lưu toàn bộ JSON log từ Sepay Webhook gửi sang
  paid_at timestamp with time zone
);

-- Tạo Index để tối ưu truy vấn tìm kiếm
create index idx_leads_order_id on leads(order_id);
create index idx_leads_phone on leads(phone);
```

---

### 3. Hướng dẫn cài đặt Supabase MCP Server

Supabase MCP (Model Context Protocol) giúp AI Agent của bạn (ví dụ như Claude Code, Cursor) kết nối thẳng vào dự án Supabase để tự động đọc cấu trúc bảng, sửa database, chạy query SQL và viết code khớp 100% với database thật.

#### Cách 1: Sử dụng Hosted Remote MCP Server (Khuyên dùng - Đơn giản nhất)
Cách này không yêu cầu cài đặt gói npm nào trên máy cục bộ và xác thực bảo mật OAuth an toàn.

*   **Server URL:** `https://mcp.supabase.com/mcp`
*   **Cách cấu hình cho Claude Code CLI:**
    Chạy lệnh này trực tiếp trong Terminal của bạn:
    ```bash
    claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp"
    ```
*   **Cách cấu hình thủ công qua file `.mcp.json`:**
    Thêm config sau vào file `.mcp.json` trong dự án của bạn:
    ```json
    {
      "mcpServers": {
        "supabase": {
          "type": "http",
          "url": "https://mcp.supabase.com/mcp"
        }
      }
    }
    ```
*   **Xác thực:** Lần đầu tiên AI agent gọi đến công cụ, trình duyệt của bạn sẽ tự động bật tab yêu cầu bạn đăng nhập Supabase và chọn tổ chức/dự án muốn cấp quyền.

#### Cách 2: Sử dụng Local NPX Package (Stdio Local)
Nếu muốn chạy server MCP trực tiếp trên tài nguyên máy cục bộ của bạn, bạn sử dụng package `@supabase/mcp-server-supabase`.

*   **Bước 1: Tạo token cá nhân (PAT):**
    Vào **Supabase Account Settings** -> **Access Tokens** -> Bấm **Generate new token** để lấy Personal Access Token.
*   **Bước 2: Cấu hình trong `.mcp.json` (dành cho Cursor / Claude Desktop):**
    ```json
    {
      "mcpServers": {
        "supabase": {
          "command": "npx",
          "args": [
            "-y",
            "@supabase/mcp-server-supabase@latest",
            "--access-token",
            "<YOUR_PERSONAL_ACCESS_TOKEN>"
          ]
        }
      }
    }
    ```
    *(Thay `<YOUR_PERSONAL_ACCESS_TOKEN>` bằng Token cá nhân bạn vừa tạo).*

---

## Checklist Go-Live

Trước khi chia sẻ landing page cho khách hàng thực tế, hãy rà soát kỹ danh sách sau:

- [ ] **Niche Score ≥ 65** từ bước 1 (có bằng chứng cụ thể từ ít nhất 3 nguồn tin cậy).
- [ ] `02-offer.json` chứa đầy đủ cấu trúc Core Offer + Bonus Stack (3-4 món) + Guarantee + Pricing VND.
- [ ] Giao diện landing page đã được kiểm tra hiển thị responsive ở 3 viewport chuẩn: **375px (mobile)**, **768px (tablet)**, **1440px (desktop)** trên `localhost:3000`.
- [ ] Form đăng ký `LeadForm.tsx` hoạt động tốt, validate định dạng SĐT Việt Nam: `/^(0|\+84)[0-9]{9}$/`.
- [ ] Bấm đăng ký đơn hàng -> sinh mã `DHxxxxxx` -> lưu vào KV hoặc Supabase và hiển thị trang Checkout với QR Code chính xác.
- [ ] Quét thử QR Code bằng App Ngân hàng -> kiểm tra thông tin ngân hàng thụ hưởng, số tiền, và nội dung chuyển khoản đã được điền sẵn chuẩn xác.
- [ ] Đẩy toàn bộ biến môi trường (`OPENROUTER_API_KEY`, `RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `DATABASE_URL`...) lên Vercel Environment Variables.
- [ ] Chạy `vercel --prod` -> kiểm tra trang live chạy HTTPS mượt mà, không lỗi Console.
- [ ] Cấu hình Webhook URL trên Sepay Dashboard trỏ tới link live (`https://yourdomain.com/api/sepay-webhook`) và chọn phương thức xác thực `API Key`.
- [ ] Kiểm thử 1 đơn hàng thật bằng cách chuyển khoản 1.000đ:
  - Check xem tin nhắn Telegram có đổ về ngay lập tức không (<3s).
  - Check hòm thư xem khách hàng có nhận được Email cảm ơn kèm sản phẩm không.
  - Check xem Admin Dashboard `/admin` có hiển thị đơn hàng đó với trạng thái `paid` không.

---

## Skills đã bị deprecated

| Skill | Status | Lý do | Thay thế bằng |
|-------|--------|-------|---------------|
| `/biz-sales-page-layout` | ⚠️ DEPRECATED 2026-05-14 | Wireframe markdown trung gian không tạo giá trị — `ui-ux-pro-max` đọc `02-offer.json` ra Next.js production luôn | Đi thẳng `02-offer.json` → `/ui-ux-pro-max` |

---

## FAQ vận hành

**Q: Có thể skip bước nào không?**
- Skip bước 1 nếu đã có niche validated từ trước (paste sẵn pain/gain vào bước 2).
- Skip bước 3 nếu copy từ bước 2 đã đủ chất lượng cho MVP.
- **Không skip bước 4** — landing page là xương sống cho mọi bước sau.
- Bước 6, 7, 8, 9 có thể chạy parallel hoặc skip bớt tùy nhu cầu của bạn (ví dụ chỉ cần Telegram mà không cần email, hoặc không cần chatbot hỗ trợ).

**Q: Cần các API Key nào để vận hành trọn bộ?**
- `OPENROUTER_API_KEY` (AI Chatbot) — lấy từ openrouter.ai
- `RESEND_API_KEY` (Email gửi đi) — lấy từ resend.com
- `SEPAY_WEBHOOK_API_KEY` (Xác thực Webhook) — lấy từ my.sepay.vn
- `TELEGRAM_BOT_TOKEN` (Gửi tin nhắn Telegram) — tạo qua @BotFather trên Telegram
- `DATABASE_URL` (Kết nối CSDL) — lấy từ dự án Supabase.

---

## Tham chiếu file thực tế (case study)

Project mẫu `ai-agent-marketing-busy-owner` đã chạy đầy đủ pipeline — xem `output/ai-agent-marketing-busy-owner/` để tham chiếu cấu trúc thực tế:

- [01-niche-research-report.md](output/ai-agent-marketing-busy-owner/01-niche-research-report.md) — Niche Score 78/100 Solid Go
- [02-offer.json](output/ai-agent-marketing-busy-owner/02-offer.json) — structured offer cho downstream
- [02-offer.md](output/ai-agent-marketing-busy-owner/02-offer.md) — human-readable offer report
- [04-copy-upgraded.md](output/ai-agent-marketing-busy-owner/04-copy-upgraded.md) — copy đã polish
- [landing-page/](output/ai-agent-marketing-busy-owner/landing-page/) — Next.js project
- [landing-page/components/LeadForm.tsx](output/ai-agent-marketing-busy-owner/landing-page/components/LeadForm.tsx) — form 3 field tên/SĐT/email
