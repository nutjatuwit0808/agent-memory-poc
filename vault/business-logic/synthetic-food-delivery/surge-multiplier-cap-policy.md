---
layer: business-logic
tags: [pricing, surge, policy]
created: 2026-06-30
links:
  - "[[structure/synthetic-food-delivery/module-surge-pricer]]"
  - "[[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy-edge-cases]]"
---

# นโยบาย Cap ของ Surge Multiplier

[[structure/synthetic-food-delivery/module-surge-pricer]] คำนวณ multiplier จาก demand/supply ratio แต่ค่าที่คืนออกมาจะไม่เกิน `SURGE_MAX_MULTIPLIER` ไม่ว่า ratio จะสูงแค่ไหน — cap นี้เป็น hard limit ระดับ policy ไม่ใช่แค่ default config ที่ ops เปลี่ยนได้ตามใจ

การเปลี่ยน cap ต้องผ่านการอนุมัติจาก Head of Supply และ Legal ทุกครั้ง เพราะมีผลต่อการรับรู้ราคาของลูกค้าและอาจกระทบกฎหมายคุ้มครองผู้บริโภคในบางพื้นที่

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-food-delivery/surge-multiplier-cap-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
