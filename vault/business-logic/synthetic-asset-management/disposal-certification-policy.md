---
layer: business-logic
tags: [disposal, compliance, security, policy]
created: 2026-05-11
links:
  - "[[structure/synthetic-asset-management/module-disposal-workflow]]"
  - "[[business-logic/synthetic-asset-management/disposal-certification-policy-edge-cases]]"
---

# นโยบายใบรับรองที่ต้องมีก่อนปิด Disposal

ก่อน [[structure/synthetic-asset-management/module-disposal-workflow]] จะปิด disposal record ได้ ต้องมีใบรับรองครบตามประเภทสินทรัพย์ — ฮาร์ดแวร์ที่เคยเก็บข้อมูลต้องมี data destruction certificate จากผู้ให้บริการที่ได้รับการรับรอง, สินทรัพย์ที่ต้อง recycle ตามกฎหมาย e-waste ต้องมี recycling certificate

สินทรัพย์ที่จะส่งต่อให้พนักงาน donate หรือขายต่อ ต้องผ่าน data wipe ที่ได้มาตรฐาน NIST 800-88 ก่อนเสมอ และต้องมีใบรับรอง wipe แนบด้วย ระบบจะไม่ให้ complete disposal โดยไม่มีเอกสารนี้

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-asset-management/disposal-certification-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
