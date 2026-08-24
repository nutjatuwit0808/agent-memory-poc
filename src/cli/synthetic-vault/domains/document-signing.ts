import type { DomainProfile } from "../types.js";

// SignFlow — แพลตฟอร์มเซ็นเอกสารอิเล็กทรอนิกส์ (e-signature) สำหรับสัญญาธุรกิจ
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const documentSigning: DomainProfile = {
  id: "document-signing",
  displayName: "SignFlow — แพลตฟอร์มเซ็นเอกสารอิเล็กทรอนิกส์",
  summary: [
    "SignFlow คือแพลตฟอร์มเซ็นเอกสารอิเล็กทรอนิกส์ (e-signature) สำหรับสัญญาธุรกิจ ตั้งแต่การประกอบเอกสาร กำหนดลำดับผู้เซ็น จับลายเซ็นจริง ไปจนถึงเก็บ audit trail ที่ใช้อ้างอิงทางกฎหมายได้ ลูกค้าส่วนใหญ่เป็นทีมกฎหมายและฝ่ายจัดซื้อขององค์กรที่ต้องการเอกสารที่พิสูจน์ได้ว่าใครเซ็นอะไรตอนไหน ไม่ใช่แค่ไฟล์ PDF ที่มีลายเซ็นแปะอยู่",
    "ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่ประกอบ envelope (เอกสาร + field ผู้เซ็น) จับลายเซ็นจริง บันทึก audit trail แบบ hash-chain ไปจนถึงเชื่อมต่อผู้รับรองเอกสาร (notary) ภายนอกสำหรับเอกสารบางประเภทที่กฎหมายกำหนด ทีมวิศวกรรมถือว่า audit trail เป็นหัวใจของระบบมากกว่าตัว UI เซ็นเอกสารเสียอีก เพราะถ้า audit trail พิสูจน์ไม่ได้ว่าใครเซ็นจริง สัญญาทั้งฉบับก็ไร้ความหมายทางกฎหมาย",
  ],
  domainTags: ["document-signing", "signflow"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:envelope-builder}} เป็นเจ้าของโครงสร้าง envelope (เอกสาร, signer, field, ลำดับการเซ็น) ทั้งหมด ส่วน {{ref:module:audit-trail-logger}} เป็นเจ้าของ log เหตุการณ์เท่านั้น ไม่รู้จักโครงสร้างของ field หรือเนื้อหาเอกสารเลย รู้แค่ว่า \"เหตุการณ์อะไรเกิดกับ envelope ไหนตอนไหน\"",
    "{{ref:module:signature-capture}} เป็น service เดียวที่ query ทั้งโครงสร้าง envelope จาก {{ref:module:envelope-builder}} และเขียน event เข้า {{ref:module:audit-trail-logger}} พร้อมกันในทุก transaction เดียว — เหตุผลที่ยอมให้ query ข้าม service แบบนี้ (ผิดหลักทั่วไป) คือการยืนยันว่าผู้เซ็นถึงตาจริงหรือไม่ กับการบันทึกเหตุการณ์เซ็นต้องเกิดเป็น atomic operation เดียวกัน ไม่งั้นจะเกิดช่องว่างที่มีคนเซ็นได้แต่ audit trail ไม่ทันบันทึก",
  ],
  apiGatewayNote: [
    "คำขอจากแอปฝั่งผู้ใช้ (เว็บ/มือถือ) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำขอ \"ดู envelope นี้\" หรือ \"ส่ง envelope นี้\" เป็น call ไปยัง {{ref:module:envelope-builder}} คำขอที่ต้องการผลลัพธ์ทันที เช่น เช็คสถานะ envelope ปัจจุบัน ใช้ synchronous call ตรงนี้",
    "webhook callback จาก {{ref:module:notary-integration}} ไม่ผ่าน API gateway ตัวนี้ — มี endpoint แยกที่ verify signature ของ webhook เองโดยเฉพาะ เพราะ payload มาจากระบบภายนอกที่ไม่ได้ authenticate ด้วยกลไกเดียวกับผู้ใช้ทั่วไป การรวม endpoint ปนกันจะเพิ่มความเสี่ยงด้าน security โดยไม่จำเป็น",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:envelope-builder}} ดูแล ได้แก่ `envelopes` (metadata และสถานะ), `envelope_signers` (ลำดับและสถานะผู้เซ็นแต่ละคน), และ `envelope_fields` (ตำแหน่ง field ทุกช่องในเอกสาร)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `envelopes` | envelope-builder | สถานะรวมของ envelope |\n| `audit_events` | audit-trail-logger | log แบบ append-only มี hash chain |\n| `templates` | template-manager | เทมเพลตสัญญาที่ reuse ได้ พร้อม merge field |\n| `notary_sessions` | notary-integration | สถานะการรับรองเอกสารกับผู้ให้บริการภายนอก |",
    "ทุกตารางใช้ `envelope_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) `audit_events` ห้าม UPDATE หรือ DELETE เด็ดขาดในระดับ database permission ไม่ใช่แค่ application logic เพื่อรักษาความน่าเชื่อถือของ hash chain",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `envelope.sent`, `signer.completed`, `envelope.completed`, `envelope.voided`, `notary.session_completed` — {{ref:module:reminder-scheduler}} subscribe `envelope.sent` เพื่อตั้งตารางเตือนล่วงหน้า และ subscribe `signer.completed` เพื่อยกเลิกเตือนของ signer คนนั้นทันที",
    "{{ref:module:audit-trail-logger}} subscribe แทบทุก event ในระบบเพื่อบันทึกเป็น audit event เสมอ แต่ไม่ publish event ของตัวเองกลับเข้า queue เลย เพราะออกแบบให้เป็น \"ปลายทางบันทึก\" ทางเดียว ไม่ใช่ node ที่ trigger logic อื่นต่อ เพื่อไม่ให้ audit trail กลายเป็นจุดที่ business logic อื่นมาพึ่งพา",
  ],
  modules: [
    {
      slug: "envelope-builder",
      name: "envelope-builder",
      tags: ["envelope", "module", "core"],
      description:
        "ประกอบเอกสาร + field ผู้เซ็น + ลำดับการเซ็นให้เป็น \"envelope\" หนึ่งชุดพร้อมส่งให้เซ็น แยกออกมาจาก \"contract-service\" ก้อนเดียวตั้งแต่ปลายปี 2024 เพราะ logic การจัดวาง field และลำดับผู้เซ็นซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic การจัดการ template แล้วทดสอบยาก",
      functions: [
        { sig: "createEnvelope(templateId: string | null, signers: SignerInput[], documentRefs: string[]): Promise<string>", desc: "สร้าง envelope ใหม่จาก template หรือเอกสารดิบ คืน envelopeId" },
        { sig: "addSignerField(envelopeId: string, signerId: string, fieldType: FieldType, page: number, position: Position): Promise<void>", desc: "เพิ่ม field ที่ต้องกรอก/เซ็นให้ signer คนหนึ่งในตำแหน่งที่ระบุ" },
        { sig: "finalizeEnvelope(envelopeId: string): Promise<void>", desc: "ล็อกโครงสร้าง envelope ไม่ให้แก้ field/signer ได้อีก แล้วเปลี่ยนสถานะเป็น `sent`" },
      ],
      stateFlow: "draft → finalized → sent → completed | voided | expired — ดู {{ref:policy:envelope-expiration-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่ envelope หมดอายุ",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:signature-capture}} โดยตรงตอนสร้าง — envelope-builder แค่กำหนดโครงสร้างและลำดับ ส่วนการบังคับใช้ลำดับจริงตอนเซ็นเป็นหน้าที่ของ {{ref:module:signature-capture}} ที่ query โครงสร้างนี้มาตรวจสอบเองทุกครั้ง เพื่อรักษาหลัก separation of concerns ระหว่าง \"นิยาม\" กับ \"บังคับใช้\"",
      internals: {
        constants: [
          { name: "MAX_SIGNERS_PER_ENVELOPE", value: "20" },
          { name: "MAX_FIELDS_PER_PAGE", value: "50" },
          { name: "DEFAULT_EXPIRATION_DAYS", value: "14" },
        ],
        typeSnippet:
          "interface Envelope {\n  envelopeId: string;\n  status: \"draft\" | \"finalized\" | \"sent\" | \"completed\" | \"voided\" | \"expired\";\n  signingOrder: \"sequential\" | \"parallel\";\n  createdAt: string;\n  expiresAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องลำดับการเซ็นที่ {{ref:policy:signing-order-policy}}",
      },
    },
    {
      slug: "signature-capture",
      name: "signature-capture",
      tags: ["signature", "module", "core"],
      description:
        "จับลายเซ็นจริง (วาดด้วยนิ้ว/เมาส์, พิมพ์ชื่อ, หรือ click-to-sign) และเป็นจุดเดียวที่ตรวจสอบว่าถึงตา signer คนนี้เซ็นจริงหรือยังก่อนอนุญาตให้ดำเนินการต่อ ทุกการเซ็นต้องผ่าน module นี้เท่านั้น ไม่มีทางลัดจาก UI ไหนเขียนสถานะเซ็นตรงๆ",
      functions: [
        { sig: "recordSignature(envelopeId: string, signerId: string, signatureData: string, method: SignMethod): Promise<SignResult>", desc: "บันทึกลายเซ็นจริงของ signer หลังผ่านการตรวจสอบลำดับแล้วเท่านั้น" },
        { sig: "validateSignerTurn(envelopeId: string, signerId: string): Promise<boolean>", desc: "ตรวจว่า signer คนนี้ถึงตาเซ็นจริงตามลำดับที่กำหนดหรือไม่" },
        { sig: "lockFieldAfterSign(envelopeId: string, fieldId: string): Promise<void>", desc: "ล็อก field ที่เซ็นแล้วไม่ให้แก้ไขได้อีก" },
      ],
      stateFlow: "pending → signed | declined — ต่อ signer หนึ่งคนต่อหนึ่ง field ที่ต้องเซ็น",
      relatedNotes:
        "เรียก {{ref:module:audit-trail-logger}} ทุกครั้งที่มีการเซ็นสำเร็จภายใน transaction เดียวกับการเขียนสถานะ (ดู {{ref:arch:boundaries}}) — `validateSignerTurn` คือจุดบังคับใช้จริงของ {{ref:policy:signing-order-policy}} ทั้งหมด ถ้าจุดนี้มี bug ลำดับการเซ็นทั้งระบบก็พังทันที",
      internals: {
        constants: [
          { name: "SIGNATURE_IMAGE_MAX_KB", value: "200" },
          { name: "TOUCH_SAMPLE_RATE_HZ", value: "60" },
          { name: "SIGN_TURN_CACHE_TTL_MS", value: "0" },
        ],
        typeSnippet:
          "interface SignResult {\n  fieldId: string;\n  signerId: string;\n  signedAt: string;\n  method: \"drawn\" | \"typed\" | \"click_to_sign\";\n  auditEventId: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องลำดับการเซ็นที่ {{ref:policy:signing-order-policy}}",
      },
    },
    {
      slug: "audit-trail-logger",
      name: "audit-trail-logger",
      tags: ["audit-trail", "module", "core"],
      description:
        "บันทึกทุกเหตุการณ์ที่เกิดกับ envelope แบบ append-only และ hash-chain (แต่ละ event เก็บ hash ของ event ก่อนหน้าไว้ด้วย) เพื่อพิสูจน์ได้ว่าไม่มีใครแก้ไข log ย้อนหลัง เป็นเอกสารหลักฐานที่ใช้อ้างอิงทางกฎหมายเมื่อเกิดข้อพิพาท",
      functions: [
        { sig: "appendEvent(envelopeId: string, eventType: AuditEventType, actorId: string, metadata: Record<string, unknown>): Promise<string>", desc: "เพิ่ม event ใหม่ต่อท้าย chain คืน eventId" },
        { sig: "computeChainHash(envelopeId: string): Promise<string>", desc: "คำนวณ hash ล่าสุดของ chain ทั้งหมดของ envelope นั้น" },
        { sig: "verifyChainIntegrity(envelopeId: string): Promise<boolean>", desc: "ไล่ตรวจทุก event ใน chain ว่า hash ต่อเนื่องกันถูกต้องไม่มีจุดขาด" },
      ],
      relatedNotes:
        "รับ event จากแทบทุก module ในระบบ (ดู {{ref:arch:queue}}) แต่ไม่ publish event ของตัวเองกลับออกไปเลย — เพื่อไม่ให้กลายเป็นจุดที่ business logic อื่นมาพึ่งพาโดยไม่ตั้งใจ ความถูกต้องของ chain สำคัญกว่าความเร็ว จึงยอม `appendEvent` ช้ากว่า operation อื่นเพื่อรับประกัน ordering",
      internals: {
        constants: [
          { name: "HASH_ALGO", value: "SHA-256" },
          { name: "CHAIN_VERIFY_BATCH_SIZE", value: "500" },
        ],
        typeSnippet:
          "interface AuditEvent {\n  eventId: string;\n  envelopeId: string;\n  eventType: string;\n  actorId: string;\n  occurredAt: string;\n  prevHash: string;\n  hash: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องความสมบูรณ์ของ chain ที่ {{ref:policy:audit-trail-integrity-policy}}",
      },
    },
    {
      slug: "template-manager",
      name: "template-manager",
      tags: ["template", "module"],
      description:
        "จัดการเทมเพลตสัญญาที่ reuse ได้ พร้อม merge field (เช่น `{{customer_name}}`) ที่จะถูกแทนที่ด้วยค่าจริงตอนสร้าง envelope แต่ละเวอร์ชันของ template ถูก publish แยกจากกันเพื่อไม่ให้แก้ template กระทบ envelope ที่ส่งไปแล้วก่อนหน้า",
      functions: [
        { sig: "createTemplate(name: string, documentContent: string, mergeFields: string[]): Promise<string>", desc: "สร้าง template ใหม่พร้อมระบุ merge field ที่ต้องกรอก" },
        { sig: "renderTemplate(templateId: string, mergeValues: Record<string, string>): Promise<string>", desc: "แทนที่ merge field ด้วยค่าจริง คืนเนื้อหาเอกสารที่พร้อมส่งเข้า envelope-builder" },
        { sig: "publishTemplateVersion(templateId: string): Promise<number>", desc: "ล็อก template เวอร์ชันปัจจุบัน คืนเลขเวอร์ชันใหม่" },
      ],
      relatedNotes:
        "{{ref:module:envelope-builder}} เรียก `renderTemplate` ตอนสร้าง envelope จาก template แต่ template-manager ไม่รู้จัก concept ของ signer หรือลำดับการเซ็นเลย — รู้แค่เนื้อหาเอกสารกับ merge field เท่านั้น merge field ที่ไม่ถูกกรอกจัดการตาม {{ref:policy:template-merge-field-policy}}",
    },
    {
      slug: "notary-integration",
      name: "notary-integration",
      tags: ["notary", "module"],
      description:
        "เชื่อมต่อกับผู้ให้บริการรับรองเอกสารออนไลน์ (remote online notary) ภายนอกสำหรับเอกสารบางประเภทที่กฎหมายกำหนดว่าต้องมีพยานรับรองเพิ่มเติมจากการเซ็นปกติ เป็น service เดียวที่คุยกับระบบภายนอกฝั่งกฎหมาย/notary โดยตรง",
      functions: [
        { sig: "requestNotarySession(envelopeId: string, notaryProviderId: string): Promise<string>", desc: "ขอ session รับรองเอกสารจากผู้ให้บริการภายนอก คืน sessionId" },
        { sig: "handleNotaryWebhook(payload: NotaryWebhookPayload): Promise<void>", desc: "ประมวลผล webhook callback เมื่อ session เสร็จสิ้นหรือเปลี่ยนสถานะ" },
        { sig: "retryNotarySession(sessionId: string): Promise<void>", desc: "ขอ session ใหม่เมื่อ session เดิมล้มเหลวหรือ timeout" },
      ],
      relatedNotes:
        "เอกสารประเภทไหนต้องผ่าน notary กำหนดโดย {{ref:policy:notary-requirement-policy}} — `handleNotaryWebhook` ไม่ผ่าน API gateway กลาง (ดู {{ref:arch:gateway}}) เพราะต้อง verify signature ของ webhook ด้วยกลไกเฉพาะที่ต่างจาก authentication ของผู้ใช้ทั่วไป",
    },
    {
      slug: "reminder-scheduler",
      name: "reminder-scheduler",
      tags: ["reminder", "module"],
      description:
        "ส่งอีเมล/SMS เตือน signer ที่ยังไม่ถึงตาเซ็นหรือถึงตาแล้วแต่ยังไม่ดำเนินการ ตามตารางเวลาที่กำหนด ต้องยกเลิกการเตือนที่ตั้งไว้ทันทีเมื่อ signer เซ็นเสร็จแล้ว ไม่งั้นจะกลายเป็นสแปมที่ทำลายความน่าเชื่อถือของแพลตฟอร์ม",
      functions: [
        { sig: "scheduleReminder(envelopeId: string, signerId: string, sendAt: string): Promise<string>", desc: "ตั้งเตือนล่วงหน้าสำหรับ signer คนหนึ่ง คืน reminderId" },
        { sig: "cancelRemindersForSigner(envelopeId: string, signerId: string): Promise<void>", desc: "ยกเลิกเตือนที่ยังไม่ส่งทั้งหมดของ signer คนนี้ใน envelope นี้" },
        { sig: "sendDueReminders(): Promise<number>", desc: "ส่งเตือนทั้งหมดที่ถึงกำหนดเวลาแล้ว รันเป็น scheduled job รายชั่วโมง คืนจำนวนที่ส่งสำเร็จ" },
      ],
      relatedNotes:
        "subscribe event `signer.completed` จาก {{ref:module:signature-capture}} เพื่อเรียก `cancelRemindersForSigner` โดยอัตโนมัติทันทีที่ signer เซ็นเสร็จ — ความถี่และจำนวนครั้งสูงสุดของการเตือนกำหนดโดย {{ref:policy:reminder-frequency-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "envelope-builder-service",
      vars: [
        { name: "MAX_SIGNERS_PER_ENVELOPE", example: "20", note: "" },
        { name: "DEFAULT_EXPIRATION_DAYS", example: "14", note: "ดู {{ref:policy:envelope-expiration-policy}}" },
      ],
    },
    {
      service: "signature-capture-service",
      vars: [
        { name: "SIGNATURE_IMAGE_MAX_KB", example: "200", note: "" },
        { name: "SIGN_CAPTURE_DB_URL", example: "postgres://sign-db.internal:5432/signature", note: "secret ห้าม log" },
      ],
    },
    {
      service: "audit-trail-logger-service",
      vars: [
        { name: "HASH_ALGO", example: "SHA-256", note: "ดู {{ref:policy:audit-trail-integrity-policy}}" },
        { name: "AUDIT_LOG_DB_URL", example: "postgres://audit-db.internal:5432/audit", note: "secret ห้าม log, ต้อง append-only permission เท่านั้น" },
      ],
    },
    {
      service: "notary-integration-service",
      vars: [
        { name: "NOTARY_WEBHOOK_SECRET", example: "whsec_xxx", note: "secret ห้าม log ใช้ verify webhook signature" },
        { name: "NOTARY_SESSION_TIMEOUT_MS", example: "600000", note: "" },
      ],
    },
  ],
  policies: [
    {
      slug: "signing-order-policy",
      title: "นโยบายลำดับการเซ็นเอกสาร (Signing Order)",
      tags: ["signing-order", "policy"],
      isPrimary: true,
      intro: [
        "envelope ที่ตั้งค่า `signingOrder = \"sequential\"` บังคับให้ signer เซ็นตามลำดับที่กำหนดเท่านั้น — signer ลำดับถัดไปจะไม่สามารถเซ็นได้จนกว่า signer ก่อนหน้าจะเซ็นเสร็จ ตรวจสอบผ่าน `validateSignerTurn` ทุกครั้งก่อนอนุญาต `recordSignature`",
        "envelope ที่ตั้งค่า `signingOrder = \"parallel\"` ให้ signer ทุกคนเซ็นเมื่อไหร่ก็ได้โดยไม่ต้องรอกัน เหมาะกับกรณีที่ผู้เซ็นแต่ละคนไม่มีความสัมพันธ์เชิงอนุมัติต่อกัน",
      ],
      sections: [
        {
          heading: "ทำไมต้องบังคับลำดับที่ชั้น service ไม่ใช่แค่ UI",
          body: "ถ้าบังคับแค่ระดับ UI (เช่น ซ่อนปุ่มเซ็นของคนที่ยังไม่ถึงตา) ผู้ใช้ที่เรียก API ตรงหรือใช้ integration ภายนอกจะข้ามลำดับได้ การบังคับที่ `validateSignerTurn` ในชั้น service ทำให้ไม่มีทางลัดใดๆ เข้าถึงได้เลยไม่ว่าจะผ่านช่องทางไหน",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นของลำดับการเซ็นเมื่อมี Signer ถูกข้าม (Skip) หรือ Delegate",
        tags: ["signing-order", "edge-case"],
        body: [
          "ถ้า signer ในลำดับถูกตั้งเป็น `optional` (เช่น ผู้รับทราบที่ไม่จำเป็นต้องเซ็นจริง) ระบบจะข้ามไปให้ signer ลำดับถัดไปเซ็นได้ทันทีโดยไม่ต้องรอ ไม่ต่างจากกรณีปกติที่ signer คนนั้นเซ็นแล้ว — สถานะของ signer ที่ถูกข้ามจะบันทึกเป็น `skipped` ไม่ใช่ `signed`",
          "การ delegate สิทธิ์เซ็นให้คนอื่น (ดู {{ref:policy:delegate-signing-policy}}) ไม่เปลี่ยนลำดับเดิม — คน delegate ใหม่เข้ามาแทนตำแหน่งเดิมในลำดับเป๊ะๆ ไม่ใช่การเพิ่ม signer ใหม่ต่อท้าย เพื่อไม่ให้ audit trail สับสนว่าใครควรเซ็นตอนไหน",
        ],
      },
    },
    {
      slug: "audit-trail-integrity-policy",
      title: "นโยบายความสมบูรณ์ของ Audit Trail",
      tags: ["audit-trail", "integrity", "policy"],
      isPrimary: true,
      intro: [
        "ทุก event ใน `audit_events` ต้องมี `prevHash` ที่ตรงกับ `hash` ของ event ก่อนหน้าเสมอ ทำให้การแก้ไข event ใดๆ ย้อนหลังจะทำให้ chain ทั้งหมดหลังจุดนั้นไม่ตรงกันทันทีเมื่อ `verifyChainIntegrity` ตรวจสอบ",
        "ตาราง `audit_events` มี database permission แบบ append-only จริง (ไม่ใช่แค่ convention ในโค้ด) — แม้แต่ทีม engineering เองก็ไม่มีสิทธิ์ UPDATE หรือ DELETE โดยตรงผ่าน production access ปกติ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อพบ Chain ขาดจากปัญหาทางเทคนิค (ไม่ใช่การปลอมแปลง)",
        tags: ["audit-trail", "edge-case"],
        body: [
          "ถ้า `verifyChainIntegrity` พบว่า chain ขาดเพราะปัญหาทางเทคนิค (เช่น event สูญหายจาก infrastructure failure ที่พิสูจน์ได้จาก log อื่น ไม่ใช่การปลอมแปลง) ระบบจะไม่พยายาม \"ซ่อม\" chain เดิมเด็ดขาด — จะสร้าง event พิเศษ `chain_gap_documented` ต่อท้าย chain ที่อธิบายช่องว่างและอ้างอิงหลักฐานประกอบแทน เพื่อรักษาความจริงที่ว่า chain นี้เคยขาดจริง",
          "envelope ที่มี `chain_gap_documented` ต้องแนบ postmortem หรือหลักฐานสนับสนุนเสมอเมื่อใช้เป็นหลักฐานทางกฎหมาย ทีมกฎหมายของลูกค้าต้องได้รับแจ้งก่อนใช้เอกสารกลุ่มนี้ในการดำเนินคดีหรือข้อพิพาทใดๆ",
        ],
      },
    },
    {
      slug: "envelope-expiration-policy",
      title: "นโยบายวันหมดอายุของ Envelope",
      tags: ["envelope", "expiration", "policy"],
      isPrimary: true,
      intro: [
        "envelope หมดอายุอัตโนมัติเมื่อเกิน `DEFAULT_EXPIRATION_DAYS` (14 วัน) นับจากวันที่ finalize เว้นแต่ผู้สร้างจะระบุวันหมดอายุเองตอนสร้าง — เมื่อหมดอายุ signer ที่ยังไม่เซ็นจะไม่สามารถเซ็นได้อีกแม้จะมีลิงก์เดิมอยู่ก็ตาม",
        "การหมดอายุตรวจสอบที่ชั้น {{ref:module:signature-capture}} ทุกครั้งก่อนอนุญาตให้เซ็น ไม่ใช่แค่การซ่อนลิงก์ที่ฝั่ง frontend เพราะลิงก์เก่าอาจถูก cache หรือ bookmark ไว้",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อต้องขยายวันหมดอายุหลัง Envelope Sent แล้ว",
        tags: ["envelope", "expiration", "edge-case"],
        body: [
          "ผู้สร้าง envelope สามารถขยายวันหมดอายุได้หลังส่งไปแล้ว แต่การขยายแต่ละครั้งต้องบันทึกเป็น audit event `expiration_extended` พร้อมเหตุผลเสมอ — ไม่ใช่แค่แก้ค่า `expiresAt` เงียบๆ เพราะการขยายวันหมดอายุกระทบสิทธิ์ของ signer ที่ยังไม่เซ็นโดยตรง",
          "envelope ที่หมดอายุไปแล้วไม่สามารถขยายย้อนหลังได้ ต้องสร้าง envelope ใหม่แทนเสมอ เพื่อไม่ให้เกิดคำถามว่าลายเซ็นที่เซ็นหลังหมดอายุ (ถ้าเกิดขึ้นจาก bug) นับเป็นถูกต้องหรือไม่ — การสร้างใหม่ตัดปัญหานี้ทิ้งไปตั้งแต่ต้น",
        ],
      },
    },
    {
      slug: "template-merge-field-policy",
      title: "นโยบายการจัดการ Merge Field ที่ไม่ถูกกรอก",
      tags: ["template", "merge-field", "policy"],
      isPrimary: true,
      intro: [
        "merge field ทุกตัวที่ประกาศไว้ใน template ต้องถูกกรอกค่าให้ครบก่อน `renderTemplate` จะสำเร็จ — ถ้ามี field ใดไม่ถูกส่งค่ามา ฟังก์ชันจะ throw error ทันที ไม่ render เอกสารที่มี placeholder ค้างออกไปให้ envelope-builder ใช้งานต่อเด็ดขาด",
        "เหตุผลที่เข้มงวดขนาดนี้เพราะเอกสารที่มี placeholder ค้าง (เช่น `{{customer_name}}` ที่ไม่ถูกแทนที่) เคยถูกส่งออกไปให้ลูกค้าเซ็นจริงมาก่อน สร้างความเสียหายต่อความน่าเชื่อถือมากกว่าการ block ไม่ให้สร้าง envelope ได้ทันที",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Merge Field ที่ตั้งใจให้เป็น Optional",
        tags: ["template", "edge-case"],
        body: [
          "merge field ที่ประกาศเป็น `optional` ตอนสร้าง template (เช่น เลขที่ห้องในที่อยู่ที่บางบริษัทไม่มี) สามารถเว้นว่างได้โดย `renderTemplate` จะแทนที่ด้วยสตริงว่างแทนที่จะ throw error — field ประเภทนี้ต้องระบุไว้ตั้งแต่ตอน `createTemplate` เท่านั้น เปลี่ยนภายหลังไม่ได้เพื่อไม่ให้ template เดิมที่เคย render ไปแล้วมีความหมายเปลี่ยนไป",
          "field ที่เกี่ยวกับตัวเลขทางการเงิน (จำนวนเงิน, วันที่ครบกำหนด) ห้ามตั้งเป็น optional เด็ดขาดไม่ว่ากรณีใด แม้ผู้สร้าง template จะพยายามตั้งก็ตาม ระบบปฏิเสธการตั้งค่านี้ตั้งแต่ชั้น validation",
        ],
      },
    },
    {
      slug: "notary-requirement-policy",
      title: "นโยบายการกำหนดเอกสารที่ต้องผ่าน Notary",
      tags: ["notary", "policy"],
      isPrimary: true,
      intro: [
        "เอกสารที่ถูก flag เป็นประเภท `notarization_required` ตอนสร้าง template (เช่น เอกสารโอนกรรมสิทธิ์บางประเภท) ต้องผ่าน {{ref:module:notary-integration}} ก่อนถึงจะเปลี่ยนสถานะเป็น `completed` ได้ แม้ signer ทุกคนจะเซ็นครบแล้วก็ตาม",
        "envelope ที่ต้องผ่าน notary จะมี state พิเศษ `pending_notarization` คั่นระหว่าง \"เซ็นครบแล้ว\" กับ \"completed จริง\" เพื่อสื่อสารให้ทุกฝ่ายเห็นชัดว่ายังไม่จบกระบวนการ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Notary Session ล้มเหลวซ้ำหลายครั้ง",
        tags: ["notary", "edge-case"],
        body: [
          "ถ้า `retryNotarySession` ล้มเหลวติดต่อกันเกิน 3 ครั้งภายใน 24 ชั่วโมง (มักเกิดจาก notary provider มีปัญหาฝั่งเขา) ระบบจะไม่ retry อัตโนมัติต่ออีก แต่แจ้งทีม support ให้ประสานงานกับ provider หรือเสนอ provider สำรองให้ลูกค้าเลือกแทน เพื่อไม่ให้ envelope ค้างสถานะ `pending_notarization` ไม่จำกัดเวลาโดยไม่มีใครรู้",
          "เอกสารที่ notarization ล้มเหลวจริงและลูกค้าต้องการยกเลิก ต้อง void envelope ทั้งฉบับแล้วเริ่มใหม่ ห้ามพยายามข้ามขั้นตอน notary แล้ว mark เป็น completed เองเด็ดขาด เพราะจะทำให้เอกสารไม่มีผลทางกฎหมายตามที่ตั้งใจไว้ตั้งแต่ต้น",
        ],
      },
    },
    {
      slug: "reminder-frequency-policy",
      title: "นโยบายความถี่การแจ้งเตือนผู้เซ็น",
      tags: ["reminder", "policy"],
      isPrimary: true,
      intro: [
        "signer ที่ยังไม่เซ็นจะได้รับเตือนทุก 2 วันหลังถึงตาเซ็น สูงสุด 3 ครั้งก่อนที่ระบบจะหยุดเตือนอัตโนมัติและแจ้งผู้สร้าง envelope ให้ตามด้วยตัวเองแทน เพื่อไม่ให้กลายเป็นสแปมสำหรับ signer ที่ตั้งใจไม่เซ็น",
        "เตือนทุกฉบับต้องถูกยกเลิกทันทีที่ signer เซ็นเสร็จผ่าน event `signer.completed` — นี่คือกลไกป้องกันหลักไม่ให้ signer ที่เซ็นแล้วยังได้รับเตือนซ้ำ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Envelope ที่ใกล้วันหมดอายุ",
        tags: ["reminder", "edge-case"],
        body: [
          "ถ้า envelope เหลือเวลาไม่ถึง 48 ชั่วโมงก่อนหมดอายุตาม {{ref:policy:envelope-expiration-policy}} ระบบจะส่งเตือนพิเศษเพิ่มอีก 1 ครั้งนอกเหนือจากโควตาปกติ 3 ครั้ง โดยระบุชัดเจนว่าใกล้หมดอายุแล้ว เพราะความเสี่ยงที่ signer จะพลาดกำหนดเวลาสำคัญกว่าความเสี่ยงเรื่องสแปมในสถานการณ์นี้",
          "เตือนพิเศษก่อนหมดอายุนี้ส่งได้แม้ signer จะเคยได้รับครบ 3 ครั้งแล้วก็ตาม แต่ยังต้องถูกยกเลิกทันทีเช่นเดิมถ้า signer เซ็นเสร็จก่อนเวลาที่กำหนดส่ง",
        ],
      },
    },
    {
      slug: "envelope-void-policy",
      title: "นโยบายการยกเลิก Envelope (Void)",
      tags: ["envelope", "void", "policy"],
      isPrimary: false,
      intro: [
        "envelope ที่ยังไม่มีใครเซ็นเลยสามารถ void ได้ทันทีโดยผู้สร้างคนเดียว แต่ envelope ที่มี signer เซ็นไปแล้วอย่างน้อย 1 คน ต้องระบุเหตุผลการ void และบันทึกเป็น audit event เสมอ เพราะกระทบสิทธิ์ของคนที่เซ็นไปแล้ว",
        "envelope ที่ void แล้วไม่สามารถกลับมาเซ็นต่อได้อีก แม้จะยังไม่หมดอายุตามปกติก็ตาม ต้องสร้าง envelope ใหม่เสมอ",
      ],
    },
    {
      slug: "signer-identity-verification-policy",
      title: "นโยบายการยืนยันตัวตนผู้เซ็น",
      tags: ["identity", "policy"],
      isPrimary: false,
      intro: [
        "signer ทุกคนต้องยืนยันตัวตนอย่างน้อยด้วยอีเมลที่ลงทะเบียนไว้ก่อนเข้าถึง envelope ได้ เอกสารที่มีมูลค่าสูงหรือ flag พิเศษต้องเพิ่มการยืนยันด้วย OTP ทาง SMS อีกชั้นหนึ่ง",
        "ระดับการยืนยันตัวตนที่ใช้ต้องถูกบันทึกลง audit event ทุกครั้งที่มีการเซ็น เพื่อให้สามารถอ้างอิงย้อนหลังได้ว่าตอนเซ็นมีการยืนยันตัวตนระดับไหน",
      ],
    },
    {
      slug: "document-retention-policy",
      title: "นโยบายการเก็บรักษาเอกสารที่เซ็นเสร็จแล้ว",
      tags: ["retention", "policy"],
      isPrimary: false,
      intro: [
        "envelope ที่ completed แล้วเก็บถาวรไม่มีวันลบ พร้อม audit trail ทั้งหมดที่เกี่ยวข้อง เพราะเป็นเอกสารที่อาจต้องใช้อ้างอิงทางกฎหมายได้ทุกเมื่อแม้จะผ่านไปหลายปี",
        "envelope ที่ voided หรือ expired โดยไม่มีใครเซ็นเลยเก็บไว้ 3 ปีแล้ว archive ไปเก็บแบบ cold storage แทนที่จะลบทิ้ง เผื่อกรณีต้องพิสูจน์ว่าเคยส่งเอกสารไปจริงแม้จะไม่มีใครเซ็น",
      ],
    },
    {
      slug: "bulk-send-policy",
      title: "นโยบายการส่ง Envelope แบบชุด (Bulk Send)",
      tags: ["bulk-send", "policy"],
      isPrimary: false,
      intro: [
        "การส่ง envelope จาก template เดียวกันให้ signer หลายชุดพร้อมกัน (เช่น ส่งสัญญาจ้างให้พนักงานใหม่ 50 คน) ต้องสร้างเป็น envelope แยกกันทุกชุด ไม่ใช่ envelope เดียวที่มี signer หลายกลุ่ม เพื่อไม่ให้ audit trail ของแต่ละคนปนกัน",
        "ถ้าบาง envelope ใน batch ล้มเหลวตอนสร้าง (เช่น อีเมลผิดรูปแบบ) envelope อื่นที่สร้างสำเร็จต้องยังคงถูกส่งตามปกติ ไม่ยกเลิกทั้ง batch เพราะบาง record ผิดพลาด",
      ],
    },
    {
      slug: "delegate-signing-policy",
      title: "นโยบายการมอบสิทธิ์เซ็นแทน (Delegate Signing)",
      tags: ["delegate", "policy"],
      isPrimary: false,
      intro: [
        "signer ที่ไม่สะดวกเซ็นเองสามารถ delegate สิทธิ์ให้คนอื่นเซ็นแทนได้ในบาง template ที่เปิดใช้ feature นี้ไว้เท่านั้น ไม่ใช่ทุก envelope เปิดให้ delegate ได้โดยอัตโนมัติ",
        "คน delegate ต้องยืนยันตัวตนแยกจากคนเดิมเสมอตาม {{ref:policy:signer-identity-verification-policy}} และ audit trail ต้องบันทึกทั้งชื่อผู้มอบสิทธิ์เดิมและผู้เซ็นจริงคู่กันเสมอ ไม่ใช่แค่บันทึกผู้เซ็นจริงเพียงอย่างเดียว",
      ],
    },
  ],
  incidents: [
    {
      slug: "sequential-signing-order-bypass",
      title: "Signer ลำดับหลังเซ็นสำเร็จก่อน Signer ลำดับต้นที่ยังไม่เซ็น",
      tags: ["signing-order", "bug"],
      summary:
        "ทีมกฎหมายของลูกค้าแจ้งว่าสัญญาฉบับหนึ่งมีลายเซ็นของผู้อนุมัติลำดับที่สองครบแล้ว ทั้งที่ผู้อนุมัติลำดับแรก (ซึ่งต้องเซ็นก่อนตามลำดับ sequential) ยังไม่ได้เซ็นเลย",
      investigation:
        "ตรวจ log `recordSignature` พบว่า signer ลำดับสองเรียก API ผ่าน mobile app เวอร์ชันเก่าที่ cache ผลจาก `validateSignerTurn` ไว้ตั้งแต่ตอนเปิดแอปครั้งแรก ทำให้ app เชื่อว่าถึงตาตัวเองแล้วทั้งที่ backend ยังไม่อนุญาต",
      cause:
        "mobile app เวอร์ชันนั้น cache ผล `validateSignerTurn` ไว้ 5 นาทีเพื่อลด API call แต่ `recordSignature` ฝั่ง backend ไม่ได้เรียก `validateSignerTurn` ซ้ำก่อนบันทึกจริง — เชื่อผลจาก client ที่ส่งมาโดยตรง ทำให้ cache ที่ค้างเปิดช่องให้เซ็นข้ามลำดับได้",
      resolution:
        "แก้ `recordSignature` ให้เรียก `validateSignerTurn` ซ้ำที่ฝั่ง backend เสมอก่อนบันทึกทุกครั้ง ไม่เชื่อผลที่ client ส่งมา แล้ว void ลายเซ็นที่ผิดลำดับพร้อมแจ้งทั้งสองฝ่ายให้เซ็นใหม่ตามลำดับที่ถูกต้อง",
      followup:
        "เพิ่มกฎใน {{ref:convention:code-review-checklist}} ว่าฟังก์ชันที่ตรวจสิทธิ์ต้อง validate ที่ backend เสมอ ห้ามเชื่อผลจาก client แม้จะมาจาก cache ที่ backend เองเคยตอบไปก็ตาม",
    },
    {
      slug: "audit-trail-hash-mismatch-compliance-review",
      title: "พบ Hash Mismatch ใน Audit Trail ระหว่างการตรวจสอบ Compliance",
      tags: ["audit-trail", "compliance"],
      summary:
        "ระหว่างการตรวจสอบ compliance ประจำปีของลูกค้ารายใหญ่ พบว่า envelope บางฉบับที่สร้างเมื่อ 8 เดือนก่อนมี hash chain ที่ verify ไม่ผ่านเมื่อรัน `verifyChainIntegrity`",
      investigation:
        "ตรวจสอบ `audit_events` ของ envelope ที่มีปัญหาพบว่ามี event หนึ่งหายไปจาก chain ตรง timestamp ที่ตรงกับช่วงที่ทีม infrastructure ทำ database migration ครั้งใหญ่เมื่อ 8 เดือนก่อน",
      cause:
        "migration script ตัวหนึ่งที่ควรแค่ copy ข้อมูลไปตาราง partition ใหม่ มี bug ที่ข้าม row บางแถวที่มี timestamp คาบเกี่ยวกับช่วงเวลาที่ migration กำลังรัน (race condition ระหว่าง insert สดกับ migration read) ทำให้ event บางตัวไม่ถูก copy ไปตารางใหม่",
      resolution:
        "กู้ event ที่หายจาก database backup ก่อน migration แล้วสร้าง event `chain_gap_documented` ตามที่ {{ref:policy:audit-trail-integrity-policy}} กำหนด พร้อมแนบหลักฐาน backup ประกอบ แจ้งทีมกฎหมายของลูกค้าให้ทราบก่อนใช้เอกสารกลุ่มนี้ต่อ",
      followup:
        "ห้าม migration script ใดๆ แตะตาราง `audit_events` ระหว่างมีการเขียนสด (live traffic) อีก ต้องหยุดรับ write ชั่วคราวหรือใช้วิธี migrate แบบ dual-write แทนเสมอ เพิ่มเป็นข้อบังคับใน {{ref:deployment:template-schema-migration-runbook}}",
    },
    {
      slug: "expired-link-still-allowed-signing",
      title: "ลิงก์เซ็นที่หมดอายุแล้วยังเซ็นได้จริง",
      tags: ["expiration", "bug"],
      summary:
        "ลูกค้ารายหนึ่งเซ็นเอกสารสำเร็จผ่านลิงก์เก่าที่ควรหมดอายุไปแล้ว 3 วัน ทำให้ผู้สร้าง envelope กังวลว่าเอกสารจะมีผลทางกฎหมายหรือไม่",
      investigation:
        "ตรวจ `recordSignature` พบว่าฟังก์ชันเช็ค `expiresAt` ของ envelope ก่อนอนุญาตเซ็นจริง แต่การเช็คใช้ timezone ของ server (UTC) เทียบกับ `expiresAt` ที่คำนวณด้วย local timezone ของผู้สร้างตอนตั้งค่าตอนแรก ทำให้เกิดความคลาดเคลื่อนหลายชั่วโมง",
      cause:
        "`DEFAULT_EXPIRATION_DAYS` ถูกคำนวณเป็น `createdAt + 14 วัน` โดยใช้ timezone ของ request ที่สร้าง envelope แต่การเช็คตอนเซ็นใช้ UTC ตรงๆ ไม่ได้แปลง timezone ให้ตรงกัน ทำให้ในบาง timezone ลิงก์ดูเหมือนยังไม่หมดอายุทั้งที่ควรจะหมดแล้ว",
      resolution:
        "แก้ให้ `expiresAt` เก็บเป็น UTC timestamp เสมอตั้งแต่ตอนคำนวณครั้งแรก ไม่แปลงกลับไปกลับมา แล้ว void การเซ็นที่เกิดขึ้นหลังหมดอายุจริงพร้อมแจ้งทั้งสองฝ่ายให้สร้าง envelope ใหม่",
      followup:
        "เพิ่ม test case ที่ครอบคลุมหลาย timezone สำหรับ logic ที่เกี่ยวกับวันหมดอายุทั้งหมด และเพิ่มกฎใน {{ref:convention:naming-convention}} ว่า timestamp ทุกตัวในระบบต้องเก็บเป็น UTC เท่านั้น",
    },
    {
      slug: "template-merge-field-unfilled-placeholder-sent",
      title: "ส่งสัญญาที่มี Placeholder ค้างให้ลูกค้าเซ็นจริง",
      tags: ["template", "merge-field"],
      summary:
        "ลูกค้ารายหนึ่งได้รับสัญญาที่มีข้อความ `{{customer_company_name}}` ค้างอยู่แทนชื่อบริษัทจริง แจ้งกลับมาด้วยความไม่พอใจก่อนจะเซ็น",
      investigation:
        "ตรวจ `renderTemplate` พบว่า merge field ตัวนี้ถูกตั้งเป็น `optional` ตอนสร้าง template ทั้งที่เป็นชื่อบริษัทซึ่งไม่ควรเป็น optional เลย — ระบบจึงไม่ throw error และ render placeholder ที่ไม่ถูกกรอกออกไปตรงๆ",
      cause:
        "ตอนสร้าง template ผู้สร้างตั้ง field นี้เป็น optional โดยเข้าใจผิดว่า optional หมายถึง \"กรอกทีหลังได้\" ไม่ใช่ \"ไม่กรอกก็ได้\" — {{ref:policy:template-merge-field-policy}} ไม่มีการเตือนหรือ validate ความหมายของ field ที่ดูเหมือนสำคัญตอนตั้งเป็น optional",
      resolution:
        "void envelope ที่มีปัญหาทันที แก้ template ให้ field นี้เป็น required แล้วสร้าง envelope ใหม่พร้อมกรอกข้อมูลให้ถูกต้อง ส่งขอโทษลูกค้าพร้อมอธิบายสถานการณ์",
      followup:
        "เพิ่ม warning ที่ชั้น `createTemplate` เมื่อ field ที่ดูเหมือนเป็นข้อมูลสำคัญ (ชื่อ, จำนวนเงิน, วันที่) ถูกตั้งเป็น optional ให้ผู้สร้าง template ยืนยันซ้ำอีกครั้งก่อนบันทึก",
    },
    {
      slug: "notary-integration-outage-blocked-batch",
      title: "Notary Provider ล่มพร้อมกันบล็อกการปิดดีลชุดใหญ่",
      tags: ["notary", "outage"],
      summary:
        "ลูกค้ารายใหญ่รายหนึ่งมี envelope ประมาณ 40 ฉบับที่ signer เซ็นครบแล้วแต่ค้างสถานะ `pending_notarization` พร้อมกัน เพราะ notary provider หลักที่ใช้ล่มทั้งระบบนานเกือบ 6 ชั่วโมง",
      investigation:
        "ตรวจ {{ref:module:notary-integration}} พบว่า `requestNotarySession` ทุกคำขอไปยัง provider นี้ตั้งแต่ช่วงเวลาดังกล่าว timeout หมด และ `retryNotarySession` ก็ล้มเหลวซ้ำเช่นกันเพราะ provider ล่มจริง ไม่ใช่ปัญหาชั่วคราวรายคำขอ",
      cause:
        "ระบบใช้ notary provider เดียวเป็น hard dependency ไม่มี fallback provider สำรอง ทำให้เมื่อ provider หลักล่ม envelope ทั้งหมดที่ต้องผ่าน notary ค้างพร้อมกันโดยไม่มีทางเลือกอื่นเลย",
      resolution:
        "รอ provider กลับมาให้บริการปกติแล้วรัน `retryNotarySession` เป็นชุดให้ทุก envelope ที่ค้าง พร้อมแจ้งลูกค้าที่ได้รับผลกระทบเป็นรายบุคคลเรื่องความล่าช้า",
      followup:
        "เสนอเพิ่ม notary provider สำรองอย่างน้อยหนึ่งรายที่สามารถสลับไปใช้ได้เมื่อ provider หลักมีปัญหานานเกินเกณฑ์ที่กำหนด พิจารณาคู่กับ {{ref:policy:notary-requirement-policy}} เรื่องการเลือก provider สำรองให้ลูกค้า",
    },
    {
      slug: "reminder-scheduler-repeated-emails-after-completion",
      title: "ส่งอีเมลเตือนซ้ำให้ Signer ที่เซ็นเสร็จไปแล้ว",
      tags: ["reminder", "bug"],
      summary:
        "signer หลายคนร้องเรียนว่ายังได้รับอีเมลเตือนให้เซ็นเอกสารต่อเนื่องหลายวัน ทั้งที่ตัวเองเซ็นเสร็จไปตั้งแต่วันแรกแล้ว",
      investigation:
        "ตรวจ {{ref:module:reminder-scheduler}} พบว่า `cancelRemindersForSigner` ถูกเรียกจริงตอน signer เซ็นเสร็จ แต่ reminder ที่ถูกส่งเข้า queue ไปแล้วก่อนหน้า (รอ `sendDueReminders` หยิบไปส่ง) ไม่ถูกยกเลิกตามไปด้วย เพราะ cancel แค่ลบ record ในตาราง schedule ไม่ได้แตะ message ที่อยู่ใน queue แล้ว",
      cause:
        "สถาปัตยกรรมแยก \"ตารางเตือนที่ตั้งไว้\" กับ \"queue ที่รอส่งจริง\" ออกจากกัน การ cancel แก้แค่ฝั่งตารางแต่ message ที่ถูกดึงเข้า queue ไปก่อนหน้าถือว่าจะถูกส่งแน่นอนไม่ว่าจะ cancel ทีหลังหรือไม่",
      resolution:
        "แก้ `sendDueReminders` ให้เช็คสถานะ signer ล่าสุดอีกครั้งก่อนส่งจริงเสมอ (ไม่เชื่อแค่ว่าอยู่ใน queue แล้วต้องส่ง) แล้วส่งอีเมลขอโทษ signer ที่ได้รับผลกระทบพร้อมอธิบายว่าไม่ต้องดำเนินการอะไรเพิ่ม",
      followup:
        "ปรับให้ `cancelRemindersForSigner` ลบ message ออกจาก queue โดยตรงด้วยถ้าทำได้ ไม่ใช่แค่ลบ record ในตาราง schedule เพื่อลดโอกาสเกิดช่องว่างแบบนี้อีก",
    },
    {
      slug: "envelope-builder-race-condition-duplicate-envelope",
      title: "สร้าง Envelope ซ้ำสองฉบับจากการกดส่งซ้อนกัน",
      tags: ["envelope", "bug"],
      summary:
        "ผู้ใช้รายหนึ่งกดปุ่ม \"ส่งเอกสาร\" สองครั้งติดกันเพราะหน้าเว็บโหลดช้า ทำให้ signer ได้รับอีเมลเซ็นเอกสารสองฉบับที่เนื้อหาเหมือนกันทุกประการ",
      investigation:
        "ตรวจ log `createEnvelope` พบว่ามีสอง request เข้ามาห่างกันไม่ถึง 1 วินาทีจาก session เดียวกัน ทั้งสอง request ผ่าน validation และสร้าง envelope สำเร็จทั้งคู่แยกกันโดยสมบูรณ์",
      cause:
        "`createEnvelope` ไม่มีกลไก idempotency key หรือ dedup ตรวจสอบ request ที่เนื้อหาเหมือนกันมาจาก session เดียวกันในช่วงเวลาสั้นๆ ทำให้ double-click ที่ frontend ป้องกันไม่ทันกลายเป็นสอง envelope จริงที่ backend",
      resolution:
        "void envelope ที่ซ้ำใบที่สองด้วยมือ แจ้ง signer ให้เซ็นเฉพาะฉบับแรกที่ถูกต้อง แล้วปิดใบที่ซ้ำให้ชัดเจนในระบบ",
      followup:
        "เพิ่ม idempotency key ที่ frontend ต้องส่งมาด้วยทุกครั้งที่เรียก `createEnvelope` และให้ backend ปฏิเสธ request ที่มี idempotency key ซ้ำภายในหน้าต่างเวลาสั้นๆ",
    },
    {
      slug: "signature-capture-mobile-touch-mismatch",
      title: "ลายเซ็นที่วาดผ่านมือถือบันทึกผิดรูปเพราะ Touch Sample Rate ไม่ตรงกับที่ Client ส่ง",
      tags: ["signature-capture", "mobile"],
      summary:
        "ลูกค้าหลายรายแจ้งว่าลายเซ็นที่วาดผ่านแอปมือถือรุ่นเก่าบางรุ่นแสดงผลเบี้ยวหรือขาดหายเป็นบางช่วงเมื่อเปิดดูเอกสารที่เซ็นเสร็จแล้ว",
      investigation:
        "ตรวจ {{ref:module:signature-capture}} พบว่า `TOUCH_SAMPLE_RATE_HZ` ฝั่ง backend ตั้งไว้ที่ 60Hz แต่แอปมือถือรุ่นเก่าบางรุ่นส่งข้อมูลจุดสัมผัสมาที่ 30Hz เท่านั้น backend interpolate จุดที่หายไปแบบเส้นตรง ทำให้เส้นโค้งของลายเซ็นผิดรูปในบางจุด",
      cause:
        "spec ของ `TOUCH_SAMPLE_RATE_HZ` ถูกตั้งตามอุปกรณ์รุ่นใหม่ที่ทีมทดสอบใช้ตอนพัฒนา ไม่ได้ทดสอบกับอุปกรณ์รุ่นเก่าที่ยังมีลูกค้าใช้งานอยู่จริงจำนวนไม่น้อย การ interpolate เส้นตรงไม่เพียงพอสำหรับช่องว่างจากอัตราสุ่มที่ต่างกันเท่าตัว",
      resolution:
        "ปรับ backend ให้รับรู้ sample rate จริงที่ client ส่งมาด้วยทุกครั้ง (ไม่ fix ค่าคงที่) แล้วเลือกวิธี interpolate ที่เหมาะสมตาม sample rate นั้น แก้ลายเซ็นที่บันทึกผิดรูปด้วยการให้ signer เซ็นใหม่สำหรับเอกสารที่ยังไม่ completed",
      followup:
        "เพิ่มอุปกรณ์รุ่นเก่าเข้า test matrix ของ {{ref:convention:testing-convention}} อย่างเป็นทางการ ไม่ทดสอบเฉพาะอุปกรณ์รุ่นใหม่ที่ทีมพัฒนาใช้เองอีกต่อไป",
    },
    {
      slug: "audit-trail-logger-clock-skew-out-of-order-events",
      title: "Event ใน Audit Trail เรียงลำดับผิดเพราะ Clock Skew ระหว่าง Service",
      tags: ["audit-trail", "clock-skew"],
      summary:
        "ทีม support พบว่า audit trail ของ envelope บางฉบับแสดง event \"signer เซ็นเสร็จ\" มาก่อน event \"signer เปิดดูเอกสาร\" ซึ่งเรียงลำดับตามความเป็นจริงไม่ได้เลย",
      investigation:
        "ตรวจ {{ref:module:audit-trail-logger}} พบว่า `occurredAt` ของแต่ละ event ใช้ system clock ของ instance ที่ประมวลผล event นั้น ซึ่งบาง instance มี clock skew จากกันหลายร้อยมิลลิวินาทีถึงระดับวินาที",
      cause:
        "ระบบไม่ได้ใช้ NTP sync ที่เข้มงวดพอสำหรับทุก instance และไม่มีกลไก logical clock หรือ sequence number แยกต่างหากที่รับประกัน ordering ข้าม instance — พึ่ง wall-clock timestamp เพียงอย่างเดียวซึ่งไม่แม่นยำพอสำหรับ event ที่เกิดใกล้กันมาก",
      resolution:
        "เพิ่ม monotonic sequence number ต่อ envelope ให้ทุก event เก็บคู่กับ `occurredAt` แล้วใช้ sequence number เป็นหลักในการเรียงลำดับแสดงผล ไม่ใช่ wall-clock timestamp อีกต่อไป",
      followup:
        "บังคับ NTP sync ที่เข้มงวดขึ้นสำหรับทุก instance ของ {{ref:module:audit-trail-logger}} โดยเฉพาะ แม้ sequence number จะแก้ปัญหาการแสดงผลแล้ว แต่ timestamp ที่แม่นยำยังจำเป็นสำหรับการอ้างอิงทางกฎหมาย",
    },
    {
      slug: "bulk-send-job-partial-failure-silent",
      title: "Bulk Send ล้มเหลวบางส่วนเงียบๆ โดยไม่มีใครรู้ตัว",
      tags: ["bulk-send", "bug"],
      summary:
        "ฝ่าย HR ของลูกค้ารายหนึ่งส่งสัญญาจ้างแบบ bulk send ให้พนักงานใหม่ 80 คน แต่พบภายหลังว่ามีพนักงาน 6 คนไม่เคยได้รับอีเมลเลย ทั้งที่ระบบรายงานว่า \"ส่งสำเร็จ\"",
      investigation:
        "ตรวจ log bulk send job พบว่า envelope ของพนักงาน 6 คนนั้นสร้างไม่สำเร็จจริงเพราะอีเมลมีอักขระพิเศษที่ validation ไม่รองรับ แต่ job สรุปผลรวมแค่ \"จำนวนที่ประมวลผลเสร็จ\" โดยไม่แยกว่าสำเร็จหรือล้มเหลว",
      cause:
        "ตาม {{ref:policy:bulk-send-policy}} envelope ที่ล้มเหลวใน batch ไม่ควรทำให้ทั้ง batch ล้มเหลว ซึ่งฝั่ง logic ทำถูกต้อง แต่ UI สรุปผลไม่ได้แยกแสดงรายการที่ล้มเหลวให้ผู้ส่งเห็นชัดเจน แสดงแค่ตัวเลขรวมที่ทำให้เข้าใจผิดว่าทุกฉบับสำเร็จ",
      resolution:
        "แจ้งฝ่าย HR รายชื่อ 6 คนที่ตกหล่นทันที แล้วสร้าง envelope ใหม่ให้ด้วยมือหลังแก้ปัญหาการ validate อีเมลที่มีอักขระพิเศษ",
      followup:
        "แก้ UI สรุปผล bulk send ให้แสดงรายการที่ล้มเหลวแยกชัดเจนเสมอ ไม่แสดงแค่ตัวเลขรวม พร้อมเหตุผลที่ล้มเหลวต่อรายการ",
    },
    {
      slug: "notary-integration-webhook-replay-double-notarization",
      title: "Webhook จาก Notary Provider ถูกส่งซ้ำทำให้เอกสารถูกรับรองสองครั้ง",
      tags: ["notary", "webhook"],
      summary:
        "envelope ฉบับหนึ่งมี audit event แสดงว่าผ่านการรับรองจาก notary สองครั้งซ้อนกัน ทำให้ทีม support สับสนว่าต้องยึดผลรับรองครั้งไหนเป็นหลัก",
      investigation:
        "ตรวจ {{ref:module:notary-integration}} พบว่า `handleNotaryWebhook` ถูกเรียกสองครั้งด้วย payload เดียวกันทุกประการ เพราะ provider ฝั่งเขา retry การส่ง webhook เองหลังไม่ได้รับ acknowledgment กลับทันเวลาที่เขากำหนด (เขาไม่ได้ล่มจริง แค่ ack ช้ากว่าที่เขาคาด)",
      cause:
        "`handleNotaryWebhook` ไม่มีการเช็ค idempotency ของ `sessionId` ก่อนประมวลผล ทำให้ webhook ที่ซ้ำกันถูกประมวลผลซ้ำและสร้าง audit event ซ้ำสองรายการสำหรับเหตุการณ์เดียวกันจริงๆ",
      resolution:
        "แก้ audit event ให้ระบุชัดว่า event ที่สองเป็น duplicate ของ webhook เดิม ไม่ใช่การรับรองครั้งใหม่จริง โดยอ้างอิง event แรกเป็นหลักฐานยืนยัน",
      followup:
        "เพิ่ม idempotency check ที่ `handleNotaryWebhook` โดยใช้ `sessionId` ร่วมกับ webhook event id ที่ provider ส่งมา ปฏิเสธการประมวลผลซ้ำตั้งแต่ต้นแทนที่จะแก้ไขหลังเกิดเหตุ",
    },
    {
      slug: "delegate-signing-permission-escalation-bug",
      title: "Delegate Signing เปิดช่องให้ผู้รับมอบสิทธิ์เห็นเอกสารอื่นที่ไม่เกี่ยวข้อง",
      tags: ["delegate", "security"],
      summary:
        "ทีม security พบระหว่างการตรวจสอบว่า signer ที่ได้รับมอบสิทธิ์เซ็นแทนคนหนึ่ง สามารถเห็นรายการ envelope อื่นๆ ที่คนมอบสิทธิ์เดิมมีสิทธิ์เข้าถึง ทั้งที่ไม่ควรเกี่ยวข้องกันเลย",
      investigation:
        "ตรวจ session ของผู้รับมอบสิทธิ์พบว่าระบบสร้าง session token ที่ผูกกับ `signerId` เดิมของคนมอบสิทธิ์แทนที่จะสร้าง token ใหม่เฉพาะสำหรับ envelope ที่ถูก delegate เพียงฉบับเดียว",
      cause:
        "การ implement {{ref:policy:delegate-signing-policy}} เลือกวิธี \"ให้ผู้รับมอบสิทธิ์ login ในนามคนเดิมชั่วคราว\" แทนที่จะสร้าง scoped session ใหม่ที่จำกัดสิทธิ์เฉพาะ envelope นั้น ทำให้สิทธิ์ที่ควรจำกัดแคบกลับกว้างเกินจำเป็นไปทั้งบัญชี",
      resolution:
        "ปิด feature delegate signing ชั่วคราวทันทีที่พบปัญหา แล้วแก้ให้สร้าง scoped session token ที่ผูกกับ envelope เดียวเท่านั้นก่อนเปิดใช้งานอีกครั้ง",
      followup:
        "เพิ่มการตรวจสอบ scope ของ session token เป็นส่วนหนึ่งของ security review บังคับสำหรับทุก feature ที่เกี่ยวข้องกับการมอบสิทธิ์หรือ impersonation ในอนาคต",
    },
    {
      slug: "template-manager-version-mismatch-wrong-clause-sent",
      title: "ส่งสัญญาที่ใช้ Clause จาก Template เวอร์ชันเก่าที่ถูก Deprecate ไปแล้ว",
      tags: ["template", "versioning"],
      summary:
        "ทีมกฎหมายพบว่าสัญญาชุดหนึ่งที่ส่งออกไปมีข้อสัญญา (clause) เวอร์ชันเก่าที่ถูกแก้ไขและ publish เวอร์ชันใหม่ไปแล้วตั้งแต่ 2 สัปดาห์ก่อน",
      investigation:
        "ตรวจ {{ref:module:template-manager}} พบว่า envelope ที่มีปัญหาถูกสร้างจาก draft ที่ค้างอยู่ใน frontend cache ของผู้ใช้มาตั้งแต่ก่อนมีการ publish เวอร์ชันใหม่ แล้วผู้ใช้กด submit draft นั้นทีหลังโดยไม่รู้ตัวว่า template เปลี่ยนไปแล้ว",
      cause:
        "`createEnvelope` รับ `templateId` เฉยๆ โดยไม่ยึด version ที่ระบุมาด้วย ทำให้ดึง template เวอร์ชันล่าสุด ณ ตอนสร้าง envelope จริงเสมอ แต่ frontend cache ที่ผู้ใช้เห็นตอนกรอกฟอร์มเป็นเวอร์ชันเก่าที่ไม่ตรงกับที่จะถูกใช้จริงตอน submit",
      resolution:
        "void envelope ที่ใช้ clause ผิดเวอร์ชัน แล้วสร้างใหม่ด้วย template เวอร์ชันล่าสุดที่ถูกต้อง แจ้งทั้งสองฝ่ายให้เซ็นใหม่",
      followup:
        "แก้ `createEnvelope` ให้รับ `templateVersion` เป็น parameter บังคับเสมอ ไม่ใช่แค่ `templateId` และปฏิเสธการสร้าง envelope ถ้า version ที่ client ส่งมาไม่ตรงกับ version ล่าสุด บังคับให้ผู้ใช้ refresh ฟอร์มก่อนเสมอ",
    },
    {
      slug: "reminder-scheduler-timezone-bug-sent-midnight",
      title: "อีเมลเตือนถูกส่งตอนตีสามตาม Timezone ของผู้รับ",
      tags: ["reminder", "timezone"],
      summary:
        "signer หลายคนในต่างประเทศร้องเรียนว่าได้รับอีเมลเตือนให้เซ็นเอกสารตอนตีสามถึงตีสี่ตาม timezone ของตัวเอง ทั้งที่ระบบตั้งใจส่งช่วงเวลาทำการเท่านั้น",
      investigation:
        "ตรวจ `scheduleReminder` พบว่าเวลา `sendAt` คำนวณจาก \"9 โมงเช้าตาม timezone ของผู้สร้าง envelope\" เสมอ ไม่ได้ปรับตาม timezone ของ signer แต่ละคนที่อาจอยู่คนละ timezone กับผู้สร้าง",
      cause:
        "ตอนออกแบบฟีเจอร์ครั้งแรก assumption คือผู้สร้างกับ signer มัก timezone ใกล้เคียงกัน (ลูกค้าในประเทศเดียวกันเป็นส่วนใหญ่) แต่เมื่อฐานลูกค้าขยายไปหลายประเทศ assumption นี้ผิดชัดเจนสำหรับสัญญาระหว่างประเทศ",
      resolution:
        "ปรับ `scheduleReminder` ให้คำนวณเวลาส่งตาม timezone ของ signer แต่ละคนแยกกัน (ดึงจาก locale ที่ signer เคยระบุตอนเข้าระบบครั้งแรก) แทนการยึด timezone ของผู้สร้างเพียงอย่างเดียว",
      followup:
        "เพิ่ม fallback timezone สำหรับ signer ที่ไม่เคยระบุ locale มาก่อน (ใช้ timezone จาก IP ตอนเปิดลิงก์ครั้งแรกแทน) และเพิ่ม test case ข้าม timezone ให้ {{ref:convention:testing-convention}}",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SIGN-211-delegate-scoped-session`, `fix/SIGN-227-reminder-timezone`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(audit-trail-logger): เพิ่ม sequence number กัน clock skew`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่ตรวจสิทธิ์หรือลำดับการเซ็นต้อง validate ที่ backend เสมอ ห้ามเชื่อผลจาก client (บทเรียนจาก {{ref:incident:sequential-signing-order-bypass}}) และฟังก์ชันที่รับ webhook จากภายนอกต้องมี idempotency check เสมอ (บทเรียนจาก {{ref:incident:notary-integration-webhook-replay-double-notarization}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `recordSignature`, `validateSignerTurn` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Timestamp", body: "timestamp ทุกตัวในระบบต้องเก็บเป็น UTC เท่านั้น ห้ามเก็บ local timezone แล้วแปลงทีหลัง — บทเรียนตรงจาก {{ref:incident:expired-link-still-allowed-signing}}" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ envelope ต้องมี `envelopeId` เสมอ เพื่อไล่ log ข้าม service ได้ (envelope-builder → signature-capture → audit-trail-logger) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "ความล้มเหลวของ `verifyChainIntegrity` log เป็น `error` เสมอไม่ว่าสาเหตุจะเป็นอะไร เพราะกระทบความน่าเชื่อถือทางกฎหมายโดยตรง ทีม on-call ต้อง grep เจอทันที" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`SIGN_<DOMAIN>_<REASON>` เช่น `SIGN_ENVELOPE_EXPIRED`, `SIGN_SIGNER_OUT_OF_ORDER` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`SIGN_NOTARY_SESSION_FAILED`, `SIGN_TEMPLATE_FIELD_MISSING`, `SIGN_AUDIT_CHAIN_BROKEN` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "ทดสอบข้ามอุปกรณ์และ timezone", body: "logic ที่เกี่ยวกับ signature-capture ต้องทดสอบกับอุปกรณ์รุ่นเก่าที่ยังมีลูกค้าใช้งานจริงเสมอ ไม่ใช่แค่อุปกรณ์รุ่นใหม่ (บทเรียนจาก {{ref:incident:signature-capture-mobile-touch-mismatch}}) และ logic ที่เกี่ยวกับเวลาต้องมี test case ข้าม timezone เสมอ (บทเรียนจาก {{ref:incident:reminder-scheduler-timezone-bug-sent-midnight}})" },
        { heading: "Idempotency test", body: "ฟังก์ชันที่รับ webhook หรือถูกเรียกซ้ำได้จากภายนอกต้องมี test จำลอง request ซ้ำเสมออย่างน้อย 2 ครั้งติดกัน" },
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
      slug: "audit-event-naming-convention",
      title: "Audit Event Naming Convention",
      tags: ["audit-trail", "naming"],
      intro: "event ทุกตัวที่ {{ref:module:audit-trail-logger}} บันทึกต้องตั้งชื่อตามกติกานี้ เพื่อให้ทีมกฎหมายและทีม support อ่าน audit trail ดิบได้โดยไม่ต้องเปิดเอกสารแยก",
      sections: [
        { heading: "รูปแบบชื่อ event", body: "`snake_case` เสมอ ขึ้นต้นด้วย noun ตามด้วย verb ในรูปอดีต เช่น `envelope_sent`, `signer_completed`, `chain_gap_documented` — ห้ามใช้ชื่อกำกวมเช่น `updated` เฉยๆ โดยไม่ระบุว่าอะไรถูกอัปเดต" },
        { heading: "Metadata ที่ต้องมี", body: "ทุก event ต้องมี `actorId` เสมอแม้จะเป็น event ที่ระบบสร้างเอง (ใช้ `system` เป็นค่า actorId ในกรณีนั้น) เพื่อไม่ให้มี event ไหนที่ตอบไม่ได้ว่า \"ใครเป็นคนทำ\"" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (สำหรับ service ที่แตะ audit trail หรือลำดับการเซ็น) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:audit-trail-logger}} และ {{ref:module:signature-capture}} ต้องผ่าน integration test ครอบคลุมทุก edge case ของลำดับการเซ็นก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความถูกต้องทางกฎหมายโดยตรง" },
      ],
    },
    {
      slug: "notary-webhook-timeout-tuning",
      title: "Notary Webhook Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure ของการเชื่อมต่อ notary provider เท่านั้น ไม่ใช่ business timeout ของการรอผู้เซ็น — ดูเรื่องนั้นที่ {{ref:policy:reminder-frequency-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| Notary session request timeout | 10s | env `NOTARY_SESSION_TIMEOUT_MS` (600000ms รวม session ทั้งหมด) |\n| Webhook processing timeout | 5s | `notary-integration` service config |\n| API gateway → envelope-builder | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| Database connection pool acquire | 5s | `pg-pool` config |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "พบว่า provider บางรายส่ง webhook ซ้ำเมื่อไม่ได้รับ acknowledgment ทันเวลาที่เขากำหนด (5 วินาที) ทั้งที่ฝั่งเราประมวลผลสำเร็จแล้วแค่ตอบช้า ดู {{ref:incident:notary-integration-webhook-replay-double-notarization}} — แก้โดยตอบ ack ทันทีที่รับ payload ก่อนแล้วค่อยประมวลผล async" },
      ],
    },
    {
      slug: "template-schema-migration-runbook",
      title: "Template Schema Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อต้องเปลี่ยนโครงสร้าง merge field หรือรูปแบบเนื้อหาของ {{ref:module:template-manager}} ต้อง migrate ตามขั้นตอนนี้เสมอ ห้ามแก้ template ที่ publish แล้วตรงๆ" },
        { heading: "ขั้นตอน", body: "1) สร้าง template version ใหม่ผ่าน `publishTemplateVersion` เสมอ ไม่แก้ version เดิม 2) ตรวจสอบว่า envelope ที่กำลังสร้างอยู่ (draft ที่ยังไม่ finalize) ใช้ version ไหน แจ้งผู้ใช้ให้ refresh ถ้า version เปลี่ยน (ดู {{ref:incident:template-manager-version-mismatch-wrong-clause-sent}}) 3) เก็บ version เก่าไว้อ่านอย่างเดียวสำหรับ envelope ที่ completed แล้วเสมอ ไม่ลบทิ้ง" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = กระทบความถูกต้องของ audit trail หรือลำดับการเซ็น, Sev2 = กระทบบาง feature เช่น reminder/notary, Sev3 = กระทบเล็กน้อยไม่ถึงความถูกต้องทางกฎหมายของเอกสาร" },
        { heading: "กรณีที่กระทบ Audit Trail", body: "ทุกเหตุการณ์ที่ {{ref:module:audit-trail-logger}} มีปัญหา ไม่ว่าจะเป็น chain ขาดหรือ event เรียงผิดลำดับ ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง เพราะกระทบความน่าเชื่อถือทางกฎหมายของทุกเอกสารในระบบ ไม่ใช่แค่ envelope เดียว" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "`verifyChainIntegrity` ล้มเหลวสำหรับ envelope ใดๆ, envelope ค้างสถานะ `pending_notarization` เกิน 24 ชั่วโมง, อัตราการส่ง reminder ล้มเหลวเกิน 5% ของ job รอบนั้น" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนกลางดึกสำหรับปัญหาที่รอถึงเช้าได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ `validateSignerTurn` หรือ `verifyChainIntegrity` ทำงานผิดพลาดแม้เพียงกรณีเดียว ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:sequential-signing-order-bypass}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมกฎหมายของลูกค้าที่ได้รับผลกระทบทุกครั้งแม้ rollback สำเร็จแล้วก็ตาม เพราะความน่าเชื่อถือของระบบกระทบต่อลูกค้าโดยตรง" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของแต่ละ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| envelope-builder | 2 | 8 | CPU > 70% |\n| signature-capture | 2 | 10 | CPU > 60% (latency-sensitive เพราะผู้ใช้รอ interactive) |\n| audit-trail-logger | 2 | 6 | write queue depth > 200 (เน้นความถูกต้องมากกว่าความเร็ว จึงไม่ scale ไวเท่า signature-capture) |" },
        { heading: "ข้อจำกัดของ Bulk Send", body: "bulk send ขนาดใหญ่ (หลักพัน envelope) อาจทำให้ queue ของ {{ref:module:reminder-scheduler}} พุ่งสูงชั่วคราว — scale service นี้ล่วงหน้าก่อนรู้ว่าจะมี bulk send ขนาดใหญ่เข้ามาดีกว่ารอ autoscaling ตอบสนอง ดู {{ref:deployment:incident-response-runbook}} สำหรับกรณีที่ scale ไม่ทัน" },
      ],
    },
    {
      slug: "bulk-send-capacity-planning-runbook",
      title: "Bulk Send Capacity Planning Runbook",
      tags: ["capacity", "runbook"],
      intro: "ขั้นตอนเตรียมความพร้อมของระบบก่อนลูกค้าองค์กรส่ง envelope แบบ bulk send ขนาดใหญ่ (เกิน 500 ฉบับในครั้งเดียว)",
      sections: [
        { heading: "ก่อนรับ Bulk Send ขนาดใหญ่", body: "ทีม customer success ต้องแจ้งทีม infrastructure ล่วงหน้าอย่างน้อย 24 ชั่วโมง เพื่อ scale {{ref:module:envelope-builder}} และ {{ref:module:reminder-scheduler}} ล่วงหน้าตาม {{ref:deployment:scaling-policy}} แทนรอ autoscaling ตอบสนองเอง" },
        { heading: "ระหว่างส่ง", body: "ตรวจสอบผลลัพธ์ของแต่ละ envelope แยกรายตัวเสมอตาม {{ref:policy:bulk-send-policy}} ไม่ดูแค่ตัวเลขรวม (บทเรียนจาก {{ref:incident:bulk-send-job-partial-failure-silent}}) และแจ้งลูกค้าทันทีถ้าพบ envelope ที่ล้มเหลวแม้จะเป็นส่วนน้อยของ batch ก็ตาม" },
      ],
    },
  ],
};
