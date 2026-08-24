import type { DomainProfile } from "../types.js";

// WareBot — ระบบหุ่นยนต์คลังสินค้า (warehouse automation / robotic picking)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const warehouseRobotics: DomainProfile = {
  id: "warehouse-robotics",
  displayName: "WareBot — ระบบหุ่นยนต์คลังสินค้า",
  summary: [
    "WareBot คือแพลตฟอร์มควบคุมหุ่นยนต์หยิบสินค้า (picking robot) ในคลังสินค้าขนาดใหญ่ ทำงานร่วมกับ Warehouse Management System (WMS) เดิมของลูกค้าแต่ละราย โดย WareBot รับผิดชอบเฉพาะชั้น \"การเคลื่อนที่และหยิบจริง\" ส่วน WMS ยังคงเป็นเจ้าของข้อมูล order/inventory ระดับธุรกิจ",
    "ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่ตัดสินใจว่าหุ่นยนต์ตัวไหนควรหยิบชิ้นไหน ไปจนถึงจัดคิวชาร์จแบตเตอรี่และเฝ้าระวังโซนความปลอดภัยที่มีคนทำงานร่วมกับหุ่นยนต์ ทีมวิศวกรรมเรียกช่วงเวลา 10:00-14:00 ว่า peak window เพราะเป็นช่วงที่ order จากอีคอมเมิร์ซไหลเข้าคลังหนาแน่นที่สุด",
  ],
  domainTags: ["warehouse-robotics", "warebot"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:fleet-controller}} เป็นเจ้าของสถานะหุ่นยนต์ทั้งหมด (ตำแหน่ง, แบตเตอรี่, สถานะ fault) ส่วน {{ref:module:inventory-sync}} เป็นเจ้าของ mapping ระหว่างตำแหน่ง bin ทางกายภาพกับ SKU เท่านั้น ไม่รู้จักสถานะหุ่นยนต์เลย",
    "{{ref:module:task-scheduler}} เป็น service เดียวที่ query ข้าม service ทั้งสองฝั่งเพื่อสร้าง task — เหตุผลที่ยอมให้ service นี้ทำ cross-domain query (ผิดหลักทั่วไป) คือ task assignment ต้องเห็นทั้งสถานะหุ่นยนต์และสถานะสินค้าพร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิด race condition ระหว่างสอง service แยกกันเรียก",
  ],
  apiGatewayNote: [
    "คำสั่งจาก WMS ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง order line เป็น pick task แล้วส่งต่อให้ {{ref:module:task-scheduler}} คำขอที่ต้องการผลลัพธ์ทันที เช่น เช็คสถานะ task ปัจจุบัน ใช้ synchronous call ตรงนี้",
    "คำสั่งควบคุมหุ่นยนต์ระดับ real-time (เช่น emergency stop) ไม่ผ่าน API gateway ตัวนี้ — ไปทาง low-latency channel แยกต่างหากที่ {{ref:module:safety-zone-monitor}} ควบคุมเอง เพราะ latency ของ gateway กลาง (เฉลี่ย 80-150ms) ช้าเกินไปสำหรับคำสั่งหยุดฉุกเฉิน",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:fleet-controller}} ดูแล ได้แก่ `robots` (สถานะปัจจุบันของหุ่นยนต์แต่ละตัว), `robot_fault_log` (ประวัติ fault ทั้งหมด ไม่ลบทิ้งเพื่อวิเคราะห์แนวโน้ม), และ `charging_sessions`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `robots` | fleet-controller | อัปเดตทุก 2 วินาทีจาก heartbeat |\n| `bins` | inventory-sync | mapping ตำแหน่งจริง ↔ SKU |\n| `pick_tasks` | task-scheduler | task queue ทั้ง pending/active/done |\n| `charging_sessions` | charging-station-manager | ประวัติการชาร์จ ใช้คำนวณ battery health |",
    "ทุกตารางใช้ `robot_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `pick.assigned`, `pick.completed`, `pick.failed`, `robot.fault_detected`, `robot.battery_low` — {{ref:module:task-scheduler}} เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อผลลัพธ์ของ task ที่ตัวเองสั่งไป",
    "{{ref:module:charging-station-manager}} subscribe `robot.battery_low` เพื่อดันหุ่นยนต์เข้าคิวชาร์จอัตโนมัติ โดยไม่ต้องรอให้ task-scheduler สั่งงานตรงๆ ออกแบบแบบนี้เพื่อให้การจัดการแบตเตอรี่ไม่ผูกกับ task queue หลัก ถ้า task-scheduler ล่ม หุ่นยนต์ยังเข้าคิวชาร์จเองได้ตามปกติ",
  ],
  modules: [
    {
      slug: "picking-engine",
      name: "picking-engine",
      tags: ["picking", "module", "core"],
      description:
        "รับผิดชอบตัดสินใจ \"หยิบยังไง\" ในระดับการเคลื่อนไหวจริงของแขนหุ่นยนต์ แยกออกมาจาก task-scheduler ตั้งแต่ต้นปี 2025 เพราะ logic การหยิบ (grip force, retry angle, การจัดการสินค้ารูปทรงแปลก) ซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic การจัดคิวงานแล้วทดสอบยาก",
      functions: [
        { sig: "attemptPick(robotId: string, binId: string, sku: string): Promise<PickResult>", desc: "สั่งหยิบจริง 1 ครั้ง คืนผลว่าสำเร็จ/พลาด/ไม่พบสินค้า" },
        { sig: "computeGripProfile(sku: string): GripProfile", desc: "คำนวณแรงบีบและมุมจับตาม product profile ของ SKU นั้น" },
        { sig: "reportPickFailure(taskId: string, reason: PickFailReason): Promise<void>", desc: "แจ้งผลพลาดกลับไปยัง task-scheduler พร้อมเหตุผลที่จัดหมวดไว้แล้ว" },
      ],
      stateFlow: "attempting → succeeded | failed_soft (ลองใหม่ได้) | failed_hard (ต้องคนช่วย) — ดู {{ref:policy:pick-retry-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่ retry เมื่อไหร่ escalate",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:inventory-sync}} โดยตรง — ถ้าหยิบไม่เจอสินค้าในตำแหน่งที่ระบุ จะ report เป็น `not_found` กลับไปที่ {{ref:module:task-scheduler}} แล้วปล่อยให้ task-scheduler เป็นคนตัดสินใจว่าจะ trigger cycle count หรือไม่ เพื่อรักษาหลัก separation of concerns",
      internals: {
        constants: [
          { name: "MAX_PICK_RETRY_ATTEMPTS", value: "2" },
          { name: "GRIP_FORCE_SAFETY_CAP_N", value: "45" },
          { name: "DEFAULT_APPROACH_ANGLE_DEG", value: "30" },
        ],
        typeSnippet:
          "interface PickResult {\n  taskId: string;\n  status: \"succeeded\" | \"failed_soft\" | \"failed_hard\";\n  failReason?: \"not_found\" | \"grip_slip\" | \"obstruction\";\n  attemptCount: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:pick-retry-policy}}",
      },
    },
    {
      slug: "fleet-controller",
      name: "fleet-controller",
      tags: ["fleet", "module", "core"],
      description:
        "เจ้าของสถานะหุ่นยนต์ทุกตัวในคลัง (ตำแหน่ง, แบตเตอรี่, สถานะ fault, สถานะออนไลน์/ออฟไลน์) ทุก service อื่นที่ต้องรู้ว่าหุ่นยนต์ตัวไหน \"ว่าง\" ต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บ state หุ่นยนต์ซ้ำเอง",
      functions: [
        { sig: "getAvailableRobots(zoneId: string): Promise<Robot[]>", desc: "คืนรายการหุ่นยนต์ที่ว่างและอยู่ในโซนที่ระบุ" },
        { sig: "recordHeartbeat(robotId: string, telemetry: Telemetry): Promise<void>", desc: "บันทึก heartbeat ที่หุ่นยนต์ส่งเข้ามาทุก 2 วินาที" },
        { sig: "markRobotFault(robotId: string, faultCode: string): Promise<void>", desc: "เปลี่ยนสถานะหุ่นยนต์เป็น fault และหยุดจ่ายงานใหม่ให้ตัวนั้นทันที" },
        { sig: "decommissionRobot(robotId: string, reason: string): Promise<void>", desc: "ปลดระวางหุ่นยนต์ถาวร ดู {{ref:policy:robot-decommission-policy}}" },
      ],
      stateFlow: "idle → assigned → moving → picking → returning → idle หรือ fault (จาก state ไหนก็ได้ถ้า heartbeat ขาดหายเกิน threshold)",
      relatedNotes:
        "{{ref:module:task-scheduler}} เรียก `getAvailableRobots` ทุกครั้งก่อนมอบหมายงาน แต่ fleet-controller ไม่รู้จัก concept ของ \"order\" หรือ \"pick task\" เลย — รู้แค่ว่าหุ่นยนต์ตัวไหน busy หรือว่าง เป็นการตัดสินใจ assignment ทั้งหมดอยู่ที่ task-scheduler",
      internals: {
        constants: [
          { name: "HEARTBEAT_INTERVAL_MS", value: "2000" },
          { name: "OFFLINE_AFTER_MISSED_BEATS", value: "5" },
        ],
        typeSnippet:
          "interface Robot {\n  robotId: string;\n  status: \"idle\" | \"assigned\" | \"moving\" | \"picking\" | \"returning\" | \"fault\" | \"charging\";\n  batteryPct: number;\n  zoneId: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการ escalate fault ที่ {{ref:policy:robot-fault-escalation-policy}}",
      },
    },
    {
      slug: "inventory-sync",
      name: "inventory-sync",
      tags: ["inventory", "module"],
      description:
        "sync จำนวนสินค้าจริงในแต่ละ bin กับตัวเลขที่ WMS ของลูกค้าคิดว่าควรจะมี ทำงานเป็น background reconciliation เป็นหลัก ไม่ได้อยู่บน critical path ของการหยิบสินค้าโดยตรง เพื่อไม่ให้ latency ของการ sync ไปถ่วงความเร็วการหยิบ",
      functions: [
        { sig: "reconcileBin(binId: string): Promise<ReconcileResult>", desc: "เทียบจำนวนจริง (จาก cycle count ล่าสุด) กับตัวเลขในระบบ" },
        { sig: "reportDiscrepancy(binId: string, expected: number, actual: number): Promise<void>", desc: "บันทึกและแจ้ง discrepancy ที่เกินเกณฑ์ยอมรับ" },
        { sig: "triggerCycleCount(binId: string): Promise<void>", desc: "สร้าง task ให้พนักงานหรือหุ่นยนต์ตรวจนับ bin นั้นใหม่" },
      ],
      relatedNotes:
        "ไม่รู้จักสถานะหุ่นยนต์เลย (ดู {{ref:arch:boundaries}}) — เมื่อ {{ref:module:picking-engine}} report ว่าหยิบไม่เจอสินค้า จะเป็น {{ref:module:task-scheduler}} ที่เรียก `triggerCycleCount` แทนที่จะให้ inventory-sync ฟัง event การหยิบโดยตรง เพื่อคุม fan-in ของ event ให้อยู่ที่ scheduler จุดเดียว",
    },
    {
      slug: "task-scheduler",
      name: "task-scheduler",
      tags: ["scheduling", "module", "core"],
      description:
        "แปลง order line จาก WMS เป็น pick task แล้วมอบหมายให้หุ่นยนต์ที่เหมาะสม เป็น service เดียวที่ query ข้าม {{ref:module:fleet-controller}} และ {{ref:module:inventory-sync}} พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู {{ref:arch:boundaries}})",
      functions: [
        { sig: "enqueueTask(orderLineId: string, sku: string, qty: number): Promise<string>", desc: "สร้าง pick task ใหม่เข้าคิว คืน taskId" },
        { sig: "assignNextTask(): Promise<Assignment | null>", desc: "จับคู่ task ที่รอนานที่สุดกับหุ่นยนต์ที่ว่างและใกล้ที่สุด" },
        { sig: "requeueTask(taskId: string, reason: string): Promise<void>", desc: "ดันงานกลับเข้าคิวเมื่อ pick ล้มเหลวแบบ retry ได้" },
      ],
      stateFlow: "queued → assigned → in_progress → done | requeued | stuck",
      relatedNotes:
        "ถ้า task อยู่ใน `assigned` นานเกิน threshold โดยไม่มี heartbeat ความคืบหน้าจาก {{ref:module:picking-engine}} ระบบจะ mark เป็น `stuck` — นี่คือปัญหาที่ทำให้เกิด support case จำนวนมากช่วง peak hour ดู {{ref:policy:task-timeout-policy}}",
      internals: {
        constants: [
          { name: "TASK_QUEUE_MAX_DEPTH", value: "500" },
          { name: "REASSIGN_COOLDOWN_MS", value: "3000" },
        ],
        typeSnippet:
          "interface Assignment {\n  taskId: string;\n  robotId: string;\n  binId: string;\n  priority: \"normal\" | \"expedited\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง timeout ที่ {{ref:policy:task-timeout-policy}}",
      },
    },
    {
      slug: "charging-station-manager",
      name: "charging-station-manager",
      tags: ["charging", "module"],
      description:
        "จัดคิวการชาร์จแบตเตอรี่ให้หุ่นยนต์ทั้งหมด แยกออกมาเป็น service อิสระเพราะการจัดการคิวชาร์จมีข้อจำกัดทางกายภาพ (จำนวนหัวชาร์จจำกัด, กำลังไฟฟ้ารวมของแต่ละโซนจำกัด) ที่ไม่เกี่ยวกับ logic การหยิบสินค้าเลย",
      functions: [
        { sig: "requestCharging(robotId: string, batteryPct: number): Promise<QueuePosition>", desc: "ขอเข้าคิวชาร์จ คืนตำแหน่งในคิวปัจจุบัน" },
        { sig: "dockRobot(robotId: string, stationId: string): Promise<void>", desc: "สั่งให้หุ่นยนต์เทียบสถานีชาร์จที่กำหนด" },
        { sig: "releaseStation(stationId: string): Promise<void>", desc: "ปลดหุ่นยนต์ออกจากสถานีเมื่อชาร์จเสร็จหรือถูกดึงออกฉุกเฉิน" },
      ],
      relatedNotes:
        "subscribe event `robot.battery_low` จาก {{ref:module:fleet-controller}} โดยตรง (ดู {{ref:arch:queue}}) เพื่อไม่ให้การจัดการแบตเตอรี่ต้องพึ่ง {{ref:module:task-scheduler}} — ลำดับความสำคัญของการเข้าคิวกำหนดโดย {{ref:policy:charging-priority-policy}}",
    },
    {
      slug: "safety-zone-monitor",
      name: "safety-zone-monitor",
      tags: ["safety", "module"],
      description:
        "เฝ้าระวังโซนที่มนุษย์และหุ่นยนต์ทำงานร่วมกัน ใช้ข้อมูลจากเซ็นเซอร์ LiDAR ติดผนังร่วมกับกล้อง เป็น service เดียวที่มีสิทธิ์สั่ง emergency stop หุ่นยนต์ได้โดยไม่ต้องผ่าน fleet-controller เพื่อลด latency ของคำสั่งหยุดฉุกเฉิน",
      functions: [
        { sig: "evaluateZoneOccupancy(zoneId: string): ZoneStatus", desc: "ประเมินว่ามีคนอยู่ในโซนที่หุ่นยนต์กำลังทำงานหรือไม่" },
        { sig: "triggerEmergencyStop(zoneId: string, reason: string): Promise<void>", desc: "สั่งหยุดหุ่นยนต์ทุกตัวในโซนทันที (bypass queue ปกติ)" },
        { sig: "clearZoneAlert(zoneId: string, clearedBy: string): Promise<void>", desc: "ปลดล็อกโซนหลังตรวจสอบแล้วว่าปลอดภัย ต้องมีคนยืนยันเสมอ" },
      ],
      relatedNotes:
        "คำสั่ง emergency stop ไม่ผ่าน API gateway กลาง (ดู {{ref:arch:gateway}}) เพราะ latency เฉลี่ยของ gateway ช้าเกินไปสำหรับสถานการณ์ที่ต้องหยุดภายในเสี้ยววินาที ดู {{ref:policy:safety-zone-violation-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "picking-engine-service",
      vars: [
        { name: "PICK_ENGINE_GRIP_TIMEOUT_MS", example: "1500", note: "เวลาสูงสุดที่รอให้แขนหุ่นยนต์รายงานผลจับ" },
        { name: "PICK_ENGINE_MAX_RETRY", example: "2", note: "ดู {{ref:policy:pick-retry-policy}}" },
      ],
    },
    {
      service: "fleet-controller-service",
      vars: [
        { name: "FLEET_HEARTBEAT_INTERVAL_MS", example: "2000", note: "" },
        { name: "FLEET_OFFLINE_THRESHOLD_BEATS", example: "5", note: "จำนวน heartbeat ที่ขาดก่อนถือว่า robot offline" },
        { name: "FLEET_DB_URL", example: "postgres://fleet-db.internal:5432/fleet", note: "secret ห้าม log" },
      ],
    },
    {
      service: "task-scheduler-service",
      vars: [
        { name: "TASK_STUCK_THRESHOLD_MIN", example: "10", note: "ดู {{ref:policy:task-timeout-policy}}" },
        { name: "TASK_QUEUE_MAX_DEPTH", example: "500", note: "เกินนี้ throttle ตาม {{ref:policy:peak-hour-throttling-policy}}" },
      ],
    },
    {
      service: "charging-station-manager-service",
      vars: [
        { name: "CHARGING_STATION_COUNT", example: "24", note: "จำนวนหัวชาร์จทั้งหมดในคลัง" },
        { name: "CHARGING_RESERVE_SLOT_COUNT", example: "3", note: "กันไว้สำหรับหุ่นยนต์ฉุกเฉิน ดู {{ref:policy:charging-priority-policy}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "pick-retry-policy",
      title: "นโยบายการ Retry เมื่อหยิบสินค้าไม่สำเร็จ",
      tags: ["picking", "retry", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:picking-engine}} หยิบสินค้าไม่สำเร็จ ระบบจะจัดหมวดผลลัพธ์เป็น `failed_soft` (ลองใหม่ได้ เช่น จับพลาดเพราะมุมไม่พอดี) หรือ `failed_hard` (ต้องให้คนช่วย เช่น หาสินค้าในตำแหน่งไม่เจอเลย)",
        "`failed_soft` จะถูก retry อัตโนมัติสูงสุด `PICK_ENGINE_MAX_RETRY` ครั้งก่อนถูกยกระดับเป็น `failed_hard` โดยอัตโนมัติ เพื่อไม่ให้หุ่นยนต์ค้างพยายามจับซ้ำไม่จบที่หน้า bin เดียว",
      ],
      sections: [
        {
          heading: "ทำไมไม่ retry ไม่จำกัดครั้ง",
          body: "การจับพลาดซ้ำๆ ที่ตำแหน่งเดิมมักไม่ใช่ปัญหาชั่วคราว แต่เป็นสัญญาณว่าสินค้าอยู่ผิดตำแหน่งจริง หรือ grip profile ไม่เหมาะกับสินค้าชิ้นนั้น การ retry ไม่จำกัดจะเปลืองเวลาคิวของหุ่นยนต์ตัวนั้นโดยเปล่าประโยชน์ และหน่วง task อื่นที่รออยู่",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Retry การหยิบสินค้า",
        tags: ["picking", "retry", "edge-case"],
        body: [
          "ถ้าสินค้าหยิบไม่สำเร็จเพราะ reason `not_found` (ไม่ใช่ `grip_slip`) ระบบจะไม่ retry ที่ตำแหน่งเดิมเลยแม้แต่ครั้งเดียว เพราะการลองจับซ้ำที่ตำแหน่งที่ไม่มีสินค้าจริงไม่มีประโยชน์ — จะส่งตรงไป `failed_hard` ทันทีเพื่อ trigger cycle count ผ่าน {{ref:policy:inventory-discrepancy-policy}}",
          "สินค้าที่ถูก flag ว่าเสียหายระหว่างพยายามหยิบ (ดู {{ref:policy:damaged-item-handling-policy}}) ก็ไม่เข้าเงื่อนไข retry เช่นกัน เพราะการลองจับซ้ำอาจทำให้สินค้าเสียหายมากขึ้น",
        ],
      },
    },
    {
      slug: "robot-fault-escalation-policy",
      title: "นโยบายการยกระดับ Fault ของหุ่นยนต์",
      tags: ["fleet", "fault", "policy"],
      isPrimary: true,
      intro: [
        "หุ่นยนต์ที่ขาด heartbeat เกิน `FLEET_OFFLINE_THRESHOLD_BEATS` ครั้งติดต่อกัน จะถูก {{ref:module:fleet-controller}} เปลี่ยนสถานะเป็น `fault` อัตโนมัติและหยุดรับงานใหม่ทันที",
        "fault ถูกจัดหมวดเป็น 3 ระดับ: `warning` (แบตเตอรี่ผิดปกติเล็กน้อย ยังทำงานต่อได้), `degraded` (ทำงานได้แต่ช้าลงอย่างมีนัยสำคัญ), และ `critical` (ต้องปลดออกจากคิวงานทันที)",
      ],
      edgeCase: {
        title: "กรณี Fault ไม่ต่อเนื่อง (Intermittent) ของหุ่นยนต์",
        tags: ["fleet", "fault", "edge-case"],
        body: [
          "หุ่นยนต์ที่ fault แล้วกลับมาปกติเองซ้ำๆ ภายในเวลาสั้น (เช่น หลุด-กลับมา 3 ครั้งใน 1 ชั่วโมง) ไม่ถูกนับเป็น `critical` เดี่ยวๆ ตามเกณฑ์ปกติ แต่ระบบจะรวมนับเป็นเหตุการณ์เดียวและ escalate ไปให้ทีมซ่อมบำรุงตรวจฮาร์ดแวร์แทน เพราะมักเป็นสัญญาณของสาย connector หลวมมากกว่าเป็นปัญหา software",
          "ระหว่างรอตรวจฮาร์ดแวร์ หุ่นยนต์กลุ่มนี้ยังรับงานได้ปกติถ้าสถานะล่าสุดคือ idle ไม่ใช่ fault — ต่างจาก critical fault ทั่วไปที่หยุดรับงานทันที เพราะ intermittent fault ยังไม่มีหลักฐานว่าจะเกิดซ้ำระหว่างทำงานจริง",
        ],
      },
    },
    {
      slug: "inventory-discrepancy-policy",
      title: "นโยบายจัดการ Inventory Discrepancy",
      tags: ["inventory", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:inventory-sync}} เทียบจำนวนจริงจาก cycle count กับตัวเลขในระบบแล้วต่างกันเกิน 2 ชิ้นหรือเกิน 5% ของจำนวนที่ควรมี (แล้วแต่ค่าไหนมากกว่า) จะถือเป็น discrepancy ที่ต้องรายงาน",
        "ระบบไม่แก้ตัวเลขในระบบให้ตรงกับที่นับได้ทันที — ต้องรอการยืนยันจากพนักงานคลังก่อนเสมอ เพื่อป้องกันกรณี cycle count เองผิดพลาด",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อเกิด Discrepancy ระหว่าง Physical Audit",
        tags: ["inventory", "audit", "edge-case"],
        body: [
          "ระหว่างช่วง physical audit ประจำไตรมาส ระบบจะปิดการแจ้ง discrepancy อัตโนมัติชั่วคราว เพราะสินค้าถูกย้ายด้วยมือจำนวนมากพร้อมกัน การแจ้งเตือนทุกรายการจะท่วมทีมโดยไม่มีประโยชน์ — discrepancy จะถูกสะสมไว้แล้วรายงานเป็นชุดเดียวหลัง audit เสร็จแทน",
          "SKU ที่มีมูลค่าสูง (จัดกลุ่ม `high_value`) ไม่เข้าเงื่อนไขนี้ ยังคงแจ้ง discrepancy ทันทีแม้อยู่ระหว่าง audit เพราะความเสี่ยงสูญหายสูงกว่าความรำคาญจาก alert ที่มากเกินไป",
        ],
      },
    },
    {
      slug: "charging-priority-policy",
      title: "นโยบายลำดับความสำคัญการชาร์จแบตเตอรี่",
      tags: ["charging", "policy"],
      isPrimary: true,
      intro: [
        "หุ่นยนต์ที่แบตเตอรี่ต่ำกว่า 15% ได้สิทธิ์เข้าคิวชาร์จก่อนหุ่นยนต์อื่นเสมอ ไม่ว่าคิวงานปัจจุบันจะเป็นอย่างไร — ป้องกันไม่ให้หุ่นยนต์แบตหมดกลางทางขณะถือสินค้าอยู่",
        "ระบบกัน `CHARGING_RESERVE_SLOT_COUNT` หัวชาร์จไว้เฉพาะกรณีฉุกเฉินเสมอ ไม่ปล่อยให้หุ่นยนต์ backlog ทั่วไปจองเต็มทุกหัว",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: หุ่นยนต์ถือสินค้าค้างอยู่ตอนแบตต่ำ",
        tags: ["charging", "edge-case"],
        body: [
          "ถ้าหุ่นยนต์แบตต่ำกว่า 15% แต่กำลังถือสินค้าที่หยิบมาแล้วยังไม่ได้ส่งถึงจุดแพ็ค ระบบจะไม่ดึงเข้าคิวชาร์จทันที — จะให้ไปส่งสินค้าที่ถืออยู่ให้เสร็จก่อน (ไม่เกิน 1 จุดหมายถัดไป) แล้วค่อยเข้าคิวชาร์จ เพื่อไม่ให้สินค้าตกค้างกลางทาง",
          "ยกเว้นแบตต่ำกว่า 5% ซึ่งถือเป็นระดับวิกฤต — กรณีนี้หุ่นยนต์จะวางสินค้าที่จุดพักฉุกเฉินที่ใกล้ที่สุดแล้วเข้าคิวชาร์จทันที ไม่รอส่งให้เสร็จ",
        ],
      },
    },
    {
      slug: "safety-zone-violation-policy",
      title: "นโยบายเมื่อมีคนเข้าโซนทำงานของหุ่นยนต์",
      tags: ["safety", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:safety-zone-monitor}} ตรวจพบคนเข้าโซนที่หุ่นยนต์กำลังทำงาน ระบบจะสั่ง emergency stop หุ่นยนต์ทุกตัวในโซนนั้นทันทีโดยไม่รอการยืนยัน (fail-safe ก่อน แล้วค่อยตรวจสอบทีหลัง)",
        "การปลดล็อกโซนต้องมีพนักงานที่ผ่านการอบรมยืนยันด้วยมือผ่าน `clearZoneAlert` เท่านั้น ระบบจะไม่ปลดล็อกอัตโนมัติแม้เซ็นเซอร์จะกลับมาไม่พบคนแล้วก็ตาม",
      ],
      edgeCase: {
        title: "โหมดบำรุงรักษา (Maintenance Mode) กับการยกเว้น Safety Zone",
        tags: ["safety", "maintenance", "edge-case"],
        body: [
          "เมื่อทีมซ่อมบำรุงเปิด maintenance mode สำหรับโซนใดโซนหนึ่งอย่างเป็นทางการ (ผ่านขั้นตอนที่มีการล็อกกุญแจทางกายภาพร่วมด้วย ไม่ใช่แค่ toggle ในระบบ) หุ่นยนต์ในโซนนั้นจะถูกสั่งหยุดล่วงหน้าทั้งหมดก่อนคนเข้า ไม่ต้องรอให้เซ็นเซอร์ตรวจจับแล้วค่อย emergency stop",
          "การออกจาก maintenance mode ต้องมีการเดินตรวจโซนให้แน่ใจว่าไม่มีคนหรือสิ่งกีดขวางค้างอยู่ก่อนเปิดให้หุ่นยนต์กลับมาทำงาน ขั้นตอนนี้เข้มกว่าการปลดล็อกจาก emergency stop ปกติ เพราะช่วง maintenance มักมีการเคลื่อนย้ายอุปกรณ์หนัก",
        ],
      },
    },
    {
      slug: "task-timeout-policy",
      title: "นโยบาย Timeout ของ Pick Task (Business-level)",
      tags: ["scheduling", "timeout", "policy"],
      isPrimary: true,
      intro: [
        "เอกสารนี้พูดถึง timeout ระดับ business — ระยะเวลาที่ task อยู่ในสถานะ `assigned` หรือ `in_progress` ก่อนถือว่า \"ค้าง\" ไม่ใช่ timeout ระดับ network/heartbeat ซึ่งเป็นคนละเรื่องที่อธิบายไว้ใน {{ref:deployment:heartbeat-timeout-tuning}}",
        "task ที่ค้างเกิน `TASK_STUCK_THRESHOLD_MIN` จะถูก mark เป็น `stuck` และแจ้งทีม warehouse-ops ให้เข้าไปดูด้วยมือ ระบบจะไม่ requeue อัตโนมัติเพราะอาจมีหุ่นยนต์ค้างอยู่หน้า bin จริงและ requeue จะทำให้อีกตัวมาซ้อนทับ",
      ],
      edgeCase: {
        title: "Order หลายชิ้นที่หยิบสำเร็จบางส่วนก่อน Task ค้าง",
        tags: ["scheduling", "timeout", "edge-case"],
        body: [
          "สำหรับ order ที่มีหลาย order line และหยิบสำเร็จไปแล้วบางส่วนก่อนที่ line ที่เหลือจะค้าง ระบบจะไม่ mark ทั้ง order เป็น stuck — จะแยกเฉพาะ line ที่ค้างจริงออกมาให้ทีม warehouse-ops ดู ส่วน line ที่หยิบสำเร็จแล้วเดินหน้าไปแพ็คตามปกติ",
          "เหตุผลที่แยกแบบนี้เพราะเคยมีกรณี order 8 ชิ้นค้างแค่ชิ้นเดียว แต่ทั้ง order ถูกหยุดรอจนลูกค้าปลายทางได้รับสินค้าช้าเกินจำเป็น ทั้งที่อีก 7 ชิ้นพร้อมส่งแล้ว",
        ],
      },
    },
    {
      slug: "robot-decommission-policy",
      title: "นโยบายการปลดระวางหุ่นยนต์",
      tags: ["fleet", "lifecycle", "policy"],
      isPrimary: false,
      intro: [
        "หุ่นยนต์ที่เข้า `critical fault` เกิน 3 ครั้งในรอบ 30 วัน หรืออายุการใช้งานแบตเตอรี่เกิน 18 เดือน จะถูกเสนอเข้ากระบวนการปลดระวาง โดยทีมซ่อมบำรุงเป็นผู้อนุมัติสุดท้าย ไม่ใช่ระบบอัตโนมัติ",
        "ก่อนปลดระวางจริง ต้องแน่ใจว่าไม่มี task ค้างอยู่กับหุ่นยนต์ตัวนั้น ดูขั้นตอนเต็มที่ {{ref:deployment:fleet-firmware-deployment-runbook}}",
      ],
    },
    {
      slug: "replenishment-trigger-policy",
      title: "นโยบายการเติมสินค้าอัตโนมัติ (Replenishment)",
      tags: ["inventory", "replenishment", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อจำนวนสินค้าใน forward-pick bin ต่ำกว่า 20% ของ capacity ระบบจะสร้าง replenishment task อัตโนมัติให้ดึงสินค้าจาก reserve storage มาเติม โดยไม่ต้องรอให้ bin ว่างสนิทก่อน",
        "replenishment task มี priority ต่ำกว่า pick task ปกติเสมอ เพื่อไม่ให้แย่งหุ่นยนต์จาก order ที่ลูกค้ากำลังรอ",
      ],
    },
    {
      slug: "peak-hour-throttling-policy",
      title: "นโยบาย Throttle การรับงานช่วง Peak Hour",
      tags: ["scheduling", "throttling", "policy"],
      isPrimary: false,
      intro: [
        "ช่วง peak window (10:00-14:00) หากคิว {{ref:module:task-scheduler}} มีความลึกเกิน `TASK_QUEUE_MAX_DEPTH` ระบบจะเริ่ม throttle การรับ task ใหม่จาก WMS โดยตอบ `429 queue_full` แทนที่จะรับเข้าคิวจนล้น",
        "WMS ฝั่งลูกค้าต้อง retry เองตาม backoff ที่ตกลงกันไว้ — ทีมเคยพิจารณาให้ WareBot รับเข้า buffer ไว้ก่อนแทน แต่ตัดสินใจไม่ทำเพราะจะทำให้ debug คิวจริงยากขึ้น",
      ],
    },
    {
      slug: "damaged-item-handling-policy",
      title: "นโยบายเมื่อพบสินค้าเสียหายระหว่างหยิบ",
      tags: ["picking", "quality", "policy"],
      isPrimary: false,
      intro: [
        "ถ้า {{ref:module:picking-engine}} ตรวจพบว่าสินค้าเสียหาย (จาก sensor แรงกดผิดปกติหรือกล้องตรวจสภาพ) จะไม่หยิบสินค้าชิ้นนั้นต่อ และ mark task เป็น `damaged_item_flagged` แทนที่จะรายงานเป็น pick failure ธรรมดา",
        "สินค้าที่ถูก flag จะเข้าคิวตรวจสอบโดยพนักงานคลังก่อนตัดสินใจว่าจะทิ้งหรือส่งกลับซัพพลายเออร์ ไม่มีการหยิบซ้ำอัตโนมัติสำหรับ task ประเภทนี้",
      ],
    },
    {
      slug: "firmware-rollout-policy",
      title: "นโยบายการ Rollout Firmware หุ่นยนต์",
      tags: ["fleet", "firmware", "policy"],
      isPrimary: false,
      intro: [
        "firmware ใหม่ต้อง rollout แบบ staged เสมอ เริ่มจากหุ่นยนต์ไม่เกิน 5 ตัวในโซนที่ไม่ใช่ peak zone ก่อน สังเกตอาการอย่างน้อย 24 ชั่วโมงก่อนขยายไปทั้งฟลีท",
        "ห้าม rollout firmware ระหว่างช่วง peak window โดยเด็ดขาด แม้จะเป็น hotfix เร่งด่วนก็ตาม — ต้องรอให้พ้นช่วง 10:00-14:00 ก่อนเสมอ ดูขั้นตอนเต็มที่ {{ref:deployment:fleet-firmware-deployment-runbook}}",
      ],
    },
  ],
  incidents: [
    {
      slug: "charging-queue-deadlock",
      title: "หุ่นยนต์ติดคิวชาร์จตายช่วงเช้า peak shift",
      tags: ["charging", "deadlock"],
      summary:
        "เช้าวันจันทร์ ทีม warehouse-ops แจ้งว่าหุ่นยนต์เกือบ 40% ของฟลีทค้างอยู่ในสถานะ `charging` นานผิดปกติ ไม่มีตัวไหนออกไปทำงานเลยตั้งแต่เปิดกะ",
      investigation:
        "เช็ค {{ref:deployment:monitoring-alerts}} พบว่า charging session ทั้งหมดค้างที่สถานะ `pending_dock` ไม่ขยับไป `docked` เลย ตรวจ log ของ {{ref:module:charging-station-manager}} พบว่าเป็น loop ที่รอปลดหัวชาร์จเก่าก่อนแต่หัวชาร์จเก่าก็รอหุ่นยนต์ใหม่มาแทนที่ถึงจะปลด",
      cause:
        "deploy เมื่อคืนก่อนหน้าเปลี่ยน logic การปลดหัวชาร์จให้รอ signal ยืนยันจากหุ่นยนต์ตัวถัดไปก่อน แต่ลืม handle กรณีที่ไม่มีหุ่นยนต์ตัวถัดไปรออยู่เลย (คิวว่าง) ทำให้เกิด deadlock ทันทีที่คิวว่างพอดี",
      resolution:
        "วิศวกร on-call rollback deploy คืนกลับเวอร์ชันก่อนหน้าตาม {{ref:deployment:rollback-procedure}} แล้ว force release หัวชาร์จที่ค้างด้วยมือทีละตัว ฟลีทกลับมาทำงานปกติภายใน 25 นาที",
      followup:
        "เพิ่ม test case สำหรับกรณีคิวว่างใน integration test ของ charging-station-manager และเพิ่ม alert แยกสำหรับ `pending_dock` ที่ค้างเกิน 5 นาที",
    },
    {
      slug: "sku-mass-pick-failure",
      title: "SKU เดียวหยิบพลาดพร้อมกันหลายสิบครั้งจาก inventory ผิด",
      tags: ["inventory", "discrepancy"],
      summary:
        "ทีม support ได้รับรายงาน pick failure ผิดปกติจำนวนมากสำหรับ SKU เดียว (SKU-8821) ในเวลาไม่ถึงชั่วโมง ทุกครั้งเป็น `not_found`",
      investigation:
        "ตรวจสอบ {{ref:module:inventory-sync}} พบว่า bin B-14-3 ที่ควรมีสินค้า 40 ชิ้นตาม WMS จริงๆ ว่างเปล่า ตรงกับนิยาม discrepancy ใน {{ref:policy:inventory-discrepancy-policy}}",
      cause:
        "พบว่ามีการย้ายสินค้าด้วยมือระหว่างทำ physical audit เมื่อสัปดาห์ก่อน แต่พนักงานลืมสแกนอัปเดตตำแหน่งใหม่ในระบบ ทำให้ WMS ยังคิดว่าสินค้าอยู่ที่ bin เดิม",
      resolution:
        "trigger `triggerCycleCount` สำหรับ bin ที่เกี่ยวข้องทั้งหมดในโซนเดียวกัน พบสินค้าจริงอยู่ที่ bin C-02-1 แล้วอัปเดตตำแหน่งให้ตรง หยิบสำเร็จได้ปกติหลังจากนั้น",
      followup:
        "เสนอให้ physical audit ในอนาคตต้องสแกนยืนยันตำแหน่งใหม่ก่อนปิดงาน ไม่ใช่แค่บันทึกบนกระดาษแล้วค่อยกรอกเข้าระบบทีหลัง",
    },
    {
      slug: "safety-sensor-false-positive",
      title: "เซ็นเซอร์ safety zone ตรวจจับผิดพลาดหยุดทั้งโซนนานหลายชั่วโมง",
      tags: ["safety", "sensor"],
      summary:
        "โซน C ทั้งโซนหยุดทำงานตั้งแต่บ่ายโมงถึงเกือบสี่โมงเย็น แม้จะไม่มีใครเดินเข้าโซนจริง ทำให้ order ค้างสะสมจำนวนมาก",
      investigation:
        "ตรวจ log {{ref:module:safety-zone-monitor}} พบว่า `evaluateZoneOccupancy` รายงาน occupied ต่อเนื่องแม้กล้องจะไม่เห็นคนเลย สงสัยเซ็นเซอร์ LiDAR ตัวหนึ่งในโซนมีปัญหา",
      cause:
        "พบภายหลังว่าเป็นกล่องกระดาษลังเปล่าตกค้างอยู่ในมุมโซนบังมุมมองเซ็นเซอร์บางส่วน ทำให้ค่าที่อ่านได้แกว่งจนระบบตีความเป็นการเคลื่อนไหวของคนซ้ำๆ",
      resolution:
        "พนักงานเข้าไปเก็บกล่องออกตามขั้นตอนความปลอดภัย แล้วเรียก `clearZoneAlert` ปลดล็อกโซนตาม {{ref:policy:safety-zone-violation-policy}} ทันทีที่ยืนยันว่าปลอดภัยแล้ว",
      followup:
        "เพิ่มกฎ housekeeping ห้ามวางของค้างในมุมกล้อง safety zone และพิจารณาเพิ่มเซ็นเซอร์สำรองสำหรับโซนที่มีจุดบอดเดิม",
    },
    {
      slug: "firmware-misroute-bug",
      title: "Firmware ใหม่ทำหุ่นยนต์วิ่งผิดโซนหลัง rollout",
      tags: ["firmware", "fleet"],
      summary:
        "หลัง rollout firmware v4.2 ให้หุ่นยนต์ 5 ตัวแรกตาม {{ref:policy:firmware-rollout-policy}} พบว่าหุ่นยนต์ 2 ใน 5 ตัววิ่งไปโซน B แทนที่จะเป็นโซน A ที่ถูกมอบหมาย",
      investigation:
        "ตรวจ path-planning log พบว่า firmware ใหม่เปลี่ยน default fallback zone เป็นโซน B โดยไม่ตั้งใจ (ค่า default เดิมของ config ตัวหนึ่งหายไปตอน merge)",
      cause:
        "การทดสอบก่อน rollout ทำใน simulation ที่ไม่ได้ตั้งค่า zone assignment ชัดเจน จึงไม่เจอ bug นี้ก่อนขึ้นจริง เจอเฉพาะตอนรันกับ config โซนจริงของคลัง",
      resolution:
        "หยุด rollout ทันทีตาม {{ref:deployment:fleet-firmware-deployment-runbook}} rollback หุ่นยนต์ 2 ตัวที่ได้รับผลกระทบกลับ firmware เดิม แล้วดึงหุ่นยนต์ทั้งสองกลับมาตรวจตำแหน่งด้วยมือ",
      followup:
        "เพิ่ม required field สำหรับ zone assignment ใน simulation test suite ก่อนอนุมัติ firmware rollout ครั้งถัดไป",
    },
    {
      slug: "scheduler-backlog-after-outage",
      title: "คิว task ค้างสะสมหลัง network outage สั้นๆ",
      tags: ["scheduling", "network"],
      summary:
        "หลัง network ภายในคลังหลุดไปประมาณ 4 นาที คิว {{ref:module:task-scheduler}} มี task ค้างสะสมกว่า 300 รายการทันทีที่ network กลับมา",
      investigation:
        "พบว่า order จาก WMS ยังคงส่งเข้ามาต่อเนื่องระหว่าง outage และถูก buffer ไว้ที่ API gateway แต่ scheduler ประมวลผลทีละ task ตามปกติทำให้ไล่ backlog ไม่ทัน",
      cause:
        "ไม่มี logic พิเศษสำหรับสถานการณ์ backlog ขนาดใหญ่ที่เกิดจาก outage — scheduler ปฏิบัติกับ burst แบบนี้เหมือน load ปกติ ทำให้ throttling ตาม {{ref:policy:peak-hour-throttling-policy}} ไม่ถูก trigger เพราะไม่ใช่ peak window ตามเวลาแต่โหลดสูงจริง",
      resolution:
        "วิศวกร on-call เปิด throttling ด้วยมือชั่วคราวนอกช่วง peak window ปกติ เพื่อกัน queue ไม่ให้ล้นขณะไล่ backlog ใช้เวลาประมาณ 40 นาทีจนคิวกลับสู่ปกติ",
      followup:
        "เสนอให้ throttling ผูกกับ queue depth จริงแทนการผูกกับช่วงเวลาคงที่ อยู่ระหว่างพิจารณาว่าจะปรับ {{ref:policy:peak-hour-throttling-policy}} หรือไม่",
    },
    {
      slug: "charging-firmware-battery-misreport",
      title: "หัวชาร์จรายงานแบตเตอรี่ผิดพร้อมกันหลายตัว",
      tags: ["charging", "firmware"],
      summary:
        "หุ่นยนต์ 6 ตัวรายงาน `robot.battery_low` พร้อมกันในเวลาไล่เลี่ยกันทั้งที่เพิ่งชาร์จเต็มไปเมื่อชั่วโมงก่อนหน้า",
      investigation:
        "ตรวจสอบ {{ref:module:charging-station-manager}} พบว่าหัวชาร์จ 3 หัวที่หุ่นยนต์กลุ่มนี้ใช้มี firmware เวอร์ชันเก่าที่มี bug คำนวณเปอร์เซ็นต์แบตเตอรี่ผิดหลังชาร์จเต็ม",
      cause:
        "หัวชาร์จกลุ่มนี้พลาดการอัปเดต firmware รอบล่าสุดเพราะอยู่ในโซนที่ปิดปรับปรุงตอนที่ทีมไล่ update ทำให้ตกหล่นจากรายการ",
      resolution:
        "อัปเดต firmware หัวชาร์จที่ตกหล่นทั้ง 3 หัวด้วยมือ แล้วสั่งให้หุ่นยนต์ที่ได้รับผลกระทบเข้าคิวชาร์จใหม่ตาม {{ref:policy:charging-priority-policy}} เพื่อความปลอดภัยแม้ตัวเลขแบตจะดูปกติแล้วก็ตาม",
      followup:
        "เพิ่ม checklist ยืนยันจำนวนหัวชาร์จที่อัปเดตสำเร็จครบทุกตัวก่อนปิดงาน firmware update รอบถัดไป",
    },
    {
      slug: "picking-engine-latency-spike",
      title: "picking-engine ตอบสนองช้าลงหลัง promo ทำ order พุ่ง",
      tags: ["picking", "performance"],
      summary:
        "ช่วง promo ใหญ่ order พุ่งขึ้น 3 เท่าจากปกติ ทีมสังเกตว่าเวลาเฉลี่ยตั้งแต่มอบหมายงานถึงเริ่มหยิบจริงช้าลงจาก 8 วินาทีเป็นเกือบ 40 วินาที",
      investigation:
        "ตรวจ metric ของ {{ref:module:picking-engine}} พบว่า `computeGripProfile` ถูกเรียกซ้ำสำหรับ SKU เดิมทุกครั้งแทนที่จะ cache ผลลัพธ์ไว้ ทำให้ CPU ของ service พุ่งสูงตอน load เยอะ",
      cause:
        "ตอนออกแบบ engine ครั้งแรก คาดว่าจำนวน SKU ที่ active พร้อมกันจะน้อย จึงไม่เห็นความจำเป็นต้อง cache — แต่ promo ทำให้ SKU ยอดนิยมถูกหยิบซ้ำจำนวนมากในเวลาสั้นๆ",
      resolution:
        "เพิ่ม in-memory cache สำหรับ grip profile แบบเร่งด่วน (TTL 1 ชั่วโมง) deploy เป็น hotfix ระหว่าง promo ทำให้ latency กลับมาใกล้เคียงปกติภายใน 15 นาทีหลัง deploy",
      followup:
        "นำ caching layer เข้า scope งานถัดไปอย่างเป็นทางการแทนการเป็น hotfix พร้อมทบทวน {{ref:deployment:scaling-policy}} ของ service นี้สำหรับ promo ในอนาคต",
    },
    {
      slug: "near-miss-safety-lag",
      title: "เกือบเกิดอุบัติเหตุจาก safety-zone-monitor หน่วงตอบสนอง",
      tags: ["safety", "incident"],
      summary:
        "พนักงานรายงานว่าหุ่นยนต์ตัวหนึ่งเกือบชนขณะเดินเข้าโซน B แม้จะมีระบบ safety zone อยู่แล้ว โชคดีที่พนักงานหยุดเองทัน",
      investigation:
        "ตรวจ timestamp พบว่า `triggerEmergencyStop` ถูกเรียกจริง แต่ห่างจากเวลาที่คนเข้าโซนไปแล้วเกือบ 900 มิลลิวินาที ซึ่งช้ากว่าที่ออกแบบไว้มาก",
      cause:
        "พบว่าช่วงเวลาดังกล่าว safety-zone-monitor กำลังประมวลผล batch การตรวจ zone หลายโซนพร้อมกันเพราะเป็นช่วง peak window ทำให้คิวประมวลผลของโซน B ล่าช้ากว่าปกติ",
      resolution:
        "แยก compute resource ของ safety-zone-monitor ไม่ให้แชร์กับ service อื่น และปรับ priority การประมวลผลให้โซนที่มีการเคลื่อนไหวล่าสุดถูกประมวลผลก่อนเสมอ",
      followup:
        "ยกระดับเหตุการณ์นี้เป็น near-miss incident ตามขั้นตอนใน {{ref:deployment:incident-response-runbook}} และทบทวน SLA เวลาตอบสนองของ emergency stop ทั้งระบบ",
    },
    {
      slug: "cycle-count-reconciliation-error",
      title: "reconciliation job นับ cycle count ผิดพลาดข้ามคืน",
      tags: ["inventory", "reconciliation"],
      summary:
        "เช้าวันหนึ่งพบว่าตัวเลข inventory หลาย bin ในโซน D ผิดปกติทั้งที่ไม่มีใครแก้ไขด้วยมือ",
      investigation:
        "ตรวจ log reconciliation job รายคืนของ {{ref:module:inventory-sync}} พบว่า job รันซ้ำสองรอบเพราะ cron schedule ทับซ้อนกับ job ที่รันช้ากว่ากำหนดจากคืนก่อนหน้า",
      cause:
        "การรันซ้ำทำให้ discrepancy ที่เพิ่งถูกแก้ไขจากรอบแรกถูกคำนวณทับด้วยข้อมูลรอบสองที่ยังไม่อัปเดต ส่งผลให้ตัวเลขสุดท้ายผิดเพี้ยนไปจากความจริง",
      resolution:
        "หยุด job ที่รันซ้ำ แล้วรัน reconciliation รอบใหม่ด้วยมือครั้งเดียวหลังยืนยันว่าไม่มี job ค้างเหลืออยู่ ตัวเลขกลับมาถูกต้องภายในเช้าวันเดียวกัน",
      followup:
        "เพิ่ม lock กัน job ตัวเดียวกันรันซ้อนกันสองรอบ และตรวจสอบ schedule ของ job อื่นที่อาจมีความเสี่ยงเดียวกัน",
    },
    {
      slug: "charging-circuit-trip",
      title: "เบรกเกอร์ไฟฟ้าของสถานีชาร์จตัดวงจรกลางดึก",
      tags: ["charging", "infrastructure"],
      summary:
        "เบรกเกอร์ไฟฟ้าที่จ่ายให้สถานีชาร์จ 1 ใน 3 ของทั้งหมดตัดวงจรกลางดึก ทำให้หุ่นยนต์ที่จอดชาร์จอยู่ 8 ตัวไม่ได้ชาร์จข้ามคืน",
      investigation:
        "ตรวจ {{ref:module:charging-station-manager}} พบว่า charging session ของหุ่นยนต์ทั้ง 8 ตัวค้างสถานะ `docked` แต่ battery% ไม่ขยับขึ้นเลยตลอดคืน",
      cause:
        "ทีมโรงงานยืนยันว่าเป็นปัญหาฮาร์ดแวร์เบรกเกอร์ล้วนๆ ไม่เกี่ยวกับซอฟต์แวร์ แต่ระบบไม่มี alert แยกสำหรับกรณี \"docked แต่แบตไม่ขึ้น\" ทำให้กว่าจะรู้ตัวก็ผ่านไปหลายชั่วโมง",
      resolution:
        "ทีมซ่อมบำรุงรีเซ็ตเบรกเกอร์ตอนเช้า หุ่นยนต์เริ่มชาร์จตามปกติ แต่กะเช้าต้องเลื่อนเริ่มงานไป 45 นาทีเพราะแบตเตอรี่ไม่พอ",
      followup:
        "เพิ่ม alert ใหม่ใน {{ref:deployment:monitoring-alerts}} สำหรับ session ที่ `docked` นานเกิน 30 นาทีแต่ battery% ไม่เปลี่ยนแปลงเลย",
    },
    {
      slug: "duplicate-task-assignment-bug",
      title: "Task-scheduler มอบหมาย order line เดียวกันให้สองหุ่นยนต์",
      tags: ["scheduling", "bug"],
      summary:
        "พบว่า order line เดียวกันถูกหยิบสำเร็จสองครั้งโดยหุ่นยนต์คนละตัว ทำให้สินค้าถูกส่งซ้ำไปยังจุดแพ็คโดยไม่จำเป็น",
      investigation:
        "ตรวจ log `assignNextTask` พบว่ามี race condition เมื่อสอง request เรียกฟังก์ชันนี้พร้อมกันในเวลาไล่เลี่ยกันมาก (ต่ำกว่า `REASSIGN_COOLDOWN_MS`) ทำให้ทั้งคู่อ่านเห็น task เดิมว่ายัง `queued` อยู่",
      cause:
        "การ query และ update สถานะ task ไม่ได้ทำแบบ atomic ในเวอร์ชันนี้ — ช่วงเวลาสั้นๆ ระหว่างอ่านกับเขียนเปิดโอกาสให้ request คู่ขนานแทรกเข้ามาได้",
      resolution:
        "แก้ให้ assignment ใช้ conditional update แบบ atomic (update ...where status='queued') แทนการอ่านแล้วเขียนแยกกัน deploy เป็น hotfix ทันที",
      followup:
        "ตรวจสอบฟังก์ชันอื่นใน {{ref:module:task-scheduler}} ที่มี pattern อ่าน-แล้ว-เขียนคล้ายกันว่ามีความเสี่ยง race condition เดียวกันหรือไม่",
    },
    {
      slug: "damaged-item-queue-flood",
      title: "คิวตรวจสอบสินค้าเสียหายล้นเพราะ sensor ปรับ threshold ผิด",
      tags: ["quality", "picking"],
      summary:
        "คิวตรวจสอบสินค้าที่ถูก flag ว่าเสียหายพุ่งขึ้นผิดปกติในเวลาไม่กี่ชั่วโมง จนพนักงานตรวจสอบไม่ทัน",
      investigation:
        "ตรวจ log {{ref:module:picking-engine}} พบว่า threshold แรงกดที่ใช้ตัดสินว่า \"เสียหาย\" ถูกปรับต่ำเกินไปหลัง config เปลี่ยนตาม {{ref:policy:damaged-item-handling-policy}} เมื่อสัปดาห์ก่อน",
      cause:
        "ค่า threshold ใหม่คำนวณมาจากการทดสอบกับสินค้ากลุ่มเดียว (กล่องแข็ง) แต่คลังจริงมีสินค้าหลากหลายรูปทรงที่มีแรงกดปกติแตกต่างกันมาก ทำให้สินค้าปกติจำนวนมากถูกตัดสินผิดว่าเสียหาย",
      resolution:
        "ปรับ threshold กลับไปใกล้เคียงค่าเดิมชั่วคราว แล้วล้างคิวตรวจสอบที่ค้างด้วยการสุ่มตรวจเป็นชุด ยืนยันว่าส่วนใหญ่เป็น false positive จริง",
      followup:
        "วางแผนทำ threshold แยกตามหมวดสินค้าแทนค่าคงที่ตัวเดียวทั้งคลัง เพื่อลด false positive โดยไม่ลดความไวต่อของเสียหายจริง",
    },
    {
      slug: "decommission-orphaned-tasks",
      title: "ปลดระวางหุ่นยนต์ทิ้ง task ค้างไว้ในคิวโดยไม่มีใครสังเกต",
      tags: ["fleet", "lifecycle"],
      summary:
        "หุ่นยนต์ตัวหนึ่งถูกปลดระวางตาม {{ref:policy:robot-decommission-policy}} แต่พบภายหลังว่ามี task ที่มอบหมายให้ตัวมันค้างอยู่ในสถานะ `assigned` ไม่ถูกย้ายไปให้ตัวอื่น",
      investigation:
        "ตรวจสอบ `decommissionRobot` พบว่าฟังก์ชันนี้แค่เปลี่ยนสถานะหุ่นยนต์เป็น offline ถาวร แต่ไม่ได้เรียก `requeueTask` ให้ task ที่ค้างอยู่กับตัวมันเลย",
      cause:
        "ตอนออกแบบฟังก์ชัน decommission คาดว่าหุ่นยนต์จะถูกปลดระวางเฉพาะตอน idle เท่านั้น แต่ในเคสนี้ทีมซ่อมบำรุงตัดสินใจปลดระวางทันทีเพราะ fault ร้ายแรง โดยไม่รอให้ task ปัจจุบันเสร็จก่อน",
      resolution:
        "ค้นหา task ที่ค้างด้วยมือจาก `robot_id` ของหุ่นยนต์ที่ถูกปลดระวาง แล้ว requeue ให้หุ่นยนต์ตัวอื่นรับช่วงต่อ",
      followup:
        "แก้ `decommissionRobot` ให้เรียก requeue task ที่ค้างอยู่โดยอัตโนมัติเป็นส่วนหนึ่งของขั้นตอน ไม่ต้องพึ่งให้คนจำได้ทุกครั้ง",
    },
    {
      slug: "throttling-misconfig-missed-cutoff",
      title: "ตั้งค่า throttling ผิดทำให้พลาด shipping cutoff",
      tags: ["scheduling", "throttling"],
      summary:
        "วันหนึ่งพบว่า order จำนวนมากไม่ถูกหยิบทันเวลา shipping cutoff ทั้งที่คิวไม่ได้ยาวผิดปกติมากนัก",
      investigation:
        "ตรวจ config ของ {{ref:policy:peak-hour-throttling-policy}} พบว่าค่า `TASK_QUEUE_MAX_DEPTH` ถูกปรับลดลงระหว่างการทดสอบ config ใหม่เมื่อสัปดาห์ก่อน แต่ไม่ได้ปรับกลับหลังทดสอบเสร็จ",
      cause:
        "ค่าที่ต่ำเกินไปทำให้ระบบเริ่ม throttle order ใหม่จาก WMS เร็วกว่าที่ควรมาก ทั้งที่หุ่นยนต์ยังมีกำลังการหยิบเหลืออยู่มาก",
      resolution:
        "ปรับค่า `TASK_QUEUE_MAX_DEPTH` กลับเป็นค่าที่ตั้งใจไว้เดิมทันที แล้วเร่งประมวลผล order ที่ตกค้างเป็นพิเศษเพื่อให้ทันรอบ shipping ถัดไป",
      followup:
        "เพิ่มขั้นตอนยืนยันคืนค่า config หลังการทดสอบทุกครั้งเป็นส่วนหนึ่งของ {{ref:convention:code-review-checklist}} สำหรับการเปลี่ยน config ที่กระทบ throttling",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/WARE-204-pick-retry-backoff`, `fix/WARE-211-charging-deadlock`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(charging-station-manager): กัน deadlock ตอนคิวว่าง`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ state ของหุ่นยนต์หรือ task ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:duplicate-task-assignment-bug}}) และการเปลี่ยน config ค่าที่กระทบ threshold ต้องมีคนที่สองยืนยันก่อน merge" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `attemptPick`, `computeGripProfile` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ทางกายภาพ", body: "`robotId` รูปแบบ `R-<4 หลัก>`, `binId` รูปแบบ `<zone>-<aisle>-<shelf>` เช่น `B-14-3` ต้องตรงกับ physical label บนคลังจริงเสมอ" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ task ต้องมี `taskId` เสมอ เพื่อไล่ log ข้าม service ได้ (task-scheduler → picking-engine → fleet-controller) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "`fault` ของหุ่นยนต์ log เป็น `error` เสมอแม้จะเป็น `warning` level ทางธุรกิจ เพราะทีม on-call ต้อง grep เจอง่ายตอน incident" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`WARE_<DOMAIN>_<REASON>` เช่น `WARE_PICK_NOT_FOUND`, `WARE_CHARGE_STATION_BUSY` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`WARE_FLEET_OFFLINE`, `WARE_TASK_STUCK`, `WARE_SAFETY_ZONE_BLOCKED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "simulation"],
      sections: [
        { heading: "Simulation ก่อนขึ้นจริง", body: "logic ที่กระทบการเคลื่อนไหวจริงของหุ่นยนต์ต้องผ่าน simulation test ครบทุก zone assignment ก่อน merge เสมอ — บทเรียนจาก {{ref:incident:firmware-misroute-bug}} คือ simulation ที่ไม่ครอบคลุม config จริงเจอ bug ไม่ทัน" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะ task assignment ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ" },
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
      slug: "robot-telemetry-convention",
      title: "Robot Telemetry Convention",
      tags: ["telemetry", "fleet"],
      intro: "หุ่นยนต์ทุกตัวส่ง telemetry เข้า {{ref:module:fleet-controller}} ทุก `FLEET_HEARTBEAT_INTERVAL_MS` — เอกสารนี้กำหนดหน่วยและชื่อ field ที่ต้องใช้ตรงกันทุกรุ่นฮาร์ดแวร์",
      sections: [
        { heading: "หน่วยที่ใช้", body: "แบตเตอรี่เป็นเปอร์เซ็นต์จำนวนเต็ม (`batteryPct`), ตำแหน่งเป็นเมตรจาก origin ของแต่ละโซน, แรงกดของแขนหยิบเป็นนิวตัน (N) เสมอ ห้ามส่งหน่วยอื่นปนแม้ฮาร์ดแวร์รุ่นเก่าจะวัดเป็นหน่วยอื่นภายในก็ต้องแปลงก่อนส่ง" },
        { heading: "field ที่ห้ามขาด", body: "`robotId`, `timestamp`, `batteryPct`, `zoneId` ต้องมีทุก payload — ขาดตัวใดตัวหนึ่ง fleet-controller จะปฏิเสธ telemetry นั้นทันทีแทนที่จะเดาค่า default" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → simulation test (สำหรับ service ที่แตะการเคลื่อนไหวหุ่นยนต์) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งฟลีท" },
        { heading: "Gate พิเศษ", body: "{{ref:module:picking-engine}} และ {{ref:module:safety-zone-monitor}} ต้องผ่าน simulation test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความปลอดภัยโดยตรง" },
      ],
    },
    {
      slug: "heartbeat-timeout-tuning",
      title: "Heartbeat & Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (heartbeat/network) เท่านั้น ไม่ใช่ business timeout ของ pick task — ดูเรื่องนั้นที่ {{ref:policy:task-timeout-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| Robot heartbeat interval | 2s | env `FLEET_HEARTBEAT_INTERVAL_MS` |\n| Offline threshold | 5 missed beats (~10s) | env `FLEET_OFFLINE_THRESHOLD_BEATS` |\n| Fleet-controller → robot command ack | 500ms | firmware config |\n| API gateway → task-scheduler | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนพฤษภาคม 2026 พบว่า offline threshold สั้นเกินไปช่วง WiFi congestion สูงตอน peak window ทำให้หุ่นยนต์ถูก mark offline ทั้งที่ยังทำงานปกติ ขยับ threshold จาก 3 เป็น 5 beats แก้ปัญหาได้" },
      ],
    },
    {
      slug: "warehouse-map-migration-runbook",
      title: "Warehouse Map Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อคลังปรับผังชั้นวางใหม่ (เพิ่ม/ย้าย aisle) ต้อง migrate ข้อมูล bin mapping ทั้งหมดใน {{ref:module:inventory-sync}} และแผนที่เส้นทางของ {{ref:module:fleet-controller}} พร้อมกัน" },
        { heading: "ขั้นตอน", body: "1) หยุดรับ task ใหม่ชั่วคราว 2) export mapping เดิมสำรองไว้ 3) import ผังใหม่ 4) รันหุ่นยนต์ทดสอบเส้นทางในโซนที่เปลี่ยน 3-5 รอบก่อนเปิดรับงานจริง" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = หยุดทั้งฟลีทหรือกระทบความปลอดภัย, Sev2 = กระทบบางโซน/บาง service, Sev3 = กระทบเล็กน้อยไม่ถึงลูกค้าปลายทาง" },
        { heading: "กรณี near-miss ด้านความปลอดภัย", body: "ทุกเหตุการณ์ที่เกี่ยวกับ {{ref:module:safety-zone-monitor}} แม้จะไม่มีใครบาดเจ็บจริง ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "queue depth ของ {{ref:module:task-scheduler}} เกิน 80% ของ `TASK_QUEUE_MAX_DEPTH`, robot fault rate เกิน 5 ตัวใน 10 นาที, charging session ค้างสถานะ `docked` เกิน 30 นาทีโดย battery% ไม่เปลี่ยน" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ pick success rate ตกต่ำกว่า 90% หรือมี safety-related fault เพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:charging-queue-deadlock}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip ขั้นตอน smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| task-scheduler | 2 | 8 | queue depth > 300 |\n| inventory-sync | 1 | 4 | CPU > 70% |\n| picking-engine | 2 | 6 | CPU > 60% (เข้มกว่าที่อื่นเพราะ latency-sensitive) |" },
        { heading: "ข้อจำกัดทางกายภาพ", body: "จำนวนหุ่นยนต์จริงและหัวชาร์จ scale ไม่ได้แบบซอฟต์แวร์ — ช่วง peak window การ scale software service เร็วขึ้นช่วยได้แค่ระดับ queue processing ไม่ได้เพิ่มกำลังการหยิบจริง ดู {{ref:policy:peak-hour-throttling-policy}} สำหรับข้อจำกัดนี้" },
      ],
    },
    {
      slug: "fleet-firmware-deployment-runbook",
      title: "Fleet Firmware Deployment Runbook",
      tags: ["firmware", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ rollout firmware ตามที่กำหนดไว้ใน {{ref:policy:firmware-rollout-policy}}",
      sections: [
        { heading: "ก่อน rollout", body: "ต้องผ่าน simulation test ครบตาม {{ref:convention:testing-convention}} และเลือกหุ่นยนต์กลุ่มแรกจากโซนที่ไม่ใช่ peak zone เท่านั้น" },
        { heading: "ระหว่างเฝ้าระวัง 24 ชั่วโมง", body: "เฝ้าดู fault rate, pick success rate, และ battery consumption ของกลุ่มที่อัปเดตเทียบกับกลุ่มที่ยังไม่อัปเดต ถ้าตัวเลขต่างกันเกิน 5% ให้หยุดขยาย rollout ทันที" },
      ],
    },
  ],
};
