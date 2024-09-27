-- AlterTable
ALTER TABLE "InvoiceGeneration" ALTER COLUMN "remarks" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "reference" DROP NOT NULL;
