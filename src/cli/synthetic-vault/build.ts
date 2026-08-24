// ประกอบ DomainProfile → รายการไฟล์ .md (relPath + content เต็ม รวม frontmatter)
//
// หลักการ: เนื้อหา "จริง" มาจาก domain profile (เขียนโดยคน/agent ล่วงหน้า) ส่วนที่นี่ทำแค่
// - จัดรูปแบบให้ตรง shape ของไฟล์จริงใน vault/ (frontmatter, ## heading, ลำดับ section)
// - resolve {{ref:kind:slug}} placeholder เป็น wikilink จริง
// - สุ่มค่าที่ควร "แตกต่างกันต่อไฟล์" แบบ deterministic (วันที่, เลข case) ด้วย seeded PRNG
//
// ไม่มีการเรียก LLM ที่นี่ — เนื้อหาทั้งหมดมาจาก domain profile ที่เขียนไว้ล่วงหน้าเท่านั้น
// (สอดคล้องกับ CLAUDE.md §2.1 deterministic ownership)

import { mulberry32, randomDate, stringSeed, type Rng } from "./prng.js";
import {
  EXPECTED_COUNTS,
  type DomainProfile,
  type ModuleProfile,
} from "./types.js";

export interface GeneratedFile {
  /** relative path จาก vault root รวม .md แล้ว เช่น "structure/synthetic-warehouse-robotics/module-picking-engine.md" */
  relPath: string;
  content: string;
}

const LAYER_FOLDER = {
  module: "structure",
  arch: "structure",
  policy: "business-logic",
  incident: "support-cases",
  convention: "convention",
  deployment: "deployment",
} as const;

const LAYER_VALUE = {
  module: "structure",
  arch: "structure",
  policy: "business-logic",
  incident: "support-case",
  convention: "convention",
  deployment: "deployment",
} as const;

type RefKind = keyof typeof LAYER_FOLDER;

const REF_RE = /\{\{ref:(module|policy|incident|convention|deployment|arch):([a-z0-9-]+)\}\}/g;
const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

function domainFolder(layerFolder: string, domainId: string): string {
  return `${layerFolder}/synthetic-${domainId}`;
}

function assertCount(domainId: string, label: string, actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(
      `[synthetic-vault] domain "${domainId}": ${label} ต้องมีพอดี ${expected} ชิ้น แต่พบ ${actual} ชิ้น`
    );
  }
}

function frontmatter(layer: string, tags: string[], created: string, links: string[]): string {
  if (tags.length === 0) throw new Error("tags ว่างไม่ได้");
  const tagLine = `[${tags.join(", ")}]`;
  const linkLines =
    links.length > 0 ? `links:\n${links.map((l) => `  - "[[${l}]]"`).join("\n")}\n` : "";
  return `---\nlayer: ${layer}\ntags: ${tagLine}\ncreated: ${created}\n${linkLines}---\n\n`;
}

/** ดึง target ทั้งหมดจาก wikilink ที่ resolve แล้วในเนื้อหา ใช้ทำ frontmatter links */
function extractLinkTargets(body: string): string[] {
  const targets = [...body.matchAll(WIKILINK_RE)].map((m) => m[1]!.trim());
  return Array.from(new Set(targets));
}

export function buildDomainFiles(profile: DomainProfile): GeneratedFile[] {
  const { id: domainId } = profile;

  assertCount(domainId, "modules", profile.modules.length, EXPECTED_COUNTS.modules);
  const modulesWithInternals = profile.modules.filter((m) => m.internals);
  assertCount(
    domainId,
    "modules ที่มี internals (deep-dive)",
    modulesWithInternals.length,
    EXPECTED_COUNTS.modulesWithInternals
  );
  assertCount(domainId, "policies", profile.policies.length, EXPECTED_COUNTS.policies);
  const primaryPolicies = profile.policies.filter((p) => p.isPrimary);
  for (const p of primaryPolicies) {
    if (!p.edgeCase) {
      throw new Error(`[synthetic-vault] domain "${domainId}": policy "${p.slug}" isPrimary=true แต่ไม่มี edgeCase`);
    }
  }
  assertCount(domainId, "primary policies", primaryPolicies.length, EXPECTED_COUNTS.primaryPolicies);
  assertCount(domainId, "incidents", profile.incidents.length, EXPECTED_COUNTS.incidents);
  assertCount(domainId, "conventions", profile.conventions.length, EXPECTED_COUNTS.conventions);
  assertCount(
    domainId,
    "deploymentTopics",
    profile.deploymentTopics.length,
    EXPECTED_COUNTS.deploymentTopics
  );

  const rng: Rng = mulberry32(stringSeed(domainId));

  // ── pass 1: สร้าง registry slug → relPath (ไม่รวม .md) ก่อน เพื่อให้ resolve ref ข้าม item ได้ ──
  const registry = new Map<string, string>();
  const register = (kind: RefKind, slug: string, filename: string): string => {
    const relPath = `${domainFolder(LAYER_FOLDER[kind], domainId)}/${filename}`;
    registry.set(`${kind}:${slug}`, relPath);
    return relPath;
  };

  for (const m of profile.modules) register("module", m.slug, `module-${m.slug}`);
  register("arch", "overview", "overview-architecture");
  register("arch", "boundaries", "service-boundaries");
  register("arch", "gateway", "api-gateway");
  register("arch", "schema", "database-schema");
  register("arch", "queue", "queue-architecture");
  for (const p of profile.policies) register("policy", p.slug, p.slug);
  for (const c of profile.conventions) register("convention", c.slug, c.slug);
  for (const d of profile.deploymentTopics) register("deployment", d.slug, d.slug);

  // เลข case ต้อง unique ภายในโดเมน — สุ่มแบบ deterministic แล้ว retry ถ้าชน
  const usedCaseNumbers = new Set<number>();
  const caseNumberBySlug = new Map<string, number>();
  for (const inc of profile.incidents) {
    let n: number;
    do {
      n = 1000 + Math.floor(rng() * 9000);
    } while (usedCaseNumbers.has(n));
    usedCaseNumbers.add(n);
    caseNumberBySlug.set(inc.slug, n);
    register("incident", inc.slug, `case-${n}`);
  }

  const resolve = (text: string): string =>
    text.replace(REF_RE, (whole, kind: RefKind, slug: string) => {
      const target = registry.get(`${kind}:${slug}`);
      if (!target) {
        throw new Error(
          `[synthetic-vault] domain "${domainId}": ref ไม่พบปลายทาง "${whole}" (ไม่มี ${kind}:${slug} ใน registry)`
        );
      }
      return `[[${target}]]`;
    });

  const files: GeneratedFile[] = [];
  const emit = (relPathNoExt: string, layerValue: string, tags: string[], body: string): void => {
    const resolved = resolve(body).trim() + "\n";
    const links = extractLinkTargets(resolved);
    const created = randomDate(rng);
    const fm = frontmatter(layerValue, tags, created, links.slice(0, 6));
    files.push({ relPath: `${relPathNoExt}.md`, content: fm + resolved });
  };

  // ── structure: modules ──
  for (const m of profile.modules) {
    emit(registry.get(`module:${m.slug}`)!, LAYER_VALUE.module, m.tags, renderModule(m));
  }

  // ── structure: module deep-dive companion (exactly 3) ──
  for (const m of modulesWithInternals) {
    const basePath = registry.get(`module:${m.slug}`)!;
    const relPath = `${basePath}-reference`;
    emit(relPath, LAYER_VALUE.module, [...m.tags, "reference", "identifiers"], renderModuleReference(m, basePath));
  }

  // ── structure: 5 domain-level architecture docs ──
  emit(registry.get("arch:overview")!, LAYER_VALUE.arch, [...profile.domainTags, "architecture", "overview"], renderOverview(profile, registry));
  emit(registry.get("arch:boundaries")!, LAYER_VALUE.arch, [...profile.domainTags, "boundaries"], joinParas(profile.serviceBoundaryNote, "# Service Boundaries"));
  emit(registry.get("arch:gateway")!, LAYER_VALUE.arch, [...profile.domainTags, "gateway", "api"], joinParas(profile.apiGatewayNote, "# API Gateway"));
  emit(registry.get("arch:schema")!, LAYER_VALUE.arch, [...profile.domainTags, "database", "schema"], joinParas(profile.databaseSchemaNote, "# Database Schema"));
  emit(registry.get("arch:queue")!, LAYER_VALUE.arch, [...profile.domainTags, "queue", "async"], joinParas(profile.queueArchitectureNote, "# Queue Architecture"));

  // ── business-logic: policies + edge-case companions ──
  for (const p of profile.policies) {
    emit(registry.get(`policy:${p.slug}`)!, LAYER_VALUE.policy, p.tags, renderPolicy(p, registry.get(`policy:${p.slug}`)!));
  }
  for (const p of primaryPolicies) {
    const ec = p.edgeCase!;
    const basePath = registry.get(`policy:${p.slug}`)!;
    emit(`${basePath}-edge-cases`, LAYER_VALUE.policy, ec.tags, renderEdgeCase(ec, basePath, p.title));
  }

  // ── support-cases: incidents ──
  for (const inc of profile.incidents) {
    const n = caseNumberBySlug.get(inc.slug)!;
    emit(registry.get(`incident:${inc.slug}`)!, LAYER_VALUE.incident, inc.tags, renderIncident(inc, n));
  }

  // ── convention ──
  for (const c of profile.conventions) {
    emit(registry.get(`convention:${c.slug}`)!, LAYER_VALUE.convention, c.tags, renderSectionsDoc(c.title, c.intro, c.sections));
  }

  // ── deployment: topics + generated env-variables-reference ──
  for (const d of profile.deploymentTopics) {
    emit(registry.get(`deployment:${d.slug}`)!, LAYER_VALUE.deployment, d.tags, renderSectionsDoc(d.title, d.intro, d.sections));
  }
  emit(
    `${domainFolder(LAYER_FOLDER.deployment, domainId)}/env-variables-reference`,
    LAYER_VALUE.deployment,
    [...profile.domainTags, "environment", "config", "reference"],
    renderEnvVarReference(profile)
  );

  return files;
}

// ─────────────────────────── renderers ───────────────────────────

function joinParas(paras: string[], heading?: string): string {
  const body = paras.join("\n\n");
  return heading ? `${heading}\n\n${body}` : body;
}

function renderModule(m: ModuleProfile): string {
  const parts: string[] = [`# Module: ${m.name}`, m.description];
  parts.push(
    ["## ฟังก์ชันหลัก", ...m.functions.map((f) => `- \`${f.sig}\` — ${f.desc}`)].join("\n")
  );
  if (m.stateFlow) {
    parts.push(`## State\n\n${m.stateFlow}`);
  }
  parts.push(`## ความสัมพันธ์กับ module อื่น\n\n${m.relatedNotes}`);
  return parts.join("\n\n");
}

function renderModuleReference(m: ModuleProfile, _basePath: string): string {
  const internals = m.internals!;
  const parts: string[] = [
    `# ${m.name} — Function & Identifier Reference`,
    `เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด ${m.name} สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[${_basePath}]])`,
    ["## Public functions", ...m.functions.map((f) => `- \`${f.sig}\` — ${f.desc}`)].join("\n"),
  ];
  if (internals.constants && internals.constants.length > 0) {
    parts.push(
      ["## Internal constants", ...internals.constants.map((c) => `- \`${c.name} = ${c.value}\``)].join("\n")
    );
  }
  if (internals.typeSnippet) {
    parts.push(`## Type\n\n\`\`\`ts\n${internals.typeSnippet}\n\`\`\``);
  }
  parts.push(internals.closingNote);
  return parts.join("\n\n");
}

function renderOverview(profile: DomainProfile, registry: Map<string, string>): string {
  const moduleList = profile.modules
    .map((m) => `- **${m.name}** — ${firstSentence(m.description)} ดู [[${registry.get(`module:${m.slug}`)}]]`)
    .join("\n");
  const parts = [
    `# ภาพรวมสถาปัตยกรรม ${profile.displayName}`,
    joinParas(profile.summary),
    `## Module หลัก\n\n${moduleList}`,
    `## เอกสารที่เกี่ยวข้อง\n\nรายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[${registry.get("arch:boundaries")}]] ผ่าน synchronous call ดูที่ [[${registry.get("arch:gateway")}]] และ asynchronous event ดูที่ [[${registry.get("arch:queue")}]] โครงสร้างข้อมูลดูที่ [[${registry.get("arch:schema")}]]`,
  ];
  return parts.join("\n\n");
}

function firstSentence(text: string): string {
  const idx = text.search(/(?<=[.ฯ])\s|(?<=ๆ)\s/);
  const cut = idx > 20 ? text.slice(0, idx) : text.split("\n")[0]!.slice(0, 80);
  return cut.trim();
}

function renderPolicy(p: DomainProfile["policies"][number], selfPath: string): string {
  const parts: string[] = [`# ${p.title}`, ...p.intro];
  for (const s of p.sections ?? []) {
    parts.push(`## ${s.heading}\n\n${s.body}`);
  }
  if (p.isPrimary && p.edgeCase) {
    parts.push(`กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[${selfPath}-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป`);
  }
  return parts.join("\n\n");
}

function renderEdgeCase(
  ec: NonNullable<DomainProfile["policies"][number]["edgeCase"]>,
  mainPath: string,
  mainTitle: string
): string {
  const parts = [`# ${ec.title}`, ...ec.body, `เอกสารนี้เป็นส่วนขยายของ [[${mainPath}]] ("${mainTitle}") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก`];
  return parts.join("\n\n");
}

function renderIncident(inc: DomainProfile["incidents"][number], caseNumber: number): string {
  return [
    `# Case ${caseNumber} — ${inc.title}`,
    `## สรุปเคส\n\n${inc.summary}`,
    `## การตรวจสอบ\n\n${inc.investigation}`,
    `## สาเหตุ\n\n${inc.cause}`,
    `## การแก้ไข\n\n${inc.resolution}`,
    `## Follow-up\n\n${inc.followup}`,
  ].join("\n\n");
}

function renderSectionsDoc(
  title: string,
  intro: string | undefined,
  sections: { heading: string; body: string }[]
): string {
  const parts = [`# ${title}`];
  if (intro) parts.push(intro);
  for (const s of sections) {
    parts.push(`## ${s.heading}\n\n${s.body}`);
  }
  return parts.join("\n\n");
}

function renderEnvVarReference(profile: DomainProfile): string {
  const parts = [`# Environment Variables Reference — ${profile.displayName}`];
  for (const g of profile.envVarGroups) {
    const rows = g.vars.map((v) => `| \`${v.name}\` | \`${v.example}\` | ${v.note} |`).join("\n");
    parts.push(
      `## ${g.service}\n\n| ตัวแปร | ตัวอย่างค่า | หมายเหตุ |\n|---|---|---|\n${rows}`
    );
  }
  parts.push(
    "## กติกา\n\nตัวแปร secret (API key, token, credential) เก็บใน secret manager ของ cloud provider เท่านั้น ห้ามใส่ใน `.env` ที่ commit เข้า repo แม้จะเป็น `.env.example` ก็ต้องใส่ placeholder เท่านั้น"
  );
  return parts.join("\n\n");
}
