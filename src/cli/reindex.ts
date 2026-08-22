import { readVault } from "../core/vault-reader.js";
import { reindex, VAULT_DIR, DB_PATH } from "../search/backends/reindex-core.js";

async function main(): Promise<void> {
  const full = process.argv.includes("--full");
  const notes = await readVault(VAULT_DIR);
  const stats = reindex(notes, full);

  console.log(`Reindex ${full ? "(--full)" : "(incremental)"} เสร็จแล้ว`);
  console.log(`  notes ทั้งหมดใน vault: ${stats.totalNotes}`);
  console.log(
    `  inserted: ${stats.inserted}, updated: ${stats.updated}, deleted: ${stats.deleted}, skipped (ไม่เปลี่ยน): ${stats.skipped}`
  );
  console.log(`  buildTimeMs: ${stats.buildTimeMs.toFixed(2)}`);
  console.log(`  ขนาดไฟล์ ${DB_PATH}: ${stats.dbSizeBytes} bytes`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
