import { Hono } from 'jsr:@hono/hono'
import { drizzle } from 'npm:drizzle-orm@^0.31.2/postgres-js'
import { users, orders } from '../_shared/schema.ts'
import postgres from 'postgres';
import { DB_URL } from '../_shared/config.ts'
import { PgTable } from 'npm:drizzle-orm@^0.31.2/pg-core'
import { compare, hash } from 'npm:bcrypt-ts@^5.0.2'
import { eq } from 'npm:drizzle-orm@^0.31.2';

const functionName = 'hono'
const app = new Hono().basePath(`/${functionName}`)

// const connectionString = Deno.env.get("SUPABASE_DB_URL")!
const connectionString = DB_URL
console.log(connectionString)

app
  .get('/users', async (c) => {
      const client = postgres(connectionString, { prepare: false })
      const db = drizzle(client)
      const allUsers = await db.select().from(users)

      return c.json({message: false, allUsers})
  })

  .get('user/:userId', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const userIdParam = c.req.param('userId')

			const getUserDetails = await db.select().from(users).where(eq(users.uuid, userIdParam))
	
			return c.json({ error: false, userDetails: getUserDetails })
		} catch (error) {
			console.log(error)
		}
	})

	.post('register', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const body = await c.req.parseBody()
			const { username, password, birthDatePlace, email, phoneNumber, jenjangPendidikan, isMentor, role } = body

			// check first if the username already exists
			const usernametocheck: string = username.toString()
			const existingUsername = await db.select({ username: users.username }).from(users).where(eq(users.username, usernametocheck))
			if (existingUsername.length > 0) {
				return c.json({message: 'username sudah diambil orang'}, 500)
			}

			const hashedPassword = await hash(password.toString(), 10)

			const insertedUser = await db.insert<PgTable>(users).values({ username, password: hashedPassword, birthDatePlace, email, phoneNumber, jenjangPendidikan, isMentor, role }).returning()

			if (insertedUser.length > 0) {
				return c.json({ error: false, message: "User created successfully" })
			} else {
				return c.json({ error: true, message: "Failed to create user" }, 500)
			}

		} catch (error) {
			console.log(error)
		}
	})

	.post('login', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const body = await c.req.parseBody()
			const { username, password } = body

			// find the user by username
			const user = await db.select().from(users).where(eq(users.username, username.toString()))

			if (!user) {
				return c.json({ error: false, message: "Invalid username or password" }, 401)
			}

			//compare the provided password with the stored password
			const isPasswordValid = await compare(password.toString(), user[0].password)

			if (!isPasswordValid) {
				return c.json({ error: true, message: 'Invalid username or password' }, 401)
			}
	
			// Password is valid, return user data or generate a token
			return c.json({ error: false, message: 'Login successful', loginResult: user })


		} catch (error) {
			console.log(error)
		}
	})

	
	.patch('user/:userId', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const userIdParam: string = c.req.param('userId')
			const body = await c.req.parseBody()
			const { username, password, birthDatePlace, email, phoneNumber, jenjangPendidikan } = body

			// TODO: Must check the username is alr taken or no

			const hashedPassword = await hash(password.toString(), 10)

			const updatedUser = await db.update<PgTable>(users).set({username, password: hashedPassword, birthDatePlace, email, phoneNumber, jenjangPendidikan}).where(eq(users.uuid, userIdParam)).returning()

			if (updatedUser.length > 0) {
				return c.json({ error: false, message: 'User updated' })
			} else {
				return c.json({ error: true, message: 'Failed to update user profiles' }, 500)
			}
		} catch (error) {
			console.log(error)
		}
	})

	// get all user that is mentor
	.get('mentors', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const mentors = await db.select({ username: users.username, mentorId: users.uuid, rating: users.rating }).from(users).where(eq(users.role, "mentor"))

			return c.json({ error: false, mentors })
		} catch (error) {
			console.log(error)
		}
	})

	// orders
	.post('order', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const body = await c.req.parseBody()
			const { mentorUsername, userId, consultationType, consultationDuration } = body

			const appFee = 5000
			let consultationFee = 0

			switch (consultationType) {
				case 'Via Chat':
					consultationFee = 5000
					break;
				
				case 'Via Zoom + Chat':
					consultationFee = 10000
					break;

				default:
					break;
			}

			switch (consultationDuration) {
				case '15 menit':
					consultationFee += 2000
					break;
			
				case '30 menit':
					consultationFee += 4000
					break;

				case '1 jam':
					consultationFee += 6000
					break;

				case '2 jam':
					consultationFee += 8000
					break;

				default:
					break;
			}

			const total = consultationFee + appFee

			const insertOrder = await db.insert<PgTable>(orders).values({ mentorUsername, userId, consultationType, consultationDuration, appFee, consultationFee, total }).returning()

			return c.json({ error: false, insertOrder })

		} catch (error) {
			console.log(error)
		}
	})

	// get orders by user
	.get('orders/:userId', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const userIdParam: string = c.req.param('userId')

			const getUserOrders = await db.select().from(orders).where(eq(orders.userId, userIdParam))

			return c.json({ error: false, getUserOrders })
		} catch (error) {
			console.log(error)
		}
	})

Deno.serve(app.fetch)