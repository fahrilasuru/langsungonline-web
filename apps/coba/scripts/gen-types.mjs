#!/usr/bin/env node
/**
 * Membuat src/types.ts dari skema OpenAPI backend.
 *
 *   npm run gen:types                          # membaca http://localhost:8000/openapi.json
 *   OPENAPI_SOURCE=https://api.contoh.app/openapi.json npm run gen:types
 *   OPENAPI_SOURCE=../langsungonline-api/openapi.json npm run gen:types
 *
 * Sumber bisa URL atau berkas JSON. API hanya menyajikan /openapi.json saat DEBUG=true;
 * tanpa itu, buat berkasnya di backend dengan `python export_openapi.py`.
 *
 * Penyesuaian satu-satunya terhadap skema: GET /preview/{id} memakai response_model_exclude_none=True,
 * jadi bidang bernilai None TIDAK dikirim. Tipe yang dihasilkan mengikuti isi respons sebenarnya:
 * bidang yang bisa None menjadi opsional (`x?: T`, tanpa `| null`), selebihnya wajib ada.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const OUTPUT = join(ROOT, "src", "types.ts");
const DEFAULT_SOURCE = "http://localhost:8000/openapi.json";
const GENERATOR = "openapi-typescript@^7";
const RESPONSE_PATH = "/preview/{preview_id}";

// ---------------------------------------------------------------- normalisasi (murni, tanpa I/O)
const refName = (ref) => ref.split("/").pop();
const isNull = (s) => s && s.type === "null";

/** Nama skema yang terjangkau dari respons 200 GET /preview/{id}. */
export function reachableSchemas(doc) {
  const root = doc.paths?.[RESPONSE_PATH]?.get?.responses?.["200"]?.content?.["application/json"]?.schema;
  if (!root) throw new Error(`Respons 200 GET ${RESPONSE_PATH} tidak ditemukan di skema OpenAPI`);
  const seen = new Set();
  const visit = (node) => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    if (typeof node.$ref === "string") {
      const name = refName(node.$ref);
      if (!seen.has(name)) {
        seen.add(name);
        visit(doc.components?.schemas?.[name]);
      }
    }
    Object.values(node).forEach(visit);
  };
  visit(root);
  return seen;
}

/** Salinan skema di mana bidang nullable menjadi opsional tanpa null, sesuai exclude_none. */
export function normalize(doc) {
  const out = structuredClone(doc);
  for (const name of reachableSchemas(out)) {
    const schema = out.components.schemas[name];
    if (!schema?.properties) continue;
    const required = new Set();
    for (const [key, prop] of Object.entries(schema.properties)) {
      const variants = prop.anyOf;
      const nullable = Array.isArray(variants) && variants.some(isNull);
      if (nullable) {
        const rest = variants.filter((v) => !isNull(v));
        if (rest.length === 1) {
          const { anyOf, ...meta } = prop;
          schema.properties[key] = { ...rest[0], ...meta };
        } else {
          prop.anyOf = rest;
        }
        if (schema.properties[key].default === null) delete schema.properties[key].default;
      } else {
        required.add(key);
      }
    }
    schema.required = [...required];
  }
  return out;
}

// ---------------------------------------------------------------- alias nama yang dipakai frontend
const ALIASES = `
// ---- Nama yang dipakai di seluruh frontend (diturunkan dari skema, bukan ditulis ulang) ----
type S = components["schemas"];
export type Img = S["Img"];
export type Hours = S["Hours"];
export type Product = S["Product"];
export type Business = S["Business"];
export type Site = S["Site"];
export type Highlight = S["Highlight"];
export type Ready = S["Ready"];
export type NeedsInfo = S["NeedsInfo"];
export type Offering = NonNullable<Site["offering"]>;
export type Presence = Ready["recommended_presence"][number];
export type PresenceType = Presence["type"];
export type Platform = S["MarketplaceData"]["platform"];
export type PreviewResponse =
  paths["/preview/{preview_id}"]["get"]["responses"]["200"]["content"]["application/json"];
`;

const HEADER = `/* eslint-disable */
// BERKAS HASIL GENERATE: jangan diedit tangan. Jalankan \`npm run gen:types\` (lihat scripts/gen-types.mjs).
// Sumber kebenaran: models/preview.py di backend, lewat skema OpenAPI.

`;

// ---------------------------------------------------------------- I/O
async function load(source) {
  if (/^https?:\/\//.test(source)) {
    const res = await fetch(source, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`GET ${source} -> ${res.status}. Apakah API berjalan dengan DEBUG=true?`);
    return res.json();
  }
  return JSON.parse(readFileSync(resolve(source), "utf8"));
}

async function main() {
  const source = process.argv[2] || process.env.OPENAPI_SOURCE || DEFAULT_SOURCE;
  console.log(`Membaca skema dari ${source}`);
  const doc = normalize(await load(source));

  const dir = mkdtempSync(join(tmpdir(), "langsung-openapi-"));
  try {
    const input = join(dir, "openapi.json");
    const generated = join(dir, "types.ts");
    writeFileSync(input, JSON.stringify(doc));
    const npx = process.platform === "win32" ? "npx.cmd" : "npx";
    const run = spawnSync(npx, ["--yes", GENERATOR, input, "-o", generated], { stdio: "inherit", cwd: ROOT, shell: process.platform === "win32" });
    if (run.status !== 0) throw new Error("openapi-typescript gagal dijalankan");
    writeFileSync(OUTPUT, HEADER + readFileSync(generated, "utf8").trimEnd() + "\n" + ALIASES, "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(`Selesai: ${OUTPUT}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
