/*
  Warnings:

  - You are about to drop the column `onboardingCompleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weekStart` on the `User` table. All the data in the column will be lost.
  - The `theme` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `notificationPreference` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboardingCompleted",
DROP COLUMN "weekStart",
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
DROP COLUMN "theme",
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'SYSTEM',
DROP COLUMN "notificationPreference",
ADD COLUMN     "notificationPreference" TEXT NOT NULL DEFAULT 'ALL';
