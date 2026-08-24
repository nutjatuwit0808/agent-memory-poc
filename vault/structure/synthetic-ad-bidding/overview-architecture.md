---
layer: structure
tags: [ad-bidding, adpulse, architecture, overview]
created: 2025-10-08
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[structure/synthetic-ad-bidding/module-auction-engine]]"
  - "[[structure/synthetic-ad-bidding/module-budget-pacer]]"
  - "[[structure/synthetic-ad-bidding/module-fraud-filter]]"
  - "[[structure/synthetic-ad-bidding/module-creative-renderer]]"
  - "[[structure/synthetic-ad-bidding/module-win-notice-processor]]"
---

# ภาพรวมสถาปัตยกรรม AdPulse — แพลตฟอร์มประมูลโฆษณาแบบเรียลไทม์ (RTB)

AdPulse คือแพลตฟอร์ม real-time bidding (RTB) ที่รับ bid request จาก SSP (Supply-Side Platform) หลายเจ้าพร้อมกัน แล้วตัดสินใจว่าจะประมูลราคาเท่าไหร่ให้แคมเปญของผู้ลงโฆษณาแต่ละราย ภายในเวลาไม่เกิน ~100ms ต่อ request (deadline มาตรฐานที่ SSP ส่วนใหญ่กำหนดตาม spec OpenRTB) ระบบต้องตัดสินใจเรื่อง targeting, budget, fraud, และราคา พร้อมกันภายในกรอบเวลาที่แคบมาก

ระบบแบ่งเป็น service ย่อยตาม pipeline ของการประมูล ตั้งแต่รับ bid request ไปจนถึงเก็บผลชนะประมูล (win notice) แล้วเรียกเก็บเงินแคมเปญ ทีมวิศวกรรมเรียกช่วง 19:00-23:00 (prime time ของวิดีโอ/สตรีมมิง) ว่า peak traffic window เพราะเป็นช่วงที่ bid request ไหลเข้าสูงสุด และเป็นช่วงที่ latency budget ตึงที่สุดพร้อมกัน

## Module หลัก

- **bid-request-handler** — จุดเข้าเดียวของทุก bid request จาก SSP รับผิดชอบ orchestrate ทั้ง pipeline ภายใน ดู [[structure/synthetic-ad-bidding/module-bid-request-handler]]
- **auction-engine** — ตัดสินใจว่าจะประมูลราคาเท่าไหร่ และเลือกแคมเปญที่ชนะเมื่อมีหลายแคมเปญแข่งกันสำหร ดู [[structure/synthetic-ad-bidding/module-auction-engine]]
- **budget-pacer** — ควบคุมอัตราการใช้ budget ของแต่ละแคมเปญให้กระจายตลอดทั้งวันแทนที่จะหมดเร็วเกินไป ดู [[structure/synthetic-ad-bidding/module-budget-pacer]]
- **fraud-filter** — ตรวจจับ bid request ที่มาจาก traffic ผิดปกติ (bot, datacenter IP, click farm pat ดู [[structure/synthetic-ad-bidding/module-fraud-filter]]
- **creative-renderer** — เตรียม creative (รูป/วิดีโอ/HTML5 banner) ให้พร้อมแสดงผลก่อนส่ง bid response กลับ SSP รวมถึงเลือก creative variant ที่เหมาะกับขนาด placement และตรวจสอบว่า creative ผ่านการอนุมัติแล้ว แยกเป็น service อิสระเพราะ logic การ render/เลือก variant เปลี่ยนบ่อยตาม format โฆษณาใหม่ๆ ดู [[structure/synthetic-ad-bidding/module-creative-renderer]]
- **win-notice-processor** — รับ win notice จาก SSP เมื่อ AdPulse ชนะประมูลจริงในตลาดภายนอก (ต่างจาก internal ดู [[structure/synthetic-ad-bidding/module-win-notice-processor]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-ad-bidding/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-ad-bidding/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-ad-bidding/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-ad-bidding/database-schema]]
