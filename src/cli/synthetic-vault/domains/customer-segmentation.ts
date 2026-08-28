import type { DomainProfile } from "../types.js";

// SegmentIQ — แพลตฟอร์ม customer segmentation สำหรับทีม marketing
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const customerSegmentation: DomainProfile = {
  id: "customer-segmentation",
  displayName: "SegmentIQ — แพลตฟอร์ม Customer Segmentation",
  summary: [
    "SegmentIQ คือแพลตฟอร์ม customer analytics และ segmentation สำหรับทีม marketing สร้าง audience segment จากข้อมูล behavioral data หลายแหล่ง ได้แก่ web events, purchase history, และ support interactions — ทั้งหมดผ่านการ ingest และ normalize ก่อนนำมาใช้ไม่มีการเขียน query ตรงบน production database ของระบบอื่น",
    "SegmentIQ แบ่งออกเป็นหลาย module ย่อยตามหน้าที่ ตั้งแต่การ ingest event, สร้าง segment definition, refresh membership รายวัน ไปจนถึง export segment ไปยัง marketing channel และวัด segment health metrics ทีม marketing ใช้ dashboard เดียวจัดการ segment ทั้งหมดโดยไม่ต้องเขียน SQL เอง",
  ],
  domainTags: ["customer-segmentation", "segmentiq"],
  serviceBoundaryNote: [
    "แต่ละ module มีฐานข้อมูลของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:event-ingester}} เป็นเจ้าของ raw event store ส่วน {{ref:module:segment-builder}} เป็นเจ้าของ segment definition และ membership snapshot ทั้งสองไม่ share ตารางกันโดยตรง",
    "{{ref:module:membership-refresher}} เป็น module เดียวที่ query ทั้ง event store ของ {{ref:module:event-ingester}} และ segment definition ของ {{ref:module:segment-builder}} พร้อมกันได้ — เป็นข้อยกเว้นที่ตั้งใจเพราะการคำนวณ membership ต้องเห็นทั้งสองพร้อมกันเพื่อไม่ให้ใช้ event snapshot คนละช่วงเวลา",
  ],
  apiGatewayNote: [
    "คำขอจากทีม marketing ผ่าน self-service portal เข้ามาทาง REST API gateway กลาง ซึ่งตรวจสอบ auth และ authorization ว่า user มีสิทธิ์เข้าถึง segment ที่ขอหรือไม่ก่อนส่งต่อให้ {{ref:module:segment-builder}}",
    "การ export segment ไปยัง marketing channel ไม่ได้เกิดจาก user trigger โดยตรง — {{ref:module:channel-exporter}} ทำงานตาม schedule ที่กำหนดไว้ล่วงหน้า และอ่าน segment membership ล่าสุดจาก {{ref:module:membership-refresher}} ก่อน export ทุกครั้ง",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:event-ingester}} ดูแล ได้แก่ `events` (raw event ทุกชิ้นที่ ingest เข้ามา), `event_dedup_log` (fingerprint สำหรับตรวจ duplicate), และ `event_schemas` สำหรับ version ของ schema แต่ละ event type",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `events` | event-ingester | partition by date เพื่อ query performance |\n| `segment_definitions` | segment-builder | definition ของ segment แต่ละตัว |\n| `segment_memberships` | membership-refresher | snapshot ล่าสุดว่า customer ไหนอยู่ใน segment ไหน |\n| `export_logs` | channel-exporter | ประวัติ export ทุกครั้งพร้อม channel และ result |\n| `health_scores` | health-monitor | ค่า health score ของแต่ละ segment รายวัน |\n| `attribution_results` | attribution-engine | ผลการคำนวณ attribution ต่อ segment |",
    "ทุกตารางที่เกี่ยวกับ customer ต้องไม่เก็บ PII โดยตรง — ใช้ `customer_token` (hash ของ customer ID) แทน ดู {{ref:policy:pii-field-inclusion-policy}} สำหรับกฎเรื่องนี้",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `event.ingested`, `segment.definition_updated`, `membership.refresh_completed`, `export.completed`, `export.failed` — {{ref:module:membership-refresher}} subscribe `segment.definition_updated` เพื่อ trigger refresh ทันทีเมื่อ definition เปลี่ยน",
    "{{ref:module:health-monitor}} subscribe `membership.refresh_completed` เพื่อคำนวณ health score ทันทีหลัง refresh เสร็จ โดยไม่ต้องรัน schedule แยก ออกแบบแบบนี้เพื่อให้ health score ล่าสุดพร้อมก่อนที่ {{ref:module:channel-exporter}} จะ export ในรอบถัดไปเสมอ",
  ],
  modules: [
    {
      slug: "event-ingester",
      name: "event-ingester",
      tags: ["ingestion", "module", "core"],
      description:
        "รับ behavioral event จากหลาย source ได้แก่ web tracking pixel, purchase webhook จาก e-commerce system, และ support ticket event จาก helpdesk — ทำ normalize, validate schema, และ deduplicate ก่อนบันทึกลง event store แยกออกมาเป็น module อิสระเพราะ logic การจัดการ source แต่ละแหล่งต่างกัน และการ scale ต้องทำแยกจาก module อื่น",
      functions: [
        { sig: "ingestEvent(source: EventSource, payload: unknown): Promise<IngestResult>", desc: "รับ event ใหม่ validate schema และ check duplicate ก่อน store" },
        { sig: "getEventsByCustomer(customerToken: string, since: string): Promise<Event[]>", desc: "ดึง event ของ customer ในช่วงเวลาที่ระบุ ใช้ customer_token ไม่ใช่ PII โดยตรง" },
        { sig: "purgeEventsOlderThan(retentionDays: number): Promise<number>", desc: "ลบ event ที่เก่าเกินกว่า retention policy คืนจำนวนที่ลบ ดู {{ref:policy:data-retention-policy}}" },
        { sig: "getSchemaVersion(eventType: string): Promise<SchemaVersion>", desc: "ดึง schema version ปัจจุบันของ event type นั้นสำหรับ backward compatibility check" },
      ],
      stateFlow: "received → validated → deduplicated → stored | rejected (schema invalid หรือ duplicate) — ดู {{ref:policy:segment-freshness-sla-policy}} สำหรับ SLA ของเวลา ingest ถึงพร้อมใช้",
      relatedNotes:
        "{{ref:module:membership-refresher}} query event store ของ module นี้เพื่อคำนวณ membership — ถ้า event-ingester ช้าหรือ backlog สะสม จะทำให้ membership ที่คำนวณได้ใช้ข้อมูลเก่า ซึ่งเป็น root cause ของ {{ref:incident:segment-membership-stale-event-data}}",
      internals: {
        constants: [
          { name: "EVENT_DEDUP_WINDOW_HOURS", value: "24" },
          { name: "MAX_EVENT_PAYLOAD_BYTES", value: "65536" },
          { name: "INGEST_BATCH_SIZE", value: "500" },
        ],
        typeSnippet:
          "interface IngestResult {\n  eventId: string;\n  status: \"stored\" | \"duplicate\" | \"rejected\";\n  reason?: \"schema_invalid\" | \"payload_too_large\" | \"duplicate_fingerprint\";\n  ingestedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:segment-freshness-sla-policy}}",
      },
    },
    {
      slug: "segment-builder",
      name: "segment-builder",
      tags: ["segmentation", "module", "core"],
      description:
        "ให้ทีม marketing สร้างและจัดการ segment definition โดยเลือก criteria เช่น event type, frequency, recency, และ attribute ต่างๆ — segment definition ถูก store เป็น structured rule ที่ {{ref:module:membership-refresher}} จะ evaluate เพื่อคำนวณว่า customer คนไหนอยู่ใน segment ไหน แยกออกมาจาก membership refresher เพราะ definition ไม่ค่อยเปลี่ยน แต่ membership เปลี่ยนรายวัน",
      functions: [
        { sig: "createSegment(definition: SegmentDefinition, createdBy: string): Promise<Segment>", desc: "สร้าง segment ใหม่ validate rule syntax และ publish event ให้ refresher" },
        { sig: "updateSegment(segmentId: string, definition: SegmentDefinition, updatedBy: string): Promise<void>", desc: "แก้ definition ของ segment ที่มีอยู่ trigger refresh อัตโนมัติ" },
        { sig: "previewSegmentSize(definition: SegmentDefinition): Promise<number>", desc: "ประมาณขนาด segment จาก event snapshot โดยไม่ commit definition ให้ใช้ก่อน save จริง" },
        { sig: "archiveSegment(segmentId: string, archivedBy: string): Promise<void>", desc: "archive segment ที่ไม่ใช้แล้ว ดู {{ref:policy:segment-archival-policy}}" },
      ],
      stateFlow: "draft → active → paused | archived — ดู {{ref:policy:minimum-segment-size-policy}} สำหรับเงื่อนไขก่อน active segment ที่เพิ่งสร้าง",
      relatedNotes:
        "ทุกครั้งที่ segment definition เปลี่ยน จะ publish event `segment.definition_updated` ให้ {{ref:module:membership-refresher}} trigger refresh ทันที — ดู {{ref:policy:segment-freshness-sla-policy}} สำหรับ SLA ว่า refresh ต้องเสร็จภายในเท่าไหร่หลัง definition เปลี่ยน",
      internals: {
        constants: [
          { name: "MAX_RULES_PER_SEGMENT", value: "20" },
          { name: "PREVIEW_SAMPLE_SIZE", value: "10000" },
          { name: "MIN_SEGMENT_SIZE_FOR_EXPORT", value: "100" },
        ],
        typeSnippet:
          "interface SegmentDefinition {\n  name: string;\n  rules: SegmentRule[];\n  operator: \"AND\" | \"OR\";\n  lookbackDays: number;\n  excludePiiFields: boolean;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง minimum size และ PII ที่ {{ref:policy:minimum-segment-size-policy}} และ {{ref:policy:pii-field-inclusion-policy}}",
      },
    },
    {
      slug: "membership-refresher",
      name: "membership-refresher",
      tags: ["membership", "refresh", "module"],
      description:
        "คำนวณและอัปเดต segment membership ทุกวันโดย evaluate event data ล่าสุดเทียบกับ segment definition ทั้งหมด — เป็น compute-heavy module ที่รันในช่วง off-peak เพื่อไม่แย่ง resource กับ real-time path แยกออกมาจาก segment-builder เพื่อให้ scale compute ได้แยกจาก definition storage",
      functions: [
        { sig: "refreshSegment(segmentId: string): Promise<RefreshResult>", desc: "คำนวณ membership ใหม่สำหรับ segment เดียว บันทึก snapshot ใหม่ทับของเดิม" },
        { sig: "refreshAll(asOf: string): Promise<RefreshSummary>", desc: "รัน refresh ทุก active segment ตาม schedule รายวัน ใช้ event data ณ เวลา asOf" },
        { sig: "getMembershipSnapshot(segmentId: string): Promise<MembershipSnapshot>", desc: "ดึง snapshot ล่าสุดของ membership รวมถึงเวลาที่คำนวณ" },
        { sig: "getRefreshStatus(): Promise<RefreshStatus>", desc: "ตรวจว่ากำลังมี refresh job รันอยู่หรือไม่ ป้องกัน concurrent run ตาม {{ref:policy:channel-sync-retry-policy}}" },
      ],
      stateFlow: "idle → running → completed | failed — ดู {{ref:policy:segment-freshness-sla-policy}} สำหรับเกณฑ์ว่า membership ถือว่า stale เมื่อไหร่",
      relatedNotes:
        "เป็น module เดียวที่ query ทั้ง event store ของ {{ref:module:event-ingester}} และ definition ของ {{ref:module:segment-builder}} พร้อมกัน และหลัง refresh เสร็จจะ publish `membership.refresh_completed` ให้ {{ref:module:health-monitor}} คำนวณ health score ต่อทันที",
      internals: {
        constants: [
          { name: "REFRESH_SCHEDULE_CRON", value: "\"0 2 * * *\"" },
          { name: "SINGLE_SEGMENT_TIMEOUT_MS", value: "300000" },
          { name: "MAX_CONCURRENT_REFRESH_JOBS", value: "1" },
        ],
        typeSnippet:
          "interface RefreshResult {\n  segmentId: string;\n  previousSize: number;\n  newSize: number;\n  computedAt: string;\n  durationMs: number;\n  status: \"completed\" | \"failed\" | \"skipped_too_small\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง SLA และ concurrent instance ที่ {{ref:policy:segment-freshness-sla-policy}} และ {{ref:policy:channel-sync-retry-policy}}",
      },
    },
    {
      slug: "channel-exporter",
      name: "channel-exporter",
      tags: ["export", "channel", "module"],
      description:
        "ส่ง segment membership ที่ refresh แล้วออกไปยัง marketing channel ต่างๆ เช่น email platform, paid ads, และ push notification service ตาม schedule ที่กำหนดไว้ต่อ channel ทำหน้าที่เป็น adapter ระหว่าง SegmentIQ กับ external channel ทั้งหมด แยกออกมาเพราะแต่ละ channel มี API และ rate limit ที่ต่างกัน",
      functions: [
        { sig: "exportSegment(segmentId: string, channelId: string): Promise<ExportResult>", desc: "ส่ง membership snapshot ล่าสุดไปยัง channel ที่ระบุ ตรวจ freshness ก่อนส่งเสมอ" },
        { sig: "listChannelConfigs(): Promise<ChannelConfig[]>", desc: "คืนรายการ channel ทั้งหมดพร้อม config ปัจจุบัน ไม่รวม credential ดิบ" },
        { sig: "getExportHistory(segmentId: string, limit: number): Promise<ExportLog[]>", desc: "ดึงประวัติ export ของ segment พร้อม status ของแต่ละครั้ง" },
        { sig: "retryFailedExport(exportId: string): Promise<ExportResult>", desc: "ลอง export ซ้ำสำหรับรายการที่ล้มเหลว ดู {{ref:policy:channel-sync-retry-policy}}" },
      ],
      relatedNotes:
        "ตรวจสอบ freshness ของ membership snapshot ก่อนส่งทุกครั้ง — ถ้า snapshot เก่าเกินเกณฑ์ใน {{ref:policy:segment-freshness-sla-policy}} จะ refuse export และแจ้ง error แทนที่จะส่งข้อมูลเก่าออกไป",
    },
    {
      slug: "health-monitor",
      name: "health-monitor",
      tags: ["health", "monitoring", "module"],
      description:
        "คำนวณและติดตาม health score ของแต่ละ segment รายวัน โดยดูจาก metric หลัก ได้แก่ ขนาด segment, อัตราการเปลี่ยนแปลง membership, ความ freshness ของ event data ที่ใช้ และ export success rate — แจ้งเตือนทีม marketing เมื่อ segment มีสัญญาณว่าคุณภาพลดลงก่อนที่จะกระทบผลลัพธ์ campaign",
      functions: [
        { sig: "computeHealthScore(segmentId: string, asOf: string): Promise<HealthScore>", desc: "คำนวณ health score ใหม่สำหรับ segment โดยรวม metric ทุกด้าน" },
        { sig: "getHealthHistory(segmentId: string, days: number): Promise<HealthScore[]>", desc: "ดึงประวัติ health score เพื่อดู trend" },
        { sig: "listDegradedSegments(threshold: number): Promise<Segment[]>", desc: "คืนรายการ segment ที่ health score ต่ำกว่า threshold ดู {{ref:policy:health-score-threshold-policy}}" },
        { sig: "acknowledgeAlert(segmentId: string, acknowledgedBy: string): Promise<void>", desc: "ยืนยันว่าทีมรับรู้ alert แล้วเพื่อหยุด escalate" },
      ],
      relatedNotes:
        "subscribe `membership.refresh_completed` จาก {{ref:module:membership-refresher}} เพื่อ trigger `computeHealthScore` อัตโนมัติหลัง refresh เสร็จทุกครั้ง ดู {{ref:policy:health-score-threshold-policy}} สำหรับเกณฑ์ที่ trigger alert",
    },
    {
      slug: "attribution-engine",
      name: "attribution-engine",
      tags: ["attribution", "analytics", "module"],
      description:
        "คำนวณ attribution ว่า segment ไหนมีส่วนในการ convert customer โดยใช้ lookback window ที่กำหนดตาม policy ตรวจสอบ duplicate conversion event ก่อนนับเสมอเพื่อป้องกัน double-count ใช้ผลลัพธ์ช่วยทีม marketing ตัดสินใจว่า segment ไหนมีคุณภาพและคุ้มค่าต่อการ maintain",
      functions: [
        { sig: "computeAttribution(segmentId: string, conversionEventType: string): Promise<AttributionResult>", desc: "คำนวณ attribution ของ segment สำหรับ conversion type ที่ระบุ" },
        { sig: "getAttributionReport(segmentId: string, window: AttributionWindow): Promise<AttributionReport>", desc: "สร้างรายงาน attribution ตาม lookback window ดู {{ref:policy:attribution-lookback-policy}}" },
        { sig: "listConversionEvents(since: string): Promise<ConversionEvent[]>", desc: "คืน conversion event ที่ dedup แล้วในช่วงเวลาที่ระบุ" },
        { sig: "voidAttribution(attributionId: string, reason: string): Promise<void>", desc: "ยกเลิก attribution result ที่พบว่าผิดพลาด เช่น จาก duplicate event ที่ตกหล่น" },
      ],
      relatedNotes:
        "ดึง conversion event จาก {{ref:module:event-ingester}} และ membership snapshot จาก {{ref:module:membership-refresher}} เพื่อคำนวณว่า customer ที่ convert อยู่ใน segment ไหน ณ เวลาที่ convert ดู {{ref:policy:attribution-lookback-policy}} สำหรับ lookback window ที่ใช้",
    },
  ],
  envVarGroups: [
    {
      service: "event-ingester-service",
      vars: [
        { name: "INGEST_DEDUP_WINDOW_HOURS", example: "24", note: "ช่วงเวลาที่ fingerprint เดิมถือว่า duplicate" },
        { name: "INGEST_MAX_PAYLOAD_BYTES", example: "65536", note: "ขนาด payload สูงสุดที่รับได้ต่อ event" },
        { name: "INGEST_DB_URL", example: "postgres://event-db.internal:5432/events", note: "secret ห้าม log" },
      ],
    },
    {
      service: "membership-refresher-service",
      vars: [
        { name: "REFRESH_CRON_SCHEDULE", example: "0 2 * * *", note: "ช่วงที่ full refresh รายวันรัน ดู {{ref:policy:segment-freshness-sla-policy}}" },
        { name: "REFRESH_SINGLE_TIMEOUT_MS", example: "300000", note: "timeout ต่อ segment เดียว" },
        { name: "REFRESH_MAX_CONCURRENT_JOBS", example: "1", note: "ป้องกัน concurrent run ดู {{ref:policy:channel-sync-retry-policy}}" },
      ],
    },
    {
      service: "channel-exporter-service",
      vars: [
        { name: "EXPORT_FRESHNESS_MAX_AGE_HOURS", example: "26", note: "membership เก่ากว่านี้จะ refuse export ดู {{ref:policy:segment-freshness-sla-policy}}" },
        { name: "EXPORT_MAX_RETRY_COUNT", example: "3", note: "ดู {{ref:policy:channel-sync-retry-policy}}" },
      ],
    },
    {
      service: "health-monitor-service",
      vars: [
        { name: "HEALTH_DEGRADED_THRESHOLD", example: "60", note: "score ต่ำกว่านี้ถือว่า degraded ดู {{ref:policy:health-score-threshold-policy}}" },
        { name: "HEALTH_CRITICAL_THRESHOLD", example: "30", note: "score ต่ำกว่านี้ escalate ทันที" },
      ],
    },
  ],
  policies: [
    {
      slug: "segment-freshness-sla-policy",
      title: "นโยบาย Segment Freshness SLA",
      tags: ["freshness", "sla", "policy"],
      isPrimary: true,
      intro: [
        "membership snapshot ของทุก segment ต้องถูก refresh ให้เสร็จภายใน 26 ชั่วโมงหลังจาก refresh ครั้งก่อนหน้า — เกินนี้ถือว่า stale และ {{ref:module:channel-exporter}} จะ refuse export จนกว่า refresh ใหม่จะเสร็จ",
        "SLA 26 ชั่วโมง (ไม่ใช่ 24 ชั่วโมงตรงๆ) เพื่อให้มี buffer ในกรณีที่ refresh job ช้ากว่าปกติเล็กน้อย โดยไม่ทำให้การ export รอบเช้าถูก block",
      ],
      sections: [
        {
          heading: "เหตุผลที่ refuse export แทนที่จะส่งข้อมูลเก่า",
          body: "การส่ง membership เก่าไปยัง paid ads channel ทำให้เสียงบประมาณกับ audience ที่ไม่ตรงอีกต่อไป — ต้นทุนของการ miss export รอบหนึ่งต่ำกว่าต้นทุนของการส่ง campaign ไปผิดกลุ่มมาก",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Segment ที่ Refresh ล้มเหลวแต่ยังต้องการ Export",
        tags: ["freshness", "export", "edge-case"],
        body: [
          "ถ้า refresh ล้มเหลวและทีม marketing ยืนยันว่าต้องการ export segment นั้นทันทีแม้ข้อมูลจะเก่า สามารถ trigger export โดยใช้ `force_stale=true` ผ่าน admin API ได้ — แต่ต้องมี manager approve ใน ticketing system ก่อน และ export log จะถูก flag ว่าใช้ stale data",
          "export ที่ใช้ stale data จะถูกรายงานแยกใน export history และ health monitor จะ deduct คะแนนจาก health score ของ segment นั้นด้วย เพื่อให้ทีมตระหนักถึงความถี่ที่เกิดเหตุการณ์แบบนี้",
        ],
      },
    },
    {
      slug: "minimum-segment-size-policy",
      title: "นโยบาย Minimum Segment Size ก่อน Export",
      tags: ["segment-size", "export", "policy"],
      isPrimary: true,
      intro: [
        "segment ที่มี membership น้อยกว่า `MIN_SEGMENT_SIZE_FOR_EXPORT` จะไม่ถูก export ไปยัง marketing channel — เพื่อป้องกัน fingerprinting ของ customer ในกลุ่มเล็กมากจาก pattern การ target ที่ specific เกินไป",
        "{{ref:module:channel-exporter}} ตรวจสอบขนาดก่อน export ทุกครั้ง ไม่ใช่แค่ตอนที่ marketing สร้าง segment เพราะขนาด segment เปลี่ยนได้ทุกวันหลัง membership refresh",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Segment ขนาดเล็กสำหรับ Internal Testing",
        tags: ["segment-size", "testing", "edge-case"],
        body: [
          "segment ที่ถูก tag ว่า `internal_test` ได้รับยกเว้นจาก minimum size rule และสามารถ export ไปยัง channel ที่ mark ว่า `test_channel` เท่านั้น — ไม่สามารถ export ไปยัง production channel แม้จะ tag เป็น internal_test ก็ตาม",
          "การ tag `internal_test` ต้องทำโดย admin เท่านั้น ไม่ใช่ self-service ของทีม marketing ทั่วไป เพื่อป้องกันการ bypass minimum size rule โดยไม่ตั้งใจ",
        ],
      },
    },
    {
      slug: "pii-field-inclusion-policy",
      title: "นโยบายการใส่ PII Field ใน Segment Export",
      tags: ["pii", "privacy", "compliance", "policy"],
      isPrimary: true,
      intro: [
        "segment membership ที่ export ออกไปยัง marketing channel ห้ามมี PII field โดยตรง เช่น ชื่อ, email, หรือ phone — ต้องส่งเฉพาะ `customer_token` ที่เป็น hashed identifier เท่านั้น แต่ละ channel รับผิดชอบ resolve token เป็น identity ในระบบของตัวเอง",
        "segment definition ที่สร้างใน {{ref:module:segment-builder}} ต้องตั้ง `excludePiiFields: true` เสมอ — field นี้ไม่ใช่ optional แต่เป็น required ที่ถูก default เป็น true และไม่สามารถ set เป็น false ผ่าน regular API ได้",
      ],
      sections: [
        {
          heading: "ทำไมไม่ส่ง PII ตรงไปยัง channel",
          body: "การส่ง PII ตรงทำให้ SegmentIQ กลายเป็น processor ที่ต้อง sign DPA กับทุก marketing channel ที่เชื่อมต่อ ซึ่งซับซ้อนและมีความเสี่ยงทางกฎหมายสูง การส่งแค่ token ทำให้แต่ละ channel รับผิดชอบ PII ของตัวเองเพียงฝ่ายเดียว",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: PII Field ที่ถูกรวมเข้าใน Export โดยไม่ตั้งใจ",
        tags: ["pii", "incident", "edge-case"],
        body: [
          "ถ้าพบว่า export ที่ออกไปแล้วมี PII field ปนอยู่ ต้องแจ้ง channel ให้ delete data ดังกล่าวทันทีและแจ้ง Data Protection Officer ภายใน 1 ชั่วโมง — เพราะอาจเป็น reportable incident ตาม PDPA/GDPR",
          "{{ref:module:channel-exporter}} มี PII field scanner ที่ scan payload ก่อน send ทุกครั้ง แต่ scanner ทำงานบน field name matching ไม่ใช่ content analysis — ถ้า field ถูกส่งใน nested object ที่ชื่อไม่ตรง pattern อาจผ่านได้ ควร audit export format ทุกครั้งที่ schema เปลี่ยน",
        ],
      },
    },
    {
      slug: "attribution-lookback-policy",
      title: "นโยบาย Attribution Lookback Window",
      tags: ["attribution", "analytics", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:attribution-engine}} ใช้ lookback window 30 วัน เป็น default สำหรับ first-touch attribution — หมายความว่า conversion จะถูก attribute ไปยัง segment ที่ customer เป็น member อยู่ตอนที่ touchpoint แรกเกิดขึ้น ไม่ใช่ตอน convert",
        "window ที่ยาวกว่า 30 วัน ต้องมีการอนุมัติจาก data analytics lead เพราะทำให้ attribution ซ้อนทับกันระหว่าง campaign ได้ง่ายขึ้นและยากต่อการ interpret",
      ],
      sections: [
        {
          heading: "ทำไมต้อง cap lookback ที่ 30 วัน",
          body: "lookback ที่ยาวเกินไปทำให้ segment ที่ customer เคยอยู่เมื่อนานมาแล้วได้รับ credit จากการ convert ในปัจจุบัน ทั้งที่อาจไม่ใช่ segment ที่ drive conversion จริง — 30 วันเป็น consensus ของทีมว่าเป็น window ที่สมเหตุสมผลสำหรับธุรกิจประเภทนี้",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Attribution Double-Count จาก Duplicate Conversion Event",
        tags: ["attribution", "duplicate", "edge-case"],
        body: [
          "ถ้า conversion event เดียวกันถูก ingest ซ้ำสองครั้งในช่วงเวลาต่างกัน (เช่น webhook ส่งซ้ำ) {{ref:module:event-ingester}} อาจไม่ catch duplicate ถ้าห่างกันเกิน `EVENT_DEDUP_WINDOW_HOURS` ทำให้ attribution-engine นับ conversion สองครั้ง",
          "กรณีนี้ต้องใช้ `voidAttribution` เพื่อยกเลิก attribution ที่เกิดจาก duplicate event แล้ว recompute ใหม่ — ระบบไม่ detect duplicate ข้าม dedup window อัตโนมัติ ต้องอาศัยทีมที่สังเกตเห็นตัวเลข attribution ผิดปกติ",
        ],
      },
    },
    {
      slug: "health-score-threshold-policy",
      title: "นโยบาย Health Score Threshold และการ Escalate",
      tags: ["health", "alert", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:health-monitor}} ใช้ score 0-100 โดย 100 คือ segment ที่สมบูรณ์แบบ — score ต่ำกว่า `HEALTH_DEGRADED_THRESHOLD` จะ flag segment เป็น `degraded` และแจ้ง owner segment ผ่าน email, ต่ำกว่า `HEALTH_CRITICAL_THRESHOLD` จะ escalate ไปยัง marketing manager ทันที",
        "health score คำนวณจาก weighted average ของ 4 metric: membership size consistency (30%), event data freshness (30%), export success rate (20%), และ membership churn rate (20%) — ถ้า segment มี membership เป็น 0 จะได้ score 0 โดยอัตโนมัติไม่ว่า metric อื่นจะเป็นอย่างไร",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Health Score คำนวณบน Segment ที่ Membership เป็น 0",
        tags: ["health", "empty-segment", "edge-case"],
        body: [
          "segment ที่ refresh ผ่านแต่ได้ membership 0 คน (ไม่มีใครตรงเงื่อนไขเลย) จะได้ health score 0 ทันทีและถูก mark เป็น `critical` แม้ว่าเหตุผลที่ membership เป็น 0 อาจเป็นเพราะ definition ที่ intentionally strict ไม่ใช่ error",
          "เพื่อป้องกัน false critical alert กรณีนี้ owner segment สามารถ set `allow_empty=true` ใน definition ได้ ซึ่งจะ exclude membership size จากการคำนวณ score และ health monitor จะใช้ 3 metric ที่เหลือแทน — แต่ segment ที่ `allow_empty=true` ยังคงถูก block จาก export ตาม {{ref:policy:minimum-segment-size-policy}}",
        ],
      },
    },
    {
      slug: "channel-sync-retry-policy",
      title: "นโยบาย Channel Sync Retry Limit",
      tags: ["export", "retry", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ export ไปยัง marketing channel ล้มเหลว {{ref:module:channel-exporter}} จะ retry ตาม exponential backoff สูงสุด `EXPORT_MAX_RETRY_COUNT` ครั้งก่อนถือว่า export นั้น `failed` และแจ้ง owner segment",
        "ห้าม retry ถ้า channel ตอบกลับด้วย `4xx` error (ยกเว้น `429 rate_limit`) เพราะมักหมายถึง config ผิดหรือ credential expired ที่ไม่หายเองจาก retry — retry ในกรณีนั้นเปลืองโควต้า API โดยเปล่าประโยชน์",
      ],
      sections: [
        {
          heading: "การป้องกัน Concurrent Refresh Instance",
          body: "นโยบายนี้ยังครอบคลุม {{ref:module:membership-refresher}} ด้วย — `MAX_CONCURRENT_REFRESH_JOBS` ถูก set เป็น 1 ตลอดเวลา ถ้า refresh job ใหม่ถูก trigger ขณะที่มี job รันอยู่แล้ว job ใหม่จะถูก queue ไว้รอ ไม่รันซ้อนกัน เพราะ concurrent refresh บน event store เดียวกันทำให้ membership snapshot ที่ได้ไม่ consistent",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Export ล้มเหลวทุก Channel พร้อมกัน",
        tags: ["export", "outage", "edge-case"],
        body: [
          "ถ้า export ล้มเหลวพร้อมกันมากกว่า 3 channel ใน 30 นาที ระบบจะ assume ว่าเป็น systemic issue (เช่น network หรือ credential rotation) ไม่ใช่ channel เฉพาะ และหยุด retry ทุก channel ชั่วคราว 2 ชั่วโมงก่อนลองใหม่",
          "ระหว่าง 2 ชั่วโมงนั้น on-call engineer จะได้รับ alert ให้ตรวจสอบ ถ้า confirm ว่าปัญหาแก้แล้วก่อนครบ 2 ชั่วโมง สามารถ manual trigger retry ได้ผ่าน admin API โดยไม่ต้องรอ",
        ],
      },
    },
    {
      slug: "event-deduplication-policy",
      title: "นโยบายการ Deduplicate Event",
      tags: ["deduplication", "data-quality", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:event-ingester}} ตรวจ duplicate โดยใช้ fingerprint ที่คำนวณจาก combination ของ `source`, `eventType`, `customerToken`, และ `occurredAt` รายการที่ fingerprint ตรงกันภายใน `EVENT_DEDUP_WINDOW_HOURS` จะถูก reject เงียบๆ พร้อม status `duplicate`",
        "event ที่ถูก reject เป็น duplicate ไม่ถูกบันทึกลง store แต่จะ log fingerprint ไว้ใน `event_dedup_log` เพื่อให้ตรวจสอบย้อนหลังได้ว่า event ไหน duplicate มาจากที่ใด",
      ],
    },
    {
      slug: "export-format-policy",
      title: "นโยบายรูปแบบ Export File",
      tags: ["export", "format", "policy"],
      isPrimary: false,
      intro: [
        "segment export ทุกชนิดใช้ format เดียวกันคือ JSON Lines (`.jsonl`) ไม่ว่าจะส่งไปยัง channel ใด — แต่ละ line เป็น JSON object ที่มีอย่างน้อย `customer_token` และ `segment_id` ส่วน field เสริมขึ้นกับ channel requirement",
        "{{ref:module:channel-exporter}} มี adapter ต่อ channel ที่แปลง JSONL เป็น format ที่ channel ต้องการก่อนส่ง เพื่อให้ core export logic ไม่ต้องรู้ channel format ต่างๆ",
      ],
    },
    {
      slug: "segment-archival-policy",
      title: "นโยบายการ Archive Segment ที่ไม่ใช้งาน",
      tags: ["lifecycle", "archive", "policy"],
      isPrimary: false,
      intro: [
        "segment ที่ไม่มีการ export เกิน 90 วัน และไม่มี active campaign ใช้งาน จะถูก flag อัตโนมัติให้ owner ตัดสินใจว่าจะ archive หรือ keep — ระบบไม่ archive โดยอัตโนมัติโดยไม่มีการยืนยัน",
        "หลัง archive membership refresh จะหยุดทำงานสำหรับ segment นั้น เพื่อลด compute load แต่ definition และ history ยังคงอยู่ในระบบ สามารถ restore ได้ตลอดเวลาโดยไม่สูญหาย",
      ],
    },
    {
      slug: "data-retention-policy",
      title: "นโยบาย Data Retention ของ Event Store",
      tags: ["retention", "compliance", "policy"],
      isPrimary: false,
      intro: [
        "raw event ใน {{ref:module:event-ingester}} ถูก retain ไว้ 365 วัน หลังจากนั้นจะถูก purge โดย `purgeEventsOlderThan` job ที่รันรายสัปดาห์ membership snapshot ใน {{ref:module:membership-refresher}} ถูก retain 90 วัน (เก็บแค่ snapshot ล่าสุดของแต่ละ segment ไม่ใช่ทุก snapshot)",
        "การ extend retention เกินค่า default ต้องได้รับการอนุมัติจาก Data Protection Officer และต้องมีเหตุผลทางกฎหมายที่ชัดเจน เช่น litigation hold",
      ],
    },
    {
      slug: "channel-credential-rotation-policy",
      title: "นโยบายการ Rotate Credential ของ Marketing Channel",
      tags: ["credential", "security", "channel", "policy"],
      isPrimary: false,
      intro: [
        "API credential ของทุก marketing channel ต้อง rotate ทุก 90 วัน — {{ref:module:channel-exporter}} มี credential store แยกต่างหากที่เข้ารหัส และทีม IT ต้องอัปเดต credential ใหม่ก่อน credential เก่าหมดอายุอย่างน้อย 7 วัน",
        "ถ้า credential expired และ export ล้มเหลว on-call engineer ต้อง rotate ก่อน retry — ตาม {{ref:policy:channel-sync-retry-policy}} การ retry โดยไม่แก้ credential จะเปลืองโควต้า API และอาจทำให้ channel ban IP ได้",
      ],
    },
  ],
  incidents: [
    {
      slug: "segment-membership-stale-event-data",
      title: "Membership คำนวณด้วย Event Data เก่าจาก Ingester Backlog",
      tags: ["membership", "freshness", "data-quality"],
      summary:
        "ทีม marketing สังเกตว่า segment สำหรับ high-value customer มีขนาดเล็กกว่าที่คาดมากหลังจาก campaign ใหม่เปิดตัว ทั้งที่มี purchase activity สูงช่วงวันก่อนหน้า",
      investigation:
        "ตรวจ {{ref:module:membership-refresher}} พบว่า refresh รอบล่าสุดใช้ event data จาก {{ref:module:event-ingester}} ที่ค้างอยู่ใน backlog กว่า 6 ชั่วโมง ทำให้ purchase event ช่วงค่ำไม่ถูกนำมาคำนวณ",
      cause:
        "ช่วง peak traffic ของ e-commerce ทำให้ ingestion rate เกิน throughput ของ event-ingester ทำให้ backlog สะสม — refresh ตาม schedule ปกติไม่รอให้ backlog clear ก่อน ทำให้ได้ snapshot ที่ไม่สมบูรณ์",
      resolution:
        "รัน manual refresh หลังจาก backlog clear แล้ว ได้ membership ที่ถูกต้องและ export ไปยัง channel สำเร็จ ผลของ campaign ล่าช้าไป 8 ชั่วโมงจากแผน",
      followup:
        "เพิ่ม pre-refresh check ว่า event ingestion lag ต่ำกว่าเกณฑ์ก่อน trigger refresh และ scale ingester service เพิ่มในช่วง peak ตาม {{ref:deployment:scaling-policy}}",
    },
    {
      slug: "export-wrong-channel-config-typo",
      title: "Export ส่งไปผิด Channel จาก Config Typo",
      tags: ["export", "config", "incident"],
      summary:
        "segment สำหรับ premium customer ถูก export ไปยัง email channel ทั่วไปแทน premium email platform เพราะ channel ID ใน config พิมพ์ผิดตัวอักษรหนึ่งตัว",
      investigation:
        "ตรวจ export log ของ {{ref:module:channel-exporter}} พบว่า `channelId` ที่ใช้คือ `email-generic-v2` แทนที่จะเป็น `email-premium-v2` — ตัวอักษรต่างกันแค่คำว่า `generic` กับ `premium` ซึ่ง channel-exporter ไม่ validate ว่า channel ที่ระบุเหมาะสมกับ segment tier หรือไม่",
      cause:
        "ไม่มี validation ว่า channel config ที่ assign ให้ segment ตรงกับ segment tier — ระบบยอมรับ channel ID ใดก็ได้ที่มีอยู่ในระบบ ทำให้ typo ผ่านได้โดยไม่มีการเตือน",
      resolution:
        "แจ้ง email channel ทั่วไปให้ suppress email ที่ยังไม่ได้ส่งออก และ re-export ไปยัง premium channel ที่ถูกต้อง ตรวจสอบว่ามี email ถูกส่งออกไปก่อนหน้าหรือไม่ พบว่ายังไม่มีเพราะ export เพิ่งเกิดขึ้น",
      followup:
        "เพิ่ม `allowed_channels` list ใน segment definition เพื่อ restrict ว่า segment นี้ export ได้ไปยัง channel ใดบ้าง และเพิ่ม diff view ให้ admin review ก่อน confirm export config ใหม่",
    },
    {
      slug: "pii-field-included-accidentally-in-export",
      title: "PII Field ถูกรวมใน Export โดยไม่ตั้งใจหลัง Schema เปลี่ยน",
      tags: ["pii", "compliance", "export"],
      summary:
        "ระหว่าง compliance review พบว่า export ไปยัง email channel สามครั้งล่าสุดมี field `email_raw` ปนอยู่ใน payload ทั้งที่ควรจะส่งแค่ `customer_token`",
      investigation:
        "ตรวจ {{ref:module:channel-exporter}} พบว่า email channel adapter มีการ map field ใหม่ `email_raw` ที่ถูกเพิ่มเข้ามาในรอบ deploy ล่าสุด โดยไม่ผ่าน PII field scanner เพราะชื่อ field ไม่ตรง pattern ที่ scanner รู้จัก",
      cause:
        "PII scanner ใน {{ref:module:channel-exporter}} ใช้ keyword matching บนชื่อ field (`email`, `phone`, `name`) แต่ `email_raw` ไม่ตรง pattern `email` เพราะมี suffix ต่อท้าย ทำให้ผ่านไปได้ตาม {{ref:policy:pii-field-inclusion-policy}}",
      resolution:
        "แจ้ง DPO ทันที ขอให้ channel delete data ดังกล่าว และ rollback adapter เป็นเวอร์ชันก่อนหน้า ยืนยันว่า 3 export ที่ผ่านมายังไม่ถูก process โดย channel ทำให้ manage ได้ทัน",
      followup:
        "เปลี่ยน PII scanner จาก exact keyword matching เป็น fuzzy matching ที่จับ suffix/prefix ด้วย และเพิ่ม mandatory PII review สำหรับทุก PR ที่แก้ channel adapter",
    },
    {
      slug: "attribution-double-counted-duplicate-events",
      title: "Attribution Double-Count จาก Duplicate Conversion Event ข้าม Dedup Window",
      tags: ["attribution", "duplicate", "data-quality"],
      summary:
        "ทีม analytics พบว่า conversion rate ของ segment หนึ่งสูงกว่าที่เป็นไปได้จริงเกือบ 2 เท่า ทำให้งบประมาณที่จัดสรรตาม attribution ผิดเพี้ยน",
      investigation:
        "ตรวจ conversion event ใน {{ref:module:attribution-engine}} พบ event ID ที่ซ้ำกันระหว่าง batch ที่ห่างกัน 36 ชั่วโมง ซึ่งเกิน `EVENT_DEDUP_WINDOW_HOURS` ที่ตั้งไว้ 24 ชั่วโมง ทำให้ event-ingester ไม่ catch duplicate",
      cause:
        "webhook ของ e-commerce system ส่ง conversion event ซ้ำเมื่อมีการ retry หลังจาก timeout โดยไม่ใช้ idempotency key ซึ่งห่างจากการส่งครั้งแรกมากกว่า dedup window",
      resolution:
        "เรียก `voidAttribution` สำหรับ attribution result ที่คำนวณจาก duplicate event และ recompute attribution ใหม่ ประสาน e-commerce team ให้ implement idempotency key ใน webhook",
      followup:
        "เพิ่ม long-window dedup check สำหรับ conversion event โดยเฉพาะ (7 วัน) แยกจาก regular event dedup window และ validate ว่า webhook source ทุกตัวส่ง idempotency key",
    },
    {
      slug: "health-score-computed-on-empty-segment",
      title: "Health Monitor แจ้ง Critical Alert ทุกวันสำหรับ Segment ที่ว่างตั้งใจ",
      tags: ["health", "alert", "false-positive"],
      summary:
        "ทีม marketing ได้รับ critical alert จาก {{ref:module:health-monitor}} ทุกวันสำหรับ segment ที่สร้างขึ้นเพื่อ AB test โดยออกแบบให้ membership เป็น 0 จนกว่าจะ activate",
      investigation:
        "ตรวจ health score calculation พบว่า segment ที่มี membership 0 ได้คะแนน 0 โดยอัตโนมัติและถูก mark เป็น `critical` — ตรงตาม {{ref:policy:health-score-threshold-policy}} แต่ไม่ใช่สิ่งที่ทีมต้องการในกรณีนี้",
      cause:
        "ไม่มีวิธีบอกระบบว่า segment นั้น intentionally empty ทำให้ทุก segment ที่ membership เป็น 0 ถูก treat เหมือนกัน ไม่ว่าจะเป็น error หรือ by design",
      resolution:
        "เพิ่ม `allow_empty=true` flag ใน segment definition ของ AB test segment เพื่อ suppress membership-based scoring ตาม {{ref:policy:health-score-threshold-policy}} alert หยุดทันที",
      followup:
        "เพิ่ม `allow_empty` ใน segment creation form สำหรับ test segment type และ document ว่าควรใช้เมื่อไหร่ใน onboarding ของทีม marketing",
    },
    {
      slug: "membership-refresher-concurrent-instances",
      title: "Membership Refresher รันสอง Instance พร้อมกัน ทำให้ Snapshot Corrupt",
      tags: ["membership", "concurrent", "data-quality"],
      summary:
        "export ในเช้าวันหนึ่งส่ง membership ที่ผสมกันระหว่างสอง segment definition เวอร์ชัน ทำให้ audience ที่ได้รับ campaign ไม่ตรงกับที่ marketing ตั้งใจ",
      investigation:
        "ตรวจ log {{ref:module:membership-refresher}} พบว่ามี refresh job รันสองตัวพร้อมกัน — ตัวแรกเป็น scheduled job ปกติ ตัวที่สองถูก trigger โดย `segment.definition_updated` event ที่มาพร้อมกันโดยบังเอิญ ทั้งสองเขียน snapshot ทับกันระหว่างกลางคัน",
      cause:
        "lock mechanism ที่ป้องกัน concurrent job ทำงานบน segment ID เดียวกัน แต่ไม่ได้ lock ระดับ global — ทำให้ job สองตัวที่รัน different segment ไม่บล็อกกัน แต่เขียนทับ shared snapshot table ได้",
      resolution:
        "หยุด job ทั้งสองตัว ลบ snapshot ที่อาจ corrupt และรัน refresh ใหม่ครั้งเดียวหลังจาก verify ว่าไม่มี job อื่นรันอยู่ re-export ทุก channel ที่ได้รับ snapshot ผิดพลาด",
      followup:
        "เปลี่ยน lock ให้เป็น global distributed lock แทน per-segment lock เพื่อให้มั่นใจว่ามีแค่ instance เดียวที่ write snapshot ในช่วงเวลาใดๆ ตาม {{ref:policy:channel-sync-retry-policy}}",
    },
    {
      slug: "event-ingester-backlog-overflow",
      title: "Event Ingester Backlog ล้นจน Event สูญหาย",
      tags: ["ingestion", "backlog", "data-loss"],
      summary:
        "ช่วง shopping festival event volume พุ่งขึ้น 10 เท่าจากปกติ ทำให้ {{ref:module:event-ingester}} มี backlog สะสมจนถึงขนาดสูงสุดและเริ่ม drop event ใหม่",
      investigation:
        "ตรวจ queue metric พบว่า backlog queue ถึง hard limit ในเวลา 45 นาที หลังจากนั้น event ที่เข้ามาใหม่ถูก reject ด้วย `503 queue_full` แต่ source systems ไม่มีการ retry ทำให้ event นั้นสูญหายจริงๆ",
      cause:
        "scaling rule ของ event-ingester ถูก cap ไว้ที่ 6 replica ซึ่งไม่พอสำหรับ 10x load ตาม {{ref:deployment:scaling-policy}} — ค่านี้ถูกตั้งเมื่อปีก่อนก่อนที่ business จะเติบโตขึ้น",
      resolution:
        "scale ingester ด้วยมือเป็น 12 replica ชั่วคราว backlog ค่อยๆ clear ใน 2 ชั่วโมง ประเมินว่า event ที่สูญหายกระทบ segment ใดบ้างและ mark membership ที่ compute ในช่วงนั้นว่าไม่ reliable",
      followup:
        "อัปเดต max replica cap ของ event-ingester และเพิ่ม alert เมื่อ backlog ถึง 70% ของ limit เพื่อ scale ก่อนล้น",
    },
    {
      slug: "channel-exporter-credential-expired",
      title: "Export ล้มเหลวทุก Slot เพราะ Channel Credential หมดอายุโดยไม่มีการ Rotate",
      tags: ["export", "credential", "reliability"],
      summary:
        "export รอบเช้าของทุก segment ล้มเหลวพร้อมกันด้วย error `401 unauthorized` จาก email channel หลัก",
      investigation:
        "ตรวจ {{ref:module:channel-exporter}} พบว่า API key ของ email channel หมดอายุเมื่อคืนก่อนหน้า ซึ่งตรงกับรอบ 90 วันพอดี แต่ไม่มี reminder ถูก trigger ล่วงหน้า",
      cause:
        "credential rotation reminder ถูก schedule ไว้ที่ 7 วันก่อนหมด แต่ reminder email ไปตกที่ spam folder ของ on-call engineer เพราะ email domain เพิ่งเปลี่ยน ดู {{ref:policy:channel-credential-rotation-policy}}",
      resolution:
        "rotate API key ทันทีและอัปเดตใน credential store แล้ว trigger manual export ทุก segment ที่ล้มเหลว เสร็จภายใน 90 นาทีหลังพบปัญหา",
      followup:
        "เพิ่ม in-app notification ใน platform แทนที่จะพึ่งแค่ email และส่ง reminder ที่ 14 วัน, 7 วัน, และ 1 วันก่อนหมดแทนที่จะส่งครั้งเดียว",
    },
    {
      slug: "segment-builder-timeout-large-segment",
      title: "Preview ขนาด Segment ขนาดใหญ่ Timeout ทำให้ทีมสร้าง Definition ไม่ได้",
      tags: ["segment-builder", "performance", "timeout"],
      summary:
        "ทีม marketing ไม่สามารถ preview segment ที่มี criteria กว้างมากได้ — ทุก `previewSegmentSize` call timeout หลัง 30 วินาที",
      investigation:
        "ตรวจ query execution plan ของ `previewSegmentSize` พบว่า query scan event table แบบ full scan โดยไม่ใช้ index เพราะ rule combination ที่ใช้ไม่ตรงกับ index ที่มี",
      cause:
        "segment rule ที่ include event type ที่ namelength มากกว่า 30 ตัวอักษรไม่ match กับ partial index ที่สร้างไว้ ทำให้ query planner เลือก full scan แทน",
      resolution:
        "add composite index สำหรับ event type ที่ใช้บ่อยใน segment rule และ set query timeout ที่ `previewSegmentSize` ให้ return partial result แทนที่จะ fail ทั้งหมด",
      followup:
        "เพิ่ม slow query monitoring สำหรับ preview call และ document ว่า segment rule pattern ไหนที่ทำให้ query ช้า เพื่อให้ marketing team หลีกเลี่ยง",
    },
    {
      slug: "attribution-lookback-config-mismatch",
      title: "Attribution Lookback Window ต่างกันระหว่าง Report สองฉบับของ Segment เดียว",
      tags: ["attribution", "config", "inconsistency"],
      summary:
        "ทีม analytics พบว่า attribution report สองฉบับสำหรับ segment เดียวกันให้ตัวเลข conversion ต่างกันมาก ทำให้ไม่รู้ว่าตัวเลขไหนถูก",
      investigation:
        "ตรวจ {{ref:module:attribution-engine}} พบว่า report สองฉบับถูก generate ด้วย `lookbackDays` ต่างกัน — ฉบับหนึ่งใช้ค่า default 30 วัน อีกฉบับใช้ 60 วันที่ marketing ขอพิเศษ แต่ไม่มีการ label ใน report ว่าใช้ window เท่าไหร่",
      cause:
        "report ไม่ได้ embed metadata ว่า attribution window ที่ใช้คือเท่าไหร่ ทำให้เมื่อ distribute ให้ stakeholder ต่างคนต่างดูคนละฉบับโดยไม่รู้",
      resolution:
        "เพิ่ม `attributionWindowDays` ใน header ของทุก report และ re-generate report ทั้งสองฉบับใหม่พร้อม label ที่ชัดเจน จัดประชุมกับ stakeholder เพื่อ align ว่าจะใช้ window เท่าไหร่เป็น standard",
      followup:
        "เพิ่ม `attributionWindowDays` เป็น required field ใน attribution report request และแสดงค่านี้ชัดเจนบน report UI ดู {{ref:policy:attribution-lookback-policy}}",
    },
    {
      slug: "health-monitor-false-degraded-alert",
      title: "Health Monitor แจ้ง Degraded ผิดหลัง Maintenance Window",
      tags: ["health", "false-positive", "maintenance"],
      summary:
        "หลังจาก scheduled maintenance ของ event-ingester เสร็จ health monitor แจ้ง degraded alert สำหรับทุก segment พร้อมกัน ทั้งที่ไม่มีปัญหาจริง",
      investigation:
        "ตรวจการคำนวณ health score พบว่า `event data freshness` metric ได้คะแนนต่ำมากเพราะ event store ไม่มี event ใหม่เข้ามาระหว่าง 3 ชั่วโมงของ maintenance ทำให้ freshness ต่ำกว่าเกณฑ์",
      cause:
        "health score คำนวณตาม schedule รายวันโดยไม่รู้ว่าตอนนั้นมี maintenance window เกิดขึ้น ทำให้ตีความ gap ของ event เป็น degradation แทนที่จะเป็น planned downtime",
      resolution:
        "acknowledge alert ทั้งหมดด้วยมือ และ re-run health score computation หลัง event store กลับมาทำงานปกติ score กลับมาอยู่ในเกณฑ์ปกติทันที",
      followup:
        "เพิ่ม maintenance window annotation ใน health monitor ที่จะ suspend freshness metric ชั่วคราวระหว่าง maintenance ที่แจ้งไว้ล่วงหน้า",
    },
    {
      slug: "event-ingester-schema-mismatch",
      title: "Event Ingester Reject Event จำนวนมากหลัง Source System Update Schema",
      tags: ["ingestion", "schema", "compatibility"],
      summary:
        "ระบบ e-commerce อัปเดต schema ของ purchase event โดยเพิ่ม required field ใหม่ ทำให้ {{ref:module:event-ingester}} reject purchase event ทุกชิ้นด้วย `schema_invalid` เป็นเวลาหลายชั่วโมง",
      investigation:
        "ตรวจ reject log พบว่า event ingester ใช้ schema version เก่าที่ไม่รู้จัก field ใหม่ `purchase_channel` และตีความว่า event ที่มี field นี้ผิด schema",
      cause:
        "ไม่มีกระบวนการ coordinate schema change ระหว่าง e-commerce team และ SegmentIQ team ก่อน deploy — e-commerce deploy schema ใหม่โดยไม่แจ้ง SegmentIQ ให้ update schema validator ก่อน",
      resolution:
        "อัปเดต schema version ใน {{ref:module:event-ingester}} ให้รองรับ field ใหม่ และ re-ingest event ที่ถูก reject ทั้งหมดจาก dead-letter queue",
      followup:
        "สร้าง schema change notification process ให้ source system แจ้ง SegmentIQ ล่วงหน้าอย่างน้อย 1 sprint ก่อน deploy schema ใหม่",
    },
    {
      slug: "segment-archival-premature-delete",
      title: "Segment ถูก Archive โดยไม่ได้ตั้งใจจาก False Positive ของ Inactive Detection",
      tags: ["lifecycle", "archive", "incident"],
      summary:
        "campaign manager พบว่า segment ที่ใช้สำหรับ seasonal campaign ถูก archive ไปแล้ว ทำให้ export ที่ schedule ไว้ล้มเหลวทั้งหมด",
      investigation:
        "ตรวจ archival log ของ {{ref:module:segment-builder}} พบว่า segment ถูก auto-flag เป็น inactive เพราะไม่มี export เกิน 90 วัน ทั้งที่ campaign ถูก plan ให้ start หลังจากนั้น 30 วัน owner ยืนยัน archive flag แบบไม่ได้ตั้งใจเพราะคิดว่าเป็น notification ทั่วไป",
      cause:
        "email notification ที่ส่งให้ owner ก่อน archive ไม่ชัดเจนว่าการ confirm คืนการยืนยัน archive จริงๆ ไม่ใช่แค่รับทราบ ทำให้เกิดความเข้าใจผิด",
      resolution:
        "restore segment จาก archive (definition ยังคงอยู่ตาม {{ref:policy:segment-archival-policy}}) และ trigger manual refresh และ export เพื่อไล่ทัน",
      followup:
        "เปลี่ยน archive confirmation flow ให้ require explicit action มากกว่าแค่ click email link และเพิ่ม `planned_reactivation_date` field ให้ owner ระบุได้ว่า segment นี้จะกลับมาใช้เมื่อไหร่",
    },
    {
      slug: "export-rate-limit-channel-ban",
      title: "Channel Ban IP ของ SegmentIQ จาก Export Retry ที่ Aggressive เกินไป",
      tags: ["export", "rate-limit", "channel"],
      summary:
        "email channel หยุดรับ export จาก SegmentIQ อย่างกะทันหัน แจ้งว่า IP ถูก temporary ban เพราะ request rate เกินขีดจำกัด",
      investigation:
        "ตรวจ {{ref:module:channel-exporter}} พบว่า retry logic ส่ง request ซ้ำแบบ exponential backoff แต่ base interval สั้นมาก (500ms) ทำให้ในช่วง export หนักๆ มี retry จำนวนมากในเวลาสั้นๆ เกิน rate limit ของ channel",
      cause:
        "retry backoff ถูก tune สำหรับ internal service ที่มี rate limit สูง แต่ marketing channel ภายนอกมี rate limit ต่ำกว่ามาก — ไม่มีการ config retry ต่าง channel ให้เหมาะสม ดู {{ref:policy:channel-sync-retry-policy}}",
      resolution:
        "ติดต่อ channel ให้ unban IP หลังจากหยุดส่ง request ไปแล้ว 2 ชั่วโมง และ tune retry interval ให้นานขึ้นสำหรับ external channel กว่า internal",
      followup:
        "เพิ่ม per-channel retry config ที่ตั้งค่าแยกตาม rate limit จริงของแต่ละ channel และเพิ่ม `429 rate_limit` handler ที่ honor `Retry-After` header แทน backoff คงที่",
    },
  ],
  conventions: [
    {
      slug: "segment-definition-format",
      title: "Segment Definition Format",
      tags: ["segment", "definition", "style"],
      intro: "รูปแบบของ segment definition ต้องเป็น structured rule ที่ {{ref:module:membership-refresher}} evaluate ได้โดยอัตโนมัติ ห้ามใช้ free-text หรือ SQL โดยตรง",
      sections: [
        { heading: "โครงสร้าง rule", body: "แต่ละ rule ต้องมี `eventType`, `condition`, และ `window` เช่น `{ eventType: 'purchase', condition: { minCount: 3 }, window: { days: 30 } }` — ไม่มี implicit default ทุก field ต้องระบุชัดเจน" },
        { heading: "Operator", body: "ใช้ `AND` เมื่อต้องการ customer ที่ตรงทุก rule พร้อมกัน, `OR` เมื่อพอตรงข้อใดข้อหนึ่งก็ได้ — ห้ามผสม operator ใน nested rule เดียวกัน ต้องสร้าง segment ใหม่แทน" },
      ],
    },
    {
      slug: "event-schema-versioning",
      title: "Event Schema Versioning",
      tags: ["schema", "versioning", "compatibility"],
      intro: "ทุก event type ต้องมี schema version ที่ชัดเจน เพื่อให้ {{ref:module:event-ingester}} validate ได้ถูกต้องและรองรับ backward compatibility เมื่อ source system update schema",
      sections: [
        { heading: "รูปแบบ version", body: "`v<major>.<minor>` เช่น `v1.0`, `v1.2` — minor เพิ่มเมื่อ add optional field, major เพิ่มเมื่อ remove หรือ rename field ที่มีอยู่แล้ว" },
        { heading: "Backward compatibility", body: "ingester ต้องรองรับ schema เก่าอย่างน้อย 2 major version ก่อนหน้าควบคู่ไปกับ current — source system มีเวลา migrate ไม่น้อยกว่า 1 quarter ก่อน schema เก่าถูก deprecate บทเรียนจาก {{ref:incident:event-ingester-schema-mismatch}}" },
      ],
    },
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SEG-88-pii-scanner-fuzzy-match`, `fix/SEG-97-membership-lock-global`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ type prefix" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(channel-exporter): แก้ retry interval สำหรับ external channel ที่มี rate limit ต่ำ`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่เขียน membership snapshot ต้องทำใน transaction เดียวและมี global lock guard เสมอ (บทเรียนจาก {{ref:incident:membership-refresher-concurrent-instances}}) และทุก export path ต้องผ่าน PII field scanner ก่อน send (บทเรียนจาก {{ref:incident:pii-field-included-accidentally-in-export}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `refreshSegment`, `computeHealthScore` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`segmentId` เป็น UUID v4, `customerToken` เป็น SHA-256 hex ของ customer_id เสมอ — ห้ามส่ง raw customer_id ออกนอก event-ingester" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ต้องมี `segmentId` เมื่อเกี่ยวข้องกับ segment operation เพื่อไล่ log ข้าม module ได้ (segment-builder → membership-refresher → channel-exporter) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "export ไปยัง channel ทุกครั้ง log เป็น `info` เสมอพร้อม channel ID และ segment size — ห้าม log `customer_token` รายชื่อใน log เพราะ log มักถูก retain นานกว่า data retention policy" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้าม leak customer_token ใน error message" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`SEG_<DOMAIN>_<REASON>` เช่น `SEG_EXPORT_STALE_MEMBERSHIP`, `SEG_SEGMENT_TOO_SMALL`, `SEG_PII_FIELD_DETECTED` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`SEG_INGEST_SCHEMA_MISMATCH`, `SEG_REFRESH_ALREADY_RUNNING`, `SEG_ATTRIBUTION_DUPLICATE_EVENT` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (ครอบคลุม PII field scan path และ concurrent refresh scenario) → deploy staging → smoke test → deploy production ทีละ module ไม่ deploy พร้อมกัน" },
        { heading: "Gate พิเศษ", body: "{{ref:module:channel-exporter}} ต้องผ่าน PII scanner test 100% ก่อน merge และ {{ref:module:membership-refresher}} ต้องผ่าน concurrent lock test ก่อน merge — ทั้งสองเป็น compliance และ data integrity gate" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = PII leak ไปยัง channel หรือ data loss ของ event, Sev2 = export ล้มเหลวทั้งหมดหรือ membership corrupt, Sev3 = health alert false positive หรือ single segment มีปัญหาเล็กน้อย" },
        { heading: "กรณี PII incident", body: "ต้องแจ้ง DPO ภายใน 1 ชั่วโมงและ channel ที่ได้รับข้อมูลทันที ไม่ว่า sev จะเป็นเท่าไหร่ — บทเรียนจาก {{ref:incident:pii-field-included-accidentally-in-export}}" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "event ingestion lag เกิน 2 ชั่วโมง, membership refresh ล้มเหลวหรือ timeout, export ล้มเหลวเกิน 3 channel ใน 30 นาที (ดู {{ref:policy:channel-sync-retry-policy}}), segment health score ต่ำกว่า `HEALTH_CRITICAL_THRESHOLD`" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1 (PII/data loss) แจ้ง on-call + DPO ทันที, Sev2 แจ้ง on-call, Sev3 รวมเป็น digest รายชั่วโมง" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ PII scanner หยุดทำงาน, export ส่งข้อมูลผิด channel, หรือ membership snapshot corrupt ต้อง rollback ทันทีโดยไม่รอ approval" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดิม (ไม่ skip smoke test) แล้วตรวจสอบว่า PII scanner และ export path กลับมาทำงานถูกต้องก่อนประกาศ rollback สำเร็จ" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Trigger |\n|---|---|---|---|\n| event-ingester | 3 | 20 | Queue lag > 1h |\n| segment-builder | 1 | 4 | CPU > 70% |\n| membership-refresher | 1 | 3 | ช่วง batch job รายคืน |\n| channel-exporter | 2 | 6 | Export queue depth > 100 |" },
        { heading: "Peak event period", body: "ช่วง shopping festival หรือ promotion ใหญ่ ให้ pre-scale event-ingester ล่วงหน้า 1 ชั่วโมงก่อน event เริ่ม — บทเรียนจาก {{ref:incident:event-ingester-backlog-overflow}}" },
      ],
    },
    {
      slug: "channel-credential-rotation-runbook",
      title: "Channel Credential Rotation Runbook",
      tags: ["credential", "security", "runbook"],
      sections: [
        { heading: "ขั้นตอน", body: "1) generate API key ใหม่จาก channel portal 2) อัปเดตใน SegmentIQ credential store ผ่าน admin API (ไม่ใช่ตรงๆ ใน config file) 3) trigger test export เพื่อยืนยัน credential ใหม่ใช้งานได้ 4) revoke key เก่าใน channel portal" },
        { heading: "กรณีฉุกเฉิน", body: "ถ้า credential expired และต้อง rotate ทันทีระหว่าง export cycle กำลังรัน ให้หยุด export ก่อน rotate แล้ว restart export หลัง verify — ห้าม rotate ระหว่างที่ export กำลัง in-flight เพราะจะทำให้ partial export" },
      ],
    },
    {
      slug: "data-backfill-runbook",
      title: "Event Data Backfill Runbook",
      tags: ["backfill", "data-recovery", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้อง backfill", body: "เมื่อพบว่า event ชุดใดชุดหนึ่งสูญหายหรือถูก reject ผิดพลาดเนื่องจาก schema mismatch หรือ ingester downtime และต้องการ recompute membership ให้ถูกต้อง" },
        { heading: "ขั้นตอน", body: "1) ดึง event ที่หายจาก dead-letter queue หรือ source system backup 2) re-ingest ผ่าน `ingestEvent` API ปกติ (ไม่ bypass dedup เพราะ event อาจถูกส่งซ้ำบางส่วนแล้ว) 3) trigger manual refresh สำหรับ segment ที่ได้รับผลกระทบ 4) re-export ไปยัง channel" },
      ],
    },
    {
      slug: "segment-index-rebuild-runbook",
      title: "Segment Index Rebuild Runbook",
      tags: ["index", "performance", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rebuild", body: "เมื่อ `previewSegmentSize` ช้าลงอย่างมีนัยสำคัญ หรือหลังจาก event table มีการ partition เพิ่มหรือ reorganize ขนาดใหญ่" },
        { heading: "ขั้นตอน", body: "1) ตรวจ slow query log เพื่อยืนยันว่าปัญหาเป็น index ไม่ใช่ query logic 2) rebuild index ในช่วง off-peak (ตี 3-5 วันทำการ) 3) verify ด้วย benchmark query สำหรับ segment rule pattern ที่ใช้บ่อย 4) document index ที่เพิ่มหรือแก้ใน deployment note" },
      ],
    },
  ],
};
