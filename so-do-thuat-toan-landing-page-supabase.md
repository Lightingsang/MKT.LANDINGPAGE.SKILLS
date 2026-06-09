# Sơ đồ thuật toán: Landing Page → Thanh toán → Lưu Supabase

> Tài liệu này giải thích **cách landing page tự động tính đơn hàng, lưu lead, lưu đơn hàng xuống database Supabase** — viết cho người mới học, từ dễ đến khó.

---

## 1. Hiểu nhanh trong 30 giây

Một landing page bán hàng làm 2 việc lớn, lặp đi lặp lại:

1. **Khi khách điền form** → tạo một "đơn hàng nháp" (chưa trả tiền) và lưu xuống database.
2. **Khi khách chuyển khoản xong** → ngân hàng báo về, hệ thống tự đánh dấu đơn đó "đã thanh toán".

Mọi thứ cần nhớ — tên khách, SĐT, email, gói đã chọn, số tiền, mã đơn, trạng thái — đều được **lưu xuống Supabase** (một database online miễn phí). Không lưu trong đầu, không lưu tạm trong trình duyệt.

> 💡 **Quy tắc vàng:** "Nếu chưa ghi xuống database thì coi như chưa xảy ra."

---

## 2. Sơ đồ tổng quan — 3 khu vực

Hệ thống chia làm 3 vùng. Hãy nhìn theo màu:

```mermaid
flowchart LR
    subgraph KH["🧑 KHÁCH HÀNG (trình duyệt)"]
        A1["Mở Landing Page"]
        A2["Chọn gói + điền form<br/>tên / SĐT / email"]
        A3["Nhận mã QR<br/>→ quét chuyển khoản"]
    end

    subgraph SV["⚙️ SERVER (Next.js API)"]
        B1["/api/checkout<br/>TẠO đơn hàng"]
        B2["/api/sepay-webhook<br/>XÁC NHẬN thanh toán"]
    end

    subgraph DB["🗄️ SUPABASE (Database)"]
        C1[("Bảng leads<br/>khách + đơn hàng")]
        C2[("Bảng order_counter<br/>bộ đếm mã đơn")]
        C3[("Bảng webhook_dedup<br/>chống xử lý trùng")]
    end

    BANK["🏦 Ngân hàng + Sepay"]

    A1 --> A2 --> B1
    B1 -->|"lấy số kế tiếp"| C2
    B1 -->|"lưu đơn nháp"| C1
    B1 -->|"trả mã QR"| A3
    A3 -->|"chuyển khoản"| BANK
    BANK -->|"gọi webhook"| B2
    B2 -->|"check trùng"| C3
    B2 -->|"đánh dấu đã trả"| C1

    classDef kh fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
    classDef sv fill:#FEF3C7,stroke:#D97706,color:#78350F
    classDef db fill:#DCFCE7,stroke:#16A34A,color:#14532D
    class A1,A2,A3 kh
    class B1,B2 sv
    class C1,C2,C3 db
```

- 🔵 **Khách hàng** — chỉ nhìn thấy trang web, không thấy database.
- 🟡 **Server** — bộ não, nhận yêu cầu và quyết định.
- 🟢 **Supabase** — bộ nhớ lâu dài, ghi xuống đĩa.

---

## 3. Giai đoạn A — Khách điền form (TẠO đơn hàng)

Đây là lúc "đơn hàng nháp" ra đời. Khách chưa trả tiền, nhưng hệ thống đã ghi nhớ họ.

```mermaid
flowchart TD
    START([Khách bấm nút<br/>Đăng ký / Mua ngay]) --> V{SĐT hợp lệ?<br/>0xxx hoặc +84xxx}
    V -->|"❌ Sai"| ERR["Hiện báo lỗi đỏ<br/>dưới ô SĐT"]
    ERR --> START
    V -->|"✅ Đúng"| SEND["Gửi dữ liệu lên server<br/>POST /api/checkout"]

    SEND --> CALC1["💰 TÍNH SỐ TIỀN<br/>theo gói khách chọn"]
    CALC1 --> CALC2["🔢 TÍNH MÃ ĐƠN<br/>order_counter + 1 → DH000123"]
    CALC2 --> CALC3["⏰ TÍNH HẠN ĐƠN<br/>hôm nay + 7 ngày"]

    CALC3 --> DUP{SĐT này<br/>đã có đơn chưa?}
    DUP -->|"Rồi"| REUSE["Dùng lại đơn cũ<br/>(không tạo trùng)"]
    DUP -->|"Chưa"| INSERT["💾 LƯU vào bảng leads<br/>status = 'pending'"]

    REUSE --> EMAIL
    INSERT --> EMAIL["📧 Gửi email A<br/>xác nhận nhẹ (không chặn)"]
    EMAIL --> RESP["Trả về cho trình duyệt:<br/>mã đơn + số tiền + mã QR VietQR"]
    RESP --> SHOW([Trang web hiện<br/>mã QR để khách quét])

    classDef calc fill:#FEF3C7,stroke:#D97706,color:#78350F
    classDef db fill:#DCFCE7,stroke:#16A34A,color:#14532D
    classDef io fill:#DBEAFE,stroke:#2563EB,color:#1E3A8A
    class CALC1,CALC2,CALC3 calc
    class INSERT,DUP db
    class START,SHOW,SEND,RESP io
```

### "Tính toán tự động" gồm những gì?

| Tính cái gì | Dựa vào đâu | Kết quả ví dụ |
|---|---|---|
| 💰 **Số tiền** | Gói (tier) khách chọn trong offer | `499.000đ` |
| 🔢 **Mã đơn** | Bảng `order_counter` tăng dần | `DH000123` |
| ⏰ **Hạn đơn** | Ngày tạo + 7 ngày (đơn chưa trả) | `expires_at` |
| 🔁 **Chống trùng** | Tra bảng `phone_index` theo SĐT | dùng lại đơn cũ |

> Server **tự làm hết** — khách không phải nhập số tiền hay mã đơn. Khách chỉ điền tên / SĐT / email.

---

## 4. Giai đoạn B — Khách quét QR thanh toán (XÁC NHẬN đơn)

Khách chuyển khoản xong, ngân hàng báo cho **Sepay**, Sepay "gõ cửa" server qua một webhook.

```mermaid
flowchart TD
    PAY([Khách quét QR<br/>chuyển khoản qua app ngân hàng]) --> SEPAY["Sepay phát hiện tiền về<br/>→ gọi POST /api/sepay-webhook"]

    SEPAY --> AUTH{API key của Sepay<br/>có đúng không?}
    AUTH -->|"❌ Sai"| R401["Trả lỗi 401<br/>(kẻ lạ, bỏ qua)"]
    AUTH -->|"✅ Đúng"| DEDUP{Giao dịch này<br/>đã xử lý rồi chưa?<br/>tra webhook_dedup}

    DEDUP -->|"Rồi"| R200A["Trả 200 ngay<br/>(không làm lại lần 2)"]
    DEDUP -->|"Chưa"| MATCH["🔎 TÌM đơn nháp khớp:<br/>theo mã đơn trong nội dung CK<br/>hoặc theo số tiền + thời gian"]

    MATCH --> FOUND{Tìm thấy<br/>đơn pending?}
    FOUND -->|"Không"| LOG["Ghi log 'tiền lạ'<br/>+ trả 200"]
    FOUND -->|"Có"| UPDATE["💾 CẬP NHẬT bảng leads<br/>status = 'paid'<br/>gia hạn lưu → 90 ngày"]

    UPDATE --> PARALLEL["Chạy SONG SONG<br/>(Promise.allSettled)"]
    PARALLEL --> E2["📧 Email B<br/>onboarding đầy đủ"]
    PARALLEL --> TELE["📲 Telegram báo<br/>chủ shop có đơn mới"]

    E2 --> R200B["Trả 200 cho Sepay ✅"]
    TELE --> R200B
    R200B --> DONE([Xong — đơn đã 'paid'<br/>hiện trên /admin])

    classDef db fill:#DCFCE7,stroke:#16A34A,color:#14532D
    classDef warn fill:#FEE2E2,stroke:#DC2626,color:#7F1D1D
    classDef act fill:#FEF3C7,stroke:#D97706,color:#78350F
    class UPDATE,MATCH,DEDUP db
    class R401,LOG warn
    class PARALLEL,E2,TELE act
```

### 3 điều quan trọng ở giai đoạn này

1. **Phải trả về `200` cho Sepay.** Nếu trả lỗi, Sepay tưởng thất bại và **gọi lại nhiều lần** → khách bị spam email/Telegram. Vì vậy có bảng `webhook_dedup` để "nhớ" giao dịch nào đã xử lý.
2. **Email + Telegram chạy song song.** Nếu Telegram lỗi cũng **không được làm hỏng** việc trả `200`. Đó là lý do dùng `Promise.allSettled` (chạy hết, không quan tâm cái nào fail).
3. **Khớp đơn tự động.** Server đối chiếu số tiền + nội dung chuyển khoản (chứa mã đơn `DH000123`) để biết tiền này là của ai.

---

## 5. Sơ đồ trình tự theo thời gian

Cùng một câu chuyện, nhưng nhìn theo "ai nói chuyện với ai, theo thứ tự nào":

```mermaid
sequenceDiagram
    actor K as 🧑 Khách
    participant W as 🌐 Landing Page
    participant S as ⚙️ Server API
    participant DB as 🗄️ Supabase
    participant SP as 🏦 Sepay
    participant O as 👔 Chủ shop

    Note over K,DB: GIAI ĐOẠN A — Tạo đơn
    K->>W: Điền tên / SĐT / email + chọn gói
    W->>W: Kiểm tra định dạng SĐT
    W->>S: POST /api/checkout
    S->>DB: Lấy số kế tiếp (order_counter)
    S->>DB: Lưu lead (status = pending)
    S-->>K: 📧 Email A (xác nhận nhẹ)
    S->>W: Trả mã đơn + số tiền + mã QR
    W->>K: Hiện QR VietQR

    Note over K,O: GIAI ĐOẠN B — Xác nhận thanh toán
    K->>SP: Quét QR, chuyển khoản
    SP->>S: POST /api/sepay-webhook
    S->>DB: Check trùng (webhook_dedup)
    S->>DB: Tìm đơn khớp + cập nhật status = paid
    S-->>K: 📧 Email B (onboarding)
    S-->>O: 📲 Telegram "Có đơn mới!"
    S->>SP: Trả 200 OK
```

---

## 6. Dữ liệu lưu xuống Supabase (4 bảng)

Đây là phần "lưu toàn bộ xuống database". Mỗi bảng có một nhiệm vụ riêng:

| Bảng | Nhiệm vụ | Cột chính |
|---|---|---|
| **leads** | Trái tim hệ thống — mỗi dòng = 1 khách + 1 đơn hàng | `order_id`, `name`, `phone`, `email`, `package`, `amount`, `status`, `created_at`, `paid_at`, `expires_at` |
| **phone_index** | Sổ tra cứu nhanh "SĐT này đã đăng ký chưa" → chống tạo đơn trùng | `phone` → `order_id` |
| **order_counter** | Chỉ 1 dòng duy nhất, giữ con số đếm, tăng dần để sinh `DH000001`, `DH000002`… | `current_value` |
| **webhook_dedup** | Nhớ những giao dịch Sepay đã xử lý → chống xử lý 1 giao dịch 2 lần | `transaction_id`, `processed_at` |

### Trạng thái (`status`) của một đơn

```mermaid
stateDiagram-v2
    [*] --> pending: Khách điền form
    pending --> paid: Sepay báo đã chuyển khoản
    pending --> expired: Quá 7 ngày không trả tiền
    paid --> [*]: Lưu giữ 90 ngày
    expired --> [*]: Tự xoá
```

- `pending` — đơn nháp, chờ tiền. Giữ **7 ngày**.
- `paid` — đã thanh toán. Giữ **90 ngày** (để chăm sóc khách + xem báo cáo).
- `expired` — quá hạn không trả → tự dọn để database không phình to.

---

## 7. Cheat sheet — giải thích cho người mới

| Thuật ngữ | Nói cho dễ hiểu |
|---|---|
| **Landing page** | Trang web 1 trang để bán 1 sản phẩm. |
| **Lead** | Một khách tiềm năng đã để lại thông tin (tên/SĐT/email). |
| **API `/api/checkout`** | "Quầy lễ tân" — nhận form, tạo đơn, đẻ mã QR. |
| **Webhook** | Sepay tự "gọi điện" báo cho server, server không phải hỏi đi hỏi lại. |
| **Sepay / VietQR** | Dịch vụ giúp tạo mã QR ngân hàng và phát hiện khi có tiền về. |
| **Supabase** | Database online miễn phí (Postgres) — nơi lưu mọi thứ lâu dài. |
| **Dedup (chống trùng)** | Kỹ thuật đảm bảo 1 việc chỉ làm đúng 1 lần, dù bị gọi nhiều lần. |
| **`status = pending / paid`** | Nhãn trạng thái đơn: chờ tiền / đã trả tiền. |

### Ghi nhớ 3 ý cốt lõi

1. **Form → tạo đơn nháp (`pending`) → lưu Supabase.** Khách chưa trả tiền vẫn được ghi nhớ.
2. **Chuyển khoản → Sepay báo webhook → đổi đơn thành `paid`.** Tự động, không cần ai bấm tay.
3. **Mọi con số (tiền, mã đơn, hạn) đều do server tự tính** — khách chỉ nhập tên/SĐT/email.

---

> 📌 Mỗi mũi tên trỏ vào hình trụ 🗄️ nghĩa là "ghi xuống Supabase". Cứ thấy hình trụ là biết: **dữ liệu vừa được lưu lại an toàn.**
