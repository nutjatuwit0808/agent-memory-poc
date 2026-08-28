"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BACKEND_NAMES,
  LAYERS,
  fetchBenchQueries,
  search,
  type BackendName,
  type BenchQuery,
  type ColumnState,
} from "@/lib/api";
import { BackendColumn } from "@/components/BackendColumn";
import { FusionTable } from "@/components/FusionTable";

const DEBOUNCE_MS = 350;

function emptyColumns(): Record<BackendName, ColumnState> {
  return Object.fromEntries(BACKEND_NAMES.map((n) => [n, { status: "idle" }])) as Record<BackendName, ColumnState>;
}

export default function Page() {
  const [text, setText] = useState("");
  const [layer, setLayer] = useState("");
  const [domain, setDomain] = useState("");
  const [tags, setTags] = useState("");
  const [activeQueryId, setActiveQueryId] = useState<string | undefined>(undefined);

  const [columns, setColumns] = useState<Record<BackendName, ColumnState>>(emptyColumns);
  const [presets, setPresets] = useState<BenchQuery[]>([]);
  const [presetError, setPresetError] = useState<string | undefined>(undefined);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchBenchQueries()
      .then(setPresets)
      .catch((err: unknown) =>
        setPresetError(
          `โหลด preset ไม่ได้: ${err instanceof Error ? err.message : String(err)} — เซิร์ฟเวอร์รันอยู่หรือยัง? (npm run serve)`
        )
      );
  }, []);

  const runSearch = useCallback(
    (
      q: string,
      currentLayer: string,
      currentDomain: string,
      currentTags: string,
      queryId: string | undefined
    ) => {
      // ยกเลิก request ชุดก่อนหน้าเสมอ — ripgrep spawn subprocess ทุกครั้ง
      // ถ้าปล่อยให้พิมพ์เร็วๆ แล้ว request กองกันจะกิน CPU ฟรีและผลเก่าอาจมาทับผลใหม่
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setColumns((prev) => {
        const next = { ...prev };
        for (const name of BACKEND_NAMES) next[name] = { ...next[name], status: "loading" };
        return next;
      });

      // ยิงแยก request ต่อ backend แล้วให้แต่ละคอลัมน์อัปเดตทันทีที่ตัวเองเสร็จ
      // — ความ "ไม่พร้อมกัน" ที่เห็นคือบทเรียน (fts5 เสร็จก่อน ripgrep เกือบ 500 เท่า)
      for (const name of BACKEND_NAMES) {
        const params = {
          q,
          ...(currentLayer ? { layer: currentLayer } : {}),
          ...(currentDomain.trim() ? { domain: currentDomain.trim() } : {}),
          ...(currentTags.trim() ? { tags: currentTags.trim() } : {}),
          ...(queryId ? { queryId } : {}),
        };

        search(name, params, controller.signal)
          .then(({ data, roundTripMs }) => {
            setColumns((prev) => ({ ...prev, [name]: { status: "done", data, roundTripMs } }));
          })
          .catch((err: unknown) => {
            if (err instanceof DOMException && err.name === "AbortError") return;
            setColumns((prev) => ({
              ...prev,
              [name]: { status: "error", error: err instanceof Error ? err.message : String(err) },
            }));
          });
      }
    },
    []
  );

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      abortRef.current?.abort();
      setColumns(emptyColumns());
      return;
    }
    const timer = setTimeout(() => runSearch(trimmed, layer, domain, tags, activeQueryId), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, layer, domain, tags, activeQueryId, runSearch]);

  /** นับว่า note แต่ละตัวถูกคืนโดยกี่ backend — ใช้ระบายสีผลที่มีเฉพาะบางตัวเท่านั้น
   *  (เป็นการนับเพื่อ "แสดงผล" ล้วนๆ ไม่ได้แตะการจัดอันดับหรือคะแนนของ backend ใดเลย) */
  const occurrences = useMemo(() => {
    const counts = new Map<string, number>();
    for (const name of BACKEND_NAMES) {
      const results = columns[name].data?.results.slice(0, 5) ?? [];
      for (const r of results) counts.set(r.id, (counts.get(r.id) ?? 0) + 1);
    }
    return counts;
  }, [columns]);

  const fusion = columns["router-fuse"].data?.fusion;
  const activePreset = presets.find((p) => p.id === activeQueryId);

  const groupedPresets = useMemo(() => {
    const kinds: BenchQuery["kind"][] = ["exact", "keyword", "semantic", "filtered"];
    return kinds.map((kind) => ({ kind, items: presets.filter((p) => p.kind === kind) }));
  }, [presets]);

  return (
    <main className="wrap">
      <h1>memory-workshop — เปรียบเทียบ search backend</h1>
      <p className="sub">
        พิมพ์ query เดียว เห็นผลจาก 5 backend พร้อมกัน · engine time วัดฝั่ง server รอบ{" "}
        <code>backend.search()</code> เท่านั้น
      </p>

      <div className="controls">
        <div className="row">
          <input
            id="q"
            type="text"
            placeholder="พิมพ์คำค้น เช่น refund timeout หรือ ลูกค้าขอคืนเงินแล้วระบบค้าง"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setActiveQueryId(undefined); // พิมพ์เองแล้ว ground truth ของ preset ใช้ไม่ได้อีก
            }}
          />
          <label className="field">
            layer
            <select
              value={layer}
              onChange={(e) => {
                setLayer(e.target.value);
                setActiveQueryId(undefined);
              }}
            >
              <option value="">(ทั้งหมด)</option>
              {LAYERS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <input
            className="tags-input"
            type="text"
            placeholder='domain เช่น "core" = PayFlow เว้นว่าง = ทุก domain'
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setActiveQueryId(undefined);
            }}
          />
          <input
            className="tags-input"
            type="text"
            placeholder="tags (คั่นด้วย , = AND)"
            value={tags}
            onChange={(e) => {
              setTags(e.target.value);
              setActiveQueryId(undefined);
            }}
          />
        </div>

        <div className="presets">
          {presetError && <p className="err">{presetError}</p>}
          {groupedPresets.map(({ kind, items }) => (
            <div className="preset-group" key={kind}>
              <span className={`kind-tag kind-${kind}`}>{kind}</span>
              {items.map((p) => (
                <button
                  key={p.id}
                  className={`preset${p.id === activeQueryId ? " active" : ""}`}
                  onClick={() => {
                    setText(p.text);
                    setLayer(p.layer ?? "");
                    setDomain("");
                    setTags("");
                    setActiveQueryId(p.id);
                  }}
                  title={p.text}
                >
                  {p.text.length > 34 ? `${p.text.slice(0, 34)}…` : p.text}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="legend">
        <span>
          <span className="swatch" style={{ background: "var(--unique)" }} />
          <b>แถบเหลือง</b> = มีเฉพาะ backend นี้เท่านั้น (ตัวอื่นหาไม่เจอ)
        </span>
        <span>
          <b style={{ color: "var(--hit)" }}>✓</b> = ตรงกับ ground truth (เฉพาะตอนกด preset)
        </span>
        <span>
          <b>engine</b> = เวลาที่ backend ใช้จริง · <b>round-trip</b> = รวม HTTP + JSON ซึ่งกลบความต่างจนหมด
        </span>
      </div>

      {activePreset && (
        <div className="legend">
          <span>
            preset <code>{activePreset.id}</code> · เฉลยคือ{" "}
            <b>{activePreset.relevant.join(", ")}</b>
          </span>
        </div>
      )}

      <div className="columns">
        {BACKEND_NAMES.map((name) => (
          <BackendColumn
            key={name}
            name={name}
            state={columns[name]}
            occurrences={occurrences}
            totalBackends={BACKEND_NAMES.length}
          />
        ))}
      </div>

      {fusion && <FusionTable fusion={fusion} />}
    </main>
  );
}
