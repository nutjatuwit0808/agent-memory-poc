---
layer: structure
tags: [inspection, module]
created: 2026-06-22
links:
  - "[[structure/synthetic-fleet-maintenance/module-downtime-tracker]]"
  - "[[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]]"
  - "[[business-logic/synthetic-fleet-maintenance/inspection-checklist-version-policy]]"
  - "[[structure/synthetic-fleet-maintenance/module-work-order-manager]]"
---

# Module: inspection-recorder

บันทึกผลการตรวจสภาพยานพาหนะก่อนออกและหลังกลับอู่ ตรวจสอบว่า checklist ที่ใช้ตรงกับ vehicle type และเวอร์ชันล่าสุดก่อนบันทึก ผลการตรวจเป็นข้อมูลอินพุตให้ [[structure/synthetic-fleet-maintenance/module-downtime-tracker]] และ [[structure/synthetic-fleet-maintenance/module-maintenance-scheduler]] ดู

## ฟังก์ชันหลัก
- `recordInspection(vehicleId: string, inspectorId: string, checklistVersion: string, items: ChecklistItem[]): Promise<InspectionId>` — บันทึกผลตรวจครบ checklist ตรวจ vehicle_id และ checklist version ก่อนบันทึก
- `getActiveChecklistVersion(vehicleType: string): string` — คืน checklist version ล่าสุดที่ active สำหรับ vehicle type นั้น ดู [[business-logic/synthetic-fleet-maintenance/inspection-checklist-version-policy]]
- `getInspectionHistory(vehicleId: string, fromDate: string): Promise<Inspection[]>` — ดูประวัติการตรวจของรถคันนั้นย้อนหลัง
- `flagFailedItem(inspectionId: string, itemId: string, severity: FailSeverity): Promise<void>` — flag รายการตรวจที่ไม่ผ่าน พร้อมระดับความรุนแรง

## ความสัมพันธ์กับ module อื่น

inspection ที่มี item ล้มเหลวระดับ `critical` จะ trigger สร้าง work order อัตโนมัติผ่าน [[structure/synthetic-fleet-maintenance/module-work-order-manager]] โดย inspection-recorder ไม่รู้ว่า work order ถูกสร้างหรือยัง — แค่ publish event `inspection.critical_item_failed` แล้วให้ work-order-manager จัดการ
