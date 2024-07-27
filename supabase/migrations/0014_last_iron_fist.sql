ALTER TABLE "users" ADD COLUMN "accountIsChecked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "isMentor";