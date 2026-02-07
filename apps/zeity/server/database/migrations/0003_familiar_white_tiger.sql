TRUNCATE TABLE "auth_otp";
ALTER TABLE "auth_otp" ADD COLUMN "type" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "user_account" ADD COLUMN "password" text;--> statement-breakpoint
CREATE INDEX "auth_otp_code_index" ON "auth_otp" USING btree ("code");--> statement-breakpoint
CREATE INDEX "auth_otp_type_index" ON "auth_otp" USING btree ("type");--> statement-breakpoint
ALTER TABLE "auth_otp" ADD CONSTRAINT "auth_otp_code_type_unique" UNIQUE("code","type");