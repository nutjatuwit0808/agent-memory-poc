---
layer: structure
tags: [energy-management, gridsync, architecture, overview]
created: 2025-12-05
links:
  - "[[structure/synthetic-energy-management/module-meter-collector]]"
  - "[[structure/synthetic-energy-management/module-demand-response-controller]]"
  - "[[structure/synthetic-energy-management/module-equipment-scheduler]]"
  - "[[structure/synthetic-energy-management/module-anomaly-detector]]"
  - "[[structure/synthetic-energy-management/module-carbon-calculator]]"
  - "[[structure/synthetic-energy-management/module-utility-bill-reconciler]]"
---

# ภาพรวมสถาปัตยกรรม GridSync — ระบบบริหารพลังงานองค์กร

GridSync คือระบบบริหารพลังงานสำหรับอาคารสำนักงานและโรงงานขนาดใหญ่ เก็บข้อมูลการใช้ไฟฟ้า/แก๊ส/น้ำแบบ real-time จาก IoT meter หลายพันตัวทั่วอาคาร คำนวณ demand response เพื่อลดการใช้ไฟช่วง peak, จัดตารางเปิด-ปิดอุปกรณ์อัตโนมัติ, และสร้างรายงานคาร์บอนฟุตพรินต์ให้ทีมความยั่งยืนขององค์กร

ทีมวิศวกรรมออกแบบระบบให้ทนต่อข้อมูลจาก meter ที่ขาดหายหรือผิดปกติได้ในระดับหนึ่ง เพราะ IoT device ภาคสนามมีโอกาสหลุดการเชื่อมต่อสูงกว่า service ทั่วไปมาก และการตัดสินใจ demand response ที่ผิดพลาดอาจกระทบการดำเนินงานจริงของโรงงาน ไม่ใช่แค่ตัวเลขในรายงาน

## Module หลัก

- **meter-collector** — เก็บข้อมูลดิบจาก IoT meter ทุกตัวทั่วอาคาร รองรับ meter หลายพันตัวที่ส่งข้อมูลคว ดู [[structure/synthetic-energy-management/module-meter-collector]]
- **demand-response-controller** — ตัดสินใจว่าเมื่อไหร่ต้องลดการใช้ไฟ (load shedding) ตามระดับ demand ปัจจุบันเทียบ ดู [[structure/synthetic-energy-management/module-demand-response-controller]]
- **equipment-scheduler** — จัดตารางเปิด-ปิดอุปกรณ์อัตโนมัติตามเงื่อนไขที่กำหนด (เวลา, demand response, การบ ดู [[structure/synthetic-energy-management/module-equipment-scheduler]]
- **anomaly-detector** — ตรวจจับความผิดปกติของข้อมูลการใช้พลังงานแบบ real-time เช่น การใช้ไฟพุ่งสูงผิดปกต ดู [[structure/synthetic-energy-management/module-anomaly-detector]]
- **carbon-calculator** — คำนวณคาร์บอนฟุตพรินต์จากการใช้พลังงานตาม emission factor ของแหล่งพลังงานแต่ละประ ดู [[structure/synthetic-energy-management/module-carbon-calculator]]
- **utility-bill-reconciler** — เทียบข้อมูลการใช้พลังงานที่ระบบวัดได้กับใบแจ้งหนี้จากการไฟฟ้า/ประปาจริง เพื่อตรว ดู [[structure/synthetic-energy-management/module-utility-bill-reconciler]]

## เอกสารที่เกี่ยวข้อง

รายละเอียดว่า module ไหนเป็นเจ้าของ data อะไรดูที่ [[structure/synthetic-energy-management/service-boundaries]] ผ่าน synchronous call ดูที่ [[structure/synthetic-energy-management/api-gateway]] และ asynchronous event ดูที่ [[structure/synthetic-energy-management/queue-architecture]] โครงสร้างข้อมูลดูที่ [[structure/synthetic-energy-management/database-schema]]
