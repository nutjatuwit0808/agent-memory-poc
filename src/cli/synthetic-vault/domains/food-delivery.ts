import type { DomainProfile } from "../types.js";

// QuickBite — ระบบสั่งอาหารออนไลน์ (food delivery platform)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const foodDelivery: DomainProfile = {
  id: "food-delivery",
  displayName: "QuickBite — ระบบสั่งอาหารออนไลน์",
  summary: [
    "QuickBite คือแพลตฟอร์มสั่งอาหารออนไลน์ที่เชื่อมต่อร้านอาหารกับลูกค้าผ่านคนขับที่พาร์ทเนอร์กับระบบ ทำงานแบบ real-time ตั้งแต่รับออร์เดอร์ จัดส่งงานให้คนขับที่ใกล้ที่สุด ไปจนถึงคำนวณเวลาจัดส่งโดยประมาณ (ETA) โดยใช้ข้อมูลการจราจรจริงและเวลาเตรียมอาหารของร้าน",
    "ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่การ routing ออร์เดอร์ การ dispatch คนขับ การประมาณ ETA การคำนวณราคา surge ในช่วงเวลาเร่งด่วน และการคำนวณรายได้ของคนขับ ทีมวิศวกรรมเรียกช่วง 11:30-13:30 ว่า lunch peak เพราะเป็นช่วงที่ออร์เดอร์ไหลเข้าหนาแน่นที่สุดในแต่ละวัน",
  ],
  domainTags: ["food-delivery", "quickbite"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:driver-dispatch}} เป็นเจ้าของสถานะคนขับทั้งหมด (ตำแหน่ง, สถานะ online/offline, ออร์เดอร์ที่ถืออยู่) ส่วน {{ref:module:restaurant-relay}} เป็นเจ้าของข้อมูลสถานะของร้าน (เปิด/ปิด, เวลาเตรียมอาหาร, รัศมีรับออร์เดอร์) เท่านั้น",
    "{{ref:module:order-router}} เป็น service เดียวที่ query ข้าม {{ref:module:driver-dispatch}} และ {{ref:module:restaurant-relay}} พร้อมกันได้ เพราะการ route ออร์เดอร์ต้องเห็นทั้งคนขับที่ว่างและร้านที่พร้อมรับงานในเวลาเดียวกัน — ยอมให้ cross-domain query ตรงนี้เพื่อหลีกเลี่ยง race condition ระหว่างสอง service",
  ],
  apiGatewayNote: [
    "คำสั่งจากแอปลูกค้าและร้านอาหารเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ auth แล้วส่งต่อให้ {{ref:module:order-router}} คำขอที่ต้องการผลทันที เช่น เช็กสถานะออร์เดอร์หรือตำแหน่งคนขับแบบ real-time ใช้ synchronous call ผ่านตรงนี้",
    "การอัปเดตตำแหน่งคนขับไม่ผ่าน API gateway ตัวนี้ — ไปทาง WebSocket channel แยกต่างหากที่ {{ref:module:driver-dispatch}} ควบคุมเอง เพราะ frequency สูง (ทุก 3-5 วินาทีต่อคนขับ) และต้องการ latency ต่ำกว่าที่ gateway กลางจะรับไหว",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:driver-dispatch}} ดูแล ได้แก่ `drivers` (สถานะปัจจุบัน), `driver_location_log` (ประวัติตำแหน่ง ไม่ลบทิ้งเพื่อวิเคราะห์ route), และ `active_assignments`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `orders` | order-router | สถานะออร์เดอร์ทั้ง pending/active/delivered |\n| `drivers` | driver-dispatch | ตำแหน่ง, สถานะ, rating ปัจจุบัน |\n| `restaurants` | restaurant-relay | เวลาเตรียมอาหาร, รัศมีรับออร์เดอร์, สถานะเปิด/ปิด |\n| `payout_records` | driver-payout-engine | บันทึกการคำนวณและจ่ายรายได้ |",
    "ทุกตารางใช้ `order_id` เป็น foreign key ร่วมกันแบบ soft reference ไม่มี FK constraint ข้าม database จริง ตรวจสอบความสอดคล้องด้วย reconciliation job รายชั่วโมง",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `order.created`, `order.accepted_by_restaurant`, `driver.assigned`, `driver.picked_up`, `order.delivered`, `driver.went_offline` — {{ref:module:order-router}} เป็นทั้งผู้ publish และ subscribe เพราะต้อง react ต่อการเปลี่ยนแปลงสถานะของออร์เดอร์ที่ตัวเองสร้าง",
    "{{ref:module:driver-payout-engine}} subscribe `order.delivered` เพื่อคำนวณรายได้คนขับอัตโนมัติ โดยไม่ต้องรอให้ {{ref:module:order-router}} สั่งตรงๆ ออกแบบแบบนี้เพื่อให้ระบบ payout ไม่ผูกกับ order flow หลัก ถ้า order-router ล่ม หน้าที่ payout ยังทำงานต่อจาก event ที่ queue รับไว้",
  ],
  modules: [
    {
      slug: "order-router",
      name: "order-router",
      tags: ["routing", "module", "core"],
      description:
        "รับออร์เดอร์ใหม่จาก API gateway แล้วตัดสินใจว่าจะส่งให้ร้านไหนและคนขับคนไหน — เป็น service เดียวที่เห็นภาพรวมทั้ง supply (คนขับว่าง) และ demand (ออร์เดอร์รอ) พร้อมกัน แยกออกมาจาก driver-dispatch เพราะ logic การ match ออร์เดอร์กับคนขับซับซ้อนขึ้นเรื่อยๆ จนปนกับ logic ติดตามสถานะคนขับแล้วทดสอบยาก",
      functions: [
        { sig: "routeOrder(orderId: string, restaurantId: string, customerLocation: LatLng): Promise<RoutingResult>", desc: "เลือกคนขับที่เหมาะสมที่สุดสำหรับออร์เดอร์ คืนผลว่าจับคู่สำเร็จหรือไม่มีคนขับว่าง" },
        { sig: "requeueOrder(orderId: string, reason: string): Promise<void>", desc: "ดันออร์เดอร์กลับเข้าคิวเมื่อคนขับปฏิเสธหรือออฟไลน์กะทันหัน" },
        { sig: "cancelOrder(orderId: string, initiatedBy: 'customer' | 'restaurant' | 'system'): Promise<void>", desc: "ยกเลิกออร์เดอร์พร้อมบันทึกผู้ริเริ่ม เพื่อใช้คำนวณค่าปรับตาม {{ref:policy:restaurant-cancellation-penalty-policy}}" },
        { sig: "getOrderStatus(orderId: string): Promise<OrderStatus>", desc: "คืนสถานะออร์เดอร์ปัจจุบันพร้อม ETA ล่าสุด" },
      ],
      stateFlow: "pending → restaurant_accepted → driver_assigned → picked_up → delivered | cancelled — ดู {{ref:policy:driver-acceptance-timeout-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่ requeue เมื่อไหร่ cancel",
      relatedNotes:
        "ไม่เก็บตำแหน่งคนขับเองเลย — ต้อง query ผ่าน {{ref:module:driver-dispatch}} ทุกครั้งที่ต้องการข้อมูลตำแหน่ง เพื่อรักษาหลัก single source of truth สำหรับ driver state อ้างอิง ETA ล่าสุดจาก {{ref:module:eta-estimator}}",
      internals: {
        constants: [
          { name: "MAX_DISPATCH_RADIUS_KM", value: "8" },
          { name: "ORDER_PENDING_TIMEOUT_SEC", value: "90" },
          { name: "MAX_REQUEUE_ATTEMPTS", value: "3" },
        ],
        typeSnippet:
          "interface RoutingResult {\n  orderId: string;\n  driverId: string | null;\n  status: \"assigned\" | \"no_driver_available\" | \"outside_radius\";\n  estimatedPickupMin: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:max-delivery-radius-policy}} และ {{ref:policy:driver-acceptance-timeout-policy}}",
      },
    },
    {
      slug: "driver-dispatch",
      name: "driver-dispatch",
      tags: ["dispatch", "module", "core"],
      description:
        "เจ้าของสถานะคนขับทุกคนในระบบ (ตำแหน่ง, สถานะ online/offline, ออร์เดอร์ที่ถืออยู่, rating) ทุก service อื่นที่ต้องรู้ว่าคนขับคนไหน \"ว่าง\" ต้อง query ผ่านตัวนี้เท่านั้น ไม่มี service ไหนเก็บ driver state ซ้ำเอง",
      functions: [
        { sig: "getAvailableDrivers(location: LatLng, radiusKm: number): Promise<Driver[]>", desc: "คืนรายการคนขับที่ online และว่างอยู่ในรัศมีที่กำหนด เรียงตามระยะทาง" },
        { sig: "assignOrderToDriver(driverId: string, orderId: string): Promise<void>", desc: "ล็อกออร์เดอร์ให้คนขับ เปลี่ยนสถานะคนขับเป็น busy ทันที" },
        { sig: "recordLocationUpdate(driverId: string, location: LatLng, timestamp: string): Promise<void>", desc: "บันทึก location update ที่คนขับส่งเข้ามาทุก 3-5 วินาที" },
        { sig: "markDriverOffline(driverId: string, reason: string): Promise<void>", desc: "เปลี่ยนสถานะคนขับเป็น offline และ requeue ออร์เดอร์ที่ยังไม่ถูก pick up" },
      ],
      stateFlow: "online_idle → online_assigned → online_busy (กำลังไปรับ/ส่ง) → online_idle หรือ offline (จาก state ไหนก็ได้ถ้าคนขับกดออฟไลน์หรือหมดเวลา heartbeat)",
      relatedNotes:
        "{{ref:module:order-router}} เรียก `getAvailableDrivers` ทุกครั้งก่อน route ออร์เดอร์ แต่ driver-dispatch ไม่รู้จัก concept ของ \"ร้านอาหาร\" หรือ \"เมนู\" เลย — รู้แค่ว่าคนขับคนไหน busy หรือว่าง การตัดสินใจ assignment ทั้งหมดอยู่ที่ order-router",
      internals: {
        constants: [
          { name: "LOCATION_UPDATE_INTERVAL_SEC", value: "4" },
          { name: "DRIVER_OFFLINE_AFTER_MISSED_UPDATES", value: "6" },
          { name: "MAX_CONCURRENT_ORDERS_PER_DRIVER", value: "2" },
        ],
        typeSnippet:
          "interface Driver {\n  driverId: string;\n  status: \"online_idle\" | \"online_assigned\" | \"online_busy\" | \"offline\";\n  location: LatLng;\n  activeOrderIds: string[];\n  ratingAvg: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง rating threshold ที่ {{ref:policy:driver-rating-threshold-policy}}",
      },
    },
    {
      slug: "eta-estimator",
      name: "eta-estimator",
      tags: ["eta", "module", "core"],
      description:
        "คำนวณ ETA ของออร์เดอร์แบบ real-time โดยรวมเวลา 3 ส่วน: เวลาเดินทางของคนขับไปถึงร้าน, เวลาเตรียมอาหารของร้าน, และเวลาเดินทางจากร้านถึงลูกค้า แยกออกมาเป็น service เพราะ logic การประมาณเวลาใช้ external traffic data และ ML model ของร้านแต่ละแห่ง ซึ่งซับซ้อนเกินกว่าจะอยู่ใน order-router",
      functions: [
        { sig: "estimateETA(orderId: string, driverId: string, restaurantId: string): Promise<ETABreakdown>", desc: "คำนวณ ETA รวม 3 ส่วนพร้อม confidence interval" },
        { sig: "refreshETA(orderId: string): Promise<ETABreakdown>", desc: "อัปเดต ETA เมื่อ traffic หรือสถานการณ์เปลี่ยน เรียกทุก 2 นาทีต่อออร์เดอร์ที่ active" },
        { sig: "getRestaurantPrepTime(restaurantId: string, itemCount: number): Promise<number>", desc: "ประมาณเวลาเตรียมอาหารโดย query ประวัติร้านจาก {{ref:module:restaurant-relay}}" },
      ],
      stateFlow: "estimating → ready | failed_traffic_data (ใช้ fallback estimate)",
      relatedNotes:
        "ขึ้นกับ external traffic data API ที่อาจ down ได้ — ถ้า traffic data ไม่พร้อมจะใช้ค่าประมาณ fallback แทน แต่ค่าดังกล่าวจะมี confidence interval กว้างกว่า แนะนำให้แสดงผลแบบ \"ประมาณ X-Y นาที\" แทน exact number ตาม {{ref:policy:driver-acceptance-timeout-policy}}",
      internals: {
        constants: [
          { name: "ETA_REFRESH_INTERVAL_SEC", value: "120" },
          { name: "TRAFFIC_DATA_TIMEOUT_MS", value: "2000" },
          { name: "FALLBACK_SPEED_KM_PER_HR", value: "25" },
        ],
        typeSnippet:
          "interface ETABreakdown {\n  orderId: string;\n  driverToRestaurantMin: number;\n  restaurantPrepMin: number;\n  restaurantToCustomerMin: number;\n  totalMin: number;\n  confidence: \"high\" | \"low\"; // low = ใช้ fallback\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง ETA fallback ที่ {{ref:policy:driver-acceptance-timeout-policy}}",
      },
    },
    {
      slug: "surge-pricer",
      name: "surge-pricer",
      tags: ["pricing", "module"],
      description:
        "คำนวณ surge multiplier สำหรับออร์เดอร์ในพื้นที่และช่วงเวลาที่ demand สูงกว่า supply คนขับ อ่านข้อมูล demand/supply จาก {{ref:module:driver-dispatch}} และ {{ref:module:order-router}} แล้วคำนวณ multiplier ตามสูตรที่ตั้งไว้ล่วงหน้า — ไม่ใช้ ML ตัดสินใจ เพื่อให้ predictable และ auditable",
      functions: [
        { sig: "getSurgeMultiplier(restaurantZoneId: string): Promise<SurgeResult>", desc: "คืน multiplier ปัจจุบันของโซนร้านอาหาร คืน 1.0 ถ้าไม่มี surge" },
        { sig: "computeSurgeForZone(zoneId: string, pendingOrders: number, availableDrivers: number): Promise<number>", desc: "คำนวณ multiplier จาก demand/supply ratio ตามสูตรที่กำหนดใน {{ref:policy:surge-multiplier-cap-policy}}" },
        { sig: "recordSurgeEvent(zoneId: string, multiplier: number, durationMin: number): Promise<void>", desc: "บันทึก surge event เพื่อวิเคราะห์แนวโน้มย้อนหลัง" },
      ],
      relatedNotes:
        "ไม่ตัดสินใจเรื่อง routing หรือ dispatch เลย — เป็นแค่ oracle ที่คืนราคา multiplier ให้ {{ref:module:order-router}} นำไปแสดงผลและใช้ในการคำนวณราคา อ้างอิง cap สูงสุดจาก {{ref:policy:surge-multiplier-cap-policy}} เสมอ",
    },
    {
      slug: "restaurant-relay",
      name: "restaurant-relay",
      tags: ["restaurant", "module"],
      description:
        "เชื่อมต่อระหว่าง QuickBite กับแต่ละร้านอาหาร รับผิดชอบส่งออร์เดอร์ไปให้ร้านยืนยัน รับสถานะเตรียมอาหาร และบริหารจัดการกรณีร้านไม่ตอบสนอง แยกออกมาเป็น service เพราะแต่ละร้านมี integration แตกต่างกัน (API, tablet app, webhook) ทำให้ความซับซ้อนด้านการสื่อสารอยู่ที่ service เดียว",
      functions: [
        { sig: "sendOrderToRestaurant(orderId: string, restaurantId: string): Promise<RelayResult>", desc: "ส่งออร์เดอร์ให้ร้านผ่าน channel ที่ร้านนั้นรองรับ" },
        { sig: "pollRestaurantAcceptance(orderId: string, restaurantId: string): Promise<AcceptanceStatus>", desc: "ตรวจสอบว่าร้านยืนยันออร์เดอร์แล้วหรือยัง" },
        { sig: "markRestaurantUnavailable(restaurantId: string, reason: string): Promise<void>", desc: "ปิดร้านชั่วคราวใน routing pool ถ้าไม่ตอบสนองเกินเกณฑ์ ดู {{ref:policy:restaurant-cancellation-penalty-policy}}" },
      ],
      relatedNotes:
        "{{ref:module:eta-estimator}} เรียก `getRestaurantPrepTime` ซึ่งดึงข้อมูลประวัติเวลาเตรียมอาหารจากตาราง `restaurants` ที่ service นี้ดูแล แต่ restaurant-relay ไม่รู้จัก ETA หรือ routing logic เลย รู้แค่ว่าร้านพร้อมรับหรือไม่",
    },
    {
      slug: "driver-payout-engine",
      name: "driver-payout-engine",
      tags: ["payout", "module"],
      description:
        "คำนวณรายได้ของคนขับต่อออร์เดอร์ รวมถึง base fee, distance bonus, tip ที่ลูกค้าให้, และ surge bonus ถ้ามี ทำงานแบบ event-driven โดย subscribe event `order.delivered` จาก queue แล้วคำนวณและบันทึก payout record ทันที แยกออกมาเพราะ logic การคำนวณรายได้เปลี่ยนบ่อยตาม promotion",
      functions: [
        { sig: "calculatePayout(orderId: string, driverId: string): Promise<PayoutRecord>", desc: "คำนวณรายได้ทั้งหมดสำหรับออร์เดอร์หนึ่ง" },
        { sig: "adjustPayoutForCancellation(orderId: string, cancellationStage: string): Promise<void>", desc: "ปรับรายได้ถ้าออร์เดอร์ถูกยกเลิกหลังคนขับรับงานแล้ว" },
        { sig: "batchTransferPayout(driverId: string, periodEnd: string): Promise<TransferSummary>", desc: "รวบรวมรายได้ค้างจ่ายและส่งไปยัง payment processor รอบสัปดาห์" },
      ],
      relatedNotes:
        "ไม่คุยกับ {{ref:module:surge-pricer}} โดยตรง — surge bonus คำนวณจาก `surge_multiplier` ที่ถูก snapshot ไว้ใน order record ตอนลูกค้าสั่ง ไม่ใช่ค่า surge ปัจจุบัน เพื่อป้องกัน payout ผิดถ้า surge เปลี่ยนระหว่างที่คนขับกำลังส่งอยู่ อ้างอิง {{ref:policy:driver-payout-calculation-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "order-router-service",
      vars: [
        { name: "ORDER_ROUTER_MAX_RADIUS_KM", example: "8", note: "ดู {{ref:policy:max-delivery-radius-policy}}" },
        { name: "ORDER_ROUTER_PENDING_TIMEOUT_SEC", example: "90", note: "ดู {{ref:policy:driver-acceptance-timeout-policy}}" },
        { name: "ORDER_ROUTER_MAX_REQUEUE", example: "3", note: "จำนวนครั้งสูงสุดก่อน cancel อัตโนมัติ" },
      ],
    },
    {
      service: "driver-dispatch-service",
      vars: [
        { name: "DISPATCH_LOCATION_INTERVAL_SEC", example: "4", note: "ความถี่ที่คนขับส่งตำแหน่ง" },
        { name: "DISPATCH_OFFLINE_THRESHOLD_MISSED", example: "6", note: "จำนวน update ที่ขาดก่อนถือว่า offline" },
        { name: "DISPATCH_DB_URL", example: "postgres://dispatch-db.internal:5432/dispatch", note: "secret ห้าม log" },
      ],
    },
    {
      service: "eta-estimator-service",
      vars: [
        { name: "ETA_REFRESH_INTERVAL_SEC", example: "120", note: "ความถี่ refresh ETA ต่อออร์เดอร์ที่ active" },
        { name: "ETA_TRAFFIC_API_TIMEOUT_MS", example: "2000", note: "เกินนี้ใช้ fallback estimate แทน" },
        { name: "ETA_FALLBACK_SPEED_KM_HR", example: "25", note: "ความเร็วสมมติเมื่อ traffic data ไม่พร้อม" },
      ],
    },
    {
      service: "surge-pricer-service",
      vars: [
        { name: "SURGE_MAX_MULTIPLIER", example: "3.0", note: "ดู {{ref:policy:surge-multiplier-cap-policy}}" },
        { name: "SURGE_ACTIVATION_RATIO", example: "0.5", note: "อัตราส่วน driver/order ที่ trigger surge" },
      ],
    },
  ],
  policies: [
    {
      slug: "max-delivery-radius-policy",
      title: "นโยบายรัศมีสูงสุดในการจัดส่ง",
      tags: ["routing", "policy", "delivery-radius"],
      isPrimary: true,
      intro: [
        "ออร์เดอร์จะถูก route ไปยังคนขับที่อยู่ในรัศมีไม่เกิน `ORDER_ROUTER_MAX_RADIUS_KM` กิโลเมตรจากตำแหน่งร้านอาหารเท่านั้น ไม่ใช่จากตำแหน่งลูกค้า — เหตุผลคือเวลาที่ผันแปรมากที่สุดในออร์เดอร์คือเวลาคนขับเดินทางไปร้าน ไม่ใช่ช่วงส่งถึงลูกค้า",
        "รัศมีนี้เป็นค่า hard limit ที่ {{ref:module:order-router}} enforce ระหว่าง query คนขับว่าง ไม่ใช่ preference — คนขับที่อยู่เกินรัศมีจะไม่ถูกพิจารณาเลยแม้จะเป็นคนขับว่างคนเดียวในระบบก็ตาม",
      ],
      sections: [
        {
          heading: "ทำไมไม่ขยายรัศมีเมื่อหาคนขับไม่ได้",
          body: "การขยายรัศมีแบบ dynamic อาจทำให้ ETA พุ่งสูงเกินสิ่งที่ลูกค้าคาดหวังตอนสั่ง — ทีมเลือกที่จะยกเลิกออร์เดอร์แล้วแจ้งลูกค้าให้รู้ตัว ดีกว่าส่งออร์เดอร์ช้าโดยไม่แจ้งล่วงหน้า",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นรัศมีสำหรับออร์เดอร์ Pre-order และ Scheduled Delivery",
        tags: ["routing", "delivery-radius", "pre-order", "edge-case"],
        body: [
          "ออร์เดอร์แบบ pre-order (สั่งล่วงหน้าเกิน 60 นาที) ได้รัศมีขยายเป็น 1.5 เท่าของค่าปกติ เพราะระบบมีเวลาเพียงพอที่จะรอคนขับที่เหมาะกว่ามาออนไลน์ โดยจะเริ่ม dispatch คนขับจริงแค่ 15 นาทีก่อนเวลานัด",
          "ร้านอาหารที่อยู่ใน premium zone (ร้านที่ทำ SLA พิเศษกับ QuickBite) ใช้รัศมีคงที่ที่ตกลงไว้ใน contract ซึ่งอาจมากหรือน้อยกว่าค่า default ก็ได้ ค่านี้ถูก override ใน `restaurants.dispatch_radius_km` ในฐานข้อมูล ไม่ใช้ env var",
        ],
      },
    },
    {
      slug: "driver-acceptance-timeout-policy",
      title: "นโยบาย Timeout การยืนยันรับออร์เดอร์ของคนขับ",
      tags: ["dispatch", "timeout", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:order-router}} ส่งออร์เดอร์ให้คนขับ คนขับมีเวลา `ORDER_ROUTER_PENDING_TIMEOUT_SEC` วินาทีในการยืนยันรับ ถ้าหมดเวลาหรือคนขับกดปฏิเสธ ออร์เดอร์จะถูก requeue ไปหาคนขับคนถัดไปโดยอัตโนมัติ",
        "ออร์เดอร์ที่ถูก requeue เกิน `MAX_REQUEUE_ATTEMPTS` ครั้งจะถูกยกเลิกอัตโนมัติและแจ้งลูกค้า ไม่รอต่อไปอีก เพราะถ้าหาคนขับไม่ได้ใน 3 รอบ มักแปลว่า supply ในพื้นที่นั้นไม่พอ ไม่ใช่โชคไม่ดีชั่วคราว",
      ],
      sections: [
        {
          heading: "ทำไม timeout ถึงสั้น (90 วินาที)",
          body: "การรอนานเกินไปทำให้ ETA ที่แสดงให้ลูกค้าเห็นตอนสั่งไม่ตรงกับความเป็นจริง ลูกค้าจะเสียความเชื่อมั่นมากกว่าถ้ารอนาน 5 นาทีแล้วถูกบอกว่าหาคนขับไม่ได้ เมื่อเทียบกับถูก cancel เร็วๆ แล้วมีโอกาสสั่งร้านอื่น",
        },
      ],
      edgeCase: {
        title: "กรณีคนขับยืนยันรับแต่ไม่ขยับไปร้านภายในเวลาที่กำหนด",
        tags: ["dispatch", "timeout", "stale-assignment", "edge-case"],
        body: [
          "คนขับที่ยืนยันรับออร์เดอร์แล้วแต่ไม่มีการอัปเดตตำแหน่งเข้าใกล้ร้านเลยภายใน 10 นาที ระบบจะ flag เป็น `stale_assignment` และแจ้ง ops team โดยอัตโนมัติ จากนั้น ops มีสิทธิ์ reassign ออร์เดอร์ได้โดยไม่ต้องรอให้คนขับยกเลิกเอง",
          "การ reassign แบบนี้จะ trigger การคำนวณ payout ให้คนขับเดิมด้วยว่าจะได้ค่า cancellation compensation หรือไม่ ขึ้นอยู่กับว่าสาเหตุที่ไม่ขยับเป็นเพราะ driver fault หรือ system issue ดู {{ref:policy:driver-payout-calculation-policy}}",
        ],
      },
    },
    {
      slug: "surge-multiplier-cap-policy",
      title: "นโยบาย Cap ของ Surge Multiplier",
      tags: ["pricing", "surge", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:surge-pricer}} คำนวณ multiplier จาก demand/supply ratio แต่ค่าที่คืนออกมาจะไม่เกิน `SURGE_MAX_MULTIPLIER` ไม่ว่า ratio จะสูงแค่ไหน — cap นี้เป็น hard limit ระดับ policy ไม่ใช่แค่ default config ที่ ops เปลี่ยนได้ตามใจ",
        "การเปลี่ยน cap ต้องผ่านการอนุมัติจาก Head of Supply และ Legal ทุกครั้ง เพราะมีผลต่อการรับรู้ราคาของลูกค้าและอาจกระทบกฎหมายคุ้มครองผู้บริโภคในบางพื้นที่",
      ],
      edgeCase: {
        title: "Surge Cap พิเศษในกรณีภัยพิบัติหรือเหตุฉุกเฉินสาธารณะ",
        tags: ["pricing", "surge", "emergency", "edge-case"],
        body: [
          "ในช่วงภัยพิบัติหรือเหตุฉุกเฉินที่ประกาศเป็นทางการ (ดูจาก government API ที่ระบบ integrate ไว้) surge multiplier จะถูก lock ที่ 1.0 โดยอัตโนมัติ ทั่วพื้นที่ที่ได้รับผลกระทบ ไม่ว่า supply/demand ratio จะเป็นเท่าไหร่ก็ตาม",
          "การ override ค่านี้ด้วยมือระหว่างภาวะฉุกเฉินต้องมีการบันทึกเหตุผลและผู้อนุมัติชัดเจนใน audit log โดย system ไม่มีปุ่ม override ที่ UI ปกติ — ต้องทำผ่าน ops console ที่มีการ log ทุก action",
        ],
      },
    },
    {
      slug: "restaurant-cancellation-penalty-policy",
      title: "นโยบายค่าปรับเมื่อร้านยกเลิกออร์เดอร์",
      tags: ["restaurant", "cancellation", "policy"],
      isPrimary: true,
      intro: [
        "ร้านอาหารที่ยกเลิกออร์เดอร์หลังจากยืนยันรับแล้วจะถูกบันทึก cancellation event ผ่าน {{ref:module:restaurant-relay}} ค่าปรับขึ้นอยู่กับว่ายกเลิกตอนไหน: ก่อนเริ่มเตรียม, ระหว่างเตรียม, หรือหลังคนขับมาถึงร้านแล้ว",
        "ร้านที่มีอัตราการยกเลิกเกิน 5% ใน 7 วันย้อนหลัง จะถูกแขวน visibility ในหน้าค้นหาโดยอัตโนมัติ จนกว่า account manager จะ review และอนุมัติให้กลับมา",
      ],
      sections: [
        {
          heading: "อัตราค่าปรับตามช่วงเวลา",
          body: "| ระยะเวลาที่ยกเลิก | ค่าปรับ (% ของมูลค่าออร์เดอร์) |\n|---|---|\n| ก่อน prepare เริ่ม | 0% |\n| ระหว่าง prepare | 10% |\n| หลังคนขับมาถึงร้าน | 25% |",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นค่าปรับสำหรับร้านที่ออฟไลน์เพราะ Technical Fault",
        tags: ["restaurant", "cancellation", "technical-fault", "edge-case"],
        body: [
          "ถ้า {{ref:module:restaurant-relay}} ตรวจจับได้ว่าร้านออฟไลน์เพราะ connectivity issue จากฝั่ง platform (เช่น webhook ของ QuickBite เอง fail ไม่ใช่ร้านปิด tablet เอง) ค่าปรับจะถูก waive อัตโนมัติและระบบ mark เหตุการณ์นี้ว่าเป็น `platform_fault`",
          "ร้านที่ถูก `platform_fault` flag มากกว่า 3 ครั้งในเดือนเดียวกัน จะ trigger alert ให้ทีม infrastructure ตรวจสอบว่า integration กับร้านนั้นมีปัญหาซ่อนอยู่หรือไม่ แม้ในกรณีที่ทีมเคย conclude ว่าปัญหาแก้แล้วก็ตาม",
        ],
      },
    },
    {
      slug: "driver-rating-threshold-policy",
      title: "นโยบาย Rating Threshold สำหรับคนขับ",
      tags: ["driver", "rating", "policy"],
      isPrimary: true,
      intro: [
        "คนขับที่ rating เฉลี่ย 30 วันย้อนหลังต่ำกว่า 4.2 จะถูก flag โดย {{ref:module:driver-dispatch}} และหยุดรับออร์เดอร์ใหม่อัตโนมัติ จนกว่าจะผ่าน review cycle ถัดไป (ทุก 2 สัปดาห์)",
        "rating ที่คำนวณใช้ weighted average ที่ให้น้ำหนักมากกว่ากับ rating ล่าสุด เพื่อให้คนขับที่กำลังพัฒนาตัวเองได้รับโอกาสฟื้นตัวเร็วกว่าระบบ unweighted average ทั่วไป",
      ],
      edgeCase: {
        title: "คนขับ Rating ต่ำเพราะ Incident ที่ระบบยืนยันแล้วว่าไม่ใช่ความผิดคนขับ",
        tags: ["driver", "rating", "appeal", "edge-case"],
        body: [
          "ถ้าลูกค้า rate ต่ำเพราะ ETA ผิดพลาดจาก traffic data outage (ดู {{ref:incident:eta-cascade-failure}}) หรือเพราะร้านเตรียมอาหารช้ากว่าที่แจ้ง ทีม ops มีสิทธิ์ flag rating นั้นเป็น `platform_caused` และ exclude ออกจากการคำนวณค่าเฉลี่ยของคนขับ",
          "กระบวนการ appeal ต้องทำภายใน 72 ชั่วโมงหลังออร์เดอร์ deliver สำเร็จ คนขับต้องส่ง request ผ่านแอปก่อน ops จะมีข้อมูลออร์เดอร์นั้นปรากฏใน review queue",
        ],
      },
    },
    {
      slug: "minimum-order-value-policy",
      title: "นโยบายมูลค่าออร์เดอร์ขั้นต่ำ",
      tags: ["ordering", "minimum-value", "policy"],
      isPrimary: true,
      intro: [
        "ออร์เดอร์ที่มีมูลค่าสินค้า (ไม่รวมค่าจัดส่งและ surge) ต่ำกว่าค่า minimum ที่ร้านกำหนดจะไม่ถูกส่งให้ {{ref:module:order-router}} เลย — ถูก reject ที่ API gateway ก่อน เพื่อไม่ให้ routing logic ต้องจัดการกับออร์เดอร์ที่ไม่ valid",
        "ร้านแต่ละร้านตั้ง minimum ของตัวเองในช่วงที่ QuickBite กำหนด (ปัจจุบัน 50-500 บาท) ค่า default สำหรับร้านที่ไม่ได้ตั้งคือ 100 บาท",
      ],
      edgeCase: {
        title: "ออร์เดอร์ที่ไม่ถึง Minimum เพราะ Promo Code ลดราคา",
        tags: ["ordering", "minimum-value", "promo", "edge-case"],
        body: [
          "ถ้าออร์เดอร์ก่อนใช้ promo code ผ่าน minimum แต่หลังใช้แล้วต่ำกว่า minimum ระบบจะยังอนุญาตให้ออร์เดอร์ผ่านได้ — minimum check ใช้ราคาก่อน discount เสมอ เพราะ promo code เป็น mechanism ของ QuickBite เอง ไม่ควรทำให้ outcome แย่ลงสำหรับลูกค้าที่ทำตามกติกาถูกต้อง",
          "ยกเว้น promo code ที่ร้านออกเอง (merchant-funded promotion) ซึ่งนับเป็นส่วนลดจริงจากมุมมองร้าน — กรณีนี้ minimum check ใช้ราคาหลัง discount เพราะร้านเป็นคนรับภาระ discount",
        ],
      },
    },
    {
      slug: "driver-payout-calculation-policy",
      title: "นโยบายการคำนวณรายได้คนขับ",
      tags: ["payout", "driver", "policy"],
      isPrimary: false,
      intro: [
        "รายได้ต่อออร์เดอร์คำนวณจาก 4 ส่วน: base fee ต่อออร์เดอร์, distance bonus (บาทต่อกิโลเมตรที่วิ่งจริง), surge bonus (ถ้า multiplier > 1.0 ณ เวลาที่ออร์เดอร์ถูกสร้าง), และ tip ที่ลูกค้าให้",
        "{{ref:module:driver-payout-engine}} คำนวณโดยใช้ค่า snapshot ทั้งหมดจาก order record ณ เวลา delivery ไม่ใช่ค่า live — ทำให้ไม่มีทางที่ payout จะเปลี่ยนไปหลังจาก confirm ครั้งเดียวแล้ว",
      ],
    },
    {
      slug: "order-assignment-priority-policy",
      title: "นโยบายลำดับความสำคัญการมอบหมายออร์เดอร์",
      tags: ["routing", "priority", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อมีคนขับหลายคนว่างพร้อมกันในรัศมี ลำดับการพิจารณาคือ: 1) ระยะทางจากร้าน (ใกล้ที่สุดก่อน) 2) จำนวนออร์เดอร์ที่ถืออยู่แล้ว (น้อยก่อน) 3) rating เฉลี่ย (สูงกว่าก่อน) เกณฑ์ข้อ 1 เป็นตัวกรองหลักเพราะส่งผล ETA มากที่สุด",
        "ระบบไม่พิจารณาประวัติการปฏิเสธออร์เดอร์ในช่วง 1 ชั่วโมงที่ผ่านมา เพื่อไม่ลงโทษคนขับที่ปฏิเสธด้วยเหตุผลสุจริต เช่น รถติดหนักหรืออุบัติเหตุใกล้ๆ",
      ],
    },
    {
      slug: "restaurant-relay-timeout-policy",
      title: "นโยบาย Timeout ของ Restaurant Relay",
      tags: ["restaurant", "timeout", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:restaurant-relay}} รอการยืนยันจากร้านได้ไม่เกิน 3 นาที ถ้าร้านไม่ตอบภายในเวลาดังกล่าว ออร์เดอร์จะถูกยกเลิกอัตโนมัติและแจ้งลูกค้า ไม่ได้ route ไปร้านอื่นโดยอัตโนมัติ เพราะเมนูที่ลูกค้าเลือกอาจมีเฉพาะที่ร้านนั้น",
        "ร้านที่ timeout เกิน 2 ครั้งใน 1 วัน จะถูก auto-flag ให้ {{ref:module:restaurant-relay}} ตรวจสอบ connectivity และอาจ mark ว่า `unreachable` ชั่วคราว ดู {{ref:policy:restaurant-cancellation-penalty-policy}} สำหรับผลที่ตามมา",
      ],
    },
    {
      slug: "delivery-cancellation-fee-policy",
      title: "นโยบายค่าธรรมเนียมยกเลิกออร์เดอร์ฝั่งลูกค้า",
      tags: ["customer", "cancellation", "policy"],
      isPrimary: false,
      intro: [
        "ลูกค้าที่ยกเลิกออร์เดอร์หลังจากร้านยืนยันรับแล้วจะถูกเก็บค่าธรรมเนียมยกเลิก เพื่อชดเชยเวลาและต้นทุนที่ร้านเริ่มเตรียมอาหารไปแล้ว ค่าธรรมเนียมเริ่มที่ 30 บาทและเพิ่มขึ้นตามระยะเวลาที่ผ่านไปหลังร้านยืนยัน",
        "ลูกค้าที่ยกเลิกก่อนร้านยืนยันไม่เสียค่าธรรมเนียมใดๆ ทั้งสิ้น เพราะยังไม่มีต้นทุนจริงเกิดขึ้น",
      ],
    },
    {
      slug: "driver-tip-distribution-policy",
      title: "นโยบายการกระจาย Tip ให้คนขับ",
      tags: ["driver", "tip", "policy"],
      isPrimary: false,
      intro: [
        "tip ที่ลูกค้าให้ 100% ตกเป็นของคนขับที่ส่งออร์เดอร์นั้นทั้งหมด QuickBite ไม่หักส่วนแบ่ง tip ไม่ว่ากรณีใด เพื่อรักษาความเชื่อมั่นของคนขับและสร้าง incentive ให้บริการดี",
        "tip จะถูกรวมใน payout cycle ปกติของคนขับ ไม่ได้โอนให้ทันทีหลังส่งออร์เดอร์ เพราะลูกค้ามีสิทธิ์ dispute tip ได้ภายใน 24 ชั่วโมงถ้าพบปัญหากับออร์เดอร์",
      ],
    },
  ],
  incidents: [
    {
      slug: "driver-dispatch-deadlock",
      title: "คนขับ deadlock เพราะ assignment ไม่ release กัน",
      tags: ["dispatch", "deadlock"],
      summary:
        "ช่วง lunch peak คนขับ 12 คนในโซน Bangkok Central ถูกล็อกให้ busy พร้อมกันทั้งที่ไม่มีออร์เดอร์ที่กำลัง active จริง ออร์เดอร์ใหม่ทุกออร์เดอร์ในโซนนั้นได้รับ `no_driver_available` ตลอด 25 นาที",
      investigation:
        "ตรวจ {{ref:module:driver-dispatch}} พบว่า `active_assignments` มี record ค้างของออร์เดอร์ที่ cancel ไปแล้ว แต่สถานะคนขับยังคง `online_busy` ไม่ถูก release กลับมาเป็น `online_idle`",
      cause:
        "เมื่อ {{ref:module:order-router}} ยกเลิกออร์เดอร์ผ่าน `cancelOrder` มันส่ง event `order.cancelled` ออกไป แต่ driver-dispatch ไม่ได้ subscribe event นี้ — รอ explicit call จาก order-router แทน แต่ code path หนึ่งใน cancelOrder ข้ามการเรียก release ไป",
      resolution:
        "วิศวกร on-call รัน migration script เพื่อ release assignment ค้างทั้งหมดด้วยมือ ทำให้คนขับ 12 คนกลับมา `online_idle` ออร์เดอร์ที่รอค้างทยอย match ได้ภายใน 5 นาที",
      followup:
        "เปลี่ยน driver-dispatch ให้ subscribe event `order.cancelled` แบบ reactive แทนรอ explicit call และเพิ่ม reconciliation job รายนาทีที่ตรวจหา assignment ค้างโดย cross-check กับ order status",
    },
    {
      slug: "eta-cascade-failure",
      title: "ETA cascade failure จาก traffic data outage",
      tags: ["eta", "outage"],
      summary:
        "{{ref:module:eta-estimator}} เริ่ม return ETA ติดลบและ 0 นาทีสำหรับออร์เดอร์ทุกออร์เดอร์ ทำให้แอปลูกค้าแสดงผิดพลาดและลูกค้าจำนวนมาก cancel ออร์เดอร์ที่ยังไม่ถึงมือ",
      investigation:
        "ตรวจ log ของ eta-estimator พบว่า external traffic data API return timeout แล้ว fallback logic คำนวณ `driverToRestaurantMin` เป็นค่า null แทน fallback number จากนั้น null ถูก subtract จากเวลาปัจจุบัน ได้เลขติดลบ",
      cause:
        "Fallback branch ใน `estimateETA` ตั้งใจจะ assign `FALLBACK_SPEED_KM_PER_HR` แต่ type check ไม่เข้มงวดพอ null จาก API timeout ผ่าน type check แล้วไปถึง arithmetic operation โดยไม่มี guard",
      resolution:
        "Deploy hotfix ที่เพิ่ม null guard ก่อน arithmetic ทุกจุด และตั้งค่า fallback explicitly ใน catch block ของ traffic API call ทั้งหมด",
      followup:
        "เพิ่ม integration test สำหรับ traffic API timeout scenario และ add alert สำหรับ ETA ที่ออกมาเป็น ≤ 0 นาทีซึ่งไม่ควรเกิดขึ้น อ้างอิง {{ref:policy:driver-acceptance-timeout-policy}} สำหรับ ETA boundary ที่ valid",
    },
    {
      slug: "surge-price-cap-bypass",
      title: "Surge multiplier เกิน cap เพราะ config โหลดผิด environment",
      tags: ["pricing", "surge"],
      summary:
        "ช่วง rainy season ที่ demand พุ่ง surge multiplier ของบางโซนขึ้นไปถึง 4.5x แม้ `SURGE_MAX_MULTIPLIER` จะตั้งไว้ที่ 3.0 ลูกค้าร้องเรียนเรื่องราคาผิดปกติมาจำนวนมากใน 1 ชั่วโมง",
      investigation:
        "ตรวจ config ที่ {{ref:module:surge-pricer}} โหลดมาใช้ พบว่าโหลด `SURGE_MAX_MULTIPLIER` จาก staging environment (ซึ่ง set เป็น 5.0 สำหรับ testing) แทน production",
      cause:
        "Deploy ล่าสุดของ surge-pricer service มี misconfiguration ใน Kubernetes ConfigMap ที่ reference staging secret ผิด เพราะ YAML ถูก copy จาก staging โดยไม่ได้แก้ environment reference",
      resolution:
        "แก้ ConfigMap ให้ reference production secret ที่ถูกต้องและ redeploy ทันที ใช้เวลา 12 นาทีจาก detect ถึง fix ออร์เดอร์ที่ถูกเก็บราคาเกินได้รับ credit compensation",
      followup:
        "เพิ่ม startup validation ใน surge-pricer ที่ตรวจว่า `SURGE_MAX_MULTIPLIER` อยู่ใน valid range ก่อนรับ traffic จริง และเพิ่ม alert ถ้า multiplier ที่คำนวณได้เกิน 90% ของ cap",
    },
    {
      slug: "restaurant-mass-cancellation",
      title: "ร้านอาหาร 40 ร้านออฟไลน์พร้อมกันจาก relay infrastructure failure",
      tags: ["restaurant", "outage"],
      summary:
        "ออร์เดอร์ทุกออร์เดอร์ที่ route ไปร้านกลุ่มหนึ่งถูก auto-cancel ใน 15 นาที เพราะ {{ref:module:restaurant-relay}} ไม่สามารถ reach ร้านใดเลยในกลุ่มนั้น",
      investigation:
        "ตรวจ infrastructure พบว่า webhook endpoint ที่ restaurant-relay ใช้ส่งออร์เดอร์ไปยังร้านกลุ่มที่ใช้ third-party tablet system เดียวกัน ไม่ตอบสนองทั้งหมด",
      cause:
        "Third-party tablet provider มีการ maintenance ฉุกเฉินและไม่ได้แจ้ง QuickBite ล่วงหน้า ร้านทุกร้านที่ใช้ tablet ของ provider รายนี้หายไปพร้อมกัน",
      resolution:
        "แจ้ง ops team mark ร้านทั้งหมดที่ affected เป็น `unavailable` ด้วยมือเพื่อหยุดส่งออร์เดอร์ใหม่ไปหาพวกเขา รอจนกว่า third-party กลับมา แจ้งลูกค้าทุกคนที่ออร์เดอร์ถูก cancel โดยเร็วที่สุด",
      followup:
        "ตั้ง SLA agreement กับ third-party provider ว่าต้องแจ้งล่วงหน้าอย่างน้อย 1 ชั่วโมงสำหรับ planned maintenance และเพิ่ม circuit breaker ที่ auto-suspend ร้านจากคิว routing ถ้า relay timeout เกิน 5 ครั้งใน 2 นาที",
    },
    {
      slug: "driver-payout-double-calculation",
      title: "คนขับบางรายได้รับการคำนวณ payout ซ้ำสองครั้ง",
      tags: ["payout", "double-calculation"],
      summary:
        "{{ref:module:driver-payout-engine}} คำนวณรายได้สำหรับออร์เดอร์ชุดหนึ่งถึงสองครั้ง ทำให้ payout_records มี duplicate และยอดเงินที่โอนให้คนขับบางรายมากกว่าที่ควรเป็นสองเท่า",
      investigation:
        "ตรวจ event log พบว่า `order.delivered` event ถูกส่งซ้ำจากชั้น message queue เพราะ consumer ของ payout-engine ไม่ได้ implement idempotency check — ประมวลผล event ทุกครั้งที่รับโดยไม่เช็กว่า orderId นี้เคย process แล้วหรือยัง",
      cause:
        "Queue ที่ใช้มี at-least-once delivery guarantee ไม่ใช่ exactly-once — ช่วง network glitch บาง event ถูกส่งซ้ำ 2 ครั้ง ซึ่งปกติไม่เป็นปัญหาถ้า consumer ทำ deduplication เอง แต่ payout-engine ไม่มี logic นี้",
      resolution:
        "เพิ่ม idempotency key check โดยใช้ `orderId` เป็น unique key ก่อน insert payout_record ทุกครั้ง และ rollback payout record ที่ duplicate ออกทั้งหมด",
      followup:
        "ตรวจสอบ consumer อื่นทุกตัวที่ subscribe event จาก queue เดียวกันว่าทุกตัวมี idempotency check และเพิ่ม reconciliation report เปรียบเทียบ payout_records กับ order count รายวัน",
    },
    {
      slug: "order-assigned-to-offline-driver",
      title: "ออร์เดอร์ถูกมอบหมายให้คนขับที่ offline อยู่",
      tags: ["dispatch", "assignment"],
      summary:
        "คนขับหลายรายที่กด offline ในแอปยังคงรับออร์เดอร์ใหม่เข้ามาอยู่ ทำให้ออร์เดอร์ค้างโดยไม่มีใครไปรับจริง",
      investigation:
        "ตรวจ race condition ระหว่าง `markDriverOffline` กับ `assignOrderToDriver` ใน {{ref:module:driver-dispatch}} พบว่ามี time window เล็กน้อยที่คนขับ set offline ในฝั่ง WebSocket แต่ cache ใน `getAvailableDrivers` ยังไม่ expire",
      cause:
        "Status cache สำหรับ driver availability มี TTL 30 วินาทีเพื่อลด DB query แต่ offline event จาก WebSocket ไม่ได้ invalidate cache ทันที ทำให้ช่วง 30 วินาทีนั้น order-router ยังเห็นคนขับเป็น `online_idle`",
      resolution:
        "เพิ่ม cache invalidation call ทันทีที่รับ offline event จาก WebSocket แทนที่จะรอ TTL หมดอายุ",
      followup:
        "ลด TTL ของ availability cache จาก 30 วินาทีเหลือ 5 วินาทีสำหรับ status ที่เปลี่ยนแปลงบ่อย และเพิ่ม alert สำหรับออร์เดอร์ที่อยู่ใน `driver_assigned` นานเกิน 8 นาทีโดยไม่มีคนขับขยับ",
    },
    {
      slug: "surge-multiplier-freeze-during-peak",
      title: "Surge multiplier ค้างไม่อัปเดตระหว่าง lunch peak",
      tags: ["pricing", "surge"],
      summary:
        "ช่วง lunch peak surge multiplier ของหลายโซนค้างที่ค่าเดิมนาน 45 นาที ทั้งที่ demand/supply ratio เปลี่ยนไปมากแล้ว",
      investigation:
        "ตรวจ {{ref:module:surge-pricer}} พบว่า background job ที่คำนวณ multiplier ใหม่ทุก 30 วินาทีหยุดทำงานกะทันหัน โดยไม่มี alert ใดๆ เพราะ job crash แบบ silent ไม่ throw exception ออกมา",
      cause:
        "Job ใช้ข้อมูล `pendingOrders` จาก {{ref:module:order-router}} ผ่าน internal API call ที่ไม่มี timeout กำหนด เมื่อ order-router response ช้าช่วง peak job จึงค้างรอโดยไม่มีกำหนด และ goroutine pool ของ surge-pricer เต็ม",
      resolution:
        "เพิ่ม timeout 5 วินาทีในการ call order-router และเพิ่ม monitoring ที่ alert ถ้า multiplier refresh หยุดทำงานนานเกิน 60 วินาที restart service ด้วยมือเพื่อ clear goroutine leak",
      followup:
        "ตรวจสอบ internal API call ทุกจุดใน surge-pricer ที่ยังไม่มี timeout กำหนด และพิจารณา circuit breaker pattern เพื่อหลีกเลี่ยง cascade slow ครั้งต่อไป",
    },
    {
      slug: "eta-estimator-infinite-loop",
      title: "eta-estimator วนลูปไม่จบเพราะ refreshETA ไม่มี terminal condition",
      tags: ["eta", "bug"],
      summary:
        "{{ref:module:eta-estimator}} ใช้ CPU พุ่งสูงผิดปกติในช่วงกลางดึก พบว่าออร์เดอร์ที่ `delivered` แล้วยังถูก refreshETA ซ้ำไปเรื่อยๆ",
      investigation:
        "ตรวจ job ที่ trigger `refreshETA` พบว่า query ออร์เดอร์ที่ \"active\" แต่ใช้ filter ที่ไม่ครอบคลุมสถานะ `delivered` ทำให้ออร์เดอร์ที่ส่งสำเร็จแล้วยังถูกนับว่า active และถูก refresh ต่อ",
      cause:
        "Filter condition ใน query เขียนเป็น `status != 'cancelled'` แทนที่จะเป็น `status IN ('restaurant_accepted', 'driver_assigned', 'picked_up')` ทำให้ `delivered` ผ่าน filter ได้เพราะไม่ใช่ `cancelled`",
      resolution:
        "แก้ filter ให้ใช้ whitelist ของ status ที่ควร refresh แทน blacklist และเพิ่ม index บน `status` column เพื่อป้องกัน full table scan ที่ทำให้ DB ช้าระหว่าง incident",
      followup:
        "ตรวจสอบ query อื่นที่ใช้ blacklist pattern ใน codebase ทั้งหมด และเพิ่ม alert สำหรับ refreshETA job ที่ทำงานนานเกิน 5 นาทีต่อรอบ",
    },
    {
      slug: "restaurant-relay-queue-overflow",
      title: "Restaurant relay queue ล้นช่วง holiday peak",
      tags: ["restaurant", "queue"],
      summary:
        "ช่วงเทศกาล outstanding relay request ไปยังร้านสะสมเกิน 10,000 รายการ ทำให้ออร์เดอร์ใหม่ต้องรอนาน 8-15 นาทีกว่าร้านจะได้รับ",
      investigation:
        "ตรวจ {{ref:module:restaurant-relay}} พบว่า worker pool size คงที่ไม่ auto-scale และ queue depth ไม่มี alarm จนล้นโดยไม่มีใครรู้ตัวนาน 45 นาที",
      cause:
        "Worker pool ถูก hard-code ไว้ที่ 20 workers ซึ่งเพียงพอสำหรับ normal traffic แต่ไม่เพียงพอสำหรับ 4x surge ช่วงเทศกาล และไม่มีการทดสอบ load scenario นี้มาก่อน",
      resolution:
        "เพิ่ม worker pool size ด้วยมือไปที่ 80 workers ชั่วคราว queue ระบาย backlog ภายใน 20 นาที",
      followup:
        "เพิ่ม auto-scaling สำหรับ worker pool ตาม queue depth และเพิ่ม alert สำหรับ queue depth เกิน 1,000 รายการ ดู {{ref:deployment:scaling-policy}} สำหรับ target replica count",
    },
    {
      slug: "driver-dispatch-race-condition",
      title: "Race condition ใน driver dispatch มอบหมายคนขับคนเดียวให้สองออร์เดอร์",
      tags: ["dispatch", "race-condition"],
      summary:
        "คนขับคนหนึ่งถูก assign ให้สองออร์เดอร์พร้อมกันทั้งที่ `MAX_CONCURRENT_ORDERS_PER_DRIVER` ตั้งไว้ที่ 2 แต่นี่เป็นการ assign ครั้งแรก (ไม่ใช่ออร์เดอร์ที่ 2)",
      investigation:
        "ตรวจ `assignOrderToDriver` พบว่า check จำนวน active orders ของคนขับไม่ได้ lock row ก่อน assignment ทำให้ request สอง request อ่านเห็น 0 orders พร้อมกันแล้ว assign ทั้งคู่",
      cause:
        "การ query `SELECT COUNT(*) FROM active_assignments WHERE driver_id = ?` กับ `INSERT INTO active_assignments` ไม่ได้อยู่ใน transaction เดียวกัน ทำให้ gap ระหว่างสองคำสั่งเปิดโอกาส concurrent request เข้ามา",
      resolution:
        "ย้ายทั้ง check และ insert เข้า transaction เดียวกันพร้อม SELECT FOR UPDATE เพื่อ lock driver row ระหว่าง assignment",
      followup:
        "ตรวจสอบ pattern read-then-write อื่นใน driver-dispatch และ order-router ตาม บทเรียนเดียวกับ {{ref:incident:driver-payout-double-calculation}}",
    },
    {
      slug: "payout-engine-timezone-bug",
      title: "Payout engine คำนวณ surge bonus ผิดเพราะ timezone mismatch",
      tags: ["payout", "timezone"],
      summary:
        "คนขับที่ทำงานช่วง 23:00-01:00 ได้รับ surge bonus ผิดพลาดเพราะ snapshot time ที่ใช้คำนวณอยู่ใน timezone UTC ที่ต่างวันจากเวลาจริงในประเทศ",
      investigation:
        "ตรวจ payout calculation ใน {{ref:module:driver-payout-engine}} พบว่า `surge_multiplier` ถูก snapshot ด้วย timestamp UTC แต่ logic เลือก multiplier tier ใช้ local time ทำให้ช่วง 23:00-01:00 local ตก bucket ผิด",
      cause:
        "ส่วนหนึ่งของ codebase ใช้ UTC อีกส่วนใช้ local timezone ไม่มี convention กลางที่ enforce ว่า timezone ไหนเป็น canonical",
      resolution:
        "แก้ทุก timestamp ใน payout_records ให้ store เป็น UTC เสมอ แล้ว convert เป็น local timezone เฉพาะตอนแสดงผลใน driver app เท่านั้น",
      followup:
        "เขียน timezone convention ลงใน {{ref:convention:naming-convention}} และ add linting rule ที่ flag การใช้ `new Date()` โดยไม่ explicit timezone",
    },
    {
      slug: "restaurant-availability-stale-cache",
      title: "ร้านที่ปิดแล้วยังถูกส่งออร์เดอร์เพราะ availability cache เก่า",
      tags: ["restaurant", "cache"],
      summary:
        "ร้านที่ปิดระหว่างวันยังคงรับออร์เดอร์เข้ามาต่ออีก 10 นาทีหลังจากกด close ในแอปร้าน เพราะ cache ยังเห็นร้านเป็น available",
      investigation:
        "ตรวจ {{ref:module:restaurant-relay}} พบว่า restaurant availability cache มี TTL 10 นาที เหตุการณ์ `restaurant.closed` ไม่ได้ invalidate cache ทันที",
      cause:
        "ตัวเลือกออกแบบตั้งใจลด DB load ด้วย cache TTL ยาว แต่ไม่ได้ implement event-driven invalidation ทำให้การ close ร้านมีความล่าช้าที่ acceptable สำหรับ throughput แต่ unacceptable สำหรับ customer experience",
      resolution:
        "เพิ่ม explicit cache invalidation ทุกครั้งที่รับ `restaurant.closed` หรือ `restaurant.status_changed` event และลด TTL เป็น 60 วินาทีสำหรับ availability status",
      followup:
        "ทบทวน cache strategy ทั้งหมดใน restaurant-relay ว่า TTL แต่ละ entry เหมาะกับความบ่อยของการเปลี่ยนแปลงข้อมูลนั้นจริงหรือไม่",
    },
    {
      slug: "order-router-single-point-failure",
      title: "order-router service crash ทำให้ระบบทั้งหมดหยุดรับออร์เดอร์",
      tags: ["routing", "availability"],
      summary:
        "ออร์เดอร์ทุกออร์เดอร์ fail อยู่ 8 นาทีเพราะ order-router replica ทุก replica crash พร้อมกัน ก่อนที่ Kubernetes จะ restart ขึ้นมาใหม่",
      investigation:
        "ตรวจ crash log พบว่า OOM kill เกิดกับทุก replica พร้อมกันเพราะ memory leak ใน connection pool ที่สะสมมาหลายชั่วโมง แล้ว peak traffic ช่วง lunch เป็นตัว trigger ให้ memory หมด",
      cause:
        "Connection ไปยัง {{ref:module:driver-dispatch}} ไม่ได้ถูก release หลัง query สำเร็จ ทุก request เปิด connection ใหม่โดยไม่ reuse pool ทำให้ file descriptor และ memory สะสมขึ้นเรื่อยๆ",
      resolution:
        "Restart service ทันทีเพื่อ recover traffic ก่อน จากนั้น deploy hotfix ที่แก้ connection pool leak ในคืนเดียวกัน",
      followup:
        "เพิ่ม memory usage alert สำหรับทุก service ที่ไม่มี และกำหนด runbook สำหรับ OOM recovery ใน {{ref:deployment:incident-response-runbook}} พร้อม health check ที่ตรวจ memory ด้วย",
    },
    {
      slug: "driver-rating-threshold-bug",
      title: "คนขับ Rating ต่ำกว่าเกณฑ์ไม่ถูก flag เพราะ weighted average คำนวณผิด",
      tags: ["driver", "rating", "bug"],
      summary:
        "คนขับบางรายที่มีคะแนน rating ช่วงล่าสุดต่ำมากยังคงรับออร์เดอร์ได้ต่อเนื่อง เพราะ weighted average ใน {{ref:module:driver-dispatch}} คำนวณน้ำหนักผิด",
      investigation:
        "ตรวจ query ที่คำนวณ weighted average พบว่าใช้ `ORDER BY rating_time DESC` แล้วกำหนด weight เป็น row number แต่กลับ assign weight ใหญ่สุดให้กับ row แรก (เก่าสุด) แทน row ล่าสุด เพราะเข้าใจผิดว่า DESC = recent first",
      cause:
        "DESC ordering ทำให้ row ที่ 1 เป็น rating ล่าสุดจริง แต่ weight formula ตั้งใจให้ 1 = น้ำหนักมากสุด ซึ่งถูกกำหนดให้กับ rating ล่าสุด แต่ code implement กลับข้างเพราะความเข้าใจผิดเรื่อง index",
      resolution:
        "แก้ weight formula ให้ถูกต้องและ recompute `ratingAvg` ของ driver ทุกรายใน database พร้อมหยุดรับงานคนขับที่พอ recompute แล้วต่ำกว่าเกณฑ์ตาม {{ref:policy:driver-rating-threshold-policy}}",
      followup:
        "เพิ่ม unit test ที่ verify weighted average ด้วย known input/output และเขียน convention เรื่อง SQL ordering ใน {{ref:convention:code-review-checklist}}",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/QB-142-surge-cap-validation`, `fix/QB-307-driver-cache-invalidation`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(driver-dispatch): แก้ race condition ใน assignOrderToDriver`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ state ของ order หรือ driver ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:driver-dispatch-race-condition}}) และการเปลี่ยน config ค่าที่กระทบ threshold หรือ cap ต้องมีคนที่สองยืนยันก่อน merge" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `routeOrder`, `getSurgeMultiplier` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย ทุก timestamp ใน record ต้อง store เป็น UTC เสมอ (ดูบทเรียนจาก {{ref:incident:payout-engine-timezone-bug}})" },
        { heading: "Identifier ของ entity หลัก", body: "`orderId` รูปแบบ UUID v4, `driverId` รูปแบบ `DRV-<6 หลัก>`, `restaurantId` รูปแบบ `RST-<4 หลัก>` ต้องตรงกับ record จริงใน database เสมอ" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ order ต้องมี `orderId` เสมอ เพื่อไล่ log ข้าม service ได้ (order-router → driver-dispatch → eta-estimator → driver-payout-engine) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "`dispatch failure` และ `payout error` log เป็น `error` เสมอ แม้จะเป็นเหตุการณ์ที่ recover ได้ เพราะทีม on-call ต้อง grep เจอง่ายตอน incident" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`QB_<DOMAIN>_<REASON>` เช่น `QB_ROUTE_NO_DRIVER`, `QB_SURGE_CAP_EXCEEDED`, `QB_PAYOUT_DUPLICATE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`QB_DRIVER_OFFLINE`, `QB_ORDER_TIMEOUT`, `QB_RESTAURANT_UNAVAILABLE`, `QB_ETA_FALLBACK` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "integration"],
      sections: [
        { heading: "Integration test สำหรับ concurrent scenarios", body: "ฟังก์ชันที่แตะ order assignment หรือ driver state ต้องมี test จำลอง concurrent request อย่างน้อย 2 request พร้อมกัน — บทเรียนจาก {{ref:incident:driver-dispatch-race-condition}} คือ sequential test ไม่เจอ race condition" },
        { heading: "Timezone test", body: "ฟังก์ชันที่เกี่ยวกับ timestamp หรือ time window ต้องมี test ที่รันด้วย UTC+7 และ UTC timezone ที่ต่างกัน ดูบทเรียนจาก {{ref:incident:payout-engine-timezone-bug}}" },
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
      slug: "driver-event-schema-convention",
      title: "Driver Event Schema Convention",
      tags: ["events", "driver", "schema"],
      intro: "คนขับทุกคนส่ง location update เข้า {{ref:module:driver-dispatch}} ทุก `DISPATCH_LOCATION_INTERVAL_SEC` วินาที เอกสารนี้กำหนด schema ของ event ที่ต้องใช้ตรงกันทุก app version",
      sections: [
        { heading: "Location update event", body: "ต้องมี field บังคับ: `driverId`, `timestamp` (ISO 8601 UTC), `lat`, `lng`, `accuracy_m` — ขาด field ใดตัวหนึ่ง driver-dispatch จะ reject และ log เป็น `warn` ไม่ใช่ `error` เพราะ single missed update ไม่ถือว่า critical" },
        { heading: "Status event", body: "`driver.went_online` และ `driver.went_offline` ต้องมี `reason` field เสมอ (`manual`, `battery_low`, `connection_lost`) เพื่อให้ ops วิเคราะห์ pattern offline ได้" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันหลาย service เพราะ inter-service dependency สูง" },
        { heading: "Gate พิเศษ", body: "{{ref:module:surge-pricer}} และ {{ref:module:driver-payout-engine}} ต้องผ่าน integration test 100% ก่อน deploy เสมอ เพราะส่งผลต่อรายรับของคนขับโดยตรง service อื่นผ่อนปรนกว่า" },
      ],
    },
    {
      slug: "driver-location-tracking-infra",
      title: "Driver Location Tracking Infrastructure",
      tags: ["infrastructure", "tracking"],
      intro: "เอกสารนี้อธิบาย infrastructure ที่รองรับ location update จากคนขับทุกคนแบบ real-time — แยกจาก REST API ปกติเพราะ traffic pattern แตกต่างกันมาก",
      sections: [
        { heading: "WebSocket cluster", body: "{{ref:module:driver-dispatch}} รับ location update ผ่าน WebSocket cluster ที่ auto-scale ตามจำนวน connection ใน peak hour มีคนขับ online พร้อมกัน 2,000-5,000 คน ทำให้ connection count สูงกว่า REST request มาก" },
        { heading: "Location log storage", body: "Location history ทุก point ถูก append-only log ไว้ใน time-series store แยกต่างหาก ไม่ลบทิ้ง ใช้วิเคราะห์ route pattern ย้อนหลัง และเป็น evidence เมื่อมีข้อพิพาทระหว่างลูกค้ากับคนขับ" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ระบบรับออร์เดอร์ไม่ได้ทั้งหมดหรือ payout ผิดพลาดมาก, Sev2 = กระทบบางโซน/บาง service บางส่วน, Sev3 = กระทบเล็กน้อย user experience แย่ลงแต่ workflow หลักยังทำงานได้" },
        { heading: "กรณีที่ต้อง escalate ทันที", body: "payout double calculation หรือ driver assignment ที่ทำให้ driver ได้รับเงินผิด ต้องยกระดับเป็น Sev1 เสมอและแจ้ง Finance team ทันทีโดยไม่ต้องรอยืนยันจากทีม engineering" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "order_pending_timeout rate เกิน 5% ของ order ทั้งหมด, driver availability ต่ำกว่า 50% ใน peak zone, surge multiplier เกิน 95% ของ cap, ETA ที่คำนวณได้ ≤ 0, payout_records ที่ duplicate orderId" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมง ดู {{ref:deployment:incident-response-runbook}} สำหรับ escalation path" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ order success rate ตกต่ำกว่า 85% หรือมี payout error เพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:surge-price-cap-bypass}}" },
        { heading: "ขั้นตอน", body: "deploy version ก่อนหน้ากลับผ่าน pipeline เดียวกัน ไม่ skip smoke test แล้วแจ้งทีม Finance ทุกครั้งที่ rollback เกี่ยวกับ payout-engine หรือ surge-pricer" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของแต่ละ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| order-router | 3 | 12 | request rate > 500 rps |\n| driver-dispatch | 2 | 10 | connection count > 3000 |\n| eta-estimator | 2 | 8 | CPU > 65% |\n| surge-pricer | 2 | 6 | CPU > 60% |" },
        { heading: "Lunch peak pre-scaling", body: "ทุกวันเวลา 11:00 (30 นาทีก่อน peak) ระบบ pre-scale service หลักขึ้นเป็น 70% ของ max replica โดยอัตโนมัติ เพื่อไม่ให้ autoscaler lag ทัน traffic ที่พุ่งเร็ว" },
      ],
    },
    {
      slug: "surge-pricing-deployment-runbook",
      title: "Surge Pricing Deployment Runbook",
      tags: ["surge", "runbook"],
      intro: "การ deploy configuration เปลี่ยนแปลง surge-related ต้องทำตาม runbook นี้เสมอ เพราะผิดพลาดมีผลต่อทั้งลูกค้าและคนขับ ดูบทเรียนจาก {{ref:incident:surge-price-cap-bypass}}",
      sections: [
        { heading: "ก่อน deploy", body: "ตรวจสอบว่า `SURGE_MAX_MULTIPLIER` ใน ConfigMap ถูก reference จาก production secret (ไม่ใช่ staging) และ verify ค่าตรงกับที่ Head of Supply อนุมัติ" },
        { heading: "หลัง deploy", body: "เฝ้าดู multiplier ที่ surge-pricer คืนออกมาใน dashboard อย่างน้อย 15 นาที ถ้าค่าเกิน cap ให้ rollback ทันทีตาม {{ref:deployment:rollback-procedure}}" },
      ],
    },
    {
      slug: "restaurant-integration-runbook",
      title: "Restaurant Integration Runbook",
      tags: ["restaurant", "integration", "runbook"],
      sections: [
        { heading: "การ onboard ร้านใหม่", body: "ร้านใหม่ต้องทดสอบ relay integration ใน staging environment ก่อน go-live อย่างน้อย 48 ชั่วโมง โดยส่ง dummy order อย่างน้อย 20 ออร์เดอร์และยืนยันว่า response time เฉลี่ยต่ำกว่า 60 วินาที" },
        { heading: "การย้าย integration ของร้านเดิม", body: "ถ้าร้านย้ายจาก tablet ตัวหนึ่งมา API integration ใหม่ ต้องทดสอบ parallel run ทั้งสอง channel พร้อมกันนาน 24 ชั่วโมงก่อน cutover จริง เพื่อป้องกัน {{ref:incident:restaurant-mass-cancellation}} ซ้ำ" },
      ],
    },
  ],
};
