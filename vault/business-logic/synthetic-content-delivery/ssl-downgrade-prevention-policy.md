---
layer: business-logic
tags: [ssl, security, policy]
created: 2025-10-23
---

# นโยบายป้องกัน SSL/TLS Downgrade

Edge node ทุกจุดของ EdgeServe ปฏิเสธ TLS เวอร์ชันต่ำกว่า 1.2 โดยเด็ดขาด และ default เป็น TLS 1.3 สำหรับ client ที่รองรับ — ไม่อนุญาตให้ tenant ลด minimum TLS version ต่ำกว่า 1.2 แม้จะร้องขอก็ตาม เพราะ TLS 1.0 และ 1.1 มีช่องโหว่ที่ทราบกันดีและ PCI DSS ห้ามใช้แล้ว

HSTS header ถูก inject อัตโนมัติสำหรับทุก response ที่ผ่าน HTTPS เพื่อป้องกัน downgrade attack — tenant ที่ต้องการ max-age ที่ยาวกว่า default (1 ปี) สามารถตั้งค่าได้ แต่ไม่สามารถตั้งให้สั้นกว่า 1 ชั่วโมง
