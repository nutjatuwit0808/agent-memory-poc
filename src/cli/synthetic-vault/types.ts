// Shape ของ "domain profile" ที่แต่ละ synthetic domain ต้อง export ออกมา
//
// แนวคิด: เราไม่เขียนไฟล์ .md ทั้ง 945 ไฟล์ด้วยมือทีละไฟล์ — เราเขียน "เนื้อหาจริง"
// (module, policy, incident, convention, deployment topic) เป็นข้อมูลโครงสร้างแบบนี้แทน
// แล้วให้ build.ts ประกอบเป็นไฟล์ .md ตาม "shape" ที่พบใน vault จริง (ดูตัวอย่างใน
// vault/structure/module-refund.md, vault/business-logic/refund-timeout-policy.md ฯลฯ)
//
// ทุก field ที่เป็น string เนื้อหา สามารถแทรก placeholder แบบ `{{ref:kind:slug}}`
// เพื่ออ้างถึง item อื่นในโดเมนเดียวกันได้ (kind = module|policy|incident|convention|deployment)
// build.ts จะแปลงเป็น wikilink `[[layer/synthetic-<domain>/<file>]]` ให้เอง — ผู้เขียน
// domain profile ไม่ต้องรู้ path จริงของไฟล์ปลายทาง

export interface FnSpec {
  /** ลายเซ็นฟังก์ชันแบบ TypeScript-ish เช่น `processRefund(orderId: string): Promise<Result>` */
  sig: string;
  /** อธิบายสั้นๆ ว่าฟังก์ชันนี้ทำอะไร (ประโยคเดียวพอ) */
  desc: string;
}

export interface ModuleInternals {
  constants?: { name: string; value: string }[];
  /** code snippet สั้นๆ แบบ ```ts ... ``` (ไม่ต้องใส่ backtick fence เอง — ใส่แค่เนื้อใน) */
  typeSnippet?: string;
  /** ประโยคปิดท้ายไฟล์ deep-dive เช่น "เอกสารนี้เป็น reference ล้วนๆ ดู business rule ที่ {{ref:policy:x}}" */
  closingNote: string;
}

export interface ModuleProfile {
  /** kebab-case ไม่ต้องมีคำว่า module ซ้ำ เช่น "picking-engine" */
  slug: string;
  /** ชื่อแสดงผล เช่น "picking-engine" หรือ "Picking Engine Service" */
  name: string;
  tags: string[];
  /** ทำไม module นี้ถึงมีอยู่ / แยกออกมาจากอะไร — 2-4 ประโยค ผสมไทย/อังกฤษแบบเอกสารจริง */
  description: string;
  /** ฟังก์ชันหลัก 3-4 ตัว */
  functions: FnSpec[];
  /** state machine ถ้ามี เช่น "requested → picking → packed → shipped" พร้อมคำอธิบาย */
  stateFlow?: string;
  /** ความสัมพันธ์กับ module อื่น — ใช้ {{ref:module:x}} ได้ */
  relatedNotes: string;
  /**
   * ใส่เมื่อ module นี้ควรมีไฟล์ companion แบบ module-payment-identifiers.md
   * (reference ล้วนๆ ไม่มี business rule) — ต้องมี "internals" ตั้งไว้ใน "exactly 3"
   * จาก 6 modules ต่อโดเมน (validate ใน build.ts)
   */
  internals?: ModuleInternals;
}

export interface EnvVarGroup {
  /** ชื่อ service ที่ env var กลุ่มนี้เป็นของ เช่น "picking-engine-service" */
  service: string;
  vars: { name: string; example: string; note: string }[];
}

export interface PolicySection {
  heading: string;
  body: string;
}

export interface PolicyProfile {
  slug: string;
  title: string;
  tags: string[];
  /** 1-3 ย่อหน้าแรก อธิบาย policy หลัก */
  intro: string[];
  /** section เสริม เช่น "## เงื่อนไข", "## ความสัมพันธ์กับ..." */
  sections?: PolicySection[];
  /**
   * true สำหรับ "primary" policy (ต้องมีพอดี 6 จาก 11 ต่อโดเมน) — policy พวกนี้จะถูกแตก
   * edgeCase ออกเป็นไฟล์แยกต่างหาก (companion doc แบบ refund-policy vs refund-timeout-policy)
   */
  isPrimary: boolean;
  /** required เมื่อ isPrimary=true — เนื้อหาของไฟล์ companion */
  edgeCase?: { title: string; tags: string[]; body: string[] };
}

export interface IncidentProfile {
  slug: string;
  title: string;
  tags: string[];
  summary: string;
  investigation: string;
  cause: string;
  resolution: string;
  followup: string;
}

export interface ConventionSection {
  heading: string;
  body: string;
}

export interface ConventionProfile {
  slug: string;
  title: string;
  tags: string[];
  /** ย่อหน้าเกริ่นก่อนเข้า section แรก (ไม่บังคับ) */
  intro?: string;
  sections: ConventionSection[];
}

export interface DeploymentSection {
  heading: string;
  body: string;
}

export interface DeploymentProfile {
  slug: string;
  title: string;
  tags: string[];
  intro?: string;
  sections: DeploymentSection[];
}

export interface DomainProfile {
  /** kebab-case, ตรงกับที่ระบุใน task เช่น "warehouse-robotics" */
  id: string;
  /** ชื่อระบบแบบแสดงผล เช่น "ระบบหุ่นยนต์คลังสินค้า (WareBot)" */
  displayName: string;
  /** 2 ย่อหน้าอธิบายระบบโดยรวม ใช้ในไฟล์ overview-architecture */
  summary: string[];
  /** tag กลางที่ใช้ร่วมกับไฟล์ระดับ "architecture" ทั้ง 5 ไฟล์ */
  domainTags: string[];
  /** สำหรับไฟล์ service-boundaries.md */
  serviceBoundaryNote: string[];
  /** สำหรับไฟล์ api-gateway.md */
  apiGatewayNote: string[];
  /** สำหรับไฟล์ database-schema.md (อาจมี markdown table ในนี้ได้เลย) */
  databaseSchemaNote: string[];
  /** สำหรับไฟล์ queue-architecture.md */
  queueArchitectureNote: string[];

  /** ต้องมีพอดี 6 ชิ้น, ต้องมีพอดี 3 ชิ้นที่ตั้ง internals */
  modules: ModuleProfile[];
  envVarGroups: EnvVarGroup[];
  /** ต้องมีพอดี 11 ชิ้น, ต้องมีพอดี 6 ชิ้นที่ isPrimary=true พร้อม edgeCase */
  policies: PolicyProfile[];
  /** ต้องมีพอดี 14 ชิ้น */
  incidents: IncidentProfile[];
  /** ต้องมีพอดี 9 ชิ้น */
  conventions: ConventionProfile[];
  /** ต้องมีพอดี 8 ชิ้น (env-variables-reference ถูก generate เพิ่มให้อัตโนมัติเป็นไฟล์ที่ 9) */
  deploymentTopics: DeploymentProfile[];
}

export const EXPECTED_COUNTS = {
  modules: 6,
  modulesWithInternals: 3,
  policies: 11,
  primaryPolicies: 6,
  incidents: 14,
  conventions: 9,
  deploymentTopics: 8,
} as const;
