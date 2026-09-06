/*
  Warnings:

  - The values [ORGANIC,CHAI,COMMAND_CENTER,FUTURISTIC,OBSIDIAN,PRETTY_IN_PINK,SYSTEM] on the enum `Theme` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Theme_new" AS ENUM ('organic', 'chai', 'cyberpunk', 'futuristic', 'obsidian', 'pink');
ALTER TYPE "Theme" RENAME TO "Theme_old";
ALTER TYPE "Theme_new" RENAME TO "Theme";
DROP TYPE "public"."Theme_old";
COMMIT;
