/*
  Warnings:

  - You are about to drop the column `sellerId` on the `Invoices` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `Invoices` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoices" DROP CONSTRAINT "Invoices_sellerId_fkey";

-- AlterTable
ALTER TABLE "Invoices" DROP COLUMN "sellerId",
DROP COLUMN "shopId";
