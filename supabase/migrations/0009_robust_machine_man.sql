ALTER TABLE "messages" RENAME COLUMN "id" TO "messageId";--> statement-breakpoint
ALTER TABLE "messages" DROP COLUMN IF EXISTS "chatroomId";