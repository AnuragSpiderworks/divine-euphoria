/*
  Warnings:

  - You are about to drop the `PropertyOwner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "PropertyOwner" DROP CONSTRAINT "PropertyOwner_member_id_fkey";

-- DropTable
DROP TABLE "PropertyOwner";

-- CreateTable
CREATE TABLE "OwnedProperty" (
    "id" BIGSERIAL NOT NULL,
    "member_id" BIGINT NOT NULL,
    "property_id" BIGINT NOT NULL,
    "date_of_agreement" TIMESTAMP(3) NOT NULL,
    "date_of_registration" TIMESTAMP(3) NOT NULL,
    "ownership_status" "OwnershipStatus" NOT NULL,

    CONSTRAINT "OwnedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnedProperty_property_id_key" ON "OwnedProperty"("property_id");

-- AddForeignKey
ALTER TABLE "OwnedProperty" ADD CONSTRAINT "OwnedProperty_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedProperty" ADD CONSTRAINT "OwnedProperty_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
