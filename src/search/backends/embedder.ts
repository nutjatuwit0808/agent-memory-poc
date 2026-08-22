import { AutoTokenizer, AutoModel, env } from "@huggingface/transformers";
import type { PreTrainedTokenizer, PreTrainedModel } from "@huggingface/transformers";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const MODELS_DIR = join(__dirname, "..", "..", "..", "data", "models");

env.cacheDir = MODELS_DIR;

export const MODEL_NAME = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
export const EMBEDDING_DIM = 384;

// max_seq_length=128 มาจาก sentence_bert_config.json ของโมเดลต้นฉบับ
// (sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 บน HF hub) — ไม่ใช่
// ข้อจำกัดของ BERT tokenizer เอง (tokenizer_config.json บอก model_max_length: 512,
// config.json บอก max_position_embeddings: 512) แต่เป็นความยาวที่โมเดลถูกฝึกมาให้ใช้งาน
// ดีที่สุด — พิสูจน์แล้วว่ามีผลจริง (ไม่ใช่แค่ทฤษฎี): embed ข้อความยาวเดียวกันด้วย
// max_length=128 เทียบกับ 512 ได้ cosine similarity แค่ ~0.78 ไม่ใช่ 1.0
//
// เหตุผลที่ไม่ใช้ pipeline("feature-extraction", ...) ตัวช่วยสำเร็จรูป: ทดสอบแล้วพบว่า
// มันไม่ forward `max_length`/`truncation` ที่เราส่งไปให้ tokenizer ภายในเลย (ผล embedding
// เหมือนกันทุกประการไม่ว่าจะส่ง max_length เท่าไหร่) — เป็น abstraction ที่ซ่อนกลไกไว้
// จริงๆ ตามที่ CLAUDE.md §1 เตือน จึงเรียก tokenizer + model ตรงๆ แล้วทำ mean pooling
// และ L2 normalize เองแทน เห็นทุกขั้นตอนชัดเจน
export const MAX_TOKENS = 128;

let tokenizerPromise: Promise<PreTrainedTokenizer> | undefined;
let modelPromise: Promise<PreTrainedModel> | undefined;
let modelLoadTimeMs: number | undefined;

async function getPipeline(): Promise<{ tokenizer: PreTrainedTokenizer; model: PreTrainedModel }> {
  if (!tokenizerPromise || !modelPromise) {
    const start = performance.now();
    tokenizerPromise = AutoTokenizer.from_pretrained(MODEL_NAME);
    modelPromise = AutoModel.from_pretrained(MODEL_NAME);
    await Promise.all([tokenizerPromise, modelPromise]);
    modelLoadTimeMs = performance.now() - start;
  }
  const [tokenizer, model] = await Promise.all([tokenizerPromise, modelPromise]);
  return { tokenizer, model };
}

/** เวลาที่ใช้โหลด model+tokenizer ครั้งแรก (undefined ถ้ายังไม่เคยเรียก embed()) — one-time setup ไม่ใช่ buildTimeMs */
export function getModelLoadTimeMs(): number | undefined {
  return modelLoadTimeMs;
}

export interface EmbedResult {
  vectors: Float32Array[];
  embedMs: number;
}

function isMasked(value: number | bigint): boolean {
  return value === 0 || value === 0n;
}

/** ตัด hidden state + attention mask เฉพาะของ batch item ที่ `batchIndex` แล้ว mean-pool + L2 normalize */
function meanPoolAndNormalize(
  hiddenData: Float32Array,
  attentionMaskData: ArrayLike<number | bigint>,
  batchIndex: number,
  seqLen: number,
  dim: number
): Float32Array {
  const vec = new Float32Array(dim);
  let count = 0;
  const maskOffset = batchIndex * seqLen;
  const hiddenOffset = batchIndex * seqLen * dim;

  for (let t = 0; t < seqLen; t++) {
    if (isMasked(attentionMaskData[maskOffset + t]!)) continue;
    count++;
    for (let d = 0; d < dim; d++) vec[d]! += hiddenData[hiddenOffset + t * dim + d]!;
  }
  const denom = count || 1;
  for (let d = 0; d < dim; d++) vec[d] = vec[d]! / denom;

  let norm = 0;
  for (let d = 0; d < dim; d++) norm += vec[d]! * vec[d]!;
  norm = Math.sqrt(norm) || 1;
  for (let d = 0; d < dim; d++) vec[d] = vec[d]! / norm;

  return vec;
}

/**
 * Embed ข้อความหลายอันพร้อมกัน (batch) — tokenize (truncate ที่ MAX_TOKENS) → รัน model
 * → mean-pool ด้วย attention mask → L2 normalize ทั้งหมดเขียนเอง ไม่พึ่ง pipeline()
 * เวกเตอร์ที่ได้ normalize แล้วเสมอ — cosine similarity ที่เขียนเองใน vector.backend.ts
 * (W3-4) ต้องการแบบนี้ (cosine ของเวกเตอร์ normalize แล้ว = dot product ตรงๆ)
 */
export async function embed(texts: string[]): Promise<EmbedResult> {
  const { tokenizer, model } = await getPipeline();

  const start = performance.now();
  const inputs = await tokenizer(texts, { max_length: MAX_TOKENS, truncation: true, padding: true });
  const output = await model(inputs);

  const hidden = output.last_hidden_state;
  const [batch, seqLen, dim] = hidden.dims as [number, number, number];
  const hiddenData = hidden.data as Float32Array;
  const attentionMaskData = inputs.attention_mask.data as ArrayLike<number | bigint>;

  const vectors: Float32Array[] = [];
  for (let b = 0; b < batch; b++) {
    vectors.push(meanPoolAndNormalize(hiddenData, attentionMaskData, b, seqLen, dim));
  }
  const embedMs = performance.now() - start;

  return { vectors, embedMs };
}
