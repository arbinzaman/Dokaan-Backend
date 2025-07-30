/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Invoices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Invoices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoices" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "shopId" BIGINT;
