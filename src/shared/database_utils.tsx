import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
const supabase = createClient(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
  `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
);

const table_name = "messages";

async function fetchData() {
  const { data, error } = await supabase.from(table_name).select("*");

  if (error) {
    console.error(error);
    return;
  }

  console.log(data);

  return data;
}

fetchData();

export default fetchData;
