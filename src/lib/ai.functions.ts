import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const input = z.object({
  messages: z.array(messageSchema).min(1).max(30),
});

const SYSTEM = `Du bist "Zorra", der freundliche KI-Assistent der Zoryn-Loyalty-Plattform.
Zoryn ist eine App für Punkte, Cashback, lokale Angebote und Prämien.
100 Punkte entsprechen 1 €. Nutzer:innen sammeln Punkte in Partnergeschäften und lösen sie gegen Rewards oder Rabatte ein.
Antworte immer freundlich, präzise und auf Deutsch. Halte Antworten kurz (max. 6 Sätze) und schlage bei Bedarf konkrete Schritte in der App vor (z. B. "Öffne den Scan-Tab", "Sieh dir /app/rewards an").
Wenn du etwas nicht weißt, sag es ehrlich und verweise auf /support/complaints oder support@zoryn.app.`;

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => input.parse(raw))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("KI-Assistent ist nicht konfiguriert.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, ...data.messages],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Zu viele Anfragen – bitte kurz warten.");
      if (res.status === 402) throw new Error("KI-Guthaben aufgebraucht. Bitte im Workspace aufladen.");
      throw new Error(`KI-Fehler (${res.status}): ${body.slice(0, 200)}`);
    }
    const json = await res.json();
    const reply: string = json?.choices?.[0]?.message?.content ?? "";
    return { reply };
  });
