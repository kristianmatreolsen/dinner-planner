import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yparzixzlngulxwecwsg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VHMBsISuOrtpL51n7Zm6GQ_BmcMQ7mY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);