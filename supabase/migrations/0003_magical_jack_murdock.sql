CREATE TABLE IF NOT EXISTS "messages" (
	"chatroomId" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"message" text NOT NULL
);
