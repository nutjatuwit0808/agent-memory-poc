"use client";

import type { ColumnState } from "@/lib/api";

function fmt(n: number, digits = 2): string {
  // bm25 ของ FTS5 มีค่าเล็กมาก (ระดับ 1e-6) — ถ้า toFixed(2) จะกลายเป็น 0.00 ทุกตัว
  // จนดูเหมือนคะแนนเท่ากันหมด ต้องสลับไป exponential เมื่อเล็กเกินกว่าจะอ่านรู้เรื่อง
  if (n !== 0 && Math.abs(n) < 0.001) return n.toExponential(2);
  return n.toFixed(digits);
}

interface Props {
  name: string;
  state: ColumnState;
  /** noteId -> จำนวน backend ที่คืน note นี้ (ใช้ระบายสีผลที่ไม่ซ้ำใคร) */
  occurrences: Map<string, number>;
  totalBackends: number;
}

export function BackendColumn({ name, state, occurrences, totalBackends }: Props) {
  const { data } = state;
  const gt = data?.groundTruth;

  return (
    <section className="col">
      <header className="col-head">
        <div className="col-name">
          <span>{name}</span>
          {gt && (
            <span className={`recall-badge ${gt.recallAt5 >= 0.5 ? "recall-good" : "recall-bad"}`}>
              recall@5 {gt.recallAt5.toFixed(2)}
            </span>
          )}
        </div>

        {data && (
          <div className="metrics">
            <span className="metric engine">
              engine <b>{fmt(data.engineMs)}ms</b>
            </span>
            <span className="metric">
              round-trip <b>{state.roundTripMs ? fmt(state.roundTripMs, 1) : "–"}ms</b>
            </span>
            {data.timing && (
              <span className="metric">
                embed <b>{fmt(data.timing.embedQueryMs)}ms</b> + search <b>{fmt(data.timing.searchMs)}ms</b>
              </span>
            )}
          </div>
        )}

        {data?.routedBy && data.routedBy !== "fuse-all" && (
          <div className="routed">
            เลือกโดยกฎ <code>{data.routedBy}</code>
            {data.routingReason && <span className="why">{data.routingReason}</span>}
          </div>
        )}
        {data?.routedBy === "fuse-all" && (
          <div className="routed">
            ยิงทุก backend แล้วรวมด้วย <code>RRF (k=60)</code>
            <span className="why">ดูที่มาของคะแนนได้ที่ตารางด้านล่าง</span>
          </div>
        )}
      </header>

      {state.status === "loading" && <p className="loading">กำลังค้นหา…</p>}
      {state.status === "error" && <p className="err">{state.error}</p>}
      {state.status === "done" && data && data.results.length === 0 && <p className="empty">ไม่พบผลลัพธ์</p>}

      {data && data.results.length > 0 && (
        <ol className="results">
          {data.results.slice(0, 5).map((r, i) => {
            const isUnique = (occurrences.get(r.id) ?? 0) === 1 && totalBackends > 1;
            const isHit = gt?.relevant.includes(r.id) ?? false;
            return (
              <li key={r.id} className={`result${isUnique ? " unique" : ""}`}>
                <span className="rank">{i + 1}</span>
                <div className="rbody">
                  <div className="rid">
                    {isHit && <span className="hit-mark">✓</span>}
                    {r.id}
                  </div>
                  <div className="rmeta">
                    score {fmt(r.score, 4)} · {r.matchedBy} · {r.layer}
                  </div>
                  <div className="rexcerpt">{r.excerpt}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
