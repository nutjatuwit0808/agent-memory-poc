import type { DomainProfile } from "../types.js";

// SupplyLink — ระบบจัดการห่วงโซ่อุปทาน (supply chain logistics)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const supplyChain: DomainProfile = {
  id: "supply-chain",
  displayName: "SupplyLink — ระบบจัดการห่วงโซ่อุปทาน",
  summary: [
    "SupplyLink คือแพลตฟอร์มจัดการห่วงโซ่อุปทานสำหรับบริษัทผู้ผลิต ครอบคลุมตั้งแต่การสร้าง purchase order ติดตามการจัดส่งจากซัพพลายเออร์ไปจนถึงการรับสินค้าเข้าคลัง ระบบเชื่อมต่อกับ ERP ของลูกค้าแต่ละรายโดยรับผิดชอบเฉพาะ \"ชั้นของการจัดการซัพพลายเออร์และสินค้าขาเข้า\" ส่วน ERP ยังคงเป็นเจ้าของข้อมูลการผลิตและ BOM ระดับธุรกิจ",
    "ระบบแบ่งเป็น service ย่อยตามหน้าที่ได้แก่ การออก PO การติดตามซัพพลายเออร์ การตรวจสอบคุณภาพสินค้าขาเข้า และการเติมสต็อกอัตโนมัติ ทีมวิศวกรรมเรียกกระบวนการ \"PO → จัดส่ง → รับสินค้า → ตรวจสอบ → เข้าสต็อก\" ว่า procurement loop ซึ่งใช้เวลาตั้งแต่ไม่กี่วันถึงหลายสัปดาห์ขึ้นอยู่กับประเภทสินค้าและระยะทาง",
  ],
  domainTags: ["supply-chain", "supplylink"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:purchase-order-engine}} เป็นเจ้าของ PO lifecycle ทั้งหมด ส่วน {{ref:module:supplier-catalog}} เป็นเจ้าของข้อมูลซัพพลายเออร์และราคา ทั้งสองไม่รู้จักข้อมูลของกันและกันโดยตรง",
    "{{ref:module:goods-receipt-processor}} เป็น service เดียวที่ query ข้าม {{ref:module:purchase-order-engine}} และ {{ref:module:quality-inspection-gate}} พร้อมกันได้ เพราะการรับสินค้าต้องตรวจสอบทั้ง PO ที่ออกไปและเกณฑ์คุณภาพในเวลาเดียวกัน การแยกออกจะทำให้เกิด race condition ระหว่างสอง service",
  ],
  apiGatewayNote: [
    "คำสั่งจาก ERP ภายนอกและซัพพลายเออร์ portal เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลง requisition ใน ERP เป็น purchase order แล้วส่งต่อให้ {{ref:module:purchase-order-engine}} คำขอที่ต้องการผลทันที เช่น เช็คสถานะ PO ปัจจุบัน ใช้ synchronous call ตรงนี้",
    "การแจ้งเตือนจากซัพพลายเออร์เรื่องสถานะการจัดส่ง (Advance Ship Notice) เข้าผ่าน webhook endpoint แยกต่างหากที่ {{ref:module:shipment-tracker}} ดูแลเอง เพราะ volume สูงและต้องการ idempotency key ตรวจสอบ duplicate ก่อนประมวลผล",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:purchase-order-engine}} ดูแล ได้แก่ `purchase_orders` (lifecycle ของ PO แต่ละใบ), `po_line_items` (รายการสินค้าในแต่ละ PO), และ `po_amendments` (ประวัติการแก้ไข PO ทุกครั้ง ไม่ลบทิ้งเพื่อ audit)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `purchase_orders` | purchase-order-engine | สถานะ draft→confirmed→shipped→received |\n| `suppliers` | supplier-catalog | ข้อมูลซัพพลายเออร์ รวม blacklist flag |\n| `shipment_events` | shipment-tracker | event log ทุก milestone |\n| `inspection_results` | quality-inspection-gate | ผลตรวจสอบต่อ lot |\n| `replenishment_triggers` | replenishment-trigger | trigger log และ threshold config |",
    "ทุกตารางใช้ `supplier_id` เป็น soft reference ข้ามกัน ไม่มี FK constraint ข้าม schema จริง ความสอดคล้องตรวจสอบด้วย reconciliation job รายคืนแทน เพื่อให้ service แต่ละตัว deploy อิสระจากกัน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `po.confirmed`, `po.shipped`, `shipment.arrived`, `inspection.passed`, `inspection.rejected`, `replenishment.triggered` — {{ref:module:goods-receipt-processor}} เป็นทั้งผู้ subscribe หลายช่องทางและ publish ผลลัพธ์ต่อ",
    "{{ref:module:replenishment-trigger}} subscribe `inspection.passed` เพื่อนับปริมาณสินค้าที่ผ่านการตรวจสอบและเข้าสต็อกจริง แล้วเปรียบเทียบกับ threshold เพื่อตัดสินใจสร้าง PO ใหม่อัตโนมัติ การออกแบบแบบ event-driven ทำให้ replenishment ไม่ต้องพึ่ง polling สต็อกทุกนาที",
  ],
  modules: [
    {
      slug: "purchase-order-engine",
      name: "purchase-order-engine",
      tags: ["purchase-order", "module", "core"],
      description:
        "รับผิดชอบ lifecycle ของ Purchase Order ทั้งหมดตั้งแต่สร้างจนถึงปิด PO ครอบคลุมการสร้างจาก requisition, การส่งให้ซัพพลายเออร์ยืนยัน, การติดตามสถานะจัดส่ง, และการปิด PO เมื่อรับสินค้าครบ แยกออกมาเป็น service อิสระตั้งแต่ปี 2024 เพราะ PO lifecycle มีขั้นตอนซับซ้อนที่ไม่ควรปนกับ logic การรับสินค้า",
      functions: [
        { sig: "createPurchaseOrder(supplierId: string, lineItems: LineItem[]): Promise<PurchaseOrder>", desc: "สร้าง PO ใหม่ ตรวจสอบ MOQ และ blacklist ก่อนยืนยัน" },
        { sig: "confirmOrder(poId: string, supplierConfirmation: SupplierConfirm): Promise<void>", desc: "บันทึกการยืนยันของซัพพลายเออร์รวม lead time จริงที่แจ้งมา" },
        { sig: "amendOrder(poId: string, amendment: POAmendment): Promise<void>", desc: "แก้ไข PO ที่ยืนยันแล้ว บันทึก version history ทุกครั้ง" },
        { sig: "closePurchaseOrder(poId: string, closureReason: string): Promise<void>", desc: "ปิด PO เมื่อรับสินค้าครบหรือยกเลิก พร้อม audit log" },
      ],
      stateFlow: "draft → pending_supplier → confirmed → in_transit → partially_received → completed | cancelled — ดู {{ref:policy:lead-time-sla-policy}} สำหรับเงื่อนไข SLA แต่ละช่วง",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:quality-inspection-gate}} โดยตรง — เมื่อสินค้าถูกปฏิเสธจากการตรวจสอบ จะเป็น {{ref:module:goods-receipt-processor}} ที่อัปเดตสถานะ PO line item แทน เพื่อรักษาหลัก separation of concerns",
      internals: {
        constants: [
          { name: "PO_DRAFT_EXPIRY_DAYS", value: "7" },
          { name: "MAX_LINE_ITEMS_PER_PO", value: "200" },
          { name: "SUPPLIER_CONFIRM_TIMEOUT_HOURS", value: "48" },
        ],
        typeSnippet:
          "interface PurchaseOrder {\n  poId: string;\n  supplierId: string;\n  status: \"draft\" | \"pending_supplier\" | \"confirmed\" | \"in_transit\" | \"partially_received\" | \"completed\" | \"cancelled\";\n  lineItems: LineItem[];\n  confirmedLeadTimeDays?: number;\n  createdAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:lead-time-sla-policy}} และ {{ref:policy:minimum-order-quantity-policy}}",
      },
    },
    {
      slug: "supplier-catalog",
      name: "supplier-catalog",
      tags: ["supplier", "module", "core"],
      description:
        "เก็บข้อมูลซัพพลายเออร์ทั้งหมด ครอบคลุมรายการสินค้าที่ซัพพลายเออร์แต่ละรายจัดหาได้ ราคา MOQ lead time ที่ตกลงกัน และสถานะ blacklist ทุก service ที่ต้องรู้ข้อมูลซัพพลายเออร์ต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บข้อมูลซัพพลายเออร์ซ้ำเอง",
      functions: [
        { sig: "getSupplierProfile(supplierId: string): Promise<SupplierProfile>", desc: "ดึงข้อมูลซัพพลายเออร์รวม blacklist status และ performance score ล่าสุด" },
        { sig: "listEligibleSuppliers(skuId: string): Promise<SupplierProfile[]>", desc: "คืนรายการซัพพลายเออร์ที่ active และไม่ถูก blacklist สำหรับ SKU นั้น" },
        { sig: "recordPerformanceEvent(supplierId: string, event: PerformanceEvent): Promise<void>", desc: "บันทึกเหตุการณ์ที่กระทบ performance score เช่น ส่งสาย, สินค้าไม่ผ่านคุณภาพ" },
        { sig: "blacklistSupplier(supplierId: string, reason: string, reviewDate: string): Promise<void>", desc: "ตั้ง blacklist flag พร้อมกำหนดวันทบทวน ดู {{ref:policy:supplier-blacklisting-policy}}" },
      ],
      stateFlow: "active → probation (performance ต่ำ) → blacklisted | reinstated — วงจรนี้กำหนดโดย {{ref:policy:supplier-blacklisting-policy}}",
      relatedNotes:
        "{{ref:module:purchase-order-engine}} เรียก `listEligibleSuppliers` ก่อนสร้าง PO ทุกครั้ง และ {{ref:module:replenishment-trigger}} ใช้ข้อมูลนี้เพื่อเลือกซัพพลายเออร์สำรองเมื่อต้องการ dual-source ดู {{ref:policy:dual-source-requirement-policy}}",
      internals: {
        constants: [
          { name: "BLACKLIST_AUTO_REVIEW_DAYS", value: "90" },
          { name: "PROBATION_THRESHOLD_SCORE", value: "60" },
          { name: "PERFORMANCE_LOOKBACK_DAYS", value: "180" },
        ],
        typeSnippet:
          "interface SupplierProfile {\n  supplierId: string;\n  name: string;\n  status: \"active\" | \"probation\" | \"blacklisted\";\n  performanceScore: number;\n  blacklistReason?: string;\n  blacklistReviewDate?: string;\n  catalogItems: CatalogItem[];\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง blacklist ที่ {{ref:policy:supplier-blacklisting-policy}} และ dual-source ที่ {{ref:policy:dual-source-requirement-policy}}",
      },
    },
    {
      slug: "goods-receipt-processor",
      name: "goods-receipt-processor",
      tags: ["receiving", "module", "core"],
      description:
        "จัดการกระบวนการรับสินค้าจากซัพพลายเออร์ทั้งหมด ตั้งแต่บันทึกการมาถึง ส่งต่อให้ตรวจสอบคุณภาพ อัปเดตสถานะ PO และเข้าสต็อก เป็น service เดียวที่เห็นข้อมูลทั้ง PO และผลการตรวจสอบคุณภาพในเวลาเดียวกัน ทำให้เป็นจุดตัดสินใจหลักว่าสินค้าที่มาถึงจะเข้าสต็อกหรือถูกปฏิเสธ",
      functions: [
        { sig: "registerArrival(poId: string, shipmentId: string, receivedItems: ReceivedItem[]): Promise<ReceiptRecord>", desc: "บันทึกการมาถึงของสินค้า เปรียบเทียบกับ PO line item ที่คาดหวัง" },
        { sig: "submitForInspection(receiptId: string): Promise<InspectionRequest>", desc: "ส่งสินค้าที่รับมาให้ {{ref:module:quality-inspection-gate}} ตรวจสอบ" },
        { sig: "processInspectionResult(receiptId: string, result: InspectionResult): Promise<void>", desc: "อัปเดตสถานะ receipt และ PO ตามผลการตรวจสอบ รับหรือปฏิเสธสินค้า" },
        { sig: "handlePartialShipment(poId: string, receivedQty: Record<string, number>): Promise<void>", desc: "จัดการกรณีสินค้ามาไม่ครบ PO บันทึก outstanding quantity" },
      ],
      stateFlow: "arrived → inspecting → accepted | rejected | partially_accepted — ดู {{ref:policy:quality-rejection-policy}} สำหรับเกณฑ์การปฏิเสธสินค้า",
      relatedNotes:
        "เป็น service เดียวที่ cross-query ทั้ง {{ref:module:purchase-order-engine}} และ {{ref:module:quality-inspection-gate}} (ดู {{ref:arch:boundaries}}) การออกแบบนี้ตั้งใจเพื่อให้ logic การรับสินค้าอยู่ในที่เดียวแทนที่จะกระจายข้ามสอง service",
      internals: {
        constants: [
          { name: "PARTIAL_RECEIPT_TOLERANCE_PCT", value: "5" },
          { name: "INSPECTION_SUBMIT_TIMEOUT_HOURS", value: "24" },
          { name: "MAX_RECEIPT_DISCREPANCY_QTY", value: "10" },
        ],
        typeSnippet:
          "interface ReceiptRecord {\n  receiptId: string;\n  poId: string;\n  shipmentId: string;\n  status: \"arrived\" | \"inspecting\" | \"accepted\" | \"rejected\" | \"partially_accepted\";\n  receivedItems: ReceivedItem[];\n  discrepancyNotes?: string;\n  arrivedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการปฏิเสธสินค้าที่ {{ref:policy:quality-rejection-policy}} และการรับสินค้าไม่ครบที่ {{ref:policy:goods-receipt-discrepancy-policy}}",
      },
    },
    {
      slug: "quality-inspection-gate",
      name: "quality-inspection-gate",
      tags: ["quality", "module"],
      description:
        "ดำเนินการตรวจสอบคุณภาพสินค้าขาเข้าตาม specification ที่กำหนดต่อ SKU ระบบรองรับทั้งการตรวจสอบแบบ sampling (สุ่มตัวอย่างจาก lot) และ full inspection (ตรวจทุกชิ้น) ขึ้นอยู่กับ risk profile ของสินค้านั้น บันทึกผลการตรวจสอบทุก lot ไม่ลบทิ้งเพื่อใช้วิเคราะห์ supplier quality trend",
      functions: [
        { sig: "createInspectionRequest(receiptId: string, skuId: string, qty: number): Promise<InspectionRequest>", desc: "สร้าง inspection request พร้อมกำหนด sampling plan ตาม AQL ของ SKU" },
        { sig: "recordInspectionResult(inspectionId: string, result: QualityResult): Promise<void>", desc: "บันทึกผลตรวจสอบแต่ละ lot พร้อม defect detail" },
        { sig: "computeRejectionDecision(inspectionId: string): Promise<RejectionDecision>", desc: "คำนวณว่า lot นี้ผ่าน/ปฏิเสธ/ต้องตรวจเพิ่มตาม {{ref:policy:quality-rejection-policy}}" },
        { sig: "getSupplierQualityTrend(supplierId: string, lookbackDays: number): Promise<QualityTrend>", desc: "คืนสถิติคุณภาพของซัพพลายเออร์นั้นย้อนหลัง N วัน" },
      ],
      relatedNotes:
        "ผลการตรวจสอบถูก publish เป็น event `inspection.passed` หรือ `inspection.rejected` ให้ {{ref:module:goods-receipt-processor}} และ {{ref:module:replenishment-trigger}} ใช้ต่อ ข้อมูล quality trend ยังถูกส่งไปยัง {{ref:module:supplier-catalog}} เพื่ออัปเดต performance score ของซัพพลายเออร์ด้วย",
    },
    {
      slug: "replenishment-trigger",
      name: "replenishment-trigger",
      tags: ["replenishment", "module"],
      description:
        "ตรวจสอบระดับสต็อกเทียบกับ reorder point ที่กำหนดต่อ SKU และสร้าง purchase order ใหม่อัตโนมัติเมื่อสต็อกต่ำกว่าเกณฑ์ แยกออกมาเป็น service อิสระเพราะ replenishment logic มี parameter ที่ต้องปรับบ่อย เช่น reorder point, economic order quantity, และการเลือก preferred supplier ที่ไม่ควรปนกับ PO lifecycle",
      functions: [
        { sig: "evaluateReplenishmentNeed(skuId: string): Promise<ReplenishmentDecision>", desc: "ประเมินว่า SKU นี้ควรสร้าง PO ใหม่ คืน recommended qty และ supplier" },
        { sig: "triggerReplenishment(skuId: string, qty: number, supplierId: string): Promise<string>", desc: "สร้าง PO ใหม่ผ่าน {{ref:module:purchase-order-engine}} และ log trigger event" },
        { sig: "updateReorderConfig(skuId: string, config: ReorderConfig): Promise<void>", desc: "อัปเดต reorder point และ EOQ ของ SKU โดยต้องมี reason บันทึกทุกครั้ง" },
        { sig: "getReplenishmentForecast(skuId: string, days: number): Promise<Forecast>", desc: "คาดการณ์ว่า SKU นี้จะถึง reorder point เมื่อไหร่จากอัตราการใช้งานปัจจุบัน" },
      ],
      relatedNotes:
        "subscribe event `inspection.passed` จาก {{ref:module:quality-inspection-gate}} เพื่อนับปริมาณสินค้าที่เข้าสต็อกจริง ไม่ใช่ใช้ตัวเลขจาก PO (ดู {{ref:arch:queue}}) เพราะสินค้าที่ถูกปฏิเสธไม่ควรนับเป็นสต็อกที่มีอยู่ ดู {{ref:policy:replenishment-threshold-policy}} สำหรับเกณฑ์การ trigger",
    },
    {
      slug: "shipment-tracker",
      name: "shipment-tracker",
      tags: ["shipment", "tracking", "module"],
      description:
        "ติดตามสถานะการจัดส่งสินค้าจากซัพพลายเออร์ตั้งแต่ออกจากโรงงานซัพพลายเออร์จนถึงคลังสินค้าของลูกค้า รับ Advance Ship Notice (ASN) จากซัพพลายเออร์ผ่าน webhook และ update milestone event ตามข้อมูลของ carrier ระบบ alert ทีม procurement เมื่อการจัดส่งมีความเสี่ยงจะผิด SLA ที่ตกลงกันไว้",
      functions: [
        { sig: "processASN(supplierId: string, asn: AdvanceShipNotice): Promise<Shipment>", desc: "รับและประมวลผล ASN จากซัพพลายเออร์ สร้าง shipment record พร้อม expected arrival" },
        { sig: "updateShipmentMilestone(shipmentId: string, milestone: ShipmentEvent): Promise<void>", desc: "อัปเดต event เช่น departed, in_customs, arrived_port พร้อม timestamp จริง" },
        { sig: "checkSLACompliance(shipmentId: string): Promise<SLAStatus>", desc: "ตรวจสอบว่า shipment นี้จะถึงทันเวลาตาม {{ref:policy:lead-time-sla-policy}} หรือไม่" },
        { sig: "flagDelayedShipment(shipmentId: string, estimatedDelay: number): Promise<void>", desc: "ตั้ง flag delay และแจ้ง procurement team เมื่อ ETA เลื่อนเกินเกณฑ์" },
      ],
      relatedNotes:
        "เป็น service เดียวที่รับ webhook จากซัพพลายเออร์โดยตรง ต้องทำ idempotency check ทุก request เพราะซัพพลายเออร์มักส่ง ASN ซ้ำ milestone ที่ track ได้ครอบคลุมทั้ง land, sea, air freight ตาม event schema ที่กำหนดไว้ใน {{ref:convention:supplier-id-convention}}",
    },
  ],
  envVarGroups: [
    {
      service: "purchase-order-engine-service",
      vars: [
        { name: "PO_DRAFT_EXPIRY_DAYS", example: "7", note: "PO ที่ยังเป็น draft เกินนี้จะถูก archive อัตโนมัติ" },
        { name: "SUPPLIER_CONFIRM_TIMEOUT_HOURS", example: "48", note: "ดู {{ref:policy:lead-time-sla-policy}}" },
        { name: "PO_DB_URL", example: "postgres://po-db.internal:5432/supplylink_po", note: "secret ห้าม log" },
      ],
    },
    {
      service: "supplier-catalog-service",
      vars: [
        { name: "BLACKLIST_AUTO_REVIEW_DAYS", example: "90", note: "ดู {{ref:policy:supplier-blacklisting-policy}}" },
        { name: "PERFORMANCE_LOOKBACK_DAYS", example: "180", note: "ช่วงเวลาที่คำนวณ performance score" },
        { name: "PROBATION_THRESHOLD_SCORE", example: "60", note: "ต่ำกว่านี้ถูก flag probation" },
      ],
    },
    {
      service: "goods-receipt-processor-service",
      vars: [
        { name: "PARTIAL_RECEIPT_TOLERANCE_PCT", example: "5", note: "ยอมรับสินค้าน้อยกว่า PO ได้ไม่เกินเปอร์เซ็นต์นี้ ดู {{ref:policy:goods-receipt-discrepancy-policy}}" },
        { name: "INSPECTION_SUBMIT_TIMEOUT_HOURS", example: "24", note: "เวลาสูงสุดที่รอผลตรวจสอบก่อน escalate" },
      ],
    },
    {
      service: "replenishment-trigger-service",
      vars: [
        { name: "REPLENISHMENT_EVAL_INTERVAL_MIN", example: "30", note: "ความถี่ในการประเมิน reorder need แต่ละ SKU" },
        { name: "MAX_AUTO_PO_VALUE_THB", example: "500000", note: "PO ที่มูลค่าเกินนี้ต้องมีคนอนุมัติก่อน ดู {{ref:policy:replenishment-threshold-policy}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "lead-time-sla-policy",
      title: "นโยบาย SLA Lead Time การจัดส่งของซัพพลายเออร์",
      tags: ["lead-time", "sla", "policy"],
      isPrimary: true,
      intro: [
        "ซัพพลายเออร์แต่ละรายมี lead time ที่ตกลงกันไว้ใน contract ซึ่งบันทึกใน {{ref:module:supplier-catalog}} เมื่อ {{ref:module:purchase-order-engine}} สร้าง PO จะคำนวณ expected delivery date จาก lead time นี้ทันที",
        "ถ้า actual delivery date ช้ากว่า expected เกิน 3 วันทำการสำหรับ critical material หรือเกิน 7 วันสำหรับ standard material ถือว่าซัพพลายเออร์ผิด SLA และต้องบันทึก penalty event ใน performance record ผ่าน {{ref:module:supplier-catalog}}",
      ],
      sections: [
        {
          heading: "การคำนวณ Expected Delivery",
          body: "Expected delivery = วันที่ confirm PO + lead time ที่ซัพพลายเออร์ยืนยันในการตอบ PO (ไม่ใช่ค่าเฉลี่ยจาก catalog) เพื่อให้ตัวเลขผูกกับ commitment จริงของซัพพลายเออร์แต่ละครั้ง ไม่ใช่ค่า default ที่อาจล้าสมัย",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น SLA Lead Time กรณี Force Majeure",
        tags: ["lead-time", "sla", "edge-case"],
        body: [
          "กรณีเหตุการณ์ force majeure ที่มีเอกสารยืนยัน เช่น ภัยธรรมชาติ การหยุดงานประท้วง หรือการปิดท่าเรือโดยหน่วยงานรัฐ ซัพพลายเออร์สามารถยื่นขอยกเว้น SLA penalty ได้ภายใน 5 วันทำการนับจากเหตุการณ์ ทีม procurement ต้องตรวจสอบและอนุมัติ/ปฏิเสธภายใน 10 วันทำการ",
          "แม้จะได้รับยกเว้น penalty แต่เหตุการณ์ยังถูกบันทึกใน performance history เพราะใช้ในการประเมิน risk concentration (ซัพพลายเออร์ที่อยู่ในพื้นที่ risk สูงควรอยู่ใน {{ref:policy:dual-source-requirement-policy}}) ไม่ใช่แค่ลบ event ออกโดยสิ้นเชิง",
        ],
      },
    },
    {
      slug: "minimum-order-quantity-policy",
      title: "นโยบาย Minimum Order Quantity (MOQ)",
      tags: ["moq", "purchase-order", "policy"],
      isPrimary: true,
      intro: [
        "ซัพพลายเออร์แต่ละรายกำหนด MOQ ต่อ SKU ซึ่งบันทึกใน {{ref:module:supplier-catalog}} ระบบจะปฏิเสธการสร้าง PO ที่มีจำนวนต่ำกว่า MOQ โดยอัตโนมัติและแสดง error code `SUPPLY_PO_BELOW_MOQ` พร้อม MOQ จริงที่ต้องใช้",
        "ในกรณีที่ demand จริงต่ำกว่า MOQ ทีม procurement ต้องตัดสินใจระหว่างสองทาง คือ รอให้ demand สะสมจนถึง MOQ (ซึ่งอาจทำให้สต็อกหมดก่อน) หรือสั่ง MOQ แล้วแบก overstock ชั่วคราว ทั้งสองทางมี cost ที่ต่างกัน",
      ],
      edgeCase: {
        title: "ข้อยกเว้น MOQ สำหรับ Emergency Order",
        tags: ["moq", "emergency", "edge-case"],
        body: [
          "กรณี production line หยุดเพราะขาดวัตถุดิบเร่งด่วน ทีม procurement สามารถสร้าง PO ต่ำกว่า MOQ ได้โดยต้องระบุ `orderType: \"emergency\"` และมีผู้อนุมัติระดับ manager ขึ้นไปเป็นลายลักษณ์อักษร ซัพพลายเออร์มักจะยอมรับ emergency order ต่ำกว่า MOQ แต่อาจบวก expedite surcharge ตาม {{ref:policy:expedite-surcharge-policy}}",
          "Emergency order ต้องถูก flag ในระบบและรายงานไปยัง management ทุกเดือน เพราะ pattern ของ emergency order ซ้ำๆ สำหรับ SKU เดิมบ่งชี้ว่า reorder point ถูกตั้งต่ำเกินไป และควรทบทวน config ของ {{ref:module:replenishment-trigger}}",
        ],
      },
    },
    {
      slug: "supplier-blacklisting-policy",
      title: "นโยบายการขึ้น Blacklist ซัพพลายเออร์",
      tags: ["supplier", "blacklist", "policy"],
      isPrimary: true,
      intro: [
        "ซัพพลายเออร์จะถูก blacklist เมื่อ performance score ต่ำกว่า 40 คะแนน (จาก 100) ติดต่อกัน 2 ไตรมาส หรือมีเหตุการณ์ร้ายแรงเพียงครั้งเดียว เช่น ส่งสินค้าปลอม หรือฝ่าฝืน compliance ด้านแรงงาน การ blacklist ต้องมีหลักฐานเอกสารและผ่านการอนุมัติจาก procurement director",
        "เมื่อ blacklist แล้ว {{ref:module:supplier-catalog}} จะ flag ซัพพลายเออร์นั้นทันทีและ {{ref:module:purchase-order-engine}} จะปฏิเสธ PO ใหม่ที่ระบุซัพพลายเออร์นั้นโดยอัตโนมัติ PO ที่อยู่ระหว่างดำเนินการยังคงดำเนินต่อไปจนจบ (ไม่ยกเลิกกลางคัน) แต่ห้ามสร้าง PO ใหม่",
      ],
      edgeCase: {
        title: "ข้อยกเว้นการ Blacklist: ซัพพลายเออร์เจ้าเดียวในตลาด",
        tags: ["supplier", "blacklist", "edge-case"],
        body: [
          "สำหรับ SKU ที่มีซัพพลายเออร์รายเดียวในตลาด (single-source) และยังไม่มีทางเลือกอื่น การ blacklist ทันทีอาจหยุด production line ได้ กรณีนี้ระบบจะ flag เป็น `pending_blacklist` แทน ซึ่งยังอนุญาตให้สร้าง PO ได้แต่ต้องมีผู้อนุมัติพิเศษทุกใบ และต้องกำหนดแผน dual-source ภายใน 6 เดือน",
          "ถ้าครบ 6 เดือนแล้วยังไม่หาซัพพลายเออร์สำรองได้ ต้องมีการ review ระดับ executive ว่าจะดำเนินการอย่างไร สถานะ `pending_blacklist` ไม่สามารถอยู่ได้ไม่จำกัดเวลา เพราะซัพพลายเออร์ที่มีปัญหาจะยิ่งมี leverage มากขึ้นเรื่อยๆ ดู {{ref:policy:dual-source-requirement-policy}}",
        ],
      },
    },
    {
      slug: "quality-rejection-policy",
      title: "นโยบายการปฏิเสธสินค้าที่ไม่ผ่านคุณภาพ",
      tags: ["quality", "rejection", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:quality-inspection-gate}} พบ defect rate เกิน AQL threshold ของ SKU นั้น จะออก rejection notice ให้ {{ref:module:goods-receipt-processor}} และ publish event `inspection.rejected` ซัพพลายเออร์ต้องรับสินค้าคืนและส่งสินค้าทดแทนภายใน timeline ที่กำหนดในสัญญา",
        "Rejection แต่ละครั้งถูกบันทึกเป็น penalty event ใน {{ref:module:supplier-catalog}} และส่งผลต่อ performance score ของซัพพลายเออร์นั้นด้วย ถ้า rejection rate ของซัพพลายเออร์เกิน 15% ในไตรมาสเดียว จะถูก flag เป็น probation อัตโนมัติ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นการ Rejection: สินค้าวิกฤตที่ไม่มีทางเลือก",
        tags: ["quality", "rejection", "edge-case"],
        body: [
          "ถ้าสินค้าที่ถูก reject เป็น critical material ที่ขาดไม่ได้สำหรับ production line ที่กำลังจะหยุด ทีมวิศวกรรมสามารถขอ concession (waiver) เพื่อรับสินค้านั้นไว้ใช้งานชั่วคราวได้ โดยต้องระบุว่า lot ไหนที่ได้รับ waiver และใช้สำหรับผลิตภัณฑ์อะไร",
          "สินค้าที่ได้รับ waiver ยังคงถูกบันทึกว่า reject ในระบบ (ไม่เปลี่ยน status เป็น accept) แต่จะมี flag `concession_granted` ด้วย ซัพพลายเออร์ยังต้องรับผิดชอบ penalty ตามปกติ เพราะ waiver เป็นเรื่องของ operational necessity ไม่ใช่การยกเว้นความรับผิดชอบ",
        ],
      },
    },
    {
      slug: "expedite-surcharge-policy",
      title: "นโยบาย Expedite Surcharge สำหรับการจัดส่งเร่งด่วน",
      tags: ["expedite", "surcharge", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อต้องการสินค้าเร็วกว่า lead time ปกติ ซัพพลายเออร์มีสิทธิ์เรียก expedite surcharge ซึ่งอาจสูงถึง 25-40% ของมูลค่าสินค้า ระบบจะแสดง estimated surcharge ให้ทีม procurement เห็นก่อนยืนยัน PO ประเภท expedite เพื่อให้ตัดสินใจได้รับข้อมูลครบ",
        "Expedite order ต้องมีผู้อนุมัติเพิ่มขึ้นตามมูลค่า: ต่ำกว่า 100,000 บาท — manager, 100,000-500,000 บาท — director, เกิน 500,000 บาท — VP procurement ขั้นตอนนี้ช้ากว่า PO ปกติ แต่จำเป็นเพื่อป้องกันการใช้ expedite เป็น workaround แทนการวางแผน replenishment ที่ดี",
      ],
      edgeCase: {
        title: "ข้อยกเว้น Expedite Surcharge: กรณีซัพพลายเออร์ผิด SLA",
        tags: ["expedite", "surcharge", "edge-case"],
        body: [
          "ถ้าความจำเป็นต้องใช้ expedite เกิดจากซัพพลายเออร์ส่งสินค้าชุดก่อนหน้าล่าช้าจน stock หมด ซัพพลายเออร์รายนั้นไม่มีสิทธิ์เรียก surcharge สำหรับ expedite ที่ตามมา เพราะเป็นผลโดยตรงจากความผิดของตัวเอง ทีม procurement ต้องบันทึก causal link นี้ไว้ใน PO comment ก่อนส่งให้ซัพพลายเออร์",
          "ซัพพลายเออร์ที่พยายาม claim surcharge ในกรณีที่ตนเองผิด SLA จะถูกบันทึกเป็น dispute event ใน performance record แยกจาก quality event การสะสม dispute มากกว่า 2 ครั้งในปีเดียวกันจะกระทบ performance score แม้ตัว dispute จะยังไม่มีข้อยุติ",
        ],
      },
    },
    {
      slug: "dual-source-requirement-policy",
      title: "นโยบายข้อกำหนด Dual-Source ซัพพลายเออร์",
      tags: ["dual-source", "risk", "policy"],
      isPrimary: true,
      intro: [
        "SKU ที่มีปริมาณใช้งานสูง (top 20% by annual spend) และ criticality ระดับ high ต้องมีซัพพลายเออร์ที่ qualified อย่างน้อย 2 รายเสมอ เพื่อลด single point of failure ในกรณีซัพพลายเออร์รายหลักมีปัญหา",
        "{{ref:module:replenishment-trigger}} จะใช้ซัพพลายเออร์รายหลักโดยปกติ แต่จะ switch ไปซัพพลายเออร์สำรองอัตโนมัติเมื่อรายหลักอยู่ใน probation หรือ blacklist หรือเมื่อรายหลักไม่สามารถตอบสนองปริมาณที่ต้องการได้ในเวลาที่กำหนด",
      ],
      edgeCase: {
        title: "ข้อยกเว้น Dual-Source: SKU ที่มีซัพพลายเออร์ผู้ผลิตเดียว",
        tags: ["dual-source", "single-source", "edge-case"],
        body: [
          "สำหรับ SKU ที่เป็น proprietary component ที่มีผู้ผลิตเดียวในโลก (ต้องมีหลักฐานยืนยัน ไม่ใช่แค่ทีม procurement ไม่ได้ค้นหาทางเลือก) จะได้รับยกเว้นข้อกำหนด dual-source ชั่วคราว แต่ต้องมีแผน mitigation อื่น เช่น safety stock ที่สูงกว่าปกติ หรือการพัฒนา alternative design",
          "SKU กลุ่มนี้จะถูก review ทุก 12 เดือนโดย sourcing team เพื่อตรวจสอบว่ายังไม่มีทางเลือกจริงหรือมีแล้วแต่ยังไม่ได้ qualify สถานะ single-source ไม่ใช่สิ่งที่ยอมรับได้ตลอดไป ต้องมีแผนที่ชัดเจนในการลดความเสี่ยงนี้ทุกปี",
        ],
      },
    },
    {
      slug: "goods-receipt-discrepancy-policy",
      title: "นโยบายจัดการ Discrepancy ตอนรับสินค้า",
      tags: ["receiving", "discrepancy", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อสินค้าที่รับมามีจำนวนไม่ตรงกับ PO เกิน `PARTIAL_RECEIPT_TOLERANCE_PCT` เปอร์เซ็นต์ {{ref:module:goods-receipt-processor}} จะ flag เป็น discrepancy และแจ้ง procurement team ทันที ไม่ปล่อยให้ปิด receipt โดยไม่มีการยืนยัน",
        "ซัพพลายเออร์ต้องแจ้งเหตุสินค้าขาดพร้อม ETA ที่จะส่งเพิ่มภายใน 2 วันทำการ ถ้าไม่แจ้งภายใน deadline จะถูกบันทึกเป็น SLA breach ตาม {{ref:policy:lead-time-sla-policy}} โดยอัตโนมัติ",
      ],
    },
    {
      slug: "replenishment-threshold-policy",
      title: "นโยบายเกณฑ์การ Trigger Replenishment",
      tags: ["replenishment", "threshold", "policy"],
      isPrimary: false,
      intro: [
        "Reorder point คำนวณจาก average daily usage × (lead time + safety buffer days) โดย safety buffer ปรับตาม variability ของ supplier delivery — ซัพพลายเออร์ที่ส่งสายบ่อยจะมี buffer สูงกว่า การตั้ง reorder point ต้องทบทวนทุกไตรมาสหรือเมื่อ usage pattern เปลี่ยนอย่างมีนัยสำคัญ",
        "PO ที่สร้างโดย {{ref:module:replenishment-trigger}} ที่มูลค่าเกิน `MAX_AUTO_PO_VALUE_THB` จะถูก route ให้ procurement team อนุมัติก่อนส่งซัพพลายเออร์ เพื่อป้องกันการสั่งซื้อจำนวนมากโดยอัตโนมัติในกรณีที่ config มีปัญหา",
      ],
    },
    {
      slug: "supplier-onboarding-policy",
      title: "นโยบาย Onboarding ซัพพลายเออร์ใหม่",
      tags: ["supplier", "onboarding", "policy"],
      isPrimary: false,
      intro: [
        "ซัพพลายเออร์ใหม่ต้องผ่านกระบวนการ qualification ซึ่งประกอบด้วยการตรวจสอบเอกสารบริษัท การตรวจสอบ compliance ด้านแรงงานและสิ่งแวดล้อม และการทำ pilot order อย่างน้อย 2 ครั้งก่อนจะได้รับสถานะ active ใน {{ref:module:supplier-catalog}}",
        "ระหว่าง pilot order ซัพพลายเออร์ใหม่จะถูก flag เป็น `probationary` ซึ่งต้องผ่านการอนุมัติพิเศษทุก PO และจะถูก inspect 100% แทน sampling เพื่อสร้างข้อมูล quality baseline ก่อนจะได้รับสิทธิ์ AQL ปกติ",
      ],
    },
    {
      slug: "shipment-tracking-staleness-policy",
      title: "นโยบายจัดการ Shipment Tracking ที่ล้าสมัย",
      tags: ["shipment", "tracking", "staleness", "policy"],
      isPrimary: false,
      intro: [
        "ถ้า {{ref:module:shipment-tracker}} ไม่ได้รับ milestone update จากซัพพลายเออร์หรือ carrier เกิน 48 ชั่วโมงสำหรับ shipment ที่ยังอยู่ระหว่างทาง จะส่ง alert ให้ procurement team ตามไปถามซัพพลายเออร์โดยตรง",
        "Shipment ที่ไม่มี update เกิน 7 วันจะถูก escalate ให้ผู้บริหาร เพราะอาจหมายความว่าสินค้าหายหรือซัพพลายเออร์มีปัญหาร้ายแรงที่ไม่ได้แจ้ง ซัพพลายเออร์ที่ tracking staleness เกิดซ้ำมากกว่า 3 ครั้งในไตรมาสจะถูกบันทึกเป็น communication penalty ใน performance record",
      ],
    },
    {
      slug: "po-amendment-policy",
      title: "นโยบายการแก้ไข Purchase Order ที่ยืนยันแล้ว",
      tags: ["purchase-order", "amendment", "policy"],
      isPrimary: false,
      intro: [
        "PO ที่ซัพพลายเออร์ยืนยันแล้วสามารถแก้ไขได้ แต่ต้องได้รับความเห็นชอบจากซัพพลายเออร์ใหม่ ทุกการแก้ไขถูก version ไว้ใน `po_amendments` table โดย {{ref:module:purchase-order-engine}} ห้ามลบ amendment record เพื่อ audit trail ที่สมบูรณ์",
        "การลดจำนวนสั่งซื้อหลังจากที่ซัพพลายเออร์เริ่มผลิตแล้วอาจเกิด cancellation fee ตามที่ระบุในสัญญา ระบบจะแสดง estimated cancellation cost ก่อนให้ยืนยัน amendment เพื่อให้ผู้อนุมัติมีข้อมูลครบก่อนตัดสินใจ",
      ],
    },
  ],
  incidents: [
    {
      slug: "supplier-delivery-delay-cascade",
      title: "ซัพพลายเออร์ส่งสายทำให้ production line หยุด cascade",
      tags: ["lead-time", "delay", "cascade"],
      summary:
        "ซัพพลายเออร์รายหลักของ critical component (SKU-C401) ส่งสายกว่า 12 วันโดยไม่แจ้งล่วงหน้า ทำให้ production line หยุดเพราะขาด component และต้องเร่งหาทางออกฉุกเฉิน",
      investigation:
        "ตรวจสอบ {{ref:module:shipment-tracker}} พบว่า ASN ส่งมาตรงเวลาแต่ไม่มี milestone update หลังจาก `departed_origin` เลย procurement team ไม่ได้รับ alert เพราะ staleness alert ตั้งค่าไว้ที่ 72 ชั่วโมงซึ่งช้าเกินไปสำหรับ critical shipment",
      cause:
        "สินค้าติดอยู่ที่ศุลกากรปลายทางเพราะเอกสารนำเข้าไม่ครบ ซัพพลายเออร์รู้ปัญหานี้แต่ไม่แจ้ง procurement ทันทีเพราะคาดว่าจะแก้ไขได้เองภายใน 2-3 วัน",
      resolution:
        "ประสานงานกับ freight forwarder เพื่อเร่งเอกสารศุลกากร ระหว่างรอสั่ง emergency order จากซัพพลายเออร์สำรองตาม {{ref:policy:dual-source-requirement-policy}} แม้จะมี expedite surcharge ก็ตาม",
      followup:
        "ปรับ staleness alert threshold สำหรับ critical material จาก 72 เป็น 24 ชั่วโมง และกำหนดให้ซัพพลายเออร์ต้องรายงานสถานะทุก 24 ชั่วโมงระหว่างที่ shipment อยู่ระหว่างทางหากเกิดปัญหา ดู {{ref:policy:shipment-tracking-staleness-policy}}",
    },
    {
      slug: "quality-rejection-spike",
      title: "Rejection rate พุ่งสูงผิดปกติจากซัพพลายเออร์รายหนึ่ง",
      tags: ["quality", "rejection", "supplier"],
      summary:
        "ใน 3 สัปดาห์ rejection rate ของ lot จากซัพพลายเออร์ S-077 พุ่งจาก 2% เป็น 31% ทำให้ {{ref:module:goods-receipt-processor}} ปฏิเสธสินค้าจำนวนมากและ {{ref:module:replenishment-trigger}} เริ่มสร้าง PO ใหม่บ่อยผิดปกติ",
      investigation:
        "ตรวจสอบ inspection result จาก {{ref:module:quality-inspection-gate}} พบว่า defect ส่วนใหญ่เป็น dimensional tolerance ที่เกินค่า spec การตรวจย้อนหลัง lot ก่อนหน้าพบว่าปัญหาเริ่มจาก batch ที่ใช้วัตถุดิบจาก sub-supplier ใหม่",
      cause:
        "ซัพพลายเออร์ S-077 เปลี่ยน sub-supplier วัตถุดิบโดยไม่แจ้ง SupplyLink ล่วงหน้าซึ่งขัดกับ change notification requirement ในสัญญา วัตถุดิบใหม่มีคุณสมบัติต่างจากเดิมทำให้ค่า tolerance ในการผลิตต้องปรับ",
      resolution:
        "ยืนยันกับซัพพลายเออร์ S-077 ว่าต้องกลับไปใช้ sub-supplier เดิมก่อน ระหว่างรอ switch ไปใช้ซัพพลายเออร์สำรองชั่วคราว และบันทึก change notification violation เป็น penalty event ใน {{ref:module:supplier-catalog}}",
      followup:
        "เพิ่มข้อกำหนดในสัญญาว่าซัพพลายเออร์ต้องแจ้งล่วงหน้า 30 วันเมื่อต้องการเปลี่ยน sub-supplier หลัก พร้อมให้ quality team ของ SupplyLink ตรวจสอบก่อนอนุมัติ",
    },
    {
      slug: "po-duplication-from-retry",
      title: "PO ถูกสร้างซ้ำจาก retry ของ ERP integration",
      tags: ["purchase-order", "duplicate", "integration"],
      summary:
        "ค้นพบว่า PO ของ SKU-B205 ถูกสร้างซ้ำกัน 3 ใบในระบบ ซัพพลายเออร์ได้รับแจ้ง PO ทั้งสามใบและเริ่มผลิตสินค้า 3 เท่าของที่ต้องการ",
      investigation:
        "ตรวจสอบ API log พบว่า ERP ของลูกค้า timeout ขณะส่ง create PO request แล้ว retry อีก 2 ครั้ง แต่ {{ref:module:purchase-order-engine}} ไม่มี idempotency key ตรวจสอบ ทำให้รับ request ทั้งสามครั้งและสร้าง PO แยกกันทุกครั้ง",
      cause:
        "API gateway ไม่ได้กำหนด idempotency key requirement สำหรับ create PO endpoint เป็นปัญหาที่ design review ไม่ได้ catch เพราะ ERP integration test ไม่ครอบคลุม timeout + retry scenario",
      resolution:
        "ติดต่อซัพพลายเออร์ทันทีเพื่อยกเลิก PO ที่ซ้ำ 2 ใบ ซัพพลายเออร์ยืนยันว่ายังไม่ได้เริ่มผลิต lot ซ้ำจึงไม่มี cancellation fee แก้ไข endpoint ให้รับ idempotency key และตรวจสอบก่อนสร้าง PO ใหม่",
      followup:
        "กำหนดให้ทุก mutation endpoint ต้องรองรับ idempotency key และเพิ่ม test case สำหรับ timeout + retry ใน integration test suite ดู {{ref:convention:testing-convention}}",
    },
    {
      slug: "replenishment-trigger-loop",
      title: "Replenishment trigger สร้าง PO วนซ้ำเพราะ config ผิด",
      tags: ["replenishment", "loop", "configuration"],
      summary:
        "ใน 6 ชั่วโมง {{ref:module:replenishment-trigger}} สร้าง PO สำหรับ SKU-D311 จำนวน 14 ใบ รวมมูลค่ากว่า 2 ล้านบาท ก่อนที่ทีมจะสังเกตและหยุดได้",
      investigation:
        "ตรวจสอบ log พบว่า `evaluateReplenishmentNeed` คืนผลว่าต้อง trigger ทุกครั้งที่ถูกเรียก แม้ PO ก่อนหน้าจะถูกสร้างแล้ว เพราะระบบไม่ได้นับ PO ที่ยัง in-flight เป็น \"สต็อกที่กำลังมา\"",
      cause:
        "การคำนวณ current stock level ใน `evaluateReplenishmentNeed` นับเฉพาะสต็อกที่รับมาแล้วจริงๆ ไม่ได้รวม PO ที่ confirmed แต่ยังไม่ได้รับสินค้า ทำให้ trigger ซ้ำตราบเท่าที่ physical stock ต่ำกว่า reorder point",
      resolution:
        "หยุด replenishment-trigger service ชั่วคราว ยกเลิก PO ที่เกินจริง 13 ใบ (ซัพพลายเออร์ยังไม่ได้รับ confirm ทันเวลา) แก้ logic ให้รวม in-transit PO ใน stock position calculation",
      followup:
        "เพิ่ม circuit breaker ใน replenishment-trigger ที่หยุดสร้าง PO ถ้ามี open PO สำหรับ SKU เดิมที่ยังไม่รับสินค้าอยู่แล้ว และเพิ่ม rate limit สูงสุด N PO ต่อ SKU ต่อวันสำหรับ auto-trigger",
    },
    {
      slug: "goods-receipt-mismatch",
      title: "สินค้าที่รับมา mapping ผิด PO ทำให้ inventory บิดเบือน",
      tags: ["receiving", "mismatch", "inventory"],
      summary:
        "ทีม warehouse พบว่า SKU-A102 มีสต็อกเกินจริงกว่า 300 ชิ้น ขณะที่ SKU-A103 ขาดสต็อก 300 ชิ้น ซึ่งตรงกันพอดีกับ lot ที่รับมาเมื่อสัปดาห์ก่อน",
      investigation:
        "ตรวจสอบ receipt record ใน {{ref:module:goods-receipt-processor}} พบว่า lot ที่รับมานั้นถูก map กับ PO line item ผิด SKU สาเหตุคือ barcode ของบรรจุภัณฑ์ซัพพลายเออร์ทั้งสองรายการมีรูปแบบเหมือนกันเกือบหมด ต่างกันแค่ตัวเลขสุดท้าย",
      cause:
        "ระบบ scan barcode ที่ loading dock ไม่มี validation ว่า SKU ที่ scan ตรงกับ SKU ในใบ PO ที่กำลัง receive หรือไม่ พนักงาน scan ผ่านโดยไม่สังเกตความต่าง",
      resolution:
        "ทำ physical count ยืนยันว่าสินค้าจริงคือ SKU อะไร แล้วแก้ inventory record ในระบบ เพิ่ม validation ใน receipt process ที่ต้องยืนยัน SKU match ก่อน submit",
      followup:
        "เพิ่ม cross-check บังคับใน {{ref:module:goods-receipt-processor}} ว่า SKU ที่ scan ต้องตรงกับ expected SKU ใน PO line item ก่อนรับสินค้า ถ้าไม่ตรงต้องให้ supervisor ยืนยันพร้อมเหตุผลก่อน override",
    },
    {
      slug: "shipment-tracking-staleness",
      title: "Shipment tracking ค้างนาน 5 วันโดยไม่มี update ใดๆ",
      tags: ["shipment", "tracking", "staleness"],
      summary:
        "Shipment SHP-2405-118 ที่มาจากซัพพลายเออร์ S-023 ไม่มี milestone update เลยนาน 5 วันหลังออกจากต้นทาง ทีม procurement ไม่รู้สินค้าอยู่ที่ไหนและจะถึงเมื่อไหร่",
      investigation:
        "ตรวจสอบ {{ref:module:shipment-tracker}} พบว่าซัพพลายเออร์ส่ง ASN แล้วแต่ carrier ไม่ได้ส่ง tracking update กลับมา ตรวจสอบกับ carrier โดยตรงพบว่าระบบ webhook ของ carrier มีปัญหาและไม่ได้ส่ง event ไปยัง SupplyLink เลย",
      cause:
        "Carrier ทำการ system maintenance โดยไม่แจ้งล่วงหน้าและ webhook ของพวกเขาหยุดทำงานชั่วคราว SupplyLink ไม่มีระบบตรวจสอบว่า webhook ของ carrier ยังทำงานปกติหรือไม่นอกจากรอรับ event",
      resolution:
        "ติดต่อ carrier โดยตรงเพื่อรับ status update สินค้าอยู่ระหว่างขนส่งปกติ update timeline ใน shipment tracker ด้วยมือ และ escalate carrier ให้แก้ webhook ก่อนปิด incident",
      followup:
        "เพิ่ม periodic heartbeat check ที่ polling carrier API โดยตรงเป็น fallback เมื่อไม่มี webhook update เกิน threshold ดู {{ref:policy:shipment-tracking-staleness-policy}}",
    },
    {
      slug: "supplier-blacklist-during-active-po",
      title: "ซัพพลายเออร์ถูก blacklist ขณะมี PO active อยู่",
      tags: ["supplier", "blacklist", "purchase-order"],
      summary:
        "ซัพพลายเออร์ S-055 ถูก blacklist กะทันหันเพราะพบหลักฐาน compliance violation ร้ายแรง แต่ขณะนั้นมี PO active อยู่ 6 ใบที่ส่งสินค้ามาแล้วบางส่วน",
      investigation:
        "ตรวจสอบสถานะ PO ทั้ง 6 ใบพบว่า 2 ใบรับสินค้าครบแล้ว 3 ใบรับบางส่วน 1 ใบยังไม่ได้รับเลย ระบบ blacklist ทำให้ {{ref:module:purchase-order-engine}} ปฏิเสธ PO ใหม่ แต่ไม่มีกฎชัดเจนสำหรับ PO ที่กำลังดำเนินการ",
      cause:
        "Policy ไม่ได้ define อย่างชัดเจนว่าเมื่อ blacklist จะทำอย่างไรกับ PO ที่ in-flight อยู่ ทีม procurement ต้องตัดสินใจเคสต่อเคสโดยไม่มี guideline",
      resolution:
        "ตัดสินใจให้ PO ที่รับบางส่วนแล้วดำเนินต่อจนครบ (สินค้าที่สั่งไปแล้วและอาจกำลังผลิต) แต่ยกเลิก PO ที่ยังไม่ได้รับสินค้าเลย เร่ง source จากซัพพลายเออร์สำรอง",
      followup:
        "เพิ่ม policy ที่ชัดเจนใน {{ref:policy:supplier-blacklisting-policy}} ว่า PO ที่ in-flight ทำอย่างไร และ เพิ่ม validation ใน blacklist flow ที่ต้องแสดง active PO ทั้งหมดให้ผู้อนุมัติ review ก่อน execute",
    },
    {
      slug: "expedite-surcharge-dispute",
      title: "ซัพพลายเออร์เรียก Expedite Surcharge แบบไม่สมเหตุผล",
      tags: ["expedite", "surcharge", "dispute"],
      summary:
        "ซัพพลายเออร์ S-031 เรียก expedite surcharge 35% สำหรับ PO ที่ expedite เพราะซัพพลายเออร์รายนี้เองส่งสายจากรอบก่อนและทำให้สต็อกหมด ทีม procurement โต้แย้ง",
      investigation:
        "ตรวจสอบ timeline พบว่า PO ก่อนหน้าของ S-031 (PO-2405-088) ส่งช้ากว่า expected 9 วัน ซึ่งทำให้ stock ของ SKU นั้นหมดก่อนที่ replenishment จะมาถึง การ expedite ครั้งนี้จึงเกิดจากความผิดของ S-031 โดยตรง",
      cause:
        "ซัพพลายเออร์ไม่ได้รับข้อมูลว่าเหตุการณ์ delay ก่อนหน้าของตัวเองเป็นสาเหตุของ expedite ครั้งนี้ ระบบไม่ได้ระบุ causal link ใน PO comment ก่อนส่งให้ซัพพลายเออร์ตาม {{ref:policy:expedite-surcharge-policy}}",
      resolution:
        "แชร์ timeline และหลักฐานกับ S-031 เพื่อยืนยัน causal link ซัพพลายเออร์ยอมรับและยกเว้น surcharge ส่วน dispute event ถูกบันทึกใน performance record ตาม policy",
      followup:
        "อัปเดต system workflow ให้ระบุ causal PO ID ใน expedite PO comment อัตโนมัติเมื่อ expedite เกิดจากการ delay ก่อนหน้าของซัพพลายเออร์รายเดิม",
    },
    {
      slug: "dual-source-failover-delay",
      title: "Switch ไปซัพพลายเออร์สำรองล่าช้าทำให้ production หยุด",
      tags: ["dual-source", "failover", "delay"],
      summary:
        "ซัพพลายเออร์รายหลักของ SKU-E512 เข้า probation ทำให้ {{ref:module:replenishment-trigger}} พยายาม switch ไปซัพพลายเออร์สำรอง แต่ซัพพลายเออร์สำรองไม่มี capacity ทันทีและต้องรอ 3 สัปดาห์",
      investigation:
        "ตรวจสอบ {{ref:module:supplier-catalog}} พบว่าซัพพลายเออร์สำรองได้รับการ qualify แต่ไม่มีการตรวจสอบว่ามี capacity พร้อมรองรับ demand ฉุกเฉินได้จริงหรือไม่ ข้อมูล catalog มีแค่ว่า qualified แต่ไม่มีข้อมูล capacity",
      cause:
        "Dual-source qualification ตรวจสอบแค่ว่าซัพพลายเออร์สามารถผลิต SKU นั้นได้ ไม่ได้ตรวจสอบว่ามี production capacity สำรองที่พร้อมใช้ในกรณีฉุกเฉินจริง",
      resolution:
        "ประสานงานกับซัพพลายเออร์สำรองให้เร่ง production เท่าที่ทำได้ ระหว่างรอลด production plan ชั่วคราวเพื่อยืดสต็อกที่มีอยู่ออกไป",
      followup:
        "เพิ่ม capacity commitment ใน dual-source qualification criteria — ซัพพลายเออร์สำรองต้องยืนยันว่าสามารถจัดส่งสินค้าได้อย่างน้อย 50% ของ annual demand ภายใน 2 สัปดาห์หากถูก activate เป็น primary",
    },
    {
      slug: "minimum-order-quantity-override-error",
      title: "MOQ override ผิดทำให้สั่งสินค้าน้อยเกินไปจนขาดแคลน",
      tags: ["moq", "override", "configuration"],
      summary:
        "SKU-F621 มี MOQ 1,000 ชิ้น แต่มี emergency order flag ทำให้สั่งได้เพียง 200 ชิ้น ปัญหาคือ emergency ครั้งนั้นผ่านไปนานแล้วแต่ flag ยังไม่ถูกลบ ทำให้ replenishment สั่งซื้อต่ำกว่า MOQ ทุกครั้ง",
      investigation:
        "ตรวจสอบ config ของ {{ref:module:replenishment-trigger}} พบว่า emergency override flag สำหรับ SKU-F621 ถูกตั้งเมื่อ 4 เดือนก่อนและไม่มี expiry date ทำให้ยังใช้อยู่แม้ว่า emergency นั้นจบไปนานแล้ว",
      cause:
        "ระบบไม่มี expiry date สำหรับ emergency override flag และไม่มีการ review หรือ cleanup flag ที่เก่าแล้ว ทำให้ override ค้างอยู่โดยไม่มีใครรู้",
      resolution:
        "ลบ emergency override flag และสร้าง emergency PO แบบ manual สำหรับ quantity ที่ขาดไป ปรับ replenishment config กลับเป็น MOQ ปกติ",
      followup:
        "กำหนด maximum lifetime ของ emergency override flag เป็น 30 วัน หลังจากนั้นต้องมีการ renew ด้วยมือเพื่อให้ยังใช้งานได้ และเพิ่ม audit report รายเดือนแสดง override ทั้งหมดที่ active อยู่",
    },
    {
      slug: "lead-time-sla-breach-cascade",
      title: "SLA breach จากซัพพลายเออร์หลายราย cascade ในช่วงเดียวกัน",
      tags: ["lead-time", "sla", "cascade"],
      summary:
        "ในเดือนเดียวกัน มีซัพพลายเออร์ 4 รายส่งสายพร้อมกัน ทำให้เกิด supply shortage หลาย SKU พร้อมกัน ทีม procurement ไม่มีกำลังรับมือพร้อมกันได้ทุกเคส",
      investigation:
        "วิเคราะห์พบว่าซัพพลายเออร์ทั้ง 4 รายใช้ raw material จาก source เดียวกันซึ่งมีปัญหา supply disruption ในประเทศต้นทาง ทำให้ disruption propagate ผ่าน supply chain มาถึง SupplyLink พร้อมกัน",
      cause:
        "Supplier diversity analysis ไม่ได้ตรวจสอบระดับ sub-supplier ทำให้ไม่รู้ว่าซัพพลายเออร์หลายรายมี single point of failure เดียวกันในระดับ upstream",
      resolution:
        "จัดลำดับความสำคัญ PO ตาม production criticality และเจรจากับซัพพลายเออร์ที่ได้รับผลกระทบน้อยกว่าให้เร่ง delivery สำหรับ critical material ก่อน",
      followup:
        "เพิ่ม sub-supplier disclosure requirement ใน onboarding contract และทำ supply chain risk mapping ประจำปีเพื่อระบุ hidden concentration risk ใน upstream supply chain",
    },
    {
      slug: "inventory-replenishment-overshoot",
      title: "Replenishment สั่งสินค้าเกินจนสต็อกล้นคลัง",
      tags: ["replenishment", "overshoot", "configuration"],
      summary:
        "SKU-G788 มีสต็อกสะสมเกิน 3 เท่าของ capacity คลัง เพราะ EOQ ถูกคำนวณผิดหลังจากมีการปรับ demand forecast แต่ไม่ได้อัปเดต replenishment config พร้อมกัน",
      investigation:
        "ตรวจสอบ {{ref:module:replenishment-trigger}} พบว่า EOQ ยังใช้ demand forecast เดิมที่สูงกว่าความจริง 4 เท่า ทั้งที่ demand forecast ถูก revise ลงแล้วใน ERP แต่ไม่ได้ sync มาที่ replenishment config",
      cause:
        "Demand forecast ถูกจัดการใน ERP แยกจาก replenishment config ใน SupplyLink ไม่มี automated sync ทำให้ต้องอัปเดตสองที่ด้วยมือ และครั้งนี้มีการอัปเดตเพียงที่เดียว",
      resolution:
        "หยุด auto-replenishment สำหรับ SKU-G788 ชั่วคราว และลด EOQ ให้สอดคล้องกับ demand จริง ติดต่อซัพพลายเออร์เพื่อเลื่อน delivery ของ PO ที่ยังไม่ได้รับออกไป",
      followup:
        "สร้าง API integration ระหว่าง ERP demand forecast และ replenishment config ใน SupplyLink ให้ sync อัตโนมัติเมื่อ forecast เปลี่ยน แทนการอัปเดตด้วยมือสองที่",
    },
    {
      slug: "partial-shipment-mismatch",
      title: "Partial shipment ทำให้ PO ค้างโดยไม่มีใครสังเกต",
      tags: ["receiving", "partial-shipment", "po"],
      summary:
        "PO-2404-221 ถูก mark เป็น `partially_received` มา 6 สัปดาห์ แต่ไม่มีใครไล่ตามซัพพลายเออร์ว่าสินค้าส่วนที่เหลือจะมาเมื่อไหร่ ทำให้ production plan ที่รอสินค้าส่วนนี้ได้รับผลกระทบ",
      investigation:
        "ตรวจสอบ {{ref:module:goods-receipt-processor}} พบว่าไม่มี automated follow-up mechanism สำหรับ partial receipt ที่ค้างนานเกินกำหนด procurement team รับรู้สถานะแต่ไม่มี SLA ว่าต้องไล่ติดตามภายในเมื่อไหร่",
      cause:
        "ระบบ track partial receipt แต่ไม่มี aging alert — PO ที่ค้างสถานะ `partially_received` นานเกิน N วันไม่ trigger notification ใดๆ ทำให้ visibility ของ procurement team ขึ้นอยู่กับการ check ด้วยมือเท่านั้น",
      resolution:
        "ติดต่อซัพพลายเออร์เพื่อรับ ETA ของส่วนที่เหลือ พบว่าสินค้าส่วนนั้นถูก hold อยู่ที่โรงงานซัพพลายเออร์โดยไม่มีใครแจ้ง ได้รับ delivery ภายใน 2 สัปดาห์",
      followup:
        "เพิ่ม aging alert สำหรับ `partially_received` PO ที่ค้างเกิน 14 วัน และกำหนด SLA ให้ procurement team ต้องมี update จากซัพพลายเออร์ภายใน 5 วันทำการ",
    },
    {
      slug: "supplier-catalog-sync-failure",
      title: "Supplier catalog sync ล้มเหลวทำให้ราคา MOQ ล้าสมัย",
      tags: ["supplier-catalog", "sync", "data"],
      summary:
        "ทีม procurement สังเกตว่า PO บางใบถูก reject ด้วย error `SUPPLY_PO_BELOW_MOQ` แม้จำนวนที่สั่งจะตรงกับ MOQ ที่ทำความเข้าใจกับซัพพลายเออร์ไว้ เพราะ MOQ ใน system ยังเป็นตัวเลขเก่า",
      investigation:
        "ตรวจสอบ {{ref:module:supplier-catalog}} พบว่า sync job ที่ดึงข้อมูลอัปเดตจาก supplier portal ล้มเหลวมา 3 สัปดาห์โดยไม่มีใครสังเกต เพราะ error ถูก suppress ไว้แทนที่จะ alert",
      cause:
        "Sync job มี try-catch ที่กิน error โดยไม่ log ชัดเจนและไม่ alert monitoring ทำให้ failure ไม่ถูกตรวจจับ ซัพพลายเออร์ได้ปรับ MOQ หลายรายการซึ่งไม่ได้ sync เข้ามา",
      resolution:
        "แก้ไข sync job ให้ alert เมื่อล้มเหลวทันที รัน manual sync เพื่อดึงข้อมูลทั้งหมดใหม่ และอัปเดต catalog ให้ตรงกับความเป็นจริง",
      followup:
        "ทบทวน error handling ของทุก background job ใน SupplyLink ตาม {{ref:convention:logging-convention}} ให้ log error ชัดเจนและมี alert เสมอ ไม่ใช่ suppress",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SUPPLY-102-expedite-surcharge-causal-link`, `fix/SUPPLY-214-replenishment-loop-circuit-breaker`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(purchase-order-engine): เพิ่ม idempotency check สำหรับ create PO endpoint`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ state ของ PO หรือ supplier status ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (บทเรียนจาก {{ref:incident:po-duplication-from-retry}}) และการเปลี่ยน config ที่กระทบ replenishment threshold ต้องมีคนที่สองยืนยันก่อน merge" },
        { heading: "การ deploy config", body: "ทุกครั้งที่เปลี่ยน threshold config เช่น MOQ override หรือ replenishment EOQ ต้องระบุ expiry date ให้ชัดเจนและทำ cleanup plan ก่อน merge บทเรียนจาก {{ref:incident:minimum-order-quantity-override-error}}" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `createPurchaseOrder`, `evaluateReplenishmentNeed` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ทางธุรกิจ", body: "`supplierId` รูปแบบ `S-<3 หลัก>`, `poId` รูปแบบ `PO-YYMM-<sequential>` ดูรายละเอียดเพิ่มเติมที่ {{ref:convention:supplier-id-convention}}" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ PO ต้องมี `poId` เสมอ เพื่อไล่ log ข้าม service ได้ (purchase-order-engine → goods-receipt-processor → quality-inspection-gate) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "Rejection event และ blacklist change ต้อง log เป็น `warn` ขึ้นไปเสมอ background job ที่ fail ต้องไม่ suppress error เงียบๆ ต้องมี `error` log พร้อม stack trace ทุกครั้ง บทเรียนจาก {{ref:incident:supplier-catalog-sync-failure}}" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`SUPPLY_<DOMAIN>_<REASON>` เช่น `SUPPLY_PO_BELOW_MOQ`, `SUPPLY_SUPPLIER_BLACKLISTED`, `SUPPLY_RECEIPT_DISCREPANCY` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`SUPPLY_PO_DUPLICATE`, `SUPPLY_SUPPLIER_PROBATION`, `SUPPLY_INSPECTION_REJECTED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "integration"],
      sections: [
        { heading: "Integration test กรณี concurrent", body: "ฟังก์ชันที่สร้างหรือแก้ PO ต้องมี test จำลอง concurrent request อย่างน้อย 2 ตัวเพื่อตรวจจับ race condition บทเรียนจาก {{ref:incident:po-duplication-from-retry}} คือ timeout+retry scenario ต้องอยู่ใน test suite เสมอ" },
        { heading: "Background job test", body: "Sync job และ trigger loop ต้องมี test ครอบคลุมกรณี idempotency — รัน job ซ้ำ 2 ครั้งต้องให้ผลเดิม ตรวจสอบด้วยบทเรียนจาก {{ref:incident:replenishment-trigger-loop}}" },
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
      slug: "supplier-id-convention",
      title: "Supplier & PO ID Convention",
      tags: ["supplier", "naming", "convention"],
      intro: "การกำหนด identifier ที่สอดคล้องกันทั่วทั้งระบบทำให้ log analysis และ audit trail ใช้งานได้จริง — เอกสารนี้กำหนดรูปแบบที่ต้องใช้ตรงกันทุก service",
      sections: [
        { heading: "Supplier ID", body: "`S-<3 หลัก>` เช่น `S-001`, `S-023`, `S-077` — ต้องอ้างอิง supplier master record ในระบบเสมอ ไม่ใช้ชื่อซัพพลายเออร์ดิบๆ ใน log เพราะชื่ออาจเปลี่ยนได้" },
        { heading: "PO ID", body: "`PO-YYMM-<sequential 3 หลัก>` เช่น `PO-2405-118` — format ช่วยให้กรองโดย year-month ได้ทันทีจาก ID โดยไม่ต้อง query database ก่อน" },
        { heading: "Shipment ID", body: "`SHP-YYMM-<sequential>` โดย shipment-tracker เป็นผู้ออก ID นี้เสมอ ไม่ใช้หมายเลขของ carrier โดยตรงเพราะ format ต่างกันแต่ละราย — carrier tracking number เก็บเป็น separate field" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (ครอบคลุม concurrent + idempotency scenarios) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทุก service" },
        { heading: "Gate พิเศษ", body: "{{ref:module:purchase-order-engine}} และ {{ref:module:replenishment-trigger}} ต้องผ่าน integration test 100% ก่อน merge เสมอ เพราะ bug ในสอง service นี้กระทบ financial commitment โดยตรง" },
      ],
    },
    {
      slug: "po-retry-configuration",
      title: "PO API Retry & Idempotency Configuration",
      tags: ["retry", "idempotency", "configuration"],
      intro: "เอกสารนี้อธิบาย configuration ของ retry behavior และ idempotency key สำหรับ PO creation endpoint — บทเรียนจาก {{ref:incident:po-duplication-from-retry}} ทำให้ต้องกำหนดค่านี้อย่างระมัดระวัง",
      sections: [
        { heading: "Idempotency key", body: "ERP integration ต้องส่ง `X-Idempotency-Key` header ทุก PO creation request โดยค่าต้องเป็น UUID v4 ที่ unique ต่อ request intent (ไม่ใช่ generate ใหม่ทุก retry) — server เก็บ key นี้ไว้ 24 ชั่วโมงและ return response เดิมถ้าพบ duplicate" },
        { heading: "Retry policy สำหรับ client", body: "Retry ไม่เกิน 3 ครั้ง backoff เริ่มที่ 1 วินาที × 2 (exponential) ถ้า timeout > 30 วินาที ต้องใช้ idempotency key เดิม ไม่ generate ใหม่ เพราะ request อาจถึง server แล้วแต่ response หายระหว่างทาง" },
      ],
    },
    {
      slug: "database-migration-runbook",
      title: "Database Migration Runbook",
      tags: ["migration", "runbook", "database"],
      sections: [
        { heading: "ก่อน migrate", body: "snapshot database ทุก service ที่ได้รับผลกระทบ และตรวจสอบว่าไม่มี in-flight transaction ค้างอยู่ PO ที่อยู่ระหว่าง state transition ต้องให้เสร็จก่อนเริ่ม migration" },
        { heading: "ขั้นตอน", body: "1) หยุดรับ order ใหม่จาก ERP ชั่วคราว 2) drain in-flight PO ให้หมด 3) run migration script 4) validate ด้วย smoke test ครอบคลุม create PO → receive goods flow 5) เปิดรับ order อีกครั้ง" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = replenishment loop หรือ PO duplication ที่กระทบ financial commitment, Sev2 = supplier sync ล้มเหลว หรือ quality inspection ค้าง, Sev3 = tracking staleness หรือ alert threshold ไม่ถูกต้อง" },
        { heading: "กรณี replenishment loop", body: "ถ้าสังเกตว่า PO ถูกสร้างเร็วผิดปกติสำหรับ SKU เดิมซ้ำๆ ให้หยุด {{ref:module:replenishment-trigger}} ทันทีก่อนวิเคราะห์ เพราะ delay หนึ่งนาทีอาจหมายถึง PO เพิ่มอีกหลายใบ บทเรียนจาก {{ref:incident:replenishment-trigger-loop}}" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "PO ที่ถูกสร้างเกิน N ใบต่อ SKU ต่อชั่วโมง, supplier sync job ล้มเหลวติดต่อกัน 2 รอบ, partial receipt PO ค้างเกิน 14 วัน, replenishment trigger rate ผิดปกติ ดู {{ref:deployment:monitoring-alerts}} สำหรับ threshold ปัจจุบัน" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev2/3 รวมเป็น digest รายชั่วโมง background job failure ทุกอันต้องมี alert — ห้าม suppress เงียบๆ" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ PO creation error rate เกิน 5% หรือมี replenishment loop เกิดขึ้น ต้อง rollback ทันทีโดยไม่รอ approval บทเรียนจาก {{ref:incident:replenishment-trigger-loop}} คือทุกนาทีที่รอมี cost เพิ่มขึ้นเรื่อยๆ" },
        { heading: "ขั้นตอน", body: "deploy version ก่อนหน้ากลับผ่าน pipeline เดิม (ไม่ skip smoke test) ถ้า replenishment loop ค้างอยู่ต้องหยุด service ก่อน deploy ไม่ใช่ deploy ทับทันที เพราะ PO ที่สร้างเกินอาจส่งถึงซัพพลายเออร์แล้ว" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| purchase-order-engine | 2 | 6 | CPU > 70% |\n| goods-receipt-processor | 2 | 6 | queue depth > 200 |\n| replenishment-trigger | 1 | 3 | ประเมินทุก 30 นาที — scale horizontal ไม่ช่วยเพราะเป็น scheduled evaluation |\n| quality-inspection-gate | 1 | 4 | queue depth > 100 |" },
        { heading: "ข้อจำกัด", body: "replenishment-trigger ไม่ scale แบบ event-driven เพราะถ้า multiple instance evaluate พร้อมกันอาจ trigger PO ซ้ำได้ — ออกแบบให้รัน single instance แต่ใช้ lock เพื่อป้องกัน concurrent evaluation สำหรับ SKU เดิม" },
      ],
    },
    {
      slug: "supplier-api-integration-runbook",
      title: "Supplier API & Webhook Integration Runbook",
      tags: ["integration", "webhook", "runbook"],
      intro: "ขั้นตอนสำหรับ onboard ซัพพลายเออร์ใหม่เข้าสู่ระบบ webhook และ API integration รวมถึงการตรวจสอบว่า integration ทำงานปกติอยู่เสมอ",
      sections: [
        { heading: "การ setup webhook สำหรับซัพพลายเออร์ใหม่", body: "ทดสอบ webhook ด้วย test event ก่อน go-live เสมอ ตรวจสอบว่าซัพพลายเออร์ส่ง idempotency key มาด้วยทุก event และ retry ด้วย key เดิม ไม่ใช่ generate ใหม่ แจ้งซัพพลายเออร์เรื่อง rate limit ของ webhook endpoint ล่วงหน้า" },
        { heading: "Health check สำหรับ webhook ที่ active อยู่", body: "ทุกซัพพลายเออร์ที่ integrate ผ่าน webhook ต้องมี heartbeat event อย่างน้อย 1 ครั้งต่อ 24 ชั่วโมง ถ้าไม่มีให้ alert เพื่อตรวจสอบ บทเรียนจาก {{ref:incident:shipment-tracking-staleness}} คือการรอ event โดยไม่มี fallback ทำให้ไม่รู้ว่า integration พัง" },
      ],
    },
  ],
};
