import { getErrorCode } from "@/shared/utils";

import { providerText, type ProviderMessageTranslator } from "./[id]/providerPageHelpers";

type ConnectionErrorInfo = {
  errorCode?: string | number | null;
  lastError?: string | null;
  lastErrorType?: string | null;
};

export function getConnectionErrorTag(
  connection: ConnectionErrorInfo | null | undefined,
  t: ProviderMessageTranslator
): string | null {
  if (!connection) return null;

  const explicitType = connection.lastErrorType;
  if (explicitType === "runtime_error") return providerText(t, "errorTypeRuntime", "Runtime");
  if (
    explicitType === "upstream_auth_error" ||
    explicitType === "auth_missing" ||
    explicitType === "token_refresh_failed" ||
    explicitType === "token_expired"
  ) {
    return providerText(t, "errorTypeUpstreamAuth", "Auth");
  }
  if (explicitType === "upstream_rate_limited") {
    return providerText(t, "errorTypeRateLimited", "Rate limited");
  }
  if (explicitType === "upstream_unavailable") {
    return providerText(t, "errorTypeUpstreamUnavailable", "Server error");
  }
  if (explicitType === "network_error") {
    return providerText(t, "errorTypeNetworkError", "Network");
  }

  const numericCode = Number(connection.errorCode);
  if (Number.isFinite(numericCode) && numericCode >= 400) return String(numericCode);

  const fromMessage = getErrorCode(connection.lastError);
  if (fromMessage === "401" || fromMessage === "403") {
    return providerText(t, "errorTypeUpstreamAuth", "Auth");
  }
  if (fromMessage && fromMessage !== "ERR") return fromMessage;

  const message = (connection.lastError || "").toLowerCase();
  if (
    message.includes("runtime") ||
    message.includes("not runnable") ||
    message.includes("not installed")
  ) {
    return providerText(t, "errorTypeRuntime", "Runtime");
  }
  if (
    message.includes("invalid api key") ||
    message.includes("token invalid") ||
    message.includes("revoked") ||
    message.includes("unauthorized")
  ) {
    return providerText(t, "errorTypeUpstreamAuth", "Auth");
  }
  return "ERR";
}
