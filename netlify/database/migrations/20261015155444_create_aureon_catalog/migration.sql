CREATE TABLE "entries" (
	"id" text PRIMARY KEY,
	"kind" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"title" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" text PRIMARY KEY,
	"kind" text NOT NULL,
	"data" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
