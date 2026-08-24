import type { DomainProfile } from "../types.js";

// DataFlow — แพลตฟอร์ม ETL สำหรับวิเคราะห์ข้อมูล
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const analyticsPipeline: DomainProfile = {
  id: "analytics-pipeline",
  displayName: "DataFlow — แพลตฟอร์ม ETL วิเคราะห์ข้อมูล",
  summary: [
    "DataFlow คือแพลตฟอร์ม ETL (Extract-Transform-Load) ภายในที่ทีมข้อมูลใช้ดึงข้อมูลจากระบบต้นทางหลากหลายชนิด (ฐานข้อมูล transactional, SaaS API ภายนอก, ไฟล์ CSV ที่ทีมธุรกิจอัปโหลดเอง) มาทำความสะอาด แปลงรูป แล้วโหลดเข้า data warehouse กลางให้ทีมวิเคราะห์และแดชบอร์ดต่างๆ ดึงไปใช้ต่อได้ DataFlow ไม่ใช่เจ้าของข้อมูลต้นทาง — เป็นแค่ท่อที่พาข้อมูลไหลผ่านและแปลงรูประหว่างทาง",
    "ระบบแบ่งเป็น service ย่อยตามหน้าที่ ตั้งแต่เชื่อมต่อระบบต้นทาง ไปจนถึงตรวจสอบคุณภาพข้อมูลก่อนโหลดเข้า warehouse จริง ทีมวิศวกรรมเรียกช่วง 01:00-04:00 ว่า nightly batch window เพราะเป็นช่วงที่ job หลักส่วนใหญ่รันพร้อมกันตามตารางเวลาเพื่อให้ dashboard ตอนเช้ามีข้อมูลล่าสุดของวันก่อนหน้าครบถ้วน",
  ],
  domainTags: ["analytics-pipeline", "dataflow"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:ingest-connector}} เป็นเจ้าของ raw data ที่ดึงมาจากต้นทางเท่านั้น ไม่รู้จัก schema เป้าหมายของ warehouse เลย ส่วน {{ref:module:schema-registry}} เป็นเจ้าของนิยาม schema ทุกเวอร์ชันโดยไม่เก็บข้อมูลจริงสักแถวเดียว",
    "{{ref:module:job-orchestrator}} เป็น service เดียวที่ query ข้ามสถานะของ job จากทุก service อื่นพร้อมกันเพื่อตัดสินใจลำดับการรัน — เหตุผลที่ยอมให้ service นี้ทำ cross-domain query (ผิดหลักทั่วไป) คือการจัดลำดับ dependency ของ DAG ต้องเห็นสถานะทุก job พร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิดการรัน job ที่ dependency ยังไม่เสร็จ",
  ],
  apiGatewayNote: [
    "คำสั่งจาก internal dashboard เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปล request เช่น \"ดูสถานะ job ล่าสุด\" เป็น query ไปยัง {{ref:module:job-orchestrator}} คำขอที่ต้องการผลลัพธ์ทันที เช่น trigger job แบบ manual ใช้ synchronous call ตรงนี้",
    "การแจ้งเตือนเมื่อ job ล้มเหลวหรือ data quality check ไม่ผ่าน ไม่ผ่าน API gateway ตัวนี้ — ส่งตรงเข้า Slack channel ของทีมเจ้าของ pipeline ผ่าน webhook แยกต่างหาก เพราะ latency ของ gateway กลาง (เฉลี่ย 100-200ms) ไม่ใช่ปัญหาหลัก แต่ทีมต้องการแยก channel แจ้งเตือนตาม pipeline เจ้าของโดยไม่ต้องผ่าน routing ที่ gateway กลาง",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:ingest-connector}} ดูแล ได้แก่ `raw_extracts` (ข้อมูลดิบที่ดึงมาแต่ละรอบ เก็บแบบ append-only ไม่แก้ย้อนหลัง), `source_connections` (config การเชื่อมต่อระบบต้นทาง) และ `extract_run_log`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `raw_extracts` | ingest-connector | partition รายวันตาม extract timestamp เพราะปริมาณสูงมาก |\n| `schema_versions` | schema-registry | ประวัติทุกเวอร์ชันของทุก schema พร้อม diff |\n| `job_runs` | job-orchestrator | สถานะการรันของทุก job ใน DAG |\n| `quality_check_results` | data-quality-checker | ผลตรวจแต่ละ check แยกตาม dataset และรอบเวลา |",
    "ทุกตารางใช้ `dataset_id` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายคืนแทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `extract.completed`, `transform.completed`, `schema.changed`, `quality.check_failed`, `load.completed` — {{ref:module:transform-engine}} subscribe `extract.completed` แล้วเริ่มแปลงข้อมูลทันทีที่ raw data พร้อม",
    "{{ref:module:job-orchestrator}} subscribe แทบทุก event ประเภทข้างต้นเพราะต้อง track ความคืบหน้าของทุก step ใน DAG แต่ไม่ publish event ระดับ data (เช่น `transform.completed`) เอง — publish แค่ event ระดับ orchestration ของตัวเอง (`job.started`, `job.failed`) เพื่อไม่ให้ปนกับ event สาย data pipeline",
  ],
  modules: [
    {
      slug: "ingest-connector",
      name: "ingest-connector",
      tags: ["ingest", "module", "core"],
      description:
        "เชื่อมต่อระบบต้นทางหลากหลายชนิด (ฐานข้อมูล, SaaS API, ไฟล์ที่อัปโหลด) แล้วดึงข้อมูลดิบเข้ามาเก็บใน `raw_extracts` โดยไม่แปลงรูปใดๆ แยกออกมาเป็น service อิสระตั้งแต่ต้นเพราะแต่ละ connector มีจังหวะความล้มเหลวและ rate limit ต่างกันมาก การรวม logic ไว้ใน service เดียวทำให้ connector หนึ่งล่มแล้วดึงตัวอื่นไม่ได้ไปด้วย",
      functions: [
        { sig: "runExtract(sourceId: string, mode: \"full\" | \"incremental\"): Promise<ExtractRun>", desc: "ดึงข้อมูลจากต้นทาง คืนผลว่าดึงได้กี่แถว สำเร็จหรือล้มเหลวบางส่วน" },
        { sig: "registerSource(config: SourceConfig): Promise<string>", desc: "ลงทะเบียนระบบต้นทางใหม่ คืน sourceId" },
        { sig: "pauseSource(sourceId: string, reason: string): Promise<void>", desc: "หยุดดึงข้อมูลจากต้นทางชั่วคราว เช่น ตอนต้นทางแจ้งปิดปรับปรุง" },
      ],
      stateFlow: "queued → extracting → succeeded | failed_partial (ดึงได้บางส่วน) | failed_full — ดู {{ref:policy:extract-retry-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่ retry เมื่อไหร่ escalate",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:transform-engine}} โดยตรง — ข้อมูลดิบที่ดึงสำเร็จจะ publish event `extract.completed` เข้า queue กลางเท่านั้น (ดู {{ref:arch:queue}}) เพื่อรักษาหลัก separation of concerns ไม่ให้ ingest layer รู้จัก logic การแปลงข้อมูลเลย",
      internals: {
        constants: [
          { name: "EXTRACT_MAX_RETRY_ATTEMPTS", value: "3" },
          { name: "EXTRACT_TIMEOUT_MS", value: "600000" },
          { name: "RATE_LIMIT_BACKOFF_BASE_MS", value: "2000" },
        ],
        typeSnippet:
          "interface ExtractRun {\n  runId: string;\n  sourceId: string;\n  status: \"succeeded\" | \"failed_partial\" | \"failed_full\";\n  rowCount: number;\n  extractedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:extract-retry-policy}}",
      },
    },
    {
      slug: "transform-engine",
      name: "transform-engine",
      tags: ["transform", "module", "core"],
      description:
        "แปลงข้อมูลดิบจาก `raw_extracts` ตามกฎการแปลงที่นิยามไว้ต่อ dataset (ทำความสะอาด, normalize, join กับข้อมูลอ้างอิง) แยกออกมาจาก ingest-connector ตั้งแต่กลางปี 2025 เพราะกฎการแปลงซับซ้อนขึ้นเรื่อยๆ (การ join ข้ามหลาย source, การจัดการ null แบบต่างกันตาม field) จนทำให้ extract path ช้าลงถ้าคำนวณ inline",
      functions: [
        { sig: "applyTransform(datasetId: string, runId: string): Promise<TransformResult>", desc: "รันกฎการแปลงทั้งหมดของ dataset กับข้อมูลดิบรอบล่าสุด" },
        { sig: "registerTransformRule(datasetId: string, rule: TransformRule): Promise<void>", desc: "เพิ่มหรืออัปเดตกฎการแปลงสำหรับ dataset" },
        { sig: "previewTransform(datasetId: string, sampleSize: number): Promise<TransformPreview>", desc: "รันกฎการแปลงกับข้อมูลตัวอย่างเพื่อดูผลก่อน apply จริงกับข้อมูลทั้งหมด" },
      ],
      stateFlow: "pending → transforming → succeeded | failed — ดู {{ref:policy:late-arriving-data-policy}} สำหรับเงื่อนไขข้อมูลมาช้า",
      relatedNotes:
        "subscribe `extract.completed` จาก {{ref:module:ingest-connector}} โดยตรงผ่าน queue (ดู {{ref:arch:queue}}) — {{ref:module:schema-registry}} เป็นคนตรวจสอบว่า schema ของข้อมูลที่แปลงแล้วตรงกับที่ประกาศไว้หรือไม่ ก่อนส่งต่อให้ {{ref:module:warehouse-loader}}",
      internals: {
        constants: [
          { name: "TRANSFORM_BATCH_SIZE_ROWS", value: "50000" },
          { name: "NULL_FILL_STRATEGY_DEFAULT", value: "reject" },
        ],
        typeSnippet:
          "interface TransformResult {\n  datasetId: string;\n  runId: string;\n  rowsIn: number;\n  rowsOut: number;\n  rejectedRows: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องข้อมูลมาช้าที่ {{ref:policy:late-arriving-data-policy}}",
      },
    },
    {
      slug: "schema-registry",
      name: "schema-registry",
      tags: ["schema", "module"],
      description:
        "เก็บนิยาม schema ของทุก dataset ทุกเวอร์ชัน และตรวจสอบความเข้ากันได้เมื่อมีการเปลี่ยนแปลง schema จากต้นทาง เป็น service เดียวที่มีสิทธิ์อนุมัติว่า schema ใหม่ \"เข้ากันได้\" (backward compatible) หรือ \"breaking change\" — ไม่มี service ไหนตัดสินใจเรื่องนี้เองได้",
      functions: [
        { sig: "checkCompatibility(datasetId: string, newSchema: SchemaDef): Promise<CompatibilityResult>", desc: "เทียบ schema ใหม่กับเวอร์ชันล่าสุด บอกว่าเข้ากันได้หรือ breaking" },
        { sig: "registerSchemaVersion(datasetId: string, schema: SchemaDef): Promise<string>", desc: "บันทึก schema เวอร์ชันใหม่ คืน versionId" },
        { sig: "getActiveSchema(datasetId: string): Promise<SchemaDef>", desc: "คืน schema เวอร์ชันปัจจุบันที่ใช้งานอยู่" },
      ],
      relatedNotes:
        "ไม่รู้จักข้อมูลจริงสักแถวเดียว (ดู {{ref:arch:boundaries}}) — เมื่อ {{ref:module:transform-engine}} เจอ schema ที่เปลี่ยนจากต้นทาง จะเป็น schema-registry ที่ตัดสินใจว่า breaking change หรือไม่ แทนที่จะให้ transform-engine ตัดสินใจเอง เพื่อคุมนโยบายความเข้ากันได้ให้อยู่จุดเดียว",
    },
    {
      slug: "job-orchestrator",
      name: "job-orchestrator",
      tags: ["orchestration", "module", "core"],
      description:
        "จัดลำดับการรัน job ทั้งหมดใน pipeline ตาม DAG dependency ที่กำหนดไว้ (extract → transform → quality check → load) เป็น service เดียวที่ query ข้ามสถานะของทุก service อื่นพร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู {{ref:arch:boundaries}})",
      functions: [
        { sig: "scheduleDag(dagId: string, trigger: \"cron\" | \"manual\" | \"upstream\"): Promise<string>", desc: "เริ่มรัน DAG ใหม่ คืน runId" },
        { sig: "evaluateReadiness(jobId: string): Promise<boolean>", desc: "ตรวจว่า job นี้พร้อมรันหรือยังจาก dependency ทั้งหมดที่ต้องเสร็จก่อน" },
        { sig: "markJobFailed(jobId: string, reason: string): Promise<void>", desc: "mark job ล้มเหลว และตัดสินใจว่า job ที่ depend อยู่ต้องหยุดตามหรือไม่" },
      ],
      stateFlow: "queued → ready → running → succeeded | failed | skipped (เมื่อ upstream ล้มเหลวและ dependency ไม่ optional)",
      relatedNotes:
        "ถ้า job อยู่ใน `running` นานเกิน threshold โดยไม่มีความคืบหน้ารายงานกลับจาก service ที่เกี่ยวข้อง ระบบจะ mark เป็น `stuck` — ดู {{ref:policy:dag-deadlock-policy}} สำหรับกรณี dependency วนกลับมาหาตัวเอง",
      internals: {
        constants: [
          { name: "DAG_MAX_CONCURRENT_JOBS", value: "20" },
          { name: "JOB_STUCK_THRESHOLD_MIN", value: "45" },
        ],
        typeSnippet:
          "interface JobRun {\n  jobId: string;\n  dagRunId: string;\n  status: \"queued\" | \"ready\" | \"running\" | \"succeeded\" | \"failed\" | \"skipped\";\n  dependsOn: string[];\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง deadlock ที่ {{ref:policy:dag-deadlock-policy}}",
      },
    },
    {
      slug: "data-quality-checker",
      name: "data-quality-checker",
      tags: ["quality", "module"],
      description:
        "รันชุดกฎตรวจสอบคุณภาพข้อมูล (ค่า null เกินเกณฑ์, ค่าซ้ำผิดปกติ, ค่านอกช่วงที่คาดไว้, การมี PII ที่ไม่ควรมี) กับข้อมูลที่แปลงแล้วก่อนจะยอมให้โหลดเข้า warehouse จริง แยกออกมาเพราะกฎคุณภาพแตกต่างกันมากตาม dataset และต้องปรับได้โดยไม่กระทบ transform logic",
      functions: [
        { sig: "runQualityChecks(datasetId: string, runId: string): Promise<QualityReport>", desc: "รันกฎตรวจสอบทั้งหมดของ dataset กับข้อมูลรอบนั้น" },
        { sig: "registerQualityRule(datasetId: string, rule: QualityRule): Promise<void>", desc: "เพิ่มหรืออัปเดตกฎตรวจสอบสำหรับ dataset" },
        { sig: "overrideCheckFailure(runId: string, checkId: string, approvedBy: string): Promise<void>", desc: "อนุมัติให้ผ่านทั้งที่ check ไม่ผ่าน ต้องมีคนยืนยันเสมอ" },
      ],
      relatedNotes:
        "subscribe `transform.completed` จาก {{ref:module:transform-engine}} (ดู {{ref:arch:queue}}) — ถ้า check ไม่ผ่านจะ publish `quality.check_failed` ให้ {{ref:module:job-orchestrator}} ตัดสินใจว่าจะหยุด DAG หรือให้ผ่านแบบมีเงื่อนไข ดู {{ref:policy:quality-gate-policy}}",
    },
    {
      slug: "warehouse-loader",
      name: "warehouse-loader",
      tags: ["load", "module", "core"],
      description:
        "โหลดข้อมูลที่ผ่านการแปลงและตรวจคุณภาพแล้วเข้า data warehouse จริง รองรับทั้งการโหลดแบบ full refresh และ incremental append เป็น service เดียวที่มีสิทธิ์เขียนเข้า warehouse โดยตรง — service อื่นทั้งหมดเขียนได้แค่ staging area ของตัวเอง",
      functions: [
        { sig: "loadToWarehouse(datasetId: string, runId: string, mode: \"append\" | \"upsert\" | \"full_refresh\"): Promise<LoadResult>", desc: "โหลดข้อมูลเข้า warehouse ตาม mode ที่กำหนด" },
        { sig: "verifyLoadIntegrity(runId: string): Promise<IntegrityCheckResult>", desc: "เทียบจำนวนแถวและ checksum ระหว่างข้อมูลที่ควรโหลดกับที่โหลดจริง" },
        { sig: "rollbackLoad(runId: string): Promise<void>", desc: "ถอนข้อมูลที่โหลดผิดพลาดออกจาก warehouse โดยไม่กระทบข้อมูลรอบก่อนหน้า" },
      ],
      stateFlow: "pending → loading → verifying → committed | rolled_back",
      relatedNotes:
        "รับข้อมูลจาก {{ref:module:data-quality-checker}} เท่านั้น ไม่รับข้อมูลตรงจาก {{ref:module:transform-engine}} แม้แต่กรณีเร่งด่วน เพื่อไม่ให้มีทางลัดข้าม quality gate ได้เลยไม่ว่ากรณีใด ดู {{ref:policy:backfill-load-policy}} สำหรับกรณีโหลดข้อมูลย้อนหลังจำนวนมาก",
    },
  ],
  envVarGroups: [
    {
      service: "ingest-connector-service",
      vars: [
        { name: "EXTRACT_TIMEOUT_MS", example: "600000", note: "ดู {{ref:policy:extract-retry-policy}}" },
        { name: "EXTRACT_MAX_RETRY_ATTEMPTS", example: "3", note: "" },
      ],
    },
    {
      service: "transform-engine-service",
      vars: [
        { name: "TRANSFORM_BATCH_SIZE_ROWS", example: "50000", note: "" },
        { name: "TRANSFORM_DB_URL", example: "postgres://transform-db.internal:5432/transform", note: "secret ห้าม log" },
      ],
    },
    {
      service: "job-orchestrator-service",
      vars: [
        { name: "DAG_MAX_CONCURRENT_JOBS", example: "20", note: "ดู {{ref:policy:dag-deadlock-policy}}" },
        { name: "JOB_STUCK_THRESHOLD_MIN", example: "45", note: "เกินนี้ mark job เป็น stuck" },
      ],
    },
    {
      service: "warehouse-loader-service",
      vars: [
        { name: "LOAD_MAX_CONCURRENT_STREAMS", example: "6", note: "ดู {{ref:policy:backfill-load-policy}}" },
        { name: "WAREHOUSE_CONN_STRING", example: "snowflake://warehouse.internal/analytics", note: "secret ห้าม log" },
      ],
    },
  ],
  policies: [
    {
      slug: "extract-retry-policy",
      title: "นโยบายการ Retry เมื่อดึงข้อมูลไม่สำเร็จ",
      tags: ["ingest", "retry", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:ingest-connector}} ดึงข้อมูลไม่สำเร็จ ระบบจะจัดหมวดผลลัพธ์เป็น `failed_partial` (ดึงได้บางส่วน มักเกิดจาก rate limit หรือ connection หลุดกลางทาง) หรือ `failed_full` (ดึงไม่ได้เลยตั้งแต่ต้น เช่น credential ผิดหรือต้นทางล่ม)",
        "`failed_partial` จะถูก retry อัตโนมัติสูงสุด `EXTRACT_MAX_RETRY_ATTEMPTS` ครั้งโดยใช้ exponential backoff ก่อนถูกยกระดับเป็น `failed_full` โดยอัตโนมัติ เพื่อไม่ให้ connector ยิง request รัวใส่ต้นทางที่กำลังมีปัญหาซ้ำๆ",
      ],
      sections: [
        {
          heading: "ทำไมไม่ retry ไม่จำกัดครั้ง",
          body: "การดึงพลาดซ้ำๆ จากต้นทางเดิมมักไม่ใช่ปัญหาชั่วคราว แต่เป็นสัญญาณว่า credential หมดอายุหรือต้นทางเปลี่ยน schema แบบที่ connector รับมือไม่ได้ การ retry ไม่จำกัดจะเปลืองเวลาของ nightly batch window โดยเปล่าประโยชน์ และหน่วง job อื่นที่รอคิวอยู่",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Retry การดึงข้อมูล",
        tags: ["ingest", "retry", "edge-case"],
        body: [
          "ถ้าดึงข้อมูลไม่สำเร็จเพราะ credential ผิดหรือหมดอายุ (ไม่ใช่ rate limit หรือ connection error) ระบบจะไม่ retry เลยแม้แต่ครั้งเดียว เพราะการลอง credential เดิมซ้ำไม่มีประโยชน์ — จะส่งตรงไป `failed_full` ทันทีเพื่อแจ้งทีมเจ้าของ source ให้ต่ออายุ credential",
          "source ที่ถูก flag ว่าเปลี่ยน schema แบบ breaking (ดู {{ref:policy:quality-gate-policy}}) ก็ไม่เข้าเงื่อนไข retry เช่นกัน เพราะการดึงซ้ำด้วย schema เดิมที่คาดไว้จะยิ่งทำให้ transform ล้มเหลวต่อเนื่อง",
        ],
      },
    },
    {
      slug: "late-arriving-data-policy",
      title: "นโยบายจัดการข้อมูลที่มาถึงช้า",
      tags: ["transform", "late-data", "policy"],
      isPrimary: true,
      intro: [
        "ข้อมูลบางส่วนจากต้นทางอาจมาถึงหลังจาก batch window ของวันนั้นปิดไปแล้ว (เช่น transaction ที่บันทึกล่าช้าจากระบบต้นทาง) {{ref:module:transform-engine}} จะยอมรับข้อมูลที่มาช้าได้ไม่เกิน 48 ชั่วโมงหลังวันที่ข้อมูลควรจะมาถึง",
        "ข้อมูลที่มาช้าจะถูกแปลงและโหลดเข้า partition ของวันที่ข้อมูลนั้นควรอยู่จริง (ไม่ใช่วันที่ประมวลผลจริง) เพื่อให้ metric ย้อนหลังถูกต้องตามช่วงเวลาที่เหตุการณ์เกิดขึ้นจริง ไม่ใช่ตามเวลาที่ระบบเห็นข้อมูล",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อข้อมูลมาช้าเกิน 48 ชั่วโมง",
        tags: ["transform", "late-data", "edge-case"],
        body: [
          "ข้อมูลที่มาช้าเกิน 48 ชั่วโมงจะไม่ถูกแปลงและโหลดเข้า partition เดิมโดยอัตโนมัติ — ต้องผ่านการอนุมัติ manual backfill จากทีมเจ้าของ dataset ก่อนเสมอ เพราะการแก้ metric ย้อนหลังไกลเกินไปอาจกระทบรายงานที่ผู้บริหารดูไปแล้ว ต้องแจ้งให้รู้ก่อนแก้",
          "dataset ที่จัดกลุ่ม `real_time_sensitive` (ใช้ทำ alert แบบเกือบเรียลไทม์) ไม่เข้าเงื่อนไข 48 ชั่วโมงนี้เลย — ข้อมูลที่มาช้ากว่า 2 ชั่วโมงจะถูกทิ้งแทนที่จะพยายาม backfill เพราะความถูกต้องย้อนหลังของ dataset กลุ่มนี้สำคัญน้อยกว่าความสดของข้อมูลที่ใช้ alert ปัจจุบัน",
        ],
      },
    },
    {
      slug: "quality-gate-policy",
      title: "นโยบาย Quality Gate ก่อนโหลดเข้า Warehouse",
      tags: ["quality", "gate", "policy"],
      isPrimary: true,
      intro: [
        "ข้อมูลทุก dataset ต้องผ่าน {{ref:module:data-quality-checker}} ก่อนเข้าสู่ {{ref:module:warehouse-loader}} เสมอ ไม่มีทางลัดใดๆ แม้เป็น hotfix เร่งด่วน — check ที่ fail ระดับ `critical` (เช่น พบ PII ในคอลัมน์ที่ไม่ควรมี) จะบล็อกการโหลดทันทีโดยไม่มีข้อยกเว้น",
        "check ที่ fail ระดับ `warning` (เช่น อัตรา null สูงกว่าปกติเล็กน้อย) ไม่บล็อกการโหลดอัตโนมัติ แต่ต้องมีคนอนุมัติผ่าน `overrideCheckFailure` ก่อนเสมอ เพื่อให้มีคนรับรู้ว่าข้อมูลรอบนี้คุณภาพต่ำกว่าปกติก่อนถูกใช้งานจริง",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Check ระดับ Critical Fail จาก Bug ของกฎเอง (ไม่ใช่ข้อมูลจริงมีปัญหา)",
        tags: ["quality", "edge-case"],
        body: [
          "ถ้าทีมเจ้าของ dataset ยืนยันแล้วว่า check ที่ fail เกิดจาก bug ของกฎตรวจสอบเอง (เช่น regex ตรวจ PII เข้มเกินจนจับ pattern ที่ไม่ใช่ PII จริง) ไม่ใช่ข้อมูลมีปัญหาจริง สามารถ override ผ่านได้แม้จะเป็นระดับ critical แต่ต้องมี engineer ระดับ senior ขึ้นไปอนุมัติร่วมด้วยเสมอ ไม่ใช่แค่เจ้าของ dataset คนเดียว",
          "การ override ระดับ critical ทุกครั้งต้องสร้าง ticket แก้ไขกฎตรวจสอบทันทีควบคู่ไปด้วย ไม่ปล่อยให้ override ครั้งเดียวแล้วจบ เพราะรอบถัดไปกฎเดิมจะ fail ซ้ำอีก",
        ],
      },
    },
    {
      slug: "dag-deadlock-policy",
      title: "นโยบายจัดการ DAG Deadlock",
      tags: ["orchestration", "deadlock", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:job-orchestrator}} ตรวจสอบ dependency graph ของทุก DAG ตอน `scheduleDag` เพื่อหา circular dependency ก่อนเริ่มรันเสมอ — ถ้าพบวงจร จะปฏิเสธการรัน DAG ทั้งหมดทันทีพร้อมรายงานว่า job ไหนอยู่ในวงจรที่ขัดแย้งกัน",
        "การตรวจสอบนี้ทำแบบ static ก่อนรันเท่านั้น ไม่ใช่ runtime detection — เพราะการปล่อยให้ job เริ่มรันไปก่อนแล้วค่อยเจอ deadlock จะเสียทรัพยากรและเวลาของ batch window โดยเปล่าประโยชน์",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Config เปลี่ยนแล้วสร้าง Dependency วนกลับโดยไม่ตั้งใจ",
        tags: ["orchestration", "edge-case"],
        body: [
          "ถ้าการเปลี่ยน config ของ DAG ที่มีอยู่แล้วสร้าง circular dependency ขึ้นมาใหม่ (เช่น เพิ่ม dependency ย้อนกลับไปหา job ต้นทางของตัวเองโดยไม่ตั้งใจ) ระบบจะปฏิเสธการบันทึก config ใหม่ตั้งแต่ตอน validate ไม่รอให้ถึงรอบ `scheduleDag` จริง เพื่อจับปัญหาให้เร็วที่สุดตั้งแต่ตอน review",
          "DAG ที่ import มาจากระบบเก่าซึ่งมีวงจรอยู่แล้วก่อนใช้ DataFlow (migration case) จะถูกปฏิเสธเช่นกัน ไม่มีข้อยกเว้นให้ import ทั้งที่รู้ว่ามีวงจร — ต้องแก้ไขโครงสร้าง dependency ให้ถูกต้องก่อน migrate เข้ามาเสมอ",
        ],
      },
    },
    {
      slug: "backfill-load-policy",
      title: "นโยบายการโหลดข้อมูลย้อนหลังจำนวนมาก (Backfill)",
      tags: ["load", "backfill", "policy"],
      isPrimary: true,
      intro: [
        "การ backfill ข้อมูลย้อนหลังจำนวนมาก (เช่น re-process ข้อมูล 6 เดือนย้อนหลังหลังแก้ transform bug) ต้องรันผ่าน stream แยกจาก incremental load ปกติเสมอ จำกัดไม่เกิน `LOAD_MAX_CONCURRENT_STREAMS` stream พร้อมกัน เพื่อไม่ให้แย่ง write capacity ของ warehouse จาก incremental load ที่ธุรกิจใช้งานอยู่ทุกวัน",
        "backfill job มี priority ต่ำกว่า incremental load เสมอในการแย่งใช้ compute ของ warehouse — ถ้า incremental load รอคิวเพราะ backfill กำลังรันอยู่ ระบบจะ pause backfill ชั่วคราวจนกว่า incremental load จะเสร็จก่อนเสมอ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ Backfill ที่มี Deadline ทางธุรกิจ",
        tags: ["load", "edge-case"],
        body: [
          "ถ้า backfill มี deadline ทางธุรกิจชัดเจน (เช่น ต้องแก้ตัวเลขให้ทันก่อนปิดรอบบัญชีรายไตรมาส) ทีมสามารถขอ priority override ชั่วคราวให้ backfill แย่ง capacity ได้เท่ากับ incremental load แทนที่จะต่ำกว่าเสมอ แต่ต้องแจ้งทีมที่ใช้ dashboard แบบเรียลไทม์ล่วงหน้าเสมอว่าข้อมูลอาจ delay ชั่วคราว",
          "ไม่ว่า override priority หรือไม่ จำนวน stream สูงสุดยังคงถูกจำกัดที่ `LOAD_MAX_CONCURRENT_STREAMS` เสมอ ไม่มีข้อยกเว้นให้ backfill ใช้ stream เกินเพดานนี้ เพราะเป็นข้อจำกัดทางกายภาพของ warehouse connection pool ไม่ใช่แค่เรื่อง priority",
        ],
      },
    },
    {
      slug: "schema-evolution-policy",
      title: "นโยบายการรองรับ Schema เปลี่ยนแปลง",
      tags: ["schema", "policy"],
      isPrimary: false,
      intro: [
        "การเปลี่ยน schema ที่ {{ref:module:schema-registry}} จัดว่า backward compatible (เช่น เพิ่มคอลัมน์ใหม่ที่ nullable) จะถูกยอมรับและบันทึกเป็นเวอร์ชันใหม่อัตโนมัติโดยไม่ต้องมีคนอนุมัติ",
        "การเปลี่ยนที่จัดว่า breaking change (เช่น ลบคอลัมน์, เปลี่ยนชนิดข้อมูล) จะถูกบล็อกไม่ให้ transform อัตโนมัติ ต้องมีทีมเจ้าของ dataset ปลายทางอนุมัติ mapping ใหม่ก่อนเสมอ เพราะ dashboard ที่ใช้ข้อมูลอยู่อาจพังถ้าเปลี่ยนแบบไม่แจ้งล่วงหน้า",
      ],
    },
    {
      slug: "duplicate-row-prevention-policy",
      title: "นโยบายป้องกันแถวข้อมูลซ้ำ",
      tags: ["load", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:warehouse-loader}} ใช้ deterministic row key (ผสมจาก source id, extract timestamp, และ primary key ของต้นทาง) เพื่อตรวจจับแถวที่โหลดซ้ำก่อนเขียนเข้า warehouse ทุกครั้ง ไม่พึ่ง unique constraint ของ warehouse ฝ่ายเดียว",
        "การโหลดแบบ `upsert` ใช้ row key นี้ตัดสินว่าควร insert หรือ update แถวเดิม ส่วนการโหลดแบบ `append` จะปฏิเสธแถวที่ row key ซ้ำกับที่มีอยู่แล้วทันที ไม่ insert ซ้ำไม่ว่ากรณีใด",
      ],
    },
    {
      slug: "pii-classification-policy",
      title: "นโยบายจำแนกและจัดการข้อมูล PII",
      tags: ["pii", "quality", "policy"],
      isPrimary: true,
      intro: [
        "ทุก column ของทุก dataset ต้องถูก classify ว่ามี PII หรือไม่ตอนลงทะเบียน schema ครั้งแรกใน {{ref:module:schema-registry}} — column ที่ classify เป็น PII จะถูกจำกัดสิทธิ์การเข้าถึงเป็น default (ต้องขอสิทธิ์เพิ่มเติมถึงจะ query ได้)",
        "{{ref:module:data-quality-checker}} รัน pattern-matching เสริมทุกรอบเพื่อตรวจจับ PII ที่หลุดเข้ามาใน column ที่ไม่ได้ classify ไว้ว่าเป็น PII (เผื่อกรณีต้นทางเปลี่ยนความหมายของ field โดยไม่แจ้ง) เป็นการตรวจซ้ำสองชั้นไม่ใช่พึ่งการ classify ตอนแรกอย่างเดียว",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ PII ปนอยู่ใน Column ประเภท Free-text",
        tags: ["pii", "edge-case"],
        body: [
          "column ประเภท free-text (เช่น field แสดงความคิดเห็นของลูกค้า) ไม่สามารถ classify ล่วงหน้าได้แม่นยำเหมือน column ที่มีโครงสร้างชัดเจน เพราะ PII อาจปนอยู่ในเนื้อความโดยไม่สม่ำเสมอ column ประเภทนี้จึงถูกจัดเป็น `high_risk_unstructured` เสมอโดย default และรัน pattern-matching เข้มกว่า column อื่นแม้จะยังไม่เคยพบ PII จริงในนั้นก็ตาม",
          "ถ้าทีมเจ้าของ dataset ยืนยันว่า column free-text ใดไม่มีความเสี่ยง PII จริง (เช่น ผ่านการตรวจสอบเชิงลึกแล้ว) สามารถขอลดระดับจาก `high_risk_unstructured` ได้ แต่ต้องมีการรีวิวซ้ำทุก 6 เดือนเสมอ ไม่ใช่ลดระดับแล้วจบถาวร เพราะเนื้อหาที่ผู้ใช้พิมพ์เข้ามาเปลี่ยนแปลงได้ตลอดเวลา",
        ],
      },
    },
    {
      slug: "job-priority-policy",
      title: "นโยบายลำดับความสำคัญของ Job ใน DAG",
      tags: ["orchestration", "policy"],
      isPrimary: false,
      intro: [
        "job ที่ป้อนข้อมูลให้ dashboard ระดับผู้บริหาร (จัดกลุ่ม `executive_facing`) ได้ priority สูงสุดในการแย่ง compute เมื่อ `DAG_MAX_CONCURRENT_JOBS` เต็ม — job อื่นที่รอคิวจะถูก queue ต่อจนกว่า job กลุ่มนี้จะรันเสร็จก่อน",
        "job ที่ทำ ad-hoc analysis สำหรับทีมเดียว (ไม่ได้ป้อน dashboard ที่ใช้งานร่วมกัน) ได้ priority ต่ำสุดเสมอ แม้จะ trigger แบบ manual ก็ตาม เพื่อไม่ให้แย่งทรัพยากรจาก scheduled job หลักที่ธุรกิจพึ่งพา",
      ],
    },
    {
      slug: "connector-credential-rotation-policy",
      title: "นโยบายหมุนเวียน Credential ของ Connector",
      tags: ["ingest", "security", "policy"],
      isPrimary: false,
      intro: [
        "credential ของทุก source connection ต้องหมุนเวียนทุก 90 วัน ระบบจะแจ้งเตือนทีมเจ้าของ source ล่วงหน้า 14 วันก่อนหมดอายุ ผ่าน Slack channel เดียวกับที่ใช้แจ้ง job failure",
        "ถ้า credential หมดอายุแล้วยังไม่มีการหมุนเวียน `runExtract` จะ pause source นั้นอัตโนมัติแทนที่จะปล่อยให้ retry ซ้ำจนติด rate limit จากความล้มเหลวต่อเนื่อง ดู {{ref:policy:extract-retry-policy}} สำหรับพฤติกรรม retry ปกติที่ไม่เกี่ยวกับ credential",
      ],
    },
    {
      slug: "cost-attribution-policy",
      title: "นโยบายแจกแจงต้นทุนการประมวลผลตามทีม",
      tags: ["cost", "policy"],
      isPrimary: false,
      intro: [
        "ทุก job ต้องแท็ก `owning_team` ตอนลงทะเบียนใน {{ref:module:job-orchestrator}} เสมอ เพื่อให้คำนวณต้นทาง compute และ storage ที่แต่ละทีมใช้ได้ถูกต้องในรายงานต้นทุนรายเดือน",
        "job ที่ไม่มีการแท็ก `owning_team` จะไม่ถูกบล็อกไม่ให้รัน แต่ต้นทุนที่เกิดขึ้นจะถูกจัดเข้ากลุ่ม `unattributed` และทีมแพลตฟอร์มจะติดตามหาเจ้าของย้อนหลังทุกสิ้นเดือน",
      ],
    },
  ],
  incidents: [
    {
      slug: "upstream-schema-change-silent-dashboard-break",
      title: "ต้นทางเปลี่ยน Schema เงียบๆ ทำ Dashboard พังไม่มีใครรู้",
      tags: ["schema", "dashboard"],
      summary:
        "ทีมการตลาดแจ้งว่าตัวเลขในแดชบอร์ดยอดขายรายวันแสดงค่า 0 มาสามวันติดต่อกัน ทั้งที่ยอดขายจริงไม่ได้ผิดปกติ",
      investigation:
        "ตรวจ {{ref:module:schema-registry}} พบว่าระบบต้นทาง (CRM ภายนอก) เปลี่ยนชื่อ field `total_amount` เป็น `amount_total` โดยไม่แจ้งล่วงหน้า และ {{ref:module:transform-engine}} แปลงข้อมูลโดยเติมค่า default 0 ให้ field ที่หายไปแทนที่จะ error",
      cause:
        "กฎการแปลงของ dataset นี้ตั้งค่า `NULL_FILL_STRATEGY_DEFAULT` เป็น fallback ที่ผ่อนปรนเกินไปสำหรับ field สำคัญ ทำให้เมื่อ field หายไปจริง ระบบเติม 0 แทนที่จะปฏิเสธข้อมูลตาม {{ref:policy:quality-gate-policy}} — schema change ที่ควรถูกจับว่าเป็น breaking change กลับหลุดผ่านไปได้เพราะ column ใหม่ไม่ได้ถูก mark เป็น required",
      resolution:
        "เพิ่ม field `total_amount` เดิมกลับเข้า mapping โดยชี้ไปที่ `amount_total` ใหม่ แล้ว backfill ข้อมูล 3 วันที่ผิดพลาดด้วยการรัน transform ใหม่จาก raw extract ที่ยังเก็บไว้อยู่",
      followup:
        "เปลี่ยนกฎให้ field ที่เคย mark เป็น critical สำหรับ dashboard ต้อง reject (ไม่ใช่ fill default) เมื่อหายไปจากต้นทาง และเพิ่ม alert แยกเมื่อ column ที่คาดว่าต้องมีหายไปจาก extract",
    },
    {
      slug: "retry-bug-duplicate-fact-rows",
      title: "Bug ใน Retry ทำแถวข้อมูลซ้ำใน Fact Table",
      tags: ["load", "duplicate"],
      summary:
        "ทีมวิเคราะห์สังเกตว่ายอดรวมของ metric หนึ่งในรายงานรายสัปดาห์สูงผิดปกติเกือบสองเท่าเทียบกับตัวเลขที่ทีมธุรกิจคำนวณเองคู่ขนาน",
      investigation:
        "ตรวจ {{ref:module:warehouse-loader}} พบว่า job ที่ load dataset นี้เคย fail กลางทางเพราะ connection หลุด แล้ว job-orchestrator สั่ง retry ทั้ง job ใหม่ทั้งหมด แต่ข้อมูลบางส่วนที่โหลดสำเร็จไปแล้วก่อนหลุดถูกโหลดซ้ำอีกรอบ",
      cause:
        "การ retry ใช้ mode `append` แทนที่จะเป็น `upsert` สำหรับ dataset นี้ เพราะตอนออกแบบ retry logic คาดว่าถ้า job fail จะไม่มีข้อมูลถูกเขียนเลยสักแถว แต่ในความเป็นจริง batch ที่ fail อาจเขียนสำเร็จไปแล้วบางส่วนก่อนที่ connection จะหลุด ทำให้ retry ด้วย append ซ้ำแถวเดิมเข้าไปอีกชุด",
      resolution:
        "ลบแถวซ้ำออกด้วย row key ตาม {{ref:policy:duplicate-row-prevention-policy}} แล้วรัน `verifyLoadIntegrity` ยืนยันจำนวนแถวถูกต้องก่อนปิดเคส",
      followup:
        "เปลี่ยน retry logic ของ warehouse-loader ให้ใช้ `upsert` เป็น default เสมอเมื่อ retry job ที่เคย fail กลางทาง ไม่ว่า mode เดิมจะเป็นอะไรก็ตาม เพื่อกัน duplicate จากการ retry โดยเฉพาะ",
    },
    {
      slug: "late-data-undercounted-metric-before-backfill",
      title: "ข้อมูลมาช้าทำ Metric นับต่ำกว่าจริงก่อน Backfill",
      tags: ["late-data", "aggregation"],
      summary:
        "รายงานยอดขายรายภูมิภาคของสัปดาห์หนึ่งแสดงยอดต่ำกว่าที่ทีมขายรายงานเองในที่ประชุมเช้าวันจันทร์ประมาณ 12%",
      investigation:
        "ตรวจ {{ref:module:transform-engine}} พบว่าข้อมูลจากภูมิภาคหนึ่งมาถึงช้ากว่าปกติเกือบ 30 ชั่วโมงเพราะระบบ POS ของภูมิภาคนั้นมีปัญหา sync ภายใน แต่ job aggregation รายสัปดาห์รันไปแล้วก่อนข้อมูลจะมาถึงครบตาม {{ref:policy:late-arriving-data-policy}}",
      cause:
        "job aggregation รายสัปดาห์ไม่มีกลไกตรวจสอบว่าข้อมูลของทุกภูมิภาคมาครบก่อนคำนวณสรุป — คำนวณจากข้อมูลที่มีอยู่ ณ เวลานั้นเสมอ โดยไม่รู้ว่าขาดข้อมูลภูมิภาคไหนไปบ้าง",
      resolution:
        "ข้อมูลที่มาช้ามาถึงครบภายใน 48 ชั่วโมงตามนโยบายปกติ จึงรัน backfill aggregation job ใหม่อัตโนมัติ แล้วอัปเดตรายงานให้ทีมขายพร้อมชี้แจงสาเหตุตัวเลขที่ต่างจากที่รายงานไปก่อนหน้า",
      followup:
        "เพิ่ม completeness check ก่อนรัน aggregation job รายสัปดาห์ ถ้าพบว่าบางภูมิภาคยังไม่มีข้อมูลของวันล่าสุดครบ ให้ delay การรันแทนที่จะคำนวณด้วยข้อมูลไม่ครบแล้วค่อย backfill ทีหลัง",
    },
    {
      slug: "orchestrator-dag-deadlock-config-change",
      title: "Orchestrator DAG ติด Deadlock จาก Config เปลี่ยนสร้าง Circular Dependency",
      tags: ["orchestration", "deadlock"],
      summary:
        "batch ทั้งคืนของ pipeline การเงินภายในค้างไม่รันเลยสักตัว ทีมสังเกตเห็นตอนเช้าว่า dashboard ที่ควรอัปเดตทุกเช้ายังเป็นข้อมูลเมื่อวาน",
      investigation:
        "ตรวจ {{ref:module:job-orchestrator}} พบว่า DAG ของ pipeline นี้มี job สามตัวที่ dependency วนกลับมาหาตัวเองเป็นวงจร (A depends on B, B depends on C, C depends on A) ทำให้ไม่มี job ไหนถูกประเมินว่า `ready` เลยสักตัว",
      cause:
        "การเปลี่ยน config เมื่อสัปดาห์ก่อนเพื่อเพิ่ม dependency ใหม่ให้ job C รอผลจาก job A (เพื่อแก้ปัญหาข้อมูลไม่ตรงกันที่เคยเจอ) สร้าง circular dependency ขึ้นมาโดยไม่มีใครสังเกต เพราะการตรวจสอบ config ตอนนั้นดูแค่ dependency ที่เพิ่มใหม่ ไม่ได้ trace ทั้ง graph ย้อนกลับ",
      resolution:
        "revert config การเปลี่ยนแปลงล่าสุดกลับเป็นเวอร์ชันก่อนหน้า ทำให้ DAG กลับมารันได้ปกติ แล้วรัน backfill สำหรับ batch คืนที่พลาดไปด้วยมือ",
      followup:
        "เพิ่ม validation ให้ {{ref:module:job-orchestrator}} ตรวจสอบ circular dependency แบบ static ทุกครั้งที่มีการบันทึก config ใหม่ตาม {{ref:policy:dag-deadlock-policy}} แทนที่จะพึ่งการรีวิวด้วยตาคน",
    },
    {
      slug: "quality-check-gap-pii-leak",
      title: "ช่องโหว่ Quality Check ปล่อยให้ PII หลุดเข้าตารางที่ไม่มีการจำกัดสิทธิ์",
      tags: ["pii", "quality"],
      summary:
        "ทีม security ตรวจพบระหว่าง audit ประจำไตรมาสว่ามีคอลัมน์หนึ่งใน dataset ที่เปิดให้ทุกทีมเข้าถึงได้มีข้อมูลอีเมลลูกค้าปนอยู่ (ข้อมูลสมมติสำหรับกรณีศึกษานี้ ไม่ใช่ข้อมูลจริง) ทั้งที่ column นั้นไม่ได้ถูก classify ว่าเป็น PII",
      investigation:
        "ตรวจ {{ref:module:data-quality-checker}} พบว่ากฎ pattern-matching สำหรับตรวจจับ PII ที่หลุดเข้ามาใน column ที่ไม่ได้ classify ไว้ตาม {{ref:policy:pii-classification-policy}} ไม่ได้ครอบคลุม column ประเภท free-text ที่มาจาก field แสดงความคิดเห็นของลูกค้า",
      cause:
        "กฎตรวจจับ PII เดิมออกแบบมาสำหรับ column ที่มีโครงสร้างชัดเจน (เช่น column ชื่อ `email`) แต่ column free-text ที่ลูกค้าพิมพ์อีเมลปนอยู่ในเนื้อความ (เช่น \"ติดต่อกลับที่ x@example.com ด้วยครับ\") ไม่ตรง pattern ที่กฎเดิมตรวจสอบเลย",
      resolution:
        "จำกัดสิทธิ์การเข้าถึง column ที่พบปัญหาทันที แล้วรันกฎตรวจจับ PII เวอร์ชันใหม่ที่ครอบคลุม free-text ย้อนหลังกับทุก dataset ที่มี column ประเภทนี้เพื่อประเมินผลกระทบวงกว้าง",
      followup:
        "เพิ่มกฎ pattern-matching สำหรับ PII ที่ปนอยู่ใน free-text เป็นส่วนหนึ่งของ default quality check ทุก dataset ไม่ใช่แค่ dataset ที่เจ้าของเลือกเปิดเอง และรายงานสรุปเหตุการณ์นี้เข้า postmortem ของทีม security",
    },
    {
      slug: "large-backfill-starved-incremental-loads",
      title: "Backfill ขนาดใหญ่แย่ง Capacity จน Incremental Load ค้าง",
      tags: ["load", "backfill", "performance"],
      summary:
        "ทีมหลายทีมรายงานพร้อมกันว่า dashboard ที่ควรอัปเดตทุกชั่วโมงหยุดอัปเดตไปนานเกือบ 4 ชั่วโมงในบ่ายวันหนึ่ง",
      investigation:
        "ตรวจ {{ref:module:warehouse-loader}} พบว่า backfill job ขนาดใหญ่ (re-process ข้อมูล 6 เดือนหลังแก้ transform bug) กำลังใช้ stream เกือบทั้งหมดใน connection pool ของ warehouse ทำให้ incremental load งานปกติต้องรอคิวยาว",
      cause:
        "backfill job นี้ถูก trigger แบบ manual โดยไม่ได้ผ่านการตรวจสอบ priority ตาม {{ref:policy:backfill-load-policy}} อย่างครบถ้วน — คนที่ trigger ไม่รู้ว่า default behavior ของ backfill ควรถูก pause อัตโนมัติเมื่อ incremental load รอคิว เพราะ flag การตั้งค่านั้นถูกปิดไว้ผิดพลาดตอน config ล่าสุด",
      resolution:
        "pause backfill job ด้วยมือทันทีเพื่อคืน capacity ให้ incremental load ไล่ตามให้ทัน แล้วค่อยรัน backfill ต่อในช่วงดึกที่โหลดของระบบต่ำแทน",
      followup:
        "แก้ default config ของ pause-on-contention ให้เปิดเสมอสำหรับ backfill job ทุกตัว เว้นแต่จะขอ priority override ตาม {{ref:policy:backfill-load-policy}} อย่างชัดเจนเท่านั้น",
    },
    {
      slug: "transform-engine-null-fill-strategy-misconfig",
      title: "ตั้งค่า Null Fill Strategy ผิดทำข้อมูลการเงินเพี้ยน",
      tags: ["transform", "bug"],
      summary:
        "ทีมบัญชีพบว่ายอดรวมรายจ่ายในรายงานเดือนหนึ่งต่ำกว่าความเป็นจริงอย่างมีนัยสำคัญหลังตรวจสอบกับใบแจ้งหนี้จริง",
      investigation:
        "ตรวจ {{ref:module:transform-engine}} พบว่ากฎการแปลงของ dataset นี้ถูกตั้งค่า `NULL_FILL_STRATEGY_DEFAULT` เป็น fill-zero แทนที่จะเป็น reject สำหรับ column จำนวนเงิน ทำให้แถวที่ต้นทางส่งค่า null มา (เพราะข้อผิดพลาดชั่วคราวฝั่งต้นทาง) ถูกนับเป็น 0 แทนที่จะถูกปฏิเสธและแจ้งเตือน",
      cause:
        "การตั้งค่า default strategy สำหรับ dataset นี้ถูกคัดลอกมาจาก dataset อื่นที่เหมาะกับ fill-zero (เช่น จำนวนคลิกที่ไม่มีค่าจริงๆ หมายถึงศูนย์) โดยไม่ได้ทบทวนว่า column จำนวนเงินไม่ควรใช้ strategy เดียวกัน เพราะ null ในบริบทนี้หมายถึง \"ไม่รู้ค่า\" ไม่ใช่ \"ค่าเป็นศูนย์จริง\"",
      resolution:
        "เปลี่ยน strategy ของ column จำนวนเงินเป็น reject แล้ว backfill เดือนที่ได้รับผลกระทบด้วยการดึงข้อมูลต้นทางใหม่สำหรับแถวที่เคยถูกเติม 0 ผิดพลาด",
      followup:
        "ทบทวนทุก dataset ที่มี column ประเภทจำนวนเงินหรือปริมาณสำคัญทางธุรกิจว่าใช้ strategy `reject` เป็น default หรือไม่ ไม่ใช่ปล่อยให้คัดลอก config กันมาโดยไม่ทบทวน",
    },
    {
      slug: "schema-registry-compatibility-check-false-pass",
      title: "Schema Registry ตัดสิน Breaking Change ผิดว่าเข้ากันได้",
      tags: ["schema", "bug"],
      summary:
        "หลังต้นทางเปลี่ยนชนิดข้อมูลของคอลัมน์หนึ่งจาก integer เป็น string เพื่อรองรับรหัสที่มีตัวอักษรนำหน้า transform job ที่ใช้ column นี้เริ่ม error เป็นชุดในคืนถัดมา ทั้งที่ schema-registry แจ้งว่า compatible",
      investigation:
        "ตรวจ {{ref:module:schema-registry}} พบว่า `checkCompatibility` ตรวจแค่ว่าชื่อ column และ nullable ตรงกันหรือไม่ ไม่ได้ตรวจชนิดข้อมูล (data type) อย่างเข้มงวดพอสำหรับกรณีเปลี่ยนจาก numeric ไปเป็น string",
      cause:
        "ตรรกะการเช็ค compatibility เขียนขึ้นตั้งแต่ช่วงแรกที่ dataset ส่วนใหญ่ไม่ค่อยเปลี่ยนชนิดข้อมูล เน้นตรวจแค่คอลัมน์หายหรือ nullable เปลี่ยนเป็นหลัก ไม่ได้ครอบคลุมกรณีเปลี่ยนชนิดข้อมูลที่ดู \"ใกล้เคียงกัน\" แบบ integer กับ string ที่เป็นตัวเลขล้วน",
      resolution:
        "แก้ transform rule ให้แปลงชนิดข้อมูลอย่างชัดเจนรองรับทั้งสองแบบชั่วคราว แล้วรัน transform ย้อนหลังสำหรับคืนที่ error",
      followup:
        "เพิ่มการตรวจสอบชนิดข้อมูลอย่างเข้มงวดใน `checkCompatibility` ให้ mark เป็น breaking change เสมอเมื่อชนิดข้อมูลเปลี่ยน แม้ค่าที่เก็บจะดูแปลงกันได้ในบางกรณีก็ตาม",
    },
    {
      slug: "quality-checker-flaky-timeout-false-block",
      title: "Data Quality Checker Timeout Flaky บล็อกการโหลดข้อมูลที่ไม่มีปัญหาจริง",
      tags: ["quality", "reliability"],
      summary:
        "หลาย dataset ถูกบล็อกไม่ให้โหลดเข้า warehouse พร้อมกันในคืนหนึ่งโดยไม่มีเหตุผลชัดเจนจากรายงาน quality check ที่แสดง error แค่ว่า \"check timeout\"",
      investigation:
        "ตรวจ {{ref:module:data-quality-checker}} พบว่า check บางตัวที่ต้อง scan ทั้งตาราง (เช่น ตรวจค่าซ้ำผิดปกติ) ใช้เวลานานผิดปกติในคืนนั้นเพราะ dataset หลายตัวมีขนาดใหญ่ขึ้นพร้อมกันจากการเติบโตของธุรกิจ ทำให้ชน timeout ที่ตั้งไว้คงที่",
      cause:
        "timeout ของ quality check ตั้งเป็นค่าคงที่ตัวเดียวทั้งระบบตั้งแต่แรก ไม่ได้ปรับตามขนาดข้อมูลที่โตขึ้นเรื่อยๆ ทำให้ dataset ที่เคยผ่าน check ได้สบายเริ่มชน timeout เมื่อข้อมูลใหญ่ขึ้นถึงจุดหนึ่ง",
      resolution:
        "เพิ่ม timeout ชั่วคราวสำหรับ check ที่ scan ทั้งตารางเป็นค่าที่ยืดหยุ่นตามขนาดข้อมูลโดยประมาณ แล้วรัน check ที่ค้างใหม่ทั้งหมด ยืนยันว่าไม่มี dataset ไหนมีปัญหาจริง",
      followup:
        "เปลี่ยน timeout ของ quality check จากค่าคงที่เป็นการคำนวณตามขนาดข้อมูลจริงของแต่ละ dataset แทน และเพิ่ม alert แยกระหว่าง \"check fail เพราะข้อมูลมีปัญหา\" กับ \"check fail เพราะ timeout\" ให้ทีมแยกแยะได้ง่ายขึ้น",
    },
    {
      slug: "connector-rate-limit-storm-after-source-migration",
      title: "Connector ยิง Request ถี่เกินหลังต้นทาง Migrate Infrastructure",
      tags: ["ingest", "rate-limit"],
      summary:
        "connector ของระบบต้นทางรายหนึ่งเริ่มได้ error 429 (rate limit) ต่อเนื่องหลังต้นทางประกาศ migrate infrastructure ของตัวเองแบบไม่กระทบผู้ใช้ (ตามที่แจ้งไว้)",
      investigation:
        "ตรวจ {{ref:module:ingest-connector}} พบว่า rate limit ใหม่ของต้นทางหลัง migrate ต่ำกว่าเดิมมาก (จาก 1000 request/นาที เหลือ 200 request/นาที) แต่ connector ยังคงยิงตามอัตราเดิม",
      cause:
        "การประกาศ migrate ของต้นทางไม่ได้ระบุการเปลี่ยน rate limit ไว้ชัดเจนในเอกสาร ทีมจึงไม่ได้ปรับ config ของ connector ล่วงหน้า ทำให้ retry ตาม {{ref:policy:extract-retry-policy}} ยิ่งซ้ำเติมปัญหาเพราะยิง request ถี่ขึ้นไปอีกตอน retry",
      resolution:
        "ปรับ rate limit ฝั่ง connector ให้ตรงกับค่าใหม่ของต้นทางทันที แล้วเพิ่ม backoff ให้นานขึ้นชั่วคราวจนกว่าจะแน่ใจว่าเสถียร",
      followup:
        "ติดต่อทีมต้นทางขอให้แจ้งการเปลี่ยนแปลง rate limit ล่วงหน้าเสมอในอนาคต และเพิ่ม auto-detect rate limit จาก response header ของต้นทางแทนการพึ่ง config คงที่ที่อาจล้าสมัยได้",
    },
    {
      slug: "job-orchestrator-priority-inversion-executive-dashboard-delay",
      title: "Priority Inversion ทำ Dashboard ผู้บริหารช้ากว่าที่ควร",
      tags: ["orchestration", "priority"],
      summary:
        "dashboard ระดับผู้บริหารที่ควรมี priority สูงสุดตาม {{ref:policy:job-priority-policy}} กลับอัปเดตช้ากว่ากำหนดเกือบ 2 ชั่วโมงในเช้าวันประชุมบอร์ดบริษัท",
      investigation:
        "ตรวจ {{ref:module:job-orchestrator}} พบว่า job ของ dashboard ผู้บริหารรอ dependency จาก job อื่นที่ priority ต่ำกว่าแต่เริ่มรันไปก่อนแล้วและกำลังถือ compute slot อยู่ ทำให้แม้ job priority สูงกว่าจะพร้อมรัน (`ready`) ก็ยังต้องรอ slot ว่างจาก job priority ต่ำที่รันอยู่ก่อน",
      cause:
        "ระบบจัดคิว priority แค่ตอนเลือกว่า job ไหนควรเริ่มรันก่อนเมื่อมีหลาย job พร้อมกันพร้อมๆ กัน แต่ไม่มีกลไก preempt job ที่กำลังรันอยู่แล้วเพื่อคืน slot ให้ job priority สูงกว่าที่เพิ่งพร้อม ทำให้เกิด priority inversion เมื่อ job priority ต่ำเริ่มไปก่อนพอดี",
      resolution:
        "engineer on-call ยกเลิก job priority ต่ำที่กำลังรันอยู่ด้วยมือเพื่อคืน slot ให้ job dashboard ผู้บริหารรันได้ทัน แล้ว requeue job ที่ถูกยกเลิกให้รันใหม่ทีหลัง",
      followup:
        "ประเมินการเพิ่มกลไก preempt job priority ต่ำเมื่อ job priority สูงกว่ารอ slot อยู่นานเกินเกณฑ์ แทนการพึ่งการยกเลิกด้วยมือ",
    },
    {
      slug: "credential-rotation-missed-source-paused-silently",
      title: "ลืมหมุนเวียน Credential ทำ Source ถูก Pause เงียบๆ หลายวัน",
      tags: ["ingest", "security"],
      summary:
        "ทีมวิเคราะห์สังเกตว่าข้อมูลจาก source หนึ่งไม่อัปเดตมา 5 วันแล้ว โดยไม่มีใครได้รับแจ้งเตือนที่ชัดเจนว่าเกิดอะไรขึ้น",
      investigation:
        "ตรวจ {{ref:module:ingest-connector}} พบว่า source นี้ถูก `pauseSource` อัตโนมัติตาม {{ref:policy:connector-credential-rotation-policy}} เพราะ credential หมดอายุแล้วไม่มีการหมุนเวียน แต่การแจ้งเตือนไปเข้า Slack channel ที่ทีมเจ้าของเปลี่ยนไปใช้ channel ใหม่แล้วโดยไม่ได้อัปเดต config การแจ้งเตือนของ DataFlow",
      cause:
        "การแจ้งเตือนล่วงหน้า 14 วันก่อน credential หมดอายุถูกส่งไปจริง แต่ไปยัง Slack channel เก่าที่ไม่มีใครดูแล้ว เพราะไม่มีกระบวนการตรวจสอบว่า channel ปลายทางยังใช้งานอยู่จริงหรือไม่",
      resolution:
        "หมุนเวียน credential ใหม่ทันทีและ resume source ให้กลับมาทำงาน แล้วรัน extract แบบ full เพื่อดึงข้อมูล 5 วันที่ขาดหายกลับมา",
      followup:
        "เพิ่มการแจ้งเตือนสำรองผ่านอีเมลของเจ้าของ source โดยตรงควบคู่กับ Slack เสมอ และเพิ่ม escalation อัตโนมัติไปยังทีมแพลตฟอร์มถ้าไม่มีการหมุนเวียน credential ภายใน 3 วันหลัง source ถูก pause",
    },
    {
      slug: "cost-attribution-untagged-jobs-inflate-team-bill",
      title: "Job ไม่ติดแท็กทีมทำรายงานต้นทุนเดือนนั้นผิดเพี้ยนทั้งกระดาน",
      tags: ["cost", "orchestration"],
      summary:
        "ทีมการเงินภายในตั้งคำถามว่าทำไมกลุ่ม `unattributed` ในรายงานต้นทุนรายเดือนพุ่งขึ้นเป็นเกือบ 30% ของค่าใช้จ่ายรวม ทั้งที่เดือนก่อนหน้าอยู่ที่ไม่ถึง 5%",
      investigation:
        "ตรวจ {{ref:module:job-orchestrator}} พบว่า job ใหม่จำนวนมากที่ทีมข้อมูลสร้างขึ้นระหว่างเดือนนั้นไม่มีการแท็ก `owning_team` เลยสักตัว ตรงกับที่ {{ref:policy:cost-attribution-policy}} ระบุว่าไม่บล็อกการรันแต่จะจัดเข้ากลุ่ม unattributed แทน",
      cause:
        "ทีมข้อมูลเปลี่ยนมาใช้ template ใหม่สำหรับสร้าง job ที่เร็วขึ้นแต่ลืมใส่ค่า default `owning_team` ไว้ใน template ทำให้ทุก job ที่สร้างผ่าน template ใหม่ไม่มีแท็กเจ้าของโดยไม่มีใครสังเกตจนกว่าจะเห็นรายงานปลายเดือน",
      resolution:
        "แก้ template ให้บังคับกรอก `owning_team` ก่อนบันทึก job ได้ แล้วไล่แท็กย้อนหลังให้ job ที่สร้างไปแล้วในเดือนนั้นด้วยมือโดยอ้างอิงจากชื่อ dataset ที่ job แต่ละตัวเขียนถึง",
      followup:
        "เสนอให้ `scheduleDag` ปฏิเสธการบันทึก job ใหม่ที่ไม่มี `owning_team` แทนการปล่อยผ่านแล้วจัดเข้ากลุ่ม unattributed เฉยๆ เพื่อไม่ให้เกิดปัญหาซ้ำจาก template ในอนาคต",
    },
    {
      slug: "duplicate-row-prevention-bypassed-full-refresh-mode",
      title: "โหมด Full Refresh ข้าม Row Key Check ทำข้อมูลซ้ำหลุดเข้า Warehouse",
      tags: ["load", "duplicate"],
      summary:
        "ทีมวิเคราะห์พบว่า dataset หนึ่งที่โหลดแบบ `full_refresh` ทุกคืนมีจำนวนแถวมากกว่าจำนวนแถวจริงในต้นทางเกือบสองเท่าหลัง refresh รอบหนึ่ง",
      investigation:
        "ตรวจ {{ref:module:warehouse-loader}} พบว่าโหมด `full_refresh` ออกแบบมาให้ล้างตารางเป้าหมายทิ้งก่อนโหลดใหม่ทั้งหมด แต่รอบที่มีปัญหาขั้นตอนล้างตารางล้มเหลวเงียบๆ (permission ชั่วคราวไม่พอ) ทำให้การโหลดข้อมูลชุดใหม่ไปต่อทับข้อมูลเก่าที่ยังไม่ถูกล้างแทนที่จะแทนที่ทั้งหมด",
      cause:
        "logic การตรวจสอบแถวซ้ำด้วย row key ตาม {{ref:policy:duplicate-row-prevention-policy}} ถูกออกแบบไว้เฉพาะโหมด `append` และ `upsert` เท่านั้น โหมด `full_refresh` ข้ามการเช็คนี้ไปเลยเพราะออกแบบมาโดยสมมติว่าตารางถูกล้างว่างเสมอก่อนโหลด ทำให้เมื่อขั้นตอนล้างตารางล้มเหลว ไม่มีกลไกใดจับ duplicate ได้อีกชั้นหนึ่ง",
      resolution:
        "ล้างตารางที่มีข้อมูลซ้ำด้วยมือแล้วรัน `full_refresh` ใหม่อีกครั้งพร้อมตรวจสอบสิทธิ์การเขียนก่อนเริ่มขั้นตอนล้างตารางทุกครั้ง",
      followup:
        "เพิ่มการยืนยันว่าตารางถูกล้างว่างจริงก่อนเริ่มโหลดข้อมูลใหม่ในโหมด `full_refresh` เสมอ (ตรวจนับแถวเป็น 0 ก่อนโหลด) แทนการสมมติว่าขั้นตอนล้างตารางสำเร็จโดยไม่ตรวจสอบซ้ำ",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/DATA-142-late-arrival-window`, `fix/DATA-207-dag-circular-dependency`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(warehouse-loader): กัน duplicate row ตอน retry`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ retry logic หรือ load mode ต้องพิจารณากรณี partial success เสมอ (ดูบทเรียนจาก {{ref:incident:retry-bug-duplicate-fact-rows}}) และการเปลี่ยน default strategy ของ transform rule ต้องมีคนที่สองยืนยันก่อน merge" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `runExtract`, `applyTransform` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ทางกายภาพ", body: "`datasetId` รูปแบบ `<domain>.<name>` เช่น `sales.daily_orders`, `runId` เป็น UUID เสมอ ห้ามใช้เลขรันไปเรื่อยๆ เพราะต้อง unique ข้าม service ได้โดยไม่ต้องมี central counter" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับการประมวลผลข้อมูลต้องมี `runId` เสมอ เพื่อไล่ log ข้าม service ได้ (ingest-connector → transform-engine → data-quality-checker → warehouse-loader) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "quality check ที่ fail ระดับ `critical` log เป็น `error` เสมอ ส่วนระดับ `warning` log เป็น `warn` แม้จะไม่บล็อกการโหลดก็ตาม เพราะทีมต้อง grep เจอง่ายตอนตรวจสอบคุณภาพข้อมูลย้อนหลัง" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`DATA_<DOMAIN>_<REASON>` เช่น `DATA_EXTRACT_CREDENTIAL_EXPIRED`, `DATA_SCHEMA_BREAKING_CHANGE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`DATA_JOB_STUCK`, `DATA_QUALITY_CHECK_FAILED`, `DATA_LOAD_DUPLICATE_ROW` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "data"],
      sections: [
        { heading: "Test ด้วยข้อมูลตัวอย่างที่มีปัญหาจริง", body: "กฎการแปลงและกฎตรวจสอบคุณภาพต้องมี test case ที่ใช้ข้อมูลตัวอย่างซึ่งเคยทำให้เกิดปัญหาจริงมาก่อนเสมอ — บทเรียนจาก {{ref:incident:upstream-schema-change-silent-dashboard-break}} คือ test ที่ใช้แต่ข้อมูล happy path ไม่เจอ edge case ที่เกิดขึ้นจริงจากต้นทาง" },
        { heading: "Idempotency test", body: "ฟังก์ชันที่แตะการโหลดข้อมูลเข้า warehouse ต้องมี test ยืนยันว่ารันซ้ำด้วย input เดิมแล้วไม่เกิดแถวซ้ำเสมอ" },
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
      slug: "transform-rule-authoring-convention",
      title: "Transform Rule Authoring Convention",
      tags: ["transform", "authoring"],
      intro: "เอกสารนี้กำหนดวิธีเขียนกฎการแปลงข้อมูลให้อ่านง่ายและ debug ง่ายเมื่อเกิดปัญหา สำหรับทุกคนที่เพิ่ม transform rule ผ่าน {{ref:module:transform-engine}}",
      sections: [
        { heading: "การจัดการ null", body: "ทุกกฎการแปลงต้องระบุ null fill strategy อย่างชัดเจนต่อ column ห้ามพึ่ง `NULL_FILL_STRATEGY_DEFAULT` เฉยๆ สำหรับ column ที่เป็นตัวเลขทางการเงินหรือมีผลต่อการตัดสินใจทางธุรกิจ ต้องเขียน strategy ระบุตรงๆ ในกฎเสมอ" },
        { heading: "การตั้งชื่อกฎ", body: "ชื่อกฎต้องสื่อว่าทำอะไรกับข้อมูล ไม่ใช่แค่ชื่อ column เช่น `normalize-phone-format` ไม่ใช่ `phone-rule-1` เพื่อให้คนอื่นเข้าใจเจตนาโดยไม่ต้องเปิดอ่านโค้ดกฎ" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → transform rule regression test (สำหรับ service ที่แตะข้อมูล) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:transform-engine}} และ {{ref:module:warehouse-loader}} ต้องผ่าน regression test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบความถูกต้องของข้อมูลที่โหลดเข้า warehouse โดยตรง" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection & Query Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (network/connection layer) เท่านั้น ไม่ใช่ business timeout ของข้อมูลมาช้า — ดูเรื่องนั้นที่ {{ref:policy:late-arriving-data-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| Source connector HTTP timeout | 30s | env `EXTRACT_TIMEOUT_MS` |\n| API gateway → internal service | 8s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| Warehouse write query timeout | 120s | env `LOAD_QUERY_TIMEOUT_MS` |\n| Database connection pool acquire | 5s | `pg-pool` config |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนมิถุนายน 2026 พบว่า warehouse write query timeout สั้นเกินไปช่วง backfill ขนาดใหญ่ ทำให้ query ที่กำลังจะสำเร็จถูกตัดตอนกลางคัน ขยับ timeout จาก 60s เป็น 120s เฉพาะ backfill stream แก้ปัญหาได้" },
      ],
    },
    {
      slug: "dataset-migration-runbook",
      title: "Dataset Schema Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อต้องเปลี่ยน schema ของ dataset ที่มีอยู่แล้วแบบ breaking change (ลบคอลัมน์, เปลี่ยนชนิดข้อมูล) ต้อง migrate ทั้ง {{ref:module:schema-registry}} และ mapping ของ {{ref:module:transform-engine}} พร้อมกัน" },
        { heading: "ขั้นตอน", body: "1) แจ้งทีมที่ใช้ dataset ล่วงหน้าอย่างน้อย 2 สัปดาห์ 2) เปิดใช้ schema ใหม่แบบ dual-write คู่ขนานกับของเดิมชั่วคราว 3) ตรวจสอบว่าทุก consumer ย้ายมาใช้ schema ใหม่ครบแล้ว 4) ปิด schema เดิม" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ข้อมูลผิดพลาดกระทบ dashboard ระดับผู้บริหารหรือมี PII หลุด, Sev2 = กระทบ dataset บางตัวหรือทีมเดียว, Sev3 = กระทบเล็กน้อยไม่ถึงผู้ใช้ปลายทาง" },
        { heading: "กรณี PII หลุด", body: "ทุกเหตุการณ์ที่เกี่ยวกับ {{ref:policy:pii-classification-policy}} ต้องยกระดับเป็น Sev1 เสมอไม่ว่าขอบเขตจะเล็กแค่ไหน และแจ้งทีม security ทันทีควบคู่กับการเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "job queue depth ของ {{ref:module:job-orchestrator}} เกิน 80% ของ `DAG_MAX_CONCURRENT_JOBS`, extract failure rate เกิน 10% ของ source ทั้งหมดใน 1 ชั่วโมง, quality check fail ระดับ critical ทุกครั้ง" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ extract success rate ตกต่ำกว่า 90% หรือ quality check fail rate เพิ่มขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:transform-engine-null-fill-strategy-misconfig}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip ขั้นตอน smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| ingest-connector | 3 | 12 | active extract jobs > 200 |\n| transform-engine | 2 | 10 | CPU > 70% |\n| warehouse-loader | 2 | 6 | connection pool utilization > 80% (เข้มกว่าที่อื่นเพราะเป็น bottleneck ของทั้งระบบ) |" },
        { heading: "ข้อจำกัดของ Warehouse", body: "warehouse มี write throughput จำกัดตาม connection pool ที่ตกลงกับผู้ให้บริการ — การ scale software service เร็วขึ้นช่วยได้แค่ระดับการเตรียมข้อมูลก่อนโหลด ไม่ได้เพิ่มความเร็วการเขียนจริงเข้า warehouse ดู {{ref:policy:backfill-load-policy}} สำหรับข้อจำกัดนี้" },
      ],
    },
    {
      slug: "batch-window-capacity-runbook",
      title: "Nightly Batch Window Capacity Runbook",
      tags: ["capacity", "runbook"],
      intro: "ขั้นตอนสำหรับจัดการเมื่อ nightly batch window (01:00-04:00) มี job รอคิวมากเกินกว่าที่จะรันเสร็จทันเวลาที่ dashboard เช้าต้องการ",
      sections: [
        { heading: "ก่อน batch window เริ่ม", body: "ตรวจสอบว่าไม่มี backfill job ขนาดใหญ่ที่ยังไม่จำเป็นเร่งด่วนถูก schedule ทับช่วงเวลานี้ ตาม {{ref:convention:testing-convention}} ที่กำหนดให้ transform rule ใหม่ต้องผ่าน regression test ก่อน merge เข้า batch หลักเสมอ" },
        { heading: "เมื่อคิวล้นระหว่าง window", body: "ให้ priority ตาม {{ref:policy:job-priority-policy}} เป็นตัวตัดสินว่า job ไหนรันก่อน ถ้ายังไม่ทันจริงๆ ให้ delay job priority ต่ำสุดออกไปรันหลัง batch window แทนที่จะพยายามยัดทุกอย่างให้เสร็จในเวลาเดิม" },
      ],
    },
  ],
};
