import type { DomainProfile } from "../types.js";

// TrackGrid — แพลตฟอร์มติดตามยานพาหนะ/ฟลีทด้วย GPS สำหรับบริษัทโลจิสติกส์
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const iotFleetTracker: DomainProfile = {
  id: "iot-fleet-tracker",
  displayName: "TrackGrid — ระบบติดตามฟลีทยานพาหนะ",
  summary: [
    "TrackGrid คือแพลตฟอร์มติดตามตำแหน่งยานพาหนะแบบเรียลไทม์สำหรับบริษัทโลจิสติกส์ รับสัญญาณจากอุปกรณ์ GPS tracker ที่ติดตั้งบนรถบรรทุกและรถส่งของหลายหมื่นคันทั่วประเทศ ตัวอุปกรณ์เองเป็นฮาร์ดแวร์บางที่ทำหน้าที่แค่ส่งพิกัดกับ telemetry พื้นฐาน (ความเร็ว, ทิศทาง, ระดับน้ำมัน/แบตเตอรี่) ส่วนตรรกะทั้งหมด เช่น การตัดสินว่ารถเข้า-ออกโซนไหน หรือควรวิ่งเส้นทางไหน อยู่ฝั่ง backend ทั้งหมด",
    "ระบบแบ่งเป็น service ย่อยตามหน้าที่ ตั้งแต่รับ ping ดิบจากอุปกรณ์ ไปจนถึงคำนวณเส้นทางที่ดีที่สุดและสรุปทริปเพื่อออกบิลลูกค้า ทีมวิศวกรรมเรียกช่วง 07:00-09:00 และ 16:00-19:00 ว่า rush window เพราะเป็นช่วงที่ปริมาณ ping เข้าระบบพุ่งสูงสุดจากรถส่งของที่วิ่งพร้อมกันเยอะที่สุด",
  ],
  domainTags: ["iot-fleet-tracker", "trackgrid"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:gps-ingest}} เป็นเจ้าของ raw ping เท่านั้น ไม่รู้จัก concept ของ \"geofence\" หรือ \"trip\" เลย ส่วน {{ref:module:geofence-engine}} เป็นเจ้าของ zone definition และ event เข้า-ออกโซน โดยไม่เก็บ ping ดิบซ้ำ",
    "{{ref:module:trip-aggregator}} เป็น service เดียวที่ query ข้าม ping ดิบจาก {{ref:module:gps-ingest}} และ event จาก {{ref:module:geofence-engine}} พร้อมกันเพื่อประกอบเป็นทริป — เหตุผลที่ยอมให้ service นี้ทำ cross-domain query (ผิดหลักทั่วไป) คือการสรุปทริปต้องเห็นทั้งเส้นทางดิบและจุด stop ที่มีความหมายทางธุรกิจพร้อมกัน ถ้าแยกกันคำนวณจะได้ระยะทางไม่ตรงกับที่ลูกค้าเห็นจริง",
  ],
  apiGatewayNote: [
    "คำสั่งจาก dashboard ลูกค้าเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปล request เช่น \"ดูตำแหน่งรถคันนี้ตอนนี้\" เป็น query ไปยัง {{ref:module:gps-ingest}} คำขอที่ต้องการผลลัพธ์ทันที เช่น สถานะอุปกรณ์ปัจจุบัน ใช้ synchronous call ตรงนี้",
    "การแจ้งเตือนแบบเรียลไทม์ เช่น รถออกนอกเส้นทางที่กำหนด ไม่ผ่าน API gateway ตัวนี้ — {{ref:module:alert-dispatcher}} push ผ่าน WebSocket channel แยกต่างหาก เพราะ latency ของ gateway กลาง (เฉลี่ย 150-300ms ตอน rush window) ทำให้แจ้งเตือนช้าเกินไปสำหรับเหตุการณ์ที่ dispatcher ต้องตอบสนองทันที",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:gps-ingest}} ดูแล ได้แก่ `device_pings` (ping ดิบทุกตัวจากอุปกรณ์ เก็บแบบ append-only ไม่แก้ย้อนหลัง), `devices` (สถานะอุปกรณ์แต่ละตัว) และ `device_activation_log`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `device_pings` | gps-ingest | partition รายวันตาม timestamp เพราะปริมาณสูงมาก |\n| `geofence_zones` | geofence-engine | นิยามขอบเขตโซนเป็น polygon |\n| `geofence_events` | geofence-engine | event เข้า/ออกโซน อ้างอิง `device_pings` แบบ soft reference |\n| `trips` | trip-aggregator | ทริปที่ประกอบเสร็จแล้ว ใช้คิดบิลลูกค้า |",
    "ทุกตารางใช้ `device_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `ping.received`, `geofence.entered`, `geofence.exited`, `device.offline`, `trip.completed` — {{ref:module:geofence-engine}} subscribe `ping.received` แล้ว evaluate ว่า ping ล่าสุดอยู่ในโซนไหนก่อนจะ publish event ของตัวเอง",
    "{{ref:module:alert-dispatcher}} subscribe เกือบทุก event ประเภทข้างต้นเพราะต้องตัดสินใจว่าเหตุการณ์ไหนควรแจ้งเตือนลูกค้าทันที ออกแบบให้เป็น subscriber ปลายทางเสมอ ไม่ publish event กลับเข้า queue หลัก เพื่อไม่ให้เกิด event loop",
  ],
  modules: [
    {
      slug: "gps-ingest",
      name: "gps-ingest",
      tags: ["ingest", "module", "core"],
      description:
        "รับ ping ดิบจากอุปกรณ์ GPS tracker ทุกตัวผ่าน UDP listener แบบ lightweight แล้วแปลงเป็น structured event ก่อนส่งต่อเข้า queue หลัก แยกออกมาเป็น service อิสระตั้งแต่ต้นเพราะ throughput ที่ต้องรับ (สูงสุดกว่า 20,000 ping/วินาทีช่วง rush window) ต้องการ path ที่บางที่สุดเท่าที่จะทำได้ ไม่ปนกับ logic ธุรกิจใดๆ",
      functions: [
        { sig: "ingestPing(deviceId: string, raw: RawPingPayload): Promise<void>", desc: "รับ ping ดิบ validate โครงสร้างเบื้องต้น แล้ว publish เข้า queue" },
        { sig: "getLatestPosition(deviceId: string): Promise<PositionSnapshot | null>", desc: "คืนตำแหน่งล่าสุดที่รู้จักของอุปกรณ์ ใช้ตอบ dashboard แบบ synchronous" },
        { sig: "markDeviceOffline(deviceId: string): Promise<void>", desc: "เปลี่ยนสถานะอุปกรณ์เป็น offline เมื่อไม่มี ping เข้ามาเกิน threshold" },
      ],
      stateFlow: "online → (ไม่มี ping ครบ threshold) → offline → (ping กลับมา) → online — ดู {{ref:policy:device-offline-detection-policy}} สำหรับเงื่อนไข threshold",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:geofence-engine}} โดยตรง — ping ที่ validate ผ่านแล้วถูก publish เข้า queue กลางเท่านั้น (ดู {{ref:arch:queue}}) เพื่อรักษาหลัก separation of concerns ไม่ให้ ingest layer รู้จัก concept ทางธุรกิจของ geofence เลย",
      internals: {
        constants: [
          { name: "PING_VALIDATION_MAX_SKEW_SEC", value: "120" },
          { name: "DEVICE_OFFLINE_AFTER_MISSED_PINGS", value: "10" },
          { name: "INGEST_UDP_BUFFER_SIZE_KB", value: "64" },
        ],
        typeSnippet:
          "interface RawPingPayload {\n  lat: number;\n  lng: number;\n  speedKph: number;\n  headingDeg: number;\n  fuelPct: number | null;\n  deviceTimestamp: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:device-offline-detection-policy}}",
      },
    },
    {
      slug: "geofence-engine",
      name: "geofence-engine",
      tags: ["geofence", "module", "core"],
      description:
        "ประเมินว่าตำแหน่งล่าสุดของยานพาหนะแต่ละคันอยู่ในโซนที่ลูกค้ากำหนดไว้หรือไม่ (เช่น เขตส่งของ, เขตห้ามเข้า) แล้ว publish event เข้า-ออกโซน แยกออกมาจาก gps-ingest ตั้งแต่กลางปี 2025 เพราะ logic การเทียบ polygon ซับซ้อนขึ้นเรื่อยๆ (โซนซ้อนกัน, โซนที่มีรูขาด) จนทำให้ ingest path ช้าลงถ้าคำนวณ inline",
      functions: [
        { sig: "evaluatePing(deviceId: string, position: PositionSnapshot): Promise<GeofenceEvalResult>", desc: "เทียบตำแหน่งกับโซนที่เกี่ยวข้องทั้งหมด คืนรายการโซนที่เพิ่งเข้า/ออก" },
        { sig: "registerZone(customerId: string, polygon: GeoPolygon): Promise<string>", desc: "สร้างโซนใหม่ คืน zoneId" },
        { sig: "listActiveZonesNear(lat: number, lng: number): Promise<Zone[]>", desc: "คืนโซนที่อยู่ใกล้พิกัดที่ระบุ ใช้กรองก่อน evaluate เพื่อลดจำนวน polygon ที่ต้องเทียบ" },
      ],
      stateFlow: "outside → (ping เข้า polygon) → inside → (ping ออก polygon) → outside — ดู {{ref:policy:geofence-debounce-policy}} สำหรับเงื่อนไขกันสัญญาณ GPS กระตุก",
      relatedNotes:
        "subscribe `ping.received` จาก {{ref:module:gps-ingest}} โดยตรงผ่าน queue (ดู {{ref:arch:queue}}) ไม่ query ตรงเข้า database ของ gps-ingest — {{ref:module:trip-aggregator}} เป็นคนเดียวที่ query ข้าม event ของโมดูลนี้กับ ping ดิบพร้อมกัน",
      internals: {
        constants: [
          { name: "GEOFENCE_DEBOUNCE_PINGS", value: "3" },
          { name: "MAX_ZONES_PER_CUSTOMER", value: "500" },
        ],
        typeSnippet:
          "interface GeofenceEvalResult {\n  deviceId: string;\n  entered: string[];\n  exited: string[];\n  evaluatedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการกันสัญญาณกระตุกที่ {{ref:policy:geofence-debounce-policy}}",
      },
    },
    {
      slug: "route-optimizer",
      name: "route-optimizer",
      tags: ["routing", "module"],
      description:
        "คำนวณเส้นทางที่ดีที่สุดสำหรับรถแต่ละคันตามจุดส่งของที่ต้องแวะ โดยพิจารณาสภาพการจราจรและข้อจำกัดถนน (เช่น น้ำหนักรถ, ถนนปิด) ทำงานเป็น on-demand calculation ไม่ได้อยู่บน critical path ของการรับ ping เพื่อไม่ให้การคำนวณเส้นทางที่หนักไปถ่วงความเร็วการรับสัญญาณ",
      functions: [
        { sig: "computeRoute(vehicleId: string, stops: Stop[]): Promise<RoutePlan>", desc: "คำนวณลำดับการแวะจุดส่งของที่ใช้เวลารวมน้อยที่สุด" },
        { sig: "recomputeOnDeviation(vehicleId: string, currentPosition: PositionSnapshot): Promise<RoutePlan>", desc: "คำนวณเส้นทางใหม่เมื่อรถออกนอกเส้นทางเดิมเกินระยะที่ยอมรับได้" },
        { sig: "reportRoadClosure(segmentId: string, reason: string): Promise<void>", desc: "บันทึกถนนปิดชั่วคราว ใช้กันการคำนวณเส้นทางผ่านจุดนั้นซ้ำ" },
      ],
      relatedNotes:
        "ไม่รู้จักสถานะอุปกรณ์เลย (ดู {{ref:arch:boundaries}}) — เมื่อ {{ref:module:geofence-engine}} รายงานว่ารถออกนอกเขตเส้นทางที่กำหนด จะเป็น {{ref:module:alert-dispatcher}} ที่ตัดสินใจว่าจะเรียก `recomputeOnDeviation` หรือไม่ แทนที่จะให้ route-optimizer ฟัง geofence event โดยตรง เพื่อคุม fan-in ของ event ให้อยู่ที่ dispatcher จุดเดียว",
    },
    {
      slug: "device-provisioning",
      name: "device-provisioning",
      tags: ["provisioning", "module", "core"],
      description:
        "จัดการวงจรชีวิตของอุปกรณ์ GPS tracker ตั้งแต่ลงทะเบียนอุปกรณ์ใหม่ ผูกกับยานพาหนะ ไปจนถึงปลดการใช้งานเมื่อยกเลิกสัญญาหรือฮาร์ดแวร์เสีย เป็น service เดียวที่มีสิทธิ์เขียนตาราง `devices` สถานะ lifecycle ได้ — {{ref:module:gps-ingest}} อ่านอย่างเดียวเพื่อรู้ว่าอุปกรณ์ไหน active",
      functions: [
        { sig: "activateDevice(deviceId: string, vehicleId: string, customerId: string): Promise<void>", desc: "ผูกอุปกรณ์กับยานพาหนะและเริ่มรับ ping" },
        { sig: "deactivateDevice(deviceId: string, reason: string): Promise<void>", desc: "ปลดอุปกรณ์ออกจากการใช้งาน ไม่ลบประวัติ ping เดิม" },
        { sig: "reassignDevice(deviceId: string, newVehicleId: string): Promise<void>", desc: "ย้ายอุปกรณ์ไปติดรถคันอื่น เช่น ตอนเปลี่ยนรถซ่อมบำรุง" },
      ],
      stateFlow: "provisioned → active → (ปลดการใช้งาน) → deactivated — ดู {{ref:policy:device-reassignment-policy}} สำหรับเงื่อนไขการย้ายอุปกรณ์ข้ามรถ",
      relatedNotes:
        "{{ref:module:gps-ingest}} เช็คสถานะ active ก่อนรับ ping ทุกครั้งแต่ device-provisioning ไม่รู้จัก concept ของ ping หรือตำแหน่งเลย — รู้แค่ว่าอุปกรณ์ไหนควรรับสัญญาณได้ เป็นการตัดสินใจ lifecycle ทั้งหมดอยู่ที่ service นี้",
      internals: {
        constants: [
          { name: "DEVICE_ID_PREFIX", value: "\"TRK-\"" },
          { name: "REASSIGNMENT_COOLDOWN_HOURS", value: "1" },
        ],
        typeSnippet:
          "interface DeviceRecord {\n  deviceId: string;\n  vehicleId: string | null;\n  customerId: string;\n  status: \"provisioned\" | \"active\" | \"deactivated\";\n  activatedAt: string | null;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการย้ายอุปกรณ์ข้ามรถที่ {{ref:policy:device-reassignment-policy}}",
      },
    },
    {
      slug: "alert-dispatcher",
      name: "alert-dispatcher",
      tags: ["alerting", "module"],
      description:
        "ตัดสินใจว่า event ไหน (geofence, offline, ความเร็วเกิน) ควรแจ้งเตือนลูกค้าทันทีผ่าน push notification หรือ WebSocket และ event ไหนแค่บันทึกไว้ดูย้อนหลัง แยกออกมาเพราะกฎการแจ้งเตือนแตกต่างกันมากตามลูกค้าแต่ละราย (บางรายอยากรู้ทุกอย่าง บางรายอยากรู้เฉพาะเหตุการณ์วิกฤต)",
      functions: [
        { sig: "evaluateAlertRule(customerId: string, event: FleetEvent): Promise<AlertDecision>", desc: "ตัดสินตามกฎที่ลูกค้าตั้งไว้ว่า event นี้ควรแจ้งเตือนหรือไม่" },
        { sig: "dispatchAlert(customerId: string, alert: AlertPayload): Promise<void>", desc: "ส่งแจ้งเตือนจริงผ่าน channel ที่ลูกค้าเลือก (push/SMS/WebSocket)" },
        { sig: "suppressAlert(alertRuleId: string, until: string): Promise<void>", desc: "ปิดการแจ้งเตือนชั่วคราวสำหรับกฎที่ระบุ เช่น ระหว่าง maintenance window" },
      ],
      relatedNotes:
        "subscribe event เกือบทุกประเภทจาก queue กลาง (ดู {{ref:arch:queue}}) — เป็น subscriber ปลายทางเสมอ ไม่ publish event กลับเข้า queue หลักเพื่อไม่ให้เกิด event loop ดู {{ref:policy:alert-throttling-policy}} สำหรับการกัน alert ถี่เกินไป",
    },
    {
      slug: "trip-aggregator",
      name: "trip-aggregator",
      tags: ["aggregation", "module", "core"],
      description:
        "รวบรวม ping ดิบและ geofence event ของยานพาหนะแต่ละคันมาประกอบเป็น \"ทริป\" (จุดเริ่ม, จุดจบ, ระยะทาง, ระยะเวลา) ใช้เป็นข้อมูลตั้งต้นสำหรับการออกบิลลูกค้าและรายงานสรุป เป็น service เดียวที่ query ข้าม {{ref:module:gps-ingest}} และ {{ref:module:geofence-engine}} พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู {{ref:arch:boundaries}})",
      functions: [
        { sig: "closeTrip(vehicleId: string, endedAt: string): Promise<Trip>", desc: "ปิดทริปปัจจุบันและคำนวณระยะทาง/ระยะเวลารวม" },
        { sig: "computeMileage(vehicleId: string, tripId: string): Promise<number>", desc: "คำนวณระยะทางจากลำดับ ping ดิบด้วยสูตร haversine สะสมทีละคู่จุด" },
        { sig: "reconcileWithOdometer(tripId: string, odometerReading: number): Promise<ReconcileResult>", desc: "เทียบระยะทางที่คำนวณได้กับเลขไมล์จริงจากรถ" },
      ],
      stateFlow: "in_progress → closed | flagged_for_review (เมื่อ reconcile กับ odometer ต่างกันเกินเกณฑ์)",
      relatedNotes:
        "เป็น service เดียวที่รู้จักทั้ง ping ดิบและ geofence event พร้อมกัน — {{ref:module:route-optimizer}} ไม่เกี่ยวข้องกับทริปที่ปิดไปแล้วเลย เพราะ route-optimizer สนใจแค่เส้นทางที่กำลังจะเกิดขึ้น ดู {{ref:policy:trip-boundary-policy}} สำหรับเกณฑ์ตัดสินว่าอะไรคือจุดเริ่ม/จบทริป",
    },
  ],
  envVarGroups: [
    {
      service: "gps-ingest-service",
      vars: [
        { name: "INGEST_UDP_PORT", example: "9100", note: "พอร์ตที่อุปกรณ์ยิง ping ดิบเข้ามา" },
        { name: "DEVICE_OFFLINE_AFTER_MISSED_PINGS", example: "10", note: "ดู {{ref:policy:device-offline-detection-policy}}" },
      ],
    },
    {
      service: "geofence-engine-service",
      vars: [
        { name: "GEOFENCE_DEBOUNCE_PINGS", example: "3", note: "ดู {{ref:policy:geofence-debounce-policy}}" },
        { name: "GEOFENCE_DB_URL", example: "postgres://geofence-db.internal:5432/geofence", note: "secret ห้าม log" },
      ],
    },
    {
      service: "trip-aggregator-service",
      vars: [
        { name: "TRIP_IDLE_CLOSE_THRESHOLD_MIN", example: "20", note: "ดู {{ref:policy:trip-boundary-policy}}" },
        { name: "MILEAGE_DISCREPANCY_THRESHOLD_PCT", example: "5", note: "เกินนี้ flag ให้คนตรวจสอบ" },
      ],
    },
    {
      service: "alert-dispatcher-service",
      vars: [
        { name: "ALERT_THROTTLE_WINDOW_SEC", example: "300", note: "ดู {{ref:policy:alert-throttling-policy}}" },
        { name: "ALERT_PUSH_PROVIDER_KEY", example: "***", note: "secret ห้าม log" },
      ],
    },
  ],
  policies: [
    {
      slug: "device-offline-detection-policy",
      title: "นโยบายตรวจจับอุปกรณ์ Offline",
      tags: ["ingest", "offline", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:gps-ingest}} ไม่ได้รับ ping จากอุปกรณ์ใดเกิน `DEVICE_OFFLINE_AFTER_MISSED_PINGS` รอบติดต่อกัน (คำนวณจากช่วงเวลาที่อุปกรณ์รุ่นนั้นควรส่ง ping ตามปกติ) จะถูก mark เป็น `offline` อัตโนมัติและ publish event `device.offline`",
        "อุปกรณ์แต่ละรุ่นมีช่วงเวลาส่ง ping ไม่เท่ากัน (บางรุ่นทุก 10 วินาที บางรุ่นทุก 30 วินาที) threshold จึงคำนวณเป็นสัดส่วนของ interval ที่ตั้งไว้ต่ออุปกรณ์ ไม่ใช่ตัวเลขวินาทีคงที่ตัวเดียวทั้งระบบ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่ออุปกรณ์อยู่ในพื้นที่อับสัญญาณที่รู้จัก",
        tags: ["ingest", "offline", "edge-case"],
        body: [
          "ถ้าตำแหน่งล่าสุดของอุปกรณ์ก่อนขาดหายอยู่ในโซนที่ระบบรู้จักว่าอับสัญญาณ (เช่น อุโมงค์ยาว หรือพื้นที่ภูเขาที่ไม่มีสัญญาณเซลลูลาร์) ระบบจะขยาย threshold เป็น 3 เท่าก่อน mark offline เพื่อไม่ให้แจ้งเตือนเท็จรัว ๆ ทุกครั้งที่รถผ่านจุดเดิม",
          "แต่ถ้าอุปกรณ์ขาดหายนานเกิน 2 ชั่วโมงแม้จะอยู่ในโซนอับสัญญาณที่รู้จัก ก็ยัง mark เป็น offline เสมอ เพราะอับสัญญาณจริงไม่ควรนานขนาดนั้น น่าจะเป็นปัญหาฮาร์ดแวร์มากกว่า",
        ],
      },
    },
    {
      slug: "geofence-debounce-policy",
      title: "นโยบายกันสัญญาณ GPS กระตุกที่ขอบโซน",
      tags: ["geofence", "debounce", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อรถวิ่งใกล้ขอบเขตของโซน สัญญาณ GPS ที่คลาดเคลื่อนไม่กี่เมตรอาจทำให้ตำแหน่งดูเหมือนเข้า-ออกโซนสลับกันถี่ๆ ทั้งที่รถจอดอยู่จุดเดิม {{ref:module:geofence-engine}} จึงไม่ publish event เข้า/ออกทันทีที่เห็น ping เดียวข้ามขอบเขต",
        "ต้องเห็น ping ที่อยู่ฝั่งเดียวกันของขอบเขตติดต่อกัน `GEOFENCE_DEBOUNCE_PINGS` ครั้งก่อนถึงจะยืนยัน event เข้า/ออกจริง เพื่อกรอง noise ของสัญญาณดาวเทียมที่คลาดเคลื่อนออกไป",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับโซนห้ามเข้าความสำคัญสูง",
        tags: ["geofence", "edge-case"],
        body: [
          "โซนที่ลูกค้าตั้งค่าเป็น `restricted` (เช่น เขตห้ามรถบรรทุกสารเคมีเข้า) ไม่ใช้ debounce ตามปกติ — ping เดียวที่เข้าโซนก็ trigger event ทันที เพราะความเสี่ยงจากการแจ้งเตือนช้าสูงกว่าความรำคาญจาก false positive ไม่กี่ครั้ง",
          "ในทางกลับกัน event ออกจากโซน `restricted` ยังคงใช้ debounce ตามปกติ เพื่อไม่ให้ปิดการแจ้งเตือนเร็วเกินไปทั้งที่รถอาจแค่ขยับออกไปติดขอบเขตแล้ววนกลับเข้ามาใหม่",
        ],
      },
    },
    {
      slug: "trip-boundary-policy",
      title: "นโยบายกำหนดจุดเริ่ม/จบทริป",
      tags: ["aggregation", "trip", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:trip-aggregator}} ถือว่าทริปใหม่เริ่มเมื่อรถเริ่มเคลื่อนที่ (ความเร็ว > 5 กม./ชม.) หลังจากจอดนิ่งต่อเนื่องเกิน `TRIP_IDLE_CLOSE_THRESHOLD_MIN` นาที และถือว่าทริปจบเมื่อรถจอดนิ่งครบเวลาเดียวกันอีกครั้ง",
        "การเลือกใช้ \"จอดนิ่งครบเวลา\" แทนการดูแค่ \"ความเร็วเป็นศูนย์\" เพราะรถที่ติดไฟแดงหรือจอดรอส่งของสั้นๆ ไม่ควรถูกตัดเป็นทริปแยก จะทำให้รายงานทริปกระจัดกระจายเกินจริง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับรถที่ปิดเครื่องยนต์ระหว่างส่งของ",
        tags: ["aggregation", "edge-case"],
        body: [
          "รถบางประเภทดับเครื่องยนต์ขณะแวะส่งของแต่ละจุด (ไม่ idle ทิ้งไว้) ทำให้อุปกรณ์ GPS ที่ต่อไฟจากแบตรถอาจหยุดส่ง ping ชั่วคราว กรณีนี้ trip-aggregator จะไม่ปิดทริปทันทีที่ ping หายไป แต่รอจนกว่าจะครบ `TRIP_IDLE_CLOSE_THRESHOLD_MIN` นับจาก ping สุดท้ายที่ได้รับจริง ไม่ใช่นับจากเวลาที่ควรได้รับ ping",
          "ถ้ารถกลับมาส่ง ping ภายในเวลาไม่เกิน `TRIP_IDLE_CLOSE_THRESHOLD_MIN` หลังดับเครื่อง ระบบจะถือว่าเป็นทริปเดียวกันต่อเนื่อง ไม่ตัดแยกเป็นสองทริป",
        ],
      },
    },
    {
      slug: "alert-throttling-policy",
      title: "นโยบาย Throttle การแจ้งเตือน",
      tags: ["alerting", "throttling", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:alert-dispatcher}} จำกัดจำนวนแจ้งเตือนประเภทเดียวกันสำหรับอุปกรณ์เดียวกันไม่ให้เกิน 1 ครั้งต่อ `ALERT_THROTTLE_WINDOW_SEC` เพื่อไม่ให้ลูกค้าโดนแจ้งเตือนถี่ยิบจากเหตุการณ์ที่เกิดซ้ำในช่วงเวลาสั้นๆ (เช่น เข้า-ออกโซนติดกันจากการวิ่งเลียบขอบเขต)",
        "การ throttle นับแยกตามคู่ (deviceId, alertType) เสมอ ไม่ throttle ข้ามประเภท เพื่อไม่ให้แจ้งเตือนความเร็วเกินไปบัง alert เรื่อง offline ที่สำคัญกว่า",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับแจ้งเตือนโซน Restricted",
        tags: ["alerting", "edge-case"],
        body: [
          "แจ้งเตือนที่มาจากการเข้าโซน `restricted` (ดู {{ref:policy:geofence-debounce-policy}}) ไม่ถูก throttle เลย ทุกครั้งที่ event เข้าโซนนี้เกิดขึ้นจริงจะส่งแจ้งเตือนเสมอ แม้จะเกิดถี่กว่า `ALERT_THROTTLE_WINDOW_SEC` เพราะแต่ละครั้งถือเป็นเหตุการณ์ที่ต้องมีคนรับทราบแยกกัน",
          "ระหว่าง maintenance window ที่ประกาศล่วงหน้า ทีมสามารถ `suppressAlert` ปิดแจ้งเตือนบางกฎชั่วคราวได้ แม้จะเป็นกฎที่ปกติไม่ถูก throttle ก็ตาม เพื่อรองรับการทดสอบระบบโดยไม่ต้องรบกวนลูกค้า",
        ],
      },
    },
    {
      slug: "route-deviation-alert-policy",
      title: "นโยบายแจ้งเตือนเมื่อรถเบี่ยงเบนจากเส้นทางที่วางแผนไว้",
      tags: ["routing", "alerting", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อตำแหน่งจริงของรถห่างจากเส้นทางที่ {{ref:module:route-optimizer}} วางแผนไว้เกิน 500 เมตรต่อเนื่องเกิน 3 ping ระบบจะถือว่า \"เบี่ยงเบน\" และให้ {{ref:module:alert-dispatcher}} ตัดสินใจว่าจะแจ้งเตือนลูกค้าหรือไม่ตามกฎการแจ้งเตือนของลูกค้ารายนั้น",
        "การเบี่ยงเบนไม่ได้แปลว่าผิดเสมอไป — คนขับอาจเลี่ยงรถติดหรือถนนปิดเอง ระบบจึงแค่บันทึกและแจ้งเตือนแบบ informational ไม่ block การทำงานใดๆ ของคนขับ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับเส้นทางที่มีจุดส่งของเรียงติดกันในระยะสั้น",
        tags: ["routing", "edge-case"],
        body: [
          "เส้นทางที่มีจุดส่งของหลายจุดเรียงกันในระยะไม่เกิน 500 เมตร (เช่น ส่งของหลายบ้านในซอยเดียวกัน) จะไม่นับระยะ 500 เมตรตามเกณฑ์ปกติ เพราะคนขับมักเดินเท้าหรือขับวนสั้นๆ ระหว่างจุดซึ่งดูเหมือนเบี่ยงเบนทั้งที่เป็นการทำงานปกติ ระบบจะใช้เกณฑ์ระยะทางสัมพัทธ์กับความหนาแน่นของจุดส่งของในโซนนั้นแทน",
          "ถ้าการเบี่ยงเบนเกิดขึ้นพร้อมกับความเร็วที่สูงผิดปกติ (บ่งชี้ว่าอาจไม่ใช่การเบี่ยงเบนเพื่อส่งของ) ระบบจะไม่เข้าเงื่อนไขยกเว้นนี้ และกลับไปใช้เกณฑ์ 500 เมตรตามปกติทันที",
        ],
      },
    },
    {
      slug: "device-reassignment-policy",
      title: "นโยบายการย้ายอุปกรณ์ข้ามยานพาหนะ",
      tags: ["provisioning", "policy"],
      isPrimary: true,
      intro: [
        "อุปกรณ์สามารถย้ายจากรถคันหนึ่งไปติดอีกคันได้ผ่าน `reassignDevice` แต่ต้องปิดทริปที่กำลัง in_progress ของรถคันเดิมก่อนเสมอ ไม่งั้นข้อมูลทริปจะปนกันระหว่างสองคัน",
        "ประวัติ ping และทริปเก่าที่ผูกกับ deviceId ยังคงอยู่ ไม่ถูกย้ายตามไปที่รถคันใหม่ — รายงานย้อนหลังจึงต้อง join กับตาราง `device_activation_log` เพื่อดูว่าช่วงเวลาไหนอุปกรณ์ตัวนี้ผูกกับรถคันไหน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อย้ายอุปกรณ์ระหว่างรถกำลังมีทริปค้าง",
        tags: ["provisioning", "edge-case"],
        body: [
          "ถ้ารถคันเดิมมีทริปที่ยัง `in_progress` อยู่ตอนขอ `reassignDevice` ระบบจะไม่ปฏิเสธ request ทันที แต่จะบังคับปิดทริปนั้นด้วยตำแหน่งล่าสุดที่ทราบก่อนเสมอ (เหมือนเป็นการปิดทริปแบบ force-close) แทนที่จะปล่อยให้ทริปค้างสถานะ in_progress ตลอดไปโดยไม่มีอุปกรณ์รายงานตำแหน่งต่อ",
          "อุปกรณ์ที่เพิ่งถูก reassign จะเข้าเงื่อนไข `REASSIGNMENT_COOLDOWN_HOURS` ก่อนถึงจะย้ายซ้ำได้อีกครั้ง เพื่อป้องกันความผิดพลาดจากการกดย้ายซ้ำเร็วเกินไปโดยไม่ตั้งใจของทีม support",
        ],
      },
    },
    {
      slug: "fuel-anomaly-policy",
      title: "นโยบายตรวจจับความผิดปกติของระดับเชื้อเพลิง",
      tags: ["fuel", "policy"],
      isPrimary: false,
      intro: [
        "ถ้าระดับเชื้อเพลิงลดลงเกิน 15% ภายในเวลาไม่ถึง 5 นาทีโดยที่รถไม่ได้เข้าจุดเติมน้ำมันที่รู้จัก ระบบจะ flag เป็นเหตุการณ์น่าสงสัย (อาจเป็นการลักลอบสูบน้ำมัน) แล้วแจ้งทีม fleet-ops แทนที่จะแจ้งลูกค้าปลายทางตรงๆ",
        "การ flag นี้ไม่ใช่การยืนยันว่าเกิดเหตุจริง — เซ็นเซอร์วัดน้ำมันมี noise ตามธรรมชาติเวลารถเข้าโค้งแรงหรือวิ่งทางลาดชัน ทีม fleet-ops ต้องดู pattern ประกอบก่อนแจ้งลูกค้า",
      ],
    },
    {
      slug: "speeding-alert-policy",
      title: "นโยบายแจ้งเตือนความเร็วเกินกำหนด",
      tags: ["safety", "policy"],
      isPrimary: false,
      intro: [
        "แต่ละโซนสามารถกำหนดขีดจำกัดความเร็วของตัวเองได้ ถ้าไม่กำหนดจะใช้ค่า default ตามประเภทถนน (ทางหลวง 90 กม./ชม., ในเมือง 60 กม./ชม.) ระบบเทียบความเร็วจาก ping ล่าสุดกับขีดจำกัดที่ใช้ ณ ตำแหน่งนั้น",
        "การแจ้งเตือนความเร็วเกินไม่ throttle ตาม {{ref:policy:alert-throttling-policy}} เหมือนแจ้งเตือนอื่น แต่ใช้ debounce แยกต่างหาก (ต้องเกินติดต่อกันอย่างน้อย 30 วินาที) เพื่อไม่ให้ความเร็วกระตุกจาก GPS noise ทำให้แจ้งเตือนเท็จ",
      ],
    },
    {
      slug: "route-recompute-cooldown-policy",
      title: "นโยบาย Cooldown การคำนวณเส้นทางใหม่",
      tags: ["routing", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:route-optimizer}} จะไม่ `recomputeOnDeviation` ซ้ำสำหรับรถคันเดียวกันถี่กว่าทุก 2 นาที แม้จะออกนอกเส้นทางต่อเนื่องก็ตาม เพื่อกันไม่ให้การคำนวณเส้นทางใหม่วนถี่เกินจนคนขับสับสนกับคำแนะนำที่เปลี่ยนตลอดเวลา",
        "ระหว่างช่วง cooldown ระบบยังคงติดตามระยะเบี่ยงเบนสะสมไว้ ถ้าเบี่ยงเบนเกิน 5 กิโลเมตรจากเส้นทางเดิม จะ bypass cooldown แล้วคำนวณใหม่ทันทีเพราะถือว่าเส้นทางเดิมใช้ไม่ได้แล้วจริงๆ",
      ],
    },
    {
      slug: "device-firmware-rollout-policy",
      title: "นโยบายการ Rollout Firmware อุปกรณ์ GPS",
      tags: ["provisioning", "firmware", "policy"],
      isPrimary: false,
      intro: [
        "firmware ใหม่ต้อง rollout แบบ staged เสมอ เริ่มจากอุปกรณ์ไม่เกิน 50 ตัวในกลุ่มลูกค้าที่สมัครใจทดสอบก่อน สังเกตอาการอย่างน้อย 48 ชั่วโมงก่อนขยายไปทั้งฟลีท",
        "ห้าม rollout firmware ระหว่างช่วง rush window โดยเด็ดขาด เพราะอุปกรณ์ที่กำลังอัปเดตจะไม่ส่ง ping ชั่วคราว ถ้าเกิดตอนช่วงที่มีรถวิ่งพร้อมกันเยอะจะกระทบ dashboard ลูกค้าจำนวนมากพร้อมกัน",
      ],
    },
    {
      slug: "mileage-dispute-policy",
      title: "นโยบายจัดการข้อโต้แย้งเรื่องระยะทาง",
      tags: ["aggregation", "billing", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อลูกค้าโต้แย้งว่าระยะทางที่ระบบคำนวณไม่ตรงกับเลขไมล์จริงของรถ ทีม billing จะดึงลำดับ ping ดิบทั้งหมดของทริปที่ถูกโต้แย้งมาตรวจสอบด้วยมือ ไม่ใช้ตัวเลขจาก `computeMileage` แก้ไขทันทีโดยไม่ตรวจสอบ",
        "ถ้าตรวจแล้วพบว่าค่าที่คำนวณผิดจริงจาก bug ของระบบ (ไม่ใช่แค่คลาดเคลื่อนจากความแม่นยำ GPS ปกติ) จะปรับบิลย้อนหลังให้ลูกค้าตามระยะทางที่คำนวณใหม่ ไม่ใช่ตามเลขไมล์รถที่ลูกค้าแจ้งเองเพราะอาจมีความคลาดเคลื่อนเช่นกัน",
      ],
    },
  ],
  incidents: [
    {
      slug: "downtown-signal-drift-false-geofence",
      title: "สัญญาณ GPS เพี้ยนกลางเมืองทำแจ้งเตือนเข้าโซนเท็จรัว",
      tags: ["geofence", "signal"],
      summary:
        "ลูกค้ารายใหญ่รายหนึ่งแจ้งว่าได้รับแจ้งเตือน \"รถเข้าเขตห้ามเข้า\" ผิดพลาดกว่า 40 ครั้งในบ่ายวันเดียว ทั้งที่รถจอดอยู่ที่ลานจอดปกติในย่านตึกสูงใจกลางเมือง",
      investigation:
        "ตรวจ {{ref:module:geofence-engine}} พบว่า ping ของรถคันนั้นกระโดดไปมาระหว่างสองตำแหน่งที่ห่างกันกว่า 300 เมตรสลับกันทุก 10-15 วินาที ตรงกับช่วงเวลาที่แจ้งเตือนเข้าออกโซน",
      cause:
        "ย่านตึกสูงทำให้สัญญาณ GPS สะท้อนจากผนังอาคาร (multipath effect) ทำให้พิกัดที่คำนวณได้กระโดดไปมา และ `GEOFENCE_DEBOUNCE_PINGS` ที่ตั้งไว้ 3 ครั้งไม่พอสำหรับความถี่ของสัญญาณกระตุกในย่านนี้โดยเฉพาะ",
      resolution:
        "เพิ่ม debounce เฉพาะโซนที่อยู่ในพื้นที่ตึกสูงหนาแน่น (จัดกลุ่ม `urban_canyon`) เป็น 6 ping แทน 3 ping ชั่วคราว แล้วปิดแจ้งเตือนที่ผิดพลาดไปแล้วด้วยมือให้ลูกค้า",
      followup:
        "เสนอให้ debounce ปรับตาม zone density อัตโนมัติแทนค่าคงที่เดียวทั้งระบบ อยู่ระหว่างพิจารณาว่าจะปรับ {{ref:policy:geofence-debounce-policy}} หรือไม่",
    },
    {
      slug: "ota-firmware-bricked-devices",
      title: "อัปเดต Firmware ผ่าน OTA ทำอุปกรณ์ตายยกล็อต",
      tags: ["provisioning", "firmware"],
      summary:
        "หลัง rollout firmware v3.8 ให้อุปกรณ์กลุ่มทดสอบตาม {{ref:policy:device-firmware-rollout-policy}} พบว่าอุปกรณ์ 12 ตัวจาก 50 ตัวหยุดส่ง ping ถาวรและไม่ตอบสนองต่อคำสั่งใดๆ",
      investigation:
        "ตรวจ log การอัปเดตพบว่าอุปกรณ์ที่ตายทั้งหมดเป็นรุ่นฮาร์ดแวร์เก่ารุ่นหนึ่งโดยเฉพาะ (rev C) ซึ่งมีพื้นที่หน่วยความจำ flash น้อยกว่ารุ่นใหม่",
      cause:
        "firmware v3.8 มีขนาดใหญ่ขึ้นจากฟีเจอร์ใหม่ และกระบวนการเขียน flash ระหว่างอัปเดตไม่ได้เผื่อพื้นที่สำรองสำหรับ rollback บนฮาร์ดแวร์ rev C ทำให้ถ้าไฟดับหรือสัญญาณขาดกลางการเขียน อุปกรณ์จะค้างในสถานะเขียนไม่สมบูรณ์และบูตไม่ขึ้น",
      resolution:
        "หยุด rollout ทันที ส่งทีมช่างสนามไปเปลี่ยนอุปกรณ์ 12 ตัวที่ตายด้วยฮาร์ดแวร์สำรอง เพราะกู้คืนผ่าน OTA ไม่ได้แล้ว ต้องเข้าถึงตัวเครื่องจริงเท่านั้น",
      followup:
        "แยก rollout policy ตามรุ่นฮาร์ดแวร์ และห้ามส่ง firmware ที่มีขนาดเกินเกณฑ์ปลอดภัยไปยังรุ่น rev C จนกว่าจะมีกลไก rollback ที่ปลอดภัยกว่านี้",
    },
    {
      slug: "regional-cellular-outage-false-offline",
      title: "สัญญาณมือถือภูมิภาคล่มทำแจ้งเตือน Offline เท็จยกจังหวัด",
      tags: ["ingest", "offline"],
      summary:
        "ผู้ให้บริการเครือข่ายมือถือรายหนึ่งเกิดปัญหาเครือข่ายล่มในภูมิภาคหนึ่งนานประมาณ 50 นาที ทำให้อุปกรณ์กว่า 800 ตัวในพื้นที่นั้นถูก mark เป็น offline พร้อมกัน",
      investigation:
        "ตรวจ {{ref:module:gps-ingest}} พบว่าอุปกรณ์ทั้งหมดที่ offline ใช้ SIM ของผู้ให้บริการรายเดียวกัน และอยู่ในรัศมีเดียวกันทั้งหมด ไม่ใช่ปัญหาฮาร์ดแวร์กระจายสุ่ม",
      cause:
        "ระบบไม่มีการแยกแยะระหว่าง \"อุปกรณ์เสีย\" กับ \"เครือข่ายพาหะล่มเป็นวงกว้าง\" — ตรรกะ offline detection ปฏิบัติกับทุกกรณีการขาดหาย ping เหมือนกันหมดตาม {{ref:policy:device-offline-detection-policy}}",
      resolution:
        "ทีม on-call ยืนยันจาก status page ของผู้ให้บริการเครือข่ายว่าเป็นปัญหาฝั่งเขาจริง แล้วส่งประกาศชี้แจงลูกค้าที่ได้รับผลกระทบ ไม่ต้องแก้ไขอะไรฝั่งระบบเพราะอุปกรณ์กลับมาส่ง ping เองเมื่อเครือข่ายฟื้น",
      followup:
        "เสนอเพิ่ม correlation ระหว่างอุปกรณ์ offline พร้อมกันจำนวนมากในพื้นที่เดียวกันกับ SIM provider เดียวกัน เพื่อแยกแจ้งเตือนเป็น \"network outage สงสัย\" แทน \"device offline\" รายตัว ลดความตื่นตระหนกของทีม support",
    },
    {
      slug: "route-optimizer-infinite-recompute-loop",
      title: "Route-optimizer วนคำนวณเส้นทางใหม่ไม่จบเมื่อถนนปิดไม่มีทางเลี่ยง",
      tags: ["routing", "bug"],
      summary:
        "รถคันหนึ่งค้างอยู่กับที่นานกว่า 20 นาทีขณะที่ dashboard แสดงว่ากำลัง \"คำนวณเส้นทางใหม่\" ตลอดเวลา ไม่เคยได้เส้นทางสรุปออกมาสักที",
      investigation:
        "ตรวจ log {{ref:module:route-optimizer}} พบว่า `recomputeOnDeviation` ถูกเรียกซ้ำต่อเนื่องหลายร้อยครั้ง แต่ละครั้งคำนวณเส้นทางที่ยังผ่านถนนที่ถูก report ปิดอยู่ดี ทำให้เบี่ยงเบนเกิน threshold ทันทีแล้ว trigger คำนวณใหม่อีกรอบเป็นวงวน",
      cause:
        "ถนนที่ปิดเป็นถนนสายเดียวที่เชื่อมไปยังจุดหมายในพื้นที่นั้น ไม่มีเส้นทางเลี่ยงในข้อมูลแผนที่ที่ใช้ อัลกอริทึมไม่มีเงื่อนไขตรวจจับกรณี \"ไม่มีทางเลี่ยงจริง\" จึงพยายามคำนวณเส้นทางที่ดีที่สุดจากตัวเลือกที่มีอยู่ ซึ่งก็คือเส้นทางเดิมที่ผ่านถนนปิดซ้ำไปซ้ำมา",
      resolution:
        "เพิ่ม guard ให้ตรวจสอบก่อนว่าเส้นทางที่คำนวณได้ผ่านถนนที่ report ปิดหรือไม่ ถ้าใช่และไม่มีทางเลี่ยงอื่น ให้หยุด recompute อัตโนมัติแล้วแจ้งคนขับด้วยมือแทนตาม {{ref:policy:route-recompute-cooldown-policy}}",
      followup:
        "เพิ่ม unit test สำหรับ edge case \"ถนนปิดแบบไม่มีทางเลี่ยง\" และพิจารณาเพิ่มขีดจำกัดจำนวนครั้งการ recompute ติดต่อกันสูงสุดในโค้ดโดยตรง ไม่ใช่พึ่งแค่ cooldown เวลา",
    },
    {
      slug: "odometer-mileage-mismatch-dispute",
      title: "ลูกค้าโต้แย้งระยะทางในบิลไม่ตรงกับเลขไมล์รถ",
      tags: ["aggregation", "billing"],
      summary:
        "ลูกค้ารายหนึ่งโต้แย้งว่าบิลรายเดือนคิดระยะทางเกินจริงกว่า 8% เทียบกับเลขไมล์สะสมที่บันทึกเองจากรถทุกคัน",
      investigation:
        "ทีม billing ทำตาม {{ref:policy:mileage-dispute-policy}} ดึง ping ดิบของทริปที่ลูกค้าระบุมาตรวจ พบว่า `computeMileage` นับระยะทางซ้ำช่วงที่รถจอดติดไฟแดงนานๆ เพราะ ping ยังคงขยับเล็กน้อยจาก GPS noise แม้รถไม่ได้เคลื่อนที่จริง",
      cause:
        "สูตร haversine สะสมทีละคู่จุดไม่มีการกรอง noise ของพิกัดตอนรถหยุดนิ่ง ทำให้ทุกการขยับเล็กน้อยของสัญญาณ (คลาดเคลื่อนไม่กี่เมตร) ถูกนับรวมเป็นระยะทางจริงสะสมไปเรื่อยๆ ตลอดทั้งทริป",
      resolution:
        "เพิ่มเงื่อนไขไม่นับระยะทางระหว่างคู่ ping ที่ความเร็วรายงานต่ำกว่า 3 กม./ชม. ทั้งสองจุด แล้วคำนวณ mileage ของทริปที่ถูกโต้แย้งใหม่ ปรับบิลย้อนหลังให้ลูกค้าตามส่วนต่างที่พบจริง",
      followup:
        "รัน `computeMileage` เวอร์ชันแก้ไขย้อนหลังกับทริปในเดือนก่อนหน้าทั้งหมดเพื่อประเมินผลกระทบวงกว้าง และเพิ่ม noise filter นี้เป็นค่า default ถาวรของฟังก์ชัน",
    },
    {
      slug: "driver-score-sensor-calibration-bug",
      title: "คะแนนพฤติกรรมคนขับตกต่ำผิดปกติจากเซ็นเซอร์ไม่ได้ปรับเทียบ",
      tags: ["ingest", "quality"],
      summary:
        "คนขับกลุ่มหนึ่งร้องเรียนว่าคะแนนพฤติกรรมการขับ (driver score) ตกต่ำผิดปกติทั้งที่ขับแบบเดิมมาตลอด โดยเฉพาะเรื่อง \"เบรกกะทันหันบ่อย\"",
      investigation:
        "ตรวจ telemetry ของรถกลุ่มที่ถูกร้องเรียน พบว่าเป็นรถที่เพิ่งเปลี่ยนอุปกรณ์ GPS tracker รุ่นใหม่ทั้งหมด และค่า deceleration ที่รายงานสูงกว่ารถรุ่นเดิมอย่างสม่ำเสมอในทุกสถานการณ์การขับ",
      cause:
        "อุปกรณ์รุ่นใหม่ใช้ accelerometer ต่างจากรุ่นเดิม แต่ทีม provisioning ลืมปรับ calibration offset ตอนติดตั้งให้ตรงกับตำแหน่งติดตั้งจริงบนรถ ทำให้ค่าความเร่ง/หน่วงที่วัดได้เพี้ยนไปในทิศทางเดียวกันทุกครั้ง ไม่ใช่พฤติกรรมคนขับที่เปลี่ยนจริง",
      resolution:
        "ปรับ calibration offset ของอุปกรณ์รุ่นใหม่ทั้งหมดให้ตรงตามสเปคการติดตั้ง แล้วคำนวณคะแนนของช่วงเวลาที่ได้รับผลกระทบใหม่ พร้อมแจ้งคนขับกลุ่มที่ถูกร้องเรียนอย่างเป็นทางการว่าเป็นความผิดพลาดของระบบ",
      followup:
        "เพิ่มขั้นตอนตรวจสอบ calibration เป็นส่วนหนึ่งของกระบวนการติดตั้งอุปกรณ์รุ่นใหม่ทุกครั้งก่อนปล่อยใช้งานจริง ไม่ใช่พึ่งการร้องเรียนจากคนขับเป็นตัวจับปัญหา",
    },
    {
      slug: "trip-aggregator-duplicate-trip-split",
      title: "Trip-aggregator ตัดทริปเดียวเป็นสองทริปผิดพลาดช่วงส่งของหนาแน่น",
      tags: ["aggregation", "bug"],
      summary:
        "ทีม billing สังเกตว่าทริปของรถส่งของบางคันถูกนับเป็นสองทริปแยกกันในวันที่มีจุดส่งของหนาแน่นมาก ทั้งที่ควรเป็นทริปต่อเนื่องเดียว",
      investigation:
        "ตรวจ {{ref:module:trip-aggregator}} พบว่ารถแวะจอดส่งของแต่ละจุดนานเกิน `TRIP_IDLE_CLOSE_THRESHOLD_MIN` เพราะจุดส่งของช่วงนั้นมีคิวรอส่งยาว ทำให้ระบบตัดสินว่าทริปจบแล้วเริ่มทริปใหม่ตาม {{ref:policy:trip-boundary-policy}} ทั้งที่คนขับไม่ได้ตั้งใจจบทริป",
      cause:
        "threshold เวลาจอดนิ่งที่ตั้งไว้คำนวณจากพฤติกรรมการส่งของทั่วไป ไม่ได้เผื่อสถานการณ์พิเศษเช่นช่วงเทศกาลที่จุดส่งของแน่นผิดปกติ จึงตัดทริปเร็วเกินไปกว่าที่ควร",
      resolution:
        "ทีม billing รวมทริปที่ถูกตัดแยกผิดพลาดด้วยมือสำหรับรอบบิลที่ได้รับผลกระทบ แล้วปรับ `TRIP_IDLE_CLOSE_THRESHOLD_MIN` ขึ้นชั่วคราวในช่วงเทศกาลที่ทราบล่วงหน้า",
      followup:
        "เสนอให้ trip-aggregator รับ geofence event ของจุดส่งของที่รู้จักมาช่วยตัดสินใจร่วมกับ threshold เวลา แทนการใช้แค่เวลาจอดนิ่งเพียงอย่างเดียว",
    },
    {
      slug: "alert-dispatcher-websocket-backlog",
      title: "WebSocket channel ของ alert-dispatcher ค้างข้อความสะสมช่วง rush window",
      tags: ["alerting", "performance"],
      summary:
        "ลูกค้าหลายรายรายงานว่าได้รับแจ้งเตือนล่าช้ากว่าเหตุการณ์จริง 5-10 นาทีในช่วง rush window เย็น ทั้งที่ปกติควรเป็นเรียลไทม์",
      investigation:
        "ตรวจ {{ref:module:alert-dispatcher}} พบว่า WebSocket connection pool มีจำนวนไม่พอรองรับ event ที่พุ่งสูงพร้อมกันจากหลายพันอุปกรณ์ ทำให้ข้อความค้างอยู่ใน internal queue ก่อนถูกส่งจริง",
      cause:
        "การประมาณ capacity ของ WebSocket pool ตอนออกแบบครั้งแรกอิงจากปริมาณ event ตอนนั้นซึ่งน้อยกว่าปัจจุบันมาก เพราะจำนวนลูกค้าและอุปกรณ์เติบโตเร็วกว่าที่ประเมินไว้",
      resolution:
        "ขยาย WebSocket connection pool ชั่วคราวด้วยมือระหว่างรอ scale แบบถาวร แล้วติดตาม queue depth ใกล้ชิดจนกว่าจะผ่านช่วง rush window",
      followup:
        "ทบทวน {{ref:deployment:scaling-policy}} ของ alert-dispatcher-service ให้ scale ตาม event throughput จริงแทนค่า fixed capacity เดิม",
    },
    {
      slug: "geofence-zone-overlap-conflicting-alerts",
      title: "โซนซ้อนกันทำแจ้งเตือนขัดแย้งกันเอง",
      tags: ["geofence", "bug"],
      summary:
        "ลูกค้ารายหนึ่งได้รับแจ้งเตือน \"เข้าโซน\" และ \"ออกโซน\" พร้อมกันในเวลาเดียวกันสำหรับรถคันเดียว ทำให้สับสนว่าตกลงรถอยู่ในโซนหรือไม่",
      investigation:
        "ตรวจ {{ref:module:geofence-engine}} พบว่าลูกค้าตั้งค่าโซนสองโซนที่ซ้อนทับกันบางส่วนโดยไม่ตั้งใจ (โซนคลังสินค้ากับโซนพื้นที่บริการที่ครอบคลุมคลังอยู่ด้วย) รถที่วิ่งเข้าพื้นที่ซ้อนทับ trigger event ของทั้งสองโซนพร้อมกันแต่ event หนึ่งเป็น enter อีกอันเป็น exit",
      cause:
        "ระบบไม่มีการเตือนผู้ใช้ตอนสร้างโซนใหม่ว่าซ้อนทับกับโซนเดิมที่มีอยู่แล้ว `registerZone` ยอมรับ polygon ที่ทับซ้อนกันได้โดยไม่มีข้อจำกัดใดๆ",
      resolution:
        "ติดต่อลูกค้าให้ปรับขอบเขตโซนใหม่ไม่ให้ซ้อนทับกัน แล้วยืนยันว่าแจ้งเตือนกลับมาถูกต้องหลังปรับ",
      followup:
        "เพิ่ม warning (ไม่ใช่ block) ตอน `registerZone` เมื่อ polygon ใหม่ซ้อนทับกับโซนเดิมของลูกค้ารายเดียวกัน เพื่อให้ผู้ใช้ตัดสินใจเองว่าตั้งใจซ้อนทับจริงหรือไม่",
    },
    {
      slug: "device-activation-race-duplicate-vehicle-link",
      title: "อุปกรณ์ถูกผูกกับรถสองคันพร้อมกันจาก race condition",
      tags: ["provisioning", "bug"],
      summary:
        "พบว่าอุปกรณ์ตัวหนึ่งมีสถานะผูกกับยานพาหนะสองคันพร้อมกันในระบบ ทำให้ ping ที่เข้ามาไปปรากฏในทั้งสอง dashboard ของลูกค้าคนละราย",
      investigation:
        "ตรวจ log {{ref:module:device-provisioning}} พบว่ามี request เรียก `activateDevice` และ `reassignDevice` สำหรับอุปกรณ์เดียวกันในเวลาไล่เลี่ยกันมากจากทีม support สองคนที่ไม่รู้ว่าอีกฝ่ายกำลังจัดการเคสเดียวกันอยู่",
      cause:
        "การอัปเดตสถานะการผูกอุปกรณ์ไม่ได้ทำแบบ atomic — ช่วงเวลาสั้นๆ ระหว่างอ่านสถานะปัจจุบันกับเขียนสถานะใหม่เปิดโอกาสให้ request คู่ขนานแทรกเข้ามาเขียนทับกันได้",
      resolution:
        "แก้ให้การผูกอุปกรณ์ใช้ conditional update แบบ atomic (update ...where status='provisioned') เหมือนกันทั้งสองฟังก์ชัน แล้วแก้ไขข้อมูลที่ผูกผิดด้วยมือให้ตรงกับความเป็นจริง",
      followup:
        "เพิ่มการแจ้งเตือนภายในทีม support เมื่อมีคนกำลังแก้ไขอุปกรณ์ตัวเดียวกันพร้อมกัน เพื่อลดโอกาสเกิด concurrent request จากคนละคน",
    },
    {
      slug: "fuel-sensor-false-theft-flags-mountain-route",
      title: "เส้นทางภูเขาทำระบบ Flag ขโมยน้ำมันเท็จต่อเนื่อง",
      tags: ["fuel", "false-positive"],
      summary:
        "เส้นทางหนึ่งที่วิ่งผ่านภูเขาชันมีรถถูก flag ว่าน่าสงสัยเรื่องลักลอบสูบน้ำมันเกือบทุกเที่ยว ทั้งที่เป็นเส้นทางประจำที่คนขับคนเดิมวิ่งมาหลายปี",
      investigation:
        "ตรวจ {{ref:policy:fuel-anomaly-policy}} เทียบกับ telemetry จริง พบว่าค่าระดับเชื้อเพลิงที่วัดได้แกว่งแรงตอนรถขึ้น-ลงทางลาดชันต่อเนื่อง เพราะเซ็นเซอร์แบบทุ่นลอยไวต่อมุมเอียงของถังมากกว่าถนนราบ",
      cause:
        "threshold การ flag (ลด 15% ภายใน 5 นาที) ไม่ได้แยกพิจารณาความชันของเส้นทาง ทำให้เส้นทางภูเขาที่มีการแกว่งของเซ็นเซอร์ตามธรรมชาติสูงกว่าปกติถูกตีความผิดเป็นเหตุการณ์น่าสงสัยซ้ำๆ",
      resolution:
        "เพิ่ม whitelist เฉพาะเส้นทางที่ทีม fleet-ops ยืนยันแล้วว่าเป็นเส้นทางภูเขาที่มีความชันสูง ปรับ threshold ให้หลวมขึ้นเฉพาะช่วงที่รถอยู่บนเส้นทางกลุ่มนี้",
      followup:
        "เสนอให้ {{ref:policy:fuel-anomaly-policy}} พิจารณาข้อมูลความชันจากแผนที่ประกอบการตัดสินใจ แทนการดูแค่เปอร์เซ็นต์เชื้อเพลิงที่ลดลงอย่างเดียว",
    },
    {
      slug: "map-data-wrong-speed-limit-false-speeding-alerts",
      title: "ข้อมูลแผนที่กำหนดขีดจำกัดความเร็วผิดทำแจ้งเตือนความเร็วเกินเท็จทั้งเส้นทาง",
      tags: ["safety", "map-data"],
      summary:
        "ลูกค้ารายหนึ่งร้องเรียนว่าคนขับหลายคนถูกแจ้งเตือน \"ขับเร็วเกินกำหนด\" ซ้ำๆ บนถนนสายหนึ่งทั้งที่คนขับยืนยันว่าขับตามป้ายจำกัดความเร็วจริงตลอด",
      investigation:
        "ตรวจ {{ref:policy:speeding-alert-policy}} เทียบกับข้อมูลจริง พบว่าโซนถนนสายนั้นไม่ได้ตั้งค่าขีดจำกัดความเร็วเฉพาะไว้ ระบบจึงใช้ค่า default ตามประเภทถนนซึ่งจัดหมวดถนนสายนี้ผิดเป็น \"ในเมือง\" (60 กม./ชม.) ทั้งที่จริงเป็นทางหลวงที่จำกัดไว้ 90 กม./ชม.",
      cause:
        "ข้อมูลแผนที่ที่นำเข้ามาตอนตั้งค่าระบบครั้งแรกจัดหมวดประเภทถนนผิดสำหรับถนนสายนี้โดยเฉพาะ เนื่องจากเป็นถนนที่เพิ่งขยายจากถนนในเมืองเป็นทางหลวงเมื่อไม่นานมานี้ แต่ผู้ให้บริการข้อมูลแผนที่ยังไม่ได้อัปเดตหมวดหมู่ตาม",
      resolution:
        "ตั้งค่าขีดจำกัดความเร็วเฉพาะสำหรับโซนถนนสายนี้ตรงๆ แทนการพึ่งค่า default ตามหมวดถนน แล้วลบแจ้งเตือนที่ผิดพลาดออกจากประวัติของคนขับที่ได้รับผลกระทบ",
      followup:
        "เสนอให้ทีม fleet-ops ตรวจสอบความถูกต้องของหมวดหมู่ถนนกับผู้ให้บริการแผนที่เป็นระยะ แทนการเชื่อข้อมูลนำเข้าเริ่มต้นตลอดไปโดยไม่ทวนซ้ำ",
    },
    {
      slug: "provisioning-orphaned-active-device-after-contract-end",
      title: "อุปกรณ์ยังคง Active ต่อหลังลูกค้ายกเลิกสัญญา",
      tags: ["provisioning", "billing"],
      summary:
        "ทีม billing พบว่ามีอุปกรณ์ 6 ตัวยังคงส่ง ping และถูกคิดค่าบริการต่อเนื่องแม้ลูกค้าจะยกเลิกสัญญาไปแล้วกว่าสองเดือน",
      investigation:
        "ตรวจ {{ref:module:device-provisioning}} พบว่าขั้นตอนยกเลิกสัญญาของลูกค้ารายนี้ทำผ่านระบบ billing ภายนอกเพียงอย่างเดียว ไม่มีการเรียก `deactivateDevice` มายังฝั่ง TrackGrid เลย",
      cause:
        "ระบบ billing ภายนอกและ device-provisioning ไม่ได้เชื่อมกันอัตโนมัติ การปิดใช้งานอุปกรณ์ตอนยกเลิกสัญญาเป็นขั้นตอนที่ต้องมีคนกดปิดด้วยมืออีกระบบหนึ่ง แล้วมีคนลืมทำในเคสนี้",
      resolution:
        "ปิดการใช้งานอุปกรณ์ทั้ง 6 ตัวด้วยมือทันที แล้วคืนเงินค่าบริการส่วนที่คิดเกินให้ลูกค้าตามช่วงเวลาที่ยกเลิกสัญญาจริง",
      followup:
        "เสนอเชื่อม webhook จากระบบ billing ภายนอกมาเรียก `deactivateDevice` อัตโนมัติเมื่อสัญญาสิ้นสุด แทนการพึ่งขั้นตอนคนทำด้วยมือ",
    },
    {
      slug: "geofence-engine-zone-cache-stale-after-edit",
      title: "แก้ไขขอบเขตโซนแล้วระบบยังใช้ Polygon เก่าประเมินต่อ",
      tags: ["geofence", "cache"],
      summary:
        "ลูกค้าปรับขอบเขตโซนคลังสินค้าให้กว้างขึ้นเพื่อรองรับลานจอดใหม่ แต่รถที่เข้าไปจอดในพื้นที่ที่เพิ่งขยายยังคงไม่ trigger event เข้าโซนอยู่ดีเกือบชั่วโมงหลังแก้ไข",
      investigation:
        "ตรวจ {{ref:module:geofence-engine}} พบว่า `listActiveZonesNear` ใช้ cache ผลลัพธ์ตามพิกัดไว้เพื่อลดจำนวน polygon ที่ต้องเทียบทุกครั้ง แต่ cache ไม่ถูก invalidate ตอน `registerZone` ถูกเรียกแก้ไข polygon เดิม",
      cause:
        "cache ออกแบบมาสำหรับกรณีโซนใหม่ที่ยังไม่เคยมีมาก่อนเท่านั้น ทีมไม่ได้คิดถึงกรณีแก้ไข polygon ของโซนที่มีอยู่แล้วตอนออกแบบ cache invalidation ตั้งแต่แรก",
      resolution:
        "เพิ่ม cache invalidation ให้ครอบคลุมกรณีแก้ไขโซนเดิมด้วย ไม่ใช่แค่กรณีสร้างใหม่ แล้ว flush cache ที่ค้างด้วยมือสำหรับโซนที่ได้รับผลกระทบทันที",
      followup:
        "ทบทวน cache ทุกจุดใน geofence-engine ว่ามีกรณี \"แก้ไขของเดิม\" ที่ยังไม่ได้ invalidate ครบหรือไม่ ไม่ใช่แค่จุดนี้จุดเดียว",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/TRK-118-geofence-debounce-tuning`, `fix/TRK-203-route-recompute-loop`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(geofence-engine): กัน cache ค้างตอนแก้ไขโซนเดิม`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้สถานะการผูกอุปกรณ์หรือทริปต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:device-activation-race-duplicate-vehicle-link}}) และการเปลี่ยนค่า threshold ที่กระทบการแจ้งเตือนลูกค้าต้องมีคนที่สองยืนยันก่อน merge" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `ingestPing`, `evaluatePing` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ทางกายภาพ", body: "`deviceId` รูปแบบ `TRK-<6 หลัก>`, `vehicleId` รูปแบบ `VEH-<6 หลัก>` ต้องไม่ใช้ deviceId แทน vehicleId ในโค้ดแม้ตอนที่อุปกรณ์ผูกกับรถแบบ 1 ต่อ 1 ก็ตาม เพราะการผูกเปลี่ยนได้ตาม {{ref:policy:device-reassignment-policy}}" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ ping ต้องมี `deviceId` และ `pingId` เสมอ เพื่อไล่ log ข้าม service ได้ (gps-ingest → geofence-engine → trip-aggregator) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "อุปกรณ์ที่ถูก mark `offline` log เป็น `warn` เสมอ ส่วน `device.offline` ที่ตามมาด้วย reactivation ภายใน 1 นาที (สงสัยว่าเป็น GPS noise ไม่ใช่ offline จริง) log แยกเป็น `info` เพื่อไม่ให้ log วิกฤตจริงถูกกลบ" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`TRK_<DOMAIN>_<REASON>` เช่น `TRK_INGEST_INVALID_PAYLOAD`, `TRK_GEOFENCE_ZONE_NOT_FOUND` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`TRK_DEVICE_OFFLINE`, `TRK_TRIP_FLAGGED_FOR_REVIEW`, `TRK_ROUTE_NO_ALTERNATIVE` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "simulation"],
      sections: [
        { heading: "Replay test ด้วยข้อมูลจริง", body: "logic ที่ประมวลผลตำแหน่งต้องผ่าน replay test ด้วยชุด ping จริงที่เคยเกิดปัญหามาก่อนเสมอ — บทเรียนจาก {{ref:incident:downtown-signal-drift-false-geofence}} คือ synthetic test data ที่สร้างพิกัดสวยเกินจริงไม่เจอ noise pattern แบบที่เกิดในสถานที่จริง" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะสถานะการผูกอุปกรณ์กับยานพาหนะต้องมี test จำลอง request พร้อมกันอย่างน้อย 2 ตัวเสมอ" },
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
      slug: "coordinate-precision-convention",
      title: "Coordinate Precision Convention",
      tags: ["gps", "precision"],
      intro: "เอกสารนี้กำหนดว่าพิกัดและหน่วยที่เกี่ยวกับตำแหน่งต้องเก็บและส่งต่อกันอย่างไรให้สอดคล้องกันทุก service",
      sections: [
        { heading: "ความละเอียดพิกัด", body: "เก็บ `lat`/`lng` เป็นทศนิยม 6 ตำแหน่งเสมอ (ความละเอียดประมาณ 11 เซนติเมตร) ห้ามปัดเศษเพิ่มระหว่างทางแม้จะดูไม่จำเป็นสำหรับการแสดงผล เพราะ {{ref:module:trip-aggregator}} ต้องการความละเอียดเต็มสำหรับคำนวณระยะทางสะสม" },
        { heading: "หน่วยที่ใช้", body: "ความเร็วเป็น กม./ชม. เสมอ (ไม่ใช่ m/s หรือ mph) ระยะทางเป็นกิโลเมตร ทิศทาง (`headingDeg`) เป็นองศา 0-360 วัดจากทิศเหนือตามเข็มนาฬิกา" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → replay test (สำหรับ service ที่ประมวลผลตำแหน่ง) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:gps-ingest}} และ {{ref:module:geofence-engine}} ต้องผ่าน replay test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความแม่นยำของตำแหน่งโดยตรง" },
      ],
    },
    {
      slug: "ingest-timeout-tuning",
      title: "Ingest & Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (network/connection layer) เท่านั้น ไม่ใช่ business timeout ของทริป — ดูเรื่องนั้นที่ {{ref:policy:trip-boundary-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| UDP ingest read | 2s | `gps-ingest` config |\n| API gateway → internal service | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| geofence-engine → zone polygon query | 3s | env `GEOFENCE_QUERY_TIMEOUT_MS` |\n| WebSocket idle timeout | 60s | `alert-dispatcher` config |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนกรกฎาคม 2026 พบว่า geofence query timeout สั้นเกินไปช่วง rush window ตอนมีลูกค้าใหม่ที่ตั้งโซนไว้เยอะมาก ทำให้ evaluate ตกหล่นบางส่วน ขยับ timeout จาก 2s เป็น 3s แก้ปัญหาได้" },
      ],
    },
    {
      slug: "zone-boundary-migration-runbook",
      title: "Zone Boundary Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อลูกค้าขอปรับโครงสร้างโซนทั้งชุด (เช่น รวมหลายโซนเล็กเป็นโซนใหญ่) ต้อง migrate ข้อมูล polygon ทั้งหมดใน {{ref:module:geofence-engine}} พร้อมกับ cache ที่เกี่ยวข้องทั้งหมด" },
        { heading: "ขั้นตอน", body: "1) หยุด evaluate event ใหม่ของลูกค้ารายนั้นชั่วคราว 2) export polygon เดิมสำรองไว้ 3) import ผังใหม่ 4) รัน replay test ด้วย ping ย้อนหลัง 24 ชั่วโมงเทียบผลลัพธ์เดิมกับใหม่ก่อนเปิดใช้งานจริง" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ระบบรับ ping ไม่ได้ทั้งหมดหรือแจ้งเตือนผิดวงกว้าง, Sev2 = กระทบลูกค้าบางรายหรือ service เดียว, Sev3 = กระทบเล็กน้อยไม่ถึงลูกค้าปลายทาง" },
        { heading: "กรณีข้อมูลผิดพลาดกระทบบิล", body: "ทุกเหตุการณ์ที่กระทบตัวเลขที่ใช้คิดบิลลูกค้า (เช่น mileage ผิดพลาด) ต้องยกระดับเป็นอย่างน้อย Sev2 เสมอและแจ้งทีม billing ทันที ไม่รอให้ลูกค้าโต้แย้งก่อน" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "ping ingestion rate ตกต่ำกว่า 80% ของค่าเฉลี่ยช่วงเวลาเดียวกันของสัปดาห์ก่อน, device offline rate เกิน 5% ของฟลีทพร้อมกัน, WebSocket queue depth ของ {{ref:module:alert-dispatcher}} เกิน threshold" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ ping ingestion rate ตกลงผิดปกติ หรือ geofence event ผิดพลาดเพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:geofence-engine-zone-cache-stale-after-edit}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip ขั้นตอน smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| gps-ingest | 4 | 16 | ping rate > 15,000/s |\n| geofence-engine | 2 | 10 | CPU > 65% |\n| alert-dispatcher | 2 | 8 | WebSocket connection > 70% capacity (เข้มกว่าที่อื่นเพราะ latency-sensitive) |" },
        { heading: "ข้อจำกัดของข้อมูลภายนอก", body: "ความถี่ ping จริงถูกจำกัดโดยฮาร์ดแวร์อุปกรณ์และสัญญาณเครือข่ายมือถือ — การ scale software service เร็วขึ้นช่วยได้แค่ระดับการประมวลผล ไม่ได้เพิ่มความถี่ ping ที่ได้รับจริง ดู {{ref:policy:device-offline-detection-policy}} สำหรับข้อจำกัดนี้" },
      ],
    },
    {
      slug: "device-firmware-deployment-runbook",
      title: "Device Firmware Deployment Runbook",
      tags: ["firmware", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ rollout firmware ตามที่กำหนดไว้ใน {{ref:policy:device-firmware-rollout-policy}}",
      sections: [
        { heading: "ก่อน rollout", body: "ต้องผ่าน replay test ครบตาม {{ref:convention:testing-convention}} และเลือกอุปกรณ์กลุ่มแรกจากรุ่นฮาร์ดแวร์ที่มีพื้นที่ flash เพียงพอเท่านั้น" },
        { heading: "ระหว่างเฝ้าระวัง 48 ชั่วโมง", body: "เฝ้าดู ping success rate, battery consumption, และจำนวนอุปกรณ์ที่หายไปหลังอัปเดตเทียบกับกลุ่มที่ยังไม่อัปเดต ถ้าตัวเลขต่างกันเกิน 3% ให้หยุดขยาย rollout ทันที" },
      ],
    },
  ],
};
