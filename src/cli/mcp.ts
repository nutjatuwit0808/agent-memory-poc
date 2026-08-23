/**
 * MCP server เขียนเอง (D-14) — ไม่ใช้ @modelcontextprotocol/sdk เพื่อให้เห็นกลไก JSON-RPC
 * ตรงๆ (เหมือนที่เลือก node:http แทน framework ใน WS05) surface ที่ต้องรองรับมีแค่ 4 อย่าง:
 * initialize, notifications/initialized, tools/list, tools/call
 *
 * รองรับทั้ง stdio (Cursor spawn เป็น subprocess) และ HTTP (เปิดค้างไว้ ไม่ต้อง cold-start
 * ซ้ำทุกครั้ง) — W10-3 วัดสองแบบนี้เทียบกันจริง ไม่ใช่เชื่อตามทฤษฎีเฉยๆ
 */
import { createServer } from "node:http";
import { createInterface } from "node:readline";

const PROTOCOL_VERSION = "2025-06-18";
const SERVER_INFO = { name: "memory-workshop-mcp", version: "0.0.1" };

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
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

// W10-1: tool เดียวพอ — เป้าหมายคือพิสูจน์ว่า handshake ผ่าน ไม่ใช่ทดสอบ search
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
];

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
  process.stderr.write("[mcp] stdio server พร้อมใช้งาน\n");
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
    process.stderr.write(`[mcp] HTTP server พร้อมใช้งานที่ http://localhost:${port}\n`);
  });
}

const mode = process.argv.includes("--http") ? "http" : "stdio";
if (mode === "http") {
  const portArg = process.argv.find((a) => a.startsWith("--port="));
  startHttpServer(portArg ? Number(portArg.slice("--port=".length)) : 4100);
} else {
  startStdioServer();
}
