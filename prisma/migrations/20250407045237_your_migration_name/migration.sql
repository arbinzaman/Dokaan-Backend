/*
  Warnings:

  - You are about to drop the column `productId` on the `Sales` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `Sales` table. All the data in the column will be lost.
  - You are about to drop the column `shopId` on the `Sales` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Sales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salesPrice` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `Sales` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shop_id` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_productId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "Sales" DROP CONSTRAINT "Sales_shopId_fkey";

-- AlterTable
ALTER TABLE "Sales" DROP COLUMN "productId",
DROP COLUMN "sellerId",
DROP COLUMN "shopId",
ADD COLUMN     "batchNo" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "includeVAT" BOOLEAN,
ADD COLUMN     "itemCategory" TEXT,
ADD COLUMN     "itemUnit" TEXT,
ADD COLUMN     "mrp" DOUBLE PRECISION,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "product_id" BIGINT NOT NULL,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "salesPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "seller_id" BIGINT NOT NULL,
ADD COLUMN     "serialNoOrIMEI" TEXT,
ADD COLUMN     "shop_id" BIGINT NOT NULL,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "wholesalePrice" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Sales_code_key" ON "Sales"("code");

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sales" ADD CONSTRAINT "Sales_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Dokaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
