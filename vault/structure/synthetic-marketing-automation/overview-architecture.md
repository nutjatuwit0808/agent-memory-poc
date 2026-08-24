---
layer: structure
tags: [marketing-automation, wavecast, architecture, overview]
created: 2026-01-24
links:
  - "[[structure/synthetic-marketing-automation/module-campaign-builder]]"
  - "[[structure/synthetic-marketing-automation/module-segment-engine]]"
  - "[[structure/synthetic-marketing-automation/module-send-scheduler]]"
  - "[[structure/synthetic-marketing-automation/module-deliverability-monitor]]"
  - "[[structure/synthetic-marketing-automation/module-template-renderer]]"
  - "[[structure/synthetic-marketing-automation/module-consent-manager]]"
---

# ภาพรวมสถาปัตยกรรม Wavecast — ระบบ Email/Campaign Marketing Automation

Wavecast คือแพลตฟอร์มภายในสำหรับสร้าง จัดตาราง และส่ง email campaign ให้ลูกค้าปลายทางของบริษัท ครอบคลุมตั้งแต่การแบ่งกลุ่มผู้รับ (segmentation), การจัดคิวส่ง, การเฝ้าระวังอัตราส่งถึงกล่องจดหมาย (deliverability), ไปจนถึงการจัดการ consent และ unsubscribe ให้สอดคล้องกับกฎหมายคุ้มครองข้อมูลส่วนบุคคลแบบ GDPR

ระบบต้องรักษาสมดุลระหว่างความเร็วในการส่ง (ทีม marketing อยากส่งให้เร็วที่สุด) กับความเสี่ยงด้าน deliverability และ compliance (ส่งเร็วเกินไปหรือส่งผิดกลุ่มทำให้โดน ESP (Email Service Provider) ขึ้น blacklist หรือละเมิดสิทธิ์ opt-out ของผู้รับ) ทีมวิศวกรรมเรียกช่วงเวลาที่มี campaign ใหญ่หลายตัวคิวพร้อมกันว่า send window contention

## Module หลัก

- **campaign-builder** — จุดสร้างและแก้ไข campaign ทั้งหมด ผูก template, segment เป้าหมาย, และตารางเวลาส่ ดู [[structure/synthetic-marketing-automation/module-campaign-builder]]
- **segment-engine** — คำนวณสมาชิกของแต่ละ audience segment ตามเงื่อนไขที่ทีม marketing ตั้งไว้ (เช่น " ดู [[structure/synthetic-marketing-automation/module-segment-engine]]
- **send-scheduler** — จัดคิวและส่ง campaign จริงตามเวลาที่กำหนด แบ่งผู้รับเป็น batch ย่อยเพื่อควบคุมอั ดู [[structure/synthetic-marketing-automation/module-send-scheduler]]
- **deliverability-monitor** — เฝ้าระวังอัตรา bounce, complaint, และสถานะ blacklist ของ sending domain แบบ real ดู [[structure/synthetic-marketing-automation/module-deliverability-monitor]]
- **template-renderer** — แปลง template (HTML + variable placeholder เช่น `{{firstName}}`) เป็นเนื้อหาจริง ดู [[structure/synthetic-marketing-automation/module-template-renderer]]
- **consent-manager** — เจ้าของสถานะ opt-in/opt-out ของผู้รับทุกคนในทุก channel (email, SMS) เป็นระบบที่ ดู [[structure/synthetic-marketing-automation/module-consent-manager]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-marketing-automation/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-marketing-automation/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-marketing-automation/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-marketing-automation/database-schema]]
