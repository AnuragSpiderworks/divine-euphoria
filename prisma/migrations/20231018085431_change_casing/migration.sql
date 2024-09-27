/*
  Warnings:

  - You are about to drop the column `newValue` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `oldValue` on the `AuditLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "newValue",
DROP COLUMN "oldValue",
ADD COLUMN     "new_value" TEXT,
ADD COLUMN     "old_value" TEXT;
