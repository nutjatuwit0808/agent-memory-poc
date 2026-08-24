---
layer: structure
tags: [offer, module, core]
created: 2026-01-23
links:
  - "[[structure/synthetic-recruitment-ats/module-background-check-integration]]"
  - "[[business-logic/synthetic-recruitment-ats/offer-approval-signoff-policy]]"
---

# Module: offer-approval-workflow

ควบคุม workflow การอนุมัติและส่ง offer letter ให้ผู้สมัคร ต้องผ่านลำดับผู้อนุมัติที่กำหนดตามระดับตำแหน่งและเงินเดือนก่อนส่งจริงเสมอ แยกออกมาจาก candidate-pipeline-tracker เพราะ approval chain มีเงื่อนไขทางธุรกิจเฉพาะ (เงินเดือนเกินเพดาน, ตำแหน่งผู้บริหาร) ที่ไม่เกี่ยวกับการติดตาม pipeline ทั่วไป

## ฟังก์ชันหลัก
- `initiateOffer(candidateId: string, requisitionId: string, terms: OfferTerms): Promise<string>` — เริ่ม offer workflow ใหม่ กำหนด approval chain ตามเงื่อนไข
- `recordApproval(offerId: string, approverId: string, decision: "approved" | "rejected"): Promise<void>` — บันทึกผลการอนุมัติของแต่ละคนใน chain
- `sendOfferLetter(offerId: string): Promise<void>` — ส่ง offer letter จริงให้ผู้สมัคร — เรียกได้ก็ต่อเมื่อ approval chain ครบเท่านั้น

## State

drafted → pending_approval → approved → sent → accepted | declined | expired

## ความสัมพันธ์กับ module อื่น

subscribe `background_check.completed` จาก [[structure/synthetic-recruitment-ats/module-background-check-integration]] เพื่อปลดล็อกขั้นตอนถัดไปหลัง offer ถูกตอบรับ ดู [[business-logic/synthetic-recruitment-ats/offer-approval-signoff-policy]] สำหรับกติกาว่าใครต้องเซ็นก่อนส่งได้จริง
