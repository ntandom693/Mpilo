import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hdvlvbxcwomeskqbhjmv.supabase.co";
const supabaseKey = "sb_publishable_D9aYccidAGhkhkkk1YdJ8A_mtWPetpR";

export const supabase = createClient(supabaseUrl, supabaseKey);