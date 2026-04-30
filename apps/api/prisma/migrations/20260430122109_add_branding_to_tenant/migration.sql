-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT NOT NULL DEFAULT '#dc2626',
ADD COLUMN     "secondaryColor" TEXT NOT NULL DEFAULT '#f3f4f6';
