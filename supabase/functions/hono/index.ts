import { Hono } from 'jsr:@hono/hono'
import { drizzle } from 'npm:drizzle-orm@^0.31.2/postgres-js'
import { users } from '../_shared/schema.ts'
import postgres from 'postgres';

const functionName = 'hono'
const app = new Hono().basePath(`/${functionName}`)
const connectionString = Deno.env.get('SUPABASE_DB_URL')!

app
  .get('/hello', (c) => c.text('Hello from hono-server!'))

  .get('/users', async (c) => {
      const client = postgres(connectionString, { prepare: false })
      const db = drizzle(client)
      const allUsers = await db.select().from(users)

      return c.json({message: false, allUsers})
  })

Deno.serve(app.fetch)