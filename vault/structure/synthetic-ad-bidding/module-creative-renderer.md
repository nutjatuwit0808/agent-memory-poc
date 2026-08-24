---
layer: structure
tags: [creative, module]
created: 2026-03-02
links:
  - "[[structure/synthetic-ad-bidding/module-bid-request-handler]]"
  - "[[business-logic/synthetic-ad-bidding/creative-approval-policy]]"
---

# Module: creative-renderer

เตรียม creative (รูป/วิดีโอ/HTML5 banner) ให้พร้อมแสดงผลก่อนส่ง bid response กลับ SSP รวมถึงเลือก creative variant ที่เหมาะกับขนาด placement และตรวจสอบว่า creative ผ่านการอนุมัติแล้ว แยกเป็น service อิสระเพราะ logic การ render/เลือก variant เปลี่ยนบ่อยตาม format โฆษณาใหม่ๆ ที่เพิ่มเข้ามาเรื่อยๆ

## ฟังก์ชันหลัก
- `selectCreativeVariant(campaignId: string, placementSpec: PlacementSpec): Promise<Creative | null>` — เลือก creative variant ที่ตรงกับขนาด/รูปแบบ placement มากที่สุด
- `renderMarkup(creative: Creative, ctx: RenderContext): string` — สร้าง markup สุดท้ายที่จะฝังใน bid response
- `validateCreativeApproval(creativeId: string): Promise<boolean>` — เช็คว่า creative ผ่านการอนุมัติแล้วหรือยัง

## ความสัมพันธ์กับ module อื่น

ถ้าไม่มี creative variant ที่ตรงกับ placement spec เลย จะคืน `null` กลับไปให้ [[structure/synthetic-ad-bidding/module-bid-request-handler]] ตัดสินใจส่ง no-bid แทน — creative-renderer ไม่ตัดสินใจเรื่อง no-bid เอง เพื่อรักษาหลัก separation of concerns เกณฑ์การอนุมัติ creative ดู [[business-logic/synthetic-ad-bidding/creative-approval-policy]]
