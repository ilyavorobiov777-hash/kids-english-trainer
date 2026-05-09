"use client";

import { createBrowserSupabase } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

const FAMILY_LOAD_TIMEOUT_MS = 20000;

export type FamilyContext = {
  userId: string;
  familyId: string;
  displayName: string | null;
};

function withTimeout<T>(promise: PromiseLike<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), FAMILY_LOAD_TIMEOUT_MS);

    Promise.resolve(promise)
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeout));
  });
}

export function useFamily() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [family, setFamily] = useState<FamilyContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const { data: auth } = await withTimeout(supabase.auth.getUser(), "Не удалось загрузить сессию. Проверьте интернет и обновите страницу.");

        if (!auth.user) {
          if (mounted) {
            setFamily(null);
            setLoading(false);
          }
          return;
        }

        const { data, error: profileError } = await withTimeout(
          supabase.from("profiles").select("family_id, display_name").eq("auth_user_id", auth.user.id).single(),
          "Не удалось загрузить семейный профиль. Проверьте интернет и обновите страницу."
        );

        if (mounted) {
          if (profileError) setError(profileError.message);
          if (data) setFamily({ userId: auth.user.id, familyId: data.family_id, displayName: data.display_name });
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setFamily(null);
          setError(error instanceof Error ? error.message : "Не удалось загрузить семейные данные.");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return { supabase, family, loading, error };
}
