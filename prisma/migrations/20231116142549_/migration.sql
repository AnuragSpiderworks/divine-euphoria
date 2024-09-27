-- CreateEnum
CREATE TYPE "GalleryPhotoStatus" AS ENUM ('NEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "GalleryPhoto" ADD COLUMN     "status" "GalleryPhotoStatus" NOT NULL DEFAULT 'NEW';
