import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community — Habit Circle" },
      { name: "description", content: "Habits your group has chosen to share." },
      { property: "og:title", content: "Community — Habit Circle" },
      { property: "og:description", content: "Habits your group has chosen to share." },
    ],
  }),
  component: Community,
});

function Community() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["community"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("id,name,when_text,profiles(display_name),completions(day)")
        .eq("is_shared", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-foreground">Community</h1>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {!isLoading && data.length === 0 && <p className="text-muted-foreground">No shared habits yet.</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {data.map((h) => (
          <li key={h.id} className="rounded-xl border bg-card p-5 shadow-soft">
            <Link to="/habits/$id" params={{ id: h.id }} className="font-display text-2xl text-foreground hover:text-primary hover:underline">{h.name}</Link>
            <p className="text-sm text-muted-foreground">by {h.profiles?.display_name}</p>
            {h.when_text && <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{h.when_text}</p>}
            <p className="mt-3 text-sm text-foreground">Days done: <strong>{h.completions.length}</strong></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
