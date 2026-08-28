import type { DomainProfile } from "../types.js";

// QualityPulse — ระบบควบคุมคุณภาพการผลิต
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const qualityControl: DomainProfile = {
  id: "quality-control",
  displayName: "QualityPulse — ระบบควบคุณภาพการผลิต",
  summary: [
    "QualityPulse คือแพลตฟอร์มควบคุมคุณภาพในกระบวนการผลิต รับข้อมูลวัดจากเซ็นเซอร์บนสายการผลิต ประมวลผลด้วย Statistical Process Control (SPC) chart เพื่อตรวจจับ batch ที่ออกนอกสเปก แล้ว trigger กระบวนการ rework หรือ quarantine ตามกฎที่กำหนดไว้ ก่อนออกใบรับรองสินค้าสำหรับการขนส่ง",
    "ระบบแบ่งออกเป็น service ย่อยตามขั้นตอนคุณภาพ ตั้งแต่เก็บข้อมูลวัด วิเคราะห์ด้วย SPC ตรวจ batch ประสาน rework กักกัน batch มีปัญหา ไปจนถึงออกเอกสารรับรองสำหรับ shipment ทีมควบคุมคุณภาพเรียกช่วงที่ production ผ่านสายหลักว่า active run และเป็นช่วงที่ข้อมูลเซ็นเซอร์ไหลเข้าระบบหนาแน่นที่สุด",
  ],
  domainTags: ["quality-control", "qualitypulse"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:measurement-collector}} เป็นเจ้าของข้อมูลวัดดิบทั้งหมด ส่วน {{ref:module:spc-analyzer}} ดึงข้อมูลมาคำนวณแต่ไม่เก็บ raw measurement ซ้ำ ผล SPC ที่ spc-analyzer สร้างขึ้นเป็นของตัวเองคนเดียว",
    "{{ref:module:batch-inspector}} เป็น service เดียวที่อ่านผล SPC แล้วตัดสินใจว่า batch ผ่านหรือไม่ผ่าน เหตุผลที่รวมการตัดสินใจไว้ที่จุดเดียวคือเพื่อป้องกัน race condition ที่อาจเกิดขึ้นถ้าปล่อยให้หลาย service ตัดสินใจพร้อมกันสำหรับ batch เดียวกัน",
  ],
  apiGatewayNote: [
    "คำสั่งจาก MES (Manufacturing Execution System) ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง production run เป็น inspection request แล้วส่งต่อให้ {{ref:module:batch-inspector}} คำขอที่ต้องการสถานะปัจจุบันของ batch ใช้ synchronous call ผ่าน gateway ตัวนี้",
    "คำสั่งออกใบรับรองฉุกเฉิน (expedited certification) ไม่ผ่าน gateway เดียวกัน — ใช้ channel แยกที่ {{ref:module:certification-generator}} ควบคุมโดยตรง เพราะ latency ของ gateway กลางสูงเกินไปสำหรับสถานการณ์ที่ฝ่ายขายกด ship ทันที",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:measurement-collector}} ดูแล ได้แก่ `measurements` (ข้อมูลวัดดิบพร้อม timestamp และ instrument_id), `instruments` (ทะเบียนเครื่องมือวัดและสถานะการ calibration), และ `production_runs`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `measurements` | measurement-collector | เก็บตลอด ไม่ลบ ใช้วิเคราะห์ trend ย้อนหลัง |\n| `spc_results` | spc-analyzer | ผล control chart แต่ละจุด พร้อม rule violation |\n| `batches` | batch-inspector | สถานะ batch ปัจจุบัน (pending/pass/rework/quarantine) |\n| `certifications` | certification-generator | ใบรับรองที่ออกแล้ว พร้อม checksum |\n| `quarantine_holds` | quarantine-manager | hold ที่ active อยู่ พร้อม reason และ expiry |",
    "ทุกตารางใช้ `batch_id` เป็น key ร่วมกันแบบ soft reference ตรวจสอบความสอดคล้องด้วย reconciliation job รายกะแทน FK constraint ข้าม database จริง",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `measurement.received`, `spc.violation_detected`, `batch.rejected`, `batch.quarantined`, `rework.approved`, `certification.issued` — {{ref:module:batch-inspector}} เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อผล SPC แล้ว trigger กระบวนการถัดไปเอง",
    "{{ref:module:quarantine-manager}} subscribe `batch.rejected` เพื่อสร้าง hold อัตโนมัติ โดยไม่ต้องรอให้ batch-inspector สั่งตรงๆ ออกแบบแบบนี้เพื่อให้การ quarantine ทำงานได้แม้ batch-inspector จะล่มชั่วคราว",
  ],
  modules: [
    {
      slug: "measurement-collector",
      name: "measurement-collector",
      tags: ["measurement", "module", "core"],
      description:
        "รับผิดชอบรับข้อมูลวัดจากเซ็นเซอร์บนสายการผลิตและบันทึกลง database โดยตรวจสอบ instrument_id และสถานะ calibration ก่อนรับข้อมูลทุกครั้ง แยกออกมาเป็น service เดียวกันเพราะการ ingest ข้อมูลความถี่สูงต้องการ tuning แยกจาก service ที่ประมวลผลข้อมูล",
      functions: [
        { sig: "ingestMeasurement(instrumentId: string, runId: string, value: number, unit: string): Promise<MeasurementId>", desc: "รับข้อมูลวัดจากเซ็นเซอร์ ตรวจ calibration status ก่อนบันทึก" },
        { sig: "getCalibrationStatus(instrumentId: string): CalibrationStatus", desc: "คืนสถานะ calibration ล่าสุดของเครื่องมือวัดตัวนั้น" },
        { sig: "listMeasurementsForRun(runId: string, limit?: number): Promise<Measurement[]>", desc: "ดึงข้อมูลวัดทั้งหมดของ production run ที่ระบุ" },
        { sig: "flagInstrumentOverdue(instrumentId: string): Promise<void>", desc: "mark เครื่องมือว่า calibration เกินกำหนด หยุดรับข้อมูลจากตัวนั้นชั่วคราว" },
      ],
      stateFlow: "instrument: active → overdue (calibration เลยกำหนด) | suspended (ระงับด้วยมือ) | retired — ดู {{ref:policy:calibration-interval-policy}} สำหรับเกณฑ์การ flag",
      relatedNotes:
        "ไม่รู้จัก concept SPC เลย — ถ้า {{ref:module:spc-analyzer}} ต้องการข้อมูลวัดล่าสุดสำหรับคำนวณ control limit ต้องเรียก API ของ measurement-collector ตรงๆ ไม่มีการ push ข้อมูลไปหา spc-analyzer โดยอัตโนมัติ",
      internals: {
        constants: [
          { name: "CALIBRATION_GRACE_PERIOD_HOURS", value: "4" },
          { name: "MAX_MEASUREMENT_BATCH_SIZE", value: "500" },
          { name: "INSTRUMENT_INGEST_RATE_LIMIT_PER_SEC", value: "200" },
        ],
        typeSnippet:
          "interface Measurement {\n  measurementId: string;\n  instrumentId: string;\n  runId: string;\n  value: number;\n  unit: string;\n  timestamp: string;  // ISO 8601\n  calibrationValid: boolean;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:calibration-interval-policy}}",
      },
    },
    {
      slug: "spc-analyzer",
      name: "spc-analyzer",
      tags: ["spc", "module", "core"],
      description:
        "ดึงข้อมูลวัดจาก {{ref:module:measurement-collector}} มาคำนวณ control chart แบบ Western Electric rules ตรวจว่าจุดไหนละเมิด rule ข้อใดบ้าง แล้ว publish event แจ้ง {{ref:module:batch-inspector}} สร้างขึ้นมาเป็น service แยกเพราะ algorithm SPC มีความซับซ้อนของตัวเองและต้องการ parameter ของแต่ละ product line แตกต่างกัน",
      functions: [
        { sig: "computeControlLimits(runId: string, chartType: ChartType): Promise<ControlLimits>", desc: "คำนวณ UCL/LCL จากข้อมูลประวัติของ process นั้น" },
        { sig: "evaluatePoint(runId: string, measurementId: string): Promise<RuleViolation[]>", desc: "ตรวจว่าจุดนั้นละเมิด Western Electric rule ข้อใดบ้าง" },
        { sig: "getRuleViolationsForRun(runId: string): Promise<RuleViolation[]>", desc: "ดึง violation ทั้งหมดของ run นั้นในลำดับเวลา" },
        { sig: "updateProcessParameters(productLineId: string, params: SpcParameters): Promise<void>", desc: "อัปเดต parameter ที่ใช้คำนวณ control limit สำหรับ product line นั้น" },
      ],
      stateFlow: "chart: initializing (รอข้อมูลพอ) → stable (มีข้อมูลพอคำนวณ limit) → out_of_control (มี violation) — in_control กลับมาเองเมื่อจุดใหม่ไม่ละเมิด rule",
      relatedNotes:
        "ไม่มีสิทธิ์ตัดสินใจว่า batch ผ่านหรือไม่ผ่าน — ส่งแค่ violation event ให้ {{ref:module:batch-inspector}} ตัดสินใจต่อ เพื่อให้ business logic รวมอยู่ที่จุดเดียว ดู {{ref:policy:control-chart-rule-policy}} สำหรับรายละเอียด rule ทั้ง 8 ข้อ",
      internals: {
        constants: [
          { name: "MINIMUM_POINTS_FOR_CONTROL_LIMIT", value: "25" },
          { name: "WESTERN_ELECTRIC_ZONE_A_SIGMA", value: "3" },
          { name: "WESTERN_ELECTRIC_ZONE_B_SIGMA", value: "2" },
          { name: "WESTERN_ELECTRIC_ZONE_C_SIGMA", value: "1" },
        ],
        typeSnippet:
          "interface RuleViolation {\n  measurementId: string;\n  ruleNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;\n  severity: \"warning\" | \"action\";\n  description: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule ของ control chart ที่ {{ref:policy:control-chart-rule-policy}}",
      },
    },
    {
      slug: "batch-inspector",
      name: "batch-inspector",
      tags: ["batch", "module", "core"],
      description:
        "รับ event จาก {{ref:module:spc-analyzer}} แล้วตัดสินใจว่า batch แต่ละ batch จะผ่าน, ส่ง rework, หรือ quarantine โดยใช้เกณฑ์ที่กำหนดไว้ใน business rule เป็น service เดียวที่มีสิทธิ์เปลี่ยนสถานะ batch ทำให้ตรวจสอบการตัดสินใจได้จากจุดเดียว",
      functions: [
        { sig: "evaluateBatch(batchId: string): Promise<BatchVerdict>", desc: "ตัดสินใจว่า batch ผ่าน/rework/quarantine จากผล SPC และ inspection ที่รวบรวมได้" },
        { sig: "recordInspectionResult(batchId: string, inspectorId: string, result: InspectionResult): Promise<void>", desc: "บันทึกผลตรวจจากผู้ตรวจ พร้อมตรวจว่าซ้อนทับกับผู้ตรวจคนก่อนหรือไม่" },
        { sig: "overrideBatchStatus(batchId: string, newStatus: BatchStatus, authorizedBy: string, reason: string): Promise<void>", desc: "เปลี่ยนสถานะ batch โดยผู้มีอำนาจ ดู {{ref:policy:rework-approval-authority-policy}}" },
        { sig: "getBatchHistory(batchId: string): Promise<BatchEvent[]>", desc: "ดู history การเปลี่ยนสถานะและผู้ตัดสินใจทั้งหมดของ batch นั้น" },
      ],
      stateFlow: "pending → pass | rework_required | quarantined — rework_required → pass (หลัง rework ผ่าน) | quarantined (ถ้า rework ล้มเหลวซ้ำ) — quarantined เป็น terminal state ต้องมีคนยกเลิก hold",
      relatedNotes:
        "ดู {{ref:policy:batch-rejection-threshold-policy}} สำหรับเกณฑ์ตัวเลขที่ใช้ตัดสินว่าต้อง rework หรือ quarantine ทันที และดู {{ref:policy:rework-approval-authority-policy}} สำหรับว่าใครมีสิทธิ์อนุมัติ rework",
      internals: {
        constants: [
          { name: "DUAL_INSPECTOR_LOCK_WINDOW_SEC", value: "30" },
          { name: "MAX_REWORK_CYCLES_BEFORE_QUARANTINE", value: "2" },
        ],
        typeSnippet:
          "interface BatchVerdict {\n  batchId: string;\n  verdict: \"pass\" | \"rework_required\" | \"quarantined\";\n  triggeredBy: string[];  // rule violation IDs\n  decidedAt: string;  // ISO 8601\n  decidedBy: \"system\" | string;  // inspectorId\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการตัดสินใจ batch ที่ {{ref:policy:batch-rejection-threshold-policy}}",
      },
    },
    {
      slug: "rework-coordinator",
      name: "rework-coordinator",
      tags: ["rework", "module"],
      description:
        "ประสานกระบวนการ rework ของ batch ที่ถูก reject จัดสรรทรัพยากรในสายรื้องาน บันทึกขั้นตอนและผู้รับผิดชอบแต่ละขั้นตอน แล้วส่งผลการ rework กลับให้ {{ref:module:batch-inspector}} ตรวจซ้ำ ออกแบบให้แยกจาก batch-inspector เพราะ workflow rework มีรายละเอียดขั้นตอนของตัวเองที่เปลี่ยนบ่อยตามประเภทผลิตภัณฑ์",
      functions: [
        { sig: "openReworkTicket(batchId: string, violationIds: string[]): Promise<ReworkTicketId>", desc: "เปิด ticket rework พร้อมระบุ violation ที่ต้องแก้" },
        { sig: "assignReworkLine(ticketId: string, lineId: string, technicianId: string): Promise<void>", desc: "มอบหมาย batch ให้สายรื้องานและช่างที่รับผิดชอบ" },
        { sig: "completeReworkStep(ticketId: string, stepId: string, outcome: StepOutcome): Promise<void>", desc: "บันทึกผลของแต่ละขั้นตอนในกระบวนการ rework" },
        { sig: "submitReworkForInspection(ticketId: string): Promise<void>", desc: "ส่ง batch ที่ rework แล้วกลับให้ batch-inspector ตรวจซ้ำ" },
      ],
      stateFlow: "open → assigned → in_rework → awaiting_inspection → closed_pass | closed_fail — ดู {{ref:policy:rework-approval-authority-policy}} สำหรับว่าใครต้องอนุมัติแต่ละ transition",
      relatedNotes:
        "ไม่มีสิทธิ์ผ่าน batch เอง — หลัง rework เสร็จต้องส่งกลับให้ {{ref:module:batch-inspector}} ตัดสินใจซ้ำเสมอ เพื่อให้มีหลักฐาน audit trail ว่า batch ผ่านการตรวจอีกรอบจริง",
    },
    {
      slug: "quarantine-manager",
      name: "quarantine-manager",
      tags: ["quarantine", "module"],
      description:
        "จัดการ hold batch ที่ถูก quarantine ติดตาม duration ของแต่ละ hold ส่ง alert เมื่อถึงกำหนดปล่อย และควบคุมการยกเลิก hold ซึ่งต้องมีผู้มีอำนาจอนุมัติเสมอ แยกออกมาเพราะ logic การ expire และ notify ของ quarantine ซับซ้อนและแยกจาก workflow ตรวจ batch",
      functions: [
        { sig: "createHold(batchId: string, reason: QuarantineReason, holdDurationHours: number): Promise<HoldId>", desc: "สร้าง hold ใหม่พร้อมกำหนด duration ตาม {{ref:policy:quarantine-hold-duration-policy}}" },
        { sig: "releaseHold(holdId: string, releasedBy: string, evidence: string): Promise<void>", desc: "ปล่อย hold หลัง rework ผ่านหรือมีเหตุผลยกเว้น ต้องระบุ evidence" },
        { sig: "listActiveHolds(productLineId?: string): Promise<Hold[]>", desc: "ดูรายการ hold ที่ยังไม่ได้ปล่อย กรองตาม product line ได้" },
        { sig: "notifyExpiringHolds(lookaheadHours: number): Promise<void>", desc: "ส่ง alert สำหรับ hold ที่ใกล้ครบกำหนดตาม lookahead window ที่กำหนด" },
      ],
      relatedNotes:
        "ไม่ตัดสินใจเองว่าควรปล่อย hold เมื่อไหร่ — รอให้ {{ref:module:rework-coordinator}} ส่งผลผ่านหรือให้ผู้มีอำนาจสั่งยกเว้นตาม {{ref:policy:quarantine-hold-duration-policy}} เท่านั้น",
    },
    {
      slug: "certification-generator",
      name: "certification-generator",
      tags: ["certification", "module"],
      description:
        "ออกใบรับรองคุณภาพสำหรับ batch ที่ผ่านการตรวจแล้วเพื่อแนบไปกับ shipment ตรวจสอบก่อนออกว่า batch อยู่ในสถานะ `pass` จริง ไม่มี active hold และใช้ template เวอร์ชันล่าสุดที่ลูกค้าปลายทางยอมรับ สร้างขึ้นเป็น service แยกเพราะ template และรูปแบบใบรับรองแตกต่างกันตามข้อกำหนดของแต่ละลูกค้าและมาตรฐาน ISO",
      functions: [
        { sig: "issueCertification(batchId: string, templateVersion: string, requestedBy: string): Promise<CertificationId>", desc: "ออกใบรับรองสำหรับ batch ที่ผ่านแล้ว ตรวจสอบ precondition ทุกข้อก่อนออก" },
        { sig: "getActiveTemplateVersion(customerId: string): string", desc: "คืนเวอร์ชัน template ล่าสุดที่ลูกค้ารายนั้นยอมรับ ดู {{ref:policy:certification-template-version-policy}}" },
        { sig: "revokeCertification(certId: string, reason: string, revokedBy: string): Promise<void>", desc: "ยกเลิกใบรับรองที่ออกไปแล้วถ้าพบปัญหาภายหลัง" },
        { sig: "verifyCertification(certId: string): Promise<VerificationResult>", desc: "ตรวจสอบความถูกต้องของใบรับรองด้วย checksum และตรวจว่ายังไม่ถูก revoke" },
      ],
      relatedNotes:
        "ถ้า batch ยังมี active hold อยู่ใน {{ref:module:quarantine-manager}} จะปฏิเสธออกใบรับรองทันทีโดยไม่มีข้อยกเว้น แม้ผู้มีอำนาจสั่งมาก็ตาม — ต้อง release hold ก่อนเสมอตาม {{ref:policy:certification-template-version-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "measurement-collector-service",
      vars: [
        { name: "MEASUREMENT_CALIBRATION_GRACE_HOURS", example: "4", note: "ดู {{ref:policy:calibration-interval-policy}}" },
        { name: "MEASUREMENT_INGEST_RATE_LIMIT", example: "200", note: "จำนวน measurement สูงสุดต่อวินาทีต่อ instrument" },
        { name: "MEASUREMENT_DB_URL", example: "postgres://qp-measurement.internal:5432/measurements", note: "secret ห้าม log" },
      ],
    },
    {
      service: "spc-analyzer-service",
      vars: [
        { name: "SPC_MIN_POINTS_FOR_LIMIT", example: "25", note: "จำนวนจุดขั้นต่ำก่อนคำนวณ control limit ได้" },
        { name: "SPC_VIOLATION_PUBLISH_TOPIC", example: "spc.violation_detected", note: "ชื่อ topic ที่ publish event เมื่อพบ violation" },
      ],
    },
    {
      service: "batch-inspector-service",
      vars: [
        { name: "BATCH_DUAL_INSPECTOR_LOCK_SEC", example: "30", note: "ดู {{ref:policy:rework-approval-authority-policy}}" },
        { name: "BATCH_MAX_REWORK_CYCLES", example: "2", note: "เกินนี้ quarantine อัตโนมัติตาม {{ref:policy:batch-rejection-threshold-policy}}" },
      ],
    },
    {
      service: "quarantine-manager-service",
      vars: [
        { name: "QUARANTINE_EXPIRY_LOOKAHEAD_HOURS", example: "8", note: "แจ้งเตือน hold ที่จะครบกำหนดในอีกกี่ชั่วโมง" },
        { name: "QUARANTINE_DEFAULT_HOLD_HOURS", example: "72", note: "ดู {{ref:policy:quarantine-hold-duration-policy}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "control-chart-rule-policy",
      title: "นโยบาย Western Electric Control Chart Rules",
      tags: ["spc", "control-chart", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:spc-analyzer}} ใช้ Western Electric rules ทั้ง 8 ข้อในการตัดสินว่า process อยู่ใน control หรือไม่ rule ทั้ง 8 ข้อมีความไวต่างกันและตรวจจับ pattern ต่างชนิดกัน ไม่ควรเปิดทุก rule พร้อมกันโดยไม่พิจารณาลักษณะของ process",
        "ค่าเริ่มต้นของระบบเปิด rule 1 (จุดเกิน 3 sigma) และ rule 2 (9 จุดติดด้านเดียวของ centerline) เสมอ rule อื่นต้องเปิดตามคำแนะนำของ quality engineer ที่รับผิดชอบ product line นั้นๆ",
      ],
      sections: [
        {
          heading: "ทำไมไม่เปิด rule ทั้ง 8 ข้อเสมอ",
          body: "rule ที่ sensitive เกินไปสำหรับ process ที่มี natural variation สูงจะสร้าง false alarm มากเกินจน QC team ชินชาและเริ่มเพิกเฉย บทเรียนจาก {{ref:incident:spc-rule-misconfiguration-missed-defect}} คือการเปิด rule ผิดตัวทำให้พลาด defect จริง",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Control Chart Rule สำหรับ Process ที่เพิ่งเริ่ม",
        tags: ["spc", "control-chart", "edge-case"],
        body: [
          "สำหรับ product line ที่เพิ่งเริ่มเดินสายและยังไม่มีข้อมูลประวัติ 25 จุดตามที่ {{ref:module:spc-analyzer}} ต้องการ ระบบจะใช้ provisional control limit จาก product line ที่ใกล้เคียงที่สุดชั่วคราว พร้อม flag ทุก result ว่า \"provisional\" เพื่อให้ QC engineer ทราบว่าตัวเลขยังไม่ stable",
          "เมื่อสะสมข้อมูลครบ 25 จุดแล้ว ระบบจะ recalculate control limit ใหม่จากข้อมูลจริงและลบ flag provisional ออก ไม่มีการ backfill violation เพราะการตัดสินใจในช่วง provisional ถือว่าทำภายใต้ข้อมูลที่มีในขณะนั้น",
        ],
      },
    },
    {
      slug: "batch-rejection-threshold-policy",
      title: "นโยบายเกณฑ์การ Reject Batch",
      tags: ["batch", "rejection", "policy"],
      isPrimary: true,
      intro: [
        "batch จะถูก reject และส่ง rework เมื่อ {{ref:module:spc-analyzer}} ตรวจพบ violation ระดับ `action` อย่างน้อย 1 จุด หรือ violation ระดับ `warning` เกิน 3 จุดติดต่อกัน ทั้งสองกรณีถือว่า process ไม่อยู่ใน statistical control",
        "batch จะถูก quarantine ทันที (ข้าม rework) เมื่อจำนวน violation เกิน threshold พิเศษที่กำหนดไว้ต่อ product line หรือเมื่อ batch เดิมเข้า rework มาแล้วเกิน `BATCH_MAX_REWORK_CYCLES` รอบ",
      ],
      edgeCase: {
        title: "กรณี Batch บางส่วนออกนอกสเปกเฉพาะช่วงเวลา",
        tags: ["batch", "rejection", "edge-case"],
        body: [
          "ถ้า violation กระจุกอยู่ในช่วงเวลาสั้นๆ ภายใน run (เช่น 10 นาทีแรกขณะ machine warm-up) และส่วนที่เหลือของ run อยู่ใน control ปกติ QC engineer สามารถขอ partial release เพื่อปล่อยเฉพาะ unit ที่ผลิตในช่วงที่ process stable แล้ว โดยต้องมี evidence ชัดเจนว่า violation จำกัดอยู่ในช่วงเวลานั้นจริง",
          "partial release ต้องผ่านการอนุมัติจาก QC Manager (ไม่ใช่ QC Engineer ทั่วไป) และต้องบันทึก lot traceability แยกระหว่าง unit ที่ปล่อยกับ unit ที่ rework ให้ชัดเจน ดู {{ref:policy:rework-approval-authority-policy}} สำหรับระดับอำนาจ",
        ],
      },
    },
    {
      slug: "rework-approval-authority-policy",
      title: "นโยบายอำนาจการอนุมัติ Rework",
      tags: ["rework", "authority", "policy"],
      isPrimary: true,
      intro: [
        "การอนุมัติ rework แต่ละระดับต้องผ่านผู้มีอำนาจที่ต่างกัน QC Engineer อนุมัติ rework ทั่วไปที่ violation ไม่เกิน threshold พิเศษ QC Manager อนุมัติ rework ที่ violation เกิน threshold หรือ rework รอบที่ 2 Shift Director อนุมัติเฉพาะ quarantine release หรือ emergency shipment",
        "{{ref:module:batch-inspector}} บล็อกไม่ให้ผู้ตรวจคนเดียวอนุมัติ rework ของ batch ที่ตัวเองตรวจรอบแรก เพื่อ prevent conflict of interest ดู `BATCH_DUAL_INSPECTOR_LOCK_SEC` สำหรับ window ที่บล็อก",
      ],
      sections: [
        {
          heading: "ทำไมบล็อก self-approval",
          body: "เคยมีเหตุการณ์ที่ผู้ตรวจคนเดียวกันอนุมัติ rework ของ batch ที่ตัวเองพิจารณาว่า reject ทำให้ไม่มี independent check ดู {{ref:incident:dual-inspector-rework-approval}} สำหรับรายละเอียด",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นกรณีผู้ตรวจคนเดียวที่ shift ว่าง",
        tags: ["rework", "authority", "edge-case"],
        body: [
          "ในกะกลางคืนหรือวันหยุดที่มีผู้ตรวจเพียงคนเดียวในสายนั้น ระบบยังคง enforce ว่าต้องมีผู้อนุมัติคนที่สอง แต่อนุญาตให้ผู้ตรวจจาก product line อื่น (ภายในโรงงานเดียวกัน) เข้ามาทำหน้าที่เป็น second approver ได้แทน",
          "ถ้าไม่มีผู้ตรวจคนที่สองเลยและ batch มี deadline ส่ง QC Manager สามารถอนุมัติ temporary override ผ่าน system ได้ แต่ต้องบันทึกเหตุผลและแจ้งทีม QA ทันทีเพื่อ review ใน audit ถัดไป — ไม่สามารถ override เงียบๆ ได้",
        ],
      },
    },
    {
      slug: "quarantine-hold-duration-policy",
      title: "นโยบายระยะเวลา Quarantine Hold",
      tags: ["quarantine", "hold", "policy"],
      isPrimary: true,
      intro: [
        "batch ที่ถูก quarantine จะมี hold duration เริ่มต้นที่ `QUARANTINE_DEFAULT_HOLD_HOURS` (ค่าเริ่มต้น 72 ชั่วโมง) โดยนับจากเวลาที่สร้าง hold ไม่ใช่เวลาที่ rework เสร็จ hold จะไม่หมดอายุอัตโนมัติ — ต้องมีผู้มีอำนาจ release ด้วยมือเสมอ",
        "{{ref:module:quarantine-manager}} จะส่ง alert เมื่อ hold เหลืออีก `QUARANTINE_EXPIRY_LOOKAHEAD_HOURS` ชั่วโมงก่อนครบกำหนด เพื่อให้ผู้รับผิดชอบเตรียม evidence สำหรับการ release",
      ],
      edgeCase: {
        title: "กรณี Quarantine Hold ที่ Rework เสร็จแล้วแต่ยังไม่ได้ Release",
        tags: ["quarantine", "hold", "edge-case"],
        body: [
          "ถ้า rework ผ่านการตรวจจาก {{ref:module:batch-inspector}} แล้ว แต่ผู้มีอำนาจยังไม่ release hold ภายใน 24 ชั่วโมงหลัง rework ผ่าน ระบบจะส่ง escalation alert ไปยัง QC Manager โดยอัตโนมัติ เพราะ hold ที่ค้างหลัง rework เสร็จมักเกิดจากลืม ไม่ใช่ตั้งใจ",
          "ระบบจะไม่ release hold เองแม้ rework จะผ่านแล้ว — human decision ยังคงจำเป็นสำหรับ quarantine release ทุกกรณีโดยไม่มีข้อยกเว้น เพราะบางครั้งมีข้อมูลนอกระบบที่ต้องพิจารณาร่วมด้วย",
        ],
      },
    },
    {
      slug: "certification-template-version-policy",
      title: "นโยบายเวอร์ชัน Template ใบรับรอง",
      tags: ["certification", "template", "policy"],
      isPrimary: true,
      intro: [
        "ใบรับรองแต่ละใบต้องใช้ template เวอร์ชันที่ลูกค้าปลายทางยอมรับ ไม่ใช่ template เวอร์ชันล่าสุดเสมอไป เพราะลูกค้าบางรายต้องผ่านการตรวจสอบภายในของตัวเองก่อนจะอัปเดต approved template version",
        "{{ref:module:certification-generator}} เก็บ mapping ระหว่าง `customerId` กับ `templateVersion` ที่ approved สำหรับลูกค้าแต่ละราย ถ้า template version ที่ร้องขอไม่อยู่ใน approved list จะ reject ทันที",
      ],
      edgeCase: {
        title: "กรณีลูกค้า Approve Template เวอร์ชันใหม่ระหว่าง Shipment ค้างอยู่",
        tags: ["certification", "template", "edge-case"],
        body: [
          "ถ้าลูกค้า approve template version ใหม่ในขณะที่มี batch รอ certification อยู่แล้ว batch เหล่านั้นยังคงใช้ template version ที่ approved ณ เวลาที่ขอ certification ได้ ไม่บังคับให้ reissue ด้วย version ใหม่",
          "ยกเว้นกรณีที่ template version เก่าถูก revoke ออกจาก approved list (ไม่ใช่แค่เพิ่ม version ใหม่เข้ามา) — กรณีนี้ batch ที่ยังไม่ได้รับ certification ต้องรอจนกว่าจะออก certification ด้วย version ที่ยังอยู่ใน approved list เท่านั้น",
        ],
      },
    },
    {
      slug: "calibration-interval-policy",
      title: "นโยบายช่วงเวลาการ Calibrate เครื่องมือวัด",
      tags: ["calibration", "instrument", "policy"],
      isPrimary: true,
      intro: [
        "เครื่องมือวัดทุกตัวต้อง calibrate ตามช่วงเวลาที่กำหนดในทะเบียน instrument ซึ่งแตกต่างกันตาม type ของเครื่องมือและความแม่นยำที่ต้องการ โดยทั่วไปอยู่ระหว่าง 30-90 วัน {{ref:module:measurement-collector}} ติดตาม due date ของแต่ละตัวและ flag เมื่อใกล้ถึงกำหนด",
        "เครื่องมือที่ calibration เกินกำหนดเกิน `CALIBRATION_GRACE_PERIOD_HOURS` จะถูกระงับรับข้อมูลอัตโนมัติ — ข้อมูลที่รับก่อน grace period หมดยังใช้ได้ แต่ข้อมูลหลังจากนั้นต้องทิ้ง",
      ],
      edgeCase: {
        title: "กรณีเครื่องมือ Calibrate ไม่ทันและสายผลิตยังเดิน",
        tags: ["calibration", "instrument", "edge-case"],
        body: [
          "ถ้าเครื่องมือ calibration เกินกำหนดแต่ยังไม่เกิน grace period และไม่มีเครื่องสำรองทดแทนได้ทันที ระบบจะยังรับข้อมูลต่อแต่ flag measurement ทุกรายการว่า \"pre-suspension\" เพื่อให้ QC engineer ตัดสินใจว่าจะใช้ข้อมูลนั้นหรือไม่",
          "การตัดสินใจใช้ข้อมูล \"pre-suspension\" ต้องบันทึกเหตุผลและผ่านการอนุมัติจาก QC Manager เสมอ ห้าม pass batch โดยอิงข้อมูลจากเครื่องที่เลย grace period ไปแล้วโดยเด็ดขาด",
        ],
      },
    },
    {
      slug: "measurement-sampling-policy",
      title: "นโยบายการ Sampling ข้อมูลวัด",
      tags: ["measurement", "sampling", "policy"],
      isPrimary: false,
      intro: [
        "สำหรับ process ที่มีข้อมูลวัดความถี่สูงเกิน 100 จุดต่อนาที ระบบจะ sample ข้อมูลก่อนส่งให้ {{ref:module:spc-analyzer}} ประมวลผล เพื่อป้องกัน SPC chart มีจุดหนาแน่นเกินจนอ่านไม่ออก",
        "sampling rate กำหนดต่อ product line โดย QC Engineer และบันทึกไว้ใน process parameter ห้ามเปลี่ยน sampling rate ระหว่าง active run เพราะจะทำให้ statistical property ของ chart เปลี่ยนกลางทาง",
      ],
    },
    {
      slug: "out-of-spec-escalation-policy",
      title: "นโยบาย Escalation เมื่อ Out-of-Spec ต่อเนื่อง",
      tags: ["escalation", "out-of-spec", "policy"],
      isPrimary: false,
      intro: [
        "ถ้า product line เดิมมี batch ถูก reject เกิน 3 batch ติดต่อกันภายใน 8 ชั่วโมง ระบบจะ escalate ไปยัง Production Manager เพื่อพิจารณาหยุดสายผลิตชั่วคราว เพราะ pattern นี้มักบ่งชี้ว่า root cause อยู่ที่ process ไม่ใช่แค่ batch ผิดปกติเดี่ยวๆ",
        "การ escalate เป็นการแจ้งเท่านั้น ไม่ใช่การหยุดสายอัตโนมัติ — Production Manager ต้องตัดสินใจว่าจะหยุดหรือดำเนินต่อ",
      ],
    },
    {
      slug: "inspection-record-retention-policy",
      title: "นโยบายการเก็บรักษาบันทึกการตรวจ",
      tags: ["retention", "records", "policy"],
      isPrimary: false,
      intro: [
        "บันทึกการตรวจและผล SPC ทุกรายการต้องเก็บไว้อย่างน้อย 5 ปี ตามข้อกำหนด ISO 9001 ข้อมูลที่เก็บครบ 5 ปีสามารถ archive ไปยัง cold storage แทน ลบทิ้งไม่ได้ เพราะอาจถูกร้องขอในกระบวนการ audit หรือ warranty claim ย้อนหลัง",
        "ใบรับรองที่ออกแล้วต้องเก็บไว้ตลอดอายุการใช้งานของผลิตภัณฑ์นั้นบวก 2 ปีเพิ่มเติม ดู {{ref:deployment:certification-archive-runbook}} สำหรับกระบวนการ archive",
      ],
    },
    {
      slug: "rework-limit-policy",
      title: "นโยบายขีดจำกัดรอบ Rework",
      tags: ["rework", "limit", "policy"],
      isPrimary: false,
      intro: [
        "batch หนึ่งชิ้นเข้า rework ได้สูงสุด `BATCH_MAX_REWORK_CYCLES` รอบ หลังจากนั้นถ้ายังไม่ผ่านจะถูก quarantine อัตโนมัติโดยไม่มีข้อยกเว้น เพราะการ rework ซ้ำซ้อนมักสร้างความเสียหายเพิ่มและเพิ่มต้นทุนโดยไม่ได้ผล",
        "รอบ rework นับแบบ cumulative ต่อ batch_id เดียวกัน แม้ผู้อนุมัติ rework แต่ละรอบจะต่างกัน",
      ],
    },
    {
      slug: "shipment-hold-policy",
      title: "นโยบายการระงับ Shipment เมื่อพบปัญหา",
      tags: ["shipment", "hold", "policy"],
      isPrimary: false,
      intro: [
        "ถ้า {{ref:module:quarantine-manager}} มี active hold สำหรับ batch ใดๆ ใน shipment นั้น ระบบจะ block การออก shipping document ทันที แม้ batch อื่นใน shipment จะผ่านการตรวจแล้วก็ตาม",
        "สามารถขอแยก batch ที่ hold ออกจาก shipment แทนที่จะรอให้ hold ครบทุกอัน โดยต้องได้รับการอนุมัติจาก Sales Manager และ QC Manager พร้อมกัน เพื่อไม่ให้ฝ่ายขายปลด hold โดยไม่มีฝ่าย QC เห็นด้วย",
      ],
    },
  ],
  incidents: [
    {
      slug: "sensor-drift-false-alarm",
      title: "Sensor drift ทำให้ SPC ส่ง false alarm ตลอดกะ",
      tags: ["sensor", "spc", "false-alarm"],
      summary:
        "กะเช้าวันหนึ่งทีม QC ได้รับ violation alert จาก {{ref:module:spc-analyzer}} ต่อเนื่องทุก 5 นาทีตลอด 3 ชั่วโมง ทั้งที่ผู้ควบคุมสายผลิตยืนยันว่า process ปกติดี",
      investigation:
        "ตรวจสอบ {{ref:module:measurement-collector}} พบว่าค่าที่ instrument ID QP-003 ส่งมาค่อยๆ drift ขึ้นอย่างสม่ำเสมอตั้งแต่ต้นกะ ไม่ใช่ noise สุ่ม ซึ่งทำให้ Western Electric rule 2 ตรวจจับได้ (9 จุดติดด้านเดียวกันของ centerline)",
      cause:
        "เซ็นเซอร์อุณหภูมิ QP-003 มี thermal drift หลังทำงานนานเกิน 6 ชั่วโมงโดยไม่ cool down ซึ่งเกินอายุ calibration cycle ที่กำหนดใน {{ref:policy:calibration-interval-policy}} ไปแล้ว 4 วัน แต่ระบบยังรับข้อมูลจากตัวนั้นอยู่เพราะยังอยู่ใน grace period",
      resolution:
        "ระงับ instrument QP-003 ด้วยมือและแทนที่ด้วยเซ็นเซอร์สำรอง รัน SPC ใหม่ด้วยข้อมูลจากเซ็นเซอร์ใหม่ ยืนยันว่า process อยู่ใน control จริง ยกเลิก violation alert ทั้งหมดของกะนั้น",
      followup:
        "เพิ่ม alert สำหรับ instrument ที่ค่า drift เกิน threshold (ค่าเพิ่มเกิน X% ต่อชั่วโมงอย่างสม่ำเสมอ) แม้ยังอยู่ใน calibration interval เพื่อตรวจจับ drift ก่อนที่ grace period จะหมด",
    },
    {
      slug: "quarantine-not-released-after-rework",
      title: "Batch ค้าง quarantine หลัง rework ผ่านแล้ว 2 วัน",
      tags: ["quarantine", "rework", "hold"],
      summary:
        "ฝ่ายขายแจ้งว่า shipment ที่ควรส่งได้ถูก block โดย {{ref:module:quarantine-manager}} ทั้งที่ QC team ยืนยันว่า rework ผ่านไปตั้งแต่ 2 วันก่อนแล้ว",
      investigation:
        "ตรวจ log {{ref:module:batch-inspector}} ยืนยันว่า batch ผ่าน rework inspection จริงเมื่อ 48 ชั่วโมงที่แล้ว แต่ {{ref:module:quarantine-manager}} ยังมี active hold อยู่เพราะยังไม่มีใคร call `releaseHold` ด้วยมือ",
      cause:
        "ระบบ escalation alert ที่ควร notify เมื่อ rework ผ่านแล้วแต่ hold ยังไม่ release ไม่ทำงานเพราะ `QUARANTINE_EXPIRY_LOOKAHEAD_HOURS` ที่ตั้งไว้ไม่ครอบคลุม scenario นี้ (alert ส่งตาม hold expiry เท่านั้น ไม่ส่งตาม rework completion)",
      resolution:
        "QC Manager release hold ด้วยมือทันที หลังยืนยัน evidence จาก batch inspector log Shipment ออกไปได้ภายใน 2 ชั่วโมงหลังพบปัญหา",
      followup:
        "เพิ่ม alert แยกสำหรับ hold ที่ batch ผ่าน rework แล้วแต่ยังไม่ release เกิน 24 ชั่วโมง ตาม {{ref:policy:quarantine-hold-duration-policy}}",
    },
    {
      slug: "dual-inspector-rework-approval",
      title: "ผู้ตรวจคนเดียวอนุมัติ rework batch ที่ตัวเอง reject ไว้",
      tags: ["rework", "authority", "bug"],
      summary:
        "ระบบบันทึกว่า Inspector A อนุมัติ rework ของ batch QP-2024-0815 ซึ่งก็คือ Inspector A คนเดียวกันกับที่เป็นคน reject batch นั้นเพียง 20 นาทีก่อนหน้า",
      investigation:
        "ตรวจสอบ `recordInspectionResult` ใน {{ref:module:batch-inspector}} พบว่า lock ที่ป้องกัน self-approval (`BATCH_DUAL_INSPECTOR_LOCK_SEC`) หมดอายุไปแล้วก่อนที่ Inspector A จะกดอนุมัติ rework lock ตั้งไว้แค่ 30 วินาทีซึ่งสั้นเกินไป",
      cause:
        "ค่า `BATCH_DUAL_INSPECTOR_LOCK_SEC` ออกแบบมาสำหรับ prevent race condition ระยะสั้น ไม่ได้ออกแบบมาเป็น workflow approval guard ที่ต้องอยู่นานพอให้ผู้ตรวจคนที่สองมาทำงาน",
      resolution:
        "ยกเลิก rework approval นั้นด้วยมือ และ override ให้ Inspector B เป็นผู้อนุมัติแทนตาม {{ref:policy:rework-approval-authority-policy}} แล้ว re-inspect batch",
      followup:
        "แก้ logic บล็อก self-approval ให้ผูกกับ batch_id + inspector_id โดยไม่มีวันหมดอายุ แทนที่จะใช้ time window สั้นๆ",
    },
    {
      slug: "certification-before-checks-complete",
      title: "ใบรับรองออกก่อนที่การตรวจทั้งหมดจะสมบูรณ์",
      tags: ["certification", "bug"],
      summary:
        "ลูกค้าปลายทางแจ้งว่าใบรับรองที่แนบมากับ shipment อ้างอิง batch ที่ตาม audit trail ยังอยู่ในสถานะ `rework_required` ณ เวลาที่ certificate ออก",
      investigation:
        "ตรวจ log {{ref:module:certification-generator}} พบว่า `issueCertification` ถูกเรียกสำเร็จ แต่ตอนที่เรียกนั้น batch-inspector ยังอัปเดตสถานะ batch ไม่เสร็จ เพราะสองการกระทำเกิดขึ้นห่างกันเพียง 200 มิลลิวินาที",
      cause:
        "การตรวจสอบสถานะ batch ใน `issueCertification` อ่านจาก replica database ที่มี replication lag สั้นๆ ทำให้เห็นสถานะเก่า (pass จากรอบก่อนหน้า) แทนที่จะเห็นสถานะล่าสุด (rework_required)",
      resolution:
        "Revoke ใบรับรองนั้นทันที แจ้งลูกค้าและออกใบรับรองใหม่หลัง batch ผ่านการตรวจจริง แก้ `issueCertification` ให้อ่านจาก primary database เสมอสำหรับ precondition check",
      followup:
        "เพิ่ม integration test ที่จำลอง replication lag ก่อน certification เพื่อกัน regression",
    },
    {
      slug: "calibration-overdue-data-collection",
      title: "เครื่องมือที่ calibration เกินกำหนดยังเก็บข้อมูลอยู่",
      tags: ["calibration", "instrument", "data-quality"],
      summary:
        "QA audit พบว่า production run RP-20240901 มีข้อมูลวัดจาก instrument QP-017 ซึ่ง calibration เกินกำหนดไปแล้ว 9 วัน ณ วันที่เก็บข้อมูล",
      investigation:
        "ตรวจ {{ref:module:measurement-collector}} พบว่า `flagInstrumentOverdue` ไม่ถูกเรียกสำหรับ QP-017 เพราะ scheduled job ที่ตรวจ due date ของ instrument ล้มเหลวโดยไม่มี alert ส่งออกมา",
      cause:
        "scheduled job ใช้ connection pool ร่วมกับ ingest path หลัก ช่วง active run ที่ connection pool เต็ม job จะ timeout เงียบๆ แทนที่จะ retry หรือ alert",
      resolution:
        "แยก connection pool ให้ calibration check job ใช้เอง และ mark ข้อมูลของ run RP-20240901 ว่า \"suspect\" เพื่อ QC Engineer review ว่าต้อง re-run หรือไม่",
      followup:
        "เพิ่ม dead-man alert สำหรับ calibration check job: ถ้า job ไม่ run สำเร็จภายในช่วงเวลาที่กำหนด ให้แจ้ง on-call ทันที",
    },
    {
      slug: "spc-rule-misconfiguration-missed-defect",
      title: "ตั้ง SPC rule ผิดทำให้พลาด defect จริง",
      tags: ["spc", "configuration", "defect"],
      summary:
        "พบ defect rate สูงผิดปกติใน batch ของ product line PL-07 หลังออก shipment ไปแล้ว ลูกค้าร้องเรียนว่าสินค้ามีขนาดเกินสเปก",
      investigation:
        "ตรวจสอบย้อนหลังพบว่า SPC chart ของ PL-07 ตั้ง rule 1 ไว้ที่ 3.5 sigma แทนที่จะเป็น 3 sigma ตาม {{ref:policy:control-chart-rule-policy}} ทำให้จุดที่ควร flag ว่า out of control ไม่ถูกตรวจจับ",
      cause:
        "ตอน migrate process parameter จาก system เก่ามาสู่ QualityPulse ผู้ตั้งค่าคัดลอก sigma threshold ผิดจากเอกสาร process spec ของ PL-07 ที่ใช้หน่วยต่างกัน",
      resolution:
        "แก้ sigma threshold กลับเป็น 3 ตามมาตรฐาน และ re-analyze ข้อมูลย้อนหลัง 30 วันด้วย parameter ที่ถูกต้องเพื่อประเมินขนาดของปัญหา",
      followup:
        "เพิ่มขั้นตอน peer review สำหรับการเปลี่ยน process parameter ทุกครั้ง โดยเฉพาะ sigma threshold และ sampling rate",
    },
    {
      slug: "batch-rejection-threshold-mismatch",
      title: "Threshold ของ product line สองตัวสลับกันในระบบ",
      tags: ["batch", "configuration", "rejection"],
      summary:
        "QC Engineer สังเกตว่า batch ของ product line PL-03 ถูก quarantine เร็วกว่าปกติมากในสัปดาห์นั้น ทั้งที่ process ไม่ได้เปลี่ยน",
      investigation:
        "ตรวจสอบ process parameter ของ PL-03 และ PL-04 พบว่า `MAX_REWORK_CYCLES` ของทั้งสองถูก assign สลับกัน PL-03 (product ที่ rework ยากกว่า) ได้รับค่าที่ต่ำกว่าของ PL-04",
      cause:
        "deployment script ที่ import parameter ใช้ positional column จาก CSV แทน named column ทำให้ตอน column ใน CSV ถูก reorder ค่าถูก import ผิด product line",
      resolution:
        "swap parameter กลับให้ถูก product line และ re-evaluate batch ที่ถูก quarantine เร็วเกินไปในสัปดาห์นั้น",
      followup:
        "เปลี่ยน import script ให้ใช้ named column เสมอ และเพิ่ม validation ตรวจว่า product line ID ใน CSV ตรงกับที่ระบุใน target environment",
    },
    {
      slug: "rework-coordinator-queue-overflow",
      title: "คิว rework ล้นหลัง machine หลักหยุดชั่วคราว",
      tags: ["rework", "queue", "capacity"],
      summary:
        "หลัง machine หลักของสายผลิต PL-02 หยุดซ่อม 4 ชั่วโมง มี batch ค้างรอ rework พุ่งขึ้นจาก 3 เป็น 47 batch พร้อมกันทันทีที่ machine กลับมา",
      investigation:
        "ตรวจ {{ref:module:rework-coordinator}} พบว่า rework line สำรองมีความจุ 5 batch พร้อมกัน และคิวของ `openReworkTicket` ไม่มี backpressure mechanism ทำให้รับ ticket ไม่จำกัดแม้ rework line จะเต็ม",
      cause:
        "ออกแบบ rework-coordinator สำหรับ steady-state load ไม่ได้คำนึงถึง burst หลัง outage ซึ่งสร้าง batch backlog ขนาดใหญ่พร้อมกัน",
      resolution:
        "ระงับการสร้าง ticket ใหม่ชั่วคราว แล้วค่อยๆ ดึง batch เข้า rework ตามความจุของสาย ใช้เวลาประมาณ 6 ชั่วโมงกว่าจะ clear backlog",
      followup:
        "เพิ่ม capacity check ก่อน `openReworkTicket` และ alert เมื่อ ticket queue เกิน 80% ของ rework line capacity",
    },
    {
      slug: "quarantine-expiry-silent",
      title: "Quarantine hold หมดอายุโดยไม่มี alert ส่งออก",
      tags: ["quarantine", "alert", "hold"],
      summary:
        "QC Manager พบว่า batch หนึ่งยัง hold อยู่นานกว่า default duration มากโดยไม่มีใครได้รับ expiry alert ที่ควรจะส่งออกมาก่อนหมดอายุ",
      investigation:
        "ตรวจ log {{ref:module:quarantine-manager}} พบว่า `notifyExpiringHolds` ถูก call ปกติแต่ไม่มี batch นั้นในรายการที่ query ออกมา เพราะ query กรองเฉพาะ hold ที่ status = 'active' แต่ hold ของ batch นั้นถูก mark เป็น 'pending_release' โดยอัตโนมัติจาก event ที่ไม่ได้ตั้งใจ",
      cause:
        "event handler ที่รับ `rework.approved` พยายาม pre-mark hold เป็น 'pending_release' ก่อนที่จะมีการ call `releaseHold` จริง ทำให้หลุดออกจาก query ของ expiry notification",
      resolution:
        "Release hold ด้วยมือ และ revert logic pre-marking ออก hold จะอยู่ในสถานะ 'active' จนกว่าจะถูก release จริงเท่านั้น",
      followup:
        "เพิ่ม test ที่ตรวจว่า expiry alert ยังส่งได้สำหรับ hold ทุก status ยกเว้น 'released'",
    },
    {
      slug: "sensor-drift-gradual-trend",
      title: "Sensor drift ค่อยๆ สะสมโดยไม่ trigger rule จนกว่าจะนาน",
      tags: ["sensor", "drift", "trend"],
      summary:
        "batch ของ product line PL-05 มี dimension เกินสเปกมาหลายสัปดาห์ก่อนที่ SPC จะ flag ทั้งที่ข้อมูลวัดถูกส่งเข้าระบบตลอด",
      investigation:
        "วิเคราะห์ข้อมูลย้อนหลังพบว่า sensor QP-021 drift ขึ้น 0.02 mm ต่อสัปดาห์อย่างช้าๆ ซึ่งต่ำกว่า threshold ของ rule ทุกข้อในแต่ละช่วงเวลา แต่สะสมเกิน 0.1 mm ในเดือนเดียว",
      cause:
        "Western Electric rules ออกแบบมาตรวจ change แบบเฉียบพลัน ไม่ใช่ drift ระยะยาว process ที่มี drift ช้าต้องการ trend chart (CUSUM หรือ EWMA) เพิ่มเติมที่ระบบยังไม่มี",
      resolution:
        "calibrate sensor QP-021 ใหม่ และ rework batch ที่ได้รับผลกระทบในช่วง 4 สัปดาห์ที่ผ่านมา",
      followup:
        "เพิ่ม CUSUM chart สำหรับ product line ที่มีความเสี่ยง drift สูง เป็น feature request ใน backlog ของ {{ref:module:spc-analyzer}}",
    },
    {
      slug: "wrong-template-certification-issued",
      title: "ออกใบรับรองด้วย template ที่ลูกค้าไม่ approved",
      tags: ["certification", "template", "error"],
      summary:
        "ลูกค้ารายหนึ่งปฏิเสธ shipment เพราะใบรับรองใช้ template v3.1 ทั้งที่ลูกค้ารายนั้น approved เฉพาะ v2.8 เท่านั้น",
      investigation:
        "ตรวจ {{ref:module:certification-generator}} พบว่า `getActiveTemplateVersion` คืนค่า v3.1 ซึ่งเป็น global default ใหม่ แทนที่จะคืนเวอร์ชันเฉพาะของลูกค้า เพราะ customer-specific mapping ถูก overwrite โดย migration script",
      cause:
        "migration script ที่ rollout global template v3.1 ลบ customer-specific overrides ทั้งหมดออกโดยไม่ตั้งใจ เพราะ logic merge ไม่ handle กรณีที่ override และ default อยู่ใน table เดียวกัน",
      resolution:
        "Revoke ใบรับรองที่ออกผิด restore customer-specific template mapping จาก backup และออกใบรับรองใหม่ด้วย v2.8",
      followup:
        "เพิ่ม pre-migration test ตรวจว่า customer-specific override ยังอยู่ครบหลัง migration และ alert เมื่อ template version ของลูกค้าเปลี่ยนโดยไม่มีคนสั่ง",
    },
    {
      slug: "uncalibrated-replacement-instrument",
      title: "เครื่องมือวัดสำรองที่ยังไม่ calibrate เข้ามาแทนที่ทันที",
      tags: ["calibration", "instrument", "replacement"],
      summary:
        "หลังเซ็นเซอร์ QP-008 เสียและถูกถอดออก ช่างนำเซ็นเซอร์สำรอง QP-008B มาใส่แทนทันทีโดยไม่แจ้งระบบ พบว่า QP-008B ไม่เคยถูก calibrate ในระบบมาก่อนเลย",
      investigation:
        "ตรวจ instrument registry ใน {{ref:module:measurement-collector}} พบว่า QP-008B ไม่มีประวัติ calibration ใดๆ และไม่มี instrument profile ในระบบ แต่ระบบยังยอมรับ measurement จาก instrument ID นั้นเพราะไม่มี validation ว่า instrument ต้องอยู่ใน registry ก่อน",
      cause:
        "ออกแบบ `ingestMeasurement` ให้ check calibration status แต่ถ้า instrument ไม่อยู่ใน registry จะได้รับค่า default เป็น valid แทนที่จะ reject ทันที",
      resolution:
        "ระงับ QP-008B ด้วยมือ calibrate ให้ถูกต้องก่อนนำกลับมาใช้ และ mark measurement ที่รับมาจาก QP-008B โดยไม่มี calibration ว่า invalid ทั้งหมด",
      followup:
        "แก้ `ingestMeasurement` ให้ reject measurement จาก instrument ที่ไม่อยู่ใน registry ทันที ไม่ใช่ default เป็น valid",
    },
    {
      slug: "out-of-spec-batch-released-early",
      title: "Batch ที่ยังอยู่ใน rework ถูก release ออกไปใน shipment",
      tags: ["batch", "shipment", "bug"],
      summary:
        "Shipping team แจ้งว่า batch QP-20240922-014 ถูก include ใน shipment ทั้งที่ QC ยืนยันว่า batch นั้นยังอยู่ระหว่าง rework",
      investigation:
        "ตรวจ batch status log พบว่า shipment document generator query batch list จาก read replica ที่มี lag 90 วินาที ในช่วงนั้น status ของ batch ยังเป็น 'pass' จาก inspection รอบแรกก่อน QC จะ rework flag ทัน",
      cause:
        "shipment document generator ใช้ read replica เดียวกับ report query ทั่วไป เพื่อ reduce load บน primary ทำให้อาจเห็น stale batch status",
      resolution:
        "ดึง batch นั้นออกจาก shipment ทัน ก่อนส่งจริง และแก้ให้ shipment document generator อ่านจาก primary สำหรับ batch status check",
      followup:
        "กำหนด policy ชัดเจนว่า query ไหนต้องใช้ primary เสมอ และ query ไหนรับ replica lag ได้",
    },
    {
      slug: "spc-parameters-stale-after-process-change",
      title: "Process parameter ของ SPC ไม่ได้อัปเดตหลัง process change",
      tags: ["spc", "configuration", "process-change"],
      summary:
        "หลังทีม engineering ปรับ process ของสาย PL-06 เพื่อลด cycle time control limit ของ SPC ยังใช้ parameter เก่า ทำให้ alarm rate เพิ่มขึ้น 300% โดยไม่มีของจริงเสียหายเลย",
      investigation:
        "เปรียบเทียบ SPC parameter ใน {{ref:module:spc-analyzer}} กับ process spec ฉบับใหม่ พบว่า engineering ส่ง change request ให้ QC แต่ QC team อัปเดต process spec เฉพาะในเอกสาร Word ไม่ได้ update ผ่าน `updateProcessParameters` ในระบบ",
      cause:
        "ไม่มีขั้นตอน mandatory ที่บังคับให้ update SPC parameter ในระบบเป็นส่วนหนึ่งของ process change workflow ทำให้ขึ้นอยู่กับว่า QC จะจำทำหรือไม่",
      resolution:
        "อัปเดต SPC parameter ให้ตรงกับ process spec ใหม่ recalculate control limit และ dismiss false alarm ทั้งหมดในช่วง 2 สัปดาห์หลัง process change",
      followup:
        "เพิ่ม step ที่บังคับ update SPC parameter ใน {{ref:convention:inspection-report-naming}} checklist สำหรับ process change ทุกครั้ง",
    },
  ],
  conventions: [
    {
      slug: "batch-id-format",
      title: "Batch ID Format",
      tags: ["naming", "batch"],
      sections: [
        { heading: "รูปแบบ", body: "`QP-<YYYYMMDD>-<เลขลำดับ 3 หลัก>` เช่น `QP-20240901-014` วันที่คือวันที่เปิด production run ไม่ใช่วันที่ finish" },
        { heading: "กติกา", body: "เลขลำดับ reset เป็น 001 ทุกวัน batch ที่ถูก split ออกจาก batch หลักใช้ suffix `-A`, `-B` เช่น `QP-20240901-014-A` เพื่อให้ traceability ยังเชื่อมกลับต้นทางได้" },
      ],
    },
    {
      slug: "measurement-unit-convention",
      title: "Measurement Unit Convention",
      tags: ["measurement", "unit"],
      intro: "เครื่องมือวัดแต่ละรุ่นอาจส่งข้อมูลในหน่วยต่างกัน — convention นี้กำหนดว่าต้องแปลงหน่วยก่อนส่งเข้า {{ref:module:measurement-collector}} เสมอ",
      sections: [
        { heading: "หน่วยมาตรฐาน", body: "มิติ: มิลลิเมตร (mm) ความดัน: kPa อุณหภูมิ: องศาเซลเซียส (°C) น้ำหนัก: กรัม (g) ห้ามส่งหน่วยอื่นเข้าระบบแม้ instrument จะวัดในหน่วยอื่น" },
        { heading: "การแปลงหน่วย", body: "ทำใน adapter layer ของ instrument ก่อนส่งเข้า API ไม่ทำในระบบกลาง เพราะ conversion factor ของแต่ละรุ่น instrument ต่างกัน" },
      ],
    },
    {
      slug: "spc-chart-naming",
      title: "SPC Chart Naming",
      tags: ["spc", "naming"],
      sections: [
        { heading: "รูปแบบ", body: "`<product-line-id>_<characteristic>_<chart-type>` เช่น `PL03_diameter_xbar`, `PL03_diameter_r` — chart type ใช้ lowercase เสมอ: `xbar`, `r`, `p`, `c`, `cusum`" },
        { heading: "Characteristic code", body: "ต้องตรงกับ Drawing Characteristic Number (DCN) ในแบบทางวิศวกรรม ไม่ใช่ชื่อเรียกภายในที่สั้นกว่า เพื่อให้ trace กลับไปถึงสเปกได้" },
      ],
    },
    {
      slug: "defect-code-taxonomy",
      title: "Defect Code Taxonomy",
      tags: ["defect", "coding"],
      sections: [
        { heading: "โครงสร้าง", body: "`QP_<CATEGORY>_<REASON>` เช่น `QP_DIM_OVERSIZE`, `QP_SURF_SCRATCH`, `QP_WEIGHT_UNDERSPEC` — category ใช้ตัวย่อ 4 ตัว เพื่อให้อ่านออกโดยไม่ต้องเปิดเอกสาร" },
        { heading: "Category ที่ใช้บ่อย", body: "`DIM` (dimensional), `SURF` (surface), `WEIGHT` (weight), `COMP` (composition), `FUNC` (functional test) — เพิ่ม category ใหม่ต้องผ่าน QA Manager ก่อน" },
      ],
    },
    {
      slug: "inspection-report-naming",
      title: "Inspection Report Naming",
      tags: ["inspection", "naming"],
      sections: [
        { heading: "รูปแบบไฟล์", body: "`RPT-<batch-id>-<inspector-id>-<YYYYMMDDHHMMSS>.pdf` เช่น `RPT-QP-20240901-014-INS042-20240901143022.pdf`" },
        { heading: "การ link กลับ system", body: "ทุก report ต้องมี QR code ที่ encode batch_id เพื่อให้ scan ด้วยมือถือแล้ว pull สถานะปัจจุบันจากระบบได้โดยตรง" },
      ],
    },
    {
      slug: "calibration-record-format",
      title: "Calibration Record Format",
      tags: ["calibration", "records"],
      intro: "บันทึก calibration ต้องสมบูรณ์พอที่จะ reproduce ผลได้ถ้ามีการ dispute — convention นี้กำหนด field ขั้นต่ำ",
      sections: [
        { heading: "Field ที่บังคับมี", body: "`instrument_id`, `calibrated_by` (พนักงาน ID), `calibration_date`, `next_due_date`, `reference_standard_id`, `before_value`, `after_value`, `pass_fail`" },
        { heading: "การเก็บรักษา", body: "บันทึก calibration ต้องเก็บตาม {{ref:policy:inspection-record-retention-policy}} ไม่ลบทิ้งแม้ instrument จะถูก retire ไปแล้ว" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องเป็น `QP_<DOMAIN>_<REASON>` เสมอ ห้ามส่ง raw exception message ของ backend ออกไปตรงๆ" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "Correlation ID", body: "ทุก log line ที่เกี่ยวกับ batch ต้องมี `batch_id` เสมอ เพื่อไล่ log ข้าม service ได้ (batch-inspector → spc-analyzer → quarantine-manager) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "`certification.issued` และ `hold.released` ต้อง log เป็น `info` เสมอ เพราะเป็น audit event สำคัญที่ต้องอ่านย้อนหลังได้ง่าย ห้าม log เป็น `debug` แม้อยู่ใน dev mode" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(batch-inspector): บล็อก self-approval ด้วย batch-scoped lock แทน time window`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — scope ควรตรงกับชื่อ module หรือ policy ที่แก้ เพื่อให้ git log กรองตาม component ได้" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (พร้อม replication lag simulation สำหรับ certification-generator) → deploy staging → smoke test → deploy production ทีละ service" },
        { heading: "Gate พิเศษ", body: "{{ref:module:certification-generator}} และ {{ref:module:batch-inspector}} ต้องผ่าน integration test 100% ก่อน merge เสมอ เพราะ bug ใน service เหล่านี้มี compliance impact" },
      ],
    },
    {
      slug: "sensor-integration-runbook",
      title: "Sensor Integration Runbook",
      tags: ["sensor", "integration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "ทุกครั้งที่เพิ่ม instrument ใหม่หรือ replace ด้วยรุ่นต่างกัน ต้องทำตาม runbook นี้ก่อนเปิดรับข้อมูลจริง" },
        { heading: "ขั้นตอน", body: "1) ลงทะเบียน instrument ใน registry ของ {{ref:module:measurement-collector}} 2) ทำ initial calibration และบันทึกตาม {{ref:convention:calibration-record-format}} 3) ทดสอบ ingest dummy measurement 5 ชุดก่อนเปิดใช้จริง 4) ยืนยัน unit conversion ถูกต้องตาม {{ref:convention:measurement-unit-convention}}" },
      ],
    },
    {
      slug: "calibration-alert-setup",
      title: "Calibration Alert Setup",
      tags: ["calibration", "monitoring"],
      intro: "เอกสารนี้อธิบายการตั้ง alert สำหรับ calibration due ของ instrument ทุกตัว ซึ่งเป็น critical path ของ {{ref:policy:calibration-interval-policy}}",
      sections: [
        { heading: "Alert ที่ต้องมี", body: "1) Instrument due ใน 7 วัน (warning) 2) Instrument due ใน 2 วัน (urgent) 3) Instrument เกิน grace period (critical — ระงับอัตโนมัติ) 4) Calibration check job ไม่ run ภายใน 2 ชั่วโมง (dead-man alert)" },
        { heading: "ช่องทางแจ้งเตือน", body: "critical ไปที่ on-call QC ทันที warning/urgent รวมเป็น daily digest ให้ QC team ทุก 08:00" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ใบรับรองที่ออกไปผิดพลาดหรือ batch out-of-spec ออก shipment, Sev2 = SPC system ล่มหรือ quarantine ไม่ทำงาน, Sev3 = alert ผิดพลาดหรือ report ช้า" },
        { heading: "กรณี certification ผิด", body: "ทุกกรณีที่ใบรับรองออกผิด (ไม่ว่าจะเป็น template ผิดหรือ precondition ไม่ครบ) ต้อง escalate เป็น Sev1 และ notify customer ภายใน 4 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "SPC violation rate เกิน 20% ของ batch ใน 1 ชั่วโมง, quarantine hold ที่ batch ผ่าน rework แล้วแต่ยังไม่ release เกิน 24 ชั่วโมง, certification generator error rate เกิน 1% ใน 10 นาที" },
        { heading: "ช่องทาง", body: "Sev1/Sev2 แจ้ง on-call QC และ Engineering ทันทีทาง pager Sev3 รวม digest รายชั่วโมง" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ false alarm rate ของ SPC เพิ่มขึ้นเกิน 2 เท่าภายใน 1 ชั่วโมง หรือถ้ามี certification error เกิดขึ้นหลัง deploy ต้อง rollback ทันทีโดยไม่รอ approval" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกัน ตรวจ active quarantine hold และ pending certification ก่อนและหลัง rollback ว่าไม่มี data corruption" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up trigger |\n|---|---|---|---|\n| measurement-collector | 2 | 10 | ingest queue > 1000/min |\n| spc-analyzer | 2 | 6 | CPU > 70% |\n| batch-inspector | 2 | 4 | pending batch queue > 50 |" },
        { heading: "ข้อจำกัด", body: "{{ref:module:quarantine-manager}} ไม่ scale เกิน 2 replica เพราะ hold state ต้องไม่กระจาย — ใช้ single leader pattern แทน" },
      ],
    },
    {
      slug: "certification-archive-runbook",
      title: "Certification Archive Runbook",
      tags: ["certification", "archive", "runbook"],
      intro: "ขั้นตอนการ archive ใบรับรองและบันทึกการตรวจตาม {{ref:policy:inspection-record-retention-policy}}",
      sections: [
        { heading: "trigger", body: "รัน archive job ทุกต้นเดือน ย้ายใบรับรองที่ครบ 5 ปีไป cold storage โดยยังคง index ไว้ใน primary database เพื่อ lookup ได้ แต่ content อยู่บน cold storage" },
        { heading: "การ restore", body: "ถ้าต้องการ certification จาก cold storage เพื่อ audit ใช้ restore script ที่ pull content กลับมาชั่วคราว ใช้เวลาประมาณ 15-30 นาทีขึ้นกับขนาดไฟล์" },
      ],
    },
  ],
};
