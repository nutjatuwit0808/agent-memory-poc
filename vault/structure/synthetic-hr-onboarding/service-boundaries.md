---
layer: structure
tags: [hr-onboarding, onboardflow, boundaries]
created: 2026-04-16
links:
  - "[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]]"
  - "[[structure/synthetic-hr-onboarding/module-document-collection]]"
  - "[[structure/synthetic-hr-onboarding/module-access-provisioning]]"
  - "[[structure/synthetic-hr-onboarding/module-compliance-tracker]]"
  - "[[structure/synthetic-hr-onboarding/queue-architecture]]"
---

# Service Boundaries

[[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] เป็นตัวประสานงานกลาง (orchestrator) เท่านั้น — ไม่เก็บรายละเอียดของ task, เอกสาร, หรือสิทธิ์การเข้าถึงเองเลย แค่รู้ว่า case ของพนักงานคนหนึ่งอยู่ stage ไหน แล้วรอ event จาก service ย่อยเพื่อขยับ stage ต่อ

[[structure/synthetic-hr-onboarding/module-document-collection]], [[structure/synthetic-hr-onboarding/module-access-provisioning]], [[structure/synthetic-hr-onboarding/module-compliance-tracker]] ต่างเป็นเจ้าของ database ของตัวเอง ไม่มี service ไหน query ข้าม database ของอีกฝั่งโดยตรง ทุกการสื่อสารข้าม service ผ่าน event เท่านั้น (ดู [[structure/synthetic-hr-onboarding/queue-architecture]]) — หลักการนี้ตั้งใจให้ต่างจาก [[structure/synthetic-hr-onboarding/module-onboarding-workflow-engine]] ที่ยอมให้เป็น subscriber ของทุก event เพื่อขยับ state ได้
