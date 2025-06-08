/*
  Warnings:

  - A unique constraint covering the columns `[title,year]` on the table `Tape` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,tapeId]` on the table `UserCollection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Tape_title_year_key" ON "Tape"("title", "year");

-- CreateIndex
CREATE UNIQUE INDEX "UserCollection_userId_tapeId_key" ON "UserCollection"("userId", "tapeId");
