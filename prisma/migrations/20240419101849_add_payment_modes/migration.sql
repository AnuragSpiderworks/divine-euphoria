-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMode" ADD VALUE 'PAY_PAGE';
ALTER TYPE "PaymentMode" ADD VALUE 'CARD';
ALTER TYPE "PaymentMode" ADD VALUE 'UPI_INTENT';
ALTER TYPE "PaymentMode" ADD VALUE 'SAVED_CARD';
ALTER TYPE "PaymentMode" ADD VALUE 'TOKEN';
ALTER TYPE "PaymentMode" ADD VALUE 'UPI_COLLECT';
ALTER TYPE "PaymentMode" ADD VALUE 'UPI_QR';
ALTER TYPE "PaymentMode" ADD VALUE 'NET_BANKING';
ALTER TYPE "PaymentMode" ADD VALUE 'NETBANKING';
