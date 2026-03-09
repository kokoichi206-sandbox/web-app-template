// Invalid cases - SHOULD trigger the rule

const supabase = await createClient();
await supabase.from("users");

(await createClient()).rpc("refresh_stats");

await fetch("https://example.supabase.co/rest/v1/users?select=*");

await fetch(new URL("https://example.supabase.co/rest/v1/projects?select=id"));
