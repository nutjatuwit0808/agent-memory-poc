import type { DomainProfile } from "../types.js";

// AdPulse — แพลตฟอร์มประมูลโฆษณาแบบเรียลไทม์ (RTB)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const adBidding: DomainProfile = {
  id: "ad-bidding",
  displayName: "AdPulse — แพลตฟอร์มประมูลโฆษณาแบบเรียลไทม์ (RTB)",
  summary: [
    "AdPulse คือแพลตฟอร์ม real-time bidding (RTB) ที่รับ bid request จาก SSP (Supply-Side Platform) หลายเจ้าพร้อมกัน แล้วตัดสินใจว่าจะประมูลราคาเท่าไหร่ให้แคมเปญของผู้ลงโฆษณาแต่ละราย ภายในเวลาไม่เกิน ~100ms ต่อ request (deadline มาตรฐานที่ SSP ส่วนใหญ่กำหนดตาม spec OpenRTB) ระบบต้องตัดสินใจเรื่อง targeting, budget, fraud, และราคา พร้อมกันภายในกรอบเวลาที่แคบมาก",
    "ระบบแบ่งเป็น service ย่อยตาม pipeline ของการประมูล ตั้งแต่รับ bid request ไปจนถึงเก็บผลชนะประมูล (win notice) แล้วเรียกเก็บเงินแคมเปญ ทีมวิศวกรรมเรียกช่วง 19:00-23:00 (prime time ของวิดีโอ/สตรีมมิง) ว่า peak traffic window เพราะเป็นช่วงที่ bid request ไหลเข้าสูงสุด และเป็นช่วงที่ latency budget ตึงที่สุดพร้อมกัน",
  ],
  domainTags: ["ad-bidding", "adpulse"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง — {{ref:module:budget-pacer}} เป็นเจ้าของตัวเลข spend สะสมของแต่ละแคมเปญเท่านั้น ไม่รู้จัก concept ของ auction หรือ bid request เลย ส่วน {{ref:module:auction-engine}} ไม่เก็บ state เรื่องเงินถาวรเลยแม้แต่บรรทัดเดียว — ทุกครั้งที่ต้องตัดสินใจว่าแคมเปญไหนยังมี budget เหลือ ต้อง query budget-pacer สดเสมอ",
    "{{ref:module:bid-request-handler}} เป็น service เดียวที่ต้องคุยกับทั้ง auction-engine, fraud-filter, และ creative-renderer พร้อมกันภายใน request เดียว เพราะเป็นจุดรวมของ pipeline ทั้งหมดก่อนตอบ bid response กลับไปยัง SSP — ออกแบบให้ทุก dependency call เป็น timeout สั้นมาก (รวมกันต่ำกว่า 100ms) ไม่งั้นจะพลาด deadline ของ SSP ไปเลย",
  ],
  apiGatewayNote: [
    "bid request จาก SSP ภายนอกเข้ามาทาง HTTP endpoint กลางที่พูดภาษา OpenRTB 2.5 แปลง JSON เป็น internal bid object แล้วส่งต่อให้ {{ref:module:bid-request-handler}} คำขอที่ latency-critical ทั้งหมดของระบบอยู่ในเส้นทางนี้",
    "win notice และ billing event ไม่ผ่าน gateway เดียวกับ bid request — แยกเป็น endpoint ต่างหากที่ {{ref:module:win-notice-processor}} รับเอง เพราะ traffic pattern ต่างกันมาก (bid request มาถี่มากแต่ latency-sensitive สุด ส่วน win notice มาน้อยกว่ามากแต่ไม่ต้องตอบ synchronous ทันที)",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:budget-pacer}} ดูแล ได้แก่ `campaign_spend` (ตัวเลข spend สะสมต่อแคมเปญต่อวัน) และ `pacing_state` (throttle rate ปัจจุบันของแต่ละแคมเปญ)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `campaign_spend` | budget-pacer | อัปเดตแบบ near-real-time ทุกครั้งที่มี win notice |\n| `bids` | auction-engine | log ผลการประมูลภายในทุกครั้ง (win/lose) เก็บ 30 วัน |\n| `fraud_scores` | fraud-filter | คะแนน fraud ต่อ request_id พร้อมเหตุผลที่จัดหมวดไว้ |\n| `creatives` | creative-renderer | metadata ของ creative แต่ละชิ้น ไม่เก็บไฟล์จริง (อยู่ CDN) |",
    "ทุกตารางใช้ `campaign_id` เป็น foreign key ร่วมกันแบบ soft reference เท่านั้น เพราะแต่ละ service แยก database กันจริง ไม่มี FK constraint ข้าม database ตรวจสอบความสอดคล้องด้วย reconciliation job รายชั่วโมงแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `bid.won`, `bid.lost`, `creative.rejected`, `fraud.flagged`, `campaign.budget_exhausted` — {{ref:module:win-notice-processor}} publish `bid.won` ทันทีที่ได้รับ win notice จาก SSP แล้วให้ {{ref:module:budget-pacer}} subscribe เพื่ออัปเดตยอด spend",
    "{{ref:module:fraud-filter}} publish `fraud.flagged` แบบ asynchronous เท่านั้น ไม่ block bid response — เพราะการตัดสินใจ fraud แบบ real-time ทำใน request path อยู่แล้ว (ดู {{ref:arch:boundaries}}) event นี้ใช้สำหรับ retrain/analysis ทีหลัง ไม่ใช่ signal ที่ {{ref:module:auction-engine}} ต้องรอ",
  ],
  modules: [
    {
      slug: "bid-request-handler",
      name: "bid-request-handler",
      tags: ["bidding", "module", "core"],
      description:
        "จุดเข้าเดียวของทุก bid request จาก SSP รับผิดชอบ orchestrate ทั้ง pipeline ภายใน time budget ที่แคบมาก แยกออกมาเป็น service อิสระตั้งแต่ต้นปี 2025 เพราะ logic orchestration (retry, การแบ่งเวลาให้แต่ละ downstream call) ซับซ้อนขึ้นจนปนกับ auction-engine เดิมแล้วทดสอบยาก",
      functions: [
        { sig: "handleBidRequest(req: OpenRtbBidRequest): Promise<BidResponse | NoBidResponse>", desc: "รับ request แปลงเป็น internal format แล้ว orchestrate เรียก fraud-filter → auction-engine → creative-renderer ตามลำดับ" },
        { sig: "allocateTimeBudget(totalMs: number): TimeBudgetPlan", desc: "แบ่งเวลาที่เหลือให้แต่ละ downstream call ตามลำดับความสำคัญ" },
        { sig: "buildNoBidResponse(reason: NoBidReason): NoBidResponse", desc: "สร้างคำตอบปฏิเสธประมูลพร้อมเหตุผลที่จัดหมวดไว้แล้ว" },
      ],
      stateFlow: "received → fraud_checking → auctioning → rendering → responded | no_bid | timed_out — ดู {{ref:policy:bid-timeout-policy}} สำหรับเงื่อนไข time budget ของแต่ละขั้น",
      relatedNotes:
        "เรียก {{ref:module:fraud-filter}} ก่อนเสมอ เพราะถ้า request ถูก flag ว่า fraud จะไม่เสียเวลาเรียก {{ref:module:auction-engine}} เลย — ลำดับนี้ตั้งใจให้ fraud check อยู่หน้าสุดของ pipeline เพื่อประหยัด time budget ที่แคบมาก",
      internals: {
        constants: [
          { name: "BID_REQUEST_TIMEOUT_MS", value: "80" },
          { name: "DOWNSTREAM_CALL_BUDGET_MS", value: "60" },
        ],
        typeSnippet:
          "interface BidResponse {\n  requestId: string;\n  campaignId: string;\n  price: number;\n  creativeMarkup: string;\n}\n\ninterface NoBidResponse {\n  requestId: string;\n  reason: \"fraud_blocked\" | \"no_eligible_campaign\" | \"budget_exhausted\" | \"timed_out\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:bid-timeout-policy}}",
      },
    },
    {
      slug: "auction-engine",
      name: "auction-engine",
      tags: ["auction", "module", "core"],
      description:
        "ตัดสินใจว่าจะประมูลราคาเท่าไหร่ และเลือกแคมเปญที่ชนะเมื่อมีหลายแคมเปญแข่งกันสำหรับ request เดียวกัน (internal auction ก่อนส่งราคาสุดท้ายออกไปแข่งกับ SSP ภายนอกอีกที) แยกออกจาก bid-request-handler เพื่อให้ทดสอบ logic การคำนวณราคาได้อิสระจาก orchestration",
      functions: [
        { sig: "runInternalAuction(candidates: CampaignCandidate[]): Promise<AuctionResult>", desc: "รันประมูลภายในระหว่างแคมเปญที่ผ่าน targeting ทั้งหมด คืนผู้ชนะ" },
        { sig: "computeBidPrice(campaignId: string, ctx: AuctionContext): number", desc: "คำนวณราคาที่จะเสนอ ตาม bid strategy ของแคมเปญ" },
        { sig: "applyFloorPrice(price: number, floor: number): number", desc: "บังคับราคาไม่ให้ต่ำกว่า floor ที่ SSP กำหนด" },
      ],
      stateFlow: "candidates_gathered → priced → floor_applied → winner_selected | no_winner",
      relatedNotes:
        "`runInternalAuction` เรียก {{ref:module:budget-pacer}} เพื่อกรองแคมเปญที่ budget หมดออกก่อนเริ่มประมูลเสมอ (ดู {{ref:policy:budget-pacing-policy}}) ราคาที่ชนะจะถูกส่งต่อให้ {{ref:module:creative-renderer}} เพื่อเตรียม creative ก่อนตอบกลับ SSP",
      internals: {
        constants: [
          { name: "AUCTION_MAX_CANDIDATES", value: "300" },
          { name: "FLOOR_PRICE_SANITY_MULTIPLIER", value: "3" },
        ],
        typeSnippet:
          "interface AuctionResult {\n  winnerCampaignId: string | null;\n  clearingPrice: number;\n  candidateCount: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องราคาที่ {{ref:policy:floor-price-policy}}",
      },
    },
    {
      slug: "budget-pacer",
      name: "budget-pacer",
      tags: ["budget", "module", "core"],
      description:
        "ควบคุมอัตราการใช้ budget ของแต่ละแคมเปญให้กระจายตลอดทั้งวันแทนที่จะหมดเร็วเกินไปตอนเช้าหรือช้าเกินไปตอนดึก แยกเป็น service อิสระเพราะ logic pacing (การพยากรณ์ traffic, การปรับ throttle rate) ซับซ้อนและต้องทดสอบแยกจาก auction logic",
      functions: [
        { sig: "getRemainingBudget(campaignId: string): Promise<number>", desc: "คืนยอด budget คงเหลือของแคมเปญ ณ ขณะนั้น" },
        { sig: "recordSpend(campaignId: string, amount: number, winNoticeId: string): Promise<void>", desc: "บันทึกยอดที่ใช้ไปจริงจาก win notice" },
        { sig: "computeThrottleRate(campaignId: string): Promise<number>", desc: "คำนวณสัดส่วน bid ที่ควรเข้าประมูลจริงเทียบกับ eligible ทั้งหมด เพื่อ pace การใช้เงิน" },
      ],
      relatedNotes:
        "{{ref:module:auction-engine}} เรียก `getRemainingBudget` ทุกครั้งก่อนคำนวณราคา — ไม่ cache ค่า budget ไว้เกิน 1 วินาที เพราะความเสี่ยง overspend สำคัญกว่า latency เล็กน้อยที่เสียไป ดู {{ref:policy:budget-pacing-policy}}",
      internals: {
        constants: [
          { name: "PACING_SYNC_INTERVAL_MS", value: "1000" },
          { name: "OVERSPEND_TOLERANCE_PCT", value: "2" },
        ],
        typeSnippet:
          "interface PacingState {\n  campaignId: string;\n  dailyBudget: number;\n  spentSoFar: number;\n  throttleRate: number; // 0.0 - 1.0\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง pacing ที่ {{ref:policy:budget-pacing-policy}}",
      },
    },
    {
      slug: "fraud-filter",
      name: "fraud-filter",
      tags: ["fraud", "module"],
      description:
        "ตรวจจับ bid request ที่มาจาก traffic ผิดปกติ (bot, datacenter IP, click farm pattern) ก่อนที่จะเสียเงินประมูลให้ traffic ที่ไม่มีมูลค่าจริง แยกเป็น service อิสระเพื่อให้ปรับ rule ได้เร็วโดยไม่กระทบ deploy cycle ของ auction-engine",
      functions: [
        { sig: "scoreRequest(req: InternalBidRequest): Promise<FraudScore>", desc: "ให้คะแนน fraud 0-100 พร้อมเหตุผลที่ประกอบคะแนน" },
        { sig: "evaluateRule(ruleId: string, req: InternalBidRequest): RuleResult", desc: "ประเมิน rule เดี่ยวๆ ตัวหนึ่ง ใช้ตอน debug ว่า rule ไหนที่ทำให้คะแนนสูง" },
        { sig: "reportFalsePositive(requestId: string, reportedBy: string): Promise<void>", desc: "บันทึกกรณีที่ถูก block ผิดพลาด ใช้ปรับปรุง rule ทีหลัง" },
      ],
      relatedNotes:
        "ทำงานก่อน {{ref:module:auction-engine}} เสมอในลำดับ pipeline (ดู {{ref:arch:boundaries}}) เกณฑ์ threshold ที่ใช้ block หรือปล่อยผ่านกำหนดโดย {{ref:policy:fraud-score-threshold-policy}}",
    },
    {
      slug: "creative-renderer",
      name: "creative-renderer",
      tags: ["creative", "module"],
      description:
        "เตรียม creative (รูป/วิดีโอ/HTML5 banner) ให้พร้อมแสดงผลก่อนส่ง bid response กลับ SSP รวมถึงเลือก creative variant ที่เหมาะกับขนาด placement และตรวจสอบว่า creative ผ่านการอนุมัติแล้ว แยกเป็น service อิสระเพราะ logic การ render/เลือก variant เปลี่ยนบ่อยตาม format โฆษณาใหม่ๆ ที่เพิ่มเข้ามาเรื่อยๆ",
      functions: [
        { sig: "selectCreativeVariant(campaignId: string, placementSpec: PlacementSpec): Promise<Creative | null>", desc: "เลือก creative variant ที่ตรงกับขนาด/รูปแบบ placement มากที่สุด" },
        { sig: "renderMarkup(creative: Creative, ctx: RenderContext): string", desc: "สร้าง markup สุดท้ายที่จะฝังใน bid response" },
        { sig: "validateCreativeApproval(creativeId: string): Promise<boolean>", desc: "เช็คว่า creative ผ่านการอนุมัติแล้วหรือยัง" },
      ],
      relatedNotes:
        "ถ้าไม่มี creative variant ที่ตรงกับ placement spec เลย จะคืน `null` กลับไปให้ {{ref:module:bid-request-handler}} ตัดสินใจส่ง no-bid แทน — creative-renderer ไม่ตัดสินใจเรื่อง no-bid เอง เพื่อรักษาหลัก separation of concerns เกณฑ์การอนุมัติ creative ดู {{ref:policy:creative-approval-policy}}",
    },
    {
      slug: "win-notice-processor",
      name: "win-notice-processor",
      tags: ["billing", "module"],
      description:
        "รับ win notice จาก SSP เมื่อ AdPulse ชนะประมูลจริงในตลาดภายนอก (ต่างจาก internal auction ที่ auction-engine ทำ) แล้วเรียกเก็บเงินแคมเปญที่ชนะ เป็น service เดียวที่ trigger การหักเงินจริงในระบบทั้งหมด",
      functions: [
        { sig: "handleWinNotice(notice: WinNotice): Promise<void>", desc: "รับ win notice ตรวจสอบ dedup แล้ว trigger การหักเงิน" },
        { sig: "deduplicateNotice(noticeId: string, sspId: string): Promise<boolean>", desc: "เช็คว่า notice นี้เคยประมวลผลไปแล้วหรือยัง" },
        { sig: "chargeCampaign(campaignId: string, amount: number, winNoticeId: string): Promise<void>", desc: "หักเงินแคมเปญจริงตามยอดที่ชนะ" },
      ],
      relatedNotes:
        "publish event `bid.won` ให้ {{ref:module:budget-pacer}} subscribe (ดู {{ref:arch:queue}}) เกณฑ์การกัน duplicate billing ดู {{ref:policy:win-notice-dedup-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "bid-request-handler-service",
      vars: [
        { name: "BID_REQUEST_TIMEOUT_MS", example: "80", note: "ดู {{ref:policy:bid-timeout-policy}}" },
        { name: "DOWNSTREAM_CALL_BUDGET_MS", example: "60", note: "งบเวลารวมสำหรับ downstream call ทั้งหมด" },
      ],
    },
    {
      service: "auction-engine-service",
      vars: [
        { name: "AUCTION_MIN_BID_INCREMENT", example: "0.01", note: "หน่วยขั้นต่ำของราคาที่ปรับได้" },
        { name: "AUCTION_DB_URL", example: "postgres://auction-db.internal:5432/auction", note: "secret ห้าม log" },
      ],
    },
    {
      service: "budget-pacer-service",
      vars: [
        { name: "PACING_SYNC_INTERVAL_MS", example: "1000", note: "ดู {{ref:policy:budget-pacing-policy}}" },
        { name: "PACING_OVERSPEND_TOLERANCE_PCT", example: "2", note: "เกินนี้ถือเป็นบั๊กที่ต้อง investigate" },
      ],
    },
    {
      service: "fraud-filter-service",
      vars: [
        { name: "FRAUD_SCORE_BLOCK_THRESHOLD", example: "80", note: "ดู {{ref:policy:fraud-score-threshold-policy}}" },
        { name: "FRAUD_RULE_REFRESH_INTERVAL_MS", example: "300000", note: "ความถี่ที่ดึง rule ชุดใหม่จาก rule store" },
      ],
    },
  ],
  policies: [
    {
      slug: "bid-timeout-policy",
      title: "นโยบาย Time Budget และ Timeout ของ Bid Request",
      tags: ["bidding", "timeout", "policy"],
      isPrimary: true,
      intro: [
        "SSP ส่วนใหญ่กำหนด timeout รวมไม่เกิน 100ms ต่อ bid request — ถ้า AdPulse ตอบช้ากว่านั้น SSP จะตัดการเชื่อมต่อและถือว่าเป็น no-bid โดยอัตโนมัติ {{ref:module:bid-request-handler}} จึงต้องแบ่งเวลาที่มีให้แต่ละ downstream call อย่างเคร่งครัดผ่าน `allocateTimeBudget`",
        "ค่า default: fraud check 15ms, internal auction 25ms, creative selection 20ms เหลือ buffer ~20ms สำหรับ network overhead และ serialization ก่อนตอบกลับ — ตัวเลขนี้ตั้งจาก p99 latency จริงของแต่ละ service ไม่ใช่ตัวเลขที่เดาขึ้นมาลอยๆ",
      ],
      sections: [
        {
          heading: "ทำไม timeout ภายในต้องเข้มกว่าที่ SSP กำหนดจริง",
          body: "ถ้าตั้ง timeout ภายในให้เท่ากับ deadline ของ SSP พอดี จะไม่เหลือ margin สำหรับความแปรปรวนของ network ระหว่าง data center ของ AdPulse กับ SSP เลย — ทีมตั้งกฎว่า internal deadline ต้องน้อยกว่า SSP deadline อย่างน้อย 15% เสมอ",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Deal ID แบบ Private Marketplace (PMP)",
        tags: ["bidding", "pmp", "edge-case"],
        body: [
          "bid request ที่มี deal ID ของ PMP (ข้อตกลงราคาที่คุยกันไว้ล่วงหน้ากับผู้ลงโฆษณารายใหญ่) ได้รับ time budget เพิ่มอีก 10ms เพราะ traffic กลุ่มนี้ผ่าน fraud check ที่เข้มงวดกว่าปกติ (ดู {{ref:policy:deal-id-priority-policy}}) และทีมยอมรับ trade-off latency เพิ่มเล็กน้อยเพื่อความแม่นยำของ deal เหล่านี้",
          "ถ้า time budget เพิ่มแล้วยังไม่พอ ระบบจะ skip creative variant selection ที่ซับซ้อน (เช่น dynamic creative optimization) แล้วใช้ default variant แทน ดีกว่าพลาด deadline ไปเลยทั้ง request",
        ],
      },
    },
    {
      slug: "budget-pacing-policy",
      title: "นโยบาย Pacing การใช้ Budget แคมเปญ",
      tags: ["budget", "pacing", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:budget-pacer}} คำนวณ throttle rate ทุก `PACING_SYNC_INTERVAL_MS` (ค่า default 1000ms) โดยเทียบ spend สะสมจริงกับเส้น pacing ที่คาดไว้ (ideal pacing curve แบบ even distribution ตลอด 24 ชั่วโมง) ถ้า spend เร็วกว่าเส้นคาด throttle rate จะลดลงทันที",
        "AdPulse ยอมรับ overspend ได้ไม่เกิน `PACING_OVERSPEND_TOLERANCE_PCT` (ค่า default 2%) ของ daily budget ต่อแคมเปญ เกินกว่านี้ถือเป็นบั๊กที่ต้อง investigate ไม่ใช่ความคลาดเคลื่อนปกติของระบบ distributed",
      ],
      sections: [
        {
          heading: "ทำไมยอมรับ overspend เล็กน้อยแทนที่จะ block เด็ดขาด",
          body: "การเช็ค budget แบบ strict ทุก request (ล็อกแถวเช็คทุกครั้งก่อนประมูล) จะทำให้ latency พุ่งเกิน time budget ที่มีแคบมากอยู่แล้ว ทีมเลือก eventual consistency แบบมี tolerance band แทน เพราะ overspend เล็กน้อยที่ควบคุมได้ ดีกว่า latency ที่ทำให้แคมเปญพลาดโอกาสประมูลทุก request",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อแคมเปญใกล้หมด Budget ในนาทีสุดท้ายของวัน",
        tags: ["budget", "pacing", "edge-case"],
        body: [
          "ในช่วง 30 นาทีสุดท้ายก่อนสิ้นวัน (ตาม timezone ของแคมเปญ) ระบบจะปิด pacing throttle ชั่วคราวสำหรับแคมเปญที่ยังมี budget เหลือมากกว่า 10% เพื่อให้ใช้ budget ที่เหลือให้หมดตามที่ตั้งใจไว้ แทนที่จะถือ budget ทิ้งไว้ข้ามวันโดยไม่มีเหตุผล",
          "กฎนี้ไม่ใช้กับแคมเปญที่ตั้งค่า `strict_pacing: true` (ปกติเป็นแคมเปญ brand ที่ต้องการกระจายการแสดงผลสม่ำเสมอมากกว่าการใช้ budget ให้หมด) กลุ่มนี้ปล่อยให้ budget เหลือข้ามวันได้ตามปกติ",
        ],
      },
    },
    {
      slug: "fraud-score-threshold-policy",
      title: "นโยบาย Threshold คะแนน Fraud",
      tags: ["fraud", "threshold", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:fraud-filter}} ให้คะแนน fraud score 0-100 กับทุก request คะแนนตั้งแต่ `FRAUD_SCORE_BLOCK_THRESHOLD` (ค่า default 80) ขึ้นไปจะถูก block ทันทีไม่ส่งต่อไป {{ref:module:auction-engine}} เลย",
        "คะแนนระหว่าง 50-79 ถือเป็น `suspicious` — ยังให้ประมูลได้ตามปกติ แต่ราคาที่เสนอจะถูกลดทอนลง (bid shading) ตามสัดส่วนคะแนน เพื่อลดความเสี่ยงโดยไม่ปิดโอกาสธุรกิจไปเลยทั้งหมด",
      ],
      sections: [
        {
          heading: "ทำไมไม่ block ทันทีที่คะแนนเกินครึ่ง",
          body: "ข้อมูลในอดีตพบว่า traffic คะแนน 50-79 จำนวนไม่น้อยเป็น false positive จาก proxy องค์กรใหญ่หรือ VPN ที่คนใช้งานจริง การ block ตรงนี้ทันทีจะเสีย traffic จริงไปเยอะเกินจำเป็น bid shading จึงเป็นทางสายกลางที่ทีมเลือกใช้",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Publisher ที่อยู่ใน Allowlist",
        tags: ["fraud", "allowlist", "edge-case"],
        body: [
          "publisher ที่ผ่านการ verify ด้วยมือแล้วว่าเป็นพันธมิตรที่เชื่อถือได้ (อยู่ใน allowlist) จะได้ threshold ที่ผ่อนปรนกว่า — ต้องคะแนนถึง 90 ขึ้นไปถึงจะถูก block แทนที่จะเป็น 80 ปกติ เพราะ traffic pattern บางอย่างของ publisher กลุ่มนี้ (เช่น traffic พุ่งช่วง live event) มักทำให้คะแนนพื้นฐานสูงกว่าปกติทั้งที่เป็น traffic จริง",
          "การเพิ่ม publisher เข้า allowlist ต้องผ่านการอนุมัติจากทีม trust & safety เท่านั้น ไม่ใช่ทีม engineering ตัดสินใจเองได้ เพราะเป็นการยอมรับความเสี่ยง fraud ที่สูงขึ้นในทางธุรกิจ",
        ],
      },
    },
    {
      slug: "floor-price-policy",
      title: "นโยบาย Floor Price",
      tags: ["pricing", "floor", "policy"],
      isPrimary: true,
      intro: [
        "SSP แต่ละรายกำหนด floor price (ราคาต่ำสุดที่ยอมรับ) มาพร้อมกับ bid request — {{ref:module:auction-engine}} ต้องเรียก `applyFloorPrice` เสมอก่อนส่งราคาสุดท้ายออกไป ถ้าราคาที่คำนวณได้ต่ำกว่า floor ระบบจะไม่ส่งราคาที่ต่ำกว่าออกไปเด็ดขาด (ส่ง no-bid แทน)",
        "floor price ที่ SSP ส่งมาไม่ได้ถูกต้องเสมอไป — บาง SSP ส่งค่าที่สูงผิดปกติเป็นครั้งคราวเพราะบั๊กฝั่งเขาเอง ระบบจึงมีเพดานบนที่ยอมรับ (ไม่เกิน `FLOOR_PRICE_SANITY_MULTIPLIER` เท่าของราคาเฉลี่ยที่เคยชนะสำหรับ placement เดียวกัน) ถ้าเกินเพดานนี้จะถือว่า floor ผิดปกติและใช้ค่าเฉลี่ยแทน",
      ],
      sections: [
        {
          heading: "ความเสี่ยงถ้าไม่มีเพดานตรวจสอบ floor",
          body: "เคยมีเหตุการณ์ที่ SSP รายหนึ่งส่ง floor price ผิดสูงกว่าปกติหลายสิบเท่าเพราะบั๊กหน่วยเงิน (ส่งเป็นหน่วยที่เล็กกว่าที่ตกลงกันไว้) ถ้า auction-engine เชื่อค่านั้นตรงๆ จะทำให้แคมเปญแทบทุกตัวถูกดันราคาสูงเกินจริงจนใช้ budget หมดเร็วผิดปกติ ดู {{ref:incident:floor-price-misconfig-pricing-out}}",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Deal ID ที่มีราคาตกลงไว้ล่วงหน้า",
        tags: ["pricing", "pmp", "edge-case"],
        body: [
          "bid request ที่มี deal ID แบบ fixed-price (ราคาตกลงตายตัว ไม่ใช่ auction แบบเปิด) จะไม่ผ่าน floor price check ปกติเลย เพราะราคาที่ส่งไปคือราคาที่ตกลงกันไว้ล่วงหน้าอยู่แล้ว การเทียบกับ floor price ทั่วไปไม่มีความหมายในบริบทนี้",
          "ถ้าราคาที่ตกลงไว้ใน deal ต่ำกว่า floor price ทั่วไปของ placement นั้น (ซึ่งเกิดขึ้นได้ถ้า deal เก่าไม่ได้อัปเดตราคาตามตลาด) ระบบจะยังส่งราคา deal ออกไปตามที่ตกลงไว้ และแจ้งเตือนทีม account management ให้ไปคุยกับผู้ลงโฆษณาเรื่องปรับราคา deal แทนที่จะแก้ที่ระบบ",
        ],
      },
    },
    {
      slug: "win-notice-dedup-policy",
      title: "นโยบายกัน Win Notice ซ้ำ",
      tags: ["billing", "dedup", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:win-notice-processor}} deduplicate win notice ด้วย `noticeId` ที่ SSP ส่งมาคู่กับทุก notice — ถ้า noticeId ซ้ำกับที่เคยประมวลผลไปแล้วภายใน 24 ชั่วโมงล่าสุด จะไม่หักเงินซ้ำเด็ดขาด",
        "SSP บางรายส่ง win notice ซ้ำโดยตั้งใจเป็นกลไก retry ของเขาเอง (ถ้าไม่ได้รับ ack กลับไปในเวลาที่กำหนด) ระบบจึงต้องตอบ ack ให้ SSP เร็วที่สุดแม้จะเป็น notice ที่ deduplicate ทิ้งไปแล้วก็ตาม เพื่อหยุด retry loop ฝั่งเขา",
      ],
      sections: [
        {
          heading: "ทำไม dedup window เป็น 24 ชั่วโมงไม่ใช่ตลอดไป",
          body: "การเก็บ noticeId ไว้ตรวจสอบตลอดไปจะทำให้ตารางโตไม่จำกัด และในทางปฏิบัติ SSP ไม่เคย retry ข้ามวันจริง — 24 ชั่วโมงคือ margin ที่กว้างพอสำหรับ retry ทุกกรณีที่เคยเจอจริง พร้อมจำกัดขนาดตารางให้จัดการได้",
        },
      ],
      edgeCase: {
        title: "กรณี noticeId ชนกันข้าม SSP คนละราย",
        tags: ["billing", "dedup", "edge-case"],
        body: [
          "SSP บางรายไม่ได้รับประกันว่า noticeId จะ unique ในระดับ global — เคยพบ noticeId ชนกันระหว่าง SSP สองรายที่ไม่เกี่ยวข้องกัน ระบบจึงต้อง compose dedup key จาก `(sspId, noticeId)` คู่กันเสมอ ไม่ใช่ noticeId เดี่ยวๆ ดู {{ref:incident:duplicate-billing-win-notice-bug}} สำหรับเหตุการณ์จริงที่เกิดจากการมองข้ามจุดนี้",
          "ถ้าตรวจพบ noticeId ชนกันข้าม SSP หลังจากที่ dedup key ถูกแก้ไขแล้ว (เช่น SSP รายใหม่ที่เพิ่งต่อระบบ) ให้ถือว่าเป็นเหตุการณ์ผิดปกติที่ต้องแจ้งทีม partnerships ไปคุยกับ SSP รายนั้นโดยตรง ไม่ใช่แก้ที่ dedup logic อีก",
        ],
      },
    },
    {
      slug: "creative-approval-policy",
      title: "นโยบายการอนุมัติ Creative",
      tags: ["creative", "approval", "policy"],
      isPrimary: true,
      intro: [
        "creative ทุกชิ้นต้องผ่านการอนุมัติ (ตรวจสอบเนื้อหา ขนาดไฟล์ ความปลอดภัยของ script ใน HTML5 banner) ก่อนที่ {{ref:module:creative-renderer}} จะเลือกมันมาแสดงผลได้ — `validateCreativeApproval` เช็คสถานะนี้ทุกครั้งก่อน render ไม่ cache ผลลัพธ์ไว้เกิน 5 นาที",
        "creative ที่ยังไม่ผ่านอนุมัติจะไม่ถูกเลือกเป็น variant เลยแม้จะ match targeting ดีที่สุดก็ตาม — ระบบจะข้ามไปหา variant อื่นของแคมเปญเดียวกันที่ผ่านอนุมัติแล้วแทน",
      ],
      sections: [
        {
          heading: "ทำไมไม่ cache ผลอนุมัตินานกว่านี้",
          body: "creative ที่เคยผ่านอนุมัติสามารถถูกเพิกถอนได้ภายหลัง (เช่น พบว่ามี script ที่พยายาม redirect ผู้ใช้ผิดปกติหลัง deploy ไปแล้ว) การ cache นานเกินไปจะทำให้ creative ที่ถูกเพิกถอนแล้วยังถูกแสดงผลต่อไปอีกหลายนาทีโดยไม่จำเป็น 5 นาทีคือจุดสมดุลระหว่าง latency กับความเสี่ยง",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Creative Approval Service ล่ม",
        tags: ["creative", "availability", "edge-case"],
        body: [
          "ถ้า service ตรวจสอบ approval ตอบไม่ทันภายใน timeout ที่กำหนด (แยกจาก time budget หลักของ bid request) {{ref:module:creative-renderer}} จะ fail-safe ไปใช้ผลอนุมัติล่าสุดที่ cache ไว้ (แม้จะเกิน 5 นาที) แทนที่จะ block การแสดงผลทั้งหมด เพราะการเสีย revenue ทั้งระบบเพราะ dependency เดียวล่มมีความเสี่ยงสูงกว่า",
          "โหมด fail-safe นี้มีเพดานเวลาไม่เกิน 15 นาที — ถ้า approval service ยังไม่กลับมาเกิน 15 นาที ระบบจะเปลี่ยนเป็น fail-closed (ไม่แสดง creative ที่ไม่ได้ตรวจสอบสดเลย) เพื่อจำกัดความเสี่ยงไม่ให้ลากยาวเกินไป",
        ],
      },
    },
    {
      slug: "campaign-frequency-cap-policy",
      title: "นโยบาย Frequency Cap ของแคมเปญ",
      tags: ["frequency-cap", "policy"],
      isPrimary: false,
      intro: [
        "แต่ละแคมเปญตั้งค่า frequency cap ได้ (เช่น แสดงไม่เกิน 3 ครั้งต่อ user ต่อวัน) {{ref:module:auction-engine}} เช็คค่านี้ก่อนนับแคมเปญเป็น candidate ที่จะเข้าประมูลเลย ไม่ใช่เช็คหลังชนะประมูลแล้ว เพื่อไม่ให้เสียเวลาประมูลแทนแคมเปญที่ชนแล้วก็แสดงไม่ได้",
        "การนับความถี่ใช้ cookie/device ID เป็นหลัก ระบบยอมรับว่าการนับไม่แม่นยำ 100% ในสภาพแวดล้อมที่ cookie ถูกบล็อกหรือ device ID เปลี่ยนบ่อย แต่ยังดีกว่าไม่มีการควบคุมเลย",
      ],
    },
    {
      slug: "deal-id-priority-policy",
      title: "นโยบายลำดับความสำคัญของ PMP Deal ID",
      tags: ["pmp", "deal", "policy"],
      isPrimary: false,
      intro: [
        "bid request ที่มี PMP deal ID ผูกมากับมันจะถูกจัดลำดับความสำคัญสูงกว่า open auction เสมอในการจัด time budget และการเลือก creative — เพราะ deal เป็นข้อตกลงที่คุยราคาและ volume กันไว้ล่วงหน้าแล้วกับผู้ลงโฆษณารายใหญ่",
        "ถ้าแคมเปญเดียวกันมีทั้ง deal ID และไม่มี deal ID เข้ามาพร้อมกัน (เช่น publisher เปิดขาย inventory เดียวกันทั้งสองช่องทาง) deal ID จะถูกเลือกก่อนเสมอแม้ราคา open auction จะสูงกว่าเล็กน้อย เพราะ deal มี commitment ด้าน volume ที่ต้องรักษาไว้",
      ],
    },
    {
      slug: "bid-request-sampling-policy",
      title: "นโยบายการ Sample Log ของ Bid Request",
      tags: ["logging", "sampling", "policy"],
      isPrimary: false,
      intro: [
        "log เต็มของทุก bid request มีปริมาณสูงเกินกว่าจะเก็บทั้งหมดได้คุ้มค่า ระบบจึง sample เก็บ log แบบเต็มไว้เพียง 1% ของ request ทั้งหมด (สุ่มแบบ deterministic ตาม request ID เพื่อให้ trace เดิมซ้ำได้เสมอถ้าต้อง debug)",
        "request ที่ถูก fraud-filter block หรือ auction-engine ปฏิเสธเพราะ budget หมด จะถูกเก็บ log เต็มเสมอไม่ว่าจะ sample โดนหรือไม่ เพราะเป็นกรณีที่ทีม analysis ต้องการข้อมูลมากกว่ากรณีปกติ",
      ],
    },
    {
      slug: "currency-conversion-policy",
      title: "นโยบายการแปลงสกุลเงิน",
      tags: ["currency", "policy"],
      isPrimary: false,
      intro: [
        "แคมเปญที่ budget ตั้งเป็นสกุลเงินต่างจาก SSP (เช่น budget เป็น USD แต่ประมูลใน SSP ที่รายงานราคาเป็น THB) ต้องแปลงอัตราแลกเปลี่ยนก่อนคำนวณราคาเสมอ — อัตราแลกเปลี่ยนดึงจาก external rate provider แล้ว cache ไว้ 1 ชั่วโมง",
        "ถ้า rate provider ตอบไม่ได้ ระบบใช้อัตราที่ cache ไว้ล่าสุดต่อไปได้สูงสุด 6 ชั่วโมง เกินกว่านั้นถือว่า rate เก่าเกินไปเสี่ยงต่อการคำนวณราคาผิดมาก จะหยุดประมูลแคมเปญที่ต้องแปลงสกุลเงินชั่วคราวแทนที่จะเสี่ยงใช้ rate ที่อาจจะผิดไปมาก",
      ],
    },
    {
      slug: "blocklist-category-policy",
      title: "นโยบาย Blocklist หมวดเนื้อหา (Brand Safety)",
      tags: ["brand-safety", "blocklist", "policy"],
      isPrimary: false,
      intro: [
        "ผู้ลงโฆษณาแต่ละรายตั้ง category ของ publisher/content ที่ไม่ต้องการให้โฆษณาตัวเองไปแสดง (brand safety) เช่น เนื้อหาความรุนแรงหรือข่าวลบ — {{ref:module:auction-engine}} กรอง candidate ที่ขัดกับ blocklist ออกก่อนเริ่ม internal auction เสมอ",
        "category ของ content มาจาก metadata ที่ SSP ส่งมาเอง AdPulse ไม่มีระบบตรวจสอบเนื้อหาเองโดยตรง ถ้า SSP ส่ง metadata ผิดหรือไม่ครบ ระบบเลือกที่จะปลอดภัยไว้ก่อน (ไม่ประมูล) มากกว่าเสี่ยงประมูลให้เนื้อหาที่จัดหมวดไม่ชัดเจน",
      ],
    },
  ],
  incidents: [
    {
      slug: "budget-pacer-clock-skew-overspend",
      title: "Budget Pacer ใช้เงินเกินเพราะ Clock Skew ระหว่าง Pod",
      tags: ["budget", "pacing", "bug"],
      summary:
        "แคมเปญรายหนึ่งใช้ budget เกินที่ตั้งไว้ถึง 18% ภายในคืนเดียว ทั้งที่ {{ref:policy:budget-pacing-policy}} ควรกันไว้ไม่เกิน 2%",
      investigation:
        "ตรวจ log {{ref:module:budget-pacer}} พบว่า pod หลายตัวคำนวณ throttle rate จาก timestamp ของตัวเองแทนที่จะใช้เวลาแบบ synced กลาง — บาง pod นาฬิกาเดินช้ากว่าตัวอื่นราว 40 วินาที ทำให้คำนวณเส้น pacing ผิดตำแหน่งเล็กน้อยในแต่ละรอบ",
      cause:
        "ความคลาดเคลื่อนของนาฬิกาแต่ละ pod สะสมกันข้ามหลายพันรอบคำนวณต่อชั่วโมง (เพราะรันทุก `PACING_SYNC_INTERVAL_MS`) กลายเป็นความคลาดเคลื่อนสะสมใหญ่พอที่จะดัน throttle rate ให้สูงเกินจริงต่อเนื่องหลายชั่วโมง",
      resolution:
        "เปลี่ยนให้ทุก pod ดึงเวลาจาก NTP server กลางเดียวกันแทนการใช้ system clock ตัวเอง แล้วเพิ่ม sanity check เตือนถ้า pod ไหน drift เกิน 1 วินาทีจากเวลากลาง",
      followup:
        "เพิ่ม alert ใน {{ref:deployment:monitoring-alerts}} สำหรับ clock drift ระหว่าง pod โดยเฉพาะ และพิจารณาย้าย pacing calculation ไปเป็น centralized service เดียวแทนการคำนวณกระจายในอนาคต",
    },
    {
      slug: "auction-engine-timeout-spike",
      title: "Auction Engine Timeout พุ่งสูงช่วง Traffic กะทันหัน",
      tags: ["performance", "auction"],
      summary:
        "ช่วง major sports event ที่ traffic พุ่งขึ้น 5 เท่าจากปกติ อัตรา timeout ของ {{ref:module:auction-engine}} พุ่งจากต่ำกว่า 1% เป็นเกือบ 22% ทำให้เสียโอกาสประมูลจำนวนมาก",
      investigation:
        "ตรวจ metric พบว่า `runInternalAuction` ใช้เวลาเฉลี่ยนานขึ้นมากเมื่อจำนวน candidate campaign ต่อ request สูง เพราะ loop เทียบราคาทำแบบ sequential ไม่ได้ทำแบบ parallel",
      cause:
        "ตอนออกแบบ engine ครั้งแรกคาดว่าจำนวนแคมเปญที่ผ่าน targeting ต่อ request จะน้อย (เฉลี่ยต่ำกว่า 20) แต่ traffic ช่วง event ใหญ่ทำให้ placement ยอดนิยมมี candidate มากกว่า 200 แคมเปญพร้อมกัน sequential loop จึงช้าเกิน time budget",
      resolution:
        "deploy hotfix ให้ `computeBidPrice` รันแบบ parallel เป็นชุด (batch ละ 50) แทน sequential ทั้งหมด ลด latency เฉลี่ยลงกว่าครึ่งภายใน 20 นาทีหลัง deploy",
      followup:
        "นำ parallel computation เข้า scope งานถัดไปอย่างเป็นทางการ พร้อมทบทวน {{ref:deployment:scaling-policy}} ให้รองรับ candidate count สูงขึ้นสำหรับ event ใหญ่ในอนาคต",
    },
    {
      slug: "fraud-filter-false-positive-publisher",
      title: "Fraud Filter บล็อก Traffic จริงจาก Publisher รายใหญ่เกือบทั้งหมด",
      tags: ["fraud", "false-positive"],
      summary:
        "publisher รายหนึ่งซึ่งปกติมี fill rate สูงแจ้งว่า bid request ของตัวเองถูก AdPulse ปฏิเสธเกือบ 95% อย่างกะทันหันตั้งแต่เช้าวันหนึ่ง",
      investigation:
        "ตรวจ {{ref:module:fraud-filter}} พบว่า rule ใหม่ที่เพิ่งเปิดใช้เมื่อคืน (ตรวจจับ pattern การส่ง request ถี่ผิดปกติจาก IP เดียว) ให้คะแนน fraud สูงเกิน `FRAUD_SCORE_BLOCK_THRESHOLD` กับ traffic เกือบทั้งหมดของ publisher รายนี้",
      cause:
        "publisher รายนี้ใช้สถาปัตยกรรม server-side rendering ที่รวม request จากผู้ใช้จริงหลายพันคนผ่าน proxy ตัวเดียวกันก่อนส่งเข้า AdPulse ทำให้ pattern ดูเหมือน request ถี่จาก IP เดียวทั้งที่เป็นผู้ใช้จริงคนละคน rule ใหม่ไม่ได้ทดสอบกับ traffic pattern แบบนี้มาก่อน",
      resolution:
        "ปิด rule ใหม่ชั่วคราวสำหรับ publisher รายนี้โดยเฉพาะผ่าน allowlist ตาม {{ref:policy:fraud-score-threshold-policy}} แล้วปรับ rule ให้แยกแยะ pattern proxy ที่ถูกต้องออกจาก bot จริงก่อนเปิดใช้กว้างอีกครั้ง",
      followup:
        "เพิ่มขั้นตอนทดสอบ rule ใหม่กับ traffic sample ของ publisher รายใหญ่ทุกรายก่อน rollout เต็มรูปแบบ เพิ่มเข้า {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "creative-renderer-blank-ad-template-change",
      title: "Creative Renderer ส่งโฆษณาว่างเปล่าหลังเปลี่ยน Template",
      tags: ["creative", "bug"],
      summary:
        "ทีม creative รายงานว่าแคมเปญวิดีโอหลายตัวแสดงผลเป็นพื้นที่ว่างเปล่าแทนที่จะเป็นวิดีโอ ตั้งแต่หลัง deploy template ใหม่เมื่อเช้า",
      investigation:
        "ตรวจ `renderMarkup` ของ {{ref:module:creative-renderer}} พบว่า template ใหม่เปลี่ยนชื่อ placeholder field จาก `{{video_url}}` เป็น `{{media_url}}` แต่ creative metadata เก่าที่ยังไม่ได้ migrate ยังใช้ field เดิม",
      cause:
        "การเปลี่ยน template ทำโดยทีม creative โดยตรงไม่ผ่านการรีวิวร่วมกับทีม engineering ที่ดูแล renderer เพราะคิดว่าเป็นแค่การเปลี่ยน styling ไม่ใช่การเปลี่ยน field name ที่กระทบ logic",
      resolution:
        "rollback template กลับเวอร์ชันก่อนหน้าทันที แล้วเพิ่ม field mapping layer ที่รองรับทั้งชื่อเก่าและใหม่ชั่วคราวระหว่างที่ migrate metadata เก่าทั้งหมด",
      followup:
        "กำหนดว่าการเปลี่ยน template field name ต้องผ่าน code review จากทีม engineering เสมอ ไม่ใช่แค่ทีม creative ปรับเองได้ เพิ่มเข้า {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "duplicate-billing-win-notice-bug",
      title: "หักเงินแคมเปญซ้ำจาก Win Notice ที่ noticeId ชนกันข้าม SSP",
      tags: ["billing", "bug"],
      summary:
        "ทีมการเงินพบว่าแคมเปญกลุ่มหนึ่งถูกหักเงินสูงกว่าจำนวนครั้งที่ชนะประมูลจริงตามรายงานของ SSP",
      investigation:
        "ตรวจ {{ref:module:win-notice-processor}} พบว่า dedup logic ใช้ `noticeId` เดี่ยวๆ เป็น key โดยไม่รวม SSP ที่ส่งมา และพบว่า noticeId ชนกันระหว่าง SSP สองรายที่ generate ID ด้วย pattern คล้ายกัน",
      cause:
        "SSP ทั้งสองรายไม่ได้รับประกัน uniqueness ของ noticeId ในระดับ global ตาม spec — ทีมออกแบบ dedup ตอนแรกสมมติว่า noticeId unique เสมอโดยไม่ได้ตรวจสอบสมมติฐานนี้กับ SSP ทุกราย",
      resolution:
        "แก้ dedup key เป็น `(sspId, noticeId)` คู่กันทันที แล้วตรวจสอบ win notice ย้อนหลัง 7 วันเพื่อหาแคมเปญที่ถูกหักเงินซ้ำจริง คืนเงินส่วนต่างให้ครบทุกรายที่ได้รับผลกระทบ",
      followup:
        "เพิ่มเข้า {{ref:policy:win-notice-dedup-policy}} เป็นข้อยกเว้นถาวร และตรวจสอบ SSP ใหม่ทุกรายที่จะต่อระบบว่ามี noticeId ชนกับ SSP เดิมหรือไม่ก่อนเปิดใช้งานจริง",
    },
    {
      slug: "floor-price-misconfig-pricing-out",
      title: "Floor Price ตั้งผิดหน่วยทำให้แคมเปญถูกดันราคาสูงจนแพ้ทุกประมูล",
      tags: ["pricing", "misconfig"],
      summary:
        "แคมเปญของผู้ลงโฆษณารายหนึ่งแทบไม่ชนะประมูลเลยติดต่อกันสองวัน ทั้งที่ bid strategy ไม่มีอะไรเปลี่ยน",
      investigation:
        "ตรวจ {{ref:module:auction-engine}} พบว่า floor price ที่ SSP รายหนึ่งส่งมาสูงกว่าปกติราว 50 เท่าตั้งแต่สองวันก่อน — `computeBidPrice` เห็นว่าราคาที่คำนวณได้ต่ำกว่า floor เสมอ เลยส่ง no-bid เกือบทุก request จาก SSP รายนี้",
      cause:
        "SSP รายนี้ deploy บั๊กที่ส่งค่า floor price เป็นหน่วยเล็กกว่าที่ตกลงกันไว้ (micro-currency แทนที่จะเป็นหน่วยปกติ) ทำให้ตัวเลขดูสูงกว่าความเป็นจริง 50 เท่าโดยไม่ตั้งใจฝั่งเขา",
      resolution:
        "เพิ่มเพดานตรวจสอบ floor price ที่ยอมรับได้ตาม {{ref:policy:floor-price-policy}} ทันที แล้วแจ้ง SSP รายนั้นให้แก้บั๊กฝั่งเขา ระหว่างรอแก้ใช้ค่าเฉลี่ยที่คำนวณเองแทนค่าที่ SSP ส่งมาชั่วคราว",
      followup:
        "เพิ่ม alert แยกสำหรับ floor price ที่ผิดปกติทันทีที่เกิด ไม่ต้องรอให้ผู้ลงโฆษณามาแจ้งก่อนถึงจะรู้ตัว",
    },
    {
      slug: "currency-rate-stale-cache-mispricing",
      title: "อัตราแลกเปลี่ยนเก่าค้างเกิน 6 ชั่วโมงทำให้ราคาประมูลผิดเพี้ยน",
      tags: ["currency", "bug"],
      summary:
        "แคมเปญที่ budget เป็น EUR แต่ประมูลใน SSP ที่รายงานราคาเป็น USD เริ่มประมูลแพ้เกือบหมดในช่วงเวลาสั้นๆ กลางดึก",
      investigation:
        "ตรวจสอบตาม {{ref:policy:currency-conversion-policy}} พบว่า rate provider ภายนอกล่มไปเกือบ 7 ชั่วโมง เกินเพดาน cache ที่ยอมรับได้ (6 ชั่วโมง) แต่ระบบไม่ได้หยุดประมูลแคมเปญกลุ่มนี้ตามที่ policy กำหนดไว้",
      cause:
        "โค้ดที่เช็คอายุของ cached rate มีบั๊กเปรียบเทียบหน่วยเวลาผิด (เทียบ millisecond กับ second ตรงๆ) ทำให้เงื่อนไข 6 ชั่วโมงไม่เคย trigger จริงในทางปฏิบัติ",
      resolution:
        "แก้บั๊กหน่วยเวลา แล้วบังคับให้ rate provider สำรองตัวที่สองรับช่วงทันทีที่ตัวหลักไม่ตอบเกิน 30 นาที ลดโอกาสที่จะชน 6 ชั่วโมงในอนาคต",
      followup:
        "เพิ่ม unit test เฉพาะสำหรับการเปรียบเทียบหน่วยเวลาในทุกจุดที่มี TTL/cache expiry logic หลังจากเจอบั๊กประเภทนี้มากกว่าหนึ่งครั้งในระบบ",
    },
    {
      slug: "deal-priority-bug-pmp-losing-open-auction",
      title: "PMP Deal แพ้ Open Auction เพราะบั๊ก Priority Flag หาย",
      tags: ["pmp", "deal", "bug"],
      summary:
        "ผู้ลงโฆษณารายใหญ่ที่มี PMP deal อยู่ร้องเรียนว่า fill rate ของ deal ตกลงฮวบทั้งที่ยังมี budget เหลือมาก",
      investigation:
        "ตรวจ {{ref:module:auction-engine}} พบว่า candidate ที่มี deal ID ไม่ได้ถูกจัดลำดับความสำคัญเหนือ open auction ตามที่ {{ref:policy:deal-id-priority-policy}} กำหนด — flag `isPmpDeal` หายไปตอนแปลง bid request บางเวอร์ชันของ SDK ฝั่ง SSP",
      cause:
        "SSP รายหนึ่งอัปเดต SDK เวอร์ชันใหม่ที่เปลี่ยนตำแหน่ง field deal ID ใน payload โดยไม่แจ้งล่วงหน้า parser ฝั่ง AdPulse ยังอ่าน field เดิมจึงไม่เจอ deal ID เลยในบาง field และ default เป็น open auction แทน",
      resolution:
        "แก้ parser ให้รองรับตำแหน่ง field ทั้งสองแบบ (เก่าและใหม่) แล้วประสานกับ SSP รายนั้นให้แจ้งการเปลี่ยนแปลง schema ล่วงหน้าในอนาคต",
      followup:
        "เพิ่มการตรวจสอบ schema ของ bid request จาก SSP แบบ automated ทุกคืน เพื่อจับความเปลี่ยนแปลงที่ไม่คาดคิดก่อนที่จะกระทบ deal จริง",
    },
    {
      slug: "frequency-cap-bug-overexposure",
      title: "Frequency Cap ไม่ทำงานทำให้ผู้ใช้เห็นโฆษณาเดิมซ้ำเกินกำหนดมาก",
      tags: ["frequency-cap", "bug"],
      summary:
        "ผู้ลงโฆษณารายหนึ่งแจ้งว่าผู้ใช้บางคนเห็นโฆษณาแคมเปญเดียวกันมากกว่า 20 ครั้งในวันเดียว ทั้งที่ตั้ง cap ไว้ที่ 3 ครั้ง",
      investigation:
        "ตรวจ {{ref:policy:campaign-frequency-cap-policy}} และ log ของ {{ref:module:auction-engine}} พบว่าตัวนับความถี่ใช้ device ID เป็น key แต่มี bug ที่ไม่ persist ตัวนับข้าม deploy — ทุกครั้งที่ deploy service ตัวนับจะรีเซ็ตเป็นศูนย์",
      cause:
        "ตัวนับความถี่ถูกเก็บใน in-memory cache ของแต่ละ pod แทนที่จะเก็บใน store กลางที่ persist ได้ ช่วงที่มีการ deploy บ่อย (เช่นวันที่มี hotfix หลายรอบ) ตัวนับจึงถูกรีเซ็ตซ้ำๆ ทำให้ cap ไม่มีผลจริง",
      resolution:
        "ย้ายตัวนับความถี่ไปเก็บใน store กลางที่ persist ข้าม deploy ได้ทันที แล้วตรวจสอบว่าแคมเปญที่ได้รับผลกระทบมีจำนวน over-exposure เท่าไหร่เพื่อชดเชยให้ผู้ลงโฆษณา",
      followup:
        "เพิ่ม alert เตือนถ้าตัวนับความถี่เฉลี่ยตกลงกะทันหันหลัง deploy เพื่อจับสัญญาณแบบนี้เร็วขึ้นในอนาคต",
    },
    {
      slug: "creative-renderer-memory-leak-peak",
      title: "Creative Renderer หน่วงช่วง Peak เพราะ Memory Leak สะสม",
      tags: ["performance", "memory"],
      summary:
        "ช่วง peak traffic window (19:00-23:00) latency ของ {{ref:module:creative-renderer}} ค่อยๆ แย่ลงทุกวันจนเริ่มกระทบ time budget รวมของ bid request",
      investigation:
        "ตรวจ metric memory usage พบว่า pod ของ creative-renderer ใช้ memory เพิ่มขึ้นต่อเนื่องตลอดวันไม่เคยลดลง จนต้อง restart เองตาม memory limit ทุกคืน",
      cause:
        "`selectCreativeVariant` cache ผลลัพธ์การเลือก variant ไว้ใน memory เพื่อความเร็ว แต่ cache key รวม timestamp เข้าไปด้วยโดยไม่ตั้งใจ ทำให้แทบทุก request สร้าง cache entry ใหม่แทนที่จะ hit entry เดิม cache จึงโตไม่จำกัดจนกว่าจะ restart",
      resolution:
        "แก้ cache key ให้ไม่รวม timestamp แล้วตั้ง TTL และขนาดสูงสุดของ cache อย่างชัดเจนแทนที่จะปล่อยให้โตไม่จำกัด deploy เป็น hotfix",
      followup:
        "เพิ่ม memory usage เป็นหนึ่งใน metric ที่ต้องผ่านเกณฑ์ก่อน merge ใน {{ref:convention:testing-convention}} โดยเฉพาะสำหรับโค้ดที่มี in-memory cache",
    },
    {
      slug: "fraud-rule-rollback-bot-traffic",
      title: "Bot Traffic หลุดผ่านช่วงที่ Rollback Fraud Rule",
      tags: ["fraud", "rollback"],
      summary:
        "หลัง rollback fraud rule ตัวหนึ่งเพราะเจอ false positive กับ publisher รายใหญ่ (ดู {{ref:incident:fraud-filter-false-positive-publisher}}) ทีมสังเกตว่ามี traffic ผิดปกติจาก bot เพิ่มขึ้นชัดเจนในสองวันถัดมา",
      investigation:
        "ตรวจสอบพบว่า rule ที่ rollback ไปนั้นเป็นตัวหลักที่จับ bot pattern ประเภทหนึ่งได้ดี การ rollback ทั้ง rule แทนที่จะปิดเฉพาะส่วนที่ทำให้เกิด false positive กับ publisher รายนั้น เปิดช่องให้ bot pattern เดิมกลับมาผ่านได้อีกครั้ง",
      cause:
        "ตอน rollback ทีมรีบแก้ปัญหา false positive จนเลือก rollback ทั้ง rule แทนที่จะแก้เฉพาะ condition ที่เกี่ยวกับ publisher รายนั้น เพราะเวลากดดันและ rule มีความซับซ้อนสูงเกินจะแยกแก้ทันที",
      resolution:
        "เขียน rule ใหม่ที่แยก condition สำหรับ publisher ที่อยู่ใน allowlist ออกจาก logic การจับ bot pattern หลัก แล้ว deploy กลับพร้อม allowlist ตาม {{ref:policy:fraud-score-threshold-policy}}",
      followup:
        "ปรับ {{ref:deployment:rollback-procedure}} ให้มีขั้นตอนเฉพาะสำหรับ fraud rule โดยเน้นย้ำให้แยกแก้เฉพาะจุดแทนการ rollback ทั้ง rule เมื่อเป็นไปได้",
    },
    {
      slug: "budget-pacer-race-condition-double-spend",
      title: "Budget Pacer เกิด Race Condition ยอม Spend ซ้อนกันข้าม Pod",
      tags: ["budget", "race-condition"],
      summary:
        "แคมเปญหนึ่งใช้ budget หมดเร็วกว่าที่คาดมากในช่วงเวลาสั้นๆ ที่มี traffic พุ่งพร้อมกันจากหลายภูมิภาค",
      investigation:
        "ตรวจ `recordSpend` ของ {{ref:module:budget-pacer}} พบว่ามี race condition เมื่อสอง pod คนละภูมิภาคอ่านค่า remaining budget พร้อมกันก่อนที่ฝั่งใดฝั่งหนึ่งจะเขียนค่าใหม่ทัน ทำให้ทั้งคู่เห็นว่ายังมี budget เหลือพอ",
      cause:
        "การอ่านและเขียนค่า remaining budget ไม่ได้ทำแบบ atomic ข้าม region — แต่ละ region cache ค่าล่าสุดไว้เองในช่วงสั้นๆ ก่อน sync กลับไปที่ store กลาง ช่วงเวลา sync นั้นเองที่เปิดช่องให้ race condition เกิดได้",
      resolution:
        "เปลี่ยนการหักเงินให้ใช้ atomic decrement ที่ store กลางโดยตรงแทนการอ่าน-คำนวณ-เขียนแยกกัน แม้จะเพิ่ม latency เล็กน้อยต่อ cross-region call ก็ยอมรับได้เพื่อความถูกต้อง",
      followup:
        "ตรวจสอบฟังก์ชันอื่นที่มี pattern อ่าน-แล้ว-เขียนคล้ายกันใน {{ref:module:budget-pacer}} ว่ามีความเสี่ยงเดียวกันหรือไม่ เพิ่มเข้า {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "bid-request-handler-protobuf-schema-mismatch",
      title: "Bid Request Handler ดรอปคำขอจำนวนมากจาก Schema ไม่ตรงกัน",
      tags: ["serialization", "bug"],
      summary:
        "อัตรา request ที่ถูกดรอปโดยไม่มีเหตุผลชัดเจนพุ่งขึ้นกะทันหันหลัง deploy service เวอร์ชันใหม่ตอนดึก",
      investigation:
        "ตรวจ log {{ref:module:bid-request-handler}} พบ deserialization error จำนวนมากตอนแปลง internal bid object ที่ auction-engine ส่งมา เป็น field ที่ handler เวอร์ชันใหม่ไม่รู้จัก",
      cause:
        "ทีมเพิ่ม field ใหม่ใน schema ของ internal bid object ฝั่ง auction-engine แล้ว deploy ก่อน แต่ bid-request-handler ยังเป็นเวอร์ชันเก่าที่ compile ด้วย schema เก่า — schema เปลี่ยนแบบ breaking (ไม่ backward compatible) ทั้งที่ตั้งใจให้เป็น optional field",
      resolution:
        "rollback auction-engine กลับ schema เดิมชั่วคราว แล้ว deploy bid-request-handler เวอร์ชันที่รองรับ schema ใหม่ให้เสร็จก่อน จึง deploy auction-engine เวอร์ชันใหม่อีกครั้งตามลำดับที่ถูกต้อง",
      followup:
        "กำหนดลำดับการ deploy ที่ชัดเจนสำหรับ service ที่แชร์ schema กัน (deploy consumer ก่อน producer เสมอ) เพิ่มเข้า {{ref:deployment:ci-cd-pipeline}}",
    },
    {
      slug: "campaign-id-collision-migration",
      title: "Campaign ID ชนกันหลัง Data Migration ทำให้หักเงินผิดผู้ลงโฆษณา",
      tags: ["billing", "migration", "bug"],
      summary:
        "ผู้ลงโฆษณารายหนึ่งพบว่าถูกหักเงินสำหรับแคมเปญที่ไม่ใช่ของตัวเอง ขณะที่อีกรายไม่ถูกหักเงินทั้งที่แคมเปญวิ่งปกติ",
      investigation:
        "ตรวจ {{ref:module:win-notice-processor}} พบว่า `chargeCampaign` หักเงินผิด campaign_id — ตรวจสอบเพิ่มพบว่าเป็นช่วงหลัง migration ฐานข้อมูลแคมเปญเมื่อสัปดาห์ก่อนตาม runbook migration พอดี",
      cause:
        "migration script generate campaign_id ใหม่บางส่วนโดยใช้ sequence ที่เริ่มนับใหม่แทนที่จะสืบต่อจากค่าสูงสุดเดิม ทำให้ campaign_id ใหม่บางตัวชนกับ id เก่าที่ยังไม่ถูกลบออกจากระบบ billing",
      resolution:
        "หยุด billing ชั่วคราวสำหรับช่วง campaign_id ที่มีความเสี่ยงชนกัน ตรวจสอบและแก้ไข mapping ที่ผิดด้วยมือทีละรายการ แล้วคืนเงินให้ผู้ลงโฆษณาที่ถูกหักผิด",
      followup:
        "แก้ migration script ให้ตรวจสอบ sequence สูงสุดเดิมก่อนเริ่ม generate id ใหม่เสมอ เพิ่มขั้นตอนนี้เข้า runbook migration ของแคมเปญในอนาคต",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/AD-142-pacing-clock-sync`, `fix/AD-158-fraud-allowlist-threshold`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(budget-pacer): sync เวลาให้ตรงกันข้าม pod ป้องกัน overspend`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        {
          heading: "สิ่งที่ต้องเช็คทุกครั้ง",
          body: "โค้ดที่แตะ time budget ของ bid request ต้องแนบผลทดสอบ latency p99 มาด้วยเสมอ (บทเรียนจาก {{ref:incident:auction-engine-timeout-spike}}) การเปลี่ยน fraud rule ต้องมีคนที่สองจากทีม trust & safety รีวิวก่อน merge เสมอ และการเปลี่ยน field ใน schema ที่ share ข้าม service ต้องระบุลำดับการ deploy ชัดเจน (ดูบทเรียนจาก {{ref:incident:bid-request-handler-protobuf-schema-mismatch}})",
        },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `computeBidPrice`, `applyFloorPrice` — ฟังก์ชันที่คืนค่าผลการตัดสินใจ (win/lose/block) ใช้คำนามที่ชัดเจน ไม่ใช้คำกำกวมอย่าง `process` เดี่ยวๆ" },
        { heading: "Identifier ทางธุรกิจ", body: "`campaignId` รูปแบบ `CMP-<6 หลัก>`, `noticeId` มาจาก SSP โดยตรงห้ามแก้รูปแบบ ต้องเก็บคู่กับ `sspId` เสมอเพื่อความ unique (ดู {{ref:policy:win-notice-dedup-policy}})" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ bid request ต้องมี `requestId` เสมอเพื่อไล่ log ข้าม service ได้ (bid-request-handler → fraud-filter → auction-engine → creative-renderer) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "fraud score ที่เกิน threshold log เป็น `warn` เสมอแม้จะไม่ได้ block จริง (เช่นกรณี bid shading) เพื่อให้ทีม trust & safety สืบย้อนแนวโน้มได้ ส่วนกรณี block จริง log เป็น `error`" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`ADPULSE_<DOMAIN>_<REASON>` เช่น `ADPULSE_BID_TIMEOUT`, `ADPULSE_BUDGET_EXHAUSTED` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`ADPULSE_FRAUD_BLOCKED`, `ADPULSE_CREATIVE_NOT_APPROVED`, `ADPULSE_FLOOR_PRICE_REJECTED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "latency"],
      sections: [
        {
          heading: "Latency test ก่อนขึ้นจริง",
          body: "โค้ดที่อยู่ใน critical path ของ bid request (ภายใน time budget ตาม {{ref:policy:bid-timeout-policy}}) ต้องผ่าน load test ที่ p99 latency ก่อน merge เสมอ — บทเรียนจาก {{ref:incident:creative-renderer-memory-leak-peak}} คือ memory usage ต้องเป็นส่วนหนึ่งของเกณฑ์ด้วย ไม่ใช่แค่ latency เฉลี่ย",
        },
        {
          heading: "Concurrent test",
          body: "ฟังก์ชันที่แตะ budget spend ต้องมี test จำลอง request พร้อมกันจากหลาย region อย่างน้อย 2 ตัวเสมอ (บทเรียนจาก {{ref:incident:budget-pacer-race-condition-double-spend}})",
        },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "bid response ทุกตัวห่อด้วยรูปแบบ OpenRTB มาตรฐานเสมอ ไม่เพิ่ม field แปลกปนนอก spec แม้จะเป็น internal metadata ก็ต้องส่งผ่าน extension field ที่กำหนดไว้เท่านั้น" },
        { heading: "Error response", body: "no-bid response ไม่ใช่ error — ส่งเป็น HTTP 204 ตาม spec OpenRTB เสมอ ส่วน error จริง (เช่น malformed request) ใช้ `{ code, message }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}}" },
      ],
    },
    {
      slug: "openrtb-field-convention",
      title: "OpenRTB Field Convention",
      tags: ["openrtb", "schema"],
      intro: "เอกสารนี้กำหนดว่า field จาก OpenRTB request/response แต่ละตัว แปลงเป็น internal field ชื่ออะไร เพื่อไม่ให้แต่ละทีมแปลชื่อไม่ตรงกัน",
      sections: [
        { heading: "การแปลงชื่อ field หลัก", body: "`imp[].bidfloor` → `floorPrice`, `imp[].id` → `impressionId`, `device.ifa` → `deviceId` ห้ามใช้ชื่อ OpenRTB ดิบในโค้ด internal เพื่อไม่ให้ผูกกับ spec เวอร์ชันใดเวอร์ชันหนึ่งแน่นเกินไป" },
        { heading: "field ที่ต้องมีเสมอ", body: "`requestId`, `campaignId` (หลังผ่าน auction แล้ว), `floorPrice` ต้องมีทุก internal bid object ที่ส่งต่อข้าม service — ขาดตัวใดตัวหนึ่ง {{ref:module:bid-request-handler}} จะปฏิเสธ pipeline ทันทีแทนที่จะเดาค่า default (เทียบกับหลักการเดียวกันที่ {{ref:module:auction-engine}} ใช้ตรวจ candidate)" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → latency load test (สำหรับ service ใน critical path ของ bid request) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้ง pipeline" },
        {
          heading: "Gate พิเศษ",
          body: "{{ref:module:bid-request-handler}} และ {{ref:module:auction-engine}} ต้องผ่าน latency load test ที่ p99 ไม่เกิน time budget ที่กำหนดใน {{ref:policy:bid-timeout-policy}} ก่อน merge เสมอ นอกจากนี้ service ที่แชร์ schema กันต้อง deploy ตามลำดับ consumer ก่อน producer (บทเรียนจาก {{ref:incident:bid-request-handler-protobuf-schema-mismatch}})",
        },
      ],
    },
    {
      slug: "bid-timeout-infrastructure-tuning",
      title: "Bid Timeout & Connection Tuning (Infrastructure)",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure/network เท่านั้น ไม่ใช่ business time budget ของ bid request — ดูเรื่องนั้นที่ {{ref:policy:bid-timeout-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| SSP → API gateway connect | 20ms | LB config |\n| API gateway → bid-request-handler | 5ms | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| bid-request-handler → fraud-filter | 15ms | env `FRAUD_CALL_TIMEOUT_MS` |\n| bid-request-handler → auction-engine | 25ms | env `AUCTION_CALL_TIMEOUT_MS` |\n| bid-request-handler → creative-renderer | 20ms | env `CREATIVE_CALL_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนมิถุนายน 2026 พบว่า network latency ระหว่าง data center สองแห่งสูงขึ้นช่วง traffic พุ่ง ทำให้ connect timeout 20ms สั้นเกินไปเป็นครั้งคราว ขยับเป็น 25ms แล้วเพิ่ม buffer ฝั่ง gateway ชดเชย" },
      ],
    },
    {
      slug: "campaign-schema-migration-runbook",
      title: "Campaign Schema Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อต้องเปลี่ยนโครงสร้างตารางแคมเปญ (เพิ่ม field, เปลี่ยนประเภท campaign_id, รวมฐานข้อมูลจาก acquisition) ต้อง migrate ข้อมูลใน {{ref:module:budget-pacer}} และ {{ref:module:win-notice-processor}} พร้อมกันเสมอเพราะทั้งคู่อ้างอิง campaign_id ร่วมกัน" },
        {
          heading: "ขั้นตอน",
          body: "1) หยุดรับ win notice ใหม่ชั่วคราว 2) export ข้อมูลเดิมสำรองไว้ 3) ตรวจสอบ sequence สูงสุดของ campaign_id เดิมก่อน generate id ใหม่เสมอ (บทเรียนจาก {{ref:incident:campaign-id-collision-migration}}) 4) import ข้อมูลใหม่แล้ว reconcile ยอด spend ให้ตรงก่อนเปิดรับ win notice อีกครั้ง",
        },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ระบบหยุดรับ bid request ทั้งหมดหรือมีการหักเงินผิดพลาด, Sev2 = กระทบบาง SSP/แคมเปญ, Sev3 = กระทบเล็กน้อยไม่ถึงผู้ลงโฆษณา" },
        {
          heading: "กรณี billing ผิดพลาด",
          body: "ทุกเหตุการณ์ที่เกี่ยวกับการหักเงินผิด (ดู {{ref:incident:duplicate-billing-win-notice-bug}} และ {{ref:incident:campaign-id-collision-migration}}) ต้องยกระดับเป็น Sev1 เสมอแม้จำนวนเงินจะน้อย และต้องแจ้งทีมการเงินภายใน 1 ชั่วโมง",
        },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "p99 latency ของ {{ref:module:bid-request-handler}} เกิน 90ms ต่อเนื่อง 5 นาที, fraud block rate เปลี่ยนแปลงเกิน 20% จากค่าเฉลี่ย 7 วันย้อนหลัง, campaign spend rate เบี่ยงจากเส้น pacing เกิน tolerance ตาม {{ref:policy:budget-pacing-policy}}" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน billing-related alert แจ้งทีมการเงินคู่ขนานกับ on-call เสมอไม่ว่าจะเป็น severity ระดับไหน" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        {
          heading: "เมื่อไหร่ต้อง rollback ทันที",
          body: "ถ้า deploy ใหม่ทำให้ win rate ตกต่ำผิดปกติเกิน 15% หรือ latency p99 เกิน time budget ต้อง rollback ทันทีโดยไม่ต้องรอ approval — สำหรับ fraud rule ให้พิจารณา rollback เฉพาะ condition ที่มีปัญหาแทนการ rollback ทั้ง rule เมื่อเป็นไปได้ (บทเรียนจาก {{ref:incident:fraud-rule-rollback-bot-traffic}})",
        },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ ไม่ skip smoke test แม้เป็นสถานการณ์เร่งด่วน แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| bid-request-handler | 4 | 20 | p99 latency > 70ms |\n| auction-engine | 4 | 16 | CPU > 60% (เข้มกว่าที่อื่นเพราะ latency-sensitive) |\n| fraud-filter | 2 | 10 | CPU > 70% |\n| win-notice-processor | 2 | 6 | queue depth > 1000 |" },
        {
          heading: "ข้อจำกัดช่วง peak",
          body: "การ scale software service เร็วขึ้นช่วย throughput ได้ แต่ latency ภายใน time budget ที่แคบมาก (ดู {{ref:policy:bid-timeout-policy}}) ไม่ได้ดีขึ้นจากการเพิ่ม replica เสมอไป ถ้า downstream call เองช้าอยู่แล้ว ดู {{ref:incident:auction-engine-timeout-spike}} เป็นตัวอย่าง",
        },
      ],
    },
    {
      slug: "edge-pop-deployment-runbook",
      title: "Edge PoP Deployment Runbook",
      tags: ["edge", "runbook"],
      intro: "AdPulse deploy {{ref:module:bid-request-handler}} เป็น edge point-of-presence (PoP) กระจายหลายภูมิภาคเพื่อลด network latency ก่อนถึง SSP เอกสารนี้อธิบายขั้นตอนเพิ่ม/อัปเดต PoP ใหม่",
      sections: [
        { heading: "ก่อนเปิด PoP ใหม่", body: "ต้องยืนยันว่า PoP ใหม่เชื่อมต่อกับ {{ref:module:budget-pacer}} กลางได้ภายใน latency ที่ยอมรับได้ (ไม่เกิน 10ms) ก่อนเปิดรับ traffic จริง ไม่งั้นจะกระทบความแม่นยำของการเช็ค budget สด" },
        { heading: "การทดสอบก่อนเปิดรับ traffic เต็ม", body: "เปิดรับ traffic แบบ canary 5% ก่อนเสมอ เฝ้าดู latency และ error rate เทียบกับ PoP อื่นอย่างน้อย 2 ชั่วโมงก่อนขยายเป็น 100% ดู {{ref:deployment:rollback-procedure}} หากพบปัญหาระหว่างทดสอบ" },
      ],
    },
  ],
};
