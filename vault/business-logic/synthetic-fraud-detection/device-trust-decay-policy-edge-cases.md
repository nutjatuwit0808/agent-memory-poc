---
layer: business-logic
tags: [device, trust, shared-ip, edge-case]
created: 2026-03-21
links:
  - "[[structure/synthetic-fraud-detection/module-ml-scorer]]"
  - "[[business-logic/synthetic-fraud-detection/device-trust-decay-policy]]"
---

# Device Trust ลดลงจาก IP Sharing (NAT/VPN/Library/Office)

device ที่ใช้ IP ร่วมกับ device อื่นที่ถูก flag ว่า untrusted (เช่น ใช้ WiFi สาธารณะหรือ corporate NAT เดียวกัน) จะไม่ถูก penalize trust score เพียงเพราะ IP sharing เพียงอย่างเดียว — IP sharing เป็น feature หนึ่งที่ใช้ใน ML scoring แต่ไม่ใช่ trigger สำหรับ trust decay โดยตรง

ยกเว้นกรณีที่ device ส่ง event ที่ pattern เหมือน device untrusted อื่นมากผิดปกติ (cosine similarity > 0.9 บน behavioral vector) ซึ่ง [[structure/synthetic-fraud-detection/module-ml-scorer]] จะ flag ให้ human review แทนที่จะ auto-decay trust

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-fraud-detection/device-trust-decay-policy]] ("นโยบาย Device Trust Decay") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
