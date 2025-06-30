-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "invoiceId" BIGINT;

-- CreateTable
CREATE TABLE "Invoices" (
    "id" BIGSERIAL NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "shopId" BIGINT NOT NULL,
    "customerId" BIGINT,
    "sellerId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION,
    "vatPercent" DOUBLE PRECISION,
    "notes" TEXT,
    "paymentStatus" TEXT,
    "paymentMethod" TEXT,
    "dueDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "paymentRef" TEXT,
    "paymentNotes" TEXT,

    CONSTRAINT "Invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoices_invoiceNumber_key" ON "Invoices"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Dokaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
