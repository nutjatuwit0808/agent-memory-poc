import type { DomainProfile } from "../types.js";

// LexDraft — ระบบบริหารวงจรชีวิตสัญญาสำหรับทีมกฎหมาย (contract lifecycle management)
// เป็นระบบสมมติล้วนๆ ไม่เกี่ยวข้องกับ payment/refund/order ของ PayFlow เลย — distractor domain
export const legalContracts: DomainProfile = {
  id: "legal-contracts",
  displayName: "LexDraft — ระบบบริหารวงจรชีวิตสัญญา",
  summary: [
    "LexDraft คือแพลตฟอร์มบริหารวงจรชีวิตสัญญาสำหรับทีมกฎหมายองค์กร ครอบคลุมตั้งแต่ร่างสัญญาจาก template มาตรฐาน การเจรจาต่อรองเงื่อนไข (redline) ระหว่างคู่สัญญา การอนุมัติภายในตามลำดับชั้น การเซ็นสัญญาแบบอิเล็กทรอนิกส์ ไปจนถึงการติดตามพันธะสัญญาหลังลงนามและการแจ้งเตือนต่ออายุ",
    "ทีมวิศวกรรมออกแบบระบบให้แยกความรับผิดชอบชัดเจนระหว่าง 'การร่าง/เจรจา' กับ 'การอนุมัติ/ลงนาม' เพราะสองส่วนนี้มีผู้มีส่วนได้ส่วนเสียต่างกันมาก และความผิดพลาดในขั้นตอนอนุมัติหรือลำดับการเซ็นมีผลทางกฎหมายที่แก้ไขย้อนหลังไม่ได้ ต่างจากการแก้ไขร่างสัญญาที่ยังทำได้ก่อนลงนาม",
  ],
  domainTags: ["legal-contracts", "lexdraft"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:template-engine}} เป็นเจ้าของ template และ clause library ทั้งหมด ส่วน {{ref:module:clause-negotiator}} เก็บแค่ประวัติการเจรจา (redline history) ของสัญญาแต่ละฉบับ ไม่แตะ template ต้นทาง",
      "{{ref:module:signature-orchestrator}} ไม่รู้จักเนื้อหาสัญญาเลย รู้แค่ลำดับผู้เซ็นและสถานะการเซ็นแต่ละคน — การแยกแบบนี้ทำให้เปลี่ยน e-signature provider ได้โดยไม่กระทบ business logic ส่วนอื่น",
  ],
  apiGatewayNote: [
    "คำขอจากแอปทนายความ/paralegal เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ role ของผู้เรียกไปกับทุก request ก่อนส่งต่อให้ {{ref:module:approval-router}} ตัดสินใจว่าขั้นตอนถัดไปคืออะไร",
    "คำขอจากคู่สัญญาภายนอก (external party) ที่ต้องเซ็นสัญญา ใช้ endpoint แยกที่ไม่ต้อง login เข้าระบบเต็มรูปแบบ แต่ยืนยันตัวตนด้วย token ครั้งเดียวที่ผูกกับ {{ref:policy:counterparty-verification-policy}}",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:template-engine}} ดูแล ได้แก่ `contract_templates`, `clause_library` (versioned), และ `template_clause_mapping`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `contract_templates` | template-engine | versioned เก็บทุกเวอร์ชันที่เคย publish |\n| `contracts` | clause-negotiator | เก็บ snapshot เนื้อหาสัญญาแต่ละฉบับ ไม่ผูก FK ตรงไป template |\n| `signature_requests` | signature-orchestrator | ไม่มีเนื้อหาสัญญา เก็บแค่ metadata การเซ็น |\n| `obligations` | obligation-tracker | ผูกกับ contractId แบบ soft reference |",
    "ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — เช็คความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก signature_request มี contractId ที่มีอยู่จริง)",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `contract.approved`, `contract.signed`, `contract.renewal_due`, `obligation.milestone_reached`, `template.published` — {{ref:module:obligation-tracker}} subscribe `contract.signed` เพื่อเริ่มสร้าง obligation record อัตโนมัติจากเงื่อนไขในสัญญา",
    "{{ref:module:renewal-monitor}} รัน scheduled job ตรวจ contract ที่ใกล้หมดอายุทุกวัน แล้ว publish `contract.renewal_due` ให้ทีม legal ops รับทราบล่วงหน้าตามที่กำหนดใน {{ref:policy:renewal-notice-period-policy}}",
  ],
  modules: [
    {
      slug: "template-engine",
      name: "template-engine",
      tags: ["template", "module", "core"],
      description:
        "จัดการ template สัญญาและ clause library ทั้งหมด รองรับการ versioning เพื่อให้ track ได้ว่าสัญญาแต่ละฉบับร่างจาก template เวอร์ชันไหน แยกออกมาเป็น service อิสระเพราะ clause library ต้องถูกดูแลโดยทีมกฎหมายส่วนกลาง ไม่ใช่ทีมที่ร่างสัญญารายวัน",
      functions: [
        { sig: "getTemplate(templateId: string, version?: string): Promise<ContractTemplate>", desc: "ดึง template ตามเวอร์ชันที่ระบุ ถ้าไม่ระบุคืนเวอร์ชันล่าสุดที่ publish แล้ว" },
        { sig: "publishTemplate(templateId: string, clauses: ClauseRef[]): Promise<string>", desc: "publish เวอร์ชันใหม่ของ template คืน versionId" },
        { sig: "instantiateContract(templateId: string, version: string): Promise<string>", desc: "สร้างสัญญาฉบับใหม่จาก template เวอร์ชันที่ระบุ คืน contractId" },
      ],
      stateFlow: "draft → published → deprecated — เวอร์ชันเก่าไม่ถูกลบทิ้งแม้ deprecated แล้ว เพื่อให้สัญญาเก่าที่อ้างอิงเวอร์ชันนั้นยังตรวจสอบย้อนหลังได้",
      relatedNotes:
        "ทุกครั้งที่ {{ref:module:clause-negotiator}} เริ่มสัญญาใหม่ ต้องเรียก `instantiateContract` ก่อนเสมอ ไม่มีทางสร้างสัญญาจากเนื้อหาว่างเปล่าได้ — บังคับให้ทุกสัญญามีจุดเริ่มต้นที่ตรวจสอบได้",
      internals: {
        constants: [
          { name: "TEMPLATE_VERSION_RETENTION_YEARS", value: "10" },
          { name: "MAX_CLAUSE_PER_TEMPLATE", value: "80" },
        ],
        typeSnippet:
          "interface ContractTemplate {\n  templateId: string;\n  version: string;\n  clauses: ClauseRef[];\n  status: \"draft\" | \"published\" | \"deprecated\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง clause บังคับที่ {{ref:policy:mandatory-clause-set-policy}}",
      },
    },
    {
      slug: "clause-negotiator",
      name: "clause-negotiator",
      tags: ["negotiation", "module"],
      description:
        "ติดตามการเจรจาต่อรองเงื่อนไข (redline) ระหว่างองค์กรกับคู่สัญญาภายนอก เก็บทุกรอบการแก้ไขไว้เป็นประวัติเพื่อให้ทนายความย้อนดูได้ว่าเงื่อนไขไหนถูกต่อรองไปมาอย่างไรก่อนจะสรุปเป็นฉบับสุดท้าย",
      functions: [
        { sig: "submitRedline(contractId: string, changes: ClauseChange[], party: string): Promise<string>", desc: "ส่ง redline รอบใหม่ คืน redlineId" },
        { sig: "acceptRedline(redlineId: string): Promise<void>", desc: "ยอมรับ redline รอบนั้น นำเข้าเป็นเนื้อหาสัญญาปัจจุบัน" },
        { sig: "getNegotiationHistory(contractId: string): Promise<RedlineRound[]>", desc: "คืนประวัติการเจรจาทั้งหมดของสัญญาฉบับหนึ่ง" },
      ],
      relatedNotes:
        "จำนวนรอบการเจรจาต่อสัญญาหนึ่งฉบับมีเพดานตาม {{ref:policy:clause-negotiation-round-limit-policy}} — เกินเพดานต้อง escalate ให้หัวหน้าทีมกฎหมายตัดสินใจแทนระบบอัตโนมัติ",
    },
    {
      slug: "approval-router",
      name: "approval-router",
      tags: ["approval", "module", "core"],
      description:
        "ตัดสินใจว่าสัญญาฉบับหนึ่งต้องผ่านการอนุมัติจากใครบ้างตามมูลค่าและประเภทสัญญา เป็น service เดียวที่คำนวณ approval chain ทั้งหมด ไม่มี service อื่นคำนวณเส้นทางอนุมัติซ้ำเอง เพื่อไม่ให้เกิดความไม่สอดคล้องกันระหว่างจุดต่างๆ ของระบบ",
      functions: [
        { sig: "computeApprovalChain(contractId: string, value: number, type: string): Promise<ApprovalStep[]>", desc: "คำนวณลำดับผู้อนุมัติตามมูลค่าและประเภทสัญญา" },
        { sig: "recordApproval(contractId: string, approverId: string, step: number): Promise<ApprovalStatus>", desc: "บันทึกการอนุมัติของขั้นตอนหนึ่ง คืนสถานะรวมล่าสุด" },
        { sig: "isFullyApproved(contractId: string): Promise<boolean>", desc: "ตรวจว่าสัญญาผ่านทุกขั้นตอนอนุมัติแล้วหรือยัง" },
      ],
      stateFlow: "pending_approval → step-by-step approved → fully_approved | rejected — ดู {{ref:policy:approval-chain-by-value-policy}}",
      relatedNotes:
        "{{ref:module:signature-orchestrator}} จะไม่เริ่มกระบวนการเซ็นเลยจนกว่า `isFullyApproved` จะคืนค่า true เท่านั้น ไม่มีทางข้ามขั้นตอนอนุมัติไปเซ็นได้",
      internals: {
        constants: [
          { name: "APPROVAL_TIER_1_MAX_VALUE_THB", value: "500000" },
          { name: "APPROVAL_TIER_2_MAX_VALUE_THB", value: "5000000" },
        ],
        typeSnippet:
          "interface ApprovalStep {\n  stepIndex: number;\n  approverRole: string;\n  status: \"pending\" | \"approved\" | \"rejected\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เต็มที่ {{ref:policy:approval-chain-by-value-policy}}",
      },
    },
    {
      slug: "signature-orchestrator",
      name: "signature-orchestrator",
      tags: ["signature", "module", "core"],
      description:
        "ประสานงานลำดับการเซ็นสัญญาแบบอิเล็กทรอนิกส์ระหว่างคู่สัญญาหลายฝ่าย ไม่รู้จักเนื้อหาสัญญาเลย รู้แค่ว่าใครต้องเซ็นก่อนใคร เพื่อให้เปลี่ยน e-signature provider ในอนาคตได้โดยไม่กระทบ business logic ส่วนอื่นของระบบ",
      functions: [
        { sig: "initiateSignature(contractId: string, signers: SignerOrder[]): Promise<string>", desc: "เริ่มกระบวนการเซ็น ส่งคำขอไปยังผู้เซ็นคนแรกตามลำดับ" },
        { sig: "recordSignature(requestId: string, signerId: string): Promise<void>", desc: "บันทึกการเซ็นของคนหนึ่ง แล้วส่งคำขอไปยังคนถัดไปตามลำดับ" },
        { sig: "getSignatureStatus(contractId: string): Promise<SignatureStatus>", desc: "คืนสถานะการเซ็นปัจจุบันของทุกฝ่าย" },
      ],
      stateFlow: "not_started → step-by-step signed → fully_executed — ดู {{ref:policy:signature-order-enforcement-policy}}",
      relatedNotes:
        "ทุกครั้งที่สัญญาเซ็นครบทุกฝ่าย publish event `contract.signed` ให้ {{ref:module:obligation-tracker}} เริ่มสร้าง obligation record อัตโนมัติจากเงื่อนไขในสัญญา",
      internals: {
        constants: [
          { name: "SIGNATURE_REQUEST_EXPIRY_DAYS", value: "14" },
          { name: "SIGNATURE_REMINDER_INTERVAL_DAYS", value: "3" },
        ],
        typeSnippet:
          "interface SignatureStatus {\n  contractId: string;\n  currentStep: number;\n  totalSteps: number;\n  fullyExecuted: boolean;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องลำดับการเซ็นที่ {{ref:policy:signature-order-enforcement-policy}}",
      },
    },
    {
      slug: "renewal-monitor",
      name: "renewal-monitor",
      tags: ["renewal", "module"],
      description:
        "ตรวจสอบสัญญาที่ใกล้หมดอายุและแจ้งเตือนทีม legal ops ล่วงหน้าตามระยะเวลาที่กำหนด แยกออกมาเป็น service อิสระเพราะการแจ้งเตือนต่ออายุต้องรันเป็น scheduled job ตลอดเวลา ไม่ใช่ทำงานแบบ request-response เหมือน service อื่น",
      functions: [
        { sig: "scanExpiringContracts(withinDays: number): Promise<ContractSummary[]>", desc: "สแกนหาสัญญาที่จะหมดอายุภายในจำนวนวันที่กำหนด" },
        { sig: "sendRenewalReminder(contractId: string): Promise<void>", desc: "ส่งการแจ้งเตือนต่ออายุให้ทีมที่เกี่ยวข้อง" },
        { sig: "markRenewalHandled(contractId: string, decision: \"renew\" | \"terminate\"): Promise<void>", desc: "บันทึกการตัดสินใจของทีมเกี่ยวกับสัญญาที่ใกล้หมดอายุ" },
      ],
      relatedNotes:
        "รัน scheduled job ทุกวันตรวจสัญญาทั้งหมด ไม่พึ่ง event-driven trigger เพราะการแจ้งเตือนต่ออายุต้องเกิดขึ้นแน่นอนแม้ไม่มี action อื่นใดเกิดขึ้นกับสัญญาฉบับนั้นเลยก็ตาม ดู {{ref:policy:renewal-notice-period-policy}}",
    },
    {
      slug: "obligation-tracker",
      name: "obligation-tracker",
      tags: ["obligation", "module"],
      description:
        "ติดตามพันธะสัญญาหลังลงนาม เช่น กำหนดส่งมอบงาน เงื่อนไขการชำระ milestone หรือข้อผูกพันอื่นที่ระบุในสัญญา แยกออกมาจาก signature-orchestrator เพราะพันธะสัญญาต้องติดตามต่อเนื่องเป็นเดือนหรือปีหลังจากเซ็นเสร็จแล้ว ไม่ใช่แค่ช่วงกระบวนการเซ็น",
      functions: [
        { sig: "createObligationsFromContract(contractId: string): Promise<Obligation[]>", desc: "สร้าง obligation record จากเงื่อนไขในสัญญาที่เพิ่งเซ็นเสร็จ" },
        { sig: "markMilestoneComplete(obligationId: string): Promise<void>", desc: "บันทึกว่า milestone หนึ่งเสร็จสมบูรณ์แล้ว" },
        { sig: "getOverdueObligations(): Promise<Obligation[]>", desc: "คืนรายการ obligation ที่เลยกำหนดแล้วยังไม่เสร็จ" },
      ],
      relatedNotes:
        "ทุก obligation ที่สร้างจะผูกกับ contractId แบบ soft reference ไม่ใช้ FK ตรงเพราะอยู่คนละ database — ดู {{ref:policy:obligation-milestone-sla-policy}} สำหรับ SLA การติดตาม",
    },
  ],
  envVarGroups: [
    {
      service: "template-engine-service",
      vars: [
        { name: "TEMPLATE_VERSION_RETENTION_YEARS", example: "10", note: "" },
        { name: "MAX_CLAUSE_PER_TEMPLATE", example: "80", note: "" },
      ],
    },
    {
      service: "approval-router-service",
      vars: [
        { name: "APPROVAL_TIER_1_MAX_VALUE_THB", example: "500000", note: "ดู {{ref:policy:approval-chain-by-value-policy}}" },
        { name: "APPROVAL_TIER_2_MAX_VALUE_THB", example: "5000000", note: "" },
      ],
    },
    {
      service: "signature-orchestrator-service",
      vars: [
        { name: "SIGNATURE_REQUEST_EXPIRY_DAYS", example: "14", note: "" },
        { name: "SIGNATURE_PROVIDER_API_KEY", example: "sk_live_...", note: "secret ห้าม log" },
      ],
    },
    {
      service: "renewal-monitor-service",
      vars: [
        { name: "RENEWAL_NOTICE_DAYS_DEFAULT", example: "90", note: "ดู {{ref:policy:renewal-notice-period-policy}}" },
        { name: "RENEWAL_SCAN_CRON", example: "0 6 * * *", note: "" },
      ],
    },
  ],
  policies: [
    {
      slug: "approval-chain-by-value-policy",
      title: "นโยบายเส้นทางอนุมัติตามมูลค่าสัญญา",
      tags: ["approval", "policy"],
      isPrimary: true,
      intro: [
        "สัญญาแต่ละฉบับต้องผ่านการอนุมัติตามจำนวนขั้นที่กำหนดโดยมูลค่าสัญญา — ต่ำกว่า `APPROVAL_TIER_1_MAX_VALUE_THB` อนุมัติโดยหัวหน้าแผนกคนเดียว, สูงกว่านั้นถึง `APPROVAL_TIER_2_MAX_VALUE_THB` ต้องผ่านทีมกฎหมายเพิ่ม, สูงกว่านั้นต้องผ่าน CFO ด้วย",
        "มูลค่าสัญญาที่ใช้คำนวณต้องเป็นมูลค่ารวมตลอดอายุสัญญา ไม่ใช่มูลค่าต่องวด เพื่อไม่ให้สัญญามูลค่าสูงถูกแบ่งเป็นงวดเล็กๆ เพื่อหลบเลี่ยงขั้นตอนอนุมัติที่เข้มกว่า",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อสัญญาไม่มีมูลค่าตายตัว",
        tags: ["approval", "edge-case"],
        body: [
          "สัญญาบางประเภทไม่มีมูลค่าตายตัวตั้งแต่ต้น (เช่น สัญญาแบบ pay-per-use หรือ revenue-share) — กรณีนี้ระบบใช้มูลค่าประมาณการสูงสุดที่เป็นไปได้ตามเงื่อนไขในสัญญาแทน ไม่ใช้มูลค่าประมาณการต่ำเพื่อลดขั้นตอนอนุมัติ",
          "ถ้าประมาณการมูลค่าไม่ได้เลยแม้แต่ขั้นต่ำ (เช่น สัญญาความร่วมมือที่ไม่มีข้อผูกพันทางการเงินชัดเจน) ให้ route เข้าทีมกฎหมายตรวจสอบด้วยมือเสมอ ไม่ปล่อยผ่านด้วยขั้นตอนอนุมัติระดับต่ำสุดโดยอัตโนมัติ",
        ],
      },
    },
    {
      slug: "mandatory-clause-set-policy",
      title: "นโยบายเงื่อนไขบังคับตามประเภทสัญญา",
      tags: ["template", "policy"],
      isPrimary: true,
      intro: [
        "สัญญาแต่ละประเภท (จ้างงาน, จัดซื้อ, ความร่วมมือ, การรักษาความลับ) มีชุด clause บังคับที่ต้องมีอยู่เสมอ — {{ref:module:template-engine}} จะปฏิเสธการ publish template ที่ขาด clause บังคับของประเภทนั้นตั้งแต่ต้นทาง",
        "การลบ clause บังคับออกจากสัญญาที่กำลังร่างอยู่ทำไม่ได้ผ่าน UI ปกติ ต้องขออนุมัติพิเศษจากทีมกฎหมายส่วนกลางเท่านั้น เพื่อป้องกันการลบเงื่อนไขสำคัญโดยไม่ตั้งใจระหว่างการเจรจา",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับสัญญาข้ามประเทศ",
        tags: ["template", "legal", "edge-case"],
        body: [
          "สัญญาที่มีคู่สัญญาอยู่ต่างประเทศต้องมี clause เพิ่มเติมเรื่องกฎหมายที่ใช้บังคับ (governing law) และเขตอำนาจศาล (jurisdiction) เป็นบังคับเพิ่มเติมนอกเหนือจากชุด clause มาตรฐาน — ระบบตรวจจับจาก field ที่อยู่คู่สัญญาโดยอัตโนมัติ",
          "ถ้าคู่สัญญาต่างประเทศอยู่ในประเทศที่มีข้อจำกัดพิเศษด้านการโอนข้อมูล (data transfer restriction) ต้องเพิ่ม clause คุ้มครองข้อมูลเฉพาะประเทศนั้นด้วย ซึ่งไม่อยู่ในชุด clause บังคับมาตรฐานและต้องให้ทีมกฎหมายเพิ่มด้วยมือ",
        ],
      },
    },
    {
      slug: "signature-order-enforcement-policy",
      title: "นโยบายบังคับลำดับการเซ็นสัญญา",
      tags: ["signature", "policy"],
      isPrimary: true,
      intro: [
        "การเซ็นสัญญาต้องเป็นไปตามลำดับที่กำหนดไว้ตอนเริ่มกระบวนการเสมอ — ฝ่ายที่อยู่ลำดับหลังจะไม่ได้รับคำขอเซ็นจนกว่าฝ่ายก่อนหน้าจะเซ็นเสร็จ เพื่อให้สอดคล้องกับข้อกำหนดทางกฎหมายที่บางประเภทสัญญาต้องการลำดับการลงนามที่ชัดเจน",
        "ถ้าฝ่ายใดฝ่ายหนึ่งปฏิเสธไม่เซ็น กระบวนการทั้งหมดหยุดทันทีและไม่ส่งคำขอไปยังฝ่ายถัดไป ต้องเริ่มกระบวนการใหม่ทั้งหมดหลังแก้ไขสัญญาแล้วเท่านั้น",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อฝ่ายภายในเซ็นพร้อมกันได้",
        tags: ["signature", "edge-case"],
        body: [
          "ผู้อนุมัติภายในองค์กรหลายคนที่อยู่ลำดับเดียวกัน (เช่น กรรมการสองคนต้องเซ็นร่วมกัน) ได้รับคำขอเซ็นพร้อมกันได้ ไม่ต้องรอทีละคน — ถือเป็น \"ขั้นตอนเดียว\" ที่ต้องมีทุกคนเซ็นครบก่อนขยับไปขั้นตอนถัดไป",
          "คู่สัญญาภายนอกไม่มีสิทธิ์เซ็นพร้อมกับฝ่ายอื่นเลยไม่ว่ากรณีใด แม้จะอยู่ลำดับเดียวกันในทางทฤษฎีก็ตาม เพราะต้องให้ฝ่ายภายในตรวจสอบความถูกต้องของเนื้อหาให้เรียบร้อยก่อนส่งให้คู่สัญญาภายนอกเสมอ",
        ],
      },
    },
    {
      slug: "renewal-notice-period-policy",
      title: "นโยบายระยะเวลาแจ้งเตือนต่ออายุสัญญา",
      tags: ["renewal", "policy"],
      isPrimary: true,
      intro: [
        "สัญญาทุกฉบับที่มีวันหมดอายุต้องได้รับการแจ้งเตือนล่วงหน้า `RENEWAL_NOTICE_DAYS_DEFAULT` วันก่อนหมดอายุ เพื่อให้ทีมมีเวลาตัดสินใจว่าจะต่ออายุหรือยกเลิก",
        "ถ้าไม่มีการตอบสนองต่อการแจ้งเตือนภายในเวลาที่กำหนด ระบบจะแจ้งเตือนซ้ำและยกระดับไปยังหัวหน้าทีมกฎหมายก่อนวันหมดอายุจริง ไม่ปล่อยให้สัญญาหมดอายุไปเงียบๆ โดยไม่มีใครรับทราบ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับสัญญาที่ต่ออายุอัตโนมัติ",
        tags: ["renewal", "edge-case"],
        body: [
          "สัญญาที่มีเงื่อนไข auto-renewal ในตัว (ต่ออายุอัตโนมัติถ้าไม่มีฝ่ายใดแจ้งยกเลิก) ยังคงต้องได้รับการแจ้งเตือนตามระยะเวลาปกติ เพื่อให้ทีมมีโอกาสตัดสินใจยกเลิกทันเวลาก่อนที่การต่ออายุอัตโนมัติจะมีผล ไม่ใช่ยกเว้นการแจ้งเตือนเพราะคิดว่า \"ต่ออายุเองอยู่แล้ว\"",
          "สัญญาที่ทีมกฎหมายทำเครื่องหมายไว้ล่วงหน้าว่า \"จะไม่ต่ออายุแน่นอน\" ยังคงได้รับการแจ้งเตือนเช่นกันแต่ระดับความสำคัญต่ำกว่า เพื่อเป็นการยืนยันครั้งสุดท้ายก่อนสัญญาหมดอายุจริง",
        ],
      },
    },
    {
      slug: "obligation-milestone-sla-policy",
      title: "นโยบาย SLA การติดตามพันธะสัญญา",
      tags: ["obligation", "policy"],
      isPrimary: true,
      intro: [
        "พันธะสัญญาทุกรายการที่มีกำหนดเวลา (milestone) ต้องมีการตรวจสอบสถานะอย่างน้อยทุก 7 วันก่อนถึงกำหนด และแจ้งเตือนเจ้าของงานล่วงหน้าตามระยะเวลาที่กำหนดในสัญญาแต่ละประเภท",
        "พันธะที่เลยกำหนดแล้วยังไม่เสร็จ (`getOverdueObligations`) ต้องถูกรายงานในรายงานความเสี่ยงประจำสัปดาห์ของทีมกฎหมายเสมอ ไม่ว่ามูลค่าหรือความสำคัญของสัญญาจะต่ำแค่ไหนก็ตาม",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อพันธะขึ้นอยู่กับอีกฝ่าย",
        tags: ["obligation", "edge-case"],
        body: [
          "พันธะบางรายการเป็นความรับผิดชอบของคู่สัญญาภายนอก ไม่ใช่ขององค์กรเอง (เช่น คู่สัญญาต้องส่งมอบเอกสารภายในกำหนด) — กรณีนี้การเลยกำหนดไม่ถือเป็นความผิดพลาดของทีมภายใน แต่ยังคงต้องติดตามและแจ้งเตือนเพื่อใช้เป็นหลักฐานถ้าต้องอ้างอิงข้อสัญญาในอนาคต",
          "พันธะที่เกิดจากเหตุสุดวิสัย (force majeure) ที่ทั้งสองฝ่ายยอมรับร่วมกัน จะถูกระงับการนับ SLA ชั่วคราวจนกว่าจะมีการยืนยันกลับมาดำเนินการต่อ ไม่นับเป็นการเลยกำหนดระหว่างที่ระงับอยู่",
        ],
      },
    },
    {
      slug: "counterparty-verification-policy",
      title: "นโยบายการยืนยันตัวตนคู่สัญญา",
      tags: ["signature", "security", "policy"],
      isPrimary: true,
      intro: [
        "ก่อนเริ่มกระบวนการเซ็นกับคู่สัญญาภายนอก ต้องยืนยันตัวตนและสถานะทางกฎหมายของคู่สัญญาก่อนเสมอ (เช่น ตรวจสอบสถานะนิติบุคคลว่ายังดำเนินกิจการอยู่จริง) ไม่ส่งคำขอเซ็นให้คู่สัญญาที่ยังไม่ผ่านการยืนยัน",
        "ผลการยืนยันตัวตนมีอายุ 90 วัน — ถ้าสัญญาใช้เวลาเจรจานานกว่านั้น ต้องยืนยันตัวตนคู่สัญญาใหม่ก่อนเริ่มกระบวนการเซ็นจริง แม้จะเคยยืนยันผ่านไปแล้วตอนเริ่มเจรจาก็ตาม",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับคู่สัญญาประจำที่ยืนยันซ้ำแล้ว",
        tags: ["signature", "edge-case"],
        body: [
          "คู่สัญญาที่ทำธุรกรรมกับองค์กรมาแล้วมากกว่า 3 ครั้งในรอบ 12 เดือนและผ่านการยืนยันตัวตนล่าสุดไม่เกิน 90 วัน จัดเป็น \"trusted counterparty\" — ข้ามขั้นตอนยืนยันตัวตนซ้ำได้สำหรับสัญญามูลค่าต่ำกว่า tier 1 เท่านั้น",
          "สถานะ trusted counterparty ถูกยกเลิกทันทีถ้าพบว่าสัญญาฉบับก่อนหน้ามีข้อพิพาทหรือการผิดสัญญาเกิดขึ้น ไม่ว่าจะยืนยันตัวตนผ่านมาแล้วกี่ครั้งก็ตาม — ความน่าเชื่อถือในอดีตไม่ทดแทนการยืนยันใหม่เมื่อมีสัญญาณความเสี่ยง",
        ],
      },
    },
    {
      slug: "template-version-lock-policy",
      title: "นโยบายการล็อกเวอร์ชัน Template",
      tags: ["template", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อสัญญาฉบับหนึ่งถูกสร้างจาก template เวอร์ชันใดแล้ว สัญญานั้นจะผูกกับเวอร์ชันนั้นตลอดไป แม้ template จะมีเวอร์ชันใหม่กว่าออกมาระหว่างที่สัญญายังอยู่ระหว่างเจรจา",
        "การอัปเดตสัญญาให้ใช้ template เวอร์ชันใหม่ต้องทำผ่านขั้นตอนพิเศษที่สร้างสัญญาฉบับใหม่แล้ว migrate เนื้อหาที่เจรจาไปแล้วเข้ามา ไม่ใช่การสลับเวอร์ชันแบบ in-place",
      ],
    },
    {
      slug: "clause-negotiation-round-limit-policy",
      title: "นโยบายจำกัดจำนวนรอบการเจรจา",
      tags: ["negotiation", "policy"],
      isPrimary: false,
      intro: [
        "การเจรจาต่อรองสัญญาหนึ่งฉบับมีเพดานไม่เกิน 15 รอบผ่านระบบอัตโนมัติ เกินกว่านั้นต้อง escalate ให้หัวหน้าทีมกฎหมายเข้ามาตัดสินใจแทนการปล่อยให้เจรจาผ่านระบบต่อไปเรื่อยๆ",
        "การนับรอบรีเซ็ตใหม่ทุกครั้งที่มีการเปลี่ยนคู่เจรจาฝั่งคู่สัญญา (เช่น เปลี่ยนทนายความที่ดูแล) เพราะถือเป็นจุดเริ่มต้นการเจรจารอบใหม่ในทางปฏิบัติ",
      ],
    },
    {
      slug: "contract-archival-retention-policy",
      title: "นโยบายการเก็บรักษาสัญญาที่จัดเก็บถาวร",
      tags: ["archival", "compliance", "policy"],
      isPrimary: false,
      intro: [
        "สัญญาที่เซ็นเสร็จสมบูรณ์แล้วต้องเก็บรักษาไว้อย่างน้อย 10 ปีนับจากวันหมดอายุ ตรงตามข้อกำหนดทางกฎหมายทั่วไปสำหรับเอกสารสัญญาทางธุรกิจ",
        "สัญญาที่ถูกยกเลิกก่อนเซ็นเสร็จ (draft ที่ไม่มีผลทางกฎหมาย) มีระยะเวลาเก็บรักษาสั้นกว่า คือ 3 ปี เพียงพอสำหรับการตรวจสอบกระบวนการภายในถ้าจำเป็น",
      ],
    },
    {
      slug: "confidentiality-clause-default-policy",
      title: "นโยบาย Clause การรักษาความลับเริ่มต้น",
      tags: ["template", "confidentiality", "policy"],
      isPrimary: false,
      intro: [
        "สัญญาทุกประเภทที่เกี่ยวข้องกับการแลกเปลี่ยนข้อมูลระหว่างองค์กรต้องมี confidentiality clause เริ่มต้นเสมอ แม้ผู้ร่างจะไม่ได้เลือกเพิ่มด้วยตัวเองก็ตาม เป็นค่า default ของ template ทุกประเภทที่เกี่ยวข้อง",
        "การลบ confidentiality clause ออกทำได้เฉพาะกรณีที่สัญญาระบุชัดเจนว่าไม่มีการแลกเปลี่ยนข้อมูลลับใดๆ และต้องได้รับการยืนยันจากทีมกฎหมายก่อนเผยแพร่สัญญาฉบับนั้น",
      ],
    },
    {
      slug: "dispute-resolution-clause-policy",
      title: "นโยบาย Clause การระงับข้อพิพาท",
      tags: ["template", "policy"],
      isPrimary: false,
      intro: [
        "สัญญามูลค่าสูงกว่า `APPROVAL_TIER_1_MAX_VALUE_THB` ต้องมี clause ระบุวิธีระงับข้อพิพาทชัดเจน (อนุญาโตตุลาการหรือศาล) เพื่อลดความไม่แน่นอนหากเกิดข้อพิพาทในอนาคต",
        "ทีมกฎหมายเป็นผู้กำหนดวิธีระงับข้อพิพาทเริ่มต้นตามประเภทคู่สัญญา (ในประเทศใช้ศาลไทยเป็นหลัก ต่างประเทศพิจารณาอนุญาโตตุลาการระหว่างประเทศ) ผู้ร่างสัญญาทั่วไปไม่มีสิทธิ์เปลี่ยนค่า default นี้เอง",
      ],
    },
  ],
  incidents: [
    {
      slug: "template-version-mismatch-wrong-clause",
      title: "ใช้ Template เวอร์ชันเก่าทำให้ Clause ผิดเข้าไปในสัญญา",
      tags: ["template", "bug"],
      summary:
        "ทีมกฎหมายพบว่าสัญญาจัดซื้อฉบับหนึ่งมี clause เก่าที่ถูกแก้ไขไปแล้วในเวอร์ชันล่าสุดของ template ทำให้เงื่อนไขความรับผิดไม่ตรงกับที่องค์กรต้องการใช้ปัจจุบัน",
      investigation:
        "ตรวจ {{ref:module:template-engine}} พบว่าผู้ร่างสัญญาเปิดหน้าร่างสัญญาค้างไว้นานหลายวันก่อนกด submit ระหว่างนั้น template มีการ publish เวอร์ชันใหม่ไปแล้ว แต่หน้าจอที่ค้างไว้ยังอ้างอิงเวอร์ชันเก่า",
      cause:
        "`instantiateContract` ผูกเวอร์ชัน template ไว้ตอนเริ่มร่างเท่านั้น ไม่มีการเตือนผู้ใช้เมื่อ template เวอร์ชันใหม่กว่าถูก publish ระหว่างที่กำลังร่างอยู่",
      resolution:
        "แก้ไขสัญญาฉบับที่ได้รับผลกระทบด้วยมือให้ใช้ clause เวอร์ชันล่าสุด แล้วเพิ่มการแจ้งเตือนในหน้าร่างสัญญาเมื่อ template เวอร์ชันใหม่กว่าถูก publish ระหว่างที่กำลังร่างอยู่",
      followup:
        "พิจารณาเพิ่มการตรวจสอบอัตโนมัติก่อน submit ว่า template ที่ใช้อยู่ยังเป็นเวอร์ชันล่าสุดหรือไม่ ถ้าไม่ใช่ให้บังคับ refresh ก่อนดำเนินการต่อ",
    },
    {
      slug: "approval-route-skipped-role-misconfig",
      title: "ขั้นตอนอนุมัติถูกข้ามเพราะตั้งค่า Role ผิด",
      tags: ["approval", "bug"],
      summary:
        "สัญญามูลค่าสูงฉบับหนึ่งผ่านการอนุมัติไปถึงขั้นตอนเซ็นได้โดยไม่ผ่านการอนุมัติจากทีมกฎหมายกลางตามที่ควรจะเป็น",
      investigation:
        "ตรวจ {{ref:module:approval-router}} พบว่า role ของผู้อนุมัติทีมกฎหมายกลางถูกเปลี่ยนชื่อในระบบ identity provider แต่ mapping ใน approval-router ยังอ้างอิง role เดิมที่ไม่มีอยู่แล้ว ทำให้ `computeApprovalChain` มองว่าไม่มีใครต้องอนุมัติขั้นตอนนี้",
      cause:
        "ไม่มี validation ตรวจว่าทุก role ที่ระบุใน approval chain configuration ยังมีอยู่จริงในระบบ identity provider — role ที่หายไปถูกข้ามไปเงียบๆ แทนที่จะ error",
      resolution:
        "ระงับสัญญาที่ได้รับผลกระทบไว้ก่อนแล้วส่งกลับเข้าขั้นตอนอนุมัติที่ถูกต้อง แก้ mapping role ให้ตรงกับปัจจุบัน",
      followup:
        "เพิ่ม validation ให้ `computeApprovalChain` error ทันทีถ้า role ที่ต้องการไม่มีอยู่จริง แทนที่จะข้ามขั้นตอนไปเงียบๆ — ความผิดพลาดแบบ fail-open ในกระบวนการอนุมัติยอมรับไม่ได้",
    },
    {
      slug: "signature-order-violated",
      title: "คู่สัญญาเซ็นก่อนลำดับที่กำหนด",
      tags: ["signature", "bug"],
      summary:
        "คู่สัญญาภายนอกได้รับคำขอเซ็นและเซ็นสำเร็จก่อนที่กรรมการภายในองค์กรจะอนุมัติและเซ็นตามลำดับที่ควรจะเป็น",
      investigation:
        "ตรวจ {{ref:module:signature-orchestrator}} พบว่า `initiateSignature` ถูกเรียกสองครั้งซ้อนกันจาก retry ของ frontend โดยครั้งที่สองส่งลำดับผู้เซ็นที่ไม่ตรงกับครั้งแรก (สลับตำแหน่งคู่สัญญาภายนอกขึ้นมาก่อน)",
      cause:
        "ไม่มี idempotency key หรือการล็อกกันการเรียก `initiateSignature` ซ้ำสำหรับสัญญาเดียวกัน ทำให้คำขอที่สองสร้าง signature request ชุดใหม่ทับชุดเดิมโดยไม่ตรวจสอบว่ามีกระบวนการเซ็นที่กำลังดำเนินอยู่แล้วหรือไม่",
      resolution:
        "ยกเลิกการเซ็นที่ผิดลำดับ เจรจากับคู่สัญญาให้ยืนยันเซ็นใหม่ตามลำดับที่ถูกต้องหลังกรรมการอนุมัติแล้ว",
      followup:
        "เพิ่ม idempotency key และล็อกกันการเรียก `initiateSignature` ซ้ำสำหรับสัญญาเดียวกันที่มีกระบวนการเซ็นดำเนินอยู่แล้ว",
    },
    {
      slug: "renewal-reminder-not-sent",
      title: "สัญญาหมดอายุโดยไม่มีการแจ้งเตือนต่ออายุ",
      tags: ["renewal", "notification"],
      summary:
        "สัญญาจัดซื้อสำคัญฉบับหนึ่งหมดอายุไปโดยไม่มีใครในทีมได้รับการแจ้งเตือนล่วงหน้าตามที่ {{ref:policy:renewal-notice-period-policy}} กำหนดไว้ ทำให้การจัดซื้อหยุดชะงักกะทันหัน",
      investigation:
        "ตรวจ {{ref:module:renewal-monitor}} พบว่า scheduled job ที่สแกนสัญญาใกล้หมดอายุล้มเหลวเงียบๆ ในวันที่ควรจะจับสัญญาฉบับนี้ได้ เพราะ query timeout จากจำนวนสัญญาที่เพิ่มขึ้นมากในฐานข้อมูล",
      cause:
        "scheduled job ไม่มีการแจ้งเตือนเมื่อ execution ล้มเหลว ทำให้ไม่มีใครรู้ตัวว่า job ไม่ได้รันสำเร็จในวันนั้นจนกว่าจะสัญญาหมดอายุไปแล้วจริง",
      resolution:
        "ต่ออายุสัญญาแบบเร่งด่วนพร้อมชี้แจงเหตุผลกับคู่สัญญา แล้วเพิ่ม alert เมื่อ scheduled job ล้มเหลวหรือรันไม่ครบ",
      followup:
        "ปรับ query ให้มีประสิทธิภาพรองรับจำนวนสัญญาที่เพิ่มขึ้น และเพิ่ม retry อัตโนมัติสำหรับ job ที่ timeout พร้อม alert แยกต่างหากถ้า retry ก็ยังไม่สำเร็จ",
    },
    {
      slug: "obligation-deadline-missed",
      title: "พลาดกำหนดส่งมอบงานตามพันธะสัญญาโดยไม่มีการแจ้งเตือน",
      tags: ["obligation", "sla"],
      summary:
        "ทีมปฏิบัติการพลาดกำหนดส่งมอบงานตาม milestone ที่ระบุในสัญญาฉบับหนึ่งเพราะไม่มีการแจ้งเตือนล่วงหน้าตามที่ควรจะเป็น",
      investigation:
        "ตรวจ {{ref:module:obligation-tracker}} พบว่า `createObligationsFromContract` สร้าง obligation record ไม่ครบทุก milestone ที่ระบุในสัญญา เพราะ parser ที่แยกเงื่อนไขจากเนื้อหาสัญญาไม่รองรับรูปแบบการเขียนวันที่แบบหนึ่งที่ทนายความใช้ในฉบับนี้",
      cause:
        "การสร้าง obligation อัตโนมัติพึ่งพา parser ที่ตีความเนื้อหาสัญญาแบบ pattern-matching ซึ่งไม่ครอบคลุมทุกรูปแบบการเขียนที่ทนายความใช้จริง และไม่มีการแจ้งเตือนเมื่อ parser ไม่สามารถแยก milestone ได้ครบ",
      resolution:
        "สร้าง obligation ที่ขาดหายด้วยมือ แจ้งทีมปฏิบัติการเร่งดำเนินการ milestone ที่พลาดไปพร้อมชี้แจงกับคู่สัญญา",
      followup:
        "เพิ่มขั้นตอนให้ทนายความยืนยัน obligation ที่ parser สร้างขึ้นด้วยมือก่อนเสมอ แทนที่จะเชื่อผลจาก parser อัตโนมัติทั้งหมดโดยไม่มีการตรวจสอบ",
    },
    {
      slug: "counterparty-verification-bypassed",
      title: "การยืนยันตัวตนคู่สัญญาถูกข้ามเพราะ Bug ของระบบ",
      tags: ["verification", "security"],
      summary:
        "ทีม compliance ตรวจพบว่าสัญญาฉบับหนึ่งเข้าสู่กระบวนการเซ็นได้โดยที่คู่สัญญายังไม่ผ่านการยืนยันตัวตนตาม {{ref:policy:counterparty-verification-policy}}",
      investigation:
        "ตรวจสอบพบว่าฟิลด์ 'trusted counterparty' ของคู่สัญญานี้ถูกตั้งค่าไว้จากการทำธุรกรรมเก่าเมื่อ 2 ปีก่อน และระบบไม่ได้ตรวจสอบวันหมดอายุของสถานะนี้ก่อนอนุญาตให้ข้ามการยืนยัน",
      cause:
        "ฟิลด์ trusted counterparty ไม่มี TTL หรือการหมดอายุอัตโนมัติ ต่างจากที่ระบุใน edge case ของนโยบายว่าสถานะนี้ควรมีอายุจำกัดตามการยืนยันล่าสุดไม่เกิน 90 วัน",
      resolution:
        "ระงับกระบวนการเซ็นชั่วคราวและยืนยันตัวตนคู่สัญญาใหม่ก่อนดำเนินการต่อ แล้วตรวจสอบสัญญาอื่นที่อาจได้รับผลกระทบจาก bug เดียวกัน",
      followup:
        "เพิ่ม TTL ให้ฟิลด์ trusted counterparty ตามที่ระบุใน {{ref:policy:counterparty-verification-policy}} จริง แทนที่จะปล่อยให้สถานะนี้คงอยู่ถาวรโดยไม่มีการตรวจสอบซ้ำ",
    },
    {
      slug: "clause-negotiation-infinite-loop",
      title: "ตัวนับรอบเจรจา Reset ผิดทำให้เจรจาไม่มีวันถึงเพดาน",
      tags: ["negotiation", "bug"],
      summary:
        "สัญญาฉบับหนึ่งเจรจาไปแล้วมากกว่า 40 รอบโดยไม่เคย escalate ตาม {{ref:policy:clause-negotiation-round-limit-policy}} ที่ควรจะเกิดขึ้นตั้งแต่รอบที่ 16",
      investigation:
        "ตรวจ {{ref:module:clause-negotiator}} พบว่าตัวนับรอบถูกออกแบบให้รีเซ็ตเมื่อเปลี่ยนคู่เจรจาฝั่งคู่สัญญา แต่ทนายความฝั่งคู่สัญญาใช้อีเมลคนละอันสลับกันส่งในแต่ละรอบ ทำให้ระบบมองว่าเป็นคนละคนและรีเซ็ตตัวนับทุกครั้ง",
      cause:
        "การตรวจจับ \"เปลี่ยนคู่เจรจา\" ใช้แค่ email address เปรียบเทียบ ไม่มีการยืนยันว่าเป็นทนายความคนละคนจริงหรือแค่ใช้อีเมลต่างกันของทีมเดียวกัน",
      resolution:
        "นับรอบเจรจาทั้งหมดใหม่ด้วยมือ escalate ให้หัวหน้าทีมกฎหมายตัดสินใจตามที่ควรจะเกิดขึ้นตั้งแต่แรก",
      followup:
        "เปลี่ยนเงื่อนไขการรีเซ็ตตัวนับให้ผูกกับองค์กรคู่สัญญาแทนอีเมลรายบุคคล — การเปลี่ยนผู้ติดต่อในทีมเดียวกันไม่ควรทำให้ตัวนับรอบรีเซ็ต",
    },
    {
      slug: "signature-orchestrator-duplicate-request",
      title: "ส่งคำขอเซ็นซ้ำให้คู่สัญญาคนเดิม",
      tags: ["signature", "bug"],
      summary:
        "คู่สัญญาภายนอกได้รับอีเมลคำขอเซ็นสัญญาฉบับเดียวกันซ้ำ 3 ฉบับในเวลาไล่เลี่ยกัน ทำให้เกิดความสับสนว่าฉบับไหนเป็นฉบับที่ถูกต้อง",
      investigation:
        "ตรวจ {{ref:module:signature-orchestrator}} พบว่า reminder job ที่ส่งซ้ำตาม `SIGNATURE_REMINDER_INTERVAL_DAYS` รันซ้อนกันหลาย instance เพราะ deploy ใหม่ไม่ได้ปิด instance เก่าให้เสร็จก่อนเปิด instance ใหม่",
      cause:
        "ไม่มี distributed lock กันการรัน reminder job ซ้อนกันหลาย instance พร้อมกัน — ปัญหาคล้ายกับที่เคยพบใน background job ของระบบอื่น",
      resolution:
        "แจ้งคู่สัญญาให้ใช้ลิงก์ล่าสุดเท่านั้น ปิด instance ที่รันซ้อนแล้วเพิ่ม distributed lock ให้ reminder job",
      followup:
        "ตรวจสอบ scheduled job อื่นทั้งหมดในระบบว่ามี lock กันการรันซ้อนครบทุกตัวหรือไม่ ไม่ใช่แก้เฉพาะจุดที่เจอปัญหา",
    },
    {
      slug: "template-engine-race-condition",
      title: "แก้ไข Template พร้อมกันทำ Clause Library เสียหาย",
      tags: ["template", "race-condition"],
      summary:
        "ทีมกฎหมายสองทีมแก้ไข template สัญญาจ้างงานพร้อมกันในเวลาไล่เลี่ยกันมาก ทำให้เวอร์ชันที่ publish ออกมามี clause ผสมกันระหว่างการแก้ไขของทั้งสองทีมอย่างไม่ตั้งใจ",
      investigation:
        "ตรวจ `publishTemplate` ใน {{ref:module:template-engine}} พบว่าฟังก์ชันอ่านรายการ clause ปัจจุบันมาแก้ไขแล้วเขียนทับทั้งชุด ไม่ได้ตรวจสอบว่ามีการแก้ไขอื่นเกิดขึ้นระหว่างนั้นหรือไม่",
      cause:
        "ไม่มี optimistic locking หรือ version check ก่อนเขียนทับ — เหมือนกับ pattern อ่าน-แล้ว-เขียนที่เคยเป็นปัญหาในระบบอื่นที่มีการแก้ไขข้อมูลพร้อมกันได้",
      resolution:
        "กู้คืน clause library เวอร์ชันก่อนหน้า แล้วให้ทั้งสองทีมรวมการแก้ไขด้วยมือใหม่ก่อน publish อีกครั้ง",
      followup:
        "เพิ่ม optimistic locking ให้ `publishTemplate` ตรวจสอบ version ปัจจุบันก่อนเขียนทับเสมอ ปฏิเสธการ publish ถ้า version ไม่ตรงกับที่คาดไว้",
    },
    {
      slug: "obligation-tracker-wrong-contract-mapping",
      title: "Obligation ผูกกับสัญญาผิดฉบับหลัง Import ข้อมูล",
      tags: ["obligation", "migration"],
      summary:
        "หลัง migrate ข้อมูลสัญญาเก่าจากระบบเดิมเข้า LexDraft พบว่า obligation หลายรายการผูกกับ contractId ผิดฉบับ ทำให้รายงานความเสี่ยงแสดงข้อมูลคลาดเคลื่อน",
      investigation:
        "ตรวจสคริปต์ migration พบว่าการ map obligation เข้ากับ contractId ใหม่ใช้ลำดับการ import เป็นตัวจับคู่ แทนที่จะใช้ตัวระบุที่ไม่ซ้ำกันจากระบบเดิม เพราะระบบเดิมไม่มีตัวระบุที่ไม่ซ้ำกันชัดเจนสำหรับ obligation",
      cause:
        "สคริปต์ migration ออกแบบมาเร็วเกินไปโดยไม่ตรวจสอบว่าลำดับข้อมูลจากระบบเดิมตรงกับลำดับที่ import เข้าใหม่จริงหรือไม่ ซึ่งกลายเป็นว่าไม่ตรงกันสำหรับข้อมูลบางส่วนที่ import แบบ batch คู่ขนาน",
      resolution:
        "หยุดใช้ obligation ที่ migrate มาชั่วคราว ตรวจสอบและจับคู่ใหม่ด้วยมือโดยอ้างอิงเนื้อหาสัญญาต้นฉบับ",
      followup:
        "สำหรับการ migrate ครั้งต่อไป ต้องมีตัวระบุที่ไม่ซ้ำกันเชื่อมระหว่างระบบเก่าและใหม่เสมอ ไม่พึ่งลำดับการ import เป็นตัวจับคู่ข้อมูลที่มีผลกระทบทางกฎหมาย",
    },
    {
      slug: "approval-chain-value-threshold-bypass",
      title: "คำนวณมูลค่าสัญญาผิดทำให้ข้ามขั้นตอนอนุมัติที่เข้มกว่า",
      tags: ["approval", "bug"],
      summary:
        "สัญญามูลค่าจริงเกิน `APPROVAL_TIER_2_MAX_VALUE_THB` ฉบับหนึ่งผ่านขั้นตอนอนุมัติแค่ tier 1 เพราะระบบคำนวณมูลค่าสัญญาผิดพลาด",
      investigation:
        "ตรวจ {{ref:module:approval-router}} พบว่าสัญญาฉบับนี้มีเงื่อนไขราคาแบบขั้นบันได (tiered pricing) ที่มูลค่ารวมขึ้นอยู่กับปริมาณการใช้งานจริง แต่ `computeApprovalChain` ใช้แค่ราคาต่อหน่วยขั้นต่ำสุดในการคำนวณมูลค่ารวม ไม่ได้ประมาณการจากปริมาณการใช้งานสูงสุดที่เป็นไปได้",
      cause:
        "ฟังก์ชันคำนวณมูลค่าไม่รองรับโครงสร้างราคาที่ซับซ้อนแบบขั้นบันได ออกแบบมาสำหรับสัญญาราคาคงที่เท่านั้น ขัดกับหลักการใน edge case ของ {{ref:policy:approval-chain-by-value-policy}} ที่ควรใช้มูลค่าประมาณการสูงสุด",
      resolution:
        "ส่งสัญญาฉบับนี้กลับเข้าขั้นตอนอนุมัติ tier 2 ที่ถูกต้อง ตรวจสอบสัญญาราคาขั้นบันไดอื่นที่อาจได้รับผลกระทบเดียวกัน",
      followup:
        "แก้การคำนวณมูลค่าให้รองรับโครงสร้างราคาแบบขั้นบันไดโดยใช้มูลค่าประมาณการสูงสุดเสมอ ตามหลักการที่ระบุไว้ใน edge case ของนโยบายแต่ยังไม่ได้ implement ครบทุกกรณีตอนเกิดเหตุ",
    },
    {
      slug: "renewal-monitor-timezone-bug",
      title: "คำนวณวันแจ้งเตือนต่ออายุผิดเพราะ Timezone",
      tags: ["renewal", "bug"],
      summary:
        "สัญญาที่มีคู่สัญญาอยู่ต่างประเทศได้รับการแจ้งเตือนต่ออายุช้ากว่ากำหนดเกือบหนึ่งวันเต็ม ทำให้เวลาตัดสินใจเหลือน้อยกว่าที่ควร",
      investigation:
        "ตรวจ {{ref:module:renewal-monitor}} พบว่า `scanExpiringContracts` คำนวณวันหมดอายุโดยใช้ timezone ของ server (UTC) แต่วันหมดอายุที่ระบุในสัญญาบางฉบับถูกป้อนเข้าระบบตาม timezone ท้องถิ่นของคู่สัญญาที่ต่างจาก UTC มาก",
      cause:
        "field วันหมดอายุสัญญาไม่มี timezone กำกับชัดเจนตอนบันทึกเข้าระบบ (naive date) ทำให้การคำนวณ 'เหลืออีกกี่วันก่อนหมดอายุ' คลาดเคลื่อนได้ตาม timezone ของผู้ป้อนข้อมูล",
      resolution:
        "แก้ไขวันแจ้งเตือนของสัญญาที่ได้รับผลกระทบด้วยมือ แล้วปรับให้ field วันหมดอายุเก็บพร้อม timezone กำกับเสมอ",
      followup:
        "ตรวจสอบ field วันที่อื่นในระบบทั้งหมดว่ามีปัญหา naive date แบบเดียวกันหรือไม่ โดยเฉพาะ field ที่ใช้คำนวณการแจ้งเตือนที่มีผลต่อกำหนดเวลาทางกฎหมาย",
    },
    {
      slug: "confidential-contract-leaked-wrong-recipient",
      title: "สัญญาที่มีเงื่อนไขรักษาความลับถูกส่งผิดคน",
      tags: ["confidentiality", "access-control"],
      summary:
        "สัญญาความร่วมมือที่มีเงื่อนไขรักษาความลับเข้มงวดถูกส่งไปยังอีเมลภายนอกที่ไม่เกี่ยวข้องกับสัญญาฉบับนั้นเลย เพราะการตั้งค่าสิทธิ์การเข้าถึงผิดพลาด",
      investigation:
        "ตรวจสอบพบว่าฟีเจอร์ 'ส่งสำเนาให้ที่ปรึกษาภายนอก' ที่เพิ่ม feature ใหม่เข้ามา ใช้รายชื่ออีเมลจาก contact list ที่แชร์ข้ามสัญญาหลายฉบับ แทนที่จะดึงจากรายชื่อที่ผูกกับสัญญาฉบับนั้นโดยเฉพาะ",
      cause:
        "การออกแบบ contact list ไม่ได้แยกขอบเขตตามสัญญาแต่ละฉบับ ทำให้ feature ใหม่ที่เขียนโดยไม่รู้ข้อจำกัดนี้ดึงรายชื่อผิดขอบเขตไปโดยไม่ตั้งใจ",
      resolution:
        "แจ้งผู้รับผิดชอบให้ลบอีเมลที่ส่งผิดทันที ประเมินความเสี่ยงทางกฎหมายร่วมกับทีม compliance และแจ้งคู่สัญญาตามข้อกำหนดการรายงานเหตุการณ์รั่วไหล",
      followup:
        "แยกขอบเขต contact list ให้ผูกกับสัญญาแต่ละฉบับอย่างเคร่งครัด และเพิ่ม review ด้วยมือก่อน merge ฟีเจอร์ใดๆ ที่แตะการส่งเอกสารสัญญาที่มีเงื่อนไขรักษาความลับ",
    },
    {
      slug: "archival-retention-deleted-too-early",
      title: "ลบสัญญาก่อนครบกำหนดระยะเวลาเก็บรักษาตามกฎหมาย",
      tags: ["archival", "compliance"],
      summary:
        "ทีม compliance ตรวจพบว่าสัญญาที่หมดอายุไปแล้วหลายฉบับถูกลบออกจากระบบก่อนครบ 10 ปีตามที่ {{ref:policy:contract-archival-retention-policy}} กำหนดไว้",
      investigation:
        "ตรวจสอบพบว่า job ทำความสะอาดข้อมูลเก่าที่เพิ่มเข้ามาใหม่ใช้เงื่อนไข 'ไม่มีการเข้าถึงเกิน 2 ปี' เป็นตัวตัดสินใจลบ โดยไม่ได้ตรวจสอบระยะเวลาเก็บรักษาตามกฎหมายที่แท้จริงของสัญญาแต่ละประเภทก่อน",
      cause:
        "job ทำความสะอาดข้อมูลถูกออกแบบแยกต่างหากโดยทีมที่ดูแลเรื่อง storage cost โดยไม่ได้ปรึกษาทีมกฎหมายเรื่องข้อกำหนดการเก็บรักษาเอกสารตามกฎหมายก่อน",
      resolution:
        "กู้คืนสัญญาที่ถูกลบจาก backup ทันที ปิด job ทำความสะอาดที่มีปัญหาไว้ก่อนจนกว่าจะแก้ไขเงื่อนไขให้ถูกต้อง",
      followup:
        "แก้ job ให้ตรวจสอบระยะเวลาเก็บรักษาตามกฎหมายของสัญญาแต่ละประเภทก่อนลบเสมอ และบังคับให้ทุก job ที่ลบข้อมูลถาวรต้องผ่านการ review จากทีมกฎหมายก่อน deploy",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/LEX-341-approval-role-validation`, `fix/LEX-358-signature-order-lock`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(signature-orchestrator): เพิ่ม idempotency key กันเซ็นผิดลำดับ`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ approval chain หรือลำดับการเซ็นต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:signature-order-violated}}) และฟังก์ชันที่กระทบเนื้อหาสัญญาที่มีเงื่อนไขรักษาความลับต้องมีคนที่สองยืนยันก่อน merge" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `computeApprovalChain`, `recordSignature` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`contractId` รูปแบบ `ctr_<ULID>`, `templateId` รูปแบบ `tpl_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนสัญญาทั้งหมดในระบบได้" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับกระบวนการอนุมัติหรือเซ็นต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ห้าม log เนื้อหาสัญญาที่เป็นความลับ", body: "ห้าม log เนื้อหา clause หรือรายละเอียดคู่สัญญาที่มีเงื่อนไขรักษาความลับลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ contractId เท่านั้น" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`LEX_<DOMAIN>_<REASON>` เช่น `LEX_APPROVAL_STEP_PENDING`, `LEX_SIGNATURE_ORDER_VIOLATION` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`LEX_TEMPLATE_VERSION_STALE`, `LEX_COUNTERPARTY_UNVERIFIED`, `LEX_NEGOTIATION_ROUND_EXCEEDED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Concurrent test", body: "ฟังก์ชันที่แก้ approval chain หรือ template ต้องมี test จำลอง concurrent call อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก {{ref:incident:template-engine-race-condition}}" },
        { heading: "Approval chain test", body: "ทุกโครงสร้างราคาที่รองรับ (คงที่, ขั้นบันได, revenue-share) ต้องมี test ยืนยันว่าคำนวณมูลค่าและ route เข้า tier อนุมัติถูกต้อง — บทเรียนจาก {{ref:incident:approval-chain-value-threshold-bypass}}" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw exception message ของ backend ออกไปตรงๆ เพราะอาจรั่วรายละเอียดสัญญาที่เป็นความลับโดยไม่ตั้งใจ" },
      ],
    },
    {
      slug: "clause-versioning-convention",
      title: "Clause Versioning Convention",
      tags: ["template", "compliance"],
      intro: "clause แต่ละตัวใน library มีเวอร์ชันของตัวเองแยกจากเวอร์ชันของ template — เอกสารนี้กำหนดว่าเมื่อไหร่ต้อง bump เวอร์ชัน clause",
      sections: [
        { heading: "เมื่อไหร่ต้อง bump major version", body: "การเปลี่ยนความหมายทางกฎหมายของ clause (เช่น เปลี่ยนขอบเขตความรับผิด) ต้อง bump major version เสมอ และแจ้งเตือนทีมกฎหมายทุกคนที่มีสัญญาใช้ clause เวอร์ชันเก่าอยู่" },
        { heading: "เมื่อไหร่ bump แค่ minor version", body: "การแก้ไขถ้อยคำโดยไม่เปลี่ยนความหมายทางกฎหมาย (เช่น แก้ไวยากรณ์) bump แค่ minor version พอ ไม่ต้องแจ้งเตือนทีมกฎหมายเป็นวงกว้าง" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → approval-chain test (ครอบคลุมทุกโครงสร้างราคาที่รองรับ) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:approval-router}} และ {{ref:module:signature-orchestrator}} ต้องผ่าน test ครอบคลุม role/ลำดับการเซ็น 100% ก่อน merge เสมอ เพราะความผิดพลาดในสองจุดนี้มีผลทางกฎหมายที่แก้ไขย้อนหลังไม่ได้" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → approval-router | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| template-engine → database pool acquire | 3s | `pg-pool` config |\n| signature-orchestrator → e-signature provider | 15s | env `SIGNATURE_PROVIDER_TIMEOUT_MS` |" },
        { heading: "เหตุผลที่ signature provider timeout นานกว่าปกติ", body: "e-signature provider ภายนอกบางครั้งใช้เวลานานกว่าปกติเมื่อคู่สัญญากำลังกรอกข้อมูลยืนยันตัวตนเพิ่มเติม — timeout สั้นเกินไปจะทำให้ signature request ถูกยกเลิกกลางคันโดยไม่จำเป็น" },
      ],
    },
    {
      slug: "contract-migration-runbook",
      title: "Contract Data Migration Runbook",
      tags: ["migration", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ migrate ข้อมูลสัญญาจากระบบเดิมหรือเปลี่ยนโครงสร้างฐานข้อมูล ตามบทเรียนจาก {{ref:incident:obligation-tracker-wrong-contract-mapping}}",
      sections: [
        { heading: "ก่อน migrate", body: "ต้องมีตัวระบุที่ไม่ซ้ำกันเชื่อมระหว่างระบบเก่าและใหม่เสมอ ห้ามพึ่งลำดับการ import เป็นตัวจับคู่ข้อมูลที่มีผลกระทบทางกฎหมาย" },
        { heading: "หลัง migrate", body: "ต้องยืนยันจำนวนสัญญาและ obligation ที่ migrate ครบตรงกับต้นทาง 100% พร้อมสุ่มตรวจเนื้อหาสัญญาจริงเทียบกับต้นฉบับก่อนปิดระบบเดิม" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = เนื้อหาสัญญาที่มีเงื่อนไขรักษาความลับรั่วไหลหรือลำดับการเซ็นถูกละเมิด, Sev2 = กระทบขั้นตอนอนุมัติหรือ obligation บางส่วน, Sev3 = กระทบเล็กน้อยไม่ถึงเนื้อหาสัญญาหรือกระบวนการเซ็นโดยตรง" },
        { heading: "กรณีที่เกี่ยวกับความลับ", body: "ทุกเหตุการณ์ที่เกี่ยวข้องกับการรั่วไหลของสัญญาที่มีเงื่อนไขรักษาความลับ ต้องยกระดับเป็น Sev1 เสมอและแจ้งทีมกฎหมายทันที เขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "scheduled job (renewal scan, reminder) ล้มเหลวหรือไม่รันตามกำหนด, obligation ที่เลยกำหนดสะสมเกิน 10 รายการต่อสัปดาห์, approval chain ที่ค้างเกิน 7 วันไม่มีการอนุมัติ" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ approval chain คำนวณผิดหรือลำดับการเซ็นผิดเพี้ยน ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:approval-route-skipped-role-misconfig}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมกฎหมายทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| approval-router | 2 | 6 | latency p95 > 150ms |\n| signature-orchestrator | 2 | 8 | queue depth > 200 |\n| renewal-monitor | 1 | 2 | ไม่ scale ตาม load เพราะเป็น scheduled job ล้วนๆ |" },
        { heading: "ข้อจำกัดที่ต้องระวัง", body: "approval-router ต้องมี availability สูงตลอดเวลาทำการ เพราะสัญญาที่ค้างอยู่ในขั้นตอนอนุมัตินานเกินไปกระทบ business timeline ของดีลได้โดยตรง" },
      ],
    },
    {
      slug: "signature-provider-failover-runbook",
      title: "Signature Provider Failover Runbook",
      tags: ["signature", "runbook"],
      intro: "ขั้นตอนเมื่อ e-signature provider ภายนอกล่มหรือตอบสนองช้าผิดปกติ ต้องมีแผนสำรองเพราะกระทบกระบวนการเซ็นที่กำลังดำเนินอยู่โดยตรง",
      sections: [
        { heading: "การตรวจจับ", body: "monitor response time ของ {{ref:module:signature-orchestrator}} ต่อ provider ภายนอก ถ้า error rate เกิน 10% ใน 5 นาที ให้ยกระดับเป็น Sev2 ทันที" },
        { heading: "แผนสำรอง", body: "signature request ที่กำลังดำเนินอยู่จะถูก queue ไว้รอ ไม่ยกเลิกทิ้งอัตโนมัติ เพราะการยกเลิกกลางคันอาจทำให้ลำดับการเซ็นเสียหายตาม {{ref:policy:signature-order-enforcement-policy}} — ต้องรอ provider กลับมาทำงานปกติก่อนจึงส่ง request ที่ค้างอยู่ต่อ" },
      ],
    },
  ],
};
