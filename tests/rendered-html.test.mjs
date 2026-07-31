import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the travel app and its five-section navigation", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Fenouill(?:&egrave;|è)des/i);
  assert.match(html, /Cuatro d(?:&iacute;|í)as, sin apretar el paso/i);
  for (const label of ["Inicio", "Mapa", "Restaurantes", "Monumentos", "Info"]) {
    assert.match(html, new RegExp(label, "i"));
  }
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|imagen provisional/i);
});

test("supports a direct day route", async () => {
  const response = await render("/dias/dia-2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /El mar, que es el mejor aire acondicionado/i);
  assert.match(html, /Hora de salida/i);
});

test("ships an installable manifest and offline worker", async () => {
  const [manifestText, worker] = await Promise.all([
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
  ]);
  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  assert.match(worker, /caches\.open/);
  assert.match(worker, /tile\.openstreetmap\.org/);
});
