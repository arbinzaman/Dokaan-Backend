-- AlterTable
ALTER TABLE "User" ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "workDays" TEXT,
ADD COLUMN     "workEndTime" TIMESTAMP(3),
ADD COLUMN     "workHours" TEXT,
ADD COLUMN     "workLocation" TEXT,
ADD COLUMN     "workStartTime" TIMESTAMP(3),
ADD COLUMN     "workStatus" TEXT;
