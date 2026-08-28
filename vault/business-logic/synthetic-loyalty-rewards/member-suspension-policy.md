---
layer: business-logic
tags: [member, suspension, abuse, policy]
created: 2026-04-10
---

# นโยบายการ Suspend บัญชีสมาชิก

บัญชีที่พบพฤติกรรมผิดปกติ เช่น redemption rate สูงผิดสัดส่วนกับ earning pattern หรือมีหลายบัญชีใช้ข้อมูลร่วมกัน จะถูก flag ให้ทีม fraud review ก่อนระงับ ไม่ระงับอัตโนมัติทันทีเพราะ false positive กระทบสมาชิกจริง

ระหว่างรอ review บัญชีที่ถูก flag จะถูก lock เฉพาะ redemption เท่านั้น earning ยังทำงานปกติเพื่อไม่ให้กระทบกรณีที่สุดท้ายพบว่าไม่ใช่ fraud
