import type { DomainProfile } from "../types.js";

// GridSync — ระบบบริหารพลังงานองค์กรสำหรับอาคาร/โรงงานขนาดใหญ่ (energy management)
// เป็นระบบสมมติล้วนๆ ไม่เกี่ยวข้องกับ payment/refund/order ของ PayFlow เลย — distractor domain
export const energyManagement: DomainProfile = {
  id: "energy-management",
  displayName: "GridSync — ระบบบริหารพลังงานองค์กร",
  summary: [
    "GridSync คือระบบบริหารพลังงานสำหรับอาคารสำนักงานและโรงงานขนาดใหญ่ เก็บข้อมูลการใช้ไฟฟ้า/แก๊ส/น้ำแบบ real-time จาก IoT meter หลายพันตัวทั่วอาคาร คำนวณ demand response เพื่อลดการใช้ไฟช่วง peak, จัดตารางเปิด-ปิดอุปกรณ์อัตโนมัติ, และสร้างรายงานคาร์บอนฟุตพรินต์ให้ทีมความยั่งยืนขององค์กร",
    "ทีมวิศวกรรมออกแบบระบบให้ทนต่อข้อมูลจาก meter ที่ขาดหายหรือผิดปกติได้ในระดับหนึ่ง เพราะ IoT device ภาคสนามมีโอกาสหลุดการเชื่อมต่อสูงกว่า service ทั่วไปมาก และการตัดสินใจ demand response ที่ผิดพลาดอาจกระทบการดำเนินงานจริงของโรงงาน ไม่ใช่แค่ตัวเลขในรายงาน",
  ],
  domainTags: ["energy-management", "gridsync"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:meter-collector}} เป็นเจ้าของข้อมูลดิบจาก meter ทั้งหมด ส่วน {{ref:module:carbon-calculator}} เก็บแค่ผลการคำนวณคาร์บอนฟุตพรินต์ที่ประมวลผลแล้ว ไม่เก็บข้อมูลดิบซ้ำ",
    "{{ref:module:demand-response-controller}} ไม่เขียนคำสั่งควบคุมอุปกรณ์โดยตรง แต่ส่งคำสั่งผ่าน {{ref:module:equipment-scheduler}} เท่านั้น เพื่อให้มีจุดเดียวที่ตัดสินใจลำดับความสำคัญเมื่อคำสั่งจากหลายแหล่งขัดแย้งกัน",
  ],
  apiGatewayNote: [
    "คำขอจากแอปทีมอาคาร (facility team) เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งตรวจสอบ token และแนบ facility ID ไปกับทุก request ก่อนส่งต่อให้ service ที่เกี่ยวข้อง",
    "meter ที่ส่งข้อมูลเข้ามาใช้ endpoint แยกที่รับ payload ผ่าน MQTT bridge ไม่ใช่ REST ปกติ เพราะ meter จำนวนมากส่งข้อมูลถี่มากและ REST overhead สูงเกินไปสำหรับ scale นี้",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:meter-collector}} ดูแล ได้แก่ `meter_readings` (time-series), `meter_registry`, และ `meter_health_status`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `meter_readings` | meter-collector | time-series เก็บทุกจุดข้อมูลดิบ ไม่ aggregate ล่วงหน้า |\n| `demand_events` | demand-response-controller | เก็บทุกครั้งที่ trigger demand response |\n| `equipment_schedules` | equipment-scheduler | ไม่มี FK ตรงไป meter_readings ใช้ facilityId แบบ soft reference |\n| `carbon_reports` | carbon-calculator | เก็บผลคำนวณรายเดือน ไม่เก็บ raw reading ซ้ำ |",
    "ไม่มี FK ข้ามระบบจริงเพราะแยก database กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก demand_event มี meterId ที่มีอยู่จริง)",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `meter.reading_received`, `demand.threshold_exceeded`, `equipment.schedule_conflict`, `meter.offline_detected`, `carbon.report_generated` — {{ref:module:anomaly-detector}} subscribe `meter.reading_received` ทุก event เพื่อตรวจจับความผิดปกติแบบ real-time",
    "{{ref:module:demand-response-controller}} subscribe `demand.threshold_exceeded` แล้วตัดสินใจว่าจะสั่ง load shedding อุปกรณ์ไหนบ้างตามลำดับความสำคัญที่กำหนดไว้ล่วงหน้า",
  ],
  modules: [
    {
      slug: "meter-collector",
      name: "meter-collector",
      tags: ["meter", "module", "core"],
      description:
        "เก็บข้อมูลดิบจาก IoT meter ทุกตัวทั่วอาคาร รองรับ meter หลายพันตัวที่ส่งข้อมูลความถี่สูง เก็บเป็น time-series โดยไม่ aggregate ล่วงหน้าเพื่อให้ service อื่นเลือกวิธี aggregate เองตามความต้องการ แยกออกมาเป็น service อิสระเพราะ throughput สูงกว่า service อื่นในระบบมาก",
      functions: [
        { sig: "ingestReading(meterId: string, reading: MeterReading): Promise<void>", desc: "รับข้อมูลดิบ 1 จุดจาก meter บันทึกเป็น time-series" },
        { sig: "getReadings(meterId: string, range: TimeRange): Promise<MeterReading[]>", desc: "ดึงข้อมูลดิบในช่วงเวลาที่กำหนด" },
        { sig: "checkMeterHealth(meterId: string): Promise<MeterHealthStatus>", desc: "ตรวจสถานะ meter ว่ายังส่งข้อมูลปกติหรือขาดหายไปนานแค่ไหน" },
      ],
      relatedNotes:
        "ทุกครั้งที่ `ingestReading` สำเร็จ publish event `meter.reading_received` ให้ {{ref:module:anomaly-detector}} และ {{ref:module:demand-response-controller}} subscribe ต่อได้ — ไม่มี service ไหนอ่านข้อมูลดิบตรงจากฐานข้อมูลนี้โดยไม่ผ่าน event",
      internals: {
        constants: [
          { name: "METER_OFFLINE_THRESHOLD_MIN", value: "15" },
          { name: "READING_RETENTION_DAYS", value: "730" },
        ],
        typeSnippet:
          "interface MeterReading {\n  meterId: string;\n  timestamp: string;\n  value: number;\n  unit: \"kWh\" | \"m3\" | \"L\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการตรวจจับ meter ขาดการเชื่อมต่อที่ {{ref:policy:anomaly-alert-threshold-policy}}",
      },
    },
    {
      slug: "demand-response-controller",
      name: "demand-response-controller",
      tags: ["demand-response", "module", "core"],
      description:
        "ตัดสินใจว่าเมื่อไหร่ต้องลดการใช้ไฟ (load shedding) ตามระดับ demand ปัจจุบันเทียบกับ threshold ที่กำหนด เป็น service เดียวที่ตัดสินใจ demand response ทั้งหมด ไม่มี service อื่นสั่ง load shedding เองโดยตรง เพื่อป้องกันคำสั่งขัดแย้งกันจากหลายแหล่ง",
      functions: [
        { sig: "evaluateDemand(facilityId: string, currentLoad: number): Promise<DemandDecision>", desc: "ประเมินว่าต้อง trigger demand response หรือไม่ตามระดับ load ปัจจุบัน" },
        { sig: "triggerLoadShedding(facilityId: string, equipmentIds: string[]): Promise<string>", desc: "สั่งลดโหลดอุปกรณ์ที่ระบุ คืน demandEventId" },
        { sig: "resolveDemandEvent(demandEventId: string): Promise<void>", desc: "ยกเลิกสถานะ demand response เมื่อ load กลับสู่ระดับปกติ" },
      ],
      stateFlow: "normal → threshold_exceeded → load_shedding_active → resolved — ดู {{ref:policy:demand-threshold-load-shedding-policy}}",
      relatedNotes:
        "ไม่สั่งควบคุมอุปกรณ์ตรง ส่งคำสั่งผ่าน {{ref:module:equipment-scheduler}} เสมอ เพื่อให้มีจุดเดียวที่ตัดสินใจลำดับความสำคัญเมื่อคำสั่งจากหลายแหล่งขัดแย้งกัน",
      internals: {
        constants: [
          { name: "DEMAND_THRESHOLD_KW_DEFAULT", value: "5000" },
          { name: "LOAD_SHED_COOLDOWN_MIN", value: "30" },
        ],
        typeSnippet:
          "interface DemandDecision {\n  shouldShedLoad: boolean;\n  targetReductionKw: number;\n  candidateEquipment: string[];\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เต็มที่ {{ref:policy:demand-threshold-load-shedding-policy}}",
      },
    },
    {
      slug: "equipment-scheduler",
      name: "equipment-scheduler",
      tags: ["scheduling", "module"],
      description:
        "จัดตารางเปิด-ปิดอุปกรณ์อัตโนมัติตามเงื่อนไขที่กำหนด (เวลา, demand response, การบำรุงรักษา) เป็นจุดเดียวที่ตัดสินใจลำดับความสำคัญเมื่อมีคำสั่งขัดแย้งกันจากหลายแหล่ง เช่น demand response สั่งปิดพร้อมกับตารางบำรุงรักษาสั่งเปิด",
      functions: [
        { sig: "scheduleEquipment(equipmentId: string, action: \"on\" | \"off\", at: string): Promise<string>", desc: "กำหนดตารางเปิด/ปิดอุปกรณ์ล่วงหน้า" },
        { sig: "resolveConflict(equipmentId: string, requests: ScheduleRequest[]): Promise<ScheduleRequest>", desc: "ตัดสินใจคำสั่งไหนชนะเมื่อมีคำสั่งขัดแย้งกันสำหรับอุปกรณ์เดียวกัน" },
        { sig: "getScheduleStatus(equipmentId: string): Promise<EquipmentStatus>", desc: "คืนสถานะตารางปัจจุบันของอุปกรณ์" },
      ],
      relatedNotes:
        "รับคำสั่งจาก {{ref:module:demand-response-controller}} และจากตารางบำรุงรักษาปกติพร้อมกันได้ — ดู {{ref:policy:equipment-minimum-off-time-policy}} สำหรับข้อจำกัดการเปิด-ปิดถี่เกินไป",
    },
    {
      slug: "anomaly-detector",
      name: "anomaly-detector",
      tags: ["anomaly", "module", "core"],
      description:
        "ตรวจจับความผิดปกติของข้อมูลการใช้พลังงานแบบ real-time เช่น การใช้ไฟพุ่งสูงผิดปกติกลางดึกที่ไม่ควรมีคนทำงาน หรือ meter ค่าติดลบที่เป็นไปไม่ได้ทางกายภาพ แยกออกมาจาก meter-collector เพราะ logic การตรวจจับซับซ้อนและเปลี่ยนแปลงบ่อยกว่าการเก็บข้อมูลดิบมาก",
      functions: [
        { sig: "evaluateReading(reading: MeterReading, baseline: BaselineProfile): Promise<AnomalyResult>", desc: "ประเมินว่าค่าที่อ่านได้ผิดปกติจาก baseline หรือไม่" },
        { sig: "raiseAlert(meterId: string, anomalyType: string): Promise<void>", desc: "แจ้งเตือนทีมอาคารเมื่อพบความผิดปกติ" },
        { sig: "updateBaseline(meterId: string, window: TimeRange): Promise<BaselineProfile>", desc: "คำนวณ baseline ใหม่จากข้อมูลย้อนหลัง" },
      ],
      relatedNotes:
        "ใช้ baseline ที่คำนวณจากข้อมูลย้อนหลัง 30 วันเป็นค่าเปรียบเทียบ ไม่ใช้ threshold ตายตัวเพราะรูปแบบการใช้พลังงานต่างกันมากระหว่างวันธรรมดา/วันหยุด/ฤดูกาล ดู {{ref:policy:anomaly-alert-threshold-policy}}",
      internals: {
        constants: [
          { name: "ANOMALY_STDDEV_MULTIPLIER", value: "3" },
          { name: "BASELINE_WINDOW_DAYS", value: "30" },
        ],
        typeSnippet:
          "interface AnomalyResult {\n  isAnomalous: boolean;\n  deviationScore: number;\n  anomalyType?: \"spike\" | \"negative_value\" | \"flatline\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule ที่ {{ref:policy:anomaly-alert-threshold-policy}}",
      },
    },
    {
      slug: "carbon-calculator",
      name: "carbon-calculator",
      tags: ["carbon", "sustainability", "module"],
      description:
        "คำนวณคาร์บอนฟุตพรินต์จากการใช้พลังงานตาม emission factor ของแหล่งพลังงานแต่ละประเภท สร้างรายงานรายเดือนให้ทีมความยั่งยืนขององค์กร แยกออกมาจาก meter-collector เพราะสูตรคำนวณคาร์บอนเปลี่ยนตามมาตรฐานการรายงานที่อัปเดตเป็นระยะ ไม่ใช่ค่าคงที่ถาวร",
      functions: [
        { sig: "calculateFootprint(facilityId: string, period: TimeRange): Promise<CarbonReport>", desc: "คำนวณคาร์บอนฟุตพรินต์ของ facility ในช่วงเวลาที่กำหนด" },
        { sig: "updateEmissionFactor(energyType: string, factor: number): Promise<void>", desc: "อัปเดตค่า emission factor ตามมาตรฐานใหม่" },
        { sig: "generateMonthlyReport(facilityId: string, month: string): Promise<string>", desc: "สร้างรายงานรายเดือน คืน reportId" },
      ],
      relatedNotes:
        "ดึงข้อมูลการใช้พลังงานจาก {{ref:module:meter-collector}} แบบ aggregate รายเดือน ไม่คำนวณจาก raw reading ทุกจุดเพื่อลด load ต่อฐานข้อมูล",
    },
    {
      slug: "utility-bill-reconciler",
      name: "utility-bill-reconciler",
      tags: ["billing", "module"],
      description:
        "เทียบข้อมูลการใช้พลังงานที่ระบบวัดได้กับใบแจ้งหนี้จากการไฟฟ้า/ประปาจริง เพื่อตรวจสอบว่ามีความคลาดเคลื่อนหรือไม่ ช่วยให้ทีมอาคารต่อรองหรือทักท้วงบิลที่ผิดปกติได้ทันเวลาก่อนครบกำหนดชำระ",
      functions: [
        { sig: "importUtilityBill(facilityId: string, bill: UtilityBillData): Promise<void>", desc: "นำเข้าข้อมูลใบแจ้งหนี้จากการไฟฟ้า/ประปา" },
        { sig: "reconcile(facilityId: string, billingPeriod: TimeRange): Promise<ReconciliationResult>", desc: "เทียบข้อมูลที่วัดได้กับบิลจริง คืนผลต่างถ้ามี" },
        { sig: "flagDiscrepancy(facilityId: string, discrepancy: number): Promise<void>", desc: "แจ้งเตือนทีมอาคารเมื่อพบความคลาดเคลื่อนเกินเกณฑ์" },
      ],
      relatedNotes:
        "ต้องรอข้อมูลครบทั้งช่วงเวลาบิลจาก {{ref:module:meter-collector}} ก่อนเทียบเสมอ ถ้าข้อมูลมีช่วงขาดหาย (meter offline) จะ flag ผลการเทียบว่าไม่สมบูรณ์แทนการเทียบด้วยข้อมูลไม่ครบ",
    },
  ],
  envVarGroups: [
    {
      service: "meter-collector-service",
      vars: [
        { name: "METER_OFFLINE_THRESHOLD_MIN", example: "15", note: "" },
        { name: "READING_RETENTION_DAYS", example: "730", note: "" },
      ],
    },
    {
      service: "demand-response-controller-service",
      vars: [
        { name: "DEMAND_THRESHOLD_KW_DEFAULT", example: "5000", note: "ดู {{ref:policy:demand-threshold-load-shedding-policy}}" },
        { name: "LOAD_SHED_COOLDOWN_MIN", example: "30", note: "" },
      ],
    },
    {
      service: "anomaly-detector-service",
      vars: [
        { name: "ANOMALY_STDDEV_MULTIPLIER", example: "3", note: "" },
        { name: "BASELINE_WINDOW_DAYS", example: "30", note: "" },
      ],
    },
    {
      service: "carbon-calculator-service",
      vars: [
        { name: "EMISSION_FACTOR_SOURCE", example: "https://emission-factors.internal/v2", note: "" },
        { name: "CARBON_REPORT_SCHEDULE_CRON", example: "0 3 1 * *", note: "" },
      ],
    },
  ],
  policies: [
    {
      slug: "demand-threshold-load-shedding-policy",
      title: "นโยบายการลดโหลดเมื่อ Demand เกิน Threshold",
      tags: ["demand-response", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ demand ปัจจุบันของ facility เกิน `DEMAND_THRESHOLD_KW_DEFAULT` ระบบจะ trigger load shedding อัตโนมัติตามลำดับความสำคัญของอุปกรณ์ที่กำหนดไว้ล่วงหน้า อุปกรณ์ที่ไม่กระทบการดำเนินงานหลักจะถูกปิดก่อนเสมอ",
        "หลัง trigger load shedding แล้ว ระบบจะไม่ trigger ซ้ำสำหรับ facility เดียวกันภายใน `LOAD_SHED_COOLDOWN_MIN` นาที เพื่อป้องกันการเปิด-ปิดอุปกรณ์ถี่เกินไปจนกระทบอายุการใช้งาน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับอุปกรณ์ที่กระทบความปลอดภัย",
        tags: ["demand-response", "edge-case"],
        body: [
          "อุปกรณ์ที่เกี่ยวข้องกับความปลอดภัย (ระบบระบายอากาศห้องเครื่อง, ระบบทำความเย็น server room) ไม่อยู่ในรายการที่ load shedding เลือกปิดได้อัตโนมัติไม่ว่า demand จะสูงแค่ไหนก็ตาม ต้องได้รับการอนุมัติจากทีมอาคารด้วยมือเท่านั้น",
          "ถ้า demand ยังคงเกิน threshold แม้ปิดอุปกรณ์ที่ไม่ใช่ safety-critical ครบทุกตัวแล้ว ระบบจะแจ้งเตือนทีมอาคารระดับสูงสุดแทนการพยายามปิดอุปกรณ์ safety-critical เอง",
        ],
      },
    },
    {
      slug: "equipment-minimum-off-time-policy",
      title: "นโยบายระยะเวลาปิดขั้นต่ำของอุปกรณ์",
      tags: ["scheduling", "policy"],
      isPrimary: true,
      intro: [
        "อุปกรณ์ที่ถูกสั่งปิดต้องปิดค้างไว้อย่างน้อย 10 นาทีก่อนเปิดใหม่ได้ ไม่ว่าคำสั่งเปิดจะมาจากแหล่งไหนก็ตาม เพื่อป้องกันความเสียหายทางกลไกจากการเปิด-ปิดถี่เกินไป (short cycling)",
        "กฎนี้ใช้กับอุปกรณ์ที่มีมอเตอร์หรือคอมเพรสเซอร์เป็นหลัก อุปกรณ์ประเภทไฟฟ้าแสงสว่างไม่มีข้อจำกัดนี้เพราะไม่มีความเสี่ยงทางกลไกแบบเดียวกัน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อเป็นสถานการณ์ฉุกเฉิน",
        tags: ["scheduling", "edge-case"],
        body: [
          "ถ้าคำสั่งเปิดมาจากการแจ้งเตือนฉุกเฉิน (เช่น อุณหภูมิ server room สูงเกินระดับอันตราย) ระบบจะข้ามกฎระยะเวลาปิดขั้นต่ำและเปิดอุปกรณ์ทันที เพราะความเสี่ยงจากอุปกรณ์ IT เสียหายสูงกว่าความเสี่ยงทางกลไกของมอเตอร์มาก",
          "การข้ามกฎในสถานการณ์ฉุกเฉินทุกครั้งจะถูกบันทึกและแจ้งทีมบำรุงรักษาให้ตรวจสอบอุปกรณ์เพิ่มเติมหลังเหตุการณ์ผ่านไป เพื่อประเมินความเสียหายสะสมที่อาจเกิดขึ้น",
        ],
      },
    },
    {
      slug: "carbon-reporting-frequency-policy",
      title: "นโยบายความถี่การรายงานคาร์บอนฟุตพรินต์",
      tags: ["carbon", "policy"],
      isPrimary: true,
      intro: [
        "รายงานคาร์บอนฟุตพรินต์ต้องสร้างทุกเดือนสำหรับทุก facility โดยอัตโนมัติ ไม่รอให้ทีมความยั่งยืนร้องขอ เพื่อให้มีข้อมูลต่อเนื่องสำหรับการวิเคราะห์แนวโน้มระยะยาว",
        "รายงานที่สร้างแล้วจะไม่ถูกคำนวณใหม่ย้อนหลังโดยอัตโนมัติแม้ emission factor จะเปลี่ยน เพื่อรักษาความสอดคล้องของตัวเลขในรายงานที่เผยแพร่ไปแล้ว การคำนวณใหม่ต้องทำผ่านขั้นตอนพิเศษที่ระบุชัดเจนว่าเป็นฉบับแก้ไข",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อข้อมูล Meter ไม่ครบ",
        tags: ["carbon", "edge-case"],
        body: [
          "ถ้า facility มี meter offline นานเกิน 24 ชั่วโมงในเดือนที่รายงาน ระบบจะสร้างรายงานพร้อม flag ว่าข้อมูลไม่สมบูรณ์ และประมาณการช่วงที่ขาดหายจาก baseline การใช้งานปกติแทน ไม่ใช่ปล่อยรายงานเป็นค่าว่างหรือศูนย์",
          "รายงานที่มี flag ข้อมูลไม่สมบูรณ์จะไม่ถูกใช้เป็นตัวเลขทางการสำหรับการรายงานภายนอก (เช่น รายงานความยั่งยืนต่อผู้ถือหุ้น) จนกว่าทีมอาคารจะยืนยันข้อมูลย้อนหลังให้ครบก่อน",
        ],
      },
    },
    {
      slug: "anomaly-alert-threshold-policy",
      title: "นโยบายเกณฑ์การแจ้งเตือนความผิดปกติ",
      tags: ["anomaly", "policy"],
      isPrimary: true,
      intro: [
        "ค่าที่อ่านได้จาก meter จะถูกแจ้งเตือนว่าผิดปกติเมื่อเบี่ยงเบนจาก baseline เกิน `ANOMALY_STDDEV_MULTIPLIER` เท่าของค่าเบี่ยงเบนมาตรฐาน โดย baseline คำนวณจากข้อมูลย้อนหลัง `BASELINE_WINDOW_DAYS` วัน",
        "ค่าที่เป็นไปไม่ได้ทางกายภาพ (เช่น ค่าติดลบสำหรับ meter ไฟฟ้า) จะถูกแจ้งเตือนทันทีโดยไม่ต้องรอเทียบกับ baseline เพราะเป็นสัญญาณของ meter เสียหรือส่งข้อมูลผิดพลาด ไม่ใช่ความผิดปกติเชิงพฤติกรรมการใช้งาน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นช่วงเปลี่ยนฤดูกาลหรือปรับปรุงอาคาร",
        tags: ["anomaly", "edge-case"],
        body: [
          "ช่วงที่อาคารมีการปรับปรุงหรือเปลี่ยนแปลงการใช้งานอย่างมีนัยสำคัญ (เช่น ติดตั้งอุปกรณ์ใหม่ถาวร) ทีมอาคารสามารถ mark ช่วงเวลานั้นเป็น 'baseline reset' เพื่อไม่ให้ข้อมูลก่อนการเปลี่ยนแปลงมาปนกับการคำนวณ baseline ใหม่",
          "การเปลี่ยนฤดูกาลปกติ (ฤดูร้อน/ฤดูฝน) ไม่ถือเป็นเหตุผลให้ mark baseline reset เพราะ baseline ควรปรับตัวตามฤดูกาลได้เองจากหน้าต่างข้อมูล 30 วันอยู่แล้ว การ mark reset บ่อยเกินไปจะทำให้ baseline ไม่นิ่งพอที่จะตรวจจับความผิดปกติจริงได้",
        ],
      },
    },
    {
      slug: "utility-tariff-schedule-policy",
      title: "นโยบายตารางอัตราค่าไฟฟ้า",
      tags: ["billing", "policy"],
      isPrimary: true,
      intro: [
        "อัตราค่าไฟฟ้าที่ใช้คำนวณต้นทุนพลังงานต้องอัปเดตตามตารางที่การไฟฟ้าประกาศ (peak/off-peak, ฤดูกาล) — {{ref:module:utility-bill-reconciler}} ใช้อัตราปัจจุบันเสมอ ไม่ใช้อัตราเก่าค้างในระบบ",
        "การเปลี่ยนอัตราค่าไฟฟ้าใหม่มีผลตั้งแต่วันที่การไฟฟ้าประกาศให้มีผลเท่านั้น ไม่ใช่วันที่ทีมอัปเดตข้อมูลในระบบ ถ้าอัปเดตช้าต้องคำนวณย้อนหลังให้ถูกต้องตามวันที่มีผลจริง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับสัญญาอัตราพิเศษ",
        tags: ["billing", "edge-case"],
        body: [
          "facility บางแห่งมีสัญญาอัตราพิเศษกับการไฟฟ้าที่ต่างจากอัตรามาตรฐานทั่วไป (เช่น อัตราสำหรับผู้ใช้ไฟรายใหญ่) — กรณีนี้ต้องตั้งค่าอัตราเฉพาะของ facility นั้นแยกต่างหาก ไม่ใช้อัตรามาตรฐานร่วมกับ facility อื่น",
          "สัญญาอัตราพิเศษที่หมดอายุและไม่มีการต่อสัญญาใหม่ จะกลับไปใช้อัตรามาตรฐานโดยอัตโนมัติ พร้อมแจ้งเตือนทีมอาคารล่วงหน้า 30 วันก่อนสัญญาหมดอายุ เพื่อให้มีเวลาต่อรองสัญญาใหม่ถ้าต้องการ",
        ],
      },
    },
    {
      slug: "equipment-maintenance-lockout-policy",
      title: "นโยบายการล็อกอุปกรณ์ระหว่างบำรุงรักษา",
      tags: ["scheduling", "policy"],
      isPrimary: true,
      intro: [
        "อุปกรณ์ที่อยู่ระหว่างบำรุงรักษาต้องถูก mark เป็น 'maintenance lockout' ใน {{ref:module:equipment-scheduler}} ซึ่งจะปฏิเสธคำสั่งเปิด-ปิดจากทุกแหล่งรวมถึง demand response โดยอัตโนมัติ จนกว่าทีมบำรุงรักษาจะปลดล็อกด้วยมือ",
        "การ mark lockout ต้องระบุเหตุผลและระยะเวลาที่คาดว่าจะเสร็จเสมอ ระบบจะแจ้งเตือนถ้า lockout ค้างเกินระยะเวลาที่ระบุไว้โดยไม่มีการปลดล็อก",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อเกิดเหตุฉุกเฉินระหว่าง Lockout",
        tags: ["scheduling", "safety", "edge-case"],
        body: [
          "ถ้าเกิดสถานการณ์ฉุกเฉินที่ต้องการควบคุมอุปกรณ์ที่อยู่ใน lockout (เช่น ไฟไหม้ต้องการปิดระบบระบายอากาศเฉพาะจุด) ทีมความปลอดภัยมีสิทธิ์ override lockout ได้ทันทีผ่านช่องทางฉุกเฉินที่แยกจากการควบคุมปกติ",
          "การ override lockout ทุกครั้งต้องแจ้งทีมบำรุงรักษาทันทีเพื่อประเมินว่างานบำรุงรักษาที่กำลังทำอยู่ปลอดภัยที่จะดำเนินต่อหรือต้องหยุดชั่วคราว ไม่ใช่ปล่อยให้ทีมบำรุงรักษาไม่รู้ตัวว่าอุปกรณ์ถูกควบคุมระหว่างที่ตัวเองกำลังทำงานอยู่",
        ],
      },
    },
    {
      slug: "meter-calibration-interval-policy",
      title: "นโยบายรอบการสอบเทียบ Meter",
      tags: ["meter", "policy"],
      isPrimary: false,
      intro: [
        "meter ทุกตัวต้องได้รับการสอบเทียบ (calibration) ทุก 12 เดือน เพื่อรักษาความแม่นยำของข้อมูลที่ใช้คำนวณบิลและรายงานคาร์บอน",
        "meter ที่เลยกำหนดสอบเทียบจะถูก flag ในรายงานว่าข้อมูลอาจมีความคลาดเคลื่อน แต่ยังคงเก็บข้อมูลต่อไปตามปกติ ไม่หยุดเก็บข้อมูลเพียงเพราะเลยกำหนดสอบเทียบ",
      ],
    },
    {
      slug: "demand-response-approval-policy",
      title: "นโยบายการอนุมัติ Demand Response แบบ Manual",
      tags: ["demand-response", "policy"],
      isPrimary: false,
      intro: [
        "ทีมอาคารสามารถ trigger demand response ด้วยมือได้นอกเหนือจากระบบอัตโนมัติ เช่น เพื่อเตรียมรับมือกับช่วงราคาไฟแพงที่คาดการณ์ล่วงหน้า",
        "การ trigger ด้วยมือต้องระบุเหตุผลเสมอและถูกบันทึกแยกจากการ trigger อัตโนมัติ เพื่อให้วิเคราะห์ภายหลังได้ว่าการลดโหลดแต่ละครั้งเกิดจากเหตุผลอะไร",
      ],
    },
    {
      slug: "energy-benchmark-comparison-policy",
      title: "นโยบายการเทียบเกณฑ์การใช้พลังงาน",
      tags: ["carbon", "policy"],
      isPrimary: false,
      intro: [
        "แต่ละ facility จะถูกเทียบการใช้พลังงานต่อตารางเมตรกับ facility อื่นในกลุ่มประเภทเดียวกัน (สำนักงาน, โรงงาน, คลังสินค้า) เพื่อระบุ facility ที่ใช้พลังงานสูงผิดปกติเทียบกับกลุ่ม",
        "การเทียบเกณฑ์นี้ใช้เพื่อการวิเคราะห์เชิงบริหารเท่านั้น ไม่มีผลต่อการตัดสินใจอัตโนมัติใดๆ ในระบบ — เป็นข้อมูลประกอบการตัดสินใจของทีมความยั่งยืนที่ต้องใช้วิจารณญาณของมนุษย์ประกอบ",
      ],
    },
    {
      slug: "utility-bill-discrepancy-threshold-policy",
      title: "นโยบายเกณฑ์ความคลาดเคลื่อนของบิล",
      tags: ["billing", "policy"],
      isPrimary: false,
      intro: [
        "ความคลาดเคลื่อนระหว่างข้อมูลที่ระบบวัดได้กับบิลจริงที่เกิน 5% จะถูก flag ให้ทีมอาคารตรวจสอบก่อนอนุมัติจ่ายบิล ต่ำกว่านั้นถือเป็นความคลาดเคลื่อนปกติจากวิธีการวัดที่ต่างกัน",
        "ความคลาดเคลื่อนที่เกิดซ้ำติดต่อกันเกิน 3 เดือนสำหรับ facility เดียวกัน แม้จะไม่เกิน 5% ต่อครั้ง จะถูกยกระดับให้ตรวจสอบเชิงลึกเพราะอาจบ่งชี้ปัญหาเชิงระบบที่ต่างจากความคลาดเคลื่อนแบบสุ่ม",
      ],
    },
    {
      slug: "emergency-power-priority-policy",
      title: "นโยบายลำดับความสำคัญพลังงานฉุกเฉิน",
      tags: ["safety", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อแหล่งจ่ายไฟหลักมีปัญหาและต้องใช้เครื่องกำเนิดไฟฟ้าสำรอง อุปกรณ์ที่มีความสำคัญสูงสุด (safety-critical) จะได้รับพลังงานก่อนเสมอตามลำดับที่กำหนดไว้ล่วงหน้า ไม่ใช่แบ่งพลังงานเท่ากันทุกอุปกรณ์",
        "ลำดับความสำคัญนี้ต้องได้รับการทบทวนและอนุมัติจากทีมความปลอดภัยทุกปี เพื่อให้สอดคล้องกับการเปลี่ยนแปลงการใช้งานพื้นที่ภายในอาคารที่อาจเกิดขึ้น",
      ],
    },
  ],
  incidents: [
    {
      slug: "meter-data-gap-wrong-bill-reconciliation",
      title: "ข้อมูล Meter ขาดหายทำให้เทียบบิลผิดพลาด",
      tags: ["meter", "billing"],
      summary:
        "ทีมอาคารทักท้วงบิลค่าไฟที่การไฟฟ้าเรียกเก็บว่าสูงผิดปกติ แต่ตรวจสอบพบว่าจริงๆ แล้วระบบเทียบบิลผิดพลาดเองเพราะข้อมูลที่วัดได้ขาดหายไปช่วงหนึ่งโดยไม่รู้ตัว",
      investigation:
        "ตรวจ {{ref:module:utility-bill-reconciler}} พบว่า meter หลักของ facility นี้ offline ไป 6 ชั่วโมงในช่วงกลางเดือน แต่ `reconcile` คำนวณผลรวมจากข้อมูลที่มีอยู่โดยไม่ได้ตรวจสอบว่าข้อมูลครบทั้งช่วงเวลาหรือไม่",
      cause:
        "ฟังก์ชัน `reconcile` ไม่มีการตรวจสอบความสมบูรณ์ของข้อมูลก่อนคำนวณ ทำให้ช่วงเวลาที่ meter offline ถูกนับเป็น 0 แทนที่จะ flag ว่าข้อมูลไม่สมบูรณ์",
      resolution:
        "คำนวณผลเทียบบิลใหม่โดยประมาณการช่วงที่ขาดหายจาก baseline การใช้งาน แจ้งทีมอาคารว่าบิลจริงถูกต้องแล้ว",
      followup:
        "แก้ `reconcile` ให้ตรวจสอบความสมบูรณ์ของข้อมูลก่อนเสมอ และ flag ผลการเทียบว่าไม่สมบูรณ์เมื่อพบช่วงข้อมูลขาดหาย แทนการคำนวณด้วยข้อมูลไม่ครบเงียบๆ",
    },
    {
      slug: "demand-response-during-maintenance-window",
      title: "Demand Response Trigger ระหว่างช่วงบำรุงรักษา",
      tags: ["demand-response", "maintenance"],
      summary:
        "อุปกรณ์ที่ทีมบำรุงรักษากำลังตรวจสอบอยู่ถูกสั่งปิดกะทันหันจาก demand response อัตโนมัติ ทำให้งานบำรุงรักษาต้องหยุดชะงักและเสี่ยงอันตรายต่อช่างที่กำลังทำงาน",
      investigation:
        "ตรวจ {{ref:module:equipment-scheduler}} พบว่าอุปกรณ์ตัวนี้ยังไม่ถูก mark เป็น maintenance lockout เพราะทีมบำรุงรักษาลืมทำขั้นตอนนี้ก่อนเริ่มงาน และ {{ref:module:demand-response-controller}} ไม่มีทางรู้ว่ามีคนกำลังทำงานกับอุปกรณ์นี้อยู่จริง",
      cause:
        "ระบบพึ่งพา manual mark lockout เพียงอย่างเดียวโดยไม่มีการยืนยันซ้ำ (เช่น เช็คอินก่อนเริ่มงาน) ทำให้ความผิดพลาดของมนุษย์คนเดียวส่งผลกระทบโดยตรงต่อความปลอดภัย",
      resolution:
        "หยุดงานบำรุงรักษาทันที ตรวจสอบความปลอดภัยของช่างที่เกี่ยวข้อง แล้ว mark lockout ให้ถูกต้องก่อนดำเนินงานต่อ",
      followup:
        "เพิ่มขั้นตอนบังคับให้ระบบ lockout ต้องยืนยันก่อนแอปบำรุงรักษาจะปลดล็อกหน้าจอเริ่มงานได้ ไม่ปล่อยให้เป็นขั้นตอนที่ลืมได้ง่าย",
    },
    {
      slug: "anomaly-detector-false-alarm-storm",
      title: "Anomaly Detector แจ้งเตือนเท็จจำนวนมากพร้อมกัน",
      tags: ["anomaly", "incident"],
      summary:
        "ทีมอาคารได้รับการแจ้งเตือนความผิดปกติมากกว่า 200 รายการภายในเวลาไม่ถึงชั่วโมง ทำให้ไม่สามารถแยกแยะได้ว่ารายการไหนเป็นปัญหาจริง",
      investigation:
        "ตรวจ {{ref:module:anomaly-detector}} พบว่าการปรับปรุงอาคารครั้งใหญ่ที่เพิ่งเสร็จเปลี่ยน pattern การใช้พลังงานอย่างมีนัยสำคัญ แต่ทีมอาคารลืม mark 'baseline reset' ตามที่ควรทำ ทำให้ baseline เก่ายังถูกใช้เปรียบเทียบกับพฤติกรรมใหม่ที่ต่างไปมาก",
      cause:
        "ไม่มีการตรวจจับอัตโนมัติว่า pattern การใช้พลังงานเปลี่ยนแปลงอย่างมีนัยสำคัญ ต้องพึ่งพาทีมอาคาร mark ด้วยมือเพียงอย่างเดียวตามที่ระบุใน edge case ของนโยบาย ซึ่งพลาดได้ง่าย",
      resolution:
        "mark baseline reset ทันที ปิดการแจ้งเตือนชั่วคราวจนกว่า baseline ใหม่จะคำนวณเสร็จ",
      followup:
        "พิจารณาเพิ่มการตรวจจับอัตโนมัติว่า pattern เปลี่ยนแปลงมากผิดปกติต่อเนื่องหลายวัน แล้วเสนอให้ทีมอาคาร mark baseline reset แทนที่จะพึ่งพาการจำได้ของทีมอาคารเพียงอย่างเดียว",
    },
    {
      slug: "carbon-calculation-formula-mismatch",
      title: "สูตรคำนวณคาร์บอนไม่ตรงกับมาตรฐานที่อัปเดตแล้ว",
      tags: ["carbon", "bug"],
      summary:
        "ทีมความยั่งยืนพบว่ารายงานคาร์บอนฟุตพรินต์ของไตรมาสล่าสุดมีตัวเลขต่ำกว่าที่ควรจะเป็นเมื่อเทียบกับการคำนวณด้วยมือ",
      investigation:
        "ตรวจ {{ref:module:carbon-calculator}} พบว่า emission factor สำหรับแหล่งพลังงานประเภทหนึ่งถูกอัปเดตในระบบภายนอกไปแล้ว 2 เดือนก่อน แต่ `updateEmissionFactor` ไม่เคยถูกเรียกให้ sync ค่าใหม่เข้าระบบ",
      cause:
        "การอัปเดต emission factor เป็นกระบวนการ manual ทั้งหมด ไม่มี sync อัตโนมัติจากแหล่งข้อมูลมาตรฐานภายนอก ทำให้พลาดการอัปเดตได้ง่ายเมื่อไม่มีใครติดตาม",
      resolution:
        "อัปเดต emission factor ให้ตรงปัจจุบัน แล้วคำนวณรายงานไตรมาสที่ผ่านมาใหม่เป็นฉบับแก้ไขตามขั้นตอนพิเศษที่ระบุไว้",
      followup:
        "พิจารณาทำ sync อัตโนมัติจากแหล่งข้อมูล emission factor มาตรฐานเป็นระยะ พร้อมแจ้งเตือนทีมความยั่งยืนทุกครั้งที่มีการเปลี่ยนแปลงค่า",
    },
    {
      slug: "equipment-schedule-conflict-unresolved",
      title: "ตารางอุปกรณ์ขัดแย้งกันไม่ได้รับการแก้ไข",
      tags: ["scheduling", "bug"],
      summary:
        "อุปกรณ์เครื่องหนึ่งได้รับคำสั่งเปิดและปิดพร้อมกันจากสองแหล่งในเวลาเดียวกัน ทำให้สถานะสุดท้ายไม่แน่นอนและอุปกรณ์เปิด-ปิดสลับกันหลายรอบ",
      investigation:
        "ตรวจ `resolveConflict` ใน {{ref:module:equipment-scheduler}} พบว่าฟังก์ชันนี้ไม่ถูกเรียกในบาง code path ที่เพิ่มเข้ามาใหม่ ทำให้คำสั่งจากสองแหล่งถูกส่งตรงไปยังอุปกรณ์โดยไม่ผ่านการตัดสินใจลำดับความสำคัญ",
      cause:
        "การเพิ่ม feature ใหม่ (ตารางบำรุงรักษาแบบ ad-hoc) ไม่ได้ route ผ่าน `resolveConflict` ตามที่ควรจะเป็น ทำให้ข้าม logic การแก้ไขข้อขัดแย้งไปโดยไม่ตั้งใจ",
      resolution:
        "หยุดตารางที่ขัดแย้งกันทั้งคู่ชั่วคราว ตั้งสถานะอุปกรณ์ด้วยมือให้กลับเป็นปกติ",
      followup:
        "บังคับให้ทุก code path ที่ส่งคำสั่งเปิด-ปิดอุปกรณ์ต้องผ่าน `resolveConflict` เสมอ ไม่มีทางลัดส่งคำสั่งตรงไปยังอุปกรณ์ได้",
    },
    {
      slug: "utility-tariff-update-not-applied",
      title: "อัตราค่าไฟฟ้าใหม่ไม่ถูกนำมาใช้ตรงเวลา",
      tags: ["billing", "bug"],
      summary:
        "การคำนวณต้นทุนพลังงานของ facility หลายแห่งใช้อัตราค่าไฟฟ้าเก่าต่อไปอีกเกือบหนึ่งเดือนหลังจากการไฟฟ้าประกาศอัตราใหม่มีผลแล้ว",
      investigation:
        "ตรวจ {{ref:module:utility-bill-reconciler}} พบว่าทีมที่รับผิดชอบอัปเดตอัตราค่าไฟฟ้าไม่ทราบว่ามีการประกาศอัตราใหม่ เพราะไม่มีกระบวนการติดตามประกาศจากการไฟฟ้าอย่างเป็นระบบ",
      cause:
        "ไม่มีกระบวนการหรือการแจ้งเตือนอัตโนมัติเมื่อการไฟฟ้าประกาศอัตราใหม่ ต้องพึ่งพาทีมติดตามข่าวสารด้วยตัวเองซึ่งพลาดได้ง่าย",
      resolution:
        "อัปเดตอัตราค่าไฟฟ้าให้ตรงปัจจุบันทันที คำนวณต้นทุนย้อนหลังใหม่ตามวันที่อัตราใหม่มีผลจริงตามนโยบาย",
      followup:
        "พิจารณาสมัครรับการแจ้งเตือนอัตราค่าไฟฟ้าใหม่จากการไฟฟ้าโดยตรง แทนการพึ่งพาความจำของทีมเพียงอย่างเดียว",
    },
    {
      slug: "meter-collector-ingest-backlog",
      title: "ข้อมูล Meter ค้างคิวจำนวนมากช่วง Peak Hour",
      tags: ["meter", "performance"],
      summary:
        "ช่วงเวลาที่มีการใช้พลังงานสูงสุดของวัน ข้อมูลจาก meter เข้ามาช้ากว่าปกติหลายนาที ทำให้ demand response ตัดสินใจช้าตามไปด้วย",
      investigation:
        "ตรวจ {{ref:module:meter-collector}} พบว่า MQTT broker ที่รับข้อมูลจาก meter มีคิวค้างสะสมช่วง peak hour เพราะจำนวน meter ที่ส่งข้อมูลพร้อมกันเกินกว่าที่ instance ปัจจุบันประมวลผลทัน",
      cause:
        "ไม่มี autoscaling ที่ตอบสนองเร็วพอสำหรับ ingest pipeline ในช่วง peak hour ซึ่งเป็นช่วงเวลาที่คาดเดาได้ล่วงหน้าทุกวันแต่ระบบยังไม่ scale ล่วงหน้ารองรับ",
      resolution:
        "เพิ่ม instance ชั่วคราวด้วยมือระหว่างเกิดเหตุเพื่อระบายคิวที่ค้างอยู่",
      followup:
        "ตั้ง scheduled scaling ล่วงหน้าก่อนช่วง peak hour ที่คาดเดาได้ แทนการรอ autoscaling ตอบสนองตาม load แบบ reactive อย่างเดียว",
    },
    {
      slug: "carbon-report-generated-twice",
      title: "รายงานคาร์บอนถูกสร้างซ้ำสองฉบับสำหรับเดือนเดียวกัน",
      tags: ["carbon", "bug"],
      summary:
        "ทีมความยั่งยืนพบรายงานคาร์บอนฟุตพรินต์ของเดือนเดียวกันสองฉบับที่มีตัวเลขต่างกันเล็กน้อย ทำให้ไม่แน่ใจว่าฉบับไหนถูกต้อง",
      investigation:
        "ตรวจ scheduled job ที่เรียก `generateMonthlyReport` พบว่ารันซ้อนกันสอง instance เพราะ deploy ใหม่ไม่ได้ปิด instance เก่าให้เสร็จก่อนเปิด instance ใหม่ และข้อมูล meter ที่เข้ามาระหว่างสอง run ต่างกันเล็กน้อยทำให้ตัวเลขไม่ตรงกัน",
      cause:
        "ไม่มี distributed lock กันการรัน scheduled job ซ้อนกันหลาย instance พร้อมกัน — ปัญหาลักษณะเดียวกับที่เคยพบใน background job อื่นของระบบ",
      resolution:
        "ลบรายงานฉบับซ้ำ ยืนยันฉบับที่ถูกต้องกับทีมความยั่งยืน",
      followup:
        "เพิ่ม distributed lock ให้ scheduled job ทุกตัวที่สร้างรายงาน ตรวจสอบ job อื่นในระบบว่ามีปัญหาแบบเดียวกันหรือไม่",
    },
    {
      slug: "demand-response-cooldown-bypassed",
      title: "ระยะเวลา Cooldown ของ Demand Response ถูกข้ามไป",
      tags: ["demand-response", "bug"],
      summary:
        "อุปกรณ์กลุ่มหนึ่งถูกสั่งปิดจาก demand response สองครั้งติดกันภายในเวลาไม่ถึง 10 นาที ทั้งที่ควรมี cooldown อย่างน้อย `LOAD_SHED_COOLDOWN_MIN` นาที",
      investigation:
        "ตรวจ {{ref:module:demand-response-controller}} พบว่า cooldown ถูกตรวจสอบระดับ facility เดียว แต่การ trigger ครั้งที่สองมาจาก demand event คนละ event ID ที่ระบบไม่ได้เชื่อมโยงว่าเป็น facility เดียวกัน เพราะ bug ในการดึงค่า facilityId จาก event บางประเภท",
      cause:
        "การตรวจสอบ cooldown อ้างอิง facilityId ที่ดึงมาจาก field ที่ไม่สอดคล้องกันระหว่าง event ประเภทต่างๆ ทำให้บาง event หลุดการตรวจสอบ cooldown ไปได้",
      resolution:
        "ปิดการ trigger demand response ชั่วคราวสำหรับ facility ที่ได้รับผลกระทบ ตรวจสอบอุปกรณ์ว่าเสียหายจากการเปิด-ปิดถี่หรือไม่",
      followup:
        "รวม field ที่ใช้ระบุ facilityId ให้สอดคล้องกันในทุกประเภท event และเพิ่ม test ครอบคลุมการตรวจสอบ cooldown ข้าม event ประเภทต่างๆ",
    },
    {
      slug: "anomaly-detector-missed-real-fault",
      title: "Anomaly Detector พลาดตรวจจับความผิดปกติที่เป็นความเสียหายจริง",
      tags: ["anomaly", "near-miss"],
      summary:
        "อุปกรณ์เครื่องปรับอากาศหลักตัวหนึ่งเริ่มใช้พลังงานเพิ่มขึ้นทีละน้อยต่อเนื่องหลายสัปดาห์จากปัญหาทางกลไก แต่ไม่มีการแจ้งเตือนจนกว่าจะเสียหายรุนแรงและต้องซ่อมฉุกเฉิน",
      investigation:
        "ตรวจ {{ref:module:anomaly-detector}} พบว่าเพราะ baseline คำนวณใหม่ทุกวันจากข้อมูลย้อนหลัง 30 วัน การเพิ่มขึ้นแบบค่อยเป็นค่อยไปถูกดูดซับเข้าไปใน baseline เองเรื่อยๆ ทำให้ deviation score ไม่เคยสูงพอที่จะ trigger การแจ้งเตือน",
      cause:
        "อัลกอริทึมตรวจจับความผิดปกติแบบ baseline-relative ไม่เหมาะกับการตรวจจับแนวโน้มค่อยเป็นค่อยไปในระยะยาว (slow drift) เพราะ baseline ที่ปรับตัวเร็วเกินไปจะ \"ตามทัน\" ความผิดปกติที่ค่อยๆ เพิ่มขึ้น",
      resolution:
        "ซ่อมอุปกรณ์ฉุกเฉิน ตรวจสอบอุปกรณ์อื่นที่มีลักษณะการทำงานคล้ายกันว่ามีแนวโน้มเดียวกันหรือไม่",
      followup:
        "เพิ่มการตรวจจับ slow drift แยกต่างหากที่เทียบกับ baseline ระยะยาวกว่า (เช่น 6 เดือน) ควบคู่กับ baseline ระยะสั้นที่ใช้อยู่ปัจจุบัน ไม่พึ่งพา baseline แบบปรับตัวเร็วเพียงอย่างเดียว",
    },
    {
      slug: "utility-bill-reconciler-wrong-facility-mapping",
      title: "บิลถูก Map เข้า Facility ผิดหลังรวมบัญชีผู้ใช้ไฟ",
      tags: ["billing", "bug"],
      summary:
        "หลังองค์กรรวมบัญชีผู้ใช้ไฟฟ้าของสอง facility เข้าด้วยกันเพื่อลดค่าธรรมเนียม พบว่าระบบ map บิลที่ได้เข้า facility ผิดฝั่งเป็นบางเดือน",
      investigation:
        "ตรวจ {{ref:module:utility-bill-reconciler}} พบว่า `importUtilityBill` ใช้หมายเลขบัญชีผู้ใช้ไฟฟ้าเป็นตัวระบุ facility แต่หลังรวมบัญชี หมายเลขเดียวครอบคลุมสอง facility ทำให้ mapping เดิมใช้ไม่ได้อีกต่อไป",
      cause:
        "ระบบออกแบบมาโดยสมมติว่าหนึ่งบัญชีผู้ใช้ไฟฟ้าตรงกับหนึ่ง facility เสมอ ไม่รองรับกรณีที่โครงสร้างทางธุรกิจเปลี่ยนไปในภายหลัง",
      resolution:
        "แก้ไข mapping ด้วยมือให้ตรงตาม facility จริง เพิ่ม field แยกสัดส่วนการใช้พลังงานระหว่างสอง facility ในบัญชีเดียวกัน",
      followup:
        "ปรับโครงสร้างข้อมูลให้รองรับความสัมพันธ์แบบหนึ่งบัญชีต่อหลาย facility ตั้งแต่ต้น ไม่สมมติความสัมพันธ์แบบหนึ่งต่อหนึ่งอีกต่อไป",
    },
    {
      slug: "equipment-scheduler-timezone-bug",
      title: "ตารางอุปกรณ์ทำงานผิดเวลาเพราะ Timezone",
      tags: ["scheduling", "bug"],
      summary:
        "facility ในต่างประเทศพบว่าอุปกรณ์เปิด-ปิดตามตารางเวลาผิดไปจากที่ตั้งไว้เกือบชั่วโมง หลังมีการเปลี่ยนเวลาออมแสง (daylight saving)",
      investigation:
        "ตรวจ {{ref:module:equipment-scheduler}} พบว่า `scheduleEquipment` เก็บเวลาแบบ naive local time โดยไม่ผูก timezone ของ facility ไว้ชัดเจน เมื่อเปลี่ยนเวลาออมแสง การตีความเวลาที่ตั้งไว้ล่วงหน้าจึงคลาดเคลื่อน",
      cause:
        "field เวลาที่ใช้ตั้งตารางไม่มี timezone กำกับ ทำให้การคำนวณเวลาจริงขึ้นอยู่กับการตีความของ server ซึ่งอาจไม่ตรงกับ timezone ของ facility โดยเฉพาะช่วงเปลี่ยนเวลาออมแสง",
      resolution:
        "แก้ตารางที่ได้รับผลกระทบด้วยมือ ปรับให้เก็บเวลาพร้อม timezone กำกับเสมอ",
      followup:
        "ตรวจสอบ field เวลาอื่นทั้งหมดในระบบว่ามีปัญหา naive time แบบเดียวกันหรือไม่ โดยเฉพาะ field ที่ใช้ตั้งตารางล่วงหน้าข้าม timezone",
    },
    {
      slug: "load-shedding-priority-list-outdated",
      title: "ลำดับความสำคัญ Load Shedding ไม่ทันสมัยหลังปรับปรุงพื้นที่",
      tags: ["demand-response", "configuration"],
      summary:
        "หลัง facility ปรับปรุงการใช้พื้นที่ (เปลี่ยนห้องประชุมเป็นพื้นที่ทำงานสำคัญ) demand response ยังคงสั่งปิดไฟในพื้นที่นั้นก่อนตามลำดับความสำคัญเก่าที่ไม่ทันสมัยแล้ว",
      investigation:
        "ตรวจสอบพบว่ารายการลำดับความสำคัญของอุปกรณ์ใน {{ref:module:demand-response-controller}} ไม่มีกระบวนการทบทวนเป็นระยะ ตั้งไว้ครั้งเดียวตอนติดตั้งระบบและไม่เคยอัปเดตตามการเปลี่ยนแปลงการใช้พื้นที่จริง",
      cause:
        "ไม่มีเจ้าของงานที่รับผิดชอบทบทวนลำดับความสำคัญเป็นระยะ ถือเป็นการตั้งค่าครั้งเดียวที่ไม่มีใครนึกถึงอีกหลังติดตั้งเสร็จ",
      resolution:
        "อัปเดตลำดับความสำคัญให้ตรงกับการใช้พื้นที่ปัจจุบัน แจ้งทีมอาคารให้ตรวจสอบ facility อื่นที่อาจมีปัญหาเดียวกัน",
      followup:
        "กำหนดให้ทีมอาคารทบทวนลำดับความสำคัญของ load shedding อย่างน้อยปีละครั้ง หรือทุกครั้งที่มีการปรับปรุงการใช้พื้นที่อย่างมีนัยสำคัญ",
    },
    {
      slug: "meter-health-check-false-positive",
      title: "ระบบแจ้ง Meter Offline ทั้งที่ยังทำงานปกติ",
      tags: ["meter", "monitoring"],
      summary:
        "ทีมอาคารได้รับแจ้งเตือน meter offline สำหรับ meter จำนวนมากพร้อมกัน ทั้งที่ตรวจสอบภาคสนามแล้วพบว่า meter ยังทำงานและส่งข้อมูลปกติทุกตัว",
      investigation:
        "ตรวจ `checkMeterHealth` ใน {{ref:module:meter-collector}} พบว่าปัญหาไม่ได้อยู่ที่ meter แต่อยู่ที่ MQTT broker เองที่มีปัญหาการเชื่อมต่อชั่วคราว ทำให้ข้อมูลที่ส่งมาจริงไม่ถูกบันทึกเข้าระบบ แต่ `checkMeterHealth` ตีความว่า meter ไม่ส่งข้อมูล",
      cause:
        "`checkMeterHealth` ตรวจสอบแค่ว่ามีข้อมูลใหม่เข้ามาในระบบหรือไม่ ไม่แยกแยะระหว่างกรณี \"meter ไม่ส่งข้อมูลจริง\" กับ \"ระบบกลางมีปัญหารับข้อมูลไม่ได้\" ซึ่งเป็นสองสาเหตุที่ต้องแก้ต่างกันโดยสิ้นเชิง",
      resolution:
        "แก้ปัญหา MQTT broker แล้วยืนยันกับทีมอาคารว่า meter ทำงานปกติ ไม่ต้องส่งช่างออกตรวจภาคสนาม",
      followup:
        "แยกการแจ้งเตือนระหว่าง \"meter ไม่ส่งข้อมูล\" กับ \"ระบบกลางรับข้อมูลไม่ได้\" ให้ชัดเจน เพื่อไม่ให้ทีมอาคารเสียเวลาตรวจสอบผิดจุด",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/GRID-274-baseline-drift-detection`, `fix/GRID-289-cooldown-facility-mapping`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(demand-response-controller): แก้ cooldown bypass ข้าม event ประเภทต่างๆ`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่ส่งคำสั่งควบคุมอุปกรณ์ต้องผ่าน `resolveConflict` เสมอ ไม่มีทางลัดส่งคำสั่งตรง (ดูบทเรียนจาก {{ref:incident:equipment-schedule-conflict-unresolved}}) และ field เวลาที่ใช้ตั้งตารางล่วงหน้าต้องผูก timezone ชัดเจนเสมอ" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `evaluateDemand`, `triggerLoadShedding` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`meterId` รูปแบบ `mtr_<ULID>`, `facilityId` รูปแบบ `fac_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ demand response หรือคำสั่งควบคุมอุปกรณ์ต้องมี `demandEventId` หรือ `scheduleId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ห้าม log ข้อมูล meter ดิบปริมาณมาก", body: "ห้าม log raw reading ทุกจุดข้อมูลจาก meter เพราะปริมาณสูงเกินไปและไม่มีประโยชน์ต่อ debug ให้ log เฉพาะ aggregate หรือ error case เท่านั้น" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`GRID_<DOMAIN>_<REASON>` เช่น `GRID_METER_OFFLINE`, `GRID_DEMAND_COOLDOWN_ACTIVE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`GRID_EQUIPMENT_LOCKOUT_ACTIVE`, `GRID_ANOMALY_BASELINE_INCOMPLETE`, `GRID_TARIFF_NOT_CONFIGURED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Concurrent test", body: "ฟังก์ชันที่ส่งคำสั่งควบคุมอุปกรณ์ต้องมี test จำลอง concurrent call จากหลายแหล่งพร้อมกันเสมอ — บทเรียนจาก {{ref:incident:equipment-schedule-conflict-unresolved}}" },
        { heading: "Data gap test", body: "ฟังก์ชันที่คำนวณจากข้อมูล time-series ต้องมี test กรณีข้อมูลขาดหายบางช่วงเสมอ — บทเรียนจาก {{ref:incident:meter-data-gap-wrong-bill-reconciliation}}" },
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
      slug: "time-series-data-convention",
      title: "Time-series Data Convention",
      tags: ["data", "meter"],
      intro: "เอกสารนี้กำหนดวิธีจัดการข้อมูล time-series จาก meter ให้สอดคล้องกันทั้งระบบ เพราะเป็นข้อมูลปริมาณมากที่สุดในระบบ",
      sections: [
        { heading: "การเก็บ timestamp", body: "timestamp ทุกจุดข้อมูลต้องเป็น UTC เสมอ ไม่เก็บ local time — การแปลงเป็น local time ทำที่ layer การแสดงผลเท่านั้น เพื่อป้องกันปัญหาแบบที่เคยเกิดกับ {{ref:incident:equipment-scheduler-timezone-bug}}" },
        { heading: "การจัดการข้อมูลขาดหาย", body: "ห้าม interpolate ค่าที่ขาดหายแล้วเก็บเป็นข้อมูลจริงปนกับข้อมูลที่วัดได้จริง ต้อง flag แยกชัดเจนว่าเป็นค่าประมาณการเสมอในทุก query ที่ดึงข้อมูลออกไปใช้งาน" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → conflict-resolution test (ครอบคลุมคำสั่งขัดแย้งจากหลายแหล่ง) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:demand-response-controller}} และ {{ref:module:equipment-scheduler}} ต้องผ่าน test ครอบคลุม safety-critical equipment 100% ก่อน merge เสมอ เพราะความผิดพลาดกระทบความปลอดภัยจริงในอาคาร" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → demand-response-controller | 2s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| meter-collector → database pool acquire | 3s | `pg-pool` config |\n| MQTT broker → meter-collector | 5s | env `MQTT_INGEST_TIMEOUT_MS` |" },
        { heading: "เหตุผลที่ demand-response-controller timeout สั้น", body: "การตัดสินใจ load shedding ต้องเร็วเพราะ demand ที่เกิน threshold อาจนำไปสู่ไฟดับทั้ง facility ถ้าตัดสินใจช้าเกินไป — สั้นกว่า service อื่นในระบบทั้งหมด" },
      ],
    },
    {
      slug: "meter-fleet-provisioning-runbook",
      title: "Meter Fleet Provisioning Runbook",
      tags: ["meter", "runbook"],
      intro: "ขั้นตอนการเพิ่ม meter ใหม่เข้าระบบเมื่อติดตั้ง facility ใหม่หรือขยาย fleet ของ facility เดิม",
      sections: [
        { heading: "ก่อนเปิดใช้งาน", body: "ต้องลงทะเบียน meter ใน `meter_registry` และตั้งค่า baseline เริ่มต้นก่อนเชื่อมต่อจริง ไม่ปล่อยให้ meter ส่งข้อมูลเข้าระบบก่อนมี baseline อ้างอิง" },
        { heading: "หลังเปิดใช้งาน", body: "ตรวจสอบว่า meter ส่งข้อมูลสม่ำเสมออย่างน้อย 48 ชั่วโมงก่อนเปิดใช้การแจ้งเตือน anomaly เพื่อให้มีข้อมูลเพียงพอสำหรับ baseline เริ่มต้นที่แม่นยำ" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = คำสั่งควบคุมอุปกรณ์ safety-critical ผิดพลาดหรือ demand response ทำงานผิดจนเสี่ยงไฟดับ, Sev2 = กระทบข้อมูลบิลหรือรายงานคาร์บอน, Sev3 = กระทบเล็กน้อยไม่ถึงการควบคุมอุปกรณ์จริง" },
        { heading: "กรณีที่เกี่ยวกับความปลอดภัย", body: "ทุกเหตุการณ์ที่เกี่ยวข้องกับอุปกรณ์ safety-critical ต้องยกระดับเป็น Sev1 เสมอและแจ้งทีมความปลอดภัยของอาคารทันที เขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "meter offline เกิน `METER_OFFLINE_THRESHOLD_MIN` นาที, demand response trigger ที่ไม่ resolve ภายใน 1 ชั่วโมง, MQTT broker queue depth เกิน threshold ช่วง peak hour" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้คำสั่งควบคุมอุปกรณ์ผิดพลาดหรือ demand response ตัดสินใจผิด ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:equipment-schedule-conflict-unresolved}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมอาคารทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| meter-collector | 4 | 20 | ingest queue depth > 1000 |\n| demand-response-controller | 2 | 6 | latency p95 > 100ms |\n| anomaly-detector | 2 | 8 | processing lag > 30s |" },
        { heading: "ข้อจำกัดที่ต้องระวัง", body: "meter-collector ต้อง scale ล่วงหน้าก่อน peak hour ที่คาดเดาได้ทุกวัน ไม่รอ autoscale ตอบสนองแบบ reactive อย่างเดียว — บทเรียนจาก {{ref:incident:meter-collector-ingest-backlog}}" },
      ],
    },
    {
      slug: "carbon-reporting-audit-runbook",
      title: "Carbon Reporting Audit Runbook",
      tags: ["carbon", "compliance", "runbook"],
      intro: "ขั้นตอนเตรียมความพร้อมเมื่อทีมความยั่งยืนต้องส่งรายงานคาร์บอนฟุตพรินต์ให้หน่วยงานภายนอกตรวจสอบ (audit)",
      sections: [
        { heading: "ก่อนการ audit", body: "ตรวจสอบว่าทุกรายงานในช่วงที่ตรวจสอบไม่มี flag ข้อมูลไม่สมบูรณ์ค้างอยู่ ถ้ามีต้องยืนยันข้อมูลย้อนหลังให้ครบก่อนส่งมอบรายงานให้ผู้ตรวจสอบภายนอก" },
        { heading: "บทเรียนจากเหตุการณ์จริง", body: "ดู {{ref:incident:carbon-calculation-formula-mismatch}} — ต้องยืนยันว่า emission factor ที่ใช้ตรงกับมาตรฐานล่าสุดก่อนส่งรายงาน audit เสมอ ไม่ใช้ค่าที่อาจค้างจากการอัปเดตที่พลาดไป" },
      ],
    },
  ],
};
