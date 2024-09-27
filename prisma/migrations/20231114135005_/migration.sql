/*
  Warnings:

  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_member_id_fkey";

-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_property_id_fkey";

-- DropTable
DROP TABLE "Photo";

-- CreateTable
CREATE TABLE "GalleryPhoto" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "posted_user_id" BIGINT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL,
    "property_id" BIGINT,
    "filename" TEXT NOT NULL,

    CONSTRAINT "GalleryPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryPhoto" ADD CONSTRAINT "GalleryPhoto_posted_user_id_fkey" FOREIGN KEY ("posted_user_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
