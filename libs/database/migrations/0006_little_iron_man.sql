ALTER TABLE "project" DROP CONSTRAINT "project_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;