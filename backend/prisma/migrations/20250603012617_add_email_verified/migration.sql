-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT true;

-- Update existing users to have emailVerified set to true
UPDATE "User" SET "emailVerified" = true;
