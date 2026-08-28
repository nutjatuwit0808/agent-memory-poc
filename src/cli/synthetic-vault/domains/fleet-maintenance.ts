import type { DomainProfile } from "../types.js";

// WrenchHub — ระบบบริหารการบำรุงรักษายานพาหนะ
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const fleetMaintenance: DomainProfile = {
  id: "fleet-maintenance",
  displayName: "WrenchHub — ระบบบำรุงรักษาฝูงรถขนส่ง",
  summary: [
    "WrenchHub คือแพลตฟอร์มบริหารการบำรุงรักษายานพาหนะของบริษัทโลจิสติกส์ กำหนดตารางบำรุงรักษาเชิงป้องกันตามระยะทางและเวลา สร้างและจัดการ work order สำหรับการซ่อม ติดตามสต็อกอะไหล่พร้อม reorder point จดบันทึกผลการตรวจสภาพรถ และติดตาม downtime ของยานพาหนะแต่ละคัน",
    "ระบบแบ่งออกเป็น service ย่อยตามหน้าที่หลัก ตั้งแต่วางแผนการบำรุงรักษา จัดการ work order ดูแลคลังอะไหล่ บันทึกผลตรวจ ติดตามเวลารถหยุดทำงาน และสั่งซื้ออะไหล่เมื่อสต็อกต่ำ ทีมช่างเรียกช่วง 07:00-09:00 ว่า morning dispatch window เพราะเป็นช่วงที่รถออกจากอู่และทีมต้องยืนยันสภาพก่อนปล่อยรถ",
  ],
  domainTags: ["fleet-maintenance", "wrenchhub"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:maintenance-scheduler}} เป็นเจ้าของตารางนัดบำรุงรักษาทั้งหมด ส่วน {{ref:module:work-order-manager}} เป็นเจ้าของ work order และไม่รู้ schedule detail ของ scheduler โดยตรง",
    "{{ref:module:downtime-tracker}} เป็น service เดียวที่เชื่อมข้อมูลจาก {{ref:module:work-order-manager}} และ {{ref:module:inspection-recorder}} เข้าด้วยกันเพื่อคำนวณ downtime จริง เหตุผลที่รวมการคำนวณไว้ที่จุดเดียวเพื่อให้ตัวเลขที่รายงานต่อ management มีแหล่งที่มาเดียวกันเสมอ",
  ],
  apiGatewayNote: [
    "คำสั่งจาก Fleet Management System (FMS) ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง vehicle service request เป็น work order แล้วส่งต่อให้ {{ref:module:work-order-manager}} คำขอที่ต้องการสถานะ work order ปัจจุบันใช้ synchronous call ผ่าน gateway ตัวนี้",
    "การแจ้งเตือน downtime เกิน SLA ไม่ผ่าน gateway เดียวกัน — ใช้ push notification channel แยกที่ {{ref:module:downtime-tracker}} ควบคุมโดยตรง เพื่อให้การแจ้งเตือนถึงผู้จัดการฝ่ายปฏิบัติการได้เร็วที่สุดโดยไม่ถูก throttle จาก gateway กลาง",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:maintenance-scheduler}} ดูแล ได้แก่ `vehicles` (ทะเบียนและ odometer ปัจจุบัน), `maintenance_schedules` (กำหนดการบำรุงตามระยะทาง/เวลา), และ `maintenance_triggers`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `vehicles` | maintenance-scheduler | odometer อัปเดตทุกครั้งที่รถกลับอู่ |\n| `work_orders` | work-order-manager | สถานะ open/in-progress/closed |\n| `parts_stock` | parts-inventory | ปริมาณปัจจุบันและ reorder point |\n| `inspection_records` | inspection-recorder | ผลตรวจแต่ละครั้ง linked กับ vehicle_id |\n| `downtime_events` | downtime-tracker | start/end timestamp พร้อม cause code |",
    "ทุกตารางใช้ `vehicle_id` เป็น foreign key ร่วมกันแบบ soft reference ไม่มี FK constraint ข้าม database จริง ตรวจสอบความสอดคล้องด้วย reconciliation job รายสัปดาห์",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `maintenance.due`, `workorder.opened`, `workorder.closed`, `parts.consumed`, `vehicle.breakdown`, `stock.below_reorder_point` — {{ref:module:maintenance-scheduler}} publish `maintenance.due` และ {{ref:module:work-order-manager}} subscribe เพื่อสร้าง work order อัตโนมัติ",
    "{{ref:module:reorder-trigger}} subscribe `stock.below_reorder_point` จาก {{ref:module:parts-inventory}} โดยตรง ออกแบบแบบนี้เพื่อให้การสั่งอะไหล่ทำงานได้แม้ work-order-manager จะล่มชั่วคราว เพราะ inventory ต้อง replenish ได้โดยอิสระ",
  ],
  modules: [
    {
      slug: "maintenance-scheduler",
      name: "maintenance-scheduler",
      tags: ["scheduling", "module", "core"],
      description:
        "คำนวณว่า vehicle คันไหนถึงกำหนดบำรุงรักษาเมื่อไหร่ โดยใช้ทั้ง odometer-based trigger (ทุก N กม.) และ time-based trigger (ทุก N วัน) แล้วแต่เงื่อนไขไหนถึงก่อน แยกออกมาเป็น service เดียวกันเพราะ logic การคำนวณ trigger มีความซับซ้อนของตัวเองและต้องการ historical odometer data ที่เก็บแยกต่างหาก",
      functions: [
        { sig: "checkDueVehicles(): Promise<MaintenanceDue[]>", desc: "ตรวจรายการ vehicle ที่ถึงกำหนดบำรุงรักษาจาก odometer และ last-service date" },
        { sig: "updateOdometer(vehicleId: string, currentKm: number, recordedAt: string): Promise<void>", desc: "อัปเดต odometer ของรถเมื่อกลับอู่ ตรวจ plausibility ก่อนบันทึก" },
        { sig: "scheduleNextService(vehicleId: string, serviceType: ServiceType): Promise<ServiceSchedule>", desc: "คำนวณวัน/ระยะทางของบำรุงรักษารอบถัดไปหลังทำเสร็จ" },
        { sig: "getDueNotifications(lookaheadDays: number): Promise<VehicleDueNotice[]>", desc: "ดึงรายการรถที่ใกล้ถึงกำหนดตาม lookahead window เพื่อแจ้งล่วงหน้า" },
      ],
      stateFlow: "vehicle: active → due (ถึงกำหนดบำรุง) → in_service (รับ work order แล้ว) → active (หลังเสร็จและ schedule ถัดไปคำนวณแล้ว) | decommissioned (terminal)",
      relatedNotes:
        "ไม่รู้จัก work order เลย — หลังพบว่าถึงกำหนด จะ publish `maintenance.due` event ให้ {{ref:module:work-order-manager}} สร้าง work order เอง เหตุผลที่แยก เพราะ scheduler ต้องทำงานต่อแม้ work-order-manager จะยุ่งหรือล่ม ดู {{ref:policy:preventive-maintenance-interval-policy}}",
      internals: {
        constants: [
          { name: "ODOMETER_PLAUSIBILITY_MAX_JUMP_KM", value: "1000" },
          { name: "MAINTENANCE_DUE_LOOKAHEAD_DAYS", value: "7" },
          { name: "MIN_INTERVAL_KM_BETWEEN_CHECKS", value: "500" },
        ],
        typeSnippet:
          "interface MaintenanceDue {\n  vehicleId: string;\n  serviceType: \"preventive\" | \"scheduled_inspection\" | \"annual\";\n  triggerReason: \"odometer\" | \"time\" | \"both\";\n  daysOverdue: number;\n  kmOverdue: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:preventive-maintenance-interval-policy}}",
      },
    },
    {
      slug: "work-order-manager",
      name: "work-order-manager",
      tags: ["work-order", "module", "core"],
      description:
        "สร้างและจัดการ work order สำหรับทั้งการซ่อมฉุกเฉินและการบำรุงรักษาตามแผน บันทึก parts ที่ใช้ไปใน work order แต่ละใบ และส่ง event เมื่อ work order ปิดเพื่อให้ service อื่นรับรู้ แยกออกมาเพราะ work order lifecycle มีหลาย state และหลาย actor ที่เกี่ยวข้อง",
      functions: [
        { sig: "createWorkOrder(vehicleId: string, type: WorkOrderType, priority: Priority, description: string): Promise<WorkOrderId>", desc: "สร้าง work order ใหม่ คืน ID" },
        { sig: "assignTechnician(workOrderId: string, technicianId: string): Promise<void>", desc: "มอบหมายช่างให้ work order ตรวจ certification ของช่างก่อนมอบหมาย" },
        { sig: "recordPartsUsed(workOrderId: string, parts: PartUsage[]): Promise<void>", desc: "บันทึก parts ที่ใช้ไป trigger deduction ใน {{ref:module:parts-inventory}} พร้อมกัน" },
        { sig: "closeWorkOrder(workOrderId: string, closedBy: string, notes: string): Promise<void>", desc: "ปิด work order ตรวจว่า parts บันทึกครบก่อนปิด ดู {{ref:policy:work-order-priority-escalation-policy}}" },
      ],
      stateFlow: "open → assigned → in_progress → pending_parts (รอ parts) | done → closed — escalated สามารถเกิดได้จากทุก state ถ้าเกิน SLA ดู {{ref:policy:work-order-priority-escalation-policy}}",
      relatedNotes:
        "{{ref:module:downtime-tracker}} subscribe `workorder.opened` และ `workorder.closed` เพื่อคำนวณ downtime duration โดยอัตโนมัติ work-order-manager ไม่รู้ว่า downtime clock ทำงานอยู่หรือเปล่า",
      internals: {
        constants: [
          { name: "WORK_ORDER_ESCALATION_THRESHOLD_HOURS", value: "24" },
          { name: "MAX_PARTS_LINE_ITEMS_PER_WO", value: "100" },
          { name: "PARTS_RECONCILIATION_WINDOW_MIN", value: "15" },
        ],
        typeSnippet:
          "interface WorkOrder {\n  workOrderId: string;\n  vehicleId: string;\n  type: \"preventive\" | \"corrective\" | \"inspection\";\n  priority: \"low\" | \"normal\" | \"high\" | \"critical\";\n  status: \"open\" | \"assigned\" | \"in_progress\" | \"pending_parts\" | \"done\" | \"closed\" | \"escalated\";\n  technicianId?: string;\n  partsUsed: PartUsage[];\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง escalation ที่ {{ref:policy:work-order-priority-escalation-policy}}",
      },
    },
    {
      slug: "parts-inventory",
      name: "parts-inventory",
      tags: ["inventory", "parts", "module", "core"],
      description:
        "ติดตามปริมาณอะไหล่คงเหลือในคลัง บันทึก reorder point ต่อ part และ publish event เมื่อสต็อกต่ำกว่า threshold แยกออกมาเป็น service อิสระเพราะการจัดการ inventory มีความซับซ้อนของตัวเองเรื่อง concurrent update จากหลาย work order พร้อมกัน",
      functions: [
        { sig: "deductStock(partId: string, quantity: number, workOrderId: string): Promise<StockLevel>", desc: "หักสต็อกพร้อม work order reference ใช้ optimistic lock กัน concurrent deduction" },
        { sig: "receiveStock(partId: string, quantity: number, purchaseOrderId: string): Promise<StockLevel>", desc: "รับสต็อกจาก purchase order เพิ่มปริมาณคงเหลือ" },
        { sig: "getStockLevel(partId: string): Promise<StockLevel>", desc: "คืนปริมาณคงเหลือปัจจุบันและ reorder point ของ part นั้น" },
        { sig: "reserveStock(partId: string, quantity: number, workOrderId: string): Promise<ReservationId>", desc: "จองสต็อกล่วงหน้าก่อน work order จะใช้จริง ดู {{ref:policy:parts-minimum-stock-policy}}" },
      ],
      stateFlow: "part: stocked (ปกติ) → reserved (มีการจอง) → consumed (ถูกใช้ไปแล้ว) | below_reorder (ต้องสั่งซื้อ) | out_of_stock (หมด)",
      relatedNotes:
        "{{ref:module:reorder-trigger}} subscribe event `stock.below_reorder_point` จาก service นี้โดยตรง ไม่ต้องให้ {{ref:module:work-order-manager}} เป็นตัวกลาง เพราะ reorder ต้องทำงานได้แม้ work order system จะ busy",
      internals: {
        constants: [
          { name: "STOCK_OPTIMISTIC_LOCK_RETRY_MAX", value: "3" },
          { name: "RESERVATION_EXPIRY_HOURS", value: "48" },
          { name: "BELOW_REORDER_ALERT_MULTIPLIER", value: "1.2" },
        ],
        typeSnippet:
          "interface StockLevel {\n  partId: string;\n  available: number;\n  reserved: number;\n  reorderPoint: number;\n  reorderQty: number;\n  lastUpdated: string;  // ISO 8601\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule ของสต็อกขั้นต่ำที่ {{ref:policy:parts-minimum-stock-policy}}",
      },
    },
    {
      slug: "inspection-recorder",
      name: "inspection-recorder",
      tags: ["inspection", "module"],
      description:
        "บันทึกผลการตรวจสภาพยานพาหนะก่อนออกและหลังกลับอู่ ตรวจสอบว่า checklist ที่ใช้ตรงกับ vehicle type และเวอร์ชันล่าสุดก่อนบันทึก ผลการตรวจเป็นข้อมูลอินพุตให้ {{ref:module:downtime-tracker}} และ {{ref:module:maintenance-scheduler}} ดู",
      functions: [
        { sig: "recordInspection(vehicleId: string, inspectorId: string, checklistVersion: string, items: ChecklistItem[]): Promise<InspectionId>", desc: "บันทึกผลตรวจครบ checklist ตรวจ vehicle_id และ checklist version ก่อนบันทึก" },
        { sig: "getActiveChecklistVersion(vehicleType: string): string", desc: "คืน checklist version ล่าสุดที่ active สำหรับ vehicle type นั้น ดู {{ref:policy:inspection-checklist-version-policy}}" },
        { sig: "getInspectionHistory(vehicleId: string, fromDate: string): Promise<Inspection[]>", desc: "ดูประวัติการตรวจของรถคันนั้นย้อนหลัง" },
        { sig: "flagFailedItem(inspectionId: string, itemId: string, severity: FailSeverity): Promise<void>", desc: "flag รายการตรวจที่ไม่ผ่าน พร้อมระดับความรุนแรง" },
      ],
      relatedNotes:
        "inspection ที่มี item ล้มเหลวระดับ `critical` จะ trigger สร้าง work order อัตโนมัติผ่าน {{ref:module:work-order-manager}} โดย inspection-recorder ไม่รู้ว่า work order ถูกสร้างหรือยัง — แค่ publish event `inspection.critical_item_failed` แล้วให้ work-order-manager จัดการ",
    },
    {
      slug: "downtime-tracker",
      name: "downtime-tracker",
      tags: ["downtime", "module"],
      description:
        "นับเวลาที่รถไม่สามารถใช้งานได้ตาม SLA ที่ตกลงไว้กับลูกค้า ติดตาม downtime event ตั้งแต่เริ่มจนสิ้นสุด คำนวณ downtime accumulated และแจ้งเตือนเมื่อใกล้เกิน threshold แยกออกมาเพราะการวัด downtime ต้องการ timestamp ที่แม่นยำและต้องเชื่อมหลาย event source เข้าด้วยกัน",
      functions: [
        { sig: "startDowntime(vehicleId: string, reason: DowntimeReason, startedAt: string): Promise<DowntimeEventId>", desc: "เริ่มนับ downtime clock สำหรับรถคันนั้น" },
        { sig: "endDowntime(eventId: string, endedAt: string, resolution: string): Promise<DowntimeDuration>", desc: "หยุดนับและบันทึก total downtime duration" },
        { sig: "getVehicleDowntimeSummary(vehicleId: string, periodDays: number): Promise<DowntimeSummary>", desc: "รายงาน downtime รวมของรถในช่วงเวลาที่กำหนด" },
        { sig: "checkSlaBreachRisk(vehicleId: string): Promise<SlaStatus>", desc: "ตรวจว่ารถคันนั้นใกล้เกิน downtime SLA ที่ตกลงไว้หรือไม่ ดู {{ref:policy:downtime-sla-threshold-policy}}" },
      ],
      relatedNotes:
        "subscribe `workorder.opened` และ `vehicle.breakdown` เพื่อเริ่มนับ downtime อัตโนมัติ แต่ถ้า event ไม่ส่งมา (เช่นรถเสียกลางทาง) ช่างสามารถ call `startDowntime` ด้วยมือพร้อมระบุ `startedAt` ย้อนหลังได้ ดู {{ref:policy:downtime-sla-threshold-policy}}",
    },
    {
      slug: "reorder-trigger",
      name: "reorder-trigger",
      tags: ["reorder", "procurement", "module"],
      description:
        "รับ event เมื่อสต็อกอะไหล่ต่ำกว่า reorder point แล้วสร้าง purchase request ไปยังระบบจัดซื้อ ตรวจสอบก่อนว่ามี purchase request ค้างอยู่สำหรับ part นั้นแล้วหรือไม่ เพื่อกัน duplicate order แยกออกมาเพราะ procurement logic มีขั้นตอนการอนุมัติ vendor และ lead time ของตัวเอง",
      functions: [
        { sig: "checkAndTriggerReorder(partId: string, currentStock: number): Promise<PurchaseRequestId | null>", desc: "ตรวจสต็อกและสร้าง purchase request ถ้าต่ำกว่า reorder point และยังไม่มี request ค้างอยู่" },
        { sig: "approvePurchaseRequest(requestId: string, approvedBy: string, vendorId: string): Promise<void>", desc: "อนุมัติ purchase request และเลือก vendor ดู {{ref:policy:vendor-approval-non-stocked-parts-policy}}" },
        { sig: "recordDeliveryExpected(requestId: string, expectedDate: string): Promise<void>", desc: "บันทึกวันที่คาดว่าของจะมาถึง ใช้แจ้งเตือนช่างถ้ายังต้องรอ" },
        { sig: "listPendingReorders(partIds?: string[]): Promise<PurchaseRequest[]>", desc: "ดู purchase request ที่ยังค้างอยู่ กรองตาม part ได้" },
      ],
      relatedNotes:
        "ตรวจสอบ pending request ก่อนสร้างใหม่เสมอเพื่อกัน duplicate ดู {{ref:incident:reorder-trigger-double-fire}} สำหรับกรณีที่เกิดขึ้นจริง parts ที่ต้องสั่งจาก vendor พิเศษต้องผ่านกระบวนการอนุมัติตาม {{ref:policy:vendor-approval-non-stocked-parts-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "maintenance-scheduler-service",
      vars: [
        { name: "SCHEDULER_DUE_LOOKAHEAD_DAYS", example: "7", note: "ดู {{ref:policy:preventive-maintenance-interval-policy}}" },
        { name: "SCHEDULER_ODOMETER_MAX_JUMP_KM", example: "1000", note: "odometer ที่กระโดดเกินนี้ถือว่า invalid ดู {{ref:incident:mileage-counter-reset-missed-maintenance}}" },
        { name: "SCHEDULER_DB_URL", example: "postgres://wrench-scheduler.internal:5432/schedules", note: "secret ห้าม log" },
      ],
    },
    {
      service: "work-order-manager-service",
      vars: [
        { name: "WO_ESCALATION_THRESHOLD_HOURS", example: "24", note: "ดู {{ref:policy:work-order-priority-escalation-policy}}" },
        { name: "WO_PARTS_RECONCILIATION_WINDOW_MIN", example: "15", note: "window ที่ยอมให้ parts deduction มาถึงช้าก่อน flag discrepancy" },
      ],
    },
    {
      service: "parts-inventory-service",
      vars: [
        { name: "PARTS_RESERVATION_EXPIRY_HOURS", example: "48", note: "reservation ที่ยังไม่ถูก consume จะหมดอายุและ return สต็อก" },
        { name: "PARTS_OPTIMISTIC_LOCK_RETRY", example: "3", note: "จำนวนครั้งที่ retry deduction เมื่อเจอ concurrent conflict" },
        { name: "PARTS_DB_URL", example: "postgres://wrench-parts.internal:5432/inventory", note: "secret ห้าม log" },
      ],
    },
    {
      service: "downtime-tracker-service",
      vars: [
        { name: "DOWNTIME_SLA_WARNING_PCT", example: "80", note: "แจ้งเตือนเมื่อ downtime ถึง % ของ SLA limit ดู {{ref:policy:downtime-sla-threshold-policy}}" },
        { name: "DOWNTIME_MAX_BACKDATE_HOURS", example: "4", note: "บันทึก startedAt ย้อนหลังได้สูงสุดกี่ชั่วโมง เพื่อกัน abuse" },
      ],
    },
  ],
  policies: [
    {
      slug: "preventive-maintenance-interval-policy",
      title: "นโยบายช่วงเวลาบำรุงรักษาเชิงป้องกัน",
      tags: ["maintenance", "interval", "policy"],
      isPrimary: true,
      intro: [
        "ยานพาหนะต้องเข้ารับการบำรุงรักษาเชิงป้องกันตามเงื่อนไขที่ถึงก่อน ระหว่าง odometer-based (ทุก N กม.) และ time-based (ทุก N วัน) ค่า N ของแต่ละประเภทยานพาหนะและประเภทการบำรุงรักษาเก็บไว้ใน service parameter ของ {{ref:module:maintenance-scheduler}}",
        "{{ref:module:maintenance-scheduler}} จะ flag ยานพาหนะว่า `due` เมื่อถึงกำหนดตามเงื่อนไขใดเงื่อนไขหนึ่ง และ publish event ให้ {{ref:module:work-order-manager}} สร้าง work order อัตโนมัติ ยานพาหนะที่ถูก flag แต่ยังไม่ได้รับ work order ภายใน 48 ชั่วโมงจะถูก escalate",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับยานพาหนะที่ใช้งานน้อยผิดปกติ",
        tags: ["maintenance", "interval", "edge-case"],
        body: [
          "ยานพาหนะที่วิ่งน้อยกว่า 500 กม. ต่อเดือนอย่างต่อเนื่อง (เช่น รถสำรองที่ไม่ค่อยได้ใช้) จะถูก cap ไว้ที่ time-based trigger เท่านั้น ไม่ต้องรอให้ odometer ครบ เพราะน้ำมันเครื่องและชิ้นส่วนยังเสื่อมสภาพตามเวลาแม้จะวิ่งน้อย",
          "กรณีนี้ระบบจะ override odometer trigger อัตโนมัติโดยไม่แจ้งผู้ใช้ แต่จะบันทึกใน maintenance history ว่า trigger มาจาก time-based แทน odometer เพื่อให้ audit trail ชัดเจน",
        ],
      },
    },
    {
      slug: "parts-minimum-stock-policy",
      title: "นโยบายสต็อกอะไหล่ขั้นต่ำ",
      tags: ["parts", "inventory", "policy"],
      isPrimary: true,
      intro: [
        "อะไหล่แต่ละชิ้นมี reorder point และ minimum stock level ที่ตั้งไว้ตาม lead time ของ vendor และ average consumption rate ของฝูงรถ {{ref:module:parts-inventory}} จะ publish event `stock.below_reorder_point` เมื่อสต็อกต่ำกว่า reorder point หลังจาก deduction แต่ละครั้ง",
        "สต็อกที่ต่ำกว่า minimum level (ซึ่งต่ำกว่า reorder point อีก) ถือว่า critical และ {{ref:module:reorder-trigger}} จะ escalate purchase request เป็น urgent ทันทีโดยไม่รอการอนุมัติปกติ",
      ],
      edgeCase: {
        title: "กรณีสต็อกติดลบจาก Concurrent Deduction",
        tags: ["parts", "inventory", "edge-case"],
        body: [
          "ถ้า work order หลาย ใบ deduct stock พร้อมกันและทำให้สต็อกติดลบ ระบบจะ allow การติดลบชั่วคราวเพื่อไม่ให้ block งานซ่อม แต่จะสร้าง emergency purchase request อัตโนมัติและแจ้ง Purchasing Manager ทันที",
          "สถานะ `negative_stock` ต้องถูก resolve ภายใน 2 วันทำการโดย Purchasing Manager ยืนยันว่ากำลังดำเนินการจัดหา ถ้าเกิน 2 วันโดยไม่มีการดำเนินการ ระบบจะ block work order ใหม่สำหรับ part นั้นจนกว่าจะ resolve",
        ],
      },
    },
    {
      slug: "work-order-priority-escalation-policy",
      title: "นโยบาย Escalation Priority ของ Work Order",
      tags: ["work-order", "escalation", "policy"],
      isPrimary: true,
      intro: [
        "work order ที่เปิดอยู่เกิน `WO_ESCALATION_THRESHOLD_HOURS` โดยไม่มีความคืบหน้า (ไม่มีการ assign ช่างหรือ update status) จะถูก escalate priority เป็น `high` อัตโนมัติและแจ้ง Fleet Manager",
        "work order priority `critical` ต้องมีช่างรับงานภายใน 2 ชั่วโมงและเริ่มดำเนินการภายใน 4 ชั่วโมง ถ้าเกินนี้จะ escalate ไปยัง Operations Director",
      ],
      sections: [
        {
          heading: "ทำไมไม่ escalate ทุก work order เป็น critical",
          body: "การ escalate มากเกินทำให้ Fleet Manager ชาชินและเริ่มเพิกเฉย ดู {{ref:incident:work-order-priority-manually-overridden}} สำหรับกรณีที่เกิดขึ้นเมื่อ escalation ถูก override บ่อยจนไม่มีความหมาย",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Work Order ที่รอ Parts จาก Vendor",
        tags: ["work-order", "escalation", "edge-case"],
        body: [
          "work order ที่อยู่ใน status `pending_parts` และมี purchase request ค้างอยู่จะถูกหยุดนับ escalation clock ชั่วคราว เพราะการ escalate work order ที่รอของอยู่ไม่ช่วยอะไร — Fleet Manager ต้องการรู้แค่ว่าของจะมาเมื่อไหร่",
          "ถ้า expected delivery date ของ purchase request เลยกำหนดไปแล้วโดยของยังไม่มา escalation clock จะกลับมาเดินใหม่และแจ้ง Fleet Manager พร้อมข้อมูล purchase request ที่ล่าช้า",
        ],
      },
    },
    {
      slug: "inspection-checklist-version-policy",
      title: "นโยบายเวอร์ชัน Inspection Checklist",
      tags: ["inspection", "checklist", "policy"],
      isPrimary: true,
      intro: [
        "การตรวจสภาพต้องใช้ checklist เวอร์ชันล่าสุดที่ active สำหรับ vehicle type นั้นเสมอ {{ref:module:inspection-recorder}} ตรวจสอบ version ที่ส่งมาก่อนบันทึกผลเสมอ ถ้า version ไม่ตรงจะ reject ทันทีพร้อมระบุ version ที่ถูกต้อง",
        "checklist version ใหม่จะ activate พร้อมกันทั้งฝูงรถในวันที่กำหนด ไม่มีการเปลี่ยนทีละคัน เพื่อให้เปรียบเทียบผลตรวจข้ามคันได้โดยใช้ checklist เดียวกัน",
      ],
      edgeCase: {
        title: "กรณี Checklist Version ถูก Rollback หลัง Activate ไปแล้ว",
        tags: ["inspection", "checklist", "edge-case"],
        body: [
          "ถ้า checklist version ใหม่มีปัญหาและต้อง rollback กลับ version เก่า การตรวจที่ทำด้วย version ใหม่ในช่วงที่ active จะ remain valid ไม่ต้องตรวจซ้ำ เพราะ checklist ใหม่มักเพิ่มรายการตรวจ (ไม่ใช่ลด) ทำให้การตรวจด้วย version ใหม่ครอบคลุมมากกว่า",
          "ยกเว้นกรณีที่ rollback เกิดจากพบว่า checklist version ใหม่มี item ที่ผิดพลาดในแง่ safety-critical — กรณีนี้ Fleet Safety Officer ต้องตัดสินใจว่าจะ re-inspect รถที่ตรวจด้วย version ผิดหรือไม่ ไม่มีการตัดสินใจอัตโนมัติ",
        ],
      },
    },
    {
      slug: "downtime-sla-threshold-policy",
      title: "นโยบาย SLA Threshold ของ Vehicle Downtime",
      tags: ["downtime", "sla", "policy"],
      isPrimary: true,
      intro: [
        "ยานพาหนะแต่ละคันมี downtime SLA ที่ตกลงไว้กับลูกค้าที่เช่าหรือใช้งาน โดยทั่วไปไม่เกิน X ชั่วโมงต่อเดือน {{ref:module:downtime-tracker}} แจ้งเตือนเมื่อ downtime accumulated ถึง `DOWNTIME_SLA_WARNING_PCT`% ของ SLA limit เพื่อให้ Fleet Manager รับทราบก่อนเกิน",
        "เมื่อ downtime เกิน SLA จริง ระบบจะแจ้ง Fleet Manager และ Account Manager ที่รับผิดชอบลูกค้ารายนั้นพร้อมกัน เพื่อให้ประสานงานกับลูกค้าและจัดรถสำรองได้ทันท่วงที",
      ],
      edgeCase: {
        title: "กรณี Downtime เกิดระหว่าง Planned Maintenance Window",
        tags: ["downtime", "sla", "edge-case"],
        body: [
          "downtime ที่เกิดระหว่าง planned maintenance window ที่ตกลงไว้กับลูกค้าล่วงหน้าจะไม่นับเข้า SLA แต่ต้องแจ้ง window ให้ลูกค้าทราบล่วงหน้าอย่างน้อย 48 ชั่วโมงและได้รับการยืนยันก่อน ถ้าไม่มีการยืนยัน ยังคง count เข้า SLA ตามปกติ",
          "ถ้า vehicle เสียหายระหว่าง planned maintenance window (เช่น ช่างพบปัญหาใหม่ระหว่างซ่อม) เวลาที่เกินจาก planned window จะนับเข้า SLA ส่วน Fleet Manager ต้องแจ้งลูกค้าถึงสาเหตุและ ETA ใหม่ทันที",
        ],
      },
    },
    {
      slug: "vendor-approval-non-stocked-parts-policy",
      title: "นโยบายการอนุมัติ Vendor สำหรับอะไหล่นอกสต็อก",
      tags: ["vendor", "procurement", "policy"],
      isPrimary: true,
      intro: [
        "อะไหล่ที่ไม่อยู่ใน approved vendor list ต้องผ่านการอนุมัติจาก Purchasing Manager ก่อนสั่งซื้อ {{ref:module:reorder-trigger}} จะ hold purchase request และแจ้งให้อนุมัติ vendor ก่อนดำเนินการ เพื่อป้องกันการใช้อะไหล่ที่ไม่ผ่านมาตรฐาน",
        "vendor ที่ approved แล้วสำหรับ part type หนึ่งไม่ได้ approved อัตโนมัติสำหรับ part type อื่น — approval ผูกกับ part category ไม่ใช่ vendor ทั้งหมด",
      ],
      edgeCase: {
        title: "กรณีฉุกเฉินที่ต้องซื้ออะไหล่จาก Vendor ที่ยังไม่ Approved",
        tags: ["vendor", "procurement", "edge-case"],
        body: [
          "ถ้า vehicle breakdown กระทบ delivery SLA และอะไหล่ที่ต้องการไม่มีใน approved vendor list Operations Director สามารถออก emergency override เพื่อ approve vendor ชั่วคราวสำหรับ part นั้นครั้งเดียว โดยต้องบันทึกเหตุผลในระบบ",
          "vendor ที่ได้รับ emergency approval จะถูกเพิ่มเข้า watchlist เพื่อให้ Purchasing Manager ประเมินว่าควร approve เป็น permanent หรือไม่ภายใน 30 วัน ถ้าไม่ดำเนินการภายใน 30 วัน จะถูก remove ออกจาก watchlist และ emergency approval ครั้งนั้นถือเป็น one-off",
        ],
      },
    },
    {
      slug: "vehicle-decommission-policy",
      title: "นโยบายการปลดระวางยานพาหนะ",
      tags: ["vehicle", "lifecycle", "policy"],
      isPrimary: false,
      intro: [
        "ยานพาหนะที่มี cumulative repair cost เกิน 70% ของมูลค่ารถใหม่ภายในปีเดียว หรืออายุการใช้งานเกินเกณฑ์ที่กำหนดตาม vehicle type จะถูกเสนอเข้ากระบวนการปลดระวาง โดย Fleet Manager เป็นผู้อนุมัติสุดท้าย",
        "ก่อนปลดระวาง ต้องยืนยันว่า work order ที่ค้างอยู่กับรถคันนั้นทั้งหมดถูกปิดหรือโอนให้รถคันอื่นเสมอ",
      ],
    },
    {
      slug: "warranty-claim-policy",
      title: "นโยบายการเคลม Warranty อะไหล่",
      tags: ["warranty", "parts", "policy"],
      isPrimary: false,
      intro: [
        "อะไหล่ที่เสียภายในระยะ warranty ที่ vendor รับประกัน สามารถขอเคลมคืนได้โดย {{ref:module:work-order-manager}} ต้องมี work order ID ที่บันทึกการติดตั้ง parts นั้นและ parts batch number ครบถ้วน",
        "การเคลมต้องทำภายใน 14 วันหลังพบข้อบกพร่อง เกินนี้ warranty void โดยอัตโนมัติ ยกเว้นกรณีที่ vendor ยินยอมขยายเวลาเป็นรายกรณี",
      ],
    },
    {
      slug: "parts-return-policy",
      title: "นโยบายการคืนอะไหล่ที่ไม่ได้ใช้",
      tags: ["parts", "return", "policy"],
      isPrimary: false,
      intro: [
        "อะไหล่ที่ reserve ไว้สำหรับ work order แต่ไม่ได้ถูกใช้จริงเมื่อ work order ปิด ต้องคืนสต็อกผ่าน `receiveStock` ภายใน `PARTS_RESERVATION_EXPIRY_HOURS` ชั่วโมง ไม่ใช่ปล่อยให้ reservation หมดอายุเอง เพราะ expiry mechanism ไม่ได้บันทึก audit trail",
        "อะไหล่ที่ถูกติดตั้งแล้วถอดออกจากรถ (เช่น อัปเกรดแล้วถอดของเดิมออก) ต้องบันทึก condition ก่อน return เข้า stock เพราะอาจนำ reconditioned parts ไปใช้กับรถคันอื่นได้",
      ],
    },
    {
      slug: "fleet-utilization-report-policy",
      title: "นโยบายรายงาน Fleet Utilization",
      tags: ["reporting", "utilization", "policy"],
      isPrimary: false,
      intro: [
        "รายงาน fleet utilization ต้องออกทุกต้นเดือนโดยใช้ข้อมูลจาก {{ref:module:downtime-tracker}} เป็นหลัก รายงานต้องแยก planned downtime (scheduled maintenance) ออกจาก unplanned downtime (breakdowns) เพราะส่งผลต่อ KPI คนละตัว",
        "รายงานที่มีตัวเลข downtime เกิน SLA ต้องแนบ root cause analysis และ corrective action plan ก่อนส่งให้ management เสมอ",
      ],
    },
    {
      slug: "technician-certification-policy",
      title: "นโยบายใบรับรองช่างซ่อม",
      tags: ["technician", "certification", "policy"],
      isPrimary: false,
      intro: [
        "ช่างต้องมีใบรับรองที่ valid สำหรับ vehicle type ที่จะซ่อมก่อนรับ work order ได้ {{ref:module:work-order-manager}} ตรวจ certification ของช่างก่อน assign เสมอ ถ้าไม่มี certification ที่ตรงจะ reject และแจ้งให้หา assign ช่างคนอื่น",
        "ใบรับรองที่หมดอายุภายใน 30 วันจะ flag ให้ Fleet Manager จัดการต่ออายุก่อนที่จะหมด เพื่อไม่ให้กระทบความสามารถรับงานของช่างคนนั้น",
      ],
    },
  ],
  incidents: [
    {
      slug: "mileage-counter-reset-missed-maintenance",
      title: "Odometer reset ทำให้พลาด maintenance trigger",
      tags: ["odometer", "maintenance", "missed"],
      summary:
        "ยานพาหนะ VH-0412 ไม่ได้รับ maintenance schedule ตามกำหนด ทีมซ่อมพบว่ารถเลยกำหนดบำรุงไปกว่า 8,000 กม.",
      investigation:
        "ตรวจ log {{ref:module:maintenance-scheduler}} พบว่า odometer ของ VH-0412 กระโดดจาก 87,000 กม. เป็น 1,200 กม. หลังการ update ครั้งหนึ่ง ทำให้ระบบคำนวณว่า trigger ครั้งถัดไปยังอีกนานมาก",
      cause:
        "ช่างที่บันทึก odometer กรอกตัวเลขผิด (กรอก current trip km แทน total odometer km) ระบบ validate แค่ว่าค่าใหม่ไม่น้อยกว่า 0 ไม่ได้ตรวจว่ากระโดดลงมากผิดปกติ ทั้งที่มี `ODOMETER_PLAUSIBILITY_MAX_JUMP_KM` ตั้งอยู่แต่ check ผิด direction",
      resolution:
        "แก้ odometer ด้วยมือโดย Fleet Manager หลังตรวจสอบประวัติใบเติมน้ำมัน และ schedule work order สำหรับ maintenance ที่ค้างทันที",
      followup:
        "แก้ plausibility check ใน `updateOdometer` ให้ flag ทั้ง jump ขึ้นมากผิดปกติ AND jump ลงมากผิดปกติ และ require Fleet Manager approve ก่อน accept ค่าที่ผิดปกติ",
    },
    {
      slug: "work-order-closed-without-parts-consumed",
      title: "Work order ปิดโดยไม่บันทึก parts ที่ใช้ไป",
      tags: ["work-order", "parts", "audit"],
      summary:
        "Parts inventory audit พบว่าสต็อกน้อยกว่าที่ควรจะเป็นสำหรับ filter หลายประเภท ทั้งที่ purchase order ครบถ้วน",
      investigation:
        "ตรวจ log {{ref:module:work-order-manager}} พบ work order หลายใบที่ปิดโดยไม่มี `recordPartsUsed` เลย ช่างปิด work order โดยตรงโดยบอกว่าจะกรอก parts ทีหลัง",
      cause:
        "`closeWorkOrder` ไม่ได้ validate ว่าต้องมี parts บันทึกก่อน — เป็น soft guideline ที่เขียนไว้ใน documentation เท่านั้น ไม่ใช่ system enforcement",
      resolution:
        "Audit และ reconstruct parts usage จากใบส่งของและ work order notes ย้อนหลัง 3 เดือน ปรับสต็อกให้ตรงกับความเป็นจริง",
      followup:
        "แก้ `closeWorkOrder` ให้ require อย่างน้อย 1 parts line item สำหรับ corrective work order (preventive maintenance ยังยกเว้นได้ถ้า parts ไม่ได้ถูกเปลี่ยน)",
    },
    {
      slug: "parts-stock-negative-concurrent-orders",
      title: "สต็อกอะไหล่ติดลบจาก work order หลายใบดึงพร้อมกัน",
      tags: ["parts", "inventory", "concurrent"],
      summary:
        "ช่าง 3 คนเปิด work order สำหรับ oil filter พร้อมกันในช่วงเช้า สต็อกที่เหลืออยู่ 2 ชิ้นถูกดึงไป 3 ชิ้นทำให้ parts-inventory แสดง -1",
      investigation:
        "ตรวจ `deductStock` ใน {{ref:module:parts-inventory}} พบว่า optimistic lock retry ทำงานถูกต้อง แต่ retry ครั้งที่ 3 ยังคง succeed แม้สต็อกจะเป็น 0 เพราะ condition check ผิด (ตรวจ >= 0 แทน > 0)",
      cause:
        "Bug ใน optimistic lock: condition ที่อนุญาตให้ deduct ควรเป็น `available >= quantity` แต่ถูกเขียนเป็น `available + quantity >= 0` ทำให้ deduct ได้แม้สต็อกจะไม่พอ",
      resolution:
        "แก้ condition ใน `deductStock` ทันที emergency purchase request สำหรับ oil filter และ notify ช่างทั้ง 3 ว่าของหนึ่งชิ้นจะล่าช้า",
      followup:
        "เพิ่ม integration test จำลอง concurrent deduction ให้ครอบคลุม edge case ที่ available = 0 ก่อน deduction",
    },
    {
      slug: "inspection-wrong-vehicle-id",
      title: "ผลการตรวจถูกบันทึกเข้ารถผิดคัน",
      tags: ["inspection", "vehicle-id", "error"],
      summary:
        "Fleet Manager พบว่า inspection record ของ VH-0301 มีผลดีผิดปกติสำหรับรถที่ทราบว่ามีปัญหาเรื่องยาง แต่ VH-0310 ซึ่งไม่มีประวัติปัญหา กลับมีผล inspection ที่ flag tire issue",
      investigation:
        "ตรวจ {{ref:module:inspection-recorder}} พบว่าช่างที่ตรวจ VH-0301 กรอก vehicle ID เป็น VH-0310 เพราะ label ป้ายทะเบียนที่หน้า inspection form อ่านยาก",
      cause:
        "ระบบรับ vehicle_id ที่ช่างกรอกมาโดยไม่ validate ว่า vehicle นั้นอยู่ใน active maintenance window ของวันนั้นหรือไม่ ทำให้ ID ที่กรอกผิดผ่านเข้ามาได้",
      resolution:
        "Swap inspection record ระหว่าง VH-0301 และ VH-0310 ด้วยมือ หลังตรวจสอบ vehicle physical ยืนยันว่าผลตรวจตรงกับรถคันไหน",
      followup:
        "เพิ่ม validation ใน `recordInspection` ว่า vehicle_id ที่ส่งมาต้องอยู่ใน scheduled inspection list ของวันนั้นหรือต้องมี Fleet Manager approve เป็น unscheduled inspection",
    },
    {
      slug: "downtime-clock-not-started",
      title: "Downtime clock ไม่เริ่มนับเมื่อรถเสียกลางทาง",
      tags: ["downtime", "sla", "missed"],
      summary:
        "ลูกค้าร้องเรียนว่า downtime report ที่รับไปแสดงว่ารถเสียแค่ 3 ชั่วโมง ทั้งที่จริงๆ รถค้างอยู่กลางทาง 7 ชั่วโมงก่อนช่างไปถึง",
      investigation:
        "ตรวจ {{ref:module:downtime-tracker}} พบว่า `startDowntime` ถูกเรียกหลังจาก work order ถูกสร้างและ assign ช่างแล้ว ไม่ใช่ตอนที่รถเสียจริง เพราะระบบ subscribe `workorder.opened` เป็น trigger",
      cause:
        "รถเสียกลางทางและคนขับโทรแจ้งศูนย์ด้วยวาจา ใช้เวลา 4 ชั่วโมงกว่าจะมีคนเปิด work order ในระบบ ช่วงนั้น downtime clock ยังไม่เดิน",
      resolution:
        "แก้ downtime record ด้วยมือโดย Fleet Manager ระบุ startedAt ย้อนหลังตามเวลาที่คนขับโทรแจ้ง",
      followup:
        "เปิด option ให้ Call Center บันทึก vehicle breakdown ได้โดยตรงผ่าน endpoint แยก ซึ่งจะ start downtime clock ทันที แม้ work order ยังไม่ถูกสร้าง",
    },
    {
      slug: "reorder-trigger-double-fire",
      title: "Reorder trigger สั่งซื้ออะไหล่ชิ้นเดียวกันสองรอบ",
      tags: ["reorder", "duplicate", "procurement"],
      summary:
        "Purchasing Manager พบ purchase request สองใบสำหรับ brake pad part ID BP-220 ที่ออกห่างกัน 10 นาทีในวันเดียวกัน ทั้งที่สต็อกต่ำกว่า reorder point เพียงครั้งเดียว",
      investigation:
        "ตรวจ {{ref:module:reorder-trigger}} พบว่า `stock.below_reorder_point` event ถูกส่งสองครั้งจาก {{ref:module:parts-inventory}} เพราะ work order สองใบ deduct stock ห่างกัน 10 นาทีและ deduction แรกทำให้สต็อกต่ำกว่า reorder point พอดี ส่วน deduction ที่สองก็ trigger event อีกครั้ง",
      cause:
        "reorder-trigger ตรวจ pending request ก่อนสร้างใหม่ แต่ query ใช้ read replica ที่ยังไม่เห็น request ชุดแรกเพราะ replication lag 15 วินาที",
      resolution:
        "ยกเลิก purchase request ซ้ำ แก้ `checkAndTriggerReorder` ให้ query pending request จาก primary database เสมอ",
      followup:
        "เพิ่ม idempotency key ในการสร้าง purchase request โดยใช้ `partId + date` เป็น key กัน duplicate แม้จะ query primary แล้ว",
    },
    {
      slug: "preventive-maintenance-overdue-unnoticed",
      title: "Maintenance overdue นานหลายสัปดาห์โดยไม่มีใครรู้",
      tags: ["maintenance", "overdue", "alert"],
      summary:
        "Fleet Safety Officer พบระหว่าง audit ว่า VH-0198 เลยกำหนดบำรุงรักษาไป 3 สัปดาห์โดยไม่มี work order ถูกสร้างและไม่มีใครได้รับ alert",
      investigation:
        "ตรวจ {{ref:module:maintenance-scheduler}} พบว่า `maintenance.due` event ถูก publish แต่ work-order-manager ไม่ได้รับเพราะ subscription ขาดหายช่วงนั้น ทีมตรวจสอบพบว่า consumer ของ event นั้น crash และ restart loop อยู่ 6 วัน",
      cause:
        "work-order-manager restart loop ทำให้ miss event ในช่วงที่ down และไม่มี dead-letter queue รองรับ event ที่ส่งไม่ถึง",
      resolution:
        "สร้าง work order ด้วยมือสำหรับ VH-0198 ทันที และแก้ consumer ให้ stable แล้วเพิ่ม dead-letter queue สำหรับ `maintenance.due`",
      followup:
        "เพิ่ม daily reconciliation job ตรวจว่า vehicle ที่ถูก flag `due` ทุกตัวมี active work order อยู่ภายใน 24 ชั่วโมง ถ้าไม่มีให้แจ้ง Fleet Manager โดยตรง",
    },
    {
      slug: "parts-reserved-never-consumed",
      title: "Parts ถูก reserve แต่ไม่ถูก consume เมื่อ work order ปิด",
      tags: ["parts", "reservation", "audit"],
      summary:
        "Parts audit พบ reservation หลายรายการที่หมดอายุโดยไม่มีการ consume หรือ explicit return ทำให้สต็อกที่แท้จริงต่ำกว่าที่ระบบแสดง",
      investigation:
        "ตรวจ {{ref:module:parts-inventory}} พบว่า reservation expiry mechanism คืนสต็อกกลับเมื่อหมดเวลา แต่ไม่ได้บันทึก audit trail ว่า expiry เกิดขึ้น ทำให้ไม่มีทางรู้ว่า parts ถูก reserve แต่ไม่ได้ใช้",
      cause:
        "การออกแบบ expiry ทำเป็น automatic silent cleanup ไม่มีการแจ้ง work-order-manager ว่า reservation ของ work order นั้นหมดอายุแล้ว",
      resolution:
        "เพิ่ม audit log ทุกครั้งที่ reservation expire และ notify work-order-manager เพื่อให้ reconcile ว่า work order นั้นได้ parts จากที่ไหน",
      followup:
        "ทบทวนว่า work order ที่ reservation expire แล้วควรถูก flag ให้ Fleet Manager review ว่า parts จริงๆ ถูกใช้ไปหรือไม่",
    },
    {
      slug: "inspection-checklist-wrong-version",
      title: "ช่างใช้ Checklist เวอร์ชันเก่าตรวจรถทั้งสัปดาห์",
      tags: ["inspection", "checklist", "version"],
      summary:
        "QA audit พบว่า inspection ของรถ 12 คันในสัปดาห์นั้นใช้ checklist version 2.1 ทั้งที่ version 2.2 activate แล้วตั้งแต่ต้นสัปดาห์",
      investigation:
        "ตรวจ {{ref:module:inspection-recorder}} พบว่า checklist app ที่ช่างใช้ cache version ไว้ใน device และไม่ได้ pull version ใหม่เพราะ offline ระหว่างเดินทาง และ `recordInspection` validate version เฉพาะ format ไม่ได้ validate ว่า version นั้น active อยู่จริง",
      cause:
        "checklist app ออกแบบให้ทำงาน offline ได้ แต่ไม่มี mechanism บังคับ sync version ก่อนเริ่มตรวจในแต่ละวัน และ server-side validation ไม่ reject version เก่า",
      resolution:
        "Re-inspect รถ 12 คันนั้นด้วย checklist version 2.2 เฉพาะ items ที่เป็น new/changed items ระหว่าง version ส่วน items เดิมที่ไม่เปลี่ยนยืนยัน valid โดยไม่ต้องตรวจซ้ำ",
      followup:
        "เพิ่ม server-side validation ใน `recordInspection` ให้ reject checklist version ที่ไม่ active และบังคับ app sync version ทุก morning dispatch",
    },
    {
      slug: "vehicle-breakdown-delivery-route",
      title: "รถเสียกลางเส้นทาง delivery และ downtime นับผิด",
      tags: ["downtime", "breakdown", "sla"],
      summary:
        "ลูกค้าแจ้งว่า delivery SLA miss เพราะรถเสียกลางทาง แต่ downtime report แสดงว่าเกิน SLA threshold เพียงเล็กน้อยซึ่งขัดกับที่คนขับรายงานว่ารอนานมาก",
      investigation:
        "ตรวจ {{ref:module:downtime-tracker}} พบว่า downtime event ถูก start จาก `workorder.opened` แต่ work order ถูกสร้างช้ากว่าที่รถเสียจริง 5 ชั่วโมงเพราะ supervisor ต้องอนุมัติ work order ก่อนสร้าง นโยบายภายในที่ไม่ได้บันทึกไว้ในระบบ",
      cause:
        "downtime tracking ออกแบบให้เริ่มจาก system event ไม่ใช่ physical event ทำให้ขึ้นอยู่กับความเร็วในการ create work order ซึ่งมีขั้นตอนอนุมัติที่ใช้เวลา",
      resolution:
        "แก้ downtime record ย้อนหลังโดย Fleet Manager และตกลงกับลูกค้าเรื่อง downtime จริง พิจารณา waive SLA penalty บางส่วน",
      followup:
        "ทบทวน approval process ของ work order สำหรับ breakdown เฉพาะกิจ เพื่อลด delay ระหว่าง breakdown จริงและ work order creation",
    },
    {
      slug: "reorder-lead-time-miscalculated",
      title: "Lead time ที่ตั้งผิดทำให้สต็อกหมดก่อนของมาถึง",
      tags: ["reorder", "lead-time", "stock-out"],
      summary:
        "สต็อก brake pad รุ่น BP-441 หมดกลางสัปดาห์ทั้งที่ purchase order ออกตามปกติ เพราะของมาถึงช้ากว่าที่คาดไว้ 5 วัน",
      investigation:
        "ตรวจ {{ref:module:reorder-trigger}} พบว่า lead time ของ vendor ที่ตั้งไว้คือ 7 วัน แต่ vendor รายนี้ใช้เวลา 12 วันในรอบ 3 เดือนที่ผ่านมา reorder point ถูกคำนวณจาก 7 วัน ทำให้ไม่เพียงพอ",
      cause:
        "lead time ใน {{ref:module:reorder-trigger}} ถูกตั้งด้วยมือโดย Purchasing Manager และไม่ได้อัปเดตหลัง vendor เปลี่ยน lead time เป็น 12 วันตั้งแต่ต้นปี",
      resolution:
        "Emergency purchase จาก vendor สำรอง และอัปเดต lead time ของ vendor หลักให้ถูกต้อง recalculate reorder point ใหม่",
      followup:
        "เพิ่ม monthly review ให้ Purchasing Manager ตรวจ actual vs configured lead time ของ vendor ทุกราย และ alert เมื่อ actual lead time เกิน configured เกิน 20%",
    },
    {
      slug: "work-order-priority-manually-overridden",
      title: "Fleet Manager override priority จนระบบ escalation ไม่มีความหมาย",
      tags: ["work-order", "escalation", "priority"],
      summary:
        "Operations review พบว่า escalation alert ถูก dismiss โดยไม่มีการดำเนินการ 80% ของกรณีในเดือนที่ผ่านมา เพราะ Fleet Manager override priority กลับเป็น low เป็นประจำ",
      investigation:
        "ตรวจ audit log ของ `closeWorkOrder` และ priority change log พบว่า Fleet Manager คนเดียวกันสั่ง override escalation alert 40 ครั้งในเดือนนั้นโดยไม่มีเหตุผลบันทึกในระบบ",
      cause:
        "ระบบให้ Fleet Manager override priority ได้โดยไม่ต้องใส่เหตุผลและไม่มี audit trail สำหรับ override ทำให้ไม่มีทาง track ว่าทำไมถึง override",
      resolution:
        "บังคับให้กรอกเหตุผลทุกครั้งที่ override escalation priority และ report override rate ในรายงาน monthly operations ให้ Operations Director เห็น",
      followup:
        "พิจารณาทบทวน escalation threshold และ definition ของ `critical` priority ว่าตั้งไว้เข้มเกินไปหรือไม่ถ้า override rate สูงต่อเนื่อง",
    },
    {
      slug: "odometer-gap-after-vehicle-swap",
      title: "Odometer gap หลังเปลี่ยนรถสำรอง ทำให้ maintenance trigger ผิด",
      tags: ["odometer", "vehicle-swap", "maintenance"],
      summary:
        "หลัง VH-0155 ถูกส่งซ่อมนอกสถานที่นาน 2 สัปดาห์และใช้ VH-0155B เป็นสำรอง maintenance schedule ของ VH-0155 ยังอ้างอิง odometer เดิมก่อน swap ทำให้ trigger ช้ากว่าความเป็นจริง",
      investigation:
        "ตรวจ {{ref:module:maintenance-scheduler}} พบว่า vehicle swap ไม่มี procedure ชัดเจนในระบบ ช่างบันทึก odometer ของ VH-0155B แยกกัน แต่ maintenance schedule ยังคิดว่า VH-0155 วิ่งน้อยกว่าความเป็นจริง",
      cause:
        "ไม่มี concept ของ vehicle swap ใน maintenance-scheduler — ถ้ารถหลักออกไปและมีสำรองมาแทน ระยะทางที่สำรองวิ่งไม่ถูก roll back มาที่รถหลักเมื่อกลับมา",
      resolution:
        "Fleet Manager adjust odometer ของ VH-0155 ด้วยมือให้รวมระยะที่ VH-0155B วิ่งแทน และ recalculate maintenance trigger",
      followup:
        "ออกแบบ vehicle swap procedure ใน {{ref:module:maintenance-scheduler}} ให้รองรับ temporary substitution และ merge odometer ได้เมื่อรถหลักกลับมา",
    },
    {
      slug: "vendor-substitution-not-approved",
      title: "ช่างใช้อะไหล่จาก vendor ที่ไม่ได้ approved โดยไม่แจ้ง",
      tags: ["vendor", "parts", "compliance"],
      summary:
        "Parts audit พบว่า brake component รุ่นหนึ่งใน stock มาจาก vendor ที่ไม่อยู่ใน approved list และถูก install ใน work order 5 ใบแล้ว",
      investigation:
        "ตรวจ purchase record พบว่า Purchasing Manager ซื้อจาก vendor ที่ไม่ approved โดยอ้างว่าได้รับ verbal approval จาก Operations Director ระหว่าง emergency ซึ่งไม่ได้บันทึกใน {{ref:module:reorder-trigger}}",
      cause:
        "emergency approval process ตาม {{ref:policy:vendor-approval-non-stocked-parts-policy}} ต้องบันทึกใน system แต่ Purchasing Manager ใช้ verbal approval แทนเพราะรู้สึกว่าระบบช้าเกินไปในสถานการณ์ฉุกเฉิน",
      resolution:
        "ถอด brake component ที่ install แล้วทั้ง 5 คัน และ inspect ว่า component เหล่านั้นมีมาตรฐานเพียงพอหรือไม่ Fleet Safety Officer ประเมิน risk",
      followup:
        "เพิ่ม fast-track approval path ใน {{ref:module:reorder-trigger}} สำหรับ emergency ที่ใช้เวลาไม่เกิน 5 นาที เพื่อลดแรงจูงใจที่จะ bypass ระบบ",
    },
  ],
  conventions: [
    {
      slug: "vehicle-id-convention",
      title: "Vehicle ID Convention",
      tags: ["naming", "vehicle"],
      sections: [
        { heading: "รูปแบบ", body: "`VH-<เลข 4 หลัก>` เช่น `VH-0412` ตัวเลขต้องตรงกับป้ายทะเบียนภายในของบริษัท รถสำรองใช้ suffix `B` เช่น `VH-0412B`" },
        { heading: "กติกา", body: "ห้ามใช้ทะเบียนรถจริง (ทะเบียนรัฐ) เป็น ID ในระบบเพราะทะเบียนเปลี่ยนได้เมื่อโอนรถ ใช้ internal ID เสมอ" },
      ],
    },
    {
      slug: "work-order-numbering",
      title: "Work Order Numbering",
      tags: ["naming", "work-order"],
      sections: [
        { heading: "รูปแบบ", body: "`WO-<YYYYMM>-<เลขลำดับ 5 หลัก>` เช่น `WO-202409-00142` เลขลำดับ reset ทุกเดือน" },
        { heading: "กติกา", body: "work order ที่ถูก reopen หลัง close จะได้ suffix `-R1`, `-R2` ตามจำนวนครั้งที่ reopen เพื่อให้ audit trail ชัดว่า close ครั้งแรกเมื่อไหร่" },
      ],
    },
    {
      slug: "parts-code-convention",
      title: "Parts Code Convention",
      tags: ["naming", "parts"],
      intro: "รหัสอะไหล่ต้องตรงกับ OEM part number หรือ cross-reference number ที่ตกลงกับ vendor แต่ละราย ไม่ใช้ชื่อย่อที่คิดเองภายใน",
      sections: [
        { heading: "รูปแบบใน system", body: "`<CATEGORY>-<OEM-NUMBER>` เช่น `BP-220` (brake pad), `OF-4412` (oil filter), `TRE-195` (tyre) — category prefix 2-3 ตัวอักษร uppercase" },
        { heading: "Cross-reference", body: "ถ้า vendor ใช้รหัสต่างกัน ต้องเก็บ vendor part number ไว้ใน cross-reference table แยก ไม่ rename รหัสหลักในระบบ เพื่อให้รหัสกลางมีที่เดียว" },
      ],
    },
    {
      slug: "maintenance-log-format",
      title: "Maintenance Log Format",
      tags: ["logging", "maintenance"],
      sections: [
        { heading: "Field ที่บังคับมีใน work order log", body: "`work_order_id`, `vehicle_id`, `technician_id`, `service_type`, `parts_used` (list), `odometer_at_service`, `start_time`, `end_time`" },
        { heading: "การอ้างอิงข้าม record", body: "ถ้า work order เกิดจาก maintenance trigger ต้องระบุ `maintenance_schedule_id` ที่ trigger ด้วย เพื่อ trace กลับได้ว่า schedule ใดสร้าง work order นี้" },
      ],
    },
    {
      slug: "inspection-report-naming",
      title: "Inspection Report Naming",
      tags: ["inspection", "naming"],
      sections: [
        { heading: "รูปแบบ", body: "`INSP-<vehicle-id>-<inspector-id>-<YYYYMMDDHHMMSS>` เช่น `INSP-VH0412-TEC021-20240901071530`" },
        { heading: "การ link กลับ system", body: "ผล inspection ทุกรายการต้อง link กลับ `work_order_id` ถ้าเกิดจาก scheduled inspection หรือ link กลับ `breakdown_event_id` ถ้าเกิดจาก breakdown" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`WH_<DOMAIN>_<REASON>` เช่น `WH_VEHICLE_NOT_FOUND`, `WH_PARTS_INSUFFICIENT_STOCK`, `WH_INSPECTION_VERSION_MISMATCH` — uppercase ทั้งหมด" },
        { heading: "Domain prefix ที่ใช้", body: "`WH_VEHICLE`, `WH_WORKORDER`, `WH_PARTS`, `WH_INSPECTION`, `WH_DOWNTIME`, `WH_REORDER` — ตรงกับชื่อ module หลัก" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw exception หรือ SQL error message ออกไปตรงๆ" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(parts-inventory): แก้ optimistic lock condition ป้องกัน negative stock`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — scope ควรตรงกับชื่อ module หรือ policy ที่แก้ไข" },
      ],
    },
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/WH-312-vehicle-swap-odometer`, `fix/WH-401-reorder-dedup`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที prefix ต้องตรงกับ {{ref:convention:commit-message-style}}" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (รวม concurrent deduction test สำหรับ parts-inventory) → deploy staging → smoke test → deploy production ทีละ service" },
        { heading: "Gate พิเศษ", body: "{{ref:module:parts-inventory}} และ {{ref:module:downtime-tracker}} ต้องผ่าน concurrent load test ก่อน merge เสมอ เพราะ bug ใน service เหล่านี้ส่งผลต่อ SLA ลูกค้าโดยตรง" },
      ],
    },
    {
      slug: "mileage-telemetry-integration-runbook",
      title: "Mileage Telemetry Integration Runbook",
      tags: ["telemetry", "odometer", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "ทุกครั้งที่เพิ่มยานพาหนะใหม่หรือเปลี่ยน OBD device ที่ส่ง odometer เข้าระบบ ต้องทำ calibration run ก่อนเปิดใช้จริง" },
        { heading: "ขั้นตอน", body: "1) ลงทะเบียน vehicle ใน registry ของ {{ref:module:maintenance-scheduler}} 2) ทดสอบส่ง odometer dummy ที่ค่า plausible 3 ชุดก่อนเปิดใช้จริง 3) ตั้งค่า initial odometer ให้ตรงกับมาตรวัดจริงบนรถ 4) ยืนยัน maintenance trigger คำนวณถูกต้อง" },
      ],
    },
    {
      slug: "parts-inventory-sync-runbook",
      title: "Parts Inventory Physical Sync Runbook",
      tags: ["parts", "audit", "runbook"],
      intro: "ขั้นตอน reconcile สต็อก physical กับ system เมื่อพบ discrepancy ในการ audit",
      sections: [
        { heading: "ความถี่", body: "Cycle count แบบสุ่มสำหรับ fast-moving parts ทุกสัปดาห์ Physical audit ทั้งคลังทุกไตรมาส" },
        { heading: "ขั้นตอนแก้ discrepancy", body: "1) หยุดรับ work order ใหม่สำหรับ part นั้นชั่วคราว 2) นับ physical จริง 3) เทียบกับ system ผ่าน {{ref:module:parts-inventory}} 4) แก้ด้วยมือผ่าน Purchasing Manager approval 5) บันทึก adjustment reason" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = downtime tracking ล่มหรือ stock negative ไม่สามารถ resolve ได้, Sev2 = maintenance scheduler ไม่ trigger หรือ work order ไม่สร้าง, Sev3 = report ช้าหรือ alert เกิน delay" },
        { heading: "กรณี SLA breach", body: "ทุกกรณีที่ vehicle downtime เกิน SLA จริงต้อง escalate เป็น Sev2 และแจ้ง Account Manager ที่รับผิดชอบลูกค้ารายนั้นภายใน 30 นาที" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "vehicle overdue maintenance เกิน 48 ชั่วโมงโดยไม่มี work order, parts stock ติดลบ, work order `escalated` ที่ไม่มี Fleet Manager acknowledge ภายใน 1 ชั่วโมง, maintenance.due event consumer ไม่ active" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้ง on-call ทันทีทาง pager Sev3 รวม digest รายชั่วโมงให้ Fleet Manager" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ parts deduction error rate เพิ่มขึ้น หรือ downtime event ไม่ถูกบันทึก ต้อง rollback ทันทีโดยไม่รอ approval — บทเรียนจาก {{ref:incident:parts-stock-negative-concurrent-orders}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกัน ตรวจ active work order และ pending reorder ก่อนและหลัง rollback ว่าข้อมูลครบถ้วน" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up trigger |\n|---|---|---|---|\n| maintenance-scheduler | 2 | 4 | check queue > 500 vehicles/min |\n| work-order-manager | 2 | 8 | active work order queue > 200 |\n| parts-inventory | 2 | 6 | deduction rate > 100/min |" },
        { heading: "ข้อจำกัด", body: "{{ref:module:reorder-trigger}} ไม่ scale เกิน 2 replica เพราะ idempotency check ต้องมี single source of truth — scale ขึ้นต้องมี distributed lock เพิ่มก่อน" },
      ],
    },
    {
      slug: "database-migration-runbook",
      title: "Database Migration Runbook",
      tags: ["migration", "database", "runbook"],
      intro: "ขั้นตอน migration schema สำหรับ database ของแต่ละ service ใน WrenchHub",
      sections: [
        { heading: "หลักการ", body: "migration ต้องทำแบบ backward-compatible เสมอ — เพิ่ม column ได้โดยไม่ต้อง deploy application พร้อมกัน แต่ drop column ต้องรอให้ application ไม่อ่าน column นั้นแล้วค่อย drop" },
        { heading: "ขั้นตอน", body: "1) test migration ใน staging กับ data snapshot จริง 2) backup production database ก่อน apply 3) apply migration แบบ rolling ทีละ service 4) verify ด้วย smoke test ว่า query หลักยังทำงานได้ 5) ถ้า fail rollback migration script ที่เตรียมไว้ล่วงหน้า" },
      ],
    },
  ],
};
