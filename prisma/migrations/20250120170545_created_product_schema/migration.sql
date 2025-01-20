-- CreateTable
CREATE TABLE "Product" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "salesPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "initialStock" INTEGER DEFAULT 0,
    "imageUrl" TEXT,
    "discount" DOUBLE PRECISION,
    "includeVAT" BOOLEAN DEFAULT false,
    "stockMaintenanceEnabled" BOOLEAN DEFAULT false,
    "expiringProductAlert" BOOLEAN DEFAULT false,
    "maxDaysForExpAlert" INTEGER,
    "lowStockAlertEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxStockForAlert" INTEGER,
    "mfgDate" TIMESTAMP(3),
    "expDate" TIMESTAMP(3),
    "batchNo" TEXT,
    "serialNoOrIMEI" TEXT,
    "description" TEXT,
    "itemUnit" TEXT,
    "itemCategory" TEXT,
    "size" TEXT,
    "wholesalePrice" DOUBLE PRECISION,
    "mrp" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shopId" BIGINT NOT NULL,
    "ownerId" BIGINT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Dokaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
