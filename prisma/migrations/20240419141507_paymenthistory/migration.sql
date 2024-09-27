/*
  Warnings:

  - You are about to drop the `PaymentGatewayHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PaymentGatewayHistory";

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);
