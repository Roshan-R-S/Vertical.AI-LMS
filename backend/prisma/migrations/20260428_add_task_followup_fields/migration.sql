-- Add follow-up task fields to Task table
ALTER TABLE "tasks" ADD COLUMN "type" TEXT DEFAULT 'general';
ALTER TABLE "tasks" ADD COLUMN "followUpDateTo" TIMESTAMP(3);
ALTER TABLE "tasks" ADD COLUMN "followUpReason" TEXT;

-- Create index for follow-up tasks
CREATE INDEX "tasks_type_idx" ON "tasks"("type");
