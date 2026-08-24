// สร้าง synthetic distractor notes (~945 ไฟล์ ครอบคลุม 15 โดเมนธุรกิจสมมติที่ไม่เกี่ยวกับ
// payment/refund/order ของ PayFlow เลย) เพื่อ scale-test vault จาก 55 ไฟล์จริงให้เป็น ~1000 ไฟล์
//
// เนื้อหาจริงทั้งหมดถูกเขียนไว้ล่วงหน้าใน src/cli/synthetic-vault/domains/*.ts (domain profile)
// ไฟล์นี้แค่ประกอบ (build.ts) แล้วเขียนลงดิสก์ — ไม่มีการเรียก LLM หรือสุ่มเนื้อหาที่ไม่ผ่านคนคิดมาก่อน
//
// รันซ้ำได้เสมอ (idempotent ในแง่ overwrite ไฟล์เดิม) เพราะ seed ของ PRNG มาจาก domain id
// ตรงๆ — ไม่ได้ลบไฟล์ synthetic-* เก่าที่อาจเหลือจาก domain ที่ถูกเอาออกไปแล้วนะ ถ้าเปลี่ยน
// รายชื่อโดเมนต้องไปลบโฟลเดอร์เก่าด้วยมือ
//
// ไฟล์ 55 ไฟล์จริงของ PayFlow และ bench/queries.json ไม่ถูกแตะต้องเลย — เขียนเฉพาะไฟล์ใต้
// vault/<layer>/synthetic-<domain>/ เท่านั้น

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { buildDomainFiles } from "./synthetic-vault/build.js";
import { allDomainProfiles } from "./synthetic-vault/domains/index.js";

const VAULT_ROOT = join(process.cwd(), "vault");

async function main(): Promise<void> {
  const countsByLayer: Record<string, number> = {};
  let total = 0;

  for (const profile of allDomainProfiles) {
    const files = buildDomainFiles(profile);
    for (const f of files) {
      const fullPath = join(VAULT_ROOT, ...f.relPath.split("/"));
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, f.content, "utf-8");

      const layerFolder = f.relPath.split("/")[0]!;
      countsByLayer[layerFolder] = (countsByLayer[layerFolder] ?? 0) + 1;
      total++;
    }
    console.log(`[${profile.id}] เขียน ${files.length} ไฟล์`);
  }

  console.log(`\nรวมทั้งหมด: ${total} ไฟล์ จาก ${allDomainProfiles.length} โดเมน`);
  console.log(countsByLayer);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
