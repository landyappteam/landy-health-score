import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserTier = "free" | "pro";

export const useUserTier = (): { tier: UserTier; loading: boolean } => {
  const { user } = useAuth();
  const [tier, setTier] = useState<UserTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier("free");
      setLoading(false);
      return;
    }

    const fetchTier = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .maybeSingle();

      setTier(data?.subscription_tier === "pro" ? "pro" : "free");
      setLoading(false);
    };

    fetchTier();
  }, [user]);

  return { tier, loading };
};
