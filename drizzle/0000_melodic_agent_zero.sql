CREATE TABLE "clicks" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clicks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"link_id" bigint NOT NULL,
	"clicked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"referrer" text,
	"user_agent" text,
	"ip_hash" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "links_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"short_code" varchar(16) NOT NULL,
	"original_url" text NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clicks_link_id_idx" ON "clicks" USING btree ("link_id");--> statement-breakpoint
CREATE UNIQUE INDEX "links_short_code_idx" ON "links" USING btree ("short_code");