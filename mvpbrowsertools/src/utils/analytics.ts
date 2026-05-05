import type { AnalyticsEventName } from "../types";

export const trackEvent = (name: AnalyticsEventName, detail: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("lft:event", {
      detail: { name, ...detail },
    }),
  );
};
