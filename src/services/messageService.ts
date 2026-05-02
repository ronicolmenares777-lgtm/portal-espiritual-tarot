import { supabase } from "@/integrations/supabase/client";

export const messageService = {
  async getMessagesByLeadId(leadId: string) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(leadId: string, text: string, isFromMaestro: boolean) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        lead_id: leadId,
        text,
        is_from_maestro: isFromMaestro,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("id", messageId);

    if (error) throw error;
  },

  async getUnreadCount(leadId: string) {
    const { count, error } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("lead_id", leadId)
      .eq("is_read", false)
      .eq("is_from_maestro", false);

    if (error) throw error;
    return count || 0;
  },
};