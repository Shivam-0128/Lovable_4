import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/signin", replace: true });
  }
  const linkCls = "text-sm font-medium text-muted-foreground hover:text-foreground";
  const active = { className: "text-sm font-semibold text-primary" };
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <span className="font-display text-xl text-foreground">Habit Circle</span>
          <nav className="flex gap-5">
            <Link to="/habits" className={linkCls} activeProps={active}>My habits</Link>
            <Link to="/community" className={linkCls} activeProps={active}>Community</Link>
          </nav>
          <Button variant="outline" size="sm" className="ml-auto" onClick={signOut}>Sign out</Button>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="hidden w-48 shrink-0 flex-col gap-2 sm:flex">
          <Button asChild variant="secondary" className="justify-start">
            <Link to="/habits">My habits</Link>
          </Button>
          <Button asChild variant="secondary" className="justify-start">
            <Link to="/community">Community</Link>
          </Button>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
