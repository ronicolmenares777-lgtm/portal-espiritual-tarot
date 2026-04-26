import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = "https://klxepxdekgnfyazqsytk.supabase.co";
const supabaseAnonKey = "sb_publishable_jIyS389v3xsh1fIkvmpNFw_Lhx_AoXD";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});