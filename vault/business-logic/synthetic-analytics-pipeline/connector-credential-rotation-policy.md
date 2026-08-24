---
layer: business-logic
tags: [ingest, security, policy]
created: 2026-02-13
links:
  - "[[business-logic/synthetic-analytics-pipeline/extract-retry-policy]]"
---

# นโยบายหมุนเวียน Credential ของ Connector

credential ของทุก source connection ต้องหมุนเวียนทุก 90 วัน ระบบจะแจ้งเตือนทีมเจ้าของ source ล่วงหน้า 14 วันก่อนหมดอายุ ผ่าน Slack channel เดียวกับที่ใช้แจ้ง job failure

ถ้า credential หมดอายุแล้วยังไม่มีการหมุนเวียน `runExtract` จะ pause source นั้นอัตโนมัติแทนที่จะปล่อยให้ retry ซ้ำจนติด rate limit จากความล้มเหลวต่อเนื่อง ดู [[business-logic/synthetic-analytics-pipeline/extract-retry-policy]] สำหรับพฤติกรรม retry ปกติที่ไม่เกี่ยวกับ credential
