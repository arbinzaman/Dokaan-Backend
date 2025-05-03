-- CreateTable
CREATE TABLE "Dokaan" (
    "id" BIGSERIAL NOT NULL,
    "dokaan_name" TEXT NOT NULL,
    "dokaan_location" TEXT NOT NULL,
    "dokaan_imageUrl" TEXT,
    "dokaan_Tin_Certificate" INTEGER,
    "dokaan_email" TEXT NOT NULL,
    "dokaan_phone" TEXT,
    "dokaan_type" TEXT,
    "ownerId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dokaan_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Sales" (
    "id" BIGSERIAL NOT NULL,
    "branch" TEXT,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "batchNo" TEXT,
    "description" TEXT,
    "discount" DOUBLE PRECISION,
    "includeVAT" BOOLEAN,
    "itemCategory" TEXT,
    "itemUnit" TEXT,
    "mrp" DOUBLE PRECISION,
    "name" TEXT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "salesPrice" DOUBLE PRECISION NOT NULL,
    "seller_id" BIGINT NOT NULL,
    "serialNoOrIMEI" TEXT,
    "shop_id" BIGINT NOT NULL,
    "size" TEXT,
    "wholesalePrice" DOUBLE PRECISION,

    CONSTRAINT "Sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT,
    "profileImageUrl" TEXT,
    "dokaanId" BIGINT,
    "shopRole" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Dokaan" ADD CONSTRAINT "Dokaan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Dokaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Dokaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dokaanId_fkey" FOREIGN KEY ("dokaanId") REFERENCES "Dokaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
