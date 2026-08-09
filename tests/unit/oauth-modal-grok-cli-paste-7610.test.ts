import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import messages from "../../src/i18n/messages/en.json";

// Source-level contract tests for the #7610 Grok Build paste-import UX.
// The modal must refuse bare JWT pastes and require full auth.json with refresh_token.

const here = dirname(fileURLToPath(import.meta.url));
const modalSource = readFileSync(join(here, "../../src/shared/components/OAuthModal.tsx"), "utf8");
const parserSource = readFileSync(
  join(here, "../../src/lib/oauth/utils/grokCliAuthJson.ts"),
  "utf8"
);

test("#7610: OAuthModal rejects bare Grok JWT paste instructions", () => {
  assert.match(modalSource, /parseGrokCliPasteToken/);
  assert.match(parserSource, /Do not paste only the JWT/);
  assert.match(parserSource, /full ~\/\.grok\/auth\.json/);
  assert.doesNotMatch(
    modalSource,
    /Paste your Grok Build JWT token from ~\/\.grok\/auth\.json \(the "key" field value\)/
  );
});

test("#7610: OAuthModal paste UI is auth.json-oriented for grok-cli", () => {
  assert.match(modalSource, /t\("tabImportAuthJson"\)/);
  assert.match(modalSource, /t\("grokAuthJsonDescription"\)/);
  assert.match(modalSource, /t\("grokAuthJsonPlaceholder"\)/);
  assert.match(modalSource, /t\("grokAuthJsonLabel"\)/);
  assert.equal(messages.oauthModal.tabImportAuthJson, "Import auth.json");
  assert.equal(messages.oauthModal.grokAuthJsonLabel, "Grok Build auth.json");
  assert.match(messages.oauthModal.grokAuthJsonDescription, /refresh_token/);
});
