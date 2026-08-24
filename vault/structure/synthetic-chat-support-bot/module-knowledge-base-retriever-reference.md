---
layer: structure
tags: [knowledge-base, module, core, reference, identifiers]
created: 2025-12-08
links:
  - "[[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]]"
  - "[[business-logic/synthetic-chat-support-bot/knowledge-base-sync-policy]]"
---

# knowledge-base-retriever — Function & Identifier Reference

เอกสารอ้างอิงชื่อฟังก์ชัน/ตัวแปรที่ใช้จริงในโค้ด knowledge-base-retriever สำหรับคนที่ grep หา identifier ตรงๆ (ต่อจาก [[structure/synthetic-chat-support-bot/module-knowledge-base-retriever]])

## Public functions
- `retrieveArticles(intentLabel: string, queryText: string, topK: number): Promise<KbArticle[]>` — ค้นบทความที่เกี่ยวข้องที่สุด topK รายการ
- `syncArticleIndex(orgId: string): Promise<SyncResult>` — sync index บทความใหม่จากระบบจัดการเนื้อหาต้นทาง
- `flagStaleArticle(articleId: string, reason: string): Promise<void>` — ตีธงบทความที่สงสัยว่าล้าสมัยเพื่อให้ทีมเนื้อหาตรวจสอบ

## Internal constants
- `RETRIEVAL_TOP_K_DEFAULT = 3`
- `ARTICLE_INDEX_SYNC_INTERVAL_MIN = 60`

## Type

```ts
interface KbArticle {
  articleId: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  lastSyncedAt: string;
}
```

เอกสารนี้เป็น reference ล้วนๆ ดู business rule เรื่องการ sync index ที่ [[business-logic/synthetic-chat-support-bot/knowledge-base-sync-policy]]
