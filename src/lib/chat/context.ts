import "server-only";
import { cache } from "react";
import { getCategories, getFaqs, getPricingPackages, getSiteSettings } from "@/lib/content/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { MOCK_PRICE_FROM, type ChatBotContext } from "./bot";

/** Online / Away, set from Admin → Chats (cached with the site's content; a change expires it). */
export const getChatAway = cache(async () => {
  if (!isSupabaseConfigured()) return false;
  const { data, error } = await createPublicClient().from("chat_settings").select("away").eq("id", true).maybeSingle();
  if (error) {
    console.error("[chat] status could not be loaded", { code: error.code });
    return false;
  }
  return Boolean(data?.away);
});

/** What the chat's menu bot knows, from the site's own content (cached per request). */
export async function getChatBotContext(): Promise<ChatBotContext> {
  const [settings, categories, pricing, faqs, away] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getPricingPackages(),
    getFaqs(),
    getChatAway(),
  ]);
  const prices = pricing.map((p) => p.price).filter((p): p is number => p !== null);
  return {
    categories: categories.map((c) => c.label),
    priceFrom: prices.length ? Math.min(...prices) : MOCK_PRICE_FROM,
    workHref: "/#gallery",
    phone: settings.phone.display,
    email: settings.email?.address ?? null,
    address: { street: settings.address.street, locality: settings.address.locality, region: settings.address.region },
    faqs: faqs.map((f) => ({ question: f.question, answer: f.answer })),
    away,
  };
}
