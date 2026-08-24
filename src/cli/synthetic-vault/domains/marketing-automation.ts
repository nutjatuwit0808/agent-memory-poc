import type { DomainProfile } from "../types.js";

// SendPulse-internal (ชื่อเรียกภายในทีม) — ระบบ email/campaign marketing automation
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const marketingAutomation: DomainProfile = {
  id: "marketing-automation",
  displayName: "Wavecast — ระบบ Email/Campaign Marketing Automation",
  summary: [
    "Wavecast คือแพลตฟอร์มภายในสำหรับสร้าง จัดตาราง และส่ง email campaign ให้ลูกค้าปลายทางของบริษัท ครอบคลุมตั้งแต่การแบ่งกลุ่มผู้รับ (segmentation), การจัดคิวส่ง, การเฝ้าระวังอัตราส่งถึงกล่องจดหมาย (deliverability), ไปจนถึงการจัดการ consent และ unsubscribe ให้สอดคล้องกับกฎหมายคุ้มครองข้อมูลส่วนบุคคลแบบ GDPR",
    "ระบบต้องรักษาสมดุลระหว่างความเร็วในการส่ง (ทีม marketing อยากส่งให้เร็วที่สุด) กับความเสี่ยงด้าน deliverability และ compliance (ส่งเร็วเกินไปหรือส่งผิดกลุ่มทำให้โดน ESP (Email Service Provider) ขึ้น blacklist หรือละเมิดสิทธิ์ opt-out ของผู้รับ) ทีมวิศวกรรมเรียกช่วงเวลาที่มี campaign ใหญ่หลายตัวคิวพร้อมกันว่า send window contention",
  ],
  domainTags: ["marketing-automation", "wavecast"],
  serviceBoundaryNote: [
    "{{ref:module:segment-engine}} เป็นเจ้าของ audience segment ทั้งหมด ไม่รู้จัก concept ของ campaign หรือ template เลย — รู้แค่ว่า contact คนไหนอยู่ segment ไหนตามเงื่อนไขล่าสุด {{ref:module:campaign-builder}} เป็นคนดึง segment มาผูกกับ campaign ตอนสร้างเท่านั้น",
    "{{ref:module:send-scheduler}} เป็น service เดียวที่ query ทั้ง {{ref:module:campaign-builder}} และ {{ref:module:consent-manager}} พร้อมกันตอนใกล้เวลาส่งจริง (ข้อยกเว้นที่ตั้งใจ) เพราะต้องเช็คทั้งเนื้อหา campaign และสถานะ consent ล่าสุดของผู้รับแต่ละคน ณ วินาทีที่จะส่งจริง ไม่ใช่ ณ ตอนสร้าง campaign — ถ้าแยก query สองรอบจะเสี่ยงส่งให้คนที่เพิ่ง unsubscribe ไปหมาดๆ",
  ],
  apiGatewayNote: [
    "คำสั่งจากทีม marketing ผ่าน admin console เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำสั่ง เช่น \"สร้าง campaign ใหม่\" เป็นการเรียก {{ref:module:campaign-builder}} คำขอที่ต้องการผลทันที เช่น preview เนื้อหา template ใช้ synchronous call",
    "Webhook ขาเข้าจาก ESP ภายนอก (bounce, complaint, blacklist event) ไม่ผ่าน API gateway ตัวเดียวกับ admin console — มี endpoint แยกที่ validate signature ของ ESP เองก่อนส่งเข้าคิว เพราะ volume ของ webhook ประเภทนี้สูงกว่าคำขอภายในมาก และต้องรับได้แม้ admin console จะล่ม",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:campaign-builder}} ดูแล ได้แก่ `campaigns` (metadata และเนื้อหาของแต่ละ campaign) และ `campaign_versions` (ประวัติการแก้ไข ไม่ลบทิ้งเพื่อ audit ว่าเนื้อหาไหนถูกส่งจริงตอนไหน)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `campaigns` | campaign-builder | เนื้อหาและการตั้งค่า campaign |\n| `segments` | segment-engine | นิยามและ snapshot สมาชิกล่าสุดของแต่ละ segment |\n| `send_jobs` | send-scheduler | คิวส่งจริง แบ่งเป็น batch |\n| `consent_records` | consent-manager | สถานะ opt-in/opt-out ต่อ contact ต่อ channel |",
    "ทุกตารางใช้ `contactId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `campaign.scheduled`, `send.batch_dispatched`, `send.bounced`, `send.complained`, `consent.opted_out`, `deliverability.domain_flagged` — {{ref:module:send-scheduler}} เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อผลลัพธ์ของ batch ที่ตัวเองส่งไป",
    "{{ref:module:consent-manager}} subscribe `send.complained` โดยตรงเพื่อพิจารณา auto-suppress ผู้รับที่ complain ซ้ำหลายครั้ง โดยไม่ต้องรอให้ {{ref:module:deliverability-monitor}} ประมวลผลภาพรวมก่อน ออกแบบแบบนี้เพื่อให้การป้องกันสิทธิ์ผู้รับทำงานได้เร็วที่สุดแม้ deliverability-monitor จะล่ม",
  ],
  modules: [
    {
      slug: "campaign-builder",
      name: "campaign-builder",
      tags: ["campaign", "module", "core"],
      description:
        "จุดสร้างและแก้ไข campaign ทั้งหมด ผูก template, segment เป้าหมาย, และตารางเวลาส่งเข้าด้วยกันเป็น draft ก่อนส่งต่อให้ {{ref:module:send-scheduler}} แยกออกมาจาก monolith เดิมตั้งแต่ปลายปี 2024 เพราะ logic การ validate เนื้อหาก่อนส่ง (เช่น ต้องมีลิงก์ unsubscribe เสมอ) ซับซ้อนขึ้นเรื่อยๆ",
      functions: [
        { sig: "createCampaignDraft(name: string, segmentId: string, templateId: string): Promise<Campaign>", desc: "สร้าง draft ใหม่ ผูก segment และ template เข้าด้วยกัน" },
        { sig: "validateCampaign(campaignId: string): Promise<ValidationResult>", desc: "ตรวจว่า campaign พร้อมส่งจริงหรือไม่ (มีลิงก์ unsubscribe, ไม่มี segment ว่างเปล่า ฯลฯ)" },
        { sig: "scheduleCampaign(campaignId: string, sendAt: string): Promise<void>", desc: "ยืนยันตารางเวลาส่งแล้วส่ง event ให้ {{ref:module:send-scheduler}} รับช่วงต่อ" },
        { sig: "cloneCampaign(campaignId: string): Promise<Campaign>", desc: "สร้าง draft ใหม่จาก campaign เดิม ใช้บ่อยสำหรับ campaign ประจำ (newsletter รายสัปดาห์)" },
      ],
      stateFlow: "draft → validated → scheduled → sending → completed | failed — ดู {{ref:policy:campaign-scheduling-window-policy}} สำหรับเงื่อนไขช่วงเวลาที่ส่งได้",
      relatedNotes:
        "ไม่แตะ segment membership โดยตรง — เรียก {{ref:module:segment-engine}} เพื่ออ่าน snapshot ล่าสุดตอน validate เท่านั้น ไม่ cache สมาชิกไว้เองในตาราง `campaigns` เพื่อป้องกันปัญหาข้อมูลเก่าค้าง ดู {{ref:incident:wrong-segment-send-stale-cache}} สำหรับเหตุการณ์ที่เคยเกิดจากการ cache ผิดจุด",
      internals: {
        constants: [
          { name: "MAX_CAMPAIGN_DRAFT_AGE_DAYS", value: "90" },
          { name: "MIN_SCHEDULE_LEAD_MINUTES", value: "15" },
        ],
        typeSnippet:
          "interface Campaign {\n  campaignId: string;\n  status: \"draft\" | \"validated\" | \"scheduled\" | \"sending\" | \"completed\" | \"failed\";\n  segmentId: string;\n  templateId: string;\n  sendAt: string | null;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:campaign-scheduling-window-policy}}",
      },
    },
    {
      slug: "segment-engine",
      name: "segment-engine",
      tags: ["segment", "module", "core"],
      description:
        "คำนวณสมาชิกของแต่ละ audience segment ตามเงื่อนไขที่ทีม marketing ตั้งไว้ (เช่น \"ซื้อในช่วง 30 วันล่าสุด และไม่เคย unsubscribe\") แยกออกมาเป็น service อิสระเพราะการคำนวณ segment ขนาดใหญ่ (หลายล้าน contact) ใช้ CPU สูงมากและไม่ควรบล็อก request อื่นของระบบ",
      functions: [
        { sig: "defineSegment(name: string, rules: SegmentRule[]): Promise<Segment>", desc: "สร้างนิยาม segment ใหม่จากเงื่อนไขที่กำหนด" },
        { sig: "recomputeSegment(segmentId: string): Promise<SegmentSnapshot>", desc: "คำนวณสมาชิกใหม่ทั้งหมดตามเงื่อนไขปัจจุบัน สร้าง snapshot ใหม่" },
        { sig: "getSegmentSnapshot(segmentId: string): Promise<SegmentSnapshot>", desc: "คืน snapshot ล่าสุดที่คำนวณไว้ ไม่คำนวณใหม่ทุกครั้งที่เรียกเพราะแพงเกินไป" },
      ],
      relatedNotes:
        "snapshot แต่ละอันมี `computedAt` timestamp เสมอ — {{ref:module:campaign-builder}} ต้องเช็คว่า snapshot สดพอก่อนใช้งานตาม {{ref:policy:segment-freshness-policy}} ไม่ใช่ใช้ snapshot เก่าโดยไม่ตรวจสอบ",
    },
    {
      slug: "send-scheduler",
      name: "send-scheduler",
      tags: ["scheduling", "module", "core"],
      description:
        "จัดคิวและส่ง campaign จริงตามเวลาที่กำหนด แบ่งผู้รับเป็น batch ย่อยเพื่อควบคุมอัตราการส่งไม่ให้เกิน rate limit ของ ESP เป็น service เดียวที่ query ข้าม {{ref:module:campaign-builder}} และ {{ref:module:consent-manager}} พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู {{ref:arch:boundaries}})",
      functions: [
        { sig: "enqueueSendJob(campaignId: string, sendAt: string): Promise<string>", desc: "สร้าง send job เข้าคิว คืน jobId" },
        { sig: "dispatchNextBatch(jobId: string): Promise<BatchResult>", desc: "ส่ง batch ถัดไปตาม rate limit ที่กำหนด" },
        { sig: "pauseSendJob(jobId: string, reason: string): Promise<void>", desc: "หยุด job ชั่วคราว เช่น เจอ bounce rate สูงผิดปกติกลาง batch" },
      ],
      stateFlow: "queued → sending → completed | paused | failed",
      relatedNotes:
        "ก่อน `dispatchNextBatch` แต่ละครั้งต้อง re-check สถานะ consent ล่าสุดจาก {{ref:module:consent-manager}} เสมอ ไม่ใช้ snapshot ตอนสร้าง job เพราะผู้รับอาจ unsubscribe ไปแล้วระหว่างที่ job ยังส่งไม่ครบ ดู {{ref:policy:send-rate-throttle-policy}}",
      internals: {
        constants: [
          { name: "SEND_BATCH_SIZE", value: "5000" },
          { name: "SEND_RATE_LIMIT_PER_MINUTE", value: "50000" },
        ],
        typeSnippet:
          "interface BatchResult {\n  jobId: string;\n  batchIndex: number;\n  sent: number;\n  suppressed: number;\n  failed: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง throttle ที่ {{ref:policy:send-rate-throttle-policy}}",
      },
    },
    {
      slug: "deliverability-monitor",
      name: "deliverability-monitor",
      tags: ["deliverability", "module"],
      description:
        "เฝ้าระวังอัตรา bounce, complaint, และสถานะ blacklist ของ sending domain แบบ real-time ระหว่างและหลังการส่ง เป็น service เดียวที่มีสิทธิ์สั่ง `pauseSendJob` โดยอัตโนมัติโดยไม่ต้องรอคนอนุมัติ เพราะความเสี่ยงต่อ sender reputation กระทบทุก campaign ในอนาคต ไม่ใช่แค่ campaign ปัจจุบัน",
      functions: [
        { sig: "evaluateBounceRate(jobId: string): Promise<DeliverabilityStatus>", desc: "ประเมิน bounce rate ของ batch ที่ส่งไปล่าสุดเทียบกับ threshold" },
        { sig: "checkDomainBlacklist(domain: string): Promise<BlacklistStatus>", desc: "เช็คสถานะ blacklist ของ sending domain กับ ESP reputation service ภายนอก" },
        { sig: "triggerSendPause(jobId: string, reason: string): Promise<void>", desc: "สั่งหยุด send job ทันทีเมื่อ metric เกินเกณฑ์อันตราย" },
      ],
      relatedNotes:
        "การสั่ง pause ไม่ผ่าน {{ref:module:campaign-builder}} เลย เพื่อลด latency ของการตอบสนอง ดู {{ref:policy:deliverability-suppression-policy}} สำหรับเกณฑ์ที่ใช้ตัดสินใจ",
    },
    {
      slug: "template-renderer",
      name: "template-renderer",
      tags: ["template", "module"],
      description:
        "แปลง template (HTML + variable placeholder เช่น `{{firstName}}`) เป็นเนื้อหาจริงต่อผู้รับแต่ละคนตอนใกล้เวลาส่ง ไม่ render ล่วงหน้าทั้งหมดตอนสร้าง campaign เพราะ segment ขนาดใหญ่จะกิน storage มหาศาลถ้าเก็บ HTML แยกทุกคน",
      functions: [
        { sig: "renderForContact(templateId: string, contactId: string): Promise<string>", desc: "render HTML สุดท้ายสำหรับผู้รับคนเดียว แทนที่ placeholder ด้วยข้อมูลจริง" },
        { sig: "validateTemplateSyntax(templateId: string): Promise<TemplateValidationResult>", desc: "ตรวจ syntax placeholder ก่อนบันทึก template ใหม่ ป้องกัน placeholder พิมพ์ผิดหลุดไปถึงลูกค้า" },
      ],
      relatedNotes:
        "ถูกเรียกโดย {{ref:module:send-scheduler}} ตอน `dispatchNextBatch` เท่านั้น ไม่ถูกเรียกตรงจาก {{ref:module:campaign-builder}} ยกเว้นตอน preview ซึ่งใช้ contact ตัวอย่างสมมติ ไม่ใช่ contact จริง",
    },
    {
      slug: "consent-manager",
      name: "consent-manager",
      tags: ["consent", "compliance", "module", "core"],
      description:
        "เจ้าของสถานะ opt-in/opt-out ของผู้รับทุกคนในทุก channel (email, SMS) เป็นระบบที่ต้อง strict ที่สุดในทั้งแพลตฟอร์มเพราะผูกกับความเสี่ยงทางกฎหมายโดยตรง แยกออกมาเป็น service เดี่ยวตั้งแต่ต้นเพื่อไม่ให้ logic การส่งไปแตะข้อมูล consent โดยไม่ผ่านการตรวจสอบที่รัดกุม",
      functions: [
        { sig: "recordOptOut(contactId: string, channel: string, source: string): Promise<void>", desc: "บันทึกการ unsubscribe ทันที มีผลทุก campaign ที่ยังไม่ส่งออกไป" },
        { sig: "checkConsentStatus(contactId: string, channel: string): Promise<ConsentStatus>", desc: "เช็คสถานะ consent ล่าสุด เรียกได้บ่อยจึงต้อง cache แบบสั้นมากเท่านั้น" },
        { sig: "handleUnsubscribeWebhook(payload: UnsubscribeWebhookPayload): Promise<void>", desc: "รับ webhook คลิก unsubscribe จาก ESP หรือ landing page ภายนอก" },
      ],
      stateFlow: "opted_in → opted_out (ทางเดียว ไม่มี auto re-opt-in โดยไม่มี action ใหม่จากผู้รับ)",
      relatedNotes:
        "{{ref:module:send-scheduler}} query module นี้ตรงก่อนส่งทุก batch เสมอ ไม่มี service อื่นแตะข้อมูล consent ได้เลยแม้แต่การอ่าน ดู {{ref:policy:unsubscribe-honor-policy}} สำหรับ SLA เวลาที่ต้อง honor คำขอ",
      internals: {
        constants: [
          { name: "CONSENT_CACHE_TTL_SECONDS", value: "30" },
          { name: "UNSUBSCRIBE_HONOR_SLA_HOURS", value: "24" },
        ],
        typeSnippet:
          "interface ConsentStatus {\n  contactId: string;\n  channel: \"email\" | \"sms\";\n  status: \"opted_in\" | \"opted_out\";\n  updatedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง SLA การ honor unsubscribe ที่ {{ref:policy:unsubscribe-honor-policy}}",
      },
    },
  ],
  envVarGroups: [
    {
      service: "campaign-builder-service",
      vars: [
        { name: "CAMPAIGN_MIN_SCHEDULE_LEAD_MINUTES", example: "15", note: "ดู {{ref:policy:campaign-scheduling-window-policy}}" },
        { name: "CAMPAIGN_DB_URL", example: "postgres://campaign-db.internal:5432/campaign", note: "secret ห้าม log" },
      ],
    },
    {
      service: "send-scheduler-service",
      vars: [
        { name: "SEND_BATCH_SIZE", example: "5000", note: "" },
        { name: "SEND_RATE_LIMIT_PER_MINUTE", example: "50000", note: "ดู {{ref:policy:send-rate-throttle-policy}}" },
      ],
    },
    {
      service: "deliverability-monitor-service",
      vars: [
        { name: "BOUNCE_RATE_PAUSE_THRESHOLD_PCT", example: "5", note: "เกินนี้สั่ง pause อัตโนมัติ" },
        { name: "ESP_REPUTATION_API_KEY", example: "esp_live_xxx", note: "secret" },
      ],
    },
    {
      service: "consent-manager-service",
      vars: [
        { name: "CONSENT_CACHE_TTL_SECONDS", example: "30", note: "" },
        { name: "UNSUBSCRIBE_HONOR_SLA_HOURS", example: "24", note: "ดู {{ref:policy:unsubscribe-honor-policy}}" },
        { name: "CONSENT_DB_URL", example: "postgres://consent-db.internal:5432/consent", note: "secret ห้าม log" },
      ],
    },
  ],
  policies: [
    {
      slug: "send-rate-throttle-policy",
      title: "นโยบาย Throttle อัตราการส่ง",
      tags: ["send", "throttle", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:send-scheduler}} ส่งไม่เกิน `SEND_RATE_LIMIT_PER_MINUTE` ต่อนาทีเสมอ แบ่งเป็น batch ละ `SEND_BATCH_SIZE` เพื่อไม่ให้ ESP ปลายทางมองว่าเป็น traffic ผิดปกติจนเริ่ม throttle เราเองหรือ flag เป็น spam",
        "ถ้า campaign มีผู้รับมากกว่าที่ส่งได้ภายใน 1 ชั่วโมงตาม rate limit ปัจจุบัน ระบบจะเตือนทีม marketing ตั้งแต่ตอน validate ก่อนกดส่งจริง ไม่ใช่ปล่อยให้ค้นพบตอนส่งจริงแล้วช้ากว่าคาด",
      ],
      sections: [
        {
          heading: "ทำไม rate limit ต่ำกว่าที่ ESP อนุญาตจริง",
          body: "ค่า `SEND_RATE_LIMIT_PER_MINUTE` ตั้งไว้ต่ำกว่าเพดานที่ ESP อนุญาตจริงประมาณ 20% เสมอ เพื่อเผื่อ buffer สำหรับ traffic อื่นที่อาจใช้ ESP เดียวกันพร้อมกัน (เช่น transactional email จากระบบอื่น) และเพื่อไม่ให้การส่งของเราไปกระทบ sender reputation ของทั้งบริษัทถ้าคำนวณผิดพลาด",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Backlog สะสมจากการ Pause กลาง Batch",
        tags: ["send", "throttle", "edge-case"],
        body: [
          "ถ้า job ถูก `pauseSendJob` กลางทางจาก {{ref:module:deliverability-monitor}} แล้วกลับมาส่งต่อ ระบบจะไม่เร่งอัตราส่งเพื่อ \"ไล่ตาม\" เวลาที่เสียไป — ยังคงส่งตาม rate limit ปกติเพื่อไม่ให้ metric ที่ทำให้ pause แต่แรกแย่ลงไปอีก",
          "campaign ที่ผู้รับส่วนใหญ่เป็นลูกค้า tier สูง (`vip` segment) ได้รับสิทธิ์ priority queue แยกที่ไม่ต้องรอ backlog ของ campaign อื่นที่คิวอยู่ก่อน แต่ยังอยู่ภายใต้ rate limit เดียวกันเสมอ ไม่มีข้อยกเว้นเรื่อง rate",
        ],
      },
    },
    {
      slug: "unsubscribe-honor-policy",
      title: "นโยบาย SLA การ Honor คำขอ Unsubscribe",
      tags: ["consent", "compliance", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:consent-manager}} ต้องบันทึกคำขอ unsubscribe และมีผลกับทุก send job ที่ยังไม่ dispatch ภายใน `UNSUBSCRIBE_HONOR_SLA_HOURS` (ค่าปกติ 24 ชั่วโมง) แต่ในทางปฏิบัติ `recordOptOut` มีผลทันทีแบบ synchronous ไม่รอถึง SLA เพราะ SLA เป็นแค่เพดานสูงสุดที่กฎหมายกำหนด ไม่ใช่เป้าหมายที่ตั้งใจไปถึง",
        "batch ที่กำลัง `dispatchNextBatch` อยู่พอดีตอนที่มีคำขอ unsubscribe เข้ามา อาจส่งไปแล้วก่อนที่จะเช็คสถานะใหม่ทัน — กรณีนี้ไม่ถือว่าละเมิดนโยบายตราบใดที่ batch ถัดไปเช็คสถานะใหม่ก่อนส่งเสมอ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Unsubscribe ผ่าน Suppression List นำเข้าจากภายนอก",
        tags: ["consent", "compliance", "edge-case"],
        body: [
          "รายชื่อ suppression list ที่นำเข้าจากหน่วยงานภายนอก (เช่น national do-not-email registry) ไม่ผ่าน SLA 24 ชั่วโมงปกติ — ต้อง apply ก่อนส่ง batch ถัดไปทันทีเสมอโดยไม่มีข้อยกเว้น เพราะความเสี่ยงทางกฎหมายสูงกว่าคำขอ unsubscribe ทั่วไป",
          "ถ้า contact คนเดียวมีสถานะขัดแย้งกันระหว่าง consent ที่บันทึกในระบบกับ suppression list ภายนอก suppression list ชนะเสมอไม่ว่า timestamp ไหนใหม่กว่า เพราะถือเป็นแหล่งข้อมูลที่มีผลทางกฎหมายสูงสุด",
        ],
      },
    },
    {
      slug: "segment-freshness-policy",
      title: "นโยบายความสดของ Segment Snapshot",
      tags: ["segment", "freshness", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:campaign-builder}} ต้องเช็ค `computedAt` ของ segment snapshot ก่อนอนุมัติ `validateCampaign` เสมอ — snapshot ที่เก่าเกิน 24 ชั่วโมงถือว่า stale และต้อง trigger `recomputeSegment` ใหม่ก่อนส่งได้",
        "การไม่บังคับ freshness check จะทำให้ campaign ส่งไปหา contact ที่ไม่ตรงเงื่อนไขล่าสุดแล้ว (เช่น คนที่เพิ่งยกเลิกสมาชิกไปแล้วแต่ snapshot เก่ายังนับรวมอยู่) ซึ่งเป็นความเสี่ยงทั้งด้านประสบการณ์ลูกค้าและ compliance",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Segment ขนาดใหญ่ที่คำนวณนาน",
        tags: ["segment", "edge-case"],
        body: [
          "segment ที่มีสมาชิกเกิน 2 ล้าน contact ใช้เวลา `recomputeSegment` นานเกิน 24 ชั่วโมงในบางกรณี — สำหรับ segment กลุ่มนี้ freshness threshold ขยับเป็น 48 ชั่วโมงแทน ไม่ใช่บังคับ 24 ชั่วโมงเท่ากันหมดโดยไม่สนขนาด",
          "ถ้า campaign ถูก schedule ไว้ล่วงหน้านานกว่า freshness threshold ของ segment ที่ใช้ ระบบจะ auto-trigger `recomputeSegment` ล่วงหน้าก่อนเวลาส่งจริงเสมอ แทนที่จะรอให้ `validateCampaign` ตรวจพบว่า stale ตอนใกล้เวลาส่ง",
        ],
      },
    },
    {
      slug: "ab-test-bucket-policy",
      title: "นโยบายการแบ่ง Bucket สำหรับ A/B Test",
      tags: ["ab-test", "policy"],
      isPrimary: true,
      intro: [
        "campaign ที่เปิด A/B test ต้องแบ่งผู้รับเข้า bucket ด้วย deterministic hash ของ `contactId` เสมอ ไม่ใช่การสุ่มแบบ non-deterministic ทุกครั้งที่รัน เพื่อให้ contact คนเดียวกันอยู่ bucket เดิมเสมอถ้า campaign เดียวกันถูกส่งซ้ำบางส่วน (เช่น retry หลัง pause)",
        "ขนาด bucket ต้องต่างกันไม่เกิน 2% ของกันและกันเสมอ ถ้าการแบ่งจริงเบี่ยงเบนเกินนี้ ระบบจะ flag ให้ทีม marketing ตรวจสอบก่อนอ่านผลลัพธ์ เพราะผลที่ได้อาจไม่น่าเชื่อถือทางสถิติ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Segment มีขนาดเล็กเกินไปสำหรับ A/B Test",
        tags: ["ab-test", "edge-case"],
        body: [
          "segment ที่มีสมาชิกน้อยกว่า 1,000 contact ไม่อนุญาตให้เปิด A/B test เลย — ระบบจะปฏิเสธตั้งแต่ตอน `validateCampaign` เพราะขนาดตัวอย่างเล็กเกินกว่าจะได้ผลลัพธ์ที่มีนัยสำคัญทางสถิติ",
          "ถ้าทีม marketing ยืนยันต้องการทดสอบกับ segment เล็กจริงๆ (เช่น กลุ่มลูกค้า VIP เฉพาะ) ต้องขอ override ผ่านช่องทาง manual approval แยกต่างหาก ไม่ใช่ตั้งค่าผ่าน UI ปกติ",
        ],
      },
    },
    {
      slug: "deliverability-suppression-policy",
      title: "นโยบายการ Suppress อัตโนมัติเมื่อ Deliverability ตก",
      tags: ["deliverability", "suppression", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:deliverability-monitor}} สั่ง `triggerSendPause` อัตโนมัติทันทีที่ bounce rate ของ batch ล่าสุดเกิน `BOUNCE_RATE_PAUSE_THRESHOLD_PCT` (ค่าปกติ 5%) โดยไม่ต้องรอการอนุมัติจากคน เพราะการส่งต่อไปขณะ bounce rate สูงจะยิ่งทำร้าย sender reputation ของทุก campaign ในอนาคต",
        "การจะกลับมาส่งต่อหลัง pause ต้องมีคนตรวจสอบสาเหตุก่อนเสมอ (เช่น เป็นปัญหา segment ผิดหรือปัญหาที่ ESP) ระบบจะไม่ resume อัตโนมัติแม้ bounce rate ของ batch ถัดไปจะดูปกติแล้วก็ตาม",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Bounce เกิดจาก ESP ฝั่งเดียว ไม่ใช่ทั้งแคมเปญ",
        tags: ["deliverability", "edge-case"],
        body: [
          "ถ้า bounce rate สูงกระจุกอยู่ที่ ESP ปลายทางเดียว (เช่น domain เดียวที่มีปัญหา) และ ESP อื่นยังปกติ ระบบจะ pause เฉพาะการส่งไปยัง ESP นั้น ไม่ pause ทั้ง send job — แบ่งการ suppress ตามระดับ domain แทนระดับ job ทั้งหมด",
          "การตัดสินว่าเป็นปัญหาระดับ ESP เดียวหรือทั้งแคมเปญ ใช้เกณฑ์ว่า bounce กระจุกเกิน 80% อยู่ที่ domain เดียวหรือไม่ ถ้ากระจายหลาย domain พร้อมกันถือว่าเป็นปัญหาระดับแคมเปญและ pause ทั้งหมดตามเกณฑ์ปกติ",
        ],
      },
    },
    {
      slug: "duplicate-send-prevention-policy",
      title: "นโยบายป้องกันการส่งซ้ำ",
      tags: ["send", "dedup", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:send-scheduler}} ต้องเช็ค idempotency key (`campaignId` + `contactId` + `batchIndex`) ก่อนส่งจริงทุกครั้ง — ถ้าเคยส่งสำเร็จให้ contact คนนี้ใน batch นี้แล้ว จะข้ามทันทีแม้ `dispatchNextBatch` จะถูกเรียกซ้ำจากเหตุผลใดก็ตาม",
        "การเช็ค idempotency ทำที่ database layer ด้วย unique constraint ไม่ใช่แค่ใน application layer เท่านั้น เพื่อกัน race condition เมื่อมี worker หลายตัวประมวลผล batch เดียวกันพร้อมกัน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Contact อยู่ใน Segment ซ้ำหลาย Segment ของ Campaign เดียวกัน",
        tags: ["send", "dedup", "edge-case"],
        body: [
          "ถ้า campaign ผูกกับ segment ที่คำนวณซ้อนทับกัน (เช่น รวม segment ย่อยหลายอันเข้าด้วยกัน) contact คนเดียวที่ปรากฏในหลาย segment ย่อยจะถูก dedupe ให้เหลือส่งแค่ครั้งเดียวเสมอ โดยยึด segment แรกที่พบเป็นหลักในการนับสถิติ",
          "การ dedupe นี้เกิดตอนสร้าง send job ครั้งแรกเท่านั้น ไม่ใช่ตรวจซ้ำทุก batch เพราะ segment membership ระหว่าง batch เดียวกันไม่ควรเปลี่ยนกลางทาง (คนละเรื่องกับ consent status ที่ต้องเช็คใหม่ทุก batch)",
        ],
      },
    },
    {
      slug: "template-approval-policy",
      title: "นโยบายการอนุมัติ Template ก่อนใช้งาน",
      tags: ["template", "policy"],
      isPrimary: false,
      intro: [
        "template ใหม่ต้องผ่าน `validateTemplateSyntax` และมีคนที่สองรีวิวเนื้อหาก่อนถูกใช้กับ campaign จริงเสมอ — ป้องกัน placeholder พิมพ์ผิดหรือลิงก์ unsubscribe หายไปโดยไม่ตั้งใจ",
        "template ที่แก้ไขหลังผ่านการอนุมัติแล้วต้องกลับไปรออนุมัติใหม่อีกรอบเสมอ ไม่ถือว่าการแก้ไขเล็กน้อยยกเว้นได้",
      ],
    },
    {
      slug: "campaign-scheduling-window-policy",
      title: "นโยบายช่วงเวลาที่อนุญาตให้ตั้งเวลาส่ง",
      tags: ["campaign", "scheduling", "policy"],
      isPrimary: false,
      intro: [
        "campaign ต้องตั้งเวลาส่งล่วงหน้าอย่างน้อย `CAMPAIGN_MIN_SCHEDULE_LEAD_MINUTES` (15 นาที) เสมอ เพื่อให้มีเวลาพอสำหรับขั้นตอน validate และ recompute segment ถ้าจำเป็นก่อนถึงเวลาส่งจริง",
        "ห้ามตั้งเวลาส่งในช่วง 02:00-05:00 ตามเวลาท้องถิ่นของกลุ่มเป้าหมายหลัก เว้นแต่จะระบุเหตุผลชัดเจน (เช่น campaign เฉพาะกลุ่มที่ตื่นเวลานั้นจริง) เพราะอัตราเปิดอ่านช่วงนี้ต่ำมากและอาจถูกมองว่าเป็น spam pattern",
      ],
    },
    {
      slug: "consent-double-optin-policy",
      title: "นโยบาย Double Opt-in สำหรับผู้สมัครใหม่",
      tags: ["consent", "policy"],
      isPrimary: false,
      intro: [
        "ผู้สมัครรับข่าวสารใหม่ทุกคนต้องยืนยันผ่านอีเมลยืนยัน (double opt-in) ก่อนเข้าสถานะ `opted_in` เต็มรูปแบบ — สถานะระหว่างรอยืนยันคือ `pending_confirmation` และไม่ถูกรวมใน segment ใดๆ",
        "ถ้าไม่มีการยืนยันภายใน 7 วัน ข้อมูลผู้สมัครจะถูกลบทิ้งอัตโนมัติ ไม่เก็บไว้เป็น `opted_out` เพราะไม่เคยเป็น `opted_in` มาก่อนตั้งแต่ต้น",
      ],
    },
    {
      slug: "sender-domain-reputation-policy",
      title: "นโยบายดูแล Sender Domain Reputation",
      tags: ["deliverability", "domain", "policy"],
      isPrimary: false,
      intro: [
        "sending domain ใหม่ต้องผ่านช่วง warm-up (ส่งในปริมาณน้อยแล้วค่อยๆ เพิ่มตลอด 4 สัปดาห์) ก่อนใช้ส่ง campaign เต็มปริมาณ — ห้ามใช้ domain ใหม่ส่ง campaign ขนาดใหญ่ทันทีแม้จะมี segment พร้อมแล้วก็ตาม",
        "การ migrate ไปใช้ sending domain ใหม่ (เช่น เปลี่ยน ESP) ต้องรัน parallel กับ domain เดิมอย่างน้อย 2 สัปดาห์ก่อนตัด domain เดิมทิ้งเสมอ",
      ],
    },
    {
      slug: "data-retention-policy",
      title: "นโยบายการเก็บรักษาข้อมูลผู้รับ",
      tags: ["data", "retention", "policy"],
      isPrimary: false,
      intro: [
        "ข้อมูล contact ที่ opted_out เกิน 2 ปีติดต่อกันโดยไม่มี interaction ใดๆ (ไม่เปิดอีเมล ไม่คลิก) จะถูก anonymize อัตโนมัติ เก็บไว้แค่สถิติรวมสำหรับ report ย้อนหลัง ไม่เก็บข้อมูลระบุตัวตนต่อ",
        "record ใน `consent_records` ไม่ถูกลบทิ้งแม้ contact จะถูก anonymize แล้ว เพราะต้องเก็บหลักฐานว่าเคย honor คำขอ unsubscribe จริงไว้เพื่อการตรวจสอบทางกฎหมาย",
      ],
    },
  ],
  incidents: [
    {
      slug: "wrong-segment-send-stale-cache",
      title: "ส่ง campaign ผิดกลุ่มเพราะ segment cache เก่าค้าง",
      tags: ["segment", "cache"],
      summary:
        "campaign โปรโมชันสำหรับลูกค้าเก่าที่เคยซื้อ ถูกส่งไปถึงผู้สมัครใหม่ที่ยังไม่เคยซื้ออะไรเลยกว่า 8,000 คน ทำให้เนื้อหาที่อ้างอิงประวัติการซื้อดูผิดเพี้ยนไปหมด",
      investigation:
        "ตรวจ {{ref:module:campaign-builder}} พบว่า `validateCampaign` ใช้ segment snapshot ที่คำนวณไว้ตั้งแต่ 3 วันก่อน ทั้งที่กติกาปกติต้อง recompute ถ้าเก่าเกิน 24 ชั่วโมงตาม {{ref:policy:segment-freshness-policy}}",
      cause:
        "ตรวจโค้ดพบว่ามีการเพิ่ม in-memory cache ชั้นหนึ่งใน `validateCampaign` เพื่อลด latency ตอน preview แต่ cache นี้ไม่เคย invalidate เลยแม้ snapshot จริงใน database จะถูก recompute ใหม่แล้ว ทำให้ validate ผ่านด้วยข้อมูลเก่าที่ค้างอยู่ใน memory",
      resolution:
        "หยุด send job ที่เหลือทันที ลบ cache ชั้นที่มีปัญหาออก แล้ว recompute segment ใหม่และส่ง campaign แก้ไขเฉพาะกลุ่มที่ยังไม่ได้รับเนื้อหาที่ถูกต้อง",
      followup:
        "ลบ in-memory cache ที่ซ้อนทับกับ snapshot mechanism ของ {{ref:module:segment-engine}} ออกทั้งหมด ยึดหลักว่า freshness check ต้องอ่านจาก source เดียวเท่านั้น ไม่มี cache ซ้อน",
    },
    {
      slug: "esp-blacklist-deliverability-drop",
      title: "Sending domain ถูกขึ้น blacklist กลาง campaign ใหญ่",
      tags: ["deliverability", "blacklist"],
      summary:
        "อัตราเปิดอ่านของ campaign หนึ่งตกฮวบเหลือต่ำกว่า 2% ทั้งที่ campaign ก่อนหน้าปกติอยู่ที่ 25% ขึ้นไป ทีม marketing สงสัยว่าเนื้อหามีปัญหา",
      investigation:
        "ตรวจ {{ref:module:deliverability-monitor}} พบว่า `checkDomainBlacklist` รายงานว่า sending domain หลักถูกขึ้น blacklist โดย reputation service รายใหญ่ตั้งแต่เมื่อคืน แต่ alert ไม่ได้ถูกส่งเพราะ check รอบนั้นรันก่อน blacklist event จะเกิดพอดี",
      cause:
        "`checkDomainBlacklist` รันเป็น cron รายชั่วโมง ไม่ใช่ real-time subscription ต่อ blacklist event จากภายนอก ทำให้มี window สูงสุด 1 ชั่วโมงที่ domain อาจถูก blacklist แล้วแต่ระบบยังไม่รู้ตัว",
      resolution:
        "หยุด send job ที่เหลือ ติดต่อ reputation service เพื่อขอ delist พร้อมชี้แจงสาเหตุ (เป็นการ mislabel จากปริมาณส่งที่พุ่งสูงผิดปกติช่วงสั้นๆ) ใช้เวลาประมาณ 6 ชั่วโมงกว่าจะ delist สำเร็จ",
      followup:
        "เปลี่ยนจาก cron รายชั่วโมงเป็น subscribe webhook แบบ real-time จาก reputation service โดยตรงถ้า vendor รองรับ ลด window ความเสี่ยงจาก 1 ชั่วโมงเหลือใกล้ real-time",
    },
    {
      slug: "duplicate-sends-scheduler-retry-bug",
      title: "ผู้รับได้อีเมลเดียวกันซ้ำ 3 ฉบับจาก scheduler retry",
      tags: ["send", "duplicate"],
      summary:
        "ลูกค้าหลายรายร้องเรียนว่าได้รับอีเมล newsletter ฉบับเดียวกันซ้ำ 2-3 ครั้งในเวลาไม่กี่นาที",
      investigation:
        "ตรวจ log {{ref:module:send-scheduler}} พบว่า `dispatchNextBatch` ถูกเรียกซ้ำสำหรับ batch เดิมหลายครั้ง ตรงกับช่วงที่ worker process restart กลางทางเพราะ deploy รอบปกติ",
      cause:
        "worker ที่ restart กลาง batch ไม่ได้ทำ idempotency check ตาม {{ref:policy:duplicate-send-prevention-policy}} อย่างครบถ้วน — unique constraint ที่ควรกันซ้ำใช้ `campaignId` + `contactId` เท่านั้น ไม่รวม `batchIndex` ทำให้ batch ใหม่ที่สร้างหลัง restart ผ่านการเช็คซ้ำได้เพราะมองว่าเป็นคนละ record",
      resolution:
        "แก้ unique constraint ให้ครอบคลุมครบตามที่นโยบายกำหนด แล้วส่งอีเมลขอโทษพร้อมคำอธิบายให้ผู้รับที่ได้รับอีเมลซ้ำ",
      followup:
        "เพิ่ม test case สำหรับกรณี worker restart กลาง batch ใน integration test ของ send-scheduler และ audit unique constraint อื่นในระบบว่าตรงกับ policy จริงหรือไม่",
    },
    {
      slug: "unsubscribe-not-honored-compliance-risk",
      title: "คำขอ Unsubscribe ไม่ถูก Honor ทันเวลาเสี่ยงผิดกฎหมาย",
      tags: ["consent", "compliance"],
      summary:
        "ลูกค้ารายหนึ่งร้องเรียนว่า unsubscribe ไปแล้วแต่ยังได้รับอีเมลต่อเนื่องอีก 3 ฉบับในสัปดาห์ถัดมา เกิน SLA 24 ชั่วโมงที่ {{ref:policy:unsubscribe-honor-policy}} กำหนดไว้ชัดเจน",
      investigation:
        "ตรวจ {{ref:module:consent-manager}} พบว่า `recordOptOut` ถูกเรียกสำเร็จจริงตามเวลาที่ลูกค้าคลิก แต่ campaign ที่ส่งซ้ำหลังจากนั้นเป็น campaign ประเภทที่ schedule ไว้ล่วงหน้านานแล้วผ่าน {{ref:module:send-scheduler}} คนละ path จาก path ปกติ",
      cause:
        "campaign แบบ recurring (ส่งซ้ำอัตโนมัติทุกสัปดาห์) ใช้ code path เก่าที่เขียนก่อนจะมีการรวม consent check เข้ากับ `dispatchNextBatch` — ตอน refactor ครั้งก่อนอัปเดตเฉพาะ path ของ campaign แบบครั้งเดียว ไม่ได้แตะ path ของ recurring campaign เลย",
      resolution:
        "หยุด recurring campaign ที่เกี่ยวข้องทันที ตรวจสอบผู้รับทั้งหมดที่อาจได้รับผลกระทบแบบเดียวกัน แล้ว migrate recurring campaign path ให้เรียก consent check แบบเดียวกับ path ปกติ",
      followup:
        "รวม code path ของ recurring campaign และ one-time campaign ให้ใช้ `dispatchNextBatch` ตัวเดียวกันทั้งหมด ไม่มี path แยกที่อาจตกหล่นการเช็คสำคัญแบบนี้อีก",
    },
    {
      slug: "ab-test-skewed-bucket-split",
      title: "ผล A/B Test เอนเอียงผิดปกติเพราะการแบ่ง Bucket ไม่สมดุล",
      tags: ["ab-test", "bug"],
      summary:
        "ทีม marketing สังเกตว่าผล A/B test ของ subject line ใหม่ดู \"ชนะ\" อย่างท่วมท้นเกินจริง เมื่อตรวจสอบพบว่า bucket ทั้งสองฝั่งมีขนาดต่างกันเกือบ 3 เท่า ทั้งที่ตั้งค่าไว้ 50/50",
      investigation:
        "ตรวจ {{ref:module:campaign-builder}} พบว่า hash function ที่ใช้แบ่ง bucket จาก `contactId` ไม่ uniform เพียงพอสำหรับ contactId ที่มีรูปแบบ prefix ซ้ำกันจำนวนมาก (เพราะ contactId ส่วนใหญ่สร้างจาก sequential id เดิม)",
      cause:
        "hash function ที่เลือกใช้ (modulo ตรงๆ ของตัวเลขท้าย id) ไม่กระจายค่าดีพอเมื่อ input มี pattern ซ้ำเป็นชุด ทำให้ contactId ที่ลงท้ายตัวเลขคล้ายกันไปกระจุกอยู่ bucket เดียวกันเป็นจำนวนมาก",
      resolution:
        "เปลี่ยนไปใช้ cryptographic hash (เช่น SHA-256 ของ contactId) แทน modulo ตรงๆ ก่อนแบ่ง bucket แล้วรัน A/B test ใหม่อีกรอบเพื่อยืนยันผลลัพธ์ที่น่าเชื่อถือกว่าเดิม",
      followup:
        "เพิ่มการตรวจสอบขนาด bucket อัตโนมัติหลังแบ่งเสร็จทุกครั้งตาม {{ref:policy:ab-test-bucket-policy}} ถ้าเบี่ยงเบนเกิน 2% ให้ flag ทันทีก่อนเริ่มส่งจริง ไม่ใช่ปล่อยให้ทีม marketing สังเกตเองหลังผลออกแล้ว",
    },
    {
      slug: "send-rate-throttle-backlog",
      title: "ชน Rate Limit กลาง Campaign ใหญ่ทำ Backlog สะสม",
      tags: ["send", "throttle"],
      summary:
        "campaign ขนาดใหญ่ที่สุดของปี (8 ล้านผู้รับ) เริ่มส่งช้าลงเรื่อยๆ จนคาดว่าจะส่งไม่ครบภายในกรอบเวลาที่ทีม marketing ต้องการ (ต้องการให้เสร็จก่อนเที่ยงคืนตามเขตเวลาหลัก)",
      investigation:
        "ตรวจ {{ref:module:send-scheduler}} พบว่าอัตราส่งจริงอยู่ที่ `SEND_RATE_LIMIT_PER_MINUTE` เต็มเพดานตลอดเวลา แต่ backlog ยังเพิ่มขึ้นเรื่อยๆ เพราะขนาด campaign ใหญ่กว่าที่ rate limit ปัจจุบันจะส่งทันภายในกรอบเวลาที่ต้องการได้เลยตั้งแต่ต้น",
      cause:
        "ทีม marketing ไม่ได้แจ้งขนาด campaign ที่ใหญ่ผิดปกตินี้ล่วงหน้าให้ทีม platform ทราบ ทำให้ไม่มีการขอเพิ่ม rate limit ชั่วคราวจาก ESP ก่อนวันส่งจริงตามขั้นตอนปกติ",
      resolution:
        "ติดต่อ ESP ขอเพิ่ม rate limit ชั่วคราวแบบเร่งด่วนได้สำเร็จบางส่วน ทำให้ campaign ส่งเสร็จช้ากว่ากำหนดเดิมประมาณ 2 ชั่วโมง",
      followup:
        "เพิ่มขั้นตอนบังคับให้ campaign ที่มีผู้รับเกิน 3 ล้านคนต้องแจ้งทีม platform ล่วงหน้าอย่างน้อย 3 วันทำการ เพื่อประเมินว่าต้องขอเพิ่ม rate limit จาก ESP หรือไม่ก่อนอนุมัติตารางส่ง",
    },
    {
      slug: "template-rendering-broken-images",
      title: "รูปภาพในอีเมลหายทั้งหมดหลังแก้ Template",
      tags: ["template", "rendering"],
      summary:
        "campaign ที่ส่งไปแล้วกว่าครึ่งของผู้รับพบว่ารูปภาพในอีเมลไม่แสดงเลย เห็นแค่ alt text เปล่าๆ ทั้งที่ preview ตอนสร้าง campaign ดูปกติดี",
      investigation:
        "ตรวจ {{ref:module:template-renderer}} พบว่า `renderForContact` ใช้ URL รูปภาพแบบ relative path ที่อ้างอิง domain ของ staging environment ซึ่งใช้ตอน preview เท่านั้น ไม่ใช่ absolute URL ของ production CDN",
      cause:
        "`validateTemplateSyntax` ตรวจแค่ syntax ของ placeholder เท่านั้น ไม่ได้ตรวจว่า URL รูปภาพที่ฝังอยู่ใน template เป็น absolute path ที่ใช้งานได้จริงจาก inbox ของผู้รับหรือไม่",
      resolution:
        "แก้ template ให้ใช้ absolute URL ของ production CDN แล้วส่ง follow-up campaign เฉพาะกลุ่มที่ได้รับอีเมลรูปหายพร้อมลิงก์ดูเนื้อหาเต็มบนเว็บแทน",
      followup:
        "เพิ่ม validation ใน `validateTemplateSyntax` ให้เช็คว่า URL รูปภาพทุกอันเป็น absolute path และ resolve ได้จริงก่อนอนุมัติ template ไม่ใช่ตรวจแค่ syntax placeholder อย่างเดียว",
    },
    {
      slug: "segment-engine-timeout-mass-campaign",
      title: "Segment Engine Timeout ตอนคำนวณ Segment ขนาดใหญ่ผิดปกติ",
      tags: ["segment", "performance"],
      summary:
        "ทีม marketing สร้าง segment ใหม่ที่รวมเงื่อนไขซับซ้อนหลายชั้น (cross-reference ประวัติซื้อ 2 ปีย้อนหลังกับพฤติกรรมเปิดอีเมล) แล้ว `recomputeSegment` ค้างไม่คืนผลเลยนานกว่า 2 ชั่วโมง",
      investigation:
        "ตรวจ {{ref:module:segment-engine}} พบว่า query ที่สร้างจากเงื่อนไขซับซ้อนหลายชั้นกลายเป็น full table scan ข้ามหลายตารางพร้อมกัน โดยไม่มี index รองรับ pattern การ query แบบนี้",
      cause:
        "segment engine ไม่มีการจำกัดความซับซ้อนของเงื่อนไขที่ผู้ใช้สร้างเองผ่าน UI เลย ทีม marketing สามารถซ้อนเงื่อนไขได้ไม่จำกัดชั้นโดยไม่มีการเตือนล่วงหน้าว่าจะกระทบ performance",
      resolution:
        "ยกเลิก query ที่ค้าง แล้วช่วยทีม marketing ปรับเงื่อนไขให้ query ได้เร็วขึ้นด้วยการแยกเป็นสอง segment ย่อยแล้วรวมผลทีหลังแทน",
      followup:
        "เพิ่มการประเมิน query cost ก่อนรัน `recomputeSegment` จริง ถ้าประเมินว่าจะใช้เวลาเกินเกณฑ์ที่กำหนดให้เตือนผู้ใช้ก่อนยืนยัน แทนที่จะปล่อยให้รันจนค้าง",
    },
    {
      slug: "consent-webhook-lost-stuck-pending",
      title: "คำขอ Unsubscribe จากหน้า Landing Page ค้างสถานะ Pending",
      tags: ["consent", "webhook", "stuck"],
      summary:
        "ลูกค้ารายหนึ่งกดลิงก์ unsubscribe จากอีเมลแล้วเห็นหน้ายืนยันสำเร็จ แต่ยังได้รับอีเมลใหม่ต่อเนื่องอีก 2 ฉบับในสัปดาห์ถัดมา ทั้งที่ตามหน้าเว็บควรจะ opted_out แล้ว",
      investigation:
        "ตรวจ {{ref:module:consent-manager}} พบว่าคำขอนี้ไม่เคยถูกบันทึกใน `consent_records` เลย — `handleUnsubscribeWebhook` ไม่เคยถูกเรียกทั้งที่หน้า landing page แสดงผลสำเร็จให้ผู้ใช้เห็น",
      cause:
        "landing page ส่ง webhook ยืนยันไปที่ endpoint ของ consent-manager หลังจากอัปเดต UI ฝั่งตัวเองสำเร็จแล้ว แต่ webhook หายไประหว่างทางเพราะปัญหาเครือข่ายชั่วคราว และไม่มี retry mechanism ฝั่ง landing page เอง — เป็น pattern เดียวกับ webhook หายที่เจอในหลายระบบที่พึ่งพา delivery แบบ best-effort",
      resolution:
        "บันทึกคำขอ unsubscribe ของลูกค้าที่ได้รับผลกระทบด้วยมือทันที แล้วตรวจสอบ log ของ landing page ย้อนหลังหาเคสอื่นที่อาจเกิดปัญหาเดียวกันในช่วงเวลาเดียวกัน",
      followup:
        "เพิ่ม retry with backoff ที่ landing page ก่อนแสดงหน้ายืนยันสำเร็จให้ผู้ใช้เห็น และเพิ่ม reconciliation job ฝั่ง consent-manager ที่ query สถานะจาก landing page เป็น fallback เหมือนแนวทางที่ใช้กับ webhook อื่นในระบบ",
    },
    {
      slug: "scheduler-timezone-bug-wrong-send-time",
      title: "Campaign ส่งผิดเวลาเพราะ Bug การแปลง Timezone",
      tags: ["scheduling", "timezone"],
      summary:
        "campaign ที่ตั้งใจให้ส่งตอน 9 โมงเช้าตามเวลาท้องถิ่นของผู้รับ กลับส่งไปตอนตี 2 แทน ทำให้อัตราเปิดอ่านต่ำผิดปกติและมีลูกค้าร้องเรียนเรื่องได้อีเมลกลางดึก",
      investigation:
        "ตรวจ {{ref:module:campaign-builder}} พบว่า `scheduleCampaign` เก็บ `sendAt` เป็น local time string โดยไม่มีข้อมูล timezone ติดไปด้วย แล้ว {{ref:module:send-scheduler}} ตีความค่านั้นเป็น UTC ตรงๆ ตอนเทียบเวลาส่งจริง",
      cause:
        "ตอนออกแบบครั้งแรกระบบรองรับแค่การส่งตามเวลาเดียวกันทั้งหมด (single timezone) ไม่มีใครแก้ schema ให้เก็บ timezone explicit ตอนเพิ่มฟีเจอร์ \"ส่งตามเวลาท้องถิ่นผู้รับ\" ในภายหลัง",
      resolution:
        "หยุด send job ที่เหลือ (ยังไม่ครบทุก timezone) แก้ `sendAt` ให้เป็นเวลาที่ถูกต้องแล้วส่งใหม่เฉพาะกลุ่มที่ยังไม่ได้รับ",
      followup:
        "แก้ schema ของ `campaigns` ให้เก็บ `sendAt` เป็น ISO 8601 พร้อม timezone offset explicit เสมอ ไม่เก็บเป็น local time string อีกต่อไป และเพิ่ม test case ครอบคลุมหลาย timezone",
    },
    {
      slug: "deliverability-monitor-false-positive-pause",
      title: "Deliverability Monitor สั่ง Pause ผิดเพราะนับ Bounce ปนกันข้าม Campaign",
      tags: ["deliverability", "bug"],
      summary:
        "campaign ที่เพิ่งเริ่มส่งได้ไม่กี่นาทีถูก `triggerSendPause` ทันที ทั้งที่ bounce rate ของ campaign นี้เองยังต่ำมาก ทีม marketing งงว่าทำไมถึงถูกหยุด",
      investigation:
        "ตรวจ {{ref:module:deliverability-monitor}} พบว่า `evaluateBounceRate` คำนวณจาก metric รวมของ sending domain ทั้งหมดในช่วงเวลาเดียวกัน ไม่ได้แยกตาม `jobId` อย่างที่ตั้งใจออกแบบไว้ ทำให้ bounce rate สูงของอีก campaign หนึ่งที่ใช้ domain เดียวกันไปกระทบการตัดสินใจของ campaign นี้ด้วย",
      cause:
        "bug อยู่ที่ query aggregation ที่ลืมใส่เงื่อนไข filter `jobId` ในรอบ deploy ล่าสุดที่ refactor การคำนวณ metric ให้เร็วขึ้น ทำให้ query กลายเป็นนับรวมทุก job ที่ใช้ domain เดียวกันโดยไม่ตั้งใจ",
      resolution:
        "resume campaign ที่ถูก pause ผิดพลาดด้วยมือหลังยืนยันว่า bounce rate จริงของ campaign นี้ปกติ แล้วแก้ query ให้ filter ตาม `jobId` ตามที่ควรจะเป็น",
      followup:
        "เพิ่ม unit test เฉพาะสำหรับ `evaluateBounceRate` ที่จำลอง 2 campaign พร้อมกันบน domain เดียวกัน เพื่อจับ regression แบบนี้ตั้งแต่ตอน code review",
    },
    {
      slug: "campaign-builder-race-condition-duplicate-campaign",
      title: "กด Schedule Campaign ซ้ำสองครั้งเร็วๆ ทำให้เกิด Campaign ซ้อนสองตัว",
      tags: ["campaign", "race-condition"],
      summary:
        "ทีม marketing คนหนึ่งกดปุ่ม schedule สองครั้งติดกันเพราะ UI ตอบสนองช้า พบภายหลังว่าระบบสร้าง send job สองชุดจาก campaign เดียวกัน ส่งซ้ำให้ผู้รับทุกคน",
      investigation:
        "ตรวจ {{ref:module:campaign-builder}} พบว่า `scheduleCampaign` ไม่มีการล็อกระดับ campaign ก่อนเปลี่ยนสถานะจาก `validated` เป็น `scheduled` — สอง request ที่มาพร้อมกันต่างอ่านเห็นสถานะ `validated` เหมือนกันแล้วต่างก็ผ่านเงื่อนไขไปสร้าง send job ของตัวเอง",
      cause:
        "การ query และ update สถานะ campaign ไม่ได้ทำแบบ atomic — ช่วงเวลาสั้นๆ ระหว่างอ่านกับเขียนเปิดโอกาสให้ request คู่ขนานแทรกเข้ามาได้ เป็นรูปแบบบั๊กเดียวกับที่เคยพบใน service อื่นที่มี pattern อ่าน-แล้ว-เขียนคล้ายกัน",
      resolution:
        "หยุด send job ที่ซ้ำซ้อนตัวหนึ่งทันที (ตัวที่ยังไม่เริ่มส่ง) แก้ให้ `scheduleCampaign` ใช้ conditional update แบบ atomic (`update ... where status='validated'`) แทนการอ่านแล้วเขียนแยกกัน deploy เป็น hotfix",
      followup:
        "ตรวจสอบฟังก์ชันอื่นใน {{ref:module:campaign-builder}} ที่มี pattern อ่าน-แล้ว-เขียนคล้ายกันว่ามีความเสี่ยง race condition เดียวกันหรือไม่ และเพิ่มเข้า {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "sender-domain-reputation-drop-after-migration",
      title: "Reputation ตกหนักหลัง Migrate ไป Sending Domain ใหม่เร็วเกินไป",
      tags: ["deliverability", "migration"],
      summary:
        "หลัง migrate ไปใช้ sending domain ใหม่ อัตราส่งถึง inbox หลักลดลงจาก 92% เหลือ 61% ภายในสัปดาห์แรก กระทบทุก campaign ที่ส่งช่วงนั้น",
      investigation:
        "ตรวจสอบพบว่าทีมตัดการส่งจาก domain เดิมทันทีหลัง migrate โดยไม่ได้รัน parallel ตามที่ {{ref:policy:sender-domain-reputation-policy}} กำหนด เพราะเข้าใจผิดว่า domain ใหม่ warm-up เสร็จแล้วพร้อมใช้งานเต็มรูปแบบ",
      cause:
        "ขั้นตอน warm-up ที่ทำไปก่อนหน้าเป็นแค่การส่งทดสอบปริมาณน้อยในช่วงสั้น ไม่ได้ทำครบตามระยะเวลา 4 สัปดาห์เต็มตามนโยบาย ทีมประเมินว่า \"พอจะใช้ได้\" โดยไม่ยึดเกณฑ์ระยะเวลาที่กำหนดไว้ชัดเจน",
      resolution:
        "สลับกลับไปใช้ domain เดิมเป็นหลักชั่วคราว แล้วเริ่มกระบวนการ warm-up domain ใหม่ใหม่ตั้งแต่ต้นตามระยะเวลาเต็มที่นโยบายกำหนด",
      followup:
        "เพิ่มการบังคับทางระบบ (ไม่ใช่แค่เอกสารนโยบาย) ที่ปิดกั้นการส่ง campaign ขนาดใหญ่ผ่าน domain ที่ยังไม่ผ่านระยะ warm-up ครบตามเวลาจริง แทนการพึ่งดุลยพินิจของทีมเพียงอย่างเดียว",
    },
    {
      slug: "bounce-handling-suppression-list-not-updated",
      title: "รายชื่อ Suppression List ไม่อัปเดตทำส่งซ้ำให้อีเมลที่ Bounce ถาวรแล้ว",
      tags: ["deliverability", "suppression"],
      summary:
        "ทีมสังเกตว่า bounce rate โดยรวมสูงกว่าค่าเฉลี่ยต่อเนื่องหลาย campaign ติดกัน ตรวจสอบพบว่ามีอีเมลกลุ่มหนึ่งที่ bounce แบบถาวร (hard bounce) มาตั้งแต่หลายเดือนก่อนแต่ยังถูกส่งซ้ำอยู่เรื่อยๆ",
      investigation:
        "ตรวจ {{ref:module:deliverability-monitor}} พบว่า event `send.bounced` ประเภท hard bounce ถูกบันทึกไว้ในตาราง log ปกติ แต่ไม่เคยถูกส่งต่อไปเพิ่มใน suppression list ที่ {{ref:module:send-scheduler}} เช็คก่อนส่งจริง",
      cause:
        "ระบบแยก hard bounce กับ soft bounce ไว้ถูกต้องตอนบันทึก log แต่ logic ที่ควรเพิ่ม hard bounce เข้า suppression list อัตโนมัติไม่เคยถูก implement จริง มีแค่ comment `// TODO: auto-suppress hard bounces` ค้างอยู่ในโค้ดมาตั้งแต่ตอนออกแบบครั้งแรก",
      resolution:
        "เพิ่มรายชื่อ hard bounce ทั้งหมดที่สะสมไว้เข้า suppression list ด้วยสคริปต์ครั้งเดียว แล้ว implement logic auto-suppress ที่ขาดไปให้ทำงานจริงตาม TODO ที่ค้างไว้",
      followup:
        "เพิ่ม alert ที่ตรวจจับ TODO ที่เกี่ยวกับ suppression หรือ compliance ค้างอยู่ในโค้ดนานเกินกำหนด ให้เป็นส่วนหนึ่งของการตรวจสอบ tech debt ประจำไตรมาส",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/WAVE-231-segment-freshness-check`, `fix/WAVE-244-duplicate-send-constraint`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(consent-manager): แก้ recurring campaign path ให้เช็ค consent ก่อนส่ง`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้สถานะ campaign หรือ send job ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:campaign-builder-race-condition-duplicate-campaign}}) และการเพิ่ม cache ชั้นใดๆ ต้องระบุ invalidation strategy ชัดเจนก่อน merge เสมอ" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `dispatchNextBatch`, `recomputeSegment` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ของผู้รับ", body: "`contactId` เป็น UUID เสมอ ห้ามใช้อีเมลเป็น primary key ในตารางไหนเลยแม้จะดูสะดวกกว่า เพราะอีเมลเปลี่ยนได้และมีผลต่อ consent record ที่ต้องผูกกับตัวตนเดิม" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ send job ต้องมี `jobId` เสมอ เพื่อไล่ log ข้าม service ได้ (send-scheduler → template-renderer → consent-manager) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "การปฏิเสธส่งเพราะ consent status เป็น `opted_out` ต้อง log เป็น `info` เสมอไม่ใช่ `error` เพราะเป็นพฤติกรรมที่ถูกต้องตามออกแบบ ต่างจาก webhook ที่ parse ไม่ได้ซึ่งต้อง log เป็น `error`" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`WAVE_<DOMAIN>_<REASON>` เช่น `WAVE_SEGMENT_STALE`, `WAVE_CONSENT_OPTED_OUT` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`WAVE_SEND_RATE_EXCEEDED`, `WAVE_TEMPLATE_INVALID`, `WAVE_DELIVERABILITY_PAUSED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "integration"],
      sections: [
        { heading: "Mock ESP เสมอใน test", body: "test ที่แตะการส่งจริงต้อง mock ESP response ทุกกรณี (success, bounce, blacklist) ห้ามยิงอีเมลจริงแม้แต่ใน staging environment โดยเด็ดขาด" },
        { heading: "Timezone test", body: "logic ที่เกี่ยวกับ `sendAt` ต้องมี test ครอบคลุมอย่างน้อย 3 timezone ที่ต่างกัน — บทเรียนจาก {{ref:incident:scheduler-timezone-bug-wrong-send-time}}" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw exception message ของ backend ออกไปตรงๆ" },
      ],
    },
    {
      slug: "campaign-slug-convention",
      title: "Campaign Slug Convention",
      tags: ["campaign", "naming"],
      intro: "ทุก campaign ต้องมี slug ที่อ่านรู้เรื่องสำหรับทีม marketing เอง ไม่ใช่แค่ UUID ภายใน เพราะต้องใช้อ้างอิงกันในรายงานและการสื่อสารข้ามทีมบ่อยมาก",
      sections: [
        { heading: "รูปแบบ", body: "`<ปี>-<เดือน>-<ประเภท>-<คำอธิบายสั้น>` เช่น `2026-08-newsletter-summer-sale`, `2026-08-transactional-cart-reminder`" },
        { heading: "ข้อห้าม", body: "ห้ามใช้ชื่อ segment เป้าหมายเป็นส่วนหนึ่งของ slug (เช่น ห้ามชื่อ `2026-08-vip-customers-promo`) เพราะ segment ที่ผูกกับ campaign อาจเปลี่ยนได้ภายหลังแต่ slug ควรอ้างอิงเนื้อหา ไม่ใช่กลุ่มเป้าหมาย" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (mock ESP ทั้งหมด) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:send-scheduler}} และ {{ref:module:consent-manager}} ต้องผ่าน integration test ที่ครอบคลุม concurrent call และ consent check ครบทุกกรณีก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบ compliance โดยตรง" },
      ],
    },
    {
      slug: "send-latency-timeout-tuning",
      title: "Send Latency & Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (การเชื่อมต่อ ESP) เท่านั้น ไม่ใช่ business timeout ของ SLA unsubscribe — ดูเรื่องนั้นที่ {{ref:policy:unsubscribe-honor-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| ESP API connect | 5s | env `ESP_CONNECT_TIMEOUT_MS` |\n| ESP API read (ต่อ batch) | 20s | env `ESP_READ_TIMEOUT_MS` |\n| API gateway → campaign-builder | 10s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| Consent check per batch | 3s | env `CONSENT_CHECK_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนมิถุนายน 2026 พบว่า ESP read timeout สั้นเกินไปช่วงที่ ESP มี latency สูงตอน peak ทำให้ batch ถูกตัดตอนก่อน ESP จะตอบสำเร็จจริง เกิดการ retry ซ้ำโดยไม่จำเป็น ขยับ timeout จาก 12s เป็น 20s แก้ปัญหาได้" },
      ],
    },
    {
      slug: "esp-provider-migration-runbook",
      title: "ESP Provider Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อเปลี่ยนหรือเพิ่ม ESP ผู้ให้บริการส่งอีเมลรายใหม่ ต้อง migrate การตั้งค่า rate limit, sending domain, และ webhook endpoint ใน {{ref:module:send-scheduler}} และ {{ref:module:deliverability-monitor}} พร้อมกัน" },
        { heading: "ขั้นตอน", body: "1) ตั้งค่า ESP ใหม่แบบ parallel กับตัวเดิม 2) รัน warm-up ตาม {{ref:policy:sender-domain-reputation-policy}} 3) ทดสอบส่ง campaign ขนาดเล็กก่อน 4) ค่อยๆ เพิ่มสัดส่วน traffic ไปยัง ESP ใหม่ ไม่ตัด ESP เดิมทันที" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ส่งผิดกลุ่มหรือละเมิด consent, Sev2 = deliverability ตกกระทบหลาย campaign, Sev3 = กระทบ campaign เดียวไม่ถึงลูกค้าปลายทางเป็นวงกว้าง" },
        { heading: "กรณีละเมิด consent", body: "ทุกเหตุการณ์ที่เกี่ยวกับ {{ref:module:consent-manager}} ต้องยกระดับเป็น Sev1 เสมอไม่ว่าจำนวนผู้ได้รับผลกระทบจะน้อยแค่ไหน และแจ้งทีม legal ภายใน 2 ชั่วโมงหลังยืนยันเหตุการณ์" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "bounce rate เกิน `BOUNCE_RATE_PAUSE_THRESHOLD_PCT`, send job ค้างสถานะ `sending` เกิน 2 เท่าของเวลาที่ประมาณไว้, consent check latency เกิน `CONSENT_CHECK_TIMEOUT_MS`" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้ถึงเช้า" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ consent check เริ่มพลาดหรือ deliverability metric ตกต่ำผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:unsubscribe-not-honored-compliance-risk}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip ขั้นตอน smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| send-scheduler | 3 | 12 | queue depth > 500 |\n| segment-engine | 1 | 6 | CPU > 70% |\n| template-renderer | 2 | 10 | request rate > 2000/min |" },
        { heading: "ข้อจำกัดของ rate limit ภายนอก", body: "การ scale software service ช่วยได้แค่ระดับ throughput ในการเตรียมและประมวลผล ไม่ได้เพิ่มเพดานการส่งจริงที่ ESP กำหนด ดู {{ref:policy:send-rate-throttle-policy}} สำหรับข้อจำกัดนี้" },
      ],
    },
    {
      slug: "large-campaign-capacity-planning",
      title: "Large Campaign Capacity Planning",
      tags: ["capacity", "planning"],
      intro: "ขั้นตอนวางแผนล่วงหน้าสำหรับ campaign ขนาดใหญ่ผิดปกติ เพื่อป้องกันปัญหาแบบ {{ref:incident:send-rate-throttle-backlog}}",
      sections: [
        { heading: "เกณฑ์ที่ต้องวางแผนล่วงหน้า", body: "campaign ที่มีผู้รับเกิน 3 ล้านคนต้องแจ้งทีม platform ล่วงหน้าอย่างน้อย 3 วันทำการ เพื่อประเมินว่าอัตราส่งปัจจุบันเพียงพอต่อกรอบเวลาที่ต้องการหรือไม่ และต้องขอเพิ่ม rate limit จาก ESP ล่วงหน้าหรือไม่" },
        { heading: "การประเมิน", body: "คำนวณเวลาที่ต้องใช้จริงจาก `SEND_RATE_LIMIT_PER_MINUTE` เทียบกับขนาด segment แล้วแจ้งทีม marketing ตั้งแต่ตอน validate campaign ถ้าคาดว่าจะไม่เสร็จภายในกรอบเวลาที่ตั้งใจไว้" },
      ],
    },
  ],
};
