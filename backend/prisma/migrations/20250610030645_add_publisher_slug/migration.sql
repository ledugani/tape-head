/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Publisher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Publisher` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the slug column as nullable
ALTER TABLE "Publisher" ADD COLUMN "slug" TEXT;

-- Update existing records to have slugs based on their names
UPDATE "Publisher"
SET "slug" = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));

-- Make the slug column required and unique
ALTER TABLE "Publisher" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_slug_key" UNIQUE ("slug");
