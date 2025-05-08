/*
  Warnings:

  - You are about to drop the column `vhsTapeId` on the `UserCollection` table. All the data in the column will be lost.
  - You are about to drop the column `vhsTapeId` on the `UserWantlist` table. All the data in the column will be lost.
  - You are about to drop the `VHSTape` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,tapeId]` on the table `UserCollection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,tapeId]` on the table `UserWantlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tapeId` to the `UserCollection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tapeId` to the `UserWantlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserCollection" DROP CONSTRAINT "UserCollection_vhsTapeId_fkey";

-- DropForeignKey
ALTER TABLE "UserWantlist" DROP CONSTRAINT "UserWantlist_vhsTapeId_fkey";

-- DropIndex
DROP INDEX "UserCollection_userId_vhsTapeId_key";

-- DropIndex
DROP INDEX "UserWantlist_userId_vhsTapeId_key";

-- AlterTable
ALTER TABLE "UserCollection" DROP COLUMN "vhsTapeId",
ADD COLUMN     "tapeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserWantlist" DROP COLUMN "vhsTapeId",
ADD COLUMN     "tapeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "VHSTape";

-- CreateTable
CREATE TABLE "Tape" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "genre" TEXT,
    "format" TEXT,
    "label" TEXT,
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tape_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCollection_userId_tapeId_key" ON "UserCollection"("userId", "tapeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWantlist_userId_tapeId_key" ON "UserWantlist"("userId", "tapeId");

-- AddForeignKey
ALTER TABLE "UserCollection" ADD CONSTRAINT "UserCollection_tapeId_fkey" FOREIGN KEY ("tapeId") REFERENCES "Tape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWantlist" ADD CONSTRAINT "UserWantlist_tapeId_fkey" FOREIGN KEY ("tapeId") REFERENCES "Tape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
