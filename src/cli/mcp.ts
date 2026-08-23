/**
 * MCP server เขียนเอง (D-14) — ไม่ใช้ @modelcontextprotocol/sdk เพื่อให้เห็นกลไก JSON-RPC
 * ตรงๆ (เหมือนที่เลือก node:http แทน framework ใน WS05) surface ที่ต้องรองรับมีแค่ 4 อย่าง:
 * initialize, notifications/initialized, tools/list, tools/call
 *
 * รองรับทั้ง stdio (Cursor spawn เป็น subprocess) และ HTTP (เปิดค้างไว้ ไม่ต้อง cold-start
 * ซ้ำทุกครั้ง) — W10-3 วัดสองแบบนี้เทียบกันจริง ไม่ใช่เชื่อตามทฤษฎีเฉยๆ
 *
 * W10-1 (spike, ตัดสิน D-14): ต่อ Cursor ติดตั้งแต่รอบแรกด้วย tool `ping` เดียว — ไม่ต้อง
 * สลับไป SDK ดู CHECKLIST.md
 *
 * W10-2: expose search_memory / get_memory (read-only ตาม D-12) — ห้ามแก้ serve.ts หรือ
 * backend เดิมเลย ไฟล์นี้แค่ import มาใช้
 */
import { createServer } from "node:http";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LAYERS } from "../core/frontmatter.js";
import { readVault } from "../core/vault-reader.js";
import type { Layer, MemoryNote, SearchQuery } from "../core/types.js";
import type { SearchBackend } from "../search/backend.interface.js";
import { backends as registeredBackends } from "../search/backends/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = join(__dirname, "..", "..", "vault");

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "memory-workshop-mcp", version: "0.2.0" };
const DEFAULT_LIMIT = 10;

// WS04 วัดแล้วว่า route ให้ recall 0.87 ที่ latency เกือบต่ำสุด — คนใช้งานจริงไม่ควรต้องเลือก
// backend เอง (ดู workshops/04-hybrid-router/README.md) แต่ยังเลือกตัวอื่นได้ผ่านพารามิเตอร์
// `backend` เพื่อใช้ตอน benchmark (W10-3)
const DEFAULT_BACKEND = "router-route";

const backendsByName = new Map<string, SearchBackend>(registeredBackends.map((b) => [b.name, b]));

/** error ที่ข้อความอ่านรู้เรื่องฝั่ง agent ได้ตรงๆ (W10-2 DoD) — ไม่ใช่ stack trace ดิบ */
class ToolError extends Error {}

let notesById = new Map<string, MemoryNote>();
let warmUpPromise: Promise<void> | null = null;

function isLayer(value: string): value is Layer {
  return (LAYERS as readonly string[]).includes(value);
}

function extractTitle(content: string): string {
  const line = content.split("\n").find((l) => /^#\s+/.test(l));
  return line ? line.replace(/^#\s+/, "").trim() : "";
}

function buildExcerpt(content: string, maxChars = 180): string {
  const body = content
    .split("\n")
    .filter((l) => !/^#\s+/.test(l) && l.trim().length > 0)
    .join(" ")
    .trim();
  return body.length > maxChars ? `${body.slice(0, maxChars)}…` : body;
}

/**
 * Warm-up ก่อนตอบ request แรก — เหตุผลเดียวกับ serve.ts: single-query embed ครั้งแรก
 * หลัง index() ใช้เวลา ~1,250ms เพราะ ONNX compile execution graph ใหม่ ถ้าไม่ warm
 * request แรกจาก Cursor จะช้าผิดปกติจนดูเหมือน MCP พัง
 */
async function warmUp(): Promise<void> {
  const notes = await readVault(VAULT_DIR);
  notesById = new Map(notes.map((n) => [n.id, n]));

  for (const backend of registeredBackends) {
    await backend.index(notes);
  }
  for (const backend of registeredBackends) {
    await backend.search({ text: "warm up คืนเงิน refund", limit: 5 });
  }
  process.stderr.write(`[mcp] warm-up เสร็จ: ${notes.length} notes, ${registeredBackends.length} backends\n`);
}

/** เรียกซ้ำได้ปลอดภัย — request แรกๆ ที่มาพร้อมกันจะรอ promise เดียวกัน ไม่ warm ซ้ำ */
async function ensureReady(): Promise<void> {
  if (!warmUpPromise) warmUpPromise = warmUp();
  await warmUpPromise;
}

async function searchMemory(args: Record<string, unknown>): Promise<string> {
  await ensureReady();

  const queryText = typeof args.query === "string" ? args.query.trim() : "";
  if (queryText.length === 0) throw new ToolError('ต้องระบุ "query" ที่ไม่ว่าง');

  const backendName = typeof args.backend === "string" && args.backend.length > 0 ? args.backend : DEFAULT_BACKEND;
  const backend = backendsByName.get(backendName);
  if (!backend) {
    throw new ToolError(`ไม่พบ backend "${backendName}" — ที่มีอยู่: ${[...backendsByName.keys()].join(", ")}`);
  }

  const query: SearchQuery = { text: queryText, limit: DEFAULT_LIMIT };

  if (typeof args.limit === "number" && Number.isFinite(args.limit) && args.limit > 0) {
    query.limit = Math.floor(args.limit);
  }

  if (typeof args.layer === "string" && args.layer.length > 0) {
    if (!isLayer(args.layer)) {
      throw new ToolError(`layer ไม่ถูกต้อง: "${args.layer}" (ต้องเป็นหนึ่งใน ${LAYERS.join(", ")})`);
    }
    query.layer = args.layer;
  }

  if (Array.isArray(args.tags)) {
    const tags = args.tags.filter((t): t is string => typeof t === "string" && t.length > 0);
    if (tags.length > 0) query.tags = tags;
  }

  const results = await backend.search(query);
  if (results.length === 0) {
    return `ไม่พบผลลัพธ์สำหรับ "${queryText}" ผ่าน backend "${backend.name}"`;
  }

  const lines = results.map((r, i) => {
    const title = extractTitle(r.note.content);
    return `${i + 1}. [${r.note.id}] ${title} (layer=${r.note.layer}, score=${r.score.toFixed(3)}, matchedBy=${r.matchedBy})\n   ${buildExcerpt(r.note.content)}`;
  });

  return `พบ ${results.length} ผลลัพธ์ผ่าน backend "${backend.name}":\n\n${lines.join("\n\n")}\n\nเรียก get_memory ด้วย id เพื่อดูเนื้อหาเต็ม`;
}

async function getMemory(args: Record<string, unknown>): Promise<string> {
  await ensureReady();

  const id = typeof args.id === "string" ? args.id : "";
  if (id.length === 0) throw new ToolError('ต้องระบุ "id" ที่ไม่ว่าง (ได้จากผล search_memory)');

  const note = notesById.get(id);
  if (!note) {
    throw new ToolError(`ไม่พบ note id="${id}" — เรียก search_memory ก่อนเพื่อดู id ที่มีอยู่จริง`);
  }

  return [
    `# ${note.id}`,
    `layer: ${note.layer}`,
    `tags: ${note.tags.join(", ")}`,
    `created: ${note.createdAt}`,
    `links: ${note.links.join(", ") || "(ไม่มี)"}`,
    "",
    note.content,
  ].join("\n");
}

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<string>;
}

const tools: ToolDefinition[] = [
  {
    name: "ping",
    description: "ทดสอบว่า MCP server ตอบสนองอยู่ — คืนข้อความที่ส่งเข้ามาพร้อม timestamp",
    inputSchema: {
      type: "object",
      properties: { message: { type: "string", description: "ข้อความที่จะให้ echo กลับ" } },
      required: ["message"],
    },
    handler: async (args) => `pong: ${String(args.message)} (${new Date().toISOString()})`,
  },
  {
    name: "search_memory",
    description:
      "ค้นฐานความรู้ของระบบ 'PayFlow' (payment gateway, refund, order, business-logic, deployment, support case) " +
      "— นี่คือ external knowledge base แยกต่างหาก ไม่ใช่โค้ดในโปรเจกต์ที่กำลังเปิดอยู่ตอนนี้ " +
      "ใช้ได้ข้ามโปรเจกต์: เรียก tool นี้ทุกครั้งที่คำถามเกี่ยวกับ payment/refund/order/PayFlow business logic " +
      "แม้กำลังทำงานอยู่ในโปรเจกต์อื่นที่ไม่เกี่ยวกับ PayFlow โดยตรงก็ตาม — " +
      "คืน id + title + excerpt สั้นๆ ของแต่ละผลลัพธ์เท่านั้น เรียก get_memory ต่อถ้าต้องการเนื้อหาเต็ม",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "คำค้น เป็นภาษาไทยหรืออังกฤษก็ได้" },
        layer: { type: "string", description: `กรองตาม layer (${LAYERS.join(" | ")}) — เว้นว่างถ้าไม่กรอง` },
        tags: { type: "array", items: { type: "string" }, description: "กรองตาม tag ทุกตัวต้องตรง (AND) — เว้นว่างถ้าไม่กรอง" },
        limit: { type: "number", description: "จำนวนผลลัพธ์สูงสุด (default 10)" },
        backend: {
          type: "string",
          description: `backend ที่ใช้ค้น (default "${DEFAULT_BACKEND}") — ปกติไม่ต้องระบุ มีไว้สำหรับเทียบ backend เท่านั้น ที่มี: ${[...backendsByName.keys()].join(", ")}`,
        },
      },
      required: ["query"],
    },
    handler: (args) => searchMemory(args),
  },
  {
    name: "get_memory",
    description:
      "ดึงเนื้อหาเต็มของบันทึกความรู้ระบบ PayFlow 1 รายการจาก id (ได้จากผลของ search_memory) เพราะ search คืนแค่ excerpt สั้นๆ " +
      "ใช้ได้ข้ามโปรเจกต์เหมือนกับ search_memory",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: 'id ของ note เช่น "structure/module-payment.md"' } },
      required: ["id"],
    },
    handler: (args) => getMemory(args),
  },
];

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

function toolsListResult() {
  return {
    tools: tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })),
  };
}

async function toolsCallResult(params: Record<string, unknown> | undefined) {
  const name = params?.name as string | undefined;
  const args = (params?.arguments as Record<string, unknown> | undefined) ?? {};
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return { content: [{ type: "text", text: `[mcp] ไม่พบ tool ชื่อ "${name}"` }], isError: true };
  }
  try {
    const text = await tool.handler(args);
    return { content: [{ type: "text", text }] };
  } catch (err) {
    // ToolError คือ error ที่ตั้งใจให้ agent อ่านแล้วแก้ query ได้เอง (layer ผิด, id ไม่มี, ฯลฯ)
    // error อื่น (เช่น rg ไม่มี, ONNX พัง) ก็ยังส่ง message กลับตรงๆ เพราะ agent ควรเห็นสาเหตุจริง
    return { content: [{ type: "text", text: err instanceof Error ? err.message : String(err) }], isError: true };
  }
}

/** จัดการ 1 JSON-RPC message — คืน response object หรือ undefined ถ้าเป็น notification (ไม่ต้องตอบ) */
async function handleMessage(msg: JsonRpcRequest): Promise<Record<string, unknown> | undefined> {
  if (msg.method === "notifications/initialized") {
    return undefined; // notification — ไม่มี id ไม่ต้องตอบกลับ
  }

  if (msg.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id: msg.id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      },
    };
  }

  if (msg.method === "tools/list") {
    return { jsonrpc: "2.0", id: msg.id, result: toolsListResult() };
  }

  if (msg.method === "tools/call") {
    return { jsonrpc: "2.0", id: msg.id, result: await toolsCallResult(msg.params) };
  }

  return {
    jsonrpc: "2.0",
    id: msg.id,
    error: { code: -32601, message: `Method not found: ${msg.method}` },
  };
}

function startStdioServer(): void {
  const rl = createInterface({ input: process.stdin });
  rl.on("line", (line) => {
    if (line.trim().length === 0) return;
    let msg: JsonRpcRequest;
    try {
      msg = JSON.parse(line) as JsonRpcRequest;
    } catch {
      return; // บรรทัดที่ parse ไม่ได้ ข้ามไปเงียบๆ (ไม่ใช่ JSON-RPC message)
    }
    void handleMessage(msg).then((response) => {
      if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
    });
  });
  process.stderr.write("[mcp] stdio server พร้อมใช้งาน — warm-up จะเกิดตอน request แรกที่ต้องใช้ search\n");
}

function startHttpServer(port: number): void {
  const server = createServer((req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405).end();
      return;
    }
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk.toString("utf-8")));
    req.on("end", () => {
      void (async () => {
        let msg: JsonRpcRequest;
        try {
          msg = JSON.parse(body) as JsonRpcRequest;
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "invalid JSON" }));
          return;
        }
        const response = await handleMessage(msg);
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(response ?? {}));
      })();
    });
  });
  server.listen(port, () => {
    process.stderr.write(`[mcp] HTTP server พร้อมใช้งานที่ http://localhost:${port} — warm-up จะเกิดตอน request แรกที่ต้องใช้ search\n`);
  });
}

const mode = process.argv.includes("--http") ? "http" : "stdio";
if (mode === "http") {
  const portArg = process.argv.find((a) => a.startsWith("--port="));
  startHttpServer(portArg ? Number(portArg.slice("--port=".length)) : 4100);
} else {
  startStdioServer();
}
