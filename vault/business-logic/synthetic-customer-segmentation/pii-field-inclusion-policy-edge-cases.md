---
layer: business-logic
tags: [pii, incident, edge-case]
created: 2026-06-16
links:
  - "[[structure/synthetic-customer-segmentation/module-channel-exporter]]"
  - "[[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy]]"
---

# ข้อยกเว้น: PII Field ที่ถูกรวมเข้าใน Export โดยไม่ตั้งใจ

ถ้าพบว่า export ที่ออกไปแล้วมี PII field ปนอยู่ ต้องแจ้ง channel ให้ delete data ดังกล่าวทันทีและแจ้ง Data Protection Officer ภายใน 1 ชั่วโมง — เพราะอาจเป็น reportable incident ตาม PDPA/GDPR

[[structure/synthetic-customer-segmentation/module-channel-exporter]] มี PII field scanner ที่ scan payload ก่อน send ทุกครั้ง แต่ scanner ทำงานบน field name matching ไม่ใช่ content analysis — ถ้า field ถูกส่งใน nested object ที่ชื่อไม่ตรง pattern อาจผ่านได้ ควร audit export format ทุกครั้งที่ schema เปลี่ยน

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-customer-segmentation/pii-field-inclusion-policy]] ("นโยบายการใส่ PII Field ใน Segment Export") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
