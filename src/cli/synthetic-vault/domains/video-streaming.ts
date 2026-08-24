import type { DomainProfile } from "../types.js";

// StreamForge — แพลตฟอร์ม transcode และ streaming วิดีโอสำหรับผู้ผลิตคอนเทนต์
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const videoStreaming: DomainProfile = {
  id: "video-streaming",
  displayName: "StreamForge — แพลตฟอร์ม Transcode และ Streaming วิดีโอ",
  summary: [
    "StreamForge คือแพลตฟอร์มรับวิดีโอต้นฉบับจากผู้ผลิตคอนเทนต์ (สื่อ, คอร์สออนไลน์, ผู้จัดงาน live event) แล้ว transcode เป็นหลาย rendition ตามความละเอียด/bitrate ที่ต่างกัน สร้าง adaptive bitrate playlist แบบ HLS/DASH และส่งออกผ่าน CDN พร้อมระบบ DRM สำหรับคอนเทนต์ที่ต้องป้องกันการคัดลอก ระบบแยกเส้นทาง VOD (วิดีโอที่อัปโหลดไว้ล่วงหน้า) กับ live event (สตรีมสด) ออกจากกันตั้งแต่ระดับ ingest เพราะข้อจำกัดด้าน latency ต่างกันมาก",
    "ทีมวิศวกรรมแยก service ตามภาระงาน — งาน transcode กิน CPU/GPU หนักและ scale ตามคิวงาน ส่วนงาน serve การเล่นวิดีโอต้องการ latency ต่ำและ scale ตามจำนวนผู้ชม สองอย่างนี้มี failure mode คนละแบบจึงแยก service เด็ดขาด ช่วงเวลาที่ทีมเรียกว่า primetime window (19:00-22:00) คือช่วงที่ทั้งการอัปโหลด VOD ใหม่และ live event ชนกันหนาแน่นที่สุด และเป็นช่วงที่ incident ส่วนใหญ่เกิด",
  ],
  domainTags: ["video-streaming", "streamforge"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:transcode-worker}} เป็นเจ้าของสถานะ transcode job ทั้งหมด (progress, rendition ที่เสร็จแล้ว, error) ส่วน {{ref:module:drm-license-server}} เป็นเจ้าของ license grant และไม่รู้จัก state ของ transcode job เลย",
      "{{ref:module:playlist-generator}} เป็น service เดียวที่ query ข้าม {{ref:module:transcode-worker}} (เพื่อรู้ว่า rendition ไหนพร้อมเสิร์ฟแล้ว) และ {{ref:module:bitrate-ladder-selector}} (เพื่อรู้ลำดับ rung ที่ถูกต้อง) พร้อมกัน — เหตุผลที่ยอมให้ทำ cross-domain query (ผิดหลักทั่วไป) คือ manifest ที่สร้างออกไปต้องสอดคล้องกับทั้งสถานะ encode จริงและลำดับ ladder ที่ถูกต้องพร้อมกันเสมอ ไม่งั้นผู้เล่นจะได้ manifest ที่ชี้ไปยัง segment ที่ยังไม่มีอยู่จริง",
  ],
  apiGatewayNote: [
    "คำขออัปโหลดวิดีโอและคำสั่งจัดการ asset จากผู้ผลิตคอนเทนต์เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งแปลงเป็น transcode job แล้วส่งต่อให้ {{ref:module:transcode-worker}} คำขอเช็คสถานะ job หรือดึง URL playlist ใช้ synchronous call ผ่าน gateway ตัวนี้เหมือนกัน",
    "segment ของ live event ไม่ผ่าน API gateway กลาง — ingest ผ่าน low-latency channel แยกต่างหาก (RTMP/SRT) ที่ {{ref:module:transcode-worker}} รับตรง เพราะ segment ของ live ส่งเข้ามาทุก 2 วินาทีต่อเนื่อง latency ของ gateway กลาง (เฉลี่ย 80-150ms ต่อ request) จะสะสมความหน่วงจนวิดีโอ live ล้าหลังผู้ชมเกินยอมรับได้",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:transcode-worker}} ดูแล ได้แก่ `transcode_jobs` (สถานะและ progress ของแต่ละงาน) และ `renditions` (rendition ที่ transcode เสร็จแล้วพร้อม path บน object storage)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `transcode_jobs` | transcode-worker | อัปเดต progress ทุก segment ที่เสร็จ |\n| `renditions` | transcode-worker | อ้างอิง path บน object storage เท่านั้น ไม่เก็บไฟล์จริง |\n| `playlists` | playlist-generator | manifest version ล่าสุดต่อ asset |\n| `license_grants` | drm-license-server | ประวัติการออก license ต่อ device/content |\n| `storage_usage` | (shared, อัปเดตผ่าน event) | ยอดใช้ storage สะสมต่อ publisher account ดู {{ref:policy:storage-quota-policy}} |",
    "ทุกตารางใช้ `assetId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันที่เทียบ `renditions` กับไฟล์จริงบน object storage",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `transcode.job.completed`, `transcode.job.failed`, `asset.uploaded`, `license.issued`, `cache.purge.requested` — {{ref:module:playlist-generator}} subscribe `transcode.job.completed` เพื่ออัปเดต manifest ทันทีที่มี rendition ใหม่พร้อมเสิร์ฟ โดยไม่ต้อง poll {{ref:module:transcode-worker}} เอง",
    "{{ref:module:cdn-origin-shield}} subscribe `cache.purge.requested` เพื่อล้าง cache เมื่อมีการอัปเดตคอนเทนต์หรือถูกสั่งถอดออก (takedown) — แยก event นี้ออกจาก `transcode.job.completed` เพราะการ purge cache ต้องเกิดแม้ transcode ไม่เกี่ยวข้องเลย เช่นกรณี takedown ตาม {{ref:policy:content-takedown-policy}}",
  ],
  modules: [
    {
      slug: "transcode-worker",
      name: "transcode-worker",
      tags: ["transcode", "module", "core"],
      description:
        "รับผิดชอบแปลงไฟล์วิดีโอต้นฉบับ (หรือ segment สดจาก live ingest) เป็นหลาย rendition ตาม bitrate ladder ที่กำหนด เป็น service ที่กิน compute หนักที่สุดในระบบ แยก worker pool ออกจาก service อื่นทั้งหมดเพื่อ scale อิสระตามคิวงานโดยไม่กระทบ latency ของฝั่ง playback",
      functions: [
        { sig: "transcodeSegment(jobId: string, sourceUrl: string, profile: EncodeProfile): Promise<TranscodeResult>", desc: "สั่ง transcode 1 segment/rendition คืนผลว่าสำเร็จหรือพลาดพร้อมเหตุผล" },
        { sig: "probeSource(sourceUrl: string): Promise<MediaProbe>", desc: "อ่าน metadata ต้นฉบับ (resolution, bitrate, codec, framerate) ก่อนเริ่ม transcode จริง" },
        { sig: "reportProgress(jobId: string, pct: number): Promise<void>", desc: "รายงานความคืบหน้ากลับเข้า `transcode_jobs` ทุก segment ที่เสร็จ" },
        { sig: "cancelJob(jobId: string, reason: string): Promise<void>", desc: "ยกเลิกงานที่กำลังทำอยู่ เช่นเมื่อ publisher ลบ asset ระหว่าง transcode" },
      ],
      stateFlow: "queued → probing → transcoding → muxing → completed | failed — ดู {{ref:policy:transcode-retry-policy}} สำหรับเงื่อนไขว่าเมื่อไหร่ retry เมื่อไหร่ escalate",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:drm-license-server}} โดยตรง — rendition ที่ต้องเข้ารหัส DRM จะถูก mux แบบไม่เข้ารหัสก่อน แล้วให้ {{ref:module:cdn-origin-shield}} เรียก drm-license-server แยกตอน serve จริง เพื่อไม่ให้ transcode-worker ต้องรู้จัก license policy เลย",
      internals: {
        constants: [
          { name: "MAX_CONCURRENT_SEGMENTS_PER_WORKER", value: "4" },
          { name: "TRANSCODE_STALL_TIMEOUT_MS", value: "120000" },
          { name: "DEFAULT_GOP_SIZE_FRAMES", value: "48" },
        ],
        typeSnippet:
          "interface TranscodeResult {\n  jobId: string;\n  status: \"succeeded\" | \"failed_soft\" | \"failed_hard\";\n  failReason?: \"source_corrupt\" | \"codec_unsupported\" | \"stall_timeout\";\n  attemptCount: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:transcode-retry-policy}}",
      },
    },
    {
      slug: "playlist-generator",
      name: "playlist-generator",
      tags: ["playlist", "module", "core"],
      description:
        "สร้างและอัปเดต adaptive bitrate manifest (HLS master/media playlist หรือ DASH MPD) จาก rendition ที่ {{ref:module:transcode-worker}} ทำเสร็จ เป็น service เดียวที่รู้จัก \"ลำดับ rung\" ที่ผู้เล่นจะสลับไปมา ไม่ใช่ transcode-worker หรือ CDN",
      functions: [
        { sig: "generateMasterPlaylist(assetId: string): Promise<string>", desc: "สร้าง master playlist ที่ลิสต์ทุก rendition พร้อม bandwidth attribute" },
        { sig: "generateMediaPlaylist(assetId: string, renditionId: string): Promise<string>", desc: "สร้าง media playlist ของ rendition เดียว ลิสต์ segment ทั้งหมด" },
        { sig: "appendSegment(assetId: string, renditionId: string, segment: SegmentRef): Promise<void>", desc: "เพิ่ม segment ใหม่เข้า live playlist window แล้วเลื่อน window ตาม `MAX_LIVE_WINDOW_SEGMENTS`" },
        { sig: "invalidatePlaylist(assetId: string): Promise<void>", desc: "บังคับสร้าง manifest ใหม่ทั้งชุด ใช้เมื่อ ladder เปลี่ยนหรือ rendition ถูกลบ" },
      ],
      stateFlow: "draft (ยังไม่มี rendition พร้อม) → live (กำลังรับ segment ต่อเนื่อง สำหรับ live event) หรือ published (VOD ครบทุก rendition แล้ว) → stale (rendition เปลี่ยนแต่ manifest ยังไม่ regenerate)",
      relatedNotes:
        "query ข้าม {{ref:module:transcode-worker}} และ {{ref:module:bitrate-ladder-selector}} พร้อมกันเป็นข้อยกเว้นที่ตั้งใจ (ดู {{ref:arch:boundaries}}) — ถ้า manifest ชี้ไปยัง rung ที่ ladder เปลี่ยนไปแล้วแต่ rendition ยังไม่ถูก re-transcode ผู้เล่นจะขอ segment ที่ไม่มีอยู่จริง",
      internals: {
        constants: [
          { name: "PLAYLIST_TARGET_DURATION_SEC", value: "6" },
          { name: "MAX_LIVE_WINDOW_SEGMENTS", value: "15" },
        ],
        typeSnippet:
          "interface MediaPlaylistEntry {\n  segmentUrl: string;\n  durationSec: number;\n  sequenceNumber: number;\n  discontinuity?: boolean;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง cache ของ manifest ที่ {{ref:policy:origin-shield-cache-policy}}",
      },
    },
    {
      slug: "cdn-origin-shield",
      name: "cdn-origin-shield",
      tags: ["cdn", "module", "caching"],
      description:
        "ทำหน้าที่เป็น layer กลางระหว่าง edge CDN กับ object storage/DRM ต้นทาง เพื่อลดจำนวน request ที่วิ่งไปถึงต้นทางจริงเมื่อวิดีโอเดียวกันถูกขอพร้อมกันจากหลาย edge node แยกออกมาเป็น service อิสระเพราะ cache strategy ของวิดีโอ (segment ขนาดใหญ่, TTL ยาว) ต่างจาก cache ทั่วไปมาก",
      functions: [
        { sig: "fetchFromOrigin(path: string): Promise<CachedResponse>", desc: "ดึง segment/manifest จากต้นทางจริงเมื่อ cache miss พร้อม coalesce request ซ้ำ" },
        { sig: "primeCache(assetId: string, renditions: string[]): Promise<void>", desc: "โหลด cache ล่วงหน้าสำหรับวิดีโอที่คาดว่าจะมีคนดูเยอะ เช่นก่อน live event เริ่ม" },
        { sig: "purgeCache(pattern: string): Promise<void>", desc: "ล้าง cache ตาม pattern ของ path เมื่อคอนเทนต์เปลี่ยนหรือถูกถอด" },
      ],
      relatedNotes:
        "เรียก {{ref:module:drm-license-server}} แทน {{ref:module:transcode-worker}} เมื่อ segment ที่ร้องขอต้องเข้ารหัส DRM — ตรรกะ cache key ต้องแยกตามสถานะการเข้ารหัสด้วย ไม่ใช่แค่ path เฉยๆ ดู {{ref:policy:origin-shield-cache-policy}}",
    },
    {
      slug: "drm-license-server",
      name: "drm-license-server",
      tags: ["drm", "module", "core"],
      description:
        "ออก license ให้ผู้เล่นวิดีโอที่ผ่านการยืนยันตัวตนแล้วสามารถถอดรหัสคอนเทนต์ที่ป้องกันด้วย DRM ได้ แยกออกมาเป็น service เดี่ยวเพราะข้อกำหนดด้าน compliance กับผู้ให้บริการ DRM ภายนอกต้องการ audit log แยกและสิทธิ์เข้าถึงจำกัดเฉพาะทีมที่ผ่านการอบรม",
      functions: [
        { sig: "issueLicense(deviceId: string, contentId: string, policy: LicensePolicy): Promise<LicenseResponse>", desc: "ออก license ใหม่หลังยืนยัน device certificate และตรวจสิทธิ์ตาม policy" },
        { sig: "revokeLicense(licenseId: string): Promise<void>", desc: "เพิกถอน license ก่อนหมดอายุ เช่นเมื่อ account ถูกระงับ" },
        { sig: "validateDeviceCertificate(deviceId: string): Promise<boolean>", desc: "ตรวจว่า certificate ของอุปกรณ์ยังไม่หมดอายุและไม่อยู่ใน revoke list" },
      ],
      stateFlow: "requested → certificate_validated → issued → active → expired | revoked",
      relatedNotes:
        "{{ref:module:cdn-origin-shield}} เป็นตัวเดียวที่เรียก `issueLicense` แทนผู้เล่นโดยตรง เพื่อรวมจุดตรวจสอบ concurrent stream cap ไว้ที่เดียว ดู {{ref:policy:drm-license-issuance-policy}}",
      internals: {
        constants: [
          { name: "LICENSE_TTL_SEC", value: "21600" },
          { name: "MAX_CONCURRENT_STREAMS_PER_ACCOUNT", value: "4" },
        ],
        typeSnippet:
          "interface LicenseResponse {\n  licenseId: string;\n  status: \"issued\" | \"denied\";\n  denyReason?: \"cert_invalid\" | \"concurrent_limit\" | \"content_restricted\";\n  expiresAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเงื่อนไขการออก license ที่ {{ref:policy:drm-license-issuance-policy}}",
      },
    },
    {
      slug: "thumbnail-extractor",
      name: "thumbnail-extractor",
      tags: ["thumbnail", "module"],
      description:
        "ดึงภาพนิ่งจากวิดีโอเพื่อทำ poster image และ sprite sheet สำหรับแถบ scrub บนผู้เล่น ทำงานเป็น background job แยกจาก critical path การ transcode เพื่อไม่ให้ thumbnail ที่ช้าไปถ่วงเวลาที่วิดีโอพร้อมเล่นได้จริง",
      functions: [
        { sig: "extractSprite(assetId: string, intervalSec: number): Promise<SpriteSheet>", desc: "ดึงภาพนิ่งทุก intervalSec วินาทีมาต่อเป็น sprite sheet เดียว" },
        { sig: "extractPoster(assetId: string, timestampSec: number): Promise<string>", desc: "ดึงภาพนิ่ง 1 เฟรมที่ timestamp ที่กำหนดเป็นภาพหน้าปก" },
        { sig: "regenerateThumbnails(assetId: string): Promise<void>", desc: "สั่งสร้าง thumbnail ใหม่ทั้งชุด เช่นเมื่อ publisher เปลี่ยน timestamp ภาพหน้าปกเอง" },
      ],
      relatedNotes:
        "รอ event `transcode.job.completed` จาก {{ref:module:transcode-worker}} ก่อนเริ่มทำงานเสมอ (ดู {{ref:arch:queue}}) เพื่อดึงภาพจาก rendition คุณภาพสูงสุดที่มี ไม่ใช่จากไฟล์ต้นฉบับตรงๆ ซึ่งอาจมี codec ที่ extractor ไม่รองรับ ดู {{ref:policy:thumbnail-extraction-timing-policy}}",
    },
    {
      slug: "bitrate-ladder-selector",
      name: "bitrate-ladder-selector",
      tags: ["ladder", "module"],
      description:
        "คำนวณว่าวิดีโอต้นฉบับหนึ่งไฟล์ควร transcode เป็นกี่ rendition และแต่ละ rendition ควรมี resolution/bitrate เท่าไหร่ (bitrate ladder) โดยอิงจาก resolution และ bitrate ของต้นฉบับเอง ไม่ transcode ขึ้นความละเอียดเกินต้นฉบับเด็ดขาด",
      functions: [
        { sig: "computeLadder(sourceProbe: MediaProbe): BitrateLadder", desc: "คำนวณ ladder เต็มชุดจาก metadata ต้นฉบับ" },
        { sig: "selectRenditionsForDevice(deviceClass: DeviceClass, ladder: BitrateLadder): Rendition[]", desc: "กรอง rendition ที่อุปกรณ์กลุ่มนั้นรองรับจริง เช่นตัด HEVC ออกถ้าอุปกรณ์ไม่รองรับ" },
        { sig: "validateLadderMonotonic(ladder: BitrateLadder): boolean", desc: "ตรวจว่าแต่ละ rung มี bitrate สูงขึ้นตาม resolution เสมอ ไม่มี rung ที่ resolution สูงกว่าแต่ bitrate ต่ำกว่า" },
      ],
      relatedNotes:
        "ผลลัพธ์จาก `computeLadder` ถูกส่งให้ {{ref:module:transcode-worker}} เป็น encode profile และถูก {{ref:module:playlist-generator}} ใช้กำหนดลำดับ rung ใน manifest พร้อมกัน ดู {{ref:policy:bitrate-ladder-selection-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "transcode-worker-service",
      vars: [
        { name: "TRANSCODE_MAX_CONCURRENT_SEGMENTS", example: "4", note: "ดู {{ref:module:transcode-worker}}" },
        { name: "TRANSCODE_STALL_TIMEOUT_MS", example: "120000", note: "ดู {{ref:policy:transcode-retry-policy}}" },
      ],
    },
    {
      service: "playlist-generator-service",
      vars: [
        { name: "PLAYLIST_TARGET_DURATION_SEC", example: "6", note: "" },
        { name: "PLAYLIST_LIVE_WINDOW_SEGMENTS", example: "15", note: "จำนวน segment สูงสุดใน live playlist window" },
      ],
    },
    {
      service: "drm-license-server-service",
      vars: [
        { name: "LICENSE_TTL_SEC", example: "21600", note: "ดู {{ref:policy:drm-license-issuance-policy}}" },
        { name: "LICENSE_MAX_CONCURRENT_STREAMS", example: "4", note: "ต่อ 1 account" },
        { name: "LICENSE_DB_URL", example: "postgres://drm-db.internal:5432/drm", note: "secret ห้าม log" },
      ],
    },
    {
      service: "cdn-origin-shield-service",
      vars: [
        { name: "ORIGIN_SHIELD_CACHE_TTL_SEC", example: "86400", note: "ดู {{ref:policy:origin-shield-cache-policy}}" },
        { name: "ORIGIN_SHIELD_STAMPEDE_LOCK_MS", example: "3000", note: "กัน cache stampede ดู {{ref:incident:origin-shield-cache-stampede}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "transcode-priority-policy",
      title: "นโยบายลำดับความสำคัญของคิว Transcode",
      tags: ["transcode", "priority", "policy"],
      isPrimary: true,
      intro: [
        "job transcode ของ live event มี priority สูงกว่า VOD backlog เสมอ — {{ref:module:transcode-worker}} จะดึง job จากคิว live ก่อนคิว VOD ทุกครั้งที่มี worker ว่าง เพราะ live event ล่าช้าแม้ไม่กี่วินาทีกระทบผู้ชมทันที ในขณะที่ VOD backlog ล่าช้าไม่กี่นาทีแทบไม่มีใครสังเกต",
        "ภายในคิว live เอง job จะเรียงตามเวลาที่ event เริ่มจริง ไม่ใช่เวลาที่ job เข้าคิว เพื่อให้ event ที่กำลังจะเริ่มได้ worker ก่อน event ที่ยังอยู่ในช่วงเตรียมการ",
      ],
      sections: [
        {
          heading: "ทำไมไม่ preempt job ที่กำลังทำอยู่",
          body: "ถ้า live job priority สูงกว่ามาถึงระหว่างที่ worker กำลัง transcode VOD job อยู่ ระบบจะไม่ preempt VOD job กลางคัน — ปล่อยให้ทำ segment ปัจจุบันจบก่อนแล้วค่อยสลับ เพราะการ preempt กลาง segment ทำให้ต้อง transcode segment นั้นใหม่ทั้งหมด เสียเวลามากกว่ารอให้จบสั้นๆ",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อ Live Event หลายรายการชนกันพร้อมกัน",
        tags: ["transcode", "priority", "edge-case"],
        body: [
          "เมื่อมี live event มากกว่าจำนวน worker ที่ scale ทันในเวลานั้น ระบบจะไม่แบ่ง worker เท่ากันทุก event — event ที่มีผู้ชมลงทะเบียนรอมากกว่าจะได้ worker ก่อน เพราะผลกระทบต่อผู้ชมรวมสูงกว่า แม้ event ที่ผู้ชมน้อยกว่าจะเข้าคิวก่อนก็ตาม",
          "event ที่ถูกลดจำนวน worker ลงจะ fallback ไปใช้ bitrate ladder ที่มีจำนวน rung น้อยลงชั่วคราวแทนการหยุดสตรีมไปเลย เพื่อให้ผู้ชมยังดูได้แม้คุณภาพจะลดลง ดูรายละเอียดที่ {{ref:policy:live-event-scaling-policy}}",
        ],
      },
    },
    {
      slug: "bitrate-ladder-selection-policy",
      title: "นโยบายการเลือก Bitrate Ladder",
      tags: ["ladder", "encoding", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:bitrate-ladder-selector}} คำนวณ ladder จาก resolution และ bitrate ของต้นฉบับเสมอ ห้าม transcode rendition ที่ resolution หรือ bitrate สูงกว่าต้นฉบับเด็ดขาด (ไม่ upscale) เพราะเปลืองพื้นที่จัดเก็บและ compute โดยไม่เพิ่มคุณภาพจริง",
        "จำนวน rung มาตรฐานคือ 5 ระดับ (1080p, 720p, 480p, 360p, 240p) แต่ถ้าต้นฉบับมี resolution ต่ำกว่า 1080p ระบบจะตัด rung ที่สูงกว่าต้นฉบับออกจาก ladder ทั้งหมด ไม่ใส่ rung ปลอมที่ resolution เท่าต้นฉบับซ้ำ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับต้นฉบับ Bitrate ต่ำผิดปกติ",
        tags: ["ladder", "edge-case"],
        body: [
          "ถ้าต้นฉบับมี resolution สูง (เช่น 1080p) แต่ bitrate ต่ำผิดปกติ (บีบอัดมาแรงจากต้นทาง) ระบบจะไม่สร้าง rung ที่ bitrate สูงกว่าต้นฉบับแม้ resolution จะรองรับได้ เพราะจะเป็นการเพิ่มขนาดไฟล์โดยไม่เพิ่มคุณภาพจริง (rung นั้นแค่ทำให้ต้นฉบับที่บีบอัดมาแล้วดูแย่ลงจากการ re-encode ซ้ำ)",
          "รายชื่ออุปกรณ์ที่ไม่รองรับ codec บางตัว (เช่น HEVC บนอุปกรณ์เก่า) ต้องมี rung สำรองที่ใช้ H.264 เสมออย่างน้อย 1 rung แม้ ladder หลักจะเป็น HEVC ทั้งหมด — บทเรียนจาก {{ref:incident:bitrate-ladder-selector-wrong-codec}}",
        ],
      },
    },
    {
      slug: "drm-license-issuance-policy",
      title: "นโยบายการออก DRM License",
      tags: ["drm", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:drm-license-server}} จะออก license ให้เมื่อ device certificate ผ่านการตรวจสอบและจำนวน concurrent stream ของ account ยังไม่เกิน `LICENSE_MAX_CONCURRENT_STREAMS` เท่านั้น ไม่มีข้อยกเว้นสำหรับ account ระดับใดที่ข้ามการตรวจ certificate ได้",
        "license มีอายุ `LICENSE_TTL_SEC` (6 ชั่วโมง) หลังหมดอายุผู้เล่นต้องขอ license ใหม่โดยอัตโนมัติระหว่างเล่นต่อเนื่อง ผู้ชมจะไม่รู้สึกถึงการต่ออายุนี้ถ้าเครือข่ายปกติ",
      ],
      edgeCase: {
        title: "ข้อยกเว้น Grace Period เมื่ออุปกรณ์ออฟไลน์ชั่วคราว",
        tags: ["drm", "edge-case"],
        body: [
          "ถ้าอุปกรณ์กำลังเล่นวิดีโอที่มี license ที่ยังไม่หมดอายุแต่เครือข่ายหลุดชั่วคราว ผู้เล่นจะเล่นต่อด้วย license เดิมจนกว่าจะหมดอายุจริง ไม่ต้องรอ re-validate ทันทีที่เครือข่ายกลับมา เพื่อไม่ให้การเล่นสะดุดเพราะปัญหาเครือข่ายชั่วคราว",
          "อุปกรณ์ในบ้านเดียวกันไม่เกิน 2 เครื่องที่เล่นพร้อมกันจะไม่ถูกนับเข้า concurrent limit เต็มอัตรา (นับเป็น 1 slot ร่วมกันถ้ายืนยันว่าเป็น account เดียวกันและ IP ใกล้เคียงกัน) เพื่อรองรับการดูพร้อมกันในครัวเรือนโดยไม่ต้องอัปเกรด plan",
        ],
      },
    },
    {
      slug: "origin-shield-cache-policy",
      title: "นโยบาย Cache ของ Origin Shield",
      tags: ["cdn", "cache", "policy"],
      isPrimary: true,
      intro: [
        "{{ref:module:cdn-origin-shield}} cache segment และ manifest ตาม `ORIGIN_SHIELD_CACHE_TTL_SEC` โดย cache key ต้องรวมสถานะการเข้ารหัส DRM ด้วยเสมอ ไม่ใช่แค่ path เพราะ segment เดียวกันอาจถูกขอทั้งแบบเข้ารหัสและไม่เข้ารหัสสำหรับผู้เล่นคนละประเภท",
        "manifest ของ live event มี TTL สั้นกว่า segment มาก (ไม่เกิน target duration ของ playlist) เพราะ manifest ต้องอัปเดตทุกครั้งที่มี segment ใหม่ ในขณะที่ segment เองเปลี่ยนแปลงไม่ได้แล้วหลัง publish จึง cache ได้ยาว",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อคอนเทนต์ได้รับความนิยมพุ่งขึ้นกะทันหัน",
        tags: ["cdn", "cache", "edge-case"],
        body: [
          "เมื่อ request rate ต่อ segment เดียวกันพุ่งเกิน threshold ในเวลาสั้น ระบบจะ coalesce request ที่ซ้ำกันให้รอ response เดียวจาก origin แทนที่จะปล่อยให้ทุก request ยิงไป origin พร้อมกัน (request coalescing ด้วย lock ตาม `ORIGIN_SHIELD_STAMPEDE_LOCK_MS`) — บทเรียนจาก {{ref:incident:origin-shield-cache-stampede}}",
          "วิดีโอที่ถูกตรวจพบว่ากำลังไวรัล (จัดกลุ่ม trending อัตโนมัติ) จะถูก `primeCache` ล่วงหน้าไปยัง edge node ทุกภูมิภาคทันทีที่ตรวจพบ แทนที่จะรอให้ cache miss ธรรมชาติค่อยๆ กระจาย เพื่อลดภาระ origin ในช่วงพีคของความนิยม",
        ],
      },
    },
    {
      slug: "storage-quota-policy",
      title: "นโยบายโควตาพื้นที่จัดเก็บของ Publisher",
      tags: ["storage", "quota", "policy"],
      isPrimary: true,
      intro: [
        "แต่ละ publisher account มีโควตาพื้นที่จัดเก็บตาม plan ที่สมัคร ระบบตรวจสอบโควตาก่อนเริ่มรับอัปโหลดทุกครั้ง ถ้าพื้นที่เหลือไม่พอสำหรับไฟล์ต้นฉบับที่ประกาศขนาดมา จะปฏิเสธการอัปโหลดตั้งแต่ต้นไม่ให้เริ่ม",
        "การนับพื้นที่ใช้งานรวมทั้งไฟล์ต้นฉบับและทุก rendition ที่ transcode ออกมา ไม่ใช่แค่ไฟล์ต้นฉบับอย่างเดียว เพราะ rendition หลายตัวรวมกันมักมีขนาดใหญ่กว่าต้นฉบับเสียอีก",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อโควตาหมดระหว่างอัปโหลดที่กำลังทำอยู่",
        tags: ["storage", "edge-case"],
        body: [
          "ถ้า publisher มีอัปโหลดแบบ multi-part ที่เริ่มไปแล้วตอนที่ยังมีโควตาเหลือ แต่ account ใช้โควตาหมดจากการอัปโหลดไฟล์อื่นพร้อมกันก่อนไฟล์นี้เสร็จ ระบบจะปล่อยให้อัปโหลดที่เริ่มไปแล้วทำต่อจนจบ ไม่ตัดกลางคัน เพราะไฟล์ที่ถูกตัดกลาง multi-part upload จะกลายเป็นไฟล์เสียที่กู้คืนไม่ได้ — ดู {{ref:incident:storage-quota-exceeded-partial-upload}}",
          "หลังอัปโหลดที่เกินโควตาเสร็จแล้ว account จะถูกล็อกไม่ให้อัปโหลดไฟล์ใหม่จนกว่าจะลบของเก่าหรืออัปเกรด plan แต่ไฟล์ที่มีอยู่แล้วยังเล่นได้ปกติ ไม่ถูกลบหรือระงับการเข้าถึง",
        ],
      },
    },
    {
      slug: "transcode-retry-policy",
      title: "นโยบายการ Retry เมื่อ Transcode ล้มเหลว",
      tags: ["transcode", "retry", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:transcode-worker}} transcode ล้มเหลว ระบบจัดหมวดเป็น `failed_soft` (ลองใหม่ได้ เช่น worker ถูก preempt กลางงาน) หรือ `failed_hard` (ต้องให้คนช่วย เช่น codec ที่ต้นฉบับใช้ไม่รองรับเลย)",
        "`failed_soft` จะถูก retry อัตโนมัติสูงสุด 2 ครั้งก่อนถูกยกระดับเป็น `failed_hard` โดยอัตโนมัติ เพื่อไม่ให้ job ค้างพยายาม transcode ไฟล์เดิมไม่จบไม่สิ้นในคิว",
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Retry เมื่อสาเหตุมาจากไฟล์ต้นฉบับเสียหาย",
        tags: ["transcode", "retry", "edge-case"],
        body: [
          "ถ้า `probeSource` ตรวจพบว่าไฟล์ต้นฉบับเสียหายตั้งแต่ต้น (reason `source_corrupt`) ระบบจะไม่ retry เลยแม้แต่ครั้งเดียว เพราะการ probe ซ้ำไฟล์เดิมได้ผลเหมือนเดิมทุกครั้งแน่นอน — จะแจ้ง publisher ให้อัปโหลดใหม่ทันที",
          "job ที่ล้มเหลวเพราะ `TRANSCODE_STALL_TIMEOUT_MS` ระหว่าง live event กำลังดำเนินอยู่จะไม่ retry ตาม flow ปกติ เพราะเวลาที่เสียไปกับ retry ทำให้ live เสียจังหวะไปไกลเกินจะไล่ทัน — จะ skip segment นั้นไปเลยแล้วให้ผู้เล่น handle ช่องว่างสั้นๆ แทน",
        ],
      },
    },
    {
      slug: "thumbnail-extraction-timing-policy",
      title: "นโยบายจังหวะเวลาการสร้าง Thumbnail",
      tags: ["thumbnail", "policy"],
      isPrimary: false,
      intro: [
        "{{ref:module:thumbnail-extractor}} เริ่มทำงานก็ต่อเมื่อมี rendition แรกที่คุณภาพสูงสุด (มักเป็น rung บนสุดของ ladder) transcode เสร็จแล้วเท่านั้น ไม่รอให้ทุก rendition เสร็จครบก่อน เพื่อให้ผู้ผลิตเห็น thumbnail ได้เร็วที่สุดโดยไม่ต้องรอ ladder เสร็จทั้งหมด",
        "sprite sheet สำหรับแถบ scrub จะสร้างทีหลังสุดในลำดับความสำคัญ เพราะไม่จำเป็นต่อการเริ่มเล่นวิดีโอ ระบบจึงให้ priority ต่ำกว่า poster image เสมอ",
      ],
    },
    {
      slug: "subtitle-sync-policy",
      title: "นโยบายการซิงก์ Subtitle",
      tags: ["subtitle", "policy"],
      isPrimary: false,
      intro: [
        "subtitle ที่ publisher อัปโหลดมาต้องอ้างอิง timestamp กับต้นฉบับเดิมเสมอ ไม่ใช่กับ rendition ใดๆ ที่ transcode ออกมา เพราะ framerate ของแต่ละ rendition อาจถูกปรับให้ต่างจากต้นฉบับได้ในบางกรณี",
        "ถ้า transcode-worker re-encode ไฟล์ที่มี framerate เปลี่ยนไปจากต้นฉบับ (เช่นปรับ 29.97fps เป็น 30fps เพื่อความเข้ากันได้) ระบบต้องคำนวณ offset ของ subtitle timestamp ใหม่ตามอัตราส่วน framerate ที่เปลี่ยน ไม่ใช้ timestamp เดิมตรงๆ — บทเรียนจาก {{ref:incident:subtitle-timing-drift-reencode}}",
      ],
    },
    {
      slug: "live-event-scaling-policy",
      title: "นโยบายการ Scale ล่วงหน้าสำหรับ Live Event",
      tags: ["live", "scaling", "policy"],
      isPrimary: false,
      intro: [
        "live event ที่ publisher จองล่วงหน้าผ่านระบบตารางเวลา จะทำให้ {{ref:module:transcode-worker}} scale worker pool ล่วงหน้า 15 นาทีก่อนเวลาเริ่มจริงเสมอ ไม่รอให้ segment แรกเข้ามาก่อนแล้วค่อย scale แบบ reactive",
        "จำนวน worker ที่ scale ล่วงหน้าคำนวณจากจำนวนผู้ชมที่คาดการณ์ไว้ ไม่ใช่ค่าคงที่ตายตัว — event ที่คาดว่าผู้ชมเยอะจะได้ worker สำรองมากกว่า",
      ],
    },
    {
      slug: "content-takedown-policy",
      title: "นโยบายการถอดคอนเทนต์ (Takedown)",
      tags: ["takedown", "compliance", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อได้รับคำขอถอดคอนเทนต์ที่ผ่านการยืนยันสิทธิ์แล้ว (เช่นคำร้อง DMCA) ระบบต้อง purge cache ที่ {{ref:module:cdn-origin-shield}} และเพิกถอน license ที่ยังไม่หมดอายุที่ {{ref:module:drm-license-server}} พร้อมกันภายใน 1 ชั่วโมง",
        "ไฟล์ต้นฉบับและ rendition จะไม่ถูกลบทิ้งทันที แต่ถูกย้ายไป storage tier แยกสำหรับเก็บหลักฐานตามระยะเวลาที่กฎหมายกำหนด ก่อนลบถาวรจริง",
      ],
    },
    {
      slug: "cdn-failover-policy",
      title: "นโยบาย Failover ระหว่าง CDN Provider",
      tags: ["cdn", "failover", "policy"],
      isPrimary: false,
      intro: [
        "ระบบใช้ CDN provider หลักและสำรองพร้อมกัน — {{ref:module:cdn-origin-shield}} ตรวจ error rate ของ provider หลักทุก 30 วินาที ถ้าเกิน 5% ติดต่อกัน 3 รอบจะสลับ traffic ไปยัง provider สำรองอัตโนมัติโดยไม่ต้องรอคนอนุมัติ",
        "การสลับกลับมาใช้ provider หลักหลัง error หายแล้วต้องมีคนยืนยันด้วยมือเสมอ ไม่สลับกลับอัตโนมัติ เพื่อป้องกันการสลับไปมาถี่ๆ (flapping) ที่ทำให้ผู้ชมเจอ buffering ซ้ำ",
      ],
    },
  ],
  incidents: [
    {
      slug: "transcode-queue-backlog-live-event",
      title: "คิว transcode ค้างสะสมช่วง live event ใหญ่",
      tags: ["transcode", "live", "backlog"],
      summary:
        "ระหว่าง live event ที่มีผู้ชมพร้อมกันสูงสุดของปี ทีมสังเกตว่า segment ใหม่เข้าคิวเร็วกว่าที่ worker ประมวลผลทันมาก จนผู้ชมเริ่มเจอ buffering ยาวขึ้นเรื่อยๆ",
      investigation:
        "เช็ค {{ref:deployment:monitoring-alerts}} พบว่าคิว live ของ {{ref:module:transcode-worker}} ลึกขึ้นต่อเนื่อง ตรวจ autoscale log พบว่า worker pool ขยายช้ากว่าที่ควรมาก",
      cause:
        "การจอง live event ล่วงหน้าของ publisher รายนี้ประเมินจำนวนผู้ชมต่ำกว่าความจริงมาก ทำให้ pre-scale ตาม {{ref:policy:live-event-scaling-policy}} ไม่พอ และ autoscale แบบ reactive ตามปกติ scale ตามการใช้ CPU ซึ่งมี lag อีกหลายนาทีกว่าจะทัน",
      resolution:
        "วิศวกร on-call scale worker pool ด้วยมือทันทีเกินกว่าที่ autoscale คำนวณไว้ พร้อมสลับ ladder ของ event นี้ไปใช้จำนวน rung น้อยลงชั่วคราวตาม edge case ใน {{ref:policy:transcode-priority-policy}} เพื่อลดภาระต่อ segment",
      followup:
        "เสนอให้ publisher ที่จอง live event ต้องกรอกช่วงผู้ชมที่คาดการณ์แบบมี buffer ขั้นต่ำ และพิจารณาตั้ง pre-scale ให้ aggressive กว่าตัวเลขที่ publisher กรอกเสมอ",
    },
    {
      slug: "drm-license-outage",
      title: "DRM license server ล่มทำให้เล่นวิดีโอไม่ได้เป็นวงกว้าง",
      tags: ["drm", "outage"],
      summary:
        "ผู้ชมกลุ่มที่ใช้อุปกรณ์ต้องพึ่ง DRM (Smart TV, กล่องรับสัญญาณ) รายงานว่าเล่นวิดีโอไม่ได้พร้อมกันจำนวนมาก ขึ้น error ขอ license ไม่สำเร็จ",
      investigation:
        "ตรวจ log {{ref:module:drm-license-server}} พบว่า `issueLicense` timeout เกือบทุก request เชื่อมต่อ database ไม่ได้",
      cause:
        "connection pool ของ database ถูกใช้จนหมดหลังจาก certificate ที่ใช้เชื่อมต่อ database ถูก rotate อัตโนมัติเมื่อคืนก่อนหน้า แต่ config ของ connection pool ยังอ้างอิง certificate เก่าที่หมดอายุแล้ว ทำให้ connection ใหม่สร้างไม่ได้เลยหลัง connection เดิมถูกปิดตามรอบ",
      resolution:
        "วิศวกร on-call อัปเดต config ให้ชี้ไปยัง certificate ใหม่ด้วยมือแล้ว restart service ทั้งหมด บริการกลับมาใช้งานได้ภายใน 18 นาที",
      followup:
        "เพิ่มการแจ้งเตือนล่วงหน้า 48 ชั่วโมงก่อน certificate หมดอายุ และทำให้ connection pool config อ่านค่า certificate path แบบ dynamic แทนการ hardcode",
    },
    {
      slug: "bitrate-ladder-misconfig-buffering",
      title: "ตั้งค่า bitrate ladder ผิดหลัง deploy ทำ buffering ทั่วระบบ",
      tags: ["ladder", "deploy", "buffering"],
      summary:
        "หลัง deploy อัปเดต default bitrate ของ ladder ทีมได้รับรายงาน buffering เพิ่มขึ้นผิดปกติจากผู้ชมทุกภูมิภาคพร้อมกัน",
      investigation:
        "ตรวจ {{ref:module:bitrate-ladder-selector}} พบว่า rung กลาง (720p) ถูกตั้ง bitrate สูงกว่าที่ควรเกือบ 2 เท่าจากการพิมพ์ผิดในค่า config ที่ deploy ไป",
      cause:
        "การ review ค่า config ตัวเลขก่อน deploy ไม่มีคนที่สองยืนยันเพราะถูกมองว่าเป็นการเปลี่ยนแปลงเล็กน้อย ทั้งที่กระทบทุก asset ที่ transcode ใหม่หลังจากนั้นทันที",
      resolution:
        "rollback config กลับค่าที่ถูกต้องตาม {{ref:deployment:rollback-procedure}} แล้ว trigger `invalidatePlaylist` ให้ทุก asset ที่ได้รับผลกระทบสร้าง manifest ใหม่",
      followup:
        "เพิ่มการเปลี่ยนค่า bitrate ตัวเลขเข้า checklist ที่ต้องมีคนที่สองยืนยันเสมอใน {{ref:convention:code-review-checklist}}",
    },
    {
      slug: "origin-shield-cache-stampede",
      title: "Cache stampede หลังวิดีโอหนึ่งไวรัลกะทันหัน",
      tags: ["cdn", "cache", "stampede"],
      summary:
        "วิดีโอหนึ่งถูกแชร์ต่อในโซเชียลมีเดียจนยอดผู้ชมพุ่งขึ้นหลายสิบเท่าในเวลาไม่ถึง 10 นาที ทีมสังเกตว่า origin server รับ request ตรงจำนวนมากผิดปกติทั้งที่ควรถูก cache ไว้แล้ว",
      investigation:
        "ตรวจ {{ref:module:cdn-origin-shield}} พบว่า cache key ของ segment นี้รวม query parameter ที่เป็น session token แบบสุ่มของแต่ละผู้ชมเข้าไปด้วยโดยไม่ตั้งใจ ทำให้แทบทุก request ถูกมองว่าเป็น cache key ที่ไม่ซ้ำกัน",
      cause:
        "การเปลี่ยน player SDK เวอร์ชันล่าสุดเพิ่ม query parameter สำหรับ analytics เข้าไปใน URL ของ segment โดยทีม cache ไม่ได้ปรับ cache key logic ให้ตัด parameter นี้ออกก่อน",
      resolution:
        "แก้ cache key ให้ตัด query parameter ที่ไม่กระทบเนื้อหาจริงออกก่อนคำนวณ hash แล้ว deploy hotfix เร่งด่วน พร้อมเปิด request coalescing ด้วยมือชั่วคราวเพื่อลดภาระ origin ระหว่างรอ deploy",
      followup:
        "ทำ allowlist ของ query parameter ที่อนุญาตให้อยู่ใน cache key แทนการรวมทุก parameter โดย default และเพิ่ม test ครอบคลุมกรณี SDK เพิ่ม parameter ใหม่",
    },
    {
      slug: "subtitle-timing-drift-reencode",
      title: "Subtitle เพี้ยนเวลาหลัง re-encode เปลี่ยน framerate",
      tags: ["subtitle", "reencode"],
      summary:
        "publisher รายงานว่า subtitle ของวิดีโอหนึ่งเริ่มเพี้ยนเวลาไปเรื่อยๆ ยิ่งดูนานยิ่งไม่ตรงปาก แม้ตอนอัปโหลดครั้งแรกจะตรงดี",
      investigation:
        "ตรวจสอบพบว่าวิดีโอถูก re-transcode ใหม่หลัง publisher อัปเดตไฟล์ต้นฉบับ ตรง {{ref:policy:subtitle-sync-policy}} ที่ระบุว่าต้องคำนวณ offset ใหม่เมื่อ framerate เปลี่ยน",
      cause:
        "ไฟล์ต้นฉบับใหม่มี framerate 29.97fps ต่างจากไฟล์เดิมที่ 30fps แต่ subtitle ไฟล์เดิมยังอ้างอิง timestamp แบบ 30fps โดย pipeline ไม่ได้คำนวณ offset ใหม่ให้ตามนโยบาย เพราะ logic นี้ถูกเพิ่มทีหลังและยังไม่ได้ apply ย้อนหลังกับ asset เก่า",
      resolution:
        "รัน script คำนวณ offset ใหม่ให้ subtitle ของ asset ที่ได้รับผลกระทบด้วยมือ แล้วอัปโหลด subtitle เวอร์ชันแก้ไขทับ",
      followup:
        "เพิ่ม automated check ที่เทียบ framerate ของ rendition ใหม่กับ subtitle ที่ผูกอยู่ทุกครั้งที่ transcode เสร็จ แจ้งเตือนอัตโนมัติถ้าไม่ตรงกัน",
    },
    {
      slug: "storage-quota-exceeded-partial-upload",
      title: "โควตาพื้นที่จัดเก็บเต็มระหว่างอัปโหลดทำไฟล์ค้างครึ่งเดียว",
      tags: ["storage", "upload"],
      summary:
        "publisher รายหนึ่งพบว่าไฟล์ที่อัปโหลดค้างอยู่ในสถานะ uploading ไม่ขยับไปไหนเป็นเวลานาน ทั้งที่อัปโหลดจากอินเทอร์เน็ตที่เร็วปกติ",
      investigation:
        "ตรวจ log พบว่า account ของ publisher ใช้โควตาเต็มจากการอัปโหลดไฟล์อื่นพร้อมกันระหว่างที่ไฟล์นี้กำลังอัปโหลดแบบ multi-part อยู่",
      cause:
        "ตามเงื่อนไข edge case ของ {{ref:policy:storage-quota-policy}} อัปโหลดที่เริ่มไปแล้วควรทำต่อจนจบได้ แต่ bug ใน multi-part upload handler เช็คโควตาซ้ำระหว่างแต่ละ part แทนที่จะเช็คแค่ตอนเริ่มครั้งเดียว ทำให้ part ที่เหลือถูกปฏิเสธกลางทาง",
      resolution:
        "แก้ handler ให้ข้ามการเช็คโควตาซ้ำสำหรับ upload ที่เริ่มไปแล้ว แล้วให้ publisher อัปโหลดไฟล์ที่ค้างใหม่อีกครั้งหลัง fix เพราะ part ที่ขาดหายไม่สามารถกู้คืนได้",
      followup:
        "เพิ่ม integration test สำหรับ multi-part upload ที่ account ใกล้เต็มโควตาพอดี เพื่อจับ regression แบบนี้ก่อนขึ้นจริง",
    },
    {
      slug: "thumbnail-extractor-blank-frames",
      title: "Thumbnail เป็นภาพดำล้วนสำหรับวิดีโอที่มี intro fade",
      tags: ["thumbnail", "quality"],
      summary:
        "publisher หลายรายรายงานว่า poster image ที่ระบบสร้างให้อัตโนมัติเป็นภาพดำสนิท ทั้งที่วิดีโอมีเนื้อหาปกติ",
      investigation:
        "ตรวจ {{ref:module:thumbnail-extractor}} พบว่า `extractPoster` ใช้ timestamp คงที่ที่วินาทีที่ 2 เสมอ ซึ่งตรงกับช่วง fade-in สีดำของวิดีโอกลุ่มนี้พอดี",
      cause:
        "วิดีโอกลุ่มที่ได้รับผลกระทบทั้งหมดมาจาก publisher รายเดียวที่ใช้ template intro แบบ fade-in จากจอดำเหมือนกันทุกไฟล์ ทำให้ timestamp คงที่ที่เคยใช้ได้ผลกับ publisher อื่นกลับตรงกับ frame ดำสนิทพอดีสำหรับกลุ่มนี้",
      resolution:
        "แก้ `extractPoster` ให้ตรวจความสว่างเฉลี่ยของเฟรมก่อน ถ้าต่ำกว่า threshold ให้เลื่อน timestamp ไปทีละ 1 วินาทีจนเจอเฟรมที่ไม่ใช่จอดำ แทนการใช้ timestamp คงที่เสมอ",
      followup:
        "รัน `regenerateThumbnails` ย้อนหลังให้ asset ทั้งหมดของ publisher ที่ได้รับผลกระทบ และเพิ่ม visual regression test สำหรับกรณี intro fade",
    },
    {
      slug: "playlist-generator-stale-manifest",
      title: "CDN cache manifest เก่าทำผู้ชม live event เห็น segment ไม่ครบ",
      tags: ["playlist", "cache", "live"],
      summary:
        "ระหว่าง live event ผู้ชมบางกลุ่มเห็นวิดีโอค้างไม่เดินหน้าต่อ ทั้งที่ segment ใหม่ถูกสร้างและเผยแพร่ไปแล้วตามปกติ",
      investigation:
        "ตรวจ {{ref:module:cdn-origin-shield}} พบว่า manifest ที่ผู้ชมกลุ่มนี้ได้รับเป็นเวอร์ชันเก่ากว่าที่ {{ref:module:playlist-generator}} อัปเดตไปแล้วหลายรอบ",
      cause:
        "response header ที่ควบคุม cache TTL ของ manifest ไม่ถูกตั้งให้สั้นพอสำหรับ live event ในบาง edge node เพราะ config cache TTL ถูก override โดยค่า default ของ CDN provider ที่ยาวกว่าที่ {{ref:policy:origin-shield-cache-policy}} กำหนดไว้",
      resolution:
        "purge cache manifest ทุก edge node ด้วยมือทันที แล้วยืนยัน config cache-control header ที่ CDN provider ให้ตรงกับค่าที่ตั้งใจไว้จริง",
      followup:
        "เพิ่ม automated check เปรียบเทียบ cache TTL ที่ config ไว้กับค่าที่ CDN provider ใช้จริงเป็นระยะ เพื่อจับ config drift แบบนี้ก่อนกระทบผู้ชม",
    },
    {
      slug: "cdn-origin-shield-ssl-cert-expiry",
      title: "SSL certificate ของ origin shield หมดอายุโดยไม่มีใครรู้ตัว",
      tags: ["cdn", "certificate"],
      summary:
        "ผู้ชมบางส่วนเจอ error การเชื่อมต่อไม่ปลอดภัยเมื่อพยายามเล่นวิดีโอ ผู้เล่นบางตัว block การเล่นไปเลยเพราะเชื่อมต่อ origin shield ไม่ได้",
      investigation:
        "ตรวจสอบพบว่า SSL certificate ของ {{ref:module:cdn-origin-shield}} หมดอายุไปแล้วตั้งแต่เช้า ระบบ auto-renewal ที่ควรทำงานล่วงหน้าไม่ได้ต่ออายุให้",
      cause:
        "auto-renewal job ล้มเหลวเงียบๆ มาสามครั้งติดต่อกันก่อนหน้านี้เพราะ DNS validation record ถูกลบโดยไม่ตั้งใจตอนทำความสะอาด DNS zone แต่ไม่มี alert แจ้งเมื่อ renewal ล้มเหลว",
      resolution:
        "ออก certificate ใหม่ด้วยมือทันทีหลัง restore DNS validation record แล้ว deploy certificate ใหม่เข้าทุก edge node",
      followup:
        "เพิ่ม alert เมื่อ auto-renewal ล้มเหลวแม้แต่ครั้งเดียว และเพิ่ม alert แยกเมื่อ certificate เหลืออายุน้อยกว่า 14 วัน",
    },
    {
      slug: "transcode-worker-memory-leak",
      title: "Transcode worker กิน memory เพิ่มขึ้นเรื่อยๆ จนต้อง restart บ่อย",
      tags: ["transcode", "memory", "performance"],
      summary:
        "ทีม infra สังเกตว่า worker instance ของ {{ref:module:transcode-worker}} ต้อง restart เองบ่อยผิดปกติจาก out-of-memory โดยเฉพาะ instance ที่รับงาน 4K",
      investigation:
        "ตรวจ metric memory usage รายชั่วโมงพบว่าค่อยๆ ไต่ขึ้นต่อเนื่องไม่เคยลดลงระหว่าง process เดียวกันทำงาน ตรงกับ pattern ของ memory leak มากกว่า spike ชั่วคราว",
      cause:
        "library ที่ใช้ประมวลผลวิดีโอเวอร์ชันที่ใช้อยู่มี known bug ไม่คืน memory buffer หลัง encode segment ที่มี GOP ยาวผิดปกติ (พบเฉพาะ 4K ที่ตั้ง `DEFAULT_GOP_SIZE_FRAMES` สูงกว่า resolution อื่น)",
      resolution:
        "จำกัดจำนวน segment ต่อ worker process ก่อนบังคับ restart อัตโนมัติ (recycle process) เป็นการแก้ชั่วคราวระหว่างรอ library เวอร์ชันใหม่ที่แก้ bug นี้แล้ว",
      followup:
        "วางแผนอัปเกรด library เป็นเวอร์ชันที่แก้ไข bug อย่างเป็นทางการ และเพิ่ม monitoring memory usage ต่อ process แยกจาก host level เดิม",
    },
    {
      slug: "drm-license-server-clock-skew",
      title: "Clock skew ทำ license ถูกปฏิเสธว่าหมดอายุทั้งที่ยังไม่หมด",
      tags: ["drm", "clock"],
      summary:
        "ผู้ชมกลุ่มหนึ่งเจอ error ว่า license หมดอายุทันทีที่ขอใหม่ ทั้งที่เพิ่งออก license ไปไม่ถึง 1 นาทีก่อนหน้า",
      investigation:
        "ตรวจ {{ref:module:drm-license-server}} instance ที่เกี่ยวข้องพบว่าเวลาของ server เดินคลาดเคลื่อนจากเวลาจริงไปเกือบ 10 นาที",
      cause:
        "NTP sync ของ instance กลุ่มนี้หยุดทำงานหลัง network policy เปลี่ยนบล็อก outbound ไปยัง NTP server ภายนอกโดยไม่ตั้งใจระหว่างการปรับ firewall rule ของทีม infra",
      resolution:
        "แก้ firewall rule คืนให้ NTP sync ทำงานได้ตามปกติ แล้ว restart instance ที่ clock เพี้ยนเพื่อ force sync ทันที",
      followup:
        "เพิ่ม alert ตรวจ clock drift ของทุก instance เทียบกับ NTP source เป็นระยะ แทนที่จะพึ่งพา NTP sync ทำงานเงียบๆ โดยไม่มีการยืนยัน",
    },
    {
      slug: "live-stream-audio-desync",
      title: "เสียงกับภาพไม่ตรงกันระหว่าง live event ที่มีคนดูพร้อมกันสูง",
      tags: ["live", "audio", "muxing"],
      summary:
        "ระหว่าง live event ขนาดใหญ่ ผู้ชมจำนวนมากรายงานว่าเสียงพูดกับปากไม่ตรงกัน ปัญหาเกิดเฉพาะบางช่วงของ event ไม่ใช่ตลอดทั้งรายการ",
      investigation:
        "ตรวจ log การ mux ของ {{ref:module:transcode-worker}} พบว่าช่วงที่ปัญหาเกิดตรงกับช่วงที่ worker หลายตัวประมวลผล segment ของ event เดียวกันพร้อมกันมากที่สุด",
      cause:
        "เมื่อ worker หลายตัวประมวลผล segment เสียงและภาพของ event เดียวกันพร้อมกันภายใต้โหลดสูง มี race condition ที่ทำให้บาง segment เสียงถูก mux เข้ากับ segment ภาพคนละตำแหน่งเวลากัน เพราะ timestamp ที่ใช้ sync มาจาก wall-clock ของแต่ละ worker แทนที่จะเป็น timestamp กลางร่วมกัน",
      resolution:
        "แก้ mux logic ให้ใช้ timestamp จาก source stream โดยตรงแทน wall-clock ของ worker แล้ว deploy hotfix ระหว่าง event ที่ยังดำเนินอยู่",
      followup:
        "เพิ่ม automated audio-video sync check หลัง mux ทุก segment ของ live event โดยเฉพาะ ปฏิเสธ segment ที่ sync เพี้ยนเกิน threshold แทนการปล่อยผ่าน",
    },
    {
      slug: "bitrate-ladder-selector-wrong-codec",
      title: "เลือก codec ผิดทำอุปกรณ์รุ่นเก่าเล่นวิดีโอไม่ได้เป็นวงกว้าง",
      tags: ["ladder", "codec"],
      summary:
        "หลังเปลี่ยนมาตรฐาน default codec เป็น HEVC เพื่อประหยัด bandwidth ทีม support ได้รับรายงานว่าผู้ชมที่ใช้อุปกรณ์รุ่นเก่าเล่นวิดีโอใหม่ไม่ได้เลยจำนวนมาก",
      investigation:
        "ตรวจ {{ref:module:bitrate-ladder-selector}} พบว่า `selectRenditionsForDevice` ไม่มี rung สำรอง H.264 เหลือให้เลือกเลยสำหรับ ladder ที่สร้างหลัง deploy ครั้งนี้",
      cause:
        "การเปลี่ยน default codec ลืมคง rung สำรอง H.264 ไว้อย่างน้อย 1 rung ตามที่ {{ref:policy:bitrate-ladder-selection-policy}} กำหนดไว้ เพราะโค้ดที่แก้ไปแตะเฉพาะ default codec ของ rung หลักโดยไม่ได้ตรวจสอบ edge case นี้",
      resolution:
        "deploy hotfix คืน rung สำรอง H.264 กลับเข้า ladder แล้ว trigger transcode ใหม่ให้ asset ที่สร้างระหว่างช่วงที่ได้รับผลกระทบทั้งหมด",
      followup:
        "เพิ่ม automated test ที่ตรวจว่าทุก ladder ที่สร้างต้องมี rung H.264 อย่างน้อย 1 rung เสมอ ก่อนอนุญาตให้ deploy เปลี่ยน default codec ครั้งต่อไป",
    },
    {
      slug: "duplicate-transcode-jobs-race-condition",
      title: "Job transcode เดียวกันถูกทำซ้ำสองรอบพร้อมกัน",
      tags: ["transcode", "bug", "race-condition"],
      summary:
        "ทีม infra สังเกตว่าการใช้ worker สูงกว่าที่ควรเทียบกับจำนวนคิวจริง ตรวจสอบพบว่าบาง job ถูก worker สองตัวหยิบไปทำพร้อมกัน",
      investigation:
        "ตรวจ log การหยิบงานจากคิวพบว่ามี race condition เมื่อ worker สองตัวหยิบงานพร้อมกันในเวลาไล่เลี่ยกันมาก ทั้งคู่อ่านเห็น job เดิมว่ายัง `queued` อยู่ก่อนที่ฝั่งใดฝั่งหนึ่งจะอัปเดตสถานะทัน",
      cause:
        "การ query และ update สถานะ job ไม่ได้ทำแบบ atomic — ช่วงเวลาสั้นๆ ระหว่างอ่านกับเขียนเปิดโอกาสให้ worker คู่ขนานแทรกเข้ามาหยิบ job เดิมซ้ำได้ เหมือนรูปแบบปัญหาที่เจอใน backlog scale สูง",
      resolution:
        "แก้การหยิบงานให้ใช้ conditional update แบบ atomic (`update ... where status='queued'`) แทนการอ่านแล้วเขียนแยกกัน deploy เป็น hotfix ทันที",
      followup:
        "ตรวจสอบฟังก์ชันอื่นที่มี pattern อ่าน-แล้ว-เขียนคล้ายกันในทุก service ว่ามีความเสี่ยง race condition เดียวกันหรือไม่ เพิ่มเข้า {{ref:convention:code-review-checklist}}",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/SF-142-hevc-ladder-fallback`, `fix/SF-158-origin-shield-cache-key`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(cdn-origin-shield): กัน cache stampede จาก query param analytics`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้สถานะ job หรือ cache key logic ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:duplicate-transcode-jobs-race-condition}}) และการเปลี่ยนค่า config ตัวเลข (bitrate, timeout) ต้องมีคนที่สองยืนยันก่อน merge เสมอ (ดูบทเรียนจาก {{ref:incident:bitrate-ladder-misconfig-buffering}})" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `transcodeSegment`, `generateMasterPlaylist` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ของ asset", body: "`assetId` รูปแบบ `AST-<10 หลัก>`, `renditionId` รูปแบบ `<assetId>-<rung>` เช่น `AST-0042871190-720p` ต้อง unique ทั่วทั้งระบบเสมอ" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ job ต้องมี `jobId` เสมอ เพื่อไล่ log ข้าม service ได้ (transcode-worker → playlist-generator → cdn-origin-shield) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "`failed_hard` ของ transcode log เป็น `error` เสมอแม้จะเป็นสาเหตุจากไฟล์ publisher เอง เพราะทีม on-call ต้อง grep เจอง่ายตอนไล่ incident" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`SF_<DOMAIN>_<REASON>` เช่น `SF_TRANSCODE_SOURCE_CORRUPT`, `SF_DRM_CONCURRENT_LIMIT` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`SF_STORAGE_QUOTA_EXCEEDED`, `SF_LADDER_CODEC_UNSUPPORTED`, `SF_CDN_ORIGIN_TIMEOUT` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Test ก่อนขึ้นจริง", body: "logic ที่กระทบ bitrate ladder หรือ codec selection ต้องมี test ครอบคลุมอุปกรณ์กลุ่มที่ไม่รองรับ codec ใหม่เสมอก่อน merge — บทเรียนจาก {{ref:incident:bitrate-ladder-selector-wrong-codec}} คือ test ที่ไม่ครอบคลุม backward compatibility เจอ bug ไม่ทัน" },
        { heading: "Concurrent test", body: "ฟังก์ชันที่แตะการหยิบ job จากคิวต้องมี test จำลอง worker พร้อมกันอย่างน้อย 2 ตัวเสมอ" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw exception message ของ transcode library ออกไปตรงๆ" },
      ],
    },
    {
      slug: "codec-profile-naming-convention",
      title: "Codec Profile Naming Convention",
      tags: ["codec", "encoding", "naming"],
      intro: "เอกสารนี้กำหนดชื่อ profile ที่ใช้อ้างอิงร่วมกันระหว่าง {{ref:module:bitrate-ladder-selector}} และ {{ref:module:transcode-worker}} เพื่อไม่ให้สองฝั่งตีความ profile เดียวกันต่างกัน",
      sections: [
        { heading: "รูปแบบชื่อ", body: "`<codec>-<resolution>-<profile-level>` เช่น `h264-720p-main`, `hevc-1080p-main10` ตัวพิมพ์เล็กทั้งหมด คั่นด้วยขีดกลาง" },
        { heading: "กติกา", body: "profile ใหม่ที่ยังไม่ผ่านการทดสอบ compatibility กับอุปกรณ์กลุ่มหลักห้ามตั้งเป็น default ของ ladder จนกว่าจะผ่าน {{ref:convention:testing-convention}} ครบ" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (สำหรับ service ที่แตะ transcode/ladder) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:bitrate-ladder-selector}} และ {{ref:module:drm-license-server}} ต้องผ่าน integration test 100% ก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบการเล่นวิดีโอโดยตรง" },
      ],
    },
    {
      slug: "transcode-timeout-tuning",
      title: "Transcode & Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure (worker/connection) เท่านั้น ไม่ใช่ business retry ของ transcode job — ดูเรื่องนั้นที่ {{ref:policy:transcode-retry-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| Transcode stall timeout | 120s | env `TRANSCODE_STALL_TIMEOUT_MS` |\n| API gateway → transcode-worker | 10s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| Origin shield → object storage | 15s | env `ORIGIN_FETCH_TIMEOUT_MS` |\n| DRM license issuance | 3s | env `LICENSE_ISSUE_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "เดือนมิถุนายน 2026 พบว่า origin fetch timeout สั้นเกินไปสำหรับ segment ขนาดใหญ่ของ 4K content ทำให้ cache miss ถูกตัดก่อนโหลดเสร็จซ้ำๆ ขยับจาก 8s เป็น 15s แก้ปัญหาได้" },
      ],
    },
    {
      slug: "storage-migration-runbook",
      title: "Storage Tier Migration Runbook",
      tags: ["migration", "runbook", "storage"],
      sections: [
        { heading: "เมื่อไหร่ต้องทำ", body: "เมื่อ asset ไม่ถูกเข้าถึงเกิน 90 วัน จะถูกย้ายจาก storage tier แบบ hot ไป cold เพื่อลดค่าใช้จ่าย ต้อง migrate mapping ที่ {{ref:module:transcode-worker}} ดูแลให้ตรงกับ path ใหม่เสมอ" },
        { heading: "ขั้นตอน", body: "1) mark asset เป็น `migrating` ชั่วคราว (คำขอเล่นระหว่างนี้ fallback ไปดึงจาก tier เดิมก่อน) 2) copy ไฟล์ไป tier ใหม่ 3) verify checksum ตรงกัน 4) อัปเดต path ใน `renditions` แล้วลบไฟล์จาก tier เดิม" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = เล่นวิดีโอไม่ได้เป็นวงกว้างหรือ live event ล่ม, Sev2 = กระทบบาง feature/บาง publisher, Sev3 = กระทบเล็กน้อยไม่ถึงผู้ชมปลายทาง" },
        { heading: "กรณี live event", body: "incident ที่เกิดระหว่าง live event กำลังดำเนินอยู่ยกระดับเป็น Sev1 เสมอโดยอัตโนมัติไม่ว่าผลกระทบจริงจะเล็กแค่ไหน เพราะเวลาที่มีให้แก้ไขจำกัดกว่ากรณี VOD มาก" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "คิว transcode ของ live เกิน 80% ของกำลังผลิตปัจจุบัน, license issuance error rate เกิน 2% ใน 5 นาที, cache hit rate ของ origin shield ตกต่ำกว่า 90% กะทันหัน" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ transcode success rate ตกต่ำกว่า 95% หรือ license issuance error พุ่งขึ้นผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:bitrate-ladder-misconfig-buffering}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ software service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| transcode-worker | 4 | 40 | queue depth > 100 segment |\n| playlist-generator | 2 | 6 | CPU > 70% |\n| cdn-origin-shield | 2 | 12 | request rate > 5000 rps |\n| drm-license-server | 2 | 8 | CPU > 60% (เข้มกว่าที่อื่นเพราะ latency-sensitive) |" },
        { heading: "ข้อจำกัดเชิง cost", body: "transcode-worker ใช้ GPU instance ที่ราคาสูง scale เกินความจำเป็นกระทบต้นทุนตรงๆ — การ pre-scale ตาม {{ref:policy:live-event-scaling-policy}} จึงต้องแม่นยำ ไม่ scale ล่วงหน้าเผื่อเกินความจำเป็น" },
      ],
    },
    {
      slug: "cdn-cache-purge-runbook",
      title: "CDN Cache Purge Runbook",
      tags: ["cdn", "runbook", "cache"],
      intro: "ขั้นตอนสำหรับ purge cache เป็นวงกว้างตามที่กำหนดไว้ใน {{ref:policy:origin-shield-cache-policy}} และ {{ref:policy:content-takedown-policy}}",
      sections: [
        { heading: "Purge แบบเจาะจง asset", body: "ใช้ `purgeCache` ระบุ pattern ของ path เฉพาะ asset นั้น ใช้เวลากระจายไป edge node ทั้งหมดไม่เกิน 5 นาที" },
        { heading: "Purge แบบวงกว้าง (ทั้ง CDN)", body: "ต้องมีการอนุมัติจากหัวหน้าทีมก่อนเสมอ เพราะระหว่าง purge cache hit rate จะตกลงชั่วคราวและภาระตกไปที่ {{ref:module:cdn-origin-shield}} กับ origin จริงทันที ควรทำนอกช่วง primetime window เท่านั้น" },
      ],
    },
  ],
};
