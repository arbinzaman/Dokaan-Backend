/*
  Warnings:

  - You are about to alter the column `shopId` on the `Invoices` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Added the required column `shopName` to the `Invoices` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Invoices" DROP CONSTRAINT "Invoices_shopId_fkey";

-- AlterTable
ALTER TABLE "Invoices" ADD COLUMN     "shopName" TEXT NOT NULL,
ALTER COLUMN "shopId" SET DATA TYPE INTEGER;
