import type { DomainProfile } from "../types.js";

// AssetTrack — ระบบจัดการสินทรัพย์องค์กร (IT & enterprise asset management)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const assetManagement: DomainProfile = {
  id: "asset-management",
  displayName: "AssetTrack — ระบบจัดการสินทรัพย์องค์กร",
  summary: [
    "AssetTrack คือแพลตฟอร์มจัดการสินทรัพย์ IT และสินทรัพย์องค์กรสำหรับองค์กรขนาดใหญ่ ครอบคลุมตั้งแต่ฮาร์ดแวร์ (แล็ปท็อป, เซิร์ฟเวอร์, อุปกรณ์เครือข่าย) ไปจนถึง software license, สัญญาบำรุงรักษา, และตารางค่าเสื่อมราคา ระบบทำหน้าที่เป็นแหล่งความจริงเดียวสำหรับทุกสินทรัพย์ที่องค์กรเป็นเจ้าของหรือเช่าใช้",
    "AssetTrack แบ่งออกเป็นหลาย module ย่อยตามหน้าที่ ตั้งแต่การจดทะเบียนสินทรัพย์ใหม่ การติดตามการมอบหมายให้พนักงานหรือสถานที่ ไปจนถึงการจัดการ procurement request และกระบวนการทำลายทิ้งอย่างถูกต้องเมื่อสิ้นอายุการใช้งาน ทีม IT สามารถตรวจสอบสถานะสินทรัพย์ทุกชิ้นได้แบบ real-time ผ่าน dashboard เดียว",
  ],
  domainTags: ["asset-management", "assettrack"],
  serviceBoundaryNote: [
    "แต่ละ module มีฐานข้อมูลของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:asset-registry}} เป็นเจ้าของข้อมูลหลักของสินทรัพย์ (ชื่อ, ประเภท, serial number, สถานะปัจจุบัน) ส่วน {{ref:module:depreciation-engine}} เป็นเจ้าของตารางค่าเสื่อมราคาและประวัติการคำนวณ ทั้งสองไม่ share ตารางกันโดยตรง",
    "{{ref:module:procurement-handler}} เป็น module เดียวที่สามารถสร้าง asset record ใหม่ใน {{ref:module:asset-registry}} ได้ผ่าน internal API — การเพิ่มสินทรัพย์โดยตรงผ่านช่องทางอื่นถือว่าผิดหลักและจะทำให้ข้อมูล procurement history ขาดหาย",
  ],
  apiGatewayNote: [
    "คำขอจากระบบ HR หรือ ERP ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ auth และ rate limit ก่อนส่งต่อให้แต่ละ module คำขอประเภท \"เช็คว่าพนักงานมีอุปกรณ์อะไรบ้าง\" ใช้ synchronous call ผ่าน {{ref:module:assignment-tracker}} ตรงนี้",
    "การแจ้ง disposal request จากพนักงานเข้ามาทาง self-service portal แยกต่างหาก ซึ่ง route ตรงไปยัง {{ref:module:disposal-workflow}} โดยไม่ผ่าน API gateway หลัก เพราะ portal มี auth และ audit trail ของตัวเองตามข้อกำหนด compliance",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:asset-registry}} ดูแล ได้แก่ `assets` (ข้อมูลหลักของสินทรัพย์แต่ละชิ้น), `asset_history` (ประวัติการเปลี่ยนแปลงสถานะทั้งหมด ไม่ลบทิ้งเพื่อ audit), และ `asset_locations`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `assets` | asset-registry | อัปเดตเมื่อมีการเปลี่ยนสถานะ |\n| `license_pools` | license-pool-manager | จำนวน seat ที่มีและที่ใช้ไป |\n| `depreciation_schedules` | depreciation-engine | ตารางค่าเสื่อมราคารายปี |\n| `procurement_requests` | procurement-handler | ประวัติ request และ approval |\n| `assignments` | assignment-tracker | mapping สินทรัพย์ → พนักงาน/สถานที่ |\n| `disposal_records` | disposal-workflow | ใบรับรองการทำลายและ audit trail |",
    "ทุกตารางใช้ `asset_id` เป็น foreign key ร่วมกันแบบ soft reference โดย `asset-registry` เป็นเจ้าของ `asset_id` เพียงผู้เดียว module อื่นอ้างอิงผ่าน ID โดยไม่มี FK constraint ข้าม schema จริง ความสอดคล้องตรวจสอบด้วย nightly reconciliation job",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `asset.registered`, `asset.assigned`, `asset.returned`, `asset.flagged_for_disposal`, `procurement.approved`, `license.threshold_breached` — {{ref:module:asset-registry}} เป็น publisher หลักสำหรับ lifecycle event ของสินทรัพย์",
    "{{ref:module:depreciation-engine}} subscribe `asset.registered` เพื่อสร้าง depreciation schedule อัตโนมัติเมื่อสินทรัพย์ใหม่เข้าระบบ โดยไม่ต้องรอให้ทีม finance trigger เองด้วยมือ ออกแบบแบบนี้เพื่อให้มั่นใจว่าทุกสินทรัพย์มี schedule ครบเสมอไม่มีตกหล่น",
  ],
  modules: [
    {
      slug: "asset-registry",
      name: "asset-registry",
      tags: ["registry", "module", "core"],
      description:
        "เป็นแหล่งความจริงหลักสำหรับข้อมูลสินทรัพย์ทุกชิ้นในองค์กร รับผิดชอบการจดทะเบียนสินทรัพย์ใหม่ อัปเดตสถานะ และเก็บประวัติการเปลี่ยนแปลงทั้งหมด ทุก module ที่ต้องรู้ว่าสินทรัพย์ชิ้นไหนมีอยู่หรือสถานะปัจจุบันเป็นอะไรต้อง query ผ่าน module นี้เท่านั้น",
      functions: [
        { sig: "registerAsset(data: AssetInput): Promise<Asset>", desc: "จดทะเบียนสินทรัพย์ใหม่เข้าระบบ คืน asset record พร้อม asset_id ที่ generate แล้ว" },
        { sig: "updateAssetStatus(assetId: string, status: AssetStatus, reason: string): Promise<void>", desc: "เปลี่ยนสถานะสินทรัพย์และบันทึกเหตุผลลง history" },
        { sig: "lookupAsset(assetId: string): Promise<Asset | null>", desc: "ดึงข้อมูลสินทรัพย์ปัจจุบัน คืน null ถ้าไม่พบ" },
        { sig: "searchAssets(filter: AssetFilter): Promise<Asset[]>", desc: "ค้นหาสินทรัพย์ตาม filter เช่น ประเภท, ตำแหน่ง, สถานะ" },
      ],
      stateFlow: "draft → active → assigned | in_maintenance → returned → flagged_for_disposal → disposed — ดู {{ref:policy:asset-minimum-useful-life-policy}} สำหรับเงื่อนไขการเปลี่ยนสถานะแต่ละขั้น",
      relatedNotes:
        "{{ref:module:assignment-tracker}} เรียก `updateAssetStatus` ทุกครั้งที่มีการมอบหมายหรือคืนสินทรัพย์ แต่ asset-registry ไม่รู้จัก concept ของ \"พนักงาน\" เลย รู้แค่ว่าสินทรัพย์มีสถานะอะไร การ map สินทรัพย์กับพนักงานเป็นหน้าที่ของ assignment-tracker แต่ผู้เดียว",
      internals: {
        constants: [
          { name: "ASSET_ID_PREFIX", value: "\"AT\"" },
          { name: "MAX_SERIAL_NUMBER_LENGTH", value: "64" },
          { name: "HISTORY_RETENTION_YEARS", value: "10" },
        ],
        typeSnippet:
          "interface Asset {\n  assetId: string;\n  name: string;\n  category: \"hardware\" | \"software\" | \"network\" | \"peripheral\";\n  status: AssetStatus;\n  serialNumber?: string;\n  purchaseDate: string;\n  location?: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:asset-minimum-useful-life-policy}}",
      },
    },
    {
      slug: "license-pool-manager",
      name: "license-pool-manager",
      tags: ["license", "module", "core"],
      description:
        "จัดการ pool ของ software license ทุก title ในองค์กร ติดตามจำนวน seat ที่มีทั้งหมดและที่ถูกใช้ไปอยู่ในปัจจุบัน แจ้งเตือนเมื่อใกล้ถึงเกณฑ์ overallocation และป้องกันไม่ให้มีการ assign license เกินจำนวนที่มี แยกออกมาจาก asset-registry เพราะ license มี lifecycle และกฎการนับที่แตกต่างจากสินทรัพย์ทางกายภาพอย่างสิ้นเชิง",
      functions: [
        { sig: "allocateLicense(productId: string, userId: string): Promise<LicenseAllocation>", desc: "จ่าย license seat ให้ผู้ใช้ ตรวจสอบก่อนว่า pool มี seat เหลือ" },
        { sig: "revokeLicense(allocationId: string): Promise<void>", desc: "คืน license seat กลับ pool เมื่อผู้ใช้ไม่ต้องการแล้ว" },
        { sig: "getPoolStatus(productId: string): Promise<PoolStatus>", desc: "คืนจำนวน seat ทั้งหมด ที่ใช้ไป และที่เหลือ พร้อม threshold status" },
        { sig: "syncLicenseCount(productId: string, vendorCount: number): Promise<void>", desc: "อัปเดตจำนวน seat จริงจาก vendor portal เพื่อป้องกัน count drift" },
      ],
      stateFlow: "pool_created → seat_allocated (แต่ละ seat) | seat_available — ดู {{ref:policy:license-overallocation-policy}} สำหรับเกณฑ์ที่ trigger alert",
      relatedNotes:
        "{{ref:module:assignment-tracker}} เรียก `allocateLicense` ทุกครั้งที่มอบหมาย software asset ให้พนักงาน เพื่อให้แน่ใจว่าการ assign ทางกายภาพและการนับ license ตรงกันเสมอ ดู {{ref:policy:license-overallocation-policy}} สำหรับกฎเรื่องเกณฑ์เตือน",
      internals: {
        constants: [
          { name: "OVERALLOCATION_WARNING_THRESHOLD_PCT", value: "90" },
          { name: "OVERALLOCATION_HARD_LIMIT_PCT", value: "100" },
          { name: "SYNC_INTERVAL_HOURS", value: "24" },
        ],
        typeSnippet:
          "interface PoolStatus {\n  productId: string;\n  totalSeats: number;\n  usedSeats: number;\n  availableSeats: number;\n  thresholdStatus: \"ok\" | \"warning\" | \"overallocated\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเกณฑ์และผลที่เกิดขึ้นเมื่อ overallocate ที่ {{ref:policy:license-overallocation-policy}}",
      },
    },
    {
      slug: "depreciation-engine",
      name: "depreciation-engine",
      tags: ["depreciation", "finance", "module"],
      description:
        "คำนวณค่าเสื่อมราคาของสินทรัพย์ทุกชิ้นตาม method ที่กำหนดไว้ในนโยบาย (Straight-line หรือ Double-declining balance) และสร้าง depreciation schedule รายปีโดยอัตโนมัติเมื่อมีสินทรัพย์ใหม่เข้าระบบ แยกออกมาเป็น module เดียวกับที่ทีม finance จะ audit เพื่อให้ตรวจสอบ logic ได้โดยไม่ต้องแตะ module อื่น",
      functions: [
        { sig: "createSchedule(assetId: string, method: DepreciationMethod, startDate: string): Promise<DepreciationSchedule>", desc: "สร้างตารางค่าเสื่อมราคาตลอดอายุการใช้งาน" },
        { sig: "computeCurrentBookValue(assetId: string, asOf: string): Promise<number>", desc: "คำนวณมูลค่าตามบัญชีของสินทรัพย์ ณ วันที่ระบุ" },
        { sig: "listExpiredSchedules(asOf: string): Promise<DepreciationSchedule[]>", desc: "คืนรายการสินทรัพย์ที่ค่าเสื่อมราคาหมดแล้วตาม schedule" },
        { sig: "recomputeSchedule(assetId: string, correctedStartDate: string): Promise<void>", desc: "คำนวณ schedule ใหม่เมื่อพบว่าวันเริ่มต้นเดิมผิดพลาด ดู {{ref:policy:depreciation-method-policy}}" },
      ],
      relatedNotes:
        "subscribe event `asset.registered` จาก {{ref:module:asset-registry}} เพื่อสร้าง schedule อัตโนมัติทุกครั้งที่มีสินทรัพย์ใหม่ โดยไม่รอให้ทีม finance trigger เองด้วยมือ ดู {{ref:policy:depreciation-method-policy}} สำหรับกฎว่าสินทรัพย์ประเภทใดใช้ method ใด",
      internals: {
        constants: [
          { name: "DEFAULT_USEFUL_LIFE_YEARS_HARDWARE", value: "3" },
          { name: "DEFAULT_USEFUL_LIFE_YEARS_NETWORK", value: "5" },
          { name: "RESIDUAL_VALUE_PCT", value: "10" },
        ],
        typeSnippet:
          "interface DepreciationSchedule {\n  assetId: string;\n  method: \"straight-line\" | \"double-declining\";\n  startDate: string;\n  usefulLifeYears: number;\n  annualEntries: { year: number; depreciation: number; bookValue: number }[];\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการเลือก method และข้อยกเว้นที่ {{ref:policy:depreciation-method-policy}}",
      },
    },
    {
      slug: "procurement-handler",
      name: "procurement-handler",
      tags: ["procurement", "module"],
      description:
        "รับและจัดการ procurement request ตั้งแต่ขั้นตอน draft ไปจนถึงการอนุมัติและการสั่งซื้อจริง ทำหน้าที่เป็น module เดียวที่ route request ผ่าน approval tier ที่ถูกต้องตามมูลค่าการซื้อ และเมื่อ request ได้รับอนุมัติแล้วจะ trigger การสร้าง asset record ใหม่ใน {{ref:module:asset-registry}} โดยอัตโนมัติ",
      functions: [
        { sig: "submitRequest(requesterId: string, items: ProcurementItem[]): Promise<ProcurementRequest>", desc: "ยื่น procurement request ใหม่ คืน request พร้อม tier ที่ต้องขอ approval" },
        { sig: "approveRequest(requestId: string, approverId: string): Promise<void>", desc: "อนุมัติ request ตรวจสอบว่า approver มีสิทธิ์ตาม {{ref:policy:procurement-approval-tier-policy}}" },
        { sig: "rejectRequest(requestId: string, approverId: string, reason: string): Promise<void>", desc: "ปฏิเสธ request และแจ้งเหตุผลให้ requester" },
        { sig: "markAsReceived(requestId: string, receivedItems: ReceivedItem[]): Promise<string[]>", desc: "บันทึกว่าสินค้าถึงมือแล้วและ trigger การสร้าง asset record คืน asset_id ที่สร้าง" },
      ],
      stateFlow: "draft → pending_approval → approved | rejected → ordered → received",
      relatedNotes:
        "เมื่อ `markAsReceived` ถูกเรียก จะเรียก {{ref:module:asset-registry}} เพื่อสร้าง asset record ใหม่โดยอัตโนมัติ — นี่เป็นช่องทางเดียวที่ถูกต้องในการเพิ่มสินทรัพย์ใหม่เข้าระบบ ดู {{ref:policy:procurement-approval-tier-policy}} สำหรับเกณฑ์ tier",
    },
    {
      slug: "assignment-tracker",
      name: "assignment-tracker",
      tags: ["assignment", "module"],
      description:
        "ติดตามการมอบหมายสินทรัพย์ให้พนักงานหรือสถานที่ และจัดการกระบวนการคืนสินทรัพย์ เป็น module เดียวที่รู้ว่า \"สินทรัพย์ชิ้นนี้อยู่กับใครหรืออยู่ที่ไหน\" ณ เวลาปัจจุบัน ทุกการย้ายสินทรัพย์ระหว่างพนักงานหรือสถานที่ต้องผ่าน module นี้เสมอเพื่อให้ประวัติครบถ้วน",
      functions: [
        { sig: "assignAsset(assetId: string, assigneeId: string, assigneeType: \"employee\" | \"location\"): Promise<Assignment>", desc: "มอบหมายสินทรัพย์ให้พนักงานหรือสถานที่ ตรวจสอบว่าสินทรัพย์ไม่ได้ถูก assign อยู่แล้ว" },
        { sig: "returnAsset(assetId: string, returnedBy: string, condition: AssetCondition): Promise<void>", desc: "บันทึกการคืนสินทรัพย์กลับ pool และอัปเดตสถานะ" },
        { sig: "getAssignmentHistory(assetId: string): Promise<Assignment[]>", desc: "ดึงประวัติการมอบหมายทั้งหมดของสินทรัพย์ชิ้นหนึ่ง" },
        { sig: "listUnassignedAssets(category?: AssetCategory): Promise<Asset[]>", desc: "คืนรายการสินทรัพย์ที่ยังไม่ได้มอบหมายและพร้อมใช้งาน" },
      ],
      relatedNotes:
        "ทุกครั้งที่ assign หรือคืนสินทรัพย์จะแจ้ง {{ref:module:asset-registry}} ให้อัปเดตสถานะด้วย และถ้าสินทรัพย์เป็น software license จะเรียก {{ref:module:license-pool-manager}} ควบคู่ไปด้วย ดู {{ref:policy:depreciation-method-policy}} สำหรับผลกระทบต่อ depreciation เมื่อสินทรัพย์ถูกย้ายสถานที่",
    },
    {
      slug: "disposal-workflow",
      name: "disposal-workflow",
      tags: ["disposal", "compliance", "module"],
      description:
        "จัดการกระบวนการทำลายหรือจำหน่ายสินทรัพย์เมื่อสิ้นอายุการใช้งาน ตรวจสอบว่าทุกขั้นตอนมีใบรับรองที่ถูกต้องก่อนปิด record และป้องกันไม่ให้สินทรัพย์ถูก dispose โดยไม่มีเอกสารรับรอง เพราะอาจกระทบ data security compliance และข้อกำหนดด้านสิ่งแวดล้อม",
      functions: [
        { sig: "initiateDisposal(assetId: string, reason: DisposalReason, requestedBy: string): Promise<DisposalRecord>", desc: "เริ่มกระบวนการ disposal สำหรับสินทรัพย์ชิ้นหนึ่ง" },
        { sig: "uploadCertification(disposalId: string, certType: CertType, fileRef: string): Promise<void>", desc: "แนบใบรับรองการทำลายข้อมูลหรือ recycle ตาม {{ref:policy:disposal-certification-policy}}" },
        { sig: "completeDisposal(disposalId: string, completedBy: string): Promise<void>", desc: "ปิด disposal record เมื่อทุกใบรับรองครบ และส่ง event ให้ asset-registry อัปเดตสถานะ" },
        { sig: "listPendingDisposals(): Promise<DisposalRecord[]>", desc: "คืนรายการ disposal request ที่ยังรอใบรับรองหรือการยืนยัน" },
      ],
      relatedNotes:
        "หลังจาก `completeDisposal` สำเร็จ จะ publish event `asset.disposed` ให้ {{ref:module:asset-registry}} เปลี่ยนสถานะสินทรัพย์เป็น `disposed` และ {{ref:module:depreciation-engine}} หยุดคำนวณค่าเสื่อมราคาสำหรับสินทรัพย์นั้น ดู {{ref:policy:disposal-certification-policy}} สำหรับใบรับรองที่บังคับต้องมี",
    },
  ],
  envVarGroups: [
    {
      service: "asset-registry-service",
      vars: [
        { name: "ASSET_REGISTRY_DB_URL", example: "postgres://asset-db.internal:5432/assets", note: "secret ห้าม log" },
        { name: "ASSET_HISTORY_RETENTION_YEARS", example: "10", note: "ดู {{ref:policy:asset-minimum-useful-life-policy}}" },
      ],
    },
    {
      service: "license-pool-manager-service",
      vars: [
        { name: "LICENSE_WARNING_THRESHOLD_PCT", example: "90", note: "ดู {{ref:policy:license-overallocation-policy}}" },
        { name: "LICENSE_VENDOR_SYNC_INTERVAL_HOURS", example: "24", note: "ความถี่ sync จำนวน seat จาก vendor portal" },
      ],
    },
    {
      service: "depreciation-engine-service",
      vars: [
        { name: "DEPRECIATION_DEFAULT_LIFE_HARDWARE_YEARS", example: "3", note: "ดู {{ref:policy:depreciation-method-policy}}" },
        { name: "DEPRECIATION_DEFAULT_LIFE_NETWORK_YEARS", example: "5", note: "ดู {{ref:policy:depreciation-method-policy}}" },
        { name: "DEPRECIATION_RESIDUAL_VALUE_PCT", example: "10", note: "มูลค่าซาก ใช้ในทั้ง Straight-line และ Double-declining" },
      ],
    },
    {
      service: "procurement-handler-service",
      vars: [
        { name: "PROCUREMENT_TIER1_LIMIT_THB", example: "50000", note: "วงเงิน tier 1 ที่ manager อนุมัติได้ ดู {{ref:policy:procurement-approval-tier-policy}}" },
        { name: "PROCUREMENT_TIER2_LIMIT_THB", example: "500000", note: "วงเงิน tier 2 ที่ director ต้องอนุมัติ" },
      ],
    },
  ],
  policies: [
    {
      slug: "depreciation-method-policy",
      title: "นโยบายการเลือก Depreciation Method สำหรับสินทรัพย์",
      tags: ["depreciation", "finance", "policy"],
      isPrimary: true,
      intro: [
        "สินทรัพย์แต่ละประเภทใช้ depreciation method ที่กำหนดตายตัวตาม category ไม่ใช่ตาม case ต่อ case — ฮาร์ดแวร์คอมพิวเตอร์ (แล็ปท็อป, เซิร์ฟเวอร์) ใช้ Straight-line ตลอด 3 ปี ส่วนอุปกรณ์เครือข่ายและ infrastructure ใช้ Straight-line ตลอด 5 ปี",
        "การใช้ Double-declining balance สำหรับสินทรัพย์ใดๆ ต้องมีการอนุมัติจาก CFO เป็นรายกรณี — {{ref:module:depreciation-engine}} ไม่อนุญาตให้ set method เป็น `double-declining` ผ่าน API ทั่วไป ต้องใช้ privileged endpoint แยก",
      ],
      sections: [
        {
          heading: "เหตุผลที่ใช้ Straight-line เป็น default",
          body: "Straight-line ทำให้ค่าใช้จ่ายกระจายเท่ากันทุกปี ซึ่งสะดวกสำหรับการวางแผนงบประมาณ IT ที่ต้องการ predictability — Double-declining ให้ภาษีได้เปรียบในปีแรกๆ แต่สร้างความซับซ้อนในการ compare ต้นทุน asset ชนิดเดียวกันที่ซื้อต่างปีกัน",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Depreciation Schedule ถูกสร้างด้วยวันเริ่มต้นผิด",
        tags: ["depreciation", "correction", "edge-case"],
        body: [
          "ถ้าพบว่า schedule ถูกสร้างด้วย `startDate` ที่ผิด (เช่น ใช้วันที่ซื้อ PO แทนวันที่รับสินทรัพย์จริง) ต้องเรียก `recomputeSchedule` ผ่าน {{ref:module:depreciation-engine}} พร้อม `correctedStartDate` ที่ถูกต้อง — ห้ามแก้ตาราง schedule โดยตรง",
          "การ recompute ต้องได้รับอนุมัติจากทีม finance ก่อนเสมอ เพราะเปลี่ยนตัวเลขที่ถูก book ไปแล้วในบัญชี ถ้า recompute หลังจาก fiscal year ปิดแล้ว ต้องใช้กระบวนการ audit adjustment แยกต่างหากแทนที่จะ recompute โดยตรง",
        ],
      },
    },
    {
      slug: "license-overallocation-policy",
      title: "นโยบายเกณฑ์ License Overallocation",
      tags: ["license", "compliance", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:license-pool-manager}} แจ้งเตือนทีม IT เมื่อ seat ที่ใช้ไปเกิน `LICENSE_WARNING_THRESHOLD_PCT` ของทั้งหมด และบล็อก allocation ใหม่เมื่อถึง 100% โดยอัตโนมัติ — ไม่มีการ allow overallocation แม้แต่ชั่วคราว เพราะนำไปสู่ license audit failure ได้",
        "เมื่อ pool ถึงเกณฑ์เตือน ระบบจะสร้าง procurement request แบบ pre-filled สำหรับ license เพิ่มเติมให้อัตโนมัติ เพื่อย่นระยะเวลา lead time ของการซื้อเพิ่ม ทีม IT ต้องยืนยัน request นั้นเองก่อน submit",
      ],
      sections: [
        {
          heading: "ทำไมไม่ allow overallocation ชั่วคราว",
          body: "การ overallocate แม้แต่ชั่วคราวทำให้รายงาน license audit ที่ส่งให้ vendor ผิดจาก reality — ผลคือโดนค่าปรับและเสียเงื่อนไขต่อรองราคา ต้นทุนของการ overallocate แค่ชั่วคราวจึงสูงกว่าต้นทุนที่ต้องรอ procurement มาก",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: License Count Drift จากการ Override ด้วยมือ",
        tags: ["license", "drift", "edge-case"],
        body: [
          "ถ้าทีม IT เคย adjust จำนวน seat ด้วยมือผ่าน admin panel โดยไม่ผ่าน `syncLicenseCount` อย่างถูกต้อง ตัวเลขใน pool อาจ drift ออกจากตัวเลขจริงของ vendor จนเกณฑ์เตือนทำงานผิดพลาด",
          "กรณีนี้ต้อง trigger `syncLicenseCount` ด้วยตัวเลขจาก vendor portal โดยตรงเพื่อ reset ตัวเลขให้ถูกต้อง แล้วตรวจสอบว่า allocation ทั้งหมดที่มีอยู่ยังอยู่ในขอบเขตจริง — ถ้ามี overallocation จริงหลัง sync ต้องระบุว่า seat ไหนต้องถูก revoke",
        ],
      },
    },
    {
      slug: "maintenance-renewal-notice-policy",
      title: "นโยบายการแจ้งเตือนต่อสัญญาบำรุงรักษา",
      tags: ["maintenance", "contract", "policy"],
      isPrimary: true,
      intro: [
        "สัญญาบำรุงรักษาของสินทรัพย์ที่ใกล้หมดอายุจะถูกแจ้งเตือนล่วงหน้า 90 วัน ผ่าน email ถึงเจ้าของสินทรัพย์และทีม IT procurement — เพื่อให้มีเวลาเพียงพอในการเจรจาต่อสัญญาหรือหาตัวเลือกอื่น",
        "ถ้าไม่มีการดำเนินการใดๆ ภายใน 60 วัน ระบบจะ escalate ไปยัง IT manager อีกชั้นหนึ่ง และที่ 30 วัน จะ escalate ไปยัง CTO เพื่อให้มั่นใจว่าสัญญาสำคัญไม่หมดโดยไม่มีใครรู้",
      ],
      sections: [
        {
          heading: "ทำไมต้องแจ้ง 90 วันล่วงหน้า",
          body: "สัญญาบำรุงรักษาของ enterprise hardware โดยเฉพาะ server และ network equipment ใช้เวลา negotiate และออก PO นานกว่าปกติมาก บางรายต้องผ่าน legal review ด้วย — 90 วันเป็นเกณฑ์ขั้นต่ำที่ทีมประมาณไว้ว่าพอใช้ได้จริงในกรณีส่วนใหญ่",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: สัญญาบำรุงรักษาที่ผูกกับสินทรัพย์ที่กำลัง Dispose",
        tags: ["maintenance", "disposal", "edge-case"],
        body: [
          "ถ้าสินทรัพย์อยู่ระหว่างกระบวนการ disposal ใน {{ref:module:disposal-workflow}} และสัญญาบำรุงรักษาของมันใกล้หมดพร้อมกัน ระบบจะระงับการแจ้งเตือนต่อสัญญาทั้งหมดโดยอัตโนมัติ เพื่อไม่ให้ทีม IT เสียเวลา renew สัญญาของสินทรัพย์ที่กำลังจะ dispose อยู่แล้ว",
          "ถ้า disposal process ล่าช้าและสัญญาหมดก่อน disposal เสร็จ ทีม IT ต้องตัดสินใจด้วยมือว่าจะ renew แบบระยะสั้นหรือปล่อยให้สัญญาขาด — ระบบจะไม่ renew ให้โดยอัตโนมัติในสถานการณ์นี้",
        ],
      },
    },
    {
      slug: "asset-minimum-useful-life-policy",
      title: "นโยบายอายุการใช้งานขั้นต่ำก่อน Dispose",
      tags: ["disposal", "lifecycle", "policy"],
      isPrimary: true,
      intro: [
        "สินทรัพย์ IT ที่มีอายุการใช้งานน้อยกว่าเกณฑ์ขั้นต่ำที่กำหนดไว้ตาม category จะไม่สามารถเริ่มกระบวนการ disposal ได้ผ่าน {{ref:module:disposal-workflow}} โดยอัตโนมัติ — ฮาร์ดแวร์ทั่วไปขั้นต่ำ 2 ปี, อุปกรณ์เครือข่ายขั้นต่ำ 4 ปี",
        "นโยบายนี้มีขึ้นเพื่อป้องกันการ dispose สินทรัพย์ที่ยังใช้ได้ดีก่อนเวลา ซึ่งทำให้ค่าเสื่อมราคาในบัญชีไม่สะท้อนความจริงและเพิ่มต้นทุนการจัดซื้อโดยไม่จำเป็น",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Dispose ก่อนอายุขั้นต่ำด้วยเหตุผลพิเศษ",
        tags: ["disposal", "exception", "edge-case"],
        body: [
          "สินทรัพย์ที่เสียหายจนซ่อมไม่คุ้มหรือถูกขโมยสามารถ dispose ก่อนอายุขั้นต่ำได้ แต่ต้องมีเอกสารประกอบ ได้แก่ ใบประเมินความเสียหายจากทีมซ่อม หรือใบแจ้งความ — {{ref:module:disposal-workflow}} จะให้เลือก reason `damaged` หรือ `stolen` ซึ่งจะ bypass การตรวจสอบอายุขั้นต่ำ",
          "Disposal ที่ bypass อายุขั้นต่ำทุกกรณีจะถูก flag ให้ทีม finance review โดยอัตโนมัติ เพื่อปรับ depreciation schedule ที่ค้างอยู่ให้สอดคล้องกับ asset ที่หายออกจากบัญชีก่อนเวลา",
        ],
      },
    },
    {
      slug: "disposal-certification-policy",
      title: "นโยบายใบรับรองที่ต้องมีก่อนปิด Disposal",
      tags: ["disposal", "compliance", "security", "policy"],
      isPrimary: true,
      intro: [
        "ก่อน {{ref:module:disposal-workflow}} จะปิด disposal record ได้ ต้องมีใบรับรองครบตามประเภทสินทรัพย์ — ฮาร์ดแวร์ที่เคยเก็บข้อมูลต้องมี data destruction certificate จากผู้ให้บริการที่ได้รับการรับรอง, สินทรัพย์ที่ต้อง recycle ตามกฎหมาย e-waste ต้องมี recycling certificate",
        "สินทรัพย์ที่จะส่งต่อให้พนักงาน donate หรือขายต่อ ต้องผ่าน data wipe ที่ได้มาตรฐาน NIST 800-88 ก่อนเสมอ และต้องมีใบรับรอง wipe แนบด้วย ระบบจะไม่ให้ complete disposal โดยไม่มีเอกสารนี้",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Disposal ของสินทรัพย์ที่ไม่มีข้อมูลสะสม",
        tags: ["disposal", "certification", "edge-case"],
        body: [
          "สินทรัพย์ที่ไม่เคยเก็บข้อมูล เช่น furniture, monitor ที่ไม่มี storage, หรืออุปกรณ์เครือข่าย passive เช่น switch และ cable ไม่จำเป็นต้องมี data destruction certificate — แค่ recycling certificate ตามกฎ e-waste ก็เพียงพอ",
          "ทีม IT ต้อง classify สินทรัพย์ว่า `data-bearing` หรือ `non-data-bearing` ตอนจดทะเบียนใน {{ref:module:asset-registry}} เพื่อให้ {{ref:module:disposal-workflow}} รู้ว่าต้องบังคับใบรับรองใดบ้าง — ถ้าไม่ได้ classify ไว้ ระบบจะ default เป็น `data-bearing` เพื่อความปลอดภัย",
        ],
      },
    },
    {
      slug: "procurement-approval-tier-policy",
      title: "นโยบาย Tier การอนุมัติ Procurement Request",
      tags: ["procurement", "approval", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:procurement-handler}} กำหนด approval tier ตามมูลค่ารวมของ request — Tier 1 (ไม่เกิน `PROCUREMENT_TIER1_LIMIT_THB`) manager อนุมัติได้, Tier 2 (เกิน Tier 1 แต่ไม่เกิน `PROCUREMENT_TIER2_LIMIT_THB`) ต้องมี director อนุมัติ, Tier 3 (เกิน Tier 2) ต้องมี C-level อนุมัติ",
        "ระบบจะไม่อนุญาตให้ approver ที่มีสิทธิ์ Tier 1 อนุมัติ request Tier 2 แม้จะ override ผ่าน admin panel ก็ตาม — เป็นข้อกำหนดที่ hard-code ไว้เพื่อป้องกัน audit finding",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Request ที่อนุมัติเกินวงเงิน Tier",
        tags: ["procurement", "overspend", "edge-case"],
        body: [
          "ถ้า procurement request ได้รับการอนุมัติแล้วแต่มูลค่าจริงเมื่อได้รับสินค้าเกินกว่าที่ approved ไว้เกิน 5% จะต้องยื่น variance request แยกต่างหากสำหรับส่วนที่เกิน และรอ approval จาก tier ที่เหมาะสมกับมูลค่าทั้งหมด",
          "{{ref:module:procurement-handler}} จะบล็อกการเรียก `markAsReceived` ถ้ามูลค่าจริงเกินที่อนุมัติไว้เกินเกณฑ์ จนกว่า variance request จะได้รับการอนุมัติ — เพื่อให้มั่นใจว่าทุก penny ที่ใช้ไปมี authorization ที่ถูกต้อง",
        ],
      },
    },
    {
      slug: "asset-assignment-policy",
      title: "นโยบายการมอบหมายสินทรัพย์ให้พนักงาน",
      tags: ["assignment", "policy"],
      isPrimary: false,
      intro: [
        "พนักงานแต่ละคนมีโควต้าสูงสุดของสินทรัพย์ที่สามารถถืออยู่พร้อมกันตาม job grade — ยกเว้นอุปกรณ์ที่ได้รับอนุมัติเฉพาะเพื่องานพิเศษ ซึ่งไม่นับในโควต้านี้",
        "การ assign สินทรัพย์ให้พนักงานที่ลาออกหรือถูก terminate แล้วจะถูก block โดยอัตโนมัติ {{ref:module:assignment-tracker}} ตรวจสอบสถานะพนักงานจาก HR system ก่อนทุก assign",
      ],
    },
    {
      slug: "software-audit-policy",
      title: "นโยบายการ Audit Software License ประจำไตรมาส",
      tags: ["license", "audit", "policy"],
      isPrimary: false,
      intro: [
        "ทุกไตรมาส {{ref:module:license-pool-manager}} จะ trigger การ sync ตัวเลข seat กับทุก vendor portal โดยอัตโนมัติ แล้วสร้างรายงาน utilization สำหรับทีม IT procurement เพื่อวางแผนต่อ license หรือลด subscription ที่ใช้น้อย",
        "License title ที่มี utilization ต่ำกว่า 40% ติดต่อกัน 2 ไตรมาสจะถูก flag ให้ทบทวนว่ายังจำเป็นต้องต่อหรือไม่ ก่อน renewal deadline ถัดไป",
      ],
    },
    {
      slug: "end-of-life-notification-policy",
      title: "นโยบายการแจ้ง End-of-Life ของสินทรัพย์",
      tags: ["lifecycle", "eol", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อ depreciation schedule ของสินทรัพย์ครบตามที่กำหนด (book value เหลือเป็นมูลค่าซากเท่านั้น) {{ref:module:depreciation-engine}} จะส่ง event ให้ทีม IT พิจารณาว่าสินทรัพย์ถึงเวลา dispose, refresh, หรือขยายอายุการใช้งาน",
        "การขยายอายุการใช้งานเกินกว่า schedule เดิมต้องมีการประเมินสภาพจากทีมเทคนิคและบันทึกเหตุผลไว้ใน {{ref:module:asset-registry}} เพื่อ audit trail",
      ],
    },
    {
      slug: "asset-tagging-policy",
      title: "นโยบายการติด Tag สินทรัพย์ทางกายภาพ",
      tags: ["tagging", "registry", "policy"],
      isPrimary: false,
      intro: [
        "สินทรัพย์ทุกชิ้นที่จดทะเบียนใน {{ref:module:asset-registry}} ต้องมี physical tag (barcode หรือ QR code) ที่พิมพ์จากระบบและติดบนตัวสินทรัพย์ก่อนนำออกจากห้อง receiving — ทีม IT ต้องยืนยัน tag ว่าติดครบก่อนปิด procurement request",
        "asset_id บน tag ต้องตรงกับที่อยู่ใน {{ref:module:asset-registry}} ทุกตัวอักษร — ถ้าพบว่า tag ผิดหรือหลุดออก ต้องรายงานและพิมพ์ tag ใหม่ผ่านกระบวนการที่มี audit log",
      ],
    },
    {
      slug: "hardware-refresh-cycle-policy",
      title: "นโยบายรอบการ Refresh Hardware",
      tags: ["hardware", "refresh", "lifecycle", "policy"],
      isPrimary: false,
      intro: [
        "แล็ปท็อปของพนักงานถูก refresh ทุก 3 ปีโดยไม่ต้องรอให้เสีย สอดคล้องกับ depreciation schedule เพื่อให้ cycle ตรงกัน ทีม IT จะเริ่มกระบวนการ procurement สำหรับรุ่นถัดไปล่วงหน้า 4 เดือนก่อนถึงรอบ refresh",
        "พนักงานที่ทำงานในสายงานที่ต้องการประสิทธิภาพสูงขึ้น เช่น data engineering หรือ design สามารถยื่น request ขอ refresh ก่อนรอบปกติได้ โดยต้องมี manager อนุมัติและระบุเหตุผลทางธุรกิจ",
      ],
    },
  ],
  incidents: [
    {
      slug: "asset-double-assigned-race-condition",
      title: "สินทรัพย์ถูก assign ให้พนักงานสองคนพร้อมกันจาก race condition",
      tags: ["assignment", "bug", "race-condition"],
      summary:
        "ทีม IT แจ้งว่าแล็ปท็อปเครื่องเดียวกัน (asset AT-2241) ปรากฏในรายการสินทรัพย์ของพนักงานสองคนพร้อมกัน ทั้งที่แต่ละคนได้รับแจ้งว่าการ assign สำเร็จแล้ว",
      investigation:
        "ตรวจ log `assignAsset` ใน {{ref:module:assignment-tracker}} พบว่ามี request สอง request จากสองฝ่ายต่างกัน เรียกในเวลาไล่เลี่ยกันน้อยกว่า 200ms — ทั้งคู่อ่านสถานะสินทรัพย์ว่า `unassigned` ก่อน commit",
      cause:
        "การตรวจสอบสถานะและการเปลี่ยนสถานะไม่ได้ทำแบบ atomic — ช่วงเวลาระหว่างอ่านและเขียนทำให้ request คู่ขนานแทรกเข้ามาได้ เหมือนกับ pattern ที่พบใน {{ref:incident:license-count-drift-manual-override}}",
      resolution:
        "แก้ `assignAsset` ให้ใช้ conditional update แบบ atomic (`UPDATE ... WHERE status='unassigned'`) และ rollback assignment ตัวหลังที่เกิดซ้ำออก แล้วแจ้งพนักงานที่ได้รับผลกระทบให้ submit request ใหม่",
      followup:
        "ตรวจสอบ function อื่นใน {{ref:module:assignment-tracker}} ที่มี pattern อ่าน-แล้ว-เขียนคล้ายกัน และเพิ่ม integration test สำหรับ concurrent assignment scenario",
    },
    {
      slug: "license-count-drift-manual-override",
      title: "จำนวน License Seat ใน Pool ต่างจาก Vendor จาก Manual Override",
      tags: ["license", "drift", "audit"],
      summary:
        "ระหว่าง quarterly audit พบว่า license pool ของ productivity suite บันทึกว่ามี seat 150 ตัว แต่ vendor portal แสดง 135 ตัว ทำให้ warning threshold ทำงานผิดเวลา",
      investigation:
        "ตรวจ audit log ของ {{ref:module:license-pool-manager}} พบว่าเมื่อสามเดือนก่อนมีการแก้ตัวเลข seat ผ่าน admin panel โดยตรงโดยไม่ผ่าน `syncLicenseCount` ทำให้ตัวเลขใน pool ไม่ตรงกับ vendor อีกต่อไป",
      cause:
        "ผู้ดูแลระบบตั้งใจแก้ตัวเลขชั่วคราวระหว่าง license negotiation แต่ลืม sync กลับหลังตกลงจำนวน seat ใหม่เสร็จ ตาม {{ref:policy:license-overallocation-policy}} การ override โดยตรงไม่ควรทำโดยไม่มี followup sync",
      resolution:
        "เรียก `syncLicenseCount` ด้วยตัวเลขจาก vendor portal เพื่อ reset ให้ถูกต้อง พบว่า allocation ปัจจุบัน 128 seat ยังอยู่ในเกณฑ์ที่ซื้อมาจริง ไม่มี overallocation",
      followup:
        "ปิด capability การแก้ seat count ด้วยมือผ่าน admin panel — ทุกการเปลี่ยนแปลงต้องผ่าน `syncLicenseCount` ที่มี audit log เท่านั้น",
    },
    {
      slug: "depreciation-wrong-start-date",
      title: "Depreciation Schedule คำนวณด้วยวันเริ่มต้นผิดทำให้ Book Value ผิดปีงบประมาณ",
      tags: ["depreciation", "finance", "bug"],
      summary:
        "ทีม finance พบระหว่างปิดบัญชีไตรมาสว่า server กลุ่มหนึ่ง (10 เครื่อง) มี book value สูงกว่าที่ควรจะเป็นเกือบ 20% เนื่องจาก depreciation เดินผิดจังหวะ",
      investigation:
        "ตรวจ schedule ใน {{ref:module:depreciation-engine}} พบว่า `startDate` ของ server กลุ่มนี้ถูก set เป็นวันที่ออก PO แทนที่จะเป็นวันที่รับสินค้าจริง ซึ่งต่างกันเกือบ 3 เดือน",
      cause:
        "ตอน `markAsReceived` ถูกเรียกโดย {{ref:module:procurement-handler}} มีการส่ง `purchaseDate` แทน `receivedDate` เป็น startDate ไปยัง {{ref:module:depreciation-engine}} เป็น bug ใน integration code ระหว่างสอง module",
      resolution:
        "เรียก `recomputeSchedule` สำหรับ server ทั้ง 10 เครื่องด้วย `correctedStartDate` ที่ถูกต้อง ทีม finance ทำ audit adjustment สำหรับไตรมาสที่บันทึกผิดไปแล้ว",
      followup:
        "แก้ integration code ใน {{ref:module:procurement-handler}} ให้ส่ง `receivedDate` แทน `purchaseDate` เสมอ และเพิ่ม test ที่ verify field นี้โดยเฉพาะ",
    },
    {
      slug: "procurement-approved-over-budget-limit",
      title: "Procurement Request ได้รับ Approve เกินวงเงิน Tier จากช่องโหว่ Rounding",
      tags: ["procurement", "approval", "bug"],
      summary:
        "request มูลค่า 500,001 บาท ผ่าน approval โดย manager (Tier 1) ได้ทั้งที่เกินวงเงิน `PROCUREMENT_TIER1_LIMIT_THB` ทำให้ director ไม่ได้รับโอกาส review",
      investigation:
        "ตรวจ code ใน {{ref:module:procurement-handler}} พบว่าการเปรียบเทียบ tier ใช้ `<=` กับค่าที่ตัดทศนิยมทิ้งก่อน ทำให้ 500,001 ถูกตัดเป็น 500,000 และผ่าน Tier 1 ได้",
      cause:
        "bug ในการ format ตัวเลขสำหรับ comparison — ค่าที่ส่งมาจากระบบ ERP มีทศนิยม แต่ logic การเทียบ tier ใช้ค่า truncated แทนที่จะ round หรือใช้ค่าจริง",
      resolution:
        "แก้ให้ใช้ตัวเลขจริงโดยไม่ตัดทศนิยมก่อนเปรียบเทียบ tier ยกเลิก approval ที่ผิดพลาดและ escalate request ดังกล่าวให้ director review ตามขั้นตอนปกติ",
      followup:
        "เพิ่ม test case สำหรับค่าที่อยู่บน boundary ของทุก tier โดยเฉพาะ และ review logic การเปรียบเทียบ tier ทั้งหมดใน {{ref:module:procurement-handler}} ครั้งเดียวกัน",
    },
    {
      slug: "asset-lost-during-location-transfer",
      title: "สินทรัพย์หายระหว่าง Transfer ระหว่างสำนักงาน",
      tags: ["assignment", "transfer", "audit"],
      summary:
        "แล็ปท็อป 3 เครื่องที่บันทึกว่า return จากสำนักงานกรุงเทพแล้วส่งไปเชียงใหม่ไม่ปรากฏในระบบของสาขาปลายทาง และไม่มีใน stock ของทั้งสองสำนักงาน",
      investigation:
        "ตรวจ assignment history ใน {{ref:module:assignment-tracker}} พบว่า return ถูก log เรียบร้อยที่ต้นทาง แต่ไม่มี `assignAsset` ใหม่ที่ปลายทางเลย สอบถามทีม logistics พบว่าถูกส่งพร้อม batch อื่น แต่ไม่มีใครสแกนรับที่ปลายทาง",
      cause:
        "ขั้นตอน receiving ที่สาขาปลายทางไม่บังคับการสแกน asset barcode ก่อนนำออกจากห้อง receiving ทำให้สินทรัพย์ถูกใช้งานโดยไม่มีการ assign อย่างเป็นทางการ",
      resolution:
        "ตามหาสินทรัพย์จากสาขาเชียงใหม่ พบ 2 เครื่องอยู่กับพนักงาน assign ย้อนหลังในระบบ เครื่องที่ 3 ยังหาไม่พบ และเปิด investigation แยก",
      followup:
        "ปรับกระบวนการ receiving ที่ทุกสาขาให้บังคับสแกน asset barcode ก่อน release ออกจากห้อง receiving และเพิ่ม alert ถ้าสินทรัพย์ที่ return แล้วยังไม่ได้ assign ใหม่เกิน 3 วัน",
    },
    {
      slug: "disposal-without-certification-completed",
      title: "สินทรัพย์ถูก Dispose โดยไม่มีใบรับรอง Data Destruction",
      tags: ["disposal", "compliance", "security"],
      summary:
        "พบระหว่าง compliance audit ว่า laptop 5 เครื่องถูก mark เป็น `disposed` ใน {{ref:module:asset-registry}} แต่ไม่มี data destruction certificate ใน {{ref:module:disposal-workflow}} สักฉบับ",
      investigation:
        "ตรวจ disposal record พบว่ามีคนใช้ admin endpoint ที่ bypass การตรวจสอบ certificate เพื่อ force complete disposal ของ laptop กลุ่มนี้โดยอ้างว่าเป็น emergency disposal จากเหตุฉุกเฉินทางกายภาพ",
      cause:
        "admin endpoint นี้สร้างไว้สำหรับกรณีฉุกเฉินจริง แต่ไม่มีการ require justification หรือ second approval ทำให้ถูกใช้โดยไม่เหมาะสมตาม {{ref:policy:disposal-certification-policy}}",
      resolution:
        "บันทึกเหตุการณ์ไว้ใน compliance incident log และตามหาใบรับรองย้อนหลังจากผู้ให้บริการ destroy ข้อมูล ได้ 4 จาก 5 เครื่อง เครื่องที่เหลือต้องทำ forensic investigation",
      followup:
        "เพิ่ม mandatory justification และ second approval สำหรับ admin disposal endpoint พร้อมแจ้งเตือนอัตโนมัติไปยัง security team ทุกครั้งที่ endpoint นี้ถูกใช้",
    },
    {
      slug: "license-pool-sync-failure",
      title: "License Pool Sync ล้มเหลวเงียบๆ ทำให้ Warning ไม่ถูก Trigger",
      tags: ["license", "sync", "reliability"],
      summary:
        "ระบบไม่ได้รับ warning ที่ควรจะเกิดขึ้นเมื่อ seat utilization เกิน 90% เนื่องจาก sync job ล้มเหลวโดยไม่มีใครรู้มาหลายสัปดาห์",
      investigation:
        "ตรวจ log ของ `syncLicenseCount` job พบว่า vendor API มีการเปลี่ยน authentication endpoint เมื่อ 3 สัปดาห์ก่อน ทำให้ job ล้มเหลวทุกครั้ง แต่ error ถูก swallow แทนที่จะ alert ออกมา",
      cause:
        "error handling ใน sync job จัดการ authentication failure เหมือนกับ transient network error ทั่วไป — retry แล้วก็ fail เงียบๆ แทนที่จะ escalate หลังจาก fail ต่อเนื่องเกินเกณฑ์",
      resolution:
        "อัปเดต API credential ให้ตรงกับ endpoint ใหม่ของ vendor และรัน sync แบบ manual ทันทีเพื่อ refresh ตัวเลขที่ค้างอยู่ พบว่ามี 2 title ที่ utilization เกิน 90% ต้องดำเนินการ procurement เพิ่ม",
      followup:
        "เพิ่ม alert สำหรับ sync job ที่ fail ต่อเนื่องเกิน 2 รอบ และแยก error handling ระหว่าง authentication failure กับ transient network error ให้ชัดเจน",
    },
    {
      slug: "asset-registry-bulk-import-error",
      title: "Bulk Import สินทรัพย์ใหม่ 200 ชิ้น Error กลางคัน ทำให้ข้อมูลขาดหาย",
      tags: ["registry", "import", "data-quality"],
      summary:
        "หลังจาก import สินทรัพย์ใหม่จาก procurement batch ใหญ่ ทีม IT พบว่ามีสินทรัพย์แค่ 147 ชิ้นใน {{ref:module:asset-registry}} ทั้งที่ batch มี 200 ชิ้น",
      investigation:
        "ตรวจ import log พบว่า import script หยุดทำงานกลางคันเมื่อเจอ row ที่ serial number ซ้ำกันใน batch เดียวกัน แต่ไม่มีการ rollback ของ row ที่ import ไปก่อนหน้าแล้ว",
      cause:
        "import script ไม่ได้ wrap ทั้ง batch ในการ transaction เดียว ทำให้เมื่อ error เกิด ส่วนที่ import ไปแล้วยังคงอยู่ในระบบ สร้างสถานะ partial import ที่ตรวจสอบยาก",
      resolution:
        "ลบ record ที่ import ผิดพลาดออก ตรวจสอบ serial number ที่ซ้ำและแก้ไขต้นทาง แล้ว re-import ทั้ง batch ใหม่เป็นครั้งเดียวใน transaction เดียว",
      followup:
        "แก้ import script ให้ใช้ transaction แบบ all-or-nothing และ validate ความ uniqueness ของ serial number ทั้ง batch ก่อน import จริง",
    },
    {
      slug: "depreciation-negative-book-value",
      title: "Depreciation Engine คำนวณ Book Value ติดลบสำหรับสินทรัพย์บางชิ้น",
      tags: ["depreciation", "bug", "finance"],
      summary:
        "ทีม finance พบว่าสินทรัพย์ 8 ชิ้นมี book value ติดลบในรายงาน ซึ่งตรรกะไม่ถูกต้องเพราะ book value ต้องไม่ต่ำกว่ามูลค่าซาก",
      investigation:
        "ตรวจ {{ref:module:depreciation-engine}} พบว่า `computeCurrentBookValue` ไม่มีการ floor ค่าที่ residual value — ถ้า useful life สั้นกว่าที่ schedule คาดไว้ ค่าจะติดลบได้",
      cause:
        "logic การคำนวณสำหรับ Double-declining balance ใน edge case ที่สินทรัพย์มีการ recompute schedule กลางอายุการใช้งาน ไม่ได้ recalculate floor ใหม่ให้ถูกต้อง",
      resolution:
        "เพิ่ม floor check ใน `computeCurrentBookValue` ให้ never return ค่าต่ำกว่า residual value ที่กำหนด และ recompute ค่าของสินทรัพย์ทั้ง 8 ชิ้นใหม่",
      followup:
        "เพิ่ม property-based test ที่ verify ว่า book value ไม่เคยต่ำกว่า residual value ในทุก scenario รวมถึง schedule ที่ถูก recompute กลางคัน",
    },
    {
      slug: "procurement-vendor-mismatch",
      title: "สินทรัพย์ที่รับมาไม่ตรงกับ Vendor ที่ Approve ใน Request",
      tags: ["procurement", "vendor", "audit"],
      summary:
        "ระหว่าง receiving team พบว่า laptop ที่ส่งมาเป็นยี่ห้อต่างจากที่ระบุใน approved procurement request ทำให้เกิดคำถามว่าจะ `markAsReceived` ได้หรือไม่",
      investigation:
        "ตรวจ {{ref:module:procurement-handler}} พบว่าไม่มี validation เชื่อม vendor ใน approved request กับ vendor ในใบส่งสินค้าจริง — ระบบยอมรับข้อมูลจาก receiving form โดยไม่เปรียบเทียบ",
      cause:
        "ขั้นตอน procurement มีการ lock vendor ตอน approval แต่ receiving form ไม่ได้ enforce ว่าของที่มาต้องตรงกับที่ approve ไว้ มีช่องว่างระหว่าง approval และ receiving",
      resolution:
        "ระงับการ `markAsReceived` จนกว่า procurement manager จะ approve การเปลี่ยน vendor ใน request ใหม่ — ระบบยังไม่รองรับ vendor change post-approval จึงต้อง create request ใหม่",
      followup:
        "เพิ่ม vendor validation ใน `markAsReceived` และสร้าง change request workflow สำหรับกรณีที่ vendor เปลี่ยนหลัง approval",
    },
    {
      slug: "assignment-tracker-orphaned-asset",
      title: "สินทรัพย์ถูก Return แต่ไม่กลับเข้า Available Pool",
      tags: ["assignment", "bug", "lifecycle"],
      summary:
        "ทีม IT พบว่ามีแล็ปท็อปหลายเครื่องที่ return แล้วแต่ไม่ปรากฏใน `listUnassignedAssets` ทำให้ทีมไม่รู้ว่ามีเครื่องว่างอยู่และสั่ง procurement เพิ่มโดยไม่จำเป็น",
      investigation:
        "ตรวจ log `returnAsset` ใน {{ref:module:assignment-tracker}} พบว่า return สำเร็จแต่ event ที่ส่งให้ {{ref:module:asset-registry}} อัปเดตสถานะล้มเหลวเงียบๆ เนื่องจาก registry service ล่มชั่วคราวตอนนั้น",
      cause:
        "การเรียก asset-registry ตอน return เป็น synchronous call ที่ไม่มี retry logic — ถ้า registry unavailable ตอนนั้น การอัปเดตสถานะจะหาย ไม่มีกลไก reconcile ย้อนหลัง",
      resolution:
        "ค้นหา asset ทั้งหมดที่มี return log แต่สถานะใน registry ยัง `assigned` แล้ว force update สถานะให้ถูกต้อง พบ 14 เครื่องที่ orphaned",
      followup:
        "เปลี่ยนการแจ้ง registry เมื่อ return ให้เป็น async event ที่มี retry และ dead-letter queue แทนที่จะเป็น synchronous call ที่ fail แล้วหายไปเลย",
    },
    {
      slug: "maintenance-contract-missed-renewal",
      title: "สัญญาบำรุงรักษา Server หมดโดยไม่มีการ Renew",
      tags: ["maintenance", "contract", "alert"],
      summary:
        "สัญญาบำรุงรักษาของ server cluster 3 ตัวหมดอายุโดยไม่มีใครสังเกต ทำให้เมื่อ server หนึ่งในนั้นเกิดปัญหา hardware ไม่สามารถเรียก vendor support ได้",
      investigation:
        "ตรวจประวัติ alert พบว่าระบบส่ง notification 90 วันล่วงหน้าครบแล้ว แต่ email ไปถึง distribution list เดิมที่ไม่มีคนในทีม IT ปัจจุบันอยู่ในนั้น เพราะมีการ reorganize ทีม 4 เดือนก่อน",
      cause:
        "ระบบ alert ส่งไปยัง email group ที่ hard-code ไว้ตั้งแต่ครั้งแรก ไม่มีกลไก maintain ว่า group นั้นยังมีคนที่ถูกต้องอยู่หรือไม่ตาม {{ref:policy:maintenance-renewal-notice-policy}}",
      resolution:
        "ติดต่อ vendor negotiate สัญญาฉุกเฉินระยะสั้น 3 เดือนระหว่างดำเนิน procurement สัญญาถาวร และอัปเดต distribution list ให้ตรงกับทีมปัจจุบัน",
      followup:
        "เปลี่ยนระบบ alert ให้ look up owner ของสินทรัพย์จาก {{ref:module:asset-registry}} แบบ dynamic แทนที่จะ hard-code email group และทบทวน owner ทุกครั้งที่มีการ reorganize",
    },
    {
      slug: "disposal-queue-stale-asset",
      title: "Disposal Queue มีสินทรัพย์ค้างโดยไม่มีใครติดตาม",
      tags: ["disposal", "lifecycle", "backlog"],
      summary:
        "ระหว่าง audit พบว่ามี disposal request กว่า 30 รายการที่เปิดค้างอยู่นานกว่า 6 เดือน โดยไม่มีใบรับรองแนบและไม่มีใครติดตาม",
      investigation:
        "ตรวจ {{ref:module:disposal-workflow}} พบว่า request เหล่านี้อยู่ในสถานะ `pending_certification` — request ถูกเปิดแต่ผู้รับผิดชอบหรือออกจากบริษัทแล้วหรือย้ายทีม ทำให้ไม่มีคนดำเนินการต่อ",
      cause:
        "ระบบไม่มี alert สำหรับ disposal request ที่ค้างเกินเกณฑ์เวลา และไม่มีกลไก reassign owner เมื่อพนักงานออกจากบริษัท",
      resolution:
        "ส่ง request ทั้งหมดให้ทีม IT lead review และ assign owner ใหม่ให้แต่ละ request — batch ที่เป็น hardware เก่าที่ชัดเจนสามารถ close ได้เร็วด้วยการ fast-track certification",
      followup:
        "เพิ่ม escalation alert สำหรับ disposal request ที่ไม่มีความเคลื่อนไหวเกิน 30 วัน และ auto-reassign ให้ IT manager เมื่อ owner ออกจากบริษัท",
    },
    {
      slug: "license-overallocation-alert-missed",
      title: "Alert Overallocation ไม่ถูก Trigger ทำให้ไปซื้อ License ฉุกเฉิน",
      tags: ["license", "alert", "compliance"],
      summary:
        "องค์กรถูก vendor ระงับ license batch ใหม่เพราะตรวจพบ overallocation โดยที่ทีม IT ไม่ได้รับ warning ล่วงหน้าใดๆ จาก {{ref:module:license-pool-manager}}",
      investigation:
        "ตรวจ threshold config พบว่า `LICENSE_WARNING_THRESHOLD_PCT` ถูกเปลี่ยนเป็น 110% ในสภาพแวดล้อม production โดยไม่มีใครสังเกต ค่านี้สูงกว่า 100% จึงไม่มี alert ออกมาเลย",
      cause:
        "การ deploy config ครั้งหนึ่งนำค่าจาก staging environment ที่ตั้งไว้สำหรับทดสอบ (อนุญาต overallocation เพื่อ simulate) มาใช้ใน production โดยไม่ได้ตรวจสอบก่อน",
      resolution:
        "แก้ config กลับเป็น 90% และซื้อ license เพิ่มฉุกเฉินเพื่อ clear overallocation ทันที ติดต่อ vendor negotiate ให้งดค่าปรับเพราะเป็น config error ไม่ใช่การใช้งานจงใจ",
      followup:
        "เพิ่ม validation ใน deployment pipeline ที่ reject ถ้า `LICENSE_WARNING_THRESHOLD_PCT` เกิน 100% ในทุก environment และแยก config สำหรับ testing ให้ไม่ปะปนกับ production",
    },
  ],
  conventions: [
    {
      slug: "asset-id-format",
      title: "Asset ID Format",
      tags: ["naming", "registry"],
      intro: "รูปแบบ asset_id ต้องตรงกันระหว่างระบบ AssetTrack และ label ทางกายภาพที่ติดบนสินทรัพย์จริง ความไม่ตรงกันทำให้ audit พบปัญหาที่ตามแก้ยาก",
      sections: [
        { heading: "รูปแบบ", body: "`AT-<4 หลัก>` เช่น `AT-0001`, `AT-2241` — ตัวอักษรพิมพ์ใหญ่เสมอ คั่นด้วย `-` เท่านั้น ห้ามใช้ underscore หรือช่องว่าง" },
        { heading: "กติกา", body: "ห้ามนำ asset_id เก่าที่ dispose แล้วมาใช้ซ้ำ — running number วิ่งขึ้นเสมอ ไม่ recycle เพื่อให้ audit trail ไม่ปนกัน" },
      ],
    },
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/ASSET-102-disposal-certification-check`, `fix/ASSET-119-license-sync-retry`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ type prefix" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(license-pool-manager): แก้ race condition ตอน allocate seat พร้อมกัน`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่เปลี่ยนสถานะสินทรัพย์หรือ allocation ต้องทำแบบ atomic เสมอ (บทเรียนจาก {{ref:incident:asset-double-assigned-race-condition}}) และ config ที่กระทบ threshold ต้องมีคนที่สองยืนยันก่อน merge (บทเรียนจาก {{ref:incident:license-overallocation-alert-missed}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `allocateLicense`, `completeDisposal` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier สินทรัพย์", body: "`assetId` รูปแบบ `AT-<4 หลัก>` ตรงกับ {{ref:convention:asset-id-format}} เสมอ, `productId` สำหรับ license ใช้รูปแบบที่ vendor กำหนด" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ asset lifecycle ต้องมี `assetId` เสมอ เพื่อไล่ log ข้าม module ได้ (asset-registry → assignment-tracker → disposal-workflow) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "compliance-related action เช่น disposal, license allocation/revoke log เป็น `info` เสมอแม้ปกติ เพื่อให้ audit trail ครบถ้วนแม้ไม่เกิด error" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw database error ออกไปตรงๆ" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`ASSET_<DOMAIN>_<REASON>` เช่น `ASSET_LICENSE_OVERALLOCATED`, `ASSET_DISPOSAL_CERT_MISSING` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`ASSET_REGISTRY_NOT_FOUND`, `ASSET_ASSIGNMENT_ALREADY_ASSIGNED`, `ASSET_PROCUREMENT_TIER_EXCEEDED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Atomic operation test", body: "ฟังก์ชันที่เปลี่ยนสถานะสินทรัพย์ทุกตัวต้องมี test จำลอง concurrent call อย่างน้อย 2 request พร้อมกัน — บทเรียนจาก {{ref:incident:asset-double-assigned-race-condition}}" },
        { heading: "Compliance scenario test", body: "กระบวนการ disposal ต้อง test ครบทุก certification path รวมถึง `data-bearing` vs `non-data-bearing` asset ดู {{ref:policy:disposal-certification-policy}}" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (ครอบคลุม concurrent scenario) → deploy staging → smoke test → deploy production ทีละ module ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:license-pool-manager}} และ {{ref:module:disposal-workflow}} ต้องผ่าน compliance test 100% ก่อน merge เสมอ เพราะ bug ใน module เหล่านี้กระทบ audit โดยตรง" },
      ],
    },
    {
      slug: "database-migration-runbook",
      title: "Database Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อ schema ของตาราง `assets`, `depreciation_schedules`, หรือ `disposal_records` เปลี่ยน ต้องรัน migration script ในช่วงนอก business hour เพราะ table เหล่านี้มีการ read/write ตลอด" },
        { heading: "ขั้นตอน", body: "1) backup database ก่อนเสมอ 2) รัน migration บน staging ก่อนและ verify ด้วยข้อมูลจำลอง 3) รัน production ในช่วงที่กำหนด 4) ยืนยันข้อมูลหลัง migrate ด้วย checksum" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = compliance breach หรือ data loss risk (disposal ไม่มีใบรับรอง, overallocation ที่ vendor ตรวจพบ), Sev2 = ข้อมูลสินทรัพย์ไม่ถูกต้องแต่ยังไม่ส่งผลต่อ audit, Sev3 = UI/report เสียแต่ core data ยังถูก" },
        { heading: "กรณี compliance breach", body: "ทุกเหตุการณ์ที่กระทบ audit readiness ต้องแจ้ง compliance officer ภายใน 2 ชั่วโมง และเขียน incident report ภายใน 24 ชั่วโมง ไม่ว่า severity จะเป็นเท่าไหร่" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "license pool utilization เกิน `LICENSE_WARNING_THRESHOLD_PCT`, sync job ล้มเหลวเกิน 2 รอบติดต่อกัน, disposal request ค้างเกิน 30 วันโดยไม่มีความเคลื่อนไหว, depreciation schedule ที่ไม่สามารถสร้างได้เมื่อ asset ใหม่เข้าระบบ" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1 แจ้ง on-call และ compliance officer ทันที ส่วน Sev2/3 รวมเป็น digest รายชั่วโมง" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ disposal certification check หยุดทำงาน หรือ license allocation ทำงานผิด ต้อง rollback ทันทีโดยไม่ต้องรอ approval — compliance risk สูงกว่า downtime risk" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกัน (ไม่ skip smoke test) แล้วตรวจสอบว่า compliance-sensitive function กลับมาทำงานถูกต้องก่อนแจ้งว่า rollback สำเร็จ" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Trigger |\n|---|---|---|---|\n| asset-registry | 2 | 6 | CPU > 70% |\n| license-pool-manager | 2 | 4 | RPS > 500 |\n| depreciation-engine | 1 | 3 | ช่วง batch job รายคืน |\n| disposal-workflow | 1 | 2 | Queue depth > 50 |" },
        { heading: "Batch job window", body: "depreciation-engine รัน batch คำนวณ schedule ประจำปีในช่วงตี 2-4 ซึ่งเป็นช่วง load ต่ำที่สุด ควบคุม concurrency ไม่ให้กระทบ service อื่นในช่วง business hour" },
      ],
    },
    {
      slug: "audit-report-generation",
      title: "Audit Report Generation Runbook",
      tags: ["audit", "compliance", "runbook"],
      sections: [
        { heading: "รายงานที่ต้องสร้างประจำปี", body: "1) Asset inventory report (ทุก asset พร้อมสถานะปัจจุบัน) 2) License compliance report (utilization vs. entitlement) 3) Disposal audit trail (ทุก disposal พร้อมใบรับรอง) 4) Depreciation schedule summary สำหรับทีม finance" },
        { heading: "ขั้นตอน", body: "รัน report generation script ในช่วง off-peak เพราะต้องอ่าน full scan จากหลาย module พร้อมกัน ส่ง report ให้ compliance officer และ CFO ไม่เกิน 5 วันทำการหลังปิด fiscal year" },
      ],
    },
    {
      slug: "index-rebuild-runbook",
      title: "Search Index Rebuild Runbook",
      tags: ["index", "maintenance", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rebuild", body: "ถ้า asset search ใน {{ref:module:asset-registry}} ช้าลงผิดปกติ หรือหลังจาก bulk import/migration ขนาดใหญ่ที่ไม่ได้ update index incrementally" },
        { heading: "ขั้นตอน", body: "1) ปิด write ชั่วคราวหรือ queue write request 2) รัน index rebuild (ใช้เวลาประมาณ 10-30 นาทีตามขนาด database) 3) verify ด้วย sample search query ว่า result ถูกต้อง 4) เปิด write กลับ" },
      ],
    },
  ],
};
