"use client";

import type { FusionContribution } from "@/lib/api";

/**
 * แสดง "ที่มาของคะแนน" ของ router-fuse — ตัวเลขทุกตัวมาจาก server (getLastFusion())
 * ไม่ได้คำนวณซ้ำที่ฝั่ง browser เพื่อไม่ให้เลขที่โชว์เพี้ยนจากเลขที่ router ใช้จริง
 */
export function FusionTable({ fusion }: { fusion: FusionContribution[] }) {
  if (fusion.length === 0) return null;

  return (
    <div className="fusion">
      <h2>ที่มาของคะแนน RRF (router-fuse)</h2>
      <p>
        RRF รวม <b>อันดับ</b> ไม่ใช่คะแนนดิบ เพราะคะแนนแต่ละ backend อยู่คนละสเปซ (bm25 ติดลบ · cosine 0–1 ·
        ripgrep นับจำนวน match) — สูตร <code>score = Σ 1/(60 + rank)</code> คำนวณตามด้วยมือได้จากตารางนี้
      </p>
      <table>
        <thead>
          <tr>
            <th>เอกสาร</th>
            <th>อันดับจากแต่ละ backend</th>
            <th className="num">รวม</th>
          </tr>
        </thead>
        <tbody>
          {fusion.slice(0, 5).map((f) => (
            <tr key={f.noteId}>
              <td className="doc">{f.noteId}</td>
              <td>
                {f.perBackend.map((p, i) => (
                  <span key={p.backend}>
                    {i > 0 && " + "}
                    {p.backend} #{p.rank} → 1/(60+{p.rank})={p.contribution.toFixed(6)}
                  </span>
                ))}
              </td>
              <td className="num total">{f.total.toFixed(5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
