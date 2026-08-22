import { test } from "node:test";
import assert from "node:assert/strict";
import { classify, fuseRRF, CLASSIFICATION_RULES } from "./router.js";
import type { SearchQuery, SearchResult, MemoryNote } from "../core/types.js";

function q(text: string): SearchQuery {
  return { text };
}

test("identifier-like: quoted phrase -> ripgrep", () => {
  assert.equal(classify(q('"REFUND_ALREADY_PROCESSED"')).backend, "ripgrep");
});

test("identifier-like: SCREAMING_SNAKE_CASE -> ripgrep", () => {
  assert.equal(classify(q("PAYMENT_GATEWAY_TIMEOUT_MS")).backend, "ripgrep");
});

test("identifier-like: dotted/underscored token -> ripgrep", () => {
  assert.equal(classify(q("processRefund")).backend, "fts5"); // camelCase เดี่ยวไม่มี _/-/. ไม่เข้ากฎ identifier
  assert.equal(classify(q("module-payment.ts")).backend, "ripgrep");
});

test("short-keyword: 1-3 คำธรรมดา -> fts5", () => {
  assert.equal(classify(q("refund policy")).backend, "fts5");
  assert.equal(classify(q("timeout")).backend, "fts5");
});

test("long-semantic: >=4 คำ/ประโยคคำถาม -> vector", () => {
  assert.equal(classify(q("ลูกค้าขอคืนเงินแล้วระบบค้าง")).backend, "vector");
  assert.equal(classify(q("อยากไม่เอาของแล้วหลังจ่ายเงินไปแล้ว ทำยังไงได้บ้าง")).backend, "vector");
});

test("ทุกกฎมี reason ที่อ้างอิงตัวเลข (ไม่ใช่ string ว่าง)", () => {
  for (const rule of CLASSIFICATION_RULES) {
    assert.ok(rule.reason.length > 20, `กฎ "${rule.id}" ต้องมีเหตุผลอธิบายละเอียดพอ`);
  }
});

test("classify คืนผลเดิมเสมอสำหรับ query เดิม (deterministic)", () => {
  const query = q("refund timeout policy สอง");
  const r1 = classify(query);
  const r2 = classify(query);
  assert.equal(r1.id, r2.id);
});

function makeNote(id: string): MemoryNote {
  return { id, content: "", layer: "business-logic", tags: ["x"], createdAt: "2026-01-01T00:00:00.000Z", links: [] };
}

function makeResult(id: string, score: number, matchedBy: SearchResult["matchedBy"]): SearchResult {
  return { note: makeNote(id), score, matchedBy };
}

test("fuseRRF: item ที่ติดอันดับ 1 ในทุก backend ต้องได้คะแนนสูงสุด", () => {
  const setA = { backend: "a", results: [makeResult("note-1", 10, "keyword"), makeResult("note-2", 5, "keyword")] };
  const setB = { backend: "b", results: [makeResult("note-1", 0.9, "vector"), makeResult("note-3", 0.5, "vector")] };
  const fused = fuseRRF([setA, setB]);
  assert.equal(fused[0]!.note.id, "note-1");
});

test("fuseRRF: คำนวณตามสูตร k=60 ได้ตรงเป๊ะสำหรับ 1 backend", () => {
  const setA = { backend: "a", results: [makeResult("note-1", 10, "keyword"), makeResult("note-2", 5, "keyword")] };
  const fused = fuseRRF([setA]);
  // rank 1 -> 1/(60+1) = 0.016393...
  assert.ok(Math.abs(fused[0]!.score - 1 / 61) < 1e-9);
  // rank 2 -> 1/(60+2) = 0.016129...
  assert.ok(Math.abs(fused[1]!.score - 1 / 62) < 1e-9);
});

test("fuseRRF: item ที่ไม่เจอใน backend หนึ่งเลย ยังคงอยู่ในผลลัพธ์รวม", () => {
  const setA = { backend: "a", results: [makeResult("only-in-a", 10, "keyword")] };
  const setB = { backend: "b", results: [makeResult("only-in-b", 0.9, "vector")] };
  const fused = fuseRRF([setA, setB]);
  const ids = fused.map((r) => r.note.id);
  assert.ok(ids.includes("only-in-a"));
  assert.ok(ids.includes("only-in-b"));
});

test("fuseRRF: limit ตัดผลลัพธ์หลัง sort แล้ว", () => {
  const setA = {
    backend: "a",
    results: [makeResult("n1", 1, "keyword"), makeResult("n2", 1, "keyword"), makeResult("n3", 1, "keyword")],
  };
  const fused = fuseRRF([setA], 2);
  assert.equal(fused.length, 2);
});
