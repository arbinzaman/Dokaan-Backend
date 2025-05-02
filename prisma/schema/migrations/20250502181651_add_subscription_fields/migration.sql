-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionStatus" TEXT;
