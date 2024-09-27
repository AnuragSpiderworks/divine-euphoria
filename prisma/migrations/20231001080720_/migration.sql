/*
  Warnings:

  - You are about to drop the column `is_active` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "is_active",
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
