ALTER TABLE "organisation_member" DROP CONSTRAINT "organisation_member_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "organisation_member" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "time" ADD COLUMN "organisation_member_id" uuid;--> statement-breakpoint
ALTER TABLE "organisation_member" ADD CONSTRAINT "organisation_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time" ADD CONSTRAINT "time_organisation_member_id_organisation_member_id_fk" FOREIGN KEY ("organisation_member_id") REFERENCES "public"."organisation_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- migrate time.organisation_id and time.user_id to time.organisation_member_id
UPDATE "time" t
SET organisation_member_id = om.id
FROM "organisation_member" om
WHERE t.organisation_id = om.organisation_id AND t.user_id = om.user_id;

ALTER TABLE "time" DROP CONSTRAINT "time_organisation_id_organisation_id_fk";
--> statement-breakpoint
ALTER TABLE "time" DROP CONSTRAINT "time_user_id_user_id_fk";
--> statement-breakpoint

ALTER TABLE "time" DROP COLUMN "organisation_id";--> statement-breakpoint
ALTER TABLE "time" DROP COLUMN "user_id";