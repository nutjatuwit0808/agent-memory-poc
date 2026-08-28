import type { DomainProfile } from "../types.js";

// PointsVault — ระบบสะสมแต้มและสิทธิพิเศษ (loyalty & rewards platform)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const loyaltyRewards: DomainProfile = {
  id: "loyalty-rewards",
  displayName: "PointsVault — ระบบสะสมแต้มและสิทธิพิเศษ",
  summary: [
    "PointsVault คือแพลตฟอร์มบริหารโปรแกรมสะสมแต้มสำหรับ brand พันธมิตรหลายเจ้า สมาชิกได้รับแต้มจากการซื้อสินค้าและบริการที่ร้านค้าในเครือ นำแต้มไปแลกรางวัล ติดตามสถานะระดับสมาชิก (Bronze/Silver/Gold/Platinum) และรับ offer พิเศษที่ปรับตามพฤติกรรมของแต่ละคน",
    "ระบบแบ่งออกเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่บันทึกรายการแต้มในบัญชีสมาชิก คำนวณระดับ tier ตามยอดแต้มสะสม ไปจนถึงตั้งเวลาลบแต้มหมดอายุและ sync ข้อมูลแต้มกับ partner รายต่างๆ ทีมวิศวกรรมเรียกช่วง 00:00-02:00 ว่า batch window เพราะเป็นช่วงที่ expiry job และ tier recalculation รันพร้อมกันและใช้ทรัพยากรสูงสุด",
  ],
  domainTags: ["loyalty-rewards", "pointsvault"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่แชร์ตารางข้ามกัน — {{ref:module:points-ledger}} เป็นเจ้าของยอดแต้มและประวัติ transaction ทั้งหมดของสมาชิก ส่วน {{ref:module:tier-calculator}} เก็บเฉพาะผลการคำนวณ tier ล่าสุดและเกณฑ์ที่ใช้ ไม่มี ledger raw data ของตัวเอง",
    "{{ref:module:redemption-engine}} เป็น service เดียวที่ต้องอ่านยอดแต้มจาก {{ref:module:points-ledger}} และตรวจสอบ tier ใน {{ref:module:tier-calculator}} พร้อมกันก่อนอนุมัติการแลกรางวัล เหตุผลที่ยอมให้ service นี้ cross-query คือต้องเห็น balance และ tier สิทธิ์ ณ เวลาเดียวกันเพื่อป้องกัน race condition ระหว่างการแลก",
  ],
  apiGatewayNote: [
    "คำขอจาก mobile app และ web portal ของสมาชิกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งทำ auth และแปลง member_id เป็น internal account_id ก่อนส่งต่อให้ service ปลายทาง คำขอที่ต้องการผลทันที เช่น เช็คยอดแต้มปัจจุบัน ใช้ synchronous call ผ่านตรงนี้",
    "คำขอจาก partner brand ผ่าน partner API แยกต่างหาก ไม่ใช่ gateway สมาชิก เพื่อแยก rate limit และ auth scope ของสองฝั่งออกจากกัน {{ref:module:partner-sync}} เป็นผู้รับ event จาก partner โดยตรงผ่าน webhook endpoint ของตัวเอง",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:points-ledger}} ดูแล ได้แก่ `point_accounts` (ยอดแต้มปัจจุบันของสมาชิกแต่ละคน), `point_transactions` (ประวัติทุก transaction ไม่ลบทิ้ง), และ `pending_credits` (แต้มที่รอยืนยันจาก partner)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `point_accounts` | points-ledger | อัปเดตทุกครั้งที่มี credit/debit |\n| `point_transactions` | points-ledger | append-only ไม่มีการลบ |\n| `tier_status` | tier-calculator | อัปเดตทุกสัปดาห์และหลัง threshold crossing |\n| `redemption_orders` | redemption-engine | ประวัติการแลกรางวัล |\n| `member_offers` | offer-personalizer | offer ที่ generate ให้สมาชิกแต่ละคน |",
    "ทุกตารางมี `account_id` เป็น reference ร่วมแบบ soft reference ไม่มี FK constraint ข้าม service ตรวจสอบความสอดคล้องด้วย reconciliation job รายสัปดาห์แทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `points.credited`, `points.redeemed`, `points.expired`, `tier.upgraded`, `tier.downgraded`, `offer.generated` — {{ref:module:tier-calculator}} subscribe `points.credited` เพื่อตรวจว่าถึง tier threshold หรือยัง ไม่ต้องรอ batch รายสัปดาห์",
    "{{ref:module:expiry-scheduler}} publish `points.expired` เมื่อถึงเวลาลบแต้มหมดอายุ ซึ่ง {{ref:module:points-ledger}} subscribe เพื่อทำ debit อัตโนมัติ ออกแบบให้แยกกันเพื่อไม่ให้ expiry logic และ ledger logic ปะปนกัน ถ้า points-ledger ล่มช่วง expiry job event จะยังคงอยู่ใน queue รอให้ consume ภายหลัง",
  ],
  modules: [
    {
      slug: "points-ledger",
      name: "points-ledger",
      tags: ["points", "ledger", "module", "core"],
      description:
        "เจ้าของยอดแต้มและประวัติ transaction ทุกรายการของสมาชิก ออกแบบเป็น append-only ledger เพื่อให้ตรวจสอบย้อนหลังได้ทุกจุด ไม่มีการแก้ไขหรือลบ record ที่บันทึกไปแล้ว ยอดแต้มปัจจุบันคำนวณจาก sum ของ transaction ทั้งหมดในบัญชี แยกออกมาเป็น service อิสระเพราะ ledger เป็นหัวใจของระบบที่ต้องมี auditability สูงสุดและไม่ควรปนกับ business rule ชั้นอื่น",
      functions: [
        { sig: "creditPoints(accountId: string, amount: number, source: PointSource, idempotencyKey: string): Promise<TransactionId>", desc: "เพิ่มแต้มเข้าบัญชีพร้อม idempotency key เพื่อป้องกัน double credit" },
        { sig: "debitPoints(accountId: string, amount: number, reason: DebitReason): Promise<TransactionId>", desc: "ตัดแต้มออกจากบัญชี ตรวจว่า balance เพียงพอก่อนเสมอ" },
        { sig: "getBalance(accountId: string): Promise<PointBalance>", desc: "คืนยอดแต้มปัจจุบันและแต้มที่รอยืนยัน (pending)" },
        { sig: "getTransactionHistory(accountId: string, options: PaginationOptions): Promise<Transaction[]>", desc: "ดึงประวัติ transaction พร้อม pagination" },
      ],
      stateFlow: "pending_credit → confirmed | voided — แต้มที่ partner ส่งมายังไม่ยืนยันอยู่ใน pending นานสูงสุด 72 ชั่วโมง ถ้าไม่ได้รับยืนยันจาก {{ref:module:partner-sync}} จะถูก void อัตโนมัติ ดู {{ref:policy:partner-conversion-policy}}",
      relatedNotes:
        "{{ref:module:redemption-engine}} เรียก `getBalance` ก่อน debit ทุกครั้ง แต่ points-ledger ไม่รู้จัก concept ของ reward catalog หรือ redemption order เลย — รู้แค่ debit amount และ reason ที่จัดหมวดไว้แล้ว การตัดสินใจว่า debit ได้หรือไม่อยู่ที่ redemption-engine",
      internals: {
        constants: [
          { name: "PENDING_CREDIT_TTL_HOURS", value: "72" },
          { name: "MAX_SINGLE_CREDIT_POINTS", value: "100000" },
          { name: "IDEMPOTENCY_KEY_TTL_DAYS", value: "30" },
        ],
        typeSnippet:
          "interface Transaction {\n  transactionId: string;\n  accountId: string;\n  type: \"credit\" | \"debit\";\n  amount: number;\n  balanceAfter: number;\n  source: string;\n  createdAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องอัตราการได้แต้มที่ {{ref:policy:points-earning-rate-policy}}",
      },
    },
    {
      slug: "tier-calculator",
      name: "tier-calculator",
      tags: ["tier", "module", "core"],
      description:
        "คำนวณและบริหาร tier ของสมาชิก (Bronze/Silver/Gold/Platinum) โดยอิงจากยอดแต้มสะสมรอบปีปัจจุบัน แยกออกจาก points-ledger ตั้งแต่ต้นเพราะ logic การ upgrade/downgrade มีเงื่อนไขซับซ้อนโดยเฉพาะช่วง grace period ที่ไม่ควรปะปนกับ ledger transaction",
      functions: [
        { sig: "getCurrentTier(accountId: string): Promise<TierStatus>", desc: "คืน tier ปัจจุบันและยอดแต้มสะสมในรอบปีที่ใช้คำนวณ" },
        { sig: "evaluateTierChange(accountId: string): Promise<TierChangeResult>", desc: "ตรวจว่าสมาชิกควร upgrade หรือ downgrade จาก tier ปัจจุบัน" },
        { sig: "applyGracePeriod(accountId: string, reason: GraceReason): Promise<void>", desc: "ตั้ง grace period เมื่อสมาชิกอยู่ใน downgrade zone ดู {{ref:policy:tier-downgrade-grace-policy}}" },
        { sig: "getAnnualPointsSummary(accountId: string, year: number): Promise<AnnualSummary>", desc: "คืนยอดแต้มสะสมและสถิติ tier ของรอบปีที่ระบุ" },
      ],
      stateFlow: "bronze → silver → gold → platinum (upgrade เมื่อถึง threshold) และ platinum → gold → silver → bronze (downgrade หลัง grace period หมด) — ดู {{ref:policy:tier-downgrade-grace-policy}} สำหรับเงื่อนไขเวลา",
      relatedNotes:
        "subscribe `points.credited` จาก {{ref:module:points-ledger}} เพื่อ re-evaluate tier ทันทีที่แต้มเข้าถึง threshold ไม่รอ batch รายสัปดาห์เพราะ tier upgrade มักมาพร้อม benefit ที่สมาชิกต้องการใช้ทันที",
      internals: {
        constants: [
          { name: "SILVER_THRESHOLD_POINTS", value: "5000" },
          { name: "GOLD_THRESHOLD_POINTS", value: "15000" },
          { name: "PLATINUM_THRESHOLD_POINTS", value: "40000" },
          { name: "DOWNGRADE_GRACE_PERIOD_DAYS", value: "90" },
        ],
        typeSnippet:
          "interface TierStatus {\n  accountId: string;\n  tier: \"bronze\" | \"silver\" | \"gold\" | \"platinum\";\n  annualPoints: number;\n  gracePeriodEndsAt?: string;\n  nextEvaluationAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง grace period ที่ {{ref:policy:tier-downgrade-grace-policy}}",
      },
    },
    {
      slug: "redemption-engine",
      name: "redemption-engine",
      tags: ["redemption", "module", "core"],
      description:
        "รับผิดชอบกระบวนการแลกรางวัลทั้งหมด ตั้งแต่ตรวจสอบว่าสมาชิกมีแต้มพอและมีสิทธิ์แลก ไปจนถึงตัด debit และสร้าง order รางวัล แยกออกมาเป็น service อิสระเพราะการแลกรางวัลต้องการ atomicity ของหลาย operation พร้อมกัน (check balance + debit + create order) ซึ่งต้องจัดการ race condition ต่างจาก operation ทั่วไป",
      functions: [
        { sig: "initiateRedemption(accountId: string, rewardId: string): Promise<RedemptionOrder>", desc: "เริ่มกระบวนการแลกรางวัล ตรวจสิทธิ์และล็อก balance ก่อน" },
        { sig: "confirmRedemption(orderId: string): Promise<void>", desc: "ยืนยัน redemption ทำ debit จริง และส่ง fulfillment request" },
        { sig: "cancelRedemption(orderId: string, reason: string): Promise<void>", desc: "ยกเลิก redemption และคืน locked points กลับเข้าบัญชี" },
        { sig: "getRedemptionStatus(orderId: string): Promise<RedemptionOrder>", desc: "ดึงสถานะปัจจุบันของ redemption order" },
      ],
      stateFlow: "pending → points_locked → confirmed | cancelled — points ถูก lock ระหว่าง pending นานสูงสุด 15 นาที ถ้าไม่ confirm จะ auto-cancel คืนแต้มให้ เพื่อป้องกันแต้มติดค้างแบบ indefinite",
      relatedNotes:
        "ต้องเรียกทั้ง {{ref:module:points-ledger}} (debit) และ {{ref:module:tier-calculator}} (ตรวจ tier benefit) ในกระบวนการ confirm ดู {{ref:policy:redemption-threshold-policy}} สำหรับเกณฑ์แต้มขั้นต่ำและสิทธิ์พิเศษตาม tier",
      internals: {
        constants: [
          { name: "REDEMPTION_LOCK_TTL_MINUTES", value: "15" },
          { name: "MIN_REDEMPTION_POINTS", value: "500" },
          { name: "MAX_DAILY_REDEMPTIONS_PER_ACCOUNT", value: "5" },
        ],
        typeSnippet:
          "interface RedemptionOrder {\n  orderId: string;\n  accountId: string;\n  rewardId: string;\n  pointsCost: number;\n  status: \"pending\" | \"points_locked\" | \"confirmed\" | \"cancelled\";\n  lockedUntil?: string;\n  createdAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเกณฑ์การแลกที่ {{ref:policy:redemption-threshold-policy}}",
      },
    },
    {
      slug: "offer-personalizer",
      name: "offer-personalizer",
      tags: ["offer", "personalization", "module"],
      description:
        "สร้างและจัดการ offer พิเศษที่ปรับตามพฤติกรรมและ tier ของสมาชิกแต่ละคน ทำงานแบบ batch ทุก 24 ชั่วโมง ไม่ใช่ real-time เพราะการ compute offer ต้องการข้อมูลพฤติกรรมย้อนหลัง 90 วัน ซึ่งคิดใหม่ทุกชั่วโมงสิ้นเปลืองทรัพยากรโดยไม่จำเป็น",
      functions: [
        { sig: "generateMemberOffers(accountId: string): Promise<Offer[]>", desc: "คำนวณ offer ชุดใหม่สำหรับสมาชิกตาม profile และ tier ปัจจุบัน" },
        { sig: "getActiveOffers(accountId: string): Promise<Offer[]>", desc: "คืน offer ที่ยังไม่หมดอายุสำหรับสมาชิก" },
        { sig: "markOfferUsed(accountId: string, offerId: string): Promise<void>", desc: "บันทึกว่า offer นี้ถูกใช้ไปแล้ว ป้องกันใช้ซ้ำ" },
      ],
      relatedNotes:
        "subscribe `tier.upgraded` และ `tier.downgraded` จาก {{ref:module:tier-calculator}} เพื่อ invalidate offer cache และ regenerate ใหม่เมื่อ tier เปลี่ยน เนื่องจาก offer ขึ้นกับ tier โดยตรง — ดู {{ref:policy:bonus-campaign-eligibility-policy}} สำหรับ rule การเข้าร่วม campaign พิเศษ",
    },
    {
      slug: "partner-sync",
      name: "partner-sync",
      tags: ["partner", "sync", "module"],
      description:
        "รับผิดชอบ sync ข้อมูล transaction และยืนยันแต้มจาก partner brand ภายนอก แต่ละ partner มี API format และ authentication ต่างกัน service นี้ทำหน้าที่ normalize ข้อมูลและตรวจสอบความถูกต้องก่อนส่งต่อให้ {{ref:module:points-ledger}} เพื่อ credit จริง",
      functions: [
        { sig: "processPartnerTransaction(partnerId: string, rawPayload: unknown): Promise<CreditRequest>", desc: "แปลง transaction จาก format ของ partner เป็น format กลางของระบบ" },
        { sig: "confirmPendingCredit(transactionRef: string): Promise<void>", desc: "ยืนยันว่า partner transaction ถูกต้อง สั่ง credit จริงใน {{ref:module:points-ledger}}" },
        { sig: "getPartnerSyncStatus(partnerId: string): Promise<SyncStatus>", desc: "คืนสถานะ sync ล่าสุดของ partner รวมถึง error rate และ last successful sync" },
      ],
      relatedNotes:
        "ดู {{ref:policy:partner-conversion-policy}} สำหรับ conversion rate ของแต้มจาก partner แต่ละราย partner-sync ไม่ตัดสินใจ conversion rate เอง — แค่ส่งค่า raw amount มาให้ points-ledger ซึ่งเป็นคนคำนวณ equivalent points ให้",
    },
    {
      slug: "expiry-scheduler",
      name: "expiry-scheduler",
      tags: ["expiry", "scheduler", "module"],
      description:
        "ติดตามและ execute การหมดอายุของแต้มตาม policy ที่กำหนด รันเป็น batch job ช่วง 00:00-02:00 ทุกวัน เหตุผลที่แยกเป็น service ต่างหากคือ expiry logic มีความซับซ้อนของตัวเอง เช่น partial expiry และ tier-based extension ที่ไม่ควรปะปนกับ transaction flow ปกติของ points-ledger",
      functions: [
        { sig: "scheduleExpiry(accountId: string, amount: number, expiresAt: string): Promise<void>", desc: "ตั้งกำหนดการหมดอายุสำหรับแต้ม batch นี้" },
        { sig: "processExpiredPoints(batchDate: string): Promise<ExpiryReport>", desc: "รัน expiry สำหรับวันที่ระบุ คืน report ว่าแต้มกี่ point จากกี่บัญชีถูก expire" },
        { sig: "previewExpiry(accountId: string, daysAhead: number): Promise<ExpiryForecast>", desc: "แสดงตัวอย่างว่าแต้มของสมาชิกจะหมดอายุเมื่อไหร่บ้างในช่วง n วันข้างหน้า" },
      ],
      relatedNotes:
        "ดู {{ref:policy:points-expiry-policy}} สำหรับ window หมดอายุและเงื่อนไข extension ตาม tier — expiry-scheduler ต้อง query tier ปัจจุบันจาก {{ref:module:tier-calculator}} ก่อนทุกครั้งที่รัน batch เพราะ Gold และ Platinum มี expiry window ที่ยาวกว่า Bronze และ Silver",
    },
  ],
  envVarGroups: [
    {
      service: "points-ledger-service",
      vars: [
        { name: "LEDGER_DB_URL", example: "postgres://ledger-db.internal:5432/ledger", note: "secret ห้าม log" },
        { name: "LEDGER_PENDING_CREDIT_TTL_HOURS", example: "72", note: "ดู {{ref:policy:partner-conversion-policy}}" },
        { name: "LEDGER_IDEMPOTENCY_TTL_DAYS", example: "30", note: "ช่วงเวลาที่ idempotency key ยังคงป้องกัน duplicate credit ได้" },
      ],
    },
    {
      service: "tier-calculator-service",
      vars: [
        { name: "TIER_EVALUATION_CRON", example: "0 2 * * 0", note: "weekly batch re-evaluation ทุกอาทิตย์ตี 2" },
        { name: "TIER_DOWNGRADE_GRACE_DAYS", example: "90", note: "ดู {{ref:policy:tier-downgrade-grace-policy}}" },
      ],
    },
    {
      service: "redemption-engine-service",
      vars: [
        { name: "REDEMPTION_LOCK_TTL_MINUTES", example: "15", note: "ดู {{ref:policy:redemption-threshold-policy}}" },
        { name: "REDEMPTION_MAX_DAILY_PER_ACCOUNT", example: "5", note: "ป้องกัน abuse ดู {{ref:policy:redemption-threshold-policy}}" },
      ],
    },
    {
      service: "expiry-scheduler-service",
      vars: [
        { name: "EXPIRY_BATCH_CRON", example: "0 0 * * *", note: "รันทุกเที่ยงคืน ดู {{ref:deployment:expiry-job-scheduling-runbook}}" },
        { name: "EXPIRY_BATCH_CHUNK_SIZE", example: "5000", note: "แบ่ง account เป็น chunk เพื่อไม่ให้ DB lock นานเกิน" },
      ],
    },
  ],
  policies: [
    {
      slug: "points-earning-rate-policy",
      title: "นโยบายอัตราการสะสมแต้มตาม Tier",
      tags: ["points", "earning", "tier", "policy"],
      isPrimary: true,
      intro: [
        "อัตราการได้แต้มต่อยอดซื้อปรับตาม tier ของสมาชิก — Bronze ได้ 1 แต้มต่อ 25 บาท, Silver 1 ต่อ 20 บาท, Gold 1 ต่อ 15 บาท และ Platinum 1 ต่อ 10 บาท อัตรานี้ใช้กับทุก partner ที่ไม่ได้กำหนด rate แยก",
        "แต้มคำนวณจากยอดซื้อ net (หลังหักส่วนลดและ voucher แล้ว) ไม่ใช่จากราคา tag เพื่อไม่ให้สมาชิกได้แต้มมากขึ้นจากการใช้ส่วนลด partner บางรายอาจมี multiplier พิเศษช่วง campaign ดู {{ref:policy:bonus-campaign-eligibility-policy}}",
      ],
      sections: [
        {
          heading: "แต้มสูงสุดต่อ transaction",
          body: "transaction เดียวได้แต้มสูงสุด `MAX_SINGLE_CREDIT_POINTS` แม้ยอดซื้อจะสูงกว่านั้น เพื่อป้องกันความเสียหายจาก bulk purchase ที่ผิดปกติ",
        },
      ],
      edgeCase: {
        title: "กรณียอดซื้อที่ถูก refund หลังได้แต้มไปแล้ว",
        tags: ["points", "earning", "refund", "edge-case"],
        body: [
          "ถ้าสมาชิกได้รับแต้มจาก transaction แล้วภายหลัง transaction นั้นถูก refund ระบบจะ debit แต้มที่ได้ไปคืนทันทีตามยอด refund จริง ถ้าสมาชิกใช้แต้มเหล่านั้นไปแล้วบางส่วน balance จะติดลบชั่วคราวจนกว่าจะได้แต้มใหม่มาเติม",
          "กรณี balance ติดลบเกิน 30 วันโดยไม่มีกิจกรรมใหม่ ระบบจะแจ้งเตือนสมาชิกและ lock การแลกรางวัลชั่วคราวจนกว่า balance จะกลับมาเป็นบวก ไม่ตัด tier ของสมาชิกออกเพราะ balance ติดลบเพียงอย่างเดียว เพราะ tier คำนวณจากยอดสะสมรายปีแยกต่างหาก",
        ],
      },
    },
    {
      slug: "redemption-threshold-policy",
      title: "นโยบายเกณฑ์ขั้นต่ำและสิทธิ์การแลกรางวัล",
      tags: ["redemption", "threshold", "policy"],
      isPrimary: true,
      intro: [
        "สมาชิกต้องมียอดแต้มอย่างน้อย `MIN_REDEMPTION_POINTS` จึงจะแลกรางวัลได้ ยอดนี้ต้องเป็น confirmed points เท่านั้น ไม่นับ pending points จาก partner ที่ยังไม่ยืนยัน เพราะ pending points อาจถูก void ในภายหลัง",
        "แต่ละบัญชีแลกรางวัลได้สูงสุด `MAX_DAILY_REDEMPTIONS_PER_ACCOUNT` ครั้งต่อวัน เพื่อลดความเสี่ยงจากบัญชีที่อาจถูก compromise แลก redemption หมดในคืนเดียว",
      ],
      sections: [
        {
          heading: "สิทธิ์พิเศษตาม Tier",
          body: "Gold ขึ้นไปสามารถแลกรางวัลในหมวด Exclusive ที่ Bronze และ Silver เข้าไม่ถึง Platinum มีสิทธิ์ reserve รางวัล limited quantity ล่วงหน้า 48 ชั่วโมงก่อน general release",
        },
      ],
      edgeCase: {
        title: "การแลกรางวัลขณะอยู่ใน Tier Downgrade Grace Period",
        tags: ["redemption", "tier", "grace-period", "edge-case"],
        body: [
          "สมาชิกที่อยู่ใน grace period ของการ downgrade tier ยังคงแลกรางวัลในสิทธิ์ tier เดิมได้ตลอด grace period นั้น ไม่ใช่สิทธิ์ tier ใหม่",
          "เมื่อ grace period สิ้นสุด สิทธิ์จะปรับเป็น tier ใหม่ทันที ไม่มีการขยาย grace period ซ้อนกันแม้สมาชิกจะซื้อเพิ่มเล็กน้อยในช่วงนั้น ต้องทำยอดให้ถึง threshold ของ tier เดิมภายใน grace period ถึงจะรักษา tier ไว้ได้",
        ],
      },
    },
    {
      slug: "points-expiry-policy",
      title: "นโยบายหมดอายุของแต้ม",
      tags: ["expiry", "points", "policy"],
      isPrimary: true,
      intro: [
        "แต้มที่ได้รับมีอายุตาม tier ของสมาชิก ณ เวลาที่ได้รับ: Bronze และ Silver มีอายุ 12 เดือนนับจากวันที่ได้รับแต้ม, Gold มีอายุ 18 เดือน, Platinum มีอายุ 24 เดือน อายุนี้ไม่เปลี่ยนตามการ upgrade/downgrade tier หลังจากได้รับแต้มแล้ว",
        "{{ref:module:expiry-scheduler}} รันทุกเที่ยงคืนเพื่อตรวจและ expire แต้มที่ครบกำหนด สมาชิกจะได้รับแจ้งเตือนทาง email 30 วันและ 7 วันก่อนแต้มหมดอายุ",
      ],
      sections: [
        {
          heading: "FIFO expiry",
          body: "แต้มที่ได้รับก่อนจะหมดอายุก่อนเสมอ (First-In-First-Out) เมื่อสมาชิกใช้แต้ม ระบบจะ debit จากกลุ่มแต้มที่จะหมดอายุเร็วที่สุดก่อน เพื่อช่วยสมาชิกรักษาแต้มที่หมดอายุช้ากว่า",
        },
      ],
      edgeCase: {
        title: "แต้มหมดอายุระหว่างกระบวนการแลกรางวัล",
        tags: ["expiry", "redemption", "edge-case"],
        body: [
          "ถ้าแต้มหมดอายุในช่วงที่ redemption order อยู่ใน `points_locked` state แต้มที่ lock ไว้จะถือว่ายัง valid จนกว่า lock จะหมดหรือ redemption จะสำเร็จ ระบบไม่ expire แต้มที่อยู่ใน lock เพราะสมาชิกกำลังดำเนินการแลกอยู่",
          "ถ้า redemption ถูก cancel และแต้มคืนกลับมาหลังจาก expiry date ผ่านไปแล้ว แต้มที่คืนมาจะหมดอายุทันทีในรอบ expiry batch ถัดไป ไม่ได้ต่ออายุให้ใหม่เพียงเพราะผ่านกระบวนการ lock/unlock",
        ],
      },
    },
    {
      slug: "tier-downgrade-grace-policy",
      title: "นโยบาย Grace Period เมื่อ Tier ลดระดับ",
      tags: ["tier", "downgrade", "grace-period", "policy"],
      isPrimary: true,
      intro: [
        "สมาชิกที่ยอดแต้มสะสมรอบปีต่ำกว่า threshold ของ tier ปัจจุบันจะได้รับ grace period `DOWNGRADE_GRACE_PERIOD_DAYS` วันก่อน tier จะลดจริง ช่วงนี้สมาชิกยังใช้สิทธิ์ tier เดิมได้ทุกอย่างและยังมีโอกาสกลับมาถึง threshold",
        "grace period เริ่มนับจากวันที่ประเมิน tier พบว่าต่ำกว่า threshold ครั้งแรก ถ้าสมาชิกกลับขึ้นมาเองก่อน grace period หมด grace period จะยุติโดยอัตโนมัติโดยไม่ต้องทำ formal request",
      ],
      edgeCase: {
        title: "Grace Period ซ้อนกัน (Multi-Level Downgrade)",
        tags: ["tier", "downgrade", "edge-case"],
        body: [
          "สมาชิกที่ลดจาก Platinum ลงมาอาจถึง threshold ต่ำกว่า Gold ด้วยในคราวเดียว ระบบจะให้ grace period สำหรับ Platinum ก่อน ถ้าพ้น grace period แล้วยังต่ำกว่า Gold threshold จึงให้ grace period ของ Gold ต่อ ไม่รัน grace period สองชั้นพร้อมกัน เพราะ stack สองชั้นในครั้งเดียวทำให้สมาชิกสับสนเรื่องสถานะ",
          "ข้อยกเว้น: ถ้าสมาชิกยืนยันว่าต้องการ downgrade เองและสละสิทธิ์ grace period (ผ่านหน้า account settings) ระบบจะ downgrade ทันทีโดยไม่รอ",
        ],
      },
    },
    {
      slug: "partner-conversion-policy",
      title: "นโยบาย Conversion Rate แต้มจาก Partner",
      tags: ["partner", "conversion", "points", "policy"],
      isPrimary: true,
      intro: [
        "แต้มที่ได้จากการซื้อผ่าน partner brand ใช้ conversion rate ตามสัญญาของ partner แต่ละราย ซึ่งอาจต่างจากอัตรา default ของ {{ref:policy:points-earning-rate-policy}} — partner ประเภท airline อาจแปลง 1 mile เป็น 2 PointsVault points ในขณะที่ partner ประเภท hotel อาจ 1:1",
        "{{ref:module:partner-sync}} ส่งค่า raw transaction amount มาพร้อม `partnerId` ให้ {{ref:module:points-ledger}} เป็นผู้ apply conversion rate ที่ถูกต้อง ไม่ใช่ให้ partner คำนวณ points มาเอง เพื่อรักษา single source of truth ของ conversion rule",
      ],
      sections: [
        {
          heading: "Pending confirmation window",
          body: "แต้มจาก partner อยู่ใน pending สูงสุด `PENDING_CREDIT_TTL_HOURS` ก่อนยืนยัน ถ้า partner ไม่ยืนยันในเวลานั้น pending credit จะถูก void อัตโนมัติ และสมาชิกจะได้รับแจ้งเตือน",
        },
      ],
      edgeCase: {
        title: "Conversion Rate เปลี่ยนระหว่าง Pending Window",
        tags: ["partner", "conversion", "edge-case"],
        body: [
          "ถ้า conversion rate ของ partner เปลี่ยนแปลงระหว่างที่ transaction อยู่ใน pending window ระบบจะใช้ rate ณ เวลาที่ transaction เข้ามา ไม่ใช่ rate ณ เวลาที่ยืนยัน เพราะการเปลี่ยน rate ย้อนหลังกับ transaction ที่สมาชิกตัดสินใจซื้อไปแล้วเป็นเรื่องไม่ยุติธรรม",
          "การเปลี่ยน rate ใหม่มีผลกับ transaction ที่เข้ามาหลังจากเวลาที่ประกาศเปลี่ยน rate เท่านั้น ทีมต้องระบุ effective timestamp ให้ชัดเจนเมื่ออัปเดต partner conversion config",
        ],
      },
    },
    {
      slug: "bonus-campaign-eligibility-policy",
      title: "นโยบายการเข้าร่วม Bonus Campaign",
      tags: ["campaign", "bonus", "eligibility", "policy"],
      isPrimary: true,
      intro: [
        "Bonus campaign คือช่วงเวลาพิเศษที่สมาชิกได้แต้มเพิ่มจากอัตราปกติ (เช่น 2x หรือ 3x points) แต่ไม่ใช่ทุก campaign เปิดให้ทุก tier — campaign บางรายการกำหนดให้เฉพาะ Gold ขึ้นไปหรือ Platinum เท่านั้น",
        "สมาชิกที่อยู่ใน tier downgrade grace period ใช้สิทธิ์ campaign ตาม tier ปัจจุบัน (ก่อน downgrade จริง) ดู {{ref:policy:tier-downgrade-grace-policy}} เพื่อความสอดคล้องกับนโยบาย grace period โดยรวม",
      ],
      sections: [
        {
          heading: "Double-dipping กับ partner multiplier",
          body: "สมาชิกที่ซื้อผ่าน partner ระหว่าง bonus campaign จะได้ทั้ง partner conversion rate ตาม {{ref:policy:partner-conversion-policy}} และ campaign multiplier ซ้อนกัน ซึ่งเป็นพฤติกรรมตั้งใจ ทั้งสองคำนวณแยกและรวมกันภายใต้เพดาน `MAX_SINGLE_CREDIT_POINTS` ต่อ transaction",
        },
      ],
      edgeCase: {
        title: "Campaign Eligibility เมื่อ Tier เพิ่งเปลี่ยนระหว่าง Campaign",
        tags: ["campaign", "tier", "edge-case"],
        body: [
          "สมาชิกที่ upgrade tier ระหว่างช่วง campaign ที่กำลังดำเนินอยู่ จะได้สิทธิ์ campaign ใน tier ใหม่ทันทีสำหรับ transaction ที่ทำหลัง upgrade เพราะ tier ใหม่มีสิทธิ์ดีกว่าหรือเท่ากับ tier เดิม",
          "สมาชิกที่ downgrade tier ระหว่าง campaign ใช้สิทธิ์ tier เดิมตาม grace period จนกว่า grace period จะสิ้นสุดหรือ campaign จบก่อน แล้วแต่อย่างใดจะมาถึงก่อน",
        ],
      },
    },
    {
      slug: "tier-upgrade-policy",
      title: "นโยบายการ Upgrade Tier",
      tags: ["tier", "upgrade", "policy"],
      isPrimary: false,
      intro: [
        "สมาชิกจะ upgrade tier โดยอัตโนมัติเมื่อยอดแต้มสะสมรอบปีปัจจุบันถึง threshold ของ tier ถัดไป โดยไม่ต้องรอ batch รายสัปดาห์ — {{ref:module:tier-calculator}} subscribe `points.credited` และประเมินทันทีเมื่อแต้มเข้า",
        "การ upgrade มีผลทันทีในทุก service ที่ดู tier status ผ่าน {{ref:module:tier-calculator}} benefit ใหม่เช่น early access offer และ redemption privileges จะใช้ได้ทันทีโดยไม่ต้องรอ session refresh",
      ],
    },
    {
      slug: "reward-catalog-policy",
      title: "นโยบายการจัดการ Reward Catalog",
      tags: ["reward", "catalog", "policy"],
      isPrimary: false,
      intro: [
        "Reward catalog แสดงรายการรางวัลที่สมาชิกสามารถแลกแต้มได้ แต่ละรายการมีราคาแต้ม stock จำกัด (สำหรับ physical reward) และ tier requirement — catalog อัปเดตโดย team ทุกต้นเดือนและเมื่อมีรางวัลใหม่เพิ่ม",
        "รางวัลที่ stock หมดจะ auto-hide จาก catalog สำหรับสมาชิกทั่วไป แต่ยังแสดงในหน้า admin เพื่อติดตามสถิติ Platinum สามารถ join waitlist สำหรับ out-of-stock reward ได้",
      ],
    },
    {
      slug: "member-suspension-policy",
      title: "นโยบายการ Suspend บัญชีสมาชิก",
      tags: ["member", "suspension", "abuse", "policy"],
      isPrimary: false,
      intro: [
        "บัญชีที่พบพฤติกรรมผิดปกติ เช่น redemption rate สูงผิดสัดส่วนกับ earning pattern หรือมีหลายบัญชีใช้ข้อมูลร่วมกัน จะถูก flag ให้ทีม fraud review ก่อนระงับ ไม่ระงับอัตโนมัติทันทีเพราะ false positive กระทบสมาชิกจริง",
        "ระหว่างรอ review บัญชีที่ถูก flag จะถูก lock เฉพาะ redemption เท่านั้น earning ยังทำงานปกติเพื่อไม่ให้กระทบกรณีที่สุดท้ายพบว่าไม่ใช่ fraud",
      ],
    },
    {
      slug: "offer-opt-out-policy",
      title: "นโยบาย Opt-out จาก Personalized Offer",
      tags: ["offer", "opt-out", "privacy", "policy"],
      isPrimary: false,
      intro: [
        "สมาชิกสามารถ opt-out จากการรับ personalized offer ที่ใช้ข้อมูลพฤติกรรมการซื้อได้ทุกเมื่อผ่านหน้า account settings โดยไม่กระทบการรับแต้มหรือ tier status",
        "สมาชิกที่ opt-out ยังรับ offer ประเภท tier-based ได้ตามปกติ เพราะ offer กลุ่มนี้ขึ้นกับ tier ไม่ใช่ behavior profile",
      ],
    },
    {
      slug: "data-retention-policy",
      title: "นโยบายการเก็บข้อมูล Transaction ประวัติศาสตร์",
      tags: ["data", "retention", "compliance", "policy"],
      isPrimary: false,
      intro: [
        "ข้อมูล point transaction ทั้งหมดเก็บไว้ตลอดไปในรูปแบบ append-only เพื่อรองรับการตรวจสอบย้อนหลัง ข้อมูล personal data ของสมาชิกที่ปิดบัญชีจะถูก anonymize หลัง 2 ปี แต่ยอด transaction ยังคงอยู่ในรูปแบบ anonymized เพื่อความถูกต้องทางบัญชี",
        "ข้อมูลที่เกิน 7 ปีจะถูก archive ไปยัง cold storage โดยอัตโนมัติ ยังเรียกดูได้แต่ช้ากว่า ทีม compliance เป็นผู้กำหนด archive schedule ตาม regulation ของแต่ละ market",
      ],
    },
  ],
  incidents: [
    {
      slug: "points-double-credit-from-retry",
      title: "แต้ม double credit จากการ retry ของ partner",
      tags: ["points", "double-credit", "partner"],
      summary:
        "สมาชิกกลุ่มหนึ่งได้รับแต้มสองเท่าจากการซื้อชุดเดียวกัน ตรวจพบเมื่อทีม finance สังเกตเห็น point liability พุ่งผิดปกติในวันเดียว",
      investigation:
        "ตรวจ {{ref:module:partner-sync}} พบว่า partner รายหนึ่ง retry webhook ส่งซ้ำเพราะไม่ได้รับ acknowledgment ทันเวลา ขณะที่ {{ref:module:points-ledger}} รับ request แรกสำเร็จแต่ response timeout ก่อน partner จะรับ",
      cause:
        "idempotency key ที่ partner ส่งมาในครั้งที่สองต่างจากครั้งแรก เพราะ partner generate key ใหม่เมื่อ retry ทำให้ระบบถือว่าเป็น transaction ใหม่แทนที่จะ deduplicate ด้วย transaction reference ของ partner เอง",
      resolution:
        "ตรวจหา affected accounts ทั้งหมดและ debit แต้มส่วนเกินออก พร้อมแจ้ง partner ให้ใช้ idempotency key เดิมในการ retry ตาม {{ref:policy:partner-conversion-policy}}",
      followup:
        "เพิ่ม secondary deduplication โดยใช้ partner transaction reference แยกจาก idempotency key เพื่อรองรับ partner ที่ generate key ใหม่เมื่อ retry",
    },
    {
      slug: "tier-recalculation-loop",
      title: "Tier recalculation วนซ้ำไม่หยุดหลัง batch job",
      tags: ["tier", "recalculation", "loop"],
      summary:
        "หลัง weekly batch tier evaluation รัน CPU ของ {{ref:module:tier-calculator}} ไม่ลดลงเลยนานกว่า 2 ชั่วโมง ตรวจสอบพบว่ามีการ re-evaluate tier วนซ้ำสำหรับบัญชีกลุ่มเดิม",
      investigation:
        "ตรวจ log พบว่า `evaluateTierChange` publish `tier.downgraded` event ซึ่ง {{ref:module:offer-personalizer}} subscribe แล้ว call endpoint ที่มี side effect ทำให้ tier-calculator re-evaluate อีกครั้ง",
      cause:
        "offer-personalizer เรียก endpoint refresh offer ซึ่ง code path หนึ่งในนั้น trigger tier evaluation อีกรอบ bug เกิดจาก refactor ที่ไม่ได้ตรวจ call graph ครบ",
      resolution:
        "หยุด offer-personalizer ชั่วคราว CPU tier-calculator ลดลงทันที แก้ code path ให้ offer refresh ใช้ read-only endpoint แทน และ rollout ใน batch window ถัดไป",
      followup:
        "เพิ่ม circuit breaker ใน tier-calculator สำหรับ account ที่ถูก evaluate เกิน 3 ครั้งใน 1 นาที เพื่อป้องกัน CPU burn จาก loop ที่อาจเกิดขึ้นในอนาคต",
    },
    {
      slug: "redemption-race-condition",
      title: "แต้มถูก redeem สองครั้งพร้อมกันจาก race condition",
      tags: ["redemption", "race-condition", "points"],
      summary:
        "สมาชิกรายหนึ่งแจ้งว่าถูกตัดแต้มสองครั้งสำหรับรางวัลชิ้นเดียว ตรวจสอบพบว่าเกิดจากการกด confirm สองครั้งติดกันบน mobile app ขณะ network ช้า",
      investigation:
        "ตรวจ log {{ref:module:redemption-engine}} พบ request สอง request ที่มี `orderId` เดียวกันถูก process สำเร็จทั้งคู่ ห่างกัน 800 มิลลิวินาที ซึ่งน้อยกว่า lock TTL ที่กำหนดไว้",
      cause:
        "lock ใช้ `orderId` เป็น key แต่ race condition เกิดก่อน lock ถูกตั้งใน database ช่วงสั้นระหว่าง read สถานะและ write lock ทำให้ request ที่สองเข้ามาทันก่อน lock มีผล",
      resolution:
        "แก้ให้ใช้ atomic compare-and-swap แทน read-then-write ใน `initiateRedemption` deploy hotfix ทันที และ refund แต้มส่วนเกินให้สมาชิกที่ได้รับผลกระทบ",
      followup:
        "ตรวจ `cancelRedemption` และ `confirmRedemption` ว่ามี race condition pattern เดียวกันหรือไม่ และเพิ่ม integration test จำลอง concurrent redemption",
    },
    {
      slug: "expiry-job-running-twice",
      title: "Expiry batch job รันสองครั้งในคืนเดียว",
      tags: ["expiry", "batch", "duplicate"],
      summary:
        "สมาชิกหลายร้อยคนแจ้งว่าแต้มหายมากกว่าที่ควรเป็น ตรวจสอบพบว่า expiry job รันสองรอบในคืนนั้น expire แต้มซ้ำ",
      investigation:
        "ตรวจ cron log ของ {{ref:module:expiry-scheduler}} พบว่า instance ใหม่เริ่มรันทั้งที่ instance เดิมยังไม่เสร็จ เพราะ batch ใช้เวลานานกว่า schedule interval",
      cause:
        "ไม่มี distributed lock ป้องกัน expiry job รันซ้อนกัน ปัญหาไม่เคยเจอก่อนหน้าเพราะ vault ขนาดเล็กกว่า แต่หลังสมาชิกเพิ่มขึ้น 3 เท่าใน 6 เดือน batch ใช้เวลานานขึ้นเกิน schedule",
      resolution:
        "หยุด instance ที่กำลังรันอยู่ทั้งหมด audit affected accounts ทั้งหมด คืนแต้มที่หักเกินไป และเพิ่ม advisory lock ก่อน job เริ่มรัน",
      followup:
        "เพิ่ม advisory lock และ idempotency check โดยใช้ `batchDate` เป็น key ป้องกัน process วันเดิมซ้ำ ดู {{ref:deployment:expiry-job-scheduling-runbook}}",
    },
    {
      slug: "partner-sync-data-mismatch",
      title: "ยอดแต้มจาก partner ไม่ตรงกับที่สมาชิกควรได้",
      tags: ["partner", "sync", "mismatch"],
      summary:
        "สมาชิกที่ซื้อจาก partner รายหนึ่งในช่วงสุดสัปดาห์แจ้งว่าได้แต้มน้อยกว่าที่ควร กระทบสมาชิกประมาณ 300 คน",
      investigation:
        "เปรียบเทียบข้อมูลใน {{ref:module:partner-sync}} กับ transaction log ของ partner พบว่า partner ส่ง transaction amount ผิด format ทำให้ {{ref:module:points-ledger}} คำนวณ points จากตัวเลขที่ต่ำกว่าจริง",
      cause:
        "partner อัปเดต API ของตัวเองโดยเปลี่ยน decimal format โดยไม่แจ้ง PointsVault ล่วงหน้า ทำให้ partner-sync parse ตัวเลขผิด (ตัดทศนิยมทิ้งแทนที่จะ round)",
      resolution:
        "ประสานงานกับ partner ให้ส่ง correction transaction สำหรับ transaction ที่ผิดพลาดทั้งหมด แล้ว credit ส่วนต่างให้สมาชิกที่ได้รับผลกระทบ",
      followup:
        "เพิ่ม schema validation เข้มข้นขึ้นสำหรับ incoming partner data พร้อม automated alerting เมื่อ field format เปลี่ยนจาก pattern ที่เคยเห็น",
    },
    {
      slug: "offer-targeting-wrong-segment",
      title: "Offer ส่งไปผิด segment ระหว่าง campaign ใหญ่",
      tags: ["offer", "targeting", "campaign"],
      summary:
        "ระหว่าง campaign เปิดตัว partner ใหม่ สมาชิก Bronze กว่า 5,000 คนได้รับ offer ที่ตั้งใจจะส่งให้เฉพาะ Gold ขึ้นไป ทำให้ partner ต้องรับ redemption ที่เกิน budget",
      investigation:
        "ตรวจ {{ref:module:offer-personalizer}} พบว่า tier filter ใช้ cache tier status ที่ stale 24 ชั่วโมงแทน live tier จาก {{ref:module:tier-calculator}} ในช่วง campaign launch",
      cause:
        "campaign launch ทำก่อน tier cache refresh รอบถัดไป ทำให้สมาชิกที่เพิ่ง downgrade มาเป็น Bronze แต่ cache ยังแสดง Gold ผ่าน filter และได้รับ offer",
      resolution:
        "ยกเลิก offer ที่ส่งผิดทันทีและแจ้งสมาชิก Bronze ที่ได้รับว่า offer นั้นไม่สามารถใช้ได้ พร้อมขอโทษและให้ compensation offer ที่เหมาะกับ tier จริง",
      followup:
        "บังคับให้ campaign launch ใช้ live tier check แทน cache และเพิ่มขั้นตอน tier verification ก่อน campaign ทุกครั้ง ดู {{ref:policy:bonus-campaign-eligibility-policy}}",
    },
    {
      slug: "points-ledger-balance-mismatch",
      title: "ยอดแต้มใน account ไม่ตรงกับ transaction sum",
      tags: ["points", "balance", "reconciliation"],
      summary:
        "reconciliation job รายสัปดาห์พบว่ามี account ราว 20 บัญชีที่ยอด balance ใน `point_accounts` ต่างจาก sum ของ `point_transactions` เล็กน้อย",
      investigation:
        "ตรวจ log พบว่า balance update ล้มเหลวบางรายการในช่วง DB maintenance window แต่ transaction record ถูก insert ไปแล้วก่อน failure",
      cause:
        "balance update และ transaction insert อยู่ใน transaction เดียวกัน แต่ retry logic ของ application ไม่ครอบคลุมกรณี partial commit ที่เกิดระหว่าง DB failover",
      resolution:
        "ใช้ reconciliation เพื่อ recalculate balance จาก transaction sum แล้ว correct ในทุก affected accounts กระทบน้อยกว่า 0.01% ของ total accounts",
      followup:
        "ย้าย balance management ไปใช้ event sourcing เต็มรูปแบบโดย compute balance on-read จาก transaction log แทนการเก็บ materialized balance ที่อาจ drift",
    },
    {
      slug: "bonus-campaign-double-award",
      title: "Campaign multiplier คำนวณซ้ำสองรอบสำหรับบาง transaction",
      tags: ["campaign", "bonus", "double-award"],
      summary:
        "ระหว่าง 3x bonus campaign สมาชิกกลุ่มหนึ่งได้แต้ม 6x แทน 3x จาก transaction เดียวกัน ตรวจพบจาก monitoring alert ที่ point liability สูงผิดปกติ",
      investigation:
        "ตรวจ {{ref:module:offer-personalizer}} และ {{ref:module:points-ledger}} พบว่า campaign multiplier ถูก apply สองครั้ง: หนึ่งครั้งจาก offer-personalizer และอีกครั้งจาก global campaign rule ใน points-ledger ที่ configure พร้อมกัน",
      cause:
        "ทีม campaign setup ไม่ทราบว่ามีทั้ง offer-level multiplier และ global campaign rule system และ configure ทั้งสองไว้สำหรับ campaign เดียวกัน",
      resolution:
        "ปิด global campaign rule ทันทีและคง offer-level multiplier ไว้ audit affected accounts และ debit แต้มส่วนเกิน",
      followup:
        "เพิ่ม validation ว่า campaign ไม่สามารถมีทั้ง offer-level และ global-level multiplier พร้อมกัน และเพิ่มเอกสาร campaign setup ที่ชัดเจนใน {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "expiry-notification-not-sent",
      title: "Notification แต้มใกล้หมดอายุไม่ถูกส่งช่วงต้นปี",
      tags: ["expiry", "notification", "email"],
      summary:
        "สมาชิกหลายร้อยคนร้องเรียนว่าไม่ได้รับ email แจ้งเตือนแต้มใกล้หมดอายุ ทำให้แต้มหมดโดยที่ไม่รู้ตัว",
      investigation:
        "ตรวจ {{ref:module:expiry-scheduler}} พบว่า notification job รันสำเร็จแต่ email delivery rate ต่ำผิดปกติในช่วงนั้น ตรวจ email provider log พบ delivery queue backed up ต่อเนื่องหลายวัน",
      cause:
        "email provider มีปัญหา capacity ช่วงหลังวันหยุดปีใหม่ที่หลายแพลตฟอร์ม blast email พร้อมกัน PointsVault ไม่มี fallback channel และไม่มี retry logic สำหรับ failed delivery",
      resolution:
        "ขยาย grace period สำหรับแต้มที่หมดอายุในช่วงที่ notification ล้มเหลวออกไป 30 วัน เพื่อให้สมาชิกมีโอกาสใช้แต้มที่ควรได้รับแจ้ง",
      followup:
        "เพิ่ม retry mechanism สำหรับ notification ที่ fail และ fallback ไป SMS สำหรับสมาชิกที่ผูก phone number ไว้ ดู {{ref:policy:points-expiry-policy}}",
    },
    {
      slug: "partner-api-outage-points-lost",
      title: "Partner API down ทำ transaction ค้างในสถานะ pending ถาวร",
      tags: ["partner", "outage", "pending"],
      summary:
        "partner รายหนึ่ง API down 6 ชั่วโมง ทำให้ transaction ในช่วงนั้นค้างเป็น pending และบาง transaction ถูก void โดยอัตโนมัติเมื่อ TTL หมดก่อนที่ partner จะ confirm",
      investigation:
        "ตรวจ {{ref:module:partner-sync}} พบว่า confirmation request ทั้งหมดในช่วง outage fail และไม่ได้ queue ไว้สำหรับ retry เมื่อ partner กลับมา online",
      cause:
        "partner-sync ไม่มี persistent retry queue สำหรับ confirmation — ถ้า partner ไม่ตอบใน request แรก ระบบรอจนหมด TTL แล้ว void ทิ้ง ไม่ได้ retry",
      resolution:
        "ประสานงาน partner ให้ส่ง list ของ transaction ที่ confirm ไปแล้วในระบบของตัวเอง แล้ว manual credit ให้สมาชิกที่ได้รับผลกระทบทั้งหมด",
      followup:
        "เพิ่ม persistent retry queue สำหรับ pending confirmation ที่รอ partner โดยมี exponential backoff และ alert เมื่อ pending backlog สูงผิดปกติ",
    },
    {
      slug: "offer-campaign-wrong-segment-blast",
      title: "Bulk campaign email ส่งไปยังสมาชิกที่ opt-out แล้ว",
      tags: ["offer", "opt-out", "campaign", "email"],
      summary:
        "campaign email ส่งออกไปรวมถึงสมาชิกที่เลือก opt-out จาก personalized offer แล้ว ได้รับ complaint จากสมาชิกและต้องขอโทษอย่างเป็นทางการ",
      investigation:
        "ตรวจ {{ref:module:offer-personalizer}} พบว่า segment filter สำหรับ bulk campaign ไม่ได้ join กับ opt-out list เนื่องจาก campaign นี้ถูก classify เป็น tier-based ไม่ใช่ personalized",
      cause:
        "ทีม campaign ตีความ {{ref:policy:offer-opt-out-policy}} ว่าการ opt-out มีผลเฉพาะ behavior-based offer แต่เนื้อหา campaign นี้แม้จะ tier-based แต่ยังนับเป็น personalized offer",
      resolution:
        "ส่ง apology email ให้สมาชิก opt-out ทุกคนที่ได้รับ campaign นั้น และชี้แจงนโยบาย opt-out ให้ชัดเจนขึ้น",
      followup:
        "แก้ opt-out policy ให้ครอบคลุม tier-based campaign ที่มีเนื้อหา personalized ด้วย และปรับ {{ref:policy:offer-opt-out-policy}} ให้ชัดเจน",
    },
    {
      slug: "redemption-catalog-price-mismatch",
      title: "ราคาแต้มของ reward ใน catalog ต่างจากที่ debit จริง",
      tags: ["redemption", "catalog", "price"],
      summary:
        "สมาชิกหลายคนแจ้งว่าถูกตัดแต้มมากกว่าราคาที่แสดงบน catalog ส่วนต่างเล็กน้อยแต่เกิดกับ reward หลายรายการ",
      investigation:
        "ตรวจสอบพบว่า reward price ใน catalog database และ price ที่ {{ref:module:redemption-engine}} ใช้คนละ source กัน catalog อัปเดตโดยทีม content แต่ redemption-engine cache price ไว้แบบ TTL 6 ชั่วโมง",
      cause:
        "ทีม content อัปเดต reward price ช่วงบ่าย redemption-engine ยัง serve cache เก่าอยู่จนกว่าจะหมด TTL ทำให้ช่วงนั้น debit ตามราคาเก่าที่สูงกว่า",
      resolution:
        "ปรับ TTL cache เป็น 15 นาทีและเพิ่ม cache invalidation event เมื่อ catalog อัปเดต refund ส่วนต่างให้สมาชิกที่ได้รับผลกระทบ",
      followup:
        "ย้ายไปใช้ single source of truth สำหรับ reward price โดย redemption-engine จะ read-through cache แบบ invalidation-based แทน TTL",
    },
    {
      slug: "member-profile-sync-failure",
      title: "Profile สมาชิกไม่ sync ระหว่าง SSO provider กับ PointsVault",
      tags: ["member", "sync", "sso", "profile"],
      summary:
        "สมาชิกบางกลุ่มไม่สามารถ login ได้หลัง SSO provider อัปเดต user schema ทำให้ email field format เปลี่ยน",
      investigation:
        "ตรวจ auth gateway log พบว่า SSO token มี email claim ใน format ใหม่ที่ PointsVault ไม่รู้จัก ทำให้ user lookup ล้มเหลว",
      cause:
        "SSO provider เปลี่ยน email claim key จาก `email` เป็น `preferred_email` โดยไม่แจ้ง migration period ล่วงหน้า",
      resolution:
        "อัปเดต auth middleware ให้รองรับทั้ง `email` และ `preferred_email` claim สมาชิกทุกคน login ได้ปกติหลัง deploy",
      followup:
        "เพิ่ม monitoring สำหรับ auth failure rate และ alert เมื่อสูงกว่า baseline เพื่อตรวจจับ schema change จาก external provider เร็วขึ้น",
    },
    {
      slug: "tier-downgrade-grace-miscalculation",
      title: "Grace period คำนวณผิดทำสมาชิก downgrade เร็วกว่าควร",
      tags: ["tier", "downgrade", "grace-period", "bug"],
      summary:
        "สมาชิก Gold 47 คนถูก downgrade เป็น Silver ก่อนครบ 90 วัน grace period ตามที่กำหนดใน {{ref:policy:tier-downgrade-grace-policy}}",
      investigation:
        "ตรวจ {{ref:module:tier-calculator}} พบว่า grace period คำนวณจากวันที่ประเมิน tier ใน timezone UTC แต่ตัดสิน downgrade ใน timezone ของ member (Asia/Bangkok) ทำให้บัญชีของคนที่อยู่ GMT+7 สั้นไป 7 ชั่วโมง",
      cause:
        "ไม่มี policy ชัดเจนว่า grace period คำนวณด้วย timezone ใด code เขียนโดยสมมติว่าใช้ UTC ทั้งหมด แต่ส่วน downgrade execution ใช้ local time",
      resolution:
        "แก้ให้ใช้ UTC ตลอด และต่อ grace period ให้ affected accounts เท่ากับ timezone offset คืนสถานะ Gold ให้ 47 accounts ที่ถูก downgrade ก่อนกำหนด",
      followup:
        "เพิ่มกฎในเอกสารว่า timestamp ทุกตัวในระบบใช้ UTC เสมอ และเพิ่ม timezone-specific test ใน {{ref:convention:testing-convention}}",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/PV-301-expiry-partial`, `fix/PV-318-redemption-race`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ type prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(redemption-engine): ใช้ atomic compare-and-swap ป้องกัน race condition`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แตะ balance หรือ redemption ต้องมี test concurrent request เสมอ (บทเรียนจาก {{ref:incident:redemption-race-condition}}) และ campaign configuration ต้องได้รับ second review ก่อน activate (บทเรียนจาก {{ref:incident:bonus-campaign-double-award}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `creditPoints`, `evaluateTierChange` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยา action ชัดเจน ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ของ member", body: "`accountId` เป็น UUID ภายใน ต่างจาก `memberId` ที่แสดงต่อสมาชิก — ห้ามใช้แทนกันในโค้ด ต้องแยก mapping ชัดเจนตลอด" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ transaction ต้องมี `accountId` และ `transactionId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "credit/debit failure log เป็น `error` เสมอ แม้จะเป็น expected business rejection เพราะทีม on-call ต้อง grep เจอง่ายตอน incident" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`PV_<DOMAIN>_<REASON>` เช่น `PV_REDEMPTION_INSUFFICIENT_POINTS`, `PV_TIER_GRACE_PERIOD_ACTIVE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`PV_LEDGER_BALANCE_NEGATIVE`, `PV_PARTNER_PENDING_TIMEOUT`, `PV_CAMPAIGN_NOT_ELIGIBLE` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Idempotency test บังคับ", body: "ฟังก์ชัน credit และ redemption ทุกตัวต้องมี test ยิง request เดิมสองครั้งและยืนยันว่าผลลัพธ์เหมือนกัน บทเรียนจาก {{ref:incident:points-double-credit-from-retry}}" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะ balance lock ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัว เพื่อตรวจ race condition" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` — `error` เป็น `null` เมื่อสำเร็จ `data` เป็น `null` เมื่อ error ไม่ปนกันในผลเดียวกัน" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} ห้ามส่ง stack trace หรือ DB error message ออกไปตรงๆ" },
      ],
    },
    {
      slug: "points-audit-trail-convention",
      title: "Points Audit Trail Convention",
      tags: ["audit", "points", "compliance"],
      intro: "ทุก credit และ debit ต้องมี audit trail ที่ตรวจสอบย้อนหลังได้ตลอดเวลา — เอกสารนี้กำหนดว่า field อะไรต้องอยู่ใน transaction record ทุกรายการ",
      sections: [
        { heading: "Required fields", body: "`transactionId`, `accountId`, `type`, `amount`, `balanceAfter`, `source`, `createdAt`, `requestedBy` — ขาดตัวใดตัวหนึ่งถือว่า incomplete record ต้องไม่ commit transaction นั้น" },
        { heading: "Immutability", body: "transaction record ที่ commit แล้วต้องไม่ถูกแก้ไขหรือลบเด็ดขาด ถ้าต้องแก้ไขผลลัพธ์ต้องทำโดยการ insert transaction ใหม่ (reversal) แทน" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (รวม concurrent redemption test และ idempotency test) → deploy staging → smoke test → deploy production ทีละ service" },
        { heading: "Gate พิเศษ", body: "{{ref:module:redemption-engine}} และ {{ref:module:points-ledger}} ต้องผ่าน idempotency test และ concurrent request test ก่อน merge เสมอ" },
      ],
    },
    {
      slug: "points-ledger-migration-runbook",
      title: "Points Ledger Migration Runbook",
      tags: ["migration", "runbook", "database"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อเพิ่ม column ใน `point_transactions` หรือ `point_accounts` ต้องทำ online migration เพราะตารางขนาดใหญ่และมี write ตลอดเวลา" },
        { heading: "ขั้นตอน", body: "1) เพิ่ม column แบบ nullable ก่อน 2) backfill ใน batch ไม่เกิน 5,000 rows ต่อ batch ห่างกัน 100ms 3) เพิ่ม NOT NULL constraint เมื่อ backfill เสร็จ 4) deploy code ที่ใช้ column ใหม่" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = double credit หรือ redemption ผิดพลาด mass, Sev2 = partner sync down หรือ expiry job ล้มเหลว, Sev3 = monitoring alert ที่รอได้" },
        { heading: "กรณี double credit หรือ double debit", body: "ทุกเหตุการณ์ที่กระทบ balance ของสมาชิกต้องยกระดับเป็น Sev1 ทันทีและเขียน postmortem พร้อม root cause analysis ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "point liability เพิ่มเกิน 5% ใน 1 ชั่วโมง (อาจเป็น double credit), redemption failure rate สูงกว่า 1%, expiry job ไม่เสร็จภายใน 3 ชั่วโมง, partner sync error rate สูงกว่า 2%" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1 ปลุก on-call ทันที, Sev2 แจ้งใน 30 นาที, Sev3 รวม digest รายชั่วโมง" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า credit/debit error rate พุ่งขึ้น หรือ point liability เพิ่มผิดปกติ ต้อง rollback ทันทีโดยไม่รอ approval บทเรียนจาก {{ref:incident:points-double-credit-from-retry}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้าผ่าน pipeline เดิม ตรวจ point_transactions หลัง rollback ว่ายังสอดคล้องกับ balance แล้วแจ้งทีมที่เกี่ยวข้อง" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling", body: "| Service | Min replica | Max replica | Scale-up trigger |\n|---|---|---|---|\n| points-ledger | 3 | 12 | CPU > 70% หรือ write QPS > 500 |\n| redemption-engine | 2 | 8 | pending redemption > 200 |\n| expiry-scheduler | 1 | 1 | ไม่ scale — singleton batch |" },
        { heading: "Batch window", body: "expiry-scheduler และ tier batch รันช่วง 00:00-02:00 ซึ่งเป็นช่วง traffic ต่ำ ถ้า job ใดใช้เวลาเกิน 2 ชั่วโมงให้ alert ทีมทันที ดู {{ref:deployment:expiry-job-scheduling-runbook}}" },
      ],
    },
    {
      slug: "partner-sync-deployment-runbook",
      title: "Partner Sync Deployment Runbook",
      tags: ["partner", "sync", "runbook", "deployment"],
      intro: "ขั้นตอนสำหรับ onboard partner ใหม่หรืออัปเดต integration กับ partner เดิม",
      sections: [
        { heading: "Onboard partner ใหม่", body: "1) ตั้ง conversion rate และ `partnerId` ในระบบ 2) ทดสอบ webhook ด้วย test transaction 3) ยืนยัน idempotency ด้วยการ replay test transaction ซ้ำ 4) เปิด production เฉพาะ partner นั้น" },
        { heading: "อัปเดต integration เดิม", body: "ต้องทดสอบ format validation กับ sample payload ใหม่ก่อน deploy บทเรียนจาก {{ref:incident:partner-sync-data-mismatch}} คือ partner อาจเปลี่ยน format โดยไม่แจ้ง" },
      ],
    },
    {
      slug: "expiry-job-scheduling-runbook",
      title: "Expiry Job Scheduling Runbook",
      tags: ["expiry", "batch", "runbook", "scheduling"],
      intro: "ขั้นตอนการ configure และ monitor expiry batch job รวมถึงกระบวนการ recovery เมื่อ job ล้มเหลว",
      sections: [
        { heading: "การตั้ง lock", body: "ก่อน job เริ่มต้องได้ advisory lock ที่ผูกกับ `batchDate` ก่อน ถ้าได้ lock ไม่สำเร็จแสดงว่า job วันนี้กำลังรันอยู่แล้ว ให้ exit ทันทีไม่ต้องรอ บทเรียนจาก {{ref:incident:expiry-job-running-twice}}" },
        { heading: "Recovery เมื่อ job ล้มเหลวกลางทาง", body: "expiry job ออกแบบให้ idempotent — รัน batch เดิมซ้ำในวันถัดไปได้โดยไม่ expire แต้มซ้ำ เพราะแต่ละ account มี `lastExpiredAt` บันทึกวันที่ expire ครั้งล่าสุดไว้" },
      ],
    },
  ],
};
