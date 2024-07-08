DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('student', 'mentor');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "isMentor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dateCreated" timestamp DEFAULT now() NOT NULL;