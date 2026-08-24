import type { DomainProfile } from "../types.js";

// Atrium — ระบบควบคุมอาคารอัจฉริยะ (smart building IoT / HVAC / access control)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const smartBuilding: DomainProfile = {
  id: "smart-building",
  displayName: "Atrium — ระบบควบคุมอาคารอัจฉริยะ",
  summary: [
    "Atrium คือแพลตฟอร์มควบคุมระบบอาคาร (Building Management System) สำหรับอาคารสำนักงานเชิงพาณิชย์ ครอบคลุมตั้งแต่ระบบปรับอากาศ (HVAC), การตรวจจับการใช้งานพื้นที่ (occupancy), การปรับพลังงานให้เหมาะสม, ระบบควบคุมประตู/บัตรผ่าน, ไปจนถึงการแจ้งเตือนและจัดตารางซ่อมบำรุง Atrium เชื่อมต่อกับฮาร์ดแวร์ของแต่ละอาคารผ่าน edge gateway ที่ติดตั้งในห้องเครื่องแต่ละชั้น ไม่ได้คุยกับ sensor/actuator โดยตรงจาก cloud",
    "อาคารแต่ละหลังถูกแบ่งเป็น \"โซน\" (zone) ซึ่งอาจเป็นทั้งชั้นหรือส่วนหนึ่งของชั้นก็ได้ ขึ้นกับผังการเดินท่อ HVAC จริง ทีมวิศวกรรมเรียกช่วง 07:00-09:30 ว่า warm-up window เพราะเป็นช่วงที่ระบบต้องปรับอุณหภูมิทุกโซนจาก setback มาสู่ comfort band พร้อมกันก่อนคนเข้าออฟฟิศ ซึ่งเป็นช่วงที่ระบบ HVAC และพลังงานถูกใช้งานหนักที่สุดของวัน",
  ],
  domainTags: ["smart-building", "atrium"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:hvac-controller}} เป็นเจ้าของ setpoint และสถานะวาล์ว/damper ของทุกโซน ส่วน {{ref:module:occupancy-sensor-hub}} เป็นเจ้าของสถานะ occupied/vacant ดิบจาก sensor เท่านั้น ไม่รู้จัก setpoint หรือ comfort band เลย",
    "{{ref:module:energy-optimizer}} ไม่มีสิทธิ์สั่งวาล์วหรือ damper โดยตรง — ทำได้แค่ publish \"คำแนะนำ setpoint\" ให้ {{ref:module:hvac-controller}} ตัดสินใจรับหรือไม่รับอีกที เหตุผลที่ออกแบบให้มีตัวกลางตัดสินใจสุดท้ายแค่จุดเดียวคือป้องกันไม่ให้สอง service แย่งกันสั่งฮาร์ดแวร์ตัวเดียวกันพร้อมกัน ซึ่งเป็นต้นเหตุของ oscillation ที่เคยเกิดขึ้นจริง",
  ],
  apiGatewayNote: [
    "คำสั่งจากแอปมือถือของพนักงานอาคาร (เช่น ปรับอุณหภูมิห้องประชุม, ขอเปิดประตูนอกเวลา) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่ง route ต่อไปยัง {{ref:module:hvac-controller}} หรือ {{ref:module:access-control-gateway}} ตามประเภทคำขอ",
    "คำสั่งที่เกี่ยวกับความปลอดภัยระดับฉุกเฉิน เช่น fire alarm unlock-all ไม่ผ่าน API gateway กลาง — {{ref:module:access-control-gateway}} รับสัญญาณ fire panel โดยตรงผ่านสาย hardwired แยกต่างหาก เพราะ latency ของ gateway กลาง (เฉลี่ย 100-200ms รวม network hop ระหว่าง cloud กับ edge) ช้าเกินไปสำหรับสถานการณ์ที่ต้องปลดล็อกทุกประตูให้คนอพยพทันที",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:hvac-controller}} ดูแล ได้แก่ `zone_setpoints` (ค่า setpoint ปัจจุบันต่อโซนพร้อม source ว่า auto หรือ manual), `zone_telemetry_latest` (ค่าอุณหภูมิ/ความชื้นล่าสุดที่ cache ไว้), และ `hvac_fault_log`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `zone_setpoints` | hvac-controller | อัปเดตทุกครั้งที่มี override หรือ auto adjustment |\n| `occupancy_events` | occupancy-sensor-hub | เก็บ event occupied/vacant ทุกครั้ง ไม่ overwrite ของเก่า |\n| `energy_recommendations` | energy-optimizer | คำแนะนำ setpoint ต่อโซนต่อรอบ 5 นาที |\n| `door_events` | access-control-gateway | ประวัติการปัดบัตร/เปิดประตูทุกครั้ง เก็บถาวรเพื่อ audit |\n| `work_orders` | maintenance-scheduler | สถานะงานซ่อมบำรุงทั้งหมด |",
    "ทุกตารางใช้ `zone_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `occupancy.changed`, `setpoint.recommended`, `door.access_denied`, `sensor.fault_detected`, `hvac.deadband_exceeded` — {{ref:module:alert-dispatcher}} subscribe แทบทุก event เหล่านี้เพื่อจัดหมวดความรุนแรงแล้วส่งต่อ",
    "{{ref:module:hvac-controller}} subscribe `occupancy.changed` จาก {{ref:module:occupancy-sensor-hub}} โดยตรงเพื่อปรับ comfort band ตามคนในห้อง (ห้องว่างใช้ setback แคบกว่า) แต่ไม่ subscribe `setpoint.recommended` แบบ auto-apply — ต้องผ่านการตัดสินใจภายในตัวเองอีกชั้นก่อนเสมอ ดู {{ref:policy:hvac-setpoint-override-policy}}",
  ],
  modules: [
    {
      slug: "hvac-controller",
      name: "hvac-controller",
      tags: ["hvac", "module", "core"],
      description:
        "ควบคุมอุณหภูมิและการไหลเวียนอากาศของแต่ละโซนในอาคาร แยกออกมาจาก legacy PLC ladder-logic script ชุดเดิมเมื่อปลายปี 2024 เพราะทีมต้องการ logic ที่ทดสอบอัตโนมัติได้และเชื่อมต่อ cloud ได้ hvac-controller เป็นผู้ตัดสินใจสุดท้ายเพียงจุดเดียวที่สั่งวาล์วน้ำเย็นและ damper จริง ไม่มี service อื่นสั่งฮาร์ดแวร์ตัวนี้โดยตรง",
      functions: [
        { sig: "setZoneSetpoint(zoneId: string, tempC: number, source: \"auto\" | \"manual\"): Promise<void>", desc: "ตั้ง setpoint ของโซน พร้อม flag แหล่งที่มาเพื่อแยก override ของคนออกจากคำแนะนำอัตโนมัติ" },
        { sig: "readZoneTelemetry(zoneId: string): Promise<ZoneTelemetry>", desc: "ดึงค่าอุณหภูมิ/ความชื้น/ตำแหน่ง damper ล่าสุดที่ cache ไว้" },
        { sig: "resolveDamperPosition(zoneId: string): DamperCommand", desc: "คำนวณตำแหน่ง damper จาก setpoint ปัจจุบันเทียบกับอุณหภูมิจริง" },
        { sig: "reportSensorStale(zoneId: string, lastSeenMs: number): Promise<void>", desc: "แจ้งว่า sensor ของโซนนี้ไม่ส่งค่าอัปเดตนานผิดปกติ" },
      ],
      stateFlow: "regulating → holding (อยู่ในช่วง deadband) → regulating ใหม่เมื่อหลุด deadband หรือ fault (sensor ค้าง/วาล์วไม่ตอบสนอง) — ดู {{ref:policy:hvac-setpoint-override-policy}} สำหรับเงื่อนไขที่ manual override มีผลเหนือ auto",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:energy-optimizer}} โดยตรงในเชิง command — รับได้แค่ \"คำแนะนำ\" ผ่าน event `setpoint.recommended` แล้วตัดสินใจเองว่าจะรับหรือปฏิเสธ ถ้ามี manual override ค้างอยู่จะปฏิเสธคำแนะนำเสมอ เพื่อไม่ให้ automation เขียนทับสิ่งที่คนเพิ่งตั้งเอง",
      internals: {
        constants: [
          { name: "ZONE_DEADBAND_C", value: "1.0" },
          { name: "MAX_SETPOINT_STEP_C", value: "2.0" },
          { name: "STALE_SENSOR_THRESHOLD_MS", value: "180000" },
        ],
        typeSnippet:
          "interface ZoneTelemetry {\n  zoneId: string;\n  tempC: number;\n  humidityPct: number;\n  damperPct: number;\n  lastSensorMs: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่อง override ที่ {{ref:policy:hvac-setpoint-override-policy}}",
      },
    },
    {
      slug: "occupancy-sensor-hub",
      name: "occupancy-sensor-hub",
      tags: ["occupancy", "module"],
      description:
        "รวบรวมสัญญาณจาก occupancy sensor (PIR ผสม CO2 sensor ในบางโซนประชุม) ของทุกชั้น แล้ว normalize เป็นสถานะ occupied/vacant ต่อโซนให้ module อื่นใช้ต่อ ไม่ตัดสินใจเชิงธุรกิจใดๆ เอง แค่ทำหน้าที่แปลงสัญญาณดิบจาก sensor หลายรุ่น (บางชั้นยังใช้ sensor รุ่นเก่าที่ส่งเป็น analog ผ่าน gateway แปลงสัญญาณต่างหาก) ให้เป็นรูปแบบเดียวกัน",
      functions: [
        { sig: "getZoneOccupancy(zoneId: string): Promise<OccupancyState>", desc: "คืนสถานะ occupied/vacant ล่าสุดของโซนพร้อม confidence score" },
        { sig: "recordSensorPing(sensorId: string, zoneId: string, raw: RawSignal): Promise<void>", desc: "บันทึกสัญญาณดิบจาก sensor แล้ว debounce ก่อนตัดสิน state เปลี่ยน" },
        { sig: "flagSensorOffline(sensorId: string, reason: string): Promise<void>", desc: "แจ้งว่า sensor ตัวใดตัวหนึ่งขาดการติดต่อ" },
      ],
      relatedNotes:
        "{{ref:module:hvac-controller}} และ {{ref:module:alert-dispatcher}} subscribe event `occupancy.changed` จากตัวนี้เหมือนกัน แต่ตีความคนละแบบ — hvac-controller ใช้ปรับ comfort band ส่วน alert-dispatcher ใช้เพื่อพิจารณาว่าจะ suppress alert บางประเภทตอนโซนไม่มีคนหรือไม่ ดู {{ref:policy:occupancy-based-lighting-policy}}",
    },
    {
      slug: "energy-optimizer",
      name: "energy-optimizer",
      tags: ["energy", "module", "core"],
      description:
        "คำนวณ setpoint ที่ประหยัดพลังงานที่สุดโดยยังรักษา comfort band ไว้ ทำงานเป็น batch job รันทุก 5 นาทีต่อโซน ไม่ใช่ real-time controller — ส่งผลลัพธ์เป็น \"คำแนะนำ\" ให้ {{ref:module:hvac-controller}} ตัดสินใจอีกชั้น เพื่อไม่ให้สอง service แย่งกันสั่งฮาร์ดแวร์ตัวเดียวกันโดยตรง ซึ่งเป็นสาเหตุของ oscillation ที่เคยพบจริง",
      functions: [
        { sig: "computeOptimalSetpoint(zoneId: string, occupancy: OccupancyState): SetpointRecommendation", desc: "คำนวณ setpoint แนะนำจากราคาไฟปัจจุบันและสถานะ occupancy" },
        { sig: "applyDemandResponseCurve(recommendation: SetpointRecommendation, event: DrEvent): SetpointRecommendation", desc: "ปรับคำแนะนำตามสัญญาณ demand response จากการไฟฟ้า" },
        { sig: "publishRecommendation(rec: SetpointRecommendation): Promise<void>", desc: "ส่งคำแนะนำเข้า queue ให้ hvac-controller รับไปพิจารณา" },
      ],
      relatedNotes:
        "ไม่รู้จักสถานะวาล์วหรือ damper จริงเลย (ดู {{ref:arch:boundaries}}) — คำแนะนำที่ส่งไปอาจถูก {{ref:module:hvac-controller}} ปฏิเสธได้เสมอถ้ามี manual override ดู {{ref:policy:energy-optimizer-conflict-resolution-policy}} สำหรับกติกาการชนกันของสองแหล่งควบคุม",
      internals: {
        constants: [
          { name: "OPT_INTERVAL_MS", value: "300000" },
          { name: "COMFORT_BAND_C", value: "1.5" },
          { name: "MAX_DAILY_ADJUSTMENTS_PER_ZONE", value: "12" },
        ],
        typeSnippet:
          "interface SetpointRecommendation {\n  zoneId: string;\n  tempC: number;\n  reason: \"cost_saving\" | \"demand_response\" | \"comfort_relax\";\n  validUntilMs: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการชนกับ manual override ที่ {{ref:policy:energy-optimizer-conflict-resolution-policy}}",
      },
    },
    {
      slug: "access-control-gateway",
      name: "access-control-gateway",
      tags: ["access-control", "module", "core"],
      description:
        "ควบคุมประตูและบัตรผ่านของอาคาร เชื่อมกับ door controller ฮาร์ดแวร์ผ่าน RS-485 bus ในแต่ละชั้น แยก schedule ที่กำหนดไว้ล่วงหน้า (เช่น fire drill, holiday lockdown) เก็บเป็นตารางต่างหากจาก access rule ปกติ เพื่อให้ตรวจสอบและแก้ schedule ได้โดยไม่กระทบ logic การอนุญาตเข้าออกประจำวัน",
      functions: [
        { sig: "evaluateBadgeSwipe(badgeId: string, doorId: string): Promise<AccessResult>", desc: "ตรวจสิทธิ์บัตรกับประตูที่ปัดจริง คืนผล allow/deny พร้อมเหตุผล" },
        { sig: "scheduleDoorState(doorId: string, state: DoorScheduleState, window: TimeWindow): Promise<void>", desc: "ตั้งตารางสถานะประตูล่วงหน้า เช่น unlock ช่วงเวลาทำการ" },
        { sig: "overrideDoorState(doorId: string, state: \"unlocked\" | \"locked\", reason: string): Promise<void>", desc: "สั่ง override สถานะประตูทันทีนอกเหนือ schedule ปกติ" },
      ],
      stateFlow: "locked → unlocked (ตาม schedule หรือ badge ถูกต้อง) → locked เมื่อพ้น pulse window เสมอ เว้นแต่มี override ค้างอยู่",
      relatedNotes:
        "รับสัญญาณ fire panel ผ่านสาย hardwired แยกจาก API gateway กลาง (ดู {{ref:arch:gateway}}) เพื่อให้ปลดล็อกทุกประตูได้ทันทีโดยไม่พึ่ง network — ดู {{ref:policy:access-control-lockout-policy}} สำหรับกติกาการชนกันของ schedule กับเหตุฉุกเฉิน",
      internals: {
        constants: [
          { name: "BADGE_CACHE_TTL_MS", value: "60000" },
          { name: "DOOR_UNLOCK_PULSE_MS", value: "5000" },
          { name: "EMERGENCY_EGRESS_ALWAYS_UNLOCK", value: "true" },
        ],
        typeSnippet:
          "interface AccessResult {\n  allowed: boolean;\n  badgeId: string;\n  doorId: string;\n  denyReason?: \"expired\" | \"wrong_zone\" | \"schedule_locked\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการล็อกช่วง fire drill ที่ {{ref:policy:access-control-lockout-policy}}",
      },
    },
    {
      slug: "alert-dispatcher",
      name: "alert-dispatcher",
      tags: ["alerting", "module"],
      description:
        "รับ event จาก module อื่น (fault, safety, energy anomaly) แล้วจัดหมวดความรุนแรงและส่งต่อไปยังช่องทางที่เหมาะสม (page, SMS, digest email) ไม่ได้ตัดสินใจเองว่า \"อะไรคือ fault\" — module ต้นทางต้องจัดหมวดความรุนแรงมาให้แล้วเสมอ alert-dispatcher ทำหน้าที่แค่ routing และป้องกันการแจ้งซ้ำ",
      functions: [
        { sig: "dispatchAlert(event: AlertEvent): Promise<void>", desc: "ส่ง alert ไปยังช่องทางตามระดับความรุนแรง" },
        { sig: "escalateAlert(alertId: string): Promise<void>", desc: "ยกระดับ alert ที่ยังไม่มีคน acknowledge ภายในเวลาที่กำหนด" },
        { sig: "suppressDuplicate(event: AlertEvent): boolean", desc: "เช็คว่า event นี้ซ้ำกับที่ส่งไปแล้วในช่วงเวลาสั้นๆ หรือไม่" },
      ],
      relatedNotes:
        "subscribe แทบทุก event หลักในระบบ (ดู {{ref:arch:queue}}) รวมถึง `occupancy.changed` จาก {{ref:module:occupancy-sensor-hub}} เพื่อพิจารณาว่าจะ suppress alert บางประเภทตอนโซนไม่มีคนหรือไม่ ดู {{ref:policy:alert-escalation-policy}}",
    },
    {
      slug: "maintenance-scheduler",
      name: "maintenance-scheduler",
      tags: ["maintenance", "module"],
      description:
        "สร้างและติดตาม work order สำหรับงานซ่อมบำรุง ทั้งจาก fault event อัตโนมัติที่ module อื่นส่งเข้ามาและคำขอที่พนักงานอาคารกรอกเอง แยกออกมาจาก alert-dispatcher ตั้งแต่ต้นเพราะ lifecycle ของ work order (มอบหมายช่าง, ติดตามสถานะ, ปิดงาน) ซับซ้อนกว่าการแค่ส่ง alert มาก",
      functions: [
        { sig: "createWorkOrder(sourceEventId: string, zoneId: string, category: FaultCategory): Promise<string>", desc: "สร้าง work order ใหม่ คืน workOrderId" },
        { sig: "dedupWorkOrder(zoneId: string, category: FaultCategory): Promise<string | null>", desc: "เช็คว่ามี work order เปิดอยู่แล้วสำหรับ fault ประเภทเดียวกันในโซนเดียวกันหรือไม่" },
        { sig: "closeWorkOrder(workOrderId: string, resolvedBy: string, note: string): Promise<void>", desc: "ปิดงานหลังช่างยืนยันแก้ไขเสร็จ" },
        { sig: "reopenWorkOrder(workOrderId: string, reason: string): Promise<void>", desc: "เปิดงานกลับเมื่อพบว่า fault เดิมยังไม่หายจริง" },
      ],
      stateFlow: "open → assigned → resolved → closed หรือ reopened (จาก resolved/closed ถ้า fault เดิมกลับมา)",
      relatedNotes:
        "ไม่รู้ว่า fault แต่ละอันมาจาก sensor ตัวไหนใน {{ref:module:occupancy-sensor-hub}} หรือ {{ref:module:hvac-controller}} โดยตรง — รู้แค่ `zoneId` กับ `category` ที่ module ต้นทางส่งมา ดู {{ref:policy:maintenance-work-order-dedup-policy}} สำหรับกติกากันงานซ้ำ",
    },
  ],
  envVarGroups: [
    {
      service: "hvac-controller-service",
      vars: [
        { name: "HVAC_ZONE_DEADBAND_C", example: "1.0", note: "ดู {{ref:policy:hvac-setpoint-override-policy}}" },
        { name: "HVAC_STALE_SENSOR_MS", example: "180000", note: "เวลาที่ยอมให้ sensor ไม่อัปเดตก่อนถือว่า stale" },
      ],
    },
    {
      service: "occupancy-sensor-hub-service",
      vars: [
        { name: "OCCUPANCY_DEBOUNCE_MS", example: "8000", note: "กันสัญญาณ PIR สั่นทำให้ state สลับถี่เกินไป" },
        { name: "OCCUPANCY_SENSOR_DB_URL", example: "postgres://occupancy-db.internal:5432/occupancy", note: "secret ห้าม log" },
      ],
    },
    {
      service: "energy-optimizer-service",
      vars: [
        { name: "OPT_INTERVAL_MS", example: "300000", note: "" },
        { name: "OPT_MAX_DAILY_ADJUSTMENTS", example: "12", note: "ดู {{ref:policy:energy-optimizer-conflict-resolution-policy}}" },
      ],
    },
    {
      service: "access-control-gateway-service",
      vars: [
        { name: "ACCESS_BADGE_CACHE_TTL_MS", example: "60000", note: "" },
        { name: "ACCESS_DOOR_UNLOCK_PULSE_MS", example: "5000", note: "" },
        { name: "FIRE_PANEL_HARDWIRE_PORT", example: "/dev/ttyFIRE0", note: "secret ระดับฮาร์ดแวร์ ห้าม log ค่าจริงของแต่ละอาคาร" },
      ],
    },
  ],
  policies: [
    {
      slug: "hvac-setpoint-override-policy",
      title: "นโยบายการ Override Setpoint ของ HVAC",
      tags: ["hvac", "override", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อพนักงานตั้ง setpoint เองผ่านแอปหรือ panel ในห้อง (source `manual`) {{ref:module:hvac-controller}} จะยึด setpoint นั้นไว้และปฏิเสธคำแนะนำจาก {{ref:module:energy-optimizer}} ทุกครั้งจนกว่าจะครบเวลา override หรือมีคนยกเลิกเอง",
        "manual override มีอายุสูงสุด 4 ชั่วโมงนับจากตั้งค่า หลังจากนั้นระบบจะกลับไปใช้ auto ตามปกติเอง เพื่อไม่ให้คนลืม override ทิ้งไว้ข้ามคืนแล้วเปลืองพลังงานโดยไม่จำเป็น",
      ],
      sections: [
        {
          heading: "ทำไมต้องมีอายุ override",
          body: "override ที่ไม่มีวันหมดอายุเคยทำให้ห้องประชุมที่มีคนตั้งอุณหภูมิเย็นจัดไว้ครั้งเดียวเมื่อเช้าถูกปรับความเย็นเท่าเดิมไปตลอดทั้งคืนทั้งที่ไม่มีคนใช้งานแล้ว การจำกัดอายุบังคับให้ระบบกลับมาประเมินความจำเป็นใหม่เป็นระยะ",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Sensor ของโซนที่ Override ค้างอยู่ Stale",
        tags: ["hvac", "override", "edge-case"],
        body: [
          "ถ้า sensor ของโซนที่กำลังมี manual override ค้างอยู่ถูก flag เป็น stale (ไม่อัปเดตเกิน `HVAC_STALE_SENSOR_MS`) ระบบจะไม่ยกเลิก override ทันที แต่จะหยุดปรับ damper เพิ่มเติมและคง damper position ล่าสุดที่รู้ว่าปลอดภัยไว้แทน เพราะการเชื่อค่า setpoint แต่คำนวณ damper จากอุณหภูมิที่ไม่รู้ว่าจริงหรือไม่อาจทำให้ overshoot ไปทิศทางใดทิศทางหนึ่งได้",
          "กรณีนี้ต่างจาก sensor stale ตอนไม่มี override ซึ่งระบบจะ fallback ไปใช้ค่าเฉลี่ยของโซนข้างเคียงแทน — แต่ตอนมี manual override ทีมตัดสินใจว่าการ \"ค้างไว้เท่าที่รู้ล่าสุด\" ปลอดภัยกว่าเดาอุณหภูมิจากโซนอื่นที่คนอาจตั้งใจให้ต่างกันอยู่แล้ว",
        ],
      },
    },
    {
      slug: "occupancy-based-lighting-policy",
      title: "นโยบายปิดไฟอัตโนมัติตาม Occupancy",
      tags: ["occupancy", "lighting", "policy"],
      isPrimary: true,
      intro: [
        "โซนที่ {{ref:module:occupancy-sensor-hub}} รายงานว่า vacant ต่อเนื่องเกิน 10 นาทีจะถูกสั่งปิดไฟอัตโนมัติผ่าน lighting relay ที่ผูกกับ zone เดียวกับ HVAC",
        "การตัดสิน vacant ต้องผ่าน debounce ตาม `OCCUPANCY_DEBOUNCE_MS` ก่อนเสมอ เพื่อกันกรณีคนนั่งนิ่งนานจน PIR sensor ไม่เห็นการเคลื่อนไหวแล้วตีความผิดว่าห้องว่าง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับห้องประชุมและห้อง Focus Room",
        tags: ["occupancy", "lighting", "edge-case"],
        body: [
          "ห้องประชุมและ focus room ที่คนมักนั่งนิ่งนานระหว่างพรีเซนต์หรือ video call จะได้ grace period ปิดไฟที่ยาวกว่าปกติ (30 นาทีแทน 10 นาที) และก่อนปิดไฟจริงจะกระพริบไฟเตือน 1 ครั้งเป็นเวลา 5 วินาทีให้คนในห้องมีโอกาสขยับตัวให้ sensor เห็นก่อนเสมอ",
          "ห้องที่เคยเกิดเหตุ false-negative ปิดไฟทั้งที่มีคนอยู่ (ดู {{ref:incident:occupancy-false-negative-lights-off}}) จะถูกเพิ่มเข้า watchlist ให้ grace period ยาวขึ้นเป็นพิเศษจนกว่าจะเปลี่ยน sensor รุ่นใหม่ที่ไวกว่า",
        ],
      },
    },
    {
      slug: "energy-optimizer-conflict-resolution-policy",
      title: "นโยบายการชนกันระหว่าง Energy Optimizer กับ Manual Override",
      tags: ["energy", "conflict", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:energy-optimizer}} ส่งคำแนะนำ setpoint ทุก `OPT_INTERVAL_MS` แต่ {{ref:module:hvac-controller}} จะปฏิเสธคำแนะนำทุกครั้งที่โซนนั้นมี manual override ที่ยังไม่หมดอายุอยู่ ไม่มีข้อยกเว้น",
        "จำนวนครั้งที่ optimizer ปรับ setpoint ของโซนเดียวกันในหนึ่งวันถูกจำกัดที่ `OPT_MAX_DAILY_ADJUSTMENTS_PER_ZONE` เพื่อป้องกัน oscillation ที่เกิดจากการคำนวณแกว่งไปมาระหว่างรอบ",
      ],
      sections: [
        {
          heading: "ทำไมจำกัดจำนวนครั้งต่อวันแทนที่จะแก้สูตรคำนวณให้เสถียรกว่าเดิม",
          body: "ทีมเคยพยายามแก้สูตรให้เสถียรขึ้นแต่พบว่าปัจจัยภายนอก (ราคาไฟ, demand response signal) เปลี่ยนเร็วกว่าที่สูตรจะไล่ตามทันจริงๆ การจำกัดจำนวนครั้งเป็นทางแก้ที่ deterministic และเข้าใจง่ายกว่าการพยายาม tune สูตรให้สมบูรณ์แบบ",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Manual Override หมดอายุระหว่างที่ Optimizer กำลังจะปรับพอดี",
        tags: ["energy", "conflict", "edge-case"],
        body: [
          "ถ้า manual override หมดอายุพอดีในช่วงเวลาไม่ถึง 1 นาทีก่อนรอบคำนวณถัดไปของ optimizer ระบบจะรอให้ผ่านไปอีกหนึ่งรอบเต็ม (5 นาที) ก่อนเริ่มรับคำแนะนำ auto ใหม่ แทนที่จะรับทันทีที่หมดอายุ เพื่อกันไม่ให้ setpoint เปลี่ยนสองครั้งติดกันในเวลาไล่เลี่ยกันจนคนในห้องรู้สึกได้ถึงความแกว่ง",
          "เคสนี้เป็นบทเรียนตรงจาก {{ref:incident:energy-optimizer-override-oscillation}} ที่พบว่าการรับคำแนะนำทันทีที่ override หมดอายุทำให้อุณหภูมิแกว่งขึ้นลงต่อเนื่องหลายรอบก่อนจะนิ่ง",
        ],
      },
    },
    {
      slug: "access-control-lockout-policy",
      title: "นโยบายการล็อก/ปลดล็อกประตูช่วง Schedule พิเศษ",
      tags: ["access-control", "schedule", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:access-control-gateway}} รองรับ schedule พิเศษ เช่น fire drill test, holiday lockdown, หรือปิดปรับปรุงชั้น โดยเก็บเป็นตารางแยกจาก access rule ปกติของบัตรพนักงาน",
        "หลักการสำคัญที่สุดคือ schedule พิเศษต้อง **ไม่มีทาง** ทำให้คนออกจากอาคารไม่ได้ในสถานการณ์ฉุกเฉิน — ทุก schedule ที่ตั้งเป็น locked ต้องยัง unlock อัตโนมัติทันทีถ้ามีสัญญาณ fire alarm เข้ามา ไม่ว่า schedule จะตั้งไว้อย่างไรก็ตาม",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Fire Drill Test ทับซ้อนกับ Schedule ล็อกพื้นที่จริง",
        tags: ["access-control", "fire-drill", "edge-case"],
        body: [
          "ถ้า fire drill test ที่ตั้งเวลาไว้ล่วงหน้าทับซ้อนกับช่วงเวลาที่มี schedule ล็อกพื้นที่จริง (เช่น พื้นที่ปิดปรับปรุง) ระบบต้องปลดล็อกประตูทางออกฉุกเฉินเสมอในช่วง drill แม้พื้นที่นั้นจะถูกตั้งเป็น locked ไว้ — ประตูภายในที่ไม่ใช่ทางออกฉุกเฉินยังคง locked ตาม schedule เดิมได้",
          "การแยกแยะว่าประตูไหนเป็น \"ทางออกฉุกเฉิน\" ต้องตั้ง flag `isEmergencyEgress` ไว้ล่วงหน้าในระบบเสมอ ไม่ใช่ตัดสินใจตอน runtime — เหตุการณ์ {{ref:incident:fire-drill-lockout-bug}} เกิดขึ้นเพราะ drill schedule ที่สร้างใหม่ไม่ได้ query flag นี้ก่อนล็อก ทำให้ล็อกประตูทางออกฉุกเฉินไปด้วยโดยไม่ตั้งใจ",
        ],
      },
    },
    {
      slug: "maintenance-work-order-dedup-policy",
      title: "นโยบายกันสร้าง Work Order ซ้ำ",
      tags: ["maintenance", "dedup", "policy"],
      isPrimary: true,
      intro: [
        "ก่อนสร้าง work order ใหม่ {{ref:module:maintenance-scheduler}} ต้องเรียก `dedupWorkOrder` เช็คก่อนเสมอว่ามี work order สถานะ `open` หรือ `assigned` สำหรับ fault category เดียวกันในโซนเดียวกันอยู่แล้วหรือไม่",
        "ถ้าพบ work order ที่ยังเปิดอยู่ ระบบจะไม่สร้างใหม่ แต่จะเพิ่ม `occurrenceCount` และอัปเดต `lastSeenAt` บน work order เดิมแทน เพื่อให้ช่างเห็นว่า fault นี้เกิดซ้ำกี่ครั้งแล้วโดยไม่ต้องไล่ดูหลายใบ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Fault เดิมเกิดซ้ำหลังปิดงานไปแล้วไม่นาน",
        tags: ["maintenance", "dedup", "edge-case"],
        body: [
          "ถ้า work order ถูกปิด (`closed`) ไปแล้วแต่ fault event ประเภทเดียวกันกลับมาอีกภายใน 24 ชั่วโมง ระบบจะไม่สร้าง work order ใหม่ตาม flow ปกติ — จะเรียก `reopenWorkOrder` บนใบเดิมแทน เพื่อให้ประวัติการซ่อมอยู่ในใบเดียวกันต่อเนื่อง ช่วยให้ช่างเห็นว่าการแก้ไขครั้งก่อนอาจไม่ได้แก้ที่ต้นเหตุจริง",
          "เกิน 24 ชั่วโมงไปแล้วจึงจะถือเป็น fault ใหม่และสร้างใบใหม่ตามปกติ เพราะการซ่อมที่ได้ผลจริงมักจะเห็นผลตั้งแต่วันแรก ถ้าผ่านไปหลายวันแล้วเพิ่งเกิดซ้ำมักเป็นสาเหตุอื่นมากกว่า",
        ],
      },
    },
    {
      slug: "alert-escalation-policy",
      title: "นโยบายการยกระดับ Alert ที่ไม่มีคน Acknowledge",
      tags: ["alerting", "escalation", "policy"],
      isPrimary: true,
      intro: [
        "alert ระดับ `critical` ที่ไม่มีคน acknowledge ภายใน 5 นาทีจะถูก escalate ไปหา on-call คนถัดไปในสายอัตโนมัติผ่าน `escalateAlert` ระดับ `warning` มีเวลาก่อน escalate นานกว่าคือ 30 นาที",
        "ในช่วงเวลานอกเวลาทำการ (22:00-06:00) alert ระดับ `warning` จะถูกรวมเป็น digest ส่งตอนเช้าแทนการ page ทันที ยกเว้น `critical` ที่ page ทันทีตลอด 24 ชั่วโมงไม่มีข้อยกเว้นเรื่องเวลา",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Alert ด้านความปลอดภัยที่เกี่ยวกับ Access Control",
        tags: ["alerting", "safety", "edge-case"],
        body: [
          "alert ที่มาจาก {{ref:module:access-control-gateway}} เกี่ยวกับความปลอดภัย (เช่น ประตูทางออกฉุกเฉินถูกล็อกผิดพลาด, fire panel ส่งสัญญาณแต่ไม่มี response) จะถูกจัดเป็น `critical` เสมอไม่ว่า module ต้นทางจะส่งระดับความรุนแรงมาเป็นอะไรก็ตาม — alert-dispatcher มีรายการ event type พิเศษที่ force-upgrade ระดับความรุนแรงแบบนี้อยู่ล่วงหน้า",
          "alert กลุ่มนี้ยังข้าม quiet hours ไปด้วย แม้จะเป็นช่วง 22:00-06:00 ก็ page ทันทีเสมอ เพราะความเสี่ยงด้านความปลอดภัยทางกายภาพสำคัญกว่าความรำคาญจากการถูกปลุกกลางดึก",
        ],
      },
    },
    {
      slug: "sensor-firmware-update-policy",
      title: "นโยบายการอัปเดต Firmware ของ Occupancy Sensor",
      tags: ["occupancy", "firmware", "policy"],
      isPrimary: false,
      intro: [
        "firmware ใหม่ของ occupancy sensor ต้อง rollout แบบ staged เสมอ เริ่มจาก sensor ไม่เกิน 10 ตัวในชั้นเดียวก่อน สังเกตอาการอย่างน้อย 48 ชั่วโมงก่อนขยายไปทั้งอาคาร",
        "ห้าม rollout firmware ระหว่าง warm-up window (07:00-09:30) โดยเด็ดขาด เพราะเป็นช่วงที่ระบบพึ่งพาข้อมูล occupancy หนาแน่นที่สุดในการปรับ comfort band ให้ทันก่อนคนเข้าออฟฟิศ",
      ],
    },
    {
      slug: "energy-demand-response-policy",
      title: "นโยบายการตอบสนอง Demand Response",
      tags: ["energy", "demand-response", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อการไฟฟ้าส่งสัญญาณ demand response event {{ref:module:energy-optimizer}} จะปรับ comfort band ให้กว้างขึ้นชั่วคราว (เพิ่มได้สูงสุด 2°C จาก `COMFORT_BAND_C` ปกติ) เพื่อลดโหลดตามที่ตกลงกับการไฟฟ้าไว้",
        "การปรับ comfort band ระหว่าง demand response event ยังคงต้องผ่าน {{ref:module:hvac-controller}} ตัดสินใจอีกชั้นเหมือนคำแนะนำปกติ ไม่มีสิทธิ์พิเศษข้ามการตรวจ manual override",
      ],
    },
    {
      slug: "after-hours-hvac-setback-policy",
      title: "นโยบาย Setback อุณหภูมินอกเวลาทำการ",
      tags: ["hvac", "setback", "policy"],
      isPrimary: false,
      intro: [
        "นอกเวลาทำการปกติ (19:00-07:00 วันธรรมดา, ทั้งวันเสาร์-อาทิตย์) ทุกโซนจะถูกปรับเข้าสู่ setback mode อัตโนมัติ (ขยาย comfort band กว้างขึ้นมาก เพื่อประหยัดพลังงาน) ยกเว้นโซนที่มี manual override ค้างอยู่",
        "การกลับจาก setback มาสู่ comfort band ปกติเริ่มล่วงหน้าก่อนเวลาทำการจริง (warm-up window) โดยคำนวณเวลาที่ต้องเริ่มจากอุณหภูมิภายนอกปัจจุบัน — วันที่อากาศเย็นจัดใช้เวลา warm-up นานกว่าวันปกติ",
      ],
    },
    {
      slug: "badge-provisioning-policy",
      title: "นโยบายการออกบัตรผ่านพนักงาน",
      tags: ["access-control", "provisioning", "policy"],
      isPrimary: false,
      intro: [
        "บัตรพนักงานใหม่มีอายุเริ่มต้น 1 ปีนับจากวันออกบัตร ต่ออายุอัตโนมัติทุกปีถ้า HR ยืนยันสถานะพนักงานยังทำงานอยู่ผ่าน integration กับระบบ HR ภายนอก",
        "บัตรที่พนักงานลาออกต้องถูกเพิกถอนสิทธิ์ภายใน 1 ชั่วโมงหลัง HR แจ้งสถานะ offboarding เข้ามา ไม่รอรอบ sync ปกติที่รันทุกคืน",
      ],
    },
    {
      slug: "building-zone-priority-policy",
      title: "นโยบายลำดับความสำคัญของโซนช่วงไฟฟ้าขัดข้องบางส่วน",
      tags: ["energy", "priority", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อระบบไฟฟ้าสำรอง (generator) ทำงานเพราะไฟดับและมีกำลังจ่ายจำกัด โซนที่จัดเป็น `critical` (ห้องเซิร์ฟเวอร์, ทางออกฉุกเฉิน, ลิฟต์) ได้ไฟก่อนเสมอ ส่วนโซนสำนักงานทั่วไปอาจถูกตัด HVAC ชั่วคราวเพื่อกันโหลด",
        "การจัดลำดับนี้ตั้งไว้ล่วงหน้าต่ออาคารแต่ละหลัง ไม่ใช่คำนวณ real-time ตอนไฟดับ เพราะเวลาที่มีให้ตัดสินใจตอนเกิดเหตุจริงสั้นเกินกว่าจะคำนวณอะไรซับซ้อน",
      ],
    },
  ],
  incidents: [
    {
      slug: "hvac-stale-sensor-summer-heating",
      title: "HVAC ค้างโหมดทำความร้อนกลางฤดูร้อนเพราะ Sensor ค้างค่าเดิม",
      tags: ["hvac", "sensor"],
      summary:
        "พนักงานชั้น 12 ร้องเรียนว่าห้องร้อนผิดปกติทั้งที่เป็นเดือนเมษายน แอปแสดงว่า HVAC กำลังทำงานในโหมด heating อยู่ต่อเนื่องหลายชั่วโมง",
      investigation:
        "ตรวจ {{ref:module:hvac-controller}} พบว่า `readZoneTelemetry` ของโซนนั้นคืนค่าอุณหภูมิเดิมซ้ำมา 6 ชั่วโมงติดต่อกันโดยไม่เปลี่ยนแม้แต่ทศนิยม ตรงกับนิยาม stale sensor แต่ `reportSensorStale` ไม่เคยถูกเรียกเลย",
      cause:
        "sensor ตัวนั้นค้างส่งค่าเดิมซ้ำ (ไม่ใช่ขาดการเชื่อมต่อ) ซึ่ง logic ตรวจ stale เดิมเช็คแค่ \"ไม่ได้รับ ping เลย\" ไม่ได้เช็คว่า \"ได้รับ ping แต่ค่าซ้ำเดิมทุกครั้ง\" ทำให้ไม่ถูก flag เป็น stale ระบบจึงยังเชื่อค่าอุณหภูมิเดิมที่ต่ำกว่าความจริงมากและสั่งทำความร้อนต่อไปเรื่อยๆ",
      resolution:
        "วิศวกร on-call สั่ง `setZoneSetpoint` แบบ manual override ชั่วคราวเพื่อบังคับปิด heating ทันที แล้วส่งช่างไปเปลี่ยน sensor ตัวที่ค้าง",
      followup:
        "แก้ `reportSensorStale` ให้ตรวจจับกรณีค่าซ้ำเดิมต่อเนื่องเกิน `STALE_SENSOR_THRESHOLD_MS` ด้วย ไม่ใช่แค่กรณีขาด ping เพิ่ม test case สำหรับ pattern นี้โดยเฉพาะ",
    },
    {
      slug: "occupancy-false-negative-lights-off",
      title: "ไฟดับกลางที่มีคนอยู่จาก Occupancy False Negative",
      tags: ["occupancy", "lighting"],
      summary:
        "พนักงานในห้องประชุมชั้น 8 รายงานว่าไฟดับกลางการประชุมทั้งที่มีคนอยู่ในห้องตลอดเวลา เกิดขึ้นซ้ำ 3 ครั้งในสัปดาห์เดียว",
      investigation:
        "ตรวจ log {{ref:module:occupancy-sensor-hub}} พบว่า sensor รายงาน vacant ต่อเนื่องเกิน 10 นาทีจริง ทั้งที่มีคนนั่งประชุมอยู่ ตรงกับเงื่อนไข auto-off ใน {{ref:policy:occupancy-based-lighting-policy}}",
      cause:
        "ห้องประชุมนี้ใช้เก้าอี้แบบนั่งประจุมนานโดยแทบไม่ขยับตัว ทำให้ PIR sensor ไม่เห็นการเคลื่อนไหวพอที่จะ trigger occupied ใหม่ ก่อนหน้านี้ห้องประชุมยังไม่ได้อยู่ใน watchlist grace period ยาวตามที่ policy กำหนดไว้สำหรับห้องประเภทนี้",
      resolution:
        "เพิ่มห้องประชุมนี้เข้า watchlist grace period 30 นาทีตาม {{ref:policy:occupancy-based-lighting-policy}} ทันที และเปิดไฟกลับด้วยมือระหว่างรอ",
      followup:
        "สำรวจห้องประชุมทุกห้องในอาคารว่ามีรูปแบบการใช้งานคล้ายกันหรือไม่ เพื่อเพิ่มเข้า watchlist ล่วงหน้าแทนรอให้เกิดเหตุก่อน",
    },
    {
      slug: "energy-optimizer-override-oscillation",
      title: "อุณหภูมิแกว่งขึ้นลงหลัง Manual Override หมดอายุพอดีช่วงรอบคำนวณ",
      tags: ["energy", "hvac"],
      summary:
        "โซนสำนักงานชั้น 5 มีรายงานว่าอุณหภูมิเปลี่ยนแปลงถี่ผิดปกติช่วงบ่าย พนักงานรู้สึกได้ถึงความร้อน-เย็นสลับกันหลายรอบใน 20 นาที",
      investigation:
        "ตรวจ {{ref:module:energy-optimizer}} และ {{ref:module:hvac-controller}} พร้อมกัน พบว่า manual override ของโซนนั้นหมดอายุตอน 14:03 ซึ่งใกล้กับรอบคำนวณของ optimizer ตอน 14:05 มาก ทำให้คำแนะนำ auto ใหม่ถูกรับทันทีที่ override หมดอายุ",
      cause:
        "ตอนนั้นยังไม่มี buffer รอรอบถัดไปตาม {{ref:policy:energy-optimizer-conflict-resolution-policy}} — คำแนะนำที่คำนวณไว้ตั้งแต่ก่อน override หมดอายุ (ซึ่งคำนวณจากสมมติฐานว่ายังมี override อยู่) ถูก apply ทันทีทำให้ setpoint กระโดดเปลี่ยนแบบไม่ต่อเนื่อง",
      resolution:
        "ปรับ setpoint กลับด้วยมือให้นิ่งชั่วคราว แล้วรอให้ผ่านรอบคำนวณครบใหม่",
      followup:
        "เพิ่ม buffer 1 รอบเต็มก่อนรับคำแนะนำ auto หลัง override หมดอายุ ตามที่บันทึกไว้ใน {{ref:policy:energy-optimizer-conflict-resolution-policy}} ปัจจุบัน",
    },
    {
      slug: "fire-drill-lockout-bug",
      title: "ประตูทางออกฉุกเฉินถูกล็อกระหว่าง Fire Drill Test เพราะ Schedule ชนกัน",
      tags: ["access-control", "fire-drill"],
      summary:
        "ระหว่างซ้อมหนีไฟตามกำหนดการ พบว่าประตูทางออกฉุกเฉินฝั่งบันไดหนีไฟ B ของชั้น 3 ล็อกอยู่ ทำให้พนักงานบางส่วนต้องอ้อมไปใช้ทางออกอื่น",
      investigation:
        "ตรวจ {{ref:module:access-control-gateway}} พบว่าชั้น 3 มี schedule ปิดปรับปรุงพื้นที่บางส่วนตั้งไว้ล่วงหน้าทับซ้อนกับเวลา drill test พอดี และ schedule นั้นสั่งล็อกประตูทุกบานในโซนรวมถึงประตูทางออกฉุกเฉินด้วย",
      cause:
        "schedule ปิดปรับปรุงที่สร้างใหม่ไม่ได้ query flag `isEmergencyEgress` ก่อนล็อก ทำให้ล็อกประตูทางออกฉุกเฉินไปพร้อมประตูภายในทั่วไปโดยไม่ตั้งใจ ขัดกับหลักการใน {{ref:policy:access-control-lockout-policy}} ที่ระบุชัดว่าทางออกฉุกเฉินต้องไม่ถูกล็อกช่วง drill",
      resolution:
        "ทีมอาคารสั่ง `overrideDoorState` ปลดล็อกประตูที่เกี่ยวข้องด้วยมือทันทีระหว่าง drill แล้วรายงานเหตุการณ์นี้เป็น near-miss",
      followup:
        "แก้ logic การสร้าง schedule ทุกประเภทให้ query flag `isEmergencyEgress` บังคับก่อนล็อกเสมอ ไม่ปล่อยให้เป็นทางเลือกของผู้สร้าง schedule",
    },
    {
      slug: "duplicate-work-order-flood",
      title: "Work Order ซ้ำจำนวนมากสำหรับ Fault เดียวกันในโซนเดียวกัน",
      tags: ["maintenance", "dedup"],
      summary:
        "ทีมซ่อมบำรุงพบว่ามี work order เปิดค้างมากกว่า 15 ใบสำหรับปัญหา damper ค้างของโซนเดียวกันในเช้าวันเดียว ทั้งที่ควรมีแค่ใบเดียว",
      investigation:
        "ตรวจ {{ref:module:maintenance-scheduler}} พบว่า `dedupWorkOrder` ถูกเรียกจริงแต่ query หา work order เดิมด้วย `zoneId` กับ `category` ที่ไม่ normalize case ให้ตรงกัน — event บางตัวส่ง category เป็น `damper_stuck` บางตัวส่งเป็น `DAMPER_STUCK`",
      cause:
        "module ต้นทางสองเวอร์ชัน (เวอร์ชันเก่ากับใหม่ที่กำลัง rollout) ส่ง category คนละ casing กัน ทำให้ dedup query ไม่เจอ work order เดิมที่สร้างจาก event เวอร์ชันอื่น",
      resolution:
        "normalize category เป็น lowercase ก่อนบันทึกและก่อน query เสมอ แล้ว merge work order ที่ซ้ำกันทั้ง 15 ใบเหลือใบเดียวด้วยมือ",
      followup:
        "เพิ่ม enum ที่บังคับ type-level แทนการรับ string อิสระสำหรับ `category` เพื่อกัน casing ไม่ตรงกันตั้งแต่ต้นทาง",
    },
    {
      slug: "occupancy-sensor-firmware-mass-offline",
      title: "Occupancy Sensor ทั้งอาคารหลุดออฟไลน์พร้อมกันหลังอัปเดต Firmware",
      tags: ["occupancy", "firmware"],
      summary:
        "หลังอัปเดต firmware sensor รุ่น OC-4 พบว่า sensor ทั้งอาคารกว่า 200 ตัวหลุดออฟไลน์พร้อมกันภายใน 10 นาที ทำให้ระบบไฟและ HVAC ทั้งอาคารกลับไปใช้ default schedule แทน occupancy จริง",
      investigation:
        "ตรวจ {{ref:module:occupancy-sensor-hub}} พบว่า sensor ทุกตัวหยุดส่ง ping พร้อมกันหลัง firmware อัปเดตเสร็จ ไม่ใช่แค่บางตัว",
      cause:
        "firmware เวอร์ชันใหม่เปลี่ยน protocol การยืนยันตัวตนกับ gateway โดยไม่ได้ backward compatible กับ gateway เวอร์ชันที่ติดตั้งอยู่จริง ทำให้ handshake ล้มเหลวทุกตัวพร้อมกันทันทีหลังรีสตาร์ท ซึ่งเป็นความผิดพลาดที่ควรถูกจับได้ตั้งแต่ staged rollout แต่ครั้งนี้ทีมข้ามขั้นตอน staged เพราะเข้าใจผิดว่าเป็น patch เล็กน้อย",
      resolution:
        "rollback firmware กลับเวอร์ชันเดิมทั้งอาคารทันที sensor กลับมาออนไลน์ภายใน 20 นาทีหลัง rollback เสร็จ",
      followup:
        "บังคับให้ทุก firmware update ต้องผ่าน staged rollout ตาม {{ref:policy:sensor-firmware-update-policy}} เสมอ ไม่มีข้อยกเว้นแม้จะเชื่อว่าเป็น patch เล็กน้อย",
    },
    {
      slug: "chiller-deadband-short-cycling",
      title: "วาล์วน้ำเย็นเปิด-ปิดถี่ผิดปกติหลังปรับ Deadband แคบเกินไป",
      tags: ["hvac", "performance"],
      summary:
        "ทีมซ่อมบำรุงสังเกตว่าวาล์วน้ำเย็นของโซนชั้น 20 เปิด-ปิดถี่ผิดปกติ (short cycling) เสี่ยงต่ออายุการใช้งานของวาล์วเอง",
      investigation:
        "ตรวจ metric ของ {{ref:module:hvac-controller}} พบว่า `ZONE_DEADBAND_C` ของโซนนี้ถูกปรับจาก 1.0 เหลือ 0.3 ระหว่างการทดสอบ tuning เมื่อสัปดาห์ก่อนแต่ไม่ได้ปรับกลับ",
      cause:
        "deadband ที่แคบเกินไปทำให้ระบบตีความความผันผวนเล็กน้อยของอุณหภูมิ (จากการเปิดประตูเข้าออกปกติ) เป็นการหลุด deadband ตลอดเวลา สั่ง damper และวาล์วปรับใหม่ทุกครั้งที่อุณหภูมิขยับแม้แค่ 0.3-0.4 องศา",
      resolution:
        "ปรับ `ZONE_DEADBAND_C` กลับเป็น 1.0 ตามค่ามาตรฐาน วาล์วหยุด short cycling ทันที",
      followup:
        "เพิ่มขั้นตอนยืนยันคืนค่า config หลังการทดสอบ tuning ทุกครั้งเป็นส่วนหนึ่งของ {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "badge-sync-delay-tailgate-alarm",
      title: "แจ้งเตือน Tailgate ผิดพลาดจาก Badge Sync ล่าช้า",
      tags: ["access-control", "sensor"],
      summary:
        "ระบบแจ้งเตือน tailgate (มีคนเดินตามคนที่ปัดบัตรเข้าไปโดยไม่ปัดบัตรเอง) ผิดพลาดจำนวนมากช่วงเช้าวันจันทร์ ทั้งที่พนักงานทุกคนปัดบัตรถูกต้อง",
      investigation:
        "ตรวจ {{ref:module:access-control-gateway}} พบว่า `evaluateBadgeSwipe` ของพนักงานหลายคนล่าช้ากว่าปกติ 3-5 วินาทีก่อนได้ผลลัพธ์ ทำให้ประตูเปิดช้ากว่าจังหวะที่คนเดินถึง sensor ตรวจนับคนที่ผ่านประตู",
      cause:
        "`BADGE_CACHE_TTL_MS` หมดอายุพร้อมกันสำหรับบัตรจำนวนมากช่วงเช้าวันจันทร์ (เพราะ cache ถูก warm ครั้งเดียวตอนเที่ยงคืนวันอาทิตย์) ทำให้ต้อง query สิทธิ์จาก database จริงพร้อมกันจำนวนมาก เกิด latency spike ที่ database",
      resolution:
        "เพิ่ม jitter ให้เวลาหมดอายุของ cache แต่ละบัตรไม่ตรงกันเป๊ะ แทนที่จะหมดอายุพร้อมกันหมดทุกใบ แก้ latency spike ได้",
      followup:
        "ทบทวนกลยุทธ์ cache warming ทั้งหมดของ access-control-gateway ให้กระจายเวลาแทนการ warm พร้อมกันทีเดียว",
    },
    {
      slug: "demand-response-overshoot-complaints",
      title: "ปรับ Comfort Band กว้างเกินไประหว่าง Demand Response จนพนักงานร้องเรียน",
      tags: ["energy", "demand-response"],
      summary:
        "ระหว่าง demand response event ของการไฟฟ้าช่วงบ่ายวันร้อนจัด พนักงานหลายชั้นร้องเรียนว่าร้อนเกินทนพร้อมกัน",
      investigation:
        "ตรวจ {{ref:module:energy-optimizer}} พบว่า `applyDemandResponseCurve` ขยาย comfort band เต็ม 2°C ตามเพดานสูงสุดทันทีที่ event เริ่ม โดยไม่ค่อยๆ ขยับแบบ gradual",
      cause:
        "logic เดิมออกแบบมาสำหรับ demand response event ที่มักเกิดตอนอากาศไม่ร้อนจัด การขยาย comfort band เต็มเพดานทันทีในวันที่อุณหภูมิภายนอกสูงมากทำให้ความรู้สึกร้อนของคนในตึกเปลี่ยนแบบฉับพลันเกินกว่าจะปรับตัวทัน",
      resolution:
        "ปรับ comfort band ให้แคบกว่าเพดานเต็มชั่วคราวด้วยมือระหว่าง event ที่เหลือ เพื่อลดความร้อนที่คนรู้สึกได้",
      followup:
        "เปลี่ยน `applyDemandResponseCurve` ให้ขยาย comfort band แบบ gradual ตามระยะเวลาของ event แทนการขยายเต็มเพดานทันที และพิจารณาอุณหภูมิภายนอกประกอบการคำนวณ",
    },
    {
      slug: "alert-dispatcher-paging-storm",
      title: "Alert Dispatcher ส่ง Page ซ้ำจำนวนมากจาก Retry Bug",
      tags: ["alerting", "bug"],
      summary:
        "on-call วิศวกรได้รับ page เรื่องเดียวกันซ้ำมากกว่า 40 ครั้งภายใน 10 นาทีสำหรับ fault เดียว ทั้งที่ได้ acknowledge ไปตั้งแต่ครั้งแรก",
      investigation:
        "ตรวจ {{ref:module:alert-dispatcher}} พบว่า `suppressDuplicate` เช็คความซ้ำจาก `eventId` แต่ระบบต้นทางสร้าง `eventId` ใหม่ทุกครั้งที่ retry ส่ง event เดิม (แทนที่จะใช้ id เดิมซ้ำ) ทำให้ dedup logic มองว่าทุก retry เป็น event ใหม่เสมอ",
      cause:
        "module ต้นทางที่ retry การ publish event ไม่ได้ทำ idempotent id generation — สร้าง UUID ใหม่ทุกครั้งที่ retry แทนที่จะ reuse id เดิมของความพยายามครั้งแรก",
      resolution:
        "ปิดการแจ้งเตือนของ fault นี้ด้วยมือชั่วคราวระหว่างแก้ไข แล้วแก้ module ต้นทางให้ reuse `eventId` เดิมเมื่อ retry",
      followup:
        "เพิ่ม dedup ชั้นที่สองที่ {{ref:module:alert-dispatcher}} โดยเช็คจาก `zoneId` + `category` + ช่วงเวลาสั้นๆ ควบคู่กับ `eventId` ไม่พึ่ง idempotent id จากต้นทางอย่างเดียว",
    },
    {
      slug: "orphaned-fault-work-order-not-reopened",
      title: "งานซ่อมถูกปิดทั้งที่ Fault เดิมยังไม่หายจริง",
      tags: ["maintenance", "bug"],
      summary:
        "พนักงานชั้น 6 ร้องเรียนว่าห้องน้ำเซนเซอร์ไฟยังเสียเหมือนเดิม ทั้งที่ work order ก่อนหน้าถูกปิดไปแล้วว่าซ่อมเสร็จ",
      investigation:
        "ตรวจ {{ref:module:maintenance-scheduler}} พบว่า fault event ประเภทเดียวกันเกิดขึ้นอีกครั้งภายใน 6 ชั่วโมงหลังปิดงาน แต่ `reopenWorkOrder` ไม่เคยถูกเรียก — ระบบสร้าง flow สำหรับ fault ใหม่ปกติแทน",
      cause:
        "ช่างปิดงานจาก mobile app คนละเวอร์ชันกับที่มี logic เช็ค reopen window 24 ชั่วโมงตาม {{ref:policy:maintenance-work-order-dedup-policy}} — เวอร์ชัน mobile app ที่ยังไม่อัปเดตส่ง event ปิดงานแบบเก่าที่ไม่ trigger การเช็คนี้",
      resolution:
        "reopen work order เดิมด้วยมือ แล้วส่งช่างไปตรวจซ้ำ พบว่าเป็นสายไฟหลวมที่ครั้งแรกแก้ไม่หมด",
      followup:
        "บังคับอัปเดต mobile app เวอร์ชันเก่าที่ยังไม่รองรับ reopen logic ให้หมดก่อนสิ้นเดือน และเพิ่ม server-side validation ไม่พึ่งพา client version",
    },
    {
      slug: "damper-motor-hunting-incident",
      title: "มอเตอร์ Damper วิ่งค้างสลับทิศทางต่อเนื่อง (Hunting) จนพัง",
      tags: ["hvac", "hardware"],
      summary:
        "มอเตอร์ damper ของโซนชั้น 15 ไหม้เสียหลังพบว่าวิ่งสลับทิศทางเปิด-ปิดต่อเนื่องนานกว่า 3 ชั่วโมงโดยไม่มีใครสังเกต",
      investigation:
        "ตรวจ {{ref:module:hvac-controller}} พบว่า `resolveDamperPosition` คำนวณตำแหน่งใหม่ทุกครั้งที่มี telemetry เข้ามา (ทุก 2 วินาที) แทนที่จะรอให้ตำแหน่งก่อนหน้าไปถึงเป้าหมายจริงก่อน",
      cause:
        "การคำนวณตำแหน่งใหม่ถี่เกินไปโดยไม่รอ actuator ตอบสนองจริงทำให้เกิด feedback loop ที่มอเตอร์วิ่งสวนทางตัวเองซ้ำๆ (hunting) ซึ่งเป็นปัญหาคลาสสิกของ control loop ที่ไม่มี hysteresis เพียงพอ",
      resolution:
        "ทีมซ่อมบำรุงเปลี่ยนมอเตอร์ตัวที่ไหม้ แล้ววิศวกรเพิ่ม minimum interval ระหว่างคำสั่งปรับ damper ของโซนเดียวกันไม่ให้ถี่กว่าที่ actuator ตอบสนองทัน",
      followup:
        "ตรวจสอบโซนอื่นทั้งหมดว่ามีรูปแบบการคำนวณถี่คล้ายกันหรือไม่ และเพิ่ม metric เฝ้าระวังความถี่การสั่ง damper ต่อโซน",
    },
    {
      slug: "sensor-hub-network-partition-stale-occupied",
      title: "Network Partition ทำ Occupancy ค้างสถานะ Occupied ข้ามคืนทั้งชั้น",
      tags: ["occupancy", "network"],
      summary:
        "เช้าวันหนึ่งพบว่า HVAC ของชั้น 22 ทำงานเต็มกำลังทั้งคืนทั้งที่ไม่มีคนอยู่เลย ทำให้ใช้พลังงานเกินความจำเป็นไปมาก",
      investigation:
        "ตรวจ {{ref:module:occupancy-sensor-hub}} พบว่า network switch ที่เชื่อม sensor ชั้น 22 กับ gateway หลุดตั้งแต่ 18:30 ทำให้สถานะล่าสุดที่ค้างอยู่ในระบบคือ `occupied` (จากตอนพนักงานยังทำงานอยู่) และไม่มี event ใหม่มาเปลี่ยนสถานะเลยตลอดคืน",
      cause:
        "ระบบไม่มี timeout สำหรับสถานะ occupancy เอง — ถ้าไม่มี event ใหม่เข้ามาระบบจะเชื่อสถานะล่าสุดตลอดไปโดยไม่มีการหมดอายุ ต่างจาก sensor stale ของ hvac-controller ที่มี `STALE_SENSOR_THRESHOLD_MS` ชัดเจน",
      resolution:
        "ทีมเครือข่ายแก้ switch ที่หลุดกลับมาปกติ แล้วบังคับ reset สถานะ occupancy ของทุก sensor ในชั้น 22 ด้วยมือ",
      followup:
        "เพิ่ม staleness timeout ให้สถานะ occupancy เช่นเดียวกับที่ hvac-controller มีสำหรับ telemetry — ถ้าไม่มี event ใหม่เกินเวลาที่กำหนดให้ fallback เป็น `unknown` แทนการเชื่อค่าเดิมตลอดไป",
    },
    {
      slug: "gateway-db-failover-lockout",
      title: "Database Failover ของ Access Control ทำประตูปฏิเสธบัตรถูกต้องชั่วคราว",
      tags: ["access-control", "database"],
      summary:
        "ช่วงเช้าเร่งด่วนพนักงานจำนวนมากปัดบัตรแล้วประตูไม่เปิด ทั้งที่บัตรถูกต้องและยังไม่หมดอายุ",
      investigation:
        "ตรวจ {{ref:module:access-control-gateway}} พบว่า primary database ของ service นี้ failover ไป replica ระหว่างช่วงเวลานั้นพอดี และ `evaluateBadgeSwipe` ที่ query สิทธิ์ตอน cache miss ล้มเหลวเงียบๆ ระหว่าง failover สั้นๆ",
      cause:
        "ระบบตั้งค่า deny-by-default เมื่อ query database ล้มเหลว (fail closed) เพื่อความปลอดภัย แต่ไม่ได้แยกแยะระหว่าง \"บัตรไม่มีสิทธิ์จริง\" กับ \"query ล้มเหลวเพราะ infrastructure\" ทำให้ทุกคนที่ cache หมดอายุพอดีช่วงนั้นถูกปฏิเสธหมด",
      resolution:
        "failover เสร็จสมบูรณ์เองภายใน 90 วินาที ประตูกลับมาทำงานปกติ ทีมอาคารเปิดประตูด้วยมือช่วงสั้นๆ ระหว่างรอ",
      followup:
        "พิจารณาเพิ่ม grace period แบบ fail-open ระยะสั้นมากเฉพาะกรณี database error (ไม่ใช่ deny result ปกติ) โดยยังต้อง log ทุกครั้งที่เข้าเงื่อนไขนี้เพื่อ audit ทีหลัง เรื่องนี้ยังอยู่ระหว่างถกเถียงเรื่อง trade-off ความปลอดภัย",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/ATR-118-hvac-override-expiry`, `fix/ATR-142-fire-drill-egress-lock`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(access-control-gateway): แก้ deny-by-default ตอน db failover`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "การเปลี่ยน config ที่กระทบ deadband หรือ threshold ต้องมีคนที่สองยืนยันคืนค่าหลังทดสอบเสร็จเสมอ (ดูบทเรียนจาก {{ref:incident:chiller-deadband-short-cycling}}) และ logic ที่แตะ schedule ของ access-control-gateway ต้องมี test case ครอบคลุมประตูทางออกฉุกเฉินเสมอ" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `setZoneSetpoint`, `evaluateBadgeSwipe` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ทางกายภาพ", body: "`zoneId` รูปแบบ `<อาคาร>-<ชั้น>-<โซนย่อย>` เช่น `HQ-12-A`, `doorId` รูปแบบ `<zoneId>-DOOR-<เลข>` ต้องตรงกับ physical label บนอุปกรณ์จริงเสมอ" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ setpoint change ต้องมี `zoneId` เสมอ เพื่อไล่ log ข้าม service ได้ (energy-optimizer → hvac-controller → alert-dispatcher) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "fault ที่เกี่ยวกับ access-control หรือ fire safety log เป็น `error` เสมอแม้ business severity จะเป็น `warning` เพราะทีม on-call ต้อง grep เจอง่ายตอน incident" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`ATR_<DOMAIN>_<REASON>` เช่น `ATR_HVAC_SENSOR_STALE`, `ATR_ACCESS_SCHEDULE_CONFLICT` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`ATR_OCCUPANCY_SENSOR_OFFLINE`, `ATR_MAINT_WORKORDER_REOPENED`, `ATR_ENERGY_OVERRIDE_ACTIVE` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "simulation"],
      sections: [
        { heading: "Simulation ก่อนขึ้นจริง", body: "logic ที่กระทบ access-control หรือ fire safety ต้องผ่าน simulation test ครบทุก schedule type ก่อน merge เสมอ — บทเรียนจาก {{ref:incident:fire-drill-lockout-bug}} คือ schedule type ใหม่ที่ไม่ได้ทดสอบร่วมกับ emergency egress flag เจอ bug ไม่ทัน" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะ work order dedup ต้องมี test จำลอง event ซ้ำที่ casing ต่างกันเสมอ ตามบทเรียนจาก {{ref:incident:duplicate-work-order-flood}}" },
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
      slug: "building-zone-id-convention",
      title: "Building Zone ID Convention",
      tags: ["zone", "identifiers"],
      intro: "ทุก module ที่อ้างอิงพื้นที่ทางกายภาพต้องใช้รูปแบบ `zoneId` เดียวกันเป๊ะ — เอกสารนี้กำหนดรูปแบบกลางที่ {{ref:module:hvac-controller}}, {{ref:module:occupancy-sensor-hub}}, และ {{ref:module:access-control-gateway}} ต้องใช้ร่วมกัน",
      sections: [
        { heading: "รูปแบบ", body: "`<อาคาร>-<ชั้น>-<โซนย่อย>` เช่น `HQ-12-A` โดย `<อาคาร>` ใช้รหัสย่อ 2-4 ตัวอักษร ตัวพิมพ์ใหญ่ ตรงกับรหัสในระบบ property management ภายนอกเสมอ" },
        { heading: "การเปลี่ยนผัง", body: "ถ้าอาคารปรับผังชั้นวางใหม่จนโซนย่อยเปลี่ยน ห้ามเปลี่ยนความหมายของ `zoneId` เดิม — ต้อง deprecate แล้วสร้าง zoneId ใหม่เสมอ ดูขั้นตอนที่ {{ref:deployment:floor-plan-migration-runbook}}" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → simulation test (สำหรับ service ที่แตะฮาร์ดแวร์จริง) → deploy staging → smoke test → deploy production ทีละอาคารนำร่องก่อนขยายไปอาคารอื่น" },
        { heading: "Gate พิเศษ", body: "{{ref:module:access-control-gateway}} และ {{ref:module:hvac-controller}} ต้องผ่าน simulation test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความปลอดภัยโดยตรง" },
      ],
    },
    {
      slug: "sensor-heartbeat-timeout-tuning",
      title: "Sensor Heartbeat & Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (heartbeat/network) เท่านั้น ไม่ใช่ business rule เรื่อง stale sensor ของ HVAC — ดูเรื่องนั้นที่ {{ref:policy:hvac-setpoint-override-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| Occupancy sensor ping interval | 10s | firmware config |\n| Occupancy debounce | 8s | env `OCCUPANCY_DEBOUNCE_MS` |\n| HVAC telemetry stale threshold | 180s | env `HVAC_STALE_SENSOR_MS` |\n| API gateway → edge gateway | 5s | env `GATEWAY_EDGE_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "หลังเหตุการณ์ {{ref:incident:sensor-hub-network-partition-stale-occupied}} ทีมพบว่า occupancy state ไม่มี staleness timeout เลย ต่างจาก HVAC telemetry ที่มีอยู่แล้ว เป็นช่องว่างที่กำลังแก้ไข" },
      ],
    },
    {
      slug: "floor-plan-migration-runbook",
      title: "Floor Plan Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่ออาคารปรับผังพื้นที่ใหม่ (ย้ายผนัง, รวม/แยกห้องประชุม) ต้อง migrate zone mapping ทั้งหมดใน {{ref:module:hvac-controller}}, {{ref:module:occupancy-sensor-hub}}, และ {{ref:module:access-control-gateway}} พร้อมกัน" },
        { heading: "ขั้นตอน", body: "1) deprecate zoneId เดิมตาม {{ref:convention:building-zone-id-convention}} 2) สร้าง zoneId ใหม่พร้อม mapping sensor/actuator ที่ผูกกับพื้นที่จริง 3) ทดสอบ occupancy และ HVAC ของโซนใหม่อย่างน้อย 3 วันก่อนปิด zoneId เดิมถาวร" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = กระทบความปลอดภัยทางกายภาพหรือหยุดทั้งอาคาร, Sev2 = กระทบบางโซน/บาง service, Sev3 = กระทบเล็กน้อยไม่ถึงพนักงานปลายทาง" },
        { heading: "กรณี near-miss ด้านความปลอดภัย", body: "ทุกเหตุการณ์ที่เกี่ยวกับ {{ref:module:access-control-gateway}} ในบริบททางออกฉุกเฉิน แม้จะไม่มีใครติดอยู่จริง ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "sensor offline rate เกิน 5% ของอาคารใน 10 นาที, work order เปิดค้างเกิน 72 ชั่วโมงโดยไม่มีคนรับ, door event `access_denied` ซ้ำเกิน 3 ครั้งใน 1 นาทีที่ประตูเดียวกัน (สงสัย tailgate หรือบัตรมีปัญหา)" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ occupancy sensor offline rate พุ่งขึ้นผิดปกติ หรือ access-control-gateway ปฏิเสธบัตรถูกต้องเพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:occupancy-sensor-firmware-mass-offline}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| hvac-controller | 2 | 6 | CPU > 65% (latency-sensitive เพราะสั่งฮาร์ดแวร์โดยตรง) |\n| occupancy-sensor-hub | 2 | 8 | ingest rate > 5000 event/s |\n| energy-optimizer | 1 | 3 | batch job ไม่ latency-sensitive |" },
        { heading: "ข้อจำกัดทางกายภาพ", body: "จำนวน edge gateway ต่ออาคารคงที่ตามฮาร์ดแวร์ที่ติดตั้งจริง scale ไม่ได้แบบซอฟต์แวร์ — การ scale service ฝั่ง cloud ช่วยได้แค่ระดับการประมวลผล ไม่ได้เพิ่มแบนด์วิดท์ของ edge gateway ดู {{ref:policy:building-zone-priority-policy}} สำหรับข้อจำกัดคล้ายกันฝั่งไฟฟ้าสำรอง" },
      ],
    },
    {
      slug: "seasonal-mode-transition-runbook",
      title: "Seasonal HVAC Mode Transition Runbook",
      tags: ["hvac", "seasonal", "runbook"],
      intro: "ขั้นตอนการเปลี่ยนโหมดหลักของระบบทำความเย็น/ทำความร้อนทั้งพอร์ตของอาคาร ซึ่งเกี่ยวโยงกับ {{ref:policy:after-hours-hvac-setback-policy}} โดยตรง",
      sections: [
        { heading: "ก่อนเปลี่ยนโหมด", body: "ต้องตรวจสอบว่าไม่มี manual override ค้างอยู่จำนวนมากผิดปกติในทุกอาคารก่อนเปลี่ยนโหมดหลัก เพราะ override ที่ตั้งไว้ตอนโหมดเดิมอาจไม่เหมาะกับโหมดใหม่" },
        { heading: "ระหว่างเปลี่ยนโหมด", body: "เปลี่ยนทีละอาคารนำร่องก่อน เฝ้าดู fault rate และข้อร้องเรียนอย่างน้อย 24 ชั่วโมงก่อนขยายไปอาคารอื่นทั้งพอร์ต เหมือนหลักการ staged rollout ของ {{ref:policy:sensor-firmware-update-policy}}" },
      ],
    },
  ],
};
