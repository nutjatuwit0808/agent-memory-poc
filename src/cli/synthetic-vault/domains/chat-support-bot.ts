import type { DomainProfile } from "../types.js";

// HelpLoop — แพลตฟอร์ม chat support bot สำหรับทีม customer support
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const chatSupportBot: DomainProfile = {
  id: "chat-support-bot",
  displayName: "HelpLoop — แพลตฟอร์ม Chat Support Bot",
  summary: [
    "HelpLoop คือแพลตฟอร์ม chat bot สำหรับทีม customer support ขององค์กรลูกค้าแต่ละราย รับข้อความจากช่องทางแชทของลูกค้าปลายทาง (เว็บวิดเจ็ต, LINE, มือถือ) แล้วตอบด้วย bot อัตโนมัติก่อน ถ้า bot ตอบไม่ได้จริงๆ ค่อยส่งต่อให้เจ้าหน้าที่คน (handoff) ระบบแบ่งงานเป็นสองส่วนหลัก คือ \"เข้าใจว่าลูกค้าต้องการอะไร\" (intent + retrieval) กับ \"คุยต่อเนื่องให้จบบทสนทนา\" (state + handoff)",
    "ทีมวิศวกรรมแยก service ตามความรับผิดชอบชัดเจน เพราะบทเรียนจากระบบรุ่นก่อนที่รวม logic การจำแนก intent กับการจัดการ state การสนทนาไว้ใน service เดียวจนแก้ไขยาก บั๊กจุดหนึ่งกระทบทั้งระบบ ช่วงเวลาที่ทีมเรียกว่า peak support window (09:00-11:00 และ 13:00-15:00) คือช่วงที่ปริมาณข้อความเข้าสูงสุดของแต่ละวัน ตรงกับเวลาที่ลูกค้าองค์กรเปิดทำการ",
  ],
  domainTags: ["chat-support-bot", "helploop"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:conversation-state-manager}} เป็นเจ้าของ state ของบทสนทนาทั้งหมด (ขั้นตอนปัจจุบัน, ประวัติข้อความล่าสุด) ส่วน {{ref:module:knowledge-base-retriever}} เป็นเจ้าของ index บทความช่วยเหลือเท่านั้น ไม่รู้จัก state การสนทนาเลย",
    "{{ref:module:handoff-router}} เป็น service เดียวที่ query ข้าม {{ref:module:conversation-state-manager}} (เพื่อรู้ประวัติการคุยทั้งหมดก่อนส่งต่อ) และคิวเจ้าหน้าที่ (เพื่อรู้ว่าใครว่าง) พร้อมกัน — เหตุผลที่ยอมให้ทำ cross-domain query (ผิดหลักทั่วไป) คือเจ้าหน้าที่ที่รับช่วงต่อต้องเห็นบริบทเต็มและมีคนว่างพร้อมกันในเวลาที่ตัดสินใจส่งต่อ ไม่งั้นลูกค้าจะถูกโยนไปหาเจ้าหน้าที่ที่ไม่มีบริบทหรือคิวที่ไม่มีใครรับ",
  ],
  apiGatewayNote: [
    "ข้อความจากช่องทางแชทภายนอกเข้ามาทาง webhook ผ่าน API gateway กลาง ซึ่งแปลงเป็น รูปแบบข้อความมาตรฐานแล้วส่งต่อให้ {{ref:module:intent-classifier}} คำขอที่ต้องการผลลัพธ์ทันที เช่น ดึงประวัติการสนทนา ใช้ synchronous call ผ่าน gateway ตัวนี้เหมือนกัน",
    "สัญญาณ typing indicator และ presence (ลูกค้ากำลังพิมพ์อยู่) ไม่ผ่าน API gateway ตัวนี้ — ไปทาง WebSocket channel แยกต่างหากที่ {{ref:module:session-store}} ควบคุมเอง เพราะสัญญาณพวกนี้ต้องอัปเดตแทบจะทันที latency ของ gateway กลาง (เฉลี่ย 80-150ms) ทำให้ typing indicator ดูค้างไม่เนียน",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:conversation-state-manager}} ดูแล ได้แก่ `conversations` (สถานะปัจจุบันของแต่ละบทสนทนา) และ `conversation_turns` (ประวัติข้อความทุก turn ไม่ลบทิ้งเพื่อ audit และ retrain)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `conversations` | conversation-state-manager | อัปเดตทุกครั้งที่มี turn ใหม่ |\n| `kb_articles_index` | knowledge-base-retriever | index บทความช่วยเหลือ ไม่เก็บเนื้อหาเต็ม |\n| `handoff_queue` | handoff-router | คิวรอเจ้าหน้าที่รับสาย |\n| `rate_limit_buckets` | rate-limiter | token bucket ต่อ customer account |",
    "ทุกตารางใช้ `conversationId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันที่เทียบจำนวน turn กับจำนวนที่ knowledge-base-retriever log ไว้ว่าถูกเรียกใช้",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `message.received`, `intent.classified`, `handoff.requested`, `handoff.accepted`, `conversation.closed` — {{ref:module:handoff-router}} subscribe `handoff.requested` เพื่อจับคู่บทสนทนากับเจ้าหน้าที่ที่ว่างทันทีโดยไม่ต้อง poll คิวเอง",
    "{{ref:module:rate-limiter}} ไม่ subscribe event ใดๆ เลย — ทำงานแบบ synchronous check ก่อนข้อความจะเข้าสู่ pipeline เสมอ เพราะการ throttle ต้องเกิดก่อนที่ระบบจะเสียทรัพยากรประมวลผล intent ไปแล้ว ถ้าทำแบบ async จะ throttle ช้าเกินไป",
  ],
  modules: [
    {
      slug: "intent-classifier",
      name: "intent-classifier",
      tags: ["intent", "module", "core"],
      description:
        "รับผิดชอบจำแนกว่าข้อความของลูกค้าต้องการอะไร (เช่น ถามสถานะ, ขอความช่วยเหลือ, ร้องเรียน) แยกออกมาจาก conversation-state-manager ตั้งแต่ต้นปี 2025 เพราะโมเดลจำแนก intent ต้อง iterate บ่อยและ deploy แยกรอบจาก logic การจัดการ state ที่เสถียรกว่ามาก",
      functions: [
        { sig: "classifyIntent(conversationId: string, message: string): Promise<IntentResult>", desc: "จำแนก intent ของข้อความล่าสุด คืน label พร้อมค่า confidence" },
        { sig: "detectLanguage(message: string): Promise<LanguageCode>", desc: "ตรวจภาษาของข้อความก่อนส่งเข้าโมเดลจำแนก intent ที่เหมาะกับภาษานั้น" },
        { sig: "reportLowConfidence(conversationId: string, intentResult: IntentResult): Promise<void>", desc: "แจ้งผลจำแนกที่ confidence ต่ำกลับไปยัง conversation-state-manager พร้อมเหตุผล" },
      ],
      stateFlow: "classifying → classified | low_confidence | unsupported_language — ดู {{ref:policy:intent-confidence-threshold-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่ต้อง fallback",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:knowledge-base-retriever}} โดยตรง — ถ้าจำแนก intent ได้แล้วจะ report ผลกลับไปที่ {{ref:module:conversation-state-manager}} แล้วปล่อยให้ conversation-state-manager เป็นคนตัดสินใจว่าจะเรียก knowledge-base-retriever ต่อหรือไม่ เพื่อรักษาหลัก separation of concerns",
      internals: {
        constants: [
          { name: "INTENT_CONFIDENCE_MIN_THRESHOLD", value: "0.72" },
          { name: "CLASSIFY_TIMEOUT_MS", value: "800" },
          { name: "SUPPORTED_LANGUAGE_CODES", value: "[\"th\", \"en\", \"zh\"]" },
        ],
        typeSnippet:
          "interface IntentResult {\n  conversationId: string;\n  label: string;\n  confidence: number;\n  language: string;\n  fallbackReason?: \"low_confidence\" | \"unsupported_language\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:intent-confidence-threshold-policy}}",
      },
    },
    {
      slug: "conversation-state-manager",
      name: "conversation-state-manager",
      tags: ["state", "module", "core"],
      description:
        "เจ้าของ state ของทุกบทสนทนา (ขั้นตอนปัจจุบัน, ประวัติ turn ล่าสุด, ว่าอยู่ระหว่างรอ bot หรือรอเจ้าหน้าที่) ทุก service อื่นที่ต้องรู้ว่าบทสนทนาไหนอยู่สถานะไหนต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บ state การสนทนาซ้ำเอง",
      functions: [
        { sig: "appendTurn(conversationId: string, turn: ConversationTurn): Promise<void>", desc: "บันทึกข้อความใหม่เข้าประวัติบทสนทนาและอัปเดตขั้นตอนปัจจุบัน" },
        { sig: "getConversationContext(conversationId: string, lastNTurns: number): Promise<ConversationTurn[]>", desc: "ดึงประวัติล่าสุด N turn สำหรับ generate คำตอบหรือส่งต่อเจ้าหน้าที่" },
        { sig: "markConversationClosed(conversationId: string, reason: string): Promise<void>", desc: "ปิดบทสนทนาเมื่อจบแล้ว ไม่ว่าจะจบด้วย bot หรือเจ้าหน้าที่" },
        { sig: "expireStaleConversation(conversationId: string): Promise<void>", desc: "หมดอายุบทสนทนาที่ไม่มีข้อความใหม่นานเกิน threshold" },
      ],
      stateFlow: "active_bot → active_human | resolved | expired (จาก active_bot ก็ได้ถ้ามี handoff) หรือ active_human → resolved | expired",
      relatedNotes:
        "{{ref:module:handoff-router}} เรียก `getConversationContext` ทุกครั้งก่อนส่งต่อเจ้าหน้าที่ แต่ conversation-state-manager ไม่รู้จัก concept ของ \"เจ้าหน้าที่คนไหนว่าง\" เลย — รู้แค่ว่าบทสนทนาไหนกำลังรออะไรอยู่ การตัดสินใจจับคู่เจ้าหน้าที่ทั้งหมดอยู่ที่ handoff-router",
      internals: {
        constants: [
          { name: "STALE_CONVERSATION_THRESHOLD_MIN", value: "30" },
          { name: "MAX_CONTEXT_TURNS_FOR_HANDOFF", value: "20" },
        ],
        typeSnippet:
          "interface ConversationTurn {\n  conversationId: string;\n  sender: \"customer\" | \"bot\" | \"agent\";\n  text: string;\n  timestamp: string;\n  intentLabel?: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการหมดอายุบทสนทนาที่ {{ref:policy:conversation-state-ttl-policy}}",
      },
    },
    {
      slug: "handoff-router",
      name: "handoff-router",
      tags: ["handoff", "module"],
      description:
        "ตัดสินใจว่าเมื่อไหร่ต้องส่งบทสนทนาต่อให้เจ้าหน้าที่คน และจับคู่กับเจ้าหน้าที่ที่เหมาะสม เป็น service เดียวที่ query ข้าม {{ref:module:conversation-state-manager}} และคิวเจ้าหน้าที่พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู {{ref:arch:boundaries}})",
      functions: [
        { sig: "requestHandoff(conversationId: string, reason: HandoffReason): Promise<QueuePosition>", desc: "ยื่นคำขอส่งต่อเจ้าหน้าที่ พร้อมเหตุผล คืนตำแหน่งในคิวปัจจุบัน" },
        { sig: "assignAgent(conversationId: string): Promise<AgentAssignment | null>", desc: "จับคู่บทสนทนาที่รอนานที่สุดกับเจ้าหน้าที่ที่ว่างและเหมาะกับหมวดปัญหาที่สุด" },
        { sig: "requeueOnAgentDisconnect(conversationId: string): Promise<void>", desc: "ดันบทสนทนากลับเข้าคิวเมื่อเจ้าหน้าที่หลุดการเชื่อมต่อกลางคัน" },
      ],
      stateFlow: "queued → assigned → in_progress → resolved | requeued | abandoned",
      relatedNotes:
        "ถ้าบทสนทนาอยู่ใน `queued` นานเกิน threshold โดยไม่มีเจ้าหน้าที่รับ ระบบจะแจ้งเตือนหัวหน้าทีม — นี่คือปัญหาที่ทำให้เกิด incident จำนวนมากช่วง peak support window ดู {{ref:policy:handoff-escalation-policy}}",
    },
    {
      slug: "knowledge-base-retriever",
      name: "knowledge-base-retriever",
      tags: ["knowledge-base", "module", "core"],
      description:
        "ค้นหาบทความช่วยเหลือที่เกี่ยวข้องกับ intent ที่จำแนกได้ เพื่อให้ bot ใช้ตอบลูกค้า ใช้ full-text search ผสม vector search บน index บทความที่ sync มาจากระบบจัดการเนื้อหาของทีม support แต่ละองค์กรลูกค้า",
      functions: [
        { sig: "retrieveArticles(intentLabel: string, queryText: string, topK: number): Promise<KbArticle[]>", desc: "ค้นบทความที่เกี่ยวข้องที่สุด topK รายการ" },
        { sig: "syncArticleIndex(orgId: string): Promise<SyncResult>", desc: "sync index บทความใหม่จากระบบจัดการเนื้อหาต้นทาง" },
        { sig: "flagStaleArticle(articleId: string, reason: string): Promise<void>", desc: "ตีธงบทความที่สงสัยว่าล้าสมัยเพื่อให้ทีมเนื้อหาตรวจสอบ" },
      ],
      relatedNotes:
        "ไม่รู้จัก state ของบทสนทนาเลย (ดู {{ref:arch:boundaries}}) — เมื่อ {{ref:module:intent-classifier}} จำแนก intent เสร็จ จะเป็น {{ref:module:conversation-state-manager}} ที่เรียก `retrieveArticles` แทนที่จะให้ knowledge-base-retriever ฟัง event การจำแนกโดยตรง เพื่อคุม fan-in ของ event ให้อยู่ที่จุดเดียว",
      internals: {
        constants: [
          { name: "RETRIEVAL_TOP_K_DEFAULT", value: "3" },
          { name: "ARTICLE_INDEX_SYNC_INTERVAL_MIN", value: "60" },
        ],
        typeSnippet:
          "interface KbArticle {\n  articleId: string;\n  title: string;\n  snippet: string;\n  relevanceScore: number;\n  lastSyncedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการ sync index ที่ {{ref:policy:knowledge-base-sync-policy}}",
      },
    },
    {
      slug: "session-store",
      name: "session-store",
      tags: ["session", "module"],
      description:
        "จัดการ session ของลูกค้าที่เชื่อมต่ออยู่ผ่าน WebSocket รวมถึงสัญญาณ presence และ typing indicator แยกออกมาเป็น service อิสระเพราะการรักษา connection แบบ real-time มีลักษณะการ scale และ failure mode ต่างจาก service อื่นที่เป็น request-response ทั่วไป",
      functions: [
        { sig: "openSession(conversationId: string, channel: ChannelType): Promise<SessionHandle>", desc: "เปิด session WebSocket ใหม่เมื่อลูกค้าเริ่มแชท" },
        { sig: "broadcastTyping(conversationId: string, who: \"bot\" | \"agent\"): Promise<void>", desc: "ส่งสัญญาณ typing indicator ให้ลูกค้าเห็นแบบ real-time" },
        { sig: "closeSession(sessionId: string, reason: string): Promise<void>", desc: "ปิด session เมื่อลูกค้าตัดการเชื่อมต่อหรือบทสนทนาจบ" },
      ],
      relatedNotes:
        "ไม่เก็บประวัติข้อความเอง — แค่ transport layer ที่ forward ข้อความเข้า-ออกระหว่างลูกค้ากับ {{ref:module:conversation-state-manager}} เท่านั้น ดู {{ref:arch:gateway}} สำหรับเหตุผลที่ WebSocket channel นี้ไม่ผ่าน API gateway กลาง",
    },
    {
      slug: "rate-limiter",
      name: "rate-limiter",
      tags: ["rate-limit", "module"],
      description:
        "จำกัดอัตราข้อความที่แต่ละ customer account ส่งเข้ามาได้ ป้องกันทั้งการโจมตีแบบ spam และการเผลอส่งข้อความซ้ำถี่จาก integration ของลูกค้าองค์กรที่ผิดพลาด ทำงานเป็น synchronous check ก่อน pipeline อื่นเสมอ",
      functions: [
        { sig: "checkLimit(accountId: string, channel: ChannelType): Promise<RateLimitDecision>", desc: "ตรวจว่า account นี้ยังส่งข้อความได้ตาม token bucket ที่เหลือหรือไม่" },
        { sig: "consumeToken(accountId: string): Promise<void>", desc: "หักโทเคนออกจาก bucket เมื่อข้อความผ่านการตรวจแล้ว" },
        { sig: "resetBucket(accountId: string, reason: string): Promise<void>", desc: "รีเซ็ต bucket ด้วยมือ เช่นเมื่อยืนยันว่าเป็น traffic ที่ถูกต้องจริง" },
      ],
      relatedNotes:
        "ทำงานก่อน {{ref:module:intent-classifier}} เสมอในทุก pipeline — ข้อความที่ถูก throttle จะไม่ถูกส่งเข้าสู่ intent-classifier เลยเพื่อประหยัดทรัพยากร ดู {{ref:policy:rate-limit-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "intent-classifier-service",
      vars: [
        { name: "INTENT_CONFIDENCE_MIN_THRESHOLD", example: "0.72", note: "ดู {{ref:policy:intent-confidence-threshold-policy}}" },
        { name: "CLASSIFY_TIMEOUT_MS", example: "800", note: "" },
      ],
    },
    {
      service: "conversation-state-manager-service",
      vars: [
        { name: "STALE_CONVERSATION_THRESHOLD_MIN", example: "30", note: "ดู {{ref:policy:conversation-state-ttl-policy}}" },
        { name: "STATE_DB_URL", example: "postgres://conv-db.internal:5432/conversations", note: "secret ห้าม log" },
      ],
    },
    {
      service: "handoff-router-service",
      vars: [
        { name: "HANDOFF_QUEUE_ALERT_THRESHOLD_MIN", example: "5", note: "ดู {{ref:policy:handoff-escalation-policy}}" },
        { name: "HANDOFF_MAX_QUEUE_DEPTH", example: "150", note: "เกินนี้เริ่ม throttle การรับ handoff ใหม่" },
      ],
    },
    {
      service: "rate-limiter-service",
      vars: [
        { name: "RATE_LIMIT_BUCKET_CAPACITY", example: "30", note: "จำนวนข้อความสูงสุดต่อ bucket ต่อ account" },
        { name: "RATE_LIMIT_REFILL_PER_MIN", example: "10", note: "ดู {{ref:policy:rate-limit-policy}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "intent-confidence-threshold-policy",
      title: "นโยบายเกณฑ์ Confidence ของการจำแนก Intent",
      tags: ["intent", "confidence", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:intent-classifier}} จำแนก intent ได้ ระบบจะเปรียบเทียบค่า confidence กับ `INTENT_CONFIDENCE_MIN_THRESHOLD` (ค่าปกติ 0.72) ถ้าต่ำกว่านี้จะไม่ใช้ผลจำแนกนั้นตอบลูกค้าโดยตรง แต่จะ fallback ไปถามคำถามเพิ่มเติมเพื่อยืนยันความต้องการก่อน",
        "การถามยืนยันทำได้ไม่เกิน 1 ครั้งต่อบทสนทนา ถ้ายืนยันแล้วยัง confidence ต่ำอยู่ ระบบจะส่งต่อเจ้าหน้าที่ทันทีแทนการถามซ้ำไปเรื่อยๆ เพราะการถามซ้ำหลายรอบทำให้ลูกค้ารู้สึกว่า bot ไม่เข้าใจและหงุดหงิดมากกว่าการส่งต่อคนตั้งแต่ต้น",
      ],
      sections: [
        {
          heading: "ทำไมไม่ตั้ง threshold ต่ำกว่านี้เพื่อลดการส่งต่อเจ้าหน้าที่",
          body: "ทีมเคยทดลองลด threshold ลงเพื่อให้ bot ตอบเองได้มากขึ้น แต่พบว่าคำตอบผิด intent ที่หลุดออกไปสร้างความไม่พอใจของลูกค้ารุนแรงกว่าการส่งต่อเจ้าหน้าที่บ่อยขึ้นมาก เพราะลูกค้ารู้สึกว่า bot ไม่ฟังเลยไม่ใช่แค่ตอบช้า",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Intent กลุ่มความเสี่ยงสูง",
        tags: ["intent", "confidence", "edge-case"],
        body: [
          "intent ที่จัดกลุ่มเป็น `high_risk` (เช่น เรื่องร้องเรียนรุนแรง, เรื่องที่เกี่ยวกับความปลอดภัยบัญชี) จะใช้ threshold สูงกว่าปกติที่ 0.85 แม้ค่า global จะตั้งไว้ต่ำกว่านั้น เพราะความเสี่ยงจากการตอบผิด intent กลุ่มนี้สูงกว่าความเสี่ยงจากการส่งต่อเจ้าหน้าที่โดยไม่จำเป็น",
          "ถ้าข้อความมีคำที่อยู่ใน keyword list ความเสี่ยงสูง (เช่นคำที่บ่งบอกอันตรายต่อตัวเอง) ระบบจะส่งต่อเจ้าหน้าที่ทันทีโดยไม่สนใจค่า confidence เลย ไม่ว่าโมเดลจะมั่นใจแค่ไหนก็ตาม",
        ],
      },
    },
    {
      slug: "handoff-escalation-policy",
      title: "นโยบายการยกระดับ Handoff",
      tags: ["handoff", "escalation", "policy"],
      isPrimary: true,
      intro: [
        "บทสนทนาที่รออยู่ใน `queued` เกิน `HANDOFF_QUEUE_ALERT_THRESHOLD_MIN` (ค่าปกติ 5 นาที) จะถูก {{ref:module:handoff-router}} แจ้งเตือนหัวหน้าทีมอัตโนมัติ และเพิ่ม priority ให้เป็นคิวถัดไปที่ได้รับมอบหมายก่อนบทสนทนาที่รอน้อยกว่า",
        "handoff ถูกจัดหมวดเป็น 3 ระดับตามเหตุผล: `general` (คำถามทั่วไปที่ bot ตอบไม่ได้), `escalation` (ลูกค้าขอคุยกับคนโดยตรงหรือไม่พอใจ bot), และ `high_risk` (เข้าเงื่อนไขความเสี่ยงสูงตาม {{ref:policy:intent-confidence-threshold-policy}})",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อคิว Handoff ล้นเกินกำลังเจ้าหน้าที่",
        tags: ["handoff", "edge-case"],
        body: [
          "เมื่อความลึกของคิวเกิน `HANDOFF_MAX_QUEUE_DEPTH` ระบบจะไม่รับ handoff ประเภท `general` เข้าคิวเพิ่มชั่วคราว — bot จะบอกลูกค้าว่าคิวเต็มพร้อมเวลาที่คาดว่าจะรอ แต่ยังรับ `escalation` และ `high_risk` เข้าคิวได้เสมอไม่ว่าคิวจะลึกแค่ไหน เพราะสองกลุ่มนี้มีความเสี่ยงสูงกว่าถ้าปล่อยลูกค้าไว้กับ bot ต่อ",
          "บทสนทนาที่ถูกปฏิเสธเข้าคิวเพราะคิวเต็มจะถูกจัดคิวใหม่อัตโนมัติทุก 5 นาทีจนกว่าคิวจะมีที่ว่าง ไม่ต้องให้ลูกค้าพิมพ์ขอใหม่เอง",
        ],
      },
    },
    {
      slug: "conversation-state-ttl-policy",
      title: "นโยบายอายุของ State การสนทนา",
      tags: ["state", "ttl", "policy"],
      isPrimary: true,
      intro: [
        "บทสนทนาที่ไม่มีข้อความใหม่จากฝั่งใดฝั่งหนึ่งนานเกิน `STALE_CONVERSATION_THRESHOLD_MIN` (ค่าปกติ 30 นาที) จะถูก {{ref:module:conversation-state-manager}} เปลี่ยนสถานะเป็น `expired` อัตโนมัติ ไม่ถือว่าเป็นบทสนทนาที่ยัง active ต่อ",
        "บทสนทนาที่ `expired` แล้วถ้าลูกค้าพิมพ์กลับเข้ามาอีกจะถูกสร้างเป็นบทสนทนาใหม่เสมอ ไม่ resume ของเดิม เพื่อไม่ให้ bot ตอบโดยอิงบริบทเก่าที่อาจไม่เกี่ยวข้องกับสิ่งที่ลูกค้ากำลังถามแล้ว",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับบทสนทนาที่กำลังรอเจ้าหน้าที่",
        tags: ["state", "edge-case"],
        body: [
          "บทสนทนาที่อยู่ในสถานะ `queued` รอเจ้าหน้าที่ตาม {{ref:policy:handoff-escalation-policy}} จะไม่ถูก mark เป็น `expired` แม้จะเกิน threshold ปกติ เพราะการไม่มีข้อความใหม่ระหว่างรอคิวเป็นเรื่องปกติ ไม่ใช่สัญญาณว่าลูกค้าทิ้งบทสนทนาไปแล้ว",
          "บทสนทนาที่เจ้าหน้าที่กำลังคุยอยู่ (`active_human`) ใช้ threshold ยาวกว่าปกติ 3 เท่า เพราะเจ้าหน้าที่อาจต้องใช้เวลาค้นข้อมูลก่อนตอบ การหมดอายุเร็วเกินไปจะตัดบทสนทนาที่ยังไม่จบทิ้งโดยไม่ตั้งใจ",
        ],
      },
    },
    {
      slug: "knowledge-base-sync-policy",
      title: "นโยบายการ Sync Knowledge Base",
      tags: ["knowledge-base", "sync", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:knowledge-base-retriever}} sync index บทความจากระบบจัดการเนื้อหาต้นทางทุก `ARTICLE_INDEX_SYNC_INTERVAL_MIN` (ค่าปกติ 60 นาที) เป็น background job ไม่ได้ sync แบบ real-time ทุกครั้งที่ทีมเนื้อหาแก้บทความ เพื่อไม่ให้ query volume จากการ sync ไปกระทบ latency ของการค้นหาจริง",
        "บทความที่ถูกลบที่ต้นทางจะถูกตัดออกจาก index ทันทีในรอบ sync ถัดไป ไม่รอให้หมดอายุเอง เพื่อไม่ให้ bot อ้างอิงบทความที่ทีมเนื้อหาตั้งใจถอนออกแล้ว",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อมีการเปลี่ยนแปลงนโยบายด่วน",
        tags: ["knowledge-base", "edge-case"],
        body: [
          "เมื่อทีมเนื้อหาทำเครื่องหมายบทความว่าเป็น `urgent_update` (เช่นเปลี่ยนนโยบายที่กระทบลูกค้าจำนวนมากทันที) ระบบจะ sync บทความนั้นทันทีนอกรอบปกติแทนการรอ 60 นาที เพื่อไม่ให้ bot ตอบด้วยข้อมูลที่ล้าสมัยไปแล้วในช่วงเปลี่ยนผ่าน — บทเรียนจาก {{ref:incident:knowledge-base-stale-answer-policy-change}}",
          "ระหว่างที่ sync แบบด่วนกำลังทำงาน ระบบจะ pause การใช้บทความเวอร์ชันเก่าของหัวข้อนั้นชั่วคราว (ตอบว่ากำลังตรวจสอบข้อมูลแทนการเดา) ดีกว่าปล่อยให้ตอบด้วยข้อมูลที่รู้อยู่แล้วว่าผิด",
        ],
      },
    },
    {
      slug: "rate-limit-policy",
      title: "นโยบายการจำกัดอัตราข้อความ",
      tags: ["rate-limit", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:rate-limiter}} ใช้ token bucket ต่อ `accountId` ความจุ `RATE_LIMIT_BUCKET_CAPACITY` (ค่าปกติ 30 ข้อความ) เติมคืน `RATE_LIMIT_REFILL_PER_MIN` โทเคนต่อนาที ข้อความที่มาเมื่อ bucket ว่างจะถูกปฏิเสธพร้อม error บอกเวลาที่ต้องรอ",
        "การจำกัดอัตราทำงานแยกต่อ channel ด้วย ไม่ใช่รวมทุกช่องทางเข้า bucket เดียว เพราะลูกค้าที่คุยผ่านเว็บวิดเจ็ตและ LINE พร้อมกันไม่ควรถูกนับปนกันจนโดน throttle เร็วเกินจริง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Integration ขององค์กรลูกค้าขนาดใหญ่",
        tags: ["rate-limit", "edge-case"],
        body: [
          "account ที่ลงทะเบียนเป็น `verified_integration` (ยืนยันแล้วว่าเป็น traffic จาก integration อัตโนมัติของลูกค้าองค์กร ไม่ใช่ spam) จะได้ bucket capacity สูงกว่าปกติ 5 เท่า และมี burst allowance พิเศษสำหรับช่วงที่ traffic พุ่งสั้นๆ เพื่อไม่ให้ integration ที่ถูกต้องถูกบล็อกเหมือนเป็นการโจมตี — บทเรียนจาก {{ref:incident:rate-limiter-blocked-legit-burst}}",
          "การเปลี่ยนสถานะเป็น `verified_integration` ต้องมีคนอนุมัติด้วยมือเสมอ ไม่ให้ระบบเดาจาก pattern การส่งข้อความเอง เพราะ pattern ของการโจมตีกับ integration ที่ถูกต้องบางครั้งดูคล้ายกันมากในช่วงสั้นๆ",
        ],
      },
    },
    {
      slug: "reply-loop-detection-policy",
      title: "นโยบายการตรวจจับ Reply Loop",
      tags: ["bot", "reliability", "policy"],
      isPrimary: true,
      intro: [
        "ระบบตรวจจับกรณี bot ตอบข้อความเดียวกันหรือคล้ายกันมากซ้ำติดต่อกันเกิน 2 ครั้งในบทสนทนาเดียว ถ้าเจอจะหยุดให้ bot ตอบต่อทันทีและส่งต่อเจ้าหน้าที่โดยอัตโนมัติ ไม่รอให้ลูกค้าร้องเรียนเอง",
        "การเทียบว่า \"คำตอบคล้ายกัน\" ใช้การเทียบ `articleId` ที่ใช้ตอบ ไม่ใช่เทียบข้อความตรงตัว เพราะ bot อาจใช้บทความเดียวกันมาสร้างประโยคคำตอบที่ถ้อยคำต่างกันเล็กน้อยแต่เนื้อหาซ้ำเดิมทุกครั้ง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อการตอบซ้ำเป็นความตั้งใจ",
        tags: ["bot", "edge-case"],
        body: [
          "ถ้าลูกค้าเป็นฝ่ายพิมพ์คำถามเดิมซ้ำเองหลายครั้งติดกัน (ไม่ใช่ bot ตอบซ้ำ) ระบบจะไม่ trigger reply loop detection เพราะการตอบเหมือนเดิมในกรณีนี้ถูกต้องแล้ว — การแยกแยะสองกรณีนี้ดูจากว่าฝั่งไหนเป็นคนพิมพ์ข้อความซ้ำก่อน",
          "บทสนทนาที่กำลัง handoff ไปเจ้าหน้าที่อยู่แล้วไม่เข้าเงื่อนไขนี้ เพราะการตอบซ้ำของเจ้าหน้าที่ (เช่นถามข้อมูลเพิ่มเติมแบบเดิมเพื่อยืนยัน) เป็นการตัดสินใจของคน ไม่ใช่ bug ของ bot",
        ],
      },
    },
    {
      slug: "session-retention-policy",
      title: "นโยบายการเก็บรักษา Session",
      tags: ["session", "retention", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:session-store}} เก็บ session ที่ปิดแล้วไว้ในสถานะ read-only 24 ชั่วโมงก่อนลบทิ้งจริง เพื่อให้ทีม debug สามารถตรวจสอบปัญหาการเชื่อมต่อย้อนหลังได้ในกรอบเวลาสั้นๆ",
        "session ที่เกี่ยวข้องกับบทสนทนาที่ถูก flag ว่าเป็น `high_risk` จะถูกเก็บนานกว่าปกติตามระยะเวลาที่นโยบาย compliance ขององค์กรลูกค้ากำหนด",
      ],
    },
    {
      slug: "pii-redaction-policy",
      title: "นโยบายการปกปิดข้อมูลส่วนบุคคล (PII)",
      tags: ["pii", "privacy", "policy"],
      isPrimary: false,
      intro: [
        "ข้อความที่ตรวจพบรูปแบบข้อมูลอ่อนไหว (เลขบัตร, รหัสผ่าน, OTP) จะถูก {{ref:module:conversation-state-manager}} แทนที่ด้วยเครื่องหมาย mask ก่อนบันทึกลง log ถาวรเสมอ แม้ในหน้าจอที่เจ้าหน้าที่เห็นแบบ real-time จะยังเห็นข้อความเต็มเพื่อช่วยเหลือลูกค้าได้ก็ตาม",
        "bot ต้องไม่ echo ข้อความที่มีรูปแบบ PII กลับไปหาลูกค้าโดยตรงไม่ว่ากรณีใด แม้จะเป็นการยืนยันสิ่งที่ลูกค้าเพิ่งพิมพ์มาก็ตาม — บทเรียนจาก {{ref:incident:near-miss-pii-echo}}",
      ],
    },
    {
      slug: "fallback-response-policy",
      title: "นโยบายคำตอบ Fallback เมื่อ Bot ตอบไม่ได้",
      tags: ["bot", "fallback", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อ {{ref:module:knowledge-base-retriever}} ไม่พบบทความที่เกี่ยวข้องเลย (ไม่ใช่แค่ confidence ต่ำ) bot จะใช้คำตอบ fallback มาตรฐานที่ยอมรับตรงๆ ว่าไม่พบข้อมูล แทนการพยายามสร้างคำตอบเดาจากบทความที่ไม่เกี่ยวข้อง",
        "คำตอบ fallback ต้องเสนอทางเลือกให้ลูกค้าเลือกส่งต่อเจ้าหน้าที่ได้ทันทีเสมอ ไม่ปล่อยให้ลูกค้าติดอยู่กับ bot ที่ตอบไม่ได้โดยไม่มีทางออก",
      ],
    },
    {
      slug: "multi-language-routing-policy",
      title: "นโยบายการจัดเส้นทางตามภาษา",
      tags: ["language", "routing", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:intent-classifier}} ใช้ `detectLanguage` ก่อนจำแนก intent เสมอ ถ้าภาษาที่ตรวจพบไม่อยู่ใน `SUPPORTED_LANGUAGE_CODES` จะส่งต่อเจ้าหน้าที่ทันทีโดยไม่พยายามจำแนก intent ต่อ เพราะโมเดลที่ฝึกมาสำหรับภาษาที่รองรับให้ผลลัพธ์ไม่น่าเชื่อถือกับภาษาอื่น",
        "การ retrieve บทความจาก knowledge base ต้องกรองตามภาษาที่ตรวจพบด้วยเสมอ ไม่ส่งบทความภาษาอื่นมาตอบแม้เนื้อหาจะเกี่ยวข้องก็ตาม",
      ],
    },
    {
      slug: "bot-persona-tone-policy",
      title: "นโยบายบุคลิกและโทนการตอบของ Bot",
      tags: ["bot", "persona", "policy"],
      isPrimary: false,
      intro: [
        "bot ต้องใช้โทนสุภาพเป็นกลางเสมอ ไม่ใช้คำแสลงหรือมุกตลกในบทสนทนาที่จำแนกเป็นหมวดร้องเรียนหรือ `high_risk` แม้ในบทสนทนาทั่วไปองค์กรลูกค้าบางรายจะตั้งค่าให้ bot ใช้โทนเป็นกันเองได้ก็ตาม",
        "การตั้งค่า persona เป็นระดับต่อองค์กรลูกค้า ไม่ใช่ระดับ global เดียวทั้งระบบ เพราะแต่ละองค์กรมีแบรนด์และกลุ่มลูกค้าที่คาดหวังโทนการสื่อสารต่างกัน",
      ],
    },
  ],
  incidents: [
    {
      slug: "bot-stuck-reply-loop",
      title: "Bot ติดวนตอบข้อความเดิมซ้ำไม่รู้จบ",
      tags: ["bot", "loop"],
      summary:
        "ลูกค้ารายหนึ่งรายงานว่า bot ตอบประโยคเดิมซ้ำๆ ทุกครั้งที่พิมพ์คำถามใหม่ แม้จะเปลี่ยนคำถามไปแล้วก็ยังได้คำตอบเดิม",
      investigation:
        "เช็ค log {{ref:module:knowledge-base-retriever}} พบว่า `retrieveArticles` คืน `articleId` เดิมทุกครั้งไม่ว่า query text จะเปลี่ยนไปแค่ไหน",
      cause:
        "cache ผลการค้นหาที่เพิ่งเพิ่มเข้ามาเพื่อลด latency ใช้ `conversationId` เป็น cache key แทนที่จะเป็น query text ทำให้ query ใหม่ในบทสนทนาเดียวกันได้ผลลัพธ์จาก cache ของ query แรกซ้ำตลอด",
      resolution:
        "แก้ cache key ให้รวม hash ของ query text เข้าไปด้วย แล้ว deploy hotfix ทันที พร้อม trigger `expireStaleConversation` ให้บทสนทนาที่ติดอยู่ในลูปเริ่มใหม่",
      followup:
        "เพิ่ม reply loop detection ตาม {{ref:policy:reply-loop-detection-policy}} เป็น safety net ชั้นที่สอง ไม่พึ่งพาแค่การแก้ root cause อย่างเดียว",
    },
    {
      slug: "handoff-queue-overflow-peak",
      title: "คิว Handoff ล้นช่วงพีคทำลูกค้ารอนานผิดปกติ",
      tags: ["handoff", "peak"],
      summary:
        "ระหว่าง peak support window ช่วงเช้า ทีมเจ้าหน้าที่รายงานว่าคิวรอ handoff ยาวขึ้นเรื่อยๆ ลูกค้าบางรายรอเกิน 20 นาทีทั้งที่ปกติไม่เกิน 5 นาที",
      investigation:
        "ตรวจ {{ref:module:handoff-router}} พบว่าความลึกคิวเกิน `HANDOFF_MAX_QUEUE_DEPTH` ไปมากตั้งแต่ช่วงต้นชั่วโมง แต่ alert ที่ควรแจ้งหัวหน้าทีมไม่ถูกส่งออก",
      cause:
        "จำนวนเจ้าหน้าที่ที่ล็อกอินเข้าระบบวันนั้นน้อยกว่าปกติเพราะเป็นวันที่มีการประชุมทีมพร้อมกันตอนเช้า ไม่มีใครปรับตารางกะให้เหลื่อมเวลาป้องกันช่วง peak window เหมือนที่ควรทำ",
      resolution:
        "หัวหน้าทีมเรียกเจ้าหน้าที่กลับเข้าระบบด่วนบางส่วน พร้อมเปิด edge case ของ {{ref:policy:handoff-escalation-policy}} ให้จัดคิวใหม่บ่อยขึ้นชั่วคราวเพื่อลดการรอซ้ำ",
      followup:
        "เพิ่มกฎห้ามจัดประชุมทีมเจ้าหน้าที่ทั้งหมดพร้อมกันในช่วง peak support window และตรวจสอบว่าทำไม alert ไม่ถูกส่งออกตามที่ควร",
    },
    {
      slug: "conversation-state-lost-after-deploy",
      title: "State บทสนทนาหายกลางคันหลัง deploy",
      tags: ["state", "deploy", "bug"],
      summary:
        "หลัง deploy เวอร์ชันใหม่ของ {{ref:module:conversation-state-manager}} ลูกค้าหลายรายรายงานว่า bot ถามคำถามที่เพิ่งตอบไปแล้วซ้ำ เหมือนบทสนทนาเริ่มใหม่กลางคัน",
      investigation:
        "ตรวจ log พบว่า `getConversationContext` คืนอาร์เรย์ว่างเปล่าสำหรับบทสนทนาที่มี turn มากกว่า `MAX_CONTEXT_TURNS_FOR_HANDOFF` อยู่แล้วก่อน deploy",
      cause:
        "การ refactor query ดึงประวัติ turn ในเวอร์ชันใหม่เปลี่ยนเงื่อนไข pagination โดยไม่ตั้งใจ ทำให้บทสนทนาที่มี turn เกินขนาด page แรกไม่ถูกดึงกลับมาเลยแทนที่จะดึงมาบางส่วน",
      resolution:
        "rollback deploy กลับเวอร์ชันก่อนหน้าตาม {{ref:deployment:rollback-procedure}} ทันที แล้ว fix pagination logic ให้ถูกต้องก่อน deploy ใหม่อีกครั้งพร้อม test เพิ่ม",
      followup:
        "เพิ่ม integration test ที่จำลองบทสนทนายาวเกิน 1 page เข้า {{ref:convention:testing-convention}} เพื่อจับ regression แบบนี้ก่อนขึ้นจริง",
    },
    {
      slug: "knowledge-base-stale-answer-policy-change",
      title: "Bot ตอบด้วยนโยบายเก่าหลัง Sync ไม่ทันการเปลี่ยนแปลง",
      tags: ["knowledge-base", "stale"],
      summary:
        "ทีม support รายงานว่า bot ยังตอบลูกค้าด้วยนโยบายการคืนสินค้าแบบเก่า ทั้งที่องค์กรลูกค้าประกาศเปลี่ยนนโยบายไปแล้วตั้งแต่เช้า",
      investigation:
        "ตรวจ {{ref:module:knowledge-base-retriever}} พบว่าบทความที่อัปเดตแล้วที่ต้นทางยังไม่ถูก sync เข้า index เพราะรอบ sync ปกติทุก 60 นาทียังไม่ถึงกำหนด",
      cause:
        "ทีมเนื้อหาแก้บทความที่ระบบต้นทางโดยไม่ได้ทำเครื่องหมาย `urgent_update` ตามขั้นตอนที่ควรทำสำหรับการเปลี่ยนแปลงที่กระทบลูกค้าจำนวนมากทันที ทำให้ระบบไม่รู้ว่าต้อง sync ด่วนนอกรอบ",
      resolution:
        "trigger `syncArticleIndex` ด้วยมือทันทีสำหรับ org ที่ได้รับผลกระทบ แล้วแจ้งลูกค้าที่ได้รับคำตอบผิดพลาดไปแล้วให้ทราบนโยบายที่ถูกต้อง",
      followup:
        "แจ้งทีมเนื้อหาให้ใช้ flag `urgent_update` ทุกครั้งที่แก้นโยบายที่มีผลทันที ตาม {{ref:policy:knowledge-base-sync-policy}} และเพิ่ม reminder ในขั้นตอนแก้บทความฝั่งต้นทาง",
    },
    {
      slug: "near-miss-pii-echo",
      title: "เกือบเกิดเหตุ Bot Echo ข้อมูลอ่อนไหวกลับหาลูกค้า",
      tags: ["pii", "near-miss"],
      summary:
        "ทีม QA ตรวจพบระหว่างทดสอบว่า bot ตอบยืนยันด้วยการพิมพ์เลขบัตรที่ลูกค้าพิมพ์มาซ้ำเต็มจำนวน ทั้งที่ควรถูก mask ไว้ตั้งแต่ต้น เหตุการณ์นี้ถูกจับได้ก่อนขึ้นระบบจริงกับลูกค้าจริง",
      investigation:
        "ตรวจ {{ref:module:conversation-state-manager}} พบว่าฟังก์ชัน mask PII ทำงานเฉพาะตอนบันทึกลง log ถาวรเท่านั้น แต่ไม่ได้ถูกเรียกก่อนที่ข้อความจะถูกส่งต่อให้ bot ใช้สร้างคำตอบยืนยัน",
      cause:
        "ตอนออกแบบฟีเจอร์ยืนยันข้อมูลของ bot ทีมพัฒนาคาดว่า mask จะถูก apply ที่ชั้นบันทึก log แล้วครอบคลุมทุก path โดยไม่รู้ว่า path การสร้างคำตอบยืนยันอ่านข้อมูลจาก object ก่อนที่จะผ่านชั้น mask นั้น",
      resolution:
        "ย้ายจุด mask PII ให้เกิดทันทีที่ข้อความเข้าสู่ระบบก่อน path ใดๆ จะอ่านข้อมูลได้เลย แทนที่จะ mask แค่ตอนจะบันทึก log แล้วรัน regression test ครอบคลุมทุก path ที่อ่านข้อความลูกค้า",
      followup:
        "เพิ่มเข้า {{ref:convention:code-review-checklist}} ว่าฟีเจอร์ใหม่ที่อ่านข้อความลูกค้าดิบต้องผ่าน PII path review ก่อน merge เสมอ ตาม {{ref:policy:pii-redaction-policy}}",
    },
    {
      slug: "rate-limiter-blocked-legit-burst",
      title: "Rate Limiter บล็อก Traffic ที่ถูกต้องจากลูกค้าองค์กรใหญ่",
      tags: ["rate-limit", "false-positive"],
      summary:
        "ลูกค้าองค์กรรายใหญ่รายหนึ่งรายงานว่า integration ของพวกเขาถูกปฏิเสธข้อความจำนวนมากพร้อมกันตอนเปิดระบบใหม่หลัง maintenance ของฝั่งเขาเอง",
      investigation:
        "ตรวจ {{ref:module:rate-limiter}} พบว่า account ของลูกค้ารายนี้ยังไม่ได้ถูกตั้งเป็น `verified_integration` ทั้งที่เป็น integration จริงมาตลอด ทำให้ใช้ bucket capacity มาตรฐานซึ่งเล็กเกินไปสำหรับ burst ตอนเปิดระบบใหม่",
      cause:
        "ขั้นตอนอนุมัติ `verified_integration` เป็นการทำด้วยมือที่ต้องมีคนร้องขอก่อน แต่ลูกค้ารายนี้ไม่เคยรู้ว่ามีขั้นตอนนี้อยู่ จึงไม่เคยร้องขอ ทำให้ integration ของเขาถูกจำกัดอัตราเหมือน traffic ทั่วไปมาตลอด",
      resolution:
        "อนุมัติ `verified_integration` ให้ account นี้ทันทีหลังยืนยันตัวตนแล้ว รีเซ็ต bucket ด้วย `resetBucket` เพื่อให้ integration ทำงานต่อได้ทันที",
      followup:
        "เสนอให้ตรวจจับ pattern traffic ที่ดูเหมือน integration ถูกต้องแต่ถูก throttle บ่อยผิดปกติ แล้วแจ้งทีม sales/support เชิงรุกให้ติดต่อลูกค้าแทนการรอให้ลูกค้าร้องเรียนเอง",
    },
    {
      slug: "intent-classifier-misroute-after-model-update",
      title: "อัปเดตโมเดลจำแนก Intent ทำ Route ผิดกลุ่มจำนวนมาก",
      tags: ["intent", "model"],
      summary:
        "หลังอัปเดตโมเดลจำแนก intent เวอร์ชันใหม่ ทีม support สังเกตว่าคำถามเกี่ยวกับการยกเลิกบริการถูกจำแนกเป็นคำถามทั่วไปบ่อยผิดปกติ ทำให้ไม่ได้ถูกส่งต่อเจ้าหน้าที่ตามที่ควร",
      investigation:
        "ตรวจ {{ref:module:intent-classifier}} พบว่า label `cancellation` มีสัดส่วนลดลงชัดเจนหลัง deploy โมเดลใหม่ เทียบกับช่วงก่อนหน้า",
      cause:
        "ข้อมูลฝึกโมเดลเวอร์ชันใหม่ปรับสัดส่วนตัวอย่างของแต่ละ label ใหม่เพื่อแก้ปัญหาอื่น แต่ลดสัดส่วนตัวอย่าง `cancellation` ลงโดยไม่ตั้งใจ ทำให้โมเดลมั่นใจ label นี้น้อยลงกว่าความเป็นจริง",
      resolution:
        "rollback โมเดลกลับเวอร์ชันก่อนหน้าทันทีตาม {{ref:deployment:rollback-procedure}} แล้วให้ทีม data ตรวจสอบสัดส่วนข้อมูลฝึกก่อนจะ deploy โมเดลใหม่รอบถัดไป",
      followup:
        "เพิ่ม automated check เปรียบเทียบสัดส่วนผลจำแนกแต่ละ label ของโมเดลใหม่กับโมเดลเดิมก่อน deploy จริง แจ้งเตือนถ้าต่างกันเกิน threshold ที่กำหนด",
    },
    {
      slug: "session-store-cache-eviction-mid-conversation",
      title: "Session ถูก Evict กลางบทสนทนาทำ Typing Indicator ค้าง",
      tags: ["session", "cache"],
      summary:
        "ลูกค้าบางรายรายงานว่าเห็นสัญลักษณ์ \"bot กำลังพิมพ์\" ค้างอยู่นานผิดปกติโดยไม่มีคำตอบตามมา ทั้งที่ bot ประมวลผลคำตอบเสร็จแล้วจริงฝั่งเซิร์ฟเวอร์",
      investigation:
        "ตรวจ {{ref:module:session-store}} พบว่า session ของลูกค้ากลุ่มนี้ถูก evict ออกจาก in-memory cache ก่อนที่คำตอบจะถูกส่งกลับผ่าน WebSocket connection เดิม",
      cause:
        "cache ของ session store ใช้ LRU eviction ตามขนาด memory รวม แต่ไม่ได้กันไม่ให้ evict session ที่กำลังมีการประมวลผลค้างอยู่ (in-flight) ทำให้ session ที่รอคำตอบนานกว่าปกติมีโอกาสถูก evict ก่อนได้รับคำตอบ",
      resolution:
        "แก้ eviction logic ให้กัน session ที่มี pending response ไม่ให้ถูก evict จนกว่าจะส่งคำตอบสำเร็จหรือ timeout ตามเงื่อนไขปกติ",
      followup:
        "เพิ่ม metric แยกสำหรับ session ที่ถูก evict ขณะมี pending response เพื่อตรวจจับ regression แบบนี้เร็วขึ้นในอนาคต",
    },
    {
      slug: "knowledge-base-retriever-timeout-cascade",
      title: "Knowledge Base Retriever ช้าลงจนทำให้ทั้ง Pipeline ค้างตาม",
      tags: ["knowledge-base", "latency", "cascade"],
      summary:
        "ช่วงหนึ่ง bot ตอบช้าลงอย่างเห็นได้ชัดทั้งระบบ ลูกค้าหลายรายรอคำตอบนานกว่าปกติหลายเท่า แม้ไม่มีการ deploy ใหม่ในวันนั้น",
      investigation:
        "ตรวจ metric latency พบว่า {{ref:module:knowledge-base-retriever}} ตอบช้าลงมากในบาง organization โดยเฉพาะ org ที่มี index บทความขนาดใหญ่ที่สุด",
      cause:
        "org นั้นเพิ่งนำเข้าบทความใหม่จำนวนมากพร้อมกันในรอบ sync เดียว ทำให้ index โตขึ้นเกินขนาดที่ query performance เดิมออกแบบไว้รองรับ การ query ที่ช้าลงของ org นี้ไปกินทรัพยากรของ shared connection pool จนกระทบ org อื่นด้วย",
      resolution:
        "แยก connection pool ของการค้นหาออกเป็นต่อ org แทนการใช้ pool ร่วมกัน แล้วเพิ่ม index optimization ให้ org ที่มีขนาดใหญ่ผิดปกติเป็นการเร่งด่วน",
      followup:
        "เพิ่ม alert เมื่อขนาด index ของ org ใดโตเกิน threshold ที่กำหนด เพื่อวางแผน optimization ล่วงหน้าก่อนกระทบ latency จริง",
    },
    {
      slug: "handoff-router-wrong-agent-queue",
      title: "Handoff Router ส่งบทสนทนาผิดคิวเจ้าหน้าที่ตามความเชี่ยวชาญ",
      tags: ["handoff", "routing", "bug"],
      summary:
        "ทีมหัวหน้าเจ้าหน้าที่รายงานว่าบทสนทนาเกี่ยวกับปัญหาเทคนิคถูกส่งให้เจ้าหน้าที่ฝ่ายบัญชีบ่อยผิดปกติ ทำให้ต้องโอนต่อซ้ำสองรอบ เสียเวลาลูกค้าเพิ่ม",
      investigation:
        "ตรวจ `assignAgent` ของ {{ref:module:handoff-router}} พบว่าการจับคู่หมวดความเชี่ยวชาญอ้างอิง `intentLabel` ตัวแรกของบทสนทนาเท่านั้น ไม่ใช่ intent ล่าสุดที่ทำให้เกิดการ handoff จริง",
      cause:
        "ในบทสนทนาที่ลูกค้าเปลี่ยนหัวข้อกลางคัน (เริ่มถามเรื่องบัญชีแล้วเปลี่ยนไปถามปัญหาเทคนิค) `intentLabel` ตัวแรกที่ถูกบันทึกไม่ได้สะท้อนสิ่งที่ทำให้เกิด handoff จริง แต่ logic การจับคู่ยังอ้างอิงค่าเดิมอยู่",
      resolution:
        "แก้ `assignAgent` ให้อ้างอิง `intentLabel` ของ turn ล่าสุดก่อน handoff แทนตัวแรกของบทสนทนา แล้ว deploy เป็นการแก้ไขปกติไม่ใช่ hotfix เพราะไม่กระทบความปลอดภัยเร่งด่วน",
      followup:
        "ทบทวน logic ที่อ้างอิง turn แรกของบทสนทนาในจุดอื่นของระบบว่ามีความเสี่ยงแบบเดียวกันหรือไม่",
    },
    {
      slug: "multi-language-detection-failure",
      title: "ตรวจจับภาษาผิดพลาดสำหรับข้อความสั้นทำ Intent จำแนกพลาด",
      tags: ["language", "intent"],
      summary:
        "ลูกค้าที่พิมพ์ข้อความสั้นมาก (เช่น \"ok\", \"555\") ได้รับคำตอบที่ไม่เกี่ยวข้องบ่อยผิดปกติ ทีม support สงสัยว่าเป็นปัญหาการตรวจจับภาษา",
      investigation:
        "ตรวจ {{ref:module:intent-classifier}} พบว่า `detectLanguage` ตรวจข้อความสั้นเหล่านี้ผิดภาษาบ่อยครั้ง เพราะข้อความสั้นเกินไปจนโมเดลตรวจภาษาไม่มีสัญญาณพอตัดสินใจแม่นยำ",
      cause:
        "โมเดลตรวจภาษาไม่ได้ออกแบบมาสำหรับข้อความสั้นกว่า 3 คำโดยเฉพาะ และไม่มี fallback ใช้ภาษาของบทสนทนาก่อนหน้าเป็นตัวช่วยตัดสินใจเมื่อข้อความสั้นเกินไป",
      resolution:
        "เพิ่ม logic ให้ใช้ภาษาของ turn ก่อนหน้าในบทสนทนาเดียวกันเป็นค่าเริ่มต้นเมื่อข้อความใหม่สั้นกว่า threshold ที่กำหนด แทนการเดาจากข้อความสั้นๆ นั้นตรงๆ",
      followup:
        "ทบทวน {{ref:policy:multi-language-routing-policy}} ให้รวมเงื่อนไขข้อความสั้นเป็นกรณีพิเศษอย่างเป็นทางการ",
    },
    {
      slug: "duplicate-message-double-reply",
      title: "ข้อความซ้ำจากการเชื่อมต่อไม่เสถียรทำ Bot ตอบสองครั้ง",
      tags: ["bot", "duplicate", "bug"],
      summary:
        "ลูกค้าหลายรายรายงานว่าได้รับคำตอบเดียวกันจาก bot ซ้ำสองครั้งติดกันในบางครั้ง โดยเฉพาะช่วงที่เครือข่ายมือถือไม่เสถียร",
      investigation:
        "ตรวจ {{ref:module:session-store}} พบว่าเมื่อ WebSocket connection หลุดแล้วเชื่อมต่อใหม่เร็วมาก ข้อความเดิมที่ client ส่งซ้ำเพื่อความชัวร์ (retry ฝั่ง client) ถูกส่งเข้า pipeline สองครั้งโดยไม่ถูกกรองซ้ำ",
      cause:
        "ระบบไม่มี idempotency key สำหรับข้อความขาเข้า ทำให้ไม่มีทางแยกว่าข้อความสองอันที่เนื้อหาเหมือนกันเป๊ะเป็นข้อความใหม่จริงหรือเป็นการส่งซ้ำจาก retry ของ client",
      resolution:
        "เพิ่ม idempotency key ที่ client ต้องแนบมากับทุกข้อความ แล้ว {{ref:module:conversation-state-manager}} deduplicate ข้อความที่มี key ซ้ำภายในกรอบเวลาสั้นๆ ก่อนส่งเข้า pipeline",
      followup:
        "ประสานทีม client SDK ให้ generate idempotency key ทุกครั้งที่ retry ข้อความเดิม ไม่ใช่ generate key ใหม่ทุกครั้งที่ส่ง",
    },
    {
      slug: "rate-limiter-config-rollback-missed",
      title: "ลืมคืนค่า Rate Limit หลังทดสอบทำ Traffic ปกติถูกบล็อก",
      tags: ["rate-limit", "config"],
      summary:
        "วันหนึ่งทีม support ได้รับรายงานจากหลายองค์กรลูกค้าพร้อมกันว่าข้อความถูกปฏิเสธบ่อยผิดปกติ ทั้งที่ปริมาณ traffic ไม่ได้สูงกว่าปกติมากนัก",
      investigation:
        "ตรวจ config ของ {{ref:module:rate-limiter}} พบว่าค่า `RATE_LIMIT_BUCKET_CAPACITY` ถูกปรับลดลงระหว่างการทดสอบพฤติกรรมภายใต้ load ต่ำเมื่อสัปดาห์ก่อน แต่ไม่ได้ปรับกลับหลังทดสอบเสร็จ",
      cause:
        "ขั้นตอนทดสอบไม่มี checklist บังคับให้ยืนยันคืนค่า config กลับหลังทดสอบเสร็จ ทำให้ค่าที่ตั้งไว้ชั่วคราวสำหรับทดสอบหลุดเข้าสู่ production โดยไม่มีใครสังเกต",
      resolution:
        "ปรับค่า `RATE_LIMIT_BUCKET_CAPACITY` กลับเป็นค่าที่ตั้งใจไว้เดิมทันที แล้วรีเซ็ต bucket ของ account ที่ถูกบล็อกผิดพลาดทั้งหมดด้วย `resetBucket`",
      followup:
        "เพิ่มขั้นตอนยืนยันคืนค่า config หลังการทดสอบทุกครั้งเป็นส่วนหนึ่งของ {{ref:convention:code-review-checklist}} สำหรับการเปลี่ยน config ที่กระทบ rate limit",
    },
    {
      slug: "conversation-state-manager-race-condition",
      title: "Turn สองอันเขียนทับกันพร้อมกันทำประวัติบทสนทนาสลับลำดับ",
      tags: ["state", "bug", "race-condition"],
      summary:
        "ทีม QA พบว่าบางบทสนทนามีลำดับข้อความในประวัติสลับกัน (คำตอบของ bot ปรากฏก่อนคำถามของลูกค้าที่ถามจริง) ทำให้ดูประวัติแล้วสับสน",
      investigation:
        "ตรวจ `appendTurn` ของ {{ref:module:conversation-state-manager}} พบว่ามี race condition เมื่อสอง turn ของบทสนทนาเดียวกันถูกเขียนพร้อมกันในเวลาไล่เลี่ยกันมาก (เช่น bot ตอบเร็วมากจนชนกับข้อความถัดไปของลูกค้า)",
      cause:
        "การกำหนดลำดับ turn ใช้ timestamp ของ application server แทนที่จะใช้ sequence number ที่ database รับประกัน ทำให้ในบางกรณีที่ clock ของ instance คนละตัวเขียนพร้อมกัน ลำดับที่บันทึกไม่ตรงกับลำดับเวลาจริงที่เกิดขึ้น",
      resolution:
        "แก้ให้ `appendTurn` ใช้ auto-increment sequence number ระดับ database แทน timestamp ของ application ในการกำหนดลำดับ แล้ว deploy เป็น hotfix",
      followup:
        "ตรวจสอบฟังก์ชันอื่นใน {{ref:module:conversation-state-manager}} ที่พึ่งพา timestamp ของ application server ในการกำหนดลำดับเหตุการณ์ว่ามีความเสี่ยงเดียวกันหรือไม่",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/HL-231-handoff-priority-queue`, `fix/HL-247-rate-limiter-cache-key`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(session-store): กัน session ถูก evict ระหว่างรอ response`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ state ของบทสนทนาหรือ cache key ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:conversation-state-manager-race-condition}}) และฟีเจอร์ที่อ่านข้อความลูกค้าดิบต้องผ่าน PII path review ก่อน merge (ดูบทเรียนจาก {{ref:incident:near-miss-pii-echo}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `classifyIntent`, `retrieveArticles` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ของบทสนทนา", body: "`conversationId` รูปแบบ `CONV-<10 หลัก>`, `articleId` รูปแบบ `<orgId>-KB-<5 หลัก>` ต้อง unique ทั่วทั้งระบบเสมอ" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับบทสนทนาต้องมี `conversationId` เสมอ เพื่อไล่ log ข้าม service ได้ (intent-classifier → conversation-state-manager → knowledge-base-retriever) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "การส่งต่อเจ้าหน้าที่แบบ `high_risk` log เป็น `warn` เสมอแม้จะไม่ใช่ error ทางเทคนิค เพราะทีม support ต้อง grep เจอง่ายตอนตรวจสอบเคสอ่อนไหว" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`HL_<DOMAIN>_<REASON>` เช่น `HL_INTENT_LOW_CONFIDENCE`, `HL_HANDOFF_QUEUE_FULL` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`HL_RATE_LIMIT_EXCEEDED`, `HL_KB_ARTICLE_NOT_FOUND`, `HL_SESSION_EXPIRED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Test ก่อนขึ้นจริง", body: "การเปลี่ยนโมเดลจำแนก intent ต้องผ่านการเทียบสัดส่วนผลจำแนกกับโมเดลเดิมก่อน merge เสมอ — บทเรียนจาก {{ref:incident:intent-classifier-misroute-after-model-update}} คือการไม่เทียบสัดส่วนก่อน deploy เจอ regression ไม่ทัน" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะการเขียน turn เข้าประวัติบทสนทนาต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw exception message ของโมเดลหรือ database ออกไปตรงๆ" },
      ],
    },
    {
      slug: "intent-label-naming-convention",
      title: "Intent Label Naming Convention",
      tags: ["intent", "naming", "convention"],
      intro: "เอกสารนี้กำหนดชื่อ label ที่ใช้ร่วมกันระหว่าง {{ref:module:intent-classifier}} และ {{ref:module:handoff-router}} เพื่อไม่ให้สองฝั่งตีความ label เดียวกันต่างกัน",
      sections: [
        { heading: "รูปแบบชื่อ", body: "`snake_case` ตัวพิมพ์เล็กทั้งหมด เช่น `billing_inquiry`, `technical_issue`, `cancellation` ห้ามใช้ตัวย่อที่ไม่ชัดเจน" },
        { heading: "กติกา", body: "label ใหม่ที่ยังไม่ผ่านการฝึกโมเดลด้วยตัวอย่างเพียงพอ (อย่างน้อย 200 ตัวอย่างต่อ label) ห้ามเปิดใช้งานจริงจนกว่าจะผ่าน {{ref:convention:testing-convention}} ครบ" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (สำหรับ service ที่แตะ state หรือ routing) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:intent-classifier}} และ {{ref:module:conversation-state-manager}} ต้องผ่าน integration test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความถูกต้องของบทสนทนาโดยตรง" },
      ],
    },
    {
      slug: "session-timeout-tuning",
      title: "Session & Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (WebSocket/connection) เท่านั้น ไม่ใช่ business timeout ของบทสนทนา — ดูเรื่องนั้นที่ {{ref:policy:conversation-state-ttl-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| WebSocket idle timeout | 90s | env `SESSION_IDLE_TIMEOUT_MS` |\n| API gateway → intent-classifier | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| intent-classifier inference | 800ms | env `CLASSIFY_TIMEOUT_MS` |\n| knowledge-base-retriever query | 2s | env `KB_QUERY_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนเมษายน 2026 พบว่า WebSocket idle timeout สั้นเกินไปสำหรับลูกค้าที่พิมพ์ข้อความช้า (พิมพ์แล้วหยุดคิดนาน) ทำให้ session หลุดกลางบทสนทนาบ่อย ขยับจาก 45s เป็น 90s แก้ปัญหาได้" },
      ],
    },
    {
      slug: "knowledge-base-migration-runbook",
      title: "Knowledge Base Index Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อองค์กรลูกค้าเปลี่ยนระบบจัดการเนื้อหาต้นทาง หรือปรับโครงสร้างหมวดหมู่บทความใหม่ทั้งหมด ต้อง migrate index ของ {{ref:module:knowledge-base-retriever}} แบบเต็มชุด" },
        { heading: "ขั้นตอน", body: "1) สร้าง index ใหม่แบบขนานกับ index เดิมโดยไม่ลบของเก่า 2) sync บทความทั้งหมดเข้า index ใหม่ 3) รัน query ทดสอบเทียบผลลัพธ์ index เก่ากับใหม่ 4) สลับ traffic มา index ใหม่แล้วเก็บ index เก่าไว้ 7 วันก่อนลบถาวร" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = bot ตอบผิดเป็นวงกว้างหรือเจ้าหน้าที่รับบทสนทนาไม่ได้เลย, Sev2 = กระทบบาง organization/บาง service, Sev3 = กระทบเล็กน้อยไม่ถึงลูกค้าปลายทาง" },
        { heading: "กรณี PII near-miss", body: "ทุกเหตุการณ์ที่เกี่ยวข้องกับการรั่วไหลหรือเกือบรั่วไหลของข้อมูลอ่อนไหว แม้จะถูกจับได้ก่อนถึงลูกค้าจริง ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "ความลึกคิว {{ref:module:handoff-router}} เกิน 80% ของ `HANDOFF_MAX_QUEUE_DEPTH`, intent confidence เฉลี่ยตกต่ำกว่าปกติผิดสังเกตใน 15 นาที, rate limiter ปฏิเสธข้อความเกิน 10% ของ traffic รวม" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ intent classification accuracy ตกต่ำกว่า 90% หรือ error rate ของการเขียน state พุ่งขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:conversation-state-lost-after-deploy}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| intent-classifier | 2 | 10 | queue depth > 200 ข้อความ |\n| conversation-state-manager | 2 | 8 | CPU > 70% |\n| session-store | 3 | 15 | active connection > 5000 ต่อ replica |\n| handoff-router | 1 | 4 | CPU > 60% |" },
        { heading: "ข้อจำกัดเชิงบุคคล", body: "จำนวนเจ้าหน้าที่จริงที่รับ handoff scale ไม่ได้แบบซอฟต์แวร์ — ช่วง peak support window การ scale software service เร็วขึ้นช่วยได้แค่ระดับการประมวลผล ไม่ได้เพิ่มกำลังการรับสายจริง ดู {{ref:policy:handoff-escalation-policy}} สำหรับข้อจำกัดนี้" },
      ],
    },
    {
      slug: "model-rollout-runbook",
      title: "Intent Model Rollout Runbook",
      tags: ["model", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ rollout โมเดลจำแนก intent เวอร์ชันใหม่ เพื่อป้องกันปัญหาแบบ {{ref:incident:intent-classifier-misroute-after-model-update}} ไม่ให้เกิดซ้ำ",
      sections: [
        { heading: "ก่อน rollout", body: "ต้องเทียบสัดส่วนผลจำแนกแต่ละ label ของโมเดลใหม่กับโมเดลเดิมบน dataset ทดสอบชุดเดียวกันตาม {{ref:convention:testing-convention}} ก่อนเสมอ" },
        { heading: "ระหว่าง canary rollout", body: "เปิดโมเดลใหม่ให้รับ traffic 5% ก่อนเป็นเวลาอย่างน้อย 2 ชั่วโมง เฝ้าดู confidence เฉลี่ยและสัดส่วน handoff เทียบกับกลุ่มที่ยังใช้โมเดลเดิม ถ้าต่างกันเกิน threshold ให้หยุดขยาย rollout ทันที" },
      ],
    },
  ],
};
