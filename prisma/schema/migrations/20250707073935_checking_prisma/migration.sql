-- DropForeignKey
ALTER TABLE "Invoices" DROP CONSTRAINT "Invoices_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_seller_id_fkey";

-- AlterTable
ALTER TABLE "Invoices" ALTER COLUMN "sellerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Sales" ALTER COLUMN "seller_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
