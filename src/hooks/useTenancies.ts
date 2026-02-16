import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Tenancy {
  id: string;
  property_id: string;
  tenant_name: string;
  tenant_email: string | null;
  tenant_phone: string | null;
  start_date: string;
  monthly_rent: number;
  deposit_amount: number | null;
  deposit_scheme_ref: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RentIncrease {
  id: string;
  tenancy_id: string;
  current_rent: number;
  new_rent: number;
  notice_served_date: string;
  effective_date: string;
  section_13_generated: boolean;
}

export interface LegalNotice {
  id: string;
  tenancy_id: string;
  notice_type: "section_8" | "section_13";
  grounds: string[] | null;
  notice_date: string;
  expiry_date: string | null;
  status: "draft" | "served" | "expired" | "actioned";
  notes: string | null;
}

export function useTenancies(propertyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [rentIncreases, setRentIncreases] = useState<RentIncrease[]>([]);
  const [legalNotices, setLegalNotices] = useState<LegalNotice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenancies = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from("tenancies").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (propertyId) query = query.eq("property_id", propertyId);
      const { data, error } = await query;
      if (error) throw error;
      setTenancies((data as Tenancy[]) || []);

      // Fetch rent increases for these tenancies
      if (data && data.length > 0) {
        const ids = data.map((t: any) => t.id);
        const { data: ri } = await supabase.from("rent_increases").select("*").in("tenancy_id", ids).order("created_at", { ascending: false });
        setRentIncreases((ri as RentIncrease[]) || []);

        const { data: ln } = await supabase.from("legal_notices").select("*").in("tenancy_id", ids).order("created_at", { ascending: false });
        setLegalNotices((ln as LegalNotice[]) || []);
      } else {
        setRentIncreases([]);
        setLegalNotices([]);
      }
    } catch (err: any) {
      toast({ title: "Error loading tenancies", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, propertyId, toast]);

  useEffect(() => { fetchTenancies(); }, [fetchTenancies]);

  const addTenancy = useCallback(async (data: {
    property_id: string;
    tenant_name: string;
    tenant_email?: string;
    tenant_phone?: string;
    start_date: string;
    monthly_rent: number;
    deposit_amount?: number;
    deposit_scheme_ref?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from("tenancies").insert({ ...data, user_id: user.id });
    if (error) {
      toast({ title: "Failed to add tenancy", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tenancy added" });
    fetchTenancies();
  }, [user, toast, fetchTenancies]);

  const endTenancy = useCallback(async (tenancyId: string) => {
    const { error } = await supabase.from("tenancies").update({ is_active: false }).eq("id", tenancyId);
    if (error) {
      toast({ title: "Failed to end tenancy", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tenancy ended" });
    fetchTenancies();
  }, [toast, fetchTenancies]);

  const updateTenancy = useCallback(async (tenancyId: string, data: {
    tenant_name?: string;
    tenant_email?: string | null;
    tenant_phone?: string | null;
    start_date?: string;
    monthly_rent?: number;
    deposit_amount?: number | null;
    deposit_scheme_ref?: string | null;
  }) => {
    const { error } = await supabase.from("tenancies").update(data).eq("id", tenancyId);
    if (error) {
      toast({ title: "Failed to update tenancy", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Tenancy updated" });
    fetchTenancies();
  }, [toast, fetchTenancies]);

  const addRentIncrease = useCallback(async (data: {
    tenancy_id: string;
    current_rent: number;
    new_rent: number;
    notice_served_date: string;
    effective_date: string;
  }) => {
    if (!user) return;
    // Validate: effective date must be >= 2 months from notice
    const notice = new Date(data.notice_served_date);
    const effective = new Date(data.effective_date);
    const minEffective = new Date(notice);
    minEffective.setMonth(minEffective.getMonth() + 2);
    if (effective < minEffective) {
      toast({ title: "Invalid date", description: "Effective date must be at least 2 months after notice date (Section 13 requirement).", variant: "destructive" });
      return;
    }
    // Validate: no increase within 12 months
    const tenancyIncreases = rentIncreases.filter(ri => ri.tenancy_id === data.tenancy_id);
    if (tenancyIncreases.length > 0) {
      const lastEffective = new Date(tenancyIncreases[0].effective_date);
      const twelveMonths = new Date(lastEffective);
      twelveMonths.setFullYear(twelveMonths.getFullYear() + 1);
      if (effective < twelveMonths) {
        toast({ title: "Too soon", description: "Rent can only be increased once every 12 months.", variant: "destructive" });
        return;
      }
    }
    // Validate: no bidding — new rent must not exceed listed amount (we just prevent decrease check)
    if (data.new_rent <= data.current_rent) {
      toast({ title: "Invalid amount", description: "New rent must be higher than current rent.", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("rent_increases").insert({ ...data, user_id: user.id });
    if (error) {
      toast({ title: "Failed to record increase", description: error.message, variant: "destructive" });
      return;
    }
    // Update tenancy rent
    const tenancy = tenancies.find(t => t.id === data.tenancy_id);
    if (tenancy) {
      await supabase.from("tenancies").update({ monthly_rent: data.new_rent }).eq("id", data.tenancy_id);
    }
    toast({ title: "Rent increase recorded" });
    fetchTenancies();
  }, [user, toast, fetchTenancies, rentIncreases, tenancies]);

  const addLegalNotice = useCallback(async (data: {
    tenancy_id: string;
    notice_type: "section_8" | "section_13";
    grounds?: string[];
    notice_date: string;
    expiry_date?: string;
    notes?: string;
  }) => {
    if (!user) return;
    const { error } = await supabase.from("legal_notices").insert({
      ...data,
      user_id: user.id,
      status: "draft",
    });
    if (error) {
      toast({ title: "Failed to create notice", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Legal notice created" });
    fetchTenancies();
  }, [user, toast, fetchTenancies]);

  return {
    tenancies,
    rentIncreases,
    legalNotices,
    loading,
    addTenancy,
    endTenancy,
    updateTenancy,
    addRentIncrease,
    addLegalNotice,
    refetch: fetchTenancies,
  };
}
