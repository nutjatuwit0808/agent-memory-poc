import type { DomainProfile } from "../types.js";

// RecurFlow — ระบบบริหารรายได้ประจำสำหรับ SaaS subscription (NOT PayFlow)
// เป็นระบบสมมติล้วนๆ ไม่เกี่ยวข้องกับ payment/refund/order ของ PayFlow เลย — distractor domain
// โฟกัสที่วงจรชีวิต subscription: เปลี่ยนแพลน, proration, dunning, invoice, usage metering
export const subscriptionBilling: DomainProfile = {
  id: "subscription-billing",
  displayName: "RecurFlow — ระบบบริหารรายได้ประจำสำหรับ SaaS",
  summary: [
    "RecurFlow คือระบบบริหารวงจรชีวิต subscription สำหรับผลิตภัณฑ์ SaaS จัดการการเปลี่ยนแพลน (upgrade/downgrade) การคำนวณ proration เมื่อเปลี่ยนแพลนกลางรอบบิล กระบวนการ dunning เมื่อชำระเงินไม่สำเร็จ การสร้างใบแจ้งหนี้ และการวัดปริมาณการใช้งานสำหรับแพลนที่คิดค่าบริการตามการใช้งานจริง",
    "ทีมวิศวกรรมออกแบบระบบให้แยก 'การคำนวณ' ออกจาก 'การเรียกเก็บเงินจริง' อย่างชัดเจน เพราะการคำนวณ proration และใบแจ้งหนี้มีกฎทางธุรกิจซับซ้อนที่เปลี่ยนบ่อย ในขณะที่การเรียกเก็บเงินจริงต้องมีความแน่นอนสูงและ audit ได้ทุกขั้นตอน แยกกันชัดเจนช่วยให้แก้กฎธุรกิจได้โดยไม่กระทบความน่าเชื่อถือของการเรียกเก็บเงิน",
  ],
  domainTags: ["subscription-billing", "recurflow"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:plan-manager}} เป็นเจ้าของสถานะแพลนปัจจุบันของทุก subscription ส่วน {{ref:module:proration-calculator}} เป็นแค่ pure calculation ไม่เก็บ state ถาวรของตัวเอง",
    "{{ref:module:invoice-generator}} ไม่คำนวณราคาเอง อ่านผลจาก {{ref:module:proration-calculator}} และ {{ref:module:usage-meter}} เท่านั้น เพื่อให้มีจุดเดียวที่ตัดสินใจราคาที่ถูกต้อง ไม่ให้ logic การคำนวณราคากระจายอยู่หลายที่",
  ],
  apiGatewayNote: [
    "คำขอจาก dashboard ของลูกค้าเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ accountId ไปกับทุก request ก่อนส่งต่อให้ service ที่เกี่ยวข้อง",
    "webhook จาก payment processor ภายนอกที่แจ้งผลการชำระเงิน (สำเร็จ/ล้มเหลว) ใช้ endpoint แยกที่ verify signature ก่อนประมวลผลเสมอ ไม่เชื่อ payload ที่ไม่ผ่านการยืนยันแหล่งที่มา",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:plan-manager}} ดูแล ได้แก่ `subscriptions` (สถานะปัจจุบัน), `plan_change_history`, และ `plan_catalog`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `subscriptions` | plan-manager | สถานะปัจจุบันเท่านั้น |\n| `plan_change_history` | plan-manager | เก็บทุกครั้งที่เปลี่ยนแพลน ไม่ลบทิ้ง |\n| `invoices` | invoice-generator | ไม่มี FK ตรงไป subscriptions ใช้ subscriptionId แบบ soft reference |\n| `usage_records` | usage-meter | time-series เก็บทุกจุดข้อมูลการใช้งานดิบ |",
    "ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก invoice มี subscriptionId ที่มีอยู่จริง)",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `plan.changed`, `invoice.generated`, `payment.failed`, `payment.succeeded`, `trial.expiring`, `usage.threshold_exceeded` — {{ref:module:dunning-engine}} subscribe `payment.failed` เพื่อเริ่มกระบวนการ retry การเรียกเก็บเงินอัตโนมัติ",
    "{{ref:module:proration-calculator}} ไม่ subscribe event ใดๆ เพราะเป็น pure calculation ที่ถูกเรียกแบบ synchronous จาก {{ref:module:plan-manager}} โดยตรงเมื่อมีการเปลี่ยนแพลนเท่านั้น",
  ],
  modules: [
    {
      slug: "plan-manager",
      name: "plan-manager",
      tags: ["plan", "module", "core"],
      description:
        "จัดการสถานะแพลนปัจจุบันของทุก subscription และการเปลี่ยนแพลน (upgrade/downgrade) เป็น service เดียวที่ตัดสินใจว่า subscription หนึ่งอยู่แพลนไหนในเวลาใด แยกออกมาเป็น service อิสระเพราะการเปลี่ยนแพลนมีกฎทางธุรกิจที่ซับซ้อนและเปลี่ยนแปลงบ่อยตามกลยุทธ์ราคาของบริษัท",
      functions: [
        { sig: "changePlan(subscriptionId: string, newPlanId: string, effectiveDate?: string): Promise<string>", desc: "เปลี่ยนแพลน คำนวณวันที่มีผลตามนโยบาย คืน changeId" },
        { sig: "getCurrentPlan(subscriptionId: string): Promise<PlanDetail>", desc: "คืนแพลนปัจจุบันของ subscription หนึ่ง" },
        { sig: "getPlanChangeHistory(subscriptionId: string): Promise<PlanChange[]>", desc: "คืนประวัติการเปลี่ยนแพลนทั้งหมด" },
      ],
      stateFlow: "active (planA) → change_requested → active (planB) — ดู {{ref:policy:downgrade-effective-date-policy}} สำหรับวันที่มีผลของ downgrade",
      relatedNotes:
        "ทุกครั้งที่เปลี่ยนแพลนสำเร็จ publish event `plan.changed` ให้ {{ref:module:proration-calculator}} เรียกแบบ synchronous เพื่อคำนวณส่วนต่างค่าบริการทันที",
      internals: {
        constants: [
          { name: "PLAN_CHANGE_COOLDOWN_HOURS", value: "24" },
          { name: "PLAN_HISTORY_RETENTION_YEARS", value: "7" },
        ],
        typeSnippet:
          "interface PlanDetail {\n  subscriptionId: string;\n  planId: string;\n  effectiveSince: string;\n  status: \"active\" | \"pending_change\" | \"cancelled\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง downgrade ที่ {{ref:policy:downgrade-effective-date-policy}}",
      },
    },
    {
      slug: "proration-calculator",
      name: "proration-calculator",
      tags: ["proration", "module", "core"],
      description:
        "คำนวณส่วนต่างค่าบริการเมื่อเปลี่ยนแพลนกลางรอบบิล เป็น pure calculation ไม่เก็บ state ถาวรของตัวเอง แยกออกมาเป็น service อิสระเพราะสูตร proration ซับซ้อนและมีหลายวิธีคำนวณ (รายวันเทียบรายเดือน) ที่ต้องเลือกใช้ตามประเภทแพลน",
      functions: [
        { sig: "calculateProration(subscriptionId: string, oldPlanId: string, newPlanId: string, changeDate: string): Promise<ProrationResult>", desc: "คำนวณส่วนต่างค่าบริการจากการเปลี่ยนแพลน" },
        { sig: "getProrationMethod(planId: string): Promise<\"daily\" | \"monthly\">", desc: "คืนวิธีคำนวณ proration ที่ใช้กับแพลนนั้น" },
      ],
      relatedNotes:
        "ถูกเรียกแบบ synchronous จาก {{ref:module:plan-manager}} เท่านั้น ไม่มี endpoint สาธารณะให้เรียกตรงจากภายนอก เพื่อให้การคำนวณ proration เกิดขึ้นพร้อมกับการเปลี่ยนแพลนเสมอไม่มีช่วงเวลาที่ไม่สอดคล้องกัน ดู {{ref:policy:proration-method-selection-policy}}",
      internals: {
        constants: [
          { name: "PRORATION_ROUNDING_PRECISION", value: "2" },
          { name: "MIN_PRORATION_AMOUNT_THB", value: "1" },
        ],
        typeSnippet:
          "interface ProrationResult {\n  creditAmount: number;\n  chargeAmount: number;\n  netAmount: number;\n  method: \"daily\" | \"monthly\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องวิธีคำนวณที่ {{ref:policy:proration-method-selection-policy}}",
      },
    },
    {
      slug: "dunning-engine",
      name: "dunning-engine",
      tags: ["dunning", "module", "core"],
      description:
        "จัดการกระบวนการเรียกเก็บเงินซ้ำเมื่อการชำระเงินครั้งแรกล้มเหลว ตามตารางเวลา retry ที่กำหนด และตัดสินใจว่าเมื่อไหร่ต้องระงับบริการถ้ายังชำระไม่สำเร็จ เป็นจุดเดียวที่ตัดสินใจ retry schedule ไม่มี service อื่นเรียกเก็บเงินซ้ำเอง",
      functions: [
        { sig: "startDunningProcess(subscriptionId: string, failedInvoiceId: string): Promise<string>", desc: "เริ่มกระบวนการ dunning เมื่อการชำระเงินล้มเหลว คืน dunningId" },
        { sig: "retryPayment(dunningId: string): Promise<PaymentResult>", desc: "ลองเรียกเก็บเงินซ้ำตามรอบที่กำหนด" },
        { sig: "suspendService(subscriptionId: string): Promise<void>", desc: "ระงับบริการเมื่อ dunning ครบทุกรอบแล้วยังไม่สำเร็จ" },
      ],
      stateFlow: "retry_scheduled → retry_1 → retry_2 → retry_3 → resolved | suspended — ดู {{ref:policy:dunning-retry-schedule-policy}}",
      relatedNotes:
        "subscribe event `payment.failed` จาก payment processor ภายนอกเพื่อเริ่มกระบวนการอัตโนมัติ ไม่รอให้ทีม billing เริ่มด้วยมือ",
      internals: {
        constants: [
          { name: "DUNNING_MAX_RETRY_COUNT", value: "3" },
          { name: "DUNNING_RETRY_INTERVAL_DAYS", value: "3" },
        ],
        typeSnippet:
          "interface DunningStatus {\n  dunningId: string;\n  subscriptionId: string;\n  retryCount: number;\n  status: \"active\" | \"resolved\" | \"suspended\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องตารางเวลา retry ที่ {{ref:policy:dunning-retry-schedule-policy}}",
      },
    },
    {
      slug: "invoice-generator",
      name: "invoice-generator",
      tags: ["invoice", "module"],
      description:
        "สร้างใบแจ้งหนี้จากข้อมูลแพลนปัจจุบัน ผล proration และการใช้งานที่วัดได้ ไม่คำนวณราคาเอง อ่านผลจาก service อื่นเท่านั้น แยกออกมาเพื่อให้รูปแบบเอกสารใบแจ้งหนี้เปลี่ยนได้อิสระจาก logic การคำนวณราคา",
      functions: [
        { sig: "generateInvoice(subscriptionId: string, billingPeriod: TimeRange): Promise<string>", desc: "สร้างใบแจ้งหนี้สำหรับรอบบิลหนึ่ง คืน invoiceId" },
        { sig: "getInvoiceDueDate(subscriptionId: string, generatedAt: string): Promise<string>", desc: "คำนวณวันครบกำหนดชำระตามนโยบาย" },
        { sig: "voidInvoice(invoiceId: string, reason: string): Promise<void>", desc: "ยกเลิกใบแจ้งหนี้ที่ออกผิดพลาด" },
      ],
      relatedNotes:
        "ดึงข้อมูลจาก {{ref:module:proration-calculator}} และ {{ref:module:usage-meter}} มาประกอบเป็นใบแจ้งหนี้เดียว ดู {{ref:policy:invoice-due-date-calculation-policy}}",
    },
    {
      slug: "usage-meter",
      name: "usage-meter",
      tags: ["usage", "module", "core"],
      description:
        "วัดปริมาณการใช้งานสำหรับแพลนที่คิดค่าบริการตามการใช้งานจริง (usage-based pricing) เก็บเป็น time-series และคำนวณยอดรวมสำหรับรอบบิล เป็น service เดียวที่นับปริมาณการใช้งาน ไม่มี service อื่นนับซ้ำเอง",
      functions: [
        { sig: "recordUsage(subscriptionId: string, metric: string, quantity: number): Promise<void>", desc: "บันทึกการใช้งาน 1 รายการ" },
        { sig: "getUsageTotal(subscriptionId: string, metric: string, period: TimeRange): Promise<number>", desc: "คืนยอดรวมการใช้งานในช่วงเวลาที่กำหนด" },
        { sig: "checkOverageThreshold(subscriptionId: string, metric: string): Promise<OverageStatus>", desc: "ตรวจสอบว่าการใช้งานเกินโควตาแพลนหรือไม่" },
      ],
      relatedNotes:
        "publish event `usage.threshold_exceeded` เมื่อการใช้งานเกินโควตา ให้ทีม billing และลูกค้าได้รับแจ้งเตือนก่อนใบแจ้งหนี้จะออก ดู {{ref:policy:usage-overage-billing-policy}}",
    },
    {
      slug: "trial-controller",
      name: "trial-controller",
      tags: ["trial", "module"],
      description:
        "จัดการช่วงทดลองใช้ฟรี (free trial) ตั้งแต่เริ่มต้น การขยายเวลาในกรณีพิเศษ ไปจนถึงการแปลงเป็น subscription แบบชำระเงินเมื่อ trial สิ้นสุด แยกออกมาเป็น service อิสระเพราะ trial มีสถานะและกฎที่ต่างจาก subscription ที่ชำระเงินแล้วโดยสิ้นเชิง",
      functions: [
        { sig: "startTrial(accountId: string, planId: string): Promise<string>", desc: "เริ่มช่วงทดลองใช้ฟรี คืน trialId" },
        { sig: "extendTrial(trialId: string, additionalDays: number, reason: string): Promise<void>", desc: "ขยายเวลาทดลองใช้ในกรณีพิเศษ ต้องระบุเหตุผล" },
        { sig: "convertToSubscription(trialId: string, paymentMethodId: string): Promise<string>", desc: "แปลง trial เป็น subscription ที่ชำระเงินจริง" },
      ],
      stateFlow: "active → extended (optional) → converted | expired — ดู {{ref:policy:trial-length-extension-rules-policy}}",
      relatedNotes:
        "publish event `trial.expiring` ล่วงหน้าก่อน trial หมดอายุ ให้ลูกค้ามีเวลาตัดสินใจก่อนแปลงเป็นชำระเงินหรือปล่อยให้หมดอายุ",
    },
  ],
  envVarGroups: [
    {
      service: "plan-manager-service",
      vars: [
        { name: "PLAN_CHANGE_COOLDOWN_HOURS", example: "24", note: "" },
        { name: "PLAN_HISTORY_RETENTION_YEARS", example: "7", note: "" },
      ],
    },
    {
      service: "proration-calculator-service",
      vars: [
        { name: "PRORATION_ROUNDING_PRECISION", example: "2", note: "" },
        { name: "MIN_PRORATION_AMOUNT_THB", example: "1", note: "ดู {{ref:policy:proration-method-selection-policy}}" },
      ],
    },
    {
      service: "dunning-engine-service",
      vars: [
        { name: "DUNNING_MAX_RETRY_COUNT", example: "3", note: "" },
        { name: "DUNNING_RETRY_INTERVAL_DAYS", example: "3", note: "ดู {{ref:policy:dunning-retry-schedule-policy}}" },
      ],
    },
    {
      service: "usage-meter-service",
      vars: [
        { name: "USAGE_RECORD_RETENTION_MONTHS", example: "24", note: "" },
        { name: "USAGE_THRESHOLD_ALERT_PERCENT", example: "80", note: "" },
      ],
    },
  ],
  policies: [
    {
      slug: "proration-method-selection-policy",
      title: "นโยบายการเลือกวิธีคำนวณ Proration",
      tags: ["proration", "policy"],
      isPrimary: true,
      intro: [
        "แพลนแต่ละประเภทกำหนดวิธีคำนวณ proration ของตัวเอง (`daily` คิดตามสัดส่วนวันจริงที่เหลือในรอบบิล หรือ `monthly` คิดเป็นเดือนเต็มไม่สนใจวันที่เปลี่ยน) — {{ref:module:proration-calculator}} เลือกวิธีตาม `getProrationMethod` เสมอ ไม่มีการ override เป็นรายกรณี",
        "การเปลี่ยนแพลนภายในวันเดียวกัน (เช่น upgrade แล้ว downgrade กลับในวันเดียว) จะไม่เกิดการคำนวณ proration สองรอบ ระบบจะยุบเป็นการคำนวณครั้งเดียวจากแพลนต้นทางไปยังแพลนปลายทางสุดท้าย",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อเปลี่ยนแพลนข้ามรอบบิลที่มีความยาวต่างกัน",
        tags: ["proration", "edge-case"],
        body: [
          "ถ้าเปลี่ยนจากแพลนรายเดือนไปแพลนรายปี (หรือกลับกัน) กลางรอบบิล การคำนวณ proration จะใช้วิธี `daily` เสมอไม่ว่าแพลนต้นทางหรือปลายทางจะกำหนดวิธี `monthly` ไว้ก็ตาม เพราะรอบบิลที่มีความยาวต่างกันไม่สามารถเทียบเป็นสัดส่วนเดือนได้อย่างยุติธรรม",
          "ยอด proration ที่คำนวณได้ต่ำกว่า `MIN_PRORATION_AMOUNT_THB` จะถูกปัดเป็นศูนย์ไม่เรียกเก็บหรือคืนเงิน เพื่อไม่ให้เกิดรายการเก็บเงินจำนวนน้อยมากที่สร้างความสับสนมากกว่าประโยชน์ที่ได้",
        ],
      },
    },
    {
      slug: "dunning-retry-schedule-policy",
      title: "นโยบายตารางเวลา Retry การเรียกเก็บเงิน",
      tags: ["dunning", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อการชำระเงินล้มเหลว ระบบจะลองเรียกเก็บซ้ำสูงสุด `DUNNING_MAX_RETRY_COUNT` ครั้ง ห่างกันครั้งละ `DUNNING_RETRY_INTERVAL_DAYS` วัน ถ้าครบทุกรอบแล้วยังไม่สำเร็จจะระงับบริการอัตโนมัติ",
        "ระหว่างกระบวนการ dunning ลูกค้ายังคงใช้บริการได้ตามปกติ ไม่ระงับทันทีตั้งแต่ครั้งแรกที่ชำระเงินล้มเหลว เพื่อไม่ให้ปัญหาชั่วคราว (เช่น บัตรหมดอายุพอดี) กระทบประสบการณ์ใช้งานทันที",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อสาเหตุการล้มเหลวชัดเจนว่าแก้ไม่ได้",
        tags: ["dunning", "edge-case"],
        body: [
          "ถ้า payment processor ส่งรหัสข้อผิดพลาดที่บ่งชี้ชัดเจนว่าเป็นปัญหาถาวร (เช่น บัตรถูกยกเลิกแล้ว ไม่ใช่แค่ยอดเงินไม่พอ) ระบบจะข้ามการ retry ตามตารางปกติและแจ้งลูกค้าให้อัปเดตวิธีชำระเงินทันที แทนการเสียเวลา retry ที่รู้อยู่แล้วว่าจะไม่สำเร็จ",
          "การตัดสินใจข้าม retry ใช้ error code จาก payment processor เป็นเกณฑ์เท่านั้น ไม่เดาจากจำนวนครั้งที่ล้มเหลวก่อนหน้า เพราะสาเหตุการล้มเหลวแต่ละครั้งอาจไม่เหมือนกัน",
        ],
      },
    },
    {
      slug: "trial-length-extension-rules-policy",
      title: "นโยบายระยะเวลาทดลองใช้และการขยายเวลา",
      tags: ["trial", "policy"],
      isPrimary: true,
      intro: [
        "ระยะเวลาทดลองใช้มาตรฐานคือ 14 วัน ขยายได้สูงสุดรวมไม่เกิน 30 วันต่อบัญชีหนึ่ง ไม่ว่าจะขยายกี่ครั้งก็ตาม เพื่อป้องกันการใช้ฟรีต่อเนื่องไม่มีกำหนด",
        "การขยายเวลาต้องระบุเหตุผลเสมอผ่าน `extendTrial` และถูกบันทึกไว้สำหรับการวิเคราะห์ภายหลังว่าเหตุผลใดที่ทำให้ทีมขายต้องขยายเวลาบ่อย",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับลูกค้าองค์กรที่อยู่ระหว่างการประเมิน",
        tags: ["trial", "edge-case"],
        body: [
          "ลูกค้าองค์กรขนาดใหญ่ที่อยู่ระหว่างกระบวนการจัดซื้อภายในซึ่งมักใช้เวลานานกว่าปกติ สามารถขอ trial แบบพิเศษที่ไม่มีเพดาน 30 วันได้ ผ่านการอนุมัติจากทีมขายองค์กรโดยเฉพาะ ไม่ใช่ผ่าน `extendTrial` ปกติ",
          "trial แบบพิเศษนี้ต้องมีวันสิ้นสุดที่ชัดเจนเสมอแม้จะยาวกว่าปกติ ไม่มี trial แบบไม่มีวันหมดอายุเด็ดขาด และต้องทบทวนสถานะทุก 30 วันว่ายังอยู่ระหว่างกระบวนการจัดซื้อจริงหรือไม่",
        ],
      },
    },
    {
      slug: "usage-overage-billing-policy",
      title: "นโยบายการคิดเงินส่วนเกินโควตา",
      tags: ["usage", "policy"],
      isPrimary: true,
      intro: [
        "การใช้งานที่เกินโควตาของแพลนจะถูกคิดเงินเพิ่มตามอัตราส่วนเกินที่กำหนดต่อแพลน คำนวณจากยอดรวมทั้งรอบบิล ไม่ใช่คิดทันทีที่เกินโควตาในแต่ละวัน",
        "ลูกค้าได้รับแจ้งเตือนเมื่อการใช้งานถึง `USAGE_THRESHOLD_ALERT_PERCENT` ของโควตา เพื่อให้มีโอกาสอัปเกรดแพลนหรือปรับการใช้งานก่อนถูกคิดเงินส่วนเกินจริงตอนออกใบแจ้งหนี้",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อการใช้งานเกินเพราะข้อผิดพลาดของระบบ",
        tags: ["usage", "edge-case"],
        body: [
          "ถ้าการใช้งานที่เกินโควตาเกิดจากข้อผิดพลาดของระบบฝั่ง RecurFlow เอง (เช่น bug ที่นับซ้ำ) ลูกค้าจะไม่ถูกเรียกเก็บเงินส่วนเกินที่เกิดจากข้อผิดพลาดนั้น ต้องแก้ไขยอดการใช้งานให้ถูกต้องก่อนสร้างใบแจ้งหนี้เสมอ",
          "การยกเว้นนี้ใช้เฉพาะกรณีที่พิสูจน์ได้ชัดเจนว่าเป็นข้อผิดพลาดของระบบเท่านั้น ไม่ใช้กับกรณีที่ลูกค้าใช้งานเกินจริงแล้วอ้างว่าไม่ได้ตั้งใจ",
        ],
      },
    },
    {
      slug: "downgrade-effective-date-policy",
      title: "นโยบายวันที่มีผลของการ Downgrade แพลน",
      tags: ["plan", "policy"],
      isPrimary: true,
      intro: [
        "การ downgrade แพลนจะมีผลเมื่อสิ้นสุดรอบบิลปัจจุบันเสมอ ไม่มีผลทันที เพื่อให้ลูกค้าใช้สิทธิ์ที่จ่ายเงินไปแล้วเต็มรอบบิลก่อนเปลี่ยนไปแพลนที่มีสิทธิ์น้อยกว่า",
        "ระหว่างที่รอ downgrade มีผล ลูกค้ายังคงใช้ฟีเจอร์ของแพลนเดิมได้เต็มที่ และสามารถยกเลิกคำขอ downgrade ได้ตลอดเวลาก่อนที่จะมีผลจริง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Downgrade เกิดจากการยกเลิกฟีเจอร์ที่ผิดกฎหมาย",
        tags: ["plan", "compliance", "edge-case"],
        body: [
          "ถ้าการ downgrade เกิดจากเหตุผลด้าน compliance (เช่น ฟีเจอร์บางอย่างต้องปิดใช้งานทันทีตามข้อกำหนดทางกฎหมายใหม่) การ downgrade จะมีผลทันทีโดยไม่รอสิ้นสุดรอบบิล และลูกค้าจะได้รับเครดิตคืนตามสัดส่วนที่เหลือของรอบบิลนั้นแทน",
          "การ downgrade แบบทันทีนี้ต้องมีการอนุมัติจากทีม compliance ก่อนเสมอ ไม่ใช่ทีมขายหรือทีมสนับสนุนตัดสินใจเองว่าเป็นกรณี compliance ได้",
        ],
      },
    },
    {
      slug: "invoice-due-date-calculation-policy",
      title: "นโยบายการคำนวณวันครบกำหนดชำระ",
      tags: ["invoice", "policy"],
      isPrimary: true,
      intro: [
        "ใบแจ้งหนี้มีกำหนดชำระ 15 วันนับจากวันที่ออกใบแจ้งหนี้สำหรับลูกค้าทั่วไป ส่วนลูกค้าองค์กรที่มีสัญญาระบุเงื่อนไขการชำระพิเศษ (เช่น net-30) ใช้ตามที่ระบุในสัญญาแทน",
        "วันครบกำหนดชำระคำนวณจากวันที่ระบบสร้างใบแจ้งหนี้จริง ไม่ใช่วันที่ควรจะสร้างตามตารางเวลาปกติ ถ้าใบแจ้งหนี้ออกช้ากว่ากำหนดเพราะปัญหาระบบ วันครบกำหนดชำระจะขยับตามไปด้วยโดยอัตโนมัติ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อลูกค้าอยู่ระหว่างกระบวนการ Dunning",
        tags: ["invoice", "edge-case"],
        body: [
          "ใบแจ้งหนี้ใหม่ที่ออกให้ลูกค้าที่ยังอยู่ระหว่างกระบวนการ dunning จากใบแจ้งหนี้ก่อนหน้า จะมีกำหนดชำระสั้นกว่าปกติ (7 วันแทน 15 วัน) เพื่อไม่ให้ยอดค้างชำระสะสมนานเกินไปก่อนที่จะตัดสินใจระงับบริการ",
          "กฎนี้ใช้เฉพาะลูกค้าที่มีใบแจ้งหนี้ค้างชำระจริงเท่านั้น ไม่ใช้กับลูกค้าที่เคยมีประวัติ dunning ในอดีตแต่ปัจจุบันชำระตรงเวลาปกติแล้ว",
        ],
      },
    },
    {
      slug: "plan-change-cooldown-policy",
      title: "นโยบายระยะเวลารอระหว่างการเปลี่ยนแพลน",
      tags: ["plan", "policy"],
      isPrimary: false,
      intro: [
        "หลังเปลี่ยนแพลนสำเร็จ ลูกค้าต้องรออย่างน้อย `PLAN_CHANGE_COOLDOWN_HOURS` ชั่วโมงก่อนเปลี่ยนแพลนอีกครั้ง เพื่อป้องกันการสลับแพลนถี่เกินไปที่ทำให้การคำนวณ proration ซับซ้อนและสร้างความสับสนในใบแจ้งหนี้",
        "การยกเลิกคำขอ downgrade ที่ยังไม่มีผล ไม่นับเป็นการเปลี่ยนแพลนที่ต้องรอ cooldown เพราะไม่ได้เปลี่ยนแพลนจริง แค่ยกเลิกคำขอที่รออยู่",
      ],
    },
    {
      slug: "invoice-void-authorization-policy",
      title: "นโยบายการอนุมัติยกเลิกใบแจ้งหนี้",
      tags: ["invoice", "policy"],
      isPrimary: false,
      intro: [
        "การยกเลิกใบแจ้งหนี้ (`voidInvoice`) ทำได้เฉพาะใบแจ้งหนี้ที่ยังไม่ถูกชำระเท่านั้น ใบแจ้งหนี้ที่ชำระแล้วต้องดำเนินการผ่านกระบวนการคืนเงินแยกต่างหาก ไม่ใช้การ void",
        "การ void ทุกครั้งต้องระบุเหตุผลและถูกบันทึกไว้สำหรับการตรวจสอบทางบัญชี ไม่มีการลบใบแจ้งหนี้ออกจากระบบแม้จะถูก void ไปแล้ว",
      ],
    },
    {
      slug: "usage-record-correction-policy",
      title: "นโยบายการแก้ไขข้อมูลการใช้งานย้อนหลัง",
      tags: ["usage", "policy"],
      isPrimary: false,
      intro: [
        "ข้อมูลการใช้งานที่บันทึกผิดพลาดสามารถแก้ไขย้อนหลังได้ภายใน 30 วันหลังบันทึก ผ่านขั้นตอนพิเศษที่ต้องมีการอนุมัติจากทีม billing เสมอ ไม่ใช่แก้ไขตรงผ่าน API ปกติ",
        "การแก้ไขย้อนหลังที่กระทบใบแจ้งหนี้ที่ออกไปแล้วจะสร้างใบแจ้งหนี้ปรับปรุง (credit note หรือ additional invoice) แยกต่างหาก ไม่แก้ไขใบแจ้งหนี้เดิมที่ออกไปแล้วโดยตรง",
      ],
    },
    {
      slug: "dunning-communication-policy",
      title: "นโยบายการสื่อสารระหว่างกระบวนการ Dunning",
      tags: ["dunning", "policy"],
      isPrimary: false,
      intro: [
        "ลูกค้าต้องได้รับอีเมลแจ้งเตือนทุกครั้งที่การชำระเงินล้มเหลวและก่อนการ retry แต่ละรอบ เพื่อให้มีโอกาสอัปเดตวิธีชำระเงินก่อนที่จะถึงรอบ retry ถัดไป",
        "อีเมลแจ้งเตือนรอบสุดท้ายก่อนระงับบริการต้องระบุวันที่จะถูกระงับชัดเจน และช่องทางติดต่อทีมสนับสนุนถ้าลูกค้าต้องการความช่วยเหลือเพิ่มเติมก่อนถึงกำหนด",
      ],
    },
    {
      slug: "plan-catalog-price-change-notice-policy",
      title: "นโยบายการแจ้งล่วงหน้าเมื่อเปลี่ยนราคาแพลน",
      tags: ["plan", "policy"],
      isPrimary: false,
      intro: [
        "การปรับราคาแพลนที่มีผลต่อลูกค้าปัจจุบันต้องแจ้งล่วงหน้าอย่างน้อย 30 วันก่อนมีผลจริง ผ่านอีเมลและการแจ้งเตือนใน dashboard เพื่อให้ลูกค้ามีเวลาตัดสินใจว่าจะยอมรับราคาใหม่หรือเปลี่ยนแพลน",
        "ลูกค้าที่สมัครสมาชิกใหม่หลังประกาศราคาใหม่แล้วจะใช้ราคาใหม่ทันทีโดยไม่ต้องรอครบ 30 วัน กฎการแจ้งล่วงหน้าใช้เฉพาะลูกค้าปัจจุบันที่ใช้ราคาเดิมอยู่แล้วเท่านั้น",
      ],
    },
  ],
  incidents: [
    {
      slug: "proration-calculated-wrong-timezone-change",
      title: "คำนวณ Proration ผิดหลังเปลี่ยน Timezone ของบัญชี",
      tags: ["proration", "bug"],
      summary:
        "ลูกค้าที่เปลี่ยน timezone ของบัญชีจากเอเชียไปอเมริกาพบว่ายอด proration ที่คำนวณได้ตอนเปลี่ยนแพลนถัดมาผิดไปจากที่ควรจะเป็นประมาณ 1 วัน",
      investigation:
        "ตรวจ `calculateProration` ใน {{ref:module:proration-calculator}} พบว่าการคำนวณสัดส่วนวันที่เหลือในรอบบิลอ้างอิง timezone ของ server (UTC) แทนที่จะใช้ timezone ของบัญชีที่บันทึกไว้ ทำให้จำนวนวันที่คำนวณได้คลาดเคลื่อนหลังลูกค้าเปลี่ยน timezone",
      cause:
        "ฟังก์ชันคำนวณสัดส่วนวันไม่ได้ดึง timezone ปัจจุบันของบัญชีมาใช้ แต่ hardcode ใช้ UTC เป็นฐานการคำนวณเสมอ",
      resolution:
        "คำนวณ proration ใหม่ให้ลูกค้าที่ได้รับผลกระทบ ออก credit note ปรับยอดให้ถูกต้อง",
      followup:
        "แก้ `calculateProration` ให้ดึง timezone ปัจจุบันของบัญชีมาใช้ในการคำนวณสัดส่วนวันเสมอ ไม่ hardcode UTC",
    },
    {
      slug: "dunning-email-sent-cancelled-account",
      title: "ส่งอีเมล Dunning ให้บัญชีที่ยกเลิกไปแล้ว",
      tags: ["dunning", "bug"],
      summary:
        "ลูกค้าที่ยกเลิก subscription ไปแล้วหลายสัปดาห์ยังคงได้รับอีเมลแจ้งเตือนการชำระเงินล้มเหลวจากกระบวนการ dunning ต่อเนื่อง",
      investigation:
        "ตรวจ {{ref:module:dunning-engine}} พบว่า `startDunningProcess` เริ่มกระบวนการก่อนที่ลูกค้าจะยกเลิก แต่การยกเลิก subscription ไม่ได้ trigger การหยุดกระบวนการ dunning ที่กำลังดำเนินอยู่",
      cause:
        "{{ref:module:plan-manager}} ไม่ publish event แจ้ง dunning-engine เมื่อ subscription ถูกยกเลิกระหว่างที่มีกระบวนการ dunning ค้างอยู่ ทำให้ dunning-engine ไม่รู้ว่าต้องหยุด",
      resolution:
        "หยุดกระบวนการ dunning ของบัญชีที่ยกเลิกไปแล้วด้วยมือ ขอโทษลูกค้าที่ได้รับอีเมลผิดพลาด",
      followup:
        "เพิ่ม event `subscription.cancelled` ให้ {{ref:module:dunning-engine}} subscribe เพื่อหยุดกระบวนการ dunning ทันทีเมื่อ subscription ถูกยกเลิก ไม่ว่าจะอยู่ retry รอบไหนก็ตาม",
    },
    {
      slug: "trial-extended-past-maximum-allowed",
      title: "ขยายเวลาทดลองใช้เกินเพดานสูงสุดที่กำหนด",
      tags: ["trial", "bug"],
      summary:
        "บัญชีทดลองใช้รายหนึ่งมีระยะเวลารวมเกิน 30 วันตามเพดานสูงสุด เพราะทีมขายขยายเวลาหลายครั้งติดต่อกันโดยไม่มีระบบเตือนว่าใกล้ถึงเพดานแล้ว",
      investigation:
        "ตรวจ `extendTrial` ใน {{ref:module:trial-controller}} พบว่าฟังก์ชันนี้ไม่มีการตรวจสอบผลรวมระยะเวลาทดลองใช้สะสมก่อนอนุญาตให้ขยายเพิ่ม อนุญาตให้ขยายได้เสมอถ้าทีมขายร้องขอ",
      cause:
        "การตรวจสอบเพดาน 30 วันไม่ได้ implement ไว้ในฟังก์ชันจริง มีแค่ระบุไว้ในเอกสารนโยบายแต่ไม่มีการบังคับใช้ในโค้ด",
      resolution:
        "ปรับระยะเวลา trial ของบัญชีที่ได้รับผลกระทบให้ตรงตามเพดาน แจ้งทีมขายเกี่ยวกับข้อจำกัด",
      followup:
        "เพิ่มการตรวจสอบผลรวมระยะเวลาทดลองใช้สะสมใน `extendTrial` ปฏิเสธการขยายถ้าเกินเพดาน `30` วัน ยกเว้นกรณี trial แบบพิเศษสำหรับลูกค้าองค์กรตามที่ระบุใน edge case ของนโยบาย",
    },
    {
      slug: "usage-meter-counter-reset-bug",
      title: "ตัวนับการใช้งานรีเซ็ตผิดเวลาทำยอดคำนวณผิด",
      tags: ["usage", "bug"],
      summary:
        "ลูกค้าที่ใช้แพลน usage-based พบว่ายอดการใช้งานในใบแจ้งหนี้ต่ำกว่าที่ใช้จริงมาก เพราะตัวนับการใช้งานรีเซ็ตกลางรอบบิลโดยไม่ทราบสาเหตุ",
      investigation:
        "ตรวจ {{ref:module:usage-meter}} พบว่า `getUsageTotal` คำนวณจากช่วงเวลาที่ระบุ แต่ scheduled job ที่ทำความสะอาดข้อมูลเก่ามีบั๊กที่ลบข้อมูล usage record ของรอบบิลปัจจุบันไปด้วยเพราะเงื่อนไขการคำนวณวันที่ผิดพลาด",
      cause:
        "เงื่อนไขการลบข้อมูลเก่าคำนวณจากวันที่ปัจจุบันลบด้วยจำนวนเดือนที่กำหนด แต่มีบั๊กด้าน off-by-one ทำให้ในบางเดือนลบข้อมูลของรอบบิลปัจจุบันไปด้วยแทนที่จะลบแค่ข้อมูลเก่าจริง",
      resolution:
        "กู้คืนข้อมูล usage record จาก backup แก้ไขใบแจ้งหนี้ที่ออกไปแล้วด้วยยอดที่ถูกต้อง",
      followup:
        "แก้เงื่อนไขการลบข้อมูลเก่าให้คำนวณวันที่ถูกต้อง เพิ่ม test ยืนยันว่า job ทำความสะอาดข้อมูลไม่แตะข้อมูลของรอบบิลปัจจุบันไม่ว่ากรณีใด",
    },
    {
      slug: "invoice-generated-wrong-plan-price",
      title: "ใบแจ้งหนี้ออกด้วยราคาแพลนที่ไม่ตรงกับปัจจุบัน",
      tags: ["invoice", "bug"],
      summary:
        "ใบแจ้งหนี้ของลูกค้ากลุ่มหนึ่งแสดงราคาแพลนที่ต่ำกว่าราคาปัจจุบันของแพลนนั้น เพราะระบบใช้ราคาเก่าที่ถูกปรับไปแล้ว",
      investigation:
        "ตรวจ {{ref:module:invoice-generator}} พบว่า `generateInvoice` cache ราคาแพลนไว้ตอนเริ่ม subscription และไม่เคย refresh แม้ทีมกำหนดราคาจะปรับราคาแพลนนั้นในภายหลัง",
      cause:
        "การ cache ราคาแพลนออกแบบมาเพื่อความเร็ว แต่ไม่มีกลไก invalidate cache เมื่อราคาแพลนถูกปรับใน `plan_catalog` ทำให้ราคาที่ cache ไว้ไม่ตรงกับราคาจริงในระบบ",
      resolution:
        "ออกใบแจ้งหนี้ปรับปรุงให้ลูกค้าที่ได้รับผลกระทบตามราคาที่ถูกต้อง",
      followup:
        "เปลี่ยนให้ `generateInvoice` ดึงราคาแพลนล่าสุดจาก `plan_catalog` ทุกครั้งที่สร้างใบแจ้งหนี้ ไม่ cache ราคาไว้ล่วงหน้าที่อาจไม่ sync กับการเปลี่ยนแปลงราคา",
    },
    {
      slug: "downgrade-processed-immediately-not-end-of-period",
      title: "Downgrade มีผลทันทีแทนที่จะรอสิ้นสุดรอบบิล",
      tags: ["plan", "bug"],
      summary:
        "ลูกค้าหลายรายที่ขอ downgrade แพลนพบว่าฟีเจอร์ของแพลนเดิมถูกปิดใช้งานทันที ทั้งที่ตาม {{ref:policy:downgrade-effective-date-policy}} ควรมีผลเมื่อสิ้นสุดรอบบิลเท่านั้น",
      investigation:
        "ตรวจ `changePlan` ใน {{ref:module:plan-manager}} พบว่า deploy ใหม่ที่เพิ่ม feature 'เปลี่ยนแพลนด่วน' (สำหรับกรณี compliance) มี default parameter ผิดพลาดที่ทำให้ทุกการ downgrade ถูกประมวลผลแบบทันทีโดยไม่ตั้งใจ แทนที่จะเป็น default แบบรอสิ้นสุดรอบบิล",
      cause:
        "การเพิ่ม feature ใหม่เปลี่ยน default behavior ของฟังก์ชันเดิมโดยไม่ได้ตรวจสอบ regression กับ flow ปกติที่ใช้งานอยู่แล้ว",
      resolution:
        "คืนสิทธิ์การใช้ฟีเจอร์แพลนเดิมให้ลูกค้าที่ได้รับผลกระทบจนกว่าจะสิ้นสุดรอบบิลจริงตามนโยบาย แก้ default parameter ให้ถูกต้อง",
      followup:
        "เพิ่ม regression test ครอบคลุม flow downgrade ปกติก่อน merge feature ใหม่ใดๆ ที่แตะฟังก์ชัน `changePlan` เพื่อป้องกัน default behavior เปลี่ยนโดยไม่ตั้งใจอีก",
    },
    {
      slug: "proration-double-charged-retry",
      title: "เรียกเก็บ Proration ซ้ำสองครั้งจาก Retry ของ Frontend",
      tags: ["proration", "bug"],
      summary:
        "ลูกค้ารายหนึ่งถูกเรียกเก็บค่า proration จากการอัปเกรดแพลนสองครั้งซ้อนกัน ทั้งที่อัปเกรดแค่ครั้งเดียว",
      investigation:
        "ตรวจ `changePlan` ใน {{ref:module:plan-manager}} พบว่า frontend retry request เพราะไม่ได้ response ภายในเวลาที่กำหนด โดยไม่ส่ง idempotency key มาด้วย ทำให้ backend สร้างการเปลี่ยนแพลนและคำนวณ proration ซ้ำสองรอบ",
      cause:
        "ฟังก์ชัน `changePlan` ไม่มีกลไก idempotency ใดๆ ทุกครั้งที่เรียกจะประมวลผลเป็นการเปลี่ยนแพลนใหม่เสมอไม่ว่าจะเป็นการเรียกซ้ำหรือไม่ — เหมือนกับปัญหาที่เคยพบใน service อื่นของระบบภายนอกที่มีลักษณะคล้ายกัน",
      resolution:
        "คืนเงินส่วนที่เรียกเก็บซ้ำให้ลูกค้าทันที แล้ว deploy hotfix เพิ่ม idempotency key ให้ `changePlan`",
      followup:
        "ตรวจสอบฟังก์ชันอื่นที่มีผลกระทบทางการเงินในระบบทั้งหมดว่ามีความเสี่ยงขาด idempotency แบบเดียวกันหรือไม่ ไม่ใช่แก้เฉพาะจุดที่เจอปัญหา",
    },
    {
      slug: "usage-threshold-alert-not-triggered",
      title: "ไม่มีการแจ้งเตือนเมื่อการใช้งานใกล้ถึงโควตา",
      tags: ["usage", "bug"],
      summary:
        "ลูกค้ารายหนึ่งใช้งานเกินโควตาไปมากแล้วเจอยอดเรียกเก็บส่วนเกินก้อนใหญ่ในใบแจ้งหนี้ โดยไม่เคยได้รับการแจ้งเตือนล่วงหน้าตามที่ควรจะเป็นเมื่อถึง `USAGE_THRESHOLD_ALERT_PERCENT`",
      investigation:
        "ตรวจ {{ref:module:usage-meter}} พบว่า `checkOverageThreshold` ถูกเรียกเป็น batch job รายวัน ไม่ใช่ real-time ทุกครั้งที่มีการบันทึกการใช้งาน ทำให้ในกรณีที่การใช้งานพุ่งสูงอย่างรวดเร็วภายในวันเดียว การแจ้งเตือนมาช้าเกินไปหรือข้ามช่วงที่ควรแจ้งไปเลย",
      cause:
        "การตรวจสอบ threshold แบบ batch รายวันไม่เหมาะกับ pattern การใช้งานที่พุ่งสูงเร็ว เพราะระหว่างสองรอบ batch อาจข้ามจากต่ำกว่า threshold ไปเกินโควตาไปแล้วโดยไม่มีจุดแจ้งเตือนตรงกลาง",
      resolution:
        "แจ้งลูกค้าที่ได้รับผลกระทบด้วยมือ พิจารณาลดยอดเรียกเก็บส่วนเกินบางส่วนเป็นกรณีพิเศษเนื่องจากความผิดพลาดของระบบแจ้งเตือน",
      followup:
        "เปลี่ยน `checkOverageThreshold` ให้ตรวจสอบแบบ real-time ทุกครั้งที่ `recordUsage` ถูกเรียก แทนการรอ batch job รายวัน อย่างน้อยสำหรับลูกค้าที่มี pattern การใช้งานผันผวนสูง",
    },
    {
      slug: "dunning-retry-race-condition-double-charge",
      title: "Retry การเรียกเก็บเงินซ้อนกันทำเรียกเก็บเงินซ้ำ",
      tags: ["dunning", "race-condition"],
      summary:
        "ลูกค้ารายหนึ่งถูกเรียกเก็บเงินสำเร็จสองครั้งสำหรับใบแจ้งหนี้เดียวกันระหว่างกระบวนการ dunning",
      investigation:
        "ตรวจ `retryPayment` ใน {{ref:module:dunning-engine}} พบว่า scheduled job ที่ trigger retry รันซ้อนกันสอง instance ช่วง deploy ใหม่ ทำให้ทั้งสอง instance เรียก `retryPayment` สำหรับ dunningId เดียวกันพร้อมกันและทั้งคู่สำเร็จ",
      cause:
        "ไม่มี distributed lock กันการเรียก `retryPayment` ซ้อนกันสำหรับ dunningId เดียวกัน — ปัญหาลักษณะเดียวกับที่เคยพบใน background job อื่นของระบบที่มี pattern คล้ายกัน",
      resolution:
        "คืนเงินส่วนที่เรียกเก็บซ้ำให้ลูกค้าทันที เพิ่ม distributed lock ให้ retry job",
      followup:
        "ตรวจสอบ scheduled job อื่นทั้งหมดในระบบที่มีผลกระทบทางการเงินว่ามี lock กันการรันซ้อนครบทุกตัวหรือไม่ ไม่ใช่แก้เฉพาะจุดที่เจอปัญหา",
    },
    {
      slug: "invoice-due-date-not-extended-after-late-generation",
      title: "วันครบกำหนดชำระไม่ขยับตามที่ควรเมื่อใบแจ้งหนี้ออกช้า",
      tags: ["invoice", "bug"],
      summary:
        "ใบแจ้งหนี้ที่ออกช้ากว่ากำหนดปกติเพราะปัญหาระบบ ยังคงมีวันครบกำหนดชำระเท่ากับที่ควรจะเป็นถ้าออกตรงเวลา ทำให้ลูกค้ามีเวลาชำระน้อยกว่าที่ควร",
      investigation:
        "ตรวจ `getInvoiceDueDate` ใน {{ref:module:invoice-generator}} พบว่าฟังก์ชันนี้คำนวณจากวันที่ตามตารางเวลาปกติที่ควรจะออก ไม่ใช่วันที่สร้างใบแจ้งหนี้จริง ขัดกับ {{ref:policy:invoice-due-date-calculation-policy}} ที่ระบุว่าต้องคำนวณจากวันที่สร้างจริง",
      cause:
        "การ implement ฟังก์ชันไม่ตรงกับที่ระบุในนโยบาย เป็นช่องว่างระหว่างเอกสารนโยบายกับโค้ดจริงที่ใช้งาน",
      resolution:
        "ขยายวันครบกำหนดชำระให้ลูกค้าที่ได้รับผลกระทบตามจำนวนวันที่ใบแจ้งหนี้ออกช้า",
      followup:
        "แก้ `getInvoiceDueDate` ให้คำนวณจากวันที่สร้างใบแจ้งหนี้จริงตามที่ระบุในนโยบาย เพิ่ม test ยืนยันว่าโค้ดตรงกับนโยบายที่เขียนไว้ทุกข้อ",
    },
    {
      slug: "trial-conversion-charged-wrong-amount",
      title: "แปลง Trial เป็น Subscription เรียกเก็บเงินผิดจำนวน",
      tags: ["trial", "bug"],
      summary:
        "ลูกค้าที่แปลง trial เป็น subscription จ่ายเงินพบว่ายอดที่เรียกเก็บครั้งแรกไม่ตรงกับราคาแพลนที่เลือกไว้ตอนสมัคร trial",
      investigation:
        "ตรวจ `convertToSubscription` ใน {{ref:module:trial-controller}} พบว่าฟังก์ชันนี้ดึงราคาแพลนปัจจุบัน ณ เวลาที่แปลง ไม่ใช่ราคาที่ล็อกไว้ตอนเริ่ม trial ทำให้ถ้าราคาแพลนถูกปรับระหว่างช่วง trial ลูกค้าจะถูกเรียกเก็บราคาใหม่ที่ไม่ตรงกับที่เห็นตอนสมัคร",
      cause:
        "ไม่มีการล็อกราคาแพลน ณ เวลาที่เริ่ม trial ไว้ ทำให้ราคาที่ใช้ตอนแปลงขึ้นอยู่กับราคาปัจจุบันของแพลนที่อาจเปลี่ยนไปแล้ว",
      resolution:
        "ปรับยอดเรียกเก็บให้ตรงกับราคาที่ลูกค้าเห็นตอนสมัคร trial คืนส่วนต่างถ้าเรียกเก็บเกิน",
      followup:
        "เพิ่มการล็อกราคาแพลน ณ เวลาที่เริ่ม trial ให้ `convertToSubscription` ใช้ราคาที่ล็อกไว้เสมอ ไม่ดึงราคาปัจจุบันที่อาจเปลี่ยนไปแล้วระหว่างช่วง trial",
    },
    {
      slug: "plan-catalog-race-condition-price-corruption",
      title: "แก้ไขราคาแพลนพร้อมกันทำ Plan Catalog เสียหาย",
      tags: ["plan", "race-condition"],
      summary:
        "ทีมกำหนดราคาสองคนแก้ไขราคาแพลนเดียวกันพร้อมกันในเวลาไล่เลี่ยกันมาก ทำให้ราคาที่บันทึกสุดท้ายผสมกันระหว่างการแก้ไขของทั้งสองคนอย่างไม่ตั้งใจ",
      investigation:
        "ตรวจ `plan_catalog` พบว่าฟังก์ชันอัปเดตราคาแพลนอ่านข้อมูลราคาปัจจุบันมาแก้ไขแล้วเขียนทับทั้งชุด ไม่ได้ตรวจสอบว่ามีการแก้ไขอื่นเกิดขึ้นระหว่างนั้นหรือไม่ — pattern เดียวกับที่เคยเป็นปัญหาในระบบอื่นที่มีการแก้ไขข้อมูลพร้อมกันได้",
      cause:
        "ไม่มี optimistic locking หรือ version check ก่อนเขียนทับราคาแพลน ทำให้การแก้ไขพร้อมกันจากสองคนทับกันได้",
      resolution:
        "กู้คืนราคาแพลนที่ถูกต้องจาก audit log ให้ทีมกำหนดราคายืนยันราคาที่ถูกต้องอีกครั้ง",
      followup:
        "เพิ่ม optimistic locking ให้การอัปเดตราคาแพลนตรวจสอบ version ปัจจุบันก่อนเขียนทับเสมอ ปฏิเสธการอัปเดตถ้า version ไม่ตรงกับที่คาดไว้",
    },
    {
      slug: "usage-meter-timezone-boundary-double-count",
      title: "การใช้งานใกล้รอยต่อเที่ยงคืนถูกนับซ้ำสองรอบบิล",
      tags: ["usage", "bug"],
      summary:
        "ลูกค้าที่ใช้งานใกล้เที่ยงคืนตามเวลาท้องถิ่นพบว่าการใช้งานบางรายการถูกนับเข้าทั้งรอบบิลปัจจุบันและรอบบิลถัดไป ทำให้ยอดรวมสูงกว่าความเป็นจริง",
      investigation:
        "ตรวจ {{ref:module:usage-meter}} พบว่า `getUsageTotal` ใช้ boundary ของรอบบิลที่อ้างอิง UTC แต่การบันทึก `recordUsage` บาง client ส่ง timestamp ตาม local time ของผู้ใช้ ทำให้การจัดกลุ่มเข้ารอบบิลคลาดเคลื่อนใกล้รอยต่อเที่ยงคืน",
      cause:
        "ไม่มีการบังคับให้ทุก client แปลง timestamp เป็น UTC ก่อนส่งเข้า `recordUsage` ทำให้ข้อมูลที่เก็บมีทั้งรูปแบบ UTC และ local time ปนกัน",
      resolution:
        "ปรับยอดการใช้งานที่นับซ้ำให้ถูกต้อง ออก credit note ให้ลูกค้าที่ได้รับผลกระทบ",
      followup:
        "บังคับให้ทุก client แปลง timestamp เป็น UTC ก่อนส่งเข้า `recordUsage` เสมอ ปฏิเสธ payload ที่ไม่มี timezone กำกับชัดเจนแทนการเดาหรือใช้ local time ของ server",
    },
    {
      slug: "invoice-void-authorization-bypassed",
      title: "ยกเลิกใบแจ้งหนี้ที่ชำระแล้วโดยไม่ผ่านขั้นตอนคืนเงินที่ถูกต้อง",
      tags: ["invoice", "compliance"],
      summary:
        "ทีมบัญชีตรวจพบใบแจ้งหนี้ที่ชำระเงินสำเร็จแล้วถูก void ไปโดยตรง แทนที่จะผ่านกระบวนการคืนเงินตามที่ {{ref:policy:invoice-void-authorization-policy}} กำหนดไว้ ทำให้บัญชีทางการเงินไม่ตรงกับยอดเงินที่เข้าจริง",
      investigation:
        "ตรวจ `voidInvoice` ใน {{ref:module:invoice-generator}} พบว่าฟังก์ชันนี้ไม่ตรวจสอบสถานะการชำระเงินของใบแจ้งหนี้ก่อนอนุญาตให้ void อนุญาตให้ void ได้ไม่ว่าใบแจ้งหนี้จะชำระแล้วหรือไม่",
      cause:
        "การตรวจสอบสถานะการชำระเงินก่อน void ไม่ได้ implement ไว้ในโค้ดจริง มีแค่ระบุไว้ในเอกสารนโยบายว่าห้าม void ใบแจ้งหนี้ที่ชำระแล้ว แต่ไม่มีการบังคับใช้",
      resolution:
        "กู้คืนใบแจ้งหนี้ที่ถูก void ผิดพลาด ดำเนินการคืนเงินผ่านกระบวนการที่ถูกต้องแทน ประสานงานกับทีมบัญชีปรับยอดให้ตรงกัน",
      followup:
        "เพิ่มการตรวจสอบสถานะการชำระเงินใน `voidInvoice` ปฏิเสธการ void ถ้าใบแจ้งหนี้ชำระแล้ว บังคับให้ใช้กระบวนการคืนเงินแทนตามที่ระบุในนโยบายแต่ยังไม่ได้บังคับใช้จริงในโค้ดตอนเกิดเหตุ",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/RECUR-318-idempotent-plan-change`, `fix/RECUR-329-dunning-lock`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(plan-manager): เพิ่ม idempotency key กันเปลี่ยนแพลนซ้ำ`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่มีผลกระทบทางการเงิน (proration, dunning retry, invoice) ต้องมี test ครอบคลุมกรณี idempotency และ concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:proration-double-charged-retry}} และ {{ref:incident:dunning-retry-race-condition-double-charge}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `calculateProration`, `retryPayment` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`subscriptionId` รูปแบบ `sub_<ULID>`, `invoiceId` รูปแบบ `inv_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับการเปลี่ยนแพลน เรียกเก็บเงิน หรือสร้างใบแจ้งหนี้ต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ห้าม log ข้อมูลบัตรเครดิต", body: "ห้าม log หมายเลขบัตรเครดิตหรือข้อมูลชำระเงินดิบลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ payment method token เท่านั้น" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`RECUR_<DOMAIN>_<REASON>` เช่น `RECUR_PLAN_CHANGE_COOLDOWN`, `RECUR_DUNNING_MAX_RETRY_REACHED` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`RECUR_PRORATION_BELOW_MINIMUM`, `RECUR_TRIAL_EXTENSION_CAPPED`, `RECUR_USAGE_QUOTA_EXCEEDED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Idempotency test", body: "ฟังก์ชันที่มีผลกระทบทางการเงินต้องมี test ยืนยันว่าเรียกซ้ำแล้วไม่เรียกเก็บเงินซ้ำเสมอ — บทเรียนจาก {{ref:incident:proration-double-charged-retry}}" },
        { heading: "Timezone test", body: "ฟังก์ชันที่คำนวณวันที่หรือรอบบิลต้องมี test เทียบข้าม timezone เสมอ — บทเรียนจาก {{ref:incident:proration-calculated-wrong-timezone-change}} และ {{ref:incident:usage-meter-timezone-boundary-double-count}}" },
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
      slug: "financial-mutation-convention",
      title: "Financial Mutation Convention",
      tags: ["reliability", "billing"],
      intro: "เอกสารนี้กำหนดวิธีจัดการฟังก์ชันที่มีผลกระทบทางการเงินให้สอดคล้องกันทั้งระบบ เพราะข้อผิดพลาดในจุดนี้กระทบความไว้วางใจของลูกค้าโดยตรง",
      sections: [
        { heading: "หลักการทั่วไป", body: "ทุกฟังก์ชันที่เรียกเก็บเงินหรือคำนวณยอดที่มีผลต่อใบแจ้งหนี้ต้องมี idempotency key เสมอ ไม่พึ่งพาว่า client จะไม่ retry ซ้ำ — บทเรียนจากทั้ง {{ref:incident:proration-double-charged-retry}} และ {{ref:incident:dunning-retry-race-condition-double-charge}} ที่เกิดปัญหาแบบเดียวกันในสองจุดต่างกัน" },
        { heading: "การแก้ไขย้อนหลัง", body: "ห้ามแก้ไขยอดในใบแจ้งหนี้ที่ออกไปแล้วโดยตรง ต้องสร้างเอกสารปรับปรุง (credit note หรือ additional invoice) แยกต่างหากเสมอ เพื่อรักษา audit trail ที่ตรวจสอบย้อนหลังได้ครบถ้วน" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → idempotency test (ครอบคลุมทุกฟังก์ชันที่มีผลกระทบทางการเงิน) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:proration-calculator}} และ {{ref:module:dunning-engine}} ต้องผ่าน idempotency test 100% ก่อน merge เสมอ เพราะความผิดพลาดกระทบยอดเงินที่เรียกเก็บจากลูกค้าจริง" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → plan-manager | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| invoice-generator → database pool acquire | 3s | `pg-pool` config |\n| dunning-engine → payment processor webhook | 10s | env `PAYMENT_PROCESSOR_TIMEOUT_MS` |" },
        { heading: "เหตุผลที่ payment processor timeout นานกว่าปกติ", body: "payment processor ภายนอกบางครั้งใช้เวลานานกว่าปกติเมื่อต้องยืนยันตัวตนเพิ่มเติม (3D Secure) — timeout สั้นเกินไปจะทำให้การเรียกเก็บเงินที่กำลังดำเนินอยู่จริงถูกตัดจบกลางคันโดยไม่จำเป็น" },
      ],
    },
    {
      slug: "billing-migration-runbook",
      title: "Billing Data Migration Runbook",
      tags: ["migration", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ migrate ข้อมูล subscription หรือ invoice เมื่อเปลี่ยนโครงสร้างฐานข้อมูลหรือรวมระบบจากการซื้อกิจการ",
      sections: [
        { heading: "ก่อน migrate", body: "ต้อง freeze การสร้างใบแจ้งหนี้และการเรียกเก็บเงินช่วงสั้นๆ ก่อน cutover เสมอ ไม่ migrate ข้อมูลที่ยัง active เขียนอยู่ — บทเรียนจากระบบอื่นที่เคยเจอปัญหาข้อมูลการเงินไม่สอดคล้องจากการไม่ freeze ก่อน cutover" },
        { heading: "หลัง migrate", body: "ต้องยืนยันยอดรวมของ subscription และ invoice ที่ migrate ครบตรงกับต้นทาง 100% ก่อนปิดระบบเดิม พร้อมสุ่มตรวจยอดเงินจริงเทียบกับต้นฉบับ" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = เรียกเก็บเงินลูกค้าผิดพลาดในวงกว้างหรือซ้ำ, Sev2 = กระทบการคำนวณ proration หรือ dunning บางส่วน, Sev3 = กระทบเล็กน้อยไม่ถึงยอดเงินที่เรียกเก็บจริง" },
        { heading: "กรณีที่เกี่ยวกับการเงิน", body: "ทุกเหตุการณ์ที่เกี่ยวข้องกับการเรียกเก็บเงินผิดพลาด (ซ้ำ, ผิดจำนวน) ต้องยกระดับเป็น Sev1 เสมอและแจ้งทีมการเงินทันที เขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "dunning retry job ล้มเหลวหรือรันซ้อน, invoice generation ล้มเหลวเกิน threshold ต่อวัน, proration calculation ที่ให้ผลลัพธ์ผิดปกติ (เช่น ค่าติดลบเกินขอบเขต)" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้เรียกเก็บเงินผิดพลาดหรือ downgrade มีผลผิดเวลา ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:downgrade-processed-immediately-not-end-of-period}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมการเงินทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| usage-meter | 4 | 16 | ingest queue depth > 800 |\n| invoice-generator | 2 | 8 | latency p95 > 200ms |\n| dunning-engine | 2 | 6 | retry queue depth > 300 |" },
        { heading: "ข้อจำกัดที่ต้องระวัง", body: "invoice-generator ต้อง scale ล่วงหน้าก่อนวันสร้างใบแจ้งหนี้ประจำเดือนที่คาดเดาได้ (ต้นเดือน) ไม่รอ autoscale ตอบสนองแบบ reactive เพราะปริมาณใบแจ้งหนี้พุ่งสูงพร้อมกันตามรอบบิลของลูกค้าจำนวนมาก" },
      ],
    },
    {
      slug: "payment-processor-failover-runbook",
      title: "Payment Processor Failover Runbook",
      tags: ["dunning", "runbook"],
      intro: "ขั้นตอนเมื่อ payment processor ภายนอกล่มหรือตอบสนองช้าผิดปกติ ต้องมีแผนสำรองเพราะกระทบกระบวนการ dunning และการเรียกเก็บเงินโดยตรง",
      sections: [
        { heading: "การตรวจจับ", body: "monitor response time และ error rate ของ {{ref:module:dunning-engine}} ต่อ payment processor ภายนอก ถ้า error rate เกิน 15% ใน 5 นาที ให้ยกระดับเป็น Sev2 ทันที" },
        { heading: "แผนสำรอง", body: "การ retry ที่กำลังดำเนินอยู่จะถูก queue ไว้รอ ไม่ยกเลิกทิ้งอัตโนมัติ เพื่อไม่ให้ลูกค้าถูกระงับบริการเร็วเกินจริงเพียงเพราะ payment processor มีปัญหาชั่วคราว ไม่ใช่เพราะลูกค้าไม่ชำระเงินจริง" },
      ],
    },
  ],
};
