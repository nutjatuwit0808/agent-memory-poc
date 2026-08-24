import type { DomainProfile } from "../types.js";

// ForecastIQ — แพลตฟอร์มพยากรณ์ความต้องการสินค้าคงคลังสำหรับธุรกิจค้าปลีก
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const inventoryForecasting: DomainProfile = {
  id: "inventory-forecasting",
  displayName: "ForecastIQ — ระบบพยากรณ์ความต้องการสินค้าคงคลัง",
  summary: [
    "ForecastIQ คือแพลตฟอร์มพยากรณ์ยอดขายล่วงหน้าระดับ SKU x สาขา สำหรับเชนค้าปลีกขนาดกลางถึงใหญ่ ทำงานร่วมกับระบบ ERP/POS เดิมของลูกค้าแต่ละราย โดย ForecastIQ รับผิดชอบเฉพาะชั้น \"พยากรณ์และแนะนำการเติมสินค้า\" ส่วนระบบ ERP ยังคงเป็นเจ้าของข้อมูล inventory position และการสั่งซื้อจริงระดับธุรกิจ",
    "ระบบแบ่งเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่รัน demand model รายคืน ปรับค่าตามฤดูกาล/โปรโมชัน ไปจนถึงแนะนำจำนวนเติมสินค้าและเฝ้าระวังความผิดปกติของยอดขาย ทีมวิศวกรรมเรียกช่วง 6 สัปดาห์ก่อนเทศกาลใหญ่ (เช่น BigSale 11.11/12.12) ว่า high-volatility window เพราะเป็นช่วงที่ demand pattern เบี่ยงเบนจาก baseline มากที่สุดและ error ของโมเดลสูงขึ้นตามไปด้วย",
  ],
  domainTags: ["inventory-forecasting", "forecastiq"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:feature-store}} เป็นเจ้าของ feature vector ทั้งหมดที่ใช้ป้อนโมเดล ส่วน {{ref:module:demand-model-runner}} เป็นเจ้าของผลลัพธ์การพยากรณ์ดิบเท่านั้น ไม่เก็บ feature ซ้ำเองแม้แต่ค่าเดียว เพื่อไม่ให้เกิดปัญหาสองแหล่งความจริง (dual source of truth)",
    "{{ref:module:replenishment-recommender}} เป็น service เดียวที่ query ทั้งผลพยากรณ์ที่ปรับฤดูกาลแล้วและตัวเลข inventory position ปัจจุบันจาก ERP พร้อมกันเพื่อคำนวณจำนวนเติมสินค้า — เหตุผลที่ยอมให้ query ข้าม domain แบบนี้ (ผิดหลักทั่วไป) คือการคำนวณจำนวนเติมต้องเห็นทั้ง \"ควรมีเท่าไหร่\" และ \"มีอยู่เท่าไหร่\" พร้อมกันในเวลาที่ตัดสินใจ ไม่งั้นจะเกิดการสั่งซื้อซ้ำซ้อนถ้าแยกกันเรียกคนละเวลา",
  ],
  apiGatewayNote: [
    "คำขอจาก ERP ภายนอกเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงคำขอ \"ขอดูพยากรณ์ SKU นี้\" เป็น query ไปยัง {{ref:module:demand-model-runner}} คำขอที่ต้องการผลลัพธ์ทันที เช่น เช็คสถานะ batch run ล่าสุด ใช้ synchronous call ตรงนี้",
    "การรัน batch พยากรณ์จริงไม่ผ่าน API gateway ตัวนี้ — เป็น scheduled job ภายในที่ trigger เองตามเวลา เพราะเป็น workload ขนาดใหญ่ (หลายล้าน SKU x store combination ต่อคืน) ที่ไม่เหมาะกับ synchronous request-response pattern เลย",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:demand-model-runner}} ดูแล ได้แก่ `forecast_runs` (metadata ของแต่ละ batch run), `forecast_results` (ผลพยากรณ์ดิบต่อ SKU x store x week), และ `model_versions`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `forecast_results` | demand-model-runner | ผลดิบก่อนปรับฤดูกาล อัปเดตทุกคืน |\n| `feature_vectors` | feature-store | feature ที่ป้อนโมเดล มี version + timestamp |\n| `replenishment_recommendations` | replenishment-recommender | คำแนะนำเติมสินค้าที่ยังไม่ approve/approve แล้ว |\n| `accuracy_metrics` | forecast-accuracy-tracker | WAPE/MAPE รายสัปดาห์ต่อ SKU/category |",
    "ทุกตารางใช้ `sku_id` และ `store_id` เป็น composite key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายสัปดาห์แทน",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `forecast.completed`, `forecast.failed`, `feature.batch_written`, `anomaly.flagged`, `replenishment.recommended` — {{ref:module:seasonality-adjuster}} subscribe `forecast.completed` เพื่อเริ่มปรับค่าฤดูกาลทันทีที่ raw forecast เสร็จ ไม่ต้อง poll",
    "{{ref:module:anomaly-flagger}} subscribe ทั้ง `forecast.completed` และ actual sales feed จาก POS เพื่อเทียบ residual แบบเกือบ real-time โดยไม่ผูกกับรอบ batch คืนเดียว ออกแบบแบบนี้เพื่อให้จับความผิดปกติของยอดขายจริงได้เร็วกว่าการรอ batch พยากรณ์รอบถัดไป",
  ],
  modules: [
    {
      slug: "demand-model-runner",
      name: "demand-model-runner",
      tags: ["forecasting", "module", "core"],
      description:
        "รับผิดชอบรันโมเดลพยากรณ์ demand ดิบต่อ SKU x store ทุกคืน แยกออกมาจาก \"forecast-service\" ก้อนเดียวตั้งแต่กลางปี 2025 เพราะการรันโมเดล (compute-heavy, ต้อง scale ตาม GPU/CPU) กับการคำนวณ feature (I/O-heavy) มี resource profile ต่างกันมากจนต้อง scale แยกกัน",
      functions: [
        { sig: "runForecastBatch(regionId: string, asOfDate: string): Promise<BatchResult>", desc: "รันพยากรณ์ทั้งภูมิภาคสำหรับคืนนั้น แบ่งเป็น shard ย่อยตาม category" },
        { sig: "getForecast(skuId: string, storeId: string, horizonWeeks: number): Promise<ForecastPoint[]>", desc: "คืนผลพยากรณ์ดิบ (ก่อนปรับฤดูกาล) ตาม horizon ที่ขอ" },
        { sig: "retryFailedShard(batchId: string, shardId: string): Promise<void>", desc: "รันเฉพาะ shard ที่ล้มเหลวซ้ำ โดยไม่ต้องรัน batch ทั้งก้อนใหม่" },
      ],
      stateFlow: "queued → running → completed | failed | partial (บาง shard สำเร็จ บาง shard ล้มเหลว) — ดู {{ref:policy:forecast-horizon-policy}} สำหรับความหมายของ horizon แต่ละช่วง",
      relatedNotes:
        "ดึง feature จาก {{ref:module:feature-store}} เท่านั้น ไม่คำนวณ feature เองแม้แต่ตัวเดียว และไม่เรียก {{ref:module:seasonality-adjuster}} โดยตรง — ปล่อยให้ seasonality-adjuster subscribe event `forecast.completed` แล้วดึงผลไปปรับเองภายหลัง เพื่อให้ demand-model-runner ไม่ต้องรู้จัก concept เรื่องฤดูกาลเลย",
      internals: {
        constants: [
          { name: "FORECAST_HORIZON_WEEKS", value: "12" },
          { name: "MAX_SHARD_RETRY", value: "2" },
          { name: "MODEL_TIMEOUT_MS", value: "180000" },
        ],
        typeSnippet:
          "interface ForecastPoint {\n  skuId: string;\n  storeId: string;\n  weekStart: string;\n  predictedQty: number;\n  confidenceLow: number;\n  confidenceHigh: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่อง retrain ที่ {{ref:policy:model-retrain-policy}}",
      },
    },
    {
      slug: "seasonality-adjuster",
      name: "seasonality-adjuster",
      tags: ["seasonality", "module"],
      description:
        "ปรับค่าพยากรณ์ดิบด้วย seasonal index และ promo uplift factor เพื่อแก้ปัญหาที่โมเดลหลักมีประวัติข้อมูลไม่พอจะเรียนรู้ปรากฏการณ์ตามฤดูกาลหรือเทศกาลได้แม่นยำเอง โดยเฉพาะ SKU ใหม่ที่ยังไม่เคยผ่านเทศกาลมาก่อนเลย",
      functions: [
        { sig: "applySeasonalIndex(rawForecast: ForecastPoint, categoryId: string): ForecastPoint", desc: "คูณค่าพยากรณ์ดิบด้วย seasonal index ของ category/สัปดาห์นั้น" },
        { sig: "registerPromoWindow(promoId: string, startDate: string, endDate: string, upliftFactor: number): Promise<void>", desc: "ลงทะเบียนช่วงโปรโมชันและตัวคูณ uplift ที่คาดไว้ล่วงหน้า" },
        { sig: "recalculateIndexFromHistory(categoryId: string): Promise<void>", desc: "คำนวณ seasonal index ใหม่จากประวัติยอดขายย้อนหลัง เรียกเมื่อเทศกาลผ่านไปแล้วเพื่อ calibrate รอบถัดไป" },
      ],
      relatedNotes:
        "รับ input จาก {{ref:module:demand-model-runner}} ผ่าน event `forecast.completed` เท่านั้น ไม่แตะข้อมูลยอดขายดิบเองโดยตรง — ต้องอ่านผ่าน {{ref:module:feature-store}} เสมอเพื่อให้ feature ที่ใช้คำนวณ seasonal index มาจากแหล่งเดียวกับที่โมเดลใช้",
    },
    {
      slug: "replenishment-recommender",
      name: "replenishment-recommender",
      tags: ["replenishment", "module", "core"],
      description:
        "แปลงผลพยากรณ์ที่ปรับฤดูกาลแล้วรวมกับ inventory position ปัจจุบันจาก ERP ให้เป็นคำแนะนำจำนวนเติมสินค้า (purchase order draft) โดยคำนวณ safety stock และ lead time buffer ต่อ SKU เป็นรายตัว",
      functions: [
        { sig: "computeReplenishmentQty(skuId: string, storeId: string): Promise<ReplenishmentRecommendation>", desc: "คำนวณจำนวนที่ควรเติมจาก forecast + safety stock - inventory position ปัจจุบัน" },
        { sig: "generatePurchaseOrderDraft(supplierId: string, skuIds: string[]): Promise<string>", desc: "รวม recommendation หลาย SKU ของ supplier เดียวกันเป็น draft PO ใบเดียว คืน draftId" },
        { sig: "applyAnalystOverride(skuId: string, storeId: string, qty: number, analystId: string): Promise<void>", desc: "ให้ analyst แก้จำนวนที่ระบบแนะนำด้วยมือ พร้อมบันทึกว่าใครแก้" },
      ],
      stateFlow: "draft → reviewed → approved → sent_to_supplier — ดู {{ref:policy:replenishment-approval-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่ต้องมีคนอนุมัติก่อนส่ง",
      relatedNotes:
        "เป็น service เดียวที่ query ข้าม {{ref:module:seasonality-adjuster}} และข้อมูล inventory position จาก ERP พร้อมกันได้ (ข้อยกเว้นที่ตั้งใจ ดู {{ref:arch:boundaries}}) — ค่า override จาก analyst ผ่าน `applyAnalystOverride` ต้องไม่ถูกงานอื่นทับโดยไม่ผ่านการตรวจสอบ ดู {{ref:policy:backfill-policy}}",
      internals: {
        constants: [
          { name: "DEFAULT_SAFETY_STOCK_DAYS", value: "7" },
          { name: "LEAD_TIME_BUFFER_DAYS", value: "2" },
          { name: "MAX_ORDER_QTY_MULTIPLIER", value: "3" },
        ],
        typeSnippet:
          "interface ReplenishmentRecommendation {\n  skuId: string;\n  storeId: string;\n  recommendedQty: number;\n  source: \"system\" | \"analyst_override\";\n  status: \"draft\" | \"reviewed\" | \"approved\" | \"sent_to_supplier\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง override ที่ {{ref:policy:forecast-override-policy}}",
      },
    },
    {
      slug: "forecast-accuracy-tracker",
      name: "forecast-accuracy-tracker",
      tags: ["accuracy", "module"],
      description:
        "เทียบผลพยากรณ์กับยอดขายจริงหลังจากสัปดาห์นั้นผ่านไปแล้ว คำนวณ WAPE (Weighted Absolute Percentage Error) เป็นตัวชี้วัดหลักและ MAPE เป็นตัวเสริม ใช้ตัวเลขนี้ตัดสินใจว่า SKU/category ไหนต้อง retrain หรือให้คนตรวจสอบ",
      functions: [
        { sig: "recordActual(skuId: string, storeId: string, weekStart: string, actualQty: number, unit: SalesUnit): Promise<void>", desc: "บันทึกยอดขายจริงของสัปดาห์นั้นเพื่อเทียบกับพยากรณ์" },
        { sig: "computeAccuracyMetrics(categoryId: string, periodStart: string, periodEnd: string): Promise<AccuracyReport>", desc: "คำนวณ WAPE/MAPE รวมของ category ในช่วงเวลาที่ระบุ" },
        { sig: "flagLowAccuracySkus(threshold: number): Promise<string[]>", desc: "คืนรายชื่อ SKU ที่ WAPE เกิน threshold ติดต่อกัน 2 สัปดาห์" },
      ],
      relatedNotes:
        "ผลจาก `flagLowAccuracySkus` เป็น input หลักของ {{ref:policy:model-retrain-policy}} — เทียบกับผลพยากรณ์ *หลังปรับฤดูกาลแล้ว* จาก {{ref:module:seasonality-adjuster}} เสมอ ไม่ใช่ผลดิบจาก {{ref:module:demand-model-runner}} เพราะการเทียบกับผลดิบจะทำให้ error ดูสูงเกินจริงในสัปดาห์ที่มีเทศกาล",
    },
    {
      slug: "feature-store",
      name: "feature-store",
      tags: ["feature-store", "module", "core"],
      description:
        "ศูนย์กลาง feature วิศวกรรมทั้งหมดที่ป้อนให้โมเดล (rolling sales average, ราคา, promo flag, category average, ฯลฯ) ทุก feature มี version และ timestamp ชัดเจน แยกออกมาเป็น service กลางเพื่อไม่ให้แต่ละโมเดลคำนวณ feature ซ้ำกันคนละสูตร",
      functions: [
        { sig: "getFeatureVector(skuId: string, storeId: string, asOfDate: string): Promise<FeatureVector>", desc: "คืน feature vector ล่าสุดที่ไม่เกิน MAX_FEATURE_LAG_HOURS ณ เวลาที่ขอ" },
        { sig: "writeFeatureBatch(featureSetId: string, rows: FeatureRow[]): Promise<void>", desc: "เขียน feature batch ใหม่เข้าระบบ พร้อม version ใหม่" },
        { sig: "invalidateStaleFeatures(featureSetId: string): Promise<void>", desc: "mark feature set เป็น stale เมื่อ source data ล่าช้าเกินกำหนด" },
      ],
      relatedNotes:
        "{{ref:module:demand-model-runner}} เรียก `getFeatureVector` ก่อนรันโมเดลทุกครั้ง แต่ feature-store ไม่รู้จัก concept ของ \"โมเดล\" หรือ \"การพยากรณ์\" เลย — รู้แค่ว่า feature ตัวไหนสดหรือไม่สด ความหมายว่า feature เก่าแค่ไหนถึงใช้ไม่ได้กำหนดโดย {{ref:policy:feature-freshness-policy}}",
      internals: {
        constants: [
          { name: "FEATURE_TTL_HOURS", value: "26" },
          { name: "MAX_FEATURE_LAG_HOURS", value: "30" },
        ],
        typeSnippet:
          "interface FeatureVector {\n  skuId: string;\n  storeId: string;\n  asOfDate: string;\n  rollingAvg28d: number;\n  priceIndex: number;\n  promoFlag: boolean;\n  categoryAvgFallback: number;\n  featureSetVersion: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องความสดของ feature ที่ {{ref:policy:feature-freshness-policy}}",
      },
    },
    {
      slug: "anomaly-flagger",
      name: "anomaly-flagger",
      tags: ["anomaly", "module"],
      description:
        "เฝ้าระวังส่วนต่าง (residual) ระหว่างยอดขายจริงกับพยากรณ์แบบเกือบ real-time เพื่อแยกแยะว่าเป็น \"demand shift จริง\" ที่ควรให้โมเดล adapt หรือเป็น \"ปัญหาคุณภาพข้อมูล\" ที่ต้องแก้ที่ต้นทางแทน",
      functions: [
        { sig: "evaluateResidual(skuId: string, storeId: string, weekStart: string): Promise<AnomalyEvaluation>", desc: "คำนวณ z-score ของส่วนต่างระหว่างจริงกับพยากรณ์" },
        { sig: "flagAnomaly(skuId: string, storeId: string, reason: AnomalyReason): Promise<string>", desc: "สร้าง anomaly record ใหม่ คืน anomalyId" },
        { sig: "suppressFlag(anomalyId: string, reviewerId: string, resolution: string): Promise<void>", desc: "ปิด flag หลังคนตรวจสอบแล้วว่าไม่ต้อง action เพิ่ม" },
      ],
      relatedNotes:
        "subscribe ทั้ง event `forecast.completed` จาก {{ref:module:demand-model-runner}} และ actual sales feed จาก POS โดยตรง (ดู {{ref:arch:queue}}) — threshold ที่ใช้ตัดสิน anomaly กำหนดโดย {{ref:policy:anomaly-threshold-policy}} ซึ่งต่างกันตาม volatility ของแต่ละ category",
    },
  ],
  envVarGroups: [
    {
      service: "demand-model-runner-service",
      vars: [
        { name: "MODEL_TIMEOUT_MS", example: "180000", note: "ดู {{ref:policy:forecast-horizon-policy}}" },
        { name: "FORECAST_HORIZON_WEEKS", example: "12", note: "" },
        { name: "MODEL_RUNNER_DB_URL", example: "postgres://forecast-db.internal:5432/forecast", note: "secret ห้าม log" },
      ],
    },
    {
      service: "feature-store-service",
      vars: [
        { name: "FEATURE_TTL_HOURS", example: "26", note: "ดู {{ref:policy:feature-freshness-policy}}" },
        { name: "MAX_FEATURE_LAG_HOURS", example: "30", note: "" },
      ],
    },
    {
      service: "replenishment-recommender-service",
      vars: [
        { name: "DEFAULT_SAFETY_STOCK_DAYS", example: "7", note: "" },
        { name: "REPLENISHMENT_APPROVAL_THRESHOLD_USD", example: "50000", note: "เกินนี้ต้องอนุมัติตาม {{ref:policy:replenishment-approval-policy}}" },
      ],
    },
    {
      service: "anomaly-flagger-service",
      vars: [
        { name: "ANOMALY_ZSCORE_THRESHOLD", example: "2.5", note: "ดู {{ref:policy:anomaly-threshold-policy}}" },
        { name: "ANOMALY_SUPPRESS_WINDOW_HOURS", example: "72", note: "หลัง suppress แล้วไม่ flag ซ้ำ SKU เดิมภายในช่วงนี้" },
      ],
    },
  ],
  policies: [
    {
      slug: "model-retrain-policy",
      title: "นโยบายการ Retrain โมเดลพยากรณ์",
      tags: ["forecasting", "retrain", "policy"],
      isPrimary: true,
      intro: [
        "SKU ที่ถูก {{ref:module:forecast-accuracy-tracker}} ตรวจพบว่า WAPE เกิน 30% ติดต่อกัน 2 สัปดาห์ จะถูกเสนอเข้าคิว retrain อัตโนมัติ นอกจากนี้ยังมี full retrain ตามรอบทุกไตรมาสสำหรับทุก category ไม่ว่าค่า accuracy จะเป็นอย่างไร",
        "retrain ไม่ได้แปลว่าโมเดลใหม่จะถูก deploy ทันที — ต้องผ่าน backtest เทียบกับโมเดลปัจจุบันก่อนเสมอ (ดู {{ref:convention:testing-convention}}) ถ้า backtest ไม่ดีกว่าเดิมชัดเจน จะไม่ deploy",
      ],
      sections: [
        {
          heading: "ทำไมไม่ retrain ทุกคืน",
          body: "การ retrain ใช้ compute สูงและมีความเสี่ยงที่โมเดลใหม่จะแย่กว่าเดิมถ้าข้อมูลช่วงนั้นผิดปกติ (เช่น ช่วงโปรโมชัน) การ retrain ทุกคืนจะทำให้โมเดล \"แกว่ง\" ตามสัญญาณรบกวนระยะสั้นแทนที่จะจับ pattern ระยะยาวที่แท้จริง",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Retrain ช่วงโปรโมชันใหญ่และ SKU ใหม่",
        tags: ["forecasting", "retrain", "edge-case"],
        body: [
          "ระหว่าง high-volatility window (6 สัปดาห์ก่อนเทศกาลใหญ่ถึง 1 สัปดาห์หลังจบ) ระบบจะไม่ trigger retrain อัตโนมัติแม้ WAPE จะเกิน threshold เพราะข้อมูลช่วงนี้ผันผวนจากผลของโปรโมชันเป็นหลัก ไม่ใช่สัญญาณว่าโมเดล base ผิดพลาด การ retrain ด้วยข้อมูลช่วงนี้เสี่ยงทำให้โมเดล overfit กับ promo effect เพียงอย่างเดียว",
          "SKU ที่เพิ่งผ่าน cold-start period ตาม {{ref:policy:cold-start-fallback-policy}} ไม่นับรวมใน accuracy metric ที่ใช้ตัดสิน retrain จนกว่าจะมีประวัติยอดขายจริงอย่างน้อย 8 สัปดาห์ เพราะช่วง cold-start ใช้ค่า fallback ที่รู้อยู่แล้วว่าไม่แม่นยำเท่าโมเดลที่มีข้อมูลเพียงพอ",
        ],
      },
    },
    {
      slug: "forecast-override-policy",
      title: "นโยบายการ Override ค่าพยากรณ์โดย Analyst",
      tags: ["replenishment", "override", "policy"],
      isPrimary: true,
      intro: [
        "Analyst สามารถแก้จำนวนเติมสินค้าที่ระบบแนะนำด้วยมือผ่าน `applyAnalystOverride` ได้เสมอ โดยต้องระบุเหตุผลประกอบทุกครั้ง (เช่น รู้ข้อมูล promo ที่ระบบยังไม่เห็น หรือข้อจำกัดด้าน shelf space ที่ระบบไม่รู้จัก)",
        "ค่า override ถือเป็น \"ความจริงล่าสุด\" และมี priority สูงกว่าค่าที่ระบบคำนวณเองเสมอ จนกว่าจะหมดอายุหรือถูกยกเลิกด้วยมือ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Override หมดอายุหรือถูกงานอื่นแตะ",
        tags: ["replenishment", "override", "edge-case"],
        body: [
          "Override มีอายุ 21 วันนับจากวันที่ตั้งค่า หากเกินกำหนดโดยไม่มีการยืนยันซ้ำ ระบบจะกลับไปใช้ค่าที่คำนวณอัตโนมัติแทน เพื่อไม่ให้ override เก่าที่บริบทเปลี่ยนไปแล้วค้างอยู่ถาวรโดยไม่มีใครทบทวน",
          "งาน backfill หรือ batch job ใดๆ ที่เขียนทับ `replenishment_recommendations` ต้อง preserve แถวที่ `source = \"analyst_override\"` เสมอ ห้ามเขียนทับด้วยค่าระบบโดยไม่ผ่านการตรวจสอบก่อน — ดู {{ref:policy:backfill-policy}} สำหรับกลไกป้องกันที่ใช้จริง",
        ],
      },
    },
    {
      slug: "cold-start-fallback-policy",
      title: "นโยบายพยากรณ์สินค้าใหม่ (Cold Start)",
      tags: ["forecasting", "cold-start", "policy"],
      isPrimary: true,
      intro: [
        "SKU ที่ยังไม่มีประวัติยอดขายของตัวเอง (สินค้าใหม่) ใช้ค่าเฉลี่ยของ category เดียวกัน (`categoryAvgFallback`) เป็นพยากรณ์เริ่มต้นในช่วง 8 สัปดาห์แรก แล้วค่อยๆ blend สัดส่วนของสัญญาณจริงของ SKU นั้นเข้ามาแทนที่ทีละสัปดาห์",
        "สัดส่วนการ blend คำนวณจากจำนวนสัปดาห์ที่มีข้อมูลจริงแล้ว หาร 8 (เช่น สัปดาห์ที่ 3 ใช้สัญญาณจริง 3/8 และ fallback 5/8) เพื่อไม่ให้พยากรณ์กระโดดแรงเกินไปตอนสัญญาณจริงยังมีน้อย",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ SKU กลยุทธ์ (Strategic Launch)",
        tags: ["forecasting", "cold-start", "edge-case"],
        body: [
          "SKU ที่ถูก flag เป็น `strategic_launch` (สินค้าเรือธงที่มีแผนการตลาดชัดเจนล่วงหน้า) ไม่เข้าเงื่อนไข category-average fallback อัตโนมัติ — ทีม demand planning ต้องกรอกแผนพยากรณ์เริ่มต้นด้วยมือแทน เพราะค่าเฉลี่ย category ทั่วไปมักต่ำกว่าความจริงมากสำหรับสินค้าที่มีการตลาดสนับสนุนหนัก",
          "เมื่อ strategic launch SKU สะสมข้อมูลจริงครบ 4 สัปดาห์ (สั้นกว่า SKU ทั่วไปที่ใช้ 8 สัปดาห์) ระบบจะเริ่ม blend สัญญาณจริงเข้ามาได้เร็วกว่าปกติ เพราะสินค้ากลุ่มนี้มักมีสัญญาณช่วงแรกที่ชัดเจนและน่าเชื่อถือกว่าสินค้าทั่วไป",
        ],
      },
    },
    {
      slug: "anomaly-threshold-policy",
      title: "นโยบายกำหนด Threshold ความผิดปกติของยอดขาย",
      tags: ["anomaly", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:anomaly-flagger}} ใช้ z-score ของส่วนต่างระหว่างยอดขายจริงกับพยากรณ์เทียบกับ `ANOMALY_ZSCORE_THRESHOLD` (ค่าปกติ 2.5) เป็นเกณฑ์หลัก แต่ threshold จริงต่างกันตาม volatility ของแต่ละ category — category ที่ผันผวนสูงโดยธรรมชาติ (เช่น เสื้อผ้าตามฤดูกาล) ใช้ threshold สูงกว่า category ที่นิ่ง (เช่น ของใช้ประจำวัน)",
        "anomaly ที่ flag แล้วไม่ได้แปลว่าต้อง action ทันที — เป็นสัญญาณให้คนตรวจสอบก่อนว่าเป็น demand shift จริงหรือปัญหาข้อมูล",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับ SKU ที่อยู่ในช่วงโปรโมชัน",
        tags: ["anomaly", "promo", "edge-case"],
        body: [
          "SKU ที่มี `promoFlag = true` ตาม {{ref:policy:promo-flag-policy}} ใช้ threshold ที่ผ่อนปรนกว่าปกติ (z-score 4.0 แทน 2.5) เพราะยอดขายพุ่งช่วงโปรโมชันเป็นเรื่องคาดหวังอยู่แล้ว ไม่ใช่ความผิดปกติ — การใช้ threshold ปกติกับ SKU โปรโมชันเคยทำให้เกิด false positive จำนวนมากท่วมคิวตรวจสอบ",
          "แต่ถ้า SKU โปรโมชันมียอดขาย \"ต่ำกว่า\" พยากรณ์ผิดปกติ (ไม่ใช่สูงกว่า) จะยังคง flag ด้วย threshold ปกติเสมอ เพราะการขายไม่ออกทั้งที่มีโปรโมชันสนับสนุนเป็นสัญญาณสำคัญที่ไม่ควรถูกกลบด้วย threshold ที่ผ่อนปรน",
        ],
      },
    },
    {
      slug: "feature-freshness-policy",
      title: "นโยบายความสดของ Feature",
      tags: ["feature-store", "policy"],
      isPrimary: true,
      intro: [
        "feature ใดๆ ที่อายุเกิน `MAX_FEATURE_LAG_HOURS` (30 ชั่วโมง) นับเป็น stale — {{ref:module:demand-model-runner}} จะปฏิเสธไม่รันพยากรณ์สำหรับ SKU x store ที่ feature stale แทนที่จะรันด้วยข้อมูลเก่าเงียบๆ",
        "SKU x store ที่ถูกข้ามเพราะ feature stale จะถูกจัดเป็นผลลัพธ์ `partial` ของ batch นั้น และ retry อัตโนมัติในรอบถัดไปเมื่อ feature สดขึ้น",
      ],
      edgeCase: {
        title: "ข้อยกเว้นช่วงวันหยุดยาวที่ source data ล่าช้าตามคาด",
        tags: ["feature-store", "edge-case"],
        body: [
          "ช่วงวันหยุดยาวที่ระบบ POS ต้นทางของลูกค้าบาง site ปิดทำการหรือส่งข้อมูลล่าช้าตามที่แจ้งล่วงหน้า ทีม data engineering สามารถประกาศ \"extended freshness window\" ชั่วคราวสำหรับ store นั้นได้ เพื่อไม่ให้ทุก SKU ใน store นั้นถูก mark partial โดยไม่จำเป็นทั้งที่รู้อยู่แล้วว่าข้อมูลจะมาช้า",
          "extended window ต้องประกาศล่วงหน้าเป็นลายลักษณ์อักษรเท่านั้น ห้าม infer อัตโนมัติจากการที่ feature ขาดหาย เพราะ feature ขาดหายอาจเป็นปัญหาจริงที่ต้องรู้ตัวเร็ว ไม่ใช่แค่ความล่าช้าที่คาดไว้",
        ],
      },
    },
    {
      slug: "replenishment-approval-policy",
      title: "นโยบายการอนุมัติคำแนะนำเติมสินค้า",
      tags: ["replenishment", "approval", "policy"],
      isPrimary: true,
      intro: [
        "คำแนะนำเติมสินค้าที่มีมูลค่ารวมเกิน `REPLENISHMENT_APPROVAL_THRESHOLD_USD` ต้องผ่านการอนุมัติจากผู้จัดการหมวดสินค้าก่อนจึงจะเปลี่ยนสถานะเป็น `approved` และส่งต่อให้ ERP สร้าง PO จริงได้",
        "คำแนะนำที่ต่ำกว่า threshold ส่งตรงไป `sent_to_supplier` อัตโนมัติโดยไม่ต้องรอคนอนุมัติ เพื่อไม่ให้ operation ประจำวันช้าลงโดยไม่จำเป็น",
      ],
      edgeCase: {
        title: "ข้อยกเว้นกรณีสินค้าใกล้ขาดสต็อกฉุกเฉิน (Emergency Stockout)",
        tags: ["replenishment", "emergency", "edge-case"],
        body: [
          "SKU ที่ inventory position ปัจจุบันต่ำกว่า 2 วันของยอดขายเฉลี่ย (ใกล้ขาดสต็อก) จะข้ามขั้นตอนอนุมัติแม้มูลค่าจะเกิน threshold — ส่งตรงไป `sent_to_supplier` ทันทีเพื่อลดความเสี่ยงขาดสต็อกให้เร็วที่สุด",
          "คำแนะนำที่ข้ามการอนุมัติแบบนี้ต้องถูกตรวจสอบย้อนหลัง (post-hoc review) โดยผู้จัดการภายใน 24 ชั่วโมงเสมอ ถ้าพบว่าไม่สมเหตุสมผลย้อนหลังสามารถยกเลิก PO กับ supplier ได้ทันทีถ้ายังไม่ถูกยืนยันฝั่ง supplier",
        ],
      },
    },
    {
      slug: "forecast-horizon-policy",
      title: "นโยบายช่วง Horizon ของการพยากรณ์",
      tags: ["forecasting", "horizon", "policy"],
      isPrimary: false,
      intro: [
        "พยากรณ์มี horizon สูงสุด 12 สัปดาห์ แบ่งเป็นสองช่วงที่ความเชื่อมั่นต่างกัน: short horizon (สัปดาห์ 1-4) มี confidence band แคบเพราะใกล้ปัจจุบัน และ long horizon (สัปดาห์ 5-12) มี confidence band กว้างขึ้นเรื่อยๆ ตามระยะเวลา",
        "{{ref:module:replenishment-recommender}} ใช้เฉพาะ short horizon เป็นหลักในการคำนวณจำนวนเติมสินค้ารอบถัดไป ส่วน long horizon ใช้เพื่อวางแผน supplier capacity ล่วงหน้าเท่านั้น ไม่ใช้คำนวณ PO โดยตรง",
      ],
    },
    {
      slug: "backfill-policy",
      title: "นโยบายการ Backfill ข้อมูลย้อนหลัง",
      tags: ["feature-store", "backfill", "policy"],
      isPrimary: false,
      intro: [
        "งาน backfill (เช่น แก้ feature ย้อนหลังหลังพบ bug ในสูตรคำนวณ) ต้องรันผ่าน dedicated backfill job เท่านั้น ห้าม UPDATE ตารางตรงๆ ด้วยมือ เพื่อให้มี audit trail ว่า backfill ไหนแก้อะไรไปบ้าง",
        "backfill job ต้อง exclude แถวที่มี `source = \"analyst_override\"` ใน `replenishment_recommendations` เสมอตามที่ระบุใน {{ref:policy:forecast-override-policy}} — เป็นเงื่อนไขบังคับที่ script backfill ทุกตัวต้องเช็คก่อนเขียนทับ",
      ],
    },
    {
      slug: "promo-flag-policy",
      title: "นโยบายการติด Flag โปรโมชันใน Feature",
      tags: ["promo", "feature-store", "policy"],
      isPrimary: false,
      intro: [
        "SKU ที่อยู่ในช่วงโปรโมชันที่ลงทะเบียนผ่าน `registerPromoWindow` จะมี `promoFlag = true` ใน feature vector โดยอัตโนมัติตลอดช่วงเวลานั้น การลงทะเบียนต้องทำล่วงหน้าอย่างน้อย 5 วันทำการก่อนโปรโมชันเริ่ม",
        "SKU ที่ไม่ได้ลงทะเบียนล่วงหน้าแต่มีการลดราคาจริง (เช่น clearance เฉพาะกิจ) จะไม่มี promoFlag และถูกโมเดลตีความเป็น demand shift ปกติ ซึ่งมักทำให้พยากรณ์รอบถัดไปคลาดเคลื่อน — ทีม category ต้องลงทะเบียนทุกครั้งแม้เป็นโปรโมชันเฉพาะกิจ",
      ],
    },
    {
      slug: "category-fallback-policy",
      title: "นโยบายการใช้ค่าเฉลี่ย Category ทดแทน",
      tags: ["forecasting", "category", "policy"],
      isPrimary: false,
      intro: [
        "SKU ที่มีข้อมูลยอดขายไม่พอ (น้อยกว่า 4 สัปดาห์ในรอบ 12 สัปดาห์ล่าสุด แต่ไม่ใช่สินค้าใหม่เอี่ยม) ใช้ค่าเฉลี่ย category ผสมกับสัญญาณ SKU ที่มีอยู่บางส่วน ต่างจาก {{ref:policy:cold-start-fallback-policy}} ซึ่งใช้กับ SKU ที่ไม่มีประวัติเลย",
        "สัดส่วนผสมคำนวณจากจำนวนสัปดาห์ที่มีข้อมูลจริงเทียบกับ 4 สัปดาห์ขั้นต่ำ ไม่ใช่สูตรเดียวกับ cold-start เพราะ SKU กลุ่มนี้มีสัญญาณบางส่วนที่น่าเชื่อถือกว่าสินค้าใหม่ล้วนๆ",
      ],
    },
    {
      slug: "data-retention-policy",
      title: "นโยบายการเก็บประวัติผลการพยากรณ์",
      tags: ["retention", "policy"],
      isPrimary: false,
      intro: [
        "ผล `forecast_runs` และ `forecast_results` เก็บไว้ 18 เดือนสำหรับใช้คำนวณ accuracy ย้อนหลังและ debug — เกินกว่านั้น archive ไปเก็บแบบ cold storage แทนที่จะลบทิ้ง เพราะทีมวิเคราะห์บางครั้งต้องเทียบ pattern ปีต่อปี",
        "`accuracy_metrics` เก็บถาวรไม่มีวันลบ เพราะเป็นข้อมูลขนาดเล็กมากเทียบกับ `forecast_results` และมีประโยชน์ระยะยาวสำหรับติดตามคุณภาพโมเดลข้ามปี",
      ],
    },
  ],
  incidents: [
    {
      slug: "promo-season-model-drift",
      title: "โมเดลพยากรณ์เพี้ยนหลัง BigSale เพราะ training data ไม่มีข้อมูลโปรโมชันเดิม",
      tags: ["forecasting", "drift"],
      summary:
        "หลัง full retrain รอบไตรมาสที่รันทันทีหลัง BigSale จบ ทีม category พบว่าพยากรณ์สัปดาห์ปกติถัดมาสูงเกินจริงอย่างเป็นระบบสำหรับเกือบทุก SKU ในหลาย category",
      investigation:
        "ตรวจ {{ref:module:forecast-accuracy-tracker}} พบว่า WAPE พุ่งขึ้นเฉพาะช่วง 2 สัปดาห์แรกหลัง retrain เท่านั้น ตรวจ training window ของ retrain job พบว่าดึงข้อมูลย้อนหลัง 12 สัปดาห์ซึ่งครอบคลุมช่วง BigSale เต็มๆ",
      cause:
        "retrain job ไม่ได้กรอง `promoFlag` ออกจาก training data ตามที่ {{ref:policy:model-retrain-policy}} เจตนาไว้ — โมเดลจึงเรียนรู้ว่ายอดขายสูงแบบช่วงโปรโมชันเป็น baseline ปกติ ทำให้พยากรณ์สัปดาห์ปกติสูงเกินจริง",
      resolution:
        "rollback กลับไปใช้โมเดลเวอร์ชันก่อน retrain ทันที แล้วรัน retrain ใหม่โดย exclude สัปดาห์ที่มี `promoFlag = true` ออกจาก training window อย่างชัดเจน",
      followup:
        "เพิ่ม automated check ใน retrain pipeline ให้ reject training data ที่มีสัดส่วน promo week เกิน 15% ของ window โดยไม่ผ่าน manual review ก่อน",
    },
    {
      slug: "feature-store-stale-data-category",
      title: "Feature store ส่งข้อมูลเก่าให้ทั้ง category เพราะ upstream feed หยุดเงียบ",
      tags: ["feature-store", "stale-data"],
      summary:
        "ทีม category เครื่องใช้ไฟฟ้าแจ้งว่าคำแนะนำเติมสินค้าผิดปกติทั้ง category ต่อเนื่องหลายวัน จำนวนที่แนะนำต่ำกว่าที่ควรจะเป็นมาก",
      investigation:
        "ตรวจ {{ref:module:feature-store}} พบว่า `rollingAvg28d` ของทุก SKU ใน category นี้ค้างค่าเดิมมา 6 วันติดต่อกัน ทั้งที่ `getFeatureVector` ควรปฏิเสธ feature ที่เกิน `MAX_FEATURE_LAG_HOURS` ตาม {{ref:policy:feature-freshness-policy}}",
      cause:
        "พบว่า timestamp ที่ใช้เช็คความสดคือ timestamp ตอนเขียนแถวเข้าตาราง ไม่ใช่ timestamp ของข้อมูลต้นทางจริง — feed จาก POS ของ category นี้หยุดส่งจริง แต่ job เขียนแถว \"ค่าเดิมซ้ำ\" เข้าไปทุกคืนพร้อม timestamp ใหม่ ทำให้ freshness check ผ่านทั้งที่ข้อมูลไม่ได้อัปเดตจริง",
      resolution:
        "แก้ freshness check ให้เทียบ `sourceDataTimestamp` แทน `writtenAt` แล้ว trigger `invalidateStaleFeatures` ด้วยมือสำหรับ category ที่ได้รับผลกระทบ ทำให้ batch คืนถัดไป retry ด้วยข้อมูลจริงหลัง feed กลับมาทำงาน",
      followup:
        "เพิ่ม alert แยกสำหรับ feed ที่ไม่มีข้อมูลใหม่จริงเกิน 24 ชั่วโมง แยกจาก alert เรื่อง job ล้มเหลว เพราะเป็นสองปัญหาคนละแบบ",
    },
    {
      slug: "anomaly-flood-after-demand-spike",
      title: "Anomaly flagger ท่วมคิวตรวจสอบหลังยอดขายพุ่งจริงจากกระแสไวรัล",
      tags: ["anomaly", "false-positive"],
      summary:
        "SKU สินค้าตัวหนึ่งขายดีผิดปกติหลังถูกพูดถึงใน social media ทำให้ {{ref:module:anomaly-flagger}} สร้าง flag เกือบ 200 รายการในวันเดียวสำหรับ store ต่างๆ ที่ขายสินค้าตัวนี้",
      investigation:
        "ตรวจพบว่ายอดขายจริงสูงกว่าพยากรณ์เกิน z-score 6.0 ในเกือบทุก store ที่มี SKU นี้ ตรง {{ref:policy:anomaly-threshold-policy}} ทุกประการ — ระบบทำงานถูกต้องตาม design แต่การ flag แยกทีละ store x SKU ทำให้คิวตรวจสอบท่วม",
      cause:
        "SKU ตัวนี้ไม่มี `promoFlag` เพราะไม่ใช่โปรโมชันที่ทีมวางแผน แต่เป็น demand shift ที่เกิดขึ้นเองจากปัจจัยภายนอก ระบบไม่มีกลไกรวม flag ที่มาจาก \"สาเหตุเดียวกัน\" ให้เป็นเคสเดียว จึงสร้างแยกทุก store x SKU combination",
      resolution:
        "ทีม analyst suppress flag เป็นชุดด้วยมือโดยระบุ resolution เดียวกันว่า \"organic demand spike, confirmed real\" แล้วเสนอให้ปรับพยากรณ์ SKU นี้ขึ้นชั่วคราวสำหรับสัปดาห์ถัดไป",
      followup:
        "เสนอให้ {{ref:module:anomaly-flagger}} รวม flag ของ SKU เดียวกันที่เกิดพร้อมกันหลาย store เป็น anomaly group เดียว แทนที่จะสร้างแยกทุก store ลดภาระการตรวจสอบซ้ำ",
    },
    {
      slug: "holiday-batch-job-timeout",
      title: "Batch พยากรณ์ timeout กลางคันช่วงข้อมูลปริมาณสูงเทศกาล",
      tags: ["forecasting", "timeout"],
      summary:
        "คืนก่อนเทศกาลใหญ่ batch พยากรณ์ของภูมิภาคที่มี SKU มากที่สุดไม่เสร็จภายในเวลาที่ทีม replenishment ต้องการผลตอนเช้า",
      investigation:
        "ตรวจ log {{ref:module:demand-model-runner}} พบว่าหลาย shard ใช้เวลาเกิน `MODEL_TIMEOUT_MS` (180 วินาที) เพราะ feature vector ของ SKU ที่มี promo หลายตัวซ้อนกันมีขนาดใหญ่กว่าปกติมาก การคำนวณ blend หลาย promo window พร้อมกันใช้เวลานานกว่าที่ประมาณไว้",
      cause:
        "timeout ถูกตั้งไว้ตามค่าเฉลี่ยของวันปกติ ไม่ได้คำนึงถึงว่าช่วงเทศกาลจำนวน promo window ที่ซ้อนกันต่อ SKU สูงกว่าปกติหลายเท่า ทำให้ shard ที่มี SKU โปรโมชันหนาแน่นชนกำแพงเวลาเป็นกลุ่ม",
      resolution:
        "รัน `retryFailedShard` ด้วยมือสำหรับ shard ที่ timeout โดยเพิ่ม timeout ชั่วคราวเป็น 2 เท่าเฉพาะรอบนั้น ทำให้ผลลัพธ์เสร็จทันก่อนทีม replenishment เข้างานเช้า",
      followup:
        "เสนอปรับ `MODEL_TIMEOUT_MS` ให้ scale ตามจำนวน promo window ที่ overlap ของแต่ละ shard แทนค่าคงที่ตัวเดียว พิจารณาคู่กับ {{ref:deployment:holiday-capacity-planning-runbook}}",
    },
    {
      slug: "backfill-overwrote-manual-overrides",
      title: "Backfill job เขียนทับ override ของ analyst โดยไม่ตั้งใจ",
      tags: ["backfill", "override"],
      summary:
        "analyst หลายคนแจ้งพร้อมกันว่าค่าที่ตัวเองแก้ไว้ใน `replenishment_recommendations` เมื่อสัปดาห์ก่อนหายไป กลายเป็นค่าที่ระบบคำนวณเองแทน",
      investigation:
        "ตรวจ audit log พบว่า backfill job ที่รันเพื่อแก้ bug สูตรคำนวณ safety stock เขียนทับทุกแถวใน `replenishment_recommendations` ของช่วงเวลาที่เกี่ยวข้อง รวมถึงแถวที่ `source = \"analyst_override\"` ด้วย",
      cause:
        "script backfill query แถวที่ต้องแก้ตาม `sku_id` และช่วงวันที่เท่านั้น ไม่ได้เช็ค field `source` ก่อนเขียนทับ ทั้งที่ {{ref:policy:backfill-policy}} ระบุชัดเจนว่าต้อง exclude แถว override",
      resolution:
        "restore ค่า override จาก audit log ย้อนหลังให้ analyst ที่ได้รับผลกระทบทั้งหมด แล้วรัน backfill ใหม่อีกครั้งพร้อมเงื่อนไข `WHERE source != 'analyst_override'` ที่ถูกต้อง",
      followup:
        "เพิ่ม automated guard ในระดับ database (ไม่ใช่แค่พึ่ง convention ในเอกสาร) ที่ปฏิเสธ bulk update บนแถวที่ `source = 'analyst_override'` เว้นแต่จะระบุ flag ยืนยันชัดเจน",
    },
    {
      slug: "cold-start-bad-category-fallback",
      title: "สินค้าใหม่พยากรณ์ผิดมหาศาลเพราะ category average ไม่สะท้อนความจริง",
      tags: ["cold-start", "forecasting"],
      summary:
        "สินค้าใหม่ที่เพิ่งวางขายถูกพยากรณ์ต่ำกว่าความจริงมาก ทำให้เกิดปัญหาขาดสต็อกภายในสัปดาห์แรกที่วางขาย ทั้งที่ผ่านกระบวนการ cold-start ตามปกติ",
      investigation:
        "ตรวจ {{ref:module:feature-store}} พบว่า `categoryAvgFallback` ของ category นี้คำนวณจากสินค้าเก่าที่ราคาต่ำกว่าสินค้าใหม่ตัวนี้เกือบ 3 เท่า ทำให้ค่าเฉลี่ยที่ใช้เป็น baseline ต่ำกว่าความจริงตั้งแต่ต้น",
      cause:
        "{{ref:policy:cold-start-fallback-policy}} ใช้ค่าเฉลี่ยของทั้ง category แบบไม่แบ่งตามช่วงราคา ทั้งที่พฤติกรรมการซื้อสินค้าราคาสูงกับราคาต่ำใน category เดียวกันต่างกันมาก สินค้าตัวนี้ไม่ใช่ strategic launch จึงไม่เข้าเงื่อนไขข้อยกเว้นที่ให้คนกรอกแผนเอง",
      resolution:
        "ทีม demand planning กรอกแผนพยากรณ์เริ่มต้นด้วยมือชั่วคราวผ่าน `applyAnalystOverride` จนกว่าจะมีข้อมูลจริงพอ พร้อมเร่งเติมสต็อกฉุกเฉินตาม {{ref:policy:replenishment-approval-policy}}",
      followup:
        "เสนอปรับ `categoryAvgFallback` ให้แบ่งตาม price tier ภายใน category แทนการเฉลี่ยรวม อยู่ระหว่างประเมินผลกระทบกับ category อื่นก่อนปรับจริง",
    },
    {
      slug: "seasonality-double-counted-holiday",
      title: "Seasonality adjuster คูณ uplift ซ้ำสองรอบสำหรับวันหยุดที่ทับกับโปรโมชัน",
      tags: ["seasonality", "bug"],
      summary:
        "พยากรณ์สัปดาห์ที่มีทั้งวันหยุดประจำปีและโปรโมชันที่ลงทะเบียนพร้อมกันสูงเกินจริงอย่างผิดปกติ เกือบ 4 เท่าของยอดขายจริง",
      investigation:
        "ตรวจ {{ref:module:seasonality-adjuster}} พบว่า `applySeasonalIndex` คูณทั้ง seasonal index ของวันหยุด (คำนวณจาก `recalculateIndexFromHistory`) และ `upliftFactor` ของโปรโมชันที่ลงทะเบียนแยกกัน โดยไม่รู้ว่าสองตัวนี้ทับซ้อนสาเหตุเดียวกันบางส่วน",
      cause:
        "seasonal index ที่คำนวณจากประวัติปีก่อนๆ มีผลของโปรโมชันที่เคยจัดในวันหยุดเดียวกันรวมอยู่แล้วโดยไม่ได้ตั้งใจ พอมาคูณกับ `upliftFactor` ของโปรโมชันปีนี้อีกชั้นจึงเกิดการนับซ้ำ",
      resolution:
        "ปรับพยากรณ์ที่ได้รับผลกระทบลงด้วยมือให้ใกล้เคียงความจริงมากขึ้นก่อนส่งให้ {{ref:module:replenishment-recommender}} ใช้งาน ป้องกันการสั่งซื้อเกินจำเป็น",
      followup:
        "เสนอแก้ `recalculateIndexFromHistory` ให้ exclude สัปดาห์ที่มี `promoFlag = true` ออกจากการคำนวณ seasonal index ตั้งแต่ต้น เพื่อไม่ให้สองปัจจัยนี้ปนกัน",
    },
    {
      slug: "replenishment-duplicate-purchase-orders",
      title: "สร้าง PO draft ซ้ำสองใบสำหรับ SKU เดียวกันจาก race condition",
      tags: ["replenishment", "bug"],
      summary:
        "supplier รายหนึ่งได้รับ PO draft สองใบสำหรับ SKU และช่วงเวลาเดียวกัน ทำให้เกิดความสับสนว่าต้องส่งของตามใบไหนกันแน่",
      investigation:
        "ตรวจ log `generatePurchaseOrderDraft` พบว่ามีสอง request เรียกสร้าง draft สำหรับ supplier และชุด SKU เดียวกันในเวลาไล่เลี่ยกันมาก จากสอง trigger คนละที่ (scheduled job ปกติ และการกด \"generate now\" ด้วยมือของ analyst พร้อมกันพอดี)",
      cause:
        "ฟังก์ชันไม่มีการ lock หรือ dedup ระดับ (supplier, sku_set, time_window) ก่อนสร้าง draft ใหม่ ทำให้สอง request ที่เข้ามาพร้อมกันต่างก็สร้าง draft ของตัวเองสำเร็จทั้งคู่",
      resolution:
        "ยกเลิก draft ใบที่สร้างทีหลังด้วยมือ แจ้ง supplier ให้ยึดใบแรกเป็นหลัก แล้วปิดใบที่ซ้ำในระบบให้ชัดเจน",
      followup:
        "เพิ่ม unique constraint ระดับ database บน (supplier_id, sku_set_hash, time_window) เพื่อกัน draft ซ้ำตั้งแต่ชั้นข้อมูล ไม่พึ่งแค่ application logic",
    },
    {
      slug: "accuracy-tracker-unit-mismatch",
      title: "คำนวณ WAPE ผิดเพราะหน่วยนับไม่ตรงกันระหว่าง case กับ each",
      tags: ["accuracy", "data-quality"],
      summary:
        "ทีม category สังเกตว่า WAPE ของ category เครื่องดื่มพุ่งสูงผิดปกติทันทีหลังมีการเปลี่ยนวิธีบันทึกยอดขายจากบาง store",
      investigation:
        "ตรวจ {{ref:module:forecast-accuracy-tracker}} พบว่าบาง store เริ่มส่งยอดขายจริงเป็นหน่วย \"case\" (แพ็ค 12 ชิ้น) แทนที่จะเป็น \"each\" (ชิ้น) ตามที่โมเดลพยากรณ์ไว้ ทำให้ `recordActual` บันทึกตัวเลขที่ต่ำกว่าความจริง 12 เท่าโดยไม่รู้ตัว",
      cause:
        "field `unit` ใน `recordActual` เป็น optional ไม่ได้บังคับ validate ว่าตรงกับหน่วยที่โมเดลใช้ฝึก ทำให้ store ที่ส่งข้อมูลผิดหน่วยผ่านเข้าระบบได้โดยไม่มี error ใดๆ",
      resolution:
        "แก้ไขข้อมูลย้อนหลังของ store ที่ได้รับผลกระทบด้วยการคูณ 12 กลับให้ถูกต้อง แล้วคำนวณ `computeAccuracyMetrics` ใหม่สำหรับช่วงเวลานั้น",
      followup:
        "ทำให้ field `unit` เป็น required และ validate กับหน่วยมาตรฐานของแต่ละ SKU ก่อนบันทึกเสมอ ปฏิเสธข้อมูลที่หน่วยไม่ตรงแทนที่จะรับเข้าเงียบๆ",
    },
    {
      slug: "feature-store-schema-migration-break",
      title: "Schema migration ของ feature store ทำ feature ตัวหนึ่งหายไปเงียบๆ",
      tags: ["feature-store", "migration"],
      summary:
        "หลัง migrate schema เพื่อเพิ่ม feature ใหม่ ทีมพบว่าพยากรณ์ของหลาย SKU แย่ลงอย่างค่อยเป็นค่อยไปตลอดสัปดาห์ ไม่มี error ปรากฏที่ไหนเลย",
      investigation:
        "เช็คตาม {{ref:deployment:feature-store-schema-migration-runbook}} พบว่า field เก่า `priceIndex` ถูกเปลี่ยนชื่อเป็น `price_index_v2` ระหว่าง migration แต่โมเดลเวอร์ชันที่ deploy อยู่ยัง reference ชื่อ field เก่า จึงอ่านค่า default 0 แทนค่าจริงตลอดมาโดยไม่มี error เพราะ field เป็น optional",
      cause:
        "migration script เปลี่ยนชื่อ field โดยไม่ได้เช็คว่ามี consumer ตัวไหนอ้างชื่อเดิมอยู่บ้าง และ {{ref:module:feature-store}} ไม่ reject read ที่ field หายไป แต่คืนค่า default แทน ทำให้ปัญหาไม่ปรากฏเป็น error ที่ใครสังเกตเห็นทันที",
      resolution:
        "เพิ่ม alias field `priceIndex` ชั่วคราวให้ชี้ไปที่ `price_index_v2` เพื่อไม่ให้โมเดลปัจจุบันพัง แล้ววางแผน deploy โมเดลเวอร์ชันใหม่ที่ใช้ชื่อ field ที่ถูกต้องแทน",
      followup:
        "เพิ่มขั้นตอนบังคับใน {{ref:deployment:feature-store-schema-migration-runbook}} ให้ตรวจสอบ consumer ทั้งหมดของ field ที่จะเปลี่ยนชื่อก่อน migrate เสมอ และทำให้ field สำคัญเป็น required แทน optional",
    },
    {
      slug: "anomaly-threshold-missed-real-anomaly",
      title: "Threshold ที่ปรับหลวมเกินไปทำให้พลาดความผิดปกติจริงของสต็อกหาย",
      tags: ["anomaly", "false-negative"],
      summary:
        "สินค้าหมวดหนึ่งขายลดลงต่อเนื่อง 3 สัปดาห์เพราะปัญหาสต็อกหายที่ store จริง แต่ {{ref:module:anomaly-flagger}} ไม่เคย flag เลยสักครั้ง กว่าจะรู้ตัวก็สูญเสียยอดขายไปมาก",
      investigation:
        "ตรวจ {{ref:policy:anomaly-threshold-policy}} พบว่า category นี้เพิ่งถูกปรับ threshold ให้กว้างขึ้นเมื่อเดือนก่อนหลังมีการร้องเรียนเรื่อง false positive มากเกินไปในช่วงโปรโมชันก่อนหน้า",
      cause:
        "การปรับ threshold ครั้งนั้นปรับแบบถาวรสำหรับทั้ง category ทั้งที่ต้นเหตุจริงคือปัญหาช่วงโปรโมชันเท่านั้น ทำให้หลังโปรโมชันจบ threshold ที่กว้างเกินไปยังคงใช้งานต่อ และไม่ไวพอจะจับยอดขายลดลงจริงจากปัญหาสต็อก",
      resolution:
        "ปรับ threshold ของ category กลับมาใกล้เคียงค่าเดิม พร้อมเปิดใช้ threshold แบบผ่อนปรนเฉพาะช่วงที่มี `promoFlag = true` จริงตามที่ {{ref:policy:anomaly-threshold-policy}} ออกแบบไว้ตั้งแต่ต้น",
      followup:
        "ห้ามปรับ threshold แบบถาวรเพื่อแก้ปัญหาที่มีสาเหตุเฉพาะช่วงเวลาอีก ต้องใช้กลไก promo-aware threshold ที่มีอยู่แล้วแทนเสมอ เพิ่มเป็นหัวข้อใน {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "model-retrain-data-leakage",
      title: "Retrain pipeline รั่วข้อมูลอนาคตเข้า training set โดยไม่ตั้งใจ",
      tags: ["retrain", "data-leakage"],
      summary:
        "โมเดลเวอร์ชันใหม่ผ่าน backtest ด้วยตัวเลขดีผิดปกติ แต่พอ deploy จริงกลับแม่นยำน้อยกว่าที่ backtest บ่งชี้มาก ทีมสงสัยว่า backtest มีปัญหา",
      investigation:
        "ตรวจ retrain pipeline พบว่า feature `rollingAvg28d` ที่ใช้ฝึกโมเดลบางแถวคำนวณจากช่วงเวลาที่รวมข้อมูลหลัง cutoff date ของ training window ไปด้วย เพราะ job คำนวณ rolling average รันหลัง cutoff แล้วเขียนทับค่าเก่าในตารางเดียวกัน",
      cause:
        "{{ref:module:feature-store}} เก็บ feature แบบ mutable (เขียนทับค่าล่าสุดในที่เดิม) ไม่ได้ versioned ตาม `asOfDate` อย่างเคร่งครัดสำหรับ feature ตัวนี้ ทำให้ training pipeline ที่ query \"ค่าล่าสุด\" ได้ค่าที่คำนวณจากอนาคตเทียบกับ cutoff date ของตัวเองโดยไม่รู้ตัว",
      resolution:
        "rollback ไม่ deploy โมเดลเวอร์ชันที่มีปัญหา แล้ว retrain ใหม่โดยดึง feature แบบ point-in-time ที่ล็อกค่า ณ วันที่ asOfDate จริงเท่านั้น",
      followup:
        "ปรับ {{ref:module:feature-store}} ให้ feature ทุกตัวที่ใช้ training ต้อง query แบบ point-in-time เท่านั้น ห้าม query \"ค่าล่าสุด\" ในบริบทการเทรนโมเดลอีก เพิ่มเป็นข้อบังคับใน {{ref:convention:testing-convention}}",
    },
    {
      slug: "replenishment-ignored-lead-time-change",
      title: "คำแนะนำเติมสินค้าไม่ทันเพราะ lead time ของ supplier เปลี่ยนแต่ระบบไม่รู้",
      tags: ["replenishment", "supplier"],
      summary:
        "supplier รายหนึ่งขยาย lead time จาก 5 วันเป็น 12 วันโดยแจ้งทีม procurement โดยตรง แต่ระบบยังใช้ค่าเก่าคำนวณ จนเกิดขาดสต็อกหลาย SKU ของ supplier นี้พร้อมกัน",
      investigation:
        "ตรวจ {{ref:module:replenishment-recommender}} พบว่า `LEAD_TIME_BUFFER_DAYS` และค่า lead time ต่อ supplier เป็นค่าที่ตั้งไว้ตอนตั้งค่าระบบครั้งแรก ไม่มีกลไก sync กับข้อมูล lead time ล่าสุดจาก ERP หรือทีม procurement เลย",
      cause:
        "lead time ต่อ supplier ไม่ได้ถูกออกแบบให้เป็นค่าที่ต้อง refresh สม่ำเสมอ ทีม procurement ที่เจรจากับ supplier ไม่รู้ว่าต้องไปอัปเดตค่านี้ในระบบ ForecastIQ ด้วย เพราะสื่อสารกันคนละช่องทาง",
      resolution:
        "อัปเดต lead time ของ supplier รายนี้ด้วยมือทันที แล้วรัน `computeReplenishmentQty` ใหม่สำหรับทุก SKU ของ supplier นี้เพื่อคำนวณ safety stock ที่ครอบคลุม lead time ใหม่",
      followup:
        "เสนอให้ lead time ต่อ supplier ดึงจาก ERP โดยตรงแบบ sync อัตโนมัติแทนการตั้งค่าตายตัวในระบบ เพื่อไม่ให้ต้องพึ่งคนจำได้ทุกครั้งที่มีการเปลี่ยนแปลง",
    },
    {
      slug: "region-job-blocked-batch-pipeline",
      title: "Batch ของภูมิภาคเดียวค้าง ทำให้ภูมิภาคอื่นรอไม่ได้ผลตามเวลา",
      tags: ["forecasting", "pipeline"],
      summary:
        "ภูมิภาคหนึ่งมีปัญหาข้อมูลทำให้ batch ค้างนานผิดปกติ ผลคือทุกภูมิภาคอื่นที่ไม่เกี่ยวข้องกันเลยก็ไม่ได้ผลพยากรณ์ตามเวลาเช่นกัน",
      investigation:
        "ตรวจ `runForecastBatch` พบว่า orchestration layer รัน batch ของทุกภูมิภาคเป็น sequential job เดียวต่อเนื่องกัน ไม่ได้แยก resource หรือ queue กันตามภูมิภาคเลย",
      cause:
        "ตอนออกแบบระบบครั้งแรกจำนวนภูมิภาคน้อยและ workload ไม่ต่างกันมาก จึงไม่เห็นความจำเป็นต้องแยก isolation — แต่เมื่อขยายไปหลายภูมิภาคที่ขนาดต่างกันมาก ภูมิภาคเดียวที่มีปัญหาก็บล็อกทั้งคิวได้",
      resolution:
        "แก้ orchestration ให้รันแต่ละภูมิภาคเป็น independent job คู่ขนานกันชั่วคราวด้วยมือสำหรับรอบนั้น เพื่อให้ภูมิภาคที่ไม่มีปัญหาได้ผลตามเวลาปกติ",
      followup:
        "ปรับ pipeline ถาวรให้แต่ละภูมิภาครันแบบ isolated queue คู่ขนานกันเสมอ ไม่ผูกความสำเร็จของภูมิภาคหนึ่งกับอีกภูมิภาคอีกต่อไป ทบทวนคู่กับ {{ref:deployment:scaling-policy}}",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/FCST-142-cold-start-blend-window`, `fix/FCST-158-feature-freshness-timestamp`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(feature-store): แก้ freshness check ให้ใช้ source timestamp`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "งานที่แตะ backfill หรือ bulk update ต้อง exclude แถวที่มี `source = \"analyst_override\"` เสมอ (บทเรียนจาก {{ref:incident:backfill-overwrote-manual-overrides}}) และการปรับ threshold ต้องระบุ scope ชัดเจนว่าถาวรหรือชั่วคราว (บทเรียนจาก {{ref:incident:anomaly-threshold-missed-real-anomaly}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `computeReplenishmentQty`, `applySeasonalIndex` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ทางธุรกิจ", body: "`skuId` รูปแบบ `SKU-<6 หลัก>`, `storeId` รูปแบบ `ST-<4 หลัก>`, `batchId` รูปแบบ `<regionId>-<YYYYMMDD>` ต้องตรงกันทุก service" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ batch พยากรณ์ต้องมี `batchId` เสมอ เพื่อไล่ log ข้าม service ได้ (demand-model-runner → seasonality-adjuster → replenishment-recommender) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "feature ที่ stale ตาม {{ref:policy:feature-freshness-policy}} log เป็น `warning` ไม่ใช่ `error` เพราะเป็นสถานการณ์ที่ระบบจัดการเองได้ ไม่ต้อง page คนตอนกลางดึก" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`FCST_<DOMAIN>_<REASON>` เช่น `FCST_FEATURE_STALE`, `FCST_REPLENISH_APPROVAL_REQUIRED` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`FCST_MODEL_TIMEOUT`, `FCST_ANOMALY_THRESHOLD_INVALID`, `FCST_OVERRIDE_EXPIRED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "backtest"],
      sections: [
        { heading: "Backtest ก่อน deploy โมเดล", body: "โมเดลใหม่ทุกเวอร์ชันต้องผ่าน backtest เทียบกับเวอร์ชันปัจจุบันบนข้อมูลย้อนหลังอย่างน้อย 8 สัปดาห์ก่อน deploy เสมอ — บทเรียนจาก {{ref:incident:model-retrain-data-leakage}} คือต้องใช้ feature แบบ point-in-time เท่านั้นใน backtest ห้ามใช้ค่า \"ล่าสุด\" ที่อาจรั่วข้อมูลอนาคต" },
        { heading: "Test ข้อมูลผิดหน่วย", body: "ฟังก์ชันที่รับ input ยอดขายจริงต้องมี test กรณีหน่วยไม่ตรงกับที่โมเดลฝึกไว้เสมอ (บทเรียนจาก {{ref:incident:accuracy-tracker-unit-mismatch}})" },
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
      slug: "feature-naming-convention",
      title: "Feature Naming Convention",
      tags: ["feature-store", "naming"],
      intro: "feature ทุกตัวใน {{ref:module:feature-store}} ต้องตั้งชื่อตามกติกานี้ เพื่อให้ทุกทีมที่ query feature vector เข้าใจความหมายตรงกันโดยไม่ต้องเปิดเอกสารแยก",
      sections: [
        { heading: "รูปแบบชื่อ", body: "`camelCase` เสมอ ระบุหน่วยเวลาต่อท้ายถ้าเป็น rolling window เช่น `rollingAvg28d`, `rollingAvg7d` — ห้ามใช้ตัวย่อที่กำกวม เช่น `avg` เฉยๆ โดยไม่ระบุ window" },
        { heading: "เมื่อเปลี่ยนชื่อ field", body: "ห้ามเปลี่ยนชื่อ field เดิมโดยตรงเด็ดขาด ต้องเพิ่ม field ใหม่คู่ขนานแล้ว deprecate field เก่าอย่างมีกำหนดเวลาชัดเจนแทน — บทเรียนตรงจาก {{ref:incident:feature-store-schema-migration-break}} ที่ rename field แล้ว consumer เก่าอ่านค่า default เงียบๆ" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → backtest (สำหรับ service ที่แตะโมเดล) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:demand-model-runner}} ต้องผ่าน backtest ตาม {{ref:convention:testing-convention}} เทียบกับเวอร์ชันปัจจุบันก่อน merge เสมอ service อื่นที่ไม่แตะ logic โมเดลผ่อนปรนกว่าเพราะไม่กระทบความแม่นยำของพยากรณ์โดยตรง" },
      ],
    },
    {
      slug: "batch-job-timeout-tuning",
      title: "Batch Job Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure ของ batch job เท่านั้น ไม่ใช่ business horizon ของพยากรณ์ — ดูเรื่องนั้นที่ {{ref:policy:forecast-horizon-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| Shard model timeout | 180s | env `MODEL_TIMEOUT_MS` |\n| Shard retry สูงสุด | 2 ครั้ง | env `MAX_SHARD_RETRY` |\n| Feature vector fetch timeout | 15s | `feature-store` client config |\n| Batch orchestration total timeout | 4 ชั่วโมง | orchestrator config |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "ช่วงเทศกาลใหญ่พบว่า shard ที่มี SKU โปรโมชันซ้อนกันหนาแน่นใช้เวลาคำนวณนานกว่าปกติจนชน timeout เป็นกลุ่ม ดู {{ref:incident:holiday-batch-job-timeout}} — อยู่ระหว่างพิจารณาปรับ timeout ให้ scale ตามความหนาแน่นของ promo แทนค่าคงที่" },
      ],
    },
    {
      slug: "feature-store-schema-migration-runbook",
      title: "Feature Store Schema Migration Runbook",
      tags: ["migration", "runbook"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อต้องเพิ่ม/เปลี่ยนชื่อ/ลบ field ใน feature vector ต้อง migrate schema ของ {{ref:module:feature-store}} ตามขั้นตอนนี้เสมอ ห้ามแก้ schema ตรงๆ โดยไม่ประกาศล่วงหน้า" },
        { heading: "ขั้นตอน", body: "1) list consumer ทั้งหมดของ field ที่จะเปลี่ยน 2) ถ้า rename ให้เพิ่ม field ใหม่คู่ขนานตาม {{ref:convention:feature-naming-convention}} ก่อน ไม่ลบของเก่าทันที 3) แจ้ง consumer ทุกทีมให้ย้ายไปใช้ field ใหม่ 4) ตั้งกำหนดเวลา deprecate field เก่าชัดเจนก่อนลบจริง" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = พยากรณ์ผิดทั้งระบบหรือทำให้เกิดการสั่งซื้อผิดพลาดมูลค่าสูง, Sev2 = กระทบบาง category/ภูมิภาค, Sev3 = กระทบเล็กน้อยไม่ถึงการตัดสินใจสั่งซื้อจริง" },
        { heading: "กรณีข้อมูล override หาย", body: "เหตุการณ์ที่ override ของ analyst หายหรือถูกเขียนทับ (เช่น {{ref:incident:backfill-overwrote-manual-overrides}}) ต้องยกระดับเป็น Sev1 เสมอเพราะกระทบความน่าเชื่อถือของระบบต่อผู้ใช้งานโดยตรง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "batch พยากรณ์ไม่เสร็จภายใน 4 ชั่วโมง, สัดส่วน SKU ที่ผลลัพธ์เป็น `partial` เกิน 10% ของ batch, WAPE รวมของ category ใดๆ เกิน 30% ติดต่อกัน 2 สัปดาห์" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายวันพอ ไม่ต้อง page คนตอนกลางดึกสำหรับปัญหาที่รอถึงเช้าได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้าโมเดลใหม่ทำให้ WAPE เฉลี่ยของ category ใดๆ แย่ลงเกิน 10 percentage point เทียบกับเวอร์ชันก่อนหน้าภายในสัปดาห์แรกหลัง deploy ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:promo-season-model-drift}}" },
        { heading: "ขั้นตอน", body: "rollback เวอร์ชันโมเดลก่อนหน้าผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีม category ที่ได้รับผลกระทบทุกครั้งแม้ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของแต่ละ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| demand-model-runner | 4 | 20 | queue depth > 50 shard |\n| feature-store | 2 | 10 | CPU > 70% |\n| anomaly-flagger | 1 | 6 | CPU > 60% (เร่งขึ้นไวกว่าเพราะต้องเกือบ real-time) |" },
        { heading: "ข้อจำกัดช่วงเทศกาล", body: "การ scale software service ช่วยได้แค่ระดับ compute throughput ไม่ได้แก้ปัญหาความแม่นยำที่ตกลงช่วง high-volatility window — ดู {{ref:policy:model-retrain-policy}} สำหรับข้อจำกัดด้าน model quality ที่ scaling แก้ไม่ได้ และ {{ref:deployment:holiday-capacity-planning-runbook}} สำหรับการเตรียมตัวล่วงหน้า" },
      ],
    },
    {
      slug: "holiday-capacity-planning-runbook",
      title: "Holiday Capacity Planning Runbook",
      tags: ["capacity", "runbook"],
      intro: "ขั้นตอนเตรียมความพร้อมของระบบก่อนเข้าสู่ high-volatility window ตามที่นิยามไว้ในภาพรวมสถาปัตยกรรม",
      sections: [
        { heading: "6 สัปดาห์ก่อนเทศกาล", body: "ทีม category ต้องลงทะเบียน promo window ทั้งหมดผ่าน {{ref:policy:promo-flag-policy}} ให้ครบก่อนช่วงนี้เริ่ม เพื่อให้ {{ref:module:seasonality-adjuster}} มีข้อมูลพร้อมปรับค่าล่วงหน้า" },
        { heading: "1 สัปดาห์ก่อนเทศกาล", body: "ตรวจสอบ capacity ของ {{ref:module:demand-model-runner}} ให้รองรับปริมาณ shard ที่หนาแน่นขึ้น พิจารณาเพิ่ม replica ล่วงหน้าแทนรอให้ autoscaling ตาม {{ref:deployment:scaling-policy}} ตามทัน เพราะช่วงพีคจริงมักมาเร็วกว่าที่ autoscaling ตอบสนองทัน" },
      ],
    },
  ],
};
