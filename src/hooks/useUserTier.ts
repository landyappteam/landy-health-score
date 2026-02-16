import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserTier = "free" | "pro";

export const useUserTier = (): { tier: UserTier; loading: boolean; refresh: () => void } => {
  const { user } = useAuth();
  const [tier, setTier] = useState<UserTier>("free");
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setTier("free");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setTier(data?.tier === "pro" ? "pro" : "free");
    } catch {
      // Fallback to profiles table
      const { data } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .maybeSingle();
      setTier(data?.subscription_tier === "pro" ? "pro" : "free");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return { tier, loading, refresh: checkSubscription };
};
