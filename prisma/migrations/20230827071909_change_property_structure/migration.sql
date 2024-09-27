/*
  Warnings:

  - You are about to drop the column `current_owner_id` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `property_id` on the `PropertyOwner` table. All the data in the column will be lost.
  - Added the required column `owner_id` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_current_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "PropertyOwner" DROP CONSTRAINT "PropertyOwner_property_id_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "current_owner_id",
ADD COLUMN     "owner_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "PropertyOwner" DROP COLUMN "property_id";

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "PropertyOwner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
