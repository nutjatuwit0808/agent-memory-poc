import type { DomainProfile } from "../types.js";

// TalentFlow — ระบบติดตามผู้สมัครงาน (Applicant Tracking System)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const recruitmentAts: DomainProfile = {
  id: "recruitment-ats",
  displayName: "TalentFlow — ระบบติดตามผู้สมัครงาน (ATS)",
  summary: [
    "TalentFlow คือระบบ Applicant Tracking System สำหรับทีมสรรหาบุคลากรขององค์กรขนาดกลางถึงใหญ่ ครอบคลุมตั้งแต่การเปิดตำแหน่งงาน (requisition), การติดตาม pipeline ผู้สมัครแต่ละคน, การแกะข้อมูลจาก resume, การนัดสัมภาษณ์, ไปจนถึง workflow อนุมัติ offer และการเชื่อมต่อระบบตรวจสอบประวัติภายนอก (background check) TalentFlow ไม่ได้เป็นเจ้าของข้อมูลพนักงานหลังรับเข้าทำงานแล้ว — เมื่อผู้สมัครเซ็นรับ offer และผ่าน background check ข้อมูลจะถูกส่งต่อให้ระบบ HRIS ภายนอกเป็นเจ้าของแทน",
    "แต่ละตำแหน่งงาน (requisition) มี pipeline ของตัวเองที่ผู้สมัครเดินผ่านเป็นขั้นเป็นตอน ทีมวิศวกรรมเรียกช่วง 3 สัปดาห์แรกของไตรมาสว่า hiring surge window เพราะเป็นช่วงที่มี requisition ใหม่เปิดพร้อมกันมากที่สุดหลังงบประมาณไตรมาสใหม่อนุมัติ ทำให้ปริมาณ resume ที่ resume-parser ต้องประมวลผลพุ่งสูงกว่าช่วงปกติหลายเท่า",
  ],
  domainTags: ["recruitment-ats", "talentflow"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:candidate-pipeline-tracker}} เป็นเจ้าของสถานะผู้สมัครทุกคนในทุก pipeline ส่วน {{ref:module:resume-parser}} เป็นเจ้าของแค่ผลลัพธ์การแกะข้อมูล (structured field) จาก resume ดิบเท่านั้น ไม่รู้จักสถานะ pipeline เลย",
    "{{ref:module:job-requisition-manager}} เป็น service เดียวที่ query ข้าม {{ref:module:candidate-pipeline-tracker}} เพื่อคำนวณ headcount ที่ผูกกับ requisition แต่ละใบ — เหตุผลที่ยอมให้ query ข้าม service (ผิดหลักทั่วไป) คือการอนุมัติ headcount ต้องเห็นทั้งจำนวนตำแหน่งที่เปิดและจำนวนผู้สมัครที่กำลังจะปิด offer พร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิดการ overcommit headcount",
  ],
  apiGatewayNote: [
    "คำสั่งจาก recruiter ผ่านหน้าเว็บ (สร้าง requisition, ย้าย candidate ไปขั้นถัดไป, อนุมัติ offer) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่ง route ไปยัง service ที่เกี่ยวข้องตามประเภทคำขอ",
    "webhook จากระบบภายนอก (background check vendor, resume upload จาก job board) ไม่ผ่าน API gateway ตัวเดียวกับที่ recruiter ใช้ — เข้าทาง webhook endpoint แยกที่มี retry/signature verification เฉพาะ เพราะระบบภายนอกแต่ละเจ้ามีพฤติกรรม retry และ timeout ไม่เหมือนกัน การแยก endpoint ทำให้ debug ปัญหาจากฝั่งไหนง่ายกว่า",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:candidate-pipeline-tracker}} ดูแล ได้แก่ `candidates` (ข้อมูลผู้สมัครหลัก), `pipeline_stages` (สถานะปัจจุบันของผู้สมัครแต่ละคนในแต่ละ requisition), และ `stage_transition_log` (ประวัติการย้ายขั้นทั้งหมด ไม่ลบทิ้งเพื่อ audit)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `candidates` | candidate-pipeline-tracker | หนึ่งแถวต่อผู้สมัครหนึ่งคน ไม่ผูกกับ requisition เดียว |\n| `pipeline_stages` | candidate-pipeline-tracker | หนึ่งแถวต่อ (candidate, requisition) หนึ่งคู่ |\n| `parsed_resumes` | resume-parser | ผลลัพธ์ structured field ล่าสุดต่อ resume หนึ่งไฟล์ |\n| `interview_slots` | interview-scheduler | ตารางนัดสัมภาษณ์ทั้งหมด |\n| `offers` | offer-approval-workflow | สถานะ offer และ approval chain |",
    "ทุกตารางใช้ `candidateId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `resume.parsed`, `stage.advanced`, `interview.scheduled`, `offer.approved`, `background_check.completed` — {{ref:module:candidate-pipeline-tracker}} เป็นทั้งผู้ publish และ subscribe หลายตัวเพราะเป็นศูนย์กลางของสถานะผู้สมัคร",
    "{{ref:module:offer-approval-workflow}} subscribe `background_check.completed` จาก {{ref:module:background-check-integration}} เพื่อปลดล็อกขั้นตอนส่ง offer letter ฉบับจริง โดยไม่ต้องรอให้ recruiter มา trigger เอง ออกแบบแบบนี้เพื่อลดความล่าช้าจากการรอคนกดปุ่มด้วยมือ",
  ],
  modules: [
    {
      slug: "job-requisition-manager",
      name: "job-requisition-manager",
      tags: ["requisition", "module", "core"],
      description:
        "จัดการวงจรชีวิตของตำแหน่งงานตั้งแต่เปิดขอ approve จนถึงปิดตำแหน่ง แยกออกมาจาก candidate-pipeline-tracker ตั้งแต่กลางปี 2025 เพราะ logic การอนุมัติ headcount (multi-level approval, budget check) ซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic การติดตามผู้สมัครแล้วทดสอบยาก",
      functions: [
        { sig: "createRequisition(hiringManagerId: string, headcount: number, budget: BudgetInfo): Promise<string>", desc: "สร้างคำขอเปิดตำแหน่งใหม่ คืน requisitionId" },
        { sig: "approveRequisition(requisitionId: string, approverId: string, level: ApprovalLevel): Promise<void>", desc: "บันทึกการอนุมัติของ approver แต่ละระดับตามลำดับ" },
        { sig: "closeRequisition(requisitionId: string, reason: \"filled\" | \"cancelled\"): Promise<void>", desc: "ปิดตำแหน่งเมื่อรับเข้าครบหรือยกเลิก" },
        { sig: "getOpenHeadcount(requisitionId: string): Promise<number>", desc: "คำนวณจำนวนตำแหน่งที่ยังว่างจริงหลังหักผู้ที่กำลังจะปิด offer แล้ว" },
      ],
      stateFlow: "draft → pending_approval → approved → open → filled | cancelled — ดู {{ref:policy:requisition-approval-policy}} สำหรับลำดับการอนุมัติ",
      relatedNotes:
        "`getOpenHeadcount` เป็นฟังก์ชันเดียวที่ query ข้าม {{ref:module:candidate-pipeline-tracker}} โดยตรง (ข้อยกเว้นที่ตั้งใจ ดู {{ref:arch:boundaries}}) เพื่อไม่ให้ headcount ถูก overcommit ระหว่างที่มีหลาย offer กำลังรออนุมัติพร้อมกัน",
      internals: {
        constants: [
          { name: "MAX_APPROVAL_LEVELS", value: "3" },
          { name: "REQUISITION_STALE_DAYS", value: "45" },
        ],
        typeSnippet:
          "interface Requisition {\n  requisitionId: string;\n  status: \"draft\" | \"pending_approval\" | \"approved\" | \"open\" | \"filled\" | \"cancelled\";\n  headcount: number;\n  filledCount: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องลำดับการอนุมัติที่ {{ref:policy:requisition-approval-policy}}",
      },
    },
    {
      slug: "candidate-pipeline-tracker",
      name: "candidate-pipeline-tracker",
      tags: ["pipeline", "module", "core"],
      description:
        "เจ้าของสถานะผู้สมัครทุกคนในทุก pipeline ของทุกตำแหน่ง ทุก module อื่นที่ต้องรู้ว่าผู้สมัครอยู่ขั้นไหนต้อง query ผ่านตัวนี้เท่านั้น ไม่มี module ไหนเก็บ state ผู้สมัครซ้ำเอง เป็นศูนย์กลางที่ event หลักเกือบทั้งหมดของระบบไหลผ่าน",
      functions: [
        { sig: "advanceStage(candidateId: string, requisitionId: string, toStage: PipelineStage): Promise<void>", desc: "ย้ายผู้สมัครไปขั้นถัดไปใน pipeline" },
        { sig: "rejectCandidate(candidateId: string, requisitionId: string, reason: string): Promise<void>", desc: "ปฏิเสธผู้สมัครออกจาก pipeline พร้อมเหตุผล" },
        { sig: "getCurrentStage(candidateId: string, requisitionId: string): Promise<PipelineStage>", desc: "คืนขั้นปัจจุบันของผู้สมัครใน requisition ที่ระบุ" },
        { sig: "mergeDuplicateCandidate(primaryId: string, duplicateId: string): Promise<void>", desc: "รวม record ผู้สมัครที่ระบบตรวจพบว่าซ้ำกันเข้าด้วยกัน" },
      ],
      stateFlow: "applied → screening → interviewing → offer → hired | rejected | withdrawn (ผู้สมัครถอนตัวเอง)",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:resume-parser}} โดยตรงในเชิง command — subscribe event `resume.parsed` แล้วตัดสินใจเองว่าจะ advance stage อัตโนมัติหรือรอ recruiter ตรวจก่อน ดู {{ref:policy:auto-screen-decision-policy}} และ {{ref:policy:pipeline-auto-advance-policy}}",
      internals: {
        constants: [
          { name: "DUPLICATE_MATCH_THRESHOLD", value: "0.92" },
          { name: "STAGE_TRANSITION_LOCK_TTL_MS", value: "5000" },
        ],
        typeSnippet:
          "interface PipelineStage {\n  candidateId: string;\n  requisitionId: string;\n  stage: \"applied\" | \"screening\" | \"interviewing\" | \"offer\" | \"hired\" | \"rejected\" | \"withdrawn\";\n  updatedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง auto-advance ที่ {{ref:policy:pipeline-auto-advance-policy}}",
      },
    },
    {
      slug: "resume-parser",
      name: "resume-parser",
      tags: ["parsing", "module"],
      description:
        "แกะข้อมูล resume ดิบ (PDF/DOCX) ให้เป็น structured field เช่น ประวัติการทำงาน, ทักษะ, การศึกษา ทำงานเป็น async job แยกจาก upload flow เพื่อไม่ให้ผู้สมัครต้องรอผลแกะข้อมูลตอนอัปโหลด ผลลัพธ์ที่ได้ถูกใช้เป็น input ให้ auto-screen ตัดสินใจเบื้องต้นเท่านั้น ไม่ใช่การตัดสินใจสุดท้าย",
      functions: [
        { sig: "parseResume(fileId: string, format: \"pdf\" | \"docx\"): Promise<ParsedResume>", desc: "แกะข้อมูลจากไฟล์ resume ดิบเป็น structured field" },
        { sig: "extractWorkHistory(text: string): WorkHistoryEntry[]", desc: "แกะประวัติการทำงานจากข้อความที่ OCR/parse ได้แล้ว" },
        { sig: "computeConfidenceScore(parsed: ParsedResume): number", desc: "คำนวณความมั่นใจของผลแกะข้อมูล ใช้ตัดสินว่าต้องให้คนตรวจซ้ำหรือไม่" },
      ],
      relatedNotes:
        "ไม่รู้จักสถานะ pipeline เลย (ดู {{ref:arch:boundaries}}) — เมื่อแกะข้อมูลเสร็จจะ publish event `resume.parsed` เท่านั้น ปล่อยให้ {{ref:module:candidate-pipeline-tracker}} เป็นคนตัดสินใจว่าจะ advance stage อัตโนมัติหรือไม่ตาม {{ref:policy:auto-screen-decision-policy}}",
      internals: {
        constants: [
          { name: "LOW_CONFIDENCE_THRESHOLD", value: "0.6" },
          { name: "PARSE_TIMEOUT_MS", value: "20000" },
          { name: "SUPPORTED_LOCALES", value: "\"th, en\"" },
        ],
        typeSnippet:
          "interface ParsedResume {\n  fileId: string;\n  candidateId: string;\n  workHistory: WorkHistoryEntry[];\n  skills: string[];\n  confidenceScore: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:auto-screen-decision-policy}}",
      },
    },
    {
      slug: "interview-scheduler",
      name: "interview-scheduler",
      tags: ["scheduling", "module"],
      description:
        "จัดตารางนัดสัมภาษณ์ระหว่างผู้สมัครกับ interviewer โดย sync กับปฏิทินภายนอก (Google Calendar/Outlook) ของ interviewer แต่ละคน แยกออกมาเป็น service อิสระเพราะ logic การหาช่วงเวลาว่างที่ตรงกันของหลายฝ่ายพร้อมกันซับซ้อนและมี edge case ด้าน timezone เยอะ",
      functions: [
        { sig: "findAvailableSlots(interviewerIds: string[], durationMin: number, window: TimeWindow): Promise<Slot[]>", desc: "หาช่วงเวลาว่างที่ interviewer ทุกคนว่างตรงกัน" },
        { sig: "bookInterview(candidateId: string, interviewerIds: string[], slot: Slot): Promise<string>", desc: "ยืนยันการนัดสัมภาษณ์ คืน interviewId" },
        { sig: "rescheduleInterview(interviewId: string, newSlot: Slot): Promise<void>", desc: "เลื่อนนัดสัมภาษณ์ไปช่วงเวลาใหม่" },
        { sig: "cancelInterview(interviewId: string, reason: string): Promise<void>", desc: "ยกเลิกนัดสัมภาษณ์" },
      ],
      relatedNotes:
        "sync กับปฏิทินภายนอกแบบ two-way — ถ้า interviewer ยกเลิกจากปฏิทินของตัวเองโดยตรง (ไม่ผ่าน TalentFlow) ระบบต้องตรวจจับและอัปเดตสถานะให้ตรงกันภายในรอบ sync ถัดไป ดู {{ref:policy:interview-scheduling-conflict-policy}} สำหรับกติกาการชนกันของการจอง",
    },
    {
      slug: "offer-approval-workflow",
      name: "offer-approval-workflow",
      tags: ["offer", "module", "core"],
      description:
        "ควบคุม workflow การอนุมัติและส่ง offer letter ให้ผู้สมัคร ต้องผ่านลำดับผู้อนุมัติที่กำหนดตามระดับตำแหน่งและเงินเดือนก่อนส่งจริงเสมอ แยกออกมาจาก candidate-pipeline-tracker เพราะ approval chain มีเงื่อนไขทางธุรกิจเฉพาะ (เงินเดือนเกินเพดาน, ตำแหน่งผู้บริหาร) ที่ไม่เกี่ยวกับการติดตาม pipeline ทั่วไป",
      functions: [
        { sig: "initiateOffer(candidateId: string, requisitionId: string, terms: OfferTerms): Promise<string>", desc: "เริ่ม offer workflow ใหม่ กำหนด approval chain ตามเงื่อนไข" },
        { sig: "recordApproval(offerId: string, approverId: string, decision: \"approved\" | \"rejected\"): Promise<void>", desc: "บันทึกผลการอนุมัติของแต่ละคนใน chain" },
        { sig: "sendOfferLetter(offerId: string): Promise<void>", desc: "ส่ง offer letter จริงให้ผู้สมัคร — เรียกได้ก็ต่อเมื่อ approval chain ครบเท่านั้น" },
      ],
      stateFlow: "drafted → pending_approval → approved → sent → accepted | declined | expired",
      relatedNotes:
        "subscribe `background_check.completed` จาก {{ref:module:background-check-integration}} เพื่อปลดล็อกขั้นตอนถัดไปหลัง offer ถูกตอบรับ ดู {{ref:policy:offer-approval-signoff-policy}} สำหรับกติกาว่าใครต้องเซ็นก่อนส่งได้จริง",
    },
    {
      slug: "background-check-integration",
      name: "background-check-integration",
      tags: ["background-check", "module"],
      description:
        "เชื่อมต่อกับผู้ให้บริการตรวจสอบประวัติภายนอก (third-party vendor) ส่งคำขอตรวจสอบและรับผลกลับผ่าน webhook เป็นหลัก ไม่ได้ประมวลผลตรวจสอบเอง แค่ทำหน้าที่ orchestrate คำขอและ normalize ผลลัพธ์จาก vendor หลายเจ้าที่มี response format ต่างกัน",
      functions: [
        { sig: "initiateCheck(candidateId: string, checkType: CheckType): Promise<string>", desc: "ส่งคำขอตรวจสอบประวัติไปยัง vendor คืน checkId" },
        { sig: "handleWebhookResult(vendorPayload: unknown): Promise<void>", desc: "รับผลจาก vendor webhook แล้ว normalize เข้ารูปแบบกลาง" },
        { sig: "getCheckStatus(checkId: string): Promise<CheckStatus>", desc: "คืนสถานะการตรวจสอบล่าสุด" },
      ],
      relatedNotes:
        "publish event `background_check.completed` ให้ {{ref:module:offer-approval-workflow}} subscribe ต่อ ดู {{ref:policy:background-check-sla-policy}} สำหรับกติกาเมื่อการตรวจสอบใช้เวลานานผิดปกติจนกระทบวันเริ่มงาน",
    },
  ],
  envVarGroups: [
    {
      service: "job-requisition-service",
      vars: [
        { name: "REQUISITION_MAX_APPROVAL_LEVELS", example: "3", note: "ดู {{ref:policy:requisition-approval-policy}}" },
        { name: "REQUISITION_STALE_DAYS", example: "45", note: "" },
      ],
    },
    {
      service: "resume-parser-service",
      vars: [
        { name: "PARSER_LOW_CONFIDENCE_THRESHOLD", example: "0.6", note: "ต่ำกว่านี้ต้องให้คนตรวจซ้ำตาม {{ref:policy:auto-screen-decision-policy}}" },
        { name: "PARSER_TIMEOUT_MS", example: "20000", note: "" },
      ],
    },
    {
      service: "interview-scheduler-service",
      vars: [
        { name: "SCHEDULER_CALENDAR_SYNC_INTERVAL_MS", example: "300000", note: "" },
        { name: "SCHEDULER_CALENDAR_API_TOKEN", example: "***", note: "secret ห้าม log" },
      ],
    },
    {
      service: "background-check-service",
      vars: [
        { name: "BGCHECK_SLA_HOURS", example: "72", note: "ดู {{ref:policy:background-check-sla-policy}}" },
        { name: "BGCHECK_WEBHOOK_SIGNING_SECRET", example: "***", note: "secret ห้าม log" },
        { name: "BGCHECK_VENDOR_BASE_URL", example: "https://vendor.example.internal", note: "" },
      ],
    },
  ],
  policies: [
    {
      slug: "auto-screen-decision-policy",
      title: "นโยบายการ Auto-screen ผู้สมัครจากผลแกะ Resume",
      tags: ["screening", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:resume-parser}} แกะข้อมูลเสร็จและ `computeConfidenceScore` คืนค่าสูงกว่า `PARSER_LOW_CONFIDENCE_THRESHOLD` ระบบจะให้ {{ref:module:candidate-pipeline-tracker}} เทียบ criteria พื้นฐาน (ประสบการณ์ขั้นต่ำ, ทักษะบังคับ) อัตโนมัติ ถ้าไม่ผ่านจะย้ายไป `rejected` โดยไม่ต้องรอ recruiter ตรวจก่อน",
        "confidence score ต่ำกว่า threshold จะไม่ auto-screen เด็ดขาด ไม่ว่าผลจะออกมาผ่านหรือไม่ผ่านเกณฑ์ก็ตาม — ต้องส่งเข้าคิวให้ recruiter ตรวจด้วยตาก่อนเสมอ เพราะข้อมูลที่แกะมาความน่าเชื่อถือต่ำอาจทำให้ตัดสินใจผิดพลาด",
      ],
      sections: [
        {
          heading: "ทำไมไม่ auto-reject ทุกกรณีที่ไม่ผ่านเกณฑ์",
          body: "การ auto-reject จากข้อมูลที่แกะผิดพลาดอาจทำให้ผู้สมัครที่มีคุณสมบัติจริงถูกปฏิเสธอย่างไม่เป็นธรรม ทีมจึงจำกัด auto-screen ไว้เฉพาะกรณีที่ confidence สูงพอเท่านั้น ส่วนกรณีคลุมเครือให้คนตัดสินใจแทนเสมอ",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Resume Parser แกะข้อมูลผิดพลาดแต่ Confidence Score สูง",
        tags: ["screening", "edge-case"],
        body: [
          "ถ้า recruiter รายงานว่าผลแกะข้อมูลผิดพลาดทั้งที่ confidence score สูงกว่า threshold (เช่น ปีประสบการณ์คำนวณผิด) ผู้สมัครคนนั้นจะถูก flag `parser_disputed` และดึงกลับเข้าคิวให้คนตรวจใหม่ทันที ไม่ว่าผลก่อนหน้าจะเป็น auto-reject หรือ auto-advance ไปแล้วก็ตาม",
          "resume ที่ทำให้เกิด `parser_disputed` จะถูกเก็บเป็นตัวอย่างสำหรับปรับปรุงความแม่นยำของ parser รุ่นถัดไป แต่การแก้ไขจริงไม่ใช่ automatic — ต้องมีทีมตรวจสอบยืนยันก่อนเสมอ ดู {{ref:incident:resume-parser-misextraction-bad-autoscreen}} สำหรับเคสจริงที่นำไปสู่ edge case นี้",
        ],
      },
    },
    {
      slug: "interview-scheduling-conflict-policy",
      title: "นโยบายการชนกันของตารางสัมภาษณ์",
      tags: ["scheduling", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:interview-scheduler}} ต้องตรวจสอบว่า interviewer ทุกคนว่างจริงก่อนยืนยัน `bookInterview` เสมอ โดยเช็คทั้งจาก slot ที่ TalentFlow รู้เองและจากปฏิทินภายนอกที่ sync ล่าสุด",
        "ถ้า interviewer คนเดียวถูกจองสองนัดที่เวลาซ้อนกัน (จากช่องโหว่ race condition หรือ sync ล่าช้า) นัดที่จองทีหลังจะถูก mark เป็น `conflict` อัตโนมัติและแจ้ง recruiter ให้แก้ไขด้วยมือ ระบบจะไม่ยกเลิกนัดใดนัดหนึ่งเองโดยอัตโนมัติ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Interviewer ยกเลิกจากปฏิทินภายนอกโดยตรง",
        tags: ["scheduling", "edge-case"],
        body: [
          "ถ้า interviewer ยกเลิกนัดจากปฏิทินภายนอก (Google Calendar/Outlook) โดยตรงแทนที่จะยกเลิกผ่าน TalentFlow ระบบจะไม่ auto-cancel ฝั่งผู้สมัครทันทีที่ตรวจพบความไม่ตรงกันในรอบ sync — จะแจ้ง recruiter ให้ยืนยันก่อนว่าเป็นการยกเลิกจริงหรือแค่ปฏิทินหลุด sync ชั่วคราว เพราะเคยมีกรณีที่ sync ผิดพลาดทำให้นัดที่ยังดำเนินอยู่จริงถูกยกเลิกไปทั้งที่ผู้สมัครมาสัมภาษณ์แล้วไม่มีใครมารับ",
          "ระหว่างรอ recruiter ยืนยัน ผู้สมัครยังเห็นสถานะนัดเดิมตามปกติ ไม่มีการแจ้งยกเลิกออกไปจนกว่าจะยืนยันแล้ว",
        ],
      },
    },
    {
      slug: "offer-approval-signoff-policy",
      title: "นโยบายการเซ็นอนุมัติก่อนส่ง Offer",
      tags: ["offer", "approval", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:offer-approval-workflow}} ต้องได้รับ `recordApproval` แบบ `approved` จากทุกคนใน approval chain ก่อนที่ `sendOfferLetter` จะทำงานได้เสมอ ไม่มีข้อยกเว้นเรื่องความเร่งด่วน",
        "approval chain กำหนดตามระดับเงินเดือน: ต่ำกว่าเพดานที่กำหนดต้องมี hiring manager คนเดียวอนุมัติพอ สูงกว่าเพดานต้องเพิ่ม VP ระดับสายงานเข้ามาเซ็นด้วยเสมอ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Approver ที่ต้องเซ็นออกจากบริษัทไปแล้ว",
        tags: ["offer", "edge-case"],
        body: [
          "ถ้า approver ที่อยู่ใน approval chain ถูก offboard จากระบบ HR ก่อนที่จะเซ็นอนุมัติ ระบบจะไม่ข้ามขั้นตอนของคนนั้นไปเฉยๆ — ต้อง reroute chain ไปหา approver คนใหม่ที่รับช่วงตำแหน่งเดิมโดยอัตโนมัติผ่าน integration กับระบบ HR ก่อนเสมอ",
          "ถ้าระบบหาผู้รับช่วงอัตโนมัติไม่ได้ (เช่น ตำแหน่งว่างชั่วคราว) offer นั้นจะถูก mark เป็น `approval_blocked` และแจ้ง recruiting ops ให้กำหนด approver ทดแทนด้วยมือ ไม่มีทางที่ offer จะถูกส่งออกไปโดยขาด approver คนใดคนหนึ่งในกรณีนี้เด็ดขาด",
        ],
      },
    },
    {
      slug: "background-check-sla-policy",
      title: "นโยบาย SLA การตรวจสอบประวัติ",
      tags: ["background-check", "sla", "policy"],
      isPrimary: true,
      intro: [
        "การตรวจสอบประวัติที่ {{ref:module:background-check-integration}} ส่งไปยัง vendor มี SLA มาตรฐาน `BGCHECK_SLA_HOURS` (ปกติ 72 ชั่วโมง) นับจาก `initiateCheck`",
        "ถ้าเกิน SLA แล้วยังไม่ได้ผล ระบบจะแจ้ง recruiter ให้ทราบว่าอาจกระทบวันเริ่มงานที่วางแผนไว้ แต่จะไม่ยกเลิกหรือ retry คำขอเอง เพราะการ retry คำขอตรวจสอบประวัติซ้ำอาจทำให้เกิดค่าใช้จ่ายซ้ำซ้อนกับ vendor",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อการตรวจสอบค้างสถานะ Pending นานผิดปกติ",
        tags: ["background-check", "edge-case"],
        body: [
          "ถ้าสถานะค้างเป็น `pending` เกิน 2 เท่าของ SLA มาตรฐาน (เช่น เกิน 144 ชั่วโมงจาก SLA 72 ชั่วโมง) ระบบจะยกระดับเป็น `stuck` และเปิดช่องให้ recruiting ops ติดต่อ vendor โดยตรงเพื่อสอบถามสถานะ นอกเหนือจากการรอ webhook ตามปกติ",
          "วันเริ่มงานที่วางแผนไว้ล่วงหน้าจะไม่ถูกเลื่อนอัตโนมัติแม้ background check จะ stuck — ต้องเป็น recruiter หรือ hiring manager ตัดสินใจเองว่าจะเลื่อนวันเริ่มงานหรือรอ เพราะเป็นการตัดสินใจทางธุรกิจที่กระทบผู้สมัครโดยตรง ระบบไม่ควรตัดสินใจแทน",
        ],
      },
    },
    {
      slug: "duplicate-candidate-merge-policy",
      title: "นโยบายการรวม Candidate ที่ซ้ำกัน",
      tags: ["pipeline", "dedup", "policy"],
      isPrimary: true,
      intro: [
        "ระบบตรวจจับผู้สมัครซ้ำโดยเทียบอีเมลและเบอร์โทรเป็นหลัก ถ้าคะแนนความคล้ายเกิน `DUPLICATE_MATCH_THRESHOLD` จะขึ้นเตือนให้ recruiter ยืนยันก่อนที่จะ `mergeDuplicateCandidate` จริง ไม่ merge อัตโนมัติโดยไม่มีคนยืนยัน",
        "การ merge จะรวมประวัติ pipeline ทั้งหมดของทั้งสอง record เข้าเป็น record เดียว โดยเก็บ `stage_transition_log` ของทั้งคู่ไว้ครบ ไม่ลบประวัติฝั่งไหนทิ้ง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อผู้สมัครซ้ำสมัครคนละตำแหน่งพร้อมกัน",
        tags: ["pipeline", "edge-case"],
        body: [
          "ถ้าผู้สมัครที่ระบบตรวจพบว่าเป็นคนเดียวกันสมัครคนละตำแหน่งพร้อมกัน (คนละ requisition) การ merge record หลักจะไม่กระทบ pipeline stage ของแต่ละตำแหน่ง — แต่ละ requisition ยังคงมี `pipeline_stages` แยกเป็นของตัวเอง มีแค่ข้อมูลผู้สมัครหลัก (ชื่อ, ติดต่อ, resume) ที่ถูกรวมเป็นชุดเดียว",
          "ถ้าตำแหน่งหนึ่งผู้สมัครถูก reject ไปแล้วแต่อีกตำแหน่งยังอยู่ระหว่าง interviewing การ merge จะไม่ทำให้สถานะ reject ลามไปกระทบตำแหน่งที่ยังดำเนินอยู่ เพราะแต่ละ pipeline ตัดสินใจอย่างอิสระจากกัน",
        ],
      },
    },
    {
      slug: "pipeline-auto-advance-policy",
      title: "นโยบายการเลื่อนขั้น Pipeline อัตโนมัติ",
      tags: ["pipeline", "automation", "policy"],
      isPrimary: true,
      intro: [
        "บางขั้นใน pipeline อนุญาตให้ `advanceStage` ทำงานอัตโนมัติได้เมื่อเงื่อนไขที่กำหนดผ่านครบ เช่น ผ่านการสัมภาษณ์ทุกรอบและ interviewer ทุกคนให้ผลบวก แต่บางขั้น (เช่น จาก `interviewing` ไป `offer`) ต้องมี recruiter ยืนยันด้วยมือเสมอ ไม่ auto-advance",
        "กติกาว่าขั้นไหน auto-advance ได้กำหนดไว้ล่วงหน้าต่อ requisition ไม่ใช่ default เดียวกันทั้งระบบ เพราะบางตำแหน่ง (เช่นตำแหน่งผู้บริหาร) ต้องการให้คนตัดสินใจทุกขั้นตอน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อผลสัมภาษณ์มาไม่ครบทุกคนแต่ Timeout",
        tags: ["pipeline", "edge-case"],
        body: [
          "ถ้า interviewer บางคนไม่กรอกผลสัมภาษณ์ภายใน 48 ชั่วโมงหลังสัมภาษณ์เสร็จ ระบบจะไม่ auto-advance ผู้สมัครไปขั้นถัดไปทั้งที่ผลที่มีอยู่เป็นบวกทั้งหมด — จะคงสถานะเดิมไว้และแจ้งเตือน interviewer ที่ยังไม่กรอกซ้ำแทน เพราะการ auto-advance จากผลไม่ครบอาจข้ามความเห็นสำคัญของคนที่ยังไม่ได้กรอกไป",
          "recruiter มีสิทธิ์ override เพื่อ advance ด้วยมือได้ถ้าตัดสินใจว่าผลที่มีอยู่เพียงพอแล้ว แต่การ override แบบนี้จะถูกบันทึกไว้ต่างหากจาก auto-advance ปกติเพื่อ audit — บทเรียนจาก {{ref:incident:pipeline-auto-advance-wrongly-rejects}} คือทิศทางตรงข้าม (auto-reject ทั้งที่ควรผ่าน) อันตรายกว่า auto-advance เร็วเกินไปมาก",
        ],
      },
    },
    {
      slug: "requisition-approval-policy",
      title: "นโยบายลำดับการอนุมัติเปิดตำแหน่งงาน",
      tags: ["requisition", "approval", "policy"],
      isPrimary: false,
      intro: [
        "requisition ใหม่ต้องผ่านการอนุมัติตามลำดับ: hiring manager → finance (เช็ค budget) → HR business partner ตามลำดับนี้เท่านั้น ข้ามลำดับไม่ได้แม้ approver คนถัดไปจะอนุมัติมาก่อนก็ตาม",
        "requisition ที่ค้างในสถานะ `pending_approval` เกิน `REQUISITION_STALE_DAYS` จะถูกแจ้งเตือนซ้ำไปยัง approver ที่ยังไม่ตัดสินใจทุกสัปดาห์จนกว่าจะมีการตัดสินใจ",
      ],
    },
    {
      slug: "candidate-data-retention-policy",
      title: "นโยบายการเก็บรักษาข้อมูลผู้สมัคร",
      tags: ["data", "compliance", "policy"],
      isPrimary: false,
      intro: [
        "ข้อมูลผู้สมัครที่ถูก reject หรือถอนตัวจะถูกเก็บไว้สูงสุด 2 ปีนับจากวันที่ปิด pipeline เพื่อใช้พิจารณาซ้ำในตำแหน่งอื่นในอนาคต หลังจากนั้นจะถูกลบอัตโนมัติตาม data retention schedule รายเดือน",
        "ผู้สมัครที่ร้องขอให้ลบข้อมูลก่อนกำหนด (right to erasure) จะถูกลบภายใน 30 วันตามที่กฎหมายกำหนด โดยไม่ต้องรอรอบ retention schedule ปกติ",
      ],
    },
    {
      slug: "interviewer-load-balancing-policy",
      title: "นโยบายกระจายภาระ Interviewer",
      tags: ["scheduling", "workload", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:interview-scheduler}} จะพยายามกระจายจำนวนนัดสัมภาษณ์ต่อ interviewer ไม่ให้เกิน 5 นัดต่อสัปดาห์โดย default เพื่อไม่ให้กระทบงานหลักของ interviewer มากเกินไป",
        "hiring manager สามารถขอยกเว้นเพดานนี้ชั่วคราวสำหรับตำแหน่งที่ต้องปิดเร่งด่วนได้ แต่ต้องระบุเหตุผลและมีวันหมดอายุของข้อยกเว้นเสมอ ไม่ปล่อยให้ยกเว้นค้างถาวร",
      ],
    },
    {
      slug: "offer-expiration-policy",
      title: "นโยบายวันหมดอายุของ Offer",
      tags: ["offer", "expiration", "policy"],
      isPrimary: false,
      intro: [
        "offer letter ที่ส่งออกไปแล้วมีอายุ 7 วันตามค่า default ถ้าผู้สมัครไม่ตอบรับหรือปฏิเสธภายในเวลานี้ ระบบจะเปลี่ยนสถานะเป็น `expired` อัตโนมัติและแจ้ง recruiter",
        "offer ที่ expired ไม่ได้ถูกยกเลิกความหมายถาวร — recruiter สามารถ re-issue offer ใหม่ด้วยเงื่อนไขเดิมหรือปรับใหม่ได้ แต่ต้องผ่าน approval chain ใหม่ทั้งหมดอีกครั้งเสมอ ไม่ใช้ approval เดิมซ้ำ",
      ],
    },
    {
      slug: "referral-priority-policy",
      title: "นโยบายลำดับความสำคัญผู้สมัครจากการ Referral",
      tags: ["pipeline", "referral", "policy"],
      isPrimary: false,
      intro: [
        "ผู้สมัครที่มาจาก employee referral จะถูก flag พิเศษให้ recruiter เห็นและตรวจ resume ภายใน 48 ชั่วโมงแรกเสมอ เร็วกว่า SLA ปกติของผู้สมัครทั่วไปที่ 5 วันทำการ",
        "การ auto-screen ยังใช้เกณฑ์เดียวกับผู้สมัครทั่วไปทุกประการ — flag referral มีผลแค่เรื่องความเร็วในการตรวจ ไม่มีผลต่อเกณฑ์การผ่านหรือไม่ผ่านแต่อย่างใด เพื่อความยุติธรรมต่อผู้สมัครทุกช่องทาง",
      ],
    },
  ],
  incidents: [
    {
      slug: "resume-parser-misextraction-bad-autoscreen",
      title: "Resume Parser แกะประวัติทำงานผิดจนตัดสิน Auto-screen ผิด",
      tags: ["parsing", "screening"],
      summary:
        "ผู้สมัครตำแหน่ง senior engineer คนหนึ่งถูก auto-reject ทั้งที่มีประสบการณ์ตรงตามเกณฑ์ทุกอย่างจริง hiring manager ที่รู้จักผู้สมัครเป็นการส่วนตัวสังเกตเห็นความผิดปกติและร้องเรียนเข้ามา",
      investigation:
        "ตรวจ {{ref:module:resume-parser}} พบว่า `extractWorkHistory` อ่านช่วงเวลาทำงานผิด — resume เขียนวันที่แบบ `MM/YYYY` แต่ parser ตีความเป็น `DD/YYYY` ทำให้คำนวณจำนวนปีประสบการณ์ผิดพลาดไปมาก",
      cause:
        "resume ของผู้สมัครคนนี้เขียนตามฟอร์แมตวันที่แบบสหรัฐอเมริกาซึ่งไม่ตรงกับ default parsing pattern ที่ทีมออกแบบไว้สำหรับ locale ไทยเป็นหลัก และ confidence score ที่คำนวณได้กลับสูงเกินจริงเพราะ format การเขียนวันที่ยังดู \"ถูกต้อง\" ในเชิงโครงสร้าง แม้ค่าที่ได้จะตีความผิด",
      resolution:
        "ทีม support แก้ pipeline stage ของผู้สมัครคนนี้กลับด้วยมือ แล้วส่งกลับเข้าสัมภาษณ์ตามปกติ พร้อม flag `parser_disputed` ตาม {{ref:policy:auto-screen-decision-policy}}",
      followup:
        "เพิ่ม locale detection ให้ parser รองรับฟอร์แมตวันที่หลายแบบ และลด confidence score ลงเมื่อ parser ตรวจพบความกำกวมของฟอร์แมตวันที่แทนที่จะให้คะแนนสูงตามโครงสร้างอย่างเดียว",
    },
    {
      slug: "interview-scheduler-double-booking",
      title: "Interview Scheduler จองซ้อน Interviewer คนเดียวกันสองนัด",
      tags: ["scheduling", "bug"],
      summary:
        "interviewer อาวุโสคนหนึ่งถูกจองสัมภาษณ์สองนัดพร้อมกันในเวลาเดียวกันกับผู้สมัครคนละคน ทำให้ต้องยกเลิกนัดหนึ่งกะทันหันและผู้สมัครไม่พอใจ",
      investigation:
        "ตรวจ log `bookInterview` พบว่ามี request สองตัวเรียกจองช่วงเวลาเดียวกันของ interviewer คนนี้ในเวลาไล่เลี่ยกันมาก ทั้งคู่เช็ค availability ผ่านตอนที่ slot ยังว่างอยู่จริง",
      cause:
        "การเช็คและการจองไม่ได้ทำแบบ atomic — มีช่วงเวลาสั้นๆ ระหว่างเช็ค availability กับ commit การจองที่เปิดโอกาสให้ request คู่ขนานแทรกเข้ามาจองซ้อนได้ เป็น pattern เดียวกับ race condition ที่พบได้บ่อยในระบบจองคิว",
      resolution:
        "แจ้ง interviewer และผู้สมัครที่ได้รับผลกระทบ เลื่อนนัดหนึ่งไปช่วงเวลาอื่นที่ว่างจริง แล้ว deploy hotfix ให้การจองใช้ conditional update แบบ atomic แทนการเช็คแล้วจองแยกกัน",
      followup:
        "เพิ่ม test case จำลอง concurrent booking request สำหรับ interviewer คนเดียวกันใน integration test ตาม {{ref:convention:testing-convention}}",
    },
    {
      slug: "offer-sent-without-signoff",
      title: "Offer ถูกส่งออกไปโดยขาด Approver คนหนึ่งเซ็นอนุมัติ",
      tags: ["offer", "bug"],
      summary:
        "offer letter สำหรับตำแหน่งผู้บริหารถูกส่งออกไปให้ผู้สมัครจริง ทั้งที่ VP สายงานที่ต้องเซ็นอนุมัติตามเงื่อนไขเงินเดือนสูงยังไม่ได้อนุมัติเลย",
      investigation:
        "ตรวจ {{ref:module:offer-approval-workflow}} พบว่า `sendOfferLetter` ถูกเรียกสำเร็จทั้งที่ approval chain ยังมี approver เหลืออยู่หนึ่งคนในสถานะ `pending`",
      cause:
        "logic เช็คว่า approval chain \"ครบ\" ใช้การนับจำนวนคนที่ approve แล้วเทียบกับจำนวน approver เริ่มต้นที่กำหนดตอนสร้าง offer แต่ในเคสนี้ approval chain ถูก reroute ระหว่างทาง (เพราะ approver คนเดิมออกจากบริษัท) ทำให้จำนวน approver เริ่มต้นที่ใช้เทียบไม่ตรงกับจำนวนจริงหลัง reroute",
      resolution:
        "ติดต่อผู้สมัครทันทีเพื่อชะลอการตอบรับ offer พร้อมขออนุมัติจาก VP ย้อนหลังอย่างเร่งด่วน โชคดีที่เงื่อนไข offer ไม่มีปัญหาจึงอนุมัติผ่านโดยไม่ต้องแก้ไข terms",
      followup:
        "แก้ logic ให้เช็คความครบถ้วนของ approval chain จากรายชื่อ approver ปัจจุบันจริง (หลัง reroute) แทนการนับจำนวนคงที่จากตอนสร้าง offer ตาม {{ref:policy:offer-approval-signoff-policy}}",
    },
    {
      slug: "background-check-stuck-pending-blocks-start-date",
      title: "Background Check ค้าง Pending นานผิดปกติจนต้องเลื่อนวันเริ่มงาน",
      tags: ["background-check", "sla"],
      summary:
        "ผู้สมัครที่ตอบรับ offer แล้วและกำหนดวันเริ่มงานไว้ล่วงหน้า พบว่า background check ค้างสถานะ `pending` นานเกิน 10 วัน ทั้งที่ SLA มาตรฐานคือ 72 ชั่วโมง",
      investigation:
        "ตรวจ {{ref:module:background-check-integration}} พบว่า `getCheckStatus` คืนค่า `pending` ต่อเนื่องโดยไม่มี webhook callback จาก vendor เข้ามาเลยตลอดช่วงเวลานั้น",
      cause:
        "vendor ฝั่งภายนอกมีปัญหาระบบภายในของตัวเองที่ทำให้คำขอตรวจสอบบางส่วนตกหล่นไม่ถูกประมวลผล โดยไม่ได้แจ้งความผิดพลาดกลับมาเลย (silent failure ฝั่ง vendor) TalentFlow เองไม่มีกลไก poll สถานะเชิงรุก พึ่งพา webhook อย่างเดียว",
      resolution:
        "recruiting ops ติดต่อ vendor โดยตรงตามที่เปิดช่องไว้ใน {{ref:policy:background-check-sla-policy}} หลังจากยกระดับเป็น `stuck` พบว่าคำขอตกหล่นจริง vendor ประมวลผลใหม่ให้เร่งด่วน ผลออกภายใน 4 ชั่วโมงหลังติดต่อ hiring manager ตัดสินใจเลื่อนวันเริ่มงานไป 1 สัปดาห์",
      followup:
        "เพิ่ม polling สำรองที่เรียก vendor API เช็คสถานะเชิงรุกทุก 24 ชั่วโมงสำหรับคำขอที่ยังไม่ได้ webhook กลับมา แทนการพึ่งพา webhook อย่างเดียว",
    },
    {
      slug: "duplicate-candidate-split-records",
      title: "Bug ตรวจจับ Candidate ซ้ำทำให้เกิด Record แยกกันของคนคนเดียว",
      tags: ["pipeline", "dedup"],
      summary:
        "recruiter พบว่าผู้สมัครคนหนึ่งสมัครตำแหน่งเดิมซ้ำสองครั้งด้วยอีเมลต่างกันเล็กน้อย (ตัวพิมพ์ใหญ่-เล็กต่างกัน) กลายเป็นสอง candidate record แยกกันโดยสิ้นเชิง ทั้งที่ควรถูกตรวจจับว่าซ้ำ",
      investigation:
        "ตรวจ {{ref:module:candidate-pipeline-tracker}} พบว่า logic เทียบอีเมลเพื่อคำนวณ `DUPLICATE_MATCH_THRESHOLD` เทียบแบบ case-sensitive ทำให้ `Jane.Doe@example.com` กับ `jane.doe@example.com` ถูกมองว่าเป็นคนละคน",
      cause:
        "การ normalize อีเมลก่อนเทียบไม่ได้ทำ lowercase ให้เรียบร้อยก่อน ทั้งที่มาตรฐานอีเมลถือว่าส่วน domain ไม่ sensitive ต่อตัวพิมพ์เสมอ และในทางปฏิบัติ local part ก็แทบไม่มีใครตั้งใจใช้ตัวพิมพ์ต่างกันเพื่อแยกตัวตน",
      resolution:
        "merge สอง record เข้าด้วยกันด้วยมือผ่าน `mergeDuplicateCandidate` ตาม {{ref:policy:duplicate-candidate-merge-policy}} แล้วแก้ normalize logic ให้ lowercase อีเมลก่อนเทียบเสมอ",
      followup:
        "ตรวจสอบ candidate record เก่าทั้งหมดย้อนหลังว่ามี pattern เดียวกันซ่อนอยู่กี่คู่ แล้วรัน merge job แบบ batch สำหรับคู่ที่ตรวจพบ",
    },
    {
      slug: "pipeline-auto-advance-wrongly-rejects",
      title: "Auto-advance Rule เผลอ Reject ผู้สมัครที่ผ่านขั้นจริง",
      tags: ["pipeline", "bug"],
      summary:
        "ผู้สมัครหลายคนถูก auto-reject ออกจาก pipeline ทั้งที่ผลสัมภาษณ์เป็นบวกครบทุกคน hiring manager สังเกตเห็นความผิดปกติเมื่อเปรียบเทียบจำนวนผู้ผ่านเข้ารอบกับที่คาดไว้",
      investigation:
        "ตรวจ {{ref:module:candidate-pipeline-tracker}} พบว่า `advanceStage` ใช้เงื่อนไขเช็คผลสัมภาษณ์แบบ \"ถ้ามีผลลบแม้แต่ตัวเดียวให้ reject\" แต่ logic ดึงผลสัมภาษณ์ดึงมาจาก cache ที่ยังไม่ได้อัปเดตผลล่าสุดของ interviewer บางคนที่เพิ่งกรอกผลบวกเข้ามา",
      cause:
        "cache ผลสัมภาษณ์มี TTL ยาวเกินไปเทียบกับความถี่ที่ interviewer กรอกผลจริง ทำให้ auto-advance ตัดสินใจจากข้อมูลเก่าที่ยังไม่ครบ เข้าเงื่อนไข \"มีผลลบ\" ทั้งที่จริงแล้วแค่ \"ยังไม่มีผลอัปเดต\"",
      resolution:
        "reject ทั้งหมดที่ได้รับผลกระทบถูกเปลี่ยนกลับเป็น pipeline stage เดิมด้วยมือ พร้อมแจ้งขอโทษผู้สมัครที่ได้รับผลกระทบ",
      followup:
        "ลด cache TTL ของผลสัมภาษณ์ลงมากและเปลี่ยน logic ให้แยกแยะ \"ไม่มีข้อมูล\" กับ \"มีผลลบ\" อย่างชัดเจน ไม่ปนกันเป็นเงื่อนไขเดียว ตามที่บันทึกไว้ใน {{ref:policy:pipeline-auto-advance-policy}}",
    },
    {
      slug: "resume-parser-pdf-ocr-garbled-text",
      title: "PDF Resume ที่เป็นภาพสแกนทำให้ OCR อ่านข้อความเพี้ยน",
      tags: ["parsing", "ocr"],
      summary:
        "ผู้สมัครกลุ่มหนึ่งที่ resume เป็นไฟล์ PDF จากการสแกนเอกสาร (ไม่ใช่ text-based PDF) มีผลแกะข้อมูลว่างเปล่าหรือมีตัวอักษรแปลกปนจำนวนมาก",
      investigation:
        "ตรวจ {{ref:module:resume-parser}} พบว่า `parseResume` พยายามอ่าน text layer ของ PDF ตรงๆ ก่อนเสมอ ถ้าไม่มี text layer (เพราะเป็นภาพสแกน) จะ fallback ไป OCR แต่ผลลัพธ์ OCR คุณภาพต่ำมากสำหรับเอกสารที่สแกนความละเอียดต่ำ",
      cause:
        "ระบบไม่มีการเช็คคุณภาพของ OCR ก่อนส่งผลลัพธ์เข้า pipeline — แม้ข้อความที่ได้จะเพี้ยนชัดเจน (ตัวอักษรปนสัญลักษณ์แปลกๆ จำนวนมาก) `computeConfidenceScore` ก็ยังคำนวณจากโครงสร้างที่ parse ได้โดยไม่ตรวจสอบความสมเหตุสมผลของเนื้อหาจริง",
      resolution:
        "resume กลุ่มที่ได้รับผลกระทบถูกส่งเข้าคิวให้คนตรวจด้วยมือทั้งหมด แล้วเพิ่ม heuristic เช็คสัดส่วนตัวอักษรที่ไม่ใช่ตัวอักษรปกติในผลลัพธ์ OCR ก่อนคำนวณ confidence score",
      followup:
        "พิจารณาเปลี่ยน OCR engine ให้รองรับเอกสารสแกนความละเอียดต่ำได้ดีขึ้น และแจ้งผู้สมัครให้อัปโหลด resume แบบ text-based PDF แทนถ้าเป็นไปได้",
    },
    {
      slug: "interview-scheduler-timezone-bug",
      title: "นัดสัมภาษณ์ผิดเวลาเพราะ Timezone ไม่ตรงกันข้าม Office",
      tags: ["scheduling", "timezone"],
      summary:
        "ผู้สมัครที่สัมภาษณ์กับทีมต่างประเทศพลาดนัดสัมภาษณ์เพราะเข้าใจผิดว่าเวลานัดคือเวลา local ของตัวเอง ทั้งที่ระบบตั้งใจส่งเป็นเวลา UTC",
      investigation:
        "ตรวจ {{ref:module:interview-scheduler}} พบว่า `findAvailableSlots` คำนวณ slot เป็น UTC ภายในถูกต้อง แต่หน้าจอยืนยันนัดที่ส่งให้ผู้สมัครแสดงเวลาโดยไม่ระบุ timezone ให้ชัดเจนเพียงพอ ทำให้ผู้สมัครตีความผิด",
      cause:
        "เทมเพลต email ยืนยันนัดสัมภาษณ์แสดงเวลาแบบ `14:00` เฉยๆ โดยไม่มี timezone label กำกับ ซึ่งเดิมออกแบบมาสำหรับกรณีสัมภาษณ์ภายในประเทศเดียวกันที่ไม่มีปัญหาความกำกวมนี้ แต่ไม่ครอบคลุมกรณี cross-timezone interview ที่เริ่มมีมากขึ้น",
      resolution:
        "ติดต่อผู้สมัครเพื่อนัดสัมภาษณ์ใหม่ทันที พร้อมระบุ timezone ชัดเจนทั้งสองฝั่งในการสื่อสารครั้งใหม่",
      followup:
        "แก้เทมเพลต email ทุกฉบับที่เกี่ยวกับเวลานัดให้แสดง timezone ของทั้งสองฝั่งเสมอเมื่อ interviewer กับผู้สมัครอยู่คนละ timezone",
    },
    {
      slug: "offer-workflow-approver-left-company",
      title: "Offer ค้างเพราะ Approver ออกจากบริษัทก่อนเซ็นอนุมัติ",
      tags: ["offer", "approval"],
      summary:
        "offer สำหรับตำแหน่งหนึ่งค้างในสถานะ `pending_approval` นานผิดปกติ ตรวจสอบพบว่า approver ที่ต้องเซ็นได้ลาออกจากบริษัทไปตั้งแต่ก่อนหน้านั้นแล้ว",
      investigation:
        "ตรวจ {{ref:module:offer-approval-workflow}} พบว่า approval chain ยังชี้ไปที่ approver คนเดิมที่ offboard ไปแล้ว ระบบไม่มีการ reroute อัตโนมัติเกิดขึ้นเลย",
      cause:
        "integration กับระบบ HR ที่ควรแจ้งการ offboard เข้ามาทำงานปกติ แต่ logic ฝั่ง offer-approval-workflow ยังไม่ได้ implement ส่วน reroute ให้ครบตามที่ตั้งใจไว้ใน edge case ของ {{ref:policy:offer-approval-signoff-policy}} — เป็นช่องว่างระหว่างสิ่งที่ policy กำหนดกับสิ่งที่ระบบทำได้จริงตอนนั้น",
      resolution:
        "recruiting ops กำหนด approver ทดแทนด้วยมือ แล้วอนุมัติ offer ต่อจนสำเร็จ ผู้สมัครได้รับ offer letter ล่าช้ากว่าที่ควรประมาณ 5 วัน",
      followup:
        "implement reroute อัตโนมัติให้ครบตามที่ {{ref:policy:offer-approval-signoff-policy}} ระบุไว้ พร้อม alert ทันทีที่ตรวจพบ approver ในสถานะ pending ถูก offboard",
    },
    {
      slug: "background-check-vendor-webhook-outage",
      title: "Vendor Webhook หยุดส่งผลตรวจสอบเข้ามาช่วงสั้นๆ",
      tags: ["background-check", "webhook"],
      summary:
        "background check หลายรายการค้างสถานะ pending พร้อมกันในช่วงเวลาไล่เลี่ยกัน ทั้งที่ก่อนหน้านั้น vendor ตอบกลับตรงเวลาปกติมาตลอด",
      investigation:
        "ตรวจ {{ref:module:background-check-integration}} พบว่า `handleWebhookResult` ไม่ได้ถูกเรียกเลยในช่วง 3 ชั่วโมง ทั้งที่ vendor status page รายงานว่าระบบของตัวเองทำงานปกติ",
      cause:
        "webhook endpoint ของ TalentFlow เองมีการ deploy ระหว่างช่วงเวลานั้นพอดี ทำให้ปฏิเสธ connection ชั่วครู่ vendor พยายาม retry ตามนโยบายของตัวเองแต่หมดจำนวนครั้ง retry ก่อนที่ deploy จะเสร็จ ทำให้ผลตรวจสอบบางส่วนหายไปเลยไม่ retry ต่อ",
      resolution:
        "ทีมติดต่อ vendor โดยตรงเพื่อขอให้ trigger ส่งผลซ้ำสำหรับรายการที่หายไปในช่วงเวลาดังกล่าว vendor รองรับการขอส่งซ้ำได้โดยไม่มีค่าใช้จ่ายเพิ่ม",
      followup:
        "ย้าย deploy ของ webhook endpoint ให้ทำแบบ zero-downtime หรือ deploy ช่วงเวลาที่ traffic ต่ำ และเพิ่ม polling สำรองตามที่ระบุไว้ใน follow-up ของ {{ref:incident:background-check-stuck-pending-blocks-start-date}} ด้วย",
    },
    {
      slug: "candidate-pipeline-stage-transition-race",
      title: "Race Condition ทำ Pipeline Stage เปลี่ยนสถานะขัดแย้งกันเอง",
      tags: ["pipeline", "bug"],
      summary:
        "ผู้สมัครคนหนึ่งมีสถานะ pipeline เปลี่ยนไปมาระหว่าง `interviewing` กับ `offer` สลับกันหลายครั้งในเวลาไม่กี่นาที ทำให้ recruiter สับสนว่าสถานะจริงคืออะไร",
      investigation:
        "ตรวจ {{ref:module:candidate-pipeline-tracker}} พบว่ามี request `advanceStage` สองตัวมาจากคนละที่ (recruiter กดในหน้าเว็บพร้อมกับ auto-advance rule ทำงานพอดี) เข้ามาเกือบพร้อมกันภายใน `STAGE_TRANSITION_LOCK_TTL_MS`",
      cause:
        "lock ที่ตั้งใจกันการเปลี่ยนสถานะซ้อนกันมี TTL สั้นเกินไปเทียบกับเวลาที่ operation จริงใช้ ทำให้ lock หมดอายุก่อนที่ operation แรกจะเขียนเสร็จ เปิดโอกาสให้ operation ที่สองเข้ามาแทรกกลางทาง",
      resolution:
        "แก้สถานะกลับเป็นค่าที่ถูกต้องด้วยมือ (`offer` ซึ่งเป็นผลจาก action ล่าสุดที่ตั้งใจจริง) แล้วขยาย `STAGE_TRANSITION_LOCK_TTL_MS` ให้นานพอสำหรับ operation ที่ช้าที่สุดที่เคยวัดได้",
      followup:
        "เปลี่ยนกลไก lock จาก TTL คงที่เป็น lock ที่ release ทันทีเมื่อ operation เสร็จจริงแทน ลดความเสี่ยงจากการเดา TTL ผิด",
    },
    {
      slug: "requisition-headcount-overcommit",
      title: "Requisition ถูก Overcommit เพราะคำนวณ Headcount ว่างผิด",
      tags: ["requisition", "bug"],
      summary:
        "ทีมสรรหาพบว่ามีการส่ง offer เกินจำนวน headcount ที่อนุมัติไว้จริงสำหรับตำแหน่งหนึ่ง ทำให้ต้องแก้ปัญหาทางธุรกิจที่ยุ่งยากว่าจะทำอย่างไรกับผู้สมัครส่วนเกิน",
      investigation:
        "ตรวจ {{ref:module:job-requisition-manager}} พบว่า `getOpenHeadcount` คำนวณ headcount ว่างจากจำนวนผู้ที่อยู่ใน pipeline stage `offer` ณ เวลานั้น แต่ไม่ได้นับผู้ที่กำลังอยู่ระหว่าง initiate offer ที่ยังไม่ทันเข้าสถานะ `offer` อย่างเป็นทางการ",
      cause:
        "มี offer สองใบสำหรับ requisition เดียวกันถูก `initiateOffer` เกือบพร้อมกันจาก recruiter คนละคน โดยที่ตอนเช็ค `getOpenHeadcount` ทั้งคู่เห็นตัวเลขว่างเท่ากันเพราะยังไม่มีใครเข้าสถานะ `offer` อย่างเป็นทางการ",
      resolution:
        "ทีมตัดสินใจให้ผู้สมัครทั้งสองรายที่ได้รับ offer ผ่านจริง โดยขอ headcount เพิ่มเติมจาก finance เป็นกรณีพิเศษ เนื่องจากทั้งคู่ตอบรับไปแล้วก่อนที่ทีมจะรู้ตัวว่า overcommit",
      followup:
        "แก้ `getOpenHeadcount` ให้นับ offer ที่อยู่ในสถานะ `drafted` และ `pending_approval` ด้วย ไม่ใช่แค่สถานะ `offer` ของ pipeline stage เพื่อกันการ overcommit ตั้งแต่ต้นทาง",
    },
    {
      slug: "resume-parser-name-field-swap-diff-culture-names",
      title: "Parser สลับชื่อ-นามสกุลผิดสำหรับชื่อบางวัฒนธรรม",
      tags: ["parsing", "bug"],
      summary:
        "ผู้สมัครที่มีชื่อรูปแบบนามสกุลขึ้นก่อนชื่อตามธรรมเนียมบางวัฒนธรรมถูกระบบบันทึกชื่อ-นามสกุลสลับกัน ทำให้การค้นหาและอ้างอิงในระบบผิดพลาด",
      investigation:
        "ตรวจ {{ref:module:resume-parser}} พบว่า logic แยกชื่อ-นามสกุลใช้กฎ \"คำแรกคือชื่อ คำสุดท้ายคือนามสกุล\" แบบตายตัว ซึ่งไม่ครอบคลุมรูปแบบการเขียนชื่อของทุกวัฒนธรรม",
      cause:
        "ทีมออกแบบ parser เริ่มแรกอ้างอิงจากชุดข้อมูลตัวอย่างที่มีความหลากหลายทางวัฒนธรรมของชื่อไม่มากพอ ทำให้กฎที่ตั้งไว้ใช้ได้ดีกับกรณีส่วนใหญ่แต่ผิดพลาดกับกรณีที่ไม่ตรงรูปแบบตะวันตกทั่วไป",
      resolution:
        "แก้ไข record ที่ได้รับผลกระทบด้วยมือหลังได้รับแจ้งจากผู้สมัครและ recruiter ที่สังเกตเห็น แล้วเพิ่ม manual review step สำหรับกรณีที่ parser ไม่มั่นใจเรื่องการแยกชื่อ",
      followup:
        "ปรับปรุง logic แยกชื่อให้รองรับหลายรูปแบบมากขึ้น และเพิ่มช่องให้ผู้สมัครยืนยัน/แก้ไขชื่อของตัวเองที่ parser แกะได้ก่อนเข้าสู่ auto-screen เสมอ แทนที่จะเชื่อผลแกะอัตโนมัติทั้งหมด",
    },
    {
      slug: "interview-scheduler-calendar-sync-drift",
      title: "ปฏิทิน Sync คลาดเคลื่อนสะสมจนนัดสัมภาษณ์หายจากปฏิทิน Interviewer",
      tags: ["scheduling", "sync"],
      summary:
        "interviewer หลายคนรายงานว่านัดสัมภาษณ์ที่เพิ่งจองใหม่ไม่ปรากฏในปฏิทินส่วนตัวของตัวเอง ทั้งที่ระบบ TalentFlow แสดงว่าจองสำเร็จแล้ว",
      investigation:
        "ตรวจ {{ref:module:interview-scheduler}} พบว่า `SCHEDULER_CALENDAR_SYNC_INTERVAL_MS` รอบล่าสุดหลายรอบติดต่อกัน sync ไม่สำเร็จเงียบๆ โดยไม่มี error log ชัดเจน เพราะ error handling ของรอบ sync จับ exception แล้วแค่ log ระดับ debug ไม่ได้แจ้งเตือนใคร",
      cause:
        "calendar API token ที่ใช้ sync หมดอายุตั้งแต่หลายชั่วโมงก่อน แต่ error ที่ได้กลับมาจาก API ถูก catch ไว้เฉยๆ โดยไม่ escalate เป็น alert เพราะทีมคิดว่า sync failure เป็นเรื่องเล็กน้อยที่ไม่ต้องรบกวน on-call ตอนออกแบบครั้งแรก",
      resolution:
        "ต่ออายุ calendar API token แล้ว trigger sync ทันทีด้วยมือให้ปฏิทินของทุก interviewer ที่ได้รับผลกระทบกลับมาตรงกัน",
      followup:
        "เพิ่ม alert ระดับ critical เมื่อ calendar sync ล้มเหลวติดต่อกันเกิน 2 รอบ เข้าไปใน {{ref:deployment:monitoring-alerts}} แทนการ log เงียบๆ แบบเดิม",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/ATS-203-offer-approval-reroute`, `fix/ATS-217-duplicate-candidate-merge`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(interview-scheduler): แก้ race condition ตอนจอง slot`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ pipeline stage หรือ approval chain ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:candidate-pipeline-stage-transition-race}}) และ logic เทียบข้อมูลส่วนบุคคล (อีเมล, ชื่อ) ต้อง normalize ก่อนเทียบเสมอ ไม่เทียบ raw string ตรงๆ" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `advanceStage`, `computeConfidenceScore` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier หลัก", body: "`candidateId` และ `requisitionId` เป็น UUID เสมอ ไม่ใช้เลขรันนิ่งที่เดาลำดับได้ เพื่อป้องกันการเดา id ของผู้สมัครคนอื่นจาก URL" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับผู้สมัครต้องมี `candidateId` เสมอ เพื่อไล่ log ข้าม service ได้ (resume-parser → candidate-pipeline-tracker → offer-approval-workflow) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ข้อมูลส่วนบุคคล", body: "ห้าม log เนื้อหา resume ดิบหรือผลตรวจสอบประวัติแบบเต็มเด็ดขาด — log ได้แค่ metadata เช่น fileId, checkId, สถานะ เพื่อรักษาความเป็นส่วนตัวของผู้สมัคร" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`ATS_<DOMAIN>_<REASON>` เช่น `ATS_PARSER_LOW_CONFIDENCE`, `ATS_OFFER_APPROVAL_INCOMPLETE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`ATS_PIPELINE_DUPLICATE_CANDIDATE`, `ATS_SCHEDULE_CONFLICT`, `ATS_BGCHECK_STUCK` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Test ครอบคลุม Locale", body: "logic ที่แตะการแกะข้อมูลจาก resume ต้องมี test case ครอบคลุมฟอร์แมตวันที่และรูปแบบชื่อจากหลายวัฒนธรรมเสมอ — บทเรียนจาก {{ref:incident:resume-parser-misextraction-bad-autoscreen}} และ {{ref:incident:resume-parser-name-field-swap-diff-culture-names}}" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะ pipeline stage transition หรือ interview booking ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ" },
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
      slug: "candidate-record-field-naming-convention",
      title: "Candidate Record Field Naming Convention",
      tags: ["naming", "data"],
      intro: "เอกสารนี้กำหนดชื่อ field มาตรฐานสำหรับข้อมูลผู้สมัครที่ทุก module ต้องใช้ตรงกัน เพื่อไม่ให้ {{ref:module:resume-parser}}, {{ref:module:candidate-pipeline-tracker}}, และ {{ref:module:offer-approval-workflow}} ตั้งชื่อ field เดียวกันต่างกัน",
      sections: [
        { heading: "field ชื่อบุคคล", body: "ใช้ `fullName` เป็น field เดียวสำหรับแสดงผล ไม่แยก `firstName`/`lastName` เป็น field บังคับ เพราะรูปแบบชื่อหลายวัฒนธรรมไม่แยกส่วนแบบตะวันตกเสมอไป (ดูบทเรียนจาก {{ref:incident:resume-parser-name-field-swap-diff-culture-names}}) ถ้าต้องแยกให้เก็บเป็น field เสริม `nameParts` ที่ไม่บังคับ" },
        { heading: "field วันที่", body: "ทุก field วันที่เก็บเป็น ISO 8601 เสมอหลังผ่านการ parse แล้ว ไม่เก็บฟอร์แมตดิบจาก resume ต้นฉบับไว้ในระบบหลัก" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (สำหรับ service ที่แตะ external vendor) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:offer-approval-workflow}} และ {{ref:module:background-check-integration}} ต้องผ่าน integration test กับ vendor sandbox 100% ก่อน merge เสมอ เพราะกระทบข้อมูลที่ไม่สามารถย้อนกลับได้ (offer ที่ส่งออกไปแล้ว)" },
      ],
    },
    {
      slug: "webhook-timeout-tuning",
      title: "Webhook & Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (network/webhook) เท่านั้น ไม่ใช่ business SLA ของ background check — ดูเรื่องนั้นที่ {{ref:policy:background-check-sla-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → internal service | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| Vendor webhook receive | 10s | webhook endpoint config |\n| Calendar API call | 15s | env `SCHEDULER_CALENDAR_TIMEOUT_MS` |\n| Database connection pool acquire | 5s | `pg-pool` config |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เหตุการณ์ {{ref:incident:background-check-vendor-webhook-outage}} พบว่า webhook endpoint ที่ deploy ระหว่างช่วงที่ vendor กำลัง retry ทำให้ผลตรวจสอบหายไปเลยเพราะ retry ของ vendor หมดจำนวนครั้งก่อน deploy จะเสร็จ เป็นเหตุผลที่ต้องย้ายไป zero-downtime deploy" },
      ],
    },
    {
      slug: "candidate-data-migration-runbook",
      title: "Candidate Data Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อเปลี่ยนโครงสร้าง field ของ `candidates` หรือ `parsed_resumes` ต้อง migrate ข้อมูลที่มีอยู่เดิมทั้งหมดใน {{ref:module:candidate-pipeline-tracker}} และ {{ref:module:resume-parser}} พร้อมกัน" },
        { heading: "ขั้นตอน", body: "1) เพิ่ม field ใหม่แบบ nullable ก่อนเสมอ ไม่ลบ field เก่าทันที 2) backfill ข้อมูลเดิมเป็น batch job รันนอกเวลาทำการ 3) เปลี่ยน field ใหม่เป็น required หลัง backfill ครบและยืนยันความถูกต้องแล้วเท่านั้น" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = offer ถูกส่งผิดพลาดหรือข้อมูลส่วนบุคคลรั่วไหล, Sev2 = กระทบ pipeline ของบาง requisition, Sev3 = กระทบเล็กน้อยไม่ถึงผู้สมัครโดยตรง" },
        { heading: "กรณีข้อมูลส่วนบุคคล", body: "ทุกเหตุการณ์ที่มีความเสี่ยงข้อมูลส่วนบุคคลของผู้สมัครหลุดออกนอกระบบ ต้องยกระดับเป็น Sev1 เสมอและแจ้งทีม compliance ภายใน 24 ชั่วโมง ไม่ว่าจะยืนยันแล้วว่าหลุดจริงหรือแค่สงสัยก็ตาม" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "background check ค้าง `pending` เกิน 2 เท่าของ SLA, calendar sync ล้มเหลวติดต่อกันเกิน 2 รอบ, offer อยู่ใน `pending_approval` เกิน `REQUISITION_STALE_DAYS`" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ offer ถูกส่งออกไปโดยขาด approval หรือ resume parser confidence score ตกลงผิดปกติทั่วทั้งระบบ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:offer-sent-without-signoff}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip integration test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| resume-parser | 2 | 10 | queue depth > 200 (พุ่งสูงช่วง hiring surge window) |\n| candidate-pipeline-tracker | 2 | 6 | CPU > 70% |\n| interview-scheduler | 1 | 4 | CPU > 60% (latency-sensitive เพราะ sync ปฏิทินภายนอก) |" },
        { heading: "ข้อจำกัดจาก Vendor ภายนอก", body: "{{ref:module:background-check-integration}} scale ฝั่งซอฟต์แวร์ได้ แต่ throughput จริงถูกจำกัดด้วย rate limit ของ vendor เอง — scale service เพิ่มช่วยแค่การ queue คำขอรอส่ง ไม่ได้ทำให้ vendor ประมวลผลเร็วขึ้น ดู {{ref:policy:background-check-sla-policy}}" },
      ],
    },
    {
      slug: "hiring-surge-capacity-runbook",
      title: "Hiring Surge Capacity Runbook",
      tags: ["capacity", "seasonal", "runbook"],
      intro: "ขั้นตอนเตรียมความพร้อมสำหรับ hiring surge window ที่มี requisition เปิดพร้อมกันจำนวนมากหลังงบประมาณไตรมาสใหม่อนุมัติ",
      sections: [
        { heading: "ก่อนเข้าช่วง surge", body: "ปรับ min replica ของ {{ref:module:resume-parser}} ขึ้นล่วงหน้าอย่างน้อย 3 วันก่อนเข้าช่วง hiring surge window ที่คาดการณ์ไว้ ไม่รอให้ queue depth พุ่งก่อนแล้วค่อย scale ตาม threshold ปกติ" },
        { heading: "ระหว่าง surge", body: "เฝ้าดู `PARSER_LOW_CONFIDENCE_THRESHOLD` hit rate เป็นพิเศษ เพราะปริมาณ resume ที่หลากหลายขึ้นช่วง surge มักทำให้สัดส่วนที่ต้องส่งคนตรวจเพิ่มขึ้นตามไปด้วย ต้องเตรียมกำลังคน recruiter รองรับล่วงหน้าเช่นกัน" },
      ],
    },
  ],
};
