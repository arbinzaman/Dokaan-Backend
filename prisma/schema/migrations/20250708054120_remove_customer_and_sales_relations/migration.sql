/*
  Warnings:

  - You are about to drop the `Invoices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Invoices" DROP CONSTRAINT "Invoices_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_invoiceId_fkey";

-- DropTable
DROP TABLE "Invoices";

-- CreateTable
CREATE TABLE "Invoice" (
    "id" BIGSERIAL NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
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
    "sellerName" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopId" BIGINT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
