# Vietnamese Demand-Side Data Sources

Nguồn data cụ thể để đo demand cho digital product / service ở thị trường Việt Nam. Mỗi nguồn có: cách truy cập, search template, threshold đọc tín hiệu strong/weak.

## 1. Search Volume + CPC (Google Keyword Planner)

**URL:** `ads.google.com` → Tools → Planning → Keyword Planner → Discover new keywords

**Setup:**
- Tạo Google Ads account free (không cần đặt budget thật)
- Location: Vietnam | Language: Vietnamese + English (cả 2)

**Search VN tips:**
- VN audience search bằng cả tiếng Việt + tiếng Anh — luôn check cả 2
- VD: "khóa học AI" + "AI course" cùng 1 niche, volume add lại
- Cẩn thận với typo/no-tone phổ biến: "khoa hoc" cũng có volume

**Đọc volume (monthly):**

| Range | Ý nghĩa | Action |
|---|---|---|
| <500 | Micro-niche, hoặc không demand | Verify với marketplace; thường pass |
| 500-5K | Sweet spot cho solopreneur VN | Target zone, dễ rank |
| 5K-50K | Mid-market, có competition | Cần differentiation rõ |
| >50K | Mass market | Solo khó chiếm share, cần ngách hẹp |

**Đọc CPC (VND, không phải USD):**

| CPC | Commercial intent | Suggested action |
|---|---|---|
| <2K VND | Informational, hobby | Hard to monetize directly |
| 2K-10K VND | Moderate buy intent | OK cho course tier <1M |
| 10K-50K VND | Strong buy intent | Target cho course 1M+ / coaching |
| >50K VND | High-ticket / B2B | Premium positioning needed |

**Đọc Competition:**
- Low = ít advertiser bid → có thể demand yếu HOẶC B2B sales-cycle dài
- Medium = healthy demand + room for entry (zone vàng)
- High = đã saturated, vào phải có moat

## 2. Google Trends (Region: Vietnam)

**URL:** `trends.google.com` → set region: Vietnam

**Workflow:**
1. Compare 3-5 keyword cùng lúc (1 primary + 2-4 variant)
2. Time range: Past 5 years (trend direction) + Past 12 months (seasonality)
3. Check "Related queries" → tab "Rising" → tìm breakout keyword (+150% trở lên)

**Đọc signal:**

| Pattern | Verdict |
|---|---|
| Steady ↑ over 2+ năm | **Pursue** — trend bền |
| Spike rồi giữ baseline cao | **Pursue** — đã establish |
| Flat nhưng volume cao | **OK** — evergreen, cần differentiate |
| Spike rồi tụt về 0 | **Avoid** — fad đã qua |
| Steady ↓ | **Avoid** — dying |

**Seasonality (Past 12 months):**
- Ratio = Peak / Average
- >3x → time-sensitive, launch 2 tháng trước peak
- 1.5-3x → optimize cho peak, year-round content
- <1.5x → evergreen

## 3. Marketplace Course Platforms (VN-specific)

| Platform | Đặc điểm | Cách read sales |
|---|---|---|
| **unica.vn** | Course platform lớn nhất VN, mass market | Page course hiển thị "X học viên", review count, rating |
| **edumall.vn** | Cạnh tranh trực tiếp Unica | Same format, kiểm tra "Đã có X học viên đăng ký" |
| **gitiho.com** | Tech/business courses, mid-tier pricing | Hiển thị enrolled count + rating |
| **kyna.vn** | Skill courses, soft skill nhiều | Số học viên + review |
| **funix.edu.vn** | Tech focused (programming, AI) | Course pages hiển thị batch + cohort |
| **hocmai.vn** | K-12 + thi cử | Volume cao cho exam prep, market khác biệt |
| **topica.edu.vn** | English + business, premium | Pricing cao, ít course count public |

**Query template cho mỗi platform:**

```
"$NICHE site:unica.vn"
"$NICHE site:edumall.vn"
"$NICHE site:gitiho.com"
"$NICHE site:kyna.vn"
```

**Đọc tín hiệu (per top course):**

| Metric | Strong | Weak |
|---|---|---|
| Học viên (enrolled) | 500+ trên 1 course | <100 |
| Rating | 4.3+ với 50+ review | <4.0 hoặc <10 review |
| Price | 500K-3M VND tier hợp lý | <100K (commodified) hoặc >5M (niche premium) |
| Top course date | <12 tháng | >24 tháng (stale) |
| Số course trong niche | 5-30 | <3 (no market) hoặc >100 (saturated) |

**Content gap analysis:**
- Đọc review 1-2 sao của top course → recurring complaint = opportunity
- Check curriculum syllabus → missing topic = differentiation angle

## 4. Shopee / Tiki / Lazada (E-commerce)

**Khi nào dùng:** Niche có physical product hoặc digital product được sell qua marketplace (ebook, template, tool license).

**Workflow Shopee:**
1. `shopee.vn` → search keyword → filter "Đã bán nhiều nhất"
2. Top 20 listing → ghi: tên seller, "Đã bán X", giá, rating, review count
3. Filter "Có voucher 50%+" → indicator competition intense

**Đọc tín hiệu:**

| Metric | Strong demand | Weak |
|---|---|---|
| Tổng product listing | 100-500 trong category | <20 (niche too small) |
| Top seller "Đã bán" | 1K+ (12 tháng) | <100 |
| Rating top | 4.5+ với 100+ review | <4.0 |
| Price range | 100K-2M tier rõ | <50K (race to bottom) |
| Recent reviews (30 ngày) | 10+ trên top seller | <3 |

## 5. Facebook Community Signal

### 5a. FB Groups

**Query:** `facebook.com/search/groups/?q=$NICHE vietnam` hoặc Google `"$NICHE" facebook group vietnam`

**Đọc tín hiệu:**

| Metric | Strong | Weak |
|---|---|---|
| Số group active | 5+ với 1K+ thành viên mỗi cái | <2 hoặc tổng <500 |
| Post frequency | Daily posts trong top 3 group | Weekly hoặc ít hơn |
| Engagement | 10+ comments trên top posts | <3 comments |
| Buying signal | "Ai biết mua ở đâu", "tư vấn", "review" | Chỉ sharing content, không hỏi mua |

### 5b. FB Ads Library

**URL:** `facebook.com/ads/library` → Country: Vietnam → search keyword/competitor page name

**Đọc tín hiệu:**

| Metric | Strong | Weak |
|---|---|---|
| Active ads cho keyword | 20+ ads đang chạy | <5 |
| Ad duration | Nhiều ads >30 ngày | All ads <7 ngày (testing chứ chưa scale) |
| Distinct advertisers | 10+ brand khác nhau | 1-2 brand độc chiếm |
| Creative variants | Multiple angle (pain/gain/social proof) | Monoculture (chỉ 1 angle) |

**Diagnose ad longevity:** Nếu ad chạy >30 ngày = đang profitable = niche monetizable.

## 6. TikTok / YouTube Volume

### 6a. TikTok hashtag

**Query Google:** `"#$NICHE" tiktok view count` hoặc check `tiktok.com/tag/$NICHE`

| Hashtag views | Verdict |
|---|---|
| 10K-100K | Micro-community, engaged nhưng nhỏ |
| 100K-1M | Active niche, good cho VN solopreneur |
| 1M-10M | Established, cần differentiate |
| >10M | Mainstream, hard mass appeal |

### 6b. YouTube

**Query:** `"$NICHE" tiếng việt site:youtube.com`

**Đọc tín hiệu:**
- Small channel (<10K subs) getting 50K+ views = **strong demand** (algorithm boost = topic hot)
- Top channels view/sub ratio >1.0 = interest cao
- Upload frequency mỗi tuần ở top channel = topic sustained

## 7. Reddit / Quora / VN Forum

**Query:**
```
"$NICHE site:reddit.com"
"$NICHE site:reddit.com/r/vietnam"  (specifically VN sub)
"$NICHE site:vozforums.com"          (tech-leaning VN forum)
"$NICHE site:tinhte.vn"              (tech VN community)
```

**Mục đích:** Pain point + sentiment language. Copy verbatim 10 questions/complaints để dùng làm:
- Audience language cho copy/headline
- Pain mapping (link sang `vpd-customer-profile-builder`)
- Frequency analysis (pain nào lặp lại nhiều = severity cao)

## 8. Competitor Pricing & Positioning

**Workflow:**
1. List 3-5 direct competitor identified trong Step 1-3
2. WebFetch landing page mỗi competitor → extract: pricing tier, bonus stack, guarantee, positioning angle, ICP
3. Build comparison table

**Output format:**

```markdown
| Competitor | URL | Price | Positioning | ICP | Bonus stack | Guarantee | Strength | Gap |
|---|---|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... | ... | ... |
```

**Pricing pattern VN digital course (2026 benchmark):**
- Tripwire / low ticket: 99K-499K
- Core (course solo, no coaching): 499K-2M
- Premium (course + group coaching): 2M-10M
- Mastermind / 1-1: 10M-50M+

## 9. Source Quality Hierarchy

Khi triangulate, không phải source nào cũng nặng ký bằng nhau:

| Tier | Source type | Trust weight |
|---|---|---|
| **A — Direct evidence** | Marketplace sales count, FB Ads Library active ads, course platform enrollment | 1.0 |
| **B — Behavioral data** | Google Trends, Keyword Planner volume, hashtag views | 0.7 |
| **C — Stated preference** | Forum questions, FB group discussions, survey | 0.4 |
| **D — News/analyst** | Industry report, news article, blog estimate | 0.3 |

**Rule:** Cần ≥1 source Tier A cho mỗi major claim (demand exists, willing to pay, competition density). Tier B/C/D chỉ làm supporting evidence.

## 10. Quick 2-hour Sprint Protocol

Khi cần validation nhanh, không phải full research:

**Hour 1 — Signal scan:**
- 15min: Keyword Planner volume + CPC cho 5-10 variant keyword
- 15min: Google Trends VN, 5-year direction + 12-month seasonality
- 15min: Unica + Edumall + Gitiho top 5 course (enrolled, price, rating)
- 15min: FB Ads Library active ads (count + duration)

**Hour 2 — Score & decide:**
- 20min: FB group + TikTok hashtag check
- 20min: Top 3 competitor positioning + pricing
- 20min: Score 100 + recommendation

**Output:** Decision với 70% confidence. Dùng cho filter trước khi full research top 1-2 candidate.
