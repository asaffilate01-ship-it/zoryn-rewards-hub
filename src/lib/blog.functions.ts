import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
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
}

export const listPosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_url, author_name, tags, published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (error) return { posts: [] as NonNullable<typeof data> };
  return { posts: data ?? [] };
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: post } = await sb
      .from("blog_posts")
      .select("id, slug, title, excerpt, body_md, cover_url, author_name, tags, published_at")
      .eq("slug", data.slug)
      .not("published_at", "is", null)
      .maybeSingle();
    return { post: post ?? null };
  });
