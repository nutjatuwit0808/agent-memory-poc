---
layer: structure
tags: [orchestration, module, core, reference, identifiers]
created: 2025-09-18
links:
  - "[[structure/synthetic-analytics-pipeline/module-job-orchestrator]]"
  - "[[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]]"
---

# job-orchestrator — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด job-orchestrator สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-analytics-pipeline/module-job-orchestrator]])

## Public functions
- `scheduleDag(dagId: string, trigger: "cron" | "manual" | "upstream"): Promise<string>` — เริ่มรัน DAG ใหม่ คืน runId
- `evaluateReadiness(jobId: string): Promise<boolean>` — ตรวจว่า job นี้พร้อมรันหรือยังจาก dependency ทั้งหมดที่ต้องเสร็จก่อน
- `markJobFailed(jobId: string, reason: string): Promise<void>` — mark job ล้มเหลว และตัดสินใจว่า job ที่ depend อยู่ต้องหยุดตามหรือไม่

## Internal constants
- `DAG_MAX_CONCURRENT_JOBS = 20`
- `JOB_STUCK_THRESHOLD_MIN = 45`

## Type

```ts
interface JobRun {
  jobId: string;
  dagRunId: string;
  status: "queued" | "ready" | "running" | "succeeded" | "failed" | "skipped";
  dependsOn: string[];
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่อง deadlock ที่ [[business-logic/synthetic-analytics-pipeline/dag-deadlock-policy]]
