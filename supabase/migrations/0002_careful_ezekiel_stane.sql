CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentorUsername" text NOT NULL,
	"userId" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"consultationType" text NOT NULL,
	"consultationDuration" text NOT NULL,
	"consultationFee" bigint NOT NULL,
	"appFee" bigint NOT NULL,
	"total" bigint NOT NULL
);
