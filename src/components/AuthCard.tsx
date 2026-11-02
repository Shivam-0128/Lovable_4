import type { ReactNode } from "react";

export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-soft">
        <p className="font-display text-lg text-primary">Habit Circle</p>
        <h1 className="mt-1 font-display text-3xl text-foreground">{title}</h1>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
