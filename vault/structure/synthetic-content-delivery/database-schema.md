---
layer: structure
tags: [content-delivery, edgeserve, database, schema]
created: 2026-07-18
links:
  - "[[structure/synthetic-content-delivery/module-cache-coordinator]]"
---

# Database Schema

ตารางหลักที่ [[structure/synthetic-content-delivery/module-cache-coordinator]] ดูแล ได้แก่ `cache_entries` (metadata ของทุก content ที่ cache อยู่), `invalidation_jobs` (คิวและสถานะของ invalidation request), และ `tenant_config` (การตั้งค่า TTL, geo-restriction, และ bandwidth limit ของแต่ละ tenant)

| ตาราง | เจ้าของ | หมายเหตุ |
|---|---|---|
| `cache_entries` | cache-coordinator | อัปเดตทุกครั้งที่มี origin pull สำเร็จ |
| `invalidation_jobs` | invalidation-dispatcher | เก็บสถานะ pending/propagating/done |
| `geo_rules` | geo-router | บังคับ row-level security ต่อ tenant |
| `cert_lifecycle` | certificate-manager | วันหมดอายุและสถานะการต่ออายุ |
| `bandwidth_quotas` | bandwidth-throttler | quota รายเดือนและยอดใช้ปัจจุบัน |

ทุกตารางมี `tenant_id` เป็น partition key เพื่อให้ query ของ tenant หนึ่งไม่กระทบ tenant อื่น และเป็นจุดเดียวที่บังคับ isolation ทางข้อมูลระหว่าง tenant
