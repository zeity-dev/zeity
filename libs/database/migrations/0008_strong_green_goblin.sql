CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"action" varchar(40) NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"organisation_id" uuid NOT NULL,
	"organisation_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organisation_member_id_organisation_member_id_fk" FOREIGN KEY ("organisation_member_id") REFERENCES "public"."organisation_member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_entity_id_created_at_index" ON "audit_log" USING btree ("entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_organisation_id_entity_type_created_at_index" ON "audit_log" USING btree ("organisation_id","entity_type","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_organisation_member_id_created_at_index" ON "audit_log" USING btree ("organisation_member_id","created_at");