-- AlterTable
ALTER TABLE "Invoices" ADD COLUMN     "sellerId" BIGINT;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
