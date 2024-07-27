import { pgTable, serial, text, bigint, boolean, integer, timestamp, pgEnum, date, real } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const genderEnum = pgEnum('gender', ['male', 'female', 'qm'])
export const pendidikanEnum = pgEnum('jenjangPendidikan', ['Siswa', 'Mahasiswa'])
export const roleEnum = pgEnum('role', ['student', 'mentor', 'admin'])

export const users = pgTable('users', {
    uuid: text('uuid').$defaultFn(() => createId()).primaryKey().notNull(),
    username: text('name').notNull(),
    password: text('password').notNull(),
    address: text('address'),
    balance: bigint('balance', { mode: 'number' }).default(0),
    gender: genderEnum('gender').default('qm'),
    email: text('email'),
    birthDatePlace: text('birthDatePlace'),
    phoneNumber: text('phoneNumber'),
    jenjangPendidikan: pendidikanEnum('jenjangPendidikan'), // mentor also use this as 'target didik'
    rating: real('rating').default(0.0),
    role: roleEnum('role'),
    dateCreated: timestamp('dateCreated').notNull().defaultNow(),
    accountIsChecked: boolean('accountIsChecked').default(false)
})

export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    mentorUsername: text('mentorUsername').notNull(),
    userId: text('userId').notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    consultationType: text('consultationType').notNull(),
    consultationDuration: text('consultationDuration').notNull(),
    // consultationFee: bigint('consultationFee', { mode: 'number' }).notNull(),
    // appFee: bigint('appFee', { mode: 'number' }).notNull(),
    total: bigint('total', { mode: 'number' }).notNull(),
})

export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    chatroomId: text('chatroomId').notNull(), // dibuat dari userId + mentorId
    mentorUsername: text('mentorUsername').notNull(),
    studentUsername: text('studentUsername').notNull(),
    mentorId:text('mentorId').notNull(),
    userId: text('userId').notNull(),
    lastMsg: text('lastMsg').default('')
})

export const messages = pgTable('messages', {
    messageId: serial('messageId').primaryKey().notNull(),
    chatroomId: text('chatroomId').notNull(), //dibuat dari userId + mentorId
    senderId: text('senderId').notNull(),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    message: text('message').notNull(),
})