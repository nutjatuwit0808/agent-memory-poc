---
layer: business-logic
tags: [pipeline, dedup, policy]
created: 2025-09-21
links:
  - "[[business-logic/synthetic-recruitment-ats/duplicate-candidate-merge-policy-edge-cases]]"
---

# นโยบายการรวม Candidate ที่ซ้ำกัน

ระบบตรวจจับผู้สมัครซ้ำโดยเทียบอีเมลและเบอร์โทรเป็นหลัก ถ้าคะแนนความคล้ายเกิน `DUPLICATE_MATCH_THRESHOLD` จะขึ้นเตือนให้ recruiter ยืนยันก่อนที่จะ `mergeDuplicateCandidate` จริง ไม่ merge อัตโนมัติโดยไม่มีคนยืนยัน

การ merge จะรวมประวัติ pipeline ทั้งหมดของทั้งสอง record เข้าเป็น record เดียว โดยเก็บ `stage_transition_log` ของทั้งคู่ไว้ครบ ไม่ลบประวัติฝั่งไหนทิ้ง

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-recruitment-ats/duplicate-candidate-merge-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
