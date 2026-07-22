CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" varchar DEFAULT 'en' NOT NULL,
	"open_time_details_on_start" boolean DEFAULT false NOT NULL,
	"open_time_details_on_stop" boolean DEFAULT false NOT NULL,
	"calculate_breaks" boolean DEFAULT false NOT NULL,
	"round_times" boolean DEFAULT false NOT NULL,
	"theme_color" varchar DEFAULT 'sky' NOT NULL,
	"theme_mode" varchar DEFAULT 'system' NOT NULL,
	"user_id" uuid NOT NULL,
	"organisation_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_id_organisation_id_index" ON "user_settings" USING btree ("user_id","organisation_id");