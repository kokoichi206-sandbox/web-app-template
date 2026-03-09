// Valid cases - should NOT trigger the rule

// Supabase auth/storage APIs are allowed
const supabase = await createClient();
await supabase.auth.getSession();
supabase.storage.from("design-files").getPublicUrl("foo/bar.png");

// Non-supabase .from() calls are allowed
Array.from([1, 2, 3]);
Object.fromEntries([["key", "value"]]);
Buffer.from("hello");

// Non-Supabase REST calls are allowed
await fetch("https://example.com/api/users");

// Other objects with from()/rpc() methods are allowed
const queryBuilder = {
  from: (table) => table,
  rpc: (fn) => fn,
};
queryBuilder.from("users");
queryBuilder.rpc("refresh_stats");
