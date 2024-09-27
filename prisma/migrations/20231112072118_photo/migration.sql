/*
  Warnings:

  - You are about to drop the `PropertyPhoto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PropertyPhoto" DROP CONSTRAINT "PropertyPhoto_property_id_fkey";

-- DropTable
DROP TABLE "PropertyPhoto";

-- CreateTable
CREATE TABLE "Photo" (
    "id" BIGSERIAL NOT NULL,
    "property_id" BIGINT,
    "filename" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
