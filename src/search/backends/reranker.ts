import { AutoTokenizer, XLMRobertaForSequenceClassification, env } from "@huggingface/transformers";
import type { PreTrainedTokenizer } from "@huggingface/transformers";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const MODELS_DIR = join(__dirname, "..", "..", "..", "data", "models");

env.cacheDir = MODELS_DIR;

export const RERANKER_MODEL_NAME = "jinaai/jina-reranker-v2-base-multilingual";

// config.json ของโมเดลนี้ไม่มี field `model_type` (ใช้ auto_map ชี้ไปคลาส Python ของตัวเอง
// แทน) transformers.js เลยหา class จาก AutoModelForSequenceClassification ไม่เจอ
// ("Unsupported model type: null") ต้อง import คลาสตรงๆ (XLMRobertaForSequenceClassification)
// แทน Auto* — เป็นอีกจุดที่ abstraction สำเร็จรูปเงียบๆ ไม่ทำงานอย่างที่โฆษณา (tag
// "transformers.js" บนหน้าโมเดลไม่ได้แปลว่า AutoModel จะ resolve ได้เสมอไป)
type RerankerModel = InstanceType<typeof XLMRobertaForSequenceClassification>;

let tokenizerPromise: Promise<PreTrainedTokenizer> | undefined;
let modelPromise: Promise<RerankerModel> | undefined;
let modelLoadTimeMs: number | undefined;

async function getPipeline(): Promise<{ tokenizer: PreTrainedTokenizer; model: RerankerModel }> {
  if (!tokenizerPromise || !modelPromise) {
    const start = performance.now();
    // trust_remote_code ไม่จำเป็น: เราโหลด ONNX graph ตรงๆ ไม่ได้รันไฟล์ Python
    // modeling_xlm_roberta.py ที่ config.json ชี้ไปเลย (auto_map นั้นมีไว้สำหรับ
    // PyTorch runtime เท่านั้น) จึงไม่มี option นี้ให้ผ่านใน type ของ transformers.js
    tokenizerPromise = AutoTokenizer.from_pretrained(RERANKER_MODEL_NAME);
    modelPromise = XLMRobertaForSequenceClassification.from_pretrained(RERANKER_MODEL_NAME, {
      dtype: "q8", // quantized — เร็วกว่าและเล็กกว่าบน CPU โดย score ยังแยกคู่ relevant/irrelevant ได้ถูกต้อง (ยืนยันแล้วใน W7-2)
    });
    await Promise.all([tokenizerPromise, modelPromise]);
    modelLoadTimeMs = performance.now() - start;
  }
  const [tokenizer, model] = await Promise.all([tokenizerPromise, modelPromise]);
  return { tokenizer, model };
}

/** เวลาที่ใช้โหลด model+tokenizer ครั้งแรก (undefined ถ้ายังไม่เคยเรียก rerank()) — one-time setup ไม่ใช่ rerankMs */
export function getRerankerLoadTimeMs(): number | undefined {
  return modelLoadTimeMs;
}

export interface RerankResult {
  scores: number[]; // เรียงตาม order เดียวกับ docs ที่ส่งเข้ามา (ไม่ได้ sort ให้)
  rerankMs: number;
}

/**
 * ให้คะแนนความเกี่ยวข้องของ query กับแต่ละ document — ยัด [query, document] เข้าโมเดล
 * เป็นคู่ (text_pair) ต่างจาก bi-encoder (embedder.ts) ที่ encode สองฝั่งแยกกัน คู่นี้
 * ต้อง forward pass ใหม่ทุกคู่ ทำทีละคู่ตามลำดับ (ไม่ batch) เพราะ transformers.js
 * text_pair แบบ batch หลายคู่พร้อมกันยังไม่เสถียรกับโมเดลนี้ในการทดสอบจริง
 */
export async function rerank(query: string, docs: string[]): Promise<RerankResult> {
  const { tokenizer, model } = await getPipeline();

  const start = performance.now();
  const scores: number[] = [];
  for (const doc of docs) {
    const inputs = await tokenizer(query, { text_pair: doc, padding: true, truncation: true });
    const output = await model(inputs);
    scores.push(output.logits.data[0] as number);
  }
  const rerankMs = performance.now() - start;

  return { scores, rerankMs };
}
