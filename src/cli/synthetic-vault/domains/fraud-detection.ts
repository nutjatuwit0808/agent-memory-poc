import type { DomainProfile } from "../types.js";

// ShieldAI — ระบบตรวจจับการทุจริต (real-time fraud detection)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const fraudDetection: DomainProfile = {
  id: "fraud-detection",
  displayName: "ShieldAI — ระบบตรวจจับการทุจริต",
  summary: [
    "ShieldAI คือระบบตรวจจับการทุจริต (fraud detection) แบบ real-time สำหรับ digital transaction ที่หลากหลาย ตั้งแต่การสมัครบัญชีปลอม การใช้งานโปรโมชั่นผิดวัตถุประสงค์ การรีวิวปลอม ไปจนถึงบอตและการโจมตีแบบ automated ระบบวิเคราะห์ behavioral signal, device fingerprint, และ velocity pattern พร้อมกันเพื่อให้คะแนนความเสี่ยงต่อทุก event ใน millisecond",
    "ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่การเก็บ signal จากหลายช่องทาง การประเมินด้วย rule-based engine การให้คะแนนด้วย ML model ไปจนถึงการบริหารจัดการ case ที่ต้องให้นักวิเคราะห์ตรวจสอบ ทีมวิศวกรรมเรียก event ที่มีคะแนนเสี่ยงสูงกว่า 80 ว่า high-risk signal เพราะต้องการ action ภายใน SLA ที่กำหนด",
  ],
  domainTags: ["fraud-detection", "shieldai"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:rule-engine}} เป็นเจ้าของชุด rule ทั้งหมด (active rules, version history, override log) ส่วน {{ref:module:ml-scorer}} เป็นเจ้าของ model artifact และ feature pipeline เท่านั้น ไม่รู้จัก rule ใดๆ ที่ rule-engine บริหาร",
    "{{ref:module:case-manager}} เป็น service เดียวที่รวม output จากทั้ง rule-engine และ ml-scorer เพื่อตัดสินใจว่าจะ block, review, หรือ allow event — เหตุผลที่ให้ case-manager ทำ decision aggregation คือต้องการ audit trail รวมศูนย์ที่เดียว ไม่กระจายอยู่หลาย service",
  ],
  apiGatewayNote: [
    "event ทุกประเภท (account creation, login, promotion redemption, review submission) เข้ามาทาง gRPC streaming endpoint แยกต่างหาก ไม่ใช้ REST เพราะต้องการ throughput สูงและ latency ต่ำ API gateway แปลง JSON request เป็น protobuf แล้วส่งต่อให้ {{ref:module:signal-collector}} เป็น first hop",
    "คำสั่งจาก analyst เช่น manual review, override rule, หรือ resolve case ใช้ REST ผ่าน admin portal — แยก endpoint จากตัวรับ signal เพราะ security model ต่างกัน (analyst มี auth token ต่างกับ client application)",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:case-manager}} ดูแล ได้แก่ `fraud_cases` (ทุก case ที่สร้างขึ้น ไม่ลบทิ้ง), `case_reviews` (ประวัติการ review ของ analyst), และ `case_decisions` (ผลการตัดสินใจสุดท้ายพร้อม reason)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `signals` | signal-collector | raw signal ทุก event, retention 90 วัน |\n| `rule_versions` | rule-engine | ทุก version ของ rule, ไม่ลบทิ้ง |\n| `score_log` | ml-scorer | คะแนนทุก prediction พร้อม feature snapshot |\n| `device_profiles` | device-fingerprinter | fingerprint และ trust score ของแต่ละ device |",
    "ทุกตารางมี `event_id` เป็น key ร่วมแบบ soft reference เพื่อ correlate signal, score, และ case ด้วยกันได้ ตรวจสอบด้วย daily reconciliation job",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `signal.received`, `signal.scored`, `case.created`, `case.resolved`, `rule.updated`, `device.trust_changed` — {{ref:module:signal-collector}} เป็น publisher หลัก ส่วน {{ref:module:rule-engine}} และ {{ref:module:ml-scorer}} เป็น parallel consumer ที่ประเมิน signal เดียวกันพร้อมกันโดยไม่รอกัน",
    "{{ref:module:velocity-tracker}} subscribe `signal.received` เพื่ออัปเดต counter แบบ real-time โดยไม่ต้องผ่าน case-manager — ออกแบบแบบนี้เพื่อให้ velocity data พร้อมใช้ทันทีที่ rule-engine หรือ ml-scorer ต้องการ โดยไม่เพิ่ม latency ของ critical path",
  ],
  modules: [
    {
      slug: "signal-collector",
      name: "signal-collector",
      tags: ["signal", "module", "core"],
      description:
        "รับ raw event จาก API gateway แล้วแปลงเป็น structured signal ก่อนส่งต่อเข้า analysis pipeline ทำหน้าที่เป็น schema validator และ enrichment layer — เพิ่มข้อมูลที่ขาด เช่น IP geolocation, device metadata, และ timestamp normalization ก่อนที่ downstream service อื่นจะเห็น event",
      functions: [
        { sig: "ingestEvent(rawEvent: RawEvent): Promise<Signal>", desc: "รับ event ดิบ validate schema แล้วแปลงเป็น Signal object พร้อม enrich metadata" },
        { sig: "enrichWithGeolocation(ip: string): Promise<GeoData>", desc: "แปลง IP address เป็นข้อมูลตำแหน่งและ ISP ใช้ใน risk scoring" },
        { sig: "publishSignal(signal: Signal): Promise<void>", desc: "ส่ง signal เข้า queue เพื่อให้ rule-engine และ ml-scorer consume พร้อมกัน" },
        { sig: "replaySignals(from: string, to: string, eventType?: string): Promise<number>", desc: "replay signal ในช่วงเวลาที่กำหนด ใช้ตอน backtest rule ใหม่หรือ diagnose ML drift" },
      ],
      stateFlow: "received → validated | rejected (schema error) → enriched → published",
      relatedNotes:
        "ไม่ตัดสินใจเรื่อง fraud เลย — เป็นแค่ ingest และ normalize layer ถ้า schema ไม่ตรงจะ reject และ log เป็น `warn` ไม่ใช่ error เพราะ client อาจส่ง event version เก่าระหว่าง migration ดู {{ref:convention:signal-schema-convention}} สำหรับ schema ที่รองรับ",
      internals: {
        constants: [
          { name: "SIGNAL_SCHEMA_VERSION", value: "\"3.2\"" },
          { name: "GEO_LOOKUP_TIMEOUT_MS", value: "500" },
          { name: "SIGNAL_RETENTION_DAYS", value: "90" },
        ],
        typeSnippet:
          "interface Signal {\n  eventId: string;\n  eventType: \"account_creation\" | \"login\" | \"promo_redemption\" | \"review_submission\" | \"bot_activity\";\n  userId: string;\n  deviceId: string;\n  ip: string;\n  geo: GeoData;\n  receivedAt: string; // ISO 8601 UTC\n  payload: Record<string, unknown>;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง signal retention ที่ {{ref:policy:signal-retention-policy}}",
      },
    },
    {
      slug: "rule-engine",
      name: "rule-engine",
      tags: ["rules", "module", "core"],
      description:
        "ประเมิน signal ด้วยชุด rule แบบ deterministic ให้ partial score และ rule_flags ที่อ่านออกได้ทันที แยกออกมาจาก ml-scorer เพื่อให้ทีม ops เข้าใจและแก้ rule ได้โดยไม่ต้องรู้ ML เลย rule แต่ละตัว versioned และ auditable ทุก change",
      functions: [
        { sig: "evaluateSignal(signal: Signal): Promise<RuleResult>", desc: "รัน rule ทุกตัวที่ active กับ signal นี้ คืน partial score และ list ของ rule ที่ trigger" },
        { sig: "activateRule(ruleId: string, activatedBy: string): Promise<void>", desc: "เปิดใช้ rule version ใหม่ บันทึก audit log ดู {{ref:policy:rule-override-approval-policy}}" },
        { sig: "deactivateRule(ruleId: string, reason: string, approvedBy: string): Promise<void>", desc: "ปิด rule พร้อมบันทึกเหตุผลและผู้อนุมัติ ห้ามปิดโดยไม่มี approval" },
        { sig: "getRuleHistory(ruleId: string): Promise<RuleVersion[]>", desc: "คืน version history ทั้งหมดของ rule เพื่อ audit ว่า rule เปลี่ยนไปอย่างไร" },
      ],
      stateFlow: "signal_received → rules_evaluated → scored (partial) → published_to_case_manager",
      relatedNotes:
        "ไม่รู้จักผล score ของ {{ref:module:ml-scorer}} เลยในขณะที่ตัวเองกำลัง evaluate — rule และ ML score ถูก aggregate ที่ {{ref:module:case-manager}} ในภายหลัง เพื่อไม่ให้ rule logic ผสมกับ ML logic ในจุดเดียว",
      internals: {
        constants: [
          { name: "RULE_ENGINE_VERSION", value: "\"2.1\"" },
          { name: "MAX_RULES_PER_EVALUATION", value: "200" },
          { name: "RULE_EVALUATION_TIMEOUT_MS", value: "80" },
        ],
        typeSnippet:
          "interface RuleResult {\n  eventId: string;\n  triggeredRules: { ruleId: string; score: number; reason: string }[];\n  partialScore: number;\n  evaluatedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง override approval ที่ {{ref:policy:rule-override-approval-policy}}",
      },
    },
    {
      slug: "ml-scorer",
      name: "ml-scorer",
      tags: ["ml", "scoring", "module", "core"],
      description:
        "ให้คะแนนความเสี่ยงของ signal ด้วย ML model ที่ train บน behavioral pattern ประวัติศาสตร์ model อัปเดตแบบ scheduled retrain ไม่ใช่ online learning เพื่อให้สามารถ validate model ก่อน deploy ได้ครบถ้วน แยกออกมาเป็น service เพื่อให้ model upgrade ไม่กระทบ rule-engine",
      functions: [
        { sig: "scoreSignal(signal: Signal): Promise<MLScore>", desc: "ให้คะแนน 0-100 พร้อม feature contribution ที่ใช้ตัดสิน" },
        { sig: "getModelVersion(): Promise<ModelInfo>", desc: "คืน version ของ model ที่ deploy อยู่ปัจจุบัน พร้อม metadata เช่น precision และ recall บน validation set" },
        { sig: "runShadowScoring(signal: Signal, modelVersion: string): Promise<MLScore>", desc: "รัน model version อื่นแบบ shadow mode เพื่อเปรียบเทียบ score ก่อน promote เป็น production" },
      ],
      stateFlow: "signal_received → features_extracted → model_inference → score_published",
      relatedNotes:
        "ใช้ feature จาก {{ref:module:velocity-tracker}} และ {{ref:module:device-fingerprinter}} แบบ synchronous call ระหว่าง feature extraction ถ้า call เหล่านี้ช้าหรือ fail จะใช้ค่า fallback เพื่อไม่ให้ scoring latency เกิน SLA ดู {{ref:policy:analyst-review-sla-policy}}",
      internals: {
        constants: [
          { name: "SCORING_TIMEOUT_MS", value: "120" },
          { name: "HIGH_RISK_THRESHOLD", value: "75" },
          { name: "MODEL_RETRAIN_INTERVAL_DAYS", value: "14" },
        ],
        typeSnippet:
          "interface MLScore {\n  eventId: string;\n  score: number; // 0-100\n  confidence: \"high\" | \"medium\" | \"low\";\n  topFeatures: { name: string; contribution: number }[];\n  modelVersion: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง score threshold ที่ {{ref:policy:score-threshold-policy}}",
      },
    },
    {
      slug: "case-manager",
      name: "case-manager",
      tags: ["case", "module"],
      description:
        "รวม output จาก {{ref:module:rule-engine}} และ {{ref:module:ml-scorer}} แล้วตัดสินใจ final action (block, review, allow) ตาม policy สร้าง fraud case สำหรับ event ที่ต้องให้ analyst ดู และบริหารจัดการ queue การ review ให้อยู่ใน SLA ที่กำหนด ทุก decision มี audit trail ที่ service นี้เก็บไว้",
      functions: [
        { sig: "processScores(ruleResult: RuleResult, mlScore: MLScore): Promise<Decision>", desc: "รวม score สองแหล่งแล้วตัดสินใจ action สุดท้ายตาม {{ref:policy:score-threshold-policy}}" },
        { sig: "createCase(eventId: string, decision: Decision): Promise<FraudCase>", desc: "สร้าง case ใหม่สำหรับ event ที่ต้อง review และใส่ลงใน analyst queue" },
        { sig: "resolveCase(caseId: string, resolution: Resolution, resolvedBy: string): Promise<void>", desc: "ปิด case พร้อมบันทึก resolution ของ analyst" },
        { sig: "getQueueStats(): Promise<QueueStats>", desc: "คืนสถิติของ review queue เช่น depth, average wait time, SLA breach rate" },
      ],
      relatedNotes:
        "เป็น service เดียวที่ client application รอ response เพื่อตัดสินใจว่าจะ allow หรือ block action — ทำให้ latency ของ case-manager ส่งผล UX ตรงๆ ดู {{ref:policy:analyst-review-sla-policy}} สำหรับ target latency",
    },
    {
      slug: "device-fingerprinter",
      name: "device-fingerprinter",
      tags: ["device", "fingerprint", "module"],
      description:
        "สร้างและจัดการ device fingerprint จากข้อมูล browser/app ที่รวบรวมจาก client เช่น screen resolution, timezone, installed fonts, canvas rendering, และ WebGL signature รวมกันเป็น fingerprint เดียวเพื่อระบุ device ได้แม้ไม่มี cookie หรือ device ID ชัดเจน",
      functions: [
        { sig: "computeFingerprint(deviceAttributes: DeviceAttributes): Promise<string>", desc: "คำนวณ fingerprint hash จาก device attribute ที่รับมา" },
        { sig: "getTrustScore(fingerprint: string): Promise<number>", desc: "คืน trust score 0-100 ของ device นี้จากประวัติการใช้งานในอดีต" },
        { sig: "decayTrustScore(fingerprint: string, reason: string): Promise<void>", desc: "ลด trust score เมื่อพบ suspicious behavior ดู {{ref:policy:device-trust-decay-policy}}" },
      ],
      relatedNotes:
        "{{ref:module:ml-scorer}} เรียก `getTrustScore` ระหว่าง feature extraction เพื่อนำ device trust เป็น feature หนึ่งใน model fingerprint ที่มีประวัติทุจริตซ้ำจะมีคะแนนต่ำลง ทำให้ score จาก ml-scorer สูงขึ้นโดยอัตโนมัติ",
    },
    {
      slug: "velocity-tracker",
      name: "velocity-tracker",
      tags: ["velocity", "tracking", "module"],
      description:
        "นับความถี่ (velocity) ของ event ตาม dimension ต่างๆ เช่น จำนวน login attempt ต่อ IP ใน 5 นาที, จำนวน promo redemption ต่อ account ใน 1 ชั่วโมง, หรือจำนวน account สมัครจาก email domain เดียวกันใน 1 วัน counter เหล่านี้เป็น feature สำคัญที่ทั้ง rule-engine และ ml-scorer ใช้",
      functions: [
        { sig: "increment(dimension: string, key: string, windowSec: number): Promise<number>", desc: "เพิ่ม counter สำหรับ dimension/key และคืนค่าปัจจุบัน — atomic operation" },
        { sig: "getCount(dimension: string, key: string, windowSec: number): Promise<number>", desc: "อ่าน counter ปัจจุบันโดยไม่เพิ่มค่า" },
        { sig: "configureWindow(dimension: string, windowSec: number): Promise<void>", desc: "ตั้งค่า time window ของ dimension ตาม {{ref:policy:velocity-window-config-policy}}" },
      ],
      relatedNotes:
        "ใช้ sliding window algorithm ใน Redis เพื่อให้ counter decay ตามเวลาจริงแทนการ reset เป็นศูนย์ทุก interval — ป้องกัน burst attack ที่จัดเวลาให้พอดีกับจุดที่ counter รีเซ็ต ดู {{ref:policy:velocity-window-config-policy}} สำหรับ window ที่ใช้แต่ละ dimension",
    },
  ],
  envVarGroups: [
    {
      service: "signal-collector-service",
      vars: [
        { name: "SIGNAL_SCHEMA_VERSION", example: "3.2", note: "version ที่รองรับ reject version เก่ากว่านี้" },
        { name: "GEO_LOOKUP_TIMEOUT_MS", example: "500", note: "เกินนี้ใช้ geo ว่างเปล่าแทน ไม่บล็อก signal" },
        { name: "SIGNAL_RETENTION_DAYS", example: "90", note: "ดู {{ref:policy:signal-retention-policy}}" },
      ],
    },
    {
      service: "rule-engine-service",
      vars: [
        { name: "RULE_EVALUATION_TIMEOUT_MS", example: "80", note: "เกินนี้คืน partial result ที่ evaluate ได้แทน timeout error" },
        { name: "RULE_ENGINE_DB_URL", example: "postgres://rule-db.internal:5432/rules", note: "secret ห้าม log" },
        { name: "RULE_MAX_PER_EVALUATION", example: "200", note: "cap จำนวน rule ที่ evaluate ต่อ signal เพื่อกัน runaway" },
      ],
    },
    {
      service: "ml-scorer-service",
      vars: [
        { name: "ML_SCORING_TIMEOUT_MS", example: "120", note: "เกินนี้คืน score จาก fallback model" },
        { name: "ML_HIGH_RISK_THRESHOLD", example: "75", note: "ดู {{ref:policy:score-threshold-policy}}" },
        { name: "ML_MODEL_ARTIFACT_PATH", example: "s3://shieldai-models/prod/v12.3.bin", note: "path ของ model artifact ปัจจุบัน" },
      ],
    },
    {
      service: "velocity-tracker-service",
      vars: [
        { name: "VELOCITY_REDIS_URL", example: "redis://velocity-cache.internal:6379", note: "secret ห้าม log" },
        { name: "VELOCITY_DEFAULT_WINDOW_SEC", example: "300", note: "ดู {{ref:policy:velocity-window-config-policy}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "score-threshold-policy",
      title: "นโยบาย Score Threshold สำหรับ Block/Review/Allow",
      tags: ["scoring", "threshold", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:case-manager}} ใช้ combined score (weighted average ของ rule score และ ML score) เพื่อตัดสินใจ action: score ≥ 80 → block ทันที, score 50-79 → ส่ง analyst review queue, score < 50 → allow โดยไม่มีการดำเนินการเพิ่มเติม",
        "threshold เหล่านี้เป็น policy-level decision ไม่ใช่ technical config ที่เปลี่ยนได้โดยไม่มีกระบวนการ — การเปลี่ยนต้องผ่าน Data Science team และ Risk & Compliance อนุมัติทุกครั้ง เพราะส่งผลโดยตรงต่อ false positive และ false negative rate",
      ],
      sections: [
        {
          heading: "Weighted average ระหว่าง rule score และ ML score",
          body: "ปัจจุบัน weight คือ rule: 40%, ML: 60% — น้ำหนัก ML สูงกว่าเพราะ model มี recall ที่ดีกว่า rule สำหรับ fraud pattern ใหม่ๆ แต่ rule ยังสำคัญเพราะ explainability สำหรับทีม ops และ regulator",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น Score Threshold สำหรับ Account สมัครใหม่ภายใน 24 ชั่วโมง",
        tags: ["scoring", "threshold", "new-account", "edge-case"],
        body: [
          "account ที่สมัครใหม่ไม่เกิน 24 ชั่วโมงได้รับ threshold ที่ strict กว่า: score ≥ 60 → block ทันที เพราะยังไม่มีประวัติการใช้งานพอที่จะให้ ML model ประเมินได้แม่นยำ และ fraudster มักใช้บัญชีใหม่เพื่อหลีกเลี่ยงการตรวจจับ",
          "ถ้า account ใหม่มาจาก device ที่มี trust score > 90 (ดู {{ref:module:device-fingerprinter}}) จะได้รับ threshold ปกติ เพราะ device trust บ่งบอกว่าเป็น existing customer ที่สมัคร account ใหม่ ไม่ใช่ fraudster จริง",
        ],
      },
    },
    {
      slug: "rule-override-approval-policy",
      title: "นโยบายการ Override Rule และการอนุมัติ",
      tags: ["rule-engine", "approval", "policy"],
      isPrimary: true,
      intro: [
        "การ deactivate หรือ override rule ที่ active อยู่ต้องได้รับการอนุมัติจากหัวหน้าทีม Fraud Operations หรือ Risk & Compliance ล่วงหน้า ห้ามทำโดยตรงผ่าน admin console โดยไม่มีกระบวนการนี้ เพราะ rule บาง rule ถูกออกแบบตอบสนองต่อ regulatory requirement",
        "ทุกการเปิด/ปิด/แก้ไข rule ถูก log โดย {{ref:module:rule-engine}} พร้อม timestamp, ผู้ดำเนินการ, และ approver — log นี้ไม่สามารถแก้ไขได้ เพราะเป็นส่วนหนึ่งของ compliance evidence",
      ],
      edgeCase: {
        title: "Emergency Override เมื่อ Rule ทำให้ False Positive พุ่งวิกฤต",
        tags: ["rule-engine", "approval", "emergency", "edge-case"],
        body: [
          "ในกรณีที่ rule ทำให้ false positive rate พุ่งเกิน 15% ภายในช่วงเวลาสั้น (ซึ่งกระทบลูกค้าจริงจำนวนมาก) on-call lead มีสิทธิ์ temporary disable rule ได้ทันทีโดยไม่ต้องรอ approval ล่วงหน้า แต่ต้องส่งไฟล์ notification ให้ทีม Risk ภายใน 15 นาทีหลังดำเนินการ",
          "การ emergency disable จะมีอายุ 4 ชั่วโมงเท่านั้นก่อน auto-reenable อัตโนมัติ เพื่อบังคับให้มีการ decision สุดท้ายจากทีม Risk ก่อนที่ disable จะมีผลถาวร",
        ],
      },
    },
    {
      slug: "false-positive-appeal-policy",
      title: "นโยบายการ Appeal กรณี False Positive",
      tags: ["appeal", "false-positive", "policy"],
      isPrimary: true,
      intro: [
        "ผู้ใช้ที่ถูก block โดย ShieldAI มีสิทธิ์ยื่น appeal ผ่าน customer support ภายใน 7 วันหลัง block เพื่อให้ analyst ตรวจสอบ การ appeal ไม่ได้ reverse block ทันที — analyst ต้องตรวจสอบและ resolve ใน {{ref:module:case-manager}} ก่อน",
        "{{ref:module:case-manager}} จะสร้าง appeal case ที่มี priority สูงกว่า case ปกติ เพื่อให้ review ภายใน SLA ที่สั้นกว่า (ดู {{ref:policy:analyst-review-sla-policy}}) เพราะผู้ใช้ที่ถูก block กำลังรอใช้งาน service อยู่",
      ],
      edgeCase: {
        title: "Auto-Approval ของ Appeal ที่มีหลักฐานชัดเจน",
        tags: ["appeal", "false-positive", "auto-approval", "edge-case"],
        body: [
          "appeal บางประเภทสามารถ auto-approve ได้โดยไม่ต้องให้ analyst ดู ถ้าตรงเงื่อนไขทั้งหมด: block เกิดจาก rule เดียว (ไม่ใช่ ML score), rule นั้น block เพราะ velocity threshold, และ velocity counter reset ในภายหลัง (บ่งบอกว่าเป็น burst ชั่วคราว ไม่ใช่ pattern ต่อเนื่อง)",
          "ห้าม auto-approve appeal ที่ ML score เกิน 60 ไม่ว่ากรณีใดทั้งสิ้น เพราะ ML score สูงบ่งบอกถึง behavioral pattern ที่ต้องการ human judgment เสมอ ดูบทเรียนจาก {{ref:incident:appeal-auto-approval-bug}}",
        ],
      },
    },
    {
      slug: "velocity-window-config-policy",
      title: "นโยบายการตั้งค่า Velocity Window",
      tags: ["velocity", "configuration", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:velocity-tracker}} ใช้ time window ที่แตกต่างกันตาม dimension เช่น login attempt ใช้ window 5 นาที ส่วน account creation จาก IP เดียวกันใช้ window 1 ชั่วโมง การเลือก window ที่เหมาะสมต้องสมดุลระหว่าง sensitivity (จับ attack ได้เร็ว) และ specificity (ไม่ false positive กับ burst ปกติ)",
        "การเปลี่ยน window config ต้องทดสอบกับ historical data ย้อนหลัง 30 วันก่อนเสมอ เพื่อวัด impact ต่อ false positive rate ก่อน deploy จริง ห้ามเปลี่ยนใน production โดยตรงโดยไม่ผ่าน testing",
      ],
      edgeCase: {
        title: "Velocity Window สำหรับ Event ระหว่าง Holiday Season",
        tags: ["velocity", "configuration", "holiday", "edge-case"],
        body: [
          "ช่วง major holiday (เช่น New Year, Songkran) velocity ปกติสูงขึ้นอย่างมีนัยสำคัญแม้สำหรับผู้ใช้จริงทั่วไป ทำให้ threshold ปกติ trigger false positive จำนวนมาก ระบบรองรับ \"holiday mode\" ที่ขยาย window และเพิ่ม threshold สำหรับ dimension ที่ได้รับผลกระทบ",
          "holiday mode ต้องตั้งค่าล่วงหน้าอย่างน้อย 48 ชั่วโมงก่อนเทศกาล และมีกำหนดวันหมดอายุชัดเจน ไม่มีกรณีที่ holiday mode เปิดค้างไว้โดยไม่มีวันสิ้นสุด เพราะจะลด sensitivity ของระบบอย่างถาวร",
        ],
      },
    },
    {
      slug: "device-trust-decay-policy",
      title: "นโยบาย Device Trust Decay",
      tags: ["device", "trust", "policy"],
      isPrimary: true,
      intro: [
        "trust score ของ device เริ่มต้นที่ 50 สำหรับ device ที่ไม่เคยเห็นมาก่อน และเพิ่มขึ้นช้าๆ เมื่อ device มีประวัติ legitimate transaction ต่อเนื่อง trust score ลดลงเมื่อพบ suspicious behavior และไม่สามารถ recover กลับมาเองได้ — ต้องผ่านกระบวนการ manual review",
        "device ที่มี trust score ต่ำกว่า 20 จะถูก flag ว่า `untrusted` และ {{ref:module:ml-scorer}} จะได้รับ signal นี้เป็น feature weight พิเศษ ส่งผล ML score สูงขึ้นแม้ behavior อื่นจะดูปกติ",
      ],
      edgeCase: {
        title: "Device Trust ลดลงจาก IP Sharing (NAT/VPN/Library/Office)",
        tags: ["device", "trust", "shared-ip", "edge-case"],
        body: [
          "device ที่ใช้ IP ร่วมกับ device อื่นที่ถูก flag ว่า untrusted (เช่น ใช้ WiFi สาธารณะหรือ corporate NAT เดียวกัน) จะไม่ถูก penalize trust score เพียงเพราะ IP sharing เพียงอย่างเดียว — IP sharing เป็น feature หนึ่งที่ใช้ใน ML scoring แต่ไม่ใช่ trigger สำหรับ trust decay โดยตรง",
          "ยกเว้นกรณีที่ device ส่ง event ที่ pattern เหมือน device untrusted อื่นมากผิดปกติ (cosine similarity > 0.9 บน behavioral vector) ซึ่ง {{ref:module:ml-scorer}} จะ flag ให้ human review แทนที่จะ auto-decay trust",
        ],
      },
    },
    {
      slug: "analyst-review-sla-policy",
      title: "นโยบาย SLA การ Review Case ของ Analyst",
      tags: ["case-management", "sla", "policy"],
      isPrimary: true,
      intro: [
        "case ที่ {{ref:module:case-manager}} ส่งเข้า review queue มี SLA ตามประเภท: high-risk case (score 70-79) ต้อง review ภายใน 2 ชั่วโมง, medium-risk case (score 50-69) ภายใน 8 ชั่วโมง, appeal case ภายใน 1 ชั่วโมงเสมอ",
        "ถ้า case อยู่ใน queue เกิน 80% ของ SLA แล้วยังไม่มี analyst รับ ระบบจะ escalate อัตโนมัติไปยัง senior analyst และส่ง alert ให้ Fraud Ops lead รับทราบ",
      ],
      edgeCase: {
        title: "SLA กรณี Queue Overflow ระหว่าง Security Incident ขนาดใหญ่",
        tags: ["case-management", "sla", "overflow", "edge-case"],
        body: [
          "ถ้า {{ref:module:case-manager}} ตรวจพบว่า case volume เพิ่มขึ้นเกิน 300% ของ baseline ภายใน 30 นาที (สัญญาณของ coordinated attack) ระบบจะเข้าสู่ triage mode: case ใหม่ที่ score ต่ำกว่า 70 จะถูก auto-hold โดยไม่ส่ง reviewer alert เพื่อไม่ให้ queue ล้น",
          "ในช่วง triage mode การ block decision ยังทำงานปกติสำหรับ score ≥ 80 — เฉพาะ review queue เท่านั้นที่ถูก throttle ดังนั้น protection ระดับ hard block ยังคงมีผลอยู่เสมอ",
        ],
      },
    },
    {
      slug: "signal-retention-policy",
      title: "นโยบายการเก็บรักษา Signal",
      tags: ["signal", "retention", "policy"],
      isPrimary: false,
      intro: [
        "raw signal ที่ {{ref:module:signal-collector}} รับเข้ามาถูกเก็บไว้ 90 วันใน hot storage แล้ว archive ไปยัง cold storage ต่ออีก 3 ปีเพื่อรองรับ regulatory requirement และการ forensic investigation",
        "ข้อมูลที่ถือว่า PII (เช่น email, phone number ที่ผ่าน signal) ต้องผ่าน pseudonymization ก่อน archive โดยเก็บ mapping key ไว้แยกต่างหากพร้อม access control ที่เข้มงวดกว่า",
      ],
    },
    {
      slug: "model-drift-response-policy",
      title: "นโยบายการตอบสนองต่อ ML Model Drift",
      tags: ["ml", "drift", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:ml-scorer}} monitor metric เช่น precision, recall, และ false positive rate แบบ continuous ถ้า metric เหล่านี้เบี่ยงเบนจาก baseline เกิน 10% ติดต่อกันนาน 24 ชั่วโมง ถือว่าเกิด model drift และต้อง trigger emergency retrain",
        "ระหว่างรอ retrain เสร็จ weight ของ ML score ใน combined score จะถูกปรับลดลงโดยอัตโนมัติ และ rule-engine score ได้น้ำหนักเพิ่มขึ้นเพื่อ compensate ลด exposure ระหว่างที่ model ไม่ reliable",
      ],
    },
    {
      slug: "case-escalation-policy",
      title: "นโยบาย Case Escalation",
      tags: ["case-management", "escalation", "policy"],
      isPrimary: false,
      intro: [
        "case ที่ analyst ตรวจสอบแล้วไม่สามารถ resolve ได้ด้วยข้อมูลปัจจุบัน สามารถ escalate ไปยัง senior analyst หรือ risk specialist ได้ พร้อม reason ที่ชัดเจน escalation ไม่ได้ปิด original case แต่สร้าง sub-task ใหม่ที่เชื่อมกัน",
        "case ที่ escalate แล้วยังไม่มีการตัดสินใจสุดท้ายภายใน 24 ชั่วโมง จะถูก auto-assign ให้ Fraud Ops lead โดยอัตโนมัติ เพราะการค้างนานเกินนี้มักหมายความว่าต้องการ policy decision ไม่ใช่แค่ข้อมูลเพิ่มเติม",
      ],
    },
    {
      slug: "device-fingerprint-collision-policy",
      title: "นโยบายเมื่อเกิด Device Fingerprint Collision",
      tags: ["device", "fingerprint", "collision", "policy"],
      isPrimary: false,
      intro: [
        "device fingerprint collision เกิดเมื่อสองอุปกรณ์ต่างกันให้ fingerprint hash เดียวกัน ซึ่งทำให้ trust score ปนกัน {{ref:module:device-fingerprinter}} ตรวจจับ collision โดย monitor behavioral divergence ระหว่าง session ที่ fingerprint เหมือนกัน",
        "เมื่อตรวจพบ collision ระบบจะสร้าง new fingerprint variant ให้แต่ละ device โดยใช้ additional attribute เพิ่มเติม และ migrate trust score แบบ conservative (ใช้ค่าต่ำสุดของทั้งสอง) เพื่อความปลอดภัย",
      ],
    },
    {
      slug: "promotion-abuse-detection-policy",
      title: "นโยบายตรวจจับการใช้โปรโมชั่นผิดวัตถุประสงค์",
      tags: ["promo", "abuse", "policy"],
      isPrimary: false,
      intro: [
        "การใช้โปรโมชั่น เช่น referral code หรือ discount voucher เป็น fraud vector ที่พบบ่อย ระบบ ShieldAI ตรวจจับ promo abuse โดยวิเคราะห์ pattern เช่น account ใหม่ที่ redeem promo แล้วไม่มีกิจกรรมหลังจากนั้น, หรือ promo redemption ที่มาจาก device cluster เดียวกันหลายบัญชี",
        "account ที่ถูก flag ว่า promo abuse จะไม่ถูก block ทันที — จะถูกจำกัดสิทธิ์ promo redemption ในอนาคตและส่งเข้า review queue สำหรับ manual decision เพื่อลด false positive กับผู้ใช้จริงที่แชร์ promo กับครอบครัว",
      ],
    },
  ],
  incidents: [
    {
      slug: "rule-engine-race-condition-double-block",
      title: "Race condition ใน rule-engine บล็อกผู้ใช้คนเดียวสองครั้งพร้อมกัน",
      tags: ["rule-engine", "race-condition"],
      summary:
        "ผู้ใช้บางรายได้รับ block notification สองครั้งต่อ event เดียวกัน และ case ถูกสร้างซ้ำสองใน {{ref:module:case-manager}} ทำให้ analyst ต้อง review case เดิมสองครั้งและ duplicate decision",
      investigation:
        "ตรวจ log ของ {{ref:module:rule-engine}} พบว่า `evaluateSignal` ถูกเรียกสองครั้งสำหรับ event เดียวกัน เพราะ message queue deliver `signal.received` event ซ้ำเพราะ consumer ไม่ acknowledge ทันก่อน timeout",
      cause:
        "rule-engine consumer ใช้เวลาประมวลผล rule มากกว่า queue acknowledgment timeout ในบางกรณีที่มี rule จำนวนมาก ทำให้ queue คิดว่า consumer ล้มเหลวและ redeliver event ทั้งที่ consumer ยังทำงานอยู่",
      resolution:
        "เพิ่ม idempotency check โดยใช้ `eventId` เพื่อกัน duplicate processing และขยาย acknowledgment timeout ให้มากกว่า `RULE_EVALUATION_TIMEOUT_MS` ไปอีก 2 เท่า",
      followup:
        "ตรวจสอบ consumer ทุกตัวที่ subscribe `signal.received` ว่าทุกตัวมี idempotency check และ document ว่า queue มี at-least-once guarantee ไม่ใช่ exactly-once ใน {{ref:convention:signal-schema-convention}}",
    },
    {
      slug: "ml-model-drift-false-positive-spike",
      title: "ML model drift ทำให้ false positive พุ่งสูง 4 เท่าใน 1 วัน",
      tags: ["ml", "drift", "false-positive"],
      summary:
        "false positive rate ของ {{ref:module:ml-scorer}} พุ่งจาก 2% เป็นเกือบ 8% ภายใน 6 ชั่วโมง ลูกค้าจำนวนมากถูก block ทั้งที่ไม่ได้ทำอะไรผิด",
      investigation:
        "ตรวจ feature importance ของ model พบว่า feature `session_duration_sec` มีค่า distribution เปลี่ยนไปมากหลัง app update ใหม่ที่ส่งมา session metric ในหน่วยมิลลิวินาทีแทนวินาที — model ตีความ session ปกติ (เช่น 120 วินาที) เป็น 120,000 milliseconds ซึ่ง out of distribution มาก",
      cause:
        "App version ใหม่เปลี่ยนหน่วยของ `session_duration` แต่ไม่ได้แจ้ง Data Science team ล่วงหน้า feature schema ไม่มี unit enforcement ทำให้ model รับ value ที่ scale ต่างกัน 1000 เท่าโดยไม่รู้ตัว",
      resolution:
        "ลด weight ของ ML score ชั่วคราวตาม {{ref:policy:model-drift-response-policy}} และ normalization patch ใน signal-collector ที่ detect unit และแปลงก่อน publish signal แก้ false positive rate กลับมาปกติภายใน 2 ชั่วโมง",
      followup:
        "เพิ่ม schema validation ระดับ unit สำหรับ numeric feature ทุกตัวใน signal schema และตั้ง process ที่ App team ต้องแจ้ง Data Science ก่อน release ที่เปลี่ยน signal field",
    },
    {
      slug: "device-fingerprint-collision",
      title: "Fingerprint collision ทำให้ trust score ปนกันข้ามผู้ใช้",
      tags: ["device", "fingerprint", "collision"],
      summary:
        "ผู้ใช้ที่ถูก flag ว่า untrusted กระทบไปถึงผู้ใช้อีกรายที่ใช้ device configuration เหมือนกันทุกอย่าง ทำให้คนบริสุทธิ์ถูก penalize จาก device trust score ที่ปนกัน",
      investigation:
        "ตรวจ {{ref:module:device-fingerprinter}} พบว่า fingerprint ทั้งสองมาจาก screen resolution, timezone, และ browser version เดียวกันทุกอย่าง เพราะทั้งคู่ใช้ company-issued laptop รุ่นเดียวกัน",
      cause:
        "fingerprint algorithm ไม่ได้ include attribute ที่มีความ entropy สูงพอสำหรับ corporate device fleet ที่มีการ standardize hardware — attribute ที่เพิ่ม entropy เช่น installed extension และ font subset ถูกตัดออกเพราะ performance ตอนออกแบบ",
      resolution:
        "เพิ่ม stochastic attribute จาก WebGL rendering timestamp fingerprint ที่แตกต่างกันแม้ hardware เหมือนกัน และ migrate ทั้งสอง device ออกจาก collision ตาม {{ref:policy:device-fingerprint-collision-policy}}",
      followup:
        "ทบทวน attribute set ของ fingerprint algorithm ว่ามี entropy เพียงพอสำหรับ enterprise user ที่ใช้ standardized device และเพิ่ม collision detection monitoring เป็น metric ที่ track ต่อเนื่อง",
    },
    {
      slug: "velocity-counter-reset-bug",
      title: "Velocity counter reset ทุกชั่วโมงแทนที่จะเป็น sliding window",
      tags: ["velocity", "bug"],
      summary:
        "attack ที่ใช้ volume สูงใน burst หลีกเลี่ยงการตรวจจับได้เป็นเวลา 2 วัน เพราะ velocity counter รีเซ็ตทุกชั่วโมงพอดีแทนที่จะเป็น sliding window ตามที่ออกแบบไว้",
      investigation:
        "ตรวจ {{ref:module:velocity-tracker}} พบว่า Redis key ที่ใช้เก็บ counter ถูกตั้ง TTL เป็น 3600 วินาที (1 ชั่วโมง) แบบ fixed แทนที่จะ extend TTL ทุกครั้งที่มี event ใหม่ในลักษณะ sliding window",
      cause:
        "developer implement `increment` ด้วย `EXPIRE key 3600` ซึ่ง set TTL แบบ absolute เพียงครั้งเดียว แทนที่จะใช้ sorted set with timestamp หรือ algorithm อื่นที่ implement sliding window จริงๆ",
      resolution:
        "ย้าย implementation ไปใช้ Redis sorted set ที่ remove member ที่อายุเกิน window ทุก increment และ replay historical data เพื่อ backfill counter ที่ถูกต้อง",
      followup:
        "เพิ่ม integration test ที่ verify sliding window behavior โดย inject event ข้ามจุด boundary ของ window และ document algorithm choice ใน {{ref:convention:signal-schema-convention}}",
    },
    {
      slug: "case-manager-queue-overflow",
      title: "Case manager review queue ล้น 10,000 cases ระหว่าง coordinated attack",
      tags: ["case-management", "queue", "overflow"],
      summary:
        "ช่วง coordinated bot attack {{ref:module:case-manager}} สร้าง case มากกว่า 10,000 ใน 30 นาที review queue ล้นและ analyst ไม่สามารถ keep up ได้ ส่งผลให้ SLA breach ทุก case",
      investigation:
        "ตรวจพบว่าออร์เดอร์ส่วนใหญ่เป็น bot activity ที่มี ML score 65-75 ซึ่งตกในช่วง review แทนที่จะเป็น block — pattern นี้เป็นการออกแบบของ attacker เพื่อหลีกเลี่ยง hard block threshold แต่ท่วม review queue แทน",
      cause:
        "ไม่มี triage mode ตามที่ระบุใน {{ref:policy:analyst-review-sla-policy}} ณ เวลานั้น — ระบบสร้าง case ทุกกรณีที่ score อยู่ในช่วง review โดยไม่มี circuit breaker สำหรับ volume spike",
      resolution:
        "ปรับ threshold ชั่วคราวให้ block ที่ score ≥ 65 แทน 80 ด้วยมือ ซึ่งลด case volume ลง 70% ทันที และ clear queue backlog ด้วยการ batch auto-resolve case ที่มี identical signature ว่าเป็น bot",
      followup:
        "Implement triage mode ตาม spec ใน {{ref:policy:analyst-review-sla-policy}} ที่ allow temporary threshold adjustment แบบ automated และเพิ่ม alert สำหรับ queue depth ที่พุ่งเกิน 300% ของ 30-minute baseline",
    },
    {
      slug: "appeal-auto-approval-bug",
      title: "Appeal ที่มี ML score สูงถูก auto-approve โดยไม่มี human review",
      tags: ["appeal", "auto-approval", "bug"],
      summary:
        "appeal บางรายการที่ ML score เกิน 60 ถูก auto-approve โดยไม่ผ่าน analyst ขัด {{ref:policy:false-positive-appeal-policy}} ทำให้ account ที่ยังมี high-risk signal กลับมา active ได้โดยไม่มีการตรวจสอบ",
      investigation:
        "ตรวจ auto-approval logic ใน {{ref:module:case-manager}} พบว่า condition check เรื่อง ML score ใช้ `mlScore < 60` แต่ข้อมูลจาก database เก็บ score แบบ `float` ทำให้ score ที่ควรเป็น 60.0 บันทึกเป็น 59.999... ผ่าน condition ได้",
      cause:
        "Floating point precision issue ใน condition check ร่วมกับการ round ที่ไม่ consistent ระหว่าง ml-scorer (ที่ return float) และ case-manager (ที่เปรียบเทียบกับ integer threshold)",
      resolution:
        "แก้ condition ให้ใช้ `mlScore < 60.0` แบบ explicit float comparison และเพิ่ม `Math.round()` ก่อนการเปรียบเทียบทุกครั้ง review และ re-assess case ที่ถูก incorrectly auto-approve ทั้งหมด",
      followup:
        "เพิ่ม test case ที่ใช้ boundary value เช่น 59.999, 60.0, 60.001 และ document floating point convention ใน {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "signal-collector-data-loss",
      title: "Signal collector ทิ้ง signal ช่วง restart โดยไม่มี backpressure",
      tags: ["signal", "data-loss"],
      summary:
        "ช่วง rolling restart ของ signal-collector service signal ประมาณ 3,000 events หายไปโดยไม่ถูก process เพราะ in-flight event ใน buffer ไม่ได้ถูก drain ก่อน shutdown",
      investigation:
        "ตรวจ shutdown sequence ของ {{ref:module:signal-collector}} พบว่า service รับ SIGTERM แล้ว shutdown ทันทีโดยไม่รอ flush buffer ของ event ที่รับมาแล้วแต่ยังไม่ publish เข้า queue",
      cause:
        "Graceful shutdown ไม่ได้ implement เลยใน code version นั้น — SIGTERM handler แค่ exit process ทันที ทำให้ buffer ขนาดใหญ่ในช่วง peak traffic หายไปเมื่อ restart",
      resolution:
        "Implement graceful shutdown ที่รอ flush buffer ทั้งหมดก่อน exit และตั้ง timeout สูงสุด 30 วินาที ถ้า flush ไม่เสร็จใน 30 วินาทีให้ log และ force exit",
      followup:
        "เพิ่ม health check metric สำหรับ buffer depth และเพิ่ม alert ถ้า buffer depth สูงเกิน threshold ขณะ restart เพื่อ alert ว่าอาจมีข้อมูลสูญหาย",
    },
    {
      slug: "rule-engine-cascading-block",
      title: "Rule ใหม่ทำให้ block ลูกค้าที่ถูกต้อง 15% ใน 1 ชั่วโมงแรก",
      tags: ["rule-engine", "false-positive"],
      summary:
        "rule ใหม่ที่ deploy เพื่อจับ account creation fraud ทำให้ block ลูกค้าที่ valid ด้วย เพราะ rule condition กว้างเกินไปและ data ที่ทดสอบ offline ไม่ representative",
      investigation:
        "ตรวจ triggered rule ใน case ที่สร้างขึ้นช่วงแรก พบว่า rule ใหม่ trigger สำหรับ account ที่สมัครจาก corporate IP ซึ่งมี registration velocity สูงในช่วงเช้าที่คนเริ่มทำงาน — pattern ที่ไม่มีใน training data เพราะ sample มาจาก consumer device เป็นหลัก",
      cause:
        "Test dataset ที่ใช้ validate rule ก่อน deploy ไม่มี corporate network pattern รวมอยู่ด้วย ทำให้ false positive rate บน corporate user ไม่ถูก measure ก่อน go-live",
      resolution:
        "Disable rule ทันทีโดยใช้ emergency override ตาม {{ref:policy:rule-override-approval-policy}} แล้ว review case ที่ถูก block ช่วงนั้นทั้งหมด",
      followup:
        "เพิ่ม corporate IP enrichment เป็น feature ใน rule condition และปรับ rule validation ให้รวม enterprise/corporate network sample ใน test dataset ก่อน deploy ทุกครั้ง",
    },
    {
      slug: "ml-scorer-timeout-during-peak",
      title: "ml-scorer response time เกิน SLA ช่วง traffic สูง",
      tags: ["ml", "performance", "latency"],
      summary:
        "ช่วง peak traffic คำตอบจาก {{ref:module:ml-scorer}} ช้าเกิน `ML_SCORING_TIMEOUT_MS` ทำให้ {{ref:module:case-manager}} ใช้ fallback score แทน ส่งผล false negative rate สูงขึ้น",
      investigation:
        "ตรวจ profiling พบว่า feature extraction ที่ต้อง call {{ref:module:velocity-tracker}} และ {{ref:module:device-fingerprinter}} แบบ sequential ใช้เวลารวมมากกว่า inference ของ model เอง — bottleneck ไม่ได้อยู่ที่ ML model แต่อยู่ที่ feature fetching",
      cause:
        "Feature fetching ถูก implement แบบ sequential await แทนที่จะ parallel await ทั้งสอง service พร้อมกัน ทำให้ latency รวมเป็น A + B แทนที่จะเป็น max(A, B)",
      resolution:
        "แก้ feature fetching ให้ใช้ `Promise.all` เรียก velocity-tracker และ device-fingerprinter พร้อมกัน ลด median latency จาก 95ms เป็น 55ms",
      followup:
        "ตรวจสอบ feature fetching pattern ทุกจุดใน ml-scorer และเพิ่ม latency breakdown metric แยก model inference time ออกจาก feature fetch time",
    },
    {
      slug: "velocity-window-config-desync",
      title: "Velocity window config desync ระหว่าง replica ทำให้ counter ไม่ตรงกัน",
      tags: ["velocity", "config", "desync"],
      summary:
        "หลัง deploy config ใหม่สำหรับ window ของ promo_redemption dimension counter บาง replica ยังใช้ window เก่า ทำให้ผู้ใช้คนเดียวได้รับ block/allow ต่างกันขึ้นอยู่กับว่า request ตกไป replica ไหน",
      investigation:
        "ตรวจ config ที่แต่ละ replica โหลดมาพบว่า config update ผ่าน Kubernetes ConfigMap แต่ replica ที่รันนานโหลด config ครั้งแรกเท่านั้น ไม่ hot-reload เมื่อ ConfigMap เปลี่ยน",
      cause:
        "{{ref:module:velocity-tracker}} อ่าน config ตอน startup เท่านั้น ไม่ watch ConfigMap change — ต้อง restart replica ทั้งหมดเพื่อ pick up config ใหม่ แต่ rolling restart ทำให้ช่วงสั้นๆ มี replica ที่ config ต่างกันอยู่พร้อมกัน",
      resolution:
        "Implement config hot-reload ที่ poll ConfigMap ทุก 60 วินาที และ restart replica ที่เหลืออย่างเร็วเพื่อ reduce desync window",
      followup:
        "เพิ่ม metric ที่ expose config version ของแต่ละ replica และ alert ถ้า version ไม่ตรงกันระหว่าง replica เกิน 5 นาที",
    },
    {
      slug: "device-fingerprint-seed-rotation-bug",
      title: "Device fingerprint seed rotation ทำให้ fingerprint เปลี่ยนทันทีทั้งระบบ",
      tags: ["device", "fingerprint", "seed-rotation"],
      summary:
        "หลัง rotate fingerprint seed key ประจำไตรมาส fingerprint ของ device ทุก device เปลี่ยนทันทีทั้งหมด ทำให้ trust score ของ device ทุกตัวถูก reset เป็น 50 (new device default) และเปิด vulnerability ช่วงนั้น",
      investigation:
        "ตรวจ fingerprint algorithm พบว่า seed key ถูก include ใน hash computation ตรงๆ แทนที่จะเป็น derivation layer ทำให้ rotate seed = rotate fingerprint ทุกตัวทันที",
      cause:
        "ออกแบบ fingerprint ให้ rotate ได้เพื่อ security แต่ไม่ได้คิด migration path สำหรับ existing fingerprint ทำให้ rotation ทำงานได้ด้าน security แต่ทำลาย continuity ด้าน trust history",
      resolution:
        "Roll back seed rotation ทันทีและ restore fingerprint mapping จาก backup restore trust score กลับมาจาก snapshot ก่อน rotation",
      followup:
        "ออกแบบ dual-key migration path ที่ยอมรับทั้ง old seed และ new seed ในช่วง transition 30 วันก่อน hard cutover ไปยัง new seed เพียงอย่างเดียว",
    },
    {
      slug: "case-manager-duplicate-review",
      title: "Analyst review case เดียวกันสองรอบเพราะ UI แสดง case ผิด",
      tags: ["case-management", "ui", "duplicate"],
      summary:
        "analyst รายงานว่าพวกเขา resolve case แล้วแต่ case ยังปรากฏในคิวของ analyst คนอื่น ทำให้ทำงานซ้ำและ wasted effort ที่ scale สูงช่วง peak",
      investigation:
        "ตรวจ `getQueueStats` และ case assignment ใน {{ref:module:case-manager}} พบว่า case ถูก resolve จริงในฐานข้อมูล แต่ cache ของ queue view ไม่ถูก invalidate เมื่อ resolve event มาถึง",
      cause:
        "Queue view cache มี TTL 5 นาทีและไม่ได้ invalidate by event เมื่อมี resolve มา ทำให้ analyst เห็น stale view ที่ยังมี case ที่ resolve ไปแล้วอยู่",
      resolution:
        "เพิ่ม event-driven cache invalidation สำหรับ queue view ทุกครั้งที่มี `case.resolved` event และลด TTL สำหรับ analyst-facing cache เป็น 30 วินาที",
      followup:
        "ทบทวน cache strategy ทั้งหมดใน case-manager ว่า TTL ที่ตั้งไว้เหมาะกับ consistency requirement ที่ user มองเห็น",
    },
    {
      slug: "signal-collector-schema-drift",
      title: "Signal schema drift จาก app version ใหม่ทำให้ signal ถูก reject จำนวนมาก",
      tags: ["signal", "schema", "drift"],
      summary:
        "หลัง app update version ใหม่ signal reject rate พุ่งจาก 0.1% เป็น 18% เพราะ app ใหม่ส่ง field ที่ rename มาโดยไม่ทราบว่า {{ref:module:signal-collector}} ยัง expect field name เดิม",
      investigation:
        "ตรวจ reject log ของ signal-collector พบว่า field `device_os_version` ที่ app ใหม่ส่งเป็น `os_version` แทน ทำให้ validation fail ที่ required field check",
      cause:
        "app team rename field เพื่อ naming consistency ภายใน แต่ไม่ได้ coordinate กับ Data team ว่า signal schema ที่ backend expect นั้น versioned และต้องมี migration path",
      resolution:
        "เพิ่ม field alias ใน signal-collector ที่ยอมรับทั้ง `device_os_version` และ `os_version` ชั่วคราว และเร่ง coordinate migration plan กับ app team",
      followup:
        "ตั้ง process ที่ app team ต้องผ่าน signal schema review ก่อน rename หรือ remove field ใดๆ และเพิ่ม signal reject rate alert ที่ threshold ต่ำกว่า 1% เพื่อ detect ปัญหาแต่เนิ่นๆ",
    },
    {
      slug: "analyst-sla-breach-auto-close-bug",
      title: "Case ที่ SLA breach ถูก auto-close โดยไม่มี resolution จริง",
      tags: ["case-management", "sla", "auto-close"],
      summary:
        "case บางรายการที่ SLA breach ถูก mark เป็น `closed` อัตโนมัติโดย monitoring job แทนที่จะเป็น `sla_breach` ทำให้ metric SLA breach rate ต่ำกว่าความจริงและ case ไม่ได้รับ resolution จริง",
      investigation:
        "ตรวจ job ที่ handle SLA breach ใน {{ref:module:case-manager}} พบว่า job ใช้ `status = closed` แทน `status = sla_breach` เพราะ developer เข้าใจว่า closed = all terminal states รวม breach ด้วย",
      cause:
        "Status enum มีทั้ง `closed` และ `sla_breach` แต่ไม่มีการ document ความต่าง ทำให้ developer ใช้ผิด terminal state โดยไม่รู้ตัว",
      resolution:
        "แก้ job ให้ set status เป็น `sla_breach` ไม่ใช่ `closed` และ reopen case ทุกรายการที่ถูก close ผิดพลาดเพื่อให้ analyst review ย้อนหลัง",
      followup:
        "เพิ่ม status enum documentation ใน codebase และ add lint rule ที่ forbid ใช้ `closed` ใน SLA-related code path ต้องผ่าน explicit enum case เท่านั้น",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SAI-88-velocity-sliding-window`, `fix/SAI-201-case-auto-close-status`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(ml-scorer): แก้ sequential feature fetch เป็น parallel`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แตะ fraud decision (block/allow) ต้องมี idempotency check เสมอ (ดูบทเรียนจาก {{ref:incident:rule-engine-race-condition-double-block}}) และ comparison กับ threshold ที่เป็น float ต้องใช้ explicit float comparison ไม่ใช่ integer (ดูบทเรียนจาก {{ref:incident:appeal-auto-approval-bug}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `scoreSignal`, `computeFingerprint` — ฟังก์ชันที่คืน boolean ขึ้นต้นด้วย `is`, `has`, `should` เสมอ เช่น `isTrustedDevice`, `hasVelocityBreach`" },
        { heading: "Status enum", body: "terminal status ทุกตัวต้อง explicit เช่น `closed`, `sla_breach`, `auto_approved` ห้ามใช้ status อื่นแทนกัน เพราะแต่ละ state มีความหมาย audit ต่างกัน (ดูบทเรียนจาก {{ref:incident:analyst-sla-breach-auto-close-bug}})" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ fraud evaluation ต้องมี `eventId` เสมอ เพื่อไล่ log ข้าม service ได้ (signal-collector → rule-engine/ml-scorer → case-manager) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "fraud decision log เป็น `info` เสมอ (ไม่ใช่ debug) เพราะต้องเก็บไว้เป็น audit trail decision ที่ block ผู้ใช้จริงต้องมี reason field ที่ human-readable เสมอ" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`SAI_<DOMAIN>_<REASON>` เช่น `SAI_SIGNAL_SCHEMA_INVALID`, `SAI_SCORE_TIMEOUT`, `SAI_CASE_NOT_FOUND` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`SAI_RULE_OVERRIDE_DENIED`, `SAI_SLA_BREACHED`, `SAI_DEVICE_UNTRUSTED`, `SAI_VELOCITY_EXCEEDED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "integration"],
      sections: [
        { heading: "Idempotency test", body: "ฟังก์ชันที่ process event ต้องมี test ที่ส่ง event เดียวกัน 2 ครั้งและ verify ว่าผลลัพธ์เหมือนกับส่งครั้งเดียว (ดูบทเรียนจาก {{ref:incident:rule-engine-race-condition-double-block}})" },
        { heading: "Boundary value test", body: "ทุก threshold comparison เช่น score ≥ 80, score < 60 ต้องมี test กับ boundary value รวมถึง 79.999, 80.0, 80.001 เพื่อจับ floating point edge case (ดู {{ref:incident:appeal-auto-approval-bug}})" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ decision ที่ block ผู้ใช้ต้องมี `details.reason` field เพื่อให้ support team อธิบายกับลูกค้าได้" },
      ],
    },
    {
      slug: "signal-schema-convention",
      title: "Signal Schema Convention",
      tags: ["signal", "schema", "events"],
      intro: "ทุก signal ที่ {{ref:module:signal-collector}} รับเข้ามาต้องผ่าน schema validation ตาม SIGNAL_SCHEMA_VERSION ปัจจุบัน เอกสารนี้กำหนด field, unit, และ กติกาการ versioning เพื่อป้องกัน schema drift ซ้ำอีก (ดูบทเรียนจาก {{ref:incident:signal-collector-schema-drift}})",
      sections: [
        { heading: "Field บังคับและหน่วย", body: "`eventId` UUID v4, `eventType` enum, `userId` string, `deviceId` string, `ip` IPv4/IPv6, `receivedAt` ISO 8601 UTC — ทุก numeric field ต้องระบุหน่วยใน field name เช่น `session_duration_sec` ไม่ใช่ `session_duration` เพื่อป้องกัน unit mismatch (ดู {{ref:incident:ml-model-drift-false-positive-spike}})" },
        { heading: "กติกาการ versioning", body: "ทุกครั้งที่ rename, remove, หรือ change unit ของ field ต้อง bump SIGNAL_SCHEMA_VERSION และผ่าน review จาก Data Science team ก่อน deploy — breaking change ที่ไม่ coordinate ทำให้เกิด model drift ได้ทันที" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (รวม idempotency test) → deploy staging → shadow scoring test → deploy production ทีละ service" },
        { heading: "Gate พิเศษ", body: "{{ref:module:ml-scorer}} และ {{ref:module:rule-engine}} ต้องผ่าน false positive rate test บน validation dataset ก่อน deploy เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบ fraud decision โดยตรง" },
      ],
    },
    {
      slug: "model-deployment-runbook",
      title: "ML Model Deployment Runbook",
      tags: ["ml", "deployment", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ deploy ML model ใหม่เข้า production โดยไม่กระทบ scoring quality ในช่วง transition — ดูบทเรียนจาก {{ref:incident:ml-model-drift-false-positive-spike}}",
      sections: [
        { heading: "Shadow mode deployment", body: "model ใหม่ต้องรัน shadow mode (ดู `runShadowScoring`) คู่ขนานกับ model ปัจจุบันอย่างน้อย 48 ชั่วโมง เปรียบเทียบ score distribution และ false positive rate ก่อนตัดสินใจ promote" },
        { heading: "Cutover", body: "เมื่อ shadow scoring ผ่านเกณฑ์ ค่อยๆ เพิ่ม traffic จาก 10% → 50% → 100% ไม่ cutover ทันทีจาก 0 → 100 เพื่อ limit blast radius ถ้ามีปัญหาที่ไม่พบใน shadow mode" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = fraud decision ผิดพลาดขนาดใหญ่ (false positive rate > 10% หรือ false negative ที่พิสูจน์ได้), Sev2 = กระทบ SLA หรือ queue overflow, Sev3 = degraded performance แต่ decision ยังถูกต้อง" },
        { heading: "False positive spike", body: "ถ้า false positive rate เกิน 5% ภายใน 30 นาที ต้อง escalate เป็น Sev1 ทันทีและแจ้ง Customer Support ให้เตรียม handle complaint surge พร้อมกัน" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "signal reject rate > 1%, false positive rate > 5% (30-min window), case queue depth > 500, ML scoring timeout rate > 2%, SLA breach rate > 10%, case auto-close anomaly (rate ผิดปกติจาก pattern ปกติ)" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งทันทีทาง pager ส่วน Sev3 รวม digest รายชั่วโมง alert ที่เกี่ยวกับ false positive ต้อง cc ทีม Customer Support เสมอเพราะส่งผลตรงๆ ต่อ customer experience" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ false positive rate > 5% หรือ false negative เพิ่มผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval เพราะส่งผล fraud exposure โดยตรง" },
        { heading: "ขั้นตอน", body: "deploy version ก่อนหน้ากลับผ่าน pipeline เดียวกัน ไม่ skip shadow test สำหรับ ml-scorer และแจ้ง Risk & Compliance ทุกครั้งที่ rollback service ที่เกี่ยวกับ fraud decision" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของแต่ละ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| signal-collector | 3 | 15 | event rate > 10,000 eps |\n| rule-engine | 2 | 10 | CPU > 70% |\n| ml-scorer | 3 | 12 | latency p95 > 80ms |\n| case-manager | 2 | 8 | queue depth > 200 |" },
        { heading: "Scoring latency SLA", body: "target latency สำหรับ end-to-end fraud decision คือ < 200ms (p99) เพราะ client รอ response ก่อน allow/block user action ทำให้ scaling ml-scorer เป็น priority สูงสุดใน scaling budget" },
      ],
    },
    {
      slug: "rule-engine-update-runbook",
      title: "Rule Engine Update Runbook",
      tags: ["rule-engine", "runbook"],
      intro: "ขั้นตอนสำหรับ add, modify, หรือ deactivate rule ใน {{ref:module:rule-engine}} ตาม {{ref:policy:rule-override-approval-policy}} — ทุกการเปลี่ยนแปลง rule ต้องผ่าน runbook นี้",
      sections: [
        { heading: "ก่อน activate rule ใหม่", body: "ทดสอบ rule บน 30-day historical signal dataset และ measure false positive rate บน user กลุ่มต่างๆ รวมถึง corporate user ที่มี high velocity จากการใช้งานปกติ (ดู {{ref:incident:rule-engine-cascading-block}})" },
        { heading: "หลัง activate", body: "เฝ้าดู false positive rate อย่างน้อย 1 ชั่วโมงแรก พร้อม on-call ที่พร้อม emergency disable ตามขั้นตอนใน {{ref:policy:rule-override-approval-policy}}" },
      ],
    },
    {
      slug: "case-queue-management-runbook",
      title: "Case Queue Management Runbook",
      tags: ["case-management", "queue", "runbook"],
      sections: [
        { heading: "ภาวะปกติ", body: "case queue depth ควรต่ำกว่า 200 cases ที่ pending review ทุกเวลา SLA dashboard แสดง real-time queue health อ้างอิง metric จาก `getQueueStats` ใน {{ref:module:case-manager}}" },
        { heading: "เมื่อ queue ล้น", body: "ถ้า queue depth เกิน 500 ให้ engage triage mode ตาม {{ref:policy:analyst-review-sla-policy}} และเรียก reinforcement analyst จาก on-call pool ก่อน auto-adjust threshold เพราะ threshold change มีผลกว้างกว่า — ดูบทเรียนจาก {{ref:incident:case-manager-queue-overflow}}" },
      ],
    },
  ],
};
