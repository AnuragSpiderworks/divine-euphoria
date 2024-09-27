/*
  Warnings:

  - You are about to drop the column `invoice_type_id` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the `InvoiceType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DELETED', 'ACTIVE');

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_invoice_type_id_fkey";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "invoice_type_id",
ADD COLUMN     "category_id" BIGINT NOT NULL,
ADD COLUMN     "rate" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "InvoiceType";

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('PER_MEMBER', 'PER_USER');

-- CreateTable
CREATE TABLE "InvoiceCategory" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InvoiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceGeneration" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "creator_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL,

    CONSTRAINT "InvoiceGeneration_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "InvoiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceGeneration" ADD CONSTRAINT "InvoiceGeneration_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "InvoiceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceGeneration" ADD CONSTRAINT "InvoiceGeneration_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
