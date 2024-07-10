CREATE TABLE IF NOT EXISTS "chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentorUsername" text NOT NULL,
	"mentorId" text NOT NULL,
	"userId" text NOT NULL,
	"lastMsg" text DEFAULT ''
);
