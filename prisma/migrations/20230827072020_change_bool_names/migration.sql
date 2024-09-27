/*
  Warnings:

  - You are about to drop the column `electricity_connection` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `fenced` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `water_connection` on the `Property` table. All the data in the column will be lost.
  - Added the required column `has_electricity_connection` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `has_water_connection` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_fenced` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "electricity_connection",
DROP COLUMN "fenced",
DROP COLUMN "water_connection",
ADD COLUMN     "has_electricity_connection" BOOLEAN NOT NULL,
ADD COLUMN     "has_water_connection" BOOLEAN NOT NULL,
ADD COLUMN     "is_fenced" BOOLEAN NOT NULL;
