CREATE TABLE "deposits" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL
);
