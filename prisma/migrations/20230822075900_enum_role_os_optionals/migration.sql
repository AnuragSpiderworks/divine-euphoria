/*
  Warnings:

  - Changed the type of `ownership_status` on the `PropertyOwner` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('NEW_REG', 'INACTIVE', 'ACTIVE', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "OwnershipStatus" AS ENUM ('AGREEMENT_SIGNED', 'REGISTERED', 'SOLD');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'NEW_REG',
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PropertyOwner" DROP COLUMN "ownership_status",
ADD COLUMN     "ownership_status" "OwnershipStatus" NOT NULL;
