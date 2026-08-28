import type { DomainProfile } from "../types.js";

// LearnPath — ระบบ Learning Management System สำหรับองค์กร (corporate LMS)
// เป็น distractor domain ไม่เกี่ยวกับ payment/refund/order ของ PayFlow เลย
export const eLearning: DomainProfile = {
  id: "e-learning",
  displayName: "LearnPath — ระบบ Learning Management System",
  summary: [
    "LearnPath คือแพลตฟอร์ม Learning Management System (LMS) สำหรับองค์กรที่ต้องการจัดการการฝึกอบรมพนักงาน ครอบคลุมตั้งแต่การจัดการคอร์ส การติดตาม progress ของผู้เรียน การออก certificate และการจัดตารางสอนของ instructor ระบบเชื่อมต่อกับ HR system ของลูกค้าเพื่อดึงข้อมูลพนักงานและ sync สถานะ compliance การฝึกอบรม",
    "ระบบแบ่งเป็น service ย่อยตามหน้าที่ ตั้งแต่ catalog ของคอร์สทั้งหมด การติดตามความคืบหน้าของผู้เรียนแบบ real-time การตรวจคำตอบแบบทดสอบ การออก certificate อัตโนมัติ และการจัดการ compliance deadline สำหรับ regulatory training ทีมพัฒนาให้ความสำคัญกับ data integrity ของ progress เป็นพิเศษเพราะการสูญหายของข้อมูลการเรียนกระทบต่อ certification ที่มีผลทางกฎหมาย",
  ],
  domainTags: ["e-learning", "learnpath"],
  serviceBoundaryNote: [
    "แต่ละ service มี database ของตัวเอง ไม่ share ตารางข้ามกัน — {{ref:module:progress-tracker}} เป็นเจ้าของ learning progress ทั้งหมด ส่วน {{ref:module:assessment-engine}} เป็นเจ้าของ quiz/exam data และผลคะแนน ทั้งสองไม่รู้จักข้อมูลของกันและกันโดยตรง",
    "{{ref:module:certificate-issuer}} เป็น service เดียวที่ query ข้าม {{ref:module:progress-tracker}} และ {{ref:module:assessment-engine}} พร้อมกันได้ เพราะการออก certificate ต้องยืนยันทั้ง completion ของเนื้อหาและผ่านเกณฑ์คะแนน การแยกออกจะทำให้เกิด race condition ที่ออก certificate โดยที่ยังไม่ผ่านเงื่อนไขครบ",
  ],
  apiGatewayNote: [
    "คำขอจากผู้เรียน instructor และ HR admin เข้ามาทาง REST ผ่าน API gateway กลาง ซึ่งทำหน้าที่ authenticate และ route ไปยัง service ที่เกี่ยวข้อง คำขอที่เกี่ยวกับ progress และ quiz ผ่านทาง synchronous call เพราะผู้เรียนต้องรอผลทันที",
    "Event ที่เกิดจากผู้เรียนทำกิจกรรม เช่น เปิด video บทเรียน ส่งคำตอบ quiz หรือ request certificate ถูกส่งผ่าน event queue เพื่อให้ service ที่เกี่ยวข้องประมวลผล async ลด latency ที่ผู้เรียนรู้สึก",
  ],
  databaseSchemaNote: [
    "ตารางหลักที่ {{ref:module:progress-tracker}} ดูแล ได้แก่ `learner_enrollments` (สถานะการ enroll), `content_progress` (progress ต่อ lesson/section), และ `completion_events` (event log ทุกการสำเร็จ ไม่ลบทิ้งเพื่อ audit)",
    "| ตาราง | เจ้าของ | หมายเหตุ |\n|---|---|---|\n| `courses` | course-catalog | metadata คอร์สและ version |\n| `content_progress` | progress-tracker | อัปเดตทุกครั้งที่ผู้เรียน interact |\n| `assessment_attempts` | assessment-engine | ทุก attempt รวม wrong answers |\n| `certificates` | certificate-issuer | ประวัติ certificate ทั้งหมด |\n| `compliance_records` | compliance-deadline-monitor | สถานะ compliance ต่อพนักงาน |",
    "ทุกตารางที่เกี่ยวกับผู้เรียนใช้ `learner_id` ที่มาจาก HR system เป็น reference หลัก ไม่ใช่ internal UUID เพื่อให้ reconcile กับ HR data ได้ตรงๆ โดยไม่ต้องมี mapping table เพิ่ม",
  ],
  queueArchitectureNote: [
    "Event หลักที่ไหลผ่าน message queue คือ `lesson.completed`, `assessment.submitted`, `assessment.graded`, `certificate.issued`, `compliance.deadline_approaching`, `compliance.overdue` — {{ref:module:compliance-deadline-monitor}} subscribe หลาย event เพื่อ track สถานะ compliance แบบ real-time",
    "{{ref:module:certificate-issuer}} subscribe `assessment.graded` และ `lesson.completed` เพื่อตรวจสอบว่าผู้เรียน qualify สำหรับ certificate หรือยัง โดยไม่ต้องรอให้ผู้เรียน request เอง — ระบบจะ pre-evaluate และแจ้งให้ผู้เรียนรู้ทันทีที่ผ่านเงื่อนไขทั้งหมด",
  ],
  modules: [
    {
      slug: "course-catalog",
      name: "course-catalog",
      tags: ["course", "module", "core"],
      description:
        "จัดการข้อมูล metadata ของคอร์สทั้งหมดในระบบ ครอบคลุม course version management, prerequisite mapping, learning objective, และ content structure ทุก service ที่ต้องรู้ว่าคอร์สมีเนื้อหาอะไรต้อง query ผ่าน service นี้เท่านั้น ไม่ให้ service อื่นเก็บ course metadata ซ้ำ",
      functions: [
        { sig: "getCourse(courseId: string, version?: string): Promise<Course>", desc: "ดึง course metadata รวม structure และ prerequisite สำหรับ version ที่ระบุ หรือ latest ถ้าไม่ระบุ" },
        { sig: "publishCourse(courseId: string, content: CourseContent): Promise<string>", desc: "publish version ใหม่ของคอร์ส คืน version string และ invalidate cache ของ version ก่อน" },
        { sig: "checkPrerequisites(learnerId: string, courseId: string): Promise<PrerequisiteResult>", desc: "ตรวจสอบว่าผู้เรียนผ่าน prerequisite ของคอร์สนี้หรือยังก่อน enroll" },
        { sig: "deprecateCourse(courseId: string, replacedBy?: string): Promise<void>", desc: "ปลด active status ของคอร์ส ป้องกัน enrollment ใหม่แต่ยังคงให้ผู้เรียนที่ enroll แล้วจบได้" },
      ],
      stateFlow: "draft → review → published → deprecated — คอร์ส deprecated ยังเข้าถึงได้สำหรับผู้เรียนที่ enroll ก่อน deprecated แต่ห้าม enroll ใหม่",
      relatedNotes:
        "{{ref:module:progress-tracker}} เรียก `getCourse` เพื่อรู้ structure ของคอร์สก่อนบันทึก progress แต่ course-catalog ไม่รู้จักว่าใครกำลังเรียนอะไร — ข้อมูลนั้นเป็นของ {{ref:module:progress-tracker}} ทั้งหมด",
      internals: {
        constants: [
          { name: "MAX_COURSE_VERSIONS_RETAINED", value: "10" },
          { name: "DRAFT_EXPIRY_DAYS", value: "30" },
          { name: "PREREQUISITE_CHECK_CACHE_TTL_MIN", value: "15" },
        ],
        typeSnippet:
          "interface Course {\n  courseId: string;\n  version: string;\n  title: string;\n  status: \"draft\" | \"review\" | \"published\" | \"deprecated\";\n  prerequisites: string[];\n  estimatedDurationMin: number;\n  passingScorePct: number;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ไม่มีคำอธิบาย business rule — ดู business rule เรื่องเกณฑ์ผ่านที่ {{ref:policy:passing-score-threshold-policy}} และ course version ที่ {{ref:policy:content-version-policy}}",
      },
    },
    {
      slug: "progress-tracker",
      name: "progress-tracker",
      tags: ["progress", "module", "core"],
      description:
        "บันทึกและติดตาม learning progress ของผู้เรียนทุกคนแบบ real-time ครอบคลุมตั้งแต่การ enroll การเปิดบทเรียน การทำแบบทดสอบ จนถึงการสำเร็จคอร์ส เป็น single source of truth สำหรับสถานะการเรียนของผู้เรียนแต่ละคน ไม่มี service อื่นที่เก็บ progress ซ้ำ",
      functions: [
        { sig: "enrollLearner(learnerId: string, courseId: string): Promise<Enrollment>", desc: "สร้าง enrollment record ตรวจสอบ prerequisite และ duplicate enrollment ก่อนยืนยัน" },
        { sig: "recordProgress(learnerId: string, courseId: string, contentId: string, pct: number): Promise<void>", desc: "บันทึก progress ของบทเรียนแต่ละชิ้น รวม idempotency check ป้องกัน regression" },
        { sig: "getLearnerProgress(learnerId: string, courseId: string): Promise<LearnerProgress>", desc: "ดึง overall progress รวม completion status และ time spent" },
        { sig: "markCourseComplete(learnerId: string, courseId: string): Promise<void>", desc: "ยืนยัน completion หลังจากผ่านทุก section และ assessment แล้ว publish event `lesson.completed`" },
      ],
      stateFlow: "enrolled → in_progress → awaiting_assessment → completed | expired — ดู {{ref:policy:course-enrollment-policy}} สำหรับเงื่อนไข expiry",
      relatedNotes:
        "ไม่รู้จัก content ของบทเรียนโดยตรง รู้แค่ `contentId` และ percentage complete — content metadata อยู่ที่ {{ref:module:course-catalog}} ทั้งหมด {{ref:module:certificate-issuer}} subscribe event `lesson.completed` จาก service นี้เพื่อ pre-evaluate certificate eligibility",
      internals: {
        constants: [
          { name: "PROGRESS_REGRESSION_GUARD", value: "true" },
          { name: "ENROLLMENT_EXPIRY_DAYS", value: "365" },
          { name: "COMPLETION_THRESHOLD_PCT", value: "100" },
        ],
        typeSnippet:
          "interface LearnerProgress {\n  learnerId: string;\n  courseId: string;\n  enrolledAt: string;\n  overallPct: number;\n  status: \"enrolled\" | \"in_progress\" | \"awaiting_assessment\" | \"completed\" | \"expired\";\n  contentProgress: Record<string, number>;\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง duplicate enrollment ที่ {{ref:policy:course-enrollment-policy}} และ expiry ที่ {{ref:policy:learner-data-retention-policy}}",
      },
    },
    {
      slug: "assessment-engine",
      name: "assessment-engine",
      tags: ["assessment", "quiz", "module", "core"],
      description:
        "จัดการแบบทดสอบและการตรวจคำตอบทั้งหมด ครอบคลุมการสร้าง quiz instance สำหรับผู้เรียนแต่ละคน การบันทึกคำตอบ การตรวจคะแนนอัตโนมัติ และการจัดการ retake ตาม cooldown policy ระบบออกแบบให้ question randomization ป้องกันการ copy คำตอบข้ามผู้เรียน โดยยังคง difficulty consistency",
      functions: [
        { sig: "startAssessment(learnerId: string, assessmentId: string): Promise<AssessmentSession>", desc: "สร้าง quiz session ใหม่ด้วย question set ที่ randomize สำหรับผู้เรียนนี้โดยเฉพาะ" },
        { sig: "submitAnswer(sessionId: string, questionId: string, answer: string): Promise<void>", desc: "บันทึกคำตอบพร้อม timestamp — จะ reject ถ้า timer หมดแล้ว ดู {{ref:policy:quiz-timer-policy}}" },
        { sig: "gradeAssessment(sessionId: string): Promise<AssessmentResult>", desc: "ตรวจคะแนนและ publish event `assessment.graded` พร้อมผลลัพธ์" },
        { sig: "requestRetake(learnerId: string, assessmentId: string): Promise<RetakeEligibility>", desc: "ตรวจสอบว่าผ่าน cooldown แล้วหรือยัง ดู {{ref:policy:retake-cooldown-policy}}" },
      ],
      stateFlow: "pending → in_progress → submitted → graded — session ที่ timer หมดโดยไม่ submit จะถูก auto-grade ด้วยคำตอบที่ส่งมาแล้วเท่านั้น",
      relatedNotes:
        "ไม่รู้จักว่าผู้เรียนเรียนคอร์สไหนจบแล้วหรือยัง รู้แค่ว่า assessment นี้ผ่าน/ไม่ผ่าน — {{ref:module:certificate-issuer}} รับผิดชอบ logic การตัดสินว่าผ่านคะแนนทุก component แล้วจึง qualify certificate",
      internals: {
        constants: [
          { name: "DEFAULT_QUIZ_TIMER_MIN", value: "30" },
          { name: "MAX_QUESTIONS_PER_SESSION", value: "50" },
          { name: "ANSWER_SUBMISSION_GRACE_PERIOD_SEC", value: "30" },
        ],
        typeSnippet:
          "interface AssessmentSession {\n  sessionId: string;\n  learnerId: string;\n  assessmentId: string;\n  questions: Question[];\n  startedAt: string;\n  timerMinutes: number;\n  status: \"pending\" | \"in_progress\" | \"submitted\" | \"graded\";\n}",
        closingNote:
          "เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง retake ที่ {{ref:policy:retake-cooldown-policy}} และ timer ที่ {{ref:policy:quiz-timer-policy}}",
      },
    },
    {
      slug: "certificate-issuer",
      name: "certificate-issuer",
      tags: ["certificate", "module"],
      description:
        "ออก certificate ให้ผู้เรียนที่ผ่านเงื่อนไขทั้งหมด ได้แก่ content completion 100% และคะแนน assessment ผ่านเกณฑ์ที่กำหนดในคอร์ส เป็น service เดียวที่ cross-query ทั้ง {{ref:module:progress-tracker}} และ {{ref:module:assessment-engine}} เพื่อยืนยันเงื่อนไขก่อนออก certificate ป้องกันการออก certificate ก่อนเวลา",
      functions: [
        { sig: "evaluateCertificateEligibility(learnerId: string, courseId: string): Promise<EligibilityResult>", desc: "ตรวจสอบว่าผู้เรียน qualify สำหรับ certificate โดย cross-check progress และ assessment score" },
        { sig: "issueCertificate(learnerId: string, courseId: string): Promise<Certificate>", desc: "ออก certificate พร้อม unique certificate ID และ expiry date ตาม {{ref:policy:certificate-expiry-policy}}" },
        { sig: "revokeCertificate(certificateId: string, reason: string): Promise<void>", desc: "ยกเลิก certificate ด้วย audit log ดู {{ref:policy:certificate-revocation-policy}}" },
        { sig: "verifyCertificate(certificateId: string): Promise<VerificationResult>", desc: "ยืนยันความถูกต้องของ certificate สำหรับ third party ที่ต้องการตรวจสอบ" },
      ],
      relatedNotes:
        "subscribe event `assessment.graded` และ `lesson.completed` (ดู {{ref:arch:queue}}) เพื่อ trigger eligibility check อัตโนมัติโดยไม่รอให้ผู้เรียน request ก่อน ลดเวลารอ certificate หลังผ่านเงื่อนไข และ prevent race condition ที่เกิดจากการ issue certificate ก่อน progress sync เสร็จ",
    },
    {
      slug: "instructor-scheduler",
      name: "instructor-scheduler",
      tags: ["instructor", "scheduling", "module"],
      description:
        "จัดการตารางสอนของ instructor ทั้งหมด ครอบคลุมการนัดหมาย live session การ assign instructor ให้กับ cohort ผู้เรียน และการตรวจสอบ conflict ของตาราง แยกออกมาเป็น service อิสระเพราะ scheduling logic มีความซับซ้อนของ timezone หลายโซนและข้อจำกัดของ instructor แต่ละคนที่ไม่เกี่ยวกับ learning content",
      functions: [
        { sig: "scheduleSession(instructorId: string, courseId: string, slot: TimeSlot): Promise<Session>", desc: "นัดหมาย live session ตรวจสอบ conflict ของ instructor และ venue ก่อนยืนยัน" },
        { sig: "checkInstructorAvailability(instructorId: string, dateRange: DateRange): Promise<AvailabilitySlot[]>", desc: "คืนช่วงเวลาที่ instructor ว่างสำหรับการ schedule session ใหม่" },
        { sig: "resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>", desc: "แก้ไข conflict ที่พบ ดู {{ref:policy:instructor-conflict-resolution-policy}}" },
        { sig: "notifySessionChange(sessionId: string, changeType: string): Promise<void>", desc: "แจ้ง instructor และผู้เรียนที่ enroll เมื่อ session เปลี่ยนแปลง" },
      ],
      relatedNotes:
        "ไม่รู้จักสถานะการเรียนของผู้เรียนเลย รู้แค่ว่ามีผู้เรียนกี่คนที่ enroll ใน cohort — ข้อมูล progress เป็นของ {{ref:module:progress-tracker}} ทั้งหมด ดู {{ref:policy:instructor-conflict-resolution-policy}} สำหรับกติกาการจัดการ conflict",
    },
    {
      slug: "compliance-deadline-monitor",
      name: "compliance-deadline-monitor",
      tags: ["compliance", "deadline", "module"],
      description:
        "ติดตาม compliance training deadline ของพนักงานทุกคนตาม regulatory requirement ที่กำหนด แจ้งเตือนล่วงหน้า 30, 14, 7 วันก่อน deadline และ escalate ไปยัง manager เมื่อ deadline ใกล้มากหรือเลยไปแล้ว ระบบ sync สถานะ compliance กับ HR system ทุกวันเพื่อให้ HR รายงาน compliance ได้ถูกต้อง",
      functions: [
        { sig: "evaluateCompliance(learnerId: string, regulatoryFramework: string): Promise<ComplianceStatus>", desc: "ประเมินสถานะ compliance ของผู้เรียนสำหรับ regulatory framework ที่ระบุ" },
        { sig: "scheduleDeadlineReminders(learnerId: string, courseId: string, deadline: string): Promise<void>", desc: "ตั้ง reminder schedule ตาม {{ref:policy:mandatory-compliance-deadline-policy}}" },
        { sig: "escalateOverdue(learnerId: string, courseId: string): Promise<void>", desc: "ส่ง escalation ไปยัง manager และ HR เมื่อ deadline เลยไปแล้ว" },
        { sig: "generateComplianceReport(orgId: string, framework: string): Promise<ComplianceReport>", desc: "สร้าง compliance report สรุปสถานะของพนักงานทุกคนใน org สำหรับ regulatory audit" },
      ],
      relatedNotes:
        "Subscribe event `certificate.issued` จาก {{ref:module:certificate-issuer}} เพื่ออัปเดต compliance status อัตโนมัติโดยไม่ต้อง polling progress ทุกนาที และ sync ข้อมูลกับ HR system ผ่าน daily batch job ไม่ใช่ real-time เพราะ HR system ไม่รองรับ webhook",
    },
  ],
  envVarGroups: [
    {
      service: "course-catalog-service",
      vars: [
        { name: "CATALOG_CACHE_TTL_MIN", example: "60", note: "Course metadata ถูก cache — invalidate เมื่อ publish version ใหม่" },
        { name: "DRAFT_EXPIRY_DAYS", example: "30", note: "Draft ที่ไม่มีการแก้ไขเกินนี้จะ archive อัตโนมัติ" },
      ],
    },
    {
      service: "progress-tracker-service",
      vars: [
        { name: "ENROLLMENT_EXPIRY_DAYS", example: "365", note: "ดู {{ref:policy:course-enrollment-policy}}" },
        { name: "PROGRESS_BATCH_FLUSH_INTERVAL_MS", example: "5000", note: "Progress event จาก learner ถูก batch ก่อน write เพื่อลด DB load" },
        { name: "PROGRESS_DB_URL", example: "postgres://progress-db.internal:5432/learnpath_progress", note: "secret ห้าม log" },
      ],
    },
    {
      service: "assessment-engine-service",
      vars: [
        { name: "DEFAULT_QUIZ_TIMER_MIN", example: "30", note: "ดู {{ref:policy:quiz-timer-policy}}" },
        { name: "RETAKE_COOLDOWN_HOURS", example: "24", note: "ดู {{ref:policy:retake-cooldown-policy}}" },
        { name: "ANSWER_GRACE_PERIOD_SEC", example: "30", note: "เวลาผ่อนผันหลัง timer หมดก่อน reject submission" },
      ],
    },
    {
      service: "compliance-deadline-monitor-service",
      vars: [
        { name: "REMINDER_ADVANCE_DAYS", example: "30,14,7", note: "วันที่ส่ง reminder ล่วงหน้า (comma-separated)" },
        { name: "HR_SYNC_INTERVAL_HOURS", example: "24", note: "ความถี่ sync สถานะ compliance ไปยัง HR system" },
        { name: "ESCALATION_DELAY_DAYS", example: "3", note: "รอกี่วันหลัง deadline ก่อน escalate ไปยัง manager ดู {{ref:policy:mandatory-compliance-deadline-policy}}" },
      ],
    },
  ],
  policies: [
    {
      slug: "passing-score-threshold-policy",
      title: "นโยบายเกณฑ์คะแนนผ่านการประเมิน",
      tags: ["assessment", "passing-score", "policy"],
      isPrimary: true,
      intro: [
        "แต่ละคอร์สกำหนด `passingScorePct` ไว้ใน course metadata ที่ {{ref:module:course-catalog}} จัดการ เกณฑ์ขั้นต่ำ default คือ 70% แต่คอร์สประเภท compliance หรือ safety อาจกำหนดสูงกว่า เช่น 80% หรือ 90% ขึ้นกับ regulatory requirement",
        "{{ref:module:assessment-engine}} ตรวจคะแนนและ publish `assessment.graded` event ส่วน {{ref:module:certificate-issuer}} เป็นผู้ตัดสินใจสุดท้ายว่าผ่าน threshold ของคอร์สนั้นหรือไม่ เพราะ threshold อยู่ใน course metadata ไม่ใช่ใน assessment engine",
      ],
      sections: [
        {
          heading: "ทำไมไม่ hardcode threshold ใน assessment engine",
          body: "Threshold เป็น business decision ที่ต่างกันแต่ละคอร์ส การ hardcode ใน assessment engine จะทำให้ต้องแก้ code ทุกครั้งที่ regulatory requirement เปลี่ยน แทนที่จะแก้ใน course configuration เพียงที่เดียว",
        },
      ],
      edgeCase: {
        title: "ข้อยกเว้นเกณฑ์คะแนน: คอร์สที่มีหลาย Assessment Component",
        tags: ["assessment", "passing-score", "edge-case"],
        body: [
          "คอร์สที่มีทั้ง knowledge test และ practical assessment (เช่น คอร์ส safety ที่ต้องทั้งรู้ทฤษฎีและแสดงทักษะ) ต้องผ่าน threshold ของทุก component แยกกัน ไม่ใช่ average รวม — ผ่าน knowledge test 95% แต่ practical 60% ในคอร์สที่ require ผ่าน 70% ทั้งคู่ ถือว่าไม่ผ่าน",
          "{{ref:module:certificate-issuer}} ต้องตรวจสอบ component list จาก {{ref:module:course-catalog}} ก่อนออก certificate เสมอ ไม่ใช่แค่ตรวจ overall score เพราะ course version ใหม่อาจเพิ่ม component ใหม่ได้",
        ],
      },
    },
    {
      slug: "certificate-expiry-policy",
      title: "นโยบายอายุและการต่ออายุ Certificate",
      tags: ["certificate", "expiry", "policy"],
      isPrimary: true,
      intro: [
        "Certificate มีอายุตามที่กำหนดในแต่ละคอร์ส คอร์ส compliance ที่กำหนดโดย regulation มักมีอายุ 1-2 ปี ส่วนคอร์สทักษะทั่วไปอาจไม่มีวันหมดอายุหรืออายุ 3-5 ปี อายุ certificate ถูกตั้งใน course metadata โดย content admin",
        "ระบบจะแจ้งเตือนผู้เรียน 60 วันก่อน certificate หมดอายุเพื่อให้มีเวลา refresh training {{ref:module:compliance-deadline-monitor}} รับผิดชอบการส่ง reminder นี้สำหรับ compliance certificate โดยเฉพาะ",
      ],
      edgeCase: {
        title: "ข้อยกเว้น: Certificate หมดอายุระหว่าง Active Compliance Period",
        tags: ["certificate", "expiry", "edge-case"],
        body: [
          "ถ้า certificate ของพนักงานหมดอายุในช่วงที่ยังอยู่ระหว่างโปรเจกต์ที่ต้องการ certification นั้นอยู่ การ revoke access ทันทีอาจกระทบ business continuity ได้ กรณีนี้ HR admin สามารถ request grace period ได้ไม่เกิน 30 วันสำหรับการต่ออายุ certificate",
          "Grace period ต้องได้รับอนุมัติจาก compliance officer และต้องมีหลักฐานว่าพนักงานได้ลง enroll คอร์สต่ออายุแล้ว ไม่ใช่แค่ขอ grace period ล่วงหน้าโดยไม่มีแผน grace period ไม่ extend ซ้ำ หมดแล้วต้องต่ออายุจริงก่อนใช้ certificate ต่อไป",
        ],
      },
    },
    {
      slug: "retake-cooldown-policy",
      title: "นโยบาย Cooldown ก่อน Retake Assessment",
      tags: ["assessment", "retake", "cooldown", "policy"],
      isPrimary: true,
      intro: [
        "ผู้เรียนที่สอบไม่ผ่านต้องรอ `RETAKE_COOLDOWN_HOURS` ชั่วโมงก่อนจะ request retake ได้ เพื่อให้มีเวลา review เนื้อหาก่อนลองใหม่ และป้องกัน brute-force ที่ลองสุ่มคำตอบซ้ำๆ",
        "จำนวน retake ไม่จำกัดสำหรับคอร์สทั่วไป แต่คอร์ compliance ที่ sensitive สามารถกำหนดจำนวน attempt สูงสุดได้ เมื่อครบ max attempt ต้องให้ supervisor สั่ง reset ด้วยมือเพื่อป้องกันการใช้สิทธิ์ retake เป็น shortcut",
      ],
      edgeCase: {
        title: "ข้อยกเว้น Cooldown: กรณีเทคนิคขัดข้องระหว่างสอบ",
        tags: ["assessment", "retake", "edge-case"],
        body: [
          "ถ้า session หมดอายุหรือ browser crash ขณะทำข้อสอบโดยไม่ใช่ความตั้งใจของผู้เรียน ผู้เรียนสามารถขอให้ support team reset attempt count ได้ โดยต้องมีหลักฐาน เช่น session log ที่แสดงว่า submit ไม่เสร็จ ไม่ใช่แค่คำบอกเล่า",
          "Support team ต้องตรวจสอบ session log ใน {{ref:module:assessment-engine}} ก่อน approve reset เสมอ และ reset ที่ approve แล้วต้องถูกบันทึกใน audit log โดยระบุว่า reset เพราะอะไรและใคร approve เพื่อ traceability",
        ],
      },
    },
    {
      slug: "mandatory-compliance-deadline-policy",
      title: "นโยบาย Deadline สำหรับ Compliance Training บังคับ",
      tags: ["compliance", "deadline", "policy"],
      isPrimary: true,
      intro: [
        "Compliance training ที่กำหนดโดย regulation หรือ internal policy มี deadline ที่ต้องทำให้เสร็จ พนักงานที่ไม่ทำให้เสร็จภายใน deadline จะถูก flag เป็น non-compliant ใน HR system และ manager จะได้รับ escalation notification",
        "{{ref:module:compliance-deadline-monitor}} ส่ง reminder ล่วงหน้าตาม `REMINDER_ADVANCE_DAYS` และ escalate ไปยัง manager หลัง deadline เลยไป `ESCALATION_DELAY_DAYS` วัน การ escalate ไม่ใช่ punitive action แต่เพื่อให้ manager ช่วย unblock พนักงานที่อาจมีอุปสรรค เช่น ไม่มี license เข้าระบบ",
      ],
      edgeCase: {
        title: "ข้อยกเว้น Compliance Deadline: พนักงานที่ลา",
        tags: ["compliance", "deadline", "leave", "edge-case"],
        body: [
          "พนักงานที่ลาพักร้อน ลาป่วย หรือลาคลอดในช่วงที่ compliance deadline ตรง สามารถขอ defer deadline ได้โดยให้ HR อนุมัติ ระบบจะ pause reminder และ escalation สำหรับพนักงานนั้นโดยอัตโนมัติตลอดช่วงลา และตั้ง deadline ใหม่หลังวันกลับมาทำงาน",
          "Defer ไม่ได้หมายความว่ายกเว้น compliance requirement — พนักงานยังต้องทำให้เสร็จหลังกลับมา สถานะใน HR report จะแสดงเป็น `deferred` (ไม่ใช่ `non-compliant`) ตลอดช่วงลา เพื่อให้ audit report สะท้อนสถานการณ์จริงไม่ใช่ flag พนักงานที่กำลังลาว่าผิด compliance",
        ],
      },
    },
    {
      slug: "instructor-conflict-resolution-policy",
      title: "นโยบายการแก้ไข Conflict ตารางสอนของ Instructor",
      tags: ["instructor", "scheduling", "conflict", "policy"],
      isPrimary: true,
      intro: [
        "เมื่อ {{ref:module:instructor-scheduler}} ตรวจพบ conflict ในตารางสอน เช่น instructor ถูก assign สอง session ในเวลาเดียวกัน หรือ venue ถูก double-book ระบบจะ flag conflict และแจ้ง scheduling admin ทันทีโดยไม่ยืนยัน session ใดโดยอัตโนมัติ",
        "Conflict ที่ยังไม่ได้แก้ไขจะไม่แจ้งผู้เรียนที่ enroll ว่า session นั้นมีปัญหา เพื่อป้องกันความสับสน scheduling admin มี 24 ชั่วโมงในการ resolve conflict ก่อนที่ระบบจะ escalate และแจ้งผู้เรียนว่า session อาจมีการเปลี่ยนแปลง",
      ],
      edgeCase: {
        title: "ข้อยกเว้น Conflict Resolution: Instructor ป่วยฉุกเฉิน",
        tags: ["instructor", "scheduling", "emergency", "edge-case"],
        body: [
          "ถ้า instructor แจ้งป่วยฉุกเฉินภายใน 2 ชั่วโมงก่อน session เริ่ม ระบบอนุญาตให้ scheduling admin assign instructor สำรองได้โดยข้าม conflict check ชั่วคราว เพื่อให้แก้ปัญหาได้ทันเวลา แต่ต้องไม่มี conflict ที่ยังค้างอยู่หลัง session จบ",
          "กรณีไม่มี instructor สำรองที่ว่าง session จะถูก postpone และผู้เรียนที่ enroll จะได้รับแจ้งทันทีพร้อม session ทดแทนที่ทาง LMS จัดให้ใหม่ภายใน 48 ชั่วโมง ไม่ยกเลิก session โดยไม่มีทางออกให้ผู้เรียน",
        ],
      },
    },
    {
      slug: "plagiarism-detection-policy",
      title: "นโยบายการตรวจสอบและจัดการ Plagiarism ใน Assessment",
      tags: ["plagiarism", "assessment", "integrity", "policy"],
      isPrimary: true,
      intro: [
        "ระบบตรวจสอบ plagiarism สำหรับ assessment ประเภท written answer โดยเปรียบเทียบคำตอบของผู้เรียนกับ submission ทั้งหมดในช่วงเวลาเดียวกัน ถ้า similarity score เกิน threshold จะถูก flag ให้ instructor ตรวจสอบด้วยมือก่อน grade",
        "การ flag เป็น plagiarism ไม่ได้หมายความว่าผิดโดยอัตโนมัติ — instructor ต้องตรวจสอบ context ก่อน เพราะ subject matter ที่ใกล้เคียงกันทำให้คำตอบที่ถูกต้องคล้ายกันโดยธรรมชาติ การ mark ว่าเป็น plagiarism จริงต้องมีหลักฐานที่ชัดเจนกว่าแค่ similarity score",
      ],
      edgeCase: {
        title: "ข้อยกเว้น Plagiarism Detection: กรณี False Positive จำนวนมาก",
        tags: ["plagiarism", "false-positive", "edge-case"],
        body: [
          "ถ้า assessment ชุดหนึ่งมี plagiarism flag เกิน 30% ของ submission ในรอบเดียวกัน ให้สงสัยก่อนว่าเป็น false positive จาก question design ที่ทำให้คำตอบที่ถูกต้องคล้ายกันโดยธรรมชาติ (เช่น คำถามที่มีคำตอบชัดเจนเพียงแบบเดียว) ไม่ใช่ plagiarism จริง",
          "กรณีนี้ให้ review คำถามก่อน grade คำตอบ ถ้า question design ทำให้ตรวจ plagiarism ไม่ได้จริง ให้ปรับ question ใน version ถัดไปแทนการ flag ผู้เรียนทุกคน เพราะ false positive กระทบความน่าเชื่อถือของระบบและกระทบผู้เรียนที่ไม่ได้ทำผิดอะไร",
        ],
      },
    },
    {
      slug: "course-enrollment-policy",
      title: "นโยบายการ Enroll และ Unenroll คอร์ส",
      tags: ["enrollment", "course", "policy"],
      isPrimary: false,
      intro: [
        "ผู้เรียนสามารถ enroll คอร์สได้ด้วยตัวเองหรือถูก assign โดย manager ผ่าน HR integration ระบบตรวจสอบ prerequisite อัตโนมัติผ่าน {{ref:module:course-catalog}} ก่อนยืนยัน enrollment และป้องกัน duplicate enrollment ของ learner-course pair เดิม",
        "Enrollment ที่ไม่มีกิจกรรมใดๆ เกิน `ENROLLMENT_EXPIRY_DAYS` วันจะ expire อัตโนมัติ ผู้เรียนต้อง re-enroll ใหม่และเริ่มต้นใหม่ — ไม่มีการกู้คืน progress จาก enrollment ที่ expired แล้ว เพราะ content อาจมี version ใหม่ที่ต้องเรียนใหม่จากต้น",
      ],
    },
    {
      slug: "learner-data-retention-policy",
      title: "นโยบายการเก็บรักษาข้อมูลของผู้เรียน",
      tags: ["data-retention", "privacy", "policy"],
      isPrimary: false,
      intro: [
        "ข้อมูล learning progress และ assessment result เก็บไว้ตลอดช่วงที่พนักงานยังทำงานในองค์กร บวก 7 ปีหลังออกจากองค์กร เพื่อรองรับ audit requirement ของ regulatory body บางแห่ง ข้อมูล certificate ที่ออกไปแล้วไม่ถูกลบเลยเพราะใช้ verify ได้ตลอดอายุ certificate",
        "ข้อมูลที่ระบุตัวตนของผู้เรียน (ชื่อ, email, learner_id) สามารถ anonymize ได้หลังจากออกจากองค์กรครบ 7 ปี แต่ aggregate statistics เช่น pass rate ต่อคอร์สยังคงเก็บไว้สำหรับ analytics โดยไม่มี expiry",
      ],
    },
    {
      slug: "quiz-timer-policy",
      title: "นโยบาย Timer และการส่งคำตอบใน Quiz",
      tags: ["quiz", "timer", "assessment", "policy"],
      isPrimary: false,
      intro: [
        "Quiz แต่ละชุดมี timer ที่กำหนดใน assessment config ค่า default คือ `DEFAULT_QUIZ_TIMER_MIN` นาที timer เดินตั้งแต่เปิด session และไม่หยุดแม้ผู้เรียนจะปิด browser เพราะ server-side tracking",
        "คำตอบที่ submit หลัง timer หมดจะถูก reject ยกเว้นอยู่ใน grace period `ANSWER_SUBMISSION_GRACE_PERIOD_SEC` วินาที ซึ่ง account สำหรับ network latency ปกติ ไม่ใช่ให้เวลาเพิ่มจริงๆ",
      ],
    },
    {
      slug: "certificate-revocation-policy",
      title: "นโยบายการยกเลิก Certificate",
      tags: ["certificate", "revocation", "policy"],
      isPrimary: false,
      intro: [
        "Certificate สามารถถูก revoke ได้ในกรณี: (1) ตรวจพบว่าออก certificate โดยผิดพลาดก่อนเงื่อนไขครบ (2) พบหลักฐาน plagiarism หรือ cheating ในการสอบที่ใช้ขอ certificate นั้น (3) คอร์สนั้น revise เนื้อหาใหม่อย่างมีนัยสำคัญจนความรู้เดิมล้าสมัย",
        "การ revoke ต้องมีหลักฐานและผ่านการอนุมัติจาก compliance officer เสมอ ไม่มีระบบ revoke อัตโนมัติ เพราะผลกระทบต่อผู้เรียนสูงมาก — certificate ที่ถูก revoke จะแสดงสถานะ `revoked` เมื่อมีการ verify แทนที่จะหายไปเพื่อ traceability",
      ],
    },
    {
      slug: "content-version-policy",
      title: "นโยบายการจัดการ Version ของ Course Content",
      tags: ["content", "versioning", "policy"],
      isPrimary: false,
      intro: [
        "เมื่อ course content ได้รับการอัปเดต ผู้เรียนที่ enroll ก่อนการอัปเดตจะยังคงเรียน version เดิมจนจบ ไม่ถูก force ให้เริ่มใหม่จาก version ใหม่กลางทาง ยกเว้นกรณีที่ content เปลี่ยนแปลงอย่างมีนัยสำคัญจนต้อง restart ซึ่ง course admin ต้อง flag และแจ้งล่วงหน้า",
        "Certificate ที่ออกจาก version ใดก็ตามยังคง valid อยู่ตราบเท่าที่ไม่หมดอายุ ไม่มีการ invalidate certificate เดิมเพราะมี version ใหม่ เว้นแต่จะมีการ revoke ตาม {{ref:policy:certificate-revocation-policy}} อย่างชัดเจน",
      ],
    },
  ],
  incidents: [
    {
      slug: "progress-data-loss-on-migration",
      title: "ข้อมูล Progress หายหลัง Database Migration",
      tags: ["progress", "migration", "data-loss"],
      summary:
        "หลัง database migration ของ {{ref:module:progress-tracker}} พบว่าผู้เรียนกว่า 200 คนรายงานว่า progress ของตัวเองหายไปกลับไปเป็น 0% ทั้งที่เรียนไปแล้วครึ่งคอร์สหรือมากกว่า",
      investigation:
        "ตรวจสอบ migration log พบว่า migration script มี bug ที่ truncate ตาราง `content_progress` ก่อนจะ restore ข้อมูลใหม่ แต่ restore บางส่วนล้มเหลวเงียบๆ โดยไม่มี error เนื่องจาก foreign key reference ที่ไม่ตรงกัน",
      cause:
        "Migration script ไม่มีการ validate ว่า restore สำเร็จครบทุก row ก่อนที่จะ commit transaction ทำให้ partial restore ผ่าน transaction โดยไม่รู้ตัว บทเรียนสำคัญคือ migration ที่มี truncate ต้องมี count validation ก่อน commit",
      resolution:
        "Restore ข้อมูลจาก backup ก่อน migration ทำ reconciliation เพื่อหา learner ที่ได้รับผลกระทบทั้งหมด แล้ว re-apply progress ที่บันทึกไว้ใน event log แยกต่างหาก (event log เก็บแยกจาก main database จึงไม่ได้รับผลกระทบ)",
      followup:
        "เพิ่ม post-migration validation script ที่ count rows และ sample check data integrity ก่อน commit ทุก migration และกำหนดให้มีการทดสอบ migration script บน copy ของ production data ก่อน run จริง ดู {{ref:deployment:database-migration-runbook}}",
    },
    {
      slug: "certificate-issued-before-completion",
      title: "Certificate ถูกออกก่อนที่ผู้เรียนสำเร็จคอร์สจริง",
      tags: ["certificate", "bug", "race-condition"],
      summary:
        "พบว่า certificate ถูกออกให้ผู้เรียน 15 คนโดยที่ยังทำ final assessment ไม่เสร็จ บาง case ยังไม่เริ่มทำเลยด้วยซ้ำ",
      investigation:
        "ตรวจสอบ log ของ {{ref:module:certificate-issuer}} พบว่า eligibility check อ่านผล assessment จาก cache ที่ stale ซึ่งยังเก็บผลของผู้เรียนคนอื่นที่ courseId เดียวกันแต่เป็น assessment attempt ก่อนหน้า",
      cause:
        "Cache key สำหรับ assessment result ใช้แค่ `courseId` ไม่ได้รวม `learnerId` ทำให้ learner คนหนึ่งที่ผ่านแล้ว cache ผลทับ learner คนอื่นที่ยังไม่ได้สอบ eligibility check จึง return true ผิดสำหรับ learner ที่ไม่ผ่าน",
      resolution:
        "Revoke certificate ทั้ง 15 ใบที่ออกผิด แก้ cache key ให้รวม `learnerId` เสมอ และล้าง cache ทั้งหมดของ eligibility check แล้ว deploy fix ทันที",
      followup:
        "เพิ่ม integration test ที่ตรวจสอบว่า certificate ไม่ถูกออกเมื่อ assessment ยังไม่ผ่าน และ review cache key ทั้งหมดใน {{ref:module:certificate-issuer}} ว่ามี learner isolation ที่ถูกต้อง",
    },
    {
      slug: "assessment-answer-leak",
      title: "คำตอบ Assessment รั่วไหลผ่าน Browser Cache",
      tags: ["assessment", "security", "data-leak"],
      summary:
        "พนักงานแผนก IT รายงานว่า inspect browser developer tools ระหว่างทำ quiz แล้วพบว่า correct answer ถูกส่งมาใน API response พร้อมกับ question ทำให้ผู้เรียนที่รู้เทคนิคสามารถดูคำตอบได้",
      investigation:
        "ตรวจสอบ API response ของ `startAssessment` พบว่า question payload รวม field `correctAnswer` ที่ backend ใช้ตรวจ ซึ่งถูกส่งมาที่ client ด้วยโดยไม่ได้ filter ออก",
      cause:
        "Developer ใช้ JavaScript object spreading เพื่อ map question data โดยไม่ได้ explicit ระบุ field ที่จะส่ง ทำให้ทุก field รวม `correctAnswer` ถูกส่งมาโดยไม่ตั้งใจ",
      resolution:
        "แก้ไข API ให้ส่งเฉพาะ field ที่จำเป็นสำหรับ client (question text, choices, metadata) และ exclude `correctAnswer` อย่างชัดเจน deploy fix และ rotate assessment ที่อาจถูก compromise",
      followup:
        "เพิ่ม security test ใน CI pipeline ที่ตรวจว่า response ของ assessment API ไม่มี sensitive field เช่น `correctAnswer`, `expectedOutput` และ review API response schema ทุก endpoint ของ {{ref:module:assessment-engine}} ดู {{ref:convention:api-response-format}}",
    },
    {
      slug: "duplicate-enrollment-race-condition",
      title: "ผู้เรียนถูก Enroll คอร์สเดียวกันซ้ำสองครั้ง",
      tags: ["enrollment", "race-condition", "duplicate"],
      summary:
        "พนักงาน 8 คนมี enrollment ซ้ำสำหรับคอร์สเดียวกัน ทำให้ progress tracker สับสนและแจ้ง completion สองครั้ง รวมถึงออก certificate ซ้ำด้วย",
      investigation:
        "ตรวจสอบ log พบว่า HR integration และ self-enrollment ถูกเรียกพร้อมกันในเวลาไล่เลี่ยกัน (ต่ำกว่า 200 มิลลิวินาที) สำหรับ learner เดียวกัน ทั้งสองทำ duplicate check ไม่พบ enrollment เดิม เพราะยังไม่ได้ commit",
      cause:
        "Duplicate enrollment check ไม่ใช้ database-level unique constraint — ระบบอ่านก่อนแล้วค่อย insert ทำให้สอง concurrent request ผ่าน check พร้อมกันได้ในช่วง millisecond",
      resolution:
        "เพิ่ม unique constraint ระดับ database บน `(learner_id, course_id)` pair และแก้ enrollment logic ให้ใช้ upsert แทน insert เพื่อ handle duplicate อย่าง idempotent แทนการ throw error",
      followup:
        "ตรวจสอบว่ามี enrollment ซ้ำค้างอยู่ในระบบหรือไม่ merge progress ของ enrollment ซ้ำให้ถูกต้อง และ revoke certificate ที่ออกซ้ำ ดู {{ref:convention:testing-convention}} สำหรับ concurrent test requirement",
    },
    {
      slug: "compliance-deadline-missed-notification",
      title: "Compliance Reminder ไม่ถูกส่งทำให้พนักงานพลาด Deadline",
      tags: ["compliance", "deadline", "notification"],
      summary:
        "พนักงาน 47 คนพลาด compliance training deadline สำหรับ safety training ที่บังคับ เพราะไม่ได้รับ reminder notification เลยตลอดช่วง 30 วันก่อน deadline",
      investigation:
        "ตรวจสอบ {{ref:module:compliance-deadline-monitor}} พบว่า reminder job ล้มเหลวเงียบๆ เพราะ email service ที่ใช้ส่ง notification ปรับ API ใหม่โดยไม่แจ้ง breaking change ทำให้ authentication header ผิดรูปแบบและ request ถูก reject ทุกครั้ง",
      cause:
        "Email service vendor ทำ API version upgrade โดยไม่ deprecate version เก่าพร้อมกัน แต่ authentication format เปลี่ยน reminder job ไม่ได้ตรวจสอบว่า email ถูกส่งสำเร็จจริงหรือไม่ แค่ fire-and-forget",
      resolution:
        "แก้ authentication header ให้ตรงกับ API version ใหม่ ส่ง reminder ด้วยมือให้พนักงานทั้ง 47 คนทันที และขอ deadline extension จาก compliance officer สำหรับพนักงานที่ยังไม่ทำ",
      followup:
        "เพิ่ม delivery confirmation check สำหรับ notification ที่ compliance-critical — ถ้า email ส่งไม่สำเร็จต้อง retry และ alert ไม่ใช่แค่ log เงียบๆ ดู {{ref:convention:logging-convention}}",
    },
    {
      slug: "quiz-timer-bypass",
      title: "ผู้เรียนบางคนสามารถ Bypass Quiz Timer ได้",
      tags: ["assessment", "security", "timer"],
      summary:
        "พบว่าผู้เรียน 3 คนใช้เวลาทำ quiz เกิน timer ที่กำหนดอย่างมีนัยสำคัญ (เกิน 200%) แต่ system ยังรับ submission และให้คะแนนปกติ",
      investigation:
        "ตรวจสอบ {{ref:module:assessment-engine}} พบว่า timer enforcement ทำฝั่ง client-side เท่านั้น server-side validation ตรวจสอบเฉพาะ grace period จาก `startedAt` ที่บันทึกใน session แต่ `startedAt` อ่านจาก request body ไม่ใช่จาก server timestamp ทำให้ผู้ใช้แก้ค่าได้",
      cause:
        "Developer เข้าใจผิดว่า client-side timer เพียงพอ เพราะคิดว่า user ไม่มีแรงจูงใจที่จะ cheat ใน corporate training ซึ่งไม่ตรงกับความเป็นจริงโดยเฉพาะ compliance training ที่ต้องผ่านจึงจะทำงานต่อได้",
      resolution:
        "แก้ `startedAt` ให้ใช้ server timestamp ที่บันทึกตอน `startAssessment` เสมอ ไม่รับจาก request body และ add server-side time validation ก่อน accept submission ทุกครั้ง",
      followup:
        "Review assessment flow ทั้งหมดว่ามี client-controlled input อื่นที่ควรใช้ server-side value แทนไหม และเพิ่ม security test ที่ simulate manipulation ของ timing ใน test suite ดู {{ref:convention:testing-convention}}",
    },
    {
      slug: "instructor-double-booking",
      title: "Instructor ถูก Book สอนสองที่พร้อมกัน",
      tags: ["instructor", "scheduling", "conflict"],
      summary:
        "Instructor รายหนึ่งถูก schedule สอน live session สองงานพร้อมกันในวันเดียวกัน เวลาเดียวกัน ทำให้ต้องยกเลิก session หนึ่งในเวลาเที่ยงคืนก่อนวันสอน",
      investigation:
        "ตรวจสอบ {{ref:module:instructor-scheduler}} พบว่า scheduling admin สอง team ต่างทำ assignment พร้อมกันโดยไม่รู้ว่าอีกทีมกำลังทำอยู่ conflict check ทำงานถูกต้อง แต่ทั้งสอง assignment ผ่าน check ก่อนที่อันแรกจะ commit",
      cause:
        "Conflict check และ session creation ไม่ใช่ atomic operation — ทั้งสอง transaction อ่านตาราง schedule แล้วไม่พบ conflict ก่อนที่อันไหนจะ write สำเร็จ ทำให้ทั้งคู่ผ่านพร้อมกัน",
      resolution:
        "เพิ่ม pessimistic lock บนช่วงเวลาของ instructor ขณะ create session เพื่อป้องกัน concurrent booking และ reschedule session ที่ถูกยกเลิกให้ผู้เรียนใหม่",
      followup:
        "ตรวจสอบว่าการ lock strategy นี้ไม่ทำให้ performance ของ scheduling ช้าลงมากเกินไป เพราะ instructor schedule เป็น operation ที่ทำบ่อย ดู {{ref:deployment:scaling-policy}}",
    },
    {
      slug: "plagiarism-false-positive-wave",
      title: "Plagiarism Flag เกือบ 40% ของ Assessment ใน Session เดียว",
      tags: ["plagiarism", "false-positive", "assessment"],
      summary:
        "หลังเปิดตัว course ใหม่เรื่อง data privacy ผลการตรวจ plagiarism flag submission กว่า 38% ว่าน่าสงสัย ทำให้ instructor ต้องตรวจ manually เป็นจำนวนมากจนทำไม่ไหว",
      investigation:
        "ตรวจสอบ question design พบว่าคำถามส่วนใหญ่เป็น short answer ที่ถามนิยามของ term ทางกฎหมาย ซึ่งมีคำตอบที่ถูกต้องเพียงแบบเดียวและทุกคนต้องเขียนคล้ายกัน ทำให้ similarity score สูงแม้จะไม่ copy",
      cause:
        "Question design ไม่เหมาะสำหรับ open-ended plagiarism detection เพราะ factual question มีคำตอบ canonical ที่ตายตัว plagiarism detector ไม่ได้รับ configuration ว่า assessment ชุดนี้เป็น factual ไม่ใช่ analytical",
      resolution:
        "ปรับ plagiarism threshold สำหรับ assessment ชุดนี้ให้สูงขึ้นชั่วคราว และให้ instructor grade manual โดยไม่พิจารณา plagiarism flag สำหรับ session นี้ ปรับ question ให้เป็น application-based แทน definition-based ใน version ถัดไป",
      followup:
        "เพิ่ม question type metadata ที่ plagiarism engine ใช้ปรับ threshold อัตโนมัติ เช่น `factual`, `analytical`, `creative` เพื่อลด false positive โดยไม่ลดการตรวจจับที่แท้จริง ดู {{ref:policy:plagiarism-detection-policy}}",
    },
    {
      slug: "certificate-expiry-mass-invalidation",
      title: "Certificate หมดอายุพร้อมกันจำนวนมากเพราะกำหนด Expiry วันเดียวกัน",
      tags: ["certificate", "expiry", "batch"],
      summary:
        "พนักงาน 180 คนได้รับ certificate หมดอายุพร้อมกันในวันเดียว ส่งผลให้ compliance status ของพนักงานจำนวนมากตกเป็น non-compliant ทันที และระบบ reminder ส่ง notification จำนวนมากจนอาจถูกมองว่าเป็น spam",
      investigation:
        "ตรวจสอบ {{ref:module:certificate-issuer}} พบว่า organization นี้ run compliance training แบบ batch ให้พนักงานทั้งองค์กรพร้อมกันทุกปี ทำให้ certificate ออกวันเดียวกันและหมดอายุวันเดียวกัน",
      cause:
        "ไม่ใช่ bug แต่เป็น operational pattern ที่ไม่ได้คาดการณ์ — ระบบไม่มีกลไก stagger expiry หรือ notification เพื่อกระจาย renewal load",
      resolution:
        "ส่ง reminder พร้อมข้อความอธิบายสถานการณ์เพื่อให้พนักงานเข้าใจ และเร่งเปิด renewal enrollment ให้ทุกคนเข้าได้ทันที ติดตามว่า compliance ฟื้นตัวได้เร็วแค่ไหน",
      followup:
        "แนะนำให้ลูกค้า stagger batch training ในปีถัดไปเพื่อไม่ให้ certificate หมดพร้อมกันทั้งองค์กร และพิจารณาเพิ่ม expiry jitter สำหรับ batch enrollment อัตโนมัติ",
    },
    {
      slug: "course-catalog-sync-failure",
      title: "Course Catalog ไม่ Sync กับ Content Provider ทำให้ Version ล้าสมัย",
      tags: ["course-catalog", "sync", "content"],
      summary:
        "ผู้เรียนหลายคนรายงานว่า video บทเรียนบางตอนเล่นไม่ได้ และ quiz บางชุดหายไปจากคอร์สที่กำลังเรียนอยู่ แต่ {{ref:module:course-catalog}} ยังแสดงว่า course เป็น version ล่าสุด",
      investigation:
        "ตรวจสอบ sync log ระหว่าง course catalog กับ content storage พบว่า sync job ล้มเหลวมา 5 วัน เพราะ content provider เปลี่ยน CDN URL ของ media asset โดยไม่แจ้ง URL เดิมยังคืน 200 แต่ body เปลี่ยน redirect ไปที่ error page",
      cause:
        "Sync job ไม่ได้ validate content URL ว่า reachable และ return expected content type หลัง sync ทำให้ broken URL ผ่าน validation และถูก save เข้า catalog",
      resolution:
        "ติดต่อ content provider เพื่อรับ URL mapping ใหม่ อัปเดต course catalog ด้วยมือสำหรับ course ที่ได้รับผลกระทบ และแก้ sync job ให้ validate URL ก่อน commit",
      followup:
        "เพิ่ม content URL health check หลัง sync ทุกครั้ง และ set up monitoring ที่ sample เล่น media asset จริงๆ ไม่ใช่แค่ตรวจ HTTP status เพราะ URL อาจ return 200 แต่เนื้อหาผิดได้",
    },
    {
      slug: "retake-cooldown-bypass",
      title: "ผู้เรียนสามารถ Bypass Retake Cooldown โดยสร้าง Session ซ้ำ",
      tags: ["assessment", "retake", "security"],
      summary:
        "พบว่าผู้เรียนบางคนสามารถทำ assessment ซ้ำภายในเวลาไม่กี่นาทีโดยไม่ต้องรอ cooldown โดยเปิด multiple session พร้อมกันแล้ว submit ทุก session",
      investigation:
        "ตรวจสอบ {{ref:module:assessment-engine}} พบว่า cooldown check เกิดขึ้นตอน `requestRetake` เท่านั้น แต่ไม่ได้ check ว่ามี active session ของ assessment เดิมอยู่แล้วหรือไม่ก่อน `startAssessment` ทำให้เปิดหลาย session พร้อมกันได้",
      cause:
        "Design ของ cooldown check ถือว่า learner จะ request retake ผ่าน UI ปกติ ไม่ได้คำนึงถึง case ที่ learner เปิด session โดยตรงผ่าน API",
      resolution:
        "เพิ่ม check ว่ามี active session ของ assessment นั้นอยู่แล้วหรือไม่ก่อน `startAssessment` และเพิ่ม check cooldown ทั้งในขั้น `requestRetake` และ `startAssessment` เพื่อ defense in depth",
      followup:
        "ตรวจสอบ session ที่สงสัยว่า bypass cooldown และ review ผล assessment ที่เกิดขึ้น ถ้าพบ bypass จริงให้ escalate ตาม {{ref:policy:plagiarism-detection-policy}} เพราะเป็น integrity violation ประเภทเดียวกัน",
    },
    {
      slug: "progress-tracker-data-corruption",
      title: "Progress เขียนทับ Backward ทำให้ Completion หายไป",
      tags: ["progress", "data-corruption", "bug"],
      summary:
        "ผู้เรียน 3 คนที่ complete คอร์สแล้วพบว่า progress กลับไปเป็น 85% และ completion status หายไป ทำให้ระบบไม่ยอมออก certificate",
      investigation:
        "ตรวจสอบ event log พบว่า progress event มาจาก mobile app ที่ cache progress offline แล้ว sync พร้อมกันตอน reconnect ส่ง event หลายชิ้นพร้อมกันรวมถึง event เก่าที่ progress ต่ำกว่า",
      cause:
        "Progress write ไม่ได้มี guard ว่า progress ใหม่ต้องสูงกว่าหรือเท่ากับปัจจุบันเสมอ (`PROGRESS_REGRESSION_GUARD` ถูก implement แต่ logic ไม่ครอบคลุม out-of-order event จาก offline sync)",
      resolution:
        "แก้ไข progress ของผู้เรียนทั้ง 3 คนด้วยมือโดยอ้างอิงจาก event log ของ `markCourseComplete` ที่ยังเก็บไว้ และ fix regression guard ให้ครอบคลุม timestamp ordering",
      followup:
        "เพิ่ม integration test สำหรับ offline sync scenario ที่ส่ง event out-of-order เพื่อตรวจจับ regression bug แบบนี้ก่อน deploy และ review mobile app offline sync logic ด้วย",
    },
    {
      slug: "compliance-report-incorrect-data",
      title: "Compliance Report ส่ง HR ข้อมูลผิดเพราะ Sync ล่าช้า",
      tags: ["compliance", "report", "sync"],
      summary:
        "HR รายงานว่า compliance report ที่ใช้สำหรับ regulatory audit มีข้อมูลผิด พนักงาน 12 คนที่ complete training แล้วแสดงว่า non-compliant ในรายงาน",
      investigation:
        "ตรวจสอบ {{ref:module:compliance-deadline-monitor}} พบว่า batch sync กับ HR system รันสำเร็จ แต่ certificate data ที่ sync ไปมาจาก snapshot ที่ถ่ายก่อนที่ certificate ชุดนี้จะถูกออก เพราะ sync รันก่อน certificate issuer process เสร็จในวันนั้น",
      cause:
        "Timing dependency ระหว่าง certificate issuance และ compliance sync batch ไม่มีการ guarantee order — ในวันที่มีคนผ่าน assessment ใกล้เวลา sync ข้อมูลอาจถึงหรือไม่ถึง HR ขึ้นกับ race",
      resolution:
        "รัน sync ด้วยมืออีกครั้งหลังยืนยันว่า certificate ทุกใบที่รอ issue ถูกออกเรียบร้อยแล้ว ส่ง corrected report ไปยัง HR ก่อน audit",
      followup:
        "แก้ sync schedule ให้รันหลังจาก certificate processing batch เสร็จเสมอ หรือเพิ่ม dependency check ที่รอให้ certificate queue ว่างก่อน trigger sync",
    },
    {
      slug: "assessment-scoring-bug",
      title: "Assessment คำนวณคะแนนผิดเพราะ Weight Configuration ผิดพลาด",
      tags: ["assessment", "scoring", "bug"],
      summary:
        "ผู้เรียนหลายคนร้องเรียนว่าตอบถูกเกินครึ่งแต่คะแนนที่ได้ต่ำมากผิดปกติ บาง case ตอบถูก 80% แต่คะแนนออกมาแค่ 45%",
      investigation:
        "ตรวจสอบ scoring logic ใน {{ref:module:assessment-engine}} พบว่า weight ของ question แต่ละข้อถูก parse ผิด decimal point ทำให้ question ที่ควร weight 1.0 กลายเป็น weight 0.1 หลัง migration config format ใหม่เมื่อเดือนที่แล้ว",
      cause:
        "Migration config ใหม่ใช้ locale ที่ต่างกันในการ parse number — config ที่เขียนด้วย `.` เป็น decimal separator ถูก parse เป็น `,` โดย locale ของ server ทำให้ค่าผิด",
      resolution:
        "แก้ config parser ให้ explicit ใช้ `.` เป็น decimal separator ไม่พึ่ง locale default คำนวณ score ใหม่สำหรับทุก session ที่ได้รับผลกระทบในช่วงเดือนที่ผ่านมา และ notify learner ที่ควรได้คะแนนผ่านแต่ถูก mark ว่าไม่ผ่าน",
      followup:
        "เพิ่ม unit test ที่ใช้ decimal value ตรวจ scoring calculation และ review config parsing ทุกที่ที่อาจมี locale-sensitive number parsing",
    },
  ],
  conventions: [
    {
      slug: "branch-naming",
      title: "Branch Naming",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>/<เลข-ticket>-<คำอธิบายสั้น>` ตัวอย่าง: `feat/LEARN-088-server-side-timer-enforcement`, `fix/LEARN-112-certificate-cache-key-isolation`" },
        { heading: "กติกา", body: "ต้องมีเลข ticket เสมอ ใช้ `kebab-case` ไม่เกิน 5 คำ branch ที่ merge แล้วลบทิ้งทันที ดู {{ref:convention:commit-message-style}} สำหรับ prefix ที่ใช้ร่วมกัน" },
      ],
    },
    {
      slug: "commit-message-style",
      title: "Commit Message Style",
      tags: ["git", "workflow"],
      sections: [
        { heading: "รูปแบบ", body: "`<type>(<scope>): <คำอธิบาย>` เช่น `fix(assessment-engine): enforce server-side timer validation ป้องกัน bypass`" },
        { heading: "Type ที่ใช้", body: "`feat`, `fix`, `refactor`, `docs`, `chore` — ตรงกับ prefix ของ {{ref:convention:branch-naming}}" },
      ],
    },
    {
      slug: "code-review-checklist",
      title: "Code Review Checklist",
      tags: ["review", "quality"],
      sections: [
        { heading: "สิ่งที่ต้องเช็คทุกครั้ง", body: "ฟังก์ชันที่แก้ enrollment หรือ certificate status ต้องมี test ครอบคลุมกรณี concurrent request เสมอ (บทเรียนจาก {{ref:incident:duplicate-enrollment-race-condition}}) และ API response ที่ return assessment data ต้องตรวจว่าไม่มี sensitive field ปนออกมา" },
        { heading: "Security checkpoint", body: "ทุก endpoint ที่เกี่ยวกับ assessment ต้องผ่าน security checklist ว่า (1) ไม่ส่ง correct answer ออกมา (2) มี server-side time validation (3) มี rate limit ป้องกัน brute force บทเรียนจาก {{ref:incident:assessment-answer-leak}} และ {{ref:incident:quiz-timer-bypass}}" },
      ],
    },
    {
      slug: "naming-convention",
      title: "Naming Convention",
      tags: ["naming", "style"],
      sections: [
        { heading: "ตัวแปรและฟังก์ชัน", body: "`camelCase` เช่น `enrollLearner`, `evaluateCertificateEligibility` — ฟังก์ชัน async ขึ้นต้นด้วยคำกริยาสื่อ action ไม่เติม `Async` ต่อท้าย" },
        { heading: "Identifier ของ domain", body: "`learnerId` ใช้ employee ID จาก HR system โดยตรง, `courseId` รูปแบบ `COURSE-<kebab-slug>-<year>` เช่น `COURSE-data-privacy-2026` ดูรายละเอียดที่ {{ref:convention:learner-id-convention}}" },
      ],
    },
    {
      slug: "logging-convention",
      title: "Logging Convention",
      tags: ["logging", "observability"],
      sections: [
        { heading: "correlation id", body: "ทุก log line ที่เกี่ยวกับ learner activity ต้องมี `learnerId` และ `courseId` เสมอ เพื่อไล่ log ข้าม service ได้ (progress-tracker → assessment-engine → certificate-issuer) ดู {{ref:deployment:monitoring-alerts}}" },
        { heading: "ระดับ log", body: "Certificate issuance และ revocation ต้อง log เป็น `info` ขึ้นไปเสมอ compliance deadline miss ต้อง log เป็น `warn` background job failure ต้องไม่ suppress — บทเรียนจาก {{ref:incident:compliance-deadline-missed-notification}}" },
      ],
    },
    {
      slug: "error-code-convention",
      title: "Error Code Convention",
      tags: ["error", "api"],
      sections: [
        { heading: "รูปแบบ", body: "`LEARN_<DOMAIN>_<REASON>` เช่น `LEARN_ENROLLMENT_DUPLICATE`, `LEARN_ASSESSMENT_TIMER_EXPIRED`, `LEARN_CERTIFICATE_NOT_ELIGIBLE` ตัวพิมพ์ใหญ่ทั้งหมด" },
        { heading: "หมวดที่ใช้บ่อย", body: "`LEARN_PROGRESS_REGRESSION`, `LEARN_ASSESSMENT_ANSWER_SUBMITTED_LATE`, `LEARN_COMPLIANCE_DEADLINE_EXCEEDED` — ดูรายชื่อเต็มที่ {{ref:convention:api-response-format}}" },
      ],
    },
    {
      slug: "testing-convention",
      title: "Testing Convention",
      tags: ["testing", "security"],
      sections: [
        { heading: "Concurrent test requirement", body: "ฟังก์ชันที่แตะ enrollment หรือ certificate issuance ต้องมี test จำลอง concurrent request อย่างน้อย 2 ตัวเพื่อตรวจ race condition บทเรียนจาก {{ref:incident:duplicate-enrollment-race-condition}} และ {{ref:incident:instructor-double-booking}}" },
        { heading: "Security test requirement", body: "Assessment endpoint ต้องมี security test ที่ตรวจว่า (1) ไม่มี correct answer ใน response (2) timer enforce ฝั่ง server (3) cooldown บังคับจริง — test เหล่านี้ต้องรันทุก CI build ไม่ใช่แค่ audit รายปี" },
      ],
    },
    {
      slug: "api-response-format",
      title: "API Response Format",
      tags: ["api", "convention"],
      sections: [
        { heading: "โครงสร้าง", body: "ทุก response ห่อด้วย `{ data, error }` เดียวกันหมด ไม่มี field แปลกปนที่ระดับบนสุด `error` เป็น `null` เมื่อสำเร็จเท่านั้น" },
        { heading: "Error object", body: "`{ code, message, details? }` โดย `code` ต้องตรงกับ {{ref:convention:error-code-convention}} เสมอ ห้ามส่ง raw exception message ออกไปตรงๆ โดยเฉพาะ exception จาก assessment engine ที่อาจมีข้อมูล answer ปน" },
      ],
    },
    {
      slug: "learner-id-convention",
      title: "Learner ID & Course ID Convention",
      tags: ["learner", "naming", "convention"],
      intro: "การใช้ identifier ที่สอดคล้องกับ HR system ทำให้ reconcile และ audit ข้ามระบบได้โดยตรง — เอกสารนี้กำหนด ID format ที่ต้องใช้ร่วมกันทุก service",
      sections: [
        { heading: "Learner ID", body: "ใช้ employee ID จาก HR system โดยตรง รูปแบบ `EMP-<6 หลัก>` เช่น `EMP-001234` ไม่สร้าง internal UUID แยก เพราะจะทำให้ต้องมี mapping table และเพิ่มความซับซ้อนในการ sync กับ HR" },
        { heading: "Course ID", body: "`COURSE-<topic-slug>-<4 digit year>` เช่น `COURSE-data-privacy-2026`, `COURSE-safety-fire-2025` — ปีที่รวมใน ID คือปีที่ content version นั้นมีผลใช้งาน ไม่ใช่ปีที่สร้าง course" },
        { heading: "Certificate ID", body: "`CERT-<learnerId>-<courseId>-<timestamp>` เช่น `CERT-EMP001234-COURSE-data-privacy-2026-20260315` — format ให้ verify ได้ว่าเป็น certificate ของ learner ใด course ใด ออกเมื่อไหร่ โดยไม่ต้อง query database ก่อน" },
      ],
    },
  ],
  deploymentTopics: [
    {
      slug: "ci-cd-pipeline",
      title: "CI/CD Pipeline",
      tags: ["ci-cd", "deployment"],
      sections: [
        { heading: "ขั้นตอน", body: "lint → unit test → integration test (ครอบคลุม concurrent + security scenarios) → deploy staging → smoke test (รวม end-to-end enrollment → completion → certificate flow) → deploy production ทีละ service" },
        { heading: "Gate พิเศษ", body: "{{ref:module:assessment-engine}} ต้องผ่าน security test 100% ก่อน merge รวมถึง test ที่ตรวจ answer leak และ timer bypass {{ref:module:certificate-issuer}} ต้องผ่าน integration test กับทั้ง progress-tracker และ assessment-engine เพื่อตรวจ eligibility logic ถูกต้อง" },
      ],
    },
    {
      slug: "assessment-engine-configuration",
      title: "Assessment Engine Configuration Guide",
      tags: ["assessment", "configuration"],
      intro: "เอกสารอธิบาย configuration สำคัญของ {{ref:module:assessment-engine}} ที่กระทบ learner experience และ security — ต้องอ่านก่อนปรับ config ทุกครั้ง",
      sections: [
        { heading: "Timer configuration", body: "`DEFAULT_QUIZ_TIMER_MIN` คือค่า default สำหรับ quiz ที่ไม่ได้กำหนด timer ใน assessment config quiz สำคัญควร override timer ใน assessment config แทนการเปลี่ยน default เพราะ default กระทบทุก quiz ที่ไม่มีการ specify" },
        { heading: "Retake cooldown", body: "`RETAKE_COOLDOWN_HOURS` ควรตั้งอย่างน้อย 24 ชั่วโมงสำหรับ compliance assessment เพื่อให้ learner มีเวลา review เนื้อหาจริงๆ การตั้งต่ำเกินไปทำให้ระบบไม่มีความหมายในการป้องกัน brute force" },
      ],
    },
    {
      slug: "database-migration-runbook",
      title: "Database Migration Runbook",
      tags: ["migration", "runbook", "database"],
      intro: "บทเรียนจาก {{ref:incident:progress-data-loss-on-migration}} ทำให้ migration runbook นี้เพิ่ม validation step ที่เข้มงวดขึ้นมากกว่า practice ทั่วไป",
      sections: [
        { heading: "Pre-migration validation", body: "count rows ทุก table ก่อน migration และบันทึกไว้เป็น baseline ทำ backup และ verify backup restore สำเร็จบน staging ก่อน run บน production เสมอ ห้ามรัน migration โดยไม่มี verified backup" },
        { heading: "Post-migration validation", body: "หลัง migration ต้อง count rows อีกครั้งและเทียบกับ baseline ก่อน commit และ sample check data integrity อย่างน้อย 100 rows แบบ random ถ้า row count ไม่ตรงต้อง rollback ทันทีไม่รอตรวจสาเหตุก่อน" },
      ],
    },
    {
      slug: "incident-response-runbook",
      title: "Incident Response Runbook",
      tags: ["incident", "runbook"],
      sections: [
        { heading: "ระดับความรุนแรง", body: "Sev1 = progress data loss, certificate issued incorrectly, assessment security breach, Sev2 = compliance notification failure, sync failure ที่กระทบ report, Sev3 = course catalog staleness, minor UX bug ที่ไม่กระทบ data" },
        { heading: "กรณีออก Certificate ผิด", body: "ถ้าพบว่า certificate ออกก่อนเวลาหรือออกโดยผิดพลาด ให้ revoke ทันทีโดยไม่รอยืนยัน เพราะ certificate ที่ไม่ valid มีความเสี่ยงทาง regulatory สูงกว่าความไม่สะดวกจาก revoke ดู {{ref:policy:certificate-revocation-policy}} สำหรับกระบวนการ" },
      ],
    },
    {
      slug: "monitoring-alerts",
      title: "Monitoring & Alerts",
      tags: ["monitoring", "observability"],
      sections: [
        { heading: "Alert หลัก", body: "certificate issue rate สูงผิดปกติ (อาจ signal bug), compliance notification delivery failure เกิน 5%, progress regression event เกิดขึ้น, assessment session ที่ค้างสถานะ `in_progress` เกิน timer * 2 โดยไม่ submit" },
        { heading: "ช่องทางแจ้งเตือน", body: "Sev1 แจ้งเข้า on-call ทันทีทาง pager compliance notification failure แจ้งทันทีเพราะกระทบ regulatory compliance ของลูกค้า background job failure ทุกอันต้อง alert ไม่ suppress" },
      ],
    },
    {
      slug: "rollback-procedure",
      title: "Rollback Procedure",
      tags: ["rollback", "deployment"],
      sections: [
        { heading: "เมื่อไหร่ต้อง rollback ทันที", body: "ถ้า deploy ใหม่ทำให้ assessment security test fail, progress regression เพิ่มขึ้น, หรือ certificate issuance error rate เกิน 1% ต้อง rollback ทันทีโดยไม่รอ approval — error เหล่านี้กระทบ data integrity ที่แก้ยากมากกว่า rollback" },
        { heading: "ขั้นตอน", body: "deploy version ก่อนหน้ากลับผ่าน pipeline เดิม (ไม่ skip security test) ถ้า certificate ออกไปแล้วระหว่าง bad deploy ต้องตรวจสอบและ revoke ถ้าออกผิด ไม่ปล่อยไว้แม้จะ rollback code แล้ว" },
      ],
    },
    {
      slug: "scaling-policy",
      title: "Scaling Policy",
      tags: ["scaling", "infrastructure"],
      sections: [
        { heading: "Autoscaling ของ service", body: "| Service | Min replica | Max replica | Scale-up threshold |\n|---|---|---|\n| progress-tracker | 2 | 8 | CPU > 70% หรือ write queue depth > 500 |\n| assessment-engine | 2 | 6 | concurrent session > 200 |\n| course-catalog | 2 | 4 | CPU > 60% (read-heavy, benefit จาก cache มาก) |\n| certificate-issuer | 1 | 3 | queue depth > 50 |" },
        { heading: "การรองรับ batch enrollment", body: "เมื่อ HR push compliance training ให้พนักงานทั้งองค์กรพร้อมกัน (batch enrollment) {{ref:module:progress-tracker}} อาจรับ write spike ขนาดใหญ่ — ให้ pre-scale ก่อน batch enrollment ล่วงหน้า 30 นาที ไม่รอให้ autoscale kick in เพราะ ramp up ช้าเกินไป" },
      ],
    },
    {
      slug: "certificate-generation-runbook",
      title: "Certificate Generation & Verification Runbook",
      tags: ["certificate", "runbook"],
      intro: "ขั้นตอนสำหรับ troubleshoot เมื่อ certificate ไม่ถูกออกแม้ learner ผ่านเงื่อนไขแล้ว และขั้นตอนสำหรับ verify certificate ที่ third party ต้องการยืนยัน",
      sections: [
        { heading: "Troubleshoot certificate ไม่ถูกออก", body: "1) ตรวจ `evaluateCertificateEligibility` ด้วยมือว่า return eligible หรือไม่ 2) ตรวจ progress ใน {{ref:module:progress-tracker}} ว่า completion event มีอยู่จริง 3) ตรวจ assessment score ใน {{ref:module:assessment-engine}} ว่าผ่าน threshold ของ course นั้น 4) ตรวจ event queue ว่า `assessment.graded` event ถึง certificate-issuer หรือไม่" },
        { heading: "Manual certificate issuance", body: "ถ้า eligibility ผ่านทุก check แต่ระบบยังไม่ออก certificate ให้ manual trigger `issueCertificate` หลังยืนยันว่า eligibility ผ่านจริง บันทึกเหตุผลใน audit log ทุกครั้งที่ manual issue และ report เป็น incident ถ้ามี pattern เกิดซ้ำ" },
      ],
    },
  ],
};
