import { providerText, type ProviderMessageTranslator } from "./providerPageHelpers";

export type UpstreamProxyMode = "native" | "cliproxyapi" | "dario" | "fallback";
export type UpstreamProxyFallbackBackend = "cliproxyapi" | "dario";

export function claudeExtraUsageUpdateFailedText(t: ProviderMessageTranslator): string {
  return providerText(
    t,
    "failedUpdateClaudeExtraUsagePolicy",
    "Failed to update Claude extra-usage policy"
  );
}

export function claudeExtraUsageUpdatedText(
  t: ProviderMessageTranslator,
  enabled: boolean
): string {
  return enabled
    ? providerText(
        t,
        "claudeExtraUsageBlockingEnabled",
        "Claude extra-usage blocking enabled (extra usage will be blocked)"
      )
    : providerText(
        t,
        "claudeExtraUsageBlockingDisabled",
        "Claude extra-usage blocking disabled (extra usage is allowed)"
      );
}

export function codexLimitUpdateFailedText(t: ProviderMessageTranslator): string {
  return providerText(t, "failedUpdateCodexLimitPolicy", "Failed to update Codex limit policy");
}

export function upstreamProxyUpdateFailedText(t: ProviderMessageTranslator): string {
  return providerText(
    t,
    "failedUpdateUpstreamProxyRouting",
    "Failed to update upstream proxy routing"
  );
}

export function upstreamProxyModeUpdatedText(
  t: ProviderMessageTranslator,
  mode: UpstreamProxyMode
): string {
  const messages: Record<UpstreamProxyMode, [string, string]> = {
    native: ["cliproxyRoutingDisabled", "Requests now use native OmniRoute (direct)"],
    cliproxyapi: [
      "cliproxyRoutingEnabled",
      "Requests now route through CLIProxyAPI (deeper emulation)",
    ],
    dario: ["darioRoutingEnabled", "Requests now route through Dario (Claude subscription proxy)"],
    fallback: [
      "upstreamProxyFallbackEnabled",
      "Requests try native first, retrying via the configured backend on failure",
    ],
  };
  return providerText(t, ...messages[mode]);
}
