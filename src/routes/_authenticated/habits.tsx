import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({
    meta: [
      { title: "My habits — Habit Circle" },
      { name: "description", content: "Your personal habit list." },
      { property: "og:title", content: "My habits — Habit Circle" },
      { property: "og:description", content: "Your personal habit list." },
    ],
  }),
  component: MyHabits,
});

function MyHabits() {
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: habits = [] } = useQuery({
    queryKey: ["my-habits", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("id,name,is_shared").eq("user_id", userId).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [shared, setShared] = useState(false);
  const [error, setError] = useState("");

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Please enter a habit name.");
    const { error } = await supabase.from("habits").insert({ user_id: userId, name: name.trim(), when_text: when.trim(), is_shared: shared });
    if (error) return setError(error.message);
    setName(""); setWhen(""); setShared(false); setError("");
    qc.invalidateQueries({ queryKey: ["my-habits", userId] });
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-4xl text-foreground">My habits</h1>
      <form onSubmit={add} className="space-y-4 rounded-xl border bg-card p-6 shadow-soft">
        <div className="space-y-1.5"><Label htmlFor="hn">Habit name</Label><Input id="hn" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} /></div>
        <div className="space-y-1.5">
          <Label htmlFor="hw">When I do it</Label>
          <Textarea id="hw" value={when} onChange={(e) => setWhen(e.target.value)} maxLength={2000} placeholder="e.g. Right after my morning coffee, especially when the sun is out" />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="hs" checked={shared} onCheckedChange={(v) => setShared(v === true)} />
          <Label htmlFor="hs">Share with the community</Label>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit">Add habit</Button>
      </form>
      <ul className="divide-y rounded-xl border bg-card">
        {habits.length === 0 && <li className="p-4 text-sm text-muted-foreground">No habits yet.</li>}
        {habits.map((h) => (
          <li key={h.id} className="flex items-center justify-between p-4">
            <Link to="/habits/$id" params={{ id: h.id }} className="font-medium text-foreground hover:text-primary hover:underline">{h.name}</Link>
            <Badge variant={h.is_shared ? "default" : "secondary"}>{h.is_shared ? "Shared" : "Private"}</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
