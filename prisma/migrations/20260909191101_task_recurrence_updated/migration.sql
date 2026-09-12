-- DropIndex
DROP INDEX "TaskRecurrence_nextRunAt_idx";

-- AlterTable
ALTER TABLE "TaskRecurrence" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastRunAt" TIMESTAMP(3);
