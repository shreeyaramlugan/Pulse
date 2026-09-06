/*
  Warnings:

  - You are about to drop the column `weekStartsOn` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WeekStart" AS ENUM ('SUNDAY', 'MONDAY');

-- CreateEnum
CREATE TYPE "NotificationPreference" AS ENUM ('ALL', 'IMPORTANT', 'NONE');

-- AlterEnum
ALTER TYPE "Theme" ADD VALUE 'SYSTEM';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "weekStartsOn",
ADD COLUMN     "notificationPreference" "NotificationPreference" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weekStart" "WeekStart" NOT NULL DEFAULT 'MONDAY',
ALTER COLUMN "theme" SET DEFAULT 'SYSTEM';
