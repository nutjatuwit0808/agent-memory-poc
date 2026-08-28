---
layer: business-logic
tags: [quality, rejection, edge-case]
created: 2026-08-09
links:
  - "[[business-logic/synthetic-supply-chain/quality-rejection-policy]]"
---

# ข้อยกเว้นการ Rejection: สินค้าวิกฤตที่ไม่มีทางเลือก

ถ้าสินค้าที่ถูก reject เป็น critical material ที่ขาดไม่ได้สำหรับ production line ที่กำลังจะหยุด ทีมวิศวกรรมสามารถขอ concession (waiver) เพื่อรับสินค้านั้นไว้ใช้งานชั่วคราวได้ โดยต้องระบุว่า lot ไหนที่ได้รับ waiver และใช้สำหรับผลิตภัณฑ์อะไร

สินค้าที่ได้รับ waiver ยังคงถูกบันทึกว่า reject ในระบบ (ไม่เปลี่ยน status เป็น accept) แต่จะมี flag `concession_granted` ด้วย ซัพพลายเออร์ยังต้องรับผิดชอบ penalty ตามปกติ เพราะ waiver เป็นเรื่องของ operational necessity ไม่ใช่การยกเว้นความรับผิดชอบ

เอกสารนี้เป็นส่วนขยายของ [[business-logic/synthetic-supply-chain/quality-rejection-policy]] ("นโยบายการปฏิเสธสินค้าที่ไม่ผ่านคุณภาพ") อ่านคู่กันเสมอ ไม่ใช่นโยบายแยกต่างหาก
