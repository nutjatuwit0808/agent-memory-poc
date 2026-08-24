import type { DomainProfile } from "../types.js";

// OnboardFlow — ระบบจัดการ onboarding พนักงานใหม่ (task workflow, provisioning, e-sign, buddy, compliance)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const hrOnboarding: DomainProfile = {
  id: "hr-onboarding",
  displayName: "OnboardFlow — ระบบจัดการ Onboarding พนักงานใหม่",
  summary: [
    "OnboardFlow คือแพลตฟอร์มกลางที่ประสานงาน onboarding พนักงานใหม่ตั้งแต่วันที่ตอบรับ offer จนถึงวันแรกที่เข้างานจริง ระบบไม่ได้เป็นเจ้าของข้อมูลพนักงานหลัก (นั้นเป็นหน้าที่ของ HRIS เดิมของบริษัท) แต่ทำหน้าที่ orchestrate checklist, เอกสาร, สิทธิ์การเข้าถึง, buddy และ compliance deadline ให้ทุกอย่างเสร็จทันวันเริ่มงาน",
    "ระบบต้องคุยกับ vendor ภายนอกหลายเจ้าพร้อมกัน — บริการตรวจประวัติ (background check), บริการ e-signature สำหรับเอกสาร, ระบบ ticketing ของทีม IT สำหรับสิทธิ์อุปกรณ์/software, ระบบ badge เข้าอาคาร, และ LMS สำหรับ training บังคับ ทีมวิศวกรรมเรียกช่วงต้นเดือนและกลางเดือนว่า cohort window เพราะบริษัทกำหนดวันเริ่มงานพนักงานใหม่เป็นรอบ (batch start date) ไม่ใช่วันไหนก็ได้",
  ],
  domainTags: ["hr-onboarding", "onboardflow"],
  serviceBoundaryNote: [
    "{{ref:module:onboarding-workflow-engine}} เป็นตัวประสานงานกลาง (orchestrator) เท่านั้น — ไม่เก็บรายละเอียดของ task, เอกสาร, หรือสิทธิ์การเข้าถึงเองเลย แค่รู้ว่า case ของพนักงานคนหนึ่งอยู่ stage ไหน แล้วรอ event จาก service ย่อยเพื่อขยับ stage ต่อ",
    "{{ref:module:document-collection}}, {{ref:module:access-provisioning}}, {{ref:module:compliance-tracker}} ต่างเป็นเจ้าของ database ของตัวเอง ไม่มี service ไหน query ข้าม database ของอีกฝั่งโดยตรง ทุกการสื่อสารข้าม service ผ่าน event เท่านั้น (ดู {{ref:arch:queue}}) — หลักการนี้ตั้งใจให้ต่างจาก {{ref:module:onboarding-workflow-engine}} ที่ยอมให้เป็น subscriber ของทุก event เพื่อขยับ state ได้",
  ],
  apiGatewayNote: [
    "คำขอจาก HR ผ่าน internal admin console เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำสั่ง เช่น \"เริ่ม onboarding ให้พนักงานคนนี้\" เป็นการเรียก {{ref:module:onboarding-workflow-engine}} โดยตรง คำขอที่ต้องรอผลทันที เช่น เช็คสถานะ case ปัจจุบัน ใช้ synchronous call",
    "Webhook ขาเข้าจาก vendor ภายนอก (e-signature vendor, background check vendor) ไม่ผ่าน API gateway ตัวเดียวกับ admin console — มี endpoint แยกต่างหากที่ตรวจ signature ของ webhook เองก่อนส่งต่อเข้าคิว เพราะ payload จาก vendor ภายนอกต้อง validate เข้มกว่าคำขอภายในบริษัท",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:onboarding-workflow-engine}} ดูแล ได้แก่ `onboarding_cases` (สถานะปัจจุบันของแต่ละพนักงานใหม่) และ `stage_transition_log` (ประวัติการเปลี่ยน stage ทั้งหมด ไม่ลบทิ้งเพื่อ audit)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `onboarding_cases` | onboarding-workflow-engine | 1 แถวต่อพนักงานใหม่ 1 คน |\n| `tasks` | task-assignment | checklist item ทั้งหมดต่อ case |\n| `documents` | document-collection | สถานะเอกสารแต่ละประเภทต่อ case |\n| `provision_requests` | access-provisioning | คำขอสิทธิ์อุปกรณ์/software/badge |\n| `compliance_items` | compliance-tracker | deadline training/certification ต่อ case |",
    "ทุกตารางใช้ `hireId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `document.signed`, `document.stuck`, `access.provisioned`, `access.provision_failed`, `compliance.overdue`, `task.completed` — {{ref:module:onboarding-workflow-engine}} subscribe ทุก event เหล่านี้เพื่อตัดสินใจว่า case ไหนพร้อมขยับ stage ต่อ",
    "{{ref:module:task-assignment}} subscribe `document.signed` และ `access.provisioned` เพื่อ mark task ที่เกี่ยวข้องว่าเสร็จอัตโนมัติ โดยไม่ต้องรอให้ workflow-engine สั่งงานตรงๆ — ออกแบบแบบนี้เพื่อให้ checklist อัปเดตทันทีที่เหตุการณ์จริงเกิด ไม่ต้องรอ workflow-engine ประมวลผล stage ก่อน",
  ],
  modules: [
    {
      slug: "onboarding-workflow-engine",
      name: "onboarding-workflow-engine",
      tags: ["workflow", "module", "core"],
      description:
        "state machine หลักที่ track ว่าพนักงานใหม่แต่ละคนอยู่ขั้นตอนไหนของ onboarding ตั้งแต่ตอบรับ offer จนถึง active วันแรก แยกออกมาเป็น service อิสระตั้งแต่ต้นปี 2025 เพราะเดิม logic นี้ฝังอยู่ใน admin console โดยตรง ทำให้แก้ workflow ทีต้อง deploy frontend ใหม่ทุกครั้ง",
      functions: [
        { sig: "startOnboarding(hireId: string, startDate: string, roleId: string): Promise<OnboardingCase>", desc: "สร้าง case ใหม่และ trigger event เริ่มต้นให้ทุก service ย่อยสร้าง task/เอกสาร/compliance item ของตัวเอง" },
        { sig: "advanceStage(hireId: string, fromStage: OnboardingStage, toStage: OnboardingStage): Promise<void>", desc: "ขยับ case ไป stage ถัดไป ตรวจก่อนว่าเงื่อนไขของ stage ปัจจุบันครบหรือยัง" },
        { sig: "getCaseStatus(hireId: string): Promise<OnboardingCase>", desc: "คืนสถานะรวมของ case พร้อมสรุปว่า blocker ที่เหลืออยู่คืออะไร" },
        { sig: "pauseCase(hireId: string, reason: string): Promise<void>", desc: "หยุด case ชั่วคราว เช่น พนักงานเลื่อนวันเริ่มงาน" },
      ],
      stateFlow: "invited → documents_pending → background_check_pending → provisioning_pending → active — ดู {{ref:policy:day-one-access-policy}} สำหรับเงื่อนไขว่า stage ไหนต้องเสร็จก่อนวันเริ่มงาน",
      relatedNotes:
        "ไม่รู้จัก business rule ของ vendor ภายนอกเลย (เช่น background check ใช้เวลากี่วัน) — แค่รอ event `*.completed` หรือ `*.failed` จาก {{ref:module:document-collection}}, {{ref:module:access-provisioning}}, {{ref:module:compliance-tracker}} แล้วตัดสินใจขยับ stage ตามนั้น เพื่อรักษาหลัก separation of concerns",
      internals: {
        constants: [
          { name: "MAX_STAGE_RETRY", value: "2" },
          { name: "STAGE_TRANSITION_TIMEOUT_HOURS", value: "48" },
        ],
        typeSnippet:
          "interface OnboardingCase {\n  hireId: string;\n  stage: \"invited\" | \"documents_pending\" | \"background_check_pending\" | \"provisioning_pending\" | \"active\" | \"stuck\" | \"paused\";\n  startDate: string;\n  blockers: string[];\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องเงื่อนไขวันเริ่มงานที่ {{ref:policy:day-one-access-policy}}",
      },
    },
    {
      slug: "task-assignment",
      name: "task-assignment",
      tags: ["task", "module"],
      description:
        "สร้างและมอบหมาย checklist task ตาม role/department ของพนักงานใหม่ (เช่น \"กรอกแบบฟอร์มภาษี\", \"อบรมความปลอดภัยข้อมูล\") ให้ทั้งตัวพนักงานเอง, buddy, ทีม IT, และหัวหน้างาน แยกออกมาจาก onboarding-workflow-engine เพราะ template ของ task ต่าง role ต่าง department ซับซ้อนขึ้นเรื่อยๆ จนทำให้ workflow engine อ่านยาก",
      functions: [
        { sig: "generateTaskList(hireId: string, roleId: string): Promise<Task[]>", desc: "สร้าง task ตาม template ของ role นั้นๆ ทันทีที่ case เริ่มต้น" },
        { sig: "assignTask(taskId: string, assigneeId: string): Promise<void>", desc: "มอบหมาย task ให้ผู้รับผิดชอบ (พนักงานใหม่/buddy/IT/หัวหน้างาน)" },
        { sig: "completeTask(taskId: string): Promise<void>", desc: "mark task ว่าเสร็จ ทั้งจากการกดยืนยันเองหรือจาก event ของ service อื่น" },
        { sig: "reassignOverdueTasks(): Promise<number>", desc: "cron job รายวัน เลื่อน task ที่เลยกำหนดไปให้หัวหน้างานช่วยดูแทน คืนจำนวนที่ reassign" },
      ],
      stateFlow: "pending → in_progress → done | overdue",
      relatedNotes:
        "subscribe event `document.signed` และ `access.provisioned` จาก {{ref:module:document-collection}} และ {{ref:module:access-provisioning}} เพื่อ auto-complete task ที่เกี่ยวข้อง โดยไม่ต้องพึ่ง {{ref:module:onboarding-workflow-engine}} สั่งงานตรงๆ — ดู {{ref:policy:task-duplication-prevention-policy}} สำหรับปัญหา task ซ้ำที่เคยเกิด",
    },
    {
      slug: "document-collection",
      name: "document-collection",
      tags: ["document", "module", "core"],
      description:
        "จัดการเอกสารที่ต้องเซ็นก่อนเริ่มงาน (สัญญาจ้าง, แบบฟอร์มภาษี, NDA) ผ่าน e-signature vendor ภายนอก รับ webhook ยืนยันการเซ็นกลับมา เป็นจุดที่มี pattern คล้าย payment webhook ของฝั่ง PayFlow — คือถ้า webhook หายกลางทาง เอกสารจะค้างสถานะ `pending` ทั้งที่เซ็นจริงเสร็จแล้วที่ฝั่ง vendor",
      functions: [
        { sig: "requestSignature(hireId: string, documentType: DocumentType): Promise<SignatureRequest>", desc: "สร้างคำขอเซ็นเอกสารส่งไป e-signature vendor คืน request พร้อม tracking id" },
        { sig: "handleSignatureWebhook(payload: SignatureWebhookPayload): Promise<void>", desc: "รับ webhook ยืนยันจาก vendor แล้วอัปเดตสถานะเอกสาร" },
        { sig: "getDocumentStatus(hireId: string, documentType: DocumentType): Promise<DocumentStatus>", desc: "คืนสถานะเอกสารปัจจุบัน ใช้เช็คก่อนขยับ onboarding stage" },
      ],
      stateFlow: "sent → viewed → signed → verified หรือ expired — ถ้าค้างที่ `signed` นานเกิน `DOC_SIGNATURE_STUCK_THRESHOLD_HOURS` โดยไม่มี webhook ยืนยัน `verified` เข้ามา จะถูก mark เป็น `stuck` ดู {{ref:policy:document-signature-policy}}",
      relatedNotes:
        "ไม่แตะสถานะ task โดยตรง — ปล่อยให้ {{ref:module:task-assignment}} ฟัง event `document.signed` เองแล้วอัปเดต task ที่เกี่ยวข้อง เพื่อรักษาหลัก \"แต่ละ service เป็นเจ้าของ data ตัวเอง\"",
      internals: {
        constants: [
          { name: "SIGNATURE_REQUEST_TTL_HOURS", value: "72" },
          { name: "DOC_SIGNATURE_STUCK_THRESHOLD_HOURS", value: "24" },
        ],
        typeSnippet:
          "interface DocumentRecord {\n  hireId: string;\n  documentType: \"tax_form\" | \"employment_contract\" | \"nda\";\n  status: \"sent\" | \"viewed\" | \"signed\" | \"verified\" | \"expired\" | \"stuck\";\n  vendorRequestId: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเอกสารค้างที่ {{ref:policy:document-signature-policy}}",
      },
    },
    {
      slug: "access-provisioning",
      name: "access-provisioning",
      tags: ["provisioning", "module", "core"],
      description:
        "จัดสิทธิ์ laptop, software license, และ badge เข้าอาคารให้พนักงานใหม่ คุยกับระบบ ticketing ของทีม IT และระบบ badge ผ่านคิวเสมอ ไม่เรียกแบบ synchronous เพราะทั้งสองระบบภายนอกมี SLA ตอบสนองที่ไม่แน่นอน (นาทีถึงชั่วโมง)",
      functions: [
        { sig: "provisionAccess(hireId: string, accessBundleId: string): Promise<ProvisionRequest>", desc: "ยื่นคำขอสิทธิ์ทั้งชุดตาม role (laptop, software, badge) เข้าคิว" },
        { sig: "revokeAccess(hireId: string, reason: string): Promise<void>", desc: "เพิกถอนสิทธิ์ทั้งหมด เช่น กรณีพนักงานยกเลิกก่อนเริ่มงาน" },
        { sig: "checkProvisionStatus(hireId: string): Promise<ProvisionStatus>", desc: "คืนสถานะการจัดสิทธิ์แต่ละรายการใน bundle" },
      ],
      stateFlow: "queued → dispatched → confirmed | failed — ดู {{ref:policy:day-one-access-policy}} สำหรับ deadline ว่า `dispatched` ต้องเกิดก่อนวันเริ่มงานกี่วัน",
      relatedNotes:
        "ไม่รู้จัก concept ของ \"task\" หรือ \"เอกสาร\" เลย รู้แค่ว่า bundle สิทธิ์ไหนสำเร็จหรือพลาด — {{ref:module:task-assignment}} เป็นคนแปลผล `access.provisioned` เป็น task ที่เสร็จเอง",
      internals: {
        constants: [
          { name: "PROVISION_QUEUE_MAX_DEPTH", value: "200" },
          { name: "BADGE_SYSTEM_TIMEOUT_MS", value: "8000" },
        ],
        typeSnippet:
          "interface ProvisionRequest {\n  hireId: string;\n  accessBundleId: string;\n  status: \"queued\" | \"dispatched\" | \"confirmed\" | \"failed\";\n  items: { kind: \"laptop\" | \"software\" | \"badge\"; status: string }[];\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง deadline วันเริ่มงานที่ {{ref:policy:day-one-access-policy}}",
      },
    },
    {
      slug: "buddy-matching",
      name: "buddy-matching",
      tags: ["buddy", "module"],
      description:
        "จับคู่พนักงานใหม่กับ buddy/mentor ที่มีอยู่แล้วในทีมใกล้เคียง พิจารณาจาก department, timezone overlap, และภาระ buddy ปัจจุบันของแต่ละคนเพื่อไม่ให้คนเดิมถูกเลือกซ้ำถี่เกินไป",
      functions: [
        { sig: "findCandidateBuddies(hireId: string): Promise<BuddyCandidate[]>", desc: "คืนรายชื่อ buddy ที่เป็นไปได้เรียงตามคะแนนความเหมาะสม" },
        { sig: "assignBuddy(hireId: string, buddyId: string): Promise<void>", desc: "ยืนยันการจับคู่ buddy ให้ case นี้" },
        { sig: "reportBuddyLoad(buddyId: string): Promise<number>", desc: "คืนจำนวนพนักงานใหม่ที่ buddy คนนี้กำลังดูแลอยู่ตอนนี้" },
      ],
      relatedNotes:
        "ทำงานแบบ best-effort ไม่ block stage อื่นของ {{ref:module:onboarding-workflow-engine}} — ถ้าจับคู่ buddy ไม่ได้ทันวันเริ่มงาน พนักงานยังเริ่มงานได้ตามปกติ เพียงแต่ยังไม่มี buddy ดู {{ref:policy:buddy-assignment-policy}} สำหรับเงื่อนไขการจับคู่",
    },
    {
      slug: "compliance-tracker",
      name: "compliance-tracker",
      tags: ["compliance", "module"],
      description:
        "ติดตาม deadline ของ training บังคับและ certification ที่พนักงานใหม่ต้องทำให้เสร็จภายในกรอบเวลาที่กำหนด (เช่น อบรมความปลอดภัยข้อมูลภายใน 30 วัน) ส่ง reminder และ escalate ไปหาหัวหน้างาน/ทีม compliance เมื่อใกล้หรือเลยกำหนด",
      functions: [
        { sig: "scheduleComplianceItem(hireId: string, itemType: string, dueDate: string): Promise<void>", desc: "สร้างรายการ compliance ใหม่พร้อมกำหนดเส้นตาย" },
        { sig: "markCompleted(hireId: string, itemType: string): Promise<void>", desc: "บันทึกว่า item นั้นทำเสร็จแล้ว มักถูกเรียกจาก LMS webhook" },
        { sig: "listOverdueItems(): Promise<ComplianceItem[]>", desc: "คืนรายการที่เลยกำหนดทั้งหมด ใช้ในรายงานประจำสัปดาห์ของทีม compliance" },
      ],
      relatedNotes:
        "ไม่ block การเริ่มงานของพนักงาน — {{ref:module:onboarding-workflow-engine}} ไม่รอ compliance item ให้เสร็จก่อนขยับไป stage `active` เพราะ training บังคับส่วนใหญ่มี deadline หลังวันเริ่มงาน ดู {{ref:policy:compliance-training-deadline-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "onboarding-workflow-engine-service",
      vars: [
        { name: "ONBOARDING_STAGE_TIMEOUT_HOURS", example: "48", note: "ดู {{ref:policy:day-one-access-policy}}" },
        { name: "ONBOARDING_MAX_STAGE_RETRY", example: "2", note: "" },
        { name: "ONBOARDING_DB_URL", example: "postgres://onboarding-db.internal:5432/onboarding", note: "secret ห้าม log" },
      ],
    },
    {
      service: "document-collection-service",
      vars: [
        { name: "ESIGN_WEBHOOK_SECRET", example: "whsec_xxx", note: "secret ใช้ validate webhook signature" },
        { name: "DOC_SIGNATURE_STUCK_THRESHOLD_HOURS", example: "24", note: "ดู {{ref:policy:document-signature-policy}}" },
      ],
    },
    {
      service: "access-provisioning-service",
      vars: [
        { name: "PROVISION_QUEUE_MAX_DEPTH", example: "200", note: "" },
        { name: "IT_TICKETING_API_KEY", example: "itk_live_xxx", note: "secret" },
        { name: "BADGE_SYSTEM_TIMEOUT_MS", example: "8000", note: "ดู {{ref:deployment:provisioning-timeout-tuning}}" },
      ],
    },
    {
      service: "compliance-tracker-service",
      vars: [
        { name: "COMPLIANCE_DEFAULT_DEADLINE_DAYS", example: "30", note: "" },
        { name: "COMPLIANCE_REMINDER_LEAD_DAYS", example: "7", note: "ส่ง reminder ล่วงหน้ากี่วันก่อนถึง deadline" },
      ],
    },
  ],
  policies: [
    {
      slug: "day-one-access-policy",
      title: "นโยบายสิทธิ์การเข้าถึงต้องพร้อมก่อนวันเริ่มงาน",
      tags: ["provisioning", "day-one", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:access-provisioning}} ต้องขยับสถานะ bundle สิทธิ์ทั้งหมดไป `confirmed` ภายในเวลา 17:00 ของวันทำการก่อนวันเริ่มงานจริงเสมอ ไม่ใช่รอให้ถึงเช้าวันเริ่มงานแล้วค่อยเริ่ม provision",
        "ถ้าถึง deadline แล้วยังมีรายการค้างที่ `queued` หรือ `dispatched` ระบบจะ escalate ไปหาทีม IT ทันทีแบบ manual แทนที่จะรอ queue ประมวลผลตามปกติ เพราะพนักงานใหม่ที่ไม่มี laptop หรือ badge วันแรกกระทบภาพลักษณ์บริษัทโดยตรง",
      ],
      sections: [
        {
          heading: "ทำไมตั้ง deadline ที่ 17:00 วันก่อนหน้า ไม่ใช่เช้าวันเริ่มงาน",
          body: "ทีม IT ต้องมีเวลาเตรียม laptop จริง (ติดตั้ง software, ตรวจสอบ) และประสานงานกับ reception เรื่อง badge ล่วงหน้า ถ้าปล่อยให้ provisioning เสร็จตอนเช้าวันเริ่มงานพอดี จะไม่เหลือ buffer เวลาให้แก้ปัญหาถ้ามีอะไรพลาด",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อพนักงานใหม่เริ่มงานแบบ remote-first",
        tags: ["provisioning", "remote", "edge-case"],
        body: [
          "พนักงานที่ onboarding แบบ remote (ไม่ต้องเข้าออฟฟิศวันแรก) ไม่ต้องมี badge พร้อมก่อน deadline — ระบบจะตัด `badge` ออกจาก bundle ที่ต้องผ่านเงื่อนไข day-one อัตโนมัติ แต่ยังคงบังคับ `laptop` และ `software` เหมือนเดิมเพราะจำเป็นต่อการทำงานตั้งแต่วันแรก",
          "สำหรับ remote hire ที่ต้อง ship laptop ทางไปรษณีย์ deadline การ `dispatched` ขยับเป็น 5 วันทำการก่อนวันเริ่มงานแทน 17:00 วันก่อนหน้า เพื่อให้มีเวลาจัดส่งเพียงพอ",
        ],
      },
    },
    {
      slug: "task-deadline-escalation-policy",
      title: "นโยบาย Deadline และการ Escalate Task ที่เลยกำหนด",
      tags: ["task", "deadline", "policy"],
      isPrimary: true,
      intro: [
        "ทุก task จาก {{ref:module:task-assignment}} มี deadline ตาม template ของ role นั้นๆ (ปกติ 1-5 วันทำการหลังสร้าง) task ที่เลยกำหนดจะถูก reassign ไปให้หัวหน้างานเห็นในรายงานประจำวันโดยอัตโนมัติผ่าน `reassignOverdueTasks`",
        "task ที่เกี่ยวกับความปลอดภัย (เช่น เซ็น NDA) ไม่รอรอบ cron ปกติ — ถูก escalate ทันทีที่เลยกำหนดโดยไม่ต้องรอ batch job รายวัน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Task ถูก Block โดย Task อื่นที่ยังไม่เสร็จ",
        tags: ["task", "deadline", "edge-case"],
        body: [
          "ถ้า task A ต้องรอ task B เสร็จก่อนถึงจะเริ่มได้ (เช่น เซ็นสัญญาจ้างต้องเสร็จก่อนถึงจะขอ provision software ที่ต้อง background check ผ่านก่อน) deadline ของ task A จะนับจากตอนที่ task B เสร็จ ไม่ใช่นับจากตอนสร้าง case",
          "ถ้า task B ที่ block อยู่เลยกำหนดของตัวเองไปแล้ว ระบบจะ escalate เฉพาะ task B เท่านั้น ไม่แจ้ง task A ซ้ำเพราะ A ยังไม่ถึงรอบนับเวลาของตัวเอง เพื่อไม่ให้หัวหน้างานเห็น alert ซ้ำซ้อนโดยไม่จำเป็น",
        ],
      },
    },
    {
      slug: "document-signature-policy",
      title: "นโยบายเอกสารเซ็นค้าง (Document Stuck)",
      tags: ["document", "stuck", "policy"],
      isPrimary: true,
      intro: [
        "เอกสารที่อยู่ในสถานะ `signed` (เซ็นแล้วที่ฝั่ง vendor) แต่ไม่มี webhook ยืนยัน `verified` เข้ามาภายใน `DOC_SIGNATURE_STUCK_THRESHOLD_HOURS` (ค่าปกติ 24 ชั่วโมง) จะถูก mark เป็น `stuck` โดยอัตโนมัติ",
        "ระบบไม่ trigger การเซ็นใหม่อัตโนมัติเมื่อเจอ `stuck` — ต้องมีคนตรวจก่อนว่าเอกสารเซ็นจริงสำเร็จที่ฝั่ง vendor หรือไม่ เพื่อป้องกันการส่งคำขอเซ็นซ้ำให้พนักงานที่เซ็นไปแล้ว",
      ],
      sections: [
        {
          heading: "ความคล้ายกับปัญหา webhook อื่นในระบบ",
          body: "รูปแบบนี้คล้ายกับเอกสารที่ค้างในหลายระบบที่พึ่งพา webhook จาก vendor ภายนอก — รากของปัญหาคือ webhook เป็น best-effort delivery ไม่มีการรับประกันว่าจะส่งถึงเสมอ ระบบจึงต้องมี timeout-based fallback แทนที่จะเชื่อ webhook อย่างเดียว",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Vendor แจ้ง Outage ล่วงหน้า",
        tags: ["document", "vendor-outage", "edge-case"],
        body: [
          "ถ้า e-signature vendor ประกาศ maintenance window ล่วงหน้า ทีมจะปิดการ mark `stuck` อัตโนมัติชั่วคราวสำหรับเอกสารที่อยู่ในช่วงเวลานั้น เพื่อไม่ให้เกิด false alert จำนวนมากพร้อมกัน",
          "หลัง maintenance window ผ่านไป ระบบจะ query สถานะเอกสารทั้งหมดที่ค้างระหว่างนั้นด้วยมือครั้งเดียวแทนการรอ webhook ที่อาจไม่ถูกส่งซ้ำจาก vendor",
        ],
      },
    },
    {
      slug: "background-check-gating-policy",
      title: "นโยบายการกันวันเริ่มงานด้วยผลตรวจประวัติ",
      tags: ["background-check", "policy"],
      isPrimary: true,
      intro: [
        "พนักงานใหม่จะขยับไป stage `provisioning_pending` ไม่ได้จนกว่าผลตรวจประวัติ (background check) จะกลับมาเป็น `clear` เท่านั้น — ผล `pending` หรือ `flagged` block การขอสิทธิ์เข้าถึงทั้งหมดโดยอัตโนมัติ",
        "โดยเฉลี่ยผลตรวจประวัติใช้เวลา 3-5 วันทำการ ถ้าเกิน 10 วันทำการโดยยังไม่มีผล ระบบจะ escalate ไปหาทีม HR ให้ติดต่อ vendor โดยตรงแทนการรอ webhook",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับตำแหน่งที่ไม่บังคับตรวจประวัติ",
        tags: ["background-check", "edge-case"],
        body: [
          "ตำแหน่งบาง role (เช่น พนักงาน contract ระยะสั้นที่ไม่แตะข้อมูลลูกค้าหรือระบบ production) ไม่ต้องผ่าน background check เลยตามนโยบายบริษัท — {{ref:module:onboarding-workflow-engine}} จะข้าม stage `background_check_pending` ไปเลยสำหรับ role กลุ่มนี้ ไม่ใช่รอให้ status เป็น `not_required` เหมือน role ทั่วไป",
          "ถ้า role ของพนักงานถูกเปลี่ยนระหว่างที่ onboarding case ยังไม่จบ (เช่น เปลี่ยนจาก contractor เป็น full-time) ระบบจะประเมินใหม่ทันทีว่าต้องเริ่ม background check หรือไม่ แม้ case จะผ่าน stage นั้นไปแล้วก็ตาม",
        ],
      },
    },
    {
      slug: "compliance-training-deadline-policy",
      title: "นโยบาย Deadline การอบรมภาคบังคับ",
      tags: ["compliance", "training", "policy"],
      isPrimary: true,
      intro: [
        "training บังคับทุกประเภท (เช่น อบรมความปลอดภัยข้อมูล, จรรยาบรรณ) มี deadline เริ่มนับจากวันเริ่มงานจริง ไม่ใช่วันที่สร้าง case ค่าปกติคือ `COMPLIANCE_DEFAULT_DEADLINE_DAYS` (30 วัน) และระบบส่ง reminder ล่วงหน้า `COMPLIANCE_REMINDER_LEAD_DAYS` (7 วัน) ก่อนถึงกำหนด",
        "รายการที่เลยกำหนดถูก escalate ไปหาหัวหน้างานโดยตรง ไม่ใช่แค่แจ้งพนักงาน เพราะทีม compliance ถือว่าหัวหน้างานมีหน้าที่ดูแลให้ลูกทีมทำ training บังคับให้เสร็จตามเวลา",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Reminder ไม่ถูกส่งเพราะ LMS ไม่ยืนยันสถานะ",
        tags: ["compliance", "reminder", "edge-case"],
        body: [
          "ถ้า LMS ภายนอกไม่ส่ง webhook ยืนยันว่าพนักงานลงทะเบียนคอร์สแล้วภายใน 48 ชั่วโมงหลัง `scheduleComplianceItem` ระบบจะไม่ถือว่า item นั้น \"ไม่มีอยู่จริง\" — ยังคงนับ deadline ต่อไปตามปกติโดยใช้วันที่สร้าง item เป็นฐาน ไม่ใช่รอ LMS ยืนยันก่อนเริ่มนับ",
          "เหตุผลที่ไม่รอ LMS ยืนยันก่อนเริ่มนับเวลา เพราะเคยเกิดกรณีที่ LMS integration ล่มหลายวันแล้วไม่มีใครสังเกต ทำให้ deadline เลื่อนไปเรื่อยๆ โดยไม่มีใครรู้ตัว ดู {{ref:incident:training-vendor-api-timeout}}",
        ],
      },
    },
    {
      slug: "buddy-assignment-policy",
      title: "นโยบายเงื่อนไขการจับคู่ Buddy",
      tags: ["buddy", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:buddy-matching}} เลือก buddy จาก department เดียวกันหรือใกล้เคียงก่อนเสมอ และต้องมี timezone overlap อย่างน้อย 4 ชั่วโมงกับพนักงานใหม่ เพื่อให้นัดคุยกันได้จริงในเวลาทำงานปกติ",
        "buddy หนึ่งคนรับดูแลพนักงานใหม่พร้อมกันได้ไม่เกิน 2 คนในช่วงเวลาเดียวกัน — ถ้าเกินนี้ `findCandidateBuddies` จะไม่เสนอชื่อนั้นแม้เงื่อนไขอื่นจะตรงหมด",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อไม่มี Buddy ที่ตรงเงื่อนไขในทีมเดียวกัน",
        tags: ["buddy", "edge-case"],
        body: [
          "ถ้า department ของพนักงานใหม่มีคนน้อยเกินไปจนหา buddy ที่ผ่านเงื่อนไข timezone overlap ไม่ได้เลย ระบบจะขยายขอบเขตการค้นหาไปยัง department ใกล้เคียงที่ทำงานร่วมกันบ่อย (cross-functional partner team) แทนที่จะปล่อยให้ไม่มี buddy เลย",
          "ถ้าขยายขอบเขตแล้วยังหาไม่ได้ภายใน 3 วันทำการ ระบบจะแจ้งหัวหน้างานให้เสนอชื่อ buddy เองด้วยมือ แทนที่จะรอ algorithm ต่อไปเรื่อยๆ โดยไม่มีกำหนด",
        ],
      },
    },
    {
      slug: "task-duplication-prevention-policy",
      title: "นโยบายป้องกัน Task ซ้ำ",
      tags: ["task", "dedup", "policy"],
      isPrimary: false,
      intro: [
        "`generateTaskList` ต้องเช็คก่อนเสมอว่ามี task ประเภทเดียวกันสำหรับ `hireId` นี้อยู่แล้วหรือไม่ ก่อนสร้างใหม่ — ใช้ unique constraint ระดับ database บน `(hireId, taskType)` ไม่ใช่แค่เช็คใน application layer เพื่อกันกรณี concurrent call",
        "เหตุผลที่ต้องกันที่ database layer ด้วย เพราะเคยเกิดเหตุการณ์ retry ของ event consumer ทำให้ `generateTaskList` ถูกเรียกซ้ำในเวลาไล่เลี่ยกันมาก ดู {{ref:incident:duplicate-onboarding-tasks-retry-bug}}",
      ],
    },
    {
      slug: "provisioning-reversal-policy",
      title: "นโยบายการเพิกถอนสิทธิ์เมื่อ Offer ถูกยกเลิก",
      tags: ["provisioning", "reversal", "policy"],
      isPrimary: false,
      intro: [
        "ถ้าพนักงานใหม่ยกเลิกการเข้าร่วมงานหลังจากที่สิทธิ์บางส่วนถูก provision ไปแล้ว (เช่น สั่ง laptop ไปแล้ว) ทีม HR ต้องกด `revokeAccess` ด้วยมือเสมอ ระบบไม่เพิกถอนอัตโนมัติแม้ case จะถูก mark เป็น cancelled",
        "เหตุผลที่ไม่เพิกถอนอัตโนมัติ เพราะสิทธิ์บางอย่าง (เช่น laptop ที่ ship ไปแล้ว) ต้องมีขั้นตอนติดตามคืนอุปกรณ์ทางกายภาพก่อน การเพิกถอนสิทธิ์ digital อัตโนมัติโดยไม่มีคนตรวจอาจทำให้ตามคืนอุปกรณ์ยากขึ้น",
      ],
    },
    {
      slug: "role-based-access-tier-policy",
      title: "นโยบายระดับสิทธิ์การเข้าถึงตาม Role",
      tags: ["provisioning", "role", "policy"],
      isPrimary: false,
      intro: [
        "แต่ละ role มี `accessBundleId` ที่กำหนดไว้ล่วงหน้าตายตัว — HR ไม่สามารถเลือก software license แยกทีละตัวให้พนักงานใหม่ผ่าน OnboardFlow ได้ ต้องเป็นชุดที่ approve ไว้แล้วเท่านั้น เพื่อลดความเสี่ยงการให้สิทธิ์เกินจำเป็น",
        "การขอสิทธิ์เพิ่มเติมนอกเหนือจาก bundle มาตรฐานต้องทำผ่านระบบ IT ticketing โดยตรงหลังพนักงานเริ่มงานแล้วเท่านั้น ไม่ใช่ผ่าน OnboardFlow",
      ],
    },
    {
      slug: "cohort-scheduling-policy",
      title: "นโยบายการจัดกลุ่มวันเริ่มงาน (Cohort)",
      tags: ["cohort", "scheduling", "policy"],
      isPrimary: false,
      intro: [
        "บริษัทกำหนดวันเริ่มงานพนักงานใหม่เป็นรอบคงที่ (ทุกวันจันทร์แรกและวันจันทร์ที่สามของเดือน) เพื่อให้ทีม HR และ IT เตรียมงานเป็นชุดแทนที่จะกระจายทุกวัน",
        "case ที่ถูกสร้างใกล้วัน cohort เกินไป (น้อยกว่า 5 วันทำการ) ระบบจะเตือน HR ทันทีว่าอาจ provisioning ไม่ทัน day-one deadline ตาม {{ref:policy:day-one-access-policy}}",
      ],
    },
    {
      slug: "contractor-onboarding-variance-policy",
      title: "นโยบายความแตกต่างของ Onboarding พนักงาน Contract",
      tags: ["contractor", "policy"],
      isPrimary: false,
      intro: [
        "พนักงาน contract ใช้ template task และ compliance item ชุดที่สั้นกว่าพนักงานประจำ (ตัด item ที่เกี่ยวกับสวัสดิการและ training ระยะยาวออก) และไม่ผ่าน {{ref:module:buddy-matching}} เพราะระยะเวลาทำงานสั้นเกินจะคุ้มค่ากับการจับคู่",
        "สิทธิ์การเข้าถึงของ contractor ผ่าน {{ref:module:access-provisioning}} มี expiry date ผูกกับวันสิ้นสุดสัญญาเสมอ ต่างจากพนักงานประจำที่ไม่มี expiry date ในระบบ",
      ],
    },
  ],
  incidents: [
    {
      slug: "day-one-access-queue-bug",
      title: "พนักงานใหม่ไม่มีสิทธิ์เข้าระบบวันแรกเพราะ provisioning queue ค้าง",
      tags: ["provisioning", "queue"],
      summary:
        "พนักงานใหม่ 6 คนของ cohort เดียวกันมาถึงออฟฟิศวันแรกแต่ล็อกอินระบบไม่ได้เลย badge ก็ใช้ไม่ได้ ทั้งที่ตาม {{ref:policy:day-one-access-policy}} ควรพร้อมตั้งแต่เย็นวันก่อนหน้า",
      investigation:
        "ตรวจ {{ref:module:access-provisioning}} พบว่า `provision_requests` ของทั้ง 6 คนค้างที่สถานะ `queued` มาตั้งแต่เมื่อวาน ไม่มีตัวไหนขยับไป `dispatched` เลย",
      cause:
        "worker ที่ประมวลผลคิว provisioning ล่มเงียบๆ ตั้งแต่บ่ายวันก่อนหน้าเพราะ unhandled exception ตอนเจอ `accessBundleId` ที่ไม่มีอยู่จริง (ตั้งค่าผิดตอนสร้าง role ใหม่ล่าสุด) แล้ว worker process ก็ตายไปเลยโดยไม่มีการ restart อัตโนมัติ ทำให้ request ที่เหลือทั้งหมดหลังจากนั้นค้างในคิวเงียบๆ",
      resolution:
        "วิศวกร on-call restart worker ด้วยมือ แก้ `accessBundleId` ที่ผิดให้ตรง แล้ว force process คิวที่ค้างทั้งหมด พนักงานที่ได้รับผลกระทบได้สิทธิ์เข้าระบบภายในเที่ยงวันเดียวกัน ล่าช้ากว่าที่ควรครึ่งวัน",
      followup:
        "เพิ่ม health check และ auto-restart ให้ worker ของคิว provisioning และเพิ่ม validation ที่ต้องเช็คว่า `accessBundleId` มีอยู่จริงก่อน enqueue ไม่ใช่ปล่อยให้ worker พังตอนประมวลผล",
    },
    {
      slug: "background-check-outage-blocked-starts",
      title: "Background check vendor ล่มทำวันเริ่มงานเลื่อนทั้ง cohort",
      tags: ["background-check", "vendor-outage"],
      summary:
        "vendor ตรวจประวัติภายนอกล่มต่อเนื่อง 3 วัน ทำให้พนักงานใหม่ 12 คนที่ควรเริ่มงานตาม cohort ถัดไปติดอยู่ที่ stage `background_check_pending` ทั้งหมด",
      investigation:
        "ตรวจสอบ integration log พบว่า API ของ vendor ตอบ 503 ต่อเนื่องตั้งแต่เช้าวันจันทร์ {{ref:module:onboarding-workflow-engine}} ไม่มี fallback สำหรับสถานการณ์นี้เลย เพียงแค่รอ webhook ที่จะไม่มีวันมา",
      cause:
        "ทีมไม่เคยออกแบบ escalation path สำหรับกรณี vendor ล่มระดับนี้ — นโยบาย {{ref:policy:background-check-gating-policy}} มี escalation หลัง 10 วันทำการ แต่ 3 วันแรกยังไม่ถึงเกณฑ์นั้น ทำให้ไม่มีใครรู้ตัวจนพนักงานเริ่มโทรมาถาม HR เอง",
      resolution:
        "ทีม HR ติดต่อ vendor ผ่านช่องทาง account manager โดยตรงแทนการรอ API เพื่อขอผลตรวจแบบ manual สำหรับ cohort นี้ ทำให้เริ่มงานได้ช้ากว่าเดิม 2 วัน",
      followup:
        "เพิ่ม alert แยกสำหรับ vendor error rate สูงผิดปกติ (ไม่ต้องรอถึง 10 วัน) และเปิดช่องทางสำรอง manual review กับ vendor ไว้ล่วงหน้าสำหรับสถานการณ์ vendor outage",
    },
    {
      slug: "duplicate-onboarding-tasks-retry-bug",
      title: "Task ซ้ำเพราะ event consumer retry",
      tags: ["task", "duplicate"],
      summary:
        "พนักงานใหม่หลายคนเห็น task \"กรอกแบบฟอร์มภาษี\" ปรากฏซ้ำกัน 2-3 รายการในหน้า checklist ของตัวเอง สร้างความสับสนว่าต้องทำกี่รอบ",
      investigation:
        "ตรวจ log {{ref:module:task-assignment}} พบว่า `generateTaskList` ถูกเรียกซ้ำหลายครั้งสำหรับ `hireId` เดียวกันในเวลาไล่เลี่ยกัน ตรงกับช่วงที่ event queue มีการ retry message",
      cause:
        "message consumer ไม่ได้ทำ idempotency check ก่อนประมวลผล event `onboarding.started` — เมื่อ queue ส่ง message ซ้ำ (เพราะ consumer ack ช้ากว่า visibility timeout) ระบบก็สร้าง task ชุดใหม่ทับซ้อนโดยไม่รู้ตัว",
      resolution:
        "เพิ่ม unique constraint ระดับ database บน `(hireId, taskType)` ตาม {{ref:policy:task-duplication-prevention-policy}} แล้ว dedupe task ซ้ำที่มีอยู่แล้วด้วยสคริปต์ครั้งเดียว",
      followup:
        "ตรวจสอบ event consumer อื่นในระบบว่ามีความเสี่ยงจากการไม่ทำ idempotency check แบบเดียวกันหรือไม่ โดยเฉพาะตัวที่แตะข้อมูลที่ผู้ใช้เห็นตรงๆ",
    },
    {
      slug: "compliance-reminder-never-fired",
      title: "Reminder อบรมภาคบังคับไม่เคยถูกส่งเลยเดือนหนึ่ง",
      tags: ["compliance", "reminder"],
      summary:
        "ทีม compliance สังเกตว่าอัตราการอบรมเสร็จตรงเวลาลดลงผิดปกติในเดือนที่ผ่านมา ตรวจสอบพบว่าพนักงานใหม่หลายคนไม่เคยได้รับ reminder อีเมลเลยสักฉบับ",
      investigation:
        "ตรวจ {{ref:module:compliance-tracker}} พบว่า cron job ที่ส่ง reminder ตาม `COMPLIANCE_REMINDER_LEAD_DAYS` ไม่ได้ถูก trigger เลยตั้งแต่การ deploy ครั้งล่าสุด เพราะ cron schedule ถูกลบออกจาก config ไฟล์ใหม่โดยไม่ตั้งใจตอน merge",
      cause:
        "การรีวิว config ไฟล์ deployment ไม่มีใครสังเกตว่า cron entry หายไป เพราะ diff ของไฟล์ config ยาวและมีการเปลี่ยนหลายจุดพร้อมกันในรอบ deploy นั้น",
      resolution:
        "เพิ่ม cron entry กลับเข้าไป แล้วรัน reminder ย้อนหลังด้วยมือสำหรับ item ที่ควรได้รับ reminder ไปแล้วแต่ยังไม่เลยกำหนดจริง",
      followup:
        "เพิ่ม monitoring แยกที่เช็คว่า cron job สำคัญยังรันอยู่จริง (heartbeat metric) ไม่ใช่พึ่งพาแค่การตรวจ config ตอน code review",
    },
    {
      slug: "buddy-matching-schedule-mismatch",
      title: "Buddy กับพนักงานใหม่ timezone ไม่ตรงกันจริง ทั้งที่ algorithm บอกว่าผ่าน",
      tags: ["buddy", "timezone"],
      summary:
        "พนักงานใหม่รายงานว่าไม่เคยนัดคุยกับ buddy ได้เลยเพราะเวลาทำงานไม่ตรงกันจริง ทั้งที่ {{ref:module:buddy-matching}} จับคู่ให้ตามเงื่อนไข timezone overlap แล้ว",
      investigation:
        "ตรวจสอบข้อมูล timezone ของ buddy ที่ถูกจับคู่ พบว่าเป็นค่าที่ตั้งไว้ตอนสมัครงานครั้งแรกเมื่อ 2 ปีก่อน ซึ่งตอนนั้น buddy ยังทำงานอยู่ office คนละภูมิภาค แต่ย้ายทีมแล้วไม่มีใครอัปเดตค่านี้",
      cause:
        "ระบบไม่มีกลไก sync ค่า timezone จาก HRIS มาอัปเดตให้ {{ref:module:buddy-matching}} แบบสม่ำเสมอ — ดึงมาครั้งเดียวตอนพนักงานคนนั้นเข้าระบบครั้งแรกเท่านั้น",
      resolution:
        "จับคู่ buddy ใหม่ให้พนักงานที่ได้รับผลกระทบด้วยมือโดยใช้ timezone ปัจจุบันจริง แล้วอัปเดตค่า timezone ของ buddy คนเดิมในระบบให้ตรงกับปัจจุบัน",
      followup:
        "เพิ่ม nightly sync job ดึง timezone ล่าสุดจาก HRIS มาอัปเดตให้ {{ref:module:buddy-matching}} แทนการพึ่งค่าที่ดึงมาครั้งเดียวตอนแรกเข้าระบบ",
    },
    {
      slug: "esignature-webhook-lost-stuck-pending",
      title: "สัญญาจ้างเซ็นแล้วแต่ระบบยังค้างสถานะ pending",
      tags: ["document", "stuck", "esign"],
      summary:
        "พนักงานใหม่แจ้งว่าเซ็นสัญญาจ้างผ่าน e-signature vendor ไปแล้วตั้งแต่เมื่อวาน แต่ในระบบ OnboardFlow ยังแสดงสถานะ \"รอเซ็น\" อยู่ ทำให้ onboarding case ค้างไม่ขยับ stage",
      investigation:
        "เช็คสถานะเอกสารใน {{ref:module:document-collection}} พบว่าอยู่ในสถานะ `stuck` มาตั้งแต่เมื่อวาน — ตรงกับนิยามใน {{ref:policy:document-signature-policy}} ที่ค้างเกิน `DOC_SIGNATURE_STUCK_THRESHOLD_HOURS` แล้วไม่มีการ retry อัตโนมัติ",
      cause:
        "ตรวจสอบฝั่ง vendor dashboard พบว่าเอกสารเซ็นสำเร็จจริงที่ฝั่ง vendor แต่ webhook ยืนยันหายไประหว่างทาง (ปัญหาเดียวกับที่อธิบายไว้ใน {{ref:module:document-collection}} เรื่อง state `stuck`)",
      resolution:
        "วิศวกร on-call เรียก `getDocumentStatus` ยืนยันสถานะจริงจาก vendor API โดยตรง แล้ว trigger การอัปเดตสถานะด้วยมือให้เป็น `verified` case ขยับ stage ต่อได้ภายใน 15 นาทีหลังจากนั้น",
      followup:
        "เพิ่มเข้า pattern ที่ทีมกำลังพิจารณาว่าควรมี job อัตโนมัติ query สถานะจาก vendor เมื่อเอกสารอยู่ใน `stuck` เกิน 1 ชั่วโมง แทนที่จะรอให้วิศวกรทำด้วยมือทุกครั้ง",
    },
    {
      slug: "badge-access-wrong-building",
      title: "Badge พนักงานใหม่เปิดได้แค่ตึกผิด",
      tags: ["provisioning", "badge"],
      summary:
        "พนักงานใหม่ที่ office สาขาใหม่แจ้งว่า badge สแกนเข้าตึกที่ตัวเองทำงานไม่ได้ แต่สแกนเข้าตึกสำนักงานใหญ่ (ที่ไม่เกี่ยวข้อง) ได้แทน",
      investigation:
        "ตรวจ {{ref:module:access-provisioning}} พบว่า `accessBundleId` ของพนักงานคนนี้ผูก badge zone เป็นสำนักงานใหญ่ (ค่า default) แทนที่จะเป็น zone ของสาขาใหม่",
      cause:
        "ตอนตั้งค่า role สำหรับสาขาใหม่ ทีมลืมสร้าง `accessBundleId` เฉพาะของสาขานั้น จึงยังใช้ bundle เดิมที่ผูก zone สำนักงานใหญ่ไว้เป็น fallback โดยไม่มีใครตรวจพบตอน setup",
      resolution:
        "สร้าง `accessBundleId` ใหม่เฉพาะสาขา ผูก badge zone ให้ถูกต้อง แล้วสั่ง `revokeAccess` ตัวเก่ากับ `provisionAccess` ใหม่ให้พนักงานที่ได้รับผลกระทบ ใช้เวลาประมาณ 1 ชั่วโมง",
      followup:
        "เพิ่มขั้นตอนตรวจสอบ badge zone mapping ให้เป็นส่วนหนึ่งของ checklist เปิดสาขาใหม่ ก่อนอนุมัติ role แรกของสาขานั้น",
    },
    {
      slug: "laptop-inventory-shortage-day-one",
      title: "Laptop ไม่พอสำหรับ cohort ใหญ่ผิดปกติ",
      tags: ["provisioning", "inventory"],
      summary:
        "cohort เดือนหนึ่งมีพนักงานใหม่เข้าพร้อมกัน 25 คน (สูงกว่าค่าเฉลี่ยปกติ 3 เท่า) ทำให้คลัง laptop สำรองของทีม IT ไม่พอแจกครบ",
      investigation:
        "ตรวจสอบ {{ref:module:access-provisioning}} พบว่า `provision_requests` จำนวน 6 รายการค้างที่ `dispatched` แต่ไม่มี laptop จริงให้ส่งมอบ ทั้งที่ระบบ digital มองว่าสิทธิ์ถูกจัดสรรแล้ว",
      cause:
        "OnboardFlow ไม่รู้จัก concept ของ inventory จำนวนจำกัดทางกายภาพเลย — ระบบสมมติว่ามี laptop พร้อมเสมอ ไม่มีการเช็คสต็อกจริงก่อนยืนยัน `dispatched`",
      resolution:
        "ทีม IT ยืม laptop จากแผนกอื่นชั่วคราวและเร่งสั่งซื้อเพิ่ม พนักงาน 6 คนที่ได้รับผลกระทบได้ laptop ช้ากว่ากำหนด 2 วัน",
      followup:
        "เสนอให้ {{ref:policy:cohort-scheduling-policy}} ผูกกับการเช็ค inventory ล่วงหน้าก่อนอนุมัติ cohort ขนาดใหญ่ ไม่ใช่แค่เช็คจำนวนวันทำการเหลือ",
    },
    {
      slug: "contractor-misclassified-wrong-policy",
      title: "Contractor ถูกจัดเป็นพนักงานประจำผิดประเภททำให้ onboarding ผิดเงื่อนไข",
      tags: ["contractor", "misclassification"],
      summary:
        "พนักงาน contract คนหนึ่งถูกส่ง task และ compliance item ชุดเต็มของพนักงานประจำทั้งหมด รวมถึงถูกจับคู่ buddy ทั้งที่ตาม {{ref:policy:contractor-onboarding-variance-policy}} ไม่ควรเกิดขึ้น",
      investigation:
        "ตรวจสอบ `roleId` ที่ใช้สร้าง case พบว่าถูกตั้งเป็น role พนักงานประจำผิดพลาดตั้งแต่ตอนกรอกข้อมูลใน HRIS แล้ว {{ref:module:onboarding-workflow-engine}} ก็ดึงค่าตามนั้นมาใช้ตรงๆ ไม่มีการ cross-check ประเภทการจ้างงาน",
      cause:
        "ไม่มี validation ระหว่าง `employmentType` กับ `roleId` ที่เลือก — ระบบเชื่อค่าที่กรอกมาจาก HRIS ทั้งหมดโดยไม่ตรวจสอบความสอดคล้อง",
      resolution:
        "แก้ `roleId` ให้ถูกต้องด้วยมือ แล้วยกเลิก task/compliance item ที่ไม่เกี่ยวข้อง และยกเลิกการจับคู่ buddy ที่เกิดไปแล้วตามนโยบาย contractor",
      followup:
        "เพิ่ม validation เตือนเมื่อ `employmentType` กับ role ที่เลือกไม่สอดคล้องกันตั้งแต่ตอนสร้าง case ก่อนที่จะ generate task ผิดชุดออกไป",
    },
    {
      slug: "workflow-engine-stuck-mid-transition",
      title: "Case ค้างกลาง state machine เพราะ event มาไม่ครบ",
      tags: ["workflow", "stuck"],
      summary:
        "case ของพนักงานคนหนึ่งค้างที่ stage `documents_pending` นานเกิน `STAGE_TRANSITION_TIMEOUT_HOURS` ทั้งที่เอกสารทุกอย่างเสร็จหมดแล้วตามที่ตรวจสอบด้วยมือ",
      investigation:
        "ตรวจ log {{ref:module:onboarding-workflow-engine}} พบว่า `advanceStage` ไม่เคยถูกเรียกเลยแม้ {{ref:module:document-collection}} จะ publish event `document.signed` ครบทุกฉบับแล้ว",
      cause:
        "workflow-engine รอ event ครบทุกประเภทเอกสารก่อนจะขยับ stage แต่หนึ่งใน document type ที่กำหนดไว้ในเงื่อนไข (`nda`) ถูกถอดออกจาก requirement ของ role นี้ไปแล้วโดยทีม HR แต่ workflow-engine ยังใช้เงื่อนไขเดิมที่รอ `nda` อยู่ ทำให้รอ event ที่ไม่มีวันมาถึง",
      resolution:
        "แก้ไข case ด้วยมือให้ขยับ stage ต่อ แล้วอัปเดตเงื่อนไข requirement ของ role นี้ให้ตรงกับ template เอกสารปัจจุบัน",
      followup:
        "เพิ่มการตรวจสอบความสอดคล้องระหว่าง document requirement ของแต่ละ role กับเงื่อนไขที่ workflow-engine ใช้จริง ให้เป็นส่วนหนึ่งของขั้นตอนแก้ template role",
    },
    {
      slug: "tax-form-validation-silent-rejection",
      title: "แบบฟอร์มภาษีถูกปฏิเสธเงียบๆ ไม่มีใครแจ้งพนักงาน",
      tags: ["document", "validation"],
      summary:
        "พนักงานใหม่กรอกแบบฟอร์มภาษีและเซ็นเรียบร้อยแล้ว แต่ทีม payroll แจ้งภายหลังว่าไม่เคยได้รับข้อมูลเลย ตรวจสอบพบว่าฟอร์มถูก vendor ปฏิเสธเพราะข้อมูลไม่ครบ",
      investigation:
        "ตรวจ `handleSignatureWebhook` ใน {{ref:module:document-collection}} พบว่า webhook ประเภท `validation_failed` ที่ vendor ส่งมาไม่ถูก handle เลย โค้ดรองรับแค่ `signed` กับ `expired` เท่านั้น ทำให้ event ประเภทนี้ถูกทิ้งเงียบๆ",
      cause:
        "vendor เพิ่ม webhook event ประเภทใหม่ (`validation_failed`) เข้ามาหลังจากทีมทำ integration เสร็จไปแล้ว ไม่มีใครติดตามการเปลี่ยนแปลง API ของ vendor อย่างสม่ำเสมอ",
      resolution:
        "เพิ่ม handler สำหรับ `validation_failed` ให้เปลี่ยนสถานะเอกสารกลับเป็น `sent` พร้อมแจ้งพนักงานให้กรอกใหม่ แล้วติดต่อพนักงานที่ได้รับผลกระทบให้กรอกฟอร์มใหม่ทันที",
      followup:
        "สมัครรับ changelog การเปลี่ยนแปลง API ของ e-signature vendor และเพิ่ม default handler ที่ log และแจ้งเตือนเมื่อเจอ webhook event ประเภทที่ไม่รู้จัก แทนที่จะทิ้งเงียบๆ",
    },
    {
      slug: "training-vendor-api-timeout",
      title: "LMS ภายนอกตอบช้าทำสถานะ Training ไม่อัปเดต",
      tags: ["compliance", "lms", "timeout"],
      summary:
        "พนักงานหลายคนอบรมความปลอดภัยข้อมูลเสร็จแล้วจริงในระบบ LMS แต่ {{ref:module:compliance-tracker}} ยังแสดงว่ายังไม่เสร็จ ทำให้ถูก escalate ไปหาหัวหน้างานเป็น false positive",
      investigation:
        "ตรวจสอบ integration log พบว่า LMS ตอบ webhook ยืนยันการอบรมเสร็จช้ากว่าปกติมาก (บางครั้งเกิน 6 ชั่วโมง) ในช่วงที่ LMS ทำ maintenance โดยไม่แจ้งล่วงหน้า",
      cause:
        "ไม่มี timeout handling พิเศษสำหรับกรณี LMS ตอบช้าผิดปกติ — ระบบ escalate ตาม deadline ปกติโดยไม่รู้ว่าจริงๆ แล้วอบรมเสร็จไปแล้ว แค่ webhook ยังไม่มาถึง",
      resolution:
        "query สถานะจาก LMS API โดยตรงสำหรับ item ที่ถูก escalate ทั้งหมดในช่วงนั้น พบว่าส่วนใหญ่เสร็จจริงแล้ว จึง mark completed ด้วยมือและแจ้งหัวหน้างานยกเลิก escalation ที่ผิดพลาด",
      followup:
        "เพิ่มการ poll สถานะจาก LMS API เป็น fallback เมื่อไม่ได้รับ webhook ภายในเวลาที่คาด แทนการพึ่ง webhook อย่างเดียว คล้ายกับแนวทางที่ใช้ใน {{ref:policy:document-signature-policy}}",
    },
    {
      slug: "cohort-overload-mass-start",
      title: "ระบบช้าลงทั้งระบบช่วง cohort ขนาดใหญ่เริ่มงานพร้อมกัน",
      tags: ["cohort", "performance"],
      summary:
        "ช่วงเช้าวัน cohort ที่มีพนักงานใหม่ 40 คนเริ่มงานพร้อมกัน ทีม support รายงานว่าหน้า checklist โหลดช้าและบางครั้ง timeout สำหรับพนักงานที่พยายามเข้าดู task ของตัวเอง",
      investigation:
        "ตรวจ metric ของ {{ref:module:task-assignment}} พบว่า `generateTaskList` ถูกเรียกพร้อมกัน 40 ครั้งในเวลาไล่เลี่ยกันตอน 9 โมงเช้า ทำให้ database connection pool เต็มชั่วขณะ",
      cause:
        "ระบบไม่มีการ stagger การสร้าง task ของแต่ละ case ใน cohort เดียวกัน — ทุก case ถูก trigger event เริ่มต้นพร้อมกันหมดเพราะ cron ที่เริ่ม cohort รันครั้งเดียวเป็น batch",
      resolution:
        "เพิ่ม connection pool ชั่วคราวเพื่อรองรับ load ทันที แล้วปล่อยให้คิวประมวลผลจนครบ ระบบกลับมาปกติภายใน 20 นาที ไม่มี case ไหนเสียหายจริง",
      followup:
        "แก้ cron ที่เริ่ม cohort ให้ stagger การสร้าง task ทีละกลุ่มเล็กแทนการยิงพร้อมกันทั้งหมด และพิจารณาปรับ {{ref:deployment:scaling-policy}} ของ service นี้สำหรับ cohort ขนาดใหญ่",
    },
    {
      slug: "buddy-matching-infinite-requeue-loop",
      title: "Buddy-matching วนหา candidate ซ้ำไม่จบเพราะเงื่อนไขขัดกันเอง",
      tags: ["buddy", "bug"],
      summary:
        "พนักงานใหม่คนหนึ่งไม่เคยได้รับการจับคู่ buddy เลยแม้จะผ่านไปเกิน 2 สัปดาห์ ตรวจสอบพบว่า `findCandidateBuddies` ถูกเรียกซ้ำหลายพันครั้งโดยไม่เคยคืนผลลัพธ์ที่ใช้ได้",
      investigation:
        "ตรวจ log {{ref:module:buddy-matching}} พบว่า candidate ที่ตรงเงื่อนไข department และ timezone ทุกคนมี `reportBuddyLoad` เต็มเพดานพอดี ทำให้ระบบกรองออกหมดทุกครั้ง แล้ว logic เดิม retry การค้นหาใหม่ทันทีแบบไม่มี backoff หรือเพดานจำนวนครั้ง",
      cause:
        "ทีมไม่เคยพิจารณากรณีที่ department เล็กมากจนไม่มี candidate เหลือเลยจริงๆ (ไม่ใช่แค่ยุ่งชั่วคราว) — retry loop จึงวนไม่จบเพราะเงื่อนไขไม่มีทางเป็นจริงได้เลยในสถานการณ์นี้",
      resolution:
        "หยุด retry loop ด้วยมือ แล้วมอบหมาย buddy จาก department ใกล้เคียงตามขั้นตอน escalation ปกติแทน",
      followup:
        "แก้ `findCandidateBuddies` ให้มีเพดานจำนวนครั้ง retry และ fallback ไป escalation อัตโนมัติตาม {{ref:policy:buddy-assignment-policy}} แทนการวนหาไม่มีที่สิ้นสุด",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/ONB-142-day-one-access-deadline`, `fix/ONB-158-duplicate-task-dedup`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(document-collection): เพิ่ม handler สำหรับ webhook validation_failed`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "event consumer ทุกตัวต้องมี idempotency check ก่อน merge เสมอ (ดูบทเรียนจาก {{ref:incident:duplicate-onboarding-tasks-retry-bug}}) และ handler ของ webhook จาก vendor ภายนอกต้องมี default case สำหรับ event ประเภทที่ไม่รู้จัก ไม่ใช่ทิ้งเงียบๆ" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `provisionAccess`, `generateTaskList` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ของพนักงาน", body: "`hireId` เป็น UUID เสมอ ไม่ใช้เลขพนักงาน (`employeeId`) จาก HRIS โดยตรง เพราะ `employeeId` อาจยังไม่ถูกออกจนกว่าจะผ่าน background check" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ case ต้องมี `hireId` เสมอ เพื่อไล่ log ข้าม service ได้ (onboarding-workflow-engine → document-collection → access-provisioning) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "webhook ที่ถูก reject หรือไม่รู้จัก log เป็น `error` เสมอแม้จะดูเหมือนเรื่องเล็ก เพราะบทเรียนจาก {{ref:incident:tax-form-validation-silent-rejection}} คือความเงียบทำให้ปัญหาไม่ถูกพบเร็ว" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`ONB_<DOMAIN>_<REASON>` เช่น `ONB_PROVISION_QUEUE_FULL`, `ONB_DOC_STUCK` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`ONB_BGCHECK_TIMEOUT`, `ONB_TASK_DUPLICATE`, `ONB_BUDDY_NO_CANDIDATE` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "integration"],
      sections: [
        { heading: "Mock vendor เสมอใน unit test", body: "test ที่แตะ e-signature หรือ background check vendor ต้อง mock response ทุกกรณี (success, timeout, malformed payload) ห้ามยิง request จริงแม้แต่ใน staging environment" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะ task generation ต้องมี test จำลอง event ซ้ำ (duplicate delivery) อย่างน้อย 1 เคสเสมอ — บทเรียนจาก {{ref:incident:duplicate-onboarding-tasks-retry-bug}}" },
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
      slug: "pii-handling-convention",
      title: "PII Handling Convention",
      tags: ["pii", "privacy"],
      intro: "OnboardFlow เก็บข้อมูลส่วนบุคคลจำนวนมาก (เลขบัตรประชาชน, ข้อมูลภาษี, ผลตรวจประวัติ) เอกสารนี้กำหนดกติกาการจัดการที่เข้มกว่า convention ทั่วไป",
      sections: [
        { heading: "ห้าม log เนื้อหา PII", body: "log message ห้ามมีเนื้อหาของแบบฟอร์มหรือผลตรวจประวัติปนอยู่เด็ดขาด แม้จะเป็น debug log ระดับ development ก็ตาม — log ได้แค่ `hireId` และสถานะเท่านั้น" },
        { heading: "การเก็บรักษาเอกสาร", body: "เอกสารที่เซ็นแล้วใน {{ref:module:document-collection}} เข้ารหัสที่ storage layer เสมอ และมี access log แยกต่างหากสำหรับทุกครั้งที่มีการเปิดดูเอกสาร ไม่ใช้ log กลางเดียวกับ log ทั่วไปของระบบ" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (mock vendor ทั้งหมด) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:access-provisioning}} และ {{ref:module:document-collection}} ต้องผ่าน integration test ครอบคลุมทุก webhook event type ที่รู้จักก่อน merge เสมอ เพราะบทเรียนจาก {{ref:incident:tax-form-validation-silent-rejection}}" },
      ],
    },
    {
      slug: "provisioning-timeout-tuning",
      title: "Provisioning Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (การเชื่อมต่อ IT ticketing system, badge system) เท่านั้น ไม่ใช่ business timeout ของ day-one access — ดูเรื่องนั้นที่ {{ref:policy:day-one-access-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| Badge system API call | 8s | env `BADGE_SYSTEM_TIMEOUT_MS` |\n| IT ticketing API call | 15s | env `IT_TICKETING_TIMEOUT_MS` |\n| Provisioning queue visibility timeout | 30s | queue config |\n| API gateway → onboarding-workflow-engine | 10s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนเมษายน 2026 พบว่า badge system timeout สั้นเกินไปช่วงที่ vendor นั้นมี latency สูงผิดปกติ ทำให้ request ถูกตัดก่อนที่ badge system จะตอบสำเร็จจริง ต้อง retry ซ้ำโดยไม่จำเป็น ขยับ timeout จาก 5s เป็น 8s แก้ปัญหาได้" },
      ],
    },
    {
      slug: "hris-migration-runbook",
      title: "HRIS Data Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อบริษัทเปลี่ยนหรืออัปเกรด HRIS หลัก ต้อง migrate mapping ระหว่าง `roleId` เดิมกับ role code ใหม่ใน {{ref:module:onboarding-workflow-engine}} และ {{ref:module:access-provisioning}} พร้อมกัน" },
        { heading: "ขั้นตอน", body: "1) หยุดรับ case ใหม่ชั่วคราว 2) export mapping เดิมสำรองไว้ 3) import mapping ใหม่จาก HRIS 4) รัน case ทดสอบใน staging ให้ครบทุก role ก่อนเปิดรับ case จริง" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = พนักงานใหม่เข้าระบบวันแรกไม่ได้เลย (ทั้ง cohort หรือหลายคน), Sev2 = กระทบ service เดียวหรือคนเดียว, Sev3 = กระทบเล็กน้อยไม่ถึงวันเริ่มงาน" },
        { heading: "กรณี vendor ภายนอกล่ม", body: "ทุกเหตุการณ์ที่เกี่ยวกับ background check หรือ e-signature vendor ล่มเกิน 1 ชั่วโมง ต้องแจ้ง HR lead ทันทีแม้จะยังไม่กระทบวันเริ่มงานจริงก็ตาม เพราะต้องเผื่อเวลาสำรอง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "provisioning queue depth เกิน 80% ของ `PROVISION_QUEUE_MAX_DEPTH`, เอกสารค้างสถานะ `stuck` เกิน 1 ชั่วโมง, case ค้างสถานะเดียวเกิน `STAGE_TRANSITION_TIMEOUT_HOURS`" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้ถึงเช้า" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ webhook handler ของ vendor ตัวใดตัวหนึ่งเริ่ม error rate สูงผิดปกติ หรือ provisioning queue เริ่มค้างสะสม ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:day-one-access-queue-bug}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip ขั้นตอน smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| onboarding-workflow-engine | 2 | 6 | CPU > 70% |\n| task-assignment | 1 | 4 | queue depth > 300 |\n| access-provisioning | 2 | 6 | queue depth > 150 (เข้มกว่าที่อื่นเพราะกระทบ day-one deadline) |" },
        { heading: "ข้อจำกัดช่วง cohort ใหญ่", body: "การ scale software service ช่วยได้แค่ระดับ queue processing ไม่ได้แก้ปัญหา inventory อุปกรณ์จริงที่จำกัด (ดู {{ref:incident:laptop-inventory-shortage-day-one}}) ต้องวางแผน inventory ล่วงหน้าแยกต่างหาก" },
      ],
    },
    {
      slug: "cohort-load-planning",
      title: "Cohort Load Planning",
      tags: ["cohort", "capacity"],
      intro: "ขั้นตอนวางแผนกำลังของทั้งระบบ (software + คน + อุปกรณ์) ก่อนแต่ละรอบ cohort ตาม {{ref:policy:cohort-scheduling-policy}}",
      sections: [
        { heading: "เช็คลิสต์ก่อน cohort", body: "เช็คจำนวน case ที่จะเริ่มพร้อมกัน เทียบกับ inventory laptop คงเหลือ, กำลังคนของทีม IT ที่พร้อมประมวลผล ticket, และจำนวน buddy ที่ยังรับเพิ่มได้ ก่อนอนุมัติ cohort อย่างเป็นทางการ" },
        { heading: "cohort ขนาดใหญ่ผิดปกติ", body: "cohort ที่มีจำนวนพนักงานใหม่เกิน 20 คนต้องแจ้งทีม platform ล่วงหน้าอย่างน้อย 1 สัปดาห์ เพื่อเตรียม stagger การสร้าง task และเช็ค connection pool ตามบทเรียนจาก {{ref:incident:cohort-overload-mass-start}}" },
      ],
    },
  ],
};
