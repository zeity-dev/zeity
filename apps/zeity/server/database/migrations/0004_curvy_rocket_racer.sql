CREATE TABLE "organisation_join_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organisation_join_request" ADD CONSTRAINT "organisation_join_request_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_join_request" ADD CONSTRAINT "organisation_join_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organisation_join_request_status_index" ON "organisation_join_request" USING btree ("status");