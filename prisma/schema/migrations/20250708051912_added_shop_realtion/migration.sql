-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Dokaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
