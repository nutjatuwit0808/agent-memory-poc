---
layer: structure
tags: [marketing-automation, wavecast, database, schema]
created: 2026-02-25
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-marketing-automation/module-campaign-builder]] ดูแล ได้แก่ `campaigns` (metadata และเนื้อหาของแต่ละ campaign) และ `campaign_versions` (ประวัติการแก้ไข ไม่ลบทิ้งเพื่อ audit ว่าเนื้อหาไหนถูกส่งจริงตอนไหน)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `campaigns` | campaign-builder | เนื้อหาและการตั้งค่า campaign |
| `segments` | segment-engine | นิยามและ snapshot สมาชิกล่าสุดของแต่ละ segment |
| `send_jobs` | send-scheduler | คิวส่งจริง แบ่งเป็น batch |
| `consent_records` | consent-manager | สถานะ opt-in/opt-out ต่อ contact ต่อ channel |

ทุกตารางใช้ `contactId` เป็น foreign key ร่วมกันแบบ soft reference (ไม่มี FK constraint ข้าม database จริงเพราะแยก schema กันคนละ service) ตรวจสอบความสอดคล้องด้วย reconciliation job รายวันแทน
