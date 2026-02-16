import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  issue_type: string;
  description: string;
  priority: string;
  status: string;
  photo_urls: string[];
  remedial_deadline: string | null;
  resolved_at: string | null;
  reported_at: string;
  updated_at: string;
}

export interface CommunicationLog {
  id: string;
  property_id: string;
  tenant_name: string;
  method: string;
  summary: string;
  related_request_id: string | null;
  logged_at: string;
}

export function useMaintenance(propertyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [commsLogs, setCommsLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user || !propertyId) return;
    setLoading(true);
    try {
      const [reqRes, commsRes] = await Promise.all([
        supabase.from("maintenance_requests").select("*").eq("property_id", propertyId).eq("user_id", user.id).order("reported_at", { ascending: false }),
        supabase.from("communication_logs").select("*").eq("property_id", propertyId).eq("user_id", user.id).order("logged_at", { ascending: false }),
      ]);
      if (reqRes.error) throw reqRes.error;
      if (commsRes.error) throw commsRes.error;
      setRequests((reqRes.data as MaintenanceRequest[]) || []);
      setCommsLogs((commsRes.data as CommunicationLog[]) || []);
    } catch (err: any) {
      toast({ title: "Error loading maintenance data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, propertyId, toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addRequest = useCallback(async (data: {
    issue_type: string;
    description: string;
    priority: string;
    photo_urls?: string[];
    remedial_deadline?: string;
  }) => {
    if (!user || !propertyId) return;
    const { error } = await supabase.from("maintenance_requests").insert({
      property_id: propertyId,
      user_id: user.id,
      ...data,
      photo_urls: data.photo_urls || [],
    });
    if (error) {
      toast({ title: "Failed to report issue", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Issue reported" });
    fetchAll();
  }, [user, propertyId, toast, fetchAll]);

  const updateRequestStatus = useCallback(async (id: string, status: string) => {
    const update: any = { status };
    if (status === "resolved") update.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("maintenance_requests").update(update).eq("id", id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Status updated to ${status}` });
    fetchAll();
  }, [toast, fetchAll]);

  const addCommsLog = useCallback(async (data: {
    tenant_name: string;
    method: string;
    summary: string;
    related_request_id?: string;
  }) => {
    if (!user || !propertyId) return;
    const { error } = await supabase.from("communication_logs").insert({
      property_id: propertyId,
      user_id: user.id,
      ...data,
    });
    if (error) {
      toast({ title: "Failed to log communication", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Communication logged" });
    fetchAll();
  }, [user, propertyId, toast, fetchAll]);

  return { requests, commsLogs, loading, addRequest, updateRequestStatus, addCommsLog, refetch: fetchAll };
}
