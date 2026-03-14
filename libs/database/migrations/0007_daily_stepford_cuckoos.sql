CREATE TABLE "task_assignment" (
	"task_id" uuid NOT NULL,
	"organisation_member_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_assignment_task_id_organisation_member_id_pk" PRIMARY KEY("task_id","organisation_member_id")
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"start" timestamp with time zone NOT NULL,
	"duration" integer,
	"project_id" uuid,
	"notes" text DEFAULT '' NOT NULL,
	"recurrence_frequency" varchar(40) DEFAULT 'once' NOT NULL,
	"recurrence_weekdays" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recurrence_day_of_month" integer,
	"recurrence_end" date,
	"organisation_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "time" ADD COLUMN "task_id" uuid;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_organisation_member_id_organisation_member_id_fk" FOREIGN KEY ("organisation_member_id") REFERENCES "public"."organisation_member"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task" ADD CONSTRAINT "task_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_assignment_organisation_member_id_index" ON "task_assignment" USING btree ("organisation_member_id");--> statement-breakpoint
CREATE INDEX "task_organisation_id_created_at_index" ON "task" USING btree ("organisation_id","created_at");--> statement-breakpoint
CREATE INDEX "task_organisation_id_recurrence_frequency_start_index" ON "task" USING btree ("organisation_id","recurrence_frequency","start");--> statement-breakpoint
CREATE INDEX "task_organisation_id_recurrence_frequency_recurrence_end_index" ON "task" USING btree ("organisation_id","recurrence_frequency","recurrence_end");--> statement-breakpoint
CREATE INDEX "task_organisation_id_recurrence_frequency_recurrence_day_of_month_recurrence_end_index" ON "task" USING btree ("organisation_id","recurrence_frequency","recurrence_day_of_month","recurrence_end");--> statement-breakpoint
ALTER TABLE "time" ADD CONSTRAINT "time_task_id_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task"("id") ON DELETE set null ON UPDATE no action;