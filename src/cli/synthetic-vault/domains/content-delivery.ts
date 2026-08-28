import type { DomainProfile } from "../types.js";

// EdgeServe — ระบบกระจายเนื้อหา (CDN/content delivery)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const contentDelivery: DomainProfile = {
  id: "content-delivery",
  displayName: "EdgeServe — ระบบกระจายเนื้อหา (CDN)",
  summary: [
    "EdgeServe คือแพลตฟอร์ม CDN สำหรับบริษัทสื่อและ streaming ที่ต้องการกระจายเนื้อหาไปยัง edge node ทั่วโลก ระบบทำหน้าที่ตั้งแต่ดึงเนื้อหาจาก origin server ไปจนถึงจัดการ cache ที่ edge การกำหนดเส้นทาง geo-routing และการต่ออายุ SSL certificate โดยอัตโนมัติ",
    "ทีมวิศวกรรม EdgeServe ออกแบบให้ edge node แต่ละจุดสามารถทำงานได้กึ่งอิสระจาก control plane เพื่อให้ส่งเนื้อหาได้แม้ในช่วงที่ network ระหว่าง region มีปัญหา แต่นั่นก็หมายความว่า cache invalidation และ geo-rule update ต้องมีกลไก propagation ที่รัดกุม ไม่งั้น edge บางจุดจะเสิร์ฟเนื้อหาเก่าหรือตอบผิด geo-restriction",
  ],
  domainTags: ["content-delivery", "edgeserve"],
  serviceBoundaryNote: [
    "{{ref:module:cache-coordinator}} เป็นเจ้าของ metadata ของ cache entry ทั้งหมด (TTL, ETag, content hash) แต่ไม่เก็บ content จริง — content จริงอยู่ที่ edge node แต่ละจุดตาม region ที่ร้องขอ ทำให้ {{ref:module:cache-coordinator}} มีขนาดเล็กและ query เร็ว แต่ต้องคุย edge node เมื่อต้องการตรวจสอบ freshness จริง",
    "{{ref:module:geo-router}} เป็น service เดียวที่รู้จักทั้ง topology ของ edge network และ geo-restriction rule ของแต่ละ tenant — service อื่นไม่รู้ว่าจะ route traffic ไป edge node ไหน และไม่รู้ว่า content ชิ้นไหนถูกจำกัดประเทศอะไร การรวมสองความรู้นี้ไว้จุดเดียวทำให้ rule update มีจุดเดียวที่ต้องดูแล",
  ],
  apiGatewayNote: [
    "Request จาก client เข้ามาที่ anycast entry point แล้วถูก route ไปยัง PoP (Point of Presence) ที่ใกล้ที่สุดโดยอัตโนมัติ PoP แต่ละจุดตรวจสอบ cache ก่อน ถ้าเจอ (cache hit) จะตอบกลับทันทีโดยไม่ต้องคุย control plane เลย",
    "เฉพาะ cache miss และ cache revalidation เท่านั้นที่จะเรียกกลับมาหา {{ref:module:origin-puller}} ผ่าน control plane — นี่คือเหตุผลที่ cache hit rate เป็น metric สำคัญที่สุดของ EdgeServe ถ้า cache hit ต่ำ origin จะถูก flood ด้วย request จำนวนมาก ดู {{ref:policy:cache-ttl-policy}}",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:cache-coordinator}} ดูแล ได้แก่ `cache_entries` (metadata ของทุก content ที่ cache อยู่), `invalidation_jobs` (คิวและสถานะของ invalidation request), และ `tenant_config` (การตั้งค่า TTL, geo-restriction, และ bandwidth limit ของแต่ละ tenant)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `cache_entries` | cache-coordinator | อัปเดตทุกครั้งที่มี origin pull สำเร็จ |\n| `invalidation_jobs` | invalidation-dispatcher | เก็บสถานะ pending/propagating/done |\n| `geo_rules` | geo-router | บังคับ row-level security ต่อ tenant |\n| `cert_lifecycle` | certificate-manager | วันหมดอายุและสถานะการต่ออายุ |\n| `bandwidth_quotas` | bandwidth-throttler | quota รายเดือนและยอดใช้ปัจจุบัน |",
    "ทุกตารางมี `tenant_id` เป็น partition key เพื่อให้ query ของ tenant หนึ่งไม่กระทบ tenant อื่น และเป็นจุดเดียวที่บังคับ isolation ทางข้อมูลระหว่าง tenant",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `cache.invalidation_requested`, `cache.invalidation_propagated`, `origin.pull_failed`, `cert.renewal_due`, `cert.renewal_succeeded` — {{ref:module:invalidation-dispatcher}} เป็นทั้งผู้ publish และ subscribe event ที่เกี่ยวกับ invalidation เพื่อ track ว่า edge node แต่ละจุด acknowledge แล้วหรือยัง",
    "{{ref:module:certificate-manager}} subscribe `cert.renewal_due` ที่ตัวเองสร้างขึ้นแบบ scheduled เพื่อ trigger กระบวนการต่ออายุ ACME — ออกแบบแบบนี้เพื่อให้กระบวนการ renewal retryable ด้วยตัวเอง ถ้า renewal ล้มเหลวในรอบแรก event จะถูก requeue ตาม {{ref:policy:certificate-renewal-policy}} จนกว่าจะสำเร็จหรือเกิน deadline",
  ],
  modules: [
    {
      slug: "cache-coordinator",
      name: "cache-coordinator",
      tags: ["cache", "module", "core"],
      description:
        "รับผิดชอบ metadata ของ cache entry ทั้งหมด ได้แก่ TTL ที่ใช้งาน, ETag, และ content hash ที่ใช้ตรวจสอบ freshness แยกออกมาจาก origin-puller เพราะ logic การตัดสินใจว่า \"ควร cache อยู่อีกนานแค่ไหน\" ซับซ้อนขึ้นเรื่อยๆ ตาม content type และ policy ของ tenant แต่ละราย จนปนกับ logic การดึงเนื้อหาแล้วทดสอบยาก",
      functions: [
        { sig: "lookupEntry(tenantId: string, contentKey: string): Promise<CacheEntry | null>", desc: "ตรวจสอบว่ามี cache entry สำหรับ content key นี้และยัง fresh อยู่หรือไม่" },
        { sig: "recordPull(tenantId: string, contentKey: string, meta: ContentMeta): Promise<CacheEntry>", desc: "บันทึก metadata หลังจาก origin pull สำเร็จ คืน entry ที่จะใช้สร้าง response header" },
        { sig: "markStale(tenantId: string, contentKey: string): Promise<void>", desc: "บังคับให้ entry เป็น stale ทันทีเพื่อให้ request ถัดไป revalidate จาก origin" },
        { sig: "computeEffectiveTtl(tenantId: string, contentType: string): number", desc: "คำนวณ TTL จริงจาก tenant config และ content-type rule ตาม {{ref:policy:cache-ttl-policy}}" },
      ],
      stateFlow: "fresh → stale (TTL หมด หรือถูก invalidate) → revalidating → fresh | expired — ดู {{ref:policy:cache-ttl-policy}} สำหรับเงื่อนไขการเปลี่ยน state",
      relatedNotes:
        "ไม่เก็บ content จริงเลย — content จริงอยู่ที่ edge node แต่ละ PoP {{ref:module:invalidation-dispatcher}} เรียก `markStale` เมื่อ tenant ส่ง invalidation request เข้ามา ส่วน {{ref:module:origin-puller}} เรียก `recordPull` เมื่อดึงเนื้อหาใหม่ได้สำเร็จ",
      internals: {
        constants: [
          { name: "DEFAULT_TTL_SECONDS", value: "3600" },
          { name: "MAX_TTL_SECONDS", value: "86400" },
          { name: "STALE_REVALIDATE_WINDOW_SECONDS", value: "300" },
        ],
        typeSnippet:
          "interface CacheEntry {\n  tenantId: string;\n  contentKey: string;\n  etag: string;\n  contentHash: string;\n  expiresAt: Date;\n  status: \"fresh\" | \"stale\" | \"revalidating\" | \"expired\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:cache-ttl-policy}}",
      },
    },
    {
      slug: "origin-puller",
      name: "origin-puller",
      tags: ["origin", "module", "core"],
      description:
        "ดึงเนื้อหาจาก origin server ของ tenant เมื่อ cache miss หรือเมื่อ cache coordinator ส่งสัญญาณว่าต้อง revalidate เป็น service ที่อยู่บน critical path ของผู้ใช้โดยตรง เพราะถ้า origin puller ช้าหรือล้มเหลว ผู้ใช้ก็รอนาน ออกแบบให้มี retry และ circuit breaker เพื่อป้องกัน origin ถูก flood ระหว่าง cache miss storm",
      functions: [
        { sig: "pull(tenantId: string, originUrl: string, contentKey: string): Promise<PullResult>", desc: "ดึงเนื้อหาจาก origin พร้อม HTTP header ที่จำเป็น คืนผลและ metadata สำหรับ cache coordinator" },
        { sig: "validateOriginResponse(response: OriginResponse): ValidationResult", desc: "ตรวจสอบว่า origin response มี header ที่ถูกต้องและ content ไม่เสียหาย" },
        { sig: "handleOriginFailure(tenantId: string, originUrl: string, error: OriginError): Promise<FallbackResult>", desc: "เลือก fallback strategy เมื่อ origin ตอบ 5xx ตาม {{ref:policy:origin-retry-policy}}" },
      ],
      stateFlow: "idle → pulling → succeeded | failed_retryable | failed_permanent — ดู {{ref:policy:origin-retry-policy}} สำหรับเงื่อนไข retry และ circuit break",
      relatedNotes:
        "หลังดึงสำเร็จจะแจ้ง {{ref:module:cache-coordinator}} ผ่าน `recordPull` เสมอ และถ้า origin ล้มเหลวเกินเกณฑ์จะเปิด circuit breaker ผ่าน {{ref:module:bandwidth-throttler}} เพื่อไม่ให้ edge node อื่น pile-up request ไปที่ origin เดียวกัน",
    },
    {
      slug: "invalidation-dispatcher",
      name: "invalidation-dispatcher",
      tags: ["invalidation", "module", "core"],
      description:
        "รับ invalidation request จาก tenant และ propagate ไปยัง edge node ทุกจุดที่มี cache ของ content นั้น ความท้าทายหลักคือต้องยืนยันว่า edge node ทุกตัว acknowledge การ invalidation ก่อนถือว่าเสร็จสมบูรณ์ เพราะถ้า edge บางจุด miss ก็จะยังคง serve เนื้อหาเก่าต่อไป แยกออกมาเป็น service ต่างหากเพราะ propagation logic ซับซ้อนและต้องการ retry/acknowledgment ที่ไม่ปะปนกับ logic cache lookup",
      functions: [
        { sig: "dispatchInvalidation(tenantId: string, pattern: string): Promise<InvalidationJob>", desc: "สร้าง invalidation job และส่งไปยัง edge node ทุกจุด คืน job ID สำหรับ tracking" },
        { sig: "checkPropagationStatus(jobId: string): Promise<PropagationStatus>", desc: "ตรวจสอบว่า edge node แต่ละจุด acknowledge แล้วหรือยัง" },
        { sig: "retryFailedNodes(jobId: string): Promise<void>", desc: "ส่ง invalidation ซ้ำให้ edge node ที่ยังไม่ acknowledge ตาม {{ref:policy:invalidation-propagation-policy}}" },
        { sig: "cancelInvalidation(jobId: string, reason: string): Promise<void>", desc: "ยกเลิก invalidation job ที่ stuck โดยต้องมีผู้ดูแลระบบสั่ง" },
      ],
      stateFlow: "queued → propagating → partial_acknowledged → fully_acknowledged | timed_out — ดู {{ref:policy:invalidation-propagation-policy}} สำหรับเกณฑ์ timeout",
      relatedNotes:
        "เรียก `markStale` ใน {{ref:module:cache-coordinator}} สำหรับ content key ที่ match pattern ก่อนส่งไป edge node เพื่อให้ request ที่เข้ามาระหว่าง propagation ยัง revalidate จาก origin แทนที่จะเสิร์ฟเนื้อหาเก่า ดู {{ref:incident:stale-cache-after-invalidation-race}} สำหรับเคสที่เกิดขึ้นจริงเมื่อขาดขั้นตอนนี้",
      internals: {
        constants: [
          { name: "PROPAGATION_TIMEOUT_SECONDS", value: "30" },
          { name: "MAX_PROPAGATION_RETRY_ATTEMPTS", value: "3" },
          { name: "ACKNOWLEDGMENT_POLL_INTERVAL_MS", value: "2000" },
        ],
        typeSnippet:
          "interface InvalidationJob {\n  jobId: string;\n  tenantId: string;\n  pattern: string;\n  status: \"queued\" | \"propagating\" | \"partial_acknowledged\" | \"fully_acknowledged\" | \"timed_out\";\n  acknowledgedNodes: string[];\n  totalNodes: number;\n  createdAt: Date;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง timeout และ retry ที่ {{ref:policy:invalidation-propagation-policy}}",
      },
    },
    {
      slug: "geo-router",
      name: "geo-router",
      tags: ["geo", "routing", "module"],
      description:
        "ตัดสินใจว่าจะส่ง request จาก client ไปยัง edge node จุดไหน โดยพิจารณาทั้งความใกล้-ไกลทางภูมิศาสตร์, load ของ PoP แต่ละจุด, และ geo-restriction rule ที่ tenant กำหนดไว้ เป็น service เดียวที่รู้จัก topology ของ edge network ทั้งหมด ทำให้เป็นจุดเดียวที่ต้องอัปเดตเมื่อเพิ่มหรือถอด PoP ออกจากเครือข่าย",
      functions: [
        { sig: "resolveEdgeNode(clientIp: string, tenantId: string, contentKey: string): Promise<EdgeNode>", desc: "เลือก PoP ที่เหมาะสมที่สุดสำหรับ request นี้ตาม latency, load, และ geo-rule" },
        { sig: "isContentRestricted(tenantId: string, contentKey: string, clientCountry: string): boolean", desc: "ตรวจสอบว่า content ชิ้นนี้ถูกจำกัดสำหรับประเทศที่ client อยู่หรือไม่" },
        { sig: "updateGeoRules(tenantId: string, rules: GeoRule[]): Promise<void>", desc: "อัปเดต geo-restriction rule ของ tenant พร้อม propagate ไปยัง edge node ที่เกี่ยวข้อง" },
        { sig: "listAvailableNodes(region: string): Promise<EdgeNode[]>", desc: "คืนรายการ edge node ที่ online ในภูมิภาคที่ระบุ พร้อม capacity และ latency ปัจจุบัน" },
      ],
      relatedNotes:
        "ถ้า client อยู่ในประเทศที่ถูกจำกัด `resolveEdgeNode` จะไม่คืน edge node ให้เลยและ request จะถูกปฏิเสธทันทีก่อนถึงขั้น cache lookup ดู {{ref:policy:geo-restriction-policy}} สำหรับรายละเอียด และดู {{ref:incident:geo-restriction-bypass-edge-misconfiguration}} สำหรับกรณีที่เคยเกิดปัญหา",
    },
    {
      slug: "certificate-manager",
      name: "certificate-manager",
      tags: ["ssl", "certificate", "module"],
      description:
        "จัดการ lifecycle ของ SSL/TLS certificate ทั้งหมดที่ EdgeServe ใช้สำหรับ edge node แต่ละ domain ของ tenant รับผิดชอบตั้งแต่การออก certificate ใหม่ผ่าน ACME protocol, การต่ออายุอัตโนมัติก่อนหมดอายุ, ไปจนถึงการ deploy certificate ใหม่ไปยัง edge node ทุกจุด การต่ออายุต้องเสร็จก่อนหมดอายุอย่างน้อย `CERT_RENEWAL_LEAD_TIME_DAYS` วัน",
      functions: [
        { sig: "checkExpiryStatus(tenantId: string, domain: string): Promise<CertStatus>", desc: "ตรวจสอบวันหมดอายุของ certificate และคืนสถานะว่าต้อง renew เร็วแค่ไหน" },
        { sig: "initiateRenewal(tenantId: string, domain: string): Promise<RenewalJob>", desc: "เริ่มกระบวนการต่ออายุ certificate ผ่าน ACME คืน job ID สำหรับ tracking" },
        { sig: "deployNewCert(domain: string, cert: CertBundle): Promise<DeploymentResult>", desc: "ติดตั้ง certificate ใหม่ไปยัง edge node ทุกจุดพร้อมกัน ตรวจสอบว่าทุกจุดได้รับแล้ว" },
        { sig: "revokeCompromisedCert(domain: string, reason: string): Promise<void>", desc: "เพิกถอน certificate ที่ถูก compromise ทันทีและเร่ง renew ใหม่ทุก priority" },
      ],
      stateFlow: "valid → renewal_pending (เมื่อเหลือ n วัน) → renewing → deploying → valid | renewal_failed — ดู {{ref:policy:certificate-renewal-policy}} สำหรับเงื่อนไขแต่ละ transition",
      relatedNotes:
        "หลัง deploy สำเร็จจะ publish event `cert.renewal_succeeded` ให้ service อื่น subscribe — ถ้า deploy ล้มเหลวซ้ำๆ จะ escalate ผ่าน {{ref:deployment:monitoring-alerts}} ดู {{ref:incident:certificate-renewal-silent-failure}} สำหรับกรณีที่ escalation ไม่ทำงานและ certificate หมดอายุจริง",
      internals: {
        constants: [
          { name: "CERT_RENEWAL_LEAD_TIME_DAYS", value: "30" },
          { name: "CERT_CRITICAL_THRESHOLD_DAYS", value: "7" },
          { name: "ACME_CHALLENGE_TIMEOUT_SECONDS", value: "120" },
        ],
        typeSnippet:
          "interface CertStatus {\n  domain: string;\n  tenantId: string;\n  expiresAt: Date;\n  daysRemaining: number;\n  renewalStatus: \"not_needed\" | \"renewal_pending\" | \"renewing\" | \"renewal_failed\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง lead time และ escalation ที่ {{ref:policy:certificate-renewal-policy}}",
      },
    },
    {
      slug: "bandwidth-throttler",
      name: "bandwidth-throttler",
      tags: ["bandwidth", "throttle", "module"],
      description:
        "ควบคุม bandwidth ที่แต่ละ tenant ใช้ได้ตาม quota ที่ตกลงไว้ในสัญญา และทำ adaptive bitrate configuration สำหรับ video streaming ในช่วง traffic spike เพื่อรักษา availability ให้ผู้ชมทั้งหมดแทนที่จะเสิร์ฟ quality สูงให้คนบางส่วนแต่คนที่เหลือเจอ buffering แยกออกมาเป็น service ต่างหากเพราะ bandwidth accounting ต้องแม่นยำมาก เกี่ยวกับการเรียกเก็บเงินโดยตรง",
      functions: [
        { sig: "checkQuota(tenantId: string): Promise<QuotaStatus>", desc: "ตรวจสอบ quota ที่เหลือและ rate ปัจจุบันของ tenant" },
        { sig: "applyThrottle(tenantId: string, limitMbps: number): Promise<void>", desc: "ตั้ง bandwidth limit สำหรับ tenant ทันที ผลมีผลใน edge node ทุกจุดภายในไม่เกิน 30 วินาที" },
        { sig: "adjustBitrateProfile(tenantId: string, condition: NetworkCondition): Promise<BitrateProfile>", desc: "คำนวณ adaptive bitrate profile ที่เหมาะกับสถานการณ์เครือข่ายปัจจุบัน ตาม {{ref:policy:bandwidth-throttle-policy}}" },
        { sig: "recordUsage(tenantId: string, bytes: number, edgeNodeId: string): Promise<void>", desc: "บันทึกปริมาณ bandwidth ที่ใช้จริงสำหรับการคำนวณ quota และ billing" },
      ],
      relatedNotes:
        "ถ้า tenant ใช้ bandwidth เกิน quota 90% จะแจ้งเตือนทีม account management ก่อน ไม่ throttle ทันที — throttle อัตโนมัติจะเกิดขึ้นที่ 100% เท่านั้น เพื่อไม่ให้ผู้ใช้ปลายทางเจอปัญหาโดยไม่มีการแจ้งเตือน ดู {{ref:policy:bandwidth-throttle-policy}} และดู {{ref:incident:bandwidth-throttle-wrong-tenant}} สำหรับกรณีที่ throttle ถูก tenant ผิด",
    },
  ],
  envVarGroups: [
    {
      service: "cache-coordinator-service",
      vars: [
        { name: "CACHE_DEFAULT_TTL_SECONDS", example: "3600", note: "ดู {{ref:policy:cache-ttl-policy}} สำหรับ TTL ตาม content type" },
        { name: "CACHE_STALE_REVALIDATE_WINDOW_SECONDS", example: "300", note: "ระยะเวลา stale-while-revalidate ที่ยอมให้เสิร์ฟเนื้อหาเก่าขณะ revalidate" },
        { name: "CACHE_DB_URL", example: "postgres://cache-db.internal:5432/edgeserve", note: "secret ห้าม log" },
      ],
    },
    {
      service: "origin-puller-service",
      vars: [
        { name: "ORIGIN_PULL_TIMEOUT_MS", example: "5000", note: "เวลาสูงสุดที่รอ origin ตอบสนอง" },
        { name: "ORIGIN_MAX_RETRY", example: "3", note: "ดู {{ref:policy:origin-retry-policy}}" },
        { name: "ORIGIN_CIRCUIT_BREAKER_THRESHOLD", example: "5", note: "จำนวนความล้มเหลวก่อนเปิด circuit breaker" },
      ],
    },
    {
      service: "invalidation-dispatcher-service",
      vars: [
        { name: "INVALIDATION_PROPAGATION_TIMEOUT_SECONDS", example: "30", note: "ดู {{ref:policy:invalidation-propagation-policy}}" },
        { name: "INVALIDATION_MAX_RETRY", example: "3", note: "จำนวนครั้ง retry สำหรับ edge node ที่ไม่ตอบสนอง" },
      ],
    },
    {
      service: "certificate-manager-service",
      vars: [
        { name: "CERT_RENEWAL_LEAD_TIME_DAYS", example: "30", note: "ดู {{ref:policy:certificate-renewal-policy}}" },
        { name: "CERT_CRITICAL_THRESHOLD_DAYS", example: "7", note: "เมื่อเหลือน้อยกว่านี้จะ alert ด่วนทันที" },
        { name: "ACME_DIRECTORY_URL", example: "https://acme.internal/directory", note: "URL ของ ACME CA ที่ใช้" },
      ],
    },
  ],
  policies: [
    {
      slug: "cache-ttl-policy",
      title: "นโยบาย Cache TTL ตาม Content Type",
      tags: ["cache", "ttl", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:cache-coordinator}} ใช้ TTL ที่แตกต่างกันตาม content type เพื่อสมดุลระหว่าง freshness ของเนื้อหาและ cache hit rate — เนื้อหาที่เปลี่ยนน้อย เช่น video ที่ publish แล้ว ได้รับ TTL ยาว ส่วนเนื้อหาที่เปลี่ยนบ่อย เช่น playlist หรือ index page ได้รับ TTL สั้น",
        "Tenant สามารถกำหนด TTL ของตัวเองได้ในกรอบ `MIN_TTL_SECONDS` ถึง `MAX_TTL_SECONDS` แต่ไม่สามารถตั้งต่ำกว่าหรือสูงกว่าขอบเขตนั้นได้ เพื่อป้องกันทั้ง origin overload (TTL ต่ำเกินไป) และ stale content นานเกินไป (TTL สูงเกินไป)",
      ],
      sections: [
        {
          heading: "TTL เริ่มต้นตาม content type",
          body: "| Content Type | Default TTL | เหตุผล |\n|---|---|---|\n| video (mp4/ts) | 24h | เปลี่ยนน้อยมากหลัง publish |\n| audio (mp3/aac) | 12h | เช่นเดียวกับ video |\n| image | 6h | อาจมีการอัปเดต thumbnail |\n| manifest/playlist (m3u8) | 30s | เปลี่ยนทุกครั้งที่มี segment ใหม่ |\n| html/api response | 5m | เนื้อหาเว็บเปลี่ยนบ่อยกว่า media |",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Cache TTL: Live Streaming Content",
        tags: ["cache", "ttl", "live-stream", "edge-case"],
        body: [
          "สำหรับ live streaming ที่ใช้ HLS หรือ DASH protocol ไฟล์ manifest และ segment ต้องได้รับ TTL พิเศษที่สั้นกว่าปกติมาก — manifest อยู่ที่ 2 วินาที และ segment อยู่ที่ 3-4 วินาทีหรือตามความยาว segment จริง ซึ่งสั้นกว่า default 30 วินาทีมาก เพื่อให้ผู้ชมได้รับ segment ล่าสุดเกือบ real-time",
          "ถ้า tenant เปิดใช้งาน live mode แต่ไม่ได้แจ้ง EdgeServe ล่วงหน้า content จะถูก cache ด้วย TTL ปกติ ทำให้ผู้ชมติดอยู่กับ manifest เก่าและเห็น stream หยุดนิ่ง — ดู {{ref:incident:bandwidth-spike-adaptive-bitrate-fail}} สำหรับกรณีที่เกิดขึ้นจริง ต้อง flag stream เป็น `live: true` ใน tenant config ก่อนใช้งาน",
        ],
      },
    },
    {
      slug: "origin-retry-policy",
      title: "นโยบาย Retry เมื่อ Origin Server ตอบ 5xx",
      tags: ["origin", "retry", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:origin-puller}} ได้รับ 5xx จาก origin server จะ retry ตาม exponential backoff สูงสุด `ORIGIN_MAX_RETRY` ครั้ง ก่อนถือว่า origin ล้มเหลวและ escalate ไปยัง fallback strategy ที่กำหนด",
        "ความแตกต่างสำคัญ: 503 Service Unavailable retry ได้ปกติ แต่ 500 Internal Server Error ต้อง retry น้อยกว่าเพราะมักเป็นปัญหาถาวรที่การ retry ไม่ช่วยให้ดีขึ้น การ retry 5xx ซ้ำๆ โดยไม่มีขีดจำกัดจะกลายเป็น thundering herd บน origin ที่กำลังมีปัญหาอยู่แล้ว",
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Origin Retry: Stale Cache Fallback",
        tags: ["origin", "retry", "stale-fallback", "edge-case"],
        body: [
          "ถ้า origin ล้มเหลวทุก retry แล้ว แต่ยังมี cache entry เดิมอยู่แม้จะ stale แล้ว EdgeServe จะเสิร์ฟเนื้อหา stale นั้นต่อพร้อม response header `X-EdgeServe-Stale: true` แทนที่จะ return 503 ให้ผู้ใช้ เพราะเนื้อหาเก่าดีกว่าไม่มีเนื้อหาเลยสำหรับ video และ media content ส่วนใหญ่",
          "ข้อยกเว้นของข้อยกเว้น: content ที่ tenant ตั้ง `stale_fallback_allowed: false` ใน config จะไม่ใช้ stale cache ไม่ว่ากรณีใด เหมาะสำหรับ content ที่ถ้าเสิร์ฟข้อมูลเก่าแล้วผิดหลักกฎหมาย เช่น เนื้อหาที่มี licensing ที่หมดอายุแล้วต้องหยุดให้บริการทันที",
        ],
      },
    },
    {
      slug: "invalidation-propagation-policy",
      title: "นโยบาย Propagation Timeout ของ Cache Invalidation",
      tags: ["invalidation", "propagation", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ tenant ส่ง invalidation request เข้ามา {{ref:module:invalidation-dispatcher}} ต้องส่ง signal ไปยัง edge node ทุกจุดและรอ acknowledgment — ถ้า edge node ใดไม่ตอบสนองภายใน `PROPAGATION_TIMEOUT_SECONDS` จะ retry ตาม {{ref:policy:origin-retry-policy}} สูงสุด `MAX_PROPAGATION_RETRY_ATTEMPTS` รอบ",
        "ถ้าหมด retry แล้ว edge node นั้นยังไม่ acknowledge invalidation job จะถูก mark เป็น `timed_out` และ escalate ให้ทีม on-call ตรวจสอบ edge node นั้นด้วยมือ ไม่ถือว่า invalidation สำเร็จ 100% เพราะ edge นั้นอาจยังเสิร์ฟเนื้อหาเก่า",
      ],
      sections: [
        {
          heading: "Thundering herd บน invalidation queue",
          body: "ถ้า tenant ส่ง invalidation สำหรับ wildcard pattern ที่ match content จำนวนมากพร้อมกัน (เช่น `*` หรือ `/videos/*`) invalidation dispatcher จะ batch ส่งไปที่ละ edge node ไม่เกิน 1,000 รายการต่อรอบ เพื่อไม่ให้ edge node ถูก flood จาก invalidation แทนที่จะเป็น request ของผู้ใช้จริง ดู {{ref:incident:invalidation-queue-thundering-herd}} สำหรับกรณีที่เกิดขึ้นจริง",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Invalidation ฉุกเฉิน (Emergency Purge)",
        tags: ["invalidation", "emergency", "edge-case"],
        body: [
          "สำหรับกรณีฉุกเฉินที่ content ต้องถูกถอดออกทันที เช่น เนื้อหาที่ละเมิดกฎหมายหรือ content ที่ถูก DMCA takedown แจ้ง — tenant สามารถ flag invalidation เป็น `priority: emergency` ซึ่งจะ bypass queue ปกติและส่งตรงไปยัง edge node ทุกจุดพร้อมกันทันที ไม่รอ batch",
          "Emergency invalidation ไม่มี `PROPAGATION_TIMEOUT_SECONDS` เหมือน invalidation ปกติ — จะ retry จนสำเร็จหรือจนกว่า edge node นั้นจะถูก drain ออกจาก pool ชั่วคราว ข้อมูลจะถูก log ทุกขั้นตอนเพื่อรองรับการตรวจสอบทางกฎหมายในภายหลัง",
        ],
      },
    },
    {
      slug: "geo-restriction-policy",
      title: "นโยบายการบังคับ Geo-Restriction",
      tags: ["geo", "restriction", "policy"],
      isPrimary: true,
      intro: [
        "Tenant ที่มีสัญญา licensing แบบจำกัดประเทศสามารถตั้ง geo-restriction rule ผ่าน {{ref:module:geo-router}} เพื่อบล็อก request จากประเทศที่ไม่ได้รับอนุญาต — rule จะถูก enforce ก่อน cache lookup ทุกครั้ง เพราะถ้า enforce หลัง cache lookup อาจเกิดกรณีที่ edge node ต่าง region ทำการดึง content และ cache ไว้ในจุดที่ไม่ควรมี",
        "การตรวจสอบประเทศใช้ IP geolocation database ที่อัปเดตรายสัปดาห์ — accuracy ประมาณ 95-98% ซึ่ง tenant ต้องยอมรับว่าไม่สมบูรณ์ 100% ถ้าต้องการ accuracy สูงกว่านั้นต้องผสมกับ VPN detection ซึ่งเป็น add-on ราคาสูงกว่า",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Geo-Restriction และ CDN Edge Node ในประเทศที่ถูกบล็อก",
        tags: ["geo", "restriction", "edge-node", "edge-case"],
        body: [
          "EdgeServe มี edge node ตั้งอยู่ในบางประเทศที่ tenant บางรายอาจตั้ง geo-restriction ไว้ด้วย — นี่ไม่ได้หมายความว่า request จะผ่านได้เพราะ edge node อยู่ \"ในประเทศนั้น\" ระบบ enforce rule ตาม IP ต้นทางของ client ไม่ใช่ IP ของ edge node ที่รับ request",
          "แต่มีข้อยกเว้นเดียว: request จาก edge node ด้วยกันเอง (เช่น edge-to-edge replication) จะถูก whitelist อัตโนมัติเพื่อให้ geo-restriction rule ไม่บล็อก content replication ที่ต้องการ ดู {{ref:incident:geo-restriction-bypass-edge-misconfiguration}} สำหรับกรณีที่ whitelist นี้กว้างเกินไปจนทำให้ bypass ได้",
        ],
      },
    },
    {
      slug: "certificate-renewal-policy",
      title: "นโยบาย Certificate Renewal Lead Time",
      tags: ["ssl", "certificate", "renewal", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:certificate-manager}} ต้องเริ่มกระบวนการต่ออายุ certificate ก่อนหมดอายุอย่างน้อย `CERT_RENEWAL_LEAD_TIME_DAYS` วัน (ค่าเริ่มต้น 30 วัน) เพื่อให้มีเวลา retry กรณี ACME challenge ล้มเหลว หรือกรณีที่ต้องแก้ DNS record ด้วยมือก่อน",
        "เมื่อเหลือน้อยกว่า `CERT_CRITICAL_THRESHOLD_DAYS` วัน (ค่าเริ่มต้น 7 วัน) และยังไม่มี certificate ใหม่ที่ valid จะ trigger alert ด่วนไปยังทีม on-call ทันที ไม่รอ digest รายชั่วโมง เพราะหาก certificate หมดอายุจะทำให้ edge node ทั้งหมดของ domain นั้นใช้งานไม่ได้ทันที",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Certificate ที่ออกโดย CA ภายนอกและไม่รองรับ Auto-Renewal",
        tags: ["ssl", "certificate", "manual-renewal", "edge-case"],
        body: [
          "Tenant บางรายมี certificate ที่ออกโดย CA ของตัวเองหรือ CA ที่ไม่รองรับ ACME protocol — กรณีนี้ tenant ต้องอัปโหลด certificate ใหม่ผ่าน portal ด้วยมือ และ certificate-manager จะแจ้งเตือนล่วงหน้าตาม `CERT_RENEWAL_LEAD_TIME_DAYS` เหมือนกัน แต่จะไม่เริ่ม renewal process อัตโนมัติ",
          "หาก tenant ไม่ดำเนินการภายในกำหนด certificate-manager จะยกระดับ alert ทุก 24 ชั่วโมงและสุดท้ายจะแจ้งทีม account management ให้ติดต่อ tenant โดยตรง — ห้ามต่ออายุแทน tenant โดยไม่ได้รับการยืนยันเป็นลายลักษณ์อักษรเพราะ certificate เกี่ยวข้องกับ identity ของ tenant",
        ],
      },
    },
    {
      slug: "bandwidth-throttle-policy",
      title: "นโยบาย Bandwidth Throttle Threshold",
      tags: ["bandwidth", "throttle", "policy"],
      isPrimary: true,
      intro: [
        "Tenant แต่ละรายมี monthly bandwidth quota ตามแผนที่สมัครไว้ — {{ref:module:bandwidth-throttler}} tracking การใช้งานแบบ real-time และจะแจ้งเตือนที่ 90% ของ quota ก่อน throttle จริงที่ 100% เพื่อให้ tenant มีเวลา upgrade plan หรือปรับ traffic pattern ก่อนผู้ใช้ปลายทางได้รับผลกระทบ",
        "Throttle ไม่ได้หมายความว่า block traffic ทั้งหมด — throttle ลด bandwidth limit ลงเหลือ 20% ของ normal capacity เพื่อให้บริการยังทำงานได้แต่ช้าลงมาก ซึ่งดีกว่าตัดการเชื่อมต่อทันทีและทำให้ผู้ใช้ปลายทาง error ทุกคนพร้อมกัน",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Traffic Spike จาก Viral Content",
        tags: ["bandwidth", "throttle", "viral", "edge-case"],
        body: [
          "ถ้า tenant ใช้ bandwidth พุ่งขึ้นเร็วผิดปกติภายในเวลาสั้น (ตรวจจับจาก rate-of-change แทนที่จะเป็น absolute value) และ pattern ตรงกับ viral content spread — เช่น request จำนวนมากจาก IP หลากหลาย ไม่ใช่จาก IP เดิมซ้ำๆ — bandwidth-throttler จะ flag เป็น `viral_suspect` และไม่ throttle ทันที",
          "แทนที่จะ throttle จะรอ grace period 15 นาทีและแจ้ง account management ก่อน ถ้าการใช้งานยังสูงต่อเนื่องหลัง grace period จะ throttle ตามปกติ — logic นี้มีเพื่อไม่ให้ throttle tenant ที่มี viral content โดยไม่ตั้งใจ ซึ่งเป็นกรณีที่ดีสำหรับธุรกิจ ไม่ใช่ abuse",
        ],
      },
    },
    {
      slug: "edge-failover-policy",
      title: "นโยบาย Edge Node Failover",
      tags: ["edge", "failover", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อ edge node หนึ่งจุดออฟไลน์หรือตอบสนองช้าเกินเกณฑ์ {{ref:module:geo-router}} จะ reroute traffic ไปยัง PoP อื่นในภูมิภาคเดียวกันโดยอัตโนมัติ ถ้าไม่มี PoP อื่นในภูมิภาค จะข้ามไปใช้ PoP ที่ใกล้ที่สุดแม้จะอยู่ต่าง region",
        "Failover ตัดสินใจตาม health check ที่รัน ทุก 10 วินาที — edge node ที่ไม่ตอบ health check 3 ครั้งติดต่อกันจะถูกถอดออกจาก routing pool ชั่วคราว และจะถูกคืนเมื่อตอบสนองปกติ 5 ครั้งติดต่อกัน",
      ],
    },
    {
      slug: "cache-warming-policy",
      title: "นโยบาย Cache Warming สำหรับ Content ที่คาดว่าจะมี Traffic สูง",
      tags: ["cache", "warming", "policy"],
      isPrimary: false,
      intro: [
        "Tenant ที่รู้ล่วงหน้าว่าจะมี traffic spike เช่น รายการถ่ายทอดสด หรือ content ที่โฆษณาไว้แล้ว สามารถ request cache warming ล่วงหน้าได้อย่างน้อย 1 ชั่วโมงก่อน event เพื่อให้ EdgeServe ดึงเนื้อหามาเก็บไว้ที่ edge node ล่วงหน้า",
        "Cache warming ดึงเนื้อหาจาก origin นอก critical path — ไม่มี user รอ ทำให้ origin ไม่ถูก flood ในเวลาเดียวกับที่ traffic ผู้ใช้เพิ่มขึ้น ดู {{ref:incident:origin-overload-cache-miss-storm}} สำหรับกรณีที่ไม่มีการ warm cache ล่วงหน้า",
      ],
    },
    {
      slug: "tenant-isolation-policy",
      title: "นโยบาย Tenant Isolation",
      tags: ["tenant", "isolation", "policy"],
      isPrimary: false,
      intro: [
        "Cache key ของทุก tenant ถูก namespace ด้วย `tenant_id` เพื่อป้องกัน cache pollution ข้าม tenant แม้ content URL จะเหมือนกัน — tenant A และ tenant B ที่มี origin URL เดียวกันยังคงมี cache entry แยกกันอย่างสมบูรณ์",
        "Bandwidth quota, rate limit, geo-restriction rule, และ certificate ของแต่ละ tenant เป็น resource ที่แยกกันอย่างสิ้นเชิง ไม่มีการ share ข้าม tenant ในรูปแบบใดๆ ทั้งในเชิง data และ capacity — ดู {{ref:incident:bandwidth-throttle-wrong-tenant}} สำหรับกรณีที่ isolation มีข้อผิดพลาด",
      ],
    },
    {
      slug: "ssl-downgrade-prevention-policy",
      title: "นโยบายป้องกัน SSL/TLS Downgrade",
      tags: ["ssl", "security", "policy"],
      isPrimary: false,
      intro: [
        "Edge node ทุกจุดของ EdgeServe ปฏิเสธ TLS เวอร์ชันต่ำกว่า 1.2 โดยเด็ดขาด และ default เป็น TLS 1.3 สำหรับ client ที่รองรับ — ไม่อนุญาตให้ tenant ลด minimum TLS version ต่ำกว่า 1.2 แม้จะร้องขอก็ตาม เพราะ TLS 1.0 และ 1.1 มีช่องโหว่ที่ทราบกันดีและ PCI DSS ห้ามใช้แล้ว",
        "HSTS header ถูก inject อัตโนมัติสำหรับทุก response ที่ผ่าน HTTPS เพื่อป้องกัน downgrade attack — tenant ที่ต้องการ max-age ที่ยาวกว่า default (1 ปี) สามารถตั้งค่าได้ แต่ไม่สามารถตั้งให้สั้นกว่า 1 ชั่วโมง",
      ],
    },
    {
      slug: "rate-limit-policy",
      title: "นโยบาย Rate Limiting สำหรับ API Control Plane",
      tags: ["rate-limit", "api", "policy"],
      isPrimary: false,
      intro: [
        "API control plane ของ EdgeServe (สำหรับ tenant ตั้งค่า invalidation, geo-rule, certificate) มี rate limit แยกจาก data plane ของ content delivery — tenant แต่ละรายได้ API quota 1,000 request ต่อนาที สำหรับ invalidation request และ 100 request ต่อนาทีสำหรับ config update",
        "Invalidation ที่ใช้ wildcard pattern กว้าง (เช่น `*`) นับเป็น 10 request แทนที่จะเป็น 1 request เพราะผลกระทบต่อ cache ใหญ่กว่า invalidation เฉพาะ URL — การออกแบบแบบนี้ทำให้ tenant ใช้ invalidation อย่างตั้งใจและไม่ invalidate แบบไม่จำเป็น",
      ],
    },
  ],
  incidents: [
    {
      slug: "stale-cache-after-invalidation-race",
      title: "Cache เก่าถูกเสิร์ฟหลัง Invalidation เพราะ Race Condition",
      tags: ["cache", "invalidation", "race-condition"],
      summary:
        "Tenant รายหนึ่งรายงานว่าผู้ใช้บางส่วนยังเห็นเนื้อหาเก่า 10 นาทีหลังจาก invalidation API ตอบ 200 สำเร็จ — ทั้งที่ invalidation น่าจะเสร็จสมบูรณ์แล้ว",
      investigation:
        "ตรวจ log ของ {{ref:module:invalidation-dispatcher}} พบว่า invalidation job ถูก mark เป็น `fully_acknowledged` ก่อนที่จะเรียก `markStale` ใน {{ref:module:cache-coordinator}} — ทำให้มี window เวลาสั้นๆ ที่ edge node ถือว่า invalidation เสร็จแล้ว แต่ cache coordinator ยังไม่รู้",
      cause:
        "การ update สถานะ job และการ call `markStale` ไม่ได้ทำแบบ atomic — มีช่วงเวลาระหว่างสองขั้นตอนที่ request ใหม่เข้ามาและเจอ cache entry ที่ยังไม่ถูก mark stale แต่ edge node อ้างว่า invalidate แล้ว",
      resolution:
        "แก้ให้เรียก `markStale` ก่อนเสมอ แล้วค่อย update job status หลัง — reverse ลำดับและ wrap เป็น transaction เดียว deploy เป็น hotfix ภายใน 2 ชั่วโมง",
      followup:
        "เพิ่ม integration test สำหรับ sequence ของ invalidation ที่มีทั้ง cache coordinator และ edge node เพื่อตรวจจับ race condition ในอนาคต",
    },
    {
      slug: "origin-overload-cache-miss-storm",
      title: "Origin Server โอเวอร์โหลดจาก Cache Miss Storm",
      tags: ["origin", "cache", "overload"],
      summary:
        "ช่วง launch ของรายการ streaming ใหม่ origin server ของ tenant ล่มภายใน 5 นาทีหลังเปิดให้บริการ ทำให้ผู้ใช้หลายหมื่นคนเจอ error พร้อมกัน",
      investigation:
        "ตรวจ metric ของ {{ref:module:origin-puller}} พบว่า request ไป origin พุ่งจาก 50 rps เป็น 12,000 rps ภายใน 30 วินาที ทั้งที่ edge node ทั้งหมดน่าจะ cache เนื้อหาเดียวกัน",
      cause:
        "Tenant ไม่ได้ request cache warming ล่วงหน้าตาม {{ref:policy:cache-warming-policy}} เมื่อ request แรกๆ เข้ามาจาก edge node หลายร้อยจุดพร้อมกัน ทุกจุด miss cache และยิง origin พร้อมกัน — thundering herd classic",
      resolution:
        "วิศวกร on-call เปิด circuit breaker ที่ {{ref:module:origin-puller}} ด้วยมือเพื่อ queue request แทนที่จะส่งต่อทั้งหมด แล้วทำ cache warming ด้วยมือสำหรับ content หลัก origin กลับมาปกติภายใน 20 นาที",
      followup:
        "เพิ่ม automatic cache warming สำหรับ content ที่ tenant สร้างใหม่ใน 1 ชั่วโมงก่อนเวลา publish ที่ตั้งไว้ เพื่อลด dependency กับ tenant ต้องจำทำเอง",
    },
    {
      slug: "geo-restriction-bypass-edge-misconfiguration",
      title: "Geo-Restriction ถูก Bypass ผ่าน Edge Node ในประเทศที่ถูกบล็อก",
      tags: ["geo", "restriction", "bypass", "security"],
      summary:
        "Tenant รายงานว่า content ที่จำกัดสำหรับบางประเทศถูก access ได้โดยผู้ใช้ในประเทศนั้น ซึ่งเป็นการละเมิดสัญญา licensing อย่างร้ายแรง",
      investigation:
        "ตรวจ access log พบว่า request มาจาก IP ของ edge node ที่ตั้งอยู่ในประเทศที่ถูกบล็อก — edge node นั้นถูก whitelist โดยอัตโนมัติเพราะ logic คิดว่าเป็น edge-to-edge request แต่ที่จริงเป็น request จาก user ปลายทางที่ route ผ่าน proxy ภายในประเทศนั้น",
      cause:
        "Whitelist logic ใน {{ref:module:geo-router}} ตรวจสอบแค่ว่า source IP อยู่ใน edge node pool หรือไม่ ไม่ได้ตรวจสอบ request header เพิ่มเติมเพื่อยืนยันว่าเป็น internal edge-to-edge request จริง — ทำให้ proxy ที่ใช้ edge IP ผ่านไปได้",
      resolution:
        "เพิ่ม mutual TLS authentication สำหรับ edge-to-edge request แทนการใช้ IP whitelist เพียงอย่างเดียว และตั้ง geo-restriction ให้ enforce ที่ทุก hop ไม่ใช่แค่ hop แรก",
      followup:
        "ตรวจสอบ tenant ที่ได้รับผลกระทบและรายงานไปยัง content licensing team ตาม SLA และเพิ่ม security test สำหรับ geo-bypass ใน pen-test checklist",
    },
    {
      slug: "certificate-renewal-silent-failure",
      title: "Certificate Auto-Renewal ล้มเหลวโดยไม่มีการแจ้งเตือน",
      tags: ["ssl", "certificate", "renewal", "alert"],
      summary:
        "Certificate ของ tenant รายหนึ่งหมดอายุโดยไม่มีการแจ้งเตือนล่วงหน้า ทำให้ edge node ทั้งหมดของ domain นั้นให้บริการไม่ได้นานกว่า 2 ชั่วโมง",
      investigation:
        "ตรวจสอบ {{ref:module:certificate-manager}} พบว่า ACME renewal job ถูก schedule แต่ไม่เคย run — scheduled event ไม่ถูกประมวลผลเพราะ message queue ของ `cert.renewal_due` มี consumer group ที่ตาย (consumer died without committing offset)",
      cause:
        "Consumer ของ renewal event crash ระหว่าง maintenance window เมื่อ 3 สัปดาห์ก่อนและไม่ถูก restart อัตโนมัติ เนื่องจาก health check ของ consumer นั้นไม่ครอบคลุม message lag metric",
      resolution:
        "Restart consumer และ force-renew certificate ของ tenant ที่ได้รับผลกระทบด้วยมือ ทำงานเสร็จภายใน 30 นาที แต่ certificate ใหม่ต้องใช้เวลา propagate ไปทุก edge node อีก 15 นาที",
      followup:
        "เพิ่ม alert สำหรับ message lag ของ renewal queue ที่เกิน 1 ชั่วโมง และเพิ่ม dead-letter queue เพื่อให้รู้ว่ามี renewal event ที่ไม่ถูก process",
    },
    {
      slug: "invalidation-queue-thundering-herd",
      title: "Invalidation Queue ถูก flood จาก Wildcard Pattern ขนาดใหญ่",
      tags: ["invalidation", "thundering-herd", "queue"],
      summary:
        "Tenant ส่ง invalidation request สำหรับ pattern `*` เพื่อ clear cache ทั้งหมดหลัง migration — ส่งผลให้ invalidation queue ล้นและ edge node ทั้งหมดถูก flood ด้วย invalidation signal พร้อมกัน ทำให้ latency ของ cache lookup เพิ่มขึ้นสำหรับ tenant อื่นๆ ด้วย",
      investigation:
        "ตรวจ {{ref:module:invalidation-dispatcher}} พบว่า wildcard pattern match content กว่า 2 ล้านรายการ dispatcher พยายามส่งทั้งหมดพร้อมกันโดยไม่มีการ throttle ทำให้ edge node เสียเวลา process invalidation แทนที่จะเป็น user request",
      cause:
        "ขณะเกิดเหตุยังไม่มี batch size limit สำหรับ wildcard invalidation — wildcard ถูก expand เป็น individual invalidation แล้วส่งทั้งหมดในรอบเดียว การ batch ตาม {{ref:policy:invalidation-propagation-policy}} ยังไม่ถูก implement",
      resolution:
        "วิศวกร on-call pause invalidation job ของ tenant นั้นด้วยมือแล้ว drain queue ส่วนที่ค้าง จากนั้น rethrottle ให้ส่งไปที่ละ 100 รายการต่อวินาทีแทน",
      followup:
        "Implement batch size limit สำหรับ wildcard invalidation ตาม {{ref:policy:invalidation-propagation-policy}} และเพิ่ม warning ใน UI เมื่อ tenant พยายามส่ง wildcard ที่จะ match เกิน 10,000 รายการ",
    },
    {
      slug: "bandwidth-throttle-wrong-tenant",
      title: "Bandwidth Throttle ถูก Apply กับ Tenant ผิดราย",
      tags: ["bandwidth", "throttle", "tenant-isolation", "bug"],
      summary:
        "Tenant A รายงานว่า service ช้าลงอย่างผิดปกติโดยไม่มีเหตุผล ตรวจสอบพบว่า bandwidth throttle ของ Tenant B ถูก apply กับ Tenant A แทน",
      investigation:
        "ตรวจ {{ref:module:bandwidth-throttler}} พบว่ามี bug ใน `applyThrottle` ที่ใช้ `tenantId` ผิดตัวเมื่อ request หลาย tenant มาพร้อมกันในช่วงเวลาไล่เลี่ยกัน — มีการปนกันของ context ระหว่าง concurrent request",
      cause:
        "Shared mutable variable สำหรับ current tenantId ใน request handler ไม่ได้ใช้ per-request scope — เมื่อ request ของ tenant B เข้ามาขณะกำลัง process tenant A อยู่ tenantId ถูก overwrite",
      resolution:
        "ลบ throttle ที่ apply ผิดออกจาก Tenant A ทันที แล้ว patch โดยเปลี่ยนให้ tenantId เป็น parameter ที่ pass ผ่าน call stack แทนการใช้ shared state",
      followup:
        "ทบทวน handler อื่นๆ ใน {{ref:module:bandwidth-throttler}} และ {{ref:module:cache-coordinator}} ว่ามี shared mutable state pattern เดียวกันหรือไม่ และเพิ่ม test สำหรับ concurrent multi-tenant request",
    },
    {
      slug: "origin-puller-dns-timeout",
      title: "Origin Puller Timeout เพราะ DNS ของ Origin ใช้เวลานาน",
      tags: ["origin", "dns", "timeout"],
      summary:
        "Tenant รายหนึ่งมี origin pull ล้มเหลวเป็นระยะๆ ไม่ต่อเนื่อง โดยไม่มีรูปแบบชัดเจนว่าเกิดช่วงไหน error message บอกว่า connection timeout",
      investigation:
        "เพิ่ม DNS lookup time เข้าไปใน metric ของ {{ref:module:origin-puller}} พบว่า DNS resolution สำหรับ origin domain ของ tenant นี้ใช้เวลาเฉลี่ย 800ms ซึ่งเกือบครบ `ORIGIN_PULL_TIMEOUT_MS` ที่ตั้งไว้ 1,000ms แล้ว เมื่อรวมกับ network latency ทำให้เกิน",
      cause:
        "Origin domain ของ tenant ใช้ DNS provider ที่มี TTL สั้นมาก (60 วินาที) ทำให้ edge node ต้อง resolve DNS ใหม่บ่อยมาก และ DNS server ของ provider นั้นมีความหน่วงสูงเมื่อ load มาก",
      resolution:
        "เพิ่ม DNS result caching ใน origin-puller เองสำหรับ domain ที่ pull บ่อย โดย override TTL ให้สั้นที่สุดอยู่ที่ 5 นาทีเพื่อลด latency โดยไม่เสี่ยง serve IP เก่าหากมีการ migrate",
      followup:
        "แจ้ง tenant ให้เพิ่ม DNS TTL ของ origin เป็นอย่างน้อย 5 นาที และ document ข้อแนะนำ DNS configuration ใน onboarding guide สำหรับ tenant ใหม่",
    },
    {
      slug: "edge-node-offline-mass-502",
      title: "Edge Node ใน Region หนึ่งออฟไลน์กระทบ Traffic ทั้ง Region",
      tags: ["edge-node", "failover", "availability"],
      summary:
        "ผู้ใช้ใน Asia-Pacific region ได้รับ 502 Bad Gateway นานกว่า 15 นาที ทั้งที่ service ของ EdgeServe ยังทำงานปกติใน region อื่น",
      investigation:
        "ตรวจ health check ของ edge node ใน AP region พบว่า 3 ใน 5 PoP ใน region ออฟไลน์พร้อมกัน {{ref:module:geo-router}} ตรวจจับได้ แต่ failover ไปยัง region อื่นช้ากว่าที่ควรเพราะ health check threshold ตั้งไว้ 3 consecutive failure ซึ่งใช้เวลา 30 วินาที",
      cause:
        "Network maintenance ของ upstream provider ใน region ทำให้ PoP หลายจุดออฟไลน์พร้อมกันชั่วคราว — ระบบ failover ทำงานถูกต้องแต่ threshold ออกแบบมาสำหรับ single node failure ไม่ใช่ mass failure ในระดับ region",
      resolution:
        "ลด health check failure threshold จาก 3 เป็น 2 เพื่อให้ failover เร็วขึ้นในสถานการณ์ mass failure และเพิ่ม circuit breaker ระดับ region เพิ่มเติม",
      followup:
        "เพิ่ม runbook สำหรับ manual regional failover ใน {{ref:deployment:incident-response-runbook}} และตรวจสอบ SLA กับ upstream provider เรื่อง maintenance notification",
    },
    {
      slug: "cache-coordinator-split-brain",
      title: "Cache Coordinator เกิด Split-Brain ระหว่าง Database Failover",
      tags: ["cache", "coordinator", "split-brain", "database"],
      summary:
        "ระหว่าง primary database failover ของ {{ref:module:cache-coordinator}} พบว่า cache metadata ไม่สอดคล้องกันระหว่าง edge node บางจุด — บางจุดเห็น content เป็น fresh บางจุดเห็นเป็น stale สำหรับ content เดียวกัน",
      investigation:
        "ตรวจ database transaction log พบว่ามีช่วงเวลาสั้นๆ ระหว่าง failover ที่ write request บางส่วนถูกส่งไปทั้ง primary เก่าและ primary ใหม่พร้อมกัน ทำให้ state ของ cache entry แตกต่างกัน",
      cause:
        "Connection pool ไม่ได้ close connection ไปยัง primary เก่าทันทีหลัง failover — บาง request ยังใช้ connection เก่าและ write ไปที่ database ที่ไม่ใช่ primary อีกต่อไป",
      resolution:
        "Flush connection pool ทั้งหมดและ reconnect ใหม่หลัง failover แล้ว scan cache entry ที่ inconsistent และ force-expire ทั้งหมดเพื่อให้ revalidate จาก origin",
      followup:
        "เพิ่ม fencing mechanism ที่ reject write ไปยัง database ที่ไม่ใช่ primary อีกต่อไป และเพิ่ม chaos engineering test สำหรับ database failover scenario",
    },
    {
      slug: "cert-expiry-serving-old-cert",
      title: "Edge Node บาง PoP ยังเสิร์ฟ Certificate เก่าหลัง Renewal สำเร็จ",
      tags: ["ssl", "certificate", "deployment", "edge-node"],
      summary:
        "หลัง certificate renewal สำเร็จ และ {{ref:module:certificate-manager}} รายงาน deploy สมบูรณ์ ผู้ใช้บางกลุ่มยังได้รับ certificate เก่าที่หมดอายุแล้วจาก PoP บางจุด",
      investigation:
        "ตรวจสอบ `deployNewCert` พบว่า acknowledgment ที่รับมาจาก PoP บางจุดเป็น false positive — PoP ตอบ acknowledge แต่ยังไม่ได้ reload certificate จริง เพราะ reload กับ acknowledge ใช้ process คนละตัวและอาจเกิด lag ระหว่างกัน",
      cause:
        "Certificate reload เป็น async operation แต่ acknowledgment ส่งกลับมาก่อนที่ reload จะเสร็จ — ทำให้ certificate-manager คิดว่า deploy เสร็จแล้วทั้งที่ certficate ใหม่ยังไม่ถูก serve จริง",
      resolution:
        "แก้ให้ acknowledgment ส่งกลับมาหลัง certificate reload เสร็จและ verify ได้ด้วย TLS handshake จริง และ force-probe PoP ทุกจุดหลัง deploy เพื่อยืนยันว่าเสิร์ฟ certificate ใหม่จริง",
      followup:
        "เพิ่ม post-deploy verification step ที่ทำ TLS handshake จริงกับ edge node ทุกจุดและ verify fingerprint ของ certificate ที่ได้รับ ก่อน mark deployment ว่าสำเร็จ",
    },
    {
      slug: "invalidation-partial-propagation",
      title: "Invalidation Propagate ไม่ครบ Edge Node ทำให้บาง PoP ยังเสิร์ฟ Content เก่า",
      tags: ["invalidation", "propagation", "edge-node"],
      summary:
        "หลัง tenant ทำการ update เนื้อหาและส่ง invalidation request ที่ตอบ 200 สำเร็จ ผู้ใช้ใน Southeast Asia ยังคงเห็นเนื้อหาเก่าอยู่นานกว่า 1 ชั่วโมง",
      investigation:
        "ตรวจสอบ `checkPropagationStatus` ของ job นั้นพบว่า 2 ใน 18 edge node ไม่ได้ถูกรวมอยู่ใน propagation list — ทั้งสอง node เพิ่งถูกเพิ่มเข้าใน pool เมื่อ 48 ชั่วโมงก่อน",
      cause:
        "Cache ของ edge node list ใน {{ref:module:invalidation-dispatcher}} มี TTL 1 ชั่วโมง ทำให้ node ใหม่ที่เพิ่งเข้า pool ไม่ถูกรวมทันทีในการ propagation ในระหว่างที่ cache ยังเก่าอยู่",
      resolution:
        "Force refresh edge node list cache ทันทีและ re-propagate invalidation ไปยัง 2 node ที่พลาด พร้อมตั้งค่า cache invalidation สำหรับ edge node list ทุกครั้งที่มี node เพิ่ม",
      followup:
        "เปลี่ยนให้ edge node list refresh ทันทีเมื่อมีการเพิ่มหรือถอด node แทนการรอ cache expire และเพิ่ม monitoring สำหรับ node ใหม่ที่เข้า pool ว่าถูกรวมใน invalidation หรือไม่",
    },
    {
      slug: "geo-router-misconfiguration-latency",
      title: "Geo-Router Route Traffic ไป PoP ที่ไกลกว่าเพราะ Topology Config เก่า",
      tags: ["geo", "routing", "latency", "configuration"],
      summary:
        "ผู้ใช้ในประเทศหนึ่ง report ว่า latency สูงขึ้นผิดปกติหลังจาก EdgeServe เพิ่ม PoP ใหม่ในภูมิภาคนั้น — ผิดตรงข้ามกับที่คาด",
      investigation:
        "ตรวจสอบ routing decision ของ {{ref:module:geo-router}} พบว่า PoP ใหม่ที่ใกล้กว่าไม่ถูกเลือก เพราะไม่ปรากฏใน topology config ที่ใช้ตัดสินใจ — ทั้งที่ health check รายงานว่า online อยู่แล้ว",
      cause:
        "Topology config และ health check pool เป็นข้อมูลคนละชุดที่ sync กันไม่สมบูรณ์ — node เพิ่มเข้า health check pool แล้ว แต่ยังไม่ได้ update topology config ด้วยข้อมูล latency ที่ถูกต้อง",
      resolution:
        "อัปเดต topology config ด้วยมือและ reload geo-router เพื่อให้ใช้ PoP ใหม่ที่ถูกต้อง latency กลับมาปกติภายใน 5 นาที",
      followup:
        "เชื่อม topology config update เข้ากับ process เพิ่ม node โดยอัตโนมัติ และเพิ่ม test ที่ตรวจสอบว่า node ใหม่ถูก route มาจาก region ที่เหมาะสมก่อน go-live",
    },
    {
      slug: "bandwidth-spike-adaptive-bitrate-fail",
      title: "Adaptive Bitrate ปรับไม่ทันทำให้ Live Stream Buffering ช่วง Peak",
      tags: ["bandwidth", "adaptive-bitrate", "live-stream"],
      summary:
        "ช่วง live event ขนาดใหญ่ ผู้ชมจำนวนมากเจอ buffering ต่อเนื่องแม้จะเชื่อมต่อจาก network ที่เร็ว — พบว่า adaptive bitrate เลือก quality สูงสุดและไม่ยอม drop ลงมาแม้ bandwidth ที่มีจะไม่เพียงพอ",
      investigation:
        "ตรวจ {{ref:module:bandwidth-throttler}} พบว่า `adjustBitrateProfile` ใช้ network condition ที่วัดจาก 5 นาทีก่อนหน้า ซึ่งล้าหลังมากในช่วง traffic spike ที่เพิ่มขึ้นเร็ว",
      cause:
        "Window ของการวัด network condition ถูกออกแบบสำหรับ gradual traffic change ไม่ใช่ spike ที่ผู้ชมเข้ามาพร้อมกันในวินาทีที่ live เริ่ม — bitrate profile ยังคิดว่าสถานการณ์ดีเหมือน 5 นาทีก่อน",
      resolution:
        "ปรับ window การวัด network condition ลงเหลือ 30 วินาทีเป็น hotfix และ force drop bitrate สำหรับ live stream ของ tenant นั้นชั่วคราวจนสถานการณ์เสถียร",
      followup:
        "ออกแบบ adaptive window ที่ลดลงอัตโนมัติเมื่อตรวจจับ rate-of-change สูงผิดปกติ เพื่อให้ responsive กว่าในสถานการณ์ spike ดู {{ref:policy:cache-ttl-policy}} สำหรับ live stream TTL ที่เกี่ยวข้อง",
    },
    {
      slug: "tenant-cache-pollution",
      title: "Cache Key Collision ระหว่าง Tenant สองรายที่ใช้ Origin URL เดียวกัน",
      tags: ["cache", "tenant-isolation", "cache-key"],
      summary:
        "Tenant B ได้รับเนื้อหาของ Tenant A จาก cache แทนที่จะเป็นเนื้อหาของตัวเอง เกิดขึ้นเฉพาะกับ content บาง URL ที่ทั้งสอง tenant ใช้ origin domain เดียวกัน",
      investigation:
        "ตรวจ cache key generation ใน {{ref:module:cache-coordinator}} พบว่า cache key ถูกสร้างจาก URL เพียงอย่างเดียวโดยไม่มี tenant namespace — ทำให้ tenant ที่ใช้ reseller origin URL เดียวกันมี cache key ชนกัน",
      cause:
        "Code path สำหรับ tenant ที่ใช้ shared origin (reseller plan) ไม่ได้ prepend `tenant_id` ใน cache key เพราะคาดว่า origin URL ต่างกันอยู่แล้ว แต่ใน reseller case มี URL เดียวกันจริงๆ",
      resolution:
        "Patch ให้ cache key รวม `tenant_id` เสมอโดยไม่มีข้อยกเว้น flush cache ที่อาจมี collision ทั้งหมดสำหรับ tenant ในแผน reseller",
      followup:
        "เพิ่ม property test สำหรับ cache key uniqueness ที่ verify ว่า tenant pair ใดๆ ไม่มีทาง generate cache key ชนกันได้ และอัปเดต {{ref:policy:tenant-isolation-policy}} ด้วยตัวอย่างกรณีนี้",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/EDGE-301-cert-renewal-alert`, `fix/EDGE-287-invalidation-race-condition`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(invalidation-dispatcher): กัน race condition ระหว่าง markStale และ job status update`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore`, `security` — `security` เป็น type พิเศษสำหรับแก้ช่องโหว่ที่ต้องผ่าน security review ก่อน merge เสมอ ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แตะ cache key generation ต้องมี tenant_id เสมอ (บทเรียนจาก {{ref:incident:tenant-cache-pollution}}) และการเปลี่ยน propagation logic ต้องมี integration test ครอบคลุม edge case ของ concurrent request ก่อน merge" },
        { heading: "Security checklist", body: "การเปลี่ยน geo-restriction หรือ whitelist logic ต้องผ่าน security review จากทีม security engineer ก่อน merge เสมอ — บทเรียนจาก {{ref:incident:geo-restriction-bypass-edge-misconfiguration}}" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `lookupEntry`, `dispatchInvalidation` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ของระบบ", body: "`tenantId` รูปแบบ `t-<UUID>`, `contentKey` รูปแบบ `<path>?<query>` normalized เสมอ ห้ามมี trailing slash หรือ query parameter ที่ไม่ได้เป็นส่วนของ content จริง เพราะจะทำให้ cache key ไม่ match" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ invalidation ต้องมี `jobId` เสมอ เพื่อไล่ log ข้าม service ได้ (invalidation-dispatcher → cache-coordinator → edge node acknowledgment) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "Certificate renewal failure ให้ log เป็น `error` เสมอแม้ยังอยู่ใน lead time — เพราะทีม on-call ต้อง grep เจอง่ายก่อนที่สถานการณ์จะวิกฤต บทเรียนจาก {{ref:incident:certificate-renewal-silent-failure}}" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`EDGE_<DOMAIN>_<REASON>` เช่น `EDGE_CACHE_MISS`, `EDGE_GEO_BLOCKED`, `EDGE_CERT_EXPIRED` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`EDGE_ORIGIN_TIMEOUT`, `EDGE_INVALIDATION_TIMEOUT`, `EDGE_BANDWIDTH_EXCEEDED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "integration"],
      sections: [
        { heading: "Integration test ที่บังคับ", body: "ฟังก์ชันที่แตะ propagation logic ต้องมี test จำลอง edge node offline บางส่วนระหว่าง propagation เสมอ เพื่อตรวจสอบว่า retry และ timeout ทำงานถูกต้อง — บทเรียนจาก {{ref:incident:invalidation-partial-propagation}}" },
        { heading: "Security test", body: "ทุก PR ที่แก้ geo-restriction logic ต้องรัน geo-bypass test suite ที่ครอบคลุม edge node whitelist scenario ด้วย ก่อน merge เสมอ" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error, meta }` โดย `meta` มีข้อมูล เช่น `requestId`, `tenantId`, `edgeNodeId` เพื่อ debug ได้ว่า request นี้ถูก serve โดย PoP ไหน `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, retryAfter? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ `retryAfter` ใส่เมื่อ error เป็นแบบ rate-limit หรือ quota exceeded เพื่อให้ client รู้ว่าควร retry เมื่อไหร่" },
      ],
    },
    {
      slug: "cache-key-convention",
      title: "Cache Key Convention",
      tags: ["cache", "convention"],
      intro: "Cache key ต้องสร้างอย่างสม่ำเสมอและ deterministic เพื่อให้ cache hit rate สูงสุดและป้องกัน cache pollution — เอกสารนี้กำหนด format และกฎที่ใช้",
      sections: [
        { heading: "รูปแบบ", body: "`{tenantId}/{normalized_path}?{sorted_query_string}` — `tenantId` ต้องอยู่เสมอโดยไม่มีข้อยกเว้น ดูบทเรียนจาก {{ref:incident:tenant-cache-pollution}} — path ต้อง normalize ด้วย lowercase และตัด trailing slash ออก — query parameter ต้อง sort alphabetically ก่อน join" },
        { heading: "Query parameter ที่ไม่นับใน cache key", body: "Parameter ที่ใช้เพื่อ analytics หรือ tracking เท่านั้น เช่น `utm_source`, `fbclid`, `gclid` ต้องถูกตัดออกก่อน generate cache key เพราะถ้าใส่เข้าไปจะทำให้ cache hit rate ลดลงมากโดยไม่จำเป็น — list ของ parameter ที่ตัดออกเป็น whitelist ที่ config ได้ต่อ tenant" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (รวม geo-bypass test suite) → deploy staging → smoke test บน edge node จริง → canary deploy (5% traffic) → full deploy — ไม่ deploy พร้อมกันทุก PoP ในครั้งเดียว" },
        { heading: "Gate พิเศษ", body: "{{ref:module:geo-router}} และ {{ref:module:certificate-manager}} ต้องผ่าน security review ก่อน merge เสมอ เพราะกระทบ geo-restriction enforcement และ certificate lifecycle โดยตรง" },
      ],
    },
    {
      slug: "edge-node-deployment-runbook",
      title: "Edge Node Deployment Runbook",
      tags: ["edge-node", "deployment", "runbook"],
      intro: "ขั้นตอนการเพิ่ม PoP ใหม่หรือ update software บน edge node ที่มีอยู่แล้ว — ต้องทำตามลำดับที่กำหนดเพื่อป้องกัน traffic disruption",
      sections: [
        { heading: "การเพิ่ม PoP ใหม่", body: "1) ลง software และ config บน node ใหม่ 2) อัปเดต topology config ใน {{ref:module:geo-router}} ทันที ไม่รอ cache expire (บทเรียนจาก {{ref:incident:invalidation-partial-propagation}}) 3) รัน health check probe ยืนยัน 4) เปิด traffic ค่อยๆ ผ่าน canary routing" },
        { heading: "การถอด PoP ออก", body: "1) Drain traffic ออกจาก node ก่อน ไม่ terminate ทันที 2) รอให้ connection ที่ค้างอยู่ปิดครบภายใน `DRAIN_TIMEOUT_SECONDS` 3) Remove จาก topology config 4) ยืนยันว่าไม่มี traffic เข้าอีกก่อน terminate" },
      ],
    },
    {
      slug: "certificate-rotation-runbook",
      title: "Certificate Rotation Runbook",
      tags: ["ssl", "certificate", "runbook"],
      intro: "ขั้นตอนสำหรับ rotate certificate ทั้งแบบ planned renewal ตาม schedule และแบบ emergency rotation กรณี certificate ถูก compromise — ดู {{ref:policy:certificate-renewal-policy}} สำหรับ policy ที่บังคับ",
      sections: [
        { heading: "Planned renewal", body: "กระบวนการ auto-renewal ผ่าน ACME ดำเนินการอัตโนมัติ ทีมต้องตรวจสอบว่า consumer ของ `cert.renewal_due` ทำงานปกติโดยดูจาก {{ref:deployment:monitoring-alerts}} หลัง {{ref:incident:certificate-renewal-silent-failure}} เพิ่ม alert สำหรับ consumer lag" },
        { heading: "Emergency rotation", body: "1) Revoke certificate ที่ถูก compromise ผ่าน `revokeCompromisedCert` 2) กระบวนการ renewal จะถูก trigger อัตโนมัติด้วย priority สูงสุด 3) Monitor propagation ทุก 5 นาที 4) ยืนยันด้วย TLS handshake จริงกับ edge node ทุกจุด" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = certificate expired, geo-restriction bypass, หรือ data leak ข้าม tenant — Sev2 = cache pollution, invalidation stuck กระทบ tenant หนึ่ง, edge region offline — Sev3 = latency สูงผิดปกติแต่ยัง serve ได้" },
        { heading: "กรณี security incident", body: "ทุกเหตุการณ์ที่เกี่ยวกับ {{ref:module:geo-router}} bypass หรือ tenant data leak ต้องยกระดับเป็น Sev1 เสมอและแจ้ง security team ทันที นอกจาก on-call ปกติ เพราะอาจมีผลทางกฎหมายหรือ licensing" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "Certificate expire ภายใน `CERT_CRITICAL_THRESHOLD_DAYS` วัน, invalidation job ค้างสถานะ `propagating` เกิน 2x `PROPAGATION_TIMEOUT_SECONDS`, consumer lag ของ `cert.renewal_due` เกิน 1 ชั่วโมง, bandwidth usage เกิน 90% ของ quota" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1 และ security incident แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมง — certificate alert ทุก severity ส่งหา on-call ทันทีเสมอ เพราะ time-sensitive มากและบทเรียนจาก {{ref:incident:certificate-renewal-silent-failure}}" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ cache hit rate ตกต่ำกว่า 80%, มี tenant isolation failure ใดๆ, หรือ geo-restriction enforcement ผิดพลาด ต้อง rollback ทันทีโดยไม่ต้องรอ approval" },
        { heading: "ขั้นตอน", body: "Deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ หลัง rollback ต้อง verify ว่า cache key ยังถูกต้อง และ geo-restriction enforcement ทำงานปกติ ก่อนถือว่า rollback สำเร็จ" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| cache-coordinator | 2 | 10 | CPU > 70% หรือ query latency > 50ms |\n| invalidation-dispatcher | 2 | 6 | queue depth > 500 |\n| geo-router | 3 | 12 | request rate > 10,000 rps (latency-sensitive มาก) |" },
        { heading: "Edge node capacity", body: "จำนวน PoP ต้อง plan ล่วงหน้าและ scale ไม่ได้ real-time เหมือน software service — ช่วง event ขนาดใหญ่ต้อง pre-provision edge capacity ล่วงหน้าและทำ cache warming ดู {{ref:policy:cache-warming-policy}} สำหรับรายละเอียด" },
      ],
    },
    {
      slug: "dns-traffic-management",
      title: "DNS & Traffic Management",
      tags: ["dns", "anycast", "traffic"],
      intro: "EdgeServe ใช้ anycast routing เพื่อให้ DNS ระดับบนสุด resolve ไปยัง IP ที่ route ไปยัง PoP ที่ใกล้ที่สุดโดยอัตโนมัติ เอกสารนี้อธิบาย architecture และขั้นตอนจัดการ DNS ในสถานการณ์ต่างๆ",
      sections: [
        { heading: "Anycast IP management", body: "Anycast IP pool ถูกจัดการโดย network team แยกจาก software service — เมื่อ PoP ใหม่เพิ่มเข้ามา network team ต้องประกาศ BGP route ก่อน จึงจะมี traffic จริงเข้ามา การ provision ซอฟต์แวร์และ BGP announcement ต้องเกิดขึ้นในลำดับที่ถูกต้องเสมอ" },
        { heading: "DNS TTL สำหรับ tenant custom domain", body: "Tenant ที่ใช้ custom domain (CNAME ไปยัง EdgeServe) ต้องตั้ง DNS TTL ของ CNAME ไม่ต่ำกว่า 5 นาที เพื่อป้องกัน DNS lookup storm เมื่อ traffic สูง — แนะนำให้ใช้ 5 นาทีถึง 1 ชั่วโมงตามความถี่ที่ tenant ต้องการ migrate origin" },
      ],
    },
  ],
};
