-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAgency" TEXT,
ADD COLUMN     "shippingMethod" TEXT NOT NULL DEFAULT 'PICKUP',
ADD COLUMN     "shippingZone" TEXT;
