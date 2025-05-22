/*
  Warnings:

  - The primary key for the `UserWantlist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `UserWantlist` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserWantlist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserWantlist" DROP CONSTRAINT "UserWantlist_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "priority" DROP NOT NULL,
ALTER COLUMN "priority" DROP DEFAULT,
ADD CONSTRAINT "UserWantlist_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserWantlist_id_seq";
