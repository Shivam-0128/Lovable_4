import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Habit Circle — track habits with friends" },
      { name: "description", content: "Track daily habits, keep some private and discuss shared ones with your group." },
      { property: "og:title", content: "Habit Circle" },
      { property: "og:description", content: "Track daily habits together with friends or colleagues." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/habits" : "/signin" });
  },
});
