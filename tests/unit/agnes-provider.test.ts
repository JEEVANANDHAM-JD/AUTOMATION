import test from "node:test";
import assert from "node:assert/strict";

const { APIKEY_PROVIDERS } = await import("../../src/shared/constants/providers.ts");
const { REGISTRY: providerRegistry } = await import("../../open-sse/config/providerRegistry.ts");
const { FREE_MODEL_BUDGETS } = await import("../../open-sse/config/freeModelCatalog.ts");

const AGNES_CHAT_URL = "https://apihub.agnes-ai.com/v1/chat/completions";

test("agnes is registered as an API-key provider with complete metadata", () => {
  const entry = APIKEY_PROVIDERS.agnes;
  assert.ok(entry, "APIKEY_PROVIDERS.agnes must be defined");
  assert.equal(entry.id, "agnes");
  assert.equal(entry.alias, "agnes");
  assert.equal(entry.name, "Agnes AI");
  assert.equal(entry.icon, "auto_awesome");
  assert.equal(entry.color, "#10B981");
  assert.equal(entry.textIcon, "AG");
  assert.equal(entry.website, "https://agnes-ai.com");
  assert.equal(entry.hasFree, true);
  assert.ok(entry.freeNote, "freeNote must be defined");
  assert.ok(entry.authHint, "authHint must be defined");
});

test("agnes registry entry uses OpenAI format with bearer API-key auth", () => {
  const entry = providerRegistry.agnes;
  assert.ok(entry, "providerRegistry.agnes must be defined");
  assert.equal(entry.id, "agnes");
  assert.equal(entry.format, "openai");
  assert.equal(entry.executor, "default");
  assert.equal(entry.authType, "apikey");
  assert.equal(entry.authHeader, "bearer");
  assert.equal(entry.baseUrl, AGNES_CHAT_URL);
});

test("agnes ships the current public chat models with correct capabilities", () => {
  const entry = providerRegistry.agnes;
  assert.deepEqual(
    entry.models.map((model) => model.id),
    ["agnes-2.0-flash", "agnes-2.5-flash", "agnes-2.5-pro"]
  );

  const flash2 = entry.models.find((m) => m.id === "agnes-2.0-flash");
  assert.ok(flash2, "agnes-2.0-flash must be defined");
  assert.equal(flash2.contextLength, 524288);
  assert.equal(flash2.maxOutputTokens, 65536);
  assert.equal(flash2.supportsReasoning, true);
  assert.equal(flash2.supportsVision, true);
  assert.equal(flash2.toolCalling, true);
  assert.equal(flash2.interleavedField, "reasoning_content");

  const flash25 = entry.models.find((m) => m.id === "agnes-2.5-flash");
  assert.ok(flash25, "agnes-2.5-flash must be defined");
  assert.equal(flash25.contextLength, 524288);
  assert.equal(flash25.maxOutputTokens, 65536);
  assert.equal(flash25.supportsReasoning, true);
  assert.equal(flash25.supportsVision, true);
  assert.equal(flash25.toolCalling, true);
  assert.equal(flash25.interleavedField, "reasoning_content");

  const pro25 = entry.models.find((model) => model.id === "agnes-2.5-pro");
  assert.ok(pro25, "agnes-2.5-pro must be defined");
  assert.equal(pro25.contextLength, 1048576);
  assert.equal(pro25.maxOutputTokens, 65536);
  assert.equal(pro25.supportsReasoning, true);
  assert.equal(pro25.supportsVision, true);
  assert.equal(pro25.toolCalling, true);
  assert.equal(pro25.interleavedField, "reasoning_content");
});

test("agnes free catalog exposes the current free chat models through one shared pool", () => {
  const rows = FREE_MODEL_BUDGETS.filter((model) => model.provider === "agnes");
  assert.deepEqual(
    rows.map((model) => model.modelId),
    ["agnes-2.0-flash", "agnes-2.5-flash"]
  );
  assert.ok(rows.every((model) => model.poolKey === "agnes-free"));
});

test("agnes has no collision with zenmux-free sapiens-ai prefixed models", (t) => {
  const zenmux = providerRegistry["zenmux-free"];
  if (!zenmux) {
    t.skip("zenmux-free not registered in this environment");
    return;
  }
  const agnesInZenmux = zenmux.models.filter((m) => m.id.includes("agnes"));
  for (const m of agnesInZenmux) {
    assert.ok(
      m.id.startsWith("sapiens-ai/"),
      `zenmux agnes model ${m.id} must use sapiens-ai/ prefix to avoid collision`
    );
  }
});
