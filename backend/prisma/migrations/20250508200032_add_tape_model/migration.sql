/*
  Warnings:

  - The primary key for the `Tape` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `Tape` table. All the data in the column will be lost.
  - The `id` column on the `Tape` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `tapeId` on the `UserCollection` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tapeId` on the `UserWantlist` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "UserCollection" DROP CONSTRAINT "UserCollection_tapeId_fkey";

-- DropForeignKey
ALTER TABLE "UserWantlist" DROP CONSTRAINT "UserWantlist_tapeId_fkey";

-- AlterTable
ALTER TABLE "Tape" DROP CONSTRAINT "Tape_pkey",
DROP COLUMN "updatedAt",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Tape_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserCollection" DROP COLUMN "tapeId",
ADD COLUMN     "tapeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserWantlist" DROP COLUMN "tapeId",
ADD COLUMN     "tapeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserCollection_userId_tapeId_key" ON "UserCollection"("userId", "tapeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserWantlist_userId_tapeId_key" ON "UserWantlist"("userId", "tapeId");

-- AddForeignKey
ALTER TABLE "UserCollection" ADD CONSTRAINT "UserCollection_tapeId_fkey" FOREIGN KEY ("tapeId") REFERENCES "Tape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWantlist" ADD CONSTRAINT "UserWantlist_tapeId_fkey" FOREIGN KEY ("tapeId") REFERENCES "Tape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
