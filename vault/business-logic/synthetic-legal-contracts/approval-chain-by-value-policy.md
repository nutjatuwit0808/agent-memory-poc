---
layer: business-logic
tags: [approval, policy]
created: 2026-06-27
links:
  - "[[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy-edge-cases]]"
---

# นโยบายเส้นทางอนุมัติตามมูลค่าสัญญา

สัญญาแต่ละฉบับต้องผ่านการอนุมัติตามจำนวนขั้นที่กำหนดโดยมูลค่าสัญญา — ต่ำกว่า `APPROVAL_TIER_1_MAX_VALUE_THB` อนุมัติโดยหัวหน้าแผนกคนเดียว, สูงกว่านั้นถึง `APPROVAL_TIER_2_MAX_VALUE_THB` ต้องผ่านทีมกฎหมายเพิ่ม, สูงกว่านั้นต้องผ่าน CFO ด้วย

มูลค่าสัญญาที่ใช้คำนวณต้องเป็นมูลค่ารวมตลอดอายุสัญญา ไม่ใช่มูลค่าต่องวด เพื่อไม่ให้สัญญามูลค่าสูงถูกแบ่งเป็นงวดเล็กๆ เพื่อหลบเลี่ยงขั้นตอนอนุมัติที่เข้มกว่า

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-legal-contracts/approval-chain-by-value-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
