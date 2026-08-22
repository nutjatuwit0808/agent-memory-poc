import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SearchBackend } from "../backend.interface.js";
import { RipgrepBackend } from "./ripgrep.backend.js";
import { Fts5Backend } from "./fts5.backend.js";
import { VectorBackend } from "./vector.backend.js";
import { RouterBackend } from "../router.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = join(__dirname, "..", "..", "..", "vault");

const ripgrep = new RipgrepBackend(VAULT_ROOT);
const fts5 = new Fts5Backend();
// chunking: true, scoreAggregation: "max" (ค่า default — ดูเหตุผลใน workshops/03-vector-search/README.md)
const vector = new VectorBackend();
const routedBackends = { ripgrep, fts5, vector };

// แต่ละ workshop เพิ่ม backend ของตัวเองเข้ามาใน array นี้ทีละตัว
export const backends: SearchBackend[] = [
  ripgrep,
  fts5,
  vector,
  new RouterBackend({ name: "router-route", mode: "route", backends: routedBackends }),
  new RouterBackend({ name: "router-fuse", mode: "fuse", backends: routedBackends }),
];
