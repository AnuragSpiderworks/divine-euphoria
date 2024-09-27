/*
  Warnings:

  - The values [PER_USER] on the enum `InvoiceType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceType_new" AS ENUM ('PER_MEMBER', 'PER_PROPERTY');
ALTER TABLE "InvoiceGeneration" ALTER COLUMN "type" TYPE "InvoiceType_new" USING ("type"::text::"InvoiceType_new");
ALTER TYPE "InvoiceType" RENAME TO "InvoiceType_old";
ALTER TYPE "InvoiceType_new" RENAME TO "InvoiceType";
DROP TYPE "InvoiceType_old";
COMMIT;
