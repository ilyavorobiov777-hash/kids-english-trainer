"use client";

import { createApiClient, getCurrentFamily } from "@/lib/api-client";
import { useEffect, useMemo, useState } from "react";

const FAMILY_LOAD_TIMEOUT_MS = 60000;

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
  const api = useMemo(() => createApiClient(), []);
  const [family, setFamily] = useState<FamilyContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await withTimeout(getCurrentFamily(), "Не удалось загрузить сессию за 60 секунд. Проверьте интернет и обновите страницу.");
        if (!mounted) return;
        setFamily(result.family);
        setError(result.error);
      } catch (loadError) {
        if (!mounted) return;
        setFamily(null);
        setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить семейные данные.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { api, family, loading, error };
}
