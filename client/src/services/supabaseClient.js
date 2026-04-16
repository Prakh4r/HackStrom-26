import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eocxfspldytehiwdajic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY3hmc3BsZHl0ZWhpd2RhamljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTcyMjAsImV4cCI6MjA5MTg5MzIyMH0.9yqRSDGDQX72qa0DDv5_Bbl2y6AW1GpfwMuaupJcz0k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
