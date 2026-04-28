import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtseGVweGRla2duZnlhenFzeXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyOTA5MTAsImV4cCI6MjA2MDg2NjkxMH0.zFoE0-Z7GIOs47dkZmXTNMjQb4cFtAP3Gk1oiZXIm3o";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});