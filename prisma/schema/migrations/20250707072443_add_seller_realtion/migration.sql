/*
  Warnings:

  - Added the required column `sellerId` to the `Invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoices" ADD COLUMN     "sellerId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
