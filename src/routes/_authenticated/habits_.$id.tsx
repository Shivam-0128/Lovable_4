import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { currentStreak, lastSevenDays } from "@/lib/habit-stats";

export const Route = createFileRoute("/_authenticated/habits_/$id")({
  head: () => ({
    meta: [
      { title: "Habit — Habit Circle" },
      { name: "description", content: "Track a habit and discuss it." },
      { property: "og:title", content: "Habit — Habit Circle" },
      { property: "og:description", content: "Track a habit and discuss it." },
    ],
  }),
  component: HabitPage,
});

function HabitPage() {
  const { id } = Route.useParams();
  const { userId } = Route.useRouteContext();
  const qc = useQueryClient();
  const habitQ = useQuery({
    queryKey: ["habit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("habits").select("id,name,when_text,user_id,is_shared,profiles(display_name)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const doneQ = useQuery({
    queryKey: ["done", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("completions").select("day").eq("habit_id", id);
      if (error) throw error;
      return data.map((r) => r.day);
    },
  });
  const commentsQ = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("comments").select("id,body,created_at,profiles(display_name)").eq("habit_id", id).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const [comment, setComment] = useState("");
  const [err, setErr] = useState("");

  const habit = habitQ.data;
  if (habitQ.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!habit) return <p className="text-muted-foreground">This habit isn't available.</p>;

  const done = doneQ.data ?? [];
  const isOwner = habit.user_id === userId;

  async function toggle(day: string, checked: boolean) {
    const res = checked
      ? await supabase.from("completions").insert({ habit_id: id, day })
      : await supabase.from("completions").delete().eq("habit_id", id).eq("day", day);
    if (res.error) setErr(res.error.message);
    qc.invalidateQueries({ queryKey: ["done", id] });
  }

  async function post(e: FormEvent) {
    e.preventDefault();
    const body = comment.trim();
    if (!body) return;
    const { error } = await supabase.from("comments").insert({ habit_id: id, user_id: userId, body: body.slice(0, 2000) });
    if (error) return setErr(error.message);
    setComment("");
    qc.invalidateQueries({ queryKey: ["comments", id] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-foreground">{habit.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">by {habit.profiles?.display_name} · {habit.is_shared ? "Shared" : "Private"}</p>
        {habit.when_text && <p className="mt-4 whitespace-pre-wrap text-foreground">{habit.when_text}</p>}
      </div>
      <div className="flex gap-8 rounded-xl border bg-card p-5 shadow-soft">
        <p className="text-foreground">Days done: <strong>{done.length}</strong></p>
        <p className="text-foreground">Current streak: <strong>{currentStreak(done)}</strong></p>
      </div>
      <section>
        <h2 className="font-display text-2xl text-foreground">Last 7 days</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {lastSevenDays().map((day) => (
            <li key={day} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
              <Checkbox id={`d-${day}`} checked={done.includes(day)} disabled={!isOwner} onCheckedChange={(v) => toggle(day, v === true)} />
              <Label htmlFor={`d-${day}`} className="font-mono">{day}</Label>
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-foreground">Comments</h2>
        <ul className="space-y-3">
          {(commentsQ.data ?? []).length === 0 && <li className="text-sm text-muted-foreground">No comments yet.</li>}
          {(commentsQ.data ?? []).map((c) => (
            <li key={c.id} className="rounded-md border bg-card p-3">
              <p className="text-sm font-semibold text-primary">{c.profiles?.display_name}</p>
              <p className="whitespace-pre-wrap text-foreground">{c.body}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={post} className="space-y-2">
          <Label htmlFor="comment">Comment</Label>
          <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} />
          <Button type="submit">Post comment</Button>
        </form>
        {err && <p className="text-sm text-destructive">{err}</p>}
      </section>
    </div>
  );
}
