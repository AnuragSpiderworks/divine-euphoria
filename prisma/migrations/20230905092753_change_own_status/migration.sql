/*
  Warnings:

  - The values [AGREEMENT_SIGNED,REGISTERED] on the enum `OwnershipStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OwnershipStatus_new" AS ENUM ('OWNER', 'SOLD');
ALTER TABLE "OwnedProperty" ALTER COLUMN "ownership_status" TYPE "OwnershipStatus_new" USING ("ownership_status"::text::"OwnershipStatus_new");
ALTER TYPE "OwnershipStatus" RENAME TO "OwnershipStatus_old";
ALTER TYPE "OwnershipStatus_new" RENAME TO "OwnershipStatus";
DROP TYPE "OwnershipStatus_old";
COMMIT;
