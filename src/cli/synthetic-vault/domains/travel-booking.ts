import type { DomainProfile } from "../types.js";

// TripLedger — ระบบจองที่พักและการเดินทาง (travel/hotel booking platform)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const travelBooking: DomainProfile = {
  id: "travel-booking",
  displayName: "TripLedger — ระบบจองที่พักและการเดินทาง",
  summary: [
    "TripLedger คือแพลตฟอร์มค้นหาและจองที่พัก/ตั๋วเดินทาง ที่รวบรวม inventory จากซัพพลายเออร์ภายนอกหลายสิบราย (โรงแรม, OTA พันธมิตร, สายการบินบางเส้นทาง) มาไว้ในจุดค้นหาเดียว ระบบไม่ได้เป็นเจ้าของห้องพักหรือที่นั่งจริง — ทุก inventory เป็นของซัพพลายเออร์ TripLedger ทำหน้าที่เป็นชั้นรวม ค้นหา จอง และจัดการวงจรชีวิตของการจองเท่านั้น",
    "ความท้าทายหลักของระบบคือ inventory ที่แสดงในการค้นหาเป็น \"ภาพสะท้อน\" ของสิ่งที่ซัพพลายเออร์มีจริง ไม่ใช่แหล่งความจริงเดียวกัน — มีช่วงเวลาที่ตัวเลขไม่ตรงกันเสมอ (staleness) ทีมวิศวกรรมออกแบบระบบทั้งชุดโดยยอมรับความจริงข้อนี้ตั้งแต่ต้น แทนที่จะแสร้งว่า cache กับความจริงตรงกันเป๊ะตลอดเวลา ช่วงที่ปัญหาชัดที่สุดคือ high season (ธันวาคม-มกราคม และเทศกาลสงกรานต์) ที่ inventory หมุนเร็วผิดปกติ",
  ],
  domainTags: ["travel-booking", "tripledger"],
  serviceBoundaryNote: [
    "{{ref:module:supplier-sync}} เป็นเจ้าของ snapshot inventory ที่ sync มาจากซัพพลายเออร์ล่าสุด ส่วน {{ref:module:price-cache}} เป็นเจ้าของ **ราคา** ที่ cache ไว้เท่านั้น สองอย่างนี้แยกกันโดยเจตนาเพราะราคาผันผวนบ่อยกว่าจำนวนห้องว่างมาก การรวมสองอย่างไว้ที่เดียวจะทำให้ invalidate cache บ่อยเกินจำเป็นเวลาแค่ราคาขยับแต่ห้องว่างไม่เปลี่ยน",
    "{{ref:module:booking-engine}} เป็น service เดียวที่มีสิทธิ์เขียนสถานะ `bookings` — {{ref:module:itinerary-builder}} อ่านข้อมูล booking ที่ยืนยันแล้วมาประกอบเป็นทริป แต่ไม่แก้สถานะ booking เอง ส่วน {{ref:module:cancellation-handler}} แก้สถานะ booking ได้เฉพาะ transition ไปทาง `cancelled` เท่านั้น เพื่อไม่ให้ logic การยกเลิกไปแตะ state อื่นที่ไม่เกี่ยวข้อง",
  ],
  apiGatewayNote: [
    "คำขอค้นหา (search) เข้าทาง gateway แล้วกระจายไปยัง {{ref:module:availability-search}} แบบ synchronous เพราะผู้ใช้รอผลลัพธ์อยู่หน้าจอ — gateway ตั้ง timeout รวมไว้ที่ 3 วินาที ถ้าซัพพลายเออร์รายไหนตอบช้ากว่านั้นจะถูกตัดออกจากผลลัพธ์รอบนั้นแล้วให้ผลจากรายที่เหลือแทน ไม่ปล่อยให้ทั้งหน้าค้าง",
    "คำขอยืนยันการจอง (`POST /bookings`) เป็น synchronous เช่นกันเพราะต้องคืนเลขที่จองให้ผู้ใช้ทันที แต่ขั้นตอนที่ตามมาหลังยืนยัน (ส่งอีเมล, sync กลับไปหาซัพพลายเออร์, อัปเดต loyalty point) ทำแบบ asynchronous ผ่าน event ทั้งหมด ดู {{ref:arch:queue}}",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:booking-engine}} ดูแลคือ `bookings` และ `booking_holds` (การจองชั่วคราวก่อนยืนยัน) ส่วน `itineraries` เป็นของ {{ref:module:itinerary-builder}} ที่อ้างอิง booking หลายตัวรวมเป็นทริปเดียว",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `bookings` | booking-engine | สถานะสุดท้ายของการจองแต่ละรายการ |\n| `booking_holds` | booking-engine | การจองชั่วคราว TTL สั้น ก่อนยืนยันจริง |\n| `supplier_inventory_snapshot` | supplier-sync | ภาพล่าสุดของ inventory จากแต่ละซัพพลายเออร์ |\n| `itineraries` | itinerary-builder | รวม booking หลายตัวเป็นทริปเดียวสำหรับผู้เดินทาง |\n| `refunds` | cancellation-handler | ประวัติการคืนเงินแยกจาก booking หลัก |",
    "`price_cache` ไม่ได้อยู่ใน database หลัก — เก็บใน in-memory store แยกต่างหาก (ดู {{ref:module:price-cache}}) เพราะต้องการความเร็วในการอ่านสูงกว่าที่ database ทั่วไปให้ได้ และยอมรับได้ว่าข้อมูลหายได้ถ้า service restart เพราะ warm cache ใหม่จากซัพพลายเออร์ได้เสมอ",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `booking.hold_created`, `booking.confirmed`, `booking.cancelled`, `inventory.sync_completed`, `price.invalidated` — {{ref:module:itinerary-builder}} subscribe `booking.confirmed` เพื่อประกอบทริปโดยไม่ต้อง poll {{ref:module:booking-engine}} เอง",
    "{{ref:module:price-cache}} subscribe `inventory.sync_completed` จาก {{ref:module:supplier-sync}} เพื่อรู้ว่าเมื่อไหร่ควร invalidate ราคาที่ cache ไว้ — การแยก event สองเส้นนี้ (sync inventory คนละเส้นกับ invalidate price) คือจุดที่ทีมมองย้อนกลับไปว่าน่าจะเป็นต้นตอของปัญหา staleness หลายครั้ง เพราะ event หายหรือมาช้าได้โดยอีกฝั่งไม่รู้ตัว",
  ],
  modules: [
    {
      slug: "availability-search",
      name: "availability-search",
      tags: ["search", "module", "core"],
      description:
        "รับ query ค้นหาจากผู้ใช้ (ปลายทาง, วันเข้าพัก, จำนวนผู้เข้าพัก) แล้ว fan-out ไปหาซัพพลายเออร์ที่เกี่ยวข้องแบบขนาน รวมผลลัพธ์และจัดอันดับก่อนส่งกลับ เป็น stateless service ล้วนๆ ไม่เก็บ inventory เองแม้แต่น้อย พึ่งพา {{ref:module:price-cache}} เพื่อลด latency แทนการยิงหาซัพพลายเออร์ทุกครั้ง",
      functions: [
        { sig: "searchAvailability(criteria: SearchCriteria): Promise<AvailabilityResult[]>", desc: "จุดเข้าเดียวของการค้นหา กระจาย query ไปหลายซัพพลายเออร์พร้อมกัน" },
        { sig: "rankResults(results: AvailabilityResult[], prefs: RankingPrefs): AvailabilityResult[]", desc: "จัดอันดับผลลัพธ์ตามราคา/ระยะทาง/rating ผสมกัน" },
        { sig: "excludeDegradedSuppliers(supplierIds: string[]): void", desc: "ตัดซัพพลายเออร์ที่ถูก mark degraded ออกจากรอบค้นหาถัดไปชั่วคราว" },
      ],
      relatedNotes:
        "ไม่เรียกซัพพลายเออร์ตรงถ้ามีราคาที่ยัง valid อยู่ใน {{ref:module:price-cache}} — เรียกตรงเฉพาะตอน cache miss เท่านั้น เพื่อไม่ให้ปริมาณ query ไปกระทบ rate limit ของซัพพลายเออร์แต่ละราย ผลการค้นหาที่ส่งกลับไม่ใช่การจองห้อง แค่แสดงว่ามีโอกาสจองได้ ณ เวลานั้น",
      internals: {
        constants: [
          { name: "SEARCH_TIMEOUT_MS", value: "3000" },
          { name: "MAX_SUPPLIERS_PER_QUERY", value: "12" },
          { name: "DEFAULT_RESULT_LIMIT", value: "40" },
        ],
        typeSnippet:
          "interface AvailabilityResult {\n  offerId: string;\n  supplierId: string;\n  priceMinor: number;\n  currency: string;\n  roomsLeft: number | null;\n  cacheAgeMs: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่อง cache staleness ที่ {{ref:policy:price-cache-staleness-policy}}",
      },
    },
    {
      slug: "booking-engine",
      name: "booking-engine",
      tags: ["booking", "module", "core"],
      description:
        "หัวใจของระบบ — รับผิดชอบการจองจริงตั้งแต่ hold inventory ชั่วคราวจนถึงยืนยันการจอง เป็น service เดียวที่มีสิทธิ์เขียนสถานะ `bookings` และ `booking_holds` ทุกอย่างที่แตะเงินหรือสิทธิ์ในห้องต้องผ่านตัวนี้เท่านั้น",
      functions: [
        { sig: "holdInventory(offerId: string, ttlSec: number): Promise<HoldToken>", desc: "จองห้องชั่วคราวระหว่างผู้ใช้กรอกข้อมูลชำระเงิน" },
        { sig: "confirmBooking(holdToken: string, paymentRef: string): Promise<BookingResult>", desc: "ยืนยันการจองจริงจาก hold ที่ยังไม่หมดอายุ" },
        { sig: "releaseHold(holdToken: string, reason: string): Promise<void>", desc: "ปล่อย hold คืนก่อนหมดอายุ เช่น ผู้ใช้ยกเลิกเองระหว่างกรอกฟอร์ม" },
      ],
      stateFlow: "held → confirmed | expired | released — ดู {{ref:policy:booking-hold-atomicity-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่สอง hold ชนกันได้",
      relatedNotes:
        "`confirmBooking` เช็คว่า hold ยังไม่หมดอายุก่อนเสมอ ถ้าหมดอายุแล้วจะปฏิเสธทันทีแม้การชำระเงินจะสำเร็จฝั่ง payment provider แล้วก็ตาม (กรณีนี้ต้อง refund เงินคืนแยกต่างหาก ไม่ใช่หน้าที่ของ booking-engine) — {{ref:module:itinerary-builder}} ฟัง event `booking.confirmed` เพื่อประกอบทริปต่อ",
      internals: {
        constants: [
          { name: "BOOKING_HOLD_TTL_SEC", value: "600" },
          { name: "MAX_CONCURRENT_HOLDS_PER_OFFER", value: "= จำนวนห้องว่างจริง ณ ขณะนั้น" },
        ],
        typeSnippet:
          "interface BookingResult {\n  bookingId: string;\n  status: \"confirmed\" | \"rejected\";\n  offerId: string;\n  rejectReason?: \"hold_expired\" | \"inventory_unavailable\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการกัน double-booking ที่ {{ref:policy:booking-hold-atomicity-policy}}",
      },
    },
    {
      slug: "price-cache",
      name: "price-cache",
      tags: ["pricing", "cache", "module"],
      description:
        "cache ราคาล่าสุดที่ query มาจากซัพพลายเออร์ไว้ใน in-memory store เพื่อให้ {{ref:module:availability-search}} ตอบเร็วโดยไม่ต้องยิงหาซัพพลายเออร์ทุก request แยกออกจาก inventory snapshot ของ {{ref:module:supplier-sync}} โดยเจตนา เพราะราคาผันผวนบ่อยกว่าห้องว่างมาก",
      functions: [
        { sig: "getCachedPrice(offerId: string): Promise<CachedPrice | null>", desc: "คืนราคาที่ cache ไว้ถ้ายังไม่หมดอายุ" },
        { sig: "invalidate(offerId: string): Promise<void>", desc: "ล้าง entry เดี่ยวเมื่อรู้ว่าราคาเปลี่ยนแล้ว" },
        { sig: "warmCache(supplierId: string): Promise<void>", desc: "ดึงราคาชุดใหญ่จากซัพพลายเออร์มาเติม cache ล่วงหน้าตอน off-peak" },
      ],
      relatedNotes:
        "subscribe event `inventory.sync_completed` จาก {{ref:module:supplier-sync}} เพื่อรู้ว่าเมื่อไหร่ควร invalidate — แต่ไม่ได้รับประกันว่าราคาที่ cache ไว้จะตรงกับความจริงเสมอ ดูเงื่อนไขยอมรับความคลาดเคลื่อนที่ {{ref:policy:price-cache-staleness-policy}}",
    },
    {
      slug: "itinerary-builder",
      name: "itinerary-builder",
      tags: ["itinerary", "module"],
      description:
        "ประกอบ booking ที่ยืนยันแล้วหลายตัว (เช่น ที่พัก + เที่ยวบิน) ให้เป็นทริปเดียวที่ผู้เดินทางเห็นภาพรวมได้ในหน้าจอเดียว รวมถึงสร้างอีเมลยืนยันที่มีเวลาเช็คอิน/เช็คเอาต์ครบทุกส่วนของทริป",
      functions: [
        { sig: "buildItinerary(bookingIds: string[]): Promise<Itinerary>", desc: "รวม booking หลายตัวที่ระบุเป็นทริปเดียว" },
        { sig: "addSegment(itineraryId: string, bookingId: string): Promise<void>", desc: "เพิ่ม booking เข้าทริปที่มีอยู่แล้ว เช่น จองที่พักเพิ่มระหว่างทาง" },
        { sig: "renderConfirmationEmail(itineraryId: string, travelerTz: string): Promise<string>", desc: "สร้างเนื้อหาอีเมลยืนยัน แปลงเวลาทุก segment เป็น timezone ของผู้เดินทาง" },
      ],
      relatedNotes:
        "อ่านข้อมูลจาก {{ref:module:booking-engine}} ผ่าน event `booking.confirmed` เท่านั้น ไม่ query ตาราง `bookings` ตรงๆ เพื่อไม่ให้สอง service ผูก schema กันแน่นเกินไป — เวลาที่แสดงในอีเมลต้องแปลงจาก timezone ของสถานที่พักไปเป็น timezone ของผู้เดินทางเสมอ ดู {{ref:policy:itinerary-confirmation-timezone-policy}}",
    },
    {
      slug: "cancellation-handler",
      name: "cancellation-handler",
      tags: ["cancellation", "refund", "module", "core"],
      description:
        "จัดการการยกเลิกการจองทั้งหมด ตั้งแต่คำนวณค่าธรรมเนียมที่ต้องหักตามช่วงเวลาที่ยกเลิก ไปจนถึงสั่งคืนเงินจริงผ่าน payment provider แยกออกมาจาก {{ref:module:booking-engine}} เพราะ logic การคำนวณค่าธรรมเนียมซับซ้อนขึ้นเรื่อยๆ ตามเงื่อนไข rate code ของแต่ละซัพพลายเออร์",
      functions: [
        { sig: "cancelBooking(bookingId: string, reason: string): Promise<CancellationResult>", desc: "เริ่มกระบวนการยกเลิก คำนวณค่าธรรมเนียมและสถานะคืนเงิน" },
        { sig: "computeRefundAmount(bookingId: string, cancelledAt: Date): Promise<RefundBreakdown>", desc: "คำนวณจำนวนเงินคืนตาม proration ของช่วงเวลาที่เหลือ" },
        { sig: "processRefund(bookingId: string, breakdown: RefundBreakdown): Promise<void>", desc: "สั่งคืนเงินจริงผ่าน payment provider ตามยอดที่คำนวณได้" },
      ],
      stateFlow: "requested → fee_calculated → refund_processing → refunded | refund_stuck — ดู {{ref:policy:cancellation-refund-proration-policy}}",
      relatedNotes:
        "`cancelBooking` แก้สถานะ booking ใน {{ref:module:booking-engine}} ได้เฉพาะ transition ไปทาง `cancelled` เท่านั้น ไม่แตะ field อื่น — ถ้าคืนเงินไม่สำเร็จภายในเวลาที่กำหนด สถานะจะค้างเป็น `refund_stuck` และต้องมีคนตรวจก่อนเสมอ เพื่อป้องกันการคืนเงินซ้ำสอง",
      internals: {
        constants: [
          { name: "CANCELLATION_FEE_GRACE_HOURS", value: "48" },
          { name: "NON_REFUNDABLE_RATE_PREFIX", value: "\"NR-\"" },
        ],
        typeSnippet:
          "interface RefundBreakdown {\n  bookingId: string;\n  originalAmountMinor: number;\n  feeMinor: number;\n  refundAmountMinor: number;\n  currency: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง proration ที่ {{ref:policy:cancellation-refund-proration-policy}}",
      },
    },
    {
      slug: "supplier-sync",
      name: "supplier-sync",
      tags: ["inventory", "supplier", "module"],
      description:
        "sync จำนวนห้องว่างจริงจากซัพพลายเออร์แต่ละรายเข้ามาเก็บเป็น snapshot ภายใน ทำงานเป็น background job เป็นหลัก ความถี่การ sync แตกต่างกันตามซัพพลายเออร์เพราะบางรายให้ webhook แบบ real-time บางรายต้อง poll เอง",
      functions: [
        { sig: "syncSupplierInventory(supplierId: string): Promise<SyncResult>", desc: "ดึงจำนวนห้องว่างล่าสุดจากซัพพลายเออร์มาบันทึกเป็น snapshot" },
        { sig: "reconcileDiscrepancy(supplierId: string, offerId: string): Promise<void>", desc: "เทียบ snapshot กับผลลัพธ์การจองจริงเพื่อหาความคลาดเคลื่อน" },
        { sig: "markSupplierDegraded(supplierId: string, reason: string): Promise<void>", desc: "ตัดซัพพลายเออร์ออกจากผลค้นหาชั่วคราวเมื่อ sync ล้มเหลวต่อเนื่อง" },
      ],
      relatedNotes:
        "ไม่รู้จัก concept ของ \"ราคา\" เลย (ดู {{ref:arch:boundaries}}) — เมื่อ sync เสร็จจะ publish `inventory.sync_completed` ให้ {{ref:module:price-cache}} ไป invalidate เอง แทนที่จะเขียนราคาตรงๆ เพื่อคุมความรับผิดชอบให้ชัดเจนว่าใครเป็นเจ้าของอะไร",
    },
  ],
  envVarGroups: [
    {
      service: "availability-search-service",
      vars: [
        { name: "SEARCH_TIMEOUT_MS", example: "3000", note: "เวลาสูงสุดที่รอผลจากซัพพลายเออร์ก่อนตัดออกจากรอบค้นหา" },
        { name: "MAX_SUPPLIERS_PER_QUERY", example: "12", note: "จำนวนซัพพลายเออร์สูงสุดที่ fan-out ต่อ 1 query" },
      ],
    },
    {
      service: "booking-engine-service",
      vars: [
        { name: "BOOKING_HOLD_TTL_SEC", example: "600", note: "ดู {{ref:policy:booking-hold-atomicity-policy}}" },
        { name: "BOOKING_DB_URL", example: "postgres://booking-db.internal:5432/booking", note: "secret ห้าม log" },
      ],
    },
    {
      service: "price-cache-service",
      vars: [
        { name: "PRICE_CACHE_TTL_SEC", example: "300", note: "อายุปกติของราคาที่ cache ไว้ก่อนถือว่า stale" },
        { name: "PRICE_CACHE_STALE_GRACE_SEC", example: "120", note: "ช่วงผ่อนผันหลังหมดอายุ ดู {{ref:policy:price-cache-staleness-policy}}" },
      ],
    },
    {
      service: "supplier-sync-service",
      vars: [
        { name: "SUPPLIER_SYNC_INTERVAL_SEC", example: "90", note: "ความถี่ poll สำหรับซัพพลายเออร์ที่ไม่มี webhook" },
        { name: "SUPPLIER_SYNC_RETRY_MAX", example: "3", note: "จำนวนครั้งที่ retry ก่อน mark degraded" },
      ],
    },
  ],
  policies: [
    {
      slug: "overbooking-prevention-policy",
      title: "นโยบายป้องกัน Overbooking",
      tags: ["booking", "inventory", "policy"],
      isPrimary: true,
      intro: [
        "ก่อน {{ref:module:booking-engine}} จะยืนยันการจองใดๆ ต้องเช็คจำนวนห้องว่างจาก {{ref:module:supplier-sync}} snapshot ล่าสุดเสมอ ไม่ใช่จาก {{ref:module:price-cache}} ซึ่งเก็บแค่ราคา — การเช็คนี้เป็น hard requirement ที่ bypass ไม่ได้แม้ระบบจะช้าลงบ้าง",
        "ถ้า snapshot มีอายุเกิน `PRICE_CACHE_STALE_GRACE_SEC` จะถือว่าไม่น่าเชื่อถือพอสำหรับการยืนยัน ระบบจะบังคับ sync สดจากซัพพลายเออร์ตรงๆ ก่อนยืนยันเสมอ แม้จะทำให้ผู้ใช้รอนานขึ้นสองสามวินาที",
      ],
      sections: [
        {
          heading: "ทำไมยอมให้ผู้ใช้รอนานขึ้นเพื่อความถูกต้อง",
          body: "overbooking สร้างความเสียหายที่แก้ยากกว่า latency สูงมาก — ต้องหาที่พักทดแทน จ่ายค่าชดเชย และเสียความเชื่อมั่นของผู้ใช้ ทีมจึงตัดสินใจยอมแลก latency เพิ่มขึ้นเล็กน้อยในช่วงที่ snapshot ไม่สด เพื่อป้องกันปัญหาที่แก้ยากกว่ามาก",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Overbooking เกิดขึ้นแล้ว",
        tags: ["booking", "inventory", "edge-case"],
        body: [
          "ถ้าตรวจพบ overbooking หลังยืนยันไปแล้ว (เช่น ซัพพลายเออร์แจ้งย้อนหลังว่าห้องเต็มจริง) ระบบจะไม่ยกเลิกการจองของลูกค้าฝ่ายที่จองทีหลังโดยอัตโนมัติ — ต้องให้ทีม support ติดต่อลูกค้าเสนอที่พักทดแทนระดับเทียบเท่าหรือดีกว่าก่อนเสมอ ไม่ปล่อยให้ลูกค้าได้รับแค่อีเมลยกเลิกเฉยๆ",
          "ลูกค้าที่ได้รับผลกระทบจาก overbooking ได้สิทธิ์ชดเชยอัตโนมัติตาม tier บัญชี (ดู {{ref:policy:loyalty-tier-priority-policy}}) โดยไม่ต้องร้องขอเอง เพราะทีมมองว่าเป็นความผิดพลาดฝั่งระบบ ไม่ใช่ฝั่งลูกค้า",
        ],
      },
    },
    {
      slug: "booking-hold-atomicity-policy",
      title: "นโยบายความเป็น Atomic ของ Booking Hold",
      tags: ["booking", "concurrency", "policy"],
      isPrimary: true,
      intro: [
        "การสร้าง hold ผ่าน `holdInventory` ต้องเป็น atomic operation ระดับ database เสมอ — ใช้ conditional update ที่เช็คจำนวนห้องว่างและลดจำนวนในคำสั่งเดียวกัน ห้ามแยกเป็นขั้นตอน \"อ่านจำนวนว่าง\" แล้ว \"เขียนลดจำนวน\" คนละคำสั่ง เพราะเปิดช่องให้เกิด race condition",
        "เมื่อห้องสุดท้ายถูก hold ไปแล้ว request ที่มาทีหลังต้องได้รับ error ทันทีในคำตอบเดียว ไม่ใช่ได้ hold token ปลอมแล้วมาพังตอน confirm",
      ],
      edgeCase: {
        title: "กรณี Hold หมดอายุพอดีตอนกำลัง Confirm",
        tags: ["booking", "concurrency", "edge-case"],
        body: [
          "ถ้า `confirmBooking` ถูกเรียกในช่วงเสี้ยววินาทีที่ hold กำลังจะหมดอายุพอดี ระบบยึดเวลาที่ request มาถึง service เป็นหลัก ไม่ใช่เวลาที่ query database เสร็จ — ถ้า request มาถึงก่อนหมดอายุแม้จะ process เสร็จหลังหมดอายุไปแล้วเล็กน้อย ก็ยังถือว่า valid",
          "เหตุผลที่ยึดแบบนี้เพราะผู้ใช้กด \"ยืนยันการจอง\" ไปแล้วจริง การปฏิเสธเพราะ processing ช้าไปไม่กี่ร้อยมิลลิวินาทีจะสร้างประสบการณ์ที่แย่และไม่เป็นธรรมกับผู้ใช้ที่ทำถูกต้องทุกขั้นตอน",
        ],
      },
    },
    {
      slug: "cancellation-refund-proration-policy",
      title: "นโยบายการคำนวณเงินคืนตามสัดส่วนเวลา (Proration)",
      tags: ["cancellation", "refund", "policy"],
      isPrimary: true,
      intro: [
        "จำนวนเงินคืนคำนวณจากสัดส่วนเวลาที่เหลือก่อนวันเข้าพัก เทียบกับ grace period ของ rate code นั้นๆ — ยกเลิกก่อน `CANCELLATION_FEE_GRACE_HOURS` (ปกติ 48 ชั่วโมง) คืนเต็มจำนวน ยกเลิกหลังจากนั้นหักค่าธรรมเนียมตามสัดส่วนชั่วโมงที่เหลือจริง ไม่ใช่หักแบบขั้นบันได",
        "rate code ที่ขึ้นต้นด้วย `NON_REFUNDABLE_RATE_PREFIX` ไม่เข้าเงื่อนไข proration เลย — ไม่คืนเงินไม่ว่าจะยกเลิกเมื่อไหร่ ยกเว้นกรณีที่ระบุใน edge case ด้านล่าง",
      ],
      sections: [
        {
          heading: "ทำไมใช้สัดส่วนต่อเนื่องแทนขั้นบันได",
          body: "การหักแบบขั้นบันได (เช่น ยกเลิกใน 24 ชม. สุดท้ายเสีย 100%) เคยสร้างความไม่พอใจตอนลูกค้ายกเลิกเร็วกว่า deadline ไม่กี่นาทีแต่โดนหักเต็ม — สัดส่วนต่อเนื่องยุติธรรมกว่าและอธิบายให้ลูกค้าเข้าใจง่ายกว่าด้วย",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: ยกเลิกเพราะความผิดพลาดฝั่งซัพพลายเออร์",
        tags: ["cancellation", "refund", "edge-case"],
        body: [
          "ถ้าการยกเลิกเกิดจากความผิดพลาดที่พิสูจน์ได้ฝั่งซัพพลายเออร์ (เช่น {{ref:incident:supplier-sync-false-sold-out}} หรือกรณี overbooking ตาม {{ref:policy:overbooking-prevention-policy}}) จะคืนเงินเต็มจำนวนเสมอไม่ว่า rate code จะเป็น non-refundable หรือไม่ และไม่นับเป็นการยกเลิกที่ริเริ่มโดยลูกค้า",
          "ค่าธรรมเนียมที่เก็บไปแล้วในกรณีนี้ต้องคืนแยกจาก flow ปกติ เพราะ `processRefund` มาตรฐานไม่รองรับการคืน fee ที่เก็บไปแล้ว — ต้องใช้ manual reversal ผ่านทีม finance เท่านั้น",
        ],
      },
    },
    {
      slug: "currency-conversion-policy",
      title: "นโยบายการแปลงสกุลเงิน",
      tags: ["pricing", "currency", "policy"],
      isPrimary: true,
      intro: [
        "ราคาที่ซัพพลายเออร์ส่งมาอาจเป็นสกุลเงินท้องถิ่นของที่พัก ระบบต้องแปลงเป็นสกุลเงินที่ผู้ใช้เลือกแสดงก่อนคำนวณราคาสุดท้ายเสมอ โดยใช้ FX rate ที่ดึงมาไม่เกิน 1 ชั่วโมงก่อนหน้า",
        "การปัดเศษหลังแปลงสกุลเงินต้องปัดขึ้นเป็นหน่วยที่เล็กที่สุดของสกุลเงินปลายทางเสมอ (เช่น สตางค์สำหรับ THB, cent สำหรับ USD) และต้องทำหลังแปลงเสร็จเพียงครั้งเดียว ห้ามปัดเศษซ้ำหลายรอบระหว่างขั้นตอนคำนวณ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับสกุลเงินที่ FX rate ผันผวนสูง",
        tags: ["pricing", "currency", "edge-case"],
        body: [
          "สกุลเงินที่ถูกจัดกลุ่ม `high_volatility` (เช่นบางสกุลเงินตลาดเกิดใหม่) ใช้ FX rate อายุไม่เกิน 15 นาทีแทนที่จะเป็น 1 ชั่วโมงตามปกติ เพราะความผันผวนสูงทำให้ rate เก่าคลาดเคลื่อนจนกระทบราคาสุดท้ายอย่างมีนัยสำคัญ",
          "ถ้าดึง FX rate สดไม่สำเร็จสำหรับสกุลเงินกลุ่มนี้ ระบบจะปฏิเสธการแสดงราคาในสกุลเงินนั้นชั่วคราวและเสนอสกุลเงินอ้างอิง (USD) แทน ดีกว่าแสดงราคาที่อาจผิดจากอัตราจริงมาก",
        ],
      },
    },
    {
      slug: "price-cache-staleness-policy",
      title: "นโยบายการยอมรับความล้าสมัยของ Price Cache",
      tags: ["pricing", "cache", "policy"],
      isPrimary: true,
      intro: [
        "ราคาใน {{ref:module:price-cache}} มีอายุปกติ `PRICE_CACHE_TTL_SEC` (5 นาที) ก่อนถือว่า stale ระบบยอมให้แสดงราคา stale ในหน้าค้นหาได้อีก `PRICE_CACHE_STALE_GRACE_SEC` (2 นาที) เพื่อลด load การเรียกซัพพลายเออร์ซ้ำถี่เกินไป",
        "การยอมรับ staleness นี้ใช้ได้เฉพาะหน้าค้นหาเท่านั้น — ตอนจะยืนยันการจองจริงต้องเช็คราคาสดเสมอ ไม่มีข้อยกเว้น เพื่อไม่ให้ผู้ใช้ถูกเรียกเก็บเงินผิดจากราคาที่เห็นตอนค้นหา",
      ],
      edgeCase: {
        title: "ข้อยกเว้นระหว่างซัพพลายเออร์รายงานสถานะ Degraded",
        tags: ["pricing", "cache", "edge-case"],
        body: [
          "ถ้าซัพพลายเออร์ถูก {{ref:module:supplier-sync}} mark เป็น degraded (sync ล้มเหลวต่อเนื่อง) ราคาที่ cache ไว้ของซัพพลายเออร์นั้นจะไม่ถูกใช้แสดงผลอีกแม้จะยังไม่หมด grace period ตามปกติ — ตัดออกจากผลค้นหาไปเลยจนกว่าจะ sync สำเร็จอีกครั้ง เพราะความเสี่ยงราคาผิดสูงเกินกว่าจะยอมรับได้",
          "กรณีนี้ต่างจาก staleness ปกติตรงที่ไม่ใช่แค่ \"ราคาเก่า\" แต่คือ \"ไม่รู้เลยว่าราคาปัจจุบันคืออะไร\" — สองสถานการณ์นี้ทีมแยกจัดการชัดเจนเพื่อไม่ให้ปนกัน",
        ],
      },
    },
    {
      slug: "supplier-inventory-discrepancy-policy",
      title: "นโยบายจัดการความคลาดเคลื่อนของ Inventory จากซัพพลายเออร์",
      tags: ["inventory", "supplier", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ `reconcileDiscrepancy` เทียบ snapshot กับผลการจองจริงแล้วพบว่าต่างกัน (เช่น ซัพพลายเออร์บอกว่าเต็มแต่จองผ่านได้ หรือบอกว่าว่างแต่จองไม่ผ่าน) ต้องบันทึกเป็น discrepancy event เสมอ ไม่เงียบผ่าน",
        "discrepancy ที่เกิดถี่เกิน 3 ครั้งใน 1 ชั่วโมงกับซัพพลายเออร์รายเดียวกัน จะ trigger ให้ {{ref:module:supplier-sync}} เพิ่มความถี่การ sync ชั่วคราวโดยอัตโนมัติ แทนที่จะรอให้คนมาปรับ config เอง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับที่พักยอดนิยม (High-demand)",
        tags: ["inventory", "supplier", "edge-case"],
        body: [
          "ที่พักที่ถูกจัดกลุ่ม `high_demand` (จองหมดเร็วเป็นประจำ) ใช้เกณฑ์ trigger เพิ่มความถี่ sync ที่เข้มกว่า — discrepancy แค่ 1 ครั้งก็ trigger ทันทีโดยไม่ต้องรอสะสมถึง 3 ครั้ง เพราะห้องหมุนเร็วมากจนรอสะสมนานเกินไปจะพลาดโอกาสขายหรือเสี่ยง overbooking มากกว่าที่พักทั่วไป",
          "ที่พักกลุ่มนี้ยังถูก sync เพิ่มด้วยมือได้จากทีม ops โดยตรงผ่าน `syncSupplierInventory` แม้จะยังไม่ถึงรอบ schedule ปกติ ต่างจากที่พักทั่วไปที่ต้องรอรอบ automatic เท่านั้น",
        ],
      },
    },
    {
      slug: "itinerary-confirmation-timezone-policy",
      title: "นโยบายการแสดงเวลาในอีเมลยืนยันทริป",
      tags: ["itinerary", "timezone", "policy"],
      isPrimary: false,
      intro: [
        "ทุกเวลาที่แสดงในอีเมลยืนยัน (เช่น เวลาเช็คอิน, เวลาบิน) ต้องระบุ timezone กำกับชัดเจนเสมอ ไม่แสดงเวลาลอยๆ โดยไม่บอกว่าเป็น timezone ไหน และต้องแปลงเป็น timezone ของสถานที่จริงที่ event นั้นเกิดขึ้น ไม่ใช่ timezone ของผู้เดินทาง",
        "เหตุผลที่ยึด timezone ของสถานที่จริงแทน timezone ผู้เดินทาง คือผู้เดินทางต้องไปถึงสถานที่นั้นตามเวลาท้องถิ่นของที่นั่น การแปลงเป็น timezone ตัวเองจะสร้างความสับสนมากกว่าช่วยเมื่อข้ามเขตเวลาไปแล้ว",
      ],
    },
    {
      slug: "loyalty-tier-priority-policy",
      title: "นโยบายสิทธิพิเศษตาม Loyalty Tier",
      tags: ["loyalty", "priority", "policy"],
      isPrimary: false,
      intro: [
        "ลูกค้า tier `gold` ขึ้นไปได้สิทธิ์ hold inventory นานกว่าปกติ (`BOOKING_HOLD_TTL_SEC` x 2) และได้ priority ในการจัดสรรที่พักทดแทนกรณี overbooking ก่อนลูกค้า tier ทั่วไปเสมอ",
        "สิทธิพิเศษนี้คำนวณจาก tier ที่บันทึกในระบบ ณ เวลาที่เริ่ม hold ไม่ใช่ tier ปัจจุบัน เพื่อไม่ให้ tier เปลี่ยนกลางทางระหว่างขั้นตอนจองส่งผลย้อนหลัง",
      ],
    },
    {
      slug: "supplier-commission-policy",
      title: "นโยบายค่าคอมมิชชันซัพพลายเออร์",
      tags: ["finance", "supplier", "policy"],
      isPrimary: false,
      intro: [
        "ค่าคอมมิชชันคำนวณจากราคาสุทธิที่ลูกค้าจ่ายจริง (หลังหักส่วนลด) ไม่ใช่ราคาตั้งต้นก่อนส่วนลด และคำนวณ ณ เวลาที่ booking ถูก confirm ไม่ใช่ตอนยกเลิกหรือคืนเงิน",
        "อัตราคอมมิชชันแตกต่างกันตาม tier สัญญาของแต่ละซัพพลายเออร์ เก็บเป็น config แยกจากตรรกะการจอง เพื่อให้ทีม business ปรับอัตราได้โดยไม่ต้อง deploy โค้ดใหม่",
      ],
    },
    {
      slug: "peak-season-surge-pricing-policy",
      title: "นโยบายราคาช่วง Peak Season",
      tags: ["pricing", "peak-season", "policy"],
      isPrimary: false,
      intro: [
        "ราคาที่แสดงในช่วง peak season (ธันวาคม-มกราคม, สงกรานต์) มาจากซัพพลายเออร์โดยตรงเป็นหลัก ระบบไม่ปรับราคาซ้อนเองเพิ่มเติม แต่ปรับความถี่การ invalidate {{ref:module:price-cache}} ให้ถี่ขึ้นเพราะราคาช่วงนี้เปลี่ยนบ่อยกว่าปกติมาก",
        "TTL ของ price cache ในช่วง peak season ลดลงเหลือครึ่งหนึ่งของค่าปกติโดยอัตโนมัติตามปฏิทินที่กำหนดไว้ล่วงหน้า ไม่ต้องรอให้คนมาปรับ config เอง",
      ],
    },
    {
      slug: "name-correction-policy",
      title: "นโยบายการแก้ไขชื่อผู้เดินทางหลังยืนยันการจอง",
      tags: ["booking", "traveler", "policy"],
      isPrimary: false,
      intro: [
        "แก้ไขชื่อผู้เดินทางเล็กน้อย (สะกดผิด, คำนำหน้าผิด) ทำได้เองผ่านระบบภายใน 24 ชั่วโมงหลังยืนยันโดยไม่มีค่าธรรมเนียม ถือเป็นการแก้ไขข้อผิดพลาด ไม่ใช่การเปลี่ยนตัวผู้เดินทาง",
        "การเปลี่ยนชื่อทั้งหมด (คนละคนเลย) ไม่ถือเป็น name correction — ต้องยกเลิกการจองเดิมแล้วจองใหม่ตามเงื่อนไข {{ref:policy:cancellation-refund-proration-policy}} เท่านั้น",
      ],
    },
  ],
  incidents: [
    {
      slug: "stale-price-cache-overbooking",
      title: "ราคาและห้องว่างที่ cache ไว้เก่าเกินไปทำให้ overbook",
      tags: ["overbooking", "cache"],
      summary:
        "ลูกค้า 3 รายจองที่พักแห่งเดียวกันในคืนเดียวกันสำเร็จทั้งหมด ทั้งที่ซัพพลายเออร์มีห้องเหลือจริงแค่ 1 ห้อง",
      investigation:
        "ตรวจสอบ {{ref:module:booking-engine}} พบว่าทั้ง 3 booking ยืนยันสำเร็จในช่วงเวลาห่างกันไม่ถึง 10 นาที ตรง grace period ตาม {{ref:policy:overbooking-prevention-policy}} พอดี",
      cause:
        "{{ref:module:supplier-sync}} sync ล้มเหลวเงียบๆ ต่อเนื่องเกิน `PRICE_CACHE_STALE_GRACE_SEC` แต่ไม่ได้ mark supplier เป็น degraded เพราะ error ที่เกิดเป็น timeout แบบ intermittent ไม่ใช่ error ที่ระบบตั้งเงื่อนไข mark degraded ไว้ ทำให้ booking-engine ยังคงเชื่อ snapshot เก่าว่าห้องว่างอยู่ 3 ห้อง",
      resolution:
        "ทีม support ติดต่อลูกค้า 2 รายที่จองทีหลังตาม edge case ใน {{ref:policy:overbooking-prevention-policy}} เสนอที่พักทดแทนระดับเดียวกันในละแวกเดียวกันพร้อมส่วนลดชดเชย ทั้งคู่ตอบรับ",
      followup:
        "ขยายเงื่อนไขการ mark degraded ให้ครอบคลุม timeout แบบ intermittent ที่เกินจำนวนครั้งในหน้าต่างเวลาสั้นๆ ไม่ใช่แค่ error แบบชัดเจนอย่างเดียว",
    },
    {
      slug: "last-room-double-booking-race",
      title: "ห้องสุดท้ายถูกจองซ้อนโดยสองคนพร้อมกัน",
      tags: ["booking", "race-condition"],
      summary:
        "ผู้ใช้สองคนกดยืนยันการจองห้องสุดท้ายของที่พักหนึ่งในเวลาห่างกันไม่ถึง 200 มิลลิวินาที ทั้งคู่ได้รับอีเมลยืนยันว่าจองสำเร็จ",
      investigation:
        "ตรวจ log `holdInventory` พบว่าทั้งสอง request อ่านค่าห้องว่างเป็น 1 พร้อมกันก่อนที่ฝ่ายใดฝ่ายหนึ่งจะเขียนค่าลดลงเสร็จ",
      cause:
        "deploy รอบล่าสุดของ {{ref:module:booking-engine}} เปลี่ยน implementation ของ `holdInventory` เป็นแบบอ่านแล้วเขียนแยกคำสั่ง (เพื่อรองรับ logic ใหม่ที่ซับซ้อนขึ้น) แทนที่จะใช้ conditional update แบบ atomic ตามที่ {{ref:policy:booking-hold-atomicity-policy}} กำหนด ทำให้เกิดช่องว่างสำหรับ race condition",
      resolution:
        "revert implementation กลับไปใช้ conditional update แบบ atomic ทันทีเป็น hotfix แล้วติดต่อลูกค้ารายที่จองทีหลังเสนอที่พักทดแทนตามขั้นตอนปกติ",
      followup:
        "เพิ่ม code review checklist item เฉพาะสำหรับฟังก์ชันที่แตะ inventory count ตาม {{ref:convention:code-review-checklist}} และเพิ่ม concurrency test ครอบคลุม `holdInventory` โดยเฉพาะ",
    },
    {
      slug: "supplier-sync-false-sold-out",
      title: "Supplier sync รายงานห้องเต็มผิดพลาด ทั้งที่ว่างจริง",
      tags: ["inventory", "supplier", "lost-sales"],
      summary:
        "ทีม analytics สังเกตว่ายอดค้นหาที่พักแห่งหนึ่งสูงผิดปกติแต่ conversion เป็นศูนย์ติดต่อกันเกือบ 2 วัน ทั้งที่ปกติที่พักนี้ขายดี",
      investigation:
        "ตรวจ {{ref:module:supplier-sync}} พบว่า `syncSupplierInventory` บันทึกจำนวนห้องว่างเป็น 0 มาตั้งแต่ 2 วันก่อน แต่เมื่อโทรตรงไปถามซัพพลายเออร์พบว่ามีห้องว่างจริงกว่า 15 ห้อง",
      cause:
        "ซัพพลายเออร์รายนี้เปลี่ยนรูปแบบ response field ที่บอกจำนวนห้องว่างโดยไม่แจ้งล่วงหน้า (จาก `available_rooms` เป็น `rooms_available`) parser เดิมอ่าน field เก่าไม่เจอเลยตีความเป็น 0 แทนที่จะ error ให้เห็นชัดเจน",
      resolution:
        "แก้ parser ให้รองรับ field ใหม่และเพิ่ม validation ที่ throw error ชัดเจนเมื่อ field ที่คาดหวังหายไป แทนที่จะ default เป็น 0 เงียบๆ",
      followup:
        "เสนอให้เพิ่ม alert แยกสำหรับกรณีที่ inventory ของที่พักใดตกลงเหลือ 0 อย่างฉับพลันหลังเคยมีสูงต่อเนื่อง เพราะมักเป็นสัญญาณของ parsing bug มากกว่าห้องเต็มจริง",
    },
    {
      slug: "refund-proration-calc-bug",
      title: "คำนวณเงินคืนผิดจากบั๊ก Proration ปัดเศษ",
      tags: ["cancellation", "refund", "bug"],
      summary:
        "ลูกค้าหลายรายร้องเรียนว่ายอดเงินคืนที่ได้รับต่ำกว่าที่คำนวณเองตามเงื่อนไข proration ประมาณ 3-5% ในทุกกรณีที่ยกเลิกใกล้ deadline",
      investigation:
        "ตรวจ `computeRefundAmount` ใน {{ref:module:cancellation-handler}} พบว่าสูตรคำนวณสัดส่วนเวลาที่เหลือปัดเศษชั่วโมงลงก่อนคำนวณเปอร์เซ็นต์ แทนที่จะคำนวณด้วยเวลาที่แม่นยำแล้วค่อยปัดเศษผลลัพธ์สุดท้ายทีเดียว",
      cause:
        "โค้ดเดิมเขียนตอนที่ grace period ยังเป็นหน่วยวันเท่านั้น ไม่มีปัญหาการปัดเศษ พอ {{ref:policy:cancellation-refund-proration-policy}} เปลี่ยนมาเป็นสัดส่วนต่อเนื่องระดับชั่วโมง ไม่มีใครแก้จุดปัดเศษกลางทางออก ทำให้ยอดคลาดเคลื่อนสะสม",
      resolution:
        "แก้สูตรให้ปัดเศษเฉพาะผลลัพธ์สุดท้ายครั้งเดียวตามที่ policy กำหนด แล้วรัน batch job คำนวณย้อนหลังสำหรับทุกเคสที่ยกเลิกในช่วง 30 วันที่ผ่านมา คืนส่วนต่างเพิ่มให้ลูกค้าที่ได้รับผลกระทบทั้งหมด",
      followup:
        "เพิ่ม unit test ที่ตรวจสอบตัวอย่างการคำนวณ proration แบบ manual เทียบกับผลลัพธ์จากฟังก์ชันโดยตรง ครอบคลุมกรณีเวลาที่เหลือเป็นเศษชั่วโมง",
    },
    {
      slug: "currency-rounding-overcharge",
      title: "บั๊กปัดเศษสกุลเงินเรียกเก็บลูกค้าต่างประเทศเกินจริง",
      tags: ["currency", "pricing", "bug"],
      summary:
        "ลูกค้าที่จ่ายเป็นสกุลเงิน EUR และ GBP รายงานว่ายอดที่ถูกเรียกเก็บสูงกว่าราคาที่แสดงตอนจองเล็กน้อยแต่สม่ำเสมอทุกครั้ง",
      investigation:
        "ตรวจ flow การแปลงราคาพบว่าระบบปัดเศษขึ้นสองรอบ — ครั้งแรกตอนแปลงจาก THB เป็น USD (สกุลเงินกลาง) แล้วปัดขึ้นอีกครั้งตอนแปลงจาก USD เป็นสกุลเงินปลายทาง ขัดกับ {{ref:policy:currency-conversion-policy}} ที่กำหนดให้ปัดเศษเพียงครั้งเดียวหลังแปลงเสร็จ",
      cause:
        "โค้ดแปลงสกุลเงินถูกเขียนแยกกันสองจุดโดยคนละทีมในช่วงที่เพิ่มสกุลเงินกลางเข้ามาใหม่ ไม่มีใครสังเกตว่าทั้งสองจุดต่างก็ปัดเศษเอง ทำให้เกิดการปัดซ้อนโดยไม่ตั้งใจ",
      resolution:
        "รวม logic การปัดเศษให้เหลือจุดเดียวหลังแปลงสกุลเงินครบทุกขั้นตอน แล้วคืนส่วนต่างให้ลูกค้าที่ได้รับผลกระทบในช่วง 14 วันที่ผ่านมาทั้งหมด",
      followup:
        "เพิ่ม integration test ที่ตรวจ end-to-end การแปลงสกุลเงินจากต้นทางถึงยอดสุดท้าย ไม่ใช่ test แยกทีละฟังก์ชัน เพราะบั๊กแบบนี้เกิดจากการรวมกันของสองจุดที่แต่ละจุด test ผ่านแยกกัน",
    },
    {
      slug: "itinerary-timezone-missed-checkin",
      title: "อีเมลยืนยันแสดงเวลาผิด timezone ทำลูกค้าพลาดเช็คอิน",
      tags: ["itinerary", "timezone", "bug"],
      summary:
        "ลูกค้าเดินทางไปเช็คอินที่พักในต่างประเทศตามเวลาที่ระบุในอีเมลยืนยัน แต่ไปถึงหลังเวลาปิดรับเช็คอินไปแล้วเกือบ 5 ชั่วโมง",
      investigation:
        "ตรวจ `renderConfirmationEmail` ใน {{ref:module:itinerary-builder}} พบว่าเวลาเช็คอินที่แสดงในอีเมลเป็น timezone ของผู้เดินทาง (ที่ตั้งค่าไว้ในบัญชี) แทนที่จะเป็น timezone ของที่พักตามที่ {{ref:policy:itinerary-confirmation-timezone-policy}} กำหนด",
      cause:
        "การแก้ไข template อีเมลรอบล่าสุดสลับตัวแปร timezone สองตัวโดยไม่ตั้งใจ (`travelerTz` กับ `propertyTz`) ผ่าน code review ไปได้เพราะทั้งคู่เป็น string timezone หน้าตาเหมือนกันและ test ที่มีอยู่ทดสอบเฉพาะกรณีที่ทั้งสอง timezone เท่ากันพอดี",
      resolution:
        "แก้ template ให้ใช้ `propertyTz` ที่ถูกต้อง ส่งอีเมลแก้ไขพร้อมโทรแจ้งลูกค้าที่มีการเข้าพักในอีก 48 ชั่วโมงข้างหน้าทุกรายเป็นพิเศษ และช่วยประสานงานกับที่พักของลูกค้าที่พลาดเช็คอินไปแล้ว",
      followup:
        "เพิ่ม test case ที่ travelerTz และ propertyTz ต่างกันชัดเจนโดยเฉพาะ ตาม {{ref:convention:testing-convention}} เพื่อจับกรณีสลับตัวแปรแบบนี้ได้ในอนาคต",
    },
    {
      slug: "supplier-api-outage-search-degraded",
      title: "ซัพพลายเออร์รายใหญ่ล่ม ทำผลค้นหาหายไปครึ่งหนึ่ง",
      tags: ["availability", "supplier", "outage"],
      summary:
        "ซัพพลายเออร์รายใหญ่ที่สุดของระบบ (คิดเป็นเกือบ 40% ของ inventory ทั้งหมด) API ล่มนาน 2 ชั่วโมง ทำให้ผลการค้นหาลดลงฮวบฮาบทั่วทั้งแพลตฟอร์ม",
      investigation:
        "ตรวจ {{ref:module:availability-search}} พบว่า `searchAvailability` รอ timeout เต็ม `SEARCH_TIMEOUT_MS` สำหรับซัพพลายเออร์รายนี้ทุก request ก่อนจะตัดออก ทำให้ latency รวมของทุก query สูงขึ้นมากแม้จะมีซัพพลายเออร์อื่นตอบเร็วอยู่",
      cause:
        "ระบบยังไม่ mark ซัพพลายเออร์เป็น degraded อัตโนมัติเร็วพอ — เงื่อนไขเดิมต้องรอ error ติดต่อกัน 3 ครั้งจาก `syncSupplierInventory` เท่านั้น ไม่ได้เชื่อมกับ error rate ของ `searchAvailability` โดยตรง ทำให้ช่วงต้นของ outage ทุก query ยังพยายามยิงหาซัพพลายเออร์ที่ล่มอยู่ดี",
      resolution:
        "เปิด `excludeDegradedSuppliers` ด้วยมือทันทีที่ยืนยันว่าซัพพลายเออร์ล่มจริง latency กลับสู่ปกติภายในไม่กี่นาทีหลังตัดออก",
      followup:
        "เชื่อม error rate ของ `searchAvailability` เข้ากับเงื่อนไข mark degraded โดยตรง ไม่ต้องรอเฉพาะจาก sync job เท่านั้น เพื่อให้ระบบตอบสนองอัตโนมัติเร็วขึ้นในเหตุการณ์แบบนี้",
    },
    {
      slug: "price-cache-thundering-herd",
      title: "Cache invalidate พร้อมกันทำ query ถล่มซัพพลายเออร์",
      tags: ["cache", "performance"],
      summary:
        "หลัง {{ref:module:supplier-sync}} sync รอบใหญ่เสร็จพร้อมกันหลายสิบซัพพลายเออร์ ระบบเจอ error rate พุ่งสูงจากซัพพลายเออร์หลายรายพร้อมกันในเวลาไล่เลี่ยกัน",
      investigation:
        "ตรวจ {{ref:module:price-cache}} พบว่า event `inventory.sync_completed` จำนวนมากมาถึงพร้อมกันทำให้ cache entry จำนวนมากถูก invalidate ในเวลาเดียวกัน request ค้นหาที่ตามมาเจอ cache miss พร้อมกันหมดจึงยิง query ตรงไปหาซัพพลายเออร์พร้อมกันเป็นจำนวนมาก (thundering herd)",
      cause:
        "cron schedule ของ sync job หลายซัพพลายเออร์ถูกตั้งเวลาเดียวกันโดยบังเอิญตอนเพิ่มซัพพลายเออร์ใหม่เข้าระบบทีละมาก ไม่มีการกระจาย (jitter) เวลาเริ่ม sync ของแต่ละราย",
      resolution:
        "เพิ่ม random jitter ให้ schedule ของแต่ละซัพพลายเออร์กระจายออกภายในหน้าต่าง 10 นาที แทนที่จะเริ่มพร้อมกันเป๊ะ แก้ปัญหาได้ทันทีในรอบ sync ถัดไป",
      followup:
        "ทบทวน {{ref:deployment:scaling-policy}} ของ price-cache-service ให้รองรับ burst แบบนี้ได้ดีขึ้นในกรณีที่ jitter ไม่พอในอนาคต",
    },
    {
      slug: "loyalty-tier-priority-misapplied",
      title: "ลูกค้า Gold tier ไม่ได้รับสิทธิ์ hold นานขึ้นตามที่ควร",
      tags: ["loyalty", "booking", "bug"],
      summary:
        "ลูกค้า tier gold หลายรายร้องเรียนว่า hold หมดอายุเร็วกว่าที่ควรระหว่างกรอกข้อมูลชำระเงิน ทั้งที่ตาม {{ref:policy:loyalty-tier-priority-policy}} ควรได้ TTL นานเป็นสองเท่า",
      investigation:
        "ตรวจ `holdInventory` พบว่าฟังก์ชันอ่าน tier ของลูกค้าจาก cache โปรไฟล์ที่แยกต่างหาก ซึ่งบางครั้งยังไม่อัปเดต tier ล่าสุดหลังลูกค้าเพิ่งอัปเกรด",
      cause:
        "cache โปรไฟล์ลูกค้ามี TTL ยาวถึง 6 ชั่วโมง ทำให้ลูกค้าที่เพิ่งอัปเกรดเป็น gold ภายในช่วงเวลานั้นยังถูกคำนวณ TTL การ hold แบบ tier ทั่วไปอยู่ ไม่ตรงกับ tier จริงในระบบ",
      resolution:
        "แก้ `holdInventory` ให้ query tier ล่าสุดตรงจากตาราง account แทนการอ่านจาก cache โปรไฟล์ที่มี TTL ยาวเกินไปสำหรับ use case นี้โดยเฉพาะ",
      followup:
        "ทบทวนจุดอื่นที่ยังพึ่งพา cache โปรไฟล์เดียวกันนี้ว่ามีความเสี่ยง stale tier แบบเดียวกันหรือไม่",
    },
    {
      slug: "booking-hold-not-released-after-abandon",
      title: "Hold ไม่ถูกปล่อยคืนหลังผู้ใช้ทิ้งฟอร์มกลางคัน ทำห้องหายจากระบบ",
      tags: ["booking", "bug"],
      summary:
        "ทีม ops สังเกตว่าที่พักยอดนิยมบางแห่งแสดงห้องว่างต่ำกว่าความเป็นจริงต่อเนื่องหลายชั่วโมงในบางวัน ทั้งที่ไม่มีการจองเพิ่มมากขนาดนั้น",
      investigation:
        "ตรวจ `booking_holds` พบ hold จำนวนมากค้างสถานะ `held` เกิน `BOOKING_HOLD_TTL_SEC` ไปนานแล้วแต่ไม่ถูกเปลี่ยนเป็น `expired` และคืนห้องกลับเข้า inventory",
      cause:
        "job ที่ควรกวาดล้าง hold ที่หมดอายุทำงานบน schedule ทุก 5 นาที แต่ query ที่ใช้เช็คมี index ผิดคอลัมน์ทำให้ query ช้าลงเรื่อยๆ ตามจำนวน hold ที่สะสม จนสุดท้าย query timeout ทุกรอบและไม่มี hold ไหนถูกกวาดเลยตั้งแต่เมื่อไหร่ก็ไม่รู้",
      resolution:
        "แก้ index ให้ตรงกับ query แล้วรัน cleanup job ด้วยมือครั้งใหญ่เพื่อล้าง backlog ที่ค้างสะสม inventory กลับมาแสดงถูกต้องภายใน 10 นาทีหลังรัน",
      followup:
        "เพิ่ม alert เมื่อ cleanup job ใช้เวลานานผิดปกติหรือ error ต่อเนื่อง แทนที่จะปล่อยให้ล้มเหลวเงียบๆ โดยไม่มีใครรู้จนมีคนสังเกตผลกระทบทางอ้อม",
    },
    {
      slug: "supplier-commission-mismatch-invoice",
      title: "ยอดคอมมิชชันในใบแจ้งหนี้ไม่ตรงกับที่ซัพพลายเออร์คำนวณเอง",
      tags: ["finance", "supplier", "commission"],
      summary:
        "ซัพพลายเออร์รายหนึ่งท้วงว่ายอดคอมมิชชันในใบแจ้งหนี้ประจำเดือนต่ำกว่าที่พวกเขาคำนวณเองตาม {{ref:policy:supplier-commission-policy}} อยู่ประมาณ 8%",
      investigation:
        "ตรวจสอบพบว่าความต่างมาจาก booking ที่ถูกยกเลิกบางส่วนแล้วคืนเงินบางส่วน (partial refund) — ระบบคำนวณคอมมิชชันจากยอดหลังหักส่วนที่คืนแล้ว แต่ซัพพลายเออร์คำนวณจากยอด confirm ตั้งต้นตามที่เข้าใจ policy",
      cause:
        "policy ที่ระบุว่า \"คำนวณ ณ เวลาที่ confirm\" ตีความได้สองแบบไม่ชัดเจนพอสำหรับกรณี partial refund ที่เกิดขึ้นทีหลัง — ทีมภายในตีความว่าให้ปรับยอดตามคืนเงินจริง ส่วนซัพพลายเออร์เข้าใจว่ายอดตอน confirm คือยอดสุดท้ายตลอดไป",
      resolution:
        "ชี้แจงกับซัพพลายเออร์พร้อมตัวอย่างการคำนวณละเอียด และปรับยอดคอมมิชชันของเดือนนั้นให้ตรงกับความเข้าใจเดิมของซัพพลายเออร์เป็นกรณีพิเศษเพื่อรักษาความสัมพันธ์",
      followup:
        "แก้ไขข้อความใน {{ref:policy:supplier-commission-policy}} ให้ระบุชัดเจนว่ากรณี partial refund คำนวณอย่างไร และแจ้งซัพพลายเออร์ทุกรายให้รับทราบตรงกันก่อนรอบบิลถัดไป",
    },
    {
      slug: "peak-season-surge-price-flicker",
      title: "ราคากระพริบเปลี่ยนกลางหน้าจอ Checkout ช่วง Peak Season",
      tags: ["pricing", "peak-season", "bug"],
      summary:
        "ช่วงเทศกาลปีใหม่ ผู้ใช้จำนวนมากรายงานว่าราคาที่เห็นตอนกดเข้าหน้า checkout เปลี่ยนไปมาหลายครั้งก่อนจะกดยืนยันได้สำเร็จ สร้างความไม่มั่นใจอย่างมาก",
      investigation:
        "ตรวจ frontend log พบว่า checkout page ยิง `getCachedPrice` ซ้ำหลายครั้งโดยไม่ตั้งใจจาก retry logic ที่เขียนไว้รับมือ network error แต่ละครั้งที่ TTL cache หมดพอดีในช่วงเวลาสั้นๆ (เพราะ TTL ถูกลดครึ่งตาม {{ref:policy:peak-season-surge-pricing-policy}}) จะได้ราคาที่ต่างจากครั้งก่อนเล็กน้อย",
      cause:
        "TTL ที่สั้นลงช่วง peak season ทำให้โอกาสที่ราคาจะเปลี่ยนระหว่างที่ผู้ใช้ยังอยู่หน้า checkout สูงขึ้นมาก ประกอบกับ retry logic ที่ยิงซ้ำถี่เกินจำเป็นทำให้ผู้ใช้เห็นราคาสั่นไปมาแทนที่จะเห็นการเปลี่ยนแปลงแบบนุ่มนวล",
      resolution:
        "แก้ frontend ให้ lock ราคาที่แสดงไว้ตั้งแต่เข้าหน้า checkout จนกว่าจะกดยืนยันหรือ session หมดอายุ ไม่เรียก `getCachedPrice` ซ้ำระหว่างอยู่ในหน้านั้น",
      followup:
        "พิจารณาแยกพฤติกรรม cache TTL ระหว่าง \"หน้าค้นหา\" กับ \"หน้า checkout\" ให้ชัดเจนกว่านี้ในอนาคต แทนที่จะใช้ TTL เดียวกันทั้งสองบริบท",
    },
    {
      slug: "itinerary-builder-duplicate-segment-multi-city",
      title: "ทริปหลายเมืองแสดง Segment ซ้ำซ้อนในอีเมลยืนยัน",
      tags: ["itinerary", "bug"],
      summary:
        "ลูกค้าที่จองทริปหลายเมืองต่อเนื่องกัน (เช่น เชียงใหม่ → เชียงราย → กรุงเทพ) ได้รับอีเมลยืนยันที่แสดง segment เชียงราย ซ้ำกันสองครั้ง",
      investigation:
        "ตรวจ `buildItinerary` และ `addSegment` ใน {{ref:module:itinerary-builder}} พบว่าเมื่อผู้ใช้เพิ่ม booking เข้าทริปที่มีอยู่แล้วผ่าน `addSegment` ระบบไม่เช็คว่า booking นั้นถูกรวมเข้า itinerary เดิมไปแล้วหรือยังก่อนเพิ่มซ้ำ",
      cause:
        "เดิม `addSegment` ออกแบบมาสำหรับ flow ที่เรียกครั้งเดียวต่อ booking เท่านั้น แต่ frontend เวอร์ชันใหม่เรียกซ้ำเป็นส่วนหนึ่งของ retry logic ตอน network ไม่เสถียร ทำให้ในบางกรณี booking เดียวกันถูกเพิ่มเข้า itinerary สองรอบ",
      resolution:
        "เพิ่มเงื่อนไข idempotency ให้ `addSegment` เช็ค bookingId ที่มีอยู่แล้วในทริปก่อนเพิ่ม ถ้ามีอยู่แล้วให้ข้ามเงียบๆ แทนที่จะเพิ่มซ้ำ แล้วส่งอีเมลยืนยันฉบับแก้ไขให้ลูกค้าที่ได้รับผลกระทบ",
      followup:
        "ตรวจสอบฟังก์ชันอื่นใน {{ref:module:itinerary-builder}} ที่อาจถูกเรียกซ้ำจาก retry logic ฝั่ง frontend ในลักษณะเดียวกัน แล้วเพิ่ม idempotency ให้ครบ",
    },
    {
      slug: "cancellation-webhook-lost-refund-stuck",
      title: "Webhook ยืนยันคืนเงินจาก Payment Provider หายระหว่างทาง",
      tags: ["cancellation", "refund", "payment-provider"],
      summary:
        "ลูกค้าแจ้งว่ายกเลิกการจองไปแล้วเกือบ 3 วัน สถานะยังค้างเป็น \"กำลังดำเนินการคืนเงิน\" ไม่มีความคืบหน้า",
      investigation:
        "ตรวจสอบ {{ref:module:cancellation-handler}} พบว่า booking นี้ค้างสถานะ `refund_stuck` มาตั้งแต่วันที่ยกเลิก ตรงกับนิยามใน state flow ของ module เมื่อ `processRefund` ไม่ได้รับการยืนยันกลับภายในเวลาที่กำหนด",
      cause:
        "ตรวจสอบฝั่ง payment provider dashboard พบว่าการคืนเงินสำเร็จจริงตั้งแต่วันแรก แต่ webhook ยืนยันที่ควรส่งกลับมาหายไประหว่างทาง ไม่ถึงระบบ TripLedger เลย ซึ่งเป็นปัญหาที่เคยเกิดกับ payment provider รายนี้เป็นครั้งที่สองในไตรมาสนี้",
      resolution:
        "วิศวกร on-call ยืนยันสถานะจริงจาก payment provider โดยตรงผ่าน API แล้วอัปเดตสถานะด้วยมือเป็น `refunded` พร้อมแจ้งลูกค้าว่าเงินคืนเข้าบัญชีแล้วจริง",
      followup:
        "เสนอให้เพิ่ม job อัตโนมัติ query สถานะจาก payment provider โดยตรงเมื่อ booking อยู่ใน `refund_stuck` เกิน 2 ชั่วโมง แทนที่จะรอ webhook เพียงอย่างเดียวซึ่งพิสูจน์แล้วว่าไม่น่าเชื่อถือ 100%",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/TRIP-118-hold-atomic-update`, `fix/TRIP-204-refund-proration-rounding`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(booking-engine): แก้ race condition ใน holdInventory`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ inventory count หรือ hold ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:last-room-double-booking-race}}) และการแปลงสกุลเงินหรือคำนวณเงินต้องมีคนที่สองตรวจสูตรก่อน merge" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `holdInventory`, `computeRefundAmount` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ทางธุรกิจ", body: "`bookingId` รูปแบบ `BK-<8 หลัก>`, `offerId` รูปแบบ `<supplierId>-<internal ref>` ต้องตรงกับที่ frontend และ log ใช้เสมอ" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับการจองต้องมี `bookingId` หรือ `holdToken` เสมอ เพื่อไล่ log ข้าม service ได้ (availability-search → booking-engine → itinerary-builder)" },
        { heading: "ระดับ log", body: "discrepancy จาก `reconcileDiscrepancy` log เป็น `warn` เสมอ แม้จะดูเหมือนเรื่องเล็ก เพราะสะสมเป็นสัญญาณของปัญหาใหญ่ได้ตาม {{ref:policy:supplier-inventory-discrepancy-policy}}" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`TRIP_<DOMAIN>_<REASON>` เช่น `TRIP_BOOKING_HOLD_EXPIRED`, `TRIP_INVENTORY_UNAVAILABLE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`TRIP_SUPPLIER_DEGRADED`, `TRIP_CURRENCY_UNSUPPORTED`, `TRIP_REFUND_STUCK` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Concurrent test บังคับ", body: "ฟังก์ชันที่แตะ inventory หรือ hold ต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ — บทเรียนจาก {{ref:incident:last-room-double-booking-race}} คือการขาด test แบบนี้ปล่อยให้ regression หลุดไปถึง production" },
        { heading: "Timezone test", body: "logic ที่แสดงเวลาข้าม timezone ต้องมี test case ที่ travelerTz กับ propertyTz ต่างกันชัดเจนเสมอ ตามบทเรียนจาก {{ref:incident:itinerary-timezone-missed-checkin}}" },
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
      slug: "supplier-integration-convention",
      title: "Supplier Integration Convention",
      tags: ["supplier", "integration"],
      intro: "แนวทางมาตรฐานสำหรับการเชื่อมต่อซัพพลายเออร์รายใหม่เข้ากับ {{ref:module:supplier-sync}} — เขียนขึ้นหลัง {{ref:incident:supplier-sync-false-sold-out}} เพื่อป้องกันปัญหาการเปลี่ยน schema แบบไม่แจ้งล่วงหน้าซ้ำอีก",
      sections: [
        { heading: "Schema validation บังคับ", body: "ทุก field ที่ parser อ่านจาก response ของซัพพลายเออร์ต้องผ่าน schema validation ที่ throw error ชัดเจนเมื่อ field คาดหวังหายไป ห้าม default ค่าเป็น 0 หรือ empty string เงียบๆ เด็ดขาด" },
        { heading: "Contract test", body: "ซัพพลายเออร์ทุกรายต้องมี contract test แยกที่รันเป็นประจำเทียบ response จริงกับ schema ที่คาดไว้ เพื่อจับความเปลี่ยนแปลงฝั่งซัพพลายเออร์ได้เร็วกว่าที่จะรู้จาก symptom ปลายทาง" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → concurrency test (สำหรับ service ที่แตะ inventory) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:booking-engine}} และ {{ref:module:cancellation-handler}} ต้องผ่าน concurrency test 100% ก่อน merge เสมอ เพราะแตะเงินและสิทธิ์ในห้องโดยตรง service อื่นผ่อนปรนกว่า" },
      ],
    },
    {
      slug: "supplier-api-timeout-tuning",
      title: "Supplier API Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure/network เท่านั้น ไม่ใช่ business timeout ของ booking hold ซึ่งเป็นคนละเรื่องที่กำหนดไว้ใน {{ref:policy:booking-hold-atomicity-policy}}",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → availability-search | 3.5s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| availability-search → supplier API | 3s | env `SEARCH_TIMEOUT_MS` |\n| booking-engine → supplier API (confirm) | 8s | env `SUPPLIER_CONFIRM_TIMEOUT_MS` |\n| supplier-sync → supplier API (poll) | 15s | env `SUPPLIER_SYNC_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "หลัง {{ref:incident:supplier-api-outage-search-degraded}} ทีมลด timeout ของ availability-search ลงจาก 5s เหลือ 3s เพื่อไม่ให้ query ค้างนานเกินไปตอนซัพพลายเออร์รายใหญ่ตอบช้า แลกกับการตัดซัพพลายเออร์ที่ช้าจริงๆ ออกจากผลลัพธ์เร็วขึ้น" },
      ],
    },
    {
      slug: "inventory-schema-migration-runbook",
      title: "Inventory Schema Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อเพิ่มซัพพลายเออร์รายใหม่ที่มีโครงสร้างข้อมูล inventory ต่างจากที่ {{ref:module:supplier-sync}} รองรับอยู่เดิม ต้อง migrate schema ของ `supplier_inventory_snapshot` ให้รองรับ field ใหม่โดยไม่กระทบซัพพลายเออร์เดิม" },
        { heading: "ขั้นตอน", body: "1) เพิ่มคอลัมน์ใหม่แบบ nullable ก่อนเสมอ ไม่แก้คอลัมน์เดิม 2) deploy parser ที่รองรับทั้ง schema เก่าและใหม่พร้อมกัน 3) sync ทดสอบกับซัพพลายเออร์รายใหม่ในโหมด shadow (ไม่กระทบผลค้นหาจริง) อย่างน้อย 24 ชั่วโมง 4) เปิดใช้งานจริงหลังยืนยันว่าจำนวนห้องว่างตรงกับที่ตรวจสอบด้วยมือ" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = เกิด overbooking หรือคิดเงินผิดหลายรายพร้อมกัน, Sev2 = ซัพพลายเออร์รายใหญ่ล่มหรือ cache ผิดปกติเป็นวงกว้าง, Sev3 = กระทบเล็กน้อยจำกัดวง" },
        { heading: "กรณี overbooking", body: "ทุกเหตุการณ์ overbooking ต้องยกระดับเป็น Sev1 เสมอไม่ว่าจะกระทบลูกค้ากี่รายก็ตาม และแจ้งทีม support ให้ดำเนินการชดเชยตาม {{ref:policy:overbooking-prevention-policy}} ภายใน 1 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "discrepancy rate ของ {{ref:module:supplier-sync}} เกิน 5 ครั้งใน 1 ชั่วโมงต่อซัพพลายเออร์เดียว, booking hold ที่ค้าง `held` เกิน TTL x 3 โดยยังไม่ถูกกวาด, refund ที่ค้างสถานะ `refund_stuck` เกิน 2 ชั่วโมง" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ booking success rate ตกต่ำกว่า 95% หรือมี double-booking เพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:last-room-double-booking-race}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| availability-search | 3 | 12 | CPU > 70% |\n| booking-engine | 2 | 8 | CPU > 60% (ต่ำกว่าที่อื่นเพราะ latency-sensitive) |\n| price-cache | 2 | 6 | memory > 75% |\n| supplier-sync | 1 | 4 | queue depth > 200 |" },
        { heading: "ช่วง Peak Season", body: "ปรับ min replica ของทุก service ขึ้นล่วงหน้าตามปฏิทิน peak season ที่รู้ล่วงหน้า (ธันวาคม-มกราคม, สงกรานต์) แทนที่จะรอ autoscale ตาม threshold เพียงอย่างเดียว ดู {{ref:policy:peak-season-surge-pricing-policy}} สำหรับบริบทราคาที่ปรับพร้อมกัน" },
      ],
    },
    {
      slug: "supplier-onboarding-runbook",
      title: "Supplier Onboarding Runbook",
      tags: ["supplier", "runbook"],
      intro: "ขั้นตอนมาตรฐานสำหรับเชื่อมต่อซัพพลายเออร์รายใหม่ อ้างอิงตาม {{ref:convention:supplier-integration-convention}}",
      sections: [
        { heading: "ก่อนเปิดใช้งานจริง", body: "ต้องผ่าน contract test ครบตาม {{ref:convention:supplier-integration-convention}} และรัน migration ตาม {{ref:deployment:inventory-schema-migration-runbook}} ถ้า schema ต่างจากเดิม" },
        { heading: "ช่วงทดลองใช้งาน", body: "เปิดให้ซัพพลายเออร์ใหม่ปรากฏในผลค้นหาแบบจำกัด (ไม่เกิน 10% ของ traffic) เป็นเวลา 1 สัปดาห์ก่อน เฝ้าดู discrepancy rate เทียบกับซัพพลายเออร์ที่มีอยู่เดิม ถ้าสูงผิดปกติให้หยุดขยายทันที" },
      ],
    },
  ],
};
