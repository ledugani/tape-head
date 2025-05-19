-- AlterTable
ALTER TABLE "Tape" ADD COLUMN     "boxSetId" INTEGER;

-- CreateTable
CREATE TABLE "BoxSet" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "label" TEXT,
    "coverImage" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoxSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tape" ADD CONSTRAINT "Tape_boxSetId_fkey" FOREIGN KEY ("boxSetId") REFERENCES "BoxSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
