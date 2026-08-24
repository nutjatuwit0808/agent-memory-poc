---
layer: business-logic
tags: [drm, policy]
created: 2026-03-26
links:
  - "[[structure/synthetic-video-streaming/module-drm-license-server]]"
  - "[[business-logic/synthetic-video-streaming/drm-license-issuance-policy-edge-cases]]"
---

# นโยบายการออก DRM License

[[structure/synthetic-video-streaming/module-drm-license-server]] จะออก license ให้เมื่อ device certificate ผ่านการตรวจสอบและจำนวน concurrent stream ของ account ยังไม่เกิน `LICENSE_MAX_CONCURRENT_STREAMS` เท่านั้น ไม่มีข้อยกเว้นสำหรับ account ระดับใดที่ข้ามการตรวจ certificate ได้

license มีอายุ `LICENSE_TTL_SEC` (6 ชั่วโมง) หลังหมดอายุผู้เล่นต้องขอ license ใหม่โดยอัตโนมัติระหว่างเล่นต่อเนื่อง ผู้ชมจะไม่รู้สึกถึงการต่ออายุนี้ถ้าเครือข่ายปกติ

กรณีข้อยกเว้นและเงื่อนไขพิเศษแยกไว้ที่ [[business-logic/synthetic-video-streaming/drm-license-issuance-policy-edge-cases]] เพื่อไม่ให้ policy หลักอ่านยากเกินไป
