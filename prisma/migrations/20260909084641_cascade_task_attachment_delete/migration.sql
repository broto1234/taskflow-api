-- DropForeignKey
ALTER TABLE "TaskAttachment" DROP CONSTRAINT "TaskAttachment_taskId_fkey";

-- AddForeignKey
ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
