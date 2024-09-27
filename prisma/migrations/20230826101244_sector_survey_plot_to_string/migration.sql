/*
  Warnings:

  - You are about to drop the column `sector` on the `Property` table. All the data in the column will be lost.
  - Added the required column `survey` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "sector",
ADD COLUMN     "survey" TEXT NOT NULL,
ALTER COLUMN "plot_number" SET DATA TYPE TEXT,
ALTER COLUMN "old_plot_number" SET DATA TYPE TEXT;
