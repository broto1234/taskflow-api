/*
  Warnings:

  - You are about to drop the column `providerEventId` on the `Payment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Payment_providerEventId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "providerEventId";

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" SERIAL NOT NULL,
    "provider" TEXT NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "providerPaymentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_providerEventId_key" ON "WebhookEvent"("providerEventId");
