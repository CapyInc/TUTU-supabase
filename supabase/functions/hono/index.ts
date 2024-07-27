import { Hono } from 'jsr:@hono/hono'
import { drizzle } from 'npm:drizzle-orm@^0.31.2/postgres-js'
import { users, orders, chats, messages } from '../_shared/schema.ts'
import postgres from 'postgres';
import { DB_URL } from '../_shared/config.ts'
import { PgTable } from 'npm:drizzle-orm@^0.31.2/pg-core'
import { compare, hash } from 'npm:bcrypt-ts@^5.0.2'
import { and, eq, ilike } from 'npm:drizzle-orm@^0.31.2';

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
			const { username, password, birthDatePlace, email, phoneNumber, jenjangPendidikan, role } = body

			// check first if the username already exists
			const usernametocheck: string = username.toString()
			const existingUsername = await db.select({ username: users.username }).from(users).where(eq(users.username, usernametocheck))
			if (existingUsername.length > 0) {
				return c.json({message: 'username sudah diambil orang'}, 500)
			}

			const hashedPassword = await hash(password.toString(), 10)

			const insertedUser = await db.insert<PgTable>(users).values({ username, password: hashedPassword, birthDatePlace, email, phoneNumber, jenjangPendidikan, role }).returning()

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

	// to update userIsChecked
	.patch('mentor/:mentorId', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const mentorIdParam: string = c.req.param('mentorId')

			const updatedMentor = await db.update<PgTable>(users).set({ accountIsChecked: true }).where(eq(users.uuid, mentorIdParam)).returning()
			
			if (updatedMentor.length > 0) {
				return c.json({ error: false, message: 'Success' })
			} else {
				return c.json({ error: true, message: 'Failed to update' }, 500)
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

			return c.json({ error: false, message: "Ok", result: mentors })
		} catch (error) {
			console.log(error)
		}
	})

	// get all mentors to check
	.get('mentors_to_check', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const mentors = await db.select({ username: users.username, mentorId: users.uuid }).from(users).where(and(eq(users.role, "mentor"), eq(users.accountIsChecked, false)))

			return c.json({ error: false, message: "Ok", result: mentors })
		} catch (error) {
			console.log(error)
		}
	})

	// search mentor
	.get('mentors/search', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const username = c.req.query('username')

			const search = await db
				.select({ username: users.username, mentorId: users.uuid, rating: users.rating })
				.from(users)
				.where(and(eq(users.role, "mentor"), ilike(users.username, `${username}%`)))

			if (search.length == 0) {
				return c.json({ error: false, message: "Not Found" })
			}			
			return c.json({ error: false, message: "Ok", result: search })
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
			const { mentorUsername, userId, consultationType, consultationDuration, total } = body

			// const appFee = 5000
			// let consultationFee = 0

			// switch (consultationType) {
			// 	case 'Via Chat':
			// 		consultationFee = 5000
			// 		break;
				
			// 	case 'Via Zoom + Chat':
			// 		consultationFee = 10000
			// 		break;

			// 	default:
			// 		break;
			// }

			// switch (consultationDuration) {
			// 	case '15 menit':
			// 		consultationFee += 2000
			// 		break;
			
			// 	case '30 menit':
			// 		consultationFee += 4000
			// 		break;

			// 	case '1 jam':
			// 		consultationFee += 6000
			// 		break;

			// 	case '2 jam':
			// 		consultationFee += 8000
			// 		break;

			// 	default:
			// 		break;
			// }

			// const total = consultationFee + appFee

			const insertOrder = await db.insert<PgTable>(orders).values({ mentorUsername, userId, consultationType, consultationDuration, total }).returning()

			if (insertOrder.length > 0) {
				return c.json({ error: false, message: 'Success' })
			} else {
				return c.json({ error: true, message: 'Failed to place order' }, 500)
			}
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


	// create chat (dipanggil di halaman more di history pembelian atau bisa juga langsung setelah melakukan pembayaran)
	.post('chats', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const body = await c.req.parseBody()
			const { studentUsername, mentorUsername, mentorId, userId } = body

			// check first if mentor username already inserted
			const roomIdToCheck: string = mentorId.toString() + userId.toString()
			const existingRoom = await db.select({ roomId: chats.chatroomId }).from(chats).where(eq(chats.chatroomId, roomIdToCheck))
			if (existingRoom.length > 0) {
				return c.json({ error: true, message: 'chat alr created', chatroomId: roomIdToCheck })
			}

			const chatroomId = roomIdToCheck

			const insertedchats = await db.insert<PgTable>(chats).values({ studentUsername, mentorUsername, mentorId, userId, chatroomId }).returning()

			if (insertedchats.length > 0) {
				return c.json({ error: false, message: "Success", chatroomId: insertedchats[0].chatroomId })
			} else {
				return c.json({ error: true, message: "Failed to create chat" }, 500)
			}

		} catch (error) {
			console.log(error)
		}
	})

	//get chats (yg dipake di page messages)
	.get('chats/:userId', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const userIdParam: string = c.req.param('userId')

			const userChats = await db.select().from(chats).where(eq(chats.userId, userIdParam))

			return c.json({ error: false, message: 'Success', chats: userChats })

		} catch (error) {
			console.log(error)
		}
	})

	// untuk mentor
	.get('chats/mentor/:mentorId', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const mentorIdParam: string = c.req.param('mentorId')

			const userChats = await db.select().from(chats).where(eq(chats.mentorId, mentorIdParam))

			return c.json({ error: false, message: 'Success', chats: userChats })

		} catch (error) {
			console.log(error)
		}
	})

	.post('message', async (c) => {
		try {
			const client = postgres(connectionString, { prepare: false })
			const db = drizzle(client)
			const body = await c.req.parseBody()
			const { roomId, message, senderId } = body

			const insertMessage = await db.insert<PgTable>(messages).values({ chatroomId: roomId, senderId ,message }).returning()

			if (insertMessage.length > 0) {
				return c.json({ error: false, message: 'Message Inserted' })
			} else {
				return c.json({ error: true, message: "Failed to insert message" }, 500)
			}
		} catch (error) {
			console.log(error)
		}
	})

Deno.serve(app.fetch)