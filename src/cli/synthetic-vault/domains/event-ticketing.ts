import type { DomainProfile } from "../types.js";

// TicketNode — ระบบจำหน่ายบัตรสำหรับคอนเสิร์ต กีฬา และงานประชุม (event ticketing)
// เป็นระบบสมมติล้วนๆ ไม่เกี่ยวข้องกับ payment/refund/order ของ PayFlow เลย — distractor domain
export const eventTicketing: DomainProfile = {
  id: "event-ticketing",
  displayName: "TicketNode — ระบบจำหน่ายบัตรงานอีเวนต์",
  summary: [
    "TicketNode คือแพลตฟอร์มจำหน่ายบัตรสำหรับคอนเสิร์ต การแข่งขันกีฬา และงานประชุม รองรับการเลือกที่นั่ง การจองสิทธิ์ซื้อบัตรชั่วคราวก่อนชำระเงิน (hold), ระบบ waitlist เมื่อบัตรขายหมด, การโอนบัตรระหว่างผู้ชม, ตลาดขายต่อ (resale) แบบมีเพดานราคา, และการสแกนบัตรเข้างานที่สถานที่จัดจริง",
    "ทีมวิศวกรรมออกแบบระบบให้จัดการ race condition เรื่องที่นั่งเป็นเรื่องสำคัญที่สุด เพราะที่นั่งหนึ่งที่ขายให้สองคนพร้อมกันไม่ใช่แค่ปัญหาทางเทคนิค แต่กลายเป็นปัญหาหน้างานจริงที่แก้ไขยากเมื่อผู้ชมทั้งสองคนมาถึงสถานที่จัดงานพร้อมบัตรที่อ้างที่นั่งเดียวกัน",
  ],
  domainTags: ["event-ticketing", "ticketnode"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:seat-inventory}} เป็นเจ้าของสถานะที่นั่งทั้งหมด ส่วน {{ref:module:reservation-engine}} เก็บแค่ข้อมูลการจอง (ใครจองที่นั่งไหน) ไม่แตะสถานะที่นั่งดิบโดยตรง",
    "{{ref:module:resale-marketplace}} ไม่มีสิทธิ์แก้ไขสถานะที่นั่งใน {{ref:module:seat-inventory}} โดยตรง ต้องผ่าน {{ref:module:transfer-processor}} เสมอเพื่อให้การโอนกรรมสิทธิ์บัตรทุกเส้นทาง (โอนปกติ, ขายต่อ) ผ่าน validation เดียวกัน",
  ],
  apiGatewayNote: [
    "คำขอจากแอปผู้ซื้อบัตรเข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งจำกัด rate limit ต่อผู้ใช้อย่างเข้มงวดช่วงเปิดขายบัตรเพื่อป้องกัน bot กว้านซื้อบัตร",
    "คำขอจากเครื่องสแกนบัตรหน้างานใช้ endpoint แยกที่ optimize สำหรับ latency ต่ำที่สุด เพราะแถวเข้างานยาวมากช่วงก่อนเริ่มงานและการสแกนช้าแม้ 1-2 วินาทีต่อคนก็สะสมเป็นแถวยาวได้",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:seat-inventory}} ดูแล ได้แก่ `seats` (สถานะปัจจุบัน), `seat_holds` (การจองชั่วคราว), และ `venue_seat_maps`",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `seats` | seat-inventory | สถานะปัจจุบันเท่านั้น (available/held/sold) |\n| `reservations` | reservation-engine | ไม่มี FK ตรงไป seats ใช้ seatId แบบ soft reference |\n| `resale_listings` | resale-marketplace | เก็บประวัติการลงขายต่อทั้งหมด |\n| `entry_scans` | entry-scanner | append-only เก็บทุกครั้งที่สแกนไม่ว่าสำเร็จหรือไม่ |",
    "ไม่มี FK ข้าม database จริงเพราะแยก schema กันคนละ service — ตรวจความสอดคล้องด้วย reconciliation job รายวัน (เช่น เช็คว่าทุก reservation มี seatId ที่มีอยู่จริง)",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `seat.held`, `seat.sold`, `seat.released`, `waitlist.slot_available`, `ticket.transferred`, `entry.scanned` — {{ref:module:waitlist-manager}} subscribe `seat.released` เพื่อเสนอที่นั่งที่ว่างลงให้คนในคิว waitlist ทันที",
    "{{ref:module:entry-scanner}} publish `entry.scanned` ทุกครั้งที่สแกน ไม่ว่าจะสำเร็จหรือถูกปฏิเสธ เพื่อให้ทีมรักษาความปลอดภัยหน้างานเห็น log การสแกนแบบ real-time",
  ],
  modules: [
    {
      slug: "seat-inventory",
      name: "seat-inventory",
      tags: ["inventory", "module", "core"],
      description:
        "เจ้าของสถานะที่นั่งทั้งหมดในทุกงาน (available/held/sold) เป็น service เดียวที่แก้ไขสถานะที่นั่งได้โดยตรง ทุก service อื่นที่ต้องการเปลี่ยนสถานะที่นั่งต้องเรียกผ่าน service นี้เท่านั้น เพื่อป้องกันการจองซ้อนที่นั่งเดียวกัน",
      functions: [
        { sig: "holdSeat(seatId: string, buyerId: string, ttlSeconds: number): Promise<string>", desc: "จองที่นั่งชั่วคราว คืน holdId ถ้าสำเร็จ ปฏิเสธถ้าที่นั่งไม่ว่าง" },
        { sig: "confirmSale(holdId: string): Promise<void>", desc: "ยืนยันการขายจาก hold ที่ชำระเงินสำเร็จแล้ว เปลี่ยนสถานะเป็น sold" },
        { sig: "releaseSeat(seatId: string): Promise<void>", desc: "ปล่อยที่นั่งกลับเป็น available เมื่อ hold หมดอายุหรือถูกยกเลิก" },
      ],
      stateFlow: "available → held → sold | released_back_to_available — ดู {{ref:policy:hold-expiry-timeout-policy}}",
      relatedNotes:
        "ทุกครั้งที่ `releaseSeat` สำเร็จ publish event `seat.released` ให้ {{ref:module:waitlist-manager}} subscribe เพื่อเสนอที่นั่งให้คนในคิว waitlist ทันที",
      internals: {
        constants: [
          { name: "SEAT_HOLD_DEFAULT_TTL_SECONDS", value: "600" },
          { name: "MAX_CONCURRENT_HOLDS_PER_BUYER", value: "8" },
        ],
        typeSnippet:
          "interface SeatStatus {\n  seatId: string;\n  status: \"available\" | \"held\" | \"sold\";\n  holdId?: string;\n  holdExpiresAt?: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการหมดอายุ hold ที่ {{ref:policy:hold-expiry-timeout-policy}}",
      },
    },
    {
      slug: "reservation-engine",
      name: "reservation-engine",
      tags: ["reservation", "module"],
      description:
        "เก็บข้อมูลการจอง (ใครจองที่นั่งไหน จำนวนกี่ใบ) แยกออกมาจาก seat-inventory เพราะข้อมูลการจองมีรายละเอียดทางธุรกิจเยอะกว่าแค่สถานะที่นั่งดิบ เช่น ราคาที่ตกลง โปรโมชันที่ใช้ และช่องทางการซื้อ",
      functions: [
        { sig: "createReservation(buyerId: string, seatIds: string[], eventId: string): Promise<string>", desc: "สร้างการจอง เรียก holdSeat ของทุกที่นั่งที่เลือก คืน reservationId" },
        { sig: "cancelReservation(reservationId: string): Promise<void>", desc: "ยกเลิกการจอง ปล่อยที่นั่งที่เกี่ยวข้องทั้งหมดกลับคืน" },
        { sig: "getBuyerTicketCount(buyerId: string, eventId: string): Promise<number>", desc: "นับจำนวนบัตรที่ผู้ซื้อรายหนึ่งถืออยู่แล้วสำหรับงานนั้น" },
      ],
      relatedNotes:
        "ก่อนสร้างการจองใหม่ต้องเรียก `getBuyerTicketCount` ตรวจสอบก่อนเสมอ ไม่ให้เกินเพดานที่กำหนดใน {{ref:policy:max-tickets-per-buyer-policy}}",
    },
    {
      slug: "waitlist-manager",
      name: "waitlist-manager",
      tags: ["waitlist", "module", "core"],
      description:
        "จัดการคิวรอเมื่อบัตรงานหนึ่งขายหมด เรียงลำดับตามเวลาลงทะเบียนเข้าคิว และเสนอที่นั่งที่ว่างลงให้คนในคิวตามลำดับเมื่อมีที่นั่งว่างจากการยกเลิกหรือ hold หมดอายุ",
      functions: [
        { sig: "joinWaitlist(buyerId: string, eventId: string): Promise<string>", desc: "ลงทะเบียนเข้าคิว waitlist คืน waitlistEntryId" },
        { sig: "releaseNextBatch(eventId: string, seatCount: number): Promise<string[]>", desc: "ปล่อยสิทธิ์ซื้อให้คนในคิวตามลำดับเมื่อมีที่นั่งว่าง คืนรายชื่อ buyerId ที่ได้รับสิทธิ์" },
        { sig: "getWaitlistPosition(buyerId: string, eventId: string): Promise<number>", desc: "คืนลำดับปัจจุบันของผู้ซื้อในคิว" },
      ],
      stateFlow: "waiting → offered → claimed | expired — offered ที่ไม่ถูก claim ภายในเวลาที่กำหนดจะถูกเสนอให้คนถัดไปในคิวแทน",
      relatedNotes:
        "subscribe event `seat.released` จาก {{ref:module:seat-inventory}} เพื่อทริกเกอร์ `releaseNextBatch` อัตโนมัติ ไม่ต้องรอ manual trigger จากทีมงาน",
      internals: {
        constants: [
          { name: "WAITLIST_OFFER_CLAIM_WINDOW_MIN", value: "20" },
          { name: "WAITLIST_RELEASE_BATCH_SIZE_DEFAULT", value: "5" },
        ],
        typeSnippet:
          "interface WaitlistEntry {\n  entryId: string;\n  buyerId: string;\n  eventId: string;\n  status: \"waiting\" | \"offered\" | \"claimed\" | \"expired\";\n  joinedAt: string;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องขนาด batch การปล่อยสิทธิ์ที่ {{ref:policy:waitlist-release-batch-size-policy}}",
      },
    },
    {
      slug: "transfer-processor",
      name: "transfer-processor",
      tags: ["transfer", "module"],
      description:
        "ประมวลผลการโอนบัตรระหว่างผู้ชม (เช่น เพื่อนซื้อบัตรแล้วโอนให้อีกคนที่ไปงานจริง) เป็นจุดเดียวที่ตรวจสอบสิทธิ์การโอนและอัปเดตความเป็นเจ้าของบัตร ทั้ง transfer ปกติและ resale ต้องผ่านจุดนี้เสมอเพื่อให้ validation เดียวกันครอบคลุมทุกเส้นทาง",
      functions: [
        { sig: "initiateTransfer(ticketId: string, fromBuyerId: string, toBuyerId: string): Promise<string>", desc: "เริ่มการโอนบัตร ตรวจสอบสิทธิ์ก่อนดำเนินการ" },
        { sig: "acceptTransfer(transferId: string): Promise<void>", desc: "ผู้รับยืนยันรับบัตร อัปเดตความเป็นเจ้าของ" },
        { sig: "checkTransferEligibility(ticketId: string): Promise<EligibilityResult>", desc: "ตรวจสอบว่าบัตรใบนี้โอนได้หรือไม่ตามเงื่อนไข" },
      ],
      relatedNotes:
        "ดู {{ref:policy:transfer-eligibility-rules-policy}} สำหรับเงื่อนไขว่าบัตรประเภทไหนโอนได้บ้าง — บัตรบางประเภท (เช่น บัตรราคาพิเศษผูกชื่อ) โอนไม่ได้เลย",
    },
    {
      slug: "resale-marketplace",
      name: "resale-marketplace",
      tags: ["resale", "module"],
      description:
        "ตลาดขายต่อบัตรอย่างเป็นทางการที่จำกัดราคาขายต่อไม่ให้สูงเกินเพดานที่กำหนด เพื่อป้องกันการเก็งกำไรบัตรและปกป้องผู้ซื้อรายย่อยจากราคาที่สูงเกินจริง แยกออกมาจาก transfer-processor เพราะมี business logic เรื่องราคาและ marketplace listing ที่ซับซ้อนกว่าการโอนธรรมดามาก",
      functions: [
        { sig: "listForResale(ticketId: string, askPrice: number): Promise<string>", desc: "ลงขายบัตรต่อ ตรวจสอบว่าราคาไม่เกินเพดานก่อนอนุมัติ คืน listingId" },
        { sig: "purchaseResaleTicket(listingId: string, buyerId: string): Promise<string>", desc: "ซื้อบัตรจากตลาดขายต่อ เรียก transfer-processor ให้โอนความเป็นเจ้าของ" },
        { sig: "cancelListing(listingId: string): Promise<void>", desc: "ยกเลิกการลงขาย" },
      ],
      relatedNotes:
        "ทุกการซื้อขายสำเร็จเรียก {{ref:module:transfer-processor}} ให้ทำการโอนจริงเสมอ ไม่มี logic โอนความเป็นเจ้าของแยกต่างหากใน service นี้ ดู {{ref:policy:resale-price-cap-policy}}",
      internals: {
        constants: [
          { name: "RESALE_PRICE_CAP_MULTIPLIER", value: "1.1" },
          { name: "RESALE_LISTING_EXPIRY_DAYS", value: "7" },
        ],
        typeSnippet:
          "interface ResaleListing {\n  listingId: string;\n  ticketId: string;\n  askPrice: number;\n  status: \"active\" | \"sold\" | \"cancelled\" | \"expired\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องเพดานราคาที่ {{ref:policy:resale-price-cap-policy}}",
      },
    },
    {
      slug: "entry-scanner",
      name: "entry-scanner",
      tags: ["scanning", "module", "core"],
      description:
        "ตรวจสอบและบันทึกการสแกนบัตรเข้างานที่สถานที่จัดจริง ต้องทำงานได้แม้ network หน้างานไม่เสถียร เพราะสถานที่จัดงานขนาดใหญ่บางแห่งมีปัญหาสัญญาณเน็ตช่วงคนเข้างานพร้อมกันจำนวนมาก",
      functions: [
        { sig: "scanTicket(ticketId: string, gateId: string): Promise<ScanResult>", desc: "สแกนบัตร ตรวจสอบความถูกต้องและสถานะการใช้งาน" },
        { sig: "checkDuplicateEntry(ticketId: string): Promise<boolean>", desc: "ตรวจสอบว่าบัตรใบนี้เคยถูกสแกนผ่านไปแล้วหรือไม่" },
        { sig: "getEntryLog(eventId: string): Promise<ScanRecord[]>", desc: "คืนประวัติการสแกนทั้งหมดของงานหนึ่งสำหรับทีมความปลอดภัย" },
      ],
      relatedNotes:
        "publish event `entry.scanned` ทุกครั้งไม่ว่าสำเร็จหรือถูกปฏิเสธ เพื่อให้ทีมความปลอดภัยหน้างานเห็น log แบบ real-time ดู {{ref:policy:entry-scan-duplicate-prevention-policy}}",
    },
  ],
  envVarGroups: [
    {
      service: "seat-inventory-service",
      vars: [
        { name: "SEAT_HOLD_DEFAULT_TTL_SECONDS", example: "600", note: "ดู {{ref:policy:hold-expiry-timeout-policy}}" },
        { name: "MAX_CONCURRENT_HOLDS_PER_BUYER", example: "8", note: "" },
      ],
    },
    {
      service: "waitlist-manager-service",
      vars: [
        { name: "WAITLIST_OFFER_CLAIM_WINDOW_MIN", example: "20", note: "" },
        { name: "WAITLIST_RELEASE_BATCH_SIZE_DEFAULT", example: "5", note: "ดู {{ref:policy:waitlist-release-batch-size-policy}}" },
      ],
    },
    {
      service: "resale-marketplace-service",
      vars: [
        { name: "RESALE_PRICE_CAP_MULTIPLIER", example: "1.1", note: "" },
        { name: "RESALE_LISTING_EXPIRY_DAYS", example: "7", note: "" },
      ],
    },
    {
      service: "entry-scanner-service",
      vars: [
        { name: "SCANNER_OFFLINE_CACHE_TTL_MIN", example: "30", note: "รองรับกรณี network หน้างานไม่เสถียร" },
        { name: "GATE_HEARTBEAT_INTERVAL_SEC", example: "10", note: "" },
      ],
    },
  ],
  policies: [
    {
      slug: "hold-expiry-timeout-policy",
      title: "นโยบายระยะเวลาหมดอายุการจองชั่วคราว",
      tags: ["inventory", "policy"],
      isPrimary: true,
      intro: [
        "ที่นั่งที่ถูก hold ระหว่างขั้นตอนชำระเงินจะหมดอายุอัตโนมัติภายใน `SEAT_HOLD_DEFAULT_TTL_SECONDS` วินาทีถ้าไม่มีการยืนยันการชำระเงินสำเร็จ เพื่อไม่ให้ที่นั่งถูกกันไว้นานเกินไปโดยไม่มีการซื้อจริง",
        "การหมดอายุของ hold ต้องปล่อยที่นั่งกลับเป็น available ทันทีที่ TTL ครบ ไม่มีช่วงเวลา 'buffer' เพิ่มเติม เพราะจะทำให้ที่นั่งดูเหมือนขายไม่ได้ทั้งที่จริงว่างอยู่",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อกำลังอยู่ระหว่างขั้นตอนชำระเงินภายนอก",
        tags: ["inventory", "edge-case"],
        body: [
          "ถ้าผู้ซื้อกำลังอยู่ระหว่างขั้นตอนยืนยันตัวตนกับธนาคาร (3D Secure) ตอน hold ใกล้หมดอายุ ระบบจะขยายเวลา hold ให้อัตโนมัติอีก 5 นาทีหนึ่งครั้ง เพื่อไม่ให้ที่นั่งหลุดมือระหว่างขั้นตอนที่ผู้ซื้อควบคุมเวลาไม่ได้",
          "การขยายเวลาแบบนี้ทำได้แค่ครั้งเดียวต่อ hold หนึ่งรายการเท่านั้น ถ้ายังไม่เสร็จหลังขยายแล้วให้ปล่อยที่นั่งคืนตามปกติ ไม่ขยายไปเรื่อยๆ ที่จะทำให้ที่นั่งถูกกันไว้นานเกินสมควร",
        ],
      },
    },
    {
      slug: "max-tickets-per-buyer-policy",
      title: "นโยบายจำนวนบัตรสูงสุดต่อผู้ซื้อ",
      tags: ["reservation", "policy"],
      isPrimary: true,
      intro: [
        "ผู้ซื้อหนึ่งคนซื้อบัตรงานเดียวกันได้ไม่เกิน 6 ใบ ไม่ว่าจะซื้อในครั้งเดียวหรือหลายครั้งสะสม เพื่อป้องกันการกว้านซื้อบัตรไปขายต่อในราคาสูง",
        "การนับจำนวนบัตรอ้างอิงจากตัวตนผู้ซื้อ (buyerId) ไม่ใช่จำนวนธุรกรรม — ถ้าผู้ซื้อพยายามสร้างหลายบัญชีเพื่อหลบเลี่ยงเพดานนี้ ถือเป็นการละเมิดเงื่อนไขการใช้งานที่ตรวจจับแยกต่างหากผ่านระบบป้องกันการทุจริต",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับกลุ่มองค์กรที่ซื้อบัตรจำนวนมาก",
        tags: ["reservation", "edge-case"],
        body: [
          "องค์กรที่ต้องการซื้อบัตรจำนวนมากสำหรับกิจกรรมองค์กร (corporate box, กลุ่มพนักงาน) สามารถขอสิทธิ์ 'bulk buyer' ที่ยกเว้นเพดานปกติได้ ผ่านการยืนยันตัวตนองค์กรและอนุมัติจากทีมขายโดยเฉพาะ ไม่ใช่ผ่านหน้าซื้อบัตรทั่วไป",
          "สิทธิ์ bulk buyer มีเพดานของตัวเองที่กำหนดเป็นรายกรณีตามขนาดองค์กร และต้องต่ออายุทุกงาน ไม่ใช่สิทธิ์ถาวรที่ใช้ได้กับทุกงานในอนาคตโดยอัตโนมัติ",
        ],
      },
    },
    {
      slug: "transfer-eligibility-rules-policy",
      title: "นโยบายเงื่อนไขการโอนบัตร",
      tags: ["transfer", "policy"],
      isPrimary: true,
      intro: [
        "บัตรราคาปกติโอนได้อย่างเสรีระหว่างผู้ใช้ที่ยืนยันตัวตนแล้ว ส่วนบัตรราคาพิเศษที่ผูกกับเงื่อนไขเฉพาะ (เช่น บัตรนักเรียน บัตรผู้สูงอายุ) โอนได้เฉพาะให้ผู้รับที่ผ่านเงื่อนไขเดียวกันเท่านั้น",
        "บัตรที่มีการแจ้งข้อพิพาทหรืออยู่ระหว่างการสอบสวนการทุจริต (เช่น สงสัยว่าซื้อด้วยบัตรเครดิตขโมย) จะถูกล็อกไม่ให้โอนจนกว่าการสอบสวนจะเสร็จสิ้น ไม่ว่าประเภทบัตรจะเป็นแบบใดก็ตาม",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อผู้ซื้อเดิมไม่สามารถติดต่อได้",
        tags: ["transfer", "edge-case"],
        body: [
          "ถ้าผู้ซื้อเดิมต้องการโอนบัตรให้คนอื่นแต่ไม่สามารถยืนยันตัวตนผ่านช่องทางปกติได้ (เช่น เปลี่ยนเบอร์โทรศัพท์) ทีมบริการลูกค้าสามารถอนุมัติการโอนด้วยมือหลังยืนยันตัวตนผ่านช่องทางสำรอง (เอกสารยืนยันตัวตน) แทน",
          "การอนุมัติโอนด้วยมือทุกครั้งต้องบันทึกเหตุผลและหลักฐานที่ใช้ยืนยันตัวตนไว้เสมอ เพื่อป้องกันการใช้ช่องทางนี้เป็นทางลัดหลีกเลี่ยงการตรวจสอบตัวตนปกติ",
        ],
      },
    },
    {
      slug: "resale-price-cap-policy",
      title: "นโยบายเพดานราคาขายต่อ",
      tags: ["resale", "policy"],
      isPrimary: true,
      intro: [
        "ราคาขายต่อบนตลาด resale อย่างเป็นทางการต้องไม่เกิน `RESALE_PRICE_CAP_MULTIPLIER` เท่าของราคาบัตรเดิม เพื่อป้องกันการเก็งกำไรและปกป้องผู้ซื้อรายย่อยจากราคาที่สูงเกินจริง",
        "ระบบปฏิเสธการลงขายที่ราคาเกินเพดานทันทีตั้งแต่ขั้นตอน `listForResale` ไม่ปล่อยให้ลงขายแล้วค่อยตรวจสอบทีหลัง เพื่อไม่ให้ผู้ขายเสียเวลารอโดยเปล่าประโยชน์",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับบัตรที่มีค่าธรรมเนียมบริการสูง",
        tags: ["resale", "edge-case"],
        body: [
          "บัตรบางประเภทมีค่าธรรมเนียมบริการ (service fee) สูงกว่าปกติที่รวมอยู่ในราคาเดิมอยู่แล้ว (เช่น บัตร VIP ที่มีสิทธิพิเศษเพิ่มเติม) — เพดานราคาขายต่อคำนวณจากราคาเต็มที่รวมค่าธรรมเนียมแล้ว ไม่ใช่ราคาบัตรเปล่าก่อนค่าธรรมเนียม",
          "ถ้าผู้จัดงานปรับราคาบัตรระหว่างช่วงขายบัตร (เช่น early bird หมดเขต ราคาขึ้น) เพดานราคาขายต่อของบัตรที่ซื้อไปแล้วยังคงอ้างอิงราคาที่ผู้ซื้อจ่ายจริงตอนซื้อ ไม่ใช่ราคาปัจจุบันที่ปรับขึ้นแล้ว",
        ],
      },
    },
    {
      slug: "waitlist-release-batch-size-policy",
      title: "นโยบายขนาด Batch การปล่อยสิทธิ์ Waitlist",
      tags: ["waitlist", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อมีที่นั่งว่างจากการยกเลิกหรือ hold หมดอายุ ระบบจะปล่อยสิทธิ์ให้คนในคิว waitlist ทีละ `WAITLIST_RELEASE_BATCH_SIZE_DEFAULT` คนตามลำดับ ไม่ปล่อยทีเดียวหมดทุกคนในคิว เพื่อไม่ให้ที่นั่งที่มีจำกัดถูกจองพร้อมกันจนเกิดการแย่งกันเอง",
        "คนที่ได้รับสิทธิ์ (`offered`) มีเวลา `WAITLIST_OFFER_CLAIM_WINDOW_MIN` นาทีในการยืนยันซื้อ ถ้าไม่ทันเวลาสิทธิ์จะถูกยกเลิกและส่งต่อให้คนถัดไปในคิวโดยอัตโนมัติ",
      ],
      edgeCase: {
        title: "ข้อยกเว้นเมื่อที่นั่งว่างพร้อมกันจำนวนมาก",
        tags: ["waitlist", "edge-case"],
        body: [
          "ถ้าเหตุการณ์ทำให้ที่นั่งว่างพร้อมกันจำนวนมาก (เช่น ผู้จัดงานเปิดโซนใหม่เพิ่ม) ระบบจะปรับขนาด batch การปล่อยสิทธิ์ให้ใหญ่ขึ้นตามสัดส่วนที่นั่งว่างจริง แทนที่จะปล่อยทีละ batch เล็กเหมือนกรณีปกติที่จะทำให้ปล่อยสิทธิ์ช้าเกินไป",
          "การปรับขนาด batch นี้ทำโดยทีมงานอนุมัติด้วยมือเท่านั้น ไม่ใช่ระบบตัดสินใจปรับเองอัตโนมัติ เพราะการปล่อยสิทธิ์ผิดขนาดกระทบประสบการณ์ผู้ซื้อจำนวนมากพร้อมกันได้",
        ],
      },
    },
    {
      slug: "entry-scan-duplicate-prevention-policy",
      title: "นโยบายป้องกันการสแกนบัตรซ้ำ",
      tags: ["scanning", "policy"],
      isPrimary: true,
      intro: [
        "บัตรหนึ่งใบสแกนเข้างานได้ครั้งเดียวเท่านั้น การสแกนครั้งที่สองสำหรับบัตรเดียวกันจะถูกปฏิเสธทันทีไม่ว่าจะสแกนที่ประตูเดียวกันหรือคนละประตู",
        "ระบบต้องตรวจสอบ duplicate entry แบบ real-time ข้ามทุกประตูของสถานที่จัดงาน ไม่ใช่ตรวจสอบแค่ภายในประตูเดียวกัน เพื่อป้องกันบัตรใบเดียวถูกใช้เข้างานพร้อมกันที่คนละประตู",
      ],
      edgeCase: {
        title: "ข้อยกเว้นสำหรับงานที่อนุญาตเข้า-ออกได้หลายครั้ง",
        tags: ["scanning", "edge-case"],
        body: [
          "งานบางประเภท (เทศกาลหลายวัน, งานที่มีโซนแยกที่ต้องเข้า-ออกระหว่างวัน) อนุญาตให้บัตรใบเดียวสแกนเข้า-ออกได้หลายครั้ง — ผู้จัดงานต้องตั้งค่า 'multi-entry allowed' ไว้ล่วงหน้าตั้งแต่สร้างงาน ไม่ใช่ค่า default",
          "แม้จะเป็นงานแบบ multi-entry การสแกนเข้าซ้ำโดยไม่มีการสแกนออกก่อนหน้ายังคงถูกปฏิเสธเสมอ เพื่อป้องกันบัตรใบเดียวถูกใช้พร้อมกันสองที่แม้ในงานที่อนุญาตเข้า-ออกหลายครั้งก็ตาม",
        ],
      },
    },
    {
      slug: "seat-map-versioning-policy",
      title: "นโยบายการจัดการเวอร์ชันผังที่นั่ง",
      tags: ["inventory", "policy"],
      isPrimary: false,
      intro: [
        "ผังที่นั่งของสถานที่จัดงานแต่ละแห่งมีเวอร์ชันของตัวเอง การเปลี่ยนผังที่นั่งหลังเริ่มขายบัตรแล้วต้องผ่านขั้นตอนพิเศษที่ตรวจสอบว่าที่นั่งที่ขายไปแล้วยังคงอยู่ในผังใหม่",
        "ห้ามลบที่นั่งที่มีการขายไปแล้วออกจากผังไม่ว่ากรณีใด ถ้าต้องปรับผังจริงๆ ต้องติดต่อผู้ซื้อที่ได้รับผลกระทบเพื่อจัดที่นั่งใหม่ก่อนอัปเดตผัง",
      ],
    },
    {
      slug: "cancellation-refund-window-policy",
      title: "นโยบายช่วงเวลายกเลิกและคืนบัตร",
      tags: ["reservation", "policy"],
      isPrimary: false,
      intro: [
        "ผู้ซื้อยกเลิกบัตรได้เองผ่านระบบภายใน 48 ชั่วโมงหลังซื้อ โดยที่นั่งจะถูกปล่อยกลับเข้าระบบทันทีให้คนอื่นจองต่อได้",
        "หลังพ้น 48 ชั่วโมง การยกเลิกต้องติดต่อทีมบริการลูกค้าเท่านั้น และขึ้นอยู่กับนโยบายของผู้จัดงานแต่ละงานว่าอนุญาตให้ยกเลิกได้หรือไม่",
      ],
    },
    {
      slug: "resale-listing-expiry-policy",
      title: "นโยบายวันหมดอายุการลงขายต่อ",
      tags: ["resale", "policy"],
      isPrimary: false,
      intro: [
        "การลงขายบัตรต่อบนตลาด resale มีอายุ `RESALE_LISTING_EXPIRY_DAYS` วัน ถ้าไม่มีคนซื้อภายในเวลานี้ การลงขายจะหมดอายุอัตโนมัติและผู้ขายต้องลงขายใหม่ถ้ายังต้องการขาย",
        "การลงขายจะหมดอายุเร็วกว่ากำหนดโดยอัตโนมัติถ้าวันจัดงานใกล้เข้ามาน้อยกว่า 24 ชั่วโมง เพื่อไม่ให้มีการซื้อขายบัตรที่ไม่มีเวลาเพียงพอสำหรับการโอนกรรมสิทธิ์ให้เสร็จก่อนงานเริ่ม",
      ],
    },
    {
      slug: "bot-purchase-detection-policy",
      title: "นโยบายการตรวจจับการซื้อบัตรด้วย Bot",
      tags: ["security", "policy"],
      isPrimary: false,
      intro: [
        "ระบบตรวจจับพฤติกรรมการซื้อที่มีลักษณะเป็น bot (ความเร็วในการกรอกฟอร์มผิดปกติ, pattern การเข้าถึง API ที่ไม่เหมือนมนุษย์) และบล็อกการทำธุรกรรมนั้นทันทีก่อนยืนยันการซื้อสำเร็จ",
        "บัญชีที่ถูกตรวจพบว่าใช้ bot ซื้อบัตรสำเร็จไปแล้วก่อนตรวจพบ จะถูกยกเลิกการซื้อย้อนหลังและคืนที่นั่งเข้าระบบ พร้อมระงับบัญชีตามกระบวนการป้องกันการทุจริต",
      ],
    },
    {
      slug: "venue-capacity-safety-limit-policy",
      title: "นโยบายเพดานความจุตามมาตรฐานความปลอดภัย",
      tags: ["safety", "policy"],
      isPrimary: false,
      intro: [
        "จำนวนที่นั่งที่ขายได้สำหรับสถานที่จัดงานแต่ละแห่งต้องไม่เกินเพดานความจุตามมาตรฐานความปลอดภัยที่หน่วยงานท้องถิ่นกำหนด ไม่ใช่แค่จำนวนที่นั่งทางกายภาพที่มีอยู่",
        "เพดานนี้ตั้งไว้ในระบบตั้งแต่สร้างผังที่นั่งของสถานที่จัดงาน และแก้ไขได้เฉพาะทีมงานที่มีสิทธิ์ยืนยันเอกสารความปลอดภัยจากหน่วยงานที่เกี่ยวข้องเท่านั้น",
      ],
    },
  ],
  incidents: [
    {
      slug: "seat-inventory-double-booking-race-condition",
      title: "ที่นั่งเดียวกันถูกจองสำเร็จสองครั้งพร้อมกัน",
      tags: ["inventory", "race-condition"],
      summary:
        "ผู้ซื้อสองคนได้รับการยืนยันซื้อที่นั่งเดียวกันสำเร็จพร้อมกัน ทำให้เมื่อไปถึงงานจริงมีบัตรสองใบอ้างที่นั่งเดียวกัน",
      investigation:
        "ตรวจ `holdSeat` ใน {{ref:module:seat-inventory}} พบว่าสอง request เข้ามาพร้อมกันในเวลาไล่เลี่ยกันมาก ทั้งคู่ query เห็นสถานะ available พร้อมกันก่อนที่ฝ่ายแรกจะเขียนสถานะ held สำเร็จ",
      cause:
        "การตรวจสอบและอัปเดตสถานะที่นั่งไม่ได้ทำแบบ atomic — มีช่วงเวลาสั้นๆ ระหว่างการเช็คสถานะกับการเขียนสถานะใหม่ที่เปิดโอกาสให้ request คู่ขนานแทรกเข้ามาได้",
      resolution:
        "ติดต่อผู้ซื้อรายที่จองไม่ทันจริงเพื่อเสนอที่นั่งทดแทนหรือคืนเงินพร้อมค่าชดเชย แล้วแก้ `holdSeat` ให้ใช้ conditional update แบบ atomic แทนการอ่านแล้วเขียนแยกกัน",
      followup:
        "ตรวจสอบฟังก์ชันอื่นที่มี pattern อ่าน-แล้ว-เขียนคล้ายกันในระบบทั้งหมดว่ามีความเสี่ยง race condition เดียวกันหรือไม่",
    },
    {
      slug: "hold-timer-not-expiring-permanent-lock",
      title: "Hold Timer ไม่หมดอายุทำที่นั่งถูกล็อกถาวร",
      tags: ["inventory", "bug"],
      summary:
        "ที่นั่งกลุ่มหนึ่งแสดงสถานะ held ค้างอยู่นานหลายวันโดยไม่มีการยืนยันซื้อหรือหมดอายุตามที่ควรจะเป็น ทำให้ที่นั่งเหล่านั้นขายไม่ได้เลย",
      investigation:
        "ตรวจ scheduled job ที่ตรวจสอบและปล่อย hold ที่หมดอายุใน {{ref:module:seat-inventory}} พบว่า job นี้ล้มเหลวเงียบๆ มาหลายวันเพราะ query timeout จากจำนวน hold record ที่สะสมมากขึ้นเรื่อยๆ",
      cause:
        "scheduled job ไม่มีการแจ้งเตือนเมื่อ execution ล้มเหลว ทำให้ปัญหาสะสมต่อเนื่องหลายวันโดยไม่มีใครรู้ตัวจนกว่าทีมขายจะสังเกตว่าที่นั่งขายไม่ออก",
      resolution:
        "ปล่อยที่นั่งที่ค้างอยู่ด้วยมือทั้งหมด ปรับ query ให้มีประสิทธิภาพรองรับจำนวน hold record ที่เพิ่มขึ้น",
      followup:
        "เพิ่ม alert เมื่อ scheduled job ล้มเหลวหรือรันไม่ครบ และเพิ่ม dashboard แสดงจำนวนที่นั่ง held ค้างนานผิดปกติให้ทีมตรวจสอบได้ทันที",
    },
    {
      slug: "waitlist-release-wrong-buyers",
      title: "ปล่อยสิทธิ์ Waitlist ให้ผิดคนข้ามลำดับ",
      tags: ["waitlist", "bug"],
      summary:
        "คนที่เข้าคิว waitlist ทีหลังได้รับสิทธิ์ซื้อก่อนคนที่เข้าคิวก่อนหน้า ทำให้เกิดข้อร้องเรียนจำนวนมากจากผู้ที่รอคิวมานาน",
      investigation:
        "ตรวจ `releaseNextBatch` ใน {{ref:module:waitlist-manager}} พบว่าการเรียงลำดับใช้ index ของฐานข้อมูลที่ไม่ได้ sort ตาม `joinedAt` อย่างเคร่งครัด ทำให้ในบางกรณีลำดับที่ query ได้ไม่ตรงกับลำดับเวลาจริงที่เข้าคิว",
      cause:
        "query การดึงคิวไม่มี explicit `ORDER BY joinedAt` ทำให้ผลลัพธ์ขึ้นอยู่กับลำดับทางกายภาพในฐานข้อมูลซึ่งไม่รับประกันว่าตรงกับลำดับเวลาเข้าคิว",
      resolution:
        "แจ้งขอโทษผู้ที่ได้รับผลกระทบพร้อมเสนอสิทธิ์พิเศษชดเชย แก้ query ให้ sort ตาม `joinedAt` อย่างชัดเจนเสมอ",
      followup:
        "เพิ่ม test ยืนยันลำดับการปล่อยสิทธิ์ตรงตามเวลาเข้าคิวเสมอ ไม่พึ่งพาลำดับทางกายภาพของฐานข้อมูลที่ไม่รับประกันความถูกต้อง",
    },
    {
      slug: "transfer-to-ineligible-buyer-bypassed",
      title: "โอนบัตรให้ผู้รับที่ไม่ผ่านเงื่อนไขได้สำเร็จ",
      tags: ["transfer", "bug"],
      summary:
        "บัตรราคานักเรียนถูกโอนสำเร็จให้ผู้รับที่ไม่ใช่นักเรียนและไม่ผ่านการยืนยันเงื่อนไข ทั้งที่ควรถูกปฏิเสธตาม {{ref:policy:transfer-eligibility-rules-policy}}",
      investigation:
        "ตรวจ `checkTransferEligibility` ใน {{ref:module:transfer-processor}} พบว่าฟังก์ชันนี้ถูกเรียกตอน `initiateTransfer` แต่ไม่ได้ถูกเรียกซ้ำตอน `acceptTransfer` ทำให้ถ้าสถานะผู้รับเปลี่ยนไประหว่างสองขั้นตอน (เช่น หมดสถานะนักเรียนพอดี) ระบบไม่จับได้",
      cause:
        "การตรวจสอบเงื่อนไขทำแค่ครั้งเดียวตอนเริ่มกระบวนการ ไม่ได้ตรวจซ้ำตอนยืนยันจริง ซึ่งเป็นช่องว่างเมื่อมีระยะเวลาห่างกันระหว่างสองขั้นตอน",
      resolution:
        "ยกเลิกการโอนที่ผ่านเงื่อนไขผิด แจ้งทั้งสองฝ่ายให้ดำเนินการใหม่อย่างถูกต้อง",
      followup:
        "เพิ่มการตรวจสอบ `checkTransferEligibility` ซ้ำอีกครั้งตอน `acceptTransfer` ไม่พึ่งพาผลการตรวจสอบจากตอนเริ่มกระบวนการเพียงอย่างเดียว",
    },
    {
      slug: "resale-price-cap-bypass",
      title: "ราคาขายต่อเกินเพดานที่กำหนดหลุดผ่านระบบ",
      tags: ["resale", "bug"],
      summary:
        "ทีม compliance พบการลงขายบัตรต่อในราคาสูงกว่าเพดานที่กำหนดหลายรายการ ทั้งที่ระบบควรปฏิเสธตั้งแต่ขั้นตอนลงขาย",
      investigation:
        "ตรวจ `listForResale` ใน {{ref:module:resale-marketplace}} พบว่าการคำนวณเพดานราคาอ้างอิงจากราคาบัตรที่บันทึกไว้ตอนซื้อ แต่บัตรกลุ่มนี้มาจากการโอนที่ไม่มีการบันทึกราคาต้นทางไว้ ทำให้ระบบใช้ค่า default เป็นราคาสูงสุดที่เคยขายในระบบแทน",
      cause:
        "การออกแบบไม่ครอบคลุมกรณีบัตรที่โอนมาโดยไม่มีข้อมูลราคาต้นทางติดมาด้วย ทำให้ fallback ไปใช้ค่าที่ไม่ถูกต้องแทนการปฏิเสธการลงขายเมื่อไม่มีข้อมูลราคาอ้างอิง",
      resolution:
        "ถอดรายการที่ลงขายเกินเพดานออกจากตลาดทันที แจ้งผู้ขายให้ลงขายใหม่ในราคาที่ถูกต้อง",
      followup:
        "แก้ให้บัตรที่โอนมาโดยไม่มีข้อมูลราคาต้นทางไม่สามารถลงขายต่อได้จนกว่าจะยืนยันราคาต้นทางที่ถูกต้อง แทนการใช้ fallback ที่ไม่ปลอดภัย",
    },
    {
      slug: "entry-scan-accepted-cancelled-ticket",
      title: "เครื่องสแกนยอมรับบัตรที่ถูกยกเลิกไปแล้ว",
      tags: ["scanning", "bug"],
      summary:
        "ผู้ชมที่บัตรถูกยกเลิกและคืนเงินไปแล้วสามารถสแกนเข้างานได้สำเร็จ ทำให้มีคนเข้างานเกินจำนวนที่ขายจริงเล็กน้อย",
      investigation:
        "ตรวจ {{ref:module:entry-scanner}} พบว่าเครื่องสแกนหน้างานใช้ cache ข้อมูลสถานะบัตรที่ดาวน์โหลดไว้ล่วงหน้าก่อนงานเริ่ม เพื่อรองรับกรณี network ไม่เสถียร แต่ cache นี้ไม่ได้ sync สถานะการยกเลิกที่เกิดขึ้นหลังดาวน์โหลด cache ไปแล้ว",
      cause:
        "การออกแบบให้ทำงานแบบ offline-first ด้วย cache ที่ `SCANNER_OFFLINE_CACHE_TTL_MIN` ยาวเกินไปเมื่อเทียบกับความถี่ที่บัตรอาจถูกยกเลิกใกล้เวลางาน ทำให้ cache เก่าเกินจริงในบางกรณี",
      resolution:
        "ตรวจสอบรายชื่อผู้ที่เข้างานด้วยบัตรที่ถูกยกเลิกแล้วหน้างานด้วยมือ ปรับ cache TTL ให้สั้นลงและเพิ่มการ sync สถานะยกเลิกแบบเร่งด่วนก่อนงานเริ่ม",
      followup:
        "ออกแบบให้เครื่องสแกน sync รายการยกเลิกล่าสุดทุกครั้งที่ network กลับมาใช้ได้ระหว่างงาน ไม่ใช่พึ่ง cache ที่ดาวน์โหลดครั้งเดียวก่อนงานเริ่มเท่านั้น",
    },
    {
      slug: "duplicate-entry-check-race-condition",
      title: "การตรวจสอบสแกนซ้ำหลุดเพราะ Race Condition ระหว่างประตู",
      tags: ["scanning", "race-condition"],
      summary:
        "บัตรใบเดียวถูกสแกนผ่านสำเร็จที่สองประตูพร้อมกันในเวลาไล่เลี่ยกันมาก ทั้งที่ควรถูกปฏิเสธที่ประตูที่สองตาม {{ref:policy:entry-scan-duplicate-prevention-policy}}",
      investigation:
        "ตรวจ `checkDuplicateEntry` ใน {{ref:module:entry-scanner}} พบว่าสอง request จากคนละประตูเข้ามาพร้อมกันในเวลาไล่เลี่ยกันมาก ทั้งคู่ query เห็นว่ายังไม่เคยสแกนพร้อมกันก่อนที่ฝ่ายแรกจะบันทึกผลสำเร็จ — เหมือนกับ race condition ที่เคยเกิดกับการจองที่นั่ง",
      cause:
        "การตรวจสอบและบันทึกการสแกนไม่ได้ทำแบบ atomic เหมือนกับปัญหาที่เคยพบใน {{ref:module:seat-inventory}} — เป็นรูปแบบปัญหาเดียวกันที่เกิดซ้ำในอีก module หนึ่งของระบบ",
      resolution:
        "ตรวจสอบว่าใครเข้างานจริงจากบัตรใบนี้ ปฏิเสธอีกฝ่ายและจัดการหน้างานตามความเหมาะสม",
      followup:
        "แก้ `checkDuplicateEntry` ให้ใช้ conditional write แบบ atomic เหมือนที่แก้ไปแล้วใน seat-inventory และตรวจสอบ pattern อ่าน-แล้ว-เขียนที่เหลือในระบบทั้งหมดว่ามีความเสี่ยงเดียวกันอีกหรือไม่",
    },
    {
      slug: "waitlist-offer-window-timezone-bug",
      title: "หน้าต่างเวลายืนยันสิทธิ์ Waitlist คำนวณผิดเพราะ Timezone",
      tags: ["waitlist", "bug"],
      summary:
        "ผู้ซื้อในต่างประเทศที่ได้รับสิทธิ์จาก waitlist พบว่าเวลาที่แสดงในอีเมลกับเวลาที่ระบบตัดสิทธิ์จริงไม่ตรงกัน ทำให้พลาดโอกาสซื้อทั้งที่คิดว่ายังมีเวลาเหลือ",
      investigation:
        "ตรวจ {{ref:module:waitlist-manager}} พบว่าอีเมลแจ้งเตือนแสดงเวลาตาม timezone ท้องถิ่นของผู้รับ แต่การตัดสิทธิ์จริงในระบบคำนวณจาก `WAITLIST_OFFER_CLAIM_WINDOW_MIN` นับจาก UTC โดยไม่ได้แปลงกลับให้สอดคล้องกับที่แสดงในอีเมล",
      cause:
        "ระบบแสดงผลเวลาสองจุด (อีเมลกับ backend logic) คำนวณจากค่าฐานคนละแบบ ไม่ได้ใช้แหล่งเวลาเดียวกันตลอดทั้งกระบวนการ",
      resolution:
        "คืนสิทธิ์ให้ผู้ที่ได้รับผลกระทบ ปรับให้อีเมลและ backend logic อ้างอิงเวลาเดียวกันจากแหล่งเดียวเสมอ",
      followup:
        "ตรวจสอบจุดอื่นในระบบที่แสดงเวลาให้ผู้ใช้เห็นว่าคำนวณจากแหล่งเดียวกับ backend logic จริงหรือไม่ โดยเฉพาะจุดที่มีผลต่อ deadline ที่ผู้ใช้ต้องดำเนินการทัน",
    },
    {
      slug: "resale-listing-not-expiring-near-event",
      title: "รายการขายต่อไม่หมดอายุใกล้วันงานตามที่ควร",
      tags: ["resale", "bug"],
      summary:
        "ผู้ซื้อรายหนึ่งซื้อบัตรจากตลาดขายต่อเพียง 2 ชั่วโมงก่อนงานเริ่ม แต่กระบวนการโอนกรรมสิทธิ์ไม่เสร็จทันเวลา ทำให้เข้างานไม่ได้",
      investigation:
        "ตรวจ {{ref:module:resale-marketplace}} พบว่ากฎที่ควรหมดอายุรายการลงขายเร็วขึ้นเมื่อวันงานใกล้เข้ามาน้อยกว่า 24 ชั่วโมง (ตามที่ระบุใน {{ref:policy:resale-listing-expiry-policy}}) ไม่เคย implement จริง มีแค่ TTL มาตรฐาน `RESALE_LISTING_EXPIRY_DAYS` เท่านั้น",
      cause:
        "นโยบายระบุเงื่อนไขพิเศษไว้แต่การพัฒนาไม่ได้ implement ตามที่ระบุครบทุกกรณี เป็นช่องว่างระหว่างเอกสารนโยบายกับโค้ดจริงที่ใช้งาน",
      resolution:
        "คืนเงินให้ผู้ซื้อที่ได้รับผลกระทบพร้อมค่าชดเชย ปิดการซื้อขายในตลาด resale สำหรับงานที่เหลือเวลาน้อยกว่า 24 ชั่วโมงด้วยมือชั่วคราว",
      followup:
        "implement เงื่อนไขหมดอายุเร็วขึ้นใกล้วันงานให้ตรงตามที่ระบุใน {{ref:policy:resale-listing-expiry-policy}} จริง แล้วเพิ่ม test ยืนยันว่าโค้ดตรงกับนโยบายที่เขียนไว้ทุกข้อ",
    },
    {
      slug: "bot-detection-false-positive-blocked-real-buyer",
      title: "ระบบตรวจจับ Bot บล็อกผู้ซื้อจริงผิดพลาด",
      tags: ["security", "false-positive"],
      summary:
        "ผู้ซื้อจริงหลายคนถูกบล็อกการซื้อบัตรระหว่างช่วงเปิดขายบัตรยอดนิยม เพราะระบบตรวจจับ bot ตีความพฤติกรรมการซื้อเร็วของแฟนคลับที่เตรียมตัวมาอย่างดีว่าเป็น bot",
      investigation:
        "ตรวจ {{ref:policy:bot-purchase-detection-policy}} พบว่าเกณฑ์ความเร็วในการกรอกฟอร์มที่ใช้ตัดสินไม่ได้แยกแยะระหว่างผู้ใช้ที่เตรียมข้อมูลไว้ล่วงหน้า (autofill ของเบราว์เซอร์) กับ bot จริงที่ยิง API ตรง",
      cause:
        "โมเดลตรวจจับ bot ฝึกจากข้อมูลที่ไม่ครอบคลุมพฤติกรรมผู้ใช้จริงที่เตรียมตัวมาดีในสถานการณ์ high-demand ทำให้ false positive rate สูงขึ้นเฉพาะช่วงเปิดขายบัตรยอดนิยม",
      resolution:
        "ปลดบล็อกผู้ใช้ที่ได้รับผลกระทบด้วยมือหลังตรวจสอบว่าไม่ใช่ bot จริง ปรับเกณฑ์การตรวจจับชั่วคราวให้หลวมขึ้นสำหรับงานที่เหลืออยู่",
      followup:
        "ปรับปรุงโมเดลตรวจจับ bot ให้แยกแยะ autofill กับ bot ได้แม่นยำขึ้น และเพิ่มขั้นตอนอุทธรณ์ที่รวดเร็วสำหรับผู้ใช้ที่ถูกบล็อกผิดพลาดระหว่างช่วงเปิดขายบัตรสำคัญ",
    },
    {
      slug: "venue-capacity-exceeded-safety-limit",
      title: "จำนวนบัตรที่ขายเกินเพดานความปลอดภัยของสถานที่",
      tags: ["safety", "compliance"],
      summary:
        "ทีมความปลอดภัยหน้างานพบว่าจำนวนบัตรที่ขายไปแล้วเกินเพดานความจุตามมาตรฐานความปลอดภัยของสถานที่จัดงานเล็กน้อย ต้องประสานงานฉุกเฉินก่อนงานเริ่ม",
      investigation:
        "ตรวจสอบพบว่าผังที่นั่งถูกอัปเดตเพิ่มโซนยืนใหม่หลังจากตั้งเพดานความปลอดภัยไว้แล้ว แต่การอัปเดตเพดานความจุไม่ได้ทำพร้อมกันกับการเพิ่มโซนใหม่",
      cause:
        "การอัปเดตผังที่นั่งกับการอัปเดตเพดานความปลอดภัยเป็นสองขั้นตอนแยกกันที่ไม่มีการบังคับให้ทำพร้อมกัน ทำให้ทีมงานลืมอัปเดตเพดานตอนเพิ่มโซนใหม่",
      resolution:
        "หยุดขายบัตรทันทีเมื่อพบปัญหา ประสานงานกับหน่วยงานความปลอดภัยท้องถิ่นเพื่อยืนยันแนวทางแก้ไขก่อนงานเริ่ม",
      followup:
        "เชื่อมการอัปเดตผังที่นั่งกับเพดานความปลอดภัยให้เป็นขั้นตอนเดียวที่บังคับทบทวนพร้อมกันเสมอ ไม่แยกเป็นสองขั้นตอนอิสระที่พลาดได้ง่าย",
    },
    {
      slug: "seat-map-update-broke-sold-seats",
      title: "อัปเดตผังที่นั่งทำที่นั่งที่ขายไปแล้วหายจากระบบ",
      tags: ["inventory", "bug"],
      summary:
        "หลังผู้จัดงานขอปรับผังที่นั่งเล็กน้อย พบว่าที่นั่งที่ขายไปแล้วหลายที่หายไปจากผังใหม่ ทำให้ผู้ซื้อที่มีบัตรอยู่แล้วไม่มีที่นั่งอ้างอิงในระบบ",
      investigation:
        "ตรวจ {{ref:module:seat-inventory}} พบว่าการอัปเดตผังที่นั่งใช้วิธีลบผังเก่าทั้งหมดแล้วสร้างผังใหม่ทับ แทนที่จะ merge การเปลี่ยนแปลงเข้ากับผังเดิม ทำให้ที่นั่งที่ไม่มีอยู่ในผังใหม่ (แม้จะขายไปแล้ว) หายไปด้วย",
      cause:
        "ฟังก์ชันอัปเดตผังที่นั่งไม่มีการตรวจสอบว่าที่นั่งที่กำลังจะถูกลบมีสถานะ sold อยู่หรือไม่ ขัดกับ {{ref:policy:seat-map-versioning-policy}} ที่ระบุชัดเจนว่าห้ามลบที่นั่งที่ขายไปแล้ว",
      resolution:
        "กู้คืนผังที่นั่งเดิมจาก backup ทันที ประสานงานกับผู้จัดงานให้ปรับผังใหม่ด้วยวิธี merge แทนการทับทั้งหมด",
      followup:
        "แก้ฟังก์ชันอัปเดตผังที่นั่งให้ปฏิเสธการลบที่นั่งที่มีสถานะ sold โดยอัตโนมัติ ตรงตามที่ระบุใน {{ref:policy:seat-map-versioning-policy}} แต่ยังไม่ได้บังคับใช้จริงในโค้ดตอนเกิดเหตุ",
    },
    {
      slug: "reservation-engine-ticket-count-drift",
      title: "จำนวนบัตรต่อผู้ซื้อคำนวณคลาดเคลื่อนจากเพดานจริง",
      tags: ["reservation", "bug"],
      summary:
        "ผู้ซื้อรายหนึ่งสามารถซื้อบัตรได้เกิน 6 ใบตามที่ {{ref:policy:max-tickets-per-buyer-policy}} กำหนดไว้ โดยไม่มีการปฏิเสธจากระบบเลย",
      investigation:
        "ตรวจ `getBuyerTicketCount` ใน {{ref:module:reservation-engine}} พบว่าฟังก์ชันนี้นับเฉพาะการจองที่มีสถานะ confirmed เท่านั้น ไม่นับการจองที่อยู่ระหว่างขั้นตอนชำระเงิน (held) ทำให้ผู้ซื้อเปิดหลาย tab พร้อมกันแล้วจองพร้อมกันได้เกินเพดานก่อนที่รายการแรกจะ confirm",
      cause:
        "การนับจำนวนบัตรไม่ครอบคลุมสถานะ held ที่ยังไม่ confirm ทำให้มีช่วงเวลาที่ผู้ซื้อจองซ้อนหลายรายการพร้อมกันได้เกินเพดานจริง",
      resolution:
        "ยกเลิกการจองส่วนเกินของผู้ซื้อที่ได้รับผลกระทบ คืนที่นั่งเข้าระบบ แจ้งผู้ซื้อทราบเหตุผล",
      followup:
        "แก้ `getBuyerTicketCount` ให้นับรวมทั้งสถานะ held และ confirmed เสมอ เพื่อปิดช่องว่างที่ผู้ซื้อจองซ้อนหลาย tab พร้อมกันเกินเพดาน",
    },
    {
      slug: "corporate-bulk-buyer-approval-skipped",
      title: "สิทธิ์ Bulk Buyer ถูกอนุมัติข้ามขั้นตอนยืนยันองค์กร",
      tags: ["reservation", "process"],
      summary:
        "ทีมขายพบว่ามีบัญชีหนึ่งได้รับสิทธิ์ bulk buyer (ยกเว้นเพดานจำนวนบัตรปกติ) โดยไม่มีการยืนยันตัวตนองค์กรตามขั้นตอนที่ {{ref:policy:max-tickets-per-buyer-policy}} กำหนดไว้ในกรณียกเว้น",
      investigation:
        "ตรวจสอบพบว่าทีมขายใช้ feature ตั้งค่า bulk buyer แบบเร่งด่วนที่เพิ่มเข้ามาสำหรับกรณีฉุกเฉิน แต่ไม่ได้แนบเอกสารยืนยันองค์กรตามขั้นตอนปกติ เพราะ feature เร่งด่วนนี้ไม่มีการบังคับแนบเอกสารในระบบ",
      cause:
        "feature ตั้งค่าเร่งด่วนถูกออกแบบมาให้ทีมขายอนุมัติได้เร็วในกรณีฉุกเฉินจริง แต่ไม่มีการบังคับให้แนบหลักฐานหรือขอ approval เพิ่มเติมภายหลัง ทำให้กลายเป็นช่องโหว่ที่ใช้ได้โดยไม่ต้องยืนยันตัวตนองค์กรจริง",
      resolution:
        "ระงับสิทธิ์ bulk buyer ของบัญชีที่ได้รับผลกระทบชั่วคราว ขอเอกสารยืนยันองค์กรย้อนหลังก่อนคืนสิทธิ์",
      followup:
        "เพิ่มการบังคับแนบเอกสารยืนยันองค์กรภายใน 48 ชั่วโมงหลังใช้ feature ตั้งค่าเร่งด่วน ถ้าไม่มีเอกสารให้ระงับสิทธิ์อัตโนมัติ ไม่ปล่อยให้สิทธิ์คงอยู่โดยไม่มีการยืนยันตามขั้นตอนปกติ",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/TIX-412-atomic-seat-hold`, `fix/TIX-428-waitlist-order-by`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(seat-inventory): ใช้ conditional update แบบ atomic กันจองซ้อน`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้สถานะที่นั่งหรือการสแกนต้องมี test ครอบคลุมกรณี concurrent call เสมอ (ดูบทเรียนจาก {{ref:incident:seat-inventory-double-booking-race-condition}} และ {{ref:incident:duplicate-entry-check-race-condition}}) เพราะปัญหานี้เกิดซ้ำในหลาย module" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `holdSeat`, `checkDuplicateEntry` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier", body: "`seatId` รูปแบบ `seat_<ULID>`, `ticketId` รูปแบบ `tix_<ULID>` ต้องใช้ ULID ไม่ใช่ incrementing integer เพื่อไม่ให้เดาจำนวนบัตรทั้งระบบได้" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับการจอง โอน หรือสแกนบัตรต้องมี `requestId` เสมอ เพื่อไล่ log ข้าม service ได้ ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ห้าม log ข้อมูลส่วนตัวผู้ซื้อ", body: "ห้าม log ชื่อหรือข้อมูลติดต่อของผู้ซื้อลงใน application log เด็ดขาด แม้เพื่อ debug ก็ตาม ใช้ buyerId เท่านั้น" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`TIX_<DOMAIN>_<REASON>` เช่น `TIX_SEAT_ALREADY_HELD`, `TIX_TRANSFER_INELIGIBLE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`TIX_RESALE_PRICE_EXCEEDS_CAP`, `TIX_ENTRY_DUPLICATE_SCAN`, `TIX_WAITLIST_OFFER_EXPIRED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "quality"],
      sections: [
        { heading: "Concurrent test", body: "ฟังก์ชันที่แก้สถานะที่นั่งหรือการสแกนต้องมี test จำลอง concurrent call อย่างน้อย 2 ตัวเสมอ — บทเรียนจาก {{ref:incident:seat-inventory-double-booking-race-condition}}" },
        { heading: "Timezone test", body: "ฟังก์ชันที่คำนวณ deadline ที่ผู้ใช้เห็นต้องมี test เทียบข้าม timezone เสมอ — บทเรียนจาก {{ref:incident:waitlist-offer-window-timezone-bug}}" },
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
      slug: "concurrency-control-convention",
      title: "Concurrency Control Convention",
      tags: ["reliability", "database"],
      intro: "เอกสารนี้กำหนดวิธีจัดการ concurrent write ให้สอดคล้องกันทั้งระบบ เพราะเป็นปัญหาที่เกิดซ้ำหลายครั้งในหลาย module ของโดเมนนี้",
      sections: [
        { heading: "หลักการทั่วไป", body: "ฟังก์ชันที่แก้ไขสถานะที่มีผลกระทบทางธุรกิจสำคัญ (ที่นั่ง, การสแกนเข้างาน) ต้องใช้ conditional update แบบ atomic เสมอ ไม่ใช่อ่านค่าปัจจุบันมาตรวจสอบแล้วเขียนแยกเป็นสองขั้นตอน" },
        { heading: "บทเรียนจากเหตุการณ์จริง", body: "ปัญหานี้เกิดซ้ำทั้งใน {{ref:incident:seat-inventory-double-booking-race-condition}} และ {{ref:incident:duplicate-entry-check-race-condition}} — เป็นสัญญาณว่าทีมต้องตรวจสอบ pattern นี้เชิงรุกในทุก module ใหม่ที่เขียนขึ้น ไม่ใช่รอให้เกิดปัญหาก่อนแล้วค่อยแก้ทีละจุด" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → concurrency test (ครอบคลุมทุกฟังก์ชันที่แก้สถานะที่นั่ง/บัตร) → deploy staging → smoke test → deploy production ทีละ service ไม่ deploy พร้อมกันทั้งระบบ" },
        { heading: "Gate พิเศษ", body: "{{ref:module:seat-inventory}} และ {{ref:module:entry-scanner}} ต้องผ่าน concurrency test 100% ก่อน merge เสมอ เพราะความผิดพลาดในสองจุดนี้กระทบประสบการณ์หน้างานจริงที่แก้ไขยาก" },
      ],
    },
    {
      slug: "connection-timeout-tuning",
      title: "Connection Timeout Tuning",
      tags: ["timeout", "infrastructure"],
      sections: [
        { heading: "ค่าปัจจุบัน", body: "| Layer | ค่า | ตั้งที่ไหน |\n|---|---|---|\n| API gateway → seat-inventory | 1.5s | env `GATEWAY_UPSTREAM_TIMEOUT_MS` |\n| entry-scanner → database pool acquire | 500ms | `pg-pool` config |\n| resale-marketplace → transfer-processor | 3s | env `TRANSFER_CALL_TIMEOUT_MS` |" },
        { heading: "เหตุผลที่ entry-scanner timeout สั้นมาก", body: "การสแกนบัตรหน้างานต้องเร็วที่สุดเพื่อไม่ให้แถวเข้างานยาว timeout 500ms ทำให้เครื่องสแกนสลับไปใช้ cache offline เร็วขึ้นถ้า network ช้าผิดปกติ" },
      ],
    },
    {
      slug: "event-launch-capacity-runbook",
      title: "Event Launch Capacity Runbook",
      tags: ["scaling", "runbook"],
      intro: "ขั้นตอนเตรียมความพร้อมก่อนเปิดขายบัตรงานยอดนิยมที่คาดว่าจะมีผู้เข้าใช้พร้อมกันจำนวนมาก",
      sections: [
        { heading: "ก่อนเปิดขาย", body: "scale {{ref:module:seat-inventory}} และ {{ref:module:reservation-engine}} ล่วงหน้าตามจำนวนที่นั่งและระดับความนิยมที่คาดการณ์ ไม่รอ autoscale ตอบสนองแบบ reactive เพราะ traffic พุ่งขึ้นทันทีตอนเปิดขายไม่ใช่ค่อยๆ เพิ่ม" },
        { heading: "ระหว่างเปิดขาย", body: "เปิดใช้ waiting room (จำกัดจำนวนคนเข้าหน้าซื้อพร้อมกัน) สำหรับงานที่คาดว่า demand จะสูงกว่าจำนวนที่นั่งมาก เพื่อป้องกันระบบล่มจาก traffic พุ่งพร้อมกัน" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = ที่นั่งจองซ้อนหรือบัตรปลอมผ่านการสแกนเข้างาน, Sev2 = กระทบระบบขายต่อหรือ waitlist บางส่วน, Sev3 = กระทบเล็กน้อยไม่ถึงการซื้อขายหรือเข้างานโดยตรง" },
        { heading: "กรณีที่เกี่ยวกับหน้างานจริง", body: "ทุกเหตุการณ์ที่กระทบการเข้างานจริง (สแกนผิดพลาด, ที่นั่งจองซ้อน) ต้องยกระดับเป็น Sev1 เสมอเมื่อเกิดในวันงาน เพราะแก้ไขหน้างานยากกว่าการแก้ในระบบมาก" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "hold ที่ค้างเกิน TTL ไม่ถูกปล่อยคืน, entry scan error rate เกิน 5% ในช่วงเปิดประตู, resale listing ที่ราคาเกินเพดานหลุดผ่านการตรวจสอบ" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1/Sev2 แจ้งเข้า on-call ทันทีทาง pager โดยเฉพาะช่วงเปิดขายบัตรและวันงานจริง ส่วน Sev3 รวมเป็น digest รายวันพอ" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้เกิดการจองซ้อนที่นั่งหรือสแกนบัตรผิดพลาด ต้อง rollback ทันทีโดยไม่ต้องรอ approval — บทเรียนจาก {{ref:incident:seat-inventory-double-booking-race-condition}}" },
        { heading: "ขั้นตอน", body: "deploy เวอร์ชันก่อนหน้ากลับผ่าน pipeline เดียวกับ deploy ปกติ (ไม่ skip smoke test) แล้วแจ้งทีมงานทันทีโดยเฉพาะถ้าเกิดใกล้ช่วงเปิดขายบัตรหรือวันงานจริง" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| seat-inventory | 4 | 30 | latency p95 > 80ms |\n| entry-scanner | 3 | 15 | queue depth > 100 |\n| resale-marketplace | 2 | 6 | latency p95 > 200ms |" },
        { heading: "ข้อจำกัดที่ต้องระวัง", body: "seat-inventory ต้อง scale ล่วงหน้าก่อนเปิดขายบัตรงานยอดนิยมเสมอ ไม่รอ autoscale ตอบสนองตาม load แบบ reactive เพราะ traffic พุ่งขึ้นทันทีในวินาทีแรกที่เปิดขาย" },
      ],
    },
    {
      slug: "gate-hardware-failover-runbook",
      title: "Gate Hardware Failover Runbook",
      tags: ["scanning", "runbook"],
      intro: "ขั้นตอนเมื่อเครื่องสแกนหน้างานเสียหรือ network หน้างานมีปัญหา ต้องมีแผนสำรองเพราะกระทบการเข้างานของผู้ชมจำนวนมากโดยตรง",
      sections: [
        { heading: "การตรวจจับ", body: "monitor heartbeat ของเครื่องสแกนทุกตัวผ่าน `GATE_HEARTBEAT_INTERVAL_SEC` ถ้าเครื่องไหนขาดการติดต่อเกิน 3 รอบติดกันให้แจ้งทีมหน้างานทันที" },
        { heading: "แผนสำรอง", body: "เครื่องสแกนที่ network หลุดจะสลับไปใช้ cache offline อัตโนมัติตาม `SCANNER_OFFLINE_CACHE_TTL_MIN` — บทเรียนจาก {{ref:incident:entry-scan-accepted-cancelled-ticket}} คือต้อง sync สถานะยกเลิกล่าสุดทันทีที่ network กลับมาเพื่อลดความเสี่ยงรับบัตรที่ถูกยกเลิกไปแล้ว" },
      ],
    },
  ],
};
