-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "customer_id" BIGINT,
ADD COLUMN     "invoiceId" BIGINT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "workDays" TEXT,
ADD COLUMN     "workEndTime" TIMESTAMP(3),
ADD COLUMN     "workHours" TEXT,
ADD COLUMN     "workLocation" TEXT,
ADD COLUMN     "workStartTime" TIMESTAMP(3),
ADD COLUMN     "workStatus" TEXT;

-- CreateTable
CREATE TABLE "Customers" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPurchase" (
    "id" BIGSERIAL NOT NULL,
    "customerId" BIGINT NOT NULL,
    "dokaanId" BIGINT NOT NULL,
    "productId" BIGINT NOT NULL,
    "purchaseCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "created_at" TEXT,
    "updated_at" TEXT,
    "user_id" BIGINT,
    "dokaanId" BIGINT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Income" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "date" TEXT NOT NULL,
    "created_at" TEXT,
    "updated_at" TEXT,
    "user_id" BIGINT,
    "dokaanId" BIGINT,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoices" (
    "id" BIGSERIAL NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "shopId" BIGINT NOT NULL,
    "customerId" BIGINT,
    "sellerName" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "Customers_phone_key" ON "Customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customers_email_key" ON "Customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPurchase_customerId_dokaanId_productId_key" ON "CustomerPurchase"("customerId", "dokaanId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoices_invoiceNumber_key" ON "Invoices"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "CustomerPurchase" ADD CONSTRAINT "CustomerPurchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPurchase" ADD CONSTRAINT "CustomerPurchase_dokaanId_fkey" FOREIGN KEY ("dokaanId") REFERENCES "Dokaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPurchase" ADD CONSTRAINT "CustomerPurchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_dokaanId_fkey" FOREIGN KEY ("dokaanId") REFERENCES "Dokaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_dokaanId_fkey" FOREIGN KEY ("dokaanId") REFERENCES "Dokaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Dokaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoices" ADD CONSTRAINT "Invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "Customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
