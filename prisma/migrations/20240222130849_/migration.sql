/*
  Warnings:

  - You are about to drop the column `property_id` on the `Payment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_property_id_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "property_id";
