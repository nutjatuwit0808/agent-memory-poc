import type { DomainProfile } from "../types.js";

// PulseFeed — ระบบจัดอันดับ feed โซเชียลมีเดีย (feed ranking / content moderation)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const socialFeed: DomainProfile = {
  id: "social-feed",
  displayName: "PulseFeed — ระบบจัดอันดับ Feed โซเชียล",
  summary: [
    "PulseFeed คือแพลตฟอร์มจัดอันดับเนื้อหาที่ผู้ใช้แต่ละคนจะเห็นบน feed หลัก โดยรวมสัญญาณจาก engagement (like, comment, share), ความสัมพันธ์กับผู้โพสต์ (follow graph), และคุณภาพเนื้อหา (moderation signal) เข้าด้วยกันเป็นคะแนนเดียวต่อโพสต์ต่อผู้ใช้ — ระบบไม่แสดง feed แบบเรียงตามเวลาโพสต์ตรงๆ อีกต่อไปตั้งแต่ปี 2024",
    "ทีมวิศวกรรมแบ่ง service ตามหน้าที่ชัดเจน ตั้งแต่ตัวคำนวณคะแนนจัดอันดับ ไปจนถึงระบบตรวจสอบเนื้อหาที่ผิดกฎ และระบบกระจายการแจ้งเตือนเมื่อมีโพสต์ใหม่ ช่วงที่ระบบรับภาระหนักที่สุดคือตอนมีเหตุการณ์ไวรัล (viral event) ที่คนโพสต์/แชร์เรื่องเดียวกันพร้อมกันเป็นแสนคนในเวลาไม่กี่นาที",
  ],
  domainTags: ["social-feed", "pulsefeed"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:feed-ranker}} เก็บแค่คะแนนที่คำนวณล่าสุดต่อคู่ (user, post) ส่วน {{ref:module:engagement-tracker}} เป็นเจ้าของ event ดิบทั้งหมด (like/comment/share) ไม่รู้จักคะแนนจัดอันดับเลย",
    "{{ref:module:content-moderation-service}} ทำงานแบบ async กับทุก service อื่น — โพสต์ใหม่ขึ้น feed ได้ทันทีก่อน moderation ตรวจเสร็จด้วยซ้ำ (optimistic publish) แล้วค่อยถอดออกทีหลังถ้าผิดกฎ เพราะการรอ moderation ก่อน publish ทุกโพสต์จะทำให้ latency ของการโพสต์แย่เกินยอมรับได้",
  ],
  apiGatewayNote: [
    "คำขอโหลด feed จาก mobile app เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งเรียก {{ref:module:feed-ranker}} เพื่อขอลิสต์โพสต์ที่จัดอันดับแล้ว คำขอที่ต้องการผลทันที เช่น เปิดแอปครั้งแรก ใช้ synchronous call ตรงนี้",
    "การ like/comment/share ส่งผ่าน gateway เดียวกันแต่ตอบกลับแบบ optimistic (บันทึกใน client ก่อน แล้ว sync เข้า {{ref:module:engagement-tracker}} แบบ async) เพื่อให้ interaction รู้สึกทันทีไม่มีดีเลย์",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:engagement-tracker}} ดูแล ได้แก่ `engagement_events` (event ดิบทุกตัวไม่ลบทิ้ง ใช้ retrain โมเดล), `engagement_dedup_keys` (กันนับซ้ำ), และ `daily_engagement_rollup`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `feed_scores` | feed-ranker | คะแนนต่อ (user, post) อายุไม่เกิน 6 ชั่วโมงก่อนต้องคำนวณใหม่ |\n| `engagement_events` | engagement-tracker | append-only ไม่มีการ update/delete |\n| `follow_edges` | follow-graph-service | adjacency list ทิศทางเดียว (follower → followee) |\n| `moderation_flags` | content-moderation-service | สถานะ pending/removed/appealed ต่อโพสต์ |",
    "ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวันแทน (เช่น เช็คว่าโพสต์ที่ถูก moderation ลบแล้วหลุดออกจาก feed_scores จริงไหม)",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `post.created`, `post.removed`, `engagement.recorded`, `follow.created`, `follow.removed` — {{ref:module:notification-fanout}} subscribe `post.created` เพื่อดันแจ้งเตือนให้ follower ทุกคน",
    "{{ref:module:feed-ranker}} subscribe `engagement.recorded` เพื่ออัปเดตคะแนนแบบ incremental แทนที่จะรอคำนวณใหม่ทั้งหมดทุกครั้ง — ออกแบบแบบนี้เพื่อให้ feed ตอบสนองต่อ engagement ใหม่ได้ไวโดยไม่ต้อง recompute เต็มรูปแบบทุกครั้ง",
  ],
  modules: [
    {
      slug: "feed-ranker",
      name: "feed-ranker",
      tags: ["ranking", "module", "core"],
      description:
        "คำนวณคะแนนจัดอันดับโพสต์ต่อผู้ใช้แต่ละคน รวมสัญญาณจาก engagement, ความสัมพันธ์ follow, และ moderation status เข้าด้วยกัน แยกออกมาเป็น service อิสระตั้งแต่ปี 2024 เพราะโมเดลจัดอันดับซับซ้อนขึ้นเรื่อยๆ จนต้อง deploy แยกจาก service อื่นเพื่อ scale ตามภาระ compute ที่ต่างกันมาก",
      functions: [
        { sig: "computeFeedScore(userId: string, postId: string): Promise<number>", desc: "คำนวณคะแนนของโพสต์เดียวสำหรับผู้ใช้คนเดียว" },
        { sig: "rankFeedPage(userId: string, cursor?: string): Promise<RankedPost[]>", desc: "คืนหน้า feed ที่จัดอันดับแล้วสำหรับการเลื่อนดูครั้งถัดไป" },
        { sig: "invalidateScore(userId: string, postId: string): Promise<void>", desc: "ล้างคะแนนที่ cache ไว้เมื่อมี engagement ใหม่เข้ามา" },
      ],
      stateFlow: "computed → cached (สูงสุด 6 ชั่วโมง) → stale → recomputed — ดู {{ref:policy:feed-ranking-refresh-policy}} สำหรับเงื่อนไขการ refresh",
      relatedNotes:
        "ไม่คุยกับ {{ref:module:content-moderation-service}} โดยตรง — รับแค่ moderation status ผ่าน field ที่ sync เข้ามาใน `feed_scores` table เพราะการเรียก synchronous ทุกครั้งที่จัดอันดับจะทำให้ latency แย่เกินไป",
      internals: {
        constants: [
          { name: "FEED_SCORE_CACHE_TTL_HOURS", value: "6" },
          { name: "FEED_PAGE_SIZE", value: "20" },
          { name: "MAX_RANKING_CANDIDATES", value: "500" },
        ],
        typeSnippet:
          "interface RankedPost {\n  postId: string;\n  score: number;\n  reason: \"engagement\" | \"following\" | \"trending\";\n  computedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule ที่ {{ref:policy:feed-ranking-refresh-policy}}",
      },
    },
    {
      slug: "content-moderation-service",
      name: "content-moderation-service",
      tags: ["moderation", "module", "core"],
      description:
        "ตรวจสอบโพสต์ใหม่ทุกตัวหาเนื้อหาที่ผิดกฎ (hate speech, spam, ภาพผิดกฎหมาย) ใช้ทั้ง automated model และ human review queue สำหรับเคสที่โมเดลไม่มั่นใจ ทำงานแบบ async หลังโพสต์ขึ้น feed แล้ว (optimistic publish) ไม่ใช่ gate ก่อนโพสต์",
      functions: [
        { sig: "scanPost(postId: string, content: PostContent): Promise<ModerationResult>", desc: "รันโมเดลตรวจสอบเนื้อหาอัตโนมัติ 1 ครั้ง" },
        { sig: "flagForReview(postId: string, confidence: number): Promise<void>", desc: "ส่งเข้าคิว human review เมื่อโมเดลไม่มั่นใจพอ" },
        { sig: "removePost(postId: string, reason: string): Promise<void>", desc: "ถอดโพสต์ออกจาก feed ทั้งหมดทันทีเมื่อยืนยันว่าผิดกฎ" },
      ],
      relatedNotes:
        "publish event `post.removed` เมื่อถอดโพสต์ — {{ref:module:feed-ranker}} subscribe event นี้เพื่อล้างคะแนนที่ cache ไว้ ดู {{ref:policy:content-moderation-escalation-policy}} สำหรับเกณฑ์ auto-remove vs ส่งคนตรวจ",
    },
    {
      slug: "engagement-tracker",
      name: "engagement-tracker",
      tags: ["engagement", "module", "core"],
      description:
        "บันทึก event การ like/comment/share ทุกตัวแบบ append-only เป็นแหล่งข้อมูลดิบสำหรับทั้งการจัดอันดับ feed และการ retrain โมเดลในอนาคต ไม่มี service ไหนอื่นเขียนลง event log นี้โดยตรง",
      functions: [
        { sig: "recordLike(userId: string, postId: string): Promise<void>", desc: "บันทึก like พร้อม dedup key กันนับซ้ำ" },
        { sig: "recordShare(userId: string, postId: string, targetContext: string): Promise<void>", desc: "บันทึกการแชร์พร้อมบริบทปลายทาง" },
        { sig: "getEngagementCount(postId: string): Promise<EngagementCount>", desc: "คืนจำนวน like/comment/share สะสมของโพสต์" },
      ],
      relatedNotes:
        "ไม่รู้จัก concept \"คะแนนจัดอันดับ\" เลย — แค่บันทึก event ดิบแล้ว publish `engagement.recorded` ให้ {{ref:module:feed-ranker}} เป็นคนตัดสินใจว่าจะปรับคะแนนยังไง เพื่อรักษาหลัก separation of concerns",
      internals: {
        constants: [
          { name: "ENGAGEMENT_DEDUP_WINDOW_MS", value: "2000" },
          { name: "MAX_SHARE_DEPTH_TRACKED", value: "3" },
        ],
        typeSnippet:
          "interface EngagementCount {\n  postId: string;\n  likes: number;\n  comments: number;\n  shares: number;\n  lastUpdated: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการกันนับซ้ำที่ {{ref:policy:engagement-dedup-policy}}",
      },
    },
    {
      slug: "notification-fanout",
      name: "notification-fanout",
      tags: ["notification", "module", "core"],
      description:
        "กระจายการแจ้งเตือนให้ follower ทุกคนเมื่อผู้ที่ตามอยู่โพสต์ใหม่ ต้องรับมือกับ fanout ขนาดใหญ่มากเมื่อผู้ใช้ที่มี follower หลักล้านคนโพสต์ ซึ่งเป็นจุดที่ระบบเจอ load spike รุนแรงที่สุดในทั้งแพลตฟอร์ม",
      functions: [
        { sig: "fanoutNewPost(authorId: string, postId: string): Promise<void>", desc: "เริ่มกระบวนการกระจายแจ้งเตือนให้ follower ทั้งหมด" },
        { sig: "enqueueNotificationBatch(followerIds: string[], postId: string): Promise<void>", desc: "แบ่ง follower เป็น batch เข้าคิวส่งจริง" },
        { sig: "dedupNotification(userId: string, postId: string): Promise<boolean>", desc: "เช็คว่าผู้ใช้คนนี้ได้รับแจ้งเตือนโพสต์นี้ไปแล้วหรือยัง" },
      ],
      stateFlow: "queued → batched → dispatched — batch ละ FANOUT_BATCH_SIZE คน ดู {{ref:policy:notification-fanout-rate-limit-policy}}",
      relatedNotes:
        "{{ref:module:follow-graph-service}} เป็นคนบอกว่าใครคือ follower ของใคร fanout ไม่เก็บ follow graph ซ้ำเอง แค่ query ทุกครั้งที่ต้องกระจาย เพื่อให้ได้ข้อมูลล่าสุดเสมอ",
      internals: {
        constants: [
          { name: "FANOUT_BATCH_SIZE", value: "1000" },
          { name: "CELEBRITY_FOLLOWER_THRESHOLD", value: "100000" },
        ],
        typeSnippet:
          "interface FanoutJob {\n  jobId: string;\n  authorId: string;\n  postId: string;\n  totalFollowers: number;\n  dispatchedCount: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง rate limit ที่ {{ref:policy:notification-fanout-rate-limit-policy}}",
      },
    },
    {
      slug: "trending-topic-detector",
      name: "trending-topic-detector",
      tags: ["trending", "module"],
      description:
        "ตรวจจับ hashtag/หัวข้อที่กำลังถูกพูดถึงเยอะผิดปกติในช่วงเวลาสั้นๆ เทียบกับ baseline ปกติของหัวข้อนั้น เพื่อดันขึ้นแสดงในส่วน trending ของแอป ทำงานเป็น background job ไม่ได้อยู่บน critical path ของการโหลด feed",
      functions: [
        { sig: "computeTrendingScore(topicId: string, windowMinutes: number): Promise<number>", desc: "คำนวณคะแนนความ trending เทียบกับ baseline" },
        { sig: "refreshTrendingList(): Promise<TrendingTopic[]>", desc: "รีเฟรชรายการ trending ทั้งหมด รันทุก 10 นาที" },
        { sig: "suppressTopic(topicId: string, reason: string): Promise<void>", desc: "ระงับหัวข้อที่ trending ผิดปกติ (สงสัยว่าถูกปั่น)" },
      ],
      relatedNotes:
        "ไม่รู้จักสถานะ moderation ของโพสต์แต่ละอัน (ดู {{ref:arch:boundaries}}) — ใช้แค่จำนวนการพูดถึงดิบจาก {{ref:module:engagement-tracker}} เป็นหลัก ดู {{ref:policy:trending-topic-decay-policy}} สำหรับการลดคะแนนตามเวลา",
    },
    {
      slug: "follow-graph-service",
      name: "follow-graph-service",
      tags: ["follow", "module"],
      description:
        "เก็บความสัมพันธ์ follow/follower ทั้งหมดของแพลตฟอร์ม เป็น service เดียวที่รู้ว่าใคร follow ใคร service อื่นทั้งหมดที่ต้องการข้อมูลนี้ต้อง query ผ่านตัวนี้เท่านั้น ไม่มีการ cache follow graph ซ้ำใน service อื่น",
      functions: [
        { sig: "follow(followerId: string, followeeId: string): Promise<FollowResult>", desc: "สร้างความสัมพันธ์ follow ใหม่ อาจต้องรออนุมัติถ้าบัญชี private" },
        { sig: "unfollow(followerId: string, followeeId: string): Promise<void>", desc: "ยกเลิกการ follow" },
        { sig: "getFollowers(userId: string, cursor?: string): Promise<string[]>", desc: "คืนรายการ follower แบบแบ่งหน้า" },
      ],
      stateFlow: "requested → approved | rejected (สำหรับบัญชี private) หรือ approved ทันทีสำหรับบัญชี public — ดู {{ref:policy:follow-request-privacy-policy}}",
      relatedNotes:
        "{{ref:module:notification-fanout}} query `getFollowers` ทุกครั้งที่ต้องกระจายแจ้งเตือน ไม่เก็บ snapshot ไว้เอง เพื่อให้ fanout ใช้ follow graph เวอร์ชันล่าสุดเสมอแม้ follower จะเพิ่ง unfollow ไปหมาดๆ",
    },
  ],
  envVarGroups: [
    {
      service: "feed-ranker-service",
      vars: [
        { name: "FEED_SCORE_CACHE_TTL_HOURS", example: "6", note: "ดู {{ref:policy:feed-ranking-refresh-policy}}" },
        { name: "FEED_PAGE_SIZE", example: "20", note: "" },
        { name: "MAX_RANKING_CANDIDATES", example: "500", note: "จำนวนโพสต์สูงสุดที่พิจารณาต่อการจัดอันดับ 1 ครั้ง" },
      ],
    },
    {
      service: "notification-fanout-service",
      vars: [
        { name: "FANOUT_BATCH_SIZE", example: "1000", note: "" },
        { name: "CELEBRITY_FOLLOWER_THRESHOLD", example: "100000", note: "เกินนี้เข้า throttling พิเศษ ดู {{ref:policy:notification-fanout-rate-limit-policy}}" },
        { name: "FANOUT_QUEUE_URL", example: "amqp://fanout-queue.internal:5672", note: "secret ห้าม log" },
      ],
    },
    {
      service: "content-moderation-service",
      vars: [
        { name: "MODERATION_AUTO_REMOVE_THRESHOLD", example: "0.95", note: "confidence ที่ auto-remove ได้เลยไม่ต้องรอคนตรวจ" },
        { name: "MODERATION_REVIEW_QUEUE_MAX_DEPTH", example: "2000", note: "" },
      ],
    },
    {
      service: "follow-graph-service",
      vars: [
        { name: "FOLLOW_GRAPH_DB_URL", example: "postgres://follow-db.internal:5432/follow", note: "secret ห้าม log" },
        { name: "PRIVATE_ACCOUNT_APPROVAL_TIMEOUT_HOURS", example: "72", note: "ดู {{ref:policy:follow-request-privacy-policy}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "feed-ranking-refresh-policy",
      title: "นโยบายการ Refresh คะแนนจัดอันดับ Feed",
      tags: ["ranking", "policy"],
      isPrimary: true,
      intro: [
        "คะแนนจัดอันดับที่ {{ref:module:feed-ranker}} คำนวณไว้จะถูก cache ไว้สูงสุด `FEED_SCORE_CACHE_TTL_HOURS` ชั่วโมง หลังจากนั้นถือว่า stale และต้องคำนวณใหม่ก่อนแสดงให้ผู้ใช้",
        "เมื่อมี engagement ใหม่เข้ามา (like/comment/share) คะแนนจะถูก invalidate และคำนวณใหม่แบบ incremental ทันที ไม่ต้องรอครบ TTL เสมอไป",
      ],
      sections: [
        {
          heading: "ทำไมต้อง cache แทนคำนวณสด",
          body: "การคำนวณคะแนนจัดอันดับทุกครั้งที่ผู้ใช้เปิดแอปมีต้นทุน compute สูงมากเพราะต้องพิจารณาผู้สมัครหลายร้อยโพสต์พร้อมกัน — cache ไว้ระยะสั้นแล้ว invalidate เฉพาะจุดที่เปลี่ยนจริงคุ้มกว่าคำนวณสดทุกครั้งมาก",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นของนโยบาย Refresh คะแนน",
        tags: ["ranking", "edge-case"],
        body: [
          "ถ้าโพสต์ถูก moderation ถอดออก (`post.removed`) คะแนนของโพสต์นั้นถูก invalidate ทันทีในทุกผู้ใช้ที่เคย cache ไว้ ไม่รอ TTL หมดอายุตามปกติ เพราะการแสดงโพสต์ที่ถูกลบไปแล้วเป็นปัญหาที่ยอมรับไม่ได้",
          "ผู้ใช้ที่เพิ่งสมัครใหม่ (ยังไม่มี engagement history) จะได้คะแนนจากโมเดล cold-start แยกต่างหากที่ให้น้ำหนัก trending topic มากกว่าปกติ แทนที่จะใช้สูตรเดียวกับผู้ใช้ทั่วไปที่ engagement history ไม่พอให้โมเดลหลักทำงานได้ดี",
        ],
      },
    },
    {
      slug: "content-moderation-escalation-policy",
      title: "นโยบายการยกระดับการตรวจสอบเนื้อหา",
      tags: ["moderation", "policy"],
      isPrimary: true,
      intro: [
        "โพสต์ที่ {{ref:module:content-moderation-service}} ตรวจแล้วได้ confidence สูงกว่า `MODERATION_AUTO_REMOVE_THRESHOLD` ว่าผิดกฎ จะถูกถอดออกอัตโนมัติทันทีโดยไม่ต้องรอคนตรวจ",
        "โพสต์ที่ confidence อยู่ระหว่าง 0.5-0.95 จะถูกส่งเข้าคิว human review — ระหว่างรอตรวจยังคงแสดงบน feed ปกติ (optimistic publish) เว้นแต่มีการ report จากผู้ใช้จำนวนมากพร้อมกัน",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อคิว Human Review ล้น",
        tags: ["moderation", "edge-case"],
        body: [
          "ถ้าคิว human review ลึกเกิน `MODERATION_REVIEW_QUEUE_MAX_DEPTH` ระบบจะลด threshold auto-remove ลงชั่วคราว (จาก 0.95 เป็น 0.85) เพื่อลดจำนวนโพสต์ที่ค้างรอคนตรวจ ยอมรับ false positive เพิ่มขึ้นเล็กน้อยเพื่อแลกกับการกำจัดเนื้อหาผิดกฎเร็วขึ้นตอนคิวล้น",
          "โพสต์ที่เกี่ยวข้องกับความปลอดภัยของบุคคล (เช่น การขู่ทำร้าย) ไม่เข้าเงื่อนไขลด threshold นี้ ยังคงต้องผ่านเกณฑ์ปกติเสมอเพราะความเสี่ยงสูงเกินกว่าจะยอมรับ false positive เพิ่ม",
        ],
      },
    },
    {
      slug: "engagement-dedup-policy",
      title: "นโยบายการกันนับ Engagement ซ้ำ",
      tags: ["engagement", "policy"],
      isPrimary: true,
      intro: [
        "การ like/comment/share ที่มาจาก user คนเดียวกันบนโพสต์เดียวกันภายใน `ENGAGEMENT_DEDUP_WINDOW_MS` มิลลิวินาที จะถูกนับเป็น event เดียวเท่านั้น ป้องกันการนับซ้ำจากการแตะปุ่มถี่ๆ หรือ retry ของ client",
        "dedup key ประกอบจาก (userId, postId, actionType, timeWindow) — ไม่ใช่แค่ (userId, postId) เพราะ user คนเดียวกัน like แล้ว unlike แล้ว like ใหม่ในโพสต์เดียวกันถือเป็น event คนละตัวได้ถ้าห่างกันเกิน window",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อเกิด Network Retry ซ้อนกันหลายรอบ",
        tags: ["engagement", "edge-case"],
        body: [
          "ถ้า client retry request เดิมซ้ำเกิน 3 ครั้งภายใน dedup window (สังเกตจาก request ID เดียวกัน) ระบบจะถือว่าเป็น network issue ไม่ใช่ user action จริง และไม่นับ engagement เพิ่มแม้แต่ครั้งเดียวจาก batch retry นั้น",
          "share ที่มาจาก third-party integration (เช่น bot แชร์อัตโนมัติ) ไม่เข้าเงื่อนไข dedup แบบ user ทั่วไป — ถูกนับแยกต่างหากด้วย rate limit ของตัวเองเพื่อไม่ให้ปนกับ engagement จริงของมนุษย์",
        ],
      },
    },
    {
      slug: "notification-fanout-rate-limit-policy",
      title: "นโยบาย Rate Limit การกระจายแจ้งเตือน",
      tags: ["notification", "policy"],
      isPrimary: true,
      intro: [
        "ผู้ใช้ที่มี follower เกิน `CELEBRITY_FOLLOWER_THRESHOLD` คน จะถูกจัดเป็น celebrity tier — การ fanout แจ้งเตือนของโพสต์จากบัญชีกลุ่มนี้จะถูกกระจายเป็น batch ที่ควบคุมอัตราเข้าคิวแยกต่างหาก ไม่ยิงพร้อมกันทั้งหมด",
        "batch ปกติมีขนาด `FANOUT_BATCH_SIZE` คน แต่ละ batch ห่างกันด้วย delay สั้นๆ เพื่อไม่ให้ downstream (push notification provider ภายนอก) โดน rate limit จนบล็อกทั้งระบบ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อเป็นเหตุการณ์ไวรัลข้ามผู้ใช้หลายคนพร้อมกัน",
        tags: ["notification", "edge-case"],
        body: [
          "ถ้าตรวจพบว่ามีหลาย celebrity account โพสต์เรื่องเดียวกันพร้อมกัน (viral event) ระบบจะรวม fanout job ที่ทับซ้อนกันของ follower คนเดียวกันเป็น notification เดียว ไม่ส่งซ้ำหลายครั้งในเวลาไล่เลี่ยกัน เพื่อลดความรำคาญของผู้ใช้",
          "ในช่วง viral event ระบบยอมให้ delay การส่งแจ้งเตือนนานขึ้นกว่าปกติ (จากไม่กี่วินาทีเป็นหลักนาที) เพื่อรักษาความเสถียรของระบบ fanout โดยรวม แทนที่จะพยายามส่งทันทีจนระบบล่ม",
        ],
      },
    },
    {
      slug: "trending-topic-decay-policy",
      title: "นโยบายการลดคะแนน Trending ตามเวลา",
      tags: ["trending", "policy"],
      isPrimary: true,
      intro: [
        "คะแนน trending ของแต่ละหัวข้อจะลดลงแบบ exponential decay ตามเวลาที่ผ่านไปนับจากจุดที่คะแนนสูงสุด ป้องกันไม่ให้หัวข้อที่เคย trending ค้างอยู่ในรายการนานเกินไปทั้งที่คนไม่พูดถึงแล้ว",
        "หัวข้อที่ engagement ตกลงติดต่อกันเกิน 30 นาที จะถูกถอดออกจากรายการ trending ทันทีแม้คะแนนสะสมจะยังสูงอยู่ก็ตาม",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับหัวข้อเหตุการณ์ด่วน (Breaking News)",
        tags: ["trending", "edge-case"],
        body: [
          "หัวข้อที่ถูก flag ว่าเป็น breaking news (จากแหล่งข่าวที่ยืนยันแล้ว) จะใช้อัตรา decay ที่ช้ากว่าปกติ 3 เท่า เพราะเหตุการณ์สำคัญมักมีช่วงเงียบสั้นๆ ระหว่างที่รอข้อมูลเพิ่มเติมก่อนจะกลับมาถูกพูดถึงอีกครั้ง ไม่ควรถูกถอดออกเร็วเกินไป",
          "หัวข้อที่สงสัยว่าถูกปั่นด้วย bot network (ดู {{ref:policy:duplicate-post-detection-policy}}) จะถูก suppress ทันทีไม่ว่าคะแนน decay จะเป็นเท่าไหร่ ไม่รอให้ decay ตามธรรมชาติเพราะเป็นการบิดเบือนที่ตั้งใจ ไม่ใช่ความสนใจจริงของผู้ใช้",
        ],
      },
    },
    {
      slug: "follow-request-privacy-policy",
      title: "นโยบายการอนุมัติคำขอ Follow บัญชี Private",
      tags: ["follow", "privacy", "policy"],
      isPrimary: true,
      intro: [
        "คำขอ follow บัญชี private ต้องรอเจ้าของบัญชีอนุมัติด้วยมือเสมอ ไม่มีการอนุมัติอัตโนมัติไม่ว่ากรณีใด ต่างจากบัญชี public ที่ follow สำเร็จทันที",
        "คำขอที่ไม่ได้รับการตอบสนองภายใน `PRIVATE_ACCOUNT_APPROVAL_TIMEOUT_HOURS` ชั่วโมงจะหมดอายุอัตโนมัติ ผู้ขอต้องส่งคำขอใหม่ถ้ายังสนใจ ไม่ค้างอยู่ในสถานะ pending ตลอดไป",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อผู้ขอเคย Follow มาก่อนแล้ว Unfollow",
        tags: ["follow", "edge-case"],
        body: [
          "ถ้าผู้ขอเคย follow บัญชีนี้สำเร็จมาก่อนแล้ว unfollow เอง และส่งคำขอใหม่ภายใน 24 ชั่วโมง ระบบจะอนุมัติอัตโนมัติทันทีโดยไม่ต้องรอเจ้าของบัญชี เพราะถือว่าเคยผ่านการอนุมัติมาแล้วในช่วงเวลาใกล้กัน",
          "ถ้าเจ้าของบัญชี block ผู้ขอไปแล้วในอดีต ข้อยกเว้นข้างต้นจะไม่มีผลเลย ต้องผ่านการอนุมัติด้วยมือเสมอไม่ว่าจะเคย follow มาก่อนแค่ไหน เพราะการ block เป็นสัญญาณที่ชัดเจนกว่าประวัติการ follow เก่า",
        ],
      },
    },
    {
      slug: "shadow-ban-policy",
      title: "นโยบาย Shadow Ban",
      tags: ["moderation", "policy"],
      isPrimary: false,
      intro: [
        "บัญชีที่ถูก flag ซ้ำๆ จากการตรวจสอบอัตโนมัติแต่ยังไม่ถึงเกณฑ์ระงับบัญชีถาวร จะถูก shadow ban — โพสต์ของบัญชีนี้ยังคงแสดงให้เจ้าของเห็นตามปกติ แต่ไม่ถูกจัดอันดับขึ้น feed ของคนอื่นเลย",
        "การ shadow ban ไม่แจ้งให้เจ้าของบัญชีทราบโดยตรง เพื่อลดโอกาสที่บัญชีสแปมจะปรับพฤติกรรมหลบเลี่ยงการตรวจจับ",
      ],
    },
    {
      slug: "duplicate-post-detection-policy",
      title: "นโยบายตรวจจับโพสต์ซ้ำ/บอทปั่นเนื้อหา",
      tags: ["moderation", "bot", "policy"],
      isPrimary: false,
      intro: [
        "โพสต์ที่มีเนื้อหาเหมือนกันเกิน 90% จากบัญชีหลายบัญชีที่สร้างในช่วงเวลาใกล้กัน จะถูก flag ว่าน่าสงสัยว่าเป็น bot network และลดคะแนนการจัดอันดับลงทันที",
        "การตัดสินใจ suppress ถาวรยังต้องผ่านการยืนยันจากทีม trust & safety ไม่ใช่ระบบอัตโนมัติล้วนๆ เพื่อลดความเสี่ยงที่จะแบนเนื้อหาจริงที่บังเอิญคล้ายกัน (เช่น meme ที่คนแชร์ต่อกันเยอะ)",
      ],
    },
    {
      slug: "feed-diversity-policy",
      title: "นโยบายความหลากหลายของ Feed",
      tags: ["ranking", "policy"],
      isPrimary: false,
      intro: [
        "feed ของผู้ใช้แต่ละคนจะไม่แสดงโพสต์จากผู้เขียนคนเดียวกันเกิน 2 โพสต์ติดกัน แม้คะแนนของผู้เขียนคนนั้นจะสูงกว่าคนอื่นมากก็ตาม เพื่อไม่ให้ feed ถูกบัญชีเดียวครองพื้นที่",
        "กฎนี้ใช้เฉพาะ organic post ปกติ ไม่รวมโพสต์ที่ผู้ใช้กำหนดเองว่าอยากเห็นบัญชีนั้นเป็นพิเศษ (close friends list)",
      ],
    },
    {
      slug: "block-list-enforcement-policy",
      title: "นโยบายการบังคับใช้ Block List",
      tags: ["safety", "policy"],
      isPrimary: false,
      intro: [
        "ผู้ใช้ที่ถูก block จะไม่เห็นโพสต์ของผู้ block และไม่สามารถ follow/comment ได้ทันทีที่ block มีผล ระบบ propagate การ block ไปทุก service ที่เกี่ยวข้องภายใน 5 วินาที",
        "การ unblock ไม่คืนสถานะ follow เดิมอัตโนมัติ — ถ้าเคย follow กันมาก่อน block ต้องส่งคำขอ follow ใหม่หลัง unblock",
      ],
    },
    {
      slug: "reported-content-priority-policy",
      title: "นโยบายลำดับความสำคัญเนื้อหาที่ถูก Report",
      tags: ["moderation", "policy"],
      isPrimary: false,
      intro: [
        "โพสต์ที่ถูก report จากผู้ใช้หลายคนไม่ซ้ำกันภายในเวลาสั้นๆ จะถูกดันขึ้นไปอยู่หัวคิว human review ทันที แซงหน้าโพสต์ที่รอ review อยู่ก่อน",
        "report จากบัญชีที่เพิ่งสร้างใหม่ (อายุน้อยกว่า 7 วัน) มีน้ำหนักน้อยกว่า report จากบัญชีเก่า เพื่อลดความเสี่ยงจากการรวมหัว report กลั่นแกล้งกัน",
      ],
    },
  ],
  incidents: [
    {
      slug: "feed-ranker-cache-poisoning",
      title: "Feed แสดงคะแนนเก่าค้างหลังอัปเดตโมเดล",
      tags: ["ranking", "cache"],
      summary:
        "หลังทีม data science deploy โมเดลจัดอันดับเวอร์ชันใหม่ ผู้ใช้จำนวนมากยังเห็น feed ที่ดูเหมือนใช้โมเดลเก่าอยู่นานกว่า 6 ชั่วโมงหลัง deploy",
      investigation:
        "ตรวจ {{ref:module:feed-ranker}} พบว่า cache key ของ `feed_scores` ไม่ได้รวม version ของโมเดลไว้ด้วย ทำให้คะแนนที่คำนวณจากโมเดลเก่ายังถูกอ่านซ้ำจนกว่า TTL 6 ชั่วโมงจะหมดอายุตามปกติ",
      cause:
        "ตอนออกแบบ cache key คิดว่าโมเดลจะไม่เปลี่ยนบ่อยจนต้อง invalidate ทันที แต่ทีม data science เริ่ม deploy โมเดลใหม่บ่อยขึ้นในช่วงหลังโดยไม่มีใครแก้ cache key ให้รองรับ",
      resolution:
        "เพิ่ม model version เข้าไปใน cache key แล้ว force invalidate cache ทั้งหมดด้วยมือหลัง deploy โมเดลใหม่ครั้งนี้ feed กลับมาสะท้อนโมเดลใหม่ภายใน 10 นาที",
      followup:
        "เพิ่มขั้นตอน invalidate cache อัตโนมัติเป็นส่วนหนึ่งของ deploy pipeline ของทีม data science ไม่ต้องพึ่งให้จำได้เอง",
    },
    {
      slug: "fanout-storm-celebrity-post",
      title: "โพสต์จาก Celebrity ทำคิว Fanout ล่มชั่วคราว",
      tags: ["notification", "fanout"],
      summary:
        "บัญชีที่มี follower 12 ล้านคนโพสต์พร้อมกันช่วงเวลาไล่เลี่ยกับ celebrity อีก 2 คน ทำให้คิว {{ref:module:notification-fanout}} ค้างจนแจ้งเตือนช้าไปเกือบ 40 นาที",
      investigation:
        "เช็ค {{ref:deployment:monitoring-alerts}} พบว่า fanout job ทั้งสามงานถูกประมวลผลพร้อมกันโดยไม่มีการจัดคิวลำดับความสำคัญ ทำให้ worker pool ถูกใช้เต็มจากงานเดียวทั้งหมด",
      cause:
        "{{ref:policy:notification-fanout-rate-limit-policy}} ควบคุม rate ภายในงานเดียว แต่ไม่ได้ควบคุมจำนวนงาน celebrity tier ที่รันพร้อมกันได้สูงสุดกี่งาน ทำให้สามงานชนกันแย่ง resource",
      resolution:
        "วิศวกร on-call เพิ่ม worker ชั่วคราวและจำกัดให้ celebrity fanout job รันพร้อมกันได้สูงสุด 1 งานต่อครั้ง งานที่เหลือรอคิวแทน คิวกลับมาปกติภายใน 45 นาที",
      followup:
        "ปรับ {{ref:policy:notification-fanout-rate-limit-policy}} ให้จำกัดจำนวน celebrity fanout job พร้อมกันอย่างเป็นทางการ ไม่ใช่แค่แก้ชั่วคราวตอน incident",
    },
    {
      slug: "moderation-false-positive-spike",
      title: "โมเดลตรวจสอบเนื้อหาเวอร์ชันใหม่ Flag เนื้อหาปกติจำนวนมาก",
      tags: ["moderation", "false-positive"],
      summary:
        "หลัง deploy โมเดล moderation เวอร์ชันใหม่ อัตราการถอดโพสต์อัตโนมัติพุ่งขึ้น 8 เท่าในเวลาไม่ถึงชั่วโมง ผู้ใช้จำนวนมากร้องเรียนว่าโพสต์ปกติถูกลบ",
      investigation:
        "ตรวจสอบ {{ref:module:content-moderation-service}} พบว่าโมเดลใหม่ให้ confidence สูงผิดปกติกับโพสต์ที่มีคำแสลงบางคำ ทั้งที่บริบทไม่ได้ผิดกฎเลย",
      cause:
        "ข้อมูล training set ของโมเดลใหม่ไม่ได้ครอบคลุมบริบทการใช้คำแสลงในเชิงบวก/ตลกขบขันมากพอ ทำให้โมเดลเรียนรู้ pattern แบบ keyword matching มากกว่าเข้าใจบริบทจริง",
      resolution:
        "rollback กลับไปใช้โมเดลเวอร์ชันก่อนหน้าทันทีตาม {{ref:deployment:rollback-procedure}} แล้วคืนสถานะโพสต์ที่ถูกลบผิดพลาดทั้งหมดด้วยมือ",
      followup:
        "เพิ่มขั้นตอน canary deployment สำหรับโมเดล moderation ทุกเวอร์ชันใหม่ ทดสอบกับ traffic เพียง 1% ก่อนขยายเต็ม แทนที่จะ deploy เต็มทันที",
    },
    {
      slug: "engagement-double-count-bug",
      title: "Like ถูกนับซ้ำจาก Retry Logic ของ Client",
      tags: ["engagement", "bug"],
      summary:
        "ทีม data science สังเกตว่าจำนวน like ของโพสต์บางกลุ่มสูงผิดปกติเทียบกับ comment/share ที่ proportion ปกติ",
      investigation:
        "ตรวจ {{ref:module:engagement-tracker}} พบว่า mobile app เวอร์ชันใหม่มี retry logic ที่ยิง request like ซ้ำถ้าไม่ได้ response ภายใน 500ms โดยไม่ส่ง request ID เดิมมาด้วย",
      cause:
        "dedup key ของ {{ref:policy:engagement-dedup-policy}} ออกแบบมาให้ใช้ request ID เป็นหลัก แต่ client เวอร์ชันใหม่ generate request ID ใหม่ทุกครั้งที่ retry แทนที่จะใช้ตัวเดิม ทำให้ dedup ไม่ทำงาน",
      resolution:
        "แก้ mobile app ให้ retry ด้วย request ID เดิมเสมอ (hotfix เร่งด่วน) พร้อมรัน job แก้ไขจำนวน like ที่นับซ้ำย้อนหลังในช่วงที่ได้รับผลกระทบ",
      followup:
        "เพิ่ม fallback dedup ฝั่ง server โดยใช้ (userId, postId, timestamp window) ควบคู่กับ request ID ไม่พึ่ง client ส่ง ID ที่ถูกต้องมาเพียงอย่างเดียว",
    },
    {
      slug: "trending-topic-manipulation",
      title: "เครือข่ายบอทปั่นหัวข้อ Trending สำเร็จชั่วคราว",
      tags: ["trending", "bot"],
      summary:
        "หัวข้อหนึ่งขึ้น trending อันดับ 1 ทั้งที่เป็นเรื่องเฉพาะกลุ่มเล็กมาก ทีม trust & safety สงสัยว่าถูกปั่นตั้งแต่ต้น",
      investigation:
        "ตรวจสอบ {{ref:module:trending-topic-detector}} พบว่าบัญชีที่พูดถึงหัวข้อนี้กว่า 70% สร้างขึ้นภายใน 48 ชั่วโมงที่ผ่านมาและมี pattern การโพสต์ที่เหมือนกันมาก",
      cause:
        "{{ref:policy:trending-topic-decay-policy}} ยังไม่มีเงื่อนไขตรวจสอบความหลากหลายของบัญชีที่พูดถึงหัวข้อ (account diversity) ให้น้ำหนักกับปริมาณการพูดถึงดิบเท่านั้น",
      resolution:
        "suppress หัวข้อนี้ด้วยมือทันทีตาม {{ref:policy:duplicate-post-detection-policy}} และระงับบัญชีที่เกี่ยวข้องเพื่อรอการตรวจสอบเพิ่มเติม",
      followup:
        "เพิ่มเงื่อนไข account diversity เข้าสูตรคำนวณ trending score อย่างเป็นทางการ ไม่ใช่แค่นับปริมาณการพูดถึงดิบอย่างเดียว",
    },
    {
      slug: "follow-graph-deadlock",
      title: "คำขอ Follow วนกันเป็นวงจรทำ Service ค้าง",
      tags: ["follow", "deadlock"],
      summary:
        "ผู้ใช้กลุ่มหนึ่งรายงานว่าคำขอ follow บัญชี private ไม่เคยได้รับการอนุมัติหรือปฏิเสธเลย ค้างอยู่ในสถานะ pending ตลอด",
      investigation:
        "ตรวจ {{ref:module:follow-graph-service}} พบว่ามีการ import ข้อมูล follow เก่าจากระบบเดิมที่สร้างวงจร follow request แบบ circular โดยไม่ตั้งใจ ทำให้ job แจ้งเตือนเจ้าของบัญชีวนลูปไม่จบ",
      cause:
        "script import ข้อมูลไม่ได้ validate ว่าคำขอ follow ที่ import เข้ามาสร้างวงจรกับข้อมูลที่มีอยู่แล้วหรือไม่ ปล่อยให้ข้อมูลที่ผิดปกติเข้าระบบได้",
      resolution:
        "เขียน script ตรวจหาวงจร follow request ที่ผิดปกติทั้งหมดแล้วล้างด้วยมือ ผู้ใช้ที่ได้รับผลกระทบต้องส่งคำขอ follow ใหม่",
      followup:
        "เพิ่ม cycle detection เข้า script import ข้อมูลทุกครั้งในอนาคต ไม่ปล่อยให้ข้อมูลที่สร้างวงจรเข้าระบบได้อีก",
    },
    {
      slug: "notification-duplicate-spam",
      title: "ผู้ใช้ได้รับแจ้งเตือนโพสต์เดียวกันซ้ำหลายครั้ง",
      tags: ["notification", "bug"],
      summary:
        "ผู้ใช้จำนวนหนึ่งร้องเรียนว่าได้รับแจ้งเตือนโพสต์เดียวกันจากคนเดียวกันซ้ำ 4-5 ครั้งในเวลาไม่กี่นาที",
      investigation:
        "ตรวจ `dedupNotification` ใน {{ref:module:notification-fanout}} พบว่า dedup key ชนกันเมื่อ fanout job เดิมถูกแบ่งเป็นหลาย batch ที่รันพร้อมกันบน worker คนละตัว",
      cause:
        "dedup check อ่านและเขียนสถานะแบบไม่ atomic ระหว่าง worker คนละตัว ทำให้สอง batch ที่มี follower คนเดียวกันซ้ำกันโดยบังเอิญต่างก็ผ่านการเช็ค dedup ไปพร้อมกัน",
      resolution:
        "แก้ dedup check ให้ใช้ atomic operation ระดับ database แทนการอ่านแล้วเขียนแยกกัน deploy เป็น hotfix",
      followup:
        "ตรวจสอบ batch อื่นใน {{ref:module:notification-fanout}} ที่มี pattern คล้ายกันว่ามีความเสี่ยง race condition เดียวกันหรือไม่",
    },
    {
      slug: "shadow-ban-leak",
      title: "ผู้ใช้ที่ถูก Shadow Ban สังเกตความผิดปกติจากเพื่อน",
      tags: ["moderation", "privacy"],
      summary:
        "ผู้ใช้ที่ถูก shadow ban ตาม {{ref:policy:shadow-ban-policy}} เริ่มสงสัยเพราะเพื่อนบอกว่าไม่เห็นโพสต์เลย ทั้งที่ตัวเองเห็นโพสต์ของตัวเองปกติทุกอย่าง",
      investigation:
        "ตรวจสอบพบว่าจำนวน like/comment ที่แสดงให้เจ้าของบัญชีเห็นยังคงนับรวม engagement จริงจากคนอื่นตามปกติ ทำให้เจ้าของบัญชีสังเกตความผิดปกติได้จากตัวเลขที่ไม่สอดคล้องกับสิ่งที่เพื่อนบอก",
      cause:
        "ตอนออกแบบ shadow ban ไม่ได้พิจารณาว่าตัวเลข engagement ที่แสดงเป็น side channel ที่เผยพฤติกรรม shadow ban ได้โดยไม่ตั้งใจ",
      resolution:
        "ไม่มีการแก้ไขทันทีเพราะเป็นพฤติกรรมที่ยอมรับได้ตามการออกแบบเดิม แต่บันทึกเป็นข้อสังเกตสำหรับทีม trust & safety พิจารณาต่อ",
      followup:
        "ทีมพิจารณาว่าจะปรับให้ตัวเลข engagement ที่เจ้าของบัญชี shadow-banned เห็นสอดคล้องกับสิ่งที่คนอื่นเห็นจริงมากขึ้นหรือไม่ ยังไม่มีข้อสรุป",
    },
    {
      slug: "feed-ranker-timeout-cascade",
      title: "Feed-ranker Timeout ทำแอปโหลดไม่ขึ้นทั้งระบบ",
      tags: ["ranking", "timeout"],
      summary:
        "ผู้ใช้จำนวนมากรายงานว่าเปิดแอปแล้วหน้า feed โหลดไม่ขึ้นเลยนานเกือบ 20 นาทีช่วงเย็นวันหนึ่ง",
      investigation:
        "ตรวจ {{ref:module:feed-ranker}} พบว่า database connection pool เต็มเนื่องจากมี query ช้าผิดปกติค้างอยู่จำนวนมาก ทำให้ request ใหม่ต้องรอ connection จนเกิน timeout ของ API gateway",
      cause:
        "query ที่ช้าเกิดจาก index ที่หายไปหลัง migration schema เมื่อคืนก่อนหน้า ทำให้ query ที่เคยเร็วกลายเป็น full table scan โดยไม่มีใครสังเกตในการทดสอบก่อน deploy",
      resolution:
        "เพิ่ม index ที่หายไปกลับเข้าไปแบบ `CREATE INDEX CONCURRENTLY` ไม่ล็อกตาราง แก้ปัญหาได้ภายใน 10 นาทีหลัง index สร้างเสร็จ",
      followup:
        "เพิ่มการตรวจสอบ query plan อัตโนมัติใน {{ref:deployment:ci-cd-pipeline}} ก่อน migration schema ทุกครั้งที่แตะตารางหลัก",
    },
    {
      slug: "content-moderation-queue-overflow",
      title: "คิว Human Review ล้นช่วงเหตุการณ์ไวรัลระดับโลก",
      tags: ["moderation", "capacity"],
      summary:
        "ช่วงมีเหตุการณ์ข่าวใหญ่ระดับโลก ปริมาณโพสต์ใหม่พุ่งขึ้น 15 เท่า ทำให้คิว human review ล้นจนเนื้อหาที่ผิดกฎค้างแสดงอยู่บน feed นานผิดปกติ",
      investigation:
        "ตรวจ {{ref:deployment:monitoring-alerts}} พบว่าคิว review ลึกเกิน `MODERATION_REVIEW_QUEUE_MAX_DEPTH` ตั้งแต่ชั่วโมงแรกของเหตุการณ์ และไม่มีทีมงานเพียงพอรองรับปริมาณนี้",
      cause:
        "{{ref:policy:content-moderation-escalation-policy}} มีกลไกลด threshold ตอนคิวล้นอยู่แล้ว แต่ threshold ต่ำสุดที่ตั้งไว้ยังไม่พอรับมือกับ spike ขนาดนี้ ทีมไม่เคยทดสอบที่ระดับ traffic สูงขนาดนี้มาก่อน",
      resolution:
        "ลด threshold ลงต่ำกว่าค่าปกติสุดที่เคยตั้งไว้เป็นกรณีพิเศษด้วยมือ พร้อมเรียกทีม on-call เพิ่มมาช่วยตรวจสอบเนื้อหาที่ auto-remove ผิดพลาด",
      followup:
        "วางแผน capacity สำหรับเหตุการณ์ไวรัลระดับโลกโดยเฉพาะ ไม่ใช่แค่พึ่ง threshold ที่ปรับสำหรับ spike ปกติเท่านั้น",
    },
    {
      slug: "block-list-race-condition",
      title: "การ Block มีผลช้ากว่าที่ตั้งใจทำให้เกิดการโต้ตอบไม่พึงประสงค์",
      tags: ["safety", "race-condition"],
      summary:
        "ผู้ใช้รายงานว่า block บัญชีหนึ่งไปแล้วแต่ยังเห็นความคิดเห็นใหม่จากบัญชีนั้นบนโพสต์ของตัวเองอีกหลายนาทีหลัง block",
      investigation:
        "ตรวจ {{ref:policy:block-list-enforcement-policy}} พบว่า propagate การ block ไปยัง cache ของ {{ref:module:content-moderation-service}} ล่าช้ากว่าที่ document ไว้ (5 วินาที) เพราะ cache invalidation queue มีดีเลย์เมื่อ load สูง",
      cause:
        "การ propagate block ผ่าน async event เหมือน event อื่นทั่วไป ไม่มี priority พิเศษ ทำให้ตอน load สูงคิวการ propagate block ต่อคิวเดียวกับ event ที่ไม่ sensitive เท่ากัน",
      resolution:
        "แยก event `block.created` ให้มี priority สูงสุดในคิว ประมวลผลก่อน event อื่นเสมอ แก้ปัญหาความล่าช้าได้",
      followup:
        "ทบทวน event ประเภทอื่นที่เกี่ยวกับความปลอดภัยผู้ใช้ว่าควรมี priority พิเศษเหมือนกันหรือไม่",
    },
    {
      slug: "trending-topic-stale-cache",
      title: "Trending แสดงหัวข้อเก่าค้างหลัง Region Outage",
      tags: ["trending", "outage"],
      summary:
        "หลังภูมิภาคหนึ่งเจอ network outage สั้นๆ ผู้ใช้ในภูมิภาคนั้นเห็นรายการ trending เดิมค้างอยู่นานกว่า 2 ชั่วโมงทั้งที่ topic จริงเปลี่ยนไปแล้ว",
      investigation:
        "ตรวจ {{ref:module:trending-topic-detector}} พบว่า background job ที่ควรรันทุก 10 นาทีหยุดทำงานในภูมิภาคนั้นตั้งแต่ตอน outage แต่ไม่มี alert แจ้งว่า job หยุด",
      cause:
        "job scheduler ของภูมิภาคนั้น restart ไม่สำเร็จหลัง network กลับมาเพราะติดปัญหา config ที่ผูกกับ IP เดิมที่เปลี่ยนไปแล้วหลัง outage",
      resolution:
        "restart job scheduler ด้วยมือพร้อมแก้ config ให้ไม่ผูกกับ IP คงที่ trending list กลับมาอัปเดตปกติ",
      followup:
        "เพิ่ม alert แยกสำหรับกรณี background job ไม่ทำงานเกิน 30 นาที ไม่ใช่แค่ตรวจสอบผลลัพธ์ปลายทางอย่างเดียว",
    },
    {
      slug: "follow-graph-migration-data-loss",
      title: "Migration Follow Graph ทำข้อมูลบางส่วนหายไป",
      tags: ["follow", "migration"],
      summary:
        "หลัง migrate database ของ {{ref:module:follow-graph-service}} ไปเครื่องใหม่ ผู้ใช้บางส่วนรายงานว่าจำนวน follower ลดลงผิดปกติ",
      investigation:
        "ตรวจสอบพบว่า migration script export ข้อมูลแบบ batch แต่ batch สุดท้ายที่กำลัง export ตอน cutover time พอดีไม่ถูกรวมเข้าไปในชุดข้อมูลที่ import ที่เครื่องใหม่",
      cause:
        "แผน migration ไม่ได้กำหนดช่วง freeze การเขียนข้อมูลก่อน cutover ทำให้มีข้อมูลเปลี่ยนแปลงระหว่างที่ export กำลังทำงานอยู่พอดี",
      resolution:
        "เทียบข้อมูลระหว่างเครื่องเก่ากับเครื่องใหม่แล้ว import ส่วนต่างที่หายไปด้วยมือ ยืนยันความถูกต้องก่อนปิดเครื่องเก่า",
      followup:
        "เพิ่มขั้นตอน freeze การเขียนข้อมูลช่วงสั้นๆ ก่อน cutover ใน runbook migration ครั้งถัดไปเสมอ ไม่ migrate ข้อมูลที่ยัง active เขียนอยู่",
    },
    {
      slug: "engagement-tracker-clock-skew",
      title: "Clock Skew ทำ Engagement Timestamp เรียงผิดลำดับ",
      tags: ["engagement", "infrastructure"],
      summary:
        "ทีม data science สังเกตว่าคะแนนจัดอันดับของโพสต์บางกลุ่มดูผิดปกติ เหมือนให้น้ำหนัก engagement ที่เพิ่งเกิดน้อยกว่าที่ควร",
      investigation:
        "ตรวจ {{ref:module:engagement-tracker}} พบว่า server บาง instance มี clock skew ต่างจากเวลาจริงหลายวินาที ทำให้ event ที่เกิดทีหลังบันทึก timestamp เร็วกว่า event ที่เกิดก่อนในบาง edge case",
      cause:
        "NTP sync ของ instance กลุ่มนั้นล้มเหลวเงียบๆ มาหลายวันโดยไม่มี alert แจ้ง เพราะ monitoring เดิมเช็คแค่ว่า NTP service รันอยู่ ไม่ได้เช็คว่า sync สำเร็จจริงหรือไม่",
      resolution:
        "แก้ NTP config และ restart sync บน instance ที่ได้รับผลกระทบ แล้ว recompute คะแนนที่ได้รับผลกระทบจาก timestamp ที่ผิดพลาดใหม่",
      followup:
        "เปลี่ยน monitoring ให้เช็คความต่างของเวลาจริงเทียบกับ NTP server โดยตรง ไม่ใช่แค่เช็คว่า service รันอยู่",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/PULSE-341-trending-decay-tuning`, `fix/PULSE-358-fanout-dedup-race`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(notification-fanout): กัน dedup race ระหว่าง batch`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แตะ dedup หรือ rate limit ต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:notification-duplicate-spam}}) และการเปลี่ยน cache key ต้องมีคนที่สองยืนยันว่า invalidate ครบทุกจุด" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `computeFeedScore`, `rankFeedPage` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`postId` รูปแบบ `post_<ULID>`, `userId` รูปแบบ `usr_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนโพสต์ทั้งระบบได้" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับการจัดอันดับต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ (feed-ranker → engagement-tracker) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "การ auto-remove เนื้อหา log เป็น `warning` เสมอแม้จะเป็นการทำงานปกติของระบบ เพราะทีม trust & safety ต้อง audit ย้อนหลังได้ง่าย" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`PULSE_<DOMAIN>_<REASON>` เช่น `PULSE_FOLLOW_ALREADY_PENDING`, `PULSE_MODERATION_QUEUE_FULL` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`PULSE_RANKING_TIMEOUT`, `PULSE_FANOUT_RATE_LIMITED`, `PULSE_ENGAGEMENT_DUPLICATE` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Dedup test", body: "ฟังก์ชันที่เกี่ยวกับ dedup (engagement, notification) ต้องมี test จำลอง concurrent request อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก {{ref:incident:engagement-double-count-bug}}" },
        { heading: "Canary สำหรับโมเดล", body: "โมเดล ranking หรือ moderation เวอร์ชันใหม่ต้องผ่าน canary test กับ traffic 1% อย่างน้อย 24 ชั่วโมงก่อนขยายเต็ม — บทเรียนจาก {{ref:incident:moderation-false-positive-spike}}" },
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
      slug: "content-tagging-convention",
      title: "Content Tagging Convention",
      tags: ["content", "moderation"],
      intro: "โพสต์ทุกตัวต้องมี tag อัตโนมัติจากระบบ classification เพื่อใช้ทั้งในการจัดอันดับและการตรวจสอบเนื้อหา — เอกสารนี้กำหนดรูปแบบ tag ที่ต้องใช้ตรงกันทุก service",
      sections: [
        { heading: "หมวดหมู่หลัก", body: "`topic:<หัวข้อ>`, `sensitivity:<low|medium|high>`, `lang:<รหัสภาษา ISO 639-1>` ต้องมีครบทั้ง 3 หมวดในทุกโพสต์ ขาดตัวใดตัวหนึ่ง {{ref:module:feed-ranker}} จะปฏิเสธนำไปจัดอันดับ" },
        { heading: "การอัปเดต tag", body: "tag ที่ได้จาก classification อัตโนมัติปรับแก้ด้วยมือได้เฉพาะทีม trust & safety เท่านั้น ผู้ใช้ทั่วไปแก้ tag ของโพสต์ตัวเองไม่ได้เพื่อป้องกันการหลบเลี่ยงการตรวจสอบ" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → canary test (สำหรับโมเดล ranking/moderation) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:content-moderation-service}} ต้องผ่าน canary test 24 ชั่วโมงก่อน merge เสมอ service อื่นผ่อนปรนกว่าเพราะไม่กระทบเนื้อหาที่ผู้ใช้เห็นโดยตรงเท่ากัน" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      intro: "เอกสารนี้พูดถึง timeout ระดับ infrastructure/connection เท่านั้น ไม่ใช่ business timeout ของการ refresh คะแนนจัดอันดับ — ดูเรื่องนั้นที่ {{ref:policy:feed-ranking-refresh-policy}} แทน",
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → feed-ranker | 3s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| feed-ranker → database pool acquire | 2s | `pg-pool` config |\n| notification-fanout → push provider | 5s | env `PUSH_PROVIDER_TIMEOUT_MS` |" },
        { heading: "เหตุการณ์ที่เจอจริง", body: "ดูเหตุการณ์ {{ref:incident:feed-ranker-timeout-cascade}} ที่ connection pool เต็มจน request ใหม่ timeout เป็นลูกโซ่ทั้งระบบ" },
      ],
    },
    {
      slug: "ranking-model-rollout-runbook",
      title: "Ranking Model Rollout Runbook",
      tags: ["ranking", "runbook"],
      intro: "ขั้นตอนละเอียดสำหรับ deploy โมเดลจัดอันดับหรือ moderation เวอร์ชันใหม่ ตามที่กำหนดไว้ใน {{ref:convention:testing-convention}}",
      sections: [
        { heading: "ก่อน rollout", body: "ต้องผ่าน canary test กับ traffic 1% อย่างน้อย 24 ชั่วโมง และยืนยันว่า cache key รวม model version ไว้ด้วยแล้ว — บทเรียนจาก {{ref:incident:feed-ranker-cache-poisoning}}" },
        { heading: "ระหว่างเฝ้าระวัง", body: "เฝ้าดู false-positive rate ของ moderation และ engagement rate ของ ranking เทียบกับ baseline ถ้าต่างกันเกิน 10% ให้หยุดขยาย rollout ทันที" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = feed โหลดไม่ขึ้นทั้งระบบหรือเนื้อหาผิดกฎแพร่กระจายวงกว้าง, Sev2 = กระทบบางภูมิภาค/บาง service, Sev3 = กระทบเล็กน้อยไม่ถึงผู้ใช้ส่วนใหญ่" },
        { heading: "กรณีเนื้อหาผิดกฎหลุดรอด", body: "ทุกเหตุการณ์ที่เนื้อหาผิดกฎร้ายแรงแพร่กระจายก่อนถูกถอด ต้องยกระดับเป็น Sev1 เสมอและเขียน postmortem แบบ blameless ภายใน 48 ชั่วโมง" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "moderation review queue depth เกิน 80% ของ `MODERATION_REVIEW_QUEUE_MAX_DEPTH`, fanout job ค้างเกิน 15 นาที, feed-ranker error rate เกิน 5% ใน 5 นาที" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager ส่วน Sev3 รวมเป็น digest รายชั่วโมงพอ ไม่ต้อง page คนตอนตี 3 สำหรับปัญหาที่รอได้" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ false-positive rate ของ moderation พุ่งเกินเกณฑ์ปกติ หรือ feed error rate สูงผิดปกติ ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:moderation-false-positive-spike}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมที่เกี่ยวข้องทุกครั้งแม้จะ rollback สำเร็จแล้วก็ตาม" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| feed-ranker | 4 | 20 | CPU > 65% (latency-sensitive) |\n| notification-fanout | 2 | 16 | queue depth > 5000 |\n| content-moderation-service | 3 | 12 | review queue > 70% max |" },
        { heading: "ข้อจำกัดจากบุคคลที่สาม", body: "push notification provider ภายนอกมี rate limit ของตัวเอง — scale service ของเราเพิ่มไม่ช่วยถ้าติด rate limit ฝั่ง provider ดู {{ref:policy:notification-fanout-rate-limit-policy}} สำหรับข้อจำกัดนี้" },
      ],
    },
    {
      slug: "viral-event-capacity-planning-runbook",
      title: "Viral Event Capacity Planning Runbook",
      tags: ["capacity", "runbook"],
      intro: "ขั้นตอนเตรียมความพร้อมสำหรับเหตุการณ์ที่คาดว่าจะมี traffic พุ่งสูงผิดปกติ (เช่น ข่าวใหญ่ระดับโลก, event กีฬาสำคัญ)",
      sections: [
        { heading: "ก่อนเหตุการณ์ที่คาดการณ์ได้ล่วงหน้า", body: "scale worker ของ {{ref:module:content-moderation-service}} และ {{ref:module:notification-fanout}} ล่วงหน้าอย่างน้อย 2 เท่าจาก baseline ปกติ ไม่รอให้ autoscale ตามทันหลังโหลดพุ่งแล้ว" },
        { heading: "บทเรียนจากเหตุการณ์จริง", body: "ดู {{ref:incident:content-moderation-queue-overflow}} — threshold ปกติของ {{ref:policy:content-moderation-escalation-policy}} ไม่พอรับมือ spike ระดับโลก ต้องเตรียม threshold พิเศษไว้ล่วงหน้าเป็นกรณีเฉพาะ" },
      ],
    },
  ],
};
