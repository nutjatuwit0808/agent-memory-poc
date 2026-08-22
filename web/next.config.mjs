/** @type {import('next').NextConfig} */
const nextConfig = {
  // ตั้งใจไม่มี config พิเศษเลย — เพราะ D-7 เลือกสถาปัตยกรรม "แยก process"
  // web/ ไม่ import อะไรจาก src/ จึงไม่ต้องตั้ง serverExternalPackages ให้ native module
  // (better-sqlite3 / onnxruntime-node / lancedb) และไม่ต้องแก้ path resolution ของโค้ดเดิม
  reactStrictMode: true,

  // ปิดการสร้าง AGENTS.md/CLAUDE.md อัตโนมัติของ Next — โปรเจกต์นี้ใช้ CLAUDE.md ที่ root
  // เป็น "สัญญาการออกแบบ" ตัวจริง การมี CLAUDE.md ตัวที่สองใน web/ ที่ชี้ไปที่อื่นทำให้สับสน
  // (ข้อควรรู้เรื่อง Next 16 ย้ายไปเขียนใน workshops/05-frontend/README.md แทน)
  agentRules: false,

  // repo นี้มี lockfile 2 ตัว (root + web/) ซึ่งตั้งใจให้แยกกันตาม D-6
  // ต้องบอก root ให้ Turbopack ชัดเจน ไม่งั้นมันจะเดาไปที่ root แล้วเตือนทุกครั้ง
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
