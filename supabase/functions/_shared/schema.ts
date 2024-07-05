import { pgTable, serial, text, bigint, boolean, integer, timestamp, uuid, pgEnum, date, real } from "npm:drizzle-orm@^0.31.2/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const genderEnum = pgEnum('gender', ['male', 'female', 'qm'])
export const pendidikanEnum = pgEnum('jenjangPendidikan', ['Siswa', 'Mahasiswa'])

export const users = pgTable('users', {
    uuid: text('uuid').$defaultFn(() => createId()).primaryKey().notNull(),
    username: text('name').notNull(),
    password: text('password').notNull(),
    address: text('address'),
    isMentor: boolean('isMentor').notNull().default(false),
    balance: bigint('balance', { mode: 'number' }).default(0),
    gender: genderEnum('gender').default('qm'),
    email: text('email'),
    birthDatePlace: text('birthDatePlace'),
    phoneNumber: text('phoneNumber'),
    jenjangPendidikan: pendidikanEnum('jenjangPendidikan'), // mentor also use this as 'target didik'
    rating: real('rating').default(0.0)
})