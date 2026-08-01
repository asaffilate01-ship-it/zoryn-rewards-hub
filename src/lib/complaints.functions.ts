import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  membership_number: z.string().trim().max(40).optional().or(z.literal("")),
  category: z.enum(["complaint", "gdpr", "billing", "security", "other"]),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(4000),
});

export const submitComplaint = createServerFn({ method: "POST" })
  .inputValidator((d) => schema.parse(d))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const sb = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { error } = await sb.from("complaints").insert({
      name: data.name,
      email: data.email,
      membership_number: data.membership_number || null,
      category: data.category,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error("Beschwerde konnte nicht gespeichert werden.");
    return { ok: true };
  });
