import { createClient } from "@supabase/supabase-js";

// To be used on the backend only
export const SUPABASE_ADMIN = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ADMIN_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const createServerClient = () =>
  createServerComponentClient({ cookies });
