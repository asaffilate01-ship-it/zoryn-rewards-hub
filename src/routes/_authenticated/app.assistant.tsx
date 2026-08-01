import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User as UserIcon } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/app/assistant")({
  head: () => ({ meta: [{ title: "Zorra — KI-Assistent" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const t = useT();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: t(
        "Hi! Ich bin **Zorra**, dein Zoryn-Assistent. Frag mich zu Punkten, Rewards, Angeboten oder wie du deine Wallet nutzt.",
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const askFn = useServerFn(askAssistant);

  const mutation = useMutation({
    mutationFn: async (history: Msg[]) => askFn({ data: { messages: history } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.reply }]),
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  function send() {
    const text = input.trim();
    if (!text || mutation.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-14rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-9 place-items-center rounded-full gradient-brand text-primary-foreground shadow">
          <Sparkles className="size-4" />
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold">Zorra</h1>
          <p className="text-xs text-muted-foreground">
            {t("KI-Assistent · immer freundlich, immer hilfsbereit")}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-card/40 p-4"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`grid size-7 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-primary/15 text-primary" : "bg-foreground/10 text-foreground"}`}
            >
              {m.role === "user" ? <UserIcon className="size-3.5" /> : <Bot className="size-3.5" />}
            </div>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background/60 text-foreground"}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {mutation.isPending && (
          <div className="flex gap-2">
            <div className="grid size-7 place-items-center rounded-full bg-foreground/10">
              <Bot className="size-3.5" />
            </div>
            <div className="rounded-2xl bg-background/60 px-3.5 py-2.5 text-sm text-muted-foreground">
              {t("Zorra denkt nach…")}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={t("Frag Zorra etwas…")}
          rows={2}
          className="resize-none"
        />
        <Button
          onClick={send}
          disabled={mutation.isPending || !input.trim()}
          size="icon"
          className="size-11 shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
