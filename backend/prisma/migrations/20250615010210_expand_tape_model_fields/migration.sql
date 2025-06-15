/*
  Warnings:

  - Added the required column `audioType` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `catalogNumber` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distributor` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packagingType` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productionCompany` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseYear` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `runningTime` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `upcBarcode` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vhsReleaseYear` to the `Tape` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoStandard` to the `Tape` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VideoStandard" AS ENUM ('NTSC', 'PAL', 'SECAM', 'Other');

-- CreateEnum
CREATE TYPE "PackagingType" AS ENUM ('slipcase', 'clamshell', 'big_box', 'other');

-- AlterTable
ALTER TABLE "Tape" ADD COLUMN     "audioType" TEXT NOT NULL,
ADD COLUMN     "catalogNumber" TEXT NOT NULL,
ADD COLUMN     "distributor" TEXT NOT NULL,
ADD COLUMN     "edition" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "packagingType" "PackagingType" NOT NULL,
ADD COLUMN     "physicalCondition" TEXT,
ADD COLUMN     "productionCompany" TEXT NOT NULL,
ADD COLUMN     "rating" TEXT NOT NULL,
ADD COLUMN     "releaseYear" INTEGER NOT NULL,
ADD COLUMN     "runningTime" INTEGER NOT NULL,
ADD COLUMN     "specialFeatures" TEXT,
ADD COLUMN     "subtitles" TEXT[],
ADD COLUMN     "upcBarcode" TEXT NOT NULL,
ADD COLUMN     "vhsReleaseYear" INTEGER NOT NULL,
ADD COLUMN     "videoStandard" "VideoStandard" NOT NULL;
