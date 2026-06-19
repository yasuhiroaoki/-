// GA4 イベント送信のラッパー（9章 計測）
// イベント名は英語で統一：generate_click / line_add_click / email_submit

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type GaEvent = "generate_click" | "line_add_click" | "email_submit";

export function trackEvent(
  event: GaEvent,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}
