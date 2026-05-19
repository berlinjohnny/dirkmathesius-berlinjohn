declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const gtag = (...args: unknown[]) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
};

export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};

export const trackChatMessage = (lang: string) =>
  trackEvent("chat_message_sent", "engagement", lang);

export const trackLanguageSwitch = (from: string, to: string) =>
  trackEvent("language_switch", "ux", `${from}_to_${to}`);

export const trackNikeClick = () =>
  trackEvent("nike_statue_click", "engagement", "hero_popup");

export const trackCtaClick = (label: string) =>
  trackEvent("cta_click", "conversion", label);

export const trackScrollToChat = () =>
  trackEvent("scroll_to_chat", "engagement", "hero_cta");
