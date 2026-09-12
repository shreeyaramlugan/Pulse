-- CreateEnum
CREATE TYPE "GoalPeriod" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "GoalProgressType" AS ENUM ('MANUAL', 'METRIC', 'SUBGOALS');

-- CreateEnum
CREATE TYPE "GoalMetricType" AS ENUM ('NUMBER', 'CURRENCY', 'PERCENTAGE', 'HOURS', 'MINUTES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalMetricDirection" AS ENUM ('INCREASE', 'DECREASE');

-- DropIndex
DROP INDEX "Goal_targetDate_idx";

-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "currentValue" DECIMAL(14,2),
ADD COLUMN     "metricDirection" "GoalMetricDirection" NOT NULL DEFAULT 'INCREASE',
ADD COLUMN     "metricName" TEXT,
ADD COLUMN     "metricType" "GoalMetricType",
ADD COLUMN     "parentGoalId" TEXT,
ADD COLUMN     "period" "GoalPeriod" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "progressType" "GoalProgressType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "startValue" DECIMAL(14,2),
ADD COLUMN     "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "targetValue" DECIMAL(14,2),
ADD COLUMN     "unit" TEXT;

-- CreateTable
CREATE TABLE "GoalProgressEntry" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "value" DECIMAL(14,2) NOT NULL,
    "note" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalProgressEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalProgressEntry_goalId_idx" ON "GoalProgressEntry"("goalId");

-- CreateIndex
CREATE INDEX "GoalProgressEntry_goalId_recordedAt_idx" ON "GoalProgressEntry"("goalId", "recordedAt");

-- CreateIndex
CREATE INDEX "Goal_userId_period_idx" ON "Goal"("userId", "period");

-- CreateIndex
CREATE INDEX "Goal_userId_status_idx" ON "Goal"("userId", "status");

-- CreateIndex
CREATE INDEX "Goal_userId_targetDate_idx" ON "Goal"("userId", "targetDate");

-- CreateIndex
CREATE INDEX "Goal_parentGoalId_idx" ON "Goal"("parentGoalId");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_parentGoalId_fkey" FOREIGN KEY ("parentGoalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalProgressEntry" ADD CONSTRAINT "GoalProgressEntry_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
