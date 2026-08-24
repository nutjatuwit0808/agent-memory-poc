---
layer: structure
tags: [hr-onboarding, onboardflow, architecture, overview]
created: 2025-12-07
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[structure/synthetic-hr-onboarding/module-task-assignment]]"
  - "[[structure/synthetic-hr-onboarding/module-document-collection]]"
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
  - "[[structure/synthetic-hr-onboarding/module-buddy-matching]]"
  - "[[structure/synthetic-hr-onboarding/module-compliance-tracker]]"
---

# ภาพรวมสถาปัตยกรรม OnboardFlow — ระบบจัดการ Onboarding พนักงานใหม่

OnboardFlow คือแพลตฟอร์มกลางที่ประสานงาน onboarding พนักงานใหม่ตั้งแต่วันที่ตอบรับ offer จนถึงวันแรกที่เข้างานจริง ระบบไม่ได้เป็นเจ้าของข้อมูลพนักงานหลัก (นั้นเป็นหน้าที่ของ HRIS เดิมของบริษัท) แต่ทำหน้าที่ orchestrate checklist, เอกสาร, สิทธิ์การเข้าถึง, buddy และ compliance deadline ให้ทุกอย่างเสร็จทันวันเริ่มงาน

ระบบต้องคุยกับ vendor ภายนอกหลายเจ้าพร้อมกัน — บริการตรวจประวัติ (background check), บริการ e-signature สำหรับเอกสาร, ระบบ ticketing ของทีม IT สำหรับสิทธิ์อุปกรณ์/software, ระบบ badge เข้าอาคาร, และ LMS สำหรับ training บังคับ ทีมวิศวกรรมเรียกช่วงต้นเดือนและกลางเดือนว่า cohort window เพราะบริษัทกำหนดวันเริ่มงานพนักงานใหม่เป็นรอบ (batch start date) ไม่ใช่วันไหนก็ได้

## Module หลัก

- **onboarding-workflow-engine** — state machine หลักที่ track ว่าพนักงานใหม่แต่ละคนอยู่ขั้นตอนไหนของ onboarding ตั ดู [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]
- **task-assignment** — สร้างและมอบหมาย checklist task ตาม role/department ของพนักงานใหม่ (เช่น "กรอกแบบฟอร์มภาษี", "อบรมความปลอดภัยข้อมูล") ให้ทั้งตัวพนักงานเอง, buddy, ทีม IT, และหัวหน้างาน แยกออกมาจาก onboarding-workflow-engine เพราะ template ของ task ต่าง role ต่าง department ซับซ้อนขึ้นเรื่อยๆ ดู [[structure/synthetic-hr-onboarding/module-task-assignment]]
- **document-collection** — จัดการเอกสารที่ต้องเซ็นก่อนเริ่มงาน (สัญญาจ้าง, แบบฟอร์มภาษี, NDA) ผ่าน e-signat ดู [[structure/synthetic-hr-onboarding/module-document-collection]]
- **access-provisioning** — จัดสิทธิ์ laptop, software license, และ badge เข้าอาคารให้พนักงานใหม่ คุยกับระบบ ดู [[structure/synthetic-hr-onboarding/module-access-provisioning]]
- **buddy-matching** — จับคู่พนักงานใหม่กับ buddy/mentor ที่มีอยู่แล้วในทีมใกล้เคียง พิจารณาจาก departm ดู [[structure/synthetic-hr-onboarding/module-buddy-matching]]
- **compliance-tracker** — ติดตาม deadline ของ training บังคับและ certification ที่พนักงานใหม่ต้องทำให้เสร็ ดู [[structure/synthetic-hr-onboarding/module-compliance-tracker]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-hr-onboarding/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-hr-onboarding/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-hr-onboarding/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-hr-onboarding/database-schema]]
