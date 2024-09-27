-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "transaction_id" TEXT;

-- CreateTable
CREATE TABLE "PaymentGatewayHistory" (
    "id" BIGSERIAL NOT NULL,
    "payment_id" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentGatewayHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" BIGSERIAL NOT NULL,
    "target_member_id" BIGINT NOT NULL,
    "posted_member_id" BIGINT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_target_member_id_fkey" FOREIGN KEY ("target_member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_posted_member_id_fkey" FOREIGN KEY ("posted_member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
