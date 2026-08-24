---
layer: business-logic
tags: [delegate, policy]
created: 2025-12-18
links:
  - "[[business-logic/synthetic-document-signing/signer-identity-verification-policy]]"
---

# นโยบายการมอบสิทธิ์เซ็นแทน (Delegate Signing)

signer ที่ไม่สะดวกเซ็นเองสามารถ delegate สิทธิ์ให้คนอื่นเซ็นแทนได้ในบาง template ที่เปิดใช้ feature นี้ไว้เท่านั้น ไม่ใช่ทุก envelope เปิดให้ delegate ได้โดยอัตโนมัติ

คน delegate ต้องยืนยันตัวตนแยกจากคนเดิมเสมอตาม [[business-logic/synthetic-document-signing/signer-identity-verification-policy]] และ audit trail ต้องบันทึกทั้งชื่อผู้มอบสิทธิ์เดิมและผู้เซ็นจริงคู่กันเสมอ ไม่ใช่แค่บันทึกผู้เซ็นจริงเพียงอย่างเดียว
