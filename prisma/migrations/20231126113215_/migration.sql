-- CreateTable
CREATE TABLE "PaymentNotification" (
    "id" BIGSERIAL NOT NULL,
    "target_member_id" BIGINT NOT NULL,
    "posted_member_id" BIGINT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "custom_message" TEXT,

    CONSTRAINT "PaymentNotification_pkey" PRIMARY KEY ("id")
);
