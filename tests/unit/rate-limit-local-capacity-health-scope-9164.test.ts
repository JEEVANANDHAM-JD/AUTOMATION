import assert from "node:assert/strict";
import test from "node:test";

import {
  isRequestScopedUpstreamFailure,
  shouldRecordProviderBreakerFailure,
  shouldSkipConnDisable,
} from "../../open-sse/services/combo/comboPredicates.ts";
import { applyComboTargetExhaustion } from "../../open-sse/services/combo/targetExhaustion.ts";

const noop = () => {};
const log = { info: noop, warn: noop, debug: noop, error: noop };

function target() {
  return {
    kind: "model" as const,
    modelStr: "nvidia/z-ai/glm-5.2",
    provider: "nvidia",
    providerId: null,
    connectionId: "conn-queue-9164",
    executionKey: "queue-9164",
    stepId: "queue-9164",
    weight: 1,
    label: null,
  } as Parameters<typeof applyComboTargetExhaustion>[0];
}

function emptySets() {
  return {
    exhaustedProviders: new Set<string>(),
    exhaustedConnections: new Set<string>(),
    transientRateLimitedProviders: new Set<string>(),
  };
}

const localCases = [
  { code: "RATE_LIMIT_QUEUE_TIMEOUT", status: 503 },
  { code: "RATE_LIMIT_QUEUE_FULL", status: 429 },
  { code: "RATE_LIMIT_QUEUE_WEDGED", status: 502 },
] as const;

for (const { code, status } of localCases) {
  test(`#9164 ${code} is request-scoped and cannot poison provider health`, () => {
    const structuredError = { code, type: "local_queue_capacity" };
    assert.equal(isRequestScopedUpstreamFailure(structuredError), true);
    assert.equal(
      shouldSkipConnDisable(
        { status, errorCode: code, errorType: "local_queue_capacity" },
        false,
        false,
        "nvidia"
      ),
      true
    );

    const sets = emptySets();
    applyComboTargetExhaustion(target(), {
      result: { status, headers: null },
      fallbackResult: {},
      errorText: "local OmniRoute queue capacity",
      rawModel: "z-ai/glm-5.2",
      isTokenLimitBreach: false,
      allAccountsRateLimited: false,
      sets,
      log,
      tag: "COMBO",
      exhaustedLogLevel: "info",
      structuredError,
    });

    assert.equal(sets.exhaustedProviders.size, 0);
    assert.equal(sets.exhaustedConnections.size, 0);
    assert.equal(sets.transientRateLimitedProviders.size, 0);

    assert.equal(
      shouldRecordProviderBreakerFailure({
        isStreamReadinessFailure: false,
        status,
        sameProviderNext: false,
        requestScopedFailure: true,
      }),
      false
    );
  });
}

test("#9164 a genuine upstream 429 remains provider-transient", () => {
  const sets = emptySets();
  applyComboTargetExhaustion(target(), {
    result: { status: 429, headers: null },
    fallbackResult: {},
    errorText: "upstream rate limited",
    rawModel: "z-ai/glm-5.2",
    isTokenLimitBreach: false,
    allAccountsRateLimited: false,
    sets,
    log,
    tag: "COMBO",
    exhaustedLogLevel: "info",
    structuredError: { code: "rate_limit_exceeded", type: "rate_limit_error" },
  });

  assert.deepEqual([...sets.transientRateLimitedProviders], ["nvidia"]);
});
