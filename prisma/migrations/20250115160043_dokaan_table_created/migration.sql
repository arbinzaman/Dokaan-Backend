/*
  Warnings:

  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dokaanId" BIGINT,
ADD COLUMN     "shopRole" TEXT,
ALTER COLUMN "role" SET NOT NULL;

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

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_dokaanId_fkey" FOREIGN KEY ("dokaanId") REFERENCES "Dokaan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokaan" ADD CONSTRAINT "Dokaan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
