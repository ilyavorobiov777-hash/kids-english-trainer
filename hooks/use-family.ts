"use client";

import { createBrowserSupabase } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

export type FamilyContext = {
  userId: string;
  familyId: string;
  displayName: string | null;
};

export function useFamily() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [family, setFamily] = useState<FamilyContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        if (mounted) {
          setFamily(null);
          setLoading(false);
        }
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("family_id, display_name")
        .eq("auth_user_id", auth.user.id)
        .single();

      if (mounted) {
        if (profileError) setError(profileError.message);
        if (data) setFamily({ userId: auth.user.id, familyId: data.family_id, displayName: data.display_name });
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return { supabase, family, loading, error };
}
