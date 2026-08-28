import type { DomainProfile } from "../types.js";

// DriveLog — ระบบ Telematics สำหรับประกันภัยรถยนต์แบบ usage-based (telematics)
// เป็นระบบสมมติล้วนๆ ไม่เกี่ยวข้องกับ payment/refund/order ของ PayFlow เลย — distractor domain
export const telematics: DomainProfile = {
  id: "telematics",
  displayName: "DriveLog — ระบบ Telematics สำหรับประกันภัยรถยนต์",
  summary: [
    "DriveLog คือระบบ telematics สำหรับผลิตภัณฑ์ประกันภัยรถยนต์แบบ usage-based เก็บข้อมูลการขับขี่จากอุปกรณ์ OBD-II ที่ติดตั้งในรถ (ตำแหน่ง GPS, ความเร็ว, ความเร่ง, การเบรกกะทันหัน) แล้วคำนวณคะแนนพฤติกรรมการขับขี่เพื่อปรับเบี้ยประกันให้เหมาะสมกับพฤติกรรมจริงของผู้ขับแต่ละคน แทนอัตราเบี้ยประกันแบบเหมารวม",
    "ทีมวิศวกรรมออกแบบระบบให้แยกความรับผิดชอบระหว่าง 'การเก็บข้อมูลดิบ' กับ 'การตัดสินใจทางธุรกิจ' (คะแนน, เบี้ยประกัน, การแจ้งเตือนอุบัติเหตุ) อย่างชัดเจน เพราะข้อมูลดิบจาก GPS/sensor มีความไม่แน่นอนสูง (สัญญาณหาย, drift) ในขณะที่การตัดสินใจทางธุรกิจต้องมีความแน่นอนและอธิบายได้เพื่อความยุติธรรมต่อผู้ขับ",
  ],
  domainTags: ["telematics", "drivelog"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:trip-collector}} เป็นเจ้าของข้อมูล GPS trace ดิบทั้งหมด ส่วน {{ref:module:driving-scorer}} เก็บแค่คะแนนที่คำนวณแล้ว ไม่เก็บ raw trace ซ้ำ",
    "{{ref:module:premium-adjuster}} ไม่คำนวณคะแนนเอง อ่านผลจาก {{ref:module:driving-scorer}} เท่านั้น เพื่อให้มีจุดเดียวที่ตัดสินใจว่าพฤติกรรมการขับขี่หนึ่งครั้งได้คะแนนเท่าไหร่ ไม่ให้ logic การให้คะแนนกระจายอยู่หลายที่จนไม่สอดคล้องกัน",
  ],
  apiGatewayNote: [
    "คำขอจากแอปมือถือของผู้ขับเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ policyholder ID ไปกับทุก request ก่อนส่งต่อให้ service ที่เกี่ยวข้อง",
    "อุปกรณ์ OBD-II ส่งข้อมูลเข้ามาผ่าน endpoint แยกที่ใช้ protocol แบบ binary compact เพื่อประหยัด bandwidth เพราะอุปกรณ์บางรุ่นเชื่อมต่อผ่านเครือข่ายมือถือที่มีข้อจำกัดด้านปริมาณข้อมูล",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:trip-collector}} ดูแล ได้แก่ `gps_traces` (time-series), `trips` (สรุปแต่ละเที่ยว), และ `harsh_events`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `gps_traces` | trip-collector | time-series เก็บทุกจุดพิกัดดิบ ไม่ aggregate ล่วงหน้า |\n| `driving_scores` | driving-scorer | ไม่มี FK ตรงไป trips ใช้ tripId แบบ soft reference |\n| `premium_adjustments` | premium-adjuster | เก็บประวัติการปรับเบี้ยทุกครั้ง ไม่เขียนทับของเดิม |\n| `accident_alerts` | accident-detector | append-only เก็บทุกครั้งที่ตรวจพบสัญญาณอุบัติเหตุไม่ว่ายืนยันจริงหรือไม่ |",
    "ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก driving_score มี tripId ที่มีอยู่จริง)",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `trip.completed`, `harsh_event.detected`, `score.recalculated`, `accident.suspected`, `device.heartbeat_missed` — {{ref:module:driving-scorer}} subscribe `trip.completed` เพื่อคำนวณคะแนนใหม่ทุกครั้งที่เที่ยวการเดินทางหนึ่งจบลง",
    "{{ref:module:accident-detector}} subscribe `harsh_event.detected` แบบ real-time เพื่อประเมินว่าเหตุการณ์นั้นมีแนวโน้มเป็นอุบัติเหตุจริงหรือไม่ทันที ไม่รอประมวลผลแบบ batch",
  ],
  modules: [
    {
      slug: "trip-collector",
      name: "trip-collector",
      tags: ["trip", "module", "core"],
      description:
        "เก็บข้อมูล GPS trace ดิบจากอุปกรณ์ OBD-II ทุกจุดพิกัด รวมกลุ่มเป็น 'เที่ยวการเดินทาง' (trip) ตามช่วงเวลาที่รถวิ่งต่อเนื่อง เป็น service เดียวที่ตัดสินใจว่าจุดข้อมูลไหนอยู่ในเที่ยวไหน แยกออกมาเป็น service อิสระเพราะ throughput ของข้อมูล GPS สูงกว่า service อื่นในระบบมาก",
      functions: [
        { sig: "ingestGpsPoint(deviceId: string, point: GpsPoint): Promise<void>", desc: "รับจุดพิกัด GPS 1 จุด บันทึกเข้า trip ปัจจุบันหรือเริ่ม trip ใหม่" },
        { sig: "finalizeTrip(deviceId: string): Promise<string>", desc: "ปิดเที่ยวการเดินทางปัจจุบันเมื่อรถหยุดนิ่งนานเกินเกณฑ์ คืน tripId" },
        { sig: "getTripDetail(tripId: string): Promise<TripDetail>", desc: "ดึงรายละเอียดเที่ยวการเดินทางหนึ่งรวม harsh event ที่เกิดขึ้น" },
      ],
      stateFlow: "in_progress → finalized — ดู {{ref:policy:harsh-event-sensitivity-threshold-policy}} สำหรับเกณฑ์การตรวจจับเหตุการณ์ระหว่างเที่ยว",
      relatedNotes:
        "ทุกครั้งที่ `finalizeTrip` สำเร็จ publish event `trip.completed` ให้ {{ref:module:driving-scorer}} subscribe เพื่อคำนวณคะแนนใหม่ทันที",
      internals: {
        constants: [
          { name: "TRIP_IDLE_TIMEOUT_MIN", value: "5" },
          { name: "GPS_TRACE_RETENTION_DAYS", value: "365" },
        ],
        typeSnippet:
          "interface GpsPoint {\n  deviceId: string;\n  timestamp: string;\n  lat: number;\n  lng: number;\n  speedKmh: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการแบ่งเที่ยวการเดินทางที่ {{ref:policy:harsh-event-sensitivity-threshold-policy}}",
      },
    },
    {
      slug: "driving-scorer",
      name: "driving-scorer",
      tags: ["scoring", "module", "core"],
      description:
        "คำนวณคะแนนพฤติกรรมการขับขี่จากข้อมูลเที่ยวการเดินทางที่จบแล้ว เป็น service เดียวที่ตัดสินใจคะแนนทั้งหมด ไม่มี service อื่นคำนวณคะแนนซ้ำเอง เพื่อให้คะแนนที่ใช้ปรับเบี้ยประกันมีที่มาเดียวที่ตรวจสอบย้อนหลังได้เสมอ",
      functions: [
        { sig: "calculateTripScore(tripId: string): Promise<TripScore>", desc: "คำนวณคะแนนของเที่ยวการเดินทางหนึ่ง" },
        { sig: "recalculateOverallScore(policyholderId: string): Promise<OverallScore>", desc: "คำนวณคะแนนรวมของผู้ขับใหม่จากทุกเที่ยวในช่วงเวลาที่กำหนด" },
        { sig: "getScoreHistory(policyholderId: string, range: TimeRange): Promise<TripScore[]>", desc: "คืนประวัติคะแนนย้อนหลัง" },
      ],
      stateFlow: "pending → calculated — คะแนนที่คำนวณแล้วไม่ถูกลบทิ้ง แม้จะมีการคำนวณคะแนนรวมใหม่ในภายหลัง",
      relatedNotes:
        "{{ref:module:premium-adjuster}} อ่านผลจาก service นี้เท่านั้น ไม่คำนวณคะแนนเอง ดู {{ref:policy:score-recalculation-frequency-policy}}",
      internals: {
        constants: [
          { name: "HARSH_BRAKING_PENALTY_POINTS", value: "15" },
          { name: "SMOOTH_TRIP_BONUS_POINTS", value: "5" },
        ],
        typeSnippet:
          "interface TripScore {\n  tripId: string;\n  score: number;\n  harshEventCount: number;\n  calculatedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องความถี่การคำนวณใหม่ที่ {{ref:policy:score-recalculation-frequency-policy}}",
      },
    },
    {
      slug: "premium-adjuster",
      name: "premium-adjuster",
      tags: ["premium", "module"],
      description:
        "ปรับเบี้ยประกันตามคะแนนพฤติกรรมการขับขี่ที่คำนวณได้ อ่านผลจาก driving-scorer เท่านั้น ไม่คำนวณคะแนนเอง แยกออกมาเป็น service อิสระเพราะการปรับเบี้ยมีกฎทางธุรกิจและข้อจำกัดทางกฎหมายที่ซับซ้อนกว่าการคำนวณคะแนนดิบมาก",
      functions: [
        { sig: "calculateAdjustment(policyholderId: string, score: OverallScore): Promise<PremiumAdjustment>", desc: "คำนวณการปรับเบี้ยประกันตามคะแนนล่าสุด" },
        { sig: "applyAdjustment(adjustmentId: string): Promise<void>", desc: "นำการปรับเบี้ยไปใช้จริงกับกรมธรรม์" },
        { sig: "getAdjustmentHistory(policyholderId: string): Promise<PremiumAdjustment[]>", desc: "คืนประวัติการปรับเบี้ยทั้งหมด" },
      ],
      relatedNotes:
        "การปรับเบี้ยแต่ละครั้งมีเพดานสูงสุดตาม {{ref:policy:premium-adjustment-cap-policy}} ไม่ปรับเกินเพดานไม่ว่าคะแนนจะดีหรือแย่แค่ไหนก็ตาม",
    },
    {
      slug: "accident-detector",
      name: "accident-detector",
      tags: ["accident", "module", "core"],
      description:
        "ตรวจจับสัญญาณที่บ่งชี้ว่าอาจเกิดอุบัติเหตุแบบ real-time จากรูปแบบความเร่ง/การหยุดกะทันหัน แจ้งเตือนทีมช่วยเหลือฉุกเฉินและเก็บหลักฐานสำหรับการเคลมประกันในอนาคต ต้องทำงานแบบ real-time เพราะการช่วยเหลือที่ล่าช้าอาจมีผลต่อความปลอดภัยของผู้ขับจริง",
      functions: [
        { sig: "evaluateHarshEvent(event: HarshEvent): Promise<AccidentAssessment>", desc: "ประเมินว่าเหตุการณ์ความเร่งผิดปกติมีแนวโน้มเป็นอุบัติเหตุจริงหรือไม่" },
        { sig: "raiseAccidentAlert(tripId: string, evidence: AccidentEvidence): Promise<string>", desc: "แจ้งเตือนทีมช่วยเหลือฉุกเฉิน คืน alertId" },
        { sig: "retainEvidence(alertId: string): Promise<void>", desc: "เก็บหลักฐาน (GPS trace ช่วงเกิดเหตุ, sensor data) ไว้สำหรับการเคลมประกัน" },
      ],
      relatedNotes:
        "ดู {{ref:policy:accident-evidence-retention-policy}} สำหรับระยะเวลาเก็บหลักฐาน — หลักฐานนี้อาจถูกใช้อ้างอิงในกระบวนการเคลมที่เกิดขึ้นหลายเดือนหลังเหตุการณ์จริง",
      internals: {
        constants: [
          { name: "ACCIDENT_DECELERATION_THRESHOLD_G", value: "4.0" },
          { name: "ACCIDENT_ALERT_CONFIRM_WINDOW_SEC", value: "30" },
        ],
        typeSnippet:
          "interface AccidentAssessment {\n  isLikelyAccident: boolean;\n  confidenceScore: number;\n  decelerationG: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการเก็บหลักฐานที่ {{ref:policy:accident-evidence-retention-policy}}",
      },
    },
    {
      slug: "device-provisioner",
      name: "device-provisioner",
      tags: ["device", "module"],
      description:
        "จัดการการติดตั้งและเชื่อมโยงอุปกรณ์ OBD-II กับกรมธรรม์ประกันภัย ตรวจสอบสถานะ heartbeat ของอุปกรณ์ว่ายังทำงานปกติหรือขาดการเชื่อมต่อ แยกออกมาเป็น service อิสระเพราะกระบวนการติดตั้งอุปกรณ์ทางกายภาพมีขั้นตอนต่างจาก service ที่ประมวลผลข้อมูลล้วนๆ",
      functions: [
        { sig: "provisionDevice(deviceId: string, policyholderId: string): Promise<void>", desc: "เชื่อมโยงอุปกรณ์กับกรมธรรม์ เริ่มสถานะ pending" },
        { sig: "confirmActivation(deviceId: string): Promise<void>", desc: "ยืนยันว่าอุปกรณ์เริ่มส่งข้อมูลจริงแล้ว เปลี่ยนสถานะเป็น active" },
        { sig: "checkHeartbeat(deviceId: string): Promise<DeviceStatus>", desc: "ตรวจสถานะการเชื่อมต่อล่าสุดของอุปกรณ์" },
      ],
      stateFlow: "pending → active → inactive (heartbeat timeout) — ดู {{ref:policy:device-heartbeat-timeout-policy}}",
      relatedNotes:
        "ถ้าอุปกรณ์ไม่ active ภายในเวลาที่กำหนดหลัง provision จะแจ้งเตือนทีมสนับสนุนให้ติดต่อผู้ขับตรวจสอบการติดตั้ง",
    },
    {
      slug: "geofence-monitor",
      name: "geofence-monitor",
      tags: ["geofence", "module"],
      description:
        "ตรวจสอบว่าตำแหน่งรถอยู่ในเขตพื้นที่ที่กำหนด (geofence) หรือไม่ ใช้สำหรับผลิตภัณฑ์ประกันที่มีเงื่อนไขพื้นที่ใช้งาน (เช่น ประกันสำหรับรถที่ใช้งานในเขตเมืองเท่านั้น) แจ้งเตือนเมื่อรถออกนอกเขตที่กำหนด",
      functions: [
        { sig: "checkGeofence(deviceId: string, point: GpsPoint): Promise<GeofenceStatus>", desc: "ตรวจสอบว่าตำแหน่งปัจจุบันอยู่ในเขต geofence ที่กำหนดหรือไม่" },
        { sig: "raiseGeofenceAlert(policyholderId: string, deviceId: string): Promise<void>", desc: "แจ้งเตือนเมื่อรถออกนอกเขตที่กำหนด" },
        { sig: "updateGeofenceZones(policyholderId: string, zones: GeofenceZone[]): Promise<void>", desc: "อัปเดตเขตพื้นที่ที่กำหนดสำหรับกรมธรรม์หนึ่ง" },
      ],
      relatedNotes:
        "ไม่ trigger การแจ้งเตือนทุกครั้งที่ออกนอกเขต มี cooldown ตาม {{ref:policy:geofence-alert-cooldown-policy}} เพื่อไม่ให้แจ้งเตือนถี่เกินไปเมื่อรถวิ่งใกล้ขอบเขตพอดี",
    },
  ],
  envVarGroups: [
    {
      service: "trip-collector-service",
      vars: [
        { name: "TRIP_IDLE_TIMEOUT_MIN", example: "5", note: "" },
        { name: "GPS_TRACE_RETENTION_DAYS", example: "365", note: "" },
      ],
    },
    {
      service: "driving-scorer-service",
      vars: [
        { name: "HARSH_BRAKING_PENALTY_POINTS", example: "15", note: "ดู {{ref:policy:harsh-event-sensitivity-threshold-policy}}" },
        { name: "SMOOTH_TRIP_BONUS_POINTS", example: "5", note: "" },
      ],
    },
    {
      service: "accident-detector-service",
      vars: [
        { name: "ACCIDENT_DECELERATION_THRESHOLD_G", example: "4.0", note: "" },
        { name: "ACCIDENT_ALERT_CONFIRM_WINDOW_SEC", example: "30", note: "" },
      ],
    },
    {
      service: "device-provisioner-service",
      vars: [
        { name: "DEVICE_HEARTBEAT_TIMEOUT_MIN", example: "60", note: "ดู {{ref:policy:device-heartbeat-timeout-policy}}" },
        { name: "PROVISIONING_ACTIVATION_WINDOW_DAYS", example: "14", note: "" },
      ],
    },
  ],
  policies: [
    {
      slug: "harsh-event-sensitivity-threshold-policy",
      title: "นโยบายเกณฑ์ความไวการตรวจจับเหตุการณ์รุนแรง",
      tags: ["scoring", "policy"],
      isPrimary: true,
      intro: [
        "การเบรกกะทันหัน เร่งกะทันหัน หรือเลี้ยวรุนแรง จะถูกนับเป็น harsh event เมื่อค่าความเร่ง/ความหน่วงเกินเกณฑ์ที่กำหนด — เกณฑ์นี้ปรับตามความเร็วขณะเกิดเหตุการณ์ เพราะการเบรกแรงที่ความเร็วต่ำมีความเสี่ยงต่างจากที่ความเร็วสูงมาก",
        "harsh event ทุกครั้งถูกบันทึกไว้ในรายละเอียดเที่ยวการเดินทาง แต่ไม่ได้แปลว่าทุก harsh event จะถูกหักคะแนนเท่ากัน — ดู {{ref:module:driving-scorer}} สำหรับการคำนวณผลกระทบต่อคะแนนจริง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อเป็นการหลบหลีกฉุกเฉิน",
        tags: ["scoring", "edge-case"],
        body: [
          "ถ้า harsh event เกิดขึ้นพร้อมกับสัญญาณว่าเป็นการหลบหลีกอันตราย (เช่น เบรกกะทันหันตามด้วยการเลี้ยวหลบทันที) ระบบจะไม่หักคะแนนเต็มจำนวน เพราะพฤติกรรมนี้อาจเป็นการขับขี่อย่างระมัดระวังเพื่อหลีกเลี่ยงอุบัติเหตุ ไม่ใช่การขับขี่ประมาท",
          "การแยกแยะนี้ใช้ pattern การเปลี่ยนทิศทางร่วมกับความเร่งเป็นเกณฑ์ ไม่ใช่การตัดสินใจของมนุษย์ทีละกรณี เพื่อให้เกณฑ์เดียวกันใช้กับผู้ขับทุกคนอย่างสม่ำเสมอ",
        ],
      },
    },
    {
      slug: "score-recalculation-frequency-policy",
      title: "นโยบายความถี่การคำนวณคะแนนใหม่",
      tags: ["scoring", "policy"],
      isPrimary: true,
      intro: [
        "คะแนนของแต่ละเที่ยวการเดินทางคำนวณทันทีที่เที่ยวนั้นจบ (`trip.completed`) ส่วนคะแนนรวมของผู้ขับคำนวณใหม่ทุกสัปดาห์จากเที่ยวการเดินทางในช่วง 90 วันล่าสุด ไม่ใช้ข้อมูลเก่ากว่านั้นเพราะพฤติกรรมการขับขี่เปลี่ยนแปลงได้ตามเวลา",
        "คะแนนรวมที่คำนวณแล้วจะไม่ถูกคำนวณใหม่ย้อนหลังโดยอัตโนมัติแม้จะพบว่า trip เก่ามีข้อมูลผิดพลาด เพื่อรักษาความสอดคล้องของประวัติคะแนนที่ใช้อ้างอิงการปรับเบี้ยไปแล้ว การแก้ไขย้อนหลังต้องผ่านขั้นตอนพิเศษเท่านั้น",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อพบข้อมูลผิดปกติชัดเจน",
        tags: ["scoring", "edge-case"],
        body: [
          "ถ้าตรวจพบว่าข้อมูลเที่ยวการเดินทางผิดปกติชัดเจน (เช่น GPS drift ทำให้ดูเหมือนขับขี่ด้วยความเร็วเกินความเป็นไปได้ทางกายภาพ) เที่ยวนั้นจะถูกคัดออกจากการคำนวณคะแนนรวมโดยไม่ต้องรอการยืนยันด้วยมือ เพื่อไม่ให้ข้อมูลผิดพลาดกระทบเบี้ยประกันของผู้ขับ",
          "การคัดออกอัตโนมัตินี้บันทึกเหตุผลไว้เสมอและแจ้งทีมตรวจสอบให้ทบทวนเป็นระยะ เพื่อป้องกันไม่ให้เกณฑ์การคัดออกอัตโนมัติกลายเป็นช่องทางที่ผู้ขับใช้หลีกเลี่ยงการหักคะแนนจากพฤติกรรมจริง",
        ],
      },
    },
    {
      slug: "premium-adjustment-cap-policy",
      title: "นโยบายเพดานการปรับเบี้ยประกัน",
      tags: ["premium", "policy"],
      isPrimary: true,
      intro: [
        "การปรับเบี้ยประกันในแต่ละรอบมีเพดานสูงสุดไม่เกิน 20% ของเบี้ยปัจจุบันไม่ว่าจะปรับขึ้นหรือลง เพื่อไม่ให้ผู้ขับเผชิญการเปลี่ยนแปลงเบี้ยที่รุนแรงเกินไปในครั้งเดียว แม้คะแนนจะเปลี่ยนแปลงมากก็ตาม",
        "การปรับเบี้ยที่เกินเพดานจะถูกทยอยปรับในหลายรอบถัดไปแทนการปรับครั้งเดียวจนครบ เพื่อให้ผู้ขับมีเวลาปรับตัวและเข้าใจความเชื่อมโยงระหว่างพฤติกรรมกับเบี้ยที่เปลี่ยนแปลง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อพบพฤติกรรมเสี่ยงร้ายแรง",
        tags: ["premium", "edge-case"],
        body: [
          "ถ้าตรวจพบพฤติกรรมเสี่ยงร้ายแรงซ้ำหลายครั้ง (เช่น ขับเร็วเกินกฎหมายกำหนดมากอย่างต่อเนื่อง) ทีมประเมินความเสี่ยงมีสิทธิ์ปรับเบี้ยเกินเพดานปกติได้ แต่ต้องผ่านการอนุมัติจากผู้จัดการความเสี่ยงก่อนเสมอ ไม่ใช่ระบบตัดสินใจปรับเกินเพดานเองอัตโนมัติ",
          "การปรับเกินเพดานทุกครั้งต้องแจ้งผู้ขับพร้อมเหตุผลชัดเจนและหลักฐานที่ใช้อ้างอิง เพื่อความโปร่งใสและเปิดโอกาสให้ผู้ขับโต้แย้งได้ถ้าเห็นว่าไม่เป็นธรรม",
        ],
      },
    },
    {
      slug: "accident-evidence-retention-policy",
      title: "นโยบายการเก็บรักษาหลักฐานอุบัติเหตุ",
      tags: ["accident", "policy"],
      isPrimary: true,
      intro: [
        "หลักฐานที่เก็บเมื่อตรวจพบสัญญาณอุบัติเหตุ (GPS trace ช่วงเกิดเหตุ, ความเร่ง, ภาพจากกล้องถ้ามี) ต้องเก็บรักษาไว้อย่างน้อย 3 ปีเพื่อรองรับกระบวนการเคลมประกันที่อาจใช้เวลานานกว่าจะสรุปผล",
        "หลักฐานที่เกี่ยวข้องกับคดีที่อยู่ระหว่างการดำเนินคดีทางกฎหมายจะไม่ถูกลบแม้จะเกิน 3 ปีแล้ว จนกว่าคดีจะสิ้นสุดและได้รับการยืนยันจากทีมกฎหมายว่าสามารถลบได้",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อสัญญาณอุบัติเหตุเป็น False Positive",
        tags: ["accident", "edge-case"],
        body: [
          "ถ้าสัญญาณอุบัติเหตุถูกยืนยันว่าเป็น false positive (เช่น รถกระแทกหลุมบ่อรุนแรงแต่ไม่มีอุบัติเหตุจริง) หลักฐานยังคงถูกเก็บไว้ตามระยะเวลาปกติเช่นกัน ไม่ลบทิ้งทันที เพราะข้อมูลนี้มีประโยชน์ในการปรับปรุงความแม่นยำของอัลกอริทึมตรวจจับในอนาคต",
          "หลักฐานที่เป็น false positive จะถูก flag แยกจากหลักฐานที่ยืนยันเป็นอุบัติเหตุจริง เพื่อไม่ให้ปนกันในการวิเคราะห์เชิงสถิติหรือการอ้างอิงระหว่างกระบวนการเคลม",
        ],
      },
    },
    {
      slug: "device-heartbeat-timeout-policy",
      title: "นโยบายเวลาหมดอายุ Heartbeat อุปกรณ์",
      tags: ["device", "policy"],
      isPrimary: true,
      intro: [
        "อุปกรณ์ที่ไม่ส่ง heartbeat ภายใน `DEVICE_HEARTBEAT_TIMEOUT_MIN` นาทีจะถูกเปลี่ยนสถานะเป็น inactive และแจ้งเตือนทีมสนับสนุนให้ติดต่อผู้ขับตรวจสอบ ไม่ปล่อยให้อุปกรณ์ดูเหมือน active ทั้งที่ขาดการเชื่อมต่อไปแล้ว",
        "ช่วงเวลาที่อุปกรณ์ inactive จะไม่ถูกนับเป็นช่วงที่ผู้ขับ 'ไม่ขับรถเลย' สำหรับการคำนวณคะแนน แต่ถูก flag แยกเป็น 'ไม่มีข้อมูล' เพื่อไม่ให้กระทบคะแนนในทางที่ไม่เป็นธรรมต่อผู้ขับ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับพื้นที่สัญญาณอ่อน",
        tags: ["device", "edge-case"],
        body: [
          "พื้นที่ที่ทราบล่วงหน้าว่าสัญญาณเครือข่ายมือถืออ่อนหรือไม่มีสัญญาณเป็นประจำ (เช่น อุโมงค์ยาว พื้นที่ชนบทห่างไกล) จะได้รับการยกเว้นไม่ให้อุปกรณ์ถูกเปลี่ยนสถานะเป็น inactive ทันทีที่ heartbeat ขาดหาย แต่รอนานกว่าปกติก่อนแจ้งเตือน",
          "รายชื่อพื้นที่สัญญาณอ่อนนี้ต้องได้รับการทบทวนเป็นระยะเพราะโครงสร้างพื้นฐานเครือข่ายมือถือพัฒนาต่อเนื่อง พื้นที่ที่เคยสัญญาณอ่อนอาจดีขึ้นแล้วในภายหลัง",
        ],
      },
    },
    {
      slug: "geofence-alert-cooldown-policy",
      title: "นโยบายระยะเวลา Cooldown การแจ้งเตือน Geofence",
      tags: ["geofence", "policy"],
      isPrimary: true,
      intro: [
        "การแจ้งเตือนเมื่อรถออกนอกเขต geofence มี cooldown อย่างน้อย 30 นาทีต่อกรมธรรม์หนึ่ง เพื่อไม่ให้แจ้งเตือนถี่เกินไปเมื่อรถวิ่งใกล้ขอบเขตพอดีแล้วเข้า-ออกสลับกันหลายรอบ",
        "การกลับเข้าเขตที่กำหนดหลังออกนอกเขตไม่ trigger การแจ้งเตือนแยกต่างหาก มีแค่สรุปสถานะปัจจุบันเมื่อผู้ขับเปิดแอปดูเท่านั้น",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Geofence ที่เกี่ยวข้องกับความปลอดภัย",
        tags: ["geofence", "edge-case"],
        body: [
          "geofence ที่กำหนดไว้เพื่อเหตุผลความปลอดภัย (เช่น เขตห้ามเข้าเพราะความเสี่ยงสูง ไม่ใช่แค่เงื่อนไขกรมธรรม์ทั่วไป) ไม่มี cooldown เลย แจ้งเตือนทุกครั้งที่เข้าเขตไม่ว่าจะเพิ่งแจ้งเตือนไปเมื่อไหร่ก็ตาม เพราะความเสี่ยงด้านความปลอดภัยสำคัญกว่าความน่ารำคาญจากการแจ้งเตือนถี่",
          "การแยกประเภท geofence ว่าเป็นเงื่อนไขกรมธรรม์ปกติหรือเกี่ยวข้องกับความปลอดภัยต้องระบุชัดเจนตอนสร้าง ไม่มีการเดาจากบริบทหรือชื่อเขตพื้นที่",
        ],
      },
    },
    {
      slug: "trip-boundary-detection-policy",
      title: "นโยบายการแบ่งเที่ยวการเดินทาง",
      tags: ["trip", "policy"],
      isPrimary: false,
      intro: [
        "เที่ยวการเดินทางใหม่เริ่มเมื่อรถเริ่มเคลื่อนที่หลังจากหยุดนิ่งเกิน `TRIP_IDLE_TIMEOUT_MIN` นาที และจบเมื่อรถหยุดนิ่งต่อเนื่องเกินเวลาเดียวกัน",
        "การจอดติดไฟแดงหรือรถติดที่หยุดนิ่งไม่นานพอจะไม่ถูกนับเป็นการจบเที่ยว ยังคงเป็นเที่ยวเดียวกันต่อเนื่อง เพื่อไม่ให้การขับขี่ปกติถูกตัดแบ่งเป็นหลายเที่ยวย่อยโดยไม่จำเป็น",
      ],
    },
    {
      slug: "provisioning-activation-window-policy",
      title: "นโยบายกรอบเวลาการเปิดใช้งานอุปกรณ์",
      tags: ["device", "policy"],
      isPrimary: false,
      intro: [
        "อุปกรณ์ที่ provision แล้วต้องเริ่มส่งข้อมูลจริงภายใน `PROVISIONING_ACTIVATION_WINDOW_DAYS` วัน ถ้าเกินกำหนดจะถูกยกเลิกการเชื่อมโยงและแจ้งทีมสนับสนุนติดต่อผู้ขับเพื่อตรวจสอบการติดตั้ง",
        "การยกเลิกการเชื่อมโยงไม่ได้แปลว่ากรมธรรม์ยกเลิก เป็นเพียงสถานะอุปกรณ์เท่านั้น ผู้ขับยังสามารถขอ provision อุปกรณ์ใหม่ได้เสมอถ้าอุปกรณ์เดิมมีปัญหา",
      ],
    },
    {
      slug: "score-appeal-process-policy",
      title: "นโยบายกระบวนการอุทธรณ์คะแนน",
      tags: ["scoring", "policy"],
      isPrimary: false,
      intro: [
        "ผู้ขับสามารถอุทธรณ์คะแนนที่เห็นว่าไม่เป็นธรรมได้ผ่านแอป โดยระบบจะแสดงรายละเอียด trip และ harsh event ที่เกี่ยวข้องให้ตรวจสอบประกอบการอุทธรณ์",
        "การอุทธรณ์ที่ทีมตรวจสอบเห็นว่าสมเหตุสมผล (เช่น GPS drift ชัดเจน) จะปรับคะแนนของ trip นั้นและคำนวณคะแนนรวมใหม่ผ่านขั้นตอนพิเศษ ไม่ใช่การปรับคะแนนโดยตรงที่ข้ามกระบวนการคำนวณปกติ",
      ],
    },
    {
      slug: "multi-driver-vehicle-attribution-policy",
      title: "นโยบายการระบุผู้ขับเมื่อมีหลายคนใช้รถคันเดียว",
      tags: ["scoring", "policy"],
      isPrimary: false,
      intro: [
        "รถที่มีผู้ขับหลายคนใช้ร่วมกัน (เช่น สมาชิกครอบครัว) ต้องมีการระบุตัวตนผู้ขับก่อนเริ่มแต่ละเที่ยวผ่านแอป เพื่อให้คะแนนคำนวณแยกตามผู้ขับแต่ละคนอย่างถูกต้อง",
        "เที่ยวการเดินทางที่ไม่มีการระบุตัวตนผู้ขับจะถูกนับรวมเข้ากับผู้ถือกรมธรรม์หลักโดยอัตโนมัติ แต่จะถูก flag แยกไว้เพื่อไม่ให้กระทบคะแนนของผู้ขับหลักอย่างไม่เป็นธรรมถ้าคนอื่นขับขี่ไม่ดี",
      ],
    },
    {
      slug: "data-privacy-retention-policy",
      title: "นโยบายความเป็นส่วนตัวและการเก็บรักษาข้อมูล GPS",
      tags: ["privacy", "policy"],
      isPrimary: false,
      intro: [
        "ข้อมูล GPS trace ดิบเก็บรักษาตาม `GPS_TRACE_RETENTION_DAYS` เท่านั้น หลังจากนั้นจะถูกลบถาวร ยกเว้นข้อมูลที่เกี่ยวข้องกับหลักฐานอุบัติเหตุที่มีระยะเวลาเก็บรักษาแยกต่างหากตาม {{ref:policy:accident-evidence-retention-policy}}",
        "ผู้ขับมีสิทธิ์ขอลบข้อมูลตำแหน่งของตัวเองก่อนครบกำหนดได้ผ่านคำร้องพิเศษ ยกเว้นข้อมูลที่ผูกกับหลักฐานอุบัติเหตุที่อยู่ระหว่างกระบวนการเคลมซึ่งไม่สามารถลบก่อนกำหนดได้",
      ],
    },
  ],
  incidents: [
    {
      slug: "gps-drift-false-harsh-braking",
      title: "GPS Drift ทำให้เกิดสัญญาณเบรกกะทันหันเท็จ",
      tags: ["scoring", "bug"],
      summary:
        "ผู้ขับหลายคนได้รับการหักคะแนนจากเหตุการณ์เบรกกะทันหันที่ไม่ได้เกิดขึ้นจริง โดยเกิดขึ้นซ้ำในพื้นที่เดียวกันบ่อยผิดปกติ",
      investigation:
        "ตรวจ {{ref:module:trip-collector}} พบว่าพื้นที่ที่เกิดปัญหาบ่อยเป็นย่านตึกสูงที่สัญญาณ GPS สะท้อนกับอาคาร (multipath effect) ทำให้พิกัดกระโดดไปมาในระยะเวลาสั้นๆ ซึ่งคำนวณออกมาเป็นความเร่ง/ความหน่วงสูงผิดปกติ",
      cause:
        "การคำนวณ harsh event ใช้ความแตกต่างของพิกัด GPS ระหว่างจุดต่อจุดโดยตรง ไม่มีการกรองสัญญาณรบกวนที่เกิดจาก multipath effect ในพื้นที่ตึกสูง",
      resolution:
        "ปรับคะแนนคืนให้ผู้ขับที่ได้รับผลกระทบในพื้นที่ที่ระบุได้ชัดเจนว่าเป็น multipath zone",
      followup:
        "เพิ่มการกรองสัญญาณ GPS ที่ผิดปกติทางกายภาพ (เช่น ความเร็วที่คำนวณได้เกินขีดจำกัดที่รถทำได้จริง) ก่อนนำไปคำนวณ harsh event แทนการเชื่อพิกัดดิบทั้งหมด",
    },
    {
      slug: "trip-boundary-merge-two-trips",
      title: "การแบ่งเที่ยวการเดินทางผิดพลาดรวมสองเที่ยวเป็นเที่ยวเดียว",
      tags: ["trip", "bug"],
      summary:
        "ผู้ขับจอดรถแวะทำธุระระหว่างทางแล้วขับต่อ แต่ระบบนับเป็นเที่ยวเดียวต่อเนื่อง ทำให้คะแนนของสองเที่ยวที่ควรแยกกันถูกรวมเข้าด้วยกันอย่างไม่ถูกต้อง",
      investigation:
        "ตรวจ {{ref:module:trip-collector}} พบว่าผู้ขับจอดรถในที่ร่มที่สัญญาณ GPS อ่อน ทำให้อุปกรณ์ยังคงส่งพิกัดสุดท้ายที่รับได้ซ้ำๆ แทนที่จะหยุดส่งข้อมูลจริง ระบบจึงไม่นับว่าเป็นช่วงหยุดนิ่งตาม `TRIP_IDLE_TIMEOUT_MIN`",
      cause:
        "การตรวจจับ 'หยุดนิ่ง' อาศัยการไม่มีข้อมูลใหม่เข้ามาเป็นหลัก แต่ในกรณีที่อุปกรณ์ยังส่งพิกัดเดิมซ้ำๆ (แทนที่จะหยุดส่งจริง) ระบบตีความผิดว่ารถยังเคลื่อนที่อยู่",
      resolution:
        "แยกคะแนนของสองเที่ยวที่ถูกรวมผิดด้วยมือ ตรวจสอบเที่ยวอื่นในช่วงเวลาเดียวกันที่อาจได้รับผลกระทบเดียวกัน",
      followup:
        "แก้การตรวจจับหยุดนิ่งให้พิจารณาความเร็วที่คำนวณได้เป็นศูนย์ต่อเนื่องด้วย ไม่ใช่แค่การไม่มีข้อมูลใหม่เข้ามาเพียงอย่างเดียว",
    },
    {
      slug: "driving-score-computed-incomplete-data",
      title: "คำนวณคะแนนจากข้อมูลที่ไม่ครบระหว่างอุปกรณ์ขาดการเชื่อมต่อ",
      tags: ["scoring", "bug"],
      summary:
        "เที่ยวการเดินทางหนึ่งที่อุปกรณ์ขาดการเชื่อมต่อกลางทางถูกคำนวณคะแนนราวกับว่าเป็นเที่ยวสั้นๆ ที่จบแล้ว ทั้งที่จริงผู้ขับยังคงขับต่อไปอีกไกล",
      investigation:
        "ตรวจ `calculateTripScore` ใน {{ref:module:driving-scorer}} พบว่าฟังก์ชันนี้ไม่ตรวจสอบว่าเที่ยวการเดินทางจบเพราะรถหยุดจริงหรือเพราะอุปกรณ์ขาดการเชื่อมต่อ (device offline) ก่อนคำนวณคะแนน",
      cause:
        "event `trip.completed` ถูก publish เมื่อไม่มีข้อมูลใหม่เข้ามานานเกิน timeout โดยไม่แยกแยะสาเหตุว่าเป็นเพราะรถหยุดจริงหรืออุปกรณ์มีปัญหา",
      resolution:
        "คำนวณคะแนนใหม่หลังอุปกรณ์กลับมาเชื่อมต่อและข้อมูลเที่ยวครบถ้วน ปรับคะแนนผู้ขับที่ได้รับผลกระทบให้ถูกต้อง",
      followup:
        "แยก event `trip.completed` (รถหยุดจริง) กับ `trip.interrupted` (อุปกรณ์ขาดการเชื่อมต่อกลางทาง) ให้ชัดเจน แล้วให้ `calculateTripScore` จัดการสองกรณีนี้ต่างกัน",
    },
    {
      slug: "premium-adjustment-applied-twice",
      title: "ปรับเบี้ยประกันซ้ำสองครั้งสำหรับรอบเดียวกัน",
      tags: ["premium", "bug"],
      summary:
        "ผู้ขับรายหนึ่งพบว่าเบี้ยประกันถูกปรับลดสองครั้งติดกันสำหรับรอบการประเมินเดียวกัน ทำให้เบี้ยต่ำกว่าที่ควรจะเป็นตามคะแนนจริง",
      investigation:
        "ตรวจ `applyAdjustment` ใน {{ref:module:premium-adjuster}} พบว่า scheduled job ที่ประมวลผลการปรับเบี้ยรันซ้อนกันสอง instance เพราะ deploy ใหม่ไม่ได้ปิด instance เก่าให้เสร็จก่อนเปิด instance ใหม่",
      cause:
        "ไม่มี idempotency key หรือ distributed lock กันการเรียก `applyAdjustment` ซ้ำสำหรับ adjustmentId เดียวกัน — ปัญหาลักษณะเดียวกับที่เคยพบใน background job ของระบบอื่น",
      resolution:
        "ยกเลิกการปรับเบี้ยที่ซ้ำ คำนวณเบี้ยที่ถูกต้องใหม่และแจ้งผู้ขับที่ได้รับผลกระทบ",
      followup:
        "เพิ่ม idempotency key ให้ `applyAdjustment` และ distributed lock กันการรัน scheduled job ซ้อนกันหลาย instance พร้อมกัน",
    },
    {
      slug: "accident-alert-triggered-speed-bump",
      title: "แจ้งเตือนอุบัติเหตุเท็จจากการขับผ่านลูกระนาด",
      tags: ["accident", "false-positive"],
      summary:
        "ทีมช่วยเหลือฉุกเฉินได้รับการแจ้งเตือนอุบัติเหตุจำนวนมากในพื้นที่หนึ่ง ตรวจสอบพบว่าเป็นแค่รถขับผ่านลูกระนาดความเร็วสูงเท่านั้น ไม่ใช่อุบัติเหตุจริง",
      investigation:
        "ตรวจ {{ref:module:accident-detector}} พบว่าค่าความเร่งแนวตั้งที่เกิดจากลูกระนาดที่ความเร็วสูงมีค่าใกล้เคียงกับ `ACCIDENT_DECELERATION_THRESHOLD_G` ที่ใช้ตัดสินใจ ทำให้ trigger การแจ้งเตือนบ่อยเกินจำเป็นในพื้นที่ที่มีลูกระนาดหลายจุดใกล้กัน",
      cause:
        "อัลกอริทึมตรวจจับใช้ค่าความเร่งเป็นตัวตัดสินหลัก โดยไม่แยกแยะทิศทางความเร่ง (แนวตั้งจากลูกระนาดกับแนวราบจากการชน) ซึ่งมีลักษณะสัญญาณต่างกันชัดเจน",
      resolution:
        "ปรับเกณฑ์การตรวจจับชั่วคราวให้สูงขึ้นในพื้นที่ที่ทราบว่ามีลูกระนาดหนาแน่น ลดการแจ้งเตือนเท็จลง",
      followup:
        "ปรับอัลกอริทึมให้แยกแยะทิศทางความเร่ง (แนวตั้ง vs แนวราบ) แทนการใช้ค่าความเร่งรวมเป็นตัวตัดสินอย่างเดียว เพื่อแยกลูกระนาดออกจากอุบัติเหตุจริงได้แม่นยำขึ้น",
    },
    {
      slug: "device-provisioning-stuck-pending",
      title: "อุปกรณ์ค้างสถานะ Pending ไม่เปลี่ยนเป็น Active",
      tags: ["device", "bug"],
      summary:
        "ผู้ขับหลายรายติดตั้งอุปกรณ์ OBD-II เรียบร้อยและรถวิ่งได้ปกติ แต่แอปยังแสดงสถานะ 'รอการเปิดใช้งาน' ค้างอยู่นานเกิน `PROVISIONING_ACTIVATION_WINDOW_DAYS`",
      investigation:
        "ตรวจ {{ref:module:device-provisioner}} พบว่า `confirmActivation` ไม่เคยถูกเรียกเพราะเงื่อนไขที่ใช้ตัดสินใจว่าอุปกรณ์เริ่มส่งข้อมูลจริงต้องการ trip ที่สมบูรณ์อย่างน้อย 1 เที่ยว แต่ผู้ขับกลุ่มนี้ใช้รถขับระยะสั้นในละแวกบ้านเท่านั้น ทำให้ trip ไม่เคยยาวพอที่จะนับว่าสมบูรณ์ตามเกณฑ์เดิม",
      cause:
        "เกณฑ์ 'trip สมบูรณ์' ที่ใช้ยืนยันการเปิดใช้งานอุปกรณ์เข้มงวดเกินไปสำหรับผู้ขับที่ใช้รถระยะสั้นเป็นหลัก ซึ่งเป็นพฤติกรรมการใช้งานปกติที่ระบบควรรองรับได้",
      resolution:
        "ยืนยันการเปิดใช้งานด้วยมือให้ผู้ขับที่ได้รับผลกระทบ ตรวจสอบผู้ขับอื่นที่อาจติดปัญหาเดียวกัน",
      followup:
        "ปรับเกณฑ์ 'trip สมบูรณ์' ให้ยอมรับ trip สั้นที่มีคุณภาพข้อมูลดีได้ด้วย ไม่กำหนดความยาวขั้นต่ำที่เข้มงวดเกินไปสำหรับการยืนยันการเปิดใช้งาน",
    },
    {
      slug: "geofence-alert-storm-boundary-oscillation",
      title: "แจ้งเตือน Geofence ถี่ผิดปกติเมื่อรถวิ่งใกล้ขอบเขต",
      tags: ["geofence", "bug"],
      summary:
        "ผู้ขับที่บ้านอยู่ใกล้ขอบเขต geofence พอดีได้รับการแจ้งเตือนเข้า-ออกเขตหลายสิบครั้งในไม่กี่นาที ทั้งที่ควรมี cooldown ตาม {{ref:policy:geofence-alert-cooldown-policy}}",
      investigation:
        "ตรวจ {{ref:module:geofence-monitor}} พบว่า cooldown ถูกคำนวณแยกสำหรับ 'เข้าเขต' และ 'ออกเขต' เป็นสองสถานะที่ไม่เชื่อมโยงกัน ทำให้การแจ้งเตือนสลับเข้า-ออกนับเป็นเหตุการณ์คนละประเภทที่ไม่ได้ share cooldown เดียวกัน",
      cause:
        "การออกแบบ cooldown ไม่ครอบคลุมกรณีตำแหน่งแกว่งอยู่ใกล้ขอบเขตพอดี (boundary oscillation) ซึ่งทำให้เกิดการสลับสถานะเข้า-ออกถี่ในเวลาสั้นๆ",
      resolution:
        "ปิดการแจ้งเตือนชั่วคราวสำหรับกรมธรรม์ที่ได้รับผลกระทบ แล้วรวม cooldown ของเข้า-ออกเขตให้ใช้ตัวนับเดียวกัน",
      followup:
        "เพิ่ม buffer zone รอบขอบเขต geofence ที่ไม่นับเป็นการเข้า-ออกจนกว่าตำแหน่งจะอยู่นอก buffer อย่างชัดเจน ลดปัญหาการแกว่งใกล้ขอบเขต",
    },
    {
      slug: "harsh-event-double-counted-retry",
      title: "เหตุการณ์เบรกกะทันหันถูกนับซ้ำจากการส่งข้อมูลซ้ำของอุปกรณ์",
      tags: ["scoring", "bug"],
      summary:
        "ผู้ขับรายหนึ่งถูกหักคะแนนจากเหตุการณ์เบรกกะทันหันเดียวกันถึงสามครั้งในรายงานคะแนน ทั้งที่ในความเป็นจริงเกิดขึ้นครั้งเดียว",
      investigation:
        "ตรวจ {{ref:module:trip-collector}} พบว่าอุปกรณ์ OBD-II รุ่นหนึ่งส่งข้อมูล harsh event ซ้ำเมื่อสัญญาณเครือข่ายไม่เสถียร (retry จากฝั่งอุปกรณ์เอง) แต่ `ingestGpsPoint` ไม่มีการตรวจสอบความซ้ำของ event ที่ส่งเข้ามาจากอุปกรณ์เดียวกัน",
      cause:
        "ไม่มี idempotency key ที่อุปกรณ์แนบมาด้วยเพื่อให้ server แยกแยะได้ว่า event ที่ส่งเข้ามาซ้ำเป็นเหตุการณ์เดียวกันที่ retry หรือเหตุการณ์ใหม่จริง",
      resolution:
        "คืนคะแนนที่ถูกหักซ้ำให้ผู้ขับที่ได้รับผลกระทบ ตรวจสอบอุปกรณ์รุ่นเดียวกันว่ามีปัญหา retry แบบเดียวกันหรือไม่",
      followup:
        "เพิ่ม idempotency key ที่อุปกรณ์ต้องแนบมากับทุก harsh event เพื่อให้ server กรอง duplicate จากการ retry ของอุปกรณ์ได้อย่างถูกต้อง",
    },
    {
      slug: "accident-evidence-deleted-before-claim-closed",
      title: "หลักฐานอุบัติเหตุถูกลบก่อนกระบวนการเคลมเสร็จสิ้น",
      tags: ["accident", "compliance"],
      summary:
        "ทีมเคลมประกันต้องการหลักฐาน GPS trace ของอุบัติเหตุที่เกิดขึ้น 3 ปีก่อนสำหรับคดีที่ยังไม่สิ้นสุด แต่พบว่าหลักฐานถูกลบไปแล้วตามรอบทำความสะอาดข้อมูลอัตโนมัติ",
      investigation:
        "ตรวจ {{ref:module:accident-detector}} พบว่า job ทำความสะอาดข้อมูลเก่าลบหลักฐานตามอายุ 3 ปีตรงตามนโยบายมาตรฐาน แต่ไม่ได้ตรวจสอบว่าคดีที่เกี่ยวข้องยังอยู่ระหว่างดำเนินคดีทางกฎหมายหรือไม่ก่อนลบ ขัดกับ edge case ที่ระบุไว้ใน {{ref:policy:accident-evidence-retention-policy}}",
      cause:
        "job ทำความสะอาดข้อมูลไม่มีการเชื่อมโยงกับสถานะคดีทางกฎหมายจากทีมกฎหมาย ลบตามอายุข้อมูลเพียงอย่างเดียวโดยไม่ตรวจสอบเงื่อนไขยกเว้น",
      resolution:
        "ตรวจสอบว่ามี backup สำรองของหลักฐานที่ถูกลบหรือไม่ แจ้งทีมกฎหมายและทีมเคลมถึงผลกระทบที่เกิดขึ้น",
      followup:
        "เชื่อมโยง job ทำความสะอาดข้อมูลกับระบบติดตามสถานะคดีทางกฎหมาย ให้ตรวจสอบก่อนลบเสมอตามที่ระบุใน edge case ของนโยบายแต่ยังไม่ได้ implement จริงตอนเกิดเหตุ",
    },
    {
      slug: "multi-driver-attribution-wrong-driver",
      title: "คะแนนถูกระบุผิดผู้ขับเมื่อใช้รถร่วมกันหลายคน",
      tags: ["scoring", "bug"],
      summary:
        "ครอบครัวหนึ่งที่ใช้รถคันเดียวกันหลายคนพบว่าคะแนนของผู้ขับคนหนึ่งได้รับผลกระทบจากพฤติกรรมการขับขี่ของสมาชิกอีกคนที่ขับขี่ไม่ดี ทั้งที่มีการระบุตัวตนก่อนขับทุกครั้ง",
      investigation:
        "ตรวจ {{ref:module:trip-collector}} พบว่าการระบุตัวตนผู้ขับผ่านแอปก่อนเริ่มเที่ยวมีความหน่วง (latency) ในการ sync กับ backend ทำให้บางเที่ยวที่เริ่มขับก่อน sync เสร็จถูกบันทึกด้วยตัวตนผู้ขับคนก่อนหน้าแทน",
      cause:
        "การจับคู่ตัวตนผู้ขับกับเที่ยวการเดินทางใช้เวลา sync ล่าสุดที่มีในระบบ ไม่ใช่ timestamp ที่แอปส่งการระบุตัวตนมาจริง ทำให้เกิดความคลาดเคลื่อนเมื่อ sync ช้ากว่าการเริ่มขับจริง",
      resolution:
        "แก้ไขคะแนนของเที่ยวที่ระบุผิดผู้ขับด้วยมือ แจ้งครอบครัวที่ได้รับผลกระทบ",
      followup:
        "แก้การจับคู่ตัวตนผู้ขับให้ใช้ timestamp ที่แอปส่งมาจริงเป็นหลัก ไม่ใช่ลำดับการ sync ที่อาจล่าช้ากว่าการเริ่มขับจริง",
    },
    {
      slug: "premium-adjuster-negative-premium-edge-case",
      title: "การคำนวณเบี้ยประกันติดลบจากการปรับสะสมหลายรอบ",
      tags: ["premium", "bug"],
      summary:
        "ผู้ขับที่มีคะแนนดีต่อเนื่องหลายรอบพบว่าระบบคำนวณเบี้ยประกันออกมาเป็นค่าติดลบ ซึ่งไม่มีความหมายทางธุรกิจและเป็นไปไม่ได้จริง",
      investigation:
        "ตรวจ `calculateAdjustment` ใน {{ref:module:premium-adjuster}} พบว่าการปรับลดสะสมหลายรอบติดต่อกันไม่มีการตรวจสอบขอบเขตล่างของเบี้ยประกัน ปล่อยให้การคำนวณลดลงเรื่อยๆ ตามสูตรโดยไม่มี floor value",
      cause:
        "สูตรคำนวณการปรับเบี้ยออกแบบมาโดยสมมติว่าเบี้ยเริ่มต้นสูงพอที่จะไม่มีทางติดลบได้ในทางปฏิบัติ แต่ไม่ได้ใส่การตรวจสอบป้องกันไว้อย่างชัดเจนในโค้ด",
      resolution:
        "ตั้งเบี้ยของผู้ขับที่ได้รับผลกระทบให้เป็นเบี้ยขั้นต่ำที่สมเหตุสมผลด้วยมือ",
      followup:
        "เพิ่ม floor value ให้การคำนวณเบี้ยประกันไม่มีทางต่ำกว่าค่าขั้นต่ำที่กำหนดไม่ว่าคะแนนจะดีต่อเนื่องนานแค่ไหนก็ตาม",
    },
    {
      slug: "driving-scorer-batch-job-timeout",
      title: "การคำนวณคะแนนรวมรายสัปดาห์ Timeout สำหรับผู้ขับที่มี Trip เยอะ",
      tags: ["scoring", "performance"],
      summary:
        "ผู้ขับที่ขับรถบ่อยมาก (เช่น คนขับรถรับจ้าง) พบว่าคะแนนรวมรายสัปดาห์ไม่อัปเดตติดต่อกันหลายสัปดาห์",
      investigation:
        "ตรวจ `recalculateOverallScore` ใน {{ref:module:driving-scorer}} พบว่าฟังก์ชันนี้ดึงข้อมูลทุก trip ในช่วง 90 วันมาคำนวณทั้งหมดในครั้งเดียว สำหรับผู้ขับที่มี trip จำนวนมากมากทำให้ query timeout ก่อนคำนวณเสร็จ",
      cause:
        "ฟังก์ชันไม่ได้ออกแบบมาให้ scale กับจำนวน trip ที่มากผิดปกติ ไม่มีการแบ่งประมวลผลเป็น batch ย่อยสำหรับกรณีข้อมูลเยอะเป็นพิเศษ",
      resolution:
        "คำนวณคะแนนของผู้ขับที่ได้รับผลกระทบด้วยสคริปต์แยกที่แบ่งประมวลผลเป็นช่วงเล็กลง",
      followup:
        "แก้ `recalculateOverallScore` ให้แบ่งประมวลผลเป็น batch ย่อยสำหรับผู้ขับที่มีจำนวน trip เกินเกณฑ์ที่กำหนด แทนการประมวลผลทั้งหมดในครั้งเดียว",
    },
    {
      slug: "accident-detector-missed-real-accident",
      title: "ระบบตรวจจับอุบัติเหตุพลาดเหตุการณ์ที่เป็นอุบัติเหตุจริง",
      tags: ["accident", "near-miss"],
      summary:
        "เกิดอุบัติเหตุจริงกับผู้ขับรายหนึ่งแต่ระบบไม่ได้แจ้งเตือนทีมช่วยเหลือฉุกเฉินเลย ทั้งที่ผู้ขับรายงานว่ารถกระแทกกับสิ่งกีดขวางแรงพอสมควร",
      investigation:
        "ตรวจ {{ref:module:accident-detector}} พบว่าความเร่งที่บันทึกได้ในเหตุการณ์นี้ต่ำกว่า `ACCIDENT_DECELERATION_THRESHOLD_G` เล็กน้อย เพราะรถชนแบบเฉียงไม่ใช่ชนตรงหน้าเต็มที่ ทำให้แรงกระแทกที่วัดได้ในแนวที่ sensor ตรวจจับต่ำกว่าความรุนแรงจริงของเหตุการณ์",
      cause:
        "อัลกอริทึมตรวจจับใช้ค่าความเร่งสูงสุดในแนวเดียว (มักเป็นแนวหน้า-หลัง) เป็นเกณฑ์หลัก ไม่ได้รวมความเร่งจากทุกแนวเข้าด้วยกัน ทำให้การชนแบบเฉียงที่กระจายแรงไปหลายแนวถูกประเมินต่ำกว่าความเป็นจริง",
      resolution:
        "ติดต่อผู้ขับเพื่อยืนยันความปลอดภัยและดำเนินการเคลมด้วยมือ ตรวจสอบเหตุการณ์อื่นที่มีลักษณะคล้ายกันในช่วงเวลาใกล้เคียง",
      followup:
        "ปรับอัลกอริทึมให้พิจารณาความเร่งรวมจากทุกแนว (magnitude ของ vector) แทนการใช้ค่าสูงสุดในแนวเดียว เพื่อจับการชนแบบเฉียงที่กระจายแรงได้แม่นยำขึ้น",
    },
    {
      slug: "geofence-zone-update-race-condition",
      title: "อัปเดตเขต Geofence พร้อมกันทำการตั้งค่าเสียหาย",
      tags: ["geofence", "race-condition"],
      summary:
        "ทีมสนับสนุนสองคนอัปเดตเขต geofence ของกรมธรรม์เดียวกันพร้อมกันในเวลาไล่เลี่ยกันมาก ทำให้เขตที่ตั้งค่าไว้สุดท้ายมีบางส่วนหายไปอย่างไม่ตั้งใจ",
      investigation:
        "ตรวจ `updateGeofenceZones` ใน {{ref:module:geofence-monitor}} พบว่าฟังก์ชันนี้อ่านรายการเขตปัจจุบันมาแก้ไขแล้วเขียนทับทั้งชุด ไม่ได้ตรวจสอบว่ามีการแก้ไขอื่นเกิดขึ้นระหว่างนั้นหรือไม่ — pattern เดียวกับปัญหาที่เคยพบในระบบอื่น",
      cause:
        "ไม่มี optimistic locking หรือ version check ก่อนเขียนทับรายการเขต geofence ทำให้การแก้ไขพร้อมกันจากสองคนทับกันได้",
      resolution:
        "กู้คืนรายการเขตจาก audit log ก่อนหน้า ให้ทีมสนับสนุนยืนยันการตั้งค่าที่ถูกต้องใหม่",
      followup:
        "เพิ่ม optimistic locking ให้ `updateGeofenceZones` ตรวจสอบ version ปัจจุบันก่อนเขียนทับเสมอ ปฏิเสธการอัปเดตถ้า version ไม่ตรงกับที่คาดไว้",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/DLOG-521-multipath-gps-filter`, `fix/DLOG-538-idempotent-premium-adjustment`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(premium-adjuster): เพิ่ม idempotency key กันปรับเบี้ยซ้ำ`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่ประมวลผลข้อมูล GPS/sensor ดิบต้องมี test กรณีข้อมูลผิดปกติทางกายภาพเสมอ (ดูบทเรียนจาก {{ref:incident:gps-drift-false-harsh-braking}}) และฟังก์ชันที่ปรับเบี้ยหรือคะแนนต้องมี test ครอบคลุม idempotency" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `calculateTripScore`, `evaluateHarshEvent` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`tripId` รูปแบบ `trp_<ULID>`, `deviceId` รูปแบบ `dev_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับการคำนวณคะแนนหรือปรับเบี้ยต้องมี `tripId` หรือ `adjustmentId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ห้าม log พิกัด GPS ดิบปริมาณมาก", body: "ห้าม log ทุกจุดพิกัด GPS เพราะปริมาณสูงเกินไปและกระทบความเป็นส่วนตัวของผู้ขับ ให้ log เฉพาะ aggregate หรือ error case เท่านั้น" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`DLOG_<DOMAIN>_<REASON>` เช่น `DLOG_TRIP_INCOMPLETE`, `DLOG_DEVICE_INACTIVE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`DLOG_SCORE_STALE`, `DLOG_PREMIUM_CAP_EXCEEDED`, `DLOG_GEOFENCE_COOLDOWN_ACTIVE` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Physical plausibility test", body: "ฟังก์ชันที่ประมวลผลข้อมูล GPS/sensor ต้องมี test ที่ป้อนค่าที่เป็นไปไม่ได้ทางกายภาพเสมอ (เช่น ความเร็วเกินขีดจำกัดรถ) — บทเรียนจาก {{ref:incident:gps-drift-false-harsh-braking}}" },
        { heading: "Idempotency test", body: "ฟังก์ชันที่แก้ไขคะแนนหรือเบี้ยประกันต้องมี test ยืนยันว่าเรียกซ้ำแล้วผลลัพธ์ไม่เปลี่ยน — บทเรียนจาก {{ref:incident:premium-adjustment-applied-twice}}" },
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
      slug: "sensor-data-quality-convention",
      title: "Sensor Data Quality Convention",
      tags: ["data", "reliability"],
      intro: "เอกสารนี้กำหนดวิธีจัดการข้อมูล sensor/GPS ดิบที่มีความไม่แน่นอนสูงกว่าข้อมูลทั่วไปมาก เพราะเป็นข้อมูลจากอุปกรณ์ภาคสนามที่ควบคุมคุณภาพไม่ได้เต็มที่",
      sections: [
        { heading: "การกรองข้อมูลผิดปกติ", body: "ทุกฟังก์ชันที่รับข้อมูล GPS/sensor ดิบต้องตรวจสอบความเป็นไปได้ทางกายภาพก่อนนำไปคำนวณเสมอ (เช่น ความเร็วไม่เกินขีดจำกัดที่รถทำได้จริง) — บทเรียนจาก {{ref:incident:gps-drift-false-harsh-braking}} ที่ยังไม่ได้ implement การกรองนี้ครบถ้วน" },
        { heading: "การจัดการข้อมูลขาดหายหรือซ้ำ", body: "ต้องมี idempotency key จากอุปกรณ์เสมอเพื่อกรอง event ซ้ำจากการ retry ของอุปกรณ์เอง ไม่พึ่งพาการไม่มี duplicate จากฝั่งอุปกรณ์เพียงอย่างเดียว — บทเรียนจาก {{ref:incident:harsh-event-double-counted-retry}}" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → sensor-data-quality test (ครอบคลุมกรณีข้อมูลผิดปกติทางกายภาพ) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:accident-detector}} และ {{ref:module:premium-adjuster}} ต้องผ่าน test ครอบคลุม edge case 100% ก่อน merge เสมอ เพราะความผิดพลาดกระทบความปลอดภัยจริงหรือความเป็นธรรมทางการเงินของผู้ขับ" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → driving-scorer | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| trip-collector → database pool acquire | 2s | `pg-pool` config |\n| อุปกรณ์ OBD-II → trip-collector | 8s | env `DEVICE_INGEST_TIMEOUT_MS` |" },
        { heading: "เหตุผลที่ device ingest timeout นานกว่าปกติ", body: "อุปกรณ์ OBD-II เชื่อมต่อผ่านเครือข่ายมือถือที่มี latency สูงกว่าปกติในบางพื้นที่ timeout สั้นเกินไปจะทำให้ข้อมูลที่ส่งมาจริงถูกตัดทิ้งโดยไม่จำเป็นบ่อยเกินไป" },
      ],
    },
    {
      slug: "accident-response-runbook",
      title: "Accident Response Runbook",
      tags: ["accident", "safety", "runbook"],
      intro: "ขั้นตอนเมื่อระบบตรวจพบสัญญาณอุบัติเหตุ ต้องดำเนินการเร็วที่สุดเพราะกระทบความปลอดภัยของผู้ขับโดยตรง",
      sections: [
        { heading: "เมื่อตรวจพบสัญญาณ", body: "{{ref:module:accident-detector}} แจ้งเตือนทีมช่วยเหลือฉุกเฉินทันทีที่ confidence score เกินเกณฑ์ ไม่รอการยืนยันด้วยมือก่อน เพราะความล่าช้าในการช่วยเหลืออาจมีผลร้ายแรงกว่าการแจ้งเตือนที่ผิดพลาด" },
        { heading: "บทเรียนจากเหตุการณ์จริง", body: "ดู {{ref:incident:accident-detector-missed-real-accident}} — ต้องพิจารณาความเร่งรวมจากทุกแนว ไม่ใช่แนวเดียว เพื่อไม่ให้พลาดอุบัติเหตุจริงที่มีลักษณะการชนแบบเฉียง" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = พลาดตรวจจับอุบัติเหตุจริงหรือคำนวณเบี้ยผิดพลาดกระทบผู้ขับจำนวนมาก, Sev2 = กระทบคะแนนหรือ device provisioning บางส่วน, Sev3 = กระทบเล็กน้อยไม่ถึงความปลอดภัยหรือการเงินโดยตรง" },
        { heading: "กรณีที่เกี่ยวกับความปลอดภัย", body: "ทุกเหตุการณ์ที่เกี่ยวข้องกับการตรวจจับอุบัติเหตุผิดพลาด (ทั้ง false positive และ false negative) ต้องยกระดับเป็น Sev1 เสมอและแจ้งทีมความปลอดภัยทันที เขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "accident alert ที่ไม่ได้รับการตอบสนองภายในเวลาที่กำหนด, device heartbeat missed สะสมเกิน threshold ต่อวัน, premium adjustment job ล้มเหลวหรือรันซ้อน" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager โดยเฉพาะ accident alert ที่ไม่ตอบสนอง ส่วน Sev3 รวมเป็น digest รายวันพอ" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้การตรวจจับอุบัติเหตุผิดพลาดหรือการคำนวณเบี้ยคลาดเคลื่อน ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:premium-adjuster-negative-premium-edge-case}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมความปลอดภัยและทีมประเมินความเสี่ยงทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| trip-collector | 4 | 20 | ingest queue depth > 1000 |\n| accident-detector | 3 | 10 | latency p95 > 50ms |\n| driving-scorer | 2 | 8 | processing lag > 60s |" },
        { heading: "ข้อจำกัดที่ต้องระวัง", body: "accident-detector ต้องมี latency ต่ำที่สุดตลอดเวลา ไม่ใช่แค่ scale ตาม load เพราะความเร็วในการตัดสินใจมีผลต่อความปลอดภัยผู้ขับโดยตรง — บทเรียนจาก {{ref:incident:driving-scorer-batch-job-timeout}} ที่แสดงว่าการไม่ scale ล่วงหน้าส่งผลกระทบต่อผู้ใช้จริง" },
      ],
    },
    {
      slug: "device-firmware-rollout-runbook",
      title: "Device Firmware Rollout Runbook",
      tags: ["device", "runbook"],
      intro: "ขั้นตอนการทยอยอัปเดต firmware ของอุปกรณ์ OBD-II ในสนามจริง ต้องระมัดระวังเพราะแก้ไขอุปกรณ์ที่ติดตั้งอยู่ในรถผู้ขับจริงหลายพันคัน",
      sections: [
        { heading: "การทยอย rollout", body: "อัปเดต firmware เป็นกลุ่มย่อย 5% ของอุปกรณ์ทั้งหมดก่อนเสมอ ตรวจสอบอัตราการเชื่อมต่อสำเร็จและคุณภาพข้อมูลก่อนขยายไปกลุ่มถัดไป ไม่ rollout พร้อมกันทั้งหมดในครั้งเดียว" },
        { heading: "บทเรียนจากเหตุการณ์จริง", body: "ดู {{ref:incident:harsh-event-double-counted-retry}} — firmware บางรุ่นมีพฤติกรรม retry ที่ไม่คาดคิด ต้องทดสอบกับอุปกรณ์รุ่นเดียวกันจริงก่อน rollout วงกว้างเสมอ" },
      ],
    },
  ],
};
