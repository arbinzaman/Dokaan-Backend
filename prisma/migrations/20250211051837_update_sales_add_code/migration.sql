/*
  Warnings:

  - You are about to drop the column `brandCode` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productCode` on the `Product` table. All the data in the column will be lost.
  - Added the required column `code` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "brandCode",
DROP COLUMN "productCode";

-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "code" TEXT NOT NULL;
