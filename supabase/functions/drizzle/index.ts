import { drizzle } from 'npm:drizzle-orm@^0.31.2/postgres-js'
import postgres from 'postgres'
import { users } from '../_shared/schema.ts'

const connectionString = Deno.env.get('SUPABASE_DB_URL')!

Deno.serve(async (_req) => {
  // Disable prefetch as it is not supported for "Transaction" pool mode 
  const client = postgres(connectionString, { prepare: false })
  const db = drizzle(client);
  const allUsers = await db.select().from(users);

  return new Response(
    JSON.stringify(allUsers),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/drizzle' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
