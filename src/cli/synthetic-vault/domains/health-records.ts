import type { DomainProfile } from "../types.js";

// VitalChart — ระบบจัดการเวชระเบียนผู้ป่วย (health record management)
// เป็นระบบสมมติล้วนๆ ไม่มีข้อมูลผู้ป่วยจริงหรือ PII จริงใดๆ — distractor domain
// ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const healthRecords: DomainProfile = {
  id: "health-records",
  displayName: "VitalChart — ระบบจัดการเวชระเบียนผู้ป่วย",
  summary: [
    "VitalChart คือแพลตฟอร์มจัดการเวชระเบียนอิเล็กทรอนิกส์สำหรับคลินิกและโรงพยาบาลขนาดกลาง ครอบคลุมตั้งแต่บันทึกประวัติผู้ป่วย การนัดหมาย การสั่งยา ไปจนถึงผลตรวจแล็บ ระบบต้องออกแบบให้สอดคล้องกับข้อกำหนดด้าน compliance เรื่องข้อมูลสุขภาพที่เข้มงวดกว่าระบบทั่วไปมาก",
    "ทีมวิศวกรรมแยก service ตามขอบเขตความรับผิดชอบชัดเจน โดยเฉพาะเรื่องสิทธิ์การเข้าถึงข้อมูล (access control) ที่ต้องผูกกับความสัมพันธ์การรักษาจริงระหว่างแพทย์กับผู้ป่วย ไม่ใช่แค่ role ทั่วไปแบบระบบอื่น และทุก action ที่แตะข้อมูลผู้ป่วยต้องถูกบันทึกลง audit log แบบที่แก้ไขย้อนหลังไม่ได้",
  ],
  domainTags: ["health-records", "vitalchart"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:patient-record-store}} เป็นเจ้าของข้อมูลประวัติผู้ป่วยหลักทั้งหมด ส่วน {{ref:module:prescription-manager}} เก็บแค่ประวัติการสั่งยา ไม่เก็บข้อมูลการวินิจฉัยหรือผลแล็บเลย",
    "{{ref:module:audit-log-service}} เป็น service เดียวที่ทุก service อื่นต้องเรียกทุกครั้งที่มีการเข้าถึงหรือแก้ไขข้อมูลผู้ป่วย ไม่มี service ไหนเขียน audit log ของตัวเองแยกต่างหาก เพื่อให้มีแหล่งความจริงเดียวสำหรับการตรวจสอบ compliance",
  ],
  apiGatewayNote: [
    "คำขอจากแอปของแพทย์/พยาบาลเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบข้อมูลผู้เรียกไปกับทุก request ก่อนส่งต่อให้ {{ref:module:provider-access-control}} ตัดสินใจว่าอนุญาตหรือไม่",
    "คำขอฉุกเฉิน (break-glass access) ใช้ endpoint แยกต่างหากที่ผ่าน gateway เดียวกันแต่มี logic ยืนยันตัวตนเพิ่มเติมและบังคับเขียน audit log ทันทีก่อนคืนผลลัพธ์ ดู {{ref:policy:emergency-access-break-glass-policy}}",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:patient-record-store}} ดูแล ได้แก่ `patient_records` (ข้อมูลปัจจุบัน), `patient_record_versions` (ประวัติการแก้ไขทุกเวอร์ชัน ไม่ลบทิ้ง), และ `care_relationships`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `patient_records` | patient-record-store | ข้อมูลปัจจุบันเท่านั้น |\n| `patient_record_versions` | patient-record-store | เก็บทุกเวอร์ชันที่เคยแก้ไข append-only |\n| `prescriptions` | prescription-manager | ไม่มี FK ไป patient_records ตรงๆ ใช้ patientId แบบ soft reference |\n| `audit_events` | audit-log-service | append-only ห้าม update/delete แม้แต่ admin สูงสุด |",
    "ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวันแทน (เช่น เช็คว่าทุก prescription มี patientId ที่มีอยู่จริงใน patient_records)",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `record.accessed`, `record.amended`, `prescription.issued`, `lab_result.ingested`, `provider.access_revoked` — {{ref:module:audit-log-service}} subscribe ทุก event เหล่านี้เพื่อบันทึกลง audit trail",
    "{{ref:module:provider-access-control}} subscribe `provider.access_revoked` เพื่อล้าง cache สิทธิ์การเข้าถึงทันที ไม่รอให้ cache หมดอายุตามปกติ เพราะการปล่อยให้ provider ที่ถูกเพิกถอนสิทธิ์ยังเข้าถึงข้อมูลได้แม้แค่ไม่กี่นาทีถือเป็นความเสี่ยงที่ยอมรับไม่ได้",
  ],
  modules: [
    {
      slug: "patient-record-store",
      name: "patient-record-store",
      tags: ["records", "module", "core"],
      description:
        "เจ้าของข้อมูลประวัติผู้ป่วยหลักทั้งหมด (ข้อมูลส่วนตัว, ประวัติการวินิจฉัย, บันทึกการตรวจ) เก็บทุกเวอร์ชันที่เคยแก้ไขไว้แบบ immutable เพื่อให้ตรวจสอบย้อนหลังได้เสมอว่าใครแก้อะไรตอนไหน แยกออกมาเป็น service อิสระตั้งแต่เริ่มโปรเจกต์เพราะเป็นข้อมูลที่ sensitive ที่สุดในระบบ",
      functions: [
        { sig: "getRecord(patientId: string, requesterId: string): Promise<PatientRecord>", desc: "ดึงข้อมูลปัจจุบัน ต้องผ่านการตรวจสิทธิ์ก่อนเสมอ" },
        { sig: "amendRecord(patientId: string, changes: RecordChanges, amendedBy: string): Promise<string>", desc: "แก้ไขข้อมูล สร้างเวอร์ชันใหม่โดยไม่ลบเวอร์ชันเดิม คืน versionId" },
        { sig: "getRecordHistory(patientId: string): Promise<RecordVersion[]>", desc: "คืนประวัติการแก้ไขทั้งหมดของผู้ป่วยรายนั้น" },
      ],
      stateFlow: "active → amended (สร้างเวอร์ชันใหม่) — เวอร์ชันเก่าไม่ถูกลบทิ้งเลย ดู {{ref:policy:patient-record-amendment-policy}}",
      relatedNotes:
        "ทุกครั้งที่ `getRecord` ถูกเรียก จะ publish event `record.accessed` ให้ {{ref:module:audit-log-service}} บันทึกเสมอ ไม่มีทางเรียกดูข้อมูลโดยไม่ถูกบันทึกได้เลยแม้แต่ admin ระดับสูงสุด",
      internals: {
        constants: [
          { name: "RECORD_VERSION_RETENTION_YEARS", value: "10" },
          { name: "MAX_CONCURRENT_AMENDMENT_RETRY", value: "3" },
        ],
        typeSnippet:
          "interface PatientRecord {\n  patientId: string;\n  currentVersionId: string;\n  demographics: Demographics;\n  lastAmendedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:patient-record-amendment-policy}}",
      },
    },
    {
      slug: "appointment-scheduler",
      name: "appointment-scheduler",
      tags: ["scheduling", "module"],
      description:
        "จัดการการนัดหมายระหว่างผู้ป่วยกับแพทย์ ตรวจสอบความว่างของตารางเวลาแพทย์แต่ละคนและป้องกันการจองซ้ำ ทำงานแยกจาก patient-record-store โดยสิ้นเชิงเพราะการนัดหมายไม่จำเป็นต้องรู้รายละเอียดทางการแพทย์ของผู้ป่วยเลย",
      functions: [
        { sig: "bookAppointment(patientId: string, providerId: string, slot: TimeSlot): Promise<string>", desc: "จองนัดหมาย คืน appointmentId ถ้าสำเร็จ" },
        { sig: "cancelAppointment(appointmentId: string, reason: string): Promise<void>", desc: "ยกเลิกนัดหมาย ปล่อย slot กลับคืน" },
        { sig: "getProviderAvailability(providerId: string, dateRange: DateRange): Promise<TimeSlot[]>", desc: "คืนช่วงเวลาว่างของแพทย์" },
      ],
      relatedNotes:
        "ไม่คุยกับ {{ref:module:patient-record-store}} โดยตรง — เก็บแค่ patientId เป็น reference เท่านั้น ถ้าแพทย์ต้องการดูประวัติผู้ป่วยก่อนนัด ต้องเรียกผ่าน {{ref:module:provider-access-control}} แยกต่างหาก",
    },
    {
      slug: "prescription-manager",
      name: "prescription-manager",
      tags: ["prescription", "module", "core"],
      description:
        "จัดการการสั่งยาและติดตามการเบิกซ้ำ (refill) ตรวจสอบข้อจำกัดปริมาณและความถี่ตามที่กฎหมายกำหนดสำหรับยาแต่ละประเภท แยกออกมาจาก patient-record-store เพราะกฎการสั่งยามีความซับซ้อนเฉพาะทางที่เปลี่ยนแปลงบ่อยตามกฎหมายท้องถิ่น",
      functions: [
        { sig: "issuePrescription(patientId: string, drugCode: string, providerId: string): Promise<string>", desc: "ออกใบสั่งยาใหม่ คืน prescriptionId" },
        { sig: "requestRefill(prescriptionId: string): Promise<RefillResult>", desc: "ขอเบิกยาซ้ำ ตรวจสอบข้อจำกัดก่อนอนุมัติ" },
        { sig: "checkInteraction(patientId: string, newDrugCode: string): Promise<InteractionWarning[]>", desc: "ตรวจสอบปฏิกิริยาระหว่างยากับยาที่ผู้ป่วยใช้อยู่" },
      ],
      stateFlow: "issued → active → refill_requested → refill_approved | refill_denied — ดู {{ref:policy:prescription-refill-limit-policy}}",
      relatedNotes:
        "ทุกครั้งที่ออกใบสั่งยา publish event `prescription.issued` ให้ {{ref:module:audit-log-service}} บันทึก ไม่เก็บ audit trail ของตัวเองแยกต่างหาก",
      internals: {
        constants: [
          { name: "MAX_REFILL_COUNT_PER_PRESCRIPTION", value: "5" },
          { name: "REFILL_MIN_INTERVAL_DAYS", value: "21" },
        ],
        typeSnippet:
          "interface RefillResult {\n  prescriptionId: string;\n  status: \"approved\" | \"denied\";\n  denialReason?: \"limit_exceeded\" | \"too_soon\" | \"prescription_expired\";\n  remainingRefills: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องข้อจำกัดการเบิกซ้ำที่ {{ref:policy:prescription-refill-limit-policy}}",
      },
    },
    {
      slug: "lab-result-ingest",
      name: "lab-result-ingest",
      tags: ["lab", "module", "core"],
      description:
        "รับผลตรวจแล็บจากห้องปฏิบัติการภายนอกหลายแห่งที่มีรูปแบบข้อมูลต่างกัน แปลงให้เป็นรูปแบบมาตรฐานเดียวก่อนบันทึกเข้าระบบ ต้องจับคู่ผลตรวจกับผู้ป่วยที่ถูกต้องอย่างแม่นยำเพราะความผิดพลาดตรงนี้ส่งผลกระทบร้ายแรงต่อการรักษาได้",
      functions: [
        { sig: "ingestLabResult(rawPayload: unknown, sourceLabId: string): Promise<IngestResult>", desc: "รับ payload ดิบจากแล็บภายนอก แปลงและ validate ก่อนบันทึก" },
        { sig: "matchPatient(labPayload: LabPayload): Promise<string | null>", desc: "จับคู่ผลตรวจกับ patientId ที่ถูกต้อง คืน null ถ้าจับคู่ไม่ได้แน่ชัด" },
        { sig: "flagCriticalValue(resultId: string, value: number, referenceRange: Range): Promise<void>", desc: "ตรวจว่าค่าที่ได้อยู่ในระดับวิกฤตต้องแจ้งเตือนด่วนไหม" },
      ],
      relatedNotes:
        "ถ้า `matchPatient` จับคู่ไม่ได้แน่ชัด (คืน null) ระบบจะไม่เดาหรือบันทึกเข้าระบบโดยอัตโนมัติเด็ดขาด จะส่งเข้าคิวตรวจสอบด้วยมือแทนเสมอ ดู {{ref:policy:lab-result-duplicate-suppression-policy}}",
      internals: {
        constants: [
          { name: "PATIENT_MATCH_CONFIDENCE_THRESHOLD", value: "0.98" },
          { name: "CRITICAL_VALUE_ALERT_TIMEOUT_MIN", value: "15" },
        ],
        typeSnippet:
          "interface IngestResult {\n  resultId: string;\n  status: \"matched\" | \"pending_manual_match\" | \"rejected_format\";\n  matchConfidence?: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการแจ้งเตือนค่าวิกฤตที่ {{ref:policy:lab-result-critical-value-alert-policy}}",
      },
    },
    {
      slug: "provider-access-control",
      name: "provider-access-control",
      tags: ["access-control", "module"],
      description:
        "ตัดสินใจว่าแพทย์/พยาบาลคนไหนเข้าถึงข้อมูลผู้ป่วยรายไหนได้บ้าง ผูกกับความสัมพันธ์การรักษาจริง (care relationship) ไม่ใช่แค่ role ทั่วไป เป็น service เดียวที่ทุก service อื่นต้อง query ก่อนคืนข้อมูลผู้ป่วยเสมอ",
      functions: [
        { sig: "checkAccess(providerId: string, patientId: string): Promise<AccessDecision>", desc: "ตรวจสิทธิ์การเข้าถึงแบบ real-time ทุกครั้งที่มีการขอดูข้อมูล" },
        { sig: "grantCareRelationship(providerId: string, patientId: string, reason: string): Promise<void>", desc: "สร้างความสัมพันธ์การรักษาใหม่เมื่อแพทย์เริ่มดูแลผู้ป่วยรายนั้น" },
        { sig: "revokeAccess(providerId: string, patientId: string): Promise<void>", desc: "เพิกถอนสิทธิ์ทันทีเมื่อความสัมพันธ์การรักษาสิ้นสุด" },
      ],
      relatedNotes:
        "{{ref:module:patient-record-store}} เรียก `checkAccess` ก่อน `getRecord` ทุกครั้งไม่มีข้อยกเว้น ยกเว้นกรณี break-glass ที่ผ่านเงื่อนไขพิเศษของ {{ref:policy:emergency-access-break-glass-policy}}",
    },
    {
      slug: "audit-log-service",
      name: "audit-log-service",
      tags: ["audit", "compliance", "module"],
      description:
        "บันทึกทุก action ที่เกี่ยวกับข้อมูลผู้ป่วยแบบ append-only แก้ไขหรือลบย้อนหลังไม่ได้แม้แต่โดย admin สูงสุด เป็นแหล่งข้อมูลหลักสำหรับการตรวจสอบ compliance และการสืบสวนกรณีสงสัยการเข้าถึงที่ไม่เหมาะสม",
      functions: [
        { sig: "recordAccess(providerId: string, patientId: string, action: string): Promise<void>", desc: "บันทึกการเข้าถึงหรือแก้ไขข้อมูล 1 ครั้ง" },
        { sig: "queryAuditTrail(patientId: string, dateRange: DateRange): Promise<AuditEvent[]>", desc: "ดึงประวัติการเข้าถึงข้อมูลผู้ป่วยรายหนึ่งสำหรับการตรวจสอบ" },
        { sig: "detectAnomalousAccess(providerId: string): Promise<AnomalyReport[]>", desc: "วิเคราะห์ pattern การเข้าถึงที่ผิดปกติของแพทย์คนหนึ่ง" },
      ],
      relatedNotes:
        "ไม่มี service ไหนเขียนตรงเข้าตาราง `audit_events` ได้นอกจาก audit-log-service เอง — service อื่นส่งผ่าน event เท่านั้น (ดู {{ref:arch:queue}}) เพื่อรักษาความสมบูรณ์ของ audit trail ไม่ให้ถูกแก้ไขจากทางลัด",
    },
  ],
  envVarGroups: [
    {
      service: "patient-record-store-service",
      vars: [
        { name: "RECORD_VERSION_RETENTION_YEARS", example: "10", note: "ดู {{ref:policy:audit-log-retention-policy}}" },
        { name: "RECORD_DB_URL", example: "postgres://record-db.internal:5432/records", note: "secret ห้าม log" },
      ],
    },
    {
      service: "prescription-manager-service",
      vars: [
        { name: "MAX_REFILL_COUNT_PER_PRESCRIPTION", example: "5", note: "" },
        { name: "REFILL_MIN_INTERVAL_DAYS", example: "21", note: "ดู {{ref:policy:prescription-refill-limit-policy}}" },
      ],
    },
    {
      service: "lab-result-ingest-service",
      vars: [
        { name: "PATIENT_MATCH_CONFIDENCE_THRESHOLD", example: "0.98", note: "ต่ำกว่านี้ต้องตรวจด้วยมือเสมอ" },
        { name: "CRITICAL_VALUE_ALERT_TIMEOUT_MIN", example: "15", note: "ดู {{ref:policy:lab-result-critical-value-alert-policy}}" },
      ],
    },
    {
      service: "provider-access-control-service",
      vars: [
        { name: "ACCESS_CACHE_TTL_SECONDS", example: "60", note: "" },
        { name: "BREAK_GLASS_ALERT_WEBHOOK", example: "https://alerts.internal/break-glass", note: "secret ห้าม log" },
      ],
    },
  ],
  policies: [
    {
      slug: "record-access-authorization-policy",
      title: "นโยบายการอนุญาตเข้าถึงเวชระเบียน",
      tags: ["access-control", "policy"],
      isPrimary: true,
      intro: [
        "แพทย์หรือพยาบาลจะเข้าถึงข้อมูลผู้ป่วยรายใดได้ก็ต่อเมื่อมี care relationship ที่ยัง active อยู่กับผู้ป่วยรายนั้นเท่านั้น ไม่มีการเข้าถึงแบบ role-based กว้างๆ ที่เปิดให้ดูข้อมูลผู้ป่วยทุกคนในระบบ",
        "ทุกการขอเข้าถึงต้องผ่าน {{ref:module:provider-access-control}} แบบ real-time ไม่มีการ cache สิทธิ์ไว้ล่วงหน้าเกิน `ACCESS_CACHE_TTL_SECONDS` วินาที เพื่อให้การเพิกถอนสิทธิ์มีผลเร็วที่สุด",
      ],
      sections: [
        {
          heading: "ทำไมไม่ใช้ role-based access ธรรมดา",
          body: "ระบบเวชระเบียนต่างจากระบบทั่วไปตรงที่การ \"มีสิทธิ์เป็นแพทย์\" ไม่ควรแปลว่า \"เห็นข้อมูลผู้ป่วยทุกคนได้\" — ต้องผูกกับความสัมพันธ์การรักษาจริงเสมอ เพื่อลดพื้นที่เสี่ยงถ้า account ของแพทย์คนใดคนหนึ่งถูกโจมตี",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อแพทย์ Consult ข้ามแผนก",
        tags: ["access-control", "edge-case"],
        body: [
          "เมื่อแพทย์เจ้าของไข้ขอ consult จากแพทย์แผนกอื่น ระบบจะสร้าง care relationship ชั่วคราวให้แพทย์ที่ถูก consult อัตโนมัติ มีอายุ 72 ชั่วโมงแล้วหมดอายุเองโดยไม่ต้องมีใครเพิกถอนด้วยมือ",
          "การ consult ข้ามแผนกทุกครั้งต้องระบุเหตุผลก่อนสร้างความสัมพันธ์ชั่วคราวได้ ไม่มีการอนุมัติแบบไม่มีเหตุผลประกอบเด็ดขาด และเหตุผลนี้จะถูกบันทึกลง audit log ควบคู่กับสิทธิ์ที่มอบให้",
        ],
      },
    },
    {
      slug: "prescription-refill-limit-policy",
      title: "นโยบายข้อจำกัดการเบิกยาซ้ำ",
      tags: ["prescription", "policy"],
      isPrimary: true,
      intro: [
        "ใบสั่งยาแต่ละใบเบิกซ้ำได้สูงสุด `MAX_REFILL_COUNT_PER_PRESCRIPTION` ครั้ง และแต่ละครั้งต้องห่างจากครั้งก่อนหน้าอย่างน้อย `REFILL_MIN_INTERVAL_DAYS` วัน เพื่อป้องกันการใช้ยาเกินขนาดที่แพทย์สั่ง",
        "เมื่อเบิกครบจำนวนครั้งสูงสุดแล้ว ระบบจะปฏิเสธการเบิกซ้ำโดยอัตโนมัติแม้จะยังไม่ถึงวันหมดอายุใบสั่งยาก็ตาม ต้องให้แพทย์ออกใบสั่งยาใหม่เท่านั้น",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับยาควบคุมพิเศษ",
        tags: ["prescription", "edge-case"],
        body: [
          "ยาที่จัดอยู่ในกลุ่มควบคุมพิเศษ (controlled substance) ไม่เข้าเงื่อนไข refill อัตโนมัติเลยไม่ว่าจะเหลือจำนวนครั้งเท่าไหร่ — ทุกครั้งที่เบิกต้องมีแพทย์ยืนยันด้วยมือใหม่เสมอ เพราะความเสี่ยงการนำไปใช้ผิดวัตถุประสงค์สูงกว่ายาทั่วไปมาก",
          "ผู้ป่วยที่ย้ายมาจากระบบอื่นพร้อมใบสั่งยาเดิมที่ยังไม่หมดอายุ จะถูกนับจำนวนครั้งที่เบิกไปแล้วจากระบบเดิมด้วย ไม่เริ่มนับใหม่จากศูนย์ เพื่อไม่ให้ข้อจำกัดถูกหลบเลี่ยงด้วยการย้ายระบบ",
        ],
      },
    },
    {
      slug: "lab-result-critical-value-alert-policy",
      title: "นโยบายการแจ้งเตือนผลตรวจแล็บระดับวิกฤต",
      tags: ["lab", "policy"],
      isPrimary: true,
      intro: [
        "ผลตรวจที่อยู่นอกช่วงอ้างอิงระดับวิกฤต (critical range) ต้องแจ้งเตือนแพทย์เจ้าของไข้ภายใน `CRITICAL_VALUE_ALERT_TIMEOUT_MIN` นาทีนับจากที่ระบบรับผลตรวจเข้ามา ไม่ใช่รอให้แพทย์เข้าระบบมาดูเอง",
        "ถ้าแพทย์เจ้าของไข้ไม่ตอบรับการแจ้งเตือนภายในเวลาที่กำหนด ระบบจะยกระดับแจ้งไปยังแพทย์สำรองหรือหัวหน้าแผนกทันที ไม่ปล่อยให้ค่าวิกฤตค้างไม่มีใครรับทราบ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อจับคู่ผู้ป่วยไม่แน่ชัด",
        tags: ["lab", "edge-case"],
        body: [
          "ถ้าผลตรวจที่มีค่าวิกฤตยังจับคู่กับผู้ป่วยไม่แน่ชัด (`matchPatient` คืน null) ระบบจะแจ้งเตือนทีมตรวจสอบด้วยมือทันทีในระดับความสำคัญสูงสุด แทนที่จะรอกระบวนการจับคู่ตามปกติ เพราะความล่าช้าของค่าวิกฤตอันตรายกว่าความล่าช้าของผลตรวจทั่วไปมาก",
          "ห้องแล็บที่ส่งผลตรวจผ่านรูปแบบที่ระบบยังไม่รองรับเต็มรูปแบบ (`rejected_format`) จะไม่ถูกยกเว้นจากกฎนี้ — ทีม on-call ต้อง escalate ให้แก้ format ด่วนที่สุดถ้าพบว่าเป็นผลตรวจค่าวิกฤต",
        ],
      },
    },
    {
      slug: "appointment-no-show-policy",
      title: "นโยบายการไม่มาตามนัด (No-show)",
      tags: ["scheduling", "policy"],
      isPrimary: true,
      intro: [
        "ผู้ป่วยที่ไม่มาตามนัดโดยไม่แจ้งล่วงหน้าเกิน 3 ครั้งในรอบ 6 เดือน จะถูกระบบแจ้งเตือนพิเศษให้เจ้าหน้าที่ติดต่อยืนยันก่อนรับนัดครั้งถัดไป",
        "การยกเลิกนัดล่วงหน้าน้อยกว่า 2 ชั่วโมงก่อนเวลานัดถือเป็น no-show เช่นกัน ไม่ใช่แค่การไม่มาแบบไม่แจ้งเลย เพราะ slot ที่ว่างกะทันหันมักหาผู้ป่วยรายอื่นมาแทนไม่ทัน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นกรณีเหตุสุดวิสัยทางการแพทย์",
        tags: ["scheduling", "edge-case"],
        body: [
          "ถ้าผู้ป่วยไม่มาตามนัดเพราะเข้ารักษาฉุกเฉินที่สถานพยาบาลอื่นในช่วงเวลาเดียวกัน (ยืนยันได้ภายหลัง) การนับ no-show ครั้งนั้นจะถูกลบออกจากประวัติเมื่อมีการยืนยันเอกสารเข้ามา ไม่ต้องให้ผู้ป่วยรับภาระจากเหตุสุดวิสัย",
          "ผู้ป่วยเด็กหรือผู้สูงอายุที่มีผู้ดูแลนัดหมายแทน จะไม่ถูกนับ no-show เข้าประวัติส่วนตัวของผู้ป่วยโดยตรง แต่นับเข้าประวัติของผู้ดูแลแทน เพื่อไม่ให้กระทบสิทธิ์การรักษาของผู้ป่วยที่ไม่ได้เป็นคนตัดสินใจเอง",
        ],
      },
    },
    {
      slug: "audit-log-retention-policy",
      title: "นโยบายการเก็บรักษา Audit Log",
      tags: ["audit", "compliance", "policy"],
      isPrimary: true,
      intro: [
        "audit log ทุกรายการต้องเก็บไว้อย่างน้อย `RECORD_VERSION_RETENTION_YEARS` ปี ตรงกับระยะเวลาที่กฎหมายกำหนดสำหรับเวชระเบียน ไม่มีการลบทิ้งก่อนครบกำหนดไม่ว่ากรณีใด",
        "แม้บัญชีผู้ป่วยจะถูกปิดหรือ provider จะออกจากระบบไปแล้ว audit log ที่เกี่ยวข้องยังคงถูกเก็บไว้ครบตามระยะเวลาเดิม ไม่ถูกลบตามไปด้วย",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อมีการร้องขอลบข้อมูลตามกฎหมาย",
        tags: ["audit", "legal", "edge-case"],
        body: [
          "ถ้ามีคำสั่งศาลหรือหน่วยงานกำกับดูแลให้ลบข้อมูลผู้ป่วยรายใดรายหนึ่งเป็นกรณีพิเศษ audit log ของผู้ป่วยรายนั้นจะไม่ถูกลบตามไปด้วย — จะถูกแยกเก็บไว้ต่างหากในรูปแบบที่ไม่ระบุตัวตน (anonymized) เพื่อรักษาความสมบูรณ์ของ audit trail โดยรวมไว้ตรวจสอบได้",
          "การขอเข้าถึง audit log เพื่อการสืบสวนภายใน ต้องผ่านการอนุมัติจากทีม compliance โดยเฉพาะ แยกจากสิทธิ์การเข้าถึงเวชระเบียนปกติโดยสิ้นเชิง แม้จะเป็นผู้บริหารระดับสูงก็ไม่มีสิทธิ์ดู audit log โดยตรงโดยไม่ผ่านกระบวนการนี้",
        ],
      },
    },
    {
      slug: "provider-access-revocation-policy",
      title: "นโยบายการเพิกถอนสิทธิ์ Provider",
      tags: ["access-control", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อความสัมพันธ์การรักษาสิ้นสุด (ผู้ป่วยย้ายแพทย์, แพทย์ลาออก) สิทธิ์การเข้าถึงต้องถูกเพิกถอนทันทีผ่าน `revokeAccess` ไม่รอให้หมดอายุตามรอบปกติ",
        "การเพิกถอนสิทธิ์ publish event `provider.access_revoked` ทันที ให้ {{ref:module:provider-access-control}} ล้าง cache ทุก instance ภายในไม่กี่วินาที",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อแพทย์ลาออกกะทันหันกลางการรักษา",
        tags: ["access-control", "edge-case"],
        body: [
          "ถ้าแพทย์ลาออกกะทันหันขณะที่ผู้ป่วยยังอยู่ระหว่างการรักษาต่อเนื่อง ระบบจะไม่เพิกถอนสิทธิ์ทันทีเสมอไป — จะให้สิทธิ์อ่านอย่างเดียว (read-only) ต่อไปอีก 30 วันเพื่อให้แพทย์คนใหม่ที่รับช่วงต่อสามารถขอข้อมูลส่งต่อการรักษาได้ แต่แก้ไขข้อมูลไม่ได้อีกต่อไป",
          "สิทธิ์ read-only ชั่วคราวนี้ไม่ใช้กับกรณีแพทย์ถูกเพิกถอนใบอนุญาตหรือถูกไล่ออกเพราะเหตุผลด้านจริยธรรม — กรณีเหล่านี้เพิกถอนสิทธิ์ทั้งหมดทันทีไม่มีข้อยกเว้น",
        ],
      },
    },
    {
      slug: "patient-record-amendment-policy",
      title: "นโยบายการแก้ไขเวชระเบียน",
      tags: ["records", "policy"],
      isPrimary: false,
      intro: [
        "การแก้ไขข้อมูลผู้ป่วยทุกครั้งสร้างเวอร์ชันใหม่เสมอ ไม่มีการ overwrite ข้อมูลเดิมทิ้งไม่ว่ากรณีใด แม้จะเป็นการแก้ typo เล็กน้อยก็ตาม",
        "เฉพาะแพทย์เจ้าของไข้หรือผู้ที่มี care relationship active เท่านั้นที่แก้ไขข้อมูลได้ ผู้ที่มีสิทธิ์แค่อ่าน (เช่น consult ชั่วคราว) แก้ไขไม่ได้เลย",
      ],
    },
    {
      slug: "appointment-overbooking-policy",
      title: "นโยบายการจองนัดเกินขนาด (Overbooking)",
      tags: ["scheduling", "policy"],
      isPrimary: false,
      intro: [
        "แพทย์บางคนอนุญาตให้ overbook ได้สูงสุด 1 slot ต่อช่วงเวลา 30 นาที เพื่อรองรับกรณีนัดฉุกเฉินหรือ follow-up สั้นๆ โดยต้องเปิดใช้ตัวเลือกนี้เองต่อแพทย์แต่ละคน ไม่ใช่ค่า default ของระบบ",
        "ระบบจะแจ้งเตือนผู้ป่วยที่ถูก overbook ล่วงหน้าว่าอาจต้องรอนานกว่าปกติ เพื่อความโปร่งใส ไม่ปิดบังว่ามีการจองซ้อน",
      ],
    },
    {
      slug: "prescription-drug-interaction-check-policy",
      title: "นโยบายการตรวจปฏิกิริยาระหว่างยา",
      tags: ["prescription", "policy"],
      isPrimary: false,
      intro: [
        "ก่อนออกใบสั่งยาใหม่ ระบบต้องเรียก `checkInteraction` เทียบกับยาที่ผู้ป่วยใช้อยู่ปัจจุบันเสมอ ถ้าพบปฏิกิริยาระดับรุนแรง ระบบจะบล็อกการออกใบสั่งยาจนกว่าแพทย์จะยืนยันรับทราบความเสี่ยงด้วยมือ",
        "ปฏิกิริยาระดับเล็กน้อยจะแสดงเป็นคำเตือนแต่ไม่บล็อกการสั่งยา ให้เป็นดุลยพินิจของแพทย์ผู้สั่ง",
      ],
    },
    {
      slug: "lab-result-duplicate-suppression-policy",
      title: "นโยบายการกันผลตรวจซ้ำ",
      tags: ["lab", "policy"],
      isPrimary: false,
      intro: [
        "ถ้าห้องแล็บส่งผลตรวจเดิมซ้ำ (เช่น จาก retry ของระบบแล็บเอง) ภายใน 1 ชั่วโมงสำหรับผู้ป่วยและรายการตรวจเดียวกัน ระบบจะไม่สร้างระเบียนใหม่ซ้ำ แต่จะปรับปรุงระเบียนเดิมแทน",
        "การตรวจสอบความซ้ำใช้ (patientId, testCode, collectedAt) เป็นหลัก ไม่ใช้แค่ resultId ของแล็บเพราะแล็บบางแห่ง generate ID ใหม่ทุกครั้งที่ retry",
      ],
    },
    {
      slug: "emergency-access-break-glass-policy",
      title: "นโยบายการเข้าถึงฉุกเฉิน (Break-glass)",
      tags: ["access-control", "emergency", "policy"],
      isPrimary: false,
      intro: [
        "ในสถานการณ์ฉุกเฉินที่แพทย์ไม่มี care relationship กับผู้ป่วยแต่ต้องเข้าถึงข้อมูลทันที (เช่น ผู้ป่วยหมดสติมาห้องฉุกเฉิน) ระบบอนุญาตให้ break-glass access ได้โดยต้องระบุเหตุผลก่อนทุกครั้ง",
        "การเข้าถึงแบบ break-glass ทุกครั้งถูกบันทึกลง audit log ทันทีในระดับความสำคัญสูงสุด และทีม compliance จะตรวจสอบย้อนหลังทุกกรณีภายใน 48 ชั่วโมงว่าเหมาะสมหรือไม่",
      ],
    },
  ],
  incidents: [
    {
      slug: "record-access-unauthorized-view",
      title: "แพทย์เข้าดูเวชระเบียนโดยไม่มี Care Relationship",
      tags: ["access-control", "compliance"],
      summary:
        "ทีม compliance ตรวจ audit log ประจำเดือนพบว่าแพทย์คนหนึ่งเข้าดูเวชระเบียนผู้ป่วยรายหนึ่งหลายครั้งทั้งที่ไม่มี care relationship ที่ active อยู่เลย",
      investigation:
        "ตรวจ {{ref:module:provider-access-control}} พบว่า care relationship ระหว่างแพทย์คนนี้กับผู้ป่วยเคยมีอยู่จริงแต่หมดอายุไปแล้ว 3 สัปดาห์ก่อน ทว่า cache สิทธิ์ยัง return ผลอนุญาตอยู่",
      cause:
        "cache invalidation ตอน care relationship หมดอายุแบบ time-based ไม่ได้ trigger event ให้ล้าง cache ทันที ต่างจากกรณี revoke ด้วยมือที่ trigger event ปกติ — ช่องโหว่นี้ใช้ได้เฉพาะกรณีหมดอายุตามเวลาเท่านั้น",
      resolution:
        "แก้ scheduled job ให้ trigger event ล้าง cache เมื่อ care relationship หมดอายุเหมือนกับกรณี revoke ด้วยมือ แล้วแจ้งทีม compliance ให้ตรวจสอบว่าแพทย์คนนี้เข้าถึงข้อมูลด้วยเหตุผลอันควรหรือไม่",
      followup:
        "เพิ่ม automated test ครอบคลุมทั้งสองเส้นทางของการหมดสิทธิ์ (หมดอายุตามเวลา vs revoke ด้วยมือ) ให้ behavior เหมือนกันเสมอ",
    },
    {
      slug: "prescription-duplicate-issuance",
      title: "ออกใบสั่งยาซ้ำจาก Retry ของแอปแพทย์",
      tags: ["prescription", "bug"],
      summary:
        "ผู้ป่วยรายหนึ่งได้รับใบสั่งยาชนิดเดียวกัน 2 ใบในเวลาไล่เลี่ยกันจากการสั่งของแพทย์คนเดียวครั้งเดียว",
      investigation:
        "ตรวจ {{ref:module:prescription-manager}} พบว่าแอปของแพทย์ retry request `issuePrescription` เพราะไม่ได้ response ภายในเวลาที่กำหนด โดยไม่ส่ง idempotency key มาด้วย",
      cause:
        "ฟังก์ชัน `issuePrescription` ไม่มีกลไก idempotency ใดๆ ทุกครั้งที่เรียกจะสร้างใบสั่งยาใหม่เสมอไม่ว่าจะเป็นการเรียกซ้ำหรือไม่",
      resolution:
        "ยกเลิกใบสั่งยาที่ซ้ำด้วยมือ แจ้งเภสัชกรที่เกี่ยวข้อง แล้ว deploy hotfix เพิ่ม idempotency key ให้ `issuePrescription`",
      followup:
        "ตรวจสอบฟังก์ชันอื่นที่มีผลกระทบทางการแพทย์ใน {{ref:module:prescription-manager}} ว่ามีความเสี่ยงขาด idempotency แบบเดียวกันหรือไม่",
    },
    {
      slug: "lab-result-critical-value-delay",
      title: "แจ้งเตือนผลตรวจค่าวิกฤตล่าช้ากว่ากำหนด",
      tags: ["lab", "alert"],
      summary:
        "แพทย์รายหนึ่งได้รับแจ้งเตือนผลตรวจค่าโพแทสเซียมระดับวิกฤตของผู้ป่วยช้ากว่า `CRITICAL_VALUE_ALERT_TIMEOUT_MIN` ที่กำหนดไว้เกือบ 2 ชั่วโมง",
      investigation:
        "ตรวจ {{ref:module:lab-result-ingest}} พบว่าผลตรวจนี้เข้าเงื่อนไข `pending_manual_match` เพราะชื่อผู้ป่วยสะกดต่างจากในระบบเล็กน้อย ทำให้ confidence ต่ำกว่า threshold และรอคิวตรวจสอบด้วยมือตามปกติ ไม่ได้เข้าเงื่อนไข escalate ด่วนของค่าวิกฤต",
      cause:
        "ระบบตรวจสอบ critical value เฉพาะผลตรวจที่จับคู่ผู้ป่วยสำเร็จแล้วเท่านั้น (`matched` status) ผลตรวจที่ยังรอ manual match ไม่ถูกตรวจสอบว่าเป็นค่าวิกฤตเลยจนกว่าจะจับคู่เสร็จก่อน",
      resolution:
        "จับคู่ผู้ป่วยด้วยมือทันทีเมื่อพบปัญหา แจ้งแพทย์เจ้าของไข้ทันที แล้วปรับ flow ให้ตรวจ critical value ได้แม้อยู่ในสถานะ pending_manual_match",
      followup:
        "แก้ {{ref:policy:lab-result-critical-value-alert-policy}} ให้ครอบคลุมผลตรวจที่ยังไม่จับคู่เสร็จอย่างเป็นทางการ ตามที่ระบุใน edge case ของนโยบายแล้วแต่ยังไม่ได้ implement จริงตอนเกิดเหตุ",
    },
    {
      slug: "appointment-double-booking",
      title: "Slot นัดหมายเดียวถูกจองซ้อนสองคน",
      tags: ["scheduling", "race-condition"],
      summary:
        "ผู้ป่วยสองคนได้รับการยืนยันนัดหมาย slot เวลาเดียวกันของแพทย์คนเดียวกัน ทำให้คนหนึ่งต้องรอนานผิดปกติตอนไปถึงคลินิก",
      investigation:
        "ตรวจ `bookAppointment` ใน {{ref:module:appointment-scheduler}} พบว่าสอง request จองพร้อมกันในเวลาไล่เลี่ยกันมาก ทั้งคู่ query เห็น slot ว่างพร้อมกันก่อนที่ฝ่ายแรกจะเขียนสถานะจองสำเร็จ",
      cause:
        "การตรวจสอบและจอง slot ไม่ได้ทำแบบ atomic — มีช่วงเวลาสั้นๆ ระหว่างการเช็คว่าง กับการเขียนสถานะจองที่เปิดโอกาสให้ request คู่ขนานแทรกเข้ามาได้",
      resolution:
        "ติดต่อผู้ป่วยรายที่จองไม่ทันจริงเพื่อเลื่อนนัด แล้วแก้ `bookAppointment` ให้ใช้ conditional update แบบ atomic แทนการอ่านแล้วเขียนแยกกัน",
      followup:
        "ตรวจสอบฟังก์ชันอื่นที่มี pattern อ่าน-แล้ว-เขียนคล้ายกันในระบบทั้งหมดว่ามีความเสี่ยง race condition เดียวกันหรือไม่",
    },
    {
      slug: "audit-log-gap",
      title: "Audit Log หายไปช่วง Deploy ของ Audit-log-service",
      tags: ["audit", "compliance"],
      summary:
        "ทีม compliance พบว่ามีช่วงเวลาประมาณ 12 นาทีที่ไม่มี audit event ถูกบันทึกเลยแม้จะมีการเข้าถึงข้อมูลผู้ป่วยเกิดขึ้นจริงในช่วงนั้น",
      investigation:
        "ตรวจสอบพบว่าช่วงเวลาดังกล่าวตรงกับตอน deploy เวอร์ชันใหม่ของ {{ref:module:audit-log-service}} ที่ instance เก่าถูกปิดก่อนที่ instance ใหม่จะพร้อมรับ event เต็มรูปแบบ",
      cause:
        "deploy strategy เป็นแบบ recreate (ปิดเก่าก่อนเปิดใหม่) ไม่ใช่ rolling update ทำให้มีช่วงเวลาที่ไม่มี instance ไหนพร้อมรับ event เลย และ event ที่ publish ระหว่างนั้นไม่มีการ retry หรือ dead-letter queue รองรับ",
      resolution:
        "กู้คืน audit trail ที่หายไปบางส่วนจาก log ระดับ application อื่นที่พอมีข้อมูลทับซ้อนอยู่ แล้วบันทึกช่วงเวลาที่ audit log ขาดหายไว้ในรายงาน compliance อย่างชัดเจน",
      followup:
        "เปลี่ยน deploy strategy ของ audit-log-service เป็น rolling update และเพิ่ม dead-letter queue รองรับ event ที่ publish ไม่สำเร็จ ห้ามเกิดช่วงที่ไม่มี instance รับ audit event อีก",
    },
    {
      slug: "provider-access-stale-permission",
      title: "Provider ที่ถูกเพิกถอนสิทธิ์ยังเข้าถึงข้อมูลได้",
      tags: ["access-control", "compliance"],
      summary:
        "พยาบาลที่ลาออกจากคลินิกไปแล้ว 2 วันยังคงเข้าดูเวชระเบียนผู้ป่วยได้ผ่านแอปมือถือที่ค้างล็อกอินอยู่",
      investigation:
        "ตรวจ {{ref:module:provider-access-control}} พบว่า `revokeAccess` ถูกเรียกสำเร็จจริงตอนพยาบาลลาออก แต่ instance หนึ่งของ cache ไม่ได้รับ event `provider.access_revoked` เพราะ network partition สั้นๆ ระหว่างนั้น",
      cause:
        "การ subscribe event ไม่มี retry หรือ reconciliation job สำรอง ถ้า instance พลาด event ไปครั้งเดียวจะไม่มีทางรู้ตัวและใช้ cache เก่าต่อไปจนกว่าจะ TTL หมดอายุเอง",
      resolution:
        "revoke สิทธิ์ด้วยมือที่ instance ที่ได้รับผลกระทบทันที แล้วเพิ่ม reconciliation job รายชั่วโมงที่เทียบ cache กับสถานะจริงในฐานข้อมูล",
      followup:
        "พิจารณาลด `ACCESS_CACHE_TTL_SECONDS` ลงเพิ่มเติมสำหรับกรณีที่ reconciliation job ยังตรวจไม่ทัน เพื่อจำกัดหน้าต่างความเสี่ยงให้สั้นที่สุด",
    },
    {
      slug: "lab-result-wrong-patient-match",
      title: "ผลตรวจแล็บจับคู่ผิดผู้ป่วยเกือบสำเร็จ",
      tags: ["lab", "near-miss"],
      summary:
        "ระบบเกือบจับคู่ผลตรวจของผู้ป่วยรายหนึ่งเข้ากับเวชระเบียนของผู้ป่วยอีกรายที่มีชื่อคล้ายกันมาก โชคดีที่ confidence score ต่ำกว่า threshold เล็กน้อยจึงเข้าคิวตรวจด้วยมือแทน",
      investigation:
        "ตรวจ `matchPatient` ใน {{ref:module:lab-result-ingest}} พบว่าอัลกอริทึมจับคู่ให้น้ำหนักกับชื่อและวันเกิดมากเกินไป โดยไม่ได้ใช้ตัวระบุที่ไม่ซ้ำกันเช่นเลขบัตรประชาชนเป็นหลัก",
      cause:
        "ผู้ป่วยทั้งสองรายมีชื่อและวันเกิดคล้ายกันมากโดยบังเอิญ (นามสกุลต่างกันเล็กน้อย) ทำให้คะแนน confidence สูงเกือบถึง threshold ทั้งที่เป็นคนละคนจริงๆ",
      resolution:
        "จับคู่ผลตรวจด้วยมือให้ถูกต้อง แล้วตรวจสอบผลตรวจอื่นทั้งหมดที่จับคู่โดยอัลกอริทึมเดียวกันในช่วงเวลาเดียวกันว่ามีเคสคล้ายกันหลุดรอดไปหรือไม่",
      followup:
        "ปรับอัลกอริทึมให้บังคับใช้ตัวระบุที่ไม่ซ้ำกัน (เช่นเลขบัตรประชาชนหรือ MRN) เป็นเงื่อนไขหลักเสมอ ไม่ใช่แค่ชื่อกับวันเกิดที่มีโอกาสซ้ำกันได้",
    },
    {
      slug: "prescription-refill-bypass",
      title: "ข้อจำกัดการเบิกยาซ้ำถูกข้ามเพราะ Timezone Bug",
      tags: ["prescription", "bug"],
      summary:
        "ผู้ป่วยรายหนึ่งสามารถเบิกยาซ้ำได้เร็วกว่า `REFILL_MIN_INTERVAL_DAYS` ที่กำหนดไว้ 2 วัน ทั้งที่ระบบควรปฏิเสธ",
      investigation:
        "ตรวจ {{ref:module:prescription-manager}} พบว่าการคำนวณระยะห่างระหว่างวันที่เบิกใช้ timezone ของ server แต่การเบิกจริงเกิดข้ามช่วงเปลี่ยนวันของ timezone ผู้ป่วยพอดี ทำให้การนับวันคลาดเคลื่อน",
      cause:
        "field วันที่เบิกล่าสุดถูกเก็บโดยไม่มี timezone กำกับชัดเจน (naive datetime) ทำให้การคำนวณระยะห่างผิดพลาดได้เมื่อ server กับผู้ใช้อยู่คนละ timezone",
      resolution:
        "แก้ให้เก็บ timestamp แบบ UTC พร้อม timezone กำกับเสมอ และคำนวณระยะห่างจาก UTC โดยตรงไม่พึ่ง local time ของฝั่งใดฝั่งหนึ่ง",
      followup:
        "ตรวจสอบ field วันที่อื่นทั้งหมดในระบบว่ามีปัญหา naive datetime แบบเดียวกันหรือไม่ โดยเฉพาะ field ที่ใช้คำนวณ business rule ที่มีผลต่อความปลอดภัยของผู้ป่วย",
    },
    {
      slug: "emergency-access-abuse",
      title: "พบการใช้ Break-glass Access ไม่เหมาะสมจากการตรวจสอบ Audit",
      tags: ["access-control", "compliance"],
      summary:
        "ทีม compliance ตรวจสอบการใช้ {{ref:policy:emergency-access-break-glass-policy}} ประจำสัปดาห์ พบว่าพนักงานคนหนึ่งใช้ break-glass access เข้าดูเวชระเบียนของเพื่อนร่วมงานโดยไม่มีเหตุฉุกเฉินจริง",
      investigation:
        "ตรวจ audit log พบว่าเหตุผลที่ระบุตอนขอ break-glass access ไม่สอดคล้องกับบันทึกการรักษาจริงในช่วงเวลานั้น ผู้ป่วยรายนั้นไม่ได้เข้ารับการรักษาฉุกเฉินตามที่อ้าง",
      cause:
        "ระบบอนุญาต break-glass access ตามเหตุผลที่ผู้ขอกรอกเองโดยไม่มีการตรวจสอบความสอดคล้องกับข้อมูลจริงแบบ real-time เพราะการตรวจสอบล่วงหน้าจะขัดกับจุดประสงค์ของการเข้าถึงฉุกเฉินที่ต้องรวดเร็ว",
      resolution:
        "ส่งเรื่องเข้ากระบวนการวินัยตามนโยบายองค์กร แยกจากการแก้ไขระบบ เพิกถอนสิทธิ์ break-glass ของพนักงานคนนี้ชั่วคราวระหว่างสอบสวน",
      followup:
        "ยืนยันว่ากระบวนการตรวจสอบย้อนหลังภายใน 48 ชั่วโมงตาม {{ref:policy:emergency-access-break-glass-policy}} ทำงานได้ผลจริงในเคสนี้ — นี่คือกลไกที่จับความผิดปกติได้ ไม่ใช่การป้องกันล่วงหน้า",
    },
    {
      slug: "appointment-reminder-spam",
      title: "ผู้ป่วยได้รับการแจ้งเตือนนัดหมายซ้ำหลายครั้ง",
      tags: ["scheduling", "notification"],
      summary:
        "ผู้ป่วยหลายรายร้องเรียนว่าได้รับ SMS แจ้งเตือนนัดหมายเดียวกันซ้ำ 3-4 ครั้งในวันเดียวกัน",
      investigation:
        "ตรวจ background job ที่ส่งการแจ้งเตือนใน {{ref:module:appointment-scheduler}} พบว่า job scheduler รันซ้ำหลายรอบเพราะ cron ทับซ้อนกับ job ที่รันช้ากว่ากำหนดจากรอบก่อนหน้า",
      cause:
        "ไม่มี lock กันไม่ให้ job เดิมรันซ้อนกันสองรอบ เหมือนกับปัญหาที่เคยเจอในระบบอื่นมาก่อน แต่ยังไม่ได้ตรวจสอบ pattern เดียวกันในทุก background job ของโดเมนนี้",
      resolution:
        "หยุด job ที่รันซ้อน แล้วเพิ่ม distributed lock กันการรันซ้ำสำหรับ job แจ้งเตือนนัดหมายทันที",
      followup:
        "ตรวจสอบ background job อื่นทั้งหมดในระบบว่ามี lock กันการรันซ้อนครบทุกตัวหรือไม่ ไม่ใช่แก้เฉพาะจุดที่เจอปัญหา",
    },
    {
      slug: "record-amendment-race-condition",
      title: "การแก้ไขเวชระเบียนพร้อมกันทับข้อมูลกัน",
      tags: ["records", "race-condition"],
      summary:
        "แพทย์สองคนแก้ไขข้อมูลผู้ป่วยรายเดียวกันในเวลาไล่เลี่ยกันมาก การแก้ไขของคนที่สองทับข้อมูลของคนแรกไปทั้งที่แก้คนละส่วนกัน",
      investigation:
        "ตรวจ `amendRecord` ใน {{ref:module:patient-record-store}} พบว่าฟังก์ชันนี้อ่านข้อมูลปัจจุบันทั้งก้อนมาแก้แล้วเขียนทับทั้งก้อน ไม่ได้ merge เฉพาะ field ที่เปลี่ยนจริง",
      cause:
        "ตอนออกแบบฟังก์ชันไม่ได้คำนึงถึงกรณีแก้ไขพร้อมกันจากสองคนในเวลาใกล้กันมาก เพราะมองว่าเป็นเหตุการณ์ที่เกิดยาก แต่ในทางปฏิบัติเกิดขึ้นบ่อยกว่าที่คาดตอนแผนกฉุกเฉินยุ่ง",
      resolution:
        "กู้คืนข้อมูลที่หายไปจาก `patient_record_versions` ที่เก็บไว้ครบทุกเวอร์ชัน แล้ว merge ด้วยมือให้ถูกต้องตามที่แพทย์ทั้งสองตั้งใจแก้จริง",
      followup:
        "แก้ `amendRecord` ให้ merge เฉพาะ field ที่เปลี่ยนจริงแทนการเขียนทับทั้งก้อน และเพิ่ม optimistic locking ตรวจ version ปัจจุบันก่อนบันทึกเสมอ",
    },
    {
      slug: "lab-ingest-format-mismatch",
      title: "แล็บพันธมิตรใหม่ส่งข้อมูลรูปแบบต่างทำ Field บางส่วนหายเงียบ",
      tags: ["lab", "integration"],
      summary:
        "หลังเริ่มรับผลตรวจจากห้องแล็บพันธมิตรใหม่ ทีมแพทย์สังเกตว่าผลตรวจบางรายการขาด field หน่วยวัด (unit) ไปเฉยๆ โดยไม่มี error แจ้ง",
      investigation:
        "ตรวจ {{ref:module:lab-result-ingest}} พบว่าแล็บพันธมิตรใหม่ส่ง field หน่วยวัดในตำแหน่งที่ต่างจากแล็บอื่น parser เดิมไม่รู้จักตำแหน่งนี้จึงข้ามไปเงียบๆ แทนที่จะ error",
      cause:
        "parser ออกแบบมาแบบ best-effort ที่ข้าม field ที่ไม่รู้จักแทนที่จะปฏิเสธทั้ง payload เพื่อไม่ให้ผลตรวจสำคัญอื่นตกหล่นไปด้วย แต่ผลข้างเคียงคือ field ที่ขาดหายไม่ถูกสังเกตง่ายๆ",
      resolution:
        "เพิ่ม mapping รองรับรูปแบบของแล็บพันธมิตรใหม่ แล้วรัน backfill เติม field หน่วยวัดที่หายไปให้ผลตรวจที่ได้รับผลกระทบทั้งหมด",
      followup:
        "เปลี่ยนพฤติกรรม parser ให้ flag ผลตรวจที่มี field ขาดหายเข้าคิวตรวจสอบด้วยมือแทนการข้ามไปเงียบๆ แม้จะเป็น field ที่ไม่ critical ก็ตาม",
    },
    {
      slug: "provider-access-onboarding-delay",
      title: "แพทย์ใหม่เข้าระบบไม่ได้หลายวันเพราะ Provisioning Bug",
      tags: ["access-control", "onboarding"],
      summary:
        "แพทย์ที่เพิ่งเข้าร่วมคลินิกไม่สามารถเข้าถึงเวชระเบียนผู้ป่วยที่ตัวเองรับผิดชอบได้เลยเป็นเวลา 3 วันหลังวันแรกที่เริ่มงาน",
      investigation:
        "ตรวจ provisioning flow พบว่า account ของแพทย์ถูกสร้างสำเร็จใน identity system แต่ job ที่ sync สิทธิ์เข้า {{ref:module:provider-access-control}} ล้มเหลวเงียบๆ เพราะ field ที่จำเป็นตัวหนึ่งหายไปจากข้อมูล onboarding",
      cause:
        "job sync ไม่มีการแจ้งเตือนเมื่อ sync ล้มเหลว ทำให้ไม่มีใครรู้ตัวจนกว่าแพทย์คนนั้นจะร้องเรียนเองว่าเข้าระบบไม่ได้",
      resolution:
        "sync สิทธิ์ด้วยมือให้แพทย์คนนี้ทันที แล้วตรวจสอบ onboarding ที่ค้างอยู่ในช่วงเวลาเดียวกันว่ามีเคสอื่นได้รับผลกระทบเหมือนกันหรือไม่",
      followup:
        "เพิ่ม alert เมื่อ provisioning job ล้มเหลว และเพิ่มการยืนยันความครบถ้วนของข้อมูล onboarding ก่อนเริ่ม job แทนที่จะปล่อยให้ล้มเหลวกลางทางเงียบๆ",
    },
    {
      slug: "audit-log-clock-skew",
      title: "Clock Skew ทำ Audit Event เรียงลำดับผิดกระทบการตรวจสอบ Compliance",
      tags: ["audit", "infrastructure"],
      summary:
        "ทีม compliance ตรวจสอบ audit trail ของเคสหนึ่งแล้วพบว่าลำดับเหตุการณ์ดูขัดแย้งกัน (แสดงว่าแก้ไขข้อมูลก่อนที่จะเข้าถึงข้อมูล) ทำให้การสืบสวนล่าช้า",
      investigation:
        "ตรวจ {{ref:module:audit-log-service}} พบว่า instance บางตัวมี clock skew ต่างจากเวลาจริงหลายวินาที ทำให้ event ที่เกิดทีหลังบันทึก timestamp เร็วกว่า event ที่เกิดก่อนในบาง edge case",
      cause:
        "NTP sync ของ instance กลุ่มนั้นล้มเหลวเงียบๆ มาหลายวันโดยไม่มี alert แจ้ง เพราะ monitoring เดิมเช็คแค่ว่า NTP service รันอยู่ ไม่ได้เช็คว่า sync สำเร็จจริงหรือไม่",
      resolution:
        "แก้ NTP config และ restart sync บน instance ที่ได้รับผลกระทบ แล้วเรียงลำดับ audit trail ของเคสที่ได้รับผลกระทบใหม่โดยอ้างอิงจาก event ID ที่มีลำดับ monotonic แทน timestamp ที่คลาดเคลื่อน",
      followup:
        "เปลี่ยน monitoring ให้เช็คความต่างของเวลาจริงเทียบกับ NTP server โดยตรง และเพิ่ม monotonic sequence number ให้ทุก audit event ไม่พึ่ง wall-clock timestamp เพียงอย่างเดียวสำหรับการเรียงลำดับที่มีผลต่อ compliance",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/VITAL-512-break-glass-alert`, `fix/VITAL-529-refill-timezone-bug`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(prescription-manager): เพิ่ม idempotency key กันออกใบสั่งยาซ้ำ`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ข้อมูลผู้ป่วยหรือสิทธิ์การเข้าถึงต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:record-amendment-race-condition}}) และฟังก์ชันที่มีผลต่อความปลอดภัยผู้ป่วยต้องมีคนที่สองยืนยันก่อน merge" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `checkAccess`, `flagCriticalValue` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`patientId` รูปแบบ `pt_<ULID>`, `providerId` รูปแบบ `prv_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนผู้ป่วยทั้งระบบได้" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับการเข้าถึงข้อมูลผู้ป่วยต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ห้าม log ข้อมูลผู้ป่วยตรงๆ", body: "ห้าม log ชื่อ, วันเกิด, หรือรายละเอียดการวินิจฉัยลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ patientId เท่านั้น ดู {{ref:convention:phi-handling-convention}}" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`VITAL_<DOMAIN>_<REASON>` เช่น `VITAL_ACCESS_DENIED`, `VITAL_REFILL_LIMIT_EXCEEDED` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`VITAL_RECORD_VERSION_CONFLICT`, `VITAL_LAB_MATCH_AMBIGUOUS`, `VITAL_APPOINTMENT_SLOT_TAKEN` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Concurrent test", body: "ฟังก์ชันที่แก้ข้อมูลผู้ป่วยหรือจองนัดหมายต้องมี test จำลอง concurrent call อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก {{ref:incident:appointment-double-booking}}" },
        { heading: "Access control test", body: "ทุก endpoint ที่แตะข้อมูลผู้ป่วยต้องมี test ยืนยันว่าปฏิเสธการเข้าถึงที่ไม่มี care relationship ครบทุกเส้นทาง ไม่ใช่แค่เส้นทางหลัก" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw exception message ของ backend ออกไปตรงๆ เพราะอาจรั่วข้อมูล internal โดยไม่ตั้งใจ" },
      ],
    },
    {
      slug: "phi-handling-convention",
      title: "PHI Handling Convention",
      tags: ["compliance", "security"],
      intro: "PHI (Protected Health Information) คือข้อมูลใดๆ ที่ระบุตัวตนผู้ป่วยได้ร่วมกับข้อมูลสุขภาพ — เอกสารนี้กำหนดกฎการจัดการที่เข้มงวดกว่าข้อมูลทั่วไปทุกจุดที่แตะข้อมูลประเภทนี้",
      sections: [
        { heading: "การส่งข้อมูลระหว่าง service", body: "PHI ที่ส่งข้าม service ต้องเข้ารหัสระหว่างทางเสมอ (in-transit encryption) และห้ามส่งผ่าน query string เด็ดขาด ต้องอยู่ใน request body เท่านั้น" },
        { heading: "การเก็บใน log/monitoring", body: "ระบบ monitoring และ log aggregation ทั้งหมดต้องผ่านการ scrub PHI ก่อนเข้า pipeline เสมอ — ทีมที่เพิ่ม field ใหม่ลง log ต้องยืนยันว่าไม่มี PHI ปนอยู่ก่อน merge" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → access-control test (ครอบคลุมทุก endpoint ที่แตะข้อมูลผู้ป่วย) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:patient-record-store}} และ {{ref:module:provider-access-control}} ต้องผ่าน access-control test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบสิทธิ์การเข้าถึงข้อมูลผู้ป่วยโดยตรง" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure/connection เท่านั้น ไม่ใช่ business timeout ของการแจ้งเตือนค่าวิกฤต — ดูเรื่องนั้นที่ {{ref:policy:lab-result-critical-value-alert-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → provider-access-control | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| patient-record-store → database pool acquire | 3s | `pg-pool` config |\n| lab-result-ingest → external lab webhook | 10s | env `LAB_WEBHOOK_TIMEOUT_MS` |" },
        { heading: "เหตุผลที่ตั้งเข้มกว่าระบบทั่วไป", body: "provider-access-control ต้อง timeout สั้นและ fail-closed (ปฏิเสธการเข้าถึงถ้าตรวจสอบไม่ทัน) ไม่ใช่ fail-open เพราะการปล่อยผ่านโดยไม่ตรวจสอบสิทธิ์ให้ทันเวลาเสี่ยงกว่าการปฏิเสธชั่วคราวมาก" },
      ],
    },
    {
      slug: "record-migration-runbook",
      title: "Patient Record Migration Runbook",
      tags: ["migration", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ migrate ข้อมูลเวชระเบียนเมื่อเปลี่ยนโครงสร้างฐานข้อมูลหรือย้ายเครื่อง ตามที่กำหนดไว้ใน {{ref:policy:audit-log-retention-policy}}",
      sections: [
        { heading: "ก่อน migrate", body: "ต้อง freeze การเขียนข้อมูลช่วงสั้นๆ ก่อน cutover เสมอ ไม่ migrate ข้อมูลที่ยัง active เขียนอยู่ — บทเรียนจากระบบอื่นที่เคยเจอปัญหาข้อมูลหายจากการไม่ freeze ก่อน cutover" },
        { heading: "หลัง migrate", body: "ต้องยืนยันจำนวนระเบียนและ audit log ที่ migrate ครบตรงกับต้นทาง 100% ก่อนปิดเครื่องเดิม ห้ามปิดเครื่องเดิมจนกว่าจะยืนยันครบถ้วนแล้วเท่านั้น" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ข้อมูลผู้ป่วยรั่วไหลหรือเข้าถึงได้โดยไม่มีสิทธิ์ในวงกว้าง, Sev2 = กระทบบาง service/บางกลุ่มผู้ป่วย, Sev3 = กระทบเล็กน้อยไม่ถึงข้อมูลผู้ป่วยโดยตรง" },
        { heading: "กรณีที่เกี่ยวกับ PHI", body: "ทุกเหตุการณ์ที่เกี่ยวข้องกับการเข้าถึง PHI โดยไม่เหมาะสม ต้องยกระดับเป็น Sev1 เสมอและแจ้งทีม compliance ทันที เขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "critical lab value ที่ยังไม่ถูก acknowledge เกิน `CRITICAL_VALUE_ALERT_TIMEOUT_MIN`, break-glass access เกิน 5 ครั้งใน 1 ชั่วโมงจาก provider คนเดียว, audit log gap ที่ตรวจพบจาก reconciliation job" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ access-control ปฏิเสธ/อนุมัติผิดพลาด หรือ audit log หยุดบันทึก ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:audit-log-gap}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องและทีม compliance ทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| provider-access-control | 3 | 10 | latency p95 > 100ms (fail-closed sensitive) |\n| lab-result-ingest | 2 | 8 | queue depth > 500 |\n| audit-log-service | 2 | 6 | write latency > 50ms |" },
        { heading: "ข้อจำกัดที่ต้องระวัง", body: "provider-access-control ต้อง scale ล่วงหน้าก่อน peak (เช่น ต้นชั่วโมงคลินิกเปิด) ไม่รอ autoscale ตามหลัง เพราะ fail-closed design ทำให้ latency สูงแปลว่าผู้ป่วยเข้าไม่ถึงบริการ ไม่ใช่แค่ช้า" },
      ],
    },
    {
      slug: "compliance-audit-capacity-planning-runbook",
      title: "Compliance Audit Capacity Planning Runbook",
      tags: ["compliance", "runbook"],
      intro: "ขั้นตอนเตรียมความพร้อมสำหรับการตรวจสอบ compliance ประจำปีหรือการสืบสวนกรณีพิเศษที่ต้อง query audit log ปริมาณมาก",
      sections: [
        { heading: "ก่อนการตรวจสอบที่คาดการณ์ได้ล่วงหน้า", body: "scale {{ref:module:audit-log-service}} สำหรับ read replica เพิ่มเติมล่วงหน้า เพื่อไม่ให้ query ปริมาณมากของทีม compliance กระทบ write latency ของ production" },
        { heading: "บทเรียนจากเหตุการณ์จริง", body: "ดู {{ref:incident:audit-log-clock-skew}} — การตรวจสอบ compliance ต้องพึ่งลำดับเหตุการณ์ที่แม่นยำ วางแผนตรวจสอบความถูกต้องของ clock sync ก่อนเริ่มการตรวจสอบใหญ่ทุกครั้ง" },
      ],
    },
  ],
};
