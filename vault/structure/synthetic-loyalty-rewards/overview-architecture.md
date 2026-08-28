---
layer: structure
tags: [loyalty-rewards, pointsvault, architecture, overview]
created: 2026-03-10
links:
  - "[[structure/synthetic-loyalty-rewards/module-points-ledger]]"
  - "[[structure/synthetic-loyalty-rewards/module-tier-calculator]]"
  - "[[structure/synthetic-loyalty-rewards/module-redemption-engine]]"
  - "[[structure/synthetic-loyalty-rewards/module-offer-personalizer]]"
  - "[[structure/synthetic-loyalty-rewards/module-partner-sync]]"
  - "[[structure/synthetic-loyalty-rewards/module-expiry-scheduler]]"
---

# ภาพรวมสถาปัตยกรรม PointsVault — ระบบสะสมแต้มและสิทธิพิเศษ

PointsVault คือแพลตฟอร์มบริหารโปรแกรมสะสมแต้มสำหรับ brand พันธมิตรหลายเจ้า สมาชิกได้รับแต้มจากการซื้อสินค้าและบริการที่ร้านค้าในเครือ นำแต้มไปแลกรางวัล ติดตามสถานะระดับสมาชิก (Bronze/Silver/Gold/Platinum) และรับ offer พิเศษที่ปรับตามพฤติกรรมของแต่ละคน

ระบบแบ่งออกเป็นหลาย service ย่อยตามหน้าที่ ตั้งแต่บันทึกรายการแต้มในบัญชีสมาชิก คำนวณระดับ tier ตามยอดแต้มสะสม ไปจนถึงตั้งเวลาลบแต้มหมดอายุและ sync ข้อมูลแต้มกับ partner รายต่างๆ ทีมวิศวกรรมเรียกช่วง 00:00-02:00 ว่า batch window เพราะเป็นช่วงที่ expiry job และ tier recalculation รันพร้อมกันและใช้ทรัพยากรสูงสุด

## Module หลัก

- **points-ledger** — เจ้าของยอดแต้มและประวัติ transaction ทุกรายการของสมาชิก ออกแบบเป็น append-only l ดู [[structure/synthetic-loyalty-rewards/module-points-ledger]]
- **tier-calculator** — คำนวณและบริหาร tier ของสมาชิก (Bronze/Silver/Gold/Platinum) โดยอิงจากยอดแต้มสะสม ดู [[structure/synthetic-loyalty-rewards/module-tier-calculator]]
- **redemption-engine** — รับผิดชอบกระบวนการแลกรางวัลทั้งหมด ตั้งแต่ตรวจสอบว่าสมาชิกมีแต้มพอและมีสิทธิ์แลก ดู [[structure/synthetic-loyalty-rewards/module-redemption-engine]]
- **offer-personalizer** — สร้างและจัดการ offer พิเศษที่ปรับตามพฤติกรรมและ tier ของสมาชิกแต่ละคน ทำงานแบบ b ดู [[structure/synthetic-loyalty-rewards/module-offer-personalizer]]
- **partner-sync** — รับผิดชอบ sync ข้อมูล transaction และยืนยันแต้มจาก partner brand ภายนอก แต่ละ pa ดู [[structure/synthetic-loyalty-rewards/module-partner-sync]]
- **expiry-scheduler** — ติดตามและ execute การหมดอายุของแต้มตาม policy ที่กำหนด รันเป็น batch job ช่วง 00 ดู [[structure/synthetic-loyalty-rewards/module-expiry-scheduler]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-loyalty-rewards/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-loyalty-rewards/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-loyalty-rewards/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-loyalty-rewards/database-schema]]
