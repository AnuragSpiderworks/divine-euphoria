-- CreateEnum
CREATE TYPE "ForSaleStatus" AS ENUM ('NOT_AVAILABLE', 'FOR_SALE', 'FOR_RENT');

-- CreateTable
CREATE TABLE "ForSalePost" (
    "id" BIGSERIAL NOT NULL,
    "owned_property_id" BIGINT NOT NULL,
    "posted_member_id" BIGINT NOT NULL,
    "posted_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL(65,30) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ForSaleStatus" NOT NULL,

    CONSTRAINT "ForSalePost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ForSalePost" ADD CONSTRAINT "ForSalePost_owned_property_id_fkey" FOREIGN KEY ("owned_property_id") REFERENCES "OwnedProperty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForSalePost" ADD CONSTRAINT "ForSalePost_posted_member_id_fkey" FOREIGN KEY ("posted_member_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
