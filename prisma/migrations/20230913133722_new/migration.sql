-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'VERIFIED';

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "membership_number" BIGINT;
