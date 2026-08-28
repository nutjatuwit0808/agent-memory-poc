---
layer: business-logic
tags: [dual-source, risk, policy]
created: 2025-11-07
links:
  - "[[structure/synthetic-supply-chain/module-replenishment-trigger]]"
  - "[[business-logic/synthetic-supply-chain/dual-source-requirement-policy-edge-cases]]"
---

# นโยบายข้อกำหนด Dual-Source ซัพพลายเออร์

SKU ที่มีปริมาณใช้งานสูง (top 20% by annual spend) และ criticality ระดับ high ต้องมีซัพพลายเออร์ที่ qualified อย่างน้อย 2 รายเสมอ เพื่อลด single point of failure ในกรณีซัพพลายเออร์รายหลักมีปัญหา

[[structure/synthetic-supply-chain/module-replenishment-trigger]] จะใช้ซัพพลายเออร์รายหลักโดยปกติ แต่จะ switch ไปซัพพลายเออร์สำรองอัตโนมัติเมื่อรายหลักอยู่ใน probation หรือ blacklist หรือเมื่อรายหลักไม่สามารถตอบสนองปริมาณที่ต้องการได้ในเวลาที่กำหนด

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-supply-chain/dual-source-requirement-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
